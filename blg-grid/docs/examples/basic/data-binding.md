# Data Binding Example

This example demonstrates various data binding patterns with the BLG Grid, including dynamic data loading, real-time updates, and reactive data sources.

## Observable Data Binding

### Basic Observable Setup

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, interval, map, takeUntil, Subject } from 'rxjs';
import { Grid } from '@blg/grid';
import { ColumnDefinition, GridConfig } from '@blg/core';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  salary: number;
  hireDate: Date;
  isActive: boolean;
}

@Component({
  selector: 'app-data-binding-grid',
  standalone: true,
  imports: [Grid, CommonModule],
  template: `
    <div class="controls">
      <button (click)="loadData()" [disabled]="loading">
        {{ loading ? 'Loading...' : 'Load Data' }}
      </button>
      <button (click)="addEmployee()">Add Employee</button>
      <button (click)="toggleRealTime()">
        {{ realTimeEnabled ? 'Stop' : 'Start' }} Real-time Updates
      </button>
      <button (click)="clearData()">Clear Data</button>
    </div>

    <div class="stats">
      <span>Total Employees: {{ employees.length }}</span>
      <span>Active: {{ getActiveCount() }}</span>
      <span>Average Salary: {{ getAverageSalary() | currency }}</span>
    </div>

    <blg-grid 
      [data]="employees" 
      [columns]="columns" 
      [config]="config"
      (gridEvent)="onGridEvent($event)">
    </blg-grid>
  `,
  styles: [`
    .controls {
      margin-bottom: 15px;
      gap: 10px;
      display: flex;
      flex-wrap: wrap;
    }

    .controls button {
      padding: 8px 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f8f9fa;
      cursor: pointer;
    }

    .controls button:hover:not(:disabled) {
      background: #e9ecef;
    }

    .controls button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .stats {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .stats span {
      font-weight: 500;
    }
  `]
})
export class DataBindingGridComponent implements OnInit, OnDestroy {
  // Data source
  private dataSource$ = new BehaviorSubject<Employee[]>([]);
  employees: Employee[] = [];
  
  // State management
  loading = false;
  realTimeEnabled = false;
  private destroy$ = new Subject<void>();
  private employeeIdCounter = 1;

  constructor(private employeeService: EmployeeService) {
    // Subscribe to data source changes
    this.dataSource$.subscribe(data => {
      this.employees = [...data]; // Create new reference for change detection
    });
  }

  columns: ColumnDefinition[] = [
    {
      id: 'id',
      field: 'id',
      header: 'ID',
      type: 'number',
      width: 80,
      sortable: true,
      pinned: 'left'
    },
    {
      id: 'firstName',
      field: 'firstName',
      header: 'First Name',
      type: 'string',
      width: 120,
      sortable: true,
      filterable: true,
      cellEditor: true
    },
    {
      id: 'lastName',
      field: 'lastName',
      header: 'Last Name',
      type: 'string',
      width: 120,
      sortable: true,
      filterable: true,
      cellEditor: true
    },
    {
      id: 'email',
      field: 'email',
      header: 'Email',
      type: 'string',
      width: 200,
      filterable: true,
      cellRenderer: '<a href="mailto:{{value}}">{{value}}</a>'
    },
    {
      id: 'department',
      field: 'department',
      header: 'Department',
      type: 'string',
      width: 150,
      sortable: true,
      filterable: true,
      cellEditor: true
    },
    {
      id: 'salary',
      field: 'salary',
      header: 'Salary',
      type: 'number',
      width: 120,
      align: 'right',
      sortable: true,
      cellEditor: true,
      cellRenderer: '{{value | currency}}'
    },
    {
      id: 'hireDate',
      field: 'hireDate',
      header: 'Hire Date',
      type: 'date',
      width: 120,
      sortable: true,
      cellEditor: true
    },
    {
      id: 'isActive',
      field: 'isActive',
      header: 'Status',
      type: 'boolean',
      width: 100,
      align: 'center',
      sortable: true,
      cellRenderer: '<span class="status-{{value ? \'active\' : \'inactive\'}}">{{value ? \'Active\' : \'Inactive\'}}</span>'
    }
  ];

  config: GridConfig = {
    selectable: true,
    selectionMode: 'multiple',
    sortable: true,
    filterable: true,
    resizable: true,
    virtualScrolling: true,
    rowHeight: 40,
    pagination: true,
    paginationConfig: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    }
  };

  ngOnInit() {
    this.loadData();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data loading methods
  async loadData() {
    this.loading = true;
    try {
      const employees = await this.employeeService.getEmployees();
      this.dataSource$.next(employees);
      this.employeeIdCounter = Math.max(...employees.map(e => e.id)) + 1;
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      this.loading = false;
    }
  }

  addEmployee() {
    const newEmployee: Employee = {
      id: this.employeeIdCounter++,
      firstName: 'New',
      lastName: 'Employee',
      email: `employee${this.employeeIdCounter - 1}@company.com`,
      department: 'Engineering',
      salary: 65000,
      hireDate: new Date(),
      isActive: true
    };

    const currentData = this.dataSource$.value;
    this.dataSource$.next([...currentData, newEmployee]);
  }

  clearData() {
    this.dataSource$.next([]);
  }

  // Real-time updates simulation
  private setupRealTimeUpdates() {
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.realTimeEnabled && this.employees.length > 0) {
          this.simulateDataUpdate();
        }
      });
  }

  toggleRealTime() {
    this.realTimeEnabled = !this.realTimeEnabled;
  }

  private simulateDataUpdate() {
    const currentData = [...this.dataSource$.value];
    if (currentData.length === 0) return;

    // Randomly update an employee's salary
    const randomIndex = Math.floor(Math.random() * currentData.length);
    const employee = { ...currentData[randomIndex] };
    
    // Simulate salary increase/decrease
    const change = (Math.random() - 0.5) * 10000;
    employee.salary = Math.max(30000, employee.salary + change);
    
    currentData[randomIndex] = employee;
    this.dataSource$.next(currentData);
  }

  // Statistics methods
  getActiveCount(): number {
    return this.employees.filter(emp => emp.isActive).length;
  }

  getAverageSalary(): number {
    if (this.employees.length === 0) return 0;
    const total = this.employees.reduce((sum, emp) => sum + emp.salary, 0);
    return total / this.employees.length;
  }

  onGridEvent(event: any) {
    console.log('Grid event:', event);
    
    // Handle cell edits
    if (event.type === 'cell-edit') {
      this.handleCellEdit(event);
    }
  }

  private handleCellEdit(event: any) {
    const { rowIndex, columnId, newValue, oldValue } = event.data;
    
    console.log(`Cell edited: ${columnId} changed from ${oldValue} to ${newValue}`);
    
    // Update the data source to maintain consistency
    const currentData = [...this.dataSource$.value];
    const actualIndex = rowIndex; // Adjust for pagination if needed
    
    if (currentData[actualIndex]) {
      currentData[actualIndex] = {
        ...currentData[actualIndex],
        [columnId]: newValue
      };
      
      // Emit updated data
      this.dataSource$.next(currentData);
    }
  }
}
```

## Server-Side Data Integration

### REST API Integration

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'https://api.example.com/employees';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl)
      .pipe(
        map(employees => employees.map(emp => ({
          ...emp,
          hireDate: new Date(emp.hireDate)
        }))),
        catchError(error => {
          console.error('Error fetching employees:', error);
          return of([]);
        })
      );
  }

  updateEmployee(id: number, updates: Partial<Employee>): Observable<Employee> {
    return this.http.patch<Employee>(`${this.apiUrl}/${id}`, updates);
  }

  createEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Component with Server Integration

```typescript
@Component({
  selector: 'app-server-data-grid',
  template: `
    <div class="toolbar">
      <button (click)="refresh()" [disabled]="loading">
        <span *ngIf="loading">Refreshing...</span>
        <span *ngIf="!loading">Refresh</span>
      </button>
      
      <button (click)="saveChanges()" [disabled]="!hasUnsavedChanges">
        Save Changes ({{ unsavedChanges.size }})
      </button>
    </div>

    <blg-grid 
      [data]="employees$ | async" 
      [columns]="columns"
      [config]="config"
      (gridEvent)="onGridEvent($event)">
    </blg-grid>
  `
})
export class ServerDataGridComponent implements OnInit {
  employees$: Observable<Employee[]>;
  loading = false;
  unsavedChanges = new Map<number, Partial<Employee>>();

  constructor(private employeeService: EmployeeService) {
    this.employees$ = this.employeeService.getEmployees();
  }

  get hasUnsavedChanges(): boolean {
    return this.unsavedChanges.size > 0;
  }

  refresh() {
    this.loading = true;
    this.employees$ = this.employeeService.getEmployees()
      .pipe(finalize(() => this.loading = false));
  }

  onGridEvent(event: any) {
    if (event.type === 'cell-edit') {
      this.trackChange(event);
    }
  }

  private trackChange(event: any) {
    const { rowData, columnId, newValue } = event.data;
    const employeeId = rowData.id;
    
    if (!this.unsavedChanges.has(employeeId)) {
      this.unsavedChanges.set(employeeId, {});
    }
    
    const changes = this.unsavedChanges.get(employeeId)!;
    changes[columnId] = newValue;
  }

  async saveChanges() {
    const savePromises = Array.from(this.unsavedChanges.entries())
      .map(([employeeId, changes]) => 
        this.employeeService.updateEmployee(employeeId, changes).toPromise()
      );

    try {
      await Promise.all(savePromises);
      this.unsavedChanges.clear();
      this.refresh(); // Reload data to ensure consistency
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  }
}
```

## Signal-Based Data Binding (Angular 16+)

### Using Angular Signals

```typescript
import { Component, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-signal-grid',
  template: `
    <div class="controls">
      <button (click)="addRandomEmployee()">Add Employee</button>
      <button (click)="filterByDepartment(selectedDepartment())">
        Filter by {{ selectedDepartment() }}
      </button>
      <select (change)="selectedDepartment.set($event.target.value)">
        <option value="All">All Departments</option>
        <option value="Engineering">Engineering</option>
        <option value="Sales">Sales</option>
        <option value="Marketing">Marketing</option>
      </select>
    </div>

    <div class="summary">
      <p>Total Employees: {{ employees().length }}</p>
      <p>Filtered Employees: {{ filteredEmployees().length }}</p>
      <p>Average Salary: {{ averageSalary() | currency }}</p>
    </div>

    <blg-grid 
      [data]="filteredEmployees()" 
      [columns]="columns"
      [config]="config">
    </blg-grid>
  `
})
export class SignalGridComponent {
  // Signal-based reactive data
  employees = signal<Employee[]>([]);
  selectedDepartment = signal<string>('All');
  
  // Computed values
  filteredEmployees = computed(() => {
    const dept = this.selectedDepartment();
    const allEmployees = this.employees();
    
    if (dept === 'All') {
      return allEmployees;
    }
    
    return allEmployees.filter(emp => emp.department === dept);
  });

  averageSalary = computed(() => {
    const emps = this.filteredEmployees();
    if (emps.length === 0) return 0;
    
    const total = emps.reduce((sum, emp) => sum + emp.salary, 0);
    return total / emps.length;
  });

  // Effect for side effects
  constructor() {
    effect(() => {
      console.log(`Displaying ${this.filteredEmployees().length} employees`);
    });
    
    // Load initial data
    this.loadInitialData();
  }

  private loadInitialData() {
    // Simulate API call
    setTimeout(() => {
      this.employees.set([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@company.com',
          department: 'Engineering',
          salary: 75000,
          hireDate: new Date('2022-01-15'),
          isActive: true
        },
        // ... more employees
      ]);
    }, 1000);
  }

  addRandomEmployee() {
    const departments = ['Engineering', 'Sales', 'Marketing'];
    const names = [
      { first: 'Alice', last: 'Johnson' },
      { first: 'Bob', last: 'Smith' },
      { first: 'Carol', last: 'Williams' }
    ];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomDept = departments[Math.floor(Math.random() * departments.length)];
    
    const newEmployee: Employee = {
      id: Date.now(),
      firstName: randomName.first,
      lastName: randomName.last,
      email: `${randomName.first.toLowerCase()}@company.com`,
      department: randomDept,
      salary: 50000 + Math.floor(Math.random() * 50000),
      hireDate: new Date(),
      isActive: true
    };

    this.employees.update(current => [...current, newEmployee]);
  }

  filterByDepartment(department: string) {
    this.selectedDepartment.set(department);
  }
}
```

## WebSocket Real-Time Updates

### Real-Time Data Service

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface DataUpdate {
  type: 'create' | 'update' | 'delete';
  data: Employee | { id: number };
}

@Injectable({
  providedIn: 'root'
})
export class RealTimeEmployeeService {
  private employees$ = new BehaviorSubject<Employee[]>([]);
  private socket: WebSocket | null = null;

  constructor() {
    this.connectWebSocket();
  }

  getEmployees(): Observable<Employee[]> {
    return this.employees$.asObservable();
  }

  private connectWebSocket() {
    this.socket = new WebSocket('ws://localhost:8080/employees');
    
    this.socket.onmessage = (event) => {
      const update: DataUpdate = JSON.parse(event.data);
      this.handleUpdate(update);
    };

    this.socket.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  private handleUpdate(update: DataUpdate) {
    const currentEmployees = this.employees$.value;
    
    switch (update.type) {
      case 'create':
        this.employees$.next([...currentEmployees, update.data as Employee]);
        break;
        
      case 'update':
        const updatedEmployee = update.data as Employee;
        const updateIndex = currentEmployees.findIndex(emp => emp.id === updatedEmployee.id);
        if (updateIndex >= 0) {
          const newEmployees = [...currentEmployees];
          newEmployees[updateIndex] = updatedEmployee;
          this.employees$.next(newEmployees);
        }
        break;
        
      case 'delete':
        const deletedId = (update.data as { id: number }).id;
        const filtered = currentEmployees.filter(emp => emp.id !== deletedId);
        this.employees$.next(filtered);
        break;
    }
  }
}
```

### Real-Time Component

```typescript
@Component({
  selector: 'app-realtime-grid',
  template: `
    <div class="status-bar">
      <span class="connection-status" [class.connected]="isConnected">
        {{ isConnected ? '🟢 Connected' : '🔴 Disconnected' }}
      </span>
      <span>Last Update: {{ lastUpdateTime | date:'short' }}</span>
    </div>

    <blg-grid 
      [data]="employees$ | async" 
      [columns]="columns"
      [config]="config">
    </blg-grid>
  `,
  styles: [`
    .status-bar {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 15px;
    }

    .connection-status.connected {
      color: green;
    }

    .connection-status:not(.connected) {
      color: red;
    }
  `]
})
export class RealtimeGridComponent implements OnInit, OnDestroy {
  employees$: Observable<Employee[]>;
  isConnected = false;
  lastUpdateTime: Date | null = null;
  
  private subscription?: Subscription;

  constructor(private realtimeService: RealTimeEmployeeService) {
    this.employees$ = this.realtimeService.getEmployees();
  }

  ngOnInit() {
    this.subscription = this.employees$.subscribe(() => {
      this.lastUpdateTime = new Date();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
```

## Async Pipe Patterns

### Loading States with Async Pipe

```typescript
@Component({
  selector: 'app-async-grid',
  template: `
    <div *ngIf="employees$ | async as employees; else loading">
      <div class="summary">
        Found {{ employees.length }} employees
      </div>
      
      <blg-grid 
        [data]="employees" 
        [columns]="columns"
        [config]="config">
      </blg-grid>
    </div>

    <ng-template #loading>
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading employees...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AsyncGridComponent {
  employees$: Observable<Employee[]>;
  
  constructor(private employeeService: EmployeeService) {
    this.employees$ = this.employeeService.getEmployees()
      .pipe(
        startWith([]), // Start with empty array
        delay(1000), // Simulate network delay
        shareReplay(1) // Cache the result
      );
  }
}
```

## Best Practices

### 1. Immutable Data Updates

```typescript
// ✅ Good - Create new arrays/objects
updateEmployee(id: number, updates: Partial<Employee>) {
  const currentEmployees = this.employees();
  const updatedEmployees = currentEmployees.map(emp => 
    emp.id === id ? { ...emp, ...updates } : emp
  );
  this.employees.set(updatedEmployees);
}

// ❌ Bad - Mutate existing data
updateEmployee(id: number, updates: Partial<Employee>) {
  const employee = this.employees().find(emp => emp.id === id);
  if (employee) {
    Object.assign(employee, updates); // Mutation!
  }
}
```

### 2. Error Handling

```typescript
employees$ = this.employeeService.getEmployees()
  .pipe(
    retry(3),
    catchError(error => {
      this.errorMessage = 'Failed to load employees';
      return of([]); // Return empty array on error
    })
  );
```

### 3. Memory Management

```typescript
export class DataBindingComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.processData(data));
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 4. Performance Optimization

```typescript
// Use trackBy for better performance
trackByEmployeeId(index: number, employee: Employee): number {
  return employee.id;
}

// In template
<blg-grid 
  [data]="employees"
  [trackByFn]="trackByEmployeeId">
</blg-grid>
```

## Next Steps

Explore more advanced data binding scenarios:

1. **[Column Configuration](./column-configuration.md)** - Dynamic columns
2. **[Large Datasets](../advanced/large-datasets.md)** - Virtual scrolling
3. **[Real-time Updates](../advanced/real-time-updates.md)** - Advanced real-time patterns
4. **[Server Integration](../recipes/server-integration.md)** - Complete server integration patterns