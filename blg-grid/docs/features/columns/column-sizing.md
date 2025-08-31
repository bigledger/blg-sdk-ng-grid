# Column Sizing

## Overview

Column sizing in BLG Grid provides flexible control over column widths, including fixed widths, percentage-based sizing, auto-sizing based on content, and responsive behavior. Users can resize columns interactively or programmatically.

## Use Cases

- Fixed-width layouts for consistent appearance
- Responsive designs that adapt to screen size
- Auto-sizing based on content length
- User-customizable column widths
- Performance optimization for large datasets

## Basic Column Sizing

### Fixed Width Columns

```typescript
import { BlgGridComponent } from '@blg/grid';

@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs">
    </blg-grid>
  `
})
export class FixedWidthGridComponent {
  columnDefs = [
    { 
      field: 'id', 
      headerName: 'ID',
      width: 80,
      minWidth: 60,
      maxWidth: 120
    },
    { 
      field: 'name', 
      headerName: 'Name',
      width: 200
    },
    { 
      field: 'email', 
      headerName: 'Email',
      width: 250
    },
    { 
      field: 'status', 
      headerName: 'Status',
      width: 100
    }
  ];
}
```

### Flexible Width Columns

```typescript
columnDefs = [
  { 
    field: 'id', 
    headerName: 'ID',
    flex: 1,      // Takes 1 part of available space
    minWidth: 50
  },
  { 
    field: 'name', 
    headerName: 'Name',
    flex: 2,      // Takes 2 parts of available space
    minWidth: 100
  },
  { 
    field: 'description', 
    headerName: 'Description',
    flex: 3,      // Takes 3 parts of available space
    minWidth: 200
  }
];
```

### Auto-Sizing Columns

```typescript
@Component({
  template: `
    <div class="controls">
      <button (click)="autoSizeAll()">Auto Size All Columns</button>
      <button (click)="autoSizeColumn('name')">Auto Size Name Column</button>
      <button (click)="sizeColumnsToFit()">Size Columns to Fit</button>
    </div>
    <blg-grid 
      #grid
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (gridReady)="onGridReady($event)">
    </blg-grid>
  `
})
export class AutoSizingGridComponent {
  private gridApi!: GridApi;
  private columnApi!: ColumnApi;

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    
    // Auto-size columns on initial load
    this.autoSizeAll();
  }

  autoSizeAll(): void {
    const allColumnIds = this.columnApi.getAllColumns()?.map(col => col.getColId()) || [];
    this.columnApi.autoSizeColumns(allColumnIds);
  }

  autoSizeColumn(columnId: string): void {
    this.columnApi.autoSizeColumns([columnId]);
  }

  sizeColumnsToFit(): void {
    this.columnApi.sizeColumnsToFit();
  }
}
```

## Advanced Sizing Options

### Responsive Column Sizing

```typescript
export class ResponsiveColumnSizing {
  private screenSize = 'lg';

  columnDefs = [
    { 
      field: 'id', 
      headerName: 'ID',
      width: this.getColumnWidth('id'),
      hide: this.shouldHideColumn('id')
    },
    { 
      field: 'name', 
      headerName: 'Name',
      width: this.getColumnWidth('name')
    },
    { 
      field: 'email', 
      headerName: 'Email',
      width: this.getColumnWidth('email'),
      hide: this.shouldHideColumn('email')
    },
    { 
      field: 'phone', 
      headerName: 'Phone',
      width: this.getColumnWidth('phone'),
      hide: this.shouldHideColumn('phone')
    }
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateScreenSize();
    this.updateColumnSizing();
  }

  private updateScreenSize(): void {
    const width = window.innerWidth;
    if (width < 576) this.screenSize = 'xs';
    else if (width < 768) this.screenSize = 'sm';
    else if (width < 992) this.screenSize = 'md';
    else if (width < 1200) this.screenSize = 'lg';
    else this.screenSize = 'xl';
  }

  private getColumnWidth(field: string): number {
    const widthConfig = {
      xs: { id: 60, name: 120, email: 0, phone: 0 },
      sm: { id: 60, name: 150, email: 180, phone: 0 },
      md: { id: 80, name: 180, email: 200, phone: 140 },
      lg: { id: 80, name: 200, email: 250, phone: 150 },
      xl: { id: 100, name: 250, email: 300, phone: 180 }
    };
    
    return widthConfig[this.screenSize][field] || 150;
  }

  private shouldHideColumn(field: string): boolean {
    const hideConfig = {
      xs: ['email', 'phone'],
      sm: ['phone'],
      md: [],
      lg: [],
      xl: []
    };
    
    return hideConfig[this.screenSize].includes(field);
  }

  private updateColumnSizing(): void {
    this.columnDefs.forEach((colDef, index) => {
      colDef.width = this.getColumnWidth(colDef.field);
      colDef.hide = this.shouldHideColumn(colDef.field);
    });

    // Refresh grid with new column definitions
    this.gridApi?.setColumnDefs(this.columnDefs);
  }
}
```

### Content-Based Auto-Sizing

```typescript
export class ContentBasedSizing {
  private gridApi!: GridApi;
  private columnApi!: ColumnApi;

  columnDefs = [
    {
      field: 'dynamicContent',
      headerName: 'Dynamic Content',
      autoHeaderHeight: true,
      wrapText: true,
      resizable: true
    }
  ];

  onCellValueChanged(event: any): void {
    // Auto-resize column when content changes
    setTimeout(() => {
      this.autoSizeColumn(event.column.getColId());
    }, 100);
  }

  onDataChanged(): void {
    // Auto-resize all columns when data is loaded/changed
    setTimeout(() => {
      this.autoSizeAllColumns();
    }, 100);
  }

  private autoSizeColumn(columnId: string): void {
    this.columnApi.autoSizeColumns([columnId], false);
  }

  private autoSizeAllColumns(): void {
    const allColumnIds = this.columnApi.getAllColumns()?.map(col => col.getColId()) || [];
    this.columnApi.autoSizeColumns(allColumnIds, false);
  }

  // Advanced auto-sizing with padding
  autoSizeWithPadding(columnIds: string[], padding: number = 20): void {
    this.columnApi.autoSizeColumns(columnIds, false);
    
    // Add padding to auto-sized columns
    columnIds.forEach(columnId => {
      const column = this.columnApi.getColumn(columnId);
      if (column) {
        const currentWidth = column.getActualWidth();
        this.columnApi.setColumnWidth(columnId, currentWidth + padding);
      }
    });
  }
}
```

## Interactive Column Resizing

### Enable User Resizing

```typescript
columnDefs = [
  {
    field: 'name',
    headerName: 'Name',
    resizable: true,
    sortable: true,
    filter: true
  },
  {
    field: 'description',
    headerName: 'Description',
    resizable: true,
    minWidth: 100,
    maxWidth: 500,
    suppressSizeToFit: false
  }
];

// Grid options for resizing behavior
gridOptions = {
  // Enable column resizing
  columnResizeMode: 'normal', // or 'shift'
  
  // Suppress auto-sizing on data load
  suppressAutoSize: false,
  
  // Suppress size to fit
  suppressSizeToFit: false,
  
  // Enable column hover
  suppressColumnMoveAnimation: false
};
```

### Resizing Events and Callbacks

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (columnResized)="onColumnResized($event)"
      (columnGroupResized)="onColumnGroupResized($event)">
    </blg-grid>
  `
})
export class ResizingEventsComponent {
  onColumnResized(event: ColumnResizedEvent): void {
    console.log('Column resized:', {
      column: event.column?.getColId(),
      newWidth: event.column?.getActualWidth(),
      finished: event.finished,
      source: event.source
    });

    // Save column widths to localStorage
    if (event.finished) {
      this.saveColumnWidths();
    }
  }

  onColumnGroupResized(event: any): void {
    console.log('Column group resized:', event);
  }

  private saveColumnWidths(): void {
    const columnState = this.columnApi.getColumnState();
    localStorage.setItem('gridColumnState', JSON.stringify(columnState));
  }

  private restoreColumnWidths(): void {
    const columnState = localStorage.getItem('gridColumnState');
    if (columnState) {
      this.columnApi.setColumnState(JSON.parse(columnState));
    }
  }
}
```

## Programmatic Column Sizing

### Setting Column Widths

```typescript
export class ProgrammaticSizing {
  private columnApi!: ColumnApi;

  // Set single column width
  setColumnWidth(columnId: string, width: number): void {
    this.columnApi.setColumnWidth(columnId, width);
  }

  // Set multiple column widths
  setColumnWidths(widthMap: Record<string, number>): void {
    Object.entries(widthMap).forEach(([columnId, width]) => {
      this.columnApi.setColumnWidth(columnId, width);
    });
  }

  // Reset to default widths
  resetColumnWidths(): void {
    const columnState = this.columnApi.getColumnState();
    const resetState = columnState.map(col => ({
      ...col,
      width: this.getDefaultWidth(col.colId)
    }));
    this.columnApi.setColumnState(resetState);
  }

  // Distribute available width equally
  distributeWidthEqually(): void {
    const columns = this.columnApi.getAllDisplayedColumns();
    const availableWidth = this.gridApi.getDisplayedRowAtIndex(0)?.clientWidth || 800;
    const columnWidth = Math.floor(availableWidth / columns.length);
    
    columns.forEach(column => {
      this.columnApi.setColumnWidth(column.getColId(), columnWidth);
    });
  }

  private getDefaultWidth(columnId: string): number {
    const defaultWidths = {
      id: 80,
      name: 200,
      email: 250,
      phone: 150,
      status: 100
    };
    return defaultWidths[columnId] || 150;
  }
}
```

### Column State Management

```typescript
export class ColumnStateManager {
  private columnApi!: ColumnApi;

  // Save current column state
  saveColumnState(): string {
    const state = this.columnApi.getColumnState();
    return JSON.stringify(state);
  }

  // Restore column state
  restoreColumnState(stateJson: string): void {
    try {
      const state = JSON.parse(stateJson);
      this.columnApi.setColumnState(state);
    } catch (error) {
      console.error('Invalid column state:', error);
    }
  }

  // Get column widths only
  getColumnWidths(): Record<string, number> {
    const state = this.columnApi.getColumnState();
    return state.reduce((widths, col) => {
      if (col.width) {
        widths[col.colId] = col.width;
      }
      return widths;
    }, {} as Record<string, number>);
  }

  // Apply column widths only
  applyColumnWidths(widths: Record<string, number>): void {
    Object.entries(widths).forEach(([columnId, width]) => {
      this.columnApi.setColumnWidth(columnId, width);
    });
  }

  // Reset to original column definitions
  resetToDefaults(): void {
    this.columnApi.resetColumnState();
  }
}
```

## Performance Considerations

### Virtual Column Rendering

```typescript
// For grids with many columns, enable virtual column rendering
gridOptions = {
  // Only render visible columns
  suppressColumnVirtualisation: false,
  
  // Set viewport column buffer
  viewportColumnBuffer: 2,
  
  // Enable RTL support if needed
  enableRtl: false
};
```

### Optimized Resizing

```typescript
export class OptimizedResizing {
  private resizeTimeout?: number;
  
  onColumnResized(event: ColumnResizedEvent): void {
    // Debounce resize operations
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout(() => {
      this.handleResizeComplete(event);
    }, 100);
  }

  private handleResizeComplete(event: ColumnResizedEvent): void {
    // Perform expensive operations only after resize is complete
    this.recalculateLayout();
    this.saveUserPreferences();
  }

  // Batch resize operations
  batchResizeColumns(resizeOperations: Array<{columnId: string, width: number}>): void {
    // Start batch update
    this.gridApi.setSuppressModelUpdateAfterUpdateTransaction(true);
    
    // Apply all resize operations
    resizeOperations.forEach(({columnId, width}) => {
      this.columnApi.setColumnWidth(columnId, width);
    });
    
    // End batch update
    this.gridApi.setSuppressModelUpdateAfterUpdateTransaction(false);
  }
}
```

## API Reference

### Grid Options

| Option | Type | Description |
|--------|------|-------------|
| `columnResizeMode` | 'normal' \| 'shift' | Column resize behavior |
| `suppressAutoSize` | boolean | Disable auto-sizing |
| `suppressSizeToFit` | boolean | Disable size to fit |
| `suppressColumnMoveAnimation` | boolean | Disable resize animations |

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `width` | number | Fixed column width in pixels |
| `minWidth` | number | Minimum column width |
| `maxWidth` | number | Maximum column width |
| `flex` | number | Flexible width ratio |
| `resizable` | boolean | Allow user resizing |
| `suppressSizeToFit` | boolean | Exclude from size to fit |
| `autoHeaderHeight` | boolean | Auto-size header height |

### API Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `autoSizeColumns()` | `columnIds: string[], skipHeader?: boolean` | Auto-size columns to content |
| `sizeColumnsToFit()` | `params?: any` | Size columns to fit grid width |
| `setColumnWidth()` | `columnId: string, width: number` | Set column width |
| `getColumnState()` | - | Get current column state |
| `setColumnState()` | `state: any[]` | Set column state |
| `resetColumnState()` | - | Reset to default state |

### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `columnResized` | Column width changed | ColumnResizedEvent |
| `columnGroupResized` | Column group resized | ColumnGroupResizedEvent |

## Common Patterns

### Saved Column Preferences

```typescript
export class ColumnPreferences {
  private readonly STORAGE_KEY = 'grid-column-preferences';

  ngOnInit(): void {
    this.loadColumnPreferences();
  }

  onGridReady(params: any): void {
    this.columnApi = params.columnApi;
    this.loadColumnPreferences();
  }

  onColumnResized(event: ColumnResizedEvent): void {
    if (event.finished) {
      this.saveColumnPreferences();
    }
  }

  private saveColumnPreferences(): void {
    const columnState = this.columnApi.getColumnState();
    const preferences = {
      timestamp: Date.now(),
      columns: columnState.map(col => ({
        colId: col.colId,
        width: col.width,
        hide: col.hide,
        pinned: col.pinned
      }))
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
  }

  private loadColumnPreferences(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved && this.columnApi) {
      try {
        const preferences = JSON.parse(saved);
        // Only apply if preferences are recent (within 30 days)
        if (Date.now() - preferences.timestamp < 30 * 24 * 60 * 60 * 1000) {
          this.columnApi.setColumnState(preferences.columns);
        }
      } catch (error) {
        console.error('Failed to load column preferences:', error);
      }
    }
  }
}
```

### Dynamic Column Sizing

```typescript
export class DynamicColumnSizing {
  private contentLengthMap = new Map<string, number>();

  onCellValueChanged(event: CellValueChangedEvent): void {
    this.updateColumnContentLength(event.column.getColId(), event.newValue);
  }

  private updateColumnContentLength(columnId: string, value: any): void {
    const length = String(value || '').length;
    const currentMax = this.contentLengthMap.get(columnId) || 0;
    
    if (length > currentMax) {
      this.contentLengthMap.set(columnId, length);
      this.adjustColumnWidth(columnId, length);
    }
  }

  private adjustColumnWidth(columnId: string, contentLength: number): void {
    const baseWidth = 50;
    const charWidth = 8; // Approximate character width
    const padding = 20;
    const calculatedWidth = baseWidth + (contentLength * charWidth) + padding;
    
    const column = this.columnApi.getColumn(columnId);
    if (column) {
      const minWidth = column.getColDef().minWidth || 50;
      const maxWidth = column.getColDef().maxWidth || 500;
      const newWidth = Math.min(Math.max(calculatedWidth, minWidth), maxWidth);
      
      this.columnApi.setColumnWidth(columnId, newWidth);
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Columns not resizing**: Check if `resizable: true` is set and grid has sufficient width
2. **Auto-sizing not working**: Ensure data is loaded before calling `autoSizeColumns()`
3. **Flex columns not working**: Verify total available width and min/max width constraints
4. **Size to fit issues**: Check for hidden columns or fixed-width columns that prevent fitting

### Debugging Column Sizing

```typescript
export class ColumnSizingDebugger {
  debugColumnSizing(): void {
    const columns = this.columnApi.getAllColumns() || [];
    
    console.group('Column Sizing Debug');
    columns.forEach(column => {
      const colDef = column.getColDef();
      console.log(`Column: ${column.getColId()}`, {
        actualWidth: column.getActualWidth(),
        definedWidth: colDef.width,
        minWidth: colDef.minWidth,
        maxWidth: colDef.maxWidth,
        flex: colDef.flex,
        resizable: colDef.resizable,
        visible: column.isVisible()
      });
    });
    console.groupEnd();

    // Check grid container width
    const gridWidth = this.gridApi.getDisplayedRowAtIndex(0)?.clientWidth;
    console.log('Grid container width:', gridWidth);

    // Check total column widths
    const totalWidth = columns.reduce((sum, col) => sum + col.getActualWidth(), 0);
    console.log('Total column widths:', totalWidth);
  }
}
```

## Best Practices

1. **Use flexible widths (flex)** for responsive designs
2. **Set appropriate min/max widths** to prevent columns from becoming too small or large
3. **Enable user resizing** for better user experience with `resizable: true`
4. **Auto-size based on content** when data characteristics vary significantly
5. **Save and restore column preferences** for personalized user experience
6. **Consider performance** with virtual column rendering for large datasets
7. **Test responsive behavior** across different screen sizes
8. **Provide sensible defaults** that work well for most common use cases