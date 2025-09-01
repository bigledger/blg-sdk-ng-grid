# @ng-ui/editor-tables

A comprehensive Angular table editor library with advanced editing capabilities, built with modern Angular 20+ and Signals.

## Features

### ✨ Visual Table Creation
- **Interactive Table Picker**: Froala-like visual grid picker for quick table creation
- **Custom Size Input**: Specify exact row and column counts
- **Table Templates**: Pre-configured table styles and layouts
- **Responsive Options**: Create responsive tables with automatic mobile optimization

### 🎯 Advanced Cell Selection
- **Mouse Selection**: Click and drag to select ranges of cells
- **Keyboard Navigation**: Full arrow key navigation with Shift+Arrow for range selection
- **Multi-Selection**: Ctrl/Cmd+Click for non-contiguous selections
- **Row/Column Selection**: Click headers to select entire rows or columns
- **Select All**: Ctrl/Cmd+A to select the entire table

### 🛠️ Table Manipulation
- **Row Operations**: Insert/delete rows above or below current selection
- **Column Operations**: Insert/delete columns left or right of current selection
- **Cell Merging**: Merge selected cells into a single cell
- **Cell Splitting**: Split merged cells back into individual cells
- **Drag to Resize**: Drag column borders to adjust widths

### 📊 Data Import/Export
- **CSV Import**: Import CSV files with automatic delimiter detection
- **CSV Export**: Export table data as CSV with customizable options
- **Excel Paste**: Paste directly from Excel with tab-separated value support
- **JSON Support**: Import/export table data in JSON format
- **Copy/Paste**: Standard clipboard operations for cell data

### 🎨 Rich Formatting
- **Cell Styling**: Background colors, text colors, alignment, padding
- **Border Styles**: Solid, dashed, dotted, double, or no borders
- **Cell Types**: Mark cells as headers with special styling
- **Table Alignment**: Left, center, or right alignment for the entire table
- **Custom CSS**: Apply custom CSS classes for advanced styling

### ⚡ Performance & UX
- **Signal-Based Architecture**: Built with Angular Signals for optimal reactivity
- **Virtual Scrolling**: Handle large tables with thousands of rows efficiently
- **Undo/Redo**: Complete undo/redo system for all table operations
- **Contextual Toolbar**: Smart toolbar that appears when working with tables
- **Keyboard Shortcuts**: Full keyboard support for power users

## Installation

```bash
npm install @ng-ui/editor-tables
```

## Quick Start

### Standalone Components (Recommended)

```typescript
import { Component } from '@angular/core';
import { TableEditorComponent, TableInsertionDialogComponent } from '@ng-ui/editor-tables';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [TableEditorComponent, TableInsertionDialogComponent],
  template: `
    <div class="editor-container">
      <blg-table-insertion-dialog 
        [isOpen]="showTableDialog"
        (tableCreated)="onTableCreated($event)"
        (dialogClosed)="showTableDialog = false">
      </blg-table-insertion-dialog>
      
      <blg-table-editor 
        (tableChanged)="onTableChanged($event)"
        (cellEdited)="onCellEdited($event)">
      </blg-table-editor>
    </div>
  `
})
export class EditorComponent {
  showTableDialog = false;

  onTableCreated(config: any) {
    console.log('Table created:', config);
  }

  onTableChanged(table: any) {
    console.log('Table changed:', table);
  }

  onCellEdited(event: any) {
    console.log('Cell edited:', event);
  }
}
```

### Module Usage

```typescript
import { NgModule } from '@angular/core';
import { EditorTablesModule } from '@ng-ui/editor-tables';

@NgModule({
  imports: [
    EditorTablesModule.forRoot({
      defaultTableConfig: {
        rows: 3,
        columns: 3,
        hasHeader: true
      },
      features: {
        enableImportExport: true,
        enableAdvancedFormatting: true
      }
    })
  ]
})
export class AppModule { }
```

## Components

### TableEditorComponent

The main table editing component with full functionality.

```html
<blg-table-editor 
  (tableChanged)="onTableChanged($event)"
  (cellEdited)="onCellEdited($event)">
</blg-table-editor>
```

**Events:**
- `tableChanged`: Emitted when table structure or data changes
- `cellEdited`: Emitted when individual cell content is modified

### TableInsertionDialogComponent

Modal dialog for creating new tables with visual picker.

```html
<blg-table-insertion-dialog 
  [isOpen]="showDialog"
  (tableCreated)="onTableCreated($event)"
  (dialogClosed)="onDialogClosed()">
</blg-table-insertion-dialog>
```

**Inputs:**
- `isOpen`: Boolean to control dialog visibility

**Events:**
- `tableCreated`: Emitted when a new table is created
- `dialogClosed`: Emitted when dialog is closed

### TablePropertiesEditorComponent

Side panel for editing table and cell properties.

```html
<blg-table-properties-editor 
  [isOpen]="showProperties"
  (propertiesChanged)="onPropertiesChanged()"
  (editorClosed)="onPropertiesEditorClosed()">
</blg-table-properties-editor>
```

### TableToolbarComponent

Contextual toolbar with quick action buttons.

```html
<blg-table-toolbar 
  [visible]="showToolbar"
  (propertiesClicked)="openProperties()"
  (tableDeleted)="onTableDeleted()">
</blg-table-toolbar>
```

## Services

### TableStateService

Manages table data and UI state using Angular Signals.

```typescript
import { inject } from '@angular/core';
import { TableStateService } from '@ng-ui/editor-tables';

export class MyComponent {
  private tableState = inject(TableStateService);

  // Access reactive state
  tableData = this.tableState.tableData;
  hasTable = this.tableState.hasTable;
  isEditing = this.tableState.isEditing;

  createTable() {
    this.tableState.createTable({
      rows: 4,
      columns: 3,
      hasHeader: true
    });
  }
}
```

### TableSelectionService

Handles cell selection and keyboard navigation.

```typescript
import { TableSelectionService } from '@ng-ui/editor-tables';

export class MyComponent {
  private selection = inject(TableSelectionService);

  // Access selection state
  selectedCells = this.selection.selectedCells;
  activeCell = this.selection.activeCell;
  hasSelection = this.selection.hasSelection;

  selectCell(row: number, column: number) {
    this.selection.selectCell(row, column);
  }
}
```

### TableOperationsService

Provides table manipulation operations.

```typescript
import { TableOperationsService } from '@ng-ui/editor-tables';

export class MyComponent {
  private operations = inject(TableOperationsService);

  insertRow(tableData: any, index: number) {
    return this.operations.insertRow(tableData, index);
  }

  mergeCells(tableData: any, selection: any) {
    return this.operations.mergeCells(tableData, selection);
  }
}
```

### TableImportExportService

Handles data import/export functionality.

```typescript
import { TableImportExportService } from '@ng-ui/editor-tables';

export class MyComponent {
  private importExport = inject(TableImportExportService);

  async importCSV(file: File) {
    const csvData = await this.importExport.readFile(file);
    return this.importExport.importCSV(csvData);
  }

  exportCSV(tableData: any) {
    const csv = this.importExport.exportCSV(tableData);
    this.importExport.downloadFile(csv, 'table.csv', 'text/csv');
  }
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Arrow Keys` | Navigate between cells |
| `Shift + Arrow` | Extend selection |
| `Ctrl/Cmd + A` | Select all cells |
| `Ctrl/Cmd + C` | Copy selection |
| `Ctrl/Cmd + V` | Paste |
| `Ctrl/Cmd + X` | Cut |
| `Delete/Backspace` | Clear cell content |
| `Enter` | Start editing cell |
| `Escape` | Cancel editing/Clear selection |
| `Home` | Go to first column |
| `End` | Go to last column |
| `Ctrl/Cmd + Home` | Go to top-left cell |
| `Ctrl/Cmd + End` | Go to bottom-right cell |

## Advanced Usage

### Custom Table Templates

```typescript
const templateConfig = {
  rows: 5,
  columns: 4,
  hasHeader: true,
  borderStyle: 'solid',
  responsive: true,
  defaultCellWidth: '150px'
};

this.tableState.createTable(templateConfig);
```

### Cell Formatting

```typescript
// Format a specific cell
this.tableState.updateCell(row, column, {
  backgroundColor: '#f0f9ff',
  textColor: '#1e40af',
  alignment: 'center',
  isHeader: true
});
```

### Import/Export Options

```typescript
// CSV Import with options
const tableData = this.importExport.importCSV(csvString, {
  delimiter: ';',
  hasHeader: true,
  trimWhitespace: true,
  skipEmptyRows: true
});

// CSV Export with options
const csvData = this.importExport.exportCSV(tableData, {
  delimiter: ',',
  includeHeaders: true,
  quoteAll: false
});
```

### Custom Styling

```scss
// Override default table styles
.table-editor {
  --table-border-color: #e5e7eb;
  --table-header-bg: #f9fafb;
  --table-selected-bg: #dbeafe;
  --table-active-bg: #3b82f6;
}

// Custom cell styling
.my-custom-cell {
  background: linear-gradient(45deg, #f0f9ff, #e0f2fe);
  font-weight: 600;
  text-align: center;
}
```

## Accessibility

The table editor is built with accessibility in mind:

- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: Supports high contrast mode
- **Reduced Motion**: Respects user's motion preferences

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.0
- Initial release with full table editing functionality
- Visual table picker and creation dialog
- Advanced cell selection system
- Row/column manipulation operations
- Import/export capabilities (CSV, JSON, Excel)
- Rich formatting options
- Contextual toolbar
- Undo/redo system
- Keyboard navigation and shortcuts
- Responsive design and accessibility support