import { Signal } from '@angular/core';

export interface DashboardConfig {
  id: string;
  title: string;
  description?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters?: DashboardFilter[];
  permissions?: DashboardPermissions;
  refreshInterval?: number;
  realTimeEnabled?: boolean;
}

export interface DashboardLayout {
  type: 'grid' | 'freeform';
  columns: number;
  rows?: number;
  gap: number;
  breakpoints?: LayoutBreakpoints;
}

export interface LayoutBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  dataSource: DataSourceConfig;
  filters?: string[];
  drillDown?: DrillDownConfig;
  refreshInterval?: number;
}

export type WidgetType = 
  | 'chart' 
  | 'kpi' 
  | 'scorecard' 
  | 'pivot-table' 
  | 'data-table'
  | 'text'
  | 'image'
  | 'iframe';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetConfig {
  [key: string]: any;
  showTitle?: boolean;
  showBorder?: boolean;
  backgroundColor?: string;
  theme?: string;
}

export interface DataSourceConfig {
  id: string;
  type: DataSourceType;
  connection: DataConnectionConfig;
  query: DataQueryConfig;
  caching?: CachingConfig;
}

export type DataSourceType = 
  | 'rest-api' 
  | 'graphql' 
  | 'websocket' 
  | 'csv' 
  | 'excel' 
  | 'database' 
  | 'bigquery'
  | 'static';

export interface DataConnectionConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  authentication?: AuthenticationConfig;
  timeout?: number;
  retries?: number;
}

export interface AuthenticationConfig {
  type: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2';
  credentials?: Record<string, string>;
}

export interface DataQueryConfig {
  query?: string;
  parameters?: Record<string, any>;
  transformations?: DataTransformation[];
  aggregations?: DataAggregation[];
}

export interface DataTransformation {
  type: 'filter' | 'sort' | 'group' | 'calculate' | 'join';
  config: Record<string, any>;
}

export interface DataAggregation {
  field: string;
  operation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  alias?: string;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  strategy: 'memory' | 'local-storage' | 'session-storage';
}

export interface DashboardFilter {
  id: string;
  type: FilterType;
  label: string;
  field: string;
  values?: any[];
  defaultValue?: any;
  required?: boolean;
  multiple?: boolean;
  cascading?: boolean;
  dependencies?: string[];
}

export type FilterType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'date-range' 
  | 'dropdown' 
  | 'multi-select'
  | 'checkbox'
  | 'radio'
  | 'slider';

export interface DashboardPermissions {
  view: string[];
  edit: string[];
  delete: string[];
  export: string[];
}

export interface DrillDownConfig {
  enabled: boolean;
  target: DrillDownTarget;
  parameters?: Record<string, string>;
  breadcrumbs?: boolean;
}

export interface DrillDownTarget {
  type: 'dashboard' | 'widget' | 'url';
  target: string;
}

export interface DashboardState {
  config: DashboardConfig;
  data: Map<string, any>;
  filters: Map<string, any>;
  loading: Set<string>;
  errors: Map<string, Error>;
  lastRefresh: Date;
}

export interface DashboardContext {
  state: Signal<DashboardState>;
  actions: DashboardActions;
}

export interface DashboardActions {
  updateFilter: (filterId: string, value: any) => void;
  refreshWidget: (widgetId: string) => void;
  refreshAll: () => void;
  drillDown: (widgetId: string, params: Record<string, any>) => void;
  drillUp: () => void;
  exportWidget: (widgetId: string, format: ExportFormat) => void;
  exportDashboard: (format: ExportFormat) => void;
  saveBookmark: (name: string) => void;
  loadBookmark: (bookmarkId: string) => void;
}

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'png' | 'svg';