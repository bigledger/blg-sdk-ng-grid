/**
 * ag-Grid GridOptions compatibility interface
 * Maps ag-Grid configuration to NgUiGrid equivalents
 */
export interface AgGridOptions {
  // Data Properties
  /** Row data for the grid */
  rowData?: any[];
  
  /** Column definitions */
  columnDefs?: AgColDef[];
  
  /** Default column definition applied to all columns */
  defaultColDef?: AgColDef;
  
  /** Auto-generate column definitions from row data */
  autoCreateColumns?: boolean;
  
  // Grid Properties
  /** Height of the grid in pixels or CSS string */
  height?: number | string;
  
  /** Width of the grid in pixels or CSS string */
  width?: number | string;
  
  /** Row height in pixels */
  rowHeight?: number;
  
  /** Header row height in pixels */
  headerHeight?: number;
  
  /** Whether to animate rows */
  animateRows?: boolean;
  
  // Feature Flags
  /** Enable sorting for all columns */
  enableSorting?: boolean;
  
  /** Enable filtering for all columns */
  enableFilter?: boolean;
  
  /** Enable column resizing for all columns */
  enableColResize?: boolean;
  
  /** Enable column reordering */
  enableColReorder?: boolean;
  
  // Selection
  /** Row selection mode */
  rowSelection?: 'single' | 'multiple';
  
  /** Allow multiple row selection with click (no Ctrl key needed) */
  rowMultiSelectWithClick?: boolean;
  
  /** Deselect all rows when clicking outside */
  rowDeselection?: boolean;
  
  /** Suppress row click selection */
  suppressRowClickSelection?: boolean;
  
  // Pagination
  /** Enable pagination */
  pagination?: boolean;
  
  /** Number of rows per page */
  paginationPageSize?: number;
  
  /** Available page size options */
  paginationPageSizeSelector?: number[] | boolean;
  
  /** Auto page size based on grid height */
  paginationAutoPageSize?: boolean;
  
  // Grouping & Tree Data
  /** Enable row grouping */
  rowGroupPanelShow?: 'always' | 'onlyWhenGrouping' | 'never';
  
  /** Auto group column definition */
  autoGroupColumnDef?: AgColDef;
  
  /** Group default expanded state */
  groupDefaultExpanded?: number;
  
  /** Tree data mode */
  treeData?: boolean;
  
  /** Function to get data path for tree data */
  getDataPath?: (data: any) => string[];
  
  // Virtual Scrolling
  /** Enable row virtualization */
  rowBuffer?: number;
  
  /** Viewport row model type */
  rowModelType?: 'clientSide' | 'infinite' | 'viewport' | 'serverSide';
  
  // Styling
  /** Grid theme */
  theme?: string;
  
  /** Row class rules */
  rowClassRules?: { [className: string]: string | ((params: any) => boolean) };
  
  /** Get row style function */
  getRowStyle?: (params: any) => any;
  
  /** Get row class function */
  getRowClass?: (params: any) => string | string[];
  
  // Context Menu & Clipboard
  /** Enable context menu */
  enableContextMenu?: boolean;
  
  /** Enable clipboard operations */
  enableClipboard?: boolean;
  
  // Events
  /** Grid ready event */
  onGridReady?: (params: GridReadyEvent) => void;
  
  /** Grid size changed event */
  onGridSizeChanged?: (params: GridSizeChangedEvent) => void;
  
  /** Row clicked event */
  onRowClicked?: (params: RowClickedEvent) => void;
  
  /** Row double clicked event */
  onRowDoubleClicked?: (params: RowDoubleClickedEvent) => void;
  
  /** Row selected event */
  onRowSelected?: (params: RowSelectedEvent) => void;
  
  /** Selection changed event */
  onSelectionChanged?: (params: SelectionChangedEvent) => void;
  
  /** Cell clicked event */
  onCellClicked?: (params: CellClickedEvent) => void;
  
  /** Cell double clicked event */
  onCellDoubleClicked?: (params: CellDoubleClickedEvent) => void;
  
  /** Cell value changed event */
  onCellValueChanged?: (params: CellValueChangedEvent) => void;
  
  /** Cell editing started event */
  onCellEditingStarted?: (params: CellEditingStartedEvent) => void;
  
  /** Cell editing stopped event */
  onCellEditingStopped?: (params: CellEditingStoppedEvent) => void;
  
  /** Column resized event */
  onColumnResized?: (params: ColumnResizedEvent) => void;
  
  /** Column moved event */
  onColumnMoved?: (params: ColumnMovedEvent) => void;
  
  /** Column visible event */
  onColumnVisible?: (params: ColumnVisibleEvent) => void;
  
  /** Column pinned event */
  onColumnPinned?: (params: ColumnPinnedEvent) => void;
  
  /** Sort changed event */
  onSortChanged?: (params: SortChangedEvent) => void;
  
  /** Filter changed event */
  onFilterChanged?: (params: FilterChangedEvent) => void;
  
  /** Pagination changed event */
  onPaginationChanged?: (params: PaginationChangedEvent) => void;
  
  /** First data rendered event */
  onFirstDataRendered?: (params: FirstDataRenderedEvent) => void;
  
  /** Model updated event */
  onModelUpdated?: (params: ModelUpdatedEvent) => void;
  
  // Advanced Configuration
  /** Suppress property names check */
  suppressPropertyNamesCheck?: boolean;
  
  /** Debug mode */
  debug?: boolean;
  
  /** Localization */
  localeText?: { [key: string]: string };
  
  /** Icons */
  icons?: { [key: string]: string };
  
  /** Get context menu items */
  getContextMenuItems?: (params: any) => (string | MenuItemDef)[];
  
  /** Get main menu items */
  getMainMenuItems?: (params: any) => string[];
  
  /** Process cell for clipboard */
  processCellForClipboard?: (params: any) => any;
  
  /** Process cell from clipboard */
  processCellFromClipboard?: (params: any) => any;
  
  /** Send to clipboard function */
  sendToClipboard?: (params: any) => void;
  
  /** Process data from clipboard */
  processDataFromClipboard?: (params: any) => string[][];
}

/** ag-Grid event interfaces for compatibility */
export interface GridReadyEvent {
  type: 'gridReady';
  api: any;
  columnApi: any;
}

export interface GridSizeChangedEvent {
  type: 'gridSizeChanged';
  api: any;
  columnApi: any;
  clientWidth: number;
  clientHeight: number;
}

export interface RowClickedEvent {
  type: 'rowClicked';
  node: any;
  data: any;
  rowIndex: number;
  event: MouseEvent | TouchEvent;
  api: any;
  columnApi: any;
}

export interface RowDoubleClickedEvent {
  type: 'rowDoubleClicked';
  node: any;
  data: any;
  rowIndex: number;
  event: MouseEvent | TouchEvent;
  api: any;
  columnApi: any;
}

export interface RowSelectedEvent {
  type: 'rowSelected';
  node: any;
  data: any;
  rowIndex: number;
  api: any;
  columnApi: any;
}

export interface SelectionChangedEvent {
  type: 'selectionChanged';
  api: any;
  columnApi: any;
}

export interface CellClickedEvent {
  type: 'cellClicked';
  node: any;
  data: any;
  value: any;
  rowIndex: number;
  column: any;
  colDef: AgColDef;
  event: MouseEvent | TouchEvent;
  api: any;
  columnApi: any;
}

export interface CellDoubleClickedEvent {
  type: 'cellDoubleClicked';
  node: any;
  data: any;
  value: any;
  rowIndex: number;
  column: any;
  colDef: AgColDef;
  event: MouseEvent | TouchEvent;
  api: any;
  columnApi: any;
}

export interface CellValueChangedEvent {
  type: 'cellValueChanged';
  node: any;
  data: any;
  oldValue: any;
  newValue: any;
  rowIndex: number;
  column: any;
  colDef: AgColDef;
  api: any;
  columnApi: any;
}

export interface CellEditingStartedEvent {
  type: 'cellEditingStarted';
  node: any;
  data: any;
  value: any;
  rowIndex: number;
  column: any;
  colDef: AgColDef;
  api: any;
  columnApi: any;
}

export interface CellEditingStoppedEvent {
  type: 'cellEditingStopped';
  node: any;
  data: any;
  value: any;
  rowIndex: number;
  column: any;
  colDef: AgColDef;
  api: any;
  columnApi: any;
}

export interface ColumnResizedEvent {
  type: 'columnResized';
  column: any;
  columns: any[];
  finished: boolean;
  api: any;
  columnApi: any;
}

export interface ColumnMovedEvent {
  type: 'columnMoved';
  column: any;
  toIndex: number;
  api: any;
  columnApi: any;
}

export interface ColumnVisibleEvent {
  type: 'columnVisible';
  column: any;
  columns: any[];
  visible: boolean;
  api: any;
  columnApi: any;
}

export interface ColumnPinnedEvent {
  type: 'columnPinned';
  column: any;
  columns: any[];
  pinned: 'left' | 'right' | null;
  api: any;
  columnApi: any;
}

export interface SortChangedEvent {
  type: 'sortChanged';
  api: any;
  columnApi: any;
}

export interface FilterChangedEvent {
  type: 'filterChanged';
  api: any;
  columnApi: any;
}

export interface PaginationChangedEvent {
  type: 'paginationChanged';
  animate?: boolean;
  keepRenderedRows?: boolean;
  newData?: boolean;
  newPage?: boolean;
  api: any;
  columnApi: any;
}

export interface FirstDataRenderedEvent {
  type: 'firstDataRendered';
  firstColumn: any;
  firstRow: any;
  api: any;
  columnApi: any;
}

export interface ModelUpdatedEvent {
  type: 'modelUpdated';
  animate?: boolean;
  keepRenderedRows?: boolean;
  newData?: boolean;
  newPage?: boolean;
  api: any;
  columnApi: any;
}

export interface MenuItemDef {
  name: string;
  disabled?: boolean;
  shortcut?: string;
  action?: () => void;
  checked?: boolean;
  icon?: string;
  subMenu?: (string | MenuItemDef)[];
  cssClasses?: string[];
  tooltip?: string;
}

// Re-export AgColDef for convenience
export interface AgColDef {
  [key: string]: any;
}