import { Injectable, inject, signal, computed } from '@angular/core';
import {
  CellSelection,
  TableSelectionState,
  CellPosition,
  SelectionMode,
  SelectionChangeEvent,
  DragSelection,
  SelectionRect
} from '../interfaces/table-selection.interface';
import { TableStateService } from './table-state.service';

/**
 * Service for managing table cell selection with mouse and keyboard support
 */
@Injectable({
  providedIn: 'root'
})
export class TableSelectionService {
  private readonly tableState = inject(TableStateService);

  // Selection state signals
  private readonly _selectedCells = signal<CellSelection[]>([]);
  private readonly _activeCell = signal<CellPosition | null>(null);
  private readonly _selectionMode = signal<SelectionMode>(SelectionMode.CELL);
  private readonly _multiSelect = signal<boolean>(false);
  private readonly _dragSelection = signal<DragSelection | null>(null);

  // Keyboard navigation state
  private readonly _isNavigating = signal<boolean>(false);
  private readonly _lastKeyboardDirection = signal<'up' | 'down' | 'left' | 'right' | null>(null);

  // Public readonly signals
  readonly selectedCells = this._selectedCells.asReadonly();
  readonly activeCell = this._activeCell.asReadonly();
  readonly selectionMode = this._selectionMode.asReadonly();
  readonly multiSelect = this._multiSelect.asReadonly();
  readonly dragSelection = this._dragSelection.asReadonly();
  readonly isNavigating = this._isNavigating.asReadonly();

  // Computed signals
  readonly hasSelection = computed(() => 
    this._selectedCells().length > 0 || this._activeCell() !== null
  );

  readonly selectedCellsCount = computed(() => {
    return this._selectedCells().reduce((count, selection) => {
      const rows = Math.abs(selection.endRow - selection.startRow) + 1;
      const cols = Math.abs(selection.endColumn - selection.startColumn) + 1;
      return count + (rows * cols);
    }, 0);
  });

  readonly selectionBounds = computed(() => {
    const selections = this._selectedCells();
    if (selections.length === 0) return null;

    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    selections.forEach(sel => {
      minRow = Math.min(minRow, Math.min(sel.startRow, sel.endRow));
      maxRow = Math.max(maxRow, Math.max(sel.startRow, sel.endRow));
      minCol = Math.min(minCol, Math.min(sel.startColumn, sel.endColumn));
      maxCol = Math.max(maxCol, Math.max(sel.startColumn, sel.endColumn));
    });

    return {
      startRow: minRow,
      endRow: maxRow,
      startColumn: minCol,
      endColumn: maxCol
    };
  });

  /**
   * Select a single cell
   */
  selectCell(row: number, column: number, extend = false): void {
    if (!this.tableState.cellExists(row, column)) return;

    const previousSelection = this.getCurrentSelectionState();

    if (extend && this._activeCell()) {
      // Extend selection from active cell to this cell
      const activeCell = this._activeCell()!;
      const selection: CellSelection = {
        startRow: activeCell.row,
        startColumn: activeCell.column,
        endRow: row,
        endColumn: column
      };

      if (this._multiSelect()) {
        this._selectedCells.update(cells => [...cells, selection]);
      } else {
        this._selectedCells.set([selection]);
      }
    } else {
      // Single cell selection
      this._activeCell.set({ row, column });
      if (!extend || !this._multiSelect()) {
        this._selectedCells.set([]);
      }
    }

    this.updateTableStateSelection();
    this.emitSelectionChange(previousSelection, 'mouse');
  }

  /**
   * Select a range of cells
   */
  selectRange(startRow: number, startColumn: number, endRow: number, endColumn: number): void {
    if (!this.tableState.cellExists(startRow, startColumn) || 
        !this.tableState.cellExists(endRow, endColumn)) return;

    const previousSelection = this.getCurrentSelectionState();
    const selection: CellSelection = {
      startRow: Math.min(startRow, endRow),
      startColumn: Math.min(startColumn, endColumn),
      endRow: Math.max(startRow, endRow),
      endColumn: Math.max(startColumn, endColumn)
    };

    if (this._multiSelect()) {
      this._selectedCells.update(cells => [...cells, selection]);
    } else {
      this._selectedCells.set([selection]);
    }

    this._activeCell.set({ row: startRow, column: startColumn });
    this.updateTableStateSelection();
    this.emitSelectionChange(previousSelection, 'mouse');
  }

  /**
   * Select entire row
   */
  selectRow(row: number, extend = false): void {
    const tableData = this.tableState.tableData();
    if (!tableData || row < 0 || row >= tableData.rows.length) return;

    const previousSelection = this.getCurrentSelectionState();
    const selection: CellSelection = {
      startRow: row,
      startColumn: 0,
      endRow: row,
      endColumn: tableData.config.columns - 1
    };

    this._selectionMode.set(SelectionMode.ROW);

    if (extend && this._multiSelect()) {
      this._selectedCells.update(cells => [...cells, selection]);
    } else {
      this._selectedCells.set([selection]);
    }

    this._activeCell.set({ row, column: 0 });
    this.updateTableStateSelection();
    this.emitSelectionChange(previousSelection, 'mouse');
  }

  /**
   * Select entire column
   */
  selectColumn(column: number, extend = false): void {
    const tableData = this.tableState.tableData();
    if (!tableData || column < 0 || column >= tableData.config.columns) return;

    const previousSelection = this.getCurrentSelectionState();
    const selection: CellSelection = {
      startRow: 0,
      startColumn: column,
      endRow: tableData.rows.length - 1,
      endColumn: column
    };

    this._selectionMode.set(SelectionMode.COLUMN);

    if (extend && this._multiSelect()) {
      this._selectedCells.update(cells => [...cells, selection]);
    } else {
      this._selectedCells.set([selection]);
    }

    this._activeCell.set({ row: 0, column });
    this.updateTableStateSelection();
    this.emitSelectionChange(previousSelection, 'mouse');
  }

  /**
   * Select all cells in table
   */
  selectAll(): void {
    const tableData = this.tableState.tableData();
    if (!tableData) return;

    const previousSelection = this.getCurrentSelectionState();
    const selection: CellSelection = {
      startRow: 0,
      startColumn: 0,
      endRow: tableData.rows.length - 1,
      endColumn: tableData.config.columns - 1
    };

    this._selectionMode.set(SelectionMode.TABLE);
    this._selectedCells.set([selection]);
    this._activeCell.set({ row: 0, column: 0 });

    this.updateTableStateSelection();
    this.emitSelectionChange(previousSelection, 'keyboard');
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    const previousSelection = this.getCurrentSelectionState();

    this._selectedCells.set([]);
    this._activeCell.set(null);
    this._selectionMode.set(SelectionMode.CELL);
    this._dragSelection.set(null);

    this.updateTableStateSelection();
    this.emitSelectionChange(previousSelection, 'api');
  }

  /**
   * Start drag selection
   */
  startDragSelection(row: number, column: number): void {
    if (!this.tableState.cellExists(row, column)) return;

    this._dragSelection.set({
      isDragging: true,
      startPosition: { row, column },
      currentPosition: { row, column },
      selectionRect: { top: 0, left: 0, width: 0, height: 0 }
    });
  }

  /**
   * Update drag selection
   */
  updateDragSelection(row: number, column: number, rect: SelectionRect): void {
    const dragSelection = this._dragSelection();
    if (!dragSelection || !dragSelection.isDragging) return;

    this._dragSelection.set({
      ...dragSelection,
      currentPosition: { row, column },
      selectionRect: rect
    });
  }

  /**
   * End drag selection
   */
  endDragSelection(): void {
    const dragSelection = this._dragSelection();
    if (!dragSelection || !dragSelection.isDragging) return;

    // Create selection from drag
    this.selectRange(
      dragSelection.startPosition.row,
      dragSelection.startPosition.column,
      dragSelection.currentPosition.row,
      dragSelection.currentPosition.column
    );

    this._dragSelection.set(null);
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboardNavigation(
    key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
    shiftKey: boolean,
    ctrlKey: boolean
  ): void {
    const activeCell = this._activeCell();
    if (!activeCell) return;

    this._isNavigating.set(true);

    let newRow = activeCell.row;
    let newColumn = activeCell.column;

    switch (key) {
      case 'ArrowUp':
        newRow = Math.max(0, activeCell.row - 1);
        this._lastKeyboardDirection.set('up');
        break;
      case 'ArrowDown':
        const tableData = this.tableState.tableData();
        if (tableData) {
          newRow = Math.min(tableData.rows.length - 1, activeCell.row + 1);
        }
        this._lastKeyboardDirection.set('down');
        break;
      case 'ArrowLeft':
        newColumn = Math.max(0, activeCell.column - 1);
        this._lastKeyboardDirection.set('left');
        break;
      case 'ArrowRight':
        const tableData2 = this.tableState.tableData();
        if (tableData2) {
          newColumn = Math.min(tableData2.config.columns - 1, activeCell.column + 1);
        }
        this._lastKeyboardDirection.set('right');
        break;
    }

    if (shiftKey) {
      // Extend selection
      this.selectCell(newRow, newColumn, true);
    } else {
      // Move selection
      this.selectCell(newRow, newColumn);
    }

    // Clear navigation state after a short delay
    setTimeout(() => this._isNavigating.set(false), 100);
  }

  /**
   * Handle special keyboard shortcuts
   */
  handleKeyboardShortcut(key: string, ctrlKey: boolean, shiftKey: boolean): void {
    switch (key) {
      case 'a':
        if (ctrlKey) {
          this.selectAll();
        }
        break;
      case 'Escape':
        this.clearSelection();
        break;
      case 'Home':
        if (ctrlKey) {
          this.selectCell(0, 0);
        } else {
          const activeCell = this._activeCell();
          if (activeCell) {
            this.selectCell(activeCell.row, 0);
          }
        }
        break;
      case 'End':
        const tableData = this.tableState.tableData();
        if (tableData) {
          if (ctrlKey) {
            this.selectCell(
              tableData.rows.length - 1,
              tableData.config.columns - 1
            );
          } else {
            const activeCell = this._activeCell();
            if (activeCell) {
              this.selectCell(activeCell.row, tableData.config.columns - 1);
            }
          }
        }
        break;
    }
  }

  /**
   * Toggle multi-select mode
   */
  toggleMultiSelect(): void {
    this._multiSelect.update(multi => !multi);
    if (!this._multiSelect()) {
      // Keep only the most recent selection
      const selections = this._selectedCells();
      if (selections.length > 1) {
        this._selectedCells.set([selections[selections.length - 1]]);
      }
    }
  }

  /**
   * Set selection mode
   */
  setSelectionMode(mode: SelectionMode): void {
    this._selectionMode.set(mode);
  }

  /**
   * Check if a cell is selected
   */
  isCellSelected(row: number, column: number): boolean {
    const selections = this._selectedCells();
    return selections.some(selection => 
      row >= Math.min(selection.startRow, selection.endRow) &&
      row <= Math.max(selection.startRow, selection.endRow) &&
      column >= Math.min(selection.startColumn, selection.endColumn) &&
      column <= Math.max(selection.startColumn, selection.endColumn)
    );
  }

  /**
   * Check if a cell is the active cell
   */
  isCellActive(row: number, column: number): boolean {
    const activeCell = this._activeCell();
    return activeCell?.row === row && activeCell?.column === column;
  }

  /**
   * Get current selection state
   */
  private getCurrentSelectionState(): TableSelectionState {
    return {
      selectedCells: [...this._selectedCells()],
      activeCell: this._activeCell(),
      selectionMode: this._selectionMode(),
      multiSelect: this._multiSelect()
    };
  }

  /**
   * Update table state with current selection
   */
  private updateTableStateSelection(): void {
    this.tableState.setSelection({
      selectedCells: this._selectedCells(),
      activeCell: this._activeCell(),
      selectionMode: this._selectionMode(),
      multiSelect: this._multiSelect()
    });
  }

  /**
   * Emit selection change event
   */
  private emitSelectionChange(
    previousSelection: TableSelectionState,
    source: 'mouse' | 'keyboard' | 'api'
  ): void {
    const currentSelection = this.getCurrentSelectionState();
    
    // You could emit this through an event emitter or subject if needed
    // For now, it's handled internally by the table state service
  }

  /**
   * Get selected cell data
   */
  getSelectedCellData(): { row: number; column: number; cell: any }[] {
    const selections = this._selectedCells();
    const result: { row: number; column: number; cell: any }[] = [];

    selections.forEach(selection => {
      for (let row = Math.min(selection.startRow, selection.endRow);
           row <= Math.max(selection.startRow, selection.endRow);
           row++) {
        for (let col = Math.min(selection.startColumn, selection.endColumn);
             col <= Math.max(selection.startColumn, selection.endColumn);
             col++) {
          const cell = this.tableState.getCellAt(row, col);
          if (cell) {
            result.push({ row, column: col, cell });
          }
        }
      }
    });

    return result;
  }

  /**
   * Get selection as range (for copy/paste operations)
   */
  getSelectionRange(): CellSelection | null {
    const selections = this._selectedCells();
    if (selections.length === 0) return null;

    // For simplicity, return the bounds of all selections
    const bounds = this.selectionBounds();
    return bounds ? {
      startRow: bounds.startRow,
      startColumn: bounds.startColumn,
      endRow: bounds.endRow,
      endColumn: bounds.endColumn
    } : null;
  }
}