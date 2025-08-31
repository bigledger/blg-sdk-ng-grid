# blg-sdk-ng-grid Architecture Specification

**Version:** 1.0  
**Date:** August 31, 2025  
**License:** MIT  

## Executive Summary

This document outlines the architecture and implementation plan for `blg-sdk-ng-grid`, an Angular-only, signals-first data grid library that provides enterprise-grade features through a clean-room design approach. The project targets Angular 21+ and focuses on high performance, accessibility, and developer ergonomics.

## Clean-Room Development Protocol

### Legal Requirements
- **No AG Grid Code Copying**: This implementation is based purely on public documentation, UX patterns, and behavioral observation
- **Original Implementation**: All code will be written from scratch using Angular best practices
- **MIT License**: Project will be fully open-source under MIT license
- **Documentation Trail**: All features traceable to public specifications and behavioral requirements

### Development Process
1. **Specification Phase**: Document required behaviors and API surface
2. **Implementation Phase**: Build components using only the specification
3. **Testing Phase**: Validate against behavioral requirements (not against AG Grid)
4. **Validation Phase**: Run similarity scans to ensure no code duplication

## Core Requirements

### Performance Targets
- **100,000+ rows**: Smooth scrolling at 60fps on mid-range hardware
- **Real-time updates**: Handle thousands of cell updates per second
- **Memory efficiency**: Constant memory usage regardless of dataset size
- **Initial render**: < 100ms for grids with < 1000 visible cells

### Browser Support
- **Modern browsers**: Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- **Mobile**: iOS Safari, Chrome Mobile (with touch optimizations)
- **Accessibility**: WCAG 2.1 AA compliance

## Technology Stack

### Core Technologies
- **Angular 21+** (compatible with 19/20)
- **TypeScript 5.5+**
- **Angular CDK** for foundational UI patterns
- **RxJS 7+** for reactive programming
- **Angular Signals** for state management

### Development Tools
- **Nx** for monorepo management
- **Jest** for unit testing
- **Playwright** for e2e testing
- **Storybook** for component development
- **ESLint + Prettier** for code quality

## Architecture Overview

### Package Structure

```
packages/
├── blg-sdk-ng-grid-core/        # Pure TypeScript algorithms and types
├── blg-sdk-ng-grid/             # Angular components and services
├── blg-sdk-ng-grid-plugins/     # Optional features (grouping, pivot, etc.)
├── blg-sdk-ng-grid-theme/       # CSS variables and themes
└── blg-sdk-ng-grid-utils/       # Utilities (export, clipboard, etc.)

apps/
├── demo/                        # Demo application
├── playground/                  # Performance testing
└── e2e/                        # End-to-end tests

libs/
└── testing/                    # Shared testing utilities
```

### Core Components Hierarchy

```
BlgGridComponent (Shell)
├── BlgGridHeaderComponent
│   ├── BlgColumnHeaderComponent
│   └── BlgFilterRowComponent
├── BlgGridViewportComponent
│   ├── BlgVirtualRowsDirective (CDK Virtual Scroll)
│   ├── BlgVirtualColumnsDirective (Custom)
│   ├── BlgRowComponent
│   └── BlgCellComponent
├── BlgGridFooterComponent
└── BlgGridSelectionOverlayComponent
```

## Data Flow Architecture

### State Management (Signals-Based)

```typescript
@Injectable({ providedIn: 'root' })
export class GridStore<T> {
  // Primary state signals
  readonly rawData = signal<T[]>([]);
  readonly columns = signal<ColumnDef<T>[]>([]);
  readonly sortState = signal<SortState[]>([]);
  readonly filterState = signal<FilterState>({});
  readonly selectionState = signal<SelectionState>({ rows: new Set(), ranges: [] });
  readonly viewport = signal<Viewport>({ rowStart: 0, rowEnd: 50, colStart: 0, colEnd: 10 });
  
  // Computed derived state
  readonly filteredData = computed(() => 
    applyFilters(this.rawData(), this.filterState())
  );
  readonly sortedData = computed(() => 
    applySort(this.filteredData(), this.sortState())
  );
  readonly visibleRows = computed(() => {
    const vp = this.viewport();
    return this.sortedData().slice(vp.rowStart, vp.rowEnd);
  });
  readonly visibleColumns = computed(() => 
    getVisibleColumns(this.columns(), this.viewport())
  );
}
```

### Data Source Architecture

```typescript
// Client-side data source (default)
export interface ClientDataSource<T> {
  readonly data: Signal<T[]>;
  connect(): Observable<T[]>;
  disconnect(): void;
}

// Server-side data source
export interface ServerDataSource<T> {
  connect(request: DataRequest): Observable<DataResponse<T>>;
  disconnect(): void;
}

export interface DataRequest {
  viewport: Viewport;
  sort: SortState[];
  filters: FilterState;
  groupBy?: string[];
}

export interface DataResponse<T> {
  rows: T[];
  totalRows: number;
  groupInfo?: GroupInfo;
}
```

## Core Components Design

### 1. Grid Shell Component

**Responsibilities:**
- Coordinate between all child components
- Manage overall grid state
- Handle keyboard navigation
- Provide public API surface

```typescript
@Component({
  selector: 'blg-grid',
  standalone: true,
  template: `
    <div class="blg-grid" 
         [attr.role]="'grid'"
         [attr.aria-label]="ariaLabel()"
         (keydown)="handleKeydown($event)">
      
      <blg-grid-header 
        [columns]="visibleColumns()"
        [sortState]="sortState()"
        (sortChange)="onSortChange($event)"
        (filterChange)="onFilterChange($event)">
      </blg-grid-header>

      <blg-grid-viewport
        [rows]="visibleRows()"
        [columns]="visibleColumns()"
        [rowHeight]="rowHeight()"
        [viewport]="viewport()"
        (viewportChange)="onViewportChange($event)">
      </blg-grid-viewport>

      <blg-grid-selection-overlay
        [selectionState]="selectionState()">
      </blg-grid-selection-overlay>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlgGridComponent<T> {
  // Input signals
  readonly data = input.required<T[] | DataSource<T>>();
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly rowHeight = input(40);
  readonly selectionMode = input<SelectionMode>('row');
  
  // Output events
  readonly rowClick = output<RowClickEvent<T>>();
  readonly selectionChange = output<SelectionState>();
  readonly sortChange = output<SortState[]>();
}
```

### 2. Virtualization Strategy

#### Row Virtualization
- Uses Angular CDK's `CdkVirtualScrollViewport`
- Implements row recycling for performance
- Supports variable row heights
- Handles pinned rows (top/bottom)

#### Column Virtualization
- Custom implementation optimized for horizontal scrolling
- Supports pinned columns (left/right)
- Dynamic column width calculation
- Efficient DOM updates

```typescript
@Directive({
  selector: '[blgVirtualColumns]'
})
export class BlgVirtualColumnsDirective<T> implements AfterViewInit, OnDestroy {
  private readonly columnMetrics = computed(() => {
    const cols = this.columns();
    const widths = cols.map(col => col.width || 150);
    return { widths, totalWidth: widths.reduce((a, b) => a + b, 0) };
  });

  private readonly visibleColumnIndices = computed(() => {
    const viewport = this.viewport();
    const metrics = this.columnMetrics();
    return calculateVisibleColumns(viewport.colStart, viewport.colEnd, metrics.widths);
  });
}
```

### 3. Cell Rendering System

```typescript
export interface CellRenderer<T> {
  render(context: CellRenderContext<T>): TemplateRef<any> | string | number;
}

export interface CellRenderContext<T> {
  row: T;
  column: ColumnDef<T>;
  value: unknown;
  rowIndex: number;
  columnIndex: number;
  isSelected: boolean;
  isEditing: boolean;
}

@Component({
  selector: 'blg-cell',
  template: `
    <div class="blg-cell-content"
         [attr.role]="'gridcell'"
         [attr.aria-selected]="isSelected()"
         [class.selected]="isSelected()"
         [class.editing]="isEditing()"
         (click)="handleClick()"
         (dblclick)="handleDoubleClick()">
      
      <ng-container *ngIf="!isEditing(); else editTemplate">
        <ng-container *ngIf="column().cellTemplate; else defaultTemplate"
                      [ngTemplateOutlet]="column().cellTemplate"
                      [ngTemplateOutletContext]="cellContext()">
        </ng-container>
        <ng-template #defaultTemplate>
          {{ displayValue() }}
        </ng-template>
      </ng-container>

      <ng-template #editTemplate>
        <ng-container *ngComponentOutlet="editorComponent(); 
                                         inputs: editorInputs()">
        </ng-container>
      </ng-template>
    </div>
  `
})
export class BlgCellComponent<T> {
  readonly row = input.required<T>();
  readonly column = input.required<ColumnDef<T>>();
  readonly rowIndex = input.required<number>();
  readonly columnIndex = input.required<number>();
  
  readonly isSelected = computed(() => /* selection logic */);
  readonly isEditing = computed(() => /* edit state logic */);
  readonly displayValue = computed(() => this.column().valueFormatter?.(this.cellContext()) || this.value());
}
```

## Feature Implementation Plan

### Phase 1: Core Grid (MVP) - 4 weeks

#### Week 1: Foundation
- [ ] Basic grid shell component
- [ ] Column definition system
- [ ] Simple cell rendering
- [ ] Basic row virtualization with CDK

#### Week 2: Enhanced Rendering
- [ ] Column virtualization
- [ ] Pinned columns (left/right)
- [ ] Header component with sorting
- [ ] Basic filtering (text, number)

#### Week 3: Selection & Interaction
- [ ] Row selection (single/multiple)
- [ ] Range selection
- [ ] Keyboard navigation
- [ ] Cell editing framework

#### Week 4: Performance & Polish
- [ ] Performance optimizations
- [ ] Basic theming
- [ ] Accessibility improvements
- [ ] Unit tests

### Phase 2: Advanced Features - 6 weeks

#### Data Operations (2 weeks)
- [ ] Advanced sorting (multi-column)
- [ ] Complex filtering system
- [ ] Server-side data source
- [ ] Data caching strategy

#### Editing & Validation (2 weeks)
- [ ] Built-in editors (text, number, date, select)
- [ ] Custom editor framework
- [ ] Validation system
- [ ] Undo/redo functionality

#### Advanced UI (2 weeks)
- [ ] Column resizing
- [ ] Column reordering
- [ ] Row grouping
- [ ] Aggregation functions

### Phase 3: Enterprise Features - 8 weeks

#### Analytics (3 weeks)
- [ ] Pivot tables
- [ ] Custom aggregators
- [ ] Group filtering
- [ ] Tree data support

#### Export & Integration (2 weeks)
- [ ] CSV export
- [ ] Excel export
- [ ] Print layouts
- [ ] Copy/paste functionality

#### Advanced UI (3 weeks)
- [ ] Master/detail rows
- [ ] Context menus
- [ ] Drag & drop
- [ ] Advanced theming

## Key Interfaces and Types

### Column Definition

```typescript
export interface ColumnDef<T> {
  // Identification
  id: string;
  field?: keyof T;
  
  // Display
  header: string | TemplateRef<HeaderContext>;
  cellTemplate?: TemplateRef<CellRenderContext<T>>;
  headerTemplate?: TemplateRef<HeaderContext>;
  
  // Behavior
  sortable?: boolean | CompareFn<T>;
  filterable?: boolean | FilterConfig<T>;
  editable?: boolean | EditConfig<T>;
  resizable?: boolean;
  moveable?: boolean;
  
  // Sizing
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  
  // Position
  pinned?: 'left' | 'right';
  
  // Data
  valueGetter?: (row: T) => unknown;
  valueFormatter?: (context: CellRenderContext<T>) => string;
  valueSetter?: (row: T, value: unknown) => void;
  
  // Styling
  cellClass?: string | ((context: CellRenderContext<T>) => string);
  headerClass?: string;
  
  // Accessibility
  ariaLabel?: string;
}
```

### Grid State

```typescript
export interface GridState<T> {
  // Data
  rawData: T[];
  filteredData: T[];
  sortedData: T[];
  
  // View state
  columns: ColumnDef<T>[];
  viewport: Viewport;
  scrollPosition: { x: number; y: number };
  
  // User interactions
  sortState: SortState[];
  filterState: FilterState;
  selectionState: SelectionState;
  editingCell: CellPosition | null;
  
  // UI state
  columnWidths: Map<string, number>;
  columnOrder: string[];
  hiddenColumns: Set<string>;
}
```

## Performance Optimization Strategies

### Memory Management
1. **Object Pooling**: Reuse DOM elements and component instances
2. **Lazy Loading**: Load data and components on demand
3. **Garbage Collection**: Minimize object allocation in hot paths
4. **Weak References**: Use WeakMap/WeakSet for temporary associations

### Rendering Optimization
1. **OnPush Strategy**: All components use OnPush change detection
2. **Signal Optimization**: Minimize computed signal recalculation
3. **Template Caching**: Cache compiled templates
4. **DOM Recycling**: Reuse DOM nodes during scrolling

### Data Processing
1. **Web Workers**: Move heavy computations off main thread
2. **Batch Updates**: Group multiple changes into single update cycle
3. **Incremental Processing**: Process large datasets in chunks
4. **Memoization**: Cache expensive calculations

### Network Optimization
1. **Request Debouncing**: Batch server requests
2. **Data Streaming**: Stream large datasets
3. **Progressive Loading**: Load data as needed
4. **Caching Strategy**: Implement multi-level caching

## Testing Strategy

### Unit Testing (Jest)
- **Algorithm Testing**: Sort, filter, aggregation functions
- **Component Logic**: Component behavior without DOM
- **Service Testing**: Data sources and state management
- **Utility Testing**: Helper functions and pipes

### Integration Testing (Angular Testing Library)
- **Component Integration**: Component interaction testing  
- **Service Integration**: Service and component collaboration
- **Data Flow**: End-to-end data processing
- **User Interaction**: Click, keyboard, selection behaviors

### End-to-End Testing (Playwright)
- **Core Workflows**: Sort, filter, edit, select
- **Performance Testing**: Large dataset handling
- **Accessibility Testing**: Screen reader and keyboard navigation
- **Cross-browser Testing**: Major browser compatibility

### Performance Testing
- **Load Testing**: Various dataset sizes
- **Memory Profiling**: Memory usage patterns
- **Render Performance**: Frame rate monitoring
- **Bundle Analysis**: Code splitting effectiveness

## Accessibility Implementation

### ARIA Support
- **Grid Roles**: Proper ARIA grid, row, columnheader, gridcell roles
- **Labels**: Comprehensive aria-label and aria-labelledby
- **Live Regions**: Screen reader announcements for changes
- **States**: aria-selected, aria-expanded, aria-sort

### Keyboard Navigation
- **Arrow Keys**: Cell-to-cell navigation
- **Tab Navigation**: Focus management
- **Home/End**: Row/column navigation
- **Page Up/Down**: Viewport navigation
- **Enter/Space**: Activation and selection
- **Escape**: Cancel operations

### Screen Reader Support
- **Context Announcements**: Row/column position
- **Change Notifications**: Sort, filter, edit operations
- **Table Summary**: Grid dimensions and content
- **Help Text**: Available actions and shortcuts

## Security Considerations

### Input Validation
- **XSS Prevention**: Sanitize user input and templates
- **Type Safety**: TypeScript strict mode enforcement
- **Data Validation**: Runtime type checking for external data

### Content Security
- **Template Security**: Secure template compilation
- **Dynamic Content**: Safe dynamic content rendering
- **Export Security**: Secure file generation

## Migration and Upgrade Strategy

### API Stability
- **Semantic Versioning**: Clear versioning policy
- **Breaking Changes**: Migration guides for major versions
- **Deprecation Policy**: 6-month deprecation cycle

### Framework Updates
- **Angular Compatibility**: Support N and N-1 Angular versions
- **CDK Updates**: Stay current with Angular CDK
- **TypeScript Updates**: Support latest TypeScript features

## Conclusion

This architecture provides a solid foundation for building a high-performance, accessible, and maintainable Angular data grid. The clean-room approach ensures legal compliance while the signals-first design leverages Angular's latest capabilities for optimal performance and developer experience.

The phased implementation plan allows for iterative development and early user feedback, while the comprehensive testing strategy ensures reliability and quality throughout the development process.