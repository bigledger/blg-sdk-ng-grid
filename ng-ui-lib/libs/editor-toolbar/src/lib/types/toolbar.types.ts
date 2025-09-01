/**
 * Predefined toolbar configurations
 */

import { ToolbarConfig } from '../interfaces/toolbar-config.interface';

/**
 * Default toolbar theme
 */
export const DEFAULT_TOOLBAR_THEME = {
  primary: '#1976d2',
  background: '#ffffff',
  textColor: '#333333',
  borderColor: '#e0e0e0',
  hoverColor: '#f5f5f5',
  activeColor: '#e3f2fd',
  disabledColor: '#bdbdbd',
  shadow: '0 2px 4px rgba(0,0,0,0.12)',
  borderRadius: '4px',
  iconSize: '20px'
};

/**
 * Default responsive breakpoints
 */
export const DEFAULT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

/**
 * Standard toolbar button groups
 */
export const TOOLBAR_GROUPS = {
  HISTORY: 'history',
  FORMATTING: 'formatting',
  PARAGRAPH: 'paragraph',
  INSERT: 'insert',
  TOOLS: 'tools'
} as const;

/**
 * Standard toolbar actions
 */
export const TOOLBAR_ACTIONS = {
  // History
  UNDO: 'undo',
  REDO: 'redo',
  
  // Formatting
  BOLD: 'bold',
  ITALIC: 'italic',
  UNDERLINE: 'underline',
  STRIKETHROUGH: 'strikethrough',
  SUBSCRIPT: 'subscript',
  SUPERSCRIPT: 'superscript',
  FONT_FAMILY: 'fontFamily',
  FONT_SIZE: 'fontSize',
  FONT_COLOR: 'fontColor',
  BACKGROUND_COLOR: 'backgroundColor',
  
  // Paragraph
  ALIGN_LEFT: 'alignLeft',
  ALIGN_CENTER: 'alignCenter',
  ALIGN_RIGHT: 'alignRight',
  JUSTIFY: 'justify',
  BULLET_LIST: 'bulletList',
  NUMBERED_LIST: 'numberedList',
  INDENT: 'indent',
  OUTDENT: 'outdent',
  
  // Insert
  LINK: 'insertLink',
  IMAGE: 'insertImage',
  TABLE: 'insertTable',
  CODE_BLOCK: 'insertCodeBlock',
  QUOTE: 'insertQuote',
  
  // Tools
  FIND: 'find',
  REPLACE: 'replace',
  SOURCE: 'toggleSource',
  FULLSCREEN: 'toggleFullscreen'
} as const;

/**
 * Font families
 */
export const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' }
];

/**
 * Font sizes
 */
export const FONT_SIZES = [
  { value: '8px', label: '8' },
  { value: '9px', label: '9' },
  { value: '10px', label: '10' },
  { value: '11px', label: '11' },
  { value: '12px', label: '12' },
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '22px', label: '22' },
  { value: '24px', label: '24' },
  { value: '28px', label: '28' },
  { value: '32px', label: '32' },
  { value: '36px', label: '36' },
  { value: '48px', label: '48' },
  { value: '72px', label: '72' }
];

/**
 * Color palettes
 */
export const COLOR_PALETTES = {
  BASIC: [
    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ffa500', '#800080', '#008000', '#800000', '#000080', '#808000'
  ],
  MATERIAL: [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
    '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'
  ]
};

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  [TOOLBAR_ACTIONS.UNDO]: 'Ctrl+Z',
  [TOOLBAR_ACTIONS.REDO]: 'Ctrl+Y',
  [TOOLBAR_ACTIONS.BOLD]: 'Ctrl+B',
  [TOOLBAR_ACTIONS.ITALIC]: 'Ctrl+I',
  [TOOLBAR_ACTIONS.UNDERLINE]: 'Ctrl+U',
  [TOOLBAR_ACTIONS.FIND]: 'Ctrl+F',
  [TOOLBAR_ACTIONS.REPLACE]: 'Ctrl+H'
};

/**
 * Default toolbar configurations
 */
export const TOOLBAR_CONFIGS = {
  /**
   * Full-featured toolbar
   */
  FULL: {
    mode: 'fixed',
    theme: DEFAULT_TOOLBAR_THEME,
    breakpoints: DEFAULT_BREAKPOINTS,
    keyboardNavigation: true,
    touchFriendly: true,
    sections: [
      {
        id: 'history',
        title: 'History',
        buttons: [
          {
            id: 'undo',
            type: 'button',
            icon: 'undo',
            tooltip: 'Undo',
            action: TOOLBAR_ACTIONS.UNDO,
            shortcut: KEYBOARD_SHORTCUTS[TOOLBAR_ACTIONS.UNDO]
          },
          {
            id: 'redo',
            type: 'button',
            icon: 'redo',
            tooltip: 'Redo',
            action: TOOLBAR_ACTIONS.REDO,
            shortcut: KEYBOARD_SHORTCUTS[TOOLBAR_ACTIONS.REDO]
          }
        ],
        separator: true
      },
      {
        id: 'formatting',
        title: 'Formatting',
        buttons: [
          {
            id: 'bold',
            type: 'toggle',
            icon: 'format_bold',
            tooltip: 'Bold',
            action: TOOLBAR_ACTIONS.BOLD,
            shortcut: KEYBOARD_SHORTCUTS[TOOLBAR_ACTIONS.BOLD]
          },
          {
            id: 'italic',
            type: 'toggle',
            icon: 'format_italic',
            tooltip: 'Italic',
            action: TOOLBAR_ACTIONS.ITALIC,
            shortcut: KEYBOARD_SHORTCUTS[TOOLBAR_ACTIONS.ITALIC]
          },
          {
            id: 'underline',
            type: 'toggle',
            icon: 'format_underlined',
            tooltip: 'Underline',
            action: TOOLBAR_ACTIONS.UNDERLINE,
            shortcut: KEYBOARD_SHORTCUTS[TOOLBAR_ACTIONS.UNDERLINE]
          },
          {
            id: 'font-family',
            type: 'font-selector',
            tooltip: 'Font Family',
            action: TOOLBAR_ACTIONS.FONT_FAMILY,
            options: FONT_FAMILIES
          },
          {
            id: 'font-size',
            type: 'size-selector',
            tooltip: 'Font Size',
            action: TOOLBAR_ACTIONS.FONT_SIZE,
            options: FONT_SIZES
          },
          {
            id: 'font-color',
            type: 'color-picker',
            icon: 'format_color_text',
            tooltip: 'Text Color',
            action: TOOLBAR_ACTIONS.FONT_COLOR,
            properties: { palette: COLOR_PALETTES.MATERIAL }
          }
        ],
        separator: true
      }
    ]
  } as ToolbarConfig,

  /**
   * Minimal toolbar
   */
  MINIMAL: {
    mode: 'inline',
    theme: DEFAULT_TOOLBAR_THEME,
    keyboardNavigation: false,
    sections: [
      {
        id: 'formatting-minimal',
        buttons: [
          {
            id: 'bold',
            type: 'toggle',
            icon: 'format_bold',
            tooltip: 'Bold',
            action: TOOLBAR_ACTIONS.BOLD
          },
          {
            id: 'italic',
            type: 'toggle',
            icon: 'format_italic',
            tooltip: 'Italic',
            action: TOOLBAR_ACTIONS.ITALIC
          },
          {
            id: 'link',
            type: 'button',
            icon: 'link',
            tooltip: 'Insert Link',
            action: TOOLBAR_ACTIONS.LINK
          }
        ]
      }
    ]
  } as ToolbarConfig,

  /**
   * Floating toolbar (appears on selection)
   */
  FLOATING: {
    mode: 'floating',
    theme: {
      ...DEFAULT_TOOLBAR_THEME,
      background: '#333333',
      textColor: '#ffffff',
      borderColor: 'transparent',
      shadow: '0 4px 12px rgba(0,0,0,0.3)'
    },
    animations: {
      enabled: true,
      duration: 200,
      easing: 'ease-out',
      fade: true
    },
    sections: [
      {
        id: 'formatting-floating',
        buttons: [
          {
            id: 'bold',
            type: 'toggle',
            icon: 'format_bold',
            tooltip: 'Bold',
            action: TOOLBAR_ACTIONS.BOLD
          },
          {
            id: 'italic',
            type: 'toggle',
            icon: 'format_italic',
            tooltip: 'Italic',
            action: TOOLBAR_ACTIONS.ITALIC
          },
          {
            id: 'underline',
            type: 'toggle',
            icon: 'format_underlined',
            tooltip: 'Underline',
            action: TOOLBAR_ACTIONS.UNDERLINE
          },
          {
            id: 'link',
            type: 'button',
            icon: 'link',
            tooltip: 'Insert Link',
            action: TOOLBAR_ACTIONS.LINK
          }
        ]
      }
    ]
  } as ToolbarConfig,

  /**
   * Mobile-optimized toolbar
   */
  MOBILE: {
    mode: 'mobile',
    theme: DEFAULT_TOOLBAR_THEME,
    touchFriendly: true,
    breakpoints: DEFAULT_BREAKPOINTS,
    sections: [
      {
        id: 'mobile-main',
        buttons: [
          {
            id: 'format-menu',
            type: 'dropdown',
            icon: 'text_format',
            tooltip: 'Format',
            options: [
              { value: 'bold', label: 'Bold', icon: 'format_bold' },
              { value: 'italic', label: 'Italic', icon: 'format_italic' },
              { value: 'underline', label: 'Underline', icon: 'format_underlined' }
            ]
          },
          {
            id: 'insert-menu',
            type: 'dropdown',
            icon: 'add',
            tooltip: 'Insert',
            options: [
              { value: 'link', label: 'Link', icon: 'link' },
              { value: 'image', label: 'Image', icon: 'image' },
              { value: 'table', label: 'Table', icon: 'table_chart' }
            ]
          }
        ]
      }
    ]
  } as ToolbarConfig
};

/**
 * Toolbar registration type
 */
export type ToolbarRegistration = {
  /** Unique identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Description */
  description?: string;
  
  /** Configuration */
  config: ToolbarConfig;
  
  /** Preview icon */
  icon?: string;
  
  /** Category */
  category?: string;
  
  /** Tags for filtering */
  tags?: string[];
};