import { NgUiBaseConfig, NgUiTypography, NgUiDimensions } from '../types/ngui-common.types';

/**
 * NgUI Editor Configuration Interface
 */
export interface NgUiEditorConfig extends NgUiBaseConfig {
  /** Editor content */
  content?: string;

  /** Editor placeholder text */
  placeholder?: string;

  /** Read-only mode */
  readonly?: boolean;

  /** Auto focus */
  autoFocus?: boolean;

  /** Editor dimensions */
  dimensions?: NgUiDimensions;

  /** Toolbar configuration */
  toolbar?: NgUiEditorToolbarConfig;

  /** Formatting options */
  formatting?: NgUiEditorFormattingConfig;

  /** Media handling */
  media?: NgUiEditorMediaConfig;

  /** Tables configuration */
  tables?: NgUiEditorTablesConfig;

  /** Plugins configuration */
  plugins?: NgUiEditorPluginsConfig;

  /** Validation rules */
  validation?: NgUiEditorValidationConfig;

  /** Autosave configuration */
  autosave?: NgUiEditorAutosaveConfig;

  /** Collaboration features */
  collaboration?: NgUiEditorCollaborationConfig;

  /** Performance settings */
  performance?: {
    debounceTime?: number;
    maxUndoLevels?: number;
    virtualScrolling?: boolean;
  };
}

/**
 * NgUI Editor Toolbar Configuration
 */
export interface NgUiEditorToolbarConfig {
  /** Show toolbar */
  enabled?: boolean;

  /** Toolbar position */
  position?: 'top' | 'bottom' | 'floating';

  /** Toolbar groups */
  groups?: NgUiEditorToolbarGroup[];

  /** Custom toolbar items */
  customItems?: NgUiEditorToolbarItem[];

  /** Toolbar styling */
  cssClass?: string;

  /** Compact mode */
  compact?: boolean;
}

export interface NgUiEditorToolbarGroup {
  /** Group identifier */
  id: string;

  /** Group label */
  label?: string;

  /** Group items */
  items: NgUiEditorToolbarItem[];

  /** Group visibility */
  visible?: boolean;
}

export interface NgUiEditorToolbarItem {
  /** Item identifier */
  id: string;

  /** Item type */
  type: 'button' | 'dropdown' | 'separator' | 'custom';

  /** Item label */
  label?: string;

  /** Item icon */
  icon?: string;

  /** Item tooltip */
  tooltip?: string;

  /** Item command */
  command?: string;

  /** Item options (for dropdowns) */
  options?: NgUiEditorToolbarOption[];

  /** Item handler */
  handler?: () => void;

  /** Item visibility */
  visible?: boolean;

  /** Item enabled state */
  enabled?: boolean;
}

export interface NgUiEditorToolbarOption {
  /** Option value */
  value: string;

  /** Option label */
  label: string;

  /** Option icon */
  icon?: string;
}

/**
 * NgUI Editor Formatting Configuration
 */
export interface NgUiEditorFormattingConfig {
  /** Text formatting */
  text?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    superscript?: boolean;
    subscript?: boolean;
  };

  /** Paragraph formatting */
  paragraph?: {
    alignment?: boolean;
    indentation?: boolean;
    lineHeight?: boolean;
    spacing?: boolean;
  };

  /** Lists */
  lists?: {
    bulleted?: boolean;
    numbered?: boolean;
    nested?: boolean;
  };

  /** Typography */
  typography?: NgUiTypography;

  /** Custom styles */
  styles?: NgUiEditorCustomStyle[];
}

export interface NgUiEditorCustomStyle {
  /** Style identifier */
  id: string;

  /** Style name */
  name: string;

  /** CSS properties */
  css: Record<string, string>;

  /** Style preview */
  preview?: string;
}

/**
 * NgUI Editor Media Configuration
 */
export interface NgUiEditorMediaConfig {
  /** Image handling */
  images?: {
    enabled?: boolean;
    upload?: NgUiEditorUploadConfig;
    resize?: boolean;
    formats?: string[];
    maxSize?: number;
  };

  /** Video handling */
  videos?: {
    enabled?: boolean;
    upload?: NgUiEditorUploadConfig;
    embed?: boolean;
    formats?: string[];
    maxSize?: number;
  };

  /** Audio handling */
  audio?: {
    enabled?: boolean;
    upload?: NgUiEditorUploadConfig;
    formats?: string[];
    maxSize?: number;
  };

  /** File handling */
  files?: {
    enabled?: boolean;
    upload?: NgUiEditorUploadConfig;
    formats?: string[];
    maxSize?: number;
  };
}

export interface NgUiEditorUploadConfig {
  /** Upload endpoint */
  endpoint: string;

  /** Upload method */
  method?: 'POST' | 'PUT';

  /** Upload headers */
  headers?: Record<string, string>;

  /** Upload field name */
  fieldName?: string;

  /** Progress callback */
  onProgress?: (progress: number) => void;

  /** Success callback */
  onSuccess?: (response: any) => void;

  /** Error callback */
  onError?: (error: any) => void;
}

/**
 * NgUI Editor Tables Configuration
 */
export interface NgUiEditorTablesConfig {
  /** Tables enabled */
  enabled?: boolean;

  /** Default table size */
  defaultSize?: {
    rows: number;
    columns: number;
  };

  /** Table styling */
  styling?: {
    borders?: boolean;
    striped?: boolean;
    hover?: boolean;
    responsive?: boolean;
  };

  /** Column operations */
  columns?: {
    add?: boolean;
    remove?: boolean;
    resize?: boolean;
    reorder?: boolean;
  };

  /** Row operations */
  rows?: {
    add?: boolean;
    remove?: boolean;
    reorder?: boolean;
  };

  /** Cell operations */
  cells?: {
    merge?: boolean;
    split?: boolean;
    alignment?: boolean;
    formatting?: boolean;
  };
}

/**
 * NgUI Editor Plugins Configuration
 */
export interface NgUiEditorPluginsConfig {
  /** Spell check */
  spellcheck?: {
    enabled?: boolean;
    language?: string;
    customDictionary?: string[];
  };

  /** Word count */
  wordcount?: {
    enabled?: boolean;
    target?: number;
    showProgress?: boolean;
  };

  /** Find and replace */
  findReplace?: {
    enabled?: boolean;
    caseSensitive?: boolean;
    wholeWords?: boolean;
    regularExpressions?: boolean;
  };

  /** Code highlighting */
  codeHighlight?: {
    enabled?: boolean;
    languages?: string[];
    theme?: string;
  };

  /** Math equations */
  math?: {
    enabled?: boolean;
    renderer?: 'katex' | 'mathjax';
  };

  /** Emoji support */
  emoji?: {
    enabled?: boolean;
    categories?: string[];
  };
}

/**
 * NgUI Editor Validation Configuration
 */
export interface NgUiEditorValidationConfig {
  /** Required content */
  required?: boolean;

  /** Minimum length */
  minLength?: number;

  /** Maximum length */
  maxLength?: number;

  /** Custom validators */
  validators?: ((content: string) => string | null)[];

  /** Real-time validation */
  realTime?: boolean;

  /** Show validation messages */
  showMessages?: boolean;
}

/**
 * NgUI Editor Autosave Configuration
 */
export interface NgUiEditorAutosaveConfig {
  /** Autosave enabled */
  enabled?: boolean;

  /** Autosave interval (ms) */
  interval?: number;

  /** Storage key */
  storageKey?: string;

  /** Storage type */
  storageType?: 'localStorage' | 'sessionStorage' | 'custom';

  /** Custom save handler */
  customSave?: (content: string) => Promise<void>;

  /** Custom load handler */
  customLoad?: () => Promise<string>;
}

/**
 * NgUI Editor Collaboration Configuration
 */
export interface NgUiEditorCollaborationConfig {
  /** Collaboration enabled */
  enabled?: boolean;

  /** User identification */
  user?: {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
  };

  /** WebSocket configuration */
  websocket?: {
    url: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
  };

  /** Conflict resolution */
  conflictResolution?: 'lastWrite' | 'operational' | 'custom';

  /** Show cursors */
  showCursors?: boolean;

  /** Show comments */
  showComments?: boolean;
}

/**
 * NgUI Editor Event Interfaces
 */
export interface NgUiEditorChangeEvent {
  type: 'ngUiEditorChange';
  content: string;
  delta?: any;
  timestamp: number;
}

export interface NgUiEditorFocusEvent {
  type: 'ngUiEditorFocus';
  timestamp: number;
}

export interface NgUiEditorBlurEvent {
  type: 'ngUiEditorBlur';
  content: string;
  timestamp: number;
}

export interface NgUiEditorSelectionEvent {
  type: 'ngUiEditorSelection';
  selection: {
    start: number;
    end: number;
    text: string;
  };
  timestamp: number;
}

export type NgUiEditorEvent =
  | NgUiEditorChangeEvent
  | NgUiEditorFocusEvent
  | NgUiEditorBlurEvent
  | NgUiEditorSelectionEvent;