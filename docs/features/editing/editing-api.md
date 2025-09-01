# Editing API

## Overview

The Editing API provides comprehensive programmatic control over cell editing operations in the BLG Grid. This includes starting/stopping edits, managing editing state, handling validation, and implementing custom editing workflows.

## Use Cases

- Programmatic editing control
- Custom editing workflows
- Batch editing operations
- Integration with external forms
- Dynamic editing behavior
- Validation and error handling

## Grid API Methods

### Starting and Stopping Edits

```typescript
import { Component, ViewChild } from '@angular/core';
import { BlgGridComponent, GridApi } from '@ng-ui/grid';

@Component({
  template: `
    <div class="controls">
      <button (click)="startEditingFirstCell()">Start Editing First Cell</button>
      <button (click)="startEditingCell(2, 'name')">Edit Row 2 Name</button>
      <button (click)="stopEditing()">Stop All Editing</button>
      <button (click)="stopEditingAndCancel()">Cancel All Editing</button>
    </div>
    <ng-ui-lib 
      #grid
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (gridReady)="onGridReady($event)">
    </ng-ui-lib>
  `
})
export class EditingApiComponent {
  @ViewChild('grid') grid!: BlgGridComponent;
  private gridApi!: GridApi;

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  startEditingFirstCell(): void {
    this.gridApi.startEditingCell({
      rowIndex: 0,
      colKey: 'name'
    });
  }

  startEditingCell(rowIndex: number, colKey: string): void {
    this.gridApi.startEditingCell({
      rowIndex,
      colKey,
      // Optional: provide initial value
      keyPress: null,
      charPress: null
    });
  }

  stopEditing(): void {
    // Stop editing and commit changes
    this.gridApi.stopEditing(false);
  }

  stopEditingAndCancel(): void {
    // Stop editing and discard changes
    this.gridApi.stopEditing(true);
  }
}
```

### Getting Editing State

```typescript
export class EditingStateComponent {
  private gridApi!: GridApi;

  checkEditingState(): void {
    // Get all currently editing cells
    const editingCells = this.gridApi.getEditingCells();
    console.log('Currently editing cells:', editingCells);

    // Check if any cell is being edited
    const isEditing = editingCells.length > 0;
    console.log('Is editing:', isEditing);

    // Get editing cell for specific row/column
    const editingCell = editingCells.find(cell => 
      cell.rowIndex === 0 && cell.column.getColId() === 'name'
    );
    
    if (editingCell) {
      console.log('Found editing cell:', editingCell);
    }
  }

  getEditingCellInfo(): void {
    const editingCells = this.gridApi.getEditingCells();
    
    editingCells.forEach(cell => {
      console.log({
        rowIndex: cell.rowIndex,
        columnId: cell.column.getColId(),
        rowData: cell.rowNode.data,
        currentValue: cell.rowNode.data[cell.column.getColId()]
      });
    });
  }
}
```

## Advanced Editing Control

### Conditional Editing

```typescript
export class ConditionalEditingComponent {
  columnDefs = [
    {
      field: 'status',
      headerName: 'Status',
      editable: (params) => {
        // Dynamic editability based on row data
        return params.data.canEdit && this.hasPermission('edit_status');
      }
    },
    {
      field: 'amount',
      headerName: 'Amount',
      editable: (params) => {
        // Only editable if status is 'draft'
        return params.data.status === 'draft';
      }
    }
  ];

  private hasPermission(permission: string): boolean {
    return this.userService.hasPermission(permission);
  }
}
```

### Programmatic Value Setting

```typescript
export class ProgrammaticEditingComponent {
  private gridApi!: GridApi;

  // Set single cell value
  setCellValue(rowIndex: number, colKey: string, value: any): void {
    const rowNode = this.gridApi.getRowNode(rowIndex.toString());
    if (rowNode) {
      rowNode.setDataValue(colKey, value);
    }
  }

  // Set multiple cell values in a row
  setRowValues(rowIndex: number, values: Record<string, any>): void {
    const rowNode = this.gridApi.getRowNode(rowIndex.toString());
    if (rowNode) {
      Object.entries(values).forEach(([field, value]) => {
        rowNode.setDataValue(field, value);
      });
    }
  }

  // Batch update multiple rows
  batchUpdateRows(updates: Array<{ rowIndex: number; values: Record<string, any> }>): void {
    this.gridApi.batchUpdateRowData({
      update: updates.map(update => {
        const rowNode = this.gridApi.getRowNode(update.rowIndex.toString());
        return { ...rowNode?.data, ...update.values };
      })
    });
  }
}
```

## Transaction Management

### Using Transactions

```typescript
export class TransactionEditingComponent {
  private gridApi!: GridApi;

  performBatchEdit(): void {
    // Start transaction
    this.gridApi.startBatchTransaction();

    try {
      // Perform multiple edits
      this.setCellValue(0, 'name', 'John Updated');
      this.setCellValue(0, 'age', 31);
      this.setCellValue(1, 'status', 'active');
      
      // Commit all changes at once
      this.gridApi.endBatchTransaction();
      
      console.log('Batch edit completed successfully');
    } catch (error) {
      // Cancel transaction on error
      this.gridApi.endBatchTransaction();
      console.error('Batch edit failed:', error);
    }
  }

  performComplexUpdate(): void {
    const transaction = {
      add: [
        { id: 'new1', name: 'New Row 1', status: 'active' },
        { id: 'new2', name: 'New Row 2', status: 'pending' }
      ],
      update: [
        { id: '1', name: 'Updated Name', lastModified: new Date() }
      ],
      remove: [
        { id: 'old1' }
      ]
    };

    this.gridApi.applyTransaction(transaction);
  }
}
```

### Undo/Redo Operations

```typescript
export class UndoRedoComponent {
  private gridApi!: GridApi;
  private undoRedoService = new UndoRedoService();

  ngOnInit(): void {
    this.setupUndoRedo();
  }

  private setupUndoRedo(): void {
    // Enable undo/redo on the grid
    this.gridOptions = {
      undoRedoCellEditing: true,
      undoRedoCellEditingLimit: 20
    };
  }

  undo(): void {
    this.gridApi.undoCellEditing();
  }

  redo(): void {
    this.gridApi.redoCellEditing();
  }

  // Custom undo/redo implementation
  performUndoableEdit(rowIndex: number, field: string, newValue: any): void {
    const rowNode = this.gridApi.getRowNode(rowIndex.toString());
    const oldValue = rowNode?.data[field];

    // Store undo information
    this.undoRedoService.pushOperation({
      type: 'cell-edit',
      rowIndex,
      field,
      oldValue,
      newValue,
      undo: () => this.setCellValue(rowIndex, field, oldValue),
      redo: () => this.setCellValue(rowIndex, field, newValue)
    });

    // Perform the edit
    this.setCellValue(rowIndex, field, newValue);
  }
}
```

## Validation API

### Cell-Level Validation

```typescript
export class ValidationApiComponent {
  private validationErrors = new Map<string, string[]>();

  columnDefs = [
    {
      field: 'email',
      headerName: 'Email',
      editable: true,
      cellEditorParams: {
        validator: this.validateEmail.bind(this)
      },
      cellClass: (params) => this.getCellClass(params)
    }
  ];

  private validateEmail(value: string): boolean {
    const rowId = this.getRowId(params);
    const field = 'email';
    
    try {
      if (!value || !value.includes('@')) {
        throw new Error('Valid email address is required');
      }
      
      // Clear any existing errors
      this.clearFieldError(rowId, field);
      return true;
    } catch (error) {
      this.setFieldError(rowId, field, error.message);
      return false;
    }
  }

  private getCellClass(params: any): string {
    const rowId = this.getRowId(params);
    const field = params.column.getColId();
    const hasError = this.hasFieldError(rowId, field);
    
    return hasError ? 'cell-error' : '';
  }

  private setFieldError(rowId: string, field: string, error: string): void {
    const key = `${rowId}-${field}`;
    const errors = this.validationErrors.get(key) || [];
    errors.push(error);
    this.validationErrors.set(key, errors);
  }

  private clearFieldError(rowId: string, field: string): void {
    const key = `${rowId}-${field}`;
    this.validationErrors.delete(key);
  }

  private hasFieldError(rowId: string, field: string): boolean {
    const key = `${rowId}-${field}`;
    return this.validationErrors.has(key);
  }
}
```

### Row-Level Validation

```typescript
export class RowValidationComponent {
  private gridApi!: GridApi;

  onCellValueChanged(event: any): void {
    this.validateRow(event.node);
  }

  validateRow(rowNode: any): boolean {
    const data = rowNode.data;
    const errors: string[] = [];

    // Business rule validation
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      errors.push('End date must be after start date');
    }

    if (data.type === 'premium' && (!data.price || data.price < 100)) {
      errors.push('Premium items must have a price of at least $100');
    }

    // Update row validation state
    rowNode.setDataValue('validationErrors', errors);
    
    // Update row styling
    this.gridApi.refreshCells({
      rowNodes: [rowNode],
      force: true
    });

    return errors.length === 0;
  }

  validateAllRows(): { valid: number; invalid: number; errors: any[] } {
    const results = { valid: 0, invalid: 0, errors: [] };
    
    this.gridApi.forEachNode((rowNode) => {
      if (this.validateRow(rowNode)) {
        results.valid++;
      } else {
        results.invalid++;
        results.errors.push({
          rowIndex: rowNode.rowIndex,
          data: rowNode.data,
          errors: rowNode.data.validationErrors
        });
      }
    });

    return results;
  }
}
```

## Custom Editing Workflows

### Multi-Step Editing

```typescript
export class MultiStepEditingComponent {
  private editingWorkflow: Map<string, any> = new Map();

  startWorkflow(rowNode: any): void {
    const workflowId = this.generateWorkflowId(rowNode);
    
    this.editingWorkflow.set(workflowId, {
      rowNode,
      step: 1,
      originalData: { ...rowNode.data },
      changes: {},
      timestamp: new Date()
    });

    this.showWorkflowStep(workflowId, 1);
  }

  nextStep(workflowId: string, stepData: any): void {
    const workflow = this.editingWorkflow.get(workflowId);
    if (!workflow) return;

    workflow.changes = { ...workflow.changes, ...stepData };
    workflow.step++;

    if (workflow.step <= 3) {
      this.showWorkflowStep(workflowId, workflow.step);
    } else {
      this.completeWorkflow(workflowId);
    }
  }

  completeWorkflow(workflowId: string): void {
    const workflow = this.editingWorkflow.get(workflowId);
    if (!workflow) return;

    // Apply all changes
    Object.entries(workflow.changes).forEach(([field, value]) => {
      workflow.rowNode.setDataValue(field, value);
    });

    // Cleanup
    this.editingWorkflow.delete(workflowId);
  }

  cancelWorkflow(workflowId: string): void {
    const workflow = this.editingWorkflow.get(workflowId);
    if (!workflow) return;

    // Restore original data
    Object.entries(workflow.originalData).forEach(([field, value]) => {
      workflow.rowNode.setDataValue(field, value);
    });

    // Cleanup
    this.editingWorkflow.delete(workflowId);
  }
}
```

### Conditional Field Updates

```typescript
export class ConditionalUpdatesComponent {
  onCellValueChanged(event: any): void {
    const { column, newValue, oldValue, node } = event;
    const field = column.getColId();

    // Handle cascading updates
    switch (field) {
      case 'category':
        this.updateSubcategory(node, newValue);
        break;
      case 'country':
        this.updateStatesAndCities(node, newValue);
        break;
      case 'productType':
        this.updatePricing(node, newValue);
        break;
    }
  }

  private updateSubcategory(node: any, category: string): void {
    // Clear subcategory when category changes
    node.setDataValue('subcategory', null);
    
    // Update available subcategories
    this.loadSubcategories(category).then(subcategories => {
      // Update column definition with new options
      this.updateColumnOptions('subcategory', subcategories);
      
      // Refresh the cell to show new options
      this.gridApi.refreshCells({
        rowNodes: [node],
        columns: ['subcategory']
      });
    });
  }

  private updateStatesAndCities(node: any, country: string): void {
    // Clear dependent fields
    node.setDataValue('state', null);
    node.setDataValue('city', null);
    
    // Load and update options
    Promise.all([
      this.loadStates(country),
      this.loadCities(country)
    ]).then(([states, cities]) => {
      this.updateColumnOptions('state', states);
      this.updateColumnOptions('city', cities);
      
      this.gridApi.refreshCells({
        rowNodes: [node],
        columns: ['state', 'city']
      });
    });
  }
}
```

## API Reference

### Grid API Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `startEditingCell()` | `{ rowIndex, colKey, keyPress?, charPress? }` | Start editing specific cell |
| `stopEditing()` | `cancel?: boolean` | Stop all editing |
| `getEditingCells()` | - | Get currently editing cells |
| `undoCellEditing()` | - | Undo last cell edit |
| `redoCellEditing()` | - | Redo last undone edit |
| `batchUpdateRowData()` | `{ add?, update?, remove?, addIndex? }` | Batch update operations |
| `applyTransaction()` | `transaction` | Apply data transaction |
| `startBatchTransaction()` | - | Start batch transaction |
| `endBatchTransaction()` | - | End batch transaction |

### Row Node Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `setDataValue()` | `field: string, value: any` | Set cell value |
| `setData()` | `data: any` | Set entire row data |
| `updateData()` | `data: any` | Update row data (partial) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `cellEditingStarted` | `CellEditingStartedEvent` | Cell editing started |
| `cellEditingStopped` | `CellEditingStoppedEvent` | Cell editing stopped |
| `cellValueChanged` | `CellValueChangedEvent` | Cell value changed |
| `rowValueChanged` | `RowValueChangedEvent` | Row value changed |
| `dataChanged` | `DataChangedEvent` | Data changed |

### Event Interfaces

```typescript
interface CellEditingStartedEvent {
  api: GridApi;
  columnApi: ColumnApi;
  column: Column;
  node: RowNode;
  data: any;
  rowIndex: number;
  value: any;
  type: string;
}

interface CellValueChangedEvent {
  api: GridApi;
  columnApi: ColumnApi;
  column: Column;
  node: RowNode;
  data: any;
  rowIndex: number;
  oldValue: any;
  newValue: any;
  type: string;
}
```

## Performance Tips

1. **Batch Operations**: Use transactions for multiple edits
2. **Debounce Validation**: Avoid validating on every keystroke
3. **Lazy Updates**: Update dependent fields only when necessary
4. **Virtual Scrolling**: Maintain performance with large datasets

```typescript
// Example: Optimized batch editing
export class OptimizedEditingComponent {
  private pendingEdits = new Map<string, any>();
  private editTimeout?: number;

  onCellValueChanged(event: any): void {
    const rowId = event.node.id;
    const field = event.column.getColId();
    
    // Store pending edit
    if (!this.pendingEdits.has(rowId)) {
      this.pendingEdits.set(rowId, {});
    }
    this.pendingEdits.get(rowId)[field] = event.newValue;

    // Debounce batch update
    clearTimeout(this.editTimeout);
    this.editTimeout = window.setTimeout(() => {
      this.processPendingEdits();
    }, 500);
  }

  private processPendingEdits(): void {
    const updates = Array.from(this.pendingEdits.entries()).map(([rowId, changes]) => {
      const rowNode = this.gridApi.getRowNode(rowId);
      return { ...rowNode.data, ...changes };
    });

    this.gridApi.batchUpdateRowData({ update: updates });
    this.pendingEdits.clear();
  }
}
```

## Best Practices

1. **Always validate input** before accepting changes
2. **Use transactions** for related edits to maintain data consistency
3. **Implement proper error handling** for async operations
4. **Provide user feedback** during editing operations
5. **Consider undo/redo functionality** for better user experience
6. **Optimize performance** with debouncing and batching
7. **Handle edge cases** like null values and data type mismatches
8. **Test thoroughly** across different browsers and datasets