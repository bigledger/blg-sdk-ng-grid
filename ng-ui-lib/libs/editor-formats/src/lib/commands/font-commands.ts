import { BaseFormattingCommand } from '../classes/base-command';

/**
 * Font family command
 */
export class FontFamilyCommand extends BaseFormattingCommand {
  override id = 'fontFamily';
  override name = 'Font Family';
  override description = 'Change font family';
  override icon = 'format-font';
  
  private currentFontFamily: string = '';
  
  execute(fontFamily: string): void {
    if (!fontFamily) return;
    
    this.focusEditor();
    this.currentFontFamily = fontFamily;
    
    // Try execCommand first
    if (!this.execCommand('fontName', fontFamily)) {
      // Fallback implementation
      this.applyFontFamily(fontFamily);
    }
  }
  
  protected isCommandActive(): boolean {
    const currentFont = this.getCurrentFontFamily();
    return currentFont === this.currentFontFamily;
  }
  
  /**
   * Get the current font family at the selection
   */
  getCurrentFontFamily(): string {
    const queryValue = this.queryCommandValue('fontName');
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
    return computedStyle.getPropertyValue('font-family');
  }
  
  private applyFontFamily(fontFamily: string): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;
    
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
  
  /**
   * Get available font families
   */
  static getAvailableFonts(): string[] {
    return [
      'Arial, sans-serif',
      'Arial Black, sans-serif',
      'Comic Sans MS, cursive',
      'Courier New, monospace',
      'Georgia, serif',
      'Helvetica, sans-serif',
      'Impact, sans-serif',
      'Lucida Console, monospace',
      'Palatino, serif',
      'Times New Roman, serif',
      'Trebuchet MS, sans-serif',
      'Verdana, sans-serif'
    ];
  }
}

/**
 * Font size command
 */
export class FontSizeCommand extends BaseFormattingCommand {
  override id = 'fontSize';
  override name = 'Font Size';
  override description = 'Change font size';
  override icon = 'format-size';
  
  private currentFontSize: string = '';
  
  execute(fontSize: string): void {
    if (!fontSize) return;
    
    this.focusEditor();
    this.currentFontSize = fontSize;
    
    // Try execCommand first (note: execCommand uses 1-7 scale)
    const sizeNumber = this.parseToExecCommandSize(fontSize);
    if (sizeNumber && this.execCommand('fontSize', sizeNumber.toString())) {
      return;
    }
    
    // Fallback implementation
    this.applyFontSize(fontSize);
  }
  
  protected isCommandActive(): boolean {
    const currentSize = this.getCurrentFontSize();
    return currentSize === this.currentFontSize;
  }
  
  /**
   * Get the current font size at the selection
   */
  getCurrentFontSize(): string {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return '';
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE 
      ? container as Element 
      : container.parentElement;
    
    if (!element) return '';
    
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue('font-size');
  }
  
  private applyFontSize(fontSize: string): void {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = fontSize;
    
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
  
  private parseToExecCommandSize(fontSize: string): number | null {
    // Convert CSS font-size to execCommand size (1-7 scale)
    const sizeMap: { [key: string]: number } = {
      '10px': 1,
      '13px': 2,
      '16px': 3,
      '18px': 4,
      '24px': 5,
      '32px': 6,
      '48px': 7,
      'xx-small': 1,
      'x-small': 2,
      'small': 3,
      'medium': 4,
      'large': 5,
      'x-large': 6,
      'xx-large': 7
    };
    
    return sizeMap[fontSize] || null;
  }
  
  /**
   * Get available font sizes
   */
  static getAvailableSizes(): Array<{ label: string; value: string }> {
    return [
      { label: '8px', value: '8px' },
      { label: '9px', value: '9px' },
      { label: '10px', value: '10px' },
      { label: '11px', value: '11px' },
      { label: '12px', value: '12px' },
      { label: '14px', value: '14px' },
      { label: '16px', value: '16px' },
      { label: '18px', value: '18px' },
      { label: '20px', value: '20px' },
      { label: '22px', value: '22px' },
      { label: '24px', value: '24px' },
      { label: '26px', value: '26px' },
      { label: '28px', value: '28px' },
      { label: '36px', value: '36px' },
      { label: '48px', value: '48px' },
      { label: '72px', value: '72px' }
    ];
  }
}

/**
 * Increase font size command
 */
export class IncreaseFontSizeCommand extends BaseFormattingCommand {
  override id = 'increaseFontSize';
  override name = 'Increase Font Size';
  override description = 'Increase font size';
  override icon = 'format-font-size-increase';
  override shortcut = 'Ctrl+Shift+>';
  
  execute(): void {
    this.focusEditor();
    
    const currentSize = this.getCurrentFontSize();
    const newSize = this.calculateIncreasedSize(currentSize);
    
    if (newSize) {
      const fontSizeCommand = new FontSizeCommand();
      fontSizeCommand.setContext(this.context!);
      fontSizeCommand.execute(newSize);
    }
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  private getCurrentFontSize(): string {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return '16px';
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE 
      ? container as Element 
      : container.parentElement;
    
    if (!element) return '16px';
    
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue('font-size');
  }
  
  private calculateIncreasedSize(currentSize: string): string | null {
    const sizes = FontSizeCommand.getAvailableSizes();
    const currentIndex = sizes.findIndex(s => s.value === currentSize);
    
    if (currentIndex >= 0 && currentIndex < sizes.length - 1) {
      return sizes[currentIndex + 1].value;
    }
    
    // If not in predefined list, try to increase by 2px
    const match = currentSize.match(/^(\d+)px$/);
    if (match) {
      const value = parseInt(match[1]) + 2;
      return `${value}px`;
    }
    
    return null;
  }
}

/**
 * Decrease font size command
 */
export class DecreaseFontSizeCommand extends BaseFormattingCommand {
  override id = 'decreaseFontSize';
  override name = 'Decrease Font Size';
  override description = 'Decrease font size';
  override icon = 'format-font-size-decrease';
  override shortcut = 'Ctrl+Shift+<';
  
  execute(): void {
    this.focusEditor();
    
    const currentSize = this.getCurrentFontSize();
    const newSize = this.calculateDecreasedSize(currentSize);
    
    if (newSize) {
      const fontSizeCommand = new FontSizeCommand();
      fontSizeCommand.setContext(this.context!);
      fontSizeCommand.execute(newSize);
    }
  }
  
  protected isCommandActive(): boolean {
    return false; // This command is never "active"
  }
  
  private getCurrentFontSize(): string {
    const selection = this.getSelection();
    if (!selection || selection.rangeCount === 0) return '16px';
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE 
      ? container as Element 
      : container.parentElement;
    
    if (!element) return '16px';
    
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue('font-size');
  }
  
  private calculateDecreasedSize(currentSize: string): string | null {
    const sizes = FontSizeCommand.getAvailableSizes();
    const currentIndex = sizes.findIndex(s => s.value === currentSize);
    
    if (currentIndex > 0) {
      return sizes[currentIndex - 1].value;
    }
    
    // If not in predefined list, try to decrease by 2px
    const match = currentSize.match(/^(\d+)px$/);
    if (match) {
      const value = Math.max(8, parseInt(match[1]) - 2);
      return `${value}px`;
    }
    
    return null;
  }
}