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
  TestAsyncHelpers
} from '../../test-utilities/test-utils';

describe('Grid Component - Filtering', () => {
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

  describe('String Filtering', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = [
        { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com' },
        { id: 2, firstName: 'Bob', lastName: 'Smith', email: 'bob@test.com' },
        { id: 3, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' },
        { id: 4, firstName: 'David', lastName: 'Wilson', email: 'david@company.org' },
        { id: 5, firstName: 'Eve', lastName: 'Davis', email: 'eve@example.com' }
      ];
      testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should filter by string contains (case insensitive)', async () => {
      wrapperFixture.detectChanges();

      // Apply filter
      wrapperComponent.grid.gridState.updateFilter('firstName', 'al');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(2); // Alice and Charlie
      expect(filteredData.find(item => item.firstName === 'Alice')).toBeTruthy();
      expect(filteredData.find(item => item.firstName === 'Charlie')).toBeTruthy();
    });

    it('should filter by exact string match', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('firstName', 'Alice');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].firstName).toBe('Alice');
    });

    it('should handle empty filter gracefully', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('firstName', '');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(testData.length);
    });

    it('should handle whitespace in filters', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('firstName', '  Alice  ');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].firstName).toBe('Alice');
    });

    it('should support filtering by multiple columns', async () => {
      wrapperFixture.detectChanges();

      // Filter by firstName and email domain
      wrapperComponent.grid.gridState.updateFilter('firstName', 'a'); // Alice, Charlie, David
      wrapperComponent.grid.gridState.updateFilter('email', 'example.com'); // Alice, Charlie, Eve
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(2); // Alice and Charlie (intersection)
      expect(filteredData.find(item => item.firstName === 'Alice')).toBeTruthy();
      expect(filteredData.find(item => item.firstName === 'Charlie')).toBeTruthy();
    });
  });

  describe('Numeric Filtering', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = [
        { id: 1, age: 25, salary: 45000 },
        { id: 2, age: 30, salary: 60000 },
        { id: 3, age: 28, salary: 55000 },
        { id: 4, age: 35, salary: 70000 },
        { id: 5, age: 22, salary: 40000 }
      ];
      testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should filter by exact numeric value', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('age', 30);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].age).toBe(30);
    });

    it('should filter by greater than operator', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('age', '>28');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(2); // 30 and 35
      expect(filteredData.every(item => item.age > 28)).toBe(true);
    });

    it('should filter by greater than or equal operator', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('age', '>=28');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(3); // 28, 30, and 35
      expect(filteredData.every(item => item.age >= 28)).toBe(true);
    });

    it('should filter by less than operator', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('age', '<28');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(2); // 25 and 22
      expect(filteredData.every(item => item.age < 28)).toBe(true);
    });

    it('should filter by less than or equal operator', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('age', '<=28');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(3); // 25, 28, and 22
      expect(filteredData.every(item => item.age <= 28)).toBe(true);
    });

    it('should handle invalid numeric filters gracefully', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('age', 'invalid');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(0); // No matches for invalid filter
    });

    it('should handle null and undefined values in numeric filtering', async () => {
      const dataWithNulls = [
        { id: 1, age: 25, salary: 45000 },
        { id: 2, age: null, salary: 60000 },
        { id: 3, age: undefined, salary: 55000 },
        { id: 4, age: 30, salary: null }
      ];

      wrapperComponent.data = dataWithNulls;
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('age', '>20');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      // Should only include rows with valid numeric values > 20
      expect(filteredData).toHaveLength(2);
      expect(filteredData.every(item => typeof item.age === 'number' && item.age > 20)).toBe(true);
    });
  });

  describe('Boolean Filtering', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = [
        { id: 1, active: true, verified: false },
        { id: 2, active: false, verified: true },
        { id: 3, active: true, verified: true },
        { id: 4, active: false, verified: false }
      ];
      testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should filter by boolean true value', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('active', 'true');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(2);
      expect(filteredData.every(item => item.active === true)).toBe(true);
    });

    it('should filter by boolean false value', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('active', 'false');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(2);
      expect(filteredData.every(item => item.active === false)).toBe(true);
    });

    it('should support alternative boolean representations', async () => {
      wrapperFixture.detectChanges();

      // Test 'yes' as true
      wrapperComponent.grid.gridState.updateFilter('active', 'yes');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      let filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(2);
      expect(filteredData.every(item => item.active === true)).toBe(true);

      // Test '1' as true
      wrapperComponent.grid.gridState.updateFilter('active', '1');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(2);
      expect(filteredData.every(item => item.active === true)).toBe(true);
    });
  });

  describe('Date Filtering', () => {
    let testData: any[];
    let testColumns: any[];

    beforeEach(() => {
      testData = [
        { id: 1, hireDate: new Date('2020-01-15'), birthDate: new Date('1990-05-20') },
        { id: 2, hireDate: new Date('2021-06-10'), birthDate: new Date('1985-12-03') },
        { id: 3, hireDate: new Date('2019-03-22'), birthDate: new Date('1992-08-14') },
        { id: 4, hireDate: new Date('2022-11-05'), birthDate: new Date('1988-02-28') }
      ];
      testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
    });

    it('should filter by exact date match', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('hireDate', '2020-01-15');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].hireDate.toDateString()).toBe(new Date('2020-01-15').toDateString());
    });

    it('should filter by date object', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('hireDate', new Date('2021-06-10'));
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].hireDate.toDateString()).toBe(new Date('2021-06-10').toDateString());
    });

    it('should handle invalid date filters gracefully', async () => {
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('hireDate', 'invalid-date');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      // Should fall back to string contains behavior
      expect(filteredData).toHaveLength(0);
    });

    it('should handle null and undefined dates', async () => {
      const dataWithNulls = [
        { id: 1, hireDate: new Date('2020-01-15') },
        { id: 2, hireDate: null },
        { id: 3, hireDate: undefined },
        { id: 4, hireDate: new Date('2021-06-10') }
      ];

      wrapperComponent.data = dataWithNulls;
      wrapperFixture.detectChanges();

      wrapperComponent.grid.gridState.updateFilter('hireDate', '2020');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].hireDate).toBeTruthy();
    });
  });

  describe('Filter Configuration', () => {
    it('should respect global filterable configuration', async () => {
      const config = { ...MockConfigFactory.getDefaultConfig(), filterable: false };
      const testData = MockDataFactory.generateRows(5);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = config;
      wrapperFixture.detectChanges();

      // Apply filter (should be ignored)
      wrapperComponent.grid.gridState.updateFilter('firstName', 'test');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // All data should still be visible
      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(testData.length);
    });

    it('should respect column-level filterable configuration', async () => {
      const testData = MockDataFactory.generateRows(5);
      const testColumns = MockColumnFactory.getStandardColumns();
      testColumns[0].filterable = false; // Disable filtering for first column

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Try to filter the non-filterable column (should not work)
      wrapperComponent.grid.gridState.updateFilter(testColumns[0].id, 'test');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      let filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(testData.length);

      // But other columns should still be filterable
      wrapperComponent.grid.gridState.updateFilter(testColumns[1].id, testData[0][testColumns[1].field]);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(1);
    });
  });

  describe('Filter State Management', () => {
    it('should maintain filter state correctly', async () => {
      const testData = MockDataFactory.generateRows(10);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Apply multiple filters
      wrapperComponent.grid.gridState.updateFilter('firstName', 'A');
      wrapperComponent.grid.gridState.updateFilter('age', '>25');
      wrapperFixture.detectChanges();

      const filterState = wrapperComponent.filterState;
      expect(filterState.firstName).toBe('A');
      expect(filterState.age).toBe('>25');
    });

    it('should clear individual filters', async () => {
      const testData = MockDataFactory.generateRows(10);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Apply filters
      wrapperComponent.grid.gridState.updateFilter('firstName', 'test');
      wrapperComponent.grid.gridState.updateFilter('age', '30');
      wrapperFixture.detectChanges();

      // Clear one filter
      wrapperComponent.grid.gridState.updateFilter('firstName', '');
      wrapperFixture.detectChanges();

      const filterState = wrapperComponent.filterState;
      expect(filterState.firstName).toBe('');
      expect(filterState.age).toBe('30');
    });

    it('should clear all filters', async () => {
      const testData = MockDataFactory.generateRows(10);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Apply filters
      wrapperComponent.grid.gridState.updateFilter('firstName', 'test');
      wrapperComponent.grid.gridState.updateFilter('age', '30');
      wrapperFixture.detectChanges();

      // Clear all filters
      wrapperComponent.grid.gridState.clearFilters();
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filterState = wrapperComponent.filterState;
      expect(Object.keys(filterState)).toHaveLength(0);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(testData.length);
    });
  });

  describe('Filter Performance', () => {
    it('should filter large datasets efficiently', async () => {
      const largeData = MockDataFactory.generateRows(10000);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      const startTime = performance.now();

      // Apply filter
      wrapperComponent.grid.gridState.updateFilter('firstName', 'A');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const endTime = performance.now();
      const filterTime = endTime - startTime;

      // Should filter 10k records in reasonable time (< 50ms)
      expect(filterTime).toBeLessThan(50);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData.length).toBeGreaterThan(0);
      expect(filteredData.length).toBeLessThan(largeData.length);
    });

    it('should handle multiple concurrent filters efficiently', async () => {
      const largeData = MockDataFactory.generateRows(5000);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = largeData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      const startTime = performance.now();

      // Apply multiple filters rapidly
      wrapperComponent.grid.gridState.updateFilter('firstName', 'A');
      wrapperComponent.grid.gridState.updateFilter('age', '>25');
      wrapperComponent.grid.gridState.updateFilter('department', 'Eng');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const endTime = performance.now();
      const filterTime = endTime - startTime;

      // Should handle multiple filters efficiently
      expect(filterTime).toBeLessThan(100);
    });

    it('should handle rapid filter changes efficiently', async () => {
      const testData = MockDataFactory.generateRows(1000);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      const startTime = performance.now();

      // Rapidly change filter values
      for (let i = 0; i < 10; i++) {
        wrapperComponent.grid.gridState.updateFilter('firstName', `test${i}`);
        wrapperFixture.detectChanges();
      }

      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid changes efficiently (< 100ms for 10 changes)
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('Filter Integration with Other Features', () => {
    it('should work correctly with sorting', async () => {
      const testData = MockDataFactory.generateRows(10);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Apply filter first
      wrapperComponent.grid.gridState.updateFilter('age', '>25');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredCount = wrapperComponent.gridData.length;
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThan(testData.length);

      // Then sort
      const headerElement = TestDOMHelpers.getHeaderElement(wrapperFixture, 'firstName');
      TestEventHelpers.click(headerElement!);
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Should maintain filter and apply sort
      const sortedFilteredData = wrapperComponent.gridData;
      expect(sortedFilteredData).toHaveLength(filteredCount);
      
      // Check that data is sorted
      for (let i = 1; i < sortedFilteredData.length; i++) {
        expect(sortedFilteredData[i-1].firstName <= sortedFilteredData[i].firstName).toBe(true);
      }
    });

    it('should work correctly with pagination', async () => {
      const testData = MockDataFactory.generateRows(100);
      const testColumns = MockColumnFactory.getStandardColumns();
      const paginatedConfig = MockConfigFactory.getPaginatedConfig();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = paginatedConfig;
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Apply filter
      wrapperComponent.grid.gridState.updateFilter('age', '>25');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      // Check that pagination reflects filtered data
      const totalFilteredItems = wrapperComponent.grid.getTotalItemsForPagination();
      expect(totalFilteredItems).toBeLessThan(testData.length);
      expect(totalFilteredItems).toBeGreaterThan(0);

      // Check that displayed data is paginated subset of filtered data
      const displayedData = wrapperComponent.gridData;
      const pageSize = wrapperComponent.pageSize;
      expect(displayedData.length).toBeLessThanOrEqual(pageSize);
    });
  });

  describe('Filter Edge Cases', () => {
    it('should handle missing fields gracefully', async () => {
      const dataWithMissingFields = [
        { id: 1, firstName: 'Alice' }, // missing lastName, age, etc.
        { id: 2, lastName: 'Smith' }, // missing firstName
        { id: 3, firstName: 'Charlie', age: 30 }
      ];
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = dataWithMissingFields;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Filter on field that doesn't exist in some records
      wrapperComponent.grid.gridState.updateFilter('age', '30');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].age).toBe(30);
    });

    it('should handle special characters in filters', async () => {
      const testData = [
        { id: 1, firstName: 'Alice', email: 'alice@test.com' },
        { id: 2, firstName: 'Bob & Charlie', email: 'bob+charlie@test.com' },
        { id: 3, firstName: 'David (Manager)', email: 'david@test.co.uk' }
      ];
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Filter with special characters
      wrapperComponent.grid.gridState.updateFilter('firstName', '&');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      let filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].firstName).toContain('&');

      // Filter with parentheses
      wrapperComponent.grid.gridState.updateFilter('firstName', '(Manager)');
      wrapperFixture.detectChanges();
      await TestAsyncHelpers.waitForStable(wrapperFixture);

      filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].firstName).toContain('(Manager)');
    });

    it('should handle very long filter strings', async () => {
      const testData = MockDataFactory.generateRows(10);
      const testColumns = MockColumnFactory.getStandardColumns();

      wrapperComponent.data = testData;
      wrapperComponent.columns = testColumns;
      wrapperComponent.config = MockConfigFactory.getDefaultConfig();
      wrapperFixture.detectChanges();

      // Very long filter string
      const longFilter = 'a'.repeat(1000);
      
      expect(() => {
        wrapperComponent.grid.gridState.updateFilter('firstName', longFilter);
        wrapperFixture.detectChanges();
      }).not.toThrow();

      const filteredData = wrapperComponent.gridData;
      expect(filteredData).toHaveLength(0); // No matches expected
    });
  });
});