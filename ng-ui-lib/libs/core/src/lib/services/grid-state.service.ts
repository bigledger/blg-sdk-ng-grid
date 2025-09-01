import { Injectable, signal, computed } from '@angular/core';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { GridConfig, PaginationConfig } from '../interfaces/grid-config.interface';

export interface GridState {
  columns: ColumnDefinition[];
  config: GridConfig;
  data: any[];
  selectedRows: Set<number>;
  sortState: { columnId: string; direction: 'asc' | 'desc'; order: number }[] | null;
  filterState: Record<string, any>;
  scrollPosition: { x: number; y: number };
  paginationState: PaginationConfig;
}

@Injectable({
  providedIn: 'root'
})
export class GridStateService {
  private _state = signal<GridState>({
    columns: [],
    config: {},
    data: [],
    selectedRows: new Set(),
    sortState: null,
    filterState: {},
    scrollPosition: { x: 0, y: 0 },
    paginationState: {
      currentPage: 0,
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
      totalItems: 0,
      mode: 'client',
      showPageSizeSelector: true,
      showPageInfo: true,
      maxPageButtons: 7
    }
  });

  // Computed signals for reactive access
  readonly columns = computed(() => this._state().columns);
  readonly config = computed(() => this._state().config);
  readonly data = computed(() => this._state().data);
  readonly selectedRows = computed(() => this._state().selectedRows);
  readonly sortState = computed(() => this._state().sortState);
  readonly filterState = computed(() => this._state().filterState);
  readonly scrollPosition = computed(() => this._state().scrollPosition);
  readonly paginationState = computed(() => this._state().paginationState);

  // Getters for the full state
  get state(): GridState {
    return this._state();
  }

  // State update methods
  updateColumns(columns: ColumnDefinition[]): void {
    this._state.update(state => ({
      ...state,
      columns: [...(columns || [])]
    }));
  }

  updateData(data: any[]): void {
    this._state.update(state => ({
      ...state,
      data: [...(data || [])]
    }));
  }

  resetColumns(): void {
    this._state.update(state => ({
      ...state,
      columns: []
    }));
  }

  updateConfig(config: GridConfig): void {
    this._state.update(state => ({
      ...state,
      config: { ...state.config, ...(config || {}) }
    }));
  }

  updateColumnWidth(columnId: string, width: number): void {
    this._state.update(state => ({
      ...state,
      columns: state.columns.map(col => 
        col.id === columnId ? { ...col, width } : col
      )
    }));
  }

  updateColumnVisibility(columnId: string, visible: boolean): void {
    this._state.update(state => ({
      ...state,
      columns: state.columns.map(col => 
        col.id === columnId ? { ...col, visible } : col
      )
    }));
  }

  toggleRowSelection(rowIndex: number, selected?: boolean): void {
    this._state.update(state => {
      const newSelectedRows = new Set(state.selectedRows);
      
      if (selected !== undefined) {
        // Explicit selection state provided
        if (selected) {
          if (state.config.selectionMode === 'single') {
            newSelectedRows.clear();
          }
          newSelectedRows.add(rowIndex);
        } else {
          newSelectedRows.delete(rowIndex);
        }
      } else {
        // Toggle behavior
        if (newSelectedRows.has(rowIndex)) {
          newSelectedRows.delete(rowIndex);
        } else {
          // Handle selection mode
          if (state.config.selectionMode === 'single') {
            newSelectedRows.clear();
          }
          newSelectedRows.add(rowIndex);
        }
      }
      return {
        ...state,
        selectedRows: newSelectedRows
      };
    });
  }

  clearSelection(): void {
    this._state.update(state => ({
      ...state,
      selectedRows: new Set()
    }));
  }

  updateSort(columnId: string, direction: 'asc' | 'desc' | null, multiSort: boolean = false): void {
    this._state.update(state => {
      let newSortState: { columnId: string; direction: 'asc' | 'desc'; order: number }[] | null = null;
      
      if (direction === null) {
        // Remove sorting for this column
        newSortState = state.sortState ? 
          state.sortState.filter(sort => sort.columnId !== columnId) : 
          null;
        
        if (newSortState && newSortState.length === 0) {
          newSortState = null;
        }
      } else {
        if (multiSort && state.sortState) {
          // Multi-column sorting
          const existingSort = state.sortState.find(sort => sort.columnId === columnId);
          if (existingSort) {
            // Update existing sort
            newSortState = state.sortState.map(sort => 
              sort.columnId === columnId ? { ...sort, direction } : sort
            );
          } else {
            // Add new sort
            const nextOrder = Math.max(...state.sortState.map(s => s.order)) + 1;
            newSortState = [...state.sortState, { columnId, direction, order: nextOrder }];
          }
        } else {
          // Single column sorting (default)
          newSortState = [{ columnId, direction, order: 0 }];
        }
      }
      
      return {
        ...state,
        sortState: newSortState
      };
    });
  }

  clearSort(): void {
    this._state.update(state => ({
      ...state,
      sortState: null
    }));
  }

  updateFilter(columnId: string, filterValue: any): void {
    this._state.update(state => ({
      ...state,
      filterState: {
        ...state.filterState,
        [columnId]: filterValue
      }
    }));
  }

  clearFilters(): void {
    this._state.update(state => ({
      ...state,
      filterState: {}
    }));
  }

  updateScrollPosition(x: number, y: number): void {
    this._state.update(state => ({
      ...state,
      scrollPosition: { x, y }
    }));
  }

  reset(): void {
    this._state.set({
      columns: [],
      config: {},
      data: [],
      selectedRows: new Set(),
      sortState: null,
      filterState: {},
      scrollPosition: { x: 0, y: 0 },
      paginationState: {
        currentPage: 0,
        pageSize: 25,
        pageSizeOptions: [10, 25, 50, 100],
        totalItems: 0,
        mode: 'client',
        showPageSizeSelector: true,
        showPageInfo: true,
        maxPageButtons: 7
      }
    });
  }

  // Pagination methods
  updatePagination(paginationConfig: Partial<PaginationConfig>): void {
    this._state.update(state => ({
      ...state,
      paginationState: { ...state.paginationState, ...paginationConfig }
    }));
  }

  setCurrentPage(page: number): void {
    this._state.update(state => ({
      ...state,
      paginationState: { ...state.paginationState, currentPage: page }
    }));
  }

  setPageSize(pageSize: number): void {
    this._state.update(state => ({
      ...state,
      paginationState: { 
        ...state.paginationState, 
        pageSize, 
        currentPage: 0 // Reset to first page when page size changes
      }
    }));
  }

  setTotalItems(totalItems: number): void {
    this._state.update(state => ({
      ...state,
      paginationState: { ...state.paginationState, totalItems }
    }));
  }
}