import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ExportConfig, ExportResult } from '../interfaces';
import { ProgressTrackingService } from '../services/progress-tracking.service';

// Type definitions for docx library
declare global {
  interface Window {
    docx: any;
  }
}

/**
 * Word Document Template
 */
export interface WordTemplate {
  name: string;
  type: 'editor' | 'grid' | 'chart' | 'custom';
  document: {
    properties: {
      title: string;
      subject: string;
      creator: string;
      description: string;
    };
    styles: {
      default: any;
      heading1: any;
      heading2: any;
      normal: any;
    };
    sections: {
      orientation: 'portrait' | 'landscape';
      margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
      headers: boolean;
      footers: boolean;
    };
  };
}

/**
 * Word Exporter Service
 * 
 * Handles Word document export using docx library
 */
@Injectable({
  providedIn: 'root'
})
export class WordExporter {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly progressService = inject(ProgressTrackingService);

  private docx: any = null;
  private libraryLoaded = false;

  // Built-in templates
  private readonly templates: Record<string, WordTemplate> = {
    editor: {
      name: 'Editor Template',
      type: 'editor',
      document: {
        properties: {
          title: 'Editor Content Export',
          subject: 'Content exported from editor',
          creator: 'NG-UI Export Service',
          description: 'Document content from rich text editor'
        },
        styles: {
          default: {
            document: {
              run: {
                font: 'Calibri',
                size: 22
              }
            }
          },
          heading1: {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            next: 'Normal',
            run: {
              size: 32,
              bold: true,
              color: '2E74B5'
            },
            paragraph: {
              spacing: { after: 120 }
            }
          },
          heading2: {
            id: 'Heading2',
            name: 'Heading 2',
            basedOn: 'Normal',
            next: 'Normal',
            run: {
              size: 26,
              bold: true,
              color: '2E74B5'
            },
            paragraph: {
              spacing: { after: 100 }
            }
          },
          normal: {
            id: 'Normal',
            name: 'Normal',
            run: {
              font: 'Calibri',
              size: 22
            },
            paragraph: {
              spacing: { after: 100 }
            }
          }
        },
        sections: {
          orientation: 'portrait',
          margins: {
            top: 1440, // 1 inch in twips
            right: 1440,
            bottom: 1440,
            left: 1440
          },
          headers: true,
          footers: true
        }
      }
    },
    grid: {
      name: 'Grid Template',
      type: 'grid',
      document: {
        properties: {
          title: 'Data Grid Export',
          subject: 'Tabular data export',
          creator: 'NG-UI Export Service',
          description: 'Data exported from grid component'
        },
        styles: {
          default: {
            document: {
              run: {
                font: 'Calibri',
                size: 20
              }
            }
          },
          heading1: {
            id: 'Heading1',
            name: 'Heading 1',
            run: {
              size: 28,
              bold: true,
              color: '1F4E79'
            },
            paragraph: {
              spacing: { after: 120 }
            }
          },
          heading2: {
            id: 'Heading2',
            name: 'Heading 2',
            run: {
              size: 24,
              bold: true,
              color: '1F4E79'
            }
          },
          normal: {
            id: 'Normal',
            name: 'Normal',
            run: {
              font: 'Calibri',
              size: 20
            }
          }
        },
        sections: {
          orientation: 'landscape',
          margins: {
            top: 720,  // 0.5 inch
            right: 720,
            bottom: 720,
            left: 720
          },
          headers: true,
          footers: true
        }
      }
    },
    chart: {
      name: 'Chart Template',
      type: 'chart',
      document: {
        properties: {
          title: 'Chart Data Export',
          subject: 'Chart and visualization data',
          creator: 'NG-UI Export Service',
          description: 'Charts and data visualizations'
        },
        styles: {
          default: {
            document: {
              run: {
                font: 'Calibri',
                size: 22
              }
            }
          },
          heading1: {
            id: 'Heading1',
            name: 'Heading 1',
            run: {
              size: 30,
              bold: true,
              color: 'E36C09'
            }
          },
          heading2: {
            id: 'Heading2',
            name: 'Heading 2',
            run: {
              size: 26,
              bold: true,
              color: 'E36C09'
            }
          },
          normal: {
            id: 'Normal',
            name: 'Normal',
            run: {
              font: 'Calibri',
              size: 22
            }
          }
        },
        sections: {
          orientation: 'portrait',
          margins: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          },
          headers: true,
          footers: true
        }
      }
    }
  };

  /**
   * Export data to Word document
   */
  export(config: ExportConfig): Observable<ExportResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Word export is only supported in browser environment'));
    }

    this.progressService.startProgress('word-export', 'Loading Word document library');

    return this.loadLibrary().pipe(
      switchMap(() => {
        this.progressService.updateProgress('word-export', 25, 'Creating Word document');
        
        try {
          const document = this.createDocument(config);
          this.progressService.updateProgress('word-export', 75, 'Generating Word file');
          
          const wordData = this.writeDocument(document);
          const blob = new Blob([wordData], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          });
          
          this.progressService.completeProgress('word-export');
          
          return from(Promise.resolve({
            success: true,
            data: blob,
            size: blob.size,
            metadata: {
              format: 'word',
              template: config.template?.name,
              pageCount: this.estimatePageCount(config.data)
            }
          } as ExportResult));
        } catch (error) {
          return throwError(() => error);
        }
      })
    );
  }

  /**
   * Create Word document from configuration
   */
  private createDocument(config: ExportConfig): any {
    const template = this.getTemplate(config);
    
    // Create document with template settings
    const document = new this.docx.Document({
      creator: template.document.properties.creator,
      title: config.filename || template.document.properties.title,
      subject: template.document.properties.subject,
      description: template.document.properties.description,
      styles: template.document.styles,
      sections: [
        {
          properties: {
            page: {
              margin: template.document.sections.margins,
              size: {
                orientation: template.document.sections.orientation
              }
            }
          },
          headers: template.document.sections.headers ? this.createHeaders(config, template) : {},
          footers: template.document.sections.footers ? this.createFooters(config, template) : {},
          children: this.createContent(config, template)
        }
      ]
    });

    return document;
  }

  /**
   * Create document content based on data type
   */
  private createContent(config: ExportConfig, template: WordTemplate): any[] {
    const content: any[] = [];

    // Add title if specified
    if (config.filename || config.header) {
      content.push(
        new this.docx.Paragraph({
          text: config.header || config.filename || 'Document Export',
          heading: 'Heading1',
          alignment: this.docx.AlignmentType.CENTER
        }),
        new this.docx.Paragraph({
          children: [new this.docx.TextRun({
            text: `Generated on: ${new Date().toLocaleString()}`,
            italics: true
          })],
          alignment: this.docx.AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    // Process data based on type
    if (Array.isArray(config.data)) {
      content.push(...this.createTableContent(config.data));
    } else if (typeof config.data === 'object' && config.data !== null) {
      content.push(...this.createObjectContent(config.data));
    } else if (typeof config.data === 'string') {
      content.push(...this.createTextContent(config.data));
    } else {
      content.push(
        new this.docx.Paragraph({
          children: [new this.docx.TextRun({
            text: String(config.data)
          })]
        })
      );
    }

    return content;
  }

  /**
   * Create table content from array data
   */
  private createTableContent(data: any[]): any[] {
    if (data.length === 0) {
      return [
        new this.docx.Paragraph({
          children: [new this.docx.TextRun({
            text: 'No data available',
            italics: true
          })]
        })
      ];
    }

    const content: any[] = [];

    // Add section header
    content.push(
      new this.docx.Paragraph({
        text: 'Data Table',
        heading: 'Heading2',
        spacing: { before: 400, after: 200 }
      })
    );

    if (typeof data[0] === 'object' && data[0] !== null) {
      const headers = Object.keys(data[0]);
      
      // Create table
      const tableRows: any[] = [];

      // Header row
      tableRows.push(
        new this.docx.TableRow({
          children: headers.map(header => 
            new this.docx.TableCell({
              children: [new this.docx.Paragraph({
                children: [new this.docx.TextRun({
                  text: header,
                  bold: true
                })]
              })],
              shading: { fill: 'E1ECFE' }
            })
          )
        })
      );

      // Data rows
      data.forEach((row, index) => {
        tableRows.push(
          new this.docx.TableRow({
            children: headers.map(header => 
              new this.docx.TableCell({
                children: [new this.docx.Paragraph({
                  children: [new this.docx.TextRun({
                    text: this.formatCellValue(row[header])
                  })]
                })],
                shading: index % 2 === 1 ? { fill: 'F8F9FA' } : undefined
              })
            )
          })
        );
      });

      const table = new this.docx.Table({
        rows: tableRows,
        width: {
          size: 100,
          type: this.docx.WidthType.PERCENTAGE
        },
        borders: {
          top: { style: this.docx.BorderStyle.SINGLE, size: 1 },
          bottom: { style: this.docx.BorderStyle.SINGLE, size: 1 },
          left: { style: this.docx.BorderStyle.SINGLE, size: 1 },
          right: { style: this.docx.BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: this.docx.BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: this.docx.BorderStyle.SINGLE, size: 1 }
        }
      });

      content.push(table);
    } else {
      // Simple list for primitive values
      const listItems = data.map((item, index) => 
        new this.docx.Paragraph({
          children: [new this.docx.TextRun({
            text: `${index + 1}. ${String(item)}`
          })],
          numbering: {
            reference: 'my-numbering',
            level: 0
          }
        })
      );

      content.push(...listItems);
    }

    return content;
  }

  /**
   * Create content from object data
   */
  private createObjectContent(data: any): any[] {
    const content: any[] = [];

    content.push(
      new this.docx.Paragraph({
        text: 'Object Properties',
        heading: 'Heading2',
        spacing: { before: 400, after: 200 }
      })
    );

    Object.entries(data).forEach(([key, value]) => {
      content.push(
        new this.docx.Paragraph({
          children: [
            new this.docx.TextRun({
              text: `${key}: `,
              bold: true
            }),
            new this.docx.TextRun({
              text: this.formatCellValue(value)
            })
          ],
          spacing: { after: 100 }
        })
      );
    });

    return content;
  }

  /**
   * Create content from text data
   */
  private createTextContent(text: string): any[] {
    const content: any[] = [];

    // Split text into paragraphs
    const paragraphs = text.split('\n\n');

    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        content.push(
          new this.docx.Paragraph({
            children: [new this.docx.TextRun({
              text: paragraph.trim()
            })],
            spacing: { after: 200 }
          })
        );
      }
    });

    return content;
  }

  /**
   * Format cell value for Word document
   */
  private formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleString();
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  }

  /**
   * Create document headers
   */
  private createHeaders(config: ExportConfig, template: WordTemplate): any {
    return {
      default: new this.docx.Header({
        children: [
          new this.docx.Paragraph({
            children: [
              new this.docx.TextRun({
                text: config.header || config.filename || template.document.properties.title,
                size: 20
              })
            ],
            alignment: this.docx.AlignmentType.CENTER
          })
        ]
      })
    };
  }

  /**
   * Create document footers
   */
  private createFooters(config: ExportConfig, template: WordTemplate): any {
    return {
      default: new this.docx.Footer({
        children: [
          new this.docx.Paragraph({
            children: [
              new this.docx.TextRun({
                text: `Generated by NG-UI Export Service - Page `,
                size: 16
              }),
              new this.docx.TextRun({
                children: ['PAGE_NUMBER'],
                size: 16
              }),
              new this.docx.TextRun({
                text: ' of ',
                size: 16
              }),
              new this.docx.TextRun({
                children: ['TOTAL_PAGES'],
                size: 16
              })
            ],
            alignment: this.docx.AlignmentType.CENTER
          })
        ]
      })
    };
  }

  /**
   * Write document to array buffer
   */
  private writeDocument(document: any): ArrayBuffer {
    return this.docx.Packer.toBuffer(document);
  }

  /**
   * Get template based on configuration
   */
  private getTemplate(config: ExportConfig): WordTemplate {
    if (config.template && config.template.name && this.templates[config.template.name]) {
      return this.templates[config.template.name];
    }

    // Determine template based on data type
    if (Array.isArray(config.data)) {
      return this.templates.grid;
    }

    return this.templates.editor; // Default
  }

  /**
   * Estimate page count (rough calculation)
   */
  private estimatePageCount(data: any): number {
    if (Array.isArray(data)) {
      // Rough estimate: ~40 rows per page for tables
      return Math.max(1, Math.ceil(data.length / 40));
    }

    if (typeof data === 'string') {
      // Rough estimate: ~500 characters per page
      return Math.max(1, Math.ceil(data.length / 500));
    }

    return 1;
  }

  /**
   * Load docx library dynamically
   */
  private loadLibrary(): Observable<boolean> {
    if (this.libraryLoaded && this.docx) {
      return from(Promise.resolve(true));
    }

    return from(this.loadLibraryAsync());
  }

  private async loadLibraryAsync(): Promise<boolean> {
    try {
      if (!this.docx && !window.docx) {
        await this.loadScript('https://unpkg.com/docx@8.5.0/build/index.js');
        this.docx = window.docx;
      } else {
        this.docx = window.docx;
      }

      this.libraryLoaded = true;
      return true;
    } catch (error) {
      throw new Error(`Failed to load Word document library: ${error}`);
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

  /**
   * Add image to document
   */
  addImage(document: any, imageBuffer: ArrayBuffer, width: number, height: number): any {
    return new this.docx.ImageRun({
      data: imageBuffer,
      transformation: {
        width,
        height
      }
    });
  }

  /**
   * Create bullet list
   */
  createBulletList(items: string[]): any[] {
    return items.map(item => 
      new this.docx.Paragraph({
        children: [new this.docx.TextRun({ text: item })],
        bullet: { level: 0 }
      })
    );
  }

  /**
   * Create numbered list
   */
  createNumberedList(items: string[]): any[] {
    return items.map(item => 
      new this.docx.Paragraph({
        children: [new this.docx.TextRun({ text: item })],
        numbering: { reference: 'my-numbering', level: 0 }
      })
    );
  }
}