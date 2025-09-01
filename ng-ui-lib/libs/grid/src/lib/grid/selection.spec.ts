import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { Grid } from './grid';
import { GridStateService } from '@ng-ui/core';
import { TestGridWrapperComponent } from '../../test-utilities/test-grid-wrapper.component';
import {
  MockDataFactory,
  MockColumnFactory,
  MockConfigFactory,
  TestDOMHelpers,
  TestEventHelpers,
  TestAsyncHelpers
} from '../../test-utilities/test-utils';

describe('Grid Component - Selection', () => {
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

  describe('Single Row Selection', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(5);
      testColumns = MockColumnFactory.getStandardColumns();
      
      const singleSelectionConfig = MockConfigFactory.getSingleSelectionConfig();
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = singleSelectionConfig;
    });

    it('should select a single row by clicking', async () => {
      wrapperFixture.detectChanges();
      
      // Select first row
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(1);
      expect(wrapperComponent.selectedRows.has(0)).toBe(true);
      expect(wrapperComponent.grid.isRowSelected(0)).toBe(true);
    });

    it('should deselect row when clicked again', async () => {
      wrapperFixture.detectChanges();
      
      // Select then deselect
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(0);
      expect(wrapperComponent.grid.isRowSelected(0)).toBe(false);
    });

    it('should only allow one row selected in single mode', async () => {
      wrapperFixture.detectChanges();
      
      // Select first row
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      
      // Select second row (should deselect first)
      wrapperComponent.selectRow(1);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(1);
      expect(wrapperComponent.selectedRows.has(0)).toBe(false);
      expect(wrapperComponent.selectedRows.has(1)).toBe(true);
    });

    it('should emit row select events', async () => {
      wrapperFixture.detectChanges();
      wrapperComponent.clearEvents();
      
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.rowSelectEvents).toHaveLength(1);
      
      const selectEvent = wrapperComponent.rowSelectEvents[0];
      expect(selectEvent.type).toBe('row-select');
      expect(selectEvent.data.rowIndex).toBe(0);
      expect(selectEvent.data.selected).toBe(true);
      expect(selectEvent.data.rowData).toEqual(testData[0]);
    });
  });

  describe('Multiple Row Selection', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(8);
      testColumns = MockColumnFactory.getStandardColumns();
      
      const multipleSelectionConfig = MockConfigFactory.getDefaultConfig();
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = multipleSelectionConfig;
    });

    it('should allow multiple rows to be selected', async () => {
      wrapperFixture.detectChanges();
      
      // Select multiple rows
      wrapperComponent.selectRow(0);
      wrapperComponent.selectRow(2);
      wrapperComponent.selectRow(4);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(3);
      expect(wrapperComponent.selectedRows.has(0)).toBe(true);
      expect(wrapperComponent.selectedRows.has(2)).toBe(true);
      expect(wrapperComponent.selectedRows.has(4)).toBe(true);
    });

    it('should deselect individual rows in multiple mode', async () => {
      wrapperFixture.detectChanges();
      
      // Select multiple rows
      wrapperComponent.selectRow(0);
      wrapperComponent.selectRow(1);
      wrapperComponent.selectRow(2);
      wrapperFixture.detectChanges();

      // Deselect middle row
      wrapperComponent.selectRow(1);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(2);
      expect(wrapperComponent.selectedRows.has(0)).toBe(true);
      expect(wrapperComponent.selectedRows.has(1)).toBe(false);
      expect(wrapperComponent.selectedRows.has(2)).toBe(true);
    });

    it('should select all rows', async () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.grid.selectAllRows();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(testData.length);
      
      // Check all rows are selected
      for (let i = 0; i < testData.length; i++) {
        expect(wrapperComponent.selectedRows.has(i)).toBe(true);
      }
    });

    it('should clear all selections', async () => {
      wrapperFixture.detectChanges();
      
      // Select multiple rows first
      wrapperComponent.selectRow(0);
      wrapperComponent.selectRow(1);
      wrapperComponent.selectRow(2);
      wrapperFixture.detectChanges();

      // Clear all
      wrapperComponent.clearSelection();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(0);
    });

    it('should maintain selection across data updates', async () => {
      wrapperFixture.detectChanges();
      
      // Select some rows
      wrapperComponent.selectRow(0);
      wrapperComponent.selectRow(2);
      wrapperFixture.detectChanges();

      // Update data (keeping same structure)
      const updatedData = testData.map(item => ({ ...item, updated: true }));
      wrapperComponent.data = updatedData;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Selection should be maintained by index
      expect(wrapperComponent.selectedRows.size).toBe(2);
      expect(wrapperComponent.selectedRows.has(0)).toBe(true);
      expect(wrapperComponent.selectedRows.has(2)).toBe(true);
    });
  });

  describe('Keyboard Selection', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(5);
      testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should select row with Enter key', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const gridElement = TestDOMHelpers.getGridElement(wrapperFixture);
      
      // Focus grid and navigate to first cell
      gridElement.focus();
      TestEventHelpers.navigateWithArrow(gridElement, 'ArrowDown');
      wrapperFixture.detectChanges();

      // Select with Enter
      TestEventHelpers.pressEnter(gridElement);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(1);
      expect(wrapperComponent.selectedRows.has(0)).toBe(true);
    });

    it('should select row with Space key', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const gridElement = TestDOMHelpers.getGridElement(wrapperFixture);
      
      // Focus and navigate
      gridElement.focus();
      TestEventHelpers.navigateWithArrow(gridElement, 'ArrowDown');
      wrapperFixture.detectChanges();

      // Select with Space
      TestEventHelpers.keyPress(gridElement, ' ');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(1);
    });

    it('should navigate and select multiple rows with keyboard', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const gridElement = TestDOMHelpers.getGridElement(wrapperFixture);
      
      // Focus grid
      gridElement.focus();
      wrapperFixture.detectChanges();

      // Select first row
      TestEventHelpers.navigateWithArrow(gridElement, 'ArrowDown');
      TestEventHelpers.keyPress(gridElement, ' ');
      wrapperFixture.detectChanges();

      // Navigate and select second row
      TestEventHelpers.navigateWithArrow(gridElement, 'ArrowDown');
      TestEventHelpers.keyPress(gridElement, ' ');
      wrapperFixture.detectChanges();
      
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(2);
      expect(wrapperComponent.selectedRows.has(0)).toBe(true);
      expect(wrapperComponent.selectedRows.has(1)).toBe(true);
    });
  });

  describe('Selection Configuration', () => {
    it('should respect selectable configuration', async () => {
      const testData = MockDataFactory.generateRows(3);
      const testColumns = MockColumnFactory.getStandardColumns();
      const config = { ...MockConfigFactory.getDefaultConfig(), selectable: false };

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();

      // Try to select (should not work)
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(0);
    });

    it('should switch between selection modes correctly', async () => {
      const testData = MockDataFactory.generateRows(5);
      const testColumns = MockColumnFactory.getStandardColumns();

      // Start with multiple selection
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Select multiple rows
      wrapperComponent.selectRow(0);
      wrapperComponent.selectRow(1);
      wrapperFixture.detectChanges();
      expect(wrapperComponent.selectedRows.size).toBe(2);

      // Switch to single selection mode
      wrapperComponent.config = MockConfigFactory.getSingleSelectionConfig();
      wrapperFixture.detectChanges();

      // Try to select another row
      wrapperComponent.selectRow(2);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Should only have one row selected
      expect(wrapperComponent.selectedRows.size).toBe(1);
      expect(wrapperComponent.selectedRows.has(2)).toBe(true);
    });
  });

  describe('Selection Events', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(5);
      testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should emit row select events with correct data', async () => {
      wrapperFixture.detectChanges();
      wrapperComponent.clearEvents();

      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.rowSelectEvents).toHaveLength(1);
      
      const event = wrapperComponent.rowSelectEvents[0];
      expect(event.type).toBe('row-select');
      expect(event.data.rowIndex).toBe(0);
      expect(event.data.selected).toBe(true);
      expect(event.data.rowData).toEqual(testData[0]);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should emit events for deselection', async () => {
      wrapperFixture.detectChanges();
      
      // Select then deselect
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      
      wrapperComponent.clearEvents();
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.rowSelectEvents).toHaveLength(1);
      
      const event = wrapperComponent.rowSelectEvents[0];
      expect(event.data.selected).toBe(false);
    });

    it('should emit grid events for selection', async () => {
      wrapperFixture.detectChanges();
      wrapperComponent.clearEvents();

      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const gridEvents = wrapperComponent.events.filter(e => e.type === 'row-select');
      expect(gridEvents).toHaveLength(1);
    });

    it('should emit multiple events for multiple selections', async () => {
      wrapperFixture.detectChanges();
      wrapperComponent.clearEvents();

      // Select multiple rows
      wrapperComponent.selectRow(0);
      wrapperComponent.selectRow(1);
      wrapperComponent.selectRow(2);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.rowSelectEvents).toHaveLength(3);
      
      // Check each event has correct row index
      expect(wrapperComponent.rowSelectEvents[0].data.rowIndex).toBe(0);
      expect(wrapperComponent.rowSelectEvents[1].data.rowIndex).toBe(1);
      expect(wrapperComponent.rowSelectEvents[2].data.rowIndex).toBe(2);
    });
  });

  describe('Selection Visual Indicators', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(5);
      testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should apply selected class to selected rows', async () => {
      wrapperFixture.detectChanges();
      
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const rows = TestDOMHelpers.getRowElements(wrapperFixture);
      expect(rows[0].classList.contains('selected')).toBe(true);
      expect(rows[1].classList.contains('selected')).toBe(false);
    });

    it('should update visual state when selection changes', async () => {
      wrapperFixture.detectChanges();
      
      // Select row
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();

      const rows = TestDOMHelpers.getRowElements(wrapperFixture);
      expect(rows[0].classList.contains('selected')).toBe(true);

      // Deselect row
      wrapperComponent.selectRow(0);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(rows[0].classList.contains('selected')).toBe(false);
    });

    it('should show selection indicators for multiple selected rows', async () => {
      wrapperFixture.detectChanges();
      
      // Select multiple rows
      wrapperComponent.selectRow(0);
      wrapperComponent.selectRow(2);
      wrapperComponent.selectRow(4);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const rows = TestDOMHelpers.getRowElements(wrapperFixture);
      expect(rows[0].classList.contains('selected')).toBe(true);
      expect(rows[1].classList.contains('selected')).toBe(false);
      expect(rows[2].classList.contains('selected')).toBe(true);
      expect(rows[3].classList.contains('selected')).toBe(false);
      expect(rows[4].classList.contains('selected')).toBe(true);
    });
  });

  describe('Selection with Virtual Scrolling', () => {
    let largeData: any[];
    let testColumns: any[];

    beforeEach(() => {
      largeData = MockDataFactory.generateRows(1000);
      testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getVirtualScrollingConfig();
    });

    it('should maintain selection with virtual scrolling', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      // Select some rows
      wrapperComponent.selectRow(5);
      wrapperComponent.selectRow(15);
      wrapperComponent.selectRow(25);
      wrapperFixture.detectChanges();

      expect(wrapperComponent.selectedRows.size).toBe(3);

      // Scroll to different position
      const viewport = TestDOMHelpers.getVirtualScrollViewport(wrapperFixture);
      wrapperComponent.grid.viewport.scrollToIndex(500);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Selection should be maintained
      expect(wrapperComponent.selectedRows.size).toBe(3);
      expect(wrapperComponent.selectedRows.has(5)).toBe(true);
      expect(wrapperComponent.selectedRows.has(15)).toBe(true);
      expect(wrapperComponent.selectedRows.has(25)).toBe(true);
    });

    it('should handle selection with large datasets efficiently', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const startTime = performance.now();

      // Select multiple rows
      for (let i = 0; i < 100; i += 10) {
        wrapperComponent.selectRow(i);
      }
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const endTime = performance.now();
      const selectionTime = endTime - startTime;

      // Should handle selection efficiently
      expect(selectionTime).toBeLessThan(50);
      expect(wrapperComponent.selectedRows.size).toBe(10);
    });
  });

  describe('Selection with Filtering and Sorting', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = MockDataFactory.generateRows(20);
      testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should maintain selection when data is filtered', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      // Select some rows
      wrapperComponent.selectRow(0);
      wrapperComponent.selectRow(5);
      wrapperComponent.selectRow(10);
      wrapperFixture.detectChanges();

      expect(wrapperComponent.selectedRows.size).toBe(3);

      // Apply filter
      wrapperComponent.grid.gridState.updateFilter('age', '>25');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Selection state should be maintained (by index)
      expect(wrapperComponent.selectedRows.size).toBe(3);
      expect(wrapperComponent.selectedRows.has(0)).toBe(true);
      expect(wrapperComponent.selectedRows.has(5)).toBe(true);
      expect(wrapperComponent.selectedRows.has(10)).toBe(true);
    });

    it('should maintain selection when data is sorted', async () => {
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      // Select some rows by original indices
      wrapperComponent.selectRow(0);
      wrapperComponent.selectRow(1);
      wrapperFixture.detectChanges();

      const selectedData = [testData[0], testData[1]];

      // Sort data
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Selection should be maintained by index, not by data identity
      expect(wrapperComponent.selectedRows.size).toBe(2);
      expect(wrapperComponent.selectedRows.has(0)).toBe(true);
      expect(wrapperComponent.selectedRows.has(1)).toBe(true);
    });

    it('should clear selection when requested', async () => {
      wrapperFixture.detectChanges();
      
      // Select multiple rows
      wrapperComponent.selectRow(0);
      wrapperComponent.selectRow(2);
      wrapperComponent.selectRow(4);
      wrapperFixture.detectChanges();

      expect(wrapperComponent.selectedRows.size).toBe(3);

      // Apply filter and sort
      wrapperComponent.grid.gridState.updateFilter('age', '>25');
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();

      // Clear selection
      wrapperComponent.clearSelection();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.selectedRows.size).toBe(0);
    });
  });

  describe('Selection Edge Cases', () => {
    it('should handle selection with empty data', () => {
      wrapperComponent.data = [];
      wrapperComponent.columns = MockColumnFactory.getStandardColumns();
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Try to select (should not crash)
      expect(() => {
        wrapperComponent.selectRow(0);
        wrapperFixture.detectChanges();
      }).not.toThrow();

      expect(wrapperComponent.selectedRows.size).toBe(0);
    });

    it('should handle selection with invalid indices', () => {
      const testData = MockDataFactory.generateRows(3);
      wrapperComponent.data = testData;
      wrapperComponent.columns = MockColumnFactory.getStandardColumns();
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Try to select invalid indices
      expect(() => {
        wrapperComponent.selectRow(-1);
        wrapperComponent.selectRow(100);
        wrapperFixture.detectChanges();
      }).not.toThrow();

      // Should add to selection set even if invalid (handled by grid state)
      expect(wrapperComponent.selectedRows.has(-1)).toBe(true);
      expect(wrapperComponent.selectedRows.has(100)).toBe(true);
    });

    it('should handle rapid selection changes', async () => {
      const testData = MockDataFactory.generateRows(100);
      wrapperComponent.data = testData;
      wrapperComponent.columns = MockColumnFactory.getStandardColumns();
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      const startTime = performance.now();

      // Rapid selection/deselection
      for (let i = 0; i < 50; i++) {
        wrapperComponent.selectRow(i % 10); // Toggle same 10 rows
        wrapperFixture.detectChanges();
      }

      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid changes efficiently
      expect(totalTime).toBeLessThan(100);
    });
  });
});