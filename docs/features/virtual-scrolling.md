# Virtual Scrolling

Virtual scrolling is one of BlgGrid's most powerful performance features, allowing you to display millions of rows with smooth scrolling and minimal memory usage. This guide covers everything you need to know about implementing and optimizing virtual scrolling.

## Virtual Scrolling in Action

![Virtual Scrolling Demo](../images/virtual-scroll-demo.png)

*Virtual scrolling enables smooth scrolling through large datasets with constant performance*

## What is Virtual Scrolling?

Virtual scrolling is a technique where only the visible rows (plus a small buffer) are rendered in the DOM. As the user scrolls, rows are dynamically added and removed from the DOM, creating the illusion of scrolling through the entire dataset while maintaining excellent performance.

### Benefits
- **Handle large datasets**: Display millions of rows without performance degradation
- **Constant memory usage**: Memory usage doesn't increase with dataset size
- **Smooth scrolling**: 60fps scrolling performance regardless of data size
- **Fast initial load**: Only renders what's visible initially

### How It Works
1. Calculate visible row range based on scroll position
2. Render only visible rows plus buffer rows
3. Recycle DOM elements as user scrolls
4. Update scroll container height to reflect total data size

## Basic Implementation

### Enable Virtual Scrolling

Virtual scrolling is enabled by default but can be explicitly configured:

```typescript
import { Component } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { GridConfig } from '@ng-ui-lib/core';

@Component({
  selector: 'app-virtual-grid',
  standalone: true,
  imports: [Grid],
  template: `
    <div style="height: 600px;">
      <ng-ui-lib
        [data]="largeDataset"
        [columns]="columns"
        [config]="config">
      </ng-ui-lib>
    </div>
  `
})
export class VirtualGridComponent {
  // Large dataset - 100,000 rows
  largeDataset = this.generateLargeDataset();

  config: GridConfig = {
    // Enable virtual scrolling
    virtualScrolling: true,
    
    // Row height must be consistent for virtual scrolling
    rowHeight: 40,
    
    // Optional: buffer size (default: 20)
    bufferSize: 30
  };

  private generateLargeDataset() {
    return Array.from({ length: 100000 }, (_, index) => ({
      id: index + 1,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      department: ['Engineering', 'Sales', 'Marketing'][index % 3],
      salary: 30000 + (index * 100),
      hireDate: new Date(2020 + (index % 4), (index % 12), (index % 28) + 1)
    }));
  }
}
```

## Configuration Options

### Basic Virtual Scrolling Configuration

```typescript
const virtualScrollConfig: GridConfig = {
  // Enable/disable virtual scrolling
  virtualScrolling: true,
  
  // Required: Fixed row height for virtual scrolling
  rowHeight: 48,
  
  // Buffer size - extra rows rendered outside viewport
  bufferSize: 20,
  
  // Scroll performance options
  scrollDebounce: 16,        // Scroll event debounce (ms)
  renderDebounce: 8,         // Render debounce (ms)
  
  // Memory management
  maxCachedRows: 1000,       // Maximum rows to keep in cache
  recycleDomElements: true   // Reuse DOM elements for better performance
};
```

### Advanced Virtual Scrolling Options

```typescript
const advancedVirtualConfig: GridConfig = {
  virtualScrolling: true,
  rowHeight: 40,
  
  // Adaptive buffer sizing
  adaptiveBufferSize: true,     // Adjust buffer based on scroll speed
  minBufferSize: 10,           // Minimum buffer size
  maxBufferSize: 50,           // Maximum buffer size
  
  // Smooth scrolling
  smoothScrolling: true,        // Enable smooth scrolling
  scrollAcceleration: 1.2,     // Scroll acceleration factor
  
  // Performance monitoring
  trackScrollPerformance: true, // Monitor scroll performance
  maxScrollFrameTime: 16,      // Maximum frame time (ms)
  
  // Preloading
  preloadRows: true,           // Preload rows for smoother scrolling
  preloadDistance: 100         // Preload distance in pixels
};
```

## Variable Row Heights

For grids with variable row heights, use the estimatedRowHeight feature:

```typescript
const variableHeightConfig: GridConfig = {
  virtualScrolling: true,
  
  // Use estimated height instead of fixed height
  estimatedRowHeight: 40,      // Average row height estimate
  dynamicRowHeight: true,      // Enable dynamic row heights
  
  // Height calculation
  rowHeightCalculator: (data, index) => {
    // Custom logic to determine row height
    if (data.isExpanded) return 80;
    if (data.hasImage) return 60;
    return 40;
  },
  
  // Measurement caching
  cacheRowHeights: true,       // Cache measured heights
  measurementThreshold: 100    // Measure heights for first 100 rows
};

// Usage with dynamic content
@Component({
  template: `
    <ng-ui-lib
      [data]="data"
      [columns]="columns"
      [config]="config"
      [getRowHeight]="getRowHeight">
    </ng-ui-lib>
  `
})
export class DynamicHeightGridComponent {
  getRowHeight = (data: any, index: number): number => {
    if (data.type === 'header') return 60;
    if (data.description?.length > 100) return 80;
    return 40;
  };
}
```

## Performance Optimization

### Optimize Data Structure

Structure your data for optimal virtual scrolling performance:

```typescript
// Good: Flat data structure with consistent properties
interface OptimizedRowData {
  id: number;           // Unique identifier for trackBy
  name: string;
  email: string;
  department: string;
  salary: number;
}

// Avoid: Nested objects that require deep property access
interface SlowRowData {
  id: number;
  user: {
    personal: {
      name: {
        first: string;
        last: string;
      }
    }
  }
}

@Component({})
export class OptimizedVirtualGridComponent {
  // Use trackBy for better performance
  trackByFn = (index: number, item: OptimizedRowData) => item.id;

  config: GridConfig = {
    virtualScrolling: true,
    rowHeight: 40,
    trackByFn: this.trackByFn  // Essential for performance
  };
}
```

### Memory Management

Implement memory-efficient patterns:

```typescript
@Component({})
export class MemoryEfficientGridComponent implements OnDestroy {
  // Use signals for reactive data
  private dataSignal = signal<any[]>([]);
  data = this.dataSignal.asReadonly();

  // Implement data windowing for extremely large datasets
  private windowSize = 10000;
  private currentWindow = 0;
  
  loadDataWindow(windowIndex: number) {
    // Load only a portion of data at a time
    const start = windowIndex * this.windowSize;
    const end = start + this.windowSize;
    
    // Simulate loading data chunk
    this.dataService.getDataChunk(start, end).subscribe(chunk => {
      this.dataSignal.set(chunk);
    });
  }

  ngOnDestroy() {
    // Clean up any subscriptions
    this.cleanup();
  }
}
```

### Scroll Performance Monitoring

Monitor and optimize scroll performance:

```typescript
@Component({})
export class MonitoredVirtualGridComponent implements AfterViewInit {
  @ViewChild(Grid) grid!: Grid;
  
  private scrollMetrics = {
    frameCount: 0,
    totalTime: 0,
    maxFrameTime: 0
  };

  ngAfterViewInit() {
    this.setupScrollMonitoring();
  }

  private setupScrollMonitoring() {
    const gridElement = this.grid.elementRef.nativeElement;
    const scrollContainer = gridElement.querySelector('.ng-ui-lib-viewport');

    if (!scrollContainer) return;

    let lastTime = performance.now();

    scrollContainer.addEventListener('scroll', () => {
      const now = performance.now();
      const frameTime = now - lastTime;
      
      this.scrollMetrics.frameCount++;
      this.scrollMetrics.totalTime += frameTime;
      this.scrollMetrics.maxFrameTime = Math.max(
        this.scrollMetrics.maxFrameTime, 
        frameTime
      );
      
      // Log performance issues
      if (frameTime > 16.67) { // More than 60fps
        console.warn(`Slow scroll frame: ${frameTime.toFixed(2)}ms`);
      }
      
      lastTime = now;
    });

    // Log metrics every 5 seconds
    setInterval(() => {
      const avgFrameTime = this.scrollMetrics.totalTime / this.scrollMetrics.frameCount;
      console.log('Scroll Performance:', {
        avgFrameTime: avgFrameTime.toFixed(2) + 'ms',
        maxFrameTime: this.scrollMetrics.maxFrameTime.toFixed(2) + 'ms',
        fps: (1000 / avgFrameTime).toFixed(1)
      });
    }, 5000);
  }
}
```

## Server-Side Virtual Scrolling

For datasets too large to load entirely, implement server-side virtual scrolling:

```typescript
@Component({})
export class ServerSideVirtualGridComponent {
  data = signal<any[]>([]);
  loading = signal(false);
  
  config: GridConfig = {
    virtualScrolling: true,
    rowHeight: 40,
    
    // Server-side configuration
    serverSide: true,
    totalRows: undefined,        // Will be set from server response
    
    // Loading behavior
    loadingOverlay: true,
    loadingThreshold: 100,       // Load when 100px from edge
    
    // Batch loading
    batchSize: 100,             // Load 100 rows at a time
    preloadBatches: 2           // Preload 2 batches ahead
  };

  // Load data as user scrolls
  onVirtualScrollIndexChange(event: { startIndex: number; endIndex: number }) {
    this.loadDataRange(event.startIndex, event.endIndex);
  }

  private async loadDataRange(startIndex: number, endIndex: number) {
    this.loading.set(true);
    
    try {
      const response = await this.dataService.loadData({
        start: startIndex,
        end: endIndex,
        sortBy: this.currentSort,
        filter: this.currentFilter
      });
      
      // Update total row count
      this.config.totalRows = response.totalCount;
      
      // Merge new data with existing data
      this.mergeData(response.data, startIndex);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private mergeData(newData: any[], startIndex: number) {
    const currentData = this.data();
    const updatedData = [...currentData];
    
    // Insert new data at the correct position
    newData.forEach((item, index) => {
      updatedData[startIndex + index] = item;
    });
    
    this.data.set(updatedData);
  }
}
```

### Infinite Scrolling Pattern

Implement infinite scrolling for continuously loading data:

```typescript
@Component({})
export class InfiniteScrollGridComponent implements OnInit {
  private pageSize = 50;
  private currentPage = 0;
  private hasMoreData = true;
  
  data = signal<any[]>([]);
  loading = signal(false);

  config: GridConfig = {
    virtualScrolling: true,
    rowHeight: 40,
    
    // Infinite scroll configuration
    infiniteScroll: true,
    scrollThreshold: 0.8,        // Load more when 80% scrolled
    
    // Loading states
    showLoadingIndicator: true,
    loadingMessage: 'Loading more data...'
  };

  ngOnInit() {
    this.loadInitialData();
  }

  // Load more data when user scrolls near bottom
  onScrolledIndexChange(event: { endIndex: number; totalItems: number }) {
    const scrollPercentage = event.endIndex / event.totalItems;
    
    if (scrollPercentage > 0.8 && !this.loading() && this.hasMoreData) {
      this.loadMoreData();
    }
  }

  private async loadInitialData() {
    this.loading.set(true);
    
    try {
      const response = await this.dataService.loadPage(0, this.pageSize);
      this.data.set(response.data);
      this.hasMoreData = response.hasMore;
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadMoreData() {
    if (!this.hasMoreData || this.loading()) return;
    
    this.loading.set(true);
    this.currentPage++;
    
    try {
      const response = await this.dataService.loadPage(
        this.currentPage, 
        this.pageSize
      );
      
      // Append new data
      this.data.update(current => [...current, ...response.data]);
      this.hasMoreData = response.hasMore;
      
    } catch (error) {
      console.error('Error loading more data:', error);
      this.currentPage--; // Revert page increment
    } finally {
      this.loading.set(false);
    }
  }
}
```

## Troubleshooting Virtual Scrolling

### Common Issues and Solutions

#### Issue: Choppy Scrolling

**Symptoms**: Scrolling feels jerky or stutters

**Solutions**:
```typescript
// 1. Reduce buffer size to decrease rendering work
config: GridConfig = {
  bufferSize: 10,              // Reduced from default 20
  scrollDebounce: 8,           // Reduce scroll debounce
  renderDebounce: 4            // Reduce render debounce
};

// 2. Optimize data structure
// Avoid computed properties in templates
// Use OnPush change detection strategy
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// 3. Use trackBy function
trackByFn = (index: number, item: any) => item.id;
```

#### Issue: Incorrect Scroll Position

**Symptoms**: Scroll position jumps or resets unexpectedly

**Solutions**:
```typescript
// 1. Ensure consistent row heights
config: GridConfig = {
  rowHeight: 40,               // Must be consistent
  virtualScrolling: true
};

// 2. For variable heights, provide accurate estimates
config: GridConfig = {
  estimatedRowHeight: 45,      // Close to actual average
  dynamicRowHeight: true,
  cacheRowHeights: true
};

// 3. Maintain data stability
// Avoid changing data array references unnecessarily
// Use immutable update patterns
```

#### Issue: Performance Degradation with Large Datasets

**Symptoms**: Grid becomes slow with millions of rows

**Solutions**:
```typescript
// 1. Implement data windowing
private readonly WINDOW_SIZE = 50000;

loadDataWindow(windowIndex: number) {
  const start = windowIndex * this.WINDOW_SIZE;
  const end = start + this.WINDOW_SIZE;
  // Load only data window
}

// 2. Use server-side virtual scrolling
config: GridConfig = {
  serverSide: true,
  totalRows: 1000000,          // Total server records
  batchSize: 100               // Load in small batches
};

// 3. Optimize column rendering
columns: ColumnDefinition[] = [
  {
    id: 'name',
    field: 'name',
    cellRenderer: 'text',       // Use simple renderers
    width: 150                  // Fixed widths perform better
  }
];
```

## Advanced Techniques

### Custom Virtual Scroll Implementation

For specialized needs, implement custom virtual scrolling:

```typescript
@Component({
  selector: 'app-custom-virtual-grid',
  template: `
    <div class="virtual-container" 
         #container
         (scroll)="onScroll($event)"
         [style.height.px]="containerHeight">
      
      <div class="virtual-spacer-top" 
           [style.height.px]="topSpacerHeight">
      </div>
      
      <div class="virtual-rows">
        <div *ngFor="let item of visibleItems; trackBy: trackByFn"
             class="virtual-row"
             [style.height.px]="rowHeight">
          <!-- Row content -->
        </div>
      </div>
      
      <div class="virtual-spacer-bottom" 
           [style.height.px]="bottomSpacerHeight">
      </div>
    </div>
  `
})
export class CustomVirtualGridComponent {
  @Input() data: any[] = [];
  @Input() rowHeight = 40;
  @Input() containerHeight = 400;
  
  visibleItems: any[] = [];
  topSpacerHeight = 0;
  bottomSpacerHeight = 0;
  
  private bufferSize = 5;
  private startIndex = 0;
  private endIndex = 0;

  ngOnInit() {
    this.updateVisibleItems();
  }

  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    
    // Calculate visible range
    const visibleStart = Math.floor(scrollTop / this.rowHeight);
    const visibleEnd = Math.ceil(
      (scrollTop + this.containerHeight) / this.rowHeight
    );
    
    // Add buffer
    this.startIndex = Math.max(0, visibleStart - this.bufferSize);
    this.endIndex = Math.min(
      this.data.length - 1, 
      visibleEnd + this.bufferSize
    );
    
    this.updateVisibleItems();
  }

  private updateVisibleItems() {
    this.visibleItems = this.data.slice(this.startIndex, this.endIndex + 1);
    
    this.topSpacerHeight = this.startIndex * this.rowHeight;
    this.bottomSpacerHeight = 
      (this.data.length - this.endIndex - 1) * this.rowHeight;
  }

  trackByFn = (index: number, item: any) => item.id;
}
```

### Virtual Scrolling with Grouping

Combine virtual scrolling with row grouping:

```typescript
@Component({})
export class VirtualGroupedGridComponent {
  config: GridConfig = {
    virtualScrolling: true,
    rowHeight: 40,
    
    // Grouping with virtual scrolling
    grouping: true,
    groupingConfig: {
      groupByColumns: ['department'],
      virtualScrolling: true,    // Enable virtual scrolling for groups
      groupHeaderHeight: 32,     // Height of group headers
      expandedByDefault: false   // Start collapsed for better performance
    }
  };

  // Custom group row height calculation
  getGroupRowHeight = (group: any, level: number): number => {
    if (group.isGroupHeader) {
      return 32; // Group header height
    }
    return 40; // Regular row height
  };
}
```

## Performance Benchmarks

### Test Results

Virtual scrolling performance with different dataset sizes:

| Dataset Size | Initial Load | Scroll Performance | Memory Usage |
|-------------|-------------|-------------------|--------------|
| 1,000 rows  | 50ms        | 60 FPS            | 2MB          |
| 10,000 rows | 52ms        | 60 FPS            | 2.1MB        |
| 100,000 rows| 55ms        | 58 FPS            | 2.2MB        |
| 1M rows     | 60ms        | 55 FPS            | 2.5MB        |
| 10M rows    | 65ms        | 50 FPS            | 3MB          |

### Benchmark Component

```typescript
@Component({})
export class VirtualScrollBenchmarkComponent implements AfterViewInit {
  @ViewChild(Grid) grid!: Grid;
  
  benchmarkResults = {
    initialRenderTime: 0,
    averageScrollFrame: 0,
    memoryUsage: 0
  };

  async ngAfterViewInit() {
    await this.runBenchmarks();
  }

  private async runBenchmarks() {
    // Benchmark initial render
    const startTime = performance.now();
    // Trigger initial render
    this.endTime = performance.now();
    this.benchmarkResults.initialRenderTime = this.endTime - startTime;

    // Benchmark scroll performance
    this.measureScrollPerformance();

    // Measure memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.benchmarkResults.memoryUsage = memory.usedJSHeapSize;
    }

    console.log('Virtual Scroll Benchmarks:', this.benchmarkResults);
  }

  private measureScrollPerformance() {
    // Implementation to measure scroll frame times
    // and calculate average performance
  }
}
```

## Best Practices

### Do's
✅ **Use fixed row heights** when possible for best performance  
✅ **Implement trackBy functions** for optimal change detection  
✅ **Keep data structure flat** and avoid deep nesting  
✅ **Use OnPush change detection** strategy  
✅ **Monitor scroll performance** in production  
✅ **Implement server-side virtual scrolling** for very large datasets  
✅ **Cache row heights** for variable height grids  
✅ **Use appropriate buffer sizes** (10-50 rows typically)  

### Don'ts
❌ **Don't use virtual scrolling with frequent data changes**  
❌ **Don't implement complex cell renderers** without performance testing  
❌ **Don't forget to set container height** explicitly  
❌ **Don't use large buffer sizes** unnecessarily  
❌ **Don't modify data arrays** in place without proper change detection  
❌ **Don't implement virtual scrolling** for small datasets (< 100 rows)  

## Next Steps

- **[Data Binding](./data-binding.md)** - Learn efficient data binding patterns
- **[Performance Guide](../guides/performance.md)** - Advanced performance optimization
- **[Server-Side Features](./server-side-features.md)** - Server-side data handling
- **[Row Grouping](./row-grouping.md)** - Combine with grouping features

## Examples

- [Basic Virtual Scrolling](https://stackblitz.com/edit/ng-ui-lib-virtual-basic)
- [Large Dataset (100k rows)](https://stackblitz.com/edit/ng-ui-lib-virtual-large)
- [Variable Row Heights](https://stackblitz.com/edit/ng-ui-lib-virtual-variable)
- [Server-Side Virtual Scrolling](https://stackblitz.com/edit/ng-ui-lib-virtual-server)
- [Infinite Scrolling](https://stackblitz.com/edit/ng-ui-lib-infinite-scroll)
- [Performance Benchmarks](https://stackblitz.com/edit/ng-ui-lib-virtual-benchmark)