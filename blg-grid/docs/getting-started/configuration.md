# Configuration Guide

This comprehensive guide covers all configuration options available in BlgGrid, from basic setup to advanced enterprise features. Learn how to customize every aspect of your grid's behavior and appearance.

## Overview

BlgGrid configuration is split into two main areas:
- **Grid Configuration**: Global settings that affect the entire grid
- **Column Configuration**: Settings specific to individual columns

## Basic Configuration

### Minimal Setup

The simplest grid configuration:

```typescript
import { GridConfig } from '@blg-grid/core';

const basicConfig: GridConfig = {
  // Essential settings
  rowHeight: 40,
  virtualScrolling: true
};
```

### Recommended Starter Configuration

A good starting point for most applications:

```typescript
const starterConfig: GridConfig = {
  // Performance
  rowHeight: 48,
  virtualScrolling: true,
  
  // Features
  sortable: true,
  filterable: true,
  resizable: true,
  selectable: true,
  
  // Appearance
  theme: 'default',
  showFooter: false
};
```

## Grid Configuration Options

### Performance Settings

Control grid performance and rendering:

```typescript
const performanceConfig: GridConfig = {
  // Row rendering
  rowHeight: 40,                    // Fixed row height in pixels
  virtualScrolling: true,           // Enable virtual scrolling
  bufferSize: 20,                  // Number of extra rows to render
  
  // Change detection
  trackByFn: (index, item) => item.id,  // TrackBy function for performance
  
  // Debouncing
  filterDelay: 300,                // Delay for filter input (ms)
  sortDelay: 100,                  // Delay for sort operations (ms)
  
  // Memory management
  maxCachedRows: 1000,             // Maximum cached rows
  recycleDomElements: true         // Recycle DOM elements
};
```

### Data Management

Configure how the grid handles data:

```typescript
const dataConfig: GridConfig = {
  // Data source
  totalRows: undefined,            // Total rows (for server-side)
  clientSideData: true,           // Client-side vs server-side data
  
  // Data processing
  sortable: true,                 // Enable sorting globally
  filterable: true,               // Enable filtering globally
  grouping: false,                // Enable row grouping
  
  // Data validation
  validateData: true,             // Validate data structure
  strictMode: false,              // Strict validation mode
  
  // Data updates
  immutableData: true,            // Expect immutable data updates
  autoRefresh: false,             // Auto-refresh data
  refreshInterval: 30000          // Refresh interval (ms)
};
```

### User Interaction

Control user interaction features:

```typescript
const interactionConfig: GridConfig = {
  // Selection
  selectable: true,               // Enable row selection
  selectionMode: 'multiple',      // 'single' | 'multiple'
  checkboxSelection: true,        // Show selection checkboxes
  headerCheckboxSelection: true,  // Header checkbox for select all
  
  // Column operations
  resizable: true,                // Allow column resizing
  reorderable: true,             // Allow column reordering
  sortable: true,                // Allow column sorting
  
  // Cell interaction
  cellClickable: true,           // Enable cell clicking
  cellEditable: false,           // Enable cell editing
  doubleClickToEdit: true,       // Double-click to edit cells
  
  // Keyboard navigation
  keyboardNavigation: true,      // Enable keyboard navigation
  enterToEdit: true,             // Enter key starts editing
  escapeToCancel: true,          // Escape cancels editing
  tabToNextCell: true            // Tab moves to next cell
};
```

### Appearance and Styling

Customize the grid's visual appearance:

```typescript
const appearanceConfig: GridConfig = {
  // Theme
  theme: 'default',              // 'default' | 'dark' | 'material' | 'custom'
  
  // Layout
  showHeader: true,              // Show column headers
  showFooter: false,             // Show grid footer
  showBorders: true,             // Show cell borders
  stripedRows: true,             // Alternate row colors
  
  // Spacing
  rowHeight: 48,                 // Row height in pixels
  headerHeight: 56,              // Header height in pixels
  footerHeight: 48,              // Footer height in pixels
  
  // Icons
  showSortIcons: true,           // Show sort indicators
  showFilterIcons: true,         // Show filter icons
  showSelectionIcons: true,      // Show selection checkboxes
  
  // Loading states
  showLoadingOverlay: true,      // Show loading indicator
  loadingMessage: 'Loading...',  // Custom loading message
  
  // Empty state
  showNoDataMessage: true,       // Show message when no data
  noDataMessage: 'No data available'  // Custom no data message
};
```

### Pagination

Configure pagination features:

```typescript
const paginationConfig: GridConfig = {
  // Enable pagination
  pagination: true,
  
  // Pagination settings
  paginationConfig: {
    currentPage: 0,              // Starting page (0-based)
    pageSize: 25,                // Items per page
    pageSizeOptions: [10, 25, 50, 100],  // Available page sizes
    totalItems: undefined,       // Total items (for server-side)
    
    // Pagination mode
    mode: 'client',              // 'client' | 'server'
    
    // UI options
    showPageSizeSelector: true,   // Show page size dropdown
    showPageInfo: true,          // Show "1-25 of 100" info
    showFirstLastButtons: true,  // Show first/last page buttons
    maxPageButtons: 7,           // Max page buttons to show
    
    // Labels
    itemsPerPageLabel: 'Items per page:',
    pageInfoLabel: '{start}-{end} of {total}',
    firstPageLabel: 'First',
    lastPageLabel: 'Last',
    previousPageLabel: 'Previous',
    nextPageLabel: 'Next'
  }
};
```

### Row Grouping

Configure row grouping functionality:

```typescript
const groupingConfig: GridConfig = {
  // Enable grouping
  grouping: true,
  
  // Grouping settings
  groupingConfig: {
    // Grouping columns
    groupByColumns: ['department', 'status'],  // Columns to group by
    
    // Display options
    expandedByDefault: false,    // Groups expanded by default
    showGroupCount: true,        // Show item count in group header
    showGroupSummary: true,      // Show aggregated values
    
    // Group header
    groupHeaderTemplate: '{{group}} ({{count}} items)',
    groupHeaderHeight: 48,       // Group header height
    
    // Aggregations
    aggregations: {
      salary: ['sum', 'avg'],    // Functions for salary column
      age: ['avg', 'min', 'max'] // Functions for age column
    },
    
    // Sorting
    groupSorting: [{
      columnId: 'department',
      direction: 'asc',
      sortByAggregation: false
    }],
    
    // Interaction
    allowGroupCollapse: true,    // Allow collapsing groups
    clickToToggle: true         // Click group header to toggle
  }
};
```

### Export Configuration

Configure data export features:

```typescript
const exportConfig: GridConfig = {
  // Enable export
  export: true,
  
  // Export settings
  exportConfig: {
    // Available formats
    formats: ['csv', 'excel'],   // Available export formats
    
    // Default options
    defaultFilename: 'grid-data', // Default export filename
    includeHeaders: true,        // Include column headers
    dataScope: 'filtered',       // 'all' | 'visible' | 'filtered'
    
    // CSV options
    csvOptions: {
      delimiter: ',',            // CSV delimiter
      qualifier: '"',           // Text qualifier
      lineEnding: '\n',         // Line ending
      includeBom: true          // Include BOM for UTF-8
    },
    
    // Excel options
    excelOptions: {
      sheetName: 'Grid Data',   // Excel sheet name
      autoSizeColumns: true,    // Auto-size columns
      applyBasicStyling: true,  // Apply basic formatting
      
      // Multiple sheets
      multipleSheets: {
        enabled: false,         // Enable multiple sheets
        groupByColumn: 'department',  // Group by column
        sheetNameTemplate: '{{group}}'  // Sheet name template
      }
    }
  }
};
```

## Column Configuration

### Basic Column Setup

```typescript
import { ColumnDefinition } from '@blg-grid/core';

const basicColumns: ColumnDefinition[] = [
  {
    id: 'name',                  // Unique column identifier
    field: 'name',               // Data field name
    header: 'Full Name',         // Display header
    type: 'string',              // Data type
    width: 200,                  // Fixed width in pixels
    sortable: true,              // Enable sorting
    filterable: true             // Enable filtering
  }
];
```

### Advanced Column Configuration

```typescript
const advancedColumns: ColumnDefinition[] = [
  {
    // Basic properties
    id: 'employee-name',
    field: 'fullName',
    header: 'Employee Name',
    type: 'string',
    
    // Sizing
    width: 200,                  // Fixed width
    minWidth: 100,              // Minimum width
    maxWidth: 300,              // Maximum width
    autoSize: true,             // Auto-size to content
    
    // Behavior
    sortable: true,
    filterable: true,
    resizable: true,
    visible: true,
    pinned: 'left',             // Pin to left or right
    
    // Appearance
    align: 'left',              // 'left' | 'center' | 'right'
    headerAlign: 'center',      // Header alignment
    cssClass: 'custom-column',  // Custom CSS class
    
    // Cell rendering
    cellRenderer: 'text',       // Built-in renderer
    cellEditor: 'text',         // Built-in editor
    
    // Validation
    required: true,             // Required field
    validator: (value) => value.length > 0,  // Custom validator
    
    // Formatting
    format: {
      type: 'text',
      transform: 'uppercase'    // Text transformation
    }
  },
  
  // Numeric column
  {
    id: 'salary',
    field: 'salary',
    header: 'Salary',
    type: 'number',
    align: 'right',
    
    // Number-specific options
    cellRenderer: 'currency',
    format: {
      type: 'currency',
      currency: 'USD',
      decimals: 0
    },
    
    // Aggregation
    aggregation: ['sum', 'avg']
  },
  
  // Date column
  {
    id: 'hireDate',
    field: 'hireDate',
    header: 'Hire Date',
    type: 'date',
    
    // Date-specific options
    format: {
      type: 'date',
      pattern: 'MM/dd/yyyy'
    },
    
    // Date filtering
    filterType: 'date-range'
  },
  
  // Boolean column
  {
    id: 'isActive',
    field: 'isActive',
    header: 'Active',
    type: 'boolean',
    align: 'center',
    
    // Boolean rendering
    cellRenderer: 'checkbox',
    trueValue: 'Yes',
    falseValue: 'No'
  },
  
  // Custom column
  {
    id: 'actions',
    field: 'id',
    header: 'Actions',
    type: 'custom',
    sortable: false,
    filterable: false,
    width: 120,
    
    // Custom cell template
    cellRenderer: 'button-group',
    cellRendererParams: {
      buttons: [
        { label: 'Edit', action: 'edit', icon: 'edit' },
        { label: 'Delete', action: 'delete', icon: 'delete' }
      ]
    }
  }
];
```

## Complete Configuration Example

Here's a comprehensive configuration example:

```typescript
import { Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

@Component({
  selector: 'app-enterprise-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid 
      [data]="data"
      [columns]="columns"
      [config]="config"
      (gridReady)="onGridReady($event)"
      (selectionChanged)="onSelectionChanged($event)"
      (columnResized)="onColumnResized($event)">
    </blg-grid>
  `
})
export class EnterpriseGridComponent {
  data = [...]; // Your data

  columns: ColumnDefinition[] = [
    {
      id: 'id',
      field: 'id',
      header: 'ID',
      type: 'number',
      width: 80,
      pinned: 'left',
      sortable: true
    },
    {
      id: 'employee',
      field: 'employeeName',
      header: 'Employee',
      type: 'string',
      width: 200,
      sortable: true,
      filterable: true,
      pinned: 'left'
    },
    {
      id: 'department',
      field: 'department.name',
      header: 'Department',
      type: 'string',
      width: 150,
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
      filterable: true,
      cellRenderer: 'currency',
      format: {
        type: 'currency',
        currency: 'USD'
      }
    },
    {
      id: 'hireDate',
      field: 'hireDate',
      header: 'Hire Date',
      type: 'date',
      width: 130,
      sortable: true,
      filterable: true,
      format: {
        type: 'date',
        pattern: 'MM/dd/yyyy'
      }
    },
    {
      id: 'status',
      field: 'status',
      header: 'Status',
      type: 'string',
      width: 100,
      sortable: true,
      filterable: true,
      cellRenderer: 'badge'
    },
    {
      id: 'actions',
      field: 'id',
      header: 'Actions',
      type: 'custom',
      width: 120,
      sortable: false,
      filterable: false,
      cellRenderer: 'actions'
    }
  ];

  config: GridConfig = {
    // Performance
    rowHeight: 48,
    virtualScrolling: true,
    trackByFn: (index, item) => item.id,

    // Features
    sortable: true,
    filterable: true,
    resizable: true,
    reorderable: true,
    selectable: true,
    selectionMode: 'multiple',
    checkboxSelection: true,

    // Grouping
    grouping: true,
    groupingConfig: {
      groupByColumns: ['department.name'],
      expandedByDefault: true,
      showGroupCount: true,
      aggregations: {
        salary: ['sum', 'avg', 'count']
      }
    },

    // Pagination
    pagination: true,
    paginationConfig: {
      pageSize: 50,
      pageSizeOptions: [25, 50, 100, 200],
      showPageSizeSelector: true,
      showPageInfo: true
    },

    // Export
    export: true,
    exportConfig: {
      formats: ['csv', 'excel'],
      includeHeaders: true,
      dataScope: 'filtered'
    },

    // Appearance
    theme: 'default',
    showHeader: true,
    showFooter: true,
    stripedRows: true,
    showBorders: true,

    // Loading
    showLoadingOverlay: true,
    loadingMessage: 'Loading employees...',

    // Empty state
    noDataMessage: 'No employees found'
  };

  onGridReady(event: any) {
    console.log('Grid ready:', event);
  }

  onSelectionChanged(event: any) {
    console.log('Selection changed:', event);
  }

  onColumnResized(event: any) {
    console.log('Column resized:', event);
  }
}
```

## Configuration Patterns

### Responsive Configuration

Adjust configuration based on screen size:

```typescript
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({...})
export class ResponsiveGridComponent {
  private breakpointObserver = inject(BreakpointObserver);
  
  config = computed(() => {
    const isSmallScreen = this.breakpointObserver.isMatched('(max-width: 768px)');
    
    return {
      rowHeight: isSmallScreen ? 40 : 48,
      pagination: true,
      paginationConfig: {
        pageSize: isSmallScreen ? 10 : 25
      },
      // Hide less important columns on small screens
      showFooter: !isSmallScreen
    } as GridConfig;
  });
  
  columns = computed(() => {
    const isSmallScreen = this.breakpointObserver.isMatched('(max-width: 768px)');
    
    return this.baseColumns.map(col => ({
      ...col,
      visible: col.id === 'actions' ? !isSmallScreen : col.visible
    }));
  });
}
```

### Theme-Based Configuration

Switch configurations based on theme:

```typescript
@Component({...})
export class ThemedGridComponent {
  private themeService = inject(ThemeService);
  
  config = computed(() => {
    const isDark = this.themeService.isDarkTheme();
    
    return {
      theme: isDark ? 'dark' : 'default',
      rowHeight: 48,
      showBorders: !isDark, // Hide borders in dark theme
      stripedRows: !isDark  // No striped rows in dark theme
    } as GridConfig;
  });
}
```

### Environment-Based Configuration

Different configurations for different environments:

```typescript
import { environment } from '../environments/environment';

@Component({...})
export class EnvironmentGridComponent {
  config: GridConfig = {
    // Development features
    ...(environment.production ? {} : {
      debugMode: true,
      showPerformanceMetrics: true
    }),
    
    // Production optimizations
    ...(environment.production ? {
      virtualScrolling: true,
      bufferSize: 50
    } : {
      virtualScrolling: false // Easier debugging
    }),
    
    // Common settings
    sortable: true,
    filterable: true
  };
}
```

## Validation and Best Practices

### Configuration Validation

```typescript
function validateGridConfig(config: GridConfig): string[] {
  const errors: string[] = [];
  
  if (config.pagination && !config.paginationConfig) {
    errors.push('Pagination config required when pagination is enabled');
  }
  
  if (config.grouping && !config.groupingConfig) {
    errors.push('Grouping config required when grouping is enabled');
  }
  
  if (config.rowHeight && config.rowHeight < 20) {
    errors.push('Row height should be at least 20px');
  }
  
  return errors;
}

// Use in component
const errors = validateGridConfig(this.config);
if (errors.length > 0) {
  console.warn('Grid configuration issues:', errors);
}
```

### Performance Best Practices

```typescript
// Good: Static configuration
const optimizedConfig: GridConfig = {
  virtualScrolling: true,
  rowHeight: 48,
  trackByFn: (index, item) => item.id
};

// Avoid: Dynamic configuration that changes frequently
const inefficientConfig = computed(() => ({
  virtualScrolling: true,
  rowHeight: this.someReactiveValue(), // Causes re-renders
  theme: this.randomTheme() // Changes frequently
}));
```

## Next Steps

With your grid properly configured:

1. **[Data Binding](../features/data-binding.md)** - Learn data binding patterns
2. **[Column Features](../features/column-configuration.md)** - Deep dive into column features
3. **[Theming](../styling/themes.md)** - Customize grid appearance
4. **[Performance Guide](../guides/performance.md)** - Optimization strategies
5. **[API Reference](../api-reference/)** - Complete API documentation

## Configuration Examples

- [Basic Configuration](https://stackblitz.com/edit/blg-grid-basic-config)
- [Advanced Configuration](https://stackblitz.com/edit/blg-grid-advanced-config)
- [Responsive Configuration](https://stackblitz.com/edit/blg-grid-responsive-config)
- [Theme Configuration](https://stackblitz.com/edit/blg-grid-theme-config)
- [Enterprise Configuration](https://stackblitz.com/edit/blg-grid-enterprise-config)