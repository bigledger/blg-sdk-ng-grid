/**
 * Interface for table cell selection
 */
export interface CellSelection {
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
 * Interface for table selection state
 */
export interface TableSelectionState {
  /** Currently selected cells */
  selectedCells: CellSelection[];
  /** Active cell (for keyboard navigation) */
  activeCell: CellPosition | null;
  /** Selection mode */
  selectionMode: SelectionMode;
  /** Whether multi-select is enabled */
  multiSelect: boolean;
}

/**
 * Cell position interface
 */
export interface CellPosition {
  /** Row index */
  row: number;
  /** Column index */
  column: number;
}

/**
 * Selection mode options
 */
export enum SelectionMode {
  CELL = 'cell',
  ROW = 'row',
  COLUMN = 'column',
  TABLE = 'table'
}

/**
 * Interface for selection events
 */
export interface SelectionChangeEvent {
  /** Previous selection state */
  previousSelection: TableSelectionState;
  /** New selection state */
  currentSelection: TableSelectionState;
  /** Event source */
  source: 'mouse' | 'keyboard' | 'api';
}

/**
 * Interface for drag selection
 */
export interface DragSelection {
  /** Whether drag is active */
  isDragging: boolean;
  /** Drag start position */
  startPosition: CellPosition;
  /** Current drag position */
  currentPosition: CellPosition;
  /** Selection rectangle */
  selectionRect: SelectionRect;
}

/**
 * Selection rectangle interface
 */
export interface SelectionRect {
  /** Top position */
  top: number;
  /** Left position */
  left: number;
  /** Width */
  width: number;
  /** Height */
  height: number;
}