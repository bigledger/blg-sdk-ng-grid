# BigLedger Angular UI Kit - Installation Guide

This guide covers installing and configuring BigLedger's Angular UI components from GitHub Packages.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Angular 20.1.0 or higher
- GitHub account with access to BigLedger organization

### 1. Authentication Setup

First, set up authentication for GitHub Packages:

```bash
# Configure npm to use GitHub Packages for @bigledger scope
echo "@bigledger:registry=https://npm.pkg.github.com" >> .npmrc

# Add your GitHub Personal Access Token
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
```

> 📋 See [GitHub Packages Setup Guide](./github-packages-setup.md) for detailed authentication instructions.

### 2. Install Core Packages

```bash
# Install the core package (required for all other packages)
npm install @bigledger/ng-ui-core

# Install the main grid component
npm install @bigledger/ng-ui-grid

# Install additional components as needed
npm install @bigledger/ng-ui-theme
npm install @bigledger/ng-ui-column
npm install @bigledger/ng-ui-row
npm install @bigledger/ng-ui-cell
npm install @bigledger/ng-ui-data
```

### 3. Configure Your Angular Application

Add the components to your Angular application:

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { BlgGridComponent } from '@bigledger/ng-ui-grid';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlgGridComponent],
  template: `
    <blg-grid 
      [data]="data" 
      [columns]="columns">
    </blg-grid>
  `
})
export class AppComponent {
  data = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  
  columns = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' }
  ];
}
```

## 📦 Available Packages

### Core Components

| Package | Description | Size (gzipped) |
|---------|-------------|----------------|
| `@bigledger/ng-ui-core` | Core utilities and services | ~30KB |
| `@bigledger/ng-ui-grid` | Main data grid component | ~100KB |
| `@bigledger/ng-ui-theme` | Theming system | ~15KB |

### Grid Components

| Package | Description | Dependencies |
|---------|-------------|--------------|
| `@bigledger/ng-ui-column` | Column operations | `@bigledger/ng-ui-core` |
| `@bigledger/ng-ui-row` | Row operations | `@bigledger/ng-ui-core` |
| `@bigledger/ng-ui-cell` | Cell rendering/editing | `@bigledger/ng-ui-core` |
| `@bigledger/ng-ui-data` | Data management | `@bigledger/ng-ui-core` |
| `@bigledger/ng-ui-export` | Data export functionality | `@bigledger/ng-ui-core` |

### Chart Components

| Package | Description | Dependencies |
|---------|-------------|--------------|
| `@bigledger/ng-ui-charts-core` | Chart core functionality | `@bigledger/ng-ui-core` |
| `@bigledger/ng-ui-charts-2d` | 2D chart components | `@bigledger/ng-ui-charts-core` |
| `@bigledger/ng-ui-charts-3d` | 3D chart components | `@bigledger/ng-ui-charts-core` |
| `@bigledger/ng-ui-charts-animations` | Chart animations | `@bigledger/ng-ui-charts-core` |

### Editor Components

| Package | Description | Dependencies |
|---------|-------------|--------------|
| `@bigledger/ng-ui-editor-core` | Rich text editor core | `@bigledger/ng-ui-core` |
| `@bigledger/ng-ui-editor-formats` | Text formatting | `@bigledger/ng-ui-editor-core` |
| `@bigledger/ng-ui-editor-media` | Media handling | `@bigledger/ng-ui-editor-core` |
| `@bigledger/ng-ui-editor-plugins` | Editor plugins | `@bigledger/ng-ui-editor-core` |
| `@bigledger/ng-ui-editor-tables` | Table editing | `@bigledger/ng-ui-editor-core` |
| `@bigledger/ng-ui-editor-themes` | Editor themes | `@bigledger/ng-ui-editor-core` |
| `@bigledger/ng-ui-editor-toolbar` | Editor toolbar | `@bigledger/ng-ui-editor-core` |

## 🔧 Installation Options

### Option 1: Individual Packages (Recommended)

Install only the packages you need:

```bash
# For basic grid functionality
npm install @bigledger/ng-ui-core @bigledger/ng-ui-grid @bigledger/ng-ui-theme

# For advanced grid features
npm install @bigledger/ng-ui-column @bigledger/ng-ui-row @bigledger/ng-ui-cell @bigledger/ng-ui-data

# For charts
npm install @bigledger/ng-ui-charts-core @bigledger/ng-ui-charts-2d

# For rich text editor
npm install @bigledger/ng-ui-editor-core @bigledger/ng-ui-editor-formats
```

### Option 2: Complete Installation

Install all packages for full functionality:

```bash
# Install all packages
npm install \
  @bigledger/ng-ui-core \
  @bigledger/ng-ui-grid \
  @bigledger/ng-ui-theme \
  @bigledger/ng-ui-column \
  @bigledger/ng-ui-row \
  @bigledger/ng-ui-cell \
  @bigledger/ng-ui-data \
  @bigledger/ng-ui-export \
  @bigledger/ng-ui-charts-core \
  @bigledger/ng-ui-charts-2d \
  @bigledger/ng-ui-editor-core \
  @bigledger/ng-ui-editor-formats
```

## 📋 Configuration Examples

### Basic Grid Setup

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { BlgGridComponent } from '@bigledger/ng-ui-grid';
import { GridConfig } from '@bigledger/ng-ui-core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlgGridComponent],
  template: `<blg-grid [config]="gridConfig"></blg-grid>`
})
export class AppComponent {
  gridConfig: GridConfig = {
    data: [
      { id: 1, name: 'John', age: 30, city: 'New York' },
      { id: 2, name: 'Jane', age: 25, city: 'London' },
      { id: 3, name: 'Bob', age: 35, city: 'Paris' }
    ],
    columns: [
      { field: 'id', header: 'ID', sortable: true },
      { field: 'name', header: 'Name', sortable: true, filterable: true },
      { field: 'age', header: 'Age', sortable: true, type: 'number' },
      { field: 'city', header: 'City', filterable: true }
    ],
    pagination: {
      enabled: true,
      pageSize: 10,
      showSizeOptions: true
    },
    sorting: {
      enabled: true,
      mode: 'multiple'
    },
    filtering: {
      enabled: true,
      mode: 'popup'
    }
  };
}
```

### Chart Component Setup

```typescript
// chart.component.ts
import { Component } from '@angular/core';
import { BlgChart2DComponent } from '@bigledger/ng-ui-charts-2d';
import { ChartConfig } from '@bigledger/ng-ui-charts-core';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [BlgChart2DComponent],
  template: `<blg-chart-2d [config]="chartConfig"></blg-chart-2d>`
})
export class ChartComponent {
  chartConfig: ChartConfig = {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Sales',
        data: [120, 150, 180, 200]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  };
}
```

### Rich Text Editor Setup

```typescript
// editor.component.ts
import { Component } from '@angular/core';
import { BlgEditorComponent } from '@bigledger/ng-ui-editor-core';
import { EditorConfig } from '@bigledger/ng-ui-editor-core';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [BlgEditorComponent],
  template: `
    <blg-editor 
      [config]="editorConfig"
      [(content)]="content">
    </blg-editor>
  `
})
export class EditorComponent {
  content = '<p>Start typing...</p>';
  
  editorConfig: EditorConfig = {
    toolbar: {
      enabled: true,
      items: ['bold', 'italic', 'underline', 'link', 'image', 'table']
    },
    plugins: ['formats', 'media', 'tables'],
    theme: 'light',
    placeholder: 'Enter your content here...'
  };
}
```

## 🎨 Styling and Themes

### Import Default Styles

Add to your `styles.scss` or in `angular.json`:

```scss
// Import core styles (required)
@import '@bigledger/ng-ui-core/styles/core';

// Import component styles
@import '@bigledger/ng-ui-grid/styles/grid';
@import '@bigledger/ng-ui-theme/styles/theme';

// Import chart styles (if using charts)
@import '@bigledger/ng-ui-charts-core/styles/charts';

// Import editor styles (if using editor)
@import '@bigledger/ng-ui-editor-core/styles/editor';
```

### Custom Theme Configuration

```scss
// Configure theme variables
:root {
  --blg-primary-color: #007bff;
  --blg-secondary-color: #6c757d;
  --blg-success-color: #28a745;
  --blg-danger-color: #dc3545;
  --blg-warning-color: #ffc107;
  --blg-info-color: #17a2b8;
  
  // Grid specific variables
  --blg-grid-header-bg: #f8f9fa;
  --blg-grid-border-color: #dee2e6;
  --blg-grid-row-hover: #f5f5f5;
}
```

### Dark Theme Support

```scss
// Dark theme
[data-theme='dark'] {
  --blg-primary-color: #0d6efd;
  --blg-grid-header-bg: #343a40;
  --blg-grid-border-color: #495057;
  --blg-grid-row-hover: #495057;
}
```

## 🔧 TypeScript Configuration

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@bigledger/*": ["./node_modules/@bigledger/*"]
    }
  }
}
```

## 📱 Angular Configuration

### Angular.json Updates

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "src/styles.scss",
              "node_modules/@bigledger/ng-ui-core/styles/core.scss",
              "node_modules/@bigledger/ng-ui-grid/styles/grid.scss"
            ]
          }
        }
      }
    }
  }
}
```

### Module Configuration (if using NgModules)

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BlgGridModule } from '@bigledger/ng-ui-grid';
import { BlgThemeModule } from '@bigledger/ng-ui-theme';

@NgModule({
  imports: [
    BlgGridModule,
    BlgThemeModule
  ],
  // ... rest of module configuration
})
export class AppModule { }
```

## 🧪 Testing Setup

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  moduleNameMapping: {
    '^@bigledger/(.*)$': '<rootDir>/node_modules/@bigledger/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts']
};
```

### Test Utilities

```typescript
// test-utils.ts
import { TestBed } from '@angular/core/testing';
import { BlgGridModule } from '@bigledger/ng-ui-grid';

export function setupTestBed() {
  TestBed.configureTestingModule({
    imports: [BlgGridModule]
  });
}
```

## 🚨 Common Issues & Troubleshooting

### Authentication Issues

```bash
# Verify authentication
npm whoami --registry=https://npm.pkg.github.com

# Clear cache if needed
npm cache clean --force
```

### Version Conflicts

```bash
# Check installed versions
npm list @bigledger/ng-ui-core

# Update to latest
npm update @bigledger/ng-ui-core
```

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Import Errors

Ensure you're using the correct import paths:

```typescript
// ✅ Correct
import { BlgGridComponent } from '@bigledger/ng-ui-grid';

// ❌ Incorrect
import { BlgGridComponent } from '@bigledger/ng-ui-grid/lib/grid';
```

## 📚 Next Steps

1. **Read the Documentation**: Check out the [API documentation](./api-documentation.md)
2. **View Examples**: Explore the [examples directory](../examples/)
3. **Join the Community**: Connect with other developers
4. **Report Issues**: File bugs and feature requests

## 🆘 Support

- 📖 [API Documentation](./api-documentation.md)
- 🐛 [Issue Tracker](https://github.com/bigledger/blg-sdk-ng-ui-kit/issues)
- 💬 [Discussions](https://github.com/bigledger/blg-sdk-ng-ui-kit/discussions)
- 📧 Email: support@bigledger.com

## 🔄 Migration

If you're migrating from an older version, see our [Migration Guide](./migration-guide.md) for detailed instructions.