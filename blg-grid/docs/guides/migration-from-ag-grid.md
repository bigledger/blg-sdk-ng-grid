# Migration Guide: From ag-Grid to BlgGrid

Complete guide for migrating from ag-Grid to BlgGrid, including API mappings, feature comparisons, and step-by-step migration strategies.

## Overview

BlgGrid is designed to be a modern, Angular-native alternative to ag-Grid with improved performance, better TypeScript support, and Angular Signals integration. This guide will help you migrate your existing ag-Grid implementation smoothly.

## Quick Comparison

| Feature | ag-Grid | BlgGrid |
|---------|---------|---------|
| Framework | Framework agnostic | Angular-native |
| Data Binding | Property-based | Angular Signals |
| Performance | Good | Optimized for Angular |
| TypeScript | Community types | First-class support |
| Bundle Size | Large (~500KB) | Smaller (~150KB) |
| Licensing | Commercial features require license | Open source |
| Virtual Scrolling | ✅ | ✅ |
| Column Operations | ✅ | ✅ |
| Row Selection | ✅ | ✅ |
| Filtering | ✅ | ✅ |
| Sorting | ✅ | ✅ |

## Installation Migration

### Remove ag-Grid
```bash
# Remove ag-Grid packages
npm uninstall ag-grid-angular ag-grid-community ag-grid-enterprise

# Remove from angular.json styles (if applicable)
# Remove from component imports
```

### Install BlgGrid
```bash
# Install BlgGrid packages
npm install @blg-grid/core @blg-grid/grid @blg-grid/theme
```

## API Migration Mapping

### Component Selector

**ag-Grid:**
```html
<ag-grid-angular></ag-grid-angular>
```

**BlgGrid:**
```html
<blg-grid></blg-grid>
```

### Basic Properties

| ag-Grid Property | BlgGrid Property | Notes |
|------------------|------------------|-------|
| `[rowData]` | `[data]` | Direct replacement |
| `[columnDefs]` | `[columns]` | Similar structure with some differences |
| `[gridOptions]` | `[config]` | Consolidated configuration object |
| `[defaultColDef]` | N/A | Use individual column properties |
| `[rowHeight]` | `[config]="{ rowHeight: 40 }"` | Moved to config object |

### Column Definitions

**ag-Grid:**
```typescript
columnDefs = [
  {
    headerName: 'Name',
    field: 'name',
    width: 200,
    sortable: true,
    filter: true,
    resizable: true
  }
];
```

**BlgGrid:**
```typescript
columns: ColumnDefinition[] = [
  {
    id: 'name',           // New: required unique ID
    field: 'name',        // Same
    header: 'Name',       // headerName → header
    width: 200,           // Same
    sortable: true,       // Same
    filterable: true,     // filter → filterable
    resizable: true       // Same
  }
];
```

### Grid Configuration

**ag-Grid:**
```typescript
gridOptions = {
  rowSelection: 'multiple',
  enableSorting: true,
  enableFilter: true,
  enableColResize: true,
  animateRows: true,
  rowHeight: 40
};
```

**BlgGrid:**
```typescript
config: GridConfig = {
  selectable: true,           // rowSelection: 'multiple' → selectable + selectionMode
  selectionMode: 'multiple',
  sortable: true,             // enableSorting → sortable
  filterable: true,           // enableFilter → filterable
  resizable: true,            // enableColResize → resizable
  rowHeight: 40,              // Same
  virtualScrolling: true      // New: explicit virtual scrolling control
};
```

## Step-by-Step Migration

### Step 1: Component Structure Migration

**Before (ag-Grid):**
```typescript
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [AgGridAngular],
  template: `
    <ag-grid-angular
      class="ag-theme-alpine"
      style="height: 500px;"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [gridOptions]="gridOptions"
      (rowSelected)="onRowSelected($event)"
      (cellClicked)="onCellClicked($event)">
    </ag-grid-angular>
  `
})
export class DataGridComponent {
  rowData = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' }
  ];

  columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'id', width: 80 },
    { headerName: 'Name', field: 'name', sortable: true, filter: true },
    { headerName: 'Age', field: 'age', width: 100, sortable: true },
    { headerName: 'Email', field: 'email', sortable: true, filter: true }
  ];

  gridOptions: GridOptions = {
    rowSelection: 'multiple',
    enableSorting: true,
    enableFilter: true,
    rowHeight: 40
  };

  onRowSelected(event: any) {
    console.log('Row selected:', event);
  }

  onCellClicked(event: any) {
    console.log('Cell clicked:', event);
  }
}
```

**After (BlgGrid):**
```typescript
import { Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div style="height: 500px;">
      <blg-grid
        [data]="data"
        [columns]="columns"
        [config]="config"
        (rowSelect)="onRowSelected($event)"
        (cellClick)="onCellClicked($event)">
      </blg-grid>
    </div>
  `
})
export class DataGridComponent {
  data = [  // rowData → data
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' }
  ];

  columns: ColumnDefinition[] = [  // columnDefs → columns
    { 
      id: 'id',           // New: required
      field: 'id', 
      header: 'ID',       // headerName → header
      type: 'number',     // New: explicit type
      width: 80 
    },
    { 
      id: 'name', 
      field: 'name', 
      header: 'Name', 
      type: 'string',     // New: explicit type
      sortable: true, 
      filterable: true    // filter → filterable
    },
    { 
      id: 'age', 
      field: 'age', 
      header: 'Age', 
      type: 'number',     // New: explicit type
      width: 100, 
      sortable: true 
    },
    { 
      id: 'email', 
      field: 'email', 
      header: 'Email', 
      type: 'string',     // New: explicit type
      sortable: true, 
      filterable: true 
    }
  ];

  config: GridConfig = {  // gridOptions → config
    selectable: true,           // rowSelection → selectable
    selectionMode: 'multiple',  // New: explicit selection mode
    sortable: true,             // enableSorting → sortable
    filterable: true,           // enableFilter → filterable
    rowHeight: 40,              // Same
    virtualScrolling: true      // New: explicit virtual scrolling
  };

  onRowSelected(event: any) {   // Event structure is different
    console.log('Row selected:', event.data);
  }

  onCellClicked(event: any) {   // Event structure is different
    console.log('Cell clicked:', event.data);
  }
}
```

### Step 2: Event Handling Migration

**ag-Grid Events:**
```typescript
// ag-Grid event handlers
onRowSelected(event: RowSelectedEvent) {
  const selectedRows = this.gridApi.getSelectedRows();
  console.log('Selected rows:', selectedRows);
}

onCellClicked(event: CellClickedEvent) {
  console.log('Clicked cell:', event.value, 'in row:', event.data);
}

onSortChanged(event: SortChangedEvent) {
  const sortModel = this.gridApi.getSortModel();
  console.log('Sort changed:', sortModel);
}
```

**BlgGrid Events:**
```typescript
// BlgGrid event handlers
onRowSelected(event: RowSelectEvent) {
  console.log('Selected row:', event.data.rowData);
  // Access all selected rows via GridStateService if needed
}

onCellClicked(event: CellClickEvent) {
  console.log('Clicked cell:', event.data.value, 'in row:', event.data.rowData);
}

onColumnSort(event: ColumnSortEvent) {
  console.log('Sort changed:', event.data.columnId, event.data.direction);
}
```

### Step 3: Advanced Features Migration

#### Custom Cell Renderers

**ag-Grid:**
```typescript
// ag-Grid cell renderer
@Component({
  selector: 'app-status-renderer',
  template: `
    <span [class]="'status-' + params.value.toLowerCase()">
      {{ params.value }}
    </span>
  `
})
export class StatusRendererComponent implements ICellRendererAngularComp {
  params: any;
  
  agInit(params: any): void {
    this.params = params;
  }
  
  refresh(): boolean {
    return false;
  }
}

// Column definition
{
  headerName: 'Status',
  field: 'status',
  cellRenderer: StatusRendererComponent
}
```

**BlgGrid:**
```typescript
// BlgGrid cell renderer
@Component({
  selector: 'app-status-renderer',
  template: `
    <span [class]="'status-' + value.toLowerCase()">
      {{ value }}
    </span>
  `
})
export class StatusRendererComponent {
  @Input() value: any;
  @Input() rowData: any;
  @Input() columnDef: ColumnDefinition;
}

// Column definition
{
  id: 'status',
  field: 'status',
  header: 'Status',
  cellRenderer: 'app-status-renderer'  // Component selector
}
```

#### Server-Side Data

**ag-Grid:**
```typescript
// ag-Grid server-side datasource
createServerSideDataSource() {
  return {
    getRows: (params: any) => {
      this.dataService.getData(params.request)
        .subscribe(result => {
          params.success({
            rowData: result.data,
            rowCount: result.totalCount
          });
        });
    }
  };
}

ngOnInit() {
  this.gridOptions.serverSideStoreType = 'partial';
  this.gridOptions.datasource = this.createServerSideDataSource();
}
```

**BlgGrid:**
```typescript
// BlgGrid server-side data (using observables)
data$ = this.dataService.getData().pipe(
  map(result => result.data)
);

// Template
template: `
  <blg-grid 
    [data]="data$ | async || []" 
    [columns]="columns" 
    [config]="config">
  </blg-grid>
`
```

## Feature Migration Guide

### Column Operations

**ag-Grid Column API:**
```typescript
// Hide/show columns
this.columnApi.setColumnVisible('name', false);

// Resize column
this.columnApi.setColumnWidth('name', 200);

// Move column
this.columnApi.moveColumn('name', 2);
```

**BlgGrid (using GridStateService):**
```typescript
constructor(private gridState: GridStateService) {}

// Hide/show columns
this.gridState.updateColumnVisibility('name', false);

// Resize column
this.gridState.updateColumnWidth('name', 200);

// Column reordering is handled via drag & drop in the UI
```

### Row Selection

**ag-Grid:**
```typescript
// Select all rows
this.gridApi.selectAll();

// Get selected rows
const selected = this.gridApi.getSelectedRows();

// Clear selection
this.gridApi.deselectAll();
```

**BlgGrid:**
```typescript
@ViewChild(Grid) grid!: Grid;

// Select all rows
this.grid.selectAllRows();

// Get selected rows (via state service)
const selected = this.gridState.selectedRows();

// Clear selection
this.gridState.clearSelection();
```

### Filtering

**ag-Grid:**
```typescript
// Set filter
this.gridApi.setFilterModel({
  name: {
    type: 'contains',
    filter: 'John'
  }
});

// Clear filters
this.gridApi.setFilterModel({});
```

**BlgGrid:**
```typescript
// Set filter
this.gridState.updateFilter('name', 'John');

// Clear filters
this.gridState.clearFilters();
```

## Advanced Migration Scenarios

### Enterprise Features

If you're using ag-Grid Enterprise features, here's how to handle them:

#### Row Grouping
```typescript
// ag-Grid Enterprise
columnDefs = [
  { field: 'country', rowGroup: true },
  { field: 'sport' },
  { field: 'gold', aggFunc: 'sum' }
];

// BlgGrid approach (custom implementation needed)
// Group data pre-processing or use Angular pipes
data$ = this.rawData$.pipe(
  map(data => this.groupByCountry(data))
);
```

#### Pivoting
```typescript
// ag-Grid Enterprise
columnDefs = [
  { field: 'country', pivot: true },
  { field: 'year', rowGroup: true },
  { field: 'gold', aggFunc: 'sum' }
];

// BlgGrid approach (custom pivot implementation)
data$ = this.rawData$.pipe(
  map(data => this.pivotData(data))
);
```

### Performance Optimization Migration

**ag-Grid:**
```typescript
gridOptions = {
  rowBuffer: 10,
  rowSelection: 'multiple',
  rowMultiSelectWithClick: true,
  suppressRowClickSelection: false,
  animateRows: true
};
```

**BlgGrid:**
```typescript
config: GridConfig = {
  virtualScrolling: true,    // Equivalent to row buffering
  rowHeight: 40,             // Consistent height for performance
  selectionMode: 'multiple', // Row multi-select
  theme: 'minimal'           // Reduces styling overhead
};
```

## Common Migration Issues

### 1. Event Object Differences

**Issue:** Event objects have different structures

**Solution:**
```typescript
// ag-Grid
onCellClicked(event: CellClickedEvent) {
  const value = event.value;
  const rowData = event.data;
  const column = event.colDef.field;
}

// BlgGrid equivalent
onCellClicked(event: CellClickEvent) {
  const value = event.data.value;
  const rowData = event.data.rowData;
  const column = event.data.columnId;
}
```

### 2. API Method Differences

**Issue:** Different API methods for grid operations

**Solution:** Create a wrapper service:
```typescript
@Injectable()
export class GridMigrationService {
  constructor(private gridState: GridStateService) {}
  
  // ag-Grid style methods mapped to BlgGrid
  selectAll() {
    // Implementation using BlgGrid APIs
  }
  
  getSelectedRows() {
    return Array.from(this.gridState.selectedRows());
  }
  
  setColumnVisible(columnId: string, visible: boolean) {
    this.gridState.updateColumnVisibility(columnId, visible);
  }
}
```

### 3. Theme Migration

**Issue:** ag-Grid themes don't work with BlgGrid

**Solution:**
```typescript
// Remove ag-Grid theme classes
// OLD: class="ag-theme-alpine"

// Add BlgGrid theme configuration
config: GridConfig = {
  theme: 'default' // or 'dark', 'minimal', etc.
};
```

## Migration Checklist

### Pre-Migration
- [ ] Audit current ag-Grid features in use
- [ ] Identify custom cell renderers and editors
- [ ] Document current event handlers
- [ ] List any enterprise features being used
- [ ] Backup current implementation

### During Migration
- [ ] Install BlgGrid packages
- [ ] Update component imports
- [ ] Convert column definitions
- [ ] Migrate grid configuration
- [ ] Update event handlers
- [ ] Convert custom renderers
- [ ] Test basic functionality

### Post-Migration
- [ ] Verify all features work correctly
- [ ] Performance testing
- [ ] Update unit tests
- [ ] Update documentation
- [ ] Remove ag-Grid dependencies
- [ ] Clean up unused code

### Validation Steps
- [ ] Data displays correctly
- [ ] Sorting works on all columns
- [ ] Filtering functions properly
- [ ] Row selection behaves as expected
- [ ] Custom renderers display correctly
- [ ] Events fire as expected
- [ ] Performance is acceptable
- [ ] Responsive design works
- [ ] Accessibility features function

## Migration Tools

### Automated Migration Script

Create a script to help with basic migration:

```typescript
// migration-helper.ts
export class AgGridToBlgGridMigrator {
  
  static convertColumnDefs(agColumnDefs: ColDef[]): ColumnDefinition[] {
    return agColumnDefs.map((colDef, index) => ({
      id: colDef.field || `col-${index}`,
      field: colDef.field!,
      header: colDef.headerName!,
      type: this.inferColumnType(colDef),
      width: colDef.width,
      sortable: colDef.sortable,
      filterable: colDef.filter !== false,
      resizable: colDef.resizable,
      visible: !colDef.hide
    }));
  }
  
  static convertGridOptions(gridOptions: GridOptions): GridConfig {
    return {
      selectable: !!gridOptions.rowSelection,
      selectionMode: gridOptions.rowSelection === 'multiple' ? 'multiple' : 'single',
      sortable: gridOptions.enableSorting !== false,
      filterable: gridOptions.enableFilter !== false,
      resizable: gridOptions.enableColResize !== false,
      rowHeight: gridOptions.rowHeight || 40,
      virtualScrolling: true
    };
  }
  
  private static inferColumnType(colDef: ColDef): string {
    // Logic to infer column type from ag-Grid column def
    if (colDef.cellDataType === 'number') return 'number';
    if (colDef.cellDataType === 'boolean') return 'boolean';
    if (colDef.cellDataType === 'date') return 'date';
    return 'string';
  }
}
```

### Testing Migration

```typescript
// Create side-by-side comparison component for testing
@Component({
  template: `
    <div class="migration-test">
      <div class="old-grid">
        <h3>ag-Grid (Original)</h3>
        <!-- ag-Grid implementation -->
      </div>
      <div class="new-grid">
        <h3>BlgGrid (Migrated)</h3>
        <!-- BlgGrid implementation -->
      </div>
    </div>
  `,
  styles: [`
    .migration-test {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      height: 600px;
    }
  `]
})
export class MigrationTestComponent {
  // Test both implementations side by side
}
```

## Support and Resources

### Getting Help

1. **Documentation**: Refer to BlgGrid documentation for detailed API information
2. **Community**: Join our Discord/GitHub discussions for migration questions
3. **Professional Services**: Consider professional migration services for complex applications

### Migration Support Tools

- **Comparison Tool**: Side-by-side feature comparison
- **Code Generator**: Generate BlgGrid code from ag-Grid configuration
- **Migration Checklist**: Interactive checklist for tracking progress

## Conclusion

Migrating from ag-Grid to BlgGrid involves updating your component structure, converting configuration objects, and adapting to the new event system. While the process requires attention to detail, BlgGrid's Angular-native design and improved TypeScript support make it a worthwhile upgrade.

Key benefits after migration:
- Better Angular integration
- Improved performance with signals
- Smaller bundle size
- Enhanced TypeScript support
- Modern Angular patterns

For complex migrations or enterprise applications, consider a gradual migration approach, migrating one grid at a time to minimize risk and validate functionality incrementally.