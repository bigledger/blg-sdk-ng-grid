import { InjectionToken } from '@angular/core';

/**
 * Enhanced Filter System Interfaces
 * 
 * Provides comprehensive filtering capabilities that surpass ag-grid's functionality
 * with additional operators and advanced features like fuzzy matching and AI-powered
 * relative date filtering.
 */

// ============================================
// Base Filter Types and Interfaces
// ============================================

/**
 * Base filter interface that all specific filter types extend
 */
export interface BaseFilter {
  type: FilterType;
  operator: string;
  active: boolean;
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
}

/**
 * All supported filter types in the enhanced system
 */
export type FilterType = 'text' | 'number' | 'date' | 'boolean' | 'set' | 'custom';

/**
 * Filter condition combining type for complex filtering
 */
export type FilterConditionType = 'AND' | 'OR';

// ============================================
// Text Filter Types
// ============================================

/**
 * Enhanced text filter operators (surpasses ag-grid)
 */
export type TextFilterOperator = 
  | 'contains' 
  | 'notContains'
  | 'equals' 
  | 'notEquals'
  | 'startsWith' 
  | 'endsWith'
  | 'isEmpty' 
  | 'isNotEmpty'
  | 'regex'           // NEW: Regular expression matching
  | 'fuzzyMatch';     // NEW: AI-powered fuzzy matching

export interface TextFilter extends BaseFilter {
  type: 'text';
  operator: TextFilterOperator;
  filter?: string;
  filterTo?: string; // For range-like operations
  fuzzyThreshold?: number; // For fuzzy matching (0-1)
  regexFlags?: string; // For regex operations (i, g, m, etc.)
}

// ============================================
// Number Filter Types
// ============================================

/**
 * Enhanced number filter operators (surpasses ag-grid)
 */
export type NumberFilterOperator = 
  | 'equals' 
  | 'notEquals'
  | 'greaterThan' 
  | 'greaterThanOrEqual'
  | 'lessThan' 
  | 'lessThanOrEqual'
  | 'inRange' 
  | 'notInRange'
  | 'isEmpty' 
  | 'isNotEmpty'
  | 'isEven'           // NEW: Check if number is even
  | 'isOdd'            // NEW: Check if number is odd
  | 'isDivisibleBy'    // NEW: Check divisibility
  | 'isPrime'          // NEW: Check if number is prime
  | 'isInteger'        // NEW: Check if number is integer
  | 'isDecimal';       // NEW: Check if number has decimal places

export interface NumberFilter extends BaseFilter {
  type: 'number';
  operator: NumberFilterOperator;
  filter?: number;
  filterTo?: number; // For range operations
  divisor?: number; // For isDivisibleBy operator
  precision?: number; // For decimal comparisons
}

// ============================================
// Date Filter Types
// ============================================

/**
 * Enhanced date filter operators (surpasses ag-grid)
 */
export type DateFilterOperator = 
  | 'equals' 
  | 'notEquals'
  | 'before' 
  | 'after'
  | 'between'
  | 'isEmpty' 
  | 'isNotEmpty'
  | 'isToday'          // NEW: Is today
  | 'isYesterday'      // NEW: Is yesterday
  | 'isTomorrow'       // NEW: Is tomorrow
  | 'isThisWeek'       // NEW: Is in current week
  | 'isThisMonth'      // NEW: Is in current month
  | 'isThisYear'       // NEW: Is in current year
  | 'isLastWeek'       // NEW: Is in last week
  | 'isLastMonth'      // NEW: Is in last month
  | 'isLastYear'       // NEW: Is in last year
  | 'isNextWeek'       // NEW: Is in next week
  | 'isNextMonth'      // NEW: Is in next month
  | 'isNextYear'       // NEW: Is in next year
  | 'isWeekend'        // NEW: Is Saturday or Sunday
  | 'isWeekday'        // NEW: Is Monday-Friday
  | 'relativeDateRange'// NEW: Last N days/weeks/months
  | 'isQuarter'        // NEW: Is in specific quarter
  | 'isSeason';        // NEW: Is in specific season

export type RelativeDateUnit = 'days' | 'weeks' | 'months' | 'years';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type Season = 'spring' | 'summer' | 'fall' | 'autumn' | 'winter';

export interface DateFilter extends BaseFilter {
  type: 'date';
  operator: DateFilterOperator;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  // For relative date operations
  relativeValue?: number;
  relativeUnit?: RelativeDateUnit;
  // For quarter/season operations
  quarter?: Quarter;
  season?: Season;
  // Date comparison options
  includeTime?: boolean;
  timezone?: string;
}

// ============================================
// Boolean Filter Types
// ============================================

export type BooleanFilterOperator = 'equals' | 'notEquals';

export interface BooleanFilter extends BaseFilter {
  type: 'boolean';
  operator: BooleanFilterOperator;
  filter?: boolean;
}

// ============================================
// Set Filter Types (Multi-select)
// ============================================

export type SetFilterOperator = 'in' | 'notIn';

export interface SetFilter extends BaseFilter {
  type: 'set';
  operator: SetFilterOperator;
  values: any[];
  selectAll?: boolean;
}

// ============================================
// Custom Filter Types
// ============================================

export interface CustomFilter extends BaseFilter {
  type: 'custom';
  operator: string;
  customLogic: (value: any, filterValue: any, row: any) => boolean;
  filterValue?: any;
}

// ============================================
// Combined Filter Types
// ============================================

export type Filter = TextFilter | NumberFilter | DateFilter | BooleanFilter | SetFilter | CustomFilter;

/**
 * Filter model for a single column
 */
export interface ColumnFilterModel {
  condition1?: Filter;
  condition2?: Filter;
  operator?: FilterConditionType; // How to combine condition1 and condition2
}

/**
 * Complete filter model for the grid
 */
export interface FilterModel {
  [columnId: string]: ColumnFilterModel;
}

// ============================================
// Filter Configuration
// ============================================

/**
 * Configuration for enhanced filtering features
 */
export interface FilterConfig {
  // Performance settings
  debounceMs?: number;
  enableCaching?: boolean;
  cacheSize?: number;
  enableWebWorkers?: boolean;
  enableIndexedDB?: boolean;
  
  // UI settings
  showFilterIcons?: boolean;
  showClearAllButton?: boolean;
  showFilterPanelButton?: boolean;
  enableQuickFilter?: boolean;
  
  // Advanced features
  enableUndoRedo?: boolean;
  maxUndoSteps?: number;
  enableFilterPresets?: boolean;
  enableFilterExport?: boolean;
  enableAdvancedMode?: boolean;
  
  // Text filter specific
  textFilterOptions?: {
    defaultCaseSensitive?: boolean;
    enableRegex?: boolean;
    enableFuzzyMatch?: boolean;
    fuzzyThreshold?: number;
  };
  
  // Number filter specific
  numberFilterOptions?: {
    allowDecimals?: boolean;
    decimalPlaces?: number;
    enableAdvancedOperators?: boolean;
  };
  
  // Date filter specific
  dateFilterOptions?: {
    dateFormat?: string;
    includeTime?: boolean;
    timezone?: string;
    enableRelativeDates?: boolean;
    enableSeasonalFilters?: boolean;
  };
}

// ============================================
// Filter Events
// ============================================

export interface FilterChangedEvent {
  type: 'filterChanged';
  columnId: string;
  filterModel: ColumnFilterModel | null;
  source: 'api' | 'ui' | 'undo' | 'redo';
}

export interface FilterClearedEvent {
  type: 'filterCleared';
  columnId?: string; // undefined means all filters cleared
  source: 'api' | 'ui';
}

export interface FilterPresetEvent {
  type: 'presetApplied' | 'presetSaved' | 'presetDeleted';
  presetName: string;
  filterModel: FilterModel;
}

// ============================================
// Filter Presets
// ============================================

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filterModel: FilterModel;
  createdAt: Date;
  modifiedAt: Date;
  isDefault?: boolean;
  tags?: string[];
}

// ============================================
// Filter Performance Metrics
// ============================================

export interface FilterPerformanceMetrics {
  filterTime: number; // Time to apply filter in ms
  dataSize: number; // Number of rows filtered
  cacheHitRate: number; // 0-1
  webWorkerUsed: boolean;
  indexedDBUsed: boolean;
}

// ============================================
// Filter State Management
// ============================================

export interface FilterState {
  filterModel: FilterModel;
  quickFilterValue?: string;
  activePreset?: string;
  undoStack: FilterModel[];
  redoStack: FilterModel[];
  performanceMetrics?: FilterPerformanceMetrics[];
}

// ============================================
// Filter Service Interfaces
// ============================================

export interface IFilterService {
  // Core filtering
  applyFilter(columnId: string, filter: ColumnFilterModel | null): Promise<any[]>;
  applyFilters(filterModel: FilterModel): Promise<any[]>;
  clearFilter(columnId: string): void;
  clearAllFilters(): void;
  
  // Quick filter
  setQuickFilter(value: string): Promise<any[]>;
  clearQuickFilter(): void;
  
  // Filter state
  getFilterModel(): FilterModel;
  setFilterModel(filterModel: FilterModel): Promise<any[]>;
  
  // Presets
  savePreset(name: string, description?: string): FilterPreset;
  applyPreset(presetId: string): Promise<any[]>;
  deletePreset(presetId: string): void;
  getPresets(): FilterPreset[];
  
  // Undo/Redo
  undo(): Promise<any[]>;
  redo(): Promise<any[]>;
  canUndo(): boolean;
  canRedo(): boolean;
  
  // Export/Import
  exportFilterModel(): string;
  importFilterModel(json: string): Promise<any[]>;
  
  // Performance
  getPerformanceMetrics(): FilterPerformanceMetrics[];
  clearCache(): void;
}

// ============================================
// Filter Component Interfaces
// ============================================

export interface IFilterComponent {
  init(params: FilterComponentParams): void;
  getModel(): Filter | null;
  setModel(model: Filter | null): void;
  isFilterActive(): boolean;
  doesFilterPass(params: { value: any; data: any }): boolean;
  getModelAsString(): string;
  destroy?(): void;
}

export interface FilterComponentParams {
  column: any;
  columnApi: any;
  filterChangedCallback: (additionalEventAttributes?: any) => void;
  filterModifiedCallback: () => void;
  valueGetter: (rowNode: any) => any;
  doesRowPassOtherFilter: (rowNode: any) => boolean;
  context: any;
  debounceMs?: number;
}

// ============================================
// Dependency Injection Tokens
// ============================================

export const FILTER_CONFIG = new InjectionToken<FilterConfig>('FilterConfig');
export const FILTER_SERVICE = new InjectionToken<IFilterService>('FilterService');

// ============================================
// Utility Types
// ============================================

/**
 * Helper type to get the filter type from a filter operator
 */
export type FilterTypeFromOperator<T extends string> = 
  T extends TextFilterOperator ? 'text' :
  T extends NumberFilterOperator ? 'number' :
  T extends DateFilterOperator ? 'date' :
  T extends BooleanFilterOperator ? 'boolean' :
  T extends SetFilterOperator ? 'set' :
  'custom';

/**
 * Helper type to get all operators for a filter type
 */
export type OperatorsForFilterType<T extends FilterType> = 
  T extends 'text' ? TextFilterOperator :
  T extends 'number' ? NumberFilterOperator :
  T extends 'date' ? DateFilterOperator :
  T extends 'boolean' ? BooleanFilterOperator :
  T extends 'set' ? SetFilterOperator :
  string;

/**
 * Type-safe filter creation helper
 */
export type FilterForType<T extends FilterType> = 
  T extends 'text' ? TextFilter :
  T extends 'number' ? NumberFilter :
  T extends 'date' ? DateFilter :
  T extends 'boolean' ? BooleanFilter :
  T extends 'set' ? SetFilter :
  CustomFilter;