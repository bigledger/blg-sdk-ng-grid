export interface GridConfig {
  /**
   * Total number of rows in the grid
   */
  totalRows?: number;
  
  /**
   * Height of each row in pixels
   */
  rowHeight?: number;
  
  /**
   * Enable virtual scrolling for better performance with large datasets
   */
  virtualScrolling?: boolean;
  
  /**
   * Enable sorting
   */
  sortable?: boolean;
  
  /**
   * Enable filtering
   */
  filterable?: boolean;
  
  /**
   * Enable row selection
   */
  selectable?: boolean;
  
  /**
   * Selection mode: single or multiple
   */
  selectionMode?: 'single' | 'multiple';
  
  /**
   * Enable column resizing
   */
  resizable?: boolean;
  
  /**
   * Enable column reordering
   */
  reorderable?: boolean;
  
  /**
   * Grid theme
   */
  theme?: string;
  
  /**
   * Show footer
   */
  showFooter?: boolean;
  
  /**
   * Enable pagination
   */
  pagination?: boolean;
  
  /**
   * Pagination configuration
   */
  paginationConfig?: PaginationConfig;
  
  /**
   * Enable row grouping
   */
  grouping?: boolean;
  
  /**
   * Row grouping configuration
   */
  groupingConfig?: GroupingConfig;
  
  /**
   * Enable data export
   */
  export?: boolean;
  
  /**
   * Export configuration
   */
  exportConfig?: ExportConfig;
}

export interface PaginationConfig {
  /**
   * Current page (0-based)
   */
  currentPage?: number;
  
  /**
   * Number of items per page
   */
  pageSize?: number;
  
  /**
   * Available page size options
   */
  pageSizeOptions?: number[];
  
  /**
   * Total number of items (for server-side pagination)
   */
  totalItems?: number;
  
  /**
   * Pagination mode
   */
  mode?: 'client' | 'server';
  
  /**
   * Show page size selector
   */
  showPageSizeSelector?: boolean;
  
  /**
   * Show page info (e.g., "1-10 of 100")
   */
  showPageInfo?: boolean;
  
  /**
   * Maximum number of page buttons to show
   */
  maxPageButtons?: number;
}

/**
 * Row grouping configuration
 */
export interface GroupingConfig {
  /**
   * Columns to group by
   */
  groupByColumns?: string[];
  
  /**
   * Whether groups are initially expanded
   */
  expandedByDefault?: boolean;
  
  /**
   * Show group counts in header
   */
  showGroupCount?: boolean;
  
  /**
   * Aggregation functions for columns
   */
  aggregations?: { [columnId: string]: ('sum' | 'avg' | 'count' | 'min' | 'max' | 'custom')[] };
  
  /**
   * Custom group header template
   */
  groupHeaderTemplate?: string;
  
  /**
   * Sort groups by column or aggregated values
   */
  groupSorting?: {
    columnId: string;
    direction: 'asc' | 'desc';
    sortByAggregation?: boolean;
    aggregationFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
  }[];
}

/**
 * Export configuration
 */
export interface ExportConfig {
  /**
   * Export formats available
   */
  formats?: ('csv' | 'excel' | 'pdf' | 'google-sheets')[];
  
  /**
   * Default filename for exports
   */
  defaultFilename?: string;
  
  /**
   * Whether to include column headers in export
   */
  includeHeaders?: boolean;
  
  /**
   * Whether to export all data or only visible/filtered data
   */
  dataScope?: 'all' | 'visible' | 'filtered' | 'selected';
  
  /**
   * Default template to use
   */
  defaultTemplate?: string;
  
  /**
   * Show advanced export options
   */
  showAdvancedOptions?: boolean;
  
  /**
   * Enable template selection
   */
  enableTemplates?: boolean;
  
  /**
   * CSV specific options
   */
  csvOptions?: {
    delimiter?: string;
    qualifier?: string;
    lineEnding?: '\n' | '\r\n';
    includeBom?: boolean;
  };
  
  /**
   * Excel specific options
   */
  excelOptions?: {
    sheetName?: string;
    autoSizeColumns?: boolean;
    applyBasicStyling?: boolean;
    multipleSheets?: {
      enabled: boolean;
      groupByColumn?: string;
      sheetNameTemplate?: string;
    };
  };
  
  /**
   * PDF specific options
   */
  pdfOptions?: {
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'A4' | 'A3' | 'letter' | 'legal';
    title?: string;
    author?: string;
    includeMetadata?: boolean;
    fontSize?: number;
    headerFontSize?: number;
    includePageNumbers?: boolean;
    includeExportDate?: boolean;
    includeFiltersInfo?: boolean;
    tableStyle?: {
      headerBackgroundColor?: string;
      headerTextColor?: string;
      alternateRowColor?: string;
      borderColor?: string;
      showGridLines?: boolean;
    };
    maxRowsPerPage?: number;
    customHeader?: string;
    customFooter?: string;
  };
  
  /**
   * Google Sheets specific options
   */
  googleSheetsOptions?: {
    title?: string;
    sheetName?: string;
    shareSettings?: {
      shareType?: 'private' | 'public' | 'domain' | 'specific';
      permissions?: 'view' | 'comment' | 'edit';
      emails?: string[];
      domain?: string;
    };
    createNew?: boolean;
    enableCollaboration?: boolean;
    freezeHeaders?: boolean;
    addFilters?: boolean;
    includeCharts?: {
      enabled?: boolean;
      chartTypes?: ('column' | 'line' | 'pie' | 'bar')[];
      dataColumns?: string[];
    };
  };
  
  /**
   * Advanced export options
   */
  advancedOptions?: {
    selectedRowsOnly?: boolean;
    preserveStyling?: boolean;
    includeMergedCells?: boolean;
    includeHierarchy?: boolean;
    batchSize?: number;
  };
  
  /**
   * Custom export handlers
   */
  customHandlers?: {
    [format: string]: (data: any[], columns: any[], options: any) => Promise<void>;
  };
  
  /**
   * Export permissions
   */
  permissions?: {
    allowExport?: boolean;
    allowedFormats?: string[];
    allowedScopes?: ('all' | 'visible' | 'filtered' | 'selected')[];
    maxRows?: number;
  };
}