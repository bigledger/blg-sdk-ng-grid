import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
  signal,
  computed,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkVirtualScrollViewport, CdkScrollableModule, ScrollingModule } from '@angular/cdk/scrolling';
import { CdkDragDrop, CdkDropList, CdkDrag, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { 
  ColumnDefinition, 
  GridConfig, 
  GridEventType, 
  CellClickEvent, 
  RowSelectEvent, 
  ColumnSortEvent, 
  ColumnResizeEvent, 
  PaginationEvent, 
  CellEditEvent,
  GroupedRow,
  AggregationConfig,
  ExportOptions
} from '@blg/core';
import { GridStateService, GroupingService, ExportService } from '@blg/core';
import { ExportToolbarComponent } from '../components/export-toolbar.component';
import { GroupingToolbarComponent } from '../components/grouping-toolbar.component';

/**
 * Main Grid Component with virtual scrolling, sorting, filtering, and selection capabilities
 * 
 * Features:
 * - Virtual scrolling for handling 100k+ rows efficiently
 * - Column-based sorting with multi-column support
 * - Row selection (single/multiple with checkbox support)
 * - Column resizing and reordering via drag & drop
 * - Keyboard navigation with arrow keys, tab, and enter
 * - Full ARIA accessibility support
 * - Signal-based reactive data binding
 * - Comprehensive event system for user interactions
 */
@Component({
  selector: 'blg-grid',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    CdkScrollableModule,
    DragDropModule,
    CdkVirtualScrollViewport,
    CdkDropList,
    CdkDrag,
    ExportToolbarComponent,
    GroupingToolbarComponent
  ],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'blg-grid',
    'role': 'grid',
    'tabindex': '0',
    '[attr.aria-label]': '"Data Grid"',
    '[attr.aria-rowcount]': 'gridData().length',
    '[attr.aria-colcount]': 'visibleColumns().length'
  }
})
export class Grid implements OnInit, OnDestroy, AfterViewInit {
  readonly gridState = inject(GridStateService);
  readonly groupingService = inject(GroupingService);
  readonly exportService = inject(ExportService);
  
  // Make Object available in template
  readonly Object = Object;
  
  /**
   * Grid data - array of row objects
   */
  @Input() set data(value: any[]) {
    this._data.set(value || []);
  }
  
  /**
   * Column definitions for the grid
   */
  @Input() set columns(value: ColumnDefinition[]) {
    this._columns.set(value || []);
    this.gridState.updateColumns(value || []);
  }
  
  /**
   * Grid configuration options
   */
  @Input() set config(value: GridConfig) {
    this._config.set({ ...this.defaultConfig, ...value });
    this.gridState.updateConfig({ ...this.defaultConfig, ...value });
  }
  
  /**
   * Event emitter for all grid events
   */
  @Output() gridEvent = new EventEmitter<GridEventType>();
  
  /**
   * Event emitter specifically for cell clicks
   */
  @Output() cellClick = new EventEmitter<CellClickEvent>();
  
  /**
   * Event emitter specifically for row selection changes
   */
  @Output() rowSelect = new EventEmitter<RowSelectEvent>();
  
  /**
   * Event emitter specifically for column sorting
   */
  @Output() columnSort = new EventEmitter<ColumnSortEvent>();
  
  /**
   * Event emitter specifically for column resizing
   */
  @Output() columnResize = new EventEmitter<ColumnResizeEvent>();

  // ViewChild references
  @ViewChild(CdkVirtualScrollViewport, { static: true }) viewport!: CdkVirtualScrollViewport;
  @ViewChild('gridContainer', { static: true }) gridContainer!: ElementRef<HTMLDivElement>;

  // Internal signals for reactive data management
  private _data = signal<any[]>([]);
  private _columns = signal<ColumnDefinition[]>([]);
  private _config = signal<GridConfig>({});
  
  // Keyboard navigation state
  readonly focusedCell = signal<{ row: number, col: number } | null>(null);
  
  // Column resizing state
  private resizeState = signal<{ columnId: string, startX: number, startWidth: number } | null>(null);
  
  // Cell editing state
  readonly editingCell = signal<{ rowIndex: number, columnId: string } | null>(null);
  readonly editValue = signal<any>(null);
  readonly originalEditValue = signal<any>(null);

  // Default configuration
  private defaultConfig: GridConfig = {
    totalRows: 0,
    rowHeight: 40,
    virtualScrolling: true,
    sortable: true,
    filterable: true,
    selectable: true,
    selectionMode: 'multiple',
    resizable: true,
    reorderable: true,
    showFooter: false
  };

  // Computed signals for reactive UI updates (avoid naming conflicts with @Input setters)
  readonly gridData = computed(() => this.processedData());
  readonly gridColumns = computed(() => this._columns());
  readonly gridConfig = computed(() => this._config());
  readonly visibleColumns = computed(() => 
    this._columns().filter(col => col.visible !== false)
  );
  readonly selectedRows = computed(() => this.gridState.selectedRows());
  readonly sortState = computed(() => this.gridState.sortState());
  readonly filterState = computed(() => this.gridState.filterState());
  readonly paginationState = computed(() => this.gridState.paginationState());
  
  // Grouping computed signals
  readonly groupingState = computed(() => this.groupingService.groupingState());
  readonly isGrouped = computed(() => this.groupingService.isGrouped());
  readonly groupedRows = computed(() => {
    if (this.isGrouped()) {
      return this.groupingService.groupData(this.processedFlatData(), this._columns());
    }
    return [];
  });
  
  // Pagination computed properties
  readonly currentPage = computed(() => this.paginationState().currentPage || 0);
  readonly pageSize = computed(() => this.paginationState().pageSize || 25);
  readonly totalPages = computed(() => {
    const totalItems = this.getTotalItemsForPagination();
    return Math.ceil(totalItems / this.pageSize());
  });

  /**
   * Processed flat data (without grouping) with sorting and filtering applied
   */
  private processedFlatData = computed(() => {
    let result = [...this._data()];
    
    // Apply filtering
    const filters = this.filterState();
    if (Object.keys(filters).length > 0) {
      result = this.applyFilters(result, filters);
    }
    
    // Apply sorting
    const sort = this.sortState();
    if (sort) {
      result = this.applySorting(result, sort);
    }
    
    return result;
  });

  /**
   * Processed data with grouping, sorting, filtering, and pagination applied
   */
  private processedData = computed(() => {
    let result: any[] = [];
    
    if (this.isGrouped()) {
      // Use grouped data
      const grouped = this.groupedRows();
      result = grouped.map(row => row.type === 'group' ? row.group : row.data).filter(item => item);
    } else {
      // Use flat data
      result = this.processedFlatData();
    }
    
    // Update total items for pagination
    if (this._config().pagination) {
      this.gridState.setTotalItems(result.length);
    }
    
    // Apply pagination (client-side only)
    if (this._config().pagination && this.paginationState().mode === 'client' && !this.isGrouped()) {
      const startIndex = this.currentPage() * this.pageSize();
      const endIndex = startIndex + this.pageSize();
      result = result.slice(startIndex, endIndex);
    }
    
    return result;
  });

  /**
   * Virtual scroll item size for performance optimization
   */
  readonly itemSize = computed(() => this._config().rowHeight || 40);

  constructor() {
    // Effect to update total rows when data changes
    effect(() => {
      const dataLength = this._data().length;
      this._config.update(config => ({ ...config, totalRows: dataLength }));
    });
  }

  ngOnInit(): void {
    // Initialize grid state
    this.setupKeyboardNavigation();
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.onResizeEnd);
  }
  
  ngAfterViewInit(): void {
    // Any initialization that requires view to be ready
  }

  /**
   * Handle keyboard navigation within the grid
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // If we're in edit mode, don't handle navigation keys
    if (this.editingCell()) {
      return;
    }
    
    if (!this.focusedCell()) {
      return;
    }

    const { row, col } = this.focusedCell()!;
    const maxRow = this.gridData().length - 1;
    const maxCol = this.visibleColumns().length - 1;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (row > 0) {
          this.setFocusedCell(row - 1, col);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (row < maxRow) {
          this.setFocusedCell(row + 1, col);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (col > 0) {
          this.setFocusedCell(row, col - 1);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (col < maxCol) {
          this.setFocusedCell(row, col + 1);
        }
        break;
      case 'Enter':
        event.preventDefault();
        const currentColumn = this.visibleColumns()[col];
        if (currentColumn && currentColumn.cellEditor !== false) {
          const currentValue = this.getCellValue(this.gridData()[row], currentColumn);
          this.startEdit(row, currentColumn.id, currentValue);
        } else if (this._config().selectable) {
          this.toggleRowSelection(row);
        }
        break;
      case ' ':
        event.preventDefault();
        if (this._config().selectable) {
          this.toggleRowSelection(row);
        }
        break;
      case 'F2':
        event.preventDefault();
        const editColumn = this.visibleColumns()[col];
        if (editColumn && editColumn.cellEditor !== false) {
          const editValue = this.getCellValue(this.gridData()[row], editColumn);
          this.startEdit(row, editColumn.id, editValue);
        }
        break;
      case 'Home':
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
          this.setFocusedCell(0, 0);
        } else {
          this.setFocusedCell(row, 0);
        }
        break;
      case 'End':
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
          this.setFocusedCell(maxRow, maxCol);
        } else {
          this.setFocusedCell(row, maxCol);
        }
        break;
      case 'PageUp':
        event.preventDefault();
        const pageUpRow = Math.max(0, row - 10);
        this.setFocusedCell(pageUpRow, col);
        break;
      case 'PageDown':
        event.preventDefault();
        const pageDownRow = Math.min(maxRow, row + 10);
        this.setFocusedCell(pageDownRow, col);
        break;
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        const delColumn = this.visibleColumns()[col];
        if (delColumn && delColumn.cellEditor !== false) {
          this.startEdit(row, delColumn.id, '');
        }
        break;
    }
  }

  /**
   * Handle cell click events
   */
  onCellClick(rowIndex: number, columnId: string, value: any, rowData: any, _event: MouseEvent): void {
    // Set focus on the clicked cell
    const colIndex = this.visibleColumns().findIndex(col => col.id === columnId);
    this.setFocusedCell(rowIndex, colIndex);

    // Create and emit cell click event
    const cellClickEvent: CellClickEvent = {
      type: 'cell-click',
      data: { rowIndex, columnId, value, rowData },
      timestamp: new Date()
    };
    
    this.cellClick.emit(cellClickEvent);
    this.gridEvent.emit(cellClickEvent);
  }

  /**
   * Handle row selection toggle
   */
  toggleRowSelection(rowIndex: number): void {
    const rowData = this.gridData()[rowIndex];
    const wasSelected = this.selectedRows().has(rowIndex);
    
    this.gridState.toggleRowSelection(rowIndex);
    
    // Create and emit row select event
    const rowSelectEvent: RowSelectEvent = {
      type: 'row-select',
      data: {
        rowIndex,
        rowData,
        selected: !wasSelected
      },
      timestamp: new Date()
    };
    
    this.rowSelect.emit(rowSelectEvent);
    this.gridEvent.emit(rowSelectEvent);
  }

  /**
   * Handle column header click for sorting
   */
  onColumnHeaderClick(column: ColumnDefinition, event: MouseEvent): void {
    if (!column.sortable && !this._config().sortable) {
      return;
    }

    // Check for multi-sort (Ctrl/Cmd + click)
    const multiSort = event.ctrlKey || event.metaKey;
    
    // Determine next sort direction
    const currentSort = this.getSortForColumn(column.id);
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (currentSort) {
      direction = currentSort.direction === 'asc' ? 'desc' : null;
    }
    
    this.gridState.updateSort(column.id, direction, multiSort);
    
    // Create and emit column sort event
    const columnSortEvent: ColumnSortEvent = {
      type: 'column-sort',
      data: {
        columnId: column.id,
        direction,
        sortState: this.sortState()
      },
      timestamp: new Date()
    };
    
    this.columnSort.emit(columnSortEvent);
    this.gridEvent.emit(columnSortEvent);
  }

  /**
   * Handle column resizing start
   */
  onResizeStart(column: ColumnDefinition, event: MouseEvent): void {
    if (!column.resizable && !this._config().resizable) {
      return;
    }

    event.preventDefault();
    
    const startX = event.clientX;
    const startWidth = column.width || 150;
    
    this.resizeState.set({
      columnId: column.id,
      startX,
      startWidth
    });

    // Add global mouse event listeners
    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  /**
   * Handle column resizing
   */
  private onResize = (event: MouseEvent): void => {
    const resize = this.resizeState();
    if (!resize) return;

    const deltaX = event.clientX - resize.startX;
    const newWidth = Math.max(50, resize.startWidth + deltaX);
    
    this.gridState.updateColumnWidth(resize.columnId, newWidth);
  };

  /**
   * Handle column resizing end
   */
  private onResizeEnd = (event: MouseEvent): void => {
    const resize = this.resizeState();
    if (!resize) return;

    // Remove global event listeners
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.onResizeEnd);

    // Calculate final width
    const deltaX = event.clientX - resize.startX;
    const newWidth = Math.max(50, resize.startWidth + deltaX);
    
    // Create and emit column resize event
    const columnResizeEvent: ColumnResizeEvent = {
      type: 'column-resize',
      data: {
        columnId: resize.columnId,
        width: newWidth,
        oldWidth: resize.startWidth
      },
      timestamp: new Date()
    };
    
    this.columnResize.emit(columnResizeEvent);
    this.gridEvent.emit(columnResizeEvent);
    
    this.resizeState.set(null);
  };

  /**
   * Handle column reordering
   */
  onColumnDrop(event: CdkDragDrop<ColumnDefinition[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      const columns = [...this._columns()];
      moveItemInArray(columns, event.previousIndex, event.currentIndex);
      this._columns.set(columns);
      this.gridState.updateColumns(columns);
    }
  }

  /**
   * Get cell value for display
   */
  getCellValue(rowData: any, column: ColumnDefinition): any {
    return rowData[column.field] ?? '';
  }

  /**
   * Check if a row is selected
   */
  isRowSelected(rowIndex: number): boolean {
    return this.selectedRows().has(rowIndex);
  }

  /**
   * Check if a cell is focused
   */
  isCellFocused(rowIndex: number, colIndex: number): boolean {
    const focused = this.focusedCell();
    return focused ? focused.row === rowIndex && focused.col === colIndex : false;
  }

  /**
   * Get sort for a specific column
   */
  getSortForColumn(columnId: string): { columnId: string; direction: 'asc' | 'desc'; order: number } | null {
    const sorts = this.sortState();
    return sorts ? sorts.find(sort => sort.columnId === columnId) || null : null;
  }
  
  /**
   * Get sort direction for a column
   */
  getSortDirection(columnId: string): 'asc' | 'desc' | null {
    const sort = this.getSortForColumn(columnId);
    return sort ? sort.direction : null;
  }
  
  /**
   * Get sort order for a column (for multi-column sorting)
   */
  getSortOrder(columnId: string): number | null {
    const sort = this.getSortForColumn(columnId);
    return sort ? sort.order + 1 : null; // +1 to make it 1-based for display
  }

  /**
   * Get ARIA sort attribute for column header
   */
  getAriaSortAttribute(columnId: string): string {
    const direction = this.getSortDirection(columnId);
    switch (direction) {
      case 'asc': return 'ascending';
      case 'desc': return 'descending';
      default: return 'none';
    }
  }

  /**
   * Set focused cell and scroll into view if needed
   */
  private setFocusedCell(row: number, col: number): void {
    this.focusedCell.set({ row, col });
    
    // Scroll to the focused row if using virtual scrolling
    if (this._config().virtualScrolling && this.viewport) {
      this.viewport.scrollToIndex(row);
    }
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    // Set initial focus if there's data
    if (this.gridData().length > 0 && this.visibleColumns().length > 0) {
      this.setFocusedCell(0, 0);
    }
  }

  /**
   * Apply filters to data
   */
  private applyFilters(data: any[], filters: Record<string, any>): any[] {
    return data.filter(row => {
      return Object.entries(filters).every(([columnId, filterValue]) => {
        if (!filterValue || filterValue.toString().trim() === '') return true;
        
        const column = this._columns().find(col => col.id === columnId);
        if (!column) return true;
        
        const cellValue = row[column.field];
        const filterStr = String(filterValue).toLowerCase().trim();
        
        // Handle different data types with enhanced filtering
        switch (column.type) {
          case 'string':
            return String(cellValue || '').toLowerCase().includes(filterStr);
          case 'number':
            const numericValue = Number(cellValue);
            const numericFilter = Number(filterValue);
            if (!isNaN(numericFilter)) {
              return numericValue === numericFilter;
            }
            // Support operators like >, <, >=, <=
            if (filterStr.startsWith('>=')) {
              return numericValue >= Number(filterStr.substring(2));
            } else if (filterStr.startsWith('<=')) {
              return numericValue <= Number(filterStr.substring(2));
            } else if (filterStr.startsWith('>')) {
              return numericValue > Number(filterStr.substring(1));
            } else if (filterStr.startsWith('<')) {
              return numericValue < Number(filterStr.substring(1));
            }
            return String(cellValue || '').toLowerCase().includes(filterStr);
          case 'boolean':
            const boolValue = Boolean(cellValue);
            const filterBool = filterStr === 'true' || filterStr === 'yes' || filterStr === '1';
            return boolValue === filterBool;
          case 'date':
            const dateValue = new Date(cellValue);
            const filterDate = new Date(filterValue);
            if (!isNaN(dateValue.getTime()) && !isNaN(filterDate.getTime())) {
              return dateValue.toDateString() === filterDate.toDateString();
            }
            return String(cellValue || '').toLowerCase().includes(filterStr);
          default:
            return String(cellValue || '').toLowerCase().includes(filterStr);
        }
      });
    });
  }

  /**
   * Apply sorting to data (supports multi-column sorting)
   */
  private applySorting(data: any[], sorts: { columnId: string; direction: 'asc' | 'desc'; order: number }[]): any[] {
    if (!sorts || sorts.length === 0) return data;
    
    // Sort the sort criteria by order
    const orderedSorts = [...sorts].sort((a, b) => a.order - b.order);
    
    return [...data].sort((a, b) => {
      for (const sort of orderedSorts) {
        const column = this._columns().find(col => col.id === sort.columnId);
        if (!column) continue;
        
        const aValue = a[column.field];
        const bValue = b[column.field];
        
        let result = 0;
        
        // Handle different data types
        switch (column.type) {
          case 'number':
            result = Number(aValue || 0) - Number(bValue || 0);
            break;
          case 'date':
            result = new Date(aValue || 0).getTime() - new Date(bValue || 0).getTime();
            break;
          case 'boolean':
            result = (aValue === bValue) ? 0 : aValue ? 1 : -1;
            break;
          default:
            result = String(aValue || '').localeCompare(String(bValue || ''));
        }
        
        if (result !== 0) {
          return sort.direction === 'desc' ? -result : result;
        }
      }
      
      return 0; // All sort criteria are equal
    });
  }

  /**
   * Track by function for virtual scrolling performance
   */
  trackByIndex(index: number, _item: any): number {
    return index;
  }

  /**
   * Track by function for columns
   */
  trackByColumnId(_index: number, column: ColumnDefinition): string {
    return column.id;
  }

  /**
   * Select all rows in the current data set
   */
  selectAllRows(): void {
    for (let i = 0; i < this.gridData().length; i++) {
      if (!this.selectedRows().has(i)) {
        this.gridState.toggleRowSelection(i);
      }
    }
  }

  /**
   * Clear all row selections
   */
  clearAllSelection(): void {
    this.gridState.clearSelection();
  }
  
  /**
   * Start editing a cell
   */
  startEdit(rowIndex: number, columnId: string, currentValue: any): void {
    if (this.editingCell()) {
      this.commitEdit();
    }
    
    const column = this.visibleColumns().find(col => col.id === columnId);
    if (!column || column.cellEditor === false) {
      return;
    }
    
    // Convert value for editing
    let editableValue = currentValue;
    if (column.type === 'date' && editableValue) {
      // Convert date to YYYY-MM-DD format for input[type="date"]
      const date = new Date(editableValue);
      editableValue = date.toISOString().split('T')[0];
    } else if (column.type === 'boolean') {
      editableValue = String(Boolean(editableValue));
    }
    
    this.editingCell.set({ rowIndex, columnId });
    this.editValue.set(editableValue);
    this.originalEditValue.set(currentValue);
    
    // Focus the input after a brief delay to ensure it's rendered
    setTimeout(() => {
      const editorInput = document.querySelector('.blg-grid-editor-input, .blg-grid-editor-select') as HTMLInputElement;
      if (editorInput) {
        editorInput.focus();
        if (editorInput.select) {
          editorInput.select();
        }
      }
    }, 0);
  }
  
  /**
   * Update the current edit value
   */
  updateEditValue(value: any): void {
    this.editValue.set(value);
  }
  
  /**
   * Handle key events in cell editors
   */
  onEditorKeyDown(event: KeyboardEvent, _rowIndex: number, _columnId: string): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.commitEdit();
        break;
      case 'Escape':
        event.preventDefault();
        this.cancelEdit();
        break;
      case 'Tab':
        event.preventDefault();
        this.commitEdit();
        // Move to next editable cell
        this.moveToNextEditableCell(event.shiftKey);
        break;
    }
  }
  
  /**
   * Commit the current edit
   */
  commitEdit(): void {
    const editing = this.editingCell();
    if (!editing) return;
    
    const column = this.visibleColumns().find(col => col.id === editing.columnId);
    if (!column) {
      this.cancelEdit();
      return;
    }
    
    let finalValue = this.editValue();
    
    // Convert value based on column type
    switch (column.type) {
      case 'number':
        finalValue = finalValue === '' ? null : Number(finalValue);
        break;
      case 'boolean':
        finalValue = finalValue === 'true';
        break;
      case 'date':
        // Keep as string or convert as needed
        break;
    }
    
    // Update the data
    const currentData = [...this._data()]; // Use original data, not paginated
    const actualRowIndex = this.getActualRowIndex(editing.rowIndex);
    const rowData = currentData[actualRowIndex];
    
    if (rowData) {
      const oldValue = rowData[column.field];
      rowData[column.field] = finalValue;
      this._data.set(currentData);
      
      // Emit cell edit event
      const cellEditEvent: CellEditEvent = {
        type: 'cell-edit',
        data: {
          rowIndex: actualRowIndex,
          columnId: editing.columnId,
          oldValue,
          newValue: finalValue,
          rowData
        },
        timestamp: new Date()
      };
      this.gridEvent.emit(cellEditEvent);
    }
    
    this.editingCell.set(null);
    this.editValue.set(null);
    this.originalEditValue.set(null);
  }
  
  /**
   * Cancel the current edit
   */
  cancelEdit(): void {
    this.editingCell.set(null);
    this.editValue.set(null);
    this.originalEditValue.set(null);
  }
  
  /**
   * Move to the next editable cell
   */
  private moveToNextEditableCell(backwards: boolean = false): void {
    const focused = this.focusedCell();
    if (!focused) return;
    
    const visibleCols = this.visibleColumns();
    const maxRow = this.gridData().length - 1;
    const maxCol = visibleCols.length - 1;
    
    let { row, col } = focused;
    
    if (backwards) {
      col--;
      if (col < 0) {
        col = maxCol;
        row--;
      }
      if (row < 0) {
        row = 0;
        col = 0;
      }
    } else {
      col++;
      if (col > maxCol) {
        col = 0;
        row++;
      }
      if (row > maxRow) {
        row = maxRow;
        col = maxCol;
      }
    }
    
    this.setFocusedCell(row, col);
    
    // Check if this cell is editable and start editing
    const nextColumn = visibleCols[col];
    if (nextColumn && nextColumn.cellEditor !== false) {
      const nextValue = this.getCellValue(this.gridData()[row], nextColumn);
      this.startEdit(row, nextColumn.id, nextValue);
    }
  }
  
  /**
   * Format cell value for display based on type
   */
  formatCellValue(value: any, type?: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    switch (type) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }
  
  /**
   * Render custom cell content
   */
  renderCustomCell(value: any, column: ColumnDefinition, rowData: any): string {
    if (!column.cellRenderer) {
      return String(value || '');
    }
    
    // For now, we'll support simple template-like rendering
    // In a real implementation, this could support Angular templates or custom components
    let rendered = column.cellRenderer;
    
    // Replace placeholders
    rendered = rendered.replace(/\{\{value\}\}/g, String(value || ''));
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (_match, fieldName) => {
      return String(rowData[fieldName] || '');
    });
    
    return rendered;
  }
  
  /**
   * Get the actual row index in the original data (accounting for pagination)
   */
  private getActualRowIndex(displayedRowIndex: number): number {
    if (this._config().pagination && this.paginationState().mode === 'client') {
      return this.currentPage() * this.pageSize() + displayedRowIndex;
    }
    return displayedRowIndex;
  }
  
  /**
   * Get total items for pagination
   */
  private getTotalItemsForPagination(): number {
    if (this.paginationState().mode === 'server') {
      return this.paginationState().totalItems || 0;
    }
    // For client-side, return the filtered data length
    let result = [...this._data()];
    const filters = this.filterState();
    if (Object.keys(filters).length > 0) {
      result = this.applyFilters(result, filters);
    }
    return result.length;
  }
  
  /**
   * Get page info text
   */
  getPageInfo(): string {
    const current = this.currentPage();
    const size = this.pageSize();
    const total = this.getTotalItemsForPagination();
    const startItem = (current * size) + 1;
    const endItem = Math.min((current + 1) * size, total);
    
    if (total === 0) {
      return 'No items';
    }
    
    return `${startItem}-${endItem} of ${total}`;
  }
  
  /**
   * Get visible page numbers for pagination
   */
  getVisiblePages(): number[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const maxButtons = this.paginationState().maxPageButtons || 7;
    
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i);
    }
    
    const pages: number[] = [];
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(0, current - half);
    let end = Math.min(total - 1, start + maxButtons - 1);
    
    // Adjust start if we're near the end
    if (end - start < maxButtons - 1) {
      start = Math.max(0, end - maxButtons + 1);
    }
    
    // Always show first page
    if (start > 0) {
      pages.push(0);
      if (start > 1) {
        pages.push(-1); // Ellipsis
      }
    }
    
    // Add visible pages
    for (let i = start; i <= end; i++) {
      if (i === 0 && pages.includes(0)) continue;
      if (i === total - 1 && pages.includes(total - 1)) continue;
      pages.push(i);
    }
    
    // Always show last page
    if (end < total - 1) {
      if (end < total - 2) {
        pages.push(-1); // Ellipsis
      }
      pages.push(total - 1);
    }
    
    return pages;
  }
  
  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    const totalPages = this.totalPages();
    if (page < 0 || page >= totalPages) {
      return;
    }
    
    this.gridState.setCurrentPage(page);
    
    // Emit pagination event
    const paginationEvent: PaginationEvent = {
      type: 'pagination',
      data: {
        currentPage: page,
        pageSize: this.pageSize(),
        totalItems: this.getTotalItemsForPagination()
      },
      timestamp: new Date()
    };
    
    this.gridEvent.emit(paginationEvent);
    
    // Reset focus to first cell of new page
    if (this.gridData().length > 0) {
      this.setFocusedCell(0, 0);
    }
  }
  
  /**
   * Go to next page
   */
  goToNextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }
  
  /**
   * Go to previous page
   */
  goToPreviousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }
  
  /**
   * Handle page size change
   */
  onPageSizeChange(newSize: string): void {
    const pageSize = parseInt(newSize, 10);
    if (isNaN(pageSize)) return;
    
    this.gridState.setPageSize(pageSize);
    
    // Emit pagination event
    const paginationEvent: PaginationEvent = {
      type: 'pagination',
      data: {
        currentPage: 0, // Reset to first page
        pageSize: pageSize,
        totalItems: this.getTotalItemsForPagination()
      },
      timestamp: new Date()
    };
    
    this.gridEvent.emit(paginationEvent);
  }

  // ======================
  // GROUPING METHODS
  // ======================

  /**
   * Handle group column changes from toolbar
   */
  onGroupByColumnsChange(columnIds: string[]): void {
    this.groupingService.setGroupByColumns(columnIds);
  }

  /**
   * Handle aggregations change from toolbar
   */
  onAggregationsChange(aggregations: { [columnId: string]: AggregationConfig[] }): void {
    this.groupingService.setAggregations(aggregations);
  }

  /**
   * Toggle group expansion
   */
  toggleGroupExpansion(groupId: string): void {
    this.groupingService.toggleGroup(groupId);
  }

  /**
   * Expand all groups
   */
  expandAllGroups(): void {
    this.groupingService.expandAllGroups(this.groupedRows());
  }

  /**
   * Collapse all groups
   */
  collapseAllGroups(): void {
    this.groupingService.collapseAllGroups();
  }

  /**
   * Check if a group is expanded
   */
  isGroupExpanded(groupId: string): boolean {
    return this.groupingState().expandedGroups.has(groupId);
  }

  // ======================
  // EXPORT METHODS
  // ======================

  /**
   * Handle export request from toolbar
   */
  async onExportRequested(options: ExportOptions): Promise<void> {
    try {
      let dataToExport: any[] = [];
      
      // Determine data scope
      switch (options.dataScope) {
        case 'all':
          dataToExport = this._data();
          break;
        case 'filtered':
          dataToExport = this.processedFlatData();
          break;
        case 'visible':
        default:
          dataToExport = this.isGrouped() ? this.getVisibleRowsFromGrouped() : this.gridData();
          break;
      }

      const appliedFilters = this.filterState();
      const groupedRows = this.isGrouped() ? this.groupedRows() : undefined;

      await this.exportService.exportData(
        dataToExport,
        this._columns(),
        options,
        groupedRows,
        appliedFilters
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  /**
   * Get visible data rows from grouped data (expanded groups only)
   */
  private getVisibleRowsFromGrouped(): any[] {
    const result: any[] = [];
    
    const processGroupedRows = (rows: GroupedRow[]) => {
      rows.forEach(row => {
        if (row.type === 'data' && row.data) {
          result.push(row.data);
        } else if (row.type === 'group' && row.group && row.expanded) {
          processGroupedRows(row.group.children);
        }
      });
    };
    
    processGroupedRows(this.groupedRows());
    return result;
  }

  /**
   * Export visible data to CSV
   */
  exportToCsv(filename?: string): void {
    const options: ExportOptions = {
      format: 'csv',
      filename: filename || 'grid-export',
      includeHeaders: true,
      dataScope: 'visible',
      formatOptions: this.exportService.getDefaultCsvOptions()
    };
    
    this.onExportRequested(options);
  }

  /**
   * Export visible data to Excel
   */
  exportToExcel(filename?: string): void {
    const options: ExportOptions = {
      format: 'excel',
      filename: filename || 'grid-export',
      includeHeaders: true,
      dataScope: 'visible',
      formatOptions: this.exportService.getDefaultExcelOptions()
    };
    
    this.onExportRequested(options);
  }
}
