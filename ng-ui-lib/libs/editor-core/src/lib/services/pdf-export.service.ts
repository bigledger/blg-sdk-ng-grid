import { Injectable } from '@angular/core';
import { ExportConfig } from './editor-export.service';

/**
 * PDF-specific export configuration
 */
export interface PDFExportConfig extends ExportConfig {
  // Page settings
  pageSize: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Content settings
  embedFonts: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  optimizeImages: boolean;
  
  // Document structure
  headers?: {
    enabled: boolean;
    content?: string;
    alignment?: 'left' | 'center' | 'right';
    font?: {
      family: string;
      size: number;
      style?: 'normal' | 'bold' | 'italic';
    };
  };
  
  footers?: {
    enabled: boolean;
    content?: string;
    pageNumbers?: boolean;
    alignment?: 'left' | 'center' | 'right';
    font?: {
      family: string;
      size: number;
      style?: 'normal' | 'bold' | 'italic';
    };
  };
  
  toc?: {
    enabled: boolean;
    title?: string;
    depth?: number;
    pageBreakAfter?: boolean;
    includePageNumbers?: boolean;
  };
  
  // Bookmarks and navigation
  bookmarks?: {
    enabled: boolean;
    fromHeadings?: boolean;
    customBookmarks?: Array<{
      title: string;
      page: number;
      level: number;
    }>;
  };
  
  // Security settings
  security?: {
    userPassword?: string;
    ownerPassword?: string;
    permissions?: {
      print: boolean;
      modify: boolean;
      copy: boolean;
      annotate: boolean;
      fillForms: boolean;
      extractText: boolean;
      assemble: boolean;
      printHighRes: boolean;
    };
    encryption?: 'RC4' | 'AES128' | 'AES256';
  };
  
  // Metadata
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

/**
 * PDF Export Service
 * Handles professional PDF generation with advanced features
 */
@Injectable({
  providedIn: 'root'
})
export class PDFExportService {
  
  /**
   * Export content to PDF with professional layout
   */
  async exportToPDF(content: string, config: PDFExportConfig): Promise<Blob> {
    // Import PDF libraries
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    
    // Create PDF document with specified settings
    const pdf = new jsPDF({
      orientation: config.orientation || 'portrait',
      unit: 'mm',
      format: config.pageSize || 'A4'
    });
    
    // Set document metadata
    if (config.metadata) {
      this.setDocumentMetadata(pdf, config.metadata);
    }
    
    // Process content for PDF rendering
    const processedContent = await this.processContentForPDF(content, config);
    
    // Create temporary container for rendering
    const container = this.createRenderingContainer(processedContent, config);
    document.body.appendChild(container);
    
    try {
      // Generate PDF content
      await this.generatePDFContent(pdf, container, config);
      
      // Add headers and footers
      if (config.headers?.enabled || config.footers?.enabled) {
        this.addHeadersAndFooters(pdf, config);
      }
      
      // Add table of contents
      if (config.toc?.enabled) {
        this.addTableOfContents(pdf, processedContent, config);
      }
      
      // Add bookmarks
      if (config.bookmarks?.enabled) {
        this.addBookmarks(pdf, processedContent, config);
      }
      
      // Apply security settings
      if (config.security) {
        this.applySecuritySettings(pdf, config.security);
      }
      
      return pdf.output('blob');
      
    } finally {
      document.body.removeChild(container);
    }
  }
  
  /**
   * Process HTML content for optimal PDF rendering
   */
  private async processContentForPDF(content: string, config: PDFExportConfig): Promise<string> {
    // Parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Optimize images if enabled
    if (config.optimizeImages) {
      await this.optimizeImages(doc, config.imageQuality);
    }
    
    // Process tables for better PDF layout
    this.processTables(doc);
    
    // Handle page breaks
    this.insertPageBreaks(doc, config);
    
    // Prepare content for ToC and bookmarks
    this.processHeadings(doc, config);
    
    return doc.body.innerHTML;
  }
  
  /**
   * Create rendering container with PDF-optimized styles
   */
  private createRenderingContainer(content: string, config: PDFExportConfig): HTMLElement {
    const container = document.createElement('div');
    container.innerHTML = content;
    
    const pageWidth = this.getPageWidth(config);
    const margins = config.margins || { top: 20, right: 20, bottom: 20, left: 20 };
    const contentWidth = pageWidth - margins.left - margins.right;
    
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: ${contentWidth}mm;
      padding: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      background: white;
    `;
    
    // Apply PDF-specific CSS
    this.applyPDFStyles(container, config);
    
    return container;
  }
  
  /**
   * Generate PDF content from HTML container
   */
  private async generatePDFContent(
    pdf: any, 
    container: HTMLElement, 
    config: PDFExportConfig
  ): Promise<void> {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/jpeg', this.getImageQuality(config.imageQuality));
    const pageWidth = this.getPageWidth(config);
    const pageHeight = this.getPageHeight(config);
    const margins = config.margins || { top: 20, right: 20, bottom: 20, left: 20 };
    
    const imgWidth = pageWidth - margins.left - margins.right;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add content to PDF, splitting across pages if necessary
    let yPosition = margins.top;
    let remainingHeight = imgHeight;
    let sourceY = 0;
    
    while (remainingHeight > 0) {
      const availableHeight = pageHeight - margins.top - margins.bottom;
      const sliceHeight = Math.min(remainingHeight, availableHeight);
      
      // Create a canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d')!;
      
      pageCanvas.width = canvas.width;
      pageCanvas.height = (sliceHeight / imgHeight) * canvas.height;
      
      pageCtx.drawImage(
        canvas,
        0, sourceY * canvas.height / imgHeight,
        canvas.width, pageCanvas.height,
        0, 0,
        canvas.width, pageCanvas.height
      );
      
      const pageImgData = pageCanvas.toDataURL('image/jpeg', this.getImageQuality(config.imageQuality));
      
      pdf.addImage(pageImgData, 'JPEG', margins.left, yPosition, imgWidth, sliceHeight);
      
      remainingHeight -= sliceHeight;
      sourceY += sliceHeight / imgHeight;
      
      if (remainingHeight > 0) {
        pdf.addPage();
        yPosition = margins.top;
      }
    }
  }
  
  /**
   * Add headers and footers to all pages
   */
  private addHeadersAndFooters(pdf: any, config: PDFExportConfig): void {
    const totalPages = pdf.internal.getNumberOfPages();
    const pageWidth = this.getPageWidth(config);
    const pageHeight = this.getPageHeight(config);
    const margins = config.margins || { top: 20, right: 20, bottom: 20, left: 20 };
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Add header
      if (config.headers?.enabled && config.headers.content) {
        this.addPageHeader(pdf, config.headers, i, pageWidth, margins);
      }
      
      // Add footer
      if (config.footers?.enabled) {
        this.addPageFooter(pdf, config.footers, i, totalPages, pageWidth, pageHeight, margins);
      }
    }
  }
  
  /**
   * Add page header
   */
  private addPageHeader(pdf: any, headerConfig: any, pageNumber: number, pageWidth: number, margins: any): void {
    const font = headerConfig.font || { family: 'Times', size: 10, style: 'normal' };
    
    pdf.setFont(font.family, font.style);
    pdf.setFontSize(font.size);
    
    const xPosition = this.getAlignmentPosition(
      headerConfig.alignment || 'center',
      pageWidth,
      margins,
      pdf.getTextWidth(headerConfig.content)
    );
    
    pdf.text(headerConfig.content, xPosition, margins.top - 10);
  }
  
  /**
   * Add page footer
   */
  private addPageFooter(
    pdf: any, 
    footerConfig: any, 
    pageNumber: number, 
    totalPages: number, 
    pageWidth: number, 
    pageHeight: number, 
    margins: any
  ): void {
    const font = footerConfig.font || { family: 'Times', size: 10, style: 'normal' };
    
    pdf.setFont(font.family, font.style);
    pdf.setFontSize(font.size);
    
    let footerText = footerConfig.content || '';
    
    if (footerConfig.pageNumbers) {
      const pageText = `Page ${pageNumber} of ${totalPages}`;
      footerText = footerText ? `${footerText} - ${pageText}` : pageText;
    }
    
    const xPosition = this.getAlignmentPosition(
      footerConfig.alignment || 'center',
      pageWidth,
      margins,
      pdf.getTextWidth(footerText)
    );
    
    pdf.text(footerText, xPosition, pageHeight - 10);
  }
  
  /**
   * Add table of contents
   */
  private addTableOfContents(pdf: any, content: string, config: PDFExportConfig): void {
    if (!config.toc?.enabled) return;
    
    const headings = this.extractHeadings(content, config.toc.depth || 3);
    
    if (headings.length === 0) return;
    
    // Insert ToC at the beginning
    pdf.insertPage(1);
    pdf.setPage(1);
    
    const margins = config.margins || { top: 20, right: 20, bottom: 20, left: 20 };
    let yPosition = margins.top + 10;
    
    // ToC title
    pdf.setFont('Times', 'bold');
    pdf.setFontSize(16);
    pdf.text(config.toc.title || 'Table of Contents', margins.left, yPosition);
    yPosition += 15;
    
    // ToC entries
    pdf.setFont('Times', 'normal');
    pdf.setFontSize(12);
    
    headings.forEach(heading => {
      const indent = (heading.level - 1) * 5;
      const text = `${heading.text}`;
      
      pdf.text(text, margins.left + indent, yPosition);
      
      if (config.toc?.includePageNumbers) {
        const pageText = `${heading.page}`;
        const textWidth = pdf.getTextWidth(pageText);
        const pageWidth = this.getPageWidth(config);
        pdf.text(pageText, pageWidth - margins.right - textWidth, yPosition);
      }
      
      yPosition += 8;
    });
    
    if (config.toc.pageBreakAfter) {
      pdf.addPage();
    }
  }
  
  /**
   * Add bookmarks for navigation
   */
  private addBookmarks(pdf: any, content: string, config: PDFExportConfig): void {
    // Note: jsPDF doesn't natively support bookmarks
    // This would require a different PDF library like PDFKit
    console.warn('Bookmarks require a different PDF library. Consider using PDFKit for advanced features.');
  }
  
  /**
   * Apply security settings to PDF
   */
  private applySecuritySettings(pdf: any, security: any): void {
    // Note: jsPDF has limited security features
    // For comprehensive security, consider server-side PDF generation
    console.warn('Advanced security features require server-side PDF generation or specialized libraries.');
  }
  
  /**
   * Set document metadata
   */
  private setDocumentMetadata(pdf: any, metadata: any): void {
    if (metadata.title) pdf.setProperties({ title: metadata.title });
    if (metadata.author) pdf.setProperties({ author: metadata.author });
    if (metadata.subject) pdf.setProperties({ subject: metadata.subject });
    if (metadata.keywords) pdf.setProperties({ keywords: metadata.keywords.join(', ') });
    if (metadata.creator) pdf.setProperties({ creator: metadata.creator });
  }
  
  /**
   * Helper methods
   */
  private getPageWidth(config: PDFExportConfig): number {
    const sizes: Record<string, number> = {
      'A4': 210,
      'Letter': 216,
      'Legal': 216,
      'A3': 297
    };
    return sizes[config.pageSize || 'A4'];
  }
  
  private getPageHeight(config: PDFExportConfig): number {
    const sizes: Record<string, number> = {
      'A4': 297,
      'Letter': 279,
      'Legal': 356,
      'A3': 420
    };
    return sizes[config.pageSize || 'A4'];
  }
  
  private getImageQuality(quality: string = 'medium'): number {
    const qualities: Record<string, number> = {
      'low': 0.3,
      'medium': 0.7,
      'high': 0.95
    };
    return qualities[quality] || 0.7;
  }
  
  private getAlignmentPosition(alignment: string, pageWidth: number, margins: any, textWidth: number): number {
    switch (alignment) {
      case 'left':
        return margins.left;
      case 'right':
        return pageWidth - margins.right - textWidth;
      case 'center':
      default:
        return (pageWidth - textWidth) / 2;
    }
  }
  
  private async optimizeImages(doc: Document, quality: string): Promise<void> {
    const images = doc.querySelectorAll('img');
    
    for (const img of Array.from(images)) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 600;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const optimizedSrc = canvas.toDataURL('image/jpeg', this.getImageQuality(quality));
        img.src = optimizedSrc;
      } catch (error) {
        console.warn('Failed to optimize image:', error);
      }
    }
  }
  
  private processTables(doc: Document): void {
    const tables = doc.querySelectorAll('table');
    
    tables.forEach(table => {
      // Add PDF-friendly table styles
      table.style.cssText += `
        border-collapse: collapse;
        width: 100%;
        page-break-inside: avoid;
        margin: 10px 0;
      `;
      
      const cells = table.querySelectorAll('th, td');
      cells.forEach(cell => {
        const element = cell as HTMLElement;
        element.style.cssText += `
          border: 1px solid #000;
          padding: 5px;
          page-break-inside: avoid;
        `;
      });
    });
  }
  
  private insertPageBreaks(doc: Document, config: PDFExportConfig): void {
    // Add page breaks before major headings
    const headings = doc.querySelectorAll('h1, h2');
    headings.forEach(heading => {
      const element = heading as HTMLElement;
      element.style.cssText += `
        page-break-before: always;
        margin-top: 0;
      `;
    });
  }
  
  private processHeadings(doc: Document, config: PDFExportConfig): void {
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      const element = heading as HTMLElement;
      element.setAttribute('data-heading-id', `heading-${index}`);
      element.style.cssText += `
        page-break-after: avoid;
      `;
    });
  }
  
  private extractHeadings(content: string, maxDepth: number): Array<{
    level: number;
    text: string;
    page: number;
  }> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings: Array<{ level: number; text: string; page: number }> = [];
    
    for (let level = 1; level <= maxDepth; level++) {
      const elements = doc.querySelectorAll(`h${level}`);
      elements.forEach((element, index) => {
        headings.push({
          level,
          text: element.textContent || '',
          page: 1 // This would need to be calculated based on content position
        });
      });
    }
    
    return headings.sort((a, b) => a.page - b.page);
  }
  
  private applyPDFStyles(container: HTMLElement, config: PDFExportConfig): void {
    // Add CSS for better PDF rendering
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }
      
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
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
        margin: 1em 0;
      }
      
      th, td {
        border: 1px solid #000;
        padding: 0.5em;
        page-break-inside: avoid;
      }
      
      blockquote {
        margin: 1em 0;
        padding-left: 1em;
        border-left: 3px solid #ccc;
        page-break-inside: avoid;
      }
      
      code {
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        background: #f5f5f5;
        padding: 0.2em 0.4em;
        border-radius: 3px;
      }
      
      pre {
        font-family: 'Courier New', monospace;
        background: #f5f5f5;
        padding: 1em;
        border-radius: 5px;
        page-break-inside: avoid;
        overflow: visible;
        white-space: pre-wrap;
      }
    `;
    
    container.appendChild(style);
  }
}