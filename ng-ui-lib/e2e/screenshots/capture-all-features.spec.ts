import { test, expect, Page, BrowserContext } from '@playwright/test';
import { GridPage } from '../pages/grid-page';

/**
 * Comprehensive Screenshot Capture Suite for BigLedger Grid
 * Captures high-quality screenshots of all advanced features for documentation and marketing
 */
test.describe('BigLedger Grid - Feature Screenshot Capture', () => {
  let page: Page;
  let context: BrowserContext;
  let gridPage: GridPage;
  
  const screenshotDir = './e2e/screenshots/features/';
  const viewports = [
    { name: 'desktop-4k', width: 3840, height: 2160 },
    { name: 'desktop-1080p', width: 1920, height: 1080 },
    { name: 'laptop', width: 1366, height: 768 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 }
  ];
  
  const themes = ['light', 'dark', 'high-contrast'];

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      permissions: ['microphone'], // For voice features
      colorScheme: 'light',
      reducedMotion: 'no-preference'
    });
  });

  test.beforeEach(async () => {
    page = await context.newPage();
    gridPage = new GridPage(page);
    await gridPage.gotoAdvancedFeaturesDemo();
    await gridPage.loadDataset('showcase'); // Special dataset for screenshots
    await gridPage.waitForGridToLoad();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Enhanced Filtering System Screenshots', () => {
    test('capture fuzzy matching in action', async () => {
      await gridPage.openEnhancedFilter('customerName');
      await page.fill('[data-testid="filter-input"]', 'Jhon'); // Intentional typo
      await page.waitForTimeout(500);
      
      // Show fuzzy match suggestions
      await page.locator('[data-testid="fuzzy-suggestions"]').waitFor();
      
      await page.screenshot({
        path: `${screenshotDir}filtering/fuzzy-matching-suggestions.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 800, height: 600 }
      });
      
      // Capture with results highlighted
      await page.click('[data-testid="apply-fuzzy-match"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}filtering/fuzzy-matching-results.png`,
        fullPage: true
      });
    });

    test('capture advanced mathematical filters', async () => {
      await gridPage.openEnhancedFilter('employeeId');
      await page.selectOption('[data-testid="filter-operator"]', 'isPrime');
      await page.click('[data-testid="apply-filter"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}filtering/is-prime-filter.png`,
        fullPage: true
      });
      
      // Capture statistical outliers
      await page.selectOption('[data-testid="filter-operator"]', 'isOutlier');
      await page.click('[data-testid="apply-filter"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}filtering/statistical-outlier-filter.png`,
        fullPage: true
      });
    });

    test('capture smart date filtering', async () => {
      await gridPage.openEnhancedFilter('orderDate');
      await page.fill('[data-testid="date-filter-input"]', 'last quarter');
      await page.waitForTimeout(500);
      
      // Show smart date interpretation
      await page.locator('[data-testid="date-interpretation"]').waitFor();
      
      await page.screenshot({
        path: `${screenshotDir}filtering/smart-date-last-quarter.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 800, height: 400 }
      });
      
      // Capture business days filter
      await page.fill('[data-testid="date-filter-input"]', 'next 5 business days');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}filtering/business-days-filter.png`,
        fullPage: true
      });
    });

    test('capture filter undo/redo system', async () => {
      // Apply multiple filters to build history
      await gridPage.applyTextFilter('customerName', 'contains', 'John');
      await gridPage.applyNumberFilter('orderAmount', 'greaterThan', 1000);
      await gridPage.applyDateFilter('orderDate', 'lastNDays', 30);
      
      // Open undo/redo panel
      await page.click('[data-testid="filter-history-toggle"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}filtering/filter-history-panel.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 400, height: 600 }
      });
      
      // Capture undo in action
      await page.click('[data-testid="undo-filter"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}filtering/filter-undo-action.png`,
        fullPage: true
      });
    });
  });

  test.describe('Excel-Style Set Filters Screenshots', () => {
    test('capture set filter with virtual scrolling', async () => {
      await gridPage.openSetFilter('category');
      await page.waitForTimeout(500);
      
      // Capture the full set filter UI
      await page.screenshot({
        path: `${screenshotDir}set-filters/excel-style-interface.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 600, height: 800 }
      });
      
      // Scroll to show virtual scrolling
      await page.locator('[data-testid="set-filter-list"]').evaluate(el => {
        el.scrollTop = 5000;
      });
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}set-filters/virtual-scrolling-10k-values.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 600, height: 800 }
      });
    });

    test('capture AI-powered categorization', async () => {
      await gridPage.openSetFilter('productName');
      await page.click('[data-testid="enable-ai-categorization"]');
      await page.waitForTimeout(1000); // Wait for AI processing
      
      await page.screenshot({
        path: `${screenshotDir}set-filters/ai-categorization.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 700, height: 900 }
      });
      
      // Expand a category to show nested items
      await page.click('[data-testid="category-electronics"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}set-filters/ai-category-expanded.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 700, height: 900 }
      });
    });

    test('capture mini bar charts in set filter', async () => {
      await gridPage.openSetFilter('department');
      await page.click('[data-testid="show-value-distribution"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}set-filters/mini-bar-charts.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 600, height: 800 }
      });
      
      // Switch to pie chart view
      await page.selectOption('[data-testid="chart-type"]', 'pie');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}set-filters/mini-pie-charts.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 600, height: 800 }
      });
    });

    test('capture voice search in set filter', async () => {
      await gridPage.openSetFilter('customerName');
      await page.click('[data-testid="voice-search-button"]');
      
      // Show voice input UI
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}set-filters/voice-search-interface.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 600, height: 400 }
      });
      
      // Simulate voice input result
      await page.fill('[data-testid="set-filter-search"]', 'customers from California');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}set-filters/voice-search-results.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 600, height: 800 }
      });
    });
  });

  test.describe('Advanced Keyboard Navigation Screenshots', () => {
    test('capture Vi/Vim mode navigation', async () => {
      await page.keyboard.press('Escape'); // Enter Vi normal mode
      await page.click('[data-testid="show-keyboard-overlay"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}keyboard/vim-mode-overlay.png`,
        fullPage: true
      });
      
      // Show command palette
      await page.keyboard.type(':');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}keyboard/vim-command-palette.png`,
        fullPage: false,
        clip: { x: 100, y: 500, width: 800, height: 200 }
      });
    });

    test('capture WASD gaming controls', async () => {
      await page.keyboard.press('Control+Alt+G'); // Enable gaming mode
      await page.click('[data-testid="show-gaming-controls"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}keyboard/wasd-gaming-controls.png`,
        fullPage: true
      });
      
      // Show sprint mode indicator
      await page.keyboard.down('Shift');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}keyboard/wasd-sprint-mode.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 400, height: 200 }
      });
      
      await page.keyboard.up('Shift');
    });

    test('capture chess knight navigation pattern', async () => {
      await page.keyboard.press('Alt+Shift+K'); // Enable knight mode
      await page.click('[data-testid="show-navigation-pattern"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}keyboard/chess-knight-pattern.png`,
        fullPage: true
      });
    });

    test('capture macro recording interface', async () => {
      await page.keyboard.press('F3'); // Start macro recording
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}keyboard/macro-recording-indicator.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 400, height: 150 }
      });
      
      // Record some actions
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      
      await page.keyboard.press('F3'); // Stop recording
      
      // Show macro management panel
      await page.click('[data-testid="manage-macros"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}keyboard/macro-management-panel.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 600, height: 800 }
      });
    });

    test('capture accessibility features', async () => {
      // Enable high contrast mode
      await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}keyboard/high-contrast-mode.png`,
        fullPage: true
      });
      
      // Show screen reader announcements
      await page.click('[data-testid="show-screen-reader-panel"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}keyboard/screen-reader-announcements.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 600, height: 400 }
      });
    });
  });

  test.describe('Column Groups Screenshots', () => {
    test('capture multi-level column groups', async () => {
      await gridPage.enableColumnGroups();
      await gridPage.createNestedGroups(5); // 5 levels deep
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}column-groups/multi-level-groups.png`,
        fullPage: true
      });
      
      // Collapse a group
      await page.click('[data-testid="group-toggle-financial"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}column-groups/collapsed-group.png`,
        fullPage: true
      });
    });

    test('capture AI-powered auto-grouping', async () => {
      await page.click('[data-testid="ai-auto-group"]');
      
      // Show AI analysis in progress
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}column-groups/ai-grouping-analysis.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 600, height: 400 }
      });
      
      // Wait for AI to complete
      await page.waitForSelector('[data-testid="ai-grouping-complete"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}column-groups/ai-grouped-columns.png`,
        fullPage: true
      });
    });

    test('capture drag-and-drop column grouping', async () => {
      // Start dragging a column
      const column = await page.locator('[data-testid="column-header-price"]');
      await column.hover();
      await page.mouse.down();
      
      // Move to create group
      const dropZone = await page.locator('[data-testid="group-drop-zone-financial"]');
      await dropZone.hover();
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}column-groups/drag-drop-grouping.png`,
        fullPage: true
      });
      
      await page.mouse.up();
    });

    test('capture group analytics dashboard', async () => {
      await page.click('[data-testid="show-group-analytics"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}column-groups/analytics-dashboard.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 1200, height: 800 }
      });
      
      // Show performance metrics
      await page.click('[data-testid="analytics-tab-performance"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}column-groups/performance-metrics.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 1200, height: 800 }
      });
    });
  });

  test.describe('Multi-Filter Visual Builder Screenshots', () => {
    test('capture visual filter builder interface', async () => {
      await page.click('[data-testid="open-multi-filter"]');
      await page.click('[data-testid="visual-builder-mode"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}multi-filter/visual-builder-interface.png`,
        fullPage: true
      });
      
      // Add some filter conditions
      await page.dragAndDrop(
        '[data-testid="filter-block-text"]',
        '[data-testid="builder-canvas"]'
      );
      await page.dragAndDrop(
        '[data-testid="filter-block-number"]',
        '[data-testid="builder-canvas"]'
      );
      await page.dragAndDrop(
        '[data-testid="logic-operator-and"]',
        '[data-testid="builder-canvas"]'
      );
      
      // Connect the blocks
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}multi-filter/connected-filter-blocks.png`,
        fullPage: true
      });
    });

    test('capture natural language query interface', async () => {
      await page.click('[data-testid="open-multi-filter"]');
      await page.click('[data-testid="natural-language-mode"]');
      await page.waitForTimeout(300);
      
      // Type a natural language query
      await page.fill(
        '[data-testid="nlp-input"]',
        'Show me customers from California who ordered more than $1000 worth of electronics in the last quarter'
      );
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}multi-filter/natural-language-query.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 1000, height: 600 }
      });
      
      // Show parsed query visualization
      await page.click('[data-testid="show-parsed-query"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}multi-filter/parsed-query-visualization.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 1000, height: 600 }
      });
    });

    test('capture advanced logical operators', async () => {
      await page.click('[data-testid="open-multi-filter"]');
      await page.click('[data-testid="advanced-mode"]');
      
      // Create XOR operation
      await page.selectOption('[data-testid="logic-operator-1"]', 'XOR');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}multi-filter/xor-operator.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 800, height: 400 }
      });
      
      // Show truth table
      await page.click('[data-testid="show-truth-table"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}multi-filter/logic-truth-table.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 600, height: 600 }
      });
    });

    test('capture formula editor with syntax highlighting', async () => {
      await page.click('[data-testid="open-multi-filter"]');
      await page.click('[data-testid="formula-mode"]');
      await page.waitForTimeout(300);
      
      // Type a complex formula
      const formula = `
        (customerType == "Premium" AND orderAmount > 5000) OR
        (customerType == "Regular" AND orderAmount > 10000 AND 
         orderDate >= DATE_SUB(NOW(), INTERVAL 30 DAY))
      `;
      
      await page.fill('[data-testid="formula-editor"]', formula);
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}multi-filter/formula-syntax-highlighting.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 1000, height: 400 }
      });
      
      // Show IntelliSense suggestions
      await page.keyboard.press('Control+Space');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}multi-filter/formula-intellisense.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 1000, height: 500 }
      });
    });
  });

  test.describe('Performance Comparison Screenshots', () => {
    test('capture performance comparison with ag-grid', async () => {
      await page.goto('http://localhost:4200/performance-comparison');
      await page.waitForTimeout(1000);
      
      // Run performance tests
      await page.click('[data-testid="run-performance-test"]');
      await page.waitForSelector('[data-testid="test-complete"]', { timeout: 30000 });
      
      await page.screenshot({
        path: `${screenshotDir}performance/ag-grid-comparison.png`,
        fullPage: true
      });
      
      // Capture detailed metrics
      await page.click('[data-testid="show-detailed-metrics"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}performance/detailed-metrics.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 1200, height: 800 }
      });
    });

    test('capture memory usage comparison', async () => {
      await page.goto('http://localhost:4200/memory-comparison');
      await page.waitForTimeout(1000);
      
      // Load large dataset
      await page.click('[data-testid="load-500k-rows"]');
      await page.waitForTimeout(5000);
      
      await page.screenshot({
        path: `${screenshotDir}performance/memory-usage-500k.png`,
        fullPage: false,
        clip: { x: 100, y: 100, width: 1200, height: 600 }
      });
    });

    test('capture bundle size comparison', async () => {
      await page.goto('http://localhost:4200/bundle-analysis');
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: `${screenshotDir}performance/bundle-size-comparison.png`,
        fullPage: true
      });
    });
  });

  test.describe('Responsive Design Screenshots', () => {
    for (const viewport of viewports) {
      test(`capture grid at ${viewport.name} resolution`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        await page.screenshot({
          path: `${screenshotDir}responsive/${viewport.name}-grid.png`,
          fullPage: true
        });
        
        // Capture with filters open
        await page.click('[data-testid="open-filter-panel"]');
        await page.waitForTimeout(300);
        
        await page.screenshot({
          path: `${screenshotDir}responsive/${viewport.name}-with-filters.png`,
          fullPage: true
        });
      });
    }
  });

  test.describe('Theme Variations Screenshots', () => {
    for (const theme of themes) {
      test(`capture grid with ${theme} theme`, async () => {
        await page.evaluate((t) => {
          document.documentElement.setAttribute('data-theme', t);
        }, theme);
        await page.waitForTimeout(500);
        
        await page.screenshot({
          path: `${screenshotDir}themes/${theme}-theme.png`,
          fullPage: true
        });
        
        // Capture filter UI in theme
        await gridPage.openEnhancedFilter('customerName');
        await page.waitForTimeout(300);
        
        await page.screenshot({
          path: `${screenshotDir}themes/${theme}-filter-ui.png`,
          fullPage: false,
          clip: { x: 100, y: 100, width: 600, height: 800 }
        });
      });
    }
  });

  test.describe('Marketing Hero Screenshots', () => {
    test('capture hero banner showcase', async () => {
      await page.goto('http://localhost:4200/showcase');
      await page.waitForTimeout(1000);
      
      // Set up perfect dataset
      await page.click('[data-testid="load-showcase-data"]');
      await page.waitForTimeout(1000);
      
      // Enable all premium features
      await page.click('[data-testid="enable-all-features"]');
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `${screenshotDir}marketing/hero-banner.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      // Capture with floating elements
      await page.hover('[data-testid="grid-cell-0-0"]');
      await page.waitForTimeout(300);
      
      await page.screenshot({
        path: `${screenshotDir}marketing/feature-highlights.png`,
        fullPage: true
      });
    });

    test('capture side-by-side comparison with ag-grid', async () => {
      await page.goto('http://localhost:4200/comparison-demo');
      await page.waitForTimeout(1000);
      
      // Load both grids
      await page.click('[data-testid="load-comparison"]');
      await page.waitForTimeout(2000);
      
      // Start performance test
      await page.click('[data-testid="start-race"]');
      await page.waitForTimeout(5000);
      
      await page.screenshot({
        path: `${screenshotDir}marketing/performance-race.png`,
        fullPage: true
      });
    });
  });
});

// Helper function to create animated GIFs from screenshots
test.describe('Animated Feature Demonstrations', () => {
  test('create animated filter demonstration', async ({ page }) => {
    const frames = [];
    const gridPage = new GridPage(page);
    
    await gridPage.gotoAdvancedFeaturesDemo();
    await gridPage.loadDataset('showcase');
    await gridPage.waitForGridToLoad();
    
    // Frame 1: Initial state
    frames.push(await page.screenshot({ fullPage: true }));
    
    // Frame 2: Open filter
    await gridPage.openEnhancedFilter('customerName');
    await page.waitForTimeout(300);
    frames.push(await page.screenshot({ fullPage: true }));
    
    // Frame 3: Type search
    await page.fill('[data-testid="filter-input"]', 'John');
    await page.waitForTimeout(300);
    frames.push(await page.screenshot({ fullPage: true }));
    
    // Frame 4: Show results
    await page.click('[data-testid="apply-filter"]');
    await page.waitForTimeout(500);
    frames.push(await page.screenshot({ fullPage: true }));
    
    // Save frames for GIF creation
    for (let i = 0; i < frames.length; i++) {
      await page.screenshot({
        path: `${screenshotDir}animations/filter-demo-frame-${i}.png`,
        fullPage: true
      });
    }
  });
});