import { ExportFormat } from './export-format.enum';

/**
 * Format-specific export options
 */
export interface ExportOptions {
  /** PDF-specific options */
  pdf?: PdfOptions;
  /** Excel-specific options */
  excel?: ExcelOptions;
  /** Word-specific options */
  word?: WordOptions;
  /** CSV-specific options */
  csv?: CsvOptions;
  /** JSON-specific options */
  json?: JsonOptions;
  /** Image-specific options */
  image?: ImageOptions;
  /** Google-specific options */
  google?: GoogleOptions;
}

/**
 * PDF export options
 */
export interface PdfOptions {
  /** jsPDF format */
  format?: 'a4' | 'a3' | 'a5' | 'letter' | 'legal';
  /** PDF orientation */
  orientation?: 'portrait' | 'landscape';
  /** PDF unit */
  unit?: 'pt' | 'mm' | 'cm' | 'in';
  /** Compression level */
  compress?: boolean;
  /** PDF version */
  version?: '1.3' | '1.4' | '1.5' | '1.6' | '1.7';
  /** Font options */
  fonts?: PdfFontOptions[];
  /** Page break settings */
  pageBreaks?: PdfPageBreakOptions;
  /** HTML to canvas options */
  html2canvas?: Html2CanvasOptions;
}

/**
 * PDF font options
 */
export interface PdfFontOptions {
  /** Font name */
  name: string;
  /** Font source */
  source: string;
  /** Font style */
  style?: 'normal' | 'bold' | 'italic' | 'bolditalic';
}

/**
 * PDF page break options
 */
export interface PdfPageBreakOptions {
  /** Avoid breaking inside elements */
  avoid?: string[];
  /** Force page breaks */
  force?: string[];
  /** Page break margin */
  margin?: number;
}

/**
 * html2canvas options
 */
export interface Html2CanvasOptions {
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Scale factor */
  scale?: number;
  /** Background color */
  backgroundColor?: string;
  /** Use CORS */
  useCORS?: boolean;
  /** Allow tainted canvas */
  allowTaint?: boolean;
  /** Logging */
  logging?: boolean;
}

/**
 * Excel export options
 */
export interface ExcelOptions {
  /** XLSX version */
  version?: '2007' | '2010' | '2013' | '2016' | '2019';
  /** Workbook properties */
  properties?: ExcelProperties;
  /** Default styles */
  defaultStyles?: Record<string, any>;
  /** Date format */
  dateFormat?: string;
  /** Number format */
  numberFormat?: string;
  /** Formula calculation mode */
  calculationMode?: 'automatic' | 'manual';
}

/**
 * Excel workbook properties
 */
export interface ExcelProperties {
  /** Title */
  title?: string;
  /** Subject */
  subject?: string;
  /** Author */
  author?: string;
  /** Manager */
  manager?: string;
  /** Company */
  company?: string;
  /** Category */
  category?: string;
  /** Keywords */
  keywords?: string;
  /** Comments */
  comments?: string;
}

/**
 * Word export options
 */
export interface WordOptions {
  /** Document format version */
  version?: '2007' | '2010' | '2013' | '2016' | '2019';
  /** Document properties */
  properties?: WordProperties;
  /** Default paragraph style */
  defaultParagraphStyle?: WordParagraphStyle;
  /** Default character style */
  defaultCharacterStyle?: WordCharacterStyle;
  /** Document sections */
  sections?: WordSectionOptions[];
}

/**
 * Word document properties
 */
export interface WordProperties {
  /** Title */
  title?: string;
  /** Subject */
  subject?: string;
  /** Creator */
  creator?: string;
  /** Keywords */
  keywords?: string;
  /** Description */
  description?: string;
  /** Last modified by */
  lastModifiedBy?: string;
  /** Revision */
  revision?: number;
}

/**
 * Word paragraph style
 */
export interface WordParagraphStyle {
  /** Alignment */
  alignment?: 'left' | 'center' | 'right' | 'justify';
  /** Spacing */
  spacing?: {
    before?: number;
    after?: number;
    line?: number;
    lineRule?: 'auto' | 'exact' | 'atLeast';
  };
  /** Indentation */
  indent?: {
    left?: number;
    right?: number;
    firstLine?: number;
    hanging?: number;
  };
}

/**
 * Word character style
 */
export interface WordCharacterStyle {
  /** Font */
  font?: {
    name?: string;
    size?: number;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
  };
  /** Highlight color */
  highlight?: string;
}

/**
 * Word section options
 */
export interface WordSectionOptions {
  /** Page setup */
  pageSetup?: {
    orientation?: 'portrait' | 'landscape';
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  };
  /** Headers and footers */
  headers?: WordHeaderFooterOptions;
  /** Footers */
  footers?: WordHeaderFooterOptions;
}

/**
 * Word header/footer options
 */
export interface WordHeaderFooterOptions {
  /** Default header/footer */
  default?: any;
  /** First page header/footer */
  first?: any;
  /** Even page header/footer */
  even?: any;
}

/**
 * CSV export options
 */
export interface CsvOptions {
  /** Field separator */
  separator?: string;
  /** Quote character */
  quote?: string;
  /** Escape character */
  escape?: string;
  /** Record separator */
  recordSeparator?: string;
  /** Skip empty lines */
  skipEmptyLines?: boolean;
  /** Trim fields */
  trim?: boolean;
  /** Custom encoding */
  encoding?: BufferEncoding;
}

/**
 * JSON export options
 */
export interface JsonOptions {
  /** Pretty print with indentation */
  indent?: number | string;
  /** Custom replacer function */
  replacer?: (key: string, value: any) => any;
  /** Include metadata */
  includeMetadata?: boolean;
  /** Flatten nested objects */
  flatten?: boolean;
  /** Array format for tabular data */
  arrayFormat?: 'objects' | 'arrays';
}

/**
 * Image export options
 */
export interface ImageOptions {
  /** Image format */
  format?: 'png' | 'jpeg' | 'webp' | 'svg';
  /** Quality (0-1 for JPEG) */
  quality?: number;
  /** Pixel ratio */
  pixelRatio?: number;
  /** Canvas options */
  canvas?: CanvasOptions;
  /** SVG options */
  svg?: SvgOptions;
}

/**
 * Canvas export options
 */
export interface CanvasOptions {
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Background color */
  backgroundColor?: string;
  /** Image smoothing */
  imageSmoothingEnabled?: boolean;
  /** Image smoothing quality */
  imageSmoothingQuality?: 'low' | 'medium' | 'high';
}

/**
 * SVG export options
 */
export interface SvgOptions {
  /** SVG width */
  width?: number;
  /** SVG height */
  height?: number;
  /** Embed fonts */
  embedFonts?: boolean;
  /** Embed images */
  embedImages?: boolean;
  /** Optimize output */
  optimize?: boolean;
}

/**
 * Google export options
 */
export interface GoogleOptions {
  /** Google Sheets options */
  sheets?: GoogleSheetsOptions;
  /** Google Docs options */
  docs?: GoogleDocsOptions;
  /** Authentication options */
  auth?: GoogleAuthOptions;
}

/**
 * Google Sheets options
 */
export interface GoogleSheetsOptions {
  /** Spreadsheet title */
  title?: string;
  /** Share settings */
  sharing?: {
    type: 'private' | 'public' | 'domain';
    role: 'reader' | 'writer' | 'owner';
    users?: string[];
  };
  /** Formatting options */
  formatting?: {
    freezeHeader?: boolean;
    autoResize?: boolean;
    conditionalFormatting?: any[];
  };
}

/**
 * Google Docs options
 */
export interface GoogleDocsOptions {
  /** Document title */
  title?: string;
  /** Template ID */
  templateId?: string;
  /** Share settings */
  sharing?: {
    type: 'private' | 'public' | 'domain';
    role: 'reader' | 'writer' | 'owner';
    users?: string[];
  };
}

/**
 * Google authentication options
 */
export interface GoogleAuthOptions {
  /** API key */
  apiKey?: string;
  /** OAuth 2.0 client ID */
  clientId?: string;
  /** OAuth 2.0 client secret */
  clientSecret?: string;
  /** Service account email */
  serviceAccountEmail?: string;
  /** Service account private key */
  serviceAccountKey?: string;
  /** Access token */
  accessToken?: string;
  /** Refresh token */
  refreshToken?: string;
}