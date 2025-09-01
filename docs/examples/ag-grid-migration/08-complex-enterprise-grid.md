# Example 8: Complex Enterprise Grid

## 📚 Target Audience: Library Users

This example demonstrates migrating a complex ag-Grid Enterprise implementation to BLG Grid, combining multiple advanced features in a real-world enterprise scenario.

## 🎯 What This Example Covers

- Multiple advanced features combined
- Column pinning and grouping
- Context menus and status bar
- Advanced filtering with filter sets
- Export functionality (CSV/Excel)
- Keyboard shortcuts and accessibility
- Performance optimization for large datasets

## 📊 Before: ag-Grid Enterprise Implementation

```typescript
import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { 
  ColDef, 
  GridOptions, 
  GridApi, 
  ColumnApi,
  MenuItemDef,
  GetContextMenuItemsParams
} from 'ag-grid-enterprise';

@Component({
  selector: 'app-complex-enterprise-grid',
  template: `
    <div class="enterprise-grid-container">
      <div class="grid-header">
        <h2>Enterprise Financial Dashboard</h2>
        <div class="grid-controls">
          <button (click)="exportToExcel()" class="btn btn-success">
            <i class="fa fa-file-excel"></i> Export Excel
          </button>
          <button (click)="exportToCsv()" class="btn btn-primary">
            <i class="fa fa-file-csv"></i> Export CSV
          </button>
          <button (click)="resetFilters()" class="btn btn-secondary">
            <i class="fa fa-refresh"></i> Reset
          </button>
        </div>
      </div>

      <ag-grid-angular
        #agGrid
        class="ag-theme-alpine-dark"
        style="width: 100%; height: calc(100vh - 200px);"
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        [gridOptions]="gridOptions">
      </ag-grid-angular>

      <div class="grid-footer">
        <div class="status-info">
          <span>Total Records: {{ totalRecords }}</span>
          <span>Filtered: {{ filteredRecords }}</span>
          <span>Selected: {{ selectedRecords }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./complex-enterprise-grid.component.scss']
})
export class ComplexEnterpriseGridComponent implements OnInit {
  @ViewChild('agGrid') agGrid!: AgGridAngular;

  private gridApi!: GridApi;
  private columnApi!: ColumnApi;

  totalRecords = 0;
  filteredRecords = 0;
  selectedRecords = 0;

  columnDefs: ColDef[] = [
    // Pinned left columns
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      pinned: 'left',
      lockPinned: true,
      checkboxSelection: true,
      headerCheckboxSelection: true
    },
    { 
      field: 'symbol', 
      headerName: 'Symbol', 
      width: 100,
      pinned: 'left',
      lockPinned: true,
      cellStyle: { fontWeight: 'bold' },
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    
    // Grouped columns - Company Info
    {
      headerName: 'Company Information',
      children: [
        { 
          field: 'companyName', 
          headerName: 'Company', 
          width: 200,
          filter: 'agTextColumnFilter',
          filterParams: {
            buttons: ['reset', 'apply'],
            debounceMs: 200
          }
        },
        { 
          field: 'sector', 
          headerName: 'Sector', 
          width: 150,
          filter: 'agSetColumnFilter',
          enableRowGroup: true,
          filterParams: {
            values: ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer']
          }
        },
        { 
          field: 'industry', 
          headerName: 'Industry', 
          width: 150,
          filter: 'agSetColumnFilter',
          enableRowGroup: true
        }
      ]
    },

    // Grouped columns - Financial Metrics
    {
      headerName: 'Financial Metrics',
      children: [
        { 
          field: 'price', 
          headerName: 'Price', 
          width: 120,
          valueFormatter: (params) => '$' + params.value?.toFixed(2),
          cellStyle: { textAlign: 'right' },
          aggFunc: 'avg',
          filter: 'agNumberColumnFilter'
        },
        { 
          field: 'change', 
          headerName: 'Change', 
          width: 120,
          valueFormatter: (params) => {
            const value = params.value;
            return (value >= 0 ? '+' : '') + value?.toFixed(2);
          },
          cellStyle: (params) => {
            return params.value >= 0 
              ? { color: 'green', textAlign: 'right' }
              : { color: 'red', textAlign: 'right' };
          }
        },
        { 
          field: 'changePercent', 
          headerName: 'Change %', 
          width: 120,
          valueFormatter: (params) => {
            const value = params.value;
            return (value >= 0 ? '+' : '') + value?.toFixed(2) + '%';
          },
          cellStyle: (params) => {
            return params.value >= 0 
              ? { color: 'green', textAlign: 'right' }
              : { color: 'red', textAlign: 'right' };
          }
        },
        { 
          field: 'volume', 
          headerName: 'Volume', 
          width: 140,
          valueFormatter: (params) => params.value?.toLocaleString(),
          aggFunc: 'sum',
          cellStyle: { textAlign: 'right' }
        }
      ]
    },

    // Grouped columns - Valuation
    {
      headerName: 'Valuation Metrics',
      children: [
        { 
          field: 'marketCap', 
          headerName: 'Market Cap', 
          width: 140,
          valueFormatter: (params) => {
            const value = params.value;
            if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B';
            if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
            return '$' + value?.toLocaleString();
          },
          aggFunc: 'sum',
          cellStyle: { textAlign: 'right' }
        },
        { 
          field: 'peRatio', 
          headerName: 'P/E Ratio', 
          width: 120,
          valueFormatter: (params) => params.value?.toFixed(1),
          cellStyle: { textAlign: 'right' },
          filter: 'agNumberColumnFilter'
        },
        { 
          field: 'dividend', 
          headerName: 'Dividend', 
          width: 120,
          valueFormatter: (params) => params.value ? params.value.toFixed(2) + '%' : 'N/A',
          cellStyle: { textAlign: 'right' }
        }
      ]
    },

    // Pinned right column
    { 
      field: 'lastUpdated', 
      headerName: 'Last Updated', 
      width: 140,
      pinned: 'right',
      valueFormatter: (params) => new Date(params.value).toLocaleTimeString(),
      cellStyle: { fontSize: '11px', color: '#666' }
    }
  ];

  gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: true
    },
    
    // Row selection and grouping
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    suppressAggFuncInHeader: false,
    
    // Sidebar with columns and filters
    sideBar: {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel'
        },
        {
          id: 'filters',
          labelDefault: 'Filters', 
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel'
        }
      ]
    },

    // Status bar
    statusBar: {
      statusPanels: [
        { statusPanel: 'agTotalAndFilteredRowCountComponent' },
        { statusPanel: 'agTotalRowCountComponent' },
        { statusPanel: 'agFilteredRowCountComponent' },
        { statusPanel: 'agSelectedRowCountComponent' },
        { statusPanel: 'agAggregationComponent' }
      ]
    },

    // Context menu
    getContextMenuItems: (params: GetContextMenuItemsParams) => {
      const result: MenuItemDef[] = [
        'copy',
        'copyWithHeaders', 
        'separator',
        'export',
        'csvExport',
        'excelExport',
        'separator',
        {
          name: 'Add to Watchlist',
          action: () => {
            console.log('Adding to watchlist:', params.node?.data);
            alert('Added to watchlist: ' + params.node?.data.symbol);
          },
          icon: '<i class="fa fa-star"></i>'
        },
        {
          name: 'View Company Details',
          action: () => {
            console.log('Viewing details:', params.node?.data);
            alert('Viewing details: ' + params.node?.data.companyName);
          },
          icon: '<i class="fa fa-info-circle"></i>'
        }
      ];
      return result;
    },

    // Events
    onGridReady: (params) => {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      this.updateCounters();
    },
    onSelectionChanged: () => this.updateCounters(),
    onFilterChanged: () => this.updateCounters(),

    // Performance settings
    animateRows: true,
    enableRangeSelection: true,
    enableCharts: true,
    suppressMenuHide: false,
    
    // Virtual scrolling for large datasets
    rowBuffer: 20,
    suppressRowVirtualisation: false
  };

  rowData: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Simulate loading 10,000 records
    this.rowData = this.generateFinancialData(10000);
    this.totalRecords = this.rowData.length;
  }

  private generateFinancialData(count: number): any[] {
    const sectors = ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer'];
    const data: any[] = [];

    for (let i = 1; i <= count; i++) {
      const price = Math.random() * 500 + 10;
      const change = (Math.random() - 0.5) * 20;
      const changePercent = (change / price) * 100;
      const volume = Math.floor(Math.random() * 1000000) + 10000;
      const sector = sectors[Math.floor(Math.random() * sectors.length)];

      data.push({
        id: i,
        symbol: `STOCK${i.toString().padStart(4, '0')}`,
        companyName: `Company ${i}`,
        sector: sector,
        industry: `${sector} Industry`,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: volume,
        marketCap: price * volume * Math.random() * 100,
        peRatio: Math.random() * 30 + 5,
        dividend: Math.random() * 5,
        lastUpdated: new Date()
      });
    }

    return data;
  }

  private updateCounters() {
    this.totalRecords = this.gridApi?.getDisplayedRowCount() || 0;
    this.filteredRecords = this.gridApi?.getDisplayedRowCount() || 0;
    this.selectedRecords = this.gridApi?.getSelectedRows().length || 0;
  }

  exportToExcel() {
    this.gridApi?.exportDataAsExcel({
      fileName: 'financial-data.xlsx',
      sheetName: 'Stock Data'
    });
  }

  exportToCsv() {
    this.gridApi?.exportDataAsCsv({
      fileName: 'financial-data.csv'
    });
  }

  resetFilters() {
    this.gridApi?.setFilterModel(null);
  }
}
```

## ✅ After: BLG Grid Implementation

```typescript
import { Component, OnInit, signal, computed } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { CommonModule } from '@angular/common';
import { 
  ColumnDefinition, 
  GridConfig, 
  GridApi,
  SelectionChangedEvent,
  FilterChangedEvent,
  ContextMenuConfig,
  StatusBarConfig,
  SidebarConfig
} from '@ng-ui-lib/core';

@Component({
  selector: 'app-complex-enterprise-grid',
  standalone: true,
  imports: [Grid, CommonModule],
  template: `
    <div class="enterprise-grid-container">
      <div class="grid-header">
        <h2>Enterprise Financial Dashboard</h2>
        <div class="grid-controls">
          <button (click)="exportToExcel()" class="btn btn-success">
            <i class="fa fa-file-excel"></i> Export Excel
          </button>
          <button (click)="exportToCsv()" class="btn btn-primary">
            <i class="fa fa-file-csv"></i> Export CSV
          </button>
          <button (click)="resetFilters()" class="btn btn-secondary">
            <i class="fa fa-refresh"></i> Reset
          </button>
        </div>
      </div>

      <ng-ui-lib
        class="blg-theme-dark"
        style="width: 100%; height: calc(100vh - 200px);"
        [columns]="columns"
        [data]="data"
        [config]="config"
        (gridReady)="onGridReady($event)"
        (selectionChanged)="onSelectionChanged($event)"
        (filterChanged)="onFilterChanged($event)">
      </ng-ui-lib>

      <div class="grid-footer">
        <div class="status-info">
          <span>Total Records: {{ totalRecords() | number }}</span>
          <span>Filtered: {{ filteredRecords() | number }}</span>
          <span>Selected: {{ selectedRecords() | number }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./complex-enterprise-grid.component.scss']
})
export class ComplexEnterpriseGridComponent implements OnInit {

  private gridApi?: GridApi;

  // Reactive state
  data = signal<any[]>([]);
  selectedRows = signal<any[]>([]);
  
  // Computed values
  totalRecords = computed(() => this.data().length);
  filteredRecords = computed(() => this.data().length); // Will be updated by grid
  selectedRecords = computed(() => this.selectedRows().length);

  columns: ColumnDefinition[] = [
    // Pinned left columns
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      pinned: 'left',
      lockPinned: true,
      checkboxSelection: true,
      headerCheckboxSelection: true
    },
    { 
      field: 'symbol', 
      headerName: 'Symbol', 
      width: 100,
      pinned: 'left',
      lockPinned: true,
      cellStyle: { fontWeight: 'bold' },
      filterable: true,
      filterType: 'text',
      filterOptions: {
        showApplyButton: true,
        showResetButton: true,
        closeOnApply: true
      }
    },
    
    // Column group - Company Info
    {
      headerName: 'Company Information',
      columnGroupShow: 'open',
      children: [
        { 
          field: 'companyName', 
          headerName: 'Company', 
          width: 200,
          filterable: true,
          filterType: 'text',
          filterOptions: {
            showApplyButton: true,
            showResetButton: true,
            debounceMs: 200
          }
        },
        { 
          field: 'sector', 
          headerName: 'Sector', 
          width: 150,
          filterable: true,
          filterType: 'set',
          enableRowGroup: true,
          filterOptions: {
            values: ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer']
          }
        },
        { 
          field: 'industry', 
          headerName: 'Industry', 
          width: 150,
          filterable: true,
          filterType: 'set',
          enableRowGroup: true
        }
      ]
    } as ColumnDefinition,

    // Column group - Financial Metrics
    {
      headerName: 'Financial Metrics', 
      columnGroupShow: 'open',
      children: [
        { 
          field: 'price', 
          headerName: 'Price', 
          width: 120,
          valueFormatter: (value) => '$' + value?.toFixed(2),
          cellStyle: { textAlign: 'right' },
          aggregationFunction: 'avg',
          filterable: true,
          filterType: 'number'
        },
        { 
          field: 'change', 
          headerName: 'Change', 
          width: 120,
          valueFormatter: (value) => (value >= 0 ? '+' : '') + value?.toFixed(2),
          cellStyle: (params) => ({
            color: params.value >= 0 ? 'green' : 'red',
            textAlign: 'right'
          })
        },
        { 
          field: 'changePercent', 
          headerName: 'Change %', 
          width: 120,
          valueFormatter: (value) => (value >= 0 ? '+' : '') + value?.toFixed(2) + '%',
          cellStyle: (params) => ({
            color: params.value >= 0 ? 'green' : 'red',
            textAlign: 'right'
          })
        },
        { 
          field: 'volume', 
          headerName: 'Volume', 
          width: 140,
          valueFormatter: (value) => value?.toLocaleString(),
          aggregationFunction: 'sum',
          cellStyle: { textAlign: 'right' }
        }
      ]
    } as ColumnDefinition,

    // Column group - Valuation
    {
      headerName: 'Valuation Metrics',
      columnGroupShow: 'open', 
      children: [
        { 
          field: 'marketCap', 
          headerName: 'Market Cap', 
          width: 140,
          valueFormatter: (value) => {
            if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B';
            if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
            return '$' + value?.toLocaleString();
          },
          aggregationFunction: 'sum',
          cellStyle: { textAlign: 'right' }
        },
        { 
          field: 'peRatio', 
          headerName: 'P/E Ratio', 
          width: 120,
          valueFormatter: (value) => value?.toFixed(1),
          cellStyle: { textAlign: 'right' },
          filterable: true,
          filterType: 'number'
        },
        { 
          field: 'dividend', 
          headerName: 'Dividend', 
          width: 120,
          valueFormatter: (value) => value ? value.toFixed(2) + '%' : 'N/A',
          cellStyle: { textAlign: 'right' }
        }
      ]
    } as ColumnDefinition,

    // Pinned right column
    { 
      field: 'lastUpdated', 
      headerName: 'Last Updated', 
      width: 140,
      pinned: 'right',
      valueFormatter: (value) => new Date(value).toLocaleTimeString(),
      cellStyle: { fontSize: '11px', color: '#666' }
    }
  ];

  config: GridConfig = {
    defaultColumnOptions: {
      resizable: true,
      sortable: true,
      filterable: true,
      showFloatingFilter: true
    },
    
    // Row selection and grouping
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    suppressAggFuncInHeader: false,
    
    // Sidebar
    sidebar: {
      enabled: true,
      panels: [
        {
          id: 'columns',
          title: 'Columns',
          icon: 'columns',
          component: 'columnsPanel'
        },
        {
          id: 'filters',
          title: 'Filters',
          icon: 'filter', 
          component: 'filtersPanel'
        }
      ]
    } as SidebarConfig,

    // Status bar
    statusBar: {
      enabled: true,
      panels: [
        { component: 'totalRowCount' },
        { component: 'filteredRowCount' },
        { component: 'selectedRowCount' },
        { component: 'aggregation' }
      ]
    } as StatusBarConfig,

    // Context menu
    contextMenu: {
      enabled: true,
      items: [
        'copy',
        'copyWithHeaders',
        'separator',
        'export',
        'csvExport', 
        'excelExport',
        'separator',
        {
          name: 'Add to Watchlist',
          icon: 'star',
          action: (params) => {
            console.log('Adding to watchlist:', params.rowData);
            alert('Added to watchlist: ' + params.rowData.symbol);
          }
        },
        {
          name: 'View Company Details',
          icon: 'info-circle',
          action: (params) => {
            console.log('Viewing details:', params.rowData);
            alert('Viewing details: ' + params.rowData.companyName);
          }
        }
      ]
    } as ContextMenuConfig,

    // Performance settings
    animateRows: true,
    enableRangeSelection: true,
    suppressMenuHide: false,
    
    // Virtual scrolling
    virtualScrolling: {
      enabled: true,
      bufferSize: 20,
      threshold: 100
    }
  };

  ngOnInit() {
    this.loadData();
  }

  onGridReady(gridApi: GridApi) {
    this.gridApi = gridApi;
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedRows.set(event.selectedRows);
  }

  onFilterChanged(event: FilterChangedEvent) {
    // Update filtered count based on visible rows
    // This would be handled automatically by the grid
  }

  loadData() {
    // Simulate loading 10,000 records
    const financialData = this.generateFinancialData(10000);
    this.data.set(financialData);
  }

  private generateFinancialData(count: number): any[] {
    const sectors = ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer'];
    const data: any[] = [];

    for (let i = 1; i <= count; i++) {
      const price = Math.random() * 500 + 10;
      const change = (Math.random() - 0.5) * 20;
      const changePercent = (change / price) * 100;
      const volume = Math.floor(Math.random() * 1000000) + 10000;
      const sector = sectors[Math.floor(Math.random() * sectors.length)];

      data.push({
        id: i,
        symbol: `STOCK${i.toString().padStart(4, '0')}`,
        companyName: `Company ${i}`,
        sector: sector,
        industry: `${sector} Industry`,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: volume,
        marketCap: price * volume * Math.random() * 100,
        peRatio: Math.random() * 30 + 5,
        dividend: Math.random() * 5,
        lastUpdated: new Date()
      });
    }

    return data;
  }

  exportToExcel() {
    this.gridApi?.exportToExcel({
      fileName: 'financial-data.xlsx',
      sheetName: 'Stock Data'
    });
  }

  exportToCsv() {
    this.gridApi?.exportToCsv({
      fileName: 'financial-data.csv'
    });
  }

  resetFilters() {
    this.gridApi?.setFilterModel(null);
  }
}
```

**Migration Time**: ~4-6 hours for a complex enterprise grid like this.

**Key Changes**:
- Consolidated configuration objects (`sidebar`, `statusBar`, `contextMenu`)
- Column groups use `children` property with proper typing
- Reactive state management with Angular Signals
- Simplified event handling with template binding
- Better TypeScript support for all enterprise features
- Streamlined API methods with consistent naming