import { FormattingCommand } from '../interfaces/formatting-command.interface';
import { EditorContext } from '../interfaces/editor-context.interface';

/**
 * Base class for formatting commands
 */
export abstract class BaseFormattingCommand implements FormattingCommand {
  abstract id: string;
  abstract name: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  isActive: boolean = false;
  isEnabled: boolean = true;
  
  protected context: EditorContext | null = null;
  
  constructor(protected editorElement?: HTMLElement) {}
  
  /**
   * Set the editor context
   */
  setContext(context: EditorContext): void {
    this.context = context;
    this.updateState();
  }
  
  /**
   * Execute the formatting command
   */
  abstract execute(value?: any): void;
  
  /**
   * Check if the command is currently active
   */
  checkActive(): boolean {
    if (!this.context || !this.context.document) {
      return false;
    }
    
    return this.isCommandActive();
  }
  
  /**
   * Check if the command is currently enabled
   */
  checkEnabled(): boolean {
    if (!this.context || !this.context.element) {
      return false;
    }
    
    return this.isCommandEnabled();
  }
  
  /**
   * Update the command state
   */
  updateState(): void {
    this.isActive = this.checkActive();
    this.isEnabled = this.checkEnabled();
  }
  
  /**
   * Execute browser command if available
   */
  protected execCommand(command: string, value?: string): boolean {
    if (!this.context || !this.context.document) {
      return false;
    }
    
    try {
      return this.context.document.execCommand(command, false, value);
    } catch (error) {
      console.warn(`execCommand '${command}' failed:`, error);
      return false;
    }
  }
  
  /**
   * Query browser command state
   */
  protected queryCommandState(command: string): boolean {
    if (!this.context || !this.context.document) {
      return false;
    }
    
    try {
      return this.context.document.queryCommandState(command);
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Query browser command value
   */
  protected queryCommandValue(command: string): string {
    if (!this.context || !this.context.document) {
      return '';
    }
    
    try {
      return this.context.document.queryCommandValue(command);
    } catch (error) {
      return '';
    }
  }
  
  /**
   * Get the current selection
   */
  protected getSelection(): Selection | null {
    return this.context?.selection || null;
  }
  
  /**
   * Get the current range
   */
  protected getRange(): Range | null {
    return this.context?.range || null;
  }
  
  /**
   * Save the current selection
   */
  protected saveSelection(): Range | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }
    return selection.getRangeAt(0).cloneRange();
  }
  
  /**
   * Restore a saved selection
   */
  protected restoreSelection(range: Range): void {
    const selection = this.getSelection();
    if (selection && range) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  /**
   * Check if the command is active (should be overridden by subclasses)
   */
  protected abstract isCommandActive(): boolean;
  
  /**
   * Check if the command is enabled (can be overridden by subclasses)
   */
  protected isCommandEnabled(): boolean {
    return true;
  }
  
  /**
   * Focus the editor element
   */
  protected focusEditor(): void {
    if (this.context?.element) {
      this.context.element.focus();
    }
  }
}