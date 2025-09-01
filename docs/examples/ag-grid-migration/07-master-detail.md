# Example 7: Grid with Master/Detail

## 📚 Target Audience: Library Users

This example demonstrates migrating an ag-Grid with master/detail functionality to BLG Grid, including expandable detail panels, nested grids, and custom detail renderers.

## 🎯 What This Example Covers

- Expandable row details
- Nested grids in detail panels
- Custom detail panel renderers
- Detail data loading (lazy/eager)
- Master-detail navigation
- Detail panel height management

## 📊 Before: ag-Grid Implementation

```typescript
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions, IDetailCellRendererParams } from 'ag-grid-community';
import { DetailOrdersComponent } from './detail-orders.component';

@Component({
  selector: 'app-master-detail-grid',
  template: `
    <div class="grid-container">
      <h2>Customer Orders with Master/Detail</h2>
      
      <ag-grid-angular
        class="ag-theme-alpine"
        style="width: 100%; height: 600px;"
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        [gridOptions]="gridOptions">
      </ag-grid-angular>
    </div>
  `
})
export class MasterDetailGridComponent implements OnInit {

  columnDefs: ColDef[] = [
    { field: 'customerId', headerName: 'Customer ID', width: 120 },
    { field: 'customerName', headerName: 'Customer Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'country', headerName: 'Country', width: 120 },
    { field: 'totalOrders', headerName: 'Total Orders', width: 120 },
    { field: 'totalSpent', headerName: 'Total Spent', width: 140,
      valueFormatter: (params) => '$' + params.value?.toLocaleString()
    },
    { field: 'joinDate', headerName: 'Join Date', width: 120,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    }
  ];

  gridOptions: GridOptions = {
    masterDetail: true,
    detailCellRendererParams: {
      detailGridOptions: {
        columnDefs: [
          { field: 'orderId', headerName: 'Order ID', width: 100 },
          { field: 'orderDate', headerName: 'Order Date', width: 120,
            valueFormatter: (params: any) => new Date(params.value).toLocaleDateString()
          },
          { field: 'product', headerName: 'Product', width: 200 },
          { field: 'quantity', headerName: 'Quantity', width: 100 },
          { field: 'unitPrice', headerName: 'Unit Price', width: 120,
            valueFormatter: (params: any) => '$' + params.value?.toFixed(2)
          },
          { field: 'totalAmount', headerName: 'Total', width: 120,
            valueFormatter: (params: any) => '$' + params.value?.toLocaleString()
          },
          { field: 'status', headerName: 'Status', width: 100 }
        ],
        defaultColDef: {
          resizable: true,
          sortable: true
        }
      },
      getDetailRowData: (params: any) => {
        // Load order details for this customer
        params.successCallback(params.data.orders || []);
      }
    } as IDetailCellRendererParams,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    },
    animateRows: true
  };

  rowData: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.rowData = [
      {
        customerId: 'CUST001',
        customerName: 'John Doe',
        email: 'john.doe@email.com',
        country: 'USA',
        totalOrders: 5,
        totalSpent: 2500.00,
        joinDate: '2020-01-15',
        orders: [
          { orderId: 'ORD001', orderDate: '2024-01-10', product: 'Laptop', quantity: 1, unitPrice: 999.99, totalAmount: 999.99, status: 'Delivered' },
          { orderId: 'ORD002', orderDate: '2024-01-15', product: 'Mouse', quantity: 2, unitPrice: 29.99, totalAmount: 59.98, status: 'Delivered' },
          { orderId: 'ORD003', orderDate: '2024-01-20', product: 'Keyboard', quantity: 1, unitPrice: 79.99, totalAmount: 79.99, status: 'Processing' }
        ]
      },
      {
        customerId: 'CUST002',
        customerName: 'Jane Smith',
        email: 'jane.smith@email.com',
        country: 'Canada',
        totalOrders: 3,
        totalSpent: 1200.00,
        joinDate: '2021-03-22',
        orders: [
          { orderId: 'ORD004', orderDate: '2024-01-08', product: 'Tablet', quantity: 1, unitPrice: 399.99, totalAmount: 399.99, status: 'Delivered' },
          { orderId: 'ORD005', orderDate: '2024-01-12', product: 'Headphones', quantity: 1, unitPrice: 149.99, totalAmount: 149.99, status: 'Shipped' }
        ]
      }
    ];
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
  RowExpandedEvent,
  MasterDetailConfig
} from '@ng-ui-lib/core';
import { DetailOrdersComponent } from './detail-orders.component';

@Component({
  selector: 'app-master-detail-grid',
  standalone: true,
  imports: [Grid, CommonModule, DetailOrdersComponent],
  template: `
    <div class="grid-container">
      <h2>Customer Orders with Master/Detail</h2>
      
      <ng-ui-lib
        class="blg-theme-default"
        style="width: 100%; height: 600px;"
        [columns]="columns"
        [data]="data"
        [config]="config"
        (gridReady)="onGridReady($event)"
        (rowExpanded)="onRowExpanded($event)"
        (rowCollapsed)="onRowCollapsed($event)">
      </ng-ui-lib>
    </div>
  `
})
export class MasterDetailGridComponent implements OnInit {

  private gridApi?: GridApi;

  columns: ColumnDefinition[] = [
    { field: 'customerId', headerName: 'Customer ID', width: 120 },
    { field: 'customerName', headerName: 'Customer Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'country', headerName: 'Country', width: 120 },
    { field: 'totalOrders', headerName: 'Total Orders', width: 120 },
    { field: 'totalSpent', headerName: 'Total Spent', width: 140,
      valueFormatter: (value) => '$' + value?.toLocaleString()
    },
    { field: 'joinDate', headerName: 'Join Date', width: 120,
      valueFormatter: (value) => new Date(value).toLocaleDateString()
    }
  ];

  config: GridConfig = {
    defaultColumnOptions: {
      resizable: true,
      sortable: true,
      filterable: true
    },
    masterDetail: {
      enabled: true,
      detailComponent: DetailOrdersComponent,
      detailHeight: 300, // Fixed height for detail panels
      expandByDefault: false,
      keepDetailRows: true, // Cache detail data
      loadDetailData: (masterRowData: any) => {
        // Return detail data for this master row
        return masterRowData.orders || [];
      }
    } as MasterDetailConfig,
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
    const customerData = [
      {
        customerId: 'CUST001',
        customerName: 'John Doe',
        email: 'john.doe@email.com',
        country: 'USA',
        totalOrders: 5,
        totalSpent: 2500.00,
        joinDate: '2020-01-15',
        orders: [
          { orderId: 'ORD001', orderDate: '2024-01-10', product: 'Laptop', quantity: 1, unitPrice: 999.99, totalAmount: 999.99, status: 'Delivered' },
          { orderId: 'ORD002', orderDate: '2024-01-15', product: 'Mouse', quantity: 2, unitPrice: 29.99, totalAmount: 59.98, status: 'Delivered' },
          { orderId: 'ORD003', orderDate: '2024-01-20', product: 'Keyboard', quantity: 1, unitPrice: 79.99, totalAmount: 79.99, status: 'Processing' }
        ]
      },
      {
        customerId: 'CUST002',
        customerName: 'Jane Smith',
        email: 'jane.smith@email.com',
        country: 'Canada',
        totalOrders: 3,
        totalSpent: 1200.00,
        joinDate: '2021-03-22',
        orders: [
          { orderId: 'ORD004', orderDate: '2024-01-08', product: 'Tablet', quantity: 1, unitPrice: 399.99, totalAmount: 399.99, status: 'Delivered' },
          { orderId: 'ORD005', orderDate: '2024-01-12', product: 'Headphones', quantity: 1, unitPrice: 149.99, totalAmount: 149.99, status: 'Shipped' }
        ]
      }
    ];

    this.data.set(customerData);
  }

  onRowExpanded(event: RowExpandedEvent) {
    console.log('Row expanded:', event);
  }

  onRowCollapsed(event: any) {
    console.log('Row collapsed:', event);
  }

  // Programmatic expansion controls
  expandAll() {
    this.gridApi?.expandAllMasterRows();
  }

  collapseAll() {
    this.gridApi?.collapseAllMasterRows();
  }

  expandRow(customerId: string) {
    const rowIndex = this.data().findIndex(row => row.customerId === customerId);
    if (rowIndex >= 0) {
      this.gridApi?.expandMasterRow(rowIndex);
    }
  }
}
```

### Detail Orders Component (detail-orders.component.ts)

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { CommonModule } from '@angular/common';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-detail-orders',
  standalone: true,
  imports: [Grid, CommonModule],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <h4>Orders for {{ masterRowData?.customerName }}</h4>
        <span class="order-count">{{ detailData.length }} orders</span>
      </div>
      
      <ng-ui-lib
        class="blg-theme-compact"
        style="width: 100%; height: 250px;"
        [columns]="columns"
        [data]="detailData"
        [config]="config">
      </ng-ui-lib>
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 10px;
      background: #f8f9fa;
      border-left: 4px solid #007bff;
    }
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .detail-header h4 {
      margin: 0;
      color: #333;
    }
    .order-count {
      background: #007bff;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
  `]
})
export class DetailOrdersComponent implements OnInit {
  @Input() masterRowData: any;
  @Input() detailData: any[] = [];

  columns: ColumnDefinition[] = [
    { field: 'orderId', headerName: 'Order ID', width: 100 },
    { field: 'orderDate', headerName: 'Order Date', width: 120,
      valueFormatter: (value) => new Date(value).toLocaleDateString()
    },
    { field: 'product', headerName: 'Product', width: 200 },
    { field: 'quantity', headerName: 'Quantity', width: 100 },
    { field: 'unitPrice', headerName: 'Unit Price', width: 120,
      valueFormatter: (value) => '$' + value?.toFixed(2)
    },
    { field: 'totalAmount', headerName: 'Total', width: 120,
      valueFormatter: (value) => '$' + value?.toLocaleString()
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      cellRenderer: (value: string) => {
        const statusColors: any = {
          'Delivered': 'green',
          'Shipped': 'blue', 
          'Processing': 'orange',
          'Cancelled': 'red'
        };
        return `<span style="color: ${statusColors[value] || 'black'}; font-weight: bold;">${value}</span>`;
      }
    }
  ];

  config: GridConfig = {
    defaultColumnOptions: {
      resizable: true,
      sortable: true
    },
    suppressHorizontalScroll: false,
    suppressVerticalScroll: false
  };

  ngOnInit() {
    console.log('Detail component initialized with data:', this.detailData);
  }
}
```

**Migration Time**: ~1-2 hours for master/detail features like this.

**Key Changes**:
- `masterDetail: true` → `masterDetail: { enabled: true }`
- `detailCellRendererParams` → `masterDetail.detailComponent`
- `getDetailRowData` → `masterDetail.loadDetailData`
- Simplified configuration with dedicated detail components
- Better TypeScript support for master/detail relationships