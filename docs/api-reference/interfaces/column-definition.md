# ColumnDefinition Interface

Configuration interface for defining grid columns with their behavior, appearance, and data binding.

## Import

```typescript
import { ColumnDefinition } from '@ng-ui-lib/core';
```

## Interface Definition

```typescript
interface ColumnDefinition {
  id: string;
  field: string;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  visible?: boolean;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'custom';
  cellRenderer?: string;
  cellEditor?: string;
  align?: 'left' | 'center' | 'right';
  pinned?: 'left' | 'right';
}
```

## Properties

### `id` (Required)
- **Type:** `string`
- **Description:** Unique identifier for the column. Used internally for tracking and events
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'user-name',
    field: 'name',
    header: 'Full Name'
  };
  ```

### `field` (Required)
- **Type:** `string`
- **Description:** Property name in the data object to display in this column
- **Example:**
  ```typescript
  // For data: { firstName: 'John', lastName: 'Doe' }
  const column: ColumnDefinition = {
    id: 'first-name',
    field: 'firstName', // Maps to data.firstName
    header: 'First Name'
  };
  ```

### `header` (Required)
- **Type:** `string`
- **Description:** Display text for the column header
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'email',
    field: 'emailAddress',
    header: 'Email Address' // User-friendly header text
  };
  ```

### `width`
- **Type:** `number`
- **Optional:** Yes
- **Default:** `150`
- **Description:** Column width in pixels
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'id',
    field: 'id',
    header: 'ID',
    width: 80 // Narrow column for ID
  };
  ```

### `minWidth`
- **Type:** `number`
- **Optional:** Yes
- **Default:** `50`
- **Description:** Minimum width when resizing the column
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'description',
    field: 'description',
    header: 'Description',
    width: 300,
    minWidth: 150 // Don't let it get too narrow
  };
  ```

### `maxWidth`
- **Type:** `number`
- **Optional:** Yes
- **Default:** `undefined` (no limit)
- **Description:** Maximum width when resizing the column
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'code',
    field: 'productCode',
    header: 'Product Code',
    width: 120,
    maxWidth: 200 // Don't let it get too wide
  };
  ```

### `sortable`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `true`
- **Description:** Enable/disable sorting for this column. Overrides grid-level sortable setting
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'actions',
    field: 'actions',
    header: 'Actions',
    sortable: false // Action columns typically aren't sortable
  };
  ```

### `filterable`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `true`
- **Description:** Enable/disable filtering for this column. Overrides grid-level filterable setting
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'status',
    field: 'status',
    header: 'Status',
    filterable: true, // Enable filtering for status column
    type: 'string'
  };
  ```

### `resizable`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `true`
- **Description:** Enable/disable resizing for this column. Overrides grid-level resizable setting
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'checkbox',
    field: 'selected',
    header: '',
    width: 40,
    resizable: false // Fixed width checkbox column
  };
  ```

### `visible`
- **Type:** `boolean`
- **Optional:** Yes
- **Default:** `true`
- **Description:** Show/hide the column
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'internal-id',
    field: 'internalId',
    header: 'Internal ID',
    visible: false // Hidden by default
  };
  ```

### `type`
- **Type:** `'string' | 'number' | 'date' | 'boolean' | 'custom'`
- **Optional:** Yes
- **Default:** `'string'`
- **Description:** Data type for automatic formatting, sorting, and filtering
- **Example:**
  ```typescript
  const columns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Name',
      type: 'string'
    },
    {
      id: 'age',
      field: 'age',
      header: 'Age',
      type: 'number'
    },
    {
      id: 'birthDate',
      field: 'birthDate',
      header: 'Birth Date',
      type: 'date'
    },
    {
      id: 'active',
      field: 'isActive',
      header: 'Active',
      type: 'boolean'
    }
  ];
  ```

### `cellRenderer`
- **Type:** `string`
- **Optional:** Yes
- **Description:** Custom cell renderer template name or component selector
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'avatar',
    field: 'profileImage',
    header: 'Avatar',
    cellRenderer: 'avatar-cell-renderer'
  };
  ```

### `cellEditor`
- **Type:** `string`
- **Optional:** Yes
- **Description:** Custom cell editor template name or component selector for inline editing
- **Example:**
  ```typescript
  const column: ColumnDefinition = {
    id: 'category',
    field: 'category',
    header: 'Category',
    cellEditor: 'dropdown-cell-editor'
  };
  ```

### `align`
- **Type:** `'left' | 'center' | 'right'`
- **Optional:** Yes
- **Default:** `'left'`
- **Description:** Text alignment within the column cells
- **Example:**
  ```typescript
  const columns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Name',
      align: 'left' // Default for text
    },
    {
      id: 'price',
      field: 'price',
      header: 'Price',
      type: 'number',
      align: 'right' // Common for numbers/currency
    },
    {
      id: 'status',
      field: 'status',
      header: 'Status',
      align: 'center' // Center status indicators
    }
  ];
  ```

### `pinned`
- **Type:** `'left' | 'right'`
- **Optional:** Yes
- **Default:** `undefined` (not pinned)
- **Description:** Pin the column to left or right side of the grid
- **Example:**
  ```typescript
  const columns: ColumnDefinition[] = [
    {
      id: 'id',
      field: 'id',
      header: 'ID',
      width: 80,
      pinned: 'left' // Always visible on the left
    },
    {
      id: 'name',
      field: 'name',
      header: 'Name',
      width: 200,
      pinned: 'left' // Also pinned to left
    },
    {
      id: 'actions',
      field: 'actions',
      header: 'Actions',
      width: 120,
      pinned: 'right' // Always visible on the right
    }
  ];
  ```

## Data Type Behavior

### String Type
- **Sorting:** Alphabetical (locale-aware)
- **Filtering:** Case-insensitive contains
- **Display:** As-is
- **Example:**
  ```typescript
  {
    id: 'name',
    field: 'fullName',
    header: 'Full Name',
    type: 'string',
    align: 'left'
  }
  ```

### Number Type
- **Sorting:** Numerical
- **Filtering:** Exact match
- **Display:** Formatted numbers
- **Example:**
  ```typescript
  {
    id: 'price',
    field: 'price',
    header: 'Price ($)',
    type: 'number',
    align: 'right'
  }
  ```

### Date Type
- **Sorting:** Chronological
- **Filtering:** Date comparison
- **Display:** Locale date format
- **Example:**
  ```typescript
  {
    id: 'created',
    field: 'createdAt',
    header: 'Created Date',
    type: 'date',
    width: 150
  }
  ```

### Boolean Type
- **Sorting:** False first, then true
- **Filtering:** True/false toggle
- **Display:** Checkbox or text representation
- **Example:**
  ```typescript
  {
    id: 'active',
    field: 'isActive',
    header: 'Active',
    type: 'boolean',
    width: 100,
    align: 'center'
  }
  ```

## Usage Examples

### Basic Column Setup
```typescript
const basicColumns: ColumnDefinition[] = [
  {
    id: 'id',
    field: 'id',
    header: 'ID',
    type: 'number',
    width: 80
  },
  {
    id: 'name',
    field: 'name',
    header: 'Name',
    type: 'string',
    width: 200
  },
  {
    id: 'email',
    field: 'email',
    header: 'Email',
    type: 'string',
    width: 250
  }
];
```

### Advanced Column Configuration
```typescript
const advancedColumns: ColumnDefinition[] = [
  {
    id: 'row-number',
    field: 'rowNumber',
    header: '#',
    width: 50,
    resizable: false,
    sortable: false,
    pinned: 'left'
  },
  {
    id: 'avatar',
    field: 'profilePicture',
    header: 'Avatar',
    width: 60,
    resizable: false,
    sortable: false,
    filterable: false,
    cellRenderer: 'avatar-renderer',
    align: 'center'
  },
  {
    id: 'full-name',
    field: 'fullName',
    header: 'Full Name',
    type: 'string',
    width: 200,
    minWidth: 150,
    maxWidth: 300,
    sortable: true,
    filterable: true,
    resizable: true,
    pinned: 'left'
  },
  {
    id: 'email',
    field: 'emailAddress',
    header: 'Email Address',
    type: 'string',
    width: 250,
    minWidth: 200
  },
  {
    id: 'department',
    field: 'department',
    header: 'Department',
    type: 'string',
    width: 150,
    cellEditor: 'department-selector'
  },
  {
    id: 'salary',
    field: 'annualSalary',
    header: 'Annual Salary',
    type: 'number',
    width: 130,
    align: 'right',
    cellRenderer: 'currency-renderer'
  },
  {
    id: 'start-date',
    field: 'startDate',
    header: 'Start Date',
    type: 'date',
    width: 120
  },
  {
    id: 'active',
    field: 'isActive',
    header: 'Active',
    type: 'boolean',
    width: 80,
    align: 'center'
  },
  {
    id: 'actions',
    field: 'actions',
    header: 'Actions',
    width: 120,
    sortable: false,
    filterable: false,
    resizable: false,
    pinned: 'right',
    cellRenderer: 'action-buttons'
  }
];
```

### Dynamic Column Configuration
```typescript
@Component({
  template: `
    <ng-ui-lib 
      [data]="data" 
      [columns]="dynamicColumns" 
      [config]="config">
    </ng-ui-lib>
  `
})
export class DynamicColumnsComponent {
  showOptionalColumns = true;
  
  get dynamicColumns(): ColumnDefinition[] {
    const baseColumns: ColumnDefinition[] = [
      { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
      { id: 'name', field: 'name', header: 'Name', type: 'string' }
    ];
    
    const optionalColumns: ColumnDefinition[] = [
      { id: 'email', field: 'email', header: 'Email', type: 'string' },
      { id: 'phone', field: 'phone', header: 'Phone', type: 'string' }
    ];
    
    return this.showOptionalColumns 
      ? [...baseColumns, ...optionalColumns]
      : baseColumns;
  }
  
  toggleOptionalColumns() {
    this.showOptionalColumns = !this.showOptionalColumns;
  }
}
```

### Column Visibility Control
```typescript
@Component({
  template: `
    <div>
      <button *ngFor="let col of allColumns" 
              (click)="toggleColumnVisibility(col.id)">
        {{ col.visible ? 'Hide' : 'Show' }} {{ col.header }}
      </button>
    </div>
    <ng-ui-lib 
      [data]="data" 
      [columns]="visibleColumns" 
      [config]="config">
    </ng-ui-lib>
  `
})
export class ColumnVisibilityComponent {
  allColumns: ColumnDefinition[] = [
    { id: 'id', field: 'id', header: 'ID', visible: true },
    { id: 'name', field: 'name', header: 'Name', visible: true },
    { id: 'email', field: 'email', header: 'Email', visible: true },
    { id: 'phone', field: 'phone', header: 'Phone', visible: false }
  ];
  
  get visibleColumns(): ColumnDefinition[] {
    return this.allColumns.filter(col => col.visible !== false);
  }
  
  toggleColumnVisibility(columnId: string) {
    const column = this.allColumns.find(col => col.id === columnId);
    if (column) {
      column.visible = !column.visible;
    }
  }
}
```

## Best Practices

### Performance
- Set appropriate widths to avoid layout thrashing
- Use `minWidth` and `maxWidth` to prevent extreme resizing
- Disable unnecessary features (sorting/filtering) on action columns

### User Experience
- Use descriptive `header` text
- Choose appropriate `type` for automatic formatting
- Pin important columns (`id`, `name`, `actions`) for easier access
- Use consistent `align` values for similar data types

### Accessibility
- Provide meaningful `header` text for screen readers
- Use appropriate data types for semantic meaning
- Ensure sufficient column widths for readability

## Related Documentation

- [GridConfig](./grid-config.md) - Grid-level configuration
- [Grid Component](../grid-component.md) - Main component API
- [Data Binding](../../features/data-binding.md) - Working with data
- [Column Features](../../features/column-configuration.md) - Advanced column features