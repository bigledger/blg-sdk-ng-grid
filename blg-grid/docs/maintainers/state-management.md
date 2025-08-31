# State Management

**Audience: Library Maintainers and Core Contributors**

This document provides a comprehensive understanding of how state is managed internally within the BLG Grid library. It covers the reactive state architecture, state synchronization, and advanced state management patterns used throughout the library.

## Table of Contents

- [State Architecture Overview](#state-architecture-overview)
- [Signal-Based State System](#signal-based-state-system)
- [State Composition and Hierarchy](#state-composition-and-hierarchy)
- [State Synchronization](#state-synchronization)
- [Performance Optimizations](#performance-optimizations)
- [State Persistence](#state-persistence)
- [State Validation](#state-validation)
- [Debugging State Issues](#debugging-state-issues)
- [Advanced State Patterns](#advanced-state-patterns)

## State Architecture Overview

The BLG Grid library uses a hybrid state management approach combining Angular Signals for reactive state with service-based state coordination. This architecture provides fine-grained reactivity, excellent performance, and maintainable state patterns.

### Core State Principles

1. **Single Source of Truth**: Each piece of state has one authoritative source
2. **Immutable Updates**: State changes create new state objects
3. **Reactive Propagation**: State changes automatically trigger dependent updates
4. **Predictable Flow**: State changes follow well-defined patterns
5. **Performance Optimized**: Minimal change detection and efficient updates

### State Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  State Actions  │───▶│   State Store   │
│   (Events)      │    │  (Services)     │    │   (Signals)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │◀───│   Computed      │◀───│  State Changes  │
│   (Templates)   │    │   Signals       │    │  (Reactivity)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Signal-Based State System

### Core State Service

```typescript
@Injectable({ providedIn: 'root' })
export class GridStateService {
  // Private state signals - internal only
  private readonly _config = signal<GridConfig>({
    columns: [],
    features: { sorting: true, filtering: true }
  });
  
  private readonly _data = signal<any[]>([]);
  private readonly _selectedRows = signal<Set<number>>(new Set());
  private readonly _sortDescriptors = signal<SortDescriptor[]>([]);
  private readonly _filterDescriptors = signal<FilterDescriptor[]>([]);
  private readonly _paginationState = signal<PaginationState>({
    currentPage: 0,
    pageSize: 25,
    totalItems: 0
  });
  
  private readonly _uiState = signal<UIState>({
    loading: false,
    scrollPosition: { x: 0, y: 0 },
    focusedCell: null,
    expandedGroups: new Set()
  });
  
  // Public readonly computed signals
  readonly config = computed(() => this._config());
  readonly data = computed(() => this._data());
  readonly selectedRows = computed(() => this._selectedRows());
  readonly sortDescriptors = computed(() => this._sortDescriptors());
  readonly filterDescriptors = computed(() => this._filterDescriptors());
  readonly paginationState = computed(() => this._paginationState());
  readonly uiState = computed(() => this._uiState());
  
  // Complex computed state
  readonly processedData = computed(() => {
    const data = this._data();
    const sorts = this._sortDescriptors();
    const filters = this._filterDescriptors();
    
    // Multi-stage processing pipeline
    return this.dataProcessor.process(data, { sorts, filters });
  });
  
  readonly displayData = computed(() => {
    const processed = this.processedData();
    const pagination = this._paginationState();
    
    // Apply pagination
    const startIndex = pagination.currentPage * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    
    return processed.slice(startIndex, endIndex);
  });
  
  readonly gridMetadata = computed(() => ({
    totalRows: this.processedData().length,
    displayedRows: this.displayData().length,
    selectedCount: this._selectedRows().size,
    hasActiveFilters: this._filterDescriptors().length > 0,
    hasActiveSort: this._sortDescriptors().length > 0,
    isLoading: this._uiState().loading
  }));
  
  constructor(
    private dataProcessor: DataProcessingService,
    private validationService: StateValidationService
  ) {
    // Set up state validation
    effect(() => {
      const config = this._config();
      this.validationService.validateConfig(config);
    });
    
    // Set up automatic total items update
    effect(() => {
      const processedLength = this.processedData().length;
      this._paginationState.update(state => ({
        ...state,
        totalItems: processedLength
      }));
    });
  }
}
```

### State Update Methods

```typescript
// State mutation methods with validation and optimization
export class GridStateService {
  
  // Configuration updates
  updateConfig(config: Partial<GridConfig>): void {
    this._config.update(current => {
      const newConfig = { ...current, ...config };
      
      // Validate configuration
      this.validationService.validateConfig(newConfig);
      
      return newConfig;
    });
  }
  
  updateColumns(columns: ColumnDefinition[]): void {
    this._config.update(current => ({
      ...current,
      columns: [...columns] // Immutable update
    }));
  }
  
  // Data updates with performance optimization
  setData(data: any[]): void {
    // Batch multiple state updates
    this.batchStateUpdates(() => {
      this._data.set([...data]); // Immutable copy
      this._selectedRows.set(new Set()); // Clear selection on data change
      
      // Reset pagination to first page
      this._paginationState.update(state => ({
        ...state,
        currentPage: 0
      }));
    });
  }
  
  // Selection management with batch updates
  updateSelection(updates: SelectionUpdate[]): void {
    this._selectedRows.update(current => {
      const newSelection = new Set(current);
      
      updates.forEach(update => {
        if (update.selected) {
          newSelection.add(update.rowIndex);
        } else {
          newSelection.delete(update.rowIndex);
        }
      });
      
      return newSelection;
    });
  }
  
  // Optimized sort updates
  updateSort(columnId: string, direction: SortDirection | null, multiSort = false): void {
    this._sortDescriptors.update(current => {
      if (direction === null) {
        // Remove sort for this column
        return current.filter(sort => sort.columnId !== columnId);
      }
      
      if (multiSort) {
        // Multi-column sorting
        const existingIndex = current.findIndex(sort => sort.columnId === columnId);
        
        if (existingIndex >= 0) {
          // Update existing sort
          const updated = [...current];
          updated[existingIndex] = { ...updated[existingIndex], direction };
          return updated;
        } else {
          // Add new sort
          return [...current, { 
            columnId, 
            direction, 
            priority: current.length 
          }];
        }
      } else {
        // Single column sorting (replace all)
        return [{ columnId, direction, priority: 0 }];
      }
    });
  }
  
  // Optimized filter updates
  updateFilters(columnId: string, filterValue: any): void {
    this._filterDescriptors.update(current => {
      const existingIndex = current.findIndex(filter => filter.columnId === columnId);
      
      if (filterValue === null || filterValue === undefined || filterValue === '') {
        // Remove filter
        return existingIndex >= 0 
          ? current.filter((_, index) => index !== existingIndex)
          : current;
      }
      
      const newFilter: FilterDescriptor = {
        columnId,
        operator: this.getDefaultOperatorForValue(filterValue),
        value: filterValue
      };
      
      if (existingIndex >= 0) {
        // Update existing filter
        const updated = [...current];
        updated[existingIndex] = newFilter;
        return updated;
      } else {
        // Add new filter
        return [...current, newFilter];
      }
    });
  }
  
  // Batch state updates for performance
  private batchStateUpdates(updateFn: () => void): void {
    // Temporarily disable reactivity during batch updates
    untracked(() => {
      updateFn();
    });
    
    // Trigger single change detection cycle
    this.triggerChangeDetection();
  }
}
```

## State Composition and Hierarchy

### Hierarchical State Structure

```typescript
// Top-level state composition
export interface GridState {
  // Core data state
  data: {
    original: any[];
    processed: any[];
    loading: boolean;
    error: Error | null;
  };
  
  // Configuration state
  config: {
    grid: GridConfig;
    columns: ColumnDefinition[];
    features: FeatureConfig;
  };
  
  // User interaction state
  interaction: {
    selection: SelectionState;
    focus: FocusState;
    editing: EditingState;
    scrolling: ScrollingState;
  };
  
  // Processing state
  processing: {
    sort: SortDescriptor[];
    filter: FilterDescriptor[];
    group: GroupDescriptor[];
    pagination: PaginationState;
  };
  
  // UI state
  ui: {
    density: 'compact' | 'comfortable' | 'spacious';
    theme: string;
    expandedGroups: Set<string>;
    columnWidths: Map<string, number>;
    columnOrder: string[];
  };
}

// State slice services for complex state domains
@Injectable()
export class SelectionStateService {
  private readonly _selectedRows = signal<Set<number>>(new Set());
  private readonly _selectionMode = signal<'single' | 'multiple'>('multiple');
  private readonly _lastSelectedIndex = signal<number | null>(null);
  
  readonly selectedRows = this._selectedRows.asReadonly();
  readonly selectionMode = this._selectionMode.asReadonly();
  readonly lastSelectedIndex = this._lastSelectedIndex.asReadonly();
  
  // Computed selection metadata
  readonly selectionSummary = computed(() => {
    const selected = this._selectedRows();
    const mode = this._selectionMode();
    
    return {
      count: selected.size,
      mode,
      hasSelection: selected.size > 0,
      isAllSelected: false, // Would be calculated based on data
      ranges: this.calculateSelectionRanges(Array.from(selected))
    };
  });
  
  // Selection operations
  selectRange(start: number, end: number): void {
    const [startIndex, endIndex] = [Math.min(start, end), Math.max(start, end)];
    
    this._selectedRows.update(current => {
      const newSelection = new Set(current);
      
      for (let i = startIndex; i <= endIndex; i++) {
        newSelection.add(i);
      }
      
      return newSelection;
    });
    
    this._lastSelectedIndex.set(end);
  }
  
  toggleRow(index: number, ctrlKey = false, shiftKey = false): void {
    if (shiftKey && this._lastSelectedIndex() !== null) {
      // Range selection
      this.selectRange(this._lastSelectedIndex()!, index);
    } else if (ctrlKey || this._selectionMode() === 'multiple') {
      // Multi-selection toggle
      this._selectedRows.update(current => {
        const newSelection = new Set(current);
        
        if (newSelection.has(index)) {
          newSelection.delete(index);
        } else {
          newSelection.add(index);
        }
        
        return newSelection;
      });
    } else {
      // Single selection
      this._selectedRows.set(new Set([index]));
    }
    
    this._lastSelectedIndex.set(index);
  }
}
```

### State Composition Pattern

```typescript
// Compose complex state from multiple services
@Injectable({ providedIn: 'root' })
export class CompositeGridStateService {
  constructor(
    private coreState: GridStateService,
    private selectionState: SelectionStateService,
    private editingState: EditingStateService,
    private uiState: UIStateService
  ) {}
  
  // Composed computed state
  readonly compositeState = computed(() => ({
    // Core state
    data: this.coreState.processedData(),
    config: this.coreState.config(),
    
    // Selection state
    selection: this.selectionState.selectionSummary(),
    selectedRows: this.selectionState.selectedRows(),
    
    // Editing state
    editing: this.editingState.editingSummary(),
    activeEditor: this.editingState.activeEditor(),
    
    // UI state
    ui: this.uiState.uiConfiguration(),
    theme: this.uiState.currentTheme()
  }));
  
  // Cross-service operations
  resetGrid(): void {
    this.coreState.reset();
    this.selectionState.clearSelection();
    this.editingState.cancelEditing();
    this.uiState.resetUI();
  }
  
  // Coordinated state updates
  updateDataWithStateReset(newData: any[]): void {
    // Coordinate state updates across services
    this.coreState.setData(newData);
    this.selectionState.clearSelection();
    this.editingState.cancelEditing();
    // UI state maintained
  }
}
```

## State Synchronization

### Cross-Component State Sync

```typescript
// Event-driven state synchronization
@Injectable({ providedIn: 'root' })
export class StateSynchronizationService {
  private readonly stateChangeEvent$ = new Subject<StateChangeEvent>();
  
  readonly stateChanges$ = this.stateChangeEvent$.asObservable();
  
  // Subscribe to all relevant state changes
  constructor(
    private gridState: GridStateService,
    private selectionState: SelectionStateService
  ) {
    // Set up automatic synchronization
    this.setupStateSync();
  }
  
  private setupStateSync(): void {
    // Sync selection changes with grid metadata
    effect(() => {
      const selection = this.selectionState.selectedRows();
      const selectionArray = Array.from(selection);
      
      this.stateChangeEvent$.next({
        type: 'SELECTION_CHANGED',
        payload: { selectedIndices: selectionArray },
        timestamp: Date.now()
      });
    });
    
    // Sync data changes with dependent state
    effect(() => {
      const data = this.gridState.data();
      const dataLength = data.length;
      
      // Clear invalid selections
      this.selectionState.validateSelection(dataLength);
      
      this.stateChangeEvent$.next({
        type: 'DATA_CHANGED',
        payload: { rowCount: dataLength },
        timestamp: Date.now()
      });
    });
  }
  
  // Manual synchronization trigger
  synchronizeState(trigger: string): void {
    this.stateChangeEvent$.next({
      type: 'MANUAL_SYNC',
      payload: { trigger },
      timestamp: Date.now()
    });
  }
}
```

### State Persistence Sync

```typescript
// Automatic state persistence
@Injectable()
export class StatePersistenceService {
  private readonly STORAGE_KEY = 'blg-grid-state';
  
  constructor(private gridState: GridStateService) {
    // Auto-save state on changes
    this.setupAutoSave();
    
    // Restore state on initialization
    this.restoreState();
  }
  
  private setupAutoSave(): void {
    // Debounced state saving
    const saveState = debounceTime(500)(
      effect(() => {
        const state = this.getSerializableState();
        this.saveToStorage(state);
      })
    );
  }
  
  private getSerializableState(): SerializableGridState {
    const currentState = this.gridState.state;
    
    return {
      sortDescriptors: currentState().sortDescriptors,
      filterDescriptors: currentState().filterDescriptors,
      paginationState: currentState().paginationState,
      columnWidths: Array.from(currentState().columnWidths.entries()),
      selectedRows: Array.from(currentState().selectedRows),
      // Don't persist data - too large
      timestamp: Date.now()
    };
  }
  
  private saveToStorage(state: SerializableGridState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save grid state:', error);
    }
  }
  
  private restoreState(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored) as SerializableGridState;
        this.applyStoredState(state);
      }
    } catch (error) {
      console.warn('Failed to restore grid state:', error);
    }
  }
}
```

## Performance Optimizations

### Signal Optimization Patterns

```typescript
// Optimized signal patterns for performance
export class OptimizedGridStateService {
  
  // Memoized computed values
  private readonly _memoizedProcessedData = computed(() => {
    const data = this._data();
    const sorts = this._sortDescriptors();
    const filters = this._filterDescriptors();
    
    // Use stable sort key for memoization
    const sortKey = sorts.map(s => `${s.columnId}:${s.direction}`).join('|');
    const filterKey = filters.map(f => `${f.columnId}:${f.operator}:${f.value}`).join('|');
    const cacheKey = `${data.length}:${sortKey}:${filterKey}`;
    
    return this.memoizedDataProcessor.process(data, { sorts, filters }, cacheKey);
  });
  
  // Optimized batch updates
  batchUpdate<T>(updateFn: () => T): T {
    return untracked(() => {
      // Suspend reactive updates during batch
      const result = updateFn();
      
      // Single change detection trigger
      this.changeDetectorRef.markForCheck();
      
      return result;
    });
  }
  
  // Selective state updates to minimize reactivity
  updateSortOptimized(updates: SortUpdate[]): void {
    // Only update if actually changed
    const current = this._sortDescriptors();
    const newDescriptors = this.applySortUpdates(current, updates);
    
    if (!this.areArraysEqual(current, newDescriptors)) {
      this._sortDescriptors.set(newDescriptors);
    }
  }
  
  // Virtual scrolling state optimization
  private readonly _virtualScrollState = signal<VirtualScrollState>({
    startIndex: 0,
    endIndex: 50,
    bufferSize: 10
  });
  
  readonly visibleData = computed(() => {
    const processedData = this._memoizedProcessedData();
    const virtualState = this._virtualScrollState();
    
    const start = Math.max(0, virtualState.startIndex - virtualState.bufferSize);
    const end = Math.min(processedData.length, virtualState.endIndex + virtualState.bufferSize);
    
    return processedData.slice(start, end);
  });
}
```

### Memory Management

```typescript
// Memory-efficient state patterns
export class MemoryOptimizedStateService {
  // Use WeakMap for metadata that can be garbage collected
  private readonly rowMetadata = new WeakMap<object, RowMetadata>();
  private readonly columnMetadata = new WeakMap<ColumnDefinition, ColumnMetadata>();
  
  // Object pooling for frequently created objects
  private readonly sortDescriptorPool = new ObjectPool(
    () => ({ columnId: '', direction: 'asc' as const, priority: 0 }),
    (obj) => { obj.columnId = ''; obj.direction = 'asc'; obj.priority = 0; }
  );
  
  // Lazy initialization of expensive computed values
  private readonly _expensiveComputedData = computed(() => {
    return this.computeExpensiveData();
  }, { 
    // Only compute when accessed
    equal: (a, b) => a === b
  });
  
  // Cleanup methods for memory management
  cleanup(): void {
    // Clear caches
    this.rowMetadata = new WeakMap();
    this.columnMetadata = new WeakMap();
    
    // Return pooled objects
    this.sortDescriptorPool.clear();
    
    // Clear signal caches if needed
    this.clearSignalCaches();
  }
}
```

## State Validation

### Runtime State Validation

```typescript
@Injectable()
export class StateValidationService {
  
  // Configuration validation
  validateGridConfig(config: GridConfig): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Validate columns
    if (!Array.isArray(config.columns) || config.columns.length === 0) {
      errors.push({
        path: 'columns',
        message: 'Grid must have at least one column',
        severity: 'error'
      });
    }
    
    // Validate column definitions
    config.columns.forEach((column, index) => {
      if (!column.id) {
        errors.push({
          path: `columns[${index}].id`,
          message: 'Column must have an id',
          severity: 'error'
        });
      }
      
      if (!column.field) {
        errors.push({
          path: `columns[${index}].field`,
          message: 'Column must have a field',
          severity: 'error'
        });
      }
    });
    
    // Validate features configuration
    if (config.features) {
      this.validateFeaturesConfig(config.features, errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: this.generateWarnings(config)
    };
  }
  
  // State consistency validation
  validateStateConsistency(state: GridState): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Validate selection consistency
    const selectedRows = state.interaction.selection.selectedRows;
    const dataLength = state.data.processed.length;
    
    const invalidSelections = Array.from(selectedRows)
      .filter(index => index < 0 || index >= dataLength);
    
    if (invalidSelections.length > 0) {
      errors.push({
        path: 'selection.selectedRows',
        message: `Invalid row selections: ${invalidSelections.join(', ')}`,
        severity: 'error'
      });
    }
    
    // Validate sort descriptors
    state.processing.sort.forEach((sort, index) => {
      const column = state.config.columns.find(c => c.id === sort.columnId);
      if (!column) {
        errors.push({
          path: `sort[${index}].columnId`,
          message: `Sort column '${sort.columnId}' does not exist`,
          severity: 'error'
        });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  // Development-time validation
  validateInDevelopment<T>(state: T, schema: StateSchema<T>): void {
    if (!environment.production) {
      const result = this.validateAgainstSchema(state, schema);
      
      if (!result.isValid) {
        console.group('🚨 State Validation Errors');
        result.errors.forEach(error => {
          console.error(`${error.path}: ${error.message}`);
        });
        console.groupEnd();
      }
      
      if (result.warnings.length > 0) {
        console.group('⚠️ State Validation Warnings');
        result.warnings.forEach(warning => {
          console.warn(`${warning.path}: ${warning.message}`);
        });
        console.groupEnd();
      }
    }
  }
}
```

## Debugging State Issues

### State Debugging Tools

```typescript
// Comprehensive state debugging service
@Injectable()
export class StateDebugService {
  private readonly stateHistory = new Array<StateSnapshot>();
  private readonly maxHistorySize = 100;
  
  constructor(private gridState: GridStateService) {
    this.setupStateTracking();
  }
  
  private setupStateTracking(): void {
    if (!environment.production) {
      // Track all state changes
      effect(() => {
        const currentState = this.captureStateSnapshot();
        this.addToHistory(currentState);
      });
    }
  }
  
  private captureStateSnapshot(): StateSnapshot {
    const state = this.gridState.state();
    
    return {
      timestamp: Date.now(),
      state: this.deepClone(state),
      stackTrace: new Error().stack || '',
      metadata: {
        memoryUsage: this.getMemoryUsage(),
        performanceNow: performance.now()
      }
    };
  }
  
  // Debug state differences
  compareStates(snapshot1: StateSnapshot, snapshot2: StateSnapshot): StateDiff {
    return {
      added: this.findAddedProperties(snapshot1.state, snapshot2.state),
      removed: this.findRemovedProperties(snapshot1.state, snapshot2.state),
      changed: this.findChangedProperties(snapshot1.state, snapshot2.state),
      timeDiff: snapshot2.timestamp - snapshot1.timestamp
    };
  }
  
  // Export state for debugging
  exportStateHistory(): string {
    return JSON.stringify(this.stateHistory, null, 2);
  }
  
  // Debug state access patterns
  logStateAccess(property: string): void {
    if (!environment.production) {
      console.log(`🔍 State accessed: ${property}`, {
        timestamp: new Date().toISOString(),
        stackTrace: new Error().stack
      });
    }
  }
  
  // Performance debugging
  measureStateUpdate<T>(label: string, updateFn: () => T): T {
    const start = performance.now();
    const result = updateFn();
    const end = performance.now();
    
    console.log(`⏱️ State update '${label}' took ${(end - start).toFixed(2)}ms`);
    
    return result;
  }
}

// Development-only state inspector
export function enableStateInspector(gridState: GridStateService): void {
  if (!environment.production && typeof window !== 'undefined') {
    // Expose state to window for debugging
    (window as any).blgGridState = {
      current: () => gridState.state(),
      history: () => gridState.stateHistory,
      
      // Helper functions
      logState: () => console.log('Current Grid State:', gridState.state()),
      compareToInitial: () => {
        // Compare with initial state
      },
      
      // State manipulation for testing
      setState: (newState: any) => {
        console.warn('Setting state directly - for debugging only!');
        // Direct state setting for debugging
      }
    };
    
    console.log('🔍 Grid state inspector available at window.blgGridState');
  }
}
```

## Advanced State Patterns

### State Machine Integration

```typescript
// State machine for complex grid operations
interface GridStateMachine {
  states: {
    idle: {};
    loading: {};
    processing: {};
    editing: { cellPosition: { row: number; column: string } };
    error: { error: Error };
  };
  
  events: {
    LOAD_DATA: { data: any[] };
    START_EDIT: { row: number; column: string };
    SAVE_EDIT: { value: any };
    CANCEL_EDIT: {};
    ERROR: { error: Error };
    RESET: {};
  };
}

@Injectable()
export class GridStateMachineService {
  private readonly machine = createMachine<GridStateMachine>({
    id: 'grid',
    initial: 'idle',
    states: {
      idle: {
        on: {
          LOAD_DATA: 'loading',
          START_EDIT: 'editing',
          ERROR: 'error'
        }
      },
      loading: {
        on: {
          LOAD_DATA: 'processing',
          ERROR: 'error'
        }
      },
      processing: {
        on: {
          LOAD_DATA: 'idle',
          ERROR: 'error'
        }
      },
      editing: {
        on: {
          SAVE_EDIT: 'idle',
          CANCEL_EDIT: 'idle',
          ERROR: 'error'
        }
      },
      error: {
        on: {
          RESET: 'idle'
        }
      }
    }
  });
  
  private readonly currentState = signal(this.machine.initialState);
  
  readonly state = this.currentState.asReadonly();
  readonly canEdit = computed(() => this.state().matches('idle'));
  readonly isLoading = computed(() => this.state().matches('loading'));
  
  send(event: keyof GridStateMachine['events'], payload?: any): void {
    const nextState = this.machine.transition(this.currentState(), { 
      type: event, 
      ...payload 
    });
    
    this.currentState.set(nextState);
  }
}
```

### Optimistic Updates

```typescript
// Optimistic update pattern for better UX
@Injectable()
export class OptimisticUpdateService {
  private readonly pendingUpdates = new Map<string, OptimisticUpdate>();
  
  constructor(private gridState: GridStateService) {}
  
  // Optimistic cell editing
  updateCellOptimistically(
    rowIndex: number, 
    columnId: string, 
    newValue: any,
    savePromise: Promise<any>
  ): void {
    const updateId = `${rowIndex}-${columnId}`;
    
    // Apply optimistic update immediately
    this.gridState.updateCellValue(rowIndex, columnId, newValue);
    
    // Track the update
    const optimisticUpdate: OptimisticUpdate = {
      id: updateId,
      type: 'cell-edit',
      originalValue: this.gridState.getCellValue(rowIndex, columnId),
      optimisticValue: newValue,
      promise: savePromise
    };
    
    this.pendingUpdates.set(updateId, optimisticUpdate);
    
    // Handle the actual save
    savePromise
      .then(result => {
        // Update succeeded - keep optimistic value or use server value
        const finalValue = result.value ?? newValue;
        this.gridState.updateCellValue(rowIndex, columnId, finalValue);
        this.pendingUpdates.delete(updateId);
      })
      .catch(error => {
        // Revert optimistic update
        this.gridState.updateCellValue(
          rowIndex, 
          columnId, 
          optimisticUpdate.originalValue
        );
        this.pendingUpdates.delete(updateId);
        
        // Handle error
        this.handleOptimisticUpdateError(error);
      });
  }
  
  // Check if update is pending
  hasPendingUpdate(rowIndex: number, columnId: string): boolean {
    return this.pendingUpdates.has(`${rowIndex}-${columnId}`);
  }
}
```

This comprehensive state management documentation provides maintainers with deep insights into how state flows through the BLG Grid library, enabling effective debugging, optimization, and future enhancements to the state management system.