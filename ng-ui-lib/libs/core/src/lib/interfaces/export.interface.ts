/**
 * Export data structure
 */
export interface ExportData {
  /**
   * Headers for the export
   */
  headers: string[];
  
  /**
   * Row data for export
   */
  rows: any[][];
  
  /**
   * Column information
   */
  columns: ExportColumn[];
  
  /**
   * Metadata about the export
   */
  metadata: ExportMetadata;
}

/**
 * Column information for export
 */
export interface ExportColumn {
  /**
   * Column ID
   */
  id: string;
  
  /**
   * Header text
   */
  header: string;
  
  /**
   * Field name in data
   */
  field: string;
  
  /**
   * Data type
   */
  type: string;
  
  /**
   * Width for Excel export
   */
  width?: number;
}

/**
 * Export metadata
 */
export interface ExportMetadata {
  /**
   * Export timestamp
   */
  exportDate: Date;
  
  /**
   * Total number of rows exported
   */
  totalRows: number;
  
  /**
   * Export format
   */
  format: ExportFormat;
  
  /**
   * Filename used for export
   */
  filename: string;
  
  /**
   * Whether grouping was applied
   */
  hasGrouping: boolean;
  
  /**
   * Filters applied during export
   */
  appliedFilters?: { [columnId: string]: any };
}

/**
 * Export options for different formats
 */
export interface ExportOptions {
  /**
   * Export format
   */
  format: ExportFormat;
  
  /**
   * Filename for the export (without extension)
   */
  filename: string;
  
  /**
   * Whether to include headers
   */
  includeHeaders: boolean;
  
  /**
   * Data scope to export
   */
  dataScope: 'all' | 'visible' | 'filtered' | 'selected';
  
  /**
   * Columns to include in export (if not specified, all visible columns are included)
   */
  includeColumns?: string[];
  
  /**
   * Export template to use
   */
  template?: ExportTemplate;
  
  /**
   * Advanced export options
   */
  advanced?: AdvancedExportOptions;
  
  /**
   * Format-specific options
   */
  formatOptions?: CsvExportOptions | ExcelExportOptions | PdfExportOptions | GoogleSheetsOptions;
}

/**
 * CSV export options
 */
export interface CsvExportOptions {
  /**
   * Field delimiter
   */
  delimiter: string;
  
  /**
   * Text qualifier
   */
  qualifier: string;
  
  /**
   * Line ending
   */
  lineEnding: '\n' | '\r\n';
  
  /**
   * Include BOM for UTF-8
   */
  includeBom: boolean;
}

/**
 * Excel export options
 */
export interface ExcelExportOptions {
  /**
   * Worksheet name
   */
  sheetName: string;
  
  /**
   * Whether to auto-size columns
   */
  autoSizeColumns: boolean;
  
  /**
   * Whether to apply basic styling
   */
  applyBasicStyling: boolean;
  
  /**
   * Header row styling
   */
  headerStyle?: ExcelCellStyle;
  
  /**
   * Data row styling
   */
  dataStyle?: ExcelCellStyle;
  
  /**
   * Multiple sheets configuration
   */
  multipleSheets?: {
    enabled: boolean;
    groupByColumn?: string;
    sheetNameTemplate?: string;
  };
}

/**
 * Excel cell styling options
 */
export interface ExcelCellStyle {
  /**
   * Font configuration
   */
  font?: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    size?: number;
  };
  
  /**
   * Fill configuration
   */
  fill?: {
    fgColor?: string;
    bgColor?: string;
  };
  
  /**
   * Alignment
   */
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'middle' | 'bottom';
  };
  
  /**
   * Border configuration
   */
  border?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    color?: string;
  };
}

/**
 * PDF export options
 */
export interface PdfExportOptions {
  /**
   * Page orientation
   */
  orientation: 'portrait' | 'landscape';
  
  /**
   * Page size
   */
  pageSize: 'A4' | 'A3' | 'letter' | 'legal';
  
  /**
   * Document title
   */
  title?: string;
  
  /**
   * Document author
   */
  author?: string;
  
  /**
   * Include metadata header
   */
  includeMetadata: boolean;
  
  /**
   * Font size for data
   */
  fontSize: number;
  
  /**
   * Font size for headers
   */
  headerFontSize: number;
  
  /**
   * Include page numbers
   */
  includePageNumbers: boolean;
  
  /**
   * Include export date
   */
  includeExportDate: boolean;
  
  /**
   * Include applied filters info
   */
  includeFiltersInfo: boolean;
  
  /**
   * Table styling options
   */
  tableStyle: {
    headerBackgroundColor: string;
    headerTextColor: string;
    alternateRowColor: string;
    borderColor: string;
    showGridLines: boolean;
  };
  
  /**
   * Maximum rows per page (0 for no limit)
   */
  maxRowsPerPage: number;
  
  /**
   * Custom header content
   */
  customHeader?: string;
  
  /**
   * Custom footer content
   */
  customFooter?: string;
}

/**
 * Google Sheets export options
 */
export interface GoogleSheetsOptions {
  /**
   * Spreadsheet title
   */
  title: string;
  
  /**
   * Sheet name
   */
  sheetName: string;
  
  /**
   * Share settings
   */
  shareSettings: {
    shareType: 'private' | 'public' | 'domain' | 'specific';
    permissions: 'view' | 'comment' | 'edit';
    emails?: string[]; // For specific sharing
    domain?: string; // For domain sharing
  };
  
  /**
   * Whether to create new spreadsheet or update existing
   */
  createNew: boolean;
  
  /**
   * Existing spreadsheet ID (if updating)
   */
  spreadsheetId?: string;
  
  /**
   * Enable real-time collaboration features
   */
  enableCollaboration: boolean;
  
  /**
   * Add data validation rules
   */
  dataValidation?: {
    [columnId: string]: {
      type: 'list' | 'number' | 'date' | 'custom';
      values?: any[];
      min?: number;
      max?: number;
      formula?: string;
    };
  };
  
  /**
   * Freeze headers
   */
  freezeHeaders: boolean;
  
  /**
   * Add filters
   */
  addFilters: boolean;
  
  /**
   * Include charts based on data
   */
  includeCharts?: {
    enabled: boolean;
    chartTypes: ('column' | 'line' | 'pie' | 'bar')[];
    dataColumns?: string[];
  };
}

/**
 * Export template configuration
 */
export interface ExportTemplate {
  /**
   * Template ID
   */
  id: string;
  
  /**
   * Template name
   */
  name: string;
  
  /**
   * Template description
   */
  description: string;
  
  /**
   * Supported formats for this template
   */
  supportedFormats: ExportFormat[];
  
  /**
   * Template configuration
   */
  config: {
    /**
     * Header template
     */
    header?: {
      enabled: boolean;
      content: string;
      height?: number;
      style?: any;
    };
    
    /**
     * Footer template
     */
    footer?: {
      enabled: boolean;
      content: string;
      height?: number;
      style?: any;
    };
    
    /**
     * Column formatting rules
     */
    columnFormatting?: {
      [columnId: string]: {
        width?: number;
        alignment?: 'left' | 'center' | 'right';
        format?: string; // e.g., 'currency', 'percentage', 'date'
        style?: any;
      };
    };
    
    /**
     * Row styling rules
     */
    rowStyling?: {
      alternateRows: boolean;
      headerStyle?: any;
      dataStyle?: any;
      groupStyle?: any;
    };
    
    /**
     * Logo or branding
     */
    branding?: {
      logo?: string; // Base64 or URL
      company?: string;
      address?: string;
      position: 'header' | 'footer';
    };
  };
}

/**
 * Advanced export options
 */
export interface AdvancedExportOptions {
  /**
   * Export selected rows only
   */
  selectedRowsOnly: boolean;
  
  /**
   * Include cell styles and colors
   */
  preserveStyling: boolean;
  
  /**
   * Include merged cells information
   */
  includeMergedCells: boolean;
  
  /**
   * Export hierarchical/grouped data
   */
  includeHierarchy: boolean;
  
  /**
   * Custom cell renderers for export
   */
  customRenderers?: {
    [columnId: string]: (value: any, rowData: any) => string;
  };
  
  /**
   * Post-processing function
   */
  postProcessor?: (data: ExportData) => ExportData;
  
  /**
   * Progress callback
   */
  onProgress?: (progress: number) => void;
  
  /**
   * Batch size for large exports
   */
  batchSize?: number;
}

/**
 * Supported export formats
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'google-sheets';