# Example 4: Grid with Cell Editing

## 📚 Target Audience: Library Users

This example demonstrates migrating an ag-Grid with various cell editors and editing configurations to BLG Grid, including inline editing, validation, custom editors, and editing events.

## 🎯 What This Example Covers

- Inline cell editing with different editor types
- Custom cell editors with validation
- Edit modes (single click, double click)
- Cell validation and error handling
- Editing events and callbacks
- Conditional editing based on row data
- Full row editing vs cell editing
- Tab navigation during editing

## 📊 Before: ag-Grid Implementation

### Custom Select Editor (select-editor.component.ts)

```typescript
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';

@Component({
  selector: 'app-select-editor',
  template: `
    <select #selectElement class="custom-select" [(ngModel)]="value">
      <option *ngFor="let option of options" [value]="option.value">
        {{ option.label }}
      </option>
    </select>
  `,
  styles: [`
    .custom-select {
      width: 100%;
      height: 100%;
      border: 2px solid #007bff;
      outline: none;
      font-size: 14px;
    }
  `]
})
export class SelectEditorComponent implements ICellEditorAngularComp, AfterViewInit {
  @ViewChild('selectElement') selectElement!: ElementRef;
  
  params!: ICellEditorParams & {
    options: { value: any, label: string }[];
  };
  value: any;
  options: { value: any, label: string }[] = [];

  agInit(params: any): void {
    this.params = params;
    this.value = params.value;
    this.options = params.options || [];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.selectElement.nativeElement.focus();
    });
  }

  getValue(): any {
    return this.value;
  }

  isPopup(): boolean {
    return false;
  }

  isCancelBeforeStart(): boolean {
    return false;
  }

  isCancelAfterEnd(): boolean {
    return false;
  }
}
```

### Custom Number Editor (number-editor.component.ts)

```typescript
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-number-editor',
  template: `
    <input 
      #numberInput
      type="number"
      class="number-input"
      [(ngModel)]="value"
      [min]="min"
      [max]="max"
      [step]="step">
  `,
  styles: [`
    .number-input {
      width: 100%;
      height: 100%;
      border: 2px solid #28a745;
      outline: none;
      font-size: 14px;
      padding: 0 8px;
    }
  `]
})
export class NumberEditorComponent implements ICellEditorAngularComp, AfterViewInit {
  @ViewChild('numberInput') numberInput!: ElementRef;
  
  value: number = 0;
  min: number = 0;
  max: number = 1000000;
  step: number = 1;

  agInit(params: any): void {
    this.value = parseFloat(params.value) || 0;
    this.min = params.min || 0;
    this.max = params.max || 1000000;
    this.step = params.step || 1;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.numberInput.nativeElement.focus();
      this.numberInput.nativeElement.select();
    });
  }

  getValue(): any {
    return this.value;
  }

  isPopup(): boolean {
    return false;
  }
}
```

### Main Grid Component (cell-editing-grid.component.ts)

```typescript
import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { 
  ColDef, 
  GridOptions, 
  GridApi, 
  CellEditingStartedEvent,
  CellEditingStoppedEvent,
  CellValueChangedEvent 
} from 'ag-grid-community';
import { SelectEditorComponent } from './select-editor.component';
import { NumberEditorComponent } from './number-editor.component';

@Component({
  selector: 'app-cell-editing-grid',
  templateUrl: './cell-editing-grid.component.html',
  styleUrls: ['./cell-editing-grid.component.scss']
})
export class CellEditingGridComponent implements OnInit {
  @ViewChild('agGrid') agGrid!: AgGridAngular;

  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      editable: false 
    },
    { 
      field: 'firstName', 
      headerName: 'First Name', 
      width: 150,
      editable: true,
      cellEditor: 'agTextCellEditor',
      cellEditorParams: {
        maxLength: 20
      },
      onCellValueChanged: (params) => {
        console.log('First name changed:', params.newValue);
      }
    },
    { 
      field: 'lastName', 
      headerName: 'Last Name', 
      width: 150,
      editable: true,
      cellEditor: 'agTextCellEditor'
    },
    { 
      field: 'age', 
      headerName: 'Age', 
      width: 100,
      editable: true,
      cellEditor: NumberEditorComponent,
      cellEditorParams: {
        min: 18,
        max: 100,
        step: 1
      },
      valueParser: (params) => {
        const newValue = parseInt(params.newValue);
        if (isNaN(newValue) || newValue < 18 || newValue > 100) {
          alert('Age must be between 18 and 100');
          return params.oldValue;
        }
        return newValue;
      }
    },
    { 
      field: 'department', 
      headerName: 'Department', 
      width: 150,
      editable: true,
      cellEditor: SelectEditorComponent,
      cellEditorParams: {
        options: [
          { value: 'Engineering', label: 'Engineering' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'Sales', label: 'Sales' },
          { value: 'HR', label: 'Human Resources' },
          { value: 'Finance', label: 'Finance' }
        ]
      }
    },
    { 
      field: 'salary', 
      headerName: 'Salary', 
      width: 120,
      editable: (params) => {
        // Only allow editing for non-manager roles
        return params.data.role !== 'Manager';
      },
      valueFormatter: (params) => '$' + params.value?.toLocaleString(),
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 30000,
        max: 500000,
        step: 1000
      },
      valueParser: (params) => {
        return parseInt(params.newValue);
      }
    },
    { 
      field: 'startDate', 
      headerName: 'Start Date', 
      width: 130,
      editable: true,
      cellEditor: 'agDateCellEditor',
      valueFormatter: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString();
        }
        return '';
      }
    },
    { 
      field: 'active', 
      headerName: 'Active', 
      width: 100,
      editable: true,
      cellRenderer: (params) => params.value ? '✅ Yes' : '❌ No',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [true, false],
        valueListGap: 0,
        valueListMaxHeight: 50
      },
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    { 
      field: 'notes', 
      headerName: 'Notes', 
      width: 200,
      editable: true,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      cellEditorParams: {
        maxLength: 500,
        rows: 5,
        cols: 50
      }
    }
  ];

  gridOptions: GridOptions = {
    frameworkComponents: {
      selectEditor: SelectEditorComponent,
      numberEditor: NumberEditorComponent
    },
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    },
    editType: 'fullRow', // or 'cell'
    singleClickEdit: false, // double-click to edit
    suppressClickEdit: false,
    enterMovesDown: true,
    enterMovesDownAfterEdit: true,
    tabToNextCell: (params) => {
      // Custom tab navigation
      return params.nextCellPosition;
    },
    tabToNextHeader: (params) => {
      return params.nextHeaderPosition;
    },
    onCellEditingStarted: (event: CellEditingStartedEvent) => {
      console.log('Cell editing started:', event);
    },
    onCellEditingStopped: (event: CellEditingStoppedEvent) => {
      console.log('Cell editing stopped:', event);
    },
    onCellValueChanged: (event: CellValueChangedEvent) => {
      console.log('Cell value changed:', {
        field: event.colDef.field,
        oldValue: event.oldValue,
        newValue: event.newValue,
        data: event.data
      });
    },
    onGridReady: (params) => {
      this.gridApi = params.api;
    }
  };

  rowData: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.rowData = [
      { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Doe', 
        age: 32, 
        department: 'Engineering', 
        salary: 85000,
        startDate: '2020-03-15',
        active: true,
        role: 'Developer',
        notes: 'Senior developer with React expertise'
      },
      { 
        id: 2, 
        firstName: 'Jane', 
        lastName: 'Smith', 
        age: 28, 
        department: 'Marketing', 
        salary: 65000,
        startDate: '2021-07-10',
        active: true,
        role: 'Specialist',
        notes: 'Digital marketing specialist'
      },
      { 
        id: 3, 
        firstName: 'Bob', 
        lastName: 'Johnson', 
        age: 45, 
        department: 'Sales', 
        salary: 95000,
        startDate: '2018-11-22',
        active: false,
        role: 'Manager',
        notes: 'Sales team manager - salary locked'
      },
      { 
        id: 4, 
        firstName: 'Alice', 
        lastName: 'Brown', 
        age: 35, 
        department: 'HR', 
        salary: 70000,
        startDate: '2019-05-03',
        active: true,
        role: 'Coordinator',
        notes: 'HR coordinator and recruiter'
      }
    ];
  }

  startEditingCell(rowIndex: number, field: string) {
    this.gridApi.startEditingCell({
      rowIndex: rowIndex,
      colKey: field
    });
  }

  stopEditing() {
    this.gridApi.stopEditing();
  }

  addNewRow() {
    const newRow = {
      id: this.rowData.length + 1,
      firstName: '',
      lastName: '',
      age: 25,
      department: 'Engineering',
      salary: 50000,
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      role: 'Developer',
      notes: ''
    };

    this.rowData = [...this.rowData, newRow];
    
    // Start editing the first editable cell of the new row
    setTimeout(() => {
      this.startEditingCell(this.rowData.length - 1, 'firstName');
    }, 100);
  }

  validateAndSave() {
    // Validate all data before saving
    const invalidRows: any[] = [];
    
    this.rowData.forEach((row, index) => {
      if (!row.firstName || !row.lastName) {
        invalidRows.push({ index, issue: 'Name fields required' });
      }
      if (row.age < 18 || row.age > 100) {
        invalidRows.push({ index, issue: 'Invalid age' });
      }
    });

    if (invalidRows.length > 0) {
      alert('Validation errors found:\n' + 
        invalidRows.map(err => `Row ${err.index + 1}: ${err.issue}`).join('\n'));
      return;
    }

    console.log('Data validated and ready to save:', this.rowData);
    alert('Data validated successfully!');
  }
}
```

## ✅ After: BLG Grid Implementation

### Custom Select Editor (select-editor.component.ts)

```typescript
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <select #selectElement class="custom-select" [(ngModel)]="value" (ngModelChange)="onValueChange()">
      <option *ngFor="let option of options" [value]="option.value">
        {{ option.label }}
      </option>
    </select>
  `,
  styles: [`
    .custom-select {
      width: 100%;
      height: 100%;
      border: 2px solid #007bff;
      outline: none;
      font-size: 14px;
    }
  `]
})
export class SelectEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('selectElement') selectElement!: ElementRef;
  
  @Input() value: any;
  @Input() rowData: any;
  @Input() column: any;
  @Input() params: any;
  
  @Output() valueChanged = new EventEmitter<any>();

  options: { value: any, label: string }[] = [];

  ngOnInit() {
    this.options = this.params?.options || [];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.selectElement.nativeElement.focus();
    });
  }

  onValueChange() {
    this.valueChanged.emit(this.value);
  }

  getValue(): any {
    return this.value;
  }
}
```

### Custom Number Editor (number-editor.component.ts)

```typescript
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-number-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <input 
      #numberInput
      type="number"
      class="number-input"
      [(ngModel)]="value"
      (ngModelChange)="onValueChange()"
      [min]="min"
      [max]="max"
      [step]="step">
  `,
  styles: [`
    .number-input {
      width: 100%;
      height: 100%;
      border: 2px solid #28a745;
      outline: none;
      font-size: 14px;
      padding: 0 8px;
    }
  `]
})
export class NumberEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('numberInput') numberInput!: ElementRef;
  
  @Input() value: any;
  @Input() rowData: any;
  @Input() column: any;
  @Input() params: any;
  
  @Output() valueChanged = new EventEmitter<any>();

  min: number = 0;
  max: number = 1000000;
  step: number = 1;

  ngOnInit() {
    this.value = parseFloat(this.value) || 0;
    this.min = this.params?.min || 0;
    this.max = this.params?.max || 1000000;
    this.step = this.params?.step || 1;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.numberInput.nativeElement.focus();
      this.numberInput.nativeElement.select();
    });
  }

  onValueChange() {
    this.valueChanged.emit(this.value);
  }

  getValue(): any {
    return this.value;
  }
}
```

### Main Grid Component (cell-editing-grid.component.ts)

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { CommonModule } from '@angular/common';
import { 
  ColumnDefinition, 
  GridConfig, 
  GridApi,
  CellEditStartEvent,
  CellEditEndEvent,
  CellValueChangedEvent 
} from '@ng-ui-lib/core';
import { SelectEditorComponent } from './select-editor.component';
import { NumberEditorComponent } from './number-editor.component';

@Component({
  selector: 'app-cell-editing-grid',
  standalone: true,
  imports: [
    Grid, 
    CommonModule, 
    SelectEditorComponent, 
    NumberEditorComponent
  ],
  templateUrl: './cell-editing-grid.component.html',
  styleUrls: ['./cell-editing-grid.component.scss']
})
export class CellEditingGridComponent implements OnInit {

  private gridApi?: GridApi;

  columns: ColumnDefinition[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      editable: false 
    },
    { 
      field: 'firstName', 
      headerName: 'First Name', 
      width: 150,
      editable: true,
      cellEditor: 'text',
      cellEditorParams: {
        maxLength: 20
      },
      validators: [
        {
          validate: (value: any) => !!value && value.trim().length > 0,
          errorMessage: 'First name is required'
        }
      ]
    },
    { 
      field: 'lastName', 
      headerName: 'Last Name', 
      width: 150,
      editable: true,
      cellEditor: 'text',
      validators: [
        {
          validate: (value: any) => !!value && value.trim().length > 0,
          errorMessage: 'Last name is required'
        }
      ]
    },
    { 
      field: 'age', 
      headerName: 'Age', 
      width: 100,
      editable: true,
      cellEditor: NumberEditorComponent,
      cellEditorParams: {
        min: 18,
        max: 100,
        step: 1
      },
      valueParser: (value: string) => {
        const newValue = parseInt(value);
        return isNaN(newValue) ? null : newValue;
      },
      validators: [
        {
          validate: (value: any) => value >= 18 && value <= 100,
          errorMessage: 'Age must be between 18 and 100'
        }
      ]
    },
    { 
      field: 'department', 
      headerName: 'Department', 
      width: 150,
      editable: true,
      cellEditor: SelectEditorComponent,
      cellEditorParams: {
        options: [
          { value: 'Engineering', label: 'Engineering' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'Sales', label: 'Sales' },
          { value: 'HR', label: 'Human Resources' },
          { value: 'Finance', label: 'Finance' }
        ]
      }
    },
    { 
      field: 'salary', 
      headerName: 'Salary', 
      width: 120,
      editable: (rowData: any) => {
        // Only allow editing for non-manager roles
        return rowData.role !== 'Manager';
      },
      valueFormatter: (value: any) => '$' + value?.toLocaleString(),
      cellEditor: 'number',
      cellEditorParams: {
        min: 30000,
        max: 500000,
        step: 1000
      },
      valueParser: (value: string) => parseInt(value)
    },
    { 
      field: 'startDate', 
      headerName: 'Start Date', 
      width: 130,
      editable: true,
      cellEditor: 'date',
      valueFormatter: (value: any) => {
        if (value) {
          return new Date(value).toLocaleDateString();
        }
        return '';
      }
    },
    { 
      field: 'active', 
      headerName: 'Active', 
      width: 100,
      editable: true,
      cellRenderer: (value: any) => value ? '✅ Yes' : '❌ No',
      cellEditor: 'select',
      cellEditorParams: {
        options: [
          { value: true, label: 'Yes' },
          { value: false, label: 'No' }
        ]
      }
    },
    { 
      field: 'notes', 
      headerName: 'Notes', 
      width: 200,
      editable: true,
      cellEditor: 'textarea',
      cellEditorParams: {
        maxLength: 500,
        rows: 5
      }
    }
  ];

  config: GridConfig = {
    defaultColumnOptions: {
      resizable: true,
      sortable: true,
      filterable: true
    },
    editMode: 'cell', // or 'row'
    singleClickEdit: false, // double-click to edit
    suppressClickEdit: false,
    enterMovesDown: true,
    enterMovesDownAfterEdit: true,
    tabToNextCell: true,
    enableCellValidation: true
  };

  data = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  onGridReady(gridApi: GridApi) {
    this.gridApi = gridApi;
  }

  loadData() {
    const employeeData = [
      { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Doe', 
        age: 32, 
        department: 'Engineering', 
        salary: 85000,
        startDate: '2020-03-15',
        active: true,
        role: 'Developer',
        notes: 'Senior developer with React expertise'
      },
      { 
        id: 2, 
        firstName: 'Jane', 
        lastName: 'Smith', 
        age: 28, 
        department: 'Marketing', 
        salary: 65000,
        startDate: '2021-07-10',
        active: true,
        role: 'Specialist',
        notes: 'Digital marketing specialist'
      },
      { 
        id: 3, 
        firstName: 'Bob', 
        lastName: 'Johnson', 
        age: 45, 
        department: 'Sales', 
        salary: 95000,
        startDate: '2018-11-22',
        active: false,
        role: 'Manager',
        notes: 'Sales team manager - salary locked'
      },
      { 
        id: 4, 
        firstName: 'Alice', 
        lastName: 'Brown', 
        age: 35, 
        department: 'HR', 
        salary: 70000,
        startDate: '2019-05-03',
        active: true,
        role: 'Coordinator',
        notes: 'HR coordinator and recruiter'
      }
    ];

    this.data.set(employeeData);
  }

  startEditingCell(rowIndex: number, field: string) {
    this.gridApi?.startEditingCell(rowIndex, field);
  }

  stopEditing() {
    this.gridApi?.stopEditing();
  }

  addNewRow() {
    const newRow = {
      id: this.data().length + 1,
      firstName: '',
      lastName: '',
      age: 25,
      department: 'Engineering',
      salary: 50000,
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      role: 'Developer',
      notes: ''
    };

    this.data.update(current => [...current, newRow]);
    
    // Start editing the first editable cell of the new row
    setTimeout(() => {
      this.startEditingCell(this.data().length - 1, 'firstName');
    }, 100);
  }

  validateAndSave() {
    // Get validation results from grid
    const validationResults = this.gridApi?.validateAllCells();
    
    if (validationResults && validationResults.length > 0) {
      alert('Validation errors found:\n' + 
        validationResults.map(err => `Row ${err.rowIndex + 1}, ${err.field}: ${err.message}`).join('\n'));
      return;
    }

    console.log('Data validated and ready to save:', this.data());
    alert('Data validated successfully!');
  }

  onCellEditStart(event: CellEditStartEvent) {
    console.log('Cell editing started:', event);
  }

  onCellEditEnd(event: CellEditEndEvent) {
    console.log('Cell editing stopped:', event);
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    console.log('Cell value changed:', {
      field: event.field,
      oldValue: event.oldValue,
      newValue: event.newValue,
      rowData: event.rowData
    });

    // Update the data signal to trigger reactivity
    this.data.update(current => 
      current.map(row => 
        row.id === event.rowData.id 
          ? { ...row, [event.field]: event.newValue }
          : row
      )
    );
  }
}
```

### Template File (cell-editing-grid.component.html)

```html
<div class="grid-container">
  <h2>Employee Management with Cell Editing</h2>
  
  <div class="controls-panel">
    <div class="edit-controls">
      <button (click)="addNewRow()" class="btn btn-primary">
        <i class="fa fa-plus"></i> Add New Employee
      </button>
      <button (click)="validateAndSave()" class="btn btn-success">
        <i class="fa fa-check"></i> Validate & Save
      </button>
      <button (click)="stopEditing()" class="btn btn-secondary">
        <i class="fa fa-stop"></i> Stop Editing
      </button>
    </div>
  </div>

  <div class="info-panel">
    <h3>Editing Features:</h3>
    <ul>
      <li><strong>Text Fields:</strong> First Name, Last Name - with validation</li>
      <li><strong>Number Field:</strong> Age - with min/max validation</li>
      <li><strong>Select Field:</strong> Department - with predefined options</li>
      <li><strong>Conditional Editing:</strong> Salary - disabled for Managers</li>
      <li><strong>Date Field:</strong> Start Date - with date picker</li>
      <li><strong>Boolean Field:</strong> Active - Yes/No dropdown</li>
      <li><strong>Textarea Field:</strong> Notes - for longer text</li>
    </ul>
    <p><em>Double-click cells to edit. Use Tab to navigate between fields.</em></p>
  </div>

  <ng-ui-lib
    class="blg-theme-default"
    style="width: 100%; height: 500px;"
    [columns]="columns"
    [data]="data"
    [config]="config"
    (gridReady)="onGridReady($event)"
    (cellEditStart)="onCellEditStart($event)"
    (cellEditEnd)="onCellEditEnd($event)"
    (cellValueChanged)="onCellValueChanged($event)">
  </ng-ui-lib>
</div>
```

## 🔍 Migration Changes Summary

### Key Changes Made

1. **Editor Interface Updated**
   ```typescript
   // Before: ICellEditorAngularComp interface
   export class SelectEditorComponent implements ICellEditorAngularComp {
     agInit(params: any): void { /* setup */ }
     getValue(): any { /* return value */ }
   }
   
   // After: Standard Angular component
   export class SelectEditorComponent {
     @Input() value: any;
     @Output() valueChanged = new EventEmitter<any>();
     
     getValue(): any { return this.value; }
   }
   ```

2. **Built-in Editor Names**
   ```typescript
   // Before: ag-Grid editor names
   cellEditor: 'agTextCellEditor'
   cellEditor: 'agNumberCellEditor'
   cellEditor: 'agSelectCellEditor'
   
   // After: BLG Grid editor names
   cellEditor: 'text'
   cellEditor: 'number'
   cellEditor: 'select'
   ```

3. **Validation System**
   ```typescript
   // Before: valueParser with alerts
   valueParser: (params) => {
     const newValue = parseInt(params.newValue);
     if (isNaN(newValue) || newValue < 18) {
       alert('Invalid age');
       return params.oldValue;
     }
     return newValue;
   }
   
   // After: Validators array
   validators: [
     {
       validate: (value: any) => value >= 18 && value <= 100,
       errorMessage: 'Age must be between 18 and 100'
     }
   ]
   ```

4. **Event Handling**
   ```typescript
   // Before: Grid options events
   onCellEditingStarted: (event) => { /* handler */ }
   onCellEditingStopped: (event) => { /* handler */ }
   onCellValueChanged: (event) => { /* handler */ }
   
   // After: Template event binding
   (cellEditStart)="onCellEditStart($event)"
   (cellEditEnd)="onCellEditEnd($event)"
   (cellValueChanged)="onCellValueChanged($event)"
   ```

5. **Configuration Updates**
   ```typescript
   // Before
   editType: 'fullRow'
   singleClickEdit: false
   
   // After
   editMode: 'row'
   singleClickEdit: false
   ```

## 🧪 Testing Cell Editing

### Comprehensive Test Scenarios

```typescript
// Add to component for testing
export class CellEditingGridComponent implements OnInit {
  // ... existing code ...

  // Test programmatic editing
  testProgrammaticEdit() {
    // Start editing specific cell
    this.startEditingCell(0, 'firstName');
    
    // After 2 seconds, change the value programmatically
    setTimeout(() => {
      this.data.update(current => 
        current.map((row, index) => 
          index === 0 
            ? { ...row, firstName: 'Updated Name' }
            : row
        )
      );
    }, 2000);
  }

  // Test validation errors
  testValidationErrors() {
    this.data.update(current => 
      current.map((row, index) => 
        index === 0 
          ? { ...row, age: 15, firstName: '' } // Invalid values
          : row
      )
    );
    
    setTimeout(() => this.validateAndSave(), 100);
  }

  // Test bulk editing
  testBulkEdit() {
    // Set all employees to active
    this.data.update(current => 
      current.map(row => ({ ...row, active: true }))
    );
  }

  // Export edited data
  exportData() {
    const csvData = this.convertToCSV(this.data());
    this.downloadCSV(csvData, 'employees.csv');
  }

  private convertToCSV(data: any[]): string {
    const headers = this.columns
      .filter(col => col.field !== 'actions')
      .map(col => col.headerName || col.field);
    
    const rows = data.map(row => 
      this.columns
        .filter(col => col.field !== 'actions')
        .map(col => row[col.field] || '')
    );

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  private downloadCSV(csvContent: string, fileName: string) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
```

## 📈 Expected Benefits

After migration, you should see:

- ✅ **Better Validation**: Built-in validation system with error messages
- ✅ **Reactive Updates**: Automatic UI updates with Angular Signals
- ✅ **Simpler Editor API**: Standard Angular component inputs/outputs
- ✅ **Type Safety**: Full TypeScript support for editors and validation
- ✅ **Better Performance**: Optimized change detection during editing

## 🐛 Common Issues & Solutions

### Issue: Editor not appearing
**Solution**: Check if column is marked as editable
```typescript
{ field: 'name', editable: true, cellEditor: 'text' }
```

### Issue: Validation not working
**Solution**: Enable validation in config and add validators
```typescript
config: GridConfig = {
  enableCellValidation: true
};

// Column definition
validators: [
  {
    validate: (value: any) => !!value,
    errorMessage: 'Field is required'
  }
]
```

### Issue: Custom editor not working
**Solution**: Import editor component and check inputs/outputs
```typescript
@Component({
  imports: [Grid, MyCustomEditor],
  // ...
})

// Editor component needs proper inputs
@Input() value: any;
@Output() valueChanged = new EventEmitter<any>();
```

### Issue: Tab navigation not working
**Solution**: Enable tab navigation in config
```typescript
config: GridConfig = {
  tabToNextCell: true,
  enterMovesDown: true
};
```

## 🎉 Migration Completed!

Your cell editing grid is now running on BLG Grid! This example demonstrated:

- Converting custom cell editors to Angular components
- Updating validation from valueParser to validators array  
- Migrating built-in editor configurations
- Converting editing events and callbacks
- Implementing reactive data updates with signals

**Next Steps:**
- [Example 5: Row Grouping](./05-row-grouping.md)
- [Example 6: Server-Side Data](./06-server-side-data.md)
- [Cell Editing Guide](../../features/editing/cell-editing.md)

**Migration Time**: ~2-3 hours for complex editing features like this.