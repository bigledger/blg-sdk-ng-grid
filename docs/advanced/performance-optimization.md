# Performance Optimization Guide

This guide covers advanced performance optimization techniques for the BLG Grid, including strategies for handling large datasets, optimizing rendering, and managing memory efficiently.

## Virtual Scrolling Optimization

### Advanced Virtual Scrolling Configuration

```typescript
interface VirtualScrollConfig {
  enabled: boolean;
  itemHeight: number;        // Fixed item height for consistent scrolling
  bufferSize: number;        // Items to render outside viewport
  runwayItems: number;       // Additional buffer items
  scrollDebounce: number;    // Scroll event debouncing (ms)
  renderThrottle: number;    // Render throttling (ms)
}

const optimizedConfig: GridConfig = {
  virtualScrolling: true,
  virtualScrollOptions: {
    enabled: true,
    itemHeight: 40,          // Fixed height for predictable scrolling
    bufferSize: 10,          // Render 10 extra items above/below
    runwayItems: 5,          // Extra safety buffer
    scrollDebounce: 16,      // ~60fps scroll handling
    renderThrottle: 33       // ~30fps render updates
  }
};
```

### Viewport Size Calculation

```typescript
@Component({
  selector: 'app-optimized-virtual-grid',
  template: `
    <blg-grid 
      [data]="data"
      [columns]="columns"
      [config]="virtualConfig"
      #grid>
    </blg-grid>
  `
})
export class OptimizedVirtualGridComponent implements OnInit, AfterViewInit {
  @ViewChild('grid', { read: ElementRef }) gridElement!: ElementRef;
  
  virtualConfig: GridConfig = {
    virtualScrolling: true,
    rowHeight: 40
  };

  ngAfterViewInit() {
    this.optimizeViewportSettings();
    this.setupResizeObserver();
  }

  private optimizeViewportSettings() {
    const gridHeight = this.gridElement.nativeElement.clientHeight;
    const rowHeight = this.virtualConfig.rowHeight || 40;
    
    // Calculate optimal buffer size based on viewport
    const visibleRows = Math.ceil(gridHeight / rowHeight);
    const bufferSize = Math.max(5, Math.ceil(visibleRows * 0.5));
    
    this.virtualConfig = {
      ...this.virtualConfig,
      virtualScrollOptions: {
        enabled: true,
        itemHeight: rowHeight,
        bufferSize: bufferSize,
        runwayItems: Math.ceil(bufferSize * 0.5)
      }
    };
  }

  private setupResizeObserver() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.optimizeViewportSettings();
      }
    });
    
    resizeObserver.observe(this.gridElement.nativeElement);
  }
}
```

## Column Virtualization

### Dynamic Column Rendering

```typescript
interface ColumnVirtualizationConfig {
  enabled: boolean;
  columnWidth: number;       // Average column width
  visibleColumnBuffer: number; // Extra columns to render
}

@Component({
  selector: 'app-column-virtualized-grid',
  template: `
    <blg-grid 
      [data]="data"
      [columns]="visibleColumns"
      [config]="config"
      (scrollHorizontal)="onHorizontalScroll($event)">
    </blg-grid>
  `
})
export class ColumnVirtualizedGridComponent {
  allColumns: ColumnDefinition[] = [];
  visibleColumns: ColumnDefinition[] = [];
  
  private viewportWidth = 0;
  private scrollLeft = 0;
  
  config: GridConfig = {
    virtualScrolling: true,
    columnVirtualization: {
      enabled: true,
      columnWidth: 150,
      visibleColumnBuffer: 2
    }
  };

  @HostListener('window:resize')
  onWindowResize() {
    this.updateViewport();
    this.updateVisibleColumns();
  }

  private updateVisibleColumns() {
    if (!this.config.columnVirtualization?.enabled) {
      this.visibleColumns = this.allColumns;
      return;
    }

    const avgColumnWidth = this.config.columnVirtualization.columnWidth || 150;
    const buffer = this.config.columnVirtualization.visibleColumnBuffer || 2;
    
    const startIndex = Math.max(0, Math.floor(this.scrollLeft / avgColumnWidth) - buffer);
    const visibleCount = Math.ceil(this.viewportWidth / avgColumnWidth) + (buffer * 2);
    const endIndex = Math.min(this.allColumns.length, startIndex + visibleCount);
    
    this.visibleColumns = this.allColumns.slice(startIndex, endIndex);
  }

  onHorizontalScroll(event: { scrollLeft: number }) {
    this.scrollLeft = event.scrollLeft;
    this.updateVisibleColumns();
  }

  private updateViewport() {
    // Update viewport width based on container size
    this.viewportWidth = window.innerWidth; // Simplified
  }
}
```

## Memory Management

### Object Pooling for Row Rendering

```typescript
class RowPool {
  private pool: HTMLElement[] = [];
  private activeRows = new Set<HTMLElement>();
  private maxPoolSize = 100;

  getRow(): HTMLElement {
    let row = this.pool.pop();
    
    if (!row) {
      row = this.createRow();
    }
    
    this.activeRows.add(row);
    return row;
  }

  returnRow(row: HTMLElement) {
    if (this.activeRows.has(row)) {
      this.activeRows.delete(row);
      
      // Clean up row content
      this.resetRow(row);
      
      // Return to pool if not at capacity
      if (this.pool.length < this.maxPoolSize) {
        this.pool.push(row);
      } else {
        // Remove from DOM if pool is full
        row.remove();
      }
    }
  }

  private createRow(): HTMLElement {
    const row = document.createElement('div');
    row.className = 'grid-row';
    return row;
  }

  private resetRow(row: HTMLElement) {
    row.innerHTML = '';
    row.className = 'grid-row';
    row.style.cssText = '';
  }

  cleanup() {
    this.pool.forEach(row => row.remove());
    this.activeRows.forEach(row => row.remove());
    this.pool = [];
    this.activeRows.clear();
  }
}
```

### Memory-Efficient Data Processing

```typescript
@Injectable()
export class OptimizedDataService {
  // Use WeakMap for garbage collection friendly caching
  private processingCache = new WeakMap<any[], ProcessedData>();
  private filterCache = new Map<string, any[]>();
  private maxCacheSize = 10;

  processData(rawData: any[], columns: ColumnDefinition[]): ProcessedData {
    // Check if we've already processed this data
    let processed = this.processingCache.get(rawData);
    
    if (!processed) {
      processed = this.performProcessing(rawData, columns);
      this.processingCache.set(rawData, processed);
    }
    
    return processed;
  }

  filterData(data: any[], filters: FilterState): any[] {
    const filterKey = this.generateFilterKey(filters);
    
    // Check cache
    if (this.filterCache.has(filterKey)) {
      return this.filterCache.get(filterKey)!;
    }
    
    const filtered = this.applyFilters(data, filters);
    
    // Manage cache size
    if (this.filterCache.size >= this.maxCacheSize) {
      const oldestKey = this.filterCache.keys().next().value;
      this.filterCache.delete(oldestKey);
    }
    
    this.filterCache.set(filterKey, filtered);
    return filtered;
  }

  private performProcessing(data: any[], columns: ColumnDefinition[]): ProcessedData {
    // Process data in chunks to avoid blocking the main thread
    return new ProcessedData(data, columns);
  }

  private applyFilters(data: any[], filters: FilterState): any[] {
    return data.filter(item => {
      return Object.entries(filters).every(([field, filterValue]) => {
        return this.matchesFilter(item[field], filterValue);
      });
    });
  }

  private generateFilterKey(filters: FilterState): string {
    return JSON.stringify(filters);
  }

  private matchesFilter(value: any, filter: any): boolean {
    // Optimized filter matching logic
    if (!filter) return true;
    
    const str = String(value).toLowerCase();
    const filterStr = String(filter).toLowerCase();
    
    return str.includes(filterStr);
  }

  clearCache() {
    this.filterCache.clear();
  }
}
```

## Rendering Performance

### Change Detection Optimization

```typescript
@Component({
  selector: 'app-optimized-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <blg-grid 
      [data]="data$ | async"
      [columns]="columns"
      [config]="config"
      [trackByFn]="trackByItemId">
    </blg-grid>
  `
})
export class OptimizedGridComponent {
  data$: Observable<any[]>;
  
  // Efficient trackBy function
  trackByItemId = (index: number, item: any): any => {
    return item.id ?? index;
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private dataService: OptimizedDataService
  ) {
    this.data$ = this.dataService.getData().pipe(
      // Reduce change detection cycles
      distinctUntilChanged(this.compareArrays),
      // Share the stream to avoid multiple subscriptions
      shareReplay(1)
    );
  }

  private compareArrays = (prev: any[], curr: any[]): boolean => {
    if (prev.length !== curr.length) return false;
    
    // Fast comparison for sorted data
    for (let i = 0; i < prev.length; i++) {
      if (prev[i].id !== curr[i].id) return false;
    }
    
    return true;
  };

  // Manual change detection trigger when needed
  forceUpdate() {
    this.cdr.markForCheck();
  }
}
```

### Lazy Loading with Intersection Observer

```typescript
@Component({
  selector: 'app-lazy-grid',
  template: `
    <blg-grid 
      [data]="visibleData"
      [columns]="columns"
      [config]="config">
    </blg-grid>
    
    <div #loadingTrigger class="loading-trigger" *ngIf="hasMoreData">
      <div class="spinner" *ngIf="loading"></div>
    </div>
  `
})
export class LazyGridComponent implements OnInit, OnDestroy {
  @ViewChild('loadingTrigger') loadingTrigger!: ElementRef;
  
  visibleData: any[] = [];
  loading = false;
  hasMoreData = true;
  
  private currentPage = 0;
  private pageSize = 100;
  private intersectionObserver?: IntersectionObserver;

  ngOnInit() {
    this.loadInitialData();
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    this.intersectionObserver?.disconnect();
  }

  private setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.loading && this.hasMoreData) {
          this.loadMoreData();
        }
      },
      { threshold: 0.1 }
    );
    
    this.intersectionObserver.observe(this.loadingTrigger.nativeElement);
  }

  private async loadInitialData() {
    this.loading = true;
    try {
      const data = await this.dataService.getPage(0, this.pageSize);
      this.visibleData = data;
      this.currentPage = 1;
    } finally {
      this.loading = false;
    }
  }

  private async loadMoreData() {
    this.loading = true;
    try {
      const newData = await this.dataService.getPage(this.currentPage, this.pageSize);
      
      if (newData.length === 0) {
        this.hasMoreData = false;
      } else {
        this.visibleData = [...this.visibleData, ...newData];
        this.currentPage++;
      }
    } finally {
      this.loading = false;
    }
  }
}
```

## Bundle Size Optimization

### Tree Shaking Configuration

```typescript
// Import only needed parts
import { Grid } from '@blg/grid/core';
import type { ColumnDefinition, GridConfig } from '@blg/grid/types';

// Avoid importing entire feature modules
// ❌ Bad - imports everything
// import { BLGGridModule } from '@blg/grid';

// ✅ Good - imports only what's needed
import { GridComponent } from '@blg/grid/components';
import { VirtualScrollingDirective } from '@blg/grid/directives';
```

### Lazy Loading Grid Features

```typescript
// Lazy load expensive features
const LazyExportComponent = lazy(() => 
  import('@blg/grid/export').then(m => ({ default: m.ExportComponent }))
);

const LazyGroupingComponent = lazy(() => 
  import('@blg/grid/grouping').then(m => ({ default: m.GroupingComponent }))
);

@Component({
  template: `
    <blg-grid [data]="data" [columns]="columns" [config]="config">
    </blg-grid>
    
    <!-- Lazy load features when needed -->
    <ng-container *ngIf="showExport">
      <ng-container *ngComponentOutlet="exportComponent"></ng-container>
    </ng-container>
  `
})
export class LazyFeatureGridComponent {
  exportComponent = this.showExport ? LazyExportComponent : null;
  
  showExport = false;
  
  enableExport() {
    this.showExport = true;
  }
}
```

## CPU Optimization

### Web Workers for Data Processing

```typescript
// data-processor.worker.ts
/// <reference lib="webworker" />

interface ProcessingMessage {
  type: 'sort' | 'filter' | 'group';
  data: any[];
  config: any;
}

addEventListener('message', ({ data }: MessageEvent<ProcessingMessage>) => {
  let result: any;
  
  switch (data.type) {
    case 'sort':
      result = sortData(data.data, data.config);
      break;
    case 'filter':
      result = filterData(data.data, data.config);
      break;
    case 'group':
      result = groupData(data.data, data.config);
      break;
  }
  
  postMessage(result);
});

function sortData(data: any[], sortConfig: any): any[] {
  return data.sort((a, b) => {
    // Optimized sorting logic
    const aVal = a[sortConfig.field];
    const bVal = b[sortConfig.field];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
}
```

```typescript
// Service using Web Worker
@Injectable()
export class WebWorkerDataService {
  private worker?: Worker;
  
  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(
        new URL('./data-processor.worker', import.meta.url)
      );
    }
  }
  
  async processDataInWorker(
    type: 'sort' | 'filter' | 'group',
    data: any[],
    config: any
  ): Promise<any[]> {
    if (!this.worker) {
      // Fallback to main thread processing
      return this.processDataOnMainThread(type, data, config);
    }
    
    return new Promise((resolve) => {
      this.worker!.onmessage = ({ data: result }) => {
        resolve(result);
      };
      
      this.worker!.postMessage({ type, data, config });
    });
  }
  
  private processDataOnMainThread(
    type: string,
    data: any[],
    config: any
  ): any[] {
    // Fallback processing logic
    switch (type) {
      case 'sort':
        return this.sortData(data, config);
      default:
        return data;
    }
  }
}
```

### RequestAnimationFrame for Smooth Updates

```typescript
@Component({
  selector: 'app-smooth-grid'
})
export class SmoothGridComponent {
  private animationFrame?: number;
  private pendingUpdates = new Set<string>();
  
  scheduleUpdate(updateType: string) {
    this.pendingUpdates.add(updateType);
    
    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(() => {
        this.processPendingUpdates();
      });
    }
  }
  
  private processPendingUpdates() {
    const updates = Array.from(this.pendingUpdates);
    this.pendingUpdates.clear();
    this.animationFrame = undefined;
    
    // Batch process updates
    updates.forEach(updateType => {
      switch (updateType) {
        case 'scroll':
          this.processScrollUpdate();
          break;
        case 'resize':
          this.processResizeUpdate();
          break;
        case 'data':
          this.processDataUpdate();
          break;
      }
    });
  }
  
  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    this.scheduleUpdate('scroll');
  }
  
  private processScrollUpdate() {
    // Process scroll updates in RAF
    this.updateVisibleRows();
  }
}
```

## GPU Acceleration

### CSS Transforms for Performance

```css
/* Use transform instead of changing top/left for better performance */
.blg-grid .virtual-row {
  transform: translateY(var(--row-offset));
  will-change: transform; /* Hint browser to use GPU acceleration */
}

/* Enable hardware acceleration for smooth scrolling */
.blg-grid .scroll-container {
  transform: translateZ(0); /* Force GPU layer */
  -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
}

/* Optimize animations */
.blg-grid .grid-row {
  backface-visibility: hidden; /* Prevent flicker */
  perspective: 1000px;
}

/* Use contain for performance */
.blg-grid .grid-cell {
  contain: layout style paint;
}
```

### Hardware-Accelerated Virtual Scrolling

```typescript
@Component({
  selector: 'app-gpu-optimized-grid',
  template: `
    <div class="scroll-container" (scroll)="onScroll($event)">
      <div 
        class="virtual-content" 
        [style.height.px]="totalHeight">
        <div 
          *ngFor="let item of visibleItems; trackBy: trackByIndex"
          class="virtual-row"
          [style.transform]="'translateY(' + getRowOffset(item.index) + 'px)'">
          <!-- Row content -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scroll-container {
      height: 400px;
      overflow-y: auto;
      position: relative;
      will-change: scroll-position;
    }
    
    .virtual-content {
      position: relative;
    }
    
    .virtual-row {
      position: absolute;
      width: 100%;
      will-change: transform;
      backface-visibility: hidden;
    }
  `]
})
export class GpuOptimizedGridComponent {
  visibleItems: any[] = [];
  totalHeight = 0;
  rowHeight = 40;
  
  private scrollTop = 0;
  private containerHeight = 400;
  
  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.scrollTop = target.scrollTop;
    this.updateVisibleItems();
  }
  
  private updateVisibleItems() {
    const startIndex = Math.floor(this.scrollTop / this.rowHeight);
    const endIndex = Math.min(
      this.data.length,
      startIndex + Math.ceil(this.containerHeight / this.rowHeight) + 2
    );
    
    this.visibleItems = [];
    for (let i = startIndex; i < endIndex; i++) {
      this.visibleItems.push({
        index: i,
        data: this.data[i]
      });
    }
  }
  
  getRowOffset(index: number): number {
    return index * this.rowHeight;
  }
  
  trackByIndex = (index: number, item: any): number => item.index;
}
```

## Performance Monitoring

### Performance Metrics Component

```typescript
@Component({
  selector: 'app-performance-metrics',
  template: `
    <div class="metrics-dashboard">
      <div class="metric">
        <label>Render Time:</label>
        <span>{{ metrics.renderTime }}ms</span>
      </div>
      <div class="metric">
        <label>FPS:</label>
        <span [class.warning]="metrics.fps < 30">{{ metrics.fps }}</span>
      </div>
      <div class="metric">
        <label>Memory:</label>
        <span>{{ metrics.memoryUsage }}MB</span>
      </div>
      <div class="metric">
        <label>DOM Nodes:</label>
        <span>{{ metrics.domNodes }}</span>
      </div>
    </div>
  `
})
export class PerformanceMetricsComponent implements OnInit, OnDestroy {
  metrics = {
    renderTime: 0,
    fps: 0,
    memoryUsage: 0,
    domNodes: 0
  };
  
  private observer?: PerformanceObserver;
  private frameCount = 0;
  private lastTime = performance.now();
  
  ngOnInit() {
    this.startMonitoring();
  }
  
  ngOnDestroy() {
    this.stopMonitoring();
  }
  
  private startMonitoring() {
    // Monitor Performance API
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'measure' && entry.name.includes('grid-render')) {
          this.metrics.renderTime = Math.round(entry.duration);
        }
      });
    });
    
    this.observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    // Monitor FPS
    this.monitorFPS();
    
    // Monitor memory usage
    setInterval(() => {
      this.updateMemoryMetrics();
      this.updateDOMMetrics();
    }, 1000);
  }
  
  private monitorFPS() {
    const measureFPS = (currentTime: number) => {
      this.frameCount++;
      
      if (currentTime >= this.lastTime + 1000) {
        this.metrics.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }
  
  private updateMemoryMetrics() {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
  }
  
  private updateDOMMetrics() {
    this.metrics.domNodes = document.querySelectorAll('*').length;
  }
  
  private stopMonitoring() {
    this.observer?.disconnect();
  }
}
```

## Best Practices Summary

### Performance Checklist

```typescript
// ✅ Performance Best Practices
class PerformantGridComponent {
  // 1. Use OnPush change detection
  @Component({ changeDetection: ChangeDetectionStrategy.OnPush })
  
  // 2. Implement efficient trackBy
  trackByFn = (index: number, item: any) => item.id ?? index;
  
  // 3. Use virtual scrolling for large datasets
  config: GridConfig = {
    virtualScrolling: true,
    rowHeight: 40 // Fixed height for best performance
  };
  
  // 4. Debounce expensive operations
  private filterSubject = new Subject<string>();
  
  constructor() {
    this.filterSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.applyFilter(term));
  }
  
  // 5. Use Web Workers for heavy computations
  async processBigData(data: any[]) {
    return this.webWorkerService.processData(data);
  }
  
  // 6. Implement lazy loading
  loadMoreData() {
    // Load data incrementally
  }
  
  // 7. Use immutable update patterns
  updateData(newData: any[]) {
    this.data = [...newData]; // Create new reference
  }
  
  // 8. Clean up subscriptions
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

## Next Steps

1. **[Accessibility](./accessibility.md)** - Ensure your optimized grid is accessible
2. **[Testing](./testing.md)** - Test performance optimizations
3. **[Memory Profiling](../recipes/memory-profiling.md)** - Advanced memory analysis
4. **[Bundle Analysis](../recipes/bundle-optimization.md)** - Optimize bundle size