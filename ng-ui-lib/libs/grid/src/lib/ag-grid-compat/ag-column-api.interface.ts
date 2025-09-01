/**
 * ag-Grid ColumnApi compatibility interface
 * Provides ag-Grid compatible column API methods that map to NgUiGrid functionality
 */
export interface AgColumnApi {
  // Column Definitions
  /** Set column definitions */
  setColumnDefs(colDefs: any[], source?: string): void;
  
  /** Get column definitions */
  getColumnDefs(): any[];
  
  /** Get column */
  getColumn(key: string): any | null;
  
  /** Get columns */
  getColumns(): any[];
  
  /** Get all columns */
  getAllColumns(): any[];
  
  /** Get all grid columns */
  getAllGridColumns(): any[];
  
  /** Get displayed left columns */
  getDisplayedLeftColumns(): any[];
  
  /** Get displayed center columns */
  getDisplayedCenterColumns(): any[];
  
  /** Get displayed right columns */
  getDisplayedRightColumns(): any[];
  
  /** Get all displayed columns */
  getAllDisplayedColumns(): any[];
  
  /** Get all displayed virtual columns */
  getAllDisplayedVirtualColumns(): any[];
  
  // Column Visibility
  /** Set column visible */
  setColumnVisible(key: string, visible: boolean): void;
  
  /** Set columns visible */
  setColumnsVisible(keys: string[], visible: boolean): void;
  
  /** Is column visible */
  isColumnVisible(key: string): boolean;
  
  /** Get visible columns */
  getVisibleColumns(): any[];
  
  // Column Width
  /** Set column width */
  setColumnWidth(key: string, newWidth: number, finished?: boolean, source?: string): void;
  
  /** Set column widths */
  setColumnWidths(columnWidths: { key: string; newWidth: number }[], finished?: boolean, source?: string): void;
  
  /** Get column width */
  getColumnWidth(key: string): number;
  
  /** Auto size column */
  autoSizeColumn(key: string, skipHeader?: boolean): void;
  
  /** Auto size columns */
  autoSizeColumns(keys: string[], skipHeader?: boolean): void;
  
  /** Auto size all columns */
  autoSizeAllColumns(skipHeader?: boolean): void;
  
  // Column Pinning
  /** Set column pinned */
  setColumnPinned(key: string, pinned: 'left' | 'right' | boolean | null): void;
  
  /** Set columns pinned */
  setColumnsPinned(keys: string[], pinned: 'left' | 'right' | boolean | null): void;
  
  /** Is column pinned */
  isColumnPinned(key: string): boolean;
  
  /** Get pinned left columns */
  getPinnedLeftColumns(): any[];
  
  /** Get pinned right columns */
  getPinnedRightColumns(): any[];
  
  /** Get left displayed columns */
  getLeftDisplayedColumns(): any[];
  
  /** Get right displayed columns */
  getRightDisplayedColumns(): any[];
  
  // Column Moving
  /** Move column */
  moveColumn(key: string, toIndex: number): void;
  
  /** Move columns */
  moveColumns(keys: string[], toIndex: number): void;
  
  /** Move column by index */
  moveColumnByIndex(fromIndex: number, toIndex: number): void;
  
  /** Get column index */
  getColumnIndex(key: string): number;
  
  // Column Grouping
  /** Set column group opened */
  setColumnGroupOpened(group: any, newValue: boolean): void;
  
  /** Get column group */
  getColumnGroup(name: string, instanceId?: number): any | null;
  
  /** Get provided column group */
  getProvidedColumnGroup(name: string): any | null;
  
  /** Get display name for column */
  getDisplayNameForColumn(column: any, location?: string): string;
  
  /** Get display name for column group */
  getDisplayNameForColumnGroup(columnGroup: any, location?: string): string;
  
  // Row Grouping
  /** Add row group column */
  addRowGroupColumn(key: string): void;
  
  /** Add row group columns */
  addRowGroupColumns(keys: string[]): void;
  
  /** Remove row group column */
  removeRowGroupColumn(key: string): void;
  
  /** Remove row group columns */
  removeRowGroupColumns(keys: string[]): void;
  
  /** Set row group columns */
  setRowGroupColumns(keys: string[]): void;
  
  /** Get row group columns */
  getRowGroupColumns(): any[];
  
  // Value Columns
  /** Add value column */
  addValueColumn(key: string): void;
  
  /** Add value columns */
  addValueColumns(keys: string[]): void;
  
  /** Remove value column */
  removeValueColumn(key: string): void;
  
  /** Remove value columns */
  removeValueColumns(keys: string[]): void;
  
  /** Set value columns */
  setValueColumns(keys: string[]): void;
  
  /** Get value columns */
  getValueColumns(): any[];
  
  // Pivot Columns
  /** Add pivot column */
  addPivotColumn(key: string): void;
  
  /** Add pivot columns */
  addPivotColumns(keys: string[]): void;
  
  /** Remove pivot column */
  removePivotColumn(key: string): void;
  
  /** Remove pivot columns */
  removePivotColumns(keys: string[]): void;
  
  /** Set pivot columns */
  setPivotColumns(keys: string[]): void;
  
  /** Get pivot columns */
  getPivotColumns(): any[];
  
  /** Is pivot mode */
  isPivotMode(): boolean;
  
  /** Get pivot result columns */
  getPivotResultColumns(): any[];
  
  /** Get pivot result column */
  getPivotResultColumn(pivotKeys: string[], valueColKey: string): any | null;
  
  // Column State
  /** Get column state */
  getColumnState(): ColumnState[];
  
  /** Set column state */
  setColumnState(columnState: ColumnState[]): boolean;
  
  /** Reset column state */
  resetColumnState(): void;
  
  /** Get column group state */
  getColumnGroupState(): { groupId: string; open: boolean }[];
  
  /** Set column group state */
  setColumnGroupState(stateItems: { groupId: string; open: boolean }[]): void;
  
  /** Reset column group state */
  resetColumnGroupState(): void;
  
  // Aggregation
  /** Set func on column */
  setFuncOnColumn(key: string, func: string | null): void;
  
  /** Set func on columns */
  setFuncOnColumns(keys: string[], func: string | null): void;
  
  // Tool Panel
  /** Set columns tool panel */
  setColumnsToolPanel(show: boolean): void;
  
  /** Is columns tool panel showing */
  isColumnsToolPanelShowing(): boolean;
  
  /** Set filters tool panel */
  setFiltersToolPanel(show: boolean): void;
  
  /** Is filters tool panel showing */
  isFiltersToolPanelShowing(): boolean;
  
  // Column Flex
  /** Set column flex */
  setColumnFlex(key: string, flex: number): void;
  
  /** Set columns flex */
  setColumnsFlex(columnFlexes: { key: string; flex: number }[]): void;
  
  // Advanced
  /** Apply column state */
  applyColumnState(params: ApplyColumnStateParams): boolean;
  
  /** Get secondary columns */
  getSecondaryColumns(): any[] | null;
  
  /** Get secondary pivot result columns */
  getSecondaryPivotResultColumns(): any[] | null;
  
  /** Get primary columns */
  getPrimaryColumns(): any[] | null;
  
  /** Get primary and secondary columns */
  getPrimaryAndSecondaryColumns(): any[] | null;
  
  /** Get all primary columns */
  getAllPrimaryColumns(): any[] | null;
  
  /** Get grid column */
  getGridColumn(key: string): any | null;
  
  /** Get grid columns */
  getGridColumns(keys: string[]): any[];
  
  /** Is secondary columns present */
  isSecondaryColumnsPresent(): boolean;
  
  /** Set pivot result columns */
  setPivotResultColumns(colDefs: any[]): void;
  
  /** Set secondary columns */
  setSecondaryColumns(colDefs: any[]): void;
  
  /** Get virtual columns container width */
  getVirtualColumnsContainerWidth(): number;
}

/** Column state interface */
export interface ColumnState {
  /** Column ID */
  colId: string;
  
  /** Column width */
  width?: number;
  
  /** Column flex */
  flex?: number | null;
  
  /** Hidden state */
  hide?: boolean;
  
  /** Pinned state */
  pinned?: 'left' | 'right' | boolean | null;
  
  /** Sort direction */
  sort?: 'asc' | 'desc' | null;
  
  /** Sort index for multi-column sorting */
  sortIndex?: number | null;
  
  /** Aggregation function */
  aggFunc?: string | null;
  
  /** Row group */
  rowGroup?: boolean;
  
  /** Row group index */
  rowGroupIndex?: number | null;
  
  /** Pivot */
  pivot?: boolean;
  
  /** Pivot index */
  pivotIndex?: number | null;
}

/** Apply column state parameters */
export interface ApplyColumnStateParams {
  /** Column state to apply */
  state?: ColumnState[];
  
  /** Apply order */
  applyOrder?: boolean;
  
  /** Default state */
  defaultState?: Partial<ColumnState>;
}

/** Column group state interface */
export interface ColumnGroupState {
  /** Group ID */
  groupId: string;
  
  /** Open state */
  open: boolean;
}