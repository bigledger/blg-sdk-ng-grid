import { BaseFormattingCommand } from '../classes/base-command';

/**
 * Base class for heading commands
 */
abstract class BaseHeadingCommand extends BaseFormattingCommand {
  abstract headingLevel: number;
  abstract tagName: string;
  
  execute(): void {
    this.focusEditor();
    
    const formatBlockCommand = `formatBlock`;
    const tagName = this.tagName.toLowerCase();
    
    if (!this.execCommand(formatBlockCommand, tagName)) {
      // Fallback implementation
      this.applyHeading();
    }
  }
  
  protected isCommandActive(): boolean {
    const currentTag = this.getCurrentBlockTag();
    return currentTag.toLowerCase() === this.tagName.toLowerCase();
  }
  
  private applyHeading(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const blockElement = this.getBlockElement();
    
    if (blockElement) {
      // Replace existing block element
      const newElement = document.createElement(this.tagName.toLowerCase());
      newElement.innerHTML = blockElement.innerHTML;
      
      // Copy relevant attributes (but not formatting styles)
      const allowedAttributes = ['id', 'class', 'data-*'];
      Array.from(blockElement.attributes).forEach(attr => {
        if (allowedAttributes.some(allowed => 
          allowed === attr.name || 
          (allowed.endsWith('*') && attr.name.startsWith(allowed.slice(0, -1)))
        )) {
          newElement.setAttribute(attr.name, attr.value);
        }
      });
      
      if (blockElement.parentNode) {
        blockElement.parentNode.replaceChild(newElement, blockElement);
      }
      
      // Restore selection
      const newRange = document.createRange();
      newRange.selectNodeContents(newElement);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Create new heading element
      const headingElement = document.createElement(this.tagName.toLowerCase());
      
      if (range.collapsed) {
        // Insert empty heading
        headingElement.innerHTML = '&nbsp;';
        range.insertNode(headingElement);
        range.selectNodeContents(headingElement);
      } else {
        // Wrap selection in heading
        const contents = range.extractContents();
        headingElement.appendChild(contents);
        range.insertNode(headingElement);
        range.selectNodeContents(headingElement);
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  private getCurrentBlockTag(): string {
    const blockElement = this.getBlockElement();
    return blockElement?.tagName || 'DIV';
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
    
    return null;
  }
}

/**
 * Heading 1 command
 */
export class Heading1Command extends BaseHeadingCommand {
  override id = 'heading1';
  override name = 'Heading 1';
  override description = 'Format as heading 1';
  override icon = 'format-header-1';
  override shortcut = 'Ctrl+Alt+1';
  
  headingLevel = 1;
  tagName = 'H1';
}

/**
 * Heading 2 command
 */
export class Heading2Command extends BaseHeadingCommand {
  override id = 'heading2';
  override name = 'Heading 2';
  override description = 'Format as heading 2';
  override icon = 'format-header-2';
  override shortcut = 'Ctrl+Alt+2';
  
  headingLevel = 2;
  tagName = 'H2';
}

/**
 * Heading 3 command
 */
export class Heading3Command extends BaseHeadingCommand {
  override id = 'heading3';
  override name = 'Heading 3';
  override description = 'Format as heading 3';
  override icon = 'format-header-3';
  override shortcut = 'Ctrl+Alt+3';
  
  headingLevel = 3;
  tagName = 'H3';
}

/**
 * Heading 4 command
 */
export class Heading4Command extends BaseHeadingCommand {
  override id = 'heading4';
  override name = 'Heading 4';
  override description = 'Format as heading 4';
  override icon = 'format-header-4';
  override shortcut = 'Ctrl+Alt+4';
  
  headingLevel = 4;
  tagName = 'H4';
}

/**
 * Heading 5 command
 */
export class Heading5Command extends BaseHeadingCommand {
  override id = 'heading5';
  override name = 'Heading 5';
  override description = 'Format as heading 5';
  override icon = 'format-header-5';
  override shortcut = 'Ctrl+Alt+5';
  
  headingLevel = 5;
  tagName = 'H5';
}

/**
 * Heading 6 command
 */
export class Heading6Command extends BaseHeadingCommand {
  override id = 'heading6';
  override name = 'Heading 6';
  override description = 'Format as heading 6';
  override icon = 'format-header-6';
  override shortcut = 'Ctrl+Alt+6';
  
  headingLevel = 6;
  tagName = 'H6';
}

/**
 * Normal paragraph command
 */
export class ParagraphCommand extends BaseFormattingCommand {
  override id = 'paragraph';
  override name = 'Normal Text';
  override description = 'Format as normal paragraph';
  override icon = 'format-paragraph';
  override shortcut = 'Ctrl+Alt+0';
  
  execute(): void {
    this.focusEditor();
    
    if (!this.execCommand('formatBlock', 'p')) {
      this.applyParagraph();
    }
  }
  
  protected isCommandActive(): boolean {
    const currentTag = this.getCurrentBlockTag();
    return currentTag.toLowerCase() === 'p' || currentTag.toLowerCase() === 'div';
  }
  
  private applyParagraph(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const blockElement = this.getBlockElement();
    
    if (blockElement && blockElement.tagName.toLowerCase() !== 'p') {
      // Replace existing block element with paragraph
      const paragraph = document.createElement('p');
      paragraph.innerHTML = blockElement.innerHTML;
      
      // Copy relevant attributes
      const allowedAttributes = ['id', 'class', 'data-*'];
      Array.from(blockElement.attributes).forEach(attr => {
        if (allowedAttributes.some(allowed => 
          allowed === attr.name || 
          (allowed.endsWith('*') && attr.name.startsWith(allowed.slice(0, -1)))
        )) {
          paragraph.setAttribute(attr.name, attr.value);
        }
      });
      
      if (blockElement.parentNode) {
        blockElement.parentNode.replaceChild(paragraph, blockElement);
      }
      
      // Restore selection
      const newRange = document.createRange();
      newRange.selectNodeContents(paragraph);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }
  
  private getCurrentBlockTag(): string {
    const blockElement = this.getBlockElement();
    return blockElement?.tagName || 'DIV';
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
    
    return null;
  }
}

/**
 * Blockquote command
 */
export class BlockquoteCommand extends BaseFormattingCommand {
  override id = 'blockquote';
  override name = 'Blockquote';
  override description = 'Format as blockquote';
  override icon = 'format-quote';
  override shortcut = 'Ctrl+Shift+9';
  
  execute(): void {
    this.focusEditor();
    
    if (!this.execCommand('formatBlock', 'blockquote')) {
      this.applyBlockquote();
    }
  }
  
  protected isCommandActive(): boolean {
    const currentTag = this.getCurrentBlockTag();
    return currentTag.toLowerCase() === 'blockquote';
  }
  
  private applyBlockquote(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const blockElement = this.getBlockElement();
    
    if (blockElement) {
      if (blockElement.tagName.toLowerCase() === 'blockquote') {
        // Convert blockquote to paragraph
        const paragraph = document.createElement('p');
        paragraph.innerHTML = blockElement.innerHTML;
        
        if (blockElement.parentNode) {
          blockElement.parentNode.replaceChild(paragraph, blockElement);
        }
        
        // Restore selection
        const newRange = document.createRange();
        newRange.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Convert to blockquote
        const blockquote = document.createElement('blockquote');
        blockquote.innerHTML = blockElement.innerHTML;
        
        if (blockElement.parentNode) {
          blockElement.parentNode.replaceChild(blockquote, blockElement);
        }
        
        // Restore selection
        const newRange = document.createRange();
        newRange.selectNodeContents(blockquote);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      // Create new blockquote
      const blockquote = document.createElement('blockquote');
      
      if (range.collapsed) {
        blockquote.innerHTML = '&nbsp;';
        range.insertNode(blockquote);
        range.selectNodeContents(blockquote);
      } else {
        const contents = range.extractContents();
        blockquote.appendChild(contents);
        range.insertNode(blockquote);
        range.selectNodeContents(blockquote);
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  private getCurrentBlockTag(): string {
    const blockElement = this.getBlockElement();
    return blockElement?.tagName || 'DIV';
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
    
    return null;
  }
}

/**
 * Preformatted text command
 */
export class PreformattedCommand extends BaseFormattingCommand {
  override id = 'preformatted';
  override name = 'Preformatted Text';
  override description = 'Format as preformatted text';
  override icon = 'format-preformatted';
  
  execute(): void {
    this.focusEditor();
    
    if (!this.execCommand('formatBlock', 'pre')) {
      this.applyPreformatted();
    }
  }
  
  protected isCommandActive(): boolean {
    const currentTag = this.getCurrentBlockTag();
    return currentTag.toLowerCase() === 'pre';
  }
  
  private applyPreformatted(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const blockElement = this.getBlockElement();
    
    if (blockElement) {
      if (blockElement.tagName.toLowerCase() === 'pre') {
        // Convert pre to paragraph
        const paragraph = document.createElement('p');
        paragraph.innerHTML = blockElement.innerHTML;
        
        if (blockElement.parentNode) {
          blockElement.parentNode.replaceChild(paragraph, blockElement);
        }
        
        // Restore selection
        const newRange = document.createRange();
        newRange.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Convert to pre
        const pre = document.createElement('pre');
        pre.innerHTML = blockElement.innerHTML;
        
        if (blockElement.parentNode) {
          blockElement.parentNode.replaceChild(pre, blockElement);
        }
        
        // Restore selection
        const newRange = document.createRange();
        newRange.selectNodeContents(pre);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      // Create new pre element
      const pre = document.createElement('pre');
      
      if (range.collapsed) {
        pre.innerHTML = '&nbsp;';
        range.insertNode(pre);
        range.selectNodeContents(pre);
      } else {
        const contents = range.extractContents();
        pre.appendChild(contents);
        range.insertNode(pre);
        range.selectNodeContents(pre);
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  private getCurrentBlockTag(): string {
    const blockElement = this.getBlockElement();
    return blockElement?.tagName || 'DIV';
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
    
    return null;
  }
}