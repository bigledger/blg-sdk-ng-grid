import { test, expect, Page } from '@playwright/test';
import { GridTestHelpers } from '../helpers/grid-test-helpers';

/**
 * Enhanced Filtering System E2E Tests
 * 
 * These tests verify the advanced filtering capabilities that exceed ag-grid:
 * - Enhanced operators (contains, startsWith, endsWith, regex, fuzzy matching)
 * - Date range filtering with calendar picker
 * - Number range filtering with sliders
 * - Boolean filtering with tri-state
 * - Performance with large datasets
 * - Filter combinations and logic
 * - Filter persistence and export/import
 * - Real-time filtering with debouncing
 */

test.describe('Enhanced Filtering System', () => {
  let page: Page;
  let gridHelpers: GridTestHelpers;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    gridHelpers = new GridTestHelpers(page);
    
    // Navigate to grid with sample data
    await page.goto('/examples/grid/filtering');
    await page.waitForSelector('[data-testid="blg-grid"]');
    
    // Wait for data to load
    await expect(page.locator('.blg-grid-row')).toHaveCount(1000, { timeout: 10000 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Text Filtering Enhanced', () => {
    test('should support all text operators', async () => {
      const columnHeader = page.locator('[data-column="name"] .column-header');
      
      // Open filter menu
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      
      // Test contains operator (default)
      await page.fill('[data-testid="text-filter-input"]', 'John');
      await page.click('[data-testid="apply-filter"]');
      
      // Verify results contain "John"
      const rows = await page.locator('.blg-grid-row').all();
      for (const row of rows) {
        const nameCell = row.locator('[data-column="name"]');
        await expect(nameCell).toContainText('John');
      }
      
      // Test starts with operator
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.selectOption('[data-testid="text-operator-select"]', 'startsWith');
      await page.fill('[data-testid="text-filter-input"]', 'J');
      await page.click('[data-testid="apply-filter"]');
      
      // Verify results start with "J"
      const startWithRows = await page.locator('.blg-grid-row').all();
      for (const row of startWithRows) {
        const nameCell = row.locator('[data-column="name"]');
        const text = await nameCell.textContent();
        expect(text).toMatch(/^J/);
      }
      
      // Test regex operator
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.selectOption('[data-testid="text-operator-select"]', 'regex');
      await page.fill('[data-testid="text-filter-input"]', '^[A-M].*');
      await page.click('[data-testid="apply-filter"]');
      
      // Verify regex results
      const regexRows = await page.locator('.blg-grid-row').all();
      for (const row of regexRows) {
        const nameCell = row.locator('[data-column="name"]');
        const text = await nameCell.textContent();
        expect(text).toMatch(/^[A-M].*/);
      }
    });

    test('should support fuzzy matching with confidence threshold', async () => {
      const columnHeader = page.locator('[data-column="name"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      
      // Enable fuzzy matching
      await page.selectOption('[data-testid="text-operator-select"]', 'fuzzy');
      await page.fill('[data-testid="text-filter-input"]', 'Jhon'); // Misspelled
      
      // Set confidence threshold
      await page.fill('[data-testid="fuzzy-confidence-slider"]', '0.8');
      await page.click('[data-testid="apply-filter"]');
      
      // Should find "John" names despite misspelling
      const fuzzyRows = await page.locator('.blg-grid-row').all();
      expect(fuzzyRows.length).toBeGreaterThan(0);
      
      // Verify fuzzy match indicator is shown
      await expect(page.locator('[data-testid="fuzzy-match-indicator"]')).toBeVisible();
    });

    test('should show performance metrics for large dataset filtering', async () => {
      // Load large dataset
      await page.goto('/examples/grid/filtering-performance');
      await page.waitForSelector('[data-testid="blg-grid"]');
      await expect(page.locator('.blg-grid-row')).toHaveCount(50000, { timeout: 30000 });
      
      const columnHeader = page.locator('[data-column="description"] .column-header');
      
      // Start performance monitoring
      await page.click('[data-testid="enable-performance-monitoring"]');
      
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.fill('[data-testid="text-filter-input"]', 'performance');
      
      const startTime = Date.now();
      await page.click('[data-testid="apply-filter"]');
      
      // Wait for filtering to complete
      await page.waitForSelector('[data-testid="filter-complete-indicator"]');
      const endTime = Date.now();
      
      // Verify performance metrics are displayed
      await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();
      
      const filterTime = await page.textContent('[data-testid="filter-time-metric"]');
      const memoryUsage = await page.textContent('[data-testid="memory-usage-metric"]');
      
      expect(parseFloat(filterTime!)).toBeLessThan(1000); // Less than 1 second
      expect(filterTime).toBeTruthy();
      expect(memoryUsage).toBeTruthy();
      
      // Verify results are correct
      const resultRows = await page.locator('.blg-grid-row').all();
      expect(resultRows.length).toBeGreaterThan(0);
    });
  });

  test.describe('Date Range Filtering', () => {
    test('should support advanced date range filtering with calendar', async () => {
      const columnHeader = page.locator('[data-column="createdDate"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      
      // Test date range operator
      await page.selectOption('[data-testid="date-operator-select"]', 'between');
      
      // Open start date picker
      await page.click('[data-testid="start-date-picker-trigger"]');
      await expect(page.locator('[data-testid="date-picker-calendar"]')).toBeVisible();
      
      // Select start date (first day of current month)
      await page.click('[data-testid="calendar-day"][data-day="1"]');
      
      // Open end date picker
      await page.click('[data-testid="end-date-picker-trigger"]');
      
      // Select end date (15th of current month)
      await page.click('[data-testid="calendar-day"][data-day="15"]');
      
      await page.click('[data-testid="apply-filter"]');
      
      // Verify date range filtering
      const dateRows = await page.locator('.blg-grid-row').all();
      expect(dateRows.length).toBeGreaterThan(0);
      
      // Verify all dates are within range
      for (const row of dateRows) {
        const dateCell = row.locator('[data-column="createdDate"]');
        const dateText = await dateCell.textContent();
        const date = new Date(dateText!);
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const midMonth = new Date(today.getFullYear(), today.getMonth(), 15);
        
        expect(date.getTime()).toBeGreaterThanOrEqual(startOfMonth.getTime());
        expect(date.getTime()).toBeLessThanOrEqual(midMonth.getTime());
      }
    });

    test('should support relative date filtering', async () => {
      const columnHeader = page.locator('[data-column="createdDate"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      
      // Test "last 7 days" relative filter
      await page.selectOption('[data-testid="date-operator-select"]', 'relative');
      await page.selectOption('[data-testid="relative-period-select"]', 'last7days');
      await page.click('[data-testid="apply-filter"]');
      
      // Verify relative date filtering
      const relativeRows = await page.locator('.blg-grid-row').all();
      expect(relativeRows.length).toBeGreaterThan(0);
      
      // Test custom relative period
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.selectOption('[data-testid="relative-period-select"]', 'custom');
      await page.fill('[data-testid="custom-days-input"]', '30');
      await page.click('[data-testid="apply-filter"]');
      
      const customRows = await page.locator('.blg-grid-row').all();
      expect(customRows.length).toBeGreaterThanOrEqual(relativeRows.length);
    });
  });

  test.describe('Number Range Filtering', () => {
    test('should support number range filtering with slider', async () => {
      const columnHeader = page.locator('[data-column="salary"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      
      // Test range slider
      await page.selectOption('[data-testid="number-operator-select"]', 'between');
      
      // Verify slider is visible and interactive
      await expect(page.locator('[data-testid="number-range-slider"]')).toBeVisible();
      
      // Set range using slider handles
      const slider = page.locator('[data-testid="number-range-slider"]');
      const sliderBounds = await slider.boundingBox();
      
      // Drag left handle to set minimum (25% of salary range)
      await page.mouse.click(sliderBounds!.x + sliderBounds!.width * 0.25, sliderBounds!.y + sliderBounds!.height / 2);
      
      // Drag right handle to set maximum (75% of salary range)
      await page.mouse.click(sliderBounds!.x + sliderBounds!.width * 0.75, sliderBounds!.y + sliderBounds!.height / 2);
      
      await page.click('[data-testid="apply-filter"]');
      
      // Verify number range filtering
      const rangeRows = await page.locator('.blg-grid-row').all();
      expect(rangeRows.length).toBeGreaterThan(0);
      
      // Get the actual range values from the UI
      const minValue = await page.textContent('[data-testid="range-min-value"]');
      const maxValue = await page.textContent('[data-testid="range-max-value"]');
      
      // Verify all salaries are within range
      for (const row of rangeRows) {
        const salaryCell = row.locator('[data-column="salary"]');
        const salaryText = await salaryCell.textContent();
        const salary = parseFloat(salaryText!.replace(/[^0-9.-]+/g, ''));
        
        expect(salary).toBeGreaterThanOrEqual(parseFloat(minValue!));
        expect(salary).toBeLessThanOrEqual(parseFloat(maxValue!));
      }
    });

    test('should support statistical number filtering', async () => {
      const columnHeader = page.locator('[data-column="salary"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      
      // Test statistical operators
      await page.selectOption('[data-testid="number-operator-select"]', 'topPercent');
      await page.fill('[data-testid="percent-input"]', '10');
      await page.click('[data-testid="apply-filter"]');
      
      // Verify top 10% results
      const topPercentRows = await page.locator('.blg-grid-row').all();
      expect(topPercentRows.length).toBeGreaterThan(0);
      
      // Test standard deviation filtering
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.selectOption('[data-testid="number-operator-select"]', 'withinStdDev');
      await page.fill('[data-testid="std-dev-input"]', '2');
      await page.click('[data-testid="apply-filter"]');
      
      // Verify standard deviation results
      const stdDevRows = await page.locator('.blg-grid-row').all();
      expect(stdDevRows.length).toBeGreaterThan(0);
    });
  });

  test.describe('Filter Combinations and Logic', () => {
    test('should support complex filter combinations with AND/OR logic', async () => {
      // Apply first filter (name contains "John")
      const nameHeader = page.locator('[data-column="name"] .column-header');
      await nameHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.fill('[data-testid="text-filter-input"]', 'John');
      await page.click('[data-testid="apply-filter"]');
      
      const johnRows = await page.locator('.blg-grid-row').count();
      
      // Apply second filter with AND logic (salary > 50000)
      const salaryHeader = page.locator('[data-column="salary"] .column-header');
      await salaryHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.selectOption('[data-testid="number-operator-select"]', 'greaterThan');
      await page.fill('[data-testid="number-filter-input"]', '50000');
      
      // Ensure AND logic is selected
      await expect(page.locator('[data-testid="filter-logic-and"]')).toBeChecked();
      await page.click('[data-testid="apply-filter"]');
      
      const andRows = await page.locator('.blg-grid-row').count();
      expect(andRows).toBeLessThanOrEqual(johnRows);
      
      // Change to OR logic
      await page.click('[data-testid="filter-logic-selector"]');
      await page.click('[data-testid="filter-logic-or"]');
      await page.click('[data-testid="apply-filters"]');
      
      const orRows = await page.locator('.blg-grid-row').count();
      expect(orRows).toBeGreaterThanOrEqual(johnRows);
    });

    test('should support filter groups with nested logic', async () => {
      // Open advanced filter builder
      await page.click('[data-testid="advanced-filter-builder"]');
      await expect(page.locator('[data-testid="filter-builder-canvas"]')).toBeVisible();
      
      // Create first group: (name contains "John" OR name contains "Jane")
      await page.click('[data-testid="add-filter-group"]');
      const group1 = page.locator('[data-testid="filter-group-1"]');
      
      await group1.locator('[data-testid="add-condition"]').click();
      await page.selectOption('[data-testid="condition-column"]', 'name');
      await page.fill('[data-testid="condition-value"]', 'John');
      
      await group1.locator('[data-testid="add-condition"]').click();
      await page.selectOption('[data-testid="condition-column"]', 'name');
      await page.fill('[data-testid="condition-value"]', 'Jane');
      await page.selectOption('[data-testid="group-logic"]', 'OR');
      
      // Create second group: salary > 40000 AND department = "Engineering"
      await page.click('[data-testid="add-filter-group"]');
      const group2 = page.locator('[data-testid="filter-group-2"]');
      
      await group2.locator('[data-testid="add-condition"]').click();
      await page.selectOption('[data-testid="condition-column"]', 'salary');
      await page.selectOption('[data-testid="condition-operator"]', 'greaterThan');
      await page.fill('[data-testid="condition-value"]', '40000');
      
      await group2.locator('[data-testid="add-condition"]').click();
      await page.selectOption('[data-testid="condition-column"]', 'department');
      await page.fill('[data-testid="condition-value"]', 'Engineering');
      
      // Combine groups with AND
      await page.selectOption('[data-testid="groups-logic"]', 'AND');
      
      // Apply complex filter
      await page.click('[data-testid="apply-complex-filter"]');
      
      // Verify complex filtering results
      const complexRows = await page.locator('.blg-grid-row').all();
      expect(complexRows.length).toBeGreaterThan(0);
      
      // Verify results match the complex logic
      for (const row of complexRows) {
        const nameCell = await row.locator('[data-column="name"]').textContent();
        const salaryCell = await row.locator('[data-column="salary"]').textContent();
        const deptCell = await row.locator('[data-column="department"]').textContent();
        
        const salary = parseFloat(salaryCell!.replace(/[^0-9.-]+/g, ''));
        
        // Should match: (name contains "John" OR "Jane") AND (salary > 40000 AND dept = "Engineering")
        const nameMatch = nameCell!.includes('John') || nameCell!.includes('Jane');
        const salaryMatch = salary > 40000;
        const deptMatch = deptCell === 'Engineering';
        
        expect(nameMatch && salaryMatch && deptMatch).toBe(true);
      }
    });
  });

  test.describe('Filter Persistence and Export', () => {
    test('should persist filters across page reloads', async () => {
      // Apply multiple filters
      const nameHeader = page.locator('[data-column="name"] .column-header');
      await nameHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.fill('[data-testid="text-filter-input"]', 'Manager');
      await page.click('[data-testid="apply-filter"]');
      
      const initialRows = await page.locator('.blg-grid-row').count();
      
      // Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="blg-grid"]');
      
      // Verify filters are restored
      await page.waitForSelector('[data-testid="active-filter-chip"]');
      const restoredRows = await page.locator('.blg-grid-row').count();
      
      expect(restoredRows).toBe(initialRows);
      
      // Verify filter chip is visible
      await expect(page.locator('[data-testid="active-filter-chip"]')).toContainText('Manager');
    });

    test('should export and import filter configurations', async () => {
      // Apply complex filters
      await page.click('[data-testid="advanced-filter-builder"]');
      // ... setup complex filters
      await page.click('[data-testid="apply-complex-filter"]');
      
      // Export filter configuration
      await page.click('[data-testid="filter-menu"]');
      await page.click('[data-testid="export-filters"]');
      
      // Wait for download
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="download-json"]')
      ]);
      
      expect(download.suggestedFilename()).toMatch(/filters.*\.json$/);
      
      // Clear filters
      await page.click('[data-testid="clear-all-filters"]');
      const clearedRows = await page.locator('.blg-grid-row').count();
      
      // Import filters
      await page.click('[data-testid="filter-menu"]');
      await page.click('[data-testid="import-filters"]');
      
      // Upload the file (in real test, would use actual file)
      await page.setInputFiles('[data-testid="filter-import-input"]', {
        name: 'test-filters.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify({
          version: '1.0',
          filters: [
            {
              column: 'name',
              operator: 'contains',
              value: 'Manager',
              active: true
            }
          ]
        }))
      });
      
      await page.click('[data-testid="apply-imported-filters"]');
      
      // Verify imported filters work
      const importedRows = await page.locator('.blg-grid-row').count();
      expect(importedRows).toBeLessThan(clearedRows);
      expect(importedRows).toBeGreaterThan(0);
    });
  });

  test.describe('Real-time Filtering Performance', () => {
    test('should provide smooth real-time filtering with debouncing', async () => {
      const columnHeader = page.locator('[data-column="description"] .column-header');
      
      await columnHeader.hover();
      await page.click('[data-testid="filter-menu-trigger"]');
      
      // Enable real-time filtering
      await page.check('[data-testid="enable-realtime-filter"]');
      
      const filterInput = page.locator('[data-testid="text-filter-input"]');
      
      // Type incrementally and verify debouncing
      await filterInput.fill('p');
      await page.waitForTimeout(100); // Less than debounce time
      let rowCount1 = await page.locator('.blg-grid-row').count();
      
      await filterInput.fill('pr');
      await page.waitForTimeout(100);
      let rowCount2 = await page.locator('.blg-grid-row').count();
      
      await filterInput.fill('pro');
      await page.waitForTimeout(100);
      let rowCount3 = await page.locator('.blg-grid-row').count();
      
      await filterInput.fill('proj');
      await page.waitForTimeout(500); // Wait for debounce
      let finalCount = await page.locator('.blg-grid-row').count();
      
      // Verify progressive filtering
      expect(finalCount).toBeLessThanOrEqual(rowCount3);
      expect(rowCount3).toBeLessThanOrEqual(rowCount2);
      expect(rowCount2).toBeLessThanOrEqual(rowCount1);
      
      // Verify filter performance indicator
      await expect(page.locator('[data-testid="filter-performance-good"]')).toBeVisible();
    });
  });

  test.describe('Filter Accessibility', () => {
    test('should be fully accessible with screen readers', async () => {
      const columnHeader = page.locator('[data-column="name"] .column-header');
      
      // Verify ARIA attributes
      await expect(columnHeader).toHaveAttribute('role', 'columnheader');
      await expect(columnHeader).toHaveAttribute('aria-sort', 'none');
      
      // Open filter with keyboard
      await columnHeader.focus();
      await page.keyboard.press('Alt+F');
      
      // Verify filter dialog accessibility
      const filterDialog = page.locator('[data-testid="filter-dialog"]');
      await expect(filterDialog).toHaveAttribute('role', 'dialog');
      await expect(filterDialog).toHaveAttribute('aria-labelledby');
      await expect(filterDialog).toHaveAttribute('aria-describedby');
      
      // Navigate with keyboard
      await page.keyboard.press('Tab'); // Focus filter input
      const filterInput = page.locator('[data-testid="text-filter-input"]');
      await expect(filterInput).toBeFocused();
      await expect(filterInput).toHaveAttribute('aria-label');
      
      // Type filter value
      await page.keyboard.type('Test');
      
      // Navigate to apply button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const applyButton = page.locator('[data-testid="apply-filter"]');
      await expect(applyButton).toBeFocused();
      
      // Apply with keyboard
      await page.keyboard.press('Enter');
      
      // Verify screen reader announcements (aria-live regions)
      await expect(page.locator('[aria-live="polite"]')).toContainText('Filter applied');
    });
  });
});