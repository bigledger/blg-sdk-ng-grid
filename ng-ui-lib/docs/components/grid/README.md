# BigLedger Grid Component

The BigLedger Grid is an enterprise-grade Angular data grid component that rivals ag-Grid in functionality while being specifically optimized for Angular applications. Built from scratch using modern Angular 20+ with Signals and standalone components.

## 🚀 Features

### Core Capabilities
- **Virtual Scrolling** - Handle 500k+ rows with smooth performance  
- **Data Types** - String, number, date, boolean, and custom types
- **Sorting** - Single and multi-column sorting with custom comparators
- **Filtering** - Built-in filters for all data types with custom filter support
- **Row Selection** - Single or multiple selection with checkbox support
- **Column Operations** - Resize, reorder, pin, show/hide columns
- **Keyboard Navigation** - Full keyboard support with ARIA compliance
- **Theming** - Multiple built-in themes with custom theme support

### Performance Features
- **Signal-Based Architecture** - Angular Signals for optimal reactivity
- **Optimized Rendering** - OnPush change detection throughout
- **Memory Efficient** - DOM recycling for virtual scrolling
- **Smart Updates** - Only render changed rows/cells

### Export Capabilities
- **Excel Export** - Full Excel (.xlsx) with formatting and formulas
- **PDF Export** - Professional PDF reports with custom styling
- **CSV Export** - Standard CSV format with custom delimiters
- **Custom Templates** - Create custom export formats

## 🔧 Installation

### Basic Installation
```bash
npm install @ng-ui-lib/core @ng-ui-lib/grid @ng-ui-lib/column @ng-ui-lib/row @ng-ui-lib/cell @ng-ui-lib/data @ng-ui-lib/theme
```

### Minimal Installation
For basic grid functionality only:
```bash
npm install @ng-ui-lib/core @ng-ui-lib/grid @ng-ui-lib/theme
```

### Import Styles
```css
/* styles.css */
@import '@ng-ui-lib/theme/styles/default-theme.css';
```

## 🎯 Quick Start

### Basic Grid Setup

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-employee-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="grid-container">
      <ng-ui-lib-grid 
        [data]="employees" 
        [columns]="columns" 
        [config]="config"
        (rowSelectionChanged)="onSelectionChanged($event)"
        (dataExported)="onDataExported($event)">
      </ng-ui-lib-grid>
    </div>
  `,
  styles: [`
    .grid-container {
      height: 600px;
      width: 100%;
    }
  `]
})
export class EmployeeGridComponent {
  employees = [
    { id: 1, name: 'John Doe', department: 'Engineering', salary: 95000, startDate: '2020-03-15' },
    { id: 2, name: 'Jane Smith', department: 'Marketing', salary: 75000, startDate: '2021-07-22' },
    { id: 3, name: 'Bob Johnson', department: 'Sales', salary: 65000, startDate: '2019-11-08' }
  ];

  columns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Employee Name',
      type: 'string',
      sortable: true,
      filterable: true,
      width: 200,
      pinned: 'left'
    },
    {
      id: 'department',
      field: 'department',
      header: 'Department',
      type: 'string',
      sortable: true,
      filterable: true,
      width: 150
    },
    {
      id: 'salary',
      field: 'salary',
      header: 'Salary',
      type: 'currency',
      sortable: true,
      filterable: true,
      width: 120,
      format: { currency: 'USD', symbol: '$', digits: '1.0-0' }
    },
    {
      id: 'startDate',
      field: 'startDate',
      header: 'Start Date',
      type: 'date',
      sortable: true,
      filterable: true,
      width: 130,
      format: { dateFormat: 'MM/dd/yyyy' }
    }
  ];

  config: GridConfig = {
    virtualScrolling: true,
    selectable: true,
    multiSelect: true,
    sortable: true,
    filterable: true,
    resizable: true,
    reorderable: true,
    exportable: true,
    exportFormats: ['excel', 'pdf', 'csv'],
    theme: 'default',
    rowHeight: 40,
    headerHeight: 48
  };

  onSelectionChanged(event: any) {
    console.log('Selected employees:', event.selectedRows);
  }

  onDataExported(result: any) {
    console.log('Export completed:', result);
  }
}
```

## 📊 Data Handling

### Static Data
```typescript
export class StaticDataComponent {
  rowData = [
    { id: 1, name: 'Product A', price: 99.99, inStock: true },
    { id: 2, name: 'Product B', price: 149.99, inStock: false }
  ];
}
```

### Observable Data
```typescript
import { Observable } from 'rxjs';

export class ObservableDataComponent {
  rowData$: Observable<any[]> = this.dataService.getProducts();
  
  constructor(private dataService: DataService) {}
}

// Template
<ng-ui-lib-grid [data]="rowData$ | async" [columns]="columns"></ng-ui-lib-grid>
```

### Signal-Based Data
```typescript
import { signal, computed } from '@angular/core';

export class SignalDataComponent {
  private _rawData = signal<any[]>([]);
  private _filter = signal<string>('');
  
  filteredData = computed(() => {
    const data = this._rawData();
    const filter = this._filter();
    return filter ? data.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    ) : data;
  });

  updateFilter(value: string) {
    this._filter.set(value);
  }
}

// Template
<ng-ui-lib-grid [data]="filteredData()" [columns]="columns"></ng-ui-lib-grid>
```

## 🔧 Column Configuration

### Column Types
```typescript
const columns: ColumnDefinition[] = [
  // String column with custom renderer
  {
    id: 'name',
    field: 'name',
    header: 'Name',
    type: 'string',
    cellRenderer: (params) => `<strong>${params.value}</strong>`
  },
  
  // Number column with formatting
  {
    id: 'price',
    field: 'price', 
    header: 'Price',
    type: 'number',
    format: { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  },
  
  // Currency column
  {
    id: 'salary',
    field: 'salary',
    header: 'Salary', 
    type: 'currency',
    format: { currency: 'USD', symbol: '$' }
  },
  
  // Date column
  {
    id: 'dateCreated',
    field: 'dateCreated',
    header: 'Created',
    type: 'date',
    format: { dateFormat: 'short' }
  },
  
  // Boolean column with custom display
  {
    id: 'isActive',
    field: 'isActive',
    header: 'Active',
    type: 'boolean',
    cellRenderer: (params) => params.value ? '✅' : '❌'
  },
  
  // Custom column with actions
  {
    id: 'actions',
    header: 'Actions',
    type: 'custom',
    cellRenderer: ActionsComponent,
    width: 120,
    sortable: false,
    filterable: false
  }
];
```

### Column Pinning
```typescript
const columns: ColumnDefinition[] = [
  { id: 'id', field: 'id', header: 'ID', pinned: 'left' },
  { id: 'name', field: 'name', header: 'Name', pinned: 'left' },
  { id: 'details', field: 'details', header: 'Details' }, // Not pinned
  { id: 'actions', header: 'Actions', pinned: 'right' }
];
```

### Conditional Formatting
```typescript
const columns: ColumnDefinition[] = [
  {
    id: 'status',
    field: 'status',
    header: 'Status',
    cellStyle: (params) => {
      switch (params.value) {
        case 'active': return { color: 'green' };
        case 'inactive': return { color: 'red' };
        default: return { color: 'gray' };
      }
    }
  }
];
```

## 🔍 Filtering and Sorting

### Built-in Filters
```typescript
const config: GridConfig = {
  filterable: true,
  filterTypes: {
    string: 'text',        // Contains, starts with, ends with, equals
    number: 'number',      // Greater than, less than, equals, between
    date: 'date',          // Date range picker
    boolean: 'boolean'     // True/false/all dropdown
  }
};
```

### Custom Filters
```typescript
import { FilterComponent } from '@ng-ui-lib/grid';

@Component({
  selector: 'app-department-filter',
  template: `
    <select (change)="onFilterChange($event)">
      <option value="">All Departments</option>
      <option value="Engineering">Engineering</option>
      <option value="Marketing">Marketing</option>
      <option value="Sales">Sales</option>
    </select>
  `
})
export class DepartmentFilterComponent extends FilterComponent {
  onFilterChange(event: any) {
    this.filterChanged.emit({
      type: 'equals',
      value: event.target.value
    });
  }
}

// Use in column definition
{
  id: 'department',
  field: 'department',
  header: 'Department',
  filterComponent: DepartmentFilterComponent
}
```

### Multi-Column Sorting
```typescript
const config: GridConfig = {
  sortable: true,
  multiSort: true,
  defaultSort: [
    { colId: 'department', sort: 'asc' },
    { colId: 'name', sort: 'asc' }
  ]
};
```

## 📤 Export Features

### Excel Export
```typescript
export class GridComponent {
  exportToExcel() {
    this.grid.exportToExcel({
      filename: 'employee-report.xlsx',
      sheetName: 'Employees',
      includeHeaders: true,
      includeFilters: true,
      customFormatting: {
        headerStyle: {
          font: { bold: true, color: 'FFFFFF' },
          fill: { bgColor: '4472C4' }
        },
        dataStyle: {
          font: { name: 'Arial', size: 10 }
        }
      },
      columnWidths: {
        name: 25,
        department: 20,
        salary: 15,
        startDate: 18
      }
    });
  }
}
```

### PDF Export
```typescript
exportToPDF() {
  this.grid.exportToPDF({
    filename: 'employee-report.pdf',
    title: 'Employee Report',
    subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    pageOrientation: 'portrait',
    pageSize: 'A4',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    logo: '/assets/company-logo.png',
    headerStyle: {
      fontSize: 12,
      fontWeight: 'bold',
      backgroundColor: '#4472C4',
      color: 'white'
    },
    footerText: 'Confidential - Company Name'
  });
}
```

### CSV Export
```typescript
exportToCSV() {
  this.grid.exportToCSV({
    filename: 'employees.csv',
    delimiter: ',',
    includeHeaders: true,
    dateFormat: 'yyyy-MM-dd',
    numberFormat: '0.00',
    encoding: 'utf-8'
  });
}
```

## 🎨 Theming and Styling

### Built-in Themes
```typescript
const config: GridConfig = {
  theme: 'default' | 'dark' | 'material' | 'bootstrap' | 'compact'
};
```

### Custom Theme
```scss
// custom-grid-theme.scss
.bigledger-grid.theme-custom {
  --blg-primary-color: #2196F3;
  --blg-background-color: #fafafa;
  --blg-header-background: #f5f5f5;
  --blg-row-hover-color: #e3f2fd;
  --blg-border-color: #e0e0e0;
  --blg-text-color: #424242;
}
```

### Dynamic Styling
```typescript
export class GridComponent {
  rowClassRules = {
    'high-salary': (params: any) => params.data.salary > 80000,
    'new-employee': (params: any) => {
      const startDate = new Date(params.data.startDate);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return startDate > oneYearAgo;
    }
  };
}

// Styles
.high-salary {
  background-color: #e8f5e8;
}

.new-employee {
  font-style: italic;
  color: #1976d2;
}
```

## ⚡ Performance Optimization

### Virtual Scrolling Configuration
```typescript
const config: GridConfig = {
  virtualScrolling: true,
  rowBuffer: 10,              // Number of rows to render outside viewport
  maxBlocksInCache: 2,        // Cache management
  maxConcurrentDatasourceRequests: 2,
  cacheOverflowSize: 2,
  enableRangeSelection: false, // Disable for better performance
  suppressRowDeselection: true
};
```

### Large Dataset Handling
```typescript
export class LargeDatasetComponent {
  // Use OnPush for better performance
  changeDetection = ChangeDetectionStrategy.OnPush;
  
  // Implement trackBy for ngFor
  trackByFn = (index: number, item: any) => item.id;
  
  // Use signals for reactive updates
  private _data = signal<any[]>([]);
  data = this._data.asReadonly();
  
  // Debounce filter updates
  filterControl = new FormControl();
  
  ngOnInit() {
    this.filterControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => this.applyFilter(value));
  }
}
```

## ♿ Accessibility Features

### ARIA Support
```typescript
const config: GridConfig = {
  accessibility: {
    enabled: true,
    announceColumnSortOnUpdate: true,
    announceRowSelectionOnUpdate: true,
    focusable: true,
    keyboardNavigation: true,
    ariaLabel: 'Employee data grid',
    ariaDescription: 'Use arrow keys to navigate, space to select rows'
  }
};
```

### Keyboard Navigation
- **Arrow Keys** - Navigate between cells
- **Tab/Shift+Tab** - Navigate through focusable elements
- **Space** - Select/deselect rows
- **Enter** - Edit cell (if editable)
- **Escape** - Cancel edit
- **Page Up/Down** - Navigate by page
- **Home/End** - Go to first/last column
- **Ctrl+Home/End** - Go to first/last cell

## 🧪 Testing

### Component Testing
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Grid } from '@ng-ui-lib/grid';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grid]
    }).compileComponents();
    
    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display data correctly', () => {
    component.data = [
      { id: 1, name: 'Test', value: 100 }
    ];
    fixture.detectChanges();
    
    const cells = fixture.debugElement.queryAll(By.css('.bigledger-grid__cell'));
    expect(cells.length).toBe(2); // id and name columns
  });

  it('should handle row selection', () => {
    spyOn(component.rowSelectionChanged, 'emit');
    
    // Simulate row selection
    component.selectRow(0);
    
    expect(component.rowSelectionChanged.emit).toHaveBeenCalled();
  });
});
```

### E2E Testing
```typescript
import { test, expect } from '@playwright/test';

test('grid basic functionality', async ({ page }) => {
  await page.goto('/grid-demo');
  
  // Check grid renders
  await expect(page.locator('.bigledger-grid')).toBeVisible();
  
  // Test sorting
  await page.click('.bigledger-grid__header [data-col="name"]');
  await expect(page.locator('.bigledger-grid__header .sort-asc')).toBeVisible();
  
  // Test filtering
  await page.fill('.bigledger-grid__filter input', 'John');
  await expect(page.locator('.bigledger-grid__row')).toHaveCount(1);
  
  // Test export
  await page.click('.export-button');
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toContain('.xlsx');
});
```

## 📚 API Reference

### Main Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `data` | `any[]` | `[]` | Row data to display |
| `columns` | `ColumnDefinition[]` | `[]` | Column configuration |
| `config` | `GridConfig` | `{}` | Grid configuration options |
| `selectedRows` | `any[]` | `[]` | Currently selected rows |
| `sortModel` | `SortModel[]` | `[]` | Current sort configuration |
| `filterModel` | `FilterModel` | `{}` | Current filter state |

### Events

| Event | Type | Description |
|-------|------|-------------|
| `rowSelectionChanged` | `RowSelectionEvent` | Fired when row selection changes |
| `cellValueChanged` | `CellEditEvent` | Fired when cell value is edited |
| `sortChanged` | `SortModel[]` | Fired when sort order changes |
| `filterChanged` | `FilterModel` | Fired when filters are applied |
| `dataExported` | `ExportResult` | Fired when data export completes |
| `columnResized` | `ColumnResizeEvent` | Fired when column is resized |
| `columnMoved` | `ColumnMoveEvent` | Fired when column is reordered |

### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `setRowData` | `data: any[]` | `void` | Set new row data |
| `getRowData` | - | `any[]` | Get current row data |
| `selectRow` | `index: number` | `void` | Select specific row |
| `selectRows` | `indices: number[]` | `void` | Select multiple rows |
| `clearSelection` | - | `void` | Clear all selections |
| `exportToExcel` | `options?: ExcelExportOptions` | `Promise<ExportResult>` | Export to Excel |
| `exportToPDF` | `options?: PDFExportOptions` | `Promise<ExportResult>` | Export to PDF |
| `exportToCSV` | `options?: CSVExportOptions` | `Promise<ExportResult>` | Export to CSV |
| `resizeColumn` | `colId: string, width: number` | `void` | Resize column |
| `hideColumn` | `colId: string` | `void` | Hide column |
| `showColumn` | `colId: string` | `void` | Show column |

## 🔗 Related Documentation

- **[Installation Guide](../../GETTING_STARTED.md)** - Getting started with BigLedger Grid
- **[Column Configuration](./columns.md)** - Advanced column setup
- **[Export Features](../../features/export/grid-export.md)** - Detailed export documentation
- **[Theming Guide](../../features/themes/)** - Custom theme creation
- **[API Reference](../../API_REFERENCE.md)** - Complete API documentation
- **[Examples](../../examples/grid-examples/)** - More examples and demos

## 🆘 Troubleshooting

### Common Issues

**Grid not displaying data**
- Check that `data` property is bound correctly
- Verify column definitions have correct `field` properties
- Ensure Angular change detection is running

**Performance issues with large datasets**
- Enable virtual scrolling: `virtualScrolling: true`
- Use OnPush change detection strategy
- Implement trackBy functions for ngFor loops

**Export not working**
- Check browser popup blockers
- Verify export format is supported
- Ensure proper permissions for file downloads

**Styling issues**
- Import theme CSS files correctly
- Check CSS specificity conflicts
- Use browser dev tools to debug styles

For more troubleshooting help, see the [Troubleshooting Guide](../../support/troubleshooting.md).