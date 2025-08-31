import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, signal } from '@angular/core';
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
  TestAsyncHelpers,
  TestPerformanceHelpers,
  customMatchers
} from '../../test-utilities/test-utils';

// Add custom matchers
beforeAll(() => {
  expect.extend(customMatchers);
});

describe('Grid Component - Comprehensive Tests', () => {
  let component: Grid;
  let fixture: ComponentFixture<Grid>;
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

    // Create standalone grid component
    fixture = TestBed.createComponent(Grid);
    component = fixture.componentInstance;
    gridStateService = TestBed.inject(GridStateService);

    // Create wrapper component for integration tests
    wrapperFixture = TestBed.createComponent(TestGridWrapperComponent);
    wrapperComponent = wrapperFixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
    wrapperFixture?.destroy();
    gridStateService?.reset();
  });

  describe('Component Creation and Initialization', () => {
    it('should create the grid component', () => {
      expect(component).toBeTruthy();
      expect(component).toBeInstanceOf(Grid);
    });

    it('should initialize with default configuration', () => {
      fixture.detectChanges();
      
      const config = component.gridConfig();
      expect(config.rowHeight).toBe(40);
      expect(config.virtualScrolling).toBe(true);
      expect(config.sortable).toBe(true);
      expect(config.filterable).toBe(true);
      expect(config.selectable).toBe(true);
      expect(config.selectionMode).toBe('multiple');
    });

    it('should have correct ARIA attributes', () => {
      fixture.detectChanges();
      
      const gridElement = fixture.debugElement.nativeElement;
      expect(gridElement.getAttribute('role')).toBe('grid');
      expect(gridElement.getAttribute('tabindex')).toBe('0');
      expect(gridElement.getAttribute('aria-label')).toBe('Data Grid');
    });

    it('should inject GridStateService', () => {
      expect(component.gridState).toBeTruthy();
      expect(component.gridState).toBe(gridStateService);
    });
  });

  describe('Data Binding', () => {
    it('should accept and display data', async () => {
      const testData = MockDataFactory.generateRows(5);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      expect(wrapperComponent.gridData).toEqual(testData);
      expect(wrapperFixture).toHaveRows(5);
      expect(wrapperFixture).toHaveColumns(testColumns.length);
    });

    it('should handle empty data gracefully', () => {
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = [];
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.gridData).toEqual([]);
      expect(wrapperFixture).toHaveRows(0);
      expect(wrapperFixture).toHaveColumns(testColumns.length);
    });

    it('should handle null/undefined data', () => {
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = null as any;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.gridData).toEqual([]);
    });

    it('should update when data changes', async () => {
      const initialData = MockDataFactory.generateRows(3);
      const updatedData = MockDataFactory.generateRows(7);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = initialData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      expect(wrapperFixture).toHaveRows(3);
      
      wrapperComponent.data = updatedData;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      expect(wrapperFixture).toHaveRows(7);
    });
  });

  describe('Column Configuration', () => {
    it('should display columns based on configuration', () => {
      const testData = MockDataFactory.generateRows(1);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      const headers = TestDOMHelpers.getHeaderElements(wrapperFixture);
      expect(headers).toHaveLength(testColumns.length);
      
      testColumns.forEach((column, index) => {
        expect(headers[index].textContent?.trim()).toBe(column.header);
      });
    });

    it('should hide columns when visible is false', () => {
      const testData = MockDataFactory.generateRows(1);
      const testColumns = MockColumnFactory.getStandardColumns();
      testColumns[1].visible = false;
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      expect(wrapperFixture).toHaveColumns(testColumns.length - 1);
    });

    it('should apply column widths', () => {
      const testData = MockDataFactory.generateRows(1);
      const testColumns = MockColumnFactory.getStandardColumns();
      testColumns[0].width = 200;
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, testColumns[0].id);
      expect(headerElement?.style.width).toContain('200');
    });

    it('should update columns when configuration changes', () => {
      const testData = MockDataFactory.generateRows(1);
      const initialColumns = MockColumnFactory.getStandardColumns().slice(0, 3);
      const updatedColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = initialColumns;
      wrapperFixture.detectChanges();
      
      expect(wrapperFixture).toHaveColumns(3);
      
      wrapperComponent.columns = updatedColumns;
      wrapperFixture.detectChanges();
      
      expect(wrapperFixture).toHaveColumns(updatedColumns.length);
    });
  });

  describe('Grid Configuration', () => {
    it('should apply custom row height', () => {
      const testConfig = { ...MockConfigFactory.getDefaultConfig(), rowHeight: 60 };
      
      component.config = testConfig;
      fixture.detectChanges();
      
      expect(component.itemSize()).toBe(60);
    });

    it('should apply selection mode configuration', () => {
      const singleConfig = MockConfigFactory.getSingleSelectionConfig();
      
      wrapperComponent.config = singleConfig;
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.grid.gridConfig().selectionMode).toBe('single');
    });

    it('should apply virtual scrolling configuration', () => {
      const virtualConfig = MockConfigFactory.getVirtualScrollingConfig();
      
      wrapperComponent.config = virtualConfig;
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.grid.gridConfig().virtualScrolling).toBe(true);
    });

    it('should enable/disable features based on configuration', () => {
      const customConfig = {
        ...MockConfigFactory.getDefaultConfig(),
        sortable: false,
        filterable: false,
        selectable: false
      };
      
      wrapperComponent.config = customConfig;
      wrapperFixture.detectChanges();
      
      const config = wrapperComponent.grid.gridConfig();
      expect(config.sortable).toBe(false);
      expect(config.filterable).toBe(false);
      expect(config.selectable).toBe(false);
    });
  });

  describe('Cell Value Display', () => {
    it('should display cell values correctly', () => {
      const testData = [{
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        age: 30
      }];
      const testColumns = MockColumnFactory.getStandardColumns().slice(0, 4);
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      expect(wrapperFixture).toCellContainText(0, 'id', '1');
      expect(wrapperFixture).toCellContainText(0, 'firstName', 'John');
      expect(wrapperFixture).toCellContainText(0, 'lastName', 'Doe');
      expect(wrapperFixture).toCellContainText(0, 'age', '30');
    });

    it('should handle null and undefined values', () => {
      const testData = [{
        id: 1,
        firstName: null,
        lastName: undefined,
        age: 0
      }];
      const testColumns = MockColumnFactory.getStandardColumns().slice(0, 4);
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      expect(wrapperFixture).toCellContainText(0, 'firstName', '');
      expect(wrapperFixture).toCellContainText(0, 'lastName', '');
      expect(wrapperFixture).toCellContainText(0, 'age', '0');
    });

    it('should format values based on column type', () => {
      const testData = [{
        id: 1,
        salary: 50000,
        hireDate: new Date('2023-01-15'),
        active: true
      }];
      const testColumns = [
        { id: 'id', field: 'id', header: 'ID', type: 'number' as const },
        { id: 'salary', field: 'salary', header: 'Salary', type: 'number' as const },
        { id: 'hireDate', field: 'hireDate', header: 'Hire Date', type: 'date' as const },
        { id: 'active', field: 'active', header: 'Active', type: 'boolean' as const }
      ];
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      // Note: These assertions depend on the actual formatCellValue implementation
      const salaryCell = TestDOMHelpers.getCellElement(wrapperFixture, 0, 'salary');
      const activeCell = TestDOMHelpers.getCellElement(wrapperFixture, 0, 'active');
      
      expect(salaryCell?.textContent?.trim()).toContain('50');
      expect(activeCell?.textContent?.trim()).toBe('Yes');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const testData = MockDataFactory.generateRows(3);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      const gridElement = TestDOMHelpers.getGridElement(wrapperFixture);
      
      expect(gridElement.getAttribute('aria-rowcount')).toBe('3');
      expect(gridElement.getAttribute('aria-colcount')).toBe(testColumns.length.toString());
    });

    it('should be keyboard accessible', async () => {
      const testData = MockDataFactory.generateRows(3);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const gridElement = TestDOMHelpers.getGridElement(wrapperFixture);
      
      // Focus the grid
      gridElement.focus();
      expect(document.activeElement).toBe(gridElement);
      
      // Test keyboard navigation
      TestEventHelpers.navigateWithArrow(gridElement, 'ArrowDown');
      wrapperFixture.detectChanges();
      
      const focusedCell = wrapperComponent.grid.focusedCell();
      expect(focusedCell).toBeTruthy();
    });

    it('should support screen reader navigation', () => {
      const testData = MockDataFactory.generateRows(2);
      const testColumns = MockColumnFactory.getStandardColumns().slice(0, 3);
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      // Check that cells have proper roles and attributes
      const cells = TestDOMHelpers.getCellElements(wrapperFixture);
      cells.forEach(cell => {
        expect(cell.getAttribute('role')).toBe('gridcell');
      });
    });
  });

  describe('Event Handling', () => {
    it('should emit gridEvent on various interactions', async () => {
      const testData = MockDataFactory.generateRows(2);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      // Test cell click event
      const cellElement = TestDOMHelpers.getCellElement(wrapperFixture, 0, 'firstName');
      TestEventHelpers.click(cellElement!);
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.events.length).toBeGreaterThan(0);
      expect(wrapperComponent.getLastEvent()?.type).toBe('cell-click');
    });

    it('should emit specific event types', async () => {
      const testData = MockDataFactory.generateRows(2);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = { ...MockConfigFactory.getDefaultConfig(), selectable: true };
      wrapperFixture.detectChanges();
      
      // Test cell click
      const cellElement = TestDOMHelpers.getCellElement(wrapperFixture, 0, 'firstName');
      TestEventHelpers.click(cellElement!);
      wrapperFixture.detectChanges();
      
      expect(wrapperComponent.cellClickEvents.length).toBe(1);
      expect(wrapperComponent.cellClickEvents[0].type).toBe('cell-click');
    });

    it('should provide event data with correct structure', async () => {
      const testData = MockDataFactory.generateRows(1);
      const testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperFixture.detectChanges();
      
      const cellElement = TestDOMHelpers.getCellElement(wrapperFixture, 0, 'firstName');
      TestEventHelpers.click(cellElement!);
      wrapperFixture.detectChanges();
      
      const lastEvent = wrapperComponent.getLastEvent('cell-click');
      expect(lastEvent).toBeTruthy();
      expect(lastEvent!.data).toHaveProperty('rowIndex', 0);
      expect(lastEvent!.data).toHaveProperty('columnId', 'firstName');
      expect(lastEvent!.data).toHaveProperty('value');
      expect(lastEvent!.data).toHaveProperty('rowData');
      expect(lastEvent!.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeData = MockDataFactory.generateRows(1000);
      const testColumns = MockColumnFactory.getStandardColumns();
      const config = MockConfigFactory.getVirtualScrollingConfig();
      
      const { time } = await TestPerformanceHelpers.measureTime(async () => {
        wrapperComponent.data = largeData;
        wrapperComponent.columns = testColumns;
        wrapperComponent.config = config;
        wrapperFixture.detectChanges();
        await TestAsyncHelpers.waitForStable(wrapperFixture);
      });
      
      // Should render large dataset in reasonable time (< 100ms)
      expect(time).toBeLessThan(100);
    });

    it('should maintain good virtual scroll performance', async () => {
      const largeData = MockDataFactory.generateRows(10000);
      const testColumns = MockColumnFactory.getStandardColumns();
      const config = MockConfigFactory.getVirtualScrollingConfig();
      
      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const scrollTimes = await TestPerformanceHelpers.measureScrollPerformance(wrapperFixture, 5);
      const averageTime = scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;
      
      // Average scroll time should be reasonable (< 16ms for 60fps)
      expect(averageTime).toBeLessThan(16);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed data gracefully', () => {
      const malformedData = [null, undefined, { invalidStructure: true }];
      const testColumns = MockColumnFactory.getStandardColumns();
      
      expect(() => {
        wrapperComponent.data = malformedData as any;
        wrapperComponent.columns = testColumns;
        wrapperFixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle missing column fields gracefully', () => {
      const testData = [{ id: 1, name: 'Test' }]; // Missing fields from column definitions
      const testColumns = MockColumnFactory.getStandardColumns();
      
      expect(() => {
        wrapperComponent.data = testData;
        wrapperComponent.columns = testColumns;
        wrapperFixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle invalid column configurations', () => {
      const testData = MockDataFactory.generateRows(1);
      const invalidColumns = [{ id: '', field: '', header: '' }] as any;
      
      expect(() => {
        wrapperComponent.data = testData;
        wrapperComponent.columns = invalidColumns;
        wrapperFixture.detectChanges();
      }).not.toThrow();
    });
  });
});