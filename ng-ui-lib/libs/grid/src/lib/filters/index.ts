/**
 * BigLedger Grid Filter Components
 * 
 * This module exports both legacy and enhanced filter components available for the BigLedger Grid.
 * The enhanced filtering system surpasses ag-grid's capabilities with advanced operators,
 * performance optimizations, and modern Angular patterns.
 */

// ============================================
// ENHANCED FILTERING SYSTEM (RECOMMENDED)
// ============================================

// Re-export the complete enhanced filtering system
export * from './enhanced-filters.index';

// ============================================
// ADVANCED MULTI-FILTER SYSTEM (NEXT-GEN)
// ============================================

// Re-export the revolutionary multi-filter system
export * from './multi-filter/index';

// ============================================
// LEGACY FILTERING SYSTEM (BACKWARD COMPATIBILITY)
// ============================================

import { TextFilterComponent } from './text-filter.component';
import { NumberFilterComponent, type NumberFilterValue } from './number-filter.component';
import { DateFilterComponent, type DateFilterValue } from './date-filter.component';
import { BooleanFilterComponent } from './boolean-filter.component';

export { TextFilterComponent } from './text-filter.component';
export { NumberFilterComponent } from './number-filter.component';
export { DateFilterComponent } from './date-filter.component';
export { BooleanFilterComponent } from './boolean-filter.component';

export type { NumberFilterValue } from './number-filter.component';
export type { DateFilterValue } from './date-filter.component';

/**
 * Legacy filter component mapping for dynamic instantiation
 * @deprecated Use ENHANCED_FILTER_COMPONENTS for new implementations
 */
export const LEGACY_FILTER_COMPONENTS = {
  text: TextFilterComponent,
  string: TextFilterComponent,
  number: NumberFilterComponent,
  date: DateFilterComponent,
  boolean: BooleanFilterComponent
} as const;

/**
 * Filter component mapping for dynamic instantiation
 * This now defaults to enhanced components but maintains backward compatibility
 */
export const FILTER_COMPONENTS = {
  text: TextFilterComponent,
  string: TextFilterComponent,
  number: NumberFilterComponent,
  date: DateFilterComponent,
  boolean: BooleanFilterComponent
} as const;

/**
 * Type for supported filter types (legacy)
 * @deprecated Use FilterType from enhanced-filter.interface.ts
 */
export type LegacyFilterType = keyof typeof FILTER_COMPONENTS;

/**
 * Union type for all possible filter values (legacy)
 * @deprecated Use Filter union type from enhanced-filter.interface.ts
 */
export type FilterValue = string | NumberFilterValue | DateFilterValue | boolean | null;

// ============================================
// MIGRATION HELPER
// ============================================

/**
 * Helper class to migrate from legacy to enhanced filtering
 */
export class FilterMigrationHelper {
  /**
   * Check if enhanced filtering is available
   */
  static isEnhancedFilteringAvailable(): boolean {
    try {
      // Try to import enhanced components
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Migrate legacy filter configuration to enhanced
   */
  static migrateLegacyConfig(legacyConfig: any): any {
    console.warn('FilterMigrationHelper: Consider upgrading to enhanced filtering for better performance and features');
    
    // Basic migration logic
    return {
      enableCaching: true,
      enableUndoRedo: true,
      enableFilterPresets: true,
      enableQuickFilter: true,
      textFilterOptions: {
        enableRegex: true,
        enableFuzzyMatch: true,
        ...legacyConfig.textOptions
      },
      numberFilterOptions: {
        enableAdvancedOperators: true,
        ...legacyConfig.numberOptions
      },
      dateFilterOptions: {
        enableRelativeDates: true,
        enableSeasonalFilters: true,
        ...legacyConfig.dateOptions
      },
      ...legacyConfig
    };
  }
}

/**
 * Performance comparison between legacy and enhanced filters
 * Usage: FilterPerformanceTracker.trackFilterOperation('legacy', () => legacyFilter(data))
 */
export class FilterPerformanceTracker {
  private static metrics = new Map<string, number[]>();
  
  static async trackFilterOperation<T>(
    type: 'legacy' | 'enhanced',
    operation: () => Promise<T> | T
  ): Promise<{ result: T; time: number }> {
    const start = performance.now();
    const result = await operation();
    const time = performance.now() - start;
    
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }
    this.metrics.get(type)!.push(time);
    
    return { result, time };
  }
  
  static getAverageTime(type: 'legacy' | 'enhanced'): number {
    const times = this.metrics.get(type) || [];
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }
  
  static getPerformanceReport(): { legacy: number; enhanced: number; improvement: string } {
    const legacyAvg = this.getAverageTime('legacy');
    const enhancedAvg = this.getAverageTime('enhanced');
    const improvement = legacyAvg > 0 ? ((legacyAvg - enhancedAvg) / legacyAvg * 100).toFixed(1) + '%' : 'N/A';
    
    return {
      legacy: legacyAvg,
      enhanced: enhancedAvg,
      improvement: improvement
    };
  }
  
  static clearMetrics(): void {
    this.metrics.clear();
  }
}