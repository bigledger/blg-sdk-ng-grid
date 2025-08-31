# Cell Editing

## Overview

Cell editing allows users to modify data directly within the grid by double-clicking cells, pressing Enter, or using keyboard navigation. The BLG Grid supports various editing modes, validation, and custom editing behaviors.

## Use Cases

- Data entry and modification
- Real-time data updates
- Form-like interactions within the grid
- Batch editing operations
- Inline validation and error handling

## Basic Cell Editing

### Enable Cell Editing

```typescript
import { BlgGridComponent } from '@blg/grid';

@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs">
    </blg-grid>
  `
})
export class MyGridComponent {
  rowData = [
    { name: 'John Doe', age: 30, email: 'john@example.com' },
    { name: 'Jane Smith', age: 25, email: 'jane@example.com' }
  ];

  columnDefs = [
    { 
      field: 'name', 
      headerName: 'Name',
      editable: true
    },
    { 
      field: 'age', 
      headerName: 'Age',
      editable: true,
      type: 'number'
    },
    { 
      field: 'email', 
      headerName: 'Email',
      editable: true
    }
  ];
}
```

### Conditional Editing

```typescript
columnDefs = [
  {
    field: 'status',
    headerName: 'Status',
    editable: (params) => {
      // Only allow editing if user has permission
      return params.data.canEdit && this.userPermissions.canEditStatus;
    }
  }
];
```

## Advanced Editing Features

### Edit Start/Stop Events

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (cellEditingStarted)="onCellEditingStarted($event)"
      (cellEditingStopped)="onCellEditingStopped($event)"
      (cellValueChanged)="onCellValueChanged($event)">
    </blg-grid>
  `
})
export class MyGridComponent {
  onCellEditingStarted(event: CellEditingStartedEvent) {
    console.log('Started editing cell:', event.column.getColId());
    // Store original value for potential rollback
    this.originalValue = event.value;
  }

  onCellEditingStopped(event: CellEditingStoppedEvent) {
    console.log('Stopped editing cell:', event.column.getColId());
    // Cleanup or validation
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    console.log('Cell value changed:', {
      field: event.column.getColId(),
      oldValue: event.oldValue,
      newValue: event.newValue
    });
    
    // Trigger dependent calculations
    this.recalculateRow(event.node);
  }
}
```

### Custom Value Parsing

```typescript
columnDefs = [
  {
    field: 'price',
    headerName: 'Price',
    editable: true,
    valueParser: (params) => {
      // Parse currency input
      const value = params.newValue;
      if (typeof value === 'string') {
        return parseFloat(value.replace(/[$,]/g, ''));
      }
      return value;
    },
    valueFormatter: (params) => {
      return params.value ? `$${params.value.toFixed(2)}` : '';
    }
  }
];
```

### Single Click Editing

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      singleClickEdit="true">
    </blg-grid>
  `
})
export class MyGridComponent {
  // Grid will enter edit mode on single click
}
```

## Validation and Error Handling

### Cell Validation

```typescript
columnDefs = [
  {
    field: 'email',
    headerName: 'Email',
    editable: true,
    cellEditorParams: {
      validator: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Please enter a valid email address');
        }
        return true;
      }
    },
    cellClass: (params) => {
      return params.data.emailError ? 'cell-error' : '';
    }
  }
];

// CSS for error styling
/*
.cell-error {
  background-color: #ffebee !important;
  border: 1px solid #f44336 !important;
}
*/
```

### Async Validation

```typescript
columnDefs = [
  {
    field: 'username',
    headerName: 'Username',
    editable: true,
    cellEditorParams: {
      asyncValidator: async (value: string) => {
        const response = await this.userService.checkUsernameAvailability(value);
        if (!response.available) {
          throw new Error('Username is already taken');
        }
        return true;
      }
    }
  }
];
```

## Keyboard Navigation

### Tab Navigation

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      tabToNextCell="true"
      tabToNextRow="true">
    </blg-grid>
  `
})
export class MyGridComponent {
  // Users can tab between editable cells
}
```

### Custom Key Handling

```typescript
onCellKeyDown(event: CellKeyDownEvent) {
  if (event.event.key === 'Escape') {
    // Cancel editing and restore original value
    event.api.stopEditing(true);
  } else if (event.event.key === 'F2') {
    // Start editing current cell
    event.api.startEditingCell({
      rowIndex: event.rowIndex,
      colKey: event.column.getColId()
    });
  }
}
```

## API Reference

### Grid Options

| Option | Type | Description |
|--------|------|-------------|
| `singleClickEdit` | boolean | Enable editing on single click |
| `stopEditingWhenCellsLoseFocus` | boolean | Stop editing when cell loses focus |
| `enterMovesDown` | boolean | Move to cell below when pressing Enter |
| `enterMovesDownAfterEdit` | boolean | Move down after completing edit |
| `tabToNextCell` | boolean | Allow tabbing between cells |
| `tabToNextRow` | boolean | Allow tabbing to next row |

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `editable` | boolean \| function | Enable/disable editing for column |
| `cellEditor` | string \| Component | Custom cell editor component |
| `cellEditorParams` | object | Parameters for cell editor |
| `valueSetter` | function | Custom value setter function |
| `valueParser` | function | Parse input value before setting |

### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `cellEditingStarted` | Cell editing has started | CellEditingStartedEvent |
| `cellEditingStopped` | Cell editing has stopped | CellEditingStoppedEvent |
| `cellValueChanged` | Cell value has changed | CellValueChangedEvent |
| `rowValueChanged` | Any cell in row has changed | RowValueChangedEvent |

### API Methods

```typescript
// Start editing a specific cell
gridApi.startEditingCell({
  rowIndex: 0,
  colKey: 'name'
});

// Stop all editing
gridApi.stopEditing(cancel?: boolean);

// Get currently editing cells
const editingCells = gridApi.getEditingCells();

// Undo/Redo operations
gridApi.undoCellEditing();
gridApi.redoCellEditing();
```

## Performance Tips

1. **Lazy Validation**: Validate on blur rather than on every keystroke
2. **Batch Updates**: Group multiple cell changes into single transactions
3. **Debounce Changes**: Debounce rapid value changes to avoid excessive processing
4. **Virtual Scrolling**: Use virtual scrolling for large datasets with editing

```typescript
// Batch editing example
gridApi.batchUpdateRowData({
  update: updatedRows,
  addIndex: null
});
```

## Common Patterns

### Inline Form Validation

```typescript
export class GridWithValidation {
  private validationErrors = new Map<string, string>();

  onCellValueChanged(event: CellValueChangedEvent) {
    this.validateCell(event);
    this.updateRowValidation(event.node);
  }

  private validateCell(event: CellValueChangedEvent) {
    const { column, newValue, node } = event;
    const field = column.getColId();
    const rowId = node.id;
    
    try {
      this.validators[field]?.(newValue);
      this.validationErrors.delete(`${rowId}-${field}`);
    } catch (error) {
      this.validationErrors.set(`${rowId}-${field}`, error.message);
    }
  }
}
```

### Conditional Field Updates

```typescript
onCellValueChanged(event: CellValueChangedEvent) {
  if (event.column.getColId() === 'category') {
    // Clear subcategory when category changes
    event.node.setDataValue('subcategory', null);
    
    // Load new subcategory options
    this.loadSubcategories(event.newValue).then(options => {
      // Update column definition with new options
      this.updateColumnOptions('subcategory', options);
    });
  }
}
```

## Troubleshooting

### Common Issues

1. **Editing not working**: Ensure `editable: true` is set on column definitions
2. **Values not updating**: Check if `valueSetter` or `valueParser` is correctly implemented
3. **Validation not triggering**: Verify validation functions are properly configured
4. **Tab navigation issues**: Check `tabToNextCell` and `suppressNavigable` settings

### Debugging

```typescript
// Enable debug mode
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      debug="true">
    </blg-grid>
  `
})
export class DebuggingGridComponent {
  constructor() {
    // Log all editing events
    this.gridOptions = {
      onCellEditingStarted: (e) => console.log('Edit started:', e),
      onCellEditingStopped: (e) => console.log('Edit stopped:', e),
      onCellValueChanged: (e) => console.log('Value changed:', e)
    };
  }
}
```

## Best Practices

1. **Always validate user input** before accepting changes
2. **Provide clear feedback** for validation errors
3. **Use appropriate cell editors** for different data types
4. **Implement undo/redo functionality** for better user experience
5. **Handle async operations gracefully** with loading indicators
6. **Test keyboard navigation thoroughly** across different browsers
7. **Consider accessibility** with proper ARIA attributes and keyboard support