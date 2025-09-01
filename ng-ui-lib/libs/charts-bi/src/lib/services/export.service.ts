import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';

import {
  ExportFormat,
  DashboardConfig,
  DashboardWidget
} from '../interfaces/dashboard.interface.ts';

interface ExportOptions {
  includeCharts?: boolean;
  includeData?: boolean;
  includeFilters?: boolean;
  pageOrientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'letter' | 'legal';
  fileName?: string;
  author?: string;
  title?: string;
  watermark?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  
  /**
   * Export widget data
   */
  exportWidget(widget: DashboardWidget, data: any, format: ExportFormat, options: ExportOptions = {}): Observable<void> {
    switch (format) {
      case 'pdf':
        return this.exportWidgetToPDF(widget, data, options);
      case 'excel':
        return this.exportWidgetToExcel(widget, data, options);
      case 'csv':
        return this.exportWidgetToCSV(widget, data, options);
      case 'json':
        return this.exportWidgetToJSON(widget, data, options);
      case 'png':
        return this.exportWidgetToImage(widget, data, 'png', options);
      case 'svg':
        return this.exportWidgetToImage(widget, data, 'svg', options);
      default:
        return of(void 0);
    }
  }

  /**
   * Export entire dashboard
   */
  exportDashboard(config: DashboardConfig, data: Map<string, any>, format: ExportFormat, options: ExportOptions = {}): Observable<void> {
    switch (format) {
      case 'pdf':
        return this.exportDashboardToPDF(config, data, options);
      case 'excel':
        return this.exportDashboardToExcel(config, data, options);
      case 'json':
        return this.exportDashboardToJSON(config, data, options);
      default:
        return of(void 0);
    }
  }

  /**
   * Generate scheduled report
   */
  generateScheduledReport(config: ReportConfig): Observable<ReportResult> {
    return from(this.executeScheduledReport(config));
  }

  /**
   * Send report via email
   */
  sendReportEmail(recipients: string[], report: ReportResult, emailConfig: EmailConfig): Observable<void> {
    return from(this.sendEmailReport(recipients, report, emailConfig));
  }

  // Private implementation methods

  private exportWidgetToPDF(widget: DashboardWidget, data: any, options: ExportOptions): Observable<void> {
    return from(this.generateWidgetPDF(widget, data, options));
  }

  private async generateWidgetPDF(widget: DashboardWidget, data: any, options: ExportOptions): Promise<void> {
    // This would use a library like jsPDF or Puppeteer
    const pdf = this.createPDFDocument(options);
    
    // Add title
    pdf.addTitle(widget.title);
    
    // Add widget visualization
    if (options.includeCharts !== false) {
      const chartImage = await this.captureWidgetImage(widget);
      if (chartImage) {
        pdf.addImage(chartImage);
      }
    }
    
    // Add data table if requested
    if (options.includeData) {
      pdf.addTable(this.formatDataForTable(data));
    }
    
    // Add metadata
    pdf.addMetadata({
      title: widget.title,
      author: options.author || 'BI Dashboard',
      createdAt: new Date().toISOString()
    });
    
    // Download
    const fileName = options.fileName || `${widget.title}_${Date.now()}.pdf`;
    pdf.download(fileName);
  }

  private exportWidgetToExcel(widget: DashboardWidget, data: any, options: ExportOptions): Observable<void> {
    return from(this.generateWidgetExcel(widget, data, options));
  }

  private async generateWidgetExcel(widget: DashboardWidget, data: any, options: ExportOptions): Promise<void> {
    // This would use a library like ExcelJS or SheetJS
    const workbook = this.createExcelWorkbook();
    const worksheet = workbook.addWorksheet(widget.title);
    
    // Add title
    worksheet.addRow([widget.title]);
    worksheet.addRow([]); // Empty row
    
    // Add chart if possible (as image)
    if (options.includeCharts !== false) {
      const chartImage = await this.captureWidgetImage(widget);
      if (chartImage) {
        worksheet.addImage(chartImage, 'A3:H20');
        worksheet.addRow(new Array(20).fill('')); // Skip rows for chart
      }
    }
    
    // Add data
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      
      data.forEach(row => {
        worksheet.addRow(headers.map(header => row[header]));
      });
      
      // Format as table
      this.formatExcelTable(worksheet, headers.length, data.length + 1);
    }
    
    // Add formatting
    this.applyExcelFormatting(worksheet, widget);
    
    // Download
    const fileName = options.fileName || `${widget.title}_${Date.now()}.xlsx`;
    this.downloadExcelFile(workbook, fileName);
  }

  private exportWidgetToCSV(widget: DashboardWidget, data: any, options: ExportOptions): Observable<void> {
    return from(this.generateWidgetCSV(widget, data, options));
  }

  private async generateWidgetCSV(widget: DashboardWidget, data: any, options: ExportOptions): Promise<void> {
    if (!Array.isArray(data)) {
      throw new Error('CSV export requires array data');
    }
    
    let csv = '';
    
    // Add title as comment
    csv += `# ${widget.title}\n`;
    csv += `# Generated: ${new Date().toISOString()}\n`;
    csv += '\n';
    
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      
      // Add headers
      csv += headers.map(header => this.escapeCsvField(header)).join(',') + '\n';
      
      // Add data rows
      data.forEach(row => {
        csv += headers.map(header => this.escapeCsvField(row[header])).join(',') + '\n';
      });
    }
    
    // Download
    const fileName = options.fileName || `${widget.title}_${Date.now()}.csv`;
    this.downloadTextFile(csv, fileName, 'text/csv');
  }

  private exportWidgetToJSON(widget: DashboardWidget, data: any, options: ExportOptions): Observable<void> {
    return from(this.generateWidgetJSON(widget, data, options));
  }

  private async generateWidgetJSON(widget: DashboardWidget, data: any, options: ExportOptions): Promise<void> {
    const exportData = {
      widget: {
        id: widget.id,
        title: widget.title,
        type: widget.type,
        config: widget.config
      },
      data: data,
      metadata: {
        exportedAt: new Date().toISOString(),
        format: 'json',
        author: options.author
      }
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const fileName = options.fileName || `${widget.title}_${Date.now()}.json`;
    this.downloadTextFile(json, fileName, 'application/json');
  }

  private exportWidgetToImage(widget: DashboardWidget, data: any, format: 'png' | 'svg', options: ExportOptions): Observable<void> {
    return from(this.generateWidgetImage(widget, data, format, options));
  }

  private async generateWidgetImage(widget: DashboardWidget, data: any, format: 'png' | 'svg', options: ExportOptions): Promise<void> {
    const image = await this.captureWidgetImage(widget, format);
    if (image) {
      const fileName = options.fileName || `${widget.title}_${Date.now()}.${format}`;
      this.downloadBlob(image, fileName, `image/${format}`);
    }
  }

  private exportDashboardToPDF(config: DashboardConfig, data: Map<string, any>, options: ExportOptions): Observable<void> {
    return from(this.generateDashboardPDF(config, data, options));
  }

  private async generateDashboardPDF(config: DashboardConfig, data: Map<string, any>, options: ExportOptions): Promise<void> {
    const pdf = this.createPDFDocument({
      ...options,
      pageOrientation: 'landscape' // Better for dashboards
    });
    
    // Add dashboard title
    pdf.addTitle(config.title);
    pdf.addText(config.description || '');
    pdf.addPageBreak();
    
    // Add each widget
    for (const widget of config.widgets) {
      const widgetData = data.get(widget.id);
      
      if (widgetData) {
        pdf.addSection(widget.title);
        
        // Add widget visualization
        if (options.includeCharts !== false) {
          const chartImage = await this.captureWidgetImage(widget);
          if (chartImage) {
            pdf.addImage(chartImage);
          }
        }
        
        // Add data if requested
        if (options.includeData && Array.isArray(widgetData)) {
          pdf.addTable(this.formatDataForTable(widgetData));
        }
        
        pdf.addPageBreak();
      }
    }
    
    // Add metadata
    pdf.addMetadata({
      title: config.title,
      author: options.author || 'BI Dashboard',
      createdAt: new Date().toISOString()
    });
    
    // Download
    const fileName = options.fileName || `${config.title}_${Date.now()}.pdf`;
    pdf.download(fileName);
  }

  private exportDashboardToExcel(config: DashboardConfig, data: Map<string, any>, options: ExportOptions): Observable<void> {
    return from(this.generateDashboardExcel(config, data, options));
  }

  private async generateDashboardExcel(config: DashboardConfig, data: Map<string, any>, options: ExportOptions): Promise<void> {
    const workbook = this.createExcelWorkbook();
    
    // Create summary sheet
    const summarySheet = workbook.addWorksheet('Dashboard Summary');
    summarySheet.addRow([config.title]);
    summarySheet.addRow([config.description || '']);
    summarySheet.addRow([`Generated: ${new Date().toISOString()}`]);
    
    // Create sheet for each widget
    for (const widget of config.widgets) {
      const widgetData = data.get(widget.id);
      
      if (widgetData && Array.isArray(widgetData) && widgetData.length > 0) {
        const worksheet = workbook.addWorksheet(this.sanitizeSheetName(widget.title));
        
        // Add widget title
        worksheet.addRow([widget.title]);
        worksheet.addRow([]); // Empty row
        
        // Add data
        const headers = Object.keys(widgetData[0]);
        worksheet.addRow(headers);
        
        widgetData.forEach(row => {
          worksheet.addRow(headers.map(header => row[header]));
        });
        
        // Format as table
        this.formatExcelTable(worksheet, headers.length, widgetData.length + 1);
        this.applyExcelFormatting(worksheet, widget);
      }
    }
    
    // Download
    const fileName = options.fileName || `${config.title}_${Date.now()}.xlsx`;
    this.downloadExcelFile(workbook, fileName);
  }

  private exportDashboardToJSON(config: DashboardConfig, data: Map<string, any>, options: ExportOptions): Observable<void> {
    return from(this.generateDashboardJSON(config, data, options));
  }

  private async generateDashboardJSON(config: DashboardConfig, data: Map<string, any>, options: ExportOptions): Promise<void> {
    const exportData = {
      dashboard: {
        id: config.id,
        title: config.title,
        description: config.description,
        widgets: config.widgets.map(widget => ({
          id: widget.id,
          title: widget.title,
          type: widget.type,
          config: widget.config
        }))
      },
      data: Object.fromEntries(data),
      metadata: {
        exportedAt: new Date().toISOString(),
        format: 'json',
        author: options.author
      }
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const fileName = options.fileName || `${config.title}_${Date.now()}.json`;
    this.downloadTextFile(json, fileName, 'application/json');
  }

  // Scheduled reporting methods

  private async executeScheduledReport(config: ReportConfig): Promise<ReportResult> {
    // Load dashboard data
    const dashboardData = await this.loadDashboardData(config.dashboardId);
    
    // Generate report
    let reportBlob: Blob;
    
    switch (config.format) {
      case 'pdf':
        reportBlob = await this.generateReportPDF(config, dashboardData);
        break;
      case 'excel':
        reportBlob = await this.generateReportExcel(config, dashboardData);
        break;
      default:
        throw new Error(`Unsupported report format: ${config.format}`);
    }
    
    return {
      id: `report_${Date.now()}`,
      config,
      blob: reportBlob,
      generatedAt: new Date(),
      size: reportBlob.size
    };
  }

  private async sendEmailReport(recipients: string[], report: ReportResult, emailConfig: EmailConfig): Promise<void> {
    // This would integrate with email service (SendGrid, AWS SES, etc.)
    const emailData = {
      to: recipients,
      subject: emailConfig.subject || `Report: ${report.config.name}`,
      html: this.generateReportEmailHTML(report, emailConfig),
      attachments: [{
        filename: report.config.fileName || `report_${Date.now()}.${report.config.format}`,
        content: report.blob
      }]
    };
    
    // Send email (implementation would depend on email service)
    console.log('Sending email report:', emailData);
  }

  // Helper methods

  private createPDFDocument(options: ExportOptions): any {
    // This would return a PDF document instance from jsPDF or similar
    return {
      addTitle: (title: string) => { /* implementation */ },
      addText: (text: string) => { /* implementation */ },
      addImage: (image: any) => { /* implementation */ },
      addTable: (data: any[]) => { /* implementation */ },
      addSection: (title: string) => { /* implementation */ },
      addPageBreak: () => { /* implementation */ },
      addMetadata: (metadata: any) => { /* implementation */ },
      download: (fileName: string) => { /* implementation */ }
    };
  }

  private createExcelWorkbook(): any {
    // This would return an Excel workbook instance from ExcelJS or similar
    return {
      addWorksheet: (name: string) => ({
        addRow: (data: any[]) => { /* implementation */ },
        addImage: (image: any, range: string) => { /* implementation */ }
      })
    };
  }

  private async captureWidgetImage(widget: DashboardWidget, format: 'png' | 'svg' = 'png'): Promise<Blob | null> {
    // This would capture the widget's visual representation
    // Using html2canvas, dom-to-image, or similar library
    const widgetElement = document.querySelector(`[data-widget-id="${widget.id}"]`);
    
    if (!widgetElement) {
      return null;
    }
    
    try {
      // Capture implementation would go here
      return new Blob(); // Placeholder
    } catch (error) {
      console.error('Error capturing widget image:', error);
      return null;
    }
  }

  private formatDataForTable(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    const headers = Object.keys(data[0]);
    return [headers, ...data.map(row => headers.map(header => row[header]))];
  }

  private formatExcelTable(worksheet: any, columns: number, rows: number): void {
    // Format as Excel table
    // Implementation would depend on Excel library
  }

  private applyExcelFormatting(worksheet: any, widget: DashboardWidget): void {
    // Apply formatting based on widget type and theme
    // Implementation would depend on Excel library
  }

  private escapeCsvField(value: any): string {
    if (value == null) return '';
    
    const stringValue = String(value);
    
    // Escape quotes and wrap in quotes if necessary
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  private sanitizeSheetName(name: string): string {
    // Remove invalid Excel sheet name characters
    return name.replace(/[\\\/\?\*\[\]:]/g, '_').substring(0, 31);
  }

  private downloadTextFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, fileName, mimeType);
  }

  private downloadBlob(blob: Blob, fileName: string, mimeType: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private downloadExcelFile(workbook: any, fileName: string): void {
    // Implementation would depend on Excel library
    // workbook.xlsx.writeBuffer().then(buffer => {
    //   const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //   this.downloadBlob(blob, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // });
  }

  private async loadDashboardData(dashboardId: string): Promise<any> {
    // Load dashboard configuration and data
    return {};
  }

  private async generateReportPDF(config: ReportConfig, data: any): Promise<Blob> {
    // Generate PDF report
    return new Blob();
  }

  private async generateReportExcel(config: ReportConfig, data: any): Promise<Blob> {
    // Generate Excel report
    return new Blob();
  }

  private generateReportEmailHTML(report: ReportResult, emailConfig: EmailConfig): string {
    return `
      <h2>${emailConfig.subject}</h2>
      <p>Please find attached the ${report.config.format.toUpperCase()} report generated on ${report.generatedAt.toLocaleDateString()}.</p>
      <p>Report details:</p>
      <ul>
        <li>Name: ${report.config.name}</li>
        <li>Format: ${report.config.format}</li>
        <li>Size: ${(report.size / 1024).toFixed(2)} KB</li>
      </ul>
      ${emailConfig.customMessage || ''}
    `;
  }
}

// Supporting interfaces
interface ReportConfig {
  id: string;
  name: string;
  dashboardId: string;
  format: ExportFormat;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  recipients: string[];
  fileName?: string;
  options: ExportOptions;
}

interface ReportResult {
  id: string;
  config: ReportConfig;
  blob: Blob;
  generatedAt: Date;
  size: number;
}

interface EmailConfig {
  subject?: string;
  customMessage?: string;
  senderName?: string;
  replyTo?: string;
}