# Code Standards and Conventions

**Audience: Library Developers and Contributors**

This document outlines the coding standards, conventions, and best practices for the BLG Grid library. Following these standards ensures consistent, maintainable, and high-quality code across the entire codebase.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [Angular Standards](#angular-standards)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Code Style](#code-style)
- [Documentation Standards](#documentation-standards)
- [Testing Standards](#testing-standards)
- [Performance Guidelines](#performance-guidelines)
- [Security Guidelines](#security-guidelines)
- [Accessibility Standards](#accessibility-standards)

## General Principles

### Core Values

1. **Consistency**: Follow established patterns throughout the codebase
2. **Readability**: Code should be self-documenting and easy to understand
3. **Maintainability**: Write code that's easy to modify and extend
4. **Performance**: Consider performance implications of all code
5. **Type Safety**: Leverage TypeScript's type system fully
6. **Testability**: Write code that's easy to test
7. **Accessibility**: Ensure all UI components are accessible

### Code Quality Metrics

- **Cyclomatic Complexity**: Keep functions under complexity of 10
- **Function Length**: Prefer functions under 50 lines
- **Class Size**: Limit classes to under 300 lines
- **Nesting Depth**: Avoid deep nesting (max 4 levels)

## TypeScript Standards

### Strict Configuration

```json
// tsconfig.json - Strict TypeScript configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Type Definitions

```typescript
// ✅ Good: Strong typing with generics
interface ColumnDefinition<T = any> {
  readonly id: string;
  readonly field: keyof T;
  readonly header: string;
  readonly width?: number;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly resizable?: boolean;
}

// ✅ Good: Discriminated unions for type safety
type CellValue = string | number | boolean | Date | null | undefined;

type SortDirection = 'asc' | 'desc';

interface SortDescriptor {
  readonly columnId: string;
  readonly direction: SortDirection;
  readonly priority: number;
}

// ❌ Avoid: Using 'any' type
interface BadColumnDefinition {
  id: any;  // Should be string
  field: any;  // Should be keyof T
  header: any;  // Should be string
}
```

### Interface Design

```typescript
// ✅ Good: Readonly properties where appropriate
interface GridConfig<T = any> {
  readonly columns: ColumnDefinition<T>[];
  readonly dataSource: BlgDataSource<T>;
  readonly features: GridFeatures;
}

// ✅ Good: Optional chaining and null safety
function processColumnValue<T>(
  row: T, 
  column: ColumnDefinition<T>
): CellValue {
  const value = row[column.field];
  return value ?? null;
}

// ✅ Good: Generic constraints
interface Sortable {
  readonly id: string;
}

function sortItems<T extends Sortable>(
  items: T[], 
  sortBy: keyof T
): T[] {
  return items.sort((a, b) => 
    String(a[sortBy]).localeCompare(String(b[sortBy]))
  );
}
```

### Error Handling

```typescript
// ✅ Good: Custom error types
export class GridConfigurationError extends Error {
  constructor(
    message: string,
    public readonly config: unknown
  ) {
    super(message);
    this.name = 'GridConfigurationError';
  }
}

// ✅ Good: Result pattern for operations that can fail
type Result<T, E = Error> = {
  readonly success: true;
  readonly data: T;
} | {
  readonly success: false;
  readonly error: E;
};

function validateGridConfig(config: unknown): Result<GridConfig> {
  try {
    // Validation logic
    return { success: true, data: validConfig };
  } catch (error) {
    return { 
      success: false, 
      error: new GridConfigurationError('Invalid config', config)
    };
  }
}
```

## Angular Standards

### Component Architecture

```typescript
// ✅ Good: Signal-based reactive component
@Component({
  selector: 'blg-grid',
  template: `
    <div class="blg-grid" [attr.role]="gridRole()">
      <blg-grid-header 
        [columns]="columns()"
        [sortState]="sortState()"
        (sortChange)="onSortChange($event)">
      </blg-grid-header>
      
      <blg-grid-body
        [data]="displayData()"
        [columns]="columns()"
        [loading]="loading()"
        (selectionChange)="onSelectionChange($event)">
      </blg-grid-body>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // Component-level providers
    GridStateService,
    { provide: GRID_CONFIG, useFactory: () => this.config() }
  ]
})
export class BlgGridComponent<T = any> implements OnInit, OnDestroy {
  // Input signals - immutable configuration
  config = input.required<GridConfig<T>>();
  
  // Computed signals - derived state
  columns = computed(() => this.config().columns);
  gridRole = computed(() => this.config().role ?? 'grid');
  
  // Internal state
  private readonly gridState = inject(GridStateService);
  private readonly destroyRef = inject(DestroyRef);
  
  // Derived reactive state
  displayData = computed(() => this.gridState.processedData());
  sortState = computed(() => this.gridState.sortDescriptors());
  loading = computed(() => this.gridState.loading());
  
  ngOnInit(): void {
    // Initialize component
    this.gridState.initialize(this.config());
    
    // Setup cleanup
    this.destroyRef.onDestroy(() => {
      this.gridState.cleanup();
    });
  }
  
  // Event handlers - prefer readonly and descriptive names
  protected readonly onSortChange = (sort: SortDescriptor[]): void => {
    this.gridState.updateSort(sort);
  };
  
  protected readonly onSelectionChange = (selection: Set<number>): void => {
    this.gridState.updateSelection(selection);
  };
}
```

### Service Design

```typescript
// ✅ Good: Injectable service with clear responsibilities
@Injectable({
  providedIn: 'root'
})
export class GridStateService {
  // Private state - use signals for reactivity
  private readonly _state = signal<GridState>({
    columns: [],
    data: [],
    selection: new Set(),
    sortDescriptors: [],
    filterDescriptors: []
  });
  
  // Public readonly access to state
  readonly state = this._state.asReadonly();
  
  // Computed derived state
  readonly processedData = computed(() => 
    this.applyProcessing(this._state().data, this._state())
  );
  
  // State mutation methods - clear and focused
  updateSort(sortDescriptors: SortDescriptor[]): void {
    this._state.update(current => ({
      ...current,
      sortDescriptors: [...sortDescriptors]
    }));
  }
  
  updateSelection(selection: Set<number>): void {
    this._state.update(current => ({
      ...current,
      selection: new Set(selection)
    }));
  }
  
  // Private helper methods
  private applyProcessing(
    data: any[], 
    state: GridState
  ): any[] {
    return data
      .filter(row => this.matchesFilters(row, state.filterDescriptors))
      .sort((a, b) => this.compareRows(a, b, state.sortDescriptors));
  }
}
```

### Dependency Injection

```typescript
// ✅ Good: Use injection tokens for configuration
export const GRID_CONFIG = new InjectionToken<GridConfig>('GRID_CONFIG');
export const GRID_FEATURES = new InjectionToken<GridFeatures>('GRID_FEATURES');

// ✅ Good: Constructor injection with access modifiers
@Component({})
export class BlgGridHeaderComponent {
  constructor(
    @Inject(GRID_CONFIG) private readonly config: GridConfig,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    private readonly cdr: ChangeDetectorRef
  ) {}
}

// ✅ Good: inject() function in modern Angular
@Component({})
export class ModernGridComponent {
  private readonly config = inject(GRID_CONFIG);
  private readonly gridState = inject(GridStateService);
  private readonly destroyRef = inject(DestroyRef);
}
```

## File Organization

### Directory Structure

```
libs/grid/src/lib/
├── components/          # UI components
│   ├── grid/           # Main grid component
│   ├── header/         # Header components
│   ├── body/           # Body components
│   └── footer/         # Footer components
├── services/           # Business logic services
│   ├── grid-state.service.ts
│   ├── data-processing.service.ts
│   └── export.service.ts
├── interfaces/         # Type definitions
│   ├── grid-config.interface.ts
│   ├── column-definition.interface.ts
│   └── data-source.interface.ts
├── utilities/          # Helper functions
│   ├── sort.utilities.ts
│   ├── filter.utilities.ts
│   └── validation.utilities.ts
├── constants/          # Application constants
│   └── grid.constants.ts
├── models/             # Data models and classes
│   └── grid-state.model.ts
└── testing/           # Test utilities
    ├── harnesses/     # Component test harnesses
    ├── mocks/         # Mock implementations
    └── factories/     # Test data factories
```

### File Naming Conventions

```typescript
// ✅ Good: Descriptive, kebab-case file names
grid-header.component.ts
grid-state.service.ts
column-definition.interface.ts
sort.utilities.ts
grid.constants.ts

// ❌ Avoid: Unclear or inconsistent naming
header.ts          // Too generic
gridService.ts     // Wrong casing
IColumnDef.ts      // Hungarian notation
```

### Export Organization

```typescript
// ✅ Good: Barrel exports with clear structure
// libs/core/src/index.ts
export * from './lib/services';
export * from './lib/interfaces';
export * from './lib/utilities';
export * from './lib/constants';

// Explicit re-exports for important items
export { GridStateService } from './lib/services/grid-state.service';
export { GridConfig } from './lib/interfaces/grid-config.interface';

// ✅ Good: Service barrel export
// libs/core/src/lib/services/index.ts
export { GridStateService } from './grid-state.service';
export { DataService } from './data.service';
export { ExportService } from './export.service';
```

## Naming Conventions

### General Rules

```typescript
// ✅ Good: PascalCase for classes, interfaces, types, enums
export class GridStateService { }
export interface ColumnDefinition { }
export type SortDirection = 'asc' | 'desc';
export enum GridDensity { Compact, Comfortable, Spacious }

// ✅ Good: camelCase for variables, functions, properties
const columnCount = 5;
const getCurrentSelection = () => new Set<number>();
const gridConfig = { showHeader: true };

// ✅ Good: UPPER_SNAKE_CASE for constants
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_COLUMN_WIDTH = 500;
export const GRID_ROLE = 'grid';

// ✅ Good: kebab-case for file names, CSS classes, selectors
grid-header.component.ts
.blg-grid-container
blg-grid-header
```

### Component Naming

```typescript
// ✅ Good: Descriptive component names with BLG prefix
@Component({
  selector: 'blg-grid',           // Main grid component
  // ...
})
export class BlgGridComponent { }

@Component({
  selector: 'blg-grid-header',    // Specific sub-component
  // ...
})
export class BlgGridHeaderComponent { }

@Component({
  selector: 'blg-column-resizer', // Feature-specific component
  // ...
})
export class BlgColumnResizerComponent { }
```

### Method Naming

```typescript
// ✅ Good: Verb-based method names that describe actions
class GridStateService {
  updateSort(descriptors: SortDescriptor[]): void { }
  clearFilters(): void { }
  toggleRowSelection(index: number): void { }
  resetToDefaultState(): void { }
  
  // ✅ Good: Boolean methods start with is/has/can/should
  isRowSelected(index: number): boolean { }
  hasActiveFilters(): boolean { }
  canEditCell(row: number, column: string): boolean { }
  shouldShowPagination(): boolean { }
  
  // ✅ Good: Getter methods use get prefix
  getSelectedRowData(): any[] { }
  getColumnDefinition(id: string): ColumnDefinition | null { }
  getFilteredData(): any[] { }
}
```

## Code Style

### Formatting (Prettier Configuration)

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "none",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### ESLint Rules

```json
// eslint.config.js (key rules)
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn", 
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn"
  }
}
```

### Code Examples

```typescript
// ✅ Good: Clean, readable code style
export class DataProcessingService {
  private readonly cache = new Map<string, any[]>();
  
  processData<T>(
    data: T[],
    options: ProcessingOptions
  ): ProcessedDataResult<T> {
    if (!data.length) {
      return { data: [], totalCount: 0 };
    }
    
    const cacheKey = this.generateCacheKey(options);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return { data: cached, totalCount: cached.length };
    }
    
    const processed = this.applyTransformations(data, options);
    this.cache.set(cacheKey, processed);
    
    return { data: processed, totalCount: processed.length };
  }
  
  private generateCacheKey(options: ProcessingOptions): string {
    return `${options.sort?.join(',')}|${options.filter?.toString()}`;
  }
  
  private applyTransformations<T>(
    data: T[], 
    options: ProcessingOptions
  ): T[] {
    let result = [...data];
    
    if (options.filter) {
      result = result.filter(options.filter);
    }
    
    if (options.sort?.length) {
      result = this.applySorting(result, options.sort);
    }
    
    return result;
  }
}
```

## Documentation Standards

### JSDoc Comments

```typescript
/**
 * Service for managing grid state and coordinating data processing operations.
 * 
 * This service maintains the central state for grid components and provides
 * reactive access to processed data through Angular signals.
 * 
 * @example
 * ```typescript
 * const gridState = inject(GridStateService);
 * 
 * // Update sort state
 * gridState.updateSort([{ columnId: 'name', direction: 'asc', priority: 0 }]);
 * 
 * // Access processed data reactively
 * effect(() => {
 *   console.log('Data updated:', gridState.processedData());
 * });
 * ```
 * 
 * @since 1.0.0
 */
@Injectable({ providedIn: 'root' })
export class GridStateService {
  
  /**
   * Updates the sort descriptors for the grid.
   * 
   * @param descriptors - Array of sort descriptors to apply
   * @param multiSort - Whether to allow multiple column sorting
   * 
   * @throws {GridConfigurationError} When sort descriptors are invalid
   * 
   * @example
   * ```typescript
   * // Single column sort
   * service.updateSort([{ columnId: 'name', direction: 'asc', priority: 0 }]);
   * 
   * // Multi-column sort
   * service.updateSort([
   *   { columnId: 'category', direction: 'asc', priority: 0 },
   *   { columnId: 'name', direction: 'desc', priority: 1 }
   * ], true);
   * ```
   */
  updateSort(
    descriptors: SortDescriptor[], 
    multiSort = false
  ): void {
    // Implementation
  }
}
```

### README Standards

```markdown
# @blg-grid/core

Core services, interfaces, and utilities for the BLG Grid library.

## Installation

```bash
npm install @blg-grid/core
```

## Quick Start

```typescript
import { GridStateService } from '@blg-grid/core';

// In your component
const gridState = inject(GridStateService);
```

## API Reference

### Services

- [`GridStateService`](./docs/grid-state-service.md) - Central state management
- [`DataService`](./docs/data-service.md) - Data processing operations
- [`ExportService`](./docs/export-service.md) - Data export functionality

### Interfaces

- [`GridConfig`](./docs/interfaces.md#gridconfig) - Grid configuration
- [`ColumnDefinition`](./docs/interfaces.md#columndefinition) - Column configuration
- [`SortDescriptor`](./docs/interfaces.md#sortdescriptor) - Sort configuration

## Examples

See the [examples directory](./examples/) for usage examples.

## Contributing

See [CONTRIBUTING.md](../../docs/contributing/CONTRIBUTING.md) for guidelines.
```

## Testing Standards

### Test Structure

```typescript
// ✅ Good: Well-structured test file
describe('GridStateService', () => {
  let service: GridStateService;
  let mockDataService: jest.Mocked<DataService>;

  beforeEach(() => {
    const mockDataServiceValue = {
      processData: jest.fn(),
      validateConfiguration: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        GridStateService,
        { provide: DataService, useValue: mockDataServiceValue }
      ]
    });

    service = TestBed.inject(GridStateService);
    mockDataService = TestBed.inject(DataService) as jest.Mocked<DataService>;
  });

  describe('State Management', () => {
    describe('updateSort', () => {
      it('should update sort descriptors correctly', () => {
        // Arrange
        const sortDescriptors: SortDescriptor[] = [
          { columnId: 'name', direction: 'asc', priority: 0 }
        ];

        // Act
        service.updateSort(sortDescriptors);

        // Assert
        expect(service.state.sortDescriptors).toEqual(sortDescriptors);
      });

      it('should handle invalid sort descriptors', () => {
        // Arrange
        const invalidDescriptors = [
          { columnId: '', direction: 'invalid', priority: -1 }
        ] as any;

        // Act & Assert
        expect(() => service.updateSort(invalidDescriptors))
          .toThrow(GridConfigurationError);
      });
    });
  });

  describe('Data Processing', () => {
    it('should process data with current state', () => {
      // Test implementation
    });
  });
});
```

## Performance Guidelines

### Memory Management

```typescript
// ✅ Good: Proper cleanup and memory management
@Component({
  // ...
})
export class BlgGridComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly subscriptions = new Set<Subscription>();
  
  ngOnInit(): void {
    // Setup subscriptions with cleanup
    const subscription = this.dataService.data$
      .subscribe(data => this.processData(data));
    
    this.subscriptions.add(subscription);
    this.destroyRef.onDestroy(() => {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
    });
  }
  
  // ✅ Good: Use WeakMap for caching with automatic cleanup
  private readonly cellCache = new WeakMap<object, RenderedCell>();
  
  getCachedCell(row: object): RenderedCell | undefined {
    return this.cellCache.get(row);
  }
}
```

### Performance Optimization

```typescript
// ✅ Good: Memoization for expensive operations
class DataProcessingService {
  private readonly sortCache = new Map<string, any[]>();
  
  @memoize()
  private sortData<T>(data: T[], descriptors: SortDescriptor[]): T[] {
    const cacheKey = this.getSortCacheKey(descriptors);
    
    if (this.sortCache.has(cacheKey)) {
      return this.sortCache.get(cacheKey)!;
    }
    
    const sorted = this.performSort(data, descriptors);
    this.sortCache.set(cacheKey, sorted);
    
    return sorted;
  }
  
  // ✅ Good: Efficient change detection
  trackByFunction = (index: number, item: any): any => 
    item.id ?? index;
}
```

## Security Guidelines

```typescript
// ✅ Good: Input validation and sanitization
class DataValidationService {
  validateGridConfig(config: unknown): GridConfig {
    if (!config || typeof config !== 'object') {
      throw new GridConfigurationError('Config must be an object');
    }
    
    const safeConfig = config as GridConfig;
    
    // Validate columns
    if (!Array.isArray(safeConfig.columns)) {
      throw new GridConfigurationError('Columns must be an array');
    }
    
    // Sanitize column definitions
    const sanitizedColumns = safeConfig.columns.map(col => ({
      id: this.sanitizeString(col.id),
      field: this.sanitizeString(col.field),
      header: this.sanitizeString(col.header),
      // ... other properties
    }));
    
    return {
      ...safeConfig,
      columns: sanitizedColumns
    };
  }
  
  private sanitizeString(input: unknown): string {
    if (typeof input !== 'string') {
      throw new Error('Expected string input');
    }
    
    // Remove potentially dangerous characters
    return input.replace(/[<>]/g, '').trim();
  }
}
```

## Accessibility Standards

```typescript
// ✅ Good: Accessible component implementation
@Component({
  selector: 'blg-grid',
  template: `
    <div 
      class="blg-grid"
      role="grid"
      [attr.aria-label]="gridAriaLabel()"
      [attr.aria-rowcount]="totalRowCount()"
      [attr.aria-colcount]="columns().length">
      
      <div 
        class="blg-grid-header"
        role="row"
        [attr.aria-rowindex]="1">
        
        <div 
          *ngFor="let column of columns(); index as i"
          class="blg-grid-header-cell"
          role="columnheader"
          [attr.aria-colindex]="i + 1"
          [attr.aria-sort]="getAriaSort(column.id)"
          [attr.tabindex]="0"
          (click)="onColumnHeaderClick(column.id)"
          (keydown)="onColumnHeaderKeydown($event, column.id)">
          
          {{ column.header }}
        </div>
      </div>
      
      <div class="blg-grid-body" [attr.aria-live]="loading() ? 'polite' : 'off'">
        <div 
          *ngFor="let row of displayData(); index as rowIndex"
          class="blg-grid-row"
          role="row"
          [attr.aria-rowindex]="rowIndex + 2"
          [attr.aria-selected]="isRowSelected(rowIndex)">
          
          <div 
            *ngFor="let column of columns(); index as colIndex"
            class="blg-grid-cell"
            role="gridcell"
            [attr.aria-colindex]="colIndex + 1"
            [attr.tabindex]="getCellTabIndex(rowIndex, colIndex)">
            
            {{ getCellValue(row, column) }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class BlgGridComponent {
  // Accessibility-focused computed properties
  gridAriaLabel = computed(() => 
    `Data grid with ${this.totalRowCount()} rows and ${this.columns().length} columns`
  );
  
  // Keyboard navigation support
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
        this.moveToNextCell();
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.moveToPreviousCell();
        event.preventDefault();
        break;
      // ... other navigation keys
    }
  }
}
```

Following these code standards ensures that the BLG Grid library maintains high quality, consistency, and reliability across all contributions. These standards are enforced through automated tooling (ESLint, Prettier) and code review processes.