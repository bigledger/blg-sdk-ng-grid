# Simple Grid Example

This example demonstrates how to create a basic grid with minimal configuration. Perfect for getting started with BLG Grid.

## Complete Working Example

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui/grid';
import { ColumnDefinition, GridConfig, CellClickEvent, RowSelectEvent } from '@ng-ui/core';

@Component({
  selector: 'app-simple-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="container">
      <h2>Simple Product Grid</h2>
      
      <ng-ui-lib 
        [data]="products" 
        [columns]="columns" 
        [config]="config"
        (cellClick)="onCellClick($event)"
        (rowSelect)="onRowSelect($event)">
      </ng-ui-lib>
      
      <div class="selection-info" *ngIf="selectedProduct">
        <h3>Selected Product</h3>
        <p><strong>Name:</strong> {{ selectedProduct.name }}</p>
        <p><strong>Price:</strong> {{ selectedProduct.price | currency }}</p>
        <p><strong>Category:</strong> {{ selectedProduct.category }}</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h2 {
      color: #333;
      margin-bottom: 20px;
    }
    
    .selection-info {
      margin-top: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    
    .selection-info h3 {
      margin-top: 0;
      color: #007bff;
    }
  `]
})
export class SimpleGridComponent {
  // Sample data
  products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      category: 'Electronics',
      inStock: true,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Coffee Maker',
      price: 149.99,
      category: 'Appliances',
      inStock: false,
      rating: 4.2
    },
    {
      id: 3,
      name: 'Desk Lamp',
      price: 45.99,
      category: 'Furniture',
      inStock: true,
      rating: 4.0
    },
    {
      id: 4,
      name: 'Bluetooth Speaker',
      price: 79.99,
      category: 'Electronics',
      inStock: true,
      rating: 4.7
    },
    {
      id: 5,
      name: 'Office Chair',
      price: 299.99,
      category: 'Furniture',
      inStock: true,
      rating: 4.3
    }
  ];

  // Column definitions
  columns: ColumnDefinition[] = [
    {
      id: 'id',
      field: 'id',
      header: 'ID',
      type: 'number',
      width: 80,
      sortable: true
    },
    {
      id: 'name',
      field: 'name',
      header: 'Product Name',
      type: 'string',
      width: 200,
      sortable: true,
      filterable: true
    },
    {
      id: 'price',
      field: 'price',
      header: 'Price',
      type: 'number',
      width: 120,
      align: 'right',
      sortable: true,
      cellRenderer: '${{value}}'
    },
    {
      id: 'category',
      field: 'category',
      header: 'Category',
      type: 'string',
      width: 150,
      sortable: true,
      filterable: true
    },
    {
      id: 'inStock',
      field: 'inStock',
      header: 'In Stock',
      type: 'boolean',
      width: 100,
      align: 'center',
      sortable: true
    },
    {
      id: 'rating',
      field: 'rating',
      header: 'Rating',
      type: 'number',
      width: 100,
      align: 'center',
      sortable: true,
      cellRenderer: '⭐ {{value}}'
    }
  ];

  // Basic grid configuration
  config: GridConfig = {
    selectable: true,
    selectionMode: 'single',
    sortable: true,
    filterable: true,
    resizable: true,
    rowHeight: 45
  };

  // Track selected product
  selectedProduct: any = null;

  // Event handlers
  onCellClick(event: CellClickEvent) {
    console.log('Cell clicked:', {
      row: event.data.rowIndex,
      column: event.data.columnId,
      value: event.data.value,
      product: event.data.rowData
    });
  }

  onRowSelect(event: RowSelectEvent) {
    if (event.data.selected) {
      this.selectedProduct = event.data.rowData;
      console.log('Product selected:', this.selectedProduct);
    } else {
      this.selectedProduct = null;
    }
  }
}
```

## Step-by-Step Breakdown

### 1. Import Required Modules

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui/grid';
import { ColumnDefinition, GridConfig, CellClickEvent, RowSelectEvent } from '@ng-ui/core';
```

The essential imports for a basic grid:
- `Grid`: The main grid component
- `ColumnDefinition`: Interface for defining columns
- `GridConfig`: Interface for grid configuration
- Event interfaces for handling user interactions

### 2. Define Your Data Structure

```typescript
// Define the shape of your data (optional but recommended)
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  rating: number;
}

// Create sample data
products: Product[] = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 99.99,
    category: 'Electronics',
    inStock: true,
    rating: 4.5
  }
  // ... more products
];
```

### 3. Configure Columns

```typescript
columns: ColumnDefinition[] = [
  {
    id: 'id',              // Unique identifier
    field: 'id',           // Property name in data
    header: 'ID',          // Display header
    type: 'number',        // Data type for sorting/filtering
    width: 80,             // Column width in pixels
    sortable: true         // Allow sorting
  },
  {
    id: 'name',
    field: 'name',
    header: 'Product Name',
    type: 'string',
    width: 200,
    sortable: true,
    filterable: true       // Allow filtering
  },
  // ... more columns
];
```

### 4. Set Grid Configuration

```typescript
config: GridConfig = {
  selectable: true,          // Enable row selection
  selectionMode: 'single',   // Only one row at a time
  sortable: true,            // Enable column sorting
  filterable: true,          // Enable column filtering
  resizable: true,           // Allow column resizing
  rowHeight: 45              // Row height in pixels
};
```

### 5. Add the Grid to Your Template

```html
<ng-ui-lib 
  [data]="products" 
  [columns]="columns" 
  [config]="config"
  (cellClick)="onCellClick($event)"
  (rowSelect)="onRowSelect($event)">
</ng-ui-lib>
```

### 6. Handle Events

```typescript
onCellClick(event: CellClickEvent) {
  const { rowIndex, columnId, value, rowData } = event.data;
  console.log(`Clicked cell [${rowIndex}, ${columnId}]: ${value}`);
}

onRowSelect(event: RowSelectEvent) {
  if (event.data.selected) {
    this.selectedProduct = event.data.rowData;
  } else {
    this.selectedProduct = null;
  }
}
```

## Minimal Example

For the absolute minimum setup:

```typescript
@Component({
  selector: 'app-minimal-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <ng-ui-lib [data]="data" [columns]="columns"></ng-ui-lib>
  `
})
export class MinimalGridComponent {
  data = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ];

  columns = [
    { id: 'id', field: 'id', header: 'ID' },
    { id: 'name', field: 'name', header: 'Name' },
    { id: 'email', field: 'email', header: 'Email' }
  ];
}
```

## Common Customizations

### Custom Cell Rendering

```typescript
{
  id: 'price',
  field: 'price',
  header: 'Price',
  type: 'number',
  cellRenderer: '<span class="price">${{value}}</span>'
}
```

### Boolean Column with Custom Display

```typescript
{
  id: 'inStock',
  field: 'inStock',
  header: 'Status',
  type: 'boolean',
  cellRenderer: '<span class="status-{{value ? \'in-stock\' : \'out-of-stock\'}}">{{value ? \'Available\' : \'Out of Stock\'}}</span>'
}
```

### Action Column

```typescript
{
  id: 'actions',
  field: 'id',
  header: 'Actions',
  sortable: false,
  filterable: false,
  cellEditor: false,
  cellRenderer: '<button onclick="editProduct({{value}})">Edit</button>'
}
```

## Styling the Grid

Add CSS to customize the appearance:

```css
/* Component styles */
:host {
  display: block;
  padding: 20px;
}

/* Grid customization */
::ng-deep .ng-ui-lib {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

::ng-deep .ng-ui-lib .grid-header {
  background: #f8f9fa;
  font-weight: 600;
}

::ng-deep .ng-ui-lib .grid-row:hover {
  background: #f5f5f5;
}

::ng-deep .ng-ui-lib .grid-row.selected {
  background: #e3f2fd;
}

/* Custom cell styles */
::ng-deep .price {
  color: #28a745;
  font-weight: bold;
}

::ng-deep .status-in-stock {
  color: #28a745;
}

::ng-deep .status-out-of-stock {
  color: #dc3545;
}
```

## Adding Data Loading

```typescript
@Component({
  selector: 'app-loading-grid',
  template: `
    <div class="loading" *ngIf="loading">Loading products...</div>
    <ng-ui-lib 
      *ngIf="!loading"
      [data]="products" 
      [columns]="columns" 
      [config]="config">
    </ng-ui-lib>
  `
})
export class LoadingGridComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  
  constructor(private productService: ProductService) {}

  async ngOnInit() {
    try {
      this.products = await this.productService.getProducts();
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      this.loading = false;
    }
  }
}
```

## Error Handling

```typescript
@Component({
  template: `
    <div class="error" *ngIf="error">
      Error loading data: {{ error.message }}
      <button (click)="reload()">Retry</button>
    </div>
    <ng-ui-lib 
      *ngIf="!error && !loading"
      [data]="products" 
      [columns]="columns">
    </ng-ui-lib>
  `
})
export class ErrorHandlingGridComponent {
  products: Product[] = [];
  loading = false;
  error: Error | null = null;

  async loadData() {
    this.loading = true;
    this.error = null;
    
    try {
      this.products = await this.productService.getProducts();
    } catch (error) {
      this.error = error as Error;
    } finally {
      this.loading = false;
    }
  }

  reload() {
    this.loadData();
  }
}
```

## Next Steps

After mastering the simple grid, explore:

1. **[Data Binding](./data-binding.md)** - Dynamic data loading and updates
2. **[Column Configuration](./column-configuration.md)** - Advanced column features
3. **[Large Datasets](../advanced/large-datasets.md)** - Virtual scrolling and performance
4. **[Real-time Updates](../advanced/real-time-updates.md)** - Live data synchronization

## Key Takeaways

- Minimal setup requires only `data` and `columns` properties
- Column definitions control display and behavior
- Grid configuration enables/disables features
- Event handlers provide user interaction feedback
- TypeScript interfaces ensure type safety
- Custom cell renderers allow flexible display formatting