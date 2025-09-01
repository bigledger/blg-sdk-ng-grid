import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { EditorStateService } from './editor-state.service';

/**
 * Print configuration options
 */
export interface PrintConfig {
  // Page settings
  pageSize?: 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  
  // Content options
  includeImages?: boolean;
  includeColors?: boolean;
  includeBackgrounds?: boolean;
  includeHeaders?: boolean;
  includeFooters?: boolean;
  pageNumbers?: boolean;
  
  // Print quality
  quality?: 'draft' | 'normal' | 'high';
  colorMode?: 'color' | 'grayscale' | 'black-and-white';
  
  // Layout options
  fontSize?: string;
  fontFamily?: string;
  lineHeight?: string;
  
  // Selection options
  printSelection?: boolean;
  selectionRange?: {
    start: number;
    end: number;
  };
  
  // Advanced options
  scaleToFit?: boolean;
  shrinkToFit?: boolean;
  customCss?: string;
  watermark?: {
    text: string;
    opacity: number;
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
}

/**
 * Print preview state
 */
export interface PrintPreviewState {
  isVisible: boolean;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  content: string;
  config: PrintConfig;
}

/**
 * Print Service
 * Provides comprehensive printing capabilities with preview and advanced options
 */
@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private editorStateService = inject(EditorStateService);
  
  // Print state
  private _printPreviewState = signal<PrintPreviewState>({
    isVisible: false,
    currentPage: 1,
    totalPages: 1,
    zoomLevel: 100,
    content: '',
    config: {}
  });
  
  readonly printPreviewState = this._printPreviewState.asReadonly();
  readonly isPreviewVisible = computed(() => this._printPreviewState().isVisible);
  
  // Default print configuration
  private readonly defaultConfig: PrintConfig = {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: '1in',
      right: '1in',
      bottom: '1in',
      left: '1in'
    },
    includeImages: true,
    includeColors: true,
    includeBackgrounds: false,
    includeHeaders: false,
    includeFooters: false,
    pageNumbers: false,
    quality: 'normal',
    colorMode: 'color',
    fontSize: '12pt',
    fontFamily: 'Times, serif',
    lineHeight: '1.6',
    printSelection: false,
    scaleToFit: false,
    shrinkToFit: true
  };
  
  /**
   * Show print preview
   */
  async showPrintPreview(config: PrintConfig = {}): Promise<void> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const editorState = this.editorStateService.state();
    let content = editorState.content;
    
    // Handle selection printing
    if (mergedConfig.printSelection && mergedConfig.selectionRange) {
      content = this.extractSelection(content, mergedConfig.selectionRange);
    }
    
    // Process content for printing
    const processedContent = await this.processContentForPrint(content, mergedConfig);
    
    // Calculate total pages (simplified calculation)
    const totalPages = this.calculateTotalPages(processedContent, mergedConfig);
    
    this._printPreviewState.set({
      isVisible: true,
      currentPage: 1,
      totalPages,
      zoomLevel: 100,
      content: processedContent,
      config: mergedConfig
    });
  }
  
  /**
   * Hide print preview
   */
  hidePrintPreview(): void {
    this._printPreviewState.update(state => ({
      ...state,
      isVisible: false
    }));
  }
  
  /**
   * Execute print operation
   */
  async print(config: PrintConfig = {}): Promise<void> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const editorState = this.editorStateService.state();
    let content = editorState.content;
    
    // Handle selection printing
    if (mergedConfig.printSelection && mergedConfig.selectionRange) {
      content = this.extractSelection(content, mergedConfig.selectionRange);
    }
    
    // Process content for printing
    const processedContent = await this.processContentForPrint(content, mergedConfig);
    
    // Create print window
    const printWindow = this.createPrintWindow(processedContent, mergedConfig);
    
    if (!printWindow) {
      throw new Error('Unable to open print window. Please check popup blockers.');
    }
    
    // Wait for content to load and print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  }
  
  /**
   * Quick print with default settings
   */
  async quickPrint(): Promise<void> {
    await this.print(this.defaultConfig);
  }
  
  /**
   * Print current selection
   */
  async printSelection(selectionRange: { start: number; end: number }): Promise<void> {
    await this.print({
      ...this.defaultConfig,
      printSelection: true,
      selectionRange
    });
  }
  
  /**
   * Update print preview page
   */
  updatePreviewPage(page: number): void {
    this._printPreviewState.update(state => ({
      ...state,
      currentPage: Math.max(1, Math.min(page, state.totalPages))
    }));
  }
  
  /**
   * Update print preview zoom level
   */
  updatePreviewZoom(zoomLevel: number): void {
    this._printPreviewState.update(state => ({
      ...state,
      zoomLevel: Math.max(25, Math.min(zoomLevel, 200))
    }));
  }
  
  /**
   * Process content for printing
   */
  private async processContentForPrint(content: string, config: PrintConfig): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Apply print-specific processing
    this.optimizeImagesForPrint(doc, config);
    this.applyPrintStyles(doc, config);
    this.handlePageBreaks(doc, config);
    this.addWatermark(doc, config);
    
    // Add headers and footers
    if (config.includeHeaders || config.includeFooters || config.pageNumbers) {
      this.addHeadersAndFooters(doc, config);
    }
    
    return doc.documentElement.outerHTML;
  }
  
  /**
   * Create print window with processed content
   */
  private createPrintWindow(content: string, config: PrintConfig): Window | null {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      return null;
    }
    
    const printHTML = this.generatePrintHTML(content, config);
    
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    return printWindow;
  }
  
  /**
   * Generate complete HTML for printing
   */
  private generatePrintHTML(content: string, config: PrintConfig): string {
    const pageStyles = this.generatePageStyles(config);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Print Document</title>
    <style>
        ${pageStyles}
        ${this.generatePrintStyles(config)}
        ${config.customCss || ''}
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
  }
  
  /**
   * Generate page-specific CSS
   */
  private generatePageStyles(config: PrintConfig): string {
    const pageSize = config.pageSize || 'A4';
    const orientation = config.orientation || 'portrait';
    const margins = config.margins || this.defaultConfig.margins!;
    
    return `
        @page {
            size: ${pageSize} ${orientation};
            margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
        }
    `;
  }
  
  /**
   * Generate print-specific CSS styles
   */
  private generatePrintStyles(config: PrintConfig): string {
    const fontSize = config.fontSize || '12pt';
    const fontFamily = config.fontFamily || 'Times, serif';
    const lineHeight = config.lineHeight || '1.6';
    const colorMode = config.colorMode || 'color';
    
    let styles = `
        body {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            line-height: ${lineHeight};
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
        }
        
        * {
            box-sizing: border-box;
        }
        
        h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            page-break-inside: avoid;
            margin-top: 1em;
            margin-bottom: 0.5em;
            font-weight: bold;
        }
        
        p {
            margin-bottom: 1em;
            page-break-inside: avoid;
            orphans: 2;
            widows: 2;
        }
        
        img {
            max-width: 100%;
            page-break-inside: avoid;
            display: block;
            margin: 0.5em 0;
        }
        
        table {
            border-collapse: collapse;
            page-break-inside: avoid;
            width: 100%;
            margin: 1em 0;
        }
        
        th, td {
            border: 1px solid #000;
            padding: 0.5em;
            page-break-inside: avoid;
        }
        
        th {
            background: ${config.includeBackgrounds ? '#f5f5f5' : 'transparent'};
            font-weight: bold;
        }
        
        blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 3px solid #333;
            page-break-inside: avoid;
        }
        
        code {
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            background: ${config.includeBackgrounds ? '#f5f5f5' : 'transparent'};
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }
        
        pre {
            font-family: 'Courier New', monospace;
            background: ${config.includeBackgrounds ? '#f5f5f5' : 'transparent'};
            padding: 1em;
            border-radius: 5px;
            page-break-inside: avoid;
            overflow: visible;
            white-space: pre-wrap;
        }
        
        ul, ol {
            page-break-inside: avoid;
        }
        
        li {
            page-break-inside: avoid;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .no-break {
            page-break-inside: avoid;
        }
        
        .print-header {
            position: running(header);
            text-align: center;
            font-size: 0.9em;
            border-bottom: 1px solid #333;
            padding-bottom: 0.5em;
            margin-bottom: 1em;
        }
        
        .print-footer {
            position: running(footer);
            text-align: center;
            font-size: 0.9em;
            border-top: 1px solid #333;
            padding-top: 0.5em;
            margin-top: 1em;
        }
        
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 4em;
            color: rgba(0, 0, 0, 0.1);
            z-index: -1;
            pointer-events: none;
        }
        
        @media print {
            .no-print {
                display: none !important;
            }
            
            body {
                -webkit-print-color-adjust: ${colorMode === 'color' ? 'exact' : 'economy'};
                print-color-adjust: ${colorMode === 'color' ? 'exact' : 'economy'};
            }
        }
    `;
    
    // Add grayscale filter for grayscale mode
    if (colorMode === 'grayscale') {
      styles += `
        body {
            filter: grayscale(100%);
        }
      `;
    } else if (colorMode === 'black-and-white') {
      styles += `
        body {
            filter: grayscale(100%) contrast(1000%);
        }
      `;
    }
    
    // Hide images if not included
    if (!config.includeImages) {
      styles += `
        img {
            display: none;
        }
      `;
    }
    
    return styles;
  }
  
  /**
   * Optimize images for printing
   */
  private optimizeImagesForPrint(doc: Document, config: PrintConfig): void {
    if (!config.includeImages) {
      const images = doc.querySelectorAll('img');
      images.forEach(img => img.remove());
      return;
    }
    
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      const element = img as HTMLImageElement;
      
      // Add print-friendly attributes
      element.style.maxWidth = '100%';
      element.style.height = 'auto';
      element.style.pageBreakInside = 'avoid';
      
      // Add alt text if missing
      if (!element.alt) {
        element.alt = 'Image';
      }
      
      // Wrap in a container for better page breaking
      const container = doc.createElement('div');
      container.className = 'image-container no-break';
      container.style.pageBreakInside = 'avoid';
      container.style.margin = '0.5em 0';
      
      element.parentNode?.insertBefore(container, element);
      container.appendChild(element);
    });
  }
  
  /**
   * Apply print-specific styles to content
   */
  private applyPrintStyles(doc: Document, config: PrintConfig): void {
    // Add page break classes where needed
    const headings = doc.querySelectorAll('h1, h2');
    headings.forEach(heading => {
      const element = heading as HTMLElement;
      element.style.pageBreakBefore = 'auto';
      element.style.pageBreakAfter = 'avoid';
    });
    
    // Style tables for printing
    const tables = doc.querySelectorAll('table');
    tables.forEach(table => {
      const element = table as HTMLElement;
      element.style.pageBreakInside = 'avoid';
      element.style.borderCollapse = 'collapse';
      
      // Ensure table cells have borders
      const cells = table.querySelectorAll('th, td');
      cells.forEach(cell => {
        const cellElement = cell as HTMLElement;
        cellElement.style.border = '1px solid #000';
        cellElement.style.padding = '0.5em';
      });
    });
    
    // Handle blockquotes
    const blockquotes = doc.querySelectorAll('blockquote');
    blockquotes.forEach(blockquote => {
      const element = blockquote as HTMLElement;
      element.style.pageBreakInside = 'avoid';
      element.style.borderLeft = '3px solid #333';
      element.style.paddingLeft = '1em';
      element.style.margin = '1em 0';
    });
  }
  
  /**
   * Handle page breaks in content
   */
  private handlePageBreaks(doc: Document, config: PrintConfig): void {
    // Add page breaks before major sections
    const sections = doc.querySelectorAll('section, article, .page-break');
    sections.forEach(section => {
      const element = section as HTMLElement;
      element.style.pageBreakBefore = 'always';
    });
    
    // Prevent page breaks in certain elements
    const noBreakElements = doc.querySelectorAll('.no-break, .keep-together');
    noBreakElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.pageBreakInside = 'avoid';
    });
  }
  
  /**
   * Add watermark to document
   */
  private addWatermark(doc: Document, config: PrintConfig): void {
    if (!config.watermark) {
      return;
    }
    
    const watermark = doc.createElement('div');
    watermark.className = 'watermark';
    watermark.textContent = config.watermark.text;
    watermark.style.opacity = config.watermark.opacity.toString();
    
    // Position watermark
    switch (config.watermark.position) {
      case 'top-left':
        watermark.style.top = '20%';
        watermark.style.left = '20%';
        watermark.style.transform = 'rotate(-45deg)';
        break;
      case 'top-right':
        watermark.style.top = '20%';
        watermark.style.right = '20%';
        watermark.style.left = 'auto';
        watermark.style.transform = 'rotate(-45deg)';
        break;
      case 'bottom-left':
        watermark.style.bottom = '20%';
        watermark.style.left = '20%';
        watermark.style.top = 'auto';
        watermark.style.transform = 'rotate(-45deg)';
        break;
      case 'bottom-right':
        watermark.style.bottom = '20%';
        watermark.style.right = '20%';
        watermark.style.top = 'auto';
        watermark.style.left = 'auto';
        watermark.style.transform = 'rotate(-45deg)';
        break;
      default:
        // Center position is default
        break;
    }
    
    doc.body.appendChild(watermark);
  }
  
  /**
   * Add headers and footers
   */
  private addHeadersAndFooters(doc: Document, config: PrintConfig): void {
    if (config.includeHeaders) {
      const header = doc.createElement('div');
      header.className = 'print-header';
      header.textContent = 'Document Header';
      doc.body.insertBefore(header, doc.body.firstChild);
    }
    
    if (config.includeFooters || config.pageNumbers) {
      const footer = doc.createElement('div');
      footer.className = 'print-footer';
      
      let footerContent = '';
      if (config.includeFooters) {
        footerContent += 'Document Footer';
      }
      if (config.pageNumbers) {
        footerContent += (footerContent ? ' - ' : '') + 'Page ${page} of ${totalPages}';
      }
      
      footer.textContent = footerContent;
      doc.body.appendChild(footer);
    }
  }
  
  /**
   * Extract selection from content
   */
  private extractSelection(content: string, range: { start: number; end: number }): string {
    // This is a simplified implementation
    // A complete implementation would need to handle HTML structure properly
    const textContent = this.stripHtml(content);
    const selectedText = textContent.substring(range.start, range.end);
    
    // Wrap selected text in basic HTML
    return `<div>${this.escapeHtml(selectedText)}</div>`;
  }
  
  /**
   * Calculate total pages (simplified)
   */
  private calculateTotalPages(content: string, config: PrintConfig): number {
    // This is a very simplified calculation
    // A more accurate implementation would consider actual content size and page dimensions
    const textLength = this.stripHtml(content).length;
    const charactersPerPage = this.getCharactersPerPage(config);
    
    return Math.max(1, Math.ceil(textLength / charactersPerPage));
  }
  
  /**
   * Get estimated characters per page
   */
  private getCharactersPerPage(config: PrintConfig): number {
    // Rough estimation based on page size and font size
    const baseCharsPerPage = 3000; // For A4 with 12pt font
    
    let multiplier = 1;
    
    // Adjust for page size
    switch (config.pageSize) {
      case 'A3':
        multiplier *= 2;
        break;
      case 'Legal':
        multiplier *= 1.4;
        break;
      case 'A5':
        multiplier *= 0.5;
        break;
      default: // A4, Letter
        break;
    }
    
    // Adjust for font size
    const fontSize = parseInt(config.fontSize || '12pt');
    multiplier *= (12 / fontSize);
    
    // Adjust for orientation
    if (config.orientation === 'landscape') {
      multiplier *= 1.3;
    }
    
    return Math.round(baseCharsPerPage * multiplier);
  }
  
  /**
   * Utility methods
   */
  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
  
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Get print capabilities (if browser supports it)
   */
  async getPrintCapabilities(): Promise<any> {
    if ('getDisplayMedia' in navigator.mediaDevices) {
      // Modern browsers might have print capabilities API
      return {
        supportedPageSizes: ['A4', 'Letter', 'Legal', 'A3', 'A5'],
        supportedOrientations: ['portrait', 'landscape'],
        supportsColor: true,
        supportsGrayscale: true,
        supportsDuplex: true
      };
    }
    
    return {
      supportedPageSizes: ['A4', 'Letter'],
      supportedOrientations: ['portrait', 'landscape'],
      supportsColor: true,
      supportsGrayscale: false,
      supportsDuplex: false
    };
  }
  
  /**
   * Generate print preview URL for iframe
   */
  generatePreviewUrl(content: string, config: PrintConfig): string {
    const printHTML = this.generatePrintHTML(content, config);
    const blob = new Blob([printHTML], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }
}