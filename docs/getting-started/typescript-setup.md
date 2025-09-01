# TypeScript Setup Guide

This guide will help you configure TypeScript for optimal development experience with BlgGrid, including strict type checking, advanced type definitions, and IntelliSense configuration.

## TypeScript Configuration

### Recommended tsconfig.json

Configure your `tsconfig.json` for the best BlgGrid experience:

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    // Target and Module
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    
    // Strict Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    
    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    
    // Module Resolution
    "baseUrl": "./",
    "paths": {
      "@blg-grid/*": ["node_modules/@blg-grid/*"],
      "@app/*": ["src/app/*"],
      "@shared/*": ["src/app/shared/*"]
    },
    
    // Output
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "sourceMap": true,
    
    // Angular Specific
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true,
    "strictInputTypes": true,
    "strictOutputEventTypes": true,
    "strictDomEventTypes": true,
    "strictSafeNavigationTypes": true,
    "strictDomLocalRefTypes": true,
    "strictAttributeTypes": true,
    "strictContextGenerics": true
  }
}
```

## Type Definitions

BlgGrid provides comprehensive type definitions for all components, interfaces, and services.

### Core Type Imports

```typescript
// Core interfaces and types
import type {
  ColumnDefinition,
  GridConfig,
  GridEvent,
  CellClickEvent,
  RowSelectEvent,
  ColumnSortEvent,
  ColumnResizeEvent,
  PaginationEvent,
  CellEditEvent,
  PaginationConfig,
  GroupingConfig,
  ExportConfig
} from '@blg-grid/core';

// Service types
import type {
  GridStateService,
  ExportService,
  GroupingService
} from '@blg-grid/core';
```

### Advanced Type Usage

#### Strongly Typed Data Models

```typescript
// Define your data model
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: Department;
  salary: number;
  hireDate: Date;
  isActive: boolean;
  skills: string[];
}

interface Department {
  id: number;
  name: string;
  budget: number;
}

// Use generic types for type safety
@Component({
  selector: 'app-employee-grid',
  standalone: true,
  imports: [Grid]
})
export class EmployeeGridComponent {
  // Strongly typed data
  employees: Employee[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      department: { id: 1, name: 'Engineering', budget: 500000 },
      salary: 85000,
      hireDate: new Date('2022-01-15'),
      isActive: true,
      skills: ['TypeScript', 'Angular', 'Node.js']
    }
  ];

  // Strongly typed column definitions
  columns: ColumnDefinition[] = [
    {
      id: 'firstName',
      field: 'firstName',
      header: 'First Name',
      type: 'string',
      sortable: true,
      filterable: true
    },
    {
      id: 'department.name', // Nested property
      field: 'department.name',
      header: 'Department',
      type: 'string',
      sortable: true,
      filterable: true
    },
    {
      id: 'salary',
      field: 'salary',
      header: 'Salary',
      type: 'number',
      sortable: true,
      filterable: true,
      cellRenderer: 'currency'
    },
    {
      id: 'hireDate',
      field: 'hireDate',
      header: 'Hire Date',
      type: 'date',
      sortable: true,
      filterable: true
    },
    {
      id: 'isActive',
      field: 'isActive',
      header: 'Active',
      type: 'boolean',
      sortable: true,
      filterable: true
    }
  ];

  // Strongly typed event handlers
  onEmployeeSelected(event: RowSelectEvent) {
    const employee: Employee = event.data.rowData;
    console.log('Selected employee:', employee.firstName, employee.lastName);
  }

  onSalaryClick(event: CellClickEvent) {
    if (event.data.columnId === 'salary') {
      const salary: number = event.data.value;
      console.log('Clicked salary:', salary);
    }
  }
}
```

#### Generic Grid Component

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition, GridConfig, RowSelectEvent } from '@blg-grid/core';

// Generic reusable grid component
@Component({
  selector: 'app-typed-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <blg-grid
      [data]="data"
      [columns]="columns"
      [config]="config"
      (rowSelect)="onRowSelect($event)"
    ></blg-grid>
  `
})
export class TypedGridComponent<T = any> {
  @Input() data: T[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() config: GridConfig = {};
  
  @Output() rowSelected = new EventEmitter<T>();

  onRowSelect(event: RowSelectEvent) {
    const selectedItem: T = event.data.rowData;
    this.rowSelected.emit(selectedItem);
  }
}

// Usage with specific type
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [TypedGridComponent],
  template: `
    <app-typed-grid
      [data]="employees"
      [columns]="employeeColumns"
      [config]="gridConfig"
      (rowSelected)="onEmployeeSelected($event)"
    ></app-typed-grid>
  `
})
export class EmployeeListComponent {
  employees: Employee[] = [...];
  
  onEmployeeSelected(employee: Employee) {
    // Type-safe employee handling
    console.log(`Selected: ${employee.firstName} ${employee.lastName}`);
  }
}
```

### Custom Type Definitions

Create custom types for your specific use cases:

```typescript
// Custom column types
type CustomColumnType = 'currency' | 'percentage' | 'rating' | 'status';

interface ExtendedColumnDefinition extends ColumnDefinition {
  customType?: CustomColumnType;
  format?: {
    currency?: string;
    decimals?: number;
    prefix?: string;
    suffix?: string;
  };
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

// Custom grid configuration
interface ExtendedGridConfig extends GridConfig {
  customFeatures?: {
    enableBulkActions?: boolean;
    enableExport?: boolean;
    enablePrint?: boolean;
    customToolbar?: boolean;
  };
}

// Custom event types
interface CustomCellEditEvent extends CellEditEvent {
  validationResult?: {
    isValid: boolean;
    errors: string[];
  };
}
```

### Utility Types

Create utility types for common patterns:

```typescript
// Extract column field names from data type
type ColumnField<T> = keyof T | `${keyof T extends string ? keyof T : never}.${string}`;

// Generate column definitions from data type
type AutoColumns<T> = {
  [K in keyof Required<T>]: ColumnDefinition & {
    id: K extends string ? K : never;
    field: K extends string ? K : never;
    header: string;
    type: T[K] extends string ? 'string' :
          T[K] extends number ? 'number' :
          T[K] extends boolean ? 'boolean' :
          T[K] extends Date ? 'date' : 'custom';
  };
}[keyof T][];

// Helper function to create type-safe columns
function createColumns<T>(): AutoColumns<T> {
  // Implementation would generate columns based on type T
  return [] as AutoColumns<T>;
}

// Usage
const employeeColumns = createColumns<Employee>();
```

## Type Guards and Validation

Implement type guards for runtime type safety:

```typescript
// Type guards
function isEmployee(obj: any): obj is Employee {
  return typeof obj === 'object' &&
         typeof obj.id === 'number' &&
         typeof obj.firstName === 'string' &&
         typeof obj.lastName === 'string' &&
         typeof obj.email === 'string';
}

function isValidGridData<T>(data: any[], typeGuard: (item: any) => item is T): data is T[] {
  return Array.isArray(data) && data.every(typeGuard);
}

// Usage in component
@Component({
  selector: 'app-safe-grid',
  standalone: true,
  imports: [Grid]
})
export class SafeGridComponent {
  private rawData: any[] = [];
  
  get safeData(): Employee[] {
    if (isValidGridData(this.rawData, isEmployee)) {
      return this.rawData;
    }
    console.warn('Invalid employee data detected');
    return [];
  }
  
  loadData(data: unknown) {
    if (Array.isArray(data) && isValidGridData(data, isEmployee)) {
      this.rawData = data;
    } else {
      throw new Error('Invalid employee data format');
    }
  }
}
```

## IntelliSense Optimization

Enhance your development experience with better IntelliSense:

### VSCode Settings

Add to your `.vscode/settings.json`:

```json
{
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "typescript.suggest.autoImports": true,
  "typescript.suggest.includePackageJsonAutoImports": "auto",
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.parameterTypes.enabled": true,
  "typescript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.propertyDeclarationTypes.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll": true
  }
}
```

### Custom Snippets

Create VSCode snippets for common BlgGrid patterns:

```json
// .vscode/blg-grid.code-snippets
{
  "BlgGrid Component": {
    "prefix": "blg-component",
    "body": [
      "import { Component } from '@angular/core';",
      "import { Grid } from '@blg-grid/grid';",
      "import { ColumnDefinition, GridConfig } from '@blg-grid/core';",
      "",
      "@Component({",
      "  selector: 'app-${1:grid}',",
      "  standalone: true,",
      "  imports: [Grid],",
      "  template: \\`",
      "    <blg-grid",
      "      [data]=\"data\"",
      "      [columns]=\"columns\"",
      "      [config]=\"config\">",
      "    </blg-grid>",
      "  \\`",
      "})",
      "export class ${2:GridComponent} {",
      "  data: ${3:any}[] = [];",
      "  ",
      "  columns: ColumnDefinition[] = [",
      "    {",
      "      id: '${4:id}',",
      "      field: '${5:field}',",
      "      header: '${6:Header}',",
      "      sortable: true",
      "    }",
      "  ];",
      "  ",
      "  config: GridConfig = {",
      "    virtualScrolling: true,",
      "    sortable: true,",
      "    selectable: true",
      "  };",
      "}"
    ],
    "description": "Create a new BlgGrid component"
  },
  
  "Column Definition": {
    "prefix": "blg-column",
    "body": [
      "{",
      "  id: '${1:id}',",
      "  field: '${2:field}',",
      "  header: '${3:Header}',",
      "  type: '${4|string,number,date,boolean,custom|}',",
      "  sortable: ${5|true,false|},",
      "  filterable: ${6|true,false|}",
      "}"
    ],
    "description": "Create a column definition"
  }
}
```

## Error Handling with Types

Implement type-safe error handling:

```typescript
// Custom error types
class GridError extends Error {
  constructor(
    message: string,
    public code: GridErrorCode,
    public context?: any
  ) {
    super(message);
    this.name = 'GridError';
  }
}

enum GridErrorCode {
  INVALID_DATA = 'INVALID_DATA',
  MISSING_COLUMNS = 'MISSING_COLUMNS',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  RENDERING_ERROR = 'RENDERING_ERROR'
}

// Type-safe error handler
@Injectable()
export class TypedGridErrorHandler {
  handleError(error: unknown): void {
    if (error instanceof GridError) {
      this.handleGridError(error);
    } else if (error instanceof Error) {
      this.handleGenericError(error);
    } else {
      this.handleUnknownError(error);
    }
  }

  private handleGridError(error: GridError): void {
    console.error(`Grid Error [${error.code}]: ${error.message}`, error.context);
    
    switch (error.code) {
      case GridErrorCode.INVALID_DATA:
        // Handle invalid data error
        break;
      case GridErrorCode.MISSING_COLUMNS:
        // Handle missing columns error
        break;
      // ... other cases
    }
  }

  private handleGenericError(error: Error): void {
    console.error('Generic error:', error.message);
  }

  private handleUnknownError(error: unknown): void {
    console.error('Unknown error:', error);
  }
}
```

## Development Tools

### Type Checking Scripts

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "lint:types": "tsc --noEmit --strict"
  }
}
```

### Build-Time Type Validation

```typescript
// type-validation.ts
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

// Compile-time validation functions
export function validateColumns<T>(
  columns: ColumnDefinition[],
  sampleData: T
): asserts columns is ColumnDefinition[] {
  const dataKeys = Object.keys(sampleData as any);
  
  for (const column of columns) {
    if (!dataKeys.includes(column.field)) {
      throw new Error(`Column field '${column.field}' not found in data`);
    }
  }
}

export function validateConfig(config: GridConfig): asserts config is Required<GridConfig> {
  if (config.pagination && !config.paginationConfig) {
    throw new Error('Pagination config required when pagination is enabled');
  }
  
  if (config.grouping && !config.groupingConfig) {
    throw new Error('Grouping config required when grouping is enabled');
  }
}

// Usage
const columns: ColumnDefinition[] = [...];
const config: GridConfig = {...};
const sampleData = { id: 1, name: 'test' };

// These will throw compile-time errors if invalid
validateColumns(columns, sampleData);
validateConfig(config);
```

## Testing Types

Test your type definitions:

```typescript
// types.spec.ts
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

describe('Type Definitions', () => {
  it('should enforce column definition structure', () => {
    // Valid column definition
    const validColumn: ColumnDefinition = {
      id: 'test',
      field: 'test',
      header: 'Test'
    };

    expect(validColumn.id).toBe('test');
    expect(validColumn.field).toBe('test');
    expect(validColumn.header).toBe('Test');
  });

  it('should enforce grid config structure', () => {
    const config: GridConfig = {
      virtualScrolling: true,
      sortable: true
    };

    expect(config.virtualScrolling).toBe(true);
    expect(config.sortable).toBe(true);
  });

  // Type-only tests (these would fail compilation if types are wrong)
  it('should enforce type constraints', () => {
    // This should compile
    const stringColumn: ColumnDefinition = {
      id: 'name',
      field: 'name',
      header: 'Name',
      type: 'string'
    };

    // This should not compile if uncommented
    // const invalidColumn: ColumnDefinition = {
    //   id: 123, // Should be string
    //   field: 'name',
    //   header: 'Name'
    // };

    expect(stringColumn.type).toBe('string');
  });
});
```

## Migration from JavaScript

If you're migrating from JavaScript:

### Gradual Migration Strategy

```typescript
// Start with any types and gradually add specific types
interface LegacyData {
  [key: string]: any; // Start with any
}

// Gradually refine types
interface PartiallyTypedData {
  id: number;          // Known type
  name: string;        // Known type
  [key: string]: any;  // Unknown properties still any
}

// Final strongly typed interface
interface FullyTypedData {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}
```

### Type Assertion Helpers

```typescript
// Helper for safe type assertions
function asType<T>(value: any, validator: (val: any) => val is T): T {
  if (validator(value)) {
    return value;
  }
  throw new Error('Type assertion failed');
}

// Usage
const data = asType(rawData, isEmployee);
```

## Next Steps

With TypeScript properly configured:

1. **[Configuration Guide](./configuration.md)** - Learn all configuration options
2. **[Column Configuration](../features/column-configuration.md)** - Advanced column setup
3. **[Data Binding](../features/data-binding.md)** - Type-safe data binding
4. **[Custom Renderers](../cell-rendering/custom-renderers.md)** - Create type-safe custom renderers
5. **[Testing Guide](../guides/testing.md)** - Type-safe testing strategies

## TypeScript Examples

- [Strongly Typed Grid](https://stackblitz.com/edit/blg-grid-typescript)
- [Generic Components](https://stackblitz.com/edit/blg-grid-generic)
- [Custom Types](https://stackblitz.com/edit/blg-grid-custom-types)
- [Type Guards](https://stackblitz.com/edit/blg-grid-type-guards)
- [Utility Types](https://stackblitz.com/edit/blg-grid-utility-types)