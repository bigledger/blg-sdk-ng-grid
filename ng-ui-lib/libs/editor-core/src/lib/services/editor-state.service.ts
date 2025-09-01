import { Injectable, signal, computed, effect } from '@angular/core';
import { 
  EditorState, 
  EditorConfig, 
  HistoryEntry, 
  FormattingState, 
  EditorMode,
  BlockType,
  ListType
} from '../interfaces';

/**
 * Editor State Service
 * Manages editor state using Angular Signals for reactive state management
 */
@Injectable({
  providedIn: 'root'
})
export class EditorStateService {
  // Private state signals
  private _content = signal<string>('');
  private _focused = signal<boolean>(false);
  private _readonly = signal<boolean>(false);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _dirty = signal<boolean>(false);
  private _mode = signal<EditorMode>('edit');
  private _config = signal<EditorConfig>({});
  
  // History state
  private _undoStack = signal<HistoryEntry[]>([]);
  private _redoStack = signal<HistoryEntry[]>([]);
  private _currentHistoryIndex = signal<number>(-1);
  private _maxHistorySize = signal<number>(100);
  
  // Formatting state
  private _currentFormatting = signal<FormattingState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    fontFamily: null,
    fontSize: null,
    textColor: null,
    backgroundColor: null,
    textAlign: null,
    blockType: null,
    listType: null,
    headingLevel: null,
    inLink: false,
    inTable: false,
    tablePosition: null
  });

  // Plugin state
  private _plugins = signal<Record<string, any>>({});

  // Public readonly state
  readonly state = computed<EditorState>(() => ({
    content: this._content(),
    focused: this._focused(),
    readonly: this._readonly(),
    selection: null, // Will be set by SelectionService
    currentFormatting: this._currentFormatting(),
    history: {
      undoStack: this._undoStack(),
      redoStack: this._redoStack(),
      currentIndex: this._currentHistoryIndex(),
      maxSize: this._maxHistorySize(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    },
    loading: this._loading(),
    error: this._error(),
    dirty: this._dirty(),
    mode: this._mode(),
    plugins: this._plugins()
  }));

  // Computed values
  readonly canUndo = computed(() => this._undoStack().length > 0);
  readonly canRedo = computed(() => this._redoStack().length > 0);
  readonly isEmpty = computed(() => {
    const content = this._content();
    return !content || content.trim() === '' || content === '<p></p>';
  });
  readonly wordCount = computed(() => {
    const content = this._content();
    const text = this.stripHtml(content);
    return text.split(/\s+/).filter(word => word.length > 0).length;
  });
  readonly characterCount = computed(() => this._content().length);

  constructor() {
    // Effect to mark as dirty when content changes
    effect(() => {
      const content = this._content();
      if (content !== this._config().content) {
        this._dirty.set(true);
      }
    });

    // Effect to auto-save history entries
    effect(() => {
      const content = this._content();
      if (content && this._undoStack().length === 0 || 
          content !== this._undoStack()[this._undoStack().length - 1]?.content) {
        this.addHistoryEntry(content);
      }
    }, { allowSignalWrites: true });
  }

  /**
   * Initialize the state service with configuration
   */
  initialize(config: EditorConfig): void {
    this._config.set(config);
    this._content.set(config.content || '');
    this._readonly.set(config.readonly || false);
    this._mode.set('edit');
    this._dirty.set(false);
    this._error.set(null);
    this._loading.set(false);
    
    // Initialize history
    this._undoStack.set([]);
    this._redoStack.set([]);
    this._currentHistoryIndex.set(-1);
    
    if (config.content) {
      this.addHistoryEntry(config.content, 'Initial content');
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: EditorConfig): void {
    const currentConfig = this._config();
    const newConfig = { ...currentConfig, ...config };
    this._config.set(newConfig);
    
    if (config.readonly !== undefined) {
      this._readonly.set(config.readonly);
    }
  }

  /**
   * Update content
   */
  updateContent(content: string): void {
    const currentContent = this._content();
    if (content !== currentContent) {
      this._content.set(content);
      this.addHistoryEntry(content);
    }
  }

  /**
   * Set content without adding to history
   */
  setContentSilent(content: string): void {
    this._content.set(content);
  }

  /**
   * Set focused state
   */
  setFocused(focused: boolean): void {
    this._focused.set(focused);
  }

  /**
   * Set readonly state
   */
  setReadonly(readonly: boolean): void {
    this._readonly.set(readonly);
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    this._error.set(error);
  }

  /**
   * Set dirty state
   */
  setDirty(dirty: boolean): void {
    this._dirty.set(dirty);
  }

  /**
   * Set editor mode
   */
  setMode(mode: EditorMode): void {
    this._mode.set(mode);
  }

  /**
   * Update current formatting
   */
  updateFormatting(formatting: Partial<FormattingState>): void {
    const currentFormatting = this._currentFormatting();
    this._currentFormatting.set({ ...currentFormatting, ...formatting });
  }

  /**
   * Set plugin state
   */
  setPluginState(pluginName: string, state: any): void {
    const plugins = this._plugins();
    this._plugins.set({ ...plugins, [pluginName]: state });
  }

  /**
   * Get plugin state
   */
  getPluginState(pluginName: string): any {
    return this._plugins()[pluginName];
  }

  /**
   * Add history entry
   */
  private addHistoryEntry(content: string, description?: string): void {
    const undoStack = this._undoStack();
    const maxSize = this._maxHistorySize();
    
    // Don't add duplicate entries
    const lastEntry = undoStack[undoStack.length - 1];
    if (lastEntry && lastEntry.content === content) {
      return;
    }

    const entry: HistoryEntry = {
      id: this.generateId(),
      content,
      selection: null, // Will be set by SelectionService if needed
      timestamp: Date.now(),
      description
    };

    // Add to undo stack
    const newUndoStack = [...undoStack, entry];
    
    // Limit history size
    if (newUndoStack.length > maxSize) {
      newUndoStack.shift();
    }

    this._undoStack.set(newUndoStack);
    this._currentHistoryIndex.set(newUndoStack.length - 1);
    
    // Clear redo stack when new content is added
    this._redoStack.set([]);
  }

  /**
   * Undo last change
   */
  undo(): boolean {
    const undoStack = this._undoStack();
    const currentIndex = this._currentHistoryIndex();
    
    if (currentIndex > 0) {
      const currentEntry = undoStack[currentIndex];
      const previousEntry = undoStack[currentIndex - 1];
      
      // Add current state to redo stack
      const redoStack = this._redoStack();
      this._redoStack.set([...redoStack, currentEntry]);
      
      // Restore previous content
      this.setContentSilent(previousEntry.content);
      this._currentHistoryIndex.set(currentIndex - 1);
      
      return true;
    }
    
    return false;
  }

  /**
   * Redo last undone change
   */
  redo(): boolean {
    const redoStack = this._redoStack();
    
    if (redoStack.length > 0) {
      const entryToRedo = redoStack[redoStack.length - 1];
      
      // Remove from redo stack
      const newRedoStack = redoStack.slice(0, -1);
      this._redoStack.set(newRedoStack);
      
      // Add current state to undo stack
      const undoStack = this._undoStack();
      const currentIndex = this._currentHistoryIndex();
      this._currentHistoryIndex.set(currentIndex + 1);
      
      // Restore content
      this.setContentSilent(entryToRedo.content);
      
      return true;
    }
    
    return false;
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this._undoStack.set([]);
    this._redoStack.set([]);
    this._currentHistoryIndex.set(-1);
  }

  /**
   * Get current content
   */
  getContent(): string {
    return this._content();
  }

  /**
   * Get current config
   */
  getConfig(): EditorConfig {
    return this._config();
  }

  /**
   * Check if editor is focused
   */
  isFocused(): boolean {
    return this._focused();
  }

  /**
   * Check if editor is readonly
   */
  isReadonly(): boolean {
    return this._readonly();
  }

  /**
   * Check if editor is loading
   */
  isLoading(): boolean {
    return this._loading();
  }

  /**
   * Check if editor has error
   */
  hasError(): boolean {
    return this._error() !== null;
  }

  /**
   * Get current error
   */
  getError(): string | null {
    return this._error();
  }

  /**
   * Check if editor is dirty
   */
  isDirty(): boolean {
    return this._dirty();
  }

  /**
   * Get current mode
   */
  getMode(): EditorMode {
    return this._mode();
  }

  /**
   * Reset state to initial values
   */
  reset(): void {
    const config = this._config();
    this.initialize(config);
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    this._content.set('');
    this._focused.set(false);
    this._readonly.set(false);
    this._loading.set(false);
    this._error.set(null);
    this._dirty.set(false);
    this._mode.set('edit');
    this._config.set({});
    this._undoStack.set([]);
    this._redoStack.set([]);
    this._currentHistoryIndex.set(-1);
    this._plugins.set({});
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
}