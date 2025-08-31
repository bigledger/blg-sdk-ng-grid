# Signal Architecture

**Audience: Library Maintainers and Core Contributors**

This document provides comprehensive insights into the Angular Signals implementation within the BLG Grid library. Understanding the signal architecture is crucial for maintaining reactive performance, debugging signal-related issues, and extending the library's reactive capabilities.

## Table of Contents

- [Signal Architecture Overview](#signal-architecture-overview)
- [Signal Design Patterns](#signal-design-patterns)
- [Computed Signal Implementation](#computed-signal-implementation)
- [Effect Management](#effect-management)
- [Signal Performance Optimization](#signal-performance-optimization)
- [Signal Debugging](#signal-debugging)
- [Migration Strategies](#migration-strategies)
- [Advanced Signal Patterns](#advanced-signal-patterns)
- [Signal Testing Strategies](#signal-testing-strategies)

## Signal Architecture Overview

The BLG Grid library leverages Angular Signals as the primary reactive primitive, providing fine-grained reactivity, predictable change propagation, and excellent performance characteristics. The signal architecture is designed around several key principles:

### Core Signal Principles

1. **Immutable State**: All signals contain immutable data structures
2. **Single Responsibility**: Each signal represents a single piece of state
3. **Composition**: Complex state is built from composing simple signals
4. **Lazy Evaluation**: Computed signals only execute when needed
5. **Glitch-Free**: Consistent state across all signal updates
6. **Performance Optimized**: Minimal unnecessary computations

### Signal Hierarchy

```
                    GridStateSignals (Root)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ConfigSignals  DataSignals   UISignals
              │            │            │
    ┌─────────┼─────────┐  │    ┌───────┼───────┐
    ▼         ▼         ▼  ▼    ▼       ▼       ▼
 Columns   Features  Sorting Data  Selection Focus Theme
              │         │    │      │
              ▼         ▼    ▼      ▼
           Filtering  Processed  Metadata
              │       Data
              ▼         │
          Predicates    ▼
                    Paginated
                       Data
```

## Signal Design Patterns

### Foundation Signal Pattern

```typescript
// Base signal implementation for grid state
@Injectable({ providedIn: 'root' })
export class GridSignalStore {
  // Private source signals - never exposed directly
  private readonly _config = signal<GridConfig>({
    columns: [],
    features: { sorting: true, filtering: true, pagination: true }
  });
  
  private readonly _data = signal<any[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<Error | null>(null);
  
  // Public readonly computed signals
  readonly config = computed(() => this._config());
  readonly data = computed(() => this._data());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  
  // Derived state through computed signals
  readonly columns = computed(() => this._config().columns);
  readonly hasData = computed(() => this._data().length > 0);
  readonly isEmpty = computed(() => !this.hasData() && !this.loading());
  readonly hasError = computed(() => this._error() !== null);
  
  // State metadata
  readonly metadata = computed(() => ({
    dataCount: this._data().length,
    columnCount: this._config().columns.length,
    lastUpdated: Date.now(),
    status: this.loading() ? 'loading' : 
            this.hasError() ? 'error' : 
            this.hasData() ? 'ready' : 'empty'
  }));
  
  // Update methods with validation and optimization
  updateConfig(config: Partial<GridConfig>): void {
    this._config.update(current => {
      const newConfig = { ...current, ...config };
      this.validateConfig(newConfig);
      return newConfig;
    });
  }
  
  setData(data: any[]): void {
    // Batch related updates
    batch(() => {
      this._data.set([...data]); // Immutable copy
      this._loading.set(false);
      this._error.set(null);
    });
  }
  
  setError(error: Error): void {
    batch(() => {
      this._error.set(error);
      this._loading.set(false);
    });
  }
}
```

### Specialized Signal Services Pattern

```typescript
// Specialized signal service for selection management
@Injectable()
export class SelectionSignalService {
  private readonly _selectedRows = signal<ReadonlySet<number>>(new Set());
  private readonly _selectionMode = signal<'single' | 'multiple'>('multiple');
  private readonly _lastSelectedIndex = signal<number | null>(null);
  
  // Public computed signals
  readonly selectedRows = computed(() => this._selectedRows());
  readonly selectionMode = computed(() => this._selectionMode());
  readonly lastSelectedIndex = computed(() => this._lastSelectedIndex());
  
  // Complex computed state
  readonly selectionStats = computed(() => {
    const selected = this._selectedRows();
    return {
      count: selected.size,
      isEmpty: selected.size === 0,
      isSingle: selected.size === 1,
      isMultiple: selected.size > 1,
      indices: Array.from(selected).sort((a, b) => a - b),
      ranges: this.calculateSelectionRanges(selected)
    };
  });
  
  readonly canSelectRange = computed(() => 
    this._selectionMode() === 'multiple' && this._lastSelectedIndex() !== null
  );
  
  // Selection operations with signal updates
  selectRow(index: number): void {
    if (this._selectionMode() === 'single') {
      this.replaceSelection(new Set([index]));
    } else {
      this.addToSelection(index);
    }
    this._lastSelectedIndex.set(index);
  }
  
  selectRange(start: number, end: number): void {
    if (!this.canSelectRange()) return;
    
    const range = this.createRange(Math.min(start, end), Math.max(start, end));
    const newSelection = new Set([...this._selectedRows(), ...range]);
    
    this.replaceSelection(newSelection);
    this._lastSelectedIndex.set(end);
  }
  
  toggleRow(index: number): void {
    const current = this._selectedRows();
    const newSelection = new Set(current);
    
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      if (this._selectionMode() === 'single') {
        newSelection.clear();
      }
      newSelection.add(index);
    }
    
    this.replaceSelection(newSelection);
    this._lastSelectedIndex.set(index);
  }
  
  clearSelection(): void {
    this.replaceSelection(new Set());
    this._lastSelectedIndex.set(null);
  }
  
  // Helper methods
  private replaceSelection(newSelection: Set<number>): void {
    this._selectedRows.set(new Set(newSelection)); // Ensure immutability
  }
  
  private addToSelection(index: number): void {
    this._selectedRows.update(current => new Set([...current, index]));
  }
  
  private createRange(start: number, end: number): number[] {
    const range: number[] = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }
  
  private calculateSelectionRanges(selected: ReadonlySet<number>): Array<[number, number]> {
    const indices = Array.from(selected).sort((a, b) => a - b);
    const ranges: Array<[number, number]> = [];
    
    let rangeStart = indices[0];
    let rangeEnd = indices[0];
    
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === rangeEnd + 1) {
        rangeEnd = indices[i];
      } else {
        ranges.push([rangeStart, rangeEnd]);
        rangeStart = indices[i];
        rangeEnd = indices[i];
      }
    }
    
    if (indices.length > 0) {
      ranges.push([rangeStart, rangeEnd]);
    }
    
    return ranges;
  }
}
```

## Computed Signal Implementation

### Multi-Stage Data Processing Pipeline

```typescript
// Complex computed signal chain for data processing
@Injectable()
export class DataProcessingSignals {
  constructor(
    private gridState: GridSignalStore,
    private sortingService: SortingService,
    private filteringService: FilteringService,
    private groupingService: GroupingService
  ) {}
  
  // Stage 1: Raw data validation and preparation
  private readonly validatedData = computed(() => {
    const rawData = this.gridState.data();
    const columns = this.gridState.columns();
    
    // Validate data structure
    return this.validateAndSanitizeData(rawData, columns);
  });
  
  // Stage 2: Apply filters
  private readonly filteredData = computed(() => {
    const data = this.validatedData();
    const filters = this.gridState.filterDescriptors();
    
    if (filters.length === 0) {
      return data;
    }
    
    return this.filteringService.applyFilters(data, filters);
  });
  
  // Stage 3: Apply sorting
  private readonly sortedData = computed(() => {
    const data = this.filteredData();
    const sorts = this.gridState.sortDescriptors();
    
    if (sorts.length === 0) {
      return data;
    }
    
    return this.sortingService.applySorts(data, sorts);
  });
  
  // Stage 4: Apply grouping
  private readonly groupedData = computed(() => {
    const data = this.sortedData();
    const groups = this.gridState.groupDescriptors();
    
    if (groups.length === 0) {
      return { type: 'flat', data } as ProcessedData;
    }
    
    return {
      type: 'grouped',
      data: this.groupingService.applyGrouping(data, groups)
    } as ProcessedData;
  });
  
  // Stage 5: Apply pagination
  readonly paginatedData = computed(() => {
    const processedData = this.groupedData();
    const pagination = this.gridState.paginationState();
    
    if (processedData.type === 'flat') {
      const startIndex = pagination.currentPage * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      
      return {
        items: processedData.data.slice(startIndex, endIndex),
        totalCount: processedData.data.length,
        pageInfo: {
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalPages: Math.ceil(processedData.data.length / pagination.pageSize)
        }
      };
    }
    
    // Handle grouped data pagination
    return this.paginateGroupedData(processedData, pagination);
  });
  
  // Performance metrics computed signal
  readonly processingMetrics = computed(() => {
    const originalCount = this.gridState.data().length;
    const filteredCount = this.filteredData().length;
    const finalCount = this.paginatedData().items.length;
    
    return {
      originalCount,
      filteredCount,
      finalCount,
      filterReduction: originalCount > 0 ? (originalCount - filteredCount) / originalCount : 0,
      processingStages: {
        validation: !!this.validatedData(),
        filtering: this.gridState.filterDescriptors().length > 0,
        sorting: this.gridState.sortDescriptors().length > 0,
        grouping: this.gridState.groupDescriptors().length > 0,
        pagination: finalCount < filteredCount
      }
    };
  });
}
```

### Optimized Computed Signals with Memoization

```typescript
// Advanced computed signal with custom memoization
export class OptimizedComputedSignals {
  private memoCache = new Map<string, { value: any; deps: any[]; timestamp: number }>();
  
  // Memoized computed signal for expensive operations
  readonly expensiveComputation = computed(() => {
    const data = this.gridState.data();
    const config = this.gridState.config();
    
    // Create dependency key
    const depKey = this.createDependencyKey(data, config);
    const cached = this.memoCache.get('expensiveComputation');
    
    if (cached && this.areDepsEqual(cached.deps, [data, config])) {
      return cached.value;
    }
    
    // Perform expensive computation
    const result = this.performExpensiveOperation(data, config);
    
    // Cache the result
    this.memoCache.set('expensiveComputation', {
      value: result,
      deps: [data, config],
      timestamp: Date.now()
    });
    
    return result;
  });
  
  // Computed signal with custom equality check
  readonly optimizedSignal = computed(() => {
    const data = this.gridState.data();
    return this.processWithCustomEquality(data);
  }, {
    equal: (a, b) => this.customEqualityCheck(a, b)
  });
  
  private createDependencyKey(data: any[], config: GridConfig): string {
    return `${data.length}-${JSON.stringify(config)}`;
  }
  
  private areDepsEqual(deps1: any[], deps2: any[]): boolean {
    if (deps1.length !== deps2.length) return false;
    
    return deps1.every((dep, index) => {
      if (Array.isArray(dep) && Array.isArray(deps2[index])) {
        return dep.length === deps2[index].length;
      }
      return dep === deps2[index];
    });
  }
  
  private customEqualityCheck(a: any, b: any): boolean {
    // Custom equality logic for specific use cases
    if (a === b) return true;
    if (a == null || b == null) return false;
    
    // Check array equality by length and reference (for performance)
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a[0] === b[0] && a[a.length - 1] === b[b.length - 1];
    }
    
    return false;
  }
}
```

## Effect Management

### Strategic Effect Usage

```typescript
// Comprehensive effect management for side effects
@Injectable()
export class GridEffectManager {
  private effects = new Set<EffectRef>();
  
  constructor(
    private gridState: GridSignalStore,
    private persistenceService: PersistenceService,
    private analyticsService: AnalyticsService
  ) {
    this.setupCoreEffects();
  }
  
  private setupCoreEffects(): void {
    // Effect for state persistence
    const persistenceEffect = effect(() => {
      const state = {
        columns: this.gridState.columns(),
        sortDescriptors: this.gridState.sortDescriptors(),
        filterDescriptors: this.gridState.filterDescriptors(),
        paginationState: this.gridState.paginationState()
      };
      
      // Debounced persistence
      this.persistenceService.saveState(state);
    });
    
    this.effects.add(persistenceEffect);
    
    // Effect for analytics tracking
    const analyticsEffect = effect(() => {
      const metadata = this.gridState.metadata();
      
      // Track significant state changes
      if (metadata.status === 'ready' && metadata.dataCount > 0) {
        this.analyticsService.trackGridUsage({
          dataCount: metadata.dataCount,
          columnCount: metadata.columnCount,
          timestamp: metadata.lastUpdated
        });
      }
    });
    
    this.effects.add(analyticsEffect);
    
    // Effect for validation
    const validationEffect = effect(() => {
      const config = this.gridState.config();
      const data = this.gridState.data();
      
      // Validate configuration consistency
      this.validateConfigurationConsistency(config, data);
    });
    
    this.effects.add(validationEffect);
  }
  
  // Create controlled effects for specific use cases
  createDataSyncEffect(targetService: any): EffectRef {
    const syncEffect = effect(() => {
      const data = this.gridState.data();
      
      // Only sync when data actually changes
      untracked(() => {
        targetService.updateData(data);
      });
    });
    
    this.effects.add(syncEffect);
    return syncEffect;
  }
  
  // Effect cleanup
  destroyAllEffects(): void {
    this.effects.forEach(effect => effect.destroy());
    this.effects.clear();
  }
  
  destroyEffect(effect: EffectRef): void {
    if (this.effects.has(effect)) {
      effect.destroy();
      this.effects.delete(effect);
    }
  }
}
```

### Effect Performance Optimization

```typescript
// Performance-optimized effects
export class OptimizedEffectManager {
  
  // Batched effect for multiple related updates
  createBatchedEffect(signalGroups: Signal<any>[][]): EffectRef {
    return effect(() => {
      // Read all signals within untracked to avoid creating dependencies
      const values = untracked(() => 
        signalGroups.map(group => group.map(signal => signal()))
      );
      
      // Create actual dependencies only for signals that matter
      const relevantSignals = signalGroups[0]; // Primary group
      relevantSignals.forEach(signal => signal()); // Create dependencies
      
      // Process changes in batch
      this.processBatchedChanges(values);
    });
  }
  
  // Debounced effect for expensive operations
  createDebouncedEffect(signal: Signal<any>, debounceMs = 300): EffectRef {
    let timeoutId: number | null = null;
    
    return effect(() => {
      const value = signal();
      
      // Clear existing timeout
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      // Set new timeout
      timeoutId = window.setTimeout(() => {
        this.processExpensiveOperation(value);
        timeoutId = null;
      }, debounceMs);
    });
  }
  
  // Throttled effect for high-frequency updates
  createThrottledEffect(signal: Signal<any>, throttleMs = 100): EffectRef {
    let lastExecution = 0;
    let pendingValue: any = null;
    let timeoutId: number | null = null;
    
    return effect(() => {
      const value = signal();
      const now = Date.now();
      
      if (now - lastExecution >= throttleMs) {
        // Execute immediately
        this.processThrottledOperation(value);
        lastExecution = now;
      } else {
        // Schedule for later
        pendingValue = value;
        
        if (timeoutId === null) {
          const remainingTime = throttleMs - (now - lastExecution);
          timeoutId = window.setTimeout(() => {
            if (pendingValue !== null) {
              this.processThrottledOperation(pendingValue);
              pendingValue = null;
              lastExecution = Date.now();
            }
            timeoutId = null;
          }, remainingTime);
        }
      }
    });
  }
  
  // Conditional effect that only runs under certain conditions
  createConditionalEffect(
    condition: Signal<boolean>,
    targetSignal: Signal<any>
  ): EffectRef {
    return effect(() => {
      const shouldRun = condition();
      
      if (shouldRun) {
        const value = targetSignal();
        this.processConditionalOperation(value);
      }
      // If condition is false, targetSignal is not read, so no dependency is created
    });
  }
}
```

## Signal Performance Optimization

### Signal Optimization Patterns

```typescript
// Performance-optimized signal implementations
export class PerformanceOptimizedSignals {
  
  // Lazy computed signal that only computes when accessed
  readonly lazyExpensiveData = computed(() => {
    // Only compute if actually needed
    return this.computeExpensiveData();
  });
  
  // Cached computed signal with manual cache control
  private cacheKey = signal<string>('');
  private cachedResult = new Map<string, any>();
  
  readonly cachedComputation = computed(() => {
    const key = this.cacheKey();
    
    if (this.cachedResult.has(key)) {
      return this.cachedResult.get(key);
    }
    
    const result = this.performComputation();
    this.cachedResult.set(key, result);
    
    // Limit cache size
    if (this.cachedResult.size > 100) {
      const firstKey = this.cachedResult.keys().next().value;
      this.cachedResult.delete(firstKey);
    }
    
    return result;
  });
  
  // Signal with custom comparison for reference equality
  private readonly optimizedDataSignal = signal<any[]>([], {
    equal: (a, b) => {
      // Fast reference check first
      if (a === b) return true;
      
      // Length check for arrays
      if (a.length !== b.length) return false;
      
      // Sample comparison for large arrays (performance trade-off)
      if (a.length > 1000) {
        return a[0] === b[0] && a[a.length - 1] === b[b.length - 1];
      }
      
      // Full comparison for smaller arrays
      return a.every((item, index) => item === b[index]);
    }
  });
  
  // Optimized signal that minimizes object creation
  readonly optimizedMetadata = computed(() => {
    // Reuse object instance when possible
    const current = this._lastMetadata;
    const dataLength = this.gridState.data().length;
    const columnCount = this.gridState.columns().length;
    
    if (current && 
        current.dataLength === dataLength && 
        current.columnCount === columnCount) {
      return current;
    }
    
    // Create new object only when necessary
    this._lastMetadata = {
      dataLength,
      columnCount,
      timestamp: Date.now()
    };
    
    return this._lastMetadata;
  });
  
  private _lastMetadata: any = null;
}
```

### Signal Memory Management

```typescript
// Memory-efficient signal management
export class SignalMemoryManager {
  private signalRegistry = new WeakMap<object, Set<Signal<any>>>();
  private computedCache = new Map<string, WeakRef<any>>();
  
  // Register signals for cleanup tracking
  registerSignal<T>(owner: object, signal: Signal<T>): void {
    if (!this.signalRegistry.has(owner)) {
      this.signalRegistry.set(owner, new Set());
    }
    
    this.signalRegistry.get(owner)!.add(signal);
  }
  
  // Create memory-efficient computed signals
  createManagedComputed<T>(
    owner: object,
    computation: () => T,
    options?: CreateComputedOptions<T>
  ): Signal<T> {
    const computed = signal(computation, options);
    this.registerSignal(owner, computed);
    
    return computed;
  }
  
  // Cleanup signals associated with an owner
  cleanup(owner: object): void {
    const signals = this.signalRegistry.get(owner);
    
    if (signals) {
      signals.forEach(signal => {
        // If the signal has cleanup method, call it
        if ('destroy' in signal && typeof signal.destroy === 'function') {
          (signal as any).destroy();
        }
      });
      
      this.signalRegistry.delete(owner);
    }
  }
  
  // Cache computed results with weak references
  cacheComputedResult<T>(key: string, value: T): void {
    this.computedCache.set(key, new WeakRef(value));
    
    // Periodic cleanup of stale weak references
    if (this.computedCache.size > 1000) {
      this.cleanupStaleReferences();
    }
  }
  
  getCachedResult<T>(key: string): T | null {
    const weakRef = this.computedCache.get(key);
    
    if (weakRef) {
      const value = weakRef.deref();
      
      if (value !== undefined) {
        return value;
      } else {
        // Clean up stale reference
        this.computedCache.delete(key);
      }
    }
    
    return null;
  }
  
  private cleanupStaleReferences(): void {
    for (const [key, weakRef] of this.computedCache.entries()) {
      if (weakRef.deref() === undefined) {
        this.computedCache.delete(key);
      }
    }
  }
}
```

## Signal Debugging

### Signal Development Tools

```typescript
// Comprehensive signal debugging tools
@Injectable({ providedIn: 'root' })
export class SignalDebugService {
  private signalTracking = new Map<string, SignalTrackingInfo>();
  private isDebugMode = !environment.production;
  
  // Wrap signals with debugging capabilities
  debugSignal<T>(name: string, signal: Signal<T>): Signal<T> {
    if (!this.isDebugMode) {
      return signal;
    }
    
    const trackingInfo: SignalTrackingInfo = {
      name,
      accessCount: 0,
      lastAccessed: null,
      lastValue: undefined,
      changeHistory: []
    };
    
    this.signalTracking.set(name, trackingInfo);
    
    // Create debugging wrapper
    const debugWrapper = computed(() => {
      trackingInfo.accessCount++;
      trackingInfo.lastAccessed = Date.now();
      
      const value = signal();
      
      if (value !== trackingInfo.lastValue) {
        trackingInfo.changeHistory.push({
          timestamp: Date.now(),
          oldValue: trackingInfo.lastValue,
          newValue: value,
          stackTrace: new Error().stack
        });
        
        // Limit history size
        if (trackingInfo.changeHistory.length > 50) {
          trackingInfo.changeHistory.shift();
        }
        
        trackingInfo.lastValue = value;
        
        console.log(`📊 Signal '${name}' changed:`, {
          oldValue: trackingInfo.lastValue,
          newValue: value,
          accessCount: trackingInfo.accessCount
        });
      }
      
      return value;
    });
    
    return debugWrapper;
  }
  
  // Debug computed signal execution
  debugComputed<T>(
    name: string,
    computation: () => T,
    options?: CreateComputedOptions<T>
  ): Signal<T> {
    if (!this.isDebugMode) {
      return computed(computation, options);
    }
    
    let executionCount = 0;
    let totalExecutionTime = 0;
    
    const debugComputed = computed(() => {
      executionCount++;
      const startTime = performance.now();
      
      console.log(`🧮 Computing '${name}' (execution #${executionCount})`);
      
      const result = computation();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      totalExecutionTime += executionTime;
      
      console.log(`✅ Computed '${name}' in ${executionTime.toFixed(2)}ms (avg: ${(totalExecutionTime / executionCount).toFixed(2)}ms)`);
      
      return result;
    }, options);
    
    return debugComputed;
  }
  
  // Debug effect execution
  debugEffect(name: string, effectFn: () => void): EffectRef {
    if (!this.isDebugMode) {
      return effect(effectFn);
    }
    
    let executionCount = 0;
    
    return effect(() => {
      executionCount++;
      const startTime = performance.now();
      
      console.log(`🔄 Effect '${name}' executing (#${executionCount})`);
      
      effectFn();
      
      const endTime = performance.now();
      console.log(`✅ Effect '${name}' completed in ${(endTime - startTime).toFixed(2)}ms`);
    });
  }
  
  // Get debugging information
  getDebugInfo(): SignalDebugReport {
    return {
      signals: Object.fromEntries(this.signalTracking.entries()),
      summary: {
        totalSignals: this.signalTracking.size,
        mostAccessed: this.findMostAccessedSignal(),
        recentChanges: this.getRecentChanges()
      }
    };
  }
  
  // Performance analysis
  analyzeSignalPerformance(): PerformanceAnalysis {
    const analysis: PerformanceAnalysis = {
      hotSignals: [],
      slowComputations: [],
      recommendations: []
    };
    
    this.signalTracking.forEach((info, name) => {
      if (info.accessCount > 1000) {
        analysis.hotSignals.push({ name, accessCount: info.accessCount });
      }
      
      // Analyze change frequency
      const recentChanges = info.changeHistory.filter(
        change => change.timestamp > Date.now() - 60000 // Last minute
      );
      
      if (recentChanges.length > 100) {
        analysis.recommendations.push(
          `Signal '${name}' is changing very frequently (${recentChanges.length} times in the last minute). Consider optimization.`
        );
      }
    });
    
    return analysis;
  }
  
  private findMostAccessedSignal(): string | null {
    let maxAccess = 0;
    let mostAccessed: string | null = null;
    
    this.signalTracking.forEach((info, name) => {
      if (info.accessCount > maxAccess) {
        maxAccess = info.accessCount;
        mostAccessed = name;
      }
    });
    
    return mostAccessed;
  }
  
  private getRecentChanges(): Array<{ signal: string; timestamp: number }> {
    const recentChanges: Array<{ signal: string; timestamp: number }> = [];
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    this.signalTracking.forEach((info, name) => {
      info.changeHistory.forEach(change => {
        if (change.timestamp > fiveMinutesAgo) {
          recentChanges.push({ signal: name, timestamp: change.timestamp });
        }
      });
    });
    
    return recentChanges.sort((a, b) => b.timestamp - a.timestamp);
  }
}

// Development-time signal inspector
export function exposeSignalDebugger(debugService: SignalDebugService): void {
  if (!environment.production && typeof window !== 'undefined') {
    (window as any).blgSignalDebugger = {
      getDebugInfo: () => debugService.getDebugInfo(),
      analyzePerformance: () => debugService.analyzeSignalPerformance(),
      
      // Helper functions
      logAllSignals: () => {
        const info = debugService.getDebugInfo();
        console.table(info.signals);
      },
      
      logPerformanceAnalysis: () => {
        const analysis = debugService.analyzeSignalPerformance();
        console.group('📈 Signal Performance Analysis');
        console.log('Hot signals:', analysis.hotSignals);
        console.log('Recommendations:', analysis.recommendations);
        console.groupEnd();
      }
    };
    
    console.log('🔍 Signal debugger available at window.blgSignalDebugger');
  }
}
```

## Signal Testing Strategies

### Signal Testing Utilities

```typescript
// Comprehensive testing utilities for signals
export class SignalTestingUtils {
  
  // Test signal reactivity
  static testSignalReactivity<T>(
    signal: Signal<T>,
    updates: Array<{ action: () => void; expectedValue: T }>
  ): void {
    updates.forEach(({ action, expectedValue }, index) => {
      action();
      
      const actualValue = signal();
      expect(actualValue).toEqual(expectedValue, 
        `Signal reactivity test failed at step ${index + 1}`);
    });
  }
  
  // Test computed signal dependencies
  static testComputedDependencies<T>(
    computed: Signal<T>,
    dependencies: Signal<any>[],
    testCases: Array<{
      dependencyUpdates: Array<() => void>;
      expectedValue: T;
    }>
  ): void {
    testCases.forEach((testCase, index) => {
      // Apply dependency updates
      testCase.dependencyUpdates.forEach(update => update());
      
      // Check computed value
      const actualValue = computed();
      expect(actualValue).toEqual(testCase.expectedValue,
        `Computed dependencies test failed at case ${index + 1}`);
    });
  }
  
  // Test effect execution
  static testEffectExecution(
    effectFactory: () => EffectRef,
    signalUpdates: Array<() => void>,
    expectedExecutions: number
  ): void {
    let executionCount = 0;
    
    const mockEffect = jest.fn(() => {
      executionCount++;
    });
    
    // Create effect with mock
    const effect = effectFactory();
    
    // Apply signal updates
    signalUpdates.forEach(update => update());
    
    expect(executionCount).toBe(expectedExecutions);
    
    // Cleanup
    effect.destroy();
  }
  
  // Test signal performance
  static async benchmarkSignal<T>(
    signal: Signal<T>,
    updates: Array<() => void>,
    iterations: number = 1000
  ): Promise<BenchmarkResult> {
    const startTime = performance.now();
    let readTime = 0;
    let updateTime = 0;
    
    for (let i = 0; i < iterations; i++) {
      // Measure update time
      const updateStart = performance.now();
      updates[i % updates.length]();
      updateTime += performance.now() - updateStart;
      
      // Measure read time
      const readStart = performance.now();
      signal();
      readTime += performance.now() - readStart;
    }
    
    const totalTime = performance.now() - startTime;
    
    return {
      totalTime,
      updateTime,
      readTime,
      averageUpdateTime: updateTime / iterations,
      averageReadTime: readTime / iterations,
      iterations
    };
  }
  
  // Mock signals for testing
  static createMockSignal<T>(initialValue: T): MockSignal<T> {
    const signal = jest.fn(() => initialValue);
    let currentValue = initialValue;
    
    const mockSignal: MockSignal<T> = {
      ...signal,
      
      set: jest.fn((newValue: T) => {
        currentValue = newValue;
        signal.mockReturnValue(newValue);
      }),
      
      update: jest.fn((updater: (current: T) => T) => {
        const newValue = updater(currentValue);
        currentValue = newValue;
        signal.mockReturnValue(newValue);
      }),
      
      getCurrentValue: () => currentValue,
      getCallCount: () => signal.mock.calls.length,
      resetCallCount: () => signal.mockClear()
    };
    
    return mockSignal;
  }
}

// Example signal tests
describe('GridSignalStore', () => {
  let signalStore: GridSignalStore;
  
  beforeEach(() => {
    signalStore = new GridSignalStore();
  });
  
  it('should update config reactively', () => {
    const newConfig = { columns: [mockColumn], features: { sorting: true } };
    
    SignalTestingUtils.testSignalReactivity(
      signalStore.config,
      [
        {
          action: () => signalStore.updateConfig(newConfig),
          expectedValue: newConfig
        }
      ]
    );
  });
  
  it('should compute metadata correctly', () => {
    const testData = [{ id: 1 }, { id: 2 }];
    const testConfig = { columns: [mockColumn], features: {} };
    
    SignalTestingUtils.testComputedDependencies(
      signalStore.metadata,
      [signalStore.data, signalStore.config],
      [
        {
          dependencyUpdates: [
            () => signalStore.setData(testData),
            () => signalStore.updateConfig(testConfig)
          ],
          expectedValue: {
            dataCount: 2,
            columnCount: 1,
            lastUpdated: expect.any(Number),
            status: 'ready'
          }
        }
      ]
    );
  });
  
  it('should perform well under load', async () => {
    const updates = [
      () => signalStore.setData([{ id: 1 }]),
      () => signalStore.setData([{ id: 1 }, { id: 2 }]),
      () => signalStore.setData([{ id: 1 }, { id: 2 }, { id: 3 }])
    ];
    
    const benchmark = await SignalTestingUtils.benchmarkSignal(
      signalStore.data,
      updates,
      1000
    );
    
    expect(benchmark.averageReadTime).toBeLessThan(0.1); // < 0.1ms per read
    expect(benchmark.averageUpdateTime).toBeLessThan(1); // < 1ms per update
  });
});
```

This comprehensive signal architecture documentation provides maintainers with the deep understanding necessary to work effectively with the Angular Signals implementation in the BLG Grid library.