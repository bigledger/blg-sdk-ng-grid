import { TestBed } from '@angular/core/testing';
import { GridStateService } from './grid-state.service';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { GridConfig, PaginationConfig } from '../interfaces/grid-config.interface';

describe('GridStateService', () => {
  let service: GridStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GridStateService]
    });
    service = TestBed.inject(GridStateService);
  });

  afterEach(() => {
    service.reset();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have default initial state', () => {
      const state = service.state;
      
      expect(state.columns).toEqual([]);
      expect(state.config).toEqual({});
      expect(state.selectedRows).toEqual(new Set());
      expect(state.sortState).toBeNull();
      expect(state.filterState).toEqual({});
      expect(state.scrollPosition).toEqual({ x: 0, y: 0 });
      expect(state.paginationState).toEqual({
        currentPage: 0,
        pageSize: 25,
        pageSizeOptions: [10, 25, 50, 100],
        totalItems: 0,
        mode: 'client',
        showPageSizeSelector: true,
        showPageInfo: true,
        maxPageButtons: 7
      });
    });

    it('should provide reactive access to state properties', () => {
      expect(service.columns()).toEqual([]);
      expect(service.config()).toEqual({});
      expect(service.selectedRows()).toEqual(new Set());
      expect(service.sortState()).toBeNull();
      expect(service.filterState()).toEqual({});
      expect(service.scrollPosition()).toEqual({ x: 0, y: 0 });
      expect(service.paginationState()).toBeTruthy();
    });
  });

  describe('Column Management', () => {
    const mockColumns: ColumnDefinition[] = [
      { id: 'id', field: 'id', header: 'ID', type: 'number', width: 80 },
      { id: 'name', field: 'name', header: 'Name', type: 'string', width: 120 },
      { id: 'age', field: 'age', header: 'Age', type: 'number', width: 100 }
    ];

    it('should update columns', () => {
      service.updateColumns(mockColumns);
      
      const columns = service.columns();
      expect(columns).toEqual(mockColumns);
      expect(columns).not.toBe(mockColumns); // Should be a copy
    });

    it('should update column width', () => {
      service.updateColumns(mockColumns);
      service.updateColumnWidth('name', 200);
      
      const columns = service.columns();
      const nameColumn = columns.find(col => col.id === 'name');
      
      expect(nameColumn?.width).toBe(200);
    });

    it('should not affect other columns when updating width', () => {
      service.updateColumns(mockColumns);
      service.updateColumnWidth('name', 200);
      
      const columns = service.columns();
      const idColumn = columns.find(col => col.id === 'id');
      const ageColumn = columns.find(col => col.id === 'age');
      
      expect(idColumn?.width).toBe(80);
      expect(ageColumn?.width).toBe(100);
    });

    it('should update column visibility', () => {
      service.updateColumns(mockColumns);
      service.updateColumnVisibility('name', false);
      
      const columns = service.columns();
      const nameColumn = columns.find(col => col.id === 'name');
      
      expect(nameColumn?.visible).toBe(false);
    });

    it('should handle updating non-existent column', () => {
      service.updateColumns(mockColumns);
      
      expect(() => {
        service.updateColumnWidth('nonexistent', 200);
      }).not.toThrow();
      
      expect(() => {
        service.updateColumnVisibility('nonexistent', false);
      }).not.toThrow();
    });
  });

  describe('Configuration Management', () => {
    const mockConfig: GridConfig = {
      rowHeight: 50,
      virtualScrolling: true,
      sortable: true,
      filterable: true,
      selectable: true,
      selectionMode: 'single'
    };

    it('should update configuration', () => {
      service.updateConfig(mockConfig);
      
      const config = service.config();
      expect(config).toEqual(mockConfig);
    });

    it('should merge configuration with existing config', () => {
      service.updateConfig({ rowHeight: 40 });
      service.updateConfig({ sortable: false });
      
      const config = service.config();
      expect(config.rowHeight).toBe(40);
      expect(config.sortable).toBe(false);
    });

    it('should not mutate original config object', () => {
      const originalConfig = { rowHeight: 60 };
      service.updateConfig(originalConfig);
      
      const config = service.config();
      expect(config).not.toBe(originalConfig);
      expect(config.rowHeight).toBe(60);
    });
  });

  describe('Row Selection Management', () => {
    beforeEach(() => {
      service.updateConfig({ selectionMode: 'multiple' });
    });

    it('should toggle row selection', () => {
      service.toggleRowSelection(0);
      
      const selectedRows = service.selectedRows();
      expect(selectedRows.has(0)).toBe(true);
      expect(selectedRows.size).toBe(1);
    });

    it('should deselect when toggling selected row', () => {
      service.toggleRowSelection(0);
      service.toggleRowSelection(0);
      
      const selectedRows = service.selectedRows();
      expect(selectedRows.has(0)).toBe(false);
      expect(selectedRows.size).toBe(0);
    });

    it('should allow multiple selections in multiple mode', () => {
      service.toggleRowSelection(0);
      service.toggleRowSelection(2);
      service.toggleRowSelection(4);
      
      const selectedRows = service.selectedRows();
      expect(selectedRows.has(0)).toBe(true);
      expect(selectedRows.has(2)).toBe(true);
      expect(selectedRows.has(4)).toBe(true);
      expect(selectedRows.size).toBe(3);
    });

    it('should allow only single selection in single mode', () => {
      service.updateConfig({ selectionMode: 'single' });
      
      service.toggleRowSelection(0);
      service.toggleRowSelection(2);
      
      const selectedRows = service.selectedRows();
      expect(selectedRows.has(0)).toBe(false);
      expect(selectedRows.has(2)).toBe(true);
      expect(selectedRows.size).toBe(1);
    });

    it('should clear all selections', () => {
      service.toggleRowSelection(0);
      service.toggleRowSelection(1);
      service.toggleRowSelection(2);
      
      service.clearSelection();
      
      const selectedRows = service.selectedRows();
      expect(selectedRows.size).toBe(0);
    });

    it('should maintain separate selection state instances', () => {
      service.toggleRowSelection(0);
      
      const selectedRows1 = service.selectedRows();
      const selectedRows2 = service.selectedRows();
      
      expect(selectedRows1).toEqual(selectedRows2);
      expect(selectedRows1).toBe(selectedRows2); // Same signal instance
    });
  });

  describe('Sort State Management', () => {
    it('should set single column sort', () => {
      service.updateSort('name', 'asc');
      
      const sortState = service.sortState();
      expect(sortState).toHaveLength(1);
      expect(sortState![0]).toEqual({
        columnId: 'name',
        direction: 'asc',
        order: 0
      });
    });

    it('should update sort direction', () => {
      service.updateSort('name', 'asc');
      service.updateSort('name', 'desc');
      
      const sortState = service.sortState();
      expect(sortState).toHaveLength(1);
      expect(sortState![0].direction).toBe('desc');
    });

    it('should clear sort when direction is null', () => {
      service.updateSort('name', 'asc');
      service.updateSort('name', null);
      
      const sortState = service.sortState();
      expect(sortState).toBeNull();
    });

    it('should support multi-column sorting', () => {
      service.updateSort('name', 'asc', false);
      service.updateSort('age', 'desc', true);
      
      const sortState = service.sortState();
      expect(sortState).toHaveLength(2);
      expect(sortState![0]).toEqual({ columnId: 'name', direction: 'asc', order: 0 });
      expect(sortState![1]).toEqual({ columnId: 'age', direction: 'desc', order: 1 });
    });

    it('should update existing column in multi-sort', () => {
      service.updateSort('name', 'asc', false);
      service.updateSort('age', 'desc', true);
      service.updateSort('name', 'desc', true);
      
      const sortState = service.sortState();
      expect(sortState).toHaveLength(2);
      
      const nameSort = sortState!.find(s => s.columnId === 'name');
      expect(nameSort?.direction).toBe('desc');
      expect(nameSort?.order).toBe(0); // Should maintain order
    });

    it('should remove column from multi-sort when direction is null', () => {
      service.updateSort('name', 'asc', false);
      service.updateSort('age', 'desc', true);
      service.updateSort('name', null, true);
      
      const sortState = service.sortState();
      expect(sortState).toHaveLength(1);
      expect(sortState![0].columnId).toBe('age');
    });

    it('should clear all sorts', () => {
      service.updateSort('name', 'asc', false);
      service.updateSort('age', 'desc', true);
      
      service.clearSort();
      
      const sortState = service.sortState();
      expect(sortState).toBeNull();
    });

    it('should handle complex multi-sort scenarios', () => {
      // Add three sorts
      service.updateSort('name', 'asc', false);
      service.updateSort('age', 'desc', true);
      service.updateSort('id', 'asc', true);
      
      let sortState = service.sortState();
      expect(sortState).toHaveLength(3);
      
      // Remove middle sort
      service.updateSort('age', null, true);
      
      sortState = service.sortState();
      expect(sortState).toHaveLength(2);
      expect(sortState!.find(s => s.columnId === 'name')).toBeTruthy();
      expect(sortState!.find(s => s.columnId === 'id')).toBeTruthy();
      expect(sortState!.find(s => s.columnId === 'age')).toBeFalsy();
    });
  });

  describe('Filter State Management', () => {
    it('should set filter for column', () => {
      service.updateFilter('name', 'John');
      
      const filterState = service.filterState();
      expect(filterState['name']).toBe('John');
    });

    it('should update existing filter', () => {
      service.updateFilter('name', 'John');
      service.updateFilter('name', 'Jane');
      
      const filterState = service.filterState();
      expect(filterState['name']).toBe('Jane');
    });

    it('should set filters for multiple columns', () => {
      service.updateFilter('name', 'John');
      service.updateFilter('age', '>25');
      service.updateFilter('status', 'active');
      
      const filterState = service.filterState();
      expect(filterState['name']).toBe('John');
      expect(filterState['age']).toBe('>25');
      expect(filterState['status']).toBe('active');
    });

    it('should clear all filters', () => {
      service.updateFilter('name', 'John');
      service.updateFilter('age', '>25');
      
      service.clearFilters();
      
      const filterState = service.filterState();
      expect(Object.keys(filterState)).toHaveLength(0);
    });

    it('should handle various filter value types', () => {
      service.updateFilter('name', 'string');
      service.updateFilter('age', 25);
      service.updateFilter('active', true);
      service.updateFilter('date', new Date());
      service.updateFilter('empty', null);
      service.updateFilter('undefined', undefined);
      
      const filterState = service.filterState();
      expect(filterState['name']).toBe('string');
      expect(filterState['age']).toBe(25);
      expect(filterState['active']).toBe(true);
      expect(filterState['date']).toBeInstanceOf(Date);
      expect(filterState['empty']).toBeNull();
      expect(filterState['undefined']).toBeUndefined();
    });
  });

  describe('Pagination State Management', () => {
    it('should update pagination configuration', () => {
      const paginationConfig: Partial<PaginationConfig> = {
        currentPage: 2,
        pageSize: 50,
        totalItems: 1000
      };
      
      service.updatePagination(paginationConfig);
      
      const paginationState = service.paginationState();
      expect(paginationState.currentPage).toBe(2);
      expect(paginationState.pageSize).toBe(50);
      expect(paginationState.totalItems).toBe(1000);
      expect(paginationState.mode).toBe('client'); // Should maintain existing values
    });

    it('should set current page', () => {
      service.setCurrentPage(5);
      
      const paginationState = service.paginationState();
      expect(paginationState.currentPage).toBe(5);
    });

    it('should set page size and reset current page', () => {
      service.setCurrentPage(3);
      service.setPageSize(100);
      
      const paginationState = service.paginationState();
      expect(paginationState.pageSize).toBe(100);
      expect(paginationState.currentPage).toBe(0); // Should reset to first page
    });

    it('should set total items', () => {
      service.setTotalItems(5000);
      
      const paginationState = service.paginationState();
      expect(paginationState.totalItems).toBe(5000);
    });

    it('should merge pagination updates with existing state', () => {
      service.updatePagination({ mode: 'server', showPageInfo: false });
      service.updatePagination({ pageSize: 75 });
      
      const paginationState = service.paginationState();
      expect(paginationState.mode).toBe('server');
      expect(paginationState.showPageInfo).toBe(false);
      expect(paginationState.pageSize).toBe(75);
      expect(paginationState.showPageSizeSelector).toBe(true); // Should maintain default
    });
  });

  describe('Scroll Position Management', () => {
    it('should update scroll position', () => {
      service.updateScrollPosition(100, 250);
      
      const scrollPosition = service.scrollPosition();
      expect(scrollPosition.x).toBe(100);
      expect(scrollPosition.y).toBe(250);
    });

    it('should handle negative scroll positions', () => {
      service.updateScrollPosition(-50, -100);
      
      const scrollPosition = service.scrollPosition();
      expect(scrollPosition.x).toBe(-50);
      expect(scrollPosition.y).toBe(-100);
    });

    it('should handle large scroll positions', () => {
      service.updateScrollPosition(999999, 888888);
      
      const scrollPosition = service.scrollPosition();
      expect(scrollPosition.x).toBe(999999);
      expect(scrollPosition.y).toBe(888888);
    });
  });

  describe('State Reset', () => {
    it('should reset all state to initial values', () => {
      // Modify all aspects of state
      const mockColumns: ColumnDefinition[] = [
        { id: 'test', field: 'test', header: 'Test' }
      ];
      
      service.updateColumns(mockColumns);
      service.updateConfig({ rowHeight: 60 });
      service.toggleRowSelection(0);
      service.toggleRowSelection(5);
      service.updateSort('test', 'asc');
      service.updateFilter('test', 'value');
      service.updateScrollPosition(100, 200);
      service.updatePagination({ currentPage: 5, pageSize: 100 });
      
      // Reset
      service.reset();
      
      // Verify all state is back to initial
      const state = service.state;
      expect(state.columns).toEqual([]);
      expect(state.config).toEqual({});
      expect(state.selectedRows.size).toBe(0);
      expect(state.sortState).toBeNull();
      expect(Object.keys(state.filterState)).toHaveLength(0);
      expect(state.scrollPosition).toEqual({ x: 0, y: 0 });
      expect(state.paginationState.currentPage).toBe(0);
      expect(state.paginationState.pageSize).toBe(25);
    });
  });

  describe('Reactive Updates', () => {
    it('should provide reactive access to state properties', () => {
      // Test that all computed properties return the correct values
      expect(service.columns()).toEqual([]);
      expect(service.config()).toEqual({});
      expect(service.selectedRows()).toEqual(new Set());
      expect(service.sortState()).toBeNull();
      expect(service.filterState()).toEqual({});
      expect(service.scrollPosition()).toEqual({ x: 0, y: 0 });
      expect(service.paginationState()).toBeTruthy();
      
      // Test that updates work correctly
      const mockColumns = [{ id: 'test', field: 'test', header: 'Test' }];
      service.updateColumns(mockColumns);
      expect(service.columns()).toEqual(mockColumns);
      
      service.toggleRowSelection(0);
      expect(service.selectedRows().has(0)).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined values gracefully', () => {
      // updateColumns should handle null by defaulting to empty array
      service.updateColumns(null as any);
      expect(service.columns()).toEqual([]);
      
      // updateConfig should handle null by defaulting to empty object
      service.updateConfig(null as any);
      expect(service.config()).toEqual({});
      
      expect(() => {
        service.updateSort('', null);
      }).not.toThrow();
      
      expect(() => {
        service.updateFilter('', null);
      }).not.toThrow();
    });

    it('should handle empty string column IDs', () => {
      expect(() => {
        service.updateSort('', 'asc');
        service.updateFilter('', 'test');
        service.updateColumnWidth('', 100);
        service.updateColumnVisibility('', false);
      }).not.toThrow();
    });

    it('should handle extreme numeric values', () => {
      expect(() => {
        service.toggleRowSelection(Number.MAX_SAFE_INTEGER);
        service.toggleRowSelection(Number.MIN_SAFE_INTEGER);
        service.toggleRowSelection(-1);
        service.updateScrollPosition(Infinity, -Infinity);
        service.setCurrentPage(Number.MAX_SAFE_INTEGER);
        service.setPageSize(Number.MAX_SAFE_INTEGER);
      }).not.toThrow();
    });

    it('should maintain state consistency during rapid updates', () => {
      // Perform rapid state changes
      for (let i = 0; i < 100; i++) {
        service.toggleRowSelection(i % 10);
        service.updateSort(`col${i % 5}`, i % 2 === 0 ? 'asc' : 'desc', true);
        service.updateFilter(`filter${i % 3}`, `value${i}`);
      }
      
      // State should still be valid
      const state = service.state;
      expect(state.selectedRows).toBeInstanceOf(Set);
      expect(Array.isArray(state.sortState) || state.sortState === null).toBe(true);
      expect(typeof state.filterState).toBe('object');
    });
  });
});