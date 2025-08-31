# Master-Detail

## Overview

Master-Detail provides the capability to show detailed information for each row in an expandable detail panel. This feature allows you to display hierarchical data, related records, or additional information without cluttering the main grid view.

## Use Cases

- Show order details for each order row
- Display employee information with expandable personal details
- Create hierarchical data views with child records
- Implement expandable product specifications
- Build nested data structures with related information

## Basic Master-Detail Setup

### Simple Detail Panel

```typescript
import { BlgGridComponent } from '@blg/grid';

@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [masterDetail]="true"
      [detailCellRendererParams]="detailCellRendererParams">
    </blg-grid>
  `
})
export class BasicMasterDetailComponent {
  masterDetail = true;

  detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { field: 'productName', headerName: 'Product' },
        { field: 'quantity', headerName: 'Quantity' },
        { field: 'price', headerName: 'Unit Price', valueFormatter: this.currencyFormatter },
        { field: 'total', headerName: 'Total', valueFormatter: this.currencyFormatter }
      ],
      defaultColDef: {
        flex: 1,
        minWidth: 100
      }
    },
    getDetailRowData: (params) => {
      // Return detail data for the expanded row
      params.successCallback(params.data.orderItems || []);
    }
  };

  columnDefs = [
    { 
      field: 'orderId', 
      headerName: 'Order ID',
      cellRenderer: 'agGroupCellRenderer'
    },
    { field: 'customerName', headerName: 'Customer' },
    { field: 'orderDate', headerName: 'Order Date' },
    { field: 'status', headerName: 'Status' },
    { 
      field: 'total', 
      headerName: 'Total',
      valueFormatter: this.currencyFormatter
    }
  ];

  rowData = [
    {
      orderId: 'ORD-001',
      customerName: 'John Smith',
      orderDate: '2024-01-15',
      status: 'Shipped',
      total: 450.00,
      orderItems: [
        { productName: 'Laptop Pro', quantity: 1, price: 350.00, total: 350.00 },
        { productName: 'Wireless Mouse', quantity: 2, price: 50.00, total: 100.00 }
      ]
    },
    {
      orderId: 'ORD-002',
      customerName: 'Jane Doe',
      orderDate: '2024-01-16',
      status: 'Processing',
      total: 299.99,
      orderItems: [
        { productName: 'Office Chair', quantity: 1, price: 299.99, total: 299.99 }
      ]
    }
  ];

  private currencyFormatter = (params: any): string => {
    return params.value ? `$${params.value.toFixed(2)}` : '$0.00';
  };
}
```

### Custom Detail Template

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [masterDetail]="true"
      [detailCellRenderer]="'customDetailRenderer'"
      [frameworkComponents]="frameworkComponents">
    </blg-grid>
  `
})
export class CustomDetailTemplateComponent {
  frameworkComponents = {
    customDetailRenderer: CustomDetailRendererComponent
  };

  columnDefs = [
    { 
      field: 'employeeId',
      headerName: 'Employee ID',
      cellRenderer: 'agGroupCellRenderer'
    },
    { field: 'name', headerName: 'Name' },
    { field: 'department', headerName: 'Department' },
    { field: 'role', headerName: 'Role' },
    { field: 'status', headerName: 'Status' }
  ];

  rowData = [
    {
      employeeId: 'EMP-001',
      name: 'John Doe',
      department: 'Engineering',
      role: 'Senior Developer',
      status: 'Active',
      details: {
        personalInfo: {
          email: 'john.doe@company.com',
          phone: '+1-555-0123',
          address: '123 Main St, City, State 12345',
          birthDate: '1990-05-15'
        },
        employment: {
          hireDate: '2020-03-01',
          salary: 95000,
          manager: 'Sarah Wilson',
          office: 'Building A, Floor 3'
        },
        skills: ['JavaScript', 'TypeScript', 'Angular', 'Node.js', 'Python'],
        projects: [
          { name: 'Project Alpha', role: 'Lead Developer', status: 'Active' },
          { name: 'Project Beta', role: 'Contributor', status: 'Completed' }
        ]
      }
    }
  ];
}

@Component({
  selector: 'app-custom-detail-renderer',
  template: `
    <div class="detail-panel" *ngIf="data">
      <div class="detail-header">
        <h4>Employee Details: {{ data.name }}</h4>
        <div class="detail-actions">
          <button class="detail-btn" (click)="editEmployee()">Edit</button>
          <button class="detail-btn" (click)="viewHistory()">History</button>
          <button class="detail-btn" (click)="exportDetails()">Export</button>
        </div>
      </div>
      
      <div class="detail-content">
        <div class="detail-section">
          <h5>Personal Information</h5>
          <div class="info-grid">
            <div class="info-item">
              <label>Email:</label>
              <span>{{ data.details.personalInfo.email }}</span>
            </div>
            <div class="info-item">
              <label>Phone:</label>
              <span>{{ data.details.personalInfo.phone }}</span>
            </div>
            <div class="info-item">
              <label>Address:</label>
              <span>{{ data.details.personalInfo.address }}</span>
            </div>
            <div class="info-item">
              <label>Birth Date:</label>
              <span>{{ data.details.personalInfo.birthDate | date }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h5>Employment Information</h5>
          <div class="info-grid">
            <div class="info-item">
              <label>Hire Date:</label>
              <span>{{ data.details.employment.hireDate | date }}</span>
            </div>
            <div class="info-item">
              <label>Salary:</label>
              <span>{{ data.details.employment.salary | currency }}</span>
            </div>
            <div class="info-item">
              <label>Manager:</label>
              <span>{{ data.details.employment.manager }}</span>
            </div>
            <div class="info-item">
              <label>Office:</label>
              <span>{{ data.details.employment.office }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h5>Skills</h5>
          <div class="skills-container">
            <span 
              *ngFor="let skill of data.details.skills"
              class="skill-tag">
              {{ skill }}
            </span>
          </div>
        </div>
        
        <div class="detail-section">
          <h5>Current Projects</h5>
          <div class="projects-table">
            <div class="projects-header">
              <span>Project Name</span>
              <span>Role</span>
              <span>Status</span>
            </div>
            <div 
              *ngFor="let project of data.details.projects"
              class="project-row">
              <span>{{ project.name }}</span>
              <span>{{ project.role }}</span>
              <span class="status-badge" [ngClass]="'status-' + project.status.toLowerCase()">
                {{ project.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-panel {
      padding: 20px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      margin: 10px;
    }
    
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #007bff;
    }
    
    .detail-header h4 {
      margin: 0;
      color: #333;
    }
    
    .detail-actions {
      display: flex;
      gap: 8px;
    }
    
    .detail-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .detail-btn:hover {
      background: #0056b3;
    }
    
    .detail-content {
      display: grid;
      gap: 20px;
    }
    
    .detail-section h5 {
      margin: 0 0 10px 0;
      color: #495057;
      font-weight: 600;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
    }
    
    .info-item label {
      font-weight: 500;
      color: #6c757d;
      min-width: 80px;
      margin-right: 8px;
    }
    
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .skill-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .projects-table {
      border: 1px solid #dee2e6;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .projects-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      background: #e9ecef;
      padding: 8px 12px;
      font-weight: 600;
      color: #495057;
    }
    
    .project-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      padding: 8px 12px;
      border-top: 1px solid #dee2e6;
      align-items: center;
    }
    
    .status-badge {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
      text-align: center;
    }
    
    .status-active {
      background: #d4edda;
      color: #155724;
    }
    
    .status-completed {
      background: #cce5ff;
      color: #004085;
    }
  `]
})
export class CustomDetailRendererComponent implements ICellRendererAngularComp {
  data: any;
  private params: any;

  agInit(params: any): void {
    this.params = params;
    this.data = params.node.data;
  }

  refresh(params: any): boolean {
    return false;
  }

  editEmployee(): void {
    console.log('Edit employee:', this.data.employeeId);
    // Implementation for edit functionality
  }

  viewHistory(): void {
    console.log('View history for:', this.data.employeeId);
    // Implementation for history view
  }

  exportDetails(): void {
    console.log('Export details for:', this.data.employeeId);
    // Implementation for export functionality
  }
}
```

## Advanced Master-Detail Features

### Nested Grid in Detail

```typescript
export class NestedGridDetailComponent {
  detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { field: 'itemId', headerName: 'Item ID', width: 100 },
        { field: 'description', headerName: 'Description', flex: 2 },
        { field: 'quantity', headerName: 'Qty', width: 80 },
        { field: 'unitPrice', headerName: 'Unit Price', width: 120, valueFormatter: this.currencyFormatter },
        { field: 'discount', headerName: 'Discount %', width: 100 },
        { field: 'total', headerName: 'Total', width: 120, valueFormatter: this.currencyFormatter }
      ],
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true
      },
      // Enable features in detail grid
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5,
      suppressRowClickSelection: true,
      
      // Detail grid can have its own master-detail
      masterDetail: true,
      detailCellRenderer: 'itemDetailRenderer'
    },
    getDetailRowData: (params) => {
      // Simulate async data loading
      setTimeout(() => {
        const detailData = this.getOrderItems(params.data.orderId);
        params.successCallback(detailData);
      }, 100);
    },
    template: (params) => {
      return `
        <div style="padding: 20px; background: #f5f5f5;">
          <h4 style="margin: 0 0 10px 0;">Order Details: ${params.data.orderId}</h4>
          <div style="background: white; border-radius: 4px;">
            <div class="ag-theme-alpine" style="height: 300px;"></div>
          </div>
        </div>
      `;
    }
  };

  private getOrderItems(orderId: string): any[] {
    // Simulate fetching order items from API
    const orderItems = {
      'ORD-001': [
        { itemId: 'ITEM-001', description: 'MacBook Pro 16"', quantity: 1, unitPrice: 2499, discount: 5, total: 2374.05 },
        { itemId: 'ITEM-002', description: 'Magic Mouse', quantity: 1, unitPrice: 79, discount: 0, total: 79 },
        { itemId: 'ITEM-003', description: 'USB-C Cable', quantity: 2, unitPrice: 29, discount: 10, total: 52.20 }
      ],
      'ORD-002': [
        { itemId: 'ITEM-004', description: 'iPad Air', quantity: 1, unitPrice: 599, discount: 0, total: 599 },
        { itemId: 'ITEM-005', description: 'Smart Keyboard', quantity: 1, unitPrice: 179, discount: 0, total: 179 }
      ]
    };

    return orderItems[orderId] || [];
  }

  // Nested detail renderer for individual items
  frameworkComponents = {
    itemDetailRenderer: ItemDetailRendererComponent
  };
}

@Component({
  selector: 'app-item-detail-renderer',
  template: `
    <div class="item-detail-panel">
      <h6>Item Specifications</h6>
      <div class="spec-grid">
        <div class="spec-item">
          <label>SKU:</label>
          <span>{{ itemData.sku }}</span>
        </div>
        <div class="spec-item">
          <label>Weight:</label>
          <span>{{ itemData.weight }}</span>
        </div>
        <div class="spec-item">
          <label>Dimensions:</label>
          <span>{{ itemData.dimensions }}</span>
        </div>
        <div class="spec-item">
          <label>Warranty:</label>
          <span>{{ itemData.warranty }}</span>
        </div>
      </div>
      
      <div class="item-actions">
        <button class="action-btn" (click)="viewItemDetails()">View Details</button>
        <button class="action-btn" (click)="trackShipment()">Track Shipment</button>
      </div>
    </div>
  `,
  styles: [`
    .item-detail-panel {
      padding: 15px;
      background: #fafafa;
      border-radius: 4px;
      margin: 5px;
    }
    
    .spec-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin: 10px 0;
    }
    
    .spec-item {
      display: flex;
      align-items: center;
    }
    
    .spec-item label {
      font-weight: 500;
      color: #666;
      min-width: 80px;
      margin-right: 8px;
    }
    
    .item-actions {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }
    
    .action-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    }
  `]
})
export class ItemDetailRendererComponent implements ICellRendererAngularComp {
  itemData: any;

  agInit(params: any): void {
    this.itemData = {
      sku: `SKU-${params.data.itemId}`,
      weight: '2.5 lbs',
      dimensions: '12" x 8" x 2"',
      warranty: '1 Year Limited'
    };
  }

  refresh(params: any): boolean {
    return false;
  }

  viewItemDetails(): void {
    console.log('View item details');
  }

  trackShipment(): void {
    console.log('Track shipment');
  }
}
```

### Dynamic Detail Loading

```typescript
export class DynamicDetailLoadingComponent {
  detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'value', headerName: 'Value', width: 120 },
        { field: 'status', headerName: 'Status', width: 100 }
      ],
      loadingOverlayComponent: 'customLoadingOverlay',
      noRowsOverlayComponent: 'customNoRowsOverlay'
    },
    getDetailRowData: async (params) => {
      try {
        // Show loading state
        params.api.showLoadingOverlay();
        
        // Simulate async data loading with different response times
        const detailData = await this.loadDetailData(params.data.id);
        
        if (detailData.length === 0) {
          params.api.showNoRowsOverlay();
        } else {
          params.successCallback(detailData);
        }
      } catch (error) {
        console.error('Failed to load detail data:', error);
        params.failCallback();
        params.api.showNoRowsOverlay();
      }
    },
    
    // Custom refresh function
    refreshDetailData: (params) => {
      this.refreshDetailGrid(params);
    }
  };

  private async loadDetailData(parentId: string): Promise<any[]> {
    // Simulate API call with random delay
    const delay = Math.random() * 2000 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate different response scenarios
    const scenarios = {
      'empty': [],
      'error': null,
      'normal': [
        { id: 1, name: `Detail Item 1 for ${parentId}`, value: 100, status: 'Active' },
        { id: 2, name: `Detail Item 2 for ${parentId}`, value: 200, status: 'Pending' }
      ]
    };
    
    // Randomly select scenario (mostly normal)
    const rand = Math.random();
    if (rand < 0.1) return scenarios.empty;
    if (rand < 0.15) throw new Error('Simulated API error');
    return scenarios.normal;
  }

  private async refreshDetailGrid(params: any): Promise<void> {
    try {
      params.api.showLoadingOverlay();
      const freshData = await this.loadDetailData(params.data.id);
      params.api.setRowData(freshData);
    } catch (error) {
      console.error('Failed to refresh detail data:', error);
      params.api.showNoRowsOverlay();
    }
  }

  frameworkComponents = {
    customLoadingOverlay: CustomLoadingOverlayComponent,
    customNoRowsOverlay: CustomNoRowsOverlayComponent
  };
}

@Component({
  selector: 'app-custom-loading-overlay',
  template: `
    <div class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading detail data...</div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
    }
    
    .loading-spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-text {
      color: #666;
      font-size: 14px;
    }
  `]
})
export class CustomLoadingOverlayComponent implements ILoadingOverlayAngularComp {
  agInit(params: any): void {}
}

@Component({
  selector: 'app-custom-no-rows-overlay',
  template: `
    <div class="no-rows-overlay">
      <div class="no-rows-icon">📭</div>
      <div class="no-rows-message">No detail data available</div>
      <button class="retry-btn" (click)="retryLoad()">Retry</button>
    </div>
  `,
  styles: [`
    .no-rows-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: rgba(248, 249, 250, 0.9);
    }
    
    .no-rows-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    
    .no-rows-message {
      color: #6c757d;
      font-size: 14px;
      margin-bottom: 15px;
    }
    
    .retry-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class CustomNoRowsOverlayComponent implements INoRowsOverlayAngularComp {
  private params: any;

  agInit(params: any): void {
    this.params = params;
  }

  retryLoad(): void {
    // Trigger retry logic
    this.params.context?.refreshDetailData?.(this.params);
  }
}
```

## Detail Row State Management

### Expand/Collapse Control

```typescript
export class DetailRowStateComponent {
  private expandedRows = new Set<string>();

  onMasterGridReady(params: any): void {
    this.masterGridApi = params.api;
  }

  // Expand specific row
  expandRow(rowId: string): void {
    const rowNode = this.masterGridApi.getRowNode(rowId);
    if (rowNode && !rowNode.expanded) {
      rowNode.setExpanded(true);
      this.expandedRows.add(rowId);
    }
  }

  // Collapse specific row
  collapseRow(rowId: string): void {
    const rowNode = this.masterGridApi.getRowNode(rowId);
    if (rowNode && rowNode.expanded) {
      rowNode.setExpanded(false);
      this.expandedRows.delete(rowId);
    }
  }

  // Expand all rows
  expandAllRows(): void {
    this.masterGridApi.forEachNode(node => {
      if (!node.expanded) {
        node.setExpanded(true);
        this.expandedRows.add(node.id);
      }
    });
  }

  // Collapse all rows
  collapseAllRows(): void {
    this.masterGridApi.forEachNode(node => {
      if (node.expanded) {
        node.setExpanded(false);
      }
    });
    this.expandedRows.clear();
  }

  // Toggle row expansion
  toggleRowExpansion(rowId: string): void {
    const rowNode = this.masterGridApi.getRowNode(rowId);
    if (rowNode) {
      const newExpandedState = !rowNode.expanded;
      rowNode.setExpanded(newExpandedState);
      
      if (newExpandedState) {
        this.expandedRows.add(rowId);
      } else {
        this.expandedRows.delete(rowId);
      }
    }
  }

  // Save expanded state
  saveExpandedState(): void {
    const expandedIds = Array.from(this.expandedRows);
    localStorage.setItem('expandedDetailRows', JSON.stringify(expandedIds));
  }

  // Restore expanded state
  restoreExpandedState(): void {
    const saved = localStorage.getItem('expandedDetailRows');
    if (saved) {
      try {
        const expandedIds = JSON.parse(saved);
        expandedIds.forEach((id: string) => {
          this.expandRow(id);
        });
      } catch (error) {
        console.error('Failed to restore expanded state:', error);
      }
    }
  }

  // Event handlers
  onRowExpanded(event: any): void {
    console.log('Row expanded:', event.node.data);
    this.expandedRows.add(event.node.id);
    this.saveExpandedState();
  }

  onRowCollapsed(event: any): void {
    console.log('Row collapsed:', event.node.data);
    this.expandedRows.delete(event.node.id);
    this.saveExpandedState();
  }
}
```

### Detail Grid Communication

```typescript
export class DetailGridCommunicationComponent {
  detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: this.detailColumnDefs,
      onCellValueChanged: this.onDetailCellValueChanged.bind(this),
      onSelectionChanged: this.onDetailSelectionChanged.bind(this),
      context: {
        parentComponent: this
      }
    },
    getDetailRowData: (params) => {
      params.successCallback(this.getDetailData(params.data.id));
    }
  };

  onDetailCellValueChanged(event: any): void {
    console.log('Detail cell changed:', event);
    
    // Update master row if needed
    const masterRowNode = this.findMasterRowNode(event);
    if (masterRowNode) {
      this.updateMasterRowFromDetail(masterRowNode, event);
    }
  }

  onDetailSelectionChanged(event: any): void {
    const selectedRows = event.api.getSelectedRows();
    console.log('Detail rows selected:', selectedRows.length);
    
    // Update master row selection state
    const masterRowNode = this.findMasterRowNode(event);
    if (masterRowNode) {
      this.updateMasterSelectionState(masterRowNode, selectedRows);
    }
  }

  private findMasterRowNode(detailEvent: any): any {
    // Find the master row that contains this detail grid
    let currentNode = detailEvent.node;
    while (currentNode && !currentNode.master) {
      currentNode = currentNode.parent;
    }
    return currentNode;
  }

  private updateMasterRowFromDetail(masterRowNode: any, detailEvent: any): void {
    // Recalculate master row totals based on detail changes
    const detailRows = this.getDetailData(masterRowNode.data.id);
    const newTotal = detailRows.reduce((sum, row) => sum + (row.total || 0), 0);
    
    masterRowNode.setDataValue('total', newTotal);
  }

  private updateMasterSelectionState(masterRowNode: any, selectedDetailRows: any[]): void {
    // Update master row to reflect detail selection
    masterRowNode.data.selectedDetailCount = selectedDetailRows.length;
    this.masterGridApi.refreshCells({ rowNodes: [masterRowNode] });
  }

  // Method to refresh detail grids
  refreshAllDetailGrids(): void {
    this.masterGridApi.forEachNode(node => {
      if (node.expanded && node.detailNode) {
        const detailGridApi = node.detailNode.detailGridInfo?.api;
        if (detailGridApi) {
          detailGridApi.refreshInfiniteCache();
        }
      }
    });
  }

  // Method to get data from specific detail grid
  getDetailGridData(masterRowId: string): any[] {
    const masterRowNode = this.masterGridApi.getRowNode(masterRowId);
    if (masterRowNode?.expanded && masterRowNode.detailNode) {
      const detailGridApi = masterRowNode.detailNode.detailGridInfo?.api;
      if (detailGridApi) {
        const detailData: any[] = [];
        detailGridApi.forEachNode(node => detailData.push(node.data));
        return detailData;
      }
    }
    return [];
  }

  // Method to update detail grid data
  updateDetailGridData(masterRowId: string, newData: any[]): void {
    const masterRowNode = this.masterGridApi.getRowNode(masterRowId);
    if (masterRowNode?.expanded && masterRowNode.detailNode) {
      const detailGridApi = masterRowNode.detailNode.detailGridInfo?.api;
      if (detailGridApi) {
        detailGridApi.setRowData(newData);
      }
    }
  }
}
```

## Performance Optimization

### Lazy Loading and Virtualization

```typescript
export class OptimizedMasterDetailComponent {
  private detailDataCache = new Map<string, any[]>();
  private loadingStates = new Map<string, boolean>();

  detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: this.detailColumnDefs,
      
      // Enable virtualization for large detail datasets
      rowBuffer: 10,
      suppressColumnVirtualisation: false,
      
      // Lazy loading configuration
      rowModelType: 'infinite',
      cacheBlockSize: 100,
      cacheOverflowSize: 2,
      maxConcurrentDatasourceRequests: 2,
      infiniteInitialRowCount: 1000,
      maxBlocksInCache: 10
    },
    
    getDetailRowData: (params) => {
      this.loadDetailDataLazily(params);
    },
    
    // Template with loading state
    template: (params) => {
      const isLoading = this.loadingStates.get(params.data.id);
      return `
        <div style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0;">Details for ${params.data.name}</h4>
            ${isLoading ? '<div class="loading-spinner">Loading...</div>' : ''}
          </div>
          <div class="ag-theme-alpine" style="height: 300px;"></div>
        </div>
      `;
    }
  };

  private async loadDetailDataLazily(params: any): Promise<void> {
    const masterRowId = params.data.id;
    
    // Check cache first
    if (this.detailDataCache.has(masterRowId)) {
      const cachedData = this.detailDataCache.get(masterRowId);
      params.successCallback(cachedData);
      return;
    }

    // Set loading state
    this.loadingStates.set(masterRowId, true);
    
    try {
      // Simulate API call
      const detailData = await this.fetchDetailDataFromAPI(masterRowId);
      
      // Cache the result
      this.detailDataCache.set(masterRowId, detailData);
      
      // Provide data to grid
      params.successCallback(detailData);
    } catch (error) {
      console.error('Failed to load detail data:', error);
      params.failCallback();
    } finally {
      // Clear loading state
      this.loadingStates.set(masterRowId, false);
    }
  }

  private async fetchDetailDataFromAPI(masterRowId: string): Promise<any[]> {
    // Simulate API call with pagination
    const response = await this.http.get(`/api/details/${masterRowId}`, {
      params: {
        page: 1,
        pageSize: 100
      }
    }).toPromise();
    
    return response.data;
  }

  // Memory management
  onRowCollapsed(event: any): void {
    const masterRowId = event.node.data.id;
    
    // Clear cache for collapsed row to free memory
    if (this.detailDataCache.has(masterRowId)) {
      this.detailDataCache.delete(masterRowId);
    }
    
    // Clear loading state
    this.loadingStates.delete(masterRowId);
  }

  // Cleanup on component destroy
  ngOnDestroy(): void {
    this.detailDataCache.clear();
    this.loadingStates.clear();
  }
}
```

## API Reference

### Grid Options

| Option | Type | Description |
|--------|------|-------------|
| `masterDetail` | boolean | Enable master-detail functionality |
| `detailCellRenderer` | string \| Component | Detail panel renderer |
| `detailCellRendererParams` | object | Parameters for detail renderer |
| `detailRowHeight` | number \| function | Height of detail rows |
| `detailRowAutoHeight` | boolean | Auto-size detail row height |

### Detail Cell Renderer Params

| Option | Type | Description |
|--------|------|-------------|
| `detailGridOptions` | GridOptions | Options for detail grid |
| `getDetailRowData` | function | Function to provide detail data |
| `template` | function | Custom template function |
| `refreshDetailData` | function | Function to refresh detail data |

### API Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `expandAll()` | - | Expand all master rows |
| `collapseAll()` | - | Collapse all master rows |
| `getDetailGridInfo()` | `rowId: string` | Get detail grid info for row |
| `forEachDetailGrid()` | `callback: function` | Iterate over detail grids |

### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `rowExpanded` | Master row expanded | RowExpandedEvent |
| `rowCollapsed` | Master row collapsed | RowCollapsedEvent |

## Common Patterns

### Order-Items Pattern

```typescript
export class OrderItemsPattern {
  detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { field: 'sku', headerName: 'SKU', width: 120 },
        { field: 'product', headerName: 'Product', flex: 1 },
        { field: 'quantity', headerName: 'Qty', width: 80, editable: true },
        { field: 'price', headerName: 'Price', width: 100, valueFormatter: this.currencyFormatter },
        { field: 'total', headerName: 'Total', width: 100, valueGetter: this.totalValueGetter }
      ],
      onCellValueChanged: this.onItemChanged.bind(this)
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.items || []);
    }
  };

  private totalValueGetter = (params: any): number => {
    return params.data.quantity * params.data.price;
  };

  private onItemChanged(event: any): void {
    // Recalculate order total when item changes
    this.updateOrderTotal(event);
  }
}
```

### Employee-Projects Pattern

```typescript
export class EmployeeProjectsPattern {
  detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { field: 'projectName', headerName: 'Project', flex: 1 },
        { field: 'role', headerName: 'Role', width: 150 },
        { field: 'allocation', headerName: 'Allocation %', width: 120 },
        { field: 'startDate', headerName: 'Start Date', width: 120 },
        { field: 'status', headerName: 'Status', width: 100, cellRenderer: 'statusRenderer' }
      ]
    },
    getDetailRowData: (params) => {
      const projects = this.getEmployeeProjects(params.data.employeeId);
      params.successCallback(projects);
    }
  };

  private getEmployeeProjects(employeeId: string): any[] {
    return this.projectService.getProjectsByEmployee(employeeId);
  }
}
```

## Troubleshooting

### Common Issues

1. **Detail grids not loading**: Check `getDetailRowData` callback implementation
2. **Performance issues**: Implement lazy loading and data caching
3. **Height issues**: Configure `detailRowHeight` or `detailRowAutoHeight`
4. **Data not updating**: Ensure proper event handling between master and detail

### Debugging

```typescript
export class MasterDetailDebugger {
  debugMasterDetailState(): void {
    console.group('Master-Detail Debug');
    
    let expandedCount = 0;
    let detailGridCount = 0;
    
    this.masterGridApi.forEachNode(node => {
      if (node.expanded) {
        expandedCount++;
        
        if (node.detailNode) {
          detailGridCount++;
          const detailApi = node.detailNode.detailGridInfo?.api;
          
          if (detailApi) {
            const detailRowCount = detailApi.getDisplayedRowCount();
            console.log(`Detail grid for ${node.data.id}: ${detailRowCount} rows`);
          }
        }
      }
    });
    
    console.log(`Expanded rows: ${expandedCount}, Detail grids: ${detailGridCount}`);
    console.groupEnd();
  }
}
```

## Best Practices

1. **Implement lazy loading** for detail data to improve performance
2. **Cache detail data** appropriately to reduce API calls
3. **Use appropriate detail row heights** to optimize rendering
4. **Handle loading and error states** gracefully in detail panels
5. **Clean up resources** when detail rows are collapsed
6. **Consider virtualization** for large detail datasets
7. **Provide clear visual hierarchy** between master and detail data
8. **Test with realistic data volumes** to ensure performance