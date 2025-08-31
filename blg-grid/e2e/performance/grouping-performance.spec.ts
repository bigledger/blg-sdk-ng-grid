import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';
import { DataFactory } from '../data/data-factory';

test.describe('Grouping Performance Tests', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    test.setTimeout(180000); // 3 minutes for grouping tests
  });
  
  test.describe('Basic Grouping Performance', () => {
    test('should group 50k rows by single column efficiently', async ({ page }) => {
      await page.goto('/'); // Go to main app
      await page.click('[data-testid="grouping-export-tab"]'); // Navigate to grouping example
      await gridPage.waitForGridToLoad();
      
      const dataset = DataFactory.createGroupingDataset();
      console.log(`Testing grouping with ${dataset.rows.length} rows`);
      
      // Load custom dataset
      await page.evaluate((data) => {
        const component = document.querySelector('app-grouping-export-example');
        if (component) {
          (component as any).loadDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      // Test grouping by different columns
      const groupingTests = [
        { field: 'region', expectedMaxTime: 3000, description: 'Region (5 groups)' },
        { field: 'department', expectedMaxTime: 2500, description: 'Department (7 groups)' },
        { field: 'country', expectedMaxTime: 4000, description: 'Country (~20 groups)' }
      ];
      
      for (const test of groupingTests) {
        const startTime = performance.now();
        
        // Apply grouping
        await page.locator(`[data-testid="group-by-${test.field}"]`).click();
        await gridPage.waitForLoadingToComplete();
        
        const groupingTime = performance.now() - startTime;
        
        console.log(`Group by ${test.description}: ${groupingTime.toFixed(2)}ms`);
        expect(groupingTime).toBeLessThan(test.expectedMaxTime);
        
        // Verify groups were created
        const groupHeaders = await page.locator('[data-testid^="group-header-"]').count();
        expect(groupHeaders).toBeGreaterThan(0);
        
        // Clear grouping for next test
        await page.locator('[data-testid="clear-grouping"]').click();
        await gridPage.waitForLoadingToComplete();
      }
    });
    
    test('should handle multi-level grouping on large dataset', async ({ page }) => {
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
      
      // Test multi-level grouping: Region -> Department -> Team
      const startTime = performance.now();
      
      // First level: Group by Region
      await page.locator('[data-testid="group-by-region"]').click();
      await gridPage.waitForLoadingToComplete();
      
      // Second level: Add Department grouping
      await page.locator('[data-testid="group-by-department"]').click();
      await gridPage.waitForLoadingToComplete();
      
      // Third level: Add Team grouping
      await page.locator('[data-testid="group-by-team"]').click();
      await gridPage.waitForLoadingToComplete();
      
      const multiGroupingTime = performance.now() - startTime;
      
      console.log(`Multi-level grouping (3 levels): ${multiGroupingTime.toFixed(2)}ms`);
      expect(multiGroupingTime).toBeLessThan(8000); // 8 seconds for 3-level grouping
      
      // Verify multi-level groups
      const regionGroups = await page.locator('[data-testid^="group-header-region-"]').count();
      const departmentGroups = await page.locator('[data-testid^="group-header-department-"]').count();
      const teamGroups = await page.locator('[data-testid^="group-header-team-"]').count();
      
      expect(regionGroups).toBeGreaterThan(0);
      expect(departmentGroups).toBeGreaterThan(regionGroups);
      expect(teamGroups).toBeGreaterThan(departmentGroups);
      
      console.log(`Created groups - Region: ${regionGroups}, Department: ${departmentGroups}, Team: ${teamGroups}`);
    });
    
    test('should calculate aggregations efficiently for grouped data', async ({ page }) => {
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
      
      // Group by department
      await page.locator('[data-testid="group-by-department"]').click();
      await gridPage.waitForLoadingToComplete();
      
      // Test different aggregation functions
      const aggregationTests = [
        { field: 'salary', function: 'sum', expectedMaxTime: 1500 },
        { field: 'salary', function: 'avg', expectedMaxTime: 1500 },
        { field: 'bonus', function: 'sum', expectedMaxTime: 1500 },
        { field: 'experience', function: 'avg', expectedMaxTime: 1500 },
        { field: 'rating', function: 'max', expectedMaxTime: 1000 }
      ];
      
      for (const test of aggregationTests) {
        const startTime = performance.now();
        
        // Add aggregation
        await page.locator(`[data-testid="add-aggregation-${test.field}-${test.function}"]`).click();
        await gridPage.waitForLoadingToComplete();
        
        const aggregationTime = performance.now() - startTime;
        
        console.log(`${test.function.toUpperCase()}(${test.field}) aggregation: ${aggregationTime.toFixed(2)}ms`);
        expect(aggregationTime).toBeLessThan(test.expectedMaxTime);
        
        // Verify aggregation values are displayed
        const aggregationValues = await page.locator(`[data-testid^="aggregation-${test.field}-${test.function}-"]`).count();
        expect(aggregationValues).toBeGreaterThan(0);
      }
    });
  });
  
  test.describe('Grouping UI Performance', () => {
    test('should expand/collapse groups smoothly', async ({ page }) => {
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
      
      // Group by region (few groups, many rows per group)
      await page.locator('[data-testid="group-by-region"]').click();
      await gridPage.waitForLoadingToComplete();
      
      // Get all group headers
      const groupHeaders = await page.locator('[data-testid^="group-header-"]');
      const groupCount = await groupHeaders.count();
      
      // Test expanding/collapsing individual groups
      const expandCollapseStart = performance.now();
      
      for (let i = 0; i < Math.min(groupCount, 5); i++) { // Test first 5 groups
        const groupHeader = groupHeaders.nth(i);
        
        // Collapse group
        await groupHeader.locator('[data-testid="group-collapse-button"]').click();
        await page.waitForTimeout(100);
        
        // Expand group
        await groupHeader.locator('[data-testid="group-expand-button"]').click();
        await page.waitForTimeout(100);
      }
      
      const expandCollapseTime = performance.now() - expandCollapseStart;
      
      console.log(`Expand/collapse ${Math.min(groupCount, 5)} groups: ${expandCollapseTime.toFixed(2)}ms`);
      expect(expandCollapseTime).toBeLessThan(2000); // Individual operations should be fast
      
      // Test expand/collapse all
      const expandAllStart = performance.now();
      await page.locator('[data-testid="expand-all-groups"]').click();
      await gridPage.waitForLoadingToComplete();
      const expandAllTime = performance.now() - expandAllStart;
      
      console.log(`Expand all groups: ${expandAllTime.toFixed(2)}ms`);
      expect(expandAllTime).toBeLessThan(3000);
      
      const collapseAllStart = performance.now();
      await page.locator('[data-testid="collapse-all-groups"]').click();
      await gridPage.waitForLoadingToComplete();
      const collapseAllTime = performance.now() - collapseAllStart;
      
      console.log(`Collapse all groups: ${collapseAllTime.toFixed(2)}ms`);
      expect(collapseAllTime).toBeLessThan(2000);
    });
    
    test('should handle group sorting efficiently', async ({ page }) => {
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
      
      // Group by department
      await page.locator('[data-testid="group-by-department"]').click();
      await gridPage.waitForLoadingToComplete();
      
      // Test sorting within groups
      const sortingTests = [
        { field: 'salary', direction: 'asc', expectedMaxTime: 2000 },
        { field: 'salary', direction: 'desc', expectedMaxTime: 2000 },
        { field: 'employeeName', direction: 'asc', expectedMaxTime: 2500 },
        { field: 'rating', direction: 'desc', expectedMaxTime: 2000 }
      ];
      
      for (const test of sortingTests) {
        const startTime = performance.now();
        
        if (test.direction === 'asc') {
          await gridPage.sortColumn(test.field, 'asc');
        } else {
          await gridPage.sortColumn(test.field, 'desc');
        }
        
        await gridPage.waitForLoadingToComplete();
        const sortTime = performance.now() - startTime;
        
        console.log(`Sort grouped data by ${test.field} (${test.direction}): ${sortTime.toFixed(2)}ms`);
        expect(sortTime).toBeLessThan(test.expectedMaxTime);
      }
    });
  });
  
  test.describe('Grouping Memory Performance', () => {
    test('should maintain reasonable memory usage with groups', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="grouping-export-tab"]');
      await gridPage.waitForGridToLoad();
      
      const dataset = DataFactory.createGroupingDataset();
      
      // Get baseline memory
      const baselineMemory = await page.evaluate(() => {
        if ((window as any).gc) (window as any).gc();
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Load dataset
      await page.evaluate((data) => {
        const component = document.querySelector('app-grouping-export-example');
        if (component) {
          (component as any).loadDataset(data);
        }
      }, dataset);
      
      await gridPage.waitForGridToLoad();
      
      const afterLoadMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Apply grouping
      await page.locator('[data-testid="group-by-region"]').click();
      await gridPage.waitForLoadingToComplete();
      
      const afterGroupingMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Add aggregations
      await page.locator('[data-testid="add-aggregation-salary-sum"]').click();
      await page.locator('[data-testid="add-aggregation-salary-avg"]').click();
      await page.locator('[data-testid="add-aggregation-bonus-sum"]').click();
      await gridPage.waitForLoadingToComplete();
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      if (baselineMemory > 0 && finalMemory > 0) {
        const loadIncrease = ((afterLoadMemory - baselineMemory) / baselineMemory) * 100;
        const groupingIncrease = ((afterGroupingMemory - afterLoadMemory) / afterLoadMemory) * 100;
        const aggregationIncrease = ((finalMemory - afterGroupingMemory) / afterGroupingMemory) * 100;
        
        console.log('Memory Usage Analysis:');
        console.log(`Baseline: ${(baselineMemory / 1024 / 1024).toFixed(2)}MB`);
        console.log(`After load: ${(afterLoadMemory / 1024 / 1024).toFixed(2)}MB (+${loadIncrease.toFixed(1)}%)`);
        console.log(`After grouping: ${(afterGroupingMemory / 1024 / 1024).toFixed(2)}MB (+${groupingIncrease.toFixed(1)}%)`);
        console.log(`After aggregations: ${(finalMemory / 1024 / 1024).toFixed(2)}MB (+${aggregationIncrease.toFixed(1)}%)`);
        
        // Grouping should not add more than 50% memory overhead
        expect(groupingIncrease).toBeLessThan(50);
        
        // Aggregations should not add more than 20% memory overhead
        expect(aggregationIncrease).toBeLessThan(20);
      }
    });
  });
});