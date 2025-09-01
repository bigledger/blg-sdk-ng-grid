/**
 * Chart Export Configuration and Types
 * Comprehensive export system for charts with support for multiple formats
 */

/**
 * Supported chart export formats
 */
export type ChartExportFormat = 
  | 'png' 
  | 'jpeg' 
  | 'svg' 
  | 'pdf' 
  | 'excel' 
  | 'powerpoint' 
  | 'csv' 
  | 'json'
  | 'html';

/**
 * Export scope options
 */
export type ChartExportScope = 
  | 'visible'      // Currently visible chart area
  | 'full'         // Full chart including scrollable areas
  | 'selection'    // Selected data points only
  | 'data-only'    // Data without visualization
  | 'chart-only';  // Chart without data

/**
 * Image export quality settings
 */
export type ImageQuality = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Chart export configuration
 */
export interface ChartExportConfig {
  /** Export format */
  format: ChartExportFormat;
  
  /** Export scope */
  scope: ChartExportScope;
  
  /** Base filename (without extension) */
  filename: string;
  
  /** Include chart metadata */
  includeMetadata: boolean;
  
  /** Include data source information */
  includeDataSource: boolean;
  
  /** Export timestamp */
  timestamp: boolean;
  
  /** Watermark configuration */
  watermark?: WatermarkConfig;
  
  /** Format-specific options */
  formatOptions?: ImageExportOptions | VectorExportOptions | DataExportOptions | PresentationExportOptions;
}

/**
 * Watermark configuration
 */
export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
  fontFamily?: string;
}

/**
 * Image export options (PNG, JPEG)
 */
export interface ImageExportOptions {
  /** Image quality (0.1 to 1.0) */
  quality: number;
  
  /** DPI for high resolution */
  dpi: number;
  
  /** Custom dimensions or scale factor */
  dimensions?: {
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  };
  
  /** Scale factor (1x, 2x, 3x for retina displays) */
  scaleFactor: number;
  
  /** Background color (transparent for PNG) */
  backgroundColor: string | 'transparent';
  
  /** Include animations as frames */
  includeAnimationFrames: boolean;
  
  /** Animation export settings */
  animationOptions?: AnimationExportOptions;
}

/**
 * Animation export options
 */
export interface AnimationExportOptions {
  /** Export as GIF or separate frames */
  exportType: 'gif' | 'frames';
  
  /** Frame rate for GIF */
  frameRate: number;
  
  /** Duration per frame in milliseconds */
  frameDuration: number;
  
  /** Loop count (0 for infinite) */
  loopCount: number;
  
  /** Quality settings for GIF */
  gifQuality: number;
}

/**
 * Vector export options (SVG, PDF)
 */
export interface VectorExportOptions {
  /** Include embedded fonts */
  embedFonts: boolean;
  
  /** Include CSS styles */
  embedStyles: boolean;
  
  /** SVG optimization level */
  optimizationLevel: 'none' | 'basic' | 'advanced';
  
  /** PDF-specific options */
  pdfOptions?: PdfExportOptions;
  
  /** SVG-specific options */
  svgOptions?: SvgExportOptions;
}

/**
 * PDF export options
 */
export interface PdfExportOptions {
  /** Page size */
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Custom';
  
  /** Custom page dimensions (if pageSize is 'Custom') */
  customDimensions?: { width: number; height: number };
  
  /** Page orientation */
  orientation: 'portrait' | 'landscape';
  
  /** Margins */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  /** Include interactive elements */
  includeInteractiveElements: boolean;
  
  /** Include bookmarks for chart sections */
  includeBookmarks: boolean;
  
  /** Multi-page layout for multiple charts */
  multiPage: boolean;
  
  /** Charts per page */
  chartsPerPage: number;
}

/**
 * SVG export options
 */
export interface SvgExportOptions {
  /** Inline all styles */
  inlineStyles: boolean;
  
  /** Include XML declaration */
  includeXmlDeclaration: boolean;
  
  /** Pretty print formatting */
  prettyPrint: boolean;
  
  /** Optimize paths */
  optimizePaths: boolean;
  
  /** Remove unused elements */
  removeUnused: boolean;
}

/**
 * Data export options (CSV, JSON, Excel)
 */
export interface DataExportOptions {
  /** Include raw data */
  includeRawData: boolean;
  
  /** Include aggregated data */
  includeAggregatedData: boolean;
  
  /** Include statistical summary */
  includeStatistics: boolean;
  
  /** Data format structure */
  dataFormat: 'flat' | 'nested' | 'pivot' | 'time-series';
  
  /** CSV-specific options */
  csvOptions?: CsvDataExportOptions;
  
  /** Excel-specific options */
  excelOptions?: ExcelDataExportOptions;
  
  /** JSON-specific options */
  jsonOptions?: JsonDataExportOptions;
}

/**
 * CSV data export options
 */
export interface CsvDataExportOptions {
  delimiter: ',' | ';' | '\t' | '|';
  textQualifier: '"' | "'" | 'none';
  lineEnding: '\n' | '\r\n';
  includeHeaders: boolean;
  dateFormat: string;
  numberFormat: string;
  encoding: 'UTF-8' | 'UTF-16' | 'ASCII';
}

/**
 * Excel data export options
 */
export interface ExcelDataExportOptions {
  /** Worksheet name */
  worksheetName: string;
  
  /** Include chart as image in worksheet */
  includeChartImage: boolean;
  
  /** Create native Excel chart */
  createNativeChart: boolean;
  
  /** Multiple worksheets */
  multipleWorksheets: boolean;
  
  /** Worksheet for each data series */
  worksheetPerSeries: boolean;
  
  /** Include pivot tables */
  includePivotTables: boolean;
  
  /** Auto-size columns */
  autoSizeColumns: boolean;
  
  /** Apply formatting */
  applyFormatting: boolean;
  
  /** Header styling */
  headerStyle: ExcelCellStyle;
  
  /** Data styling */
  dataStyle: ExcelCellStyle;
}

/**
 * Excel cell styling
 */
export interface ExcelCellStyle {
  font: {
    bold: boolean;
    italic: boolean;
    color: string;
    size: number;
    family: string;
  };
  fill: {
    backgroundColor: string;
    pattern: string;
  };
  border: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
    color: string;
    style: 'thin' | 'medium' | 'thick' | 'double';
  };
  alignment: {
    horizontal: 'left' | 'center' | 'right' | 'justify';
    vertical: 'top' | 'middle' | 'bottom';
    wrapText: boolean;
  };
  numberFormat: string;
}

/**
 * JSON data export options
 */
export interface JsonDataExportOptions {
  /** JSON formatting */
  prettyPrint: boolean;
  
  /** Include metadata */
  includeMetadata: boolean;
  
  /** Include chart configuration */
  includeChartConfig: boolean;
  
  /** Date serialization format */
  dateFormat: 'iso' | 'timestamp' | 'locale';
  
  /** Number precision */
  numberPrecision: number;
}

/**
 * Presentation export options (PowerPoint)
 */
export interface PresentationExportOptions {
  /** Template to use */
  template: 'default' | 'corporate' | 'modern' | 'minimal' | 'custom';
  
  /** Custom template path */
  customTemplatePath?: string;
  
  /** Slide layout */
  slideLayout: 'title-and-chart' | 'chart-only' | 'chart-and-data' | 'comparison';
  
  /** Include speaker notes */
  includeSpeakerNotes: boolean;
  
  /** Speaker notes content */
  speakerNotesTemplate?: string;
  
  /** Chart placement on slide */
  chartPlacement: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  /** Include data table */
  includeDataTable: boolean;
  
  /** Data table placement */
  dataTablePlacement?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  /** Multiple charts per slide */
  chartsPerSlide: number;
  
  /** Slide transition effects */
  slideTransitions: boolean;
  
  /** Chart animation on slide */
  chartAnimations: boolean;
}

/**
 * 3D Chart-specific export options
 */
export interface Chart3DExportOptions {
  /** Export multiple rotation views */
  multipleViews: boolean;
  
  /** Rotation angles for multiple views */
  rotationViews?: Array<{
    azimuth: number;
    elevation: number;
    label: string;
  }>;
  
  /** Export animation frames */
  exportAnimationFrames: boolean;
  
  /** Animation frame settings */
  animationFrameOptions?: {
    totalFrames: number;
    rotationSpeed: number;
    cameraPath?: Array<{
      position: [number, number, number];
      lookAt: [number, number, number];
      frame: number;
    }>;
  };
  
  /** Include 3D scene metadata */
  include3DMetadata: boolean;
  
  /** Export as 3D model format */
  export3DModel: boolean;
  
  /** 3D model format */
  modelFormat: 'obj' | 'gltf' | 'fbx' | 'stl';
  
  /** Include textures in 3D export */
  includeTextures: boolean;
}

/**
 * Batch export options
 */
export interface BatchExportOptions {
  /** Export multiple charts */
  multipleCharts: boolean;
  
  /** Chart selection for batch export */
  chartSelection: string[];
  
  /** Export formats for batch */
  batchFormats: ChartExportFormat[];
  
  /** Combine into single file */
  combineIntoSingle: boolean;
  
  /** Archive exported files */
  createArchive: boolean;
  
  /** Archive format */
  archiveFormat: 'zip' | 'tar' | '7z';
  
  /** Parallel processing */
  parallelExport: boolean;
  
  /** Progress callback */
  onProgress?: (progress: ExportProgress) => void;
}

/**
 * Export progress information
 */
export interface ExportProgress {
  /** Current step */
  currentStep: number;
  
  /** Total steps */
  totalSteps: number;
  
  /** Current step description */
  stepDescription: string;
  
  /** Overall progress percentage */
  percentage: number;
  
  /** Current file being processed */
  currentFile?: string;
  
  /** Estimated time remaining */
  estimatedTimeRemaining?: number;
}

/**
 * Export result information
 */
export interface ChartExportResult {
  /** Success status */
  success: boolean;
  
  /** Error message if failed */
  error?: string;
  
  /** Generated file information */
  files: ExportedFile[];
  
  /** Export metadata */
  metadata: ExportResultMetadata;
  
  /** Performance metrics */
  performance?: ExportPerformance;
}

/**
 * Exported file information
 */
export interface ExportedFile {
  /** File name */
  filename: string;
  
  /** File format */
  format: ChartExportFormat;
  
  /** File size in bytes */
  size: number;
  
  /** File blob or URL */
  data: Blob | string;
  
  /** MIME type */
  mimeType: string;
  
  /** File creation timestamp */
  createdAt: Date;
}

/**
 * Export result metadata
 */
export interface ExportResultMetadata {
  /** Export start time */
  startTime: Date;
  
  /** Export end time */
  endTime: Date;
  
  /** Total export duration */
  duration: number;
  
  /** Chart configuration used */
  chartConfig: any;
  
  /** Data summary */
  dataSummary: {
    totalDataPoints: number;
    seriesCount: number;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  
  /** Export configuration used */
  exportConfig: ChartExportConfig;
}

/**
 * Export performance metrics
 */
export interface ExportPerformance {
  /** Rendering time */
  renderTime: number;
  
  /** Processing time */
  processingTime: number;
  
  /** File generation time */
  fileGenerationTime: number;
  
  /** Memory usage peak */
  memoryUsage: number;
  
  /** CPU usage average */
  cpuUsage: number;
}

/**
 * Export service interface
 */
export interface IChartExportService {
  /** Export chart with given configuration */
  exportChart(config: ChartExportConfig): Promise<ChartExportResult>;
  
  /** Export multiple charts in batch */
  batchExport(configs: ChartExportConfig[], batchOptions: BatchExportOptions): Promise<ChartExportResult[]>;
  
  /** Get supported export formats for chart type */
  getSupportedFormats(chartType: string): ChartExportFormat[];
  
  /** Get default export configuration */
  getDefaultConfig(format: ChartExportFormat): ChartExportConfig;
  
  /** Validate export configuration */
  validateConfig(config: ChartExportConfig): { valid: boolean; errors: string[] };
  
  /** Get export preview */
  getPreview(config: ChartExportConfig): Promise<string>;
  
  /** Cancel ongoing export */
  cancelExport(exportId: string): void;
}

/**
 * Chart export events
 */
export interface ChartExportEvents {
  /** Export started */
  onExportStart?: (config: ChartExportConfig) => void;
  
  /** Export progress update */
  onExportProgress?: (progress: ExportProgress) => void;
  
  /** Export completed successfully */
  onExportComplete?: (result: ChartExportResult) => void;
  
  /** Export failed */
  onExportError?: (error: string, config: ChartExportConfig) => void;
  
  /** Export cancelled */
  onExportCancel?: (exportId: string) => void;
  
  /** File download initiated */
  onFileDownload?: (file: ExportedFile) => void;
}

/**
 * Export presets for common use cases
 */
export interface ChartExportPresets {
  /** High-quality presentation preset */
  presentation: ChartExportConfig;
  
  /** Web-optimized preset */
  web: ChartExportConfig;
  
  /** Print-ready preset */
  print: ChartExportConfig;
  
  /** Data analysis preset */
  dataAnalysis: ChartExportConfig;
  
  /** Social media preset */
  socialMedia: ChartExportConfig;
  
  /** Email-friendly preset */
  email: ChartExportConfig;
}