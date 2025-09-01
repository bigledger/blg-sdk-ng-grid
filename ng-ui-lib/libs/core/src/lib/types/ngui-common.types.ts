/**
 * NgUI Common Types
 * Shared types and interfaces used across all NgUI components
 */

// Base Configuration Interface
export interface NgUiBaseConfig {
  /** Theme configuration */
  theme?: NgUiTheme;
  
  /** Export configuration */
  export?: NgUiExportConfig;
  
  /** Accessibility configuration */
  accessibility?: NgUiA11yConfig;
  
  /** Responsive configuration */
  responsive?: NgUiResponsiveConfig;
  
  /** Localization */
  locale?: string;
  
  /** Debug mode */
  debug?: boolean;
}

// Theme Types
export type NgUiTheme = 'light' | 'dark' | 'auto' | NgUiCustomTheme;

export interface NgUiCustomTheme {
  name: string;
  variables: Record<string, string>;
}

// Export Types
export enum NgUiExportFormat {
  CSV = 'csv',
  Excel = 'excel',
  PDF = 'pdf',
  JSON = 'json',
  PNG = 'png',
  SVG = 'svg'
}

export interface NgUiExportConfig {
  enabled?: boolean;
  formats?: NgUiExportFormat[];
  filename?: string;
  includeHeaders?: boolean;
}

// Accessibility Types
export interface NgUiA11yConfig {
  enabled?: boolean;
  ariaLabel?: string;
  description?: string;
  keyboardNavigation?: boolean;
  highContrast?: boolean;
  announceChanges?: boolean;
}

// Responsive Types
export interface NgUiResponsiveConfig {
  enabled?: boolean;
  breakpoints?: NgUiBreakpoints;
  behavior?: NgUiResponsiveBehavior;
}

export interface NgUiBreakpoints {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export type NgUiResponsiveBehavior = 'hide' | 'stack' | 'scroll' | 'adapt';

// Event Types
export interface NgUiBaseEvent {
  type: string;
  timestamp: number;
  source: string;
  data?: any;
  cancelable: boolean;
  cancelled: boolean;
  propagationStopped: boolean;
}

export type NgUiEventHandler<T extends NgUiBaseEvent> = (event: T) => void;

// Common Data Types
export type NgUiGridData = any[];
export type NgUiChartData = any[];
export type NgUiEditorContent = string;

// Validation Types
export interface NgUiValidationError {
  field: string;
  message: string;
  code: string;
}

export type NgUiValidatorFn = (value: any) => NgUiValidationError[] | null;

// Loading States
export enum NgUiLoadingState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error'
}

// Size Types
export type NgUiSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Position Types
export type NgUiPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

// Direction Types
export type NgUiDirection = 'horizontal' | 'vertical';

// Sort Types
export enum NgUiSortDirection {
  Ascending = 'asc',
  Descending = 'desc'
}

export interface NgUiSortConfig {
  field: string;
  direction: NgUiSortDirection;
  order: number;
}

// Filter Types
export enum NgUiFilterType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Boolean = 'boolean',
  Select = 'select',
  MultiSelect = 'multi-select'
}

export interface NgUiFilterConfig {
  field: string;
  type: NgUiFilterType;
  value: any;
  operator?: NgUiFilterOperator;
}

export type NgUiFilterOperator = 
  | 'equals' 
  | 'contains' 
  | 'starts-with' 
  | 'ends-with'
  | 'greater-than'
  | 'less-than'
  | 'greater-equal'
  | 'less-equal'
  | 'between'
  | 'in'
  | 'not-in';

// Component State Types
export interface NgUiComponentState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  dirty: boolean;
  valid: boolean;
}

// Animation Types
export interface NgUiAnimationConfig {
  enabled?: boolean;
  duration?: number;
  easing?: string;
  delay?: number;
}

// Layout Types
export interface NgUiDimensions {
  width: number;
  height: number;
}

export interface NgUiMargins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface NgUiPadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

// Color Types
export type NgUiColor = string | NgUiColorPalette;

export interface NgUiColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral: string;
}

// Typography Types
export interface NgUiTypography {
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string;
  textAlign?: NgUiTextAlign;
  textTransform?: NgUiTextTransform;
}

export type NgUiTextAlign = 'left' | 'center' | 'right' | 'justify';
export type NgUiTextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

// Selection Types
export enum NgUiSelectionMode {
  None = 'none',
  Single = 'single',
  Multiple = 'multiple'
}

export interface NgUiSelectionConfig {
  mode: NgUiSelectionMode;
  selectOnClick?: boolean;
  showCheckboxes?: boolean;
  preserveSelection?: boolean;
}

// Pagination Types
export interface NgUiPaginationConfig {
  enabled?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

export interface NgUiPaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Search Types
export interface NgUiSearchConfig {
  enabled?: boolean;
  placeholder?: string;
  debounceTime?: number;
  minSearchLength?: number;
  searchFields?: string[];
}

// Utility Types
export type NgUiPartial<T> = Partial<T>;
export type NgUiRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type NgUiOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Function Types
export type NgUiCompareFn<T = any> = (a: T, b: T) => number;
export type NgUiMapperFn<T, U> = (item: T, index: number) => U;
export type NgUiPredicateFn<T> = (item: T, index: number) => boolean;
export type NgUiReducerFn<T, U> = (accumulator: U, current: T, index: number) => U;