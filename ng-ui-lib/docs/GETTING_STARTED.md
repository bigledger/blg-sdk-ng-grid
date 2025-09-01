# Getting Started with BLG Angular UI Kit

Welcome to BLG Angular UI Kit - a comprehensive suite of enterprise-grade Angular components including data grids, rich text editors, and interactive charts. This guide will help you get up and running quickly.

## 📋 Prerequisites

Before getting started, ensure you have:

- **Node.js** 18.0 or higher
- **Angular** 17.0 or higher  
- **TypeScript** 5.0 or higher
- **npm** or **yarn** package manager

```bash
# Verify your environment
node --version    # Should be 18.0+
ng version       # Should be Angular 17+
```

## 🚀 Installation

### Option 1: Install All Components

For the complete UI kit experience:

```bash
npm install @ng-ui-lib/core @ng-ui-lib/grid @ng-ui-lib/editor-core @ng-ui-lib/charts-core @ng-ui-lib/theme
```

### Option 2: Install Individual Components

Choose only the components you need:

#### Grid Component
```bash
# Core dependencies
npm install @ng-ui-lib/core @ng-ui-lib/theme

# Grid specific packages
npm install @ng-ui-lib/grid @ng-ui-lib/column @ng-ui-lib/row @ng-ui-lib/cell @ng-ui-lib/data
```

#### Editor Component
```bash
# Core dependencies  
npm install @ng-ui-lib/core @ng-ui-lib/theme

# Editor specific packages
npm install @ng-ui-lib/editor-core @ng-ui-lib/editor-formats @ng-ui-lib/editor-toolbar @ng-ui-lib/editor-media
```

#### Chart Components
```bash
# Core dependencies
npm install @ng-ui-lib/core @ng-ui-lib/theme

# Chart specific packages
npm install @ng-ui-lib/charts-core @ng-ui-lib/charts-2d @ng-ui-lib/charts-3d @ng-ui-lib/charts-animations
```

## ⚙️ Basic Setup

### 1. Import Styles

Add the base styles to your `angular.json`:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/@ng-ui-lib/theme/styles/default-theme.css",
              "src/styles.css"
            ]
          }
        }
      }
    }
  }
}
```

Or import in your main styles file (`styles.css`):

```css
@import '@ng-ui-lib/theme/styles/default-theme.css';

/* Optional: Dark theme support */
@import '@ng-ui-lib/theme/styles/dark-theme.css';
```

### 2. Configure Angular Application

In your `main.ts`, ensure proper Angular setup:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(), // Required for smooth animations
    // Other providers...
  ]
});
```

## 🔧 Quick Start Examples

### Grid Component - Basic Usage

Create your first data grid:

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-basic-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="grid-container">
      <ng-ui-lib-grid 
        [data]="rowData" 
        [columns]="columnDefs" 
        [config]="gridConfig"
        (rowSelectionChanged)="onRowSelectionChanged($event)"
        (dataExported)="onDataExported($event)">
      </ng-ui-lib-grid>
    </div>
  `,
  styles: [`
    .grid-container {
      height: 500px;
      width: 100%;
    }
  `]
})
export class BasicGridComponent {
  rowData = [
    { id: 1, name: 'John Doe', age: 25, department: 'Engineering', salary: 75000 },
    { id: 2, name: 'Jane Smith', age: 30, department: 'Marketing', salary: 65000 },
    { id: 3, name: 'Bob Johnson', age: 35, department: 'Sales', salary: 55000 }
  ];

  columnDefs: ColumnDefinition[] = [
    { 
      id: 'name', 
      field: 'name', 
      header: 'Name', 
      type: 'string', 
      sortable: true, 
      filterable: true,
      exportable: true 
    },
    { 
      id: 'age', 
      field: 'age', 
      header: 'Age', 
      type: 'number', 
      sortable: true, 
      filterable: true,
      exportable: true 
    },
    { 
      id: 'department', 
      field: 'department', 
      header: 'Department', 
      type: 'string', 
      sortable: true, 
      filterable: true,
      exportable: true 
    },
    { 
      id: 'salary', 
      field: 'salary', 
      header: 'Salary', 
      type: 'currency', 
      sortable: true, 
      filterable: true,
      exportable: true,
      format: { currency: 'USD' }
    }
  ];

  gridConfig: GridConfig = {
    virtualScrolling: true,
    selectable: true,
    multiSelect: true,
    sortable: true,
    filterable: true,
    resizable: true,
    exportable: true,
    exportFormats: ['excel', 'csv', 'pdf'],
    theme: 'default'
  };

  onRowSelectionChanged(selectedRows: any[]) {
    console.log('Selected rows:', selectedRows);
  }

  onDataExported(exportResult: any) {
    console.log('Data exported:', exportResult);
  }
}
```

### Editor Component - Basic Usage

Create a rich text editor:

```typescript
import { Component } from '@angular/core';
import { RichTextEditor } from '@ng-ui-lib/editor-core';
import { EditorConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-basic-editor',
  standalone: true,
  imports: [RichTextEditor],
  template: `
    <div class="editor-container">
      <ng-ui-lib-editor
        [config]="editorConfig"
        [initialContent]="initialContent"
        (contentChanged)="onContentChanged($event)"
        (documentExported)="onDocumentExported($event)">
      </ng-ui-lib-editor>
    </div>
  `,
  styles: [`
    .editor-container {
      height: 400px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `]
})
export class BasicEditorComponent {
  initialContent = '<p>Start typing your content here...</p>';

  editorConfig: EditorConfig = {
    toolbar: {
      items: [
        'bold', 'italic', 'underline', '|',
        'fontSize', 'fontColor', 'backgroundColor', '|',
        'bulletedList', 'numberedList', '|',
        'link', 'imageUpload', 'mediaEmbed', '|',
        'insertTable', '|',
        'undo', 'redo', '|',
        'export'
      ]
    },
    exportFormats: ['html', 'pdf', 'docx'],
    mediaUpload: {
      enabled: true,
      maxFileSize: 10485760, // 10MB
      allowedTypes: ['image/*', 'video/*']
    }
  };

  onContentChanged(content: string) {
    console.log('Content changed:', content);
  }

  onDocumentExported(exportResult: any) {
    console.log('Document exported:', exportResult);
  }
}
```

### Chart Component - Basic Usage

Create interactive charts:

```typescript
import { Component } from '@angular/core';
import { Chart2D } from '@ng-ui-lib/charts-2d';
import { ChartConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-basic-chart',
  standalone: true,
  imports: [Chart2D],
  template: `
    <div class="chart-container">
      <ng-ui-lib-chart
        [type]="chartType"
        [data]="chartData"
        [config]="chartConfig"
        (chartClicked)="onChartClicked($event)"
        (chartExported)="onChartExported($event)">
      </ng-ui-lib-chart>
    </div>
  `,
  styles: [`
    .chart-container {
      height: 400px;
      width: 100%;
    }
  `]
})
export class BasicChartComponent {
  chartType = 'line';

  chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Sales',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      borderColor: '#007acc',
      backgroundColor: 'rgba(0, 122, 204, 0.1)'
    }]
  };

  chartConfig: ChartConfig = {
    responsive: true,
    animation: true,
    exportable: true,
    exportFormats: ['png', 'svg', 'pdf'],
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Monthly Sales Report'
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Sales ($)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        }
      }
    }
  };

  onChartClicked(event: any) {
    console.log('Chart clicked:', event);
  }

  onChartExported(exportResult: any) {
    console.log('Chart exported:', exportResult);
  }
}
```

## 📤 Export Functionality

All components support comprehensive export capabilities:

### Grid Export
```typescript
// Excel export with custom formatting
gridComponent.exportToExcel({
  filename: 'employee-data.xlsx',
  sheetName: 'Employees',
  includeHeaders: true,
  includeFilters: true,
  customFormatting: true
});

// PDF export with company branding
gridComponent.exportToPDF({
  filename: 'report.pdf',
  title: 'Employee Report',
  logo: '/assets/company-logo.png',
  footer: 'Generated by BLG UI Kit'
});
```

### Editor Export
```typescript
// Export as Word document
editorComponent.exportToDocx({
  filename: 'document.docx',
  includeImages: true,
  preserveFormatting: true
});

// Export as PDF with custom styling
editorComponent.exportToPDF({
  filename: 'document.pdf',
  pageFormat: 'A4',
  margins: { top: 20, right: 20, bottom: 20, left: 20 }
});
```

### Chart Export
```typescript
// Export high-quality PNG
chartComponent.exportToPNG({
  filename: 'chart.png',
  width: 1200,
  height: 800,
  quality: 1.0
});

// Export vector SVG
chartComponent.exportToSVG({
  filename: 'chart.svg',
  preserveAspectRatio: true
});
```

## 🎨 Theme Customization

### Using Built-in Themes

```typescript
// In your component
export class AppComponent {
  selectedTheme = 'dark'; // 'default', 'dark', 'material', 'bootstrap'
  
  switchTheme(theme: string) {
    document.body.className = `theme-${theme}`;
  }
}
```

### Custom Theme Variables

```css
/* styles.css */
:root {
  --blg-primary-color: #007acc;
  --blg-secondary-color: #6c757d;
  --blg-background-color: #ffffff;
  --blg-text-color: #212529;
  --blg-border-color: #dee2e6;
  --blg-border-radius: 4px;
}

.theme-dark {
  --blg-background-color: #212529;
  --blg-text-color: #ffffff;
  --blg-border-color: #495057;
}
```

## 🔧 Common Configuration Patterns

### Responsive Grid
```typescript
gridConfig: GridConfig = {
  responsive: true,
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  mobileConfig: {
    virtualScrolling: false,
    showToolbar: false
  }
};
```

### Performance Optimization
```typescript
gridConfig: GridConfig = {
  virtualScrolling: true,
  rowBuffer: 10,
  enableRangeSelection: false,
  suppressRowDeselection: true,
  suppressRowClickSelection: false,
  deltaRowDataMode: true
};
```

### Accessibility Configuration
```typescript
gridConfig: GridConfig = {
  accessibility: {
    enabled: true,
    announceColumnSortOnUpdate: true,
    announceRowSelectionOnUpdate: true,
    focusable: true,
    keyboardNavigation: true
  }
};
```

## 🚨 Best Practices

### 1. Performance
- Enable virtual scrolling for datasets > 100 rows
- Use trackBy functions for ngFor loops
- Implement OnPush change detection strategy
- Debounce user input for filtering/searching

### 2. Accessibility
- Always provide meaningful headers and labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper color contrast ratios

### 3. Data Management
- Use TypeScript interfaces for data models
- Implement proper error handling
- Use Angular Signals for reactive data
- Consider using OnPush change detection

### 4. Exports
- Validate data before export
- Handle large datasets with streaming
- Provide user feedback during export
- Allow export customization

## 📚 Next Steps

Now that you have the basics working, explore more advanced features:

1. **[Component Documentation](./components/)** - Deep dive into each component
2. **[API Reference](./API_REFERENCE.md)** - Complete API documentation  
3. **[Examples](./examples/)** - More complex implementation examples
4. **[Export Features](./features/export/)** - Advanced export capabilities
5. **[Theming Guide](./features/themes/)** - Custom theme creation

## 🆘 Need Help?

- **[Troubleshooting Guide](./support/troubleshooting.md)** - Common issues and solutions
- **[FAQ](./support/faq.md)** - Frequently asked questions
- **[Community Support](./support/community.md)** - Get help from other users
- **[Professional Support](./support/professional.md)** - Enterprise support options

## 🔗 Live Examples

Try these interactive examples:
- [Basic Grid](https://stackblitz.com/edit/bigledger-grid-basic)
- [Rich Text Editor](https://stackblitz.com/edit/blg-editor-basic)
- [Chart Visualization](https://stackblitz.com/edit/blg-chart-basic)
- [Complete Example](https://stackblitz.com/edit/blg-ui-kit-complete)

---

**Ready to build amazing applications?** Start with these examples and gradually explore more advanced features as your needs grow.