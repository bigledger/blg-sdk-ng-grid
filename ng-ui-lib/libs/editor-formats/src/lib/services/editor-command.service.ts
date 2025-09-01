import { Injectable, signal, computed } from '@angular/core';
import { FormattingCommand, FormattingCommandEvent, FormattingCommandType } from '../interfaces/formatting-command.interface';
import { EditorContext } from '../interfaces/editor-context.interface';

/**
 * Service for managing editor formatting commands
 */
@Injectable({
  providedIn: 'root'
})
export class EditorCommandService {
  private readonly _commands = signal<Map<string, FormattingCommand>>(new Map());
  private readonly _context = signal<EditorContext | null>(null);
  
  /** All registered commands */
  readonly commands = computed(() => Array.from(this._commands().values()));
  
  /** Commands grouped by type */
  readonly commandsByType = computed(() => {
    const commands = this.commands();
    const groups: { [key in FormattingCommandType]?: FormattingCommand[] } = {};
    
    commands.forEach(command => {
      const type = this.getCommandType(command);
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type]!.push(command);
    });
    
    return groups;
  });
  
  /** Current editor context */
  readonly context = this._context.asReadonly();
  
  /**
   * Register a formatting command
   */
  registerCommand(command: FormattingCommand): void {
    this._commands.update(commands => {
      const newCommands = new Map(commands);
      newCommands.set(command.id, command);
      return newCommands;
    });
  }
  
  /**
   * Unregister a formatting command
   */
  unregisterCommand(commandId: string): void {
    this._commands.update(commands => {
      const newCommands = new Map(commands);
      newCommands.delete(commandId);
      return newCommands;
    });
  }
  
  /**
   * Get a command by ID
   */
  getCommand(commandId: string): FormattingCommand | undefined {
    return this._commands().get(commandId);
  }
  
  /**
   * Execute a formatting command
   */
  executeCommand(commandId: string, value?: any): boolean {
    const command = this.getCommand(commandId);
    if (!command) {
      console.warn(`Command '${commandId}' not found`);
      return false;
    }
    
    if (command.checkEnabled && !command.checkEnabled()) {
      console.warn(`Command '${commandId}' is disabled`);
      return false;
    }
    
    try {
      command.execute(value);
      this.updateCommandStates();
      return true;
    } catch (error) {
      console.error(`Error executing command '${commandId}':`, error);
      return false;
    }
  }
  
  /**
   * Set the current editor context
   */
  setContext(context: EditorContext): void {
    this._context.set(context);
    this.updateCommandStates();
  }
  
  /**
   * Update the active/enabled states of all commands
   */
  updateCommandStates(): void {
    const context = this._context();
    if (!context) return;
    
    this._commands().forEach(command => {
      if (command.checkActive) {
        command.isActive = command.checkActive();
      }
      if (command.checkEnabled) {
        command.isEnabled = command.checkEnabled();
      }
    });
  }
  
  /**
   * Get the type of a command based on its ID
   */
  private getCommandType(command: FormattingCommand): FormattingCommandType {
    const id = command.id;
    
    if (['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'].includes(id)) {
      return FormattingCommandType.BASIC_TEXT;
    }
    if (['fontFamily', 'fontSize'].includes(id)) {
      return FormattingCommandType.FONT;
    }
    if (['textColor', 'backgroundColor'].includes(id)) {
      return FormattingCommandType.COLOR;
    }
    if (['alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'indent', 'outdent'].includes(id)) {
      return FormattingCommandType.PARAGRAPH;
    }
    if (['heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6', 'paragraph', 'blockquote'].includes(id)) {
      return FormattingCommandType.HEADING;
    }
    if (['orderedList', 'unorderedList', 'listIndent', 'listOutdent'].includes(id)) {
      return FormattingCommandType.LIST;
    }
    
    return FormattingCommandType.SPECIAL;
  }
}