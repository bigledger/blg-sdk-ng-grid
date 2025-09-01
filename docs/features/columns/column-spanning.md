# Column Spanning

## Overview

Column spanning allows cells to extend across multiple columns, creating merged cell effects and complex layouts. This feature is useful for grouping related data, creating hierarchical displays, and implementing custom cell layouts that require more space than a single column provides.

## Use Cases

- Merge cells for grouped data display
- Create hierarchical data presentations
- Implement custom layouts with varying cell widths
- Display summary information across multiple columns
- Create section headers within data rows

## Basic Column Spanning

### Static Column Spanning

```typescript
import { BlgGridComponent } from '@ng-ui/grid';

@Component({
  template: `
    <ng-ui-lib 
      [rowData]="rowData"
      [columnDefs]="columnDefs">
    </ng-ui-lib>
  `
})
export class BasicColumnSpanningComponent {
  columnDefs = [
    { field: 'athlete', headerName: 'Athlete', width: 200 },
    { field: 'age', headerName: 'Age', width: 80 },
    { field: 'country', headerName: 'Country', width: 150 },
    { field: 'sport', headerName: 'Sport', width: 150 },
    { field: 'gold', headerName: 'Gold', width: 80 },
    { field: 'silver', headerName: 'Silver', width: 80 },
    { field: 'bronze', headerName: 'Bronze', width: 80 }
  ];

  rowData = [
    {
      athlete: 'Michael Phelps',
      age: 31,
      country: 'USA',
      sport: 'Swimming',
      gold: 23,
      silver: 3,
      bronze: 2,
      // This row will span across multiple columns for athlete name
      isHeader: false
    },
    {
      athlete: 'TEAM USA SUMMARY',
      age: null,
      country: null,
      sport: null,
      gold: 46,
      silver: 37,
      bronze: 38,
      isHeader: true // This will trigger column spanning
    }
  ];

  // Column spanning configuration
  colSpan = (params: any) => {
    if (params.data.isHeader && params.column.getColId() === 'athlete') {
      // Span the athlete column across 4 columns (athlete, age, country, sport)
      return 4;
    }
    return 1;
  };
}
```

### Dynamic Column Spanning

```typescript
export class DynamicColumnSpanningComponent {
  columnDefs = [
    { 
      field: 'name', 
      headerName: 'Name',
      colSpan: this.getNameColumnSpan.bind(this)
    },
    { field: 'department', headerName: 'Department' },
    { field: 'role', headerName: 'Role' },
    { field: 'salary', headerName: 'Salary' },
    { field: 'bonus', headerName: 'Bonus' },
    { field: 'total', headerName: 'Total' }
  ];

  private getNameColumnSpan(params: any): number {
    if (params.data.type === 'department-header') {
      // Department headers span across all columns
      return 6;
    } else if (params.data.type === 'section-header') {
      // Section headers span across first 3 columns
      return 3;
    } else if (params.data.isManager) {
      // Manager rows span across first 2 columns
      return 2;
    }
    return 1; // Regular rows don't span
  }

  rowData = [
    {
      name: 'ENGINEERING DEPARTMENT',
      type: 'department-header',
      department: null,
      role: null,
      salary: null,
      bonus: null,
      total: null
    },
    {
      name: 'Frontend Team',
      type: 'section-header',
      department: null,
      role: null,
      salary: 450000,
      bonus: 85000,
      total: 535000
    },
    {
      name: 'John Smith',
      isManager: true,
      department: null, // This will be hidden due to spanning
      role: 'Senior Frontend Developer',
      salary: 95000,
      bonus: 15000,
      total: 110000
    },
    {
      name: 'Jane Doe',
      isManager: false,
      department: 'Engineering',
      role: 'Frontend Developer',
      salary: 75000,
      bonus: 10000,
      total: 85000
    }
  ];
}
```

## Advanced Column Spanning

### Conditional Spanning with Cell Rendering

```typescript
export class ConditionalSpanningComponent {
  columnDefs = [
    {
      field: 'product',
      headerName: 'Product',
      colSpan: (params) => this.getProductColSpan(params),
      cellRenderer: (params) => this.renderProductCell(params)
    },
    { field: 'category', headerName: 'Category' },
    { field: 'price', headerName: 'Price' },
    { field: 'stock', headerName: 'Stock' },
    { field: 'sales', headerName: 'Sales' },
    { field: 'revenue', headerName: 'Revenue' }
  ];

  private getProductColSpan(params: any): number {
    if (params.data.type === 'category-summary') {
      return 6; // Span entire row
    } else if (params.data.type === 'product-group') {
      return 3; // Span first 3 columns
    }
    return 1;
  }

  private renderProductCell(params: any): string {
    const data = params.data;
    
    if (data.type === 'category-summary') {
      return `
        <div class="category-summary">
          <h4>${data.product}</h4>
          <div class="summary-stats">
            <span>Total Products: ${data.totalProducts}</span>
            <span>Total Revenue: $${data.totalRevenue?.toLocaleString()}</span>
          </div>
        </div>
      `;
    } else if (data.type === 'product-group') {
      return `
        <div class="product-group">
          <strong>${data.product}</strong>
          <small>${data.description}</small>
        </div>
      `;
    }
    
    return params.value;
  }
}
```

### Responsive Column Spanning

```typescript
export class ResponsiveSpanningComponent {
  private screenSize: string = 'desktop';

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateScreenSize();
    this.updateColumnSpanning();
  }

  columnDefs = [
    {
      field: 'title',
      headerName: 'Title',
      colSpan: (params) => this.getTitleColSpan(params)
    },
    { field: 'subtitle', headerName: 'Subtitle' },
    { field: 'author', headerName: 'Author' },
    { field: 'date', headerName: 'Date' },
    { field: 'category', headerName: 'Category' },
    { field: 'status', headerName: 'Status' }
  ];

  private getTitleColSpan(params: any): number {
    if (params.data.type === 'section-header') {
      switch (this.screenSize) {
        case 'mobile':
          return 2; // Span across title and subtitle only
        case 'tablet':
          return 4; // Span across first 4 columns
        case 'desktop':
          return 6; // Span across all columns
        default:
          return 1;
      }
    }
    return 1;
  }

  private updateScreenSize(): void {
    const width = window.innerWidth;
    if (width < 768) this.screenSize = 'mobile';
    else if (width < 1024) this.screenSize = 'tablet';
    else this.screenSize = 'desktop';
  }

  private updateColumnSpanning(): void {
    // Force grid to recalculate column spanning
    this.gridApi.refreshCells({ force: true });
  }
}
```

## Complex Spanning Patterns

### Hierarchical Data with Spanning

```typescript
export class HierarchicalSpanningComponent {
  columnDefs = [
    {
      field: 'name',
      headerName: 'Name',
      colSpan: this.getNameColSpan.bind(this),
      cellRenderer: this.renderHierarchicalCell.bind(this),
      cellStyle: this.getHierarchicalStyle.bind(this)
    },
    { field: 'type', headerName: 'Type' },
    { field: 'count', headerName: 'Count' },
    { field: 'value', headerName: 'Value' },
    { field: 'percentage', headerName: 'Percentage' },
    { field: 'trend', headerName: 'Trend' }
  ];

  private getNameColSpan(params: any): number {
    const level = params.data.level || 0;
    
    switch (level) {
      case 0: // Root level - span all columns
        return 6;
      case 1: // First level - span first 4 columns
        return 4;
      case 2: // Second level - span first 2 columns
        return 2;
      default: // Leaf level - no spanning
        return 1;
    }
  }

  private renderHierarchicalCell(params: any): string {
    const data = params.data;
    const level = data.level || 0;
    const indent = '    '.repeat(level);
    
    if (level === 0) {
      return `
        <div class="hierarchy-root">
          <h3>${data.name}</h3>
          <div class="root-summary">
            Total Items: ${data.totalItems} | Total Value: $${data.totalValue?.toLocaleString()}
          </div>
        </div>
      `;
    } else if (level === 1) {
      return `
        <div class="hierarchy-group">
          ${indent}<strong>${data.name}</strong>
          <span class="group-info">(${data.itemCount} items)</span>
        </div>
      `;
    }
    
    return `${indent}${data.name}`;
  }

  private getHierarchicalStyle(params: any): any {
    const level = params.data.level || 0;
    
    return {
      backgroundColor: level === 0 ? '#f8f9fa' : level === 1 ? '#e9ecef' : 'transparent',
      fontWeight: level <= 1 ? 'bold' : 'normal',
      paddingLeft: `${level * 20}px`
    };
  }
}
```

### Grid-in-Grid with Spanning

```typescript
export class GridInGridSpanningComponent {
  columnDefs = [
    { field: 'orderNumber', headerName: 'Order #', width: 120 },
    { field: 'customer', headerName: 'Customer', width: 200 },
    { field: 'date', headerName: 'Date', width: 120 },
    {
      field: 'details',
      headerName: 'Order Details',
      colSpan: this.getDetailsColSpan.bind(this),
      cellRenderer: 'orderDetailsRenderer',
      autoHeight: true
    },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'total', headerName: 'Total', width: 120 }
  ];

  frameworkComponents = {
    orderDetailsRenderer: OrderDetailsRendererComponent
  };

  private getDetailsColSpan(params: any): number {
    if (params.data.showDetails) {
      return 4; // Span across details, status, and total columns
    }
    return 1;
  }

  rowData = [
    {
      orderNumber: 'ORD-001',
      customer: 'John Smith',
      date: '2024-01-15',
      status: 'Shipped',
      total: 450.00,
      showDetails: false,
      orderItems: [
        { product: 'Laptop', quantity: 1, price: 350.00 },
        { product: 'Mouse', quantity: 2, price: 50.00 }
      ]
    }
  ];

  toggleOrderDetails(rowIndex: number): void {
    const rowNode = this.gridApi.getRowNode(rowIndex.toString());
    if (rowNode) {
      rowNode.data.showDetails = !rowNode.data.showDetails;
      this.gridApi.refreshCells({ rowNodes: [rowNode], force: true });
    }
  }
}

@Component({
  selector: 'app-order-details-renderer',
  template: `
    <div class="order-details" *ngIf="params.data.showDetails">
      <table class="details-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of params.data.orderItems">
            <td>{{ item.product }}</td>
            <td>{{ item.quantity }}</td>
            <td>\${{ item.price.toFixed(2) }}</td>
            <td>\${{ (item.quantity * item.price).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div *ngIf="!params.data.showDetails">
      {{ params.value }}
    </div>
  `,
  styles: [`
    .order-details {
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-table th,
    .details-table td {
      text-align: left;
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }
    .details-table th {
      background: #e9ecef;
      font-weight: bold;
    }
  `]
})
export class OrderDetailsRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }
}
```

## Styling and CSS for Spanning

### Custom Spanning Styles

```typescript
export class SpanningStylesComponent {
  columnDefs = [
    {
      field: 'content',
      headerName: 'Content',
      colSpan: this.getContentColSpan.bind(this),
      cellRenderer: this.renderStyledContent.bind(this),
      cellClass: this.getContentCellClass.bind(this)
    },
    { field: 'data1', headerName: 'Data 1' },
    { field: 'data2', headerName: 'Data 2' },
    { field: 'data3', headerName: 'Data 3' }
  ];

  private getContentColSpan(params: any): number {
    return params.data.spanCount || 1;
  }

  private getContentCellClass(params: any): string {
    const spanCount = params.data.spanCount || 1;
    return `spanning-cell span-${spanCount}`;
  }

  private renderStyledContent(params: any): string {
    if (params.data.spanCount > 1) {
      return `
        <div class="spanning-content">
          <div class="spanning-header">${params.data.title}</div>
          <div class="spanning-body">${params.data.description}</div>
        </div>
      `;
    }
    return params.value;
  }
}

// Corresponding CSS
/*
.spanning-cell {
  border: 2px solid #007bff;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.span-2 {
  border-color: #28a745;
}

.span-3 {
  border-color: #ffc107;
}

.span-4 {
  border-color: #dc3545;
}

.spanning-content {
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.spanning-header {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
  color: #333;
}

.spanning-body {
  font-size: 14px;
  color: #666;
  flex-grow: 1;
}
*/
```

## Performance Considerations

### Optimizing Column Spanning

```typescript
export class OptimizedSpanningComponent {
  private spanCache = new Map<string, number>();

  columnDefs = [
    {
      field: 'content',
      colSpan: this.getCachedColSpan.bind(this)
    }
  ];

  private getCachedColSpan(params: any): number {
    const rowId = params.node.id;
    const cacheKey = `${rowId}-${params.column.getColId()}`;
    
    if (this.spanCache.has(cacheKey)) {
      return this.spanCache.get(cacheKey)!;
    }

    const span = this.calculateColSpan(params);
    this.spanCache.set(cacheKey, span);
    return span;
  }

  private calculateColSpan(params: any): number {
    // Expensive calculation here
    if (params.data.type === 'header') {
      return 4;
    } else if (params.data.type === 'subheader') {
      return 2;
    }
    return 1;
  }

  onDataChanged(): void {
    // Clear cache when data changes
    this.spanCache.clear();
  }

  // Batch spanning updates for better performance
  updateSpanningForRows(rowNodes: any[]): void {
    this.gridApi.refreshCells({
      rowNodes,
      columns: ['content'], // Only refresh spanning column
      force: true
    });
  }
}
```

## API Reference

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `colSpan` | `function \| number` | Function or number determining column span |
| `cellRenderer` | `string \| Component` | Custom renderer for spanning cells |
| `cellClass` | `string \| function` | CSS class for spanning cells |
| `cellStyle` | `object \| function` | Inline styles for spanning cells |

### ColSpan Function Parameters

```typescript
interface ColSpanParams {
  node: RowNode;
  data: any;
  column: Column;
  columnApi: ColumnApi;
  api: GridApi;
  context: any;
}
```

### API Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `refreshCells()` | `{ rowNodes?, columns?, force? }` | Refresh cells to recalculate spanning |
| `getCellRendererInstances()` | `params?` | Get cell renderer instances |

## Common Patterns

### Summary Rows with Spanning

```typescript
export class SummaryRowsSpanningComponent {
  rowData = [
    // Regular data rows
    { name: 'Product A', category: 'Electronics', price: 100, quantity: 50 },
    { name: 'Product B', category: 'Electronics', price: 150, quantity: 30 },
    
    // Summary row
    {
      name: 'ELECTRONICS TOTAL',
      category: null,
      price: null,
      quantity: null,
      totalPrice: 7500,
      totalQuantity: 80,
      isSum: true
    },
    
    { name: 'Product C', category: 'Clothing', price: 50, quantity: 100 },
    { name: 'Product D', category: 'Clothing', price: 75, quantity: 60 },
    
    // Summary row
    {
      name: 'CLOTHING TOTAL',
      category: null,
      price: null,
      quantity: null,
      totalPrice: 9500,
      totalQuantity: 160,
      isSum: true
    }
  ];

  columnDefs = [
    {
      field: 'name',
      headerName: 'Product Name',
      colSpan: (params) => params.data.isSum ? 3 : 1,
      cellRenderer: (params) => {
        if (params.data.isSum) {
          return `
            <div class="summary-row">
              <strong>${params.value}</strong>
              <div class="summary-details">
                Total Quantity: ${params.data.totalQuantity} | 
                Total Value: $${params.data.totalPrice.toLocaleString()}
              </div>
            </div>
          `;
        }
        return params.value;
      }
    },
    { field: 'category', headerName: 'Category' },
    { field: 'price', headerName: 'Price' },
    { field: 'quantity', headerName: 'Quantity' }
  ];
}
```

### Dynamic Content Sections

```typescript
export class DynamicContentSectionsComponent {
  toggleSection(rowIndex: number): void {
    const rowNode = this.gridApi.getRowNode(rowIndex.toString());
    if (rowNode) {
      rowNode.data.expanded = !rowNode.data.expanded;
      this.gridApi.refreshCells({ rowNodes: [rowNode], force: true });
    }
  }

  columnDefs = [
    {
      field: 'title',
      headerName: 'Section',
      colSpan: (params) => {
        if (params.data.type === 'section' && params.data.expanded) {
          return 5; // Full width when expanded
        } else if (params.data.type === 'section') {
          return 3; // Partial width when collapsed
        }
        return 1;
      },
      cellRenderer: (params) => {
        if (params.data.type === 'section') {
          const expanded = params.data.expanded;
          return `
            <div class="section-header ${expanded ? 'expanded' : 'collapsed'}">
              <button onclick="this.toggleSection(${params.node.rowIndex})">
                ${expanded ? '▼' : '▶'} ${params.value}
              </button>
              ${expanded ? `<div class="section-content">${params.data.content}</div>` : ''}
            </div>
          `;
        }
        return params.value;
      }
    }
  ];
}
```

## Troubleshooting

### Common Issues

1. **Spanning not visible**: Check if the colSpan function returns a value > 1
2. **Layout breaking**: Ensure spanning doesn't exceed available columns
3. **Performance issues**: Cache span calculations for frequently updated data
4. **Styling problems**: Use appropriate CSS classes and cell renderers

### Debugging Column Spanning

```typescript
export class SpanningDebugger {
  debugColumnSpanning(): void {
    this.gridApi.forEachNode((rowNode, index) => {
      const data = rowNode.data;
      const spanInfo = this.columnApi.getAllColumns()?.map(column => {
        const colDef = column.getColDef();
        const span = typeof colDef.colSpan === 'function' 
          ? colDef.colSpan({ node: rowNode, data, column })
          : colDef.colSpan || 1;
        
        return {
          columnId: column.getColId(),
          span: span
        };
      });

      if (spanInfo?.some(info => info.span > 1)) {
        console.log(`Row ${index}:`, spanInfo.filter(info => info.span > 1));
      }
    });
  }
}
```

## Best Practices

1. **Use spanning sparingly** to avoid layout complexity
2. **Cache span calculations** for better performance
3. **Provide clear visual differentiation** for spanning cells
4. **Test responsive behavior** across different screen sizes
5. **Consider accessibility** when implementing custom spanning layouts
6. **Use appropriate cell renderers** for complex spanning content
7. **Validate span values** to prevent layout breaking
8. **Document spanning logic** clearly for maintainability