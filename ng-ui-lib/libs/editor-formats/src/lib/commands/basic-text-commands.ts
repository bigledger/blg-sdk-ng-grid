import { BaseFormattingCommand } from '../classes/base-command';

/**
 * Bold formatting command
 */
export class BoldCommand extends BaseFormattingCommand {
  override id = 'bold';
  override name = 'Bold';
  override description = 'Toggle bold formatting';
  override icon = 'format-bold';
  override shortcut = 'Ctrl+B';
  
  execute(): void {
    this.focusEditor();
    if (!this.execCommand('bold')) {
      // Fallback implementation
      this.toggleInlineStyle('font-weight', 'bold', 'normal');
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('bold') || this.hasInlineStyle('font-weight', 'bold');
  }
  
  private toggleInlineStyle(property: string, activeValue: string, inactiveValue: string): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      // Insert marker element for collapsed selection
      const span = document.createElement('span');
      span.style.setProperty(property, this.isCommandActive() ? inactiveValue : activeValue);
      range.insertNode(span);
      range.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Wrap selection in span
      const span = document.createElement('span');
      span.style.setProperty(property, this.isCommandActive() ? inactiveValue : activeValue);
      try {
        range.surroundContents(span);
      } catch {
        // Fallback: extract and wrap
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
    }
  }
  
  private hasInlineStyle(property: string, value: string): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE 
      ? container as Element 
      : container.parentElement;
    
    if (!element) return false;
    
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue(property) === value;
  }
}

/**
 * Italic formatting command
 */
export class ItalicCommand extends BaseFormattingCommand {
  override id = 'italic';
  override name = 'Italic';
  override description = 'Toggle italic formatting';
  override icon = 'format-italic';
  override shortcut = 'Ctrl+I';
  
  execute(): void {
    this.focusEditor();
    if (!this.execCommand('italic')) {
      this.toggleInlineStyle('font-style', 'italic', 'normal');
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('italic') || this.hasInlineStyle('font-style', 'italic');
  }
  
  private toggleInlineStyle(property: string, activeValue: string, inactiveValue: string): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.setProperty(property, this.isCommandActive() ? inactiveValue : activeValue);
    
    if (range.collapsed) {
      range.insertNode(span);
      range.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      try {
        range.surroundContents(span);
      } catch {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
    }
  }
  
  private hasInlineStyle(property: string, value: string): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE 
      ? container as Element 
      : container.parentElement;
    
    if (!element) return false;
    
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue(property) === value;
  }
}

/**
 * Underline formatting command
 */
export class UnderlineCommand extends BaseFormattingCommand {
  override id = 'underline';
  override name = 'Underline';
  override description = 'Toggle underline formatting';
  override icon = 'format-underlined';
  override shortcut = 'Ctrl+U';
  
  execute(): void {
    this.focusEditor();
    if (!this.execCommand('underline')) {
      this.toggleInlineStyle('text-decoration', 'underline', 'none');
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('underline') || this.hasTextDecoration('underline');
  }
  
  private toggleInlineStyle(property: string, activeValue: string, inactiveValue: string): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.setProperty(property, this.isCommandActive() ? inactiveValue : activeValue);
    
    if (range.collapsed) {
      range.insertNode(span);
      range.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      try {
        range.surroundContents(span);
      } catch {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
    }
  }
  
  private hasTextDecoration(value: string): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE 
      ? container as Element 
      : container.parentElement;
    
    if (!element) return false;
    
    const computedStyle = window.getComputedStyle(element);
    const textDecoration = computedStyle.getPropertyValue('text-decoration');
    return textDecoration.includes(value);
  }
}

/**
 * Strikethrough formatting command
 */
export class StrikethroughCommand extends BaseFormattingCommand {
  override id = 'strikethrough';
  override name = 'Strikethrough';
  override description = 'Toggle strikethrough formatting';
  override icon = 'format-strikethrough';
  override shortcut = 'Ctrl+Shift+X';
  
  execute(): void {
    this.focusEditor();
    if (!this.execCommand('strikethrough')) {
      this.toggleInlineStyle('text-decoration', 'line-through', 'none');
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('strikethrough') || this.hasTextDecoration('line-through');
  }
  
  private toggleInlineStyle(property: string, activeValue: string, inactiveValue: string): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.setProperty(property, this.isCommandActive() ? inactiveValue : activeValue);
    
    if (range.collapsed) {
      range.insertNode(span);
      range.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      try {
        range.surroundContents(span);
      } catch {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
    }
  }
  
  private hasTextDecoration(value: string): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE 
      ? container as Element 
      : container.parentElement;
    
    if (!element) return false;
    
    const computedStyle = window.getComputedStyle(element);
    const textDecoration = computedStyle.getPropertyValue('text-decoration');
    return textDecoration.includes(value);
  }
}