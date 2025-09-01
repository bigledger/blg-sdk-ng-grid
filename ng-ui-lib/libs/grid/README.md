# @bigledger/ng-ui-grid

Enterprise-grade Angular data grid component with advanced features like virtual scrolling, sorting, filtering, and editing.

## Features

- 🚀 **High Performance**: Virtual scrolling for 500k+ rows
- 📊 **Rich Functionality**: Sorting, filtering, grouping, editing
- 🎨 **Customizable**: Themes, custom renderers, templates
- ♿ **Accessible**: WCAG 2.1 AA compliant
- 📱 **Responsive**: Mobile-friendly design
- 🔧 **Developer Friendly**: TypeScript support, comprehensive API

## Installation

```bash
# Configure npm for GitHub Packages
echo "@bigledger:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc

# Install the package
npm install @bigledger/ng-ui-grid @bigledger/ng-ui-core
```

## Quick Start

```typescript
import { Component } from '@angular/core';
import { BigLedgerGridComponent } from '@bigledger/ng-ui-grid';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [BigLedgerGridComponent],
  template: `
    <bigledger-grid 
      [data]="data" 
      [columns]="columns"
      [config]="config">
    </bigledger-grid>
  `
})
export class ExampleComponent {
  data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 }
  ];

  columns = [
    { field: 'id', header: 'ID', width: 80, sortable: true },
    { field: 'name', header: 'Name', sortable: true, filterable: true },
    { field: 'email', header: 'Email', sortable: true, filterable: true },
    { field: 'age', header: 'Age', width: 100, sortable: true, type: 'number' }
  ];

  config = {
    pagination: { enabled: true, pageSize: 50 },
    sorting: { enabled: true, mode: 'multiple' },
    filtering: { enabled: true },
    selection: { enabled: true, mode: 'multiple' }
  };
}
```

## Documentation

- 📖 [Full Documentation](../../docs/installation-guide.md)
- 🚀 [Getting Started](../../docs/github-packages-setup.md)
- 🎯 [Examples](../../examples/)

## Development

```bash
# Running unit tests
nx test grid

# Build the library
nx build grid

# Lint the code
nx lint grid
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

## Support

- 🐛 [Issues](https://github.com/bigledger/blg-sdk-ng-ui-kit/issues)
- 💬 [Discussions](https://github.com/bigledger/blg-sdk-ng-ui-kit/discussions)
- 📧 support@bigledger.com
