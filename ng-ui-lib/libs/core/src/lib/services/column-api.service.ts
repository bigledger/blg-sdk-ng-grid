import { Injectable, inject } from '@angular/core';
import { ColumnApi, ColumnState } from '../interfaces/ag-grid-compat.interface';
import { GridStateService } from './grid-state.service';
import { ColumnDefinition } from '../interfaces/column-definition.interface';

/**
 * ag-Grid compatible ColumnApi implementation
 */
@Injectable()
export class ColumnApiService implements ColumnApi {
  private gridState = inject(GridStateService);
  
  constructor() {}
  
  /**
   * Set column visible
   */
  setColumnVisible(key: string, visible: boolean): void {
    this.setColumnsVisible([key], visible);
  }
  
  /**
   * Set columns visible
   */
  setColumnsVisible(keys: string[], visible: boolean): void {
    const currentColumns = [...this.gridState.columns()];
    let updated = false;
    
    currentColumns.forEach(column => {
      if (keys.includes(column.id)) {
        column.visible = visible;
        updated = true;
      }
    });
    
    if (updated) {
      this.gridState.updateColumns(currentColumns);
    }
  }
  
  /**
   * Set column width
   */
  setColumnWidth(key: string, newWidth: number): void {
    this.setColumnWidths([{ key, newWidth }]);
  }
  
  /**
   * Set column widths
   */
  setColumnWidths(columnWidths: { key: string; newWidth: number }[]): void {
    const currentColumns = [...this.gridState.columns()];
    let updated = false;
    
    columnWidths.forEach(({ key, newWidth }) => {
      const column = currentColumns.find(col => col.id === key);
      if (column) {
        column.width = Math.max(newWidth, column.minWidth || 50);
        if (column.maxWidth) {
          column.width = Math.min(column.width, column.maxWidth);
        }
        updated = true;
      }
    });
    
    if (updated) {
      this.gridState.updateColumns(currentColumns);
    }
  }
  
  /**
   * Move column to new position
   */
  moveColumn(key: string, toIndex: number): void {
    this.moveColumns([key], toIndex);
  }
  
  /**
   * Move columns to new position
   */
  moveColumns(keys: string[], toIndex: number): void {
    const currentColumns = [...this.gridState.columns()];
    const columnsToMove: ColumnDefinition[] = [];
    const remainingColumns: ColumnDefinition[] = [];
    
    // Separate columns to move from remaining columns
    currentColumns.forEach(column => {
      if (keys.includes(column.id)) {
        columnsToMove.push(column);
      } else {
        remainingColumns.push(column);
      }
    });
    
    // Insert moved columns at target index
    const result = [...remainingColumns];
    result.splice(toIndex, 0, ...columnsToMove);
    
    this.gridState.updateColumns(result);
  }
  
  /**
   * Move column by index
   */
  moveColumnByIndex(fromIndex: number, toIndex: number): void {
    const currentColumns = [...this.gridState.columns()];
    if (fromIndex >= 0 && fromIndex < currentColumns.length && 
        toIndex >= 0 && toIndex < currentColumns.length) {
      const [movedColumn] = currentColumns.splice(fromIndex, 1);
      currentColumns.splice(toIndex, 0, movedColumn);
      this.gridState.updateColumns(currentColumns);
    }
  }
  
  /**
   * Set column pinned position
   */
  setColumnPinned(key: string, pinned: string | null): void {
    this.setColumnsPinned([key], pinned);
  }
  
  /**
   * Set columns pinned position
   */
  setColumnsPinned(keys: string[], pinned: string | null): void {
    const currentColumns = [...this.gridState.columns()];
    let updated = false;
    
    currentColumns.forEach(column => {
      if (keys.includes(column.id)) {
        column.pinned = pinned === 'left' || pinned === 'right' ? pinned : undefined;
        updated = true;
      }
    });
    
    if (updated) {
      this.gridState.updateColumns(currentColumns);
    }
  }
  
  /**
   * Get all columns
   */
  getAllColumns(): any[] {
    return this.gridState.columns().map(col => this.columnToAgColumn(col));
  }
  
  /**
   * Get all grid columns (same as getAllColumns for this implementation)
   */
  getAllGridColumns(): any[] {
    return this.getAllColumns();
  }
  
  /**
   * Get displayed left columns (pinned left)
   */
  getDisplayedLeftColumns(): any[] {
    return this.gridState.columns()
      .filter(col => col.pinned === 'left' && col.visible !== false)
      .map(col => this.columnToAgColumn(col));
  }
  
  /**
   * Get displayed center columns (not pinned)
   */
  getDisplayedCenterColumns(): any[] {
    return this.gridState.columns()
      .filter(col => !col.pinned && col.visible !== false)
      .map(col => this.columnToAgColumn(col));
  }
  
  /**
   * Get displayed right columns (pinned right)
   */
  getDisplayedRightColumns(): any[] {
    return this.gridState.columns()
      .filter(col => col.pinned === 'right' && col.visible !== false)
      .map(col => this.columnToAgColumn(col));
  }
  
  /**
   * Get all displayed columns
   */
  getAllDisplayedColumns(): any[] {
    return this.gridState.columns()
      .filter(col => col.visible !== false)
      .map(col => this.columnToAgColumn(col));
  }
  
  /**
   * Get all displayed virtual columns (same as displayed for this implementation)
   */
  getAllDisplayedVirtualColumns(): any[] {
    return this.getAllDisplayedColumns();
  }
  
  /**
   * Get column by key
   */
  getColumn(key: string): any {
    const column = this.gridState.columns().find(col => col.id === key);
    return column ? this.columnToAgColumn(column) : null;
  }
  
  /**
   * Get columns by keys
   */
  getColumns(keys: string[]): any[] {
    return keys.map(key => this.getColumn(key)).filter(col => col !== null);
  }
  
  /**
   * Get primary columns (all columns in this implementation)
   */
  getPrimaryColumns(): any[] {
    return this.getAllColumns();
  }
  
  /**
   * Get secondary columns (empty for this implementation)
   */
  getSecondaryColumns(): any[] {
    return [];
  }
  
  /**
   * Set secondary columns (not supported in this implementation)
   */
  setSecondaryColumns(colDefs: any[]): void {
    console.log('setSecondaryColumns not supported:', colDefs);
  }
  
  /**
   * Get primary column tree (flat structure for this implementation)
   */
  getPrimaryColumnTree(): any[] {
    return this.getAllColumns();
  }
  
  /**
   * Get secondary column tree (empty for this implementation)
   */
  getSecondaryColumnTree(): any[] {
    return [];
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
   * Reset column state to defaults
   */
  resetColumnState(): void {
    this.gridState.resetColumns();
  }
  
  /**
   * Get column group state (empty for this implementation)
   */
  getColumnGroupState(): any[] {
    return [];
  }
  
  /**
   * Set column group state (not supported)
   */
  setColumnGroupState(stateItems: any[]): void {
    console.log('setColumnGroupState not supported:', stateItems);
  }
  
  /**
   * Reset column group state (not supported)
   */
  resetColumnGroupState(): void {
    console.log('resetColumnGroupState not supported');
  }
  
  /**
   * Auto size column based on content
   */
  autoSizeColumn(key: string, skipHeader?: boolean): void {
    this.autoSizeColumns([key], skipHeader);
  }
  
  /**
   * Auto size columns based on content
   */
  autoSizeColumns(keys: string[], skipHeader?: boolean): void {
    // Implementation would need to measure content
    // For now, just log the action
    console.log('autoSizeColumns called for keys:', keys, 'skipHeader:', skipHeader);
    
    // Could implement basic auto-sizing logic here
    keys.forEach(key => {
      const column = this.gridState.columns().find(col => col.id === key);
      if (column) {
        // Simple heuristic - could be more sophisticated
        const estimatedWidth = Math.max(
          skipHeader ? 0 : (column.header.length * 8 + 20),
          100 // minimum width
        );
        this.setColumnWidth(key, estimatedWidth);
      }
    });
  }
  
  /**
   * Auto size all columns
   */
  autoSizeAllColumns(skipHeader?: boolean): void {
    const keys = this.gridState.columns().map(col => col.id);
    this.autoSizeColumns(keys, skipHeader);
  }
  
  /**
   * Check if column is pinned
   */
  isPinned(key: string): boolean {
    const column = this.gridState.columns().find(col => col.id === key);
    return column ? !!column.pinned : false;
  }
  
  /**
   * Check if column is pinned left
   */
  isPinnedLeft(key: string): boolean {
    const column = this.gridState.columns().find(col => col.id === key);
    return column ? column.pinned === 'left' : false;
  }
  
  /**
   * Check if column is pinned right
   */
  isPinnedRight(key: string): boolean {
    const column = this.gridState.columns().find(col => col.id === key);
    return column ? column.pinned === 'right' : false;
  }
  
  /**
   * Get displayed column after the specified column
   */
  getDisplayedColAfter(col: any): any {
    const columns = this.getAllDisplayedColumns();
    const index = columns.findIndex(c => c.colId === col.colId);
    return index >= 0 && index < columns.length - 1 ? columns[index + 1] : null;
  }
  
  /**
   * Get displayed column before the specified column
   */
  getDisplayedColBefore(col: any): any {
    const columns = this.getAllDisplayedColumns();
    const index = columns.findIndex(c => c.colId === col.colId);
    return index > 0 ? columns[index - 1] : null;
  }
  
  /**
   * Set column group opened (not supported in this implementation)
   */
  setColumnGroupOpened(group: any, newValue: boolean): void {
    console.log('setColumnGroupOpened not supported:', group, newValue);
  }
  
  /**
   * Get column group (not supported in this implementation)
   */
  getColumnGroup(name: string, instanceId?: number): any {
    console.log('getColumnGroup not supported:', name, instanceId);
    return null;
  }
  
  /**
   * Get original column group (not supported in this implementation)
   */
  getOriginalColumnGroup(name: string): any {
    console.log('getOriginalColumnGroup not supported:', name);
    return null;
  }
  
  /**
   * Get displayed left columns for row (same as getDisplayedLeftColumns)
   */
  getDisplayedLeftColumnsForRow(rowNode: any): any[] {
    return this.getDisplayedLeftColumns();
  }
  
  /**
   * Get displayed center columns for row (same as getDisplayedCenterColumns)
   */
  getDisplayedCenterColumnsForRow(rowNode: any): any[] {
    return this.getDisplayedCenterColumns();
  }
  
  /**
   * Get displayed right columns for row (same as getDisplayedRightColumns)
   */
  getDisplayedRightColumnsForRow(rowNode: any): any[] {
    return this.getDisplayedRightColumns();
  }
  
  /**
   * Convert internal ColumnDefinition to ag-Grid column format
   */
  private columnToAgColumn(column: ColumnDefinition): any {
    return {
      colId: column.id,
      colDef: {
        field: column.field,
        headerName: column.header,
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
        sortable: column.sortable,
        filter: column.filterable,
        resizable: column.resizable,
        hide: column.visible === false,
        pinned: column.pinned,
        type: column.type,
        cellRenderer: column.cellRenderer,
        cellEditor: column.cellEditor,
        editable: column.cellEditor !== false
      },
      getActualWidth: () => column.width || 150,
      isVisible: () => column.visible !== false,
      getSort: () => {
        const sorts = this.gridState.sortState() || [];
        const sort = sorts.find(s => s.columnId === column.id);
        return sort?.direction || null;
      },
      isSortable: () => column.sortable !== false,
      getMinWidth: () => column.minWidth || 50,
      getMaxWidth: () => column.maxWidth,
      isResizable: () => column.resizable !== false,
      isFilterable: () => column.filterable !== false,
      isPinned: () => column.pinned || null,
      isPinnedLeft: () => column.pinned === 'left',
      isPinnedRight: () => column.pinned === 'right'
    };
  }
}