# Large Datasets Example

This example demonstrates how to handle large datasets efficiently using virtual scrolling, server-side operations, and performance optimization techniques.

## Virtual Scrolling with 100k+ Rows

### Component Setup

```typescript
import { Component, OnInit, ViewChild, computed, signal } from '@angular/core';
import { Grid } from '@ng-ui/grid';
import { ColumnDefinition, GridConfig, GridEventType } from '@ng-ui/core';

interface LargeDataRecord {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  hireDate: Date;
  performance: number;
  region: string;
  status: 'active' | 'inactive' | 'pending';
}

@Component({
  selector: 'app-large-dataset-grid',
  standalone: true,
  imports: [Grid, CommonModule],
  template: `
    <div class="performance-dashboard">
      <!-- Performance Metrics -->
      <div class="metrics">
        <div class="metric">
          <span class="metric-label">Total Records:</span>
          <span class="metric-value">{{ totalRecords().toLocaleString() }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Render Time:</span>
          <span class="metric-value">{{ renderTime() }}ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">Memory Usage:</span>
          <span class="metric-value">{{ memoryUsage() }}MB</span>
        </div>
        <div class="metric">
          <span class="metric-label">Visible Rows:</span>
          <span class="metric-value">{{ visibleRowCount() }}</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls">
        <button (click)="generateLargeDataset(10000)" [disabled]="loading()">
          Generate 10K Records
        </button>
        <button (click)="generateLargeDataset(50000)" [disabled]="loading()">
          Generate 50K Records
        </button>
        <button (click)="generateLargeDataset(100000)" [disabled]="loading()">
          Generate 100K Records
        </button>
        <button (click)="generateLargeDataset(500000)" [disabled]="loading()">
          Generate 500K Records
        </button>
        <button (click)="clearData()" [disabled]="loading()">
          Clear Data
        </button>
        <button (click)="toggleVirtualScrolling()">
          Virtual Scrolling: {{ virtualScrollingEnabled() ? 'ON' : 'OFF' }}
        </button>
      </div>

      <!-- Loading Indicator -->
      <div class="loading-indicator" *ngIf="loading()">
        <div class="spinner"></div>
        <span>Generating {{ recordsToGenerate().toLocaleString() }} records...</span>
      </div>
    </div>

    <!-- Grid -->
    <ng-ui-lib 
      #grid
      [data]="data()" 
      [columns]="columns" 
      [config]="gridConfig()"
      (gridEvent)="onGridEvent($event)">
    </ng-ui-lib>
  `,
  styles: [`
    .performance-dashboard {
      margin-bottom: 20px;
    }

    .metrics {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .metric {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 120px;
    }

    .metric-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .metric-value {
      font-size: 18px;
      font-weight: bold;
      color: #007bff;
    }

    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .controls button {
      padding: 8px 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
      transition: all 0.2s;
    }

    .controls button:hover:not(:disabled) {
      background: #f0f0f0;
    }

    .controls button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      background: #e3f2fd;
      border-radius: 4px;
      margin-bottom: 15px;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #ccc;
      border-top: 2px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LargeDatasetGridComponent implements OnInit {
  @ViewChild('grid') grid!: Grid;

  // Reactive state
  data = signal<LargeDataRecord[]>([]);
  loading = signal<boolean>(false);
  recordsToGenerate = signal<number>(0);
  renderTime = signal<number>(0);
  memoryUsage = signal<number>(0);
  virtualScrollingEnabled = signal<boolean>(true);

  // Computed properties
  totalRecords = computed(() => this.data().length);
  visibleRowCount = computed(() => {
    // Calculate visible rows based on viewport height and row height
    const rowHeight = 40;
    const viewportHeight = 600; // Approximate grid height
    return Math.ceil(viewportHeight / rowHeight);
  });

  gridConfig = computed((): GridConfig => ({
    virtualScrolling: this.virtualScrollingEnabled(),
    rowHeight: 40,
    sortable: true,
    filterable: true,
    selectable: true,
    selectionMode: 'multiple',
    resizable: true,
    pagination: false, // Disable pagination for virtual scrolling
    // Performance optimizations
    bufferSize: 10, // Number of extra rows to render outside viewport
  }));

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
      id: 'name',
      field: 'name',
      header: 'Name',
      type: 'string',
      width: 150,
      sortable: true,
      filterable: true
    },
    {
      id: 'email',
      field: 'email',
      header: 'Email',
      type: 'string',
      width: 200,
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
      type: 'number',
      width: 120,
      align: 'right',
      sortable: true,
      cellRenderer: '${{value.toLocaleString()}}'
    },
    {
      id: 'hireDate',
      field: 'hireDate',
      header: 'Hire Date',
      type: 'date',
      width: 120,
      sortable: true
    },
    {
      id: 'performance',
      field: 'performance',
      header: 'Performance',
      type: 'number',
      width: 120,
      align: 'center',
      sortable: true,
      cellRenderer: this.getPerformanceRenderer()
    },
    {
      id: 'region',
      field: 'region',
      header: 'Region',
      type: 'string',
      width: 100,
      sortable: true,
      filterable: true
    },
    {
      id: 'status',
      field: 'status',
      header: 'Status',
      type: 'string',
      width: 100,
      sortable: true,
      filterable: true,
      cellRenderer: '<span class="status-{{value}}">{{value | titlecase}}</span>'
    }
  ];

  ngOnInit() {
    // Start with a reasonable default dataset
    this.generateLargeDataset(1000);
    
    // Monitor performance
    this.startPerformanceMonitoring();
  }

  async generateLargeDataset(count: number) {
    this.loading.set(true);
    this.recordsToGenerate.set(count);
    
    const startTime = performance.now();
    
    try {
      // Use Web Workers for large dataset generation to avoid blocking UI
      const data = await this.generateDataInChunks(count);
      this.data.set(data);
      
      const endTime = performance.now();
      this.renderTime.set(Math.round(endTime - startTime));
      
    } catch (error) {
      console.error('Error generating dataset:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private async generateDataInChunks(totalCount: number): Promise<LargeDataRecord[]> {
    const chunkSize = 10000;
    const chunks: LargeDataRecord[][] = [];
    
    for (let i = 0; i < totalCount; i += chunkSize) {
      const currentChunkSize = Math.min(chunkSize, totalCount - i);
      const chunk = await this.generateDataChunk(i, currentChunkSize);
      chunks.push(chunk);
      
      // Allow UI to update between chunks
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return chunks.flat();
  }

  private async generateDataChunk(startId: number, count: number): Promise<LargeDataRecord[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const data: LargeDataRecord[] = [];
        const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
        const regions = ['North', 'South', 'East', 'West', 'Central'];
        const statuses: ('active' | 'inactive' | 'pending')[] = ['active', 'inactive', 'pending'];
        
        for (let i = 0; i < count; i++) {
          const id = startId + i + 1;
          data.push({
            id,
            name: `Employee ${id}`,
            email: `employee${id}@company.com`,
            department: departments[Math.floor(Math.random() * departments.length)],
            salary: 30000 + Math.floor(Math.random() * 100000),
            hireDate: this.randomDate(new Date(2020, 0, 1), new Date()),
            performance: Math.round(Math.random() * 100),
            region: regions[Math.floor(Math.random() * regions.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)]
          });
        }
        
        resolve(data);
      }, 0);
    });
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private getPerformanceRenderer(): string {
    return `
      <div class="performance-bar">
        <div class="performance-fill" style="width: {{value}}%; background-color: {{value > 80 ? '#28a745' : value > 60 ? '#ffc107' : '#dc3545'}}"></div>
        <span class="performance-text">{{value}}%</span>
      </div>
    `;
  }

  clearData() {
    this.data.set([]);
    this.renderTime.set(0);
  }

  toggleVirtualScrolling() {
    this.virtualScrollingEnabled.update(enabled => !enabled);
  }

  onGridEvent(event: GridEventType) {
    // Handle grid events efficiently
    if (event.type === 'cell-click') {
      // Minimize processing for large datasets
      console.log('Cell clicked:', event.data.columnId, event.data.rowIndex);
    }
  }

  private startPerformanceMonitoring() {
    // Monitor memory usage periodically
    setInterval(() => {
      if ((performance as any).memory) {
        const memoryInfo = (performance as any).memory;
        const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
        this.memoryUsage.set(usedMB);
      }
    }, 2000);
  }
}
```

## Server-Side Operations for Large Datasets

### Server-Side Pagination Component

```typescript
@Component({
  selector: 'app-server-side-grid',
  template: `
    <div class="server-controls">
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Search employees..."
          [(ngModel)]="searchTerm"
          (input)="onSearchChange($event)"
          class="search-input">
      </div>
      
      <div class="filter-controls">
        <select [(ngModel)]="departmentFilter" (change)="applyFilters()">
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
        </select>
        
        <select [(ngModel)]="statusFilter" (change)="applyFilters()">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <ng-ui-lib 
      [data]="employees$ | async" 
      [columns]="columns"
      [config]="config"
      (gridEvent)="onGridEvent($event)">
    </ng-ui-lib>
  `,
  styles: [`
    .server-controls {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 300px;
    }

    .search-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }

    .filter-controls {
      display: flex;
      gap: 10px;
    }

    .filter-controls select {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  `]
})
export class ServerSideGridComponent implements OnInit {
  employees$: Observable<LargeDataRecord[]>;
  
  // Server-side state
  searchTerm = '';
  departmentFilter = '';
  statusFilter = '';
  currentPage = 0;
  pageSize = 50;
  totalRecords = 0;
  
  private searchSubject = new Subject<string>();

  constructor(private largeDataService: LargeDataService) {
    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.loadData();
    });
  }

  columns: ColumnDefinition[] = [
    // Same columns as above
  ];

  config: GridConfig = {
    virtualScrolling: false, // Use pagination instead
    sortable: true,
    filterable: false, // Handle filtering server-side
    selectable: true,
    pagination: true,
    paginationConfig: {
      pageSize: 50,
      pageSizeOptions: [25, 50, 100, 200],
      mode: 'server', // Server-side pagination
      showPageSizeSelector: true,
      showPageInfo: true
    }
  };

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    const params = {
      page: this.currentPage,
      size: this.pageSize,
      search: this.searchTerm,
      department: this.departmentFilter,
      status: this.statusFilter
    };

    this.employees$ = this.largeDataService.getEmployeesServerSide(params)
      .pipe(
        tap(response => {
          this.totalRecords = response.totalElements;
        }),
        map(response => response.content),
        catchError(error => {
          console.error('Error loading data:', error);
          return of([]);
        })
      );
  }

  onSearchChange(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }

  applyFilters() {
    this.currentPage = 0; // Reset to first page
    this.loadData();
  }

  onGridEvent(event: GridEventType) {
    if (event.type === 'pagination') {
      this.currentPage = event.data.currentPage;
      this.pageSize = event.data.pageSize;
      this.loadData();
    } else if (event.type === 'column-sort') {
      // Handle server-side sorting
      this.handleServerSort(event.data);
    }
  }

  private handleServerSort(sortData: any) {
    // Implement server-side sorting
    const params = {
      page: this.currentPage,
      size: this.pageSize,
      search: this.searchTerm,
      department: this.departmentFilter,
      status: this.statusFilter,
      sortBy: sortData.columnId,
      sortDirection: sortData.direction
    };

    this.employees$ = this.largeDataService.getEmployeesServerSide(params)
      .pipe(
        map(response => response.content),
        catchError(error => {
          console.error('Error loading sorted data:', error);
          return of([]);
        })
      );
  }
}
```

### Large Data Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

interface ServerResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface ServerParams {
  page: number;
  size: number;
  search?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class LargeDataService {
  private apiUrl = 'https://api.example.com/employees';
  
  // Simulated large dataset for demo purposes
  private simulatedData: LargeDataRecord[] = [];
  
  constructor(private http: HttpClient) {
    this.generateSimulatedData();
  }

  getEmployeesServerSide(params: ServerParams): Observable<ServerResponse<LargeDataRecord>> {
    // In a real application, this would be an HTTP call
    // return this.http.get<ServerResponse<LargeDataRecord>>(this.apiUrl, { params: this.buildHttpParams(params) });
    
    // Simulate server-side processing
    return this.simulateServerSideProcessing(params);
  }

  private simulateServerSideProcessing(params: ServerParams): Observable<ServerResponse<LargeDataRecord>> {
    return new Promise<ServerResponse<LargeDataRecord>>(resolve => {
      // Simulate network delay
      setTimeout(() => {
        let filteredData = [...this.simulatedData];
        
        // Apply search filter
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          filteredData = filteredData.filter(record => 
            record.name.toLowerCase().includes(searchTerm) ||
            record.email.toLowerCase().includes(searchTerm) ||
            record.department.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply department filter
        if (params.department) {
          filteredData = filteredData.filter(record => 
            record.department === params.department
          );
        }
        
        // Apply status filter
        if (params.status) {
          filteredData = filteredData.filter(record => 
            record.status === params.status
          );
        }
        
        // Apply sorting
        if (params.sortBy && params.sortDirection) {
          filteredData.sort((a, b) => {
            const aValue = a[params.sortBy as keyof LargeDataRecord];
            const bValue = b[params.sortBy as keyof LargeDataRecord];
            
            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            else if (aValue > bValue) comparison = 1;
            
            return params.sortDirection === 'desc' ? -comparison : comparison;
          });
        }
        
        // Apply pagination
        const startIndex = params.page * params.size;
        const endIndex = startIndex + params.size;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        resolve({
          content: paginatedData,
          totalElements: filteredData.length,
          totalPages: Math.ceil(filteredData.length / params.size),
          size: params.size,
          number: params.page
        });
      }, 500); // Simulate 500ms server response time
    }).then(result => of(result)).then(obs => obs);
  }

  private generateSimulatedData() {
    // Generate 1 million records for server-side demo
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const statuses: ('active' | 'inactive' | 'pending')[] = ['active', 'inactive', 'pending'];
    
    for (let i = 0; i < 1000000; i++) {
      this.simulatedData.push({
        id: i + 1,
        name: `Employee ${i + 1}`,
        email: `employee${i + 1}@company.com`,
        department: departments[Math.floor(Math.random() * departments.length)],
        salary: 30000 + Math.floor(Math.random() * 100000),
        hireDate: this.randomDate(new Date(2015, 0, 1), new Date()),
        performance: Math.round(Math.random() * 100),
        region: regions[Math.floor(Math.random() * regions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });
    }
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private buildHttpParams(params: ServerParams): HttpParams {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.department) httpParams = httpParams.set('department', params.department);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

    return httpParams;
  }
}
```

## Performance Optimization Techniques

### Memory-Efficient Component

```typescript
@Component({
  selector: 'app-optimized-grid',
  template: `
    <div class="optimization-controls">
      <label>
        <input type="checkbox" [(ngModel)]="useVirtualScrolling" (change)="updateConfig()">
        Virtual Scrolling
      </label>
      <label>
        <input type="checkbox" [(ngModel)]="useColumnVirtualization" (change)="updateConfig()">
        Column Virtualization
      </label>
      <label>
        <input type="checkbox" [(ngModel)]="useRowCaching" (change)="updateConfig()">
        Row Caching
      </label>
    </div>

    <ng-ui-lib 
      [data]="optimizedData$ | async" 
      [columns]="optimizedColumns"
      [config]="optimizedConfig"
      [trackByFn]="trackByRecordId">
    </ng-ui-lib>
  `
})
export class OptimizedGridComponent implements OnInit, OnDestroy {
  useVirtualScrolling = true;
  useColumnVirtualization = false;
  useRowCaching = true;
  
  optimizedData$: Observable<LargeDataRecord[]>;
  private dataCache = new Map<string, LargeDataRecord[]>();
  private destroy$ = new Subject<void>();

  // Optimized column definitions
  optimizedColumns: ColumnDefinition[] = [
    {
      id: 'id',
      field: 'id',
      header: 'ID',
      type: 'number',
      width: 80,
      sortable: true,
      // Disable unnecessary features for performance
      filterable: false,
      resizable: false
    },
    // More streamlined columns...
  ];

  optimizedConfig: GridConfig = {
    virtualScrolling: this.useVirtualScrolling,
    rowHeight: 35, // Smaller row height for more rows in viewport
    // Performance settings
    bufferSize: 5,
    // Disable expensive features for large datasets
    selectable: false,
    filterable: false,
    resizable: false
  };

  constructor(private dataService: LargeDataService) {
    this.optimizedData$ = this.createOptimizedDataStream();
  }

  ngOnInit() {
    this.startPerformanceMonitoring();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createOptimizedDataStream(): Observable<LargeDataRecord[]> {
    return this.dataService.getEmployeesOptimized()
      .pipe(
        // Use shareReplay to avoid multiple HTTP calls
        shareReplay(1),
        // Transform data for optimal rendering
        map(data => this.preprocessDataForRendering(data)),
        takeUntil(this.destroy$)
      );
  }

  private preprocessDataForRendering(data: LargeDataRecord[]): LargeDataRecord[] {
    // Pre-format data to avoid computations during rendering
    return data.map(record => ({
      ...record,
      // Pre-format computed values
      formattedSalary: `$${record.salary.toLocaleString()}`,
      formattedHireDate: record.hireDate.toLocaleDateString()
    }));
  }

  // Efficient trackBy function
  trackByRecordId = (index: number, record: LargeDataRecord): number => {
    return record.id;
  };

  updateConfig() {
    this.optimizedConfig = {
      ...this.optimizedConfig,
      virtualScrolling: this.useVirtualScrolling
      // Update other optimization settings
    };
  }

  private startPerformanceMonitoring() {
    // Monitor rendering performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name.includes('grid-render')) {
          console.log(`Render time: ${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
}
```

## Advanced Virtual Scrolling Configuration

```typescript
interface AdvancedVirtualScrollConfig {
  // Buffer zones
  bufferSize: number;           // Extra rows to render outside viewport
  runwayItems: number;          // Items to render before/after visible area
  
  // Performance tuning
  scrollDebounceTime: number;   // Debounce scroll events (ms)
  renderThrottleTime: number;   // Throttle render updates (ms)
  
  // Memory management
  maxCachedItems: number;       // Maximum items to keep in DOM cache
  recycleThreshold: number;     // When to recycle DOM elements
}

const advancedConfig: GridConfig = {
  virtualScrolling: true,
  virtualScrollOptions: {
    bufferSize: 10,
    runwayItems: 5,
    scrollDebounceTime: 16,     // ~60fps
    renderThrottleTime: 33,     // ~30fps
    maxCachedItems: 1000,
    recycleThreshold: 500
  }
};
```

## Performance Monitoring Component

```typescript
@Component({
  selector: 'app-performance-monitor',
  template: `
    <div class="performance-panel">
      <h3>Performance Metrics</h3>
      
      <div class="metrics-grid">
        <div class="metric">
          <label>Render Time:</label>
          <span>{{ renderMetrics.renderTime }}ms</span>
        </div>
        
        <div class="metric">
          <label>FPS:</label>
          <span>{{ renderMetrics.fps }}</span>
        </div>
        
        <div class="metric">
          <label>Memory Usage:</label>
          <span>{{ memoryMetrics.used }}MB / {{ memoryMetrics.total }}MB</span>
        </div>
        
        <div class="metric">
          <label>DOM Nodes:</label>
          <span>{{ domMetrics.nodeCount }}</span>
        </div>
      </div>
      
      <div class="performance-chart">
        <!-- Performance graph would go here -->
      </div>
    </div>
  `
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  renderMetrics = {
    renderTime: 0,
    fps: 0,
    frameCount: 0,
    lastFrameTime: 0
  };

  memoryMetrics = {
    used: 0,
    total: 0,
    limit: 0
  };

  domMetrics = {
    nodeCount: 0,
    elementCount: 0
  };

  private monitoring = true;
  private animationFrame?: number;

  ngOnInit() {
    this.startMonitoring();
  }

  ngOnDestroy() {
    this.stopMonitoring();
  }

  private startMonitoring() {
    // Monitor rendering performance
    const measureRender = () => {
      if (!this.monitoring) return;

      const now = performance.now();
      if (this.renderMetrics.lastFrameTime > 0) {
        const frameDelta = now - this.renderMetrics.lastFrameTime;
        this.renderMetrics.fps = Math.round(1000 / frameDelta);
      }
      this.renderMetrics.lastFrameTime = now;
      
      this.animationFrame = requestAnimationFrame(measureRender);
    };

    measureRender();

    // Monitor memory usage
    setInterval(() => {
      this.updateMemoryMetrics();
      this.updateDOMMetrics();
    }, 1000);
  }

  private updateMemoryMetrics() {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      this.memoryMetrics = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
  }

  private updateDOMMetrics() {
    this.domMetrics = {
      nodeCount: document.querySelectorAll('*').length,
      elementCount: document.getElementsByTagName('*').length
    };
  }

  private stopMonitoring() {
    this.monitoring = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
```

## Best Practices for Large Datasets

### 1. Virtual Scrolling Configuration

```typescript
// Optimal settings for different dataset sizes
const getOptimalConfig = (dataSize: number): GridConfig => {
  if (dataSize < 1000) {
    return {
      virtualScrolling: false,
      pagination: false
    };
  } else if (dataSize < 10000) {
    return {
      virtualScrolling: true,
      bufferSize: 5,
      rowHeight: 40
    };
  } else {
    return {
      virtualScrolling: true,
      bufferSize: 3,
      rowHeight: 35, // Smaller rows for more in viewport
      // Disable expensive features
      selectable: false,
      filterable: false
    };
  }
};
```

### 2. Data Preprocessing

```typescript
// Preprocess data for optimal rendering
private optimizeDataForRendering(data: any[]): any[] {
  return data.map(item => ({
    ...item,
    // Pre-calculate display values
    _displayName: `${item.firstName} ${item.lastName}`,
    _formattedSalary: this.formatCurrency(item.salary),
    _statusClass: `status-${item.status.toLowerCase()}`
  }));
}
```

### 3. Column Optimization

```typescript
// Minimal column configuration for performance
const performanceColumns: ColumnDefinition[] = [
  {
    id: 'id',
    field: 'id',
    header: 'ID',
    type: 'number',
    width: 80,
    // Disable unnecessary features
    sortable: false,
    filterable: false,
    resizable: false,
    cellEditor: false
  }
  // ... other streamlined columns
];
```

## Next Steps

1. **[Real-time Updates](./real-time-updates.md)** - Handle live data with large datasets
2. **[Performance Optimization](../advanced/performance-optimization.md)** - Advanced optimization techniques
3. **[Server Integration](../recipes/server-integration.md)** - Complete server-side patterns
4. **[Testing](../advanced/testing.md)** - Testing strategies for large dataset grids