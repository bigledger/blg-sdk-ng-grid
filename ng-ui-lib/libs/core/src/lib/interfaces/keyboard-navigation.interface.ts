/**
 * Keyboard Navigation and Accessibility Interfaces for BLG Grid
 * 
 * These interfaces define the comprehensive keyboard navigation system
 * that exceeds ag-grid's accessibility features with WCAG 2.1 AAA compliance
 */

/**
 * Navigation modes supported by BLG Grid
 */
export type NavigationMode = 
  | 'standard'      // Standard arrow key navigation
  | 'vi'           // Vi/Vim modal navigation (NEW)
  | 'wasd'         // Gaming-style WASD navigation (NEW)
  | 'accessibility' // High accessibility mode with enhanced screen reader support
  | 'knight'       // Chess knight navigation pattern (NEW)
  | 'diagonal';    // Diagonal navigation pattern (NEW)

/**
 * Focus position within the grid
 */
export interface FocusPosition {
  /** Zero-based row index */
  row: number;
  
  /** Zero-based column index */
  column: number;
  
  /** Cell identifier for virtual scrolling performance */
  cellId?: string;
  
  /** Whether this cell is currently editable */
  editable?: boolean;
  
  /** ARIA label for screen readers */
  ariaLabel?: string;
}

/**
 * Navigation history entry for breadcrumb navigation
 */
export interface NavigationHistory {
  /** Position in the grid */
  position: FocusPosition;
  
  /** Timestamp of navigation */
  timestamp: number;
  
  /** Navigation action that led to this position */
  action?: string;
  
  /** User context (optional) */
  context?: Record<string, any>;
}

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Key combination (e.g., 'Ctrl+A', 'F2') */
  key: string;
  
  /** Handler function */
  handler: () => void;
  
  /** Human-readable description */
  description: string;
  
  /** Navigation modes where this shortcut is active */
  modes: NavigationMode[];
  
  /** Whether this shortcut is enabled */
  enabled?: boolean;
  
  /** Accessibility override for screen readers */
  ariaLabel?: string;
  
  /** Custom conditions for when shortcut is available */
  condition?: () => boolean;
  
  /** Priority for conflicting shortcuts */
  priority?: number;
}

/**
 * Navigation event types
 */
export type NavigationEventType = 
  | 'focus-changed'
  | 'mode-changed'
  | 'shortcut-executed'
  | 'voice-command'
  | 'gesture-detected'
  | 'macro-recorded'
  | 'macro-played'
  | 'selection-changed'
  | 'edit-started'
  | 'edit-ended'
  | 'navigation-boundary'
  | 'accessibility-announcement';

/**
 * Navigation event data
 */
export interface NavigationEvent {
  /** Event type */
  type: NavigationEventType;
  
  /** Event timestamp */
  timestamp: number;
  
  /** Focus position (for focus-changed events) */
  position?: FocusPosition;
  
  /** Navigation mode (for mode-changed events) */
  mode?: NavigationMode;
  
  /** Shortcut key (for shortcut-executed events) */
  shortcut?: string;
  
  /** Voice command transcript (for voice-command events) */
  voiceCommand?: string;
  
  /** Gesture type (for gesture-detected events) */
  gesture?: string;
  
  /** Macro name (for macro events) */
  macroName?: string;
  
  /** Selection data (for selection-changed events) */
  selection?: {
    type: 'single' | 'range' | 'multiple';
    rows: number[];
    columns?: number[];
  };
  
  /** Edit data (for edit events) */
  edit?: {
    row: number;
    column: number;
    oldValue?: any;
    newValue?: any;
  };
  
  /** Accessibility announcement */
  announcement?: string;
  
  /** Additional event data */
  metadata?: Record<string, any>;
}

/**
 * Voice command configuration
 */
export interface VoiceCommand {
  /** Command phrase */
  phrase: string;
  
  /** Handler function */
  handler: () => void;
  
  /** Alternative phrases */
  alternatives?: string[];
  
  /** Language code */
  language?: string;
  
  /** Confidence threshold (0-1) */
  confidence?: number;
  
  /** Whether command requires confirmation */
  requiresConfirmation?: boolean;
}

/**
 * Gesture recognition configuration
 */
export interface GestureConfig {
  /** Gesture name */
  name: string;
  
  /** Gesture pattern */
  pattern: {
    /** Minimum distance threshold */
    minDistance: number;
    
    /** Maximum time duration (ms) */
    maxDuration: number;
    
    /** Direction constraints */
    direction?: 'horizontal' | 'vertical' | 'diagonal' | 'any';
    
    /** Touch point requirements */
    touchPoints?: number;
  };
  
  /** Handler function */
  handler: (gesture: GestureData) => void;
  
  /** Whether gesture is enabled */
  enabled?: boolean;
}

/**
 * Gesture data
 */
export interface GestureData {
  /** Gesture type */
  type: string;
  
  /** Start position */
  startPosition: { x: number; y: number };
  
  /** End position */
  endPosition: { x: number; y: number };
  
  /** Duration in milliseconds */
  duration: number;
  
  /** Velocity */
  velocity: number;
  
  /** Direction in degrees (0-360) */
  direction: number;
  
  /** Touch points used */
  touchPoints: number;
}

/**
 * Macro definition
 */
export interface Macro {
  /** Macro name */
  name: string;
  
  /** Recorded events */
  events: KeyboardEvent[];
  
  /** Creation timestamp */
  created: number;
  
  /** Last used timestamp */
  lastUsed?: number;
  
  /** Usage count */
  usageCount?: number;
  
  /** Description */
  description?: string;
  
  /** Tags for organization */
  tags?: string[];
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  /** High contrast mode */
  highContrast?: boolean;
  
  /** Reduced motion */
  reducedMotion?: boolean;
  
  /** Screen reader optimizations */
  screenReader?: {
    /** Announce all navigation changes */
    announceNavigation?: boolean;
    
    /** Announce cell content changes */
    announceCellChanges?: boolean;
    
    /** Announce selection changes */
    announceSelection?: boolean;
    
    /** Custom announcement templates */
    templates?: {
      navigation?: string;
      selection?: string;
      edit?: string;
    };
  };
  
  /** Focus indicators */
  focusIndicators?: {
    /** Enhanced visibility */
    enhanced?: boolean;
    
    /** Custom focus ring colors */
    colors?: {
      primary?: string;
      secondary?: string;
    };
    
    /** Focus ring thickness */
    thickness?: number;
    
    /** Animation for focus changes */
    animated?: boolean;
  };
  
  /** Keyboard navigation preferences */
  keyboard?: {
    /** Repeat delay for held keys (ms) */
    repeatDelay?: number;
    
    /** Repeat rate for held keys (ms) */
    repeatRate?: number;
    
    /** Skip disabled cells */
    skipDisabled?: boolean;
    
    /** Wrap around at boundaries */
    wrapAround?: boolean;
  };
  
  /** Voice feedback */
  voice?: {
    /** Enable text-to-speech */
    enabled?: boolean;
    
    /** Voice settings */
    voice?: {
      /** Voice name */
      name?: string;
      
      /** Speech rate (0.1-10) */
      rate?: number;
      
      /** Speech pitch (0-2) */
      pitch?: number;
      
      /** Speech volume (0-1) */
      volume?: number;
    };
    
    /** What to announce */
    announce?: {
      navigation?: boolean;
      selection?: boolean;
      editing?: boolean;
      errors?: boolean;
    };
  };
  
  /** Haptic feedback (mobile) */
  haptic?: {
    /** Enable haptic feedback */
    enabled?: boolean;
    
    /** Feedback intensity */
    intensity?: 'light' | 'medium' | 'heavy';
    
    /** Feedback patterns */
    patterns?: {
      navigation?: number | number[];
      selection?: number | number[];
      edit?: number | number[];
      error?: number | number[];
    };
  };
}

/**
 * Vi/Vim mode configuration
 */
export interface ViModeConfig {
  /** Current Vi mode */
  mode: 'normal' | 'insert' | 'visual' | 'command';
  
  /** Command buffer for multi-key commands */
  commandBuffer: string;
  
  /** Vi command definitions */
  commands: Map<string, ViCommand>;
  
  /** Visual selection range */
  visualRange?: {
    start: FocusPosition;
    end: FocusPosition;
  };
  
  /** Register system for yanking/pasting */
  registers: Map<string, any>;
  
  /** Search history */
  searchHistory: string[];
  
  /** Command history */
  commandHistory: string[];
}

/**
 * Vi command definition
 */
export interface ViCommand {
  /** Command pattern (e.g., 'dd', 'yy', '3j') */
  pattern: string | RegExp;
  
  /** Handler function */
  handler: (match: RegExpMatchArray | null, count?: number) => void;
  
  /** Description */
  description: string;
  
  /** Valid modes where command works */
  modes: ('normal' | 'visual' | 'command')[];
  
  /** Whether command accepts count prefix */
  acceptsCount?: boolean;
  
  /** Whether command accepts motion */
  acceptsMotion?: boolean;
}

/**
 * Smart selection criteria
 */
export interface SelectionCriteria {
  /** Column to match */
  column?: string;
  
  /** Comparison operator */
  operator?: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
  
  /** Value to compare against */
  value?: any;
  
  /** Case sensitive matching */
  caseSensitive?: boolean;
  
  /** Multiple criteria combination */
  combination?: 'and' | 'or';
  
  /** Nested criteria for complex selections */
  children?: SelectionCriteria[];
}

/**
 * Performance optimization configuration
 */
export interface NavigationPerformanceConfig {
  /** Debounce time for rapid navigation (ms) */
  debounceTime?: number;
  
  /** Virtual scrolling threshold (number of rows) */
  virtualScrollThreshold?: number;
  
  /** Maximum history entries to keep */
  maxHistoryEntries?: number;
  
  /** Whether to use RAF for smooth animations */
  useRequestAnimationFrame?: boolean;
  
  /** Batch size for bulk operations */
  batchSize?: number;
  
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
}

/**
 * Custom navigation pattern
 */
export interface NavigationPattern {
  /** Pattern name */
  name: string;
  
  /** Pattern description */
  description: string;
  
  /** Movement function */
  move: (currentPosition: FocusPosition, direction: string, count?: number) => FocusPosition;
  
  /** Available directions */
  directions: string[];
  
  /** Pattern-specific shortcuts */
  shortcuts?: KeyboardShortcut[];
  
  /** Whether pattern supports range selection */
  supportsRangeSelection?: boolean;
}

/**
 * Keyboard navigation service configuration
 */
export interface KeyboardNavigationConfig {
  /** Default navigation mode */
  defaultMode?: NavigationMode;
  
  /** Accessibility settings */
  accessibility?: AccessibilityConfig;
  
  /** Vi mode configuration */
  viMode?: Partial<ViModeConfig>;
  
  /** Performance settings */
  performance?: NavigationPerformanceConfig;
  
  /** Custom shortcuts */
  customShortcuts?: KeyboardShortcut[];
  
  /** Voice commands */
  voiceCommands?: VoiceCommand[];
  
  /** Gesture recognition */
  gestures?: GestureConfig[];
  
  /** Custom navigation patterns */
  customPatterns?: NavigationPattern[];
  
  /** Macro settings */
  macros?: {
    /** Maximum number of macros to store */
    maxMacros?: number;
    
    /** Auto-save macros */
    autoSave?: boolean;
    
    /** Macro storage key for persistence */
    storageKey?: string;
  };
}

/**
 * Navigation context for conditional shortcuts
 */
export interface NavigationContext {
  /** Current focus position */
  focus: FocusPosition | null;
  
  /** Current navigation mode */
  mode: NavigationMode;
  
  /** Whether currently editing */
  isEditing: boolean;
  
  /** Selected rows */
  selectedRows: Set<number>;
  
  /** Grid dimensions */
  gridSize: {
    rows: number;
    columns: number;
  };
  
  /** Visible viewport */
  viewport: {
    firstRow: number;
    lastRow: number;
    firstColumn: number;
    lastColumn: number;
  };
  
  /** Filter/sort state */
  dataState: {
    filtered: boolean;
    sorted: boolean;
    grouped: boolean;
  };
}

/**
 * Accessibility announcement data
 */
export interface AccessibilityAnnouncement {
  /** Announcement message */
  message: string;
  
  /** Priority level */
  priority: 'low' | 'medium' | 'high';
  
  /** ARIA live region type */
  liveType?: 'polite' | 'assertive';
  
  /** Whether to interrupt current announcement */
  interrupt?: boolean;
  
  /** Additional ARIA attributes */
  ariaAttributes?: Record<string, string>;
  
  /** Whether to also use text-to-speech */
  useTTS?: boolean;
}