# Events API Reference

The BLG Grid provides a comprehensive event system that allows you to respond to user interactions and grid state changes. All events follow a consistent pattern and include timestamp information.

## Event Architecture

### Base Event Interface

```typescript
interface GridEvent<T = any> {
  type: string;        // Event type identifier
  data?: T;           // Event-specific data
  source?: string;    // Event source (optional)
  timestamp?: Date;   // Event timestamp
}
```

### Event Types Union

```typescript
type GridEventType = 
  | CellClickEvent 
  | RowSelectEvent 
  | ColumnSortEvent 
  | ColumnResizeEvent 
  | PaginationEvent 
  | CellEditEvent;
```

## Event Outputs

### gridEvent (Universal Event Handler)
Emits all grid events through a single output for centralized handling.

```typescript
@Output() gridEvent = new EventEmitter<GridEventType>();

// Usage
<ng-ui-lib 
  [data]="data" 
  [columns]="columns"
  (gridEvent)="onGridEvent($event)">
</ng-ui-lib>

// Handler
onGridEvent(event: GridEventType) {
  switch (event.type) {
    case 'cell-click':
      this.handleCellClick(event);
      break;
    case 'row-select':
      this.handleRowSelect(event);
      break;
    case 'column-sort':
      this.handleColumnSort(event);
      break;
    case 'column-resize':
      this.handleColumnResize(event);
      break;
    case 'pagination':
      this.handlePagination(event);
      break;
    case 'cell-edit':
      this.handleCellEdit(event);
      break;
  }
}
```

### Specific Event Handlers
Each event type also has its own dedicated output for focused handling.

```typescript
@Output() cellClick = new EventEmitter<CellClickEvent>();
@Output() rowSelect = new EventEmitter<RowSelectEvent>();
@Output() columnSort = new EventEmitter<ColumnSortEvent>();
@Output() columnResize = new EventEmitter<ColumnResizeEvent>();
```

## Event Types

### CellClickEvent
Triggered when a cell is clicked by the user.

```typescript
interface CellClickEvent extends GridEvent {
  type: 'cell-click';
  data: {
    rowIndex: number;    // Row index in current view
    columnId: string;    // Column identifier
    value: any;          // Cell value
    rowData: any;        // Complete row data
  };
}

// Example handler
onCellClick(event: CellClickEvent) {
  const { rowIndex, columnId, value, rowData } = event.data;
  
  console.log(`Cell clicked: Row ${rowIndex}, Column ${columnId}`);
  console.log(`Value: ${value}`);
  
  // Custom actions based on column
  switch (columnId) {
    case 'email':
      window.location.href = `mailto:${value}`;
      break;
    case 'phone':
      window.location.href = `tel:${value}`;
      break;
    case 'website':
      window.open(value, '_blank');
      break;
  }
}
```

### RowSelectEvent
Triggered when row selection state changes.

```typescript
interface RowSelectEvent extends GridEvent {
  type: 'row-select';
  data: {
    rowIndex: number;    // Row index in current view
    rowData: any;        // Complete row data
    selected: boolean;   // New selection state
  };
}

// Example handler
onRowSelect(event: RowSelectEvent) {
  const { rowIndex, rowData, selected } = event.data;
  
  if (selected) {
    console.log(`Row ${rowIndex} selected:`, rowData);
    this.selectedItems.add(rowData.id);
  } else {
    console.log(`Row ${rowIndex} deselected:`, rowData);
    this.selectedItems.delete(rowData.id);
  }
  
  // Update UI or trigger dependent operations
  this.updateActionButtonStates();
  this.updateSelectionSummary();
}
```

### ColumnSortEvent
Triggered when column sorting changes.

```typescript
interface ColumnSortEvent extends GridEvent {
  type: 'column-sort';
  data: {
    columnId: string;     // Column being sorted
    direction: 'asc' | 'desc' | null;  // Sort direction
    sortState?: {         // Complete sort state (for multi-column)
      columnId: string;
      direction: 'asc' | 'desc';
      order: number;      // Sort precedence order
    }[] | null;
  };
}

// Example handler
onColumnSort(event: ColumnSortEvent) {
  const { columnId, direction, sortState } = event.data;
  
  console.log(`Column ${columnId} sorted ${direction || 'cleared'}`);
  
  // Handle server-side sorting
  if (this.config.serverSideOperations) {
    this.loadDataWithSort(sortState);
  }
  
  // Update sort indicators in custom UI
  this.updateSortIndicators(sortState);
  
  // Log sorting for analytics
  this.analytics.trackSort(columnId, direction);
}
```

### ColumnResizeEvent
Triggered when a column is resized.

```typescript
interface ColumnResizeEvent extends GridEvent {
  type: 'column-resize';
  data: {
    columnId: string;    // Column being resized
    width: number;       // New width
    oldWidth: number;    // Previous width
  };
}

// Example handler
onColumnResize(event: ColumnResizeEvent) {
  const { columnId, width, oldWidth } = event.data;
  
  console.log(`Column ${columnId} resized from ${oldWidth}px to ${width}px`);
  
  // Save column widths to user preferences
  this.saveColumnWidth(columnId, width);
  
  // Update related UI components
  this.adjustRelatedComponents(columnId, width);
  
  // Emit custom event for layout changes
  this.layoutChanged.emit({ columnId, width });
}
```

### PaginationEvent
Triggered when pagination state changes.

```typescript
interface PaginationEvent extends GridEvent {
  type: 'pagination';
  data: {
    currentPage: number;   // New current page (0-based)
    pageSize: number;      // Items per page
    totalItems: number;    // Total items available
  };
}

// Example handler
onPagination(event: PaginationEvent) {
  const { currentPage, pageSize, totalItems } = event.data;
  
  console.log(`Page changed: ${currentPage + 1} (showing ${pageSize} items)`);
  
  // Handle server-side pagination
  if (this.config.serverSidePagination) {
    this.loadDataForPage(currentPage, pageSize);
  }
  
  // Update URL with page parameter
  this.router.navigate([], {
    queryParams: { page: currentPage + 1 },
    queryParamsHandling: 'merge'
  });
  
  // Scroll to top of grid
  this.scrollToTop();
}
```

### CellEditEvent
Triggered when cell editing is completed.

```typescript
interface CellEditEvent extends GridEvent {
  type: 'cell-edit';
  data: {
    rowIndex: number;     // Row index in current view
    columnId: string;     // Column identifier
    oldValue: any;        // Previous cell value
    newValue: any;        // New cell value
    rowData: any;         // Updated row data
  };
}

// Example handler
onCellEdit(event: CellEditEvent) {
  const { rowIndex, columnId, oldValue, newValue, rowData } = event.data;
  
  console.log(`Cell edited: ${columnId} changed from ${oldValue} to ${newValue}`);
  
  // Validate the change
  const isValid = this.validateCellEdit(columnId, newValue, rowData);
  if (!isValid) {
    this.showValidationError(`Invalid value for ${columnId}`);
    return;
  }
  
  // Update backend
  this.updateRecord(rowData.id, { [columnId]: newValue })
    .subscribe({
      next: () => {
        this.showSuccess('Record updated successfully');
        // Update local data
        this.updateLocalData(rowData.id, { [columnId]: newValue });
      },
      error: (err) => {
        this.showError('Failed to update record');
        // Revert the change
        this.revertCellEdit(rowIndex, columnId, oldValue);
      }
    });
}
```

## Event Handling Patterns

### Centralized Event Handling

```typescript
@Component({
  template: `
    <ng-ui-lib 
      [data]="data"
      [columns]="columns" 
      [config]="config"
      (gridEvent)="onGridEvent($event)">
    </ng-ui-lib>
  `
})
export class CentralizedEventComponent {
  onGridEvent(event: GridEventType) {
    // Log all events for debugging
    this.logEvent(event);
    
    // Route to specific handlers
    const handlers: Record<string, (event: any) => void> = {
      'cell-click': this.handleCellClick.bind(this),
      'row-select': this.handleRowSelect.bind(this),
      'column-sort': this.handleColumnSort.bind(this),
      'column-resize': this.handleColumnResize.bind(this),
      'pagination': this.handlePagination.bind(this),
      'cell-edit': this.handleCellEdit.bind(this)
    };
    
    const handler = handlers[event.type];
    if (handler) {
      handler(event);
    }
  }
  
  private logEvent(event: GridEventType) {
    if (this.config.debugMode) {
      console.log(`[Grid Event] ${event.type}:`, event.data, event.timestamp);
    }
  }
}
```

### Specific Event Handlers

```typescript
@Component({
  template: `
    <ng-ui-lib 
      [data]="data"
      [columns]="columns"
      (cellClick)="onCellClick($event)"
      (rowSelect)="onRowSelect($event)"
      (columnSort)="onColumnSort($event)">
    </ng-ui-lib>
  `
})
export class SpecificEventHandlersComponent {
  onCellClick(event: CellClickEvent) {
    // Handle only cell clicks
  }
  
  onRowSelect(event: RowSelectEvent) {
    // Handle only row selection
  }
  
  onColumnSort(event: ColumnSortEvent) {
    // Handle only column sorting
  }
}
```

### Event Filtering and Debouncing

```typescript
import { debounceTime, filter, Subject } from 'rxjs';

export class EventFilteringComponent {
  private eventStream$ = new Subject<GridEventType>();
  
  ngOnInit() {
    // Debounce resize events
    this.eventStream$.pipe(
      filter(event => event.type === 'column-resize'),
      debounceTime(300)
    ).subscribe(event => {
      this.handleDebouncedResize(event as ColumnResizeEvent);
    });
    
    // Filter only important events
    this.eventStream$.pipe(
      filter(event => ['row-select', 'cell-edit'].includes(event.type))
    ).subscribe(event => {
      this.handleImportantEvent(event);
    });
  }
  
  onGridEvent(event: GridEventType) {
    this.eventStream$.next(event);
  }
}
```

## Event-Driven Features

### Auto-Save Implementation

```typescript
export class AutoSaveComponent {
  private saveSubject$ = new Subject<CellEditEvent>();
  
  ngOnInit() {
    // Auto-save with debouncing
    this.saveSubject$.pipe(
      debounceTime(1000), // Wait 1 second after last edit
      switchMap(event => this.saveChanges(event.data.rowData))
    ).subscribe({
      next: () => this.showSaveSuccess(),
      error: (err) => this.showSaveError(err)
    });
  }
  
  onCellEdit(event: CellEditEvent) {
    // Mark as dirty
    this.markRowAsDirty(event.data.rowData.id);
    
    // Trigger auto-save
    this.saveSubject$.next(event);
  }
  
  private saveChanges(rowData: any): Observable<any> {
    return this.api.updateRecord(rowData.id, rowData);
  }
}
```

### Real-time Updates

```typescript
export class RealTimeUpdatesComponent {
  ngOnInit() {
    // Listen for real-time updates
    this.websocketService.updates$.subscribe(update => {
      this.handleRealTimeUpdate(update);
    });
  }
  
  onCellEdit(event: CellEditEvent) {
    // Broadcast changes to other users
    this.websocketService.broadcastChange({
      type: 'cell-edit',
      userId: this.currentUser.id,
      data: event.data
    });
  }
  
  private handleRealTimeUpdate(update: any) {
    if (update.userId !== this.currentUser.id) {
      // Update from another user
      this.applyExternalUpdate(update);
    }
  }
}
```

### Event Analytics

```typescript
export class AnalyticsComponent {
  private eventCounts: Record<string, number> = {};
  
  onGridEvent(event: GridEventType) {
    // Track event frequency
    this.eventCounts[event.type] = (this.eventCounts[event.type] || 0) + 1;
    
    // Send to analytics service
    this.analytics.trackGridEvent({
      eventType: event.type,
      timestamp: event.timestamp,
      metadata: this.getEventMetadata(event)
    });
    
    // Check for usage patterns
    this.checkUsagePatterns(event);
  }
  
  private getEventMetadata(event: GridEventType): Record<string, any> {
    const metadata: Record<string, any> = {
      gridId: this.gridId,
      dataSize: this.data.length,
      columnCount: this.columns.length
    };
    
    // Event-specific metadata
    switch (event.type) {
      case 'column-sort':
        metadata.sortDirection = event.data.direction;
        metadata.multiSort = (event.data.sortState?.length || 0) > 1;
        break;
      case 'pagination':
        metadata.pageSize = event.data.pageSize;
        metadata.totalPages = Math.ceil(event.data.totalItems / event.data.pageSize);
        break;
    }
    
    return metadata;
  }
}
```

## Event State Management

### Event Store Pattern

```typescript
interface GridEventState {
  lastEvent: GridEventType | null;
  eventHistory: GridEventType[];
  pendingChanges: CellEditEvent[];
}

@Injectable()
export class GridEventStore {
  private state$ = new BehaviorSubject<GridEventState>({
    lastEvent: null,
    eventHistory: [],
    pendingChanges: []
  });
  
  addEvent(event: GridEventType) {
    const currentState = this.state$.value;
    
    this.state$.next({
      lastEvent: event,
      eventHistory: [...currentState.eventHistory, event].slice(-100), // Keep last 100 events
      pendingChanges: event.type === 'cell-edit' 
        ? [...currentState.pendingChanges, event as CellEditEvent]
        : currentState.pendingChanges
    });
  }
  
  clearPendingChanges() {
    const currentState = this.state$.value;
    this.state$.next({
      ...currentState,
      pendingChanges: []
    });
  }
  
  getEventHistory(): Observable<GridEventType[]> {
    return this.state$.pipe(map(state => state.eventHistory));
  }
}
```

### Undo/Redo Implementation

```typescript
export class UndoRedoComponent {
  private undoStack: CellEditEvent[] = [];
  private redoStack: CellEditEvent[] = [];
  
  onCellEdit(event: CellEditEvent) {
    // Add to undo stack
    this.undoStack.push(event);
    // Clear redo stack when new edit is made
    this.redoStack = [];
    
    // Limit undo stack size
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }
  
  undo() {
    const lastEdit = this.undoStack.pop();
    if (lastEdit) {
      // Revert the change
      this.revertCellEdit(lastEdit);
      // Add to redo stack
      this.redoStack.push(lastEdit);
    }
  }
  
  redo() {
    const lastUndo = this.redoStack.pop();
    if (lastUndo) {
      // Reapply the change
      this.applyCellEdit(lastUndo);
      // Add back to undo stack
      this.undoStack.push(lastUndo);
    }
  }
}
```

## Custom Event Types

### Adding Custom Events

```typescript
// Define custom event interface
interface CustomRowActionEvent extends GridEvent {
  type: 'custom-row-action';
  data: {
    action: string;
    rowIndex: number;
    rowData: any;
    metadata?: any;
  };
}

// Extend the grid component or create wrapper
@Component({
  selector: 'extended-grid',
  template: `
    <ng-ui-lib 
      [data]="data"
      [columns]="columns"
      (gridEvent)="onGridEvent($event)">
    </ng-ui-lib>
  `
})
export class ExtendedGridComponent {
  @Output() customRowAction = new EventEmitter<CustomRowActionEvent>();
  
  // Trigger custom event
  triggerCustomAction(action: string, rowIndex: number, rowData: any) {
    const customEvent: CustomRowActionEvent = {
      type: 'custom-row-action',
      data: { action, rowIndex, rowData },
      timestamp: new Date()
    };
    
    this.customRowAction.emit(customEvent);
  }
}
```

## Best Practices

### Event Handler Performance

```typescript
// Use trackBy for performance
trackByEventId(index: number, event: GridEventType): string {
  return `${event.type}_${event.timestamp?.getTime() || index}`;
}

// Debounce high-frequency events
@Component({})
export class OptimizedEventComponent {
  private resizeDebounce$ = new Subject<ColumnResizeEvent>();
  
  ngOnInit() {
    this.resizeDebounce$.pipe(
      debounceTime(100)
    ).subscribe(event => {
      this.handleColumnResize(event);
    });
  }
  
  onColumnResize(event: ColumnResizeEvent) {
    this.resizeDebounce$.next(event);
  }
}
```

### Error Handling

```typescript
onGridEvent(event: GridEventType) {
  try {
    this.processEvent(event);
  } catch (error) {
    console.error('Event processing error:', error);
    this.errorHandler.handleEventError(event, error);
  }
}
```

### Memory Management

```typescript
export class MemoryManagedComponent implements OnDestroy {
  private eventSubscriptions: Subscription[] = [];
  
  ngOnDestroy() {
    // Clean up event subscriptions
    this.eventSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
```