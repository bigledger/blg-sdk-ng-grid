import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { 
  GridEvent, 
  CellClickEvent, 
  RowSelectEvent, 
  ColumnSortEvent, 
  ColumnResizeEvent,
  PaginationEvent,
  CellEditEvent
} from '@blg-grid/core';
import { 
  AgGridEvents,
  AgGridEventListener,
  AgGridEventType,
  GridReadyEvent,
  RowClickedEvent,
  CellClickedEvent,
  SelectionChangedEvent,
  SortChangedEvent,
  FilterChangedEvent,
  PaginationChangedEvent,
  CellValueChangedEvent
} from './ag-events.interface';

/**
 * Event adapter that maps NgUiGrid events to ag-Grid compatible events
 */
@Injectable({
  providedIn: 'root'
})
export class EventAdapter {
  private eventSubject = new Subject<AgGridEvents>();
  private gridApi: any;
  private columnApi: any;
  private listeners = new Map<string, Set<Function>>();
  
  /**
   * Sets the grid and column API references
   */
  setApis(gridApi: any, columnApi: any): void {
    this.gridApi = gridApi;
    this.columnApi = columnApi;
  }
  
  /**
   * Adds an event listener for ag-Grid compatible events
   */
  addEventListener<T extends AgGridEvents>(
    eventType: T['type'], 
    listener: AgGridEventListener<T>
  ): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener);
  }
  
  /**
   * Removes an event listener
   */
  removeEventListener(eventType: string, listener: Function): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }
  
  /**
   * Removes all event listeners for a specific event type
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
  
  /**
   * Gets an observable for specific ag-Grid event types
   */
  getEventObservable<T extends AgGridEvents>(eventType: T['type']): Observable<T> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type === eventType),
      map(event => event as T)
    );
  }
  
  /**
   * Dispatches an ag-Grid compatible event
   */
  dispatchEvent(event: AgGridEvents): void {
    this.eventSubject.next(event);
    
    // Notify listeners
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      });
    }
  }
  
  /**
   * Converts NgUiGrid cell click event to ag-Grid format
   */
  convertCellClickEvent(ngEvent: CellClickEvent): CellClickedEvent {
    return {
      type: 'cellClicked',
      node: this.createRowNode(ngEvent.data.rowData, ngEvent.data.rowIndex),
      data: ngEvent.data.rowData,
      value: ngEvent.data.value,
      rowIndex: ngEvent.data.rowIndex,
      column: this.createColumn(ngEvent.data.columnId),
      colDef: this.createColDef(ngEvent.data.columnId),
      event: new MouseEvent('click'), // Synthetic event
      api: this.gridApi,
      columnApi: this.columnApi
    };
  }
  
  /**
   * Converts NgUiGrid row select event to ag-Grid format
   */
  convertRowSelectEvent(ngEvent: RowSelectEvent): SelectionChangedEvent {
    return {
      type: 'selectionChanged',
      api: this.gridApi,
      columnApi: this.columnApi
    };
  }
  
  /**
   * Converts NgUiGrid column sort event to ag-Grid format
   */
  convertColumnSortEvent(ngEvent: ColumnSortEvent): SortChangedEvent {
    return {
      type: 'sortChanged',
      api: this.gridApi,
      columnApi: this.columnApi
    };
  }
  
  /**
   * Converts NgUiGrid column resize event to ag-Grid format
   */
  convertColumnResizeEvent(ngEvent: ColumnResizeEvent): any {
    return {
      type: 'columnResized',
      column: this.createColumn(ngEvent.data.columnId),
      columns: [this.createColumn(ngEvent.data.columnId)],
      finished: true, // NgUiGrid doesn't track intermediate resize events
      api: this.gridApi,
      columnApi: this.columnApi,
      source: 'uiColumnResized'
    };
  }
  
  /**
   * Converts NgUiGrid pagination event to ag-Grid format
   */
  convertPaginationEvent(ngEvent: PaginationEvent): PaginationChangedEvent {
    return {
      type: 'paginationChanged',
      animate: false,
      keepRenderedRows: false,
      newData: false,
      newPage: true,
      api: this.gridApi,
      columnApi: this.columnApi
    };
  }
  
  /**
   * Converts NgUiGrid cell edit event to ag-Grid format
   */
  convertCellEditEvent(ngEvent: CellEditEvent): CellValueChangedEvent {
    return {
      type: 'cellValueChanged',
      node: this.createRowNode(ngEvent.data.rowData, ngEvent.data.rowIndex),
      data: ngEvent.data.rowData,
      oldValue: ngEvent.data.oldValue,
      newValue: ngEvent.data.newValue,
      rowIndex: ngEvent.data.rowIndex,
      column: this.createColumn(ngEvent.data.columnId),
      colDef: this.createColDef(ngEvent.data.columnId),
      api: this.gridApi,
      columnApi: this.columnApi
    };
  }
  
  /**
   * Handles NgUiGrid events and converts them to ag-Grid format
   */
  handleNgUiGridEvent(event: GridEvent): void {
    switch (event.type) {
      case 'cell-click':
        this.dispatchEvent(this.convertCellClickEvent(event as CellClickEvent));
        // Also dispatch row clicked event
        this.dispatchEvent(this.convertCellClickToRowClick(event as CellClickEvent));
        break;
        
      case 'row-select':
        this.dispatchEvent(this.convertRowSelectEvent(event as RowSelectEvent));
        break;
        
      case 'column-sort':
        this.dispatchEvent(this.convertColumnSortEvent(event as ColumnSortEvent));
        break;
        
      case 'column-resize':
        this.dispatchEvent(this.convertColumnResizeEvent(event as ColumnResizeEvent));
        break;
        
      case 'pagination':
        this.dispatchEvent(this.convertPaginationEvent(event as PaginationEvent));
        break;
        
      case 'cell-edit':
        this.dispatchEvent(this.convertCellEditEvent(event as CellEditEvent));
        break;
    }
  }
  
  /**
   * Fires the grid ready event
   */
  fireGridReadyEvent(): void {
    const event: GridReadyEvent = {
      type: 'gridReady',
      api: this.gridApi,
      columnApi: this.columnApi
    };
    
    this.dispatchEvent(event);
  }
  
  /**
   * Fires first data rendered event
   */
  fireFirstDataRenderedEvent(): void {
    const event = {
      type: 'firstDataRendered' as const,
      api: this.gridApi,
      columnApi: this.columnApi,
      firstColumn: null,
      firstRow: 0
    };
    
    this.dispatchEvent(event);
  }
  
  /**
   * Fires model updated event
   */
  fireModelUpdatedEvent(): void {
    const event = {
      type: 'modelUpdated' as const,
      api: this.gridApi,
      columnApi: this.columnApi,
      animate: false,
      keepRenderedRows: false,
      newData: true,
      newPage: false
    };
    
    this.dispatchEvent(event);
  }
  
  /**
   * Converts cell click to row click event
   */
  private convertCellClickToRowClick(cellEvent: CellClickEvent): RowClickedEvent {
    return {
      type: 'rowClicked',
      node: this.createRowNode(cellEvent.data.rowData, cellEvent.data.rowIndex),
      data: cellEvent.data.rowData,
      rowIndex: cellEvent.data.rowIndex,
      event: new MouseEvent('click'),
      api: this.gridApi,
      columnApi: this.columnApi
    };
  }
  
  /**
   * Creates a mock ag-Grid row node
   */
  private createRowNode(data: any, rowIndex: number): any {
    return {
      id: data.id || rowIndex.toString(),
      data: data,
      rowIndex: rowIndex,
      parent: null,
      level: 0,
      uiLevel: 0,
      group: false,
      selected: false,
      expanded: false,
      master: false,
      canFlower: false,
      flower: false,
      childrenAfterGroup: null,
      childrenAfterSort: null,
      childrenAfterFilter: null,
      allLeafChildren: null,
      childrenMapped: {},
      rowHeight: undefined,
      displayed: true,
      quickFilterAggregateText: '',
      leafGroup: false,
      footer: false,
      stub: false,
      sibling: null,
      key: null,
      childIndex: null,
      firstChild: false,
      lastChild: false,
      childrenCache: {},
      __objectId: rowIndex,
      __needsRefreshWhenVisible: false,
      
      // Row node methods that might be called
      setSelected: (selected: boolean) => { /* Implementation */ },
      isSelected: () => false,
      setExpanded: (expanded: boolean) => { /* Implementation */ },
      isExpandable: () => false,
      setRowHeight: (height: number) => { /* Implementation */ }
    };
  }
  
  /**
   * Creates a mock ag-Grid column object
   */
  private createColumn(columnId: string): any {
    return {
      colId: columnId,
      getId: () => columnId,
      getColDef: () => this.createColDef(columnId),
      getSort: () => null,
      isSorting: () => false,
      getSortIndex: () => null,
      isVisible: () => true,
      getWidth: () => 100,
      getActualWidth: () => 100,
      isResizable: () => true,
      isPinned: () => false,
      getLeft: () => 0,
      isMoving: () => false,
      isFilterActive: () => false,
      getDefinition: () => this.createColDef(columnId)
    };
  }
  
  /**
   * Creates a mock ag-Grid column definition
   */
  private createColDef(columnId: string): any {
    return {
      colId: columnId,
      field: columnId,
      headerName: columnId,
      width: 100,
      resizable: true,
      sortable: true,
      filter: true
    };
  }
  
  /**
   * Maps ag-Grid event types to NgUiGrid event types
   */
  getEventTypeMapping(): Map<AgGridEventType, string[]> {
    return new Map([
      ['gridReady', ['grid-ready']],
      ['firstDataRendered', ['first-data-rendered']],
      ['modelUpdated', ['model-updated']],
      ['rowClicked', ['cell-click']], // NgUiGrid doesn't have separate row click
      ['cellClicked', ['cell-click']],
      ['rowSelected', ['row-select']],
      ['selectionChanged', ['row-select']],
      ['cellValueChanged', ['cell-edit']],
      ['sortChanged', ['column-sort']],
      ['filterChanged', ['filter-changed']],
      ['columnResized', ['column-resize']],
      ['paginationChanged', ['pagination']]
    ]);
  }
  
  /**
   * Gets supported ag-Grid event types
   */
  getSupportedEventTypes(): AgGridEventType[] {
    return [
      'gridReady',
      'gridSizeChanged',
      'firstDataRendered',
      'modelUpdated',
      'rowClicked',
      'rowDoubleClicked',
      'rowSelected',
      'selectionChanged',
      'cellClicked',
      'cellDoubleClicked',
      'cellValueChanged',
      'cellEditingStarted',
      'cellEditingStopped',
      'columnResized',
      'columnMoved',
      'columnVisible',
      'columnPinned',
      'sortChanged',
      'filterChanged',
      'paginationChanged'
    ];
  }
  
  /**
   * Gets unsupported ag-Grid event types with alternatives
   */
  getUnsupportedEventTypes(): { [eventType: string]: string } {
    return {
      'chartCreated': 'Chart features not supported',
      'chartRangeSelectionChanged': 'Chart features not supported',
      'chartOptionsChanged': 'Chart features not supported',
      'chartDestroyed': 'Chart features not supported',
      'rangeSelectionChanged': 'Range selection not supported',
      'cutStart': 'Clipboard operations limited',
      'cutEnd': 'Clipboard operations limited',
      'pasteStart': 'Clipboard operations limited',
      'pasteEnd': 'Clipboard operations limited',
      'dragStarted': 'Row dragging not supported',
      'dragStopped': 'Row dragging not supported',
      'rowDragEnter': 'Row dragging not supported',
      'rowDragMove': 'Row dragging not supported',
      'rowDragLeave': 'Row dragging not supported',
      'rowDragEnd': 'Row dragging not supported',
      'toolPanelVisibleChanged': 'Tool panel not supported',
      'toolPanelSizeChanged': 'Tool panel not supported'
    };
  }
  
  /**
   * Cleanup method to remove all listeners and subscriptions
   */
  destroy(): void {
    this.listeners.clear();
    this.eventSubject.complete();
  }
}