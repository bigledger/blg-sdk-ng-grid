# Your First Grid

This guide will walk you through creating your first BlgGrid from scratch, explaining each step and concept along the way. By the end, you'll have a fully functional data grid with sorting, filtering, and selection.

## What We're Building

We'll create a car sales grid that displays:
- Car make, model, price, and year
- Sortable columns
- Filterable data
- Row selection
- Responsive design

## Step 1: Create the Component

Create a new Angular component for your grid:

```typescript
// car-grid.component.ts
import { Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

@Component({
  selector: 'app-car-grid',
  standalone: true,
  imports: [Grid],
  templateUrl: './car-grid.component.html',
  styleUrls: ['./car-grid.component.scss']
})
export class CarGridComponent {
  // We'll add properties here
}
```

## Step 2: Define Your Data

Add sample data to your component. In a real application, this would come from a service:

```typescript
export class CarGridComponent {
  // Sample car data
  rowData = [
    { id: 1, make: 'Toyota', model: 'Camry', price: 28000, year: 2023, color: 'Blue' },
    { id: 2, make: 'Honda', model: 'Civic', price: 25000, year: 2023, color: 'Red' },
    { id: 3, make: 'Ford', model: 'F-150', price: 45000, year: 2022, color: 'White' },
    { id: 4, make: 'BMW', model: 'X3', price: 52000, year: 2023, color: 'Black' },
    { id: 5, make: 'Audi', model: 'A4', price: 48000, year: 2022, color: 'Silver' },
    { id: 6, make: 'Mercedes', model: 'C-Class', price: 55000, year: 2023, color: 'White' },
    { id: 7, make: 'Tesla', model: 'Model 3', price: 42000, year: 2023, color: 'Red' },
    { id: 8, make: 'Nissan', model: 'Altima', price: 26000, year: 2022, color: 'Gray' },
    { id: 9, make: 'Volkswagen', model: 'Jetta', price: 24000, year: 2023, color: 'Blue' },
    { id: 10, make: 'Hyundai', model: 'Elantra', price: 23000, year: 2022, color: 'Black' }
  ];
}
```

## Step 3: Configure Columns

Define how each data field should be displayed:

```typescript
export class CarGridComponent {
  rowData = [...]; // from above

  // Column definitions
  columnDefs: ColumnDefinition[] = [
    {
      id: 'make',
      field: 'make',
      header: 'Make',
      type: 'string',
      width: 120,
      sortable: true,
      filterable: true,
      pinned: 'left' // Pin to left side
    },
    {
      id: 'model',
      field: 'model', 
      header: 'Model',
      type: 'string',
      width: 150,
      sortable: true,
      filterable: true
    },
    {
      id: 'price',
      field: 'price',
      header: 'Price',
      type: 'number',
      width: 120,
      sortable: true,
      filterable: true,
      align: 'right',
      // Format as currency
      cellRenderer: 'currency'
    },
    {
      id: 'year',
      field: 'year',
      header: 'Year',
      type: 'number', 
      width: 100,
      sortable: true,
      filterable: true,
      align: 'center'
    },
    {
      id: 'color',
      field: 'color',
      header: 'Color',
      type: 'string',
      width: 100,
      sortable: true,
      filterable: true
    }
  ];
}
```

### Column Properties Explained

- **id**: Unique identifier for the column
- **field**: Property name in your data objects  
- **header**: Display text in column header
- **type**: Data type ('string', 'number', 'date', 'boolean')
- **width**: Fixed width in pixels (optional)
- **sortable**: Enable sorting on this column
- **filterable**: Enable filtering on this column
- **align**: Text alignment ('left', 'center', 'right')
- **pinned**: Pin column to side ('left', 'right')
- **cellRenderer**: Custom renderer for cell content

## Step 4: Configure the Grid

Set up grid behavior and features:

```typescript
export class CarGridComponent {
  rowData = [...]; // from above
  columnDefs = [...]; // from above

  // Grid configuration
  gridConfig: GridConfig = {
    // Row configuration
    rowHeight: 48,
    
    // Performance
    virtualScrolling: true,
    
    // Features
    sortable: true,
    filterable: true,
    resizable: true,
    reorderable: true,
    
    // Selection
    selectable: true,
    selectionMode: 'multiple',
    
    // Appearance
    theme: 'default',
    showFooter: true,
    
    // Pagination (optional)
    pagination: false
  };
}
```

### Configuration Options Explained

- **rowHeight**: Height of each row in pixels
- **virtualScrolling**: Enable virtual scrolling for large datasets
- **sortable**: Enable sorting globally (can be overridden per column)
- **filterable**: Enable filtering globally (can be overridden per column)  
- **resizable**: Allow column resizing
- **reorderable**: Allow column reordering
- **selectable**: Enable row selection
- **selectionMode**: 'single' or 'multiple' selection
- **theme**: Visual theme ('default', 'dark', 'material')
- **showFooter**: Display grid footer

## Step 5: Create the Template

Create the HTML template:

```html
<!-- car-grid.component.html -->
<div class="grid-container">
  <div class="grid-header">
    <h2>Car Inventory</h2>
    <p>{{rowData.length}} cars available</p>
  </div>
  
  <div class="grid-wrapper">
    <blg-grid 
      [data]="rowData"
      [columns]="columnDefs"
      [config]="gridConfig"
      (cellClick)="onCellClick($event)"
      (rowSelect)="onRowSelect($event)"
      (columnSort)="onColumnSort($event)">
    </blg-grid>
  </div>
  
  <div class="grid-footer">
    <p>Click on any row to select it. Use Ctrl/Cmd+click for multiple selection.</p>
  </div>
</div>
```

## Step 6: Add Event Handlers

Handle grid events in your component:

```typescript
import { CellClickEvent, RowSelectEvent, ColumnSortEvent } from '@blg-grid/core';

export class CarGridComponent {
  // ... existing code ...

  // Handle cell clicks
  onCellClick(event: CellClickEvent) {
    console.log('Cell clicked:', {
      column: event.data.columnId,
      value: event.data.value,
      row: event.data.rowData
    });
  }

  // Handle row selection
  onRowSelect(event: RowSelectEvent) {
    console.log('Row selection changed:', {
      rowIndex: event.data.rowIndex,
      selected: event.data.selected,
      rowData: event.data.rowData
    });
  }

  // Handle column sorting
  onColumnSort(event: ColumnSortEvent) {
    console.log('Column sorted:', {
      column: event.data.columnId,
      direction: event.data.direction,
      sortState: event.data.sortState
    });
  }
}
```

## Step 7: Style Your Grid

Add CSS styling:

```scss
/* car-grid.component.scss */
.grid-container {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.grid-header {
  margin-bottom: 16px;
  
  h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  p {
    margin: 0;
    color: #7f8c8d;
    font-size: 14px;
  }
}

.grid-wrapper {
  flex: 1;
  min-height: 0; // Important for flex containers
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
}

.grid-footer {
  margin-top: 16px;
  
  p {
    margin: 0;
    font-size: 12px;
    color: #95a5a6;
    font-style: italic;
  }
}

// Import BlgGrid theme
@import '@blg-grid/theme/styles/default-theme';
```

## Step 8: Use in Your App

Add your component to your application:

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { CarGridComponent } from './car-grid/car-grid.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CarGridComponent],
  template: `
    <div class="app-container">
      <app-car-grid></app-car-grid>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'BlgGrid Demo';
}
```

## Complete Example

Here's the complete working component:

```typescript
// car-grid.component.ts
import { Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { 
  ColumnDefinition, 
  GridConfig, 
  CellClickEvent, 
  RowSelectEvent, 
  ColumnSortEvent 
} from '@blg-grid/core';

@Component({
  selector: 'app-car-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="grid-container">
      <div class="grid-header">
        <h2>Car Inventory</h2>
        <p>{{rowData.length}} cars available</p>
      </div>
      
      <div class="grid-wrapper">
        <blg-grid 
          [data]="rowData"
          [columns]="columnDefs"
          [config]="gridConfig"
          (cellClick)="onCellClick($event)"
          (rowSelect)="onRowSelect($event)"
          (columnSort)="onColumnSort($event)">
        </blg-grid>
      </div>
      
      <div class="grid-footer">
        <p>Click on any row to select it. Use Ctrl/Cmd+click for multiple selection.</p>
      </div>
    </div>
  `,
  styles: [`
    .grid-container {
      padding: 20px;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .grid-header {
      margin-bottom: 16px;
    }
    
    .grid-header h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .grid-header p {
      margin: 0;
      color: #7f8c8d;
      font-size: 14px;
    }
    
    .grid-wrapper {
      flex: 1;
      min-height: 0;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .grid-footer {
      margin-top: 16px;
    }
    
    .grid-footer p {
      margin: 0;
      font-size: 12px;
      color: #95a5a6;
      font-style: italic;
    }
  `]
})
export class CarGridComponent {
  rowData = [
    { id: 1, make: 'Toyota', model: 'Camry', price: 28000, year: 2023, color: 'Blue' },
    { id: 2, make: 'Honda', model: 'Civic', price: 25000, year: 2023, color: 'Red' },
    { id: 3, make: 'Ford', model: 'F-150', price: 45000, year: 2022, color: 'White' },
    { id: 4, make: 'BMW', model: 'X3', price: 52000, year: 2023, color: 'Black' },
    { id: 5, make: 'Audi', model: 'A4', price: 48000, year: 2022, color: 'Silver' },
    { id: 6, make: 'Mercedes', model: 'C-Class', price: 55000, year: 2023, color: 'White' },
    { id: 7, make: 'Tesla', model: 'Model 3', price: 42000, year: 2023, color: 'Red' },
    { id: 8, make: 'Nissan', model: 'Altima', price: 26000, year: 2022, color: 'Gray' },
    { id: 9, make: 'Volkswagen', model: 'Jetta', price: 24000, year: 2023, color: 'Blue' },
    { id: 10, make: 'Hyundai', model: 'Elantra', price: 23000, year: 2022, color: 'Black' }
  ];

  columnDefs: ColumnDefinition[] = [
    {
      id: 'make',
      field: 'make',
      header: 'Make',
      type: 'string',
      width: 120,
      sortable: true,
      filterable: true,
      pinned: 'left'
    },
    {
      id: 'model',
      field: 'model',
      header: 'Model',
      type: 'string',
      width: 150,
      sortable: true,
      filterable: true
    },
    {
      id: 'price',
      field: 'price',
      header: 'Price',
      type: 'number',
      width: 120,
      sortable: true,
      filterable: true,
      align: 'right',
      cellRenderer: 'currency'
    },
    {
      id: 'year',
      field: 'year',
      header: 'Year',
      type: 'number',
      width: 100,
      sortable: true,
      filterable: true,
      align: 'center'
    },
    {
      id: 'color',
      field: 'color',
      header: 'Color',
      type: 'string',
      width: 100,
      sortable: true,
      filterable: true
    }
  ];

  gridConfig: GridConfig = {
    rowHeight: 48,
    virtualScrolling: true,
    sortable: true,
    filterable: true,
    resizable: true,
    reorderable: true,
    selectable: true,
    selectionMode: 'multiple',
    theme: 'default',
    showFooter: true,
    pagination: false
  };

  onCellClick(event: CellClickEvent) {
    console.log('Cell clicked:', {
      column: event.data.columnId,
      value: event.data.value,
      row: event.data.rowData
    });
  }

  onRowSelect(event: RowSelectEvent) {
    console.log('Row selection changed:', {
      rowIndex: event.data.rowIndex,
      selected: event.data.selected,
      rowData: event.data.rowData
    });
  }

  onColumnSort(event: ColumnSortEvent) {
    console.log('Column sorted:', {
      column: event.data.columnId,
      direction: event.data.direction,
      sortState: event.data.sortState
    });
  }
}
```

## Testing Your Grid

1. **Run the development server:**
   ```bash
   ng serve
   ```

2. **Test basic functionality:**
   - Click column headers to sort
   - Click rows to select them
   - Try Ctrl/Cmd+click for multiple selection
   - Resize columns by dragging header borders
   - Check the browser console for event logs

3. **Verify features:**
   - ✅ Data displays correctly
   - ✅ Sorting works on all columns
   - ✅ Row selection with visual feedback
   - ✅ Column resizing
   - ✅ Event handlers fire
   - ✅ Responsive design

## Common Issues and Solutions

### Grid Not Displaying
- **Problem**: Grid container has no height
- **Solution**: Set explicit height on grid container

### Data Not Showing
- **Problem**: Data or columns are undefined
- **Solution**: Check that `rowData` and `columnDefs` are properly initialized

### Styles Missing
- **Problem**: Theme not imported
- **Solution**: Import theme in `styles.scss` or component styles

### Events Not Firing
- **Problem**: Event handlers not bound correctly
- **Solution**: Use proper Angular event syntax: `(eventName)="handler($event)"`

## Next Steps

Now that you have a working grid:

1. **[Angular Setup](./angular-setup.md)** - Learn Angular-specific configuration
2. **[TypeScript Setup](./typescript-setup.md)** - Optimize your TypeScript setup
3. **[Column Configuration](../features/column-configuration.md)** - Deep dive into column features
4. **[Data Binding](../features/data-binding.md)** - Advanced data binding techniques
5. **[Theming](../features/theming.md)** - Customize the grid appearance

## Live Examples

See this grid in action:
- [Basic Grid](https://stackblitz.com/edit/blg-grid-first-grid) - The example from this guide
- [Car Inventory](https://stackblitz.com/edit/blg-grid-car-inventory) - Enhanced version with more features
- [Interactive Demo](https://stackblitz.com/edit/blg-grid-interactive) - Try different configurations