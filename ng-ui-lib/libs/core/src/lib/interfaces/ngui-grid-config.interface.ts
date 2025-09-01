import { NgUiBaseConfig, NgUiPaginationConfig, NgUiSelectionConfig, NgUiSortDirection } from '../types/ngui-common.types';

/**
 * NgUI Grid Configuration Interface
 */
export interface NgUiGridConfig extends NgUiBaseConfig {
  /** Grid dimensions */
  dimensions?: {
    width?: number;
    height?: number;
    rowHeight?: number;
  };

  /** Virtual scrolling configuration */
  virtualScrolling?: {
    enabled?: boolean;
    itemSize?: number;
    bufferSize?: number;
  };

  /** Column configuration */
  columns?: {
    resizable?: boolean;
    reorderable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    groupable?: boolean;
  };

  /** Row configuration */
  rows?: {
    selectable?: boolean;
    editable?: boolean;
    expandable?: boolean;
    striped?: boolean;
    hoverable?: boolean;
  };

  /** Selection configuration */
  selection?: NgUiSelectionConfig;

  /** Pagination configuration */
  pagination?: NgUiPaginationConfig;

  /** Toolbar configuration */
  toolbar?: {
    enabled?: boolean;
    showSearch?: boolean;
    showExport?: boolean;
    showGrouping?: boolean;
    showFilters?: boolean;
    customActions?: NgUiGridAction[];
  };

  /** Performance settings */
  performance?: {
    trackByFn?: (index: number, item: any) => any;
    changeDetection?: 'OnPush' | 'Default';
    debounceTime?: number;
  };

  /** Loading configuration */
  loading?: {
    showIndicator?: boolean;
    text?: string;
    overlay?: boolean;
  };

  /** Error handling */
  errorHandling?: {
    showErrors?: boolean;
    retryAttempts?: number;
    fallbackMessage?: string;
  };
}

/**
 * NgUI Grid Column Definition
 */
export interface NgUiGridColumnDefinition {
  /** Unique column identifier */
  id: string;

  /** Display header text */
  header: string;

  /** Data field to display */
  field: string;

  /** Column data type */
  type?: 'string' | 'number' | 'date' | 'boolean' | 'custom';

  /** Column width */
  width?: number;

  /** Minimum width */
  minWidth?: number;

  /** Maximum width */
  maxWidth?: number;

  /** Column visibility */
  visible?: boolean;

  /** Column sorting */
  sortable?: boolean;

  /** Column filtering */
  filterable?: boolean;

  /** Column resizing */
  resizable?: boolean;

  /** Column grouping */
  groupable?: boolean;

  /** Cell editing */
  editable?: boolean;

  /** Custom cell renderer */
  cellRenderer?: (value: any, row: any, column: NgUiGridColumnDefinition) => string;

  /** Custom cell editor */
  cellEditor?: {
    type?: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'custom';
    options?: any[];
    validation?: (value: any) => boolean;
  };

  /** Column styling */
  cssClass?: string;

  /** Header styling */
  headerCssClass?: string;

  /** Cell styling function */
  cellCssClass?: (value: any, row: any) => string;

  /** Column alignment */
  align?: 'left' | 'center' | 'right';

  /** Header alignment */
  headerAlign?: 'left' | 'center' | 'right';

  /** Column footer */
  footer?: string | ((data: any[]) => string);

  /** Column aggregation */
  aggregation?: {
    type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
    format?: string;
  };

  /** Column metadata */
  metadata?: Record<string, any>;
}

/**
 * NgUI Grid Action Configuration
 */
export interface NgUiGridAction {
  /** Action identifier */
  id: string;

  /** Action label */
  label: string;

  /** Action icon */
  icon?: string;

  /** Action tooltip */
  tooltip?: string;

  /** Action handler */
  handler: (selectedRows: any[]) => void;

  /** Action visibility condition */
  visible?: (selectedRows: any[]) => boolean;

  /** Action enabled condition */
  enabled?: (selectedRows: any[]) => boolean;

  /** Action styling */
  cssClass?: string;
}

/**
 * NgUI Grid Event Interfaces
 */
export interface NgUiGridCellClickEvent {
  type: 'ngUiGridCellClick';
  rowIndex: number;
  columnId: string;
  value: any;
  rowData: any;
  timestamp: number;
}

export interface NgUiGridRowSelectEvent {
  type: 'ngUiGridRowSelect';
  rowIndex: number;
  rowData: any;
  selected: boolean;
  timestamp: number;
}

export interface NgUiGridColumnSortEvent {
  type: 'ngUiGridColumnSort';
  columnId: string;
  direction: NgUiSortDirection | null;
  timestamp: number;
}

export interface NgUiGridColumnResizeEvent {
  type: 'ngUiGridColumnResize';
  columnId: string;
  width: number;
  oldWidth: number;
  timestamp: number;
}

export interface NgUiGridCellEditEvent {
  type: 'ngUiGridCellEdit';
  rowIndex: number;
  columnId: string;
  oldValue: any;
  newValue: any;
  rowData: any;
  timestamp: number;
}

export type NgUiGridEvent = 
  | NgUiGridCellClickEvent
  | NgUiGridRowSelectEvent
  | NgUiGridColumnSortEvent
  | NgUiGridColumnResizeEvent
  | NgUiGridCellEditEvent;