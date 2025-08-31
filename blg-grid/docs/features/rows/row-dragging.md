# Row Dragging

## Overview

Row dragging enables users to reorder rows by dragging them to new positions within the grid. This feature provides intuitive row management capabilities and is essential for applications that require user-controlled data ordering, prioritization, or organization.

## Use Cases

- Reorder priority lists or task queues
- Organize data by user preference
- Create custom sorting arrangements
- Implement drag-and-drop workflows
- Build interactive ranking systems

## Basic Row Dragging

### Enable Row Dragging

```typescript
import { BlgGridComponent } from '@blg/grid';

@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [rowDragManaged]="true"
      [animateRows]="true">
    </blg-grid>
  `
})
export class BasicRowDraggingComponent {
  columnDefs = [
    { 
      field: 'drag',
      rowDrag: true,
      checkboxSelection: false,
      width: 40,
      suppressMenu: true,
      suppressSorting: true,
      suppressFilter: true
    },
    { field: 'priority', headerName: 'Priority', width: 100 },
    { field: 'task', headerName: 'Task', width: 300 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'assignee', headerName: 'Assignee', width: 150 }
  ];

  rowData = [
    { id: 1, priority: 1, task: 'Implement user authentication', status: 'In Progress', assignee: 'John Doe' },
    { id: 2, priority: 2, task: 'Design dashboard layout', status: 'Todo', assignee: 'Jane Smith' },
    { id: 3, priority: 3, task: 'Set up CI/CD pipeline', status: 'Todo', assignee: 'Mike Johnson' },
    { id: 4, priority: 4, task: 'Write unit tests', status: 'Todo', assignee: 'Sarah Wilson' }
  ];
}
```

### Custom Drag Handle

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [rowDragManaged]="true"
      [frameworkComponents]="frameworkComponents"
      (rowDragMove)="onRowDragMove($event)"
      (rowDragEnd)="onRowDragEnd($event)">
    </blg-grid>
  `
})
export class CustomDragHandleComponent {
  frameworkComponents = {
    dragHandleRenderer: DragHandleRendererComponent
  };

  columnDefs = [
    {
      field: 'dragHandle',
      cellRenderer: 'dragHandleRenderer',
      rowDrag: true,
      width: 50,
      suppressMenu: true,
      suppressSorting: true,
      suppressFilter: true,
      cellStyle: { cursor: 'grab' }
    },
    { field: 'name', headerName: 'Name' },
    { field: 'category', headerName: 'Category' },
    { field: 'value', headerName: 'Value' }
  ];

  onRowDragMove(event: RowDragEvent): void {
    console.log('Row being dragged:', event.node.data);
  }

  onRowDragEnd(event: RowDragEvent): void {
    console.log('Row drag completed');
    this.updateRowOrder();
  }

  private updateRowOrder(): void {
    // Update priority based on new row positions
    this.gridApi.forEachNodeAfterFilterAndSort((node, index) => {
      if (node.data.priority !== index + 1) {
        node.setDataValue('priority', index + 1);
      }
    });
  }
}

@Component({
  selector: 'app-drag-handle-renderer',
  template: `
    <div class="drag-handle" title="Drag to reorder">
      <span class="drag-icon">⋮⋮</span>
    </div>
  `,
  styles: [`
    .drag-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      cursor: grab;
      color: #666;
      font-size: 16px;
      font-weight: bold;
    }
    
    .drag-handle:active {
      cursor: grabbing;
    }
    
    .drag-handle:hover {
      color: #333;
      background-color: #f5f5f5;
    }
    
    .drag-icon {
      user-select: none;
      line-height: 1;
    }
  `]
})
export class DragHandleRendererComponent implements ICellRendererAngularComp {
  agInit(params: any): void {
    // Component initialization
  }

  refresh(params: any): boolean {
    return false;
  }
}
```

## Advanced Row Dragging

### Conditional Row Dragging

```typescript
export class ConditionalRowDraggingComponent {
  columnDefs = [
    {
      field: 'dragHandle',
      rowDrag: (params) => this.isRowDraggable(params),
      width: 50,
      cellRenderer: this.dragHandleRenderer.bind(this)
    },
    { field: 'name', headerName: 'Name' },
    { field: 'status', headerName: 'Status' },
    { field: 'locked', headerName: 'Locked' }
  ];

  private isRowDraggable(params: any): boolean {
    const data = params.data;
    
    // Only allow dragging if:
    // 1. Row is not locked
    // 2. User has permission to reorder
    // 3. Status allows modification
    return !data.locked && 
           this.hasReorderPermission() && 
           data.status !== 'completed';
  }

  private hasReorderPermission(): boolean {
    return this.userService.hasPermission('reorder_items');
  }

  private dragHandleRenderer(params: any): string {
    if (this.isRowDraggable(params)) {
      return '<div class="drag-handle draggable">⋮⋮</div>';
    } else {
      return '<div class="drag-handle disabled" title="Cannot reorder this item">🔒</div>';
    }
  }

  onRowDragMove(event: RowDragEvent): void {
    // Validate drag target position
    if (!this.isValidDragTarget(event)) {
      event.api.showLoadingOverlay();
    }
  }

  onRowDragEnd(event: RowDragEvent): void {
    event.api.hideOverlay();
    
    if (this.isValidDragTarget(event)) {
      this.updateRowOrder();
      this.saveOrderToServer();
    } else {
      this.revertDrag(event);
    }
  }

  private isValidDragTarget(event: RowDragEvent): boolean {
    const overNode = event.overNode;
    
    // Cannot drop on locked rows or completed items
    if (overNode && (overNode.data.locked || overNode.data.status === 'completed')) {
      return false;
    }
    
    return true;
  }

  private revertDrag(event: RowDragEvent): void {
    // Revert to original position
    this.gridApi.setRowData(this.originalRowData);
  }
}
```

### Multi-Row Dragging

```typescript
export class MultiRowDraggingComponent {
  private selectedRowIds = new Set<string>();

  columnDefs = [
    { 
      field: 'select',
      checkboxSelection: true,
      width: 50
    },
    {
      field: 'dragHandle',
      rowDrag: true,
      width: 50,
      cellRenderer: this.multiDragRenderer.bind(this)
    },
    { field: 'name', headerName: 'Name' },
    { field: 'category', headerName: 'Category' }
  ];

  onSelectionChanged(event: SelectionChangedEvent): void {
    const selectedNodes = event.api.getSelectedNodes();
    this.selectedRowIds = new Set(selectedNodes.map(node => node.data.id));
  }

  private multiDragRenderer(params: any): string {
    const isSelected = this.selectedRowIds.has(params.data.id);
    const selectedCount = this.selectedRowIds.size;
    
    if (isSelected && selectedCount > 1) {
      return `
        <div class="multi-drag-handle" title="Drag ${selectedCount} selected items">
          <span class="drag-icon">⋮⋮</span>
          <span class="count-badge">${selectedCount}</span>
        </div>
      `;
    }
    
    return '<div class="drag-handle">⋮⋮</div>';
  }

  onRowDragEnd(event: RowDragEvent): void {
    const draggedNode = event.node;
    const selectedNodes = this.gridApi.getSelectedNodes();
    
    if (selectedNodes.length > 1 && selectedNodes.includes(draggedNode)) {
      this.moveMultipleRows(selectedNodes, event);
    } else {
      this.moveSingleRow(draggedNode, event);
    }
  }

  private moveMultipleRows(selectedNodes: any[], event: RowDragEvent): void {
    const insertIndex = this.calculateInsertIndex(event);
    const rowsToMove = selectedNodes.map(node => ({ ...node.data }));
    
    // Remove selected rows from their current positions
    const remainingRows = this.getAllRows().filter(row => 
      !selectedNodes.some(node => node.data.id === row.id)
    );
    
    // Insert selected rows at new position
    remainingRows.splice(insertIndex, 0, ...rowsToMove);
    
    // Update grid
    this.gridApi.setRowData(remainingRows);
    
    // Restore selection
    setTimeout(() => {
      this.restoreSelection(rowsToMove);
    }, 100);
  }

  private restoreSelection(movedRows: any[]): void {
    const idsToSelect = movedRows.map(row => row.id);
    
    this.gridApi.forEachNode(node => {
      if (idsToSelect.includes(node.data.id)) {
        node.setSelected(true);
      }
    });
  }
}
```

### Drag Between Grids

```typescript
@Component({
  template: `
    <div class="grid-container">
      <div class="source-grid">
        <h3>Source Grid</h3>
        <blg-grid
          #sourceGrid
          [rowData]="sourceRowData"
          [columnDefs]="columnDefs"
          [rowDragManaged]="false"
          (rowDragLeave)="onRowDragLeave($event)"
          (rowDragEnd)="onRowDragEnd($event)">
        </blg-grid>
      </div>
      
      <div class="target-grid">
        <h3>Target Grid</h3>
        <blg-grid
          #targetGrid
          [rowData]="targetRowData"
          [columnDefs]="columnDefs"
          [rowDragManaged]="false"
          (rowDragEnter)="onRowDragEnter($event)"
          (rowDragEnd)="onRowDragEnd($event)">
        </blg-grid>
      </div>
    </div>
  `,
  styles: [`
    .grid-container {
      display: flex;
      gap: 20px;
    }
    
    .source-grid,
    .target-grid {
      flex: 1;
    }
    
    .drag-target {
      border: 2px dashed #007bff;
      background-color: rgba(0, 123, 255, 0.1);
    }
  `]
})
export class DragBetweenGridsComponent {
  @ViewChild('sourceGrid') sourceGrid!: BlgGridComponent;
  @ViewChild('targetGrid') targetGrid!: BlgGridComponent;

  sourceRowData = [
    { id: 1, name: 'Item 1', category: 'A', status: 'available' },
    { id: 2, name: 'Item 2', category: 'B', status: 'available' }
  ];

  targetRowData = [
    { id: 3, name: 'Item 3', category: 'C', status: 'assigned' }
  ];

  columnDefs = [
    {
      field: 'dragHandle',
      rowDrag: true,
      width: 50,
      cellRenderer: () => '<div class="drag-handle">⋮⋮</div>'
    },
    { field: 'name', headerName: 'Name' },
    { field: 'category', headerName: 'Category' },
    { field: 'status', headerName: 'Status' }
  ];

  onRowDragLeave(event: RowDragEvent): void {
    console.log('Row drag leaving source grid');
    this.highlightDropZone(false);
  }

  onRowDragEnter(event: RowDragEvent): void {
    console.log('Row drag entering target grid');
    this.highlightDropZone(true);
  }

  onRowDragEnd(event: RowDragEvent): void {
    const draggedData = event.node.data;
    const targetElement = event.event.target as HTMLElement;
    
    // Determine if dropped on target grid
    if (this.isDroppedOnTargetGrid(targetElement)) {
      this.moveRowBetweenGrids(draggedData);
    }
    
    this.highlightDropZone(false);
  }

  private isDroppedOnTargetGrid(element: HTMLElement): boolean {
    return element.closest('.target-grid') !== null;
  }

  private moveRowBetweenGrids(rowData: any): void {
    // Remove from source
    this.sourceRowData = this.sourceRowData.filter(row => row.id !== rowData.id);
    this.sourceGrid.api.setRowData(this.sourceRowData);
    
    // Add to target
    rowData.status = 'assigned'; // Update status for target grid
    this.targetRowData = [...this.targetRowData, rowData];
    this.targetGrid.api.setRowData(this.targetRowData);
  }

  private highlightDropZone(highlight: boolean): void {
    const targetGridElement = document.querySelector('.target-grid .ag-root-wrapper');
    
    if (targetGridElement) {
      if (highlight) {
        targetGridElement.classList.add('drag-target');
      } else {
        targetGridElement.classList.remove('drag-target');
      }
    }
  }
}
```

## Drag Visual Feedback

### Custom Drag Ghost

```typescript
export class CustomDragGhostComponent {
  gridOptions = {
    rowDragManaged: true,
    animateRows: true,
    onRowDragMove: this.onRowDragMove.bind(this),
    onRowDragEnd: this.onRowDragEnd.bind(this)
  };

  columnDefs = [
    {
      field: 'dragHandle',
      rowDrag: true,
      width: 50,
      cellRenderer: this.dragHandleRenderer.bind(this)
    },
    { field: 'name', headerName: 'Name' },
    { field: 'priority', headerName: 'Priority' },
    { field: 'status', headerName: 'Status' }
  ];

  private dragHandleRenderer(params: any): string {
    return `
      <div class="custom-drag-handle" data-row-id="${params.data.id}">
        <span class="drag-dots">⋮⋮</span>
      </div>
    `;
  }

  onRowDragMove(event: RowDragEvent): void {
    this.updateDragGhost(event);
    this.showDropIndicator(event);
  }

  onRowDragEnd(event: RowDragEvent): void {
    this.hideDragGhost();
    this.hideDropIndicator();
  }

  private updateDragGhost(event: RowDragEvent): void {
    const ghostElement = this.createOrGetDragGhost();
    const draggedData = event.node.data;
    
    ghostElement.innerHTML = `
      <div class="drag-ghost">
        <div class="ghost-header">Moving Item</div>
        <div class="ghost-content">
          <strong>${draggedData.name}</strong><br>
          Priority: ${draggedData.priority}<br>
          Status: ${draggedData.status}
        </div>
      </div>
    `;
    
    // Position ghost near cursor
    const rect = event.event.getBoundingClientRect();
    ghostElement.style.left = (rect.x + 20) + 'px';
    ghostElement.style.top = (rect.y - 10) + 'px';
    ghostElement.style.display = 'block';
  }

  private createOrGetDragGhost(): HTMLElement {
    let ghost = document.getElementById('custom-drag-ghost');
    
    if (!ghost) {
      ghost = document.createElement('div');
      ghost.id = 'custom-drag-ghost';
      ghost.className = 'custom-drag-ghost';
      document.body.appendChild(ghost);
    }
    
    return ghost;
  }

  private hideDragGhost(): void {
    const ghost = document.getElementById('custom-drag-ghost');
    if (ghost) {
      ghost.style.display = 'none';
    }
  }

  private showDropIndicator(event: RowDragEvent): void {
    const indicator = this.createOrGetDropIndicator();
    const overNode = event.overNode;
    
    if (overNode) {
      const overElement = this.getRowElement(overNode);
      if (overElement) {
        const rect = overElement.getBoundingClientRect();
        indicator.style.left = rect.left + 'px';
        indicator.style.top = (rect.top - 2) + 'px';
        indicator.style.width = rect.width + 'px';
        indicator.style.display = 'block';
      }
    }
  }

  private createOrGetDropIndicator(): HTMLElement {
    let indicator = document.getElementById('drop-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'drop-indicator';
      indicator.className = 'drop-indicator';
      document.body.appendChild(indicator);
    }
    
    return indicator;
  }

  private hideDropIndicator(): void {
    const indicator = document.getElementById('drop-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  private getRowElement(node: any): HTMLElement | null {
    return document.querySelector(`[row-index="${node.rowIndex}"]`);
  }
}

// Corresponding CSS
/*
.custom-drag-ghost {
  position: fixed;
  z-index: 10000;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 8px;
  max-width: 200px;
  font-size: 12px;
  pointer-events: none;
}

.drag-ghost .ghost-header {
  font-weight: bold;
  color: #007bff;
  margin-bottom: 4px;
}

.drop-indicator {
  position: fixed;
  height: 2px;
  background: #007bff;
  z-index: 9999;
  pointer-events: none;
}

.custom-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: grab;
  color: #666;
}

.custom-drag-handle:active {
  cursor: grabbing;
}

.drag-dots {
  font-size: 16px;
  user-select: none;
}
*/
```

## Performance Optimization

### Efficient Row Dragging

```typescript
export class OptimizedRowDraggingComponent {
  private dragOperationCache = new Map<string, any>();
  private animationFrameId?: number;

  gridOptions = {
    rowDragManaged: true,
    animateRows: true,
    suppressRowTransform: false, // Enable for better drag performance
    
    // Optimize for large datasets
    rowBuffer: 10,
    suppressAnimationFrame: false
  };

  onRowDragMove(event: RowDragEvent): void {
    // Throttle drag move events using animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.animationFrameId = requestAnimationFrame(() => {
      this.handleDragMove(event);
    });
  }

  private handleDragMove(event: RowDragEvent): void {
    const draggedId = event.node.data.id;
    
    // Cache drag operation details
    this.dragOperationCache.set(draggedId, {
      node: event.node,
      overNode: event.overNode,
      timestamp: performance.now()
    });
    
    this.updateDragVisuals(event);
  }

  onRowDragEnd(event: RowDragEvent): void {
    // Clean up animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    
    // Process drag completion
    this.processDragEnd(event);
    
    // Clear cache
    this.dragOperationCache.clear();
  }

  private processDragEnd(event: RowDragEvent): void {
    const startTime = performance.now();
    
    // Batch row updates for better performance
    this.batchUpdateRowOrder();
    
    // Log performance metrics
    const duration = performance.now() - startTime;
    console.log(`Drag operation completed in ${duration.toFixed(2)}ms`);
  }

  private batchUpdateRowOrder(): void {
    // Start batch transaction
    this.gridApi.setSuppressModelUpdateAfterUpdateTransaction(true);
    
    try {
      // Update row priorities in batch
      let priority = 1;
      this.gridApi.forEachNodeAfterFilterAndSort((node) => {
        if (node.data.priority !== priority) {
          node.setDataValue('priority', priority);
        }
        priority++;
      });
    } finally {
      // End batch transaction
      this.gridApi.setSuppressModelUpdateAfterUpdateTransaction(false);
    }
  }

  // Debounced save operation
  private saveTimeout?: number;
  
  private saveOrderToServer(): void {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = window.setTimeout(() => {
      this.performServerSave();
    }, 1000); // Save 1 second after last drag operation
  }

  private performServerSave(): void {
    const currentOrder = this.getCurrentRowOrder();
    this.dataService.saveRowOrder(currentOrder).subscribe({
      next: () => console.log('Row order saved successfully'),
      error: (error) => console.error('Failed to save row order:', error)
    });
  }

  private getCurrentRowOrder(): any[] {
    const order: any[] = [];
    this.gridApi.forEachNodeAfterFilterAndSort((node, index) => {
      order.push({
        id: node.data.id,
        position: index
      });
    });
    return order;
  }
}
```

## API Reference

### Grid Options

| Option | Type | Description |
|--------|------|-------------|
| `rowDragManaged` | boolean | Enable automatic row drag management |
| `rowDragMultiRow` | boolean | Allow dragging multiple selected rows |
| `rowDragEntireRow` | boolean | Drag entire row vs just handle |
| `animateRows` | boolean | Animate row position changes |
| `suppressRowTransform` | boolean | Disable CSS transforms for rows |

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `rowDrag` | boolean \| function | Enable row dragging for this column |
| `dndSource` | boolean | Mark as drag source |
| `dndSourceOnRowDrag` | boolean | Enable DnD source on row drag |

### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `rowDragMove` | Row being dragged | RowDragEvent |
| `rowDragEnd` | Row drag completed | RowDragEvent |
| `rowDragEnter` | Row drag entered grid | RowDragEvent |
| `rowDragLeave` | Row drag left grid | RowDragEvent |

### RowDragEvent Interface

```typescript
interface RowDragEvent {
  api: GridApi;
  columnApi: ColumnApi;
  node: RowNode;
  event: MouseEvent | TouchEvent;
  overIndex?: number;
  overNode?: RowNode;
  y?: number;
  vDirection?: 'up' | 'down';
}
```

## Common Patterns

### Priority Queue Pattern

```typescript
export class PriorityQueuePattern {
  onRowDragEnd(event: RowDragEvent): void {
    this.updatePriorities();
    this.saveChanges();
  }

  private updatePriorities(): void {
    let priority = 1;
    
    this.gridApi.forEachNodeAfterFilterAndSort((node) => {
      if (node.data.priority !== priority) {
        node.setDataValue('priority', priority);
        this.markRowAsModified(node.data.id);
      }
      priority++;
    });
  }

  private markRowAsModified(id: string): void {
    const modifiedRows = this.getModifiedRows();
    modifiedRows.add(id);
    this.setModifiedRows(modifiedRows);
  }
}
```

### Category-Based Dragging

```typescript
export class CategoryBasedDraggingPattern {
  onRowDragMove(event: RowDragEvent): void {
    const draggedData = event.node.data;
    const overData = event.overNode?.data;
    
    // Only allow dropping in same category
    if (overData && draggedData.category !== overData.category) {
      this.showInvalidDropIndicator();
      return;
    }
    
    this.showValidDropIndicator();
  }

  onRowDragEnd(event: RowDragEvent): void {
    const draggedData = event.node.data;
    const overData = event.overNode?.data;
    
    // Validate category match
    if (overData && draggedData.category !== overData.category) {
      this.revertDrag(event);
      this.showCategoryMismatchMessage();
      return;
    }
    
    this.updateRowOrder();
  }
}
```

## Troubleshooting

### Common Issues

1. **Drag not working**: Ensure `rowDrag: true` is set on appropriate column
2. **Animation issues**: Check `animateRows` and `suppressRowTransform` settings
3. **Performance problems**: Implement throttling and batching for large datasets
4. **Visual feedback missing**: Verify CSS classes and drag ghost implementation

### Debugging Row Dragging

```typescript
export class RowDraggingDebugger {
  debugDragConfiguration(): void {
    console.group('Row Dragging Debug');
    
    const columns = this.columnApi.getAllColumns() || [];
    const dragColumns = columns.filter(col => {
      const colDef = col.getColDef();
      return colDef.rowDrag === true || typeof colDef.rowDrag === 'function';
    });
    
    console.log('Drag-enabled columns:', dragColumns.map(col => col.getColId()));
    console.log('Row drag managed:', this.gridOptions.rowDragManaged);
    console.log('Animation enabled:', this.gridOptions.animateRows);
    
    console.groupEnd();
  }

  logDragEvents(): void {
    const originalOnRowDragMove = this.onRowDragMove?.bind(this);
    const originalOnRowDragEnd = this.onRowDragEnd?.bind(this);
    
    this.onRowDragMove = (event: RowDragEvent) => {
      console.log('Row drag move:', {
        draggedRow: event.node.data,
        overRow: event.overNode?.data,
        direction: event.vDirection,
        y: event.y
      });
      
      originalOnRowDragMove?.(event);
    };
    
    this.onRowDragEnd = (event: RowDragEvent) => {
      console.log('Row drag end:', {
        draggedRow: event.node.data,
        finalPosition: event.overIndex
      });
      
      originalOnRowDragEnd?.(event);
    };
  }
}
```

## Best Practices

1. **Provide clear drag handles** with appropriate cursor styling
2. **Implement visual feedback** during drag operations
3. **Validate drop targets** to prevent invalid operations
4. **Use animations** to provide smooth user experience
5. **Optimize performance** with throttling and batching
6. **Save changes** automatically or provide clear save indicators
7. **Handle edge cases** like empty grids or filtered data
8. **Test across devices** including touch interfaces for mobile support