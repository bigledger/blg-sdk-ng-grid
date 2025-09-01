import { Injectable, Signal, computed, signal } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  PivotTableConfig,
  PivotTableData,
  PivotDimension,
  PivotMeasure,
  PivotFilter,
  PivotCell,
  PivotRow,
  PivotHeader,
  PivotTotals,
  PivotMetadata,
  PivotExportFormat
} from '../interfaces/pivot.interface.ts';

@Injectable({
  providedIn: 'root'
})
export class PivotService {
  private readonly _configs = signal<Map<string, PivotTableConfig>>(new Map());
  private readonly _data = signal<Map<string, PivotTableData>>(new Map());
  private readonly _cache = signal<Map<string, any>>(new Map());

  readonly configs = this._configs.asReadonly();
  readonly data = this._data.asReadonly();

  /**
   * Register pivot table configuration
   */
  registerPivotTable(config: PivotTableConfig): void {
    this._configs.update(configs => {
      const newConfigs = new Map(configs);
      newConfigs.set(config.id, config);
      return newConfigs;
    });
  }

  /**
   * Generate pivot table from raw data
   */
  generatePivotTable(config: PivotTableConfig, rawData: any[]): Observable<PivotTableData> {
    return from(this.processPivotData(config, rawData)).then(
      pivotData => {
        this._data.update(data => {
          const newData = new Map(data);
          newData.set(config.id, pivotData);
          return newData;
        });
        return pivotData;
      }
    );
  }

  /**
   * Update pivot configuration and regenerate
   */
  updatePivotConfig(configId: string, updates: Partial<PivotTableConfig>): Observable<PivotTableData> {
    const config = this._configs().get(configId);
    if (!config) {
      throw new Error(`Pivot config not found: ${configId}`);
    }

    const updatedConfig = { ...config, ...updates };
    this._configs.update(configs => {
      const newConfigs = new Map(configs);
      newConfigs.set(configId, updatedConfig);
      return newConfigs;
    });

    // Get cached raw data or reload
    const cachedData = this._cache().get(configId);
    if (cachedData) {
      return this.generatePivotTable(updatedConfig, cachedData);
    }

    throw new Error('No cached data available for pivot update');
  }

  /**
   * Apply filter to pivot table
   */
  applyFilter(configId: string, filter: PivotFilter): Observable<PivotTableData> {
    const config = this._configs().get(configId);
    if (!config) {
      throw new Error(`Pivot config not found: ${configId}`);
    }

    const updatedConfig = {
      ...config,
      data: {
        ...config.data,
        filters: [...(config.data.filters || []), filter]
      }
    };

    return this.updatePivotConfig(configId, updatedConfig);
  }

  /**
   * Remove filter from pivot table
   */
  removeFilter(configId: string, filterField: string): Observable<PivotTableData> {
    const config = this._configs().get(configId);
    if (!config) {
      throw new Error(`Pivot config not found: ${configId}`);
    }

    const updatedConfig = {
      ...config,
      data: {
        ...config.data,
        filters: config.data.filters?.filter(f => f.field !== filterField) || []
      }
    };

    return this.updatePivotConfig(configId, updatedConfig);
  }

  /**
   * Add dimension to pivot table
   */
  addDimension(configId: string, dimension: PivotDimension, position: 'rows' | 'columns'): Observable<PivotTableData> {
    const config = this._configs().get(configId);
    if (!config) {
      throw new Error(`Pivot config not found: ${configId}`);
    }

    const updatedConfig = {
      ...config,
      dimensions: {
        ...config.dimensions,
        [position]: [...config.dimensions[position], dimension]
      }
    };

    return this.updatePivotConfig(configId, updatedConfig);
  }

  /**
   * Remove dimension from pivot table
   */
  removeDimension(configId: string, fieldName: string): Observable<PivotTableData> {
    const config = this._configs().get(configId);
    if (!config) {
      throw new Error(`Pivot config not found: ${configId}`);
    }

    const updatedConfig = {
      ...config,
      dimensions: {
        ...config.dimensions,
        rows: config.dimensions.rows.filter(d => d.field !== fieldName),
        columns: config.dimensions.columns.filter(d => d.field !== fieldName),
        filters: config.dimensions.filters.filter(d => d.field !== fieldName)
      }
    };

    return this.updatePivotConfig(configId, updatedConfig);
  }

  /**
   * Add measure to pivot table
   */
  addMeasure(configId: string, measure: PivotMeasure): Observable<PivotTableData> {
    const config = this._configs().get(configId);
    if (!config) {
      throw new Error(`Pivot config not found: ${configId}`);
    }

    const updatedConfig = {
      ...config,
      dimensions: {
        ...config.dimensions,
        measures: [...config.dimensions.measures, measure]
      }
    };

    return this.updatePivotConfig(configId, updatedConfig);
  }

  /**
   * Update measure in pivot table
   */
  updateMeasure(configId: string, fieldName: string, updates: Partial<PivotMeasure>): Observable<PivotTableData> {
    const config = this._configs().get(configId);
    if (!config) {
      throw new Error(`Pivot config not found: ${configId}`);
    }

    const updatedConfig = {
      ...config,
      dimensions: {
        ...config.dimensions,
        measures: config.dimensions.measures.map(m =>
          m.field === fieldName ? { ...m, ...updates } : m
        )
      }
    };

    return this.updatePivotConfig(configId, updatedConfig);
  }

  /**
   * Export pivot table data
   */
  exportPivotTable(configId: string, format: PivotExportFormat): Observable<Blob> {
    const pivotData = this._data().get(configId);
    const config = this._configs().get(configId);

    if (!pivotData || !config) {
      throw new Error(`Pivot data or config not found: ${configId}`);
    }

    return from(this.performExport(pivotData, config, format));
  }

  /**
   * Get computed pivot data signal
   */
  getPivotData(configId: string): Signal<PivotTableData | null> {
    return computed(() => {
      return this._data().get(configId) || null;
    });
  }

  /**
   * Cache raw data for pivot table
   */
  cacheRawData(configId: string, data: any[]): void {
    this._cache.update(cache => {
      const newCache = new Map(cache);
      newCache.set(configId, data);
      return newCache;
    });
  }

  // Private implementation methods

  private async processPivotData(config: PivotTableConfig, rawData: any[]): Promise<PivotTableData> {
    const startTime = Date.now();

    // Apply data filters
    let filteredData = this.applyDataFilters(rawData, config.data.filters || []);

    // Apply data sorting
    if (config.data.sorting) {
      filteredData = this.applySorting(filteredData, config.data.sorting);
    }

    // Apply data limit
    if (config.data.limit) {
      filteredData = filteredData.slice(0, config.data.limit);
    }

    // Generate pivot structure
    const pivotStructure = this.buildPivotStructure(config, filteredData);
    
    // Generate headers
    const headers = this.generateHeaders(pivotStructure, config);
    
    // Generate rows with data
    const rows = this.generateRows(pivotStructure, config, filteredData);
    
    // Calculate totals
    const totals = this.calculateTotals(rows, config);
    
    // Create metadata
    const metadata: PivotMetadata = {
      totalRows: filteredData.length,
      totalColumns: headers.length,
      dataRows: rows.filter(r => r.type === 'data').length,
      generatedAt: new Date(),
      queryTime: Date.now() - startTime
    };

    return {
      headers,
      rows,
      totals,
      metadata
    };
  }

  private applyDataFilters(data: any[], filters: PivotFilter[]): any[] {
    return data.filter(row => {
      return filters.every(filter => this.evaluateFilter(row, filter));
    });
  }

  private evaluateFilter(row: any, filter: PivotFilter): boolean {
    const value = row[filter.field];

    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      case 'not-equals':
        return value !== filter.value;
      case 'contains':
        return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
      case 'not-contains':
        return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
      case 'starts-with':
        return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
      case 'ends-with':
        return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
      case 'greater-than':
        return Number(value) > Number(filter.value);
      case 'less-than':
        return Number(value) < Number(filter.value);
      case 'greater-equal':
        return Number(value) >= Number(filter.value);
      case 'less-equal':
        return Number(value) <= Number(filter.value);
      case 'between':
        return filter.values && filter.values.length >= 2 &&
               Number(value) >= Number(filter.values[0]) &&
               Number(value) <= Number(filter.values[1]);
      case 'in':
        return filter.values && filter.values.includes(value);
      case 'not-in':
        return filter.values && !filter.values.includes(value);
      case 'is-null':
        return value == null;
      case 'is-not-null':
        return value != null;
      default:
        return true;
    }
  }

  private applySorting(data: any[], sorting: any[]): any[] {
    return [...data].sort((a, b) => {
      for (const sort of sorting) {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;
        
        if (comparison !== 0) {
          return sort.direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  private buildPivotStructure(config: PivotTableConfig, data: any[]): PivotStructure {
    const structure: PivotStructure = {
      rowGroups: new Map(),
      columnGroups: new Map(),
      cells: new Map()
    };

    // Build row groups
    data.forEach(row => {
      const rowKey = this.buildDimensionKey(row, config.dimensions.rows);
      if (!structure.rowGroups.has(rowKey)) {
        structure.rowGroups.set(rowKey, {
          key: rowKey,
          values: this.getDimensionValues(row, config.dimensions.rows),
          data: []
        });
      }
      structure.rowGroups.get(rowKey)!.data.push(row);
    });

    // Build column groups
    data.forEach(row => {
      const colKey = this.buildDimensionKey(row, config.dimensions.columns);
      if (!structure.columnGroups.has(colKey)) {
        structure.columnGroups.set(colKey, {
          key: colKey,
          values: this.getDimensionValues(row, config.dimensions.columns),
          data: []
        });
      }
      structure.columnGroups.get(colKey)!.data.push(row);
    });

    // Build cells (intersection of row and column groups)
    structure.rowGroups.forEach((rowGroup, rowKey) => {
      structure.columnGroups.forEach((colGroup, colKey) => {
        const cellKey = `${rowKey}|${colKey}`;
        const cellData = data.filter(row => 
          this.buildDimensionKey(row, config.dimensions.rows) === rowKey &&
          this.buildDimensionKey(row, config.dimensions.columns) === colKey
        );
        
        if (cellData.length > 0) {
          structure.cells.set(cellKey, {
            key: cellKey,
            rowKey,
            colKey,
            data: cellData,
            measures: this.calculateMeasures(cellData, config.dimensions.measures)
          });
        }
      });
    });

    return structure;
  }

  private buildDimensionKey(row: any, dimensions: PivotDimension[]): string {
    return dimensions.map(dim => {
      const value = row[dim.field];
      return this.formatDimensionValue(value, dim);
    }).join('|');
  }

  private getDimensionValues(row: any, dimensions: PivotDimension[]): any[] {
    return dimensions.map(dim => {
      const value = row[dim.field];
      return this.formatDimensionValue(value, dim);
    });
  }

  private formatDimensionValue(value: any, dimension: PivotDimension): any {
    if (!dimension.grouping || dimension.grouping.type === 'none') {
      return value;
    }

    switch (dimension.grouping.type) {
      case 'date-year':
        return new Date(value).getFullYear();
      case 'date-quarter':
        const date = new Date(value);
        return `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
      case 'date-month':
        return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      case 'date-week':
        // Simplified week calculation
        const week = Math.ceil((new Date(value).getDate()) / 7);
        return `Week ${week}`;
      case 'date-day':
        return new Date(value).toLocaleDateString();
      case 'number-range':
        const rangeSize = dimension.grouping.config?.rangeSize || 100;
        const rangeStart = Math.floor(Number(value) / rangeSize) * rangeSize;
        return `${rangeStart} - ${rangeStart + rangeSize - 1}`;
      default:
        return value;
    }
  }

  private calculateMeasures(data: any[], measures: PivotMeasure[]): Map<string, any> {
    const results = new Map();

    measures.forEach(measure => {
      const values = data.map(row => row[measure.field]).filter(v => v != null);
      let result = 0;

      switch (measure.aggregation.type) {
        case 'sum':
          result = values.reduce((sum, val) => sum + Number(val), 0);
          break;
        case 'avg':
          result = values.length > 0 ? values.reduce((sum, val) => sum + Number(val), 0) / values.length : 0;
          break;
        case 'count':
          result = measure.aggregation.distinct ? new Set(values).size : values.length;
          break;
        case 'count-distinct':
          result = new Set(values).size;
          break;
        case 'min':
          result = values.length > 0 ? Math.min(...values.map(Number)) : 0;
          break;
        case 'max':
          result = values.length > 0 ? Math.max(...values.map(Number)) : 0;
          break;
        case 'median':
          result = this.calculateMedian(values.map(Number));
          break;
        case 'mode':
          result = this.calculateMode(values);
          break;
        case 'stddev':
          result = this.calculateStandardDeviation(values.map(Number));
          break;
        case 'variance':
          result = this.calculateVariance(values.map(Number));
          break;
        case 'first':
          result = values[0];
          break;
        case 'last':
          result = values[values.length - 1];
          break;
      }

      // Apply custom calculation if specified
      if (measure.calculation) {
        result = this.applyCustomCalculation(result, measure.calculation, data);
      }

      // Apply "Show As" transformation
      if (measure.showAs) {
        result = this.applyShowAs(result, measure.showAs, data);
      }

      results.set(measure.field, result);
    });

    return results;
  }

  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private calculateMode(values: any[]): any {
    if (values.length === 0) return null;
    
    const frequency = new Map();
    values.forEach(val => {
      frequency.set(val, (frequency.get(val) || 0) + 1);
    });
    
    let maxCount = 0;
    let mode = values[0];
    
    frequency.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mode = value;
      }
    });
    
    return mode;
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  private calculateVariance(values: number[]): number {
    const stdDev = this.calculateStandardDeviation(values);
    return Math.pow(stdDev, 2);
  }

  private applyCustomCalculation(value: any, calculation: any, data: any[]): any {
    // This would evaluate custom formulas
    // Simplified implementation
    try {
      let formula = calculation.formula;
      Object.entries(calculation.variables).forEach(([variable, field]) => {
        const fieldValue = this.calculateMeasures(data, [{
          field: field as string,
          aggregation: { type: 'sum' },
          displayName: field as string
        }]).get(field as string) || 0;
        formula = formula.replace(new RegExp(`\\b${variable}\\b`, 'g'), fieldValue.toString());
      });
      
      // UNSAFE - would need proper expression parser
      return new Function(`return ${formula}`)();
    } catch {
      return value;
    }
  }

  private applyShowAs(value: any, showAs: any, data: any[]): any {
    // Apply "Show As" transformations like percentages, differences, etc.
    switch (showAs.type) {
      case 'percent-of-total':
        // Would need access to total value
        return value;
      case 'percent-of-column':
        // Would need access to column total
        return value;
      case 'percent-of-row':
        // Would need access to row total
        return value;
      case 'difference-from':
        // Would need baseline value
        return value;
      case 'percent-difference-from':
        // Would need baseline value
        return value;
      default:
        return value;
    }
  }

  private generateHeaders(structure: PivotStructure, config: PivotTableConfig): PivotHeader[] {
    const headers: PivotHeader[] = [];

    // Row dimension headers
    config.dimensions.rows.forEach((dim, index) => {
      headers.push({
        level: index,
        text: dim.displayName || dim.field,
        field: dim.field,
        colspan: 1,
        rowspan: config.dimensions.rows.length,
        type: 'dimension'
      });
    });

    // Column headers (can be multiple levels)
    const columnStructure = this.buildColumnHeaderStructure(structure.columnGroups, config.dimensions.columns);
    headers.push(...columnStructure);

    return headers;
  }

  private buildColumnHeaderStructure(columnGroups: Map<string, any>, dimensions: PivotDimension[]): PivotHeader[] {
    // This would build hierarchical column headers
    // Simplified implementation
    const headers: PivotHeader[] = [];
    
    columnGroups.forEach((group, key) => {
      group.values.forEach((value: any, index: number) => {
        headers.push({
          level: index,
          text: String(value),
          field: dimensions[index]?.field,
          colspan: 1,
          rowspan: 1,
          type: 'dimension'
        });
      });
    });

    return headers;
  }

  private generateRows(structure: PivotStructure, config: PivotTableConfig, data: any[]): PivotRow[] {
    const rows: PivotRow[] = [];

    structure.rowGroups.forEach((rowGroup, rowKey) => {
      const row: PivotRow = {
        level: 0,
        headers: [],
        data: [],
        type: 'data'
      };

      // Add row headers
      rowGroup.values.forEach((value: any, index: number) => {
        row.headers.push({
          value,
          formattedValue: this.formatCellValue(value, config.dimensions.rows[index]),
          field: config.dimensions.rows[index].field,
          type: 'dimension'
        });
      });

      // Add data cells
      structure.columnGroups.forEach((colGroup, colKey) => {
        const cellKey = `${rowKey}|${colKey}`;
        const cell = structure.cells.get(cellKey);

        if (cell) {
          config.dimensions.measures.forEach(measure => {
            const measureValue = cell.measures.get(measure.field) || 0;
            row.data.push({
              value: measureValue,
              formattedValue: this.formatCellValue(measureValue, measure),
              field: measure.field,
              type: 'measure',
              metadata: {
                original: measureValue,
                aggregated: true
              }
            });
          });
        } else {
          // Empty cell
          config.dimensions.measures.forEach(measure => {
            row.data.push({
              value: null,
              formattedValue: '',
              field: measure.field,
              type: 'measure'
            });
          });
        }
      });

      rows.push(row);
    });

    return rows;
  }

  private calculateTotals(rows: PivotRow[], config: PivotTableConfig): PivotTotals | undefined {
    if (!config.layout.showGrandTotals && !config.layout.showSubTotals) {
      return undefined;
    }

    // Calculate row totals
    const rowTotals: PivotCell[] = [];
    const columnTotals: PivotCell[] = [];
    let grandTotal = 0;

    // This would calculate actual totals based on the data
    // Simplified implementation
    const grandTotalCell: PivotCell = {
      value: grandTotal,
      formattedValue: this.formatNumber(grandTotal),
      type: 'total'
    };

    return {
      rowTotals,
      columnTotals,
      grandTotal: grandTotalCell
    };
  }

  private formatCellValue(value: any, config: PivotDimension | PivotMeasure): string {
    if (value == null) return '';

    const formatting = config.formatting;
    if (!formatting) return String(value);

    switch (formatting.type) {
      case 'number':
        return this.formatNumber(Number(value), formatting);
      case 'currency':
        return this.formatCurrency(Number(value), formatting);
      case 'percentage':
        return this.formatPercentage(Number(value), formatting);
      case 'date':
        return this.formatDate(new Date(value), formatting);
      case 'datetime':
        return this.formatDateTime(new Date(value), formatting);
      default:
        return String(value);
    }
  }

  private formatNumber(value: number, formatting?: any): string {
    if (!formatting) return value.toString();

    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: formatting.decimals || 0,
      maximumFractionDigits: formatting.decimals || 2
    };

    let formatted = new Intl.NumberFormat(formatting.locale || 'en-US', options).format(value);

    if (formatting.prefix) formatted = formatting.prefix + formatted;
    if (formatting.suffix) formatted = formatted + formatting.suffix;

    return formatted;
  }

  private formatCurrency(value: number, formatting?: any): string {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: formatting?.currency || 'USD',
      minimumFractionDigits: formatting?.decimals || 2
    };

    return new Intl.NumberFormat(formatting?.locale || 'en-US', options).format(value);
  }

  private formatPercentage(value: number, formatting?: any): string {
    const options: Intl.NumberFormatOptions = {
      style: 'percent',
      minimumFractionDigits: formatting?.decimals || 1,
      maximumFractionDigits: formatting?.decimals || 1
    };

    return new Intl.NumberFormat(formatting?.locale || 'en-US', options).format(value);
  }

  private formatDate(date: Date, formatting?: any): string {
    return date.toLocaleDateString(formatting?.locale || 'en-US');
  }

  private formatDateTime(date: Date, formatting?: any): string {
    return date.toLocaleString(formatting?.locale || 'en-US');
  }

  private async performExport(pivotData: PivotTableData, config: PivotTableConfig, format: PivotExportFormat): Promise<Blob> {
    switch (format) {
      case 'excel':
        return this.exportToExcel(pivotData, config);
      case 'csv':
        return this.exportToCSV(pivotData, config);
      case 'pdf':
        return this.exportToPDF(pivotData, config);
      case 'json':
        return this.exportToJSON(pivotData, config);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportToExcel(pivotData: PivotTableData, config: PivotTableConfig): Promise<Blob> {
    // Implementation would use ExcelJS or similar
    const csvData = this.convertToCSV(pivotData);
    return Promise.resolve(new Blob([csvData], { type: 'text/csv' }));
  }

  private exportToCSV(pivotData: PivotTableData, config: PivotTableConfig): Promise<Blob> {
    const csvData = this.convertToCSV(pivotData);
    return Promise.resolve(new Blob([csvData], { type: 'text/csv' }));
  }

  private exportToPDF(pivotData: PivotTableData, config: PivotTableConfig): Promise<Blob> {
    // Implementation would use jsPDF or similar
    return Promise.resolve(new Blob(['PDF content'], { type: 'application/pdf' }));
  }

  private exportToJSON(pivotData: PivotTableData, config: PivotTableConfig): Promise<Blob> {
    const jsonData = JSON.stringify({ pivotData, config }, null, 2);
    return Promise.resolve(new Blob([jsonData], { type: 'application/json' }));
  }

  private convertToCSV(pivotData: PivotTableData): string {
    let csv = '';

    // Add headers
    const headerRow = pivotData.headers.map(h => `"${h.text}"`).join(',');
    csv += headerRow + '\n';

    // Add data rows
    pivotData.rows.forEach(row => {
      const rowData: string[] = [];
      
      row.headers.forEach(header => {
        rowData.push(`"${header.formattedValue}"`);
      });
      
      row.data.forEach(cell => {
        rowData.push(`"${cell.formattedValue}"`);
      });
      
      csv += rowData.join(',') + '\n';
    });

    return csv;
  }
}

// Helper interfaces
interface PivotStructure {
  rowGroups: Map<string, GroupData>;
  columnGroups: Map<string, GroupData>;
  cells: Map<string, CellData>;
}

interface GroupData {
  key: string;
  values: any[];
  data: any[];
}

interface CellData {
  key: string;
  rowKey: string;
  colKey: string;
  data: any[];
  measures: Map<string, any>;
}