# Common Patterns and Recipes

This guide covers common implementation patterns, best practices, and reusable solutions for the BLG Grid.

## Master-Detail Pattern

### Basic Master-Detail Implementation

```typescript
@Component({
  selector: 'app-master-detail',
  template: `
    <div class="master-detail-layout">
      <!-- Master Grid -->
      <div class="master-panel">
        <h2>Orders</h2>
        <blg-grid 
          [data]="orders"
          [columns]="masterColumns"
          [config]="masterConfig"
          (rowSelect)="onMasterRowSelect($event)">
        </blg-grid>
      </div>
      
      <!-- Detail Panel -->
      <div class="detail-panel" *ngIf="selectedOrder">
        <h2>Order Details - #{{ selectedOrder.id }}</h2>
        
        <!-- Order Info -->
        <div class="order-info">
          <p><strong>Customer:</strong> {{ selectedOrder.customerName }}</p>
          <p><strong>Date:</strong> {{ selectedOrder.orderDate | date }}</p>
          <p><strong>Status:</strong> {{ selectedOrder.status }}</p>
        </div>
        
        <!-- Order Items Grid -->
        <h3>Order Items</h3>
        <blg-grid 
          [data]="orderItems"
          [columns]="detailColumns"
          [config]="detailConfig">
        </blg-grid>
      </div>
    </div>
  `,
  styles: [`
    .master-detail-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      height: 100vh;
    }
    
    .master-panel, .detail-panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .order-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    
    @media (max-width: 768px) {
      .master-detail-layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
      }
    }
  `]
})
export class MasterDetailComponent {
  orders: Order[] = [];
  orderItems: OrderItem[] = [];
  selectedOrder: Order | null = null;
  
  masterColumns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'Order ID', type: 'number', width: 100 },
    { id: 'customerName', field: 'customerName', header: 'Customer', type: 'string' },
    { id: 'orderDate', field: 'orderDate', header: 'Date', type: 'date' },
    { id: 'total', field: 'total', header: 'Total', type: 'number', cellRenderer: '${{{value}}}' },
    { id: 'status', field: 'status', header: 'Status', type: 'string' }
  ];
  
  detailColumns: ColumnDefinition[] = [
    { id: 'productName', field: 'productName', header: 'Product', type: 'string' },
    { id: 'quantity', field: 'quantity', header: 'Qty', type: 'number', width: 80 },
    { id: 'price', field: 'price', header: 'Price', type: 'number', cellRenderer: '${{{value}}}' },
    { id: 'total', field: 'total', header: 'Total', type: 'number', cellRenderer: '${{{value}}}' }
  ];
  
  masterConfig: GridConfig = {
    selectable: true,
    selectionMode: 'single',
    sortable: true,
    filterable: true,
    rowHeight: 45
  };
  
  detailConfig: GridConfig = {
    sortable: true,
    selectable: false,
    rowHeight: 40
  };
  
  constructor(private orderService: OrderService) {}
  
  ngOnInit() {
    this.loadOrders();
  }
  
  async onMasterRowSelect(event: RowSelectEvent) {
    if (event.data.selected) {
      this.selectedOrder = event.data.rowData;
      await this.loadOrderItems(this.selectedOrder.id);
    } else {
      this.selectedOrder = null;
      this.orderItems = [];
    }
  }
  
  private async loadOrders() {
    this.orders = await this.orderService.getOrders();
  }
  
  private async loadOrderItems(orderId: number) {
    this.orderItems = await this.orderService.getOrderItems(orderId);
  }
}
```

## CRUD Operations Pattern

### Complete CRUD Grid Implementation

```typescript
@Component({
  selector: 'app-crud-grid',
  template: `
    <div class="crud-container">
      <!-- Toolbar -->
      <div class="toolbar">
        <button 
          class="btn btn-primary" 
          (click)="addNew()"
          [disabled]="isEditing">
          <i class="icon-plus"></i> Add New
        </button>
        
        <button 
          class="btn btn-secondary" 
          (click)="editSelected()"
          [disabled]="!canEdit()">
          <i class="icon-edit"></i> Edit
        </button>
        
        <button 
          class="btn btn-danger" 
          (click)="deleteSelected()"
          [disabled]="!canDelete()">
          <i class="icon-trash"></i> Delete
        </button>
        
        <button 
          class="btn btn-success" 
          (click)="saveChanges()"
          [disabled]="!hasChanges"
          *ngIf="isEditing">
          <i class="icon-save"></i> Save
        </button>
        
        <button 
          class="btn btn-secondary" 
          (click)="cancelChanges()"
          *ngIf="isEditing">
          <i class="icon-cancel"></i> Cancel
        </button>
        
        <div class="toolbar-info">
          <span *ngIf="selectedRows.size > 0">
            {{ selectedRows.size }} selected
          </span>
          <span *ngIf="hasChanges" class="changes-indicator">
            {{ pendingChanges.size }} unsaved changes
          </span>
        </div>
      </div>
      
      <!-- Grid -->
      <blg-grid 
        [data]="data"
        [columns]="columns"
        [config]="config"
        (rowSelect)="onRowSelect($event)"
        (cellEdit)="onCellEdit($event)"
        (gridEvent)="onGridEvent($event)">
      </blg-grid>
      
      <!-- Status Bar -->
      <div class="status-bar">
        <span>Total: {{ data.length }} records</span>
        <span *ngIf="loading">Loading...</span>
        <span *ngIf="lastSaved">Last saved: {{ lastSaved | date:'short' }}</span>
      </div>
    </div>
    
    <!-- Confirmation Dialogs -->
    <div class="modal" *ngIf="showDeleteConfirm">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete {{ selectedRows.size }} record(s)?</p>
        <div class="modal-actions">
          <button class="btn btn-danger" (click)="confirmDelete()">Delete</button>
          <button class="btn btn-secondary" (click)="cancelDelete()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .crud-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .toolbar {
      display: flex;
      gap: 10px;
      padding: 15px;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      align-items: center;
    }
    
    .toolbar-info {
      margin-left: auto;
      display: flex;
      gap: 15px;
      font-size: 14px;
    }
    
    .changes-indicator {
      color: #dc3545;
      font-weight: bold;
    }
    
    .status-bar {
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      font-size: 12px;
      color: #6c757d;
    }
    
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 4px;
      max-width: 400px;
      width: 100%;
    }
    
    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
  `]
})
export class CrudGridComponent implements OnInit {
  @ViewChild(Grid) grid!: Grid;
  
  data: Employee[] = [];
  selectedRows = new Set<number>();
  isEditing = false;
  hasChanges = false;
  loading = false;
  lastSaved: Date | null = null;
  showDeleteConfirm = false;
  
  // Track pending changes
  pendingChanges = new Map<number, Partial<Employee>>();
  originalData = new Map<number, Employee>();
  
  columns: ColumnDefinition[] = [
    {
      id: 'id',
      field: 'id',
      header: 'ID',
      type: 'number',
      width: 80,
      cellEditor: false, // ID not editable
      pinned: 'left'
    },
    {
      id: 'firstName',
      field: 'firstName',
      header: 'First Name',
      type: 'string',
      cellEditor: true,
      sortable: true,
      filterable: true
    },
    {
      id: 'lastName',
      field: 'lastName',
      header: 'Last Name',
      type: 'string',
      cellEditor: true,
      sortable: true,
      filterable: true
    },
    {
      id: 'email',
      field: 'email',
      header: 'Email',
      type: 'string',
      cellEditor: true,
      cellRenderer: '<a href="mailto:{{value}}">{{value}}</a>'
    },
    {
      id: 'department',
      field: 'department',
      header: 'Department',
      type: 'string',
      cellEditor: 'select', // Dropdown editor
      cellEditorOptions: ['Engineering', 'Sales', 'Marketing', 'HR']
    },
    {
      id: 'salary',
      field: 'salary',
      header: 'Salary',
      type: 'number',
      cellEditor: true,
      cellRenderer: '${{{value | number}}}'
    },
    {
      id: 'actions',
      field: 'id',
      header: 'Actions',
      sortable: false,
      filterable: false,
      cellEditor: false,
      width: 120,
      cellRenderer: `
        <button onclick="editRow({{value}})" class="btn-sm">Edit</button>
        <button onclick="deleteRow({{value}})" class="btn-sm btn-danger">Delete</button>
      `
    }
  ];
  
  config: GridConfig = {
    selectable: true,
    selectionMode: 'multiple',
    sortable: true,
    filterable: true,
    // Enable inline editing
    cellEditing: true,
    // Auto-save after 2 seconds
    autoSave: true,
    autoSaveDelay: 2000
  };
  
  constructor(
    private employeeService: EmployeeService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit() {
    this.loadData();
  }
  
  // Data loading
  async loadData() {
    this.loading = true;
    try {
      this.data = await this.employeeService.getEmployees();
    } catch (error) {
      this.notificationService.error('Failed to load data');
    } finally {
      this.loading = false;
    }
  }
  
  // CRUD Operations
  addNew() {
    const newEmployee: Employee = {
      id: 0, // Will be assigned by server
      firstName: '',
      lastName: '',
      email: '',
      department: 'Engineering',
      salary: 50000,
      isActive: true
    };
    
    // Add to beginning of array
    this.data = [newEmployee, ...this.data];
    this.isEditing = true;
    
    // Start editing the new row
    setTimeout(() => {
      this.grid.startEdit(0, 'firstName', '');
    });
  }
  
  editSelected() {
    if (this.selectedRows.size !== 1) return;
    
    const rowIndex = Array.from(this.selectedRows)[0];
    const employee = this.data[rowIndex];
    
    // Store original for cancel operation
    this.originalData.set(rowIndex, { ...employee });
    this.isEditing = true;
  }
  
  deleteSelected() {
    if (this.selectedRows.size === 0) return;
    this.showDeleteConfirm = true;
  }
  
  async confirmDelete() {
    const selectedIds = Array.from(this.selectedRows)
      .map(index => this.data[index].id)
      .filter(id => id > 0); // Exclude new unsaved records
    
    try {
      await this.employeeService.deleteEmployees(selectedIds);
      
      // Remove from local data
      this.data = this.data.filter((_, index) => !this.selectedRows.has(index));
      this.selectedRows.clear();
      this.showDeleteConfirm = false;
      
      this.notificationService.success(`Deleted ${selectedIds.length} records`);
      this.lastSaved = new Date();
    } catch (error) {
      this.notificationService.error('Failed to delete records');
    }
  }
  
  cancelDelete() {
    this.showDeleteConfirm = false;
  }
  
  // Save/Cancel Operations
  async saveChanges() {
    if (!this.hasChanges) return;
    
    this.loading = true;
    try {
      // Separate new records from updates
      const newRecords = this.data.filter(emp => emp.id === 0);
      const updatedRecords = Array.from(this.pendingChanges.entries())
        .map(([index, changes]) => ({ ...this.data[index], ...changes }))
        .filter(emp => emp.id > 0);
      
      // Save new records
      if (newRecords.length > 0) {
        const createdEmployees = await this.employeeService.createEmployees(newRecords);
        createdEmployees.forEach((emp, index) => {
          this.data[index] = emp; // Update with server-assigned IDs
        });
      }
      
      // Save updates
      if (updatedRecords.length > 0) {
        await this.employeeService.updateEmployees(updatedRecords);
      }
      
      // Clear pending changes
      this.pendingChanges.clear();
      this.originalData.clear();
      this.hasChanges = false;
      this.isEditing = false;
      this.lastSaved = new Date();
      
      this.notificationService.success('Changes saved successfully');
    } catch (error) {
      this.notificationService.error('Failed to save changes');
    } finally {
      this.loading = false;
    }
  }
  
  cancelChanges() {
    // Restore original data
    this.originalData.forEach((original, index) => {
      this.data[index] = { ...original };
    });
    
    // Remove new unsaved records
    this.data = this.data.filter(emp => emp.id > 0);
    
    this.pendingChanges.clear();
    this.originalData.clear();
    this.hasChanges = false;
    this.isEditing = false;
  }
  
  // Event Handlers
  onRowSelect(event: RowSelectEvent) {
    if (event.data.selected) {
      this.selectedRows.add(event.data.rowIndex);
    } else {
      this.selectedRows.delete(event.data.rowIndex);
    }
  }
  
  onCellEdit(event: CellEditEvent) {
    const { rowIndex, columnId, newValue, oldValue } = event.data;
    
    if (newValue !== oldValue) {
      // Track the change
      if (!this.pendingChanges.has(rowIndex)) {
        this.pendingChanges.set(rowIndex, {});
      }
      
      const changes = this.pendingChanges.get(rowIndex)!;
      changes[columnId as keyof Employee] = newValue;
      
      this.hasChanges = true;
      
      // Auto-save if enabled
      if (this.config.autoSave) {
        this.scheduleAutoSave();
      }
    }
  }
  
  onGridEvent(event: GridEventType) {
    // Handle other grid events
    console.log('Grid event:', event);
  }
  
  // Helper Methods
  canEdit(): boolean {
    return this.selectedRows.size === 1 && !this.isEditing;
  }
  
  canDelete(): boolean {
    return this.selectedRows.size > 0 && !this.isEditing;
  }
  
  private autoSaveTimeout: any;
  private scheduleAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      this.saveChanges();
    }, this.config.autoSaveDelay || 2000);
  }
  
  // Cleanup
  ngOnDestroy() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
  }
}

// Supporting interfaces
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  salary: number;
  isActive: boolean;
}
```

## Search and Filter Pattern

### Advanced Search Implementation

```typescript
@Component({
  selector: 'app-search-filter-grid',
  template: `
    <div class="search-container">
      <!-- Global Search -->
      <div class="global-search">
        <input 
          type="text" 
          placeholder="Search across all fields..."
          [(ngModel)]="globalSearchTerm"
          (input)="onGlobalSearch($event)"
          class="search-input">
        <button class="clear-search" (click)="clearGlobalSearch()" *ngIf="globalSearchTerm">
          ×
        </button>
      </div>
      
      <!-- Advanced Filters -->
      <div class="advanced-filters" [class.expanded]="showAdvancedFilters">
        <button class="toggle-filters" (click)="toggleAdvancedFilters()">
          {{ showAdvancedFilters ? 'Hide' : 'Show' }} Advanced Filters
        </button>
        
        <div class="filters-panel" *ngIf="showAdvancedFilters">
          <div class="filter-row">
            <label>Department:</label>
            <select [(ngModel)]="filters.department" (change)="applyFilters()">
              <option value="">All Departments</option>
              <option *ngFor="let dept of departments" [value]="dept">{{dept}}</option>
            </select>
          </div>
          
          <div class="filter-row">
            <label>Salary Range:</label>
            <input 
              type="number" 
              placeholder="Min"
              [(ngModel)]="filters.salaryMin"
              (input)="applyFilters()">
            <span>to</span>
            <input 
              type="number" 
              placeholder="Max"
              [(ngModel)]="filters.salaryMax"
              (input)="applyFilters()">
          </div>
          
          <div class="filter-row">
            <label>Status:</label>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="filters.activeOnly"
                (change)="applyFilters()">
              Active Only
            </label>
          </div>
          
          <div class="filter-actions">
            <button class="btn btn-primary" (click)="applyFilters()">Apply Filters</button>
            <button class="btn btn-secondary" (click)="clearFilters()">Clear All</button>
          </div>
        </div>
      </div>
      
      <!-- Active Filters Display -->
      <div class="active-filters" *ngIf="hasActiveFilters()">
        <span class="filter-label">Active Filters:</span>
        <div class="filter-tags">
          <span class="filter-tag" *ngIf="globalSearchTerm">
            Search: "{{ globalSearchTerm }}"
            <button (click)="clearGlobalSearch()">×</button>
          </span>
          <span class="filter-tag" *ngIf="filters.department">
            Department: {{ filters.department }}
            <button (click)="clearDepartmentFilter()">×</button>
          </span>
          <span class="filter-tag" *ngIf="filters.salaryMin || filters.salaryMax">
            Salary: {{ getSalaryRangeText() }}
            <button (click)="clearSalaryFilter()">×</button>
          </span>
          <span class="filter-tag" *ngIf="filters.activeOnly">
            Active Only
            <button (click)="filters.activeOnly = false; applyFilters()">×</button>
          </span>
        </div>
      </div>
      
      <!-- Results Summary -->
      <div class="results-summary">
        Showing {{ filteredData.length }} of {{ originalData.length }} records
        <span *ngIf="filteredData.length !== originalData.length">
          (filtered)
        </span>
      </div>
    </div>
    
    <blg-grid 
      [data]="filteredData"
      [columns]="columns"
      [config]="config">
    </blg-grid>
  `,
  styles: [`
    .search-container {
      padding: 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    
    .global-search {
      position: relative;
      margin-bottom: 15px;
    }
    
    .search-input {
      width: 100%;
      padding: 10px 40px 10px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .clear-search {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #6c757d;
    }
    
    .advanced-filters {
      margin-bottom: 15px;
    }
    
    .toggle-filters {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      text-decoration: underline;
    }
    
    .filters-panel {
      margin-top: 15px;
      padding: 15px;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }
    
    .filter-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .filter-row label {
      min-width: 100px;
      font-weight: 500;
    }
    
    .filter-row input, .filter-row select {
      padding: 5px 8px;
      border: 1px solid #ced4da;
      border-radius: 3px;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: auto !important;
    }
    
    .filter-actions {
      margin-top: 15px;
      display: flex;
      gap: 10px;
    }
    
    .active-filters {
      margin-bottom: 15px;
    }
    
    .filter-label {
      font-weight: 500;
      margin-right: 10px;
    }
    
    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .filter-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #007bff;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
    
    .filter-tag button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
    }
    
    .results-summary {
      font-size: 14px;
      color: #6c757d;
    }
  `]
})
export class SearchFilterGridComponent implements OnInit {
  originalData: Employee[] = [];
  filteredData: Employee[] = [];
  globalSearchTerm = '';
  showAdvancedFilters = false;
  
  filters = {
    department: '',
    salaryMin: null as number | null,
    salaryMax: null as number | null,
    activeOnly: false
  };
  
  departments: string[] = [];
  
  private searchSubject = new Subject<string>();
  
  constructor(private employeeService: EmployeeService) {
    // Debounce global search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performGlobalSearch(term);
    });
  }
  
  async ngOnInit() {
    await this.loadData();
    this.extractDepartments();
    this.filteredData = [...this.originalData];
  }
  
  private async loadData() {
    this.originalData = await this.employeeService.getEmployees();
  }
  
  private extractDepartments() {
    const deptSet = new Set(this.originalData.map(emp => emp.department));
    this.departments = Array.from(deptSet).sort();
  }
  
  // Global Search
  onGlobalSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.globalSearchTerm = term;
    this.searchSubject.next(term);
  }
  
  private performGlobalSearch(term: string) {
    if (!term.trim()) {
      this.applyFilters();
      return;
    }
    
    const searchTerm = term.toLowerCase();
    this.filteredData = this.originalData.filter(employee => {
      return Object.values(employee).some(value => 
        String(value).toLowerCase().includes(searchTerm)
      );
    });
    
    // Apply additional filters on top of search results
    this.applyAdvancedFilters();
  }
  
  clearGlobalSearch() {
    this.globalSearchTerm = '';
    this.applyFilters();
  }
  
  // Advanced Filters
  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }
  
  applyFilters() {
    // Start with search results or all data
    let data = this.globalSearchTerm ? 
      this.performGlobalSearchSync(this.globalSearchTerm) : 
      [...this.originalData];
    
    this.filteredData = this.applyAdvancedFiltersToData(data);
  }
  
  private performGlobalSearchSync(term: string): Employee[] {
    const searchTerm = term.toLowerCase();
    return this.originalData.filter(employee => {
      return Object.values(employee).some(value => 
        String(value).toLowerCase().includes(searchTerm)
      );
    });
  }
  
  private applyAdvancedFilters() {
    this.filteredData = this.applyAdvancedFiltersToData(this.filteredData);
  }
  
  private applyAdvancedFiltersToData(data: Employee[]): Employee[] {
    return data.filter(employee => {
      // Department filter
      if (this.filters.department && employee.department !== this.filters.department) {
        return false;
      }
      
      // Salary range filter
      if (this.filters.salaryMin !== null && employee.salary < this.filters.salaryMin) {
        return false;
      }
      if (this.filters.salaryMax !== null && employee.salary > this.filters.salaryMax) {
        return false;
      }
      
      // Active only filter
      if (this.filters.activeOnly && !employee.isActive) {
        return false;
      }
      
      return true;
    });
  }
  
  clearFilters() {
    this.globalSearchTerm = '';
    this.filters = {
      department: '',
      salaryMin: null,
      salaryMax: null,
      activeOnly: false
    };
    this.filteredData = [...this.originalData];
  }
  
  // Individual filter clearing
  clearDepartmentFilter() {
    this.filters.department = '';
    this.applyFilters();
  }
  
  clearSalaryFilter() {
    this.filters.salaryMin = null;
    this.filters.salaryMax = null;
    this.applyFilters();
  }
  
  // Helper methods
  hasActiveFilters(): boolean {
    return !!(
      this.globalSearchTerm ||
      this.filters.department ||
      this.filters.salaryMin !== null ||
      this.filters.salaryMax !== null ||
      this.filters.activeOnly
    );
  }
  
  getSalaryRangeText(): string {
    if (this.filters.salaryMin && this.filters.salaryMax) {
      return `$${this.filters.salaryMin.toLocaleString()} - $${this.filters.salaryMax.toLocaleString()}`;
    } else if (this.filters.salaryMin) {
      return `≥ $${this.filters.salaryMin.toLocaleString()}`;
    } else if (this.filters.salaryMax) {
      return `≤ $${this.filters.salaryMax.toLocaleString()}`;
    }
    return '';
  }
  
  columns: ColumnDefinition[] = [
    { id: 'firstName', field: 'firstName', header: 'First Name', sortable: true },
    { id: 'lastName', field: 'lastName', header: 'Last Name', sortable: true },
    { id: 'department', field: 'department', header: 'Department', sortable: true },
    { id: 'salary', field: 'salary', header: 'Salary', type: 'number', sortable: true, cellRenderer: '${{value | number}}' },
    { id: 'isActive', field: 'isActive', header: 'Active', type: 'boolean', sortable: true }
  ];
  
  config: GridConfig = {
    sortable: true,
    selectable: true,
    virtualScrolling: true
  };
}
```

## Drag and Drop Pattern

### Drag and Drop Row Reordering

```typescript
@Component({
  selector: 'app-drag-drop-grid',
  template: `
    <div class="drag-drop-container">
      <h3>Drag rows to reorder</h3>
      
      <blg-grid 
        [data]="data"
        [columns]="columns"
        [config]="config"
        [enableRowDrag]="true"
        (rowDrop)="onRowDrop($event)">
      </blg-grid>
      
      <div class="reorder-actions">
        <button (click)="resetOrder()" class="btn btn-secondary">Reset Order</button>
        <button (click)="saveOrder()" class="btn btn-primary" [disabled]="!hasChanges">Save Order</button>
      </div>
    </div>
  `,
  styles: [`
    .drag-drop-container {
      padding: 20px;
    }
    
    .reorder-actions {
      margin-top: 15px;
      display: flex;
      gap: 10px;
    }
    
    /* Custom drag styles */
    ::ng-deep .blg-grid .drag-handle {
      cursor: grab;
      color: #6c757d;
      width: 20px;
      text-align: center;
    }
    
    ::ng-deep .blg-grid .drag-handle:hover {
      color: #007bff;
    }
    
    ::ng-deep .blg-grid .grid-row.dragging {
      opacity: 0.5;
      transform: rotate(2deg);
    }
    
    ::ng-deep .blg-grid .grid-row.drag-over {
      border-top: 2px solid #007bff;
    }
    
    ::ng-deep .blg-grid .grid-row.drag-over-bottom {
      border-bottom: 2px solid #007bff;
    }
  `]
})
export class DragDropGridComponent {
  data: TaskItem[] = [];
  originalOrder: TaskItem[] = [];
  hasChanges = false;
  
  columns: ColumnDefinition[] = [
    {
      id: 'dragHandle',
      field: 'id',
      header: '',
      width: 40,
      sortable: false,
      cellEditor: false,
      cellRenderer: '<span class="drag-handle" title="Drag to reorder">⋮⋮</span>'
    },
    {
      id: 'priority',
      field: 'priority',
      header: 'Priority',
      type: 'number',
      width: 80,
      sortable: false // Disable sorting when drag-drop is enabled
    },
    {
      id: 'title',
      field: 'title',
      header: 'Task',
      type: 'string',
      sortable: false
    },
    {
      id: 'status',
      field: 'status',
      header: 'Status',
      type: 'string',
      sortable: false
    }
  ];
  
  config: GridConfig = {
    selectable: false, // Disable selection for cleaner drag experience
    sortable: false,   // Disable column sorting
    dragDrop: {
      enabled: true,
      dragHandle: '.drag-handle',
      dropZones: ['task-list'],
      dragClass: 'dragging',
      dropClass: 'drag-over'
    }
  };
  
  constructor(private taskService: TaskService) {}
  
  async ngOnInit() {
    await this.loadTasks();
    this.originalOrder = [...this.data];
  }
  
  private async loadTasks() {
    this.data = await this.taskService.getTasks();
    // Sort by current priority
    this.data.sort((a, b) => a.priority - b.priority);
  }
  
  onRowDrop(event: RowDropEvent) {
    const { fromIndex, toIndex, data: movedItem } = event;
    
    if (fromIndex === toIndex) return;
    
    // Remove item from old position
    this.data.splice(fromIndex, 1);
    
    // Insert at new position
    this.data.splice(toIndex, 0, movedItem);
    
    // Update priorities based on new order
    this.updatePriorities();
    
    // Trigger change detection
    this.data = [...this.data];
    this.hasChanges = true;
  }
  
  private updatePriorities() {
    this.data.forEach((task, index) => {
      task.priority = index + 1;
    });
  }
  
  resetOrder() {
    this.data = [...this.originalOrder];
    this.hasChanges = false;
  }
  
  async saveOrder() {
    try {
      await this.taskService.updateTaskOrder(this.data);
      this.originalOrder = [...this.data];
      this.hasChanges = false;
      // Show success notification
    } catch (error) {
      // Show error notification
      console.error('Failed to save order:', error);
    }
  }
}

// Supporting interfaces
interface TaskItem {
  id: number;
  title: string;
  status: string;
  priority: number;
}

interface RowDropEvent {
  fromIndex: number;
  toIndex: number;
  data: any;
}
```

## Export Patterns

### Advanced Export Implementation

```typescript
@Component({
  selector: 'app-export-grid',
  template: `
    <div class="export-container">
      <!-- Export Toolbar -->
      <div class="export-toolbar">
        <div class="export-options">
          <label>Export Format:</label>
          <select [(ngModel)]="exportFormat">
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
          
          <label>Data Scope:</label>
          <select [(ngModel)]="exportScope">
            <option value="all">All Data</option>
            <option value="filtered">Filtered Data</option>
            <option value="selected">Selected Rows</option>
            <option value="visible">Visible Page</option>
          </select>
          
          <button 
            (click)="showExportDialog = true"
            [disabled]="!canExport()"
            class="btn btn-primary">
            <i class="icon-download"></i> Export
          </button>
        </div>
        
        <div class="export-presets">
          <button 
            *ngFor="let preset of exportPresets"
            (click)="applyExportPreset(preset)"
            class="btn btn-sm btn-outline">
            {{ preset.name }}
          </button>
        </div>
      </div>
      
      <blg-grid 
        [data]="data"
        [columns]="columns"
        [config]="config"
        (selectionChange)="onSelectionChange($event)">
      </blg-grid>
    </div>
    
    <!-- Export Configuration Dialog -->
    <div class="modal" *ngIf="showExportDialog">
      <div class="modal-content export-dialog">
        <h3>Export Configuration</h3>
        
        <!-- Basic Settings -->
        <div class="export-section">
          <h4>Basic Settings</h4>
          <div class="form-group">
            <label>Filename:</label>
            <input [(ngModel)]="exportConfig.filename" type="text">
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="exportConfig.includeHeaders">
              Include Column Headers
            </label>
          </div>
        </div>
        
        <!-- Column Selection -->
        <div class="export-section">
          <h4>Columns to Include</h4>
          <div class="column-selection">
            <label *ngFor="let col of columns" class="column-checkbox">
              <input 
                type="checkbox" 
                [checked]="isColumnSelected(col.id)"
                (change)="toggleColumn(col.id, $event)">
              {{ col.header }}
            </label>
          </div>
        </div>
        
        <!-- Format-Specific Options -->
        <div class="export-section" *ngIf="exportFormat === 'csv'">
          <h4>CSV Options</h4>
          <div class="form-group">
            <label>Delimiter:</label>
            <select [(ngModel)]="exportConfig.csvOptions.delimiter">
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="exportConfig.csvOptions.includeBom">
              Include UTF-8 BOM
            </label>
          </div>
        </div>
        
        <div class="export-section" *ngIf="exportFormat === 'excel'">
          <h4>Excel Options</h4>
          <div class="form-group">
            <label>Sheet Name:</label>
            <input [(ngModel)]="exportConfig.excelOptions.sheetName" type="text">
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="exportConfig.excelOptions.autoSizeColumns">
              Auto-size Columns
            </label>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="exportConfig.excelOptions.applyBasicStyling">
              Apply Basic Styling
            </label>
          </div>
        </div>
        
        <!-- Preview -->
        <div class="export-section">
          <h4>Export Preview</h4>
          <div class="export-preview">
            <div class="preview-stats">
              <span>Rows: {{ getExportRowCount() }}</span>
              <span>Columns: {{ getSelectedColumns().length }}</span>
              <span>Estimated Size: {{ getEstimatedSize() }}</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="modal-actions">
          <button (click)="performExport()" class="btn btn-primary" [disabled]="isExporting">
            {{ isExporting ? 'Exporting...' : 'Export' }}
          </button>
          <button (click)="showExportDialog = false" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .export-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .export-options {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }
    
    .export-presets {
      display: flex;
      gap: 5px;
    }
    
    .export-dialog {
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .export-section {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .export-section:last-child {
      border-bottom: none;
    }
    
    .export-section h4 {
      margin-bottom: 10px;
      color: #333;
    }
    
    .form-group {
      margin-bottom: 10px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    .form-group input, .form-group select {
      padding: 5px 8px;
      border: 1px solid #ced4da;
      border-radius: 3px;
      width: 200px;
    }
    
    .column-selection {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      padding: 10px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }
    
    .column-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .export-preview {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
    }
    
    .preview-stats {
      display: flex;
      gap: 20px;
      font-size: 14px;
    }
    
    .preview-stats span {
      color: #6c757d;
    }
  `]
})
export class ExportGridComponent {
  showExportDialog = false;
  exportFormat: 'csv' | 'excel' | 'pdf' = 'csv';
  exportScope: 'all' | 'filtered' | 'selected' | 'visible' = 'all';
  isExporting = false;
  
  selectedRows = new Set<number>();
  selectedColumns = new Set<string>();
  
  exportConfig = {
    filename: 'grid-export',
    includeHeaders: true,
    csvOptions: {
      delimiter: ',',
      includeBom: true
    },
    excelOptions: {
      sheetName: 'Data',
      autoSizeColumns: true,
      applyBasicStyling: true
    }
  };
  
  exportPresets = [
    {
      name: 'Quick CSV',
      format: 'csv',
      scope: 'all',
      config: { filename: 'quick-export', includeHeaders: true }
    },
    {
      name: 'Selected Excel',
      format: 'excel',
      scope: 'selected',
      config: { filename: 'selected-data', includeHeaders: true }
    },
    {
      name: 'Summary Report',
      format: 'excel',
      scope: 'filtered',
      columns: ['id', 'name', 'status', 'total'],
      config: { filename: 'summary-report', includeHeaders: true }
    }
  ];
  
  constructor(
    private exportService: ExportService,
    private notificationService: NotificationService
  ) {
    // Initialize selected columns with all visible columns
    this.columns.forEach(col => {
      if (col.visible !== false) {
        this.selectedColumns.add(col.id);
      }
    });
  }
  
  canExport(): boolean {
    switch (this.exportScope) {
      case 'selected':
        return this.selectedRows.size > 0;
      default:
        return true;
    }
  }
  
  onSelectionChange(event: any) {
    this.selectedRows = new Set(event.selectedRows);
  }
  
  applyExportPreset(preset: any) {
    this.exportFormat = preset.format;
    this.exportScope = preset.scope;
    
    if (preset.columns) {
      this.selectedColumns.clear();
      preset.columns.forEach((colId: string) => this.selectedColumns.add(colId));
    }
    
    this.exportConfig = { ...this.exportConfig, ...preset.config };
  }
  
  isColumnSelected(columnId: string): boolean {
    return this.selectedColumns.has(columnId);
  }
  
  toggleColumn(columnId: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedColumns.add(columnId);
    } else {
      this.selectedColumns.delete(columnId);
    }
  }
  
  getSelectedColumns(): ColumnDefinition[] {
    return this.columns.filter(col => this.selectedColumns.has(col.id));
  }
  
  getExportData(): any[] {
    switch (this.exportScope) {
      case 'all':
        return this.originalData;
      case 'filtered':
        return this.filteredData;
      case 'selected':
        return Array.from(this.selectedRows).map(index => this.data[index]);
      case 'visible':
        return this.data; // Current page data
      default:
        return this.data;
    }
  }
  
  getExportRowCount(): number {
    return this.getExportData().length;
  }
  
  getEstimatedSize(): string {
    const rowCount = this.getExportRowCount();
    const colCount = this.getSelectedColumns().length;
    const avgCellSize = 20; // Average characters per cell
    const estimatedBytes = rowCount * colCount * avgCellSize;
    
    if (estimatedBytes < 1024) {
      return `${estimatedBytes} bytes`;
    } else if (estimatedBytes < 1024 * 1024) {
      return `${Math.round(estimatedBytes / 1024)} KB`;
    } else {
      return `${Math.round(estimatedBytes / (1024 * 1024))} MB`;
    }
  }
  
  async performExport() {
    this.isExporting = true;
    
    try {
      const exportData = this.getExportData();
      const selectedColumns = this.getSelectedColumns();
      
      const exportOptions = {
        format: this.exportFormat,
        filename: this.exportConfig.filename,
        includeHeaders: this.exportConfig.includeHeaders,
        columns: selectedColumns,
        data: exportData
      };
      
      switch (this.exportFormat) {
        case 'csv':
          await this.exportService.exportToCsv(exportOptions, this.exportConfig.csvOptions);
          break;
        case 'excel':
          await this.exportService.exportToExcel(exportOptions, this.exportConfig.excelOptions);
          break;
        case 'pdf':
          await this.exportService.exportToPdf(exportOptions);
          break;
      }
      
      this.notificationService.success(`Export completed: ${this.exportConfig.filename}.${this.exportFormat}`);
      this.showExportDialog = false;
      
    } catch (error) {
      this.notificationService.error('Export failed');
      console.error('Export error:', error);
    } finally {
      this.isExporting = false;
    }
  }
}
```

These patterns provide comprehensive examples of common grid implementations that you can adapt for your specific use cases. Each pattern includes complete TypeScript code, styling, and best practices for maintainable, scalable grid applications.