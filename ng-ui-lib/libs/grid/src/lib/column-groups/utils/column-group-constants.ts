import { ColumnGroupDefinition, ColumnGroupAnimation } from '../interfaces/column-group.interface';
import { ColumnGroupsConfig } from '../index';

/**
 * Constants and default configurations for Column Groups
 * Provides standardized defaults and presets for the advanced grouping system
 */

/**
 * Default configuration for column groups
 */
export const DEFAULT_GROUP_CONFIG: Partial<ColumnGroupDefinition> = {
  collapsible: true,
  collapsed: false,
  sticky: false,
  headerHeight: 40,
  cssProperties: {},
  visual: {
    gradient: {
      enabled: false,
      startColor: '#f8f9fa',
      endColor: '#ffffff',
      direction: 'horizontal'
    },
    shadow: {
      enabled: false,
      color: 'rgba(0, 0, 0, 0.1)',
      blur: 4,
      spread: 0,
      offsetX: 0,
      offsetY: 2
    },
    border: {
      width: 1,
      style: 'solid',
      color: '#dee2e6',
      radius: 6
    },
    animations: {
      expandCollapse: {
        type: 'slide',
        duration: 300,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      },
      hover: {
        type: 'scale',
        duration: 200,
        easing: 'ease-out'
      }
    }
  },
  advanced: {
    autoGrouping: {
      enabled: false,
      strategy: 'similarity',
      threshold: 0.7,
      maxGroups: 10,
      preserveUserGroups: true
    },
    persistence: {
      enabled: true,
      storageType: 'localStorage',
      keyPrefix: 'blg-column-groups',
      includeCollapsedState: true,
      includeUserCustomizations: true
    },
    responsive: {
      enabled: true,
      breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        large: 1440
      },
      autoCollapse: true,
      priorityColumns: []
    },
    permissions: {
      view: [],
      modify: [],
      collapse: [],
      export: []
    }
  },
  analytics: {
    enabled: true,
    trackInteractions: {
      collapse: true,
      expand: true,
      reorder: true,
      resize: true,
      customActions: true
    },
    metrics: {
      viewTime: true,
      collapseFrequency: true,
      resizeFrequency: true,
      popularColumns: true,
      performanceImpact: true
    }
  },
  performance: {
    virtualRendering: {
      enabled: false,
      bufferSize: 10,
      itemHeight: 40
    },
    lazyLoading: {
      enabled: false,
      threshold: 100,
      chunkSize: 50
    },
    caching: {
      enabled: true,
      maxSize: 100,
      ttl: 300000, // 5 minutes
      strategy: 'lru'
    },
    domOptimizations: {
      batchUpdates: true,
      debounceTime: 16,
      useRequestAnimationFrame: true,
      minimizeReflows: true
    }
  }
};

/**
 * Animation presets for different interactions
 */
export const ANIMATION_PRESETS: { [key: string]: ColumnGroupAnimation } = {
  // Expand/Collapse animations
  slideDown: {
    type: 'slide',
    duration: 300,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    triggers: ['expand', 'collapse']
  },
  
  slideUpFast: {
    type: 'slide',
    duration: 200,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    triggers: ['expand', 'collapse']
  },
  
  fadeInOut: {
    type: 'fade',
    duration: 250,
    easing: 'ease-in-out',
    triggers: ['expand', 'collapse']
  },
  
  scaleInOut: {
    type: 'scale',
    duration: 300,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    triggers: ['expand', 'collapse']
  },
  
  // Hover animations
  gentleHover: {
    type: 'scale',
    duration: 200,
    easing: 'ease-out',
    triggers: ['hover']
  },
  
  liftHover: {
    type: 'lift',
    duration: 150,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    triggers: ['hover']
  },
  
  glowHover: {
    type: 'glow',
    duration: 300,
    easing: 'ease-in-out',
    triggers: ['hover']
  },
  
  // Focus animations
  focusGlow: {
    type: 'glow',
    duration: 200,
    easing: 'ease-out',
    triggers: ['focus']
  },
  
  focusScale: {
    type: 'scale',
    duration: 150,
    easing: 'ease-out',
    triggers: ['focus']
  },
  
  // Drag animations
  dragLift: {
    type: 'lift',
    duration: 250,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    triggers: ['dragStart']
  },
  
  dragDrop: {
    type: 'drop',
    duration: 400,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    triggers: ['dragEnd']
  },
  
  // Error/Success animations
  errorShake: {
    type: 'shake',
    duration: 500,
    easing: 'ease-in-out',
    triggers: ['error']
  },
  
  successBounce: {
    type: 'bounce',
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    triggers: ['success']
  }
};

/**
 * AI confidence thresholds for different operations
 */
export const AI_CONFIDENCE_THRESHOLDS = {
  // Suggestion acceptance thresholds
  AUTO_ACCEPT: 0.95,        // Automatically apply suggestions above this threshold
  HIGH_CONFIDENCE: 0.85,    // Show as high-confidence suggestions
  MEDIUM_CONFIDENCE: 0.70,  // Show as medium-confidence suggestions
  LOW_CONFIDENCE: 0.55,     // Show as low-confidence suggestions
  MIN_VIABLE: 0.40,         // Minimum threshold to show suggestions
  
  // Strategy-specific thresholds
  SEMANTIC_GROUPING: 0.75,  // Semantic similarity grouping
  STRUCTURAL_GROUPING: 0.80, // Data type and configuration grouping
  USAGE_GROUPING: 0.65,     // Usage pattern grouping
  NAMING_GROUPING: 0.70,    // Naming convention grouping
  DOMAIN_GROUPING: 0.85,    // Domain-specific grouping
  
  // Learning and adaptation thresholds
  FEEDBACK_LEARNING: 0.60,  // Minimum confidence to learn from feedback
  MODEL_RETRAINING: 0.50,   // Trigger model retraining below this accuracy
  SUGGESTION_EXPIRY: 0.30   // Remove suggestions below this confidence over time
} as const;

/**
 * Performance thresholds and limits
 */
export const PERFORMANCE_THRESHOLDS = {
  // Rendering performance
  MAX_RENDER_TIME: 100,     // Maximum acceptable render time (ms)
  TARGET_RENDER_TIME: 50,   // Target render time (ms)
  RENDER_WARNING_TIME: 75,  // Show warning above this time (ms)
  
  // Animation performance
  MIN_FRAME_RATE: 30,       // Minimum acceptable frame rate (fps)
  TARGET_FRAME_RATE: 60,    // Target frame rate (fps)
  MAX_DROPPED_FRAMES: 5,    // Maximum dropped frames before degrading
  
  // Memory usage
  MAX_MEMORY_USAGE: 100 * 1024 * 1024, // 100MB maximum memory usage
  WARNING_MEMORY_USAGE: 75 * 1024 * 1024, // 75MB warning threshold
  TARGET_MEMORY_USAGE: 50 * 1024 * 1024,  // 50MB target usage
  
  // Group structure limits
  MAX_NESTING_DEPTH: 20,    // Maximum nesting depth
  RECOMMENDED_NESTING_DEPTH: 5, // Recommended maximum depth
  MAX_GROUPS_PER_LEVEL: 50, // Maximum groups at one level
  MAX_TOTAL_GROUPS: 1000,   // Maximum total groups
  MAX_COLUMNS_PER_GROUP: 100, // Maximum columns in one group
  
  // Virtual scrolling
  VIRTUAL_SCROLL_THRESHOLD: 50, // Enable virtual scrolling above this many groups
  VIRTUAL_BUFFER_SIZE: 10,  // Number of items to render outside viewport
  
  // Caching and optimization
  CACHE_MAX_SIZE: 1000,     // Maximum cached items
  CACHE_TTL: 300000,        // Cache time-to-live (5 minutes)
  DEBOUNCE_TIME: 16,        // Animation frame debounce time (ms)
  
  // Analytics and monitoring
  ANALYTICS_SAMPLE_RATE: 0.1, // Sample 10% of events for analytics
  METRICS_COLLECTION_INTERVAL: 5000, // Collect metrics every 5 seconds
  ERROR_REPORTING_THRESHOLD: 0.01     // Report errors if rate > 1%
} as const;

/**
 * Predefined group templates for common use cases
 */
export const BUILT_IN_TEMPLATES = {
  BASIC_INFO: {
    id: 'basic-info',
    name: 'Basic Information',
    description: 'Standard information columns grouped logically',
    category: 'General',
    groups: [
      {
        id: 'identification',
        headerName: 'Identification',
        children: [] // Would be populated with ID, name, reference columns
      },
      {
        id: 'contact',
        headerName: 'Contact Information',
        children: [] // Would be populated with email, phone, address columns
      },
      {
        id: 'metadata',
        headerName: 'Metadata',
        children: [] // Would be populated with created, modified, status columns
      }
    ]
  },
  
  FINANCIAL: {
    id: 'financial',
    name: 'Financial Data',
    description: 'Financial and accounting column groupings',
    category: 'Finance',
    groups: [
      {
        id: 'amounts',
        headerName: 'Amounts',
        children: [] // Price, cost, total, tax columns
      },
      {
        id: 'dates',
        headerName: 'Financial Dates',
        children: [] // Invoice date, due date, payment date columns
      },
      {
        id: 'accounting',
        headerName: 'Accounting',
        children: [] // Account codes, categories, GL accounts
      }
    ]
  },
  
  ECOMMERCE: {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Product and order management groupings',
    category: 'Retail',
    groups: [
      {
        id: 'product-info',
        headerName: 'Product Information',
        children: [] // Name, description, category, SKU columns
      },
      {
        id: 'pricing',
        headerName: 'Pricing & Inventory',
        children: [] // Price, discount, stock, availability columns
      },
      {
        id: 'shipping',
        headerName: 'Shipping',
        children: [] // Weight, dimensions, shipping cost columns
      }
    ]
  },
  
  CRM: {
    id: 'crm',
    name: 'Customer Relationship Management',
    description: 'Customer and lead management groupings',
    category: 'Sales',
    groups: [
      {
        id: 'customer-details',
        headerName: 'Customer Details',
        children: [] // Name, company, title, contact info
      },
      {
        id: 'engagement',
        headerName: 'Engagement',
        children: [] // Last contact, score, status, source
      },
      {
        id: 'opportunities',
        headerName: 'Opportunities',
        children: [] // Deal value, stage, probability, close date
      }
    ]
  },
  
  PROJECT_MANAGEMENT: {
    id: 'project-management',
    name: 'Project Management',
    description: 'Task and project tracking groupings',
    category: 'Management',
    groups: [
      {
        id: 'task-info',
        headerName: 'Task Information',
        children: [] // Title, description, type, priority
      },
      {
        id: 'timeline',
        headerName: 'Timeline',
        children: [] // Start date, due date, duration, progress
      },
      {
        id: 'assignment',
        headerName: 'Assignment',
        children: [] // Assignee, team, reviewer, status
      }
    ]
  }
} as const;

/**
 * Responsive breakpoints configuration
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: {
    maxWidth: 480,
    grouping: {
      maxNestingDepth: 2,
      autoCollapse: true,
      hideNonEssential: true,
      minGroupSize: 3
    }
  },
  
  tablet: {
    maxWidth: 768,
    grouping: {
      maxNestingDepth: 3,
      autoCollapse: false,
      hideNonEssential: false,
      minGroupSize: 2
    }
  },
  
  desktop: {
    maxWidth: 1024,
    grouping: {
      maxNestingDepth: 5,
      autoCollapse: false,
      hideNonEssential: false,
      minGroupSize: 2
    }
  },
  
  large: {
    maxWidth: 1440,
    grouping: {
      maxNestingDepth: 10,
      autoCollapse: false,
      hideNonEssential: false,
      minGroupSize: 1
    }
  },
  
  xlarge: {
    maxWidth: Infinity,
    grouping: {
      maxNestingDepth: 20,
      autoCollapse: false,
      hideNonEssential: false,
      minGroupSize: 1
    }
  }
} as const;

/**
 * Theme configurations for different visual styles
 */
export const THEME_CONFIGURATIONS = {
  default: {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    borderRadius: '6px',
    shadows: {
      sm: '0 2px 4px rgba(0,0,0,0.1)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 25px rgba(0,0,0,0.15)'
    }
  },
  
  minimal: {
    colors: {
      primary: '#333333',
      secondary: '#999999',
      success: '#4caf50',
      warning: '#ff9800',
      danger: '#f44336',
      info: '#2196f3'
    },
    spacing: {
      xs: '2px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px'
    },
    borderRadius: '2px',
    shadows: {
      sm: 'none',
      md: '0 1px 2px rgba(0,0,0,0.1)',
      lg: '0 2px 4px rgba(0,0,0,0.1)'
    }
  },
  
  material: {
    colors: {
      primary: '#1976d2',
      secondary: '#424242',
      success: '#4caf50',
      warning: '#ff9800',
      danger: '#f44336',
      info: '#2196f3'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    borderRadius: '4px',
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
    }
  }
} as const;

/**
 * Accessibility configuration constants
 */
export const ACCESSIBILITY_CONFIG = {
  // ARIA roles and properties
  ROLES: {
    COLUMN_GROUP: 'columnheader',
    GROUP_CONTENT: 'group',
    BUTTON: 'button',
    MENU: 'menu',
    MENUITEM: 'menuitem'
  } as const,
  
  // Keyboard navigation
  KEYBOARD: {
    ENTER: 'Enter',
    SPACE: ' ',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    HOME: 'Home',
    END: 'End',
    ESCAPE: 'Escape',
    TAB: 'Tab'
  } as const,
  
  // Focus management
  FOCUS: {
    VISIBLE_FOCUS_STYLE: '2px solid #007bff',
    FOCUS_OUTLINE_OFFSET: '2px',
    MIN_TOUCH_TARGET: 44, // Minimum touch target size in pixels
    FOCUS_TRAP_SELECTOR: '[tabindex="0"], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
  } as const,
  
  // Screen reader announcements
  ANNOUNCEMENTS: {
    GROUP_EXPANDED: 'Group expanded',
    GROUP_COLLAPSED: 'Group collapsed',
    DRAG_START: 'Drag started',
    DRAG_END: 'Drag completed',
    REORDER_SUCCESS: 'Groups reordered successfully',
    VALIDATION_ERROR: 'Validation error occurred'
  } as const
} as const;

/**
 * Error messages and validation constants
 */
export const ERROR_MESSAGES = {
  VALIDATION: {
    MISSING_ID: 'Group ID is required',
    MISSING_HEADER: 'Group header name is required',
    DUPLICATE_ID: 'Duplicate group ID found',
    INVALID_NESTING: 'Maximum nesting depth exceeded',
    INVALID_COLUMN_REF: 'Invalid column reference',
    EMPTY_GROUP: 'Group cannot be empty'
  },
  
  PERFORMANCE: {
    RENDER_TIMEOUT: 'Render operation timed out',
    MEMORY_EXCEEDED: 'Memory usage limit exceeded',
    ANIMATION_DROPPED: 'Animation frames dropped',
    CACHE_OVERFLOW: 'Cache size limit exceeded'
  },
  
  AI: {
    MODEL_UNAVAILABLE: 'AI model is not available',
    INSUFFICIENT_DATA: 'Insufficient data for AI analysis',
    CONFIDENCE_TOO_LOW: 'AI confidence below minimum threshold',
    ANALYSIS_FAILED: 'AI analysis failed to complete'
  },
  
  ANALYTICS: {
    TRACKING_DISABLED: 'Analytics tracking is disabled',
    DATA_COLLECTION_FAILED: 'Failed to collect analytics data',
    EXPORT_FAILED: 'Failed to export analytics data'
  }
} as const;

/**
 * Feature flags for experimental and beta features
 */
export const FEATURE_FLAGS = {
  // Stable features (always enabled)
  BASIC_GROUPING: true,
  DRAG_AND_DROP: true,
  ANIMATIONS: true,
  ANALYTICS: true,
  
  // Beta features (may be toggled)
  AI_SUGGESTIONS: true,
  ADVANCED_ANIMATIONS: true,
  REAL_TIME_COLLABORATION: false,
  VOICE_COMMANDS: false,
  
  // Experimental features (disabled by default)
  GESTURE_CONTROLS: false,
  AR_VISUALIZATION: false,
  PREDICTIVE_GROUPING: false,
  QUANTUM_OPTIMIZATION: false // Future feature placeholder
} as const;

/**
 * Development and debugging constants
 */
export const DEBUG_CONFIG = {
  // Logging levels
  LOG_LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4
  } as const,
  
  // Performance monitoring
  PERFORMANCE_MARKS: {
    GROUP_RENDER_START: 'group-render-start',
    GROUP_RENDER_END: 'group-render-end',
    ANIMATION_START: 'animation-start',
    ANIMATION_END: 'animation-end',
    AI_ANALYSIS_START: 'ai-analysis-start',
    AI_ANALYSIS_END: 'ai-analysis-end'
  } as const,
  
  // Debug flags
  FLAGS: {
    VERBOSE_LOGGING: false,
    PERFORMANCE_MONITORING: false,
    AI_DEBUG: false,
    ANIMATION_DEBUG: false,
    MEMORY_TRACKING: false
  } as const
} as const;