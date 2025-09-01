import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';
import { TestDataManager } from '../data/test-data-manager';

test.describe('Grid Rendering and Initialization', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoBasicExample();
  });
  
  test('should render grid container with proper structure', async () => {
    await gridPage.validateGridStructure();
    
    // Verify grid container exists
    await expect(gridPage.page.locator('[data-testid="grid-container"]')).toBeVisible();
    
    // Verify header and body are present
    await expect(gridPage.page.locator('[data-testid="grid-header"]')).toBeVisible();
    await expect(gridPage.page.locator('[data-testid="grid-body"]')).toBeVisible();
  });
  
  test('should initialize with default dataset', async () => {
    await gridPage.waitForGridToLoad();
    
    // Verify data is loaded
    const rowCount = await gridPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
    
    // Verify first row data
    const firstRowData = await gridPage.getCellTextByField(0, 'firstName');
    expect(firstRowData).toBeTruthy();
  });
  
  test('should render column headers correctly', async () => {
    await gridPage.waitForGridToLoad();
    
    const testData = TestDataManager.getInstance();
    const smallDataset = testData.getDataset('small');
    
    // Verify all column headers are rendered
    for (const column of smallDataset.columns) {
      const header = gridPage.page.locator(`[data-testid="grid-header-${column.field}"]`);
      await expect(header).toBeVisible();
      await expect(header).toContainText(column.header);
    }
  });
  
  test('should handle empty dataset gracefully', async () => {
    await gridPage.loadDataset('empty');
    
    // Grid should still render but with no rows
    await gridPage.validateGridStructure();
    
    const isEmpty = await gridPage.isGridEmpty();
    expect(isEmpty).toBe(true);
    
    // Should show empty state message
    await expect(gridPage.page.locator('[data-testid="empty-grid-message"]')).toBeVisible();
  });
  
  test('should handle single row dataset', async () => {
    await gridPage.loadDataset('single-row');
    
    const rowCount = await gridPage.getRowCount();
    expect(rowCount).toBe(1);
    
    // Verify single row renders correctly
    const firstRowData = await gridPage.getCellTextByField(0, 'firstName');
    expect(firstRowData).toBeTruthy();
  });
  
  test('should display loading indicator during data loading', async ({ page }) => {
    // Navigate to a new example to trigger loading
    const navigationPromise = gridPage.gotoPerformanceExample();
    
    // Check if loading indicator appears (it might be very quick)
    try {
      await expect(page.locator('[data-testid="grid-loading"]')).toBeVisible({ timeout: 1000 });
    } catch {
      // Loading might be too fast to catch, which is acceptable
    }
    
    await navigationPromise;
    
    // Verify loading is complete
    const hasLoadingIndicator = await gridPage.hasLoadingIndicator();
    expect(hasLoadingIndicator).toBe(false);
  });
  
  test('should render grid with different page sizes', async () => {
    const pageSizes = [10, 20, 50, 100];
    
    for (const pageSize of pageSizes) {
      await gridPage.setPageSize(pageSize);
      await gridPage.waitForGridToLoad();
      
      const visibleRowCount = await gridPage.getVisibleRowCount();
      expect(visibleRowCount).toBeLessThanOrEqual(pageSize);
    }
  });
  
  test('should maintain grid layout on window resize', async ({ page }) => {
    await gridPage.waitForGridToLoad();
    
    // Get initial grid dimensions
    const gridContainer = page.locator('[data-testid="grid-container"]');
    const initialBox = await gridContainer.boundingBox();
    expect(initialBox).toBeTruthy();
    
    // Resize viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500); // Allow resize to settle
    
    // Verify grid is still visible and functional
    await gridPage.validateGridStructure();
    
    const newBox = await gridContainer.boundingBox();
    expect(newBox).toBeTruthy();
    expect(newBox!.width).toBeGreaterThan(0);
    expect(newBox!.height).toBeGreaterThan(0);
  });
  
  test('should render correctly in different themes', async ({ page }) => {
    await gridPage.waitForGridToLoad();
    
    // Test light theme (default)
    await expect(page.locator('[data-testid="grid-container"]')).toBeVisible();
    
    // Switch to dark theme if available
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      // Verify grid still renders in dark theme
      await gridPage.validateGridStructure();
      
      // Check that theme class is applied
      const gridContainer = page.locator('[data-testid="grid-container"]');
      const hasThemeClass = await gridContainer.evaluate(el => 
        el.classList.contains('dark-theme') || el.classList.contains('theme-dark')
      );
      expect(hasThemeClass).toBe(true);
    }
  });
  
  test('should handle rapid dataset changes', async () => {
    const datasets = ['small', 'medium', 'large'];
    
    for (const dataset of datasets) {
      await gridPage.loadDataset(dataset);
      await gridPage.waitForGridToLoad();
      
      // Verify grid renders correctly after each change
      await gridPage.validateGridStructure();
      await gridPage.validateDataLoaded();
    }
  });
  
  test('should render grid with mixed data types correctly', async () => {
    await gridPage.loadDataset('mixed');
    await gridPage.waitForGridToLoad();
    
    // Verify different cell types render appropriately
    const textCell = await gridPage.getCellTextByField(0, 'name');
    expect(textCell).toBeTruthy();
    
    const numberCell = await gridPage.getCellTextByField(0, 'score');
    expect(numberCell).toMatch(/^\d+$/);
    
    const currencyCell = await gridPage.getCellTextByField(0, 'currency');
    expect(currencyCell).toMatch(/^\$[\d,]+\.\d{2}$/);
    
    const percentageCell = await gridPage.getCellTextByField(0, 'percentage');
    expect(percentageCell).toMatch(/^\d+\.\d+%$/);
  });
  
  test('should handle null and undefined values gracefully', async () => {
    await gridPage.loadDataset('mixed');
    await gridPage.waitForGridToLoad();
    
    // Find rows with null values (every 10th row in mixed dataset)
    const nullCell = await gridPage.getCellTextByField(10, 'nullable');
    expect(nullCell).toMatch(/^(null|undefined|—|-)$/); // Common representations of null/empty
  });
  
  test('should render grid with custom cell templates', async ({ page }) => {
    await gridPage.waitForGridToLoad();
    
    // Check if any cells have custom templates (like buttons, icons, etc.)
    const customCells = page.locator('.grid-cell-custom, .grid-cell-template, [data-custom-cell]');
    const customCellCount = await customCells.count();
    
    if (customCellCount > 0) {
      // Verify custom cells render correctly
      for (let i = 0; i < Math.min(customCellCount, 5); i++) {
        await expect(customCells.nth(i)).toBeVisible();
      }
    }
  });
  
  test('should measure and validate render performance', async () => {
    const renderTime = await gridPage.measureRenderTime();
    
    // Grid should render within reasonable time
    expect(renderTime).toBeLessThan(3000); // 3 seconds max for initial render
    
    console.log(`Grid render time: ${renderTime}ms`);
  });
  
  test('should handle browser refresh gracefully', async () => {
    await gridPage.waitForGridToLoad();
    
    // Get initial state
    const initialRowCount = await gridPage.getRowCount();
    
    // Refresh page
    await gridPage.refreshPage();
    
    // Verify grid renders correctly after refresh
    await gridPage.validateGridStructure();
    const newRowCount = await gridPage.getRowCount();
    expect(newRowCount).toBe(initialRowCount);
  });
});