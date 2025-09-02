# BLG Grid Documentation

Welcome to **BLG Grid** - the most advanced Angular data grid component, rivaling ag-Grid in functionality while being built from the ground up for modern Angular applications.

## 📊 Overview

![BLG Grid Showcase](../images/grid-complete-overview.png)

BLG Grid delivers enterprise-grade data grid capabilities with:

- **Unmatched Performance** - Handle 500k+ rows with virtual scrolling
- **Advanced Features** - Tree data, column grouping, master-detail, pivoting
- **Real-time Updates** - Live data streaming and reactive updates
- **Export Integration** - Seamless integration with BLG Export for reports
- **Angular Native** - Built with Angular Signals and standalone components

## 🚀 Quick Start

Get your first high-performance grid running in 5 minutes:

```bash
# Install BLG Grid
npm install @blg/grid

# Or install the complete UI Kit
npm install @blg/ui-kit
```

```typescript
// app.component.ts
import { BlgGridComponent } from '@blg/grid';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlgGridComponent],
  template: `
    <blg-grid [data]="gridData" 
              [config]="gridConfig"
              (selectionChanged)="onSelectionChanged($event)"
              (cellValueChanged)="onCellValueChanged($event)">
    </blg-grid>
  `
})
export class AppComponent {
  gridData = [
    { id: 1, name: 'John Doe', age: 30, department: 'Engineering', salary: 75000 },
    { id: 2, name: 'Jane Smith', age: 25, department: 'Marketing', salary: 65000 },
    { id: 3, name: 'Bob Johnson', age: 35, department: 'Sales', salary: 70000 }
  ];
  
  gridConfig = {
    columns: [
      { field: 'id', headerName: 'ID', width: 70, pinned: 'left' },
      { field: 'name', headerName: 'Name', width: 120, sortable: true },
      { field: 'age', headerName: 'Age', width: 80, type: 'number' },
      { field: 'department', headerName: 'Department', width: 130 },
      { 
        field: 'salary', 
        headerName: 'Salary', 
        width: 110, 
        type: 'currency',
        editable: true
      }
    ],
    enableSorting: true,
    enableFiltering: true,
    enableRowSelection: true,
    virtualScrolling: true,
    pagination: {
      enabled: true,
      pageSize: 50
    }
  };
  
  onSelectionChanged(selectedRows: any[]) {
    console.log('Selected rows:', selectedRows);
  }
  
  onCellValueChanged(event: CellValueChangedEvent) {
    console.log('Cell value changed:', event);
  }
}
```

**Result**: A blazing-fast data grid with sorting, filtering, and editing capabilities!

## 🎯 Key Features

### ⚡ **Performance Excellence**
- **Virtual Scrolling** - Smooth scrolling through millions of rows
- **Lazy Loading** - Load data on demand for optimal performance
- **Change Detection Optimization** - OnPush strategy throughout
- **Memory Management** - Efficient garbage collection

### 📈 **Advanced Data Operations**
- **Server-Side Row Model** - Handle infinite datasets
- **Tree/Hierarchical Data** - Expandable row groups
- **Master-Detail** - Nested detail panels
- **Pivot Mode** - Dynamic column pivoting
- **Aggregation** - Built-in sum, count, average, min, max

### 🎨 **Rich User Experience**
- **Column Operations** - Resize, reorder, pin, group, hide
- **Filtering System** - Advanced filters with custom operators
- **Cell Editing** - Inline editing with validation
- **Row Selection** - Single, multiple, checkbox selection
- **Keyboard Navigation** - Full keyboard accessibility

### 🔄 **Real-time Capabilities**
- **Live Data Updates** - Reactive data binding
- **Streaming Data** - Real-time data feeds
- **Transaction Support** - Batch updates with rollback
- **Change Detection** - Automatic UI updates

## 📚 Documentation Sections

### 🎯 Getting Started
- **[Installation Guide](../getting-started/installation.md)** - Setup and basic configuration
- **[Basic Configuration](../getting-started/basic-configuration.md)** - Essential configuration options
- **[First Grid](../getting-started/first-grid.md)** - Your first grid in 5 minutes

### 📊 Data Management
- **[Data Binding](../features/data-binding.md)** - Static, observable, and HTTP data sources
- **[Server-Side Data](../features/data-operations/server-side.md)** - Infinite row model and pagination
- **[Real-time Updates](../features/data-operations/real-time.md)** - Live data streaming
- **[Tree Data](../features/rows/tree-data.md)** - Hierarchical data structures

### 🔧 Column Configuration
- **[Column Definitions](../features/column-configuration.md)** - Complete column setup guide
- **[Column Types](../features/columns/column-types.md)** - Built-in and custom column types
- **[Column Grouping](../features/columns/grouping.md)** - Multi-level column headers
- **[Pinned Columns](../features/columns/pinning.md)** - Fixed left/right columns

### 📋 Row Operations
- **[Row Selection](../features/row-selection.md)** - Single and multiple selection
- **[Row Grouping](../features/rows/grouping.md)** - Group rows by column values
- **[Master-Detail](../features/rows/master-detail.md)** - Expandable detail panels
- **[Row Height](../features/rows/row-height.md)** - Dynamic and auto-sizing

### 🎯 Filtering & Sorting
- **[Column Filters](../features/data-operations/filtering.md)** - Built-in filter types
- **[Custom Filters](../features/filters/custom-filters.md)** - Create custom filter components
- **[Advanced Filtering](../features/filters/advanced.md)** - Complex filter conditions
- **[Sorting](../features/data-operations/sorting.md)** - Single and multi-column sorting

### ✏️ Editing & Validation
- **[Cell Editing](../features/editing/cell-editing.md)** - Inline editing capabilities
- **[Custom Editors](../features/editing/custom-editors.md)** - Build custom edit components
- **[Validation](../features/editing/validation.md)** - Data validation and error handling
- **[Full Row Editing](../features/editing/full-row.md)** - Edit entire rows

### 🎨 Theming & Styling
- **[Built-in Themes](../features/theming.md)** - Pre-built theme options
- **[Custom Styling](../styling/custom-themes.md)** - Create your own themes
- **[CSS Variables](../styling/css-variables.md)** - Easy theme customization
- **[Responsive Design](../styling/responsive.md)** - Mobile-friendly layouts

### 📊 Advanced Features
- **[Virtual Scrolling](../features/virtual-scrolling.md)** - Handle large datasets
- **[Pivot Mode](../features/advanced/pivot-mode.md)** - Dynamic data pivoting
- **[Aggregation](../features/advanced/aggregation.md)** - Built-in calculations
- **[Export Integration](../features/advanced/export.md)** - Seamless export capabilities

### 🔧 API Reference
- **[Grid Component API](../api-reference/grid-component.md)** - Complete component reference
- **[Column Definition](../api-reference/interfaces/column-definition.md)** - Column configuration options
- **[Grid Configuration](../api-reference/interfaces/grid-config.md)** - Grid setup options
- **[Events](../api-reference/interfaces/grid-events.md)** - All available events
- **[Services](../api-reference/services/)** - Grid services and utilities

### 💡 Examples & Demos
- **[Basic Examples](../examples/basic/)** - Simple grid implementations
- **[Advanced Examples](../examples/advanced/)** - Complex features and customizations
- **[Enterprise Examples](../examples/enterprise/)** - Real-world business applications
- **[Integration Examples](../examples/integration/)** - Using with Charts, Export, etc.

## 🎮 Live Examples

Experience BLG Grid's power with these interactive demos:

| Feature | Description | Live Demo |
|---------|-------------|-----------|
| **Basic Data Grid** | Simple grid with sorting and filtering | [StackBlitz](https://stackblitz.com/edit/blg-grid-basic) |
| **Virtual Scrolling** | 100k+ rows with smooth scrolling | [StackBlitz](https://stackblitz.com/edit/blg-grid-virtual) |
| **Tree Data** | Hierarchical data with expand/collapse | [StackBlitz](https://stackblitz.com/edit/blg-grid-tree) |
| **Real-time Updates** | Live streaming data updates | [StackBlitz](https://stackblitz.com/edit/blg-grid-realtime) |
| **Master-Detail** | Expandable row details | [StackBlitz](https://stackblitz.com/edit/blg-grid-master-detail) |
| **Financial Dashboard** | Complex business application | [StackBlitz](https://stackblitz.com/edit/blg-grid-financial) |

## 🏗️ Architecture

BLG Grid is built with a modular architecture:

- **`@blg/grid-core`** - Core grid engine and virtual scrolling
- **`@blg/grid-columns`** - Column operations and management
- **`@blg/grid-rows`** - Row operations and grouping
- **`@blg/grid-data`** - Data sources and management
- **`@blg/grid-filters`** - Filtering system and components
- **`@blg/grid-editors`** - Cell editors and validation
- **`@blg/grid-themes`** - Theming and styling system

## 📊 Performance Benchmarks

### Virtual Scrolling Performance
- **10k rows**: 60 FPS smooth scrolling
- **100k rows**: 45+ FPS with minimal lag
- **500k rows**: 30+ FPS (still usable)
- **1M+ rows**: Server-side row model recommended

### Memory Usage
- **10k rows**: ~20MB
- **100k rows**: ~100MB
- **500k rows**: ~400MB
- **Streaming**: Constant memory usage with data cleanup

### Initial Render Time
- **1k rows**: < 100ms
- **10k rows**: < 500ms
- **100k rows**: < 2s (with virtual scrolling)

## 🌐 Browser Support

- **Chrome**: 80+ (recommended for best performance)
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+
- **Mobile**: iOS 13+, Android 8+

## 🚀 Migration from ag-Grid

Switching from ag-Grid? We've made it easy:

### Key Differences
```typescript
// ag-Grid style
gridOptions = {
  columnDefs: [...],
  rowData: [...],
  enableSorting: true
};

// BLG Grid style (more Angular-native)
gridConfig = {
  columns: [...],      // columnDefs → columns
  enableSorting: true  // Same
};
// Data passed via [data] input
```

### Migration Tools
- **[Migration Guide](../migration/ag-grid-to-blg-grid.md)** - Step-by-step migration process
- **[API Mapping](../migration/api-mapping.md)** - ag-Grid to BLG Grid API conversion
- **[Code Examples](../migration/examples.md)** - Before/after code samples

## 🎯 When to Use BLG Grid

### ✅ Perfect For:
- **Angular Applications** - Built specifically for Angular
- **Large Datasets** - Exceptional virtual scrolling performance
- **Real-time Data** - Live updates and streaming
- **Enterprise Applications** - Professional features and support
- **Report Generation** - Integrated export capabilities
- **Modern Development** - Signals, standalone components, TypeScript

### 🤔 Consider Alternatives If:
- **Non-Angular Projects** - ag-Grid might be better for React/Vue
- **Simple Tables** - Native HTML table might suffice
- **Legacy Angular** - Older versions may need ag-Grid
- **Extremely Custom Needs** - Building from scratch might be better

## 🛠️ Common Use Cases

### Financial Trading Platforms
```typescript
const tradingGridConfig = {
  columns: [
    { field: 'symbol', headerName: 'Symbol', pinned: 'left' },
    { field: 'price', headerName: 'Price', type: 'currency', cellClass: 'price-cell' },
    { field: 'change', headerName: 'Change', cellRenderer: 'changeRenderer' },
    { field: 'volume', headerName: 'Volume', type: 'number' }
  ],
  enableRealTimeUpdates: true,
  flashCells: true, // Highlight changed cells
  refreshRate: 100  // Update every 100ms
};
```

### Admin Dashboards
```typescript
const adminGridConfig = {
  columns: [
    { field: 'id', headerName: 'ID', checkboxSelection: true },
    { field: 'name', headerName: 'User Name', filter: 'text' },
    { field: 'email', headerName: 'Email', filter: 'text' },
    { field: 'role', headerName: 'Role', filter: 'select' },
    { field: 'lastLogin', headerName: 'Last Login', type: 'date' }
  ],
  enableRowSelection: true,
  bulkOperations: ['delete', 'activate', 'deactivate']
};
```

### Inventory Management
```typescript
const inventoryGridConfig = {
  columns: [
    { field: 'sku', headerName: 'SKU', pinned: 'left' },
    { field: 'name', headerName: 'Product Name' },
    { field: 'stock', headerName: 'Stock', type: 'number', editable: true },
    { field: 'reorderPoint', headerName: 'Reorder Point', type: 'number' },
    { field: 'supplier', headerName: 'Supplier' }
  ],
  cellEditingStarted: (event) => this.trackEdit(event),
  enableInlineEditing: true
};
```

## 🆘 Support & Community

- **[GitHub Issues](https://github.com/bigledger/grid/issues)** - Bug reports and feature requests
- **[Discord Community](https://discord.gg/bigledger-grid)** - Community discussions and support
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/blg-grid)** - Technical Q&A
- **[Documentation Site](https://grid.bigledger.com)** - Comprehensive documentation

## 🔐 Enterprise Features

### Advanced Security
- **Row-Level Security** - Control data access per user
- **Column Permissions** - Hide/show columns based on roles
- **Audit Trail** - Track all data changes
- **Data Masking** - Automatic PII protection

### Professional Support
- **24/7 Support** - Enterprise support plans available
- **Custom Development** - Tailored features and integrations
- **Training Programs** - Team training and certification
- **Migration Services** - Professional migration from other grids

---

**Ready to build amazing data grids?** Start with our [Installation Guide](../getting-started/installation.md) and create your first high-performance grid!

**Coming from ag-Grid?** Check our [Migration Guide](../migration/ag-grid-to-blg-grid.md) for a smooth transition.

**Want to see it in action?** Explore our [Live Examples](https://grid.bigledger.com/examples) or try the [Interactive Demo](https://grid.bigledger.com/demo).