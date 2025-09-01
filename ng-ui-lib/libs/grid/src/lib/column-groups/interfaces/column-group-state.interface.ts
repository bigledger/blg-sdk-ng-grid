import { Signal } from '@angular/core';
import { ColumnGroupDefinition, ColumnGroupState, ColumnGroupTemplate } from './column-group.interface';

/**
 * Column Group Manager State - Advanced state management for column groups
 * Utilizes Angular Signals for reactive state management
 */
export interface ColumnGroupManagerState {
  /** All column group definitions */
  readonly groups: Signal<ColumnGroupDefinition[]>;
  
  /** Flattened group hierarchy for quick access */
  readonly flatGroups: Signal<{ [id: string]: ColumnGroupDefinition }>;
  
  /** Collapsed state of groups */
  readonly collapsedStates: Signal<{ [groupId: string]: boolean }>;
  
  /** Group visibility states */
  readonly visibilityStates: Signal<{ [groupId: string]: boolean }>;
  
  /** Current group order */
  readonly groupOrder: Signal<string[]>;
  
  /** Loading states for async operations */
  readonly loadingStates: Signal<{ [operation: string]: boolean }>;
  
  /** Error states */
  readonly errorStates: Signal<{ [operation: string]: Error | null }>;
  
  /** Available group templates */
  readonly templates: Signal<ColumnGroupTemplate[]>;
  
  /** Current active template */
  readonly activeTemplate: Signal<ColumnGroupTemplate | null>;
  
  /** Group analytics data */
  readonly analyticsData: Signal<ColumnGroupAnalyticsData>;
  
  /** Performance metrics */
  readonly performanceMetrics: Signal<ColumnGroupPerformanceMetrics>;
  
  /** AI suggestions state */
  readonly aiSuggestions: Signal<ColumnGroupAISuggestion[]>;
  
  /** Synchronization status */
  readonly syncStatus: Signal<ColumnGroupSyncStatus>;
  
  /** User preferences */
  readonly userPreferences: Signal<ColumnGroupUserPreferences>;
  
  /** Responsive state */
  readonly responsiveState: Signal<ColumnGroupResponsiveState>;
}

/**
 * Analytics data structure for column groups
 */
export interface ColumnGroupAnalyticsData {
  /** Interaction counts by group */
  interactionCounts: { [groupId: string]: { [interaction: string]: number } };
  
  /** Usage patterns */
  usagePatterns: {
    mostUsedGroups: string[];
    leastUsedGroups: string[];
    averageInteractionTime: number;
    peakUsageHours: number[];
  };
  
  /** Performance impact analysis */
  performanceImpact: {
    renderTimes: { [groupId: string]: number[] };
    memoryUsage: { [groupId: string]: number };
    scrollPerformance: number;
  };
  
  /** User behavior insights */
  behaviorInsights: {
    preferredGroupStructures: string[];
    commonCustomizations: any[];
    abandonmentPoints: string[];
  };
  
  /** Trend data */
  trends: {
    daily: { [date: string]: any };
    weekly: { [week: string]: any };
    monthly: { [month: string]: any };
  };
}

/**
 * Performance metrics for column groups
 */
export interface ColumnGroupPerformanceMetrics {
  /** Rendering performance */
  rendering: {
    averageRenderTime: number;
    maxRenderTime: number;
    renderCount: number;
    lastRenderTime: number;
  };
  
  /** Memory usage */
  memory: {
    currentUsage: number;
    peakUsage: number;
    averageUsage: number;
    gcEvents: number;
  };
  
  /** Virtual scrolling performance */
  virtualScrolling: {
    bufferEfficiency: number;
    scrollFps: number;
    virtualizedItemCount: number;
  };
  
  /** Animation performance */
  animations: {
    averageFrameRate: number;
    droppedFrames: number;
    animationCount: number;
  };
  
  /** Network performance (for sync operations) */
  network: {
    syncLatency: number;
    syncErrors: number;
    bandwidth: number;
  };
}

/**
 * AI suggestion data structure
 */
export interface ColumnGroupAISuggestion {
  /** Suggestion identifier */
  id: string;
  
  /** Suggestion type */
  type: 'grouping' | 'naming' | 'ordering' | 'optimization';
  
  /** Suggestion title */
  title: string;
  
  /** Suggestion description */
  description: string;
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Suggested changes */
  changes: any;
  
  /** Rationale for the suggestion */
  rationale: string;
  
  /** Expected benefits */
  benefits: string[];
  
  /** Potential risks */
  risks: string[];
  
  /** Implementation complexity */
  complexity: 'low' | 'medium' | 'high';
  
  /** Estimated impact */
  impact: 'low' | 'medium' | 'high';
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Expiration timestamp */
  expiresAt?: Date;
  
  /** User feedback on suggestion */
  feedback?: {
    rating: number;
    implemented: boolean;
    comments?: string;
  };
}

/**
 * Synchronization status across multiple grid instances
 */
export interface ColumnGroupSyncStatus {
  /** Sync enabled state */
  enabled: boolean;
  
  /** Sync identifier */
  syncId: string;
  
  /** Connection status */
  connected: boolean;
  
  /** Last sync timestamp */
  lastSync: Date;
  
  /** Pending changes count */
  pendingChanges: number;
  
  /** Sync conflicts */
  conflicts: ColumnGroupSyncConflict[];
  
  /** Connected peers */
  peers: string[];
  
  /** Sync protocol version */
  protocolVersion: string;
  
  /** Network status */
  networkStatus: 'online' | 'offline' | 'degraded';
}

/**
 * Sync conflict information
 */
export interface ColumnGroupSyncConflict {
  /** Conflict identifier */
  id: string;
  
  /** Conflict type */
  type: 'state' | 'order' | 'visibility' | 'customization';
  
  /** Group ID involved */
  groupId: string;
  
  /** Local value */
  localValue: any;
  
  /** Remote value */
  remoteValue: any;
  
  /** Conflict timestamp */
  timestamp: Date;
  
  /** Resolution strategy */
  resolutionStrategy: 'local' | 'remote' | 'merge' | 'manual';
  
  /** Resolution status */
  resolved: boolean;
}

/**
 * User preferences for column groups
 */
export interface ColumnGroupUserPreferences {
  /** Default group collapse behavior */
  defaultCollapsed: boolean;
  
  /** Animation preferences */
  animationsEnabled: boolean;
  
  /** Auto-grouping preferences */
  autoGroupingEnabled: boolean;
  
  /** Preferred grouping strategy */
  preferredGroupingStrategy: string;
  
  /** UI density preference */
  density: 'compact' | 'comfortable' | 'spacious';
  
  /** Theme preferences */
  theme: string;
  
  /** Accessibility preferences */
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigationEnhanced: boolean;
  };
  
  /** Notification preferences */
  notifications: {
    aiSuggestions: boolean;
    performanceWarnings: boolean;
    syncUpdates: boolean;
  };
  
  /** Privacy preferences */
  privacy: {
    analyticsEnabled: boolean;
    dataCollection: 'none' | 'basic' | 'full';
    shareUsageData: boolean;
  };
}

/**
 * Responsive state for different screen sizes
 */
export interface ColumnGroupResponsiveState {
  /** Current breakpoint */
  currentBreakpoint: string;
  
  /** Available breakpoints */
  breakpoints: { [name: string]: number };
  
  /** Screen dimensions */
  screenSize: {
    width: number;
    height: number;
  };
  
  /** Viewport dimensions */
  viewportSize: {
    width: number;
    height: number;
  };
  
  /** Auto-collapsed groups for current viewport */
  autoCollapsedGroups: string[];
  
  /** Hidden groups for current viewport */
  hiddenGroups: string[];
  
  /** Priority order for responsive behavior */
  priorityOrder: string[];
  
  /** Touch device detection */
  touchDevice: boolean;
  
  /** Mobile device detection */
  mobileDevice: boolean;
}

/**
 * Column Group Action State for operations
 */
export interface ColumnGroupActionState {
  /** Currently executing actions */
  executingActions: { [actionId: string]: boolean };
  
  /** Action results */
  actionResults: { [actionId: string]: any };
  
  /** Action errors */
  actionErrors: { [actionId: string]: Error };
  
  /** Action history */
  actionHistory: ColumnGroupActionHistoryEntry[];
  
  /** Undo/redo stack */
  undoRedoStack: {
    undoStack: ColumnGroupActionHistoryEntry[];
    redoStack: ColumnGroupActionHistoryEntry[];
    maxSize: number;
  };
}

/**
 * Action history entry
 */
export interface ColumnGroupActionHistoryEntry {
  /** Action identifier */
  actionId: string;
  
  /** Action name */
  actionName: string;
  
  /** Action parameters */
  parameters: any;
  
  /** Previous state */
  previousState: any;
  
  /** New state */
  newState: any;
  
  /** Execution timestamp */
  timestamp: Date;
  
  /** User identifier */
  userId?: string;
  
  /** Action duration */
  duration: number;
  
  /** Success flag */
  success: boolean;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Template management state
 */
export interface ColumnGroupTemplateState {
  /** Available templates */
  availableTemplates: Signal<ColumnGroupTemplate[]>;
  
  /** User templates */
  userTemplates: Signal<ColumnGroupTemplate[]>;
  
  /** System templates */
  systemTemplates: Signal<ColumnGroupTemplate[]>;
  
  /** Currently loading template */
  loadingTemplate: Signal<string | null>;
  
  /** Template validation errors */
  validationErrors: Signal<{ [templateId: string]: string[] }>;
  
  /** Template usage statistics */
  usageStats: Signal<{ [templateId: string]: ColumnGroupTemplateUsage }>;
  
  /** Template categories */
  categories: Signal<string[]>;
  
  /** Search and filter state */
  searchState: Signal<{
    query: string;
    filters: { [key: string]: any };
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }>;
}

/**
 * Template usage statistics
 */
export interface ColumnGroupTemplateUsage {
  /** Usage count */
  usageCount: number;
  
  /** Last used timestamp */
  lastUsed: Date;
  
  /** Average rating */
  averageRating: number;
  
  /** User feedback count */
  feedbackCount: number;
  
  /** Success rate */
  successRate: number;
}

/**
 * Drag and Drop State for column group reorganization
 */
export interface ColumnGroupDragDropState {
  /** Currently dragging group */
  draggingGroup: Signal<ColumnGroupDefinition | null>;
  
  /** Drag source */
  dragSource: Signal<string | null>;
  
  /** Drop target */
  dropTarget: Signal<string | null>;
  
  /** Valid drop zones */
  validDropZones: Signal<string[]>;
  
  /** Drag operation type */
  dragOperation: Signal<'move' | 'copy' | 'reorder' | null>;
  
  /** Drag preview data */
  dragPreview: Signal<{
    element?: HTMLElement;
    offset?: { x: number; y: number };
    size?: { width: number; height: number };
  }>;
  
  /** Drop indicators */
  dropIndicators: Signal<{
    [zoneId: string]: {
      position: { x: number; y: number };
      visible: boolean;
      type: 'before' | 'after' | 'inside';
    };
  }>;
}