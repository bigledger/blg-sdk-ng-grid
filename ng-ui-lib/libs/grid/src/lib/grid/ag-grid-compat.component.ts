import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ColDef, 
  AgGridOptions, 
  GridApi, 
  ColumnApi,
  GridReadyEvent,
  RowClickedEvent,
  CellClickedEvent,
  SelectionChangedEvent,
  SortChangedEvent,
  FilterChangedEvent,
  colDefToColumnDefinition,
  columnDefinitionToColDef
} from '@ng-ui/core';
import { GridApiService, ColumnApiService, CellRendererService } from '@ng-ui/core';
import { NgUiGridComponent } from './grid';

/**
 * ag-Grid compatible wrapper component for NgUiGridComponent
 * 
 * This component provides full ag-Grid API compatibility while internally
 * using the BigLedger Grid implementation. It supports:
 * - ag-Grid column definitions (ColDef)
 * - ag-Grid options (AgGridOptions)
 * - ag-Grid API methods (GridApi, ColumnApi)
 * - ag-Grid events
 * - ag-Grid cell renderers and editors
 * 
 * Usage:
 * <ag-grid-angular 
 *   [rowData]="rowData" 
 *   [columnDefs]="columnDefs"
 *   [gridOptions]="gridOptions"
 *   (gridReady)="onGridReady($event)"
 *   (rowClicked)="onRowClicked($event)">
 * </ag-grid-angular>
 */
@Component({
  selector: 'ag-grid-angular',
  standalone: true,
  imports: [CommonModule, NgUiGridComponent],
  template: `
    <ngui-grid
      #gridComponent
      [data]="internalRowData()"
      [columns]="internalColumnDefs()"
      [config]="internalGridConfig()"
      (ngUiGridEvent)="onGridEvent($event)"
      (ngUiGridCellClick)="onCellClick($event)"
      (ngUiGridRowSelect)="onRowSelect($event)"
      (ngUiGridColumnSort)="onColumnSort($event)"
      (ngUiGridColumnResize)="onColumnResize($event)">
    </ngui-grid>
  `,
  styleUrl: './grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GridApiService, ColumnApiService]
})
export class AgGridAngularComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('gridComponent', { static: true }) gridComponent!: NgUiGridComponent;
  
  private gridApiService = inject(GridApiService);
  private columnApiService = inject(ColumnApiService);
  private cellRendererService = inject(CellRendererService);
  
  // ag-Grid compatible inputs
  @Input() set rowData(value: any[] | undefined) {
    this._rowData.set(value || []);
    this.gridApiService.setRowData(value || []);
  }
  
  @Input() set columnDefs(value: ColDef[] | undefined) {
    this._columnDefs.set(value || []);
    this.gridApiService.setColumnDefs(value || []);
  }
  
  @Input() set defaultColDef(value: ColDef | undefined) {
    this._defaultColDef.set(value || {});
  }
  
  @Input() set gridOptions(value: AgGridOptions | undefined) {
    this._gridOptions.set(value || {});
  }
  
  @Input() set pagination(value: boolean | undefined) {
    this._pagination.set(value || false);
  }
  
  @Input() set paginationPageSize(value: number | undefined) {
    this._paginationPageSize.set(value || 25);
  }
  
  @Input() set rowSelection(value: 'single' | 'multiple' | undefined) {
    this._rowSelection.set(value || 'single');
  }
  
  @Input() set enableSorting(value: boolean | undefined) {
    this._enableSorting.set(value !== false);
  }
  
  @Input() set enableFilter(value: boolean | undefined) {
    this._enableFilter.set(value !== false);
  }
  
  // ag-Grid compatible outputs
  @Output() gridReady = new EventEmitter<GridReadyEvent>();
  @Output() rowClicked = new EventEmitter<RowClickedEvent>();
  @Output() cellClicked = new EventEmitter<CellClickedEvent>();
  @Output() selectionChanged = new EventEmitter<SelectionChangedEvent>();
  @Output() sortChanged = new EventEmitter<SortChangedEvent>();
  @Output() filterChanged = new EventEmitter<FilterChangedEvent>();
  
  // Internal signals
  private _rowData = signal<any[]>([]);
  private _columnDefs = signal<ColDef[]>([]);
  private _defaultColDef = signal<ColDef>({});
  private _gridOptions = signal<AgGridOptions>({});
  private _pagination = signal<boolean>(false);
  private _paginationPageSize = signal<number>(25);
  private _rowSelection = signal<'single' | 'multiple'>('single');
  private _enableSorting = signal<boolean>(true);
  private _enableFilter = signal<boolean>(true);
  
  // ag-Grid compatible API
  api!: GridApi;
  columnApi!: ColumnApi;
  
  // Computed internal data for NgUiGrid
  readonly internalRowData = computed(() => this._rowData());
  
  readonly internalColumnDefs = computed(() => {
    const colDefs = this._columnDefs();
    const defaultColDef = this._defaultColDef();
    
    return colDefs.map(colDef => {
      // Merge with default column definition
      const mergedColDef = { ...defaultColDef, ...colDef };
      return colDefToColumnDefinition(mergedColDef);
    });
  });
  
  readonly internalGridConfig = computed(() => {
    const options = this._gridOptions();
    return {
      totalRows: this._rowData().length,
      rowHeight: options.rowHeight || 40,
      virtualScrolling: true,
      sortable: this._enableSorting() && (options.sortable !== false),
      filterable: this._enableFilter() && (options.filterable !== false),
      selectable: true,
      selectionMode: this._rowSelection(),
      resizable: options.resizable !== false,
      reorderable: true,
      pagination: this._pagination(),
      paginationConfig: this._pagination() ? {
        pageSize: this._paginationPageSize(),
        showPageSizeSelector: true,
        showPageInfo: true,
        maxPageButtons: 7
      } : undefined
    };
  });
  
  ngOnInit(): void {
    // Initialize APIs
    this.api = this.gridApiService;
    this.columnApi = this.columnApiService;
  }
  
  ngAfterViewInit(): void {
    // Emit grid ready event
    setTimeout(() => {
      const gridReadyEvent: GridReadyEvent = {
        type: 'gridReady',
        api: this.api,
        columnApi: this.columnApi
      };
      this.gridReady.emit(gridReadyEvent);
    }, 0);
  }
  
  ngOnDestroy(): void {
    // Cleanup if needed
  }
  
  /**
   * Handle internal grid events and convert to ag-Grid events
   */
  onGridEvent(event: any): void {
    // Convert internal events to ag-Grid format
    switch (event.type) {
      case 'row-select':
        this.selectionChanged.emit({
          type: 'selectionChanged',
          api: this.api,
          columnApi: this.columnApi
        });
        break;
      case 'column-sort':
        this.sortChanged.emit({
          type: 'sortChanged',
          api: this.api,
          columnApi: this.columnApi
        });
        break;
      case 'filter':
        this.filterChanged.emit({
          type: 'filterChanged',
          api: this.api,
          columnApi: this.columnApi
        });
        break;
    }
  }
  
  /**
   * Handle cell click events
   */
  onCellClick(event: any): void {
    const column = this.internalColumnDefs().find(col => col.id === event.data.columnId);
    if (column) {
      const cellClickedEvent: CellClickedEvent = {
        type: 'cellClicked',
        rowIndex: event.data.rowIndex,
        rowPinned: null,
        column: column,
        colDef: columnDefinitionToColDef(column),
        value: event.data.value,
        data: event.data.rowData,
        node: { data: event.data.rowData, rowIndex: event.data.rowIndex },
        context: {},
        event: event as MouseEvent,
        api: this.api,
        columnApi: this.columnApi
      };
      
      this.cellClicked.emit(cellClickedEvent);
    }
  }
  
  /**
   * Handle row select events
   */
  onRowSelect(event: any): void {
    const rowClickedEvent: RowClickedEvent = {
      type: 'rowClicked',
      node: { data: event.data.rowData, rowIndex: event.data.rowIndex },
      data: event.data.rowData,
      rowIndex: event.data.rowIndex,
      rowPinned: null,
      context: {},
      event: event as MouseEvent,
      api: this.api,
      columnApi: this.columnApi
    };
    
    this.rowClicked.emit(rowClickedEvent);
  }
  
  /**
   * Handle column sort events
   */
  onColumnSort(event: any): void {
    this.sortChanged.emit({
      type: 'sortChanged',
      api: this.api,
      columnApi: this.columnApi
    });
  }
  
  /**
   * Handle column resize events
   */
  onColumnResize(event: any): void {
    // Column resize handled internally
  }
  
  // Additional ag-Grid compatible methods that can be called directly
  
  /**
   * Set row data (ag-Grid API method)
   */
  setRowData(data: any[]): void {
    this.rowData = data;
  }
  
  /**
   * Set column definitions (ag-Grid API method)
   */
  setColumnDefs(colDefs: ColDef[]): void {
    this.columnDefs = colDefs;
  }
  
  /**
   * Get selected rows (ag-Grid API method)
   */
  getSelectedRows(): any[] {
    return this.api.getSelectedRows();
  }
  
  /**
   * Select all rows (ag-Grid API method)
   */
  selectAll(): void {
    this.api.selectAll();
  }
  
  /**
   * Deselect all rows (ag-Grid API method)
   */
  deselectAll(): void {
    this.api.deselectAll();
  }
  
  /**
   * Size columns to fit (ag-Grid API method)
   */
  sizeColumnsToFit(): void {
    this.api.sizeColumnsToFit();
  }
  
  /**
   * Auto size columns (ag-Grid API method)
   */
  autoSizeColumns(keys: string[], skipHeader?: boolean): void {
    this.api.autoSizeColumns(keys, skipHeader);
  }
  
  /**
   * Export data as CSV (ag-Grid API method)
   */
  exportDataAsCsv(params?: any): void {
    this.api.exportDataAsCsv(params);
  }
  
  /**
   * Export data as Excel (ag-Grid API method)
   */
  exportDataAsExcel(params?: any): void {
    this.api.exportDataAsExcel(params);
  }
  
  /**
   * Set filter model (ag-Grid API method)
   */
  setFilterModel(model: any): void {
    this.api.setFilterModel(model);
  }
  
  /**
   * Get filter model (ag-Grid API method)
   */
  getFilterModel(): any {
    return this.api.getFilterModel();
  }
  
  /**
   * Set sort model (ag-Grid API method)
   */
  setSortModel(model: any[]): void {
    this.api.setSortModel(model);
  }
  
  /**
   * Get sort model (ag-Grid API method)
   */
  getSortModel(): any[] {
    return this.api.getSortModel();
  }
  
  /**
   * Refresh cells (ag-Grid API method)
   */
  refreshCells(params?: any): void {
    this.api.refreshCells(params);
  }
  
  /**
   * Get column state (ag-Grid API method)
   */
  getColumnState(): any[] {
    return this.columnApi.getColumnState();
  }
  
  /**
   * Set column state (ag-Grid API method)
   */
  setColumnState(columnState: any[]): void {
    this.columnApi.setColumnState(columnState);
  }
}