export interface PivotTableConfig {
  id: string;
  title?: string;
  data: PivotDataConfig;
  dimensions: PivotDimensionConfig;
  layout: PivotLayoutConfig;
  formatting: PivotFormattingConfig;
  interactions: PivotInteractionConfig;
  export?: PivotExportConfig;
}

export interface PivotDataConfig {
  source: string;
  fields: PivotField[];
  filters?: PivotFilter[];
  sorting?: PivotSort[];
  limit?: number;
}

export interface PivotField {
  name: string;
  type: PivotFieldType;
  dataType: DataType;
  displayName?: string;
  description?: string;
  nullable?: boolean;
  unique?: boolean;
}

export type PivotFieldType = 'dimension' | 'measure' | 'calculated';

export type DataType = 
  | 'string' 
  | 'number' 
  | 'integer'
  | 'decimal'
  | 'boolean' 
  | 'date' 
  | 'datetime'
  | 'time'
  | 'currency';

export interface PivotFilter {
  field: string;
  operator: PivotFilterOperator;
  value: any;
  values?: any[];
}

export type PivotFilterOperator = 
  | 'equals'
  | 'not-equals'
  | 'contains'
  | 'not-contains'
  | 'starts-with'
  | 'ends-with'
  | 'greater-than'
  | 'less-than'
  | 'greater-equal'
  | 'less-equal'
  | 'between'
  | 'in'
  | 'not-in'
  | 'is-null'
  | 'is-not-null';

export interface PivotSort {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface PivotDimensionConfig {
  rows: PivotDimension[];
  columns: PivotDimension[];
  measures: PivotMeasure[];
  filters: PivotDimension[];
}

export interface PivotDimension {
  field: string;
  displayName?: string;
  sort?: PivotSort;
  filter?: PivotFilter;
  grouping?: PivotGrouping;
  formatting?: FieldFormatting;
}

export interface PivotGrouping {
  type: PivotGroupingType;
  config?: Record<string, any>;
}

export type PivotGroupingType = 
  | 'none'
  | 'date-year'
  | 'date-quarter'
  | 'date-month'
  | 'date-week'
  | 'date-day'
  | 'number-range'
  | 'custom';

export interface PivotMeasure {
  field: string;
  aggregation: PivotAggregation;
  displayName?: string;
  calculation?: PivotCalculation;
  formatting?: FieldFormatting;
  showAs?: ShowAsConfig;
}

export interface PivotAggregation {
  type: PivotAggregationType;
  distinct?: boolean;
}

export type PivotAggregationType = 
  | 'sum'
  | 'avg'
  | 'count'
  | 'count-distinct'
  | 'min'
  | 'max'
  | 'median'
  | 'mode'
  | 'stddev'
  | 'variance'
  | 'first'
  | 'last';

export interface PivotCalculation {
  type: 'custom';
  formula: string;
  variables: Record<string, string>;
}

export interface ShowAsConfig {
  type: ShowAsType;
  baseField?: string;
  baseItem?: string;
}

export type ShowAsType = 
  | 'no-calculation'
  | 'percent-of-total'
  | 'percent-of-column'
  | 'percent-of-row'
  | 'percent-of-parent'
  | 'difference-from'
  | 'percent-difference-from'
  | 'running-total'
  | 'percent-running-total'
  | 'rank'
  | 'index';

export interface FieldFormatting {
  type: FormattingType;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  currency?: string;
  locale?: string;
  color?: ConditionalFormatting[];
}

export type FormattingType = 
  | 'auto'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'scientific'
  | 'date'
  | 'time'
  | 'datetime'
  | 'text'
  | 'custom';

export interface ConditionalFormatting {
  condition: ConditionalFormattingCondition;
  style: ConditionalFormattingStyle;
}

export interface ConditionalFormattingCondition {
  type: 'value' | 'formula' | 'top' | 'bottom' | 'above-average' | 'below-average';
  operator?: 'equals' | 'not-equals' | 'greater' | 'less' | 'between' | 'contains';
  value?: any;
  value2?: any;
  percentage?: number;
}

export interface ConditionalFormattingStyle {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  icon?: string;
  dataBar?: DataBarStyle;
  colorScale?: ColorScaleStyle;
}

export interface DataBarStyle {
  enabled: boolean;
  color: string;
  showValue: boolean;
  axis: 'automatic' | 'midpoint' | 'none';
}

export interface ColorScaleStyle {
  enabled: boolean;
  type: '2-color' | '3-color';
  minColor: string;
  maxColor: string;
  midColor?: string;
}

export interface PivotLayoutConfig {
  showRowHeaders: boolean;
  showColumnHeaders: boolean;
  showGrandTotals: boolean;
  showSubTotals: boolean;
  compactLayout: boolean;
  emptyRows: 'show' | 'hide' | 'collapse';
  emptyColumns: 'show' | 'hide' | 'collapse';
  expandAll?: boolean;
  maxRows?: number;
  maxColumns?: number;
}

export interface PivotFormattingConfig {
  theme: string;
  alternateRowColors: boolean;
  alternateColumnColors: boolean;
  gridLines: GridLineConfig;
  borders: BorderConfig;
  fonts: FontConfig;
  spacing: SpacingConfig;
}

export interface GridLineConfig {
  show: boolean;
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface BorderConfig {
  outer: BorderStyle;
  inner: BorderStyle;
  headers: BorderStyle;
}

export interface BorderStyle {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface FontConfig {
  family: string;
  size: number;
  headerSize?: number;
  totalSize?: number;
}

export interface SpacingConfig {
  cellPadding: number;
  rowHeight: number;
  columnWidth: number;
  headerHeight?: number;
}

export interface PivotInteractionConfig {
  sorting: boolean;
  filtering: boolean;
  drilling: boolean;
  resizing: boolean;
  reordering: boolean;
  contextMenu: boolean;
  selection: PivotSelectionConfig;
  export: boolean;
}

export interface PivotSelectionConfig {
  mode: 'none' | 'single' | 'multiple' | 'range';
  highlight: boolean;
  copyPaste: boolean;
}

export interface PivotExportConfig {
  formats: PivotExportFormat[];
  includeFormatting: boolean;
  includeFilters: boolean;
  maxRows?: number;
  filename?: string;
}

export type PivotExportFormat = 'excel' | 'csv' | 'pdf' | 'json' | 'xml';

export interface PivotTableData {
  headers: PivotHeader[];
  rows: PivotRow[];
  totals?: PivotTotals;
  metadata: PivotMetadata;
}

export interface PivotHeader {
  level: number;
  text: string;
  field?: string;
  colspan: number;
  rowspan: number;
  type: 'dimension' | 'measure' | 'total';
}

export interface PivotRow {
  level: number;
  headers: PivotCell[];
  data: PivotCell[];
  type: 'data' | 'subtotal' | 'grandtotal';
}

export interface PivotCell {
  value: any;
  formattedValue: string;
  field?: string;
  type: 'dimension' | 'measure' | 'total';
  style?: CellStyle;
  metadata?: CellMetadata;
}

export interface CellStyle {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface CellMetadata {
  original: any;
  aggregated?: boolean;
  calculated?: boolean;
  filtered?: boolean;
  drillable?: boolean;
}

export interface PivotTotals {
  rowTotals: PivotCell[];
  columnTotals: PivotCell[];
  grandTotal: PivotCell;
}

export interface PivotMetadata {
  totalRows: number;
  totalColumns: number;
  dataRows: number;
  generatedAt: Date;
  queryTime: number;
}