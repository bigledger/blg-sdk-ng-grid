import { BaseFormattingCommand } from '../classes/base-command';

/**
 * Subscript formatting command
 */
export class SubscriptCommand extends BaseFormattingCommand {
  override id = 'subscript';
  override name = 'Subscript';
  override description = 'Toggle subscript formatting';
  override icon = 'format-subscript';
  override shortcut = 'Ctrl+=';
  
  execute(): void {
    this.focusEditor();
    
    // Remove superscript first if active
    if (this.isSuperscriptActive()) {
      this.execCommand('superscript');
    }
    
    if (!this.execCommand('subscript')) {
      // Fallback implementation
      this.toggleSubscript();
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('subscript') || this.hasSubscriptElement();
  }
  
  private isSuperscriptActive(): boolean {
    return this.queryCommandState('superscript') || this.hasSuperscriptElement();
  }
  
  private toggleSubscript(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    if (this.isCommandActive()) {
      // Remove subscript
      this.removeFormatting(range, 'SUB');
    } else {
      // Add subscript
      const sub = document.createElement('sub');
      
      if (range.collapsed) {
        range.insertNode(sub);
        range.selectNodeContents(sub);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        try {
          range.surroundContents(sub);
        } catch {
          const contents = range.extractContents();
          sub.appendChild(contents);
          range.insertNode(sub);
        }
      }
    }
  }
  
  private hasSubscriptElement(): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    return this.hasAncestorWithTagName(container, 'SUB');
  }
  
  private hasSuperscriptElement(): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    return this.hasAncestorWithTagName(container, 'SUP');
  }
  
  private hasAncestorWithTagName(node: Node, tagName: string): boolean {
    let currentNode: Node | null = node;
    
    while (currentNode && currentNode !== this.context?.element) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as Element;
        if (element.tagName === tagName) {
          return true;
        }
      }
      currentNode = currentNode.parentNode;
    }
    
    return false;
  }
  
  private removeFormatting(range: Range, tagName: string): void {
    const container = range.commonAncestorContainer;
    let targetElement: Element | null = null;
    
    // Find the target element
    let currentNode: Node | null = container;
    while (currentNode && currentNode !== this.context?.element) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as Element;
        if (element.tagName === tagName) {
          targetElement = element;
          break;
        }
      }
      currentNode = currentNode.parentNode;
    }
    
    if (targetElement) {
      // Replace the element with its contents
      const parent = targetElement.parentNode;
      if (parent) {
        while (targetElement.firstChild) {
          parent.insertBefore(targetElement.firstChild, targetElement);
        }
        parent.removeChild(targetElement);
      }
    }
  }
}

/**
 * Superscript formatting command
 */
export class SuperscriptCommand extends BaseFormattingCommand {
  override id = 'superscript';
  override name = 'Superscript';
  override description = 'Toggle superscript formatting';
  override icon = 'format-superscript';
  override shortcut = 'Ctrl+Shift+=';
  
  execute(): void {
    this.focusEditor();
    
    // Remove subscript first if active
    if (this.isSubscriptActive()) {
      this.execCommand('subscript');
    }
    
    if (!this.execCommand('superscript')) {
      // Fallback implementation
      this.toggleSuperscript();
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('superscript') || this.hasSuperscriptElement();
  }
  
  private isSubscriptActive(): boolean {
    return this.queryCommandState('subscript') || this.hasSubscriptElement();
  }
  
  private toggleSuperscript(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    if (this.isCommandActive()) {
      // Remove superscript
      this.removeFormatting(range, 'SUP');
    } else {
      // Add superscript
      const sup = document.createElement('sup');
      
      if (range.collapsed) {
        range.insertNode(sup);
        range.selectNodeContents(sup);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        try {
          range.surroundContents(sup);
        } catch {
          const contents = range.extractContents();
          sup.appendChild(contents);
          range.insertNode(sup);
        }
      }
    }
  }
  
  private hasSubscriptElement(): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    return this.hasAncestorWithTagName(container, 'SUB');
  }
  
  private hasSuperscriptElement(): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    return this.hasAncestorWithTagName(container, 'SUP');
  }
  
  private hasAncestorWithTagName(node: Node, tagName: string): boolean {
    let currentNode: Node | null = node;
    
    while (currentNode && currentNode !== this.context?.element) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as Element;
        if (element.tagName === tagName) {
          return true;
        }
      }
      currentNode = currentNode.parentNode;
    }
    
    return false;
  }
  
  private removeFormatting(range: Range, tagName: string): void {
    const container = range.commonAncestorContainer;
    let targetElement: Element | null = null;
    
    // Find the target element
    let currentNode: Node | null = container;
    while (currentNode && currentNode !== this.context?.element) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as Element;
        if (element.tagName === tagName) {
          targetElement = element;
          break;
        }
      }
      currentNode = currentNode.parentNode;
    }
    
    if (targetElement) {
      // Replace the element with its contents
      const parent = targetElement.parentNode;
      if (parent) {
        while (targetElement.firstChild) {
          parent.insertBefore(targetElement.firstChild, targetElement);
        }
        parent.removeChild(targetElement);
      }
    }
  }
}

/**
 * Clear formatting command
 */
export class ClearFormattingCommand extends BaseFormattingCommand {
  override id = 'clearFormatting';
  override name = 'Clear Formatting';
  override description = 'Remove all formatting from selected text';
  override icon = 'format-clear';
  override shortcut = 'Ctrl+\\';
  
  execute(): void {
    this.focusEditor();
    
    if (!this.execCommand('removeFormat')) {
      // Fallback implementation
      this.clearAllFormatting();
    }
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  private clearAllFormatting(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    if (range.collapsed) {
      // For collapsed selection, clear formatting from surrounding elements
      this.clearFormattingFromParents(range.startContainer);
    } else {
      // For selection, extract plain text and replace
      this.clearFormattingFromSelection(range);
    }
  }
  
  private clearFormattingFromParents(node: Node): void {
    let currentNode: Node | null = node;
    const formattingTags = ['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'SUB', 'SUP', 'SPAN', 'FONT'];
    
    while (currentNode && currentNode !== this.context?.element) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        
        if (formattingTags.includes(element.tagName)) {
          // Replace element with its contents
          const parent = element.parentNode;
          if (parent) {
            const fragment = document.createDocumentFragment();
            while (element.firstChild) {
              fragment.appendChild(element.firstChild);
            }
            parent.replaceChild(fragment, element);
          }
          break;
        } else {
          // Clear inline styles
          if (element.style) {
            element.removeAttribute('style');
          }
        }
      }
      
      currentNode = currentNode.parentNode;
    }
  }
  
  private clearFormattingFromSelection(range: Range): void {
    // Extract the text content
    const textContent = range.toString();
    
    // Delete the current selection
    range.deleteContents();
    
    // Insert plain text
    const textNode = document.createTextNode(textContent);
    range.insertNode(textNode);
    
    // Update selection
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    
    const selection = this.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

/**
 * Format painter command - copy formatting from one location to another
 */
export class FormatPainterCommand extends BaseFormattingCommand {
  override id = 'formatPainter';
  override name = 'Format Painter';
  override description = 'Copy formatting from selected text';
  override icon = 'format-paint';
  override shortcut = 'Ctrl+Shift+C';
  
  private copiedFormatting: any = null;
  private isPainting = false;
  
  execute(): void {
    this.focusEditor();
    
    if (!this.isPainting) {
      // Copy formatting mode
      this.copyFormatting();
      this.isPainting = true;
      this.isActive = true;
    } else {
      // Apply formatting mode
      this.applyFormatting();
      this.isPainting = false;
      this.isActive = false;
    }
  }
  
  protected isCommandActive(): boolean {
    return this.isPainting;
  }
  
  private copyFormatting(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE 
      ? container as Element 
      : container.parentElement;
    
    if (!element) return;
    
    const computedStyle = window.getComputedStyle(element);
    
    this.copiedFormatting = {
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      fontStyle: computedStyle.fontStyle,
      textDecoration: computedStyle.textDecoration,
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      textAlign: computedStyle.textAlign,
      lineHeight: computedStyle.lineHeight
    };
  }
  
  private applyFormatting(): void {
    if (!this.copiedFormatting) return;
    
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    
    // Apply copied styles
    Object.entries(this.copiedFormatting).forEach(([property, value]) => {
      if (value && value !== 'normal' && value !== 'none') {
        span.style.setProperty(this.camelToKebab(property), value as string);
      }
    });
    
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
  
  private camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }
  
  /**
   * Cancel format painting mode
   */
  cancel(): void {
    this.isPainting = false;
    this.isActive = false;
    this.copiedFormatting = null;
  }
}