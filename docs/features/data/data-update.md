# Data Update

## Overview

Data update functionality allows you to modify, add, and remove data in the BLG Grid efficiently. This includes real-time updates, batch operations, optimistic updates, and integration with various data sources.

## Use Cases

- Real-time data updates from WebSocket connections
- Batch processing of large data changes
- CRUD operations with server synchronization
- Optimistic UI updates with rollback capabilities
- Live data feeds and streaming updates

## Basic Data Updates

### Single Row Updates

```typescript
import { BlgGridComponent } from '@ng-ui/grid';

@Component({
  template: `
    <div class="controls">
      <button (click)="updateSingleRow()">Update Row</button>
      <button (click)="addNewRow()">Add Row</button>
      <button (click)="removeSelectedRows()">Remove Selected</button>
    </div>
    <ng-ui-lib 
      #grid
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [rowSelection]="'multiple'"
      (gridReady)="onGridReady($event)"
      (cellValueChanged)="onCellValueChanged($event)">
    </ng-ui-lib>
  `
})
export class BasicDataUpdateComponent {
  private gridApi!: GridApi;
  
  rowData = [
    { id: 1, name: 'John Doe', age: 30, department: 'Engineering' },
    { id: 2, name: 'Jane Smith', age: 25, department: 'Marketing' },
    { id: 3, name: 'Mike Johnson', age: 35, department: 'Sales' }
  ];

  columnDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', editable: true },
    { field: 'age', headerName: 'Age', editable: true },
    { field: 'department', headerName: 'Department', editable: true }
  ];

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  updateSingleRow(): void {
    // Update specific row by ID
    const rowNode = this.gridApi.getRowNode('1');
    if (rowNode) {
      rowNode.setData({
        ...rowNode.data,
        name: 'John Updated',
        age: 31,
        lastUpdated: new Date()
      });
    }
  }

  addNewRow(): void {
    const newRow = {
      id: Date.now(),
      name: 'New Employee',
      age: 28,
      department: 'HR',
      isNew: true
    };
    
    this.gridApi.applyTransaction({ add: [newRow] });
  }

  removeSelectedRows(): void {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length > 0) {
      this.gridApi.applyTransaction({ remove: selectedRows });
    }
  }

  onCellValueChanged(event: any): void {
    console.log('Cell value changed:', {
      field: event.column.getColId(),
      oldValue: event.oldValue,
      newValue: event.newValue,
      rowData: event.data
    });
    
    // Mark row as modified
    event.node.data.modified = true;
    this.gridApi.refreshCells({ rowNodes: [event.node] });
  }
}
```

### Batch Updates

```typescript
export class BatchDataUpdateComponent {
  private gridApi!: GridApi;
  private pendingUpdates: any[] = [];

  batchUpdateRows(): void {
    const updates = [
      { id: 1, name: 'John Updated', status: 'Modified' },
      { id: 2, age: 26, status: 'Modified' },
      { id: 3, department: 'Operations', status: 'Modified' }
    ];

    // Apply multiple updates in single transaction
    this.gridApi.applyTransaction({
      update: updates.map(update => {
        const existingRow = this.findRowById(update.id);
        return { ...existingRow, ...update };
      })
    });
  }

  batchAddRows(): void {
    const newRows = [
      { id: 101, name: 'Alice Johnson', age: 29, department: 'Design' },
      { id: 102, name: 'Bob Wilson', age: 32, department: 'QA' },
      { id: 103, name: 'Carol Brown', age: 27, department: 'DevOps' }
    ];

    this.gridApi.applyTransaction({ add: newRows });
  }

  batchMixedOperations(): void {
    const transaction = {
      add: [
        { id: 201, name: 'New Employee 1', age: 24, department: 'Support' }
      ],
      update: [
        { id: 1, name: 'John Final Update', lastModified: new Date() }
      ],
      remove: [
        this.findRowById(3) // Remove row with id 3
      ]
    };

    this.gridApi.applyTransaction(transaction);
  }

  // Queue updates for batch processing
  queueUpdate(rowId: string, changes: any): void {
    const existingIndex = this.pendingUpdates.findIndex(u => u.id === rowId);
    
    if (existingIndex >= 0) {
      // Merge with existing pending update
      this.pendingUpdates[existingIndex] = {
        ...this.pendingUpdates[existingIndex],
        ...changes
      };
    } else {
      this.pendingUpdates.push({ id: rowId, ...changes });
    }
  }

  flushPendingUpdates(): void {
    if (this.pendingUpdates.length === 0) return;

    const updates = this.pendingUpdates.map(update => {
      const existingRow = this.findRowById(update.id);
      return { ...existingRow, ...update };
    });

    this.gridApi.applyTransaction({ update: updates });
    this.pendingUpdates = [];
  }

  private findRowById(id: number): any {
    let foundRow: any = null;
    this.gridApi.forEachNode(node => {
      if (node.data.id === id) {
        foundRow = node.data;
      }
    });
    return foundRow;
  }
}
```

## Real-Time Data Updates

### WebSocket Integration

```typescript
@Injectable()
export class RealtimeDataService {
  private socket!: WebSocket;
  private dataUpdates = new Subject<any>();

  connect(url: string): void {
    this.socket = new WebSocket(url);
    
    this.socket.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.dataUpdates.next(update);
    };

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Implement reconnection logic
      this.reconnect(url);
    };
  }

  getUpdates(): Observable<any> {
    return this.dataUpdates.asObservable();
  }

  private reconnect(url: string, attempts = 0): void {
    const maxAttempts = 5;
    const delay = Math.pow(2, attempts) * 1000; // Exponential backoff

    if (attempts < maxAttempts) {
      setTimeout(() => {
        console.log(`Reconnecting attempt ${attempts + 1}`);
        this.connect(url);
      }, delay);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}

@Component({
  template: `
    <div class="status-bar">
      <span [class]="connectionStatus">
        {{ connectionStatus === 'connected' ? '🟢' : '🔴' }} 
        {{ connectionStatus | titlecase }}
      </span>
      <span>Last update: {{ lastUpdateTime | date:'medium' }}</span>
    </div>
    <ng-ui-lib 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (gridReady)="onGridReady($event)">
    </ng-ui-lib>
  `
})
export class RealtimeDataComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;
  private subscription!: Subscription;
  
  connectionStatus = 'disconnected';
  lastUpdateTime = new Date();
  rowData: any[] = [];

  constructor(private realtimeService: RealtimeDataService) {}

  ngOnInit(): void {
    this.realtimeService.connect('ws://localhost:8080/updates');
    
    this.subscription = this.realtimeService.getUpdates().subscribe(
      update => this.handleRealTimeUpdate(update)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.realtimeService.disconnect();
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  private handleRealTimeUpdate(update: any): void {
    this.lastUpdateTime = new Date();
    
    switch (update.type) {
      case 'INSERT':
        this.handleInsert(update.data);
        break;
      case 'UPDATE':
        this.handleUpdate(update.data);
        break;
      case 'DELETE':
        this.handleDelete(update.data);
        break;
      case 'BULK_UPDATE':
        this.handleBulkUpdate(update.data);
        break;
    }
  }

  private handleInsert(data: any): void {
    this.gridApi.applyTransaction({ add: [data] });
    this.flashRow(data.id, 'added');
  }

  private handleUpdate(data: any): void {
    this.gridApi.applyTransaction({ update: [data] });
    this.flashRow(data.id, 'updated');
  }

  private handleDelete(data: any): void {
    this.gridApi.applyTransaction({ remove: [data] });
  }

  private handleBulkUpdate(updates: any[]): void {
    const transaction = {
      add: updates.filter(u => u.operation === 'INSERT').map(u => u.data),
      update: updates.filter(u => u.operation === 'UPDATE').map(u => u.data),
      remove: updates.filter(u => u.operation === 'DELETE').map(u => u.data)
    };
    
    this.gridApi.applyTransaction(transaction);
  }

  private flashRow(rowId: string, type: 'added' | 'updated'): void {
    const rowNode = this.gridApi.getRowNode(rowId);
    if (rowNode) {
      // Add flash class
      const element = this.gridApi.getRowElement(rowNode);
      element?.classList.add(`flash-${type}`);
      
      // Remove flash class after animation
      setTimeout(() => {
        element?.classList.remove(`flash-${type}`);
      }, 1000);
    }
  }
}
```

### Optimistic Updates

```typescript
export class OptimisticUpdateComponent {
  private gridApi!: GridApi;
  private pendingOperations = new Map<string, any>();

  async optimisticUpdate(rowId: string, changes: any): Promise<void> {
    const originalData = this.getRowData(rowId);
    const operationId = this.generateOperationId();
    
    // Store original data for potential rollback
    this.pendingOperations.set(operationId, {
      rowId,
      originalData,
      changes,
      timestamp: Date.now()
    });

    // Apply optimistic update immediately
    const optimisticData = { ...originalData, ...changes, _pending: true };
    this.gridApi.applyTransaction({ update: [optimisticData] });
    this.showPendingIndicator(rowId);

    try {
      // Send to server
      const serverResponse = await this.dataService.updateRow(rowId, changes);
      
      // Apply server response
      const finalData = { ...serverResponse, _pending: false };
      this.gridApi.applyTransaction({ update: [finalData] });
      
      // Clear pending operation
      this.pendingOperations.delete(operationId);
      this.hidePendingIndicator(rowId);
      
    } catch (error) {
      console.error('Update failed, rolling back:', error);
      
      // Rollback to original data
      this.rollbackUpdate(operationId);
      this.showErrorIndicator(rowId);
    }
  }

  async optimisticAdd(newRow: any): Promise<void> {
    const tempId = `temp_${Date.now()}`;
    const operationId = this.generateOperationId();
    
    // Add temporary row with pending indicator
    const optimisticRow = { 
      ...newRow, 
      id: tempId, 
      _pending: true, 
      _tempId: tempId 
    };
    
    this.pendingOperations.set(operationId, {
      type: 'add',
      tempId,
      originalData: newRow,
      timestamp: Date.now()
    });

    this.gridApi.applyTransaction({ add: [optimisticRow] });

    try {
      // Send to server
      const serverResponse = await this.dataService.createRow(newRow);
      
      // Replace temp row with server data
      this.gridApi.applyTransaction({ remove: [optimisticRow] });
      this.gridApi.applyTransaction({ add: [serverResponse] });
      
      this.pendingOperations.delete(operationId);
      
    } catch (error) {
      console.error('Add failed, rolling back:', error);
      
      // Remove temp row
      this.gridApi.applyTransaction({ remove: [optimisticRow] });
      this.pendingOperations.delete(operationId);
      this.showErrorMessage('Failed to add new record');
    }
  }

  private rollbackUpdate(operationId: string): void {
    const operation = this.pendingOperations.get(operationId);
    if (operation) {
      this.gridApi.applyTransaction({ 
        update: [{ ...operation.originalData, _pending: false }] 
      });
      this.pendingOperations.delete(operationId);
    }
  }

  private showPendingIndicator(rowId: string): void {
    const rowNode = this.gridApi.getRowNode(rowId);
    if (rowNode) {
      rowNode.data._pending = true;
      this.gridApi.refreshCells({ rowNodes: [rowNode] });
    }
  }

  private hidePendingIndicator(rowId: string): void {
    const rowNode = this.gridApi.getRowNode(rowId);
    if (rowNode) {
      delete rowNode.data._pending;
      this.gridApi.refreshCells({ rowNodes: [rowNode] });
    }
  }

  private showErrorIndicator(rowId: string): void {
    const rowNode = this.gridApi.getRowNode(rowId);
    if (rowNode) {
      rowNode.data._error = true;
      delete rowNode.data._pending;
      this.gridApi.refreshCells({ rowNodes: [rowNode] });
      
      // Auto-clear error after 3 seconds
      setTimeout(() => {
        if (rowNode.data._error) {
          delete rowNode.data._error;
          this.gridApi.refreshCells({ rowNodes: [rowNode] });
        }
      }, 3000);
    }
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRowData(rowId: string): any {
    const rowNode = this.gridApi.getRowNode(rowId);
    return rowNode ? { ...rowNode.data } : null;
  }
}
```

## Data Synchronization

### Conflict Resolution

```typescript
export class DataSynchronizationService {
  private conflictResolver = new ConflictResolver();

  async synchronizeChanges(changes: any[]): Promise<void> {
    const conflicts: any[] = [];
    const validChanges: any[] = [];

    for (const change of changes) {
      try {
        const serverData = await this.fetchServerData(change.id);
        const conflict = this.detectConflict(change, serverData);
        
        if (conflict) {
          conflicts.push({ change, serverData, conflict });
        } else {
          validChanges.push(change);
        }
      } catch (error) {
        console.error(`Failed to validate change for ${change.id}:`, error);
      }
    }

    // Apply valid changes
    if (validChanges.length > 0) {
      await this.applyChanges(validChanges);
    }

    // Handle conflicts
    if (conflicts.length > 0) {
      await this.resolveConflicts(conflicts);
    }
  }

  private detectConflict(localChange: any, serverData: any): any {
    const localTimestamp = new Date(localChange.lastModified);
    const serverTimestamp = new Date(serverData.lastModified);

    if (serverTimestamp > localTimestamp) {
      // Server has newer data, check for field conflicts
      const fieldConflicts = this.findFieldConflicts(localChange, serverData);
      
      if (fieldConflicts.length > 0) {
        return {
          type: 'field_conflict',
          fields: fieldConflicts,
          localTimestamp,
          serverTimestamp
        };
      }
    }

    return null;
  }

  private findFieldConflicts(local: any, server: any): string[] {
    const conflicts: string[] = [];
    
    for (const field in local) {
      if (field === 'id' || field === 'lastModified') continue;
      
      if (local[field] !== server[field] && 
          local[field] !== undefined && 
          server[field] !== undefined) {
        conflicts.push(field);
      }
    }
    
    return conflicts;
  }

  private async resolveConflicts(conflicts: any[]): Promise<void> {
    for (const conflict of conflicts) {
      const resolution = await this.conflictResolver.resolve(conflict);
      await this.applyResolution(resolution);
    }
  }
}

export class ConflictResolver {
  async resolve(conflict: any): Promise<any> {
    const { change, serverData, conflict: conflictInfo } = conflict;

    // Auto-resolution strategies
    if (this.canAutoResolve(conflictInfo)) {
      return this.autoResolve(change, serverData, conflictInfo);
    }

    // Manual resolution required
    return this.requestUserResolution(change, serverData, conflictInfo);
  }

  private canAutoResolve(conflictInfo: any): boolean {
    // Auto-resolve if only non-critical fields conflict
    const nonCriticalFields = ['lastAccessed', 'viewCount', 'metadata'];
    return conflictInfo.fields.every((field: string) => 
      nonCriticalFields.includes(field)
    );
  }

  private autoResolve(local: any, server: any, conflictInfo: any): any {
    // Merge strategy: take server values for conflicted fields
    return {
      ...local,
      ...server,
      lastModified: new Date(),
      resolvedAt: new Date(),
      resolutionStrategy: 'auto_server_wins'
    };
  }

  private async requestUserResolution(local: any, server: any, conflictInfo: any): Promise<any> {
    // This would typically show a conflict resolution dialog
    return new Promise((resolve) => {
      this.showConflictDialog(local, server, conflictInfo, resolve);
    });
  }

  private showConflictDialog(local: any, server: any, conflictInfo: any, callback: Function): void {
    // Implementation would show a modal dialog
    // For now, default to server wins
    setTimeout(() => {
      callback({
        ...server,
        resolutionStrategy: 'user_selected_server'
      });
    }, 1000);
  }
}
```

### Change Tracking

```typescript
export class ChangeTrackingService {
  private originalData = new Map<string, any>();
  private changes = new Map<string, any>();
  private changeHistory: any[] = [];

  trackChanges(data: any[]): void {
    data.forEach(item => {
      this.originalData.set(item.id, { ...item });
    });
  }

  recordChange(rowId: string, field: string, oldValue: any, newValue: any): void {
    if (!this.changes.has(rowId)) {
      this.changes.set(rowId, {});
    }

    const rowChanges = this.changes.get(rowId);
    rowChanges[field] = { oldValue, newValue, timestamp: Date.now() };

    // Add to history
    this.changeHistory.push({
      id: this.generateChangeId(),
      rowId,
      field,
      oldValue,
      newValue,
      timestamp: Date.now(),
      user: this.getCurrentUser()
    });
  }

  getChanges(rowId?: string): any {
    if (rowId) {
      return this.changes.get(rowId) || {};
    }
    
    return Object.fromEntries(this.changes.entries());
  }

  hasChanges(rowId?: string): boolean {
    if (rowId) {
      return this.changes.has(rowId);
    }
    
    return this.changes.size > 0;
  }

  getChangesSummary(): any {
    const summary = {
      totalChanges: this.changes.size,
      changedRows: Array.from(this.changes.keys()),
      fieldCounts: {} as any,
      oldestChange: null as any,
      newestChange: null as any
    };

    // Analyze changes
    this.changes.forEach((rowChanges, rowId) => {
      Object.keys(rowChanges).forEach(field => {
        summary.fieldCounts[field] = (summary.fieldCounts[field] || 0) + 1;
      });
    });

    // Find oldest and newest changes
    if (this.changeHistory.length > 0) {
      summary.oldestChange = this.changeHistory[0];
      summary.newestChange = this.changeHistory[this.changeHistory.length - 1];
    }

    return summary;
  }

  revertChanges(rowId: string, fields?: string[]): any {
    const original = this.originalData.get(rowId);
    if (!original) return null;

    const rowChanges = this.changes.get(rowId);
    if (!rowChanges) return original;

    if (fields) {
      // Revert specific fields
      const reverted = { ...rowChanges };
      fields.forEach(field => {
        if (rowChanges[field]) {
          reverted[field] = original[field];
          delete rowChanges[field];
        }
      });
      return reverted;
    } else {
      // Revert all changes for the row
      this.changes.delete(rowId);
      return original;
    }
  }

  clearChangeTracking(): void {
    this.originalData.clear();
    this.changes.clear();
    this.changeHistory = [];
  }

  exportChanges(): any {
    return {
      changes: Object.fromEntries(this.changes.entries()),
      history: this.changeHistory,
      summary: this.getChangesSummary(),
      exportedAt: new Date()
    };
  }

  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUser(): string {
    // Implementation would get current user from auth service
    return 'current_user';
  }
}
```

## Performance Optimization

### Efficient Data Updates

```typescript
export class EfficientUpdateService {
  private updateQueue: any[] = [];
  private batchTimeout?: number;
  private readonly BATCH_SIZE = 100;
  private readonly BATCH_DELAY = 50; // ms

  queueUpdate(update: any): void {
    this.updateQueue.push(update);
    this.scheduleBatchUpdate();
  }

  private scheduleBatchUpdate(): void {
    if (this.batchTimeout) return;

    this.batchTimeout = window.setTimeout(() => {
      this.processBatchUpdates();
      this.batchTimeout = undefined;
    }, this.BATCH_DELAY);
  }

  private processBatchUpdates(): void {
    if (this.updateQueue.length === 0) return;

    // Group updates by type
    const batches = this.groupUpdatesByType(this.updateQueue);
    
    // Process each batch
    Object.entries(batches).forEach(([type, updates]) => {
      this.processBatch(type, updates as any[]);
    });

    // Clear queue
    this.updateQueue = [];
  }

  private groupUpdatesByType(updates: any[]): Record<string, any[]> {
    return updates.reduce((groups, update) => {
      const type = update.operation || 'update';
      if (!groups[type]) groups[type] = [];
      groups[type].push(update);
      return groups;
    }, {} as Record<string, any[]>);
  }

  private processBatch(type: string, updates: any[]): void {
    // Split large batches
    const chunks = this.chunkArray(updates, this.BATCH_SIZE);
    
    chunks.forEach((chunk, index) => {
      // Stagger large batch processing
      setTimeout(() => {
        this.applyBatchUpdate(type, chunk);
      }, index * 10);
    });
  }

  private applyBatchUpdate(type: string, updates: any[]): void {
    const startTime = performance.now();
    
    switch (type) {
      case 'insert':
        this.gridApi.applyTransaction({ add: updates });
        break;
      case 'update':
        this.gridApi.applyTransaction({ update: updates });
        break;
      case 'delete':
        this.gridApi.applyTransaction({ remove: updates });
        break;
    }

    const duration = performance.now() - startTime;
    console.log(`Batch ${type} (${updates.length} items) completed in ${duration.toFixed(2)}ms`);
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
```

## API Reference

### Grid API Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `applyTransaction()` | `transaction: { add?, update?, remove? }` | Apply data transaction |
| `setRowData()` | `data: any[]` | Replace all row data |
| `updateRowData()` | `transaction` | Update specific rows |
| `getRowNode()` | `id: string` | Get row node by ID |
| `forEachNode()` | `callback: function` | Iterate over all nodes |

### Transaction Interface

```typescript
interface RowDataTransaction {
  add?: any[];      // Rows to add
  update?: any[];   // Rows to update
  remove?: any[];   // Rows to remove
  addIndex?: number; // Insert position for adds
}
```

### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `rowDataChanged` | Row data has changed | RowDataChangedEvent |
| `cellValueChanged` | Cell value changed | CellValueChangedEvent |
| `rowValueChanged` | Row data changed | RowValueChangedEvent |

## Best Practices

1. **Use transactions** for multiple related changes
2. **Implement optimistic updates** for better user experience
3. **Handle conflicts gracefully** with proper resolution strategies
4. **Track changes** for audit trails and undo functionality
5. **Batch updates** for better performance
6. **Provide visual feedback** for pending and failed operations
7. **Implement proper error handling** with rollback capabilities
8. **Test with realistic data volumes** to ensure performance