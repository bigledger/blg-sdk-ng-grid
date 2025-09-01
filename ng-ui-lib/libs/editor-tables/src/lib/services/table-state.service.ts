import { Injectable, signal, computed } from '@angular/core';
import { TableData, TableConfig, TableRow, TableCell } from '../interfaces/table-config.interface';
import { TableSelectionState, CellPosition, SelectionMode } from '../interfaces/table-selection.interface';
import { UndoRedoOperation, TableManipulationType } from '../interfaces/table-operations.interface';

/**
 * Service for managing table state using Angular Signals
 */
@Injectable({
  providedIn: 'root'
})
export class TableStateService {
  // Core table state
  private readonly _tableData = signal<TableData | null>(null);
  private readonly _selectionState = signal<TableSelectionState>({
    selectedCells: [],
    activeCell: null,
    selectionMode: SelectionMode.CELL,
    multiSelect: false
  });

  // Undo/Redo state
  private readonly _undoStack = signal<UndoRedoOperation[]>([]);
  private readonly _redoStack = signal<UndoRedoOperation[]>([]);

  // UI state
  private readonly _isEditing = signal<boolean>(false);
  private readonly _editingCell = signal<CellPosition | null>(null);
  private readonly _showTableToolbar = signal<boolean>(false);

  // Public readonly signals
  readonly tableData = this._tableData.asReadonly();
  readonly selectionState = this._selectionState.asReadonly();
  readonly isEditing = this._isEditing.asReadonly();
  readonly editingCell = this._editingCell.asReadonly();
  readonly showTableToolbar = this._showTableToolbar.asReadonly();

  // Computed signals
  readonly hasTable = computed(() => this._tableData() !== null);
  readonly canUndo = computed(() => this._undoStack().length > 0);
  readonly canRedo = computed(() => this._redoStack().length > 0);
  readonly selectedCellsCount = computed(() => {
    const selection = this._selectionState();
    return selection.selectedCells.reduce((count, range) => {
      const rows = Math.abs(range.endRow - range.startRow) + 1;
      const cols = Math.abs(range.endColumn - range.startColumn) + 1;
      return count + (rows * cols);
    }, 0);
  });

  readonly tableStats = computed(() => {
    const table = this._tableData();
    if (!table) return null;
    
    return {
      totalRows: table.rows.length,
      totalColumns: table.config.columns,
      hasHeader: table.config.hasHeader || false,
      cellCount: table.rows.length * table.config.columns
    };
  });

  /**
   * Create a new table
   */
  createTable(config: TableConfig): void {
    const rows: TableRow[] = [];
    
    for (let rowIndex = 0; rowIndex < config.rows; rowIndex++) {
      const cells: TableCell[] = [];
      
      for (let colIndex = 0; colIndex < config.columns; colIndex++) {
        cells.push({
          content: '',
          isHeader: config.hasHeader && rowIndex === 0,
          alignment: undefined,
          backgroundColor: undefined,
          textColor: undefined
        });
      }
      
      rows.push({
        cells,
        isHeader: config.hasHeader && rowIndex === 0
      });
    }

    const tableData: TableData = {
      config,
      rows,
      id: `table_${Date.now()}`
    };

    this._tableData.set(tableData);
    this._clearSelection();
    this._showTableToolbar.set(true);
  }

  /**
   * Update table data
   */
  updateTableData(tableData: TableData): void {
    this._tableData.set(tableData);
  }

  /**
   * Update table configuration
   */
  updateTableConfig(config: Partial<TableConfig>): void {
    const currentTable = this._tableData();
    if (!currentTable) return;

    const updatedTable: TableData = {
      ...currentTable,
      config: { ...currentTable.config, ...config }
    };

    this._tableData.set(updatedTable);
  }

  /**
   * Update cell content
   */
  updateCell(row: number, column: number, cellData: Partial<TableCell>): void {
    const currentTable = this._tableData();
    if (!currentTable || !currentTable.rows[row]?.cells[column]) return;

    const updatedRows = [...currentTable.rows];
    updatedRows[row] = {
      ...updatedRows[row],
      cells: [...updatedRows[row].cells]
    };
    updatedRows[row].cells[column] = {
      ...updatedRows[row].cells[column],
      ...cellData
    };

    const updatedTable: TableData = {
      ...currentTable,
      rows: updatedRows
    };

    this._tableData.set(updatedTable);
  }

  /**
   * Set selection state
   */
  setSelection(selectionState: Partial<TableSelectionState>): void {
    this._selectionState.update(current => ({
      ...current,
      ...selectionState
    }));
  }

  /**
   * Clear selection
   */
  private _clearSelection(): void {
    this._selectionState.set({
      selectedCells: [],
      activeCell: null,
      selectionMode: SelectionMode.CELL,
      multiSelect: false
    });
  }

  /**
   * Start editing cell
   */
  startEditing(row: number, column: number): void {
    this._isEditing.set(true);
    this._editingCell.set({ row, column });
  }

  /**
   * Stop editing
   */
  stopEditing(): void {
    this._isEditing.set(false);
    this._editingCell.set(null);
  }

  /**
   * Toggle table toolbar visibility
   */
  toggleTableToolbar(): void {
    this._showTableToolbar.update(show => !show);
  }

  /**
   * Show table toolbar
   */
  showTableToolbar(): void {
    this._showTableToolbar.set(true);
  }

  /**
   * Hide table toolbar
   */
  hideTableToolbar(): void {
    this._showTableToolbar.set(false);
  }

  /**
   * Add operation to undo stack
   */
  addUndoOperation(operation: UndoRedoOperation): void {
    this._undoStack.update(stack => [...stack, operation]);
    this._redoStack.set([]); // Clear redo stack when new operation is added
  }

  /**
   * Undo last operation
   */
  undo(): void {
    const undoStack = this._undoStack();
    if (undoStack.length === 0) return;

    const operation = undoStack[undoStack.length - 1];
    const newTableData = operation.backward();
    
    this._tableData.set(newTableData);
    this._undoStack.update(stack => stack.slice(0, -1));
    this._redoStack.update(stack => [...stack, operation]);
  }

  /**
   * Redo last undone operation
   */
  redo(): void {
    const redoStack = this._redoStack();
    if (redoStack.length === 0) return;

    const operation = redoStack[redoStack.length - 1];
    const newTableData = operation.forward();
    
    this._tableData.set(newTableData);
    this._redoStack.update(stack => stack.slice(0, -1));
    this._undoStack.update(stack => [...stack, operation]);
  }

  /**
   * Clear table data
   */
  clearTable(): void {
    this._tableData.set(null);
    this._clearSelection();
    this._isEditing.set(false);
    this._editingCell.set(null);
    this._showTableToolbar.set(false);
    this._undoStack.set([]);
    this._redoStack.set([]);
  }

  /**
   * Get cell at position
   */
  getCellAt(row: number, column: number): TableCell | null {
    const table = this._tableData();
    return table?.rows[row]?.cells[column] || null;
  }

  /**
   * Check if cell exists
   */
  cellExists(row: number, column: number): boolean {
    const table = this._tableData();
    if (!table) return false;
    return row >= 0 && row < table.rows.length && 
           column >= 0 && column < table.config.columns;
  }
}