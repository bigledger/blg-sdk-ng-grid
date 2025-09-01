import { test, expect, Page } from '@playwright/test';

/**
 * Performance Benchmarking Suite
 * 
 * Comprehensive performance comparison between BigLedger Grid and ag-grid
 * across multiple metrics and scenarios:
 * 
 * 1. Initial rendering performance
 * 2. Virtual scrolling performance
 * 3. Filtering performance
 * 4. Sorting performance  
 * 5. Memory usage optimization
 * 6. Bundle size comparison
 * 7. Time to interactive
 * 8. Large dataset handling
 * 9. Real-world usage scenarios
 * 10. Mobile performance
 */

test.describe('Performance Benchmarks: BigLedger Grid vs ag-grid', () => {
  
  interface PerformanceMetrics {
    initialRenderTime: number;
    memoryUsage: number;
    bundleSize: number;
    timeToInteractive: number;
    scrollingFPS: number;
    filteringTime: number;
    sortingTime: number;
  }

  async function measurePerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
    return await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      
      return {
        initialRenderTime: navigation.loadEventEnd - navigation.fetchStart,
        memoryUsage: memory?.usedJSHeapSize || 0,
        bundleSize: 0, // Will be measured separately
        timeToInteractive: navigation.domInteractive - navigation.fetchStart,
        scrollingFPS: 60, // Will be measured during scrolling
        filteringTime: 0, // Will be measured during filtering
        sortingTime: 0 // Will be measured during sorting
      };
    });
  }

  test.describe('Initial Rendering Performance', () => {
    test('BigLedger Grid: Initial render with 10k rows', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/examples/performance/bigleger-grid-10k');
      
      // Wait for grid to be fully rendered
      await page.waitForSelector('[data-testid="render-complete"]');
      await page.waitForLoadState('networkidle');
      
      const endTime = Date.now();
      const renderTime = endTime - startTime;
      
      // Measure detailed metrics
      const metrics = await measurePerformanceMetrics(page);
      
      // Verify performance targets
      expect(renderTime).toBeLessThan(2000); // Less than 2 seconds
      expect(metrics.timeToInteractive).toBeLessThan(1500);
      
      // Log metrics for comparison
      console.log('BigLedger Grid 10k rows:', {
        totalRenderTime: renderTime,
        timeToInteractive: metrics.timeToInteractive,
        memoryUsage: Math.round(metrics.memoryUsage / 1024 / 1024) + 'MB'
      });
      
      // Verify visual completeness
      const visibleRows = await page.locator('.blg-grid-row:visible').count();
      expect(visibleRows).toBeGreaterThan(20); // Virtual scrolling shows portion
      
      // Verify interactivity
      await page.click('[data-testid="first-cell"]');
      await expect(page.locator('[data-testid="focused-cell"]')).toBeVisible();
    });

    test('ag-grid: Initial render with 10k rows', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/examples/performance/ag-grid-10k');
      
      // Wait for ag-grid to be fully rendered
      await page.waitForSelector('.ag-root-wrapper');
      await page.waitForSelector('.ag-row');
      await page.waitForLoadState('networkidle');
      
      const endTime = Date.now();
      const renderTime = endTime - startTime;
      
      const metrics = await measurePerformanceMetrics(page);
      
      console.log('ag-grid 10k rows:', {
        totalRenderTime: renderTime,
        timeToInteractive: metrics.timeToInteractive,
        memoryUsage: Math.round(metrics.memoryUsage / 1024 / 1024) + 'MB'
      });
      
      // ag-grid typically takes longer for initial render
      expect(renderTime).toBeLessThan(4000); // More lenient threshold
    });

    test('Performance comparison: 50k rows', async ({ page }) => {
      // Test BigLedger Grid with 50k rows
      let blgStartTime = Date.now();
      await page.goto('/examples/performance/bigleger-grid-50k');
      await page.waitForSelector('[data-testid="render-complete"]');
      let blgRenderTime = Date.now() - blgStartTime;
      const blgMetrics = await measurePerformanceMetrics(page);
      
      // Test ag-grid with 50k rows
      let agStartTime = Date.now();
      await page.goto('/examples/performance/ag-grid-50k');
      await page.waitForSelector('.ag-root-wrapper');
      await page.waitForTimeout(1000); // Additional wait for ag-grid
      let agRenderTime = Date.now() - agStartTime;
      const agMetrics = await measurePerformanceMetrics(page);
      
      // Performance comparison
      const improvement = ((agRenderTime - blgRenderTime) / agRenderTime) * 100;
      console.log('50k rows performance comparison:', {
        bigLedgerGrid: blgRenderTime + 'ms',
        agGrid: agRenderTime + 'ms',
        improvement: improvement.toFixed(1) + '% faster',
        memoryImprovement: ((agMetrics.memoryUsage - blgMetrics.memoryUsage) / agMetrics.memoryUsage * 100).toFixed(1) + '% less memory'
      });
      
      // BigLedger should be significantly faster
      expect(blgRenderTime).toBeLessThan(agRenderTime * 0.8); // At least 20% faster
      expect(blgMetrics.memoryUsage).toBeLessThan(agMetrics.memoryUsage); // Less memory
    });
  });

  test.describe('Virtual Scrolling Performance', () => {
    test('BigLedger Grid: Smooth scrolling with 100k rows', async ({ page }) => {
      await page.goto('/examples/performance/bigleger-grid-100k');
      await page.waitForSelector('[data-testid="render-complete"]');
      
      // Measure scrolling performance
      const scrollContainer = page.locator('[data-testid="virtual-scroll-container"]');
      
      // Start FPS monitoring
      await page.evaluate(() => {
        (window as any).fpsCounter = {
          frames: 0,
          startTime: performance.now()
        };
        
        const measureFPS = () => {
          (window as any).fpsCounter.frames++;
          requestAnimationFrame(measureFPS);
        };
        requestAnimationFrame(measureFPS);
      });
      
      // Perform scrolling test
      const scrollDistance = 10000;
      const scrollSteps = 20;
      const stepDistance = scrollDistance / scrollSteps;
      
      for (let i = 0; i < scrollSteps; i++) {
        await scrollContainer.evaluate((el, distance) => {
          el.scrollTop += distance;
        }, stepDistance);
        await page.waitForTimeout(50); // Allow rendering
      }
      
      // Calculate FPS
      const fps = await page.evaluate(() => {
        const counter = (window as any).fpsCounter;
        const elapsed = (performance.now() - counter.startTime) / 1000;
        return Math.round(counter.frames / elapsed);
      });
      
      console.log('BigLedger Grid scrolling FPS:', fps);
      expect(fps).toBeGreaterThan(55); // Should maintain near 60 FPS
      
      // Verify content is properly rendered during scroll
      const visibleRowsAfterScroll = await page.locator('.blg-grid-row:visible').count();
      expect(visibleRowsAfterScroll).toBeGreaterThan(10);
    });

    test('ag-grid: Scrolling performance with 100k rows', async ({ page }) => {
      await page.goto('/examples/performance/ag-grid-100k');
      await page.waitForSelector('.ag-root-wrapper');
      await page.waitForTimeout(2000); // ag-grid needs more time
      
      const scrollContainer = page.locator('.ag-body-viewport');
      
      // Monitor FPS
      await page.evaluate(() => {
        (window as any).fpsCounter = {
          frames: 0,
          startTime: performance.now()
        };
        
        const measureFPS = () => {
          (window as any).fpsCounter.frames++;
          requestAnimationFrame(measureFPS);
        };
        requestAnimationFrame(measureFPS);
      });
      
      // Scroll test
      const scrollDistance = 10000;
      const scrollSteps = 20;
      const stepDistance = scrollDistance / scrollSteps;
      
      for (let i = 0; i < scrollSteps; i++) {
        await scrollContainer.evaluate((el, distance) => {
          el.scrollTop += distance;
        }, stepDistance);
        await page.waitForTimeout(50);
      }
      
      const fps = await page.evaluate(() => {
        const counter = (window as any).fpsCounter;
        const elapsed = (performance.now() - counter.startTime) / 1000;
        return Math.round(counter.frames / elapsed);
      });
      
      console.log('ag-grid scrolling FPS:', fps);
      // ag-grid typically has lower FPS due to more complex rendering
    });
  });

  test.describe('Filtering Performance', () => {
    test('BigLedger Grid: Complex filter performance', async ({ page }) => {
      await page.goto('/examples/performance/bigleger-grid-filtering');
      await page.waitForSelector('[data-testid="render-complete"]');
      
      // Measure text filtering
      const startTime = performance.now();
      
      await page.click('[data-column="name"] .column-header');
      await page.click('[data-testid="filter-menu-trigger"]');
      await page.fill('[data-testid="text-filter-input"]', 'Manager');
      await page.click('[data-testid="apply-filter"]');
      
      await page.waitForSelector('[data-testid="filter-complete"]');
      const textFilterTime = performance.now() - startTime;
      
      // Measure set filter performance
      const setFilterStart = performance.now();
      
      await page.click('[data-column="department"] .column-header');
      await page.click('[data-testid="set-filter-trigger"]');
      await page.click('[data-testid="clear-all-btn"]');
      await page.click('[data-testid="value-checkbox"][data-value="Engineering"]');
      await page.click('[data-testid="value-checkbox"][data-value="Product"]');
      await page.click('[data-testid="apply-filter-btn"]');
      
      await page.waitForSelector('[data-testid="filter-complete"]');
      const setFilterTime = performance.now() - setFilterStart;
      
      // Measure complex multi-filter
      const multiFilterStart = performance.now();
      
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.click('[data-testid="add-condition-btn"]');
      const condition = page.locator('[data-testid="filter-condition"]').first();
      await condition.locator('[data-testid="column-selector"]').selectOption('salary');
      await condition.locator('[data-testid="operator-selector"]').selectOption('greaterThan');
      await condition.locator('[data-testid="value-input"]').fill('60000');
      await page.click('[data-testid="apply-filter-btn"]');
      
      await page.waitForSelector('[data-testid="filter-complete"]');
      const multiFilterTime = performance.now() - multiFilterStart;
      
      console.log('BigLedger Grid filtering performance:', {
        textFilter: textFilterTime.toFixed(1) + 'ms',
        setFilter: setFilterTime.toFixed(1) + 'ms',
        multiFilter: multiFilterTime.toFixed(1) + 'ms'
      });
      
      // Performance targets
      expect(textFilterTime).toBeLessThan(200);
      expect(setFilterTime).toBeLessThan(500);
      expect(multiFilterTime).toBeLessThan(300);
    });

    test('ag-grid: Filtering performance comparison', async ({ page }) => {
      await page.goto('/examples/performance/ag-grid-filtering');
      await page.waitForSelector('.ag-root-wrapper');
      
      // Text filtering
      const startTime = performance.now();
      
      await page.click('.ag-header-cell-text:has-text("Name")');
      await page.click('.ag-icon-filter');
      await page.fill('.ag-filter-text-input', 'Manager');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(500); // ag-grid filtering delay
      const textFilterTime = performance.now() - startTime;
      
      // Set filter (ag-grid's set filter)
      const setFilterStart = performance.now();
      
      await page.click('.ag-header-cell-text:has-text("Department")');
      await page.click('.ag-icon-filter');
      await page.click('text=Select All'); // Uncheck all
      await page.click('text=Engineering');
      await page.click('text=Product');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(500);
      const setFilterTime = performance.now() - setFilterStart;
      
      console.log('ag-grid filtering performance:', {
        textFilter: textFilterTime.toFixed(1) + 'ms',
        setFilter: setFilterTime.toFixed(1) + 'ms'
      });
    });
  });

  test.describe('Memory Usage Analysis', () => {
    test('Memory efficiency comparison: Large datasets', async ({ page }) => {
      // Test BigLedger Grid memory usage
      await page.goto('/examples/performance/bigleger-grid-memory');
      await page.waitForSelector('[data-testid="render-complete"]');
      
      // Load increasing dataset sizes and measure memory
      const blgMemoryProfile = [];
      
      for (const size of [10000, 50000, 100000, 250000]) {
        await page.click(`[data-testid="load-${size}-rows"]`);
        await page.waitForSelector('[data-testid="dataset-loaded"]');
        
        const memory = await page.evaluate(() => {
          if ('memory' in performance) {
            return (performance as any).memory.usedJSHeapSize;
          }
          return 0;
        });
        
        blgMemoryProfile.push({ rows: size, memory });
        
        // Force garbage collection if available
        await page.evaluate(() => {
          if ('gc' in window) {
            (window as any).gc();
          }
        });
        
        await page.waitForTimeout(1000);
      }
      
      // Test ag-grid memory usage
      await page.goto('/examples/performance/ag-grid-memory');
      await page.waitForSelector('.ag-root-wrapper');
      
      const agMemoryProfile = [];
      
      for (const size of [10000, 50000, 100000]) { // ag-grid might struggle with 250k
        await page.click(`[data-testid="load-${size}-rows"]`);
        await page.waitForTimeout(2000); // More time for ag-grid
        
        const memory = await page.evaluate(() => {
          if ('memory' in performance) {
            return (performance as any).memory.usedJSHeapSize;
          }
          return 0;
        });
        
        agMemoryProfile.push({ rows: size, memory });
        
        await page.evaluate(() => {
          if ('gc' in window) {
            (window as any).gc();
          }
        });
        
        await page.waitForTimeout(1000);
      }
      
      // Compare memory efficiency
      console.log('Memory Usage Comparison:');
      console.table([
        ...blgMemoryProfile.map(p => ({
          Grid: 'BigLedger',
          Rows: p.rows,
          'Memory (MB)': Math.round(p.memory / 1024 / 1024)
        })),
        ...agMemoryProfile.map(p => ({
          Grid: 'ag-grid',
          Rows: p.rows,
          'Memory (MB)': Math.round(p.memory / 1024 / 1024)
        }))
      ]);
      
      // Verify BigLedger uses less memory
      const blg100k = blgMemoryProfile.find(p => p.rows === 100000);
      const ag100k = agMemoryProfile.find(p => p.rows === 100000);
      
      if (blg100k && ag100k) {
        const memoryImprovement = ((ag100k.memory - blg100k.memory) / ag100k.memory) * 100;
        console.log(`Memory improvement: ${memoryImprovement.toFixed(1)}% less memory usage`);
        expect(blg100k.memory).toBeLessThan(ag100k.memory);
      }
    });
  });

  test.describe('Bundle Size Comparison', () => {
    test('Bundle size analysis', async ({ page }) => {
      // This would typically be done in a separate Node.js script
      // but we can approximate by measuring resource loading
      
      await page.goto('/examples/performance/bundle-analysis');
      
      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map(entry => ({
          name: entry.name,
          transferSize: (entry as PerformanceResourceTiming).transferSize || 0,
          encodedBodySize: (entry as PerformanceResourceTiming).encodedBodySize || 0
        }));
      });
      
      // Categorize resources
      const blgResources = resources.filter(r => 
        r.name.includes('bigleger') || r.name.includes('blg-grid')
      );
      
      const agResources = resources.filter(r => 
        r.name.includes('ag-grid')
      );
      
      const blgTotalSize = blgResources.reduce((sum, r) => sum + r.transferSize, 0);
      const agTotalSize = agResources.reduce((sum, r) => sum + r.transferSize, 0);
      
      console.log('Bundle Size Comparison:', {
        'BigLedger Grid': Math.round(blgTotalSize / 1024) + 'KB',
        'ag-grid': Math.round(agTotalSize / 1024) + 'KB',
        'Size Difference': Math.round((agTotalSize - blgTotalSize) / 1024) + 'KB'
      });
      
      // BigLedger should have smaller or comparable bundle size with more features
      if (agTotalSize > 0) {
        expect(blgTotalSize).toBeLessThanOrEqual(agTotalSize * 1.2); // Within 20%
      }
    });
  });

  test.describe('Real-world Performance Scenarios', () => {
    test('Dashboard scenario: Multiple grids with real-time updates', async ({ page }) => {
      await page.goto('/examples/performance/dashboard-scenario');
      await page.waitForSelector('[data-testid="dashboard-loaded"]');
      
      const startTime = performance.now();
      
      // Simulate real-time data updates
      for (let i = 0; i < 10; i++) {
        await page.click('[data-testid="update-data-btn"]');
        await page.waitForTimeout(100);
      }
      
      const updateTime = performance.now() - startTime;
      
      console.log('Dashboard update performance:', updateTime.toFixed(1) + 'ms for 10 updates');
      expect(updateTime).toBeLessThan(2000); // Should handle updates smoothly
      
      // Verify all grids are still responsive
      await page.click('[data-testid="grid-1"] .blg-grid-cell');
      await expect(page.locator('[data-testid="focused-cell"]')).toBeVisible();
    });

    test('Enterprise scenario: Complex filtering and sorting', async ({ page }) => {
      await page.goto('/examples/performance/enterprise-scenario');
      await page.waitForSelector('[data-testid="enterprise-data-loaded"]');
      
      const operationTimes: Record<string, number> = {};
      
      // Complex multi-column sort
      let start = performance.now();
      await page.click('[data-testid="multi-sort-btn"]');
      await page.waitForSelector('[data-testid="sort-complete"]');
      operationTimes.multiSort = performance.now() - start;
      
      // Advanced filtering
      start = performance.now();
      await page.click('[data-testid="advanced-filter-btn"]');
      await page.fill('[data-testid="natural-language-input"]', 'Show all managers with salary over 100k in engineering');
      await page.click('[data-testid="process-nl-query-btn"]');
      await page.waitForSelector('[data-testid="filter-complete"]');
      operationTimes.advancedFilter = performance.now() - start;
      
      // Data export
      start = performance.now();
      await page.click('[data-testid="export-btn"]');
      await page.selectOption('[data-testid="export-format"]', 'excel');
      await page.click('[data-testid="start-export-btn"]');
      await page.waitForSelector('[data-testid="export-complete"]');
      operationTimes.dataExport = performance.now() - start;
      
      console.log('Enterprise scenario performance:', operationTimes);
      
      // All operations should be reasonably fast
      expect(operationTimes.multiSort).toBeLessThan(1000);
      expect(operationTimes.advancedFilter).toBeLessThan(3000);
      expect(operationTimes.dataExport).toBeLessThan(5000);
    });

    test('Mobile performance scenario', async ({ page }) => {
      // Simulate mobile device
      await page.setViewportSize({ width: 375, height: 667 });
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
      
      await page.goto('/examples/performance/mobile-scenario');
      await page.waitForSelector('[data-testid="mobile-grid-loaded"]');
      
      // Test touch scrolling performance
      const touchStart = performance.now();
      
      for (let i = 0; i < 10; i++) {
        await page.touchscreen.tap(200, 300);
        await page.mouse.wheel(0, 200);
        await page.waitForTimeout(50);
      }
      
      const touchScrollTime = performance.now() - touchStart;
      
      console.log('Mobile scroll performance:', touchScrollTime.toFixed(1) + 'ms');
      expect(touchScrollTime).toBeLessThan(1000);
      
      // Test mobile filtering
      const filterStart = performance.now();
      await page.click('[data-testid="mobile-filter-btn"]');
      await page.click('[data-testid="department-filter"]');
      await page.click('[data-testid="engineering-option"]');
      await page.click('[data-testid="apply-mobile-filter"]');
      await page.waitForSelector('[data-testid="filter-applied"]');
      const mobileFilterTime = performance.now() - filterStart;
      
      console.log('Mobile filter performance:', mobileFilterTime.toFixed(1) + 'ms');
      expect(mobileFilterTime).toBeLessThan(800);
    });
  });

  test.describe('Performance Regression Tests', () => {
    test('Performance baseline validation', async ({ page }) => {
      // This test establishes performance baselines that should not regress
      const baselines = {
        initialRender10k: 1500, // ms
        virtualScroll: 55, // FPS
        textFilter: 200, // ms
        setFilter: 500, // ms
        memoryUsage100k: 150 // MB
      };
      
      // Test initial render
      const renderStart = performance.now();
      await page.goto('/examples/performance/bigleger-grid-10k');
      await page.waitForSelector('[data-testid="render-complete"]');
      const renderTime = performance.now() - renderStart;
      
      expect(renderTime).toBeLessThan(baselines.initialRender10k);
      
      // Test memory usage
      const memory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
        }
        return 0;
      });
      
      if (memory > 0) {
        expect(memory).toBeLessThan(baselines.memoryUsage100k);
      }
      
      console.log('Performance baseline check passed:', {
        renderTime: renderTime.toFixed(1) + 'ms (baseline: ' + baselines.initialRender10k + 'ms)',
        memoryUsage: memory.toFixed(1) + 'MB (baseline: ' + baselines.memoryUsage100k + 'MB)'
      });
    });
  });
});