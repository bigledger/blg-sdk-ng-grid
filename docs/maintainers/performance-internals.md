# Performance Internals

**Audience: Library Maintainers and Core Contributors**

This document provides deep insights into the performance architecture, optimization strategies, and implementation details that make BLG Grid performant with large datasets. Understanding these internals is crucial for maintaining and improving the library's performance characteristics.

## Table of Contents

- [Performance Architecture Overview](#performance-architecture-overview)
- [Virtual Scrolling Implementation](#virtual-scrolling-implementation)
- [Change Detection Optimization](#change-detection-optimization)
- [Memory Management](#memory-management)
- [Data Processing Performance](#data-processing-performance)
- [Rendering Pipeline](#rendering-pipeline)
- [Caching Strategies](#caching-strategies)
- [Performance Monitoring](#performance-monitoring)
- [Benchmarking and Profiling](#benchmarking-and-profiling)
- [Performance Regression Prevention](#performance-regression-prevention)

## Performance Architecture Overview

The BLG Grid library is designed with performance as a primary concern, capable of handling datasets with 100,000+ rows while maintaining smooth user interactions. The performance architecture is built on several key principles:

### Core Performance Principles

1. **Minimize DOM Operations**: Reduce expensive DOM manipulations through virtualization
2. **Optimize Change Detection**: Use OnPush strategy and signals for minimal CD cycles
3. **Efficient Data Processing**: Leverage memoization and incremental updates
4. **Memory Management**: Implement object pooling and strategic garbage collection
5. **Lazy Evaluation**: Compute values only when needed
6. **Batch Operations**: Group related updates to minimize reflows

### Performance Metrics Targets

```typescript
// Performance targets for different dataset sizes
export const PERFORMANCE_TARGETS = {
  small: {
    dataSize: '< 1,000 rows',
    initialRender: '< 100ms',
    scrolling: '60 FPS',
    sorting: '< 50ms',
    filtering: '< 30ms'
  },
  medium: {
    dataSize: '1,000 - 10,000 rows',
    initialRender: '< 200ms',
    scrolling: '60 FPS',
    sorting: '< 100ms',
    filtering: '< 80ms'
  },
  large: {
    dataSize: '10,000 - 100,000 rows',
    initialRender: '< 500ms',
    scrolling: '60 FPS',
    sorting: '< 300ms',
    filtering: '< 200ms'
  },
  extraLarge: {
    dataSize: '> 100,000 rows',
    initialRender: '< 1000ms',
    scrolling: '60 FPS',
    sorting: '< 800ms (with chunking)',
    filtering: '< 500ms (with chunking)'
  }
};
```

## Virtual Scrolling Implementation

### Core Virtual Scrolling Architecture

```typescript
// High-performance virtual scrolling implementation
@Component({
  selector: 'blg-virtual-scroll',
  template: `
    <div 
      class="blg-virtual-viewport"
      #viewport
      [style.height.px]="viewportHeight"
      (scroll)="onScroll($event)">
      
      <!-- Virtual spacer for total height -->
      <div 
        class="blg-virtual-spacer"
        [style.height.px]="totalHeight">
        
        <!-- Rendered items container -->
        <div 
          class="blg-virtual-content"
          [style.transform]="contentTransform">
          
          <div 
            *ngFor="let item of visibleItems; trackBy: trackByFunction"
            class="blg-virtual-item"
            [style.height.px]="itemHeight">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlgVirtualScrollComponent implements OnInit, OnDestroy {
  // Configuration
  @Input() items: any[] = [];
  @Input() itemHeight = 40;
  @Input() viewportHeight = 400;
  @Input() bufferSize = 5;
  @Input() trackByFunction: TrackByFunction<any> = (index) => index;
  
  // Performance state
  private scrollTop = 0;
  private lastScrollTime = 0;
  private animationFrameId: number | null = null;
  private isScrolling = false;
  
  // Virtual scrolling calculations
  readonly totalHeight = computed(() => this.items.length * this.itemHeight);
  readonly visibleItemCount = computed(() => 
    Math.ceil(this.viewportHeight / this.itemHeight)
  );
  
  readonly startIndex = computed(() => {
    const index = Math.floor(this.scrollTop / this.itemHeight);
    return Math.max(0, index - this.bufferSize);
  });
  
  readonly endIndex = computed(() => {
    const start = this.startIndex();
    const visible = this.visibleItemCount();
    return Math.min(this.items.length, start + visible + (this.bufferSize * 2));
  });
  
  readonly visibleItems = computed(() => {
    const start = this.startIndex();
    const end = this.endIndex();
    return this.items.slice(start, end);
  });
  
  readonly contentTransform = computed(() => 
    `translateY(${this.startIndex() * this.itemHeight}px)`
  );
  
  // Optimized scroll handler
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const currentScrollTop = target.scrollTop;
    
    // Throttle scroll events using RAF
    if (this.animationFrameId) {
      return; // Skip if already scheduled
    }
    
    this.animationFrameId = requestAnimationFrame(() => {
      this.scrollTop = currentScrollTop;
      this.lastScrollTime = performance.now();
      this.animationFrameId = null;
      
      // Mark for change detection only if visible items changed
      const newStartIndex = Math.floor(currentScrollTop / this.itemHeight);
      if (Math.abs(newStartIndex - this.startIndex()) >= 1) {
        this.changeDetectorRef.markForCheck();
      }
    });
  }
  
  // Performance optimizations
  ngOnInit(): void {
    // Pre-calculate common values
    this.preCalculateItemPositions();
    
    // Set up resize observer for viewport changes
    this.setupResizeObserver();
  }
  
  private preCalculateItemPositions(): void {
    // Pre-calculate item positions for smooth scrolling
    this.itemPositions = new Array(this.items.length);
    for (let i = 0; i < this.items.length; i++) {
      this.itemPositions[i] = i * this.itemHeight;
    }
  }
  
  // Memory cleanup
  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.resizeObserver?.disconnect();
  }
}
```

### Variable Height Virtual Scrolling

```typescript
// Advanced virtual scrolling with variable item heights
export class VariableHeightVirtualScrollComponent {
  private itemHeights = new Map<number, number>();
  private measuredItems = new Set<number>();
  private totalHeightCache = 0;
  private itemPositionCache = new Map<number, number>();
  
  // Dynamic height calculation
  calculateItemHeight(index: number, element?: HTMLElement): number {
    if (this.itemHeights.has(index)) {
      return this.itemHeights.get(index)!;
    }
    
    if (element) {
      // Measure actual height
      const height = element.offsetHeight;
      this.itemHeights.set(index, height);
      this.measuredItems.add(index);
      
      // Invalidate caches
      this.invalidateHeightCache(index);
      
      return height;
    }
    
    // Return estimated height
    return this.estimatedItemHeight;
  }
  
  // Efficient position calculations
  getItemPosition(index: number): number {
    if (this.itemPositionCache.has(index)) {
      return this.itemPositionCache.get(index)!;
    }
    
    let position = 0;
    for (let i = 0; i < index; i++) {
      position += this.getItemHeight(i);
    }
    
    this.itemPositionCache.set(index, position);
    return position;
  }
  
  // Binary search for visible items
  findVisibleRange(scrollTop: number, viewportHeight: number): [number, number] {
    const itemCount = this.items.length;
    
    // Binary search for start index
    let start = 0;
    let end = itemCount - 1;
    
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const position = this.getItemPosition(mid);
      
      if (position < scrollTop) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
    
    const startIndex = Math.max(0, start - this.bufferSize);
    
    // Find end index
    let endIndex = startIndex;
    let currentHeight = 0;
    
    while (endIndex < itemCount && currentHeight < viewportHeight + (this.bufferSize * 50)) {
      currentHeight += this.getItemHeight(endIndex);
      endIndex++;
    }
    
    return [startIndex, Math.min(itemCount, endIndex + this.bufferSize)];
  }
}
```

## Change Detection Optimization

### OnPush Change Detection Strategy

```typescript
// Optimized component with OnPush strategy
@Component({
  selector: 'blg-grid-row',
  template: `
    <div 
      class="blg-grid-row"
      [class.selected]="isSelected"
      [class.even]="isEven"
      [class.odd]="!isEven">
      
      <blg-grid-cell
        *ngFor="let column of columns; trackBy: trackByColumnId"
        [data]="data"
        [column]="column"
        [value]="getCellValue(column)"
        [selected]="isSelected"
        (valueChange)="onCellValueChange($event, column)">
      </blg-grid-cell>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlgGridRowComponent {
  @Input() data: any;
  @Input() columns: ColumnDefinition[] = [];
  @Input() index: number = 0;
  @Input() isSelected: boolean = false;
  
  // Computed properties for performance
  readonly isEven = computed(() => this.index % 2 === 0);
  
  // Optimized track by function
  trackByColumnId = (index: number, column: ColumnDefinition): string => column.id;
  
  // Memoized cell value getter
  private cellValueCache = new Map<string, any>();
  
  getCellValue(column: ColumnDefinition): any {
    const cacheKey = `${column.id}-${this.dataVersion}`;
    
    if (this.cellValueCache.has(cacheKey)) {
      return this.cellValueCache.get(cacheKey);
    }
    
    const value = this.data?.[column.field];
    this.cellValueCache.set(cacheKey, value);
    
    return value;
  }
  
  // Minimize change detection triggers
  onCellValueChange(newValue: any, column: ColumnDefinition): void {
    // Only update if value actually changed
    const currentValue = this.getCellValue(column);
    if (currentValue !== newValue) {
      this.cellValueChanged.emit({ column, value: newValue, oldValue: currentValue });
      
      // Update cache
      this.cellValueCache.set(`${column.id}-${this.dataVersion}`, newValue);
    }
  }
  
  // Lifecycle optimization
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      // Clear cache when data changes
      this.cellValueCache.clear();
      this.dataVersion++;
    }
  }
}
```

### Signal-Based Change Detection

```typescript
// Leveraging Angular Signals for minimal change detection
@Component({
  selector: 'blg-optimized-grid',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlgOptimizedGridComponent {
  // Input signals eliminate unnecessary change detection
  data = input.required<any[]>();
  columns = input.required<ColumnDefinition[]>();
  
  // Computed values only recalculate when dependencies change
  readonly processedData = computed(() => {
    const rawData = this.data();
    const sortDescriptors = this.sortState();
    const filterDescriptors = this.filterState();
    
    // Complex data processing only runs when inputs change
    return this.dataProcessor.process(rawData, {
      sorts: sortDescriptors,
      filters: filterDescriptors
    });
  });
  
  // Pagination computed separately to avoid reprocessing data
  readonly paginatedData = computed(() => {
    const processed = this.processedData();
    const pagination = this.paginationState();
    
    const startIndex = pagination.currentPage * pagination.pageSize;
    return processed.slice(startIndex, startIndex + pagination.pageSize);
  });
  
  // Virtual scroll range computed independently
  readonly visibleRows = computed(() => {
    const paginated = this.paginatedData();
    const virtualRange = this.virtualScrollState();
    
    return paginated.slice(virtualRange.startIndex, virtualRange.endIndex);
  });
  
  constructor() {
    // Use effect for side effects that shouldn't trigger rendering
    effect(() => {
      const dataLength = this.processedData().length;
      this.updatePaginationTotal(dataLength);
    }, { allowSignalWrites: true });
  }
}
```

## Memory Management

### Object Pooling

```typescript
// Object pooling for frequently created/destroyed objects
export class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  
  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    private maxSize = 100
  ) {}
  
  acquire(): T {
    let obj: T;
    
    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }
    
    this.inUse.add(obj);
    return obj;
  }
  
  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
      
      if (this.available.length < this.maxSize) {
        this.available.push(obj);
      }
    }
  }
  
  clear(): void {
    this.available.length = 0;
    this.inUse.clear();
  }
}

// Usage in grid components
@Injectable()
export class RowRenderingService {
  private rowViewModelPool = new ObjectPool(
    () => ({ cells: [], metadata: {} }),
    (obj) => { obj.cells.length = 0; Object.keys(obj.metadata).forEach(k => delete obj.metadata[k]); }
  );
  
  private cellViewModelPool = new ObjectPool(
    () => ({ value: null, formatted: '', classes: [] }),
    (obj) => { obj.value = null; obj.formatted = ''; obj.classes.length = 0; }
  );
  
  createRowViewModel(data: any, columns: ColumnDefinition[]): RowViewModel {
    const row = this.rowViewModelPool.acquire();
    
    // Populate row with pooled cell objects
    row.cells = columns.map(column => {
      const cell = this.cellViewModelPool.acquire();
      cell.value = data[column.field];
      cell.formatted = this.formatCellValue(cell.value, column);
      return cell;
    });
    
    return row;
  }
  
  releaseRowViewModel(row: RowViewModel): void {
    // Release cell objects back to pool
    row.cells.forEach(cell => this.cellViewModelPool.release(cell));
    
    // Release row object back to pool
    this.rowViewModelPool.release(row);
  }
}
```

### Memory Leak Prevention

```typescript
// Comprehensive memory leak prevention
@Component({})
export class BlgGridComponent implements OnDestroy {
  private subscriptions = new Set<Subscription>();
  private intervals = new Set<number>();
  private timeouts = new Set<number>();
  private observers = new Set<ResizeObserver | IntersectionObserver>();
  private eventListeners = new Map<EventTarget, Map<string, EventListener>>();
  
  // Safe subscription management
  protected addSubscription(subscription: Subscription): void {
    this.subscriptions.add(subscription);
  }
  
  // Safe interval/timeout management
  protected setInterval(callback: () => void, ms: number): number {
    const id = window.setInterval(callback, ms);
    this.intervals.add(id);
    return id;
  }
  
  protected setTimeout(callback: () => void, ms: number): number {
    const id = window.setTimeout(callback, ms);
    this.timeouts.add(id);
    return id;
  }
  
  // Safe event listener management
  protected addEventListener(
    target: EventTarget, 
    type: string, 
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(type, listener, options);
    
    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, new Map());
    }
    
    this.eventListeners.get(target)!.set(type, listener);
  }
  
  // Comprehensive cleanup
  ngOnDestroy(): void {
    // Unsubscribe from all observables
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
    
    // Clear intervals and timeouts
    this.intervals.forEach(id => clearInterval(id));
    this.timeouts.forEach(id => clearTimeout(id));
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    
    // Remove event listeners
    this.eventListeners.forEach((listeners, target) => {
      listeners.forEach((listener, type) => {
        target.removeEventListener(type, listener);
      });
    });
    
    // Clear collections
    this.intervals.clear();
    this.timeouts.clear();
    this.observers.clear();
    this.eventListeners.clear();
  }
}
```

## Data Processing Performance

### Optimized Sorting Implementation

```typescript
// High-performance sorting with multiple optimizations
export class OptimizedSortingService {
  private sortCache = new Map<string, any[]>();
  private sortComparators = new Map<string, (a: any, b: any) => number>();
  
  // Multi-threaded sorting for large datasets
  async sortLargeDataset<T>(
    data: T[], 
    descriptors: SortDescriptor[]
  ): Promise<T[]> {
    const cacheKey = this.generateSortCacheKey(data, descriptors);
    
    if (this.sortCache.has(cacheKey)) {
      return this.sortCache.get(cacheKey)!;
    }
    
    if (data.length > 10000) {
      // Use web workers for large datasets
      return this.sortWithWebWorker(data, descriptors);
    } else {
      // Use optimized in-memory sorting
      return this.sortInMemory(data, descriptors);
    }
  }
  
  private sortInMemory<T>(data: T[], descriptors: SortDescriptor[]): T[] {
    // Create composite comparator
    const comparator = this.createCompositeComparator(descriptors);
    
    // Use TimSort (stable sort) for better performance on partially sorted data
    return this.timSort(data.slice(), comparator);
  }
  
  private createCompositeComparator(descriptors: SortDescriptor[]): (a: any, b: any) => number {
    const cacheKey = descriptors.map(d => `${d.columnId}:${d.direction}`).join('|');
    
    if (this.sortComparators.has(cacheKey)) {
      return this.sortComparators.get(cacheKey)!;
    }
    
    const comparator = (a: any, b: any): number => {
      for (const descriptor of descriptors) {
        const aValue = a[descriptor.columnId];
        const bValue = b[descriptor.columnId];
        
        let result = this.compareValues(aValue, bValue);
        
        if (result !== 0) {
          return descriptor.direction === 'desc' ? -result : result;
        }
      }
      return 0;
    };
    
    this.sortComparators.set(cacheKey, comparator);
    return comparator;
  }
  
  // Optimized value comparison
  private compareValues(a: any, b: any): number {
    // Handle null/undefined
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    
    // Type-specific optimized comparisons
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }
    
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }
    
    // Fallback to string comparison
    return String(a).localeCompare(String(b));
  }
  
  // TimSort implementation for stable sorting
  private timSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
    // Simplified TimSort implementation
    // In practice, would use optimized library or native sort
    return arr.sort(compareFn);
  }
  
  // Web Worker sorting for very large datasets
  private async sortWithWebWorker<T>(
    data: T[], 
    descriptors: SortDescriptor[]
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./sort-worker.js');
      
      worker.postMessage({ data, descriptors });
      
      worker.onmessage = (event) => {
        resolve(event.data.sortedData);
        worker.terminate();
      };
      
      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
      
      // Timeout after 30 seconds
      setTimeout(() => {
        worker.terminate();
        reject(new Error('Sort operation timed out'));
      }, 30000);
    });
  }
}
```

### Optimized Filtering Implementation

```typescript
// High-performance filtering with indexing and caching
export class OptimizedFilteringService {
  private filterCache = new Map<string, any[]>();
  private searchIndexes = new Map<string, SearchIndex>();
  
  // Pre-built search indexes for common fields
  buildSearchIndex(data: any[], field: string): void {
    const index = new Map<string, number[]>();
    
    data.forEach((item, rowIndex) => {
      const value = String(item[field] || '').toLowerCase();
      
      // Index by words for text search
      const words = value.split(/\s+/);
      words.forEach(word => {
        if (!index.has(word)) {
          index.set(word, []);
        }
        index.get(word)!.push(rowIndex);
      });
      
      // Also index complete value
      if (!index.has(value)) {
        index.set(value, []);
      }
      index.get(value)!.push(rowIndex);
    });
    
    this.searchIndexes.set(field, { index, lastUpdated: Date.now() });
  }
  
  // Optimized filtering with multiple strategies
  filterData<T>(data: T[], descriptors: FilterDescriptor[]): T[] {
    const cacheKey = this.generateFilterCacheKey(data, descriptors);
    
    if (this.filterCache.has(cacheKey)) {
      return this.filterCache.get(cacheKey)!;
    }
    
    let result = data;
    
    for (const descriptor of descriptors) {
      if (this.canUseIndex(descriptor)) {
        result = this.filterWithIndex(result, descriptor);
      } else {
        result = this.filterLinear(result, descriptor);
      }
    }
    
    this.filterCache.set(cacheKey, result);
    return result;
  }
  
  private filterWithIndex<T>(data: T[], descriptor: FilterDescriptor): T[] {
    const index = this.searchIndexes.get(descriptor.columnId);
    if (!index) {
      return this.filterLinear(data, descriptor);
    }
    
    const matchingRowIndexes = this.findMatchingIndexes(
      index.index, 
      descriptor.value, 
      descriptor.operator
    );
    
    // Map row indexes back to actual data
    return matchingRowIndexes.map(index => data[index]).filter(Boolean);
  }
  
  private filterLinear<T>(data: T[], descriptor: FilterDescriptor): T[] {
    const predicate = this.createFilterPredicate(descriptor);
    return data.filter(predicate);
  }
  
  // Optimized predicate creation
  private createFilterPredicate(descriptor: FilterDescriptor): (item: any) => boolean {
    const { columnId, operator, value } = descriptor;
    
    // Pre-compile regex for text operations
    if (operator === 'contains' && typeof value === 'string') {
      const regex = new RegExp(this.escapeRegex(value), 'i');
      return (item: any) => regex.test(String(item[columnId] || ''));
    }
    
    if (operator === 'startsWith' && typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      return (item: any) => String(item[columnId] || '').toLowerCase().startsWith(lowerValue);
    }
    
    // Numeric comparisons
    if (typeof value === 'number') {
      switch (operator) {
        case 'equals':
          return (item: any) => Number(item[columnId]) === value;
        case 'greaterThan':
          return (item: any) => Number(item[columnId]) > value;
        case 'lessThan':
          return (item: any) => Number(item[columnId]) < value;
        // ... other operators
      }
    }
    
    // Fallback to general comparison
    return (item: any) => this.compareWithOperator(item[columnId], operator, value);
  }
}
```

## Rendering Pipeline

### Optimized Rendering Strategy

```typescript
// Batched DOM updates for smooth performance
@Injectable()
export class RenderingOptimizer {
  private pendingUpdates = new Set<() => void>();
  private rafId: number | null = null;
  
  // Batch DOM updates
  scheduleUpdate(updateFn: () => void): void {
    this.pendingUpdates.add(updateFn);
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.flushUpdates();
      });
    }
  }
  
  private flushUpdates(): void {
    // Execute all pending updates in a single frame
    this.pendingUpdates.forEach(updateFn => {
      try {
        updateFn();
      } catch (error) {
        console.error('Error in batch update:', error);
      }
    });
    
    this.pendingUpdates.clear();
    this.rafId = null;
  }
  
  // Measure and optimize layout
  measureAndOptimize(element: HTMLElement, operations: (() => void)[]): void {
    // Batch read operations first to avoid layout thrashing
    const measurements = this.batchMeasure(element, operations.length);
    
    // Then batch write operations
    this.batchWrite(() => {
      operations.forEach((op, index) => {
        // Use measurements if needed
        op();
      });
    });
  }
  
  private batchMeasure(element: HTMLElement, count: number): Measurement[] {
    // Batch all DOM reads to avoid layout thrashing
    const measurements: Measurement[] = [];
    
    for (let i = 0; i < count; i++) {
      measurements.push({
        width: element.clientWidth,
        height: element.clientHeight,
        scrollTop: element.scrollTop,
        scrollLeft: element.scrollLeft
      });
    }
    
    return measurements;
  }
  
  private batchWrite(writeFn: () => void): void {
    this.scheduleUpdate(writeFn);
  }
}
```

## Caching Strategies

### Multi-Level Caching System

```typescript
// Sophisticated caching system for grid performance
@Injectable({ providedIn: 'root' })
export class GridCacheService {
  private l1Cache = new Map<string, any>(); // Hot data - in memory
  private l2Cache: Cache | null = null; // Cold data - browser cache
  private lruCache = new LRUCache<string, any>(1000); // Size-limited cache
  
  constructor() {
    this.initializeCacheAPI();
  }
  
  private async initializeCacheAPI(): Promise<void> {
    if ('caches' in window) {
      this.l2Cache = await caches.open('blg-grid-cache-v1');
    }
  }
  
  // Get cached value with fallback strategy
  async get<T>(key: string, factory?: () => Promise<T>): Promise<T | null> {
    // L1 cache (memory)
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }
    
    // LRU cache (memory, size-limited)
    if (this.lruCache.has(key)) {
      const value = this.lruCache.get(key);
      this.l1Cache.set(key, value); // Promote to L1
      return value;
    }
    
    // L2 cache (disk)
    if (this.l2Cache) {
      const response = await this.l2Cache.match(key);
      if (response) {
        const value = await response.json();
        this.lruCache.set(key, value);
        this.l1Cache.set(key, value);
        return value;
      }
    }
    
    // Factory fallback
    if (factory) {
      const value = await factory();
      await this.set(key, value);
      return value;
    }
    
    return null;
  }
  
  // Set value in all cache levels
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // L1 cache
    this.l1Cache.set(key, value);
    
    // LRU cache
    this.lruCache.set(key, value);
    
    // L2 cache
    if (this.l2Cache && this.isSerializable(value)) {
      const response = new Response(JSON.stringify(value), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': ttl ? `max-age=${ttl}` : 'max-age=3600'
        }
      });
      
      await this.l2Cache.put(key, response);
    }
  }
  
  // Smart cache invalidation
  invalidate(pattern: string | RegExp): void {
    const keys = Array.from(this.l1Cache.keys());
    
    keys.forEach(key => {
      const shouldInvalidate = typeof pattern === 'string' 
        ? key.includes(pattern)
        : pattern.test(key);
        
      if (shouldInvalidate) {
        this.l1Cache.delete(key);
        this.lruCache.delete(key);
      }
    });
    
    // L2 cache invalidation (async)
    if (this.l2Cache) {
      this.invalidateL2Cache(pattern);
    }
  }
  
  private async invalidateL2Cache(pattern: string | RegExp): Promise<void> {
    if (!this.l2Cache) return;
    
    const requests = await this.l2Cache.keys();
    
    const deletePromises = requests
      .filter(request => {
        const shouldInvalidate = typeof pattern === 'string'
          ? request.url.includes(pattern)
          : pattern.test(request.url);
          
        return shouldInvalidate;
      })
      .map(request => this.l2Cache!.delete(request));
    
    await Promise.all(deletePromises);
  }
  
  // Cache statistics for monitoring
  getStats(): CacheStats {
    return {
      l1Size: this.l1Cache.size,
      lruSize: this.lruCache.size,
      hitRatio: this.calculateHitRatio(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }
}
```

## Performance Monitoring

### Real-time Performance Monitoring

```typescript
// Comprehensive performance monitoring system
@Injectable({ providedIn: 'root' })
export class PerformanceMonitoringService {
  private metrics = new Map<string, PerformanceMetric>();
  private observers = new Map<string, PerformanceObserver>();
  
  constructor() {
    this.setupPerformanceObservers();
  }
  
  private setupPerformanceObservers(): void {
    // Monitor long tasks (>50ms)
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.duration > 50) {
            this.recordMetric('long-task', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        });
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (e) {
        // Not supported in all browsers
      }
      
      // Monitor layout shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.recordMetric('layout-shift', {
            value: (entry as any).value,
            hadRecentInput: (entry as any).hadRecentInput
          });
        });
      });
      
      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('layout-shift', layoutShiftObserver);
      } catch (e) {
        // Not supported in all browsers
      }
    }
  }
  
  // Measure operation performance
  measureOperation<T>(name: string, operation: () => T): T {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      const result = operation();
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      this.recordMetric(name, {
        duration: endTime - startTime,
        memoryDelta: endMemory - startMemory,
        success: true
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.recordMetric(name, {
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }
  
  // Measure async operations
  async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      const result = await operation();
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      this.recordMetric(name, {
        duration: endTime - startTime,
        memoryDelta: endMemory - startMemory,
        success: true
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.recordMetric(name, {
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }
  
  // Record custom metrics
  recordMetric(name: string, data: any): void {
    const timestamp = Date.now();
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        samples: [],
        stats: { min: Infinity, max: -Infinity, avg: 0, count: 0 }
      });
    }
    
    const metric = this.metrics.get(name)!;
    metric.samples.push({ timestamp, data });
    
    // Update statistics
    if (typeof data.duration === 'number') {
      const duration = data.duration;
      metric.stats.min = Math.min(metric.stats.min, duration);
      metric.stats.max = Math.max(metric.stats.max, duration);
      metric.stats.count++;
      metric.stats.avg = (metric.stats.avg * (metric.stats.count - 1) + duration) / metric.stats.count;
    }
    
    // Keep only recent samples
    const maxSamples = 1000;
    if (metric.samples.length > maxSamples) {
      metric.samples = metric.samples.slice(-maxSamples);
    }
    
    // Emit performance alerts if needed
    this.checkPerformanceThresholds(name, data);
  }
  
  private checkPerformanceThresholds(name: string, data: any): void {
    const thresholds = {
      'sort-operation': 100, // 100ms
      'filter-operation': 50, // 50ms
      'render-cycle': 16, // 16ms (60fps)
      'data-processing': 200 // 200ms
    };
    
    const threshold = thresholds[name as keyof typeof thresholds];
    if (threshold && data.duration > threshold) {
      console.warn(`⚠️ Performance threshold exceeded for ${name}: ${data.duration}ms (threshold: ${threshold}ms)`);
      
      // Could emit events for monitoring systems
      this.emitPerformanceAlert(name, data, threshold);
    }
  }
  
  // Get performance report
  getPerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      metrics: {},
      summary: {
        totalOperations: 0,
        averageResponseTime: 0,
        errorRate: 0,
        memoryUsage: this.getMemoryUsage()
      }
    };
    
    this.metrics.forEach((metric, name) => {
      report.metrics[name] = {
        ...metric.stats,
        recentSamples: metric.samples.slice(-10)
      };
      
      report.summary.totalOperations += metric.stats.count;
    });
    
    return report;
  }
}
```

This comprehensive performance documentation provides maintainers with the deep understanding needed to optimize and maintain the BLG Grid library's performance characteristics effectively.