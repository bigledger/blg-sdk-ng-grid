# BLG Export Documentation

Welcome to **BLG Export** - the unified data export solution that seamlessly integrates with all BigLedger UI Kit components to provide comprehensive reporting and data export capabilities.

## 📤 Overview

![BLG Export Showcase](../images/export-overview.png)

BLG Export transforms your data into professional reports and exports with:

- **Universal Integration** - Works with Grid, Charts, Editor, Avatar, and external data
- **Multiple Formats** - Excel, PDF, CSV, JSON, XML, PNG, SVG, and more
- **Custom Templates** - Professional report templates with branding
- **Batch Operations** - Export multiple sources simultaneously
- **Real-time Generation** - Stream exports for large datasets

## 🚀 Quick Start

Get your first export running in 10 minutes:

```bash
# Install BLG Export
npm install @blg/export

# Or install the complete UI Kit
npm install @blg/ui-kit
```

```typescript
// app.component.ts
import { BlgExportComponent } from '@blg/export';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlgExportComponent, BlgGridComponent, BlgChartComponent],
  template: `
    <blg-grid [data]="gridData" #salesGrid></blg-grid>
    <blg-chart [data]="chartData" #salesChart></blg-chart>
    
    <blg-export [config]="exportConfig"
                [sources]="exportSources"
                (exportComplete)="onExportComplete($event)">
    </blg-export>
  `
})
export class AppComponent {
  @ViewChild('salesGrid') salesGrid!: BlgGridComponent;
  @ViewChild('salesChart') salesChart!: BlgChartComponent;
  
  gridData = [...]; // Your grid data
  chartData = [...]; // Your chart data
  
  exportConfig = {
    formats: ['excel', 'pdf'],
    template: 'business-report',
    filename: 'sales-report-{date}',
    branding: {
      logo: '/assets/logo.png',
      colors: ['#007bff', '#6c757d']
    }
  };
  
  get exportSources() {
    return [
      { 
        component: this.salesGrid, 
        title: 'Sales Data',
        type: 'grid' 
      },
      { 
        component: this.salesChart, 
        title: 'Sales Trends',
        type: 'chart' 
      }
    ];
  }
  
  onExportComplete(event: ExportEvent) {
    console.log('Export completed:', event.filename);
  }
}
```

**Result**: Professional Excel and PDF reports with your grid data and chart visualizations!

## 📋 Export Formats

### Document Formats
- **PDF** - Professional reports with layouts and styling
- **Word (.docx)** - Editable documents with formatting
- **PowerPoint (.pptx)** - Presentation slides with charts
- **HTML** - Web-ready reports with interactivity

### Data Formats
- **Excel (.xlsx)** - Spreadsheets with formulas and formatting
- **CSV** - Simple comma-separated values
- **JSON** - Structured data for APIs
- **XML** - Structured markup data
- **TSV** - Tab-separated values

### Image Formats
- **PNG** - High-quality raster images
- **SVG** - Vector graphics (scalable)
- **JPEG** - Compressed images
- **WebP** - Modern web format

### Advanced Formats
- **ZIP** - Compressed archives of multiple files
- **SQL** - Database insert statements
- **Parquet** - Big data columnar format
- **Custom** - Your own export formats

## ✨ Key Features

### 🎯 **Component Integration**
```typescript
// Export from Grid
exportService.fromGrid(gridComponent, {
  format: 'excel',
  includeHeaders: true,
  selectedRowsOnly: false
});

// Export from Charts
exportService.fromChart(chartComponent, {
  format: 'png',
  width: 1200,
  height: 800,
  includeData: true
});

// Export from Editor
exportService.fromEditor(editorComponent, {
  format: 'pdf',
  includeImages: true,
  pageSize: 'A4'
});
```

### 🎨 **Custom Templates**
```typescript
// Define custom report template
const customTemplate = {
  name: 'monthly-report',
  layout: {
    header: {
      logo: true,
      title: 'Monthly Sales Report',
      date: true
    },
    sections: [
      { type: 'summary', data: 'kpis' },
      { type: 'grid', data: 'sales-table' },
      { type: 'chart', data: 'trend-chart' },
      { type: 'footer', data: 'disclaimer' }
    ]
  },
  styling: {
    fonts: { primary: 'Arial', secondary: 'Times' },
    colors: { primary: '#007bff', accent: '#28a745' }
  }
};
```

### 🔄 **Batch Export**
```typescript
// Export multiple components at once
const batchExport = {
  sources: [
    { component: salesGrid, format: 'excel' },
    { component: revenueChart, format: 'png' },
    { component: reportEditor, format: 'pdf' }
  ],
  packaging: 'zip',
  filename: 'complete-report-{timestamp}'
};

exportService.batchExport(batchExport);
```

### ⚡ **Streaming Export**
```typescript
// For large datasets
exportService.streamExport({
  source: largeDatasource,
  format: 'csv',
  chunkSize: 1000,
  onProgress: (progress) => {
    console.log(`Export progress: ${progress}%`);
  }
});
```

## 📚 Documentation Sections

### 🎯 Getting Started
- **[Quick Start](./getting-started/quick-start.md)** - Your first export in 10 minutes
- **[Installation](./getting-started/installation.md)** - Setup and configuration
- **[Basic Examples](./getting-started/basic-examples.md)** - Simple export implementations

### ⚙️ Features & Guides
- **[Export Formats](./features/export-formats/)** - All supported output formats
- **[Component Integration](./features/component-integration.md)** - Export from Grid, Charts, Editor
- **[Custom Templates](./features/custom-templates.md)** - Create professional report layouts
- **[Batch Processing](./features/batch-processing.md)** - Multi-source and bulk exports
- **[Streaming Exports](./features/streaming-exports.md)** - Handle large datasets efficiently
- **[Branding & Styling](./features/branding.md)** - Apply your brand to exports
- **[Performance](./features/performance.md)** - Optimization for large exports

### 🔧 API Reference
- **[Export Component](./api/export-component.md)** - Main export component API
- **[Export Service](./api/export-service.md)** - Programmatic export methods
- **[Format Options](./api/format-options.md)** - Configuration for each format
- **[Template System](./api/template-system.md)** - Custom template creation
- **[Events](./api/events.md)** - Export events and callbacks

### 💡 Examples & Demos
- **[Basic Exports](./examples/basic/)** - Simple single-format exports
- **[Multi-Format](./examples/multi-format/)** - Exporting to multiple formats
- **[Custom Reports](./examples/custom-reports/)** - Professional report templates
- **[Batch Operations](./examples/batch/)** - Multiple component exports
- **[Integration Examples](./examples/integration/)** - Real-world scenarios

## 🎮 Live Examples

Try these interactive examples:

| Use Case | Description | Live Demo |
|----------|-------------|-----------|
| **Financial Report** | Grid + Chart → PDF report | [StackBlitz](https://stackblitz.com/edit/blg-export-financial) |
| **Dashboard Export** | Multi-component → Excel | [StackBlitz](https://stackblitz.com/edit/blg-export-dashboard) |
| **Data Analysis** | Large dataset → CSV stream | [StackBlitz](https://stackblitz.com/edit/blg-export-streaming) |
| **Presentation Builder** | Charts → PowerPoint | [StackBlitz](https://stackblitz.com/edit/blg-export-presentation) |
| **Custom Template** | Branded report generation | [StackBlitz](https://stackblitz.com/edit/blg-export-template) |

## 🏗️ Architecture

BLG Export consists of modular packages:

- **`@blg/export-core`** - Core export engine and interfaces
- **`@blg/export-formats`** - Format-specific exporters (Excel, PDF, etc.)
- **`@blg/export-templates`** - Report template system
- **`@blg/export-streaming`** - Large dataset streaming
- **`@blg/export-integration`** - UI Kit component integrations

## 📊 Performance Metrics

- **Small Exports** (< 1MB): < 1 second generation
- **Medium Exports** (1-10MB): 2-5 seconds
- **Large Exports** (10-100MB): Streaming with progress
- **Memory Usage**: Efficient streaming prevents memory issues
- **Concurrent Exports**: Up to 5 simultaneous exports
- **Bundle Size**: ~40KB gzipped (core + basic formats)

## 🌐 Browser Support

### Client-Side Export
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### Server-Side Export (Optional)
- **Node.js**: 14+ for advanced PDF generation
- **Docker**: Containerized export services
- **Cloud Functions**: Serverless export processing

## 🚀 What's Next?

### Roadmap (v2.1.0)
- 🚧 **AI-Generated Reports** - Automatic report narratives
- 🚧 **Real-time Collaboration** - Shared export projects
- 🚧 **Advanced Scheduling** - Automated report generation
- 🚧 **Cloud Integration** - Direct export to cloud storage
- 🚧 **Template Marketplace** - Community-shared templates

### Integration Scenarios

#### 📊 **Business Intelligence**
```typescript
// Comprehensive BI report
const biReport = {
  template: 'executive-summary',
  sources: [
    { type: 'kpi-grid', title: 'Key Metrics' },
    { type: '3d-chart', title: 'Revenue Trends' },
    { type: 'forecast-chart', title: 'Projections' }
  ],
  branding: 'corporate',
  distribution: ['email', 'sharepoint']
};
```

#### 📈 **Financial Reporting**
```typescript
// Quarterly financial report
const financialReport = {
  template: 'financial-statement',
  data: {
    income: incomeGrid.data,
    balance: balanceGrid.data,
    cashflow: cashflowChart.data
  },
  compliance: 'GAAP',
  audit: true
};
```

#### 🎓 **Educational Content**
```typescript
// Student progress report
const progressReport = {
  template: 'student-report',
  sources: [
    { type: 'grade-grid', student: studentId },
    { type: 'progress-chart', timeframe: 'semester' },
    { type: 'avatar-feedback', teacher: teacherId }
  ]
};
```

## 📋 Common Export Patterns

### Grid to Excel
```typescript
@Component({
  template: `
    <blg-grid [data]="data" #dataGrid></blg-grid>
    <button (click)="exportToExcel()">Export to Excel</button>
  `
})
export class GridExportComponent {
  exportToExcel() {
    this.exportService.fromGrid(this.dataGrid, {
      format: 'excel',
      filename: 'data-export.xlsx',
      includeFormatting: true,
      sheets: {
        'Raw Data': { source: 'all' },
        'Summary': { source: 'aggregated' }
      }
    });
  }
}
```

### Chart to PDF Report
```typescript
@Component({
  template: `
    <blg-chart [data]="chartData" #salesChart></blg-chart>
    <button (click)="generateReport()">Generate PDF Report</button>
  `
})
export class ChartReportComponent {
  generateReport() {
    this.exportService.generateReport({
      template: 'chart-report',
      sources: [{ 
        component: this.salesChart,
        title: 'Sales Performance',
        description: 'Q4 2024 sales trends and analysis'
      }],
      format: 'pdf',
      pageSize: 'A4',
      orientation: 'portrait'
    });
  }
}
```

### Multi-Component Dashboard
```typescript
@Component({
  template: `
    <div class="dashboard">
      <blg-grid [data]="salesData" #salesGrid></blg-grid>
      <blg-chart [data]="trendData" #trendChart></blg-chart>
      <blg-editor [content]="notes" #notesEditor></blg-editor>
    </div>
    <blg-export [sources]="allSources" [formats]="['pdf', 'excel']">
    </blg-export>
  `
})
export class DashboardExportComponent {
  get allSources() {
    return [
      { component: this.salesGrid, title: 'Sales Data', section: 'data' },
      { component: this.trendChart, title: 'Trends', section: 'analysis' },
      { component: this.notesEditor, title: 'Notes', section: 'commentary' }
    ];
  }
}
```

## 🆘 Support & Community

- **[GitHub Issues](https://github.com/bigledger/export/issues)** - Bug reports and features
- **[Discord](https://discord.gg/bigledger-export)** - Community discussions  
- **[Template Gallery](https://export.bigledger.com/templates)** - Pre-built templates
- **[Format Documentation](https://export.bigledger.com/formats)** - Format specifications

## 🔐 Security & Compliance

BLG Export prioritizes security and compliance:

- **Client-Side Processing** - Data never leaves your browser by default
- **Secure Server Options** - Optional server-side processing with encryption
- **Audit Trails** - Track all export operations
- **Access Control** - Role-based export permissions
- **Data Masking** - Automatic PII protection
- **Compliance Ready** - GDPR, HIPAA, SOX support

---

**Ready to create professional reports?** Start with our [Quick Start Guide](./getting-started/quick-start.md) and generate your first export!

**Want to see advanced features?** Explore our [Custom Templates](./examples/custom-reports/) or try the [Multi-Format Export Demo](https://export.bigledger.com/demo).