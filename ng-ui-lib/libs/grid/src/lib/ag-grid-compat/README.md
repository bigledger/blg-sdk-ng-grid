# ag-Grid Compatibility Layer for NgUiGrid

A comprehensive compatibility layer that allows existing ag-Grid applications to migrate to NgUiGrid with minimal code changes.

## Overview

This compatibility layer provides:
- **Full ag-Grid interface compatibility** - Use existing GridOptions and column definitions
- **Event system mapping** - ag-Grid events are converted to NgUiGrid events
- **API compatibility** - Most ag-Grid API methods are supported
- **Migration utilities** - Tools to validate and assist with migration
- **Backwards compatibility component** - Drop-in replacement for ag-Grid

## Quick Start

### 1. Basic Usage

Replace your ag-Grid component with the compatibility component:

```typescript
// Before (ag-Grid)
import { Component } from '@angular/core';
import { GridOptions } from 'ag-grid-community';

@Component({
  template: '<ag-grid-angular [gridOptions]="gridOptions"></ag-grid-angular>'
})
export class MyComponent {
  gridOptions: GridOptions = {
    rowData: this.myData,
    columnDefs: this.myColumns,
    enableSorting: true,
    enableFilter: true,
    pagination: true
  };
}
```

```typescript
// After (NgUiGrid with compatibility)
import { Component } from '@angular/core';
import { AgGridOptions } from '@ng-ui-kit/grid/ag-grid-compat';

@Component({
  template: '<ng-ui-grid-compat [gridOptions]="gridOptions"></ng-ui-grid-compat>'
})
export class MyComponent {
  gridOptions: AgGridOptions = {
    rowData: this.myData,
    columnDefs: this.myColumns,
    enableSorting: true,
    enableFilter: true,
    pagination: true
  };
}
```

### 2. Using Factory Function

For programmatic grid creation:

```typescript
import { createAgGridCompatible } from '@ng-ui-kit/grid/ag-grid-compat';

const gridOptions: AgGridOptions = {
  rowData: myData,
  columnDefs: myColumns,
  enableSorting: true,
  onRowClicked: (event) => console.log('Row clicked:', event)
};

const gridInstance = createAgGridCompatible(gridOptions);

// Access ag-Grid compatible APIs
gridInstance.api.setRowData(newData);
gridInstance.columnApi.autoSizeAllColumns();
```

## Migration Tools

### Compatibility Validation

Check how compatible your ag-Grid configuration is:

```typescript
import { validateAgGridCompatibility } from '@ng-ui-kit/grid/ag-grid-compat';

const report = validateAgGridCompatibility(myGridOptions);

console.log(`Compatibility Score: ${report.compatibilityScore}%`);
console.log('Unsupported Features:', report.unsupportedFeatures);
console.log('Warnings:', report.warnings);
console.log('Migration Effort:', report.estimatedMigrationEffort);
```

### Migration Documentation

Generate comprehensive migration documentation:

```typescript
import { generateMigrationDoc } from '@ng-ui-kit/grid/ag-grid-compat';

const doc = generateMigrationDoc(myGridOptions);

// Get migration checklist
console.log('Tasks:', doc.migrationChecklist.items);
console.log('Estimated Time:', doc.migrationChecklist.estimatedTotalTime);

// Get code examples
doc.codeExamples.forEach(example => {
  console.log(`${example.title}:`);
  console.log('Before:', example.before);
  console.log('After:', example.after);
});
```

### Configuration Migration

Convert ag-Grid config to NgUiGrid format:

```typescript
import { migrateAgGridOptions } from '@ng-ui-kit/grid/ag-grid-compat';

const migration = migrateAgGridOptions(myAgGridOptions);

// Use converted configuration
const ngUiGridConfig = migration.gridConfig;
const ngUiColumnDefs = migration.columnDefs;

// Review warnings
migration.warnings.forEach(warning => console.warn(warning));
```

## Supported Features

### ✅ Fully Supported
- Basic grid configuration (sorting, filtering, pagination)
- Column definitions (width, visibility, pinning, type)
- Row selection (single/multiple)
- Cell editing (basic editors)
- Events (click, selection, value changes)
- Virtual scrolling
- Row grouping (basic)
- Data export (CSV)

### ⚠️ Partially Supported
- Custom cell renderers (need adaptation)
- Custom cell editors (need adaptation)
- Advanced filtering (basic filters only)
- Context menu (basic implementation)
- Clipboard operations (limited)

### ❌ Not Supported
- Server-side row model
- Tree data
- Master/detail grids
- Integrated charting
- Range selection
- Tool panels
- Status bar

## API Compatibility

Most common ag-Grid API methods are supported:

```typescript
// Grid API methods
gridInstance.api.setRowData(data);
gridInstance.api.getRowData();
gridInstance.api.selectAll();
gridInstance.api.deselectAll();
gridInstance.api.getSelectedRows();
gridInstance.api.exportDataAsCsv();
gridInstance.api.showLoadingOverlay();
gridInstance.api.refreshCells();

// Column API methods
gridInstance.columnApi.setColumnVisible('id', false);
gridInstance.columnApi.setColumnWidth('id', 200);
gridInstance.columnApi.autoSizeAllColumns();
gridInstance.columnApi.getColumnState();
gridInstance.columnApi.setColumnState(state);
```

## Event Compatibility

ag-Grid events are automatically converted:

```typescript
const gridOptions: AgGridOptions = {
  // Event handlers work the same way
  onGridReady: (params) => {
    console.log('Grid ready:', params.api);
  },
  onRowClicked: (event) => {
    console.log('Row clicked:', event.data);
  },
  onCellValueChanged: (event) => {
    console.log('Cell changed:', event.newValue);
  },
  onSelectionChanged: () => {
    const selected = params.api.getSelectedRows();
    console.log('Selection:', selected);
  }
};
```

## Column Definition Mapping

ag-Grid column definitions are automatically converted:

```typescript
// ag-Grid column definitions work as-is
const columnDefs = [
  {
    field: 'name',
    headerName: 'Name',
    width: 200,
    sortable: true,
    filter: true,
    editable: true,
    cellRenderer: 'agTextCellRenderer'  // Converted automatically
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'numericColumn',  // Converted to 'number'
    width: 100,
    cellEditor: 'agNumberCellEditor'  // Converted automatically
  }
];
```

## Theme Compatibility

ag-Grid themes are supported:

```html
<!-- Use ag-Grid theme classes -->
<ng-ui-grid-compat 
  class="ag-theme-alpine"
  [gridOptions]="gridOptions">
</ng-ui-grid-compat>

<!-- Or specify in gridOptions -->
<ng-ui-grid-compat 
  [gridOptions]="{ ...gridOptions, theme: 'ag-theme-alpine' }">
</ng-ui-grid-compat>
```

Supported themes:
- `ag-theme-alpine` / `ag-theme-alpine-dark`
- `ag-theme-balham` / `ag-theme-balham-dark`
- `ag-theme-material`
- `ag-theme-quartz` / `ag-theme-quartz-dark`

## Advanced Configuration

### Compatibility Mode Options

```typescript
<ng-ui-grid-compat 
  [gridOptions]="gridOptions"
  [enableCompatibilityMode]="true"
  [showCompatibilityWarnings]="true"
  [strictCompatibility]="false">
</ng-ui-grid-compat>
```

### Migration Debugging

```typescript
// Get detailed compatibility information
const component = this.gridCompatRef.nativeElement;
const config = component.exportConfiguration();

console.log('Original config:', config.originalAgGridOptions);
console.log('Migrated config:', config.migratedConfiguration);
console.log('Compatibility:', config.compatibilityReport);
console.log('Current state:', config.currentState);
```

## Migration Strategy

### Phase 1: Assessment
1. Run compatibility validation on your ag-Grid configuration
2. Review unsupported features and warnings
3. Plan workarounds for unsupported features

### Phase 2: Basic Migration
1. Replace ag-Grid component with compatibility component
2. Test basic functionality (display, sorting, filtering)
3. Fix any immediate issues

### Phase 3: Feature Migration
1. Adapt custom cell renderers and editors
2. Update event handlers if needed
3. Implement workarounds for unsupported features

### Phase 4: Optimization
1. Remove compatibility layer for better performance
2. Use native NgUiGrid features where possible
3. Optimize configuration for NgUiGrid

## Best Practices

1. **Start with validation**: Always run compatibility validation first
2. **Gradual migration**: Migrate one grid at a time
3. **Test thoroughly**: Test all functionality after migration
4. **Use migration tools**: Leverage the provided migration utilities
5. **Plan for unsupported features**: Have workarounds ready
6. **Monitor performance**: The compatibility layer has some overhead

## Troubleshooting

### Common Issues

**Data not displaying**
- Check that row data format matches column field definitions
- Verify column definitions are properly converted

**Events not firing**
- Ensure event handler names match ag-Grid format (onRowClicked, etc.)
- Check event adapter configuration

**Styling issues**
- Apply appropriate ag-Grid theme class
- Check CSS imports for theme files

**Performance issues**
- Consider removing compatibility layer after migration
- Use virtual scrolling for large datasets

### Getting Help

1. Check the compatibility report for warnings
2. Review migration documentation
3. Use the debugging tools to export configuration
4. Check the troubleshooting guide in migration docs

## Examples

See the `/examples` directory for complete migration examples:

- `basic-migration/` - Simple grid migration
- `advanced-features/` - Complex grid with custom components  
- `enterprise-features/` - Enterprise grid features
- `performance-optimization/` - Large dataset handling

## Limitations

- Custom components need manual adaptation
- Some enterprise features are not available
- Server-side operations require different approach
- Performance overhead from compatibility layer
- Some advanced customizations may not work exactly the same

## Contributing

When contributing to the compatibility layer:

1. Maintain ag-Grid interface compatibility
2. Add comprehensive tests for new features
3. Update documentation for any changes
4. Consider backwards compatibility impact
5. Follow the established patterns for adapters

## License

This compatibility layer is part of NgUiGrid and follows the same licensing terms.