# @ng-ui/export Examples

This document provides comprehensive examples for using the unified export service across different scenarios.

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [Grid Exports](#grid-exports)  
3. [Editor Exports](#editor-exports)
4. [Chart Exports](#chart-exports)
5. [Image Exports](#image-exports)
6. [Batch Exports](#batch-exports)
7. [Google Integration](#google-integration)
8. [Custom Templates](#custom-templates)
9. [Progress Tracking](#progress-tracking)
10. [Error Handling](#error-handling)

## Basic Examples

### Simple CSV Export

```typescript
import { Component, inject } from '@angular/core';
import { UnifiedExportService, ExportFormat } from '@ng-ui/export';

@Component({
  selector: 'app-csv-example',
  template: `<button (click)="exportToCsv()">Export CSV</button>`
})
export class CsvExampleComponent {
  private exportService = inject(UnifiedExportService);

  data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Engineering' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales' }
  ];

  exportToCsv() {
    this.exportService.export({
      format: ExportFormat.CSV,
      filename: 'employees',
      data: this.data,
      delimiter: ',',
      includeHeader: true,
      encoding: 'utf-8'
    }).subscribe({
      next: (result) => console.log('CSV export completed', result),
      error: (error) => console.error('CSV export failed', error)
    });
  }
}
```

### JSON Export with Custom Formatting

```typescript
@Component({
  selector: 'app-json-example',
  template: `<button (click)="exportToJson()">Export JSON</button>`
})
export class JsonExampleComponent {
  private exportService = inject(UnifiedExportService);

  complexData = {
    metadata: {
      version: '1.0',
      created: new Date(),
      author: 'System'
    },
    users: [
      { id: 1, profile: { name: 'John', settings: { theme: 'dark' } } },
      { id: 2, profile: { name: 'Jane', settings: { theme: 'light' } } }
    ],
    statistics: {
      totalUsers: 2,
      activeUsers: 1
    }
  };

  exportToJson() {
    this.exportService.export({
      format: ExportFormat.JSON,
      filename: 'application-data',
      data: this.complexData,
      indent: 2,
      includeMetadata: true,
      dateFormat: 'iso',
      replacer: (key, value) => {
        // Custom transformation
        if (key === 'password') return '[REDACTED]';
        return value;
      }
    }).subscribe();
  }
}
```

## Grid Exports

### Advanced Excel Grid Export

```typescript
@Component({
  selector: 'app-grid-excel',
  template: `
    <ng-ui-grid [data]="gridData" #grid></ng-ui-grid>
    <button (click)="exportGrid()">Export to Excel</button>
  `
})
export class GridExcelComponent {
  private exportService = inject(UnifiedExportService);

  gridData = [
    { id: 1, name: 'Product A', price: 29.99, quantity: 100, category: 'Electronics' },
    { id: 2, name: 'Product B', price: 49.99, quantity: 75, category: 'Clothing' },
    { id: 3, name: 'Product C', price: 19.99, quantity: 200, category: 'Books' }
  ];

  exportGrid() {
    this.exportService.export({
      format: ExportFormat.EXCEL,
      filename: 'product-inventory',
      data: this.gridData,
      template: { type: 'grid', name: 'grid' },
      
      // Excel-specific options
      sheets: [{
        name: 'Products',
        data: this.gridData,
        columns: [
          { header: 'ID', width: 10, type: 'number' },
          { header: 'Product Name', width: 30, type: 'string' },
          { header: 'Price', width: 15, type: 'number', format: '$#,##0.00' },
          { header: 'Quantity', width: 15, type: 'number', format: '#,##0' },
          { header: 'Category', width: 20, type: 'string' }
        ],
        formatting: {
          freezeHeader: true,
          autoResize: false,
          alternatingColors: true,
          borders: true,
          headerStyle: {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4472C4' } }
          }
        }
      }],
      
      // Conditional formatting
      conditionalFormatting: [{
        type: 'cellIs',
        condition: { operator: 'greaterThan', value: 100 },
        format: { fill: { fgColor: { rgb: 'C6EFCE' } } },
        range: 'D2:D1000'  // Quantity column
      }],
      
      // Charts
      charts: [{
        type: 'column',
        title: 'Products by Category',
        dataRange: 'A1:E4',
        position: { row: 10, column: 1 },
        size: { width: 400, height: 300 }
      }]
    }).subscribe();
  }
}
```

### Multi-Sheet Excel Export

```typescript
exportMultiSheet() {
  const salesData = [
    { month: 'Jan', sales: 10000, target: 12000 },
    { month: 'Feb', sales: 11000, target: 12000 },
    { month: 'Mar', sales: 13000, target: 12000 }
  ];

  const expenseData = [
    { category: 'Marketing', amount: 5000 },
    { category: 'Operations', amount: 8000 },
    { category: 'R&D', amount: 3000 }
  ];

  this.exportService.export({
    format: ExportFormat.EXCEL,
    filename: 'quarterly-report',
    sheets: [
      {
        name: 'Sales Performance',
        data: salesData,
        formatting: {
          freezeHeader: true,
          alternatingColors: true
        }
      },
      {
        name: 'Expenses',
        data: expenseData,
        formatting: {
          freezeHeader: true,
          borders: true
        }
      },
      {
        name: 'Summary',
        data: [
          ['Total Sales', salesData.reduce((sum, item) => sum + item.sales, 0)],
          ['Total Expenses', expenseData.reduce((sum, item) => sum + item.amount, 0)]
        ]
      }
    ]
  }).subscribe();
}
```

## Editor Exports

### Rich Text to PDF

```typescript
@Component({
  selector: 'app-editor-pdf',
  template: `
    <ng-ui-editor [content]="editorContent" #editor></ng-ui-editor>
    <button (click)="exportToPdf()">Export to PDF</button>
  `
})
export class EditorPdfComponent {
  private exportService = inject(UnifiedExportService);

  editorContent = `
    <h1>Annual Report 2024</h1>
    <h2>Executive Summary</h2>
    <p>This year has been marked by significant growth and innovation...</p>
    
    <h2>Financial Performance</h2>
    <table border="1">
      <tr><th>Quarter</th><th>Revenue</th><th>Profit</th></tr>
      <tr><td>Q1</td><td>$1M</td><td>$200K</td></tr>
      <tr><td>Q2</td><td>$1.2M</td><td>$240K</td></tr>
    </table>
    
    <h2>Future Outlook</h2>
    <p>Looking ahead, we anticipate continued growth...</p>
  `;

  exportToPdf() {
    this.exportService.export({
      format: ExportFormat.PDF,
      filename: 'annual-report-2024',
      data: { content: [{ type: 'text', text: this.editorContent }] },
      template: { type: 'editor', name: 'editor' },
      
      // PDF-specific options
      orientation: 'portrait',
      pageSize: 'a4',
      margins: { top: 72, right: 72, bottom: 72, left: 72 },
      
      // Headers and footers
      header: 'Annual Report 2024',
      footer: 'Confidential - Internal Use Only',
      includePageNumbers: true,
      
      // Watermark
      watermark: {
        text: 'DRAFT',
        opacity: 0.2,
        rotation: 45,
        fontSize: 72,
        color: '#FF0000'
      }
    }).subscribe();
  }
}
```

### Word Document Export

```typescript
exportToWord() {
  this.exportService.export({
    format: ExportFormat.WORD,
    filename: 'meeting-notes',
    data: {
      title: 'Team Meeting Notes',
      sections: [
        {
          heading: 'Attendees',
          content: ['John Doe', 'Jane Smith', 'Bob Johnson']
        },
        {
          heading: 'Agenda Items',
          content: [
            'Project status update',
            'Budget review',
            'Next quarter planning'
          ]
        },
        {
          heading: 'Action Items',
          content: [
            'John: Complete budget analysis by Friday',
            'Jane: Schedule client meeting',
            'Bob: Update project timeline'
          ]
        }
      ]
    },
    template: { type: 'editor', name: 'editor' },
    
    // Word-specific formatting
    defaultParagraphStyle: {
      alignment: 'left',
      spacing: { after: 200, line: 276, lineRule: 'auto' }
    },
    
    defaultCharacterStyle: {
      font: { name: 'Calibri', size: 22 }
    }
  }).subscribe();
}
```

## Chart Exports

### Chart to Image

```typescript
@Component({
  selector: 'app-chart-export',
  template: `
    <div #chartContainer>
      <canvas #chartCanvas id="myChart"></canvas>
    </div>
    <button (click)="exportChart()">Export Chart</button>
  `
})
export class ChartExportComponent {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private exportService = inject(UnifiedExportService);

  exportChart() {
    this.exportService.export({
      format: ExportFormat.PNG,
      filename: 'sales-chart',
      element: this.chartContainer.nativeElement,
      
      // Image-specific options
      width: 1200,
      height: 800,
      scale: 2,
      quality: 'high',
      backgroundColor: '#ffffff',
      
      // html2canvas options
      useCORS: true,
      allowTaint: false,
      removeContainer: true
    }).subscribe();
  }

  exportChartAsSvg() {
    this.exportService.export({
      format: ExportFormat.SVG,
      filename: 'sales-chart-vector',
      element: this.chartContainer.nativeElement,
      
      // SVG-specific options
      width: 800,
      height: 600,
      embedFonts: true,
      embedImages: true,
      optimize: true
    }).subscribe();
  }
}
```

### Chart Data Export

```typescript
exportChartData() {
  const chartData = {
    title: 'Monthly Sales Performance',
    chartType: 'line',
    series: [
      { name: 'Revenue', data: [10000, 12000, 11500, 13000, 14500] },
      { name: 'Profit', data: [2000, 2400, 2300, 2600, 2900] }
    ],
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    metadata: {
      period: 'Q1-Q2 2024',
      currency: 'USD',
      generatedBy: 'Sales Dashboard'
    }
  };

  // Export as Excel with chart visualization
  this.exportService.export({
    format: ExportFormat.EXCEL,
    filename: 'sales-performance-chart',
    data: chartData,
    template: { type: 'chart', name: 'chart' },
    
    sheets: [{
      name: 'Chart Data',
      data: this.transformChartDataForTable(chartData)
    }],
    
    charts: [{
      type: 'line',
      title: chartData.title,
      dataRange: 'A1:F6',
      position: { row: 10, column: 1 },
      size: { width: 600, height: 400 }
    }]
  }).subscribe();
}

private transformChartDataForTable(chartData: any): any[][] {
  const headers = ['Month', ...chartData.series.map((s: any) => s.name)];
  const rows = chartData.categories.map((category: string, index: number) => [
    category,
    ...chartData.series.map((series: any) => series.data[index])
  ]);
  return [headers, ...rows];
}
```

## Image Exports

### High-Quality Screenshot

```typescript
captureHighQualityScreenshot() {
  this.exportService.export({
    format: ExportFormat.PNG,
    filename: 'dashboard-screenshot',
    element: '#dashboard-container',
    
    // High-quality settings
    scale: 3,
    quality: 'ultra',
    width: 1920,
    height: 1080,
    pixelRatio: 3,
    
    // Optimization
    backgroundColor: '#ffffff',
    removeContainer: true,
    useCORS: true,
    
    // Custom html2canvas options
    html2canvas: {
      logging: false,
      imageTimeout: 15000,
      foreignObjectRendering: false
    }
  }).subscribe();
}
```

### Batch Image Export

```typescript
exportMultipleImages() {
  const elements = [
    { selector: '#chart1', filename: 'revenue-chart' },
    { selector: '#chart2', filename: 'profit-chart' },
    { selector: '#chart3', filename: 'growth-chart' }
  ];

  const batchConfig = {
    exports: elements.map(el => ({
      format: ExportFormat.PNG,
      filename: el.filename,
      element: el.selector,
      scale: 2,
      quality: 'high'
    })),
    concurrency: 2,
    continueOnError: true
  };

  this.exportService.exportBatch(batchConfig).subscribe();
}
```

## Batch Exports

### Multiple Formats for Same Data

```typescript
exportAllFormats() {
  const reportData = this.generateReportData();

  this.exportService.exportBatch({
    batchName: 'Monthly Report - All Formats',
    exports: [
      {
        format: ExportFormat.PDF,
        filename: 'monthly-report',
        data: reportData,
        template: { type: 'editor', name: 'editor' }
      },
      {
        format: ExportFormat.EXCEL,
        filename: 'monthly-report-data',
        data: reportData.tables,
        template: { type: 'grid', name: 'grid' }
      },
      {
        format: ExportFormat.CSV,
        filename: 'monthly-report-raw',
        data: reportData.rawData
      },
      {
        format: ExportFormat.JSON,
        filename: 'monthly-report-json',
        data: reportData,
        includeMetadata: true
      }
    ],
    concurrency: 2,
    continueOnError: true,
    onBatchProgress: (completed, total, current) => {
      console.log(\`Progress: \${completed}/\${total}\`);
      if (current) {
        console.log(\`Current: \${current.step}\`);
      }
    }
  }).subscribe(results => {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(\`Batch complete: \${successful.length} successful, \${failed.length} failed\`);
  });
}
```

## Google Integration

### Google Sheets Export

```typescript
@Component({
  selector: 'app-google-sheets',
  template: `
    <button (click)="authenticate()">Authenticate Google</button>
    <button (click)="exportToSheets()" [disabled]="!isAuthenticated">
      Export to Google Sheets
    </button>
  `
})
export class GoogleSheetsComponent {
  private exportService = inject(UnifiedExportService);
  isAuthenticated = false;

  async authenticate() {
    // OAuth flow implementation
    const authUrl = this.exportService['googleExporter'].getAuthUrl(
      'your-client-id',
      'http://localhost:4200/callback',
      [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ]
    );
    
    // Open popup or redirect to auth URL
    window.open(authUrl, 'google-auth', 'width=500,height=600');
  }

  exportToSheets() {
    const salesData = [
      { date: '2024-01-01', product: 'Widget A', sales: 1200, region: 'North' },
      { date: '2024-01-02', product: 'Widget B', sales: 800, region: 'South' },
      { date: '2024-01-03', product: 'Widget C', sales: 1500, region: 'East' }
    ];

    this.exportService.export({
      format: ExportFormat.GOOGLE_SHEETS,
      filename: 'Sales Dashboard Data',
      data: salesData,
      
      credentials: {
        accessToken: 'your-access-token'
      },
      
      sharing: {
        type: 'public',
        role: 'reader',
        allowComments: true,
        allowEditing: false
      },
      
      sheets: [{
        name: 'Sales Data',
        data: salesData,
        formatting: {
          freezeHeader: true,
          autoResize: true,
          alternatingColors: true
        }
      }]
    }).subscribe(result => {
      if (result.success) {
        console.log('Google Sheets URL:', result.url);
        window.open(result.url, '_blank');
      }
    });
  }
}
```

### Google Docs Export

```typescript
exportToGoogleDocs() {
  const documentContent = {
    title: 'Project Status Report',
    sections: [
      { type: 'heading', content: 'Project Overview', level: 1 },
      { type: 'paragraph', content: 'This document provides a comprehensive overview...' },
      
      { type: 'heading', content: 'Progress Summary', level: 2 },
      { type: 'table', content: [
        ['Task', 'Status', 'Completion'],
        ['Design Phase', 'Complete', '100%'],
        ['Development', 'In Progress', '75%'],
        ['Testing', 'Not Started', '0%']
      ]},
      
      { type: 'heading', content: 'Next Steps', level: 2 },
      { type: 'paragraph', content: 'The following actions are required...' }
    ]
  };

  this.exportService.export({
    format: ExportFormat.GOOGLE_DOCS,
    filename: 'Project Status Report',
    data: documentContent,
    
    credentials: {
      accessToken: 'your-access-token'
    },
    
    sharing: {
      type: 'restricted',
      role: 'writer',
      users: ['manager@company.com', 'teammate@company.com'],
      allowComments: true
    }
  }).subscribe(result => {
    if (result.success) {
      console.log('Google Docs URL:', result.url);
      window.open(result.url, '_blank');
    }
  });
}
```

## Custom Templates

### Creating Custom Templates

```typescript
const corporateTemplate: ExportTemplate = {
  type: 'custom',
  name: 'corporate-report',
  content: `
    <div class="report-header">
      <img src="{{companyLogo}}" alt="Company Logo" class="logo">
      <h1>{{reportTitle}}</h1>
      <div class="report-meta">
        <span>Generated: {{generatedDate}}</span>
        <span>Period: {{reportPeriod}}</span>
      </div>
    </div>
    
    <div class="report-content">
      {{#each sections}}
        <section class="report-section">
          <h2>{{title}}</h2>
          <div class="section-content">
            {{#if isTable}}
              <table class="data-table">
                {{#each rows}}
                  <tr>{{#each this}}<td>{{this}}</td>{{/each}}</tr>
                {{/each}}
              </table>
            {{else}}
              <p>{{content}}</p>
            {{/if}}
          </div>
        </section>
      {{/each}}
    </div>
  `,
  
  variables: {
    companyLogo: '/assets/logo.png',
    reportTitle: 'Monthly Performance Report',
    generatedDate: new Date().toLocaleDateString(),
    reportPeriod: 'January 2024'
  },
  
  styles: {
    css: `
      .report-header {
        text-align: center;
        border-bottom: 2px solid #4472C4;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .logo {
        max-height: 60px;
        margin-bottom: 10px;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
      }
      .data-table th, .data-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      .data-table th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
    `,
    theme: 'corporate',
    colorScheme: 'light'
  }
};

// Use the custom template
exportWithCustomTemplate() {
  this.exportService.export({
    format: ExportFormat.PDF,
    filename: 'corporate-report',
    data: this.reportData,
    template: corporateTemplate
  }).subscribe();
}
```

## Progress Tracking

### Advanced Progress Monitoring

```typescript
@Component({
  selector: 'app-progress-example',
  template: `
    <div class="export-controls">
      <button (click)="startExport()" [disabled]="isExporting()">
        Export Large Dataset
      </button>
      <button (click)="cancelExport()" [disabled]="!isExporting()">
        Cancel
      </button>
    </div>
    
    <div *ngIf="progress$ | async as progress" class="progress-container">
      <div class="progress-header">
        <h3>{{ progress.operation | titlecase }} Export</h3>
        <span class="progress-percentage">{{ progress.percentage | number:'1.0-1' }}%</span>
      </div>
      
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          [style.width.%]="progress.percentage">
        </div>
      </div>
      
      <div class="progress-details">
        <p>{{ progress.step }}</p>
        <div class="progress-stats">
          <span *ngIf="progress.estimatedTimeRemaining">
            ETA: {{ formatTime(progress.estimatedTimeRemaining) }}
          </span>
          <span *ngIf="progress.speed">
            Speed: {{ formatBytes(progress.speed) }}/s
          </span>
          <span *ngIf="progress.bytesProcessed && progress.totalBytes">
            {{ formatBytes(progress.bytesProcessed) }} / {{ formatBytes(progress.totalBytes) }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class ProgressExampleComponent {
  private exportService = inject(UnifiedExportService);
  
  progress$ = this.exportService.progress$;
  isExporting = this.exportService.isExporting;
  
  largeDataset = this.generateLargeDataset(50000); // 50k rows

  startExport() {
    this.exportService.export({
      format: ExportFormat.EXCEL,
      filename: 'large-dataset',
      data: this.largeDataset,
      
      onProgress: (progress) => {
        console.log(\`Custom progress callback: \${progress}%\`);
      },
      
      onSuccess: (result) => {
        console.log('Export completed successfully:', result);
      },
      
      onError: (error) => {
        console.error('Export failed:', error);
      }
    }).subscribe();
  }

  cancelExport() {
    this.exportService.cancelExport();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return \`\${minutes}m \${remainingSeconds}s\`;
  }

  formatBytes(bytes: number): string {
    return ExportUtils.formatBytes(bytes);
  }

  private generateLargeDataset(size: number): any[] {
    return Array.from({ length: size }, (_, index) => ({
      id: index + 1,
      name: \`Record \${index + 1}\`,
      value: Math.random() * 1000,
      date: new Date(2024, 0, 1 + (index % 365)),
      category: ['A', 'B', 'C', 'D', 'E'][index % 5]
    }));
  }
}
```

## Error Handling

### Comprehensive Error Handling

```typescript
@Component({
  selector: 'app-error-handling',
  template: `
    <button (click)="exportWithErrorHandling()">Export with Error Handling</button>
    <div *ngIf="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  `
})
export class ErrorHandlingComponent {
  private exportService = inject(UnifiedExportService);
  errorMessage: string | null = null;

  exportWithErrorHandling() {
    this.errorMessage = null;

    // Validate configuration first
    const config: ExportConfig = {
      format: ExportFormat.PDF,
      filename: 'test-export',
      data: this.getData()
    };

    const validation = ExportUtils.validateConfig(config);
    if (!validation.valid) {
      this.errorMessage = \`Configuration errors: \${validation.errors.join(', ')}\`;
      return;
    }

    this.exportService.export(config).subscribe({
      next: (result) => {
        if (result.success) {
          console.log('Export successful:', result);
        } else {
          this.handleExportError(result.error);
        }
      },
      
      error: (error) => {
        this.handleExportError(error);
      }
    });
  }

  private handleExportError(error: any) {
    console.error('Export error:', error);
    
    // Categorize errors
    if (error.message?.includes('browser')) {
      this.errorMessage = 'Browser compatibility issue. Please try a different browser.';
    } else if (error.message?.includes('memory')) {
      this.errorMessage = 'Dataset too large. Try exporting in smaller chunks.';
    } else if (error.message?.includes('network')) {
      this.errorMessage = 'Network error. Please check your connection.';
    } else if (error.message?.includes('google')) {
      this.errorMessage = 'Google authentication required. Please sign in.';
    } else if (error.message?.includes('permission')) {
      this.errorMessage = 'Permission denied. Check file access rights.';
    } else {
      this.errorMessage = \`Export failed: \${error.message || 'Unknown error'}\`;
    }

    // Optional: Report error to monitoring service
    this.reportError(error);
  }

  private reportError(error: any) {
    // Send error to monitoring service
    console.log('Reporting error to monitoring service:', error);
  }

  private getData() {
    // Return your data here
    return [{ test: 'data' }];
  }
}
```

### Retry Logic

```typescript
exportWithRetry() {
  const maxRetries = 3;
  let currentAttempt = 0;

  const attemptExport = (): Observable<ExportResult> => {
    currentAttempt++;
    console.log(\`Export attempt \${currentAttempt} of \${maxRetries}\`);

    return this.exportService.export({
      format: ExportFormat.EXCEL,
      filename: 'retry-export',
      data: this.data
    }).pipe(
      catchError(error => {
        if (currentAttempt < maxRetries && this.isRetryableError(error)) {
          console.log(\`Attempt \${currentAttempt} failed, retrying...\`);
          return timer(2000).pipe( // Wait 2 seconds before retry
            switchMap(() => attemptExport())
          );
        } else {
          return throwError(() => error);
        }
      })
    );
  };

  attemptExport().subscribe({
    next: (result) => console.log('Export successful after retries:', result),
    error: (error) => console.error('Export failed after all retries:', error)
  });
}

private isRetryableError(error: any): boolean {
  // Define which errors should trigger a retry
  const retryableErrors = ['network', 'timeout', 'temporary'];
  return retryableErrors.some(type => error.message?.toLowerCase().includes(type));
}
```

These examples demonstrate the comprehensive capabilities of the @ng-ui/export library across different scenarios and use cases. Each example can be adapted and extended based on your specific requirements.