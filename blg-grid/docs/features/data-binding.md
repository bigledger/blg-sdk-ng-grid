# Data Binding

Learn how to bind different types of data to BlgGrid, including static arrays, observables, and real-time data sources.

## Basic Data Binding

### Static Array

The simplest way to provide data to the grid:

```typescript
import { Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition } from '@blg-grid/core';

@Component({
  selector: 'app-static-data',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid 
      [data]="staticData" 
      [columns]="columns">
    </blg-grid>
  `
})
export class StaticDataComponent {
  staticData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
  ];

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
    { id: 'name', field: 'name', header: 'Name', type: 'string' },
    { id: 'email', field: 'email', header: 'Email', type: 'string' },
    { id: 'age', field: 'age', header: 'Age', type: 'number', width: 100 }
  ];
}
```

### Observable Data

For dynamic data that changes over time:

```typescript
import { Component, OnInit } from '@angular/core';
import { Observable, interval, map, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition } from '@blg-grid/core';

interface UserData {
  id: number;
  name: string;
  lastSeen: Date;
  status: 'online' | 'offline';
}

@Component({
  selector: 'app-observable-data',
  standalone: true,
  imports: [Grid, AsyncPipe],
  template: `
    <blg-grid 
      [data]="userData$ | async || []" 
      [columns]="columns">
    </blg-grid>
  `
})
export class ObservableDataComponent implements OnInit {
  userData$!: Observable<UserData[]>;

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
    { id: 'name', field: 'name', header: 'Name', type: 'string' },
    { id: 'lastSeen', field: 'lastSeen', header: 'Last Seen', type: 'date' },
    { id: 'status', field: 'status', header: 'Status', type: 'string', width: 100 }
  ];

  ngOnInit() {
    // Simulate real-time data updates every 5 seconds
    this.userData$ = interval(5000).pipe(
      startWith(0),
      map(() => this.generateUserData())
    );
  }

  private generateUserData(): UserData[] {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      lastSeen: new Date(Date.now() - Math.random() * 86400000), // Random within last day
      status: Math.random() > 0.3 ? 'online' : 'offline'
    }));
  }
}
```

## HTTP Data Sources

### Service-Based Data Loading

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  salary: number;
  startDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'https://api.example.com/employees';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployeesPaginated(page: number, size: number): Observable<{data: Employee[], total: number}> {
    return this.http.get<{data: Employee[], total: number}>(
      `${this.apiUrl}?page=${page}&size=${size}`
    );
  }

  searchEmployees(query: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/search?q=${query}`);
  }
}
```

### Component Using HTTP Data

```typescript
import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition } from '@blg-grid/core';
import { Employee, EmployeeService } from './employee.service';

@Component({
  selector: 'app-employee-grid',
  standalone: true,
  imports: [Grid, AsyncPipe],
  template: `
    <div class="loading" *ngIf="loading">Loading employees...</div>
    <blg-grid 
      [data]="employees$ | async || []" 
      [columns]="columns"
      (gridEvent)="onGridEvent($event)">
    </blg-grid>
  `
})
export class EmployeeGridComponent implements OnInit {
  employees$!: Observable<Employee[]>;
  loading = true;

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
    { 
      id: 'fullName', 
      field: 'firstName', // We'll combine firstName + lastName
      header: 'Full Name', 
      type: 'string',
      width: 200 
    },
    { id: 'email', field: 'email', header: 'Email', type: 'string' },
    { id: 'department', field: 'department', header: 'Department', type: 'string' },
    { 
      id: 'salary', 
      field: 'salary', 
      header: 'Salary', 
      type: 'number', 
      align: 'right',
      width: 120 
    },
    { id: 'startDate', field: 'startDate', header: 'Start Date', type: 'date' }
  ];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.employees$ = this.employeeService.getEmployees();
    this.employees$.subscribe(() => {
      this.loading = false;
    });
  }

  onGridEvent(event: any) {
    console.log('Grid event:', event);
  }
}
```

## Complex Data Structures

### Nested Object Data

When your data contains nested objects, you can access them using dot notation:

```typescript
interface UserProfile {
  id: number;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  settings: {
    theme: string;
    notifications: boolean;
  };
}

@Component({
  selector: 'app-nested-data',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid 
      [data]="processedData" 
      [columns]="columns">
    </blg-grid>
  `
})
export class NestedDataComponent {
  rawData: UserProfile[] = [
    {
      id: 1,
      profile: { firstName: 'John', lastName: 'Doe', avatar: 'avatar1.jpg' },
      contact: { email: 'john@example.com', phone: '+1-555-0123' },
      settings: { theme: 'dark', notifications: true }
    }
    // More data...
  ];

  // Flatten nested data for grid consumption
  get processedData() {
    return this.rawData.map(user => ({
      id: user.id,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      fullName: `${user.profile.firstName} ${user.profile.lastName}`,
      email: user.contact.email,
      phone: user.contact.phone,
      theme: user.settings.theme,
      notifications: user.settings.notifications
    }));
  }

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
    { id: 'fullName', field: 'fullName', header: 'Name', type: 'string' },
    { id: 'email', field: 'email', header: 'Email', type: 'string' },
    { id: 'phone', field: 'phone', header: 'Phone', type: 'string' },
    { id: 'theme', field: 'theme', header: 'Theme', type: 'string' },
    { id: 'notifications', field: 'notifications', header: 'Notifications', type: 'boolean' }
  ];
}
```

### Array Data in Cells

When cells contain arrays, you can format them for display:

```typescript
interface Project {
  id: number;
  name: string;
  tags: string[];
  team: { name: string; role: string }[];
  milestones: Date[];
}

@Component({
  selector: 'app-array-data',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid 
      [data]="processedProjects" 
      [columns]="columns">
    </blg-grid>
  `
})
export class ArrayDataComponent {
  projects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      tags: ['web', 'design', 'ui'],
      team: [
        { name: 'Alice', role: 'Designer' },
        { name: 'Bob', role: 'Developer' }
      ],
      milestones: [
        new Date('2024-03-15'),
        new Date('2024-04-01'),
        new Date('2024-04-15')
      ]
    }
    // More projects...
  ];

  get processedProjects() {
    return this.projects.map(project => ({
      id: project.id,
      name: project.name,
      tagsDisplay: project.tags.join(', '),
      teamDisplay: project.team.map(member => `${member.name} (${member.role})`).join(', '),
      teamSize: project.team.length,
      nextMilestone: project.milestones.find(date => date > new Date()),
      totalMilestones: project.milestones.length
    }));
  }

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
    { id: 'name', field: 'name', header: 'Project', type: 'string' },
    { id: 'tags', field: 'tagsDisplay', header: 'Tags', type: 'string' },
    { id: 'teamSize', field: 'teamSize', header: 'Team Size', type: 'number', width: 100 },
    { id: 'nextMilestone', field: 'nextMilestone', header: 'Next Milestone', type: 'date' }
  ];
}
```

## Large Dataset Handling

### Virtual Scrolling with Large Data

```typescript
@Component({
  selector: 'app-large-dataset',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="info">
      Displaying {{ totalRows.toLocaleString() }} rows
    </div>
    <blg-grid 
      [data]="largeDataset" 
      [columns]="columns" 
      [config]="config">
    </blg-grid>
  `,
  styles: [`
    .info {
      padding: 10px;
      background: #f5f5f5;
      margin-bottom: 10px;
    }
  `]
})
export class LargeDatasetComponent {
  totalRows = 50000;
  
  // Generate large dataset
  largeDataset = Array.from({ length: this.totalRows }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    score: Math.floor(Math.random() * 1000),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
  }));

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 100 },
    { id: 'name', field: 'name', header: 'Name', type: 'string', width: 200 },
    { id: 'email', field: 'email', header: 'Email', type: 'string', width: 250 },
    { id: 'score', field: 'score', header: 'Score', type: 'number', width: 100 },
    { id: 'created', field: 'createdAt', header: 'Created', type: 'date', width: 150 }
  ];

  config = {
    virtualScrolling: true,
    rowHeight: 35,
    selectable: true,
    sortable: true,
    filterable: true
  };
}
```

### Server-Side Pagination

```typescript
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, switchMap } from 'rxjs';

@Component({
  selector: 'app-server-pagination',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="pagination-controls">
      <button (click)="previousPage()" [disabled]="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button (click)="nextPage()" [disabled]="currentPage === totalPages">Next</button>
    </div>
    <blg-grid 
      [data]="displayData" 
      [columns]="columns" 
      [config]="config">
    </blg-grid>
  `
})
export class ServerPaginationComponent implements OnInit {
  currentPage = 1;
  pageSize = 100;
  totalPages = 0;
  totalRecords = 0;
  displayData: any[] = [];

  private pageSubject = new BehaviorSubject<number>(1);
  private pageSizeSubject = new BehaviorSubject<number>(100);

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
    { id: 'name', field: 'name', header: 'Name', type: 'string' },
    { id: 'email', field: 'email', header: 'Email', type: 'string' }
  ];

  config = {
    virtualScrolling: false, // Disabled for pagination
    selectable: true,
    sortable: true
  };

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    combineLatest([this.pageSubject, this.pageSizeSubject])
      .pipe(
        switchMap(([page, size]) => 
          this.employeeService.getEmployeesPaginated(page, size)
        )
      )
      .subscribe(response => {
        this.displayData = response.data;
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(response.total / this.pageSize);
      });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageSubject.next(this.currentPage);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageSubject.next(this.currentPage);
    }
  }
}
```

## Real-Time Data Updates

### WebSocket Data

```typescript
import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RealtimeDataService {
  private socket$: WebSocketSubject<any>;
  private messagesSubject$ = new Subject();
  public messages$ = this.messagesSubject$.asObservable();

  constructor() {
    this.socket$ = webSocket('ws://localhost:8080/realtime-data');
    
    this.socket$.subscribe(
      msg => this.messagesSubject$.next(msg),
      err => console.error(err),
      () => console.warn('Completed!')
    );
  }

  sendMessage(msg: any) {
    this.socket$.next(msg);
  }

  close() {
    this.socket$.complete();
  }
}

@Component({
  selector: 'app-realtime-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="status">
      Connection: {{ connectionStatus }} | Updates: {{ updateCount }}
    </div>
    <blg-grid 
      [data]="realtimeData" 
      [columns]="columns" 
      [config]="config">
    </blg-grid>
  `
})
export class RealtimeGridComponent implements OnInit, OnDestroy {
  realtimeData: any[] = [];
  connectionStatus = 'connecting';
  updateCount = 0;

  columns: ColumnDefinition[] = [
    { id: 'timestamp', field: 'timestamp', header: 'Time', type: 'date' },
    { id: 'symbol', field: 'symbol', header: 'Symbol', type: 'string' },
    { id: 'price', field: 'price', header: 'Price', type: 'number', align: 'right' },
    { id: 'change', field: 'change', header: 'Change', type: 'number', align: 'right' }
  ];

  config = {
    virtualScrolling: true,
    rowHeight: 35,
    selectable: false,
    sortable: true
  };

  constructor(private realtimeService: RealtimeDataService) {}

  ngOnInit() {
    this.realtimeService.messages$.subscribe(data => {
      this.processRealtimeUpdate(data);
      this.updateCount++;
      this.connectionStatus = 'connected';
    });
  }

  ngOnDestroy() {
    this.realtimeService.close();
  }

  private processRealtimeUpdate(data: any) {
    // Update existing record or add new one
    const existingIndex = this.realtimeData.findIndex(
      item => item.symbol === data.symbol
    );
    
    if (existingIndex >= 0) {
      this.realtimeData[existingIndex] = { ...data };
    } else {
      this.realtimeData = [data, ...this.realtimeData];
    }
    
    // Keep only last 1000 records for performance
    if (this.realtimeData.length > 1000) {
      this.realtimeData = this.realtimeData.slice(0, 1000);
    }
  }
}
```

## Data Transformation

### Data Pipes and Formatting

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }
}

@Component({
  selector: 'app-formatted-data',
  standalone: true,
  imports: [Grid, CurrencyPipe],
  template: `
    <blg-grid 
      [data]="formattedData" 
      [columns]="columns">
    </blg-grid>
  `
})
export class FormattedDataComponent {
  rawData = [
    { id: 1, name: 'Product A', price: 29.99, tax: 0.08 },
    { id: 2, name: 'Product B', price: 49.99, tax: 0.08 }
  ];

  get formattedData() {
    return this.rawData.map(item => ({
      ...item,
      priceFormatted: this.currencyPipe.transform(item.price),
      taxAmount: this.currencyPipe.transform(item.price * item.tax),
      total: this.currencyPipe.transform(item.price * (1 + item.tax))
    }));
  }

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
    { id: 'name', field: 'name', header: 'Product', type: 'string' },
    { id: 'price', field: 'priceFormatted', header: 'Price', type: 'string', align: 'right' },
    { id: 'tax', field: 'taxAmount', header: 'Tax', type: 'string', align: 'right' },
    { id: 'total', field: 'total', header: 'Total', type: 'string', align: 'right' }
  ];

  constructor(private currencyPipe: CurrencyPipe) {}
}
```

## Best Practices

### Performance Optimization
- Use `trackBy` functions for large datasets
- Implement virtual scrolling for 1000+ rows
- Consider server-side pagination for very large datasets
- Minimize data transformations in getters

### Data Consistency
- Always provide consistent data structure
- Handle null/undefined values gracefully
- Use TypeScript interfaces for type safety
- Validate data before binding to grid

### Memory Management
- Unsubscribe from observables in `ngOnDestroy`
- Limit real-time data accumulation
- Use OnPush change detection where possible
- Clean up WebSocket connections

### User Experience
- Show loading states during data fetching
- Provide error handling for failed requests
- Implement proper pagination for large datasets
- Consider data refresh strategies

## Next Steps

- [Column Configuration](./column-configuration.md) - Advanced column setup
- [Sorting and Filtering](./sorting-filtering.md) - Data manipulation features
- [Virtual Scrolling](./virtual-scrolling.md) - Performance optimization
- [Event Handling](./event-handling.md) - Responding to user interactions