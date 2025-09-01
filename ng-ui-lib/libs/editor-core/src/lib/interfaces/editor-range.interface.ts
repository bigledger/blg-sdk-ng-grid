/**
 * Editor Range Interface
 * Defines range operations for the BLG Editor
 */

export interface EditorRange {
  /** Range start position */
  start: RangePosition;

  /** Range end position */
  end: RangePosition;

  /** Whether range is collapsed */
  collapsed: boolean;

  /** Range direction */
  direction: 'forward' | 'backward';

  /** Text content of range */
  text: string;

  /** HTML content of range */
  html: string;

  /** Nodes contained in range */
  containedNodes: EditorNode[];

  /** Nodes intersected by range */
  intersectedNodes: EditorNode[];

  /** Common ancestor of range */
  commonAncestor: EditorNode;

  /** Range bounds */
  bounds: RangeBounds;
}

export interface RangePosition {
  /** Node containing position */
  node: EditorNode;

  /** Offset within node */
  offset: number;

  /** Character offset from document start */
  characterOffset: number;

  /** DOM element (if applicable) */
  element?: Element;

  /** DOM offset (if applicable) */
  domOffset?: number;
}

export interface RangeBounds {
  /** Top coordinate */
  top: number;

  /** Left coordinate */
  left: number;

  /** Bottom coordinate */
  bottom: number;

  /** Right coordinate */
  right: number;

  /** Width */
  width: number;

  /** Height */
  height: number;
}

export interface RangeOperation {
  /** Operation type */
  type: RangeOperationType;

  /** Target range */
  range: EditorRange;

  /** Operation data */
  data: any;

  /** Operation options */
  options: Record<string, any>;
}

export interface RangeManager {
  /** Create range */
  createRange(start: RangePosition, end?: RangePosition): EditorRange;

  /** Create range from selection */
  createRangeFromSelection(): EditorRange | null;

  /** Create range from DOM range */
  createRangeFromDOMRange(domRange: Range): EditorRange;

  /** Convert range to DOM range */
  toDOMRange(range: EditorRange): Range;

  /** Normalize range */
  normalize(range: EditorRange): EditorRange;

  /** Compare ranges */
  compare(range1: EditorRange, range2: EditorRange): RangeComparison;

  /** Check if ranges intersect */
  intersects(range1: EditorRange, range2: EditorRange): boolean;

  /** Check if range contains another */
  contains(container: EditorRange, contained: EditorRange): boolean;

  /** Merge ranges */
  merge(range1: EditorRange, range2: EditorRange): EditorRange | null;

  /** Split range at position */
  split(range: EditorRange, position: RangePosition): [EditorRange, EditorRange];

  /** Get range bounds */
  getBounds(range: EditorRange): RangeBounds;

  /** Get range text */
  getText(range: EditorRange): string;

  /** Get range HTML */
  getHTML(range: EditorRange): string;

  /** Set range content */
  setContent(range: EditorRange, content: string, format?: 'text' | 'html'): void;

  /** Delete range content */
  deleteContent(range: EditorRange): void;

  /** Extract range content */
  extractContent(range: EditorRange): DocumentFragment;

  /** Clone range content */
  cloneContent(range: EditorRange): DocumentFragment;
}

export interface RangeComparison {
  /** Whether ranges are equal */
  equal: boolean;

  /** Relationship between ranges */
  relationship: RangeRelationship;

  /** Intersection range (if any) */
  intersection: EditorRange | null;

  /** Union range */
  union: EditorRange;
}

export interface RangeBookmark {
  /** Bookmark ID */
  id: string;

  /** Original range */
  range: EditorRange;

  /** Start marker */
  startMarker: RangeMarker;

  /** End marker */
  endMarker: RangeMarker;

  /** Creation timestamp */
  timestamp: number;
}

export interface RangeMarker {
  /** Marker element */
  element: Element;

  /** Original position */
  position: RangePosition;

  /** Marker type */
  type: 'start' | 'end';
}

export interface RangeHighlight {
  /** Highlight ID */
  id: string;

  /** Highlighted range */
  range: EditorRange;

  /** Highlight class */
  className: string;

  /** Highlight style */
  style: Record<string, string>;

  /** Highlight elements */
  elements: Element[];

  /** Highlight data */
  data: Record<string, any>;
}

export interface RangeSelection {
  /** Primary range */
  primary: EditorRange;

  /** Secondary ranges (for multi-selection) */
  secondary: EditorRange[];

  /** Selection type */
  type: RangeSelectionType;

  /** Selection anchor */
  anchor: RangePosition;

  /** Selection focus */
  focus: RangePosition;
}

export type RangeOperationType = 
  | 'insert'
  | 'delete'
  | 'replace'
  | 'format'
  | 'unformat'
  | 'move'
  | 'copy';

export type RangeRelationship = 
  | 'before'
  | 'after'
  | 'contains'
  | 'contained'
  | 'overlaps'
  | 'adjacent'
  | 'equal';

export type RangeSelectionType = 
  | 'single'
  | 'multiple'
  | 'block'
  | 'line';

export interface RangeValidator {
  /** Validate range */
  validate(range: EditorRange): RangeValidationResult;

  /** Check if position is valid */
  isValidPosition(position: RangePosition): boolean;

  /** Normalize position */
  normalizePosition(position: RangePosition): RangePosition;
}

export interface RangeValidationResult {
  /** Whether range is valid */
  valid: boolean;

  /** Validation errors */
  errors: string[];

  /** Corrected range (if applicable) */
  corrected?: EditorRange;
}