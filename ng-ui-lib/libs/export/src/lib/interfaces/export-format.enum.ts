/**
 * Supported export formats for the unified export service
 */
export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  WORD = 'word',
  CSV = 'csv',
  JSON = 'json',
  GOOGLE_SHEETS = 'google-sheets',
  GOOGLE_DOCS = 'google-docs',
  PNG = 'png',
  JPEG = 'jpeg',
  SVG = 'svg',
  HTML = 'html',
  XML = 'xml'
}

/**
 * Export quality settings for image formats
 */
export enum ExportQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

/**
 * Page orientation for document formats
 */
export enum PageOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

/**
 * Page size options for document formats
 */
export enum PageSize {
  A4 = 'a4',
  A3 = 'a3',
  A5 = 'a5',
  LETTER = 'letter',
  LEGAL = 'legal',
  TABLOID = 'tabloid',
  CUSTOM = 'custom'
}

/**
 * Compression levels for exports
 */
export enum CompressionLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}