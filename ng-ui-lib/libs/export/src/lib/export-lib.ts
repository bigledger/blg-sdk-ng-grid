/**
 * Main export library module
 * 
 * This module provides a comprehensive export solution for Angular applications,
 * supporting multiple formats including PDF, Excel, Word, CSV, JSON, Images,
 * and Google Workspace integration.
 */

// Core exports
export * from './interfaces';
export * from './services';
export * from './exporters';
export * from './utils';

// Main service export for convenience
export { UnifiedExportService } from './services/unified-export.service';