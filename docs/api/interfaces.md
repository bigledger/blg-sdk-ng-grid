# TypeScript Interfaces Reference

This document provides a comprehensive reference for all TypeScript interfaces used in the BLG Grid library.

## Core Interfaces

### GridConfig
Main configuration interface for the grid component.

```typescript
interface GridConfig {
  // Grid dimensions and layout
  totalRows?: number;                    // Total number of rows
  rowHeight?: number;                    // Height of each row in pixels (default: 40)
  
  // Performance features
  virtualScrolling?: boolean;            // Enable virtual scrolling (default: true)
  
  // Interactive features
  sortable?: boolean;                    // Enable sorting (default: true)
  filterable?: boolean;                  // Enable filtering (default: true)
  selectable?: boolean;                  // Enable row selection (default: true)
  selectionMode?: 'single' | 'multiple'; // Selection mode (default: 'multiple')
  resizable?: boolean;                   // Enable column resizing (default: true)
  reorderable?: boolean;                 // Enable column reordering (default: true)
  
  // UI elements
  theme?: string;                        // Grid theme name
  showFooter?: boolean;                  // Show footer row (default: false)
  
  // Pagination
  pagination?: boolean;                  // Enable pagination
  paginationConfig?: PaginationConfig;   // Pagination configuration
  
  // Grouping
  grouping?: boolean;                    // Enable row grouping
  groupingConfig?: GroupingConfig;       // Grouping configuration
  
  // Export
  export?: boolean;                      // Enable data export
  exportConfig?: ExportConfig;           // Export configuration
}
```

### ColumnDefinition
Defines the structure and behavior of a grid column.

```typescript
interface ColumnDefinition {
  // Required properties
  id: string;                           // Unique column identifier
  field: string;                        // Field name in data object
  header: string;                       // Display header text
  
  // Sizing
  width?: number;                       // Column width in pixels
  minWidth?: number;                    // Minimum width (default: 50)
  maxWidth?: number;                    // Maximum width (default: 500)
  
  // Behavior
  sortable?: boolean;                   // Override grid sortable setting
  filterable?: boolean;                 // Override grid filterable setting
  resizable?: boolean;                  // Override grid resizable setting
  visible?: boolean;                    // Column visibility (default: true)
  
  // Data handling
  type?: 'string' | 'number' | 'date' | 'boolean' | 'custom'; // Data type (default: 'string')
  
  // Rendering
  cellRenderer?: string;                // Custom cell template
  cellEditor?: string | boolean;        // Cell editor configuration
  align?: 'left' | 'center' | 'right'; // Content alignment
  pinned?: 'left' | 'right';           // Pin column position
}
```

## Event Interfaces

### Base Event
```typescript
interface GridEvent<T = any> {
  type: string;                         // Event type identifier
  data?: T;                            // Event-specific data
  source?: string;                     // Event source (optional)
  timestamp?: Date;                    // Event timestamp
}
```

### CellClickEvent
```typescript
interface CellClickEvent extends GridEvent {
  type: 'cell-click';
  data: {
    rowIndex: number;                   // Row index in current view
    columnId: string;                   // Column identifier
    value: any;                         // Cell value
    rowData: any;                       // Complete row data
  };
}
```

### RowSelectEvent
```typescript
interface RowSelectEvent extends GridEvent {
  type: 'row-select';
  data: {
    rowIndex: number;                   // Row index in current view
    rowData: any;                       // Complete row data
    selected: boolean;                  // New selection state
  };
}
```

### ColumnSortEvent
```typescript
interface ColumnSortEvent extends GridEvent {
  type: 'column-sort';
  data: {
    columnId: string;                   // Column being sorted
    direction: 'asc' | 'desc' | null;  // Sort direction
    sortState?: {                       // Multi-column sort state
      columnId: string;
      direction: 'asc' | 'desc';
      order: number;                    // Sort precedence
    }[] | null;
  };
}
```

### ColumnResizeEvent
```typescript
interface ColumnResizeEvent extends GridEvent {
  type: 'column-resize';
  data: {
    columnId: string;                   // Column being resized
    width: number;                      // New width
    oldWidth: number;                   // Previous width
  };
}
```

### PaginationEvent
```typescript
interface PaginationEvent extends GridEvent {
  type: 'pagination';
  data: {
    currentPage: number;                // New current page (0-based)
    pageSize: number;                   // Items per page
    totalItems: number;                 // Total items available
  };
}
```

### CellEditEvent
```typescript
interface CellEditEvent extends GridEvent {
  type: 'cell-edit';
  data: {
    rowIndex: number;                   // Row index in current view
    columnId: string;                   // Column identifier
    oldValue: any;                      // Previous cell value
    newValue: any;                      // New cell value
    rowData: any;                       // Updated row data
  };
}
```

### GridEventType Union
```typescript
type GridEventType = 
  | CellClickEvent 
  | RowSelectEvent 
  | ColumnSortEvent 
  | ColumnResizeEvent 
  | PaginationEvent 
  | CellEditEvent;
```

## Configuration Interfaces

### PaginationConfig
```typescript
interface PaginationConfig {
  currentPage?: number;                 // Current page (0-based, default: 0)
  pageSize?: number;                    // Items per page (default: 25)
  pageSizeOptions?: number[];           // Available page sizes (default: [10, 25, 50, 100])
  totalItems?: number;                  // Total items (for server-side)
  mode?: 'client' | 'server';          // Pagination mode (default: 'client')
  showPageSizeSelector?: boolean;       // Show page size dropdown (default: true)
  showPageInfo?: boolean;               // Show page info text (default: true)
  maxPageButtons?: number;              // Max page buttons to show (default: 7)
}
```

### GroupingConfig
```typescript
interface GroupingConfig {
  groupByColumns?: string[];            // Columns to group by
  expandedByDefault?: boolean;          // Initial expansion state (default: false)
  showGroupCount?: boolean;             // Show item count in group headers (default: true)
  aggregations?: {                      // Column aggregations
    [columnId: string]: ('sum' | 'avg' | 'count' | 'min' | 'max' | 'custom')[];
  };
  groupHeaderTemplate?: string;         // Custom group header template
  groupSorting?: {                      // Group sorting configuration
    columnId: string;
    direction: 'asc' | 'desc';
    sortByAggregation?: boolean;
    aggregationFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
  }[];
}
```

### ExportConfig
```typescript
interface ExportConfig {
  formats?: ('csv' | 'excel')[];        // Available export formats (default: ['csv', 'excel'])
  defaultFilename?: string;             // Default filename (default: 'grid-export')
  includeHeaders?: boolean;             // Include column headers (default: true)
  dataScope?: 'all' | 'visible' | 'filtered'; // Data scope (default: 'visible')
  
  // CSV options
  csvOptions?: {
    delimiter?: string;                 // Field delimiter (default: ',')
    qualifier?: string;                 // Text qualifier (default: '"')
    lineEnding?: '\n' | '\r\n';        // Line ending (default: '\n')
    includeBom?: boolean;               // Include UTF-8 BOM (default: true)
  };
  
  // Excel options
  excelOptions?: {
    sheetName?: string;                 // Worksheet name (default: 'Sheet1')
    autoSizeColumns?: boolean;          // Auto-size columns (default: true)
    applyBasicStyling?: boolean;        // Apply basic styling (default: true)
    multipleSheets?: {                  // Multiple sheets configuration
      enabled: boolean;
      groupByColumn?: string;
      sheetNameTemplate?: string;
    };
  };
}
```

## State Management Interfaces

### GridState
```typescript
interface GridState {
  columns: ColumnDefinition[];          // Column definitions
  config: GridConfig;                   // Grid configuration
  selectedRows: Set<number>;            // Selected row indices
  sortState: {                          // Multi-column sort state
    columnId: string;
    direction: 'asc' | 'desc';
    order: number;
  }[] | null;
  filterState: Record<string, any>;     // Filter values by column
  scrollPosition: { x: number; y: number }; // Scroll position
  paginationState: PaginationConfig;    // Pagination state
}
```

## Grouping Interfaces

### GroupedRow
```typescript
interface GroupedRow {
  type: 'group' | 'data';              // Row type
  data?: any;                          // Original row data (for data rows)
  group?: GroupInfo;                   // Group information (for group rows)
  level: number;                       // Nesting level
  expanded?: boolean;                  // Group expansion state
  parentGroupId?: string;              // Parent group ID
}
```

### GroupInfo
```typescript
interface GroupInfo {
  id: string;                          // Unique group identifier
  columnId: string;                    // Grouping column ID
  displayValue: string;                // Formatted display value
  rawValue: any;                       // Original grouping value
  count: number;                       // Number of items in group
  children: GroupedRow[];              // Child rows
  aggregations?: {                     // Aggregated values
    [columnId: string]: { 
      [functionName: string]: any 
    };
  };
  expanded: boolean;                   // Expansion state
  level: number;                       // Nesting level
}
```

### GroupingState
```typescript
interface GroupingState {
  groupByColumns: string[];            // Columns being grouped by
  expandedGroups: Set<string>;         // Expanded group IDs
  aggregations: {                      // Aggregation configurations
    [columnId: string]: AggregationConfig[];
  };
  groupSorting: GroupSortConfig[];     // Group sorting configurations
}
```

### AggregationConfig
```typescript
interface AggregationConfig {
  function: AggregationFunction;        // Aggregation function type
  label?: string;                      // Display label
  customFunction?: (values: any[]) => any; // Custom function (for 'custom' type)
  formatter?: (value: any) => string;  // Value formatter
}
```

### GroupSortConfig
```typescript
interface GroupSortConfig {
  columnId: string;                    // Column to sort by
  direction: 'asc' | 'desc';          // Sort direction
  sortByAggregation?: boolean;         // Sort by aggregated value
  aggregationFunction?: AggregationFunction; // Function for aggregation-based sorting
}
```

### AggregationFunction Type
```typescript
type AggregationFunction = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
```

## Export Interfaces

### ExportData
```typescript
interface ExportData {
  headers: string[];                   // Column headers
  rows: any[][];                      // Row data
  columns: ExportColumn[];            // Column information
  metadata: ExportMetadata;           // Export metadata
}
```

### ExportColumn
```typescript
interface ExportColumn {
  id: string;                         // Column ID
  header: string;                     // Header text
  field: string;                      // Data field
  type: string;                       // Data type
  width?: number;                     // Column width (for Excel)
}
```

### ExportMetadata
```typescript
interface ExportMetadata {
  exportDate: Date;                   // Export timestamp
  totalRows: number;                  // Number of rows exported
  format: ExportFormat;               // Export format used
  filename: string;                   // Export filename
  hasGrouping: boolean;               // Whether grouping was applied
  appliedFilters?: {                  // Filters applied during export
    [columnId: string]: any;
  };
}
```

### ExportOptions
```typescript
interface ExportOptions {
  format: ExportFormat;               // Export format
  filename: string;                   // Filename (without extension)
  includeHeaders: boolean;            // Include column headers
  dataScope: 'all' | 'visible' | 'filtered'; // Data to export
  includeColumns?: string[];          // Specific columns to include
  formatOptions?: CsvExportOptions | ExcelExportOptions; // Format-specific options
}
```

### CsvExportOptions
```typescript
interface CsvExportOptions {
  delimiter: string;                  // Field separator
  qualifier: string;                  // Text qualifier
  lineEnding: '\n' | '\r\n';        // Line terminator
  includeBom: boolean;               // UTF-8 BOM
}
```

### ExcelExportOptions
```typescript
interface ExcelExportOptions {
  sheetName: string;                  // Worksheet name
  autoSizeColumns: boolean;           // Auto-size columns
  applyBasicStyling: boolean;         // Apply styling
  headerStyle?: ExcelCellStyle;       // Header styling
  dataStyle?: ExcelCellStyle;         // Data styling
  multipleSheets?: {                  // Multi-sheet configuration
    enabled: boolean;
    groupByColumn?: string;
    sheetNameTemplate?: string;
  };
}
```

### ExcelCellStyle
```typescript
interface ExcelCellStyle {
  font?: {                           // Font styling
    bold?: boolean;
    italic?: boolean;
    color?: string;                  // Hex color
    size?: number;
  };
  fill?: {                           // Background fill
    fgColor?: string;                // Foreground color (hex)
    bgColor?: string;                // Background color (hex)
  };
  alignment?: {                      // Text alignment
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'middle' | 'bottom';
  };
  border?: {                         // Border styling
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    color?: string;                  // Border color (hex)
  };
}
```

### ExportFormat Type
```typescript
type ExportFormat = 'csv' | 'excel';
```

## Usage Examples

### Complete Type-Safe Grid Setup

```typescript
import { Component } from '@angular/core';
import { 
  GridConfig, 
  ColumnDefinition, 
  GridEventType,
  CellClickEvent,
  RowSelectEvent 
} from '@ng-ui/core';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-typed-grid',
  template: `
    <ng-ui-lib 
      [data]="userData"
      [columns]="columns"
      [config]="config"
      (gridEvent)="onGridEvent($event)"
      (cellClick)="onCellClick($event)"
      (rowSelect)="onRowSelect($event)">
    </ng-ui-lib>
  `
})
export class TypedGridComponent {
  userData: UserData[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true,
      createdAt: new Date('2023-01-15')
    }
    // ... more data
  ];

  columns: ColumnDefinition[] = [
    {
      id: 'id',
      field: 'id',
      header: 'ID',
      type: 'number',
      width: 80,
      pinned: 'left'
    },
    {
      id: 'firstName',
      field: 'firstName',
      header: 'First Name',
      type: 'string',
      sortable: true,
      filterable: true
    },
    {
      id: 'lastName',
      field: 'lastName',
      header: 'Last Name',
      type: 'string',
      sortable: true,
      filterable: true
    },
    {
      id: 'email',
      field: 'email',
      header: 'Email',
      type: 'string',
      cellRenderer: '<a href="mailto:{{value}}">{{value}}</a>'
    },
    {
      id: 'age',
      field: 'age',
      header: 'Age',
      type: 'number',
      align: 'right'
    },
    {
      id: 'isActive',
      field: 'isActive',
      header: 'Active',
      type: 'boolean',
      align: 'center'
    },
    {
      id: 'createdAt',
      field: 'createdAt',
      header: 'Created',
      type: 'date'
    }
  ];

  config: GridConfig = {
    virtualScrolling: true,
    sortable: true,
    filterable: true,
    selectable: true,
    selectionMode: 'multiple',
    resizable: true,
    pagination: true,
    paginationConfig: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
      showPageSizeSelector: true,
      showPageInfo: true
    },
    grouping: true,
    export: true
  };

  onGridEvent(event: GridEventType): void {
    console.log(`Grid event: ${event.type}`, event);
  }

  onCellClick(event: CellClickEvent): void {
    const { rowIndex, columnId, value } = event.data;
    console.log(`Cell clicked: Row ${rowIndex}, Column ${columnId}, Value: ${value}`);
  }

  onRowSelect(event: RowSelectEvent): void {
    const { rowData, selected } = event.data;
    console.log(`Row ${selected ? 'selected' : 'deselected'}:`, rowData);
  }
}
```

### Custom Interface Extensions

```typescript
// Extend base interfaces for custom functionality
interface ExtendedGridConfig extends GridConfig {
  customFeatures?: {
    autoSave?: boolean;
    realTimeUpdates?: boolean;
    auditLog?: boolean;
  };
}

interface CustomColumnDefinition extends ColumnDefinition {
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: any) => boolean;
  };
  permissions?: {
    read?: string[];
    write?: string[];
  };
}
```