import { BaseFormattingCommand } from '../classes/base-command';

/**
 * Code block command
 */
export class CodeBlockCommand extends BaseFormattingCommand {
  override id = 'codeBlock';
  override name = 'Code Block';
  override description = 'Insert code block with syntax highlighting';
  override icon = 'code-block';
  override shortcut = 'Ctrl+Shift+C';
  
  execute(language?: string): void {
    this.focusEditor();
    this.insertCodeBlock(language || 'javascript');
  }
  
  protected isCommandActive(): boolean {
    return this.isInCodeBlock();
  }
  
  private insertCodeBlock(language: string): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    // Create code block structure
    const codeBlock = document.createElement('pre');
    const codeElement = document.createElement('code');
    
    codeBlock.className = 'code-block';
    codeElement.className = `language-${language}`;
    
    if (range.collapsed) {
      codeElement.textContent = '// Your code here';
    } else {
      const selectedText = range.toString();
      codeElement.textContent = selectedText;
      range.deleteContents();
    }
    
    codeBlock.appendChild(codeElement);
    range.insertNode(codeBlock);
    
    // Position cursor inside code block
    const newRange = document.createRange();
    newRange.selectNodeContents(codeElement);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
  
  private isInCodeBlock(): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName.toLowerCase() === 'pre' && 
            element.querySelector('code')) {
          return true;
        }
      }
      node = node.parentNode;
    }
    
    return false;
  }
  
  /**
   * Get supported programming languages
   */
  static getSupportedLanguages(): Array<{ label: string; value: string }> {
    return [
      { label: 'JavaScript', value: 'javascript' },
      { label: 'TypeScript', value: 'typescript' },
      { label: 'HTML', value: 'html' },
      { label: 'CSS', value: 'css' },
      { label: 'Python', value: 'python' },
      { label: 'Java', value: 'java' },
      { label: 'C#', value: 'csharp' },
      { label: 'C++', value: 'cpp' },
      { label: 'PHP', value: 'php' },
      { label: 'Ruby', value: 'ruby' },
      { label: 'Go', value: 'go' },
      { label: 'Rust', value: 'rust' },
      { label: 'SQL', value: 'sql' },
      { label: 'JSON', value: 'json' },
      { label: 'XML', value: 'xml' },
      { label: 'Bash', value: 'bash' },
      { label: 'Plain Text', value: 'text' }
    ];
  }
}

/**
 * Inline code command
 */
export class InlineCodeCommand extends BaseFormattingCommand {
  override id = 'inlineCode';
  override name = 'Inline Code';
  override description = 'Format as inline code';
  override icon = 'code';
  override shortcut = 'Ctrl+`';
  
  execute(): void {
    this.focusEditor();
    this.toggleInlineCode();
  }
  
  protected isCommandActive(): boolean {
    return this.isInInlineCode();
  }
  
  private toggleInlineCode(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    if (this.isCommandActive()) {
      // Remove inline code formatting
      this.removeInlineCode(range);
    } else {
      // Add inline code formatting
      this.addInlineCode(range);
    }
  }
  
  private addInlineCode(range: Range): void {
    const code = document.createElement('code');
    code.className = 'inline-code';
    
    if (range.collapsed) {
      code.textContent = 'code';
      range.insertNode(code);
      range.selectNodeContents(code);
    } else {
      const selectedText = range.toString();
      code.textContent = selectedText;
      range.deleteContents();
      range.insertNode(code);
      range.selectNodeContents(code);
    }
    
    const selection = this.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  private removeInlineCode(range: Range): void {
    const codeElement = this.findCodeElement(range.commonAncestorContainer);
    if (!codeElement) return;
    
    // Replace code element with its text content
    const textNode = document.createTextNode(codeElement.textContent || '');
    if (codeElement.parentNode) {
      codeElement.parentNode.replaceChild(textNode, codeElement);
    }
    
    // Update selection
    range.selectNode(textNode);
    const selection = this.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  private isInInlineCode(): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    return this.findCodeElement(range.commonAncestorContainer) !== null;
  }
  
  private findCodeElement(node: Node): HTMLElement | null {
    let currentNode: Node | null = node;
    
    while (currentNode && currentNode !== this.context?.element) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        if (element.tagName.toLowerCase() === 'code' && 
            !element.closest('pre')) {
          return element;
        }
      }
      currentNode = currentNode.parentNode;
    }
    
    return null;
  }
}

/**
 * Horizontal rule command
 */
export class HorizontalRuleCommand extends BaseFormattingCommand {
  override id = 'horizontalRule';
  override name = 'Horizontal Rule';
  override description = 'Insert horizontal rule';
  override icon = 'horizontal-rule';
  override shortcut = 'Ctrl+Shift+-';
  
  execute(): void {
    this.focusEditor();
    this.insertHorizontalRule();
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  private insertHorizontalRule(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    // Ensure we're not inside an inline element
    this.ensureBlockLevel(range);
    
    const hr = document.createElement('hr');
    hr.className = 'editor-hr';
    
    // Insert at the end of current block or create new paragraph
    const blockElement = this.getBlockElement(range);
    if (blockElement) {
      // Insert after current block
      const nextElement = blockElement.nextSibling;
      if (blockElement.parentNode) {
        if (nextElement) {
          blockElement.parentNode.insertBefore(hr, nextElement);
        } else {
          blockElement.parentNode.appendChild(hr);
        }
        
        // Add empty paragraph after HR for continued editing
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '&nbsp;';
        
        if (hr.nextSibling) {
          blockElement.parentNode.insertBefore(paragraph, hr.nextSibling);
        } else {
          blockElement.parentNode.appendChild(paragraph);
        }
        
        // Position cursor in new paragraph
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      // Insert at current position
      range.insertNode(hr);
      
      // Add paragraph after HR
      const paragraph = document.createElement('p');
      paragraph.innerHTML = '&nbsp;';
      
      if (hr.parentNode) {
        if (hr.nextSibling) {
          hr.parentNode.insertBefore(paragraph, hr.nextSibling);
        } else {
          hr.parentNode.appendChild(paragraph);
        }
        
        // Position cursor in new paragraph
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }
  
  private ensureBlockLevel(range: Range): void {
    // If selection is inside an inline element, move to block level
    let node = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'li'].includes(tagName)) {
          return; // Already at block level
        }
      }
      node = node.parentNode;
    }
  }
  
  private getBlockElement(range: Range): HTMLElement | null {
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'li'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return null;
  }
}

/**
 * Page break command
 */
export class PageBreakCommand extends BaseFormattingCommand {
  override id = 'pageBreak';
  override name = 'Page Break';
  override description = 'Insert page break for printing';
  override icon = 'page-break';
  
  execute(): void {
    this.focusEditor();
    this.insertPageBreak();
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  private insertPageBreak(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    // Create page break element
    const pageBreak = document.createElement('div');
    pageBreak.className = 'page-break';
    pageBreak.style.pageBreakAfter = 'always';
    pageBreak.style.breakAfter = 'page'; // CSS3 standard
    pageBreak.style.height = '1px';
    pageBreak.style.backgroundColor = '#ccc';
    pageBreak.style.margin = '20px 0';
    pageBreak.setAttribute('contenteditable', 'false');
    
    // Add visual indicator
    pageBreak.innerHTML = '<span style="font-size: 12px; color: #666; display: block; text-align: center; padding: 5px;">Page Break</span>';
    
    const blockElement = this.getBlockElement(range);
    if (blockElement) {
      // Insert after current block
      if (blockElement.parentNode) {
        const nextElement = blockElement.nextSibling;
        if (nextElement) {
          blockElement.parentNode.insertBefore(pageBreak, nextElement);
        } else {
          blockElement.parentNode.appendChild(pageBreak);
        }
        
        // Add empty paragraph after page break
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '&nbsp;';
        
        if (pageBreak.nextSibling) {
          blockElement.parentNode.insertBefore(paragraph, pageBreak.nextSibling);
        } else {
          blockElement.parentNode.appendChild(paragraph);
        }
        
        // Position cursor in new paragraph
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      // Insert at current position
      range.insertNode(pageBreak);
      
      // Add paragraph after page break
      const paragraph = document.createElement('p');
      paragraph.innerHTML = '&nbsp;';
      
      if (pageBreak.parentNode) {
        if (pageBreak.nextSibling) {
          pageBreak.parentNode.insertBefore(paragraph, pageBreak.nextSibling);
        } else {
          pageBreak.parentNode.appendChild(paragraph);
        }
        
        // Position cursor in new paragraph
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }
  
  private getBlockElement(range: Range): HTMLElement | null {
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'li'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return null;
  }
}

/**
 * Insert link command
 */
export class InsertLinkCommand extends BaseFormattingCommand {
  override id = 'insertLink';
  override name = 'Insert Link';
  override description = 'Insert or edit hyperlink';
  override icon = 'link';
  override shortcut = 'Ctrl+K';
  
  execute(url?: string, text?: string): void {
    this.focusEditor();
    
    if (!url) {
      // If no URL provided, prompt for it (in a real implementation, this would show a dialog)
      url = prompt('Enter URL:') || '';
      if (!url) return;
    }
    
    this.insertLink(url, text);
  }
  
  protected isCommandActive(): boolean {
    return this.isInLink();
  }
  
  private insertLink(url: string, linkText?: string): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    if (this.isCommandActive()) {
      // Update existing link
      const linkElement = this.findLinkElement(range.commonAncestorContainer);
      if (linkElement) {
        linkElement.setAttribute('href', url);
        if (linkText) {
          linkElement.textContent = linkText;
        }
      }
    } else {
      // Create new link
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      
      if (range.collapsed) {
        // No selection, use provided text or URL as link text
        link.textContent = linkText || url;
        range.insertNode(link);
        range.selectNodeContents(link);
      } else {
        // Wrap selection in link
        const selectedText = range.toString();
        link.textContent = linkText || selectedText;
        range.deleteContents();
        range.insertNode(link);
        range.selectNodeContents(link);
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  private isInLink(): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    return this.findLinkElement(range.commonAncestorContainer) !== null;
  }
  
  private findLinkElement(node: Node): HTMLAnchorElement | null {
    let currentNode: Node | null = node;
    
    while (currentNode && currentNode !== this.context?.element) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        if (element.tagName.toLowerCase() === 'a') {
          return element as HTMLAnchorElement;
        }
      }
      currentNode = currentNode.parentNode;
    }
    
    return null;
  }
}

/**
 * Remove link command
 */
export class RemoveLinkCommand extends BaseFormattingCommand {
  override id = 'removeLink';
  override name = 'Remove Link';
  override description = 'Remove hyperlink formatting';
  override icon = 'link-off';
  
  execute(): void {
    this.focusEditor();
    
    if (!this.execCommand('unlink')) {
      this.removeLinkManually();
    }
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  protected isCommandEnabled(): boolean {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    return this.findLinkElement(range.commonAncestorContainer) !== null;
  }
  
  private removeLinkManually(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const linkElement = this.findLinkElement(range.commonAncestorContainer);
    
    if (linkElement) {
      // Replace link with its text content
      const textNode = document.createTextNode(linkElement.textContent || '');
      if (linkElement.parentNode) {
        linkElement.parentNode.replaceChild(textNode, linkElement);
      }
      
      // Update selection
      range.selectNode(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  private findLinkElement(node: Node): HTMLAnchorElement | null {
    let currentNode: Node | null = node;
    
    while (currentNode && currentNode !== this.context?.element) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        if (element.tagName.toLowerCase() === 'a') {
          return element as HTMLAnchorElement;
        }
      }
      currentNode = currentNode.parentNode;
    }
    
    return null;
  }
}