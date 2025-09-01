/**
 * ag-Grid GridApi compatibility interface
 * Provides ag-Grid compatible API methods that map to NgUiGrid functionality
 */
export interface AgGridApi {
  // Data Management
  /** Set row data */
  setRowData(rowData: any[]): void;
  
  /** Get row data */
  getRowData(): any[];
  
  /** Set column definitions */
  setColumnDefs(colDefs: any[]): void;
  
  /** Get column definitions */
  getColumnDefs(): any[];
  
  /** Apply transaction */
  applyTransaction(transaction: RowDataTransaction): RowDataTransaction | null;
  
  /** Apply transaction async */
  applyTransactionAsync(transaction: RowDataTransaction, callback?: (res: RowDataTransaction) => void): void;
  
  /** Flush async transactions */
  flushAsyncTransactions(): void;
  
  /** Get row node */
  getRowNode(id: string | number): RowNode | null;
  
  /** For each node */
  forEachNode(callback: (node: RowNode, index: number) => void): void;
  
  /** For each node after filter */
  forEachNodeAfterFilter(callback: (node: RowNode, index: number) => void): void;
  
  /** For each node after filter and sort */
  forEachNodeAfterFilterAndSort(callback: (node: RowNode, index: number) => void): void;
  
  /** For each leaf node */
  forEachLeafNode(callback: (node: RowNode) => void): void;
  
  // Row Selection
  /** Select all rows */
  selectAll(): void;
  
  /** Deselect all rows */
  deselectAll(): void;
  
  /** Select all filtered rows */
  selectAllFiltered(): void;
  
  /** Deselect all filtered rows */
  deselectAllFiltered(): void;
  
  /** Get selected nodes */
  getSelectedNodes(): RowNode[];
  
  /** Get selected rows */
  getSelectedRows(): any[];
  
  /** Set nodes selected */
  setNodesSelected(nodes: RowNode[], newValue: boolean, clearSelection?: boolean): number;
  
  /** Select index */
  selectIndex(index: number, tryMulti?: boolean): void;
  
  /** Deselect index */
  deselectIndex(index: number): void;
  
  /** Get focused cell */
  getFocusedCell(): CellPosition | null;
  
  /** Set focused cell */
  setFocusedCell(rowIndex: number, colKey?: string | number): void;
  
  /** Clear focused cell */
  clearFocusedCell(): void;
  
  // Filtering
  /** Set filter model */
  setFilterModel(model: any): void;
  
  /** Get filter model */
  getFilterModel(): any;
  
  /** Get filter instance */
  getFilterInstance(key: string): IFilterComp | null;
  
  /** Get filter instances */
  getFilterInstances(): { [key: string]: IFilterComp };
  
  /** Destroy filter */
  destroyFilter(key: string): void;
  
  /** Is any filter present */
  isAnyFilterPresent(): boolean;
  
  /** Is column filter present */
  isColumnFilterPresent(): boolean;
  
  /** Is quick filter present */
  isQuickFilterPresent(): boolean;
  
  /** Get quick filter text */
  getQuickFilterText(): string;
  
  /** Set quick filter text */
  setQuickFilter(newFilter: string): void;
  
  /** Reset quick filter */
  resetQuickFilter(): void;
  
  /** Show loading overlay */
  showLoadingOverlay(): void;
  
  /** Show no rows overlay */
  showNoRowsOverlay(): void;
  
  /** Hide overlay */
  hideOverlay(): void;
  
  // Sorting
  /** Set sort model */
  setSortModel(model: any[]): void;
  
  /** Get sort model */
  getSortModel(): any[];
  
  // Rendering & Display
  /** Refresh cells */
  refreshCells(params?: RefreshCellsParams): void;
  
  /** Redraw rows */
  redrawRows(params?: RedrawRowsParams): void;
  
  /** Set row data to null (for flushing) */
  setRowNodeSelected(node: RowNode, selected: boolean, clearSelection?: boolean): void;
  
  /** Flash cells */
  flashCells(params?: FlashCellsParams): void;
  
  /** Refresh header */
  refreshHeader(): void;
  
  /** Refresh footer */
  refreshFooter(): void;
  
  /** Is editing */
  isEditing(): boolean;
  
  /** Start editing cell */
  startEditingCell(params: StartEditingCellParams): void;
  
  /** Stop editing */
  stopEditing(cancel?: boolean): void;
  
  /** Get editing cells */
  getEditingCells(): CellPosition[];
  
  // Clipboard
  /** Copy to clipboard */
  copyToClipboard(params?: CopyToClipboardParams): void;
  
  /** Copy selected rows to clipboard */
  copySelectedRowsToClipboard(includeHeaders?: boolean): void;
  
  /** Copy selected ranges to clipboard */
  copySelectedRangesToClipboard(includeHeaders?: boolean): void;
  
  /** Paste from clipboard */
  pasteFromClipboard(): void;
  
  // Export
  /** Export data to CSV */
  exportDataAsCsv(params?: CsvExportParams): string;
  
  /** Get data as CSV */
  getDataAsCsv(params?: CsvExportParams): string;
  
  /** Export data to Excel */
  exportDataAsExcel(params?: ExcelExportParams): string;
  
  /** Get data as Excel */
  getDataAsExcel(params?: ExcelExportParams): string;
  
  // Pagination
  /** Is pagination enabled */
  isPaginationEnabled(): boolean;
  
  /** Get current page */
  paginationGetCurrentPage(): number;
  
  /** Get total pages */
  paginationGetTotalPages(): number;
  
  /** Get page size */
  paginationGetPageSize(): number;
  
  /** Get row count */
  paginationGetRowCount(): number;
  
  /** Go to next page */
  paginationGoToNextPage(): void;
  
  /** Go to previous page */
  paginationGoToPreviousPage(): void;
  
  /** Go to first page */
  paginationGoToFirstPage(): void;
  
  /** Go to last page */
  paginationGoToLastPage(): void;
  
  /** Go to page */
  paginationGoToPage(page: number): void;
  
  /** Set page size */
  paginationSetPageSize(size: number): void;
  
  // Row Model
  /** Get model */
  getModel(): any;
  
  /** Get infinite row count */
  getInfiniteRowCount(): number | undefined;
  
  /** Is last row index known */
  isLastRowIndexKnown(): boolean;
  
  /** Set infinite row count */
  setInfiniteRowCount(count: number, lastRowIndexKnown?: boolean): void;
  
  /** Get cache top index */
  getCacheTopIndex(): number;
  
  /** Get cache bottom index */
  getCacheBottomIndex(): number;
  
  /** Get displayed row at index */
  getDisplayedRowAtIndex(index: number): RowNode | null;
  
  /** Get displayed row count */
  getDisplayedRowCount(): number;
  
  /** Get first displayed row */
  getFirstDisplayedRow(): number;
  
  /** Get last displayed row */
  getLastDisplayedRow(): number;
  
  // Scrolling
  /** Ensure index visible */
  ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle'): void;
  
  /** Ensure column visible */
  ensureColumnVisible(key: string): void;
  
  /** Ensure node visible */
  ensureNodeVisible(comparator: any, position?: 'top' | 'bottom' | 'middle'): void;
  
  /** Get horizontal pixel range */
  getHorizontalPixelRange(): { left: number; right: number };
  
  /** Get vertical pixel range */
  getVerticalPixelRange(): { top: number; bottom: number };
  
  /** Set grid width */
  setGridWidth(width: number): void;
  
  /** Set grid height */
  setGridHeight(height: number): void;
  
  // Grouping & Aggregation
  /** Expand all */
  expandAll(): void;
  
  /** Collapse all */
  collapseAll(): void;
  
  /** Get server side group levels */
  getServerSideGroupLevelState(): any[];
  
  /** Get group keys */
  getServerSideGroupKeys(node: RowNode): string[];
  
  /** Is server side group open by default */
  isServerSideGroupOpenByDefault(params: any): boolean;
  
  // Value Service
  /** Get value */
  getValue(colKey: string, node: RowNode): any;
  
  /** Set value */
  setValue(colKey: string, newValue: any, node: RowNode): boolean;
  
  /** Aggregate columns */
  aggregateColumns(keys: string[], aggregationFunction: string): any;
  
  // Context
  /** Get context */
  getContext(): any;
  
  /** Set context */
  setContext(context: any): void;
  
  // Advanced
  /** Add global listener */
  addEventListener(eventType: string, listener: Function): void;
  
  /** Add one time listener */
  addOneTimeEventListener(eventType: string, listener: Function): void;
  
  /** Remove event listener */
  removeEventListener(eventType: string, listener: Function): void;
  
  /** Dispatch event */
  dispatchEvent(event: any): void;
  
  /** Destroy */
  destroy(): void;
  
  /** Reset row heights */
  resetRowHeights(): void;
  
  /** Set row heights */
  setRowHeights(nodes: RowNode[]): void;
  
  /** On group expanded or collapsed */
  onGroupExpandedOrCollapsed(deprecated_refreshFromIndex?: any): void;
  
  /** Refresh in memory row model */
  refreshInMemoryRowModel(step?: string): void;
  
  /** Refresh infinite cache */
  refreshInfiniteCache(): void;
  
  /** Purge infinite cache */
  purgeInfiniteCache(): void;
  
  /** Get infinite cache top index */
  getInfiniteCacheTopIndex(): number;
  
  /** Get infinite cache bottom index */
  getInfiniteCacheBottomIndex(): number;
  
  /** Get virtual row count */
  getVirtualRowCount(): number;
  
  /** Is max row found */
  isMaxRowFound(): boolean;
  
  /** Set virtual row count */
  setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
  
  /** Get last displayed row index */
  getLastDisplayedRowIndex(): number;
  
  /** Get first displayed row index */
  getFirstDisplayedRowIndex(): number;
}

// Supporting interfaces
export interface RowDataTransaction {
  add?: any[];
  addIndex?: number;
  remove?: any[];
  update?: any[];
}

export interface RowNode {
  id?: string | number;
  data: any;
  parent: RowNode | null;
  level: number;
  uiLevel: number;
  group: boolean;
  groupData?: any;
  aggData?: any;
  selected?: boolean;
  selectable?: boolean;
  expanded?: boolean;
  master?: boolean;
  canFlower?: boolean;
  flower?: boolean;
  childrenAfterGroup?: RowNode[];
  childrenAfterSort?: RowNode[];
  childrenAfterFilter?: RowNode[];
  allLeafChildren?: RowNode[];
  childrenMapped?: { [key: string]: RowNode };
  rowTop?: number;
  rowHeight?: number;
  rowIndex?: number;
  displayed?: boolean;
  quickFilterAggregateText?: string;
  leafGroup?: boolean;
  footer?: boolean;
  stub?: boolean;
  sibling?: RowNode;
  key?: string;
  childIndex?: number;
  firstChild?: boolean;
  lastChild?: boolean;
  childrenCache?: { [key: string]: RowNode[] };
  __objectId?: number;
  __needsRefreshWhenVisible?: boolean;
}

export interface CellPosition {
  rowIndex: number;
  rowPinned?: 'top' | 'bottom' | null;
  column: any;
}

export interface IFilterComp {
  [key: string]: any;
}

export interface RefreshCellsParams {
  rowNodes?: RowNode[];
  columns?: (string | any)[];
  force?: boolean;
  volatile?: boolean;
}

export interface RedrawRowsParams {
  rowNodes?: RowNode[];
}

export interface FlashCellsParams {
  rowNodes?: RowNode[];
  columns?: (string | any)[];
  flashDelay?: number;
  fadeDelay?: number;
}

export interface StartEditingCellParams {
  rowIndex: number;
  colKey: string | any;
  rowPinned?: string;
  key?: string;
  char?: string;
}

export interface CopyToClipboardParams {
  includeHeaders?: boolean;
  includeGroupHeaders?: boolean;
  skipColumnKeys?: (string | any)[];
  skipColumnGroupKeys?: (string | any)[];
  processCellCallback?: (params: any) => any;
  processRowGroupCallback?: (params: any) => any;
  processHeaderCallback?: (params: any) => any;
  processGroupHeaderCallback?: (params: any) => any;
  customHeader?: string;
  customFooter?: string;
}

export interface CsvExportParams {
  columnKeys?: (string | any)[];
  skipColumnKeys?: (string | any)[];
  skipColumnGroupKeys?: (string | any)[];
  skipHeader?: boolean;
  skipFooters?: boolean;
  skipGroups?: boolean;
  skipPinnedTop?: boolean;
  skipPinnedBottom?: boolean;
  allColumns?: boolean;
  onlySelected?: boolean;
  onlySelectedAllPages?: boolean;
  suppressQuotes?: boolean;
  columnSeparator?: string;
  customHeader?: string;
  customFooter?: string;
  processCellCallback?: (params: any) => any;
  processRowGroupCallback?: (params: any) => any;
  processHeaderCallback?: (params: any) => any;
  processGroupHeaderCallback?: (params: any) => any;
  fileName?: string;
}

export interface ExcelExportParams extends CsvExportParams {
  sheetName?: string;
  author?: string;
  mimeType?: string;
}