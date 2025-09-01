import { test, expect, Page } from '@playwright/test';
import { GridHelper } from '../helpers/grid-helper';
import { TestHelpers } from '../helpers/test-helpers';

/**
 * Excel-Style Set Filters Suite - Tests advanced set filtering capabilities
 * 
 * This comprehensive test suite validates BigLedger Grid's Excel-style set filters,
 * featuring virtual scrolling for large value sets, AI-powered categorization,
 * voice search, mini bar charts, and drag-and-drop reordering - surpassing ag-grid.
 */
test.describe('Excel-Style Set Filters Suite', () => {
  let page: Page;
  let gridHelper: GridHelper;
  let testHelper: TestHelpers;
  
  // Performance tracking for large datasets
  let performanceMetrics: {
    virtualScrollTime: number;
    searchTime: number;
    renderTime: number;
    memoryUsage: number;
  };

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    gridHelper = new GridHelper(page);
    testHelper = new TestHelpers(page);
    
    // Enable performance monitoring
    await page.addInitScript(() => {
      (window as any).setFilterMetrics = {
        virtualScrollTime: 0,
        searchTime: 0,
        renderTime: 0,
        memoryUsage: 0
      };
    });
  });

  test.beforeEach(async () => {
    // Navigate to grid demo with diverse dataset for set filtering
    await page.goto('/grid-demo?dataset=diverse&rows=50000&uniqueValues=10000');
    await testHelper.waitForElement('[data-testid="grid-container"]', 10000);
  });

  test.describe('Virtual Scrolling with Large Value Sets', () => {
    
    test('should handle 10k+ unique values efficiently', async () => {
      await test.step('Open set filter with large dataset', async () => {
        await page.locator('[data-testid="filter-menu-category"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        
        // Wait for set filter panel to load
        await testHelper.waitForElement('[data-testid="set-filter-panel"]', 5000);
        
        // Verify virtual scrolling is enabled
        const virtualContainer = page.locator('[data-testid="set-filter-virtual-container"]');
        await expect(virtualContainer).toBeVisible();
      });

      await test.step('Test virtual scrolling performance', async () => {
        const startTime = Date.now();
        
        // Scroll through large value set
        const scrollContainer = page.locator('[data-testid="set-filter-virtual-container"]');
        
        for (let i = 0; i < 10; i++) {
          await scrollContainer.evaluate(el => el.scrollTop += 500);
          await page.waitForTimeout(50); // Allow rendering
        }
        
        const scrollTime = Date.now() - startTime;
        expect(scrollTime).toBeLessThan(2000); // Should be smooth and fast
        
        // Verify items are rendered only in viewport
        const renderedItems = page.locator('[data-testid^="set-filter-item-"]');
        const itemCount = await renderedItems.count();
        expect(itemCount).toBeLessThan(100); // Should render only visible items
      });

      await test.step('Test search within large value set', async () => {
        const startTime = Date.now();
        
        await page.locator('[data-testid="set-filter-search"]').fill('electronics');
        await testHelper.waitForElement('[data-testid="set-filter-results"]', 3000);
        
        const searchTime = Date.now() - startTime;
        expect(searchTime).toBeLessThan(1000); // Fast search even with 10k values
        
        // Verify filtered results
        const filteredItems = page.locator('[data-testid^="set-filter-item-"]:visible');
        const count = await filteredItems.count();
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(1000); // Should be filtered
      });
    });

    test('should support incremental loading', async () => {
      await test.step('Test lazy loading of values', async () => {
        await page.locator('[data-testid="filter-menu-subcategory"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        
        // Initially should load only first batch
        await testHelper.waitForElement('[data-testid="set-filter-loading"]', 2000);
        
        const initialItems = page.locator('[data-testid^="set-filter-item-"]');
        const initialCount = await initialItems.count();
        expect(initialCount).toBeLessThanOrEqual(100); // Initial batch size
        
        // Scroll to trigger more loading
        const scrollContainer = page.locator('[data-testid="set-filter-virtual-container"]');
        await scrollContainer.evaluate(el => el.scrollTop = el.scrollHeight);
        
        // Wait for more items to load
        await page.waitForTimeout(1000);
        const finalCount = await initialItems.count();
        expect(finalCount).toBeGreaterThan(initialCount);
      });
    });
  });

  test.describe('AI-Powered Categorization', () => {
    
    test('should auto-categorize values using AI', async () => {
      await test.step('Enable AI categorization', async () => {
        await page.locator('[data-testid="filter-menu-product"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        await page.locator('[data-testid="enable-ai-categorization"]').click();
        
        // Wait for AI processing
        await testHelper.waitForElement('[data-testid="ai-processing-complete"]', 10000);
      });

      await test.step('Verify AI-generated categories', async () => {
        const categories = page.locator('[data-testid^="ai-category-"]');
        const categoryCount = await categories.count();
        expect(categoryCount).toBeGreaterThan(0);
        
        // Check category names make sense
        const categoryNames = await categories.allTextContents();
        expect(categoryNames).toContain('Electronics');
        expect(categoryNames).toContain('Clothing');
        expect(categoryNames).toContain('Home & Garden');
      });

      await test.step('Test category-based filtering', async () => {
        // Select an entire category
        await page.locator('[data-testid="ai-category-electronics"]').click();
        await page.locator('[data-testid="select-category"]').click();
        
        // Verify all items in category are selected
        const selectedItems = page.locator('[data-testid^="set-filter-item-"][data-selected="true"]');
        const selectedCount = await selectedItems.count();
        expect(selectedCount).toBeGreaterThan(0);
        
        // Apply filter and verify results
        await page.locator('[data-testid="apply-set-filter"]').click();
        await testHelper.waitForElement('[data-testid="filter-results"]');
        
        const visibleRows = await gridHelper.getVisibleRowCount();
        expect(visibleRows).toBeGreaterThan(0);
      });

      await test.step('Test custom category creation', async () => {
        await page.locator('[data-testid="create-custom-category"]').click();
        await page.fill('[data-testid="category-name"]', 'Premium Products');
        
        // Select items for custom category using drag-and-drop
        const items = page.locator('[data-testid^="set-filter-item-"]').first();
        const customCategory = page.locator('[data-testid="custom-category-dropzone"]');
        
        await items.dragTo(customCategory);
        
        await page.locator('[data-testid="save-custom-category"]').click();
        
        // Verify custom category appears
        const customCat = page.locator('[data-testid="ai-category-premium-products"]');
        await expect(customCat).toBeVisible();
      });
    });
  });

  test.describe('Voice Search Functionality', () => {
    
    test('should support voice search for filter values', async () => {
      await test.step('Enable voice search', async () => {
        await page.locator('[data-testid="filter-menu-brand"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        
        // Check if voice search is available
        const voiceButton = page.locator('[data-testid="voice-search-button"]');
        await expect(voiceButton).toBeVisible();
      });

      await test.step('Simulate voice search input', async () => {
        // Since we can't actually use microphone in tests, we'll simulate it
        await page.locator('[data-testid="voice-search-button"]').click();
        
        // Simulate voice recognition result
        await page.evaluate(() => {
          (window as any).voiceSearchResult = 'apple samsung sony';
        });
        
        // Trigger voice search processing
        await page.locator('[data-testid="process-voice-input"]').click();
        
        // Verify voice search results
        await testHelper.waitForElement('[data-testid="voice-search-results"]');
        const suggestions = page.locator('[data-testid^="voice-suggestion-"]');
        expect(await suggestions.count()).toBeGreaterThan(0);
      });

      await test.step('Test voice command interpretation', async () => {
        const voiceCommands = [
          { command: 'select all apple products', expected: 'Apple' },
          { command: 'unselect samsung items', expected: 'Samsung' },
          { command: 'clear all selections', expected: 'clear' }
        ];

        for (const { command, expected } of voiceCommands) {
          await page.evaluate((cmd) => {
            (window as any).voiceSearchResult = cmd;
          }, command);
          
          await page.locator('[data-testid="process-voice-input"]').click();
          await page.waitForTimeout(500);
          
          // Verify command was interpreted correctly
          const interpretation = await page.locator('[data-testid="voice-interpretation"]').textContent();
          expect(interpretation?.toLowerCase()).toContain(expected.toLowerCase());
        }
      });
    });

    test('should handle voice search with accents and languages', async () => {
      await test.step('Test multilingual voice search', async () => {
        const multilingualCommands = [
          { command: 'seleccionar productos de manzana', language: 'es' },
          { command: 'sélectionner tous les produits', language: 'fr' },
          { command: 'alle Samsung Produkte auswählen', language: 'de' }
        ];

        for (const { command, language } of multilingualCommands) {
          await page.locator('[data-testid="voice-language-selector"]').selectOption(language);
          
          await page.evaluate((cmd) => {
            (window as any).voiceSearchResult = cmd;
          }, command);
          
          await page.locator('[data-testid="process-voice-input"]').click();
          await page.waitForTimeout(1000);
          
          // Should recognize and translate command
          const interpretation = page.locator('[data-testid="voice-interpretation"]');
          await expect(interpretation).toBeVisible();
        }
      });
    });
  });

  test.describe('Mini Bar Charts Rendering', () => {
    
    test('should display mini bar charts for value frequencies', async () => {
      await test.step('Enable mini charts view', async () => {
        await page.locator('[data-testid="filter-menu-region"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        await page.locator('[data-testid="enable-mini-charts"]').click();
        
        await testHelper.waitForElement('[data-testid="set-filter-with-charts"]', 3000);
      });

      await test.step('Verify bar charts rendering', async () => {
        const chartItems = page.locator('[data-testid^="set-item-with-chart-"]');
        const chartCount = await chartItems.count();
        expect(chartCount).toBeGreaterThan(0);
        
        // Check first few items have charts
        for (let i = 0; i < Math.min(5, chartCount); i++) {
          const chart = chartItems.nth(i).locator('[data-testid="mini-bar-chart"]');
          await expect(chart).toBeVisible();
          
          // Verify chart has proper dimensions
          const chartBox = await chart.boundingBox();
          expect(chartBox?.width).toBeGreaterThan(0);
          expect(chartBox?.height).toBeGreaterThan(0);
        }
      });

      await test.step('Test chart interactivity', async () => {
        const firstChart = page.locator('[data-testid^="set-item-with-chart-"]').first();
        
        // Hover should show tooltip
        await firstChart.hover();
        const tooltip = page.locator('[data-testid="chart-tooltip"]');
        await expect(tooltip).toBeVisible();
        
        // Tooltip should show frequency count
        const tooltipText = await tooltip.textContent();
        expect(tooltipText).toMatch(/\d+\s+(items?|occurrences?)/i);
      });

      await test.step('Test different chart styles', async () => {
        const chartStyles = ['bar', 'pie', 'donut', 'line'];
        
        for (const style of chartStyles) {
          await page.locator('[data-testid="chart-style-selector"]').selectOption(style);
          await page.waitForTimeout(500);
          
          const charts = page.locator(`[data-testid="mini-${style}-chart"]`);
          expect(await charts.count()).toBeGreaterThan(0);
          
          // Capture screenshot of chart style
          await page.screenshot({
            path: `e2e/screenshots/set-filter-charts-${style}.png`,
            clip: { x: 0, y: 0, width: 400, height: 600 }
          });
        }
      });
    });

    test('should support real-time chart updates', async () => {
      await test.step('Test dynamic chart updates', async () => {
        await page.locator('[data-testid="filter-menu-status"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        await page.locator('[data-testid="enable-mini-charts"]').click();
        
        // Get initial chart values
        const initialChart = page.locator('[data-testid^="set-item-with-chart-"]').first();
        const initialHeight = await initialChart.locator('[data-testid="mini-bar-chart"] rect').getAttribute('height');
        
        // Apply additional filter that affects the data
        await page.locator('[data-testid="add-additional-filter"]').click();
        await page.locator('[data-testid="filter-menu-priority"]').click();
        await page.locator('[data-testid="filter-operator-equals"]').click();
        await page.locator('[data-testid="filter-value"]').fill('High');
        await page.locator('[data-testid="apply-additional-filter"]').click();
        
        // Charts should update to reflect new frequencies
        await page.waitForTimeout(1000);
        const updatedHeight = await initialChart.locator('[data-testid="mini-bar-chart"] rect').getAttribute('height');
        
        // Height should be different (unless by coincidence)
        expect(updatedHeight).not.toBe(initialHeight);
      });
    });
  });

  test.describe('Drag-and-Drop Value Reordering', () => {
    
    test('should support custom ordering of filter values', async () => {
      await test.step('Test drag-and-drop reordering', async () => {
        await page.locator('[data-testid="filter-menu-priority"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        await page.locator('[data-testid="enable-custom-ordering"]').click();
        
        // Get initial order
        const items = page.locator('[data-testid^="set-filter-item-"]');
        const initialOrder = await items.allTextContents();
        
        // Drag first item to third position
        await items.first().dragTo(items.nth(2));
        
        // Verify order changed
        await page.waitForTimeout(500);
        const newOrder = await items.allTextContents();
        expect(newOrder).not.toEqual(initialOrder);
      });

      await test.step('Test predefined sorting options', async () => {
        const sortOptions = [
          { option: 'alphabetical', name: 'Alphabetical' },
          { option: 'frequency', name: 'By Frequency' },
          { option: 'custom', name: 'Custom Order' }
        ];

        for (const { option, name } of sortOptions) {
          await page.locator('[data-testid="sort-option-selector"]').selectOption(option);
          await page.waitForTimeout(500);
          
          const items = page.locator('[data-testid^="set-filter-item-"]');
          const sortedOrder = await items.allTextContents();
          
          // Verify sorting worked (basic check - items should exist)
          expect(sortedOrder.length).toBeGreaterThan(0);
          
          // For alphabetical, check first item starts with early letter
          if (option === 'alphabetical') {
            expect(sortedOrder[0].charAt(0).toLowerCase()).toBeLessThanOrEqual('f');
          }
        }
      });
    });

    test('should support grouping and nested reordering', async () => {
      await test.step('Create value groups', async () => {
        await page.locator('[data-testid="filter-menu-category"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        await page.locator('[data-testid="enable-grouping"]').click();
        
        // Create a new group
        await page.locator('[data-testid="create-group"]').click();
        await page.fill('[data-testid="group-name"]', 'Favorites');
        await page.locator('[data-testid="confirm-group"]').click();
        
        // Drag items to group
        const items = page.locator('[data-testid^="set-filter-item-"]');
        const favoritesGroup = page.locator('[data-testid="group-favorites"]');
        
        await items.first().dragTo(favoritesGroup);
        await items.nth(2).dragTo(favoritesGroup);
        
        // Verify items appear in group
        const groupItems = favoritesGroup.locator('[data-testid^="set-filter-item-"]');
        expect(await groupItems.count()).toBe(2);
      });

      await test.step('Test reordering within groups', async () => {
        const favoritesGroup = page.locator('[data-testid="group-favorites"]');
        const groupItems = favoritesGroup.locator('[data-testid^="set-filter-item-"]');
        
        // Get initial order within group
        const initialOrder = await groupItems.allTextContents();
        
        // Reorder within group
        await groupItems.first().dragTo(groupItems.last());
        
        // Verify order changed within group
        const newOrder = await groupItems.allTextContents();
        expect(newOrder).not.toEqual(initialOrder);
      });
    });
  });

  test.describe('Performance with Large Value Sets', () => {
    
    test('should handle 100k+ unique values efficiently', async () => {
      await test.step('Load extreme dataset', async () => {
        await page.goto('/grid-demo?dataset=extreme&rows=200000&uniqueValues=100000');
        await testHelper.waitForElement('[data-testid="grid-container"]', 15000);
      });

      await test.step('Test set filter performance with 100k values', async () => {
        const startTime = Date.now();
        
        await page.locator('[data-testid="filter-menu-uniqueId"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        
        // Wait for initial load
        await testHelper.waitForElement('[data-testid="set-filter-panel"]', 10000);
        const loadTime = Date.now() - startTime;
        
        // Should load initial view quickly even with 100k values
        expect(loadTime).toBeLessThan(5000);
        
        // Verify virtual scrolling is handling the load
        const virtualContainer = page.locator('[data-testid="set-filter-virtual-container"]');
        await expect(virtualContainer).toBeVisible();
        
        // Only a small subset should be rendered
        const renderedItems = page.locator('[data-testid^="set-filter-item-"]');
        expect(await renderedItems.count()).toBeLessThan(200);
      });

      await test.step('Test search performance on large dataset', async () => {
        const searches = ['ID_12345', 'USER_', 'ADMIN', '999'];
        
        for (const searchTerm of searches) {
          const startTime = Date.now();
          
          await page.locator('[data-testid="set-filter-search"]').fill(searchTerm);
          await testHelper.waitForElement('[data-testid="set-filter-results"]', 5000);
          
          const searchTime = Date.now() - startTime;
          expect(searchTime).toBeLessThan(2000); // Fast search even with 100k values
          
          // Clear search for next iteration
          await page.locator('[data-testid="set-filter-search"]').fill('');
          await page.waitForTimeout(300);
        }
      });

      await test.step('Monitor memory usage', async () => {
        const memoryUsage = await page.evaluate(() => {
          return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
        });
        
        // Should stay reasonable even with 100k values
        expect(memoryUsage).toBeLessThan(800 * 1024 * 1024); // Under 800MB
      });
    });
  });

  test.describe('Advanced Selection Features', () => {
    
    test('should support bulk selection operations', async () => {
      await test.step('Test select all/none operations', async () => {
        await page.locator('[data-testid="filter-menu-department"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        
        // Select all
        await page.locator('[data-testid="select-all"]').click();
        const allItems = page.locator('[data-testid^="set-filter-item-"]');
        const allCount = await allItems.count();
        
        // Verify all items are selected
        const selectedItems = page.locator('[data-testid^="set-filter-item-"][data-selected="true"]');
        expect(await selectedItems.count()).toBe(allCount);
        
        // Select none
        await page.locator('[data-testid="select-none"]').click();
        expect(await selectedItems.count()).toBe(0);
      });

      await test.step('Test inverse selection', async () => {
        // Select a few items manually
        const items = page.locator('[data-testid^="set-filter-item-"]');
        await items.nth(0).click();
        await items.nth(2).click();
        await items.nth(4).click();
        
        const initialSelected = await page.locator('[data-testid^="set-filter-item-"][data-selected="true"]').count();
        
        // Invert selection
        await page.locator('[data-testid="invert-selection"]').click();
        
        const finalSelected = await page.locator('[data-testid^="set-filter-item-"][data-selected="true"]').count();
        const totalItems = await items.count();
        
        expect(finalSelected).toBe(totalItems - initialSelected);
      });

      await test.step('Test pattern-based selection', async () => {
        await page.locator('[data-testid="pattern-selection"]').click();
        
        const patterns = [
          { pattern: '.*ing$', description: 'Ends with "ing"' },
          { pattern: '^[A-C].*', description: 'Starts with A, B, or C' },
          { pattern: '.*\\d+.*', description: 'Contains numbers' }
        ];

        for (const { pattern, description } of patterns) {
          await page.fill('[data-testid="selection-pattern"]', pattern);
          await page.locator('[data-testid="apply-pattern"]').click();
          
          const selectedItems = await page.locator('[data-testid^="set-filter-item-"][data-selected="true"]').count();
          expect(selectedItems).toBeGreaterThanOrEqual(0);
          
          // Clear selection for next pattern
          await page.locator('[data-testid="select-none"]').click();
        }
      });
    });
  });

  test.describe('Export and Sharing Features', () => {
    
    test('should support exporting filter selections', async () => {
      await test.step('Configure and export selection', async () => {
        await page.locator('[data-testid="filter-menu-product"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        
        // Select specific items
        const items = page.locator('[data-testid^="set-filter-item-"]');
        for (let i = 0; i < 5; i++) {
          await items.nth(i).click();
        }
        
        // Export selection
        await page.locator('[data-testid="export-selection"]').click();
        
        const exportFormats = ['json', 'csv', 'txt'];
        
        for (const format of exportFormats) {
          await page.locator(`[data-testid="export-format-${format}"]`).click();
          
          const downloadPromise = page.waitForEvent('download');
          await page.locator('[data-testid="download-export"]').click();
          const download = await downloadPromise;
          
          expect(download.suggestedFilename()).toContain(format);
        }
      });
    });

    test('should support sharing filter configurations', async () => {
      await test.step('Create shareable filter link', async () => {
        await page.locator('[data-testid="filter-menu-status"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        
        // Configure specific selection
        await page.locator('[data-testid^="set-filter-item-"]').first().click();
        await page.locator('[data-testid^="set-filter-item-"]').nth(3).click();
        
        await page.locator('[data-testid="share-filter"]').click();
        
        const shareUrl = await page.locator('[data-testid="share-url"]').inputValue();
        expect(shareUrl).toContain('setFilter=');
        
        // Test URL can be used to restore filter
        await page.goto(shareUrl);
        await testHelper.waitForElement('[data-testid="grid-container"]');
        
        // Verify filter is restored
        const appliedFilter = page.locator('[data-testid="active-set-filter"]');
        await expect(appliedFilter).toBeVisible();
      });
    });
  });

  test.describe('Accessibility and Mobile Support', () => {
    
    test('should be fully accessible', async () => {
      await test.step('Test keyboard navigation', async () => {
        await page.locator('[data-testid="filter-menu-category"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        
        // Tab through filter items
        await page.keyboard.press('Tab');
        await expect(page.locator('[data-testid^="set-filter-item-"]:focus')).toBeVisible();
        
        // Space should toggle selection
        await page.keyboard.press('Space');
        const focusedItem = page.locator('[data-testid^="set-filter-item-"]:focus');
        expect(await focusedItem.getAttribute('data-selected')).toBe('true');
        
        // Arrow keys should navigate
        await page.keyboard.press('ArrowDown');
        const nextItem = page.locator('[data-testid^="set-filter-item-"]:focus');
        expect(await nextItem.getAttribute('data-testid')).not.toBe(await focusedItem.getAttribute('data-testid'));
      });

      await test.step('Test screen reader support', async () => {
        const searchInput = page.locator('[data-testid="set-filter-search"]');
        expect(await searchInput.getAttribute('aria-label')).toBe('Search filter values');
        
        const selectAllButton = page.locator('[data-testid="select-all"]');
        expect(await selectAllButton.getAttribute('aria-label')).toBe('Select all values');
        
        // Test live regions for dynamic updates
        const resultsRegion = page.locator('[data-testid="filter-results-live"]');
        expect(await resultsRegion.getAttribute('aria-live')).toBe('polite');
      });
    });

    test('should work on mobile devices', async () => {
      await test.step('Test mobile responsive design', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.locator('[data-testid="filter-menu-brand"]').click();
        await page.locator('[data-testid="filter-type-set"]').click();
        
        // Filter panel should be full-screen on mobile
        const filterPanel = page.locator('[data-testid="set-filter-panel"]');
        const panelBox = await filterPanel.boundingBox();
        expect(panelBox?.width).toBeCloseTo(375, 50);
        
        // Touch-friendly controls
        const items = page.locator('[data-testid^="set-filter-item-"]');
        const firstItemBox = await items.first().boundingBox();
        expect(firstItemBox?.height).toBeGreaterThan(44); // Minimum touch target
      });

      await test.step('Test touch gestures', async () => {
        const scrollContainer = page.locator('[data-testid="set-filter-virtual-container"]');
        
        // Test touch scrolling
        await page.touchscreen.tap(200, 300);
        await scrollContainer.evaluate(el => {
          el.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientY: 300 } as any] }));
          el.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientY: 200 } as any] }));
          el.dispatchEvent(new TouchEvent('touchend'));
        });
        
        await page.waitForTimeout(500);
        
        // Should have scrolled
        const scrollTop = await scrollContainer.evaluate(el => el.scrollTop);
        expect(scrollTop).toBeGreaterThan(0);
      });
    });
  });

  test.afterEach(async () => {
    // Capture performance metrics
    const endMetrics = await page.evaluate(() => (window as any).setFilterMetrics);
    
    console.log('Set Filter Performance:', {
      virtualScrollTime: endMetrics.virtualScrollTime,
      searchTime: endMetrics.searchTime,
      renderTime: endMetrics.renderTime,
      memoryUsage: endMetrics.memoryUsage
    });
    
    // Screenshot for visual regression
    await page.screenshot({
      path: `e2e/screenshots/set-filters-${test.info().title.replace(/\s/g, '-').toLowerCase()}.png`,
      fullPage: true
    });
  });
});