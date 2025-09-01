import { Injectable, inject } from '@angular/core';
import { 
  ChartExportConfig, 
  ChartExportFormat, 
  ChartExportResult, 
  ChartExportEvents,
  ExportedFile,
  ExportResultMetadata,
  BatchExportOptions,
  IChartExportService,
  ImageExportOptions,
  VectorExportOptions,
  DataExportOptions,
  PresentationExportOptions,
  Chart3DExportOptions
} from '../interfaces/chart-export';
import { ImageExportService } from './image-export.service';
import { VectorExportService } from './vector-export.service';
import { DataExportService } from './data-export.service';
import { PresentationExportService } from './presentation-export.service';
import { Chart3DExportService } from './chart-3d-export.service';

/**
 * Main Chart Export Service
 * Coordinates all export functionality and delegates to specialized services
 */
@Injectable({
  providedIn: 'root'
})
export class ChartExportService implements IChartExportService {
  private imageExportService = inject(ImageExportService);
  private vectorExportService = inject(VectorExportService);
  private dataExportService = inject(DataExportService);
  private presentationExportService = inject(PresentationExportService);
  private chart3DExportService = inject(Chart3DExportService);

  private activeExports = new Map<string, AbortController>();
  private exportCounter = 0;

  /** Event callbacks */
  private events: ChartExportEvents = {};

  /**
   * Set event callbacks for export operations
   */
  setEventCallbacks(events: ChartExportEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Export a chart with the given configuration
   */
  async exportChart(config: ChartExportConfig): Promise<ChartExportResult> {
    const exportId = this.generateExportId();
    const abortController = new AbortController();
    this.activeExports.set(exportId, abortController);

    const startTime = Date.now();
    
    try {
      // Validate configuration
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid export configuration: ${validation.errors.join(', ')}`);
      }

      // Notify export start
      this.events.onExportStart?.(config);

      // Update progress
      this.updateProgress(exportId, {
        currentStep: 1,
        totalSteps: 4,
        stepDescription: 'Preparing export...',
        percentage: 25
      });

      // Get appropriate export service
      const exportService = this.getExportService(config.format);
      
      // Update progress
      this.updateProgress(exportId, {
        currentStep: 2,
        totalSteps: 4,
        stepDescription: 'Rendering chart...',
        percentage: 50
      });

      // Perform the actual export
      const exportResult = await exportService.export(config, abortController.signal);

      // Update progress
      this.updateProgress(exportId, {
        currentStep: 3,
        totalSteps: 4,
        stepDescription: 'Generating file...',
        percentage: 75
      });

      // Create result metadata
      const endTime = Date.now();
      const metadata: ExportResultMetadata = {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: endTime - startTime,
        chartConfig: config,
        dataSummary: {
          totalDataPoints: 0, // Will be populated by specific services
          seriesCount: 0,
          dateRange: undefined
        },
        exportConfig: config
      };

      const result: ChartExportResult = {
        success: true,
        files: [exportResult],
        metadata,
        performance: {
          renderTime: 0,
          processingTime: endTime - startTime,
          fileGenerationTime: 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };

      // Final progress update
      this.updateProgress(exportId, {
        currentStep: 4,
        totalSteps: 4,
        stepDescription: 'Complete!',
        percentage: 100
      });

      // Notify completion
      this.events.onExportComplete?.(result);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const result: ChartExportResult = {
        success: false,
        error: errorMessage,
        files: [],
        metadata: {
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime,
          chartConfig: config,
          dataSummary: { totalDataPoints: 0, seriesCount: 0 },
          exportConfig: config
        }
      };

      this.events.onExportError?.(errorMessage, config);
      return result;

    } finally {
      this.activeExports.delete(exportId);
    }
  }

  /**
   * Export multiple charts in batch
   */
  async batchExport(configs: ChartExportConfig[], batchOptions: BatchExportOptions): Promise<ChartExportResult[]> {
    const results: ChartExportResult[] = [];
    const totalCharts = configs.length;

    try {
      if (batchOptions.parallelExport) {
        // Parallel export
        const promises = configs.map((config, index) => {
          return this.exportChart(config).then(result => {
            batchOptions.onProgress?.({
              currentStep: index + 1,
              totalSteps: totalCharts,
              stepDescription: `Exported ${index + 1} of ${totalCharts} charts`,
              percentage: ((index + 1) / totalCharts) * 100
            });
            return result;
          });
        });

        const parallelResults = await Promise.all(promises);
        results.push(...parallelResults);

      } else {
        // Sequential export
        for (let i = 0; i < configs.length; i++) {
          const config = configs[i];
          const result = await this.exportChart(config);
          results.push(result);

          batchOptions.onProgress?.({
            currentStep: i + 1,
            totalSteps: totalCharts,
            stepDescription: `Exported ${i + 1} of ${totalCharts} charts`,
            percentage: ((i + 1) / totalCharts) * 100
          });
        }
      }

      // Create archive if requested
      if (batchOptions.createArchive) {
        const allFiles = results.flatMap(r => r.files);
        const archiveFile = await this.createArchive(allFiles, batchOptions.archiveFormat || 'zip');
        
        // Return single result with archive
        return [{
          success: true,
          files: [archiveFile],
          metadata: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
            chartConfig: configs[0], // Use first config as representative
            dataSummary: { totalDataPoints: 0, seriesCount: configs.length },
            exportConfig: configs[0]
          }
        }];
      }

      return results;

    } catch (error) {
      throw new Error(`Batch export failed: ${error}`);
    }
  }

  /**
   * Get supported export formats for a chart type
   */
  getSupportedFormats(chartType: string): ChartExportFormat[] {
    const baseFormats: ChartExportFormat[] = ['png', 'jpeg', 'svg', 'pdf', 'csv', 'json'];
    
    // Add format-specific support
    switch (chartType.toLowerCase()) {
      case '3d':
      case 'bar-3d':
      case 'scatter-3d':
      case 'surface-3d':
        return [...baseFormats, 'excel', 'powerpoint'];
      
      case 'bar':
      case 'line':
      case 'area':
      case 'pie':
        return [...baseFormats, 'excel', 'powerpoint'];
      
      case 'dashboard':
      case 'bi':
        return [...baseFormats, 'excel', 'powerpoint', 'html'];
      
      default:
        return baseFormats;
    }
  }

  /**
   * Get default export configuration for a format
   */
  getDefaultConfig(format: ChartExportFormat): ChartExportConfig {
    return {
      format,
      scope: 'visible',
      filename: `chart-${format}`,
      includeMetadata: true,
      includeDataSource: true,
      timestamp: true,
      formatOptions: this.getDefaultFormatOptions(format)
    };
  }

  /**
   * Validate export configuration
   */
  validateConfig(config: ChartExportConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!config.format) {
      errors.push('Export format is required');
    }

    if (!config.filename) {
      errors.push('Filename is required');
    }

    if (!config.scope) {
      errors.push('Export scope is required');
    }

    // Validate format-specific options
    if (config.formatOptions) {
      const formatErrors = this.validateFormatOptions(config.format, config.formatOptions);
      errors.push(...formatErrors);
    }

    // Validate filename (no special characters)
    if (config.filename && !/^[a-zA-Z0-9-_\s]+$/.test(config.filename)) {
      errors.push('Filename contains invalid characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get export preview
   */
  async getPreview(config: ChartExportConfig): Promise<string> {
    const exportService = this.getExportService(config.format);
    
    if ('getPreview' in exportService && typeof exportService.getPreview === 'function') {
      return await exportService.getPreview(config);
    } else {
      throw new Error(`Preview not supported for format: ${config.format}`);
    }
  }

  /**
   * Cancel ongoing export
   */
  cancelExport(exportId: string): void {
    const abortController = this.activeExports.get(exportId);
    if (abortController) {
      abortController.abort();
      this.activeExports.delete(exportId);
      this.events.onExportCancel?.(exportId);
    }
  }

  /**
   * Get appropriate export service for format
   */
  private getExportService(format: ChartExportFormat): any {
    switch (format) {
      case 'png':
      case 'jpeg':
        return this.imageExportService;
      
      case 'svg':
      case 'pdf':
        return this.vectorExportService;
      
      case 'csv':
      case 'json':
      case 'excel':
        return this.dataExportService;
      
      case 'powerpoint':
        return this.presentationExportService;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get default format options for a specific format
   */
  private getDefaultFormatOptions(format: ChartExportFormat): any {
    switch (format) {
      case 'png':
        return {
          quality: 0.95,
          dpi: 150,
          scaleFactor: 1,
          backgroundColor: 'transparent',
          includeAnimationFrames: false
        } as ImageExportOptions;

      case 'jpeg':
        return {
          quality: 0.9,
          dpi: 150,
          scaleFactor: 1,
          backgroundColor: 'white',
          includeAnimationFrames: false
        } as ImageExportOptions;

      case 'svg':
        return {
          embedFonts: true,
          embedStyles: true,
          optimizationLevel: 'basic'
        } as VectorExportOptions;

      case 'pdf':
        return {
          embedFonts: true,
          embedStyles: true,
          pdfOptions: {
            pageSize: 'A4',
            orientation: 'landscape',
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            includeInteractiveElements: false,
            includeBookmarks: false,
            multiPage: false,
            chartsPerPage: 1
          }
        } as VectorExportOptions;

      case 'excel':
        return {
          includeRawData: true,
          includeAggregatedData: false,
          includeStatistics: false,
          dataFormat: 'flat',
          excelOptions: {
            worksheetName: 'Chart Data',
            includeChartImage: true,
            createNativeChart: false,
            multipleWorksheets: false,
            worksheetPerSeries: false,
            includePivotTables: false,
            autoSizeColumns: true,
            applyFormatting: true,
            headerStyle: {
              font: { bold: true, italic: false, color: '#000000', size: 12, family: 'Arial' },
              fill: { backgroundColor: '#f0f0f0', pattern: 'solid' },
              border: { top: true, right: true, bottom: true, left: true, color: '#000000', style: 'thin' },
              alignment: { horizontal: 'center', vertical: 'middle', wrapText: false },
              numberFormat: 'General'
            },
            dataStyle: {
              font: { bold: false, italic: false, color: '#000000', size: 11, family: 'Arial' },
              fill: { backgroundColor: '#ffffff', pattern: 'solid' },
              border: { top: false, right: true, bottom: false, left: false, color: '#cccccc', style: 'thin' },
              alignment: { horizontal: 'left', vertical: 'middle', wrapText: false },
              numberFormat: 'General'
            }
          }
        } as DataExportOptions;

      case 'powerpoint':
        return {
          template: 'default',
          slideLayout: 'title-and-chart',
          includeSpeakerNotes: false,
          chartPlacement: { x: 50, y: 100, width: 600, height: 400 },
          includeDataTable: false,
          chartsPerSlide: 1,
          slideTransitions: false,
          chartAnimations: false
        } as PresentationExportOptions;

      default:
        return {};
    }
  }

  /**
   * Validate format-specific options
   */
  private validateFormatOptions(format: ChartExportFormat, options: any): string[] {
    const errors: string[] = [];

    switch (format) {
      case 'png':
      case 'jpeg':
        if (options.quality && (options.quality < 0.1 || options.quality > 1.0)) {
          errors.push('Image quality must be between 0.1 and 1.0');
        }
        if (options.dpi && options.dpi < 72) {
          errors.push('DPI must be at least 72');
        }
        break;

      case 'pdf':
        if (options.pdfOptions?.margins) {
          const margins = options.pdfOptions.margins;
          if (margins.top < 0 || margins.right < 0 || margins.bottom < 0 || margins.left < 0) {
            errors.push('PDF margins must be positive values');
          }
        }
        break;

      case 'excel':
        if (options.excelOptions?.worksheetName && options.excelOptions.worksheetName.length > 31) {
          errors.push('Excel worksheet name must be 31 characters or less');
        }
        break;
    }

    return errors;
  }

  /**
   * Generate unique export ID
   */
  private generateExportId(): string {
    return `export_${++this.exportCounter}_${Date.now()}`;
  }

  /**
   * Update export progress
   */
  private updateProgress(exportId: string, progress: any): void {
    this.events.onExportProgress?.(progress);
  }

  /**
   * Create archive from multiple files
   */
  private async createArchive(files: ExportedFile[], format: 'zip' | 'tar' | '7z'): Promise<ExportedFile> {
    // This would typically use a library like JSZip for zip files
    // For now, return a placeholder implementation
    
    const archiveBlob = new Blob([], { type: 'application/zip' });
    
    return {
      filename: `chart-exports.${format}`,
      format: format as any,
      size: archiveBlob.size,
      data: archiveBlob,
      mimeType: format === 'zip' ? 'application/zip' : 'application/octet-stream',
      createdAt: new Date()
    };
  }
}