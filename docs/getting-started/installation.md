# Installation Guide

## Prerequisites

Before installing BlgGrid, ensure you have the following:

- **Node.js**: Version 18 or higher
- **Angular**: Version 17 or higher
- **TypeScript**: Version 5.0 or higher

## Installation

### NPM Installation

```bash
npm install @ng-ui-lib/core @ng-ui-lib/grid @ng-ui-lib/theme
```

### Yarn Installation

```bash
yarn add @ng-ui-lib/core @ng-ui-lib/grid @ng-ui-lib/theme
```

## Setup

### 1. Import Modules

Add the BlgGrid modules to your Angular application:

```typescript
// app.config.ts (Standalone)
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideAnimations(),
    // Other providers...
  ]
};

// component.ts
import { Component } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-my-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <ng-ui-lib 
      [data]="rowData" 
      [columns]="columnDefs" 
      [config]="gridConfig">
    </ng-ui-lib>
  `
})
export class MyGridComponent {
  // Component implementation
}
```

### 2. Add Styles

Include the theme styles in your application:

#### Option A: In styles.scss
```scss
@import '@ng-ui-lib/theme/styles/default-theme.scss';
```

#### Option B: In angular.json
```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "src/styles.scss",
              "node_modules/@ng-ui-lib/theme/styles/default-theme.css"
            ]
          }
        }
      }
    }
  }
}
```

## Your First Grid

Create a simple grid with minimal configuration:

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-simple-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div class="grid-container">
      <ng-ui-lib 
        [data]="rowData" 
        [columns]="columnDefs" 
        [config]="gridConfig">
      </ng-ui-lib>
    </div>
  `,
  styles: [`
    .grid-container {
      height: 500px;
      width: 100%;
    }
  `]
})
export class SimpleGridComponent {
  // Column definitions
  columnDefs: ColumnDefinition[] = [
    { 
      id: 'make', 
      field: 'make', 
      header: 'Make',
      sortable: true,
      filterable: true 
    },
    { 
      id: 'model', 
      field: 'model', 
      header: 'Model',
      sortable: true,
      filterable: true 
    },
    { 
      id: 'price', 
      field: 'price', 
      header: 'Price',
      type: 'number',
      sortable: true,
      filterable: true 
    },
    { 
      id: 'year', 
      field: 'year', 
      header: 'Year',
      type: 'number',
      width: 100,
      sortable: true 
    }
  ];

  // Sample data
  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000, year: 2023 },
    { make: 'Ford', model: 'Mondeo', price: 32000, year: 2022 },
    { make: 'Porsche', model: 'Boxster', price: 72000, year: 2023 },
    { make: 'BMW', model: 'M50', price: 60000, year: 2022 },
    { make: 'Audi', model: 'A4', price: 40000, year: 2023 }
  ];

  // Grid configuration
  gridConfig: GridConfig = {
    rowHeight: 40,
    virtualScrolling: true,
    sortable: true,
    filterable: true,
    selectable: true,
    selectionMode: 'multiple',
    resizable: true,
    reorderable: true,
    theme: 'default'
  };
}
```

## Verification

After installation and setup, you should see a functional data grid with:

- ✅ Data display in rows and columns
- ✅ Column sorting (click headers)
- ✅ Row selection
- ✅ Column resizing
- ✅ Virtual scrolling for performance
- ✅ Keyboard navigation

## Next Steps

- [Basic Configuration](./basic-configuration.md) - Learn about grid configuration options
- [Data Binding](../features/data-binding.md) - Different ways to bind data to the grid
- [Column Configuration](../features/column-configuration.md) - Advanced column setup
- [API Reference](../api-reference/README.md) - Complete API documentation

## Troubleshooting

### Common Issues

**Grid not displaying:**
- Ensure container has explicit height
- Check that data and columns are properly defined
- Verify imports are correct

**Styles not applied:**
- Check that theme styles are imported
- Verify paths in angular.json or component styles

**TypeScript errors:**
- Ensure you're using compatible Angular/TypeScript versions
- Check that all required peer dependencies are installed

For more troubleshooting help, see our [Troubleshooting Guide](../guides/troubleshooting.md).