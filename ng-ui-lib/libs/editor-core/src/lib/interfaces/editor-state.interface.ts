/**
 * Editor State Interface
 * Defines the state management structure for the BLG Editor using Angular Signals
 */

export interface EditorState {
  /** Current editor content */
  content: string;

  /** Whether the editor has focus */
  focused: boolean;

  /** Whether the editor is readonly */
  readonly: boolean;

  /** Current selection state */
  selection: SelectionState | null;

  /** Current formatting state at cursor position */
  currentFormatting: FormattingState;

  /** History state for undo/redo */
  history: HistoryState;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: string | null;

  /** Dirty flag indicating unsaved changes */
  dirty: boolean;

  /** Current editor mode */
  mode: EditorMode;

  /** Plugin states */
  plugins: Record<string, any>;
}

export interface SelectionState {
  /** Selection start position */
  start: number;

  /** Selection end position */
  end: number;

  /** Whether selection is collapsed (cursor) */
  collapsed: boolean;

  /** Selected text content */
  text: string;

  /** DOM range object */
  range: Range | null;

  /** Selected nodes */
  selectedNodes: Node[];
}

export interface FormattingState {
  /** Whether text is bold */
  bold: boolean;

  /** Whether text is italic */
  italic: boolean;

  /** Whether text is underlined */
  underline: boolean;

  /** Whether text is struck through */
  strikethrough: boolean;

  /** Whether text is code */
  code: boolean;

  /** Current font family */
  fontFamily: string | null;

  /** Current font size */
  fontSize: string | null;

  /** Current text color */
  textColor: string | null;

  /** Current background color */
  backgroundColor: string | null;

  /** Current text alignment */
  textAlign: 'left' | 'center' | 'right' | 'justify' | null;

  /** Current block type */
  blockType: BlockType | null;

  /** Current list type */
  listType: ListType | null;

  /** Current heading level */
  headingLevel: number | null;

  /** Whether inside a link */
  inLink: boolean;

  /** Whether inside a table */
  inTable: boolean;

  /** Current table cell position */
  tablePosition: TablePosition | null;
}

export interface HistoryState {
  /** Undo stack */
  undoStack: HistoryEntry[];

  /** Redo stack */
  redoStack: HistoryEntry[];

  /** Current position in history */
  currentIndex: number;

  /** Maximum history size */
  maxSize: number;

  /** Whether undo is available */
  canUndo: boolean;

  /** Whether redo is available */
  canRedo: boolean;
}

export interface HistoryEntry {
  /** Unique entry ID */
  id: string;

  /** Content at this point */
  content: string;

  /** Selection at this point */
  selection: SelectionState | null;

  /** Timestamp */
  timestamp: number;

  /** Description of the change */
  description?: string;
}

export interface TablePosition {
  /** Row index */
  row: number;

  /** Column index */
  column: number;

  /** Total rows in table */
  totalRows: number;

  /** Total columns in table */
  totalColumns: number;
}

export type EditorMode = 
  | 'edit' 
  | 'preview' 
  | 'source' 
  | 'fullscreen';

export type BlockType = 
  | 'paragraph' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'heading4' 
  | 'heading5' 
  | 'heading6' 
  | 'blockquote' 
  | 'codeblock' 
  | 'div';

export type ListType = 
  | 'bullet' 
  | 'ordered' 
  | 'checklist';