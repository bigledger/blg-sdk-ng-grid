# Code Examples

Comprehensive collection of working TypeScript examples for BlgGrid. Each example includes complete component code, StackBlitz demos, and detailed explanations.

## Live Examples

### Basic Examples
- [Simple Grid](./basic/simple-grid.md) - Minimal setup with static data
- [Data Binding](./basic/data-binding.md) - Different data binding approaches
- [Column Configuration](./basic/column-configuration.md) - Column setup and types

### Intermediate Examples
- [Sorting and Filtering](./intermediate/sorting-filtering.md) - Advanced data manipulation
- [Row Selection](./intermediate/row-selection.md) - Single and multiple selection
- [Cell Editing](./intermediate/cell-editing.md) - Inline editing capabilities
- [Virtual Scrolling](./intermediate/virtual-scrolling.md) - Performance optimization

### Advanced Examples
- [Custom Renderers](./advanced/custom-renderers.md) - Custom cell rendering
- [Real-time Updates](./advanced/real-time-data.md) - Live data integration
- [Server-side Integration](./advanced/server-integration.md) - API integration
- [Custom Themes](./advanced/custom-themes.md) - Theme customization

### Enterprise Examples
- [Employee Management](./enterprise/employee-management.md) - Complete CRUD application
- [Financial Dashboard](./enterprise/financial-dashboard.md) - Complex data visualization
- [Inventory System](./enterprise/inventory-system.md) - Real-world business application

## Quick Start Templates

### Stackblitz Templates

Click these links to open ready-to-use templates:

#### Basic Grid Template
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/your-org/blg-grid-templates/tree/main/basic-grid?title=BlgGrid%20Basic%20Template)

```typescript
// Basic template with sample data
import { Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

@Component({
  selector: 'app-basic-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid 
      [data]="data" 
      [columns]="columns" 
      [config]="config">
    </blg-grid>
  `
})
export class BasicGridComponent {
  data = [
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

  config: GridConfig = {
    selectable: true,
    sortable: true,
    filterable: true
  };
}
```

#### Advanced Grid Template
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/your-org/blg-grid-templates/tree/main/advanced-grid?title=BlgGrid%20Advanced%20Template)

```typescript
// Advanced template with features enabled
import { Component, OnInit } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  releaseDate: Date;
  rating: number;
}

@Component({
  selector: 'app-advanced-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="grid-container">
      <h2>Product Catalog</h2>
      <blg-grid 
        [data]="products" 
        [columns]="columns" 
        [config]="config"
        (rowSelect)="onRowSelect($event)"
        (cellClick)="onCellClick($event)">
      </blg-grid>
    </div>
  `,
  styles: [`
    .grid-container {
      height: 600px;
      padding: 20px;
    }
    h2 {
      margin-bottom: 20px;
    }
  `]
})
export class AdvancedGridComponent implements OnInit {
  products: Product[] = [];

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80, pinned: 'left' },
    { id: 'name', field: 'name', header: 'Product Name', type: 'string', width: 200 },
    { id: 'category', field: 'category', header: 'Category', type: 'string', width: 130 },
    { id: 'price', field: 'price', header: 'Price', type: 'number', width: 100, align: 'right' },
    { id: 'inStock', field: 'inStock', header: 'In Stock', type: 'boolean', width: 100, align: 'center' },
    { id: 'releaseDate', field: 'releaseDate', header: 'Release Date', type: 'date', width: 140 },
    { id: 'rating', field: 'rating', header: 'Rating', type: 'number', width: 100, align: 'center' }
  ];

  config: GridConfig = {
    virtualScrolling: true,
    rowHeight: 45,
    sortable: true,
    filterable: true,
    selectable: true,
    selectionMode: 'multiple',
    resizable: true,
    reorderable: true,
    showFooter: true
  };

  ngOnInit() {
    this.generateSampleData();
  }

  onRowSelect(event: any) {
    console.log('Row selected:', event);
  }

  onCellClick(event: any) {
    console.log('Cell clicked:', event);
  }

  private generateSampleData() {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
    const productNames = ['Smartphone', 'Laptop', 'T-Shirt', 'Novel', 'Chair', 'Ball'];
    
    this.products = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `${productNames[i % productNames.length]} ${i + 1}`,
      category: categories[i % categories.length],
      price: Math.round((Math.random() * 500 + 10) * 100) / 100,
      inStock: Math.random() > 0.2,
      releaseDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10
    }));
  }
}
```

### CodeSandbox Templates

#### Enterprise Dashboard Template
[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/blg-grid-enterprise-dashboard)

Complete enterprise application with:
- Multiple grid views
- Real-time data updates
- Custom cell renderers
- Advanced filtering
- Export functionality

## Example Categories

### 1. Basic Usage Examples

Simple examples for getting started:

```typescript
// Static Data Example
@Component({
  template: `<blg-grid [data]="staticData" [columns]="basicColumns"></blg-grid>`
})
export class StaticDataExample {
  staticData = [/* ... */];
  basicColumns = [/* ... */];
}

// Observable Data Example
@Component({
  template: `<blg-grid [data]="data$ | async" [columns]="columns"></blg-grid>`
})
export class ObservableDataExample {
  data$ = this.service.getData();
}
```

### 2. Configuration Examples

Different configuration scenarios:

```typescript
// Performance Optimized
config: GridConfig = {
  virtualScrolling: true,
  rowHeight: 35,
  filterable: false,
  reorderable: false
};

// Feature Rich
config: GridConfig = {
  sortable: true,
  filterable: true,
  selectable: true,
  selectionMode: 'multiple',
  resizable: true,
  reorderable: true,
  showFooter: true
};

// Read-Only
config: GridConfig = {
  sortable: true,
  selectable: false,
  filterable: false,
  resizable: false,
  reorderable: false
};
```

### 3. Data Integration Examples

Working with different data sources:

```typescript
// HTTP Service Integration
@Injectable()
export class DataService {
  constructor(private http: HttpClient) {}
  
  getUsers() {
    return this.http.get<User[]>('/api/users');
  }
  
  searchUsers(query: string) {
    return this.http.get<User[]>(`/api/users/search?q=${query}`);
  }
}

// WebSocket Real-time Data
@Injectable()
export class RealtimeService {
  private socket$ = webSocket('ws://localhost:8080/data');
  
  getRealtimeUpdates() {
    return this.socket$.asObservable();
  }
}

// GraphQL Integration
@Injectable()
export class GraphQLService {
  constructor(private apollo: Apollo) {}
  
  getProducts() {
    return this.apollo.watchQuery({
      query: gql`
        query GetProducts {
          products {
            id
            name
            price
            category
          }
        }
      `
    }).valueChanges;
  }
}
```

### 4. Custom Features Examples

Advanced customization examples:

```typescript
// Custom Cell Renderer
@Component({
  selector: 'status-renderer',
  template: `
    <span class="status-badge" [class]="getStatusClass()">
      {{ value }}
    </span>
  `
})
export class StatusRendererComponent implements CellRenderer {
  @Input() value: string;
  @Input() rowData: any;
  
  getStatusClass() {
    return `status-${this.value.toLowerCase()}`;
  }
}

// Custom Filter Component
@Component({
  selector: 'date-range-filter',
  template: `
    <input type="date" [(ngModel)]="startDate" (change)="updateFilter()">
    <input type="date" [(ngModel)]="endDate" (change)="updateFilter()">
  `
})
export class DateRangeFilterComponent {
  @Input() columnId: string;
  @Output() filterChange = new EventEmitter();
  
  startDate: string;
  endDate: string;
  
  updateFilter() {
    this.filterChange.emit({ start: this.startDate, end: this.endDate });
  }
}
```

## Interactive Demos

### Demo Applications

Each example includes:
- **Live Demo**: Working application you can interact with
- **Source Code**: Complete TypeScript/HTML/CSS code
- **Explanation**: Step-by-step breakdown
- **Variations**: Alternative implementations
- **Best Practices**: Tips and recommendations

### Feature Demonstrations

#### Virtual Scrolling Performance
```typescript
// Demo: 100,000 rows with smooth scrolling
@Component({
  template: `
    <div class="performance-demo">
      <h3>Virtual Scrolling Demo: {{ totalRows.toLocaleString() }} Rows</h3>
      <blg-grid [data]="largeDataset" [columns]="columns" [config]="perfConfig">
      </blg-grid>
    </div>
  `
})
export class VirtualScrollDemo {
  totalRows = 100000;
  largeDataset = this.generateLargeDataset();
  
  perfConfig = {
    virtualScrolling: true,
    rowHeight: 35,
    selectable: true
  };
  
  private generateLargeDataset() {
    return Array.from({ length: this.totalRows }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      score: Math.floor(Math.random() * 1000)
    }));
  }
}
```

#### Real-time Data Updates
```typescript
// Demo: Live data updates every second
@Component({
  template: `
    <div class="realtime-demo">
      <h3>Real-time Updates Demo</h3>
      <div class="stats">Updates: {{ updateCount }} | Last: {{ lastUpdate | date:'medium' }}</div>
      <blg-grid [data]="liveData" [columns]="columns" [config]="config">
      </blg-grid>
    </div>
  `
})
export class RealtimeDemo implements OnInit, OnDestroy {
  liveData: any[] = [];
  updateCount = 0;
  lastUpdate = new Date();
  private interval: any;
  
  ngOnInit() {
    this.initializeData();
    this.startUpdates();
  }
  
  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  
  private startUpdates() {
    this.interval = setInterval(() => {
      this.simulateDataUpdate();
      this.updateCount++;
      this.lastUpdate = new Date();
    }, 1000);
  }
  
  private simulateDataUpdate() {
    // Update random rows with new data
    const rowsToUpdate = Math.min(5, this.liveData.length);
    for (let i = 0; i < rowsToUpdate; i++) {
      const randomIndex = Math.floor(Math.random() * this.liveData.length);
      this.liveData[randomIndex] = {
        ...this.liveData[randomIndex],
        value: Math.random() * 1000,
        timestamp: new Date()
      };
    }
  }
}
```

## Usage Patterns

### Common Implementation Patterns

#### 1. Service Integration Pattern
```typescript
// Service Layer
@Injectable()
export class UserService {
  private apiUrl = '/api/users';
  
  getUsers() {
    return this.http.get<User[]>(this.apiUrl);
  }
  
  updateUser(user: User) {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }
}

// Component Layer
@Component({/* ... */})
export class UserGridComponent {
  users$ = this.userService.getUsers();
  
  onUserUpdate(user: User) {
    this.userService.updateUser(user).subscribe();
  }
}
```

#### 2. State Management Pattern
```typescript
// NgRx Integration
@Component({/* ... */})
export class StateGridComponent {
  users$ = this.store.select(selectUsers);
  loading$ = this.store.select(selectUsersLoading);
  
  ngOnInit() {
    this.store.dispatch(loadUsers());
  }
  
  onUserSelect(user: User) {
    this.store.dispatch(selectUser({ user }));
  }
}
```

#### 3. Form Integration Pattern
```typescript
// Reactive Forms Integration
@Component({
  template: `
    <form [formGroup]="filterForm">
      <input formControlName="searchTerm" placeholder="Search...">
      <select formControlName="category">
        <option value="">All Categories</option>
        <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
      </select>
    </form>
    <blg-grid [data]="filteredData$ | async" [columns]="columns">
    </blg-grid>
  `
})
export class FilteredGridComponent {
  filterForm = this.fb.group({
    searchTerm: [''],
    category: ['']
  });
  
  filteredData$ = combineLatest([
    this.dataService.getData(),
    this.filterForm.valueChanges.pipe(startWith({}))
  ]).pipe(
    map(([data, filters]) => this.applyFilters(data, filters))
  );
}
```

## Testing Examples

### Unit Testing
```typescript
describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Grid, GridComponent]
    });
    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
  });

  it('should display data correctly', () => {
    component.data = [{ id: 1, name: 'Test' }];
    component.columns = [
      { id: 'id', field: 'id', header: 'ID' },
      { id: 'name', field: 'name', header: 'Name' }
    ];
    fixture.detectChanges();
    
    const rows = fixture.debugElement.queryAll(By.css('.blg-grid__row'));
    expect(rows.length).toBe(1);
  });
});
```

### E2E Testing
```typescript
// Playwright/Cypress example
describe('Grid E2E Tests', () => {
  it('should sort columns when header is clicked', async () => {
    await page.goto('/grid-demo');
    
    // Click on name column header
    await page.click('[data-column-id="name"] .header-cell');
    
    // Verify sorting indicator
    await expect(page.locator('[data-column-id="name"] .sort-asc')).toBeVisible();
    
    // Verify data is sorted
    const firstRowName = await page.textContent('.blg-grid__row:first-child [data-column-id="name"]');
    expect(firstRowName).toBe('Alice'); // Assuming alphabetical sort
  });
});
```

## Next Steps

Explore specific example categories:
- [Basic Examples](./basic/) - Simple implementations
- [Intermediate Examples](./intermediate/) - Feature combinations
- [Advanced Examples](./advanced/) - Custom solutions
- [Enterprise Examples](./enterprise/) - Real-world applications

For implementation help:
- [API Reference](../api-reference/) - Complete API documentation
- [Feature Guides](../features/) - Detailed feature explanations
- [Troubleshooting](../guides/troubleshooting.md) - Common issues and solutions