/**
 * ag-Grid Events compatibility interface
 * Maps ag-Grid events to NgUiGrid event system
 */

/** Base ag-Grid event */
export interface AgGridEvent {
  /** Event type */
  type: string;
  
  /** Grid API */
  api: any;
  
  /** Column API */
  columnApi: any;
  
  /** Context */
  context?: any;
}

// Grid Events
export interface GridReadyEvent extends AgGridEvent {
  type: 'gridReady';
}

export interface GridSizeChangedEvent extends AgGridEvent {
  type: 'gridSizeChanged';
  clientWidth: number;
  clientHeight: number;
}

export interface GridColumnsChangedEvent extends AgGridEvent {
  type: 'gridColumnsChanged';
  source: string;
}

export interface GridPreDestroyEvent extends AgGridEvent {
  type: 'gridPreDestroy';
}

// Column Events
export interface ColumnEvent extends AgGridEvent {
  column?: any;
  columns?: any[];
  source: string;
}

export interface ColumnVisibleEvent extends ColumnEvent {
  type: 'columnVisible';
  visible: boolean;
}

export interface ColumnPinnedEvent extends ColumnEvent {
  type: 'columnPinned';
  pinned: 'left' | 'right' | null;
}

export interface ColumnResizedEvent extends ColumnEvent {
  type: 'columnResized';
  finished: boolean;
}

export interface ColumnMovedEvent extends ColumnEvent {
  type: 'columnMoved';
  toIndex: number;
}

export interface ColumnValueChangedEvent extends ColumnEvent {
  type: 'columnValueChanged';
}

export interface ColumnPivotModeChangedEvent extends AgGridEvent {
  type: 'columnPivotModeChanged';
}

export interface ColumnRowGroupChangedEvent extends AgGridEvent {
  type: 'columnRowGroupChanged';
  columns: any[];
  source: string;
}

export interface ColumnPivotChangedEvent extends AgGridEvent {
  type: 'columnPivotChanged';
  columns: any[];
  source: string;
}

export interface GridColumnsChangedEvent extends AgGridEvent {
  type: 'gridColumnsChanged';
  source: string;
}

export interface DisplayedColumnsChangedEvent extends AgGridEvent {
  type: 'displayedColumnsChanged';
}

export interface VirtualColumnsChangedEvent extends AgGridEvent {
  type: 'virtualColumnsChanged';
}

export interface ColumnGroupOpenedEvent extends AgGridEvent {
  type: 'columnGroupOpened';
  columnGroup: any;
}

export interface NewColumnsLoadedEvent extends AgGridEvent {
  type: 'newColumnsLoaded';
}

// Row Events
export interface RowEvent extends AgGridEvent {
  node: any;
  data: any;
  rowIndex: number;
  rowPinned?: 'top' | 'bottom' | null;
  context?: any;
  event?: Event;
}

export interface RowClickedEvent extends RowEvent {
  type: 'rowClicked';
}

export interface RowDoubleClickedEvent extends RowEvent {
  type: 'rowDoubleClicked';
}

export interface RowSelectedEvent extends RowEvent {
  type: 'rowSelected';
}

export interface SelectionChangedEvent extends AgGridEvent {
  type: 'selectionChanged';
}

export interface RowValueChangedEvent extends RowEvent {
  type: 'rowValueChanged';
}

export interface RowEditingStartedEvent extends RowEvent {
  type: 'rowEditingStarted';
}

export interface RowEditingStoppedEvent extends RowEvent {
  type: 'rowEditingStopped';
}

export interface RowDataChangedEvent extends AgGridEvent {
  type: 'rowDataChanged';
}

export interface RowDataUpdatedEvent extends AgGridEvent {
  type: 'rowDataUpdated';
}

export interface PinnedRowDataChangedEvent extends AgGridEvent {
  type: 'pinnedRowDataChanged';
}

export interface RangeSelectionChangedEvent extends AgGridEvent {
  type: 'rangeSelectionChanged';
  started: boolean;
  finished: boolean;
}

export interface ChartCreatedEvent extends AgGridEvent {
  type: 'chartCreated';
  chartId: string;
}

export interface ChartRangeSelectionChangedEvent extends AgGridEvent {
  type: 'chartRangeSelectionChanged';
  chartId: string;
  cellRange: any;
}

export interface ChartOptionsChangedEvent extends AgGridEvent {
  type: 'chartOptionsChanged';
  chartId: string;
  chartType: string;
  chartThemeName: string;
  chartOptions: any;
}

export interface ChartDestroyedEvent extends AgGridEvent {
  type: 'chartDestroyed';
  chartId: string;
}

// Cell Events
export interface CellEvent extends AgGridEvent {
  node: any;
  data: any;
  value: any;
  rowIndex: number;
  column: any;
  colDef: any;
  context?: any;
  event?: Event;
  rowPinned?: 'top' | 'bottom' | null;
}

export interface CellClickedEvent extends CellEvent {
  type: 'cellClicked';
}

export interface CellDoubleClickedEvent extends CellEvent {
  type: 'cellDoubleClicked';
}

export interface CellContextMenuEvent extends CellEvent {
  type: 'cellContextMenu';
}

export interface CellValueChangedEvent extends CellEvent {
  type: 'cellValueChanged';
  oldValue: any;
  newValue: any;
}

export interface CellEditingStartedEvent extends CellEvent {
  type: 'cellEditingStarted';
}

export interface CellEditingStoppedEvent extends CellEvent {
  type: 'cellEditingStopped';
}

export interface CellFocusedEvent extends AgGridEvent {
  type: 'cellFocused';
  rowIndex: number;
  column: any;
  rowPinned?: 'top' | 'bottom' | null;
  floating?: string;
  forceBrowserFocus?: boolean;
}

export interface CellMouseOverEvent extends CellEvent {
  type: 'cellMouseOver';
}

export interface CellMouseOutEvent extends CellEvent {
  type: 'cellMouseOut';
}

export interface CellKeyDownEvent extends CellEvent {
  type: 'cellKeyDown';
  event: KeyboardEvent;
}

export interface CellKeyPressEvent extends CellEvent {
  type: 'cellKeyPress';
  event: KeyboardEvent;
}

// Filter Events
export interface FilterEvent extends AgGridEvent {
  column: any;
  colDef: any;
}

export interface FilterChangedEvent extends FilterEvent {
  type: 'filterChanged';
  afterFloatingFilter?: boolean;
  afterDataChange?: boolean;
}

export interface FilterModifiedEvent extends FilterEvent {
  type: 'filterModified';
}

export interface FilterOpenedEvent extends FilterEvent {
  type: 'filterOpened';
  eGui: HTMLElement;
}

export interface SortChangedEvent extends AgGridEvent {
  type: 'sortChanged';
}

// Pagination Events
export interface PaginationChangedEvent extends AgGridEvent {
  type: 'paginationChanged';
  animate?: boolean;
  keepRenderedRows?: boolean;
  newData?: boolean;
  newPage?: boolean;
}

// Model Events
export interface ModelUpdatedEvent extends AgGridEvent {
  type: 'modelUpdated';
  animate?: boolean;
  keepRenderedRows?: boolean;
  newData?: boolean;
  newPage?: boolean;
}

export interface VirtualRowRemovedEvent extends AgGridEvent {
  type: 'virtualRowRemoved';
  rowNode: any;
  rowIndex: number;
}

export interface ViewportChangedEvent extends AgGridEvent {
  type: 'viewportChanged';
  firstRow: number;
  lastRow: number;
}

export interface FirstDataRenderedEvent extends AgGridEvent {
  type: 'firstDataRendered';
  firstColumn?: any;
  firstRow?: number;
}

export interface BodyScrollEvent extends AgGridEvent {
  type: 'bodyScroll';
  direction: 'horizontal' | 'vertical';
  left: number;
  top: number;
}

export interface BodyScrollEndEvent extends AgGridEvent {
  type: 'bodyScrollEnd';
  left: number;
  top: number;
}

export interface HeightScaleChangedEvent extends AgGridEvent {
  type: 'heightScaleChanged';
}

// Drag Events
export interface DragEvent extends AgGridEvent {
  event: MouseEvent;
  node: any;
  nodes: any[];
}

export interface DragStartedEvent extends DragEvent {
  type: 'dragStarted';
}

export interface DragStoppedEvent extends DragEvent {
  type: 'dragStopped';
}

export interface RowDragEnterEvent extends DragEvent {
  type: 'rowDragEnter';
  overIndex: number;
  overNode: any;
}

export interface RowDragMoveEvent extends DragEvent {
  type: 'rowDragMove';
  overIndex: number;
  overNode: any;
}

export interface RowDragLeaveEvent extends DragEvent {
  type: 'rowDragLeave';
  overIndex: number;
  overNode: any;
}

export interface RowDragEndEvent extends DragEvent {
  type: 'rowDragEnd';
  overIndex: number;
  overNode: any;
}

// Tool Panel Events
export interface ToolPanelVisibleChangedEvent extends AgGridEvent {
  type: 'toolPanelVisibleChanged';
  source: string;
}

export interface ToolPanelSizeChangedEvent extends AgGridEvent {
  type: 'toolPanelSizeChanged';
  source: string;
}

// Clipboard Events
export interface CutStartEvent extends AgGridEvent {
  type: 'cutStart';
}

export interface CutEndEvent extends AgGridEvent {
  type: 'cutEnd';
}

export interface PasteStartEvent extends AgGridEvent {
  type: 'pasteStart';
}

export interface PasteEndEvent extends AgGridEvent {
  type: 'pasteEnd';
}

// Component State Events
export interface ComponentStateChangedEvent extends AgGridEvent {
  type: 'componentStateChanged';
}

// Union type for all ag-Grid events
export type AgGridEvents = 
  | GridReadyEvent
  | GridSizeChangedEvent
  | GridColumnsChangedEvent
  | GridPreDestroyEvent
  | ColumnVisibleEvent
  | ColumnPinnedEvent
  | ColumnResizedEvent
  | ColumnMovedEvent
  | ColumnValueChangedEvent
  | ColumnPivotModeChangedEvent
  | ColumnRowGroupChangedEvent
  | ColumnPivotChangedEvent
  | DisplayedColumnsChangedEvent
  | VirtualColumnsChangedEvent
  | ColumnGroupOpenedEvent
  | NewColumnsLoadedEvent
  | RowClickedEvent
  | RowDoubleClickedEvent
  | RowSelectedEvent
  | SelectionChangedEvent
  | RowValueChangedEvent
  | RowEditingStartedEvent
  | RowEditingStoppedEvent
  | RowDataChangedEvent
  | RowDataUpdatedEvent
  | PinnedRowDataChangedEvent
  | RangeSelectionChangedEvent
  | ChartCreatedEvent
  | ChartRangeSelectionChangedEvent
  | ChartOptionsChangedEvent
  | ChartDestroyedEvent
  | CellClickedEvent
  | CellDoubleClickedEvent
  | CellContextMenuEvent
  | CellValueChangedEvent
  | CellEditingStartedEvent
  | CellEditingStoppedEvent
  | CellFocusedEvent
  | CellMouseOverEvent
  | CellMouseOutEvent
  | CellKeyDownEvent
  | CellKeyPressEvent
  | FilterChangedEvent
  | FilterModifiedEvent
  | FilterOpenedEvent
  | SortChangedEvent
  | PaginationChangedEvent
  | ModelUpdatedEvent
  | VirtualRowRemovedEvent
  | ViewportChangedEvent
  | FirstDataRenderedEvent
  | BodyScrollEvent
  | BodyScrollEndEvent
  | HeightScaleChangedEvent
  | DragStartedEvent
  | DragStoppedEvent
  | RowDragEnterEvent
  | RowDragMoveEvent
  | RowDragLeaveEvent
  | RowDragEndEvent
  | ToolPanelVisibleChangedEvent
  | ToolPanelSizeChangedEvent
  | CutStartEvent
  | CutEndEvent
  | PasteStartEvent
  | PasteEndEvent
  | ComponentStateChangedEvent;

/** Event listener function type */
export type AgGridEventListener<T extends AgGridEvent = AgGridEvent> = (event: T) => void;

/** Event type string literals */
export type AgGridEventType = AgGridEvents['type'];