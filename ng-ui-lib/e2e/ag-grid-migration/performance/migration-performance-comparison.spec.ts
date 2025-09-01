/**
 * Migration Performance Comparison Tests
 * Compares performance metrics between ag-Grid configurations and BigLedger Grid
 */

import { test, expect, Page } from '@playwright/test';
import { MigrationMapper } from '../utils/migration-mapper.js';
import { MigrationTestData } from '../test-data/migration-test-data.js';
import { BlgGridApiWrapper } from '../utils/api-compatibility-layer.js';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  scrollFPS?: number;
  sortTime: number;
  filterTime: number;
  bundleSize?: number;
  initialLoadTime: number;
}

test.describe('ag-Grid to BigLedger Grid - Performance Comparison', () => {
  let page: Page;
  let gridApi: BlgGridApiWrapper;

  // Performance thresholds (BLG Grid should meet or exceed these)
  const PERFORMANCE_THRESHOLDS = {
    renderTime: 3000,      // 3 seconds max for initial render
    sortTime: 2000,        // 2 seconds max for sorting
    filterTime: 2000,      // 2 seconds max for filtering
    scrollTime: 16,        // 16ms per frame (60 FPS)
    memoryIncrease: 150,   // 150% max memory increase from baseline
    bundleSize: 200000     // 200KB max bundle size
  };

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    gridApi = new BlgGridApiWrapper(page);
    await page.goto('/grid-demo');
  });

  test('should compare initial rendering performance', async () => {
    const agGridOptions = MigrationTestData.getPerformanceAgGridOptions(1000);
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);

    // Measure BLG Grid rendering performance
    const startTime = Date.now();
    
    await page.evaluate((config) => {
      performance.mark('blg-render-start');
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    // Wait for grid to be fully rendered
    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
    await page.waitForFunction(() => {
      return document.querySelectorAll('[data-testid="grid-row"]').length > 0;
    });

    const endTime = Date.now();
    const renderTime = endTime - startTime;

    // Get performance metrics from the browser
    const performanceMetrics = await page.evaluate(() => {
      performance.mark('blg-render-end');
      performance.measure('blg-render', 'blg-render-start', 'blg-render-end');
      
      const entries = performance.getEntriesByName('blg-render');
      return {
        renderTime: entries[0]?.duration || 0,
        memoryUsed: (performance as any).memory?.usedJSHeapSize || 0
      };
    });

    console.log(`BLG Grid render time: ${renderTime}ms`);
    console.log(`BLG Grid performance measure: ${performanceMetrics.renderTime}ms`);

    // Performance assertions
    expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.renderTime);
    expect(performanceMetrics.renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.renderTime);

    // Verify all rows are rendered (virtual scrolling should be active)
    const visibleRows = await page.locator('[data-testid="grid-row"]').count();
    expect(visibleRows).toBeGreaterThan(0);
    expect(visibleRows).toBeLessThan(1000); // Should use virtual scrolling
  });

  test('should compare scrolling performance', async () => {
    const largeDataset = MigrationTestData.getLargeDataset(5000);
    const agGridOptions = MigrationTestData.getPerformanceAgGridOptions(5000);
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    blgConfig.data = largeDataset;

    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    // Measure scrolling performance
    const scrollMetrics = await page.evaluate(async () => {
      const viewport = document.querySelector('[data-testid="grid-viewport"]');
      if (!viewport) throw new Error('Grid viewport not found');

      const frameTimings: number[] = [];
      let lastTimestamp = performance.now();
      let frameCount = 0;
      const maxFrames = 60; // Test for 1 second at 60fps

      return new Promise<{avgFrameTime: number, maxFrameTime: number}>((resolve) => {
        const measureFrame = () => {
          const currentTime = performance.now();
          const frameTime = currentTime - lastTimestamp;
          frameTimings.push(frameTime);
          lastTimestamp = currentTime;
          frameCount++;

          if (frameCount < maxFrames) {
            // Scroll incrementally
            viewport.scrollTop += 50;
            requestAnimationFrame(measureFrame);
          } else {
            const avgFrameTime = frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;
            const maxFrameTime = Math.max(...frameTimings);
            resolve({ avgFrameTime, maxFrameTime });
          }
        };

        requestAnimationFrame(measureFrame);
      });
    });

    console.log(`Average frame time: ${scrollMetrics.avgFrameTime}ms`);
    console.log(`Max frame time: ${scrollMetrics.maxFrameTime}ms`);

    // Performance assertions
    expect(scrollMetrics.avgFrameTime).toBeLessThan(PERFORMANCE_THRESHOLDS.scrollTime);
    expect(scrollMetrics.maxFrameTime).toBeLessThan(PERFORMANCE_THRESHOLDS.scrollTime * 2); // Allow some spikes

    // Verify smooth scrolling maintained virtual scrolling
    const finalVisibleRows = await page.locator('[data-testid="grid-row"]').count();
    expect(finalVisibleRows).toBeLessThan(5000); // Should still be virtual scrolling
  });

  test('should compare sorting performance', async () => {
    const largeDataset = MigrationTestData.getLargeDataset(10000);
    const agGridOptions = MigrationTestData.getPerformanceAgGridOptions(10000);
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    blgConfig.data = largeDataset;

    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    // Test sorting performance on different column types
    const sortTests = [
      { column: 'firstName', type: 'string' },
      { column: 'age', type: 'number' },
      { column: 'salary', type: 'number' },
      { column: 'startDate', type: 'date' }
    ];

    for (const sortTest of sortTests) {
      console.log(`Testing sort performance for ${sortTest.column} (${sortTest.type})`);

      const startTime = performance.now();

      await page.evaluate((columnField) => {
        performance.mark(`sort-${columnField}-start`);
      }, sortTest.column);

      // Trigger sort
      await page.click(`[data-testid="column-header"][data-field="${sortTest.column}"] [data-testid="sort-button"]`);

      // Wait for sort to complete
      await expect(page.locator(`[data-testid="column-header"][data-field="${sortTest.column}"] [data-testid="sort-indicator"]`)).toBeVisible();

      const endTime = performance.now();
      const sortTime = endTime - startTime;

      // Get browser performance measurement
      const browserSortTime = await page.evaluate((columnField) => {
        performance.mark(`sort-${columnField}-end`);
        performance.measure(`sort-${columnField}`, `sort-${columnField}-start`, `sort-${columnField}-end`);
        
        const entries = performance.getEntriesByName(`sort-${columnField}`);
        return entries[0]?.duration || 0;
      }, sortTest.column);

      console.log(`${sortTest.column} sort time: ${sortTime}ms (browser: ${browserSortTime}ms)`);

      // Performance assertions
      expect(sortTime).toBeLessThan(PERFORMANCE_THRESHOLDS.sortTime);
      
      // Verify sort actually worked
      const firstRowValue = await page.locator('[data-testid="grid-row"]:first-child [data-testid="grid-cell"][data-field="' + sortTest.column + '"]').textContent();
      expect(firstRowValue).toBeTruthy();
    }
  });

  test('should compare filtering performance', async () => {
    const largeDataset = MigrationTestData.getLargeDataset(10000);
    const agGridOptions = MigrationTestData.getPerformanceAgGridOptions(10000);
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    blgConfig.data = largeDataset;

    // Apply configuration
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    // Test quick filter performance
    const quickFilterStartTime = performance.now();

    await page.evaluate(() => {
      performance.mark('quick-filter-start');
    });

    await gridApi.setQuickFilter('Engineering');

    const quickFilterEndTime = performance.now();
    const quickFilterTime = quickFilterEndTime - quickFilterStartTime;

    const browserQuickFilterTime = await page.evaluate(() => {
      performance.mark('quick-filter-end');
      performance.measure('quick-filter', 'quick-filter-start', 'quick-filter-end');
      
      const entries = performance.getEntriesByName('quick-filter');
      return entries[0]?.duration || 0;
    });

    console.log(`Quick filter time: ${quickFilterTime}ms (browser: ${browserQuickFilterTime}ms)`);

    // Verify filter worked
    const filteredRowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(filteredRowCount).toBeLessThan(largeDataset.length);

    // Performance assertion
    expect(quickFilterTime).toBeLessThan(PERFORMANCE_THRESHOLDS.filterTime);

    // Test column-specific filter performance
    const columnFilterTests = [
      { field: 'age', filterValue: '30', type: 'number' },
      { field: 'department', filterValue: 'Engineering', type: 'text' },
      { field: 'country', filterValue: 'USA', type: 'set' }
    ];

    for (const filterTest of columnFilterTests) {
      // Clear previous filters
      await gridApi.resetQuickFilter();

      const startTime = performance.now();

      await page.evaluate((field) => {
        performance.mark(`column-filter-${field}-start`);
      }, filterTest.field);

      // Apply column filter
      const filterModel = {
        [filterTest.field]: {
          filterType: filterTest.type,
          type: 'contains',
          filter: filterTest.filterValue
        }
      };

      await gridApi.setFilterModel(filterModel);

      const endTime = performance.now();
      const filterTime = endTime - startTime;

      const browserFilterTime = await page.evaluate((field) => {
        performance.mark(`column-filter-${field}-end`);
        performance.measure(`column-filter-${field}`, `column-filter-${field}-start`, `column-filter-${field}-end`);
        
        const entries = performance.getEntriesByName(`column-filter-${field}`);
        return entries[0]?.duration || 0;
      }, filterTest.field);

      console.log(`${filterTest.field} filter time: ${filterTime}ms (browser: ${browserFilterTime}ms)`);

      // Performance assertion
      expect(filterTime).toBeLessThan(PERFORMANCE_THRESHOLDS.filterTime);

      // Verify filter worked
      const columnFilteredRowCount = await page.locator('[data-testid="grid-row"]').count();
      expect(columnFilteredRowCount).toBeLessThan(largeDataset.length);
    }
  });

  test('should compare memory usage patterns', async () => {
    // Start with baseline memory measurement
    const baselineMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    const dataSizes = [1000, 5000, 10000, 25000];
    const memoryMeasurements: Array<{size: number, memory: number}> = [];

    for (const dataSize of dataSizes) {
      console.log(`Testing memory usage with ${dataSize} rows`);

      const testData = MigrationTestData.getLargeDataset(dataSize);
      const agGridOptions = MigrationTestData.getPerformanceAgGridOptions(dataSize);
      const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
      blgConfig.data = testData;

      // Clear previous data
      await page.evaluate(() => {
        window.testGridInstance?.setRowData([]);
      });

      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });

      // Apply new configuration
      await page.evaluate((config) => {
        window.testGridInstance?.setConfiguration(config);
      }, blgConfig);

      await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

      // Wait for rendering to complete
      await page.waitForTimeout(1000);

      // Measure memory usage
      const memoryUsage = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });

      const memoryIncrease = memoryUsage - baselineMemory;
      memoryMeasurements.push({ size: dataSize, memory: memoryIncrease });

      console.log(`${dataSize} rows: ${memoryIncrease} bytes (${(memoryIncrease / 1024 / 1024).toFixed(2)} MB)`);
    }

    // Analyze memory scaling
    const memoryScalingFactor = memoryMeasurements[memoryMeasurements.length - 1].memory / memoryMeasurements[0].memory;
    const dataScalingFactor = dataSizes[dataSizes.length - 1] / dataSizes[0];

    console.log(`Memory scaling factor: ${memoryScalingFactor.toFixed(2)}`);
    console.log(`Data scaling factor: ${dataScalingFactor}`);

    // Memory should scale approximately linearly with data size
    // Allow some overhead but should not be excessive
    const memoryEfficiency = dataScalingFactor / memoryScalingFactor;
    expect(memoryEfficiency).toBeGreaterThan(0.4); // Memory shouldn't grow more than 2.5x faster than data

    // Check that memory usage is reasonable
    const memoryPerRow = memoryMeasurements[0].memory / dataSizes[0];
    console.log(`Average memory per row: ${memoryPerRow} bytes`);
    expect(memoryPerRow).toBeLessThan(1000); // Less than 1KB per row on average
  });

  test('should compare bundle size impact', async () => {
    // This test would typically run in CI/CD pipeline with actual bundle analysis
    // For now, we'll simulate by checking if the grid loads efficiently

    const loadStartTime = performance.now();

    await page.evaluate(() => {
      performance.mark('bundle-load-start');
    });

    // Load a complex grid configuration
    const complexConfig = MigrationMapper.migrateGridOptions(MigrationTestData.getAdvancedAgGridOptions());

    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, complexConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    const loadEndTime = performance.now();
    const totalLoadTime = loadEndTime - loadStartTime;

    const browserLoadTime = await page.evaluate(() => {
      performance.mark('bundle-load-end');
      performance.measure('bundle-load', 'bundle-load-start', 'bundle-load-end');
      
      const entries = performance.getEntriesByName('bundle-load');
      return entries[0]?.duration || 0;
    });

    console.log(`Bundle load time: ${totalLoadTime}ms (browser: ${browserLoadTime}ms)`);

    // Should load reasonably quickly
    expect(totalLoadTime).toBeLessThan(1000); // 1 second max for complex config

    // Check if all features are available
    await expect(page.locator('[data-testid="column-header"]')).toHaveCount(7);
    await expect(page.locator('[data-testid="pagination-controls"]')).toBeVisible();
  });

  test('should compare operation throughput', async () => {
    const testData = MigrationTestData.getLargeDataset(5000);
    const agGridOptions = MigrationTestData.getPerformanceAgGridOptions(5000);
    const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);
    blgConfig.data = testData;

    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);

    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();

    // Test rapid API operations
    const operationCount = 10;
    const operations = [
      () => gridApi.selectAll(),
      () => gridApi.deselectAll(),
      () => gridApi.setQuickFilter('test'),
      () => gridApi.resetQuickFilter(),
      () => gridApi.setSortModel([{colId: 'firstName', sort: 'asc'}]),
      () => gridApi.setSortModel([])
    ];

    const startTime = performance.now();

    // Perform operations rapidly
    for (let i = 0; i < operationCount; i++) {
      const operation = operations[i % operations.length];
      await operation();
      await page.waitForTimeout(10); // Small delay to prevent overwhelming
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const operationsPerSecond = (operationCount * 1000) / totalTime;

    console.log(`Performed ${operationCount} operations in ${totalTime}ms`);
    console.log(`Operations per second: ${operationsPerSecond.toFixed(2)}`);

    // Should handle reasonable throughput
    expect(operationsPerSecond).toBeGreaterThan(5); // At least 5 operations per second

    // Grid should still be functional after rapid operations
    const finalRowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(finalRowCount).toBeGreaterThan(0);
  });

  test('should generate performance comparison report', async () => {
    const performanceReport = {
      testDate: new Date().toISOString(),
      blgGridVersion: '1.0.0', // Would be detected from package
      testEnvironment: await page.evaluate(() => navigator.userAgent),
      metrics: {
        renderTime: 0,
        sortTime: 0,
        filterTime: 0,
        memoryEfficiency: 0,
        scrollPerformance: 0
      },
      thresholds: PERFORMANCE_THRESHOLDS,
      passed: true
    };

    // Run a representative test
    const testData = MigrationTestData.getPerformanceAgGridOptions(1000);
    const blgConfig = MigrationMapper.migrateGridOptions(testData);

    const startTime = Date.now();
    await page.evaluate((config) => {
      window.testGridInstance?.setConfiguration(config);
    }, blgConfig);
    await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
    const renderTime = Date.now() - startTime;

    performanceReport.metrics.renderTime = renderTime;
    performanceReport.passed = renderTime < PERFORMANCE_THRESHOLDS.renderTime;

    console.log('Performance Report:', JSON.stringify(performanceReport, null, 2));

    // Assert overall performance
    expect(performanceReport.passed).toBe(true);
    expect(performanceReport.metrics.renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.renderTime);

    // Store report (in real implementation, this might be saved to file or database)
    await page.evaluate((report) => {
      window.performanceReport = report;
    }, performanceReport);
  });

  test('should compare performance with different data types', async () => {
    const dataTypeTests = [
      {
        name: 'Simple strings and numbers',
        data: MigrationTestData.getLargeDataset(1000),
        expectedRenderTime: 2000
      },
      {
        name: 'Complex objects with formatters',
        data: MigrationTestData.getLargeDataset(1000).map(row => ({
          ...row,
          complexField: { nested: { value: row.firstName + ' ' + row.lastName } },
          formattedSalary: '$' + row.salary.toLocaleString(),
          dateObject: new Date(row.startDate)
        })),
        expectedRenderTime: 3000
      }
    ];

    for (const testCase of dataTypeTests) {
      console.log(`Testing performance with: ${testCase.name}`);

      const agGridOptions = {
        rowData: testCase.data,
        columnDefs: MigrationTestData.getBasicColumnDefs(),
        pagination: false
      };

      const blgConfig = MigrationMapper.migrateGridOptions(agGridOptions);

      const startTime = Date.now();
      await page.evaluate((config) => {
        window.testGridInstance?.setConfiguration(config);
      }, blgConfig);

      await expect(page.locator('[data-testid="blg-grid"]')).toBeVisible();
      const renderTime = Date.now() - startTime;

      console.log(`${testCase.name} render time: ${renderTime}ms`);

      expect(renderTime).toBeLessThan(testCase.expectedRenderTime);

      // Clean up
      await page.evaluate(() => {
        window.testGridInstance?.setRowData([]);
      });
    }
  });
});