# Immutable Data

## Overview

Immutable data support in BLG Grid allows you to work with immutable data structures while maintaining performance and providing efficient change detection. This approach ensures data integrity and enables better state management.

## Use Cases

- Redux/NgRx state management integration
- Functional programming approaches
- Change detection optimization
- Data integrity assurance
- Time-travel debugging

## Basic Immutable Data Setup

### Immutable Data Configuration

```typescript
@Component({
  template: `
    <ng-ui-lib 
      [rowData]="rowData$ | async"
      [columnDefs]="columnDefs"
      [getRowId]="getRowId"
      [immutableData]="true"
      (gridReady)="onGridReady($event)">
    </ng-ui-lib>
  `
})
export class ImmutableDataComponent {
  rowData$ = this.store.select(selectGridData);
  
  columnDefs = [
    { field: 'id', headerName: 'ID' },
    { field: 'name', headerName: 'Name' },
    { field: 'value', headerName: 'Value' }
  ];

  getRowId = (params: any) => params.data.id;

  constructor(private store: Store) {}

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }
}
```

### Immutable Updates

```typescript
export class ImmutableUpdateService {
  updateRow(id: string, changes: any): void {
    this.store.dispatch(updateRowAction({ id, changes }));
  }

  addRow(newRow: any): void {
    this.store.dispatch(addRowAction({ row: newRow }));
  }

  removeRow(id: string): void {
    this.store.dispatch(removeRowAction({ id }));
  }
}

// Redux/NgRx reducer example
export const gridDataReducer = createReducer(
  initialState,
  on(updateRowAction, (state, { id, changes }) => ({
    ...state,
    data: state.data.map(row => 
      row.id === id ? { ...row, ...changes } : row
    )
  })),
  on(addRowAction, (state, { row }) => ({
    ...state,
    data: [...state.data, row]
  })),
  on(removeRowAction, (state, { id }) => ({
    ...state,
    data: state.data.filter(row => row.id !== id)
  }))
);
```

## Performance Optimization

### Efficient Change Detection

```typescript
export class ImmutablePerformanceService {
  // Use row ID for efficient updates
  getRowId = (params: any) => params.data.id;

  // Optimize with immutable helpers
  updateDataImmutably(data: any[], id: string, changes: any): any[] {
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return data;

    return [
      ...data.slice(0, index),
      { ...data[index], ...changes },
      ...data.slice(index + 1)
    ];
  }

  // Batch immutable updates
  batchUpdateImmutable(data: any[], updates: Array<{id: string, changes: any}>): any[] {
    return data.map(item => {
      const update = updates.find(u => u.id === item.id);
      return update ? { ...item, ...update.changes } : item;
    });
  }
}
```

## Integration with State Management

### Redux Integration

```typescript
@Injectable()
export class GridStateService {
  constructor(private store: Store<AppState>) {}

  // Selectors
  selectGridData = createSelector(
    selectAppState,
    (state) => state.gridData
  );

  selectSelectedRows = createSelector(
    selectAppState,
    (state) => state.selectedRows
  );

  // Actions
  updateCell(rowId: string, field: string, value: any): void {
    this.store.dispatch(gridActions.updateCell({ rowId, field, value }));
  }

  selectRows(rowIds: string[]): void {
    this.store.dispatch(gridActions.selectRows({ rowIds }));
  }
}
```

## API Reference

### Grid Options
- `immutableData: boolean` - Enable immutable data mode
- `getRowId: function` - Function to provide unique row IDs

### Key Methods
- Use `getRowId` for efficient row identification
- Ensure data references change for updates
- Maintain object immutability in state management

## Best Practices

1. **Always provide getRowId** function for efficient updates
2. **Use proper immutable update patterns** to avoid reference issues
3. **Integrate with state management libraries** for consistency
4. **Monitor performance** with large immutable datasets
5. **Test change detection** to ensure updates are reflected