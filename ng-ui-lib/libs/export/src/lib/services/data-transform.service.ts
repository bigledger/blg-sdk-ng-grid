import { Injectable } from '@angular/core';
import { ExportConfig, ExportFormat } from '../interfaces';

/**
 * Data transformation and validation service
 */
@Injectable({
  providedIn: 'root'
})
export class DataTransformService {

  /**
   * Transform export configuration to normalize data and apply defaults
   */
  transformConfig(config: ExportConfig): ExportConfig {
    const transformed = { ...config };

    // Apply format-specific transformations
    switch (config.format) {
      case ExportFormat.CSV:
        transformed.data = this.transformForCsv(config.data);
        break;
      case ExportFormat.EXCEL:
        transformed.data = this.transformForExcel(config.data);
        break;
      case ExportFormat.JSON:
        transformed.data = this.transformForJson(config.data);
        break;
      case ExportFormat.PDF:
      case ExportFormat.WORD:
        transformed.data = this.transformForDocument(config.data);
        break;
      case ExportFormat.PNG:
      case ExportFormat.JPEG:
      case ExportFormat.SVG:
        // Image formats typically work with DOM elements
        if (!config.element && config.data) {
          // If we have data but no element, we might need to create a visualization
          transformed.element = this.createElementFromData(config.data, config.format);
        }
        break;
    }

    // Ensure required fields are present
    if (!transformed.filename && transformed.format !== ExportFormat.GOOGLE_SHEETS && transformed.format !== ExportFormat.GOOGLE_DOCS) {
      transformed.filename = this.generateDefaultFilename(transformed.format);
    }

    // Apply compression settings if not specified
    if (transformed.compression === undefined) {
      transformed.compression = this.getDefaultCompression(transformed.format);
    }

    return transformed;
  }

  /**
   * Transform data for CSV export
   */
  private transformForCsv(data: any): any[] {
    if (!data) return [];

    if (Array.isArray(data)) {
      // If it's already an array, check if it needs flattening
      return data.map(item => this.flattenObject(item));
    }

    if (typeof data === 'object') {
      // If it's a single object, wrap it in an array
      return [this.flattenObject(data)];
    }

    // For primitive types, create a simple structure
    return [{ value: data }];
  }

  /**
   * Transform data for Excel export
   */
  private transformForExcel(data: any): any {
    if (!data) return { sheets: [] };

    if (Array.isArray(data)) {
      return {
        sheets: [{
          name: 'Data',
          data: data.map(item => this.flattenObject(item))
        }]
      };
    }

    if (typeof data === 'object' && data.sheets) {
      // Already in Excel format
      return data;
    }

    if (typeof data === 'object') {
      return {
        sheets: [{
          name: 'Data',
          data: [this.flattenObject(data)]
        }]
      };
    }

    return {
      sheets: [{
        name: 'Data',
        data: [{ value: data }]
      }]
    };
  }

  /**
   * Transform data for JSON export
   */
  private transformForJson(data: any): any {
    if (data === undefined || data === null) {
      return {};
    }

    // Deep clone to avoid modifying original data
    return this.deepClone(data);
  }

  /**
   * Transform data for document export (PDF, Word)
   */
  private transformForDocument(data: any): any {
    if (!data) return { content: [] };

    if (typeof data === 'string') {
      return { content: [{ type: 'text', text: data }] };
    }

    if (Array.isArray(data)) {
      return {
        content: [
          { type: 'table', data: data.map(item => this.flattenObject(item)) }
        ]
      };
    }

    if (typeof data === 'object') {
      return {
        content: [
          { type: 'properties', data: this.flattenObject(data) }
        ]
      };
    }

    return { content: [{ type: 'text', text: String(data) }] };
  }

  /**
   * Create a DOM element from data for image export
   */
  private createElementFromData(data: any, format: ExportFormat): HTMLElement | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.backgroundColor = 'white';
    container.style.color = 'black';

    if (Array.isArray(data) && data.length > 0) {
      // Create a table for tabular data
      const table = document.createElement('table');
      table.style.borderCollapse = 'collapse';
      table.style.width = '100%';

      // Create header
      if (typeof data[0] === 'object') {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        Object.keys(data[0]).forEach(key => {
          const th = document.createElement('th');
          th.textContent = key;
          th.style.border = '1px solid #ddd';
          th.style.padding = '8px';
          th.style.backgroundColor = '#f2f2f2';
          headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        data.forEach(row => {
          const tr = document.createElement('tr');
          Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = String(value);
            td.style.border = '1px solid #ddd';
            td.style.padding = '8px';
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
      }
      
      container.appendChild(table);
    } else if (typeof data === 'object') {
      // Create a property list
      const dl = document.createElement('dl');
      Object.entries(data).forEach(([key, value]) => {
        const dt = document.createElement('dt');
        dt.textContent = key;
        dt.style.fontWeight = 'bold';
        dt.style.marginTop = '10px';
        
        const dd = document.createElement('dd');
        dd.textContent = String(value);
        dd.style.marginLeft = '20px';
        
        dl.appendChild(dt);
        dl.appendChild(dd);
      });
      container.appendChild(dl);
    } else {
      // Simple text content
      const p = document.createElement('p');
      p.textContent = String(data);
      container.appendChild(p);
    }

    return container;
  }

  /**
   * Flatten nested objects for tabular export
   */
  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    if (obj === null || obj === undefined) {
      return {};
    }

    if (typeof obj !== 'object' || obj instanceof Date) {
      return prefix ? { [prefix]: obj } : { value: obj };
    }

    if (Array.isArray(obj)) {
      const result: Record<string, any> = {};
      obj.forEach((item, index) => {
        const itemKey = prefix ? `${prefix}[${index}]` : String(index);
        if (typeof item === 'object' && item !== null) {
          Object.assign(result, this.flattenObject(item, itemKey));
        } else {
          result[itemKey] = item;
        }
      });
      return result;
    }

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || value === undefined) {
        result[newKey] = value;
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        Object.assign(result, this.flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    }

    return result;
  }

  /**
   * Deep clone an object
   */
  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item));
    }

    const cloned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      cloned[key] = this.deepClone(value);
    }

    return cloned;
  }

  /**
   * Generate default filename based on format
   */
  private generateDefaultFilename(format: ExportFormat): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const formatName = format.replace(/[^a-zA-Z0-9]/g, '');
    return `export-${formatName}-${timestamp}`;
  }

  /**
   * Get default compression level for format
   */
  private getDefaultCompression(format: ExportFormat): string {
    const compressionMap: Record<ExportFormat, string> = {
      [ExportFormat.PDF]: 'medium',
      [ExportFormat.EXCEL]: 'medium',
      [ExportFormat.WORD]: 'medium',
      [ExportFormat.PNG]: 'none',
      [ExportFormat.JPEG]: 'medium',
      [ExportFormat.SVG]: 'none',
      [ExportFormat.CSV]: 'none',
      [ExportFormat.JSON]: 'none',
      [ExportFormat.HTML]: 'none',
      [ExportFormat.XML]: 'none',
      [ExportFormat.GOOGLE_SHEETS]: 'none',
      [ExportFormat.GOOGLE_DOCS]: 'none'
    };

    return compressionMap[format] || 'none';
  }

  /**
   * Validate data structure for specific format
   */
  validateDataForFormat(data: any, format: ExportFormat): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (format) {
      case ExportFormat.CSV:
        if (!Array.isArray(data) && typeof data !== 'object') {
          errors.push('CSV export requires array or object data');
        }
        break;

      case ExportFormat.EXCEL:
        if (data && typeof data === 'object' && data.sheets) {
          if (!Array.isArray(data.sheets)) {
            errors.push('Excel sheets must be an array');
          }
        }
        break;

      case ExportFormat.JSON:
        try {
          JSON.stringify(data);
        } catch (e) {
          errors.push('Data is not JSON serializable');
        }
        break;

      case ExportFormat.PNG:
      case ExportFormat.JPEG:
      case ExportFormat.SVG:
        // For image formats, we mainly need either data or an element
        // This validation will be handled at the service level
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert between different data formats
   */
  convertData(data: any, fromFormat: string, toFormat: string): any {
    // Simple format conversion logic
    if (fromFormat === toFormat) {
      return data;
    }

    // CSV to other formats
    if (fromFormat === 'csv' && Array.isArray(data)) {
      switch (toFormat) {
        case 'json':
          return data;
        case 'excel':
          return { sheets: [{ name: 'Data', data }] };
        default:
          return data;
      }
    }

    // JSON to other formats
    if (fromFormat === 'json') {
      switch (toFormat) {
        case 'csv':
          return Array.isArray(data) ? data : [data];
        case 'excel':
          const sheets = Array.isArray(data) 
            ? [{ name: 'Data', data }] 
            : [{ name: 'Data', data: [data] }];
          return { sheets };
        default:
          return data;
      }
    }

    return data;
  }

  /**
   * Sanitize data for export (remove sensitive information, etc.)
   */
  sanitizeData(data: any, options: { removeFields?: string[]; maskFields?: string[] } = {}): any {
    const { removeFields = [], maskFields = [] } = options;
    
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item, options));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (removeFields.includes(key)) {
          continue; // Skip this field
        }
        
        if (maskFields.includes(key)) {
          sanitized[key] = this.maskValue(value);
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeData(value, options);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    }

    return data;
  }

  /**
   * Mask sensitive values
   */
  private maskValue(value: any): string {
    if (typeof value === 'string') {
      if (value.length <= 4) {
        return '*'.repeat(value.length);
      }
      return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
    }
    
    return '***';
  }
}