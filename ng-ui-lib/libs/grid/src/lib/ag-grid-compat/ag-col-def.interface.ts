/**
 * ag-Grid ColDef compatibility interface
 * Maps ag-Grid column definitions to NgUiGrid equivalents
 */
export interface AgColDef {
  // Core Properties
  /** Unique identifier for the column */
  colId?: string;
  
  /** Field name in the row data */
  field?: string;
  
  /** Header name to display */
  headerName?: string;
  
  /** Header tooltip */
  headerTooltip?: string;
  
  /** Header class */
  headerClass?: string | string[] | ((params: any) => string | string[]);
  
  /** Tool panel label for this column */
  headerValueGetter?: string | ((params: any) => string);
  
  // Width Properties
  /** Column width in pixels */
  width?: number;
  
  /** Initial column width */
  initialWidth?: number;
  
  /** Minimum column width */
  minWidth?: number;
  
  /** Maximum column width */
  maxWidth?: number;
  
  /** Flex value for column width */
  flex?: number;
  
  /** Initial flex value */
  initialFlex?: number;
  
  /** Minimum flex value */
  minFlex?: number;
  
  /** Maximum flex value */
  maxFlex?: number;
  
  // Visibility & Interaction
  /** Whether column is visible */
  hide?: boolean;
  
  /** Initial hide state */
  initialHide?: boolean;
  
  /** Whether column can be resized */
  resizable?: boolean;
  
  /** Suppress auto size for this column */
  suppressAutoSize?: boolean;
  
  /** Suppress column move */
  suppressMovable?: boolean;
  
  /** Lock column position */
  lockPosition?: boolean;
  
  /** Lock column visibility */
  lockVisible?: boolean;
  
  // Pinning
  /** Pin column to left or right */
  pinned?: boolean | 'left' | 'right';
  
  /** Initial pinned state */
  initialPinned?: boolean | 'left' | 'right';
  
  /** Lock pinned state */
  lockPinned?: boolean;
  
  // Sorting
  /** Whether column is sortable */
  sortable?: boolean;
  
  /** Initial sort direction */
  sort?: 'asc' | 'desc';
  
  /** Sort order for multi-column sorting */
  sortIndex?: number;
  
  /** Unmanaged sorting */
  unSortIcon?: boolean;
  
  /** Suppress sorting */
  suppressSorting?: boolean;
  
  /** Custom sort comparator */
  comparator?: (valueA: any, valueB: any, nodeA: any, nodeB: any, isDescending: boolean) => number;
  
  // Filtering
  /** Whether column is filterable */
  filter?: boolean | string | any;
  
  /** Filter parameters */
  filterParams?: any;
  
  /** Floating filter */
  floatingFilter?: boolean;
  
  /** Floating filter component */
  floatingFilterComponent?: any;
  
  /** Floating filter component params */
  floatingFilterComponentParams?: any;
  
  /** Suppress filtering */
  suppressFilter?: boolean;
  
  // Cell Rendering
  /** Cell renderer */
  cellRenderer?: string | any;
  
  /** Cell renderer parameters */
  cellRendererParams?: any;
  
  /** Cell renderer selector */
  cellRendererSelector?: (params: any) => any;
  
  /** Auto height for this column's cells */
  autoHeight?: boolean;
  
  /** Wrap text in cells */
  wrapText?: boolean;
  
  /** Wrap header text */
  wrapHeaderText?: boolean;
  
  // Cell Editing
  /** Whether cells are editable */
  editable?: boolean | ((params: any) => boolean);
  
  /** Cell editor */
  cellEditor?: string | any;
  
  /** Cell editor parameters */
  cellEditorParams?: any;
  
  /** Cell editor selector */
  cellEditorSelector?: (params: any) => any;
  
  /** Single click edit */
  singleClickEdit?: boolean;
  
  /** Suppress key board event */
  suppressKeyboardEvent?: (params: any) => boolean;
  
  // Value Processing
  /** Value getter function */
  valueGetter?: string | ((params: any) => any);
  
  /** Value setter function */
  valueSetter?: string | ((params: any) => boolean);
  
  /** Value parser function */
  valueParser?: string | ((params: any) => any);
  
  /** Value formatter function */
  valueFormatter?: string | ((params: any) => string);
  
  /** Reference data for cell editor */
  refData?: { [key: string]: string };
  
  // Key Creation
  /** Key creator for grouping */
  keyCreator?: (params: any) => string;
  
  // Styling
  /** Cell class */
  cellClass?: string | string[] | ((params: any) => string | string[]);
  
  /** Cell style */
  cellStyle?: any | ((params: any) => any);
  
  /** Cell class rules */
  cellClassRules?: { [className: string]: string | ((params: any) => boolean) };
  
  // Grouping
  /** Row group */
  rowGroup?: boolean;
  
  /** Row group index */
  rowGroupIndex?: number;
  
  /** Enable row group */
  enableRowGroup?: boolean;
  
  /** Enable pivot */
  enablePivot?: boolean;
  
  /** Enable value */
  enableValue?: boolean;
  
  /** Pivot */
  pivot?: boolean;
  
  /** Pivot index */
  pivotIndex?: number;
  
  /** Aggregation function */
  aggFunc?: string | ((params: any) => any);
  
  /** Initial aggregation function */
  initialAggFunc?: string | ((params: any) => any);
  
  /** Default aggregation function */
  defaultAggFunc?: string | ((params: any) => any);
  
  /** Allow pivot */
  allowedAggFuncs?: string[];
  
  // Column Grouping
  /** Column group */
  columnGroupShow?: 'open' | 'closed';
  
  // Advanced
  /** Tooltip field */
  tooltipField?: string;
  
  /** Tooltip value getter */
  tooltipValueGetter?: string | ((params: any) => string);
  
  /** Context */
  context?: any;
  
  /** Suppress clipboard */
  suppressClipboard?: boolean;
  
  /** Suppress export */
  suppressExport?: boolean;
  
  /** Suppress paste */
  suppressPaste?: boolean;
  
  /** Suppress navigation */
  suppressNavigable?: boolean;
  
  /** Suppress cell focus */
  suppressCellFocus?: boolean;
  
  /** Tab index */
  tabIndex?: number;
  
  // Tree Data
  /** Show row group */
  showRowGroup?: boolean | string;
  
  /** Row group sort comparator */
  rowGroupSortComparator?: (nodeA: any, nodeB: any) => number;
  
  // Menu
  /** Column menu tabs */
  menuTabs?: string[];
  
  /** Column menu */
  columnMenu?: string[];
  
  /** Main menu items */
  mainMenuItems?: string[];
  
  /** Context menu items */
  contextMenuItems?: string[];
  
  /** Suppress menu */
  suppressMenu?: boolean;
  
  /** Suppress column chooser */
  suppressColumnsToolPanel?: boolean;
  
  /** Suppress filters tool panel */
  suppressFiltersToolPanel?: boolean;
  
  // Accessibility
  /** ARIA label */
  headerCheckboxSelection?: boolean | ((params: any) => boolean);
  
  /** Header checkbox selection filtered only */
  headerCheckboxSelectionFilteredOnly?: boolean;
  
  /** Checkbox selection */
  checkboxSelection?: boolean | ((params: any) => boolean);
  
  /** Show disabled checkboxes */
  showDisabledCheckboxes?: boolean;
  
  // Spanning
  /** Column span */
  colSpan?: (params: any) => number;
  
  /** Row span */
  rowSpan?: (params: any) => number;
  
  // Type
  /** Column type */
  type?: string | string[];
  
  // Custom Properties (for extensibility)
  [key: string]: any;
}

/** Column group definition interface */
export interface AgColumnGroupDef {
  /** Group ID */
  groupId?: string;
  
  /** Header name */
  headerName?: string;
  
  /** Header tooltip */
  headerTooltip?: string;
  
  /** Header class */
  headerClass?: string | string[];
  
  /** Children columns */
  children: (AgColDef | AgColumnGroupDef)[];
  
  /** Open by default */
  openByDefault?: boolean;
  
  /** Marker CSS class */
  markersCssClass?: string;
  
  /** Header group component */
  headerGroupComponent?: any;
  
  /** Header group component params */
  headerGroupComponentParams?: any;
  
  /** Custom properties */
  [key: string]: any;
}

/** Combined column definition type */
export type AgColumnDef = AgColDef | AgColumnGroupDef;