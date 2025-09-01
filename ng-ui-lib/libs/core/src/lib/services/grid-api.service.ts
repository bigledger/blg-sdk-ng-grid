import { Injectable, signal, inject } from '@angular/core';
import { 
  GridApi, 
  RowDataTransaction, 
  RefreshCellsParams, 
  RedrawRowsParams, 
  CsvExportParams, 
  ExcelExportParams,
  ColumnState,
  ColDef,
  colDefToColumnDefinition 
} from '../interfaces/ag-grid-compat.interface';
import { GridStateService } from './grid-state.service';
import { ExportService } from './export.service';
import { ColumnDefinition } from '../interfaces/column-definition.interface';

/**
 * ag-Grid compatible GridApi implementation
 */
@Injectable()
export class GridApiService implements GridApi {
  private gridState = inject(GridStateService);
  private exportService = inject(ExportService);
  
  // Internal data signals
  private _rowData = signal<any[]>([]);
  private _columnDefs = signal<ColDef[]>([]);
  
  // Computed values
  readonly rowData = this._rowData.asReadonly();
  readonly columnDefs = this._columnDefs.asReadonly();
  
  constructor() {}
  
  /**
   * Set row data
   */
  setRowData(data: any[]): void {
    this._rowData.set(data || []);
    // Update internal grid state
    this.gridState.updateData(data || []);
  }
  
  /**
   * Update row data with transaction
   */
  updateRowData(transaction: RowDataTransaction): void {
    const currentData = [...this._rowData()];
    
    // Handle additions
    if (transaction.add && transaction.add.length > 0) {
      if (transaction.addIndex !== undefined) {
        currentData.splice(transaction.addIndex, 0, ...transaction.add);
      } else {
        currentData.push(...transaction.add);
      }
    }
    
    // Handle removals
    if (transaction.remove && transaction.remove.length > 0) {
      transaction.remove.forEach(itemToRemove => {
        const index = currentData.findIndex(item => this.itemsEqual(item, itemToRemove));
        if (index >= 0) {
          currentData.splice(index, 1);
        }
      });
    }
    
    // Handle updates
    if (transaction.update && transaction.update.length > 0) {
      transaction.update.forEach(updatedItem => {
        const index = currentData.findIndex(item => this.itemsEqual(item, updatedItem));
        if (index >= 0) {
          currentData[index] = { ...currentData[index], ...updatedItem };
        }
      });
    }
    
    this.setRowData(currentData);
  }
  
  /**
   * Refresh cells
   */
  refreshCells(params?: RefreshCellsParams): void {
    // Force update of grid state to trigger re-render
    // TODO: Implement specific cell refresh based on params
    this.gridState.updateData(this._rowData());
  }
  
  /**
   * Redraw rows
   */
  redrawRows(params?: RedrawRowsParams): void {
    // Similar to refreshCells but specifically for rows
    this.refreshCells();
  }
  
  /**
   * Set column definitions
   */
  setColumnDefs(colDefs: ColDef[]): void {
    this._columnDefs.set(colDefs || []);
    
    // Convert to internal ColumnDefinition format
    const columns: ColumnDefinition[] = colDefs.map(colDef => colDefToColumnDefinition(colDef));
    this.gridState.updateColumns(columns);
  }
  
  /**
   * Get selected rows
   */
  getSelectedRows(): any[] {
    const selectedIndices = this.gridState.selectedRows();
    const data = this._rowData();
    const selectedRows: any[] = [];
    
    selectedIndices.forEach(index => {
      if (index < data.length) {
        selectedRows.push(data[index]);
      }
    });
    
    return selectedRows;
  }
  
  /**
   * Select all rows
   */
  selectAll(): void {
    const data = this._rowData();
    for (let i = 0; i < data.length; i++) {
      this.gridState.toggleRowSelection(i, true);
    }
  }
  
  /**
   * Deselect all rows
   */
  deselectAll(): void {
    this.gridState.clearSelection();
  }
  
  /**
   * Select all filtered rows
   */
  selectAllFiltered(): void {
    // For now, same as selectAll since we don't have filtered data context
    this.selectAll();
  }
  
  /**
   * Deselect all filtered rows
   */
  deselectAllFiltered(): void {
    this.deselectAll();
  }
  
  /**
   * Export data as CSV
   */
  exportDataAsCsv(params?: CsvExportParams): void {
    const columns = this.getColumnsForExport(params?.columnKeys);
    const data = this.getDataForExport(params?.onlySelected);
    
    this.exportService.exportData(
      data,
      columns,
      {
        format: 'csv',
        filename: params?.fileName || 'export',
        includeHeaders: !params?.skipHeader,
        dataScope: params?.onlySelected ? 'selected' : 'all'
      }
    );
  }
  
  /**
   * Export data as Excel
   */
  exportDataAsExcel(params?: ExcelExportParams): void {
    const columns = this.getColumnsForExport(params?.columnKeys);
    const data = this.getDataForExport(params?.onlySelected);
    
    this.exportService.exportData(
      data,
      columns,
      {
        format: 'excel',
        filename: params?.fileName || 'export',
        includeHeaders: !params?.skipHeader,
        dataScope: params?.onlySelected ? 'selected' : 'all'
      }
    );
  }
  
  /**
   * Size columns to fit container
   */
  sizeColumnsToFit(): void {
    // This would typically resize columns to fit the grid width
    // Implementation would depend on container size calculation
    console.log('sizeColumnsToFit called - implementation depends on container measurements');
  }
  
  /**
   * Auto size specific columns
   */
  autoSizeColumns(keys: string[], skipHeader?: boolean): void {
    // Auto-size columns based on content
    keys.forEach(key => {
      // Implementation would measure content and set optimal width
      console.log(`Auto-sizing column: ${key}, skipHeader: ${skipHeader}`);
    });
  }
  
  /**
   * Auto size all columns
   */
  autoSizeAllColumns(skipHeader?: boolean): void {
    const columns = this.gridState.columns();
    const keys = columns.map(col => col.id);
    this.autoSizeColumns(keys, skipHeader);
  }
  
  /**
   * Set filter model
   */
  setFilterModel(model: any): void {
    if (model) {
      Object.keys(model).forEach(columnId => {
        this.gridState.updateFilter(columnId, model[columnId]);
      });
    } else {
      this.gridState.clearFilters();
    }
  }
  
  /**
   * Get filter model
   */
  getFilterModel(): any {
    return this.gridState.filterState();
  }
  
  /**
   * Set sort model
   */
  setSortModel(model: any[]): void {
    this.gridState.clearSort();
    if (model && model.length > 0) {
      model.forEach((sortItem, index) => {
        this.gridState.updateSort(sortItem.colId, sortItem.sort, index > 0);
      });
    }
  }
  
  /**
   * Get sort model
   */
  getSortModel(): any[] {
    const sorts = this.gridState.sortState() || [];
    return sorts.map(sort => ({
      colId: sort.columnId,
      sort: sort.direction
    }));
  }
  
  /**
   * Show loading overlay
   */
  showLoadingOverlay(): void {
    console.log('showLoadingOverlay called');
  }
  
  /**
   * Show no rows overlay
   */
  showNoRowsOverlay(): void {
    console.log('showNoRowsOverlay called');
  }
  
  /**
   * Hide overlay
   */
  hideOverlay(): void {
    console.log('hideOverlay called');
  }
  
  /**
   * Get displayed row at index
   */
  getDisplayedRowAtIndex(index: number): any {
    const data = this._rowData();
    return index < data.length ? data[index] : null;
  }
  
  /**
   * Get displayed row count
   */
  getDisplayedRowCount(): number {
    return this._rowData().length;
  }
  
  /**
   * Get first displayed row index
   */
  getFirstDisplayedRow(): number {
    return this._rowData().length > 0 ? 0 : -1;
  }
  
  /**
   * Get last displayed row index
   */
  getLastDisplayedRow(): number {
    const length = this._rowData().length;
    return length > 0 ? length - 1 : -1;
  }
  
  /**
   * For each node callback
   */
  forEachNode(callback: (node: any) => void): void {
    this._rowData().forEach((data, index) => {
      callback({ data, id: index, rowIndex: index });
    });
  }
  
  /**
   * For each leaf node callback (same as forEachNode for flat data)
   */
  forEachLeafNode(callback: (node: any) => void): void {
    this.forEachNode(callback);
  }
  
  /**
   * For each node after filter callback
   */
  forEachNodeAfterFilter(callback: (node: any) => void): void {
    // Would need filtered data - for now same as forEachNode
    this.forEachNode(callback);
  }
  
  /**
   * For each node after filter and sort callback
   */
  forEachNodeAfterFilterAndSort(callback: (node: any) => void): void {
    // Would need filtered and sorted data - for now same as forEachNode
    this.forEachNode(callback);
  }
  
  /**
   * Reset quick filter
   */
  resetQuickFilter(): void {
    // Quick filter implementation
    console.log('resetQuickFilter called');
  }
  
  /**
   * Set quick filter
   */
  setQuickFilter(newFilter: string): void {
    console.log('setQuickFilter called:', newFilter);
  }
  
  /**
   * Select node
   */
  selectNode(node: any, tryMulti?: boolean): void {
    if (node && typeof node.rowIndex === 'number') {
      this.gridState.toggleRowSelection(node.rowIndex, true);
    }
  }
  
  /**
   * Deselect node
   */
  deselectNode(node: any): void {
    if (node && typeof node.rowIndex === 'number') {
      this.gridState.toggleRowSelection(node.rowIndex, false);
    }
  }
  
  /**
   * Select index
   */
  selectIndex(index: number, tryMulti?: boolean): void {
    this.gridState.toggleRowSelection(index, true);
  }
  
  /**
   * Deselect index
   */
  deselectIndex(index: number): void {
    this.gridState.toggleRowSelection(index, false);
  }
  
  /**
   * Get row node by ID
   */
  getRowNode(id: string): any {
    const index = parseInt(id, 10);
    if (!isNaN(index) && index < this._rowData().length) {
      return { data: this._rowData()[index], id: index, rowIndex: index };
    }
    return null;
  }
  
  /**
   * Refresh header
   */
  refreshHeader(): void {
    // Force column update
    this.gridState.updateColumns(this.gridState.columns());
  }
  
  /**
   * Get column state
   */
  getColumnState(): ColumnState[] {
    const columns = this.gridState.columns();
    const sorts = this.gridState.sortState() || [];
    
    return columns.map(col => {
      const sort = sorts.find(s => s.columnId === col.id);
      return {
        colId: col.id,
        width: col.width,
        hide: col.visible === false,
        pinned: col.pinned || null,
        sort: sort?.direction || null,
        sortIndex: sort?.order,
        aggFunc: null,
        pivot: false,
        pivotIndex: null,
        rowGroup: false,
        rowGroupIndex: null,
        flex: null
      };
    });
  }
  
  /**
   * Set column state
   */
  setColumnState(columnState: ColumnState[]): void {
    const currentColumns = [...this.gridState.columns()];
    
    columnState.forEach(state => {
      const columnIndex = currentColumns.findIndex(col => col.id === state.colId);
      if (columnIndex >= 0) {
        const column = { ...currentColumns[columnIndex] };
        
        if (state.width !== undefined) column.width = state.width;
        if (state.hide !== undefined) column.visible = !state.hide;
        if (state.pinned !== undefined) column.pinned = state.pinned;
        
        currentColumns[columnIndex] = column;
        
        // Handle sorting
        if (state.sort) {
          this.gridState.updateSort(state.colId, state.sort, state.sortIndex !== 0);
        }
      }
    });
    
    this.gridState.updateColumns(currentColumns);
  }
  
  /**
   * Reset column state
   */
  resetColumnState(): void {
    // Reset to original column definitions
    this.gridState.resetColumns();
  }
  
  /**
   * Get column group state (placeholder)
   */
  getColumnGroupState(): any[] {
    return [];
  }
  
  /**
   * Set column group state (placeholder)
   */
  setColumnGroupState(stateItems: any[]): void {
    console.log('setColumnGroupState called:', stateItems);
  }
  
  /**
   * Reset column group state (placeholder)
   */
  resetColumnGroupState(): void {
    console.log('resetColumnGroupState called');
  }
  
  /**
   * Start editing cell
   */
  startEditingCell(params: any): void {
    console.log('startEditingCell called:', params);
  }
  
  /**
   * Stop editing
   */
  stopEditing(cancel?: boolean): void {
    console.log('stopEditing called, cancel:', cancel);
  }
  
  /**
   * Get editing cells
   */
  getEditingCells(): any[] {
    return [];
  }
  
  /**
   * Set focused cell
   */
  setFocusedCell(rowIndex: number, colKey: string | number): void {
    console.log('setFocusedCell called:', rowIndex, colKey);
  }
  
  /**
   * Clear focused cell
   */
  clearFocusedCell(): void {
    console.log('clearFocusedCell called');
  }
  
  /**
   * Get focused cell
   */
  getFocusedCell(): any {
    return null;
  }
  
  // Placeholder methods for remaining interface requirements
  setRowHeight(rowIndex: number, rowHeight: number): void { console.log('setRowHeight:', rowIndex, rowHeight); }
  resetRowHeights(): void { console.log('resetRowHeights called'); }
  onRowHeightChanged(): void { console.log('onRowHeightChanged called'); }
  purgeVirtualPageCache(): void { console.log('purgeVirtualPageCache called'); }
  getVirtualPageState(): any { return {}; }
  isAnyFilterPresent(): boolean { return Object.keys(this.gridState.filterState()).length > 0; }
  isAdvancedFilterPresent(): boolean { return false; }
  isColumnFilterPresent(): boolean { return this.isAnyFilterPresent(); }
  isQuickFilterPresent(): boolean { return false; }
  getModel(): any { return null; }
  getInfinitePageState(): any { return {}; }
  isPinningLeft(): boolean { return this.gridState.columns().some(col => col.pinned === 'left'); }
  isPinningRight(): boolean { return this.gridState.columns().some(col => col.pinned === 'right'); }
  getPinnedTopRowCount(): number { return 0; }
  getPinnedBottomRowCount(): number { return 0; }
  getPinnedTopRow(index: number): any { return null; }
  getPinnedBottomRow(index: number): any { return null; }
  setPinnedTopRowData(rowData: any[]): void { console.log('setPinnedTopRowData:', rowData); }
  setPinnedBottomRowData(rowData: any[]): void { console.log('setPinnedBottomRowData:', rowData); }
  addPinnedTopRowData(rowData: any[]): void { console.log('addPinnedTopRowData:', rowData); }
  addPinnedBottomRowData(rowData: any[]): void { console.log('addPinnedBottomRowData:', rowData); }
  removePinnedTopRowData(rowData: any[]): void { console.log('removePinnedTopRowData:', rowData); }
  removePinnedBottomRowData(rowData: any[]): void { console.log('removePinnedBottomRowData:', rowData); }
  
  // Helper methods
  private itemsEqual(item1: any, item2: any): boolean {
    // Simple equality check - in real implementation might need more sophisticated comparison
    return JSON.stringify(item1) === JSON.stringify(item2);
  }
  
  private getColumnsForExport(columnKeys?: string[]): ColumnDefinition[] {
    const allColumns = this.gridState.columns();
    if (columnKeys && columnKeys.length > 0) {
      return allColumns.filter(col => columnKeys.includes(col.id));
    }
    return allColumns;
  }
  
  private getDataForExport(onlySelected?: boolean): any[] {
    if (onlySelected) {
      return this.getSelectedRows();
    }
    return this._rowData();
  }
}