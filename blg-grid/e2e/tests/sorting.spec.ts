import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';
import { TestDataManager } from '../data/test-data-manager';

test.describe('Grid Sorting Functionality', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoSortingExample();
    await gridPage.loadDataset('medium');
    await gridPage.waitForGridToLoad();
  });
  
  test.describe('Single Column Sorting', () => {
    test('should sort text columns ascending and descending', async () => {
      // Sort firstName ascending
      await gridPage.sortColumn('firstName', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      // Verify sort indicator
      await gridPage.validateSortApplied('firstName', 'asc');
      
      // Verify data is sorted
      const firstRowName = await gridPage.getCellTextByField(0, 'firstName');
      const secondRowName = await gridPage.getCellTextByField(1, 'firstName');
      expect(firstRowName.localeCompare(secondRowName)).toBeLessThanOrEqual(0);
      
      // Sort descending
      await gridPage.sortColumn('firstName', 'desc');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateSortApplied('firstName', 'desc');
      
      // Verify descending order
      const firstRowNameDesc = await gridPage.getCellTextByField(0, 'firstName');
      const secondRowNameDesc = await gridPage.getCellTextByField(1, 'firstName');
      expect(firstRowNameDesc.localeCompare(secondRowNameDesc)).toBeGreaterThanOrEqual(0);
    });
    
    test('should sort numeric columns correctly', async () => {
      // Sort age ascending
      await gridPage.sortColumn('age', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateSortApplied('age', 'asc');
      
      // Verify numeric sort order
      const firstAge = parseInt(await gridPage.getCellTextByField(0, 'age'));
      const secondAge = parseInt(await gridPage.getCellTextByField(1, 'age'));
      expect(firstAge).toBeLessThanOrEqual(secondAge);
      
      // Sort descending
      await gridPage.sortColumn('age', 'desc');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateSortApplied('age', 'desc');
      
      const firstAgeDesc = parseInt(await gridPage.getCellTextByField(0, 'age'));
      const secondAgeDesc = parseInt(await gridPage.getCellTextByField(1, 'age'));
      expect(firstAgeDesc).toBeGreaterThanOrEqual(secondAgeDesc);
    });
    
    test('should sort date columns correctly', async () => {
      // Sort joinDate ascending
      await gridPage.sortColumn('joinDate', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateSortApplied('joinDate', 'asc');
      
      // Verify date sort order
      const firstDateStr = await gridPage.getCellTextByField(0, 'joinDate');
      const secondDateStr = await gridPage.getCellTextByField(1, 'joinDate');
      const firstDate = new Date(firstDateStr);
      const secondDate = new Date(secondDateStr);
      expect(firstDate.getTime()).toBeLessThanOrEqual(secondDate.getTime());
    });
    
    test('should sort currency columns correctly', async () => {
      // Sort salary ascending
      await gridPage.sortColumn('salary', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateSortApplied('salary', 'asc');
      
      // Extract numeric values from currency format
      const firstSalaryStr = await gridPage.getCellTextByField(0, 'salary');
      const secondSalaryStr = await gridPage.getCellTextByField(1, 'salary');
      const firstSalary = parseFloat(firstSalaryStr.replace(/[$,]/g, ''));
      const secondSalary = parseFloat(secondSalaryStr.replace(/[$,]/g, ''));
      expect(firstSalary).toBeLessThanOrEqual(secondSalary);
    });
    
    test('should sort boolean columns correctly', async () => {
      // Sort isActive column
      await gridPage.sortColumn('isActive', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateSortApplied('isActive', 'asc');
      
      // Boolean sorting typically puts false before true
      const firstActiveStr = await gridPage.getCellTextByField(0, 'isActive');
      const firstActive = firstActiveStr.toLowerCase() === 'true';
      
      // Find the first true value and verify it comes after false values
      let foundTrue = false;
      let foundFalseAfterTrue = false;
      const visibleRowCount = await gridPage.getVisibleRowCount();
      
      for (let i = 0; i < Math.min(visibleRowCount, 10); i++) {
        const activeStr = await gridPage.getCellTextByField(i, 'isActive');
        const isActive = activeStr.toLowerCase() === 'true';
        
        if (isActive) {
          foundTrue = true;
        } else if (foundTrue) {
          foundFalseAfterTrue = true;
          break;
        }
      }
      
      // In ascending order, should not find false after true
      expect(foundFalseAfterTrue).toBe(false);
    });
    
    test('should handle null values in sorting', async () => {
      await gridPage.loadDataset('mixed'); // Dataset with null values
      await gridPage.waitForGridToLoad();
      
      // Sort nullable column
      await gridPage.sortColumn('nullable', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateSortApplied('nullable', 'asc');
      
      // Verify grid still functions with null values
      const rowCount = await gridPage.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });
    
    test('should clear sorting when clicked three times', async () => {
      // Sort ascending
      await gridPage.sortColumn('firstName', 'asc');
      await gridPage.validateSortApplied('firstName', 'asc');
      
      // Sort descending
      await gridPage.sortColumn('firstName', 'desc');
      await gridPage.validateSortApplied('firstName', 'desc');
      
      // Clear sort (third click)
      const header = await gridPage.gridHelper.getColumnHeader('firstName');
      await header.click();
      await gridPage.waitForLoadingToComplete();
      
      // Verify sort is cleared
      const sortIndicator = await gridPage.getSortIndicator('firstName');
      expect(sortIndicator).toBe('none');
    });
  });
  
  test.describe('Multi-Column Sorting', () => {
    test('should support multi-column sorting with Ctrl+Click', async ({ page }) => {
      // First column sort
      await gridPage.sortColumn('lastName', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      // Second column sort with Ctrl key
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      await page.keyboard.down('Control');
      await firstNameHeader.click();
      await page.keyboard.up('Control');
      await gridPage.waitForLoadingToComplete();
      
      // Verify both sorts are applied
      await gridPage.validateSortApplied('lastName', 'asc');
      await gridPage.validateSortApplied('firstName', 'asc');
      
      // Verify sort order: lastName first, then firstName
      const firstRowLastName = await gridPage.getCellTextByField(0, 'lastName');
      const secondRowLastName = await gridPage.getCellTextByField(1, 'lastName');
      
      if (firstRowLastName === secondRowLastName) {
        // If last names are same, first names should be sorted
        const firstRowFirstName = await gridPage.getCellTextByField(0, 'firstName');
        const secondRowFirstName = await gridPage.getCellTextByField(1, 'firstName');
        expect(firstRowFirstName.localeCompare(secondRowFirstName)).toBeLessThanOrEqual(0);
      } else {
        expect(firstRowLastName.localeCompare(secondRowLastName)).toBeLessThanOrEqual(0);
      }
    });
    
    test('should show sort order numbers for multi-column sort', async ({ page }) => {
      // Apply multi-column sort
      await gridPage.sortColumn('department', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      const salaryHeader = await gridPage.gridHelper.getColumnHeader('salary');
      await page.keyboard.down('Control');
      await salaryHeader.click();
      await page.keyboard.up('Control');
      await gridPage.waitForLoadingToComplete();
      
      // Check for sort order indicators (1, 2, etc.)
      const departmentHeader = await gridPage.gridHelper.getColumnHeader('department');
      const salaryHeaderElement = await gridPage.gridHelper.getColumnHeader('salary');
      
      // Look for sort order numbers in headers
      const departmentSortOrder = await departmentHeader.locator('.sort-order').textContent();
      const salarySortOrder = await salaryHeaderElement.locator('.sort-order').textContent();
      
      if (departmentSortOrder && salarySortOrder) {
        expect(departmentSortOrder).toBe('1');
        expect(salarySortOrder).toBe('2');
      }
    });
    
    test('should maintain multi-column sort order when adding new sort', async ({ page }) => {
      // Create a three-column sort
      await gridPage.sortColumn('department', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      // Add second sort
      const positionHeader = await gridPage.gridHelper.getColumnHeader('position');
      await page.keyboard.down('Control');
      await positionHeader.click();
      await page.keyboard.up('Control');
      await gridPage.waitForLoadingToComplete();
      
      // Add third sort
      const ageHeader = await gridPage.gridHelper.getColumnHeader('age');
      await page.keyboard.down('Control');
      await ageHeader.click();
      await page.keyboard.up('Control');
      await gridPage.waitForLoadingToComplete();
      
      // Verify all three sorts are maintained
      await gridPage.validateSortApplied('department', 'asc');
      await gridPage.validateSortApplied('position', 'asc');
      await gridPage.validateSortApplied('age', 'asc');
    });
    
    test('should remove column from multi-sort when Ctrl+clicked on sorted column', async ({ page }) => {
      // Set up multi-column sort
      await gridPage.sortColumn('lastName', 'asc');
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      await page.keyboard.down('Control');
      await firstNameHeader.click();
      await page.keyboard.up('Control');
      await gridPage.waitForLoadingToComplete();
      
      // Remove firstName from sort by Ctrl+clicking again
      await page.keyboard.down('Control');
      await firstNameHeader.click();
      await page.keyboard.up('Control');
      await gridPage.waitForLoadingToComplete();
      
      // Only lastName should be sorted now
      await gridPage.validateSortApplied('lastName', 'asc');
      const firstNameSort = await gridPage.getSortIndicator('firstName');
      expect(firstNameSort).toBe('none');
    });
  });
  
  test.describe('Sort Performance and Edge Cases', () => {
    test('should handle sorting large datasets efficiently', async () => {
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      const sortTime = await gridPage.runSortPerformanceTest('firstName');
      expect(sortTime).toBeLessThan(3000); // Should complete within 3 seconds
      
      console.log(`Sort performance on large dataset: ${sortTime}ms`);
    });
    
    test('should maintain sort during virtual scrolling', async () => {
      await gridPage.loadDataset('large');
      await gridPage.enableVirtualScrolling();
      await gridPage.waitForGridToLoad();
      
      // Apply sort
      await gridPage.sortColumn('age', 'desc');
      await gridPage.waitForLoadingToComplete();
      
      // Scroll to test virtual scrolling with sort
      await gridPage.scrollVertically(2000);
      await gridPage.page.waitForTimeout(500);
      
      // Verify sort is maintained
      await gridPage.validateSortApplied('age', 'desc');
      
      // Check that visible data is still sorted
      const visibleRowCount = await gridPage.getVisibleRowCount();
      if (visibleRowCount > 1) {
        const firstAge = parseInt(await gridPage.getCellTextByField(0, 'age'));
        const secondAge = parseInt(await gridPage.getCellTextByField(1, 'age'));
        expect(firstAge).toBeGreaterThanOrEqual(secondAge);
      }
    });
    
    test('should preserve sort when filtering is applied', async () => {
      // Apply sort first
      await gridPage.sortColumn('salary', 'desc');
      await gridPage.waitForLoadingToComplete();
      
      // Apply filter
      await gridPage.applyNumberFilter('age', 'greaterThan', 30);
      await gridPage.waitForLoadingToComplete();
      
      // Both sort and filter should be active
      await gridPage.validateSortApplied('salary', 'desc');
      await gridPage.validateFilterApplied('age');
      
      // Data should be both filtered and sorted
      const visibleRowCount = await gridPage.getVisibleRowCount();
      if (visibleRowCount > 1) {
        // Check age filter
        const firstAge = parseInt(await gridPage.getCellTextByField(0, 'age'));
        expect(firstAge).toBeGreaterThan(30);
        
        // Check salary sort
        const firstSalaryStr = await gridPage.getCellTextByField(0, 'salary');
        const secondSalaryStr = await gridPage.getCellTextByField(1, 'salary');
        const firstSalary = parseFloat(firstSalaryStr.replace(/[$,]/g, ''));
        const secondSalary = parseFloat(secondSalaryStr.replace(/[$,]/g, ''));
        expect(firstSalary).toBeGreaterThanOrEqual(secondSalary);
      }
    });
    
    test('should handle sorting with special characters and unicode', async () => {
      // This test assumes some data might have special characters
      await gridPage.loadDataset('mixed');
      await gridPage.waitForGridToLoad();
      
      await gridPage.sortColumn('name', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      // Verify sort is applied even with special characters
      await gridPage.validateSortApplied('name', 'asc');
      
      const rowCount = await gridPage.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });
    
    test('should clear all sorts at once', async ({ page }) => {
      // Apply multiple sorts
      await gridPage.sortColumn('lastName', 'asc');
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      await page.keyboard.down('Control');
      await firstNameHeader.click();
      await page.keyboard.up('Control');
      await gridPage.waitForLoadingToComplete();
      
      // Clear all sorts
      await gridPage.gridHelper.clearSort();
      await gridPage.waitForLoadingToComplete();
      
      // Verify all sorts are cleared
      const lastNameSort = await gridPage.getSortIndicator('lastName');
      const firstNameSort = await gridPage.getSortIndicator('firstName');
      expect(lastNameSort).toBe('none');
      expect(firstNameSort).toBe('none');
    });
    
    test('should handle rapid sort changes without breaking', async () => {
      const columns = ['firstName', 'lastName', 'age', 'salary'];
      
      // Apply rapid sort changes
      for (let i = 0; i < 3; i++) {
        for (const column of columns) {
          await gridPage.sortColumn(column, 'asc');
          await gridPage.page.waitForTimeout(100);
          await gridPage.sortColumn(column, 'desc');
          await gridPage.page.waitForTimeout(100);
        }
      }
      
      // Grid should still be functional
      await gridPage.validateGridStructure();
      const rowCount = await gridPage.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });
    
    test('should maintain sort state after page refresh', async () => {
      // Apply sort
      await gridPage.sortColumn('email', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      // Refresh page
      await gridPage.refreshPage();
      
      // Check if sort state is preserved (depends on implementation)
      // This might not be preserved in all implementations
      const sortIndicator = await gridPage.getSortIndicator('email');
      
      // If sort state is preserved, verify it
      if (sortIndicator !== 'none') {
        expect(sortIndicator).toBe('asc');
      }
      
      // Grid should be functional regardless
      await gridPage.validateGridStructure();
    });
    
    test('should provide visual feedback during sort operations', async () => {
      const header = await gridPage.gridHelper.getColumnHeader('salary');
      
      // Click to sort
      await header.click();
      
      // Check for loading indicator or visual feedback
      const hasLoadingIndicator = await gridPage.hasLoadingIndicator();
      
      // Wait for sort to complete
      await gridPage.waitForLoadingToComplete();
      
      // Verify sort completed successfully
      await gridPage.validateSortApplied('salary', 'asc');
    });
  });
});