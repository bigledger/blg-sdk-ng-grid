import { BaseFormattingCommand } from '../classes/base-command';

/**
 * Text alignment commands
 */
export class AlignLeftCommand extends BaseFormattingCommand {
  override id = 'alignLeft';
  override name = 'Align Left';
  override description = 'Align text to the left';
  override icon = 'format-align-left';
  override shortcut = 'Ctrl+Shift+L';
  
  execute(): void {
    this.focusEditor();
    if (!this.execCommand('justifyLeft')) {
      this.applyAlignment('left');
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('justifyLeft') || this.getCurrentAlignment() === 'left';
  }
  
  private applyAlignment(alignment: string): void {
    const blockElement = this.getBlockElement();
    if (blockElement) {
      blockElement.style.textAlign = alignment;
    }
  }
  
  private getCurrentAlignment(): string {
    const blockElement = this.getBlockElement();
    if (!blockElement) return '';
    
    const computedStyle = window.getComputedStyle(blockElement);
    return computedStyle.textAlign;
  }
  
  private getBlockElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return this.context?.element as HTMLElement || null;
  }
}

export class AlignCenterCommand extends BaseFormattingCommand {
  override id = 'alignCenter';
  override name = 'Align Center';
  override description = 'Center align text';
  override icon = 'format-align-center';
  override shortcut = 'Ctrl+Shift+E';
  
  execute(): void {
    this.focusEditor();
    if (!this.execCommand('justifyCenter')) {
      this.applyAlignment('center');
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('justifyCenter') || this.getCurrentAlignment() === 'center';
  }
  
  private applyAlignment(alignment: string): void {
    const blockElement = this.getBlockElement();
    if (blockElement) {
      blockElement.style.textAlign = alignment;
    }
  }
  
  private getCurrentAlignment(): string {
    const blockElement = this.getBlockElement();
    if (!blockElement) return '';
    
    const computedStyle = window.getComputedStyle(blockElement);
    return computedStyle.textAlign;
  }
  
  private getBlockElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return this.context?.element as HTMLElement || null;
  }
}

export class AlignRightCommand extends BaseFormattingCommand {
  override id = 'alignRight';
  override name = 'Align Right';
  override description = 'Align text to the right';
  override icon = 'format-align-right';
  override shortcut = 'Ctrl+Shift+R';
  
  execute(): void {
    this.focusEditor();
    if (!this.execCommand('justifyRight')) {
      this.applyAlignment('right');
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('justifyRight') || this.getCurrentAlignment() === 'right';
  }
  
  private applyAlignment(alignment: string): void {
    const blockElement = this.getBlockElement();
    if (blockElement) {
      blockElement.style.textAlign = alignment;
    }
  }
  
  private getCurrentAlignment(): string {
    const blockElement = this.getBlockElement();
    if (!blockElement) return '';
    
    const computedStyle = window.getComputedStyle(blockElement);
    return computedStyle.textAlign;
  }
  
  private getBlockElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return this.context?.element as HTMLElement || null;
  }
}

export class AlignJustifyCommand extends BaseFormattingCommand {
  override id = 'alignJustify';
  override name = 'Justify';
  override description = 'Justify text alignment';
  override icon = 'format-align-justify';
  override shortcut = 'Ctrl+Shift+J';
  
  execute(): void {
    this.focusEditor();
    if (!this.execCommand('justifyFull')) {
      this.applyAlignment('justify');
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('justifyFull') || this.getCurrentAlignment() === 'justify';
  }
  
  private applyAlignment(alignment: string): void {
    const blockElement = this.getBlockElement();
    if (blockElement) {
      blockElement.style.textAlign = alignment;
    }
  }
  
  private getCurrentAlignment(): string {
    const blockElement = this.getBlockElement();
    if (!blockElement) return '';
    
    const computedStyle = window.getComputedStyle(blockElement);
    return computedStyle.textAlign;
  }
  
  private getBlockElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return this.context?.element as HTMLElement || null;
  }
}

/**
 * Indentation commands
 */
export class IndentCommand extends BaseFormattingCommand {
  override id = 'indent';
  override name = 'Increase Indent';
  override description = 'Increase paragraph indentation';
  override icon = 'format-indent-increase';
  override shortcut = 'Ctrl+]';
  
  execute(): void {
    this.focusEditor();
    if (!this.execCommand('indent')) {
      this.applyIndent(true);
    }
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  private applyIndent(increase: boolean): void {
    const blockElement = this.getBlockElement();
    if (!blockElement) return;
    
    const currentMargin = window.getComputedStyle(blockElement).marginLeft;
    const currentValue = parseInt(currentMargin) || 0;
    const indentSize = 40; // 40px indent
    
    const newValue = increase 
      ? currentValue + indentSize 
      : Math.max(0, currentValue - indentSize);
    
    blockElement.style.marginLeft = `${newValue}px`;
  }
  
  private getBlockElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return this.context?.element as HTMLElement || null;
  }
}

export class OutdentCommand extends BaseFormattingCommand {
  override id = 'outdent';
  override name = 'Decrease Indent';
  override description = 'Decrease paragraph indentation';
  override icon = 'format-indent-decrease';
  override shortcut = 'Ctrl+[';
  
  execute(): void {
    this.focusEditor();
    if (!this.execCommand('outdent')) {
      this.applyIndent(false);
    }
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  private applyIndent(increase: boolean): void {
    const blockElement = this.getBlockElement();
    if (!blockElement) return;
    
    const currentMargin = window.getComputedStyle(blockElement).marginLeft;
    const currentValue = parseInt(currentMargin) || 0;
    const indentSize = 40; // 40px indent
    
    const newValue = increase 
      ? currentValue + indentSize 
      : Math.max(0, currentValue - indentSize);
    
    blockElement.style.marginLeft = `${newValue}px`;
  }
  
  private getBlockElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return this.context?.element as HTMLElement || null;
  }
}

/**
 * Line height command
 */
export class LineHeightCommand extends BaseFormattingCommand {
  override id = 'lineHeight';
  override name = 'Line Height';
  override description = 'Change line height';
  override icon = 'format-line-spacing';
  
  private currentLineHeight: string = '';
  
  execute(lineHeight: string): void {
    if (!lineHeight) return;
    
    this.focusEditor();
    this.currentLineHeight = lineHeight;
    this.applyLineHeight(lineHeight);
  }
  
  protected isCommandActive(): boolean {
    const current = this.getCurrentLineHeight();
    return current === this.currentLineHeight;
  }
  
  private applyLineHeight(lineHeight: string): void {
    const blockElement = this.getBlockElement();
    if (blockElement) {
      blockElement.style.lineHeight = lineHeight;
    }
  }
  
  private getCurrentLineHeight(): string {
    const blockElement = this.getBlockElement();
    if (!blockElement) return '';
    
    const computedStyle = window.getComputedStyle(blockElement);
    return computedStyle.lineHeight;
  }
  
  private getBlockElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return this.context?.element as HTMLElement || null;
  }
  
  /**
   * Get available line height options
   */
  static getLineHeightOptions(): Array<{ label: string; value: string }> {
    return [
      { label: '1.0', value: '1.0' },
      { label: '1.15', value: '1.15' },
      { label: '1.2', value: '1.2' },
      { label: '1.5', value: '1.5' },
      { label: '2.0', value: '2.0' },
      { label: '2.5', value: '2.5' },
      { label: '3.0', value: '3.0' }
    ];
  }
}

/**
 * Paragraph spacing command
 */
export class ParagraphSpacingCommand extends BaseFormattingCommand {
  override id = 'paragraphSpacing';
  override name = 'Paragraph Spacing';
  override description = 'Change paragraph spacing';
  override icon = 'format-paragraph-spacing';
  
  execute(spacing: { before?: string; after?: string }): void {
    if (!spacing) return;
    
    this.focusEditor();
    this.applySpacing(spacing);
  }
  
  protected isCommandActive(): boolean {
    return false; // This command doesn't have an "active" state
  }
  
  private applySpacing(spacing: { before?: string; after?: string }): void {
    const blockElement = this.getBlockElement();
    if (!blockElement) return;
    
    if (spacing.before !== undefined) {
      blockElement.style.marginTop = spacing.before;
    }
    
    if (spacing.after !== undefined) {
      blockElement.style.marginBottom = spacing.after;
    }
  }
  
  private getBlockElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return this.context?.element as HTMLElement || null;
  }
  
  /**
   * Get current paragraph spacing
   */
  getCurrentSpacing(): { before: string; after: string } {
    const blockElement = this.getBlockElement();
    if (!blockElement) return { before: '0px', after: '0px' };
    
    const computedStyle = window.getComputedStyle(blockElement);
    return {
      before: computedStyle.marginTop,
      after: computedStyle.marginBottom
    };
  }
}