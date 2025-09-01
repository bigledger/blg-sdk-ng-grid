/**
 * Represents the current state and context of the editor
 */
export interface EditorContext {
  /** The editor element */
  element: HTMLElement;
  
  /** Current selection */
  selection: Selection | null;
  
  /** Current range */
  range: Range | null;
  
  /** Whether the editor is focused */
  isFocused: boolean;
  
  /** Current document being edited */
  document: Document;
  
  /** Undo/redo history */
  history?: EditorHistory;
}

/**
 * Editor history for undo/redo functionality
 */
export interface EditorHistory {
  /** Add a state to history */
  addState(state: EditorState): void;
  
  /** Undo the last action */
  undo(): EditorState | null;
  
  /** Redo the last undone action */
  redo(): EditorState | null;
  
  /** Check if undo is available */
  canUndo(): boolean;
  
  /** Check if redo is available */
  canRedo(): boolean;
  
  /** Clear history */
  clear(): void;
}

/**
 * Represents a state in the editor history
 */
export interface EditorState {
  /** HTML content */
  content: string;
  
  /** Selection position */
  selectionStart?: number;
  
  /** Selection end position */
  selectionEnd?: number;
  
  /** Timestamp */
  timestamp: number;
}