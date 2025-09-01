# Complete ag-Grid to BLG Grid API Mapping

## 📚 Target Audience: Library Users

This document provides a comprehensive mapping of ag-Grid APIs to their BLG Grid equivalents. Use this as a reference during migration to find the exact BLG Grid equivalent for every ag-Grid feature you're currently using.

## 📋 Table of Contents

1. [Column Definition Mapping](#column-definition-mapping)
2. [Grid Configuration Mapping](#grid-configuration-mapping)
3. [Grid API Methods](#grid-api-methods)
4. [Column API Methods](#column-api-methods)
5. [Event Mapping](#event-mapping)
6. [CSS Classes Mapping](#css-classes-mapping)
7. [Theme Variables](#theme-variables)
8. [Filter Types](#filter-types)
9. [Cell Renderer/Editor Mapping](#cell-renderereditor-mapping)
10. [Callback Functions](#callback-functions)

## 📊 Column Definition Mapping

### Basic Properties

| ag-Grid ColDef | BLG Grid ColumnDefinition | Type | Notes |
|----------------|---------------------------|------|-------|
| `field` | `field` | `string` | ✅ Identical |
| `colId` | `columnId` | `string` | Different property name |
| `headerName` | `headerName` | `string` | ✅ Identical |
| `headerTooltip` | `headerTooltip` | `string` | ✅ Identical |
| `width` | `width` | `number` | ✅ Identical |
| `minWidth` | `minWidth` | `number` | ✅ Identical |
| `maxWidth` | `maxWidth` | `number` | ✅ Identical |
| `flex` | `flex` | `number` | ✅ Identical |
| `hide` | `hidden` | `boolean` | Different property name |
| `pinned` | `pinned` | `'left' \| 'right' \| null` | ✅ Identical |
| `lockPosition` | `lockPosition` | `boolean` | ✅ Identical |
| `lockVisible` | `lockVisible` | `boolean` | ✅ Identical |
| `lockPinned` | `lockPinned` | `boolean` | ✅ Identical |

### Sorting Properties

| ag-Grid ColDef | BLG Grid ColumnDefinition | Type | Notes |
|----------------|---------------------------|------|-------|
| `sortable` | `sortable` | `boolean` | ✅ Identical |
| `sort` | `initialSort` | `'asc' \| 'desc'` | Different property name |
| `sortIndex` | `sortIndex` | `number` | ✅ Identical |
| `sortingOrder` | `sortingOrder` | `Array<'asc' \| 'desc'>` | ✅ Identical |
| `comparator` | `compareFn` | `CompareFn` | Different property name |
| `unSortIcon` | `showUnsortIcon` | `boolean` | Different property name |

### Filtering Properties

| ag-Grid ColDef | BLG Grid ColumnDefinition | Type | Notes |
|----------------|---------------------------|------|-------|
| `filter` | `filterable` | `boolean \| string` | Different approach |
| `filterParams` | `filterOptions` | `object` | Different property name |
| `filterValueGetter` | `filterValueGetter` | `function` | ✅ Identical |
| `floatingFilter` | `showFloatingFilter` | `boolean` | Different property name |
| `suppressMenu` | `suppressMenu` | `boolean` | ✅ Identical |
| `menuTabs` | `menuTabs` | `Array<string>` | ✅ Identical |

**BLG Grid Filter Types:**
```typescript
// ag-Grid approach
{ field: 'name', filter: 'agTextColumnFilter' }
{ field: 'age', filter: 'agNumberColumnFilter' }
{ field: 'date', filter: 'agDateColumnFilter' }

// BLG Grid approach  
{ field: 'name', filterable: true, filterType: 'text' }
{ field: 'age', filterable: true, filterType: 'number' }
{ field: 'date', filterable: true, filterType: 'date' }
```

### Cell Rendering Properties

| ag-Grid ColDef | BLG Grid ColumnDefinition | Type | Notes |
|----------------|---------------------------|------|-------|
| `cellRenderer` | `cellRenderer` | `Component \| string` | ✅ Similar approach |
| `cellRendererParams` | `cellRendererParams` | `object` | ✅ Identical |
| `cellStyle` | `cellStyle` | `object \| function` | ✅ Identical |
| `cellClass` | `cellClass` | `string \| function` | ✅ Identical |
| `cellClassRules` | `cellClassRules` | `object` | ✅ Identical |
| `valueFormatter` | `valueFormatter` | `function` | ✅ Identical |
| `valueGetter` | `valueGetter` | `function \| string` | ✅ Identical |
| `valueSetter` | `valueSetter` | `function` | ✅ Identical |
| `valueParser` | `valueParser` | `function` | ✅ Identical |

### Cell Editing Properties

| ag-Grid ColDef | BLG Grid ColumnDefinition | Type | Notes |
|----------------|---------------------------|------|-------|
| `editable` | `editable` | `boolean \| function` | ✅ Identical |
| `cellEditor` | `cellEditor` | `Component \| string` | ✅ Similar approach |
| `cellEditorParams` | `cellEditorParams` | `object` | ✅ Identical |
| `singleClickEdit` | `singleClickEdit` | `boolean` | ✅ Identical |
| `suppressKeyboardEvent` | `suppressKeyboardEvent` | `function` | ✅ Identical |
| `suppressNavigable` | `suppressNavigable` | `boolean` | ✅ Identical |

### Header Properties

| ag-Grid ColDef | BLG Grid ColumnDefinition | Type | Notes |
|----------------|---------------------------|------|-------|
| `headerClass` | `headerClass` | `string \| function` | ✅ Identical |
| `headerComponent` | `headerComponent` | `Component` | ✅ Identical |
| `headerComponentParams` | `headerComponentParams` | `object` | ✅ Identical |
| `headerHeight` | `headerHeight` | `number` | ✅ Identical |
| `headerCheckboxSelection` | `headerCheckboxSelection` | `boolean \| function` | ✅ Identical |

### Row Properties

| ag-Grid ColDef | BLG Grid ColumnDefinition | Type | Notes |
|----------------|---------------------------|------|-------|
| `rowSpan` | `rowSpan` | `number \| function` | ✅ Identical |
| `colSpan` | `colSpan` | `number \| function` | ✅ Identical |
| `rowDrag` | `rowDrag` | `boolean \| function` | ✅ Identical |
| `checkboxSelection` | `checkboxSelection` | `boolean \| function` | ✅ Identical |
| `showRowGroup` | `showRowGroup` | `boolean \| string` | ✅ Identical |

## ⚙️ Grid Configuration Mapping

### Basic Configuration

| ag-Grid GridOptions | BLG Grid GridConfig | Type | Notes |
|---------------------|---------------------|------|-------|
| `columnDefs` | `columns` | `ColumnDefinition[]` | Different property name |
| `rowData` | `data` | `any[]` | Different property name |
| `defaultColDef` | `defaultColumnOptions` | `ColumnDefinition` | Different property name |
| `enableSorting` | `enableSorting` | `boolean` | ✅ Identical |
| `enableFilter` | `enableFiltering` | `boolean` | Different property name |
| `enableColResize` | `enableColumnResize` | `boolean` | Different property name |
| `suppressMovableColumns` | `suppressColumnMove` | `boolean` | Different property name |
| `suppressMenuHide` | `suppressMenuHide` | `boolean` | ✅ Identical |

### Row Configuration

| ag-Grid GridOptions | BLG Grid GridConfig | Type | Notes |
|---------------------|---------------------|------|-------|
| `rowSelection` | `rowSelection` | `'single' \| 'multiple'` | ✅ Identical |
| `rowMultiSelectWithClick` | `multiSelectWithClick` | `boolean` | Different property name |
| `suppressRowClickSelection` | `clickToSelect` | `boolean` | Inverted logic |
| `rowHeight` | `rowHeight` | `number` | ✅ Identical |
| `getRowHeight` | `getRowHeight` | `function` | ✅ Identical |
| `rowClass` | `rowClass` | `string \| function` | ✅ Identical |
| `getRowClass` | `getRowClass` | `function` | ✅ Identical |
| `rowStyle` | `rowStyle` | `object \| function` | ✅ Identical |
| `getRowStyle` | `getRowStyle` | `function` | ✅ Identical |

### Pagination

| ag-Grid GridOptions | BLG Grid GridConfig | Type | Notes |
|---------------------|---------------------|------|-------|
| `pagination` | `pagination` | `boolean` | ✅ Identical |
| `paginationPageSize` | `paginationPageSize` | `number` | ✅ Identical |
| `paginationAutoPageSize` | `paginationAutoPageSize` | `boolean` | ✅ Identical |
| `suppressPaginationPanel` | `suppressPaginationPanel` | `boolean` | ✅ Identical |
| `paginationNumberFormatter` | `paginationNumberFormatter` | `function` | ✅ Identical |

### Virtual Scrolling

| ag-Grid GridOptions | BLG Grid GridConfig | Type | Notes |
|---------------------|---------------------|------|-------|
| `rowBuffer` | `bufferSize` | `number` | Different property name |
| `infiniteInitialRowCount` | `initialRowCount` | `number` | Different property name |
| `cacheBlockSize` | `blockSize` | `number` | Different property name |
| `maxBlocksInCache` | `maxBlocksInCache` | `number` | ✅ Identical |
| `suppressRowVirtualisation` | `disableVirtualScrolling` | `boolean` | Different property name |

### Editing

| ag-Grid GridOptions | BLG Grid GridConfig | Type | Notes |
|---------------------|---------------------|------|-------|
| `editType` | `editMode` | `'cell' \| 'row'` | Different property name |
| `singleClickEdit` | `singleClickEdit` | `boolean` | ✅ Identical |
| `suppressClickEdit` | `suppressClickEdit` | `boolean` | ✅ Identical |
| `enterMovesDown` | `enterMovesDown` | `boolean` | ✅ Identical |
| `enterMovesDownAfterEdit` | `enterMovesDownAfterEdit` | `boolean` | ✅ Identical |
| `tabToNextCell` | `tabToNextCell` | `boolean` | ✅ Identical |
| `tabToNextHeader` | `tabToNextHeader` | `boolean` | ✅ Identical |

## 🔧 Grid API Methods

### Data Methods

| ag-Grid API | BLG Grid API | Parameters | Notes |
|-------------|--------------|------------|-------|
| `setRowData(data)` | `setData(data)` | `any[]` | Different method name |
| `updateRowData(transaction)` | `updateData(transaction)` | `UpdateTransaction` | Different method name |
| `getRowData()` | `getData()` | - | Different method name |
| `forEachNode(callback)` | `forEachRow(callback)` | `function` | Different method name |
| `getRowNode(id)` | `getRowById(id)` | `string \| number` | Different method name |
| `refreshCells(params?)` | `refreshCells(params?)` | `RefreshCellsParams` | ✅ Identical |
| `refreshView()` | `refresh()` | - | Different method name |
| `redrawRows(params?)` | `redrawRows(params?)` | `RedrawRowsParams` | ✅ Identical |

### Selection Methods

| ag-Grid API | BLG Grid API | Parameters | Notes |
|-------------|--------------|------------|-------|
| `getSelectedNodes()` | `getSelectedRows()` | - | Different method name |
| `getSelectedRows()` | `getSelectedRowData()` | - | Different method name |
| `selectAll()` | `selectAll()` | - | ✅ Identical |
| `deselectAll()` | `deselectAll()` | - | ✅ Identical |
| `selectAllFiltered()` | `selectAllVisible()` | - | Different method name |
| `deselectAllFiltered()` | `deselectAllVisible()` | - | Different method name |
| `getDisplayedRowCount()` | `getVisibleRowCount()` | - | Different method name |

### Sorting Methods

| ag-Grid API | BLG Grid API | Parameters | Notes |
|-------------|--------------|------------|-------|
| `getSortModel()` | `getSortModel()` | - | ✅ Identical |
| `setSortModel(model)` | `setSortModel(model)` | `SortModel[]` | ✅ Identical |
| `refreshAfterSort()` | `applySorting()` | - | Different method name |

### Filtering Methods

| ag-Grid API | BLG Grid API | Parameters | Notes |
|-------------|--------------|------------|-------|
| `getFilterModel()` | `getFilterModel()` | - | ✅ Identical |
| `setFilterModel(model)` | `setFilterModel(model)` | `FilterModel` | ✅ Identical |
| `isColumnFilterPresent()` | `hasColumnFilter(field)` | `string` | Different method name |
| `isQuickFilterPresent()` | `hasQuickFilter()` | - | Different method name |
| `getQuickFilter()` | `getQuickFilterValue()` | - | Different method name |
| `setQuickFilter(value)` | `setQuickFilterValue(value)` | `string` | Different method name |
| `refreshAfterFilter()` | `applyFiltering()` | - | Different method name |

### Column Methods

| ag-Grid API | BLG Grid API | Parameters | Notes |
|-------------|--------------|------------|-------|
| `getColumns()` | `getColumns()` | - | ✅ Identical |
| `getDisplayedColAfter(col)` | `getNextVisibleColumn(col)` | `Column` | Different method name |
| `getDisplayedColBefore(col)` | `getPreviousVisibleColumn(col)` | `Column` | Different method name |
| `moveColumn(key, toIndex)` | `moveColumn(key, toIndex)` | `string, number` | ✅ Identical |
| `moveColumns(keys, toIndex)` | `moveColumns(keys, toIndex)` | `string[], number` | ✅ Identical |
| `getAllGridColumns()` | `getAllColumns()` | - | Different method name |
| `getDisplayedCenterColumns()` | `getVisibleColumns()` | - | Different method name |
| `getDisplayedLeftColumns()` | `getPinnedLeftColumns()` | - | Different method name |
| `getDisplayedRightColumns()` | `getPinnedRightColumns()` | - | Different method name |

### Export Methods

| ag-Grid API | BLG Grid API | Parameters | Notes |
|-------------|--------------|------------|-------|
| `exportDataAsCsv(params?)` | `exportToCsv(params?)` | `CsvExportParams` | Different method name |
| `getDataAsCsv(params?)` | `getCsvData(params?)` | `CsvExportParams` | Different method name |
| `exportDataAsExcel(params?)` | `exportToExcel(params?)` | `ExcelExportParams` | Different method name |
| `getDataAsExcel(params?)` | `getExcelData(params?)` | `ExcelExportParams` | Different method name |

## 📅 Event Mapping

### Grid Events

| ag-Grid Event | BLG Grid Event | Event Data Type | Notes |
|---------------|----------------|-----------------|-------|
| `gridReady` | `gridReady` | `GridReadyEvent` | ✅ Identical |
| `firstDataRendered` | `firstDataRendered` | `FirstDataRenderedEvent` | ✅ Identical |
| `gridSizeChanged` | `gridSizeChanged` | `GridSizeChangedEvent` | ✅ Identical |
| `modelUpdated` | `dataUpdated` | `DataUpdatedEvent` | Different event name |
| `virtualRowRemoved` | `virtualRowRemoved` | `VirtualRowRemovedEvent` | ✅ Identical |
| `viewportChanged` | `viewportChanged` | `ViewportChangedEvent` | ✅ Identical |

### Row Events

| ag-Grid Event | BLG Grid Event | Event Data Type | Notes |
|---------------|----------------|-----------------|-------|
| `rowClicked` | `rowClicked` | `RowClickedEvent` | ✅ Identical |
| `rowDoubleClicked` | `rowDoubleClicked` | `RowDoubleClickedEvent` | ✅ Identical |
| `rowSelected` | `rowSelected` | `RowSelectedEvent` | ✅ Identical |
| `selectionChanged` | `selectionChanged` | `SelectionChangedEvent` | ✅ Identical |
| `rowDataChanged` | `rowDataChanged` | `RowDataChangedEvent` | ✅ Identical |
| `rowDataUpdated` | `rowDataUpdated` | `RowDataUpdatedEvent` | ✅ Identical |
| `rowDragEnter` | `rowDragEnter` | `RowDragEvent` | ✅ Identical |
| `rowDragMove` | `rowDragMove` | `RowDragEvent` | ✅ Identical |
| `rowDragLeave` | `rowDragLeave` | `RowDragEvent` | ✅ Identical |
| `rowDragEnd` | `rowDragEnd` | `RowDragEvent` | ✅ Identical |

### Cell Events

| ag-Grid Event | BLG Grid Event | Event Data Type | Notes |
|---------------|----------------|-----------------|-------|
| `cellClicked` | `cellClicked` | `CellClickedEvent` | ✅ Identical |
| `cellDoubleClicked` | `cellDoubleClicked` | `CellDoubleClickedEvent` | ✅ Identical |
| `cellMouseOver` | `cellMouseEnter` | `CellMouseEvent` | Different event name |
| `cellMouseOut` | `cellMouseLeave` | `CellMouseEvent` | Different event name |
| `cellEditingStarted` | `cellEditStart` | `CellEditEvent` | Different event name |
| `cellEditingStopped` | `cellEditEnd` | `CellEditEvent` | Different event name |
| `cellValueChanged` | `cellValueChanged` | `CellValueChangedEvent` | ✅ Identical |
| `cellFocused` | `cellFocused` | `CellFocusedEvent` | ✅ Identical |
| `cellKeyDown` | `cellKeyDown` | `CellKeyboardEvent` | ✅ Identical |
| `cellKeyPress` | `cellKeyPress` | `CellKeyboardEvent` | ✅ Identical |

### Column Events

| ag-Grid Event | BLG Grid Event | Event Data Type | Notes |
|---------------|----------------|-----------------|-------|
| `columnMoved` | `columnMoved` | `ColumnMovedEvent` | ✅ Identical |
| `columnResized` | `columnResized` | `ColumnResizedEvent` | ✅ Identical |
| `columnPinned` | `columnPinned` | `ColumnPinnedEvent` | ✅ Identical |
| `columnVisible` | `columnVisibilityChanged` | `ColumnVisibilityEvent` | Different event name |
| `sortChanged` | `sortChanged` | `SortChangedEvent` | ✅ Identical |
| `filterChanged` | `filterChanged` | `FilterChangedEvent` | ✅ Identical |
| `columnRowGroupChanged` | `columnGroupChanged` | `ColumnGroupChangedEvent` | Different event name |

## 🎨 CSS Classes Mapping

### Grid Container Classes

| ag-Grid Class | BLG Grid Class | Purpose |
|---------------|----------------|---------|
| `.ag-theme-alpine` | `.blg-theme-default` | Default theme |
| `.ag-theme-balham` | `.blg-theme-modern` | Modern theme |
| `.ag-theme-material` | `.blg-theme-material` | Material design theme |
| `.ag-theme-blue` | `.blg-theme-blue` | Blue accent theme |
| `.ag-theme-dark` | `.blg-theme-dark` | Dark theme |
| `.ag-theme-fresh` | `.blg-theme-light` | Light theme |

### Grid Structure Classes

| ag-Grid Class | BLG Grid Class | Purpose |
|---------------|----------------|---------|
| `.ag-root-wrapper` | `.blg-grid-wrapper` | Root container |
| `.ag-root` | `.blg-grid-root` | Grid root element |
| `.ag-header` | `.blg-header` | Header container |
| `.ag-body` | `.blg-body` | Body container |
| `.ag-body-clipper` | `.blg-body-clipper` | Body clip container |
| `.ag-body-scroller` | `.blg-body-scroller` | Scrollable body |
| `.ag-center-cols-container` | `.blg-center-container` | Center columns container |

### Row Classes

| ag-Grid Class | BLG Grid Class | Purpose |
|---------------|----------------|---------|
| `.ag-row` | `.blg-row` | Row element |
| `.ag-row-odd` | `.blg-row-odd` | Odd row styling |
| `.ag-row-even` | `.blg-row-even` | Even row styling |
| `.ag-row-selected` | `.blg-row-selected` | Selected row |
| `.ag-row-hover` | `.blg-row-hover` | Hovered row |
| `.ag-row-focus` | `.blg-row-focus` | Focused row |
| `.ag-row-editing` | `.blg-row-editing` | Row in edit mode |
| `.ag-row-dragging` | `.blg-row-dragging` | Row being dragged |
| `.ag-row-first` | `.blg-row-first` | First row |
| `.ag-row-last` | `.blg-row-last` | Last row |

### Cell Classes

| ag-Grid Class | BLG Grid Class | Purpose |
|---------------|----------------|---------|
| `.ag-cell` | `.blg-cell` | Cell element |
| `.ag-cell-value` | `.blg-cell-value` | Cell value container |
| `.ag-cell-edit` | `.blg-cell-edit` | Cell in edit mode |
| `.ag-cell-focus` | `.blg-cell-focus` | Focused cell |
| `.ag-cell-range-selected` | `.blg-cell-range-selected` | Cell in range selection |
| `.ag-cell-range-chart` | `.blg-cell-chart-range` | Cell in chart range |
| `.ag-cell-inline-editing` | `.blg-cell-inline-editing` | Inline editing cell |
| `.ag-cell-popup-editing` | `.blg-cell-popup-editing` | Popup editing cell |

### Header Classes

| ag-Grid Class | BLG Grid Class | Purpose |
|---------------|----------------|---------|
| `.ag-header-cell` | `.blg-header-cell` | Header cell |
| `.ag-header-cell-label` | `.blg-header-cell-label` | Header label |
| `.ag-header-cell-text` | `.blg-header-cell-text` | Header text |
| `.ag-header-cell-menu-button` | `.blg-header-menu-button` | Menu button |
| `.ag-header-cell-resize` | `.blg-header-resize-handle` | Resize handle |
| `.ag-header-cell-sortable` | `.blg-header-sortable` | Sortable header |
| `.ag-header-cell-moving` | `.blg-header-moving` | Moving header |
| `.ag-sort-ascending-icon` | `.blg-sort-asc-icon` | Ascending sort icon |
| `.ag-sort-descending-icon` | `.blg-sort-desc-icon` | Descending sort icon |

### Filter Classes

| ag-Grid Class | BLG Grid Class | Purpose |
|---------------|----------------|---------|
| `.ag-filter-panel` | `.blg-filter-panel` | Filter panel |
| `.ag-filter-list` | `.blg-filter-list` | Filter list |
| `.ag-filter-input` | `.blg-filter-input` | Filter input |
| `.ag-filter-apply-button` | `.blg-filter-apply` | Apply filter button |
| `.ag-filter-clear-button` | `.blg-filter-clear` | Clear filter button |
| `.ag-floating-filter` | `.blg-floating-filter` | Floating filter |
| `.ag-floating-filter-input` | `.blg-floating-filter-input` | Floating filter input |

### Pagination Classes

| ag-Grid Class | BLG Grid Class | Purpose |
|---------------|----------------|---------|
| `.ag-paging-panel` | `.blg-pagination-panel` | Pagination panel |
| `.ag-paging-page-summary-panel` | `.blg-pagination-summary` | Page summary |
| `.ag-paging-button` | `.blg-pagination-button` | Pagination button |
| `.ag-paging-description` | `.blg-pagination-description` | Page description |

## 🎨 Theme Variables

### Color Variables

| ag-Grid Variable | BLG Grid Variable | Default Value | Purpose |
|------------------|-------------------|---------------|---------|
| `--ag-foreground-color` | `--blg-text-color` | `#000` | Primary text color |
| `--ag-background-color` | `--blg-background-color` | `#fff` | Primary background |
| `--ag-header-foreground-color` | `--blg-header-text-color` | `#000` | Header text |
| `--ag-header-background-color` | `--blg-header-background` | `#f8f9fa` | Header background |
| `--ag-odd-row-background-color` | `--blg-row-odd-background` | `#fcfcfc` | Odd row background |
| `--ag-even-row-background-color` | `--blg-row-even-background` | `#fff` | Even row background |
| `--ag-row-hover-color` | `--blg-row-hover-background` | `#e3f2fd` | Row hover color |
| `--ag-selected-row-background-color` | `--blg-row-selected-background` | `#cce7ff` | Selected row |
| `--ag-border-color` | `--blg-border-color` | `#d4d4d8` | Border color |
| `--ag-cell-horizontal-border` | `--blg-cell-border-horizontal` | `#d4d4d8` | Horizontal borders |
| `--ag-cell-vertical-border` | `--blg-cell-border-vertical` | `#d4d4d8` | Vertical borders |

### Sizing Variables

| ag-Grid Variable | BLG Grid Variable | Default Value | Purpose |
|------------------|-------------------|---------------|---------|
| `--ag-grid-size` | `--blg-grid-size` | `4px` | Base grid unit |
| `--ag-icon-size` | `--blg-icon-size` | `12px` | Icon size |
| `--ag-row-height` | `--blg-row-height` | `28px` | Default row height |
| `--ag-header-height` | `--blg-header-height` | `32px` | Header height |
| `--ag-list-item-height` | `--blg-list-item-height` | `20px` | List item height |

### Font Variables

| ag-Grid Variable | BLG Grid Variable | Default Value | Purpose |
|------------------|-------------------|---------------|---------|
| `--ag-font-family` | `--blg-font-family` | `-apple-system, BlinkMacSystemFont, "Segoe UI"` | Font family |
| `--ag-font-size` | `--blg-font-size` | `12px` | Base font size |
| `--ag-font-weight` | `--blg-font-weight` | `400` | Font weight |
| `--ag-header-font-size` | `--blg-header-font-size` | `12px` | Header font size |
| `--ag-header-font-weight` | `--blg-header-font-weight` | `600` | Header font weight |

## 🔍 Filter Types

### Built-in Filters

| ag-Grid Filter | BLG Grid Filter | Configuration |
|----------------|-----------------|---------------|
| `agTextColumnFilter` | `text` | `filterType: 'text'` |
| `agNumberColumnFilter` | `number` | `filterType: 'number'` |
| `agDateColumnFilter` | `date` | `filterType: 'date'` |
| `agSetColumnFilter` | `set` | `filterType: 'set'` |
| `agMultiColumnFilter` | `multi` | `filterType: 'multi'` |

### Filter Configuration

**ag-Grid:**
```typescript
columnDefs: ColDef[] = [
  {
    field: 'name',
    filter: 'agTextColumnFilter',
    filterParams: {
      buttons: ['reset', 'apply'],
      debounceMs: 200,
      caseSensitive: false
    }
  }
];
```

**BLG Grid:**
```typescript
columns: ColumnDefinition[] = [
  {
    field: 'name',
    filterable: true,
    filterType: 'text',
    filterOptions: {
      showApplyButton: true,
      showResetButton: true,
      debounceMs: 200,
      caseSensitive: false
    }
  }
];
```

## 🧩 Cell Renderer/Editor Mapping

### Built-in Cell Renderers

| ag-Grid Renderer | BLG Grid Renderer | Import |
|------------------|-------------------|---------|
| `agGroupCellRenderer` | `GroupCellRenderer` | `@ng-ui-lib/cell` |
| `agCheckboxCellRenderer` | `CheckboxCellRenderer` | `@ng-ui-lib/cell` |
| `agLoadingCellRenderer` | `LoadingCellRenderer` | `@ng-ui-lib/cell` |
| `agAnimateShowChangeCellRenderer` | `AnimatedCellRenderer` | `@ng-ui-lib/cell` |
| `agAnimateSlideCellRenderer` | `SlideCellRenderer` | `@ng-ui-lib/cell` |

### Built-in Cell Editors

| ag-Grid Editor | BLG Grid Editor | Import |
|----------------|-----------------|---------|
| `agTextCellEditor` | `TextCellEditor` | `@ng-ui-lib/cell` |
| `agPopupTextCellEditor` | `PopupTextCellEditor` | `@ng-ui-lib/cell` |
| `agSelectCellEditor` | `SelectCellEditor` | `@ng-ui-lib/cell` |
| `agPopupSelectCellEditor` | `PopupSelectCellEditor` | `@ng-ui-lib/cell` |
| `agLargeTextCellEditor` | `LargeTextCellEditor` | `@ng-ui-lib/cell` |
| `agDateCellEditor` | `DateCellEditor` | `@ng-ui-lib/cell` |
| `agDateStringCellEditor` | `DateStringCellEditor` | `@ng-ui-lib/cell` |
| `agCheckboxCellEditor` | `CheckboxCellEditor` | `@ng-ui-lib/cell` |

### Custom Component Registration

**ag-Grid:**
```typescript
gridOptions: GridOptions = {
  frameworkComponents: {
    customRenderer: CustomRendererComponent,
    customEditor: CustomEditorComponent
  }
};

columnDefs: ColDef[] = [
  {
    field: 'custom',
    cellRenderer: 'customRenderer',
    cellEditor: 'customEditor'
  }
];
```

**BLG Grid:**
```typescript
// No global registration needed
columns: ColumnDefinition[] = [
  {
    field: 'custom',
    cellRenderer: CustomRendererComponent,
    cellEditor: CustomEditorComponent
  }
];
```

## 📞 Callback Functions

### Value Callbacks

| ag-Grid Callback | BLG Grid Callback | Purpose |
|------------------|-------------------|---------|
| `valueGetter` | `valueGetter` | Get cell value |
| `valueSetter` | `valueSetter` | Set cell value |
| `valueFormatter` | `valueFormatter` | Format display value |
| `valueParser` | `valueParser` | Parse edited value |
| `filterValueGetter` | `filterValueGetter` | Get value for filtering |
| `keyCreator` | `keyCreator` | Create unique keys |

### Style Callbacks

| ag-Grid Callback | BLG Grid Callback | Purpose |
|------------------|-------------------|---------|
| `cellStyle` | `cellStyle` | Dynamic cell styling |
| `cellClass` | `cellClass` | Dynamic cell CSS classes |
| `cellClassRules` | `cellClassRules` | Conditional CSS classes |
| `headerClass` | `headerClass` | Dynamic header classes |
| `rowStyle` | `rowStyle` | Dynamic row styling |
| `rowClass` | `rowClass` | Dynamic row CSS classes |
| `getRowStyle` | `getRowStyle` | Row styling function |
| `getRowClass` | `getRowClass` | Row class function |

### Validation Callbacks

| ag-Grid Callback | BLG Grid Callback | Purpose |
|------------------|-------------------|---------|
| `editable` | `editable` | Determine if cell is editable |
| `suppressKeyboardEvent` | `suppressKeyboardEvent` | Suppress keyboard events |
| `suppressNavigable` | `suppressNavigable` | Suppress navigation |
| `suppressPaste` | `suppressPaste` | Suppress paste operation |
| `processCellForClipboard` | `processCellForClipboard` | Process cell for clipboard |
| `processCellFromClipboard` | `processCellFromClipboard` | Process cell from clipboard |

## 🔄 Migration Helper Utilities

### Quick Property Mapper

```typescript
/**
 * Utility to help map ag-Grid column definitions to BLG Grid
 */
export function mapAgGridColumnToBLG(agCol: any): ColumnDefinition {
  return {
    field: agCol.field,
    headerName: agCol.headerName,
    width: agCol.width,
    minWidth: agCol.minWidth,
    maxWidth: agCol.maxWidth,
    flex: agCol.flex,
    hidden: agCol.hide, // Different property name
    pinned: agCol.pinned,
    sortable: agCol.sortable,
    filterable: !!agCol.filter, // Convert to boolean
    filterType: mapFilterType(agCol.filter),
    resizable: agCol.resizable,
    editable: agCol.editable,
    cellRenderer: agCol.cellRenderer,
    cellEditor: agCol.cellEditor,
    valueFormatter: agCol.valueFormatter,
    valueGetter: agCol.valueGetter,
    valueSetter: agCol.valueSetter,
    cellStyle: agCol.cellStyle,
    cellClass: agCol.cellClass,
    cellClassRules: agCol.cellClassRules
  };
}

function mapFilterType(agFilter: string | boolean): string {
  if (typeof agFilter === 'boolean') return 'text';
  
  const filterMap: { [key: string]: string } = {
    'agTextColumnFilter': 'text',
    'agNumberColumnFilter': 'number',
    'agDateColumnFilter': 'date',
    'agSetColumnFilter': 'set'
  };
  
  return filterMap[agFilter] || 'text';
}
```

### Event Handler Mapper

```typescript
/**
 * Map ag-Grid events to BLG Grid events
 */
export const eventMapper = {
  // Grid events
  onGridReady: 'gridReady',
  onFirstDataRendered: 'firstDataRendered',
  onModelUpdated: 'dataUpdated',
  
  // Row events  
  onRowClicked: 'rowClicked',
  onRowDoubleClicked: 'rowDoubleClicked',
  onSelectionChanged: 'selectionChanged',
  
  // Cell events
  onCellClicked: 'cellClicked',
  onCellDoubleClicked: 'cellDoubleClicked',
  onCellEditingStarted: 'cellEditStart',
  onCellEditingStopped: 'cellEditEnd',
  onCellValueChanged: 'cellValueChanged',
  
  // Column events
  onColumnMoved: 'columnMoved',
  onColumnResized: 'columnResized',
  onSortChanged: 'sortChanged',
  onFilterChanged: 'filterChanged'
};
```

## 📚 Quick Reference Summary

### Most Common Mappings

```typescript
// Property name changes
columnDefs → columns
rowData → data
hide → hidden
filter → filterable
enableFilter → enableFiltering
enableColResize → enableColumnResize

// Method name changes
setRowData() → setData()
getRowData() → getData()
getSelectedRows() → getSelectedRowData()
exportDataAsCsv() → exportToCsv()

// Event name changes
onModelUpdated → onDataUpdated
onCellEditingStarted → onCellEditStart
onCellEditingStopped → onCellEditEnd

// CSS class changes
ag-theme-alpine → blg-theme-default
ag-cell → blg-cell
ag-row → blg-row
ag-header-cell → blg-header-cell
```

This mapping document should cover 95% of your ag-Grid to BLG Grid migration needs. For edge cases or enterprise features not covered here, refer to the [full migration guide](./from-ag-grid.md) or [migration cookbook](./ag-grid-cookbook.md).