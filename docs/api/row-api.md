# Row API Reference

The Row API describes how rows are managed, selected, and manipulated in the BLG Grid. Rows represent individual data records and support selection, editing, and grouping operations.

## Row Data Structure

Rows in the BLG Grid are plain JavaScript objects where each property corresponds to a column field:

```typescript
interface RowData {
  [key: string]: any; // Dynamic properties based on your data structure
}

// Example row data
const exampleRow = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  age: 30,
  isActive: true,
  createdAt: new Date('2023-01-15'),
  metadata: {
    department: 'Engineering',
    level: 'Senior'
  }
};
```

## Row Selection

### Selection Methods

#### toggleRowSelection(rowIndex: number)
Toggle selection state of a specific row.

```typescript
// Select/deselect row at index 2
grid.toggleRowSelection(2);
```

#### selectAllRows()
Select all rows in the current dataset (respects pagination and filtering).

```typescript
grid.selectAllRows();
```

#### clearAllSelection()
Clear all row selections.

```typescript
grid.clearAllSelection();
```

### Selection Events

#### RowSelectEvent
Emitted when row selection changes.

```typescript
interface RowSelectEvent {
  type: 'row-select';
  data: {
    rowIndex: number;     // Index of the row in current view
    rowData: any;         // Complete row data object
    selected: boolean;    // New selection state
  };
  timestamp: Date;
}

// Usage
onRowSelect(event: RowSelectEvent) {
  console.log(`Row ${event.data.rowIndex} ${event.data.selected ? 'selected' : 'deselected'}`);
  console.log('Row data:', event.data.rowData);
}
```

### Selection Configuration

Selection behavior is controlled through `GridConfig`:

```typescript
const config: GridConfig = {
  selectable: true,                    // Enable row selection
  selectionMode: 'single' | 'multiple' // Selection mode
};
```

**Selection Modes:**
- `single`: Only one row can be selected at a time
- `multiple`: Multiple rows can be selected (default)

## Row State Management

### Reading Row State

#### selectedRows (Signal)
Get currently selected row indices as a Set.

```typescript
const selectedIndices = grid.selectedRows();
console.log('Selected rows:', Array.from(selectedIndices));
```

#### isRowSelected(rowIndex: number)
Check if a specific row is selected.

```typescript
const isSelected = grid.isRowSelected(0); // Check first row
```

### Row Indices

The grid uses different row index contexts:

- **Display Index**: Row position in the current view (after filtering/pagination)
- **Data Index**: Row position in the original dataset

```typescript
// Get actual data index for pagination
private getActualRowIndex(displayedRowIndex: number): number {
  if (this.config.pagination && this.paginationState.mode === 'client') {
    return this.currentPage * this.pageSize + displayedRowIndex;
  }
  return displayedRowIndex;
}
```

## Cell Editing

### Starting Edit Mode

#### startEdit(rowIndex: number, columnId: string, currentValue: any)
Programmatically start editing a cell.

```typescript
// Start editing the 'name' field in row 0
grid.startEdit(0, 'name', 'John Doe');
```

### Edit Events

#### CellEditEvent
Emitted when cell editing is completed.

```typescript
interface CellEditEvent {
  type: 'cell-edit';
  data: {
    rowIndex: number;     // Row index in current view
    columnId: string;     // Column identifier
    oldValue: any;        // Previous cell value
    newValue: any;        // New cell value
    rowData: any;         // Updated row data object
  };
  timestamp: Date;
}

// Usage
onCellEdit(event: CellEditEvent) {
  console.log(`Cell edited in row ${event.data.rowIndex}, column ${event.data.columnId}`);
  console.log(`Changed from "${event.data.oldValue}" to "${event.data.newValue}"`);
  
  // Update your data source
  this.updateDataSource(event.data.rowData);
}
```

### Edit State

#### editingCell (Signal)
Get currently editing cell information.

```typescript
const editing = grid.editingCell();
if (editing) {
  console.log(`Editing row ${editing.rowIndex}, column ${editing.columnId}`);
}
```

#### editValue (Signal)
Get current edit value.

```typescript
const currentEditValue = grid.editValue();
```

## Row Navigation and Focus

### Keyboard Navigation

The grid supports full keyboard navigation between rows and cells:

```typescript
// Navigation keys and their actions:
// ↑↓ - Move between rows
// ←→ - Move between columns
// Enter/Space - Select row or start editing
// F2 - Start editing current cell
// Escape - Cancel editing
// Tab - Move to next editable cell
// Shift+Tab - Move to previous editable cell
```

### Focus Management

#### focusedCell (Signal)
Get currently focused cell coordinates.

```typescript
const focused = grid.focusedCell();
if (focused) {
  console.log(`Focused: row ${focused.row}, column ${focused.col}`);
}
```

#### isCellFocused(rowIndex: number, colIndex: number)
Check if a specific cell is focused.

```typescript
const isFocused = grid.isCellFocused(0, 1);
```

## Row Grouping

When grouping is enabled, rows are organized hierarchically:

### GroupedRow Interface

```typescript
interface GroupedRow {
  type: 'group' | 'data';
  data?: any;              // Original row data (for data rows)
  group?: GroupInfo;       // Group information (for group rows)
  level: number;           // Nesting level
  expanded?: boolean;      // Group expansion state
  parentGroupId?: string;  // Parent group identifier
}
```

### Group Operations

#### toggleGroupExpansion(groupId: string)
Toggle expansion of a specific group.

```typescript
grid.toggleGroupExpansion('category_electronics');
```

#### expandAllGroups()
Expand all group rows.

```typescript
grid.expandAllGroups();
```

#### collapseAllGroups()
Collapse all group rows.

```typescript
grid.collapseAllGroups();
```

## Row Height and Virtual Scrolling

### Row Height Configuration

```typescript
const config: GridConfig = {
  rowHeight: 40,           // Height in pixels
  virtualScrolling: true   // Enable virtual scrolling
};
```

### Dynamic Row Heights

For varying row heights, you can use CSS with row-specific classes:

```typescript
// Column with variable content
{
  id: 'description',
  field: 'description',
  header: 'Description',
  cellRenderer: '<div class="description-cell">{{value}}</div>'
}
```

```css
.description-cell {
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.4;
  padding: 8px;
}

/* Adjust grid row height for specific content */
.ng-ui-lib .grid-row.has-long-content {
  height: auto;
  min-height: 40px;
}
```

## Row Actions and Context Menus

### Adding Row Actions

Use custom cell renderers to add action buttons:

```typescript
{
  id: 'actions',
  field: 'id',
  header: 'Actions',
  type: 'custom',
  cellEditor: false,
  sortable: false,
  filterable: false,
  cellRenderer: `
    <div class="row-actions">
      <button onclick="editRow({{id}})" class="btn btn-sm">Edit</button>
      <button onclick="deleteRow({{id}})" class="btn btn-sm btn-danger">Delete</button>
      <button onclick="duplicateRow({{id}})" class="btn btn-sm">Duplicate</button>
    </div>
  `
}
```

### Context Menu Integration

```typescript
// Component method for context menu
onRowRightClick(event: MouseEvent, rowIndex: number, rowData: any) {
  event.preventDefault();
  this.showContextMenu(event.clientX, event.clientY, rowData);
}

showContextMenu(x: number, y: number, rowData: any) {
  // Show custom context menu
  this.contextMenuData = rowData;
  this.contextMenuX = x;
  this.contextMenuY = y;
  this.contextMenuVisible = true;
}
```

## Row Validation

### Validation During Editing

```typescript
onCellEdit(event: CellEditEvent) {
  const { columnId, newValue, rowData } = event.data;
  
  // Validate the new value
  const isValid = this.validateCellValue(columnId, newValue, rowData);
  
  if (!isValid) {
    // Revert the change or show error
    this.showValidationError(columnId, 'Invalid value');
    return;
  }
  
  // Update data source
  this.updateDataSource(rowData);
}

validateCellValue(columnId: string, value: any, rowData: any): boolean {
  switch (columnId) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'age':
      return typeof value === 'number' && value >= 0 && value <= 150;
    case 'salary':
      return typeof value === 'number' && value >= 0;
    default:
      return true;
  }
}
```

## Row Operations Examples

### Bulk Row Operations

```typescript
class GridComponent {
  @ViewChild(Grid) grid!: Grid;

  // Select all rows
  selectAll() {
    this.grid.selectAllRows();
  }

  // Clear selection
  clearSelection() {
    this.grid.clearAllSelection();
  }

  // Get selected row data
  getSelectedRowData(): any[] {
    const selectedIndices = this.grid.selectedRows();
    const allData = this.grid.gridData();
    
    return Array.from(selectedIndices).map(index => allData[index]);
  }

  // Delete selected rows
  deleteSelectedRows() {
    const selectedData = this.getSelectedRowData();
    
    if (selectedData.length === 0) {
      return;
    }

    if (confirm(`Delete ${selectedData.length} rows?`)) {
      // Remove from data source
      selectedData.forEach(row => {
        const index = this.data.findIndex(item => item.id === row.id);
        if (index >= 0) {
          this.data.splice(index, 1);
        }
      });
      
      // Update grid data
      this.data = [...this.data];
      this.grid.clearAllSelection();
    }
  }

  // Bulk edit selected rows
  bulkEdit(field: string, value: any) {
    const selectedIndices = this.grid.selectedRows();
    
    selectedIndices.forEach(index => {
      const actualIndex = this.getActualDataIndex(index);
      this.data[actualIndex][field] = value;
    });
    
    // Trigger change detection
    this.data = [...this.data];
  }
}
```

### Row Highlighting and Styling

```typescript
// Dynamic row classes based on data
getRowClass(rowData: any, rowIndex: number): string {
  const classes = ['grid-row'];
  
  // Highlight selected rows
  if (this.grid.isRowSelected(rowIndex)) {
    classes.push('selected');
  }
  
  // Conditional styling based on data
  if (rowData.isActive === false) {
    classes.push('inactive-row');
  }
  
  if (rowData.priority === 'high') {
    classes.push('high-priority');
  }
  
  // Alternating row colors
  if (rowIndex % 2 === 0) {
    classes.push('even-row');
  } else {
    classes.push('odd-row');
  }
  
  return classes.join(' ');
}
```

### Row Filtering and Search

```typescript
// Filter rows based on multiple criteria
filterRows(searchTerm: string, filters: Record<string, any>) {
  return this.originalData.filter(row => {
    // Text search across all fields
    const matchesSearch = !searchTerm || 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Column-specific filters
    const matchesFilters = Object.entries(filters).every(([field, filterValue]) => {
      if (!filterValue) return true;
      
      const cellValue = row[field];
      
      // Handle different filter types
      if (typeof filterValue === 'string') {
        return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
      } else if (typeof filterValue === 'number') {
        return cellValue === filterValue;
      } else if (typeof filterValue === 'boolean') {
        return cellValue === filterValue;
      }
      
      return true;
    });
    
    return matchesSearch && matchesFilters;
  });
}
```

## Performance Considerations

### Large Datasets

For optimal performance with large datasets:

```typescript
const config: GridConfig = {
  virtualScrolling: true,    // Essential for 10k+ rows
  rowHeight: 40,            // Fixed height improves performance
  pagination: true,         // Reduce DOM elements
  paginationConfig: {
    pageSize: 100,          // Balance between UX and performance
    mode: 'client'
  }
};
```

### Memory Management

```typescript
// Implement trackBy for change detection optimization
trackByRowId(index: number, row: any): any {
  return row.id || index;
}

// Clean up subscriptions and references
ngOnDestroy() {
  // Clean up any row-related subscriptions
  this.rowSubscriptions?.forEach(sub => sub.unsubscribe());
}
```