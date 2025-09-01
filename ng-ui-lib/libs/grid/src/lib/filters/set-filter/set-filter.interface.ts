import { InjectionToken } from '@angular/core';
import { BaseFilter } from '../../../../../../libs/core/src/lib/interfaces/enhanced-filter.interface';

/**
 * Advanced Set Filter Interfaces for BigLedger Grid
 * 
 * This provides the most comprehensive set filter implementation available,
 * surpassing both Excel and ag-grid with advanced features like:
 * - Hierarchical tree structures
 * - AI-powered categorization
 * - Voice search
 * - ML-based predictions
 * - Performance optimizations with IndexedDB and Web Workers
 */

// ============================================
// Core Set Filter Types
// ============================================

/**
 * Enhanced set filter operators (beyond ag-grid)
 */
export type SetFilterOperator = 
  | 'in'                    // Standard: values are in selection
  | 'notIn'                 // Standard: values are not in selection
  | 'contains'              // NEW: any selected value contains text
  | 'notContains'           // NEW: no selected value contains text
  | 'startsWith'            // NEW: any selected value starts with text
  | 'endsWith'              // NEW: any selected value ends with text
  | 'matchesPattern'        // NEW: values match regex pattern
  | 'similarTo'             // NEW: fuzzy matching against selected values
  | 'inCategory'            // NEW: values are in AI-categorized groups
  | 'hasFrequency'          // NEW: values have specific frequency ranges
  | 'inDateRange'           // NEW: for date-based values
  | 'inNumericRange';       // NEW: for numeric-based values

/**
 * Enhanced set filter with advanced capabilities
 */
export interface EnhancedSetFilter extends BaseFilter {
  type: 'set';
  operator: SetFilterOperator;
  values: SetFilterValue[];
  selectedValues: Set<any>;
  
  // Selection behavior
  selectAll?: boolean;
  invertSelection?: boolean;
  
  // Search and filtering
  searchTerm?: string;
  searchMode?: SetFilterSearchMode;
  fuzzyThreshold?: number;
  
  // Hierarchical display
  enableHierarchy?: boolean;
  hierarchyProperty?: string;
  maxTreeDepth?: number;
  
  // Analytics and visualization
  showValueCounts?: boolean;
  showDistributionCharts?: boolean;
  sortBy?: SetFilterSortBy;
  sortOrder?: 'asc' | 'desc';
  
  // Performance options
  enableVirtualScrolling?: boolean;
  enableLazyLoading?: boolean;
  chunkSize?: number;
  
  // AI-powered features
  enableSmartGrouping?: boolean;
  enableValuePrediction?: boolean;
  categories?: SetFilterCategory[];
  
  // Templates and presets
  filterTemplate?: SetFilterTemplate;
  allowTemplateExport?: boolean;
}

// ============================================
// Set Filter Value Types
// ============================================

/**
 * Represents a single value in the set filter with metadata
 */
export interface SetFilterValue {
  // Core value data
  value: any;
  displayValue: string;
  originalValue?: any;
  
  // Selection state
  selected: boolean;
  partiallySelected?: boolean; // For hierarchical data
  
  // Metadata
  count: number;
  percentage: number;
  frequency?: number;
  
  // Visual properties
  color?: string;
  icon?: string;
  badge?: string;
  
  // Hierarchical properties
  level?: number;
  parentValue?: any;
  children?: SetFilterValue[];
  isExpanded?: boolean;
  
  // AI categorization
  category?: string;
  confidence?: number;
  tags?: string[];
  
  // Performance data
  lastAccessed?: Date;
  accessCount?: number;
  
  // Custom rendering
  customRenderer?: string;
  tooltip?: string;
}

/**
 * Set filter search modes
 */
export type SetFilterSearchMode = 
  | 'contains'              // Standard text search
  | 'fuzzy'                 // Fuzzy matching
  | 'regex'                 // Regular expression
  | 'phonetic'              // Phonetic matching
  | 'semantic'              // Semantic/meaning-based search
  | 'voice';                // Voice-to-text search

/**
 * Set filter sorting options
 */
export type SetFilterSortBy = 
  | 'value'                 // Sort by actual value
  | 'display'               // Sort by display value
  | 'count'                 // Sort by frequency
  | 'percentage'            // Sort by percentage
  | 'recent'                // Sort by recent usage
  | 'alphabetical'          // Sort alphabetically
  | 'custom';               // Custom sort order

// ============================================
// Hierarchical Data Support
// ============================================

/**
 * Configuration for hierarchical set filter display
 */
export interface SetFilterHierarchyConfig {
  enabled: boolean;
  groupByProperty: string;
  maxDepth: number;
  showGroupCounts: boolean;
  allowPartialSelection: boolean;
  expandByDefault: boolean;
  showEmptyGroups: boolean;
  customGroupRenderer?: (group: SetFilterGroup) => string;
}

/**
 * Represents a group in hierarchical set filter
 */
export interface SetFilterGroup {
  id: string;
  name: string;
  level: number;
  parentId?: string;
  children: (SetFilterGroup | SetFilterValue)[];
  totalCount: number;
  selectedCount: number;
  isExpanded: boolean;
  color?: string;
  icon?: string;
}

// ============================================
// AI-Powered Features
// ============================================

/**
 * AI-generated categories for smart grouping
 */
export interface SetFilterCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  confidence: number;
  values: any[];
  
  // ML model info
  modelVersion?: string;
  lastUpdated?: Date;
  accuracy?: number;
}

/**
 * Smart suggestions for filter values
 */
export interface SetFilterSuggestion {
  value: any;
  displayValue: string;
  confidence: number;
  reasoning: string;
  category?: string;
  
  // Context that led to this suggestion
  basedOn: 'usage_pattern' | 'similar_data' | 'time_pattern' | 'user_behavior';
  context?: any;
}

/**
 * Value prediction based on historical data
 */
export interface SetFilterPrediction {
  predictedValues: SetFilterSuggestion[];
  accuracy: number;
  modelType: 'frequency' | 'temporal' | 'behavioral' | 'semantic';
  lastTrainingDate: Date;
  sampleSize: number;
}

// ============================================
// Filter Templates and Presets
// ============================================

/**
 * Reusable filter template
 */
export interface SetFilterTemplate {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  
  // Template definition
  selectedValues: any[];
  operator: SetFilterOperator;
  searchTerm?: string;
  categories?: string[];
  
  // Template metadata
  createdAt: Date;
  modifiedAt: Date;
  author?: string;
  usageCount: number;
  isPublic: boolean;
  
  // Export/import data
  version: string;
  compatibility: string[];
  
  // Associated rules
  autoApplyConditions?: SetFilterAutoApplyCondition[];
}

/**
 * Conditions for automatic template application
 */
export interface SetFilterAutoApplyCondition {
  type: 'column_name' | 'data_type' | 'value_pattern' | 'time_based';
  condition: string;
  parameters?: any;
}

// ============================================
// Performance and Optimization
// ============================================

/**
 * Performance optimization configuration
 */
export interface SetFilterPerformanceConfig {
  // Virtual scrolling
  enableVirtualScrolling: boolean;
  virtualScrollItemHeight: number;
  virtualScrollBufferSize: number;
  
  // Lazy loading
  enableLazyLoading: boolean;
  lazyLoadChunkSize: number;
  lazyLoadThreshold: number;
  
  // Caching
  enableIndexedDB: boolean;
  cacheExpiration: number;
  maxCacheSize: number;
  
  // Web Workers
  enableWebWorkers: boolean;
  webWorkerChunkSize: number;
  
  // Search optimization
  searchDebounceMs: number;
  enableSearchIndex: boolean;
  indexUpdateThreshold: number;
  
  // Memory management
  maxVisibleItems: number;
  enableItemRecycling: boolean;
  gcThreshold: number;
}

/**
 * Set filter performance metrics
 */
export interface SetFilterPerformanceMetrics {
  // Data processing
  uniqueValueExtractionTime: number;
  sortingTime: number;
  searchTime: number;
  renderingTime: number;
  
  // Memory usage
  totalMemoryUsage: number;
  cacheHitRate: number;
  indexSize: number;
  
  // User interaction
  averageSearchTime: number;
  averageSelectionTime: number;
  scrollPerformance: number;
  
  // Dataset characteristics
  uniqueValueCount: number;
  hierarchyDepth?: number;
  categoryCount?: number;
  
  // Optimization usage
  virtualScrollingActive: boolean;
  webWorkerUsed: boolean;
  indexedDBUsed: boolean;
}

// ============================================
// Filter Component Events
// ============================================

/**
 * Set filter specific events
 */
export interface SetFilterValueSelectedEvent {
  type: 'valueSelected' | 'valueDeselected';
  value: any;
  displayValue: string;
  isSelected: boolean;
  totalSelected: number;
  source: 'click' | 'search' | 'selectAll' | 'api' | 'keyboard';
}

export interface SetFilterSearchEvent {
  type: 'searchChanged';
  searchTerm: string;
  searchMode: SetFilterSearchMode;
  resultsCount: number;
  searchTime: number;
}

export interface SetFilterGroupEvent {
  type: 'groupExpanded' | 'groupCollapsed';
  groupId: string;
  groupName: string;
  level: number;
  isExpanded: boolean;
}

export interface SetFilterTemplateEvent {
  type: 'templateApplied' | 'templateSaved' | 'templateDeleted';
  templateId: string;
  templateName: string;
  selectedValues: any[];
}

export interface SetFilterCategoryEvent {
  type: 'categoryApplied' | 'categoryCreated' | 'categoryModified';
  categoryId: string;
  categoryName: string;
  affectedValues: any[];
  confidence?: number;
}

// ============================================
// Configuration and Services
// ============================================

/**
 * Complete set filter configuration
 */
export interface SetFilterConfig {
  // Core behavior
  maxDisplayedValues?: number;
  showSelectAllCheckbox: boolean;
  showClearButton: boolean;
  showSearchBox: boolean;
  showValueCounts: boolean;
  
  // Advanced features
  enableHierarchy: boolean;
  enableAnalytics: boolean;
  enableSmartFeatures: boolean;
  enableTemplates: boolean;
  
  // Search configuration
  searchConfig: {
    enableFuzzySearch: boolean;
    enableRegexSearch: boolean;
    enableVoiceSearch: boolean;
    enableSemanticSearch: boolean;
    searchPlaceholder: string;
    searchDebounceMs: number;
  };
  
  // Performance configuration
  performanceConfig: SetFilterPerformanceConfig;
  
  // Hierarchy configuration
  hierarchyConfig?: SetFilterHierarchyConfig;
  
  // UI customization
  uiConfig: {
    theme: 'light' | 'dark' | 'auto';
    showMiniCharts: boolean;
    showColorCoding: boolean;
    showIcons: boolean;
    showTooltips: boolean;
    compactMode: boolean;
  };
  
  // Export/Import
  exportConfig: {
    enableTemplateExport: boolean;
    enableDataExport: boolean;
    supportedFormats: string[];
  };
}

/**
 * Set filter service interface
 */
export interface ISetFilterService {
  // Core value management
  extractUniqueValues(data: any[], column: string): Promise<SetFilterValue[]>;
  searchValues(values: SetFilterValue[], searchTerm: string, mode: SetFilterSearchMode): Promise<SetFilterValue[]>;
  sortValues(values: SetFilterValue[], sortBy: SetFilterSortBy, order: 'asc' | 'desc'): SetFilterValue[];
  
  // Hierarchical operations
  buildHierarchy(values: SetFilterValue[], config: SetFilterHierarchyConfig): SetFilterGroup[];
  expandGroup(groupId: string, expand: boolean): void;
  selectGroup(groupId: string, select: boolean): void;
  
  // AI-powered features
  categorizeValues(values: SetFilterValue[]): Promise<SetFilterCategory[]>;
  generateSuggestions(context: any): Promise<SetFilterSuggestion[]>;
  predictValues(historicalData: any[]): Promise<SetFilterPrediction>;
  
  // Template management
  saveTemplate(name: string, filter: EnhancedSetFilter): SetFilterTemplate;
  loadTemplate(templateId: string): Promise<SetFilterTemplate>;
  deleteTemplate(templateId: string): void;
  exportTemplate(templateId: string, format: string): Promise<string>;
  importTemplate(data: string): Promise<SetFilterTemplate>;
  
  // Performance and optimization
  enablePerformanceMode(): void;
  getPerformanceMetrics(): SetFilterPerformanceMetrics;
  clearCache(): void;
  optimizeMemory(): void;
  
  // Analytics
  getValueDistribution(): Map<any, number>;
  getUsageAnalytics(): any;
  getPerformanceReport(): any;
}

// ============================================
// Dependency Injection Tokens
// ============================================

export const SET_FILTER_CONFIG = new InjectionToken<SetFilterConfig>('SetFilterConfig');
export const SET_FILTER_SERVICE = new InjectionToken<ISetFilterService>('SetFilterService');

// ============================================
// Default Configurations
// ============================================

/**
 * Default set filter configuration
 */
export const DEFAULT_SET_FILTER_CONFIG: SetFilterConfig = {
  // Core behavior
  maxDisplayedValues: 10000,
  showSelectAllCheckbox: true,
  showClearButton: true,
  showSearchBox: true,
  showValueCounts: true,
  
  // Advanced features
  enableHierarchy: true,
  enableAnalytics: true,
  enableSmartFeatures: true,
  enableTemplates: true,
  
  // Search configuration
  searchConfig: {
    enableFuzzySearch: true,
    enableRegexSearch: true,
    enableVoiceSearch: true,
    enableSemanticSearch: false, // Requires additional setup
    searchPlaceholder: 'Search values...',
    searchDebounceMs: 300
  },
  
  // Performance configuration
  performanceConfig: {
    enableVirtualScrolling: true,
    virtualScrollItemHeight: 32,
    virtualScrollBufferSize: 20,
    
    enableLazyLoading: true,
    lazyLoadChunkSize: 100,
    lazyLoadThreshold: 0.8,
    
    enableIndexedDB: true,
    cacheExpiration: 3600000, // 1 hour
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    
    enableWebWorkers: true,
    webWorkerChunkSize: 1000,
    
    searchDebounceMs: 150,
    enableSearchIndex: true,
    indexUpdateThreshold: 1000,
    
    maxVisibleItems: 1000,
    enableItemRecycling: true,
    gcThreshold: 10000
  },
  
  // Hierarchy configuration
  hierarchyConfig: {
    enabled: true,
    groupByProperty: '',
    maxDepth: 5,
    showGroupCounts: true,
    allowPartialSelection: true,
    expandByDefault: false,
    showEmptyGroups: false
  },
  
  // UI customization
  uiConfig: {
    theme: 'auto',
    showMiniCharts: true,
    showColorCoding: true,
    showIcons: true,
    showTooltips: true,
    compactMode: false
  },
  
  // Export/Import
  exportConfig: {
    enableTemplateExport: true,
    enableDataExport: true,
    supportedFormats: ['json', 'csv', 'xlsx']
  }
};

/**
 * Default performance configuration for different dataset sizes
 */
export const PERFORMANCE_PRESETS = {
  small: { // < 1K values
    enableVirtualScrolling: false,
    enableLazyLoading: false,
    enableWebWorkers: false,
    enableIndexedDB: false
  },
  
  medium: { // 1K - 10K values
    enableVirtualScrolling: true,
    enableLazyLoading: true,
    enableWebWorkers: false,
    enableIndexedDB: true
  },
  
  large: { // 10K - 100K values
    enableVirtualScrolling: true,
    enableLazyLoading: true,
    enableWebWorkers: true,
    enableIndexedDB: true
  },
  
  enterprise: { // > 100K values
    enableVirtualScrolling: true,
    enableLazyLoading: true,
    enableWebWorkers: true,
    enableIndexedDB: true,
    maxVisibleItems: 500,
    webWorkerChunkSize: 5000,
    lazyLoadChunkSize: 200
  }
};

/**
 * Voice search configuration
 */
export interface VoiceSearchConfig {
  enabled: boolean;
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  confidence: number;
}

export const DEFAULT_VOICE_SEARCH_CONFIG: VoiceSearchConfig = {
  enabled: true,
  language: 'en-US',
  continuous: false,
  interimResults: true,
  maxAlternatives: 5,
  confidence: 0.7
};

// ============================================
// Type Guards and Utilities
// ============================================

/**
 * Type guard for set filter
 */
export function isSetFilter(filter: any): filter is EnhancedSetFilter {
  return filter && filter.type === 'set' && Array.isArray(filter.values);
}

/**
 * Type guard for hierarchical value
 */
export function isHierarchicalValue(value: any): value is SetFilterValue & { children: SetFilterValue[] } {
  return value && Array.isArray(value.children);
}

/**
 * Utility class for set filter operations
 */
export class SetFilterUtils {
  /**
   * Creates a new set filter with default values
   */
  static createDefaultSetFilter(): EnhancedSetFilter {
    return {
      type: 'set',
      operator: 'in',
      active: true,
      values: [],
      selectedValues: new Set(),
      selectAll: false,
      showValueCounts: true,
      enableVirtualScrolling: true,
      searchMode: 'contains',
      sortBy: 'count',
      sortOrder: 'desc'
    };
  }
  
  /**
   * Converts simple array to set filter values
   */
  static arrayToSetFilterValues(array: any[]): SetFilterValue[] {
    const valueMap = new Map<any, number>();
    
    // Count occurrences
    array.forEach(value => {
      const count = valueMap.get(value) || 0;
      valueMap.set(value, count + 1);
    });
    
    const total = array.length;
    const values: SetFilterValue[] = [];
    
    valueMap.forEach((count, value) => {
      values.push({
        value,
        displayValue: String(value || ''),
        selected: false,
        count,
        percentage: (count / total) * 100
      });
    });
    
    return values;
  }
  
  /**
   * Builds color-coded values based on frequency
   */
  static applyFrequencyColoring(values: SetFilterValue[]): SetFilterValue[] {
    const maxCount = Math.max(...values.map(v => v.count));
    
    return values.map(value => ({
      ...value,
      color: this.getFrequencyColor(value.count / maxCount)
    }));
  }
  
  private static getFrequencyColor(ratio: number): string {
    // Green to red color gradient based on frequency
    const red = Math.min(255, Math.round(255 * (1 - ratio) + 128 * ratio));
    const green = Math.min(255, Math.round(255 * ratio + 128 * (1 - ratio)));
    const blue = 128;
    
    return `rgb(${red}, ${green}, ${blue})`;
  }
}