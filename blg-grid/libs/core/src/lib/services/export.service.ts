import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  ExportData,
  ExportColumn,
  ExportMetadata,
  ExportOptions,
  CsvExportOptions,
  ExcelExportOptions,
  ExcelCellStyle
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

  /**
   * Export data with specified options
   */
  async exportData(
    data: any[],
    columns: ColumnDefinition[],
    options: ExportOptions,
    groupedRows?: GroupedRow[],
    appliedFilters?: { [columnId: string]: any }
  ): Promise<void> {
    const exportData = this.prepareExportData(data, columns, options, groupedRows, appliedFilters);
    
    switch (options.format) {
      case 'csv':
        this.exportToCsv(exportData, options.formatOptions as CsvExportOptions);
        break;
      case 'excel':
        this.exportToExcel(exportData, options.formatOptions as ExcelExportOptions);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export to CSV format
   */
  private exportToCsv(exportData: ExportData, options: CsvExportOptions): void {
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
  private exportToExcel(exportData: ExportData, options: ExcelExportOptions): void {
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
}