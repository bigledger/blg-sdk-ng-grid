# Column Moving

## Overview

Column moving allows users to reorder columns by dragging them to new positions. This feature provides flexibility in data presentation and allows users to customize the grid layout according to their preferences and workflow needs.

## Use Cases

- User-customizable column order
- Dynamic report layouts
- Workflow-specific data arrangements
- Responsive design adaptations
- Dashboard customization

## Basic Column Moving

### Enable Column Moving

```typescript
import { BlgGridComponent } from '@blg/grid';

@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [suppressMovableColumns]="false">
    </blg-grid>
  `
})
export class MovableColumnsComponent {
  columnDefs = [
    { 
      field: 'name', 
      headerName: 'Name',
      movable: true 
    },
    { 
      field: 'age', 
      headerName: 'Age',
      movable: true 
    },
    { 
      field: 'email', 
      headerName: 'Email',
      movable: true 
    },
    { 
      field: 'department', 
      headerName: 'Department',
      movable: false  // This column cannot be moved
    }
  ];
}
```

### Column Move Events

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (columnMoved)="onColumnMoved($event)"
      (dragStarted)="onDragStarted($event)"
      (dragStopped)="onDragStopped($event)">
    </blg-grid>
  `
})
export class ColumnMoveEventsComponent {
  onColumnMoved(event: ColumnMovedEvent): void {
    console.log('Column moved:', {
      column: event.column?.getColId(),
      fromIndex: event.fromIndex,
      toIndex: event.toIndex,
      finished: event.finished
    });

    // Save new column order
    if (event.finished) {
      this.saveColumnOrder();
    }
  }

  onDragStarted(event: DragStartedEvent): void {
    console.log('Drag started:', event);
    // Show visual feedback
    this.showMoveIndicators();
  }

  onDragStopped(event: DragStoppedEvent): void {
    console.log('Drag stopped:', event);
    // Hide visual feedback
    this.hideMoveIndicators();
  }

  private saveColumnOrder(): void {
    const columnOrder = this.columnApi.getColumnState().map(col => col.colId);
    localStorage.setItem('gridColumnOrder', JSON.stringify(columnOrder));
  }
}
```

## Advanced Column Moving

### Conditional Column Moving

```typescript
export class ConditionalMovingComponent {
  columnDefs = [
    {
      field: 'id',
      headerName: 'ID',
      movable: false, // Always fixed at the beginning
      lockPosition: true
    },
    {
      field: 'name',
      headerName: 'Name',
      movable: this.canMoveColumn('name')
    },
    {
      field: 'email',
      headerName: 'Email',
      movable: this.canMoveColumn('email')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      movable: false, // Always fixed at the end
      lockPosition: 'right'
    }
  ];

  private canMoveColumn(field: string): boolean {
    // Check user permissions or other conditions
    return this.userPermissions.canReorderColumns && 
           this.editableFields.includes(field);
  }

  // Dynamic movable state
  updateColumnMovability(field: string, movable: boolean): void {
    const columnDef = this.columnDefs.find(col => col.field === field);
    if (columnDef) {
      columnDef.movable = movable;
      this.gridApi.setColumnDefs(this.columnDefs);
    }
  }
}
```

### Programmatic Column Moving

```typescript
export class ProgrammaticMovingComponent {
  private columnApi!: ColumnApi;

  // Move column to specific position
  moveColumn(columnId: string, toIndex: number): void {
    this.columnApi.moveColumn(columnId, toIndex);
  }

  // Move column before another column
  moveColumnBefore(columnId: string, beforeColumnId: string): void {
    const columns = this.columnApi.getAllDisplayedColumns();
    const beforeIndex = columns.findIndex(col => col.getColId() === beforeColumnId);
    
    if (beforeIndex >= 0) {
      this.columnApi.moveColumn(columnId, beforeIndex);
    }
  }

  // Move column after another column
  moveColumnAfter(columnId: string, afterColumnId: string): void {
    const columns = this.columnApi.getAllDisplayedColumns();
    const afterIndex = columns.findIndex(col => col.getColId() === afterColumnId);
    
    if (afterIndex >= 0) {
      this.columnApi.moveColumn(columnId, afterIndex + 1);
    }
  }

  // Move multiple columns
  moveColumns(columnIds: string[], toIndex: number): void {
    columnIds.forEach((columnId, index) => {
      this.columnApi.moveColumn(columnId, toIndex + index);
    });
  }

  // Swap two columns
  swapColumns(columnId1: string, columnId2: string): void {
    const columns = this.columnApi.getAllDisplayedColumns();
    const index1 = columns.findIndex(col => col.getColId() === columnId1);
    const index2 = columns.findIndex(col => col.getColId() === columnId2);

    if (index1 >= 0 && index2 >= 0) {
      this.columnApi.moveColumn(columnId1, index2);
      this.columnApi.moveColumn(columnId2, index1);
    }
  }
}
```

### Column Groups and Moving

```typescript
export class ColumnGroupMovingComponent {
  columnDefs = [
    {
      headerName: 'Personal Info',
      movable: true,
      children: [
        { field: 'firstName', headerName: 'First Name', movable: true },
        { field: 'lastName', headerName: 'Last Name', movable: true },
        { field: 'age', headerName: 'Age', movable: true }
      ]
    },
    {
      headerName: 'Contact Info',
      movable: true,
      children: [
        { field: 'email', headerName: 'Email', movable: true },
        { field: 'phone', headerName: 'Phone', movable: true },
        { field: 'address', headerName: 'Address', movable: true }
      ]
    },
    {
      headerName: 'System Info',
      movable: false, // Group cannot be moved
      children: [
        { field: 'createdAt', headerName: 'Created', movable: false },
        { field: 'updatedAt', headerName: 'Updated', movable: false }
      ]
    }
  ];

  onColumnGroupMoved(event: any): void {
    console.log('Column group moved:', event);
    this.saveColumnGroupOrder();
  }

  private saveColumnGroupOrder(): void {
    const columnGroupState = this.columnApi.getColumnGroupState();
    localStorage.setItem('gridColumnGroupState', JSON.stringify(columnGroupState));
  }
}
```

## Column Moving Constraints

### Movement Restrictions

```typescript
export class MovingConstraintsComponent {
  columnDefs = [
    {
      field: 'id',
      headerName: 'ID',
      movable: false,
      lockPosition: true,
      suppressMovable: true
    },
    {
      field: 'name',
      headerName: 'Name',
      movable: true,
      // Cannot move before 'id' column
      moveConstraints: {
        minIndex: 1
      }
    },
    {
      field: 'email',
      headerName: 'Email',
      movable: true,
      // Can only move within certain range
      moveConstraints: {
        minIndex: 1,
        maxIndex: 3
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      movable: false,
      lockPosition: 'right',
      suppressMovable: true
    }
  ];

  // Custom move validation
  onColumnMoveRequest(event: any): boolean {
    const { column, fromIndex, toIndex } = event;
    
    // Prevent moving system columns
    if (column.getColId().startsWith('system_')) {
      return false;
    }
    
    // Prevent moving to first or last position
    if (toIndex === 0 || toIndex === this.columnDefs.length - 1) {
      return false;
    }
    
    return true;
  }
}
```

### Zone-Based Movement

```typescript
export class ZoneBasedMovementComponent {
  private zones = {
    fixed: ['id', 'actions'],
    personal: ['firstName', 'lastName', 'age'],
    contact: ['email', 'phone', 'address'],
    system: ['createdAt', 'updatedAt']
  };

  onColumnMoved(event: ColumnMovedEvent): void {
    const columnId = event.column?.getColId();
    const targetZone = this.getColumnZone(columnId);
    
    // Validate zone constraints
    if (!this.isValidZoneMove(columnId, event.toIndex)) {
      // Revert move
      this.columnApi.moveColumn(columnId, event.fromIndex);
      this.showZoneViolationMessage(columnId, targetZone);
    }
  }

  private getColumnZone(columnId: string): string {
    for (const [zone, columns] of Object.entries(this.zones)) {
      if (columns.includes(columnId)) {
        return zone;
      }
    }
    return 'unknown';
  }

  private isValidZoneMove(columnId: string, toIndex: number): boolean {
    const zone = this.getColumnZone(columnId);
    const targetColumn = this.getColumnAtIndex(toIndex);
    const targetZone = this.getColumnZone(targetColumn);
    
    // Allow movement within the same zone
    return zone === targetZone || zone === 'unknown';
  }
}
```

## Visual Feedback and UX

### Custom Move Indicators

```typescript
@Component({
  template: `
    <div class="grid-container" [class.dragging]="isDragging">
      <blg-grid 
        [rowData]="rowData"
        [columnDefs]="columnDefs"
        (dragStarted)="onDragStarted($event)"
        (dragStopped)="onDragStopped($event)">
      </blg-grid>
      
      <!-- Custom drop zones -->
      <div class="drop-zones" *ngIf="isDragging">
        <div 
          *ngFor="let zone of dropZones" 
          class="drop-zone"
          [style.left.px]="zone.left"
          [style.width.px]="zone.width">
          {{ zone.label }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grid-container {
      position: relative;
    }
    
    .grid-container.dragging {
      cursor: grabbing;
    }
    
    .drop-zones {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 40px;
      pointer-events: none;
      z-index: 1000;
    }
    
    .drop-zone {
      position: absolute;
      top: 0;
      height: 100%;
      background: rgba(0, 123, 255, 0.1);
      border: 2px dashed #007bff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #007bff;
    }
  `]
})
export class CustomMoveIndicatorsComponent {
  isDragging = false;
  dropZones: any[] = [];

  onDragStarted(event: DragStartedEvent): void {
    this.isDragging = true;
    this.calculateDropZones();
  }

  onDragStopped(event: DragStoppedEvent): void {
    this.isDragging = false;
    this.dropZones = [];
  }

  private calculateDropZones(): void {
    const columns = this.columnApi.getAllDisplayedColumns();
    this.dropZones = columns.map((column, index) => ({
      left: this.getColumnLeft(column),
      width: column.getActualWidth(),
      label: `Drop before ${column.getColId()}`,
      index
    }));
  }
}
```

### Move Animation

```typescript
export class MoveAnimationComponent {
  gridOptions = {
    suppressColumnMoveAnimation: false,
    animateRows: true
  };

  // Custom animation for column moves
  onColumnMoved(event: ColumnMovedEvent): void {
    if (event.finished) {
      this.animateColumnMove(event);
    }
  }

  private animateColumnMove(event: ColumnMovedEvent): void {
    const movedColumn = event.column;
    if (!movedColumn) return;

    // Add animation class
    const headerElement = this.getColumnHeaderElement(movedColumn.getColId());
    if (headerElement) {
      headerElement.classList.add('column-moved-animation');
      
      setTimeout(() => {
        headerElement.classList.remove('column-moved-animation');
      }, 500);
    }
  }

  private getColumnHeaderElement(columnId: string): HTMLElement | null {
    return document.querySelector(`[col-id="${columnId}"]`);
  }
}

// CSS for animations
/*
.column-moved-animation {
  animation: columnMoved 0.5s ease-in-out;
}

@keyframes columnMoved {
  0% {
    transform: scale(1);
    box-shadow: none;
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: none;
  }
}
*/
```

## Column Order Persistence

### Save and Restore Column Order

```typescript
export class ColumnOrderPersistence {
  private readonly COLUMN_ORDER_KEY = 'grid-column-order';
  private columnApi!: ColumnApi;

  ngOnInit(): void {
    this.loadColumnOrder();
  }

  onGridReady(params: any): void {
    this.columnApi = params.columnApi;
    setTimeout(() => this.loadColumnOrder(), 100);
  }

  onColumnMoved(event: ColumnMovedEvent): void {
    if (event.finished) {
      this.saveColumnOrder();
    }
  }

  private saveColumnOrder(): void {
    const columnState = this.columnApi.getColumnState();
    const columnOrder = {
      timestamp: Date.now(),
      order: columnState.map(col => ({
        colId: col.colId,
        index: col.sort?.index
      }))
    };
    
    localStorage.setItem(this.COLUMN_ORDER_KEY, JSON.stringify(columnOrder));
  }

  private loadColumnOrder(): void {
    const saved = localStorage.getItem(this.COLUMN_ORDER_KEY);
    if (saved && this.columnApi) {
      try {
        const columnOrder = JSON.parse(saved);
        
        // Apply saved order if not too old (30 days)
        if (Date.now() - columnOrder.timestamp < 30 * 24 * 60 * 60 * 1000) {
          this.applyColumnOrder(columnOrder.order);
        }
      } catch (error) {
        console.error('Failed to load column order:', error);
      }
    }
  }

  private applyColumnOrder(order: any[]): void {
    // Sort column order by saved index
    order.sort((a, b) => (a.index || 0) - (b.index || 0));
    
    // Apply the order
    order.forEach((item, index) => {
      this.columnApi.moveColumn(item.colId, index);
    });
  }

  resetColumnOrder(): void {
    localStorage.removeItem(this.COLUMN_ORDER_KEY);
    this.columnApi.resetColumnState();
  }
}
```

### User Preferences Integration

```typescript
export class UserPreferencesIntegration {
  constructor(
    private userPreferencesService: UserPreferencesService,
    private columnApi: ColumnApi
  ) {}

  async loadUserColumnOrder(): Promise<void> {
    try {
      const preferences = await this.userPreferencesService.getGridPreferences();
      if (preferences.columnOrder) {
        this.applyColumnOrder(preferences.columnOrder);
      }
    } catch (error) {
      console.error('Failed to load user column preferences:', error);
    }
  }

  async saveUserColumnOrder(): Promise<void> {
    try {
      const columnState = this.columnApi.getColumnState();
      const columnOrder = columnState.map(col => col.colId);
      
      await this.userPreferencesService.updateGridPreferences({
        columnOrder,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to save user column preferences:', error);
    }
  }

  onColumnMoved(event: ColumnMovedEvent): void {
    if (event.finished) {
      // Debounce save operation
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        this.saveUserColumnOrder();
      }, 1000);
    }
  }
}
```

## API Reference

### Grid Options

| Option | Type | Description |
|--------|------|-------------|
| `suppressMovableColumns` | boolean | Disable all column moving |
| `suppressColumnMoveAnimation` | boolean | Disable move animations |
| `suppressDragLeaveHidesColumns` | boolean | Keep columns visible during drag |

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `movable` | boolean | Allow column to be moved |
| `lockPosition` | boolean \| 'left' \| 'right' | Lock column position |
| `suppressMovable` | boolean | Suppress column moving |

### API Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `moveColumn()` | `columnId: string, toIndex: number` | Move column to position |
| `moveColumns()` | `columnIds: string[], toIndex: number` | Move multiple columns |
| `getColumnState()` | - | Get current column state |
| `setColumnState()` | `state: any[]` | Set column state |

### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `columnMoved` | Column position changed | ColumnMovedEvent |
| `dragStarted` | Column drag started | DragStartedEvent |
| `dragStopped` | Column drag stopped | DragStoppedEvent |

## Common Patterns

### Workflow-Specific Layouts

```typescript
export class WorkflowLayoutsComponent {
  private layouts = {
    overview: ['id', 'name', 'status', 'priority', 'assignee'],
    detailed: ['id', 'name', 'description', 'status', 'priority', 'assignee', 'dueDate', 'tags'],
    minimal: ['name', 'status', 'assignee']
  };

  switchLayout(layoutName: string): void {
    const layout = this.layouts[layoutName];
    if (layout) {
      this.applyLayout(layout);
    }
  }

  private applyLayout(columnOrder: string[]): void {
    // Hide all columns first
    this.columnApi.setColumnsVisible(
      this.columnApi.getAllColumns()?.map(col => col.getColId()) || [], 
      false
    );

    // Show and order specified columns
    this.columnApi.setColumnsVisible(columnOrder, true);
    
    columnOrder.forEach((columnId, index) => {
      this.columnApi.moveColumn(columnId, index);
    });
  }

  saveCurrentLayoutAs(name: string): void {
    const currentOrder = this.columnApi.getColumnState()
      .filter(col => !col.hide)
      .map(col => col.colId);
    
    this.layouts[name] = currentOrder;
    this.saveLayoutsToStorage();
  }
}
```

### Responsive Column Reordering

```typescript
export class ResponsiveReorderingComponent {
  private mobileOrder = ['name', 'status', 'actions'];
  private tabletOrder = ['name', 'status', 'assignee', 'dueDate', 'actions'];
  private desktopOrder = ['id', 'name', 'description', 'status', 'priority', 'assignee', 'dueDate', 'actions'];

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.adjustColumnOrderForScreenSize();
  }

  private adjustColumnOrderForScreenSize(): void {
    const width = window.innerWidth;
    let targetOrder: string[];

    if (width < 768) {
      targetOrder = this.mobileOrder;
    } else if (width < 1024) {
      targetOrder = this.tabletOrder;
    } else {
      targetOrder = this.desktopOrder;
    }

    this.applyColumnOrder(targetOrder);
  }

  private applyColumnOrder(order: string[]): void {
    // Hide columns not in the target order
    const allColumns = this.columnApi.getAllColumns()?.map(col => col.getColId()) || [];
    const columnsToHide = allColumns.filter(colId => !order.includes(colId));
    
    this.columnApi.setColumnsVisible(columnsToHide, false);
    this.columnApi.setColumnsVisible(order, true);
    
    // Apply the order
    order.forEach((columnId, index) => {
      this.columnApi.moveColumn(columnId, index);
    });
  }
}
```

## Troubleshooting

### Common Issues

1. **Columns not moving**: Check if `suppressMovableColumns` is false and individual columns have `movable: true`
2. **Move animations not working**: Ensure `suppressColumnMoveAnimation` is false
3. **Column order not persisting**: Verify that save/load logic is called at the right times
4. **Constraints not working**: Check move validation logic and constraint implementation

### Debugging Column Moving

```typescript
export class ColumnMoveDebugger {
  onColumnMoved(event: ColumnMovedEvent): void {
    console.group('Column Move Debug');
    console.log('Column:', event.column?.getColId());
    console.log('From Index:', event.fromIndex);
    console.log('To Index:', event.toIndex);
    console.log('Finished:', event.finished);
    console.log('Current Order:', this.getCurrentColumnOrder());
    console.groupEnd();
  }

  private getCurrentColumnOrder(): string[] {
    return this.columnApi.getAllDisplayedColumns()?.map(col => col.getColId()) || [];
  }

  debugColumnState(): void {
    const columnState = this.columnApi.getColumnState();
    console.table(columnState.map(col => ({
      colId: col.colId,
      width: col.width,
      hide: col.hide,
      pinned: col.pinned,
      movable: col.movable
    })));
  }
}
```

## Best Practices

1. **Provide visual feedback** during drag operations to guide users
2. **Save column order preferences** to enhance user experience
3. **Implement sensible constraints** to prevent invalid column arrangements
4. **Consider responsive behavior** for different screen sizes
5. **Use zone-based movement** for complex layouts with logical groupings
6. **Test drag and drop thoroughly** across different browsers and devices
7. **Provide reset functionality** to allow users to restore default order
8. **Consider accessibility** by providing keyboard alternatives for column reordering