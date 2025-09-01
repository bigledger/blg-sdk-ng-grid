/**
 * Interface for table configuration
 */
export interface TableConfig {
  /** Number of rows in the table */
  rows: number;
  /** Number of columns in the table */
  columns: number;
  /** Whether the table has a header row */
  hasHeader?: boolean;
  /** Whether the table has row numbers */
  hasRowNumbers?: boolean;
  /** Default cell width */
  defaultCellWidth?: number | string;
  /** Default cell height */
  defaultCellHeight?: number | string;
  /** Table border style */
  borderStyle?: TableBorderStyle;
  /** Table alignment */
  alignment?: TableAlignment;
  /** Whether the table is responsive */
  responsive?: boolean;
  /** Custom CSS classes */
  cssClass?: string;
}

/**
 * Table border style options
 */
export enum TableBorderStyle {
  NONE = 'none',
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  DOUBLE = 'double'
}

/**
 * Table alignment options
 */
export enum TableAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

/**
 * Interface for individual table cell
 */
export interface TableCell {
  /** Cell content */
  content?: string;
  /** Cell row span */
  rowSpan?: number;
  /** Cell column span */
  colSpan?: number;
  /** Cell background color */
  backgroundColor?: string;
  /** Cell text color */
  textColor?: string;
  /** Cell alignment */
  alignment?: CellAlignment;
  /** Cell border style */
  borderStyle?: CellBorderStyle;
  /** Cell padding */
  padding?: string | number;
  /** Whether cell is header */
  isHeader?: boolean;
  /** Custom CSS classes */
  cssClass?: string;
  /** Cell width */
  width?: number | string;
  /** Cell height */
  height?: number | string;
}

/**
 * Cell alignment options
 */
export enum CellAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify'
}

/**
 * Cell border style configuration
 */
export interface CellBorderStyle {
  top?: BorderProperties;
  right?: BorderProperties;
  bottom?: BorderProperties;
  left?: BorderProperties;
}

/**
 * Border properties
 */
export interface BorderProperties {
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  color?: string;
}

/**
 * Interface for table row
 */
export interface TableRow {
  /** Row cells */
  cells: TableCell[];
  /** Row height */
  height?: number | string;
  /** Row background color */
  backgroundColor?: string;
  /** Whether row is header */
  isHeader?: boolean;
  /** Custom CSS classes */
  cssClass?: string;
}

/**
 * Interface for complete table data structure
 */
export interface TableData {
  /** Table configuration */
  config: TableConfig;
  /** Table rows */
  rows: TableRow[];
  /** Table caption */
  caption?: string;
  /** Table ID */
  id?: string;
}