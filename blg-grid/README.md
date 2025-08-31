# BlgGrid

A modern, high-performance Angular data grid component built with Angular 17+, TypeScript, and Angular Signals. BlgGrid provides enterprise-grade features with excellent performance and developer experience.

[![npm version](https://badge.fury.io/js/@blg-grid%2Fcore.svg)](https://badge.fury.io/js/@blg-grid%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-17%2B-red)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

## Features

### Core Capabilities
- **🚀 Virtual Scrolling**: Handle 100,000+ rows with smooth performance
- **📊 Data Types**: String, number, date, boolean, and custom types
- **🔄 Sorting**: Single and multi-column sorting with custom comparators
- **🔍 Filtering**: Built-in filters for all data types with custom filter support
- **✅ Row Selection**: Single or multiple selection with checkbox support
- **📐 Column Operations**: Resize, reorder, pin, show/hide columns
- **⌨️ Keyboard Navigation**: Full keyboard support with ARIA compliance
- **🎨 Theming**: Multiple built-in themes with custom theme support

### Angular Integration
- **📡 Angular Signals**: Reactive data binding with Angular's latest features
- **🧩 Standalone Components**: Modern Angular architecture
- **🔧 TypeScript First**: Complete type safety and IntelliSense support
- **🧪 Testing Ready**: Comprehensive testing utilities and examples
- **♿ Accessibility**: WCAG 2.1 AA compliant with screen reader support

### Performance & Developer Experience
- **⚡ Optimized Rendering**: Efficient change detection and DOM updates
- **📦 Tree Shakable**: Only bundle what you use
- **🛠️ Developer Tools**: Rich debugging and development utilities
- **📚 Comprehensive Documentation**: Detailed guides and API reference
- **🔄 ag-Grid Migration**: Easy migration path from ag-Grid

## Quick Start

### Installation

```bash
npm install @blg-grid/core @blg-grid/grid @blg-grid/theme
```

### Basic Usage

```typescript
import { Component } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

@Component({
  selector: 'app-my-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div style="height: 500px;">
      <blg-grid 
        [data]="rowData" 
        [columns]="columnDefs" 
        [config]="gridConfig">
      </blg-grid>
    </div>
  `,
  styles: [`
    @import '@blg-grid/theme/styles/default-theme.scss';
  `]
})
export class MyGridComponent {
  rowData = [
    { id: 1, make: 'Toyota', model: 'Celica', price: 35000, year: 2023 },
    { id: 2, make: 'Ford', model: 'Mondeo', price: 32000, year: 2022 },
    { id: 3, make: 'Porsche', model: 'Boxster', price: 72000, year: 2023 }
  ];

  columnDefs: ColumnDefinition[] = [
    { id: 'make', field: 'make', header: 'Make', type: 'string', sortable: true },
    { id: 'model', field: 'model', header: 'Model', type: 'string', sortable: true },
    { id: 'price', field: 'price', header: 'Price', type: 'number', sortable: true },
    { id: 'year', field: 'year', header: 'Year', type: 'number', sortable: true }
  ];

  gridConfig: GridConfig = {
    virtualScrolling: true,
    selectable: true,
    sortable: true,
    filterable: true,
    resizable: true,
    theme: 'default'
  };
}
```

## Documentation

### Getting Started
- [Installation Guide](./docs/getting-started/installation.md) - Setup and first grid
- [Basic Configuration](./docs/getting-started/basic-configuration.md) - Essential configuration options

### Feature Guides
- [Data Binding](./docs/features/data-binding.md) - Working with different data sources
- [Sorting & Filtering](./docs/features/sorting-filtering.md) - Data manipulation features
- [Row Selection](./docs/features/row-selection.md) - Single and multiple selection
- [Column Configuration](./docs/features/column-configuration.md) - Advanced column setup
- [Virtual Scrolling](./docs/features/virtual-scrolling.md) - Performance optimization
- [Theming & Styling](./docs/features/theming.md) - Customizing appearance
- [Keyboard Navigation](./docs/features/keyboard-navigation.md) - Accessibility features

### API Reference
- [Grid Component](./docs/api-reference/grid-component.md) - Main component API
- [GridConfig Interface](./docs/api-reference/interfaces/grid-config.md) - Configuration options
- [ColumnDefinition Interface](./docs/api-reference/interfaces/column-definition.md) - Column setup
- [GridStateService](./docs/api-reference/services/grid-state-service.md) - State management

### Examples & Templates
- [Code Examples](./docs/examples/) - Working examples with StackBlitz demos
- [Enterprise Examples](./docs/examples/enterprise/) - Real-world applications
- [Migration Examples](./docs/examples/migration/) - ag-Grid migration samples

### Migration & Advanced Topics
- [ag-Grid Migration Guide](./docs/guides/migration-from-ag-grid.md) - Complete migration guide
- [Best Practices](./docs/guides/best-practices.md) - Recommended patterns
- [Troubleshooting](./docs/guides/troubleshooting.md) - Common issues and solutions
- [Performance Guide](./docs/guides/performance.md) - Optimization strategies

## Live Examples

Try BlgGrid instantly with these live examples:

- [Basic Grid](https://stackblitz.com/edit/blg-grid-basic) - Simple grid with sorting and filtering
- [Large Dataset](https://stackblitz.com/edit/blg-grid-large-data) - 100k rows with virtual scrolling  
- [Enterprise Dashboard](https://stackblitz.com/edit/blg-grid-enterprise) - Feature-rich business application
- [Custom Renderers](https://stackblitz.com/edit/blg-grid-custom-renderers) - Custom cell rendering
- [Real-time Data](https://stackblitz.com/edit/blg-grid-realtime) - Live data updates

## Architecture

BlgGrid is built as a modular system:

```
@blg-grid/
├── core/          # Core interfaces, services, and utilities
├── grid/          # Main grid component and features  
├── theme/         # Styling and theme system
├── cell/          # Cell rendering components
├── column/        # Column management
├── row/           # Row handling
└── data/          # Data processing utilities
```

## Browser Support

BlgGrid supports all modern browsers:

- Chrome 80+
- Firefox 75+ 
- Safari 13+
- Edge 80+

## Development

### Running the Demo

```bash
# Install dependencies
npm install

# Start development server
npx nx serve grid-demo

# Run tests
npx nx test

# Build all packages
npx nx build
```

### Project Structure

This is an Nx monorepo containing:

- `apps/grid-demo/` - Demo application
- `libs/*/` - BlgGrid library packages
- `docs/` - Comprehensive documentation
- `e2e/` - End-to-end tests

### Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## Comparison with Other Grids

| Feature | BlgGrid | ag-Grid | Angular Material Table |
|---------|---------|---------|----------------------|
| Framework | Angular-native | Framework agnostic | Angular-native |
| Bundle Size | ~150KB | ~500KB+ | ~50KB |
| Virtual Scrolling | ✅ Built-in | ✅ Built-in | ❌ Manual setup |
| TypeScript | ✅ First-class | ✅ Community types | ✅ First-class |
| Angular Signals | ✅ Native support | ❌ No support | ⚠️ Limited |
| Licensing | MIT (Open source) | Dual (Commercial features) | MIT |
| Performance | Excellent | Very Good | Good |
| Features | Enterprise-grade | Enterprise-grade | Basic |

## Why BlgGrid?

### For Angular Developers
- **Native Angular Integration**: Built specifically for Angular with proper change detection
- **Modern Architecture**: Uses Angular Signals, standalone components, and latest patterns  
- **Type Safety**: Complete TypeScript support with IntelliSense everywhere
- **Performance**: Optimized for Angular's change detection and rendering

### For Teams
- **No License Costs**: Fully open source with MIT license
- **Comprehensive**: Enterprise features without additional licensing
- **Maintainable**: Clean architecture and extensive documentation
- **Future-Proof**: Built with Angular's latest features and patterns

### For Users
- **Accessible**: WCAG 2.1 AA compliant with keyboard navigation
- **Responsive**: Works great on desktop, tablet, and mobile
- **Fast**: Handles large datasets with smooth interactions
- **Intuitive**: Familiar grid interactions and conventions

## Support

### Community Support
- **GitHub Issues**: [Report bugs and request features](https://github.com/your-org/blg-grid/issues)
- **Discord**: [Join our community](https://discord.gg/blg-grid)
- **Stack Overflow**: Tag questions with `blg-grid`
- **Documentation**: [Comprehensive guides and API docs](./docs/)

### Professional Support  
- **Enterprise Support**: Priority support for business customers
- **Training**: Custom training sessions and workshops
- **Consulting**: Migration and implementation services
- **Custom Development**: Feature development and customization

## Roadmap

### Version 2.0 (Q2 2024)
- [ ] Tree/hierarchical data support
- [ ] Column grouping and spanning
- [ ] Advanced filtering UI
- [ ] Excel-like editing experience
- [ ] Chart integration

### Version 2.1 (Q3 2024)
- [ ] Master-detail views
- [ ] Pivot table functionality  
- [ ] Advanced theming system
- [ ] Mobile-optimized interactions

## License

BlgGrid is MIT licensed. See [LICENSE](./LICENSE) for details.

## Acknowledgments

Special thanks to:
- Angular team for the amazing framework
- ag-Grid for inspiration on data grid UX patterns
- The open source community for feedback and contributions

---

**Ready to get started?** Check out our [Installation Guide](./docs/getting-started/installation.md) or try the [live examples](./docs/examples/).

**Need help?** Join our [Discord community](https://discord.gg/blg-grid) or check the [troubleshooting guide](./docs/guides/troubleshooting.md).
