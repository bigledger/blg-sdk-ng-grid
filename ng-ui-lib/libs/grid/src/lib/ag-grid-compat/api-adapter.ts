import { Injectable } from '@angular/core';
import { 
  AgGridApi, 
  RowDataTransaction, 
  RowNode, 
  CellPosition, 
  RefreshCellsParams,
  RedrawRowsParams,
  FlashCellsParams,
  StartEditingCellParams,
  CopyToClipboardParams,
  CsvExportParams,
  ExcelExportParams
} from './ag-grid-api.interface';
import { 
  AgColumnApi, 
  ColumnState, 
  ApplyColumnStateParams 
} from './ag-column-api.interface';

/**
 * API adapter that provides ag-Grid compatible API methods
 * Maps ag-Grid API calls to NgUiGrid functionality
 */
@Injectable({
  providedIn: 'root'
})
export class ApiAdapter implements AgGridApi, AgColumnApi {
  private ngUiGridComponent: any;
  private ngUiGridService: any;
  private currentRowData: any[] = [];
  private currentColumnDefs: any[] = [];
  private selectedNodes = new Set<RowNode>();
  private focusedCell: CellPosition | null = null;
  
  /**
   * Sets the NgUiGrid component and service references
   */
  setGridReferences(gridComponent: any, gridService: any): void {
    this.ngUiGridComponent = gridComponent;
    this.ngUiGridService = gridService;
  }
  
  // =================
  // GridApi Methods
  // =================
  
  /**
   * Set row data
   */
  setRowData(rowData: any[]): void {
    this.currentRowData = [...rowData];
    if (this.ngUiGridComponent) {
      this.ngUiGridComponent.data = rowData;
    }
  }
  
  /**
   * Get row data
   */
  getRowData(): any[] {
    return [...this.currentRowData];
  }
  
  /**
   * Set column definitions
   */
  setColumnDefs(colDefs: any[]): void {
    this.currentColumnDefs = [...colDefs];
    if (this.ngUiGridComponent) {
      this.ngUiGridComponent.columns = colDefs;
    }
  }
  
  /**
   * Get column definitions
   */
  getColumnDefs(): any[] {
    return [...this.currentColumnDefs];
  }
  
  /**
   * Apply transaction (add/remove/update rows)
   */
  applyTransaction(transaction: RowDataTransaction): RowDataTransaction | null {
    const result: RowDataTransaction = {};
    
    if (transaction.add) {
      if (transaction.addIndex !== undefined) {
        this.currentRowData.splice(transaction.addIndex, 0, ...transaction.add);
      } else {
        this.currentRowData.push(...transaction.add);
      }
      result.add = [...transaction.add];
    }
    
    if (transaction.remove) {
      const toRemove = new Set(transaction.remove);
      this.currentRowData = this.currentRowData.filter(row => !toRemove.has(row));
      result.remove = [...transaction.remove];
    }
    
    if (transaction.update) {
      transaction.update.forEach(updatedRow => {
        const index = this.currentRowData.findIndex(row => 
          this.getRowId(row) === this.getRowId(updatedRow)
        );
        if (index !== -1) {
          this.currentRowData[index] = { ...this.currentRowData[index], ...updatedRow };
        }
      });
      result.update = [...transaction.update];
    }
    
    this.setRowData(this.currentRowData);
    return result;
  }
  
  /**
   * Apply transaction async
   */
  applyTransactionAsync(transaction: RowDataTransaction, callback?: (res: RowDataTransaction) => void): void {
    setTimeout(() => {
      const result = this.applyTransaction(transaction);
      if (callback && result) {
        callback(result);
      }
    }, 0);
  }
  
  /**
   * Flush async transactions
   */
  flushAsyncTransactions(): void {
    // NgUiGrid processes synchronously, so this is a no-op
  }
  
  /**
   * Get row node by ID
   */
  getRowNode(id: string | number): RowNode | null {
    const index = this.currentRowData.findIndex(row => this.getRowId(row) === id);
    if (index !== -1) {
      return this.createRowNode(this.currentRowData[index], index);
    }
    return null;
  }
  
  /**
   * Iterate through all nodes
   */
  forEachNode(callback: (node: RowNode, index: number) => void): void {
    this.currentRowData.forEach((row, index) => {
      callback(this.createRowNode(row, index), index);
    });
  }
  
  /**
   * Iterate through nodes after filter
   */
  forEachNodeAfterFilter(callback: (node: RowNode, index: number) => void): void {
    // For now, same as forEachNode since filtering logic would need integration
    this.forEachNode(callback);
  }
  
  /**
   * Iterate through nodes after filter and sort
   */
  forEachNodeAfterFilterAndSort(callback: (node: RowNode, index: number) => void): void {
    // For now, same as forEachNode since filtering/sorting logic would need integration
    this.forEachNode(callback);
  }
  
  /**
   * Iterate through leaf nodes only
   */
  forEachLeafNode(callback: (node: RowNode) => void): void {
    // For non-grouped data, all nodes are leaf nodes
    this.currentRowData.forEach((row, index) => {
      callback(this.createRowNode(row, index));
    });
  }
  
  // Selection Methods
  
  /**
   * Select all rows
   */
  selectAll(): void {
    this.selectedNodes.clear();
    this.currentRowData.forEach((row, index) => {
      const node = this.createRowNode(row, index);
      node.selected = true;
      this.selectedNodes.add(node);
    });
    
    if (this.ngUiGridService) {
      this.ngUiGridService.selectAllRows();
    }
  }
  
  /**
   * Deselect all rows
   */
  deselectAll(): void {
    this.selectedNodes.forEach(node => node.selected = false);
    this.selectedNodes.clear();
    
    if (this.ngUiGridService) {
      this.ngUiGridService.clearSelection();
    }
  }
  
  /**
   * Select all filtered rows
   */
  selectAllFiltered(): void {
    // Would need integration with NgUiGrid filtering
    this.selectAll();
  }
  
  /**
   * Deselect all filtered rows
   */
  deselectAllFiltered(): void {
    // Would need integration with NgUiGrid filtering
    this.deselectAll();
  }
  
  /**
   * Get selected nodes
   */
  getSelectedNodes(): RowNode[] {
    return Array.from(this.selectedNodes);
  }
  
  /**
   * Get selected rows data
   */
  getSelectedRows(): any[] {
    return Array.from(this.selectedNodes).map(node => node.data);
  }
  
  /**
   * Set nodes selected
   */
  setNodesSelected(nodes: RowNode[], newValue: boolean, clearSelection?: boolean): number {
    if (clearSelection) {
      this.deselectAll();
    }
    
    let changedCount = 0;
    nodes.forEach(node => {
      if (node.selected !== newValue) {
        node.selected = newValue;
        if (newValue) {
          this.selectedNodes.add(node);
        } else {
          this.selectedNodes.delete(node);
        }
        changedCount++;
      }
    });
    
    return changedCount;
  }
  
  /**
   * Select by index
   */
  selectIndex(index: number, tryMulti?: boolean): void {
    if (index >= 0 && index < this.currentRowData.length) {
      const node = this.createRowNode(this.currentRowData[index], index);
      if (!tryMulti) {
        this.deselectAll();
      }
      node.selected = true;
      this.selectedNodes.add(node);
    }
  }
  
  /**
   * Deselect by index
   */
  deselectIndex(index: number): void {
    const node = Array.from(this.selectedNodes).find(n => n.rowIndex === index);
    if (node) {
      node.selected = false;
      this.selectedNodes.delete(node);
    }
  }
  
  // Focus Methods
  
  /**
   * Get focused cell
   */
  getFocusedCell(): CellPosition | null {
    return this.focusedCell;
  }
  
  /**
   * Set focused cell
   */
  setFocusedCell(rowIndex: number, colKey?: string | number): void {
    this.focusedCell = {
      rowIndex,
      column: colKey ? this.createColumn(colKey.toString()) : null
    };
  }
  
  /**
   * Clear focused cell
   */
  clearFocusedCell(): void {
    this.focusedCell = null;
  }
  
  // Filtering Methods
  
  /**
   * Set filter model
   */
  setFilterModel(model: any): void {
    // Would need integration with NgUiGrid filtering system
    console.warn('Filter model not fully implemented - requires NgUiGrid integration');
  }
  
  /**
   * Get filter model
   */
  getFilterModel(): any {
    // Would need integration with NgUiGrid filtering system
    return {};
  }
  
  /**
   * Get filter instance
   */
  getFilterInstance(key: string): any | null {
    // Would need integration with NgUiGrid filtering system
    return null;
  }
  
  /**
   * Get all filter instances
   */
  getFilterInstances(): { [key: string]: any } {
    return {};
  }
  
  /**
   * Destroy filter
   */
  destroyFilter(key: string): void {
    // Would need integration with NgUiGrid filtering system
  }
  
  /**
   * Check if any filter is present
   */
  isAnyFilterPresent(): boolean {
    return false; // Would need integration
  }
  
  /**
   * Check if column filter is present
   */
  isColumnFilterPresent(): boolean {
    return false; // Would need integration
  }
  
  /**
   * Check if quick filter is present
   */
  isQuickFilterPresent(): boolean {
    return false; // Would need integration
  }
  
  /**
   * Get quick filter text
   */
  getQuickFilterText(): string {
    return '';
  }
  
  /**
   * Set quick filter text
   */
  setQuickFilter(newFilter: string): void {
    // Would need integration with NgUiGrid filtering system
  }
  
  /**
   * Reset quick filter
   */
  resetQuickFilter(): void {
    this.setQuickFilter('');
  }
  
  // Overlay Methods
  
  /**
   * Show loading overlay
   */
  showLoadingOverlay(): void {
    if (this.ngUiGridComponent) {
      this.ngUiGridComponent.showLoading = true;
    }
  }
  
  /**
   * Show no rows overlay
   */
  showNoRowsOverlay(): void {
    if (this.ngUiGridComponent) {
      this.ngUiGridComponent.showNoData = true;
    }
  }
  
  /**
   * Hide overlay
   */
  hideOverlay(): void {
    if (this.ngUiGridComponent) {
      this.ngUiGridComponent.showLoading = false;
      this.ngUiGridComponent.showNoData = false;
    }
  }
  
  // Sorting Methods
  
  /**
   * Set sort model
   */
  setSortModel(model: any[]): void {
    // Would need integration with NgUiGrid sorting system
    console.warn('Sort model not fully implemented - requires NgUiGrid integration');
  }
  
  /**
   * Get sort model
   */
  getSortModel(): any[] {
    return [];
  }
  
  // Rendering Methods
  
  /**
   * Refresh cells
   */
  refreshCells(params?: RefreshCellsParams): void {
    if (this.ngUiGridComponent) {
      this.ngUiGridComponent.detectChanges();
    }
  }
  
  /**
   * Redraw rows
   */
  redrawRows(params?: RedrawRowsParams): void {
    this.refreshCells();
  }
  
  /**
   * Set row node selected
   */
  setRowNodeSelected(node: RowNode, selected: boolean, clearSelection?: boolean): void {
    this.setNodesSelected([node], selected, clearSelection);
  }
  
  /**
   * Flash cells
   */
  flashCells(params?: FlashCellsParams): void {
    // Visual feedback would need custom implementation
    console.warn('Flash cells not implemented - requires custom animation');
  }
  
  /**
   * Refresh header
   */
  refreshHeader(): void {
    if (this.ngUiGridComponent) {
      this.ngUiGridComponent.detectChanges();
    }
  }
  
  /**
   * Refresh footer
   */
  refreshFooter(): void {
    if (this.ngUiGridComponent) {
      this.ngUiGridComponent.detectChanges();
    }
  }
  
  // Editing Methods
  
  /**
   * Check if editing
   */
  isEditing(): boolean {
    return false; // Would need integration with NgUiGrid editing system
  }
  
  /**
   * Start editing cell
   */
  startEditingCell(params: StartEditingCellParams): void {
    // Would need integration with NgUiGrid editing system
  }
  
  /**
   * Stop editing
   */
  stopEditing(cancel?: boolean): void {
    // Would need integration with NgUiGrid editing system
  }
  
  /**
   * Get editing cells
   */
  getEditingCells(): CellPosition[] {
    return [];
  }
  
  // Export Methods
  
  /**
   * Export data to CSV
   */
  exportDataAsCsv(params?: CsvExportParams): string {
    return this.getDataAsCsv(params);
  }
  
  /**
   * Get data as CSV
   */
  getDataAsCsv(params?: CsvExportParams): string {
    const separator = params?.columnSeparator || ',';
    const includeHeader = !params?.skipHeader;
    
    let csv = '';
    
    if (includeHeader) {
      const headers = this.currentColumnDefs.map(col => col.headerName || col.field).join(separator);
      csv += headers + '\n';
    }
    
    this.currentRowData.forEach(row => {
      const values = this.currentColumnDefs.map(col => {
        const value = row[col.field] || '';
        return typeof value === 'string' && value.includes(separator) ? `"${value}"` : value;
      });
      csv += values.join(separator) + '\n';
    });
    
    return csv;
  }
  
  /**
   * Export data to Excel
   */
  exportDataAsExcel(params?: ExcelExportParams): string {
    // Excel export would need a proper Excel library
    console.warn('Excel export not implemented - use CSV export instead');
    return this.getDataAsCsv(params);
  }
  
  /**
   * Get data as Excel
   */
  getDataAsExcel(params?: ExcelExportParams): string {
    return this.exportDataAsExcel(params);
  }
  
  // Clipboard Methods
  
  /**
   * Copy to clipboard
   */
  copyToClipboard(params?: CopyToClipboardParams): void {
    const csv = this.getDataAsCsv({
      includeHeaders: params?.includeHeaders,
      onlySelected: true
    });
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(csv);
    }
  }
  
  /**
   * Copy selected rows to clipboard
   */
  copySelectedRowsToClipboard(includeHeaders?: boolean): void {
    this.copyToClipboard({ includeHeaders });
  }
  
  /**
   * Copy selected ranges to clipboard
   */
  copySelectedRangesToClipboard(includeHeaders?: boolean): void {
    this.copySelectedRowsToClipboard(includeHeaders);
  }
  
  /**
   * Paste from clipboard
   */
  pasteFromClipboard(): void {
    // Would need clipboard API and data parsing
    console.warn('Paste from clipboard not implemented');
  }
  
  // Pagination Methods - Implementation would depend on NgUiGrid pagination
  isPaginationEnabled(): boolean { return false; }
  paginationGetCurrentPage(): number { return 0; }
  paginationGetTotalPages(): number { return 1; }
  paginationGetPageSize(): number { return this.currentRowData.length; }
  paginationGetRowCount(): number { return this.currentRowData.length; }
  paginationGoToNextPage(): void { }
  paginationGoToPreviousPage(): void { }
  paginationGoToFirstPage(): void { }
  paginationGoToLastPage(): void { }
  paginationGoToPage(page: number): void { }
  paginationSetPageSize(size: number): void { }
  
  // Row Model Methods - Simplified implementations
  getModel(): any { return { getRowCount: () => this.currentRowData.length }; }
  getInfiniteRowCount(): number | undefined { return undefined; }
  isLastRowIndexKnown(): boolean { return true; }
  setInfiniteRowCount(count: number, lastRowIndexKnown?: boolean): void { }
  getCacheTopIndex(): number { return 0; }
  getCacheBottomIndex(): number { return this.currentRowData.length - 1; }
  getDisplayedRowAtIndex(index: number): RowNode | null {
    return index < this.currentRowData.length ? this.createRowNode(this.currentRowData[index], index) : null;
  }
  getDisplayedRowCount(): number { return this.currentRowData.length; }
  getFirstDisplayedRow(): number { return 0; }
  getLastDisplayedRow(): number { return Math.max(0, this.currentRowData.length - 1); }
  
  // Scrolling Methods - Would need NgUiGrid integration
  ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle'): void { }
  ensureColumnVisible(key: string): void { }
  ensureNodeVisible(comparator: any, position?: 'top' | 'bottom' | 'middle'): void { }
  getHorizontalPixelRange(): { left: number; right: number } { return { left: 0, right: 0 }; }
  getVerticalPixelRange(): { top: number; bottom: number } { return { top: 0, bottom: 0 }; }
  setGridWidth(width: number): void { }
  setGridHeight(height: number): void { }
  
  // Grouping Methods - Would need NgUiGrid grouping integration
  expandAll(): void { }
  collapseAll(): void { }
  getServerSideGroupLevelState(): any[] { return []; }
  getServerSideGroupKeys(node: RowNode): string[] { return []; }
  isServerSideGroupOpenByDefault(params: any): boolean { return false; }
  
  // Value Methods
  getValue(colKey: string, node: RowNode): any {
    return node.data[colKey];
  }
  
  setValue(colKey: string, newValue: any, node: RowNode): boolean {
    if (node.data) {
      node.data[colKey] = newValue;
      return true;
    }
    return false;
  }
  
  aggregateColumns(keys: string[], aggregationFunction: string): any {
    // Would need aggregation implementation
    return null;
  }
  
  // Context Methods
  getContext(): any { return {}; }
  setContext(context: any): void { }
  
  // Event Methods
  addEventListener(eventType: string, listener: Function): void { }
  addOneTimeEventListener(eventType: string, listener: Function): void { }
  removeEventListener(eventType: string, listener: Function): void { }
  dispatchEvent(event: any): void { }
  
  // Cleanup
  destroy(): void {
    this.selectedNodes.clear();
    this.focusedCell = null;
  }
  
  // Additional methods with minimal implementations
  resetRowHeights(): void { }
  setRowHeights(nodes: RowNode[]): void { }
  onGroupExpandedOrCollapsed(deprecated_refreshFromIndex?: any): void { }
  refreshInMemoryRowModel(step?: string): void { }
  refreshInfiniteCache(): void { }
  purgeInfiniteCache(): void { }
  getInfiniteCacheTopIndex(): number { return 0; }
  getInfiniteCacheBottomIndex(): number { return this.currentRowData.length - 1; }
  getVirtualRowCount(): number { return this.currentRowData.length; }
  isMaxRowFound(): boolean { return true; }
  setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void { }
  getLastDisplayedRowIndex(): number { return this.currentRowData.length - 1; }
  getFirstDisplayedRowIndex(): number { return 0; }
  
  // =================
  // ColumnApi Methods
  // =================
  
  // Column Definition Methods
  getColumn(key: string): any | null {
    const colDef = this.currentColumnDefs.find(col => col.colId === key || col.field === key);
    return colDef ? this.createColumn(colDef) : null;
  }
  
  getColumns(): any[] {
    return this.currentColumnDefs.map(colDef => this.createColumn(colDef));
  }
  
  getAllColumns(): any[] {
    return this.getColumns();
  }
  
  getAllGridColumns(): any[] {
    return this.getColumns();
  }
  
  getDisplayedLeftColumns(): any[] { return []; }
  getDisplayedCenterColumns(): any[] { return this.getColumns(); }
  getDisplayedRightColumns(): any[] { return []; }
  getAllDisplayedColumns(): any[] { return this.getColumns(); }
  getAllDisplayedVirtualColumns(): any[] { return this.getColumns(); }
  
  // Column Visibility Methods
  setColumnVisible(key: string, visible: boolean): void {
    const colDef = this.currentColumnDefs.find(col => col.colId === key || col.field === key);
    if (colDef) {
      colDef.hide = !visible;
    }
  }
  
  setColumnsVisible(keys: string[], visible: boolean): void {
    keys.forEach(key => this.setColumnVisible(key, visible));
  }
  
  isColumnVisible(key: string): boolean {
    const colDef = this.currentColumnDefs.find(col => col.colId === key || col.field === key);
    return colDef ? !colDef.hide : false;
  }
  
  getVisibleColumns(): any[] {
    return this.currentColumnDefs
      .filter(col => !col.hide)
      .map(col => this.createColumn(col));
  }
  
  // Column Width Methods
  setColumnWidth(key: string, newWidth: number, finished?: boolean, source?: string): void {
    const colDef = this.currentColumnDefs.find(col => col.colId === key || col.field === key);
    if (colDef) {
      colDef.width = newWidth;
    }
  }
  
  setColumnWidths(columnWidths: { key: string; newWidth: number }[], finished?: boolean, source?: string): void {
    columnWidths.forEach(({ key, newWidth }) => this.setColumnWidth(key, newWidth, finished, source));
  }
  
  getColumnWidth(key: string): number {
    const colDef = this.currentColumnDefs.find(col => col.colId === key || col.field === key);
    return colDef?.width || 100;
  }
  
  // Auto-sizing methods would need NgUiGrid integration
  autoSizeColumn(key: string, skipHeader?: boolean): void { }
  autoSizeColumns(keys: string[], skipHeader?: boolean): void { }
  autoSizeAllColumns(skipHeader?: boolean): void { }
  
  // Pinning Methods
  setColumnPinned(key: string, pinned: 'left' | 'right' | boolean | null): void {
    const colDef = this.currentColumnDefs.find(col => col.colId === key || col.field === key);
    if (colDef) {
      if (pinned === true) {
        colDef.pinned = 'left';
      } else if (pinned === false || pinned === null) {
        colDef.pinned = null;
      } else {
        colDef.pinned = pinned;
      }
    }
  }
  
  setColumnsPinned(keys: string[], pinned: 'left' | 'right' | boolean | null): void {
    keys.forEach(key => this.setColumnPinned(key, pinned));
  }
  
  isColumnPinned(key: string): boolean {
    const colDef = this.currentColumnDefs.find(col => col.colId === key || col.field === key);
    return !!(colDef?.pinned);
  }
  
  getPinnedLeftColumns(): any[] {
    return this.currentColumnDefs
      .filter(col => col.pinned === 'left')
      .map(col => this.createColumn(col));
  }
  
  getPinnedRightColumns(): any[] {
    return this.currentColumnDefs
      .filter(col => col.pinned === 'right')
      .map(col => this.createColumn(col));
  }
  
  getLeftDisplayedColumns(): any[] { return this.getPinnedLeftColumns(); }
  getRightDisplayedColumns(): any[] { return this.getPinnedRightColumns(); }
  
  // Column Moving Methods
  moveColumn(key: string, toIndex: number): void {
    const fromIndex = this.currentColumnDefs.findIndex(col => col.colId === key || col.field === key);
    if (fromIndex !== -1) {
      this.moveColumnByIndex(fromIndex, toIndex);
    }
  }
  
  moveColumns(keys: string[], toIndex: number): void {
    // Simple implementation - move one by one
    keys.forEach((key, i) => this.moveColumn(key, toIndex + i));
  }
  
  moveColumnByIndex(fromIndex: number, toIndex: number): void {
    if (fromIndex >= 0 && fromIndex < this.currentColumnDefs.length &&
        toIndex >= 0 && toIndex < this.currentColumnDefs.length) {
      const column = this.currentColumnDefs.splice(fromIndex, 1)[0];
      this.currentColumnDefs.splice(toIndex, 0, column);
    }
  }
  
  getColumnIndex(key: string): number {
    return this.currentColumnDefs.findIndex(col => col.colId === key || col.field === key);
  }
  
  // Column State Methods
  getColumnState(): ColumnState[] {
    return this.currentColumnDefs.map((colDef, index) => ({
      colId: colDef.colId || colDef.field,
      width: colDef.width,
      hide: colDef.hide,
      pinned: colDef.pinned,
      sort: colDef.sort,
      sortIndex: colDef.sortIndex
    }));
  }
  
  setColumnState(columnState: ColumnState[]): boolean {
    columnState.forEach(state => {
      const colDef = this.currentColumnDefs.find(col => 
        col.colId === state.colId || col.field === state.colId
      );
      if (colDef) {
        if (state.width !== undefined) colDef.width = state.width;
        if (state.hide !== undefined) colDef.hide = state.hide;
        if (state.pinned !== undefined) colDef.pinned = state.pinned;
        if (state.sort !== undefined) colDef.sort = state.sort;
        if (state.sortIndex !== undefined) colDef.sortIndex = state.sortIndex;
      }
    });
    return true;
  }
  
  resetColumnState(): void {
    // Reset to initial state - would need to store initial state
  }
  
  applyColumnState(params: ApplyColumnStateParams): boolean {
    if (params.state) {
      return this.setColumnState(params.state);
    }
    return false;
  }
  
  // Minimal implementations for remaining methods
  getColumnGroup(name: string, instanceId?: number): any | null { return null; }
  getProvidedColumnGroup(name: string): any | null { return null; }
  getDisplayNameForColumn(column: any, location?: string): string { return column.headerName || column.field || ''; }
  getDisplayNameForColumnGroup(columnGroup: any, location?: string): string { return columnGroup.name || ''; }
  setColumnGroupOpened(group: any, newValue: boolean): void { }
  getColumnGroupState(): { groupId: string; open: boolean }[] { return []; }
  setColumnGroupState(stateItems: { groupId: string; open: boolean }[]): void { }
  resetColumnGroupState(): void { }
  
  // Row/Value/Pivot grouping methods - would need NgUiGrid integration
  addRowGroupColumn(key: string): void { }
  addRowGroupColumns(keys: string[]): void { }
  removeRowGroupColumn(key: string): void { }
  removeRowGroupColumns(keys: string[]): void { }
  setRowGroupColumns(keys: string[]): void { }
  getRowGroupColumns(): any[] { return []; }
  addValueColumn(key: string): void { }
  addValueColumns(keys: string[]): void { }
  removeValueColumn(key: string): void { }
  removeValueColumns(keys: string[]): void { }
  setValueColumns(keys: string[]): void { }
  getValueColumns(): any[] { return []; }
  addPivotColumn(key: string): void { }
  addPivotColumns(keys: string[]): void { }
  removePivotColumn(key: string): void { }
  removePivotColumns(keys: string[]): void { }
  setPivotColumns(keys: string[]): void { }
  getPivotColumns(): any[] { return []; }
  isPivotMode(): boolean { return false; }
  getPivotResultColumns(): any[] { return []; }
  getPivotResultColumn(pivotKeys: string[], valueColKey: string): any | null { return null; }
  setFuncOnColumn(key: string, func: string | null): void { }
  setFuncOnColumns(keys: string[], func: string | null): void { }
  
  // Tool panel methods
  setColumnsToolPanel(show: boolean): void { }
  isColumnsToolPanelShowing(): boolean { return false; }
  setFiltersToolPanel(show: boolean): void { }
  isFiltersToolPanelShowing(): boolean { return false; }
  
  // Flex methods
  setColumnFlex(key: string, flex: number): void {
    const colDef = this.currentColumnDefs.find(col => col.colId === key || col.field === key);
    if (colDef) {
      colDef.flex = flex;
    }
  }
  
  setColumnsFlex(columnFlexes: { key: string; flex: number }[]): void {
    columnFlexes.forEach(({ key, flex }) => this.setColumnFlex(key, flex));
  }
  
  // Advanced methods with minimal implementations
  getSecondaryColumns(): any[] | null { return null; }
  getSecondaryPivotResultColumns(): any[] | null { return null; }
  getPrimaryColumns(): any[] | null { return this.getColumns(); }
  getPrimaryAndSecondaryColumns(): any[] | null { return this.getColumns(); }
  getAllPrimaryColumns(): any[] | null { return this.getColumns(); }
  getGridColumn(key: string): any | null { return this.getColumn(key); }
  getGridColumns(keys: string[]): any[] { return keys.map(key => this.getColumn(key)).filter(Boolean); }
  isSecondaryColumnsPresent(): boolean { return false; }
  setPivotResultColumns(colDefs: any[]): void { }
  setSecondaryColumns(colDefs: any[]): void { }
  getVirtualColumnsContainerWidth(): number { return 0; }
  
  // =================
  // Helper Methods
  // =================
  
  /**
   * Create a row node from data
   */
  private createRowNode(data: any, rowIndex: number): RowNode {
    return {
      id: this.getRowId(data),
      data: data,
      parent: null,
      level: 0,
      uiLevel: 0,
      group: false,
      selected: false,
      expanded: false,
      master: false,
      canFlower: false,
      flower: false,
      rowIndex: rowIndex,
      displayed: true,
      leafGroup: false,
      footer: false,
      stub: false,
      __objectId: rowIndex
    } as RowNode;
  }
  
  /**
   * Create a column object from column definition
   */
  private createColumn(colDefOrId: any): any {
    const colDef = typeof colDefOrId === 'string' 
      ? this.currentColumnDefs.find(col => col.colId === colDefOrId || col.field === colDefOrId)
      : colDefOrId;
      
    if (!colDef) return null;
    
    return {
      colId: colDef.colId || colDef.field,
      field: colDef.field,
      headerName: colDef.headerName,
      width: colDef.width || 100,
      visible: !colDef.hide,
      pinned: colDef.pinned || null,
      sort: colDef.sort || null,
      sortIndex: colDef.sortIndex || null
    };
  }
  
  /**
   * Get row ID from row data
   */
  private getRowId(data: any): string | number {
    return data.id || data._id || JSON.stringify(data);
  }
}