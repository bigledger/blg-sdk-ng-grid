# BigLedger Grid Examples

This section provides comprehensive examples and live demos for the BigLedger Grid component, ranging from basic implementations to advanced enterprise scenarios.

## 🚀 Live Interactive Examples

### Basic Examples
- **[Simple Grid](https://stackblitz.com/edit/bigledger-grid-simple)** - Basic grid with data display
- **[Sortable Grid](https://stackblitz.com/edit/bigledger-grid-sortable)** - Grid with column sorting
- **[Filterable Grid](https://stackblitz.com/edit/bigledger-grid-filterable)** - Grid with built-in filters
- **[Selectable Grid](https://stackblitz.com/edit/bigledger-grid-selectable)** - Grid with row selection

### Advanced Examples
- **[Virtual Scrolling](https://stackblitz.com/edit/bigledger-grid-virtual)** - Handle 100k+ rows
- **[Custom Cell Renderers](https://stackblitz.com/edit/bigledger-grid-custom-cells)** - Custom cell components
- **[Editable Grid](https://stackblitz.com/edit/bigledger-grid-editable)** - Inline editing capabilities
- **[Master-Detail](https://stackblitz.com/edit/bigledger-grid-master-detail)** - Expandable row details

### Export Examples
- **[Excel Export](https://stackblitz.com/edit/bigledger-grid-excel-export)** - Export to Excel with formatting
- **[PDF Reports](https://stackblitz.com/edit/bigledger-grid-pdf-reports)** - Generate PDF reports
- **[Multi-Format Export](https://stackblitz.com/edit/bigledger-grid-multi-export)** - Export to multiple formats

### Enterprise Examples
- **[Real-time Dashboard](https://stackblitz.com/edit/bigledger-grid-realtime)** - Live data updates
- **[Financial Data Grid](https://stackblitz.com/edit/bigledger-grid-financial)** - Financial data with formatting
- **[HR Management System](https://stackblitz.com/edit/bigledger-grid-hr-system)** - Complete HR application

## 📊 Example Code Snippets

### 1. Basic Data Grid

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-basic-grid-example',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="example-container">
      <h2>Basic Data Grid</h2>
      <div class="grid-wrapper">
        <ng-ui-lib-grid 
          [data]="employeeData" 
          [columns]="columns" 
          [config]="gridConfig">
        </ng-ui-lib-grid>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
    }
    .grid-wrapper {
      height: 400px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `]
})
export class BasicGridExampleComponent {
  employeeData = [
    { id: 1, name: 'John Doe', department: 'Engineering', salary: 95000, startDate: new Date('2020-01-15') },
    { id: 2, name: 'Jane Smith', department: 'Marketing', salary: 75000, startDate: new Date('2021-03-22') },
    { id: 3, name: 'Bob Johnson', department: 'Sales', salary: 65000, startDate: new Date('2019-11-08') },
    { id: 4, name: 'Alice Brown', department: 'Engineering', salary: 105000, startDate: new Date('2018-07-12') },
    { id: 5, name: 'Charlie Wilson', department: 'HR', salary: 60000, startDate: new Date('2022-05-03') }
  ];

  columns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Employee Name',
      type: 'string',
      width: 150,
      sortable: true,
      filterable: true
    },
    {
      id: 'department',
      field: 'department',
      header: 'Department',
      type: 'string',
      width: 120,
      sortable: true,
      filterable: true
    },
    {
      id: 'salary',
      field: 'salary',
      header: 'Salary',
      type: 'currency',
      width: 100,
      sortable: true,
      filterable: true,
      format: { currency: 'USD' }
    },
    {
      id: 'startDate',
      field: 'startDate',
      header: 'Start Date',
      type: 'date',
      width: 120,
      sortable: true,
      filterable: true,
      format: { dateFormat: 'MM/dd/yyyy' }
    }
  ];

  gridConfig: GridConfig = {
    sortable: true,
    filterable: true,
    selectable: true,
    resizable: true,
    theme: 'default'
  };
}
```

### 2. Large Dataset with Virtual Scrolling

```typescript
import { Component, OnInit } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';

@Component({
  selector: 'app-virtual-scrolling-example',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="example-container">
      <h2>Virtual Scrolling - {{rowCount}} Rows</h2>
      <div class="controls">
        <button (click)="generateData(10000)">10K Rows</button>
        <button (click)="generateData(100000)">100K Rows</button>
        <button (click)="generateData(500000)">500K Rows</button>
      </div>
      <div class="grid-wrapper">
        <ng-ui-lib-grid 
          [data]="largeDataset" 
          [columns]="columns" 
          [config]="virtualGridConfig">
        </ng-ui-lib-grid>
      </div>
      <div class="performance-info">
        <p>Rendered in: {{renderTime}}ms</p>
        <p>Memory usage: ~{{estimatedMemory}}MB</p>
      </div>
    </div>
  `
})
export class VirtualScrollingExampleComponent implements OnInit {
  largeDataset: any[] = [];
  rowCount = 0;
  renderTime = 0;
  estimatedMemory = 0;

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
    { id: 'name', field: 'name', header: 'Name', type: 'string', width: 150 },
    { id: 'email', field: 'email', header: 'Email', type: 'string', width: 200 },
    { id: 'department', field: 'department', header: 'Department', type: 'string', width: 120 },
    { id: 'salary', field: 'salary', header: 'Salary', type: 'currency', width: 100 },
    { id: 'joinDate', field: 'joinDate', header: 'Join Date', type: 'date', width: 120 }
  ];

  virtualGridConfig: GridConfig = {
    virtualScrolling: true,
    rowHeight: 32,
    rowBuffer: 20,
    maxBlocksInCache: 5,
    sortable: true,
    filterable: true,
    selectable: true
  };

  ngOnInit() {
    this.generateData(10000);
  }

  generateData(count: number) {
    const startTime = performance.now();
    
    this.largeDataset = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Person ${i + 1}`,
      email: `person${i + 1}@company.com`,
      department: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'][i % 5],
      salary: Math.floor(Math.random() * 100000) + 40000,
      joinDate: new Date(2018 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
    }));

    this.rowCount = count;
    this.renderTime = Math.round(performance.now() - startTime);
    this.estimatedMemory = Math.round((count * 200) / 1024 / 1024); // Rough estimate
  }
}
```

### 3. Custom Cell Renderers

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { CellRendererComponent, CellRendererParams } from '@ng-ui-lib/core';

// Custom Status Cell Renderer
@Component({
  selector: 'app-status-cell',
  template: `
    <span class="status-badge" [class]="'status-' + value.toLowerCase()">
      {{ value }}
    </span>
  `,
  styles: [`
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .status-active { background: #d4edda; color: #155724; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .status-pending { background: #fff3cd; color: #856404; }
  `]
})
export class StatusCellRendererComponent implements CellRendererComponent {
  value: any;
  
  agInit(params: CellRendererParams): void {
    this.value = params.value;
  }
}

// Custom Action Buttons Cell
@Component({
  selector: 'app-action-buttons',
  template: `
    <div class="action-buttons">
      <button class="btn btn-edit" (click)="onEdit()" title="Edit">
        ✏️
      </button>
      <button class="btn btn-delete" (click)="onDelete()" title="Delete">
        🗑️
      </button>
      <button class="btn btn-view" (click)="onView()" title="View Details">
        👁️
      </button>
    </div>
  `,
  styles: [`
    .action-buttons {
      display: flex;
      gap: 4px;
    }
    .btn {
      border: none;
      background: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      font-size: 14px;
    }
    .btn:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `]
})
export class ActionButtonsCellRendererComponent implements CellRendererComponent {
  data: any;
  
  agInit(params: CellRendererParams): void {
    this.data = params.data;
  }
  
  onEdit() {
    console.log('Edit:', this.data);
    // Implement edit logic
  }
  
  onDelete() {
    console.log('Delete:', this.data);
    // Implement delete logic
  }
  
  onView() {
    console.log('View:', this.data);
    // Implement view logic
  }
}

// Main Component using custom renderers
@Component({
  selector: 'app-custom-renderers-example',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="example-container">
      <h2>Custom Cell Renderers</h2>
      <div class="grid-wrapper">
        <ng-ui-lib-grid 
          [data]="projectData" 
          [columns]="columns" 
          [config]="gridConfig">
        </ng-ui-lib-grid>
      </div>
    </div>
  `
})
export class CustomRenderersExampleComponent {
  projectData = [
    {
      id: 1,
      name: 'Website Redesign',
      manager: 'John Doe',
      status: 'Active',
      progress: 75,
      budget: 50000,
      deadline: new Date('2024-03-15')
    },
    {
      id: 2,
      name: 'Mobile App',
      manager: 'Jane Smith',
      status: 'Pending',
      progress: 25,
      budget: 120000,
      deadline: new Date('2024-06-30')
    },
    {
      id: 3,
      name: 'Database Migration',
      manager: 'Bob Johnson',
      status: 'Inactive',
      progress: 0,
      budget: 30000,
      deadline: new Date('2024-02-28')
    }
  ];

  columns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Project Name',
      type: 'string',
      width: 200
    },
    {
      id: 'manager',
      field: 'manager',
      header: 'Manager',
      type: 'string',
      width: 150
    },
    {
      id: 'status',
      field: 'status',
      header: 'Status',
      type: 'string',
      width: 100,
      cellRenderer: StatusCellRendererComponent
    },
    {
      id: 'progress',
      field: 'progress',
      header: 'Progress',
      type: 'number',
      width: 120,
      cellRenderer: (params) => `
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${params.value}%"></div>
          <span class="progress-text">${params.value}%</span>
        </div>
      `
    },
    {
      id: 'budget',
      field: 'budget',
      header: 'Budget',
      type: 'currency',
      width: 120,
      format: { currency: 'USD' }
    },
    {
      id: 'actions',
      header: 'Actions',
      type: 'custom',
      width: 120,
      cellRenderer: ActionButtonsCellRendererComponent,
      sortable: false,
      filterable: false
    }
  ];

  gridConfig: GridConfig = {
    theme: 'default',
    rowHeight: 45
  };
}
```

### 4. Advanced Export Example

```typescript
import { Component, ViewChild } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';

@Component({
  selector: 'app-export-example',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="example-container">
      <h2>Advanced Export Features</h2>
      
      <div class="export-controls">
        <div class="button-group">
          <button class="btn btn-excel" (click)="exportToExcel()">
            📊 Export to Excel
          </button>
          <button class="btn btn-pdf" (click)="exportToPDF()">
            📄 Export to PDF
          </button>
          <button class="btn btn-csv" (click)="exportToCSV()">
            📋 Export to CSV
          </button>
        </div>
        
        <div class="export-options">
          <label>
            <input type="checkbox" [(ngModel)]="exportOptions.includeHeaders">
            Include Headers
          </label>
          <label>
            <input type="checkbox" [(ngModel)]="exportOptions.selectedRowsOnly">
            Selected Rows Only
          </label>
          <label>
            <input type="checkbox" [(ngModel)]="exportOptions.includeHiddenColumns">
            Include Hidden Columns
          </label>
        </div>
      </div>

      <div class="grid-wrapper">
        <ng-ui-lib-grid 
          #grid
          [data]="salesData" 
          [columns]="columns" 
          [config]="gridConfig"
          (dataExported)="onExportComplete($event)">
        </ng-ui-lib-grid>
      </div>

      <div class="export-status" *ngIf="exportStatus">
        <div class="status-message" [class]="exportStatus.type">
          {{ exportStatus.message }}
        </div>
        <div class="progress-bar" *ngIf="exportProgress > 0 && exportProgress < 100">
          <div class="progress-fill" [style.width.%]="exportProgress"></div>
          <span class="progress-text">{{ exportProgress }}%</span>
        </div>
      </div>
    </div>
  `
})
export class ExportExampleComponent {
  @ViewChild('grid') grid!: GridComponent;

  exportOptions = {
    includeHeaders: true,
    selectedRowsOnly: false,
    includeHiddenColumns: false
  };

  exportStatus: { type: string; message: string } | null = null;
  exportProgress = 0;

  salesData = [
    // Generate large dataset for export testing
    ...Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      salesperson: `Salesperson ${i + 1}`,
      region: ['North', 'South', 'East', 'West'][i % 4],
      product: `Product ${(i % 10) + 1}`,
      quantity: Math.floor(Math.random() * 100) + 1,
      unitPrice: Math.round((Math.random() * 500 + 50) * 100) / 100,
      total: 0, // Will be calculated
      saleDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      commission: 0 // Will be calculated
    }))
  ];

  columns: ColumnDefinition[] = [
    { id: 'salesperson', field: 'salesperson', header: 'Salesperson', type: 'string', width: 150 },
    { id: 'region', field: 'region', header: 'Region', type: 'string', width: 100 },
    { id: 'product', field: 'product', header: 'Product', type: 'string', width: 120 },
    { id: 'quantity', field: 'quantity', header: 'Quantity', type: 'number', width: 100 },
    { id: 'unitPrice', field: 'unitPrice', header: 'Unit Price', type: 'currency', width: 120 },
    { id: 'total', field: 'total', header: 'Total', type: 'currency', width: 120 },
    { id: 'saleDate', field: 'saleDate', header: 'Sale Date', type: 'date', width: 120 },
    { id: 'commission', field: 'commission', header: 'Commission', type: 'currency', width: 120 }
  ];

  gridConfig: GridConfig = {
    selectable: true,
    multiSelect: true,
    exportable: true,
    exportFormats: ['excel', 'pdf', 'csv']
  };

  constructor() {
    // Calculate totals and commissions
    this.salesData.forEach(item => {
      item.total = item.quantity * item.unitPrice;
      item.commission = item.total * 0.05; // 5% commission
    });
  }

  async exportToExcel() {
    this.setExportStatus('info', 'Preparing Excel export...');
    
    try {
      const result = await this.grid.exportToExcel({
        filename: 'sales-report.xlsx',
        sheetName: 'Sales Data',
        includeHeaders: this.exportOptions.includeHeaders,
        selectedRowsOnly: this.exportOptions.selectedRowsOnly,
        includeHiddenColumns: this.exportOptions.includeHiddenColumns,
        
        customFormatting: {
          headerStyle: {
            font: { bold: true, color: 'FFFFFF', size: 12 },
            fill: { bgColor: '2E86AB' },
            alignment: { horizontal: 'center' }
          },
          dataStyle: {
            font: { name: 'Arial', size: 10 }
          }
        },
        
        columnWidths: {
          salesperson: 20,
          region: 12,
          product: 15,
          quantity: 12,
          unitPrice: 15,
          total: 15,
          saleDate: 15,
          commission: 15
        },
        
        charts: [
          {
            type: 'column',
            range: 'E2:E1001', // Total column
            title: 'Sales by Amount',
            position: { x: 10, y: 10, width: 400, height: 300 }
          }
        ],
        
        progress: (progress) => {
          this.exportProgress = progress;
        }
      });

      this.setExportStatus('success', `Excel export completed: ${result.filename}`);
    } catch (error) {
      this.setExportStatus('error', 'Excel export failed');
    }
  }

  async exportToPDF() {
    this.setExportStatus('info', 'Generating PDF report...');
    
    try {
      const result = await this.grid.exportToPDF({
        filename: 'sales-report.pdf',
        title: 'Sales Report',
        orientation: 'landscape',
        
        header: {
          enabled: true,
          height: 60,
          logo: {
            src: '/assets/company-logo.png',
            width: 100,
            height: 40
          },
          title: {
            text: 'Monthly Sales Report',
            style: { fontSize: 16, fontWeight: 'bold' }
          },
          date: {
            text: new Date().toLocaleDateString(),
            style: { fontSize: 10 }
          }
        },
        
        footer: {
          enabled: true,
          height: 30,
          text: 'Page {PAGE} of {TOTAL} - Confidential',
          alignment: 'center',
          style: { fontSize: 9, color: '#666666' }
        },
        
        tableStyle: {
          headerStyle: {
            backgroundColor: '#2E86AB',
            color: '#FFFFFF',
            fontWeight: 'bold'
          },
          alternatingRows: {
            evenRowColor: '#F8F9FA',
            oddRowColor: '#FFFFFF'
          }
        },
        
        progress: (progress) => {
          this.exportProgress = progress;
        }
      });

      this.setExportStatus('success', `PDF export completed: ${result.filename}`);
    } catch (error) {
      this.setExportStatus('error', 'PDF export failed');
    }
  }

  async exportToCSV() {
    this.setExportStatus('info', 'Preparing CSV export...');
    
    try {
      const result = await this.grid.exportToCSV({
        filename: 'sales-data.csv',
        delimiter: ',',
        includeHeaders: this.exportOptions.includeHeaders,
        selectedRowsOnly: this.exportOptions.selectedRowsOnly,
        
        valueTransformer: (value, column, row) => {
          // Custom value transformation
          if (column === 'saleDate') {
            return new Date(value).toLocaleDateString();
          }
          if (column === 'unitPrice' || column === 'total' || column === 'commission') {
            return `$${value.toFixed(2)}`;
          }
          return value;
        },
        
        progress: (progress) => {
          this.exportProgress = progress;
        }
      });

      this.setExportStatus('success', `CSV export completed: ${result.filename}`);
    } catch (error) {
      this.setExportStatus('error', 'CSV export failed');
    }
  }

  onExportComplete(result: any) {
    console.log('Export completed:', result);
    setTimeout(() => {
      this.exportStatus = null;
      this.exportProgress = 0;
    }, 3000);
  }

  private setExportStatus(type: string, message: string) {
    this.exportStatus = { type, message };
    this.exportProgress = 0;
  }
}
```

### 5. Real-time Data Grid

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-realtime-grid-example',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="example-container">
      <h2>Real-time Data Grid</h2>
      
      <div class="controls">
        <button (click)="toggleUpdates()">
          {{ isUpdating ? 'Stop' : 'Start' }} Updates
        </button>
        <span>Update interval: {{ updateInterval }}ms</span>
        <input type="range" min="100" max="5000" step="100" 
               [(ngModel)]="updateInterval" (change)="restartUpdates()">
      </div>

      <div class="stats">
        <div class="stat">
          <label>Total Records:</label>
          <span>{{ stockData.length }}</span>
        </div>
        <div class="stat">
          <label>Updates/sec:</label>
          <span>{{ updatesPerSecond }}</span>
        </div>
        <div class="stat">
          <label>Last Update:</label>
          <span>{{ lastUpdateTime | date:'HH:mm:ss.SSS' }}</span>
        </div>
      </div>

      <div class="grid-wrapper">
        <ng-ui-lib-grid 
          [data]="stockData" 
          [columns]="columns" 
          [config]="realtimeGridConfig">
        </ng-ui-lib-grid>
      </div>
    </div>
  `
})
export class RealtimeGridExampleComponent implements OnInit, OnDestroy {
  stockData: any[] = [];
  isUpdating = false;
  updateInterval = 1000;
  updatesPerSecond = 0;
  lastUpdateTime = new Date();
  
  private updateSubscription?: Subscription;
  private updateCounter = 0;

  columns: ColumnDefinition[] = [
    {
      id: 'symbol',
      field: 'symbol',
      header: 'Symbol',
      type: 'string',
      width: 100,
      pinned: 'left'
    },
    {
      id: 'price',
      field: 'price',
      header: 'Price',
      type: 'currency',
      width: 100,
      cellStyle: (params) => {
        const change = params.data.change;
        return {
          color: change > 0 ? 'green' : change < 0 ? 'red' : 'black',
          fontWeight: Math.abs(change) > 1 ? 'bold' : 'normal'
        };
      }
    },
    {
      id: 'change',
      field: 'change',
      header: 'Change',
      type: 'number',
      width: 100,
      cellRenderer: (params) => {
        const value = params.value;
        const arrow = value > 0 ? '↗' : value < 0 ? '↘' : '→';
        const color = value > 0 ? 'green' : value < 0 ? 'red' : 'black';
        return `<span style="color: ${color}">${arrow} ${value.toFixed(2)}</span>`;
      }
    },
    {
      id: 'changePercent',
      field: 'changePercent',
      header: 'Change %',
      type: 'percentage',
      width: 100
    },
    {
      id: 'volume',
      field: 'volume',
      header: 'Volume',
      type: 'number',
      width: 120,
      format: { useGrouping: true }
    },
    {
      id: 'marketCap',
      field: 'marketCap',
      header: 'Market Cap',
      type: 'currency',
      width: 140,
      format: { currency: 'USD', notation: 'compact' }
    },
    {
      id: 'lastUpdate',
      field: 'lastUpdate',
      header: 'Last Update',
      type: 'date',
      width: 140,
      format: { dateFormat: 'HH:mm:ss' }
    }
  ];

  realtimeGridConfig: GridConfig = {
    virtualScrolling: true,
    rowHeight: 35,
    deltaRowDataMode: true, // Optimize for frequent updates
    suppressRowTransform: true,
    sortable: true,
    filterable: true,
    theme: 'default'
  };

  ngOnInit() {
    this.initializeData();
    this.startUpdates();
    
    // Track updates per second
    interval(1000).subscribe(() => {
      this.updatesPerSecond = this.updateCounter;
      this.updateCounter = 0;
    });
  }

  ngOnDestroy() {
    this.stopUpdates();
  }

  initializeData() {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA', 'CRM', 'ORCL'];
    
    this.stockData = symbols.map(symbol => ({
      symbol,
      price: Math.random() * 500 + 50,
      change: 0,
      changePercent: 0,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.random() * 1000000000000,
      lastUpdate: new Date()
    }));
  }

  toggleUpdates() {
    if (this.isUpdating) {
      this.stopUpdates();
    } else {
      this.startUpdates();
    }
  }

  startUpdates() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }

    this.isUpdating = true;
    this.updateSubscription = interval(this.updateInterval).subscribe(() => {
      this.updateStockData();
    });
  }

  stopUpdates() {
    this.isUpdating = false;
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
      this.updateSubscription = undefined;
    }
  }

  restartUpdates() {
    if (this.isUpdating) {
      this.stopUpdates();
      this.startUpdates();
    }
  }

  private updateStockData() {
    const updatedData = this.stockData.map(stock => {
      const oldPrice = stock.price;
      const priceChange = (Math.random() - 0.5) * 10; // Random change between -5 and +5
      const newPrice = Math.max(oldPrice + priceChange, 0.01); // Ensure price stays positive
      
      return {
        ...stock,
        price: newPrice,
        change: newPrice - oldPrice,
        changePercent: ((newPrice - oldPrice) / oldPrice) * 100,
        volume: stock.volume + Math.floor((Math.random() - 0.5) * 100000),
        lastUpdate: new Date()
      };
    });

    this.stockData = updatedData;
    this.lastUpdateTime = new Date();
    this.updateCounter++;
  }
}
```

## 📱 CodeSandbox Examples

For a complete development environment, check out these CodeSandbox examples:

- **[Full Grid Implementation](https://codesandbox.io/s/bigledger-grid-complete)** - Complete grid with all features
- **[Performance Testing](https://codesandbox.io/s/bigledger-grid-performance)** - Test with large datasets
- **[Custom Theme Example](https://codesandbox.io/s/bigledger-grid-custom-theme)** - Custom styling and theming
- **[Integration Example](https://codesandbox.io/s/bigledger-grid-integration)** - Integration with other libraries

## 🎯 Tutorial Series

### Beginner Tutorials
1. **[Getting Started](./tutorials/01-getting-started.md)** - Your first grid
2. **[Adding Data](./tutorials/02-adding-data.md)** - Working with data sources
3. **[Column Configuration](./tutorials/03-column-config.md)** - Setting up columns
4. **[Basic Interactions](./tutorials/04-interactions.md)** - Sorting and filtering

### Intermediate Tutorials
1. **[Virtual Scrolling](./tutorials/05-virtual-scrolling.md)** - Handle large datasets
2. **[Custom Renderers](./tutorials/06-custom-renderers.md)** - Custom cell display
3. **[Row Selection](./tutorials/07-row-selection.md)** - Selection patterns
4. **[Export Features](./tutorials/08-export-features.md)** - Export implementation

### Advanced Tutorials
1. **[Real-time Updates](./tutorials/09-realtime-updates.md)** - Live data handling
2. **[Performance Optimization](./tutorials/10-performance.md)** - Optimization techniques
3. **[Custom Themes](./tutorials/11-custom-themes.md)** - Theme development
4. **[Enterprise Integration](./tutorials/12-enterprise.md)** - Enterprise patterns

## 🛠️ Development Tips

### Performance Best Practices
```typescript
// Use OnPush change detection for better performance
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedGridComponent {
  // Use trackBy functions for large datasets
  trackByFn = (index: number, item: any) => item.id || index;
  
  // Use computed values with signals
  filteredData = computed(() => {
    return this.rawData().filter(item => 
      item.name.toLowerCase().includes(this.filterTerm().toLowerCase())
    );
  });
  
  // Debounce user input
  private filterControl = new FormControl();
  
  ngOnInit() {
    this.filterControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => this.filterTerm.set(value));
  }
}
```

### Memory Management
```typescript
export class MemoryOptimizedGridComponent implements OnDestroy {
  private subscriptions = new Subscription();
  
  ngOnInit() {
    // Combine subscriptions for easy cleanup
    this.subscriptions.add(
      this.dataService.getData().subscribe(data => this.processData(data))
    );
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  
  // Use weak references for large objects
  private dataCache = new WeakMap();
}
```

## 🔗 Related Resources

- **[Grid Component Documentation](../../components/grid/)** - Complete grid documentation
- **[API Reference](../../API_REFERENCE.md)** - Detailed API documentation
- **[Performance Guide](../../guides/performance.md)** - Performance optimization
- **[Troubleshooting](../../support/troubleshooting.md)** - Common issues and solutions

## 💬 Community Examples

Share your examples with the community:

1. **Fork** one of our StackBlitz examples
2. **Modify** it to showcase your use case
3. **Share** the link in our GitHub discussions
4. **Tag** it with relevant labels

We regularly feature community examples in our documentation!