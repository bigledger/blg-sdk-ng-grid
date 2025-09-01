import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';
import { TestDataManager } from '../data/test-data-manager';

test.describe('Grid Filtering Functionality', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoFilteringExample();
    await gridPage.loadDataset('medium');
    await gridPage.waitForGridToLoad();
  });
  
  test.describe('Text Filtering', () => {
    test('should filter text columns with "contains" operator', async () => {
      const initialRowCount = await gridPage.getRowCount();
      
      // Apply contains filter
      await gridPage.applyTextFilter('firstName', 'contains', 'John');
      await gridPage.waitForLoadingToComplete();
      
      // Verify filter is applied
      await gridPage.validateFilterApplied('firstName');
      
      // Row count should be reduced
      const filteredRowCount = await gridPage.getRowCount();
      expect(filteredRowCount).toBeLessThan(initialRowCount);
      
      // All visible rows should contain "John" in firstName
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const firstName = await gridPage.getCellTextByField(i, 'firstName');
        expect(firstName.toLowerCase()).toContain('john');
      }
    });
    
    test('should filter text columns with "startsWith" operator', async () => {
      await gridPage.applyTextFilter('lastName', 'startsWith', 'Sm');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('lastName');
      
      // Check first few visible rows
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const lastName = await gridPage.getCellTextByField(i, 'lastName');
        expect(lastName.toLowerCase()).toMatch(/^sm/);
      }
    });
    
    test('should filter text columns with "endsWith" operator', async () => {
      await gridPage.applyTextFilter('email', 'endsWith', '.com');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('email');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const email = await gridPage.getCellTextByField(i, 'email');
        expect(email.toLowerCase()).toMatch(/\.com$/);
      }
    });
    
    test('should filter text columns with "equals" operator', async () => {
      // First get a specific value to filter by
      const specificFirstName = await gridPage.getCellTextByField(0, 'firstName');
      
      await gridPage.applyTextFilter('firstName', 'equals', specificFirstName);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('firstName');
      
      // All visible rows should have exactly that firstName
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < visibleRowCount; i++) {
        const firstName = await gridPage.getCellTextByField(i, 'firstName');
        expect(firstName).toBe(specificFirstName);
      }
    });
    
    test('should filter text columns with "isEmpty" operator', async () => {
      await gridPage.loadDataset('mixed'); // Dataset with null/empty values
      await gridPage.waitForGridToLoad();
      
      await gridPage.gridHelper.openFilter('nullable');
      await gridPage.page.locator('[data-testid="filter-operator"]').selectOption('isEmpty');
      await gridPage.page.locator('[data-testid="filter-apply"]').click();
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('nullable');
      
      // Verify filtered results show empty/null values
      const visibleRowCount = await gridPage.getVisibleRowCount();
      if (visibleRowCount > 0) {
        const nullableValue = await gridPage.getCellTextByField(0, 'nullable');
        expect(nullableValue).toMatch(/^(null|undefined|—|-|)$/);
      }
    });
    
    test('should clear text filters', async () => {
      // Apply filter
      await gridPage.applyTextFilter('firstName', 'contains', 'John');
      await gridPage.waitForLoadingToComplete();
      await gridPage.validateFilterApplied('firstName');
      
      const filteredRowCount = await gridPage.getRowCount();
      
      // Clear filter
      await gridPage.gridHelper.clearFilter('firstName');
      await gridPage.waitForLoadingToComplete();
      
      // Filter indicator should be gone
      const filterIndicator = await gridPage.getFilterIndicator('firstName');
      expect(filterIndicator).toBe(false);
      
      // Row count should increase
      const clearedRowCount = await gridPage.getRowCount();
      expect(clearedRowCount).toBeGreaterThan(filteredRowCount);
    });
  });
  
  test.describe('Numeric Filtering', () => {
    test('should filter numeric columns with "greaterThan" operator', async () => {
      await gridPage.applyNumberFilter('age', 'greaterThan', 35);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('age');
      
      // All visible rows should have age > 35
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const ageStr = await gridPage.getCellTextByField(i, 'age');
        const age = parseInt(ageStr);
        expect(age).toBeGreaterThan(35);
      }
    });
    
    test('should filter numeric columns with "lessThan" operator', async () => {
      await gridPage.applyNumberFilter('age', 'lessThan', 30);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('age');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const ageStr = await gridPage.getCellTextByField(i, 'age');
        const age = parseInt(ageStr);
        expect(age).toBeLessThan(30);
      }
    });
    
    test('should filter numeric columns with "equals" operator', async () => {
      await gridPage.applyNumberFilter('age', 'equals', 25);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('age');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < visibleRowCount; i++) {
        const ageStr = await gridPage.getCellTextByField(i, 'age');
        const age = parseInt(ageStr);
        expect(age).toBe(25);
      }
    });
    
    test('should filter currency columns', async () => {
      await gridPage.applyNumberFilter('salary', 'greaterThan', 50000);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('salary');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const salaryStr = await gridPage.getCellTextByField(i, 'salary');
        const salary = parseFloat(salaryStr.replace(/[$,]/g, ''));
        expect(salary).toBeGreaterThan(50000);
      }
    });
    
    test('should filter with "between" operator for numeric ranges', async () => {
      await gridPage.gridHelper.openFilter('age');
      await gridPage.page.locator('[data-testid="filter-operator"]').selectOption('between');
      await gridPage.page.locator('[data-testid="filter-value-from"]').fill('25');
      await gridPage.page.locator('[data-testid="filter-value-to"]').fill('35');
      await gridPage.page.locator('[data-testid="filter-apply"]').click();
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('age');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const ageStr = await gridPage.getCellTextByField(i, 'age');
        const age = parseInt(ageStr);
        expect(age).toBeGreaterThanOrEqual(25);
        expect(age).toBeLessThanOrEqual(35);
      }
    });
  });
  
  test.describe('Date Filtering', () => {
    test('should filter date columns with "greaterThan" operator', async () => {
      const cutoffDate = '2020-01-01';
      await gridPage.applyDateFilter('joinDate', 'greaterThan', cutoffDate);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('joinDate');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const dateStr = await gridPage.getCellTextByField(i, 'joinDate');
        const date = new Date(dateStr);
        const cutoff = new Date(cutoffDate);
        expect(date.getTime()).toBeGreaterThan(cutoff.getTime());
      }
    });
    
    test('should filter date columns with "lessThan" operator', async () => {
      const cutoffDate = '2022-01-01';
      await gridPage.applyDateFilter('joinDate', 'lessThan', cutoffDate);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('joinDate');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const dateStr = await gridPage.getCellTextByField(i, 'joinDate');
        const date = new Date(dateStr);
        const cutoff = new Date(cutoffDate);
        expect(date.getTime()).toBeLessThan(cutoff.getTime());
      }
    });
    
    test('should filter date columns with "between" operator', async () => {
      await gridPage.gridHelper.openFilter('joinDate');
      await gridPage.page.locator('[data-testid="filter-operator"]').selectOption('between');
      await gridPage.page.locator('[data-testid="filter-value-from"]').fill('2020-01-01');
      await gridPage.page.locator('[data-testid="filter-value-to"]').fill('2022-12-31');
      await gridPage.page.locator('[data-testid="filter-apply"]').click();
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('joinDate');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      if (visibleRowCount > 0) {
        const dateStr = await gridPage.getCellTextByField(0, 'joinDate');
        const date = new Date(dateStr);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2022);
      }
    });
  });
  
  test.describe('Boolean Filtering', () => {
    test('should filter boolean columns for true values', async () => {
      await gridPage.gridHelper.openFilter('isActive');
      await gridPage.page.locator('[data-testid="filter-operator"]').selectOption('equals');
      await gridPage.page.locator('[data-testid="filter-value"]').selectOption('true');
      await gridPage.page.locator('[data-testid="filter-apply"]').click();
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('isActive');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const activeStr = await gridPage.getCellTextByField(i, 'isActive');
        expect(activeStr.toLowerCase()).toBe('true');
      }
    });
    
    test('should filter boolean columns for false values', async () => {
      await gridPage.gridHelper.openFilter('isActive');
      await gridPage.page.locator('[data-testid="filter-operator"]').selectOption('equals');
      await gridPage.page.locator('[data-testid="filter-value"]').selectOption('false');
      await gridPage.page.locator('[data-testid="filter-apply"]').click();
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('isActive');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const activeStr = await gridPage.getCellTextByField(i, 'isActive');
        expect(activeStr.toLowerCase()).toBe('false');
      }
    });
  });
  
  test.describe('Multiple Filters', () => {
    test('should apply multiple filters with AND logic', async () => {
      const initialRowCount = await gridPage.getRowCount();
      
      // Apply first filter
      await gridPage.applyTextFilter('firstName', 'contains', 'a');
      await gridPage.waitForLoadingToComplete();
      
      const firstFilterRowCount = await gridPage.getRowCount();
      expect(firstFilterRowCount).toBeLessThan(initialRowCount);
      
      // Apply second filter
      await gridPage.applyNumberFilter('age', 'greaterThan', 30);
      await gridPage.waitForLoadingToComplete();
      
      const secondFilterRowCount = await gridPage.getRowCount();
      expect(secondFilterRowCount).toBeLessThanOrEqual(firstFilterRowCount);
      
      // Both filters should be active
      await gridPage.validateFilterApplied('firstName');
      await gridPage.validateFilterApplied('age');
      
      // Verify data meets both criteria
      const visibleRowCount = await gridPage.getVisibleRowCount();
      if (visibleRowCount > 0) {
        const firstName = await gridPage.getCellTextByField(0, 'firstName');
        const ageStr = await gridPage.getCellTextByField(0, 'age');
        const age = parseInt(ageStr);
        
        expect(firstName.toLowerCase()).toContain('a');
        expect(age).toBeGreaterThan(30);
      }
    });
    
    test('should clear all filters at once', async () => {
      // Apply multiple filters
      await gridPage.applyTextFilter('firstName', 'contains', 'John');
      await gridPage.applyNumberFilter('age', 'greaterThan', 25);
      await gridPage.waitForLoadingToComplete();
      
      const filteredRowCount = await gridPage.getRowCount();
      
      // Clear all filters
      await gridPage.clearAllFilters();
      await gridPage.waitForLoadingToComplete();
      
      // All filter indicators should be gone
      const firstNameFilter = await gridPage.getFilterIndicator('firstName');
      const ageFilter = await gridPage.getFilterIndicator('age');
      expect(firstNameFilter).toBe(false);
      expect(ageFilter).toBe(false);
      
      // Row count should be back to original
      const clearedRowCount = await gridPage.getRowCount();
      expect(clearedRowCount).toBeGreaterThan(filteredRowCount);
    });
    
    test('should maintain filters when sorting is applied', async () => {
      // Apply filter first
      await gridPage.applyTextFilter('lastName', 'startsWith', 'S');
      await gridPage.waitForLoadingToComplete();
      
      // Apply sort
      await gridPage.sortColumn('firstName', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      // Both filter and sort should be active
      await gridPage.validateFilterApplied('lastName');
      await gridPage.validateSortApplied('firstName', 'asc');
      
      // Data should be both filtered and sorted
      const visibleRowCount = await gridPage.getVisibleRowCount();
      if (visibleRowCount > 1) {
        // Check filter
        const lastName = await gridPage.getCellTextByField(0, 'lastName');
        expect(lastName.toLowerCase()).toMatch(/^s/);
        
        // Check sort
        const firstName1 = await gridPage.getCellTextByField(0, 'firstName');
        const firstName2 = await gridPage.getCellTextByField(1, 'firstName');
        expect(firstName1.localeCompare(firstName2)).toBeLessThanOrEqual(0);
      }
    });
  });
  
  test.describe('Filter Performance and Edge Cases', () => {
    test('should handle filtering large datasets efficiently', async () => {
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      const filterTime = await gridPage.runFilterPerformanceTest('firstName', 'John');
      expect(filterTime).toBeLessThan(3000); // Should complete within 3 seconds
      
      console.log(`Filter performance on large dataset: ${filterTime}ms`);
    });
    
    test('should maintain filters during virtual scrolling', async () => {
      await gridPage.loadDataset('large');
      await gridPage.enableVirtualScrolling();
      await gridPage.waitForGridToLoad();
      
      // Apply filter
      await gridPage.applyTextFilter('firstName', 'contains', 'a');
      await gridPage.waitForLoadingToComplete();
      
      // Scroll to test virtual scrolling with filter
      await gridPage.scrollVertically(1000);
      await gridPage.page.waitForTimeout(500);
      
      // Filter should still be active
      await gridPage.validateFilterApplied('firstName');
      
      // Visible data should still match filter
      const visibleRowCount = await gridPage.getVisibleRowCount();
      if (visibleRowCount > 0) {
        const firstName = await gridPage.getCellTextByField(0, 'firstName');
        expect(firstName.toLowerCase()).toContain('a');
      }
    });
    
    test('should handle special characters in filter values', async () => {
      // Test with special characters
      await gridPage.applyTextFilter('firstName', 'contains', '@#$');
      await gridPage.waitForLoadingToComplete();
      
      // Filter should be applied without error
      const filterIndicator = await gridPage.getFilterIndicator('firstName');
      expect(filterIndicator).toBe(true);
      
      // Grid should still be functional
      await gridPage.validateGridStructure();
    });
    
    test('should handle empty filter values gracefully', async () => {
      await gridPage.gridHelper.openFilter('firstName');
      await gridPage.page.locator('[data-testid="filter-operator"]').selectOption('contains');
      await gridPage.page.locator('[data-testid="filter-value"]').fill('');
      await gridPage.page.locator('[data-testid="filter-apply"]').click();
      await gridPage.waitForLoadingToComplete();
      
      // Should not break the grid
      await gridPage.validateGridStructure();
      
      // Should show all data or handle empty filter appropriately
      const rowCount = await gridPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
    
    test('should provide filter suggestions/autocomplete if available', async ({ page }) => {
      await gridPage.gridHelper.openFilter('firstName');
      
      // Look for autocomplete or suggestion features
      const filterInput = page.locator('[data-testid="filter-value"]');
      await filterInput.fill('Jo');
      
      // Check if suggestions appear
      const suggestions = page.locator('[data-testid="filter-suggestions"]');
      if (await suggestions.isVisible()) {
        const suggestionCount = await suggestions.locator('li, .suggestion-item').count();
        expect(suggestionCount).toBeGreaterThan(0);
      }
    });
    
    test('should handle rapid filter changes without breaking', async () => {
      const filterValues = ['John', 'Jane', 'Bob', 'Alice', 'Mike'];
      
      // Apply rapid filter changes
      for (const value of filterValues) {
        await gridPage.applyTextFilter('firstName', 'contains', value);
        await gridPage.page.waitForTimeout(200);
      }
      
      // Grid should still be functional
      await gridPage.validateGridStructure();
      const rowCount = await gridPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
    
    test('should persist filter state after data refresh', async () => {
      // Apply filter
      await gridPage.applyTextFilter('firstName', 'contains', 'a');
      await gridPage.waitForLoadingToComplete();
      
      // Refresh data (if supported)
      const refreshButton = gridPage.page.locator('[data-testid="refresh-data-button"]');
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await gridPage.waitForLoadingToComplete();
        
        // Filter should still be active
        await gridPage.validateFilterApplied('firstName');
      }
    });
    
    test('should show no results message when filter returns empty set', async () => {
      // Apply a filter that should return no results
      await gridPage.applyTextFilter('firstName', 'equals', 'NonExistentName12345');
      await gridPage.waitForLoadingToComplete();
      
      // Should show no results
      const isEmpty = await gridPage.isGridEmpty();
      expect(isEmpty).toBe(true);
      
      // Should show appropriate message
      await expect(gridPage.page.locator('[data-testid="no-results-message"]')).toBeVisible();
    });
  });
});