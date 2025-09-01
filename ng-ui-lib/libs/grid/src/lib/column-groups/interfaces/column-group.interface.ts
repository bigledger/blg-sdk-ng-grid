import { TemplateRef } from '@angular/core';
import { ColumnDefinition } from '@blg/core';

/**
 * Advanced Column Group Definition - exceeds ag-grid capabilities
 * Features unlimited nesting, dynamic operations, and smart auto-grouping
 */
export interface ColumnGroupDefinition {
  /** Unique identifier for the column group */
  id: string;
  
  /** Display header text for the group */
  headerName: string;
  
  /** Tooltip text for the group header */
  headerTooltip?: string;
  
  /** Child column definitions or nested groups */
  children: (ColumnDefinition | ColumnGroupDefinition)[];
  
  /** Group header class for custom styling */
  headerClass?: string | string[] | ((params: ColumnGroupHeaderParams) => string | string[]);
  
  /** Group header component name for custom rendering */
  headerComponent?: string;
  
  /** Group header component parameters */
  headerComponentParams?: any;
  
  /** Group header height override */
  headerHeight?: number;
  
  /** Whether the group can be collapsed/expanded */
  collapsible?: boolean;
  
  /** Initial collapsed state */
  collapsed?: boolean;
  
  /** Whether the group header is sticky during horizontal scroll */
  sticky?: boolean;
  
  /** Custom CSS properties for the group */
  cssProperties?: { [key: string]: string };
  
  /** Group level for multi-level nesting calculation */
  level?: number;
  
  /** Parent group reference */
  parent?: ColumnGroupDefinition;
  
  /** Visual styling options */
  visual?: ColumnGroupVisualOptions;
  
  /** Advanced grouping features */
  advanced?: ColumnGroupAdvancedOptions;
  
  /** Analytics and tracking */
  analytics?: ColumnGroupAnalyticsOptions;
  
  /** Performance optimizations */
  performance?: ColumnGroupPerformanceOptions;
  
  /** AI-enhanced features */
  aiFeatures?: ColumnGroupAIFeatures;
}

/**
 * Visual styling and animation options for column groups
 */
export interface ColumnGroupVisualOptions {
  /** Background gradient settings */
  gradient?: {
    enabled: boolean;
    startColor?: string;
    endColor?: string;
    direction?: 'horizontal' | 'vertical' | 'diagonal';
  };
  
  /** Shadow settings */
  shadow?: {
    enabled: boolean;
    color?: string;
    blur?: number;
    spread?: number;
    offsetX?: number;
    offsetY?: number;
  };
  
  /** Border customization */
  border?: {
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    color?: string;
    radius?: number;
  };
  
  /** Group icon configuration */
  icon?: {
    name?: string;
    position?: 'left' | 'right';
    color?: string;
    size?: number;
    customTemplate?: TemplateRef<any>;
  };
  
  /** Badge/indicator settings */
  badge?: {
    text?: string;
    color?: string;
    backgroundColor?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    visible?: boolean;
  };
  
  /** Progress indicator */
  progressIndicator?: {
    enabled: boolean;
    value?: number;
    max?: number;
    color?: string;
    position?: 'top' | 'bottom';
  };
  
  /** Animation settings */
  animations?: {
    expandCollapse?: ColumnGroupAnimation;
    hover?: ColumnGroupAnimation;
    focus?: ColumnGroupAnimation;
    highlight?: ColumnGroupAnimation;
  };
  
  /** Theme-specific overrides */
  themes?: {
    [themeName: string]: Partial<ColumnGroupVisualOptions>;
  };
}

/**
 * Advanced features beyond standard column grouping
 */
export interface ColumnGroupAdvancedOptions {
  /** Smart auto-grouping by data patterns */
  autoGrouping?: {
    enabled: boolean;
    strategy?: 'similarity' | 'dataType' | 'naming' | 'usage' | 'ai';
    threshold?: number;
    maxGroups?: number;
    preserveUserGroups?: boolean;
  };
  
  /** Conditional grouping based on viewport/context */
  conditionalGrouping?: {
    enabled: boolean;
    conditions: ColumnGroupCondition[];
  };
  
  /** Group-level aggregations and summaries */
  aggregations?: {
    enabled: boolean;
    functions: ('sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'mode' | 'custom')[];
    displayPosition?: 'header' | 'footer' | 'both';
    customAggregators?: { [key: string]: (values: any[]) => any };
  };
  
  /** Group state persistence across sessions */
  persistence?: {
    enabled: boolean;
    storageType?: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'custom';
    keyPrefix?: string;
    includeCollapsedState?: boolean;
    includeUserCustomizations?: boolean;
  };
  
  /** Responsive behavior for different screen sizes */
  responsive?: {
    enabled: boolean;
    breakpoints?: {
      [breakpoint: string]: Partial<ColumnGroupDefinition>;
    };
    autoCollapse?: boolean;
    priorityColumns?: string[];
  };
  
  /** Access control and permissions */
  permissions?: {
    view?: string[] | ((user: any) => boolean);
    modify?: string[] | ((user: any) => boolean);
    collapse?: string[] | ((user: any) => boolean);
    export?: string[] | ((user: any) => boolean);
  };
  
  /** Synchronization across multiple grid instances */
  synchronization?: {
    enabled: boolean;
    syncId?: string;
    syncProperties?: ('collapsed' | 'order' | 'visibility' | 'customizations')[];
    conflictResolution?: 'lastWrite' | 'merge' | 'custom';
  };
  
  /** Custom group operations */
  operations?: {
    sort?: boolean;
    filter?: boolean;
    hide?: boolean;
    export?: boolean;
    customActions?: ColumnGroupAction[];
  };
  
  /** Template library integration */
  templates?: {
    libraryId?: string;
    allowSave?: boolean;
    allowLoad?: boolean;
    categories?: string[];
  };
}

/**
 * Analytics and usage tracking for column groups
 */
export interface ColumnGroupAnalyticsOptions {
  /** Enable analytics tracking */
  enabled?: boolean;
  
  /** Track user interactions */
  trackInteractions?: {
    collapse?: boolean;
    expand?: boolean;
    reorder?: boolean;
    resize?: boolean;
    customActions?: boolean;
  };
  
  /** Usage metrics to collect */
  metrics?: {
    viewTime?: boolean;
    collapseFrequency?: boolean;
    resizeFrequency?: boolean;
    popularColumns?: boolean;
    performanceImpact?: boolean;
  };
  
  /** Custom analytics handlers */
  customHandlers?: {
    onInteraction?: (event: ColumnGroupInteractionEvent) => void;
    onMetric?: (metric: ColumnGroupMetric) => void;
    onError?: (error: Error, context: any) => void;
  };
  
  /** Data export for analysis */
  dataExport?: {
    enabled: boolean;
    format?: 'json' | 'csv' | 'custom';
    interval?: number;
    destination?: string;
  };
}

/**
 * Performance optimization settings
 */
export interface ColumnGroupPerformanceOptions {
  /** Virtual rendering for large group structures */
  virtualRendering?: {
    enabled: boolean;
    bufferSize?: number;
    itemHeight?: number;
  };
  
  /** Lazy loading configuration */
  lazyLoading?: {
    enabled: boolean;
    threshold?: number;
    chunkSize?: number;
  };
  
  /** Caching strategies */
  caching?: {
    enabled: boolean;
    maxSize?: number;
    ttl?: number;
    strategy?: 'lru' | 'fifo' | 'custom';
  };
  
  /** DOM update optimizations */
  domOptimizations?: {
    batchUpdates?: boolean;
    debounceTime?: number;
    useRequestAnimationFrame?: boolean;
    minimizeReflows?: boolean;
  };
  
  /** Memory management */
  memoryManagement?: {
    autoCleanup?: boolean;
    maxRetainedGroups?: number;
    gcInterval?: number;
  };
}

/**
 * AI-enhanced features for intelligent grouping
 */
export interface ColumnGroupAIFeatures {
  /** AI-suggested groupings */
  suggestions?: {
    enabled: boolean;
    provider?: 'local' | 'cloud' | 'custom';
    confidence?: number;
    maxSuggestions?: number;
    learningEnabled?: boolean;
  };
  
  /** Smart naming for auto-generated groups */
  smartNaming?: {
    enabled: boolean;
    strategy?: 'semantic' | 'pattern' | 'hybrid';
    customRules?: { [pattern: string]: string };
  };
  
  /** Predictive analytics */
  predictive?: {
    enabled: boolean;
    predictCollapseBehavior?: boolean;
    predictUsagePatterns?: boolean;
    adaptiveGrouping?: boolean;
  };
  
  /** Natural language processing */
  nlp?: {
    enabled: boolean;
    columnDescriptions?: boolean;
    groupDescriptions?: boolean;
    searchEnhancements?: boolean;
  };
}

/**
 * Animation configuration for group interactions
 */
export interface ColumnGroupAnimation {
  /** Animation type */
  type?: 'fade' | 'slide' | 'scale' | 'bounce' | 'elastic' | 'custom';
  
  /** Animation duration in milliseconds */
  duration?: number;
  
  /** Animation easing function */
  easing?: string;
  
  /** Animation delay */
  delay?: number;
  
  /** Custom keyframes for complex animations */
  keyframes?: { [key: string]: any }[];
  
  /** Animation triggers */
  triggers?: ('hover' | 'focus' | 'click' | 'collapse' | 'expand' | 'custom')[];
}

/**
 * Conditional grouping rules
 */
export interface ColumnGroupCondition {
  /** Condition identifier */
  id: string;
  
  /** Condition type */
  type: 'viewport' | 'data' | 'user' | 'time' | 'custom';
  
  /** Condition parameters */
  params: any;
  
  /** Action to take when condition is met */
  action: 'show' | 'hide' | 'collapse' | 'expand' | 'merge' | 'split';
  
  /** Priority for multiple conditions */
  priority?: number;
}

/**
 * Custom actions for column groups
 */
export interface ColumnGroupAction {
  /** Action identifier */
  id: string;
  
  /** Display name for the action */
  name: string;
  
  /** Action icon */
  icon?: string;
  
  /** Action handler function */
  handler: (group: ColumnGroupDefinition, context: any) => void | Promise<void>;
  
  /** Whether the action is available */
  enabled?: boolean | ((group: ColumnGroupDefinition) => boolean);
  
  /** Action visibility */
  visible?: boolean | ((group: ColumnGroupDefinition) => boolean);
  
  /** Action tooltip */
  tooltip?: string;
  
  /** Action shortcuts */
  shortcuts?: string[];
}

/**
 * Parameters passed to column group header components
 */
export interface ColumnGroupHeaderParams {
  /** Column group definition */
  columnGroup: ColumnGroupDefinition;
  
  /** Display name */
  displayName: string;
  
  /** API for group operations */
  api: ColumnGroupApi;
  
  /** Context object */
  context: any;
  
  /** Current collapsed state */
  collapsed: boolean;
  
  /** Available actions */
  actions: ColumnGroupAction[];
}

/**
 * API for column group operations
 */
export interface ColumnGroupApi {
  /** Toggle group collapsed state */
  toggleCollapsed(groupId: string): void;
  
  /** Set group collapsed state */
  setCollapsed(groupId: string, collapsed: boolean): void;
  
  /** Get group by ID */
  getGroup(groupId: string): ColumnGroupDefinition | null;
  
  /** Update group properties */
  updateGroup(groupId: string, updates: Partial<ColumnGroupDefinition>): void;
  
  /** Add group action */
  addGroupAction(groupId: string, action: ColumnGroupAction): void;
  
  /** Remove group action */
  removeGroupAction(groupId: string, actionId: string): void;
  
  /** Trigger group analytics event */
  triggerAnalyticsEvent(event: ColumnGroupInteractionEvent): void;
}

/**
 * Column group interaction events for analytics
 */
export interface ColumnGroupInteractionEvent {
  /** Event type */
  type: 'collapse' | 'expand' | 'reorder' | 'resize' | 'hover' | 'custom';
  
  /** Group ID */
  groupId: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** User identifier */
  userId?: string;
  
  /** Additional event data */
  data?: any;
  
  /** Event context */
  context?: any;
}

/**
 * Analytics metrics for column groups
 */
export interface ColumnGroupMetric {
  /** Metric type */
  type: 'performance' | 'usage' | 'error' | 'custom';
  
  /** Metric name */
  name: string;
  
  /** Metric value */
  value: number;
  
  /** Metric unit */
  unit?: string;
  
  /** Associated group ID */
  groupId?: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** Additional metadata */
  metadata?: any;
}

/**
 * Column group state for persistence
 */
export interface ColumnGroupState {
  /** Group collapsed states */
  collapsedStates: { [groupId: string]: boolean };
  
  /** Group order */
  order: string[];
  
  /** Group visibility */
  visibility: { [groupId: string]: boolean };
  
  /** User customizations */
  customizations: { [groupId: string]: any };
  
  /** State version for migration */
  version: string;
  
  /** State timestamp */
  timestamp: number;
}

/**
 * Column group template for reusability
 */
export interface ColumnGroupTemplate {
  /** Template identifier */
  id: string;
  
  /** Template name */
  name: string;
  
  /** Template description */
  description?: string;
  
  /** Template category */
  category?: string;
  
  /** Template author */
  author?: string;
  
  /** Template version */
  version?: string;
  
  /** Template creation date */
  createdAt?: Date;
  
  /** Template modification date */
  updatedAt?: Date;
  
  /** Template tags */
  tags?: string[];
  
  /** Template preview image */
  preview?: string;
  
  /** Column group definitions */
  groups: ColumnGroupDefinition[];
  
  /** Template metadata */
  metadata?: any;
}

/**
 * Export configuration for column groups
 */
export interface ColumnGroupExportOptions {
  /** Include group hierarchy in export */
  includeHierarchy?: boolean;
  
  /** Export format */
  format?: 'excel' | 'csv' | 'pdf' | 'json' | 'xml';
  
  /** Preserve group styling */
  preserveStyling?: boolean;
  
  /** Include group aggregations */
  includeAggregations?: boolean;
  
  /** Custom export handlers */
  customHandlers?: { [format: string]: (groups: ColumnGroupDefinition[]) => Promise<any> };
}