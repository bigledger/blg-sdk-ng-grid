# Grid Component API Reference

The `ng-ui-lib` component is the main entry point for the BLG Grid library. It provides a high-performance, feature-rich data grid with virtual scrolling, sorting, filtering, selection, grouping, and export capabilities.

## Component Selector

```typescript
<ng-ui-lib 
  [data]="gridData" 
  [columns]="columnDefinitions" 
  [config]="gridConfig"
  (gridEvent)="onGridEvent($event)"
  (cellClick)="onCellClick($event)"
  (rowSelect)="onRowSelect($event)"
  (columnSort)="onColumnSort($event)"
  (columnResize)="onColumnResize($event)">
</ng-ui-lib>
```

## Input Properties

### data
- **Type:** `any[]`
- **Description:** Array of row objects that provide the data for the grid
- **Required:** Yes
- **Example:**
```typescript
gridData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, active: false }
];
```

### columns
- **Type:** `ColumnDefinition[]`
- **Description:** Array of column definitions that define the structure and behavior of grid columns
- **Required:** Yes
- **Example:**
```typescript
columnDefinitions: ColumnDefinition[] = [
  { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
  { id: 'name', field: 'name', header: 'Name', type: 'string', sortable: true },
  { id: 'email', field: 'email', header: 'Email', type: 'string', filterable: true },
  { id: 'age', field: 'age', header: 'Age', type: 'number', sortable: true },
  { id: 'active', field: 'active', header: 'Active', type: 'boolean' }
];
```

### config
- **Type:** `GridConfig`
- **Description:** Configuration object that controls grid behavior and features
- **Required:** No (uses defaults)
- **Default:** 
```typescript
{
  totalRows: 0,
  rowHeight: 40,
  virtualScrolling: true,
  sortable: true,
  filterable: true,
  selectable: true,
  selectionMode: 'multiple',
  resizable: true,
  reorderable: true,
  showFooter: false
}
```
- **Example:**
```typescript
gridConfig: GridConfig = {
  rowHeight: 45,
  virtualScrolling: true,
  sortable: true,
  filterable: true,
  selectable: true,
  selectionMode: 'single',
  resizable: true,
  reorderable: true,
  showFooter: true,
  pagination: true,
  paginationConfig: {
    pageSize: 50,
    pageSizeOptions: [25, 50, 100],
    showPageSizeSelector: true,
    showPageInfo: true
  },
  grouping: true,
  export: true
};
```

## Output Events

### gridEvent
- **Type:** `EventEmitter<GridEventType>`
- **Description:** Emits all grid events for centralized handling
- **Event Types:** `CellClickEvent | RowSelectEvent | ColumnSortEvent | ColumnResizeEvent | PaginationEvent | CellEditEvent`

### cellClick
- **Type:** `EventEmitter<CellClickEvent>`
- **Description:** Emits when a cell is clicked
- **Event Data:**
```typescript
{
  type: 'cell-click',
  data: {
    rowIndex: number,
    columnId: string,
    value: any,
    rowData: any
  },
  timestamp: Date
}
```

### rowSelect
- **Type:** `EventEmitter<RowSelectEvent>`
- **Description:** Emits when row selection changes
- **Event Data:**
```typescript
{
  type: 'row-select',
  data: {
    rowIndex: number,
    rowData: any,
    selected: boolean
  },
  timestamp: Date
}
```

### columnSort
- **Type:** `EventEmitter<ColumnSortEvent>`
- **Description:** Emits when column sorting changes
- **Event Data:**
```typescript
{
  type: 'column-sort',
  data: {
    columnId: string,
    direction: 'asc' | 'desc' | null,
    sortState: { columnId: string; direction: 'asc' | 'desc'; order: number }[] | null
  },
  timestamp: Date
}
```

### columnResize
- **Type:** `EventEmitter<ColumnResizeEvent>`
- **Description:** Emits when a column is resized
- **Event Data:**
```typescript
{
  type: 'column-resize',
  data: {
    columnId: string,
    width: number,
    oldWidth: number
  },
  timestamp: Date
}
```

## Public Methods

### selectAllRows()
- **Description:** Selects all rows in the current data set
- **Returns:** `void`
- **Example:**
```typescript
@ViewChild(Grid) grid!: Grid;

selectAll() {
  this.grid.selectAllRows();
}
```

### clearAllSelection()
- **Description:** Clears all row selections
- **Returns:** `void`
- **Example:**
```typescript
clearSelection() {
  this.grid.clearAllSelection();
}
```

### exportToCsv(filename?: string)
- **Description:** Export visible data to CSV format
- **Parameters:**
  - `filename` (optional): Custom filename without extension
- **Returns:** `void`
- **Example:**
```typescript
exportData() {
  this.grid.exportToCsv('my-export');
}
```

### exportToExcel(filename?: string)
- **Description:** Export visible data to Excel format
- **Parameters:**
  - `filename` (optional): Custom filename without extension
- **Returns:** `void`
- **Example:**
```typescript
exportToExcel() {
  this.grid.exportToExcel('my-excel-export');
}
```

### expandAllGroups()
- **Description:** Expand all groups in grouped data
- **Returns:** `void`
- **Example:**
```typescript
expandAll() {
  this.grid.expandAllGroups();
}
```

### collapseAllGroups()
- **Description:** Collapse all groups in grouped data
- **Returns:** `void`
- **Example:**
```typescript
collapseAll() {
  this.grid.collapseAllGroups();
}
```

### goToPage(page: number)
- **Description:** Navigate to a specific page (pagination)
- **Parameters:**
  - `page`: Zero-based page index
- **Returns:** `void`
- **Example:**
```typescript
navigateToPage(pageIndex: number) {
  this.grid.goToPage(pageIndex);
}
```

### goToNextPage()
- **Description:** Navigate to the next page
- **Returns:** `void`

### goToPreviousPage()
- **Description:** Navigate to the previous page
- **Returns:** `void`

## Computed Properties (Read-only)

### gridData
- **Type:** `Signal<any[]>`
- **Description:** Processed grid data with filtering, sorting, grouping, and pagination applied

### gridColumns
- **Type:** `Signal<ColumnDefinition[]>`
- **Description:** Current column definitions

### visibleColumns
- **Type:** `Signal<ColumnDefinition[]>`
- **Description:** Only columns that are visible (visible !== false)

### selectedRows
- **Type:** `Signal<Set<number>>`
- **Description:** Set of selected row indices

### sortState
- **Type:** `Signal<{ columnId: string; direction: 'asc' | 'desc'; order: number }[] | null>`
- **Description:** Current sort state for multi-column sorting

### filterState
- **Type:** `Signal<Record<string, any>>`
- **Description:** Current filter values by column ID

### isGrouped
- **Type:** `Signal<boolean>`
- **Description:** Whether the grid is currently grouped

### currentPage
- **Type:** `Signal<number>`
- **Description:** Current page index (zero-based)

### totalPages
- **Type:** `Signal<number>`
- **Description:** Total number of pages

## Accessibility Features

The grid component includes comprehensive accessibility support:

- **ARIA Roles:** Grid container uses `role="grid"` with proper row and cell roles
- **ARIA Labels:** Descriptive labels for screen readers
- **ARIA Attributes:** 
  - `aria-rowcount`: Total number of rows
  - `aria-colcount`: Total number of columns
  - `aria-sort`: Column sort state (ascending/descending/none)
- **Keyboard Navigation:** Full keyboard support with arrow keys, Tab, Enter, F2, Home, End, Page Up/Down
- **Focus Management:** Visual focus indicators and proper tab order

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow Keys | Navigate between cells |
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter | Select row or start cell editing |
| Space | Toggle row selection |
| F2 | Start cell editing |
| Escape | Cancel cell editing |
| Home | Move to first cell in row (Ctrl+Home: first cell in grid) |
| End | Move to last cell in row (Ctrl+End: last cell in grid) |
| Page Up/Down | Navigate by pages |
| Delete/Backspace | Clear cell content and start editing |

## Performance Features

- **Virtual Scrolling:** Handles 100,000+ rows efficiently
- **Signal-based Reactivity:** Optimal change detection with Angular Signals
- **Lazy Loading:** Only renders visible rows
- **Optimized Sorting/Filtering:** Efficient algorithms for large datasets
- **Memory Management:** Automatic cleanup of resources

## Usage Examples

### Basic Grid Setup

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui/core';

@Component({
  selector: 'app-basic-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <ng-ui-lib 
      [data]="data" 
      [columns]="columns" 
      [config]="config"
      (cellClick)="onCellClick($event)"
      (rowSelect)="onRowSelect($event)">
    </ng-ui-lib>
  `
})
export class BasicGridComponent {
  data = [
    { id: 1, name: 'John Doe', age: 30, active: true },
    { id: 2, name: 'Jane Smith', age: 25, active: false }
  ];

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
    { id: 'name', field: 'name', header: 'Name', type: 'string', sortable: true },
    { id: 'age', field: 'age', header: 'Age', type: 'number', sortable: true },
    { id: 'active', field: 'active', header: 'Active', type: 'boolean' }
  ];

  config: GridConfig = {
    selectable: true,
    sortable: true,
    filterable: true
  };

  onCellClick(event: CellClickEvent) {
    console.log('Cell clicked:', event);
  }

  onRowSelect(event: RowSelectEvent) {
    console.log('Row selection changed:', event);
  }
}
```

### Advanced Grid with All Features

```typescript
@Component({
  selector: 'app-advanced-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <ng-ui-lib 
      [data]="data" 
      [columns]="columns" 
      [config]="config"
      (gridEvent)="onGridEvent($event)">
    </ng-ui-lib>
  `
})
export class AdvancedGridComponent {
  @ViewChild(Grid) grid!: Grid;

  config: GridConfig = {
    virtualScrolling: true,
    sortable: true,
    filterable: true,
    selectable: true,
    selectionMode: 'multiple',
    resizable: true,
    reorderable: true,
    pagination: true,
    paginationConfig: {
      pageSize: 50,
      pageSizeOptions: [25, 50, 100, 200],
      showPageSizeSelector: true,
      showPageInfo: true
    },
    grouping: true,
    groupingConfig: {
      expandedByDefault: false,
      showGroupCount: true,
      aggregations: {
        'price': ['sum', 'avg'],
        'quantity': ['sum', 'count']
      }
    },
    export: true,
    exportConfig: {
      formats: ['csv', 'excel'],
      defaultFilename: 'grid-export',
      includeHeaders: true,
      dataScope: 'visible'
    }
  };

  onGridEvent(event: GridEventType) {
    switch (event.type) {
      case 'cell-click':
        this.handleCellClick(event);
        break;
      case 'row-select':
        this.handleRowSelect(event);
        break;
      case 'column-sort':
        this.handleColumnSort(event);
        break;
      case 'pagination':
        this.handlePagination(event);
        break;
    }
  }

  exportToExcel() {
    this.grid.exportToExcel('advanced-export');
  }

  selectAllRows() {
    this.grid.selectAllRows();
  }
}
```