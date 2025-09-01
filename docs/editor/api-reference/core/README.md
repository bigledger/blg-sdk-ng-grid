# Core API Reference

The Core API provides the fundamental building blocks for BLG Editor, including the main editor component, services, and interfaces.

## 📋 Table of Contents

- [EditorCoreComponent](#editorcorecomponent)
- [Services](#services)
  - [EditorStateService](#editorstateservice)
  - [SelectionService](#selectionservice)
  - [CommandService](#commandservice)
  - [EventService](#eventservice)
  - [PluginManagerService](#pluginmanagerservice)
- [Interfaces](#interfaces)
  - [EditorConfig](#editorconfig)
  - [EditorState](#editorstate)
  - [EditorCommand](#editorcommand)
  - [EditorEvent](#editorevent)
- [Directives](#directives)
- [Types & Enums](#types--enums)

## EditorCoreComponent

The main editor component that provides rich text editing capabilities.

### Selector
```html
<blg-editor-core></blg-editor-core>
```

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `config` | `EditorConfig` | `{}` | Editor configuration options |
| `content` | `string` | `''` | Initial HTML content |
| `placeholder` | `string` | `''` | Placeholder text when empty |
| `readonly` | `boolean` | `false` | Makes editor read-only |
| `disabled` | `boolean` | `false` | Disables the editor |
| `autoFocus` | `boolean` | `false` | Auto-focus on initialization |
| `maxLength` | `number` | `undefined` | Maximum character limit |
| `minHeight` | `string \| number` | `'200px'` | Minimum editor height |
| `maxHeight` | `string \| number` | `undefined` | Maximum editor height |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `contentChange` | `EventEmitter<string>` | Emitted when content changes |
| `focusEvent` | `EventEmitter<FocusEvent>` | Emitted when editor gains focus |
| `blurEvent` | `EventEmitter<FocusEvent>` | Emitted when editor loses focus |
| `selectionChange` | `EventEmitter<EditorSelection>` | Emitted when selection changes |
| `ready` | `EventEmitter<EditorCoreComponent>` | Emitted when editor is ready |

### Methods

```typescript
class EditorCoreComponent {
  /**
   * Gets the current HTML content
   */
  getContent(): string;

  /**
   * Sets the editor content
   * @param content HTML content to set
   * @param mergeUndoDeltas Whether to merge with undo history
   */
  setContent(content: string, mergeUndoDeltas?: boolean): void;

  /**
   * Gets the current plain text content
   */
  getText(): string;

  /**
   * Focuses the editor
   */
  focus(): void;

  /**
   * Blurs the editor
   */
  blur(): void;

  /**
   * Checks if editor has focus
   */
  hasFocus(): boolean;

  /**
   * Inserts content at current cursor position
   * @param content HTML content to insert
   */
  insertContent(content: string): void;

  /**
   * Executes a command
   * @param command Command name or object
   * @param params Command parameters
   */
  executeCommand(command: string | EditorCommand, params?: any): void;

  /**
   * Gets the current selection
   */
  getSelection(): EditorSelection | null;

  /**
   * Sets the selection
   * @param selection Selection to set
   */
  setSelection(selection: EditorSelection): void;

  /**
   * Clears the current selection
   */
  clearSelection(): void;

  /**
   * Undoes the last action
   */
  undo(): void;

  /**
   * Redoes the last undone action
   */
  redo(): void;

  /**
   * Checks if undo is available
   */
  canUndo(): boolean;

  /**
   * Checks if redo is available
   */
  canRedo(): boolean;

  /**
   * Destroys the editor instance
   */
  destroy(): void;
}
```

### Example Usage

```typescript
import { Component, ViewChild } from '@angular/core';
import { EditorCoreComponent, EditorConfig } from '@ng-ui/editor-core';

@Component({
  template: `
    <blg-editor-core
      #editor
      [config]="editorConfig"
      (contentChange)="onContentChange($event)"
      (ready)="onEditorReady($event)">
    </blg-editor-core>
    <button (click)="insertText()">Insert Text</button>
    <button (click)="makeBold()">Make Bold</button>
  `
})
export class MyComponent {
  @ViewChild('editor') editor!: EditorCoreComponent;

  editorConfig: EditorConfig = {
    placeholder: 'Start typing...',
    minHeight: '300px',
    autoFocus: true
  };

  onContentChange(content: string) {
    console.log('Content changed:', content);
  }

  onEditorReady(editor: EditorCoreComponent) {
    console.log('Editor ready:', editor);
  }

  insertText() {
    this.editor.insertContent('<strong>Hello World!</strong>');
  }

  makeBold() {
    this.editor.executeCommand('bold');
  }
}
```

## Services

### EditorStateService

Manages the overall state of the editor.

```typescript
@Injectable()
class EditorStateService {
  /**
   * Current editor state as a signal
   */
  readonly state: Signal<EditorState>;

  /**
   * Updates the editor state
   * @param partial Partial state to update
   */
  updateState(partial: Partial<EditorState>): void;

  /**
   * Gets the current state value
   */
  getCurrentState(): EditorState;

  /**
   * Resets state to initial values
   */
  reset(): void;

  /**
   * Checks if editor is in readonly mode
   */
  isReadonly(): boolean;

  /**
   * Checks if editor is disabled
   */
  isDisabled(): boolean;

  /**
   * Gets current content
   */
  getContent(): string;

  /**
   * Sets content
   * @param content HTML content
   */
  setContent(content: string): void;
}
```

### SelectionService

Manages text selection and cursor position.

```typescript
@Injectable()
class SelectionService {
  /**
   * Current selection as a signal
   */
  readonly selection: Signal<EditorSelection | null>;

  /**
   * Gets the current selection
   */
  getSelection(): EditorSelection | null;

  /**
   * Sets the selection
   * @param selection Selection to set
   */
  setSelection(selection: EditorSelection): void;

  /**
   * Clears the current selection
   */
  clearSelection(): void;

  /**
   * Checks if there's an active selection
   */
  hasSelection(): boolean;

  /**
   * Gets selected text content
   */
  getSelectedText(): string;

  /**
   * Gets selected HTML content
   */
  getSelectedHTML(): string;

  /**
   * Replaces current selection with content
   * @param content Content to replace selection with
   */
  replaceSelection(content: string): void;

  /**
   * Collapses selection to start or end
   * @param toStart Whether to collapse to start
   */
  collapseSelection(toStart?: boolean): void;
}
```

### CommandService

Handles editor commands and operations.

```typescript
@Injectable()
class CommandService {
  /**
   * Registers a new command
   * @param name Command name
   * @param handler Command handler function
   */
  registerCommand(name: string, handler: CommandHandler): void;

  /**
   * Executes a command
   * @param name Command name
   * @param params Command parameters
   */
  executeCommand(name: string, params?: any): boolean;

  /**
   * Checks if a command is available
   * @param name Command name
   */
  isCommandAvailable(name: string): boolean;

  /**
   * Gets all registered commands
   */
  getRegisteredCommands(): string[];

  /**
   * Unregisters a command
   * @param name Command name
   */
  unregisterCommand(name: string): void;
}
```

### EventService

Manages editor events and event handling.

```typescript
@Injectable()
class EventService {
  /**
   * Emits an editor event
   * @param event Event to emit
   */
  emit<T extends EditorEvent>(event: T): void;

  /**
   * Subscribes to an event type
   * @param type Event type
   * @param handler Event handler
   */
  on<T extends EditorEvent>(
    type: string, 
    handler: (event: T) => void
  ): () => void; // Returns unsubscribe function

  /**
   * Subscribes to an event type once
   * @param type Event type
   * @param handler Event handler
   */
  once<T extends EditorEvent>(
    type: string, 
    handler: (event: T) => void
  ): void;

  /**
   * Unsubscribes from an event type
   * @param type Event type
   * @param handler Event handler (optional)
   */
  off(type: string, handler?: Function): void;

  /**
   * Clears all event listeners
   */
  clear(): void;
}
```

### PluginManagerService

Manages editor plugins.

```typescript
@Injectable()
class PluginManagerService {
  /**
   * Registers a plugin
   * @param plugin Plugin instance
   */
  registerPlugin(plugin: EditorPlugin): void;

  /**
   * Unregisters a plugin
   * @param name Plugin name
   */
  unregisterPlugin(name: string): void;

  /**
   * Gets a registered plugin
   * @param name Plugin name
   */
  getPlugin(name: string): EditorPlugin | undefined;

  /**
   * Gets all registered plugins
   */
  getPlugins(): EditorPlugin[];

  /**
   * Checks if a plugin is registered
   * @param name Plugin name
   */
  hasPlugin(name: string): boolean;

  /**
   * Enables a plugin
   * @param name Plugin name
   */
  enablePlugin(name: string): void;

  /**
   * Disables a plugin
   * @param name Plugin name
   */
  disablePlugin(name: string): void;

  /**
   * Initializes all plugins
   */
  initializePlugins(): void;

  /**
   * Destroys all plugins
   */
  destroyPlugins(): void;
}
```

## Interfaces

### EditorConfig

Main configuration interface for the editor.

```typescript
interface EditorConfig {
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
```

### EditorState

Represents the current state of the editor.

```typescript
interface EditorState {
  /** Current content */
  content: string;
  
  /** Whether editor has focus */
  focused: boolean;
  
  /** Whether content has been modified */
  modified: boolean;
  
  /** Current selection */
  selection: EditorSelection | null;
  
  /** Whether editor is readonly */
  readonly: boolean;
  
  /** Whether editor is disabled */
  disabled: boolean;
  
  /** Current character count */
  characterCount: number;
  
  /** Undo history */
  undoHistory: EditorHistoryItem[];
  
  /** Redo history */
  redoHistory: EditorHistoryItem[];
}
```

### EditorCommand

Represents an editor command.

```typescript
interface EditorCommand {
  /** Command name */
  name: string;
  
  /** Command parameters */
  params?: any;
  
  /** Whether command should be added to history */
  addToHistory?: boolean;
  
  /** Command description for accessibility */
  description?: string;
}

type CommandHandler = (params?: any) => boolean;
```

### EditorEvent

Base interface for editor events.

```typescript
interface EditorEvent {
  /** Event type */
  type: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** Whether event can be cancelled */
  cancelable?: boolean;
  
  /** Whether event has been cancelled */
  cancelled?: boolean;
  
  /** Event data */
  data?: any;
}

interface ContentChangeEvent extends EditorEvent {
  type: 'content-change';
  content: string;
  previousContent: string;
}

interface SelectionChangeEvent extends EditorEvent {
  type: 'selection-change';
  selection: EditorSelection | null;
  previousSelection: EditorSelection | null;
}

interface FocusEvent extends EditorEvent {
  type: 'focus' | 'blur';
  element: HTMLElement;
}
```

## Directives

### ContentEditableDirective

Makes elements content-editable with enhanced functionality.

```typescript
@Directive({
  selector: '[blgContentEditable]'
})
class ContentEditableDirective {
  /** Whether element is editable */
  @Input() blgContentEditable: boolean = true;
  
  /** Placeholder text */
  @Input() placeholder: string = '';
  
  /** Content change event */
  @Output() contentChange = new EventEmitter<string>();
  
  /** Focus event */
  @Output() focusEvent = new EventEmitter<FocusEvent>();
  
  /** Blur event */
  @Output() blurEvent = new EventEmitter<FocusEvent>();
}
```

## Types & Enums

### FormattingType

```typescript
type FormattingType = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strikethrough' 
  | 'code' 
  | 'blockquote' 
  | 'heading1' | 'heading2' | 'heading3' 
  | 'heading4' | 'heading5' | 'heading6' 
  | 'paragraph' 
  | 'bulletList' | 'orderedList' 
  | 'link' | 'image' | 'table' 
  | 'horizontalRule' 
  | 'textAlign' 
  | 'fontFamily' | 'fontSize' 
  | 'fontColor' | 'backgroundColor';
```

### EditorSelection

```typescript
interface EditorSelection {
  /** Selection start position */
  start: number;
  
  /** Selection end position */
  end: number;
  
  /** Selected text */
  text: string;
  
  /** Selected HTML */
  html: string;
  
  /** Whether selection is collapsed */
  collapsed: boolean;
  
  /** Selection direction */
  direction: 'forward' | 'backward' | 'none';
}
```

### Plugin System Types

```typescript
interface EditorPlugin {
  /** Plugin name */
  name: string;
  
  /** Plugin version */
  version: string;
  
  /** Plugin description */
  description?: string;
  
  /** Initialize plugin */
  init(editor: EditorCoreComponent): void;
  
  /** Destroy plugin */
  destroy(): void;
  
  /** Plugin configuration */
  config?: Record<string, any>;
  
  /** Whether plugin is enabled */
  enabled: boolean;
}

interface PluginConfig {
  /** Plugin name/identifier */
  name: string;
  
  /** Plugin options */
  options?: Record<string, any>;
  
  /** Whether plugin is enabled */
  enabled?: boolean;
}
```

---

*For more detailed examples and advanced usage, see our [Examples](../../examples/) section.*