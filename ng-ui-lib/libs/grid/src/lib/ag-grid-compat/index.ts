/**
 * ag-Grid Compatibility Layer for NgUiGrid
 * 
 * This module provides comprehensive ag-Grid compatibility for NgUiGrid,
 * allowing existing ag-Grid applications to migrate with minimal code changes.
 * 
 * Features:
 * - Full ag-Grid GridOptions interface compatibility
 * - Column definition mapping and conversion
 * - Event system compatibility with ag-Grid events
 * - API compatibility layer with ag-Grid methods
 * - Migration utilities and validation tools
 * - Backwards compatibility component
 */

// Core interfaces
export * from './ag-grid-options.interface';
export * from './ag-col-def.interface';
export * from './ag-grid-api.interface';
export * from './ag-column-api.interface';
export * from './ag-events.interface';

// Adapter classes
export * from './ag-grid-adapter';
export * from './column-def-adapter';
export * from './event-adapter';
export * from './api-adapter';

// Migration utilities
export * from './migration-utilities';

// Compatibility component
export * from './ng-ui-grid-compat.component';

// Convenience exports for common use cases
export {
  AgGridOptions,
  GridReadyEvent,
  RowClickedEvent,
  CellClickedEvent,
  SelectionChangedEvent
} from './ag-grid-options.interface';

export {
  AgColDef,
  AgColumnDef,
  AgColumnGroupDef
} from './ag-col-def.interface';

export {
  AgGridApi,
  RowDataTransaction,
  RowNode,
  CellPosition
} from './ag-grid-api.interface';

export {
  AgColumnApi,
  ColumnState,
  ApplyColumnStateParams
} from './ag-column-api.interface';

export {
  MigrationUtilities,
  NgUiGridCompatibleConfig,
  NgUiGridCompatibleInstance,
  MigrationReport,
  CompatibilityReport,
  MigrationChecklist,
  MigrationDocumentation
} from './migration-utilities';

/**
 * Factory function to create ag-Grid compatible grid
 * 
 * @param agGridOptions - ag-Grid configuration options
 * @param containerElement - Optional container element
 * @returns Compatible grid instance
 * 
 * @example
 * ```typescript
 * import { createAgGridCompatible } from '@ng-ui-kit/grid/ag-grid-compat';
 * 
 * const gridOptions: AgGridOptions = {
 *   rowData: myData,
 *   columnDefs: myColumns,
 *   enableSorting: true,
 *   enableFilter: true
 * };
 * 
 * const gridInstance = createAgGridCompatible(gridOptions);
 * console.log('API:', gridInstance.api);
 * console.log('Column API:', gridInstance.columnApi);
 * ```
 */
export function createAgGridCompatible(
  agGridOptions: AgGridOptions,
  containerElement?: HTMLElement
): NgUiGridCompatibleInstance {
  const migrationUtilities = new MigrationUtilities(
    new AgGridAdapter(),
    new ColumnDefAdapter(),
    new EventAdapter(),
    new ApiAdapter()
  );
  
  return migrationUtilities.createCompatibleGridInstance(agGridOptions, containerElement);
}

/**
 * Validates ag-Grid configuration for NgUiGrid compatibility
 * 
 * @param agGridOptions - ag-Grid configuration to validate
 * @returns Compatibility report with warnings and recommendations
 * 
 * @example
 * ```typescript
 * import { validateAgGridCompatibility } from '@ng-ui-kit/grid/ag-grid-compat';
 * 
 * const report = validateAgGridCompatibility(myGridOptions);
 * console.log('Compatibility Score:', report.compatibilityScore);
 * console.log('Warnings:', report.warnings);
 * ```
 */
export function validateAgGridCompatibility(agGridOptions: AgGridOptions): CompatibilityReport {
  const migrationUtilities = new MigrationUtilities(
    new AgGridAdapter(),
    new ColumnDefAdapter(),
    new EventAdapter(),
    new ApiAdapter()
  );
  
  return migrationUtilities.validateCompatibility(agGridOptions);
}

/**
 * Migrates ag-Grid configuration to NgUiGrid format
 * 
 * @param agGridOptions - ag-Grid configuration to migrate
 * @returns Migrated configuration and metadata
 * 
 * @example
 * ```typescript
 * import { migrateAgGridOptions } from '@ng-ui-kit/grid/ag-grid-compat';
 * 
 * const migration = migrateAgGridOptions(myAgGridOptions);
 * console.log('Grid Config:', migration.gridConfig);
 * console.log('Column Defs:', migration.columnDefs);
 * console.log('Warnings:', migration.warnings);
 * ```
 */
export function migrateAgGridOptions(agGridOptions: AgGridOptions) {
  const migrationUtilities = new MigrationUtilities(
    new AgGridAdapter(),
    new ColumnDefAdapter(),
    new EventAdapter(),
    new ApiAdapter()
  );
  
  return migrationUtilities.migrateGridOptions(agGridOptions);
}

/**
 * Generates comprehensive migration documentation
 * 
 * @param agGridOptions - ag-Grid configuration to document
 * @returns Complete migration documentation
 * 
 * @example
 * ```typescript
 * import { generateMigrationDoc } from '@ng-ui-kit/grid/ag-grid-compat';
 * 
 * const doc = generateMigrationDoc(myAgGridOptions);
 * console.log('Migration Checklist:', doc.migrationChecklist);
 * console.log('Code Examples:', doc.codeExamples);
 * ```
 */
export function generateMigrationDoc(agGridOptions: AgGridOptions): MigrationDocumentation {
  const migrationUtilities = new MigrationUtilities(
    new AgGridAdapter(),
    new ColumnDefAdapter(),
    new EventAdapter(),
    new ApiAdapter()
  );
  
  return migrationUtilities.generateMigrationDocumentation(agGridOptions);
}

/**
 * Default export for the compatibility layer
 */
export default {
  createAgGridCompatible,
  validateAgGridCompatibility,
  migrateAgGridOptions,
  generateMigrationDoc,
  
  // Component and utilities
  NgUiGridCompatComponent,
  MigrationUtilities,
  AgGridAdapter,
  ColumnDefAdapter,
  EventAdapter,
  ApiAdapter
};