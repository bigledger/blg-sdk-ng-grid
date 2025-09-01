/**
 * API Compatibility Layer: Provides ag-Grid-like API for BigLedger Grid
 * This layer enables easier migration by providing familiar method signatures
 */

import { Page } from '@playwright/test';
import { AgGridApi, AgColumnApi } from './ag-grid-types.js';

export class BlgGridApiWrapper implements AgGridApi {
  constructor(private page: Page, private gridSelector: string = '[data-testid="blg-grid"]') {}

  // Selection methods
  async selectAll(): Promise<void> {
    await this.page.click(`${this.gridSelector} [data-testid="select-all-checkbox"]`);
  }

  async deselectAll(): Promise<void> {
    await this.page.click(`${this.gridSelector} [data-testid="select-all-checkbox"]`);
  }

  async selectAllFiltered(): Promise<void> {
    // BLG Grid automatically selects only filtered rows when using select all
    await this.selectAll();
  }

  async deselectAllFiltered(): Promise<void> {
    await this.deselectAll();
  }

  async getSelectedNodes(): Promise<any[]> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getSelectedNodes() : [];
    }, this.gridSelector);
  }

  async getSelectedRows(): Promise<any[]> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getSelectedRows() : [];
    }, this.gridSelector);
  }

  async setRowData(rowData: any[]): Promise<void> {
    await this.page.evaluate(({ selector, data }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).setRowData(data);
      }
    }, { selector: this.gridSelector, data: rowData });
  }

  // Filtering methods
  async setFilterModel(model: any): Promise<void> {
    await this.page.evaluate(({ selector, filterModel }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).setFilterModel(filterModel);
      }
    }, { selector: this.gridSelector, filterModel: model });
  }

  async getFilterModel(): Promise<any> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getFilterModel() : {};
    }, this.gridSelector);
  }

  async setQuickFilter(newFilter: string): Promise<void> {
    const quickFilterInput = `${this.gridSelector} [data-testid="quick-filter-input"]`;
    await this.page.fill(quickFilterInput, newFilter);
    await this.page.press(quickFilterInput, 'Enter');
  }

  async isQuickFilterPresent(): Promise<boolean> {
    const quickFilterInput = `${this.gridSelector} [data-testid="quick-filter-input"]`;
    const value = await this.page.inputValue(quickFilterInput);
    return value.length > 0;
  }

  async isAdvancedFilterPresent(): Promise<boolean> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).hasActiveFilters() : false;
    }, this.gridSelector);
  }

  async isAnyFilterPresent(): Promise<boolean> {
    const quickFilter = await this.isQuickFilterPresent();
    const advancedFilter = await this.isAdvancedFilterPresent();
    return quickFilter || advancedFilter;
  }

  // Sorting methods
  async setSortModel(model: any[]): Promise<void> {
    await this.page.evaluate(({ selector, sortModel }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).setSortModel(sortModel);
      }
    }, { selector: this.gridSelector, sortModel: model });
  }

  async getSortModel(): Promise<any[]> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getSortModel() : [];
    }, this.gridSelector);
  }

  // Scrolling methods
  async ensureIndexVisible(index: number): Promise<void> {
    await this.page.evaluate(({ selector, rowIndex }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).scrollToRow(rowIndex);
      }
    }, { selector: this.gridSelector, rowIndex: index });
  }

  async ensureColumnVisible(key: string): Promise<void> {
    await this.page.evaluate(({ selector, columnKey }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).scrollToColumn(columnKey);
      }
    }, { selector: this.gridSelector, columnKey: key });
  }

  async ensureNodeVisible(comparator: any): Promise<void> {
    // Implementation would depend on the specific node comparison logic
    console.warn('ensureNodeVisible not yet implemented for BLG Grid');
  }

  // Column methods
  async setColumnDefs(colDefs: any[]): Promise<void> {
    await this.page.evaluate(({ selector, columnDefs }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).setColumnDefs(columnDefs);
      }
    }, { selector: this.gridSelector, columnDefs: colDefs });
  }

  async getColumnDefs(): Promise<any[]> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getColumnDefs() : [];
    }, this.gridSelector);
  }

  async sizeColumnsToFit(): Promise<void> {
    await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).sizeColumnsToFit();
      }
    }, this.gridSelector);
  }

  async autoSizeColumns(keys: string[]): Promise<void> {
    await this.page.evaluate(({ selector, columnKeys }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).autoSizeColumns(columnKeys);
      }
    }, { selector: this.gridSelector, columnKeys: keys });
  }

  async autoSizeAllColumns(): Promise<void> {
    await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).autoSizeAllColumns();
      }
    }, this.gridSelector);
  }

  // Refresh methods
  async refreshCells(params?: any): Promise<void> {
    await this.page.evaluate(({ selector, refreshParams }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).refreshCells(refreshParams);
      }
    }, { selector: this.gridSelector, refreshParams: params });
  }

  async redrawRows(params?: any): Promise<void> {
    await this.page.evaluate(({ selector, redrawParams }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).redrawRows(redrawParams);
      }
    }, { selector: this.gridSelector, redrawParams: params });
  }

  async refreshHeader(): Promise<void> {
    await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).refreshHeader();
      }
    }, this.gridSelector);
  }

  // Export methods
  async exportDataAsCsv(params?: any): Promise<string> {
    return await this.page.evaluate(({ selector, exportParams }) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).exportDataAsCsv(exportParams) : '';
    }, { selector: this.gridSelector, exportParams: params });
  }

  async getDataAsCsv(params?: any): Promise<string> {
    return await this.exportDataAsCsv(params);
  }

  async exportDataAsExcel(params?: any): Promise<void> {
    await this.page.evaluate(({ selector, exportParams }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).exportDataAsExcel(exportParams);
      }
    }, { selector: this.gridSelector, exportParams: params });
  }

  async getDataAsExcel(params?: any): Promise<void> {
    await this.exportDataAsExcel(params);
  }

  // Overlay methods
  async showLoadingOverlay(): Promise<void> {
    await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).showLoadingOverlay();
      }
    }, this.gridSelector);
  }

  async showNoRowsOverlay(): Promise<void> {
    await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).showNoRowsOverlay();
      }
    }, this.gridSelector);
  }

  async hideOverlay(): Promise<void> {
    await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).hideOverlay();
      }
    }, this.gridSelector);
  }

  // Data access methods
  async getModel(): Promise<any> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getModel() : null;
    }, this.gridSelector);
  }

  async getDisplayedRowAtIndex(index: number): Promise<any> {
    return await this.page.evaluate(({ selector, rowIndex }) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getDisplayedRowAtIndex(rowIndex) : null;
    }, { selector: this.gridSelector, rowIndex: index });
  }

  async getDisplayedRowCount(): Promise<number> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getDisplayedRowCount() : 0;
    }, this.gridSelector);
  }

  async getFirstDisplayedRow(): Promise<number> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getFirstDisplayedRow() : 0;
    }, this.gridSelector);
  }

  async getLastDisplayedRow(): Promise<number> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getLastDisplayedRow() : 0;
    }, this.gridSelector);
  }

  // Event methods
  async addEventListener(eventType: string, listener: Function): Promise<void> {
    await this.page.evaluate(({ selector, event, listenerFn }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).addEventListener(event, listenerFn);
      }
    }, { selector: this.gridSelector, event: eventType, listenerFn: listener });
  }

  async removeEventListener(eventType: string, listener: Function): Promise<void> {
    await this.page.evaluate(({ selector, event, listenerFn }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).removeEventListener(event, listenerFn);
      }
    }, { selector: this.gridSelector, event: eventType, listenerFn: listener });
  }

  // Utility methods
  async destroy(): Promise<void> {
    await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).destroy();
      }
    }, this.gridSelector);
  }

  async resetQuickFilter(): Promise<void> {
    const quickFilterInput = `${this.gridSelector} [data-testid="quick-filter-input"]`;
    await this.page.fill(quickFilterInput, '');
  }

  async getValue(colKey: string, rowNode: any): Promise<any> {
    return await this.page.evaluate(({ selector, columnKey, node }) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getValue(columnKey, node) : null;
    }, { selector: this.gridSelector, columnKey: colKey, node: rowNode });
  }

  // Stub implementations for methods that don't have direct equivalents
  onFilterChanged(): void { /* Implementation depends on BLG Grid event system */ }
  onSortChanged(): void { /* Implementation depends on BLG Grid event system */ }
  refreshInMemoryRowModel(): void { /* BLG Grid handles this automatically */ }
  purgeInfiniteCache(): void { /* Not applicable to BLG Grid's virtual scrolling */ }
  getInfiniteRowCount(): number { return 0; /* Not applicable */ }
  isMaxRowFound(): boolean { return true; /* Not applicable */ }
  setDatasource(datasource: any): void { /* Different implementation in BLG Grid */ }
  setCacheBlockSize(blockSize: number): void { /* Handled differently in BLG Grid */ }
  getRenderedNodes(): any[] { return []; /* Implementation needed */ }
  forEachNode(callback: (node: any, index: number) => void): void { /* Implementation needed */ }
  forEachNodeAfterFilter(callback: (node: any, index: number) => void): void { /* Implementation needed */ }
  forEachNodeAfterFilterAndSort(callback: (node: any, index: number) => void): void { /* Implementation needed */ }
  forEachLeafNode(callback: (node: any) => void): void { /* Implementation needed */ }
  resetRowHeights(): void { /* Implementation needed */ }
  setHeaderHeight(headerHeight: number): void { /* Implementation needed */ }
  setRowHeight(rowHeight: number): void { /* Implementation needed */ }
  addGlobalListener(listener: Function): void { /* Implementation needed */ }
  removeGlobalListener(listener: Function): void { /* Implementation needed */ }
  dispatchEvent(event: any): void { /* Implementation needed */ }
  getRangeSelections(): any[] { return []; /* Not supported yet */ }
  addRangeSelection(rangeSelection: any): void { /* Not supported yet */ }
  clearRangeSelection(): void { /* Not supported yet */ }
  clearFocusedCell(): void { /* Implementation needed */ }
  getFocusedCell(): any { return null; /* Implementation needed */ }
  setFocusedCell(rowIndex: number, colKey: string): void { /* Implementation needed */ }
  setSuppressRowDrag(suppress: boolean): void { /* Implementation needed */ }
  setSuppressRowClickSelection(suppress: boolean): void { /* Implementation needed */ }
  addItems(items: any[], index?: number): void { /* Implementation needed */ }
  removeItems(rowNodes: any[]): void { /* Implementation needed */ }
  updateRowData(rowDataTransaction: any): any { return null; /* Implementation needed */ }
  batchUpdateRowData(rowDataTransaction: any): void { /* Implementation needed */ }
  insertItemsAtIndex(index: number, items: any[]): void { /* Implementation needed */ }
  removeItemsAtIndex(index: number, toRemove: number): any[] { return []; /* Implementation needed */ }
  addItemsAtIndex(index: number, items: any[]): void { /* Implementation needed */ }
  getAllGridColumns(): any[] { return []; /* Implementation needed */ }
  getDisplayedCenterColumns(): any[] { return []; /* Implementation needed */ }
  getDisplayedLeftColumns(): any[] { return []; /* Implementation needed */ }
  getDisplayedRightColumns(): any[] { return []; /* Implementation needed */ }
  getAllDisplayedColumns(): any[] { return []; /* Implementation needed */ }
  getAllDisplayedVirtualColumns(): any[] { return []; /* Implementation needed */ }
}

export class BlgColumnApiWrapper implements AgColumnApi {
  constructor(private page: Page, private gridSelector: string = '[data-testid="blg-grid"]') {}

  async setColumnVisible(key: string, visible: boolean): Promise<void> {
    await this.page.evaluate(({ selector, columnKey, isVisible }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).setColumnVisible(columnKey, isVisible);
      }
    }, { selector: this.gridSelector, columnKey: key, isVisible: visible });
  }

  async setColumnsVisible(keys: string[], visible: boolean): Promise<void> {
    for (const key of keys) {
      await this.setColumnVisible(key, visible);
    }
  }

  async setColumnPinned(key: string, pinned: 'left' | 'right' | null): Promise<void> {
    await this.page.evaluate(({ selector, columnKey, pinnedSide }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).setColumnPinned(columnKey, pinnedSide);
      }
    }, { selector: this.gridSelector, columnKey: key, pinnedSide: pinned });
  }

  async setColumnsPinned(keys: string[], pinned: 'left' | 'right' | null): Promise<void> {
    for (const key of keys) {
      await this.setColumnPinned(key, pinned);
    }
  }

  async setColumnWidth(key: string, newWidth: number): Promise<void> {
    await this.page.evaluate(({ selector, columnKey, width }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).setColumnWidth(columnKey, width);
      }
    }, { selector: this.gridSelector, columnKey: key, width: newWidth });
  }

  async setColumnWidths(columnWidths: { key: string, newWidth: number }[]): Promise<void> {
    for (const { key, newWidth } of columnWidths) {
      await this.setColumnWidth(key, newWidth);
    }
  }

  async moveColumn(fromIndex: number, toIndex: number): Promise<void> {
    await this.page.evaluate(({ selector, from, to }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).moveColumn(from, to);
      }
    }, { selector: this.gridSelector, from: fromIndex, to: toIndex });
  }

  async moveColumns(columnsToMoveKeys: string[], toIndex: number): Promise<void> {
    await this.page.evaluate(({ selector, columnKeys, targetIndex }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).moveColumns(columnKeys, targetIndex);
      }
    }, { selector: this.gridSelector, columnKeys: columnsToMoveKeys, targetIndex: toIndex });
  }

  async moveColumnByIndex(fromIndex: number, toIndex: number): Promise<void> {
    await this.moveColumn(fromIndex, toIndex);
  }

  async getColumnState(): Promise<any[]> {
    return await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      return grid ? (grid as any).getColumnState() : [];
    }, this.gridSelector);
  }

  async setColumnState(columnState: any[]): Promise<boolean> {
    return await this.page.evaluate(({ selector, state }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        return (grid as any).setColumnState(state);
      }
      return false;
    }, { selector: this.gridSelector, state: columnState });
  }

  async resetColumnState(): Promise<void> {
    await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).resetColumnState();
      }
    }, this.gridSelector);
  }

  async autoSizeColumn(key: string): Promise<void> {
    await this.page.evaluate(({ selector, columnKey }) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).autoSizeColumn(columnKey);
      }
    }, { selector: this.gridSelector, columnKey: key });
  }

  async autoSizeColumns(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.autoSizeColumn(key);
    }
  }

  async autoSizeAllColumns(): Promise<void> {
    await this.page.evaluate((selector) => {
      const grid = document.querySelector(selector);
      if (grid) {
        (grid as any).autoSizeAllColumns();
      }
    }, this.gridSelector);
  }

  // Stub implementations for grouping and aggregation methods
  setColumnAggFunc(column: string, aggFunc: string): void { /* Not implemented yet */ }
  setColumnRowGroupIndex(column: string, rowGroupIndex: number): void { /* Not implemented yet */ }
  setColumnPivotIndex(column: string, pivotIndex: number): void { /* Not implemented yet */ }
  addRowGroupColumn(column: string): void { /* Not implemented yet */ }
  addRowGroupColumns(columns: string[]): void { /* Not implemented yet */ }
  removeRowGroupColumn(column: string): void { /* Not implemented yet */ }
  removeRowGroupColumns(columns: string[]): void { /* Not implemented yet */ }
  addValueColumn(column: string): void { /* Not implemented yet */ }
  addValueColumns(columns: string[]): void { /* Not implemented yet */ }
  removeValueColumn(column: string): void { /* Not implemented yet */ }
  removeValueColumns(columns: string[]): void { /* Not implemented yet */ }
  addPivotColumn(column: string): void { /* Not implemented yet */ }
  addPivotColumns(columns: string[]): void { /* Not implemented yet */ }
  removePivotColumn(column: string): void { /* Not implemented yet */ }
  removePivotColumns(columns: string[]): void { /* Not implemented yet */ }
  setPivotMode(pivotMode: boolean): void { /* Not implemented yet */ }
  isPivotMode(): boolean { return false; /* Not implemented yet */ }
  setRowGroupOpened(rowGroup: any, opened: boolean): void { /* Not implemented yet */ }
  getColumnGroup(name: string): any { return null; /* Not implemented yet */ }
  getOriginalColumnGroup(name: string): any { return null; /* Not implemented yet */ }
  getDisplayedColAfter(col: any): any { return null; /* Not implemented yet */ }
  getDisplayedColBefore(col: any): any { return null; /* Not implemented yet */ }
  getColumnGroupState(): any[] { return []; /* Not implemented yet */ }
  setColumnGroupState(stateItems: any[]): void { /* Not implemented yet */ }
  resetColumnGroupState(): void { /* Not implemented yet */ }
}