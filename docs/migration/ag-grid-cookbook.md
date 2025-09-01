# ag-Grid Migration Cookbook

## 📚 Target Audience: Library Users

This cookbook provides step-by-step recipes for common migration scenarios from ag-Grid to BLG Grid. Each recipe includes the problem, ag-Grid solution, BLG Grid solution, and migration steps.

## 📋 Table of Contents

1. [How to Migrate Cell Renderers](#how-to-migrate-cell-renderers)
2. [How to Migrate Cell Editors](#how-to-migrate-cell-editors)
3. [How to Migrate Filters](#how-to-migrate-filters)
4. [How to Migrate Themes](#how-to-migrate-themes)
5. [How to Handle Server-Side Row Model](#how-to-handle-server-side-row-model)
6. [How to Implement Infinite Scrolling](#how-to-implement-infinite-scrolling)
7. [How to Handle Breaking Changes](#how-to-handle-breaking-changes)
8. [Performance Migration Patterns](#performance-migration-patterns)

## 🧩 How to Migrate Cell Renderers

### Problem
You have custom cell renderers in ag-Grid that implement `ICellRendererAngularComp` and need to convert them to BLG Grid components.

### ag-Grid Solution

```typescript
// ag-Grid cell renderer
@Component({
  selector: 'app-custom-renderer',
  template: `<span class="custom-cell">{{ displayValue }}</span>`
})
export class CustomRendererComponent implements ICellRendererAngularComp {
  displayValue: string;
  
  agInit(params: ICellRendererParams): void {
    this.displayValue = this.formatValue(params.value);
  }
  
  refresh(params: ICellRendererParams): boolean {
    this.displayValue = this.formatValue(params.value);
    return true;
  }
  
  private formatValue(value: any): string {
    return value ? value.toUpperCase() : '';
  }
}

// Column definition
{
  field: 'status',
  cellRenderer: CustomRendererComponent,
  cellRendererParams: {
    customParam: 'value'
  }
}

// Grid options
gridOptions: GridOptions = {
  frameworkComponents: {
    customRenderer: CustomRendererComponent
  }
};
```

### BLG Grid Solution

```typescript
// BLG Grid cell renderer
@Component({
  selector: 'app-custom-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="custom-cell">{{ displayValue }}</span>`
})
export class CustomRendererComponent implements OnInit {
  @Input() value: any;
  @Input() rowData: any;
  @Input() column: any;
  @Input() params: any;
  
  displayValue: string = '';
  
  ngOnInit() {
    this.displayValue = this.formatValue(this.value);
  }
  
  private formatValue(value: any): string {
    return value ? value.toUpperCase() : '';
  }
}

// Column definition
{
  field: 'status',
  cellRenderer: CustomRendererComponent,
  cellRendererParams: {
    customParam: 'value'
  }
}

// Component imports (no global registration needed)
@Component({
  imports: [Grid, CustomRendererComponent],
  // ...
})
```

### Migration Steps

1. **Remove ag-Grid Interface**
   ```typescript
   // Remove: implements ICellRendererAngularComp
   // Remove: agInit() and refresh() methods
   ```

2. **Add Angular Inputs**
   ```typescript
   @Input() value: any;
   @Input() rowData: any;
   @Input() column: any;
   @Input() params: any;
   ```

3. **Make Component Standalone**
   ```typescript
   @Component({
     standalone: true,
     imports: [CommonModule],
     // ...
   })
   ```

4. **Update Lifecycle**
   ```typescript
   // Use ngOnInit instead of agInit
   ngOnInit() {
     // initialization logic
   }
   ```

5. **Import in Main Component**
   ```typescript
   @Component({
     imports: [Grid, CustomRendererComponent],
     // ...
   })
   ```

## ✏️ How to Migrate Cell Editors

### Problem
You have custom cell editors that implement `ICellEditorAngularComp` and need to convert them to BLG Grid.

### ag-Grid Solution

```typescript
@Component({
  selector: 'app-custom-editor',
  template: `
    <input #input 
           [(ngModel)]="value" 
           (blur)="onBlur()"
           class="custom-editor">
  `
})
export class CustomEditorComponent implements ICellEditorAngularComp, AfterViewInit {
  @ViewChild('input') input!: ElementRef;
  
  value: any;
  
  agInit(params: ICellEditorParams): void {
    this.value = params.value;
  }
  
  ngAfterViewInit() {
    this.input.nativeElement.focus();
  }
  
  getValue(): any {
    return this.value;
  }
  
  isPopup(): boolean {
    return false;
  }
  
  onBlur() {
    // Handle blur event
  }
}
```

### BLG Grid Solution

```typescript
@Component({
  selector: 'app-custom-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <input #input 
           [(ngModel)]="value" 
           (ngModelChange)="onValueChange()"
           (blur)="onBlur()"
           class="custom-editor">
  `
})
export class CustomEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('input') input!: ElementRef;
  
  @Input() value: any;
  @Input() rowData: any;
  @Input() column: any;
  @Input() params: any;
  
  @Output() valueChanged = new EventEmitter<any>();
  
  ngOnInit() {
    // initialization logic
  }
  
  ngAfterViewInit() {
    this.input.nativeElement.focus();
  }
  
  onValueChange() {
    this.valueChanged.emit(this.value);
  }
  
  getValue(): any {
    return this.value;
  }
  
  onBlur() {
    // Handle blur event
  }
}
```

### Migration Steps

1. **Remove ag-Grid Interface**
2. **Add Angular Inputs/Outputs**
3. **Make Component Standalone**
4. **Add valueChanged Event Emitter**
5. **Update Template Event Binding**

## 🔍 How to Migrate Filters

### Problem
You have custom filters or complex filter configurations that need to be migrated.

### ag-Grid Solution

```typescript
// Text filter with custom parameters
{
  field: 'name',
  filter: 'agTextColumnFilter',
  filterParams: {
    buttons: ['reset', 'apply'],
    debounceMs: 200,
    caseSensitive: false,
    filterOptions: ['contains', 'startsWith', 'endsWith'],
    defaultOption: 'contains'
  }
}

// Set filter with custom values
{
  field: 'category',
  filter: 'agSetColumnFilter',
  filterParams: {
    values: ['A', 'B', 'C'],
    selectAllOnMiniFilter: true,
    miniFilter: true
  }
}

// Custom filter component
@Component({
  template: `
    <div class="custom-filter">
      <input [(ngModel)]="filterValue" (ngModelChange)="onFilterChanged()">
      <button (click)="clearFilter()">Clear</button>
    </div>
  `
})
export class CustomFilterComponent implements IFilterAngularComp {
  filterValue: string = '';
  
  agInit(params: IFilterParams): void {
    // initialization
  }
  
  isFilterActive(): boolean {
    return this.filterValue !== '';
  }
  
  doesFilterPass(params: IDoesFilterPassParams): boolean {
    return params.data[params.colDef.field!].includes(this.filterValue);
  }
  
  getModel(): any {
    return this.filterValue ? { value: this.filterValue } : null;
  }
  
  setModel(model: any): void {
    this.filterValue = model ? model.value : '';
  }
  
  onFilterChanged() {
    this.params.filterChangedCallback();
  }
  
  clearFilter() {
    this.filterValue = '';
    this.onFilterChanged();
  }
}
```

### BLG Grid Solution

```typescript
// Text filter with options
{
  field: 'name',
  filterable: true,
  filterType: 'text',
  filterOptions: {
    showApplyButton: true,
    showResetButton: true,
    debounceMs: 200,
    caseSensitive: false,
    operators: ['contains', 'startsWith', 'endsWith'],
    defaultOperator: 'contains'
  }
}

// Set filter with values
{
  field: 'category',
  filterable: true,
  filterType: 'set',
  filterOptions: {
    values: ['A', 'B', 'C'],
    selectAllOnMiniFilter: true,
    showMiniFilter: true
  }
}

// Custom filter component
@Component({
  selector: 'app-custom-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="custom-filter">
      <input [(ngModel)]="filterValue" (ngModelChange)="onFilterChanged()">
      <button (click)="clearFilter()">Clear</button>
    </div>
  `
})
export class CustomFilterComponent implements OnInit {
  @Input() column: any;
  @Input() filterParams: any;
  
  @Output() filterChanged = new EventEmitter<any>();
  
  filterValue: string = '';
  
  ngOnInit() {
    // initialization
  }
  
  isFilterActive(): boolean {
    return this.filterValue !== '';
  }
  
  doesFilterPass(rowData: any): boolean {
    return rowData[this.column.field].includes(this.filterValue);
  }
  
  getModel(): any {
    return this.filterValue ? { value: this.filterValue } : null;
  }
  
  setModel(model: any): void {
    this.filterValue = model ? model.value : '';
  }
  
  onFilterChanged() {
    this.filterChanged.emit(this.getModel());
  }
  
  clearFilter() {
    this.filterValue = '';
    this.onFilterChanged();
  }
}
```

### Migration Steps

1. **Update Filter Type Names**
   ```typescript
   // ag-Grid → BLG Grid
   'agTextColumnFilter' → 'text'
   'agNumberColumnFilter' → 'number' 
   'agDateColumnFilter' → 'date'
   'agSetColumnFilter' → 'set'
   ```

2. **Restructure Filter Parameters**
   ```typescript
   // Before
   filter: 'agTextColumnFilter',
   filterParams: { buttons: ['reset', 'apply'] }
   
   // After
   filterable: true,
   filterType: 'text',
   filterOptions: { showApplyButton: true, showResetButton: true }
   ```

3. **Migrate Custom Filter Interface**

## 🎨 How to Migrate Themes

### Problem
You have custom ag-Grid themes and CSS customizations that need to be converted to BLG Grid.

### ag-Grid Solution

```scss
// Import ag-Grid theme
@import "~ag-grid-community/styles/ag-grid.css";
@import "~ag-grid-community/styles/ag-theme-alpine.css";

// Custom theme variables
.ag-theme-alpine {
  --ag-foreground-color: #333;
  --ag-background-color: #fff;
  --ag-header-foreground-color: #000;
  --ag-header-background-color: #f8f9fa;
  --ag-odd-row-background-color: #fcfcfc;
  --ag-row-hover-color: #e3f2fd;
  --ag-selected-row-background-color: #cce7ff;
  --ag-border-color: #d4d4d8;
}

// Custom cell styling
.ag-theme-alpine .ag-cell {
  padding: 8px;
  border-right: 1px solid var(--ag-border-color);
}

.ag-theme-alpine .ag-header-cell {
  font-weight: 600;
  border-bottom: 2px solid var(--ag-border-color);
}
```

### BLG Grid Solution

```scss
// Import BLG Grid theme
@import "@ng-ui-lib/theme/styles/blg-grid.css";
@import "@ng-ui-lib/theme/styles/themes/default.css";

// Custom theme variables
.blg-theme-default {
  --blg-text-color: #333;
  --blg-background-color: #fff;
  --blg-header-text-color: #000;
  --blg-header-background: #f8f9fa;
  --blg-row-odd-background: #fcfcfc;
  --blg-row-hover-background: #e3f2fd;
  --blg-row-selected-background: #cce7ff;
  --blg-border-color: #d4d4d8;
}

// Custom cell styling
.blg-theme-default .blg-cell {
  padding: 8px;
  border-right: 1px solid var(--blg-border-color);
}

.blg-theme-default .blg-header-cell {
  font-weight: 600;
  border-bottom: 2px solid var(--blg-border-color);
}
```

### Migration Steps

1. **Update Imports**
   ```scss
   // Replace ag-Grid imports with BLG Grid
   @import "@ng-ui-lib/theme/styles/blg-grid.css";
   @import "@ng-ui-lib/theme/styles/themes/default.css";
   ```

2. **Update CSS Classes**
   ```scss
   // Find and replace class names
   .ag-theme-alpine → .blg-theme-default
   .ag-cell → .blg-cell
   .ag-header-cell → .blg-header-cell
   .ag-row → .blg-row
   ```

3. **Update CSS Variables**
   ```scss
   // Map ag-Grid variables to BLG Grid variables
   --ag-foreground-color → --blg-text-color
   --ag-background-color → --blg-background-color
   --ag-header-background-color → --blg-header-background
   ```

4. **Update Component Class**
   ```html
   <!-- Before -->
   <ag-grid-angular class="ag-theme-alpine">
   
   <!-- After -->
   <ng-ui-lib class="blg-theme-default">
   ```

## 🌐 How to Handle Server-Side Row Model

### Problem
You're using ag-Grid Enterprise server-side row model and need to migrate to BLG Grid.

### Current Workaround (BLG Grid v1.x)

```typescript
// Use pagination instead of server-side row model
export class ServerSideGridComponent {
  data = signal<any[]>([]);
  currentPage = signal(0);
  totalRecords = signal(0);
  pageSize = 100;

  config: GridConfig = {
    pagination: true,
    paginationPageSize: this.pageSize,
    paginationAutoPageSize: false
  };

  async loadData(page: number = 0, sortModel?: any[], filterModel?: any) {
    const request = {
      page,
      pageSize: this.pageSize,
      sortModel,
      filterModel
    };

    const response = await this.http.post<any>('/api/data', request).toPromise();
    this.data.set(response.data);
    this.totalRecords.set(response.totalCount);
    this.currentPage.set(page);
  }

  onSortChanged(event: SortChangedEvent) {
    this.loadData(0, event.sortModel);
  }

  onFilterChanged(event: FilterChangedEvent) {
    this.loadData(0, undefined, event.filterModel);
  }

  onPageChanged(event: PageChangedEvent) {
    this.loadData(event.page);
  }
}
```

### Future BLG Grid v2.0 Solution

```typescript
// Server-side row model (planned for v2.0)
export class ServerSideGridV2Component {
  config: GridConfig = {
    rowModel: 'serverSide',
    serverSideDataSource: {
      getRows: async (request: ServerSideRequest) => {
        const response = await this.http.post<any>('/api/data', {
          startRow: request.startRow,
          endRow: request.endRow,
          sortModel: request.sortModel,
          filterModel: request.filterModel
        }).toPromise();

        return {
          data: response.data,
          totalCount: response.totalCount
        };
      }
    },
    cacheBlockSize: 100,
    maxBlocksInCache: 10
  };
}
```

## ♾️ How to Implement Infinite Scrolling

### Problem
You need to implement infinite scrolling for large datasets.

### ag-Grid Solution

```typescript
gridOptions: GridOptions = {
  rowModelType: 'infinite',
  datasource: {
    getRows: (params) => {
      const startRow = params.startRow;
      const endRow = params.endRow;
      
      this.loadData(startRow, endRow).subscribe(data => {
        params.successCallback(data.rows, data.lastRow);
      });
    }
  },
  cacheBlockSize: 100,
  infiniteInitialRowCount: 1000
};
```

### BLG Grid Solution (Current)

```typescript
// Use pagination with auto-loading
export class InfiniteScrollComponent {
  data = signal<any[]>([]);
  loading = signal(false);
  hasMore = signal(true);

  config: GridConfig = {
    pagination: true,
    paginationPageSize: 100,
    enableInfiniteScroll: true, // Auto-load next page when scrolling
    virtualScrolling: {
      enabled: true,
      bufferSize: 20
    }
  };

  async onScrollEnd() {
    if (this.loading() || !this.hasMore()) return;
    
    this.loading.set(true);
    const nextPage = Math.floor(this.data().length / 100);
    
    try {
      const newData = await this.loadMoreData(nextPage);
      this.data.update(current => [...current, ...newData]);
      this.hasMore.set(newData.length === 100);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadMoreData(page: number): Promise<any[]> {
    const response = await this.http.get<any>(`/api/data?page=${page}&limit=100`).toPromise();
    return response.data;
  }
}
```

## 💔 How to Handle Breaking Changes

### Problem
Some ag-Grid features don't have direct BLG Grid equivalents or work differently.

### Common Breaking Changes and Solutions

#### 1. Missing Enterprise Features

```typescript
// ag-Grid Enterprise feature not available in BLG Grid v1.x
// Workaround: Use alternative approaches

// Example: Pivoting (not available in v1.x)
// Workaround: Pre-process data on client/server
function pivotData(data: any[], rowFields: string[], colField: string, valueField: string) {
  // Custom pivot implementation
  const pivoted = /* pivot logic */;
  return pivoted;
}
```

#### 2. Different Event Handling

```typescript
// ag-Grid: Events in gridOptions
gridOptions: GridOptions = {
  onCellClicked: (event) => { /* handler */ }
};

// BLG Grid: Events in template
template: `
  <ng-ui-lib 
    (cellClicked)="onCellClicked($event)">
  </ng-ui-lib>
`
```

#### 3. API Method Changes

```typescript
// ag-Grid API methods
this.gridApi.setRowData(data);
this.gridApi.exportDataAsCsv();
this.gridColumnApi.setColumnVisible('name', false);

// BLG Grid equivalent
this.data.set(data); // Using signals
this.gridApi.exportToCsv();
this.gridApi.setColumnVisible('name', false);
```

### Migration Strategy for Breaking Changes

1. **Identify Critical Features**
   - List all ag-Grid features you're currently using
   - Check BLG Grid feature compatibility matrix
   - Plan workarounds for missing features

2. **Implement Workarounds**
   ```typescript
   // Create adapter services for missing functionality
   @Injectable()
   export class GridAdapterService {
     // Bridge between ag-Grid API and BLG Grid API
     exportData(gridApi: any, format: 'csv' | 'excel') {
       if (format === 'csv') {
         gridApi.exportToCsv();
       } else {
         gridApi.exportToExcel();
       }
     }
   }
   ```

3. **Feature Detection**
   ```typescript
   // Detect available features
   export const FEATURES = {
     serverSideRowModel: false, // Not available in v1.x
     pivoting: false,          // Not available in v1.x
     masterDetail: true,       // Available
     grouping: true           // Available
   };
   ```

## ⚡ Performance Migration Patterns

### Problem
Ensuring optimal performance after migrating from ag-Grid.

### Performance Optimization Recipes

#### 1. Virtual Scrolling Configuration

```typescript
// Optimize for large datasets
config: GridConfig = {
  virtualScrolling: {
    enabled: true,
    threshold: 50,        // Enable when > 50 rows
    bufferSize: 20,       // Buffer 20 rows outside viewport
    itemSize: 'auto'      // Auto-calculate row height
  },
  suppressRowVirtualisation: false
};
```

#### 2. Change Detection Optimization

```typescript
// Use OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class MyGridComponent {
  // Use signals for reactive data
  data = signal<any[]>([]);
  
  // Computed values for derived state
  filteredCount = computed(() => this.data().filter(/* filter */).length);
}
```

#### 3. TrackBy Functions

```typescript
// Always use trackBy for better performance
config: GridConfig = {
  trackByFn: (index: number, item: any) => item.id || index
};
```

#### 4. Debounced Operations

```typescript
// Debounce expensive operations
export class MyGridComponent {
  private searchSubject = new Subject<string>();
  
  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => this.performSearch(searchTerm));
  }
  
  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }
}
```

## 🔧 Utility Functions for Migration

### Configuration Converter

```typescript
// Utility to convert ag-Grid configuration to BLG Grid
export function convertAgGridConfig(agConfig: any): GridConfig {
  return {
    // Map common properties
    rowSelection: agConfig.rowSelection,
    enableSorting: agConfig.enableSorting,
    enableFiltering: agConfig.enableFilter,
    enableColumnResize: agConfig.enableColResize,
    
    // Map ag-Grid specific properties
    pagination: agConfig.pagination,
    paginationPageSize: agConfig.paginationPageSize,
    
    // Convert complex configurations
    grouping: agConfig.rowGroupPanelShow ? {
      enabled: true,
      defaultExpanded: agConfig.groupDefaultExpanded
    } : undefined,
    
    // Performance settings
    virtualScrolling: {
      enabled: !agConfig.suppressRowVirtualisation,
      bufferSize: agConfig.rowBuffer || 10
    }
  };
}
```

### Column Definition Converter

```typescript
export function convertColumnDef(agColDef: any): ColumnDefinition {
  return {
    field: agColDef.field,
    headerName: agColDef.headerName,
    width: agColDef.width,
    minWidth: agColDef.minWidth,
    maxWidth: agColDef.maxWidth,
    
    // Convert filter configuration
    filterable: !!agColDef.filter,
    filterType: mapFilterType(agColDef.filter),
    
    // Convert other properties
    sortable: agColDef.sortable,
    resizable: agColDef.resizable,
    pinned: agColDef.pinned,
    hidden: agColDef.hide,
    
    // Convert renderers
    cellRenderer: agColDef.cellRenderer,
    cellEditor: mapEditorType(agColDef.cellEditor),
    
    // Convert formatters
    valueFormatter: agColDef.valueFormatter,
    valueGetter: agColDef.valueGetter
  };
}

function mapFilterType(agFilter: string | boolean): string {
  if (typeof agFilter === 'boolean') return 'text';
  
  const filterMap: Record<string, string> = {
    'agTextColumnFilter': 'text',
    'agNumberColumnFilter': 'number',
    'agDateColumnFilter': 'date',
    'agSetColumnFilter': 'set'
  };
  
  return filterMap[agFilter] || 'text';
}

function mapEditorType(agEditor: string): string {
  const editorMap: Record<string, string> = {
    'agTextCellEditor': 'text',
    'agNumberCellEditor': 'number',
    'agDateCellEditor': 'date',
    'agSelectCellEditor': 'select',
    'agLargeTextCellEditor': 'textarea'
  };
  
  return editorMap[agEditor] || 'text';
}
```

## 🆘 Troubleshooting Common Issues

### Grid Not Rendering

```typescript
// Check these common issues:

// 1. Missing height
.grid-container {
  height: 400px; // Always set explicit height
}

// 2. Missing theme import
@import "@ng-ui-lib/theme/styles/blg-grid.css";

// 3. Missing component imports
@Component({
  imports: [Grid], // Must import Grid component
  // ...
})
```

### Performance Issues

```typescript
// Enable performance optimizations
config: GridConfig = {
  virtualScrolling: { enabled: true },
  trackByFn: (index, item) => item.id,
  suppressRowVirtualisation: false
};

// Use OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Data Not Updating

```typescript
// Use signals for reactive updates
data = signal<any[]>([]);

// Update data correctly
this.data.set(newData);        // Replace all data
this.data.update(current => [...current, newItem]); // Add item
```

This cookbook should help you migrate most common ag-Grid scenarios to BLG Grid. For specific issues not covered here, refer to the [main migration guide](./from-ag-grid.md) or [API mapping reference](./ag-grid-api-mapping.md).