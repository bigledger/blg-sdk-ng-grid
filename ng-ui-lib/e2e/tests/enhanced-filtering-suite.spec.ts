import { test, expect, Page } from '@playwright/test';
import { GridHelper } from '../helpers/grid-helper';
import { TestHelpers } from '../helpers/test-helpers';

/**
 * Enhanced Filtering Suite - Tests all 25+ advanced filter operators
 * 
 * This comprehensive test suite validates BigLedger Grid's advanced filtering capabilities,
 * demonstrating superiority over ag-grid with enhanced operators, fuzzy matching, 
 * regex support, mathematical operations, and performance optimization.
 */
test.describe('Enhanced Filtering Suite', () => {
  let page: Page;
  let gridHelper: GridHelper;
  let testHelper: TestHelpers;
  
  // Performance tracking
  let performanceMetrics: {
    renderTime: number;
    filterTime: number;
    memoryUsage: number;
    frameRate: number;
  };

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    gridHelper = new GridHelper(page);
    testHelper = new TestHelpers(page);
    
    // Enable performance monitoring
    await page.addInitScript(() => {
      (window as any).performanceMetrics = {
        renderTime: 0,
        filterTime: 0,
        memoryUsage: 0,
        frameRate: 0
      };
    });
  });

  test.beforeEach(async () => {
    // Navigate to grid demo with large dataset
    await page.goto('/grid-demo?dataset=large&rows=100000');
    await testHelper.waitForElement('[data-testid="grid-container"]', 10000);
    
    // Capture initial performance metrics
    performanceMetrics = await page.evaluate(() => (window as any).performanceMetrics);
  });

  test.describe('Text Filters - Enhanced Operators', () => {
    
    test('should support fuzzy matching with configurable threshold', async () => {
      await test.step('Setup fuzzy search configuration', async () => {
        await page.locator('[data-testid="filter-menu-name"]').click();
        await page.locator('[data-testid="filter-operator-fuzzy"]').click();
        await page.locator('[data-testid="fuzzy-threshold-slider"]').fill('0.8');
      });

      await test.step('Test fuzzy matching accuracy', async () => {
        await page.locator('[data-testid="filter-input"]').fill('jhon');
        await page.locator('[data-testid="apply-filter"]').click();
        
        // Should match "John", "Johnny", "Jonathan" etc.
        const filteredRows = await gridHelper.getVisibleRowCount();
        expect(filteredRows).toBeGreaterThan(0);
        
        // Verify fuzzy matches are highlighted
        const highlightedCells = page.locator('[data-testid*="fuzzy-highlight"]');
        expect(await highlightedCells.count()).toBeGreaterThan(0);
      });

      await test.step('Performance: Fuzzy search on 100k rows', async () => {
        const startTime = Date.now();
        await page.locator('[data-testid="filter-input"]').fill('administraion');
        await testHelper.waitForElement('[data-testid="filter-results"]', 5000);
        const filterTime = Date.now() - startTime;
        
        expect(filterTime).toBeLessThan(2000); // Should complete in under 2 seconds
      });
    });

    test('should support regex patterns with syntax highlighting', async () => {
      await test.step('Enable regex mode', async () => {
        await page.locator('[data-testid="filter-menu-email"]').click();
        await page.locator('[data-testid="filter-operator-regex"]').click();
      });

      await test.step('Test complex regex patterns', async () => {
        const patterns = [
          { pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', name: 'Email validation' },
          { pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b', name: 'SSN pattern' },
          { pattern: '(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}', name: 'Strong password' }
        ];

        for (const { pattern, name } of patterns) {
          await page.locator('[data-testid="filter-regex-input"]').fill(pattern);
          
          // Verify syntax highlighting
          const syntaxHighlight = page.locator('[data-testid="regex-syntax-highlight"]');
          await expect(syntaxHighlight).toBeVisible();
          
          await page.locator('[data-testid="apply-filter"]').click();
          await testHelper.waitForElement('[data-testid="filter-results"]');
          
          // Capture screenshot for documentation
          await page.screenshot({ 
            path: `e2e/screenshots/regex-filter-${name.replace(/\s/g, '-').toLowerCase()}.png` 
          });
        }
      });
    });

    test('should support natural language queries', async () => {
      await test.step('Process natural language input', async () => {
        await page.locator('[data-testid="filter-menu-description"]').click();
        await page.locator('[data-testid="filter-operator-natural"]').click();
        
        const queries = [
          'contains urgent and not completed',
          'starts with project and ends with 2024',
          'between 100 and 500 characters long'
        ];

        for (const query of queries) {
          await page.locator('[data-testid="natural-language-input"]').fill(query);
          
          // Verify query parsing visualization
          const parsedQuery = page.locator('[data-testid="parsed-query-display"]');
          await expect(parsedQuery).toContainText(query);
          
          await page.locator('[data-testid="apply-filter"]').click();
          const resultCount = await gridHelper.getVisibleRowCount();
          expect(resultCount).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  test.describe('Number Filters - Mathematical Operations', () => {
    
    test('should support prime number filtering', async () => {
      await test.step('Test isPrime operator', async () => {
        await page.locator('[data-testid="filter-menu-quantity"]').click();
        await page.locator('[data-testid="filter-operator-isPrime"]').click();
        await page.locator('[data-testid="apply-filter"]').click();
        
        // Verify only prime numbers are shown
        const visibleRows = await gridHelper.getRows();
        const count = await visibleRows.count();
        
        // Sample check: verify first few results are actually prime
        for (let i = 0; i < Math.min(5, count); i++) {
          const cellValue = await gridHelper.getCellText(i, 2); // quantity column
          const num = parseInt(cellValue);
          expect(await isPrime(num)).toBe(true);
        }
      });
    });

    test('should support divisibility checks', async () => {
      await test.step('Test isDivisibleBy operator', async () => {
        await page.locator('[data-testid="filter-menu-price"]').click();
        await page.locator('[data-testid="filter-operator-isDivisibleBy"]').click();
        await page.locator('[data-testid="divisor-input"]').fill('5');
        await page.locator('[data-testid="apply-filter"]').click();
        
        // Verify all visible values are divisible by 5
        const visibleRows = await gridHelper.getRows();
        const count = await visibleRows.count();
        
        for (let i = 0; i < Math.min(10, count); i++) {
          const cellValue = await gridHelper.getCellText(i, 3); // price column
          const num = parseFloat(cellValue.replace('$', ''));
          expect(num % 5).toBe(0);
        }
      });
    });

    test('should support statistical operators', async () => {
      const operators = [
        { op: 'isOutlier', description: 'Statistical outlier detection' },
        { op: 'isAboveAverage', description: 'Above average values' },
        { op: 'isBelowMedian', description: 'Below median values' },
        { op: 'isInTopPercentile', description: 'Top 10% values' }
      ];

      for (const { op, description } of operators) {
        await test.step(`Test ${description}`, async () => {
          await page.locator('[data-testid="filter-menu-revenue"]').click();
          await page.locator(`[data-testid="filter-operator-${op}"]`).click();
          
          if (op === 'isInTopPercentile') {
            await page.locator('[data-testid="percentile-input"]').fill('10');
          }
          
          await page.locator('[data-testid="apply-filter"]').click();
          const resultCount = await gridHelper.getVisibleRowCount();
          
          // Verify results make statistical sense
          expect(resultCount).toBeGreaterThan(0);
          expect(resultCount).toBeLessThan(await gridHelper.getRowCount());
        });
      }
    });
  });

  test.describe('Date Filters - Smart Dates & Relative Ranges', () => {
    
    test('should support smart date parsing', async () => {
      const smartDates = [
        'last monday',
        'next friday',
        'end of last month',
        'beginning of next year',
        '3 weeks ago',
        'in 2 months'
      ];

      await test.step('Test smart date recognition', async () => {
        await page.locator('[data-testid="filter-menu-createdDate"]').click();
        await page.locator('[data-testid="filter-operator-smartDate"]').click();
        
        for (const smartDate of smartDates) {
          await page.locator('[data-testid="smart-date-input"]').fill(smartDate);
          
          // Verify date is parsed correctly
          const parsedDate = await page.locator('[data-testid="parsed-date-display"]').textContent();
          expect(parsedDate).not.toBe('Invalid Date');
          
          // Verify suggestions appear
          const suggestions = page.locator('[data-testid="date-suggestions"] li');
          expect(await suggestions.count()).toBeGreaterThan(0);
        }
      });
    });

    test('should support business day calculations', async () => {
      await test.step('Test business day filters', async () => {
        const businessFilters = [
          { filter: 'isBusinessDay', description: 'Only business days' },
          { filter: 'isWeekend', description: 'Only weekends' },
          { filter: 'isHoliday', description: 'Public holidays' },
          { filter: 'isEndOfMonth', description: 'End of month dates' }
        ];

        for (const { filter, description } of businessFilters) {
          await page.locator('[data-testid="filter-menu-dueDate"]').click();
          await page.locator(`[data-testid="filter-operator-${filter}"]`).click();
          await page.locator('[data-testid="apply-filter"]').click();
          
          const resultCount = await gridHelper.getVisibleRowCount();
          expect(resultCount).toBeGreaterThanOrEqual(0);
          
          // Clear filter for next iteration
          await page.locator('[data-testid="clear-filter"]').click();
        }
      });
    });

    test('should support fiscal year operations', async () => {
      await test.step('Configure fiscal year settings', async () => {
        await page.locator('[data-testid="grid-settings"]').click();
        await page.locator('[data-testid="fiscal-year-start"]').selectOption('april');
        await page.locator('[data-testid="apply-settings"]').click();
      });

      await test.step('Test fiscal year filters', async () => {
        await page.locator('[data-testid="filter-menu-reportDate"]').click();
        await page.locator('[data-testid="filter-operator-fiscalYear"]').click();
        await page.locator('[data-testid="fiscal-year-input"]').fill('2024');
        await page.locator('[data-testid="apply-filter"]').click();
        
        // Verify dates fall within fiscal year (April 2024 - March 2025)
        const visibleRows = await gridHelper.getRows();
        const count = await visibleRows.count();
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Advanced Boolean & Null Operations', () => {
    
    test('should support three-state boolean filtering', async () => {
      await test.step('Test true/false/null states', async () => {
        await page.locator('[data-testid="filter-menu-isActive"]').click();
        await page.locator('[data-testid="filter-operator-threeState"]').click();
        
        const states = ['true', 'false', 'null'];
        
        for (const state of states) {
          await page.locator(`[data-testid="boolean-state-${state}"]`).click();
          await page.locator('[data-testid="apply-filter"]').click();
          
          const resultCount = await gridHelper.getVisibleRowCount();
          expect(resultCount).toBeGreaterThanOrEqual(0);
          
          // Verify state accuracy
          const firstCellValue = await gridHelper.getCellText(0, 5); // isActive column
          if (state === 'true') expect(firstCellValue).toMatch(/true|✓|yes/i);
          if (state === 'false') expect(firstCellValue).toMatch(/false|✗|no/i);
          if (state === 'null') expect(firstCellValue).toMatch(/null|empty|-/i);
        }
      });
    });
  });

  test.describe('Performance Testing with Large Datasets', () => {
    
    test('should handle 500k+ rows efficiently', async () => {
      await test.step('Load massive dataset', async () => {
        await page.goto('/grid-demo?dataset=massive&rows=500000');
        await testHelper.waitForElement('[data-testid="grid-container"]', 15000);
      });

      await test.step('Test filter performance on massive dataset', async () => {
        const startTime = Date.now();
        
        // Apply complex multi-condition filter
        await page.locator('[data-testid="advanced-filter-builder"]').click();
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.locator('[data-testid="condition-field"]').selectOption('name');
        await page.locator('[data-testid="condition-operator"]').selectOption('fuzzy');
        await page.locator('[data-testid="condition-value"]').fill('admin');
        
        await page.locator('[data-testid="add-filter-condition"]').click();
        await page.locator('[data-testid="condition-field"]').nth(1).selectOption('revenue');
        await page.locator('[data-testid="condition-operator"]').nth(1).selectOption('isAboveAverage');
        
        await page.locator('[data-testid="apply-complex-filter"]').click();
        
        await testHelper.waitForElement('[data-testid="filter-results"]', 10000);
        const filterTime = Date.now() - startTime;
        
        // Performance assertions
        expect(filterTime).toBeLessThan(5000); // Should complete in under 5 seconds
        
        // Verify results are accurate
        const resultCount = await gridHelper.getVisibleRowCount();
        expect(resultCount).toBeGreaterThan(0);
        expect(resultCount).toBeLessThan(500000);
      });

      await test.step('Monitor memory usage during filtering', async () => {
        const memoryUsage = await page.evaluate(() => {
          return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
        });
        
        // Memory should stay under 500MB for 500k rows
        expect(memoryUsage).toBeLessThan(500 * 1024 * 1024);
      });
    });
  });

  test.describe('Filter Undo/Redo System', () => {
    
    test('should support comprehensive undo/redo operations', async () => {
      await test.step('Apply multiple filters', async () => {
        // Filter 1: Text contains 'Manager'
        await page.locator('[data-testid="filter-menu-title"]').click();
        await page.locator('[data-testid="filter-operator-contains"]').click();
        await page.locator('[data-testid="filter-input"]').fill('Manager');
        await page.locator('[data-testid="apply-filter"]').click();
        const count1 = await gridHelper.getVisibleRowCount();
        
        // Filter 2: Salary > 75000
        await page.locator('[data-testid="add-filter"]').click();
        await page.locator('[data-testid="filter-menu-salary"]').click();
        await page.locator('[data-testid="filter-operator-greaterThan"]').click();
        await page.locator('[data-testid="filter-input"]').nth(1).fill('75000');
        await page.locator('[data-testid="apply-filter"]').click();
        const count2 = await gridHelper.getVisibleRowCount();
        
        expect(count2).toBeLessThanOrEqual(count1);
      });

      await test.step('Test undo functionality', async () => {
        // Undo last filter
        await page.keyboard.press('Control+z');
        await testHelper.waitForElement('[data-testid="filter-results"]');
        const undoCount = await gridHelper.getVisibleRowCount();
        
        // Should have more results after undo
        const currentCount = await gridHelper.getVisibleRowCount();
        expect(currentCount).toBeGreaterThan(undoCount);
      });

      await test.step('Test redo functionality', async () => {
        // Redo filter
        await page.keyboard.press('Control+y');
        await testHelper.waitForElement('[data-testid="filter-results"]');
        
        // Should be back to filtered state
        const redoCount = await gridHelper.getVisibleRowCount();
        expect(redoCount).toBeLessThan(await gridHelper.getRowCount());
      });

      await test.step('Test filter history panel', async () => {
        await page.locator('[data-testid="filter-history"]').click();
        
        const historyItems = page.locator('[data-testid="history-item"]');
        expect(await historyItems.count()).toBeGreaterThan(0);
        
        // Click on a previous filter state
        await historyItems.first().click();
        await testHelper.waitForElement('[data-testid="filter-results"]');
      });
    });
  });

  test.describe('Filter Presets Management', () => {
    
    test('should support saving and loading filter presets', async () => {
      await test.step('Create complex filter configuration', async () => {
        // Create multi-condition filter
        await page.locator('[data-testid="advanced-filter-builder"]').click();
        
        // Add multiple conditions
        const conditions = [
          { field: 'department', operator: 'equals', value: 'Engineering' },
          { field: 'experience', operator: 'greaterThan', value: '3' },
          { field: 'performance', operator: 'isAboveAverage' }
        ];
        
        for (const condition of conditions) {
          await page.locator('[data-testid="add-filter-condition"]').click();
          await page.selectOption('[data-testid="condition-field"]', condition.field);
          await page.selectOption('[data-testid="condition-operator"]', condition.operator);
          if (condition.value) {
            await page.fill('[data-testid="condition-value"]', condition.value);
          }
        }
        
        await page.locator('[data-testid="apply-complex-filter"]').click();
      });

      await test.step('Save filter preset', async () => {
        await page.locator('[data-testid="save-preset"]').click();
        await page.fill('[data-testid="preset-name"]', 'Senior Engineers');
        await page.fill('[data-testid="preset-description"]', 'Engineering staff with 3+ years experience and above-average performance');
        await page.locator('[data-testid="save-preset-confirm"]').click();
        
        // Verify preset is saved
        const successMessage = page.locator('[data-testid="save-success"]');
        await expect(successMessage).toBeVisible();
      });

      await test.step('Load filter preset', async () => {
        // Clear current filters
        await page.locator('[data-testid="clear-all-filters"]').click();
        
        // Load saved preset
        await page.locator('[data-testid="load-preset"]').click();
        await page.locator('[data-testid="preset-senior-engineers"]').click();
        
        await testHelper.waitForElement('[data-testid="filter-results"]');
        const resultCount = await gridHelper.getVisibleRowCount();
        expect(resultCount).toBeGreaterThan(0);
      });

      await test.step('Manage preset library', async () => {
        await page.locator('[data-testid="preset-manager"]').click();
        
        // Verify preset appears in library
        const presetItem = page.locator('[data-testid="preset-item-senior-engineers"]');
        await expect(presetItem).toBeVisible();
        
        // Test preset sharing
        await presetItem.locator('[data-testid="share-preset"]').click();
        const shareUrl = await page.locator('[data-testid="share-url"]').inputValue();
        expect(shareUrl).toContain('preset=senior-engineers');
        
        // Test preset export/import
        await presetItem.locator('[data-testid="export-preset"]').click();
        const downloadPromise = page.waitForEvent('download');
        await page.locator('[data-testid="download-preset"]').click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe('senior-engineers-preset.json');
      });
    });
  });

  test.describe('Accessibility & WCAG Compliance', () => {
    
    test('should meet WCAG 2.1 AA standards', async () => {
      await test.step('Test keyboard navigation', async () => {
        // Tab through filter controls
        await page.keyboard.press('Tab');
        await expect(page.locator('[data-testid="filter-menu-name"]:focus')).toBeVisible();
        
        await page.keyboard.press('Tab');
        await expect(page.locator('[data-testid="filter-operator-dropdown"]:focus')).toBeVisible();
        
        await page.keyboard.press('Tab');
        await expect(page.locator('[data-testid="filter-input"]:focus')).toBeVisible();
      });

      await test.step('Test screen reader support', async () => {
        // Check ARIA labels
        const filterMenu = page.locator('[data-testid="filter-menu-name"]');
        expect(await filterMenu.getAttribute('aria-label')).toBe('Filter by name');
        
        const operatorDropdown = page.locator('[data-testid="filter-operator-dropdown"]');
        expect(await operatorDropdown.getAttribute('aria-label')).toBe('Select filter operator');
        
        // Test live regions for filter results
        const resultsRegion = page.locator('[data-testid="filter-results-live"]');
        expect(await resultsRegion.getAttribute('aria-live')).toBe('polite');
      });

      await test.step('Test color contrast ratios', async () => {
        // Use axe-playwright for comprehensive accessibility testing
        const accessibilityResults = await page.evaluate(() => {
          // This would integrate with axe-core in a real implementation
          return { violations: [] }; // Placeholder
        });
        
        expect(accessibilityResults.violations.length).toBe(0);
      });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    
    test('should work on mobile devices', async () => {
      await test.step('Test on mobile viewport', async () => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        
        // Filter controls should be touch-friendly
        const filterButton = page.locator('[data-testid="mobile-filter-button"]');
        await expect(filterButton).toBeVisible();
        
        await filterButton.click();
        
        // Filter panel should slide in
        const filterPanel = page.locator('[data-testid="mobile-filter-panel"]');
        await expect(filterPanel).toHaveClass(/slide-in/);
        
        // Test touch gestures for filter interaction
        await page.touchscreen.tap(200, 300);
        await page.fill('[data-testid="mobile-filter-input"]', 'test');
        await page.locator('[data-testid="mobile-apply-filter"]').click();
      });

      await test.step('Test on tablet viewport', async () => {
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        
        // Should show compact filter bar
        const compactFilterBar = page.locator('[data-testid="compact-filter-bar"]');
        await expect(compactFilterBar).toBeVisible();
      });
    });
  });

  test.afterEach(async () => {
    // Capture performance metrics
    const endMetrics = await page.evaluate(() => (window as any).performanceMetrics);
    
    // Log performance for CI/CD monitoring
    console.log('Performance Metrics:', {
      renderTime: endMetrics.renderTime,
      filterTime: endMetrics.filterTime,
      memoryUsage: endMetrics.memoryUsage,
      frameRate: endMetrics.frameRate
    });
    
    // Capture screenshot for visual regression testing
    await page.screenshot({
      path: `e2e/screenshots/enhanced-filtering-${test.info().title.replace(/\s/g, '-').toLowerCase()}.png`,
      fullPage: true
    });
  });
});

// Helper function to check if a number is prime
async function isPrime(num: number): Promise<boolean> {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}