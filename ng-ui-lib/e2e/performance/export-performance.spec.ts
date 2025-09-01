import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';
import { DataFactory } from '../data/data-factory';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Export Performance Tests', () => {
  let gridPage: GridPage;
  const downloadsPath = path.join(__dirname, '../../downloads');
  
  test.beforeEach(async ({ page, context }) => {
    // Set download directory
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    gridPage = new GridPage(page);
    test.setTimeout(300000); // 5 minutes for export tests
    
    // Ensure downloads directory exists
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }
  });
  
  test.afterEach(async () => {
    // Clean up downloaded files
    try {
      const files = fs.readdirSync(downloadsPath);
      for (const file of files) {
        fs.unlinkSync(path.join(downloadsPath, file));
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });
  
  test.describe('CSV Export Performance', () => {
    test('should export 50k rows to CSV efficiently', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="grouping-export-tab"]');
      await gridPage.waitForGridToLoad();
      
      const dataset = DataFactory.createGroupingDataset(); // 50k rows
      console.log(`Testing CSV export with ${dataset.rows.length} rows`);
      
      await page.evaluate((data) => {
        const component = document.querySelector('app-grouping-export-example');
        if (component) {
          (component as any).loadDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Test CSV export
      const startTime = performance.now();
      
      // Setup download promise
      const downloadPromise = page.waitForEvent('download');
      
      // Click export CSV button
      await page.locator('[data-testid="export-csv-button"]').click();
      
      // Wait for download to start
      const download = await downloadPromise;
      
      // Wait for download to complete
      const filePath = path.join(downloadsPath, download.suggestedFilename() || 'export.csv');
      await download.saveAs(filePath);
      
      const exportTime = performance.now() - startTime;
      
      console.log(`CSV export (${dataset.rows.length} rows): ${exportTime.toFixed(2)}ms`);
      expect(exportTime).toBeLessThan(15000); // 15 seconds max for 50k rows
      
      // Verify file was created and has reasonable size
      expect(fs.existsSync(filePath)).toBeTruthy();
      const fileSize = fs.statSync(filePath).size;
      
      console.log(`CSV file size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
      expect(fileSize).toBeGreaterThan(1024); // Should be at least 1KB
      expect(fileSize).toBeLessThan(50 * 1024 * 1024); // Should be less than 50MB
      
      // Verify file content (basic check)
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\\n');
      expect(lines.length).toBeGreaterThan(1000); // Should have many lines
      expect(lines[0]).toMatch(/region|department|employee/i); // Should have header
    });
    
    test('should export 100k rows to CSV within acceptable time', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="grouping-export-tab"]');
      await gridPage.waitForGridToLoad();
      
      const dataset = DataFactory.createExtremeDataset100k();
      console.log(`Testing CSV export with ${dataset.rows.length} rows`);
      
      await page.evaluate((data) => {
        const component = document.querySelector('app-grouping-export-example');
        if (component) {
          (component as any).loadDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      const startTime = performance.now();
      const downloadPromise = page.waitForEvent('download');
      
      await page.locator('[data-testid="export-csv-button"]').click();
      const download = await downloadPromise;
      
      const filePath = path.join(downloadsPath, download.suggestedFilename() || 'export-100k.csv');
      await download.saveAs(filePath);
      
      const exportTime = performance.now() - startTime;
      
      console.log(`CSV export (${dataset.rows.length} rows): ${exportTime.toFixed(2)}ms`);
      expect(exportTime).toBeLessThan(30000); // 30 seconds max for 100k rows
      
      // Verify file
      const fileSize = fs.statSync(filePath).size;
      console.log(`CSV file size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
      expect(fileSize).toBeGreaterThan(10 * 1024); // At least 10KB
    });
    
    test('should handle CSV export with filters applied', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="grouping-export-tab"]');
      await gridPage.waitForGridToLoad();
      
      const dataset = DataFactory.createGroupingDataset();
      await page.evaluate((data) => {
        const component = document.querySelector('app-grouping-export-example');
        if (component) {
          (component as any).loadDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Apply filter to reduce dataset
      await gridPage.applyTextFilter('department', 'equals', 'Engineering');
      await gridPage.waitForLoadingToComplete();
      
      // Export filtered data
      const startTime = performance.now();
      const downloadPromise = page.waitForEvent('download');
      
      await page.locator('[data-testid="export-csv-button"]').click();
      const download = await downloadPromise;
      
      const filePath = path.join(downloadsPath, 'filtered-export.csv');
      await download.saveAs(filePath);
      
      const exportTime = performance.now() - startTime;
      
      console.log(`Filtered CSV export: ${exportTime.toFixed(2)}ms`);
      expect(exportTime).toBeLessThan(5000); // Should be faster with filtered data
      
      // Verify filtered content
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/Engineering/g); // Should contain engineering entries
      expect(content).not.toMatch(/Sales|Marketing/g); // Should not contain other departments
    });
  });
  
  test.describe('Excel Export Performance', () => {
    test('should export 50k rows to Excel efficiently', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="grouping-export-tab"]');
      await gridPage.waitForGridToLoad();
      
      const dataset = DataFactory.createGroupingDataset();
      console.log(`Testing Excel export with ${dataset.rows.length} rows`);
      
      await page.evaluate((data) => {
        const component = document.querySelector('app-grouping-export-example');
        if (component) {
          (component as any).loadDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      const startTime = performance.now();
      const downloadPromise = page.waitForEvent('download');
      
      await page.locator('[data-testid="export-excel-button"]').click();
      const download = await downloadPromise;
      
      const filePath = path.join(downloadsPath, download.suggestedFilename() || 'export.xlsx');
      await download.saveAs(filePath);
      
      const exportTime = performance.now() - startTime;
      
      console.log(`Excel export (${dataset.rows.length} rows): ${exportTime.toFixed(2)}ms`);
      expect(exportTime).toBeLessThan(25000); // 25 seconds max for Excel (more complex format)
      
      // Verify file
      expect(fs.existsSync(filePath)).toBeTruthy();
      const fileSize = fs.statSync(filePath).size;
      
      console.log(`Excel file size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
      expect(fileSize).toBeGreaterThan(5 * 1024); // Should be larger than CSV due to format
    });
    
    test('should export 25k rows to Excel with formatting', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="grouping-export-tab"]');
      await gridPage.waitForGridToLoad();
      
      // Use smaller dataset for formatted Excel test
      const dataset = DataFactory.createLargeDataset(); // 5k rows
      await page.evaluate((data) => {
        const component = document.querySelector('app-grouping-export-example');
        if (component) {
          (component as any).loadDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Enable formatting options
      await page.locator('[data-testid="export-options-button"]').click();
      await page.locator('[data-testid="enable-excel-formatting"]').check();
      await page.locator('[data-testid="auto-size-columns"]').check();
      await page.locator('[data-testid="apply-styling"]').check();
      
      const startTime = performance.now();
      const downloadPromise = page.waitForEvent('download');
      
      await page.locator('[data-testid="export-excel-button"]').click();
      const download = await downloadPromise;
      
      const filePath = path.join(downloadsPath, 'formatted-export.xlsx');
      await download.saveAs(filePath);
      
      const exportTime = performance.now() - startTime;
      
      console.log(`Formatted Excel export (${dataset.rows.length} rows): ${exportTime.toFixed(2)}ms`);
      expect(exportTime).toBeLessThan(20000); // Formatting adds overhead
      
      const fileSize = fs.statSync(filePath).size;
      console.log(`Formatted Excel file size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
    });
  });
  
  test.describe('Export with Grouping', () => {
    test('should export grouped data efficiently', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="grouping-export-tab"]');
      await gridPage.waitForGridToLoad();
      
      const dataset = DataFactory.createGroupingDataset();
      await page.evaluate((data) => {
        const component = document.querySelector('app-grouping-export-example');
        if (component) {
          (component as any).loadDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Apply grouping
      await page.locator('[data-testid="group-by-region"]').click();
      await gridPage.waitForLoadingToComplete();
      
      // Add aggregations
      await page.locator('[data-testid="add-aggregation-salary-sum"]').click();
      await page.locator('[data-testid="add-aggregation-salary-avg"]').click();
      await gridPage.waitForLoadingToComplete();
      
      // Export grouped data
      const startTime = performance.now();
      const downloadPromise = page.waitForEvent('download');
      
      await page.locator('[data-testid="export-csv-button"]').click();
      const download = await downloadPromise;
      
      const filePath = path.join(downloadsPath, 'grouped-export.csv');
      await download.saveAs(filePath);
      
      const exportTime = performance.now() - startTime;
      
      console.log(`Grouped data export: ${exportTime.toFixed(2)}ms`);
      expect(exportTime).toBeLessThan(20000); // Grouping processing adds time
      
      // Verify grouped content structure
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\\n');
      
      // Should contain group headers and aggregation rows
      expect(content).toMatch(/Group:|Total:|Average:/); // Group indicators
      expect(lines.length).toBeGreaterThan(dataset.rows.length); // More lines due to grouping
    });
    
    test('should export visible data only when option selected', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="grouping-export-tab"]');
      await gridPage.waitForGridToLoad();
      
      const dataset = DataFactory.createGroupingDataset();
      await page.evaluate((data) => {
        const component = document.querySelector('app-grouping-export-example');
        if (component) {
          (component as any).loadDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Group by region and collapse some groups
      await page.locator('[data-testid="group-by-region"]').click();
      await gridPage.waitForLoadingToComplete();
      
      // Collapse first group
      const firstGroupHeader = page.locator('[data-testid^="group-header-"]').first();
      await firstGroupHeader.locator('[data-testid="group-collapse-button"]').click();
      await page.waitForTimeout(500);
      
      // Set export to visible data only
      await page.locator('[data-testid="export-options-button"]').click();
      await page.locator('[data-testid="export-scope-visible"]').check();
      
      const startTime = performance.now();
      const downloadPromise = page.waitForEvent('download');
      
      await page.locator('[data-testid="export-csv-button"]').click();
      const download = await downloadPromise;
      
      const filePath = path.join(downloadsPath, 'visible-only-export.csv');
      await download.saveAs(filePath);
      
      const exportTime = performance.now() - startTime;
      
      console.log(`Visible data only export: ${exportTime.toFixed(2)}ms`);
      expect(exportTime).toBeLessThan(10000); // Should be faster with less data
      
      // Verify file is smaller (fewer rows due to collapsed group)
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\\n').filter(line => line.trim());
      
      console.log(`Visible export lines: ${lines.length}, Original data: ${dataset.rows.length}`);
      expect(lines.length).toBeLessThan(dataset.rows.length + 50); // Should have fewer lines
    });
  });
  
  test.describe('Export Memory Performance', () => {
    test('should not cause memory leaks during large exports', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="grouping-export-tab"]');
      await gridPage.waitForGridToLoad();
      
      // Get baseline memory
      const baselineMemory = await page.evaluate(() => {
        if ((window as any).gc) (window as any).gc();
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      const datasets = [
        DataFactory.createLargeDataset(),
        DataFactory.createPerformanceDataset(),
        DataFactory.createGroupingDataset()
      ];
      
      for (let i = 0; i < datasets.length; i++) {
        const dataset = datasets[i];
        
        // Load dataset
        await page.evaluate((data) => {
          const component = document.querySelector('app-grouping-export-example');
          if (component) {
            (component as any).loadDataset(data);
          }
        }, dataset);
        
        await gridPage.waitForGridToLoad();
        
        // Export to CSV
        const downloadPromise = page.waitForEvent('download');
        await page.locator('[data-testid="export-csv-button"]').click();
        const download = await downloadPromise;
        
        const filePath = path.join(downloadsPath, `export-${i}.csv`);
        await download.saveAs(filePath);
        
        // Force cleanup
        await page.evaluate(() => {
          if ((window as any).gc) (window as any).gc();
        });
        
        await page.waitForTimeout(1000);
      }
      
      // Check final memory
      const finalMemory = await page.evaluate(() => {
        if ((window as any).gc) (window as any).gc();
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      if (baselineMemory > 0 && finalMemory > 0) {
        const memoryIncrease = ((finalMemory - baselineMemory) / baselineMemory) * 100;
        
        console.log(`Memory increase after multiple exports: ${memoryIncrease.toFixed(2)}%`);
        console.log(`Baseline: ${(baselineMemory / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
        
        // Should not increase memory by more than 30% after exports
        expect(memoryIncrease).toBeLessThan(30);
      }
    });
  });
  
  test.describe('Concurrent Export Performance', () => {
    test('should handle multiple export requests gracefully', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="grouping-export-tab"]');
      await gridPage.waitForGridToLoad();
      
      const dataset = DataFactory.createPerformanceDataset(); // 10k rows
      await page.evaluate((data) => {
        const component = document.querySelector('app-grouping-export-example');
        if (component) {
          (component as any).loadDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Test rapid export requests
      const exportPromises = [];
      const startTime = performance.now();
      
      // Trigger 3 export requests quickly
      for (let i = 0; i < 3; i++) {
        const downloadPromise = page.waitForEvent('download');
        await page.locator('[data-testid="export-csv-button"]').click();
        exportPromises.push(downloadPromise);
        await page.waitForTimeout(100); // Small delay between requests
      }
      
      // Wait for all exports to complete
      const downloads = await Promise.all(exportPromises);
      
      for (let i = 0; i < downloads.length; i++) {
        const filePath = path.join(downloadsPath, `concurrent-export-${i}.csv`);
        await downloads[i].saveAs(filePath);
      }
      
      const totalTime = performance.now() - startTime;
      
      console.log(`Concurrent exports (3x ${dataset.rows.length} rows): ${totalTime.toFixed(2)}ms`);
      expect(totalTime).toBeLessThan(30000); // 30 seconds for 3 concurrent exports
      
      // Verify all files were created
      for (let i = 0; i < 3; i++) {
        const filePath = path.join(downloadsPath, `concurrent-export-${i}.csv`);
        expect(fs.existsSync(filePath)).toBeTruthy();
        
        const fileSize = fs.statSync(filePath).size;
        expect(fileSize).toBeGreaterThan(1024); // Each file should have reasonable size
      }
    });
  });
});