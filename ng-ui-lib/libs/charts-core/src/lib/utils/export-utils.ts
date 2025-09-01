/**
 * Export Utilities
 * Helper functions for chart export operations
 */

import { ChartExportConfig, ChartExportFormat } from '../interfaces/chart-export';

/**
 * Generate filename with timestamp
 */
export function generateTimestampedFilename(baseFilename: string, format: ChartExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const extension = getFileExtension(format);
  return `${baseFilename}-${timestamp}.${extension}`;
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: ChartExportFormat): string {
  const extensions: { [key in ChartExportFormat]: string } = {
    png: 'png',
    jpeg: 'jpg',
    svg: 'svg',
    pdf: 'pdf',
    excel: 'xlsx',
    powerpoint: 'pptx',
    csv: 'csv',
    json: 'json',
    html: 'html'
  };
  
  return extensions[format] || format;
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: ChartExportFormat): string {
  const mimeTypes: { [key in ChartExportFormat]: string } = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    powerpoint: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    csv: 'text/csv',
    json: 'application/json',
    html: 'text/html'
  };
  
  return mimeTypes[format] || 'application/octet-stream';
}

/**
 * Validate export configuration
 */
export function validateExportConfig(config: ChartExportConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.format) {
    errors.push('Export format is required');
  }
  
  if (!config.filename || config.filename.trim().length === 0) {
    errors.push('Filename is required');
  }
  
  if (config.filename && !/^[a-zA-Z0-9-_\s]+$/.test(config.filename)) {
    errors.push('Filename contains invalid characters');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create download link for file
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert data URL to blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get supported formats for chart type
 */
export function getSupportedFormats(chartType: string): ChartExportFormat[] {
  const baseFormats: ChartExportFormat[] = ['png', 'jpeg', 'svg', 'pdf', 'csv', 'json'];
  
  switch (chartType.toLowerCase()) {
    case '3d':
    case 'bar-3d':
    case 'scatter-3d':
    case 'surface-3d':
      return [...baseFormats, 'excel', 'powerpoint'];
    
    case 'dashboard':
    case 'bi':
      return [...baseFormats, 'excel', 'powerpoint', 'html'];
    
    default:
      return baseFormats;
  }
}

/**
 * Create export progress tracker
 */
export class ExportProgressTracker {
  private callbacks: Array<(progress: any) => void> = [];
  
  onProgress(callback: (progress: any) => void): void {
    this.callbacks.push(callback);
  }
  
  updateProgress(current: number, total: number, description: string): void {
    const progress = {
      currentStep: current,
      totalSteps: total,
      stepDescription: description,
      percentage: Math.round((current / total) * 100)
    };
    
    this.callbacks.forEach(callback => callback(progress));
  }
  
  complete(): void {
    this.updateProgress(1, 1, 'Complete!');
    this.callbacks = [];
  }
}

/**
 * Debounce function for export operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Check if export format supports transparency
 */
export function supportsTransparency(format: ChartExportFormat): boolean {
  return ['png', 'svg'].includes(format);
}

/**
 * Check if export format supports vector graphics
 */
export function isVectorFormat(format: ChartExportFormat): boolean {
  return ['svg', 'pdf'].includes(format);
}

/**
 * Check if export format supports data embedding
 */
export function supportsDataEmbedding(format: ChartExportFormat): boolean {
  return ['excel', 'powerpoint', 'html', 'svg'].includes(format);
}

/**
 * Get optimal DPI for export format
 */
export function getOptimalDPI(format: ChartExportFormat, usage: 'web' | 'print' | 'presentation'): number {
  if (isVectorFormat(format)) {
    return 300; // Vector formats benefit from high DPI
  }
  
  switch (usage) {
    case 'web':
      return 72;
    case 'print':
      return 300;
    case 'presentation':
      return 150;
    default:
      return 96;
  }
}

/**
 * Create export configuration preset
 */
export function createExportPreset(
  format: ChartExportFormat,
  preset: 'web' | 'print' | 'presentation' | 'email' | 'social'
): Partial<ChartExportConfig> {
  const baseConfig: Partial<ChartExportConfig> = {
    format,
    scope: 'visible',
    includeMetadata: true,
    includeDataSource: false,
    timestamp: true
  };
  
  switch (preset) {
    case 'web':
      return {
        ...baseConfig,
        formatOptions: {
          quality: 0.8,
          dpi: 72,
          scaleFactor: 1,
          backgroundColor: 'transparent'
        }
      };
      
    case 'print':
      return {
        ...baseConfig,
        formatOptions: {
          quality: 1.0,
          dpi: 300,
          scaleFactor: 1,
          backgroundColor: 'white'
        }
      };
      
    case 'presentation':
      return {
        ...baseConfig,
        formatOptions: {
          quality: 0.95,
          dpi: 150,
          scaleFactor: 2,
          backgroundColor: 'white'
        }
      };
      
    case 'email':
      return {
        ...baseConfig,
        formatOptions: {
          quality: 0.8,
          dpi: 96,
          scaleFactor: 1,
          backgroundColor: 'white',
          dimensions: { width: 600, height: 400, maintainAspectRatio: true }
        }
      };
      
    case 'social':
      return {
        ...baseConfig,
        formatOptions: {
          quality: 0.9,
          dpi: 72,
          scaleFactor: 2,
          backgroundColor: 'white',
          dimensions: { width: 1200, height: 630, maintainAspectRatio: false }
        }
      };
      
    default:
      return baseConfig;
  }
}