/**
 * Enhanced Filter System - Main Export File
 * 
 * This module exports the complete enhanced filtering system that surpasses ag-grid's capabilities.
 * It includes advanced operators, performance optimizations, and modern Angular patterns.
 */

// Core interfaces and types
export * from '../../../../../../libs/core/src/lib/interfaces/enhanced-filter.interface';

// Enhanced filter service
export { EnhancedFilterService } from '../../../../../../libs/core/src/lib/services/enhanced-filter.service';

// Enhanced filter components
export { EnhancedTextFilterComponent } from './enhanced-text-filter.component';
export { EnhancedNumberFilterComponent } from './enhanced-number-filter.component';
export { EnhancedDateFilterComponent } from './enhanced-date-filter.component';
export { EnhancedFilterManagerComponent } from './enhanced-filter-manager.component';

// Advanced Set Filter System - Most comprehensive set filter available
export * from './set-filter';
import { SetFilterComponent } from './set-filter';

// Legacy filter components (for backward compatibility)
export { TextFilterComponent } from './text-filter.component';
export { NumberFilterComponent } from './number-filter.component';
export { DateFilterComponent } from './date-filter.component';
export { BooleanFilterComponent } from './boolean-filter.component';

// Enhanced filter component mapping for dynamic instantiation
export const ENHANCED_FILTER_COMPONENTS = {
  text: EnhancedTextFilterComponent,
  string: EnhancedTextFilterComponent,
  number: EnhancedNumberFilterComponent,
  date: EnhancedDateFilterComponent,
  boolean: BooleanFilterComponent, // Keep existing boolean filter for now
  set: SetFilterComponent, // Advanced set filter
  custom: EnhancedTextFilterComponent // Default fallback
} as const;

// Backward compatibility mapping
export const FILTER_COMPONENTS = {
  text: TextFilterComponent,
  string: TextFilterComponent,
  number: NumberFilterComponent,
  date: DateFilterComponent,
  boolean: BooleanFilterComponent
} as const;

/**
 * Enhanced Filter System Configuration Provider
 */
import { InjectionToken, Provider } from '@angular/core';
import { FilterConfig, FILTER_CONFIG } from '../../../../../../libs/core/src/lib/interfaces/enhanced-filter.interface';

/**
 * Default enhanced filter configuration
 */
export const DEFAULT_ENHANCED_FILTER_CONFIG: FilterConfig = {
  // Performance settings
  debounceMs: 300,
  enableCaching: true,
  cacheSize: 100,
  enableWebWorkers: true,
  enableIndexedDB: true,
  
  // UI settings
  showFilterIcons: true,
  showClearAllButton: true,
  showFilterPanelButton: true,
  enableQuickFilter: true,
  
  // Advanced features
  enableUndoRedo: true,
  maxUndoSteps: 50,
  enableFilterPresets: true,
  enableFilterExport: true,
  enableAdvancedMode: true,
  
  // Text filter specific
  textFilterOptions: {
    defaultCaseSensitive: false,
    enableRegex: true,
    enableFuzzyMatch: true,
    fuzzyThreshold: 0.8
  },
  
  // Number filter specific
  numberFilterOptions: {
    allowDecimals: true,
    decimalPlaces: 2,
    enableAdvancedOperators: true
  },
  
  // Date filter specific
  dateFilterOptions: {
    dateFormat: 'yyyy-MM-dd',
    includeTime: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    enableRelativeDates: true,
    enableSeasonalFilters: true
  }
};

/**
 * Provider for enhanced filter configuration
 */
export function provideEnhancedFilterConfig(config?: Partial<FilterConfig>): Provider {
  return {
    provide: FILTER_CONFIG,
    useValue: { ...DEFAULT_ENHANCED_FILTER_CONFIG, ...config }
  };
}

/**
 * Enhanced Filter System Feature Flags
 */
export interface EnhancedFilterFeatures {
  // Text Filter Features
  regexFiltering: boolean;
  fuzzyMatching: boolean;
  caseInsensitiveByDefault: boolean;
  
  // Number Filter Features
  advancedMathOperators: boolean;  // isEven, isOdd, isPrime, etc.
  divisibilityCheck: boolean;
  decimalPrecisionControl: boolean;
  
  // Date Filter Features
  relativeDataRanges: boolean;     // last N days/weeks/months
  seasonalFiltering: boolean;      // spring, summer, fall, winter
  quarterlyFiltering: boolean;     // Q1, Q2, Q3, Q4
  weekendWeekdayFiltering: boolean;
  smartDateOperators: boolean;     // isToday, isYesterday, etc.
  
  // Performance Features
  webWorkerFiltering: boolean;
  indexedDBCaching: boolean;
  filterResultCaching: boolean;
  virtualFiltering: boolean;
  
  // UX Features
  undoRedoSupport: boolean;
  filterPresets: boolean;
  filterExportImport: boolean;
  quickFilterGlobal: boolean;
  filterToolbar: boolean;
  performanceMetrics: boolean;
}

/**
 * Default enhanced filter features (all enabled)
 */
export const DEFAULT_ENHANCED_FEATURES: EnhancedFilterFeatures = {
  // Text Filter Features
  regexFiltering: true,
  fuzzyMatching: true,
  caseInsensitiveByDefault: true,
  
  // Number Filter Features
  advancedMathOperators: true,
  divisibilityCheck: true,
  decimalPrecisionControl: true,
  
  // Date Filter Features
  relativeDataRanges: true,
  seasonalFiltering: true,
  quarterlyFiltering: true,
  weekendWeekdayFiltering: true,
  smartDateOperators: true,
  
  // Performance Features
  webWorkerFiltering: true,
  indexedDBCaching: true,
  filterResultCaching: true,
  virtualFiltering: true,
  
  // UX Features
  undoRedoSupport: true,
  filterPresets: true,
  filterExportImport: true,
  quickFilterGlobal: true,
  filterToolbar: true,
  performanceMetrics: true
};

/**
 * Feature flags injection token
 */
export const ENHANCED_FILTER_FEATURES = new InjectionToken<EnhancedFilterFeatures>(
  'Enhanced Filter Features'
);

/**
 * Provider for enhanced filter features
 */
export function provideEnhancedFilterFeatures(features?: Partial<EnhancedFilterFeatures>): Provider {
  return {
    provide: ENHANCED_FILTER_FEATURES,
    useValue: { ...DEFAULT_ENHANCED_FEATURES, ...features }
  };
}

/**
 * Utility functions for enhanced filters
 */
export class EnhancedFilterUtils {
  /**
   * Creates a filter model from a simple object
   */
  static createFilterModel(filters: Record<string, any>): FilterModel {
    const filterModel: FilterModel = {};
    
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue != null && filterValue !== '') {
        filterModel[columnId] = {
          condition1: {
            type: 'text' as any,
            operator: 'contains' as any,
            active: true,
            filter: filterValue
          }
        };
      }
    });
    
    return filterModel;
  }
  
  /**
   * Extracts simple filter values from a filter model
   */
  static extractSimpleFilters(filterModel: FilterModel): Record<string, any> {
    const simpleFilters: Record<string, any> = {};
    
    Object.entries(filterModel).forEach(([columnId, columnFilter]) => {
      if (columnFilter.condition1?.active) {
        simpleFilters[columnId] = (columnFilter.condition1 as any).filter;
      }
    });
    
    return simpleFilters;
  }
  
  /**
   * Validates a filter model
   */
  static validateFilterModel(filterModel: FilterModel): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    Object.entries(filterModel).forEach(([columnId, columnFilter]) => {
      if (columnFilter.condition1) {
        // Validate condition1
        if (!columnFilter.condition1.type) {
          errors.push(`Column ${columnId} condition1: missing filter type`);
        }
        
        if (!columnFilter.condition1.operator) {
          errors.push(`Column ${columnId} condition1: missing filter operator`);
        }
      }
      
      if (columnFilter.condition2) {
        // Validate condition2
        if (!columnFilter.condition2.type) {
          errors.push(`Column ${columnId} condition2: missing filter type`);
        }
        
        if (!columnFilter.condition2.operator) {
          errors.push(`Column ${columnId} condition2: missing filter operator`);
        }
        
        // Validate operator when condition2 exists
        if (!columnFilter.operator || !['AND', 'OR'].includes(columnFilter.operator)) {
          errors.push(`Column ${columnId}: invalid or missing condition operator`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Converts legacy filter format to enhanced format
   */
  static convertLegacyFilter(legacyFilter: any): FilterModel {
    const filterModel: FilterModel = {};
    
    // Handle various legacy formats
    if (typeof legacyFilter === 'object' && legacyFilter !== null) {
      Object.entries(legacyFilter).forEach(([columnId, filterValue]: [string, any]) => {
        if (filterValue && typeof filterValue === 'object') {
          // Already in enhanced format or ag-grid format
          if (filterValue.condition1 || filterValue.filterType) {
            filterModel[columnId] = this.normalizeColumnFilter(filterValue);
          }
        } else if (filterValue != null && filterValue !== '') {
          // Simple string/number filter
          filterModel[columnId] = {
            condition1: {
              type: 'text' as any,
              operator: 'contains' as any,
              active: true,
              filter: filterValue
            }
          };
        }
      });
    }
    
    return filterModel;
  }
  
  /**
   * Normalizes a column filter to enhanced format
   */
  private static normalizeColumnFilter(columnFilter: any): ColumnFilterModel {
    // Handle ag-grid format
    if (columnFilter.filterType) {
      return {
        condition1: {
          type: this.mapAgGridFilterType(columnFilter.filterType),
          operator: this.mapAgGridOperator(columnFilter.type || 'contains'),
          active: true,
          filter: columnFilter.filter
        }
      };
    }
    
    // Already in enhanced format
    return columnFilter;
  }
  
  /**
   * Maps ag-grid filter types to enhanced filter types
   */
  private static mapAgGridFilterType(agGridType: string): any {
    const typeMap: Record<string, any> = {
      'agTextColumnFilter': 'text',
      'agNumberColumnFilter': 'number',
      'agDateColumnFilter': 'date',
      'agSetColumnFilter': 'set'
    };
    
    return typeMap[agGridType] || 'text';
  }
  
  /**
   * Maps ag-grid operators to enhanced operators
   */
  private static mapAgGridOperator(agGridOperator: string): any {
    const operatorMap: Record<string, any> = {
      'contains': 'contains',
      'notContains': 'notContains',
      'equals': 'equals',
      'notEqual': 'notEquals',
      'startsWith': 'startsWith',
      'endsWith': 'endsWith',
      'lessThan': 'lessThan',
      'lessThanOrEqual': 'lessThanOrEqual',
      'greaterThan': 'greaterThan',
      'greaterThanOrEqual': 'greaterThanOrEqual',
      'inRange': 'inRange',
      'empty': 'isEmpty'
    };
    
    return operatorMap[agGridOperator] || 'contains';
  }
}

/**
 * Performance benchmarking utilities
 */
export class FilterPerformanceBenchmark {
  private static results: Map<string, number[]> = new Map();
  
  /**
   * Benchmark a filter operation
   */
  static async benchmark<T>(
    name: string, 
    operation: () => Promise<T> | T,
    iterations = 1
  ): Promise<{ result: T; avgTime: number; allTimes: number[] }> {
    const times: number[] = [];
    let result: T;
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      result = await operation();
      const end = performance.now();
      times.push(end - start);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    // Store results for comparison
    if (!this.results.has(name)) {
      this.results.set(name, []);
    }
    this.results.get(name)!.push(avgTime);
    
    return { result: result!, avgTime, allTimes: times };
  }
  
  /**
   * Compare performance between enhanced and legacy filters
   */
  static async compareFilters(
    data: any[], 
    filterModel: FilterModel,
    enhancedFilterFn: (data: any[], model: FilterModel) => Promise<any[]>,
    legacyFilterFn: (data: any[], model: any) => Promise<any[]>
  ) {
    console.group('🚀 Filter Performance Comparison');
    
    const enhancedResult = await this.benchmark(
      'Enhanced Filter',
      () => enhancedFilterFn(data, filterModel),
      5
    );
    
    const legacyModel = EnhancedFilterUtils.extractSimpleFilters(filterModel);
    const legacyResult = await this.benchmark(
      'Legacy Filter',
      () => legacyFilterFn(data, legacyModel),
      5
    );
    
    const improvement = ((legacyResult.avgTime - enhancedResult.avgTime) / legacyResult.avgTime) * 100;
    
    console.log('📊 Results:');
    console.log(`Enhanced Filter: ${enhancedResult.avgTime.toFixed(2)}ms (avg)`);
    console.log(`Legacy Filter: ${legacyResult.avgTime.toFixed(2)}ms (avg)`);
    console.log(`🎯 Performance improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`);
    console.log(`📈 Results match: ${enhancedResult.result.length === legacyResult.result.length}`);
    
    console.groupEnd();
    
    return {
      enhanced: enhancedResult,
      legacy: legacyResult,
      improvement: improvement
    };
  }
  
  /**
   * Get performance history for a specific operation
   */
  static getPerformanceHistory(name: string): number[] {
    return this.results.get(name) || [];
  }
  
  /**
   * Clear all performance data
   */
  static clearResults(): void {
    this.results.clear();
  }
}

// Type exports for convenience
import { 
  FilterModel, 
  ColumnFilterModel, 
  Filter,
  TextFilter,
  NumberFilter,
  DateFilter,
  BooleanFilter,
  SetFilter,
  CustomFilter,
  FilterType,
  TextFilterOperator,
  NumberFilterOperator,
  DateFilterOperator,
  FilterConfig,
  FilterPreset,
  FilterState,
  IFilterService,
  IFilterComponent,
  FilterComponentParams
} from '../../../../../../libs/core/src/lib/interfaces/enhanced-filter.interface';

export type {
  FilterModel,
  ColumnFilterModel,
  Filter,
  TextFilter,
  NumberFilter,
  DateFilter,
  BooleanFilter,
  SetFilter,
  CustomFilter,
  FilterType,
  TextFilterOperator,
  NumberFilterOperator,
  DateFilterOperator,
  FilterConfig,
  FilterPreset,
  FilterState,
  IFilterService,
  IFilterComponent,
  FilterComponentParams
};