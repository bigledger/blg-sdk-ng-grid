# Sorting and Filtering

Comprehensive guide to implementing sorting and filtering capabilities in BlgGrid.

## Column Sorting

### Basic Sorting Configuration

Enable sorting globally or per column:

```typescript
import { Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

@Component({
  selector: 'app-sortable-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid 
      [data]="data" 
      [columns]="columns" 
      [config]="config"
      (columnSort)="onColumnSort($event)">
    </blg-grid>
  `
})
export class SortableGridComponent {
  data = [
    { id: 1, name: 'Alice Johnson', age: 28, salary: 65000, department: 'Engineering' },
    { id: 2, name: 'Bob Smith', age: 34, salary: 75000, department: 'Marketing' },
    { id: 3, name: 'Charlie Brown', age: 31, salary: 55000, department: 'Sales' }
  ];

  columns: ColumnDefinition[] = [
    { 
      id: 'id', 
      field: 'id', 
      header: 'ID', 
      type: 'number',
      sortable: true,
      width: 80 
    },
    { 
      id: 'name', 
      field: 'name', 
      header: 'Name', 
      type: 'string',
      sortable: true 
    },
    { 
      id: 'age', 
      field: 'age', 
      header: 'Age', 
      type: 'number',
      sortable: true,
      width: 100 
    },
    { 
      id: 'salary', 
      field: 'salary', 
      header: 'Salary', 
      type: 'number',
      sortable: true,
      align: 'right' 
    },
    { 
      id: 'department', 
      field: 'department', 
      header: 'Department', 
      type: 'string',
      sortable: false // Disable sorting for this column
    }
  ];

  config: GridConfig = {
    sortable: true, // Global sorting enable
    selectable: true
  };

  onColumnSort(event: any) {
    console.log(`Column ${event.data.columnId} sorted ${event.data.direction}`);
  }
}
```

### Data Type Sorting

Different data types have specific sorting behaviors:

```typescript
@Component({
  selector: 'app-data-type-sorting',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid [data]="mixedData" [columns]="mixedColumns" [config]="config">
    </blg-grid>
  `
})
export class DataTypeSortingComponent {
  mixedData = [
    {
      id: 1,
      name: 'Product A',
      price: 299.99,
      releaseDate: new Date('2024-01-15'),
      inStock: true,
      rating: 4.5,
      tags: 'electronics,gadget'
    },
    {
      id: 2,
      name: 'Product B',
      price: 199.99,
      releaseDate: new Date('2023-12-01'),
      inStock: false,
      rating: 3.8,
      tags: 'accessory,mobile'
    },
    {
      id: 3,
      name: 'Product C',
      price: 399.99,
      releaseDate: new Date('2024-03-20'),
      inStock: true,
      rating: 4.9,
      tags: 'premium,electronics'
    }
  ];

  mixedColumns: ColumnDefinition[] = [
    { 
      id: 'name', 
      field: 'name', 
      header: 'Product Name',
      type: 'string', // Alphabetical sorting (locale-aware)
      sortable: true 
    },
    { 
      id: 'price', 
      field: 'price', 
      header: 'Price',
      type: 'number', // Numerical sorting
      sortable: true,
      align: 'right'
    },
    { 
      id: 'releaseDate', 
      field: 'releaseDate', 
      header: 'Release Date',
      type: 'date', // Chronological sorting
      sortable: true 
    },
    { 
      id: 'inStock', 
      field: 'inStock', 
      header: 'In Stock',
      type: 'boolean', // Boolean sorting (false first, then true)
      sortable: true,
      align: 'center' 
    },
    { 
      id: 'rating', 
      field: 'rating', 
      header: 'Rating',
      type: 'number',
      sortable: true,
      align: 'center'
    }
  ];

  config: GridConfig = {
    sortable: true,
    selectable: true
  };
}
```

### Custom Sort Functions

For complex sorting logic, implement custom sort comparators:

```typescript
interface Employee {
  id: number;
  name: string;
  position: string;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  salary: number;
}

@Component({
  selector: 'app-custom-sorting',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid 
      [data]="sortedData" 
      [columns]="columns" 
      [config]="config"
      (columnSort)="handleCustomSort($event)">
    </blg-grid>
  `
})
export class CustomSortingComponent {
  employees: Employee[] = [
    { id: 1, name: 'Alice', position: 'Developer', level: 'Senior', salary: 90000 },
    { id: 2, name: 'Bob', position: 'Designer', level: 'Mid', salary: 65000 },
    { id: 3, name: 'Charlie', position: 'Developer', level: 'Lead', salary: 110000 },
    { id: 4, name: 'Diana', position: 'Manager', level: 'Senior', salary: 95000 }
  ];

  sortedData = [...this.employees];
  currentSort: { columnId: string; direction: 'asc' | 'desc' } | null = null;

  // Define level hierarchy for custom sorting
  private levelHierarchy: Record<string, number> = {
    'Junior': 1,
    'Mid': 2,
    'Senior': 3,
    'Lead': 4
  };

  columns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', type: 'number', sortable: true, width: 80 },
    { id: 'name', field: 'name', header: 'Name', type: 'string', sortable: true },
    { id: 'position', field: 'position', header: 'Position', type: 'string', sortable: true },
    { 
      id: 'level', 
      field: 'level', 
      header: 'Level', 
      type: 'custom', // Custom type for special sorting
      sortable: true 
    },
    { 
      id: 'salary', 
      field: 'salary', 
      header: 'Salary', 
      type: 'number', 
      sortable: true, 
      align: 'right' 
    }
  ];

  config: GridConfig = {
    sortable: true,
    selectable: true
  };

  handleCustomSort(event: any) {
    const { columnId, direction } = event.data;
    
    if (!direction) {
      // Reset to original order
      this.sortedData = [...this.employees];
      this.currentSort = null;
      return;
    }

    this.currentSort = { columnId, direction };
    
    this.sortedData = [...this.employees].sort((a, b) => {
      let result = 0;
      
      switch (columnId) {
        case 'level':
          // Custom level sorting
          result = this.levelHierarchy[a.level] - this.levelHierarchy[b.level];
          break;
        case 'name':
          // Case-insensitive string sorting
          result = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          break;
        case 'salary':
          result = a.salary - b.salary;
          break;
        case 'position':
          result = a.position.localeCompare(b.position);
          break;
        default:
          result = 0;
      }
      
      return direction === 'desc' ? -result : result;
    });
  }
}
```

## Column Filtering

### Basic Filtering Setup

Enable filtering with automatic filter controls:

```typescript
@Component({
  selector: 'app-filterable-grid',
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
export class FilterableGridComponent {
  data = [
    { id: 1, name: 'iPhone 15', category: 'Electronics', price: 999, inStock: true },
    { id: 2, name: 'Samsung Galaxy', category: 'Electronics', price: 849, inStock: true },
    { id: 3, name: 'MacBook Pro', category: 'Computers', price: 1999, inStock: false },
    { id: 4, name: 'iPad Air', category: 'Tablets', price: 599, inStock: true }
  ];

  columns: ColumnDefinition[] = [
    { 
      id: 'name', 
      field: 'name', 
      header: 'Product Name',
      type: 'string',
      filterable: true,
      sortable: true
    },
    { 
      id: 'category', 
      field: 'category', 
      header: 'Category',
      type: 'string',
      filterable: true,
      sortable: true
    },
    { 
      id: 'price', 
      field: 'price', 
      header: 'Price',
      type: 'number',
      filterable: true,
      sortable: true,
      align: 'right'
    },
    { 
      id: 'inStock', 
      field: 'inStock', 
      header: 'In Stock',
      type: 'boolean',
      filterable: true,
      sortable: true,
      align: 'center'
    }
  ];

  config: GridConfig = {
    filterable: true, // Global filtering enable
    sortable: true,
    selectable: true
  };
}
```

### Filter Types by Data Type

Different column types have different filter behaviors:

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  releaseDate: Date;
  isAvailable: boolean;
  category: 'Electronics' | 'Clothing' | 'Books' | 'Home';
  rating: number;
}

@Component({
  selector: 'app-filter-types',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="filter-info">
      <h4>Filter Types by Data Type:</h4>
      <ul>
        <li><strong>String:</strong> Case-insensitive contains search</li>
        <li><strong>Number:</strong> Exact match or range filtering</li>
        <li><strong>Date:</strong> Date range or specific date</li>
        <li><strong>Boolean:</strong> True/False toggle</li>
      </ul>
    </div>
    <blg-grid 
      [data]="products" 
      [columns]="columns" 
      [config]="config">
    </blg-grid>
  `,
  styles: [`
    .filter-info {
      background: #f8f9fa;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .filter-info ul {
      margin: 10px 0 0 0;
      padding-left: 20px;
    }
  `]
})
export class FilterTypesComponent {
  products: Product[] = [
    {
      id: 1,
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 299.99,
      discountPercent: 10,
      releaseDate: new Date('2024-01-15'),
      isAvailable: true,
      category: 'Electronics',
      rating: 4.5
    },
    {
      id: 2,
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt in various colors',
      price: 24.99,
      discountPercent: 0,
      releaseDate: new Date('2023-11-20'),
      isAvailable: true,
      category: 'Clothing',
      rating: 4.2
    },
    {
      id: 3,
      name: 'Programming Book',
      description: 'Learn advanced programming techniques',
      price: 49.99,
      discountPercent: 15,
      releaseDate: new Date('2024-02-01'),
      isAvailable: false,
      category: 'Books',
      rating: 4.8
    }
  ];

  columns: ColumnDefinition[] = [
    { 
      id: 'name', 
      field: 'name', 
      header: 'Product Name',
      type: 'string',
      filterable: true,
      sortable: true,
      width: 200
    },
    { 
      id: 'description', 
      field: 'description', 
      header: 'Description',
      type: 'string',
      filterable: true, // Text search in descriptions
      sortable: false,
      width: 300
    },
    { 
      id: 'price', 
      field: 'price', 
      header: 'Price ($)',
      type: 'number',
      filterable: true, // Exact number match
      sortable: true,
      align: 'right',
      width: 120
    },
    { 
      id: 'category', 
      field: 'category', 
      header: 'Category',
      type: 'string',
      filterable: true, // Dropdown or text filter
      sortable: true,
      width: 120
    },
    { 
      id: 'releaseDate', 
      field: 'releaseDate', 
      header: 'Release Date',
      type: 'date',
      filterable: true, // Date picker filter
      sortable: true,
      width: 140
    },
    { 
      id: 'isAvailable', 
      field: 'isAvailable', 
      header: 'Available',
      type: 'boolean',
      filterable: true, // Checkbox filter
      sortable: true,
      align: 'center',
      width: 100
    },
    { 
      id: 'rating', 
      field: 'rating', 
      header: 'Rating',
      type: 'number',
      filterable: true, // Number range filter
      sortable: true,
      align: 'center',
      width: 100
    }
  ];

  config: GridConfig = {
    filterable: true,
    sortable: true,
    selectable: true,
    rowHeight: 50
  };
}
```

### Programmatic Filtering

Control filters programmatically using the GridStateService:

```typescript
import { Component, ViewChild } from '@angular/core';
import { GridStateService } from '@blg-grid/core';
import { Grid } from '@blg-grid/grid';

@Component({
  selector: 'app-programmatic-filters',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="filter-controls">
      <h4>Quick Filters:</h4>
      <button (click)="filterByCategory('Electronics')">Electronics Only</button>
      <button (click)="filterByPrice(500)">Under $500</button>
      <button (click)="filterAvailable()">Available Only</button>
      <button (click)="clearAllFilters()">Clear All Filters</button>
    </div>
    
    <div class="active-filters" *ngIf="hasActiveFilters()">
      <h5>Active Filters:</h5>
      <div class="filter-tags">
        <span *ngFor="let filter of getActiveFilters()" 
              class="filter-tag">
          {{ filter.column }}: {{ filter.value }}
          <button (click)="removeFilter(filter.column)">&times;</button>
        </span>
      </div>
    </div>

    <blg-grid 
      [data]="data" 
      [columns]="columns" 
      [config]="config"
      #grid>
    </blg-grid>
  `,
  styles: [`
    .filter-controls {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .filter-controls button {
      margin-right: 10px;
      margin-bottom: 5px;
      padding: 5px 10px;
      border: 1px solid #007bff;
      background: white;
      color: #007bff;
      cursor: pointer;
      border-radius: 3px;
    }
    .filter-controls button:hover {
      background: #007bff;
      color: white;
    }
    .active-filters {
      margin-bottom: 15px;
    }
    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .filter-tag {
      background: #007bff;
      color: white;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 12px;
    }
    .filter-tag button {
      background: none;
      border: none;
      color: white;
      margin-left: 5px;
      cursor: pointer;
      font-weight: bold;
    }
  `]
})
export class ProgrammaticFiltersComponent {
  @ViewChild('grid', { static: true }) grid!: Grid;

  data = [
    { id: 1, name: 'Smartphone', category: 'Electronics', price: 699, available: true },
    { id: 2, name: 'Laptop', category: 'Electronics', price: 1299, available: false },
    { id: 3, name: 'T-Shirt', category: 'Clothing', price: 29, available: true },
    { id: 4, name: 'Jeans', category: 'Clothing', price: 89, available: true },
    { id: 5, name: 'Tablet', category: 'Electronics', price: 399, available: true },
    { id: 6, name: 'Sneakers', category: 'Footwear', price: 129, available: false }
  ];

  columns: ColumnDefinition[] = [
    { id: 'name', field: 'name', header: 'Product', type: 'string', filterable: true },
    { id: 'category', field: 'category', header: 'Category', type: 'string', filterable: true },
    { id: 'price', field: 'price', header: 'Price', type: 'number', filterable: true, align: 'right' },
    { id: 'available', field: 'available', header: 'Available', type: 'boolean', filterable: true }
  ];

  config: GridConfig = {
    filterable: true,
    sortable: true,
    selectable: true
  };

  constructor(private gridState: GridStateService) {}

  filterByCategory(category: string) {
    this.gridState.updateFilter('category', category);
  }

  filterByPrice(maxPrice: number) {
    // For demonstration - in real implementation, you'd need custom filter logic
    this.gridState.updateFilter('price', maxPrice);
  }

  filterAvailable() {
    this.gridState.updateFilter('available', true);
  }

  clearAllFilters() {
    this.gridState.clearFilters();
  }

  removeFilter(columnId: string) {
    this.gridState.updateFilter(columnId, null);
  }

  hasActiveFilters(): boolean {
    const filters = this.gridState.filterState();
    return Object.keys(filters).some(key => filters[key] !== null && filters[key] !== undefined);
  }

  getActiveFilters(): { column: string; value: any }[] {
    const filters = this.gridState.filterState();
    return Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([column, value]) => ({ column, value }));
  }
}
```

### Advanced Filter Components

Create custom filter components for complex filtering needs:

```typescript
// Custom range filter component
@Component({
  selector: 'app-range-filter',
  standalone: true,
  template: `
    <div class="range-filter">
      <input type="number" 
             [(ngModel)]="minValue" 
             (ngModelChange)="updateFilter()"
             placeholder="Min">
      <span>-</span>
      <input type="number" 
             [(ngModel)]="maxValue" 
             (ngModelChange)="updateFilter()"
             placeholder="Max">
      <button (click)="clearFilter()">&times;</button>
    </div>
  `,
  styles: [`
    .range-filter {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .range-filter input {
      width: 80px;
      padding: 4px;
      border: 1px solid #ccc;
      border-radius: 3px;
    }
    .range-filter button {
      background: #dc3545;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
    }
  `]
})
export class RangeFilterComponent {
  @Input() columnId!: string;
  @Output() filterChange = new EventEmitter<{min?: number, max?: number}>();

  minValue?: number;
  maxValue?: number;

  updateFilter() {
    this.filterChange.emit({
      min: this.minValue,
      max: this.maxValue
    });
  }

  clearFilter() {
    this.minValue = undefined;
    this.maxValue = undefined;
    this.filterChange.emit({});
  }
}

// Multi-select filter component
@Component({
  selector: 'app-multiselect-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="multiselect-filter">
      <button (click)="toggleDropdown()" class="dropdown-toggle">
        {{ getDisplayText() }}
      </button>
      <div class="dropdown-menu" [class.show]="showDropdown">
        <label *ngFor="let option of options" class="option">
          <input type="checkbox" 
                 [checked]="selectedValues.has(option.value)"
                 (change)="toggleOption(option.value)">
          {{ option.label }}
        </label>
        <div class="dropdown-actions">
          <button (click)="selectAll()">All</button>
          <button (click)="selectNone()">None</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .multiselect-filter {
      position: relative;
    }
    .dropdown-toggle {
      padding: 6px 12px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
      border-radius: 3px;
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ccc;
      border-radius: 3px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      display: none;
      max-height: 200px;
      overflow-y: auto;
    }
    .dropdown-menu.show {
      display: block;
    }
    .option {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
    }
    .option:hover {
      background: #f5f5f5;
    }
    .option input {
      margin-right: 8px;
    }
    .dropdown-actions {
      border-top: 1px solid #eee;
      padding: 8px;
      display: flex;
      gap: 8px;
    }
    .dropdown-actions button {
      flex: 1;
      padding: 4px 8px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
      border-radius: 3px;
      font-size: 12px;
    }
  `]
})
export class MultiselectFilterComponent {
  @Input() options: {value: any, label: string}[] = [];
  @Input() columnId!: string;
  @Output() filterChange = new EventEmitter<any[]>();

  selectedValues = new Set<any>();
  showDropdown = false;

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleOption(value: any) {
    if (this.selectedValues.has(value)) {
      this.selectedValues.delete(value);
    } else {
      this.selectedValues.add(value);
    }
    this.filterChange.emit(Array.from(this.selectedValues));
  }

  selectAll() {
    this.selectedValues = new Set(this.options.map(o => o.value));
    this.filterChange.emit(Array.from(this.selectedValues));
  }

  selectNone() {
    this.selectedValues.clear();
    this.filterChange.emit([]);
  }

  getDisplayText(): string {
    const count = this.selectedValues.size;
    if (count === 0) return 'All';
    if (count === 1) return this.options.find(o => this.selectedValues.has(o.value))?.label || '';
    return `${count} selected`;
  }
}
```

## Combined Sorting and Filtering

### Real-world Example

Complete example showing sorting and filtering together:

```typescript
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  startDate: Date;
  isActive: boolean;
}

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [Grid, CommonModule],
  template: `
    <div class="grid-controls">
      <div class="quick-filters">
        <h4>Quick Actions:</h4>
        <button (click)="showActiveOnly()">Active Employees</button>
        <button (click)="showHighEarners()">High Earners (>$80k)</button>
        <button (click)="showRecentHires()">Recent Hires (Last Year)</button>
        <button (click)="resetView()">Reset View</button>
      </div>
      
      <div class="sort-info" *ngIf="currentSort">
        <strong>Sorted by:</strong> {{ getSortDisplayName() }} ({{ currentSort.direction }})
      </div>
    </div>

    <blg-grid 
      [data]="displayData" 
      [columns]="columns" 
      [config]="config"
      (columnSort)="handleSort($event)">
    </blg-grid>

    <div class="grid-footer">
      <span>Showing {{ displayData.length }} of {{ allEmployees.length }} employees</span>
    </div>
  `,
  styles: [`
    .grid-controls {
      background: #f8f9fa;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .quick-filters button {
      margin-right: 10px;
      margin-bottom: 5px;
      padding: 6px 12px;
      border: 1px solid #007bff;
      background: white;
      color: #007bff;
      cursor: pointer;
      border-radius: 3px;
    }
    .quick-filters button:hover {
      background: #007bff;
      color: white;
    }
    .sort-info {
      margin-top: 10px;
      padding: 8px;
      background: #e9ecef;
      border-radius: 3px;
      font-size: 14px;
    }
    .grid-footer {
      margin-top: 15px;
      padding: 10px;
      background: #f8f9fa;
      text-align: center;
      border-radius: 4px;
    }
  `]
})
export class EmployeeManagementComponent {
  allEmployees: Employee[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      position: 'Senior Developer',
      salary: 95000,
      startDate: new Date('2022-03-15'),
      isActive: true
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      department: 'Marketing',
      position: 'Marketing Manager',
      salary: 85000,
      startDate: new Date('2023-08-20'),
      isActive: true
    },
    // ... more employee data
  ];

  displayData = [...this.allEmployees];
  currentSort: { columnId: string; direction: 'asc' | 'desc' } | null = null;
  activeFilters: Record<string, any> = {};

  columns: ColumnDefinition[] = [
    { 
      id: 'fullName', 
      field: 'fullName', 
      header: 'Full Name',
      type: 'string',
      sortable: true,
      filterable: true,
      width: 180
    },
    { 
      id: 'email', 
      field: 'email', 
      header: 'Email',
      type: 'string',
      sortable: true,
      filterable: true,
      width: 250
    },
    { 
      id: 'department', 
      field: 'department', 
      header: 'Department',
      type: 'string',
      sortable: true,
      filterable: true,
      width: 130
    },
    { 
      id: 'position', 
      field: 'position', 
      header: 'Position',
      type: 'string',
      sortable: true,
      filterable: true,
      width: 150
    },
    { 
      id: 'salary', 
      field: 'salary', 
      header: 'Salary',
      type: 'number',
      sortable: true,
      filterable: true,
      align: 'right',
      width: 120
    },
    { 
      id: 'startDate', 
      field: 'startDate', 
      header: 'Start Date',
      type: 'date',
      sortable: true,
      filterable: true,
      width: 130
    },
    { 
      id: 'isActive', 
      field: 'isActive', 
      header: 'Active',
      type: 'boolean',
      sortable: true,
      filterable: true,
      align: 'center',
      width: 80
    }
  ];

  config: GridConfig = {
    sortable: true,
    filterable: true,
    selectable: true,
    virtualScrolling: true,
    rowHeight: 40
  };

  ngOnInit() {
    // Prepare display data with computed fields
    this.prepareDisplayData();
  }

  prepareDisplayData() {
    this.displayData = this.allEmployees.map(emp => ({
      ...emp,
      fullName: `${emp.firstName} ${emp.lastName}`
    }));
  }

  handleSort(event: any) {
    const { columnId, direction } = event.data;
    
    if (!direction) {
      this.currentSort = null;
      this.applyFiltersAndSort();
      return;
    }

    this.currentSort = { columnId, direction };
    this.applyFiltersAndSort();
  }

  showActiveOnly() {
    this.activeFilters = { isActive: true };
    this.applyFiltersAndSort();
  }

  showHighEarners() {
    this.activeFilters = { salaryMin: 80000 };
    this.applyFiltersAndSort();
  }

  showRecentHires() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    this.activeFilters = { startDateAfter: oneYearAgo };
    this.applyFiltersAndSort();
  }

  resetView() {
    this.activeFilters = {};
    this.currentSort = null;
    this.prepareDisplayData();
  }

  getSortDisplayName(): string {
    if (!this.currentSort) return '';
    const column = this.columns.find(c => c.id === this.currentSort!.columnId);
    return column?.header || this.currentSort.columnId;
  }

  private applyFiltersAndSort() {
    let filtered = [...this.allEmployees];

    // Apply filters
    Object.entries(this.activeFilters).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      filtered = filtered.filter(emp => {
        switch (key) {
          case 'isActive':
            return emp.isActive === value;
          case 'salaryMin':
            return emp.salary >= value;
          case 'startDateAfter':
            return emp.startDate >= value;
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (this.currentSort) {
      filtered.sort((a, b) => {
        let result = 0;
        const { columnId, direction } = this.currentSort!;

        switch (columnId) {
          case 'fullName':
            result = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            break;
          case 'email':
            result = a.email.localeCompare(b.email);
            break;
          case 'department':
            result = a.department.localeCompare(b.department);
            break;
          case 'position':
            result = a.position.localeCompare(b.position);
            break;
          case 'salary':
            result = a.salary - b.salary;
            break;
          case 'startDate':
            result = a.startDate.getTime() - b.startDate.getTime();
            break;
          case 'isActive':
            result = (a.isActive === b.isActive) ? 0 : a.isActive ? 1 : -1;
            break;
        }

        return direction === 'desc' ? -result : result;
      });
    }

    // Update display data
    this.displayData = filtered.map(emp => ({
      ...emp,
      fullName: `${emp.firstName} ${emp.lastName}`
    }));
  }
}
```

## Performance Considerations

### Optimizing Large Datasets

```typescript
@Component({
  selector: 'app-performance-optimized',
  template: `
    <div class="performance-metrics">
      <span>Dataset: {{ totalRecords.toLocaleString() }} records</span>
      <span>Filtered: {{ filteredCount.toLocaleString() }} records</span>
      <span>Filter time: {{ filterTime }}ms</span>
    </div>
    <blg-grid [data]="optimizedData" [columns]="columns" [config]="config">
    </blg-grid>
  `
})
export class PerformanceOptimizedComponent {
  totalRecords = 100000;
  filteredCount = 0;
  filterTime = 0;
  optimizedData: any[] = [];

  // Use indexes for faster filtering
  private departmentIndex = new Map<string, number[]>();
  private salaryRangeIndex = new Map<string, number[]>();

  ngOnInit() {
    this.generateLargeDataset();
    this.buildIndexes();
  }

  private buildIndexes() {
    // Build indexes for common filter fields
    this.largeDataset.forEach((item, index) => {
      // Department index
      if (!this.departmentIndex.has(item.department)) {
        this.departmentIndex.set(item.department, []);
      }
      this.departmentIndex.get(item.department)!.push(index);

      // Salary range index
      const range = this.getSalaryRange(item.salary);
      if (!this.salaryRangeIndex.has(range)) {
        this.salaryRangeIndex.set(range, []);
      }
      this.salaryRangeIndex.get(range)!.push(index);
    });
  }

  private getSalaryRange(salary: number): string {
    if (salary < 50000) return '0-50k';
    if (salary < 100000) return '50-100k';
    if (salary < 150000) return '100-150k';
    return '150k+';
  }

  private performOptimizedFilter(filters: any) {
    const startTime = performance.now();
    
    // Use indexes when possible
    let resultIndices: Set<number> | null = null;

    if (filters.department) {
      const deptIndices = this.departmentIndex.get(filters.department) || [];
      resultIndices = new Set(deptIndices);
    }

    if (filters.salaryRange) {
      const salaryIndices = this.salaryRangeIndex.get(filters.salaryRange) || [];
      if (resultIndices) {
        // Intersection
        resultIndices = new Set([...resultIndices].filter(i => salaryIndices.includes(i)));
      } else {
        resultIndices = new Set(salaryIndices);
      }
    }

    let filtered = resultIndices 
      ? Array.from(resultIndices).map(i => this.largeDataset[i])
      : this.largeDataset;

    // Apply remaining filters
    // ... other filter logic

    this.filterTime = Math.round(performance.now() - startTime);
    this.filteredCount = filtered.length;
    this.optimizedData = filtered;
  }
}
```

## Best Practices

### Sorting Best Practices
- Implement stable sorting for consistent results
- Use locale-aware string comparison
- Handle null/undefined values gracefully
- Consider custom sort functions for complex data types

### Filtering Best Practices
- Debounce filter input for better performance
- Use indexes for large datasets
- Implement case-insensitive text searches
- Provide clear filter indicators to users

### Performance Tips
- Use virtual scrolling for large filtered results
- Implement server-side filtering for very large datasets
- Build indexes for commonly filtered columns
- Consider pagination combined with filtering

## Next Steps

- [Virtual Scrolling](./virtual-scrolling.md) - Performance optimization
- [Cell Editing](./cell-editing.md) - Inline editing features
- [Row Selection](./row-selection.md) - Selection capabilities
- [Event Handling](./event-handling.md) - Responding to user interactions