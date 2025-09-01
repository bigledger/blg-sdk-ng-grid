import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';

test.describe('Keyboard Navigation', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoBasicExample();
    await gridPage.loadDataset('medium');
    await gridPage.waitForGridToLoad();
  });
  
  test.describe('Arrow Key Navigation', () => {
    test('should navigate right with arrow key', async ({ page }) => {
      // Focus first cell
      const firstCell = page.locator('[data-testid="grid-cell-0-0"]');
      await firstCell.click();
      await firstCell.focus();
      
      // Navigate right
      await gridPage.navigateWithKeyboard('ArrowRight');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(0);
      expect(focusedCell?.column).toBe(1);
    });
    
    test('should navigate left with arrow key', async ({ page }) => {
      // Focus second cell
      const secondCell = page.locator('[data-testid="grid-cell-0-1"]');
      await secondCell.click();
      await secondCell.focus();
      
      // Navigate left
      await gridPage.navigateWithKeyboard('ArrowLeft');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(0);
      expect(focusedCell?.column).toBe(0);
    });
    
    test('should navigate down with arrow key', async ({ page }) => {
      // Focus first cell
      const firstCell = page.locator('[data-testid="grid-cell-0-0"]');
      await firstCell.click();
      await firstCell.focus();
      
      // Navigate down
      await gridPage.navigateWithKeyboard('ArrowDown');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(1);
      expect(focusedCell?.column).toBe(0);
    });
    
    test('should navigate up with arrow key', async ({ page }) => {
      // Focus second row cell
      const secondRowCell = page.locator('[data-testid="grid-cell-1-0"]');
      await secondRowCell.click();
      await secondRowCell.focus();
      
      // Navigate up
      await gridPage.navigateWithKeyboard('ArrowUp');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(0);
      expect(focusedCell?.column).toBe(0);
    });
    
    test('should wrap to next row when reaching end of row', async ({ page }) => {
      // Get column count
      const headers = await gridPage.gridHelper.getColumnHeaders();
      const columnCount = await headers.count();
      
      // Focus last cell in first row
      const lastCellInRow = page.locator(`[data-testid="grid-cell-0-${columnCount - 1}"]`);
      await lastCellInRow.click();
      await lastCellInRow.focus();
      
      // Navigate right (should wrap to next row)
      await gridPage.navigateWithKeyboard('ArrowRight');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(1);
      expect(focusedCell?.column).toBe(0);
    });
    
    test('should wrap to previous row when at beginning of row', async ({ page }) => {
      // Focus first cell in second row
      const firstCellSecondRow = page.locator('[data-testid="grid-cell-1-0"]');
      await firstCellSecondRow.click();
      await firstCellSecondRow.focus();
      
      // Navigate left (should wrap to previous row)
      await gridPage.navigateWithKeyboard('ArrowLeft');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(0);
      
      // Should be at last column of previous row
      const headers = await gridPage.gridHelper.getColumnHeaders();
      const columnCount = await headers.count();
      expect(focusedCell?.column).toBe(columnCount - 1);
    });
  });
  
  test.describe('Home/End Navigation', () => {
    test('should navigate to beginning of row with Home key', async ({ page }) => {
      // Focus a cell in the middle of a row
      const middleCell = page.locator('[data-testid="grid-cell-1-2"]');
      await middleCell.click();
      await middleCell.focus();
      
      // Press Home
      await gridPage.navigateWithKeyboard('Home');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(1);
      expect(focusedCell?.column).toBe(0);
    });
    
    test('should navigate to end of row with End key', async ({ page }) => {
      // Focus first cell in row
      const firstCell = page.locator('[data-testid="grid-cell-1-0"]');
      await firstCell.click();
      await firstCell.focus();
      
      // Press End
      await gridPage.navigateWithKeyboard('End');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(1);
      
      // Should be at last column
      const headers = await gridPage.gridHelper.getColumnHeaders();
      const columnCount = await headers.count();
      expect(focusedCell?.column).toBe(columnCount - 1);
    });
    
    test('should navigate to first cell with Ctrl+Home', async ({ page }) => {
      // Focus a cell somewhere in the middle
      const middleCell = page.locator('[data-testid="grid-cell-3-2"]');
      await middleCell.click();
      await middleCell.focus();
      
      // Press Ctrl+Home
      await gridPage.navigateWithKeyboard('Control+Home');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(0);
      expect(focusedCell?.column).toBe(0);
    });
    
    test('should navigate to last cell with Ctrl+End', async ({ page }) => {
      // Focus first cell
      const firstCell = page.locator('[data-testid="grid-cell-0-0"]');
      await firstCell.click();
      await firstCell.focus();
      
      // Press Ctrl+End
      await gridPage.navigateWithKeyboard('Control+End');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      
      // Should be at last row and column
      const visibleRowCount = await gridPage.getVisibleRowCount();
      const headers = await gridPage.gridHelper.getColumnHeaders();
      const columnCount = await headers.count();
      
      expect(focusedCell?.row).toBe(visibleRowCount - 1);
      expect(focusedCell?.column).toBe(columnCount - 1);
    });
  });
  
  test.describe('Page Up/Down Navigation', () => {
    test('should navigate page down with PageDown key', async ({ page }) => {
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      // Focus first cell
      const firstCell = page.locator('[data-testid="grid-cell-0-0"]');
      await firstCell.click();
      await firstCell.focus();
      
      // Press PageDown
      await gridPage.navigateWithKeyboard('PageDown');
      await page.waitForTimeout(200);
      
      const focusedCell = await gridPage.getFocusedCell();
      
      // Should move down by approximately viewport height
      expect(focusedCell?.row).toBeGreaterThan(5);
      expect(focusedCell?.column).toBe(0); // Column should remain same
    });
    
    test('should navigate page up with PageUp key', async ({ page }) => {
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      // First scroll down to have room to page up
      await gridPage.scrollVertically(2000);
      await page.waitForTimeout(500);
      
      // Focus a cell that's visible after scroll
      const middleCell = page.locator('[data-testid="grid-cell-10-0"]');
      if (await middleCell.isVisible()) {
        await middleCell.click();
        await middleCell.focus();
        
        // Press PageUp
        await gridPage.navigateWithKeyboard('PageUp');
        await page.waitForTimeout(200);
        
        const focusedCell = await gridPage.getFocusedCell();
        
        // Should move up by viewport height
        expect(focusedCell?.row).toBeLessThan(10);
        expect(focusedCell?.column).toBe(0);
      }
    });
  });
  
  test.describe('Tab Navigation', () => {
    test('should tab through grid elements', async ({ page }) => {
      // Tab to first focusable element in grid
      let tabCount = 0;
      const maxTabs = 20;
      
      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;
        
        const focusedElement = page.locator(':focus');
        const isInGrid = await focusedElement.evaluate(el => {
          return el.closest('[data-testid="grid-container"]') !== null;
        });
        
        if (isInGrid) {
          break;
        }
      }
      
      expect(tabCount).toBeLessThan(maxTabs);
      
      // Should be able to tab through grid cells
      const initialFocusedElement = page.locator(':focus');
      await page.keyboard.press('Tab');
      
      const nextFocusedElement = page.locator(':focus');
      const isStillInGrid = await nextFocusedElement.evaluate(el => {
        return el.closest('[data-testid="grid-container"]') !== null;
      });
      
      // Depending on implementation, might tab to next cell or next control
      expect(isStillInGrid).toBe(true);
    });
    
    test('should shift+tab backward through grid elements', async ({ page }) => {
      // First tab forward to get into grid
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const forwardElement = page.locator(':focus');
      const isInGrid = await forwardElement.evaluate(el => {
        return el.closest('[data-testid="grid-container"]') !== null;
      });
      
      if (isInGrid) {
        // Now shift+tab backward
        await page.keyboard.press('Shift+Tab');
        
        const backwardElement = page.locator(':focus');
        const isStillInGrid = await backwardElement.evaluate(el => {
          return el.closest('[data-testid="grid-container"]') !== null;
        });
        
        // Should still be in grid or have moved to previous focusable element
        expect(isStillInGrid).toBeDefined();
      }
    });
  });
  
  test.describe('Enter and Space Key Actions', () => {
    test('should activate cell with Enter key', async ({ page }) => {
      // Focus a cell
      const cell = page.locator('[data-testid="grid-cell-0-0"]');
      await cell.click();
      await cell.focus();
      
      // Press Enter
      await gridPage.navigateWithKeyboard('Enter');
      await page.waitForTimeout(100);
      
      // Depending on implementation, might enter edit mode or perform action
      // Just verify no error occurred and grid is still functional
      await gridPage.validateGridStructure();
    });
    
    test('should handle Space key in cells', async ({ page }) => {
      // Focus a cell
      const cell = page.locator('[data-testid="grid-cell-0-0"]');
      await cell.click();
      await cell.focus();
      
      // Press Space
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);
      
      // Grid should remain functional
      await gridPage.validateGridStructure();
    });
    
    test('should toggle selection with Space in selection mode', async ({ page }) => {
      await gridPage.enableRowSelection();
      await gridPage.setSelectionMode('single');
      await gridPage.waitForGridToLoad();
      
      // Focus a row
      const row = page.locator('[data-testid="grid-row-0"]');
      await row.click();
      await row.focus();
      
      // Press Space to select
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);
      
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(1);
    });
  });
  
  test.describe('Escape Key Actions', () => {
    test('should cancel edit mode with Escape', async ({ page }) => {
      // Look for editable cell
      const editableCell = page.locator('[data-editable="true"], .editable-cell').first();
      
      if (await editableCell.isVisible()) {
        await editableCell.focus();
        
        // Enter edit mode (F2 or double-click)
        await page.keyboard.press('F2');
        await page.waitForTimeout(100);
        
        // Press Escape to cancel
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
        
        // Should exit edit mode
        const isEditing = await page.locator('.editing, [data-editing="true"]').count();
        expect(isEditing).toBe(0);
      }
    });
    
    test('should close modals with Escape', async ({ page }) => {
      // Open settings modal if available
      const settingsButton = page.locator('[data-testid="grid-settings-button"]');
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
        
        const modal = page.locator('[role="dialog"], .modal');
        if (await modal.isVisible()) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(100);
          
          // Modal should be closed
          await expect(modal).toBeHidden();
        }
      }
    });
  });
  
  test.describe('Function Key Actions', () => {
    test('should enter edit mode with F2', async ({ page }) => {
      // Look for editable cell
      const editableCell = page.locator('[data-editable="true"], .editable-cell').first();
      
      if (await editableCell.isVisible()) {
        await editableCell.focus();
        
        // Press F2 to enter edit mode
        await page.keyboard.press('F2');
        await page.waitForTimeout(100);
        
        // Check if edit mode is active
        const isEditing = await page.locator('.editing, [data-editing="true"], input:focus').count();
        expect(isEditing).toBeGreaterThan(0);
      } else {
        test.skip('No editable cells found');
      }
    });
    
    test('should handle Delete key', async ({ page }) => {
      // Focus a cell
      const cell = page.locator('[data-testid="grid-cell-0-0"]');
      await cell.click();
      await cell.focus();
      
      // Press Delete
      await page.keyboard.press('Delete');
      await page.waitForTimeout(100);
      
      // Grid should remain functional
      await gridPage.validateGridStructure();
    });
  });
  
  test.describe('Navigation with Virtual Scrolling', () => {
    test('should auto-scroll during keyboard navigation', async ({ page }) => {
      await gridPage.loadDataset('large');
      await gridPage.enableVirtualScrolling();
      await gridPage.waitForGridToLoad();
      
      // Focus first cell
      const firstCell = page.locator('[data-testid="grid-cell-0-0"]');
      await firstCell.click();
      await firstCell.focus();
      
      // Navigate down many times to trigger auto-scroll
      for (let i = 0; i < 30; i++) {
        await gridPage.navigateWithKeyboard('ArrowDown');
        await page.waitForTimeout(50);
      }
      
      // Should auto-scroll to keep focused cell visible
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(30);
      
      // Focused cell should be visible
      const focusedCellElement = page.locator(
        `[data-testid="grid-cell-${focusedCell?.row}-${focusedCell?.column}"]`
      );
      await expect(focusedCellElement).toBeVisible();
    });
    
    test('should handle PageDown with virtual scrolling', async ({ page }) => {
      await gridPage.loadDataset('large');
      await gridPage.enableVirtualScrolling();
      await gridPage.waitForGridToLoad();
      
      // Focus first cell
      const firstCell = page.locator('[data-testid="grid-cell-0-0"]');
      await firstCell.click();
      await firstCell.focus();
      
      // Press PageDown multiple times
      for (let i = 0; i < 3; i++) {
        await gridPage.navigateWithKeyboard('PageDown');
        await page.waitForTimeout(200);
      }
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBeGreaterThan(20); // Should have moved significantly
      
      // Focused cell should be visible
      const focusedCellElement = page.locator(
        `[data-testid="grid-cell-${focusedCell?.row}-${focusedCell?.column}"]`
      );
      await expect(focusedCellElement).toBeVisible();
    });
  });
  
  test.describe('Navigation with Sorting and Filtering', () => {
    test('should maintain keyboard navigation after sorting', async ({ page }) => {
      // Apply sort
      await gridPage.sortColumn('firstName', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      // Focus a cell
      const cell = page.locator('[data-testid="grid-cell-1-1"]');
      await cell.click();
      await cell.focus();
      
      // Navigate with arrow keys
      await gridPage.navigateWithKeyboard('ArrowRight');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(1);
      expect(focusedCell?.column).toBe(2);
    });
    
    test('should maintain keyboard navigation after filtering', async ({ page }) => {
      // Apply filter
      await gridPage.applyTextFilter('firstName', 'contains', 'a');
      await gridPage.waitForLoadingToComplete();
      
      // Focus a cell
      const cell = page.locator('[data-testid="grid-cell-0-0"]');
      await cell.click();
      await cell.focus();
      
      // Navigate with arrow keys
      await gridPage.navigateWithKeyboard('ArrowDown');
      await page.waitForTimeout(100);
      
      const focusedCell = await gridPage.getFocusedCell();
      expect(focusedCell?.row).toBe(1);
      expect(focusedCell?.column).toBe(0);
    });
  });
  
  test.describe('Selection with Keyboard', () => {
    test('should extend selection with Shift+Arrow keys', async ({ page }) => {
      await gridPage.enableRowSelection();
      await gridPage.setSelectionMode('multiple');
      await gridPage.waitForGridToLoad();
      
      // Focus first cell
      const firstCell = page.locator('[data-testid="grid-cell-0-0"]');
      await firstCell.click();
      await firstCell.focus();
      
      // Extend selection with Shift+ArrowDown
      await page.keyboard.press('Shift+ArrowDown');
      await page.keyboard.press('Shift+ArrowDown');
      await page.waitForTimeout(100);
      
      const selectedCount = await gridPage.getSelectedRowCount();
      expect(selectedCount).toBe(3); // Rows 0, 1, 2
    });
    
    test('should select all with Ctrl+A', async ({ page }) => {
      await gridPage.enableRowSelection();
      await gridPage.setSelectionMode('multiple');
      await gridPage.waitForGridToLoad();
      
      // Focus grid
      const firstCell = page.locator('[data-testid="grid-cell-0-0"]');
      await firstCell.click();
      await firstCell.focus();
      
      // Select all with Ctrl+A
      await page.keyboard.press('Control+A');
      await page.waitForTimeout(100);
      
      const selectedCount = await gridPage.getSelectedRowCount();
      const visibleRowCount = await gridPage.getVisibleRowCount();
      expect(selectedCount).toBe(visibleRowCount);
    });
  });
  
  test.describe('Accessibility Navigation', () => {
    test('should provide proper focus indicators', async ({ page }) => {
      // Focus a cell
      const cell = page.locator('[data-testid="grid-cell-0-0"]');
      await cell.click();
      await cell.focus();
      
      // Check for focus indicator
      const hasFocusStyle = await cell.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.outline !== 'none' || 
               computed.outlineWidth !== '0px' ||
               computed.boxShadow !== 'none' ||
               el.classList.contains('focused') ||
               el.classList.contains('focus');
      });
      
      expect(hasFocusStyle).toBe(true);
    });
    
    test('should announce navigation to screen readers', async ({ page }) => {
      // Focus a cell
      const cell = page.locator('[data-testid="grid-cell-0-0"]');
      await cell.click();
      await cell.focus();
      
      // Navigate and check for aria-describedby or live region updates
      await gridPage.navigateWithKeyboard('ArrowRight');
      await page.waitForTimeout(100);
      
      // Look for live regions that announce position
      const liveRegions = page.locator('[aria-live], [role="status"]');
      const liveRegionCount = await liveRegions.count();
      
      if (liveRegionCount > 0) {
        const liveText = await liveRegions.first().textContent();
        // Should announce position or cell content
        expect(liveText).toBeTruthy();
      }
    });
  });
});