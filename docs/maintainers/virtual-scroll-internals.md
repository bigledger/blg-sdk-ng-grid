# Virtual Scroll Internals

**Audience: Library Maintainers and Core Contributors**

This document provides deep technical insights into the virtual scrolling implementation within the BLG Grid library. Understanding these internals is crucial for maintaining performance, debugging scrolling issues, and implementing enhancements to the virtual scrolling system.

## Table of Contents

- [Virtual Scrolling Overview](#virtual-scrolling-overview)
- [Implementation Architecture](#implementation-architecture)
- [Viewport Management](#viewport-management)
- [Item Rendering Strategy](#item-rendering-strategy)
- [Performance Optimizations](#performance-optimizations)
- [Scroll Position Synchronization](#scroll-position-synchronization)
- [Dynamic Height Handling](#dynamic-height-handling)
- [Memory Management](#memory-management)
- [Browser Compatibility](#browser-compatibility)
- [Debugging Virtual Scroll Issues](#debugging-virtual-scroll-issues)

## Virtual Scrolling Overview

Virtual scrolling is a technique that renders only the visible portion of a large dataset, plus a small buffer, rather than rendering all items in the DOM. This approach enables smooth scrolling performance even with datasets containing hundreds of thousands of rows.

### Key Performance Benefits

- **Constant Memory Usage**: DOM size remains constant regardless of dataset size
- **Smooth Scrolling**: 60 FPS performance maintained even with large datasets
- **Fast Initial Render**: Only visible items are rendered initially
- **Reduced Layout Calculations**: Fewer DOM elements mean faster layout passes

### Implementation Goals

1. **Seamless User Experience**: Users should not notice virtual scrolling is active
2. **Accurate Scrollbar**: Scrollbar size and position should reflect total content
3. **Keyboard Navigation**: All accessibility features must work correctly
4. **Selection Preservation**: Selected items must remain selected during scrolling
5. **Dynamic Content**: Support for variable item heights and dynamic content

## Implementation Architecture

### Core Components Architecture

```typescript
// Virtual scrolling component hierarchy
interface VirtualScrollArchitecture {
  viewport: {
    component: 'BlgVirtualViewportComponent';
    responsibilities: [
      'Scroll event handling',
      'Viewport size calculation',
      'Buffer management',
      'Scroll position tracking'
    ];
  };
  
  renderer: {
    component: 'BlgVirtualRendererComponent';
    responsibilities: [
      'Item range calculation',
      'DOM element recycling',
      'Content positioning',
      'Template instantiation'
    ];
  };
  
  strategy: {
    service: 'VirtualScrollStrategyService';
    responsibilities: [
      'Scrolling algorithms',
      'Height calculations',
      'Performance optimization',
      'Memory management'
    ];
  };
}
```

### Core Virtual Scrolling Service

```typescript
@Injectable()
export class VirtualScrollService {
  private readonly state = {
    // Viewport measurements
    viewportHeight: 0,
    viewportWidth: 0,
    scrollTop: 0,
    scrollLeft: 0,
    
    // Content measurements  
    totalHeight: 0,
    itemCount: 0,
    estimatedItemHeight: 40,
    
    // Rendering state
    startIndex: 0,
    endIndex: 0,
    bufferSize: 5,
    
    // Performance tracking
    lastScrollTime: 0,
    scrollDirection: 'down' as 'up' | 'down',
    scrollVelocity: 0,
    
    // Caching
    itemHeights: new Map<number, number>(),
    itemPositions: new Map<number, number>(),
    measuredRanges: new Set<string>()
  };
  
  // Calculate visible item range
  calculateVisibleRange(
    scrollTop: number,
    viewportHeight: number,
    itemCount: number
  ): VirtualScrollRange {
    const bufferHeight = this.state.bufferSize * this.state.estimatedItemHeight;
    
    // Calculate start index with buffer
    const visibleStart = Math.max(0, scrollTop - bufferHeight);
    const startIndex = this.findItemIndexAtPosition(visibleStart);
    
    // Calculate end index with buffer
    const visibleEnd = scrollTop + viewportHeight + bufferHeight;
    const endIndex = Math.min(
      itemCount,
      this.findItemIndexAtPosition(visibleEnd) + this.state.bufferSize
    );
    
    return {
      startIndex: Math.max(0, startIndex - this.state.bufferSize),
      endIndex: Math.min(itemCount, endIndex + this.state.bufferSize),
      visibleStart: visibleStart,
      visibleEnd: visibleEnd,
      bufferStart: startIndex,
      bufferEnd: endIndex
    };
  }
  
  // Binary search for item position
  private findItemIndexAtPosition(position: number): number {
    if (this.hasUniformHeight()) {
      return Math.floor(position / this.state.estimatedItemHeight);
    }
    
    return this.binarySearchPosition(position, 0, this.state.itemCount - 1);
  }
  
  private binarySearchPosition(
    targetPosition: number,
    startIndex: number,
    endIndex: number
  ): number {
    if (startIndex >= endIndex) {
      return startIndex;
    }
    
    const midIndex = Math.floor((startIndex + endIndex) / 2);
    const midPosition = this.getItemPosition(midIndex);
    
    if (midPosition === targetPosition) {
      return midIndex;
    } else if (midPosition < targetPosition) {
      return this.binarySearchPosition(targetPosition, midIndex + 1, endIndex);
    } else {
      return this.binarySearchPosition(targetPosition, startIndex, midIndex - 1);
    }
  }
  
  // Get or calculate item position
  getItemPosition(index: number): number {
    if (this.state.itemPositions.has(index)) {
      return this.state.itemPositions.get(index)!;
    }
    
    let position = 0;
    
    if (this.hasUniformHeight()) {
      position = index * this.state.estimatedItemHeight;
    } else {
      // Calculate cumulative position
      for (let i = 0; i < index; i++) {
        position += this.getItemHeight(i);
      }
    }
    
    this.state.itemPositions.set(index, position);
    return position;
  }
  
  // Get or estimate item height
  getItemHeight(index: number): number {
    return this.state.itemHeights.get(index) || this.state.estimatedItemHeight;
  }
  
  // Update measured item height
  setItemHeight(index: number, height: number): void {
    const oldHeight = this.getItemHeight(index);
    
    if (oldHeight !== height) {
      this.state.itemHeights.set(index, height);
      
      // Invalidate position cache for items after this one
      this.invalidatePositionCache(index + 1);
      
      // Update total height
      this.updateTotalHeight();
      
      // Trigger reflow if necessary
      this.checkForReflow(index, oldHeight, height);
    }
  }
  
  private invalidatePositionCache(fromIndex: number): void {
    for (let i = fromIndex; i < this.state.itemCount; i++) {
      this.state.itemPositions.delete(i);
    }
  }
  
  private updateTotalHeight(): void {
    if (this.hasUniformHeight()) {
      this.state.totalHeight = this.state.itemCount * this.state.estimatedItemHeight;
    } else {
      // Calculate total height from measured and estimated heights
      let totalHeight = 0;
      
      for (let i = 0; i < this.state.itemCount; i++) {
        totalHeight += this.getItemHeight(i);
      }
      
      this.state.totalHeight = totalHeight;
    }
  }
  
  private hasUniformHeight(): boolean {
    // Consider uniform if less than 5% of items have been measured with different heights
    const measuredCount = this.state.itemHeights.size;
    const uniformCount = Array.from(this.state.itemHeights.values())
      .filter(height => Math.abs(height - this.state.estimatedItemHeight) < 2).length;
      
    return measuredCount < 10 || (uniformCount / measuredCount) > 0.95;
  }
}
```

## Viewport Management

### Responsive Viewport Handling

```typescript
@Component({
  selector: 'blg-virtual-viewport',
  template: `
    <div 
      #viewport
      class="blg-virtual-viewport"
      [style.height.px]="viewportHeight"
      [style.width.px]="viewportWidth"
      [style.overflow]="scrollbarPolicy"
      (scroll)="onScroll($event)"
      (resize)="onResize($event)">
      
      <!-- Virtual content container -->
      <div 
        class="blg-virtual-content"
        [style.height.px]="totalContentHeight"
        [style.width.px]="totalContentWidth">
        
        <!-- Rendered items -->
        <div 
          class="blg-virtual-rendered-range"
          [style.transform]="contentTransform">
          
          <ng-container
            *ngFor="let item of visibleItems; 
                    trackBy: trackByFunction; 
                    let virtualIndex = index">
            <div 
              class="blg-virtual-item"
              [style.height.px]="getItemHeight(item.index)"
              [style.position]="'absolute'"
              [style.top.px]="getItemTop(item.index)"
              [style.left.px]="getItemLeft(item.index)"
              [style.width.px]="getItemWidth(item.index)"
              #itemElement
              (resize)="onItemResize(item.index, $event)">
              
              <ng-container
                [ngTemplateOutlet]="itemTemplate"
                [ngTemplateOutletContext]="{ 
                  $implicit: item.data, 
                  index: item.index,
                  virtualIndex: virtualIndex 
                }">
              </ng-container>
            </div>
          </ng-container>
        </div>
      </div>
      
      <!-- Loading indicators -->
      <div 
        *ngIf="loading" 
        class="blg-virtual-loading"
        [style.top.px]="loadingIndicatorTop">
        <ng-container [ngTemplateOutlet]="loadingTemplate"></ng-container>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlgVirtualViewportComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('viewport', { static: true }) viewportRef!: ElementRef<HTMLElement>;
  @Input() items: any[] = [];
  @Input() itemHeight: number | ((index: number, item: any) => number) = 40;
  @Input() itemTemplate!: TemplateRef<any>;
  @Input() loadingTemplate?: TemplateRef<any>;
  @Input() bufferSize = 5;
  @Input() scrollbarPolicy: 'auto' | 'scroll' | 'hidden' = 'auto';
  
  // Viewport state
  private viewportElement!: HTMLElement;
  private resizeObserver?: ResizeObserver;
  private scrollHandler?: () => void;
  private animationFrameId?: number;
  
  // Performance optimizations
  private lastScrollTop = 0;
  private lastScrollLeft = 0;
  private scrollDirection: 'up' | 'down' | 'none' = 'none';
  private isScrolling = false;
  private scrollEndTimer?: number;
  
  // Computed properties
  readonly visibleItems = computed(() => {
    const range = this.virtualScrollService.getVisibleRange();
    return this.items
      .slice(range.startIndex, range.endIndex)
      .map((item, index) => ({
        data: item,
        index: range.startIndex + index
      }));
  });
  
  readonly contentTransform = computed(() => {
    const range = this.virtualScrollService.getVisibleRange();
    const offsetY = this.virtualScrollService.getItemPosition(range.startIndex);
    return `translateY(${offsetY}px)`;
  });
  
  readonly totalContentHeight = computed(() => 
    this.virtualScrollService.getTotalHeight()
  );
  
  constructor(
    private virtualScrollService: VirtualScrollService,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}
  
  ngAfterViewInit(): void {
    this.viewportElement = this.viewportRef.nativeElement;
    this.setupViewport();
  }
  
  private setupViewport(): void {
    // Setup resize observer
    this.resizeObserver = new ResizeObserver(entries => {
      this.ngZone.run(() => {
        this.onViewportResize(entries[0]);
      });
    });
    
    this.resizeObserver.observe(this.viewportElement);
    
    // Setup optimized scroll handler
    this.scrollHandler = this.createOptimizedScrollHandler();
    this.viewportElement.addEventListener('scroll', this.scrollHandler, { passive: true });
    
    // Initial setup
    this.updateViewportDimensions();
  }
  
  private createOptimizedScrollHandler(): () => void {
    let ticking = false;
    
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
  }
  
  private handleScroll(): void {
    const scrollTop = this.viewportElement.scrollTop;
    const scrollLeft = this.viewportElement.scrollLeft;
    
    // Calculate scroll direction and velocity
    const deltaY = scrollTop - this.lastScrollTop;
    const deltaX = scrollLeft - this.lastScrollLeft;
    
    this.scrollDirection = deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none';
    
    // Update scroll state
    this.virtualScrollService.updateScrollPosition(scrollTop, scrollLeft);
    
    // Handle scroll momentum
    this.isScrolling = true;
    this.clearScrollEndTimer();
    this.scrollEndTimer = window.setTimeout(() => {
      this.isScrolling = false;
    }, 150);
    
    // Store last positions
    this.lastScrollTop = scrollTop;
    this.lastScrollLeft = scrollLeft;
    
    // Trigger change detection if visible range changed
    if (this.hasVisibleRangeChanged()) {
      this.changeDetectorRef.markForCheck();
    }
  }
  
  private onViewportResize(entry: ResizeObserverEntry): void {
    const { width, height } = entry.contentRect;
    this.virtualScrollService.updateViewportSize(width, height);
    
    // Update visible range based on new viewport size
    this.changeDetectorRef.markForCheck();
  }
  
  private hasVisibleRangeChanged(): boolean {
    const currentRange = this.virtualScrollService.getVisibleRange();
    const previousRange = this.virtualScrollService.getPreviousVisibleRange();
    
    return !previousRange ||
           currentRange.startIndex !== previousRange.startIndex ||
           currentRange.endIndex !== previousRange.endIndex;
  }
  
  // Item measurement and positioning
  getItemHeight(index: number): number {
    if (typeof this.itemHeight === 'number') {
      return this.itemHeight;
    } else {
      return this.itemHeight(index, this.items[index]);
    }
  }
  
  getItemTop(index: number): number {
    return this.virtualScrollService.getItemPosition(index);
  }
  
  getItemLeft(index: number): number {
    // For horizontal scrolling support
    return 0;
  }
  
  getItemWidth(index: number): number {
    // Full width by default
    return this.virtualScrollService.getViewportWidth();
  }
  
  onItemResize(index: number, entry: ResizeObserverEntry): void {
    const newHeight = entry.contentRect.height;
    this.virtualScrollService.setItemHeight(index, newHeight);
  }
  
  // TrackBy function for performance
  trackByFunction = (index: number, item: { data: any; index: number }): any => {
    return item.index;
  };
  
  // Cleanup
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.scrollHandler) {
      this.viewportElement?.removeEventListener('scroll', this.scrollHandler);
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.clearScrollEndTimer();
  }
  
  private clearScrollEndTimer(): void {
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
      this.scrollEndTimer = undefined;
    }
  }
}
```

## Item Rendering Strategy

### Efficient DOM Recycling

```typescript
// Advanced DOM recycling strategy
@Injectable()
export class VirtualItemRenderer {
  private readonly recycledElements = new Map<string, HTMLElement[]>();
  private readonly activeElements = new Map<number, HTMLElement>();
  private readonly elementPool = new Map<string, HTMLElement[]>();
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}
  
  // Render visible range with DOM recycling
  renderRange(visibleItems: VirtualItem[], container: HTMLElement): void {
    const newActiveElements = new Map<number, HTMLElement>();
    
    visibleItems.forEach(item => {
      let element = this.activeElements.get(item.index);
      
      if (!element) {
        // Get or create element
        element = this.acquireElement(item.templateKey);
        this.populateElement(element, item);
      } else {
        // Update existing element
        this.updateElement(element, item);
      }
      
      newActiveElements.set(item.index, element);
      
      // Position element
      this.positionElement(element, item);
    });
    
    // Return unused elements to pool
    this.activeElements.forEach((element, index) => {
      if (!newActiveElements.has(index)) {
        this.releaseElement(element);
      }
    });
    
    this.activeElements = newActiveElements;
  }
  
  private acquireElement(templateKey: string): HTMLElement {
    const pool = this.elementPool.get(templateKey) || [];
    
    if (pool.length > 0) {
      return pool.pop()!;
    }
    
    // Create new element
    return this.createElement(templateKey);
  }
  
  private releaseElement(element: HTMLElement): void {
    const templateKey = element.dataset['templateKey'] || 'default';
    const pool = this.elementPool.get(templateKey) || [];
    
    // Clean element for reuse
    this.cleanElement(element);
    
    // Return to pool (with size limit)
    if (pool.length < 50) {
      pool.push(element);
      this.elementPool.set(templateKey, pool);
    } else {
      // Remove from DOM if pool is full
      element.remove();
    }
  }
  
  private createElement(templateKey: string): HTMLElement {
    const embeddedView = this.templateRef.createEmbeddedView({});
    const element = embeddedView.rootNodes[0] as HTMLElement;
    
    element.dataset['templateKey'] = templateKey;
    element.style.position = 'absolute';
    
    return element;
  }
  
  private cleanElement(element: HTMLElement): void {
    // Remove dynamic classes and styles
    element.className = element.dataset['originalClass'] || '';
    element.removeAttribute('style');
    element.style.position = 'absolute';
    
    // Clear content
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  
  private positionElement(element: HTMLElement, item: VirtualItem): void {
    element.style.transform = `translateY(${item.top}px)`;
    element.style.height = `${item.height}px`;
    element.style.width = `${item.width}px`;
  }
  
  private populateElement(element: HTMLElement, item: VirtualItem): void {
    // Render template content into element
    const embeddedView = this.templateRef.createEmbeddedView({
      $implicit: item.data,
      index: item.index
    });
    
    embeddedView.rootNodes.forEach(node => {
      element.appendChild(node);
    });
  }
  
  private updateElement(element: HTMLElement, item: VirtualItem): void {
    // Update element content if needed
    if (this.hasContentChanged(element, item)) {
      this.cleanElement(element);
      this.populateElement(element, item);
    }
    
    // Always update position
    this.positionElement(element, item);
  }
  
  private hasContentChanged(element: HTMLElement, item: VirtualItem): boolean {
    // Compare current content with new content
    const currentData = element.dataset['itemData'];
    const newData = JSON.stringify(item.data);
    
    return currentData !== newData;
  }
}
```

## Performance Optimizations

### Scroll Performance Optimization

```typescript
// Advanced scroll performance optimizations
@Injectable()
export class ScrollPerformanceOptimizer {
  private readonly performanceMetrics = {
    frameTimings: new Array<number>(60),
    frameIndex: 0,
    averageFrameTime: 0,
    droppedFrames: 0,
    lastFrameTime: 0
  };
  
  private readonly optimizationSettings = {
    adaptiveBuffering: true,
    dynamicQuality: true,
    prefetchEnabled: true,
    smoothScrolling: true,
    reducedMotion: false
  };
  
  constructor() {
    this.detectPerformanceCapabilities();
    this.setupPerformanceMonitoring();
  }
  
  private detectPerformanceCapabilities(): void {
    // Detect device performance level
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const connectionType = (navigator as any).connection?.effectiveType || '4g';
    
    // Adjust settings based on capabilities
    if (deviceMemory < 2 || hardwareConcurrency < 2) {
      this.optimizationSettings.adaptiveBuffering = true;
      this.optimizationSettings.dynamicQuality = true;
      this.optimizationSettings.prefetchEnabled = false;
    }
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.optimizationSettings.smoothScrolling = false;
      this.optimizationSettings.reducedMotion = true;
    }
  }
  
  private setupPerformanceMonitoring(): void {
    let lastFrameTime = performance.now();
    
    const measureFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      
      this.recordFrameTime(frameTime);
      lastFrameTime = currentTime;
      
      // Adjust performance settings based on metrics
      this.adaptPerformanceSettings();
      
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }
  
  private recordFrameTime(frameTime: number): void {
    const metrics = this.performanceMetrics;
    
    metrics.frameTimings[metrics.frameIndex] = frameTime;
    metrics.frameIndex = (metrics.frameIndex + 1) % metrics.frameTimings.length;
    
    // Calculate average frame time
    const validFrames = metrics.frameTimings.filter(time => time > 0);
    metrics.averageFrameTime = validFrames.reduce((sum, time) => sum + time, 0) / validFrames.length;
    
    // Count dropped frames (>16.67ms = <60fps)
    if (frameTime > 16.67) {
      metrics.droppedFrames++;
    }
  }
  
  private adaptPerformanceSettings(): void {
    const avgFrameTime = this.performanceMetrics.averageFrameTime;
    
    // If average frame time is high, reduce quality
    if (avgFrameTime > 20) { // <50fps
      this.optimizationSettings.dynamicQuality = true;
      this.optimizationSettings.prefetchEnabled = false;
    } else if (avgFrameTime < 14) { // >70fps
      this.optimizationSettings.dynamicQuality = false;
      this.optimizationSettings.prefetchEnabled = true;
    }
  }
  
  // Adaptive buffer size calculation
  calculateOptimalBufferSize(
    viewportHeight: number,
    itemHeight: number,
    scrollVelocity: number
  ): number {
    if (!this.optimizationSettings.adaptiveBuffering) {
      return 5; // Default buffer size
    }
    
    const visibleItems = Math.ceil(viewportHeight / itemHeight);
    const baseBuffer = Math.max(2, Math.ceil(visibleItems * 0.5));
    
    // Increase buffer based on scroll velocity
    const velocityMultiplier = Math.min(2, Math.abs(scrollVelocity) / 1000);
    const adaptiveBuffer = Math.ceil(baseBuffer * (1 + velocityMultiplier));
    
    // Limit buffer size based on performance
    const maxBuffer = this.performanceMetrics.averageFrameTime > 16 ? 10 : 20;
    
    return Math.min(adaptiveBuffer, maxBuffer);
  }
  
  // Dynamic quality adjustment
  shouldReduceQuality(): boolean {
    return this.optimizationSettings.dynamicQuality && 
           this.performanceMetrics.averageFrameTime > 18;
  }
  
  // Prefetch strategy
  shouldPrefetchContent(direction: 'up' | 'down', velocity: number): boolean {
    return this.optimizationSettings.prefetchEnabled && 
           velocity > 500 && // Fast scrolling
           this.performanceMetrics.averageFrameTime < 16; // Good performance
  }
  
  // Get performance report
  getPerformanceReport(): PerformanceReport {
    return {
      averageFrameTime: this.performanceMetrics.averageFrameTime,
      fps: 1000 / this.performanceMetrics.averageFrameTime,
      droppedFrames: this.performanceMetrics.droppedFrames,
      settings: { ...this.optimizationSettings },
      recommendations: this.generateRecommendations()
    };
  }
  
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.performanceMetrics.averageFrameTime > 20) {
      recommendations.push('Consider reducing buffer size or enabling dynamic quality');
    }
    
    if (this.performanceMetrics.droppedFrames > 100) {
      recommendations.push('High frame drop rate detected, consider performance optimizations');
    }
    
    return recommendations;
  }
}
```

## Scroll Position Synchronization

### Accurate Scroll Position Management

```typescript
// Precise scroll position synchronization
@Injectable()
export class ScrollPositionManager {
  private scrollState = {
    virtualScrollTop: 0,
    actualScrollTop: 0,
    scrollRatio: 0,
    maxScrollTop: 0,
    isScrolling: false,
    scrollDirection: 'none' as 'up' | 'down' | 'none',
    momentum: 0
  };
  
  private scrollSyncQueue = new Array<ScrollSyncOperation>();
  private animationFrameId?: number;
  
  constructor(private virtualScrollService: VirtualScrollService) {}
  
  // Update scroll position with synchronization
  updateScrollPosition(
    scrollTop: number,
    viewportHeight: number,
    totalHeight: number
  ): void {
    const previousScrollTop = this.scrollState.actualScrollTop;
    
    // Update scroll state
    this.scrollState.actualScrollTop = scrollTop;
    this.scrollState.maxScrollTop = Math.max(0, totalHeight - viewportHeight);
    this.scrollState.scrollRatio = this.scrollState.maxScrollTop > 0 
      ? scrollTop / this.scrollState.maxScrollTop 
      : 0;
    
    // Calculate scroll direction and momentum
    const scrollDelta = scrollTop - previousScrollTop;
    this.scrollState.scrollDirection = scrollDelta > 0 ? 'down' : 
                                      scrollDelta < 0 ? 'up' : 'none';
    this.scrollState.momentum = Math.abs(scrollDelta);
    
    // Update virtual scroll position
    this.updateVirtualScrollTop(scrollTop, totalHeight);
    
    // Handle scroll synchronization
    this.handleScrollSync();
  }
  
  private updateVirtualScrollTop(scrollTop: number, totalHeight: number): void {
    // Map actual scroll position to virtual position
    this.scrollState.virtualScrollTop = scrollTop;
    
    // Adjust for virtual content differences
    if (totalHeight !== this.getActualContentHeight()) {
      const ratio = totalHeight / this.getActualContentHeight();
      this.scrollState.virtualScrollTop = scrollTop * ratio;
    }
  }
  
  private handleScrollSync(): void {
    // Queue scroll synchronization operation
    const syncOperation: ScrollSyncOperation = {
      type: 'position',
      scrollTop: this.scrollState.actualScrollTop,
      virtualScrollTop: this.scrollState.virtualScrollTop,
      timestamp: performance.now()
    };
    
    this.scrollSyncQueue.push(syncOperation);
    
    // Process queue
    this.scheduleScrollSync();
  }
  
  private scheduleScrollSync(): void {
    if (this.animationFrameId) {
      return; // Already scheduled
    }
    
    this.animationFrameId = requestAnimationFrame(() => {
      this.processScrollSyncQueue();
      this.animationFrameId = undefined;
    });
  }
  
  private processScrollSyncQueue(): void {
    if (this.scrollSyncQueue.length === 0) {
      return;
    }
    
    // Get latest sync operation
    const latestSync = this.scrollSyncQueue[this.scrollSyncQueue.length - 1];
    
    // Update visible range based on scroll position
    const visibleRange = this.virtualScrollService.calculateVisibleRange(
      latestSync.virtualScrollTop,
      this.getViewportHeight(),
      this.getItemCount()
    );
    
    // Update virtual scroll service
    this.virtualScrollService.setVisibleRange(visibleRange);
    
    // Clear processed operations
    this.scrollSyncQueue.length = 0;
  }
  
  // Smooth scroll to position
  smoothScrollTo(targetPosition: number, duration = 300): Promise<void> {
    return new Promise(resolve => {
      const startPosition = this.scrollState.actualScrollTop;
      const distance = targetPosition - startPosition;
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeProgress = this.easeInOutCubic(progress);
        const currentPosition = startPosition + (distance * easeProgress);
        
        // Update scroll position
        this.setScrollPosition(currentPosition);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }
  
  // Scroll to specific item
  scrollToItem(itemIndex: number, alignment: 'start' | 'center' | 'end' = 'start'): Promise<void> {
    const itemPosition = this.virtualScrollService.getItemPosition(itemIndex);
    const itemHeight = this.virtualScrollService.getItemHeight(itemIndex);
    const viewportHeight = this.getViewportHeight();
    
    let targetPosition: number;
    
    switch (alignment) {
      case 'start':
        targetPosition = itemPosition;
        break;
      case 'center':
        targetPosition = itemPosition - (viewportHeight / 2) + (itemHeight / 2);
        break;
      case 'end':
        targetPosition = itemPosition - viewportHeight + itemHeight;
        break;
    }
    
    // Clamp to valid scroll range
    targetPosition = Math.max(0, Math.min(targetPosition, this.scrollState.maxScrollTop));
    
    return this.smoothScrollTo(targetPosition);
  }
  
  // Get current scroll state
  getScrollState(): ScrollState {
    return { ...this.scrollState };
  }
  
  // Check if position is visible
  isItemVisible(itemIndex: number): boolean {
    const itemPosition = this.virtualScrollService.getItemPosition(itemIndex);
    const itemHeight = this.virtualScrollService.getItemHeight(itemIndex);
    const scrollTop = this.scrollState.actualScrollTop;
    const viewportHeight = this.getViewportHeight();
    
    return itemPosition + itemHeight > scrollTop && 
           itemPosition < scrollTop + viewportHeight;
  }
  
  // Helper methods
  private setScrollPosition(position: number): void {
    const viewport = this.virtualScrollService.getViewportElement();
    if (viewport) {
      viewport.scrollTop = position;
    }
  }
  
  private getViewportHeight(): number {
    return this.virtualScrollService.getViewportHeight();
  }
  
  private getItemCount(): number {
    return this.virtualScrollService.getItemCount();
  }
  
  private getActualContentHeight(): number {
    const viewport = this.virtualScrollService.getViewportElement();
    return viewport ? viewport.scrollHeight : 0;
  }
}
```

## Dynamic Height Handling

### Variable Height Item Management

```typescript
// Advanced dynamic height handling
@Injectable()
export class DynamicHeightManager {
  private heightCache = new Map<number, number>();
  private estimatedHeight = 40;
  private heightDistribution = new Map<number, number>();
  private measuredItems = new Set<number>();
  
  constructor(private resizeObserver: ResizeObserver) {
    this.setupHeightObservation();
  }
  
  private setupHeightObservation(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const itemIndex = parseInt(entry.target.getAttribute('data-item-index') || '0');
        const newHeight = entry.contentRect.height;
        
        this.updateItemHeight(itemIndex, newHeight);
      });
    });
  }
  
  // Update item height and recalculate affected positions
  updateItemHeight(itemIndex: number, height: number): void {
    const oldHeight = this.heightCache.get(itemIndex) || this.estimatedHeight;
    
    if (Math.abs(oldHeight - height) < 1) {
      return; // No significant change
    }
    
    // Update height cache
    this.heightCache.set(itemIndex, height);
    this.measuredItems.add(itemIndex);
    
    // Update height distribution for better estimation
    this.updateHeightDistribution(height);
    
    // Recalculate estimated height
    this.recalculateEstimatedHeight();
    
    // Notify of height change
    this.notifyHeightChange(itemIndex, oldHeight, height);
  }
  
  private updateHeightDistribution(height: number): void {
    // Round to nearest 5px for distribution tracking
    const roundedHeight = Math.round(height / 5) * 5;
    const count = this.heightDistribution.get(roundedHeight) || 0;
    this.heightDistribution.set(roundedHeight, count + 1);
  }
  
  private recalculateEstimatedHeight(): void {
    if (this.heightDistribution.size === 0) {
      return;
    }
    
    // Find the most common height
    let maxCount = 0;
    let mostCommonHeight = this.estimatedHeight;
    
    this.heightDistribution.forEach((count, height) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonHeight = height;
      }
    });
    
    // Use weighted average of measured heights
    const measuredHeights = Array.from(this.heightCache.values());
    if (measuredHeights.length > 10) {
      const avgMeasured = measuredHeights.reduce((sum, h) => sum + h, 0) / measuredHeights.length;
      this.estimatedHeight = (mostCommonHeight * 0.3) + (avgMeasured * 0.7);
    } else {
      this.estimatedHeight = mostCommonHeight;
    }
  }
  
  // Get height for specific item
  getItemHeight(itemIndex: number): number {
    return this.heightCache.get(itemIndex) || this.estimatedHeight;
  }
  
  // Calculate total height with partial measurements
  calculateTotalHeight(itemCount: number): number {
    let totalHeight = 0;
    
    // Sum measured heights
    for (const [index, height] of this.heightCache.entries()) {
      totalHeight += height;
    }
    
    // Estimate remaining heights
    const unmeasuredCount = itemCount - this.heightCache.size;
    totalHeight += unmeasuredCount * this.estimatedHeight;
    
    return totalHeight;
  }
  
  // Find item at specific position with dynamic heights
  findItemAtPosition(position: number, itemCount: number): number {
    let currentPosition = 0;
    
    for (let index = 0; index < itemCount; index++) {
      const itemHeight = this.getItemHeight(index);
      
      if (currentPosition + itemHeight > position) {
        return index;
      }
      
      currentPosition += itemHeight;
    }
    
    return itemCount - 1;
  }
  
  // Get position of specific item
  getItemPosition(itemIndex: number): number {
    let position = 0;
    
    for (let i = 0; i < itemIndex; i++) {
      position += this.getItemHeight(i);
    }
    
    return position;
  }
  
  // Preload heights for range
  preloadHeights(startIndex: number, endIndex: number): void {
    for (let i = startIndex; i <= endIndex; i++) {
      if (!this.heightCache.has(i)) {
        // Trigger height measurement
        this.requestHeightMeasurement(i);
      }
    }
  }
  
  private requestHeightMeasurement(itemIndex: number): void {
    // This would trigger rendering of the item to measure its height
    // Implementation depends on the component architecture
    this.virtualScrollService.requestItemMeasurement(itemIndex);
  }
  
  private notifyHeightChange(itemIndex: number, oldHeight: number, newHeight: number): void {
    const heightDelta = newHeight - oldHeight;
    
    // Update positions cache for items after this one
    this.invalidatePositionsAfter(itemIndex);
    
    // Emit height change event
    this.heightChangeSubject.next({
      itemIndex,
      oldHeight,
      newHeight,
      heightDelta
    });
  }
  
  private invalidatePositionsAfter(itemIndex: number): void {
    // Clear cached positions for items after the changed item
    this.virtualScrollService.invalidatePositionCache(itemIndex + 1);
  }
  
  // Get height statistics for optimization
  getHeightStatistics(): HeightStatistics {
    const measuredHeights = Array.from(this.heightCache.values());
    
    return {
      measuredItems: this.measuredItems.size,
      estimatedHeight: this.estimatedHeight,
      averageHeight: measuredHeights.length > 0 
        ? measuredHeights.reduce((sum, h) => sum + h, 0) / measuredHeights.length 
        : this.estimatedHeight,
      minHeight: Math.min(...measuredHeights, this.estimatedHeight),
      maxHeight: Math.max(...measuredHeights, this.estimatedHeight),
      heightVariance: this.calculateHeightVariance(measuredHeights),
      isUniform: this.isHeightUniform()
    };
  }
  
  private calculateHeightVariance(heights: number[]): number {
    if (heights.length < 2) return 0;
    
    const avg = heights.reduce((sum, h) => sum + h, 0) / heights.length;
    const variance = heights.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / heights.length;
    
    return Math.sqrt(variance); // Standard deviation
  }
  
  private isHeightUniform(): boolean {
    const stats = this.getHeightStatistics();
    return stats.heightVariance < 5; // Heights vary by less than 5px
  }
}
```

This comprehensive virtual scrolling documentation provides maintainers with the detailed understanding needed to maintain, optimize, and extend the virtual scrolling implementation in the BLG Grid library.