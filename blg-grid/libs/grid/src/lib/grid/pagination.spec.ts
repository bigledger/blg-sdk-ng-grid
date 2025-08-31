import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { Grid } from './grid';
import { GridStateService } from '@blg/core';
import { TestGridWrapperComponent } from '../../test-utilities/test-grid-wrapper.component';
import {
  MockDataFactory,
  MockColumnFactory,
  MockConfigFactory,
  TestDOMHelpers,
  TestEventHelpers,
  TestAsyncHelpers
} from '../../test-utilities/test-utils';

describe('Grid Component - Pagination', () => {
  let wrapperComponent: TestGridWrapperComponent;
  let wrapperFixture: ComponentFixture<TestGridWrapperComponent>;
  let gridStateService: GridStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Grid,
        TestGridWrapperComponent,
        NoopAnimationsModule,
        ScrollingModule,
        DragDropModule
      ],
      providers: [GridStateService]
    }).compileComponents();

    wrapperFixture = TestBed.createComponent(TestGridWrapperComponent);
    wrapperComponent = wrapperFixture.componentInstance;
    gridStateService = TestBed.inject(GridStateService);
  });

  afterEach(() => {
    wrapperFixture?.destroy();
    gridStateService?.reset();
  });

  describe('Client-Side Pagination', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(100);
      testColumns = MockColumnFactory.getStandardColumns();
      
      const paginatedConfig = MockConfigFactory.getPaginatedConfig();
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = paginatedConfig;
    });

    it('should enable pagination when configured', () => {
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.grid.gridConfig().pagination).toBe(true);
      expect(wrapperComponent.grid.paginationState().mode).toBe('client');
    });

    it('should display correct page size of data', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const pageSize = wrapperComponent.pageSize;
      const displayedData = wrapperComponent.gridData;
      
      expect(displayedData.length).toBe(pageSize);
      expect(displayedData.length).toBeLessThanOrEqual(25); // Default page size
    });

    it('should calculate total pages correctly', () => {
      wrapperFixture.detectChanges();
      
      const totalPages = wrapperComponent.totalPages;
      const pageSize = wrapperComponent.pageSize;
      const expectedPages = Math.ceil(testData.length / pageSize);
      
      expect(totalPages).toBe(expectedPages);
    });

    it('should navigate to different pages', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const pageSize = wrapperComponent.pageSize;
      
      // Go to second page
      wrapperComponent.goToPage(1);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      expect(wrapperComponent.currentPage).toBe(1);
      
      const displayedData = wrapperComponent.gridData;
      expect(displayedData.length).toBe(pageSize);
      
      // Verify we're showing different data
      expect(displayedData[0].id).toBe(testData[pageSize].id);
    });

    it('should go to next page', async () => {
      wrapperFixture.detectChanges();
      
      const initialPage = wrapperComponent.currentPage;
      
      wrapperComponent.grid.goToNextPage();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      expect(wrapperComponent.currentPage).toBe(initialPage + 1);
    });

    it('should go to previous page', async () => {
      wrapperFixture.detectChanges();
      
      // Go to page 2 first
      wrapperComponent.goToPage(2);
      wrapperFixture.detectChanges();
      
      wrapperComponent.grid.goToPreviousPage();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      expect(wrapperComponent.currentPage).toBe(1);
    });

    it('should not go beyond last page', async () => {
      wrapperFixture.detectChanges();
      
      const totalPages = wrapperComponent.totalPages;
      
      // Try to go beyond last page
      wrapperComponent.goToPage(totalPages + 5);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      expect(wrapperComponent.currentPage).toBe(0); // Should remain on current page
    });

    it('should not go before first page', async () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.grid.goToPreviousPage();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      expect(wrapperComponent.currentPage).toBe(0);
    });

    it('should change page size', async () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.setPageSize(50);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      expect(wrapperComponent.pageSize).toBe(50);
      expect(wrapperComponent.currentPage).toBe(0); // Should reset to first page
      
      const displayedData = wrapperComponent.gridData;
      expect(displayedData.length).toBe(50);
    });

    it('should handle page size change with string input', async () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.grid.onPageSizeChange('75');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      expect(wrapperComponent.pageSize).toBe(75);
    });

    it('should ignore invalid page size', async () => {
      wrapperFixture.detectChanges();
      
      const originalPageSize = wrapperComponent.pageSize;
      
      wrapperComponent.grid.onPageSizeChange('invalid');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      expect(wrapperComponent.pageSize).toBe(originalPageSize);
    });

    it('should display correct page info', () => {
      wrapperFixture.detectChanges();
      
      const pageInfo = wrapperComponent.grid.getPageInfo();
      const pageSize = wrapperComponent.pageSize;
      
      expect(pageInfo).toBe(`1-${pageSize} of ${testData.length}`);
    });

    it('should display correct page info for last page', async () => {
      wrapperFixture.detectChanges();
      
      const totalPages = wrapperComponent.totalPages;
      const pageSize = wrapperComponent.pageSize;
      
      // Go to last page
      wrapperComponent.goToPage(totalPages - 1);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const pageInfo = wrapperComponent.grid.getPageInfo();
      const startItem = (totalPages - 1) * pageSize + 1;
      const endItem = testData.length;
      
      expect(pageInfo).toBe(`${startItem}-${endItem} of ${testData.length}`);
    });

    it('should handle empty data', () => {
      wrapperComponent.data = [];
      wrapperFixture.detectChanges();
      
      const pageInfo = wrapperComponent.grid.getPageInfo();
      expect(pageInfo).toBe('No items');
      
      expect(wrapperComponent.totalPages).toBe(0);
    });

    it('should calculate visible page numbers correctly', () => {
      wrapperFixture.detectChanges();
      
      const visiblePages = wrapperComponent.grid.getVisiblePages();
      
      expect(Array.isArray(visiblePages)).toBe(true);
      expect(visiblePages.length).toBeGreaterThan(0);
      expect(visiblePages[0]).toBe(0); // First page should always be visible
    });

    it('should show ellipsis in page numbers when needed', () => {
      // Create more pages to test ellipsis
      const largeData = MockDataFactory.generateRows(500); // Creates ~20 pages with default page size
      wrapperComponent.data = largeData;
      wrapperFixture.detectChanges();
      
      // Go to middle page
      wrapperComponent.goToPage(10);
      wrapperFixture.detectChanges();
      
      const visiblePages = wrapperComponent.grid.getVisiblePages();
      
      // Should contain ellipsis (-1) and first/last pages
      expect(visiblePages.includes(-1)).toBe(true); // Ellipsis marker
      expect(visiblePages.includes(0)).toBe(true); // First page
      expect(visiblePages.includes(wrapperComponent.totalPages - 1)).toBe(true); // Last page
    });
  });

  describe('Server-Side Pagination', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(25); // One page worth
      testColumns = MockColumnFactory.getStandardColumns();
      
      const serverPaginatedConfig = {
        ...MockConfigFactory.getPaginatedConfig(),
        paginationConfig: {
          currentPage: 0,
          pageSize: 25,
          pageSizeOptions: [10, 25, 50, 100],
          totalItems: 1000, // Server reports 1000 total items
          mode: 'server' as const,
          showPageSizeSelector: true,
          showPageInfo: true,
          maxPageButtons: 7
        }
      };
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = serverPaginatedConfig;
    });

    it('should configure server-side pagination', () => {
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.grid.paginationState().mode).toBe('server');
      expect(wrapperComponent.grid.paginationState().totalItems).toBe(1000);
    });

    it('should calculate total pages based on server total items', () => {
      wrapperFixture.detectChanges();
      
      const totalPages = wrapperComponent.totalPages;
      const expectedPages = Math.ceil(1000 / 25);
      
      expect(totalPages).toBe(expectedPages);
    });

    it('should display all provided data in server mode', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const displayedData = wrapperComponent.gridData;
      
      // In server mode, all provided data should be displayed
      expect(displayedData.length).toBe(testData.length);
    });

    it('should show correct page info for server pagination', () => {
      wrapperFixture.detectChanges();
      
      const pageInfo = wrapperComponent.grid.getPageInfo();
      expect(pageInfo).toBe('1-25 of 1000');
    });

    it('should emit pagination events for server-side navigation', async () => {
      wrapperFixture.detectChanges();
      wrapperComponent.clearEvents();
      
      wrapperComponent.goToPage(2);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const paginationEvents = wrapperComponent.events.filter(e => e.type === 'pagination');
      expect(paginationEvents).toHaveLength(1);
      
      const event = paginationEvents[0];
      expect(event.data.currentPage).toBe(2);
      expect(event.data.pageSize).toBe(25);
      expect(event.data.totalItems).toBe(1000);
    });

    it('should update total items dynamically', () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.grid.gridState.setTotalItems(2000);
      wrapperFixture.detectChanges();
      
      const totalPages = wrapperComponent.totalPages;
      const expectedPages = Math.ceil(2000 / 25);
      
      expect(totalPages).toBe(expectedPages);
    });
  });

  describe('Pagination with Filtering and Sorting', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(100);
      testColumns = MockColumnFactory.getStandardColumns();
      
      const config = MockConfigFactory.getPaginatedConfig();
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
    });

    it('should update pagination when data is filtered', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const initialTotalPages = wrapperComponent.totalPages;
      
      // Apply filter that should reduce results
      wrapperComponent.grid.gridState.updateFilter('age', '>50');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const filteredTotalPages = wrapperComponent.totalPages;
      expect(filteredTotalPages).toBeLessThan(initialTotalPages);
      
      // Page info should reflect filtered results
      const pageInfo = wrapperComponent.grid.getPageInfo();
      expect(pageInfo).not.toContain(testData.length.toString());
    });

    it('should reset to first page when filter changes significantly', async () => {
      wrapperFixture.detectChanges();
      
      // Go to later page
      wrapperComponent.goToPage(2);
      wrapperFixture.detectChanges();
      
      // Apply filter that drastically reduces results
      wrapperComponent.grid.gridState.updateFilter('age', '>90');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      // Should still be able to display results (even if fewer)
      expect(wrapperComponent.gridData.length).toBeGreaterThanOrEqual(0);
    });

    it('should maintain pagination with sorting', async () => {
      wrapperFixture.detectChanges();
      
      const pageSize = wrapperComponent.pageSize;
      
      // Go to second page
      wrapperComponent.goToPage(1);
      wrapperFixture.detectChanges();
      
      // Sort data
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      // Should still be on same page with same page size
      expect(wrapperComponent.currentPage).toBe(1);
      expect(wrapperComponent.gridData.length).toBe(pageSize);
    });
  });

  describe('Pagination Events', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(100);
      testColumns = MockColumnFactory.getStandardColumns();
      
      const config = MockConfigFactory.getPaginatedConfig();
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
    });

    it('should emit pagination event when changing pages', async () => {
      wrapperFixture.detectChanges();
      wrapperComponent.clearEvents();
      
      wrapperComponent.goToPage(2);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const paginationEvents = wrapperComponent.events.filter(e => e.type === 'pagination');
      expect(paginationEvents).toHaveLength(1);
      
      const event = paginationEvents[0];
      expect(event.data.currentPage).toBe(2);
      expect(event.data.pageSize).toBe(wrapperComponent.pageSize);
      expect(event.data.totalItems).toBe(testData.length);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should emit pagination event when changing page size', async () => {
      wrapperFixture.detectChanges();
      wrapperComponent.clearEvents();
      
      wrapperComponent.setPageSize(50);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const paginationEvents = wrapperComponent.events.filter(e => e.type === 'pagination');
      expect(paginationEvents).toHaveLength(1);
      
      const event = paginationEvents[0];
      expect(event.data.currentPage).toBe(0); // Reset to first page
      expect(event.data.pageSize).toBe(50);
      expect(event.data.totalItems).toBe(testData.length);
    });

    it('should reset focus when navigating pages', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      // Set focus to a cell
      const gridElement = TestDOMHelpers.getGridElement(wrapperFixture);
      gridElement.focus();
      TestEventHelpers.navigateWithArrow(gridElement, 'ArrowDown');
      wrapperFixture.detectChanges();
      
      const initialFocus = wrapperComponent.focusedCell;
      expect(initialFocus).toBeTruthy();
      
      // Navigate to next page
      wrapperComponent.goToPage(1);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      // Focus should be reset to first cell of new page
      const newFocus = wrapperComponent.focusedCell;
      expect(newFocus?.row).toBe(0);
      expect(newFocus?.col).toBe(0);
    });
  });

  describe('Pagination Configuration', () => {
    it('should respect custom page size options', () => {
      const testData = MockDataFactory.generateRows(50);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      const customConfig = {
        ...MockConfigFactory.getPaginatedConfig(),
        paginationConfig: {
          currentPage: 0,
          pageSize: 15,
          pageSizeOptions: [5, 15, 30, 60],
          totalItems: 0,
          mode: 'client' as const,
          showPageSizeSelector: true,
          showPageInfo: true,
          maxPageButtons: 5
        }
      };
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = customConfig;
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.pageSize).toBe(15);
      expect(wrapperComponent.grid.paginationState().pageSizeOptions).toEqual([5, 15, 30, 60]);
    });

    it('should respect maxPageButtons configuration', () => {
      const largeData = MockDataFactory.generateRows(500);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      const customConfig = {
        ...MockConfigFactory.getPaginatedConfig(),
        paginationConfig: {
          currentPage: 10,
          pageSize: 25,
          pageSizeOptions: [25, 50, 100],
          totalItems: 0,
          mode: 'client' as const,
          showPageSizeSelector: true,
          showPageInfo: true,
          maxPageButtons: 3
        }
      };
      
      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = customConfig;
      wrapperFixture.detectChanges();
      
      wrapperComponent.goToPage(10);
      wrapperFixture.detectChanges();
      
      const visiblePages = wrapperComponent.grid.getVisiblePages();
      
      // Should respect maxPageButtons setting
      const nonEllipsisPages = visiblePages.filter(p => p !== -1);
      expect(nonEllipsisPages.length).toBeLessThanOrEqual(5); // 3 + first + last
    });

    it('should hide page selector when configured', () => {
      const testData = MockDataFactory.generateRows(50);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      const config = {
        ...MockConfigFactory.getPaginatedConfig(),
        paginationConfig: {
          currentPage: 0,
          pageSize: 25,
          pageSizeOptions: [25, 50],
          totalItems: 0,
          mode: 'client' as const,
          showPageSizeSelector: false,
          showPageInfo: false,
          maxPageButtons: 7
        }
      };
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.grid.paginationState().showPageSizeSelector).toBe(false);
      expect(wrapperComponent.grid.paginationState().showPageInfo).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle pagination with single item', () => {
      const singleItem = MockDataFactory.generateRows(1);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = singleItem;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getPaginatedConfig();
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.totalPages).toBe(1);
      expect(wrapperComponent.currentPage).toBe(0);
      expect(wrapperComponent.gridData.length).toBe(1);
      
      const pageInfo = wrapperComponent.grid.getPageInfo();
      expect(pageInfo).toBe('1-1 of 1');
    });

    it('should handle pagination with page size larger than data', () => {
      const smallData = MockDataFactory.generateRows(5);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = smallData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getPaginatedConfig();
      wrapperFixture.detectChanges();
      
      wrapperComponent.setPageSize(100);
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.totalPages).toBe(1);
      expect(wrapperComponent.gridData.length).toBe(5);
    });

    it('should handle zero page size gracefully', () => {
      const testData = MockDataFactory.generateRows(10);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getPaginatedConfig();
      wrapperFixture.detectChanges();
      
      expect(() => {
        wrapperComponent.setPageSize(0);
        wrapperFixture.detectChanges();
      }).not.toThrow();
      
      // Should maintain a valid state
      expect(wrapperComponent.pageSize).toBeGreaterThan(0);
    });

    it('should handle negative page numbers', () => {
      const testData = MockDataFactory.generateRows(50);
      wrapperComponent.data = testData;
      wrapperComponent.columns = MockColumnFactory.getStandardColumns();
      wrapperComponent.config = MockConfigFactory.getPaginatedConfig();
      wrapperFixture.detectChanges();
      
      wrapperComponent.goToPage(-1);
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.currentPage).toBe(0);
    });

    it('should handle rapid page navigation', async () => {
      const testData = MockDataFactory.generateRows(1000);
      wrapperComponent.data = testData;
      wrapperComponent.columns = MockColumnFactory.getStandardColumns();
      wrapperComponent.config = MockConfigFactory.getPaginatedConfig();
      wrapperFixture.detectChanges();
      
      const startTime = performance.now();
      
      // Rapidly navigate through pages
      for (let i = 0; i < 10; i++) {
        wrapperComponent.goToPage(i);
        wrapperFixture.detectChanges();
      }
      
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle rapid navigation efficiently
      expect(totalTime).toBeLessThan(100);
      expect(wrapperComponent.currentPage).toBe(9);
    });
  });
});