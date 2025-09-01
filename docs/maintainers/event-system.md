# Event System

**Audience: Library Maintainers and Core Contributors**

This document provides comprehensive coverage of the event system architecture within the BLG Grid library. Understanding the event system is crucial for maintaining reactive behavior, debugging event-related issues, and extending the library's interactive capabilities.

## Table of Contents

- [Event System Overview](#event-system-overview)
- [Event Architecture](#event-architecture)
- [Event Bus Implementation](#event-bus-implementation)
- [Component Event Handling](#component-event-handling)
- [Event Propagation Patterns](#event-propagation-patterns)
- [Performance Optimization](#performance-optimization)
- [Event Debugging](#event-debugging)
- [Custom Event Types](#custom-event-types)
- [Event Testing Strategies](#event-testing-strategies)
- [Memory Management](#memory-management)

## Event System Overview

The BLG Grid library implements a sophisticated event system that enables seamless communication between components, services, and external consumers. The system is designed around several key principles:

### Core Event Principles

1. **Type Safety**: All events are strongly typed with TypeScript interfaces
2. **Performance**: Minimal overhead with optimized event propagation
3. **Flexibility**: Support for synchronous and asynchronous event handling
4. **Isolation**: Events are scoped appropriately to prevent interference
5. **Extensibility**: Easy to add custom event types and handlers
6. **Debugging**: Comprehensive event tracking and debugging capabilities

### Event Categories

```typescript
// Event categorization for the grid system
export interface GridEventCategories {
  // Data-related events
  data: {
    'data.loaded': DataLoadedEvent;
    'data.changed': DataChangedEvent;
    'data.error': DataErrorEvent;
    'data.processing': DataProcessingEvent;
  };
  
  // User interaction events
  interaction: {
    'cell.click': CellClickEvent;
    'cell.doubleClick': CellDoubleClickEvent;
    'cell.rightClick': CellRightClickEvent;
    'row.select': RowSelectEvent;
    'row.deselect': RowDeselectEvent;
    'column.resize': ColumnResizeEvent;
    'column.sort': ColumnSortEvent;
  };
  
  // State change events
  state: {
    'sort.changed': SortChangedEvent;
    'filter.changed': FilterChangedEvent;
    'selection.changed': SelectionChangedEvent;
    'pagination.changed': PaginationChangedEvent;
  };
  
  // Lifecycle events
  lifecycle: {
    'grid.initialized': GridInitializedEvent;
    'grid.destroyed': GridDestroyedEvent;
    'grid.rendered': GridRenderedEvent;
    'grid.updated': GridUpdatedEvent;
  };
  
  // Performance events
  performance: {
    'scroll.start': ScrollStartEvent;
    'scroll.end': ScrollEndEvent;
    'render.start': RenderStartEvent;
    'render.complete': RenderCompleteEvent;
  };
}
```

## Event Architecture

### Hierarchical Event Structure

```
                    Global Event Bus
                          │
                    ┌─────┴─────┐
                    │           │
              Grid Instance   External
               Event Bus     Consumers
                    │
        ┌───────────┼───────────┐
        │           │           │
    Component    Service     Feature
    Events       Events      Events
        │           │           │
    ┌───┴───┐   ┌───┴───┐   ┌───┴───┐
    │       │   │       │   │       │
  Cell    Row  Data  State Sort  Filter
  Events Events Service Events Events
```

### Core Event Interfaces

```typescript
// Base event interface
export interface BaseGridEvent<T = any> {
  readonly type: string;
  readonly timestamp: number;
  readonly source: EventSource;
  readonly data: T;
  readonly metadata?: EventMetadata;
  
  // Event control
  preventDefault?(): void;
  stopPropagation?(): void;
  isDefaultPrevented?(): boolean;
  isPropagationStopped?(): boolean;
}

// Event source information
export interface EventSource {
  readonly componentType: string;
  readonly componentId?: string;
  readonly instanceId: string;
  readonly element?: HTMLElement;
}

// Event metadata for debugging and tracking
export interface EventMetadata {
  readonly correlationId?: string;
  readonly parentEventId?: string;
  readonly sequence?: number;
  readonly performance?: {
    startTime: number;
    duration?: number;
  };
  readonly debug?: {
    stackTrace?: string;
    context?: Record<string, any>;
  };
}

// Specific event type implementations
export interface CellClickEvent extends BaseGridEvent<CellEventData> {
  readonly type: 'cell.click';
  readonly data: {
    readonly rowIndex: number;
    readonly columnId: string;
    readonly value: any;
    readonly originalEvent: MouseEvent;
    readonly cellElement: HTMLElement;
  };
}

export interface SelectionChangedEvent extends BaseGridEvent<SelectionEventData> {
  readonly type: 'selection.changed';
  readonly data: {
    readonly selectedRows: ReadonlySet<number>;
    readonly previousSelection: ReadonlySet<number>;
    readonly addedRows: ReadonlySet<number>;
    readonly removedRows: ReadonlySet<number>;
    readonly selectionMode: 'single' | 'multiple';
  };
}
```

## Event Bus Implementation

### Core Event Bus Service

```typescript
@Injectable({ providedIn: 'root' })
export class GridEventBus {
  private readonly eventStreams = new Map<string, Subject<BaseGridEvent>>();
  private readonly globalStream = new Subject<BaseGridEvent>();
  private readonly eventHistory = new Array<BaseGridEvent>();
  private readonly subscriptions = new Map<string, Set<Subscription>>();
  
  // Event emission statistics
  private readonly stats = {
    totalEvents: 0,
    eventCounts: new Map<string, number>(),
    lastEmissionTime: 0,
    averageEmissionInterval: 0
  };
  
  constructor() {
    this.setupEventTracking();
  }
  
  private setupEventTracking(): void {
    if (!environment.production) {
      // Track all events in development
      this.globalStream.subscribe(event => {
        this.recordEventInHistory(event);
        this.updateStats(event);
      });
    }
  }
  
  // Emit event with full lifecycle management
  emit<T extends BaseGridEvent>(event: T): void {
    // Validate event
    this.validateEvent(event);
    
    // Add metadata
    const enrichedEvent = this.enrichEvent(event);
    
    // Emit to global stream
    this.globalStream.next(enrichedEvent);
    
    // Emit to specific event type stream
    const typeStream = this.getOrCreateStream(event.type);
    typeStream.next(enrichedEvent);
    
    // Update performance tracking
    this.trackEventPerformance(enrichedEvent);
  }
  
  // Subscribe to specific event types
  on<T extends BaseGridEvent>(
    eventType: string,
    handler: (event: T) => void,
    options?: EventSubscriptionOptions
  ): Subscription {
    const stream = this.getOrCreateStream(eventType);
    
    let observable = stream.asObservable() as Observable<T>;
    
    // Apply filters if specified
    if (options?.filter) {
      observable = observable.pipe(
        filter(event => options.filter!(event))
      );
    }
    
    // Apply debouncing if specified
    if (options?.debounceTime) {
      observable = observable.pipe(
        debounceTime(options.debounceTime)
      );
    }
    
    // Apply throttling if specified
    if (options?.throttleTime) {
      observable = observable.pipe(
        throttleTime(options.throttleTime)
      );
    }
    
    const subscription = observable.subscribe({
      next: handler,
      error: (error) => this.handleSubscriptionError(eventType, error)
    });
    
    // Track subscription for cleanup
    this.trackSubscription(eventType, subscription);
    
    return subscription;
  }
  
  // Subscribe to all events
  onAll(handler: (event: BaseGridEvent) => void): Subscription {
    return this.globalStream.subscribe({
      next: handler,
      error: (error) => this.handleSubscriptionError('*', error)
    });
  }
  
  // Subscribe with advanced filtering
  where<T extends BaseGridEvent>(
    predicate: (event: BaseGridEvent) => event is T
  ): Observable<T> {
    return this.globalStream.pipe(
      filter(predicate)
    );
  }
  
  // Create filtered event stream
  createFilteredStream<T extends BaseGridEvent>(
    eventTypes: string[],
    filter?: (event: T) => boolean
  ): Observable<T> {
    const streams = eventTypes.map(type => this.getOrCreateStream(type));
    const mergedStream = merge(...streams) as Observable<T>;
    
    return filter 
      ? mergedStream.pipe(rxFilter(filter))
      : mergedStream;
  }
  
  private validateEvent(event: BaseGridEvent): void {
    if (!event.type) {
      throw new Error('Event must have a type');
    }
    
    if (!event.timestamp) {
      throw new Error('Event must have a timestamp');
    }
    
    if (!event.source) {
      throw new Error('Event must have a source');
    }
  }
  
  private enrichEvent<T extends BaseGridEvent>(event: T): T {
    const enriched = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      metadata: {
        ...event.metadata,
        correlationId: event.metadata?.correlationId || this.generateCorrelationId(),
        sequence: this.stats.totalEvents,
        performance: {
          startTime: performance.now()
        }
      }
    };
    
    return enriched;
  }
  
  private getOrCreateStream(eventType: string): Subject<BaseGridEvent> {
    if (!this.eventStreams.has(eventType)) {
      this.eventStreams.set(eventType, new Subject<BaseGridEvent>());
    }
    
    return this.eventStreams.get(eventType)!;
  }
  
  private trackSubscription(eventType: string, subscription: Subscription): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    
    this.subscriptions.get(eventType)!.add(subscription);
  }
  
  private generateCorrelationId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private recordEventInHistory(event: BaseGridEvent): void {
    this.eventHistory.push(event);
    
    // Limit history size
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }
  }
  
  private updateStats(event: BaseGridEvent): void {
    this.stats.totalEvents++;
    
    const currentCount = this.stats.eventCounts.get(event.type) || 0;
    this.stats.eventCounts.set(event.type, currentCount + 1);
    
    // Update emission interval
    const now = Date.now();
    if (this.stats.lastEmissionTime > 0) {
      const interval = now - this.stats.lastEmissionTime;
      this.stats.averageEmissionInterval = 
        (this.stats.averageEmissionInterval * (this.stats.totalEvents - 1) + interval) / this.stats.totalEvents;
    }
    this.stats.lastEmissionTime = now;
  }
  
  private trackEventPerformance(event: BaseGridEvent): void {
    if (event.metadata?.performance) {
      const endTime = performance.now();
      event.metadata.performance.duration = endTime - event.metadata.performance.startTime;
    }
  }
  
  private handleSubscriptionError(eventType: string, error: any): void {
    console.error(`Event subscription error for type '${eventType}':`, error);
    
    // Emit error event
    this.emit({
      type: 'system.error',
      timestamp: Date.now(),
      source: {
        componentType: 'EventBus',
        instanceId: 'global'
      },
      data: {
        eventType,
        error: error.message || String(error)
      }
    } as BaseGridEvent);
  }
  
  // Cleanup methods
  unsubscribeAll(eventType?: string): void {
    if (eventType) {
      const subscriptions = this.subscriptions.get(eventType);
      if (subscriptions) {
        subscriptions.forEach(sub => sub.unsubscribe());
        subscriptions.clear();
      }
    } else {
      this.subscriptions.forEach(subscriptions => {
        subscriptions.forEach(sub => sub.unsubscribe());
        subscriptions.clear();
      });
    }
  }
  
  destroy(): void {
    this.unsubscribeAll();
    this.eventStreams.clear();
    this.subscriptions.clear();
    this.eventHistory.length = 0;
  }
  
  // Debugging and introspection
  getEventHistory(eventType?: string, limit = 100): BaseGridEvent[] {
    const history = eventType 
      ? this.eventHistory.filter(e => e.type === eventType)
      : this.eventHistory;
      
    return history.slice(-limit);
  }
  
  getEventStats(): EventBusStats {
    return {
      totalEvents: this.stats.totalEvents,
      eventTypesCounts: Object.fromEntries(this.stats.eventCounts),
      averageEmissionInterval: this.stats.averageEmissionInterval,
      activeSubscriptions: this.getActiveSubscriptionCount(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }
  
  private getActiveSubscriptionCount(): number {
    let count = 0;
    this.subscriptions.forEach(subscriptions => {
      count += subscriptions.size;
    });
    return count;
  }
  
  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    return this.eventHistory.length * 1024 + // ~1KB per event
           this.eventStreams.size * 512 + // ~512B per stream
           this.getActiveSubscriptionCount() * 256; // ~256B per subscription
  }
}

// Event subscription options
export interface EventSubscriptionOptions {
  filter?: (event: BaseGridEvent) => boolean;
  debounceTime?: number;
  throttleTime?: number;
  takeUntil?: Observable<any>;
}

// Event bus statistics
export interface EventBusStats {
  totalEvents: number;
  eventTypesCounts: Record<string, number>;
  averageEmissionInterval: number;
  activeSubscriptions: number;
  memoryUsage: number;
}
```

## Component Event Handling

### Grid Component Event Integration

```typescript
@Component({
  selector: 'ng-ui-lib',
  template: `
    <div class="ng-ui-lib-container"
         (click)="onContainerClick($event)"
         (keydown)="onContainerKeydown($event)"
         (scroll)="onContainerScroll($event)">
      
      <ng-ui-lib-header
        [columns]="columns()"
        (columnSort)="onColumnSort($event)"
        (columnResize)="onColumnResize($event)"
        (columnReorder)="onColumnReorder($event)">
      </ng-ui-lib-header>
      
      <ng-ui-lib-body
        [data]="displayData()"
        [columns]="columns()"
        (cellClick)="onCellClick($event)"
        (cellDoubleClick)="onCellDoubleClick($event)"
        (cellRightClick)="onCellRightClick($event)"
        (rowSelect)="onRowSelect($event)">
      </ng-ui-lib-body>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlgGridComponent implements OnInit, OnDestroy, AfterViewInit {
  // Event outputs for external consumers
  @Output() cellClick = new EventEmitter<CellClickEvent>();
  @Output() rowSelectionChanged = new EventEmitter<SelectionChangedEvent>();
  @Output() sortChanged = new EventEmitter<SortChangedEvent>();
  @Output() filterChanged = new EventEmitter<FilterChangedEvent>();
  
  private readonly componentId = `grid_${Math.random().toString(36).substr(2, 9)}`;
  private readonly eventSubscriptions = new Set<Subscription>();
  
  constructor(
    private eventBus: GridEventBus,
    private destroyRef: DestroyRef
  ) {
    this.setupInternalEventHandlers();
  }
  
  ngOnInit(): void {
    this.emitLifecycleEvent('grid.initialized');
  }
  
  ngAfterViewInit(): void {
    this.emitLifecycleEvent('grid.rendered');
  }
  
  private setupInternalEventHandlers(): void {
    // Subscribe to internal state changes
    const selectionSub = this.eventBus.on<SelectionChangedEvent>(
      'selection.changed',
      (event) => this.handleSelectionChanged(event),
      { filter: (event) => event.source.instanceId === this.componentId }
    );
    
    const sortSub = this.eventBus.on<SortChangedEvent>(
      'sort.changed',
      (event) => this.handleSortChanged(event),
      { debounceTime: 50 } // Debounce rapid sort changes
    );
    
    // Track subscriptions for cleanup
    this.eventSubscriptions.add(selectionSub);
    this.eventSubscriptions.add(sortSub);
    
    // Setup automatic cleanup
    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }
  
  // Cell event handlers
  onCellClick(event: CellClickEvent): void {
    // Emit internal event
    this.emitEvent('cell.click', {
      rowIndex: event.data.rowIndex,
      columnId: event.data.columnId,
      value: event.data.value,
      originalEvent: event.data.originalEvent,
      cellElement: event.data.cellElement
    });
    
    // Emit external event
    this.cellClick.emit(event);
    
    // Handle any internal logic
    this.handleCellInteraction(event);
  }
  
  onCellDoubleClick(event: CellDoubleClickEvent): void {
    this.emitEvent('cell.doubleClick', {
      rowIndex: event.data.rowIndex,
      columnId: event.data.columnId,
      value: event.data.value,
      originalEvent: event.data.originalEvent,
      cellElement: event.data.cellElement
    });
    
    // Handle edit mode activation
    this.activateEditMode(event.data.rowIndex, event.data.columnId);
  }
  
  onCellRightClick(event: CellRightClickEvent): void {
    // Prevent default context menu
    event.data.originalEvent.preventDefault();
    
    this.emitEvent('cell.rightClick', event.data);
    
    // Show custom context menu
    this.showContextMenu(event.data.cellElement, event.data);
  }
  
  // Row event handlers
  onRowSelect(event: RowSelectEvent): void {
    // Update selection state
    this.updateRowSelection(event.data.rowIndex, event.data.selected, event.data.ctrlKey, event.data.shiftKey);
  }
  
  // Column event handlers
  onColumnSort(event: ColumnSortEvent): void {
    this.emitEvent('column.sort', {
      columnId: event.data.columnId,
      direction: event.data.direction,
      multiSort: event.data.multiSort
    });
    
    // Update internal sort state
    this.updateSortState(event.data.columnId, event.data.direction, event.data.multiSort);
  }
  
  onColumnResize(event: ColumnResizeEvent): void {
    this.emitEvent('column.resize', {
      columnId: event.data.columnId,
      width: event.data.width,
      originalWidth: event.data.originalWidth
    });
    
    // Update column configuration
    this.updateColumnWidth(event.data.columnId, event.data.width);
  }
  
  // Container event handlers
  onContainerClick(event: MouseEvent): void {
    // Handle clicks outside cells (deselection)
    if (event.target === event.currentTarget) {
      this.clearSelection();
    }
  }
  
  onContainerKeydown(event: KeyboardEvent): void {
    this.handleKeyboardNavigation(event);
  }
  
  onContainerScroll(event: Event): void {
    const scrollEvent: ScrollStartEvent = {
      type: 'scroll.start',
      timestamp: Date.now(),
      source: this.createEventSource(),
      data: {
        scrollTop: (event.target as HTMLElement).scrollTop,
        scrollLeft: (event.target as HTMLElement).scrollLeft,
        direction: this.calculateScrollDirection(event)
      }
    };
    
    this.emitEvent('scroll.start', scrollEvent.data);
  }
  
  // Internal event handlers
  private handleSelectionChanged(event: SelectionChangedEvent): void {
    // Update UI state
    this.updateSelectionUI(event.data.selectedRows);
    
    // Emit external event
    this.rowSelectionChanged.emit(event);
  }
  
  private handleSortChanged(event: SortChangedEvent): void {
    // Update column headers
    this.updateSortIndicators(event.data.sortDescriptors);
    
    // Emit external event
    this.sortChanged.emit(event);
  }
  
  // Event emission helpers
  private emitEvent<T>(type: string, data: T): void {
    const event: BaseGridEvent<T> = {
      type,
      timestamp: Date.now(),
      source: this.createEventSource(),
      data,
      metadata: {
        correlationId: this.generateCorrelationId()
      }
    };
    
    this.eventBus.emit(event);
  }
  
  private emitLifecycleEvent(type: string): void {
    this.emitEvent(type, {
      componentId: this.componentId,
      timestamp: Date.now()
    });
  }
  
  private createEventSource(): EventSource {
    return {
      componentType: 'BlgGridComponent',
      componentId: this.componentId,
      instanceId: this.componentId,
      element: this.elementRef?.nativeElement
    };
  }
  
  // Cleanup
  private cleanup(): void {
    this.eventSubscriptions.forEach(sub => sub.unsubscribe());
    this.eventSubscriptions.clear();
    
    this.emitLifecycleEvent('grid.destroyed');
  }
}
```

## Event Propagation Patterns

### Event Propagation Flow

```typescript
// Event propagation management
@Injectable()
export class EventPropagationManager {
  private readonly propagationRules = new Map<string, PropagationRule>();
  private readonly eventChains = new Map<string, EventChain>();
  
  constructor() {
    this.setupDefaultPropagationRules();
  }
  
  private setupDefaultPropagationRules(): void {
    // Cell events propagate to row, then grid
    this.addPropagationRule('cell.*', {
      propagateTo: ['row', 'grid'],
      stopConditions: ['preventDefault'],
      transformers: [this.cellToRowTransformer, this.rowToGridTransformer]
    });
    
    // Row events propagate to grid
    this.addPropagationRule('row.*', {
      propagateTo: ['grid'],
      stopConditions: ['preventDefault'],
      transformers: [this.rowToGridTransformer]
    });
    
    // State events propagate globally
    this.addPropagationRule('state.*', {
      propagateTo: ['global'],
      stopConditions: [],
      transformers: []
    });
  }
  
  // Add custom propagation rule
  addPropagationRule(eventPattern: string, rule: PropagationRule): void {
    this.propagationRules.set(eventPattern, rule);
  }
  
  // Process event propagation
  processEventPropagation(event: BaseGridEvent): void {
    const matchingRules = this.findMatchingRules(event.type);
    
    matchingRules.forEach(rule => {
      if (this.shouldStopPropagation(event, rule)) {
        return;
      }
      
      this.propagateEvent(event, rule);
    });
  }
  
  private findMatchingRules(eventType: string): PropagationRule[] {
    const matchingRules: PropagationRule[] = [];
    
    this.propagationRules.forEach((rule, pattern) => {
      if (this.matchesPattern(eventType, pattern)) {
        matchingRules.push(rule);
      }
    });
    
    return matchingRules;
  }
  
  private matchesPattern(eventType: string, pattern: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*');
      
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(eventType);
  }
  
  private shouldStopPropagation(event: BaseGridEvent, rule: PropagationRule): boolean {
    return rule.stopConditions.some(condition => {
      switch (condition) {
        case 'preventDefault':
          return event.isDefaultPrevented?.();
        case 'stopPropagation':
          return event.isPropagationStopped?.();
        default:
          return false;
      }
    });
  }
  
  private propagateEvent(event: BaseGridEvent, rule: PropagationRule): void {
    rule.propagateTo.forEach((target, index) => {
      let propagatedEvent = event;
      
      // Apply transformers
      if (rule.transformers[index]) {
        propagatedEvent = rule.transformers[index](event);
      }
      
      // Emit propagated event
      this.emitPropagatedEvent(propagatedEvent, target);
    });
  }
  
  private emitPropagatedEvent(event: BaseGridEvent, target: string): void {
    // Implementation would emit to specific target bus
    // This could be component-specific buses, global bus, etc.
  }
  
  // Event transformers
  private cellToRowTransformer = (event: BaseGridEvent): BaseGridEvent => {
    return {
      ...event,
      type: event.type.replace('cell.', 'row.'),
      source: {
        ...event.source,
        componentType: 'BlgRowComponent'
      }
    };
  };
  
  private rowToGridTransformer = (event: BaseGridEvent): BaseGridEvent => {
    return {
      ...event,
      type: event.type.replace('row.', 'grid.'),
      source: {
        ...event.source,
        componentType: 'BlgGridComponent'
      }
    };
  };
}

// Propagation rule interface
export interface PropagationRule {
  propagateTo: string[];
  stopConditions: string[];
  transformers: Array<(event: BaseGridEvent) => BaseGridEvent>;
}

// Event chain tracking
export interface EventChain {
  originalEvent: BaseGridEvent;
  propagatedEvents: BaseGridEvent[];
  completed: boolean;
  duration: number;
}
```

## Performance Optimization

### Event Performance Optimization

```typescript
// Event performance optimization service
@Injectable()
export class EventPerformanceOptimizer {
  private readonly eventMetrics = new Map<string, EventMetrics>();
  private readonly optimizationStrategies = new Map<string, OptimizationStrategy>();
  private readonly performanceThresholds = {
    highFrequency: 100, // events per second
    slowHandler: 16,    // milliseconds
    memoryWarning: 10   // MB
  };
  
  constructor() {
    this.setupOptimizationStrategies();
    this.startPerformanceMonitoring();
  }
  
  private setupOptimizationStrategies(): void {
    // Debounce high-frequency events
    this.addOptimizationStrategy('scroll.*', {
      type: 'debounce',
      threshold: 16, // 60fps
      maxDelay: 100
    });
    
    // Throttle user interaction events
    this.addOptimizationStrategy('cell.click', {
      type: 'throttle',
      threshold: 50,
      leadingEdge: true
    });
    
    // Batch state change events
    this.addOptimizationStrategy('state.*', {
      type: 'batch',
      threshold: 5, // batch size
      maxDelay: 32  // ~30fps
    });
  }
  
  // Add optimization strategy for event type
  addOptimizationStrategy(eventPattern: string, strategy: OptimizationStrategy): void {
    this.optimizationStrategies.set(eventPattern, strategy);
  }
  
  // Optimize event handler
  optimizeEventHandler<T extends BaseGridEvent>(
    eventType: string,
    handler: (event: T) => void
  ): (event: T) => void {
    const strategy = this.findOptimizationStrategy(eventType);
    
    if (!strategy) {
      return handler;
    }
    
    switch (strategy.type) {
      case 'debounce':
        return this.createDebouncedHandler(handler, strategy);
      case 'throttle':
        return this.createThrottledHandler(handler, strategy);
      case 'batch':
        return this.createBatchedHandler(handler, strategy);
      default:
        return handler;
    }
  }
  
  private findOptimizationStrategy(eventType: string): OptimizationStrategy | null {
    for (const [pattern, strategy] of this.optimizationStrategies.entries()) {
      if (this.matchesPattern(eventType, pattern)) {
        return strategy;
      }
    }
    return null;
  }
  
  private createDebouncedHandler<T>(
    handler: (event: T) => void,
    strategy: OptimizationStrategy
  ): (event: T) => void {
    let timeoutId: number | null = null;
    let lastEvent: T | null = null;
    
    return (event: T) => {
      lastEvent = event;
      
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = window.setTimeout(() => {
        if (lastEvent) {
          this.measureHandlerPerformance(handler, lastEvent);
        }
        timeoutId = null;
        lastEvent = null;
      }, strategy.threshold);
    };
  }
  
  private createThrottledHandler<T>(
    handler: (event: T) => void,
    strategy: OptimizationStrategy
  ): (event: T) => void {
    let lastExecution = 0;
    let pendingEvent: T | null = null;
    let timeoutId: number | null = null;
    
    return (event: T) => {
      const now = Date.now();
      
      if (now - lastExecution >= strategy.threshold) {
        // Execute immediately
        this.measureHandlerPerformance(handler, event);
        lastExecution = now;
      } else if (strategy.leadingEdge && !timeoutId) {
        // Schedule trailing execution
        pendingEvent = event;
        const remainingTime = strategy.threshold - (now - lastExecution);
        
        timeoutId = window.setTimeout(() => {
          if (pendingEvent) {
            this.measureHandlerPerformance(handler, pendingEvent);
            lastExecution = Date.now();
          }
          timeoutId = null;
          pendingEvent = null;
        }, remainingTime);
      }
    };
  }
  
  private createBatchedHandler<T>(
    handler: (event: T) => void,
    strategy: OptimizationStrategy
  ): (event: T) => void {
    const batch: T[] = [];
    let timeoutId: number | null = null;
    
    return (event: T) => {
      batch.push(event);
      
      // Process batch if size threshold reached
      if (batch.length >= strategy.threshold) {
        this.processBatch(handler, batch);
        return;
      }
      
      // Schedule batch processing
      if (timeoutId === null) {
        timeoutId = window.setTimeout(() => {
          this.processBatch(handler, batch);
          timeoutId = null;
        }, strategy.maxDelay);
      }
    };
  }
  
  private processBatch<T>(handler: (event: T) => void, batch: T[]): void {
    const startTime = performance.now();
    
    batch.forEach(event => handler(event));
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Record batch performance
    this.recordBatchMetrics(batch.length, duration);
    
    // Clear batch
    batch.length = 0;
  }
  
  private measureHandlerPerformance<T>(handler: (event: T) => void, event: T): void {
    const startTime = performance.now();
    
    try {
      handler(event);
    } catch (error) {
      console.error('Event handler error:', error);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Record metrics
    this.recordHandlerMetrics((event as any).type, duration);
    
    // Check for performance warnings
    if (duration > this.performanceThresholds.slowHandler) {
      console.warn(`Slow event handler detected: ${(event as any).type} took ${duration.toFixed(2)}ms`);
    }
  }
  
  private recordHandlerMetrics(eventType: string, duration: number): void {
    if (!this.eventMetrics.has(eventType)) {
      this.eventMetrics.set(eventType, {
        totalEvents: 0,
        totalDuration: 0,
        averageDuration: 0,
        maxDuration: 0,
        minDuration: Infinity
      });
    }
    
    const metrics = this.eventMetrics.get(eventType)!;
    metrics.totalEvents++;
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / metrics.totalEvents;
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    metrics.minDuration = Math.min(metrics.minDuration, duration);
  }
  
  private recordBatchMetrics(batchSize: number, duration: number): void {
    // Record batch processing metrics
  }
  
  private startPerformanceMonitoring(): void {
    // Monitor event frequency and performance
    setInterval(() => {
      this.analyzePerformanceMetrics();
    }, 5000); // Every 5 seconds
  }
  
  private analyzePerformanceMetrics(): void {
    this.eventMetrics.forEach((metrics, eventType) => {
      if (metrics.averageDuration > this.performanceThresholds.slowHandler) {
        console.warn(`Event type ${eventType} has slow average duration: ${metrics.averageDuration.toFixed(2)}ms`);
      }
    });
  }
  
  // Get performance report
  getPerformanceReport(): EventPerformanceReport {
    const report: EventPerformanceReport = {
      eventMetrics: Object.fromEntries(this.eventMetrics),
      totalEvents: Array.from(this.eventMetrics.values()).reduce((sum, m) => sum + m.totalEvents, 0),
      slowEvents: this.findSlowEvents(),
      recommendations: this.generatePerformanceRecommendations()
    };
    
    return report;
  }
  
  private findSlowEvents(): Array<{ eventType: string; avgDuration: number }> {
    const slowEvents: Array<{ eventType: string; avgDuration: number }> = [];
    
    this.eventMetrics.forEach((metrics, eventType) => {
      if (metrics.averageDuration > this.performanceThresholds.slowHandler) {
        slowEvents.push({
          eventType,
          avgDuration: metrics.averageDuration
        });
      }
    });
    
    return slowEvents.sort((a, b) => b.avgDuration - a.avgDuration);
  }
  
  private generatePerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const slowEvents = this.findSlowEvents();
    if (slowEvents.length > 0) {
      recommendations.push(`Consider optimizing handlers for: ${slowEvents.map(e => e.eventType).join(', ')}`);
    }
    
    return recommendations;
  }
}

// Performance interfaces
export interface OptimizationStrategy {
  type: 'debounce' | 'throttle' | 'batch';
  threshold: number;
  maxDelay?: number;
  leadingEdge?: boolean;
}

export interface EventMetrics {
  totalEvents: number;
  totalDuration: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
}

export interface EventPerformanceReport {
  eventMetrics: Record<string, EventMetrics>;
  totalEvents: number;
  slowEvents: Array<{ eventType: string; avgDuration: number }>;
  recommendations: string[];
}
```

This comprehensive event system documentation provides maintainers with the deep understanding necessary to manage, optimize, and extend the event-driven architecture of the BLG Grid library.