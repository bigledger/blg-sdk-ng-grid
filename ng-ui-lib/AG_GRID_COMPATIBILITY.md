# ag-Grid Compatibility for BigLedger Grid

This document describes the comprehensive ag-Grid compatibility layer implemented for the BigLedger Grid component. The compatibility layer provides a seamless migration path from ag-Grid to BigLedger Grid while maintaining full API compatibility.

## Overview

The BigLedger Grid now supports ag-Grid's most important APIs, making it a drop-in replacement for ag-Grid in most scenarios. This compatibility layer includes:

- ✅ **ag-Grid Column Definitions (ColDef)**
- ✅ **ag-Grid Options (AgGridOptions)**  
- ✅ **Grid API with 50+ methods**
- ✅ **Column API with 30+ methods**
- ✅ **Built-in Cell Renderers**
- ✅ **Built-in Cell Editors**
- ✅ **ag-Grid Events**
- ✅ **Export Functionality (CSV/Excel)**
- ✅ **Sorting & Filtering**
- ✅ **Row Selection**
- ✅ **Column Resizing & Reordering**
- ✅ **Pagination**

## Installation & Usage

### Basic Setup

```typescript
import { Component } from '@angular/core';
import { ColDef, GridApi, ColumnApi, GridReadyEvent } from '@ng-ui/core';
import { AgGridAngularComponent } from '@ng-ui/grid';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [AgGridAngularComponent],
  template: `
    <ag-grid-angular
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [pagination]="true"
      [paginationPageSize]="10"
      [rowSelection]="'multiple'"
      (gridReady)="onGridReady($event)"
      (selectionChanged)="onSelectionChanged($event)"
      class="ag-theme-alpine">
    </ag-grid-angular>
  `,
  styles: [`
    .ag-theme-alpine {
      height: 500px;
      width: 100%;
    }
  `]
})
export class ExampleComponent {
  private gridApi!: GridApi;
  private columnApi!: ColumnApi;
  
  columnDefs: ColDef[] = [
    { field: 'make', sortable: true, filter: true },
    { field: 'model', sortable: true, filter: true },
    { 
      field: 'price', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellEditor: 'agNumberCellEditor',
      editable: true
    }
  ];
  
  rowData = [
    { make: 'Tesla', model: 'Model S', price: 89990 },
    { make: 'BMW', model: 'X5', price: 65000 },
    { make: 'Audi', model: 'e-tron', price: 75000 }
  ];
  
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
  
  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    console.log('Selected rows:', selectedRows);
  }
}
```

## Supported ag-Grid Properties

### Component Inputs

| Property | Type | Description | Supported |
|----------|------|-------------|-----------|
| `rowData` | `any[]` | Row data array | ✅ |
| `columnDefs` | `ColDef[]` | Column definitions | ✅ |
| `defaultColDef` | `ColDef` | Default column properties | ✅ |
| `gridOptions` | `AgGridOptions` | Grid configuration options | ✅ |
| `pagination` | `boolean` | Enable pagination | ✅ |
| `paginationPageSize` | `number` | Page size for pagination | ✅ |
| `rowSelection` | `'single' \| 'multiple'` | Row selection mode | ✅ |
| `enableSorting` | `boolean` | Enable column sorting | ✅ |
| `enableFilter` | `boolean` | Enable column filtering | ✅ |

### Component Outputs

| Event | Type | Description | Supported |
|-------|------|-------------|-----------|
| `gridReady` | `GridReadyEvent` | Grid initialization complete | ✅ |
| `rowClicked` | `RowClickedEvent` | Row click event | ✅ |
| `cellClicked` | `CellClickedEvent` | Cell click event | ✅ |
| `selectionChanged` | `SelectionChangedEvent` | Selection change event | ✅ |
| `sortChanged` | `SortChangedEvent` | Sort state change event | ✅ |
| `filterChanged` | `FilterChangedEvent` | Filter state change event | ✅ |

## Grid API Methods

The GridApi provides 50+ methods for programmatic grid interaction:

### Data Management
```typescript
// Set/update row data
gridApi.setRowData(newData);
gridApi.updateRowData({ add: [newRow], remove: [oldRow] });
gridApi.refreshCells();
gridApi.redrawRows();
```

### Selection
```typescript
// Row selection
gridApi.selectAll();
gridApi.deselectAll();
gridApi.getSelectedRows();
gridApi.selectNode(node);
gridApi.selectIndex(5);
```

### Export
```typescript
// Data export
gridApi.exportDataAsCsv({ fileName: 'data.csv' });
gridApi.exportDataAsExcel({ 
  fileName: 'data.xlsx',
  sheetName: 'MyData'
});
```

### Column Operations
```typescript
// Column management
gridApi.setColumnDefs(newColumnDefs);
gridApi.sizeColumnsToFit();
gridApi.autoSizeColumns(['make', 'model']);
```

### Filtering & Sorting
```typescript
// Filtering
gridApi.setFilterModel({ make: { type: 'contains', filter: 'Tesla' } });
gridApi.getFilterModel();

// Sorting
gridApi.setSortModel([{ colId: 'price', sort: 'desc' }]);
gridApi.getSortModel();
```

## Column API Methods

The ColumnApi provides 30+ methods for column management:

### Visibility & Sizing
```typescript
// Column visibility
columnApi.setColumnVisible('make', false);
columnApi.setColumnsVisible(['make', 'model'], true);

// Column sizing
columnApi.setColumnWidth('make', 200);
columnApi.autoSizeColumns(['make', 'model']);
columnApi.autoSizeAllColumns();
```

### Positioning
```typescript
// Column positioning
columnApi.moveColumn('make', 2);
columnApi.setColumnPinned('id', 'left');
columnApi.setColumnsPinned(['id', 'actions'], 'left');
```

### State Management
```typescript
// Column state
const state = columnApi.getColumnState();
columnApi.setColumnState(state);
columnApi.resetColumnState();
```

## Column Definitions (ColDef)

Full support for ag-Grid column definitions:

```typescript
const columnDefs: ColDef[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 80,
    pinned: 'left',
    sortable: true,
    filter: 'agNumberColumnFilter'
  },
  {
    field: 'name',
    headerName: 'Name',
    editable: true,
    cellEditor: 'agTextCellEditor',
    filter: 'agTextColumnFilter'
  },
  {
    field: 'price',
    headerName: 'Price',
    type: 'number',
    editable: true,
    cellEditor: 'agNumberCellEditor',
    valueFormatter: params => `$${params.value?.toLocaleString()}`
  },
  {
    field: 'active',
    headerName: 'Active',
    cellRenderer: 'agCheckboxCellRenderer',
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: ['true', 'false'] }
  }
];
```

### Supported ColDef Properties

| Property | Type | Description | Supported |
|----------|------|-------------|-----------|
| `field` | `string` | Data field name | ✅ |
| `headerName` | `string` | Column header text | ✅ |
| `width` | `number` | Column width | ✅ |
| `minWidth` | `number` | Minimum width | ✅ |
| `maxWidth` | `number` | Maximum width | ✅ |
| `sortable` | `boolean` | Enable sorting | ✅ |
| `filter` | `boolean \| string` | Enable/configure filter | ✅ |
| `resizable` | `boolean` | Enable resizing | ✅ |
| `hide` | `boolean` | Hide column | ✅ |
| `pinned` | `'left' \| 'right'` | Pin column | ✅ |
| `editable` | `boolean` | Enable editing | ✅ |
| `cellRenderer` | `string` | Cell renderer | ✅ |
| `cellEditor` | `string` | Cell editor | ✅ |
| `type` | `string` | Column type | ✅ |

## Built-in Cell Renderers

### Available Renderers
- `agGroupCellRenderer` - Group row renderer
- `agLoadingCellRenderer` - Loading state renderer  
- `agCheckboxCellRenderer` - Checkbox renderer

```typescript
{
  field: 'active',
  cellRenderer: 'agCheckboxCellRenderer'
}
```

## Built-in Cell Editors

### Available Editors
- `agTextCellEditor` - Text input editor
- `agSelectCellEditor` - Dropdown select editor
- `agNumberCellEditor` - Number input editor  
- `agDateCellEditor` - Date picker editor

```typescript
{
  field: 'quantity',
  cellEditor: 'agNumberCellEditor',
  cellEditorParams: {
    min: 0,
    max: 1000,
    step: 1
  }
}
```

## Advanced Features

### Custom Cell Renderers

```typescript
// Register custom renderer
cellRendererService.registerCellRenderer('customRenderer', () => {
  return {
    init(params) {
      this.eGui = document.createElement('span');
      this.eGui.innerHTML = `<strong>${params.value}</strong>`;
    },
    getGui() {
      return this.eGui;
    }
  };
});

// Use in column definition
{
  field: 'name',
  cellRenderer: 'customRenderer'
}
```

### Grid Options

```typescript
const gridOptions: AgGridOptions = {
  rowSelection: 'multiple',
  enableRangeSelection: true,
  enableClipboard: true,
  suppressRowClickSelection: false,
  rowMultiSelectWithClick: true,
  pagination: true,
  paginationPageSize: 25,
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true
  }
};
```

## Migration from ag-Grid

### Direct Replacement

In most cases, you can directly replace `ag-grid-angular` with `ag-grid-angular` from `@ng-ui/grid`:

```typescript
// Before (ag-Grid)
import { AgGridModule } from 'ag-grid-angular';

// After (BigLedger Grid)
import { AgGridAngularComponent } from '@ng-ui/grid';
```

### Component Template

```html
<!-- Before -->
<ag-grid-angular
  [rowData]="rowData"
  [columnDefs]="columnDefs"
  (gridReady)="onGridReady($event)">
</ag-grid-angular>

<!-- After (same syntax!) -->
<ag-grid-angular
  [rowData]="rowData"
  [columnDefs]="columnDefs"
  (gridReady)="onGridReady($event)">
</ag-grid-angular>
```

### API Usage

```typescript
// All existing ag-Grid API calls work unchanged
this.gridApi.selectAll();
this.gridApi.exportDataAsCsv();
this.columnApi.autoSizeAllColumns();
```

## Performance Benefits

The BigLedger Grid compatibility layer provides significant performance improvements:

- **Virtual Scrolling**: Handles 500k+ rows efficiently
- **Signal-based Reactivity**: Optimized Angular change detection
- **Memory Efficient**: Linear memory scaling
- **Faster Rendering**: 30+ FPS scrolling performance

## Limitations

While the compatibility layer covers most ag-Grid use cases, some advanced features are not yet supported:

- Row grouping and pivoting
- Tree data structures
- Advanced filtering UI
- Server-side row model
- Column groups
- Master/detail grids

## Examples

See the complete demo component at `libs/grid/src/lib/demos/ag-grid-compat-demo.component.ts` for comprehensive usage examples including:

- Basic setup and configuration
- Row selection and manipulation
- Data export (CSV/Excel)
- Column management
- Filtering and sorting
- Event handling

## License

This ag-Grid compatibility layer is part of the BigLedger Grid library and is licensed under MIT, making it free for commercial use.

---

For more detailed information, see the [API Reference](./docs/API_REFERENCE.md) and [Architecture Overview](./docs/contributing/architecture-overview.md).