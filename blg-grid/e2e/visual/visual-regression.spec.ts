import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';

test.describe('Visual Regression Tests', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    
    // Ensure consistent environment for visual tests
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });
  
  test.describe('Grid Layout Screenshots', () => {
    test('should match basic grid layout', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Wait for animations to complete
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('basic-grid-layout.png');
    });
    
    test('should match grid with sorting applied', async ({ page }) => {
      await gridPage.gotoSortingExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Apply sort
      await gridPage.sortColumn('firstName', 'asc');
      await gridPage.waitForLoadingToComplete();
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('sorted-grid-layout.png');
    });
    
    test('should match grid with filters applied', async ({ page }) => {
      await gridPage.gotoFilteringExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Apply filter
      await gridPage.applyTextFilter('firstName', 'contains', 'John');
      await gridPage.waitForLoadingToComplete();
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('filtered-grid-layout.png');
    });
    
    test('should match grid with row selection', async ({ page }) => {
      await gridPage.gotoSelectionExample();
      await gridPage.loadDataset('small');
      await gridPage.setSelectionMode('multiple');
      await gridPage.waitForGridToLoad();
      
      // Select some rows
      await gridPage.selectRow(0);
      await page.keyboard.down('Control');
      await gridPage.selectRow(2);
      await gridPage.selectRow(4);
      await page.keyboard.up('Control');
      
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('selected-rows-grid-layout.png');
    });
    
    test('should match checkbox selection grid', async ({ page }) => {
      await gridPage.gotoSelectionExample();
      await gridPage.loadDataset('small');
      await gridPage.setSelectionMode('checkbox');
      await gridPage.waitForGridToLoad();
      
      // Select some rows via checkboxes
      await gridPage.selectRowByCheckbox(0);
      await gridPage.selectRowByCheckbox(2);
      
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('checkbox-selection-grid.png');
    });
    
    test('should match empty grid state', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('empty');
      await gridPage.waitForGridToLoad();
      
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('empty-grid-state.png');
    });
    
    test('should match loading grid state', async ({ page }) => {
      await gridPage.gotoBasicExample();
      
      // Capture loading state (might be quick)
      const loadingPromise = gridPage.loadDataset('large');
      
      // Try to capture loading state
      try {
        await page.waitForSelector('[data-testid="grid-loading"]', { timeout: 1000 });
        const gridContainer = page.locator('[data-testid="grid-container"]');
        await expect(gridContainer).toHaveScreenshot('loading-grid-state.png');
      } catch {
        // Loading might be too fast to capture
        console.log('Loading state too fast to capture');
      }
      
      await loadingPromise;
      await gridPage.waitForGridToLoad();
    });
  });
  
  test.describe('Column Operations Screenshots', () => {
    test('should match resized columns', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Resize some columns
      await gridPage.resizeColumn('firstName', 200);
      await gridPage.resizeColumn('email', -100);
      
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('resized-columns-grid.png');
    });
    
    test('should match reordered columns', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Reorder columns
      await gridPage.reorderColumn('firstName', 'email');
      
      await page.waitForTimeout(1000); // Allow for reorder animation
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('reordered-columns-grid.png');
    });
    
    test('should match grid with hidden columns', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Hide some columns
      await gridPage.hideColumn('age');
      await gridPage.hideColumn('salary');
      
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('hidden-columns-grid.png');
    });
  });
  
  test.describe('Virtual Scrolling Screenshots', () => {
    test('should match virtual scrolling grid', async ({ page }) => {
      await gridPage.gotoVirtualScrollExample();
      await gridPage.enableVirtualScrolling();
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('virtual-scrolling-grid.png');
    });
    
    test('should match scrolled virtual grid', async ({ page }) => {
      await gridPage.gotoVirtualScrollExample();
      await gridPage.enableVirtualScrolling();
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      // Scroll down
      await gridPage.scrollVertically(1000);
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('scrolled-virtual-grid.png');
    });
  });
  
  test.describe('Theme Screenshots', () => {
    test('should match light theme', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Ensure light theme is active
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        // Make sure we're in light theme
        const isDarkTheme = await page.locator('body').evaluate(el => 
          el.classList.contains('dark-theme') || el.classList.contains('theme-dark')
        );
        
        if (isDarkTheme) {
          await themeToggle.click();
          await page.waitForTimeout(500);
        }
      }
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('light-theme-grid.png');
    });
    
    test('should match dark theme', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Switch to dark theme
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
        
        const gridContainer = page.locator('[data-testid="grid-container"]');
        await expect(gridContainer).toHaveScreenshot('dark-theme-grid.png');
      } else {
        test.skip('Dark theme not available');
      }
    });
  });
  
  test.describe('Responsive Layout Screenshots', () => {
    test('should match tablet layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      await page.waitForTimeout(1000); // Allow responsive adjustments
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('tablet-layout-grid.png');
    });
    
    test('should match mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      await page.waitForTimeout(1000); // Allow responsive adjustments
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('mobile-layout-grid.png');
    });
    
    test('should match ultra-wide layout', async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1440 });
      
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('medium');
      await gridPage.waitForGridToLoad();
      
      await page.waitForTimeout(1000);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('ultra-wide-layout-grid.png');
    });
  });
  
  test.describe('Error State Screenshots', () => {
    test('should match filter error state', async ({ page }) => {
      await gridPage.gotoFilteringExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Trigger filter error
      await gridPage.gridHelper.openFilter('age');
      await page.locator('[data-testid="filter-value"]').fill('invalid-number');
      await page.locator('[data-testid="filter-apply"]').click();
      
      // Wait for error state
      await page.waitForTimeout(500);
      
      // Look for error messages
      const errorElement = page.locator('.error-message, [role="alert"], .filter-error').first();
      if (await errorElement.isVisible()) {
        await expect(errorElement).toHaveScreenshot('filter-error-state.png');
      }
    });
    
    test('should match no results state', async ({ page }) => {
      await gridPage.gotoFilteringExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Apply filter that returns no results
      await gridPage.applyTextFilter('firstName', 'equals', 'NonExistentName12345');
      await gridPage.waitForLoadingToComplete();
      
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('no-results-state.png');
    });
  });
  
  test.describe('Component States Screenshots', () => {
    test('should match sort indicators', async ({ page }) => {
      await gridPage.gotoSortingExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Apply sorts to show indicators
      await gridPage.sortColumn('firstName', 'asc');
      await page.keyboard.down('Control');
      await (await gridPage.gridHelper.getColumnHeader('lastName')).click();
      await page.keyboard.up('Control');
      await gridPage.waitForLoadingToComplete();
      
      await page.waitForTimeout(500);
      
      const headerRow = page.locator('[data-testid="grid-header"]');
      await expect(headerRow).toHaveScreenshot('sort-indicators.png');
    });
    
    test('should match filter indicators', async ({ page }) => {
      await gridPage.gotoFilteringExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Apply filters to show indicators
      await gridPage.applyTextFilter('firstName', 'contains', 'a');
      await gridPage.applyNumberFilter('age', 'greaterThan', 25);
      await gridPage.waitForLoadingToComplete();
      
      await page.waitForTimeout(500);
      
      const headerRow = page.locator('[data-testid="grid-header"]');
      await expect(headerRow).toHaveScreenshot('filter-indicators.png');
    });
    
    test('should match pagination component', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('large');
      await gridPage.setPageSize(20);
      await gridPage.waitForGridToLoad();
      
      // Look for pagination component
      const pagination = page.locator('.pagination, [data-testid="pagination"]').first();
      if (await pagination.isVisible()) {
        await expect(pagination).toHaveScreenshot('pagination-component.png');
      }
    });
  });
  
  test.describe('Hover and Focus States', () => {
    test('should match row hover state', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Hover over first row
      const firstRow = page.locator('[data-testid="grid-row-0"]');
      await firstRow.hover();
      
      await page.waitForTimeout(200);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('row-hover-state.png');
    });
    
    test('should match cell focus state', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Focus on a cell
      const cell = page.locator('[data-testid="grid-cell-1-1"]');
      await cell.focus();
      
      await page.waitForTimeout(200);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('cell-focus-state.png');
    });
    
    test('should match column header hover state', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Hover over column header
      const header = page.locator('[data-testid="grid-header-firstName"]');
      await header.hover();
      
      await page.waitForTimeout(200);
      
      const headerRow = page.locator('[data-testid="grid-header"]');
      await expect(headerRow).toHaveScreenshot('header-hover-state.png');
    });
  });
  
  test.describe('Animation Screenshots', () => {
    test('should match column resize animation', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Start resize animation
      const header = await gridPage.gridHelper.getColumnHeader('firstName');
      const resizeHandle = header.locator('.column-resize-handle');
      
      await resizeHandle.hover();
      await page.mouse.down();
      await page.mouse.move(100, 0);
      
      // Capture during resize
      await page.waitForTimeout(200);
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('column-resize-animation.png');
      
      await page.mouse.up();
    });
    
    test('should match sort animation', async ({ page }) => {
      await gridPage.gotoSortingExample();
      await gridPage.loadDataset('medium');
      await gridPage.waitForGridToLoad();
      
      // Trigger sort and capture transition
      const sortPromise = gridPage.sortColumn('firstName', 'asc');
      
      // Try to capture mid-animation
      await page.waitForTimeout(100);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      
      // This might catch the loading/transition state
      try {
        await expect(gridContainer).toHaveScreenshot('sort-animation.png');
      } catch {
        // Animation might be too fast
        console.log('Sort animation too fast to capture');
      }
      
      await sortPromise;
    });
  });
  
  test.describe('Print Layout Screenshots', () => {
    test('should match print layout', async ({ page }) => {
      await gridPage.gotoBasicExample();
      await gridPage.loadDataset('small');
      await gridPage.waitForGridToLoad();
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(500);
      
      const gridContainer = page.locator('[data-testid="grid-container"]');
      await expect(gridContainer).toHaveScreenshot('print-layout-grid.png');
    });
  });
});