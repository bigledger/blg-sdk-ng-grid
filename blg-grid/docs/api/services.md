# Services API Reference

The BLG Grid library includes several injectable services that manage grid state, grouping operations, and data export functionality. These services use Angular Signals for reactive state management.

## GridStateService

The `GridStateService` manages the internal state of the grid, including selections, sorting, filtering, and pagination.

### Injection

```typescript
import { inject } from '@angular/core';
import { GridStateService } from '@blg/core';

// In component
private gridState = inject(GridStateService);

// Or traditional injection
constructor(private gridState: GridStateService) {}
```

### State Properties (Computed Signals)

#### columns
```typescript
readonly columns = computed(() => this._state().columns);

// Usage
const currentColumns = this.gridState.columns();
```

#### config
```typescript
readonly config = computed(() => this._state().config);

// Usage
const currentConfig = this.gridState.config();
```

#### selectedRows
```typescript
readonly selectedRows = computed(() => this._state().selectedRows);

// Usage
const selectedIndices = this.gridState.selectedRows();
console.log('Selected rows:', Array.from(selectedIndices));
```

#### sortState
```typescript
readonly sortState = computed(() => this._state().sortState);

// Usage
const currentSort = this.gridState.sortState();
if (currentSort) {
  console.log('Active sorts:', currentSort);
}
```

#### filterState
```typescript
readonly filterState = computed(() => this._state().filterState);

// Usage
const activeFilters = this.gridState.filterState();
console.log('Applied filters:', activeFilters);
```

#### paginationState
```typescript
readonly paginationState = computed(() => this._state().paginationState);

// Usage
const pagination = this.gridState.paginationState();
console.log(`Page ${pagination.currentPage + 1} of ${Math.ceil(totalItems / pagination.pageSize)}`);
```

### Column Management Methods

#### updateColumns(columns: ColumnDefinition[]): void
Update the column definitions.

```typescript
const newColumns: ColumnDefinition[] = [
  { id: 'id', field: 'id', header: 'ID', type: 'number' },
  { id: 'name', field: 'name', header: 'Name', type: 'string' }
];

this.gridState.updateColumns(newColumns);
```

#### updateColumnWidth(columnId: string, width: number): void
Update the width of a specific column.

```typescript
// Resize 'name' column to 200px
this.gridState.updateColumnWidth('name', 200);
```

#### updateColumnVisibility(columnId: string, visible: boolean): void
Show or hide a column.

```typescript
// Hide the 'internal' column
this.gridState.updateColumnVisibility('internal', false);

// Show the 'description' column
this.gridState.updateColumnVisibility('description', true);
```

### Selection Management Methods

#### toggleRowSelection(rowIndex: number): void
Toggle the selection state of a row.

```typescript
// Toggle selection of row at index 2
this.gridState.toggleRowSelection(2);
```

#### clearSelection(): void
Clear all row selections.

```typescript
this.gridState.clearSelection();
```

### Sorting Methods

#### updateSort(columnId: string, direction: 'asc' | 'desc' | null, multiSort?: boolean): void
Update sorting for a column.

```typescript
// Sort by name ascending
this.gridState.updateSort('name', 'asc');

// Add secondary sort by age descending
this.gridState.updateSort('age', 'desc', true);

// Clear sorting for name column
this.gridState.updateSort('name', null);
```

#### clearSort(): void
Clear all sorting.

```typescript
this.gridState.clearSort();
```

### Filtering Methods

#### updateFilter(columnId: string, filterValue: any): void
Set filter value for a column.

```typescript
// Filter name column
this.gridState.updateFilter('name', 'John');

// Filter age column with numeric comparison
this.gridState.updateFilter('age', '>25');

// Clear filter (empty value)
this.gridState.updateFilter('status', '');
```

#### clearFilters(): void
Clear all filters.

```typescript
this.gridState.clearFilters();
```

### Pagination Methods

#### updatePagination(paginationConfig: Partial<PaginationConfig>): void
Update pagination configuration.

```typescript
this.gridState.updatePagination({
  pageSize: 50,
  showPageSizeSelector: true,
  pageSizeOptions: [25, 50, 100, 200]
});
```

#### setCurrentPage(page: number): void
Navigate to a specific page.

```typescript
// Go to page 3 (0-based indexing)
this.gridState.setCurrentPage(2);
```

#### setPageSize(pageSize: number): void
Change the number of items per page.

```typescript
// Show 100 items per page
this.gridState.setPageSize(100);
```

#### setTotalItems(totalItems: number): void
Set total item count for server-side pagination.

```typescript
// Server returned 1500 total items
this.gridState.setTotalItems(1500);
```

### State Utilities

#### reset(): void
Reset the service to initial state.

```typescript
this.gridState.reset();
```

#### state (getter)
Get the complete current state.

```typescript
const currentState: GridState = this.gridState.state;
console.log('Complete state:', currentState);
```

## GroupingService

The `GroupingService` manages row grouping functionality, including hierarchical groups and aggregations.

### Injection

```typescript
import { GroupingService } from '@blg/core';

private groupingService = inject(GroupingService);
```

### State Properties (Computed Signals)

#### groupingState
```typescript
readonly groupingState = computed(() => this._groupingState());

// Usage
const grouping = this.groupingService.groupingState();
console.log('Grouped by columns:', grouping.groupByColumns);
```

#### isGrouped
```typescript
readonly isGrouped = computed(() => this._groupingState().groupByColumns.length > 0);

// Usage
if (this.groupingService.isGrouped()) {
  console.log('Grid is currently grouped');
}
```

### Grouping Configuration Methods

#### setGroupByColumns(columnIds: string[]): void
Set columns to group by.

```typescript
// Group by category, then by status
this.groupingService.setGroupByColumns(['category', 'status']);

// Clear grouping
this.groupingService.setGroupByColumns([]);
```

#### addGroupByColumn(columnId: string): void
Add a column to existing grouping.

```typescript
// Add 'priority' to current grouping
this.groupingService.addGroupByColumn('priority');
```

#### removeGroupByColumn(columnId: string): void
Remove a column from grouping.

```typescript
// Remove 'status' from grouping
this.groupingService.removeGroupByColumn('status');
```

#### clearGrouping(): void
Remove all grouping.

```typescript
this.groupingService.clearGrouping();
```

### Group Expansion Methods

#### toggleGroup(groupId: string): void
Toggle expansion of a specific group.

```typescript
// Toggle the 'Electronics' category group
this.groupingService.toggleGroup('category_0_Electronics');
```

#### expandAllGroups(groupedData: GroupedRow[]): void
Expand all groups in the provided data.

```typescript
const groupedRows = this.groupingService.groupData(data, columns);
this.groupingService.expandAllGroups(groupedRows);
```

#### collapseAllGroups(): void
Collapse all groups.

```typescript
this.groupingService.collapseAllGroups();
```

### Aggregation Methods

#### setAggregations(aggregations: { [columnId: string]: AggregationConfig[] }): void
Set aggregation configurations for columns.

```typescript
const aggregations = {
  'price': [
    { function: 'sum', label: 'Total Price' },
    { function: 'avg', label: 'Average Price' }
  ],
  'quantity': [
    { function: 'sum', label: 'Total Quantity' },
    { function: 'count', label: 'Item Count' }
  ]
};

this.groupingService.setAggregations(aggregations);
```

#### addAggregation(columnId: string, aggregation: AggregationConfig): void
Add an aggregation for a column.

```typescript
const avgConfig: AggregationConfig = {
  function: 'avg',
  label: 'Average Price',
  formatter: (value) => `$${value.toFixed(2)}`
};

this.groupingService.addAggregation('price', avgConfig);
```

#### removeAggregation(columnId: string, functionType: AggregationFunction): void
Remove an aggregation from a column.

```typescript
// Remove sum aggregation from price column
this.groupingService.removeAggregation('price', 'sum');
```

### Group Sorting Methods

#### setGroupSorting(sortConfigs: GroupSortConfig[]): void
Set group sorting configurations.

```typescript
const sortConfigs: GroupSortConfig[] = [
  {
    columnId: 'category',
    direction: 'asc'
  },
  {
    columnId: 'status',
    direction: 'desc',
    sortByAggregation: true,
    aggregationFunction: 'sum'
  }
];

this.groupingService.setGroupSorting(sortConfigs);
```

### Data Processing Methods

#### groupData(data: any[], columns: ColumnDefinition[]): GroupedRow[]
Transform flat data into grouped hierarchical structure.

```typescript
const flatData = [
  { category: 'Electronics', product: 'Phone', price: 500 },
  { category: 'Electronics', product: 'Laptop', price: 1000 },
  { category: 'Books', product: 'Novel', price: 20 }
];

// Set grouping by category
this.groupingService.setGroupByColumns(['category']);

// Get grouped data
const groupedData = this.groupingService.groupData(flatData, columns);

// groupedData structure:
// [
//   { type: 'group', group: { displayValue: 'Electronics', count: 2, ... }, level: 0 },
//   { type: 'data', data: { category: 'Electronics', product: 'Phone', ... }, level: 1 },
//   { type: 'data', data: { category: 'Electronics', product: 'Laptop', ... }, level: 1 },
//   { type: 'group', group: { displayValue: 'Books', count: 1, ... }, level: 0 },
//   { type: 'data', data: { category: 'Books', product: 'Novel', ... }, level: 1 }
// ]
```

## ExportService

The `ExportService` handles data export functionality for CSV and Excel formats.

### Injection

```typescript
import { ExportService } from '@blg/core';

private exportService = inject(ExportService);
```

### Export Methods

#### exportData(data: any[], columns: ColumnDefinition[], options: ExportOptions, groupedRows?: GroupedRow[], appliedFilters?: Record<string, any>): Promise<void>
Export data with specified options.

```typescript
const exportOptions: ExportOptions = {
  format: 'excel',
  filename: 'sales-report',
  includeHeaders: true,
  dataScope: 'filtered',
  formatOptions: {
    sheetName: 'Sales Data',
    autoSizeColumns: true,
    applyBasicStyling: true
  }
};

try {
  await this.exportService.exportData(
    this.data,
    this.columns,
    exportOptions,
    this.groupedData,
    this.appliedFilters
  );
  console.log('Export completed successfully');
} catch (error) {
  console.error('Export failed:', error);
}
```

### Default Options Methods

#### getDefaultCsvOptions(): CsvExportOptions
Get default CSV export configuration.

```typescript
const csvDefaults = this.exportService.getDefaultCsvOptions();
console.log('CSV defaults:', csvDefaults);
// Output: { delimiter: ',', qualifier: '"', lineEnding: '\n', includeBom: true }
```

#### getDefaultExcelOptions(): ExcelExportOptions
Get default Excel export configuration.

```typescript
const excelDefaults = this.exportService.getDefaultExcelOptions();
console.log('Excel defaults:', excelDefaults);
// Output: { sheetName: 'Sheet1', autoSizeColumns: true, applyBasicStyling: true, ... }
```

## Service Integration Examples

### Complete Service Integration

```typescript
@Component({
  selector: 'app-service-integration',
  template: `
    <div class="grid-controls">
      <!-- Grouping controls -->
      <button (click)="toggleGrouping()">
        {{ isGrouped() ? 'Clear' : 'Group by Category' }}
      </button>
      
      <!-- Export controls -->
      <button (click)="exportToCsv()">Export CSV</button>
      <button (click)="exportToExcel()">Export Excel</button>
      
      <!-- Selection info -->
      <div>Selected: {{ getSelectedCount() }} rows</div>
    </div>
    
    <blg-grid 
      [data]="data"
      [columns]="columns"
      [config]="config">
    </blg-grid>
  `
})
export class ServiceIntegrationComponent {
  private gridState = inject(GridStateService);
  private groupingService = inject(GroupingService);
  private exportService = inject(ExportService);

  // Reactive properties
  isGrouped = this.groupingService.isGrouped;
  selectedRows = this.gridState.selectedRows;

  data = [
    { id: 1, category: 'Electronics', name: 'Phone', price: 500 },
    { id: 2, category: 'Electronics', name: 'Laptop', price: 1000 },
    { id: 3, category: 'Books', name: 'Novel', price: 20 }
  ];

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number' },
    { id: 'category', field: 'category', header: 'Category', type: 'string' },
    { id: 'name', field: 'name', header: 'Name', type: 'string' },
    { id: 'price', field: 'price', header: 'Price', type: 'number' }
  ];

  config: GridConfig = {
    selectable: true,
    sortable: true,
    grouping: true,
    export: true
  };

  toggleGrouping() {
    if (this.groupingService.isGrouped()) {
      this.groupingService.clearGrouping();
    } else {
      this.groupingService.setGroupByColumns(['category']);
      this.groupingService.setAggregations({
        'price': [
          { function: 'sum', label: 'Total' },
          { function: 'avg', label: 'Average' }
        ]
      });
    }
  }

  getSelectedCount(): number {
    return this.selectedRows().size;
  }

  async exportToCsv() {
    const options: ExportOptions = {
      format: 'csv',
      filename: 'data-export',
      includeHeaders: true,
      dataScope: 'all',
      formatOptions: this.exportService.getDefaultCsvOptions()
    };

    try {
      await this.exportService.exportData(this.data, this.columns, options);
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  }

  async exportToExcel() {
    const options: ExportOptions = {
      format: 'excel',
      filename: 'data-export',
      includeHeaders: true,
      dataScope: 'visible',
      formatOptions: {
        ...this.exportService.getDefaultExcelOptions(),
        headerStyle: {
          font: { bold: true, color: '#FFFFFF' },
          fill: { fgColor: '4472C4' }
        }
      }
    };

    try {
      const groupedData = this.groupingService.isGrouped() 
        ? this.groupingService.groupData(this.data, this.columns)
        : undefined;

      await this.exportService.exportData(
        this.data, 
        this.columns, 
        options, 
        groupedData,
        this.gridState.filterState()
      );
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  }
}
```

### Custom Service Wrapper

```typescript
@Injectable({
  providedIn: 'root'
})
export class CustomGridService {
  private gridState = inject(GridStateService);
  private groupingService = inject(GroupingService);
  private exportService = inject(ExportService);

  // Expose reactive properties
  readonly selectedCount = computed(() => this.gridState.selectedRows().size);
  readonly isFiltered = computed(() => Object.keys(this.gridState.filterState()).length > 0);
  readonly isGrouped = this.groupingService.isGrouped;

  // High-level operations
  async bulkSelect(predicate: (item: any) => boolean, data: any[]) {
    this.gridState.clearSelection();
    
    data.forEach((item, index) => {
      if (predicate(item)) {
        this.gridState.toggleRowSelection(index);
      }
    });
  }

  async quickExport(
    data: any[], 
    columns: ColumnDefinition[], 
    format: 'csv' | 'excel' = 'csv'
  ) {
    const options: ExportOptions = {
      format,
      filename: `export-${new Date().toISOString().split('T')[0]}`,
      includeHeaders: true,
      dataScope: 'visible',
      formatOptions: format === 'csv' 
        ? this.exportService.getDefaultCsvOptions()
        : this.exportService.getDefaultExcelOptions()
    };

    return this.exportService.exportData(data, columns, options);
  }

  saveState(): string {
    const state = {
      selectedRows: Array.from(this.gridState.selectedRows()),
      sortState: this.gridState.sortState(),
      filterState: this.gridState.filterState(),
      paginationState: this.gridState.paginationState(),
      groupingState: this.groupingService.groupingState()
    };
    
    return JSON.stringify(state);
  }

  restoreState(stateJson: string, data: any[]) {
    try {
      const state = JSON.parse(stateJson);
      
      // Restore pagination
      if (state.paginationState) {
        this.gridState.updatePagination(state.paginationState);
      }
      
      // Restore sorting
      if (state.sortState) {
        // Clear first, then apply each sort
        this.gridState.clearSort();
        state.sortState.forEach((sort: any, index: number) => {
          this.gridState.updateSort(sort.columnId, sort.direction, index > 0);
        });
      }
      
      // Restore filters
      if (state.filterState) {
        this.gridState.clearFilters();
        Object.entries(state.filterState).forEach(([columnId, value]) => {
          this.gridState.updateFilter(columnId, value);
        });
      }
      
      // Restore grouping
      if (state.groupingState) {
        this.groupingService.setGroupByColumns(state.groupingState.groupByColumns || []);
        if (state.groupingState.aggregations) {
          this.groupingService.setAggregations(state.groupingState.aggregations);
        }
      }
      
      // Restore selection (must be done after other operations)
      setTimeout(() => {
        this.gridState.clearSelection();
        if (state.selectedRows) {
          state.selectedRows.forEach((index: number) => {
            if (index < data.length) {
              this.gridState.toggleRowSelection(index);
            }
          });
        }
      });
      
    } catch (error) {
      console.error('Failed to restore grid state:', error);
    }
  }
}
```

## Service Best Practices

### Reactive Pattern Usage

```typescript
export class ReactiveGridComponent implements OnInit {
  private gridState = inject(GridStateService);
  
  ngOnInit() {
    // React to selection changes
    effect(() => {
      const selectedCount = this.gridState.selectedRows().size;
      this.updateActionButtons(selectedCount);
    });
    
    // React to filter changes
    effect(() => {
      const filters = this.gridState.filterState();
      this.logFilterActivity(filters);
    });
    
    // React to sort changes
    effect(() => {
      const sortState = this.gridState.sortState();
      this.updateSortIndicators(sortState);
    });
  }
}
```

### Error Handling

```typescript
async safeExport(data: any[], columns: ColumnDefinition[]) {
  try {
    await this.exportService.exportData(data, columns, {
      format: 'excel',
      filename: 'export',
      includeHeaders: true,
      dataScope: 'visible'
    });
    
    this.notificationService.success('Export completed successfully');
  } catch (error) {
    console.error('Export error:', error);
    this.notificationService.error('Export failed. Please try again.');
  }
}
```

### Performance Optimization

```typescript
// Debounce filter updates for better performance
private filterSubject = new Subject<{ columnId: string, value: any }>();

ngOnInit() {
  this.filterSubject.pipe(
    debounceTime(300)
  ).subscribe(({ columnId, value }) => {
    this.gridState.updateFilter(columnId, value);
  });
}

onFilterChange(columnId: string, value: any) {
  this.filterSubject.next({ columnId, value });
}
```