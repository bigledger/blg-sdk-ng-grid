# Example 2: Grid with Advanced Filtering and Sorting

## 📚 Target Audience: Library Users

This example demonstrates migrating an ag-Grid with advanced filtering, sorting, and search functionality to BLG Grid.

## 🎯 What This Example Covers

- Multiple column filters (text, number, date, set)
- Multi-column sorting
- Quick filter/global search
- Custom filter parameters
- Filter state management
- Programmatic filtering and sorting

## 📊 Before: ag-Grid Implementation

### Component File (filtering-sorting-grid.component.ts)

```typescript
import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridApi, ColumnApi } from 'ag-grid-community';

@Component({
  selector: 'app-filtering-sorting-grid',
  templateUrl: './filtering-sorting-grid.component.html',
  styleUrls: ['./filtering-sorting-grid.component.scss']
})
export class FilteringSortingGridComponent implements OnInit {
  
  @ViewChild('agGrid') agGrid!: AgGridAngular;

  private gridApi!: GridApi;
  private gridColumnApi!: ColumnApi;

  quickFilterValue = '';

  columnDefs: ColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      sort: 'asc',
      sortIndex: 0,
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    { 
      field: 'name', 
      headerName: 'Product Name', 
      width: 200,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 200,
        caseSensitive: false
      }
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['Electronics', 'Clothing', 'Books', 'Sports', 'Home']
      }
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 120,
      valueFormatter: params => '$' + params.value?.toFixed(2),
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        allowedCharPattern: '\\d\\-\\,\\.',
        numberFormatter: (value: number) => '$' + value.toFixed(2)
      }
    },
    { 
      field: 'inStock', 
      headerName: 'In Stock', 
      width: 100,
      cellRenderer: params => params.value ? '✅ Yes' : '❌ No',
      filter: 'agSetColumnFilter',
      filterParams: {
        values: [true, false],
        valueFormatter: (params: any) => params.value ? 'In Stock' : 'Out of Stock'
      }
    },
    { 
      field: 'createdDate', 
      headerName: 'Created Date', 
      width: 150,
      valueFormatter: params => new Date(params.value).toLocaleDateString(),
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterDate: Date, cellValue: string) => {
          const cellDate = new Date(cellValue);
          if (cellDate < filterDate) return -1;
          if (cellDate > filterDate) return 1;
          return 0;
        }
      }
    },
    { 
      field: 'rating', 
      headerName: 'Rating', 
      width: 100,
      cellRenderer: params => '⭐'.repeat(Math.floor(params.value)) + ` (${params.value})`,
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply']
      }
    }
  ];

  gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true
    },
    multiSortKey: 'ctrl',
    animateRows: true,
    enableRangeSelection: true,
    suppressMenuHide: false,
    onGridReady: (params) => {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
      this.loadData();
    },
    onFilterChanged: () => {
      console.log('Filter changed');
    },
    onSortChanged: () => {
      console.log('Sort changed');
    }
  };

  rowData: any[] = [];

  ngOnInit() {}

  loadData() {
    // Simulate API call with more complex data
    this.rowData = [
      { id: 1, name: 'MacBook Pro', category: 'Electronics', price: 2499.99, inStock: true, createdDate: '2024-01-15', rating: 4.8 },
      { id: 2, name: 'Nike Air Max', category: 'Sports', price: 129.99, inStock: false, createdDate: '2024-02-10', rating: 4.2 },
      { id: 3, name: 'The Great Gatsby', category: 'Books', price: 12.99, inStock: true, createdDate: '2024-01-20', rating: 4.5 },
      { id: 4, name: 'Cotton T-Shirt', category: 'Clothing', price: 24.99, inStock: true, createdDate: '2024-03-05', rating: 3.9 },
      { id: 5, name: 'Coffee Maker', category: 'Home', price: 89.99, inStock: false, createdDate: '2024-02-28', rating: 4.3 },
      { id: 6, name: 'iPhone 15', category: 'Electronics', price: 999.99, inStock: true, createdDate: '2024-01-08', rating: 4.6 },
      { id: 7, name: 'Running Shoes', category: 'Sports', price: 159.99, inStock: true, createdDate: '2024-03-12', rating: 4.1 },
      { id: 8, name: 'JavaScript Guide', category: 'Books', price: 39.99, inStock: false, createdDate: '2024-02-15', rating: 4.7 },
      { id: 9, name: 'Wool Sweater', category: 'Clothing', price: 79.99, inStock: true, createdDate: '2024-01-25', rating: 4.0 },
      { id: 10, name: 'Desk Lamp', category: 'Home', price: 45.99, inStock: true, createdDate: '2024-03-01', rating: 3.8 }
    ];

    this.gridApi?.setRowData(this.rowData);
  }

  onQuickFilterChanged() {
    this.gridApi?.setQuickFilter(this.quickFilterValue);
  }

  clearFilters() {
    this.gridApi?.setFilterModel(null);
    this.quickFilterValue = '';
  }

  exportFilteredData() {
    this.gridApi?.exportDataAsCsv({
      onlySelected: false,
      skipGroups: true
    });
  }

  setSortModel() {
    this.gridApi?.setSortModel([
      { colId: 'price', sort: 'desc' },
      { colId: 'rating', sort: 'desc' }
    ]);
  }

  getFilterState() {
    const filterModel = this.gridApi?.getFilterModel();
    console.log('Current filter state:', filterModel);
    return filterModel;
  }

  restoreFilterState(filterModel: any) {
    this.gridApi?.setFilterModel(filterModel);
  }
}
```

### Template File (filtering-sorting-grid.component.html)

```html
<div class="grid-container">
  <h2>Product Catalog with Advanced Filtering & Sorting</h2>
  
  <div class="controls-panel">
    <div class="search-section">
      <label>Quick Search:</label>
      <input 
        type="text" 
        [(ngModel)]="quickFilterValue"
        (input)="onQuickFilterChanged()"
        placeholder="Search across all columns..."
        class="search-input">
    </div>
    
    <div class="action-buttons">
      <button (click)="clearFilters()" class="btn btn-secondary">
        Clear All Filters
      </button>
      <button (click)="setSortModel()" class="btn btn-primary">
        Sort by Price & Rating
      </button>
      <button (click)="exportFilteredData()" class="btn btn-success">
        Export Filtered Data
      </button>
      <button (click)="getFilterState()" class="btn btn-info">
        Log Filter State
      </button>
    </div>
  </div>

  <ag-grid-angular
    #agGrid
    class="ag-theme-alpine"
    style="width: 100%; height: 500px;"
    [columnDefs]="columnDefs"
    [rowData]="rowData"
    [gridOptions]="gridOptions">
  </ag-grid-angular>
  
  <div class="info-panel">
    <p><strong>Features demonstrated:</strong></p>
    <ul>
      <li>Text filters with debouncing</li>
      <li>Number filters with custom formatting</li>
      <li>Date filters with custom comparator</li>
      <li>Set filters for predefined values</li>
      <li>Floating filters for quick access</li>
      <li>Multi-column sorting (Ctrl+click)</li>
      <li>Quick filter for global search</li>
      <li>Programmatic filter/sort control</li>
    </ul>
  </div>
</div>
```

### Styles (filtering-sorting-grid.component.scss)

```scss
.grid-container {
  padding: 20px;
}

.controls-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;

  .search-section {
    display: flex;
    align-items: center;
    gap: 10px;

    label {
      font-weight: 500;
    }

    .search-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 300px;
    }
  }

  .action-buttons {
    display: flex;
    gap: 10px;

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;

      &.btn-secondary { background: #6c757d; color: white; }
      &.btn-primary { background: #007bff; color: white; }
      &.btn-success { background: #28a745; color: white; }
      &.btn-info { background: #17a2b8; color: white; }

      &:hover {
        opacity: 0.9;
      }
    }
  }
}

.info-panel {
  margin-top: 20px;
  padding: 15px;
  background: #e9ecef;
  border-radius: 5px;

  ul {
    margin: 10px 0 0 20px;
    
    li {
      margin-bottom: 5px;
    }
  }
}
```

## ✅ After: BLG Grid Implementation

### Component File (filtering-sorting-grid.component.ts)

```typescript
import { Component, OnInit, signal, computed } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ColumnDefinition, 
  GridConfig, 
  GridApi,
  FilterModel,
  SortModel,
  GridReadyEvent,
  FilterChangedEvent,
  SortChangedEvent
} from '@ng-ui-lib/core';

@Component({
  selector: 'app-filtering-sorting-grid',
  standalone: true,
  imports: [Grid, CommonModule, FormsModule],
  templateUrl: './filtering-sorting-grid.component.html',
  styleUrls: ['./filtering-sorting-grid.component.scss']
})
export class FilteringSortingGridComponent implements OnInit {
  
  private gridApi?: GridApi;

  quickFilterValue = signal('');

  columns: ColumnDefinition[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      initialSort: 'asc',
      sortIndex: 0,
      filterable: true,
      filterType: 'number',
      filterOptions: {
        showApplyButton: true,
        showResetButton: true,
        closeOnApply: true
      }
    },
    { 
      field: 'name', 
      headerName: 'Product Name', 
      width: 200,
      filterable: true,
      filterType: 'text',
      filterOptions: {
        showApplyButton: true,
        showResetButton: true,
        debounceMs: 200,
        caseSensitive: false
      }
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      filterable: true,
      filterType: 'set',
      filterOptions: {
        values: ['Electronics', 'Clothing', 'Books', 'Sports', 'Home']
      }
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 120,
      valueFormatter: (value) => '$' + value?.toFixed(2),
      filterable: true,
      filterType: 'number',
      filterOptions: {
        showApplyButton: true,
        showResetButton: true,
        numberFormatter: (value: number) => '$' + value.toFixed(2)
      }
    },
    { 
      field: 'inStock', 
      headerName: 'In Stock', 
      width: 100,
      cellRenderer: (value) => value ? '✅ Yes' : '❌ No',
      filterable: true,
      filterType: 'set',
      filterOptions: {
        values: [
          { value: true, label: 'In Stock' },
          { value: false, label: 'Out of Stock' }
        ]
      }
    },
    { 
      field: 'createdDate', 
      headerName: 'Created Date', 
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
      filterable: true,
      filterType: 'date',
      filterOptions: {
        compareFn: (filterDate: Date, cellValue: string) => {
          const cellDate = new Date(cellValue);
          if (cellDate < filterDate) return -1;
          if (cellDate > filterDate) return 1;
          return 0;
        }
      }
    },
    { 
      field: 'rating', 
      headerName: 'Rating', 
      width: 100,
      cellRenderer: (value) => '⭐'.repeat(Math.floor(value)) + ` (${value})`,
      filterable: true,
      filterType: 'number',
      filterOptions: {
        showApplyButton: true,
        showResetButton: true
      }
    }
  ];

  config: GridConfig = {
    defaultColumnOptions: {
      sortable: true,
      filterable: true,
      resizable: true,
      showFloatingFilter: true
    },
    multiSortKey: 'ctrl',
    animateRows: true,
    enableRangeSelection: true,
    suppressMenuHide: false,
    quickFilter: this.quickFilterValue
  };

  data = signal<any[]>([]);

  ngOnInit() {}

  onGridReady(gridApi: GridApi) {
    this.gridApi = gridApi;
    this.loadData();
  }

  loadData() {
    // Simulate API call with more complex data
    const productData = [
      { id: 1, name: 'MacBook Pro', category: 'Electronics', price: 2499.99, inStock: true, createdDate: '2024-01-15', rating: 4.8 },
      { id: 2, name: 'Nike Air Max', category: 'Sports', price: 129.99, inStock: false, createdDate: '2024-02-10', rating: 4.2 },
      { id: 3, name: 'The Great Gatsby', category: 'Books', price: 12.99, inStock: true, createdDate: '2024-01-20', rating: 4.5 },
      { id: 4, name: 'Cotton T-Shirt', category: 'Clothing', price: 24.99, inStock: true, createdDate: '2024-03-05', rating: 3.9 },
      { id: 5, name: 'Coffee Maker', category: 'Home', price: 89.99, inStock: false, createdDate: '2024-02-28', rating: 4.3 },
      { id: 6, name: 'iPhone 15', category: 'Electronics', price: 999.99, inStock: true, createdDate: '2024-01-08', rating: 4.6 },
      { id: 7, name: 'Running Shoes', category: 'Sports', price: 159.99, inStock: true, createdDate: '2024-03-12', rating: 4.1 },
      { id: 8, name: 'JavaScript Guide', category: 'Books', price: 39.99, inStock: false, createdDate: '2024-02-15', rating: 4.7 },
      { id: 9, name: 'Wool Sweater', category: 'Clothing', price: 79.99, inStock: true, createdDate: '2024-01-25', rating: 4.0 },
      { id: 10, name: 'Desk Lamp', category: 'Home', price: 45.99, inStock: true, createdDate: '2024-03-01', rating: 3.8 }
    ];

    this.data.set(productData);
  }

  onQuickFilterChanged(value: string) {
    this.quickFilterValue.set(value);
  }

  clearFilters() {
    this.gridApi?.setFilterModel(null);
    this.quickFilterValue.set('');
  }

  exportFilteredData() {
    this.gridApi?.exportToCsv({
      onlySelected: false,
      skipGroups: true,
      fileName: 'filtered-products.csv'
    });
  }

  setSortModel() {
    this.gridApi?.setSortModel([
      { field: 'price', direction: 'desc' },
      { field: 'rating', direction: 'desc' }
    ]);
  }

  getFilterState() {
    const filterModel = this.gridApi?.getFilterModel();
    console.log('Current filter state:', filterModel);
    return filterModel;
  }

  restoreFilterState(filterModel: FilterModel) {
    this.gridApi?.setFilterModel(filterModel);
  }

  onFilterChanged(event: FilterChangedEvent) {
    console.log('Filter changed:', event);
  }

  onSortChanged(event: SortChangedEvent) {
    console.log('Sort changed:', event);
  }
}
```

### Template File (filtering-sorting-grid.component.html)

```html
<div class="grid-container">
  <h2>Product Catalog with Advanced Filtering & Sorting</h2>
  
  <div class="controls-panel">
    <div class="search-section">
      <label>Quick Search:</label>
      <input 
        type="text" 
        [value]="quickFilterValue()"
        (input)="onQuickFilterChanged($event.target.value)"
        placeholder="Search across all columns..."
        class="search-input">
    </div>
    
    <div class="action-buttons">
      <button (click)="clearFilters()" class="btn btn-secondary">
        Clear All Filters
      </button>
      <button (click)="setSortModel()" class="btn btn-primary">
        Sort by Price & Rating
      </button>
      <button (click)="exportFilteredData()" class="btn btn-success">
        Export Filtered Data
      </button>
      <button (click)="getFilterState()" class="btn btn-info">
        Log Filter State
      </button>
    </div>
  </div>

  <ng-ui-lib
    class="blg-theme-default"
    style="width: 100%; height: 500px;"
    [columns]="columns"
    [data]="data"
    [config]="config"
    (gridReady)="onGridReady($event)"
    (filterChanged)="onFilterChanged($event)"
    (sortChanged)="onSortChanged($event)">
  </ng-ui-lib>
  
  <div class="info-panel">
    <p><strong>Features demonstrated:</strong></p>
    <ul>
      <li>Text filters with debouncing</li>
      <li>Number filters with custom formatting</li>
      <li>Date filters with custom comparator</li>
      <li>Set filters for predefined values</li>
      <li>Floating filters for quick access</li>
      <li>Multi-column sorting (Ctrl+click)</li>
      <li>Quick filter for global search</li>
      <li>Programmatic filter/sort control</li>
    </ul>
  </div>
</div>
```

### Styles (filtering-sorting-grid.component.scss) 

```scss
.grid-container {
  padding: 20px;
}

.controls-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;

  .search-section {
    display: flex;
    align-items: center;
    gap: 10px;

    label {
      font-weight: 500;
    }

    .search-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 300px;
    }
  }

  .action-buttons {
    display: flex;
    gap: 10px;

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;

      &.btn-secondary { background: #6c757d; color: white; }
      &.btn-primary { background: #007bff; color: white; }
      &.btn-success { background: #28a745; color: white; }
      &.btn-info { background: #17a2b8; color: white; }

      &:hover {
        opacity: 0.9;
      }
    }
  }
}

.info-panel {
  margin-top: 20px;
  padding: 15px;
  background: #e9ecef;
  border-radius: 5px;

  ul {
    margin: 10px 0 0 20px;
    
    li {
      margin-bottom: 5px;
    }
  }
}
```

## 🔍 Migration Changes Summary

### Key Changes Made

1. **Filter Configuration Updated**
   ```typescript
   // Before
   filter: 'agTextColumnFilter'
   filterParams: { buttons: ['reset', 'apply'] }
   
   // After
   filterable: true,
   filterType: 'text',
   filterOptions: { 
     showApplyButton: true, 
     showResetButton: true 
   }
   ```

2. **Sort Configuration Simplified**
   ```typescript
   // Before
   sort: 'asc',
   sortIndex: 0
   
   // After
   initialSort: 'asc',
   sortIndex: 0
   ```

3. **Quick Filter with Signals**
   ```typescript
   // Before
   quickFilterValue = '';
   onQuickFilterChanged() {
     this.gridApi?.setQuickFilter(this.quickFilterValue);
   }
   
   // After
   quickFilterValue = signal('');
   config: GridConfig = {
     quickFilter: this.quickFilterValue
   };
   ```

4. **Event Handling Simplified**
   ```typescript
   // Before
   onGridReady: (params) => {
     this.gridApi = params.api;
     this.gridColumnApi = params.columnApi;
   }
   
   // After
   onGridReady(gridApi: GridApi) {
     this.gridApi = gridApi;
     // No separate column API needed
   }
   ```

5. **API Method Updates**
   ```typescript
   // Before
   this.gridApi?.exportDataAsCsv()
   this.gridApi?.setSortModel([
     { colId: 'price', sort: 'desc' }
   ]);
   
   // After
   this.gridApi?.exportToCsv()
   this.gridApi?.setSortModel([
     { field: 'price', direction: 'desc' }
   ]);
   ```

## 🧪 Advanced Testing Scenarios

### Filter State Persistence

```typescript
// Add to component for testing filter persistence
saveFilterState() {
  const filterState = this.getFilterState();
  localStorage.setItem('gridFilters', JSON.stringify(filterState));
}

loadFilterState() {
  const savedState = localStorage.getItem('gridFilters');
  if (savedState) {
    this.restoreFilterState(JSON.parse(savedState));
  }
}
```

### Dynamic Filter Options

```typescript
// Test dynamic filter updates
updateCategoryOptions() {
  const categoryColumn = this.columns.find(c => c.field === 'category');
  if (categoryColumn?.filterOptions) {
    categoryColumn.filterOptions.values = [
      'Electronics', 'Clothing', 'Books', 'Sports', 'Home', 'Automotive'
    ];
  }
  // Refresh grid to apply new filter options
  this.gridApi?.refreshFilters();
}
```

### Complex Filter Conditions

```typescript
// Apply complex filter programmatically
applyComplexFilter() {
  this.gridApi?.setFilterModel({
    price: {
      type: 'greaterThan',
      filter: 100
    },
    inStock: {
      values: [true]
    },
    category: {
      values: ['Electronics', 'Sports']
    }
  });
}
```

## 📈 Expected Benefits

After migration, you should see:

- ✅ **Better Performance**: Faster filtering with optimized algorithms
- ✅ **Reactive Updates**: Automatic filter updates with signals
- ✅ **Simpler API**: Cleaner configuration and method names
- ✅ **Type Safety**: Better TypeScript support for filter types
- ✅ **Modern Patterns**: Angular Signals for reactive programming

## 🐛 Common Issues & Solutions

### Issue: Floating filters not showing
**Solution**: Enable floating filters in configuration
```typescript
config: GridConfig = {
  defaultColumnOptions: {
    showFloatingFilter: true
  }
};
```

### Issue: Set filter values not displaying correctly
**Solution**: Use proper value/label structure
```typescript
filterOptions: {
  values: [
    { value: true, label: 'In Stock' },
    { value: false, label: 'Out of Stock' }
  ]
}
```

### Issue: Date filter not working
**Solution**: Ensure proper date format and comparator
```typescript
filterOptions: {
  compareFn: (filterDate: Date, cellValue: string) => {
    const cellDate = new Date(cellValue);
    return cellDate.getTime() - filterDate.getTime();
  }
}
```

### Issue: Quick filter not reactive
**Solution**: Use signals properly
```typescript
// Template binding
[value]="quickFilterValue()"
(input)="onQuickFilterChanged($event.target.value)"

// Config with signal
config: GridConfig = {
  quickFilter: this.quickFilterValue
};
```

## 🎉 Migration Completed!

Your advanced filtering and sorting grid is now running on BLG Grid! This example demonstrated:

- Converting complex filter configurations
- Migrating sort models and multi-column sorting
- Implementing reactive quick filtering with signals
- Updating programmatic API calls
- Converting event handlers

**Next Steps:**
- [Example 3: Custom Cell Renderers](./03-custom-renderers.md)
- [Example 4: Cell Editing](./04-cell-editing.md)
- [Migration API Reference](../migration/ag-grid-api-mapping.md)

**Migration Time**: ~45-60 minutes for a grid with advanced filtering like this.