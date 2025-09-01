import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { ExportConfig, ExportResult } from '../interfaces';
import { ProgressTrackingService } from '../services/progress-tracking.service';

/**
 * CSV Export Configuration
 */
export interface CsvExportOptions {
  delimiter?: string;
  quote?: string;
  escape?: string;
  lineEnding?: string;
  includeHeader?: boolean;
  encoding?: string;
  bom?: boolean;
  customHeaders?: string[];
}

/**
 * CSV Exporter Service
 * 
 * Handles CSV export with comprehensive formatting options
 */
@Injectable({
  providedIn: 'root'
})
export class CsvExporter {
  private readonly progressService = inject(ProgressTrackingService);

  /**
   * Export data to CSV
   */
  export(config: ExportConfig): Observable<ExportResult> {
    this.progressService.startProgress('csv-export', 'Processing data for CSV export');

    return from(this.processExport(config)).pipe(
      map(csvData => ({
        success: true,
        data: new Blob([csvData], { type: 'text/csv;charset=utf-8' }),
        size: csvData.length,
        metadata: {
          format: 'csv',
          rowCount: this.getRowCount(csvData),
          encoding: config.encoding || 'utf-8'
        }
      } as ExportResult))
    );
  }

  /**
   * Process CSV export
   */
  private async processExport(config: ExportConfig): Promise<string> {
    this.progressService.updateProgress('csv-export', 25, 'Normalizing data');

    const data = this.normalizeData(config.data);
    const options = this.getExportOptions(config);

    this.progressService.updateProgress('csv-export', 50, 'Converting to CSV format');

    if (data.length === 0) {
      this.progressService.completeProgress('csv-export');
      return '';
    }

    const csvContent = this.convertToCSV(data, options);

    this.progressService.updateProgress('csv-export', 75, 'Applying formatting');

    const formattedContent = this.applyFormatting(csvContent, options);

    this.progressService.completeProgress('csv-export');

    return formattedContent;
  }

  /**
   * Normalize data for CSV export
   */
  private normalizeData(data: any): any[] {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data;
    }

    if (typeof data === 'object') {
      return [data];
    }

    return [{ value: data }];
  }

  /**
   * Get export options with defaults
   */
  private getExportOptions(config: ExportConfig): CsvExportOptions {
    return {
      delimiter: config.delimiter || ',',
      quote: config.quote || '"',
      escape: config.escape || '"',
      lineEnding: config.lineEnding || '\r\n',
      includeHeader: config.includeHeader !== false,
      encoding: config.encoding || 'utf-8',
      bom: config.encoding === 'utf-8',
      customHeaders: config.customHeaders
    };
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[], options: CsvExportOptions): string {
    if (data.length === 0) return '';

    const rows: string[] = [];
    
    // Get headers
    const firstRow = data[0];
    const headers = options.customHeaders || 
      (typeof firstRow === 'object' ? Object.keys(firstRow) : ['Value']);

    // Add header row
    if (options.includeHeader) {
      rows.push(this.createCSVRow(headers, options));
    }

    // Add data rows
    data.forEach((item, index) => {
      const values = this.extractValues(item, headers);
      rows.push(this.createCSVRow(values, options));
    });

    return rows.join(options.lineEnding!);
  }

  /**
   * Create a CSV row from values
   */
  private createCSVRow(values: any[], options: CsvExportOptions): string {
    return values.map(value => this.formatValue(value, options)).join(options.delimiter);
  }

  /**
   * Extract values from item based on headers
   */
  private extractValues(item: any, headers: string[]): any[] {
    if (typeof item !== 'object' || item === null) {
      return [item];
    }

    return headers.map(header => {
      // Support nested property access (e.g., 'user.name')
      const value = this.getNestedValue(item, header);
      return value;
    });
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => {
      return current && current[prop] !== undefined ? current[prop] : '';
    }, obj);
  }

  /**
   * Format a value for CSV output
   */
  private formatValue(value: any, options: CsvExportOptions): string {
    if (value === null || value === undefined) {
      return '';
    }

    let stringValue = String(value);

    // Handle special date formatting
    if (value instanceof Date) {
      stringValue = value.toISOString();
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      stringValue = value ? 'TRUE' : 'FALSE';
    }

    // Handle numbers with specific formatting
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        stringValue = value.toString();
      } else {
        stringValue = value.toFixed(2);
      }
    }

    // Check if quoting is needed
    const needsQuoting = this.needsQuoting(stringValue, options);

    if (needsQuoting) {
      // Escape existing quotes
      const escapedValue = stringValue.replace(
        new RegExp(options.quote!, 'g'), 
        options.escape! + options.quote!
      );
      return options.quote! + escapedValue + options.quote!;
    }

    return stringValue;
  }

  /**
   * Check if a value needs to be quoted
   */
  private needsQuoting(value: string, options: CsvExportOptions): boolean {
    return (
      value.includes(options.delimiter!) ||
      value.includes(options.quote!) ||
      value.includes('\n') ||
      value.includes('\r') ||
      value.startsWith(' ') ||
      value.endsWith(' ')
    );
  }

  /**
   * Apply formatting options to CSV content
   */
  private applyFormatting(content: string, options: CsvExportOptions): string {
    let formatted = content;

    // Add BOM for UTF-8 if requested
    if (options.bom && options.encoding === 'utf-8') {
      formatted = '\ufeff' + formatted;
    }

    return formatted;
  }

  /**
   * Get row count from CSV content
   */
  private getRowCount(csvContent: string): number {
    if (!csvContent) return 0;
    return csvContent.split(/\r\n|\r|\n/).length;
  }

  /**
   * Export tabular data with advanced options
   */
  exportTabular(
    data: any[][],
    headers?: string[],
    options?: CsvExportOptions
  ): Observable<ExportResult> {
    const config: ExportConfig = {
      format: 'csv' as any,
      filename: 'export',
      data: this.convertTabularToObjects(data, headers),
      ...options
    };

    return this.export(config);
  }

  /**
   * Convert tabular data (array of arrays) to objects
   */
  private convertTabularToObjects(data: any[][], headers?: string[]): any[] {
    if (!data || data.length === 0) return [];

    const actualHeaders = headers || data[0].map((_, index) => `Column${index + 1}`);
    const dataRows = headers ? data : data.slice(1);

    return dataRows.map(row => {
      const obj: any = {};
      actualHeaders.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : '';
      });
      return obj;
    });
  }

  /**
   * Export with custom transformations
   */
  exportWithTransform(
    data: any[],
    transformer: (item: any, index: number) => any,
    options?: CsvExportOptions
  ): Observable<ExportResult> {
    const transformedData = data.map(transformer);
    
    const config: ExportConfig = {
      format: 'csv' as any,
      filename: 'transformed-export',
      data: transformedData,
      ...options
    };

    return this.export(config);
  }

  /**
   * Parse CSV string back to data (utility method)
   */
  parseCSV(csvContent: string, options?: Partial<CsvExportOptions>): any[] {
    const opts = {
      delimiter: options?.delimiter || ',',
      quote: options?.quote || '"',
      lineEnding: options?.lineEnding || '\n',
      includeHeader: options?.includeHeader !== false
    };

    const lines = csvContent.split(/\r\n|\r|\n/).filter(line => line.trim());
    if (lines.length === 0) return [];

    const result: any[] = [];
    let headers: string[] = [];

    lines.forEach((line, lineIndex) => {
      const values = this.parseCSVLine(line, opts.delimiter, opts.quote);
      
      if (lineIndex === 0 && opts.includeHeader) {
        headers = values;
      } else {
        const rowData: any = {};
        const actualHeaders = headers.length > 0 ? headers : 
          values.map((_, index) => `Column${index + 1}`);
        
        actualHeaders.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        
        result.push(rowData);
      }
    });

    return result;
  }

  /**
   * Parse a single CSV line respecting quotes and escapes
   */
  private parseCSVLine(line: string, delimiter: string, quote: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === quote) {
        if (inQuotes && nextChar === quote) {
          // Escaped quote
          current += quote;
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
          continue;
        }
      }

      if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
        i++;
        continue;
      }

      current += char;
      i++;
    }

    result.push(current);
    return result;
  }

  /**
   * Validate CSV data structure
   */
  validateCSVData(data: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('Data must be an array');
      return { valid: false, errors };
    }

    if (data.length === 0) {
      errors.push('Data array is empty');
      return { valid: false, errors };
    }

    // Check for consistent object structure
    const firstItem = data[0];
    if (typeof firstItem === 'object' && firstItem !== null) {
      const expectedKeys = Object.keys(firstItem).sort();
      
      for (let i = 1; i < data.length; i++) {
        const currentItem = data[i];
        if (typeof currentItem !== 'object' || currentItem === null) {
          errors.push(`Row ${i + 1}: Expected object, got ${typeof currentItem}`);
          continue;
        }

        const currentKeys = Object.keys(currentItem).sort();
        const keysDiff = expectedKeys.filter(key => !currentKeys.includes(key))
          .concat(currentKeys.filter(key => !expectedKeys.includes(key)));

        if (keysDiff.length > 0) {
          errors.push(`Row ${i + 1}: Inconsistent keys: ${keysDiff.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get CSV file information
   */
  getCSVInfo(csvContent: string): {
    rowCount: number;
    columnCount: number;
    estimatedSize: number;
    delimiter: string;
  } {
    const lines = csvContent.split(/\r\n|\r|\n/);
    const nonEmptyLines = lines.filter(line => line.trim());
    
    // Try to detect delimiter
    const delimiters = [',', ';', '\t', '|'];
    const delimiterCounts = delimiters.map(d => ({
      delimiter: d,
      count: (lines[0] || '').split(d).length
    }));
    
    const detectedDelimiter = delimiterCounts
      .sort((a, b) => b.count - a.count)[0].delimiter;

    return {
      rowCount: nonEmptyLines.length,
      columnCount: nonEmptyLines.length > 0 ? 
        nonEmptyLines[0].split(detectedDelimiter).length : 0,
      estimatedSize: new Blob([csvContent]).size,
      delimiter: detectedDelimiter
    };
  }
}