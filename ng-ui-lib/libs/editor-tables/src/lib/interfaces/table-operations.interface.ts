import { TableData, TableCell, TableRow } from './table-config.interface';

/**
 * Interface for table operations
 */
export interface TableOperations {
  /** Insert row at specified index */
  insertRow(tableData: TableData, index: number, rowData?: Partial<TableRow>): TableData;
  
  /** Delete row at specified index */
  deleteRow(tableData: TableData, index: number): TableData;
  
  /** Insert column at specified index */
  insertColumn(tableData: TableData, index: number): TableData;
  
  /** Delete column at specified index */
  deleteColumn(tableData: TableData, index: number): TableData;
  
  /** Merge selected cells */
  mergeCells(tableData: TableData, selection: CellRange): TableData;
  
  /** Split merged cell */
  splitCell(tableData: TableData, row: number, column: number): TableData;
  
  /** Update cell content */
  updateCell(tableData: TableData, row: number, column: number, cellData: Partial<TableCell>): TableData;
  
  /** Clear cell content */
  clearCell(tableData: TableData, row: number, column: number): TableData;
  
  /** Copy cells */
  copyCells(tableData: TableData, selection: CellRange): CopiedData;
  
  /** Paste cells */
  pasteCells(tableData: TableData, targetRow: number, targetColumn: number, data: CopiedData): TableData;
  
  /** Sort table by column */
  sortByColumn(tableData: TableData, columnIndex: number, direction: SortDirection): TableData;
}

/**
 * Cell range interface
 */
export interface CellRange {
  /** Start row index */
  startRow: number;
  /** Start column index */
  startColumn: number;
  /** End row index */
  endRow: number;
  /** End column index */
  endColumn: number;
}

/**
 * Copied data interface
 */
export interface CopiedData {
  /** Copied cells data */
  cells: TableCell[][];
  /** Original range */
  originalRange: CellRange;
  /** Timestamp */
  timestamp: number;
}

/**
 * Sort direction enum
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
  NONE = 'none'
}

/**
 * Interface for table manipulation events
 */
export interface TableManipulationEvent {
  /** Event type */
  type: TableManipulationType;
  /** Affected area */
  affectedArea: CellRange;
  /** Previous table state */
  previousState: TableData;
  /** New table state */
  newState: TableData;
}

/**
 * Table manipulation types
 */
export enum TableManipulationType {
  INSERT_ROW = 'insert_row',
  DELETE_ROW = 'delete_row',
  INSERT_COLUMN = 'insert_column',
  DELETE_COLUMN = 'delete_column',
  MERGE_CELLS = 'merge_cells',
  SPLIT_CELL = 'split_cell',
  UPDATE_CELL = 'update_cell',
  CLEAR_CELL = 'clear_cell',
  PASTE_CELLS = 'paste_cells',
  SORT_COLUMN = 'sort_column'
}

/**
 * Interface for undo/redo operations
 */
export interface UndoRedoOperation {
  /** Operation type */
  type: TableManipulationType;
  /** Forward operation (do) */
  forward: () => TableData;
  /** Backward operation (undo) */
  backward: () => TableData;
  /** Operation description */
  description: string;
  /** Timestamp */
  timestamp: number;
}