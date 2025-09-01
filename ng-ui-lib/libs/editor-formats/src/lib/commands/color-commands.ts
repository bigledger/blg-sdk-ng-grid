import { BaseFormattingCommand } from '../classes/base-command';

/**
 * Text color command
 */
export class TextColorCommand extends BaseFormattingCommand {
  override id = 'textColor';
  override name = 'Text Color';
  override description = 'Change text color';
  override icon = 'format-color-text';
  
  private currentColor: string = '';
  
  execute(color: string): void {
    if (!color) return;
    
    this.focusEditor();
    this.currentColor = color;
    
    // Try execCommand first
    if (!this.execCommand('foreColor', color)) {
      // Fallback implementation
      this.applyTextColor(color);
    }
  }
  
  protected isCommandActive(): boolean {
    const currentColor = this.getCurrentTextColor();
    return this.colorsMatch(currentColor, this.currentColor);
  }
  
  /**
   * Get the current text color at the selection
   */
  getCurrentTextColor(): string {
    const queryValue = this.queryCommandValue('foreColor');
    if (queryValue) return queryValue;
    
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return '';
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE 
      ? container as Element 
      : container.parentElement;
    
    if (!element) return '';
    
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue('color');
  }
  
  private applyTextColor(color: string): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = color;
    
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
  
  private colorsMatch(color1: string, color2: string): boolean {
    if (color1 === color2) return true;
    
    // Convert colors to RGB for comparison
    const rgb1 = this.toRgb(color1);
    const rgb2 = this.toRgb(color2);
    
    return rgb1 === rgb2;
  }
  
  private toRgb(color: string): string {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    return computedColor;
  }
  
  /**
   * Get default color palette
   */
  static getColorPalette(): Array<{ name: string; value: string }> {
    return [
      { name: 'Black', value: '#000000' },
      { name: 'Dark Gray', value: '#666666' },
      { name: 'Gray', value: '#999999' },
      { name: 'Light Gray', value: '#cccccc' },
      { name: 'White', value: '#ffffff' },
      { name: 'Red', value: '#ff0000' },
      { name: 'Orange', value: '#ff9900' },
      { name: 'Yellow', value: '#ffff00' },
      { name: 'Green', value: '#00ff00' },
      { name: 'Blue', value: '#0000ff' },
      { name: 'Purple', value: '#9900ff' },
      { name: 'Pink', value: '#ff00ff' },
      { name: 'Dark Red', value: '#990000' },
      { name: 'Dark Orange', value: '#cc6600' },
      { name: 'Dark Yellow', value: '#cccc00' },
      { name: 'Dark Green', value: '#009900' },
      { name: 'Dark Blue', value: '#000099' },
      { name: 'Dark Purple', value: '#660099' }
    ];
  }
}

/**
 * Background color command
 */
export class BackgroundColorCommand extends BaseFormattingCommand {
  override id = 'backgroundColor';
  override name = 'Background Color';
  override description = 'Change background color';
  override icon = 'format-color-fill';
  
  private currentColor: string = '';
  
  execute(color: string): void {
    if (!color) return;
    
    this.focusEditor();
    this.currentColor = color;
    
    // Try execCommand first
    if (!this.execCommand('backColor', color) && !this.execCommand('hiliteColor', color)) {
      // Fallback implementation
      this.applyBackgroundColor(color);
    }
  }
  
  protected isCommandActive(): boolean {
    const currentColor = this.getCurrentBackgroundColor();
    return this.colorsMatch(currentColor, this.currentColor);
  }
  
  /**
   * Get the current background color at the selection
   */
  getCurrentBackgroundColor(): string {
    const queryValue = this.queryCommandValue('backColor') || this.queryCommandValue('hiliteColor');
    if (queryValue) return queryValue;
    
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return '';
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE 
      ? container as Element 
      : container.parentElement;
    
    if (!element) return '';
    
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue('background-color');
  }
  
  private applyBackgroundColor(color: string): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    
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
  
  private colorsMatch(color1: string, color2: string): boolean {
    if (color1 === color2) return true;
    
    // Convert colors to RGB for comparison
    const rgb1 = this.toRgb(color1);
    const rgb2 = this.toRgb(color2);
    
    return rgb1 === rgb2;
  }
  
  private toRgb(color: string): string {
    const div = document.createElement('div');
    div.style.backgroundColor = color;
    document.body.appendChild(div);
    const computedColor = window.getComputedStyle(div).backgroundColor;
    document.body.removeChild(div);
    return computedColor;
  }
  
  /**
   * Get default color palette
   */
  static getColorPalette(): Array<{ name: string; value: string }> {
    return TextColorCommand.getColorPalette();
  }
}

/**
 * Remove color formatting command
 */
export class RemoveColorCommand extends BaseFormattingCommand {
  override id = 'removeColor';
  override name = 'Remove Color';
  override description = 'Remove text and background color formatting';
  override icon = 'format-color-reset';
  
  execute(): void {
    this.focusEditor();
    
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    if (range.collapsed) {
      // For collapsed selection, affect parent elements
      this.removeColorFromParents(range.startContainer);
    } else {
      // For selection, remove color styles
      this.removeColorFromSelection(range);
    }
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  private removeColorFromParents(node: Node): void {
    let currentNode: Node | null = node;
    
    while (currentNode && currentNode !== this.context?.element) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        if (element.style.color) {
          element.style.color = '';
        }
        if (element.style.backgroundColor) {
          element.style.backgroundColor = '';
        }
        
        // Remove style attribute if empty
        if (!element.getAttribute('style')?.trim()) {
          element.removeAttribute('style');
        }
      }
      
      currentNode = currentNode.parentNode;
    }
  }
  
  private removeColorFromSelection(range: Range): void {
    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: Node) => {
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );
    
    const elements: HTMLElement[] = [];
    let node;
    
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        elements.push(node as HTMLElement);
      }
    }
    
    elements.forEach(element => {
      if (element.style.color) {
        element.style.color = '';
      }
      if (element.style.backgroundColor) {
        element.style.backgroundColor = '';
      }
      
      // Remove style attribute if empty
      if (!element.getAttribute('style')?.trim()) {
        element.removeAttribute('style');
      }
    });
  }
}