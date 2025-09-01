# Sorting

BlgGrid provides powerful sorting capabilities that can handle both simple and complex sorting scenarios. This guide covers everything from basic column sorting to multi-column sorting, custom comparators, and server-side sorting.

## Overview

Sorting in BlgGrid is:
- **Fast**: Optimized algorithms handle large datasets efficiently
- **Flexible**: Support for custom comparators and multi-column sorting  
- **Intuitive**: Users can sort by clicking column headers
- **Accessible**: Full keyboard support and ARIA compliance
- **Server-friendly**: Support for server-side sorting

## Basic Sorting

### Enable Sorting

Sorting can be enabled globally or per-column:

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-sortable-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <ng-ui-lib
      [data]="data"
      [columns]="columns"
      [config]="config"
      (columnSort)="onSort($event)">
    </ng-ui-lib>
  `
})
export class SortableGridComponent {
  data = [
    { id: 1, name: 'John Doe', age: 30, department: 'Engineering', salary: 75000 },
    { id: 2, name: 'Jane Smith', age: 28, department: 'Marketing', salary: 65000 },
    { id: 3, name: 'Bob Johnson', age: 35, department: 'Engineering', salary: 85000 }
  ];

  columns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Name',
      sortable: true          // Enable sorting for this column
    },
    {
      id: 'age',
      field: 'age',
      header: 'Age',
      type: 'number',
      sortable: true
    },
    {
      id: 'department',
      field: 'department', 
      header: 'Department',
      sortable: true
    },
    {
      id: 'salary',
      field: 'salary',
      header: 'Salary',
      type: 'number',
      sortable: true
    }
  ];

  config: GridConfig = {
    sortable: true,           // Enable sorting globally
    multiColumnSort: false    // Single column sorting (default)
  };

  onSort(event: ColumnSortEvent) {
    console.log('Column sorted:', event.data);
  }
}
```

### Sort Indicators

BlgGrid automatically shows sort indicators in column headers:

```typescript
const config: GridConfig = {
  sortable: true,
  
  // Sort indicator options
  showSortIcons: true,        // Show sort arrows (default: true)
  sortIconsPosition: 'right', // 'left' | 'right'
  
  // Custom sort icons
  sortIcons: {
    unsorted: '⇅',
    ascending: '↑', 
    descending: '↓'
  }
};
```

## Data Types and Sorting

### Built-in Type Sorting

BlgGrid provides optimized sorting for different data types:

```typescript
const columns: ColumnDefinition[] = [
  // String sorting (case-insensitive by default)
  {
    id: 'name',
    field: 'name',
    header: 'Name',
    type: 'string',
    sortable: true
  },
  
  // Number sorting
  {
    id: 'age',
    field: 'age', 
    header: 'Age',
    type: 'number',
    sortable: true
  },
  
  // Date sorting
  {
    id: 'birthDate',
    field: 'birthDate',
    header: 'Birth Date',
    type: 'date',
    sortable: true
  },
  
  // Boolean sorting (false first, then true)
  {
    id: 'isActive',
    field: 'isActive',
    header: 'Active',
    type: 'boolean',
    sortable: true
  }
];
```

### Custom Comparators

Define custom sorting logic for specific columns:

```typescript
const columns: ColumnDefinition[] = [
  {
    id: 'name',
    field: 'name',
    header: 'Full Name',
    sortable: true,
    // Custom comparator for case-sensitive sorting
    comparator: (a: string, b: string) => {
      return a.localeCompare(b, undefined, { sensitivity: 'case' });
    }
  },
  
  {
    id: 'priority',
    field: 'priority',
    header: 'Priority',
    sortable: true,
    // Custom priority sorting: High > Medium > Low
    comparator: (a: string, b: string) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[a as keyof typeof priorityOrder] - 
             priorityOrder[b as keyof typeof priorityOrder];
    }
  },
  
  {
    id: 'tags',
    field: 'tags',
    header: 'Tags',
    sortable: true,
    // Sort by array length
    comparator: (a: string[], b: string[]) => {
      return a.length - b.length;
    }
  },
  
  {
    id: 'nested',
    field: 'user.profile.score',
    header: 'Score',
    sortable: true,
    // Sort nested properties safely
    comparator: (a: any, b: any, rowA: any, rowB: any) => {
      const scoreA = rowA.user?.profile?.score || 0;
      const scoreB = rowB.user?.profile?.score || 0;
      return scoreA - scoreB;
    }
  }
];
```

## Multi-Column Sorting

Enable sorting by multiple columns simultaneously:

```typescript
@Component({
  template: `
    <div class="sort-info">
      <p>Hold Ctrl/Cmd while clicking headers for multi-column sort</p>
      <div *ngIf="currentSort.length > 0">
        Current sort:
        <span *ngFor="let sort of currentSort; let i = index">
          {{sort.columnId}} {{sort.direction}}
          <span *ngIf="i < currentSort.length - 1">, </span>
        </span>
      </div>
    </div>
    
    <ng-ui-lib
      [data]="data"
      [columns]="columns"
      [config]="config"
      (columnSort)="onMultiSort($event)">
    </ng-ui-lib>
  `
})
export class MultiSortGridComponent {
  currentSort: Array<{columnId: string, direction: 'asc' | 'desc', order: number}> = [];

  config: GridConfig = {
    sortable: true,
    multiColumnSort: true,      // Enable multi-column sorting
    maxSortColumns: 3,          // Limit to 3 sort columns
    showSortOrder: true,        // Show sort order numbers
    sortOnHeaderClick: true     // Sort on header click
  };

  onMultiSort(event: ColumnSortEvent) {
    // Update current sort state
    this.currentSort = event.data.sortState || [];
    
    console.log('Multi-column sort state:', this.currentSort);
  }
}
```

### Programmatic Multi-Column Sorting

Set multiple sort columns programmatically:

```typescript
@Component({})
export class ProgrammaticSortComponent {
  @ViewChild(Grid) grid!: Grid;

  // Set initial sort state
  ngAfterViewInit() {
    this.grid.setSortModel([
      { columnId: 'department', direction: 'asc', order: 0 },
      { columnId: 'salary', direction: 'desc', order: 1 }
    ]);
  }

  // Apply custom sort combinations
  sortByDepartmentAndSalary() {
    this.grid.setSortModel([
      { columnId: 'department', direction: 'asc', order: 0 },
      { columnId: 'salary', direction: 'desc', order: 1 }
    ]);
  }

  sortByAgeAndName() {
    this.grid.setSortModel([
      { columnId: 'age', direction: 'desc', order: 0 },
      { columnId: 'name', direction: 'asc', order: 1 }
    ]);
  }

  clearSort() {
    this.grid.clearSort();
  }
}
```

## Advanced Sorting Features

### Case-Sensitive Sorting

Control case sensitivity in string sorting:

```typescript
const columns: ColumnDefinition[] = [
  {
    id: 'name',
    field: 'name',
    header: 'Name (Case Sensitive)',
    sortable: true,
    sortOptions: {
      caseSensitive: true,
      locale: 'en-US'
    }
  },
  {
    id: 'description',
    field: 'description',
    header: 'Description (Case Insensitive)',
    sortable: true,
    sortOptions: {
      caseSensitive: false,
      numeric: true,          // Natural numeric sorting
      ignorePunctuation: true // Ignore punctuation in sorting
    }
  }
];
```

### Natural Sorting

Enable natural sorting for strings containing numbers:

```typescript
// Natural sorting: "item2" comes before "item10"
const column: ColumnDefinition = {
  id: 'itemName',
  field: 'itemName',
  header: 'Item Name',
  sortable: true,
  sortOptions: {
    numeric: true,           // Enable natural numeric sorting
    localizeComparison: true // Use locale-specific comparison
  },
  // Or use custom natural sort comparator
  comparator: (a: string, b: string) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  }
};
```

### Null and Undefined Handling

Control how null and undefined values are sorted:

```typescript
const columns: ColumnDefinition[] = [
  {
    id: 'optionalField',
    field: 'optionalField',
    header: 'Optional Field',
    sortable: true,
    sortOptions: {
      nullsFirst: true,       // Put null values first
      undefinedHandling: 'last' // 'first' | 'last' | 'skip'
    },
    // Custom null handling
    comparator: (a: any, b: any) => {
      if (a == null && b == null) return 0;
      if (a == null) return -1; // null first
      if (b == null) return 1;
      return a.toString().localeCompare(b.toString());
    }
  }
];
```

## Server-Side Sorting

For large datasets, implement server-side sorting:

```typescript
@Component({})
export class ServerSideSortComponent {
  data = signal<any[]>([]);
  loading = signal(false);
  
  config: GridConfig = {
    sortable: true,
    serverSideSorting: true,   // Enable server-side sorting
    multiColumnSort: true
  };

  async onSort(event: ColumnSortEvent) {
    this.loading.set(true);
    
    try {
      const sortModel = event.data.sortState;
      const response = await this.dataService.loadSortedData({
        sort: sortModel,
        page: this.currentPage,
        pageSize: this.pageSize
      });
      
      this.data.set(response.data);
    } catch (error) {
      console.error('Sort error:', error);
    } finally {
      this.loading.set(false);
    }
  }
}

// Data service implementation
@Injectable()
export class DataService {
  async loadSortedData(params: {
    sort: Array<{columnId: string, direction: 'asc' | 'desc', order: number}>;
    page: number;
    pageSize: number;
  }) {
    // Convert sort model to server format
    const orderBy = params.sort
      .sort((a, b) => a.order - b.order)
      .map(s => `${s.columnId} ${s.direction.toUpperCase()}`)
      .join(', ');

    return this.http.get<{data: any[], totalCount: number}>('/api/data', {
      params: {
        orderBy,
        page: params.page.toString(),
        pageSize: params.pageSize.toString()
      }
    }).toPromise();
  }
}
```

## Custom Sort UI

Create custom sort controls:

```typescript
@Component({
  template: `
    <div class="custom-sort-controls">
      <h3>Sort Controls</h3>
      
      <div class="sort-column-selector">
        <label>Sort by:</label>
        <select [(ngModel)]="selectedSortColumn" (change)="updateSort()">
          <option value="">No Sort</option>
          <option *ngFor="let col of sortableColumns" [value]="col.id">
            {{col.header}}
          </option>
        </select>
        
        <select [(ngModel)]="sortDirection" (change)="updateSort()"
                [disabled]="!selectedSortColumn">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      
      <div class="multi-sort-builder">
        <h4>Multi-Column Sort</h4>
        <div *ngFor="let sort of sortModel; let i = index" class="sort-row">
          <span class="sort-order">{{i + 1}}.</span>
          <select [(ngModel)]="sort.columnId">
            <option *ngFor="let col of sortableColumns" [value]="col.id">
              {{col.header}}
            </option>
          </select>
          <select [(ngModel)]="sort.direction">
            <option value="asc">↑ Asc</option>
            <option value="desc">↓ Desc</option>
          </select>
          <button (click)="removeSortLevel(i)">Remove</button>
        </div>
        
        <button (click)="addSortLevel()" 
                [disabled]="sortModel.length >= maxSortColumns">
          Add Sort Level
        </button>
        
        <button (click)="applySortModel()">Apply Sort</button>
        <button (click)="clearAllSort()">Clear All</button>
      </div>
    </div>

    <ng-ui-lib
      [data]="data"
      [columns]="columns"
      [config]="config">
    </ng-ui-lib>
  `
})
export class CustomSortUIComponent {
  @ViewChild(Grid) grid!: Grid;
  
  selectedSortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  maxSortColumns = 3;
  
  sortModel: Array<{columnId: string, direction: 'asc' | 'desc', order: number}> = [];
  
  get sortableColumns() {
    return this.columns.filter(col => col.sortable);
  }

  updateSort() {
    if (!this.selectedSortColumn) {
      this.grid.clearSort();
      return;
    }

    this.grid.setSortModel([{
      columnId: this.selectedSortColumn,
      direction: this.sortDirection,
      order: 0
    }]);
  }

  addSortLevel() {
    if (this.sortModel.length < this.maxSortColumns) {
      this.sortModel.push({
        columnId: this.sortableColumns[0].id,
        direction: 'asc',
        order: this.sortModel.length
      });
    }
  }

  removeSortLevel(index: number) {
    this.sortModel.splice(index, 1);
    // Reorder remaining items
    this.sortModel.forEach((sort, i) => sort.order = i);
  }

  applySortModel() {
    this.grid.setSortModel([...this.sortModel]);
  }

  clearAllSort() {
    this.sortModel = [];
    this.selectedSortColumn = '';
    this.grid.clearSort();
  }
}
```

## Performance Optimization

### Efficient Sorting Algorithms

BlgGrid uses optimized sorting algorithms:

```typescript
// For large datasets, consider these optimizations
const performanceConfig: GridConfig = {
  sortable: true,
  
  // Performance options
  sortingAlgorithm: 'quicksort',    // 'quicksort' | 'mergesort' | 'heapsort'
  sortChunkSize: 10000,             // Sort in chunks for large datasets
  sortAsynchronously: true,         // Don't block UI during sorting
  sortDebounce: 300,                // Debounce sort operations
  
  // Memory optimization
  inMemorySort: false,              // Use disk-based sorting for huge datasets
  maxSortMemory: 100 * 1024 * 1024  // 100MB max memory for sorting
};
```

### Memoized Sorting

Implement caching for expensive sort operations:

```typescript
@Component({})
export class MemoizedSortComponent {
  private sortCache = new Map<string, any[]>();
  
  config: GridConfig = {
    sortable: true,
    // Enable sort result caching
    cacheSortResults: true,
    sortCacheSize: 10 // Keep last 10 sort results
  };

  onSort(event: ColumnSortEvent) {
    const sortKey = this.generateSortKey(event.data.sortState);
    
    // Check cache first
    if (this.sortCache.has(sortKey)) {
      console.log('Using cached sort result');
      return this.sortCache.get(sortKey);
    }
    
    // Perform sort and cache result
    const sortedData = this.performSort(event.data.sortState);
    this.sortCache.set(sortKey, sortedData);
    
    // Limit cache size
    if (this.sortCache.size > 10) {
      const firstKey = this.sortCache.keys().next().value;
      this.sortCache.delete(firstKey);
    }
    
    return sortedData;
  }

  private generateSortKey(sortState: any[]): string {
    return sortState
      .sort((a, b) => a.order - b.order)
      .map(s => `${s.columnId}:${s.direction}`)
      .join('|');
  }

  private performSort(sortState: any[]): any[] {
    // Implement efficient sorting logic
    return this.data.slice().sort((a, b) => {
      for (const sort of sortState.sort((x, y) => x.order - y.order)) {
        const aVal = this.getNestedValue(a, sort.columnId);
        const bVal = this.getNestedValue(b, sort.columnId);
        
        let result = this.compareValues(aVal, bVal);
        if (sort.direction === 'desc') result *= -1;
        
        if (result !== 0) return result;
      }
      return 0;
    });
  }
}
```

## Accessibility

Ensure sorting is accessible to all users:

```typescript
const accessibleConfig: GridConfig = {
  sortable: true,
  
  // Accessibility options
  announceSort: true,               // Announce sort changes to screen readers
  sortAnnouncementTemplate: 'Sorted by {{column}} in {{direction}} order',
  
  // Keyboard support
  keyboardSorting: true,            // Enable keyboard sorting
  sortKeyboardShortcuts: {
    sort: 'Space',                  // Space to sort
    reversSort: 'Shift+Space',      // Shift+Space to reverse sort
    clearSort: 'Ctrl+Space'         // Ctrl+Space to clear sort
  },
  
  // Visual indicators
  highContrastSortIcons: true,      // High contrast sort icons
  sortIconSize: 'large'             // 'small' | 'medium' | 'large'
};
```

## Testing Sorting

Test your sorting implementation:

```typescript
describe('Grid Sorting', () => {
  let component: SortableGridComponent;
  let fixture: ComponentFixture<SortableGridComponent>;
  let gridElement: HTMLElement;

  beforeEach(() => {
    // Setup component and fixture
  });

  it('should sort by single column', async () => {
    // Click header to sort
    const nameHeader = gridElement.querySelector('[data-column-id="name"]');
    nameHeader?.click();
    
    fixture.detectChanges();
    await fixture.whenStable();
    
    // Verify sort order
    const rows = gridElement.querySelectorAll('.ng-ui-lib-row');
    const firstRowName = rows[0].querySelector('[data-column="name"]')?.textContent;
    expect(firstRowName).toBe('Alice Johnson'); // First alphabetically
  });

  it('should handle multi-column sorting', async () => {
    // Set multi-column sort
    component.grid.setSortModel([
      { columnId: 'department', direction: 'asc', order: 0 },
      { columnId: 'salary', direction: 'desc', order: 1 }
    ]);
    
    fixture.detectChanges();
    await fixture.whenStable();
    
    // Verify multi-column sort result
    const sortedData = component.grid.getSortedData();
    expect(sortedData[0].department).toBe('Engineering');
    expect(sortedData[0].salary).toBeGreaterThan(sortedData[1].salary);
  });

  it('should use custom comparator', () => {
    const priorityComparator = jasmine.createSpy('comparator').and.returnValue(1);
    component.columns[0].comparator = priorityComparator;
    
    // Trigger sort
    component.grid.sortByColumn('priority', 'asc');
    
    expect(priorityComparator).toHaveBeenCalled();
  });
});
```

## Best Practices

### Do's
✅ **Use appropriate data types** for optimal sorting performance  
✅ **Implement custom comparators** for complex sorting logic  
✅ **Enable multi-column sorting** for advanced use cases  
✅ **Cache sort results** for expensive operations  
✅ **Use server-side sorting** for large datasets  
✅ **Provide clear visual indicators** for sort state  
✅ **Test sorting with edge cases** (nulls, empty strings, special characters)  
✅ **Consider accessibility** in sort UI design  

### Don'ts
❌ **Don't sort on every keystroke** - use debouncing  
❌ **Don't ignore null/undefined values** in comparators  
❌ **Don't use complex DOM manipulation** in sort indicators  
❌ **Don't forget to handle server errors** in server-side sorting  
❌ **Don't make sorting buttons too small** for touch interfaces  
❌ **Don't use client-side sorting** for very large datasets  

## Next Steps

- **[Filtering](./filtering.md)** - Learn about filtering capabilities
- **[Pagination](../pagination.md)** - Combine sorting with pagination
- **[Server-Side Features](../server-side-features.md)** - Advanced server integration
- **[Performance Guide](../../guides/performance.md)** - Optimize sorting performance

## Examples

- [Basic Sorting](https://stackblitz.com/edit/ng-ui-lib-sorting-basic)
- [Multi-Column Sorting](https://stackblitz.com/edit/ng-ui-lib-sorting-multi)
- [Custom Comparators](https://stackblitz.com/edit/ng-ui-lib-sorting-custom)
- [Server-Side Sorting](https://stackblitz.com/edit/ng-ui-lib-sorting-server)
- [Sort Performance Test](https://stackblitz.com/edit/ng-ui-lib-sorting-performance)
- [Custom Sort UI](https://stackblitz.com/edit/ng-ui-lib-sorting-ui)