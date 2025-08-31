export interface GridEvent<T = any> {
  /**
   * Event type
   */
  type: string;
  
  /**
   * Event data
   */
  data?: T;
  
  /**
   * Source of the event
   */
  source?: string;
  
  /**
   * Event timestamp
   */
  timestamp?: Date;
}

export interface CellClickEvent extends GridEvent {
  type: 'cell-click';
  data: {
    rowIndex: number;
    columnId: string;
    value: any;
    rowData: any;
  };
}

export interface RowSelectEvent extends GridEvent {
  type: 'row-select';
  data: {
    rowIndex: number;
    rowData: any;
    selected: boolean;
  };
}

export interface ColumnSortEvent extends GridEvent {
  type: 'column-sort';
  data: {
    columnId: string;
    direction: 'asc' | 'desc' | null;
    sortState?: { columnId: string; direction: 'asc' | 'desc'; order: number }[] | null;
  };
}

export interface ColumnResizeEvent extends GridEvent {
  type: 'column-resize';
  data: {
    columnId: string;
    width: number;
    oldWidth: number;
  };
}

export interface PaginationEvent extends GridEvent {
  type: 'pagination';
  data: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
  };
}

export interface CellEditEvent extends GridEvent {
  type: 'cell-edit';
  data: {
    rowIndex: number;
    columnId: string;
    oldValue: any;
    newValue: any;
    rowData: any;
  };
}

export type GridEventType = CellClickEvent | RowSelectEvent | ColumnSortEvent | ColumnResizeEvent | PaginationEvent | CellEditEvent;