/**
 * Data Processor Service - Handles data transformation and validation
 */

import { Injectable, signal, computed } from '@angular/core';
import { 
  ChartDataset, 
  ChartSeries, 
  DataPoint, 
  DataProcessingOptions, 
  DataValidationResult,
  ChartConfig
} from '../interfaces';

/**
 * Data processor service for chart data transformation
 */
@Injectable({
  providedIn: 'root'
})
export class DataProcessor {
  
  // Processing state signals
  private readonly isProcessing = signal<boolean>(false);
  private readonly lastProcessedData = signal<ChartDataset | null>(null);
  
  readonly processingState = this.isProcessing.asReadonly();
  readonly processedData = this.lastProcessedData.asReadonly();
  
  /**
   * Process chart data according to configuration
   */
  processData(data: ChartDataset, config: ChartConfig, options?: DataProcessingOptions): ChartDataset {
    this.isProcessing.set(true);
    
    try {
      // Validate input data
      const validationResult = this.validateData(data);
      if (!validationResult.valid) {
        throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      let processedData = this.deepClone(data);
      
      // Apply data processing options
      if (options) {
        processedData = this.applyProcessingOptions(processedData, options);
      }
      
      // Apply chart-specific processing
      processedData = this.applyChartProcessing(processedData, config);
      
      // Calculate derived values
      processedData = this.calculateDerivedValues(processedData, config);
      
      // Sort series by order or name
      processedData.series = this.sortSeries(processedData.series);
      
      this.lastProcessedData.set(processedData);
      return processedData;
      
    } finally {
      this.isProcessing.set(false);
    }
  }
  
  /**
   * Validate chart data
   */
  validateData(data: ChartDataset): DataValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check basic structure
    if (!data || typeof data !== 'object') {
      errors.push('Data must be an object');
      return { valid: false, errors, warnings };
    }
    
    if (!Array.isArray(data.series)) {
      errors.push('Data must contain a series array');
      return { valid: false, errors, warnings };
    }
    
    if (data.series.length === 0) {
      warnings.push('No data series provided');
    }
    
    // Validate each series
    data.series.forEach((series, index) => {
      this.validateSeries(series, index, errors, warnings);
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      processedData: errors.length === 0 ? data : undefined
    };
  }
  
  /**
   * Validate individual series
   */
  private validateSeries(series: ChartSeries, index: number, errors: string[], warnings: string[]): void {
    const prefix = `Series ${index}`;
    
    if (!series.id) {
      errors.push(`${prefix}: Missing series ID`);
    }
    
    if (!series.name) {
      warnings.push(`${prefix}: Missing series name`);
    }
    
    if (!Array.isArray(series.data)) {
      errors.push(`${prefix}: Series data must be an array`);
      return;
    }
    
    if (series.data.length === 0) {
      warnings.push(`${prefix}: Empty series data`);
    }
    
    // Validate data points
    series.data.forEach((point, pointIndex) => {
      this.validateDataPoint(point, index, pointIndex, errors, warnings);
    });
  }
  
  /**
   * Validate individual data point
   */
  private validateDataPoint(point: DataPoint, seriesIndex: number, pointIndex: number, errors: string[], warnings: string[]): void {
    const prefix = `Series ${seriesIndex}, Point ${pointIndex}`;
    
    if (typeof point !== 'object' || point === null) {
      errors.push(`${prefix}: Data point must be an object`);
      return;
    }
    
    if (point.x === undefined) {
      errors.push(`${prefix}: Missing x value`);
    }
    
    if (point.y === undefined) {
      errors.push(`${prefix}: Missing y value`);
    }
    
    // Check for valid numeric values where expected
    if (typeof point.x === 'number' && !isFinite(point.x)) {
      warnings.push(`${prefix}: Invalid x value (${point.x})`);
    }
    
    if (typeof point.y === 'number' && !isFinite(point.y)) {
      warnings.push(`${prefix}: Invalid y value (${point.y})`);
    }
  }
  
  /**
   * Apply processing options to data
   */
  private applyProcessingOptions(data: ChartDataset, options: DataProcessingOptions): ChartDataset {
    let processedData = data;
    
    // Apply sorting
    if (options.sort) {
      processedData = this.applySorting(processedData, options.sort);
    }
    
    // Apply filtering
    if (options.filter && options.filter.length > 0) {
      processedData = this.applyFiltering(processedData, options.filter);
    }
    
    // Apply aggregation
    if (options.aggregate) {
      processedData = this.applyAggregation(processedData, options.aggregate);
    }
    
    // Apply transformations
    if (options.transform && options.transform.length > 0) {
      processedData = this.applyTransformations(processedData, options.transform);
    }
    
    return processedData;
  }
  
  /**
   * Apply chart-specific processing
   */
  private applyChartProcessing(data: ChartDataset, config: ChartConfig): ChartDataset {
    const processedData = this.deepClone(data);
    
    // Apply stacking for area/bar charts
    if (this.needsStacking(config)) {
      return this.applyStacking(processedData, config);
    }
    
    // Apply smoothing for line charts
    if (config.type === 'line') {
      return this.applySmoothing(processedData, config);
    }
    
    return processedData;
  }
  
  /**
   * Calculate derived values
   */
  private calculateDerivedValues(data: ChartDataset, config: ChartConfig): ChartDataset {
    const processedData = this.deepClone(data);
    
    // Calculate statistics for each series
    processedData.series.forEach(series => {
      series.metadata = series.metadata || {};
      
      const values = series.data.map(d => Number(d.y)).filter(v => isFinite(v));
      
      if (values.length > 0) {
        series.metadata.stats = {
          min: Math.min(...values),
          max: Math.max(...values),
          mean: values.reduce((sum, v) => sum + v, 0) / values.length,
          count: values.length
        };
      }
    });
    
    return processedData;
  }
  
  /**
   * Sort series
   */
  private sortSeries(series: ChartSeries[]): ChartSeries[] {
    return [...series].sort((a, b) => {
      // Sort by order property if available, otherwise by name
      if (a.metadata?.order !== undefined && b.metadata?.order !== undefined) {
        return a.metadata.order - b.metadata.order;
      }
      return a.name.localeCompare(b.name);
    });
  }
  
  /**
   * Apply sorting to data points
   */
  private applySorting(data: ChartDataset, sort: NonNullable<DataProcessingOptions['sort']>): ChartDataset {
    const processedData = this.deepClone(data);
    
    processedData.series.forEach(series => {
      series.data.sort((a, b) => {
        const aValue = a[sort.key as keyof DataPoint];
        const bValue = b[sort.key as keyof DataPoint];
        
        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    });
    
    return processedData;
  }
  
  /**
   * Apply filtering to data points
   */
  private applyFiltering(data: ChartDataset, filters: NonNullable<DataProcessingOptions['filter']>): ChartDataset {
    const processedData = this.deepClone(data);
    
    processedData.series.forEach(series => {
      series.data = series.data.filter(point => {
        return filters.every(filter => {
          const value = point[filter.key as keyof DataPoint];
          
          switch (filter.operator) {
            case '=':
              return value === filter.value;
            case '!=':
              return value !== filter.value;
            case '>':
              return Number(value) > Number(filter.value);
            case '<':
              return Number(value) < Number(filter.value);
            case '>=':
              return Number(value) >= Number(filter.value);
            case '<=':
              return Number(value) <= Number(filter.value);
            case 'in':
              return Array.isArray(filter.value) && filter.value.includes(value);
            case 'not-in':
              return Array.isArray(filter.value) && !filter.value.includes(value);
            default:
              return true;
          }
        });
      });
    });
    
    return processedData;
  }
  
  /**
   * Apply aggregation
   */
  private applyAggregation(data: ChartDataset, aggregate: NonNullable<DataProcessingOptions['aggregate']>): ChartDataset {
    // Implementation for data aggregation
    // This is a complex operation that would group data and apply aggregation functions
    console.log('Aggregation not yet implemented', aggregate);
    return data;
  }
  
  /**
   * Apply transformations
   */
  private applyTransformations(data: ChartDataset, transforms: NonNullable<DataProcessingOptions['transform']>): ChartDataset {
    const processedData = this.deepClone(data);
    
    processedData.series.forEach(series => {
      series.data.forEach(point => {
        transforms.forEach(transform => {
          const value = Number(point[transform.key as keyof DataPoint]);
          
          if (!isFinite(value)) return;
          
          let transformedValue: number;
          
          switch (transform.function) {
            case 'log':
              transformedValue = Math.log(value);
              break;
            case 'sqrt':
              transformedValue = Math.sqrt(value);
              break;
            case 'pow':
              const power = transform.params?.[0] || 2;
              transformedValue = Math.pow(value, power);
              break;
            case 'abs':
              transformedValue = Math.abs(value);
              break;
            case 'round':
              const precision = transform.params?.[0] || 0;
              transformedValue = Number(value.toFixed(precision));
              break;
            default:
              transformedValue = value;
          }
          
          (point as any)[transform.key] = transformedValue;
        });
      });
    });
    
    return processedData;
  }
  
  /**
   * Check if chart needs stacking
   */
  private needsStacking(config: ChartConfig): boolean {
    return ['bar', 'column', 'area'].includes(config.type) &&
           config.interaction?.stacking !== false;
  }
  
  /**
   * Apply stacking to data
   */
  private applyStacking(data: ChartDataset, config: ChartConfig): ChartDataset {
    const processedData = this.deepClone(data);
    
    // Group series by stack
    const stackGroups = new Map<string, ChartSeries[]>();
    
    processedData.series.forEach(series => {
      const stackId = series.stack || 'default';
      if (!stackGroups.has(stackId)) {
        stackGroups.set(stackId, []);
      }
      stackGroups.get(stackId)!.push(series);
    });
    
    // Apply stacking for each group
    stackGroups.forEach(stackSeries => {
      this.stackSeriesGroup(stackSeries);
    });
    
    return processedData;
  }
  
  /**
   * Stack a group of series
   */
  private stackSeriesGroup(series: ChartSeries[]): void {
    if (series.length <= 1) return;
    
    // Find the maximum number of data points across all series
    const maxPoints = Math.max(...series.map(s => s.data.length));
    
    // Apply stacking
    for (let pointIndex = 0; pointIndex < maxPoints; pointIndex++) {
      let cumulativeValue = 0;
      
      series.forEach(s => {
        if (pointIndex < s.data.length) {
          const point = s.data[pointIndex];
          const originalValue = Number(point.y) || 0;
          
          // Store original value
          (point as any).originalY = originalValue;
          
          // Update with stacked value
          point.y = cumulativeValue + originalValue;
          cumulativeValue = point.y as number;
        }
      });
    }
  }
  
  /**
   * Apply smoothing to line data
   */
  private applySmoothing(data: ChartDataset, config: ChartConfig): ChartDataset {
    // Implementation for data smoothing (moving averages, spline interpolation, etc.)
    // This would be chart-type specific
    return data;
  }
  
  /**
   * Deep clone object
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }
    
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    
    return cloned;
  }
}