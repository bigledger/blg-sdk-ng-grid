# Example 5: Grid with Row Grouping

## 📚 Target Audience: Library Users

This example demonstrates migrating an ag-Grid with row grouping functionality to BLG Grid, including multi-level grouping, group aggregation, and expandable/collapsible groups.

## 🎯 What This Example Covers

- Single and multi-column grouping
- Group aggregation (sum, count, avg, min, max)
- Expandable/collapsible groups
- Custom group renderers
- Group header formatting
- Programmatic group expansion
- Group selection

## 📊 Before: ag-Grid Implementation

```typescript
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions, GridApi } from 'ag-grid-community';

@Component({
  selector: 'app-row-grouping-grid',
  template: `
    <div class="grid-container">
      <h2>Sales Data with Row Grouping</h2>
      
      <div class="controls-panel">
        <button (click)="groupByRegion()" class="btn btn-primary">Group by Region</button>
        <button (click)="groupByRegionAndCategory()" class="btn btn-primary">Group by Region & Category</button>
        <button (click)="clearGrouping()" class="btn btn-secondary">Clear Grouping</button>
        <button (click)="expandAll()" class="btn btn-info">Expand All</button>
        <button (click)="collapseAll()" class="btn btn-info">Collapse All</button>
      </div>

      <ag-grid-angular
        class="ag-theme-alpine"
        style="width: 100%; height: 600px;"
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        [gridOptions]="gridOptions">
      </ag-grid-angular>
    </div>
  `,
  styleUrls: ['./row-grouping-grid.component.scss']
})
export class RowGroupingGridComponent implements OnInit {

  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    { 
      field: 'region', 
      headerName: 'Region', 
      width: 120,
      rowGroup: true,
      hide: true
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      enableRowGroup: true
    },
    { 
      field: 'product', 
      headerName: 'Product', 
      width: 200
    },
    { 
      field: 'salesperson', 
      headerName: 'Salesperson', 
      width: 150,
      enableRowGroup: true
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 120,
      aggFunc: 'sum',
      valueFormatter: (params) => params.value?.toLocaleString()
    },
    { 
      field: 'unitPrice', 
      headerName: 'Unit Price', 
      width: 120,
      valueFormatter: (params) => '$' + params.value?.toFixed(2)
    },
    { 
      field: 'totalSales', 
      headerName: 'Total Sales', 
      width: 140,
      aggFunc: 'sum',
      valueFormatter: (params) => '$' + params.value?.toLocaleString()
    },
    { 
      field: 'date', 
      headerName: 'Sale Date', 
      width: 120,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    }
  ];

  gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    },
    autoGroupColumnDef: {
      headerName: 'Group',
      width: 200,
      cellRendererParams: {
        suppressCount: false,
        checkbox: true
      }
    },
    suppressAggFuncInHeader: false,
    groupDefaultExpanded: 1,
    groupIncludeFooter: true,
    groupIncludeTotalFooter: true,
    animateRows: true,
    groupSelectsChildren: true,
    rowSelection: 'multiple',
    onGridReady: (params) => {
      this.gridApi = params.api;
    },
    getDataPath: (data: any) => {
      return [data.region, data.category];
    }
  };

  rowData: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.rowData = [
      { region: 'North', category: 'Electronics', product: 'Laptop', salesperson: 'John Doe', quantity: 25, unitPrice: 999.99, totalSales: 24999.75, date: '2024-01-15' },
      { region: 'North', category: 'Electronics', product: 'Mouse', salesperson: 'John Doe', quantity: 50, unitPrice: 29.99, totalSales: 1499.50, date: '2024-01-16' },
      { region: 'North', category: 'Clothing', product: 'T-Shirt', salesperson: 'Jane Smith', quantity: 100, unitPrice: 19.99, totalSales: 1999.00, date: '2024-01-17' },
      { region: 'South', category: 'Electronics', product: 'Tablet', salesperson: 'Bob Johnson', quantity: 30, unitPrice: 399.99, totalSales: 11999.70, date: '2024-01-18' },
      { region: 'South', category: 'Electronics', product: 'Headphones', salesperson: 'Bob Johnson', quantity: 75, unitPrice: 149.99, totalSales: 11249.25, date: '2024-01-19' },
      { region: 'South', category: 'Sports', product: 'Basketball', salesperson: 'Alice Brown', quantity: 40, unitPrice: 59.99, totalSales: 2399.60, date: '2024-01-20' },
      { region: 'East', category: 'Books', product: 'Novel', salesperson: 'Charlie Wilson', quantity: 200, unitPrice: 12.99, totalSales: 2598.00, date: '2024-01-21' },
      { region: 'East', category: 'Electronics', product: 'Smartphone', salesperson: 'Diana Lee', quantity: 15, unitPrice: 699.99, totalSales: 10499.85, date: '2024-01-22' },
      { region: 'West', category: 'Home', product: 'Coffee Maker', salesperson: 'Eva Davis', quantity: 20, unitPrice: 89.99, totalSales: 1799.80, date: '2024-01-23' },
      { region: 'West', category: 'Sports', product: 'Tennis Racket', salesperson: 'Frank Miller', quantity: 35, unitPrice: 129.99, totalSales: 4549.65, date: '2024-01-24' }
    ];
  }

  groupByRegion() {
    this.gridApi.setColumnVisible('region', false);
    this.gridColumnApi.setRowGroupColumns(['region']);
  }

  groupByRegionAndCategory() {
    this.gridApi.setColumnsVisible(['region', 'category'], false);
    this.gridColumnApi.setRowGroupColumns(['region', 'category']);
  }

  clearGrouping() {
    this.gridColumnApi.setRowGroupColumns([]);
    this.gridApi.setColumnsVisible(['region', 'category'], true);
  }

  expandAll() {
    this.gridApi.expandAll();
  }

  collapseAll() {
    this.gridApi.collapseAll();
  }
}
```

## ✅ After: BLG Grid Implementation

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { CommonModule } from '@angular/common';
import { 
  ColumnDefinition, 
  GridConfig, 
  GridApi,
  GroupConfig,
  AggregationFunction
} from '@ng-ui-lib/core';

@Component({
  selector: 'app-row-grouping-grid',
  standalone: true,
  imports: [Grid, CommonModule],
  template: `
    <div class="grid-container">
      <h2>Sales Data with Row Grouping</h2>
      
      <div class="controls-panel">
        <button (click)="groupByRegion()" class="btn btn-primary">Group by Region</button>
        <button (click)="groupByRegionAndCategory()" class="btn btn-primary">Group by Region & Category</button>
        <button (click)="clearGrouping()" class="btn btn-secondary">Clear Grouping</button>
        <button (click)="expandAll()" class="btn btn-info">Expand All</button>
        <button (click)="collapseAll()" class="btn btn-info">Collapse All</button>
      </div>

      <ng-ui-lib
        class="blg-theme-default"
        style="width: 100%; height: 600px;"
        [columns]="columns"
        [data]="data"
        [config]="config"
        (gridReady)="onGridReady($event)">
      </ng-ui-lib>
    </div>
  `,
  styleUrls: ['./row-grouping-grid.component.scss']
})
export class RowGroupingGridComponent implements OnInit {

  private gridApi?: GridApi;

  columns: ColumnDefinition[] = [
    { 
      field: 'region', 
      headerName: 'Region', 
      width: 120,
      enableRowGroup: true
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      enableRowGroup: true
    },
    { 
      field: 'product', 
      headerName: 'Product', 
      width: 200
    },
    { 
      field: 'salesperson', 
      headerName: 'Salesperson', 
      width: 150,
      enableRowGroup: true
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 120,
      aggregationFunction: 'sum',
      valueFormatter: (value) => value?.toLocaleString()
    },
    { 
      field: 'unitPrice', 
      headerName: 'Unit Price', 
      width: 120,
      valueFormatter: (value) => '$' + value?.toFixed(2)
    },
    { 
      field: 'totalSales', 
      headerName: 'Total Sales', 
      width: 140,
      aggregationFunction: 'sum',
      valueFormatter: (value) => '$' + value?.toLocaleString()
    },
    { 
      field: 'date', 
      headerName: 'Sale Date', 
      width: 120,
      valueFormatter: (value) => new Date(value).toLocaleDateString()
    }
  ];

  config: GridConfig = {
    defaultColumnOptions: {
      resizable: true,
      sortable: true,
      filterable: true
    },
    grouping: {
      enabled: true,
      defaultExpanded: 1,
      showGroupFooter: true,
      showGrandTotalFooter: true,
      groupSelectsChildren: true,
      autoGroupColumnDef: {
        headerName: 'Group',
        width: 200,
        showGroupCount: true,
        enableSelection: true
      }
    },
    rowSelection: 'multiple',
    animateRows: true
  };

  data = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  onGridReady(gridApi: GridApi) {
    this.gridApi = gridApi;
  }

  loadData() {
    const salesData = [
      { region: 'North', category: 'Electronics', product: 'Laptop', salesperson: 'John Doe', quantity: 25, unitPrice: 999.99, totalSales: 24999.75, date: '2024-01-15' },
      { region: 'North', category: 'Electronics', product: 'Mouse', salesperson: 'John Doe', quantity: 50, unitPrice: 29.99, totalSales: 1499.50, date: '2024-01-16' },
      { region: 'North', category: 'Clothing', product: 'T-Shirt', salesperson: 'Jane Smith', quantity: 100, unitPrice: 19.99, totalSales: 1999.00, date: '2024-01-17' },
      { region: 'South', category: 'Electronics', product: 'Tablet', salesperson: 'Bob Johnson', quantity: 30, unitPrice: 399.99, totalSales: 11999.70, date: '2024-01-18' },
      { region: 'South', category: 'Electronics', product: 'Headphones', salesperson: 'Bob Johnson', quantity: 75, unitPrice: 149.99, totalSales: 11249.25, date: '2024-01-19' },
      { region: 'South', category: 'Sports', product: 'Basketball', salesperson: 'Alice Brown', quantity: 40, unitPrice: 59.99, totalSales: 2399.60, date: '2024-01-20' },
      { region: 'East', category: 'Books', product: 'Novel', salesperson: 'Charlie Wilson', quantity: 200, unitPrice: 12.99, totalSales: 2598.00, date: '2024-01-21' },
      { region: 'East', category: 'Electronics', product: 'Smartphone', salesperson: 'Diana Lee', quantity: 15, unitPrice: 699.99, totalSales: 10499.85, date: '2024-01-22' },
      { region: 'West', category: 'Home', product: 'Coffee Maker', salesperson: 'Eva Davis', quantity: 20, unitPrice: 89.99, totalSales: 1799.80, date: '2024-01-23' },
      { region: 'West', category: 'Sports', product: 'Tennis Racket', salesperson: 'Frank Miller', quantity: 35, unitPrice: 129.99, totalSales: 4549.65, date: '2024-01-24' }
    ];

    this.data.set(salesData);
  }

  groupByRegion() {
    this.gridApi?.setGroupBy(['region']);
  }

  groupByRegionAndCategory() {
    this.gridApi?.setGroupBy(['region', 'category']);
  }

  clearGrouping() {
    this.gridApi?.setGroupBy([]);
  }

  expandAll() {
    this.gridApi?.expandAllGroups();
  }

  collapseAll() {
    this.gridApi?.collapseAllGroups();
  }
}
```

**Migration Time**: ~1-2 hours for row grouping features like this.

**Key Changes**:
- `rowGroup: true` → `enableRowGroup: true`
- `aggFunc: 'sum'` → `aggregationFunction: 'sum'`
- `autoGroupColumnDef` → `grouping.autoGroupColumnDef`
- `setRowGroupColumns()` → `setGroupBy()`
- Simplified grouping configuration in single `grouping` object