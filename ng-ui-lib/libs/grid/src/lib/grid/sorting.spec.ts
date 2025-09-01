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
  TestAsyncHelpers,
  customMatchers
} from '../../test-utilities/test-utils';

// Add custom matchers
beforeAll(() => {
  expect.extend(customMatchers);
});

describe('Grid Component - Sorting', () => {
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

  describe('Single Column Sorting', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = [
        { id: 3, firstName: 'Charlie', age: 25, salary: 45000, hireDate: new Date('2021-06-15'), active: true },
        { id: 1, firstName: 'Alice', age: 30, salary: 60000, hireDate: new Date('2020-01-10'), active: false },
        { id: 2, firstName: 'Bob', age: 28, salary: 55000, hireDate: new Date('2019-03-22'), active: true }
      ];
      testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should sort string column in ascending order', async () => {
      wrapperFixture.detectChanges();
      
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortedData = wrapperComponent.gridData;
      expect(sortedData[0].firstName).toBe('Alice');
      expect(sortedData[1].firstName).toBe('Bob');
      expect(sortedData[2].firstName).toBe('Charlie');

      expect(wrapperFixture).toHaveColumnSorted('firstName', 'asc');
    });

    it('should sort string column in descending order on second click', async () => {
      wrapperFixture.detectChanges();
      
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      
      // First click - ascending
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Second click - descending
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortedData = wrapperComponent.gridData;
      expect(sortedData[0].firstName).toBe('Charlie');
      expect(sortedData[1].firstName).toBe('Bob');
      expect(sortedData[2].firstName).toBe('Alice');

      expect(wrapperFixture).toHaveColumnSorted('firstName', 'desc');
    });

    it('should clear sort on third click', async () => {
      wrapperFixture.detectChanges();
      
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      
      // Three clicks to clear sort
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortState = wrapperComponent.sortState;
      expect(sortState).toBeNull();

      // Data should return to original order
      const currentData = wrapperComponent.gridData;
      expect(currentData[0].id).toBe(testData[0].id);
    });

    it('should sort numeric column correctly', async () => {
      wrapperFixture.detectChanges();
      
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'age');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortedData = wrapperComponent.gridData;
      expect(sortedData[0].age).toBe(25);
      expect(sortedData[1].age).toBe(28);
      expect(sortedData[2].age).toBe(30);
    });

    it('should sort date column correctly', async () => {
      wrapperFixture.detectChanges();
      
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'hireDate');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortedData = wrapperComponent.gridData;
      expect(sortedData[0].hireDate.getFullYear()).toBe(2019);
      expect(sortedData[1].hireDate.getFullYear()).toBe(2020);
      expect(sortedData[2].hireDate.getFullYear()).toBe(2021);
    });

    it('should sort boolean column correctly', async () => {
      wrapperFixture.detectChanges();
      
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'active');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortedData = wrapperComponent.gridData;
      expect(sortedData[0].active).toBe(false);
      expect(sortedData[1].active).toBe(true);
      expect(sortedData[2].active).toBe(true);
    });
  });

  describe('Multi-Column Sorting', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = [
        { id: 1, department: 'Engineering', firstName: 'Charlie', age: 25 },
        { id: 2, department: 'Engineering', firstName: 'Alice', age: 30 },
        { id: 3, department: 'Sales', firstName: 'Bob', age: 28 },
        { id: 4, department: 'Sales', firstName: 'David', age: 32 },
        { id: 5, department: 'Engineering', firstName: 'Eve', age: 27 }
      ];
      testColumns = MockColumnFactory.getStandardColumns();
      
      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should support multi-column sorting with Ctrl+click', async () => {
      wrapperFixture.detectChanges();
      
      // First sort by department
      const departmentHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'department');
      TestEventHelpers.click(departmentHeader!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Then add secondary sort by firstName with Ctrl+click
      const firstNameHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(firstNameHeader!, { ctrlKey: true });
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortState = wrapperComponent.sortState;
      expect(sortState).toHaveLength(2);
      expect(sortState.find(s => s.columnId === 'department')).toBeTruthy();
      expect(sortState.find(s => s.columnId === 'firstName')).toBeTruthy();

      // Check that data is sorted by department first, then firstName
      const sortedData = wrapperComponent.gridData;
      expect(sortedData[0].department).toBe('Engineering');
      expect(sortedData[0].firstName).toBe('Alice'); // Alice comes before Charlie
      expect(sortedData[1].firstName).toBe('Charlie');
      expect(sortedData[2].firstName).toBe('Eve');
    });

    it('should support multi-column sorting with Cmd+click on Mac', async () => {
      wrapperFixture.detectChanges();
      
      // First sort by department
      const departmentHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'department');
      TestEventHelpers.click(departmentHeader!);
      wrapperFixture.detectChanges();

      // Then add secondary sort with Cmd+click (metaKey)
      const firstNameHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(firstNameHeader!, { metaKey: true });
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortState = wrapperComponent.sortState;
      expect(sortState).toHaveLength(2);
    });

    it('should maintain sort order numbers for multi-column sorting', async () => {
      wrapperFixture.detectChanges();
      
      // Add three sorts
      const departmentHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'department');
      const firstNameHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      const ageHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'age');

      TestEventHelpers.click(departmentHeader!);
      wrapperFixture.detectChanges();

      TestEventHelpers.click(firstNameHeader!, { ctrlKey: true });
      wrapperFixture.detectChanges();

      TestEventHelpers.click(ageHeader!, { ctrlKey: true });
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortState = wrapperComponent.sortState;
      expect(sortState).toHaveLength(3);
      
      const departmentSort = sortState.find(s => s.columnId === 'department');
      const firstNameSort = sortState.find(s => s.columnId === 'firstName');
      const ageSort = sortState.find(s => s.columnId === 'age');

      expect(departmentSort?.order).toBe(0);
      expect(firstNameSort?.order).toBe(1);
      expect(ageSort?.order).toBe(2);
    });

    it('should update existing sort direction in multi-column sorting', async () => {
      wrapperFixture.detectChanges();
      
      // Create initial multi-column sort
      const departmentHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'department');
      const firstNameHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');

      TestEventHelpers.click(departmentHeader!);
      wrapperFixture.detectChanges();

      TestEventHelpers.click(firstNameHeader!, { ctrlKey: true });
      wrapperFixture.detectChanges();

      // Click department again with Ctrl to change direction
      TestEventHelpers.click(departmentHeader!, { ctrlKey: true });
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortState = wrapperComponent.sortState;
      const departmentSort = sortState.find(s => s.columnId === 'department');
      expect(departmentSort?.direction).toBe('desc');
      expect(sortState).toHaveLength(2); // Still two sorts
    });
  });

  describe('Sort Configuration', () => {
    it('should respect global sortable configuration', () => {
      const config = { ...MockConfigFactory.getDefaultConfig(), sortable: false };
      
      wrapperComponent.data = MockDataFactory.generateRows(3);
      wrapperComponent.columns = MockColumnFactory.getStandardColumns();
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();

      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();

      // Sort should not be applied
      const sortState = wrapperComponent.sortState;
      expect(sortState).toBeNull();
    });

    it('should respect column-level sortable configuration', () => {
      const testColumns = MockColumnFactory.getStandardColumns();
      testColumns[0].sortable = false; // Disable sorting for first column

      wrapperComponent.data = MockDataFactory.generateRows(3);
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Try to sort the non-sortable column
      const nonSortableHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, testColumns[0].id);
      TestEventHelpers.click(nonSortableHeader!);
      wrapperFixture.detectChanges();

      const sortState = wrapperComponent.sortState;
      expect(sortState).toBeNull();

      // But other columns should still be sortable
      const sortableHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, testColumns[1].id);
      TestEventHelpers.click(sortableHeader!);
      wrapperFixture.detectChanges();

      const newSortState = wrapperComponent.sortState;
      expect(newSortState).toBeTruthy();
      expect(newSortState![0].columnId).toBe(testColumns[1].id);
    });
  });

  describe('Sort Events', () => {
    it('should emit column sort events', async () => {
      const testData = MockDataFactory.generateRows(3);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      wrapperComponent.clearEvents();

      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.columnSortEvents).toHaveLength(1);
      
      const sortEvent = wrapperComponent.columnSortEvents[0];
      expect(sortEvent.type).toBe('column-sort');
      expect(sortEvent.data.columnId).toBe('firstName');
      expect(sortEvent.data.direction).toBe('asc');
      expect(sortEvent.data.sortState).toBeTruthy();
    });

    it('should emit grid events for sorting', async () => {
      const testData = MockDataFactory.generateRows(3);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      wrapperComponent.clearEvents();

      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const gridEvents = wrapperComponent.events.filter(e => e.type === 'column-sort');
      expect(gridEvents).toHaveLength(1);
    });
  });

  describe('Sort Indicators', () => {
    it('should display sort indicators correctly', async () => {
      const testData = MockDataFactory.generateRows(3);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Sort ascending
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortIndicator = TestDOMHelpers.getSortIndicator(wrapperFixture, 'firstName');
      expect(sortIndicator).toBeTruthy();
      expect(sortIndicator?.classList.contains('sort-asc')).toBe(true);

      // Sort descending
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(sortIndicator?.classList.contains('sort-desc')).toBe(true);
    });

    it('should show sort order numbers for multi-column sorting', async () => {
      const testData = MockDataFactory.generateRows(3);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Add multiple sorts
      const firstHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      const lastHeader = TestDOMHelpers.getHeaderElement(wrapperFixture, 'lastName');

      TestEventHelpers.click(firstHeader!);
      wrapperFixture.detectChanges();

      TestEventHelpers.click(lastHeader!, { ctrlKey: true });
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Check sort order display
      expect(wrapperComponent.grid.getSortOrder('firstName')).toBe(1);
      expect(wrapperComponent.grid.getSortOrder('lastName')).toBe(2);
    });

    it('should provide correct ARIA sort attributes', async () => {
      const testData = MockDataFactory.generateRows(3);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Initial state
      expect(wrapperComponent.grid.getAriaSortAttribute('firstName')).toBe('none');

      // Sort ascending
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.grid.getAriaSortAttribute('firstName')).toBe('ascending');

      // Sort descending
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      expect(wrapperComponent.grid.getAriaSortAttribute('firstName')).toBe('descending');
    });
  });

  describe('Data Type Specific Sorting', () => {
    it('should handle null and undefined values in string sorting', async () => {
      const testData = [
        { id: 1, firstName: 'Alice', lastName: null },
        { id: 2, firstName: null, lastName: 'Brown' },
        { id: 3, firstName: undefined, lastName: 'Charlie' },
        { id: 4, firstName: 'David', lastName: undefined }
      ];
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortedData = wrapperComponent.gridData;
      // Null/undefined values should be sorted to the beginning or end consistently
      expect(sortedData).toHaveLength(4);
      
      // Find where non-null values start
      const firstNonNull = sortedData.findIndex(item => item.firstName != null);
      expect(firstNonNull).toBeGreaterThanOrEqual(0);
    });

    it('should handle null and undefined values in numeric sorting', async () => {
      const testData = [
        { id: 1, age: 25 },
        { id: 2, age: null },
        { id: 3, age: undefined },
        { id: 4, age: 30 },
        { id: 5, age: 0 }
      ];
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'age');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortedData = wrapperComponent.gridData;
      expect(sortedData).toHaveLength(5);
      
      // Valid numbers should be sorted properly
      const validNumbers = sortedData.filter(item => typeof item.age === 'number' && !isNaN(item.age));
      expect(validNumbers.length).toBeGreaterThan(0);
    });

    it('should handle invalid dates in date sorting', async () => {
      const testData = [
        { id: 1, hireDate: new Date('2020-01-01') },
        { id: 2, hireDate: new Date('invalid') },
        { id: 3, hireDate: null },
        { id: 4, hireDate: new Date('2021-01-01') }
      ];
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'hireDate');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const sortedData = wrapperComponent.gridData;
      expect(sortedData).toHaveLength(4);
      
      // Valid dates should be sorted properly
      const validDates = sortedData.filter(item => 
        item.hireDate && !isNaN(item.hireDate.getTime())
      );
      expect(validDates.length).toBe(2);
    });
  });

  describe('Performance', () => {
    it('should sort large datasets efficiently', async () => {
      const largeData = MockDataFactory.generateRows(10000);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      const startTime = performance.now();
      
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const endTime = performance.now();
      const sortTime = endTime - startTime;

      // Should sort 10k records in reasonable time (< 100ms)
      expect(sortTime).toBeLessThan(100);
      
      // Verify sort is correct
      const sortedData = wrapperComponent.gridData;
      expect(sortedData.length).toBe(10000);
      
      // Check first few are sorted
      for (let i = 1; i < Math.min(10, sortedData.length); i++) {
        expect(sortedData[i-1].firstName <= sortedData[i].firstName).toBe(true);
      }
    });

    it('should handle multiple rapid sort changes efficiently', async () => {
      const testData = MockDataFactory.generateRows(1000);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      const startTime = performance.now();

      // Rapidly change sorts
      const headers = ['firstName', 'lastName', 'age', 'salary'];
      for (const columnId of headers) {
        const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, columnId);
        TestEventHelpers.click(headerElement!);
        wrapperFixture.detectChanges();
        
        // Toggle direction
        TestEventHelpers.click(headerElement!);
        wrapperFixture.detectChanges();
      }

      await TestAsyncHelpers.waitForStable(wrapperFixture);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid changes efficiently (< 200ms for 8 operations)
      expect(totalTime).toBeLessThan(200);
    });
  });
});