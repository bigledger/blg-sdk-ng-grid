/**
 * Editor Event Interface
 * Defines the event system for the BLG Editor
 */

export interface EditorEvent {
  /** Event type */
  type: EditorEventType;

  /** Event timestamp */
  timestamp: number;

  /** Event source */
  source: EditorEventSource;

  /** Event data */
  data: Record<string, any>;

  /** Whether event is cancelable */
  cancelable: boolean;

  /** Whether event has been cancelled */
  cancelled: boolean;

  /** Whether event propagation has been stopped */
  propagationStopped: boolean;
}

export interface EditorContentChangeEvent extends EditorEvent {
  type: 'contentChange';
  data: {
    /** Previous content */
    previousContent: string;
    /** New content */
    newContent: string;
    /** Change delta */
    delta: ContentDelta;
    /** Source of change */
    source: 'user' | 'api' | 'plugin';
  };
}

export interface EditorSelectionChangeEvent extends EditorEvent {
  type: 'selectionChange';
  data: {
    /** Previous selection */
    previousSelection: any;
    /** New selection */
    newSelection: any;
    /** Change reason */
    reason: SelectionChangeReason;
  };
}

export interface EditorFocusEvent extends EditorEvent {
  type: 'focus' | 'blur';
  data: {
    /** Related target */
    relatedTarget: EventTarget | null;
    /** Focus direction */
    direction: 'forward' | 'backward' | 'none';
  };
}

export interface EditorKeyboardEvent extends EditorEvent {
  type: 'keydown' | 'keyup' | 'keypress';
  data: {
    /** Original keyboard event */
    originalEvent: KeyboardEvent;
    /** Key code */
    keyCode: number;
    /** Key name */
    key: string;
    /** Modifier keys */
    modifiers: KeyModifiers;
    /** Whether key is printable */
    printable: boolean;
  };
}

export interface EditorMouseEvent extends EditorEvent {
  type: 'mousedown' | 'mouseup' | 'click' | 'dblclick' | 'contextmenu';
  data: {
    /** Original mouse event */
    originalEvent: MouseEvent;
    /** Mouse position */
    position: { x: number; y: number };
    /** Target element */
    target: Element;
    /** Mouse button */
    button: number;
    /** Click count */
    clickCount: number;
  };
}

export interface EditorDragEvent extends EditorEvent {
  type: 'dragstart' | 'drag' | 'dragend' | 'dragenter' | 'dragover' | 'dragleave' | 'drop';
  data: {
    /** Original drag event */
    originalEvent: DragEvent;
    /** Drag data */
    dragData: any;
    /** Drop target */
    dropTarget: Element | null;
    /** Drop position */
    dropPosition: DropPosition | null;
  };
}

export interface EditorCommandEvent extends EditorEvent {
  type: 'beforeCommand' | 'afterCommand' | 'commandFailed';
  data: {
    /** Command name */
    commandName: string;
    /** Command parameters */
    commandParams: Record<string, any>;
    /** Command result (for afterCommand/commandFailed) */
    result?: any;
    /** Error (for commandFailed) */
    error?: Error;
  };
}

export interface EditorPluginEvent extends EditorEvent {
  type: 'pluginLoaded' | 'pluginUnloaded' | 'pluginError';
  data: {
    /** Plugin name */
    pluginName: string;
    /** Plugin instance */
    plugin: any;
    /** Error (for pluginError) */
    error?: Error;
  };
}

export interface EditorStateChangeEvent extends EditorEvent {
  type: 'stateChange';
  data: {
    /** State property that changed */
    property: string;
    /** Previous value */
    previousValue: any;
    /** New value */
    newValue: any;
  };
}

export interface ContentDelta {
  /** Type of change */
  type: 'insert' | 'delete' | 'replace';
  /** Position of change */
  position: number;
  /** Length of change */
  length: number;
  /** Inserted content (for insert/replace) */
  content?: string;
  /** Deleted content (for delete/replace) */
  deletedContent?: string;
}

export interface KeyModifiers {
  /** Control key pressed */
  ctrl: boolean;
  /** Alt key pressed */
  alt: boolean;
  /** Shift key pressed */
  shift: boolean;
  /** Meta key pressed */
  meta: boolean;
}

export interface DropPosition {
  /** Target node */
  node: Node;
  /** Offset within node */
  offset: number;
  /** Drop type */
  type: 'before' | 'after' | 'inside';
}

export type EditorEventType = 
  | 'contentChange'
  | 'selectionChange'
  | 'focus'
  | 'blur'
  | 'keydown'
  | 'keyup'
  | 'keypress'
  | 'mousedown'
  | 'mouseup'
  | 'click'
  | 'dblclick'
  | 'contextmenu'
  | 'dragstart'
  | 'drag'
  | 'dragend'
  | 'dragenter'
  | 'dragover'
  | 'dragleave'
  | 'drop'
  | 'beforeCommand'
  | 'afterCommand'
  | 'commandFailed'
  | 'pluginLoaded'
  | 'pluginUnloaded'
  | 'pluginError'
  | 'stateChange'
  | 'ready'
  | 'destroy';

export type EditorEventSource = 
  | 'editor'
  | 'toolbar'
  | 'plugin'
  | 'api'
  | 'user';

export type SelectionChangeReason = 
  | 'userInteraction'
  | 'programmatic'
  | 'command'
  | 'undo'
  | 'redo'
  | 'plugin';

export interface EditorEventHandler<T extends EditorEvent = EditorEvent> {
  /** Event handler function */
  handler: (event: T) => void | boolean;
  /** Handler priority */
  priority?: number;
  /** Whether handler should run once */
  once?: boolean;
  /** Handler context */
  context?: any;
}