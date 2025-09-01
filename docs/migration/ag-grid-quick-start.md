# ag-Grid Quick Start Migration (5 Minutes)

## 📚 Target Audience: Library Users

Get your basic ag-Grid up and running with BLG Grid in just 5 minutes. This guide covers the most common migration scenarios with minimal configuration changes.

## 🚀 Prerequisites

- Basic ag-Grid implementation (community edition features)
- Angular 17+ application
- TypeScript 5.0+
- Node.js 18+

## ⚡ 5-Minute Migration Steps

### Step 1: Install BLG Grid (30 seconds)

```bash
# Remove ag-grid packages
npm uninstall ag-grid-angular ag-grid-community

# Install BLG Grid
npm install @ng-ui-lib/core @ng-ui-lib/grid @ng-ui-lib/theme
```

### Step 2: Update Your Component (2 minutes)

**Before (ag-Grid):**
```typescript
import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';

@Component({
  template: `
    <ag-grid-angular 
      class="ag-theme-alpine"
      style="width: 100%; height: 400px;"
      [columnDefs]="columnDefs"
      [rowData]="rowData"
      [defaultColDef]="defaultColDef">
    </ag-grid-angular>
  `
})
export class MyGridComponent {
  columnDefs: ColDef[] = [
    { field: 'make' },
    { field: 'model' },
    { field: 'price' }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 }
  ];
}
```

**After (BLG Grid):**
```typescript
import { Component, signal } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';

@Component({
  standalone: true,
  imports: [Grid],
  template: `
    <ng-ui-lib 
      class="blg-theme-default"
      style="width: 100%; height: 400px;"
      [columns]="columns"
      [data]="data"
      [config]="config">
    </ng-ui-lib>
  `
})
export class MyGridComponent {
  columns: ColumnDefinition[] = [
    { field: 'make' },
    { field: 'model' },
    { field: 'price' }
  ];

  config: GridConfig = {
    defaultColumnOptions: {
      sortable: true,
      filterable: true,
      resizable: true
    }
  };

  data = signal([
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 }
  ]);
}
```

### Step 3: Update Styling (1 minute)

**Before (ag-Grid CSS):**
```scss
@import "~ag-grid-community/styles/ag-grid.css";
@import "~ag-grid-community/styles/ag-theme-alpine.css";
```

**After (BLG Grid CSS):**
```scss
@import "@ng-ui-lib/theme/styles/blg-grid.css";
@import "@ng-ui-lib/theme/styles/themes/default.css";
```

### Step 4: Update Module Imports (1 minute)

**Before (ag-Grid Module):**
```typescript
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  imports: [AgGridModule]
})
export class AppModule {}
```

**After (BLG Grid Standalone):**
```typescript
// No module imports needed!
// Just import Grid component directly in your components
import { Grid } from '@ng-ui-lib/grid';
```

### Step 5: Test and Validate (30 seconds)

Start your development server and verify:
- ✅ Grid renders correctly
- ✅ Data displays properly
- ✅ Sorting works by clicking headers
- ✅ Basic filtering is available
- ✅ Columns can be resized

## 🎯 Quick Configuration Mapping

### Essential Properties

| ag-Grid Property | BLG Grid Property | Example |
|------------------|-------------------|---------|
| `columnDefs` | `columns` | `[columns]="columns"` |
| `rowData` | `data` | `[data]="data"` |
| `defaultColDef` | `config.defaultColumnOptions` | See config object |
| `gridOptions` | `config` | `[config]="config"` |

### Common Configuration Options

| ag-Grid | BLG Grid | Notes |
|---------|----------|-------|
| `enableSorting: true` | `config: { enableSorting: true }` | Global sorting toggle |
| `enableFilter: true` | `config: { enableFiltering: true }` | Global filtering toggle |
| `enableColResize: true` | `config: { enableColumnResize: true }` | Column resizing |
| `rowSelection: 'single'` | `config: { rowSelection: 'single' }` | Row selection mode |
| `rowSelection: 'multiple'` | `config: { rowSelection: 'multiple' }` | Multi-row selection |
| `suppressRowClickSelection` | `config: { clickToSelect: false }` | Disable click selection |

### Column Definition Mapping

| ag-Grid ColDef | BLG Grid ColumnDefinition | Notes |
|----------------|---------------------------|-------|
| `field: 'name'` | `field: 'name'` | Same |
| `headerName: 'Full Name'` | `headerName: 'Full Name'` | Same |
| `width: 150` | `width: 150` | Same |
| `minWidth: 100` | `minWidth: 100` | Same |
| `maxWidth: 300` | `maxWidth: 300` | Same |
| `sortable: true` | `sortable: true` | Same |
| `filter: true` | `filterable: true` | Different property name |
| `resizable: true` | `resizable: true` | Same |
| `hide: true` | `hidden: true` | Different property name |
| `pinned: 'left'` | `pinned: 'left'` | Same |

## ⚠️ Common Gotchas

### 1. Import Paths
```typescript
// ❌ Wrong - old ag-grid import
import { ColDef } from 'ag-grid-community';

// ✅ Correct - BLG Grid import  
import { ColumnDefinition } from '@ng-ui-lib/core';
```

### 2. Property Names
```typescript
// ❌ Wrong - ag-grid property names
{ field: 'name', filter: true, hide: true }

// ✅ Correct - BLG Grid property names
{ field: 'name', filterable: true, hidden: true }
```

### 3. Data Binding
```typescript
// ❌ Wrong - direct assignment
rowData = newData;

// ✅ Correct - using signals
data.set(newData);
```

### 4. Theme Classes
```html
<!-- ❌ Wrong - ag-grid theme -->
<ag-grid-angular class="ag-theme-alpine">

<!-- ✅ Correct - BLG Grid theme -->
<ng-ui-lib class="blg-theme-default">
```

### 5. Event Handling
```typescript
// ❌ Wrong - ag-grid events
onGridReady(params) { this.gridApi = params.api; }

// ✅ Correct - BLG Grid events
onGridReady(gridApi) { this.gridApi = gridApi; }
```

## 🔄 Quick Reference Card

### Basic Grid Template
```html
<ng-ui-lib
  class="blg-theme-default"
  style="height: 400px;"
  [data]="data"
  [columns]="columns"
  [config]="config"
  (selectionChanged)="onSelectionChanged($event)"
  (cellClicked)="onCellClicked($event)">
</ng-ui-lib>
```

### Basic Configuration
```typescript
config: GridConfig = {
  enableSorting: true,
  enableFiltering: true,
  enableColumnResize: true,
  rowSelection: 'multiple',
  pagination: true,
  paginationPageSize: 25
};
```

### Basic Column Definition
```typescript
columns: ColumnDefinition[] = [
  { 
    field: 'name',
    headerName: 'Full Name',
    width: 150,
    sortable: true,
    filterable: true,
    filterType: 'text'
  },
  {
    field: 'age',
    headerName: 'Age',
    width: 80,
    sortable: true,
    filterable: true,
    filterType: 'number'
  }
];
```

## 🧪 Quick Test Script

Run this after migration to verify everything works:

```typescript
// Add to your component for testing
testMigration() {
  console.log('Testing BLG Grid migration...');
  
  // Test data update
  this.data.set([...this.data(), { make: 'BMW', model: 'X5', price: 65000 }]);
  
  // Test programmatic selection (if using grid API)
  setTimeout(() => {
    if (this.gridApi) {
      this.gridApi.selectRow(0);
      console.log('Selected rows:', this.gridApi.getSelectedRows());
    }
  }, 100);
  
  console.log('Migration test completed!');
}
```

## 🚨 When NOT to Use Quick Migration

Use the [full migration guide](./from-ag-grid.md) instead if you have:

- Custom cell renderers or editors
- Complex filtering requirements  
- Enterprise features (grouping, pivoting, etc.)
- Custom themes or extensive styling
- Server-side row model
- Complex event handling
- Advanced grid configurations

## ✅ Migration Checklist

- [ ] Packages installed correctly
- [ ] Imports updated to BLG Grid
- [ ] Component template updated
- [ ] Column definitions converted
- [ ] Styling/themes applied
- [ ] Basic functionality tested
- [ ] No console errors
- [ ] Performance is acceptable

## 🎉 Success!

Your basic ag-Grid should now be running on BLG Grid! 

### Next Steps:
1. **[Full Migration Guide](./from-ag-grid.md)** - For advanced features
2. **[API Mapping](./ag-grid-api-mapping.md)** - Complete API reference
3. **[Examples](../examples/ag-grid-migration/)** - Real-world migration examples
4. **[Performance Guide](../advanced/performance-optimization.md)** - Optimize your grid

### Need Help?
- **Discord**: [Join our community](https://discord.gg/blg-grid)
- **GitHub**: [Open an issue](https://github.com/bigledger/blg-grid/issues)
- **Docs**: [Full documentation](../INDEX.md)

---

**Total Migration Time**: ~5 minutes for basic grids ⚡