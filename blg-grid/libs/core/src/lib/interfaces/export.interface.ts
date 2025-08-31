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
  dataScope: 'all' | 'visible' | 'filtered';
  
  /**
   * Columns to include in export (if not specified, all visible columns are included)
   */
  includeColumns?: string[];
  
  /**
   * Format-specific options
   */
  formatOptions?: CsvExportOptions | ExcelExportOptions;
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
 * Supported export formats
 */
export type ExportFormat = 'csv' | 'excel';