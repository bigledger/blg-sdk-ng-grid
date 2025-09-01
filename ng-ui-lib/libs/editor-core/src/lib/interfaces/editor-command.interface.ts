/**
 * Editor Command Interface
 * Defines the command system for the BLG Editor
 */

export interface EditorCommand {
  /** Command name/identifier */
  name: string;

  /** Command parameters */
  params?: Record<string, any>;

  /** Command execution function */
  execute: (params?: Record<string, any>) => Promise<boolean> | boolean;

  /** Command undo function */
  undo?: (params?: Record<string, any>) => Promise<boolean> | boolean;

  /** Whether command can be executed */
  canExecute?: (params?: Record<string, any>) => boolean;

  /** Command description */
  description?: string;

  /** Keyboard shortcut */
  shortcut?: string;

  /** Command category */
  category?: CommandCategory;

  /** Whether command should be added to history */
  addToHistory?: boolean;
}

export interface CommandExecutionContext {
  /** Editor instance reference */
  editor: any;

  /** Current selection */
  selection: any;

  /** Current content */
  content: string;

  /** Command parameters */
  params: Record<string, any>;

  /** Additional context data */
  context: Record<string, any>;
}

export interface CommandResult {
  /** Whether command was successful */
  success: boolean;

  /** Result message */
  message?: string;

  /** Updated content (if applicable) */
  content?: string;

  /** Updated selection (if applicable) */
  selection?: any;

  /** Additional result data */
  data?: Record<string, any>;
}

export type CommandCategory = 
  | 'formatting' 
  | 'structure' 
  | 'media' 
  | 'table' 
  | 'list' 
  | 'history' 
  | 'selection' 
  | 'clipboard' 
  | 'custom';

// Predefined command names
export const EDITOR_COMMANDS = {
  // Formatting commands
  BOLD: 'bold',
  ITALIC: 'italic',
  UNDERLINE: 'underline',
  STRIKETHROUGH: 'strikethrough',
  CODE: 'code',
  FONT_FAMILY: 'fontFamily',
  FONT_SIZE: 'fontSize',
  TEXT_COLOR: 'textColor',
  BACKGROUND_COLOR: 'backgroundColor',
  
  // Structure commands
  HEADING_1: 'heading1',
  HEADING_2: 'heading2',
  HEADING_3: 'heading3',
  HEADING_4: 'heading4',
  HEADING_5: 'heading5',
  HEADING_6: 'heading6',
  PARAGRAPH: 'paragraph',
  BLOCKQUOTE: 'blockquote',
  CODE_BLOCK: 'codeBlock',
  HORIZONTAL_RULE: 'horizontalRule',
  
  // List commands
  BULLET_LIST: 'bulletList',
  ORDERED_LIST: 'orderedList',
  CHECKLIST: 'checklist',
  INDENT: 'indent',
  OUTDENT: 'outdent',
  
  // Alignment commands
  ALIGN_LEFT: 'alignLeft',
  ALIGN_CENTER: 'alignCenter',
  ALIGN_RIGHT: 'alignRight',
  ALIGN_JUSTIFY: 'alignJustify',
  
  // History commands
  UNDO: 'undo',
  REDO: 'redo',
  
  // Selection commands
  SELECT_ALL: 'selectAll',
  
  // Clipboard commands
  CUT: 'cut',
  COPY: 'copy',
  PASTE: 'paste',
  PASTE_PLAIN: 'pastePlain',
  
  // Media commands
  INSERT_IMAGE: 'insertImage',
  INSERT_LINK: 'insertLink',
  REMOVE_LINK: 'removeLink',
  
  // Table commands
  INSERT_TABLE: 'insertTable',
  INSERT_ROW_ABOVE: 'insertRowAbove',
  INSERT_ROW_BELOW: 'insertRowBelow',
  INSERT_COLUMN_LEFT: 'insertColumnLeft',
  INSERT_COLUMN_RIGHT: 'insertColumnRight',
  DELETE_ROW: 'deleteRow',
  DELETE_COLUMN: 'deleteColumn',
  DELETE_TABLE: 'deleteTable',
  MERGE_CELLS: 'mergeCells',
  SPLIT_CELL: 'splitCell',
  
  // Editor mode commands
  TOGGLE_FULLSCREEN: 'toggleFullscreen',
  TOGGLE_PREVIEW: 'togglePreview',
  TOGGLE_SOURCE: 'toggleSource',
  
  // Custom commands
  CUSTOM: 'custom'
} as const;

export type EditorCommandName = typeof EDITOR_COMMANDS[keyof typeof EDITOR_COMMANDS];