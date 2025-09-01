import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';
import { TestDataManager } from '../data/test-data-manager';

test.describe('Virtual Scrolling', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoVirtualScrollExample();
    await gridPage.enableVirtualScrolling();
  });
  
  test('should enable virtual scrolling for large datasets', async () => {
    await gridPage.loadDataset('large');
    await gridPage.waitForGridToLoad();
    
    // Verify virtual scrolling is active
    const visibleRowCount = await gridPage.getVisibleRowCount();
    const totalRowCount = await gridPage.getRowCount();
    
    // In virtual scrolling, visible rows should be less than total rows
    expect(visibleRowCount).toBeLessThan(totalRowCount);
    expect(visibleRowCount).toBeGreaterThan(0);
    
    // Verify scrollable area exists
    await expect(gridPage.page.locator('.virtual-scroll-viewport')).toBeVisible();
  });
  
  test('should render only visible rows plus buffer', async () => {
    await gridPage.loadDataset('performance');
    await gridPage.waitForGridToLoad();
    
    const visibleRowCount = await gridPage.getVisibleRowCount();
    
    // Should render approximately viewport height worth of rows plus buffer
    expect(visibleRowCount).toBeGreaterThan(10); // Minimum visible rows
    expect(visibleRowCount).toBeLessThan(200); // Should not render all 10k rows
  });
  
  test('should maintain scroll position and render correct rows', async () => {
    await gridPage.loadDataset('large');
    await gridPage.waitForGridToLoad();
    
    // Scroll to middle of dataset
    await gridPage.scrollVertically(2000);
    await gridPage.page.waitForTimeout(500); // Allow scroll to settle
    
    // Check scroll position
    const scrollPosition = await gridPage.gridHelper.getScrollPosition();
    expect(scrollPosition.top).toBeGreaterThan(0);
    
    // Verify different data is visible
    const firstVisibleRowData = await gridPage.getCellTextByField(0, 'firstName');
    
    // Scroll back to top
    await gridPage.scrollVertically(-2000);
    await gridPage.page.waitForTimeout(500);
    
    const newFirstRowData = await gridPage.getCellTextByField(0, 'firstName');
    
    // Data should be different after scrolling
    expect(firstVisibleRowData).not.toBe(newFirstRowData);
  });
  
  test('should handle rapid scrolling without breaking', async () => {
    await gridPage.loadDataset('large');
    await gridPage.waitForGridToLoad();
    
    // Perform rapid scroll operations
    const scrollAmounts = [500, -300, 800, -200, 1000, -600];
    
    for (const amount of scrollAmounts) {
      await gridPage.scrollVertically(amount);
      await gridPage.page.waitForTimeout(100); // Short pause between scrolls
    }
    
    // Grid should still be functional
    await gridPage.validateGridStructure();
    const visibleRowCount = await gridPage.getVisibleRowCount();
    expect(visibleRowCount).toBeGreaterThan(0);
  });
  
  test('should scroll to specific row correctly', async () => {
    await gridPage.loadDataset('large');
    await gridPage.waitForGridToLoad();
    
    // Scroll to row 100
    await gridPage.scrollToRow(100);
    await gridPage.page.waitForTimeout(500);
    
    // Verify row 100 is visible
    const row100 = gridPage.page.locator('[data-testid="grid-row-100"]');
    await expect(row100).toBeVisible();
    
    // Scroll to row 1000
    await gridPage.scrollToRow(1000);
    await gridPage.page.waitForTimeout(500);
    
    // Verify row 1000 is visible (if it exists)
    const totalRows = await gridPage.getRowCount();
    if (totalRows > 1000) {
      const row1000 = gridPage.page.locator('[data-testid="grid-row-1000"]');
      await expect(row1000).toBeVisible();
    }
  });
  
  test('should handle horizontal scrolling with virtual scrolling', async () => {
    await gridPage.loadDataset('performance'); // Dataset with many columns
    await gridPage.waitForGridToLoad();
    
    // Initial horizontal position
    const initialPosition = await gridPage.gridHelper.getScrollPosition();
    expect(initialPosition.left).toBe(0);
    
    // Scroll horizontally
    await gridPage.scrollHorizontally(500);
    await gridPage.page.waitForTimeout(300);
    
    const newPosition = await gridPage.gridHelper.getScrollPosition();
    expect(newPosition.left).toBeGreaterThan(0);
    
    // Grid should still be functional
    await gridPage.validateGridStructure();
  });
  
  test('should maintain selection during virtual scrolling', async () => {
    await gridPage.loadDataset('large');
    await gridPage.enableRowSelection();
    await gridPage.setSelectionMode('multiple');
    await gridPage.waitForGridToLoad();
    
    // Select first few visible rows
    await gridPage.selectRow(0);
    await gridPage.selectRow(1);
    await gridPage.selectRow(2);
    
    let selectedCount = await gridPage.getSelectedRowCount();
    expect(selectedCount).toBe(3);
    
    // Scroll down
    await gridPage.scrollVertically(2000);
    await gridPage.page.waitForTimeout(500);
    
    // Selection should be maintained
    selectedCount = await gridPage.getSelectedRowCount();
    expect(selectedCount).toBe(3);
    
    // Scroll back up
    await gridPage.scrollVertically(-2000);
    await gridPage.page.waitForTimeout(500);
    
    // Selected rows should still be selected
    const selectedRows = gridPage.page.locator('[data-testid^="grid-row-"].selected');
    expect(await selectedRows.count()).toBe(3);
  });
  
  test('should handle sorting with virtual scrolling', async () => {
    await gridPage.loadDataset('large');
    await gridPage.waitForGridToLoad();
    
    // Apply sort
    await gridPage.sortColumn('firstName', 'asc');
    await gridPage.waitForLoadingToComplete();
    
    // Verify sort is applied
    await gridPage.validateSortApplied('firstName', 'asc');
    
    // Scroll and verify sort is maintained
    await gridPage.scrollVertically(1000);
    await gridPage.page.waitForTimeout(500);
    
    const sortIndicator = await gridPage.getSortIndicator('firstName');
    expect(sortIndicator).toBe('asc');
    
    // Data should still be sorted (check a few rows)
    const visibleRowCount = await gridPage.getVisibleRowCount();
    if (visibleRowCount > 1) {
      const firstRowName = await gridPage.getCellTextByField(0, 'firstName');
      const secondRowName = await gridPage.getCellTextByField(1, 'firstName');
      
      // Should be in alphabetical order
      expect(firstRowName.localeCompare(secondRowName)).toBeLessThanOrEqual(0);
    }
  });
  
  test('should handle filtering with virtual scrolling', async () => {
    await gridPage.loadDataset('large');
    await gridPage.waitForGridToLoad();
    
    const initialRowCount = await gridPage.getRowCount();
    
    // Apply filter
    await gridPage.applyTextFilter('firstName', 'contains', 'John');
    await gridPage.waitForLoadingToComplete();
    
    // Row count should be reduced
    const filteredRowCount = await gridPage.getRowCount();
    expect(filteredRowCount).toBeLessThan(initialRowCount);
    
    // Scroll and verify filter is maintained
    if (filteredRowCount > 50) {
      await gridPage.scrollVertically(500);
      await gridPage.page.waitForTimeout(300);
      
      const filterIndicator = await gridPage.getFilterIndicator('firstName');
      expect(filterIndicator).toBe(true);
    }
  });
  
  test('should perform well with large datasets', async () => {
    await gridPage.loadDataset('performance');
    
    // Measure initial render time
    const renderTime = await gridPage.measureRenderTime();
    expect(renderTime).toBeLessThan(5000); // Should render within 5 seconds
    
    // Measure scroll performance
    const scrollStart = Date.now();
    
    // Perform several scroll operations
    for (let i = 0; i < 5; i++) {
      await gridPage.scrollVertically(1000);
      await gridPage.page.waitForTimeout(100);
    }
    
    const scrollTime = Date.now() - scrollStart;
    expect(scrollTime).toBeLessThan(3000); // Should complete scrolling within 3 seconds
    
    console.log(`Render time: ${renderTime}ms, Scroll time: ${scrollTime}ms`);
  });
  
  test('should handle memory efficiently with virtual scrolling', async ({ page }) => {
    await gridPage.loadDataset('performance');
    await gridPage.waitForGridToLoad();
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Perform extensive scrolling
    for (let i = 0; i < 10; i++) {
      await gridPage.scrollVertically(2000);
      await gridPage.page.waitForTimeout(200);
      await gridPage.scrollVertically(-1000);
      await gridPage.page.waitForTimeout(200);
    }
    
    // Check memory after scrolling
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Memory should not increase dramatically (allowing for some variance)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
      
      // Should not increase by more than 50%
      expect(memoryIncreasePercent).toBeLessThan(50);
      
      console.log(`Memory increase: ${memoryIncreasePercent.toFixed(2)}%`);
    }
  });
  
  test('should handle keyboard navigation with virtual scrolling', async () => {
    await gridPage.loadDataset('large');
    await gridPage.waitForGridToLoad();
    
    // Focus first cell
    await gridPage.selectRow(0);
    const firstCell = gridPage.page.locator('[data-testid="grid-cell-0-0"]');
    await firstCell.click();
    
    // Navigate down with arrow keys
    for (let i = 0; i < 20; i++) {
      await gridPage.navigateWithKeyboard('ArrowDown');
      await gridPage.page.waitForTimeout(50);
    }
    
    // Should auto-scroll to keep focused cell visible
    const focusedCell = await gridPage.getFocusedCell();
    expect(focusedCell).toBeTruthy();
    expect(focusedCell!.row).toBeGreaterThan(10);
    
    // Focused cell should be visible
    const focusedCellElement = gridPage.page.locator(
      `[data-testid="grid-cell-${focusedCell!.row}-${focusedCell!.column}"]`
    );
    await expect(focusedCellElement).toBeVisible();
  });
  
  test('should disable virtual scrolling when dataset is small', async () => {
    await gridPage.loadDataset('small');
    await gridPage.disableVirtualScrolling();
    await gridPage.waitForGridToLoad();
    
    const totalRowCount = await gridPage.getRowCount();
    const visibleRowCount = await gridPage.getVisibleRowCount();
    
    // All rows should be visible when virtual scrolling is disabled for small datasets
    expect(visibleRowCount).toBe(totalRowCount);
  });
  
  test('should handle dynamic row height with virtual scrolling', async ({ page }) => {
    await gridPage.loadDataset('mixed');
    await gridPage.waitForGridToLoad();
    
    // Check if any rows have dynamic height (multi-line content, etc.)
    const rows = page.locator('[data-testid^="grid-row-"]');
    const rowCount = await rows.count();
    
    if (rowCount > 1) {
      const firstRowHeight = await rows.first().evaluate(el => el.offsetHeight);
      const lastRowHeight = await rows.last().evaluate(el => el.offsetHeight);
      
      // If heights differ, virtual scrolling should still work
      if (firstRowHeight !== lastRowHeight) {
        // Scroll and verify grid remains functional
        await gridPage.scrollVertically(500);
        await gridPage.page.waitForTimeout(300);
        
        await gridPage.validateGridStructure();
      }
    }
  });
});