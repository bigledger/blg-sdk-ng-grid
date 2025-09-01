import { Injectable, inject } from '@angular/core';
import { TableData, TableConfig, TableRow, TableCell } from '../interfaces/table-config.interface';
import { TableStateService } from './table-state.service';

/**
 * Service for importing and exporting table data in various formats
 */
@Injectable({
  providedIn: 'root'
})
export class TableImportExportService {
  private readonly tableState = inject(TableStateService);

  /**
   * Import CSV data and create a table
   */
  importCSV(csvData: string, options: CSVImportOptions = {}): TableData {
    const {
      delimiter = ',',
      hasHeader = true,
      trimWhitespace = true,
      skipEmptyRows = true
    } = options;

    const lines = csvData.split('\n').map(line => line.trim());
    const rows: string[][] = [];

    // Parse CSV lines
    for (const line of lines) {
      if (skipEmptyRows && !line) continue;

      const row = this.parseCSVLine(line, delimiter);
      if (trimWhitespace) {
        row.forEach((cell, index) => {
          row[index] = cell.trim();
        });
      }
      rows.push(row);
    }

    if (rows.length === 0) {
      throw new Error('No data found in CSV');
    }

    // Determine column count (use the maximum row length)
    const maxColumns = Math.max(...rows.map(row => row.length));

    // Normalize rows to have the same column count
    rows.forEach(row => {
      while (row.length < maxColumns) {
        row.push('');
      }
    });

    // Create table configuration
    const config: TableConfig = {
      rows: rows.length,
      columns: maxColumns,
      hasHeader,
      responsive: true
    };

    // Convert to table rows
    const tableRows: TableRow[] = rows.map((row, rowIndex) => ({
      cells: row.map((cellContent, colIndex) => ({
        content: cellContent,
        isHeader: hasHeader && rowIndex === 0
      })),
      isHeader: hasHeader && rowIndex === 0
    }));

    return {
      config,
      rows: tableRows,
      id: `imported_table_${Date.now()}`
    };
  }

  /**
   * Export table data as CSV
   */
  exportCSV(tableData: TableData, options: CSVExportOptions = {}): string {
    const {
      delimiter = ',',
      includeHeaders = true,
      quoteAll = false,
      lineBreak = '\n'
    } = options;

    const lines: string[] = [];

    tableData.rows.forEach((row, rowIndex) => {
      // Skip header row if not including headers and this is a header row
      if (!includeHeaders && row.isHeader) return;

      const csvRow = row.cells.map(cell => {
        let content = cell.content || '';
        
        // Quote cell content if it contains delimiter, quotes, or newlines
        if (quoteAll || content.includes(delimiter) || content.includes('"') || content.includes('\n')) {
          content = `"${content.replace(/"/g, '""')}"`;
        }
        
        return content;
      });

      lines.push(csvRow.join(delimiter));
    });

    return lines.join(lineBreak);
  }

  /**
   * Handle Excel paste data (tab-separated values)
   */
  handleExcelPaste(pastedData: string): TableData {
    const lines = pastedData.split('\n').map(line => line.replace(/\r$/, ''));
    const rows: string[][] = [];

    // Parse tab-separated lines
    for (const line of lines) {
      if (!line.trim()) continue;
      rows.push(line.split('\t'));
    }

    if (rows.length === 0) {
      throw new Error('No data found in pasted content');
    }

    // Determine column count
    const maxColumns = Math.max(...rows.map(row => row.length));

    // Normalize rows
    rows.forEach(row => {
      while (row.length < maxColumns) {
        row.push('');
      }
    });

    // Create table configuration
    const config: TableConfig = {
      rows: rows.length,
      columns: maxColumns,
      hasHeader: false, // Excel paste typically doesn't indicate headers
      responsive: true
    };

    // Convert to table rows
    const tableRows: TableRow[] = rows.map(row => ({
      cells: row.map(cellContent => ({
        content: cellContent
      }))
    }));

    return {
      config,
      rows: tableRows,
      id: `pasted_table_${Date.now()}`
    };
  }

  /**
   * Export table data as JSON
   */
  exportJSON(tableData: TableData, options: JSONExportOptions = {}): string {
    const {
      format = 'array',
      includeHeaders = true,
      prettyPrint = true
    } = options;

    let data: any;

    if (format === 'array') {
      data = tableData.rows.map(row => 
        row.cells.map(cell => cell.content || '')
      );
    } else if (format === 'objects') {
      const headers = tableData.config.hasHeader && tableData.rows.length > 0
        ? tableData.rows[0].cells.map((cell, index) => cell.content || `Column${index + 1}`)
        : tableData.rows[0]?.cells.map((_, index) => `Column${index + 1}`) || [];

      const dataRows = tableData.config.hasHeader ? tableData.rows.slice(1) : tableData.rows;
      
      data = dataRows.map(row => {
        const obj: { [key: string]: string } = {};
        row.cells.forEach((cell, index) => {
          obj[headers[index]] = cell.content || '';
        });
        return obj;
      });
    } else {
      // Full table structure
      data = tableData;
    }

    return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  /**
   * Import JSON data
   */
  importJSON(jsonData: string): TableData {
    let data: any;
    
    try {
      data = JSON.parse(jsonData);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }

    // Handle different JSON formats
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('Empty array provided');
      }

      // Check if it's array of arrays or array of objects
      if (Array.isArray(data[0])) {
        return this.createTableFromArrayOfArrays(data);
      } else if (typeof data[0] === 'object') {
        return this.createTableFromArrayOfObjects(data);
      }
    } else if (data.config && data.rows) {
      // Full table structure
      return data as TableData;
    }

    throw new Error('Unsupported JSON format');
  }

  /**
   * Create table from array of arrays
   */
  private createTableFromArrayOfArrays(data: string[][]): TableData {
    const maxColumns = Math.max(...data.map(row => row.length));
    
    // Normalize rows
    data.forEach(row => {
      while (row.length < maxColumns) {
        row.push('');
      }
    });

    const config: TableConfig = {
      rows: data.length,
      columns: maxColumns,
      hasHeader: false,
      responsive: true
    };

    const tableRows: TableRow[] = data.map(row => ({
      cells: row.map(cellContent => ({
        content: String(cellContent)
      }))
    }));

    return {
      config,
      rows: tableRows,
      id: `json_table_${Date.now()}`
    };
  }

  /**
   * Create table from array of objects
   */
  private createTableFromArrayOfObjects(data: { [key: string]: any }[]): TableData {
    if (data.length === 0) {
      throw new Error('Empty data array');
    }

    // Get all unique keys as column headers
    const allKeys = new Set<string>();
    data.forEach(obj => {
      Object.keys(obj).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    const config: TableConfig = {
      rows: data.length + 1, // +1 for header
      columns: headers.length,
      hasHeader: true,
      responsive: true
    };

    // Create header row
    const headerRow: TableRow = {
      cells: headers.map(header => ({
        content: header,
        isHeader: true
      })),
      isHeader: true
    };

    // Create data rows
    const dataRows: TableRow[] = data.map(obj => ({
      cells: headers.map(header => ({
        content: String(obj[header] || '')
      }))
    }));

    return {
      config,
      rows: [headerRow, ...dataRows],
      id: `json_table_${Date.now()}`
    };
  }

  /**
   * Parse CSV line respecting quoted values
   */
  private parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quotes
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === delimiter && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current);
    return result;
  }

  /**
   * Detect delimiter in CSV data
   */
  detectCSVDelimiter(csvData: string): string {
    const delimiters = [',', ';', '\t', '|'];
    const sampleLines = csvData.split('\n').slice(0, 5); // Check first 5 lines
    
    let bestDelimiter = ',';
    let maxConsistency = 0;

    for (const delimiter of delimiters) {
      const columnCounts = sampleLines.map(line => 
        this.parseCSVLine(line, delimiter).length
      );

      // Check consistency (all lines should have same column count)
      const uniqueCounts = new Set(columnCounts);
      if (uniqueCounts.size === 1 && columnCounts[0] > 1) {
        const consistency = columnCounts[0]; // Number of columns
        if (consistency > maxConsistency) {
          maxConsistency = consistency;
          bestDelimiter = delimiter;
        }
      }
    }

    return bestDelimiter;
  }

  /**
   * Download file with given content
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Read file content
   */
  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  }
}

/**
 * Options for CSV import
 */
export interface CSVImportOptions {
  delimiter?: string;
  hasHeader?: boolean;
  trimWhitespace?: boolean;
  skipEmptyRows?: boolean;
}

/**
 * Options for CSV export
 */
export interface CSVExportOptions {
  delimiter?: string;
  includeHeaders?: boolean;
  quoteAll?: boolean;
  lineBreak?: string;
}

/**
 * Options for JSON export
 */
export interface JSONExportOptions {
  format?: 'array' | 'objects' | 'full';
  includeHeaders?: boolean;
  prettyPrint?: boolean;
}