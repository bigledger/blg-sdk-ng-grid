# Selection API Reference

The Selection API manages row and cell selection in the BLG Grid, providing both single and multi-selection capabilities with keyboard and mouse interaction support.

## Selection Configuration

### GridConfig Selection Properties

```typescript
interface GridConfig {
  selectable?: boolean;                    // Enable/disable selection
  selectionMode?: 'single' | 'multiple';  // Selection mode
}

// Example configuration
const config: GridConfig = {
  selectable: true,        // Enable row selection
  selectionMode: 'multiple' // Allow multiple row selection
};
```

## Selection Modes

### Single Selection Mode
- Only one row can be selected at a time
- Selecting a new row automatically deselects the previous one
- Useful for master-detail views or when only one item can be active

```typescript
const singleSelectionConfig: GridConfig = {
  selectable: true,
  selectionMode: 'single'
};
```

### Multiple Selection Mode (Default)
- Multiple rows can be selected simultaneously
- Supports Ctrl/Cmd+Click for individual selection
- Supports Shift+Click for range selection
- Supports Select All functionality

```typescript
const multipleSelectionConfig: GridConfig = {
  selectable: true,
  selectionMode: 'multiple'
};
```

## Selection Methods

### Core Selection Methods

#### toggleRowSelection(rowIndex: number): void
Toggle the selection state of a specific row.

```typescript
// Toggle selection for row at index 2
grid.toggleRowSelection(2);
```

#### selectAllRows(): void
Select all rows in the current dataset (respects filtering and pagination).

```typescript
// Select all visible rows
grid.selectAllRows();
```

#### clearAllSelection(): void
Clear all row selections.

```typescript
// Clear all selections
grid.clearAllSelection();
```

## Selection State

### Reading Selection State

#### selectedRows: Signal<Set<number>>
Reactive signal containing indices of currently selected rows.

```typescript
// Get selected row indices
const selectedIndices = grid.selectedRows();
console.log('Selected rows:', Array.from(selectedIndices));

// React to selection changes
effect(() => {
  const selected = grid.selectedRows();
  console.log(`${selected.size} rows selected`);
});
```

#### isRowSelected(rowIndex: number): boolean
Check if a specific row is selected.

```typescript
const isSelected = grid.isRowSelected(0);
if (isSelected) {
  console.log('First row is selected');
}
```

### Selection Helper Methods

```typescript
class GridComponent {
  @ViewChild(Grid) grid!: Grid;

  // Get count of selected rows
  getSelectedCount(): number {
    return this.grid.selectedRows().size;
  }

  // Check if any rows are selected
  hasSelection(): boolean {
    return this.grid.selectedRows().size > 0;
  }

  // Check if all visible rows are selected
  areAllRowsSelected(): boolean {
    const selectedCount = this.grid.selectedRows().size;
    const totalRows = this.grid.gridData().length;
    return selectedCount === totalRows && totalRows > 0;
  }

  // Get selected row data
  getSelectedRowData(): any[] {
    const selectedIndices = this.grid.selectedRows();
    const allData = this.grid.gridData();
    return Array.from(selectedIndices).map(index => allData[index]);
  }
}
```

## Selection Events

### RowSelectEvent
Emitted when row selection changes.

```typescript
interface RowSelectEvent {
  type: 'row-select';
  data: {
    rowIndex: number;     // Index of the affected row
    rowData: any;         // Complete row data
    selected: boolean;    // New selection state
  };
  timestamp: Date;        // Event timestamp
}

// Event handler
onRowSelect(event: RowSelectEvent) {
  const { rowIndex, rowData, selected } = event.data;
  
  if (selected) {
    console.log(`Row ${rowIndex} selected:`, rowData);
  } else {
    console.log(`Row ${rowIndex} deselected:`, rowData);
  }
  
  // Update UI or perform actions based on selection
  this.updateSelectionUI();
}
```

### Selection Event Patterns

```typescript
@Component({
  template: `
    <blg-grid 
      [data]="data"
      [columns]="columns"
      [config]="config"
      (rowSelect)="onRowSelect($event)"
      (gridEvent)="onGridEvent($event)">
    </blg-grid>
    
    <div class="selection-info">
      Selected: {{getSelectedCount()}} of {{data.length}} rows
    </div>
  `
})
export class SelectionExampleComponent {
  @ViewChild(Grid) grid!: Grid;

  onRowSelect(event: RowSelectEvent) {
    // Handle individual selection changes
    this.logSelectionChange(event);
    this.updateSelectionDependentFeatures();
  }

  onGridEvent(event: GridEventType) {
    if (event.type === 'row-select') {
      // Alternative way to handle selection events
      this.handleSelectionEvent(event as RowSelectEvent);
    }
  }

  private logSelectionChange(event: RowSelectEvent) {
    const action = event.data.selected ? 'Selected' : 'Deselected';
    console.log(`${action} row:`, event.data.rowData);
  }
}
```

## Keyboard Selection

### Keyboard Shortcuts

| Key Combination | Action |
|----------------|--------|
| Click | Select single row (clears other selections in single mode) |
| Ctrl/Cmd + Click | Toggle individual row selection (multiple mode) |
| Shift + Click | Select range from last selected to clicked row |
| Ctrl/Cmd + A | Select all visible rows |
| Space | Toggle selection of focused row |
| Enter | Toggle selection of focused row |

### Implementing Custom Keyboard Handlers

```typescript
@HostListener('keydown', ['$event'])
onKeyDown(event: KeyboardEvent) {
  const focused = this.grid.focusedCell();
  if (!focused) return;

  switch (event.key) {
    case ' ':
    case 'Enter':
      event.preventDefault();
      this.grid.toggleRowSelection(focused.row);
      break;
      
    case 'a':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        this.grid.selectAllRows();
      }
      break;
      
    case 'Escape':
      this.grid.clearAllSelection();
      break;
  }
}
```

## Advanced Selection Patterns

### Range Selection Implementation

```typescript
class AdvancedSelectionComponent {
  private lastSelectedIndex: number | null = null;

  onRowClick(event: MouseEvent, rowIndex: number) {
    if (this.config.selectionMode === 'single') {
      this.grid.toggleRowSelection(rowIndex);
      this.lastSelectedIndex = rowIndex;
      return;
    }

    if (event.shiftKey && this.lastSelectedIndex !== null) {
      // Range selection
      this.selectRange(this.lastSelectedIndex, rowIndex);
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle individual selection
      this.grid.toggleRowSelection(rowIndex);
      this.lastSelectedIndex = rowIndex;
    } else {
      // Single selection (clear others)
      this.grid.clearAllSelection();
      this.grid.toggleRowSelection(rowIndex);
      this.lastSelectedIndex = rowIndex;
    }
  }

  private selectRange(startIndex: number, endIndex: number) {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    
    for (let i = start; i <= end; i++) {
      if (!this.grid.isRowSelected(i)) {
        this.grid.toggleRowSelection(i);
      }
    }
  }
}
```

### Conditional Selection

```typescript
// Prevent selection based on row data
onRowSelect(event: RowSelectEvent) {
  const { rowData, selected } = event.data;
  
  // Prevent selection of inactive rows
  if (selected && !rowData.isActive) {
    console.warn('Cannot select inactive row');
    // Deselect the row
    setTimeout(() => {
      this.grid.toggleRowSelection(event.data.rowIndex);
    });
    return;
  }
  
  // Limit selection count
  const selectedCount = this.grid.selectedRows().size;
  if (selected && selectedCount > 10) {
    console.warn('Cannot select more than 10 rows');
    setTimeout(() => {
      this.grid.toggleRowSelection(event.data.rowIndex);
    });
    return;
  }
}
```

### Master-Detail Selection

```typescript
@Component({
  template: `
    <!-- Master Grid -->
    <blg-grid 
      [data]="masterData"
      [columns]="masterColumns"
      [config]="masterConfig"
      (rowSelect)="onMasterRowSelect($event)">
    </blg-grid>
    
    <!-- Detail Grid -->
    <blg-grid 
      [data]="detailData"
      [columns]="detailColumns"
      [config]="detailConfig"
      *ngIf="selectedMasterRow">
    </blg-grid>
  `
})
export class MasterDetailComponent {
  selectedMasterRow: any = null;
  detailData: any[] = [];

  masterConfig: GridConfig = {
    selectable: true,
    selectionMode: 'single' // Only one master row can be selected
  };

  onMasterRowSelect(event: RowSelectEvent) {
    if (event.data.selected) {
      this.selectedMasterRow = event.data.rowData;
      this.loadDetailData(this.selectedMasterRow.id);
    } else {
      this.selectedMasterRow = null;
      this.detailData = [];
    }
  }

  private loadDetailData(masterId: number) {
    // Load related detail records
    this.detailService.getDetailsByMasterId(masterId)
      .subscribe(data => this.detailData = data);
  }
}
```

## Selection UI Components

### Custom Selection Controls

```typescript
@Component({
  selector: 'grid-selection-controls',
  template: `
    <div class="selection-controls">
      <button 
        (click)="selectAll()" 
        [disabled]="areAllSelected()">
        Select All
      </button>
      
      <button 
        (click)="clearSelection()" 
        [disabled]="!hasSelection()">
        Clear Selection
      </button>
      
      <button 
        (click)="invertSelection()">
        Invert Selection
      </button>
      
      <span class="selection-count">
        {{getSelectedCount()}} of {{getTotalCount()}} selected
      </span>
    </div>
  `
})
export class GridSelectionControlsComponent {
  @Input() grid!: Grid;

  selectAll() {
    this.grid.selectAllRows();
  }

  clearSelection() {
    this.grid.clearAllSelection();
  }

  invertSelection() {
    const totalRows = this.grid.gridData().length;
    for (let i = 0; i < totalRows; i++) {
      this.grid.toggleRowSelection(i);
    }
  }

  hasSelection(): boolean {
    return this.grid.selectedRows().size > 0;
  }

  areAllSelected(): boolean {
    const selectedCount = this.grid.selectedRows().size;
    const totalCount = this.grid.gridData().length;
    return selectedCount === totalCount && totalCount > 0;
  }

  getSelectedCount(): number {
    return this.grid.selectedRows().size;
  }

  getTotalCount(): number {
    return this.grid.gridData().length;
  }
}
```

### Selection Checkbox Column

```typescript
// Add a checkbox column for selection
const selectionColumn: ColumnDefinition = {
  id: 'selection',
  field: 'id',
  header: `
    <input 
      type="checkbox" 
      [checked]="areAllSelected()" 
      (change)="toggleSelectAll($event)">
  `,
  width: 50,
  sortable: false,
  filterable: false,
  cellEditor: false,
  cellRenderer: `
    <input 
      type="checkbox" 
      [checked]="isRowSelected(rowIndex)"
      (change)="toggleRowSelection(rowIndex)">
  `,
  pinned: 'left'
};

// Add to column definitions
const columns: ColumnDefinition[] = [
  selectionColumn,
  // ... other columns
];
```

## Selection Persistence

### Save/Restore Selection State

```typescript
class PersistentSelectionComponent {
  private readonly SELECTION_STORAGE_KEY = 'grid-selection';

  // Save selection to localStorage
  saveSelection() {
    const selectedIndices = Array.from(this.grid.selectedRows());
    const selectedIds = selectedIndices.map(index => {
      const rowData = this.grid.gridData()[index];
      return rowData.id;
    });
    
    localStorage.setItem(
      this.SELECTION_STORAGE_KEY, 
      JSON.stringify(selectedIds)
    );
  }

  // Restore selection from localStorage
  restoreSelection() {
    const saved = localStorage.getItem(this.SELECTION_STORAGE_KEY);
    if (!saved) return;

    const selectedIds = JSON.parse(saved);
    const currentData = this.grid.gridData();
    
    this.grid.clearAllSelection();
    
    selectedIds.forEach((id: any) => {
      const index = currentData.findIndex(row => row.id === id);
      if (index >= 0) {
        this.grid.toggleRowSelection(index);
      }
    });
  }

  // Clear saved selection
  clearSavedSelection() {
    localStorage.removeItem(this.SELECTION_STORAGE_KEY);
  }
}
```

### Selection Across Page Navigation

```typescript
class CrossPageSelectionComponent {
  private selectedRowIds = new Set<any>();

  // Track selection by ID instead of index
  onRowSelect(event: RowSelectEvent) {
    const rowId = event.data.rowData.id;
    
    if (event.data.selected) {
      this.selectedRowIds.add(rowId);
    } else {
      this.selectedRowIds.delete(rowId);
    }
  }

  // Restore selection when page changes
  onPageChange() {
    // After page data loads
    setTimeout(() => {
      this.restoreSelectionForCurrentPage();
    });
  }

  private restoreSelectionForCurrentPage() {
    const currentData = this.grid.gridData();
    
    currentData.forEach((row, index) => {
      if (this.selectedRowIds.has(row.id)) {
        if (!this.grid.isRowSelected(index)) {
          this.grid.toggleRowSelection(index);
        }
      }
    });
  }

  // Get all selected data across pages
  getAllSelectedData(): any[] {
    return this.allData.filter(row => this.selectedRowIds.has(row.id));
  }
}
```

## Selection Performance

### Optimizations for Large Datasets

```typescript
// Use Set for O(1) lookup performance
class OptimizedSelectionComponent {
  private selectedIds = new Set<any>();

  // Efficient selection checking
  isRowSelected(rowIndex: number): boolean {
    const rowData = this.grid.gridData()[rowIndex];
    return this.selectedIds.has(rowData.id);
  }

  // Batch selection updates
  batchSelectRows(rowIndices: number[]) {
    rowIndices.forEach(index => {
      const rowData = this.grid.gridData()[index];
      this.selectedIds.add(rowData.id);
    });
    
    // Update grid selection state
    this.syncGridSelection();
  }

  private syncGridSelection() {
    this.grid.clearAllSelection();
    
    this.grid.gridData().forEach((row, index) => {
      if (this.selectedIds.has(row.id)) {
        this.grid.toggleRowSelection(index);
      }
    });
  }
}
```

## Best Practices

### Selection UX Guidelines

1. **Visual Feedback**: Always provide clear visual indication of selected rows
2. **Keyboard Support**: Implement full keyboard navigation for accessibility
3. **Bulk Operations**: Provide bulk action buttons when multiple selection is enabled
4. **Selection Limits**: Consider limiting selection count for performance
5. **Persistence**: Save selection state for better user experience

### Common Patterns

```typescript
// Selection-dependent actions
class SelectionActionsComponent {
  get canEdit(): boolean {
    return this.grid.selectedRows().size === 1;
  }

  get canDelete(): boolean {
    return this.grid.selectedRows().size > 0;
  }

  get canExport(): boolean {
    return this.grid.selectedRows().size > 0;
  }

  // Actions based on selection
  editSelected() {
    if (this.canEdit) {
      const selectedData = this.getSelectedRowData()[0];
      this.editItem(selectedData);
    }
  }

  deleteSelected() {
    if (this.canDelete) {
      const selectedData = this.getSelectedRowData();
      this.confirmDelete(selectedData);
    }
  }

  exportSelected() {
    if (this.canExport) {
      const selectedData = this.getSelectedRowData();
      this.exportData(selectedData);
    }
  }
}
```