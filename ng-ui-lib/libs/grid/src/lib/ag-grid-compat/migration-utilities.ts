import { Injectable } from '@angular/core';
import { AgGridOptions } from './ag-grid-options.interface';
import { AgColDef, AgColumnDef } from './ag-col-def.interface';
import { AgGridAdapter } from './ag-grid-adapter';
import { ColumnDefAdapter } from './column-def-adapter';
import { EventAdapter } from './event-adapter';
import { ApiAdapter } from './api-adapter';
import { GridConfig } from '@blg-grid/core';
import { ColumnDefinition } from '@blg-grid/core';

/**
 * Migration utilities for converting ag-Grid configurations to NgUiGrid
 */
@Injectable({
  providedIn: 'root'
})
export class MigrationUtilities {
  
  constructor(
    private gridAdapter: AgGridAdapter,
    private columnAdapter: ColumnDefAdapter,
    private eventAdapter: EventAdapter,
    private apiAdapter: ApiAdapter
  ) {}
  
  /**
   * Migrates ag-Grid GridOptions to NgUiGrid configuration
   */
  migrateGridOptions(agOptions: AgGridOptions): {
    gridConfig: GridConfig;
    columnDefs: ColumnDefinition[];
    rowData: any[];
    warnings: string[];
    unsupportedFeatures: string[];
  } {
    // Validate configuration first
    const validation = this.gridAdapter.validateConfiguration(agOptions);
    
    // Convert grid options
    const gridConfig = this.gridAdapter.convertGridOptions(agOptions);
    
    // Handle column definitions
    let columnDefs: ColumnDefinition[] = [];
    if (agOptions.columnDefs) {
      // Apply default column definition if provided
      const processedColumnDefs = this.gridAdapter.applyDefaultColDef(
        agOptions.columnDefs, 
        agOptions.defaultColDef
      );
      
      columnDefs = this.columnAdapter.convertColumnDefs(processedColumnDefs);
    }
    
    // Extract row data
    const rowData = this.gridAdapter.getRowData(agOptions);
    
    // Generate compatibility report for columns
    const columnReport = agOptions.columnDefs 
      ? this.columnAdapter.generateCompatibilityReport(agOptions.columnDefs)
      : { totalColumns: 0, compatibleColumns: 0, warnings: [], unsupportedFeatures: [] };
    
    return {
      gridConfig,
      columnDefs,
      rowData,
      warnings: [...validation.warnings, ...columnReport.warnings],
      unsupportedFeatures: columnReport.unsupportedFeatures
    };
  }
  
  /**
   * Migrates ag-Grid column definitions only
   */
  migrateColumnDefs(agColumnDefs: AgColumnDef[], defaultColDef?: AgColDef): {
    columnDefs: ColumnDefinition[];
    warnings: string[];
    unsupportedFeatures: string[];
  } {
    // Apply default column definition
    const processedColumnDefs = defaultColDef 
      ? this.gridAdapter.applyDefaultColDef(agColumnDefs, defaultColDef)
      : agColumnDefs;
    
    // Convert column definitions
    const columnDefs = this.columnAdapter.convertColumnDefs(processedColumnDefs);
    
    // Generate compatibility report
    const report = this.columnAdapter.generateCompatibilityReport(processedColumnDefs);
    
    return {
      columnDefs,
      warnings: report.warnings,
      unsupportedFeatures: report.unsupportedFeatures
    };
  }
  
  /**
   * Migrates ag-Grid event handlers to NgUiGrid format
   */
  migrateEvents(agOptions: AgGridOptions): {
    eventHandlers: { [eventType: string]: Function[] };
    warnings: string[];
  } {
    const eventHandlers: { [eventType: string]: Function[] } = {};
    const warnings: string[] = [];
    const supportedEvents = this.eventAdapter.getSupportedEventTypes();
    const unsupportedEvents = this.eventAdapter.getUnsupportedEventTypes();
    
    // Map ag-Grid event handlers to NgUiGrid events
    Object.entries(agOptions).forEach(([key, handler]) => {
      if (key.startsWith('on') && typeof handler === 'function') {
        const eventType = this.getEventTypeFromHandler(key);
        
        if (supportedEvents.includes(eventType as any)) {
          if (!eventHandlers[eventType]) {
            eventHandlers[eventType] = [];
          }
          eventHandlers[eventType].push(handler);
        } else if (unsupportedEvents[eventType]) {
          warnings.push(`Event handler ${key}: ${unsupportedEvents[eventType]}`);
        } else {
          warnings.push(`Event handler ${key}: Unknown event type`);
        }
      }
    });
    
    return { eventHandlers, warnings };
  }
  
  /**
   * Creates a complete compatible grid configuration
   */
  createCompatibleGrid(agOptions: AgGridOptions): {
    config: NgUiGridCompatibleConfig;
    api: any;
    columnApi: any;
    warnings: string[];
    migrationReport: MigrationReport;
  } {
    // Migrate all components
    const gridMigration = this.migrateGridOptions(agOptions);
    const eventMigration = this.migrateEvents(agOptions);
    
    // Create compatible configuration
    const config: NgUiGridCompatibleConfig = {
      gridConfig: gridMigration.gridConfig,
      columnDefs: gridMigration.columnDefs,
      rowData: gridMigration.rowData,
      eventHandlers: eventMigration.eventHandlers,
      agGridOptions: agOptions // Keep original for reference
    };
    
    // Setup APIs
    const api = this.apiAdapter;
    const columnApi = this.apiAdapter; // Same instance for both APIs
    
    // Setup event adapter
    this.eventAdapter.setApis(api, columnApi);
    
    // Create migration report
    const migrationReport: MigrationReport = {
      totalFeatures: this.countAgGridFeatures(agOptions),
      supportedFeatures: this.countSupportedFeatures(agOptions),
      partiallySupported: this.countPartiallySupported(agOptions),
      unsupported: this.countUnsupportedFeatures(agOptions),
      warnings: [...gridMigration.warnings, ...eventMigration.warnings],
      unsupportedFeatures: gridMigration.unsupportedFeatures,
      recommendations: this.generateRecommendations(agOptions),
      migrationComplexity: this.assessMigrationComplexity(agOptions)
    };
    
    return {
      config,
      api,
      columnApi,
      warnings: migrationReport.warnings,
      migrationReport
    };
  }
  
  /**
   * Factory function to create a compatible grid instance
   */
  createCompatibleGridInstance(
    agOptions: AgGridOptions,
    containerElement?: HTMLElement
  ): NgUiGridCompatibleInstance {
    const migration = this.createCompatibleGrid(agOptions);
    
    return {
      gridOptions: migration.config,
      api: migration.api,
      columnApi: migration.columnApi,
      eventAdapter: this.eventAdapter,
      destroy: () => {
        migration.api.destroy();
        this.eventAdapter.destroy();
      },
      getCompatibilityReport: () => migration.migrationReport,
      updateGridOptions: (newOptions: Partial<AgGridOptions>) => {
        const updatedOptions = { ...agOptions, ...newOptions };
        return this.createCompatibleGrid(updatedOptions);
      }
    };
  }
  
  /**
   * Validates ag-Grid configuration for NgUiGrid compatibility
   */
  validateCompatibility(agOptions: AgGridOptions): CompatibilityReport {
    const gridValidation = this.gridAdapter.validateConfiguration(agOptions);
    const columnValidation = agOptions.columnDefs 
      ? this.columnAdapter.generateCompatibilityReport(agOptions.columnDefs)
      : { totalColumns: 0, compatibleColumns: 0, warnings: [], unsupportedFeatures: [] };
    
    const unsupportedGridFeatures = this.identifyUnsupportedGridFeatures(agOptions);
    const missingFeatures = this.identifyMissingFeatures(agOptions);
    
    return {
      isFullyCompatible: gridValidation.valid && columnValidation.compatibleColumns === columnValidation.totalColumns,
      isPartiallyCompatible: !gridValidation.valid || columnValidation.compatibleColumns < columnValidation.totalColumns,
      compatibilityScore: this.calculateCompatibilityScore(agOptions),
      totalFeatures: this.countAgGridFeatures(agOptions),
      supportedFeatures: this.countSupportedFeatures(agOptions),
      partiallySupported: this.countPartiallySupported(agOptions),
      unsupportedFeatures: [...columnValidation.unsupportedFeatures, ...unsupportedGridFeatures],
      missingFeatures,
      warnings: [...gridValidation.warnings, ...columnValidation.warnings],
      recommendations: this.generateCompatibilityRecommendations(agOptions),
      estimatedMigrationEffort: this.estimateMigrationEffort(agOptions)
    };
  }
  
  /**
   * Generates a migration checklist
   */
  generateMigrationChecklist(agOptions: AgGridOptions): MigrationChecklist {
    const validation = this.validateCompatibility(agOptions);
    
    const checklist: MigrationChecklistItem[] = [];
    
    // Data migration tasks
    checklist.push({
      category: 'Data Migration',
      task: 'Convert row data format',
      required: true,
      completed: false,
      description: 'Ensure row data is compatible with NgUiGrid format',
      estimatedTime: '1-2 hours'
    });
    
    // Column definition migration
    if (agOptions.columnDefs && agOptions.columnDefs.length > 0) {
      checklist.push({
        category: 'Column Configuration',
        task: 'Convert column definitions',
        required: true,
        completed: false,
        description: `Convert ${agOptions.columnDefs.length} column definitions to NgUiGrid format`,
        estimatedTime: `${Math.ceil(agOptions.columnDefs.length / 5)} hours`
      });
    }
    
    // Event handler migration
    const eventHandlers = Object.keys(agOptions).filter(key => key.startsWith('on'));
    if (eventHandlers.length > 0) {
      checklist.push({
        category: 'Event Handling',
        task: 'Migrate event handlers',
        required: false,
        completed: false,
        description: `Update ${eventHandlers.length} event handlers for NgUiGrid compatibility`,
        estimatedTime: `${Math.ceil(eventHandlers.length / 3)} hours`
      });
    }
    
    // Custom renderers/editors
    const customComponents = this.identifyCustomComponents(agOptions);
    if (customComponents.length > 0) {
      checklist.push({
        category: 'Custom Components',
        task: 'Migrate custom components',
        required: false,
        completed: false,
        description: `Adapt ${customComponents.length} custom components to NgUiGrid`,
        estimatedTime: `${customComponents.length * 2} hours`
      });
    }
    
    // Feature-specific tasks
    if (agOptions.pagination) {
      checklist.push({
        category: 'Features',
        task: 'Configure pagination',
        required: false,
        completed: false,
        description: 'Set up pagination in NgUiGrid',
        estimatedTime: '30 minutes'
      });
    }
    
    if (agOptions.enableFilter) {
      checklist.push({
        category: 'Features',
        task: 'Configure filtering',
        required: false,
        completed: false,
        description: 'Set up column filtering in NgUiGrid',
        estimatedTime: '1 hour'
      });
    }
    
    if (agOptions.enableSorting) {
      checklist.push({
        category: 'Features',
        task: 'Configure sorting',
        required: false,
        completed: false,
        description: 'Set up column sorting in NgUiGrid',
        estimatedTime: '30 minutes'
      });
    }
    
    // Testing tasks
    checklist.push({
      category: 'Testing',
      task: 'Test basic functionality',
      required: true,
      completed: false,
      description: 'Verify grid displays data correctly with basic operations',
      estimatedTime: '2-3 hours'
    });
    
    checklist.push({
      category: 'Testing',
      task: 'Test advanced features',
      required: false,
      completed: false,
      description: 'Verify all migrated features work as expected',
      estimatedTime: '3-4 hours'
    });
    
    return {
      items: checklist,
      totalTasks: checklist.length,
      requiredTasks: checklist.filter(item => item.required).length,
      estimatedTotalTime: this.calculateTotalEstimatedTime(checklist),
      migrationPhases: this.organizeMigrationPhases(checklist)
    };
  }
  
  /**
   * Generates migration documentation
   */
  generateMigrationDocumentation(agOptions: AgGridOptions): MigrationDocumentation {
    const compatibility = this.validateCompatibility(agOptions);
    const checklist = this.generateMigrationChecklist(agOptions);
    const migration = this.migrateGridOptions(agOptions);
    
    return {
      summary: {
        originalConfig: agOptions,
        migratedConfig: {
          gridConfig: migration.gridConfig,
          columnDefs: migration.columnDefs,
          rowData: migration.rowData
        },
        compatibilityScore: compatibility.compatibilityScore,
        migrationComplexity: this.assessMigrationComplexity(agOptions)
      },
      detailedChanges: this.generateDetailedChanges(agOptions, migration),
      unsupportedFeatures: compatibility.unsupportedFeatures.map(feature => ({
        feature,
        alternative: this.getAlternativeSolution(feature),
        workaround: this.getWorkaroundSolution(feature)
      })),
      codeExamples: this.generateCodeExamples(agOptions, migration),
      migrationChecklist: checklist,
      troubleshooting: this.generateTroubleshootingGuide(agOptions),
      testingGuidelines: this.generateTestingGuidelines(agOptions)
    };
  }
  
  // Private helper methods
  
  private getEventTypeFromHandler(handlerName: string): string {
    // Convert 'onRowClicked' to 'rowClicked'
    return handlerName.substring(2, 3).toLowerCase() + handlerName.substring(3);
  }
  
  private countAgGridFeatures(agOptions: AgGridOptions): number {
    let count = 0;
    
    // Basic features
    if (agOptions.enableSorting) count++;
    if (agOptions.enableFilter) count++;
    if (agOptions.enableColResize) count++;
    if (agOptions.enableColReorder) count++;
    if (agOptions.rowSelection) count++;
    if (agOptions.pagination) count++;
    if (agOptions.rowGroupPanelShow) count++;
    
    // Column features
    if (agOptions.columnDefs) {
      agOptions.columnDefs.forEach(colDef => {
        if (colDef.cellRenderer) count++;
        if (colDef.cellEditor) count++;
        if (colDef.filter) count++;
        if (colDef.sortable) count++;
      });
    }
    
    return count;
  }
  
  private countSupportedFeatures(agOptions: AgGridOptions): number {
    // This would need to be implemented based on NgUiGrid capabilities
    return Math.floor(this.countAgGridFeatures(agOptions) * 0.7); // Assume 70% support
  }
  
  private countPartiallySupported(agOptions: AgGridOptions): number {
    return Math.floor(this.countAgGridFeatures(agOptions) * 0.2); // Assume 20% partial support
  }
  
  private countUnsupportedFeatures(agOptions: AgGridOptions): number {
    return this.countAgGridFeatures(agOptions) - this.countSupportedFeatures(agOptions) - this.countPartiallySupported(agOptions);
  }
  
  private generateRecommendations(agOptions: AgGridOptions): string[] {
    const recommendations: string[] = [];
    
    if (agOptions.rowModelType === 'infinite') {
      recommendations.push('Consider using client-side row model with virtual scrolling for better compatibility');
    }
    
    if (agOptions.enableContextMenu) {
      recommendations.push('Implement custom context menu using Angular components');
    }
    
    if (agOptions.treeData) {
      recommendations.push('Use row grouping instead of tree data for hierarchical display');
    }
    
    return recommendations;
  }
  
  private assessMigrationComplexity(agOptions: AgGridOptions): 'Low' | 'Medium' | 'High' {
    let complexityScore = 0;
    
    // Add points for complex features
    if (agOptions.rowModelType === 'serverSide') complexityScore += 3;
    if (agOptions.rowModelType === 'infinite') complexityScore += 2;
    if (agOptions.treeData) complexityScore += 3;
    if (agOptions.enableContextMenu) complexityScore += 1;
    
    // Add points for custom components
    if (agOptions.columnDefs) {
      agOptions.columnDefs.forEach(colDef => {
        if (typeof colDef.cellRenderer === 'object') complexityScore += 2;
        if (typeof colDef.cellEditor === 'object') complexityScore += 2;
        if (typeof colDef.filter === 'object') complexityScore += 1;
      });
    }
    
    if (complexityScore >= 10) return 'High';
    if (complexityScore >= 5) return 'Medium';
    return 'Low';
  }
  
  private identifyUnsupportedGridFeatures(agOptions: AgGridOptions): string[] {
    const unsupported: string[] = [];
    
    if (agOptions.rowModelType === 'serverSide') unsupported.push('Server-side row model');
    if (agOptions.treeData) unsupported.push('Tree data');
    if (agOptions.enableContextMenu) unsupported.push('Context menu');
    if (agOptions.enableClipboard) unsupported.push('Advanced clipboard operations');
    
    return unsupported;
  }
  
  private identifyMissingFeatures(agOptions: AgGridOptions): string[] {
    // Features that exist in ag-Grid but not in NgUiGrid
    return [
      'Master/Detail grids',
      'Integrated charting',
      'Excel-like range selection',
      'Advanced filtering UI',
      'Tool panels',
      'Status bar'
    ];
  }
  
  private calculateCompatibilityScore(agOptions: AgGridOptions): number {
    const total = this.countAgGridFeatures(agOptions);
    const supported = this.countSupportedFeatures(agOptions);
    const partial = this.countPartiallySupported(agOptions);
    
    return Math.round(((supported + partial * 0.5) / total) * 100);
  }
  
  private generateCompatibilityRecommendations(agOptions: AgGridOptions): string[] {
    const recommendations: string[] = [];
    
    const score = this.calculateCompatibilityScore(agOptions);
    
    if (score >= 80) {
      recommendations.push('High compatibility - migration should be straightforward');
    } else if (score >= 60) {
      recommendations.push('Good compatibility - some features may need workarounds');
      recommendations.push('Consider simplifying complex features during migration');
    } else {
      recommendations.push('Limited compatibility - significant changes may be required');
      recommendations.push('Consider redesigning the grid implementation for better compatibility');
    }
    
    return recommendations;
  }
  
  private estimateMigrationEffort(agOptions: AgGridOptions): 'Low' | 'Medium' | 'High' {
    const score = this.calculateCompatibilityScore(agOptions);
    const complexity = this.assessMigrationComplexity(agOptions);
    
    if (score >= 80 && complexity === 'Low') return 'Low';
    if (score >= 60 && complexity !== 'High') return 'Medium';
    return 'High';
  }
  
  private identifyCustomComponents(agOptions: AgGridOptions): string[] {
    const components: string[] = [];
    
    if (agOptions.columnDefs) {
      agOptions.columnDefs.forEach((colDef, index) => {
        if (typeof colDef.cellRenderer === 'object') {
          components.push(`Column ${index} custom cell renderer`);
        }
        if (typeof colDef.cellEditor === 'object') {
          components.push(`Column ${index} custom cell editor`);
        }
        if (typeof colDef.filter === 'object') {
          components.push(`Column ${index} custom filter`);
        }
      });
    }
    
    return components;
  }
  
  private calculateTotalEstimatedTime(checklist: MigrationChecklistItem[]): string {
    // Simple time calculation - would need more sophisticated parsing
    const totalHours = checklist.reduce((total, item) => {
      const timeStr = item.estimatedTime;
      const hours = parseFloat(timeStr.match(/\d+/)?.[0] || '1');
      return total + hours;
    }, 0);
    
    return `${totalHours} hours`;
  }
  
  private organizeMigrationPhases(checklist: MigrationChecklistItem[]): MigrationPhase[] {
    return [
      {
        name: 'Phase 1: Data Migration',
        tasks: checklist.filter(item => item.category === 'Data Migration'),
        description: 'Convert data structures and basic configuration'
      },
      {
        name: 'Phase 2: Feature Migration',
        tasks: checklist.filter(item => ['Column Configuration', 'Features'].includes(item.category)),
        description: 'Migrate grid features and column configurations'
      },
      {
        name: 'Phase 3: Advanced Features',
        tasks: checklist.filter(item => ['Event Handling', 'Custom Components'].includes(item.category)),
        description: 'Implement event handlers and custom components'
      },
      {
        name: 'Phase 4: Testing & Validation',
        tasks: checklist.filter(item => item.category === 'Testing'),
        description: 'Test and validate the migration'
      }
    ];
  }
  
  private generateDetailedChanges(agOptions: AgGridOptions, migration: any): DetailedChange[] {
    const changes: DetailedChange[] = [];
    
    // Grid configuration changes
    changes.push({
      category: 'Grid Configuration',
      property: 'gridOptions',
      before: JSON.stringify(agOptions, null, 2),
      after: JSON.stringify(migration.gridConfig, null, 2),
      reason: 'Converted ag-Grid options to NgUiGrid configuration format'
    });
    
    // Column definition changes
    if (agOptions.columnDefs) {
      changes.push({
        category: 'Column Definitions',
        property: 'columnDefs',
        before: JSON.stringify(agOptions.columnDefs, null, 2),
        after: JSON.stringify(migration.columnDefs, null, 2),
        reason: 'Converted ag-Grid column definitions to NgUiGrid format'
      });
    }
    
    return changes;
  }
  
  private getAlternativeSolution(feature: string): string {
    const alternatives: { [key: string]: string } = {
      'Server-side row model': 'Use client-side model with lazy loading',
      'Tree data': 'Use row grouping for hierarchical display',
      'Context menu': 'Implement custom context menu with Angular components',
      'Advanced clipboard operations': 'Use basic copy/paste with custom handlers'
    };
    
    return alternatives[feature] || 'No direct alternative available';
  }
  
  private getWorkaroundSolution(feature: string): string {
    const workarounds: { [key: string]: string } = {
      'Server-side row model': 'Load data in chunks and use pagination',
      'Tree data': 'Flatten data structure and use grouping',
      'Context menu': 'Add custom menu buttons or use right-click event handlers',
      'Advanced clipboard operations': 'Implement custom export/import functionality'
    };
    
    return workarounds[feature] || 'Custom implementation required';
  }
  
  private generateCodeExamples(agOptions: AgGridOptions, migration: any): CodeExample[] {
    const examples: CodeExample[] = [];
    
    // Before/After grid configuration
    examples.push({
      title: 'Grid Configuration Migration',
      description: 'How to convert ag-Grid options to NgUiGrid configuration',
      before: `// ag-Grid configuration
const gridOptions: GridOptions = ${JSON.stringify(agOptions, null, 2).substring(0, 500)}...
`,
      after: `// NgUiGrid configuration
const gridConfig: GridConfig = ${JSON.stringify(migration.gridConfig, null, 2)};
const columnDefs: ColumnDefinition[] = ${JSON.stringify(migration.columnDefs, null, 2).substring(0, 500)}...
`
    });
    
    return examples;
  }
  
  private generateTroubleshootingGuide(agOptions: AgGridOptions): TroubleshootingItem[] {
    return [
      {
        issue: 'Data not displaying',
        solution: 'Check that row data format matches column field definitions',
        commonCause: 'Mismatch between column field names and data property names'
      },
      {
        issue: 'Events not firing',
        solution: 'Verify event handler registration and event type mapping',
        commonCause: 'ag-Grid event names differ from NgUiGrid event names'
      },
      {
        issue: 'Styling issues',
        solution: 'Update CSS classes and theme configuration for NgUiGrid',
        commonCause: 'ag-Grid CSS classes are not compatible with NgUiGrid'
      }
    ];
  }
  
  private generateTestingGuidelines(agOptions: AgGridOptions): TestingGuideline[] {
    return [
      {
        category: 'Data Display',
        description: 'Verify that all data is displayed correctly',
        testCases: [
          'Check that all rows are visible',
          'Verify column headers match data',
          'Test with empty data set'
        ]
      },
      {
        category: 'Interactions',
        description: 'Test all interactive features',
        testCases: [
          'Click on cells and rows',
          'Test sorting functionality',
          'Test filtering if enabled',
          'Test selection if enabled'
        ]
      },
      {
        category: 'Performance',
        description: 'Verify performance with large datasets',
        testCases: [
          'Test with 1000+ rows',
          'Check scrolling performance',
          'Monitor memory usage'
        ]
      }
    ];
  }
}

// Supporting interfaces

export interface NgUiGridCompatibleConfig {
  gridConfig: GridConfig;
  columnDefs: ColumnDefinition[];
  rowData: any[];
  eventHandlers: { [eventType: string]: Function[] };
  agGridOptions: AgGridOptions; // Keep original for reference
}

export interface NgUiGridCompatibleInstance {
  gridOptions: NgUiGridCompatibleConfig;
  api: any;
  columnApi: any;
  eventAdapter: EventAdapter;
  destroy: () => void;
  getCompatibilityReport: () => MigrationReport;
  updateGridOptions: (newOptions: Partial<AgGridOptions>) => any;
}

export interface MigrationReport {
  totalFeatures: number;
  supportedFeatures: number;
  partiallySupported: number;
  unsupported: number;
  warnings: string[];
  unsupportedFeatures: string[];
  recommendations: string[];
  migrationComplexity: 'Low' | 'Medium' | 'High';
}

export interface CompatibilityReport {
  isFullyCompatible: boolean;
  isPartiallyCompatible: boolean;
  compatibilityScore: number;
  totalFeatures: number;
  supportedFeatures: number;
  partiallySupported: number;
  unsupportedFeatures: string[];
  missingFeatures: string[];
  warnings: string[];
  recommendations: string[];
  estimatedMigrationEffort: 'Low' | 'Medium' | 'High';
}

export interface MigrationChecklistItem {
  category: string;
  task: string;
  required: boolean;
  completed: boolean;
  description: string;
  estimatedTime: string;
}

export interface MigrationChecklist {
  items: MigrationChecklistItem[];
  totalTasks: number;
  requiredTasks: number;
  estimatedTotalTime: string;
  migrationPhases: MigrationPhase[];
}

export interface MigrationPhase {
  name: string;
  tasks: MigrationChecklistItem[];
  description: string;
}

export interface MigrationDocumentation {
  summary: {
    originalConfig: AgGridOptions;
    migratedConfig: any;
    compatibilityScore: number;
    migrationComplexity: 'Low' | 'Medium' | 'High';
  };
  detailedChanges: DetailedChange[];
  unsupportedFeatures: {
    feature: string;
    alternative: string;
    workaround: string;
  }[];
  codeExamples: CodeExample[];
  migrationChecklist: MigrationChecklist;
  troubleshooting: TroubleshootingItem[];
  testingGuidelines: TestingGuideline[];
}

export interface DetailedChange {
  category: string;
  property: string;
  before: string;
  after: string;
  reason: string;
}

export interface CodeExample {
  title: string;
  description: string;
  before: string;
  after: string;
}

export interface TroubleshootingItem {
  issue: string;
  solution: string;
  commonCause: string;
}

export interface TestingGuideline {
  category: string;
  description: string;
  testCases: string[];
}