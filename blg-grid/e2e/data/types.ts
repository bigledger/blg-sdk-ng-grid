export interface GridColumn {
  field: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  visible?: boolean;
  pinned?: 'left' | 'right' | null;
}

export interface GridRow {
  id: string | number;
  [key: string]: any;
}

export interface GridDataSet {
  name: string;
  columns: GridColumn[];
  rows: GridRow[];
  totalCount?: number;
  pageSize?: number;
  description: string;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'isEmpty' | 'isNotEmpty';
  value: any;
  logic?: 'and' | 'or';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SelectionConfig {
  mode: 'single' | 'multiple' | 'checkbox';
  selectedIds?: (string | number)[];
}

export interface PerformanceMetrics {
  renderTime: number;
  scrollTime: number;
  sortTime: number;
  filterTime: number;
  memoryUsage: number;
  frameRate: number;
}