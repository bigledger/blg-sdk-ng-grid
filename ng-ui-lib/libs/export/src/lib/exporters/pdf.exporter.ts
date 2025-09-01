import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ExportConfig, ExportResult } from '../interfaces';
import { ProgressTrackingService } from '../services/progress-tracking.service';

// Type definitions for external libraries (to be loaded dynamically)
declare global {
  interface Window {
    jsPDF: any;
    html2canvas: any;
  }
}

/**
 * PDF Export Templates
 */
export interface PdfTemplate {
  name: string;
  type: 'grid' | 'editor' | 'chart' | 'custom';
  pageSetup: {
    format: string;
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number };
  };
  styles: {
    fontSize: number;
    fontFamily: string;
    headerStyle: any;
    bodyStyle: any;
    footerStyle: any;
  };
  layout: {
    showHeader: boolean;
    showFooter: boolean;
    showPageNumbers: boolean;
    columnsPerPage?: number;
  };
}

/**
 * PDF Exporter Service
 * 
 * Handles PDF export using jsPDF and html2canvas libraries
 */
@Injectable({
  providedIn: 'root'
})
export class PdfExporter {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly progressService = inject(ProgressTrackingService);

  private jsPDF: any = null;
  private html2canvas: any = null;
  private librariesLoaded = false;

  // Built-in templates
  private readonly templates: Record<string, PdfTemplate> = {
    grid: {
      name: 'Grid Template',
      type: 'grid',
      pageSetup: {
        format: 'a4',
        orientation: 'landscape',
        margins: { top: 20, right: 20, bottom: 20, left: 20 }
      },
      styles: {
        fontSize: 10,
        fontFamily: 'helvetica',
        headerStyle: { fontSize: 14, fontStyle: 'bold' },
        bodyStyle: { fontSize: 10, fontStyle: 'normal' },
        footerStyle: { fontSize: 8, fontStyle: 'italic' }
      },
      layout: {
        showHeader: true,
        showFooter: true,
        showPageNumbers: true,
        columnsPerPage: 10
      }
    },
    editor: {
      name: 'Editor Template',
      type: 'editor',
      pageSetup: {
        format: 'a4',
        orientation: 'portrait',
        margins: { top: 25, right: 25, bottom: 25, left: 25 }
      },
      styles: {
        fontSize: 12,
        fontFamily: 'helvetica',
        headerStyle: { fontSize: 16, fontStyle: 'bold' },
        bodyStyle: { fontSize: 12, fontStyle: 'normal' },
        footerStyle: { fontSize: 9, fontStyle: 'italic' }
      },
      layout: {
        showHeader: true,
        showFooter: true,
        showPageNumbers: true
      }
    },
    chart: {
      name: 'Chart Template',
      type: 'chart',
      pageSetup: {
        format: 'a4',
        orientation: 'landscape',
        margins: { top: 20, right: 20, bottom: 20, left: 20 }
      },
      styles: {
        fontSize: 11,
        fontFamily: 'helvetica',
        headerStyle: { fontSize: 15, fontStyle: 'bold' },
        bodyStyle: { fontSize: 11, fontStyle: 'normal' },
        footerStyle: { fontSize: 9, fontStyle: 'italic' }
      },
      layout: {
        showHeader: true,
        showFooter: true,
        showPageNumbers: true
      }
    }
  };

  /**
   * Export data to PDF
   */
  export(config: ExportConfig): Observable<ExportResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('PDF export is only supported in browser environment'));
    }

    this.progressService.startProgress('pdf-export', 'Loading PDF libraries');

    return this.loadLibraries().pipe(
      switchMap(() => {
        this.progressService.updateProgress('pdf-export', 25, 'Preparing PDF document');
        
        if (config.element) {
          return this.exportFromElement(config);
        } else if (config.data) {
          return this.exportFromData(config);
        } else {
          return throwError(() => new Error('Either element or data must be provided for PDF export'));
        }
      }),
      map(pdfData => ({
        success: true,
        data: pdfData,
        size: pdfData.length,
        metadata: {
          format: 'pdf',
          pages: this.getPageCount(pdfData),
          template: config.template?.name
        }
      } as ExportResult))
    );
  }

  /**
   * Export HTML element to PDF
   */
  private exportFromElement(config: ExportConfig): Observable<Blob> {
    return new Observable(observer => {
      const element = typeof config.element === 'string' 
        ? document.querySelector(config.element) as HTMLElement
        : config.element as HTMLElement;

      if (!element) {
        observer.error(new Error('Element not found'));
        return;
      }

      this.progressService.updateProgress('pdf-export', 50, 'Converting HTML to canvas');

      // Configure html2canvas options
      const html2canvasOptions = {
        scale: config.scale || 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: config.backgroundColor || '#ffffff',
        width: config.width,
        height: config.height,
        ...config.html2canvas
      };

      this.html2canvas(element, html2canvasOptions).then((canvas: HTMLCanvasElement) => {
        this.progressService.updateProgress('pdf-export', 75, 'Creating PDF document');

        try {
          const pdf = this.createPdfFromCanvas(canvas, config);
          const pdfBlob = new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
          
          this.progressService.completeProgress('pdf-export');
          observer.next(pdfBlob);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }).catch((error: Error) => {
        observer.error(error);
      });
    });
  }

  /**
   * Export data to PDF
   */
  private exportFromData(config: ExportConfig): Observable<Blob> {
    return new Observable(observer => {
      try {
        this.progressService.updateProgress('pdf-export', 50, 'Processing data for PDF');

        const template = this.getTemplate(config);
        const pdf = this.createPdfFromData(config.data, template, config);
        const pdfBlob = new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
        
        this.progressService.completeProgress('pdf-export');
        observer.next(pdfBlob);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Create PDF from canvas
   */
  private createPdfFromCanvas(canvas: HTMLCanvasElement, config: ExportConfig): any {
    const template = this.getTemplate(config);
    
    const pdf = new this.jsPDF({
      orientation: template.pageSetup.orientation,
      unit: 'mm',
      format: template.pageSetup.format,
      compress: config.compression !== 'none'
    });

    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margins = template.pageSetup.margins;
    const contentWidth = pdfWidth - margins.left - margins.right;
    const contentHeight = pdfHeight - margins.top - margins.bottom;

    // Scale canvas to fit PDF
    const canvasAspectRatio = canvas.width / canvas.height;
    const contentAspectRatio = contentWidth / contentHeight;

    let imgWidth = contentWidth;
    let imgHeight = contentHeight;

    if (canvasAspectRatio > contentAspectRatio) {
      imgHeight = contentWidth / canvasAspectRatio;
    } else {
      imgWidth = contentHeight * canvasAspectRatio;
    }

    // Add header
    if (template.layout.showHeader && (config.header || config.filename)) {
      this.addHeader(pdf, config.header || config.filename || 'Export', template);
    }

    // Add main content
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const yOffset = template.layout.showHeader ? margins.top + 15 : margins.top;
    
    pdf.addImage(imgData, 'JPEG', margins.left, yOffset, imgWidth, imgHeight);

    // Add footer
    if (template.layout.showFooter || template.layout.showPageNumbers) {
      this.addFooter(pdf, template, config);
    }

    // Add watermark if specified
    if (config.watermark) {
      this.addWatermark(pdf, config.watermark);
    }

    return pdf;
  }

  /**
   * Create PDF from data
   */
  private createPdfFromData(data: any, template: PdfTemplate, config: ExportConfig): any {
    const pdf = new this.jsPDF({
      orientation: template.pageSetup.orientation,
      unit: 'mm',
      format: template.pageSetup.format,
      compress: config.compression !== 'none'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margins = template.pageSetup.margins;
    let currentY = margins.top;

    // Add header
    if (template.layout.showHeader) {
      currentY = this.addHeader(pdf, config.filename || 'Data Export', template);
      currentY += 10;
    }

    // Process data based on type
    if (Array.isArray(data)) {
      currentY = this.addTableData(pdf, data, currentY, template, config);
    } else if (typeof data === 'object') {
      currentY = this.addObjectData(pdf, data, currentY, template);
    } else {
      currentY = this.addTextData(pdf, String(data), currentY, template);
    }

    // Add footer
    if (template.layout.showFooter || template.layout.showPageNumbers) {
      this.addFooter(pdf, template, config);
    }

    // Add watermark if specified
    if (config.watermark) {
      this.addWatermark(pdf, config.watermark);
    }

    return pdf;
  }

  /**
   * Add table data to PDF
   */
  private addTableData(pdf: any, data: any[], currentY: number, template: PdfTemplate, config: ExportConfig): number {
    if (data.length === 0) return currentY;

    const margins = template.pageSetup.margins;
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pdfWidth - margins.left - margins.right;

    // Get headers
    const headers = Object.keys(data[0]);
    const columnWidth = contentWidth / headers.length;

    // Set font for table
    pdf.setFontSize(template.styles.fontSize);
    pdf.setFont(template.styles.fontFamily, 'bold');

    // Draw headers
    let x = margins.left;
    headers.forEach(header => {
      pdf.text(header, x, currentY);
      x += columnWidth;
    });

    currentY += 8;

    // Draw table border for headers
    pdf.setLineWidth(0.5);
    pdf.line(margins.left, currentY - 2, pdfWidth - margins.right, currentY - 2);

    // Set font for data
    pdf.setFont(template.styles.fontFamily, 'normal');

    // Add data rows
    data.forEach((row, index) => {
      if (currentY > pdf.internal.pageSize.getHeight() - margins.bottom - 20) {
        // Add new page
        pdf.addPage();
        currentY = margins.top;
        
        // Repeat headers on new page
        pdf.setFont(template.styles.fontFamily, 'bold');
        x = margins.left;
        headers.forEach(header => {
          pdf.text(header, x, currentY);
          x += columnWidth;
        });
        currentY += 8;
        pdf.line(margins.left, currentY - 2, pdfWidth - margins.right, currentY - 2);
        pdf.setFont(template.styles.fontFamily, 'normal');
      }

      x = margins.left;
      headers.forEach(header => {
        const value = row[header];
        const text = value !== null && value !== undefined ? String(value) : '';
        
        // Truncate long text
        const maxChars = Math.floor(columnWidth * 0.8);
        const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;
        
        pdf.text(truncatedText, x, currentY);
        x += columnWidth;
      });

      currentY += 6;

      // Add row separator line
      if ((index + 1) % 5 === 0) {
        pdf.setLineWidth(0.2);
        pdf.line(margins.left, currentY + 1, pdfWidth - margins.right, currentY + 1);
        currentY += 3;
      }
    });

    return currentY;
  }

  /**
   * Add object data to PDF
   */
  private addObjectData(pdf: any, data: any, currentY: number, template: PdfTemplate): number {
    const margins = template.pageSetup.margins;

    pdf.setFontSize(template.styles.fontSize);
    pdf.setFont(template.styles.fontFamily, 'normal');

    Object.entries(data).forEach(([key, value]) => {
      if (currentY > pdf.internal.pageSize.getHeight() - margins.bottom - 20) {
        pdf.addPage();
        currentY = margins.top;
      }

      // Bold key
      pdf.setFont(template.styles.fontFamily, 'bold');
      pdf.text(key + ':', margins.left, currentY);
      
      // Normal value
      pdf.setFont(template.styles.fontFamily, 'normal');
      const valueText = value !== null && value !== undefined ? String(value) : '';
      pdf.text(valueText, margins.left + 40, currentY);
      
      currentY += 7;
    });

    return currentY;
  }

  /**
   * Add text data to PDF
   */
  private addTextData(pdf: any, text: string, currentY: number, template: PdfTemplate): number {
    const margins = template.pageSetup.margins;
    const contentWidth = pdf.internal.pageSize.getWidth() - margins.left - margins.right;

    pdf.setFontSize(template.styles.fontSize);
    pdf.setFont(template.styles.fontFamily, 'normal');

    // Split text into lines that fit the page width
    const lines = pdf.splitTextToSize(text, contentWidth);

    lines.forEach((line: string) => {
      if (currentY > pdf.internal.pageSize.getHeight() - margins.bottom - 20) {
        pdf.addPage();
        currentY = margins.top;
      }

      pdf.text(line, margins.left, currentY);
      currentY += 6;
    });

    return currentY;
  }

  /**
   * Add header to PDF
   */
  private addHeader(pdf: any, title: string, template: PdfTemplate): number {
    const margins = template.pageSetup.margins;
    const pdfWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(template.styles.headerStyle.fontSize);
    pdf.setFont(template.styles.fontFamily, template.styles.headerStyle.fontStyle);
    
    // Center the title
    const textWidth = pdf.getTextWidth(title);
    const x = (pdfWidth - textWidth) / 2;
    
    pdf.text(title, x, margins.top);
    
    // Add date
    pdf.setFontSize(10);
    pdf.setFont(template.styles.fontFamily, 'normal');
    const date = new Date().toLocaleDateString();
    pdf.text(date, pdfWidth - margins.right - pdf.getTextWidth(date), margins.top);

    // Add separator line
    pdf.setLineWidth(0.5);
    pdf.line(margins.left, margins.top + 5, pdfWidth - margins.right, margins.top + 5);

    return margins.top + 10;
  }

  /**
   * Add footer to PDF
   */
  private addFooter(pdf: any, template: PdfTemplate, config: ExportConfig): void {
    const margins = template.pageSetup.margins;
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const footerY = pdfHeight - margins.bottom + 5;

    pdf.setFontSize(template.styles.footerStyle.fontSize);
    pdf.setFont(template.styles.fontFamily, template.styles.footerStyle.fontStyle);

    // Add separator line
    pdf.setLineWidth(0.3);
    pdf.line(margins.left, footerY - 5, pdfWidth - margins.right, footerY - 5);

    // Add page numbers
    if (template.layout.showPageNumbers) {
      const pageNum = pdf.internal.getCurrentPageInfo().pageNumber;
      const totalPages = pdf.internal.getNumberOfPages();
      const pageText = `Page ${pageNum} of ${totalPages}`;
      
      pdf.text(pageText, pdfWidth - margins.right - pdf.getTextWidth(pageText), footerY);
    }

    // Add footer content
    if (config.footer) {
      const footerText = typeof config.footer === 'string' ? config.footer : config.footer.toString();
      pdf.text(footerText, margins.left, footerY);
    }
  }

  /**
   * Add watermark to PDF
   */
  private addWatermark(pdf: any, watermark: any): void {
    if (!watermark.text && !watermark.image) return;

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Save current state
    pdf.saveGraphicsState();
    
    // Set opacity
    pdf.setGState(new pdf.GState({ opacity: watermark.opacity || 0.3 }));

    if (watermark.text) {
      pdf.setFontSize(watermark.fontSize || 50);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(150, 150, 150);

      // Center the watermark
      const textWidth = pdf.getTextWidth(watermark.text);
      const x = (pdfWidth - textWidth) / 2;
      const y = pdfHeight / 2;

      // Rotate if specified
      if (watermark.rotation) {
        pdf.text(watermark.text, x, y, { angle: watermark.rotation });
      } else {
        pdf.text(watermark.text, x, y);
      }
    }

    // Restore state
    pdf.restoreGraphicsState();
  }

  /**
   * Get template for PDF generation
   */
  private getTemplate(config: ExportConfig): PdfTemplate {
    if (config.template && config.template.name && this.templates[config.template.name]) {
      return this.templates[config.template.name];
    }

    // Determine template based on data type
    if (config.element) {
      return this.templates.chart; // Best for general elements
    }

    if (Array.isArray(config.data)) {
      return this.templates.grid; // Best for tabular data
    }

    return this.templates.editor; // Default for other data types
  }

  /**
   * Get page count from PDF data
   */
  private getPageCount(pdfData: any): number {
    try {
      // This is a simplified way to estimate pages
      // In a real implementation, you'd parse the PDF structure
      const dataSize = pdfData.length;
      const estimatedPages = Math.max(1, Math.ceil(dataSize / 50000)); // Rough estimate
      return estimatedPages;
    } catch {
      return 1;
    }
  }

  /**
   * Load required libraries dynamically
   */
  private loadLibraries(): Observable<boolean> {
    if (this.librariesLoaded && this.jsPDF && this.html2canvas) {
      return from(Promise.resolve(true));
    }

    return from(this.loadLibrariesAsync());
  }

  private async loadLibrariesAsync(): Promise<boolean> {
    try {
      // Load jsPDF
      if (!this.jsPDF && !window.jsPDF) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        this.jsPDF = window.jsPDF;
      } else {
        this.jsPDF = window.jsPDF;
      }

      // Load html2canvas
      if (!this.html2canvas && !window.html2canvas) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        this.html2canvas = window.html2canvas;
      } else {
        this.html2canvas = window.html2canvas;
      }

      this.librariesLoaded = true;
      return true;
    } catch (error) {
      throw new Error(`Failed to load PDF libraries: ${error}`);
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }
}