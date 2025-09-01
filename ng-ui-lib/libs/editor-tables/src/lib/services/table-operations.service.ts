import { Injectable, inject } from '@angular/core';
import { TableData, TableCell, TableRow } from '../interfaces/table-config.interface';
import { 
  TableOperations, 
  CellRange, 
  CopiedData, 
  SortDirection, 
  TableManipulationType,
  UndoRedoOperation 
} from '../interfaces/table-operations.interface';
import { TableStateService } from './table-state.service';

/**
 * Service for table manipulation operations
 */
@Injectable({
  providedIn: 'root'
})
export class TableOperationsService implements TableOperations {
  private readonly tableState = inject(TableStateService);

  /**
   * Insert row at specified index
   */
  insertRow(tableData: TableData, index: number, rowData?: Partial<TableRow>): TableData {
    if (index < 0 || index > tableData.rows.length) {
      throw new Error('Invalid row index');
    }

    const newCells: TableCell[] = [];
    for (let i = 0; i < tableData.config.columns; i++) {
      newCells.push({
        content: '',
        isHeader: false,
        alignment: undefined,
        backgroundColor: undefined,
        textColor: undefined
      });
    }

    const newRow: TableRow = {
      cells: newCells,
      isHeader: false,
      ...rowData
    };

    const updatedRows = [...tableData.rows];
    updatedRows.splice(index, 0, newRow);

    const updatedTableData: TableData = {
      ...tableData,
      rows: updatedRows,
      config: {
        ...tableData.config,
        rows: tableData.config.rows + 1
      }
    };

    // Create undo operation
    const undoOperation: UndoRedoOperation = {
      type: TableManipulationType.INSERT_ROW,
      forward: () => updatedTableData,
      backward: () => this.deleteRow(updatedTableData, index),
      description: `Insert row at position ${index + 1}`,
      timestamp: Date.now()
    };

    this.tableState.addUndoOperation(undoOperation);
    return updatedTableData;
  }

  /**
   * Delete row at specified index
   */
  deleteRow(tableData: TableData, index: number): TableData {
    if (index < 0 || index >= tableData.rows.length) {
      throw new Error('Invalid row index');
    }

    const deletedRow = tableData.rows[index];
    const updatedRows = tableData.rows.filter((_, i) => i !== index);

    const updatedTableData: TableData = {
      ...tableData,
      rows: updatedRows,
      config: {
        ...tableData.config,
        rows: tableData.config.rows - 1
      }
    };

    // Create undo operation
    const undoOperation: UndoRedoOperation = {
      type: TableManipulationType.DELETE_ROW,
      forward: () => updatedTableData,
      backward: () => this.insertRow(updatedTableData, index, deletedRow),
      description: `Delete row at position ${index + 1}`,
      timestamp: Date.now()
    };

    this.tableState.addUndoOperation(undoOperation);
    return updatedTableData;
  }

  /**
   * Insert column at specified index
   */
  insertColumn(tableData: TableData, index: number): TableData {
    if (index < 0 || index > tableData.config.columns) {
      throw new Error('Invalid column index');
    }

    const updatedRows = tableData.rows.map(row => {
      const newCells = [...row.cells];
      newCells.splice(index, 0, {
        content: '',
        isHeader: row.isHeader || false,
        alignment: undefined,
        backgroundColor: undefined,
        textColor: undefined
      });
      return { ...row, cells: newCells };
    });

    const updatedTableData: TableData = {
      ...tableData,
      rows: updatedRows,
      config: {
        ...tableData.config,
        columns: tableData.config.columns + 1
      }
    };

    // Create undo operation
    const undoOperation: UndoRedoOperation = {
      type: TableManipulationType.INSERT_COLUMN,
      forward: () => updatedTableData,
      backward: () => this.deleteColumn(updatedTableData, index),
      description: `Insert column at position ${index + 1}`,
      timestamp: Date.now()
    };

    this.tableState.addUndoOperation(undoOperation);
    return updatedTableData;
  }

  /**
   * Delete column at specified index
   */
  deleteColumn(tableData: TableData, index: number): TableData {
    if (index < 0 || index >= tableData.config.columns) {
      throw new Error('Invalid column index');
    }

    // Store deleted column data for undo
    const deletedCells = tableData.rows.map(row => row.cells[index]);

    const updatedRows = tableData.rows.map(row => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== index)
    }));

    const updatedTableData: TableData = {
      ...tableData,
      rows: updatedRows,
      config: {
        ...tableData.config,
        columns: tableData.config.columns - 1
      }
    };

    // Create undo operation
    const undoOperation: UndoRedoOperation = {
      type: TableManipulationType.DELETE_COLUMN,
      forward: () => updatedTableData,
      backward: () => {
        // Restore deleted column
        const restoredRows = updatedTableData.rows.map((row, rowIndex) => {
          const newCells = [...row.cells];
          newCells.splice(index, 0, deletedCells[rowIndex]);
          return { ...row, cells: newCells };
        });
        return {
          ...updatedTableData,
          rows: restoredRows,
          config: {
            ...updatedTableData.config,
            columns: updatedTableData.config.columns + 1
          }
        };
      },
      description: `Delete column at position ${index + 1}`,
      timestamp: Date.now()
    };

    this.tableState.addUndoOperation(undoOperation);
    return updatedTableData;
  }

  /**
   * Merge selected cells
   */
  mergeCells(tableData: TableData, selection: CellRange): TableData {
    const { startRow, startColumn, endRow, endColumn } = selection;
    
    // Validate selection
    if (startRow === endRow && startColumn === endColumn) {
      return tableData; // Single cell, nothing to merge
    }

    // Calculate merged content
    const mergedContent: string[] = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startColumn; col <= endColumn; col++) {
        const cellContent = tableData.rows[row]?.cells[col]?.content;
        if (cellContent && cellContent.trim()) {
          mergedContent.push(cellContent);
        }
      }
    }

    const updatedRows = [...tableData.rows];
    
    // Update the top-left cell with merged content and span
    updatedRows[startRow] = {
      ...updatedRows[startRow],
      cells: [...updatedRows[startRow].cells]
    };
    
    updatedRows[startRow].cells[startColumn] = {
      ...updatedRows[startRow].cells[startColumn],
      content: mergedContent.join(' '),
      rowSpan: endRow - startRow + 1,
      colSpan: endColumn - startColumn + 1
    };

    // Mark other cells as merged (remove content but keep structure for undo)
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startColumn; col <= endColumn; col++) {
        if (row !== startRow || col !== startColumn) {
          updatedRows[row] = {
            ...updatedRows[row],
            cells: [...updatedRows[row].cells]
          };
          updatedRows[row].cells[col] = {
            ...updatedRows[row].cells[col],
            content: '', // Clear content
            rowSpan: 1,
            colSpan: 1
          };
        }
      }
    }

    const updatedTableData: TableData = {
      ...tableData,
      rows: updatedRows
    };

    // Create undo operation
    const undoOperation: UndoRedoOperation = {
      type: TableManipulationType.MERGE_CELLS,
      forward: () => updatedTableData,
      backward: () => tableData, // Return to original state
      description: `Merge cells (${startRow + 1},${startColumn + 1}) to (${endRow + 1},${endColumn + 1})`,
      timestamp: Date.now()
    };

    this.tableState.addUndoOperation(undoOperation);
    return updatedTableData;
  }

  /**
   * Split merged cell
   */
  splitCell(tableData: TableData, row: number, column: number): TableData {
    const cell = tableData.rows[row]?.cells[column];
    if (!cell || (!cell.rowSpan || cell.rowSpan <= 1) && (!cell.colSpan || cell.colSpan <= 1)) {
      return tableData; // Cell is not merged
    }

    const updatedRows = [...tableData.rows];
    const rowSpan = cell.rowSpan || 1;
    const colSpan = cell.colSpan || 1;

    // Reset the merged cell
    updatedRows[row] = {
      ...updatedRows[row],
      cells: [...updatedRows[row].cells]
    };
    updatedRows[row].cells[column] = {
      ...cell,
      rowSpan: 1,
      colSpan: 1
    };

    // Restore individual cells
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = column; c < column + colSpan; c++) {
        if (r !== row || c !== column) {
          updatedRows[r] = {
            ...updatedRows[r],
            cells: [...updatedRows[r].cells]
          };
          updatedRows[r].cells[c] = {
            ...updatedRows[r].cells[c],
            content: '', // Empty content for split cells
            rowSpan: 1,
            colSpan: 1
          };
        }
      }
    }

    const updatedTableData: TableData = {
      ...tableData,
      rows: updatedRows
    };

    // Create undo operation
    const undoOperation: UndoRedoOperation = {
      type: TableManipulationType.SPLIT_CELL,
      forward: () => updatedTableData,
      backward: () => tableData,
      description: `Split cell at (${row + 1},${column + 1})`,
      timestamp: Date.now()
    };

    this.tableState.addUndoOperation(undoOperation);
    return updatedTableData;
  }

  /**
   * Update cell content
   */
  updateCell(tableData: TableData, row: number, column: number, cellData: Partial<TableCell>): TableData {
    if (!tableData.rows[row]?.cells[column]) {
      return tableData;
    }

    const updatedRows = [...tableData.rows];
    updatedRows[row] = {
      ...updatedRows[row],
      cells: [...updatedRows[row].cells]
    };

    const originalCell = updatedRows[row].cells[column];
    updatedRows[row].cells[column] = {
      ...originalCell,
      ...cellData
    };

    const updatedTableData: TableData = {
      ...tableData,
      rows: updatedRows
    };

    // Create undo operation
    const undoOperation: UndoRedoOperation = {
      type: TableManipulationType.UPDATE_CELL,
      forward: () => updatedTableData,
      backward: () => this.updateCell(updatedTableData, row, column, originalCell),
      description: `Update cell at (${row + 1},${column + 1})`,
      timestamp: Date.now()
    };

    this.tableState.addUndoOperation(undoOperation);
    return updatedTableData;
  }

  /**
   * Clear cell content
   */
  clearCell(tableData: TableData, row: number, column: number): TableData {
    const originalCell = tableData.rows[row]?.cells[column];
    if (!originalCell) {
      return tableData;
    }

    return this.updateCell(tableData, row, column, { content: '' });
  }

  /**
   * Copy cells
   */
  copyCells(tableData: TableData, selection: CellRange): CopiedData {
    const { startRow, startColumn, endRow, endColumn } = selection;
    const cells: TableCell[][] = [];

    for (let row = startRow; row <= endRow; row++) {
      const rowCells: TableCell[] = [];
      for (let col = startColumn; col <= endColumn; col++) {
        const cell = tableData.rows[row]?.cells[col];
        if (cell) {
          rowCells.push({ ...cell }); // Deep copy
        } else {
          rowCells.push({ content: '' }); // Empty cell
        }
      }
      cells.push(rowCells);
    }

    return {
      cells,
      originalRange: selection,
      timestamp: Date.now()
    };
  }

  /**
   * Paste cells
   */
  pasteCells(tableData: TableData, targetRow: number, targetColumn: number, data: CopiedData): TableData {
    const updatedRows = [...tableData.rows];
    
    for (let rowOffset = 0; rowOffset < data.cells.length; rowOffset++) {
      for (let colOffset = 0; colOffset < data.cells[rowOffset].length; colOffset++) {
        const targetR = targetRow + rowOffset;
        const targetC = targetColumn + colOffset;
        
        // Check bounds
        if (targetR < 0 || targetR >= tableData.rows.length || 
            targetC < 0 || targetC >= tableData.config.columns) {
          continue;
        }

        updatedRows[targetR] = {
          ...updatedRows[targetR],
          cells: [...updatedRows[targetR].cells]
        };

        updatedRows[targetR].cells[targetC] = {
          ...updatedRows[targetR].cells[targetC],
          ...data.cells[rowOffset][colOffset]
        };
      }
    }

    const updatedTableData: TableData = {
      ...tableData,
      rows: updatedRows
    };

    // Create undo operation
    const undoOperation: UndoRedoOperation = {
      type: TableManipulationType.PASTE_CELLS,
      forward: () => updatedTableData,
      backward: () => tableData,
      description: `Paste cells at (${targetRow + 1},${targetColumn + 1})`,
      timestamp: Date.now()
    };

    this.tableState.addUndoOperation(undoOperation);
    return updatedTableData;
  }

  /**
   * Sort table by column
   */
  sortByColumn(tableData: TableData, columnIndex: number, direction: SortDirection): TableData {
    if (columnIndex < 0 || columnIndex >= tableData.config.columns || direction === SortDirection.NONE) {
      return tableData;
    }

    const startIndex = tableData.config.hasHeader ? 1 : 0;
    const rowsToSort = tableData.rows.slice(startIndex);
    const headerRows = tableData.rows.slice(0, startIndex);

    const sortedRows = rowsToSort.sort((a, b) => {
      const aValue = a.cells[columnIndex]?.content || '';
      const bValue = b.cells[columnIndex]?.content || '';

      // Try to parse as numbers
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);

      let result = 0;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        result = aNum - bNum;
      } else {
        result = aValue.localeCompare(bValue);
      }

      return direction === SortDirection.DESC ? -result : result;
    });

    const updatedTableData: TableData = {
      ...tableData,
      rows: [...headerRows, ...sortedRows]
    };

    // Create undo operation
    const undoOperation: UndoRedoOperation = {
      type: TableManipulationType.SORT_COLUMN,
      forward: () => updatedTableData,
      backward: () => tableData,
      description: `Sort column ${columnIndex + 1} ${direction}`,
      timestamp: Date.now()
    };

    this.tableState.addUndoOperation(undoOperation);
    return updatedTableData;
  }
}