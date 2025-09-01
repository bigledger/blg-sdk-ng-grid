import { Injectable } from '@angular/core';
import { 
  ChartExportConfig, 
  ExportedFile,
  DataExportOptions,
  CsvDataExportOptions,
  ExcelDataExportOptions,
  JsonDataExportOptions,
  ExcelCellStyle
} from '../interfaces/chart-export';

/**
 * Data Export Service
 * Handles CSV, JSON, and Excel exports with chart data
 */
@Injectable({
  providedIn: 'root'
})
export class DataExportService {

  /**
   * Export chart data in various formats
   */
  async export(config: ChartExportConfig, abortSignal?: AbortSignal): Promise<ExportedFile> {
    const options = config.formatOptions as DataExportOptions;
    
    if (abortSignal?.aborted) {
      throw new Error('Export cancelled');
    }

    try {
      switch (config.format) {
        case 'csv':
          return await this.exportCsv(config, options);
        case 'json':
          return await this.exportJson(config, options);
        case 'excel':
          return await this.exportExcel(config, options);
        default:
          throw new Error(`Unsupported data format: ${config.format}`);
      }
    } catch (error) {
      throw new Error(`Data export failed: ${error}`);
    }
  }

  /**
   * Get preview of data export
   */
  async getPreview(config: ChartExportConfig): Promise<string> {
    const chartData = this.getChartData(config);
    const processedData = this.processChartData(chartData, config.formatOptions as DataExportOptions);
    
    if (config.format === 'csv') {
      const csvPreview = this.generateCsvContent(processedData, {
        delimiter: ',',
        textQualifier: '"',
        lineEnding: '\n',
        includeHeaders: true,
        dateFormat: 'iso',
        numberFormat: 'general',
        encoding: 'UTF-8'
      });
      
      // Return first 10 lines for preview
      const lines = csvPreview.split('\n');
      const preview = lines.slice(0, Math.min(10, lines.length)).join('\n');
      return preview + (lines.length > 10 ? '\n...' : '');
      
    } else if (config.format === 'json') {
      const jsonPreview = JSON.stringify(processedData, null, 2);
      return jsonPreview.length > 1000 ? jsonPreview.substring(0, 1000) + '...' : jsonPreview;
    }
    
    return 'Preview not available for this format';
  }

  /**
   * Export as CSV
   */
  private async exportCsv(config: ChartExportConfig, options: DataExportOptions): Promise<ExportedFile> {
    const csvOptions = options.csvOptions || this.getDefaultCsvOptions();
    const chartData = this.getChartData(config);
    const processedData = this.processChartData(chartData, options);
    
    const csvContent = this.generateCsvContent(processedData, csvOptions);
    
    // Add BOM if using UTF-8 encoding
    const finalContent = csvOptions.encoding === 'UTF-8' && csvOptions.includeHeaders 
      ? '\uFEFF' + csvContent 
      : csvContent;
    
    const blob = new Blob([finalContent], { 
      type: 'text/csv;charset=' + (csvOptions.encoding || 'UTF-8') 
    });
    
    return {
      filename: `${config.filename}.csv`,
      format: 'csv',
      size: blob.size,
      data: blob,
      mimeType: 'text/csv',
      createdAt: new Date()
    };
  }

  /**
   * Export as JSON
   */
  private async exportJson(config: ChartExportConfig, options: DataExportOptions): Promise<ExportedFile> {
    const jsonOptions = options.jsonOptions || this.getDefaultJsonOptions();
    const chartData = this.getChartData(config);
    const processedData = this.processChartData(chartData, options);
    
    let exportData: any = processedData;
    
    // Add metadata if requested
    if (jsonOptions.includeMetadata) {
      exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          chartType: this.getChartType(config),
          dataPoints: this.countDataPoints(processedData),
          exportConfig: config
        },
        data: processedData
      };
    }
    
    // Add chart configuration if requested
    if (jsonOptions.includeChartConfig) {
      exportData.chartConfig = this.getChartConfig(config);
    }
    
    const jsonContent = jsonOptions.prettyPrint 
      ? JSON.stringify(exportData, this.createJsonReplacer(jsonOptions), 2)
      : JSON.stringify(exportData, this.createJsonReplacer(jsonOptions));
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    return {
      filename: `${config.filename}.json`,
      format: 'json',
      size: blob.size,
      data: blob,
      mimeType: 'application/json',
      createdAt: new Date()
    };
  }

  /**
   * Export as Excel
   */
  private async exportExcel(config: ChartExportConfig, options: DataExportOptions): Promise<ExportedFile> {
    const excelOptions = options.excelOptions || this.getDefaultExcelOptions();
    const chartData = this.getChartData(config);
    const processedData = this.processChartData(chartData, options);
    
    // Create workbook structure
    const workbook = this.createExcelWorkbook(config, processedData, excelOptions);
    
    // Generate Excel file
    const excelBuffer = await this.generateExcelFile(workbook, excelOptions);
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    return {
      filename: `${config.filename}.xlsx`,
      format: 'excel',
      size: blob.size,
      data: blob,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      createdAt: new Date()
    };
  }

  /**
   * Process chart data based on export options
   */
  private processChartData(chartData: any, options: DataExportOptions): any {
    let processedData: any = {};
    
    // Include raw data
    if (options.includeRawData) {
      processedData.rawData = this.formatDataStructure(chartData.raw || chartData, options.dataFormat);
    }
    
    // Include aggregated data
    if (options.includeAggregatedData) {
      processedData.aggregatedData = this.aggregateData(chartData);
    }
    
    // Include statistics
    if (options.includeStatistics) {
      processedData.statistics = this.calculateStatistics(chartData);
    }
    
    // If only one data type is requested, flatten the structure
    const dataTypes = [options.includeRawData, options.includeAggregatedData, options.includeStatistics];
    const activeTypes = dataTypes.filter(Boolean).length;
    
    if (activeTypes === 1) {
      return Object.values(processedData)[0];
    }
    
    return processedData;
  }

  /**
   * Format data structure based on requested format
   */
  private formatDataStructure(data: any[], format: string): any {
    switch (format) {
      case 'flat':
        return this.flattenData(data);
      case 'nested':
        return data; // Keep original structure
      case 'pivot':
        return this.pivotData(data);
      case 'time-series':
        return this.formatTimeSeries(data);
      default:
        return data;
    }
  }

  /**
   * Flatten nested data structures
   */
  private flattenData(data: any[]): any[] {
    const flattened: any[] = [];
    
    data.forEach(item => {
      if (Array.isArray(item.data)) {
        item.data.forEach((point: any, index: number) => {
          flattened.push({
            series: item.name || `Series ${index + 1}`,
            x: point.x,
            y: point.y,
            z: point.z,
            value: point.value,
            label: point.label,
            ...point.metadata
          });
        });
      } else {
        flattened.push(item);
      }
    });
    
    return flattened;
  }

  /**
   * Create pivot table structure from data
   */
  private pivotData(data: any[]): any {
    const pivot: any = {};
    const flatData = this.flattenData(data);
    
    flatData.forEach(item => {
      const seriesKey = item.series || 'Default';
      if (!pivot[seriesKey]) {
        pivot[seriesKey] = {};
      }
      
      const xKey = item.x || item.label || 'Unknown';
      pivot[seriesKey][xKey] = item.y || item.value;
    });
    
    return pivot;
  }

  /**
   * Format data as time series
   */
  private formatTimeSeries(data: any[]): any[] {
    const flatData = this.flattenData(data);
    
    return flatData
      .filter(item => item.x !== undefined)
      .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime())
      .map(item => ({
        timestamp: item.x,
        value: item.y || item.value,
        series: item.series,
        metadata: item.metadata
      }));
  }

  /**
   * Aggregate data for summary statistics
   */
  private aggregateData(chartData: any): any {
    const flatData = this.flattenData(chartData.raw || chartData);
    const groupedBySeries: { [key: string]: any[] } = {};
    
    // Group by series
    flatData.forEach(item => {
      const seriesKey = item.series || 'Default';
      if (!groupedBySeries[seriesKey]) {
        groupedBySeries[seriesKey] = [];
      }
      groupedBySeries[seriesKey].push(item);
    });
    
    // Calculate aggregates for each series
    const aggregated: any = {};
    
    Object.keys(groupedBySeries).forEach(seriesKey => {
      const seriesData = groupedBySeries[seriesKey];
      const values = seriesData.map(item => item.y || item.value).filter(v => typeof v === 'number');
      
      aggregated[seriesKey] = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        min: Math.min(...values),
        max: Math.max(...values),
        first: values[0],
        last: values[values.length - 1]
      };
    });
    
    return aggregated;
  }

  /**
   * Calculate statistical summary
   */
  private calculateStatistics(chartData: any): any {
    const flatData = this.flattenData(chartData.raw || chartData);
    const values = flatData.map(item => item.y || item.value).filter(v => typeof v === 'number');
    
    if (values.length === 0) {
      return { error: 'No numerical data found' };
    }
    
    const sorted = values.slice().sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    
    return {
      count: values.length,
      sum,
      mean,
      median: this.calculateMedian(sorted),
      mode: this.calculateMode(values),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      range: sorted[sorted.length - 1] - sorted[0],
      variance,
      standardDeviation: Math.sqrt(variance),
      quartiles: this.calculateQuartiles(sorted)
    };
  }

  /**
   * Generate CSV content
   */
  private generateCsvContent(data: any, options: CsvDataExportOptions): string {
    if (Array.isArray(data)) {
      return this.arrayToCsv(data, options);
    } else if (typeof data === 'object') {
      return this.objectToCsv(data, options);
    }
    
    throw new Error('Unsupported data structure for CSV export');
  }

  /**
   * Convert array to CSV
   */
  private arrayToCsv(data: any[], options: CsvDataExportOptions): string {
    if (data.length === 0) return '';
    
    // Extract headers
    const headers = Object.keys(data[0]);
    let csvContent = '';
    
    // Add headers if requested
    if (options.includeHeaders) {
      csvContent += headers
        .map(header => this.escapeCsvValue(header, options))
        .join(options.delimiter) + options.lineEnding;
    }
    
    // Add data rows
    data.forEach(row => {
      const csvRow = headers
        .map(header => this.formatCsvValue(row[header], options))
        .map(value => this.escapeCsvValue(value, options))
        .join(options.delimiter);
      
      csvContent += csvRow + options.lineEnding;
    });
    
    return csvContent;
  }

  /**
   * Convert object to CSV
   */
  private objectToCsv(data: any, options: CsvDataExportOptions): string {
    let csvContent = '';
    
    // Handle nested object structure
    Object.keys(data).forEach((key, index) => {
      if (index > 0) csvContent += options.lineEnding;
      
      csvContent += `${key}:${options.lineEnding}`;
      
      if (Array.isArray(data[key])) {
        csvContent += this.arrayToCsv(data[key], options);
      } else {
        csvContent += JSON.stringify(data[key]);
      }
    });
    
    return csvContent;
  }

  /**
   * Format CSV value based on type
   */
  private formatCsvValue(value: any, options: CsvDataExportOptions): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (value instanceof Date) {
      return this.formatDate(value, options.dateFormat);
    }
    
    if (typeof value === 'number') {
      return this.formatNumber(value, options.numberFormat);
    }
    
    return String(value);
  }

  /**
   * Escape CSV value
   */
  private escapeCsvValue(value: string, options: CsvDataExportOptions): string {
    if (options.textQualifier === 'none') {
      return value;
    }
    
    const qualifier = options.textQualifier;
    
    // Escape if value contains delimiter, qualifier, or line ending
    if (value.includes(options.delimiter) || 
        value.includes(qualifier) || 
        value.includes('\n') || 
        value.includes('\r')) {
      
      // Double the qualifiers
      const escaped = value.replace(new RegExp(qualifier, 'g'), qualifier + qualifier);
      return qualifier + escaped + qualifier;
    }
    
    return value;
  }

  /**
   * Create Excel workbook structure
   */
  private createExcelWorkbook(
    config: ChartExportConfig, 
    data: any, 
    options: ExcelDataExportOptions
  ): any {
    const workbook: any = {
      worksheets: [],
      metadata: {
        title: config.filename,
        creator: 'Chart Export Tool',
        created: new Date()
      }
    };
    
    // Main data worksheet
    const mainWorksheet = this.createDataWorksheet(data, options);
    workbook.worksheets.push(mainWorksheet);
    
    // Additional worksheets if configured
    if (options.multipleWorksheets) {
      if (options.worksheetPerSeries && Array.isArray(data)) {
        data.forEach((seriesData, index) => {
          const seriesWorksheet = this.createDataWorksheet(
            seriesData, 
            { ...options, worksheetName: `Series ${index + 1}` }
          );
          workbook.worksheets.push(seriesWorksheet);
        });
      }
    }
    
    // Pivot tables worksheet
    if (options.includePivotTables) {
      const pivotWorksheet = this.createPivotWorksheet(data, options);
      workbook.worksheets.push(pivotWorksheet);
    }
    
    return workbook;
  }

  /**
   * Create data worksheet
   */
  private createDataWorksheet(data: any, options: ExcelDataExportOptions): any {
    const worksheet: any = {
      name: options.worksheetName || 'Chart Data',
      rows: []
    };
    
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      
      // Header row
      worksheet.rows.push({
        cells: headers.map(header => ({
          value: header,
          style: options.headerStyle
        }))
      });
      
      // Data rows
      data.forEach(item => {
        worksheet.rows.push({
          cells: headers.map(header => ({
            value: item[header],
            style: options.dataStyle
          }))
        });
      });
    }
    
    return worksheet;
  }

  /**
   * Create pivot worksheet
   */
  private createPivotWorksheet(data: any, options: ExcelDataExportOptions): any {
    const pivotData = this.pivotData(data);
    
    return {
      name: 'Pivot Table',
      rows: this.convertPivotToRows(pivotData, options)
    };
  }

  /**
   * Convert pivot data to worksheet rows
   */
  private convertPivotToRows(pivotData: any, options: ExcelDataExportOptions): any[] {
    const rows: any[] = [];
    const series = Object.keys(pivotData);
    const allKeys = new Set<string>();
    
    // Collect all unique keys
    series.forEach(s => {
      Object.keys(pivotData[s]).forEach(k => allKeys.add(k));
    });
    
    const sortedKeys = Array.from(allKeys).sort();
    
    // Header row
    rows.push({
      cells: ['Series', ...sortedKeys].map(header => ({
        value: header,
        style: options.headerStyle
      }))
    });
    
    // Data rows
    series.forEach(seriesName => {
      rows.push({
        cells: [
          { value: seriesName, style: options.dataStyle },
          ...sortedKeys.map(key => ({
            value: pivotData[seriesName][key] || '',
            style: options.dataStyle
          }))
        ]
      });
    });
    
    return rows;
  }

  /**
   * Generate Excel file from workbook structure
   */
  private async generateExcelFile(workbook: any, options: ExcelDataExportOptions): Promise<ArrayBuffer> {
    // This would typically use a library like ExcelJS or SheetJS
    // For now, return a minimal Excel-like structure
    
    // Create a simple XML-based Excel file
    const xmlContent = this.createExcelXml(workbook, options);
    return new TextEncoder().encode(xmlContent).buffer;
  }

  /**
   * Create Excel XML content
   */
  private createExcelXml(workbook: any, options: ExcelDataExportOptions): string {
    // Simplified Excel XML structure
    return `
<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Size="12"/>
      <Interior ss:Color="#F0F0F0"/>
    </Style>
  </Styles>
  ${workbook.worksheets.map((ws: any) => this.createWorksheetXml(ws)).join('\n')}
</Workbook>
    `.trim();
  }

  /**
   * Create worksheet XML
   */
  private createWorksheetXml(worksheet: any): string {
    return `
<Worksheet ss:Name="${worksheet.name}">
  <Table>
    ${worksheet.rows.map((row: any) => this.createRowXml(row)).join('\n')}
  </Table>
</Worksheet>
    `.trim();
  }

  /**
   * Create row XML
   */
  private createRowXml(row: any): string {
    return `
<Row>
  ${row.cells.map((cell: any) => `<Cell><Data ss:Type="String">${cell.value}</Data></Cell>`).join('')}
</Row>
    `.trim();
  }

  /**
   * Helper methods
   */
  private calculateMedian(sortedValues: number[]): number {
    const mid = Math.floor(sortedValues.length / 2);
    return sortedValues.length % 2 === 0 
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];
  }

  private calculateMode(values: number[]): number[] {
    const frequency: { [key: number]: number } = {};
    let maxFreq = 0;
    
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
      maxFreq = Math.max(maxFreq, frequency[value]);
    });
    
    return Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFreq)
      .map(Number);
  }

  private calculateQuartiles(sortedValues: number[]): { q1: number; q3: number } {
    const mid = Math.floor(sortedValues.length / 2);
    const lowerHalf = sortedValues.slice(0, mid);
    const upperHalf = sortedValues.slice(sortedValues.length % 2 === 0 ? mid : mid + 1);
    
    return {
      q1: this.calculateMedian(lowerHalf),
      q3: this.calculateMedian(upperHalf)
    };
  }

  private formatDate(date: Date, format: string): string {
    switch (format) {
      case 'iso':
        return date.toISOString();
      case 'locale':
        return date.toLocaleDateString();
      default:
        return date.toString();
    }
  }

  private formatNumber(num: number, format: string): string {
    switch (format) {
      case 'currency':
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      case 'percentage':
        return (num * 100).toFixed(2) + '%';
      case 'scientific':
        return num.toExponential();
      default:
        return num.toString();
    }
  }

  private createJsonReplacer(options: JsonDataExportOptions) {
    return (key: string, value: any) => {
      if (value instanceof Date) {
        switch (options.dateFormat) {
          case 'iso':
            return value.toISOString();
          case 'timestamp':
            return value.getTime();
          case 'locale':
            return value.toLocaleDateString();
          default:
            return value.toISOString();
        }
      }
      
      if (typeof value === 'number' && options.numberPrecision !== undefined) {
        return Number(value.toFixed(options.numberPrecision));
      }
      
      return value;
    };
  }

  private getDefaultCsvOptions(): CsvDataExportOptions {
    return {
      delimiter: ',',
      textQualifier: '"',
      lineEnding: '\n',
      includeHeaders: true,
      dateFormat: 'iso',
      numberFormat: 'general',
      encoding: 'UTF-8'
    };
  }

  private getDefaultJsonOptions(): JsonDataExportOptions {
    return {
      prettyPrint: true,
      includeMetadata: true,
      includeChartConfig: false,
      dateFormat: 'iso',
      numberPrecision: 2
    };
  }

  private getDefaultExcelOptions(): ExcelDataExportOptions {
    return {
      worksheetName: 'Chart Data',
      includeChartImage: true,
      createNativeChart: false,
      multipleWorksheets: false,
      worksheetPerSeries: false,
      includePivotTables: false,
      autoSizeColumns: true,
      applyFormatting: true,
      headerStyle: {
        font: { bold: true, italic: false, color: '#000000', size: 12, family: 'Arial' },
        fill: { backgroundColor: '#f0f0f0', pattern: 'solid' },
        border: { top: true, right: true, bottom: true, left: true, color: '#000000', style: 'thin' },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: false },
        numberFormat: 'General'
      },
      dataStyle: {
        font: { bold: false, italic: false, color: '#000000', size: 11, family: 'Arial' },
        fill: { backgroundColor: '#ffffff', pattern: 'solid' },
        border: { top: false, right: true, bottom: false, left: false, color: '#cccccc', style: 'thin' },
        alignment: { horizontal: 'left', vertical: 'middle', wrapText: false },
        numberFormat: 'General'
      }
    };
  }

  private getChartData(config: ChartExportConfig): any {
    // This would typically access the chart's data
    // For now, return placeholder data
    return {
      raw: [
        { series: 'Series 1', x: '2024-01', y: 100 },
        { series: 'Series 1', x: '2024-02', y: 150 },
        { series: 'Series 2', x: '2024-01', y: 80 },
        { series: 'Series 2', x: '2024-02', y: 120 }
      ]
    };
  }

  private getChartType(config: ChartExportConfig): string {
    return 'line'; // Placeholder
  }

  private getChartConfig(config: ChartExportConfig): any {
    return {}; // Placeholder
  }

  private countDataPoints(data: any): number {
    if (Array.isArray(data)) {
      return data.length;
    }
    return 0;
  }
}