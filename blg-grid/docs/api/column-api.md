# Column API Reference

The Column API defines how columns are configured and behave in the BLG Grid. Each column is defined using the `ColumnDefinition` interface.

## ColumnDefinition Interface

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
  cellEditor?: string | boolean;
  align?: 'left' | 'center' | 'right';
  pinned?: 'left' | 'right';
}
```

## Properties

### id (Required)
- **Type:** `string`
- **Description:** Unique identifier for the column. Used for sorting, filtering, and referencing.
- **Example:** `'userId'`, `'firstName'`, `'createdDate'`

### field (Required)
- **Type:** `string`
- **Description:** Property name in the data object that this column displays.
- **Example:** `'user.firstName'`, `'metadata.createdAt'`, `'price'`

### header (Required)
- **Type:** `string`
- **Description:** Display text shown in the column header.
- **Example:** `'User Name'`, `'Creation Date'`, `'Price ($)'`

### width
- **Type:** `number` (optional)
- **Description:** Column width in pixels.
- **Default:** `150`
- **Example:** `100`, `200`, `300`

### minWidth
- **Type:** `number` (optional)
- **Description:** Minimum width the column can be resized to.
- **Default:** `50`
- **Example:** `80`, `100`

### maxWidth
- **Type:** `number` (optional)
- **Description:** Maximum width the column can be resized to.
- **Default:** `500`
- **Example:** `300`, `400`

### sortable
- **Type:** `boolean` (optional)
- **Description:** Whether this column can be sorted.
- **Default:** Inherits from grid config or `true`
- **Example:** `true`, `false`

### filterable
- **Type:** `boolean` (optional)
- **Description:** Whether this column can be filtered.
- **Default:** Inherits from grid config or `true`
- **Example:** `true`, `false`

### resizable
- **Type:** `boolean` (optional)
- **Description:** Whether this column can be resized by dragging.
- **Default:** Inherits from grid config or `true`
- **Example:** `true`, `false`

### visible
- **Type:** `boolean` (optional)
- **Description:** Whether this column is visible in the grid.
- **Default:** `true`
- **Example:** `true`, `false`

### type
- **Type:** `'string' | 'number' | 'date' | 'boolean' | 'custom'` (optional)
- **Description:** Data type for proper sorting, filtering, and display formatting.
- **Default:** `'string'`

#### Data Type Behaviors:

**string:**
- Sorting: Alphabetical (locale-aware)
- Filtering: Case-insensitive contains
- Display: As-is

**number:**
- Sorting: Numeric comparison
- Filtering: Supports operators (>, <, >=, <=) and exact match
- Display: Localized number formatting

**date:**
- Sorting: Chronological
- Filtering: Date comparison
- Display: Localized date formatting

**boolean:**
- Sorting: False < True
- Filtering: Yes/No/True/False/1/0
- Display: Yes/No

**custom:**
- Sorting: String comparison
- Filtering: String contains
- Display: Uses cellRenderer

### cellRenderer
- **Type:** `string` (optional)
- **Description:** Template string for custom cell rendering. Supports placeholders.
- **Placeholders:**
  - `{{value}}`: Cell value
  - `{{fieldName}}`: Any field from row data
- **Example:**
```typescript
// Simple template
cellRenderer: '<strong>{{value}}</strong>'

// Using multiple fields
cellRenderer: '{{firstName}} {{lastName}} ({{email}})'

// HTML with styling
cellRenderer: '<span class="status-badge status-{{status}}">{{value}}</span>'
```

### cellEditor
- **Type:** `string | boolean` (optional)
- **Description:** Cell editor configuration.
- **Values:**
  - `true`: Default editor based on column type
  - `false`: Disable editing
  - `string`: Custom editor template
- **Default:** `true`

#### Default Editors by Type:
- **string:** Text input
- **number:** Number input
- **date:** Date input
- **boolean:** Select dropdown (True/False)
- **custom:** Text input

### align
- **Type:** `'left' | 'center' | 'right'` (optional)
- **Description:** Text alignment for column content.
- **Default:** `'left'` (except `'right'` for numbers)

### pinned
- **Type:** `'left' | 'right'` (optional)
- **Description:** Pin column to left or right side of the grid.
- **Default:** `undefined` (not pinned)

## Column Examples

### Basic Text Column
```typescript
{
  id: 'name',
  field: 'name',
  header: 'Full Name',
  type: 'string',
  width: 200,
  sortable: true,
  filterable: true
}
```

### Numeric Currency Column
```typescript
{
  id: 'price',
  field: 'price',
  header: 'Price ($)',
  type: 'number',
  width: 120,
  align: 'right',
  sortable: true,
  filterable: true,
  cellRenderer: '${{value}}'
}
```

### Date Column
```typescript
{
  id: 'createdAt',
  field: 'createdAt',
  header: 'Created Date',
  type: 'date',
  width: 150,
  sortable: true,
  filterable: true
}
```

### Boolean Status Column
```typescript
{
  id: 'active',
  field: 'active',
  header: 'Status',
  type: 'boolean',
  width: 100,
  align: 'center',
  sortable: true,
  cellRenderer: '<span class="status-{{value ? \'active\' : \'inactive\'}}">{{value ? \'Active\' : \'Inactive\'}}</span>'
}
```

### Custom Template Column
```typescript
{
  id: 'userInfo',
  field: 'firstName',
  header: 'User Information',
  type: 'custom',
  width: 250,
  sortable: false,
  cellRenderer: `
    <div class="user-info">
      <img src="{{avatar}}" alt="Avatar" class="avatar">
      <div>
        <strong>{{firstName}} {{lastName}}</strong>
        <br>
        <small>{{email}}</small>
      </div>
    </div>
  `
}
```

### Action Column (Non-editable)
```typescript
{
  id: 'actions',
  field: 'id',
  header: 'Actions',
  type: 'custom',
  width: 150,
  sortable: false,
  filterable: false,
  cellEditor: false,
  cellRenderer: `
    <button class="btn btn-sm btn-primary" onclick="editItem({{value}})">Edit</button>
    <button class="btn btn-sm btn-danger" onclick="deleteItem({{value}})">Delete</button>
  `
}
```

### Pinned ID Column
```typescript
{
  id: 'id',
  field: 'id',
  header: 'ID',
  type: 'number',
  width: 80,
  minWidth: 60,
  maxWidth: 120,
  pinned: 'left',
  sortable: true,
  resizable: false
}
```

### Hidden Column (for calculations)
```typescript
{
  id: 'internalScore',
  field: 'score',
  header: 'Score',
  type: 'number',
  visible: false, // Hidden from view but available for calculations
  sortable: false,
  filterable: false
}
```

## Column Type Definitions

### String Type Features
```typescript
{
  id: 'description',
  field: 'description',
  header: 'Description',
  type: 'string',
  width: 300,
  cellEditor: true, // Text input editor
  // Filtering supports partial matches (case-insensitive)
  // Sorting is locale-aware alphabetical
}
```

### Number Type Features
```typescript
{
  id: 'quantity',
  field: 'quantity',
  header: 'Quantity',
  type: 'number',
  width: 100,
  align: 'right',
  // Filtering supports: exact match, >, <, >=, <=
  // Examples: "100", ">50", "<=200", ">=10"
  // Sorting is numeric comparison
  // Display uses toLocaleString() formatting
}
```

### Date Type Features
```typescript
{
  id: 'lastLogin',
  field: 'lastLogin',
  header: 'Last Login',
  type: 'date',
  width: 140,
  // Filtering supports date comparison
  // Editor shows date picker (input[type="date"])
  // Sorting is chronological
  // Display uses toLocaleDateString() formatting
}
```

### Boolean Type Features
```typescript
{
  id: 'verified',
  field: 'verified',
  header: 'Verified',
  type: 'boolean',
  width: 100,
  align: 'center',
  // Filtering accepts: true/false, yes/no, 1/0
  // Editor shows dropdown with True/False options
  // Display shows "Yes"/"No"
}
```

## Advanced Column Configuration

### Dynamic Column Creation
```typescript
// Create columns dynamically from data
function createColumnsFromData(sampleData: any[]): ColumnDefinition[] {
  if (!sampleData.length) return [];
  
  const firstRow = sampleData[0];
  return Object.keys(firstRow).map(key => ({
    id: key,
    field: key,
    header: key.charAt(0).toUpperCase() + key.slice(1),
    type: inferColumnType(firstRow[key]),
    width: getOptimalWidth(key, firstRow[key]),
    sortable: true,
    filterable: true
  }));
}

function inferColumnType(value: any): ColumnDefinition['type'] {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'date';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
  return 'string';
}
```

### Column Groups and Hierarchies
While the current API doesn't support column groups, you can achieve visual grouping with headers:

```typescript
const columns: ColumnDefinition[] = [
  { id: 'id', field: 'id', header: 'ID', pinned: 'left' },
  
  // Personal Info Group
  { id: 'firstName', field: 'firstName', header: '👤 First Name' },
  { id: 'lastName', field: 'lastName', header: '👤 Last Name' },
  { id: 'email', field: 'email', header: '👤 Email' },
  
  // Financial Info Group
  { id: 'salary', field: 'salary', header: '💰 Salary' },
  { id: 'bonus', field: 'bonus', header: '💰 Bonus' },
  
  // System Info Group
  { id: 'createdAt', field: 'createdAt', header: '⚙️ Created' },
  { id: 'updatedAt', field: 'updatedAt', header: '⚙️ Updated' }
];
```

## Best Practices

### Column Width Management
```typescript
// Responsive column widths
const getResponsiveColumns = (screenWidth: number): ColumnDefinition[] => [
  {
    id: 'name',
    field: 'name',
    header: 'Name',
    width: screenWidth > 768 ? 200 : 150,
    minWidth: 120
  },
  {
    id: 'description',
    field: 'description',
    header: 'Description',
    width: screenWidth > 1200 ? 300 : screenWidth > 768 ? 200 : 0,
    visible: screenWidth > 768
  }
];
```

### Type-Safe Column Definitions
```typescript
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

type UserColumnId = keyof User;

const createUserColumns = (): ColumnDefinition[] => [
  {
    id: 'id' satisfies UserColumnId,
    field: 'id',
    header: 'ID',
    type: 'number'
  },
  {
    id: 'firstName' satisfies UserColumnId,
    field: 'firstName',
    header: 'First Name',
    type: 'string'
  }
  // ... more columns
];
```

### Performance Optimization
```typescript
// Use cellRenderer sparingly for performance
const optimizedColumns: ColumnDefinition[] = [
  // Good: Simple display
  { id: 'name', field: 'name', header: 'Name', type: 'string' },
  
  // Use carefully: Complex rendering
  {
    id: 'status',
    field: 'status',
    header: 'Status',
    cellRenderer: '{{value}}', // Simple template
    type: 'custom'
  },
  
  // Avoid: Heavy computation in templates
  // cellRenderer: '{{computeComplexValue(value, data)}}'
];
```