# Row Selection

Row selection is a fundamental grid feature that allows users to select one or more rows for actions like editing, deleting, or bulk operations. BlgGrid provides flexible selection modes with excellent keyboard and accessibility support.

## Overview

BlgGrid selection features:
- **Multiple selection modes**: Single, multiple, and checkbox selection
- **Keyboard navigation**: Full keyboard support with Ctrl/Cmd and Shift modifiers
- **Accessibility**: WCAG compliant with proper ARIA attributes
- **Programmatic control**: API for getting, setting, and managing selection
- **Visual feedback**: Clear selection indicators and hover states
- **Performance optimized**: Efficient selection handling for large datasets

## Basic Row Selection

### Enable Selection

Configure selection in your grid:

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { GridConfig, RowSelectEvent } from '@ng-ui-lib/core';

@Component({
  selector: 'app-selectable-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="selection-info">
      <p>Selected: {{selectedRows.length}} row(s)</p>
      <button (click)="clearSelection()" [disabled]="selectedRows.length === 0">
        Clear Selection
      </button>
    </div>
    
    <ng-ui-lib
      [data]="data"
      [columns]="columns"
      [config]="config"
      (rowSelect)="onRowSelect($event)"
      (selectionChanged)="onSelectionChanged($event)">
    </ng-ui-lib>
    
    <div class="selected-data" *ngIf="selectedRows.length > 0">
      <h3>Selected Items:</h3>
      <ul>
        <li *ngFor="let row of selectedRows">
          {{row.name}} - {{row.department}}
        </li>
      </ul>
    </div>
  `
})
export class SelectableGridComponent {
  data = [
    { id: 1, name: 'John Doe', department: 'Engineering', salary: 75000 },
    { id: 2, name: 'Jane Smith', department: 'Marketing', salary: 65000 },
    { id: 3, name: 'Bob Johnson', department: 'Engineering', salary: 85000 },
    { id: 4, name: 'Alice Brown', department: 'Sales', salary: 70000 }
  ];

  selectedRows: any[] = [];

  config: GridConfig = {
    // Enable selection
    selectable: true,
    
    // Selection mode
    selectionMode: 'multiple',      // 'single' | 'multiple'
    
    // Visual options
    showSelectionColumn: true,      // Show selection checkboxes
    headerCheckboxSelection: true,  // Header checkbox for select all
    
    // Behavior
    selectOnRowClick: true,         // Click row to select
    deselectOnRowClick: true,       // Click selected row to deselect
    selectOnlyFirstClick: false     // Only first click selects, others don't deselect
  };

  onRowSelect(event: RowSelectEvent) {
    console.log('Row selection changed:', {
      rowIndex: event.data.rowIndex,
      rowData: event.data.rowData,
      selected: event.data.selected
    });
  }

  onSelectionChanged(event: any) {
    this.selectedRows = event.selectedRows;
    console.log('Selection changed:', event);
  }

  clearSelection() {
    // Clear selection programmatically
    this.selectedRows = [];
  }
}
```

## Selection Modes

### Single Selection

Allow only one row to be selected at a time:

```typescript
const singleSelectionConfig: GridConfig = {
  selectable: true,
  selectionMode: 'single',
  
  // Single selection options
  showSelectionColumn: false,     // Usually don't show checkboxes for single selection
  selectOnRowClick: true,         // Row click selects
  deselectOnRowClick: true,       // Click again to deselect
  
  // Visual styling
  highlightSelectedRow: true,     // Highlight selected row
  selectedRowClass: 'selected-row'
};
```

### Multiple Selection

Allow multiple rows to be selected:

```typescript
const multipleSelectionConfig: GridConfig = {
  selectable: true,
  selectionMode: 'multiple',
  
  // Multiple selection options
  showSelectionColumn: true,      // Show checkboxes
  headerCheckboxSelection: true,  // Select all checkbox in header
  
  // Selection behavior
  selectOnRowClick: false,        // Only checkboxes select (recommended)
  ctrlClickToSelect: true,        // Ctrl+click for multi-select without checkboxes
  shiftClickToSelectRange: true,  // Shift+click for range selection
  
  // Limits
  maxSelectionCount: 100,         // Limit selection count
  
  // Keyboard shortcuts
  keyboardSelection: true,        // Enable keyboard selection
  selectAllShortcut: 'Ctrl+A',    // Select all shortcut
  
  // Performance
  selectionCheckboxes: 'auto'     // 'always' | 'never' | 'auto'
};
```

### Checkbox Selection

Dedicated checkbox column for selection:

```typescript
const checkboxSelectionConfig: GridConfig = {
  selectable: true,
  selectionMode: 'multiple',
  
  // Checkbox configuration
  showSelectionColumn: true,
  selectionColumnWidth: 50,
  selectionColumnHeader: 'Select',
  
  // Checkbox behavior
  headerCheckboxSelection: true,
  headerCheckboxIndeterminate: true,  // Show indeterminate state
  checkboxSelectsRow: true,          // Checkbox selects entire row
  
  // Only checkboxes can select
  selectOnRowClick: false,
  ctrlClickToSelect: false,
  
  // Styling
  selectionColumnClass: 'selection-column',
  checkboxClass: 'row-checkbox'
};
```

## Programmatic Selection

### Selection API

Control selection programmatically:

```typescript
@Component({})
export class ProgrammaticSelectionComponent {
  @ViewChild(Grid) grid!: Grid;
  
  // Select specific rows
  selectByIds(ids: number[]) {
    this.grid.selectRows(ids);
  }

  selectByIndex(indices: number[]) {
    this.grid.selectRowsByIndex(indices);
  }

  selectByCondition(predicate: (row: any) => boolean) {
    this.grid.selectRowsWhere(predicate);
  }

  // Selection state
  getSelectedRows(): any[] {
    return this.grid.getSelectedRows();
  }

  getSelectedRowIds(): any[] {
    return this.grid.getSelectedRowIds();
  }

  getSelectedIndices(): number[] {
    return this.grid.getSelectedIndices();
  }

  // Selection operations
  selectAll() {
    this.grid.selectAll();
  }

  selectNone() {
    this.grid.selectNone();
  }

  selectInverse() {
    this.grid.selectInverse();
  }

  selectRange(startIndex: number, endIndex: number) {
    this.grid.selectRange(startIndex, endIndex);
  }

  // Conditional selections
  selectEngineeringEmployees() {
    this.grid.selectRowsWhere(row => row.department === 'Engineering');
  }

  selectHighSalaryEmployees() {
    this.grid.selectRowsWhere(row => row.salary > 80000);
  }

  selectActiveEmployees() {
    this.grid.selectRowsWhere(row => row.active === true);
  }

  // Toggle selections
  toggleRowSelection(rowId: any) {
    if (this.grid.isRowSelected(rowId)) {
      this.grid.deselectRow(rowId);
    } else {
      this.grid.selectRow(rowId);
    }
  }

  toggleAllSelection() {
    if (this.grid.areAllRowsSelected()) {
      this.grid.selectNone();
    } else {
      this.grid.selectAll();
    }
  }
}
```

### Selection Events

Handle various selection events:

```typescript
@Component({
  template: `
    <ng-ui-lib
      [data]="data"
      [columns]="columns"
      [config]="config"
      (rowSelect)="onRowSelect($event)"
      (selectionChanged)="onSelectionChanged($event)"
      (beforeSelectionChange)="onBeforeSelectionChange($event)"
      (selectAll)="onSelectAll($event)"
      (selectNone)="onSelectNone($event)">
    </ng-ui-lib>
  `
})
export class SelectionEventsComponent {
  onRowSelect(event: RowSelectEvent) {
    console.log('Single row selection:', event.data);
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    console.log('Selection changed:', {
      selectedRows: event.selectedRows,
      selectedCount: event.selectedCount,
      selectedIds: event.selectedIds,
      addedRows: event.addedRows,
      removedRows: event.removedRows
    });
  }

  onBeforeSelectionChange(event: BeforeSelectionChangeEvent) {
    // Prevent selection of certain rows
    if (event.rowData.status === 'locked') {
      event.preventDefault();
      console.log('Cannot select locked row');
    }
  }

  onSelectAll(event: SelectAllEvent) {
    console.log('Select all triggered:', event);
  }

  onSelectNone(event: SelectNoneEvent) {
    console.log('Select none triggered:', event);
  }
}
```

## Advanced Selection Features

### Conditional Selection

Prevent selection of certain rows based on conditions:

```typescript
const conditionalSelectionConfig: GridConfig = {
  selectable: true,
  selectionMode: 'multiple',
  
  // Row selection predicate
  isRowSelectable: (row: any, index: number) => {
    // Prevent selection of inactive users
    if (!row.active) return false;
    
    // Prevent selection of users without permissions
    if (!row.permissions?.canSelect) return false;
    
    // Prevent selection based on index
    if (index === 0) return false; // Header row
    
    return true;
  },
  
  // Visual indication for non-selectable rows
  nonSelectableRowClass: 'non-selectable',
  showTooltipForNonSelectable: true,
  nonSelectableTooltip: 'This row cannot be selected'
};
```

### Selection Persistence

Maintain selection across data updates:

```typescript
@Component({})
export class PersistentSelectionComponent implements OnInit {
  @ViewChild(Grid) grid!: Grid;
  
  private selectionKey = 'grid-selection';
  selectedRowIds = signal<any[]>([]);

  ngOnInit() {
    this.loadSavedSelection();
  }

  ngOnDestroy() {
    this.saveSelection();
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedRowIds.set(event.selectedIds);
    this.saveSelection();
  }

  onDataChanged() {
    // Restore selection after data update
    setTimeout(() => {
      this.restoreSelection();
    }, 0);
  }

  private saveSelection() {
    localStorage.setItem(this.selectionKey, JSON.stringify(this.selectedRowIds()));
  }

  private loadSavedSelection() {
    const saved = localStorage.getItem(this.selectionKey);
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        this.selectedRowIds.set(ids);
      } catch (error) {
        console.warn('Invalid saved selection:', error);
      }
    }
  }

  private restoreSelection() {
    const ids = this.selectedRowIds();
    if (ids.length > 0) {
      this.grid.selectRows(ids);
    }
  }
}
```

### Selection with Virtual Scrolling

Handle selection efficiently with virtual scrolling:

```typescript
@Component({})
export class VirtualSelectionComponent {
  config: GridConfig = {
    selectable: true,
    selectionMode: 'multiple',
    virtualScrolling: true,
    
    // Virtual scrolling selection options
    maintainSelectionOnScroll: true,    // Keep selection when scrolling
    selectAllAcrossPages: true,         // Select all includes non-visible rows
    
    // Performance optimizations
    selectionBatchSize: 100,            // Process selections in batches
    deferSelectionUpdates: true,        // Batch selection updates
    
    // Visual feedback
    showSelectionCount: true,           // Show "X of Y selected"
    selectionCountTemplate: '{{selected}} of {{total}} selected'
  };

  // Handle large selection operations
  async selectAllWithProgress() {
    const totalRows = this.data.length;
    const batchSize = 1000;
    let processed = 0;

    for (let i = 0; i < totalRows; i += batchSize) {
      const batch = this.data.slice(i, i + batchSize);
      const batchIds = batch.map(row => row.id);
      
      this.grid.selectRows(batchIds, { addToSelection: true });
      
      processed += batch.length;
      
      // Update progress
      this.selectionProgress = (processed / totalRows) * 100;
      
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}
```

## Custom Selection UI

Create custom selection controls:

```typescript
@Component({
  template: `
    <div class="selection-toolbar">
      <div class="selection-actions">
        <button (click)="selectAll()" [disabled]="allSelected">
          Select All ({{data.length}})
        </button>
        
        <button (click)="selectNone()" [disabled]="selectedCount === 0">
          Clear Selection
        </button>
        
        <button (click)="selectInverse()">
          Invert Selection
        </button>
      </div>

      <div class="selection-filters">
        <button (click)="selectByDepartment('Engineering')">
          Select Engineering
        </button>
        
        <button (click)="selectByDepartment('Marketing')">
          Select Marketing
        </button>
        
        <button (click)="selectHighSalary()">
          Select High Salary (>$80k)
        </button>
      </div>

      <div class="selection-info">
        <span class="selection-count">
          {{selectedCount}} of {{data.length}} selected
        </span>
        
        <div class="selection-progress" *ngIf="selectedCount > 0">
          <div class="progress-bar" 
               [style.width.%]="selectionPercentage">
          </div>
        </div>
      </div>
    </div>

    <div class="bulk-actions" *ngIf="selectedCount > 0">
      <h3>Bulk Actions</h3>
      <button (click)="exportSelected()">
        Export Selected ({{selectedCount}})
      </button>
      
      <button (click)="deleteSelected()" class="danger">
        Delete Selected
      </button>
      
      <button (click)="updateSelected()">
        Bulk Update
      </button>
    </div>

    <ng-ui-lib
      [data]="data"
      [columns]="columns"
      [config]="config"
      (selectionChanged)="onSelectionChanged($event)">
    </ng-ui-lib>
  `
})
export class CustomSelectionUIComponent {
  @ViewChild(Grid) grid!: Grid;
  
  selectedCount = 0;
  selectedRows: any[] = [];
  
  get allSelected(): boolean {
    return this.selectedCount === this.data.length;
  }
  
  get selectionPercentage(): number {
    return (this.selectedCount / this.data.length) * 100;
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedCount = event.selectedCount;
    this.selectedRows = event.selectedRows;
  }

  selectAll() {
    this.grid.selectAll();
  }

  selectNone() {
    this.grid.selectNone();
  }

  selectInverse() {
    this.grid.selectInverse();
  }

  selectByDepartment(department: string) {
    this.grid.selectRowsWhere(row => row.department === department);
  }

  selectHighSalary() {
    this.grid.selectRowsWhere(row => row.salary > 80000);
  }

  // Bulk actions
  exportSelected() {
    const data = this.selectedRows;
    this.exportService.exportToCSV(data, 'selected-data.csv');
  }

  async deleteSelected() {
    if (confirm(`Delete ${this.selectedCount} selected rows?`)) {
      const ids = this.selectedRows.map(row => row.id);
      await this.dataService.deleteRows(ids);
      this.refreshData();
      this.grid.selectNone();
    }
  }

  updateSelected() {
    // Open bulk update dialog
    const selectedIds = this.selectedRows.map(row => row.id);
    this.bulkUpdateDialog.open(selectedIds);
  }
}
```

## Keyboard Navigation

Enable comprehensive keyboard support:

```typescript
const keyboardSelectionConfig: GridConfig = {
  selectable: true,
  selectionMode: 'multiple',
  
  // Keyboard selection
  keyboardNavigation: true,
  keyboardSelection: true,
  
  // Keyboard shortcuts
  selectionShortcuts: {
    selectAll: 'Ctrl+A',
    selectNone: 'Ctrl+D',
    selectInverse: 'Ctrl+I',
    
    // Navigation with selection
    selectUp: 'Shift+ArrowUp',
    selectDown: 'Shift+ArrowDown',
    selectPageUp: 'Shift+PageUp',
    selectPageDown: 'Shift+PageDown',
    selectHome: 'Shift+Home',
    selectEnd: 'Shift+End',
    
    // Toggle selection
    toggleSelect: 'Space',
    extendSelection: 'Shift+Space',
    
    // Row operations
    activateRow: 'Enter',
    contextMenu: 'F10'
  },
  
  // Visual feedback
  showKeyboardFocus: true,
  focusedRowClass: 'focused-row',
  
  // Accessibility
  ariaMultiSelectable: true,
  announceSelectionChanges: true,
  selectionAnnouncementTemplate: '{{count}} rows selected'
};
```

## Performance Optimization

Optimize selection for large datasets:

```typescript
@Component({})
export class OptimizedSelectionComponent {
  config: GridConfig = {
    selectable: true,
    selectionMode: 'multiple',
    
    // Performance options
    selectionBufferSize: 100,       // Buffer for selection operations
    deferSelectionUpdates: true,    // Batch updates
    virtualSelection: true,         // Virtualize selection for performance
    
    // Memory management
    maxSelectedRows: 10000,         // Limit selection count
    selectionPaging: true,          // Page large selections
    
    // Update optimization
    debounceSelectionUpdates: 50,   // Debounce selection events
    throttleSelectionEvents: 100    // Throttle selection events
  };

  // Optimize selection operations
  async bulkSelect(predicate: (row: any) => boolean) {
    const batchSize = 1000;
    const startTime = performance.now();
    
    for (let i = 0; i < this.data.length; i += batchSize) {
      const batch = this.data.slice(i, i + batchSize);
      const toSelect = batch.filter(predicate).map(row => row.id);
      
      if (toSelect.length > 0) {
        this.grid.selectRows(toSelect, { 
          addToSelection: true,
          suppressEvents: true  // Suppress events during bulk operation
        });
      }
      
      // Yield control periodically
      if (i % (batchSize * 10) === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    // Fire single selection event at the end
    this.grid.fireSelectionChanged();
    
    const duration = performance.now() - startTime;
    console.log(`Bulk selection completed in ${duration}ms`);
  }
}
```

## Accessibility Features

Ensure selection is accessible:

```typescript
const accessibleSelectionConfig: GridConfig = {
  selectable: true,
  selectionMode: 'multiple',
  
  // ARIA attributes
  ariaMultiSelectable: true,
  ariaSelectionMode: 'multiple',
  
  // Screen reader support
  announceSelectionChanges: true,
  selectionAnnouncementTemplate: '{{action}}: {{rowLabel}}. {{selectedCount}} of {{totalCount}} rows selected.',
  
  // High contrast support
  highContrastSelection: true,
  
  // Focus management
  manageFocus: true,
  restoreFocusOnSelectionChange: false,
  
  // Keyboard accessibility
  keyboardOnly: false,            // Allow keyboard-only operation
  skipToSelectedShortcut: 'Ctrl+Shift+S',
  
  // Labels and descriptions
  selectionColumnLabel: 'Select row',
  selectAllLabel: 'Select all rows',
  selectedRowLabel: '{{rowLabel}} selected',
  unselectedRowLabel: '{{rowLabel}} not selected'
};
```

## Testing Selection

Test selection functionality:

```typescript
describe('Row Selection', () => {
  let component: SelectableGridComponent;
  let fixture: ComponentFixture<SelectableGridComponent>;
  let grid: Grid;

  beforeEach(() => {
    // Setup component and fixture
    grid = component.grid;
  });

  it('should select single row', () => {
    grid.selectRow(1);
    
    expect(grid.isRowSelected(1)).toBe(true);
    expect(grid.getSelectedRowIds()).toEqual([1]);
  });

  it('should select multiple rows', () => {
    grid.selectRows([1, 2, 3]);
    
    expect(grid.getSelectedRowIds()).toEqual([1, 2, 3]);
    expect(grid.getSelectedRows().length).toBe(3);
  });

  it('should handle select all', () => {
    grid.selectAll();
    
    expect(grid.areAllRowsSelected()).toBe(true);
    expect(grid.getSelectedRows().length).toBe(component.data.length);
  });

  it('should emit selection events', () => {
    spyOn(component, 'onSelectionChanged');
    
    grid.selectRow(1);
    
    expect(component.onSelectionChanged).toHaveBeenCalled();
  });

  it('should respect selection conditions', () => {
    grid.config.isRowSelectable = (row: any) => row.active;
    
    const inactiveRow = component.data.find(row => !row.active);
    grid.selectRow(inactiveRow.id);
    
    expect(grid.isRowSelected(inactiveRow.id)).toBe(false);
  });

  it('should handle keyboard selection', async () => {
    const gridElement = fixture.nativeElement.querySelector('ng-ui-lib');
    
    // Focus first row
    const firstRow = gridElement.querySelector('.ng-ui-lib-row');
    firstRow.focus();
    
    // Press Space to select
    const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' });
    firstRow.dispatchEvent(spaceEvent);
    
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(grid.getSelectedRows().length).toBe(1);
  });
});
```

## Best Practices

### Do's
✅ **Use appropriate selection mode** for your use case  
✅ **Provide clear visual feedback** for selected state  
✅ **Implement keyboard navigation** for accessibility  
✅ **Handle large selections efficiently** with batching  
✅ **Persist selection state** when appropriate  
✅ **Provide bulk actions** for multiple selections  
✅ **Test with screen readers** and keyboard-only users  
✅ **Use meaningful row identifiers** for selection tracking  

### Don'ts  
❌ **Don't select on every row click** if using checkboxes  
❌ **Don't forget to handle edge cases** (empty data, filtered data)  
❌ **Don't ignore performance** with large selections  
❌ **Don't make selection UI too complex** or confusing  
❌ **Don't forget to clear selection** when appropriate  
❌ **Don't assume users know keyboard shortcuts** - provide hints  

## Next Steps

- **[Keyboard Navigation](./keyboard-navigation.md)** - Learn about keyboard support
- **[Context Menus](./context-menus.md)** - Add context menus for selected rows
- **[Bulk Operations](../advanced/bulk-operations.md)** - Implement bulk actions
- **[Data Export](../data-operations/export.md)** - Export selected data

## Examples

- [Basic Selection](https://stackblitz.com/edit/ng-ui-lib-selection-basic)
- [Multiple Selection](https://stackblitz.com/edit/ng-ui-lib-selection-multiple)
- [Checkbox Selection](https://stackblitz.com/edit/ng-ui-lib-selection-checkbox)
- [Programmatic Selection](https://stackblitz.com/edit/ng-ui-lib-selection-programmatic)
- [Custom Selection UI](https://stackblitz.com/edit/ng-ui-lib-selection-custom)
- [Selection with Virtual Scrolling](https://stackblitz.com/edit/ng-ui-lib-selection-virtual)