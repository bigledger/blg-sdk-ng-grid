/**
 * Chart Data Interfaces - Defines data structures for chart rendering
 */

import { ChartType, StackType, InterpolationType } from './chart-types';

/**
 * Base data point interface
 */
export interface DataPoint {
  x: any;
  y: any;
  [key: string]: any;
}

/**
 * Chart series interface
 */
export interface ChartSeries {
  id: string;
  name: string;
  type?: ChartType;
  data: DataPoint[];
  color?: string;
  visible?: boolean;
  interpolation?: InterpolationType;
  stack?: string;
  stackType?: StackType;
  yAxis?: string;
  metadata?: Record<string, any>;
}

/**
 * Chart dataset interface
 */
export interface ChartDataset {
  series: ChartSeries[];
  categories?: string[];
  colors?: string[];
  metadata?: Record<string, any>;
}

/**
 * Data processing options
 */
export interface DataProcessingOptions {
  sort?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  filter?: {
    key: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not-in';
    value: any;
  }[];
  aggregate?: {
    key: string;
    function: 'sum' | 'avg' | 'count' | 'min' | 'max';
    groupBy?: string;
  };
  transform?: {
    key: string;
    function: 'log' | 'sqrt' | 'pow' | 'abs' | 'round';
    params?: any[];
  }[];
}

/**
 * Data validation result
 */
export interface DataValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  processedData?: ChartDataset;
}

/**
 * Data update event
 */
export interface DataUpdateEvent {
  type: 'add' | 'update' | 'remove' | 'replace';
  seriesId?: string;
  data: Partial<ChartDataset>;
  animated?: boolean;
  duration?: number;
}