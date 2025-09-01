# @bigledger/ng-ui-core

Core utilities, services, and interfaces for BigLedger Angular UI components.

## Overview

This package provides the foundational utilities, services, and TypeScript interfaces that power all BigLedger Angular UI components. It includes state management, data handling, utility functions, and common interfaces.

## Installation

```bash
# Configure npm for GitHub Packages
echo "@bigledger:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc

# Install the package
npm install @bigledger/ng-ui-core
```

## Features

- 🔧 **State Management**: Signal-based reactive state management
- 📊 **Data Services**: Data manipulation and processing utilities
- 🎯 **Type Safety**: Comprehensive TypeScript interfaces
- ⚡ **Performance**: Optimized utilities for large datasets
- 🔄 **Reactive**: Built on Angular Signals for optimal performance

## Key Exports

### Services

```typescript
import { 
  GridStateService,
  DataService,
  FilterService,
  SortService,
  ExportService
} from '@bigledger/ng-ui-core';
```

### Interfaces

```typescript
import {
  GridConfig,
  ColumnDefinition,
  DataSource,
  FilterModel,
  SortModel,
  SelectionModel
} from '@bigledger/ng-ui-core';
```

### Utilities

```typescript
import {
  createSignal,
  debounce,
  throttle,
  deepClone,
  formatValue,
  compareValues
} from '@bigledger/ng-ui-core';
```

## Usage Examples

### State Management

```typescript
import { Component, inject } from '@angular/core';
import { GridStateService } from '@bigledger/ng-ui-core';

@Component({
  selector: 'app-example',
  providers: [GridStateService]
})
export class ExampleComponent {
  private gridState = inject(GridStateService);
  
  ngOnInit() {
    // Initialize state
    this.gridState.setColumns([
      { field: 'id', header: 'ID' },
      { field: 'name', header: 'Name' }
    ]);
    
    // Subscribe to state changes
    this.gridState.filteredData.subscribe(data => {
      console.log('Filtered data:', data);
    });
  }
}
```

### Data Processing

```typescript
import { DataService } from '@bigledger/ng-ui-core';

@Component({
  providers: [DataService]
})
export class DataComponent {
  private dataService = inject(DataService);
  
  processData(data: any[]) {
    // Sort data
    const sorted = this.dataService.sortData(data, [
      { field: 'name', direction: 'asc' }
    ]);
    
    // Filter data
    const filtered = this.dataService.filterData(sorted, {
      field: 'status',
      operator: 'equals',
      value: 'active'
    });
    
    return filtered;
  }
}
```

### Custom Data Source

```typescript
import { DataSource } from '@bigledger/ng-ui-core';
import { Observable } from 'rxjs';

export class ServerDataSource implements DataSource {
  getData(params: DataSourceParams): Observable<DataResult> {
    return this.http.get<DataResult>('/api/data', {
      params: {
        page: params.page,
        size: params.pageSize,
        sort: params.sortModel,
        filter: params.filterModel
      }
    });
  }
}
```

## Core Interfaces

### GridConfig

```typescript
interface GridConfig {
  columns: ColumnDefinition[];
  data?: any[];
  dataSource?: DataSource;
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilteringConfig;
  selection?: SelectionConfig;
  virtualScrolling?: VirtualScrollConfig;
  performance?: PerformanceConfig;
}
```

### ColumnDefinition

```typescript
interface ColumnDefinition {
  field: string;
  header?: string;
  width?: number | string;
  type?: DataType;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  cellRenderer?: CellRenderer;
  valueFormatter?: ValueFormatter;
  comparator?: Comparator;
}
```

### DataSource

```typescript
interface DataSource {
  getData(params: DataSourceParams): Observable<DataResult>;
  getTotalCount?(): Observable<number>;
  destroy?(): void;
}
```

## State Management

The core package uses Angular Signals for reactive state management:

```typescript
// Grid state signals
readonly columns = signal<ColumnDefinition[]>([]);
readonly data = signal<any[]>([]);
readonly filteredData = computed(() => this.applyFilters(this.data()));
readonly sortedData = computed(() => this.applySorting(this.filteredData()));
readonly paginatedData = computed(() => this.applyPagination(this.sortedData()));
```

## Utilities

### Data Manipulation

```typescript
import { 
  sortData, 
  filterData, 
  groupData, 
  aggregateData 
} from '@bigledger/ng-ui-core';

// Sort data
const sorted = sortData(data, { field: 'name', direction: 'asc' });

// Filter data
const filtered = filterData(data, { field: 'age', operator: 'gt', value: 18 });

// Group data
const grouped = groupData(data, 'category');

// Aggregate data
const stats = aggregateData(data, 'amount', ['sum', 'avg', 'min', 'max']);
```

### Performance Utilities

```typescript
import { 
  debounce, 
  throttle, 
  memoize, 
  createTrackByFn 
} from '@bigledger/ng-ui-core';

// Debounced search
const debouncedSearch = debounce((term: string) => {
  this.search(term);
}, 300);

// Throttled scroll handler
const throttledScroll = throttle((event: Event) => {
  this.handleScroll(event);
}, 16);

// Memoized computation
const memoizedCalc = memoize((data: any[]) => {
  return expensiveCalculation(data);
});

// TrackBy function generator
const trackByFn = createTrackByFn<Item>('id');
```

### Value Formatting

```typescript
import { formatValue, parseValue } from '@bigledger/ng-ui-core';

// Format values for display
const formatted = formatValue(1234.56, {
  type: 'currency',
  currency: 'USD',
  locale: 'en-US'
});

// Parse string values
const parsed = parseValue('1,234.56', 'number');
```

## Type Definitions

### Events

```typescript
interface GridEvent {
  type: string;
  data?: any;
  source?: any;
}

interface CellEditEvent extends GridEvent {
  rowIndex: number;
  field: string;
  oldValue: any;
  newValue: any;
}

interface SelectionEvent extends GridEvent {
  selectedRows: any[];
  selectedData: any[];
}
```

### Configuration Types

```typescript
type SortDirection = 'asc' | 'desc';
type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
type SelectionMode = 'single' | 'multiple';
type DataType = 'text' | 'number' | 'date' | 'boolean' | 'currency';
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

### Peer Dependencies
- `@angular/core`: ^20.1.0
- `@angular/common`: ^20.1.0
- `rxjs`: ~7.8.0

## Development

```bash
# Running unit tests
nx test core

# Build the library
nx build core

# Lint the code
nx lint core
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

## Support

- 📖 [Documentation](../../docs/installation-guide.md)
- 🐛 [Issues](https://github.com/bigledger/blg-sdk-ng-ui-kit/issues)
- 💬 [Discussions](https://github.com/bigledger/blg-sdk-ng-ui-kit/discussions)
- 📧 support@bigledger.com
