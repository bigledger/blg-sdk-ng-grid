import { Injectable, signal, computed } from '@angular/core';
import {
  EditorCommand,
  CommandExecutionContext,
  CommandResult,
  CommandCategory,
  EDITOR_COMMANDS,
  EditorCommandName
} from '../interfaces';

/**
 * Command Service
 * Manages command registration, execution, and undo/redo functionality
 */
@Injectable({
  providedIn: 'root'
})
export class CommandService {
  // Private state
  private _commands = signal<Map<string, EditorCommand>>(new Map());
  private _shortcuts = signal<Map<string, string>>(new Map());
  private _editorInstance: any = null;

  // Public readonly state
  readonly commands = this._commands.asReadonly();
  readonly shortcuts = this._shortcuts.asReadonly();

  // Computed values
  readonly commandNames = computed(() => Array.from(this._commands().keys()));
  readonly commandsByCategory = computed(() => {
    const commands = this._commands();
    const categories: Record<CommandCategory, EditorCommand[]> = {
      formatting: [],
      structure: [],
      media: [],
      table: [],
      list: [],
      history: [],
      selection: [],
      clipboard: [],
      custom: []
    };

    commands.forEach(command => {
      const category = command.category || 'custom';
      categories[category].push(command);
    });

    return categories;
  });

  constructor() {
    this.registerBuiltInCommands();
  }

  /**
   * Initialize command service with editor instance
   */
  initialize(editorInstance: any): void {
    this._editorInstance = editorInstance;
  }

  /**
   * Register a command
   */
  registerCommand(command: EditorCommand): void {
    const commands = new Map(this._commands());
    commands.set(command.name, command);
    this._commands.set(commands);

    // Register keyboard shortcut if provided
    if (command.shortcut) {
      const shortcuts = new Map(this._shortcuts());
      shortcuts.set(command.shortcut, command.name);
      this._shortcuts.set(shortcuts);
    }
  }

  /**
   * Unregister a command
   */
  unregisterCommand(commandName: string): boolean {
    const commands = new Map(this._commands());
    const command = commands.get(commandName);
    
    if (command) {
      commands.delete(commandName);
      this._commands.set(commands);

      // Remove shortcut if exists
      if (command.shortcut) {
        const shortcuts = new Map(this._shortcuts());
        shortcuts.delete(command.shortcut);
        this._shortcuts.set(shortcuts);
      }

      return true;
    }

    return false;
  }

  /**
   * Get command by name
   */
  getCommand(commandName: string): EditorCommand | null {
    return this._commands().get(commandName) || null;
  }

  /**
   * Get command by keyboard shortcut
   */
  getCommandByShortcut(shortcut: string): EditorCommand | null {
    const commandName = this._shortcuts().get(shortcut);
    return commandName ? this.getCommand(commandName) : null;
  }

  /**
   * Execute a command
   */
  async execute(commandName: string, params?: Record<string, any>): Promise<boolean> {
    const command = this.getCommand(commandName);
    
    if (!command) {
      console.warn(`Command '${commandName}' not found`);
      return false;
    }

    // Check if command can be executed
    if (command.canExecute && !command.canExecute(params)) {
      return false;
    }

    try {
      // Create execution context
      const context: CommandExecutionContext = {
        editor: this._editorInstance,
        selection: this.getCurrentSelection(),
        content: this.getCurrentContent(),
        params: params || {},
        context: {}
      };

      // Execute command
      const result = await command.execute.call(context, params);
      
      return typeof result === 'boolean' ? result : true;
    } catch (error) {
      console.error(`Command '${commandName}' execution failed:`, error);
      return false;
    }
  }

  /**
   * Execute command from keyboard shortcut
   */
  async executeShortcut(shortcut: string): Promise<boolean> {
    const command = this.getCommandByShortcut(shortcut);
    if (command) {
      return this.execute(command.name);
    }
    return false;
  }

  /**
   * Check if command can be executed
   */
  canExecute(commandName: string, params?: Record<string, any>): boolean {
    const command = this.getCommand(commandName);
    if (!command) return false;

    return command.canExecute ? command.canExecute(params) : true;
  }

  /**
   * Get all commands in a category
   */
  getCommandsByCategory(category: CommandCategory): EditorCommand[] {
    return this.commandsByCategory()[category] || [];
  }

  /**
   * Register built-in commands
   */
  private registerBuiltInCommands(): void {
    // Formatting commands
    this.registerCommand({
      name: EDITOR_COMMANDS.BOLD,
      category: 'formatting',
      description: 'Toggle bold formatting',
      shortcut: 'Ctrl+B',
      execute: () => this.execFormatCommand('bold'),
      canExecute: () => this.canFormat()
    });

    this.registerCommand({
      name: EDITOR_COMMANDS.ITALIC,
      category: 'formatting',
      description: 'Toggle italic formatting',
      shortcut: 'Ctrl+I',
      execute: () => this.execFormatCommand('italic'),
      canExecute: () => this.canFormat()
    });

    this.registerCommand({
      name: EDITOR_COMMANDS.UNDERLINE,
      category: 'formatting',
      description: 'Toggle underline formatting',
      shortcut: 'Ctrl+U',
      execute: () => this.execFormatCommand('underline'),
      canExecute: () => this.canFormat()
    });

    // Structure commands
    this.registerCommand({
      name: EDITOR_COMMANDS.HEADING_1,
      category: 'structure',
      description: 'Convert to heading 1',
      execute: () => this.execStructureCommand('h1'),
      canExecute: () => this.canChangeStructure()
    });

    this.registerCommand({
      name: EDITOR_COMMANDS.HEADING_2,
      category: 'structure',
      description: 'Convert to heading 2',
      execute: () => this.execStructureCommand('h2'),
      canExecute: () => this.canChangeStructure()
    });

    this.registerCommand({
      name: EDITOR_COMMANDS.PARAGRAPH,
      category: 'structure',
      description: 'Convert to paragraph',
      execute: () => this.execStructureCommand('p'),
      canExecute: () => this.canChangeStructure()
    });

    this.registerCommand({
      name: EDITOR_COMMANDS.BLOCKQUOTE,
      category: 'structure',
      description: 'Convert to blockquote',
      execute: () => this.execStructureCommand('blockquote'),
      canExecute: () => this.canChangeStructure()
    });

    // List commands
    this.registerCommand({
      name: EDITOR_COMMANDS.BULLET_LIST,
      category: 'list',
      description: 'Create bullet list',
      execute: () => this.execListCommand('ul'),
      canExecute: () => this.canCreateList()
    });

    this.registerCommand({
      name: EDITOR_COMMANDS.ORDERED_LIST,
      category: 'list',
      description: 'Create ordered list',
      execute: () => this.execListCommand('ol'),
      canExecute: () => this.canCreateList()
    });

    // History commands
    this.registerCommand({
      name: EDITOR_COMMANDS.UNDO,
      category: 'history',
      description: 'Undo last action',
      shortcut: 'Ctrl+Z',
      execute: () => this.execUndoCommand(),
      canExecute: () => this.canUndo()
    });

    this.registerCommand({
      name: EDITOR_COMMANDS.REDO,
      category: 'history',
      description: 'Redo last undone action',
      shortcut: 'Ctrl+Y',
      execute: () => this.execRedoCommand(),
      canExecute: () => this.canRedo()
    });

    // Selection commands
    this.registerCommand({
      name: EDITOR_COMMANDS.SELECT_ALL,
      category: 'selection',
      description: 'Select all content',
      shortcut: 'Ctrl+A',
      execute: () => this.execSelectAllCommand(),
      canExecute: () => true
    });

    // Clipboard commands
    this.registerCommand({
      name: EDITOR_COMMANDS.CUT,
      category: 'clipboard',
      description: 'Cut selected content',
      shortcut: 'Ctrl+X',
      execute: () => this.execCutCommand(),
      canExecute: () => this.hasSelection()
    });

    this.registerCommand({
      name: EDITOR_COMMANDS.COPY,
      category: 'clipboard',
      description: 'Copy selected content',
      shortcut: 'Ctrl+C',
      execute: () => this.execCopyCommand(),
      canExecute: () => this.hasSelection()
    });

    this.registerCommand({
      name: EDITOR_COMMANDS.PASTE,
      category: 'clipboard',
      description: 'Paste content from clipboard',
      shortcut: 'Ctrl+V',
      execute: () => this.execPasteCommand(),
      canExecute: () => this.canPaste()
    });

    // Media commands
    this.registerCommand({
      name: EDITOR_COMMANDS.INSERT_LINK,
      category: 'media',
      description: 'Insert or edit link',
      shortcut: 'Ctrl+K',
      execute: (params) => this.execInsertLinkCommand(params),
      canExecute: () => true
    });

    this.registerCommand({
      name: EDITOR_COMMANDS.INSERT_IMAGE,
      category: 'media',
      description: 'Insert image',
      execute: (params) => this.execInsertImageCommand(params),
      canExecute: () => true
    });
  }

  // Command execution methods
  private execFormatCommand(format: string): boolean {
    try {
      return document.execCommand(format, false);
    } catch (error) {
      console.error(`Format command '${format}' failed:`, error);
      return false;
    }
  }

  private execStructureCommand(tag: string): boolean {
    try {
      return document.execCommand('formatBlock', false, tag);
    } catch (error) {
      console.error(`Structure command '${tag}' failed:`, error);
      return false;
    }
  }

  private execListCommand(listType: string): boolean {
    try {
      const command = listType === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
      return document.execCommand(command, false);
    } catch (error) {
      console.error(`List command '${listType}' failed:`, error);
      return false;
    }
  }

  private execUndoCommand(): boolean {
    if (this._editorInstance && this._editorInstance.stateService) {
      return this._editorInstance.stateService.undo();
    }
    return document.execCommand('undo', false);
  }

  private execRedoCommand(): boolean {
    if (this._editorInstance && this._editorInstance.stateService) {
      return this._editorInstance.stateService.redo();
    }
    return document.execCommand('redo', false);
  }

  private execSelectAllCommand(): boolean {
    try {
      return document.execCommand('selectAll', false);
    } catch (error) {
      console.error('Select all command failed:', error);
      return false;
    }
  }

  private execCutCommand(): boolean {
    try {
      return document.execCommand('cut', false);
    } catch (error) {
      console.error('Cut command failed:', error);
      return false;
    }
  }

  private execCopyCommand(): boolean {
    try {
      return document.execCommand('copy', false);
    } catch (error) {
      console.error('Copy command failed:', error);
      return false;
    }
  }

  private execPasteCommand(): boolean {
    try {
      return document.execCommand('paste', false);
    } catch (error) {
      console.error('Paste command failed:', error);
      return false;
    }
  }

  private execInsertLinkCommand(params?: Record<string, any>): boolean {
    try {
      const url = params?.url || prompt('Enter URL:');
      if (url) {
        return document.execCommand('createLink', false, url);
      }
      return false;
    } catch (error) {
      console.error('Insert link command failed:', error);
      return false;
    }
  }

  private execInsertImageCommand(params?: Record<string, any>): boolean {
    try {
      const src = params?.src || prompt('Enter image URL:');
      if (src) {
        return document.execCommand('insertImage', false, src);
      }
      return false;
    } catch (error) {
      console.error('Insert image command failed:', error);
      return false;
    }
  }

  // Helper methods for command validation
  private canFormat(): boolean {
    return !this.isReadonly();
  }

  private canChangeStructure(): boolean {
    return !this.isReadonly() && this.hasContent();
  }

  private canCreateList(): boolean {
    return !this.isReadonly();
  }

  private canUndo(): boolean {
    if (this._editorInstance && this._editorInstance.stateService) {
      return this._editorInstance.stateService.canUndo();
    }
    return !this.isReadonly();
  }

  private canRedo(): boolean {
    if (this._editorInstance && this._editorInstance.stateService) {
      return this._editorInstance.stateService.canRedo();
    }
    return !this.isReadonly();
  }

  private canPaste(): boolean {
    return !this.isReadonly();
  }

  private hasSelection(): boolean {
    const selection = window.getSelection();
    return selection !== null && !selection.isCollapsed;
  }

  private hasContent(): boolean {
    if (this._editorInstance) {
      return !this._editorInstance.isEmpty();
    }
    return true;
  }

  private isReadonly(): boolean {
    if (this._editorInstance) {
      return this._editorInstance.state().readonly;
    }
    return false;
  }

  private getCurrentSelection(): any {
    if (this._editorInstance && this._editorInstance.selectionService) {
      return this._editorInstance.selectionService.selection();
    }
    return window.getSelection();
  }

  private getCurrentContent(): string {
    if (this._editorInstance) {
      return this._editorInstance.getContent();
    }
    return '';
  }

  /**
   * Handle keyboard shortcut
   */
  handleKeyboardShortcut(event: KeyboardEvent): boolean {
    const shortcut = this.getShortcutFromEvent(event);
    if (shortcut) {
      const command = this.getCommandByShortcut(shortcut);
      if (command && this.canExecute(command.name)) {
        event.preventDefault();
        this.execute(command.name);
        return true;
      }
    }
    return false;
  }

  /**
   * Convert keyboard event to shortcut string
   */
  private getShortcutFromEvent(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    
    // Add the main key
    const key = event.key;
    if (key.length === 1) {
      parts.push(key.toUpperCase());
    } else {
      parts.push(key);
    }
    
    return parts.join('+');
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    this._commands.set(new Map());
    this._shortcuts.set(new Map());
    this._editorInstance = null;
  }
}