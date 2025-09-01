/**
 * ag-Grid API Type Definitions for Migration Testing
 * These types simulate the ag-Grid API structure for testing purposes
 */

export interface AgGridColumn {
  field?: string;
  headerName?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  filter?: boolean | string | any;
  cellRenderer?: string | any;
  cellEditor?: string | any;
  editable?: boolean | ((params: any) => boolean);
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  lockPosition?: boolean;
  suppressMovable?: boolean;
  suppressSizeToFit?: boolean;
  checkboxSelection?: boolean;
  headerCheckboxSelection?: boolean;
  children?: AgGridColumn[];
  columnGroupShow?: 'open' | 'closed';
  marryChildren?: boolean;
  valueGetter?: string | ((params: any) => any);
  valueSetter?: string | ((params: any) => boolean);
  valueFormatter?: string | ((params: any) => string);
  comparator?: (a: any, b: any, nodeA: any, nodeB: any, isInverted: boolean) => number;
  equals?: (a: any, b: any) => boolean;
  pivot?: boolean;
  pivotIndex?: number;
  aggFunc?: string | ((params: any) => any);
  enablePivot?: boolean;
  enableRowGroup?: boolean;
  enableValue?: boolean;
  rowGroup?: boolean;
  rowGroupIndex?: number;
  tooltipField?: string;
  tooltipValueGetter?: string | ((params: any) => string);
  cellClass?: string | string[] | ((params: any) => string | string[]);
  cellStyle?: any | ((params: any) => any);
  cellRendererParams?: any;
  cellEditorParams?: any;
  onCellValueChanged?: (params: any) => void;
  onCellClicked?: (params: any) => void;
  onCellDoubleClicked?: (params: any) => void;
  suppressKeyboardEvent?: (params: any) => boolean;
  suppressHeaderMenuButton?: boolean;
  suppressHeaderFilterButton?: boolean;
  menuTabs?: string[];
  floatingFilterComponent?: string | any;
  floatingFilterComponentParams?: any;
  suppressFloatingFilterButton?: boolean;
  getQuickFilterText?: (params: any) => string;
  icons?: { [key: string]: string };
  suppressToolPanel?: boolean;
}

export interface AgGridOptions {
  // Data
  rowData?: any[];
  columnDefs?: AgGridColumn[];
  
  // Pagination
  pagination?: boolean;
  paginationPageSize?: number;
  paginationAutoPageSize?: boolean;
  
  // Selection
  rowSelection?: 'single' | 'multiple';
  suppressRowClickSelection?: boolean;
  suppressRowDeselection?: boolean;
  checkboxSelection?: boolean;
  headerCheckboxSelection?: boolean;
  
  // Sorting
  sortingOrder?: ('asc' | 'desc' | null)[];
  suppressMultiSort?: boolean;
  multiSortKey?: 'ctrl';
  
  // Filtering
  enableFilter?: boolean;
  suppressMenuMainPanel?: boolean;
  suppressMenuFilterPanel?: boolean;
  suppressMenuColumnsPanel?: boolean;
  
  // Row Model
  rowModelType?: 'clientSide' | 'infinite' | 'viewport' | 'serverSide';
  datasource?: any;
  cacheBlockSize?: number;
  cacheOverflowSize?: number;
  maxConcurrentDatasourceRequests?: number;
  infiniteInitialRowCount?: number;
  maxBlocksInCache?: number;
  getRowNodeId?: (data: any) => string;
  
  // Grouping
  rowGroupPanelShow?: 'always' | 'onlyWhenGrouping' | 'never';
  enableRowGroup?: boolean;
  groupSelectsChildren?: boolean;
  groupSelectsFiltered?: boolean;
  groupIncludeFooter?: boolean;
  groupIncludeTotalFooter?: boolean;
  suppressRowGroupHidesColumns?: boolean;
  groupRowRenderer?: string | any;
  groupRowRendererParams?: any;
  groupRowInnerRenderer?: string | any;
  groupRowInnerRendererParams?: any;
  
  // Master Detail
  masterDetail?: boolean;
  detailCellRenderer?: string | any;
  detailCellRendererParams?: any;
  detailRowHeight?: number;
  detailRowAutoHeight?: boolean;
  
  // Tree Data
  treeData?: boolean;
  childrenField?: string;
  getDataPath?: (data: any) => string[];
  
  // Animation
  animateRows?: boolean;
  enableCellChangeFlash?: boolean;
  
  // Styling
  rowHeight?: number;
  headerHeight?: number;
  groupHeaderHeight?: number;
  floatingFiltersHeight?: number;
  pivotHeaderHeight?: number;
  pivotGroupHeaderHeight?: number;
  theme?: string;
  
  // Events
  onGridReady?: (params: any) => void;
  onCellClicked?: (params: any) => void;
  onCellDoubleClicked?: (params: any) => void;
  onCellValueChanged?: (params: any) => void;
  onRowSelected?: (params: any) => void;
  onSelectionChanged?: (params: any) => void;
  onFilterChanged?: (params: any) => void;
  onSortChanged?: (params: any) => void;
  onColumnResized?: (params: any) => void;
  onColumnMoved?: (params: any) => void;
  onColumnVisible?: (params: any) => void;
  onColumnPinned?: (params: any) => void;
  onDisplayedColumnsChanged?: (params: any) => void;
  onVirtualColumnsChanged?: (params: any) => void;
  onRowDataChanged?: (params: any) => void;
  onRowDataUpdated?: (params: any) => void;
  onPinnedRowDataChanged?: (params: any) => void;
  onRangeSelectionChanged?: (params: any) => void;
  onColumnGroupOpened?: (params: any) => void;
  onItemsAdded?: (params: any) => void;
  onItemsRemoved?: (params: any) => void;
  onColumnRowGroupChanged?: (params: any) => void;
  onColumnPivotChanged?: (params: any) => void;
  onColumnValueChanged?: (params: any) => void;
  onColumnAggFuncChanged?: (params: any) => void;
  onColumnPivotModeChanged?: (params: any) => void;
  onNewColumnsLoaded?: (params: any) => void;
  onGridColumnsChanged?: (params: any) => void;
  onDisplayedColumnsWidthChanged?: (params: any) => void;
  onVirtualRowRemoved?: (params: any) => void;
  onRowGroupOpened?: (params: any) => void;
  onRowDataChanged?: (params: any) => void;
  onFloatingRowDataChanged?: (params: any) => void;
  onRowEditingStarted?: (params: any) => void;
  onRowEditingStopped?: (params: any) => void;
  onCellEditingStarted?: (params: any) => void;
  onCellEditingStopped?: (params: any) => void;
  onBodyScroll?: (params: any) => void;
  onModelUpdated?: (params: any) => void;
  onCellFocused?: (params: any) => void;
  onRowDragEnter?: (params: any) => void;
  onRowDragMove?: (params: any) => void;
  onRowDragLeave?: (params: any) => void;
  onRowDragEnd?: (params: any) => void;
  onPasteStart?: (params: any) => void;
  onPasteEnd?: (params: any) => void;
  onFillStart?: (params: any) => void;
  onFillEnd?: (params: any) => void;
}

export interface AgGridApi {
  // Selection
  selectAll(): void;
  deselectAll(): void;
  selectAllFiltered(): void;
  deselectAllFiltered(): void;
  getSelectedNodes(): any[];
  getSelectedRows(): any[];
  setRowData(rowData: any[]): void;
  
  // Filtering
  setFilterModel(model: any): void;
  getFilterModel(): any;
  setQuickFilter(newFilter: string): void;
  isQuickFilterPresent(): boolean;
  isAdvancedFilterPresent(): boolean;
  isAnyFilterPresent(): boolean;
  
  // Sorting
  setSortModel(model: any[]): void;
  getSortModel(): any[];
  
  // Scrolling
  ensureIndexVisible(index: number): void;
  ensureColumnVisible(key: string): void;
  ensureNodeVisible(comparator: any): void;
  
  // Columns
  setColumnDefs(colDefs: AgGridColumn[]): void;
  getColumnDefs(): AgGridColumn[];
  sizeColumnsToFit(): void;
  autoSizeColumns(keys: string[]): void;
  autoSizeAllColumns(): void;
  
  // Refresh
  refreshCells(params?: any): void;
  redrawRows(params?: any): void;
  refreshHeader(): void;
  
  // Export
  exportDataAsCsv(params?: any): string;
  getDataAsCsv(params?: any): string;
  exportDataAsExcel(params?: any): void;
  getDataAsExcel(params?: any): void;
  
  // Miscellaneous
  showLoadingOverlay(): void;
  showNoRowsOverlay(): void;
  hideOverlay(): void;
  getModel(): any;
  onFilterChanged(): void;
  onSortChanged(): void;
  refreshInMemoryRowModel(): void;
  purgeInfiniteCache(): void;
  getInfiniteRowCount(): number;
  isMaxRowFound(): boolean;
  setDatasource(datasource: any): void;
  setCacheBlockSize(blockSize: number): void;
  getDisplayedRowAtIndex(index: number): any;
  getDisplayedRowCount(): number;
  getFirstDisplayedRow(): number;
  getLastDisplayedRow(): number;
  getRenderedNodes(): any[];
  forEachNode(callback: (node: any, index: number) => void): void;
  forEachNodeAfterFilter(callback: (node: any, index: number) => void): void;
  forEachNodeAfterFilterAndSort(callback: (node: any, index: number) => void): void;
  forEachLeafNode(callback: (node: any) => void): void;
  resetRowHeights(): void;
  setHeaderHeight(headerHeight: number): void;
  setRowHeight(rowHeight: number): void;
  getValue(colKey: string, rowNode: any): any;
  addEventListener(eventType: string, listener: Function): void;
  addGlobalListener(listener: Function): void;
  removeEventListener(eventType: string, listener: Function): void;
  removeGlobalListener(listener: Function): void;
  dispatchEvent(event: any): void;
  destroy(): void;
  resetQuickFilter(): void;
  getRangeSelections(): any[];
  addRangeSelection(rangeSelection: any): void;
  clearRangeSelection(): void;
  clearFocusedCell(): void;
  getFocusedCell(): any;
  setFocusedCell(rowIndex: number, colKey: string): void;
  setSuppressRowDrag(suppress: boolean): void;
  setSuppressRowClickSelection(suppress: boolean): void;
  addItems(items: any[], index?: number): void;
  removeItems(rowNodes: any[]): void;
  updateRowData(rowDataTransaction: any): any;
  batchUpdateRowData(rowDataTransaction: any): void;
  insertItemsAtIndex(index: number, items: any[]): void;
  removeItemsAtIndex(index: number, toRemove: number): any[];
  addItemsAtIndex(index: number, items: any[]): void;
  getAllGridColumns(): any[];
  getDisplayedCenterColumns(): any[];
  getDisplayedLeftColumns(): any[];
  getDisplayedRightColumns(): any[];
  getAllDisplayedColumns(): any[];
  getAllDisplayedVirtualColumns(): any[];
}

export interface AgColumnApi {
  setColumnVisible(key: string, visible: boolean): void;
  setColumnsVisible(keys: string[], visible: boolean): void;
  setColumnPinned(key: string, pinned: 'left' | 'right' | null): void;
  setColumnsPinned(keys: string[], pinned: 'left' | 'right' | null): void;
  setColumnWidth(key: string, newWidth: number): void;
  setColumnWidths(columnWidths: { key: string, newWidth: number }[]): void;
  moveColumn(fromIndex: number, toIndex: number): void;
  moveColumns(columnsToMoveKeys: string[], toIndex: number): void;
  moveColumnByIndex(fromIndex: number, toIndex: number): void;
  setColumnAggFunc(column: string, aggFunc: string): void;
  setColumnRowGroupIndex(column: string, rowGroupIndex: number): void;
  setColumnPivotIndex(column: string, pivotIndex: number): void;
  addRowGroupColumn(column: string): void;
  addRowGroupColumns(columns: string[]): void;
  removeRowGroupColumn(column: string): void;
  removeRowGroupColumns(columns: string[]): void;
  addValueColumn(column: string): void;
  addValueColumns(columns: string[]): void;
  removeValueColumn(column: string): void;
  removeValueColumns(columns: string[]): void;
  addPivotColumn(column: string): void;
  addPivotColumns(columns: string[]): void;
  removePivotColumn(column: string): void;
  removePivotColumns(columns: string[]): void;
  setPivotMode(pivotMode: boolean): void;
  isPivotMode(): boolean;
  setRowGroupOpened(rowGroup: any, opened: boolean): void;
  getColumnGroup(name: string): any;
  getOriginalColumnGroup(name: string): any;
  getDisplayedColAfter(col: any): any;
  getDisplayedColBefore(col: any): any;
  setColumnState(columnState: any[]): boolean;
  getColumnState(): any[];
  resetColumnState(): void;
  getColumnGroupState(): any[];
  setColumnGroupState(stateItems: any[]): void;
  resetColumnGroupState(): void;
  autoSizeColumn(key: string): void;
  autoSizeColumns(keys: string[]): void;
  autoSizeAllColumns(): void;
}