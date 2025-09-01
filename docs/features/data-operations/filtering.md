# Filtering

BlgGrid provides comprehensive filtering capabilities that allow users to quickly find and focus on relevant data. From simple text filters to complex multi-condition filters, BlgGrid supports all common filtering scenarios with excellent performance.

## Overview

BlgGrid filtering features include:
- **Built-in filter types**: Text, number, date, boolean, and select filters
- **Custom filters**: Create your own filter components and logic
- **Multi-condition filtering**: Combine multiple conditions with AND/OR logic
- **Quick filters**: Instant search across all columns
- **Server-side filtering**: Handle filtering on the server for large datasets
- **Filter persistence**: Save and restore filter states

## Basic Filtering

### Enable Column Filters

Enable filtering globally or per-column:

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-filterable-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <ng-ui-lib
      [data]="data"
      [columns]="columns"
      [config]="config"
      (filterChanged)="onFilterChanged($event)">
    </ng-ui-lib>
  `
})
export class FilterableGridComponent {
  data = [
    { id: 1, name: 'John Doe', age: 30, department: 'Engineering', salary: 75000, active: true },
    { id: 2, name: 'Jane Smith', age: 28, department: 'Marketing', salary: 65000, active: true },
    { id: 3, name: 'Bob Johnson', age: 35, department: 'Engineering', salary: 85000, active: false },
    { id: 4, name: 'Alice Brown', age: 32, department: 'Sales', salary: 70000, active: true }
  ];

  columns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Name',
      filterable: true,           // Enable filtering
      filterType: 'text'          // Text filter
    },
    {
      id: 'age',
      field: 'age',
      header: 'Age',
      type: 'number',
      filterable: true,
      filterType: 'number'        // Number range filter
    },
    {
      id: 'department',
      field: 'department',
      header: 'Department',
      filterable: true,
      filterType: 'select',       // Dropdown filter
      filterOptions: ['Engineering', 'Marketing', 'Sales']
    },
    {
      id: 'salary',
      field: 'salary',
      header: 'Salary',
      type: 'number',
      filterable: true,
      filterType: 'number'
    },
    {
      id: 'active',
      field: 'active',
      header: 'Active',
      type: 'boolean',
      filterable: true,
      filterType: 'boolean'       // Boolean filter
    }
  ];

  config: GridConfig = {
    filterable: true,             // Enable filtering globally
    showFilterRow: true,          // Show filter row below headers
    filterDelay: 300              // Debounce filter input
  };

  onFilterChanged(event: any) {
    console.log('Filter changed:', event);
  }
}
```

## Built-in Filter Types

### Text Filters

Text filters provide flexible string matching:

```typescript
const textColumn: ColumnDefinition = {
  id: 'name',
  field: 'name',
  header: 'Name',
  filterable: true,
  filterType: 'text',
  filterOptions: {
    // Filter modes
    mode: 'contains',           // 'contains', 'startsWith', 'endsWith', 'equals', 'regex'
    caseSensitive: false,       // Case sensitivity
    trimWhitespace: true,       // Trim input whitespace
    
    // UI options
    placeholder: 'Search names...',
    clearButton: true,          // Show clear button
    
    // Advanced options
    minLength: 2,               // Minimum characters to trigger filter
    highlightMatches: true      // Highlight matches in results
  }
};
```

### Number Filters

Number filters support range and comparison filtering:

```typescript
const numberColumn: ColumnDefinition = {
  id: 'salary',
  field: 'salary',
  header: 'Salary',
  type: 'number',
  filterable: true,
  filterType: 'number',
  filterOptions: {
    // Filter mode
    mode: 'range',              // 'range', 'equals', 'greaterThan', 'lessThan'
    
    // Range options
    min: 0,
    max: 200000,
    step: 1000,
    
    // UI options
    showSlider: true,           // Show range slider
    showInputs: true,           // Show number inputs
    currency: true,             // Format as currency
    
    // Validation
    allowNegative: false,
    decimalPlaces: 0
  }
};
```

### Date Filters

Date filters provide date range and comparison options:

```typescript
const dateColumn: ColumnDefinition = {
  id: 'hireDate',
  field: 'hireDate',
  header: 'Hire Date',
  type: 'date',
  filterable: true,
  filterType: 'date',
  filterOptions: {
    // Filter mode
    mode: 'range',              // 'range', 'equals', 'before', 'after'
    
    // Date format
    dateFormat: 'MM/dd/yyyy',
    displayFormat: 'MMM dd, yyyy',
    
    // Range presets
    presets: [
      { label: 'Last 30 days', days: -30 },
      { label: 'Last 90 days', days: -90 },
      { label: 'This year', year: 'current' },
      { label: 'Last year', year: 'previous' }
    ],
    
    // UI options
    showCalendar: true,         // Show date picker
    showPresets: true,          // Show preset options
    allowEmpty: true            // Allow empty dates
  }
};
```

### Boolean Filters

Boolean filters for true/false values:

```typescript
const booleanColumn: ColumnDefinition = {
  id: 'isActive',
  field: 'isActive',
  header: 'Active Status',
  type: 'boolean',
  filterable: true,
  filterType: 'boolean',
  filterOptions: {
    // Display options
    trueLabel: 'Active',
    falseLabel: 'Inactive',
    allLabel: 'All',
    
    // UI style
    style: 'checkbox',          // 'checkbox', 'radio', 'select'
    
    // Default value
    defaultValue: null          // null shows all, true/false filters
  }
};
```

### Select Filters

Dropdown filters for predefined options:

```typescript
const selectColumn: ColumnDefinition = {
  id: 'status',
  field: 'status',
  header: 'Status',
  filterable: true,
  filterType: 'select',
  filterOptions: {
    // Static options
    options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'inactive', label: 'Inactive' }
    ],
    
    // Multiple selection
    multiple: true,
    maxSelections: 3,
    
    // UI options
    placeholder: 'Select status...',
    searchable: true,           // Allow searching options
    clearButton: true,
    
    // Dynamic options
    loadOptions: async (searchTerm: string) => {
      return this.dataService.loadStatusOptions(searchTerm);
    }
  }
};
```

## Advanced Filtering

### Multi-Condition Filters

Create complex filter conditions:

```typescript
@Component({
  template: `
    <div class="filter-builder">
      <h3>Advanced Filter</h3>
      
      <div *ngFor="let condition of filterConditions; let i = index" class="filter-condition">
        <select [(ngModel)]="condition.field">
          <option *ngFor="let col of filterableColumns" [value]="col.field">
            {{col.header}}
          </option>
        </select>
        
        <select [(ngModel)]="condition.operator">
          <option value="equals">Equals</option>
          <option value="contains">Contains</option>
          <option value="startsWith">Starts with</option>
          <option value="greaterThan">Greater than</option>
          <option value="lessThan">Less than</option>
        </select>
        
        <input [(ngModel)]="condition.value" placeholder="Value">
        
        <select [(ngModel)]="condition.logicOperator" *ngIf="i < filterConditions.length - 1">
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
        
        <button (click)="removeCondition(i)">Remove</button>
      </div>
      
      <button (click)="addCondition()">Add Condition</button>
      <button (click)="applyAdvancedFilter()">Apply Filter</button>
      <button (click)="clearAdvancedFilter()">Clear All</button>
    </div>
    
    <ng-ui-lib [data]="filteredData" [columns]="columns" [config]="config"></ng-ui-lib>
  `
})
export class AdvancedFilterComponent {
  filterConditions: FilterCondition[] = [];
  filteredData = computed(() => this.applyConditions(this.data));

  addCondition() {
    this.filterConditions.push({
      field: this.filterableColumns[0].field,
      operator: 'equals',
      value: '',
      logicOperator: 'AND'
    });
  }

  removeCondition(index: number) {
    this.filterConditions.splice(index, 1);
  }

  applyAdvancedFilter() {
    this.filteredData = computed(() => this.applyConditions(this.data));
  }

  private applyConditions(data: any[]): any[] {
    if (this.filterConditions.length === 0) return data;

    return data.filter(row => {
      let result = this.evaluateCondition(row, this.filterConditions[0]);
      
      for (let i = 1; i < this.filterConditions.length; i++) {
        const condition = this.filterConditions[i];
        const conditionResult = this.evaluateCondition(row, condition);
        const prevCondition = this.filterConditions[i - 1];
        
        if (prevCondition.logicOperator === 'AND') {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }
      
      return result;
    });
  }

  private evaluateCondition(row: any, condition: FilterCondition): boolean {
    const value = this.getNestedValue(row, condition.field);
    const filterValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return value === filterValue;
      case 'contains':
        return value.toString().toLowerCase().includes(filterValue.toLowerCase());
      case 'startsWith':
        return value.toString().toLowerCase().startsWith(filterValue.toLowerCase());
      case 'greaterThan':
        return Number(value) > Number(filterValue);
      case 'lessThan':
        return Number(value) < Number(filterValue);
      default:
        return true;
    }
  }
}

interface FilterCondition {
  field: string;
  operator: string;
  value: any;
  logicOperator: 'AND' | 'OR';
}
```

### Quick Filter (Global Search)

Implement a global search across all columns:

```typescript
@Component({
  template: `
    <div class="quick-filter">
      <input
        #quickFilter
        type="text"
        placeholder="Search all columns..."
        (input)="onQuickFilterChanged(quickFilter.value)"
        class="quick-filter-input">
      <button (click)="clearQuickFilter(quickFilter)">Clear</button>
    </div>
    
    <ng-ui-lib
      [data]="filteredData()"
      [columns]="columns"
      [config]="config">
    </ng-ui-lib>
  `
})
export class QuickFilterComponent {
  private quickFilterTerm = signal('');
  
  filteredData = computed(() => {
    const term = this.quickFilterTerm().toLowerCase().trim();
    if (!term) return this.data;
    
    return this.data.filter(row => {
      return this.searchableColumns.some(column => {
        const value = this.getNestedValue(row, column.field);
        return value?.toString().toLowerCase().includes(term);
      });
    });
  });

  get searchableColumns() {
    return this.columns.filter(col => 
      col.filterable !== false && 
      col.type !== 'boolean' // Exclude boolean columns from quick search
    );
  }

  onQuickFilterChanged(value: string) {
    this.quickFilterTerm.set(value);
  }

  clearQuickFilter(input: HTMLInputElement) {
    input.value = '';
    this.quickFilterTerm.set('');
  }

  config: GridConfig = {
    // Quick filter options
    quickFilter: {
      enabled: true,
      placeholder: 'Search...',
      debounceTime: 300,
      caseSensitive: false,
      searchOperator: 'contains',    // 'contains', 'startsWith', 'equals'
      
      // Column inclusion
      includeHiddenColumns: false,  // Search hidden columns
      excludeColumns: ['id'],       // Exclude specific columns
      
      // Highlighting
      highlightMatches: true,
      highlightClass: 'highlight-match'
    }
  };
}
```

### Custom Filter Components

Create custom filter components for specific needs:

```typescript
// Custom range slider filter component
@Component({
  selector: 'blg-range-filter',
  template: `
    <div class="range-filter">
      <div class="range-inputs">
        <input
          type="number"
          [(ngModel)]="minValue"
          (ngModelChange)="onRangeChange()"
          [placeholder]="minPlaceholder">
        <span>to</span>
        <input
          type="number"
          [(ngModel)]="maxValue"
          (ngModelChange)="onRangeChange()"
          [placeholder]="maxPlaceholder">
      </div>
      
      <div class="range-slider" *ngIf="showSlider">
        <input
          type="range"
          [min]="absoluteMin"
          [max]="absoluteMax"
          [(ngModel)]="minValue"
          (ngModelChange)="onRangeChange()"
          class="slider min-slider">
        <input
          type="range"
          [min]="absoluteMin"
          [max]="absoluteMax"
          [(ngModel)]="maxValue"
          (ngModelChange)="onRangeChange()"
          class="slider max-slider">
      </div>
      
      <div class="range-actions">
        <button (click)="clearFilter()">Clear</button>
        <button (click)="resetToDefault()">Reset</button>
      </div>
    </div>
  `
})
export class RangeFilterComponent implements OnInit {
  @Input() column!: ColumnDefinition;
  @Input() data!: any[];
  @Output() filterChanged = new EventEmitter<any>();

  minValue: number | null = null;
  maxValue: number | null = null;
  absoluteMin = 0;
  absoluteMax = 100;
  showSlider = true;
  minPlaceholder = 'Min';
  maxPlaceholder = 'Max';

  ngOnInit() {
    this.calculateAbsoluteRange();
    this.applyColumnOptions();
  }

  private calculateAbsoluteRange() {
    const values = this.data
      .map(row => this.getColumnValue(row))
      .filter(val => val != null && !isNaN(val));
    
    if (values.length > 0) {
      this.absoluteMin = Math.min(...values);
      this.absoluteMax = Math.max(...values);
    }
  }

  private applyColumnOptions() {
    const options = this.column.filterOptions || {};
    this.showSlider = options.showSlider !== false;
    this.minPlaceholder = options.minPlaceholder || 'Min';
    this.maxPlaceholder = options.maxPlaceholder || 'Max';
    
    if (options.min !== undefined) this.absoluteMin = options.min;
    if (options.max !== undefined) this.absoluteMax = options.max;
  }

  onRangeChange() {
    const filter = {
      type: 'range',
      min: this.minValue,
      max: this.maxValue,
      field: this.column.field
    };
    
    this.filterChanged.emit(filter);
  }

  clearFilter() {
    this.minValue = null;
    this.maxValue = null;
    this.filterChanged.emit(null);
  }

  resetToDefault() {
    this.minValue = this.absoluteMin;
    this.maxValue = this.absoluteMax;
    this.onRangeChange();
  }

  private getColumnValue(row: any): number {
    return this.getNestedValue(row, this.column.field);
  }
}

// Register custom filter
const customFilterColumn: ColumnDefinition = {
  id: 'price',
  field: 'price',
  header: 'Price Range',
  type: 'number',
  filterable: true,
  filterType: 'custom',
  customFilterComponent: RangeFilterComponent,
  filterOptions: {
    showSlider: true,
    minPlaceholder: 'Min Price',
    maxPlaceholder: 'Max Price'
  }
};
```

## Server-Side Filtering

For large datasets, implement server-side filtering:

```typescript
@Component({})
export class ServerSideFilterComponent {
  data = signal<any[]>([]);
  loading = signal(false);
  currentFilters: any = {};

  config: GridConfig = {
    filterable: true,
    serverSideFiltering: true,    // Enable server-side filtering
    filterDebounce: 500          // Longer debounce for server calls
  };

  async onFilterChanged(event: any) {
    this.loading.set(true);
    this.currentFilters = event.filters;

    try {
      const response = await this.dataService.loadFilteredData({
        filters: this.currentFilters,
        page: this.currentPage,
        pageSize: this.pageSize,
        sort: this.currentSort
      });

      this.data.set(response.data);
      this.totalRecords = response.totalCount;
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      this.loading.set(false);
    }
  }
}

// Data service implementation
@Injectable()
export class DataService {
  async loadFilteredData(params: {
    filters: any;
    page: number;
    pageSize: number;
    sort?: any;
  }) {
    // Convert filters to server format
    const queryParams: any = {
      page: params.page,
      pageSize: params.pageSize
    };

    // Convert BlgGrid filters to server query format
    Object.entries(params.filters).forEach(([field, filter]: [string, any]) => {
      switch (filter.type) {
        case 'text':
          queryParams[`${field}_contains`] = filter.value;
          break;
        case 'number':
          if (filter.min !== undefined) queryParams[`${field}_gte`] = filter.min;
          if (filter.max !== undefined) queryParams[`${field}_lte`] = filter.max;
          break;
        case 'date':
          if (filter.from) queryParams[`${field}_from`] = filter.from.toISOString();
          if (filter.to) queryParams[`${field}_to`] = filter.to.toISOString();
          break;
        case 'select':
          if (filter.values?.length) {
            queryParams[`${field}_in`] = filter.values.join(',');
          }
          break;
      }
    });

    return this.http.get<{data: any[], totalCount: number}>('/api/data', {
      params: queryParams
    }).toPromise();
  }
}
```

## Filter State Management

Save and restore filter states:

```typescript
@Component({})
export class FilterStateComponent implements OnInit, OnDestroy {
  @ViewChild(Grid) grid!: Grid;
  
  private filterStateKey = 'grid-filter-state';
  private stateSubscription?: Subscription;

  ngOnInit() {
    this.loadFilterState();
    this.setupFilterStatePersistence();
  }

  ngOnDestroy() {
    this.stateSubscription?.unsubscribe();
  }

  // Load saved filter state
  private loadFilterState() {
    const savedState = localStorage.getItem(this.filterStateKey);
    if (savedState) {
      try {
        const filterState = JSON.parse(savedState);
        // Apply saved filters after grid initialization
        setTimeout(() => {
          this.grid.setFilterModel(filterState);
        }, 0);
      } catch (error) {
        console.warn('Invalid saved filter state:', error);
      }
    }
  }

  // Automatically save filter changes
  private setupFilterStatePersistence() {
    this.stateSubscription = this.grid.filterChange$.pipe(
      debounceTime(1000) // Debounce to avoid excessive saves
    ).subscribe(filterState => {
      localStorage.setItem(this.filterStateKey, JSON.stringify(filterState));
    });
  }

  // Manual filter state management
  saveFilterState(name: string) {
    const currentState = this.grid.getFilterModel();
    const savedStates = this.getSavedFilterStates();
    savedStates[name] = currentState;
    localStorage.setItem('saved-filter-states', JSON.stringify(savedStates));
  }

  loadFilterState(name: string) {
    const savedStates = this.getSavedFilterStates();
    if (savedStates[name]) {
      this.grid.setFilterModel(savedStates[name]);
    }
  }

  deleteFilterState(name: string) {
    const savedStates = this.getSavedFilterStates();
    delete savedStates[name];
    localStorage.setItem('saved-filter-states', JSON.stringify(savedStates));
  }

  private getSavedFilterStates(): {[key: string]: any} {
    const saved = localStorage.getItem('saved-filter-states');
    return saved ? JSON.parse(saved) : {};
  }

  getSavedStateNames(): string[] {
    return Object.keys(this.getSavedFilterStates());
  }
}
```

## Performance Optimization

### Efficient Filtering

Optimize filter performance for large datasets:

```typescript
@Component({})
export class OptimizedFilterComponent {
  // Use computed signals for efficient filtering
  private filterTerm = signal('');
  private activeFilters = signal<any>({});
  
  filteredData = computed(() => {
    const data = this.data;
    const filters = this.activeFilters();
    const quickFilter = this.filterTerm();
    
    if (!Object.keys(filters).length && !quickFilter) {
      return data;
    }
    
    return data.filter(row => {
      // Apply column filters
      for (const [field, filter] of Object.entries(filters)) {
        if (!this.passesFilter(row, field, filter)) {
          return false;
        }
      }
      
      // Apply quick filter
      if (quickFilter && !this.passesQuickFilter(row, quickFilter)) {
        return false;
      }
      
      return true;
    });
  });

  // Memoized filter functions
  private filterCache = new Map<string, (row: any) => boolean>();

  private passesFilter(row: any, field: string, filter: any): boolean {
    const cacheKey = `${field}:${JSON.stringify(filter)}`;
    
    if (!this.filterCache.has(cacheKey)) {
      this.filterCache.set(cacheKey, this.createFilterFunction(field, filter));
    }
    
    return this.filterCache.get(cacheKey)!(row);
  }

  private createFilterFunction(field: string, filter: any): (row: any) => boolean {
    // Create optimized filter function based on filter type
    switch (filter.type) {
      case 'text':
        const searchTerm = filter.value.toLowerCase();
        return (row: any) => {
          const value = this.getNestedValue(row, field)?.toString().toLowerCase();
          return value?.includes(searchTerm) || false;
        };
        
      case 'number':
        return (row: any) => {
          const value = Number(this.getNestedValue(row, field));
          return (!filter.min || value >= filter.min) && 
                 (!filter.max || value <= filter.max);
        };
        
      default:
        return () => true;
    }
  }
}
```

## Testing Filters

Test your filtering implementation:

```typescript
describe('Grid Filtering', () => {
  let component: FilterableGridComponent;
  let fixture: ComponentFixture<FilterableGridComponent>;

  beforeEach(() => {
    // Setup component and fixture
  });

  it('should filter by text', () => {
    component.grid.setColumnFilter('name', { type: 'text', value: 'John' });
    
    const filteredData = component.grid.getFilteredData();
    expect(filteredData.length).toBe(1);
    expect(filteredData[0].name).toBe('John Doe');
  });

  it('should filter by number range', () => {
    component.grid.setColumnFilter('age', { 
      type: 'number', 
      min: 25, 
      max: 32 
    });
    
    const filteredData = component.grid.getFilteredData();
    expect(filteredData.every(row => row.age >= 25 && row.age <= 32)).toBe(true);
  });

  it('should combine multiple filters', () => {
    component.grid.setColumnFilter('department', { 
      type: 'select', 
      values: ['Engineering'] 
    });
    component.grid.setColumnFilter('active', { 
      type: 'boolean', 
      value: true 
    });
    
    const filteredData = component.grid.getFilteredData();
    expect(filteredData.every(row => 
      row.department === 'Engineering' && row.active === true
    )).toBe(true);
  });

  it('should handle custom filter', () => {
    const customFilter = jasmine.createSpy('customFilter').and.returnValue(true);
    component.grid.setCustomFilter('custom', customFilter);
    
    component.grid.applyFilters();
    
    expect(customFilter).toHaveBeenCalled();
  });
});
```

## Best Practices

### Do's
✅ **Use appropriate filter types** for each data type  
✅ **Implement debouncing** for filter input to avoid excessive filtering  
✅ **Provide clear filter UI** with proper labels and placeholders  
✅ **Cache filter results** for complex filters  
✅ **Use server-side filtering** for large datasets  
✅ **Persist filter state** for better user experience  
✅ **Test edge cases** (empty values, special characters, null data)  
✅ **Provide filter clear/reset options**  

### Don'ts
❌ **Don't filter on every keystroke** without debouncing  
❌ **Don't use complex regex** in client-side filters without performance testing  
❌ **Don't forget to handle null/undefined** values in custom filters  
❌ **Don't make filter UI too complex** - keep it intuitive  
❌ **Don't filter sensitive data** on the client side  
❌ **Don't ignore accessibility** in filter components  

## Next Steps

- **[Sorting](./sorting.md)** - Learn about sorting capabilities
- **[Pagination](../pagination.md)** - Combine filtering with pagination  
- **[Server-Side Features](../server-side-features.md)** - Advanced server integration
- **[Performance Guide](../../guides/performance.md)** - Optimize filter performance

## Examples

- [Basic Filtering](https://stackblitz.com/edit/ng-ui-lib-filtering-basic)
- [Advanced Filters](https://stackblitz.com/edit/ng-ui-lib-filtering-advanced)
- [Custom Filter Components](https://stackblitz.com/edit/ng-ui-lib-filtering-custom)
- [Server-Side Filtering](https://stackblitz.com/edit/ng-ui-lib-filtering-server)
- [Filter State Management](https://stackblitz.com/edit/ng-ui-lib-filtering-state)
- [Quick Filter](https://stackblitz.com/edit/ng-ui-lib-filtering-quick)