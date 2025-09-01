/**
 * Editor Configuration Interface
 * Defines the configuration options for the BLG Editor
 */

export interface EditorConfig {
  /** Whether the editor is readonly */
  readonly?: boolean;

  /** Initial content of the editor */
  content?: string;

  /** Placeholder text when editor is empty */
  placeholder?: string;

  /** Whether to auto-focus the editor on initialization */
  autoFocus?: boolean;

  /** Maximum character limit */
  maxLength?: number;

  /** Minimum height of the editor */
  minHeight?: string | number;

  /** Maximum height of the editor */
  maxHeight?: string | number;

  /** Toolbar configuration */
  toolbar?: ToolbarConfig;

  /** Plugin configuration */
  plugins?: PluginConfig[];

  /** Theme configuration */
  theme?: ThemeConfig;

  /** Formatting options */
  formatting?: FormattingConfig;

  /** Media handling options */
  media?: MediaConfig;

  /** Table editing options */
  tables?: TableConfig;

  /** Custom CSS classes */
  customClasses?: Record<string, string>;

  /** Event handlers */
  eventHandlers?: EventHandlerConfig;

  /** Accessibility options */
  accessibility?: AccessibilityConfig;
}

export interface ToolbarConfig {
  /** Whether to show the toolbar */
  enabled?: boolean;

  /** Position of the toolbar */
  position?: 'top' | 'bottom' | 'floating';

  /** Custom toolbar groups */
  groups?: ToolbarGroup[];

  /** Whether toolbar is sticky */
  sticky?: boolean;
}

export interface ToolbarGroup {
  /** Group identifier */
  id: string;

  /** Group label for accessibility */
  label?: string;

  /** List of tool names in this group */
  tools: string[];

  /** Whether this group is collapsible */
  collapsible?: boolean;
}

export interface PluginConfig {
  /** Plugin name/identifier */
  name: string;

  /** Plugin options */
  options?: Record<string, any>;

  /** Whether plugin is enabled */
  enabled?: boolean;
}

export interface ThemeConfig {
  /** Theme name */
  name?: string;

  /** Custom theme variables */
  variables?: Record<string, string>;

  /** Dark mode support */
  darkMode?: boolean;
}

export interface FormattingConfig {
  /** Allowed formatting options */
  allowedFormats?: FormattingType[];

  /** Default font family */
  defaultFontFamily?: string;

  /** Default font size */
  defaultFontSize?: string;

  /** Custom styles */
  customStyles?: Record<string, any>;
}

export interface MediaConfig {
  /** Whether media uploads are allowed */
  uploadEnabled?: boolean;

  /** Maximum file size in bytes */
  maxFileSize?: number;

  /** Allowed file types */
  allowedTypes?: string[];

  /** Upload endpoint */
  uploadUrl?: string;

  /** Image resize options */
  imageResize?: ImageResizeConfig;
}

export interface ImageResizeConfig {
  /** Maximum width */
  maxWidth?: number;

  /** Maximum height */
  maxHeight?: number;

  /** Quality for JPEG compression */
  quality?: number;
}

export interface TableConfig {
  /** Whether table creation is enabled */
  enabled?: boolean;

  /** Default table dimensions */
  defaultSize?: { rows: number; columns: number };

  /** Whether table resizing is allowed */
  resizable?: boolean;

  /** Maximum table size */
  maxSize?: { rows: number; columns: number };
}

export interface EventHandlerConfig {
  /** Content change handler */
  onChange?: (content: string) => void;

  /** Focus event handler */
  onFocus?: (event: FocusEvent) => void;

  /** Blur event handler */
  onBlur?: (event: FocusEvent) => void;

  /** Key event handler */
  onKeyDown?: (event: KeyboardEvent) => void;

  /** Selection change handler */
  onSelectionChange?: (selection: any) => void;
}

export interface AccessibilityConfig {
  /** ARIA label for the editor */
  ariaLabel?: string;

  /** ARIA description for the editor */
  ariaDescription?: string;

  /** Whether to announce changes to screen readers */
  announceChanges?: boolean;

  /** Keyboard shortcut configuration */
  keyboardShortcuts?: Record<string, string>;
}

export type FormattingType = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strikethrough' 
  | 'code' 
  | 'blockquote' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'heading4' 
  | 'heading5' 
  | 'heading6' 
  | 'paragraph' 
  | 'bulletList' 
  | 'orderedList' 
  | 'link' 
  | 'image' 
  | 'table' 
  | 'horizontalRule' 
  | 'textAlign' 
  | 'fontFamily' 
  | 'fontSize' 
  | 'fontColor' 
  | 'backgroundColor';