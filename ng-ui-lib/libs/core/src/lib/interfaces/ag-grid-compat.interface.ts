import { ColumnDefinition } from './column-definition.interface';

/**
 * ag-Grid compatible column definition
 */
export interface ColDef {
  /** Column ID */
  colId?: string;
  /** Field name in data object */
  field?: string;
  /** Column header text */
  headerName?: string;
  /** Column width in pixels */
  width?: number;
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filter?: boolean | string | any;
  /** Whether column is resizable */
  resizable?: boolean;
  /** Whether column is visible */
  hide?: boolean;
  /** Column pinned position */
  pinned?: 'left' | 'right' | null;
  /** Cell renderer */
  cellRenderer?: string | any;
  /** Cell editor */
  cellEditor?: string | any;
  /** Cell editor parameters */
  cellEditorParams?: any;
  /** Cell renderer parameters */
  cellRendererParams?: any;
  /** Value getter function */
  valueGetter?: (params: any) => any;
  /** Value setter function */
  valueSetter?: (params: any) => boolean;
  /** Column type */
  type?: string | string[];
  /** Whether column is editable */
  editable?: boolean | ((params: any) => boolean);
  /** Column group */
  headerClass?: string | string[] | ((params: any) => string | string[]);
  /** Cell class */
  cellClass?: string | string[] | ((params: any) => string | string[]);
  /** Header tooltip */
  headerTooltip?: string;
  /** Enable row group */
  enableRowGroup?: boolean;
  /** Enable pivot */
  enablePivot?: boolean;
  /** Enable value aggregation */
  enableValue?: boolean;
  /** Aggregation function */
  aggFunc?: string | ((params: any) => any);
  /** Column comparator for sorting */
  comparator?: (a: any, b: any) => number;
  /** Equals function for filtering */
  equals?: (a: any, b: any) => boolean;
}

/**
 * ag-Grid compatible grid options
 */
export interface AgGridOptions {
  /** Row data */
  rowData?: any[];
  /** Column definitions */
  columnDefs?: ColDef[];
  /** Default column definition */
  defaultColDef?: ColDef;
  /** Enable sorting */
  sortable?: boolean;
  /** Enable filtering */
  filterable?: boolean;
  /** Enable column resizing */
  resizable?: boolean;
  /** Row selection mode */
  rowSelection?: 'single' | 'multiple';
  /** Row height */
  rowHeight?: number;
  /** Header height */
  headerHeight?: number;
  /** Enable pagination */
  pagination?: boolean;
  /** Page size */
  paginationPageSize?: number;
  /** Enable cell editing */
  editable?: boolean;
  /** Suppress row click selection */
  suppressRowClickSelection?: boolean;
  /** Suppress cell selection */
  suppressCellSelection?: boolean;
  /** Row multi select with click */
  rowMultiSelectWithClick?: boolean;
  /** Suppress row deselection */
  suppressRowDeselection?: boolean;
  /** Enable range selection */
  enableRangeSelection?: boolean;
  /** Enable clipboard */
  enableClipboard?: boolean;
  /** Row group panel show */
  rowGroupPanelShow?: 'always' | 'onlyWhenGrouping' | 'never';
  /** Side bar */
  sideBar?: boolean | string | any;
  /** Status bar */
  statusBar?: any;
  /** Suppress context menu */
  suppressContextMenu?: boolean;
  /** Allow context menu with control key */
  allowContextMenuWithControlKey?: boolean;
  /** Context menu items */
  getContextMenuItems?: (params: any) => any[];
  /** Main menu items */
  getMainMenuItems?: (params: any) => any[];
  /** Row class */
  rowClass?: string | ((params: any) => string);
  /** Row style */
  rowStyle?: any | ((params: any) => any);
  /** Get row style */
  getRowStyle?: (params: any) => any;
  /** Get row class */
  getRowClass?: (params: any) => string | string[];
  /** Animation frame service */
  suppressAnimationFrame?: boolean;
  /** Suppress column move animation */
  suppressColumnMoveAnimation?: boolean;
  /** Suppress drag leave hides columns */
  suppressDragLeaveHidesColumns?: boolean;
  /** Enable cell text selection */
  enableCellTextSelection?: boolean;
  /** Suppress move when row dragging */
  suppressMoveWhenRowDragging?: boolean;
  /** Suppress row drag */
  suppressRowDrag?: boolean;
  /** Row drag managed */
  rowDragManaged?: boolean;
  /** Debug */
  debug?: boolean;
  /** Overlays */
  overlayLoadingTemplate?: string;
  overlayNoRowsTemplate?: string;
}

/**
 * ag-Grid compatible grid API
 */
export interface GridApi {
  /** Set row data */
  setRowData(data: any[]): void;
  /** Update row data */
  updateRowData(transaction: RowDataTransaction): void;
  /** Refresh cells */
  refreshCells(params?: RefreshCellsParams): void;
  /** Redraw rows */
  redrawRows(params?: RedrawRowsParams): void;
  /** Set column definitions */
  setColumnDefs(colDefs: ColDef[]): void;
  /** Get selected rows */
  getSelectedRows(): any[];
  /** Select all */
  selectAll(): void;
  /** Deselect all */
  deselectAll(): void;
  /** Select all filtered */
  selectAllFiltered(): void;
  /** Deselect all filtered */
  deselectAllFiltered(): void;
  /** Export data as CSV */
  exportDataAsCsv(params?: CsvExportParams): void;
  /** Export data as Excel */
  exportDataAsExcel(params?: ExcelExportParams): void;
  /** Size columns to fit */
  sizeColumnsToFit(): void;
  /** Auto size columns */
  autoSizeColumns(keys: string[], skipHeader?: boolean): void;
  /** Auto size all columns */
  autoSizeAllColumns(skipHeader?: boolean): void;
  /** Set filter model */
  setFilterModel(model: any): void;
  /** Get filter model */
  getFilterModel(): any;
  /** Set sort model */
  setSortModel(model: any[]): void;
  /** Get sort model */
  getSortModel(): any[];
  /** Show loading overlay */
  showLoadingOverlay(): void;
  /** Show no rows overlay */
  showNoRowsOverlay(): void;
  /** Hide overlay */
  hideOverlay(): void;
  /** Get displayed row at index */
  getDisplayedRowAtIndex(index: number): any;
  /** Get displayed row count */
  getDisplayedRowCount(): number;
  /** Get first displayed row */
  getFirstDisplayedRow(): number;
  /** Get last displayed row */
  getLastDisplayedRow(): number;
  /** For each node */
  forEachNode(callback: (node: any) => void): void;
  /** For each leaf node */
  forEachLeafNode(callback: (node: any) => void): void;
  /** For each node after filter */
  forEachNodeAfterFilter(callback: (node: any) => void): void;
  /** For each node after filter and sort */
  forEachNodeAfterFilterAndSort(callback: (node: any) => void): void;
  /** Reset quick filter */
  resetQuickFilter(): void;
  /** Set quick filter */
  setQuickFilter(newFilter: string): void;
  /** Select node */
  selectNode(node: any, tryMulti?: boolean): void;
  /** Deselect node */
  deselectNode(node: any): void;
  /** Select index */
  selectIndex(index: number, tryMulti?: boolean): void;
  /** Deselect index */
  deselectIndex(index: number): void;
  /** Get row node */
  getRowNode(id: string): any;
  /** Refresh header */
  refreshHeader(): void;
  /** Get column state */
  getColumnState(): ColumnState[];
  /** Set column state */
  setColumnState(columnState: ColumnState[]): void;
  /** Reset column state */
  resetColumnState(): void;
  /** Get column group state */
  getColumnGroupState(): any[];
  /** Set column group state */
  setColumnGroupState(stateItems: any[]): void;
  /** Reset column group state */
  resetColumnGroupState(): void;
  /** Start editing cell */
  startEditingCell(params: any): void;
  /** Stop editing */
  stopEditing(cancel?: boolean): void;
  /** Get editing cells */
  getEditingCells(): any[];
  /** Set focused cell */
  setFocusedCell(rowIndex: number, colKey: string | number): void;
  /** Clear focused cell */
  clearFocusedCell(): void;
  /** Get focused cell */
  getFocusedCell(): any;
  /** Set row height */
  setRowHeight(rowIndex: number, rowHeight: number): void;
  /** Reset row heights */
  resetRowHeights(): void;
  /** On row height changed */
  onRowHeightChanged(): void;
  /** Purge virtual page cache */
  purgeVirtualPageCache(): void;
  /** Get virtual page state */
  getVirtualPageState(): any;
  /** Is any filter present */
  isAnyFilterPresent(): boolean;
  /** Is advanced filter present */
  isAdvancedFilterPresent(): boolean;
  /** Is column filter present */
  isColumnFilterPresent(): boolean;
  /** Is quick filter present */
  isQuickFilterPresent(): boolean;
  /** Get model */
  getModel(): any;
  /** Get infinite page state */
  getInfinitePageState(): any;
  /** Is column pinned */
  isPinningLeft(): boolean;
  /** Is column pinned right */
  isPinningRight(): boolean;
  /** Get pinned top row count */
  getPinnedTopRowCount(): number;
  /** Get pinned bottom row count */
  getPinnedBottomRowCount(): number;
  /** Get pinned top row */
  getPinnedTopRow(index: number): any;
  /** Get pinned bottom row */
  getPinnedBottomRow(index: number): any;
  /** Set pinned top row data */
  setPinnedTopRowData(rowData: any[]): void;
  /** Set pinned bottom row data */
  setPinnedBottomRowData(rowData: any[]): void;
  /** Add pinned top row data */
  addPinnedTopRowData(rowData: any[]): void;
  /** Add pinned bottom row data */
  addPinnedBottomRowData(rowData: any[]): void;
  /** Remove pinned top row data */
  removePinnedTopRowData(rowData: any[]): void;
  /** Remove pinned bottom row data */
  removePinnedBottomRowData(rowData: any[]): void;
}

/**
 * ag-Grid compatible column API
 */
export interface ColumnApi {
  /** Set column visible */
  setColumnVisible(key: string, visible: boolean): void;
  /** Set columns visible */
  setColumnsVisible(keys: string[], visible: boolean): void;
  /** Set column width */
  setColumnWidth(key: string, newWidth: number): void;
  /** Set column widths */
  setColumnWidths(columnWidths: { key: string; newWidth: number }[]): void;
  /** Move column */
  moveColumn(key: string, toIndex: number): void;
  /** Move columns */
  moveColumns(keys: string[], toIndex: number): void;
  /** Move column by index */
  moveColumnByIndex(fromIndex: number, toIndex: number): void;
  /** Set column pinned */
  setColumnPinned(key: string, pinned: string | null): void;
  /** Set columns pinned */
  setColumnsPinned(keys: string[], pinned: string | null): void;
  /** Get all columns */
  getAllColumns(): any[];
  /** Get all grid columns */
  getAllGridColumns(): any[];
  /** Get displayed left columns */
  getDisplayedLeftColumns(): any[];
  /** Get displayed center columns */
  getDisplayedCenterColumns(): any[];
  /** Get displayed right columns */
  getDisplayedRightColumns(): any[];
  /** Get all displayed columns */
  getAllDisplayedColumns(): any[];
  /** Get all displayed virtual columns */
  getAllDisplayedVirtualColumns(): any[];
  /** Get column */
  getColumn(key: string): any;
  /** Get columns */
  getColumns(keys: string[]): any[];
  /** Get primary columns */
  getPrimaryColumns(): any[];
  /** Get secondary columns */
  getSecondaryColumns(): any[];
  /** Set secondary columns */
  setSecondaryColumns(colDefs: ColDef[]): void;
  /** Get primary column tree */
  getPrimaryColumnTree(): any[];
  /** Get secondary column tree */
  getSecondaryColumnTree(): any[];
  /** Get column state */
  getColumnState(): ColumnState[];
  /** Set column state */
  setColumnState(columnState: ColumnState[]): void;
  /** Reset column state */
  resetColumnState(): void;
  /** Get column group state */
  getColumnGroupState(): any[];
  /** Set column group state */
  setColumnGroupState(stateItems: any[]): void;
  /** Reset column group state */
  resetColumnGroupState(): void;
  /** Auto size column */
  autoSizeColumn(key: string, skipHeader?: boolean): void;
  /** Auto size columns */
  autoSizeColumns(keys: string[], skipHeader?: boolean): void;
  /** Auto size all columns */
  autoSizeAllColumns(skipHeader?: boolean): void;
  /** Is column pinned */
  isPinned(key: string): boolean;
  /** Is column pinned left */
  isPinnedLeft(key: string): boolean;
  /** Is column pinned right */
  isPinnedRight(key: string): boolean;
  /** Get left display column for */
  getDisplayedColAfter(col: any): any;
  /** Get right display column for */
  getDisplayedColBefore(col: any): any;
  /** Set column group opened */
  setColumnGroupOpened(group: any, newValue: boolean): void;
  /** Get column group */
  getColumnGroup(name: string, instanceId?: number): any;
  /** Get original column group */
  getOriginalColumnGroup(name: string): any;
  /** Get left display column for */
  getDisplayedLeftColumnsForRow(rowNode: any): any[];
  /** Get center display column for */
  getDisplayedCenterColumnsForRow(rowNode: any): any[];
  /** Get right display column for */
  getDisplayedRightColumnsForRow(rowNode: any): any[];
}

/**
 * ag-Grid row data transaction interface
 */
export interface RowDataTransaction {
  add?: any[];
  remove?: any[];
  update?: any[];
  addIndex?: number;
}

/**
 * ag-Grid refresh cells parameters
 */
export interface RefreshCellsParams {
  rowNodes?: any[];
  columns?: string[];
  force?: boolean;
  suppressFlash?: boolean;
}

/**
 * ag-Grid redraw rows parameters
 */
export interface RedrawRowsParams {
  rowNodes?: any[];
}

/**
 * ag-Grid CSV export parameters
 */
export interface CsvExportParams {
  columnKeys?: string[];
  fileName?: string;
  columnSeparator?: string;
  allColumns?: boolean;
  onlySelected?: boolean;
  onlySelectedAllPages?: boolean;
  suppressQuotes?: boolean;
  columnGroups?: boolean;
  skipHeader?: boolean;
  skipFooters?: boolean;
  skipGroups?: boolean;
  skipPinnedTop?: boolean;
  skipPinnedBottom?: boolean;
  shouldRowBeSkipped?: (params: any) => boolean;
  processCellCallback?: (params: any) => string;
  processHeaderCallback?: (params: any) => string;
  processGroupHeaderCallback?: (params: any) => string;
  processRowGroupCallback?: (params: any) => string;
}

/**
 * ag-Grid Excel export parameters
 */
export interface ExcelExportParams {
  columnKeys?: string[];
  fileName?: string;
  sheetName?: string;
  allColumns?: boolean;
  onlySelected?: boolean;
  onlySelectedAllPages?: boolean;
  columnGroups?: boolean;
  skipHeader?: boolean;
  skipFooters?: boolean;
  skipGroups?: boolean;
  skipPinnedTop?: boolean;
  skipPinnedBottom?: boolean;
  shouldRowBeSkipped?: (params: any) => boolean;
  processCellCallback?: (params: any) => string;
  processHeaderCallback?: (params: any) => string;
  processGroupHeaderCallback?: (params: any) => string;
  processRowGroupCallback?: (params: any) => string;
  author?: string;
  autoConvertFormulas?: boolean;
  sendToClipboard?: boolean;
  fontSize?: number;
  headerRowHeight?: number;
  rowHeight?: number;
  addImageToCell?: (rowIndex: number, col: any, value: string) => any;
}

/**
 * Column state interface
 */
export interface ColumnState {
  colId: string;
  width?: number;
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  sort?: 'asc' | 'desc' | null;
  sortIndex?: number;
  aggFunc?: string | null;
  pivot?: boolean;
  pivotIndex?: number | null;
  rowGroup?: boolean;
  rowGroupIndex?: number | null;
  flex?: number | null;
}

/**
 * Grid ready event
 */
export interface GridReadyEvent {
  type: 'gridReady';
  api: GridApi;
  columnApi: ColumnApi;
}

/**
 * Row clicked event
 */
export interface RowClickedEvent {
  type: 'rowClicked';
  node: any;
  data: any;
  rowIndex: number;
  rowPinned: string | null;
  context: any;
  event: MouseEvent;
  api: GridApi;
  columnApi: ColumnApi;
}

/**
 * Cell clicked event
 */
export interface CellClickedEvent {
  type: 'cellClicked';
  rowIndex: number;
  rowPinned: string | null;
  column: any;
  colDef: ColDef;
  value: any;
  data: any;
  node: any;
  context: any;
  event: MouseEvent;
  api: GridApi;
  columnApi: ColumnApi;
}

/**
 * Selection changed event
 */
export interface SelectionChangedEvent {
  type: 'selectionChanged';
  api: GridApi;
  columnApi: ColumnApi;
}

/**
 * Sort changed event
 */
export interface SortChangedEvent {
  type: 'sortChanged';
  api: GridApi;
  columnApi: ColumnApi;
}

/**
 * Filter changed event
 */
export interface FilterChangedEvent {
  type: 'filterChanged';
  api: GridApi;
  columnApi: ColumnApi;
}

/**
 * Built-in cell renderers
 */
export const AgCellRenderers = {
  agGroupCellRenderer: 'agGroupCellRenderer',
  agLoadingCellRenderer: 'agLoadingCellRenderer',
  agCheckboxCellRenderer: 'agCheckboxCellRenderer',
  agAnimateShowChangeCellRenderer: 'agAnimateShowChangeCellRenderer',
  agAnimateSlideCellRenderer: 'agAnimateSlideCellRenderer'
};

/**
 * Built-in cell editors
 */
export const AgCellEditors = {
  agTextCellEditor: 'agTextCellEditor',
  agPopupTextCellEditor: 'agPopupTextCellEditor',
  agLargeTextCellEditor: 'agLargeTextCellEditor',
  agSelectCellEditor: 'agSelectCellEditor',
  agPopupSelectCellEditor: 'agPopupSelectCellEditor',
  agRichSelectCellEditor: 'agRichSelectCellEditor',
  agNumberCellEditor: 'agNumberCellEditor',
  agDateCellEditor: 'agDateCellEditor',
  agDateStringCellEditor: 'agDateStringCellEditor',
  agCheckboxCellEditor: 'agCheckboxCellEditor'
};

/**
 * Built-in filters
 */
export const AgFilters = {
  agTextColumnFilter: 'agTextColumnFilter',
  agNumberColumnFilter: 'agNumberColumnFilter',
  agDateColumnFilter: 'agDateColumnFilter',
  agSetColumnFilter: 'agSetColumnFilter'
};

/**
 * Helper function to convert ColDef to ColumnDefinition
 */
export function colDefToColumnDefinition(colDef: ColDef): ColumnDefinition {
  const result: ColumnDefinition = {
    id: colDef.colId || colDef.field || '',
    field: colDef.field || '',
    header: colDef.headerName || '',
    filterable: !!colDef.filter,
    visible: !colDef.hide,
    cellEditor: typeof colDef.cellEditor === 'string' ? colDef.cellEditor : (colDef.editable !== false),
    align: 'left' // default alignment
  };
  
  // Only add properties that are defined
  if (colDef.width !== undefined) result.width = colDef.width;
  if (colDef.minWidth !== undefined) result.minWidth = colDef.minWidth;
  if (colDef.maxWidth !== undefined) result.maxWidth = colDef.maxWidth;
  if (colDef.sortable !== undefined) result.sortable = colDef.sortable;
  if (colDef.resizable !== undefined) result.resizable = colDef.resizable;
  if (colDef.pinned) result.pinned = colDef.pinned;
  
  if (colDef.type) {
    if (Array.isArray(colDef.type)) {
      result.type = colDef.type[0] as 'string' | 'number' | 'date' | 'boolean' | 'custom';
    } else {
      result.type = colDef.type as 'string' | 'number' | 'date' | 'boolean' | 'custom';
    }
  }
  
  if (typeof colDef.cellRenderer === 'string') {
    result.cellRenderer = colDef.cellRenderer;
  }
  
  return result;
}

/**
 * Helper function to convert ColumnDefinition to ColDef
 */
export function columnDefinitionToColDef(colDef: ColumnDefinition): ColDef {
  const result: ColDef = {
    colId: colDef.id,
    field: colDef.field,
    headerName: colDef.header,
    hide: colDef.visible === false,
    editable: colDef.cellEditor !== false
  };
  
  // Only add properties that are defined
  if (colDef.width !== undefined) result.width = colDef.width;
  if (colDef.minWidth !== undefined) result.minWidth = colDef.minWidth;
  if (colDef.maxWidth !== undefined) result.maxWidth = colDef.maxWidth;
  if (colDef.sortable !== undefined) result.sortable = colDef.sortable;
  if (colDef.filterable !== undefined) result.filter = colDef.filterable;
  if (colDef.resizable !== undefined) result.resizable = colDef.resizable;
  if (colDef.type !== undefined) result.type = colDef.type;
  if (colDef.cellRenderer !== undefined) result.cellRenderer = colDef.cellRenderer;
  if (colDef.cellEditor !== undefined) result.cellEditor = colDef.cellEditor;
  if (colDef.pinned !== undefined) result.pinned = colDef.pinned;
  
  return result;
}