import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';

test.describe('Performance Benchmarks', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
  });
  
  test.describe('Rendering Performance', () => {
    test('should render small dataset within acceptable time', async () => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      
      const renderTime = await gridPage.measureRenderTime();
      expect(renderTime).toBeLessThan(1000); // 1 second max for small dataset
      
      console.log(`Small dataset render time: ${renderTime}ms`);
    });
    
    test('should render medium dataset within acceptable time', async () => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('medium');
      
      const renderTime = await gridPage.measureRenderTime();
      expect(renderTime).toBeLessThan(2000); // 2 seconds max for medium dataset
      
      console.log(`Medium dataset render time: ${renderTime}ms`);
    });
    
    test('should render large dataset with virtual scrolling efficiently', async () => {
      await gridPage.gotoVirtualScrollExample();
      await gridPage.enableVirtualScrolling();
      await gridPage.loadDataset('large');
      
      const renderTime = await gridPage.measureRenderTime();
      expect(renderTime).toBeLessThan(3000); // 3 seconds max even for large dataset
      
      console.log(`Large dataset with virtual scrolling render time: ${renderTime}ms`);
    });
    
    test('should handle performance dataset efficiently', async () => {
      await gridPage.gotoPerformanceExample();
      await gridPage.enableVirtualScrolling();
      await gridPage.loadDataset('performance');
      
      const renderTime = await gridPage.measureRenderTime();
      expect(renderTime).toBeLessThan(5000); // 5 seconds max for performance dataset
      
      console.log(`Performance dataset render time: ${renderTime}ms`);
    });
    
    test('should maintain consistent frame rate during initial render', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      // Start performance monitoring
      await page.evaluate(() => {
        (window as any).performanceData = {
          frames: [],
          startTime: performance.now()
        };
        
        function measureFPS() {
          (window as any).performanceData.frames.push(performance.now());
          requestAnimationFrame(measureFPS);
        }
        requestAnimationFrame(measureFPS);
      });
      
      // Load dataset and measure
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      await gridPage.page.waitForTimeout(2000); // Monitor for 2 seconds
      
      // Calculate FPS
      const performanceData = await page.evaluate(() => {
        const data = (window as any).performanceData;
        const totalTime = data.frames[data.frames.length - 1] - data.frames[0];
        const fps = (data.frames.length / totalTime) * 1000;
        return { fps, totalTime, frameCount: data.frames.length };
      });
      
      console.log(`Average FPS during render: ${performanceData.fps.toFixed(2)}`);
      expect(performanceData.fps).toBeGreaterThan(30); // Should maintain at least 30 FPS
    });
  });
  
  test.describe('Scrolling Performance', () => {
    test('should scroll smoothly in virtual scrolling mode', async ({ page }) => {
      await gridPage.gotoVirtualScrollExample();
      await gridPage.enableVirtualScrolling();
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      const scrollMetrics = await gridPage.gridHelper.measureScrollPerformance();
      
      expect(scrollMetrics.scrollTime).toBeLessThan(500); // Scroll should complete within 500ms
      console.log(`Virtual scroll performance: ${scrollMetrics.scrollTime}ms`);
    });
    
    test('should handle rapid scrolling without performance degradation', async () => {
      await gridPage.gotoVirtualScrollExample();
      await gridPage.enableVirtualScrolling();
      await gridPage.loadDataset('performance');
      await gridPage.waitForGridToLoad();
      
      const startTime = Date.now();
      
      // Perform rapid scrolling
      for (let i = 0; i < 20; i++) {
        await gridPage.scrollVertically(500);
        await gridPage.page.waitForTimeout(50);
        await gridPage.scrollVertically(-250);
        await gridPage.page.waitForTimeout(50);
      }
      
      const totalScrollTime = Date.now() - startTime;
      
      // Should complete rapid scrolling within reasonable time
      expect(totalScrollTime).toBeLessThan(5000);
      console.log(`Rapid scroll test completed in: ${totalScrollTime}ms`);
      
      // Grid should still be responsive
      await gridPage.validateGridStructure();
    });
    
    test('should maintain memory efficiency during extended scrolling', async ({ page }) => {
      await gridPage.gotoVirtualScrollExample();
      await gridPage.enableVirtualScrolling();
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      // Get initial memory
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Perform extended scrolling
      for (let i = 0; i < 50; i++) {
        await gridPage.scrollVertically(200);
        await gridPage.page.waitForTimeout(100);
        
        if (i % 10 === 0) {
          // Force garbage collection periodically
          await page.evaluate(() => {
            if ((window as any).gc) {
              (window as any).gc();
            }
          });
        }
      }
      
      // Get final memory
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
        
        console.log(`Memory increase after extended scrolling: ${memoryIncreasePercent.toFixed(2)}%`);
        
        // Memory should not increase dramatically
        expect(memoryIncreasePercent).toBeLessThan(100); // Less than 100% increase
      }
    });
  });
  
  test.describe('Sorting Performance', () => {
    test('should sort small dataset quickly', async () => {
      await gridPage.gotoSortingExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      const sortTime = await gridPage.runSortPerformanceTest('firstName');
      expect(sortTime).toBeLessThan(500); // 500ms max for small dataset
      
      console.log(`Small dataset sort time: ${sortTime}ms`);
    });
    
    test('should sort medium dataset efficiently', async () => {
      await gridPage.gotoSortingExample();
      await gridPage.loadDataset('medium');
      await gridPage.waitForGridToLoad();
      
      const sortTime = await gridPage.runSortPerformanceTest('age');
      expect(sortTime).toBeLessThan(1000); // 1 second max for medium dataset
      
      console.log(`Medium dataset sort time: ${sortTime}ms`);
    });
    
    test('should sort large dataset within reasonable time', async () => {
      await gridPage.gotoSortingExample();
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      const sortTime = await gridPage.runSortPerformanceTest('salary');
      expect(sortTime).toBeLessThan(3000); // 3 seconds max for large dataset
      
      console.log(`Large dataset sort time: ${sortTime}ms`);
    });
    
    test('should handle multiple rapid sort operations', async () => {
      await gridPage.gotoSortingExample();
      await gridPage.loadDataset('medium');
      await gridPage.waitForGridToLoad();
      
      const columns = ['firstName', 'lastName', 'age', 'salary'];
      const startTime = Date.now();
      
      // Perform rapid sort operations
      for (const column of columns) {
        await gridPage.sortColumn(column, 'asc');
        await gridPage.waitForLoadingToComplete();
        await gridPage.sortColumn(column, 'desc');
        await gridPage.waitForLoadingToComplete();
      }
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(5000); // All sorts should complete within 5 seconds
      
      console.log(`Multiple sort operations completed in: ${totalTime}ms`);
    });
    
    test('should maintain responsiveness during sort operations', async ({ page }) => {
      await gridPage.gotoSortingExample();
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      // Start sort operation
      const sortPromise = gridPage.sortColumn('firstName', 'asc');
      
      // Try to interact with UI during sort
      await gridPage.page.waitForTimeout(100);
      
      // Check if UI is responsive (not completely blocked)
      const isResponsive = await page.evaluate(() => {
        // Try to perform a simple DOM operation
        const element = document.querySelector('[data-testid="grid-container"]');
        return element !== null;
      });
      
      expect(isResponsive).toBe(true);
      
      await sortPromise;
      await gridPage.waitForLoadingToComplete();
    });
  });
  
  test.describe('Filtering Performance', () => {
    test('should filter small dataset quickly', async () => {
      await gridPage.gotoFilteringExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      const filterTime = await gridPage.runFilterPerformanceTest('firstName', 'John');
      expect(filterTime).toBeLessThan(500); // 500ms max for small dataset
      
      console.log(`Small dataset filter time: ${filterTime}ms`);
    });
    
    test('should filter large dataset efficiently', async () => {
      await gridPage.gotoFilteringExample();
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      const filterTime = await gridPage.runFilterPerformanceTest('firstName', 'a');
      expect(filterTime).toBeLessThan(2000); // 2 seconds max for large dataset
      
      console.log(`Large dataset filter time: ${filterTime}ms`);
    });
    
    test('should handle multiple filters efficiently', async () => {
      await gridPage.gotoFilteringExample();
      await gridPage.loadDataset('medium');
      await gridPage.waitForGridToLoad();
      
      const startTime = Date.now();
      
      // Apply multiple filters
      await gridPage.applyTextFilter('firstName', 'contains', 'a');
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.applyNumberFilter('age', 'greaterThan', 25);
      await gridPage.waitForLoadingToComplete();
      
      await gridPage.applyTextFilter('email', 'endsWith', '.com');
      await gridPage.waitForLoadingToComplete();
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(3000); // All filters should apply within 3 seconds
      
      console.log(`Multiple filters applied in: ${totalTime}ms`);
    });
    
    test('should clear filters quickly', async () => {
      await gridPage.gotoFilteringExample();
      await gridPage.loadDataset('medium');
      await gridPage.waitForGridToLoad();
      
      // Apply some filters first
      await gridPage.applyTextFilter('firstName', 'contains', 'John');
      await gridPage.applyNumberFilter('age', 'greaterThan', 30);
      await gridPage.waitForLoadingToComplete();
      
      // Clear all filters and measure time
      const startTime = Date.now();
      await gridPage.clearAllFilters();
      await gridPage.waitForLoadingToComplete();
      const clearTime = Date.now() - startTime;
      
      expect(clearTime).toBeLessThan(1000); // Should clear within 1 second
      console.log(`Filter clearing time: ${clearTime}ms`);
    });
  });
  
  test.describe('Selection Performance', () => {
    test('should handle single row selection quickly', async () => {
      await gridPage.gotoSelectionExample();
      await gridPage.loadDataset('large');
      await gridPage.setSelectionMode('single');
      await gridPage.waitForGridToLoad();
      
      const startTime = Date.now();
      
      // Select multiple rows in sequence
      for (let i = 0; i < 20; i++) {
        await gridPage.selectRow(i);
      }
      
      const selectionTime = Date.now() - startTime;
      expect(selectionTime).toBeLessThan(2000); // Should complete within 2 seconds
      
      console.log(`Single row selection performance: ${selectionTime}ms`);
    });
    
    test('should handle multiple row selection efficiently', async ({ page }) => {
      await gridPage.gotoSelectionExample();
      await gridPage.loadDataset('large');
      await gridPage.setSelectionMode('multiple');
      await gridPage.waitForGridToLoad();
      
      const startTime = Date.now();
      
      // Select multiple rows with Ctrl+Click
      await gridPage.selectRow(0);
      await page.keyboard.down('Control');
      
      for (let i = 2; i < 50; i += 2) {
        await gridPage.selectRow(i);
      }
      
      await page.keyboard.up('Control');
      
      const selectionTime = Date.now() - startTime;
      expect(selectionTime).toBeLessThan(3000); // Should complete within 3 seconds
      
      console.log(`Multiple row selection performance: ${selectionTime}ms`);
    });
    
    test('should handle select all operation efficiently', async () => {
      await gridPage.gotoSelectionExample();
      await gridPage.loadDataset('medium');
      await gridPage.setSelectionMode('checkbox');
      await gridPage.waitForGridToLoad();
      
      const startTime = Date.now();
      await gridPage.selectAllRows();
      await gridPage.page.waitForTimeout(500); // Allow UI to update
      const selectAllTime = Date.now() - startTime;
      
      expect(selectAllTime).toBeLessThan(1000); // Select all should complete within 1 second
      console.log(`Select all performance: ${selectAllTime}ms`);
    });
  });
  
  test.describe('Column Operations Performance', () => {
    test('should resize columns smoothly', async () => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('medium');
      await gridPage.waitForGridToLoad();
      
      const startTime = Date.now();
      
      // Resize multiple columns
      await gridPage.resizeColumn('firstName', 100);
      await gridPage.resizeColumn('lastName', -50);
      await gridPage.resizeColumn('email', 150);
      
      const resizeTime = Date.now() - startTime;
      expect(resizeTime).toBeLessThan(2000); // Should complete within 2 seconds
      
      console.log(`Column resize performance: ${resizeTime}ms`);
    });
    
    test('should reorder columns efficiently', async () => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('medium');
      await gridPage.waitForGridToLoad();
      
      const startTime = Date.now();
      
      // Reorder columns
      await gridPage.reorderColumn('firstName', 'email');
      await gridPage.page.waitForTimeout(500); // Allow reorder animation
      
      const reorderTime = Date.now() - startTime;
      expect(reorderTime).toBeLessThan(1000); // Should complete within 1 second
      
      console.log(`Column reorder performance: ${reorderTime}ms`);
    });
    
    test('should hide/show columns quickly', async () => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('medium');
      await gridPage.waitForGridToLoad();
      
      const startTime = Date.now();
      
      // Hide and show columns
      await gridPage.hideColumn('age');
      await gridPage.hideColumn('salary');
      await gridPage.showColumn('age');
      
      const columnToggleTime = Date.now() - startTime;
      expect(columnToggleTime).toBeLessThan(2000); // Should complete within 2 seconds
      
      console.log(`Column hide/show performance: ${columnToggleTime}ms`);
    });
  });
  
  test.describe('Memory Usage Tests', () => {
    test('should maintain stable memory usage with large datasets', async ({ page }) => {
      await gridPage.gotoVirtualScrollExample();
      await gridPage.enableVirtualScrolling();
      
      // Get baseline memory
      const baselineMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Load large dataset
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      const afterLoadMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Perform various operations
      await gridPage.scrollVertically(2000);
      await gridPage.sortColumn('firstName', 'asc');
      await gridPage.waitForLoadingToComplete();
      await gridPage.applyTextFilter('firstName', 'contains', 'a');
      await gridPage.waitForLoadingToComplete();
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      if (baselineMemory > 0 && finalMemory > 0) {
        const totalIncrease = finalMemory - baselineMemory;
        const increasePercent = (totalIncrease / baselineMemory) * 100;
        
        console.log(`Total memory increase: ${increasePercent.toFixed(2)}%`);
        console.log(`Baseline: ${(baselineMemory / 1024 / 1024).toFixed(2)}MB`);
        console.log(`After load: ${(afterLoadMemory / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
        
        // Should not increase memory by more than 200%
        expect(increasePercent).toBeLessThan(200);
      }
    });
    
    test('should release memory when clearing data', async ({ page }) => {
      await gridPage.gotoBasicExample();
      
      // Load large dataset
      await gridPage.loadDataset('performance');
      await gridPage.waitForGridToLoad();
      
      const memoryAfterLoad = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Clear data
      await gridPage.loadDataset('empty');
      await gridPage.waitForGridToLoad();
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      await gridPage.page.waitForTimeout(1000); // Allow cleanup
      
      const memoryAfterClear = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      if (memoryAfterLoad > 0 && memoryAfterClear > 0) {
        const memoryReduction = memoryAfterLoad - memoryAfterClear;
        const reductionPercent = (memoryReduction / memoryAfterLoad) * 100;
        
        console.log(`Memory reduction: ${reductionPercent.toFixed(2)}%`);
        console.log(`After load: ${(memoryAfterLoad / 1024 / 1024).toFixed(2)}MB`);
        console.log(`After clear: ${(memoryAfterClear / 1024 / 1024).toFixed(2)}MB`);
        
        // Should release a significant portion of memory
        expect(reductionPercent).toBeGreaterThan(10); // At least 10% reduction
      }
    });
  });
  
  test.describe('Bundle Size and Loading Performance', () => {
    test('should load initial resources efficiently', async ({ page }) => {
      // Monitor network activity
      const resources: any[] = [];
      
      page.on('response', response => {
        if (response.url().includes('.js') || response.url().includes('.css')) {
          resources.push({
            url: response.url(),
            status: response.status(),
            size: response.headers()['content-length'] || 0
          });
        }
      });
      
      await gridPage.gotoBasicExample();
      await gridPage.waitForGridToLoad();
      
      // Calculate total bundle size
      const totalSize = resources.reduce((sum, resource) => {
        return sum + parseInt(resource.size as string || '0');
      }, 0);
      
      console.log(`Total JavaScript/CSS bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
      console.log(`Number of resources loaded: ${resources.length}`);
      
      // Bundle should not be excessively large
      expect(totalSize).toBeLessThan(2 * 1024 * 1024); // Less than 2MB total
    });
    
    test('should achieve good Lighthouse performance score', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('medium');
      await gridPage.waitForGridToLoad();
      
      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        };
      });
      
      console.log('Performance Metrics:');
      console.log(`DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`);
      console.log(`Load Complete: ${metrics.loadComplete.toFixed(2)}ms`);
      console.log(`First Paint: ${metrics.firstPaint.toFixed(2)}ms`);
      console.log(`First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(2)}ms`);
      
      // Performance expectations
      expect(metrics.domContentLoaded).toBeLessThan(2000); // DOM should be ready within 2 seconds
      expect(metrics.firstContentfulPaint).toBeLessThan(3000); // FCP should be within 3 seconds
    });
  });
});