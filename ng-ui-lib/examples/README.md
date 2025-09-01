# BigLedger Angular UI Kit - Examples

This directory contains example configurations and code snippets to help you get started with BigLedger's Angular UI components.

## 📂 Files Overview

### Configuration Files

| File | Description | Usage |
|------|-------------|--------|
| `package.json.example` | Complete package.json with all BigLedger dependencies | Copy and modify for your project |
| `angular.json.example` | Angular workspace configuration | Reference for build and style configurations |
| `tsconfig.json.example` | TypeScript configuration with path mappings | Copy to your project root |
| `.npmrc.example` | NPM configuration for GitHub Packages | Copy as `.npmrc` and add your token |

### Style Files

| File | Description | Usage |
|------|-------------|--------|
| `styles.scss.example` | Global styles with BigLedger theme | Copy as `src/styles.scss` |

### Component Examples

| File | Description | Features Demonstrated |
|------|-------------|----------------------|
| `app.component.example.ts` | Complete application component | Grid, Charts, Editor integration |

## 🚀 Quick Setup

### 1. Create a New Angular Project

```bash
# Create new Angular project
ng new my-bigledger-app --routing --style=scss --ssr=false

# Navigate to project directory
cd my-bigledger-app
```

### 2. Configure Authentication

```bash
# Copy the npmrc template
cp examples/.npmrc.example .npmrc

# Edit .npmrc and replace YOUR_GITHUB_TOKEN with your actual token
# Get your token from: https://github.com/settings/tokens
```

### 3. Install BigLedger Packages

```bash
# Copy package.json dependencies
# Add the following to your package.json dependencies:

npm install @bigledger/ng-ui-core
npm install @bigledger/ng-ui-grid
npm install @bigledger/ng-ui-theme
npm install @bigledger/ng-ui-charts-core
npm install @bigledger/ng-ui-charts-2d
npm install @bigledger/ng-ui-editor-core
```

### 4. Configure Angular

Copy the example files to your project:

```bash
# Copy TypeScript configuration
cp examples/tsconfig.json.example tsconfig.json

# Copy styles
cp examples/styles.scss.example src/styles.scss

# Copy component example
cp examples/app.component.example.ts src/app/app.component.ts
```

### 5. Update Angular Configuration

Update your `angular.json` file to include BigLedger styles:

```json
"styles": [
  "src/styles.scss",
  "node_modules/@bigledger/ng-ui-core/styles/core.scss",
  "node_modules/@bigledger/ng-ui-grid/styles/grid.scss",
  "node_modules/@bigledger/ng-ui-theme/styles/theme.scss"
]
```

### 6. Run Your Application

```bash
npm start
```

## 📋 Component Examples

### Basic Grid Setup

```typescript
import { Component } from '@angular/core';
import { BlgGridComponent } from '@bigledger/ng-ui-grid';
import { GridConfig } from '@bigledger/ng-ui-core';

@Component({
  selector: 'app-grid-example',
  standalone: true,
  imports: [BlgGridComponent],
  template: `<blg-grid [config]="gridConfig"></blg-grid>`
})
export class GridExampleComponent {
  gridConfig: GridConfig = {
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ],
    columns: [
      { field: 'id', header: 'ID', sortable: true },
      { field: 'name', header: 'Name', sortable: true, filterable: true },
      { field: 'email', header: 'Email', sortable: true, filterable: true }
    ],
    pagination: { enabled: true, pageSize: 10 },
    sorting: { enabled: true },
    filtering: { enabled: true }
  };
}
```

### Chart Integration

```typescript
import { Component } from '@angular/core';
import { BlgChart2DComponent } from '@bigledger/ng-ui-charts-2d';
import { ChartConfig } from '@bigledger/ng-ui-charts-core';

@Component({
  selector: 'app-chart-example',
  standalone: true,
  imports: [BlgChart2DComponent],
  template: `<blg-chart-2d [config]="chartConfig"></blg-chart-2d>`
})
export class ChartExampleComponent {
  chartConfig: ChartConfig = {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Sales',
        data: [120, 150, 180, 200],
        backgroundColor: '#007bff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      }
    }
  };
}
```

### Rich Text Editor

```typescript
import { Component } from '@angular/core';
import { BlgEditorComponent } from '@bigledger/ng-ui-editor-core';
import { EditorConfig } from '@bigledger/ng-ui-editor-core';

@Component({
  selector: 'app-editor-example',
  standalone: true,
  imports: [BlgEditorComponent],
  template: `
    <blg-editor 
      [config]="editorConfig"
      [(content)]="content">
    </blg-editor>
  `
})
export class EditorExampleComponent {
  content = '<p>Start typing...</p>';
  
  editorConfig: EditorConfig = {
    toolbar: {
      enabled: true,
      items: ['bold', 'italic', 'underline', 'link', 'image']
    },
    plugins: ['formats', 'media'],
    theme: 'light'
  };
}
```

## 🎨 Theming Examples

### Custom Theme

```scss
// Custom theme variables
:root {
  --blg-primary: #your-primary-color;
  --blg-secondary: #your-secondary-color;
  --blg-grid-header-bg: #your-header-bg;
  --blg-grid-row-hover: #your-hover-color;
}
```

### Dark Theme Toggle

```typescript
@Component({
  template: `
    <button (click)="toggleTheme()">
      {{ isDark ? 'Light' : 'Dark' }} Theme
    </button>
  `
})
export class ThemeToggleComponent {
  isDark = false;
  
  toggleTheme() {
    this.isDark = !this.isDark;
    document.documentElement.setAttribute(
      'data-theme', 
      this.isDark ? 'dark' : 'light'
    );
  }
}
```

## 🔧 Advanced Configuration

### Server-Side Data Source

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataSource, DataSourceParams, DataResult } from '@bigledger/ng-ui-core';
import { Observable } from 'rxjs';

@Injectable()
export class ServerDataSource implements DataSource {
  constructor(private http: HttpClient) {}
  
  getData(params: DataSourceParams): Observable<DataResult> {
    return this.http.get<DataResult>('/api/data', {
      params: {
        page: params.page.toString(),
        size: params.pageSize.toString(),
        sort: JSON.stringify(params.sortModel),
        filter: JSON.stringify(params.filterModel)
      }
    });
  }
}
```

### Custom Cell Renderer

```typescript
export class StatusCellRenderer {
  render(params: CellRendererParams): HTMLElement {
    const span = document.createElement('span');
    const status = params.value;
    
    span.className = `badge badge-${status.toLowerCase()}`;
    span.textContent = status;
    
    return span;
  }
}

// Usage in column definition
columns = [
  {
    field: 'status',
    header: 'Status',
    cellRenderer: new StatusCellRenderer()
  }
];
```

## 📱 Responsive Design

### Mobile-First Grid

```typescript
gridConfig: GridConfig = {
  // ... other config
  responsive: {
    breakpoints: {
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200
    },
    columnVisibility: {
      sm: ['name', 'email'],
      md: ['id', 'name', 'email', 'department'],
      lg: ['id', 'name', 'email', 'department', 'salary'],
      xl: 'all'
    }
  }
};
```

## 🧪 Testing Examples

### Component Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlgGridComponent } from '@bigledger/ng-ui-grid';

describe('GridComponent', () => {
  let component: GridExampleComponent;
  let fixture: ComponentFixture<GridExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlgGridComponent, GridExampleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GridExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render grid with data', () => {
    expect(component.gridConfig.data.length).toBeGreaterThan(0);
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('blg-grid')).toBeTruthy();
  });
});
```

## 🚨 Common Issues

### Authentication Issues

If you get 401/403 errors:

1. Check your `.npmrc` file
2. Verify your GitHub token has correct permissions
3. Ensure you have access to the BigLedger organization

### Module Import Errors

If imports fail:

1. Check your `tsconfig.json` paths
2. Verify package versions match
3. Clear node_modules and reinstall

### Styling Issues

If styles don't load:

1. Check `angular.json` styles array
2. Verify SCSS imports
3. Check CSS variable definitions

## 📚 Next Steps

1. Explore the [full documentation](../docs/)
2. Check out [API references](../docs/api-documentation.md)
3. Join our [community discussions](https://github.com/bigledger/blg-sdk-ng-ui-kit/discussions)

## 🤝 Contributing

Found an issue with these examples? Please:

1. Check existing [issues](https://github.com/bigledger/blg-sdk-ng-ui-kit/issues)
2. Create a new issue with details
3. Submit a pull request with fixes

## 📞 Support

- 📧 Email: support@bigledger.com
- 🐛 Issues: [GitHub Issues](https://github.com/bigledger/blg-sdk-ng-ui-kit/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/bigledger/blg-sdk-ng-ui-kit/discussions)