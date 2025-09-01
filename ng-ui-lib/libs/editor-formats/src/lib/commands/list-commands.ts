import { BaseFormattingCommand } from '../classes/base-command';

/**
 * Base class for list commands
 */
abstract class BaseListCommand extends BaseFormattingCommand {
  abstract listType: 'ol' | 'ul';
  
  protected isInList(): boolean {
    const listElement = this.getListElement();
    return listElement !== null && listElement.tagName.toLowerCase() === this.listType;
  }
  
  protected getListElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['ol', 'ul'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return null;
  }
  
  protected getListItemElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName.toLowerCase() === 'li') {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return null;
  }
  
  protected createList(): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const blockElement = this.getBlockElement();
    
    if (blockElement) {
      // Convert existing block to list item
      const listElement = document.createElement(this.listType);
      const listItem = document.createElement('li');
      
      // Move content to list item
      listItem.innerHTML = blockElement.innerHTML;
      listElement.appendChild(listItem);
      
      // Replace block element with list
      if (blockElement.parentNode) {
        blockElement.parentNode.replaceChild(listElement, blockElement);
      }
      
      // Restore selection
      const newRange = document.createRange();
      newRange.selectNodeContents(listItem);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Create new list
      const listElement = document.createElement(this.listType);
      const listItem = document.createElement('li');
      
      if (range.collapsed) {
        listItem.innerHTML = '&nbsp;';
      } else {
        const contents = range.extractContents();
        listItem.appendChild(contents);
      }
      
      listElement.appendChild(listItem);
      range.insertNode(listElement);
      
      // Position cursor in list item
      range.selectNodeContents(listItem);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  protected removeFromList(): void {
    const listItem = this.getListItemElement();
    const listElement = this.getListElement();
    
    if (!listItem || !listElement) return;
    
    // Create paragraph with list item content
    const paragraph = document.createElement('p');
    paragraph.innerHTML = listItem.innerHTML;
    
    // If this is the only item, replace the entire list
    if (listElement.children.length === 1) {
      if (listElement.parentNode) {
        listElement.parentNode.replaceChild(paragraph, listElement);
      }
    } else {
      // Insert paragraph before list and remove list item
      if (listElement.parentNode) {
        listElement.parentNode.insertBefore(paragraph, listElement);
      }
      listItem.remove();
      
      // If list is now empty, remove it
      if (listElement.children.length === 0) {
        listElement.remove();
      }
    }
    
    // Restore selection
    const selection = this.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(paragraph);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  
  protected convertListType(): void {
    const listElement = this.getListElement();
    if (!listElement) return;
    
    // Create new list of different type
    const newList = document.createElement(this.listType);
    
    // Move all list items
    while (listElement.firstChild) {
      newList.appendChild(listElement.firstChild);
    }
    
    // Replace old list with new one
    if (listElement.parentNode) {
      listElement.parentNode.replaceChild(newList, listElement);
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
    
    return null;
  }
}

/**
 * Ordered list command
 */
export class OrderedListCommand extends BaseListCommand {
  override id = 'orderedList';
  override name = 'Numbered List';
  override description = 'Create numbered list';
  override icon = 'format-list-numbered';
  override shortcut = 'Ctrl+Shift+7';
  
  listType: 'ol' = 'ol';
  
  execute(): void {
    this.focusEditor();
    
    if (!this.execCommand('insertOrderedList')) {
      this.executeManually();
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('insertOrderedList') || this.isInList();
  }
  
  private executeManually(): void {
    const listElement = this.getListElement();
    
    if (listElement) {
      if (listElement.tagName.toLowerCase() === 'ol') {
        // Remove from ordered list
        this.removeFromList();
      } else {
        // Convert unordered to ordered
        this.convertListType();
      }
    } else {
      // Create new ordered list
      this.createList();
    }
  }
}

/**
 * Unordered list command
 */
export class UnorderedListCommand extends BaseListCommand {
  override id = 'unorderedList';
  override name = 'Bulleted List';
  override description = 'Create bulleted list';
  override icon = 'format-list-bulleted';
  override shortcut = 'Ctrl+Shift+8';
  
  listType: 'ul' = 'ul';
  
  execute(): void {
    this.focusEditor();
    
    if (!this.execCommand('insertUnorderedList')) {
      this.executeManually();
    }
  }
  
  protected isCommandActive(): boolean {
    return this.queryCommandState('insertUnorderedList') || this.isInList();
  }
  
  private executeManually(): void {
    const listElement = this.getListElement();
    
    if (listElement) {
      if (listElement.tagName.toLowerCase() === 'ul') {
        // Remove from unordered list
        this.removeFromList();
      } else {
        // Convert ordered to unordered
        this.convertListType();
      }
    } else {
      // Create new unordered list
      this.createList();
    }
  }
}

/**
 * List indent command
 */
export class ListIndentCommand extends BaseFormattingCommand {
  override id = 'listIndent';
  override name = 'Increase List Indent';
  override description = 'Increase list item indentation';
  override icon = 'format-indent-increase';
  override shortcut = 'Tab';
  
  execute(): void {
    this.focusEditor();
    
    if (!this.execCommand('indent')) {
      this.indentListItem();
    }
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  protected isCommandEnabled(): boolean {
    const listItem = this.getListItemElement();
    return listItem !== null;
  }
  
  private indentListItem(): void {
    const listItem = this.getListItemElement();
    if (!listItem) return;
    
    const list = listItem.parentElement;
    if (!list || !['ol', 'ul'].includes(list.tagName.toLowerCase())) return;
    
    const previousItem = listItem.previousElementSibling as HTMLElement;
    if (!previousItem || previousItem.tagName.toLowerCase() !== 'li') return;
    
    // Check if previous item already has a nested list
    let nestedList = previousItem.querySelector(':scope > ol, :scope > ul') as HTMLElement;
    
    if (!nestedList) {
      // Create new nested list of the same type
      nestedList = document.createElement(list.tagName.toLowerCase());
      previousItem.appendChild(nestedList);
    }
    
    // Move current item to nested list
    nestedList.appendChild(listItem);
  }
  
  private getListItemElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName.toLowerCase() === 'li') {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return null;
  }
}

/**
 * List outdent command
 */
export class ListOutdentCommand extends BaseFormattingCommand {
  override id = 'listOutdent';
  override name = 'Decrease List Indent';
  override description = 'Decrease list item indentation';
  override icon = 'format-indent-decrease';
  override shortcut = 'Shift+Tab';
  
  execute(): void {
    this.focusEditor();
    
    if (!this.execCommand('outdent')) {
      this.outdentListItem();
    }
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  protected isCommandEnabled(): boolean {
    const listItem = this.getListItemElement();
    if (!listItem) return false;
    
    // Check if item is in a nested list
    const parentList = listItem.parentElement;
    if (!parentList || !['ol', 'ul'].includes(parentList.tagName.toLowerCase())) return false;
    
    const grandParent = parentList.parentElement;
    return grandParent !== null && grandParent.tagName.toLowerCase() === 'li';
  }
  
  private outdentListItem(): void {
    const listItem = this.getListItemElement();
    if (!listItem) return;
    
    const nestedList = listItem.parentElement;
    if (!nestedList || !['ol', 'ul'].includes(nestedList.tagName.toLowerCase())) return;
    
    const parentListItem = nestedList.parentElement;
    if (!parentListItem || parentListItem.tagName.toLowerCase() !== 'li') return;
    
    const parentList = parentListItem.parentElement;
    if (!parentList || !['ol', 'ul'].includes(parentList.tagName.toLowerCase())) return;
    
    // Find position after parent list item
    const nextSibling = parentListItem.nextSibling;
    
    // Move item to parent list
    if (nextSibling) {
      parentList.insertBefore(listItem, nextSibling);
    } else {
      parentList.appendChild(listItem);
    }
    
    // If nested list is now empty, remove it
    if (nestedList.children.length === 0) {
      nestedList.remove();
    }
  }
  
  private getListItemElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName.toLowerCase() === 'li') {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return null;
  }
}

/**
 * List style command for customizing list appearance
 */
export class ListStyleCommand extends BaseFormattingCommand {
  override id = 'listStyle';
  override name = 'List Style';
  override description = 'Change list style';
  override icon = 'format-list-style';
  
  execute(styleType: string): void {
    if (!styleType) return;
    
    this.focusEditor();
    this.applyListStyle(styleType);
  }
  
  protected isCommandActive(): boolean {
    return false; // This command doesn't have a single "active" state
  }
  
  protected isCommandEnabled(): boolean {
    const listElement = this.getListElement();
    return listElement !== null;
  }
  
  private applyListStyle(styleType: string): void {
    const listElement = this.getListElement();
    if (!listElement) return;
    
    listElement.style.listStyleType = styleType;
  }
  
  private getListElement(): HTMLElement | null {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    while (node && node !== this.context?.element) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (['ol', 'ul'].includes(tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }
    
    return null;
  }
  
  /**
   * Get available list styles
   */
  static getOrderedListStyles(): Array<{ label: string; value: string }> {
    return [
      { label: '1, 2, 3', value: 'decimal' },
      { label: '01, 02, 03', value: 'decimal-leading-zero' },
      { label: 'a, b, c', value: 'lower-alpha' },
      { label: 'A, B, C', value: 'upper-alpha' },
      { label: 'i, ii, iii', value: 'lower-roman' },
      { label: 'I, II, III', value: 'upper-roman' }
    ];
  }
  
  static getUnorderedListStyles(): Array<{ label: string; value: string }> {
    return [
      { label: '● Disc', value: 'disc' },
      { label: '○ Circle', value: 'circle' },
      { label: '■ Square', value: 'square' },
      { label: '– Dash', value: 'none' } // Custom dash can be added via CSS
    ];
  }
}