import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';
import { EditorStateService } from './editor-state.service';
import { PDFExportService, PDFExportConfig } from './pdf-export.service';
import { DocxExportService, DocxExportConfig } from './docx-export.service';
import { HtmlExportService, HtmlExportConfig } from './html-export.service';
import { GoogleDocsExportService, GoogleDocsExportConfig } from './google-docs-export.service';
import { PrintService, PrintConfig } from './print-service';

/**
 * Export formats supported by the editor
 */
export enum ExportFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  HTML = 'html',
  TXT = 'txt',
  RTF = 'rtf',
  ODT = 'odt',
  GOOGLE_DOCS = 'google-docs',
  MARKDOWN = 'markdown'
}

/**
 * Export configuration options
 */
export interface ExportConfig {
  format: ExportFormat;
  filename?: string;
  includeImages?: boolean;
  preserveFormatting?: boolean;
  includeComments?: boolean;
  includeRevisions?: boolean;
  embedFonts?: boolean;
  optimize?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  headers?: {
    enabled: boolean;
    content?: string;
  };
  footers?: {
    enabled: boolean;
    content?: string;
    pageNumbers?: boolean;
  };
  toc?: {
    enabled: boolean;
    depth?: number;
  };
  security?: {
    password?: string;
    permissions?: {
      print?: boolean;
      modify?: boolean;
      copy?: boolean;
    };
  };
  googleDocs?: {
    shareWithEmails?: string[];
    accessLevel?: 'reader' | 'commenter' | 'writer';
  };
}

/**
 * Export result information
 */
export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  filename: string;
  size?: number;
  downloadUrl?: string;
  googleDocsUrl?: string;
  error?: string;
  warnings?: string[];
}

/**
 * Export progress information
 */
export interface ExportProgress {
  stage: 'preparing' | 'processing' | 'generating' | 'uploading' | 'complete';
  progress: number; // 0-100
  message: string;
}

/**
 * Editor Export Service
 * Provides comprehensive export capabilities for rich text content
 */
@Injectable({
  providedIn: 'root'
})
export class EditorExportService {
  private editorStateService = inject(EditorStateService);
  private pdfExportService = inject(PDFExportService);
  private docxExportService = inject(DocxExportService);
  private htmlExportService = inject(HtmlExportService);
  private googleDocsExportService = inject(GoogleDocsExportService);
  private printService = inject(PrintService);
  
  // Export state signals
  private _isExporting = signal(false);
  private _exportProgress = signal<ExportProgress | null>(null);
  private _lastExportResult = signal<ExportResult | null>(null);
  
  readonly isExporting = this._isExporting.asReadonly();
  readonly exportProgress = this._exportProgress.asReadonly();
  readonly lastExportResult = this._lastExportResult.asReadonly();

  /**
   * Export editor content to specified format
   */
  async exportContent(config: ExportConfig): Promise<ExportResult> {
    this._isExporting.set(true);
    this._exportProgress.set({
      stage: 'preparing',
      progress: 0,
      message: 'Preparing content for export...'
    });

    try {
      const editorState = this.editorStateService.state();
      const content = editorState.content;
      
      if (!content || content.trim() === '') {
        throw new Error('No content to export');
      }

      switch (config.format) {
        case ExportFormat.PDF:
          return await this.exportToPDF(content, config);
        case ExportFormat.DOCX:
          return await this.exportToDocx(content, config);
        case ExportFormat.HTML:
          return await this.exportToHTML(content, config);
        case ExportFormat.TXT:
          return await this.exportToText(content, config);
        case ExportFormat.RTF:
          return await this.exportToRTF(content, config);
        case ExportFormat.ODT:
          return await this.exportToODT(content, config);
        case ExportFormat.GOOGLE_DOCS:
          return await this.exportToGoogleDocs(content, config);
        case ExportFormat.MARKDOWN:
          return await this.exportToMarkdown(content, config);
        default:
          throw new Error(`Unsupported export format: ${config.format}`);
      }
    } catch (error) {
      const result: ExportResult = {
        success: false,
        format: config.format,
        filename: config.filename || 'export',
        error: error instanceof Error ? error.message : 'Export failed'
      };
      this._lastExportResult.set(result);
      return result;
    } finally {
      this._isExporting.set(false);
      this._exportProgress.set(null);
    }
  }

  /**
   * Export to PDF with professional layout
   */
  private async exportToPDF(content: string, config: ExportConfig): Promise<ExportResult> {
    this._exportProgress.set({
      stage: 'processing',
      progress: 25,
      message: 'Processing content for PDF export...'
    });

    // Use specialized PDF export service
    const pdfConfig: PDFExportConfig = {
      ...config,
      pageSize: config.pageSize || 'A4',
      orientation: config.orientation || 'portrait',
      margins: config.margins || { top: 20, right: 20, bottom: 20, left: 20 },
      embedFonts: config.embedFonts || false,
      imageQuality: 'high',
      optimizeImages: config.optimize || false
    };

    try {
      const blob = await this.pdfExportService.exportToPDF(content, pdfConfig);
      const filename = config.filename || `document-${Date.now()}.pdf`;
      
      // Create download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();

      this._exportProgress.set({
        stage: 'complete',
        progress: 100,
        message: 'PDF export complete'
      });

      const result: ExportResult = {
        success: true,
        format: ExportFormat.PDF,
        filename,
        size: blob.size,
        downloadUrl: url
      };

      this._lastExportResult.set(result);
      return result;
    } catch (error) {
      const result: ExportResult = {
        success: false,
        format: ExportFormat.PDF,
        filename: config.filename || 'export.pdf',
        error: error instanceof Error ? error.message : 'PDF export failed'
      };
      this._lastExportResult.set(result);
      return result;
    }
  }

  /**
   * Export to Microsoft Word (.docx) format
   */
  private async exportToDocx(content: string, config: ExportConfig): Promise<ExportResult> {
    this._exportProgress.set({
      stage: 'processing',
      progress: 25,
      message: 'Processing content for Word export...'
    });

    // Import docx library dynamically
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
    
    const filename = config.filename || `document-${Date.now()}.docx`;
    
    // Parse HTML content to extract formatting
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    const paragraphs = this.convertHTMLToDocxParagraphs(doc.body, config);

    this._exportProgress.set({
      stage: 'generating',
      progress: 50,
      message: 'Generating Word document...'
    });

    // Create Word document
    const docxDocument = new Document({
      sections: [{
        properties: {},
        headers: config.headers?.enabled ? {
          default: new Paragraph({
            children: [new TextRun(config.headers.content || '')],
            alignment: AlignmentType.CENTER
          })
        } : undefined,
        footers: config.footers?.enabled ? {
          default: new Paragraph({
            children: [
              new TextRun(config.footers.content || ''),
              ...(config.footers.pageNumbers ? [new TextRun({ text: ' - Page ', break: 0 })] : [])
            ],
            alignment: AlignmentType.CENTER
          })
        } : undefined,
        children: paragraphs
      }]
    });

    this._exportProgress.set({
      stage: 'complete',
      progress: 100,
      message: 'Word export complete'
    });

    // Generate and save the document
    const buffer = await Packer.toBuffer(docxDocument);
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    const result: ExportResult = {
      success: true,
      format: ExportFormat.DOCX,
      filename,
      size: buffer.length,
      downloadUrl: url
    };

    this._lastExportResult.set(result);
    return result;
  }

  /**
   * Export to HTML format with styling options
   */
  private async exportToHTML(content: string, config: ExportConfig): Promise<ExportResult> {
    this._exportProgress.set({
      stage: 'processing',
      progress: 25,
      message: 'Processing content for HTML export...'
    });

    const filename = config.filename || `document-${Date.now()}.html`;
    
    // Create HTML document structure
    let htmlContent = content;
    
    if (config.preserveFormatting) {
      // Wrap content in full HTML document
      htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename.replace('.html', '')}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        
        p {
            margin-bottom: 1rem;
        }
        
        blockquote {
            border-left: 4px solid #3498db;
            margin: 1rem 0;
            padding-left: 1rem;
            color: #555;
        }
        
        code {
            background: #f8f9fa;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        
        pre {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 5px;
            overflow-x: auto;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 0.75rem;
            text-align: left;
        }
        
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        
        img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        @media print {
            body { max-width: none; margin: 0; }
        }
    </style>
</head>
<body>
${content}
</body>
</html>`;
    }

    this._exportProgress.set({
      stage: 'complete',
      progress: 100,
      message: 'HTML export complete'
    });

    // Create download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    const result: ExportResult = {
      success: true,
      format: ExportFormat.HTML,
      filename,
      size: htmlContent.length,
      downloadUrl: url
    };

    this._lastExportResult.set(result);
    return result;
  }

  /**
   * Export to plain text format
   */
  private async exportToText(content: string, config: ExportConfig): Promise<ExportResult> {
    const filename = config.filename || `document-${Date.now()}.txt`;
    
    // Strip HTML tags and convert to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    // Create download
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    const result: ExportResult = {
      success: true,
      format: ExportFormat.TXT,
      filename,
      size: textContent.length,
      downloadUrl: url
    };

    this._lastExportResult.set(result);
    return result;
  }

  /**
   * Export to RTF format
   */
  private async exportToRTF(content: string, config: ExportConfig): Promise<ExportResult> {
    const filename = config.filename || `document-${Date.now()}.rtf`;
    
    // Convert HTML to RTF format
    let rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';
    rtfContent += '\\f0\\fs24 '; // Default font and size
    
    // Simple HTML to RTF conversion
    let textContent = content;
    textContent = textContent.replace(/<b[^>]*>(.*?)<\/b>/gi, '{\\b $1}');
    textContent = textContent.replace(/<i[^>]*>(.*?)<\/i>/gi, '{\\i $1}');
    textContent = textContent.replace(/<u[^>]*>(.*?)<\/u>/gi, '{\\ul $1}');
    textContent = textContent.replace(/<br\s*\/?>/gi, '\\par ');
    textContent = textContent.replace(/<p[^>]*>/gi, '\\par ');
    textContent = textContent.replace(/<\/p>/gi, '');
    textContent = textContent.replace(/<[^>]+>/g, ''); // Remove remaining HTML tags
    
    rtfContent += textContent + '}';

    // Create download
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    const result: ExportResult = {
      success: true,
      format: ExportFormat.RTF,
      filename,
      size: rtfContent.length,
      downloadUrl: url
    };

    this._lastExportResult.set(result);
    return result;
  }

  /**
   * Export to OpenDocument Text format
   */
  private async exportToODT(content: string, config: ExportConfig): Promise<ExportResult> {
    // This would require a specialized ODT library
    // For now, we'll convert to a basic ODT structure
    const filename = config.filename || `document-${Date.now()}.odt`;
    
    throw new Error('ODT export is not yet implemented. Please use DOCX format instead.');
  }

  /**
   * Export to Google Docs with collaboration features
   */
  private async exportToGoogleDocs(content: string, config: ExportConfig): Promise<ExportResult> {
    this._exportProgress.set({
      stage: 'uploading',
      progress: 25,
      message: 'Uploading to Google Docs...'
    });

    // This would require Google Docs API integration
    const filename = config.filename || `Document ${new Date().toLocaleDateString()}`;
    
    // Placeholder implementation - would need actual Google APIs
    throw new Error('Google Docs integration requires API setup and authentication.');
  }

  /**
   * Export to Markdown format
   */
  private async exportToMarkdown(content: string, config: ExportConfig): Promise<ExportResult> {
    const filename = config.filename || `document-${Date.now()}.md`;
    
    // Convert HTML to Markdown
    const { default: TurndownService } = await import('turndown');
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    
    const markdownContent = turndownService.turndown(content);

    // Create download
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    const result: ExportResult = {
      success: true,
      format: ExportFormat.MARKDOWN,
      filename,
      size: markdownContent.length,
      downloadUrl: url
    };

    this._lastExportResult.set(result);
    return result;
  }

  /**
   * Print the editor content
   */
  async printContent(config?: {
    includeStyles?: boolean;
    pageSize?: string;
    orientation?: string;
  }): Promise<void> {
    const editorState = this.editorStateService.state();
    const content = editorState.content;
    
    // Create print-optimized HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please check popup blockers.');
    }

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Print Document</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            margin: 1in;
            color: #000;
        }
        
        @media print {
            body { margin: 0.5in; }
            .no-print { display: none; }
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #000;
            page-break-after: avoid;
        }
        
        p {
            page-break-inside: avoid;
            orphans: 2;
            widows: 2;
        }
        
        table {
            border-collapse: collapse;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #000;
            padding: 0.5rem;
        }
        
        img {
            max-width: 100%;
            page-break-inside: avoid;
        }
        
        @page {
            size: ${config?.pageSize || 'A4'} ${config?.orientation || 'portrait'};
            margin: 1in;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }

  /**
   * Helper method to add PDF header
   */
  private addPDFHeader(pdf: any, headerContent: string): void {
    pdf.setFontSize(10);
    pdf.text(headerContent, 20, 15);
  }

  /**
   * Helper method to add PDF footer
   */
  private addPDFFooter(pdf: any, footerContent: string, includePageNumbers: boolean): void {
    pdf.setFontSize(10);
    const pageHeight = pdf.internal.pageSize.height;
    
    if (includePageNumbers) {
      pdf.text(`${footerContent} - Page ${pdf.internal.getNumberOfPages()}`, 20, pageHeight - 10);
    } else {
      pdf.text(footerContent, 20, pageHeight - 10);
    }
  }

  /**
   * Convert HTML elements to DOCX paragraphs
   */
  private convertHTMLToDocxParagraphs(element: Element, config: ExportConfig): any[] {
    const paragraphs: any[] = [];
    // This is a simplified implementation
    // A complete implementation would need to handle all HTML elements and their formatting
    
    const textContent = element.textContent || '';
    if (textContent.trim()) {
      const { Paragraph, TextRun } = require('docx');
      paragraphs.push(new Paragraph({
        children: [new TextRun(textContent)]
      }));
    }
    
    return paragraphs;
  }

  /**
   * Cancel current export operation
   */
  cancelExport(): void {
    this._isExporting.set(false);
    this._exportProgress.set(null);
  }

  /**
   * Get available export formats
   */
  getAvailableFormats(): ExportFormat[] {
    return Object.values(ExportFormat);
  }

  /**
   * Get export format display names
   */
  getFormatDisplayName(format: ExportFormat): string {
    const displayNames: Record<ExportFormat, string> = {
      [ExportFormat.PDF]: 'PDF Document',
      [ExportFormat.DOCX]: 'Microsoft Word',
      [ExportFormat.HTML]: 'HTML Document',
      [ExportFormat.TXT]: 'Plain Text',
      [ExportFormat.RTF]: 'Rich Text Format',
      [ExportFormat.ODT]: 'OpenDocument Text',
      [ExportFormat.GOOGLE_DOCS]: 'Google Docs',
      [ExportFormat.MARKDOWN]: 'Markdown'
    };
    
    return displayNames[format] || format;
  }
}