import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject, from, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, finalize, switchMap } from 'rxjs/operators';

import { 
  ExportConfig, 
  ExportResult, 
  ExportFormat,
  ExportOptions
} from '../interfaces';

import { PdfExporter } from '../exporters/pdf.exporter';
import { ExcelExporter } from '../exporters/excel.exporter';
import { WordExporter } from '../exporters/word.exporter';
import { CsvExporter } from '../exporters/csv.exporter';
import { JsonExporter } from '../exporters/json.exporter';
import { ImageExporter } from '../exporters/image.exporter';
import { GoogleExporter } from '../exporters/google.exporter';
import { FileDownloadService } from './file-download.service';
import { DataTransformService } from './data-transform.service';
import { ProgressTrackingService } from './progress-tracking.service';

/**
 * Progress information for export operations
 */
export interface ExportProgress {
  /** Current progress percentage (0-100) */
  percentage: number;
  /** Current step description */
  step: string;
  /** Current operation */
  operation: string;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
  /** Export start time */
  startTime: number;
  /** Bytes processed */
  bytesProcessed?: number;
  /** Total bytes to process */
  totalBytes?: number;
}

/**
 * Batch export configuration
 */
export interface BatchExportConfig {
  /** Array of export configurations */
  exports: ExportConfig[];
  /** Batch name */
  batchName?: string;
  /** Parallel execution limit */
  concurrency?: number;
  /** Continue on error */
  continueOnError?: boolean;
  /** Progress callback for batch */
  onBatchProgress?: (completed: number, total: number, current?: ExportProgress) => void;
}

/**
 * Unified Export Service
 * 
 * Provides a comprehensive export solution for all ng-ui components.
 * Supports multiple formats, batch operations, progress tracking, and error handling.
 */
@Injectable({
  providedIn: 'root'
})
export class UnifiedExportService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fileDownloadService = inject(FileDownloadService);
  private readonly dataTransformService = inject(DataTransformService);
  private readonly progressTrackingService = inject(ProgressTrackingService);

  // Exporters
  private readonly pdfExporter = inject(PdfExporter);
  private readonly excelExporter = inject(ExcelExporter);
  private readonly wordExporter = inject(WordExporter);
  private readonly csvExporter = inject(CsvExporter);
  private readonly jsonExporter = inject(JsonExporter);
  private readonly imageExporter = inject(ImageExporter);
  private readonly googleExporter = inject(GoogleExporter);

  // State management using Angular signals
  private readonly _isExporting = signal(false);
  private readonly _currentExports = signal<Map<string, ExportProgress>>(new Map());
  private readonly _exportHistory = signal<ExportResult[]>([]);
  private readonly _globalProgress = signal<ExportProgress | null>(null);

  // Progress subjects for real-time updates
  private readonly progressSubject = new BehaviorSubject<ExportProgress | null>(null);
  private readonly batchProgressSubject = new BehaviorSubject<{ completed: number; total: number; current?: ExportProgress } | null>(null);

  // Public readonly signals
  readonly isExporting = this._isExporting.asReadonly();
  readonly currentExports = this._currentExports.asReadonly();
  readonly exportHistory = this._exportHistory.asReadonly();
  readonly globalProgress = this._globalProgress.asReadonly();

  // Computed properties
  readonly activeExportCount = computed(() => this._currentExports().size);
  readonly canExport = computed(() => isPlatformBrowser(this.platformId) && !this._isExporting());
  readonly averageExportTime = computed(() => {
    const history = this._exportHistory();
    if (history.length === 0) return 0;
    const totalTime = history.reduce((sum, result) => sum + (result.duration || 0), 0);
    return Math.round(totalTime / history.length);
  });

  // Observable streams
  readonly progress$ = this.progressSubject.asObservable();
  readonly batchProgress$ = this.batchProgressSubject.asObservable();

  constructor() {
    // Initialize progress tracking
    this.progressTrackingService.progress$.subscribe(progress => {
      this._globalProgress.set(progress);
      this.progressSubject.next(progress);
    });
  }

  /**
   * Export data using the specified configuration
   */
  export(config: ExportConfig): Observable<ExportResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Export is only supported in browser environment'));
    }

    const exportId = this.generateExportId();
    const startTime = Date.now();

    // Validate configuration
    const validationError = this.validateConfig(config);
    if (validationError) {
      return throwError(() => validationError);
    }

    // Set up progress tracking
    const initialProgress: ExportProgress = {
      percentage: 0,
      step: 'Initializing export',
      operation: 'setup',
      startTime,
    };

    this.updateExportProgress(exportId, initialProgress);
    this._isExporting.set(true);

    // Transform data if needed
    const transformedConfig = this.dataTransformService.transformConfig(config);

    // Select appropriate exporter and execute
    return this.getExporter(config.format).pipe(
      switchMap(exporter => {
        this.updateExportProgress(exportId, {
          ...initialProgress,
          percentage: 25,
          step: 'Processing data',
          operation: 'transform'
        });

        return exporter.export(transformedConfig);
      }),
      map(result => this.processResult(result, config, startTime)),
      tap(result => {
        this.updateExportProgress(exportId, {
          percentage: 100,
          step: 'Export completed',
          operation: 'complete',
          startTime
        });

        // Add to history
        this.addToHistory(result);

        // Trigger success callback
        if (config.onSuccess) {
          config.onSuccess(result);
        }

        // Auto-download if result contains data
        if (result.data && config.filename) {
          this.handleAutoDownload(result, config);
        }
      }),
      catchError(error => {
        const errorResult: ExportResult = {
          success: false,
          error,
          duration: Date.now() - startTime,
          metadata: { exportId, config: { format: config.format, filename: config.filename } }
        };

        // Trigger error callback
        if (config.onError) {
          config.onError(error);
        }

        this.addToHistory(errorResult);
        return throwError(() => error);
      }),
      finalize(() => {
        this.cleanupExport(exportId);
        this._isExporting.set(false);
      })
    );
  }

  /**
   * Export multiple configurations in batch
   */
  exportBatch(batchConfig: BatchExportConfig): Observable<ExportResult[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Batch export is only supported in browser environment'));
    }

    const { exports, concurrency = 3, continueOnError = false } = batchConfig;
    const results: ExportResult[] = [];
    const errors: Error[] = [];

    this._isExporting.set(true);
    this.batchProgressSubject.next({ completed: 0, total: exports.length });

    return new Observable<ExportResult[]>(observer => {
      let completed = 0;
      let currentIndex = 0;
      const inProgress = new Set<number>();

      const processNext = () => {
        if (currentIndex >= exports.length || (!continueOnError && errors.length > 0)) {
          if (inProgress.size === 0) {
            // All exports completed
            this._isExporting.set(false);
            this.batchProgressSubject.next(null);

            if (errors.length > 0 && !continueOnError) {
              observer.error(new Error(`Batch export failed: ${errors.length} errors occurred`));
            } else {
              observer.next(results);
              observer.complete();
            }
          }
          return;
        }

        if (inProgress.size >= concurrency) {
          return;
        }

        const exportIndex = currentIndex++;
        const exportConfig = exports[exportIndex];

        inProgress.add(exportIndex);

        // Track progress for this specific export
        const exportProgress = (progress: ExportProgress) => {
          this.batchProgressSubject.next({ 
            completed, 
            total: exports.length, 
            current: progress 
          });

          if (batchConfig.onBatchProgress) {
            batchConfig.onBatchProgress(completed, exports.length, progress);
          }
        };

        // Subscribe to individual export
        this.export({
          ...exportConfig,
          onProgress: exportProgress
        }).subscribe({
          next: (result) => {
            results[exportIndex] = result;
            completed++;
            inProgress.delete(exportIndex);

            this.batchProgressSubject.next({ 
              completed, 
              total: exports.length 
            });

            if (batchConfig.onBatchProgress) {
              batchConfig.onBatchProgress(completed, exports.length);
            }

            processNext();
          },
          error: (error) => {
            errors.push(error);
            results[exportIndex] = {
              success: false,
              error,
              metadata: { exportIndex, batchName: batchConfig.batchName }
            };
            
            completed++;
            inProgress.delete(exportIndex);

            if (!continueOnError) {
              observer.error(error);
              return;
            }

            processNext();
          }
        });

        // Continue with next export if concurrency allows
        setTimeout(() => processNext(), 0);
      };

      // Start processing
      processNext();
    });
  }

  /**
   * Cancel ongoing export operation
   */
  cancelExport(exportId?: string): void {
    if (exportId) {
      const currentExports = this._currentExports();
      currentExports.delete(exportId);
      this._currentExports.set(new Map(currentExports));
    } else {
      // Cancel all exports
      this._currentExports.set(new Map());
      this._isExporting.set(false);
      this.progressSubject.next(null);
    }
  }

  /**
   * Get supported formats for a specific component type
   */
  getSupportedFormats(componentType: 'grid' | 'editor' | 'chart'): ExportFormat[] {
    const baseFormats: ExportFormat[] = [
      ExportFormat.PDF,
      ExportFormat.CSV,
      ExportFormat.JSON,
      ExportFormat.PNG,
      ExportFormat.JPEG
    ];

    const formatMap: Record<string, ExportFormat[]> = {
      grid: [...baseFormats, ExportFormat.EXCEL, ExportFormat.GOOGLE_SHEETS],
      editor: [...baseFormats, ExportFormat.WORD, ExportFormat.HTML, ExportFormat.GOOGLE_DOCS],
      chart: [...baseFormats, ExportFormat.SVG]
    };

    return formatMap[componentType] || baseFormats;
  }

  /**
   * Check if a specific format is supported
   */
  isFormatSupported(format: ExportFormat): boolean {
    return Object.values(ExportFormat).includes(format);
  }

  /**
   * Get format-specific default options
   */
  getDefaultOptions(format: ExportFormat): Partial<ExportOptions> {
    const defaultOptions: Record<ExportFormat, Partial<ExportOptions>> = {
      [ExportFormat.PDF]: {
        pdf: {
          format: 'a4',
          orientation: 'portrait',
          compress: true
        }
      },
      [ExportFormat.EXCEL]: {
        excel: {
          version: '2019',
          properties: { title: 'Export Data' }
        }
      },
      [ExportFormat.WORD]: {
        word: {
          version: '2019',
          properties: { title: 'Export Document' }
        }
      },
      [ExportFormat.CSV]: {
        csv: {
          separator: ',',
          quote: '\"',
          recordSeparator: '\\n'
        }
      },
      [ExportFormat.JSON]: {
        json: {
          indent: 2,
          arrayFormat: 'objects'
        }
      },
      [ExportFormat.PNG]: {
        image: {
          format: 'png',
          quality: 0.9,
          pixelRatio: 2
        }
      },
      [ExportFormat.JPEG]: {
        image: {
          format: 'jpeg',
          quality: 0.85,
          pixelRatio: 2
        }
      },
      [ExportFormat.SVG]: {
        image: {
          format: 'svg'
        }
      },
      [ExportFormat.GOOGLE_SHEETS]: {
        google: {
          sheets: {
            sharing: { type: 'private', role: 'writer' }
          }
        }
      },
      [ExportFormat.GOOGLE_DOCS]: {
        google: {
          docs: {
            sharing: { type: 'private', role: 'writer' }
          }
        }
      },
      [ExportFormat.HTML]: {},
      [ExportFormat.XML]: {}
    };

    return defaultOptions[format] || {};
  }

  /**
   * Clear export history
   */
  clearHistory(): void {
    this._exportHistory.set([]);
  }

  /**
   * Get export statistics
   */
  getExportStats(): {
    totalExports: number;
    successfulExports: number;
    failedExports: number;
    averageExportTime: number;
    formatBreakdown: Record<string, number>;
  } {
    const history = this._exportHistory();
    const successful = history.filter(r => r.success);
    const failed = history.filter(r => !r.success);

    const formatBreakdown: Record<string, number> = {};
    history.forEach(result => {
      const format = result.metadata?.config?.format || 'unknown';
      formatBreakdown[format] = (formatBreakdown[format] || 0) + 1;
    });

    return {
      totalExports: history.length,
      successfulExports: successful.length,
      failedExports: failed.length,
      averageExportTime: this.averageExportTime(),
      formatBreakdown
    };
  }

  // Private helper methods

  private generateExportId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateConfig(config: ExportConfig): Error | null {
    if (!config.format) {
      return new Error('Export format is required');
    }

    if (!this.isFormatSupported(config.format)) {
      return new Error(`Unsupported export format: ${config.format}`);
    }

    if (!config.filename && config.format !== ExportFormat.GOOGLE_SHEETS && config.format !== ExportFormat.GOOGLE_DOCS) {
      return new Error('Filename is required for non-Google formats');
    }

    if (!config.data && !config.element) {
      return new Error('Either data or element must be provided');
    }

    return null;
  }

  private getExporter(format: ExportFormat): Observable<any> {
    const exporterMap: Record<ExportFormat, any> = {
      [ExportFormat.PDF]: this.pdfExporter,
      [ExportFormat.EXCEL]: this.excelExporter,
      [ExportFormat.WORD]: this.wordExporter,
      [ExportFormat.CSV]: this.csvExporter,
      [ExportFormat.JSON]: this.jsonExporter,
      [ExportFormat.PNG]: this.imageExporter,
      [ExportFormat.JPEG]: this.imageExporter,
      [ExportFormat.SVG]: this.imageExporter,
      [ExportFormat.GOOGLE_SHEETS]: this.googleExporter,
      [ExportFormat.GOOGLE_DOCS]: this.googleExporter,
      [ExportFormat.HTML]: this.csvExporter, // Temporary - will be replaced with HTMLExporter
      [ExportFormat.XML]: this.csvExporter   // Temporary - will be replaced with XMLExporter
    };

    const exporter = exporterMap[format];
    if (!exporter) {
      return throwError(() => new Error(`No exporter available for format: ${format}`));
    }

    return of(exporter);
  }

  private updateExportProgress(exportId: string, progress: ExportProgress): void {
    const currentExports = this._currentExports();
    currentExports.set(exportId, progress);
    this._currentExports.set(new Map(currentExports));
    
    this._globalProgress.set(progress);
    this.progressSubject.next(progress);
  }

  private cleanupExport(exportId: string): void {
    const currentExports = this._currentExports();
    currentExports.delete(exportId);
    this._currentExports.set(new Map(currentExports));
    
    if (currentExports.size === 0) {
      this._globalProgress.set(null);
      this.progressSubject.next(null);
    }
  }

  private processResult(result: any, config: ExportConfig, startTime: number): ExportResult {
    const duration = Date.now() - startTime;

    return {
      success: true,
      data: result.data || result,
      url: result.url,
      googleFileId: result.googleFileId,
      size: result.size,
      duration,
      metadata: {
        format: config.format,
        filename: config.filename,
        exportTime: new Date().toISOString(),
        config: {
          format: config.format,
          filename: config.filename
        }
      }
    };
  }

  private addToHistory(result: ExportResult): void {
    const history = [...this._exportHistory(), result];
    // Keep only last 100 exports
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    this._exportHistory.set(history);
  }

  private handleAutoDownload(result: ExportResult, config: ExportConfig): void {
    if (result.data instanceof Blob) {
      const extension = this.getFileExtension(config.format);
      const filename = `${config.filename}.${extension}`;
      this.fileDownloadService.downloadBlob(result.data, filename);
    } else if (typeof result.data === 'string') {
      const extension = this.getFileExtension(config.format);
      const filename = `${config.filename}.${extension}`;
      this.fileDownloadService.downloadText(result.data, filename);
    } else if (result.url) {
      this.fileDownloadService.downloadFromUrl(result.url, config.filename || 'download');
    }
  }

  private getFileExtension(format: ExportFormat): string {
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
}