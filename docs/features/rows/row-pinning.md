# Row Pinning

## Overview

Row pinning allows you to fix specific rows to the top or bottom of the grid, keeping them visible while users scroll through other data. This feature is essential for displaying summary rows, headers, totals, or important information that should remain in view.

## Use Cases

- Pin header rows for section organization
- Keep summary/total rows visible at the bottom
- Display important alerts or notifications at the top
- Create fixed navigation or action rows
- Show loading states or status information

## Basic Row Pinning

### Static Pinned Rows

```typescript
import { BlgGridComponent } from '@blg/grid';

@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [pinnedTopRowData]="pinnedTopRowData"
      [pinnedBottomRowData]="pinnedBottomRowData">
    </blg-grid>
  `
})
export class StaticPinnedRowsComponent {
  columnDefs = [
    { field: 'name', headerName: 'Product Name' },
    { field: 'category', headerName: 'Category' },
    { field: 'price', headerName: 'Price', type: 'numericColumn' },
    { field: 'quantity', headerName: 'Quantity', type: 'numericColumn' },
    { field: 'total', headerName: 'Total', type: 'numericColumn' }
  ];

  // Regular scrollable data
  rowData = [
    { name: 'Laptop Pro', category: 'Electronics', price: 1299, quantity: 2, total: 2598 },
    { name: 'Wireless Mouse', category: 'Electronics', price: 29, quantity: 5, total: 145 },
    { name: 'Office Chair', category: 'Furniture', price: 299, quantity: 1, total: 299 },
    { name: 'Standing Desk', category: 'Furniture', price: 599, quantity: 1, total: 599 }
  ];

  // Pinned to top
  pinnedTopRowData = [
    {
      name: 'SALES SUMMARY',
      category: '',
      price: '',
      quantity: '',
      total: 'Total: $3,641',
      isPinnedTop: true,
      cellStyle: { 
        backgroundColor: '#f0f8ff', 
        fontWeight: 'bold',
        fontSize: '14px'
      }
    }
  ];

  // Pinned to bottom
  pinnedBottomRowData = [
    {
      name: 'GRAND TOTAL',
      category: '4 Categories',
      price: 'Avg: $556.50',
      quantity: '9 Items',
      total: '$3,641.00',
      isPinnedBottom: true,
      cellStyle: { 
        backgroundColor: '#fff8f0', 
        fontWeight: 'bold',
        borderTop: '2px solid #007bff'
      }
    }
  ];
}
```

### Dynamic Row Pinning

```typescript
@Component({
  template: `
    <div class="controls">
      <button (click)="addTopPinnedRow()">Add Top Summary</button>
      <button (click)="addBottomPinnedRow()">Add Bottom Total</button>
      <button (click)="clearPinnedRows()">Clear Pinned Rows</button>
      <button (click)="pinCurrentSelection()">Pin Selected Row</button>
    </div>
    <blg-grid 
      #grid
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [pinnedTopRowData]="pinnedTopRowData"
      [pinnedBottomRowData]="pinnedBottomRowData"
      (gridReady)="onGridReady($event)"
      (rowSelected)="onRowSelected($event)">
    </blg-grid>
  `
})
export class DynamicPinnedRowsComponent {
  private gridApi!: GridApi;
  pinnedTopRowData: any[] = [];
  pinnedBottomRowData: any[] = [];

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  addTopPinnedRow(): void {
    const summaryRow = this.createSummaryRow();
    this.pinnedTopRowData = [...this.pinnedTopRowData, summaryRow];
    this.gridApi.setPinnedTopRowData(this.pinnedTopRowData);
  }

  addBottomPinnedRow(): void {
    const totalRow = this.createTotalRow();
    this.pinnedBottomRowData = [...this.pinnedBottomRowData, totalRow];
    this.gridApi.setPinnedBottomRowData(this.pinnedBottomRowData);
  }

  clearPinnedRows(): void {
    this.pinnedTopRowData = [];
    this.pinnedBottomRowData = [];
    this.gridApi.setPinnedTopRowData([]);
    this.gridApi.setPinnedBottomRowData([]);
  }

  pinCurrentSelection(): void {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length > 0) {
      const rowToPinned = { ...selectedRows[0], isPinned: true };
      this.pinnedTopRowData = [...this.pinnedTopRowData, rowToPinned];
      this.gridApi.setPinnedTopRowData(this.pinnedTopRowData);
    }
  }

  private createSummaryRow(): any {
    const totalValue = this.calculateTotal();
    return {
      id: 'summary-' + Date.now(),
      name: 'CURRENT SUMMARY',
      category: this.getCategoryCount(),
      price: this.getAveragePrice(),
      quantity: this.getTotalQuantity(),
      total: `$${totalValue.toLocaleString()}`,
      isPinnedRow: true,
      rowType: 'summary'
    };
  }

  private createTotalRow(): any {
    return {
      id: 'total-' + Date.now(),
      name: 'GRAND TOTAL',
      category: '',
      price: '',
      quantity: '',
      total: `$${this.calculateTotal().toLocaleString()}`,
      isPinnedRow: true,
      rowType: 'total'
    };
  }
}
```

## Advanced Pinning Features

### Conditional Row Pinning

```typescript
export class ConditionalPinnedRowsComponent {
  private userRole: string = 'manager';
  private showSummaries: boolean = true;

  get pinnedTopRowData(): any[] {
    const pinnedRows = [];

    // Add notification row for all users
    if (this.hasActiveNotifications()) {
      pinnedRows.push(this.createNotificationRow());
    }

    // Add summary row only for managers
    if (this.userRole === 'manager' && this.showSummaries) {
      pinnedRows.push(this.createManagerSummaryRow());
    }

    return pinnedRows;
  }

  get pinnedBottomRowData(): any[] {
    const pinnedRows = [];

    // Add status row based on data state
    if (this.hasDataErrors()) {
      pinnedRows.push(this.createErrorRow());
    } else if (this.isLoadingData()) {
      pinnedRows.push(this.createLoadingRow());
    } else {
      pinnedRows.push(this.createStatusRow());
    }

    return pinnedRows;
  }

  private hasActiveNotifications(): boolean {
    return this.notifications.some(n => n.active);
  }

  private createNotificationRow(): any {
    const activeNotification = this.notifications.find(n => n.active);
    return {
      id: 'notification',
      name: '⚠️ ' + activeNotification?.message,
      category: '',
      price: '',
      quantity: '',
      total: 'Dismiss',
      rowType: 'notification',
      cellStyle: { backgroundColor: '#fff3cd', color: '#856404' }
    };
  }

  private createManagerSummaryRow(): any {
    return {
      id: 'manager-summary',
      name: '📊 Manager Summary',
      category: `${this.getUniqueCategories()} categories`,
      price: `Avg: $${this.getAveragePrice()}`,
      quantity: `${this.getTotalItems()} items`,
      total: `$${this.getTotalRevenue()}`,
      rowType: 'manager-summary',
      cellStyle: { backgroundColor: '#e8f4fd', fontWeight: 'bold' }
    };
  }
}
```

### Interactive Pinned Rows

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [pinnedTopRowData]="pinnedTopRowData"
      [frameworkComponents]="frameworkComponents"
      (cellClicked)="onCellClicked($event)">
    </blg-grid>
  `
})
export class InteractivePinnedRowsComponent {
  frameworkComponents = {
    pinnedRowActionRenderer: PinnedRowActionRendererComponent,
    pinnedRowToggleRenderer: PinnedRowToggleRendererComponent
  };

  columnDefs = [
    { field: 'name', headerName: 'Name' },
    { field: 'value', headerName: 'Value' },
    { field: 'status', headerName: 'Status' },
    {
      field: 'actions',
      headerName: 'Actions',
      cellRenderer: (params) => {
        if (params.node.rowPinned) {
          return 'pinnedRowActionRenderer';
        }
        return 'defaultActionRenderer';
      }
    }
  ];

  pinnedTopRowData = [
    {
      id: 'filter-row',
      name: 'Quick Filters',
      value: '',
      status: '',
      actions: '',
      rowType: 'filter',
      cellRenderer: {
        name: 'pinnedRowToggleRenderer',
        value: 'filterValueRenderer',
        status: 'filterStatusRenderer',
        actions: 'pinnedRowActionRenderer'
      }
    }
  ];

  onCellClicked(event: any): void {
    if (event.node.rowPinned && event.data.rowType === 'filter') {
      this.handleFilterRowClick(event);
    }
  }

  private handleFilterRowClick(event: any): void {
    const column = event.column.getColId();
    
    switch (column) {
      case 'name':
        this.toggleNameFilter();
        break;
      case 'status':
        this.toggleStatusFilter();
        break;
      case 'actions':
        this.showFilterMenu();
        break;
    }
  }
}
```

### Custom Pinned Row Renderers

```typescript
@Component({
  selector: 'app-pinned-summary-renderer',
  template: `
    <div class="pinned-summary-row" [ngClass]="getRowClass()">
      <div class="summary-section" *ngIf="showCategoryStats">
        <span class="summary-label">Categories:</span>
        <span class="summary-value">{{ categoryCount }}</span>
      </div>
      
      <div class="summary-section" *ngIf="showTotalStats">
        <span class="summary-label">Total Items:</span>
        <span class="summary-value">{{ totalItems }}</span>
      </div>
      
      <div class="summary-section highlight" *ngIf="showRevenue">
        <span class="summary-label">Revenue:</span>
        <span class="summary-value">${{ totalRevenue | number:'1.2-2' }}</span>
      </div>
      
      <div class="summary-actions">
        <button 
          class="summary-button"
          (click)="exportData()"
          title="Export Data">
          📊
        </button>
        <button 
          class="summary-button"
          (click)="refreshData()"
          title="Refresh Data">
          🔄
        </button>
        <button 
          class="summary-button"
          (click)="toggleDetails()"
          title="Toggle Details">
          {{ showDetails ? '▼' : '▶' }}
        </button>
      </div>
    </div>
    
    <div class="summary-details" *ngIf="showDetails">
      <div class="detail-item">
        <strong>Last Updated:</strong> {{ lastUpdated | date:'short' }}
      </div>
      <div class="detail-item">
        <strong>Data Quality:</strong> 
        <span [class]="getQualityClass()">{{ dataQuality }}</span>
      </div>
    </div>
  `,
  styles: [`
    .pinned-summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #dee2e6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    }
    
    .summary-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 16px;
    }
    
    .summary-section.highlight {
      background: rgba(0, 123, 255, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .summary-label {
      font-size: 11px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .summary-value {
      font-size: 16px;
      font-weight: 600;
      color: #212529;
    }
    
    .summary-actions {
      display: flex;
      gap: 8px;
    }
    
    .summary-button {
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .summary-button:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }
    
    .summary-details {
      background: #f8f9fa;
      padding: 12px 16px;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      gap: 24px;
    }
    
    .detail-item {
      font-size: 12px;
      color: #495057;
    }
  `]
})
export class PinnedSummaryRendererComponent implements ICellRendererAngularComp {
  categoryCount: number = 0;
  totalItems: number = 0;
  totalRevenue: number = 0;
  showDetails: boolean = false;
  lastUpdated: Date = new Date();
  dataQuality: string = 'Good';
  
  // Configuration flags
  showCategoryStats: boolean = true;
  showTotalStats: boolean = true;
  showRevenue: boolean = true;
  
  private params: any;

  agInit(params: any): void {
    this.params = params;
    this.calculateSummaryStats();
  }

  refresh(params: any): boolean {
    this.params = params;
    this.calculateSummaryStats();
    return true;
  }

  private calculateSummaryStats(): void {
    // Calculate stats from grid data
    this.params.api.forEachNode((node: any) => {
      if (!node.rowPinned) {
        this.totalItems++;
        this.totalRevenue += node.data.revenue || 0;
      }
    });
    
    // Calculate unique categories
    const categories = new Set();
    this.params.api.forEachNode((node: any) => {
      if (!node.rowPinned && node.data.category) {
        categories.add(node.data.category);
      }
    });
    this.categoryCount = categories.size;
  }

  exportData(): void {
    console.log('Exporting data...');
    this.params.context.exportService.exportToExcel();
  }

  refreshData(): void {
    console.log('Refreshing data...');
    this.params.api.refreshInfiniteCache();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  getRowClass(): string {
    return `summary-type-${this.params.data.summaryType || 'default'}`;
  }

  getQualityClass(): string {
    const quality = this.dataQuality.toLowerCase();
    return `quality-${quality}`;
  }
}
```

## Pinned Row Styling

### Custom Pinned Row Styles

```typescript
export class StyledPinnedRowsComponent {
  pinnedTopRowData = [
    {
      id: 'header-row',
      type: 'header',
      message: 'Sales Dashboard - Q4 2024',
      rowClass: 'pinned-header-row',
      cellStyle: {
        backgroundColor: '#1e3a8a',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: '16px'
      }
    }
  ];

  pinnedBottomRowData = [
    {
      id: 'footer-row',
      type: 'footer',
      message: 'Data as of ' + new Date().toLocaleDateString(),
      rowClass: 'pinned-footer-row',
      cellStyle: {
        backgroundColor: '#f3f4f6',
        color: '#374151',
        fontStyle: 'italic',
        textAlign: 'center',
        borderTop: '2px solid #d1d5db'
      }
    }
  ];

  // Apply row-specific styling
  getRowStyle = (params: any): any => {
    if (params.node.rowPinned === 'top') {
      return { backgroundColor: '#eff6ff', borderBottom: '2px solid #3b82f6' };
    }
    
    if (params.node.rowPinned === 'bottom') {
      return { backgroundColor: '#f9fafb', borderTop: '2px solid #6b7280' };
    }
    
    return {};
  };

  // Apply cell-specific styling for pinned rows
  getCellStyle = (params: any): any => {
    if (params.node.rowPinned) {
      return {
        fontWeight: 'bold',
        padding: '12px 8px'
      };
    }
    return {};
  };
}

// Corresponding CSS
/*
.pinned-header-row {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%) !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pinned-footer-row {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important;
  border-top: 2px solid #d1d5db !important;
}

.ag-row-pinned-top {
  position: sticky !important;
  z-index: 10 !important;
}

.ag-row-pinned-bottom {
  position: sticky !important;
  z-index: 10 !important;
}
*/
```

## Performance Considerations

### Efficient Pinned Row Updates

```typescript
export class OptimizedPinnedRowsComponent {
  private pinnedTopCache = new Map<string, any>();
  private pinnedBottomCache = new Map<string, any>();
  private updateTimeout?: number;

  // Debounced pinned row updates
  updatePinnedRows(): void {
    clearTimeout(this.updateTimeout);
    this.updateTimeout = window.setTimeout(() => {
      this.performPinnedRowUpdate();
    }, 100);
  }

  private performPinnedRowUpdate(): void {
    const topRows = this.calculateTopPinnedRows();
    const bottomRows = this.calculateBottomPinnedRows();

    // Only update if data has changed
    if (this.hasTopRowsChanged(topRows)) {
      this.gridApi.setPinnedTopRowData(topRows);
    }

    if (this.hasBottomRowsChanged(bottomRows)) {
      this.gridApi.setPinnedBottomRowData(bottomRows);
    }
  }

  private hasTopRowsChanged(newRows: any[]): boolean {
    const currentHash = this.hashRows(newRows);
    const cachedHash = this.pinnedTopCache.get('hash');
    
    if (currentHash !== cachedHash) {
      this.pinnedTopCache.set('hash', currentHash);
      this.pinnedTopCache.set('rows', newRows);
      return true;
    }
    
    return false;
  }

  private hashRows(rows: any[]): string {
    return rows.map(row => JSON.stringify(row)).join('|');
  }

  // Batch pinned row operations
  batchUpdatePinnedRows(operations: Array<{
    type: 'add' | 'remove' | 'update',
    position: 'top' | 'bottom',
    row: any
  }>): void {
    let topRows = [...this.getCurrentTopRows()];
    let bottomRows = [...this.getCurrentBottomRows()];

    operations.forEach(op => {
      const targetRows = op.position === 'top' ? topRows : bottomRows;
      
      switch (op.type) {
        case 'add':
          targetRows.push(op.row);
          break;
        case 'remove':
          const removeIndex = targetRows.findIndex(r => r.id === op.row.id);
          if (removeIndex >= 0) targetRows.splice(removeIndex, 1);
          break;
        case 'update':
          const updateIndex = targetRows.findIndex(r => r.id === op.row.id);
          if (updateIndex >= 0) targetRows[updateIndex] = op.row;
          break;
      }
    });

    // Apply all changes at once
    this.gridApi.setPinnedTopRowData(topRows);
    this.gridApi.setPinnedBottomRowData(bottomRows);
  }
}
```

## API Reference

### Grid Options

| Option | Type | Description |
|--------|------|-------------|
| `pinnedTopRowData` | any[] | Data for top pinned rows |
| `pinnedBottomRowData` | any[] | Data for bottom pinned rows |
| `getRowStyle` | function | Function to style rows including pinned |
| `getRowClass` | function | Function to add CSS classes to rows |

### API Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `setPinnedTopRowData()` | `data: any[]` | Set top pinned row data |
| `setPinnedBottomRowData()` | `data: any[]` | Set bottom pinned row data |
| `getPinnedTopRowData()` | - | Get current top pinned rows |
| `getPinnedBottomRowData()` | - | Get current bottom pinned rows |

### Row Node Properties

| Property | Type | Description |
|----------|------|-------------|
| `rowPinned` | 'top' \| 'bottom' \| null | Pinned position of row |
| `rowIndex` | number | Index within pinned section |

## Common Patterns

### Summary Row Pattern

```typescript
export class SummaryRowPattern {
  private calculateSummaryData(): any {
    let totalRevenue = 0;
    let totalQuantity = 0;
    const categories = new Set();

    this.gridApi.forEachNode((node) => {
      if (!node.rowPinned) {
        totalRevenue += node.data.revenue || 0;
        totalQuantity += node.data.quantity || 0;
        categories.add(node.data.category);
      }
    });

    return {
      id: 'summary',
      name: 'SUMMARY',
      category: `${categories.size} categories`,
      revenue: totalRevenue,
      quantity: totalQuantity,
      average: totalRevenue / totalQuantity,
      rowType: 'summary'
    };
  }

  updateSummary(): void {
    const summaryData = this.calculateSummaryData();
    this.gridApi.setPinnedBottomRowData([summaryData]);
  }

  onDataChanged(): void {
    this.updateSummary();
  }

  onCellValueChanged(): void {
    this.updateSummary();
  }
}
```

### Status Row Pattern

```typescript
export class StatusRowPattern {
  private createStatusRow(): any {
    const rowCount = this.gridApi.getDisplayedRowCount();
    const selectedCount = this.gridApi.getSelectedRows().length;
    const filterActive = this.gridApi.isAnyFilterPresent();
    
    return {
      id: 'status',
      status: `${rowCount} rows`,
      selection: selectedCount > 0 ? `${selectedCount} selected` : '',
      filter: filterActive ? 'Filtered' : 'All data',
      lastUpdate: new Date().toLocaleTimeString(),
      rowType: 'status'
    };
  }

  updateStatusRow(): void {
    const statusRow = this.createStatusRow();
    this.gridApi.setPinnedBottomRowData([statusRow]);
  }

  onSelectionChanged(): void {
    this.updateStatusRow();
  }

  onFilterChanged(): void {
    this.updateStatusRow();
  }
}
```

## Troubleshooting

### Common Issues

1. **Pinned rows not displaying**: Check if data array is properly formatted
2. **Styling not applying**: Ensure CSS selectors target pinned row classes correctly
3. **Performance issues**: Implement debouncing for frequent pinned row updates
4. **Scrolling problems**: Verify z-index values for pinned row positioning

### Debugging Pinned Rows

```typescript
export class PinnedRowDebugger {
  debugPinnedRows(): void {
    console.group('Pinned Rows Debug');
    
    const topRows = this.gridApi.getPinnedTopRowData();
    const bottomRows = this.gridApi.getPinnedBottomRowData();
    
    console.log('Top pinned rows:', topRows?.length || 0);
    topRows?.forEach((row, index) => {
      console.log(`  Top[${index}]:`, {
        id: row.id,
        type: row.rowType || 'unknown',
        keys: Object.keys(row)
      });
    });
    
    console.log('Bottom pinned rows:', bottomRows?.length || 0);
    bottomRows?.forEach((row, index) => {
      console.log(`  Bottom[${index}]:`, {
        id: row.id,
        type: row.rowType || 'unknown',
        keys: Object.keys(row)
      });
    });
    
    console.groupEnd();
  }

  validatePinnedRowData(): boolean {
    const issues: string[] = [];
    
    const topRows = this.gridApi.getPinnedTopRowData() || [];
    const bottomRows = this.gridApi.getPinnedBottomRowData() || [];
    
    // Check for duplicate IDs
    const allIds = [...topRows, ...bottomRows].map(row => row.id).filter(Boolean);
    const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      issues.push(`Duplicate pinned row IDs: ${duplicateIds.join(', ')}`);
    }
    
    // Check for required fields
    [...topRows, ...bottomRows].forEach((row, index) => {
      if (!row.id) {
        issues.push(`Pinned row at index ${index} missing ID`);
      }
    });
    
    if (issues.length > 0) {
      console.warn('Pinned row validation issues:', issues);
      return false;
    }
    
    return true;
  }
}
```

## Best Practices

1. **Use meaningful IDs** for pinned rows to enable proper tracking
2. **Keep pinned row count minimal** to avoid cluttering the interface
3. **Update pinned rows efficiently** using debouncing for frequent changes
4. **Provide clear visual distinction** between pinned and regular rows
5. **Handle responsive design** by adjusting pinned row content for different screen sizes
6. **Test scrolling behavior** to ensure pinned rows don't interfere with navigation
7. **Consider accessibility** with proper ARIA labels and keyboard navigation
8. **Document pinned row data structure** for team consistency