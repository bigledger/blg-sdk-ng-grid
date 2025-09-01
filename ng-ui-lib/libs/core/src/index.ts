// Core component
export * from './lib/core/core';

// Common Types
export * from './lib/types/ngui-common.types';

// Component Configuration Interfaces
export * from './lib/interfaces/ngui-grid-config.interface';
export * from './lib/interfaces/ngui-editor-config.interface';
export * from './lib/interfaces/ngui-chart-config.interface';

// Legacy interfaces (for backward compatibility)
export * from './lib/interfaces/grid-config.interface';
export * from './lib/interfaces/column-definition.interface';
export * from './lib/interfaces/grid-event.interface';
export * from './lib/interfaces/grouping.interface';
export * from './lib/interfaces/export.interface';

// ag-Grid compatibility interfaces
export * from './lib/interfaces/ag-grid-compat.interface';

// Services with NgUi naming
export { GridStateService as NgUiGridStateService } from './lib/services/grid-state.service';
export { GroupingService as NgUiGroupingService } from './lib/services/grouping.service';
export { ExportService as NgUiExportService } from './lib/services/export.service';

// ag-Grid compatibility services
export * from './lib/services/grid-api.service';
export * from './lib/services/column-api.service';
export * from './lib/services/cell-renderer.service';

// Legacy service exports (for backward compatibility)
export * from './lib/services/grid-state.service';
export * from './lib/services/grouping.service';
export * from './lib/services/export.service';
