# Export Getting Started Guide

Create professional reports and data exports in 10 minutes. This guide covers installation, basic setup, and creating your first exports from BigLedger UI Kit components.

## 📦 Installation

### Option 1: Install Export Only
```bash
npm install @blg/export
```

### Option 2: Install Complete UI Kit
```bash
npm install @blg/ui-kit
```

### Option 3: Install with Specific Formats
```bash
# Basic formats (CSV, JSON)
npm install @blg/export-core

# Add Excel support
npm install @blg/export-core @blg/export-excel

# Add PDF support
npm install @blg/export-core @blg/export-pdf

# All formats
npm install @blg/export
```

## 🔧 Angular Setup

### 1. Configure Your Angular Application

```typescript
// app.config.ts (Angular 17+ Standalone)
import { ApplicationConfig } from '@angular/core';
import { provideBlgExport } from '@blg/export';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBlgExport({
      // Default formats to enable
      formats: ['excel', 'pdf', 'csv', 'json'],
      
      // Server configuration (optional)
      server: {
        enabled: false, // Set to true for server-side export
        endpoint: '/api/export'
      },
      
      // Performance settings
      performance: {
        maxConcurrentExports: 3,
        chunkSize: 1000,
        streamingThreshold: 10000
      },
      
      // Default branding
      branding: {
        companyName: 'Your Company',
        logo: '/assets/logo.png',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d'
        }
      },
      
      // Security settings
      security: {
        sanitizeData: true,
        allowedFormats: ['excel', 'pdf', 'csv'],
        maxFileSize: '50MB'
      }
    })
  ]
};
```

### 2. Import in Your Component

```typescript
// app.component.ts
import { Component, ViewChild } from '@angular/core';
import { 
  BlgExportComponent, 
  BlgGridComponent, 
  BlgChartComponent,
  ExportConfig,
  ExportEvent
} from '@blg/ui-kit';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlgExportComponent, BlgGridComponent, BlgChartComponent],
  template: `
    <div class="dashboard">
      <h2>Sales Dashboard</h2>
      
      <!-- Data Components -->
      <blg-grid 
        [data]="salesData" 
        [config]="gridConfig"
        #salesGrid>
      </blg-grid>
      
      <blg-chart 
        [data]="chartData" 
        [config]="chartConfig"
        #salesChart>
      </blg-chart>
      
      <!-- Export Component -->
      <div class="export-section">
        <h3>Export Options</h3>
        <blg-export 
          [config]="exportConfig"
          [sources]="exportSources"
          (exportStarted)="onExportStarted($event)"
          (exportProgress)="onExportProgress($event)"
          (exportComplete)="onExportComplete($event)"
          (exportError)="onExportError($event)">
        </blg-export>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    blg-grid, blg-chart {
      margin: 20px 0;
      display: block;
    }
    
    .export-section {
      margin-top: 30px;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #f8f9fa;
    }
  `]
})
export class AppComponent {
  @ViewChild('salesGrid') salesGrid!: BlgGridComponent;
  @ViewChild('salesChart') salesChart!: BlgChartComponent;
  
  // Sample data
  salesData = [
    { month: 'Jan', revenue: 45000, units: 120, region: 'North' },
    { month: 'Feb', revenue: 52000, units: 140, region: 'North' },
    { month: 'Mar', revenue: 48000, units: 130, region: 'North' },
    { month: 'Apr', revenue: 61000, units: 165, region: 'South' },
    { month: 'May', revenue: 55000, units: 150, region: 'South' },
  ];
  
  chartData = this.salesData.map(item => ({
    x: item.month,
    y: item.revenue
  }));
  
  gridConfig = {
    columns: [
      { field: 'month', headerName: 'Month' },
      { field: 'revenue', headerName: 'Revenue', type: 'currency' },
      { field: 'units', headerName: 'Units Sold', type: 'number' },
      { field: 'region', headerName: 'Region' }
    ]
  };
  
  chartConfig = {
    type: 'line',
    title: 'Monthly Revenue Trend'
  };
  
  // Export configuration
  exportConfig: ExportConfig = {
    // Available export formats
    formats: ['excel', 'pdf', 'csv'],
    
    // Default filename pattern
    filename: 'sales-report-{date}',
    
    // UI options
    ui: {
      showProgress: true,
      showPreview: true,
      allowFormatSelection: true
    },
    
    // Branding
    branding: {
      title: 'Sales Report',
      subtitle: 'Generated on {date}',
      logo: '/assets/company-logo.png'
    }
  };
  
  // Define export sources
  get exportSources() {
    return [
      {
        id: 'sales-data',
        title: 'Sales Data',
        component: this.salesGrid,
        type: 'grid',
        options: {
          includeHeaders: true,
          selectedRowsOnly: false
        }
      },
      {
        id: 'revenue-chart',
        title: 'Revenue Trends',
        component: this.salesChart,
        type: 'chart',
        options: {
          width: 800,
          height: 400,
          includeData: true
        }
      }
    ];
  }
  
  // Event handlers
  onExportStarted(event: ExportEvent) {
    console.log('Export started:', event.format);
  }
  
  onExportProgress(event: ExportEvent) {
    console.log('Export progress:', event.progress + '%');
  }
  
  onExportComplete(event: ExportEvent) {
    console.log('Export completed:', event.filename);
    // Optionally show success message
  }
  
  onExportError(event: ExportEvent) {
    console.error('Export failed:', event.error);
    // Handle error (show notification, etc.)
  }
}
```

## 📋 Simple Export Examples

### 1. Grid to Excel

```typescript
@Component({
  template: `
    <blg-grid [data]="data" #dataGrid></blg-grid>
    <button (click)="exportToExcel()" class="export-btn">
      Export to Excel
    </button>
  `
})
export class SimpleGridExportComponent {
  @ViewChild('dataGrid') dataGrid!: BlgGridComponent;
  
  data = [
    { name: 'John Doe', age: 30, department: 'Engineering' },
    { name: 'Jane Smith', age: 25, department: 'Marketing' },
    { name: 'Bob Johnson', age: 35, department: 'Sales' }
  ];
  
  constructor(private exportService: BlgExportService) {}
  
  exportToExcel() {
    this.exportService.fromGrid(this.dataGrid, {
      format: 'excel',
      filename: 'employee-data.xlsx',
      options: {
        includeHeaders: true,
        autoColumnWidth: true
      }
    });
  }
}
```

### 2. Chart to PNG

```typescript
@Component({
  template: `
    <blg-chart [data]="chartData" [config]="chartConfig" #chart></blg-chart>
    <button (click)="exportChart()" class="export-btn">
      Export Chart
    </button>
  `
})
export class SimpleChartExportComponent {
  @ViewChild('chart') chart!: BlgChartComponent;
  
  chartData = [
    { label: 'Q1', value: 100 },
    { label: 'Q2', value: 150 },
    { label: 'Q3', value: 120 },
    { label: 'Q4', value: 180 }
  ];
  
  chartConfig = {
    type: 'bar',
    title: 'Quarterly Sales'
  };
  
  constructor(private exportService: BlgExportService) {}
  
  exportChart() {
    this.exportService.fromChart(this.chart, {
      format: 'png',
      filename: 'sales-chart.png',
      options: {
        width: 1200,
        height: 600,
        quality: 0.9
      }
    });
  }
}
```

### 3. Programmatic CSV Export

```typescript
@Component({
  template: `
    <button (click)="exportData()" class="export-btn">
      Export Raw Data
    </button>
  `
})
export class DataExportComponent {
  rawData = [
    { id: 1, product: 'Widget A', price: 29.99, stock: 100 },
    { id: 2, product: 'Widget B', price: 39.99, stock: 85 },
    { id: 3, product: 'Widget C', price: 19.99, stock: 200 }
  ];
  
  constructor(private exportService: BlgExportService) {}
  
  exportData() {
    this.exportService.fromData(this.rawData, {
      format: 'csv',
      filename: 'product-data.csv',
      options: {
        headers: ['ID', 'Product Name', 'Price', 'Stock'],
        delimiter: ',',
        includeHeaders: true
      }
    });
  }
}
```

## 📄 PDF Report Generation

### Basic PDF Report

```typescript
@Component({
  template: `
    <div class="report-preview">
      <h3>Report Preview</h3>
      <blg-grid [data]="reportData" #reportGrid></blg-grid>
      <button (click)="generatePDFReport()" class="export-btn">
        Generate PDF Report
      </button>
    </div>
  `
})
export class PDFReportComponent {
  @ViewChild('reportGrid') reportGrid!: BlgGridComponent;
  
  reportData = [
    // Your report data
  ];
  
  constructor(private exportService: BlgExportService) {}
  
  generatePDFReport() {
    this.exportService.generateReport({
      template: 'standard-report',
      format: 'pdf',
      filename: 'monthly-report.pdf',
      
      // Report structure
      sections: [
        {
          type: 'header',
          content: {
            title: 'Monthly Sales Report',
            subtitle: 'Generated on ' + new Date().toLocaleDateString(),
            logo: '/assets/logo.png'
          }
        },
        {
          type: 'summary',
          content: {
            kpis: [
              { label: 'Total Revenue', value: '$125,000' },
              { label: 'Units Sold', value: '1,250' },
              { label: 'Growth', value: '+15%' }
            ]
          }
        },
        {
          type: 'data-table',
          source: this.reportGrid,
          title: 'Detailed Sales Data'
        },
        {
          type: 'footer',
          content: {
            disclaimer: 'This report is confidential and proprietary.',
            pageNumbers: true
          }
        }
      ],
      
      // Styling
      styling: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 20, bottom: 20, left: 15, right: 15 },
        fonts: {
          primary: 'Arial',
          heading: 'Arial Bold'
        }
      }
    });
  }
}
```

## 🔄 Multi-Format Export

```typescript
@Component({
  template: `
    <div class="multi-export">
      <blg-grid [data]="data" #dataGrid></blg-grid>
      
      <div class="export-buttons">
        <button (click)="exportAll()" class="export-btn primary">
          Export All Formats
        </button>
        <button (click)="exportCustom()" class="export-btn secondary">
          Custom Export
        </button>
      </div>
    </div>
  `
})
export class MultiFormatExportComponent {
  @ViewChild('dataGrid') dataGrid!: BlgGridComponent;
  
  data = [
    // Your data
  ];
  
  constructor(private exportService: BlgExportService) {}
  
  // Export to multiple formats simultaneously
  exportAll() {
    const baseFilename = 'data-export-' + Date.now();
    
    // Excel export
    this.exportService.fromGrid(this.dataGrid, {
      format: 'excel',
      filename: baseFilename + '.xlsx'
    });
    
    // CSV export
    this.exportService.fromGrid(this.dataGrid, {
      format: 'csv',
      filename: baseFilename + '.csv'
    });
    
    // PDF report
    this.exportService.generateReport({
      template: 'data-report',
      format: 'pdf',
      filename: baseFilename + '.pdf',
      sources: [{ 
        component: this.dataGrid, 
        title: 'Data Table' 
      }]
    });
  }
  
  // Custom batch export
  exportCustom() {
    this.exportService.batchExport({
      formats: [
        {
          type: 'excel',
          source: this.dataGrid,
          options: { includeFormatting: true }
        },
        {
          type: 'json',
          source: this.dataGrid,
          options: { pretty: true }
        }
      ],
      packaging: 'zip',
      filename: 'custom-export.zip'
    });
  }
}
```

## ⚡ Real-time Export Progress

```typescript
@Component({
  template: `
    <div class="export-with-progress">
      <blg-grid [data]="largeDataset" #largeGrid></blg-grid>
      
      <div class="export-controls">
        <button (click)="exportLargeDataset()" 
                [disabled]="exporting"
                class="export-btn">
          {{ exporting ? 'Exporting...' : 'Export Large Dataset' }}
        </button>
        
        <div *ngIf="exporting" class="progress-bar">
          <div class="progress-fill" 
               [style.width.%]="exportProgress">
          </div>
          <span class="progress-text">{{ exportProgress }}%</span>
        </div>
      </div>
    </div>
  `
})
export class ProgressExportComponent {
  @ViewChild('largeGrid') largeGrid!: BlgGridComponent;
  
  largeDataset = Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.random() * 1000
  }));
  
  exporting = false;
  exportProgress = 0;
  
  constructor(private exportService: BlgExportService) {}
  
  exportLargeDataset() {
    this.exporting = true;
    this.exportProgress = 0;
    
    this.exportService.streamExport({
      source: this.largeGrid,
      format: 'excel',
      filename: 'large-dataset.xlsx',
      chunkSize: 500,
      
      onProgress: (progress) => {
        this.exportProgress = Math.round(progress);
      },
      
      onComplete: (result) => {
        this.exporting = false;
        console.log('Export completed:', result.filename);
      },
      
      onError: (error) => {
        this.exporting = false;
        console.error('Export failed:', error);
      }
    });
  }
}
```

## 🎨 Custom Styling & Branding

```typescript
@Component({
  template: `
    <blg-export 
      [config]="brandedExportConfig"
      [sources]="sources">
    </blg-export>
  `
})
export class BrandedExportComponent {
  brandedExportConfig = {
    formats: ['pdf', 'excel'],
    
    // Company branding
    branding: {
      companyName: 'Acme Corporation',
      logo: '/assets/acme-logo.png',
      colors: {
        primary: '#1a365d',
        secondary: '#2d3748',
        accent: '#4a5568'
      },
      fonts: {
        primary: 'Inter',
        heading: 'Inter Bold',
        monospace: 'Fira Code'
      }
    },
    
    // PDF-specific styling
    pdf: {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 25, bottom: 25, left: 20, right: 20 },
      
      // Header and footer
      header: {
        height: 60,
        content: {
          left: '{{ branding.logo }}',
          center: '{{ branding.companyName }}',
          right: '{{ date }}'
        }
      },
      
      footer: {
        height: 30,
        content: {
          left: 'Confidential',
          center: '',
          right: 'Page {{ pageNumber }} of {{ totalPages }}'
        }
      }
    },
    
    // Excel-specific styling
    excel: {
      theme: 'corporate',
      headerStyle: {
        backgroundColor: '#1a365d',
        color: '#ffffff',
        bold: true
      },
      alternateRowColors: true
    }
  };
}
```

## ✅ Quick Start Checklist

- [ ] Install BLG Export: `npm install @blg/export`
- [ ] Configure Angular app with `provideBlgExport()`
- [ ] Import `BlgExportComponent` or `BlgExportService`
- [ ] Set up your data sources (Grid, Chart, etc.)
- [ ] Configure export options and formats
- [ ] Add export buttons or component to template
- [ ] Test basic export functionality
- [ ] Customize branding and styling
- [ ] Test with different data sizes
- [ ] Implement error handling

## 📱 Mobile Considerations

```typescript
// Mobile-optimized export configuration
const mobileExportConfig = {
  formats: ['csv', 'json'], // Lighter formats for mobile
  
  ui: {
    responsive: true,
    touchFriendly: true,
    showProgress: true
  },
  
  performance: {
    maxFileSize: '10MB', // Smaller limit for mobile
    chunkSize: 100,      // Smaller chunks
    timeout: 30000       // Shorter timeout
  }
};
```

## 🚀 Next Steps

Now that you have basic exports working:

1. **[Explore Export Formats](./features/export-formats/)** - Learn about all available formats
2. **[Master Component Integration](./features/component-integration.md)** - Export from all UI Kit components
3. **[Create Custom Templates](./features/custom-templates.md)** - Build professional report layouts
4. **[Implement Batch Processing](./features/batch-processing.md)** - Handle multiple exports
5. **[Optimize Performance](./features/performance.md)** - Handle large datasets efficiently
6. **[View Advanced Examples](./examples/)** - See real-world implementations

## ❓ Troubleshooting

### Export Not Working
```typescript
// Check if format is supported
const supportedFormats = this.exportService.getSupportedFormats();
console.log('Supported formats:', supportedFormats);

// Verify component reference
if (!this.dataGrid) {
  console.error('Grid component not found');
  return;
}

// Check data availability
if (!this.dataGrid.data || this.dataGrid.data.length === 0) {
  console.warn('No data to export');
  return;
}
```

### Large File Performance
```typescript
// Use streaming for large datasets
if (dataSize > 10000) {
  this.exportService.streamExport({
    source: component,
    format: 'excel',
    chunkSize: 1000,
    onProgress: (progress) => console.log(progress + '%')
  });
} else {
  // Regular export for smaller datasets
  this.exportService.fromGrid(component, { format: 'excel' });
}
```

### Format-Specific Issues
```typescript
// PDF generation issues
if (format === 'pdf') {
  // Ensure all images are loaded
  await this.preloadImages();
  
  // Check for proper fonts
  if (!document.fonts.check('16px Arial')) {
    console.warn('Arial font not available, using fallback');
  }
}
```

## 💡 Tips for Success

1. **Start Simple** - Begin with basic CSV/Excel exports
2. **Test Early** - Verify exports work with sample data
3. **Handle Errors** - Always implement error handling
4. **Consider Performance** - Use streaming for large datasets  
5. **Brand Consistently** - Apply your company styling
6. **Mobile First** - Test exports on mobile devices
7. **User Experience** - Show progress for long operations

---

**Congratulations!** You've set up BLG Export and created your first professional exports. Ready for more advanced features? Check out our [Custom Templates Guide](./features/custom-templates.md) or explore [Multi-Component Exports](./examples/integration/).