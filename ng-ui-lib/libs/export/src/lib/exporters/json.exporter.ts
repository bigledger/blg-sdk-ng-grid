import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { ExportConfig, ExportResult } from '../interfaces';
import { ProgressTrackingService } from '../services/progress-tracking.service';

/**
 * JSON Export Options
 */
export interface JsonExportOptions {
  indent?: number | string;
  replacer?: (key: string, value: any) => any;
  includeMetadata?: boolean;
  flattenObjects?: boolean;
  arrayFormat?: 'objects' | 'arrays';
  dateFormat?: 'iso' | 'timestamp' | 'locale';
  preserveUndefined?: boolean;
  customFormatters?: Record<string, (value: any) => any>;
}

/**
 * JSON Exporter Service
 * 
 * Handles JSON export with comprehensive formatting and transformation options
 */
@Injectable({
  providedIn: 'root'
})
export class JsonExporter {
  private readonly progressService = inject(ProgressTrackingService);

  /**
   * Export data to JSON
   */
  export(config: ExportConfig): Observable<ExportResult> {
    this.progressService.startProgress('json-export', 'Processing data for JSON export');

    return from(this.processExport(config)).pipe(
      map(jsonData => ({
        success: true,
        data: new Blob([jsonData], { type: 'application/json;charset=utf-8' }),
        size: jsonData.length,
        metadata: {
          format: 'json',
          structure: this.analyzeStructure(config.data),
          encoding: 'utf-8'
        }
      } as ExportResult))
    );
  }

  /**
   * Process JSON export
   */
  private async processExport(config: ExportConfig): Promise<string> {
    this.progressService.updateProgress('json-export', 25, 'Preparing data structure');

    const options = this.getExportOptions(config);
    let processedData = this.preprocessData(config.data, options);

    this.progressService.updateProgress('json-export', 50, 'Applying transformations');

    if (options.flattenObjects) {
      processedData = this.flattenData(processedData);
    }

    this.progressService.updateProgress('json-export', 75, 'Serializing to JSON');

    const jsonString = this.serializeData(processedData, options);

    if (options.includeMetadata) {
      const finalData = this.addMetadata(processedData, config, jsonString);
      this.progressService.completeProgress('json-export');
      return JSON.stringify(finalData, options.replacer, options.indent);
    }

    this.progressService.completeProgress('json-export');
    return jsonString;
  }

  /**
   * Get export options with defaults
   */
  private getExportOptions(config: ExportConfig): JsonExportOptions {
    return {
      indent: config.indent !== undefined ? config.indent : 2,
      replacer: config.replacer,
      includeMetadata: config.includeMetadata || false,
      flattenObjects: config.flatten || false,
      arrayFormat: config.arrayFormat || 'objects',
      dateFormat: 'iso',
      preserveUndefined: false,
      customFormatters: {}
    };
  }

  /**
   * Preprocess data before export
   */
  private preprocessData(data: any, options: JsonExportOptions): any {
    if (data === null || data === undefined) {
      return options.preserveUndefined ? data : null;
    }

    // Handle different data types
    if (Array.isArray(data)) {
      return this.processArray(data, options);
    }

    if (data instanceof Date) {
      return this.formatDate(data, options);
    }

    if (typeof data === 'object') {
      return this.processObject(data, options);
    }

    return data;
  }

  /**
   * Process array data
   */
  private processArray(data: any[], options: JsonExportOptions): any {
    const processedArray = data.map(item => this.preprocessData(item, options));

    if (options.arrayFormat === 'arrays' && processedArray.length > 0) {
      // Convert array of objects to array of arrays
      const firstItem = processedArray[0];
      if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
        const headers = Object.keys(firstItem);
        const arrayData = processedArray.map(item => 
          headers.map(header => item[header])
        );
        return {
          headers,
          data: arrayData
        };
      }
    }

    return processedArray;
  }

  /**
   * Process object data
   */
  private processObject(data: any, options: JsonExportOptions): any {
    const processed: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined && !options.preserveUndefined) {
        continue;
      }

      if (options.customFormatters && options.customFormatters[key]) {
        processed[key] = options.customFormatters[key](value);
      } else {
        processed[key] = this.preprocessData(value, options);
      }
    }

    return processed;
  }

  /**
   * Format date based on options
   */
  private formatDate(date: Date, options: JsonExportOptions): any {
    switch (options.dateFormat) {
      case 'timestamp':
        return date.getTime();
      case 'locale':
        return date.toLocaleString();
      case 'iso':
      default:
        return date.toISOString();
    }
  }

  /**
   * Flatten nested objects
   */
  private flattenData(data: any, prefix = '', separator = '.'): any {
    if (Array.isArray(data)) {
      return data.map(item => this.flattenData(item, prefix, separator));
    }

    if (typeof data !== 'object' || data === null || data instanceof Date) {
      return data;
    }

    const flattened: any = {};

    for (const [key, value] of Object.entries(data)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively flatten nested objects
        Object.assign(flattened, this.flattenData(value, newKey, separator));
      } else if (Array.isArray(value)) {
        // Handle arrays by creating indexed keys
        value.forEach((item, index) => {
          const arrayKey = `${newKey}[${index}]`;
          if (typeof item === 'object' && item !== null) {
            Object.assign(flattened, this.flattenData(item, arrayKey, separator));
          } else {
            flattened[arrayKey] = item;
          }
        });
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  }

  /**
   * Serialize data to JSON string
   */
  private serializeData(data: any, options: JsonExportOptions): string {
    try {
      return JSON.stringify(data, options.replacer, options.indent);
    } catch (error) {
      // Handle circular references and other serialization issues
      return JSON.stringify(
        data, 
        this.createCircularReplacer(options.replacer), 
        options.indent
      );
    }
  }

  /**
   * Create replacer function that handles circular references
   */
  private createCircularReplacer(customReplacer?: (key: string, value: any) => any) {
    const seen = new WeakSet();
    
    return (key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }

      // Apply custom replacer if provided
      if (customReplacer) {
        return customReplacer(key, value);
      }

      return value;
    };
  }

  /**
   * Add metadata to the export
   */
  private addMetadata(data: any, config: ExportConfig, jsonString: string): any {
    const metadata = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        format: 'json',
        filename: config.filename,
        size: jsonString.length,
        structure: this.analyzeStructure(data)
      },
      data
    };

    return metadata;
  }

  /**
   * Analyze data structure
   */
  private analyzeStructure(data: any): any {
    if (data === null || data === undefined) {
      return { type: 'null' };
    }

    if (Array.isArray(data)) {
      return {
        type: 'array',
        length: data.length,
        itemTypes: this.getArrayItemTypes(data),
        firstItemStructure: data.length > 0 ? this.analyzeStructure(data[0]) : null
      };
    }

    if (typeof data === 'object') {
      return {
        type: 'object',
        keys: Object.keys(data),
        keyCount: Object.keys(data).length,
        propertyTypes: this.getObjectPropertyTypes(data)
      };
    }

    return {
      type: typeof data,
      value: data
    };
  }

  /**
   * Get types of array items
   */
  private getArrayItemTypes(array: any[]): Record<string, number> {
    const types: Record<string, number> = {};
    
    array.forEach(item => {
      const type = Array.isArray(item) ? 'array' : 
                  item === null ? 'null' : 
                  typeof item;
      types[type] = (types[type] || 0) + 1;
    });

    return types;
  }

  /**
   * Get types of object properties
   */
  private getObjectPropertyTypes(obj: any): Record<string, string> {
    const types: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      types[key] = Array.isArray(value) ? 'array' : 
                  value === null ? 'null' : 
                  typeof value;
    }

    return types;
  }

  /**
   * Export with schema validation
   */
  exportWithSchema(
    data: any,
    schema: any,
    options?: JsonExportOptions
  ): Observable<ExportResult> {
    // Validate data against schema (basic implementation)
    const validationResult = this.validateAgainstSchema(data, schema);
    
    if (!validationResult.valid) {
      throw new Error(`Schema validation failed: ${validationResult.errors.join(', ')}`);
    }

    const config: ExportConfig = {
      format: 'json' as any,
      filename: 'schema-validated-export',
      data,
      ...options
    };

    return this.export(config);
  }

  /**
   * Basic schema validation
   */
  private validateAgainstSchema(data: any, schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic type checking (simplified JSON Schema validation)
    if (schema.type) {
      const actualType = Array.isArray(data) ? 'array' : typeof data;
      if (actualType !== schema.type) {
        errors.push(`Expected type ${schema.type}, got ${actualType}`);
      }
    }

    if (schema.required && Array.isArray(schema.required)) {
      if (typeof data === 'object' && data !== null) {
        schema.required.forEach((field: string) => {
          if (!(field in data)) {
            errors.push(`Required field '${field}' is missing`);
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Export to JSONL (JSON Lines) format
   */
  exportToJSONL(data: any[], options?: JsonExportOptions): Observable<ExportResult> {
    if (!Array.isArray(data)) {
      throw new Error('JSONL export requires array data');
    }

    const config: ExportConfig = {
      format: 'json' as any,
      filename: 'export.jsonl',
      data
    };

    this.progressService.startProgress('jsonl-export', 'Converting to JSONL format');

    const jsonlContent = data.map((item, index) => {
      this.progressService.updateProgress('jsonl-export', (index / data.length) * 100, `Processing item ${index + 1} of ${data.length}`);
      return JSON.stringify(this.preprocessData(item, options || {}));
    }).join('\n');

    this.progressService.completeProgress('jsonl-export');

    return from(Promise.resolve({
      success: true,
      data: new Blob([jsonlContent], { type: 'application/x-jsonlines' }),
      size: jsonlContent.length,
      metadata: {
        format: 'jsonl',
        lineCount: data.length,
        encoding: 'utf-8'
      }
    } as ExportResult));
  }

  /**
   * Export pretty-printed JSON
   */
  exportPretty(data: any, indentSize: number = 2): Observable<ExportResult> {
    const config: ExportConfig = {
      format: 'json' as any,
      filename: 'pretty-export',
      data,
      indent: indentSize
    };

    return this.export(config);
  }

  /**
   * Export minified JSON
   */
  exportMinified(data: any): Observable<ExportResult> {
    const config: ExportConfig = {
      format: 'json' as any,
      filename: 'minified-export',
      data,
      indent: undefined // No indentation for minified
    };

    return this.export(config);
  }

  /**
   * Convert JSON back from string (utility method)
   */
  parseJSON(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error}`);
    }
  }

  /**
   * Validate JSON string
   */
  validateJSON(jsonString: string): { valid: boolean; error?: string; parsed?: any } {
    try {
      const parsed = JSON.parse(jsonString);
      return { valid: true, parsed };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get JSON file information
   */
  getJSONInfo(jsonString: string): {
    valid: boolean;
    size: number;
    depth: number;
    keyCount: number;
    structure: any;
  } {
    const validation = this.validateJSON(jsonString);
    
    if (!validation.valid) {
      return {
        valid: false,
        size: jsonString.length,
        depth: 0,
        keyCount: 0,
        structure: null
      };
    }

    const depth = this.calculateDepth(validation.parsed);
    const keyCount = this.countKeys(validation.parsed);
    const structure = this.analyzeStructure(validation.parsed);

    return {
      valid: true,
      size: jsonString.length,
      depth,
      keyCount,
      structure
    };
  }

  /**
   * Calculate maximum depth of nested objects/arrays
   */
  private calculateDepth(obj: any): number {
    if (typeof obj !== 'object' || obj === null) {
      return 0;
    }

    let maxDepth = 0;
    
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        maxDepth = Math.max(maxDepth, this.calculateDepth(item));
      });
    } else {
      Object.values(obj).forEach(value => {
        maxDepth = Math.max(maxDepth, this.calculateDepth(value));
      });
    }

    return maxDepth + 1;
  }

  /**
   * Count total number of keys in nested objects
   */
  private countKeys(obj: any): number {
    if (typeof obj !== 'object' || obj === null) {
      return 0;
    }

    let count = 0;

    if (Array.isArray(obj)) {
      obj.forEach(item => {
        count += this.countKeys(item);
      });
    } else {
      count += Object.keys(obj).length;
      Object.values(obj).forEach(value => {
        count += this.countKeys(value);
      });
    }

    return count;
  }
}