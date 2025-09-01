/**
 * Editor Node Interface
 * Defines the node structure and manipulation for the BLG Editor
 */

export interface EditorNode {
  /** Node type */
  type: EditorNodeType;

  /** Node attributes */
  attributes: Record<string, any>;

  /** Child nodes */
  children: EditorNode[];

  /** Parent node reference */
  parent: EditorNode | null;

  /** Text content (for text nodes) */
  text?: string;

  /** Node marks/formatting */
  marks: EditorMark[];

  /** Node position in document */
  position: NodePosition;

  /** Whether node is selected */
  selected: boolean;

  /** Custom node data */
  data: Record<string, any>;
}

export interface EditorMark {
  /** Mark type */
  type: EditorMarkType;

  /** Mark attributes */
  attributes: Record<string, any>;

  /** Mark data */
  data: Record<string, any>;
}

export interface NodePosition {
  /** Absolute position from document start */
  absolute: number;

  /** Path from root node */
  path: number[];

  /** Depth in document tree */
  depth: number;

  /** Line number (for text content) */
  line?: number;

  /** Column number (for text content) */
  column?: number;
}

export interface NodeRange {
  /** Start node */
  start: EditorNode;

  /** End node */
  end: EditorNode;

  /** Start offset */
  startOffset: number;

  /** End offset */
  endOffset: number;

  /** All nodes in range */
  nodes: EditorNode[];
}

export interface NodeTransformation {
  /** Transformation type */
  type: NodeTransformationType;

  /** Source node */
  source: EditorNode;

  /** Target node configuration */
  target: Partial<EditorNode>;

  /** Transformation options */
  options: Record<string, any>;
}

export interface NodeValidator {
  /** Validation function */
  validate: (node: EditorNode) => NodeValidationResult;

  /** Node type this validator applies to */
  nodeType?: EditorNodeType;

  /** Validation rules */
  rules: ValidationRule[];
}

export interface NodeValidationResult {
  /** Whether node is valid */
  valid: boolean;

  /** Validation errors */
  errors: ValidationError[];

  /** Validation warnings */
  warnings: ValidationError[];
}

export interface ValidationRule {
  /** Rule name */
  name: string;

  /** Rule function */
  check: (node: EditorNode) => boolean;

  /** Error message */
  message: string;

  /** Rule severity */
  severity: 'error' | 'warning';
}

export interface ValidationError {
  /** Rule that failed */
  rule: string;

  /** Error message */
  message: string;

  /** Error severity */
  severity: 'error' | 'warning';

  /** Node that failed validation */
  node: EditorNode;
}

export interface NodeSerializer {
  /** Serialize node to string */
  serialize: (node: EditorNode) => string;

  /** Deserialize string to node */
  deserialize: (content: string) => EditorNode;

  /** Supported format */
  format: NodeSerializationFormat;
}

export interface NodeManipulator {
  /** Create new node */
  createNode(type: EditorNodeType, attributes?: Record<string, any>): EditorNode;

  /** Clone existing node */
  cloneNode(node: EditorNode, deep?: boolean): EditorNode;

  /** Insert node */
  insertNode(target: EditorNode, node: EditorNode, position: InsertPosition): void;

  /** Remove node */
  removeNode(node: EditorNode): void;

  /** Replace node */
  replaceNode(oldNode: EditorNode, newNode: EditorNode): void;

  /** Move node */
  moveNode(node: EditorNode, target: EditorNode, position: InsertPosition): void;

  /** Merge nodes */
  mergeNodes(source: EditorNode, target: EditorNode): EditorNode;

  /** Split node */
  splitNode(node: EditorNode, position: number): [EditorNode, EditorNode];

  /** Wrap nodes */
  wrapNodes(nodes: EditorNode[], wrapper: EditorNode): EditorNode;

  /** Unwrap node */
  unwrapNode(node: EditorNode): EditorNode[];
}

export type EditorNodeType = 
  | 'document'
  | 'paragraph'
  | 'heading'
  | 'blockquote'
  | 'codeblock'
  | 'list'
  | 'listitem'
  | 'table'
  | 'tablerow'
  | 'tablecell'
  | 'tableheader'
  | 'image'
  | 'link'
  | 'text'
  | 'hardbreak'
  | 'horizontalrule'
  | 'div'
  | 'span'
  | 'custom';

export type EditorMarkType = 
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'superscript'
  | 'subscript'
  | 'highlight'
  | 'fontfamily'
  | 'fontsize'
  | 'textcolor'
  | 'backgroundcolor'
  | 'custom';

export type NodeTransformationType = 
  | 'changeType'
  | 'addAttribute'
  | 'removeAttribute'
  | 'addMark'
  | 'removeMark'
  | 'insertText'
  | 'deleteText'
  | 'replaceText';

export type NodeSerializationFormat = 
  | 'html'
  | 'markdown'
  | 'json'
  | 'text'
  | 'custom';

export type InsertPosition = 
  | 'before'
  | 'after'
  | 'start'
  | 'end'
  | 'replace';

export interface NodeWalker {
  /** Walk through nodes */
  walk(root: EditorNode, callback: NodeWalkerCallback): void;

  /** Find nodes matching criteria */
  find(root: EditorNode, predicate: NodePredicate): EditorNode[];

  /** Find first node matching criteria */
  findFirst(root: EditorNode, predicate: NodePredicate): EditorNode | null;

  /** Get all text nodes */
  getTextNodes(root: EditorNode): EditorNode[];

  /** Get node path */
  getPath(node: EditorNode): number[];

  /** Get node by path */
  getNodeByPath(root: EditorNode, path: number[]): EditorNode | null;
}

export interface NodeWalkerCallback {
  (node: EditorNode, path: number[], depth: number): boolean | void;
}

export interface NodePredicate {
  (node: EditorNode): boolean;
}