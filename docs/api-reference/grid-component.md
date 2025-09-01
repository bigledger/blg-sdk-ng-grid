# Grid Component

The main component for displaying data grids with virtual scrolling, sorting, filtering, and selection capabilities.

## Selector

```typescript
ng-ui-lib
```

## Import

```typescript
import { Grid } from '@ng-ui-lib/grid';
```

## Properties

### Inputs

#### `data`
- **Type:** `any[]`
- **Required:** Yes
- **Description:** Array of data objects to display in the grid
- **Example:**
  ```typescript
  data = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 }
  ];
  ```

#### `columns`
- **Type:** `ColumnDefinition[]`
- **Required:** Yes
- **Description:** Column definitions for the grid
- **Example:**
  ```typescript
  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number' },
    { id: 'name', field: 'name', header: 'Name', type: 'string' },
    { id: 'age', field: 'age', header: 'Age', type: 'number' }
  ];
  ```

#### `config`
- **Type:** `GridConfig`
- **Required:** No
- **Default:** See [GridConfig defaults](./interfaces/grid-config.md#defaults)
- **Description:** Configuration options for grid behavior and appearance
- **Example:**
  ```typescript
  config: GridConfig = {
    rowHeight: 40,
    virtualScrolling: true,
    selectable: true,
    selectionMode: 'multiple'
  };
  ```

### Outputs

#### `gridEvent`
- **Type:** `EventEmitter<GridEventType>`
- **Description:** Emits all grid events (unified event stream)
- **Example:**
  ```typescript
  onGridEvent(event: GridEventType) {
    console.log('Grid event:', event.type, event.data);
  }
  ```

#### `cellClick`
- **Type:** `EventEmitter<CellClickEvent>`
- **Description:** Emitted when a cell is clicked
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

#### `rowSelect`
- **Type:** `EventEmitter<RowSelectEvent>`
- **Description:** Emitted when row selection changes
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

#### `columnSort`
- **Type:** `EventEmitter<ColumnSortEvent>`
- **Description:** Emitted when column sorting changes
- **Event Data:**
  ```typescript
  {
    type: 'column-sort',
    data: {
      columnId: string,
      direction: 'asc' | 'desc' | null
    },
    timestamp: Date
  }
  ```

#### `columnResize`
- **Type:** `EventEmitter<ColumnResizeEvent>`
- **Description:** Emitted when a column is resized
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

### `selectAllRows()`
- **Description:** Selects all visible rows in the grid
- **Returns:** `void`
- **Example:**
  ```typescript
  @ViewChild(Grid) grid!: Grid;
  
  selectAll() {
    this.grid.selectAllRows();
  }
  ```

### `getCellValue(rowData: any, column: ColumnDefinition)`
- **Description:** Gets the display value for a cell
- **Parameters:**
  - `rowData`: The row data object
  - `column`: The column definition
- **Returns:** `any`
- **Example:**
  ```typescript
  const cellValue = this.grid.getCellValue(rowData, columnDef);
  ```

### `isRowSelected(rowIndex: number)`
- **Description:** Checks if a row is currently selected
- **Parameters:**
  - `rowIndex`: The index of the row to check
- **Returns:** `boolean`
- **Example:**
  ```typescript
  const isSelected = this.grid.isRowSelected(0);
  ```

### `getSortDirection(columnId: string)`
- **Description:** Gets the current sort direction for a column
- **Parameters:**
  - `columnId`: The ID of the column
- **Returns:** `'asc' | 'desc' | null`
- **Example:**
  ```typescript
  const sortDir = this.grid.getSortDirection('name');
  ```

## Computed Properties

The Grid component exposes several computed properties for reactive data access:

### `gridData`
- **Type:** `Signal<any[]>`
- **Description:** Processed data with sorting and filtering applied
- **Read-only**

### `gridColumns`
- **Type:** `Signal<ColumnDefinition[]>`
- **Description:** Current column definitions
- **Read-only**

### `gridConfig`
- **Type:** `Signal<GridConfig>`
- **Description:** Current grid configuration
- **Read-only**

### `visibleColumns`
- **Type:** `Signal<ColumnDefinition[]>`
- **Description:** Only columns where visible !== false
- **Read-only**

### `selectedRows`
- **Type:** `Signal<Set<number>>`
- **Description:** Set of selected row indices
- **Read-only**

## Accessibility

The Grid component includes comprehensive accessibility support:

### ARIA Attributes
- `role="grid"` on the main grid container
- `aria-label` configurable via GridConfig
- `aria-rowcount` automatically calculated
- `aria-colcount` automatically calculated
- Column headers have appropriate `aria-sort` attributes

### Keyboard Navigation
- **Arrow Keys:** Navigate between cells
- **Enter/Space:** Toggle row selection
- **Home/End:** Jump to first/last column in row
- **Page Up/Down:** Navigate by pages (10 rows)
- **Tab:** Standard tab order navigation

## Styling

### CSS Classes

The Grid component applies these CSS classes:

```scss
.ng-ui-lib {
  // Main grid container
  &__header {
    // Header row
  }
  
  &__body {
    // Grid body with virtual scrolling
  }
  
  &__row {
    // Individual row
    &--selected {
      // Selected row styling
    }
    
    &--focused {
      // Focused row styling
    }
  }
  
  &__cell {
    // Individual cell
    &--focused {
      // Focused cell styling
    }
    
    &--sortable {
      // Sortable column header
    }
  }
  
  &__footer {
    // Optional footer
  }
}
```

### Theming

Apply themes using the `theme` property in GridConfig:

```typescript
config: GridConfig = {
  theme: 'default' // or 'dark', 'minimal', etc.
};
```

## Examples

### Basic Grid
```typescript
@Component({
  template: `
    <ng-ui-lib 
      [data]="data" 
      [columns]="columns" 
      [config]="config">
    </ng-ui-lib>
  `
})
export class BasicGridComponent {
  data = [
    { id: 1, name: 'Alice', department: 'Engineering' },
    { id: 2, name: 'Bob', department: 'Sales' }
  ];
  
  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number' },
    { id: 'name', field: 'name', header: 'Name' },
    { id: 'dept', field: 'department', header: 'Department' }
  ];
  
  config: GridConfig = {
    selectable: true,
    sortable: true
  };
}
```

### Event Handling
```typescript
@Component({
  template: `
    <ng-ui-lib 
      [data]="data" 
      [columns]="columns"
      (cellClick)="onCellClick($event)"
      (rowSelect)="onRowSelect($event)"
      (columnSort)="onColumnSort($event)">
    </ng-ui-lib>
  `
})
export class EventGridComponent {
  onCellClick(event: CellClickEvent) {
    console.log(`Clicked cell in row ${event.data.rowIndex}, column ${event.data.columnId}`);
  }
  
  onRowSelect(event: RowSelectEvent) {
    console.log(`Row ${event.data.rowIndex} ${event.data.selected ? 'selected' : 'deselected'}`);
  }
  
  onColumnSort(event: ColumnSortEvent) {
    console.log(`Column ${event.data.columnId} sorted ${event.data.direction}`);
  }
}
```

### Virtual Scrolling with Large Dataset
```typescript
@Component({
  template: `
    <div style="height: 500px;">
      <ng-ui-lib 
        [data]="largeDataset" 
        [columns]="columns" 
        [config]="config">
      </ng-ui-lib>
    </div>
  `
})
export class VirtualScrollGridComponent {
  largeDataset = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`
  }));
  
  config: GridConfig = {
    virtualScrolling: true,
    rowHeight: 40,
    selectable: true
  };
}
```

## Performance Considerations

### Virtual Scrolling
- Enable for datasets > 1000 rows
- Requires consistent `rowHeight`
- Significantly improves rendering performance

### Change Detection
- Uses OnPush change detection strategy
- Updates efficiently with Angular signals
- Minimal re-renders on data changes

### Memory Usage
- Virtual scrolling reduces DOM nodes
- Only visible rows are rendered
- Efficient memory usage for large datasets