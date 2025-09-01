import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';

test.describe('Advanced Filtering System (ag-grid Feature Parity)', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoAdvancedFilteringExample();
    await gridPage.loadDataset('comprehensive'); // Dataset with all data types
    await gridPage.waitForGridToLoad();
  });

  test.describe('Enhanced Text Filter Operators', () => {
    test('should support startsWith operator', async () => {
      await gridPage.applyTextFilter('firstName', 'startsWith', 'Jo');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('firstName');
      
      // Verify all visible rows start with 'Jo'
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const firstName = await gridPage.getCellTextByField(i, 'firstName');
        expect(firstName.toLowerCase()).toMatch(/^jo/);
      }
    });

    test('should support endsWith operator', async () => {
      await gridPage.applyTextFilter('email', 'endsWith', '.org');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('email');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const email = await gridPage.getCellTextByField(i, 'email');
        expect(email.toLowerCase()).toMatch(/\.org$/);
      }
    });

    test('should support notContains operator', async () => {
      // First get count without filter
      const initialRowCount = await gridPage.getRowCount();
      
      await gridPage.applyTextFilter('firstName', 'notContains', 'John');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('firstName');
      
      // Should show rows that DON'T contain 'John'
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const firstName = await gridPage.getCellTextByField(i, 'firstName');
        expect(firstName.toLowerCase()).not.toContain('john');
      }
      
      const filteredRowCount = await gridPage.getRowCount();
      expect(filteredRowCount).toBeLessThan(initialRowCount);
    });

    test('should support notEquals operator', async () => {
      const specificValue = await gridPage.getCellTextByField(0, 'firstName');
      
      await gridPage.applyTextFilter('firstName', 'notEquals', specificValue);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('firstName');
      
      // No visible rows should equal the specific value
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < visibleRowCount; i++) {
        const firstName = await gridPage.getCellTextByField(i, 'firstName');
        expect(firstName).not.toBe(specificValue);
      }
    });

    test('should support isEmpty operator', async () => {
      await gridPage.loadDataset('withNulls'); // Dataset with empty/null values
      await gridPage.waitForGridToLoad();
      
      await gridPage.applyFilter('description', 'isEmpty');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('description');
      
      // Should show only rows with empty/null descriptions
      const visibleRowCount = await gridPage.getVisibleRowCount();
      if (visibleRowCount > 0) {
        for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
          const description = await gridPage.getCellTextByField(i, 'description');
          expect(description).toMatch(/^(null|undefined|—|-||\s*)$/);
        }
      }
    });

    test('should support isNotEmpty operator', async () => {
      await gridPage.loadDataset('withNulls');
      await gridPage.waitForGridToLoad();
      
      await gridPage.applyFilter('description', 'isNotEmpty');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('description');
      
      // Should show only rows with non-empty descriptions
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const description = await gridPage.getCellTextByField(i, 'description');
        expect(description.trim()).not.toBe('');
        expect(description).not.toMatch(/^(null|undefined|—|-)$/);
      }
    });
  });

  test.describe('Enhanced Number Filter Operators', () => {
    test('should support greaterThanOrEqual operator', async () => {
      await gridPage.applyNumberFilter('age', 'greaterThanOrEqual', 30);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('age');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const ageStr = await gridPage.getCellTextByField(i, 'age');
        const age = parseInt(ageStr);
        expect(age).toBeGreaterThanOrEqual(30);
      }
    });

    test('should support lessThanOrEqual operator', async () => {
      await gridPage.applyNumberFilter('age', 'lessThanOrEqual', 50);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('age');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const ageStr = await gridPage.getCellTextByField(i, 'age');
        const age = parseInt(ageStr);
        expect(age).toBeLessThanOrEqual(50);
      }
    });

    test('should support inRange operator', async () => {
      await gridPage.applyNumberRangeFilter('salary', 'inRange', 40000, 80000);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('salary');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const salaryStr = await gridPage.getCellTextByField(i, 'salary');
        const salary = parseFloat(salaryStr.replace(/[$,]/g, ''));
        expect(salary).toBeGreaterThanOrEqual(40000);
        expect(salary).toBeLessThanOrEqual(80000);
      }
    });

    test('should support notInRange operator', async () => {
      await gridPage.applyNumberRangeFilter('salary', 'notInRange', 40000, 60000);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('salary');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const salaryStr = await gridPage.getCellTextByField(i, 'salary');
        const salary = parseFloat(salaryStr.replace(/[$,]/g, ''));
        expect(salary).not.toBeGreaterThanOrEqual(40000);
        expect(salary).not.toBeLessThanOrEqual(60000);
      }
    });

    test('should support notEquals operator for numbers', async () => {
      await gridPage.applyNumberFilter('age', 'notEquals', 35);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('age');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < visibleRowCount; i++) {
        const ageStr = await gridPage.getCellTextByField(i, 'age');
        const age = parseInt(ageStr);
        expect(age).not.toBe(35);
      }
    });
  });

  test.describe('Enhanced Date Filter Operators', () => {
    test('should support greaterThanOrEqual operator for dates', async () => {
      const cutoffDate = '2020-06-01';
      await gridPage.applyDateFilter('joinDate', 'greaterThanOrEqual', cutoffDate);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('joinDate');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const dateStr = await gridPage.getCellTextByField(i, 'joinDate');
        const date = new Date(dateStr);
        const cutoff = new Date(cutoffDate);
        expect(date.getTime()).toBeGreaterThanOrEqual(cutoff.getTime());
      }
    });

    test('should support lessThanOrEqual operator for dates', async () => {
      const cutoffDate = '2022-12-31';
      await gridPage.applyDateFilter('joinDate', 'lessThanOrEqual', cutoffDate);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('joinDate');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const dateStr = await gridPage.getCellTextByField(i, 'joinDate');
        const date = new Date(dateStr);
        const cutoff = new Date(cutoffDate);
        expect(date.getTime()).toBeLessThanOrEqual(cutoff.getTime());
      }
    });

    test('should support inRange operator for dates', async () => {
      const fromDate = '2020-01-01';
      const toDate = '2021-12-31';
      await gridPage.applyDateRangeFilter('joinDate', 'inRange', fromDate, toDate);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('joinDate');
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const dateStr = await gridPage.getCellTextByField(i, 'joinDate');
        const date = new Date(dateStr);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2021);
      }
    });

    test('should support relative date filters', async () => {
      // Test relative dates like "last 30 days", "this month", etc.
      await gridPage.applyRelativeDateFilter('joinDate', 'lastNDays', 30);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.validateFilterApplied('joinDate');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const dateStr = await gridPage.getCellTextByField(i, 'joinDate');
        const date = new Date(dateStr);
        expect(date.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime());
      }
    });
  });

  test.describe('Set Filter (Excel-style)', () => {
    test('should display unique values in set filter', async ({ page }) => {
      await gridPage.openSetFilter('department');
      
      // Should show checkbox list of unique department values
      const filterOptions = page.locator('.blg-set-filter-option');
      const optionCount = await filterOptions.count();
      expect(optionCount).toBeGreaterThan(0);
      
      // Each option should have a checkbox and label
      for (let i = 0; i < Math.min(optionCount, 5); i++) {
        const option = filterOptions.nth(i);
        const checkbox = option.locator('input[type="checkbox"]');
        const label = option.locator('.filter-option-label');
        
        await expect(checkbox).toBeVisible();
        await expect(label).toBeVisible();
      }
    });

    test('should filter by selected values in set filter', async ({ page }) => {
      await gridPage.openSetFilter('department');
      
      // Deselect all
      const selectAllCheckbox = page.locator('.blg-set-filter-select-all input[type="checkbox"]');
      if (await selectAllCheckbox.isChecked()) {
        await selectAllCheckbox.click();
      }
      
      // Select specific departments
      const engineeringOption = page.locator('.blg-set-filter-option:has-text("Engineering") input[type="checkbox"]');
      const salesOption = page.locator('.blg-set-filter-option:has-text("Sales") input[type="checkbox"]');
      
      await engineeringOption.click();
      await salesOption.click();
      
      // Apply filter
      await page.locator('.blg-set-filter-apply').click();
      await gridPage.waitForLoadingToComplete();
      
      // Should show only Engineering and Sales rows
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < visibleRowCount; i++) {
        const department = await gridPage.getCellTextByField(i, 'department');
        expect(['Engineering', 'Sales']).toContain(department);
      }
    });

    test('should support search within set filter', async ({ page }) => {
      await gridPage.openSetFilter('department');
      
      // Type in search box
      const searchInput = page.locator('.blg-set-filter-search input');
      await searchInput.fill('Eng');
      
      // Should filter the visible options
      const visibleOptions = page.locator('.blg-set-filter-option:visible');
      const visibleCount = await visibleOptions.count();
      
      // Verify filtered options contain 'Eng'
      for (let i = 0; i < visibleCount; i++) {
        const optionText = await visibleOptions.nth(i).locator('.filter-option-label').textContent();
        expect(optionText?.toLowerCase()).toContain('eng');
      }
    });

    test('should handle Select All / Clear All in set filter', async ({ page }) => {
      await gridPage.openSetFilter('department');
      
      // Click Select All
      const selectAllCheckbox = page.locator('.blg-set-filter-select-all input[type="checkbox"]');
      await selectAllCheckbox.click();
      
      // All options should be selected
      const allOptions = page.locator('.blg-set-filter-option input[type="checkbox"]');
      const optionCount = await allOptions.count();
      
      for (let i = 0; i < optionCount; i++) {
        await expect(allOptions.nth(i)).toBeChecked();
      }
      
      // Click Clear All (Select All again to deselect)
      await selectAllCheckbox.click();
      
      // All options should be deselected
      for (let i = 0; i < optionCount; i++) {
        await expect(allOptions.nth(i)).not.toBeChecked();
      }
    });

    test('should show count of items for each filter value', async ({ page }) => {
      await gridPage.openSetFilter('department');
      
      // Each filter option should show count in parentheses
      const filterOptions = page.locator('.blg-set-filter-option');
      const optionCount = await filterOptions.count();
      
      for (let i = 0; i < Math.min(optionCount, 3); i++) {
        const optionLabel = await filterOptions.nth(i).locator('.filter-option-label').textContent();
        expect(optionLabel).toMatch(/\(\d+\)$/); // Should end with (number)
      }
    });
  });

  test.describe('Multi-Filter (Combine Filter Types)', () => {
    test('should combine text and number filters on same column', async ({ page }) => {
      await gridPage.openMultiFilter('description');
      
      // Set first filter to text contains
      const firstFilterType = page.locator('.blg-multi-filter-1 .filter-type-select');
      await firstFilterType.selectOption('text');
      
      const firstOperator = page.locator('.blg-multi-filter-1 .filter-operator-select');
      await firstOperator.selectOption('contains');
      
      const firstValue = page.locator('.blg-multi-filter-1 .filter-value-input');
      await firstValue.fill('senior');
      
      // Set second filter to number greater than (if description has numbers)
      const secondFilterType = page.locator('.blg-multi-filter-2 .filter-type-select');
      await secondFilterType.selectOption('number');
      
      const secondOperator = page.locator('.blg-multi-filter-2 .filter-operator-select');
      await secondOperator.selectOption('greaterThan');
      
      const secondValue = page.locator('.blg-multi-filter-2 .filter-value-input');
      await secondValue.fill('5');
      
      // Set logic to AND
      const logicSelect = page.locator('.blg-multi-filter-logic-select');
      await logicSelect.selectOption('and');
      
      // Apply filter
      await page.locator('.blg-multi-filter-apply').click();
      await gridPage.waitForLoadingToComplete();
      
      // Should show results matching both conditions
      await gridPage.validateFilterApplied('description');
    });

    test('should support OR logic between multiple filters', async ({ page }) => {
      await gridPage.openMultiFilter('age');
      
      // First filter: age < 25
      await page.locator('.blg-multi-filter-1 .filter-operator-select').selectOption('lessThan');
      await page.locator('.blg-multi-filter-1 .filter-value-input').fill('25');
      
      // Second filter: age > 55
      await page.locator('.blg-multi-filter-2 .filter-operator-select').selectOption('greaterThan');
      await page.locator('.blg-multi-filter-2 .filter-value-input').fill('55');
      
      // Set logic to OR
      await page.locator('.blg-multi-filter-logic-select').selectOption('or');
      
      // Apply filter
      await page.locator('.blg-multi-filter-apply').click();
      await gridPage.waitForLoadingToComplete();
      
      // Should show young OR old people
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 5); i++) {
        const ageStr = await gridPage.getCellTextByField(i, 'age');
        const age = parseInt(ageStr);
        expect(age < 25 || age > 55).toBe(true);
      }
    });
  });

  test.describe('Quick Filter (Global Search)', () => {
    test('should search across all columns with quick filter', async ({ page }) => {
      const quickFilterInput = page.locator('.blg-quick-filter input, [data-testid="quick-filter"]');
      
      // Type search term
      await quickFilterInput.fill('john');
      await gridPage.waitForLoadingToComplete();
      
      // Should show rows where ANY column contains 'john'
      const visibleRowCount = await gridPage.getVisibleRowCount();
      expect(visibleRowCount).toBeGreaterThan(0);
      
      // At least one cell in each row should contain 'john'
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const rowData = await gridPage.getRowData(i);
        const hasMatch = Object.values(rowData).some(value => 
          String(value).toLowerCase().includes('john')
        );
        expect(hasMatch).toBe(true);
      }
    });

    test('should highlight search terms in results', async ({ page }) => {
      const quickFilterInput = page.locator('.blg-quick-filter input');
      await quickFilterInput.fill('engineering');
      await gridPage.waitForLoadingToComplete();
      
      // Search terms should be highlighted
      const highlightedTerms = page.locator('.blg-search-highlight, .highlight');
      const highlightCount = await highlightedTerms.count();
      expect(highlightCount).toBeGreaterThan(0);
      
      // Highlighted text should match search term
      for (let i = 0; i < Math.min(highlightCount, 3); i++) {
        const highlightedText = await highlightedTerms.nth(i).textContent();
        expect(highlightedText?.toLowerCase()).toContain('engineering');
      }
    });

    test('should filter in real-time as user types', async ({ page }) => {
      const quickFilterInput = page.locator('.blg-quick-filter input');
      
      // Initial row count
      const initialRowCount = await gridPage.getRowCount();
      
      // Type 'j'
      await quickFilterInput.fill('j');
      await page.waitForTimeout(300); // Debounce delay
      const firstFilterCount = await gridPage.getRowCount();
      expect(firstFilterCount).toBeLessThanOrEqual(initialRowCount);
      
      // Type 'jo'
      await quickFilterInput.fill('jo');
      await page.waitForTimeout(300);
      const secondFilterCount = await gridPage.getRowCount();
      expect(secondFilterCount).toBeLessThanOrEqual(firstFilterCount);
      
      // Type 'john'
      await quickFilterInput.fill('john');
      await page.waitForTimeout(300);
      const thirdFilterCount = await gridPage.getRowCount();
      expect(thirdFilterCount).toBeLessThanOrEqual(secondFilterCount);
    });

    test('should clear quick filter with escape key', async ({ page }) => {
      const quickFilterInput = page.locator('.blg-quick-filter input');
      
      // Apply quick filter
      await quickFilterInput.fill('engineering');
      await gridPage.waitForLoadingToComplete();
      const filteredCount = await gridPage.getRowCount();
      
      // Focus input and press Escape
      await quickFilterInput.focus();
      await page.keyboard.press('Escape');
      await gridPage.waitForLoadingToComplete();
      
      // Filter should be cleared
      const clearedCount = await gridPage.getRowCount();
      expect(clearedCount).toBeGreaterThan(filteredCount);
      
      const inputValue = await quickFilterInput.inputValue();
      expect(inputValue).toBe('');
    });
  });

  test.describe('Filter Performance and Optimization', () => {
    test('should maintain filter performance with large datasets', async () => {
      await gridPage.loadDataset('extraLarge'); // 100k+ rows
      await gridPage.waitForGridToLoad();
      
      const filterStartTime = Date.now();
      await gridPage.applyTextFilter('firstName', 'contains', 'a');
      await gridPage.waitForLoadingToComplete();
      const filterEndTime = Date.now();
      
      const filterTime = filterEndTime - filterStartTime;
      expect(filterTime).toBeLessThan(2000); // Should complete within 2 seconds
      
      console.log(`Large dataset filter time: ${filterTime}ms`);
    });

    test('should handle complex filter combinations efficiently', async ({ page }) => {
      // Apply multiple complex filters
      await gridPage.applyTextFilter('firstName', 'startsWith', 'A');
      await gridPage.applyNumberRangeFilter('age', 'inRange', 25, 45);
      await gridPage.applyDateFilter('joinDate', 'greaterThan', '2020-01-01');
      
      const complexFilterStartTime = Date.now();
      
      // Apply quick filter on top
      const quickFilterInput = page.locator('.blg-quick-filter input');
      await quickFilterInput.fill('senior');
      await gridPage.waitForLoadingToComplete();
      
      const complexFilterEndTime = Date.now();
      const complexFilterTime = complexFilterEndTime - complexFilterStartTime;
      
      expect(complexFilterTime).toBeLessThan(3000); // Complex filters within 3 seconds
      
      // Should show results matching all criteria
      const visibleRowCount = await gridPage.getVisibleRowCount();
      if (visibleRowCount > 0) {
        const firstName = await gridPage.getCellTextByField(0, 'firstName');
        const age = parseInt(await gridPage.getCellTextByField(0, 'age'));
        
        expect(firstName.toLowerCase()).toMatch(/^a/);
        expect(age).toBeGreaterThanOrEqual(25);
        expect(age).toBeLessThanOrEqual(45);
      }
      
      console.log(`Complex filter combination time: ${complexFilterTime}ms`);
    });

    test('should debounce rapid filter changes', async ({ page }) => {
      const quickFilterInput = page.locator('.blg-quick-filter input');
      
      // Type rapidly
      const rapidInputs = ['j', 'jo', 'joh', 'john', 'john ', 'john s'];
      const startTime = Date.now();
      
      for (const input of rapidInputs) {
        await quickFilterInput.fill(input);
        await page.waitForTimeout(50); // Rapid typing
      }
      
      // Wait for debounce to settle
      await page.waitForTimeout(500);
      await gridPage.waitForLoadingToComplete();
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should handle rapid input efficiently (not re-filter on every keystroke)
      expect(totalTime).toBeLessThan(2000);
      
      console.log(`Rapid filter input handling time: ${totalTime}ms`);
    });

    test('should cache filter results for performance', async () => {
      // Apply filter first time
      const firstFilterStart = Date.now();
      await gridPage.applyTextFilter('lastName', 'contains', 'smith');
      await gridPage.waitForLoadingToComplete();
      const firstFilterEnd = Date.now();
      const firstFilterTime = firstFilterEnd - firstFilterStart;
      
      // Clear and reapply same filter
      await gridPage.clearAllFilters();
      await gridPage.waitForLoadingToComplete();
      
      const secondFilterStart = Date.now();
      await gridPage.applyTextFilter('lastName', 'contains', 'smith');
      await gridPage.waitForLoadingToComplete();
      const secondFilterEnd = Date.now();
      const secondFilterTime = secondFilterEnd - secondFilterStart;
      
      // Second application should be faster due to caching
      expect(secondFilterTime).toBeLessThanOrEqual(firstFilterTime * 1.2); // Allow 20% variance
      
      console.log(`First filter: ${firstFilterTime}ms, Cached filter: ${secondFilterTime}ms`);
    });
  });

  test.describe('Filter State Management', () => {
    test('should persist filter state across grid operations', async () => {
      // Apply complex filter state
      await gridPage.applyTextFilter('firstName', 'startsWith', 'J');
      await gridPage.applyNumberFilter('age', 'greaterThan', 30);
      await gridPage.validateFilterApplied('firstName');
      await gridPage.validateFilterApplied('age');
      
      // Perform sort operation
      await gridPage.sortColumn('lastName', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      // Filters should still be active
      await gridPage.validateFilterApplied('firstName');
      await gridPage.validateFilterApplied('age');
      
      // Perform column operations
      await gridPage.hideColumn('email');
      await gridPage.waitForLoadingToComplete();
      
      // Filters should still be active
      await gridPage.validateFilterApplied('firstName');
      await gridPage.validateFilterApplied('age');
    });

    test('should export/import filter model', async ({ page }) => {
      // Apply multiple filters
      await gridPage.applyTextFilter('firstName', 'contains', 'a');
      await gridPage.applyNumberRangeFilter('age', 'inRange', 25, 45);
      await gridPage.applyDateFilter('joinDate', 'greaterThan', '2020-01-01');
      
      // Export filter model
      const exportButton = page.locator('[data-testid="export-filter-model"]');
      if (await exportButton.isVisible()) {
        await exportButton.click();
        
        // Should get JSON representation of filters
        const filterModel = await page.locator('[data-testid="filter-model-output"]').textContent();
        expect(filterModel).toBeTruthy();
        
        const parsedModel = JSON.parse(filterModel || '{}');
        expect(parsedModel.firstName).toBeDefined();
        expect(parsedModel.age).toBeDefined();
        expect(parsedModel.joinDate).toBeDefined();
        
        // Clear all filters
        await gridPage.clearAllFilters();
        await gridPage.waitForLoadingToComplete();
        
        // Import filter model
        const importButton = page.locator('[data-testid="import-filter-model"]');
        const modelInput = page.locator('[data-testid="filter-model-input"]');
        
        await modelInput.fill(filterModel || '');
        await importButton.click();
        await gridPage.waitForLoadingToComplete();
        
        // Filters should be restored
        await gridPage.validateFilterApplied('firstName');
        await gridPage.validateFilterApplied('age');
        await gridPage.validateFilterApplied('joinDate');
      }
    });

    test('should handle filter model validation', async ({ page }) => {
      const importButton = page.locator('[data-testid="import-filter-model"]');
      const modelInput = page.locator('[data-testid="filter-model-input"]');
      
      if (await importButton.isVisible()) {
        // Try to import invalid JSON
        await modelInput.fill('invalid json');
        await importButton.click();
        
        // Should show error message
        const errorMessage = page.locator('.blg-filter-error, [data-testid="filter-error"]');
        await expect(errorMessage).toBeVisible();
        
        // Try to import valid JSON with invalid filter structure
        const invalidModel = JSON.stringify({
          invalidColumn: { type: 'invalidType', operator: 'contains', value: 'test' }
        });
        
        await modelInput.fill(invalidModel);
        await importButton.click();
        
        // Should handle gracefully (ignore invalid filters)
        await expect(errorMessage).toBeVisible();
      }
    });
  });
});