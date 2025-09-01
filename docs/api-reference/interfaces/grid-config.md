# GridConfig Interface

Configuration interface for controlling grid behavior and appearance.

## Import

```typescript
import { GridConfig } from '@ng-ui-lib/core';
```

## Interface Definition

```typescript
interface GridConfig {
  totalRows?: number;
  rowHeight?: number;
  virtualScrolling?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  selectionMode?: 'single' | 'multiple';
  resizable?: boolean;
  reorderable?: boolean;
  theme?: string;
  showFooter?: boolean;
}
```

## Properties

### `totalRows`
- **Type:** `number`
- **Optional:** Yes
- **Default:** Auto-calculated from data length
- **Description:** Total number of rows in the grid. Usually auto-calculated but can be set manually for server-side pagination
- **Example:**
  ```typescript
  const config: GridConfig = {
    totalRows: 10000 // For server-side pagination
  };
  ```

### `rowHeight`
- **Type:** `number`
- **Optional:** Yes
- **Default:** `40`
- **Description:** Height of each row in pixels. Required for virtual scrolling to work properly
- **Example:**
  ```typescript
  const config: GridConfig = {
    rowHeight: 50 // Taller rows for more content
  };
  ```

### `virtualScrolling`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `true`
- **Description:** Enable virtual scrolling for better performance with large datasets
- **Example:**
  ```typescript
  const config: GridConfig = {
    virtualScrolling: true, // Recommended for > 1000 rows
    rowHeight: 40 // Required when virtual scrolling is enabled
  };
  ```

### `sortable`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `true`
- **Description:** Global setting to enable/disable sorting. Can be overridden per column
- **Example:**
  ```typescript
  const config: GridConfig = {
    sortable: false // Disable sorting globally
  };
  ```

### `filterable`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `true`
- **Description:** Global setting to enable/disable filtering. Can be overridden per column
- **Example:**
  ```typescript
  const config: GridConfig = {
    filterable: true // Enable filtering globally
  };
  ```

### `selectable`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `true`
- **Description:** Enable/disable row selection
- **Example:**
  ```typescript
  const config: GridConfig = {
    selectable: false // Disable row selection completely
  };
  ```

### `selectionMode`
- **Type:** `'single' | 'multiple'`
- **Optional:** Yes
- **Default:** `'multiple'`
- **Description:** Selection mode when `selectable` is true
- **Example:**
  ```typescript
  // Single selection
  const singleConfig: GridConfig = {
    selectable: true,
    selectionMode: 'single'
  };

  // Multiple selection
  const multiConfig: GridConfig = {
    selectable: true,
    selectionMode: 'multiple'
  };
  ```

### `resizable`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `true`
- **Description:** Global setting to enable/disable column resizing. Can be overridden per column
- **Example:**
  ```typescript
  const config: GridConfig = {
    resizable: true // Users can resize columns by dragging
  };
  ```

### `reorderable`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `true`
- **Description:** Enable/disable column reordering via drag and drop
- **Example:**
  ```typescript
  const config: GridConfig = {
    reorderable: true // Users can reorder columns
  };
  ```

### `theme`
- **Type:** `string`
- **Optional:** Yes
- **Default:** `'default'`
- **Description:** Theme name to apply to the grid
- **Available Themes:**
  - `'default'` - Standard light theme
  - `'dark'` - Dark theme
  - `'minimal'` - Minimal styling
  - `'compact'` - Compact spacing
- **Example:**
  ```typescript
  const config: GridConfig = {
    theme: 'dark'
  };
  ```

### `showFooter`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `false`
- **Description:** Show/hide grid footer with summary information
- **Example:**
  ```typescript
  const config: GridConfig = {
    showFooter: true // Show footer with row count, selection info, etc.
  };
  ```

## Defaults

The default configuration when no config is provided:

```typescript
const defaultConfig: GridConfig = {
  totalRows: 0,                    // Auto-calculated
  rowHeight: 40,
  virtualScrolling: true,
  sortable: true,
  filterable: true,
  selectable: true,
  selectionMode: 'multiple',
  resizable: true,
  reorderable: true,
  theme: 'default',
  showFooter: false
};
```

## Usage Examples

### Basic Configuration
```typescript
@Component({
  template: `
    <ng-ui-lib 
      [data]="data" 
      [columns]="columns" 
      [config]="basicConfig">
    </ng-ui-lib>
  `
})
export class BasicGridComponent {
  basicConfig: GridConfig = {
    rowHeight: 45,
    selectable: true,
    sortable: true
  };
}
```

### Performance-Optimized Configuration
```typescript
@Component({
  template: `
    <ng-ui-lib 
      [data]="largeDataset" 
      [columns]="columns" 
      [config]="perfConfig">
    </ng-ui-lib>
  `
})
export class PerformanceGridComponent {
  perfConfig: GridConfig = {
    virtualScrolling: true,
    rowHeight: 35,           // Smaller rows for more visible data
    filterable: false,       // Disable filtering for better performance
    reorderable: false,      // Disable reordering for better performance
    theme: 'compact'
  };
}
```

### Read-Only Configuration
```typescript
@Component({
  template: `
    <ng-ui-lib 
      [data]="readOnlyData" 
      [columns]="columns" 
      [config]="readOnlyConfig">
    </ng-ui-lib>
  `
})
export class ReadOnlyGridComponent {
  readOnlyConfig: GridConfig = {
    selectable: false,
    sortable: false,
    filterable: false,
    resizable: false,
    reorderable: false,
    theme: 'minimal'
  };
}
```

### Feature-Rich Configuration
```typescript
@Component({
  template: `
    <ng-ui-lib 
      [data]="data" 
      [columns]="columns" 
      [config]="fullFeaturedConfig">
    </ng-ui-lib>
  `
})
export class FullFeaturedGridComponent {
  fullFeaturedConfig: GridConfig = {
    rowHeight: 50,
    virtualScrolling: true,
    sortable: true,
    filterable: true,
    selectable: true,
    selectionMode: 'multiple',
    resizable: true,
    reorderable: true,
    showFooter: true,
    theme: 'default'
  };
}
```

### Dark Theme Configuration
```typescript
@Component({
  template: `
    <div class="dark-theme-container">
      <ng-ui-lib 
        [data]="data" 
        [columns]="columns" 
        [config]="darkConfig">
      </ng-ui-lib>
    </div>
  `
})
export class DarkThemeGridComponent {
  darkConfig: GridConfig = {
    theme: 'dark',
    rowHeight: 42,
    showFooter: true
  };
}
```

## Configuration Tips

### Performance
- Enable `virtualScrolling` for datasets > 1000 rows
- Set appropriate `rowHeight` based on content needs
- Disable unnecessary features (`filterable`, `reorderable`) for read-only grids

### User Experience
- Use `selectionMode: 'single'` when only one selection is meaningful
- Enable `showFooter` to provide users with data context
- Choose themes that match your application's design

### Accessibility
- Maintain consistent `rowHeight` for keyboard navigation
- Ensure sufficient contrast with theme selection
- Keep essential features (sorting, selection) enabled for screen readers

## Related Interfaces

- [ColumnDefinition](./column-definition.md) - Individual column configuration
- [GridEvent Types](./grid-events.md) - Event interfaces
- [Grid Component](../grid-component.md) - Main component API