# Getting Started Overview

Welcome to BlgGrid - the most advanced Angular data grid component designed for modern web applications. This overview will help you understand what BlgGrid offers and guide you through your first steps.

## What is BlgGrid?

BlgGrid is a comprehensive Angular data grid component that provides:

- **Enterprise-grade performance** with virtual scrolling for millions of rows
- **Native Angular integration** with Angular Signals and modern patterns
- **Complete TypeScript support** with full IntelliSense and type safety
- **Rich feature set** comparable to commercial data grids but completely open source
- **Excellent developer experience** with comprehensive documentation and examples

## Why Choose BlgGrid?

### Built for Angular Developers
- **Angular-first architecture**: Designed specifically for Angular, not a wrapper around a generic component
- **Modern Angular features**: Uses Angular Signals, standalone components, and latest patterns
- **Perfect integration**: Works seamlessly with Angular's change detection and dependency injection
- **TypeScript native**: Full type safety from development to production

### Performance That Scales
- **Virtual scrolling**: Handle millions of rows without performance degradation
- **Efficient rendering**: Only renders visible rows and columns
- **Optimized change detection**: Minimal performance impact on your application
- **Memory efficient**: Smart memory management for large datasets

### Feature Complete
- **Data operations**: Sorting, filtering, grouping, pagination
- **Cell editing**: Inline editing with validation and custom editors
- **Column management**: Resize, reorder, pin, show/hide columns
- **Row selection**: Single, multiple, and checkbox selection modes
- **Export capabilities**: CSV and Excel export with customization
- **Accessibility**: Full WCAG 2.1 AA compliance with keyboard navigation

### Developer Friendly
- **Comprehensive documentation**: Detailed guides, API reference, and examples
- **Rich examples**: 50+ working examples with StackBlitz integration
- **Migration support**: Easy migration from ag-Grid with compatibility layer
- **Active community**: Discord server and GitHub discussions

## Architecture Overview

BlgGrid follows a modular architecture with clear separation of concerns:

```
@blg-grid/
├── core/          # Core interfaces, services, and utilities
├── grid/          # Main grid component and orchestration
├── theme/         # Styling system and themes
├── cell/          # Cell rendering and editing components
├── column/        # Column management and operations
├── row/           # Row handling and virtual scrolling
└── data/          # Data processing and state management
```

### Core Concepts

**Grid Component**
The main `<blg-grid>` component that orchestrates all other components and provides the public API.

**Column Definitions**
Configuration objects that define how data fields should be displayed, formatted, and interact with users.

**Grid Configuration**
Global settings that control grid behavior, appearance, and feature enablement.

**Data Binding**
Reactive data binding using Angular Signals for optimal performance and change detection.

**Event System**
Comprehensive event system for all grid interactions with strongly-typed event interfaces.

## Getting Started Checklist

Follow these steps to get BlgGrid running in your application:

1. **[Installation](./installation.md)** - Install packages and set up your environment
2. **[First Grid](./first-grid.md)** - Create your first basic grid
3. **[Angular Setup](./angular-setup.md)** - Configure Angular-specific features
4. **[TypeScript Setup](./typescript-setup.md)** - Set up TypeScript for optimal experience
5. **[Configuration](./configuration.md)** - Learn about configuration options

## Quick Start for Experienced Developers

If you're already familiar with data grids and want to jump in quickly:

```bash
# Install packages
npm install @blg-grid/core @blg-grid/grid @blg-grid/theme

# Import and use
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

@Component({
  selector: 'app-my-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid 
      [data]="data" 
      [columns]="columns" 
      [config]="config">
    </blg-grid>
  `
})
export class MyGridComponent {
  data = [...]; // Your data array
  columns: ColumnDefinition[] = [...]; // Column definitions
  config: GridConfig = {...}; // Grid configuration
}
```

## Next Steps

After completing the getting started guide:

1. **Explore Features**: Check out our [feature documentation](../features/) to learn about specific capabilities
2. **Browse Examples**: Look at our [examples](../examples/) for real-world usage patterns
3. **API Reference**: Dive into the [API documentation](../api-reference/) for detailed information
4. **Best Practices**: Read our [best practices guide](../guides/best-practices.md) for optimal usage

## Getting Help

- **Documentation**: Start with our comprehensive docs
- **Examples**: Working examples with live demos
- **Discord**: [Join our community](https://discord.gg/blg-grid) for real-time help
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/blg-grid/issues)
- **Stack Overflow**: Tag questions with `blg-grid`

Ready to get started? Let's [install BlgGrid](./installation.md) and create your first grid!