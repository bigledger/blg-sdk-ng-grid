# Cell Editors

## Overview

Cell editors provide specialized input controls for different data types and use cases. The BLG Grid includes built-in editors for common scenarios and supports custom editor components for advanced requirements.

## Use Cases

- Type-specific data entry (dates, numbers, selections)
- Rich text editing
- Multi-select inputs
- Custom validation and formatting
- Specialized business logic inputs

## Built-in Cell Editors

### Text Editor

The default editor for string values with basic text input functionality.

```typescript
columnDefs = [
  {
    field: 'name',
    headerName: 'Name',
    editable: true,
    cellEditor: 'blgTextEditor',
    cellEditorParams: {
      maxLength: 50,
      placeholder: 'Enter name...'
    }
  }
];
```

### Number Editor

Specialized editor for numeric inputs with validation and formatting.

```typescript
columnDefs = [
  {
    field: 'price',
    headerName: 'Price',
    editable: true,
    cellEditor: 'blgNumberEditor',
    cellEditorParams: {
      min: 0,
      max: 999999,
      precision: 2,
      step: 0.01,
      showSpinner: true
    }
  }
];
```

### Date Editor

Date picker editor with customizable formats and constraints.

```typescript
columnDefs = [
  {
    field: 'birthDate',
    headerName: 'Birth Date',
    editable: true,
    cellEditor: 'blgDateEditor',
    cellEditorParams: {
      format: 'yyyy-MM-dd',
      minDate: new Date('1900-01-01'),
      maxDate: new Date(),
      showCalendar: true
    }
  }
];
```

### Select Editor

Dropdown editor for selecting from predefined options.

```typescript
columnDefs = [
  {
    field: 'category',
    headerName: 'Category',
    editable: true,
    cellEditor: 'blgSelectEditor',
    cellEditorParams: {
      values: ['Electronics', 'Clothing', 'Books', 'Home & Garden'],
      searchable: true,
      placeholder: 'Select category...'
    }
  }
];
```

### Multi-Select Editor

Editor for selecting multiple values from a list.

```typescript
columnDefs = [
  {
    field: 'tags',
    headerName: 'Tags',
    editable: true,
    cellEditor: 'blgMultiSelectEditor',
    cellEditorParams: {
      values: ['urgent', 'important', 'review', 'complete'],
      maxSelections: 3,
      searchable: true,
      showSelectAll: true
    }
  }
];
```

### Boolean Editor

Checkbox editor for true/false values.

```typescript
columnDefs = [
  {
    field: 'isActive',
    headerName: 'Active',
    editable: true,
    cellEditor: 'blgBooleanEditor',
    cellEditorParams: {
      trueValue: 'Yes',
      falseValue: 'No',
      indeterminate: false
    }
  }
];
```

## Custom Cell Editors

### Creating a Custom Editor

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ICellEditorAngularComp } from '@ng-ui/grid';

@Component({
  selector: 'app-rich-text-editor',
  template: `
    <div class="rich-text-editor">
      <div class="toolbar">
        <button (click)="toggleBold()">Bold</button>
        <button (click)="toggleItalic()">Italic</button>
        <button (click)="toggleUnderline()">Underline</button>
      </div>
      <div 
        #editor
        class="editor-content"
        contenteditable="true"
        (input)="onInput()"
        (keydown)="onKeyDown($event)">
      </div>
    </div>
  `,
  styles: [`
    .rich-text-editor {
      border: 1px solid #ccc;
      border-radius: 4px;
      min-height: 100px;
      width: 300px;
    }
    .toolbar {
      background: #f5f5f5;
      padding: 5px;
      border-bottom: 1px solid #ccc;
    }
    .editor-content {
      padding: 10px;
      outline: none;
    }
  `]
})
export class RichTextEditorComponent implements ICellEditorAngularComp, AfterViewInit {
  @ViewChild('editor', { static: true }) editor!: ElementRef;
  
  private params: any;
  private value: string = '';

  agInit(params: any): void {
    this.params = params;
    this.value = params.value || '';
  }

  ngAfterViewInit(): void {
    this.editor.nativeElement.innerHTML = this.value;
    this.editor.nativeElement.focus();
  }

  getValue(): string {
    return this.editor.nativeElement.innerHTML;
  }

  onInput(): void {
    // Optional: Real-time value updates
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.params.stopEditing();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.params.stopEditing(true); // Cancel editing
    }
  }

  toggleBold(): void {
    document.execCommand('bold');
    this.editor.nativeElement.focus();
  }

  toggleItalic(): void {
    document.execCommand('italic');
    this.editor.nativeElement.focus();
  }

  toggleUnderline(): void {
    document.execCommand('underline');
    this.editor.nativeElement.focus();
  }
}
```

### Register Custom Editor

```typescript
@Component({
  selector: 'app-grid',
  template: `
    <ng-ui-lib 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [frameworkComponents]="frameworkComponents">
    </ng-ui-lib>
  `
})
export class GridComponent {
  frameworkComponents = {
    richTextEditor: RichTextEditorComponent
  };

  columnDefs = [
    {
      field: 'description',
      headerName: 'Description',
      editable: true,
      cellEditor: 'richTextEditor',
      cellEditorParams: {
        maxHeight: 200
      }
    }
  ];
}
```

## Advanced Editor Examples

### Async Data Editor

```typescript
@Component({
  selector: 'app-async-select-editor',
  template: `
    <select 
      [(ngModel)]="selectedValue"
      (change)="onSelectionChange()"
      [disabled]="loading">
      <option value="" disabled>
        {{ loading ? 'Loading...' : 'Select option...' }}
      </option>
      <option *ngFor="let option of options" [value]="option.value">
        {{ option.label }}
      </option>
    </select>
  `
})
export class AsyncSelectEditorComponent implements ICellEditorAngularComp {
  selectedValue: any = '';
  options: any[] = [];
  loading: boolean = true;
  private params: any;

  async agInit(params: any): Promise<void> {
    this.params = params;
    this.selectedValue = params.value;
    
    // Load options asynchronously
    try {
      this.options = await this.loadOptions(params.data);
    } catch (error) {
      console.error('Failed to load options:', error);
      this.options = [];
    } finally {
      this.loading = false;
    }
  }

  getValue(): any {
    return this.selectedValue;
  }

  onSelectionChange(): void {
    // Optional: Immediate value update
    this.params.node.setDataValue(this.params.column.getColId(), this.selectedValue);
  }

  private async loadOptions(rowData: any): Promise<any[]> {
    // Simulate async data loading
    const response = await this.dataService.getOptionsForRow(rowData.id);
    return response.options;
  }
}
```

### Validation-Enabled Editor

```typescript
@Component({
  selector: 'app-validated-editor',
  template: `
    <div class="validated-editor">
      <input 
        [(ngModel)]="value"
        (input)="onInput()"
        (blur)="validate()"
        [class.error]="hasError"
        type="text">
      <div class="error-message" *ngIf="hasError">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .validated-editor {
      min-width: 200px;
    }
    .error {
      border-color: #f44336 !important;
      background-color: #ffebee;
    }
    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 2px;
    }
  `]
})
export class ValidatedEditorComponent implements ICellEditorAngularComp {
  value: string = '';
  hasError: boolean = false;
  errorMessage: string = '';
  private params: any;
  private validators: Function[] = [];

  agInit(params: any): void {
    this.params = params;
    this.value = params.value || '';
    this.validators = params.validators || [];
  }

  getValue(): string {
    return this.hasError ? this.params.value : this.value; // Don't return invalid values
  }

  onInput(): void {
    this.hasError = false;
    this.errorMessage = '';
  }

  validate(): boolean {
    for (const validator of this.validators) {
      try {
        validator(this.value);
      } catch (error) {
        this.hasError = true;
        this.errorMessage = error.message;
        return false;
      }
    }
    return true;
  }

  // Prevent invalid values from being committed
  isCancelBeforeStart(): boolean {
    return false;
  }

  isCancelAfterEnd(): boolean {
    return this.hasError;
  }
}
```

## Editor Lifecycle

### Lifecycle Methods

```typescript
export class CustomEditorComponent implements ICellEditorAngularComp {
  // Called when editor is created
  agInit(params: any): void {
    console.log('Editor initialized with params:', params);
  }

  // Called after the GUI for this editor is created
  afterGuiAttached?(): void {
    console.log('Editor GUI attached');
    // Focus input, select text, etc.
  }

  // Return the final value when editing stops
  getValue(): any {
    return this.currentValue;
  }

  // Called when editing stops
  destroy?(): void {
    console.log('Editor destroyed');
    // Cleanup subscriptions, timers, etc.
  }

  // Return true to prevent editing from starting
  isCancelBeforeStart?(): boolean {
    return false;
  }

  // Return true to cancel the edit after it has been committed
  isCancelAfterEnd?(): boolean {
    return false;
  }

  // Handle focus events
  focusIn?(): void {
    console.log('Editor focused');
  }

  focusOut?(): void {
    console.log('Editor lost focus');
  }
}
```

## Editor Parameters

### Common Parameters

```typescript
cellEditorParams = {
  // Validation function
  validator: (value: any) => {
    if (!value) throw new Error('Value is required');
    return true;
  },
  
  // Async validation
  asyncValidator: async (value: any) => {
    const isValid = await this.validateAsync(value);
    if (!isValid) throw new Error('Invalid value');
    return true;
  },
  
  // Custom configuration
  config: {
    theme: 'light',
    readonly: false,
    autoComplete: true
  },
  
  // Event callbacks
  onValueChange: (newValue: any) => {
    console.log('Value changed to:', newValue);
  },
  
  onFocus: () => {
    console.log('Editor focused');
  },
  
  onBlur: () => {
    console.log('Editor blurred');
  }
};
```

## API Reference

### ICellEditorAngularComp Interface

| Method | Description | Required |
|--------|-------------|----------|
| `agInit(params)` | Initialize editor with parameters | Yes |
| `getValue()` | Return the current value | Yes |
| `afterGuiAttached()` | Called after GUI is attached | No |
| `destroy()` | Cleanup when editor is destroyed | No |
| `isCancelBeforeStart()` | Prevent editing from starting | No |
| `isCancelAfterEnd()` | Cancel edit after completion | No |
| `focusIn()` | Handle focus events | No |
| `focusOut()` | Handle blur events | No |

### Editor Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | any | Current cell value |
| `oldValue` | any | Previous cell value |
| `node` | RowNode | The row node being edited |
| `data` | any | Row data object |
| `column` | Column | Column being edited |
| `columnApi` | ColumnApi | Column API reference |
| `api` | GridApi | Grid API reference |
| `context` | any | Grid context |
| `stopEditing` | function | Function to stop editing |

## Performance Tips

1. **Lazy Loading**: Load editor data only when needed
2. **Debounce Validation**: Avoid validating on every keystroke
3. **Virtual Components**: Use OnPush change detection for complex editors
4. **Memory Management**: Always cleanup subscriptions in destroy()

```typescript
export class OptimizedEditorComponent implements ICellEditorAngularComp, OnDestroy {
  private subscription?: Subscription;
  private validationTimeout?: number;

  agInit(params: any): void {
    // Debounced validation
    this.debouncedValidation = debounce(this.validate.bind(this), 300);
  }

  onInput(): void {
    this.debouncedValidation();
  }

  private validate(): void {
    // Validation logic
  }

  destroy(): void {
    this.subscription?.unsubscribe();
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }
  }
}
```

## Common Patterns

### Dependent Editors

```typescript
// Editor that updates based on other column values
export class DependentEditorComponent implements ICellEditorAngularComp {
  agInit(params: any): void {
    // Watch for changes in related columns
    params.api.addEventListener('cellValueChanged', (event) => {
      if (event.column.getColId() === 'category' && 
          event.node === params.node) {
        this.updateOptions(event.newValue);
      }
    });
  }

  private updateOptions(category: string): void {
    // Update editor options based on category
    this.options = this.getOptionsForCategory(category);
  }
}
```

### Multi-Step Editors

```typescript
export class WizardEditorComponent implements ICellEditorAngularComp {
  currentStep: number = 1;
  totalSteps: number = 3;
  wizardData: any = {};

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getValue(): any {
    return this.wizardData;
  }
}
```

## Troubleshooting

### Common Issues

1. **Editor not showing**: Check if `cellEditor` is correctly registered in `frameworkComponents`
2. **Value not updating**: Ensure `getValue()` returns the correct value
3. **Focus issues**: Implement `afterGuiAttached()` to set initial focus
4. **Memory leaks**: Always cleanup in `destroy()` method

### Debugging

```typescript
export class DebuggableEditorComponent implements ICellEditorAngularComp {
  agInit(params: any): void {
    console.log('Editor params:', params);
    console.log('Initial value:', params.value);
    console.log('Row data:', params.data);
  }

  getValue(): any {
    const value = this.currentValue;
    console.log('Returning value:', value);
    return value;
  }
}
```

## Best Practices

1. **Always implement getValue()** correctly to return the current editor value
2. **Handle keyboard events** appropriately (Enter to confirm, Escape to cancel)
3. **Provide visual feedback** for validation errors and loading states
4. **Use appropriate input types** for different data types
5. **Implement proper cleanup** in the destroy() method
6. **Test editor behavior** across different browsers and devices
7. **Consider accessibility** with proper ARIA attributes and keyboard navigation
8. **Optimize performance** for complex editors with debouncing and lazy loading