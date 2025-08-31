import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';
import { DataFactory } from '../data/data-factory';

test.describe('Extreme Performance Tests (100k+ Rows)', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    // Set longer timeout for extreme datasets
    test.setTimeout(300000); // 5 minutes
  });
  
  test.describe('100k Row Performance', () => {
    test('should render 100k rows with virtual scrolling in acceptable time', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      const dataset = DataFactory.createExtremeDataset100k();
      console.log(`Testing with ${dataset.rows.length} rows`);
      
      // Inject dataset into page
      await page.evaluate((data) => {
        (window as any).testDataset = data;
      }, dataset);
      
      // Load dataset and measure performance
      const startTime = performance.now();
      await page.evaluate(() => {
        const component = document.querySelector('app-performance-example');
        if (component) {
          (component as any).loadCustomDataset((window as any).testDataset);
        }
      });
      
      await gridPage.waitForGridToLoad();
      const renderTime = performance.now() - startTime;
      
      console.log(`100k rows render time: ${renderTime.toFixed(2)}ms`);
      
      // Performance expectations for 100k rows
      expect(renderTime).toBeLessThan(10000); // 10 seconds max
      
      // Verify data is loaded
      const rowCount = await gridPage.getVisibleRowCount();
      expect(rowCount).toBeGreaterThan(0);
      
      // Measure memory usage
      const memoryUsage = await page.evaluate(() => {
        const mem = (performance as any).memory;
        return mem ? {
          used: mem.usedJSHeapSize,
          total: mem.totalJSHeapSize,
          limit: mem.jsHeapSizeLimit
        } : null;
      });
      
      if (memoryUsage) {
        const memoryMB = memoryUsage.used / 1024 / 1024;
        console.log(`Memory usage for 100k rows: ${memoryMB.toFixed(2)}MB`);
        expect(memoryMB).toBeLessThan(500); // Should use less than 500MB
      }
    });
    
    test('should scroll smoothly through 100k rows', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      const dataset = DataFactory.createExtremeDataset100k();
      await page.evaluate((data) => {
        (window as any).testDataset = data;
        const component = document.querySelector('app-performance-example');
        if (component) {
          (component as any).loadCustomDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Measure scrolling performance
      const scrollTests = [
        { distance: 5000, description: 'Large jump scroll' },
        { distance: 1000, description: 'Medium scroll' },
        { distance: 500, description: 'Small scroll' }
      ];
      
      for (const test of scrollTests) {
        const startTime = performance.now();
        await gridPage.scrollVertically(test.distance);
        await page.waitForTimeout(100); // Allow scroll to settle
        const scrollTime = performance.now() - startTime;
        
        console.log(`${test.description} (${test.distance}px): ${scrollTime.toFixed(2)}ms`);
        expect(scrollTime).toBeLessThan(500); // Each scroll should be under 500ms
      }
      
      // Test rapid scrolling
      const rapidScrollStart = performance.now();
      for (let i = 0; i < 20; i++) {
        await gridPage.scrollVertically(200);
        await page.waitForTimeout(20);
        await gridPage.scrollVertically(-100);
        await page.waitForTimeout(20);
      }
      const rapidScrollTime = performance.now() - rapidScrollStart;
      
      console.log(`Rapid scroll test (40 operations): ${rapidScrollTime.toFixed(2)}ms`);
      expect(rapidScrollTime).toBeLessThan(5000); // Rapid scrolling should complete within 5s
    });
    
    test('should sort 100k rows efficiently', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      const dataset = DataFactory.createExtremeDataset100k();
      await page.evaluate((data) => {
        (window as any).testDataset = data;
        const component = document.querySelector('app-performance-example');
        if (component) {
          (component as any).loadCustomDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Test sorting on different column types
      const sortTests = [
        { field: 'id', type: 'number', expectedMaxTime: 3000 },
        { field: 'firstName', type: 'string', expectedMaxTime: 4000 },
        { field: 'salary', type: 'currency', expectedMaxTime: 3000 },
        { field: 'joinDate', type: 'date', expectedMaxTime: 4000 }
      ];
      
      for (const sortTest of sortTests) {
        // Sort ascending
        const ascStartTime = performance.now();
        await gridPage.sortColumn(sortTest.field, 'asc');
        await gridPage.waitForLoadingToComplete();
        const ascSortTime = performance.now() - ascStartTime;
        
        console.log(`Sort ${sortTest.field} (${sortTest.type}) ASC: ${ascSortTime.toFixed(2)}ms`);
        expect(ascSortTime).toBeLessThan(sortTest.expectedMaxTime);
        
        // Sort descending
        const descStartTime = performance.now();
        await gridPage.sortColumn(sortTest.field, 'desc');
        await gridPage.waitForLoadingToComplete();
        const descSortTime = performance.now() - descStartTime;
        
        console.log(`Sort ${sortTest.field} (${sortTest.type}) DESC: ${descSortTime.toFixed(2)}ms`);
        expect(descSortTime).toBeLessThan(sortTest.expectedMaxTime);
      }
    });
    
    test('should filter 100k rows efficiently', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      const dataset = DataFactory.createExtremeDataset100k();
      await page.evaluate((data) => {
        (window as any).testDataset = data;
        const component = document.querySelector('app-performance-example');
        if (component) {
          (component as any).loadCustomDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Test different filter types
      const filterTests = [
        { field: 'firstName', operator: 'contains', value: 'John', expectedMaxTime: 2000 },
        { field: 'age', operator: 'greaterThan', value: 30, expectedMaxTime: 1500 },
        { field: 'salary', operator: 'greaterThan', value: 50000, expectedMaxTime: 1500 },
        { field: 'email', operator: 'endsWith', value: '.com', expectedMaxTime: 2500 }
      ];
      
      for (const filterTest of filterTests) {
        const startTime = performance.now();
        
        if (typeof filterTest.value === 'number') {
          await gridPage.applyNumberFilter(filterTest.field, filterTest.operator, filterTest.value);
        } else {
          await gridPage.applyTextFilter(filterTest.field, filterTest.operator, filterTest.value as string);
        }
        
        await gridPage.waitForLoadingToComplete();
        const filterTime = performance.now() - startTime;
        
        console.log(`Filter ${filterTest.field} ${filterTest.operator} '${filterTest.value}': ${filterTime.toFixed(2)}ms`);
        expect(filterTime).toBeLessThan(filterTest.expectedMaxTime);
        
        // Clear filter for next test
        await gridPage.clearAllFilters();
        await gridPage.waitForLoadingToComplete();
      }
    });
  });
  
  test.describe('250k Row Performance', () => {
    test('should handle 250k rows with virtual scrolling', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      const dataset = DataFactory.createExtremeDataset250k();
      console.log(`Testing with ${dataset.rows.length} rows`);
      
      await page.evaluate((data) => {
        (window as any).testDataset = data;
      }, dataset);
      
      const startTime = performance.now();
      await page.evaluate(() => {
        const component = document.querySelector('app-performance-example');
        if (component) {
          (component as any).loadCustomDataset((window as any).testDataset);
        }
      });
      
      await gridPage.waitForGridToLoad();
      const renderTime = performance.now() - startTime;
      
      console.log(`250k rows render time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(20000); // 20 seconds max for 250k rows
      
      // Test basic functionality
      await gridPage.scrollVertically(2000);
      await page.waitForTimeout(200);
      
      const scrollPosition = await gridPage.gridHelper.getScrollPosition();
      expect(scrollPosition.top).toBeGreaterThan(0);
    });
    
    test('should sort 250k rows within reasonable time', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      const dataset = DataFactory.createExtremeDataset250k();
      await page.evaluate((data) => {
        (window as any).testDataset = data;
        const component = document.querySelector('app-performance-example');
        if (component) {
          (component as any).loadCustomDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Test sorting on most efficient column (number)
      const startTime = performance.now();
      await gridPage.sortColumn('id', 'asc');
      await gridPage.waitForLoadingToComplete();
      const sortTime = performance.now() - startTime;
      
      console.log(`Sort 250k rows by ID: ${sortTime.toFixed(2)}ms`);
      expect(sortTime).toBeLessThan(8000); // 8 seconds max for 250k rows
    });
  });
  
  test.describe('500k Row Performance', () => {
    test('should handle 500k rows gracefully', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      const dataset = DataFactory.createExtremeDataset500k();
      console.log(`Testing with ${dataset.rows.length} rows`);
      
      await page.evaluate((data) => {
        (window as any).testDataset = data;
      }, dataset);
      
      const startTime = performance.now();
      await page.evaluate(() => {
        const component = document.querySelector('app-performance-example');
        if (component) {
          (component as any).loadCustomDataset((window as any).testDataset);
        }
      });
      
      await gridPage.waitForGridToLoad();
      const renderTime = performance.now() - startTime;
      
      console.log(`500k rows render time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(40000); // 40 seconds max for 500k rows
      
      // Test that virtual scrolling is working
      const initialVisibleRows = await gridPage.getVisibleRowCount();
      await gridPage.scrollVertically(10000);
      await page.waitForTimeout(500);
      
      const afterScrollVisibleRows = await gridPage.getVisibleRowCount();
      // Should still have roughly the same number of visible rows (virtual scrolling)
      expect(Math.abs(afterScrollVisibleRows - initialVisibleRows)).toBeLessThan(10);
      
      // Memory check for extreme dataset
      const memoryUsage = await page.evaluate(() => {
        const mem = (performance as any).memory;
        return mem ? mem.usedJSHeapSize / 1024 / 1024 : 0;
      });
      
      if (memoryUsage > 0) {
        console.log(`Memory usage for 500k rows: ${memoryUsage.toFixed(2)}MB`);
        expect(memoryUsage).toBeLessThan(1000); // Should use less than 1GB
      }
    });
    
    test('should handle basic operations on 500k rows', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      const dataset = DataFactory.createExtremeDataset500k();
      await page.evaluate((data) => {
        (window as any).testDataset = data;
        const component = document.querySelector('app-performance-example');
        if (component) {
          (component as any).loadCustomDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Test scrolling on 500k dataset
      const scrollStartTime = performance.now();
      await gridPage.scrollVertically(5000);
      await page.waitForTimeout(300);
      const scrollTime = performance.now() - scrollStartTime;
      
      console.log(`Scroll 500k dataset: ${scrollTime.toFixed(2)}ms`);
      expect(scrollTime).toBeLessThan(1000);
      
      // Test filtering (should be fast with virtual scrolling)
      const filterStartTime = performance.now();
      await gridPage.applyNumberFilter('age', 'greaterThan', 25);
      await gridPage.waitForLoadingToComplete();
      const filterTime = performance.now() - filterStartTime;
      
      console.log(`Filter 500k dataset: ${filterTime.toFixed(2)}ms`);
      expect(filterTime).toBeLessThan(5000); // 5 seconds max for filtering 500k rows
    });
  });
  
  test.describe('Memory Leak Detection', () => {
    test('should not have memory leaks when loading/unloading large datasets', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      // Get baseline memory
      const baselineMemory = await page.evaluate(() => {
        if ((window as any).gc) (window as any).gc();
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Load and unload datasets multiple times
      const datasets = [
        DataFactory.createExtremeDataset100k(),
        DataFactory.createLargeDataset(),
        DataFactory.createPerformanceDataset()
      ];
      
      for (let i = 0; i < 3; i++) {
        for (const dataset of datasets) {
          // Load dataset
          await page.evaluate((data) => {
            const component = document.querySelector('app-performance-example');
            if (component) {
              (component as any).loadCustomDataset(data);
            }
          }, dataset);
          
          await gridPage.waitForGridToLoad();
          await page.waitForTimeout(1000);
          
          // Unload dataset
          await page.evaluate(() => {
            const component = document.querySelector('app-performance-example');
            if (component) {
              (component as any).loadCustomDataset({ rows: [], columns: [] });
            }
          });
          
          await page.waitForTimeout(500);
        }
        
        // Force garbage collection if available
        await page.evaluate(() => {
          if ((window as any).gc) (window as any).gc();
        });
      }
      
      // Check final memory
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      if (baselineMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - baselineMemory;
        const increasePercent = (memoryIncrease / baselineMemory) * 100;
        
        console.log(`Memory increase after load/unload cycles: ${increasePercent.toFixed(2)}%`);
        console.log(`Baseline: ${(baselineMemory / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
        
        // Should not increase memory by more than 50% after cleanup
        expect(increasePercent).toBeLessThan(50);
      }
    });
  });
  
  test.describe('Performance Comparison Benchmarks', () => {
    test('should benchmark rendering performance across dataset sizes', async ({ page }) => {
      await gridPage.gotoPerformanceExample();
      
      const datasets = [
        { data: DataFactory.createMediumDataset(), name: '500 rows' },
        { data: DataFactory.createLargeDataset(), name: '5k rows' },
        { data: DataFactory.createPerformanceDataset(), name: '10k rows' },
        { data: DataFactory.createExtremeDataset100k(), name: '100k rows' }
      ];
      
      const results = [];
      
      for (const dataset of datasets) {
        const startTime = performance.now();
        
        await page.evaluate((data) => {
          const component = document.querySelector('app-performance-example');
          if (component) {
            (component as any).loadCustomDataset(data);
          }
        }, dataset.data);
        
        await gridPage.waitForGridToLoad();
        const renderTime = performance.now() - startTime;
        
        const memoryUsage = await page.evaluate(() => {
          const mem = (performance as any).memory;
          return mem ? mem.usedJSHeapSize / 1024 / 1024 : 0;
        });
        
        results.push({
          name: dataset.name,
          rows: dataset.data.rows.length,
          renderTime: Math.round(renderTime),
          memoryMB: Math.round(memoryUsage * 100) / 100,
          renderTimePerRow: Math.round((renderTime / dataset.data.rows.length) * 1000) / 1000
        });
        
        console.log(`${dataset.name}: ${renderTime.toFixed(2)}ms (${memoryUsage.toFixed(2)}MB)`);
        
        // Clear for next test
        await page.evaluate(() => {
          const component = document.querySelector('app-performance-example');
          if (component) {
            (component as any).loadCustomDataset({ rows: [], columns: [] });
          }
        });
        
        await page.waitForTimeout(1000);
      }
      
      // Output benchmark results
      console.log('\\n=== Performance Benchmark Results ===');
      console.table(results);
      
      // Verify performance scaling is reasonable
      const smallDataset = results.find(r => r.rows === 500);
      const largeDataset = results.find(r => r.rows === 100000);
      
      if (smallDataset && largeDataset) {
        const scalingFactor = largeDataset.renderTime / smallDataset.renderTime;
        console.log(`Performance scaling factor (100k vs 500 rows): ${scalingFactor.toFixed(2)}x`);
        
        // Performance should not degrade more than 50x for 200x more data (thanks to virtual scrolling)
        expect(scalingFactor).toBeLessThan(50);
      }
    });
  });
});