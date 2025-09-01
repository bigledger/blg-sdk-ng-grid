/**
 * Public API Surface for @ng-ui/charts-core
 * Enhanced with comprehensive export capabilities
 */

// Core Chart Interfaces and Types
export * from './interfaces';

// Chart Components
export * from './charts-core/charts-core';

// Export Components and Services
export * from './components/chart-export.component';

// Export Services
export * from './services/chart-export.service';
export * from './services/image-export.service';
export * from './services/vector-export.service';
export * from './services/data-export.service';
export * from './services/presentation-export.service';
export * from './services/chart-3d-export.service';

// Export Utilities
export * from './utils/export-utils';

// Export Types and Interfaces (re-export for convenience)
export {
  ChartExportConfig,
  ChartExportFormat,
  ChartExportScope,
  ChartExportResult,
  ChartExportEvents,
  ChartExportPresets,
  ExportedFile,
  ImageExportOptions,
  VectorExportOptions,
  DataExportOptions,
  PresentationExportOptions,
  Chart3DExportOptions,
  BatchExportOptions,
  WatermarkConfig,
  IChartExportService
} from './interfaces/chart-export';