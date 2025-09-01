# BLG Angular UI Kit - Naming Conventions

This document outlines the naming conventions used throughout the BLG Angular UI Kit to ensure consistency, clarity, and maintainability across all components and APIs.

## 📦 Package Structure

### Package Naming
All packages follow the `@ng-ui-lib/{module-name}` pattern:

```
@ng-ui-lib/core              # Core interfaces and services
@ng-ui-lib/grid              # Grid component
@ng-ui-lib/column            # Column management
@ng-ui-lib/row               # Row operations
@ng-ui-lib/cell              # Cell rendering and editing
@ng-ui-lib/data              # Data management utilities
@ng-ui-lib/theme             # Theming system
@ng-ui-lib/editor-core       # Core editor functionality
@ng-ui-lib/editor-formats    # Text formatting features
@ng-ui-lib/editor-toolbar    # Toolbar components
@ng-ui-lib/editor-media      # Media handling
@ng-ui-lib/editor-plugins    # Plugin system
@ng-ui-lib/editor-tables     # Table editing
@ng-ui-lib/editor-themes     # Editor themes
@ng-ui-lib/charts-core       # Core charting functionality
@ng-ui-lib/charts-2d         # 2D chart implementations
@ng-ui-lib/charts-3d         # 3D chart implementations
@ng-ui-lib/charts-animations # Chart animations
@ng-ui-lib/charts-bi         # Business intelligence features
```

### Import Paths
Always use the full package name in imports:

```typescript
// ✅ Correct
import { Grid } from '@ng-ui-lib/grid';
import { ColumnDefinition } from '@ng-ui-lib/core';
import { RichTextEditor } from '@ng-ui-lib/editor-core';

// ❌ Incorrect
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition } from '@blg/core';
```

## 🏷️ Component Naming

### Component Selectors
All component selectors use the `ng-ui-lib-` prefix:

```typescript
// Grid components
@Component({ selector: 'ng-ui-lib-grid' })
@Component({ selector: 'ng-ui-lib-column-header' })
@Component({ selector: 'ng-ui-lib-cell-renderer' })

// Editor components
@Component({ selector: 'ng-ui-lib-editor' })
@Component({ selector: 'ng-ui-lib-toolbar' })
@Component({ selector: 'ng-ui-lib-format-button' })

// Chart components
@Component({ selector: 'ng-ui-lib-chart' })
@Component({ selector: 'ng-ui-lib-chart-legend' })
@Component({ selector: 'ng-ui-lib-chart-tooltip' })
```

### Component Class Names
Component classes use PascalCase with descriptive names:

```typescript
// Grid components
export class GridComponent { }
export class ColumnHeaderComponent { }
export class CellRendererComponent { }
export class VirtualScrollerComponent { }

// Editor components
export class RichTextEditorComponent { }
export class ToolbarComponent { }
export class FormatButtonComponent { }
export class MediaUploaderComponent { }

// Chart components
export class Chart2DComponent { }
export class Chart3DComponent { }
export class ChartLegendComponent { }
export class ChartTooltipComponent { }
```

## 🔧 Interface and Type Naming

### Configuration Interfaces
All configuration interfaces end with `Config`:

```typescript
export interface GridConfig {
  virtualScrolling?: boolean;
  selectable?: boolean;
  // ...
}

export interface EditorConfig {
  toolbar?: ToolbarConfig;
  plugins?: PluginConfig[];
  // ...
}

export interface ChartConfig {
  responsive?: boolean;
  animation?: AnimationConfig;
  // ...
}
```

### Data Interfaces
Data model interfaces use descriptive names without suffixes:

```typescript
export interface ColumnDefinition {
  id: string;
  field: string;
  header: string;
  // ...
}

export interface RowData {
  [key: string]: any;
}

export interface ChartDataset {
  label: string;
  data: number[];
  // ...
}
```

### Event Interfaces
Event-related interfaces end with `Event`:

```typescript
export interface RowSelectionEvent {
  selectedRows: any[];
  addedRows: any[];
  removedRows: any[];
}

export interface CellEditEvent {
  rowIndex: number;
  colId: string;
  oldValue: any;
  newValue: any;
}

export interface ChartClickEvent {
  dataIndex: number;
  datasetIndex: number;
  value: any;
}
```

### Enum Naming
Enums use PascalCase with descriptive names:

```typescript
export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
  None = 'none'
}

export enum FilterType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Boolean = 'boolean'
}

export enum ExportFormat {
  Excel = 'excel',
  CSV = 'csv',
  PDF = 'pdf',
  HTML = 'html'
}
```

## 🎯 Method and Property Naming

### Component Methods
Use verb-noun patterns for methods:

```typescript
export class GridComponent {
  // Data operations
  setRowData(data: any[]): void
  getRowData(): any[]
  addRow(rowData: any): void
  removeRow(rowIndex: number): void
  updateRow(rowIndex: number, data: any): void
  
  // Selection operations
  selectRow(rowIndex: number): void
  selectRows(rowIndices: number[]): void
  deselectRow(rowIndex: number): void
  clearSelection(): void
  
  // Export operations
  exportToExcel(options?: ExportOptions): void
  exportToPDF(options?: ExportOptions): void
  exportToCSV(options?: ExportOptions): void
  
  // UI operations
  resizeColumn(colId: string, width: number): void
  hideColumn(colId: string): void
  showColumn(colId: string): void
  sortColumn(colId: string, direction: SortDirection): void
}
```

### Component Properties
Use descriptive property names:

```typescript
export class GridComponent {
  // Input properties
  @Input() data: any[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() config: GridConfig = {};
  @Input() selectedRows: any[] = [];
  @Input() sortModel: SortModel[] = [];
  @Input() filterModel: FilterModel = {};
  
  // Output events
  @Output() rowSelectionChanged = new EventEmitter<RowSelectionEvent>();
  @Output() cellValueChanged = new EventEmitter<CellEditEvent>();
  @Output() sortChanged = new EventEmitter<SortModel[]>();
  @Output() filterChanged = new EventEmitter<FilterModel>();
  @Output() dataExported = new EventEmitter<ExportResult>();
}
```

## 🎨 CSS and Styling Naming

### CSS Classes
Use BEM methodology with `blg-` prefix:

```scss
// Grid styles
.blg-grid { }
.blg-grid__header { }
.blg-grid__body { }
.blg-grid__row { }
.blg-grid__row--selected { }
.blg-grid__cell { }
.blg-grid__cell--editable { }

// Editor styles
.blg-editor { }
.blg-editor__toolbar { }
.blg-editor__content { }
.blg-editor__button { }
.blg-editor__button--active { }

// Chart styles
.blg-chart { }
.blg-chart__container { }
.blg-chart__legend { }
.blg-chart__tooltip { }
```

### CSS Variables
Use descriptive kebab-case names with `blg-` prefix:

```scss
:root {
  // Color variables
  --blg-primary-color: #007acc;
  --blg-secondary-color: #6c757d;
  --blg-background-color: #ffffff;
  --blg-text-color: #212529;
  --blg-border-color: #dee2e6;
  
  // Grid variables
  --blg-grid-row-height: 32px;
  --blg-grid-header-height: 40px;
  --blg-grid-border-width: 1px;
  
  // Editor variables
  --blg-editor-toolbar-height: 48px;
  --blg-editor-button-size: 32px;
  --blg-editor-font-size: 14px;
  
  // Chart variables
  --blg-chart-tooltip-bg: rgba(0, 0, 0, 0.8);
  --blg-chart-legend-font-size: 12px;
  --blg-chart-animation-duration: 300ms;
}
```

### Theme Class Names
Theme classes follow the pattern `.theme-{name}`:

```scss
.theme-default { }
.theme-dark { }
.theme-material { }
.theme-bootstrap { }
.theme-custom { }
```

## 📂 File Naming

### Component Files
```
grid.component.ts           # Main component
grid.component.html         # Template
grid.component.scss         # Styles
grid.component.spec.ts      # Unit tests
grid.types.ts              # Type definitions
grid.service.ts            # Related service
grid.module.ts             # Module (if needed)
```

### Service Files
```
grid-state.service.ts       # State management
grid-export.service.ts      # Export functionality
grid-filter.service.ts      # Filtering logic
column-resize.service.ts    # Column operations
```

### Utility Files
```
grid.utils.ts              # Grid utilities
export.utils.ts            # Export utilities
format.utils.ts            # Formatting utilities
validation.utils.ts        # Validation helpers
```

## 🔄 Event Naming

### Output Event Names
Use present tense with descriptive names:

```typescript
// Grid events
@Output() rowSelectionChanged = new EventEmitter();
@Output() cellValueChanged = new EventEmitter();
@Output() columnResized = new EventEmitter();
@Output() dataFiltered = new EventEmitter();
@Output() dataSorted = new EventEmitter();
@Output() dataExported = new EventEmitter();

// Editor events
@Output() contentChanged = new EventEmitter();
@Output() formatApplied = new EventEmitter();
@Output() imageUploaded = new EventEmitter();
@Output() documentSaved = new EventEmitter();
@Output() documentExported = new EventEmitter();

// Chart events
@Output() chartClicked = new EventEmitter();
@Output() chartHovered = new EventEmitter();
@Output() legendToggled = new EventEmitter();
@Output() dataPointSelected = new EventEmitter();
@Output() chartExported = new EventEmitter();
```

### Event Handler Methods
Use `on` prefix for event handler methods:

```typescript
export class AppComponent {
  onRowSelectionChanged(event: RowSelectionEvent): void { }
  onCellValueChanged(event: CellEditEvent): void { }
  onDataExported(result: ExportResult): void { }
  onContentChanged(content: string): void { }
  onChartClicked(event: ChartClickEvent): void { }
}
```

## 📊 Export Functionality Naming

### Export Methods
All export methods follow the pattern `exportTo{Format}`:

```typescript
// Grid exports
exportToExcel(options?: ExcelExportOptions): Promise<ExportResult>
exportToCSV(options?: CSVExportOptions): Promise<ExportResult>
exportToPDF(options?: PDFExportOptions): Promise<ExportResult>
exportToJSON(options?: JSONExportOptions): Promise<ExportResult>

// Editor exports
exportToHTML(options?: HTMLExportOptions): Promise<ExportResult>
exportToPDF(options?: PDFExportOptions): Promise<ExportResult>
exportToDocx(options?: DocxExportOptions): Promise<ExportResult>
exportToMarkdown(options?: MarkdownExportOptions): Promise<ExportResult>

// Chart exports
exportToPNG(options?: ImageExportOptions): Promise<ExportResult>
exportToSVG(options?: SVGExportOptions): Promise<ExportResult>
exportToPDF(options?: PDFExportOptions): Promise<ExportResult>
exportToJSON(options?: JSONExportOptions): Promise<ExportResult>
```

### Export Option Interfaces
Export options use the pattern `{Format}ExportOptions`:

```typescript
export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  includeFilters?: boolean;
  customFormatting?: boolean;
}

export interface PDFExportOptions {
  filename?: string;
  pageSize?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: MarginOptions;
  title?: string;
  footer?: string;
}
```

## 🌐 Internationalization (i18n)

### Translation Keys
Use hierarchical dot notation:

```json
{
  "grid": {
    "toolbar": {
      "export": "Export",
      "filter": "Filter",
      "sort": "Sort"
    },
    "columns": {
      "show": "Show Column",
      "hide": "Hide Column",
      "resize": "Resize Column"
    },
    "export": {
      "excel": "Export to Excel",
      "csv": "Export to CSV",
      "pdf": "Export to PDF"
    }
  },
  "editor": {
    "toolbar": {
      "bold": "Bold",
      "italic": "Italic",
      "underline": "Underline"
    },
    "export": {
      "html": "Export as HTML",
      "pdf": "Export as PDF",
      "docx": "Export as Word"
    }
  }
}
```

## ✅ Validation Rules

### Component Naming Checklist
- [ ] Component selector starts with `ng-ui-lib-`
- [ ] Component class name ends with `Component`
- [ ] Interface names are descriptive and follow conventions
- [ ] Method names use verb-noun patterns
- [ ] Event names are descriptive and consistent
- [ ] CSS classes follow BEM methodology
- [ ] File names are lowercase with hyphens
- [ ] Export methods follow `exportTo{Format}` pattern

### Common Naming Mistakes to Avoid

```typescript
// ❌ Incorrect naming
@Component({ selector: 'blg-grid' })           // Missing ng-ui-lib prefix
export class Grid { }                          // Missing Component suffix
@Output() rowClick = new EventEmitter();       // Not descriptive enough
exportExcel(): void { }                        // Inconsistent with pattern

// ✅ Correct naming
@Component({ selector: 'ng-ui-lib-grid' })
export class GridComponent { }
@Output() rowSelectionChanged = new EventEmitter();
exportToExcel(): void { }
```

## 📖 Documentation Naming

### File Structure
```
docs/
├── README.md                          # Main documentation entry
├── GETTING_STARTED.md                 # Getting started guide
├── NAMING_CONVENTIONS.md              # This document
├── API_REFERENCE.md                   # Complete API reference
├── components/                        # Component documentation
│   ├── grid/
│   │   ├── README.md                  # Grid overview
│   │   ├── configuration.md           # Configuration guide
│   │   └── examples.md                # Usage examples
│   ├── editor/
│   └── charts/
├── features/                          # Feature documentation
│   ├── export/
│   ├── themes/
│   └── accessibility/
└── examples/                          # Code examples
    ├── grid-examples/
    ├── editor-examples/
    └── chart-examples/
```

## 🔗 References

This naming convention document ensures:

1. **Consistency** - All components follow the same patterns
2. **Clarity** - Names are descriptive and self-documenting
3. **Maintainability** - Easy to understand and modify
4. **Discoverability** - Logical naming helps with IDE autocomplete
5. **Professional Standards** - Follows Angular and TypeScript best practices

For questions about naming conventions not covered here, please refer to:
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [TypeScript Naming Conventions](https://typescript-eslint.io/rules/naming-convention/)
- [BEM CSS Methodology](http://getbem.com/naming/)