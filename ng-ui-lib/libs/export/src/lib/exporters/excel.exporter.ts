import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ExportConfig, ExportResult, ExcelSheetConfig, ExcelColumnConfig } from '../interfaces';
import { ProgressTrackingService } from '../services/progress-tracking.service';

// Type definitions for XLSX library
declare global {
  interface Window {
    XLSX: any;
  }
}

/**
 * Excel Export Templates
 */
export interface ExcelTemplate {
  name: string;
  type: 'grid' | 'editor' | 'chart' | 'custom';
  workbook: {
    properties: {
      title: string;
      subject: string;
      creator: string;
    };
    views: any[];
  };
  defaultSheet: {
    name: string;
    properties: any;
    columnWidths: number[];
    headerStyle: any;
    dataStyle: any;
    alternatingRowStyle: any;
  };
  formatting: {
    dateFormat: string;
    numberFormat: string;
    currencyFormat: string;
    percentageFormat: string;
  };
}

/**
 * Excel Exporter Service
 * 
 * Handles Excel export using SheetJS (xlsx) library
 */
@Injectable({
  providedIn: 'root'
})
export class ExcelExporter {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly progressService = inject(ProgressTrackingService);

  private XLSX: any = null;
  private libraryLoaded = false;

  // Built-in templates
  private readonly templates: Record<string, ExcelTemplate> = {
    grid: {
      name: 'Grid Template',
      type: 'grid',
      workbook: {
        properties: {
          title: 'Grid Data Export',
          subject: 'Data export from grid component',
          creator: 'NG-UI Export Service'
        },
        views: [{ RTL: false }]
      },
      defaultSheet: {
        name: 'Grid Data',
        properties: { tabColor: { rgb: 'FF4472C4' } },
        columnWidths: [],
        headerStyle: {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '4472C4' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        },
        dataStyle: {
          font: { color: { rgb: '000000' } },
          fill: { fgColor: { rgb: 'FFFFFF' } },
          alignment: { horizontal: 'left', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } }
          }
        },
        alternatingRowStyle: {
          fill: { fgColor: { rgb: 'F8F9FA' } }
        }
      },
      formatting: {
        dateFormat: 'mm/dd/yyyy',
        numberFormat: '#,##0.00',
        currencyFormat: '$#,##0.00',
        percentageFormat: '0.00%'
      }
    },
    editor: {
      name: 'Editor Template',
      type: 'editor',
      workbook: {
        properties: {
          title: 'Editor Content Export',
          subject: 'Content export from editor component',
          creator: 'NG-UI Export Service'
        },
        views: [{ RTL: false }]
      },
      defaultSheet: {
        name: 'Content',
        properties: { tabColor: { rgb: 'FF70AD47' } },
        columnWidths: [50],
        headerStyle: {
          font: { bold: true, size: 14, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '70AD47' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        },
        dataStyle: {
          font: { size: 11, color: { rgb: '000000' } },
          alignment: { horizontal: 'left', vertical: 'top', wrapText: true }
        },
        alternatingRowStyle: {
          fill: { fgColor: { rgb: 'F2F2F2' } }
        }
      },
      formatting: {
        dateFormat: 'mm/dd/yyyy hh:mm',
        numberFormat: '#,##0',
        currencyFormat: '$#,##0.00',
        percentageFormat: '0.0%'
      }
    },
    chart: {
      name: 'Chart Template',
      type: 'chart',
      workbook: {
        properties: {
          title: 'Chart Data Export',
          subject: 'Data export from chart component',
          creator: 'NG-UI Export Service'
        },
        views: [{ RTL: false }]
      },
      defaultSheet: {
        name: 'Chart Data',
        properties: { tabColor: { rgb: 'FFED7D31' } },
        columnWidths: [20, 15],
        headerStyle: {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: 'ED7D31' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        },
        dataStyle: {
          font: { color: { rgb: '000000' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        },
        alternatingRowStyle: {
          fill: { fgColor: { rgb: 'FDF2E9' } }
        }
      },
      formatting: {
        dateFormat: 'mm/dd/yyyy',
        numberFormat: '#,##0.0',
        currencyFormat: '$#,##0.00',
        percentageFormat: '0.00%'
      }
    }
  };

  /**
   * Export data to Excel
   */
  export(config: ExportConfig): Observable<ExportResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Excel export is only supported in browser environment'));
    }

    this.progressService.startProgress('excel-export', 'Loading Excel library');

    return this.loadLibrary().pipe(
      switchMap(() => {
        this.progressService.updateProgress('excel-export', 25, 'Processing data for Excel');
        
        try {
          const workbook = this.createWorkbook(config);
          this.progressService.updateProgress('excel-export', 75, 'Generating Excel file');
          
          const excelData = this.writeWorkbook(workbook, config);
          const blob = new Blob([excelData], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          
          this.progressService.completeProgress('excel-export');
          
          return from(Promise.resolve({
            success: true,
            data: blob,
            size: blob.size,
            metadata: {
              format: 'excel',
              sheets: workbook.SheetNames.length,
              template: config.template?.name
            }
          } as ExportResult));
        } catch (error) {
          return throwError(() => error);
        }
      })
    );
  }

  /**
   * Create Excel workbook from configuration
   */
  private createWorkbook(config: ExportConfig): any {
    const template = this.getTemplate(config);
    const workbook = this.XLSX.utils.book_new();

    // Set workbook properties
    workbook.Props = {
      Title: template.workbook.properties.title,
      Subject: template.workbook.properties.subject,
      Author: template.workbook.properties.creator,
      CreatedDate: new Date()
    };

    if (config.sheets && Array.isArray(config.sheets)) {
      // Multiple sheets
      config.sheets.forEach((sheetConfig, index) => {
        const worksheet = this.createWorksheet(sheetConfig.data, template, sheetConfig);
        const sheetName = sheetConfig.name || `Sheet${index + 1}`;
        this.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });
    } else {
      // Single sheet
      const data = this.normalizeData(config.data);
      const worksheet = this.createWorksheet(data, template);
      const sheetName = config.sheetName || template.defaultSheet.name;
      this.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    return workbook;
  }

  /**
   * Create worksheet from data
   */
  private createWorksheet(data: any[], template: ExcelTemplate, sheetConfig?: ExcelSheetConfig): any {
    if (!Array.isArray(data) || data.length === 0) {
      return this.XLSX.utils.aoa_to_sheet([['No data available']]);
    }

    // Convert data to array of arrays format
    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(header => item[header]));
    const sheetData = [headers, ...rows];

    // Create worksheet
    const worksheet = this.XLSX.utils.aoa_to_sheet(sheetData);

    // Apply styling and formatting
    this.applyWorksheetFormatting(worksheet, template, sheetConfig);
    this.setColumnWidths(worksheet, template, headers);
    this.applyDataFormatting(worksheet, data, template);

    // Add conditional formatting if specified
    if (config.conditionalFormatting && Array.isArray(config.conditionalFormatting)) {
      this.applyConditionalFormatting(worksheet, config.conditionalFormatting);
    }

    // Set print settings
    worksheet['!margins'] = {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    };

    return worksheet;
  }

  /**
   * Apply worksheet formatting
   */
  private applyWorksheetFormatting(worksheet: any, template: ExcelTemplate, sheetConfig?: ExcelSheetConfig): void {
    const range = this.XLSX.utils.decode_range(worksheet['!ref']);
    
    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
        const cellAddress = this.XLSX.utils.encode_cell({ r: rowNum, c: colNum });
        const cell = worksheet[cellAddress];
        
        if (!cell) continue;

        // Apply header style
        if (rowNum === 0) {
          cell.s = { ...template.defaultSheet.headerStyle };
        } else {
          // Apply data style
          const isAlternatingRow = rowNum % 2 === 0;
          cell.s = {
            ...template.defaultSheet.dataStyle,
            ...(isAlternatingRow ? template.defaultSheet.alternatingRowStyle : {})
          };
        }
      }
    }
  }

  /**
   * Set column widths
   */
  private setColumnWidths(worksheet: any, template: ExcelTemplate, headers: string[]): void {
    const colWidths: any[] = [];

    headers.forEach((header, index) => {
      let width = template.defaultSheet.columnWidths[index];
      
      if (!width) {
        // Auto-calculate width based on header length and data
        const headerLength = header.length;
        width = Math.max(10, Math.min(50, headerLength * 1.2));
      }

      colWidths.push({ wch: width });
    });

    worksheet['!cols'] = colWidths;
  }

  /**
   * Apply data type formatting
   */
  private applyDataFormatting(worksheet: any, data: any[], template: ExcelTemplate): void {
    const range = this.XLSX.utils.decode_range(worksheet['!ref']);
    const headers = Object.keys(data[0] || {});

    for (let rowNum = 1; rowNum <= range.e.r; rowNum++) {
      for (let colNum = 0; colNum <= range.e.c; colNum++) {
        const cellAddress = this.XLSX.utils.encode_cell({ r: rowNum, c: colNum });
        const cell = worksheet[cellAddress];
        
        if (!cell) continue;

        const header = headers[colNum];
        const value = data[rowNum - 1]?.[header];

        // Apply format based on data type
        if (value instanceof Date) {
          cell.t = 'd';
          cell.z = template.formatting.dateFormat;
        } else if (typeof value === 'number') {
          cell.t = 'n';
          
          // Detect currency values
          if (header.toLowerCase().includes('price') || 
              header.toLowerCase().includes('cost') || 
              header.toLowerCase().includes('amount')) {
            cell.z = template.formatting.currencyFormat;
          }
          // Detect percentage values
          else if (header.toLowerCase().includes('percent') || 
                   header.toLowerCase().includes('rate') || 
                   (typeof value === 'number' && value <= 1 && value >= 0)) {
            cell.z = template.formatting.percentageFormat;
          }
          // Default number format
          else {
            cell.z = template.formatting.numberFormat;
          }
        } else if (typeof value === 'boolean') {
          cell.t = 'b';
        } else {
          cell.t = 's';
        }
      }
    }
  }

  /**
   * Apply conditional formatting
   */
  private applyConditionalFormatting(worksheet: any, rules: any[]): void {
    // Note: SheetJS has limited support for conditional formatting
    // This would typically be implemented with more advanced libraries like ExcelJS
    console.log('Conditional formatting rules:', rules);
    // Implementation would depend on the specific conditional formatting requirements
  }

  /**
   * Write workbook to binary data
   */
  private writeWorkbook(workbook: any, config: ExportConfig): ArrayBuffer {
    const writeOptions = {
      bookType: 'xlsx' as any,
      type: 'array' as any,
      compression: config.compression !== 'none'
    };

    return this.XLSX.write(workbook, writeOptions);
  }

  /**
   * Normalize data for Excel export
   */
  private normalizeData(data: any): any[] {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data;
    }

    if (typeof data === 'object' && data.sheets) {
      // Return data from first sheet
      return data.sheets[0]?.data || [];
    }

    if (typeof data === 'object') {
      return [data];
    }

    return [{ value: data }];
  }

  /**
   * Get template for Excel generation
   */
  private getTemplate(config: ExportConfig): ExcelTemplate {
    if (config.template && config.template.name && this.templates[config.template.name]) {
      return this.templates[config.template.name];
    }

    // Determine template based on data structure
    if (Array.isArray(config.data) && config.data.length > 0) {
      if (typeof config.data[0] === 'object' && Object.keys(config.data[0]).length > 5) {
        return this.templates.grid; // Many columns - use grid template
      }
    }

    if (config.sheets && config.sheets.length > 1) {
      return this.templates.grid; // Multiple sheets - use grid template
    }

    return this.templates.grid; // Default
  }

  /**
   * Load XLSX library dynamically
   */
  private loadLibrary(): Observable<boolean> {
    if (this.libraryLoaded && this.XLSX) {
      return from(Promise.resolve(true));
    }

    return from(this.loadLibraryAsync());
  }

  private async loadLibraryAsync(): Promise<boolean> {
    try {
      if (!this.XLSX && !window.XLSX) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        this.XLSX = window.XLSX;
      } else {
        this.XLSX = window.XLSX;
      }

      this.libraryLoaded = true;
      return true;
    } catch (error) {
      throw new Error(`Failed to load Excel library: ${error}`);
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
   * Create chart in Excel (placeholder implementation)
   */
  createChart(worksheet: any, chartConfig: any): void {
    // Note: Full chart creation would require a more advanced library like ExcelJS
    // This is a placeholder for future implementation
    console.log('Chart configuration:', chartConfig);
    
    // Add a comment to indicate chart location
    const chartCell = worksheet['A1'];
    if (chartCell) {
      chartCell.c = chartCell.c || [];
      chartCell.c.push({
        a: 'System',
        t: `Chart: ${chartConfig.title}`,
        r: new Date().toISOString(),
        T: true
      });
    }
  }

  /**
   * Freeze panes in worksheet
   */
  freezePanes(worksheet: any, row: number, column: number): void {
    worksheet['!freeze'] = {
      xSplit: column - 1,
      ySplit: row - 1,
      topLeftCell: this.XLSX.utils.encode_cell({ r: row, c: column }),
      state: 'frozen'
    };
  }

  /**
   * Add data validation to cells
   */
  addDataValidation(worksheet: any, range: string, validation: any): void {
    if (!worksheet['!dataValidation']) {
      worksheet['!dataValidation'] = [];
    }

    worksheet['!dataValidation'].push({
      sqref: range,
      ...validation
    });
  }

  /**
   * Merge cells in worksheet
   */
  mergeCells(worksheet: any, range: string): void {
    if (!worksheet['!merges']) {
      worksheet['!merges'] = [];
    }

    const decodedRange = this.XLSX.utils.decode_range(range);
    worksheet['!merges'].push(decodedRange);
  }

  /**
   * Add formula to cell
   */
  addFormula(worksheet: any, cellAddress: string, formula: string): void {
    if (!worksheet[cellAddress]) {
      worksheet[cellAddress] = {};
    }

    worksheet[cellAddress].f = formula;
    worksheet[cellAddress].t = 'n'; // Assume numeric result
  }
}