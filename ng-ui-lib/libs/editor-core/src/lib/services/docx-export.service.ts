import { Injectable } from '@angular/core';
import { ExportConfig } from './editor-export.service';

/**
 * Word-specific export configuration
 */
export interface DocxExportConfig extends ExportConfig {
  // Document settings
  pageSize?: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Content options
  preserveFormatting?: boolean;
  includeImages?: boolean;
  includeComments?: boolean;
  includeRevisions?: boolean;
  includeStyles?: boolean;
  convertTables?: boolean;
  
  // Document properties
  properties?: {
    title?: string;
    author?: string;
    company?: string;
    subject?: string;
    keywords?: string[];
    description?: string;
    lastModifiedBy?: string;
    revision?: number;
  };
  
  // Headers and footers
  headers?: {
    enabled: boolean;
    content?: string;
    differentFirstPage?: boolean;
    differentOddEven?: boolean;
  };
  
  footers?: {
    enabled: boolean;
    content?: string;
    pageNumbers?: boolean;
    differentFirstPage?: boolean;
    differentOddEven?: boolean;
  };
  
  // Styles and formatting
  defaultFont?: {
    name: string;
    size: number;
  };
  
  styles?: {
    normal?: any;
    heading1?: any;
    heading2?: any;
    heading3?: any;
    heading4?: any;
    heading5?: any;
    heading6?: any;
    quote?: any;
    code?: any;
  };
}

/**
 * HTML element to Word element mapping
 */
interface ElementMapping {
  tag: string;
  style?: any;
  children?: any[];
}

/**
 * Word DOCX Export Service
 * Converts HTML content to Word documents with comprehensive formatting
 */
@Injectable({
  providedIn: 'root'
})
export class DocxExportService {
  
  /**
   * Export content to Word DOCX format
   */
  async exportToDocx(content: string, config: DocxExportConfig): Promise<Blob> {
    // Import docx library
    const { 
      Document, 
      Packer, 
      Paragraph, 
      TextRun, 
      HeadingLevel, 
      Table, 
      TableRow, 
      TableCell,
      Media,
      Header,
      Footer,
      PageBreak,
      ImageRun,
      AlignmentType,
      UnderlineType,
      BorderStyle,
      SectionType,
      PageNumber,
      PageNumberFormat
    } = await import('docx');
    
    // Parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Process content and convert to Word elements
    const sections = await this.processContentForDocx(doc.body, config);
    
    // Create Word document
    const wordDoc = new Document({
      properties: this.createDocumentProperties(config),
      sections: [
        {
          properties: {
            page: {
              size: this.getPageSize(config.pageSize || 'A4'),
              margin: this.getPageMargins(config.margins),
              orientation: config.orientation === 'landscape' ? 
                PageOrientationType.LANDSCAPE : PageOrientationType.PORTRAIT
            }
          },
          headers: config.headers?.enabled ? {
            default: new Header({
              children: [
                new Paragraph({
                  children: [new TextRun(config.headers.content || '')],
                  alignment: AlignmentType.CENTER
                })
              ]
            })
          } : undefined,
          footers: config.footers?.enabled ? {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun(config.footers.content || ''),
                    ...(config.footers.pageNumbers ? [
                      new TextRun(' - Page '),
                      new PageNumber()
                    ] : [])
                  ],
                  alignment: AlignmentType.CENTER
                })
              ]
            })
          } : undefined,
          children: sections
        }
      ]
    });
    
    // Generate and return blob
    return await Packer.toBlob(wordDoc);
  }
  
  /**
   * Process HTML content and convert to Word elements
   */
  private async processContentForDocx(element: Element, config: DocxExportConfig): Promise<any[]> {
    const elements: any[] = [];
    
    for (const child of Array.from(element.children)) {
      const wordElement = await this.convertElementToWord(child, config);
      if (wordElement) {
        if (Array.isArray(wordElement)) {
          elements.push(...wordElement);
        } else {
          elements.push(wordElement);
        }
      }
    }
    
    return elements;
  }
  
  /**
   * Convert HTML element to Word element
   */
  private async convertElementToWord(element: Element, config: DocxExportConfig): Promise<any | any[] | null> {
    const { 
      Paragraph, 
      TextRun, 
      HeadingLevel, 
      Table, 
      TableRow, 
      TableCell,
      ImageRun,
      AlignmentType,
      UnderlineType,
      PageBreak
    } = await import('docx');
    
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent || '';
    
    switch (tagName) {
      case 'h1':
        return new Paragraph({
          text: textContent,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        });
        
      case 'h2':
        return new Paragraph({
          text: textContent,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        });
        
      case 'h3':
        return new Paragraph({
          text: textContent,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 }
        });
        
      case 'h4':
        return new Paragraph({
          text: textContent,
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 140, after: 70 }
        });
        
      case 'h5':
        return new Paragraph({
          text: textContent,
          heading: HeadingLevel.HEADING_5,
          spacing: { before: 120, after: 60 }
        });
        
      case 'h6':
        return new Paragraph({
          text: textContent,
          heading: HeadingLevel.HEADING_6,
          spacing: { before: 100, after: 50 }
        });
        
      case 'p':
        const textRuns = await this.processInlineElements(element, config);
        return new Paragraph({
          children: textRuns.length > 0 ? textRuns : [new TextRun(textContent)],
          spacing: { after: 120 }
        });
        
      case 'blockquote':
        const quoteRuns = await this.processInlineElements(element, config);
        return new Paragraph({
          children: quoteRuns.length > 0 ? quoteRuns : [new TextRun(textContent)],
          indent: { left: 720 },
          border: {
            left: {
              color: '999999',
              size: 6,
              style: BorderStyle.SINGLE
            }
          },
          spacing: { after: 120 }
        });
        
      case 'ul':
      case 'ol':
        return await this.convertList(element, config, tagName === 'ol');
        
      case 'table':
        return await this.convertTable(element, config);
        
      case 'img':
        return await this.convertImage(element, config);
        
      case 'br':
        return new Paragraph({
          children: [new TextRun('')],
          spacing: { after: 60 }
        });
        
      case 'hr':
        return new Paragraph({
          children: [new TextRun('')],
          border: {
            bottom: {
              color: '000000',
              size: 6,
              style: BorderStyle.SINGLE
            }
          },
          spacing: { after: 120 }
        });
        
      case 'pre':
      case 'code':
        return new Paragraph({
          children: [
            new TextRun({
              text: textContent,
              font: 'Courier New',
              size: 20
            })
          ],
          shading: {
            fill: 'F5F5F5'
          },
          spacing: { after: 120 }
        });
        
      case 'div':
        // Process div children
        const divElements = await this.processContentForDocx(element, config);
        return divElements;
        
      default:
        // For unknown elements, process children or return text
        if (element.children.length > 0) {
          return await this.processContentForDocx(element, config);
        } else if (textContent.trim()) {
          return new Paragraph({
            children: [new TextRun(textContent)],
            spacing: { after: 120 }
          });
        }
        return null;
    }
  }
  
  /**
   * Process inline elements within a paragraph
   */
  private async processInlineElements(element: Element, config: DocxExportConfig): Promise<any[]> {
    const { TextRun, UnderlineType } = await import('docx');
    const textRuns: any[] = [];
    
    const processNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text.trim()) {
          textRuns.push(new TextRun(text));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent || '';
        
        if (text.trim()) {
          let textRun: any;
          
          switch (tagName) {
            case 'strong':
            case 'b':
              textRun = new TextRun({
                text,
                bold: true
              });
              break;
              
            case 'em':
            case 'i':
              textRun = new TextRun({
                text,
                italics: true
              });
              break;
              
            case 'u':
              textRun = new TextRun({
                text,
                underline: {
                  type: UnderlineType.SINGLE
                }
              });
              break;
              
            case 'mark':
              textRun = new TextRun({
                text,
                highlight: 'yellow'
              });
              break;
              
            case 'code':
              textRun = new TextRun({
                text,
                font: 'Courier New',
                size: 20,
                shading: {
                  fill: 'F5F5F5'
                }
              });
              break;
              
            case 'a':
              // For links, just preserve the text for now
              // Full hyperlink support would require additional setup
              textRun = new TextRun({
                text,
                color: '0000FF',
                underline: {
                  type: UnderlineType.SINGLE
                }
              });
              break;
              
            default:
              textRun = new TextRun(text);
          }
          
          textRuns.push(textRun);
        }
      }
    };
    
    for (const child of Array.from(element.childNodes)) {
      processNode(child);
    }
    
    return textRuns;
  }
  
  /**
   * Convert HTML list to Word list
   */
  private async convertList(element: Element, config: DocxExportConfig, ordered: boolean): Promise<any[]> {
    const { Paragraph, TextRun } = await import('docx');
    const paragraphs: any[] = [];
    
    const listItems = element.querySelectorAll('li');
    listItems.forEach((li, index) => {
      const text = li.textContent || '';
      const bullet = ordered ? `${index + 1}.` : '•';
      
      paragraphs.push(new Paragraph({
        children: [new TextRun(`${bullet} ${text}`)],
        indent: { left: 360 },
        spacing: { after: 60 }
      }));
    });
    
    return paragraphs;
  }
  
  /**
   * Convert HTML table to Word table
   */
  private async convertTable(element: Element, config: DocxExportConfig): Promise<any> {
    const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = await import('docx');
    
    const rows: any[] = [];
    const tableRows = element.querySelectorAll('tr');
    
    tableRows.forEach(tr => {
      const cells: any[] = [];
      const tableCells = tr.querySelectorAll('th, td');
      
      tableCells.forEach(cell => {
        const text = cell.textContent || '';
        const isHeader = cell.tagName.toLowerCase() === 'th';
        
        cells.push(new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  bold: isHeader
                })
              ]
            })
          ],
          shading: isHeader ? {
            fill: 'F2F2F2'
          } : undefined
        }));
      });
      
      if (cells.length > 0) {
        rows.push(new TableRow({
          children: cells
        }));
      }
    });
    
    return new Table({
      rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      }
    });
  }
  
  /**
   * Convert HTML image to Word image
   */
  private async convertImage(element: Element, config: DocxExportConfig): Promise<any | null> {
    if (!config.includeImages) {
      return null;
    }
    
    const { Paragraph, ImageRun, Media } = await import('docx');
    const img = element as HTMLImageElement;
    
    try {
      // Convert image to blob
      const response = await fetch(img.src);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      // Create image run
      const image = Media.addImage(
        new Uint8Array(arrayBuffer),
        {
          width: Math.min(img.width || 400, 600),
          height: Math.min(img.height || 300, 400)
        }
      );
      
      return new Paragraph({
        children: [new ImageRun(image)],
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 }
      });
      
    } catch (error) {
      console.warn('Failed to convert image:', error);
      // Return placeholder text if image conversion fails
      return new Paragraph({
        children: [new TextRun(`[Image: ${img.alt || 'Image'}]`)],
        spacing: { after: 120 }
      });
    }
  }
  
  /**
   * Create document properties
   */
  private createDocumentProperties(config: DocxExportConfig): any {
    const properties = config.properties || {};
    
    return {
      title: properties.title || 'Document',
      author: properties.author || 'Editor User',
      company: properties.company || '',
      subject: properties.subject || '',
      keywords: properties.keywords?.join(', ') || '',
      description: properties.description || '',
      lastModifiedBy: properties.lastModifiedBy || properties.author || 'Editor User',
      revision: properties.revision || 1,
      createdAt: new Date(),
      lastModifiedAt: new Date()
    };
  }
  
  /**
   * Get page size configuration
   */
  private getPageSize(pageSize: string): any {
    const { PageSize } = require('docx');
    
    switch (pageSize) {
      case 'Letter':
        return PageSize.LETTER;
      case 'Legal':
        return PageSize.LEGAL;
      case 'A3':
        return PageSize.A3;
      case 'A4':
      default:
        return PageSize.A4;
    }
  }
  
  /**
   * Get page margins
   */
  private getPageMargins(margins?: any): any {
    const defaultMargins = { top: 20, right: 20, bottom: 20, left: 20 };
    const m = margins || defaultMargins;
    
    // Convert mm to twips (1 mm = 56.7 twips)
    return {
      top: m.top * 56.7,
      right: m.right * 56.7,
      bottom: m.bottom * 56.7,
      left: m.left * 56.7
    };
  }
  
  /**
   * Add tracked changes support (if enabled)
   */
  private addTrackedChanges(config: DocxExportConfig): any {
    if (!config.includeRevisions) {
      return undefined;
    }
    
    // This would require more complex implementation
    // For now, we'll return a basic structure
    return {
      trackRevisions: true
    };
  }
  
  /**
   * Add comments support (if enabled)
   */
  private addComments(element: Element, config: DocxExportConfig): any[] {
    if (!config.includeComments) {
      return [];
    }
    
    // Extract comments from data attributes or special elements
    const comments: any[] = [];
    const commentElements = element.querySelectorAll('[data-comment]');
    
    commentElements.forEach((el, index) => {
      const commentText = el.getAttribute('data-comment');
      if (commentText) {
        // This is a simplified comment structure
        // Full implementation would require proper comment ID handling
        comments.push({
          id: `comment-${index}`,
          author: 'Reviewer',
          date: new Date(),
          text: commentText
        });
      }
    });
    
    return comments;
  }
  
  /**
   * Apply custom styles if provided
   */
  private applyCustomStyles(config: DocxExportConfig): any {
    if (!config.styles) {
      return undefined;
    }
    
    // This would require implementing custom style definitions
    // For now, we'll use default styles
    return {
      default: {
        document: {
          run: {
            font: config.defaultFont?.name || 'Times New Roman',
            size: (config.defaultFont?.size || 12) * 2 // Word uses half-points
          }
        }
      }
    };
  }
}