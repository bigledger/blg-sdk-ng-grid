import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  ExportData,
  ExportColumn,
  ExportMetadata,
  ExportOptions,
  CsvExportOptions,
  ExcelExportOptions,
  ExcelCellStyle,
  PdfExportOptions,
  GoogleSheetsOptions,
  ExportTemplate,
  AdvancedExportOptions
} from '../interfaces/export.interface';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { GroupedRow } from '../interfaces/grouping.interface';

/**
 * Service for exporting grid data to various formats
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {

  // Built-in export templates
  private readonly templates: ExportTemplate[] = [
    {
      id: 'default',
      name: 'Default',
      description: 'Simple export with standard formatting',
      supportedFormats: ['csv', 'excel', 'pdf'],
      config: {
        header: { enabled: false, content: '' },
        footer: { enabled: false, content: '' },
        rowStyling: { alternateRows: false }
      }
    },
    {
      id: 'report',
      name: 'Professional Report',
      description: 'Formatted report with headers and branding',
      supportedFormats: ['excel', 'pdf'],
      config: {
        header: { 
          enabled: true, 
          content: 'Data Export Report', 
          height: 60,
          style: { fontSize: 16, bold: true }
        },
        footer: { 
          enabled: true, 
          content: 'Generated on {{date}}', 
          height: 30 
        },
        rowStyling: { 
          alternateRows: true,
          headerStyle: { bold: true, backgroundColor: '#f0f0f0' }
        }
      }
    },
    {
      id: 'invoice',
      name: 'Invoice Template',
      description: 'Template optimized for financial data',
      supportedFormats: ['excel', 'pdf'],
      config: {
        header: { 
          enabled: true, 
          content: 'Invoice Report', 
          height: 80 
        },
        columnFormatting: {
          'amount': { format: 'currency', alignment: 'right' },
          'date': { format: 'date', alignment: 'center' },
          'quantity': { format: 'number', alignment: 'right' }
        },
        rowStyling: { 
          alternateRows: true,
          headerStyle: { bold: true, backgroundColor: '#2c3e50', color: '#ffffff' }
        }
      }
    }
  ];

  /**
   * Export data with specified options
   */
  async exportData(
    data: any[],
    columns: ColumnDefinition[],
    options: ExportOptions,
    groupedRows?: GroupedRow[],
    appliedFilters?: { [columnId: string]: any },
    selectedRows?: Set<number>
  ): Promise<void> {
    // Handle selected rows data scope
    let processedData = data;
    if (options.dataScope === 'selected' && selectedRows && selectedRows.size > 0) {
      processedData = data.filter((_, index) => selectedRows.has(index));
    }

    const exportData = this.prepareExportData(processedData, columns, options, groupedRows, appliedFilters);
    
    // Apply progress callback if available
    if (options.advanced?.onProgress) {
      options.advanced.onProgress(10); // Start progress
    }
    
    switch (options.format) {
      case 'csv':
        await this.exportToCsv(exportData, options.formatOptions as CsvExportOptions, options);
        break;
      case 'excel':
        await this.exportToExcel(exportData, options.formatOptions as ExcelExportOptions, options);
        break;
      case 'pdf':
        await this.exportToPdf(exportData, options.formatOptions as PdfExportOptions, options);
        break;
      case 'google-sheets':
        await this.exportToGoogleSheets(exportData, options.formatOptions as GoogleSheetsOptions, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
    
    // Complete progress callback if available
    if (options.advanced?.onProgress) {
      options.advanced.onProgress(100);
    }
  }

  /**
   * Get available export templates
   */
  getTemplates(): ExportTemplate[] {
    return [...this.templates];
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ExportTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  /**
   * Add custom template
   */
  addTemplate(template: ExportTemplate): void {
    const existingIndex = this.templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      this.templates[existingIndex] = template;
    } else {
      this.templates.push(template);
    }
  }

  /**
   * Export to CSV format
   */
  private async exportToCsv(exportData: ExportData, options: CsvExportOptions, exportOptions?: ExportOptions): Promise<void> {
    const { delimiter = ',', qualifier = '"', lineEnding = '\n', includeBom = true } = options;
    
    let csvContent = '';
    
    // Add BOM for UTF-8 if requested
    if (includeBom) {
      csvContent = '\uFEFF';
    }
    
    // Add headers
    if (exportData.headers.length > 0) {
      csvContent += this.formatCsvRow(exportData.headers, delimiter, qualifier) + lineEnding;
    }
    
    // Add data rows
    exportData.rows.forEach(row => {
      csvContent += this.formatCsvRow(row.map(cell => String(cell || '')), delimiter, qualifier) + lineEnding;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const filename = `${exportData.metadata.filename}.csv`;
    saveAs(blob, filename);
  }

  /**
   * Export to Excel format
   */
  private async exportToExcel(exportData: ExportData, options: ExcelExportOptions, exportOptions?: ExportOptions): Promise<void> {
    const {
      sheetName = 'Sheet1',
      autoSizeColumns = true,
      applyBasicStyling = true,
      headerStyle,
      dataStyle,
      multipleSheets
    } = options;

    const workbook = XLSX.utils.book_new();

    if (multipleSheets?.enabled && multipleSheets.groupByColumn) {
      this.createMultipleSheets(workbook, exportData, multipleSheets, options);
    } else {
      this.createSingleSheet(workbook, exportData, sheetName, {
        autoSizeColumns,
        applyBasicStyling,
        ...(headerStyle && { headerStyle }),
        ...(dataStyle && { dataStyle })
      });
    }

    // Write workbook and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `${exportData.metadata.filename}.xlsx`;
    saveAs(blob, filename);
  }

  /**
   * Create a single Excel sheet
   */
  private createSingleSheet(
    workbook: XLSX.WorkBook,
    exportData: ExportData,
    sheetName: string,
    styleOptions: {
      autoSizeColumns: boolean;
      applyBasicStyling: boolean;
      headerStyle?: ExcelCellStyle;
      dataStyle?: ExcelCellStyle;
    }
  ): void {
    const worksheetData: any[][] = [];
    
    // Add headers
    if (exportData.headers.length > 0) {
      worksheetData.push(exportData.headers);
    }
    
    // Add data rows
    worksheetData.push(...exportData.rows);
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Apply styling if requested
    if (styleOptions.applyBasicStyling) {
      this.applyBasicExcelStyling(worksheet, exportData.headers.length > 0, styleOptions);
    }
    
    // Auto-size columns if requested
    if (styleOptions.autoSizeColumns) {
      this.autoSizeColumns(worksheet, exportData.columns);
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  /**
   * Create multiple Excel sheets based on grouping
   */
  private createMultipleSheets(
    workbook: XLSX.WorkBook,
    exportData: ExportData,
    multipleSheets: NonNullable<ExcelExportOptions['multipleSheets']>,
    options: ExcelExportOptions
  ): void {
    const { groupByColumn, sheetNameTemplate = '{groupValue}' } = multipleSheets;
    
    if (!groupByColumn) {
      this.createSingleSheet(workbook, exportData, 'Sheet1', options);
      return;
    }

    const groupColumnIndex = exportData.columns.findIndex(col => col.id === groupByColumn);
    if (groupColumnIndex === -1) {
      this.createSingleSheet(workbook, exportData, 'Sheet1', options);
      return;
    }

    // Group rows by the specified column
    const groupedRows = new Map<string, any[][]>();
    
    exportData.rows.forEach(row => {
      const groupValue = String(row[groupColumnIndex] || 'Empty');
      if (!groupedRows.has(groupValue)) {
        groupedRows.set(groupValue, []);
      }
      groupedRows.get(groupValue)!.push(row);
    });

    // Create a sheet for each group
    groupedRows.forEach((rows, groupValue) => {
      const sheetName = sheetNameTemplate.replace('{groupValue}', groupValue);
      const sheetExportData: ExportData = {
        ...exportData,
        rows,
        metadata: {
          ...exportData.metadata,
          totalRows: rows.length
        }
      };

      this.createSingleSheet(workbook, sheetExportData, sheetName, options);
    });
  }

  /**
   * Apply basic styling to Excel worksheet
   */
  private applyBasicExcelStyling(
    worksheet: XLSX.WorkSheet,
    hasHeaders: boolean,
    styleOptions: {
      headerStyle?: ExcelCellStyle;
      dataStyle?: ExcelCellStyle;
    }
  ): void {
    if (!worksheet['!ref']) return;

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Apply header styling
    if (hasHeaders && styleOptions.headerStyle) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = this.convertToXlsxStyle(styleOptions.headerStyle);
        }
      }
    }

    // Apply data styling
    if (styleOptions.dataStyle) {
      const startRow = hasHeaders ? 1 : 0;
      for (let row = startRow; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (worksheet[cellRef]) {
            worksheet[cellRef].s = this.convertToXlsxStyle(styleOptions.dataStyle);
          }
        }
      }
    }
  }

  /**
   * Auto-size columns in Excel worksheet
   */
  private autoSizeColumns(worksheet: XLSX.WorkSheet, columns: ExportColumn[]): void {
    const colWidths: { wch: number }[] = [];
    
    columns.forEach((column, index) => {
      // Use predefined width or calculate based on header length
      const width = column.width || Math.max(column.header.length, 10);
      colWidths[index] = { wch: width };
    });
    
    worksheet['!cols'] = colWidths;
  }

  /**
   * Convert ExcelCellStyle to XLSX style format
   */
  private convertToXlsxStyle(style: ExcelCellStyle): any {
    const xlsxStyle: any = {};

    if (style.font) {
      xlsxStyle.font = {};
      if (style.font.bold) xlsxStyle.font.bold = true;
      if (style.font.italic) xlsxStyle.font.italic = true;
      if (style.font.color) xlsxStyle.font.color = { rgb: style.font.color.replace('#', '') };
      if (style.font.size) xlsxStyle.font.sz = style.font.size;
    }

    if (style.fill) {
      xlsxStyle.fill = {};
      if (style.fill.fgColor) xlsxStyle.fill.fgColor = { rgb: style.fill.fgColor.replace('#', '') };
      if (style.fill.bgColor) xlsxStyle.fill.bgColor = { rgb: style.fill.bgColor.replace('#', '') };
    }

    if (style.alignment) {
      xlsxStyle.alignment = {};
      if (style.alignment.horizontal) xlsxStyle.alignment.horizontal = style.alignment.horizontal;
      if (style.alignment.vertical) xlsxStyle.alignment.vertical = style.alignment.vertical;
    }

    if (style.border) {
      xlsxStyle.border = {};
      const borderStyle = { style: 'thin', color: { rgb: (style.border.color || '#000000').replace('#', '') } };
      if (style.border.top) xlsxStyle.border.top = borderStyle;
      if (style.border.bottom) xlsxStyle.border.bottom = borderStyle;
      if (style.border.left) xlsxStyle.border.left = borderStyle;
      if (style.border.right) xlsxStyle.border.right = borderStyle;
    }

    return xlsxStyle;
  }

  /**
   * Prepare export data from grid data
   */
  private prepareExportData(
    data: any[],
    columns: ColumnDefinition[],
    options: ExportOptions,
    groupedRows?: GroupedRow[],
    appliedFilters?: { [columnId: string]: any }
  ): ExportData {
    // Determine which columns to include
    const exportColumns = this.getExportColumns(columns, options.includeColumns);
    
    // Prepare headers
    const headers = options.includeHeaders ? exportColumns.map(col => col.header) : [];
    
    // Prepare data rows
    const rows = this.prepareDataRows(data, exportColumns, options, groupedRows);
    
    // Create metadata
    const metadata: ExportMetadata = {
      exportDate: new Date(),
      totalRows: rows.length,
      format: options.format,
      filename: options.filename,
      hasGrouping: !!groupedRows && groupedRows.some(row => row.type === 'group'),
      ...(appliedFilters && { appliedFilters })
    };

    return {
      headers,
      rows,
      columns: exportColumns,
      metadata
    };
  }

  /**
   * Get columns for export
   */
  private getExportColumns(columns: ColumnDefinition[], includeColumns?: string[]): ExportColumn[] {
    let columnsToExport = columns.filter(col => col.visible !== false);
    
    if (includeColumns && includeColumns.length > 0) {
      columnsToExport = columnsToExport.filter(col => includeColumns.includes(col.id));
    }
    
    return columnsToExport.map(col => ({
      id: col.id,
      header: col.header,
      field: col.field,
      type: col.type || 'string',
      ...(col.width && { width: col.width })
    }));
  }

  /**
   * Prepare data rows for export
   */
  private prepareDataRows(
    data: any[],
    exportColumns: ExportColumn[],
    _options: ExportOptions,
    groupedRows?: GroupedRow[]
  ): any[][] {
    if (groupedRows && groupedRows.length > 0) {
      return this.prepareGroupedDataRows(groupedRows, exportColumns);
    }
    
    return data.map(item => 
      exportColumns.map(col => this.formatCellValue(item[col.field], col.type))
    );
  }

  /**
   * Prepare grouped data rows for export
   */
  private prepareGroupedDataRows(groupedRows: GroupedRow[], exportColumns: ExportColumn[]): any[][] {
    const rows: any[][] = [];
    
    groupedRows.forEach(row => {
      if (row.type === 'group' && row.group) {
        // Add group header row
        const groupRow = Array(exportColumns.length).fill('');
        groupRow[0] = `${row.group.displayValue} (${row.group.count} items)`;
        
        // Add aggregations to group row if available
        if (row.group.aggregations) {
          exportColumns.forEach((col, index) => {
            const aggregations = row.group!.aggregations![col.id];
            if (aggregations) {
              const aggStrings = Object.entries(aggregations).map(
                ([func, value]) => `${func}: ${value}`
              );
              if (aggStrings.length > 0) {
                groupRow[index] = aggStrings.join(', ');
              }
            }
          });
        }
        
        rows.push(groupRow);
      } else if (row.type === 'data' && row.data) {
        // Add regular data row
        const dataRow = exportColumns.map(col => 
          this.formatCellValue(row.data[col.field], col.type)
        );
        rows.push(dataRow);
      }
    });
    
    return rows;
  }

  /**
   * Format cell value for export
   */
  private formatCellValue(value: any, type: string): any {
    if (value === null || value === undefined) {
      return '';
    }
    
    switch (type) {
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : new Date(value).toLocaleDateString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      default:
        return String(value);
    }
  }

  /**
   * Format a row for CSV export
   */
  private formatCsvRow(values: string[], delimiter: string, qualifier: string): string {
    return values.map(value => {
      // Escape the value if it contains delimiter, qualifier, or newline
      if (value.includes(delimiter) || value.includes(qualifier) || value.includes('\n') || value.includes('\r')) {
        return qualifier + value.replace(new RegExp(qualifier, 'g'), qualifier + qualifier) + qualifier;
      }
      return value;
    }).join(delimiter);
  }

  /**
   * Export to PDF format
   */
  private async exportToPdf(exportData: ExportData, options: PdfExportOptions, exportOptions?: ExportOptions): Promise<void> {
    const {
      orientation = 'portrait',
      pageSize = 'A4',
      title = 'Data Export',
      author = '',
      includeMetadata = true,
      fontSize = 8,
      headerFontSize = 12,
      includePageNumbers = true,
      includeExportDate = true,
      includeFiltersInfo = false,
      tableStyle = {
        headerBackgroundColor: '#f0f0f0',
        headerTextColor: '#000000',
        alternateRowColor: '#f9f9f9',
        borderColor: '#cccccc',
        showGridLines: true
      },
      maxRowsPerPage = 0,
      customHeader = '',
      customFooter = ''
    } = options;

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize.toLowerCase() as any
    });

    // Set document properties
    doc.setProperties({
      title: title,
      author: author,
      creator: 'Grid Export Service'
    });

    let currentY = 20;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margins = { left: 10, right: 10, top: 20, bottom: 20 };

    // Add custom header or metadata
    if (includeMetadata || customHeader) {
      doc.setFontSize(headerFontSize);
      doc.setFont(undefined, 'bold');
      
      if (customHeader) {
        doc.text(customHeader, margins.left, currentY);
        currentY += 10;
      } else if (title) {
        doc.text(title, margins.left, currentY);
        currentY += 10;
      }

      if (includeExportDate) {
        doc.setFontSize(fontSize);
        doc.setFont(undefined, 'normal');
        doc.text(`Exported: ${new Date().toLocaleDateString()}`, margins.left, currentY);
        currentY += 8;
      }

      if (includeFiltersInfo && exportData.metadata.appliedFilters) {
        const filters = Object.entries(exportData.metadata.appliedFilters)
          .filter(([, value]) => value && value.toString().trim() !== '')
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        
        if (filters) {
          doc.text(`Filters: ${filters}`, margins.left, currentY);
          currentY += 8;
        }
      }

      currentY += 5; // Extra space before table
    }

    // Prepare table data
    const tableHeaders = exportData.headers;
    const tableRows = exportData.rows.map(row => row.map(cell => String(cell || '')));

    // Calculate column widths
    const availableWidth = pageWidth - margins.left - margins.right;
    const columnWidth = availableWidth / tableHeaders.length;

    // Create table using autoTable plugin
    (doc as any).autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: fontSize,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: this.hexToRgb(tableStyle.headerBackgroundColor),
        textColor: this.hexToRgb(tableStyle.headerTextColor),
        fontSize: fontSize + 1,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: this.hexToRgb(tableStyle.alternateRowColor)
      },
      columnStyles: this.getColumnStyles(exportData.columns, exportOptions?.template),
      margin: { top: margins.top, right: margins.right, bottom: margins.bottom, left: margins.left },
      pageBreak: 'auto',
      rowPageBreak: 'avoid'
    });

    // Add page numbers
    if (includePageNumbers) {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
      }
    }

    // Add custom footer
    if (customFooter) {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(customFooter, margins.left, pageHeight - 10);
      }
    }

    // Download the PDF
    const filename = `${exportData.metadata.filename}.pdf`;
    doc.save(filename);
  }

  /**
   * Export to Google Sheets
   */
  private async exportToGoogleSheets(exportData: ExportData, options: GoogleSheetsOptions, exportOptions?: ExportOptions): Promise<void> {
    // Note: This is a placeholder implementation
    // In a real implementation, you would need to:
    // 1. Set up Google Sheets API authentication
    // 2. Create or update spreadsheet
    // 3. Apply formatting and sharing settings
    
    console.warn('Google Sheets export requires Google Sheets API setup');
    
    // For now, fallback to Excel export
    const excelOptions: ExcelExportOptions = {
      sheetName: options.sheetName,
      autoSizeColumns: true,
      applyBasicStyling: true
    };
    
    await this.exportToExcel(exportData, excelOptions, exportOptions);
    
    // TODO: Implement actual Google Sheets API integration
    /*
    try {
      const auth = await this.getGoogleSheetsAuth();
      const sheets = google.sheets({ version: 'v4', auth });
      
      let spreadsheetId = options.spreadsheetId;
      
      if (options.createNew || !spreadsheetId) {
        // Create new spreadsheet
        const createResponse = await sheets.spreadsheets.create({
          requestBody: {
            properties: {
              title: options.title
            },
            sheets: [{
              properties: {
                title: options.sheetName
              }
            }]
          }
        });
        spreadsheetId = createResponse.data.spreadsheetId!;
      }
      
      // Prepare data for Google Sheets
      const values = exportData.includeHeaders 
        ? [exportData.headers, ...exportData.rows]
        : exportData.rows;
      
      // Update the sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${options.sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: values
        }
      });
      
      // Apply formatting if requested
      if (options.freezeHeaders) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheetId,
          requestBody: {
            requests: [{
              updateSheetProperties: {
                properties: {
                  sheetId: 0,
                  gridProperties: {
                    frozenRowCount: 1
                  }
                },
                fields: 'gridProperties.frozenRowCount'
              }
            }]
          }
        });
      }
      
      // Apply sharing settings
      if (options.shareSettings.shareType !== 'private') {
        const drive = google.drive({ version: 'v3', auth });
        
        const permission = {
          role: options.shareSettings.permissions,
          type: options.shareSettings.shareType === 'public' ? 'anyone' : 'domain',
          ...(options.shareSettings.domain && { domain: options.shareSettings.domain })
        };
        
        await drive.permissions.create({
          fileId: spreadsheetId,
          requestBody: permission
        });
      }
      
      console.log(`Google Sheets export completed: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
      
    } catch (error) {
      console.error('Google Sheets export failed:', error);
      throw new Error('Failed to export to Google Sheets');
    }
    */
  }

  /**
   * Helper method to convert hex color to RGB array
   */
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  /**
   * Get column styles for PDF export
   */
  private getColumnStyles(columns: ExportColumn[], template?: ExportTemplate): any {
    const styles: any = {};
    
    columns.forEach((column, index) => {
      const formatting = template?.config.columnFormatting?.[column.id];
      if (formatting) {
        styles[index] = {
          halign: formatting.alignment || 'left'
        };
      }
    });
    
    return styles;
  }

  /**
   * Get default CSV export options
   */
  getDefaultCsvOptions(): CsvExportOptions {
    return {
      delimiter: ',',
      qualifier: '"',
      lineEnding: '\n',
      includeBom: true
    };
  }

  /**
   * Get default Excel export options
   */
  getDefaultExcelOptions(): ExcelExportOptions {
    return {
      sheetName: 'Sheet1',
      autoSizeColumns: true,
      applyBasicStyling: true,
      headerStyle: {
        font: { bold: true },
        fill: { fgColor: 'E2E2E2' },
        border: { top: true, bottom: true, left: true, right: true }
      }
    };
  }

  /**
   * Get default PDF export options
   */
  getDefaultPdfOptions(): PdfExportOptions {
    return {
      orientation: 'landscape',
      pageSize: 'A4',
      title: 'Data Export',
      author: '',
      includeMetadata: true,
      fontSize: 8,
      headerFontSize: 12,
      includePageNumbers: true,
      includeExportDate: true,
      includeFiltersInfo: true,
      tableStyle: {
        headerBackgroundColor: '#2c3e50',
        headerTextColor: '#ffffff',
        alternateRowColor: '#f8f9fa',
        borderColor: '#dee2e6',
        showGridLines: true
      },
      maxRowsPerPage: 0,
      customHeader: '',
      customFooter: ''
    };
  }

  /**
   * Get default Google Sheets export options
   */
  getDefaultGoogleSheetsOptions(): GoogleSheetsOptions {
    return {
      title: 'Grid Export',
      sheetName: 'Sheet1',
      shareSettings: {
        shareType: 'private',
        permissions: 'edit'
      },
      createNew: true,
      enableCollaboration: true,
      freezeHeaders: true,
      addFilters: true,
      includeCharts: {
        enabled: false,
        chartTypes: ['column'],
        dataColumns: []
      }
    };
  }
}