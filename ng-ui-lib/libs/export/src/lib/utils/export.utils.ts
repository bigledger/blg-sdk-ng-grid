import { ExportFormat, ExportConfig } from '../interfaces';

/**
 * Utility functions for export operations
 */
export class ExportUtils {
  
  /**
   * Detect file format from extension
   */
  static detectFormatFromExtension(filename: string): ExportFormat | null {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const formatMap: Record<string, ExportFormat> = {
      'pdf': ExportFormat.PDF,
      'xlsx': ExportFormat.EXCEL,
      'xls': ExportFormat.EXCEL,
      'docx': ExportFormat.WORD,
      'doc': ExportFormat.WORD,
      'csv': ExportFormat.CSV,
      'json': ExportFormat.JSON,
      'png': ExportFormat.PNG,
      'jpg': ExportFormat.JPEG,
      'jpeg': ExportFormat.JPEG,
      'svg': ExportFormat.SVG,
      'html': ExportFormat.HTML,
      'xml': ExportFormat.XML
    };

    return formatMap[extension || ''] || null;
  }

  /**
   * Get file extension for format
   */
  static getExtensionForFormat(format: ExportFormat): string {
    const extensionMap: Record<ExportFormat, string> = {
      [ExportFormat.PDF]: 'pdf',
      [ExportFormat.EXCEL]: 'xlsx',
      [ExportFormat.WORD]: 'docx',
      [ExportFormat.CSV]: 'csv',
      [ExportFormat.JSON]: 'json',
      [ExportFormat.PNG]: 'png',
      [ExportFormat.JPEG]: 'jpg',
      [ExportFormat.SVG]: 'svg',
      [ExportFormat.HTML]: 'html',
      [ExportFormat.XML]: 'xml',
      [ExportFormat.GOOGLE_SHEETS]: 'gsheet',
      [ExportFormat.GOOGLE_DOCS]: 'gdoc'
    };

    return extensionMap[format] || 'dat';
  }

  /**
   * Get MIME type for format
   */
  static getMimeType(format: ExportFormat): string {
    const mimeMap: Record<ExportFormat, string> = {
      [ExportFormat.PDF]: 'application/pdf',
      [ExportFormat.EXCEL]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      [ExportFormat.WORD]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      [ExportFormat.CSV]: 'text/csv',
      [ExportFormat.JSON]: 'application/json',
      [ExportFormat.PNG]: 'image/png',
      [ExportFormat.JPEG]: 'image/jpeg',
      [ExportFormat.SVG]: 'image/svg+xml',
      [ExportFormat.HTML]: 'text/html',
      [ExportFormat.XML]: 'application/xml',
      [ExportFormat.GOOGLE_SHEETS]: 'application/vnd.google-apps.spreadsheet',
      [ExportFormat.GOOGLE_DOCS]: 'application/vnd.google-apps.document'
    };

    return mimeMap[format] || 'application/octet-stream';
  }

  /**
   * Validate export configuration
   */
  static validateConfig(config: ExportConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!config.format) {
      errors.push('Export format is required');
    }

    if (!config.filename && 
        config.format !== ExportFormat.GOOGLE_SHEETS && 
        config.format !== ExportFormat.GOOGLE_DOCS) {
      errors.push('Filename is required for non-Google formats');
    }

    if (!config.data && !config.element) {
      errors.push('Either data or element must be provided');
    }

    // Format-specific validations
    if (config.format === ExportFormat.GOOGLE_SHEETS || config.format === ExportFormat.GOOGLE_DOCS) {
      if (!config.credentials && !config.accessToken) {
        errors.push('Google credentials or access token required for Google exports');
      }
    }

    if ((config.format === ExportFormat.PNG || 
         config.format === ExportFormat.JPEG || 
         config.format === ExportFormat.SVG) && 
        !config.element && !config.data) {
      errors.push('Element or data required for image exports');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate safe filename
   */
  static generateSafeFilename(filename: string, format: ExportFormat): string {
    // Remove invalid characters
    let safeName = filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
    
    // Limit length
    if (safeName.length > 200) {
      safeName = safeName.substring(0, 200);
    }

    // Add extension if not present
    const extension = this.getExtensionForFormat(format);
    if (!safeName.toLowerCase().endsWith(`.${extension}`)) {
      safeName += `.${extension}`;
    }

    return safeName;
  }

  /**
   * Calculate estimated export size
   */
  static estimateExportSize(data: any, format: ExportFormat): number {
    if (!data) return 0;

    let baseSize = 0;

    // Calculate base data size
    try {
      const jsonString = JSON.stringify(data);
      baseSize = jsonString.length;
    } catch {
      // If data can't be serialized, estimate from string representation
      baseSize = String(data).length;
    }

    // Apply format-specific multipliers
    const formatMultipliers: Record<ExportFormat, number> = {
      [ExportFormat.PDF]: 3.5,      // PDF has overhead for formatting
      [ExportFormat.EXCEL]: 2.8,    // Excel binary format
      [ExportFormat.WORD]: 3.2,     // Word document overhead
      [ExportFormat.CSV]: 0.8,      // CSV is compact
      [ExportFormat.JSON]: 1.0,     // JSON is close to original
      [ExportFormat.PNG]: 5.0,      // Images are larger
      [ExportFormat.JPEG]: 3.0,     // JPEG compression
      [ExportFormat.SVG]: 4.0,      // SVG markup overhead
      [ExportFormat.HTML]: 2.5,     // HTML markup
      [ExportFormat.XML]: 2.0,      // XML markup
      [ExportFormat.GOOGLE_SHEETS]: 1.5,  // Remote storage
      [ExportFormat.GOOGLE_DOCS]: 2.0     // Remote storage
    };

    const multiplier = formatMultipliers[format] || 1.0;
    return Math.round(baseSize * multiplier);
  }

  /**
   * Check if format supports specific features
   */
  static supportsFeature(format: ExportFormat, feature: string): boolean {
    const featureSupport: Record<ExportFormat, string[]> = {
      [ExportFormat.PDF]: ['images', 'styling', 'pagination', 'watermarks', 'headers', 'footers'],
      [ExportFormat.EXCEL]: ['formulas', 'charts', 'formatting', 'multiple-sheets', 'conditional-formatting'],
      [ExportFormat.WORD]: ['images', 'styling', 'tables', 'headers', 'footers', 'pagination'],
      [ExportFormat.CSV]: ['tabular-data'],
      [ExportFormat.JSON]: ['nested-data', 'metadata'],
      [ExportFormat.PNG]: ['images', 'transparency'],
      [ExportFormat.JPEG]: ['images', 'compression'],
      [ExportFormat.SVG]: ['images', 'scalability', 'styling'],
      [ExportFormat.HTML]: ['styling', 'images', 'links', 'interactive'],
      [ExportFormat.XML]: ['structured-data', 'validation'],
      [ExportFormat.GOOGLE_SHEETS]: ['formulas', 'charts', 'sharing', 'collaboration', 'real-time'],
      [ExportFormat.GOOGLE_DOCS]: ['styling', 'images', 'sharing', 'collaboration', 'real-time']
    };

    return featureSupport[format]?.includes(feature) || false;
  }

  /**
   * Get recommended settings for format
   */
  static getRecommendedSettings(format: ExportFormat, dataType: 'tabular' | 'text' | 'image' | 'mixed'): Partial<ExportConfig> {
    const settings: Record<ExportFormat, Record<string, Partial<ExportConfig>>> = {
      [ExportFormat.PDF]: {
        tabular: { orientation: 'landscape', pageSize: 'a4' },
        text: { orientation: 'portrait', pageSize: 'a4' },
        image: { orientation: 'landscape', quality: 'high' },
        mixed: { orientation: 'portrait', pageSize: 'a4' }
      },
      [ExportFormat.EXCEL]: {
        tabular: { autoFitColumns: true, includeFormulas: false },
        text: { sheetName: 'Content' },
        image: { sheetName: 'Images' },
        mixed: { autoFitColumns: true }
      },
      [ExportFormat.WORD]: {
        tabular: { orientation: 'landscape' },
        text: { orientation: 'portrait' },
        image: { orientation: 'portrait' },
        mixed: { orientation: 'portrait' }
      },
      [ExportFormat.CSV]: {
        tabular: { includeHeader: true, delimiter: ',' },
        text: { includeHeader: false },
        image: { includeHeader: true },
        mixed: { includeHeader: true, delimiter: ',' }
      },
      [ExportFormat.JSON]: {
        tabular: { indent: 2, arrayFormat: 'objects' },
        text: { indent: 2 },
        image: { includeMetadata: true },
        mixed: { indent: 2, includeMetadata: true }
      },
      [ExportFormat.PNG]: {
        tabular: { scale: 2, quality: 'high' },
        text: { backgroundColor: 'white', scale: 2 },
        image: { quality: 'high', transparent: true },
        mixed: { scale: 2, quality: 'high' }
      },
      [ExportFormat.JPEG]: {
        tabular: { scale: 2, quality: 'high', backgroundColor: 'white' },
        text: { backgroundColor: 'white', scale: 2 },
        image: { quality: 'high' },
        mixed: { scale: 2, quality: 'high', backgroundColor: 'white' }
      },
      [ExportFormat.SVG]: {
        tabular: { embedFonts: true },
        text: { embedFonts: true },
        image: { optimize: true },
        mixed: { embedFonts: true, optimize: true }
      },
      [ExportFormat.HTML]: {
        tabular: {},
        text: {},
        image: {},
        mixed: {}
      },
      [ExportFormat.XML]: {
        tabular: {},
        text: {},
        image: {},
        mixed: {}
      },
      [ExportFormat.GOOGLE_SHEETS]: {
        tabular: { sharing: { type: 'private', role: 'writer' } },
        text: { sharing: { type: 'private', role: 'writer' } },
        image: { sharing: { type: 'private', role: 'writer' } },
        mixed: { sharing: { type: 'private', role: 'writer' } }
      },
      [ExportFormat.GOOGLE_DOCS]: {
        tabular: { sharing: { type: 'private', role: 'writer' } },
        text: { sharing: { type: 'private', role: 'writer' } },
        image: { sharing: { type: 'private', role: 'writer' } },
        mixed: { sharing: { type: 'private', role: 'writer' } }
      }
    };

    return settings[format]?.[dataType] || {};
  }

  /**
   * Detect data type for recommendations
   */
  static detectDataType(data: any): 'tabular' | 'text' | 'image' | 'mixed' {
    if (!data) return 'text';

    if (typeof data === 'string') {
      return 'text';
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return 'tabular';
      
      const firstItem = data[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        return 'tabular';
      }
      
      return data.every(item => typeof item === 'string') ? 'text' : 'mixed';
    }

    if (typeof data === 'object' && data !== null) {
      // Check if it's an image-like object
      if (data.src || data.imageData || data.canvas) {
        return 'image';
      }
      
      // Check if it has mixed content
      const values = Object.values(data);
      const hasObjects = values.some(v => typeof v === 'object' && v !== null);
      const hasStrings = values.some(v => typeof v === 'string');
      
      if (hasObjects && hasStrings) return 'mixed';
      if (hasStrings) return 'text';
      
      return 'tabular';
    }

    return 'mixed';
  }

  /**
   * Format bytes for display
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration for display
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Create download link element
   */
  static createDownloadLink(blob: Blob, filename: string): HTMLAnchorElement {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    return link;
  }

  /**
   * Trigger download
   */
  static triggerDownload(blob: Blob, filename: string): void {
    const link = this.createDownloadLink(blob, filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL after a delay
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  /**
   * Convert data URL to blob
   */
  static dataUrlToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',');
    const mimeString = parts[0].split(':')[1].split(';')[0];
    const byteString = atob(parts[1]);
    
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([arrayBuffer], { type: mimeString });
  }

  /**
   * Convert blob to data URL
   */
  static blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Compress data for export
   */
  static compressData(data: string, level: 'low' | 'medium' | 'high' | 'maximum' = 'medium'): string {
    // Simple compression implementation
    // In a real implementation, you might use libraries like pako for gzip compression
    
    const compressionLevels = {
      low: 0.9,
      medium: 0.7,
      high: 0.5,
      maximum: 0.3
    };
    
    const ratio = compressionLevels[level];
    
    // Simplified compression by removing extra whitespace and shortening repeated patterns
    // Apply compression using ratio: ${ratio}
    let compressed = data
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n')  // Remove empty lines
      .trim();
    
    return compressed;
  }

  /**
   * Check if browser supports specific features
   */
  static checkBrowserSupport(): {
    canvas: boolean;
    blob: boolean;
    download: boolean;
    fileReader: boolean;
    localStorage: boolean;
  } {
    return {
      canvas: typeof HTMLCanvasElement !== 'undefined',
      blob: typeof Blob !== 'undefined',
      download: typeof HTMLAnchorElement !== 'undefined' && 'download' in HTMLAnchorElement.prototype,
      fileReader: typeof FileReader !== 'undefined',
      localStorage: typeof Storage !== 'undefined'
    };
  }

  /**
   * Get platform-specific export limitations
   */
  static getPlatformLimitations(): {
    maxFileSize: number;
    supportedFormats: ExportFormat[];
    requiresUserGesture: boolean;
  } {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);

    return {
      maxFileSize: isMobile ? 50 * 1024 * 1024 : 500 * 1024 * 1024, // 50MB mobile, 500MB desktop
      supportedFormats: Object.values(ExportFormat), // All formats supported in browser
      requiresUserGesture: isSafari || isMobile // Safari and mobile require user gesture for downloads
    };
  }
}