import { ExportFormat, ExportQuality, PageOrientation, PageSize, CompressionLevel } from './export-format.enum';

/**
 * Base configuration for all export operations
 */
export interface BaseExportConfig {
  /** Output filename (without extension) */
  filename: string;
  /** Export format */
  format: ExportFormat;
  /** Compression level */
  compression?: CompressionLevel;
  /** Custom metadata */
  metadata?: Record<string, any>;
  /** Progress callback */
  onProgress?: (progress: number) => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Success callback */
  onSuccess?: (result: ExportResult) => void;
}

/**
 * Document-specific export configuration
 */
export interface DocumentExportConfig extends BaseExportConfig {
  /** Page orientation */
  orientation?: PageOrientation;
  /** Page size */
  pageSize?: PageSize;
  /** Custom page dimensions (for CUSTOM page size) */
  customPageSize?: { width: number; height: number };
  /** Margins in mm */
  margins?: { top: number; right: number; bottom: number; left: number };
  /** Header content */
  header?: string | DocumentElement;
  /** Footer content */
  footer?: string | DocumentElement;
  /** Watermark configuration */
  watermark?: WatermarkConfig;
  /** Include page numbers */
  includePageNumbers?: boolean;
  /** Page number format */
  pageNumberFormat?: string;
  /** Font family */
  fontFamily?: string;
  /** Base font size */
  fontSize?: number;
}

/**
 * Image-specific export configuration
 */
export interface ImageExportConfig extends BaseExportConfig {
  /** Image quality */
  quality?: ExportQuality;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Scale factor */
  scale?: number;
  /** Background color */
  backgroundColor?: string;
  /** Include transparency (PNG only) */
  transparent?: boolean;
  /** DPI setting */
  dpi?: number;
}

/**
 * Excel-specific export configuration
 */
export interface ExcelExportConfig extends BaseExportConfig {
  /** Worksheet name */
  sheetName?: string;
  /** Multiple sheets configuration */
  sheets?: ExcelSheetConfig[];
  /** Include formulas */
  includeFormulas?: boolean;
  /** Auto-fit columns */
  autoFitColumns?: boolean;
  /** Freeze panes */
  freezePanes?: { row: number; column: number };
  /** Conditional formatting rules */
  conditionalFormatting?: ConditionalFormattingRule[];
  /** Chart configurations */
  charts?: ExcelChartConfig[];
}

/**
 * CSV-specific export configuration
 */
export interface CsvExportConfig extends BaseExportConfig {
  /** Field delimiter */
  delimiter?: string;
  /** Quote character */
  quote?: string;
  /** Escape character */
  escape?: string;
  /** Include header row */
  includeHeader?: boolean;
  /** Custom encoding */
  encoding?: string;
  /** Line ending style */
  lineEnding?: 'CRLF' | 'LF' | 'CR';
}

/**
 * Google integration configuration
 */
export interface GoogleExportConfig extends BaseExportConfig {
  /** Google API credentials */
  credentials?: GoogleCredentials;
  /** Target folder ID */
  folderId?: string;
  /** Share settings */
  sharing?: GoogleSharingConfig;
  /** Template ID for Google Docs */
  templateId?: string;
}

/**
 * Main export configuration interface
 */
export interface ExportConfig extends 
  BaseExportConfig, 
  Partial<DocumentExportConfig>, 
  Partial<ImageExportConfig>, 
  Partial<ExcelExportConfig>, 
  Partial<CsvExportConfig>, 
  Partial<GoogleExportConfig> {
  /** Data to export */
  data?: any;
  /** HTML element to export (for image/PDF from DOM) */
  element?: HTMLElement | string;
  /** Template for document generation */
  template?: ExportTemplate;
  /** Custom export options */
  customOptions?: Record<string, any>;
}

/**
 * Export template configuration
 */
export interface ExportTemplate {
  /** Template type */
  type: 'grid' | 'editor' | 'chart' | 'custom';
  /** Template name */
  name: string;
  /** Template content */
  content?: string;
  /** Template variables */
  variables?: Record<string, any>;
  /** Styling options */
  styles?: TemplateStyles;
}

/**
 * Template styling configuration
 */
export interface TemplateStyles {
  /** CSS styles */
  css?: string;
  /** Theme name */
  theme?: string;
  /** Color scheme */
  colorScheme?: 'light' | 'dark' | 'auto';
  /** Custom colors */
  colors?: Record<string, string>;
}

/**
 * Watermark configuration
 */
export interface WatermarkConfig {
  /** Watermark text */
  text?: string;
  /** Watermark image URL */
  image?: string;
  /** Opacity (0-1) */
  opacity?: number;
  /** Position */
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Rotation angle */
  rotation?: number;
  /** Font size for text watermarks */
  fontSize?: number;
  /** Font color for text watermarks */
  color?: string;
}

/**
 * Document element for headers/footers
 */
export interface DocumentElement {
  /** Element type */
  type: 'text' | 'image' | 'table' | 'custom';
  /** Element content */
  content: any;
  /** Element styles */
  styles?: Record<string, any>;
  /** Element alignment */
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Excel sheet configuration
 */
export interface ExcelSheetConfig {
  /** Sheet name */
  name: string;
  /** Sheet data */
  data: any[][];
  /** Column configurations */
  columns?: ExcelColumnConfig[];
  /** Sheet protection */
  protection?: ExcelProtectionConfig;
}

/**
 * Excel column configuration
 */
export interface ExcelColumnConfig {
  /** Column header */
  header: string;
  /** Column width */
  width?: number;
  /** Data type */
  type?: 'string' | 'number' | 'date' | 'boolean' | 'formula';
  /** Number format */
  format?: string;
  /** Column styles */
  styles?: ExcelCellStyles;
}

/**
 * Excel cell styles
 */
export interface ExcelCellStyles {
  /** Font configuration */
  font?: {
    name?: string;
    size?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
  };
  /** Fill configuration */
  fill?: {
    type?: 'solid' | 'gradient';
    color?: string;
    backgroundColor?: string;
  };
  /** Border configuration */
  border?: {
    top?: ExcelBorderStyle;
    right?: ExcelBorderStyle;
    bottom?: ExcelBorderStyle;
    left?: ExcelBorderStyle;
  };
  /** Alignment configuration */
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'middle' | 'bottom';
    wrapText?: boolean;
  };
}

/**
 * Excel border style
 */
export interface ExcelBorderStyle {
  style: 'thin' | 'medium' | 'thick' | 'dotted' | 'dashed';
  color?: string;
}

/**
 * Excel protection configuration
 */
export interface ExcelProtectionConfig {
  /** Password for protection */
  password?: string;
  /** Allow specific actions */
  allowedActions?: string[];
}

/**
 * Conditional formatting rule
 */
export interface ConditionalFormattingRule {
  /** Rule type */
  type: 'cellIs' | 'expression' | 'colorScale' | 'dataBar' | 'iconSet';
  /** Rule condition */
  condition: any;
  /** Rule format */
  format: ExcelCellStyles;
  /** Applied range */
  range: string;
}

/**
 * Excel chart configuration
 */
export interface ExcelChartConfig {
  /** Chart type */
  type: 'column' | 'line' | 'pie' | 'bar' | 'area' | 'scatter';
  /** Chart title */
  title: string;
  /** Data range */
  dataRange: string;
  /** Chart position */
  position: { row: number; column: number };
  /** Chart size */
  size: { width: number; height: number };
}

/**
 * Google credentials
 */
export interface GoogleCredentials {
  /** API key */
  apiKey?: string;
  /** OAuth token */
  accessToken?: string;
  /** Service account key */
  serviceAccountKey?: string;
  /** Client ID */
  clientId?: string;
  /** Client secret */
  clientSecret?: string;
}

/**
 * Google sharing configuration
 */
export interface GoogleSharingConfig {
  /** Access level */
  accessLevel?: 'private' | 'restricted' | 'public';
  /** Share type (legacy compatibility) */
  type?: 'private' | 'restricted' | 'public';
  /** User role */
  role?: 'reader' | 'writer' | 'owner';
  /** Share with specific users */
  users?: string[];
  /** Allow comments */
  allowComments?: boolean;
  /** Allow editing */
  allowEditing?: boolean;
}

/**
 * Export result
 */
export interface ExportResult {
  /** Success status */
  success: boolean;
  /** Result data */
  data?: Blob | string | ArrayBuffer;
  /** File URL (for downloads) */
  url?: string;
  /** Google file ID (for Google exports) */
  googleFileId?: string;
  /** File size in bytes */
  size?: number;
  /** Export metadata */
  metadata?: Record<string, any>;
  /** Error details */
  error?: Error;
  /** Export duration in milliseconds */
  duration?: number;
}