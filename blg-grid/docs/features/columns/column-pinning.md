# Column Pinning

## Overview

Column pinning allows you to fix columns to the left or right side of the grid, keeping them visible while users scroll horizontally through other columns. This is essential for maintaining context in wide datasets where key information needs to remain visible.

## Use Cases

- Keep ID or name columns visible during horizontal scrolling
- Pin action columns to the right for easy access
- Maintain context for key business data
- Create fixed navigation columns
- Implement dashboard-like layouts

## Basic Column Pinning

### Static Pinning in Column Definitions

```typescript
import { BlgGridComponent } from '@blg/grid';

@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs">
    </blg-grid>
  `
})
export class PinnedColumnsComponent {
  columnDefs = [
    { 
      field: 'id', 
      headerName: 'ID',
      pinned: 'left',
      width: 80,
      lockPinned: true  // Prevent user from unpinning
    },
    { 
      field: 'name', 
      headerName: 'Name',
      pinned: 'left',
      width: 200
    },
    { 
      field: 'department', 
      headerName: 'Department',
      width: 150
      // This column is not pinned - will scroll
    },
    { 
      field: 'salary', 
      headerName: 'Salary',
      width: 120
      // This column is not pinned - will scroll
    },
    { 
      field: 'email', 
      headerName: 'Email',
      width: 250
      // This column is not pinned - will scroll
    },
    { 
      field: 'actions', 
      headerName: 'Actions',
      pinned: 'right',
      width: 120,
      lockPinned: true,
      cellRenderer: 'actionsCellRenderer'
    }
  ];
}
```

### Dynamic Pinning

```typescript
@Component({
  template: `
    <div class="controls">
      <button (click)="pinColumn('name', 'left')">Pin Name Left</button>
      <button (click)="pinColumn('email', 'right')">Pin Email Right</button>
      <button (click)="unpinColumn('name')">Unpin Name</button>
      <button (click)="clearAllPinned()">Clear All Pinned</button>
    </div>
    <blg-grid 
      #grid
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (gridReady)="onGridReady($event)">
    </blg-grid>
  `
})
export class DynamicPinningComponent {
  private columnApi!: ColumnApi;

  onGridReady(params: any): void {
    this.columnApi = params.columnApi;
  }

  pinColumn(columnId: string, position: 'left' | 'right'): void {
    this.columnApi.setColumnPinned(columnId, position);
  }

  unpinColumn(columnId: string): void {
    this.columnApi.setColumnPinned(columnId, null);
  }

  clearAllPinned(): void {
    const allColumns = this.columnApi.getAllColumns() || [];
    allColumns.forEach(column => {
      this.columnApi.setColumnPinned(column.getColId(), null);
    });
  }

  // Pin multiple columns at once
  pinMultipleColumns(columnIds: string[], position: 'left' | 'right'): void {
    columnIds.forEach(columnId => {
      this.columnApi.setColumnPinned(columnId, position);
    });
  }
}
```

## Advanced Pinning Features

### Conditional Pinning

```typescript
export class ConditionalPinningComponent {
  private userRole: string = 'admin';
  private screenSize: string = 'desktop';

  columnDefs = [
    {
      field: 'id',
      headerName: 'ID',
      pinned: this.shouldPinColumn('id') ? 'left' : null,
      width: 80
    },
    {
      field: 'name',
      headerName: 'Name',
      pinned: this.shouldPinColumn('name') ? 'left' : null,
      width: 200
    },
    {
      field: 'adminActions',
      headerName: 'Admin',
      pinned: this.shouldPinColumn('adminActions') ? 'right' : null,
      width: 120,
      hide: !this.isAdmin()
    }
  ];

  private shouldPinColumn(field: string): boolean {
    const pinningRules = {
      id: this.screenSize !== 'mobile',
      name: true,
      adminActions: this.isAdmin() && this.screenSize !== 'mobile'
    };
    
    return pinningRules[field] || false;
  }

  private isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateScreenSize();
    this.updatePinningBasedOnScreenSize();
  }

  private updateScreenSize(): void {
    const width = window.innerWidth;
    if (width < 768) this.screenSize = 'mobile';
    else if (width < 1024) this.screenSize = 'tablet';
    else this.screenSize = 'desktop';
  }

  private updatePinningBasedOnScreenSize(): void {
    const pinningConfig = {
      mobile: {
        left: ['name'],
        right: []
      },
      tablet: {
        left: ['id', 'name'],
        right: ['actions']
      },
      desktop: {
        left: ['id', 'name'],
        right: ['adminActions', 'actions']
      }
    };

    const config = pinningConfig[this.screenSize];
    
    // Clear all pinning first
    this.clearAllPinned();
    
    // Apply new pinning
    config.left.forEach(columnId => {
      this.columnApi.setColumnPinned(columnId, 'left');
    });
    
    config.right.forEach(columnId => {
      this.columnApi.setColumnPinned(columnId, 'right');
    });
  }
}
```

### Pinned Column Groups

```typescript
export class PinnedColumnGroupsComponent {
  columnDefs = [
    {
      headerName: 'Fixed Info',
      pinned: 'left',
      children: [
        { 
          field: 'id', 
          headerName: 'ID',
          width: 80 
        },
        { 
          field: 'name', 
          headerName: 'Name',
          width: 150 
        }
      ]
    },
    {
      headerName: 'Personal Details',
      // Not pinned - will scroll
      children: [
        { field: 'age', headerName: 'Age', width: 80 },
        { field: 'birthDate', headerName: 'Birth Date', width: 120 },
        { field: 'address', headerName: 'Address', width: 200 }
      ]
    },
    {
      headerName: 'Contact Info',
      // Not pinned - will scroll
      children: [
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone', headerName: 'Phone', width: 130 }
      ]
    },
    {
      headerName: 'Actions',
      pinned: 'right',
      children: [
        { 
          field: 'edit', 
          headerName: 'Edit',
          width: 80,
          cellRenderer: 'editButtonRenderer'
        },
        { 
          field: 'delete', 
          headerName: 'Delete',
          width: 80,
          cellRenderer: 'deleteButtonRenderer'
        }
      ]
    }
  ];

  // Programmatically pin/unpin entire groups
  pinColumnGroup(groupId: string, position: 'left' | 'right'): void {
    const groupColumns = this.getColumnsByGroup(groupId);
    groupColumns.forEach(columnId => {
      this.columnApi.setColumnPinned(columnId, position);
    });
  }

  unpinColumnGroup(groupId: string): void {
    const groupColumns = this.getColumnsByGroup(groupId);
    groupColumns.forEach(columnId => {
      this.columnApi.setColumnPinned(columnId, null);
    });
  }
}
```

## User-Controllable Pinning

### Context Menu Pinning

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [getContextMenuItems]="getContextMenuItems.bind(this)"
      (columnPinned)="onColumnPinned($event)">
    </blg-grid>
  `
})
export class ContextMenuPinningComponent {
  getContextMenuItems(params: any): any[] {
    const column = params.column;
    const isPinned = column.getPinned();
    
    const result = [];

    if (!isPinned) {
      result.push({
        name: 'Pin Left',
        action: () => {
          this.columnApi.setColumnPinned(column.getColId(), 'left');
        },
        icon: '<span class="ag-icon ag-icon-pin"></span>'
      });
      result.push({
        name: 'Pin Right',
        action: () => {
          this.columnApi.setColumnPinned(column.getColId(), 'right');
        },
        icon: '<span class="ag-icon ag-icon-pin"></span>'
      });
    } else {
      result.push({
        name: 'Unpin Column',
        action: () => {
          this.columnApi.setColumnPinned(column.getColId(), null);
        },
        icon: '<span class="ag-icon ag-icon-unpin"></span>'
      });
    }

    return result;
  }

  onColumnPinned(event: ColumnPinnedEvent): void {
    console.log('Column pinned:', {
      column: event.column?.getColId(),
      pinned: event.pinned,
      source: event.source
    });

    // Save pinning preferences
    this.savePinningPreferences();
  }
}
```

### Drag-and-Drop Pinning

```typescript
export class DragDropPinningComponent {
  // Enable pinning zones for drag and drop
  gridOptions = {
    suppressDragLeaveHidesColumns: true,
    suppressMovableColumns: false
  };

  onColumnMoved(event: ColumnMovedEvent): void {
    const column = event.column;
    if (!column) return;

    // Check if column was moved to pinning zone
    const newIndex = event.toIndex;
    const totalColumns = this.columnApi.getAllDisplayedColumns()?.length || 0;

    // Auto-pin if moved to first 2 positions
    if (newIndex <= 1) {
      this.columnApi.setColumnPinned(column.getColId(), 'left');
    }
    // Auto-pin if moved to last 2 positions
    else if (newIndex >= totalColumns - 2) {
      this.columnApi.setColumnPinned(column.getColId(), 'right');
    }
    // Unpin if moved to middle
    else if (column.getPinned()) {
      this.columnApi.setColumnPinned(column.getColId(), null);
    }
  }

  // Visual feedback for pinning zones
  onDragStarted(event: DragStartedEvent): void {
    this.showPinningZones();
  }

  onDragStopped(event: DragStoppedEvent): void {
    this.hidePinningZones();
  }

  private showPinningZones(): void {
    // Add CSS classes to show pinning zones
    const gridElement = document.querySelector('.ag-grid');
    gridElement?.classList.add('show-pinning-zones');
  }

  private hidePinningZones(): void {
    const gridElement = document.querySelector('.ag-grid');
    gridElement?.classList.remove('show-pinning-zones');
  }
}
```

## Pinning State Management

### Save and Restore Pinning

```typescript
export class PinningStateManager {
  private readonly PINNING_STATE_KEY = 'grid-pinning-state';
  private columnApi!: ColumnApi;

  onGridReady(params: any): void {
    this.columnApi = params.columnApi;
    setTimeout(() => this.loadPinningState(), 100);
  }

  onColumnPinned(event: ColumnPinnedEvent): void {
    this.savePinningState();
  }

  private savePinningState(): void {
    const columnState = this.columnApi.getColumnState();
    const pinningState = {
      timestamp: Date.now(),
      columns: columnState
        .filter(col => col.pinned)
        .map(col => ({
          colId: col.colId,
          pinned: col.pinned
        }))
    };

    localStorage.setItem(this.PINNING_STATE_KEY, JSON.stringify(pinningState));
  }

  private loadPinningState(): void {
    const saved = localStorage.getItem(this.PINNING_STATE_KEY);
    if (saved && this.columnApi) {
      try {
        const pinningState = JSON.parse(saved);
        
        // Apply saved state if recent (within 30 days)
        if (Date.now() - pinningState.timestamp < 30 * 24 * 60 * 60 * 1000) {
          this.applyPinningState(pinningState.columns);
        }
      } catch (error) {
        console.error('Failed to load pinning state:', error);
      }
    }
  }

  private applyPinningState(columns: any[]): void {
    columns.forEach(col => {
      this.columnApi.setColumnPinned(col.colId, col.pinned);
    });
  }

  resetPinningState(): void {
    localStorage.removeItem(this.PINNING_STATE_KEY);
    
    // Unpin all columns
    const allColumns = this.columnApi.getAllColumns() || [];
    allColumns.forEach(column => {
      this.columnApi.setColumnPinned(column.getColId(), null);
    });
  }
}
```

### Workspace-Based Pinning

```typescript
export class WorkspacePinningComponent {
  private workspaces = {
    overview: {
      left: ['id', 'name'],
      right: ['status', 'actions']
    },
    detailed: {
      left: ['id', 'name', 'category'],
      right: ['priority', 'assignee', 'actions']
    },
    minimal: {
      left: ['name'],
      right: ['actions']
    }
  };

  switchWorkspace(workspaceName: string): void {
    const workspace = this.workspaces[workspaceName];
    if (!workspace) return;

    // Clear current pinning
    this.clearAllPinned();

    // Apply workspace pinning
    workspace.left.forEach(columnId => {
      this.columnApi.setColumnPinned(columnId, 'left');
    });

    workspace.right.forEach(columnId => {
      this.columnApi.setColumnPinned(columnId, 'right');
    });

    this.saveCurrentWorkspace(workspaceName);
  }

  saveCurrentWorkspace(name: string): void {
    const currentPinning = this.getCurrentPinningState();
    this.workspaces[name] = currentPinning;
    this.saveWorkspacesToStorage();
  }

  private getCurrentPinningState(): any {
    const columnState = this.columnApi.getColumnState();
    return {
      left: columnState.filter(col => col.pinned === 'left').map(col => col.colId),
      right: columnState.filter(col => col.pinned === 'right').map(col => col.colId)
    };
  }
}
```

## Performance Optimization

### Efficient Pinning Updates

```typescript
export class OptimizedPinningComponent {
  private pinnedUpdateQueue: Array<{columnId: string, pinned: string | null}> = [];
  private updateTimeout?: number;

  queuePinningUpdate(columnId: string, pinned: 'left' | 'right' | null): void {
    // Add to queue
    this.pinnedUpdateQueue.push({ columnId, pinned });
    
    // Debounce updates
    clearTimeout(this.updateTimeout);
    this.updateTimeout = window.setTimeout(() => {
      this.processPinningQueue();
    }, 100);
  }

  private processPinningQueue(): void {
    if (this.pinnedUpdateQueue.length === 0) return;

    // Group updates by column
    const updates = new Map<string, string | null>();
    this.pinnedUpdateQueue.forEach(update => {
      updates.set(update.columnId, update.pinned);
    });

    // Apply all updates
    updates.forEach((pinned, columnId) => {
      this.columnApi.setColumnPinned(columnId, pinned);
    });

    // Clear queue
    this.pinnedUpdateQueue = [];
  }

  // Batch pinning operations for better performance
  batchPinColumns(operations: Array<{columnId: string, position: 'left' | 'right' | null}>): void {
    // Disable grid updates
    this.gridApi.setSuppressModelUpdateAfterUpdateTransaction(true);

    try {
      operations.forEach(op => {
        this.columnApi.setColumnPinned(op.columnId, op.position);
      });
    } finally {
      // Re-enable grid updates
      this.gridApi.setSuppressModelUpdateAfterUpdateTransaction(false);
    }
  }
}
```

### Virtual Scrolling with Pinned Columns

```typescript
export class VirtualScrollPinningComponent {
  gridOptions = {
    // Optimize for large datasets with pinned columns
    suppressColumnVirtualisation: false,
    rowBuffer: 10,
    
    // Maintain pinned column performance
    pinnedTopRowData: [],
    pinnedBottomRowData: [],
    
    // Optimize scrolling
    animateRows: false,
    suppressAnimationFrame: false
  };

  onGridReady(params: any): void {
    // Pre-calculate pinned column widths
    this.optimizePinnedColumnWidths();
  }

  private optimizePinnedColumnWidths(): void {
    const pinnedLeftColumns = this.columnApi.getDisplayedColumnsLeft() || [];
    const pinnedRightColumns = this.columnApi.getDisplayedColumnsRight() || [];
    
    // Ensure pinned columns have reasonable widths for performance
    [...pinnedLeftColumns, ...pinnedRightColumns].forEach(column => {
      const currentWidth = column.getActualWidth();
      const minWidth = 50;
      const maxWidth = 300;
      
      if (currentWidth < minWidth || currentWidth > maxWidth) {
        const optimalWidth = Math.min(Math.max(currentWidth, minWidth), maxWidth);
        this.columnApi.setColumnWidth(column.getColId(), optimalWidth);
      }
    });
  }
}
```

## API Reference

### Grid Options

| Option | Type | Description |
|--------|------|-------------|
| `suppressDragLeaveHidesColumns` | boolean | Keep columns visible during drag |
| `suppressMovableColumns` | boolean | Disable column moving |

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `pinned` | 'left' \| 'right' \| null | Pin column position |
| `lockPinned` | boolean | Prevent user from changing pin state |
| `suppressMovable` | boolean | Prevent column from being moved |

### API Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `setColumnPinned()` | `columnId: string, pinned: 'left' \| 'right' \| null` | Pin/unpin column |
| `getDisplayedColumnsLeft()` | - | Get left pinned columns |
| `getDisplayedColumnsRight()` | - | Get right pinned columns |
| `getDisplayedColumnsCenter()` | - | Get non-pinned columns |

### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `columnPinned` | Column pin state changed | ColumnPinnedEvent |
| `displayedColumnsChanged` | Displayed columns changed | DisplayedColumnsChangedEvent |

## Common Patterns

### Smart Pinning Based on Usage

```typescript
export class SmartPinningComponent {
  private columnUsageStats = new Map<string, number>();
  private readonly USAGE_THRESHOLD = 10;

  onCellClicked(event: CellClickedEvent): void {
    const columnId = event.column.getColId();
    const currentUsage = this.columnUsageStats.get(columnId) || 0;
    this.columnUsageStats.set(columnId, currentUsage + 1);

    // Auto-pin frequently used columns
    if (currentUsage + 1 === this.USAGE_THRESHOLD) {
      this.suggestPinning(columnId);
    }
  }

  private suggestPinning(columnId: string): void {
    const column = this.columnApi.getColumn(columnId);
    if (column && !column.getPinned()) {
      // Show suggestion to user
      this.showPinningSuggestion(columnId);
    }
  }

  private showPinningSuggestion(columnId: string): void {
    // Implementation would show a toast or modal
    const shouldPin = confirm(`Would you like to pin the ${columnId} column for easier access?`);
    if (shouldPin) {
      this.columnApi.setColumnPinned(columnId, 'left');
    }
  }
}
```

### Responsive Pinning Strategy

```typescript
export class ResponsivePinningStrategy {
  private pinningStrategies = {
    mobile: {
      maxPinnedLeft: 1,
      maxPinnedRight: 1,
      priorityColumns: {
        left: ['name'],
        right: ['actions']
      }
    },
    tablet: {
      maxPinnedLeft: 2,
      maxPinnedRight: 2,
      priorityColumns: {
        left: ['id', 'name'],
        right: ['status', 'actions']
      }
    },
    desktop: {
      maxPinnedLeft: 3,
      maxPinnedRight: 3,
      priorityColumns: {
        left: ['id', 'name', 'category'],
        right: ['priority', 'assignee', 'actions']
      }
    }
  };

  applyResponsivePinning(): void {
    const screenSize = this.getScreenSize();
    const strategy = this.pinningStrategies[screenSize];

    // Clear existing pinning
    this.clearAllPinned();

    // Apply priority pinning based on screen size
    strategy.priorityColumns.left.slice(0, strategy.maxPinnedLeft).forEach(columnId => {
      this.columnApi.setColumnPinned(columnId, 'left');
    });

    strategy.priorityColumns.right.slice(0, strategy.maxPinnedRight).forEach(columnId => {
      this.columnApi.setColumnPinned(columnId, 'right');
    });
  }
}
```

## Troubleshooting

### Common Issues

1. **Columns not staying pinned**: Check if `lockPinned` is set correctly and no code is overriding the pin state
2. **Performance issues with pinned columns**: Reduce the number of pinned columns or optimize column widths
3. **Horizontal scrolling not working**: Ensure non-pinned columns have sufficient total width to require scrolling
4. **Pinning state not persisting**: Verify save/load logic and localStorage availability

### Debugging Pinning

```typescript
export class PinningDebugger {
  debugPinningState(): void {
    console.group('Column Pinning Debug');
    
    const leftPinned = this.columnApi.getDisplayedColumnsLeft() || [];
    const rightPinned = this.columnApi.getDisplayedColumnsRight() || [];
    const center = this.columnApi.getDisplayedColumnsCenter() || [];

    console.log('Left Pinned:', leftPinned.map(col => ({
      id: col.getColId(),
      width: col.getActualWidth()
    })));

    console.log('Right Pinned:', rightPinned.map(col => ({
      id: col.getColId(),
      width: col.getActualWidth()
    })));

    console.log('Center Columns:', center.length);
    console.log('Total Width - Left:', leftPinned.reduce((sum, col) => sum + col.getActualWidth(), 0));
    console.log('Total Width - Right:', rightPinned.reduce((sum, col) => sum + col.getActualWidth(), 0));
    
    console.groupEnd();
  }

  validatePinningConstraints(): boolean {
    const allColumns = this.columnApi.getAllColumns() || [];
    const issues: string[] = [];

    allColumns.forEach(column => {
      const colDef = column.getColDef();
      
      if (colDef.pinned && colDef.lockPinned === false) {
        issues.push(`Column ${column.getColId()} is pinned but not locked`);
      }
      
      if (column.getPinned() !== colDef.pinned) {
        issues.push(`Column ${column.getColId()} pin state mismatch`);
      }
    });

    if (issues.length > 0) {
      console.warn('Pinning constraint issues:', issues);
      return false;
    }

    return true;
  }
}
```

## Best Practices

1. **Pin essential columns only** to avoid cluttering the interface
2. **Use left pinning for identifiers** and right pinning for actions
3. **Implement responsive pinning** to adapt to different screen sizes
4. **Provide user control** through context menus or UI controls
5. **Save pinning preferences** to improve user experience across sessions
6. **Consider performance impact** when pinning many columns with complex cell renderers
7. **Test horizontal scrolling** to ensure it works smoothly with pinned columns
8. **Use appropriate widths** for pinned columns to optimize viewport space