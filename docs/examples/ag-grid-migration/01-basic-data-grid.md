# Example 1: Basic Data Grid Migration

## 📚 Target Audience: Library Users

This example demonstrates migrating a simple ag-Grid data grid with basic features to BLG Grid.

## 🎯 What This Example Covers

- Basic data display
- Column configuration
- Default styling
- Simple data binding

## 📊 Before: ag-Grid Implementation

### Component File (my-basic-grid.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-my-basic-grid',
  templateUrl: './my-basic-grid.component.html',
  styleUrls: ['./my-basic-grid.component.scss']
})
export class MyBasicGridComponent implements OnInit {
  
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Name', width: 120 },
    { field: 'lastName', headerName: 'Last Name', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'salary', headerName: 'Salary', width: 120 }
  ];

  gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    },
    animateRows: true,
    rowSelection: 'single'
  };

  rowData: any[] = [];

  constructor() {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Simulate API call
    this.rowData = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', department: 'Engineering', salary: 75000 },
      { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com', department: 'Marketing', salary: 65000 },
      { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@company.com', department: 'Sales', salary: 70000 },
      { id: 4, firstName: 'Alice', lastName: 'Brown', email: 'alice.brown@company.com', department: 'Engineering', salary: 80000 },
      { id: 5, firstName: 'Charlie', lastName: 'Wilson', email: 'charlie.wilson@company.com', department: 'HR', salary: 60000 }
    ];
  }
}
```

### Template File (my-basic-grid.component.html)

```html
<div class="grid-container">
  <h2>Employee Data Grid</h2>
  
  <ag-grid-angular
    class="ag-theme-alpine"
    style="width: 100%; height: 400px;"
    [columnDefs]="columnDefs"
    [rowData]="rowData"
    [gridOptions]="gridOptions">
  </ag-grid-angular>
</div>
```

### Styles (my-basic-grid.component.scss)

```scss
.grid-container {
  padding: 20px;
  
  h2 {
    margin-bottom: 15px;
    color: #333;
  }
}

.ag-theme-alpine {
  border: 1px solid #ddd;
  border-radius: 4px;
}
```

### Module Registration

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { MyBasicGridComponent } from './my-basic-grid.component';

@NgModule({
  declarations: [MyBasicGridComponent],
  imports: [
    CommonModule,
    AgGridModule
  ],
  exports: [MyBasicGridComponent]
})
export class MyBasicGridModule { }
```

## ✅ After: BLG Grid Implementation

### Component File (my-basic-grid.component.ts)

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-my-basic-grid',
  standalone: true,
  imports: [Grid],
  templateUrl: './my-basic-grid.component.html',
  styleUrls: ['./my-basic-grid.component.scss']
})
export class MyBasicGridComponent implements OnInit {
  
  columns: ColumnDefinition[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Name', width: 120 },
    { field: 'lastName', headerName: 'Last Name', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'salary', headerName: 'Salary', width: 120 }
  ];

  config: GridConfig = {
    defaultColumnOptions: {
      resizable: true,
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    animateRows: true,
    rowSelection: 'single'
  };

  data = signal<any[]>([]);

  constructor() {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Simulate API call
    const employeeData = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', department: 'Engineering', salary: 75000 },
      { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com', department: 'Marketing', salary: 65000 },
      { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@company.com', department: 'Sales', salary: 70000 },
      { id: 4, firstName: 'Alice', lastName: 'Brown', email: 'alice.brown@company.com', department: 'Engineering', salary: 80000 },
      { id: 5, firstName: 'Charlie', lastName: 'Wilson', email: 'charlie.wilson@company.com', department: 'HR', salary: 60000 }
    ];
    
    this.data.set(employeeData);
  }
}
```

### Template File (my-basic-grid.component.html)

```html
<div class="grid-container">
  <h2>Employee Data Grid</h2>
  
  <ng-ui-lib
    class="blg-theme-default"
    style="width: 100%; height: 400px;"
    [columns]="columns"
    [data]="data"
    [config]="config">
  </ng-ui-lib>
</div>
```

### Styles (my-basic-grid.component.scss)

```scss
.grid-container {
  padding: 20px;
  
  h2 {
    margin-bottom: 15px;
    color: #333;
  }
}

.blg-theme-default {
  border: 1px solid #ddd;
  border-radius: 4px;
}
```

## 🔍 Migration Changes Summary

### Key Changes Made

1. **Imports Updated**
   ```typescript
   // Before
   import { ColDef, GridOptions } from 'ag-grid-community';
   
   // After  
   import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';
   import { Grid } from '@ng-ui-lib/grid';
   ```

2. **Component Made Standalone**
   ```typescript
   // Before: NgModule-based
   @Component({
     selector: 'app-my-basic-grid',
     templateUrl: './my-basic-grid.component.html',
     styleUrls: ['./my-basic-grid.component.scss']
   })
   
   // After: Standalone
   @Component({
     selector: 'app-my-basic-grid',
     standalone: true,
     imports: [Grid],
     templateUrl: './my-basic-grid.component.html',
     styleUrls: ['./my-basic-grid.component.scss']
   })
   ```

3. **Property Names Changed**
   ```typescript
   // Before
   columnDefs: ColDef[]
   gridOptions: GridOptions
   rowData: any[]
   
   // After
   columns: ColumnDefinition[]
   config: GridConfig  
   data = signal<any[]>([])
   ```

4. **Configuration Structure Updated**
   ```typescript
   // Before
   gridOptions: GridOptions = {
     defaultColDef: {
       resizable: true,
       sortable: true,
       filter: true
     }
   };
   
   // After
   config: GridConfig = {
     defaultColumnOptions: {
       resizable: true,
       sortable: true,
       filterable: true,
       filterType: 'text'
     }
   };
   ```

5. **Data Binding with Signals**
   ```typescript
   // Before
   rowData: any[] = [];
   this.rowData = employeeData;
   
   // After
   data = signal<any[]>([]);
   this.data.set(employeeData);
   ```

6. **Template Updates**
   ```html
   <!-- Before -->
   <ag-grid-angular
     class="ag-theme-alpine"
     [columnDefs]="columnDefs"
     [rowData]="rowData"
     [gridOptions]="gridOptions">
   </ag-grid-angular>
   
   <!-- After -->
   <ng-ui-lib
     class="blg-theme-default"
     [columns]="columns"
     [data]="data"
     [config]="config">
   </ng-ui-lib>
   ```

7. **CSS Classes Updated**
   ```scss
   // Before
   .ag-theme-alpine { /* styles */ }
   
   // After
   .blg-theme-default { /* styles */ }
   ```

## ⚡ Migration Steps

1. **Install BLG Grid packages**
   ```bash
   npm uninstall ag-grid-angular ag-grid-community
   npm install @ng-ui-lib/core @ng-ui-lib/grid @ng-ui-lib/theme
   ```

2. **Update imports**
   - Replace ag-Grid imports with BLG Grid imports
   - Add Grid component to standalone imports

3. **Convert configuration**
   - Rename `columnDefs` to `columns`
   - Rename `gridOptions` to `config`
   - Move `defaultColDef` to `defaultColumnOptions`
   - Change `filter: true` to `filterable: true`

4. **Update data binding**
   - Convert `rowData` array to `data` signal
   - Use `this.data.set()` instead of direct assignment

5. **Update template**
   - Replace `ag-grid-angular` with `ng-ui-lib`
   - Update property bindings
   - Change theme class

6. **Test functionality**
   - Verify data displays correctly
   - Test sorting by clicking column headers
   - Test filtering with column filters
   - Test column resizing

## 🧪 Testing the Migration

### Functional Tests

```typescript
// Add these methods to test the migration
export class MyBasicGridComponent implements OnInit {
  // ... existing code ...

  // Test data updates
  addEmployee() {
    const newEmployee = {
      id: this.data().length + 1,
      firstName: 'New',
      lastName: 'Employee',
      email: 'new.employee@company.com',
      department: 'IT',
      salary: 55000
    };
    
    this.data.update(current => [...current, newEmployee]);
  }

  // Test data clearing
  clearData() {
    this.data.set([]);
  }

  // Test data reload
  reloadData() {
    this.loadData();
  }
}
```

### Add Test Buttons to Template

```html
<div class="grid-container">
  <h2>Employee Data Grid</h2>
  
  <div class="button-bar">
    <button (click)="addEmployee()">Add Employee</button>
    <button (click)="clearData()">Clear Data</button>  
    <button (click)="reloadData()">Reload Data</button>
  </div>
  
  <ng-ui-lib
    class="blg-theme-default"
    style="width: 100%; height: 400px;"
    [columns]="columns"
    [data]="data"
    [config]="config">
  </ng-ui-lib>
</div>
```

## 📈 Expected Benefits

After migration, you should see:

- ✅ **Better Performance**: Faster initial rendering with Angular Signals
- ✅ **Smaller Bundle**: Reduced bundle size without ag-Grid dependencies  
- ✅ **Modern Angular**: Uses latest Angular patterns and features
- ✅ **TypeScript Support**: Better IntelliSense and type checking
- ✅ **No Licensing**: MIT license, no subscription fees

## 🐛 Common Issues & Solutions

### Issue: Grid not displaying
**Solution**: Ensure height is set on grid container
```scss
.blg-theme-default {
  height: 400px; // Always set explicit height
}
```

### Issue: Filters not working
**Solution**: Check filter configuration
```typescript
// Ensure filterable is true and filterType is set
{ field: 'name', filterable: true, filterType: 'text' }
```

### Issue: Data not updating
**Solution**: Use signal methods
```typescript
// Wrong
this.data = newData;

// Correct
this.data.set(newData);
```

## 🎉 Migration Completed!

Your basic data grid is now running on BLG Grid! This example demonstrated:

- Converting column definitions
- Updating grid configuration  
- Migrating to signals for data binding
- Updating templates and styling
- Testing the migration

**Next Steps:**
- [Example 2: Grid with Filtering and Sorting](./02-filtering-sorting.md)
- [Example 3: Custom Cell Renderers](./03-custom-renderers.md)
- [Complete Migration Guide](../migration/from-ag-grid.md)

**Migration Time**: ~15-30 minutes for a basic grid like this.