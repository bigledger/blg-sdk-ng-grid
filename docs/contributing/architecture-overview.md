# Architecture Overview

**Audience: Library Developers and Contributors**

This document provides a comprehensive overview of the BLG Grid library architecture. Understanding this architecture is crucial for contributors who want to add features, fix bugs, or optimize performance effectively.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Library Structure](#library-structure)
- [Core Concepts](#core-concepts)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [Service Architecture](#service-architecture)
- [State Management](#state-management)
- [Performance Architecture](#performance-architecture)
- [Extension Points](#extension-points)

## High-Level Architecture

BLG Grid is built as a modular Angular library using Nx workspace architecture. The design follows these key principles:

### Design Principles

1. **Modularity**: Functionality is split into focused, reusable libraries
2. **Reactive**: Built on Angular Signals and RxJS for reactive data flow  
3. **Performance**: Optimized for large datasets with virtual scrolling
4. **Extensibility**: Plugin architecture allows custom functionality
5. **Type Safety**: Comprehensive TypeScript interfaces and generics
6. **Accessibility**: WCAG compliance built-in
7. **Testing**: High test coverage with multiple testing strategies

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│                 Application Layer               │
│              (Consumer's App)                   │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                 Grid Library                    │
│     ┌─────────────────────────────────────────┐ │
│     │           Grid Component                │ │
│     │         (Main Entry Point)             │ │
│     └─────────────────────────────────────────┘ │
│              │           │           │         │
│     ┌────────┴──┐   ┌────┴────┐   ┌──┴────┐   │
│     │ Column    │   │  Row    │   │ Cell  │   │
│     │ Library   │   │ Library │   │Library│   │
│     └───────────┘   └─────────┘   └───────┘   │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                 Core Library                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │Services  │ │Interfaces│ │     Utilities    │ │
│  │& State   │ │& Types   │ │   & Helpers      │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│              Foundation Layer                   │
│    ┌────────────┐  ┌─────────────┐ ┌─────────┐ │
│    │    Data    │  │    Theme    │ │ Angular │ │
│    │  Services  │  │   System    │ │   CDK   │ │
│    └────────────┘  └─────────────┘ └─────────┘ │
└─────────────────────────────────────────────────┘
```

## Library Structure

### Nx Workspace Organization

```
libs/
├── core/              # Foundation services and interfaces
│   ├── services/      # Core business logic services
│   ├── interfaces/    # TypeScript interfaces and types
│   ├── utilities/     # Helper functions and utilities
│   └── models/        # Data models and classes
├── grid/              # Main grid component library
│   ├── components/    # Grid-specific components  
│   ├── services/      # Grid orchestration services
│   ├── directives/    # Grid-specific directives
│   └── pipes/         # Grid-specific pipes
├── column/            # Column management
│   ├── components/    # Column header, resizer, etc.
│   ├── services/      # Column operations
│   └── interfaces/    # Column-specific types
├── row/               # Row components and logic
│   ├── components/    # Row templates, selection, etc.
│   ├── services/      # Row operations
│   └── interfaces/    # Row-specific types  
├── cell/              # Cell rendering and editing
│   ├── components/    # Cell templates, editors
│   ├── services/      # Cell operations
│   └── interfaces/    # Cell-specific types
├── data/              # Data processing and management
│   ├── services/      # Data operations, filtering, sorting
│   ├── models/        # Data models
│   └── interfaces/    # Data-specific types
└── theme/             # Theming and styling
    ├── services/      # Theme management
    ├── utilities/     # Styling utilities
    └── themes/        # Pre-built themes
```

## Core Concepts

### Component Hierarchy

```
BlgGrid (Main Container)
├── BlgGridHeader
│   ├── BlgColumnHeader (for each column)
│   │   ├── BlgColumnResizer
│   │   ├── BlgSortIndicator  
│   │   └── BlgFilterTrigger
│   └── BlgColumnMenu
├── BlgGridBody
│   ├── BlgVirtualScroll
│   │   └── BlgRow (virtual items)
│   │       └── BlgCell (for each column)
│   │           ├── BlgCellRenderer
│   │           └── BlgCellEditor
│   └── BlgLoadingOverlay
├── BlgGridFooter
│   ├── BlgPagination
│   └── BlgGridSummary
└── BlgGridToolbar (optional)
```

### Key Abstractions

#### Grid Configuration
```typescript
interface GridConfig<T = any> {
  // Data source configuration
  dataSource: BlgDataSource<T>;
  
  // Column definitions
  columns: ColumnDefinition<T>[];
  
  // Feature toggles
  features: {
    sorting: boolean | SortingConfig;
    filtering: boolean | FilteringConfig;  
    pagination: boolean | PaginationConfig;
    selection: boolean | SelectionConfig;
    grouping: boolean | GroupingConfig;
    virtualScroll: boolean | VirtualScrollConfig;
  };
  
  // UI configuration
  ui: {
    showHeader: boolean;
    showFooter: boolean;
    density: 'compact' | 'comfortable' | 'spacious';
    theme: string;
  };
}
```

#### Data Source Abstraction
```typescript
abstract class BlgDataSource<T = any> {
  abstract connect(): Observable<T[]>;
  abstract disconnect(): void;
  
  // Optional methods for server-side operations
  sort?(sort: SortDescriptor[]): Observable<T[]>;
  filter?(filters: FilterDescriptor[]): Observable<T[]>;
  paginate?(pagination: PaginationDescriptor): Observable<T[]>;
}
```

## Data Flow

### Reactive Data Pipeline

```
Data Source → State Management → Processing → Rendering
     │              │               │           │
     ▼              ▼               ▼           ▼
[Raw Data] → [Grid State] → [Processed Data] → [Virtual DOM]
     │              │               │           │
     │              ├─ Sorting      │           │
     │              ├─ Filtering    │           │
     │              ├─ Grouping     │           │
     │              └─ Pagination   │           │
     │                              │           │
     └─── Async Updates ────────────┘           │
                                                │
                    Performance Optimizations ─┘
                    ├─ Virtual Scrolling
                    ├─ Change Detection Strategy
                    └─ Memo/Caching
```

### Signal-Based Reactivity

The library leverages Angular Signals for fine-grained reactivity:

```typescript
@Injectable()
export class GridStateService {
  // Core state signals
  private _data = signal<any[]>([]);
  private _columns = signal<ColumnDefinition[]>([]);
  private _sortState = signal<SortDescriptor[]>([]);
  private _filterState = signal<FilterDescriptor[]>([]);
  
  // Computed derived state
  readonly sortedData = computed(() => 
    this.applySorting(this._data(), this._sortState())
  );
  
  readonly filteredData = computed(() =>
    this.applyFiltering(this.sortedData(), this._filterState())  
  );
  
  readonly displayData = computed(() =>
    this.applyPagination(this.filteredData(), this._paginationState())
  );
}
```

## Component Architecture

### Grid Component (Main Entry Point)

```typescript
@Component({
  selector: 'blg-grid',
  template: `
    <div class="blg-grid-container" [class]="containerClasses()">
      <blg-grid-header 
        *ngIf="config().showHeader"
        [columns]="columns()"
        [sortState]="sortState()"
        (sortChange)="onSortChange($event)">
      </blg-grid-header>
      
      <blg-grid-body 
        [data]="displayData()"
        [columns]="columns()"
        [virtualScroll]="config().virtualScroll"
        (selectionChange)="onSelectionChange($event)">
      </blg-grid-body>
      
      <blg-grid-footer 
        *ngIf="config().showFooter"
        [pagination]="paginationState()"
        (pageChange)="onPageChange($event)">
      </blg-grid-footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlgGridComponent<T = any> implements OnInit, OnDestroy {
  // Input signals
  config = input.required<GridConfig<T>>();
  
  // Computed signals  
  columns = computed(() => this.config().columns);
  displayData = computed(() => this.gridState.displayData());
  
  // Dependency injection
  constructor(
    private gridState: GridStateService,
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef
  ) {}
}
```

### Virtual Scrolling Architecture

```typescript
@Component({
  selector: 'blg-virtual-scroll',
  template: `
    <cdk-virtual-scroll-viewport 
      class="blg-virtual-viewport"
      [itemSize]="itemHeight()"
      [minBufferPx]="bufferSize()" 
      [maxBufferPx]="bufferSize() * 2">
      
      <blg-row 
        *cdkVirtualFor="let item of data(); 
                        index as i; 
                        trackBy: trackByFn"
        [data]="item"
        [columns]="columns()"
        [index]="i"
        [selected]="isSelected(i)"
        (selectionChange)="toggleSelection(i)">
      </blg-row>
    </cdk-virtual-scroll-viewport>
  `
})
export class BlgVirtualScrollComponent {
  // Performance optimizations
  trackByFn = (index: number, item: any) => 
    item[this.config().trackByField] ?? index;
    
  // Dynamic item sizing
  itemHeight = computed(() => {
    const density = this.config().density;
    return density === 'compact' ? 32 : 
           density === 'comfortable' ? 40 : 48;
  });
}
```

## Service Architecture

### Core Services

#### GridStateService
Centralized state management using Angular Signals:
- Manages grid configuration, data, and UI state
- Provides reactive computed values
- Handles state updates and synchronization

#### DataService  
Data processing and transformation:
- Sorting algorithms and optimizations
- Filtering logic and predicate building
- Grouping and aggregation operations
- Pagination calculations

#### ExportService
Data export functionality:
- Multiple format support (CSV, Excel, PDF)
- Configurable export options
- Progress tracking for large exports

### Service Dependencies

```
GridComponent
    ├── GridStateService (state management)
    ├── DataService (data processing)  
    ├── ExportService (export functionality)
    └── ThemeService (styling)
        │
        ├── ColumnService (column operations)
        ├── RowService (row operations)
        ├── CellService (cell operations)
        └── EventService (event coordination)
```

## State Management

### Signal-Based Architecture

```typescript
// Global grid state
interface GridState<T = any> {
  // Data state
  originalData: T[];
  processedData: T[];
  
  // UI state  
  selectedRows: Set<number>;
  expandedGroups: Set<string>;
  scrollPosition: { x: number; y: number };
  
  // Feature state
  sortDescriptors: SortDescriptor[];
  filterDescriptors: FilterDescriptor[];
  groupDescriptors: GroupDescriptor[];
  paginationState: PaginationState;
  
  // Configuration
  columns: ColumnDefinition<T>[];
  gridConfig: GridConfig<T>;
}
```

### State Updates and Reactivity

```typescript
// State updates trigger reactive pipeline
updateSort(columnId: string, direction: SortDirection) {
  this._sortState.update(current => [
    ...current.filter(s => s.columnId !== columnId),
    { columnId, direction, priority: current.length }
  ]);
  // Computed signals automatically update:
  // sortedData → filteredData → paginatedData → UI
}
```

## Performance Architecture

### Virtual Scrolling

```typescript
interface VirtualScrollStrategy {
  // Core virtual scrolling parameters
  itemSize: number | ((index: number) => number);
  bufferSize: number;
  scrollStrategy: 'fixed' | 'auto';
  
  // Performance optimizations
  trackBy: TrackByFunction;
  recycleNodes: boolean;
  renderAhead: number;
}
```

### Change Detection Optimization

```typescript
// OnPush strategy throughout the component tree
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})

// Signals-based reactivity minimizes change detection cycles
// Custom track-by functions prevent unnecessary re-renders
// Memoization of expensive operations
```

### Memory Management

- Object pooling for frequently created/destroyed objects
- Lazy loading of non-visible data
- Automatic cleanup of subscriptions and event listeners
- Strategic use of WeakMap and WeakSet for caching

## Extension Points

### Custom Cell Renderers

```typescript
interface CellRenderer<T = any> {
  render(value: any, row: T, column: ColumnDefinition<T>): TemplateRef | string;
}

// Registration system
@Injectable()
export class CellRendererRegistry {
  register<T>(type: string, renderer: CellRenderer<T>): void;
  get<T>(type: string): CellRenderer<T> | null;
}
```

### Plugin Architecture

```typescript
interface GridPlugin {
  name: string;
  version: string;
  
  initialize(grid: BlgGridComponent): void;
  destroy(): void;
  
  // Hook into grid lifecycle
  onGridInit?(): void;
  onDataChange?(): void;
  onConfigChange?(): void;
}

// Plugin registration
export const GRID_PLUGINS = new InjectionToken<GridPlugin[]>('GRID_PLUGINS');
```

### Custom Data Sources

```typescript
// Extend base data source for custom implementations
export class CustomDataSource extends BlgDataSource<MyData> {
  constructor(private apiService: MyApiService) {
    super();
  }
  
  connect(): Observable<MyData[]> {
    return this.apiService.getData();
  }
  
  // Override for server-side operations
  sort(sort: SortDescriptor[]): Observable<MyData[]> {
    return this.apiService.getSortedData(sort);
  }
}
```

## Testing Architecture

### Testing Strategy Layers

1. **Unit Tests**: Individual components and services
2. **Integration Tests**: Component interactions
3. **E2E Tests**: Full user workflows  
4. **Performance Tests**: Load and stress testing
5. **Visual Tests**: UI regression testing

### Mock Architecture

```typescript
// Service mocks for testing
export class MockGridStateService implements Partial<GridStateService> {
  private mockState = signal(createMockGridState());
  
  get state() { return this.mockState(); }
  updateSort = jest.fn();
  updateFilter = jest.fn();
}

// Test data factories
export const createMockGridConfig = (overrides?: Partial<GridConfig>) => ({
  columns: createMockColumns(),
  dataSource: new MockDataSource(),
  features: { sorting: true, filtering: true },
  ...overrides
});
```

## Next Steps

To dive deeper into specific areas:

- [Testing Guide](./testing-guide.md) - Testing strategies and examples
- [Build System](./build-system.md) - Nx workspace and build pipeline
- [Performance Internals](../maintainers/performance-internals.md) - Performance optimization details
- [Signal Architecture](../maintainers/signal-architecture.md) - Angular Signals implementation

Understanding this architecture will help you contribute effectively to the BLG Grid library. Each component and service is designed to be modular, testable, and performant while maintaining clean separation of concerns.