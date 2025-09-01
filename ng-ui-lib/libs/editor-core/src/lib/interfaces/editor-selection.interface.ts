/**
 * Editor Selection Interface
 * Defines selection management for the BLG Editor
 */

export interface EditorSelection {
  /** Selection start position */
  start: SelectionPosition;

  /** Selection end position */
  end: SelectionPosition;

  /** Whether selection is collapsed (just a cursor) */
  collapsed: boolean;

  /** Direction of selection */
  direction: 'forward' | 'backward' | 'none';

  /** Selected text content */
  text: string;

  /** Selected HTML content */
  html: string;

  /** DOM Range object */
  range: Range;

  /** Common ancestor container */
  commonAncestorContainer: Node;

  /** Start container node */
  startContainer: Node;

  /** End container node */
  endContainer: Node;

  /** Selected nodes */
  selectedNodes: Node[];

  /** Parent elements of selection */
  parentElements: Element[];
}

export interface SelectionPosition {
  /** Node containing the position */
  node: Node;

  /** Offset within the node */
  offset: number;

  /** Absolute position from document start */
  absoluteOffset: number;

  /** Path to the node from root */
  path: number[];
}

export interface SelectionInfo {
  /** Current selection */
  selection: EditorSelection | null;

  /** Previous selection (for comparison) */
  previousSelection: EditorSelection | null;

  /** Whether selection changed */
  changed: boolean;

  /** Type of selection change */
  changeType: SelectionChangeType;

  /** Context information */
  context: SelectionContext;
}

export interface SelectionContext {
  /** Active formatting at selection */
  formatting: Record<string, any>;

  /** Parent block element */
  blockElement: Element | null;

  /** Parent list element */
  listElement: Element | null;

  /** Parent table cell */
  tableCell: Element | null;

  /** Parent link element */
  linkElement: Element | null;

  /** Inline elements at selection */
  inlineElements: Element[];

  /** Whether selection spans multiple blocks */
  multiBlock: boolean;

  /** Whether selection spans multiple paragraphs */
  multiParagraph: boolean;
}

export interface SelectionServiceState {
  /** Whether editor has focus */
  focused: boolean;

  /** Current selection */
  selection: EditorSelection | null;

  /** Selection history */
  history: EditorSelection[];

  /** Maximum history size */
  maxHistory: number;

  /** Whether selection is being tracked */
  tracking: boolean;
}

export interface SelectionRange {
  /** Start node */
  startNode: Node;

  /** Start offset */
  startOffset: number;

  /** End node */
  endNode: Node;

  /** End offset */
  endOffset: number;
}

export interface SelectionBookmark {
  /** Unique bookmark ID */
  id: string;

  /** Start marker element */
  startMarker: Element;

  /** End marker element */
  endMarker: Element;

  /** Original selection */
  selection: EditorSelection;

  /** Creation timestamp */
  timestamp: number;
}

export type SelectionChangeType = 
  | 'none' 
  | 'move' 
  | 'extend' 
  | 'collapse' 
  | 'replace' 
  | 'focus' 
  | 'blur';

export type SelectionUnit = 
  | 'character' 
  | 'word' 
  | 'line' 
  | 'paragraph' 
  | 'block' 
  | 'document';

export interface SelectionOperation {
  /** Operation type */
  type: SelectionOperationType;

  /** Target unit */
  unit?: SelectionUnit;

  /** Direction for movement */
  direction?: 'left' | 'right' | 'up' | 'down' | 'start' | 'end';

  /** Whether to extend selection */
  extend?: boolean;

  /** Custom position */
  position?: SelectionPosition;

  /** Custom range */
  range?: SelectionRange;
}

export type SelectionOperationType = 
  | 'moveCursor' 
  | 'selectUnit' 
  | 'selectRange' 
  | 'selectAll' 
  | 'collapse' 
  | 'extend';