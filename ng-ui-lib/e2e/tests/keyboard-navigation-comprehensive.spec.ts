import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';

test.describe('Comprehensive Keyboard Navigation (ag-grid Feature Parity)', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoBasicExample();
    await gridPage.loadDataset('medium');
    await gridPage.waitForGridToLoad();
    await gridPage.focusFirstCell();
  });

  test.describe('Basic Cell Navigation', () => {
    test('should navigate cells with arrow keys', async ({ page }) => {
      // Focus first cell
      await gridPage.focusCell(0, 0);
      await expect(gridPage.getFocusedCell()).toBeVisible();
      
      // Right arrow - move to next column
      await page.keyboard.press('ArrowRight');
      const secondCell = await gridPage.getFocusedCell();
      expect(await secondCell.getAttribute('data-col-index')).toBe('1');
      
      // Down arrow - move to next row
      await page.keyboard.press('ArrowDown');
      const thirdCell = await gridPage.getFocusedCell();
      expect(await thirdCell.getAttribute('data-row-index')).toBe('1');
      expect(await thirdCell.getAttribute('data-col-index')).toBe('1');
      
      // Left arrow - move to previous column
      await page.keyboard.press('ArrowLeft');
      const fourthCell = await gridPage.getFocusedCell();
      expect(await fourthCell.getAttribute('data-col-index')).toBe('0');
      
      // Up arrow - move to previous row
      await page.keyboard.press('ArrowUp');
      const fifthCell = await gridPage.getFocusedCell();
      expect(await fifthCell.getAttribute('data-row-index')).toBe('0');
      expect(await fifthCell.getAttribute('data-col-index')).toBe('0');
    });

    test('should handle boundary navigation gracefully', async ({ page }) => {
      // Navigate to top-left cell
      await gridPage.focusCell(0, 0);
      
      // Try to go left from first column - should stay in place
      await page.keyboard.press('ArrowLeft');
      const cell = await gridPage.getFocusedCell();
      expect(await cell.getAttribute('data-col-index')).toBe('0');
      
      // Try to go up from first row - should stay in place
      await page.keyboard.press('ArrowUp');
      expect(await cell.getAttribute('data-row-index')).toBe('0');
      
      // Navigate to bottom-right boundary
      const rowCount = await gridPage.getVisibleRowCount();
      const colCount = await gridPage.getColumnCount();
      await gridPage.focusCell(rowCount - 1, colCount - 1);
      
      // Try to go right from last column - should stay in place
      await page.keyboard.press('ArrowRight');
      const lastCell = await gridPage.getFocusedCell();
      expect(await lastCell.getAttribute('data-col-index')).toBe((colCount - 1).toString());
      
      // Try to go down from last row - should stay in place or load more if virtual scrolling
      await page.keyboard.press('ArrowDown');
      const finalCell = await gridPage.getFocusedCell();
      expect(await finalCell.getAttribute('data-row-index')).toBe((rowCount - 1).toString());
    });

    test('should handle Ctrl+Arrow for fast navigation', async ({ page }) => {
      await gridPage.focusCell(2, 2); // Middle cell
      
      // Ctrl+Left should go to first column of current row
      await page.keyboard.press('Control+ArrowLeft');
      const leftBoundary = await gridPage.getFocusedCell();
      expect(await leftBoundary.getAttribute('data-col-index')).toBe('0');
      expect(await leftBoundary.getAttribute('data-row-index')).toBe('2');
      
      // Ctrl+Right should go to last column of current row
      await page.keyboard.press('Control+ArrowRight');
      const rightBoundary = await gridPage.getFocusedCell();
      const colCount = await gridPage.getColumnCount();
      expect(await rightBoundary.getAttribute('data-col-index')).toBe((colCount - 1).toString());
      expect(await rightBoundary.getAttribute('data-row-index')).toBe('2');
      
      // Ctrl+Up should go to first row of current column
      await page.keyboard.press('Control+ArrowUp');
      const topBoundary = await gridPage.getFocusedCell();
      expect(await topBoundary.getAttribute('data-row-index')).toBe('0');
      expect(await topBoundary.getAttribute('data-col-index')).toBe((colCount - 1).toString());
      
      // Ctrl+Down should go to last row of current column
      await page.keyboard.press('Control+ArrowDown');
      const bottomBoundary = await gridPage.getFocusedCell();
      const rowCount = await gridPage.getVisibleRowCount();
      expect(await bottomBoundary.getAttribute('data-row-index')).toBe((rowCount - 1).toString());
    });
  });

  test.describe('Page Navigation', () => {
    test('should navigate with Page Up/Page Down', async ({ page }) => {
      await gridPage.loadDataset('large'); // Need enough data for paging
      await gridPage.waitForGridToLoad();
      await gridPage.focusCell(0, 0);
      
      const initialRow = await gridPage.getFocusedCell();
      const initialRowIndex = parseInt(await initialRow.getAttribute('data-row-index') || '0');
      
      // Page Down should move down by page size
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(100); // Allow scroll to complete
      
      const afterPageDown = await gridPage.getFocusedCell();
      const afterPageDownIndex = parseInt(await afterPageDown.getAttribute('data-row-index') || '0');
      
      expect(afterPageDownIndex).toBeGreaterThan(initialRowIndex);
      
      // Page Up should move back up
      await page.keyboard.press('PageUp');
      await page.waitForTimeout(100);
      
      const afterPageUp = await gridPage.getFocusedCell();
      const afterPageUpIndex = parseInt(await afterPageUp.getAttribute('data-row-index') || '0');
      
      expect(afterPageUpIndex).toBeLessThan(afterPageDownIndex);
    });

    test('should navigate with Home/End keys', async ({ page }) => {
      await gridPage.focusCell(5, 3); // Middle position
      
      // Home should go to first column of current row
      await page.keyboard.press('Home');
      const homeCell = await gridPage.getFocusedCell();
      expect(await homeCell.getAttribute('data-col-index')).toBe('0');
      expect(await homeCell.getAttribute('data-row-index')).toBe('5');
      
      // End should go to last column of current row
      await page.keyboard.press('End');
      const endCell = await gridPage.getFocusedCell();
      const colCount = await gridPage.getColumnCount();
      expect(await endCell.getAttribute('data-col-index')).toBe((colCount - 1).toString());
      expect(await endCell.getAttribute('data-row-index')).toBe('5');
      
      // Ctrl+Home should go to first cell of grid
      await page.keyboard.press('Control+Home');
      const ctrlHomeCell = await gridPage.getFocusedCell();
      expect(await ctrlHomeCell.getAttribute('data-row-index')).toBe('0');
      expect(await ctrlHomeCell.getAttribute('data-col-index')).toBe('0');
      
      // Ctrl+End should go to last cell of grid
      await page.keyboard.press('Control+End');
      const ctrlEndCell = await gridPage.getFocusedCell();
      const rowCount = await gridPage.getVisibleRowCount();
      expect(await ctrlEndCell.getAttribute('data-row-index')).toBe((rowCount - 1).toString());
      expect(await ctrlEndCell.getAttribute('data-col-index')).toBe((colCount - 1).toString());
    });
  });

  test.describe('Cell Editing', () => {
    test('should start editing with F2 key', async ({ page }) => {
      await gridPage.focusEditableCell(0, 1);
      
      // F2 should start editing
      await page.keyboard.press('F2');
      
      // Check if cell is in edit mode
      const editingCell = page.locator('.blg-grid-cell-editing, [data-editing="true"]');
      await expect(editingCell).toBeVisible();
      
      // Input should be focused
      const cellInput = editingCell.locator('input, textarea, [contenteditable="true"]');
      await expect(cellInput).toBeFocused();
    });

    test('should start editing with Enter key', async ({ page }) => {
      await gridPage.focusEditableCell(0, 1);
      
      // Enter should start editing
      await page.keyboard.press('Enter');
      
      // Check if cell is in edit mode
      const editingCell = page.locator('.blg-grid-cell-editing, [data-editing="true"]');
      await expect(editingCell).toBeVisible();
    });

    test('should commit edit with Enter and move to next row', async ({ page }) => {
      await gridPage.focusEditableCell(0, 1);
      
      // Start editing
      await page.keyboard.press('F2');
      await page.waitForTimeout(100);
      
      // Type new value
      await page.keyboard.press('Control+a');
      await page.keyboard.type('New Value');
      
      // Enter should commit and move to next row
      await page.keyboard.press('Enter');
      
      // Should move to same column, next row
      const focusedCell = await gridPage.getFocusedCell();
      expect(await focusedCell.getAttribute('data-row-index')).toBe('1');
      expect(await focusedCell.getAttribute('data-col-index')).toBe('1');
      
      // Previous cell should show new value
      const editedCell = await gridPage.getCell(0, 1);
      const cellText = await editedCell.textContent();
      expect(cellText?.trim()).toBe('New Value');
    });

    test('should commit edit with Tab and move to next column', async ({ page }) => {
      await gridPage.focusEditableCell(0, 1);
      
      // Start editing
      await page.keyboard.press('F2');
      await page.waitForTimeout(100);
      
      // Type new value
      await page.keyboard.press('Control+a');
      await page.keyboard.type('Tab Value');
      
      // Tab should commit and move to next column
      await page.keyboard.press('Tab');
      
      // Should move to next column, same row
      const focusedCell = await gridPage.getFocusedCell();
      expect(await focusedCell.getAttribute('data-row-index')).toBe('0');
      expect(await focusedCell.getAttribute('data-col-index')).toBe('2');
    });

    test('should cancel edit with Escape key', async ({ page }) => {
      await gridPage.focusEditableCell(0, 1);
      
      // Get original value
      const originalValue = await gridPage.getCellText(0, 1);
      
      // Start editing
      await page.keyboard.press('F2');
      await page.waitForTimeout(100);
      
      // Change value
      await page.keyboard.press('Control+a');
      await page.keyboard.type('Cancelled Value');
      
      // Escape should cancel and revert
      await page.keyboard.press('Escape');
      
      // Cell should exit edit mode
      const editingCell = page.locator('.blg-grid-cell-editing, [data-editing="true"]');
      await expect(editingCell).not.toBeVisible();
      
      // Value should be unchanged
      const currentValue = await gridPage.getCellText(0, 1);
      expect(currentValue).toBe(originalValue);
    });
  });

  test.describe('Row Selection', () => {
    test('should select row with Space key', async ({ page }) => {
      await gridPage.enableRowSelection();
      await gridPage.focusCell(2, 0);
      
      // Space should select the row
      await page.keyboard.press('Space');
      
      // Row should be selected
      const selectedRow = page.locator('[data-row-index="2"].blg-grid-row-selected');
      await expect(selectedRow).toBeVisible();
      
      // Selection checkbox should be checked if present
      const checkbox = page.locator('[data-row-index="2"] .blg-grid-checkbox input[type="checkbox"]');
      if (await checkbox.isVisible()) {
        await expect(checkbox).toBeChecked();
      }
    });

    test('should support Ctrl+A to select all rows', async ({ page }) => {
      await gridPage.enableMultipleRowSelection();
      await gridPage.focusCell(0, 0);
      
      // Ctrl+A should select all rows
      await page.keyboard.press('Control+a');
      
      // All visible rows should be selected
      const selectedRows = page.locator('.blg-grid-row-selected');
      const selectedCount = await selectedRows.count();
      const visibleRowCount = await gridPage.getVisibleRowCount();
      
      expect(selectedCount).toBe(visibleRowCount);
    });

    test('should support Shift+Arrow for range selection', async ({ page }) => {
      await gridPage.enableMultipleRowSelection();
      await gridPage.focusCell(1, 0);
      
      // Select first row
      await page.keyboard.press('Space');
      
      // Shift+Down should extend selection
      await page.keyboard.press('Shift+ArrowDown');
      await page.keyboard.press('Shift+ArrowDown');
      
      // Rows 1, 2, and 3 should be selected
      const selectedRows = page.locator('.blg-grid-row-selected');
      const selectedCount = await selectedRows.count();
      expect(selectedCount).toBe(3);
    });
  });

  test.describe('Header Navigation', () => {
    test('should navigate column headers with arrow keys', async ({ page }) => {
      // Focus first header
      await gridPage.focusColumnHeader(0);
      
      // Right arrow should move to next header
      await page.keyboard.press('ArrowRight');
      const focusedHeader = await gridPage.getFocusedColumnHeader();
      expect(await focusedHeader.getAttribute('data-col-index')).toBe('1');
      
      // Left arrow should move back
      await page.keyboard.press('ArrowLeft');
      const backHeader = await gridPage.getFocusedColumnHeader();
      expect(await backHeader.getAttribute('data-col-index')).toBe('0');
    });

    test('should sort column with Enter key in header', async ({ page }) => {
      await gridPage.focusColumnHeader(0);
      
      // Enter should trigger sort
      await page.keyboard.press('Enter');
      
      // Column should show sort indicator
      const sortIndicator = page.locator('[data-col-index="0"] .blg-grid-sort-indicator');
      await expect(sortIndicator).toBeVisible();
      
      // Data should be sorted
      await gridPage.validateSortApplied(0, 'asc');
    });

    test('should open column menu with Alt+Down', async ({ page }) => {
      await gridPage.focusColumnHeader(0);
      
      // Alt+Down should open column menu
      await page.keyboard.press('Alt+ArrowDown');
      
      // Column menu should be visible
      const columnMenu = page.locator('.blg-grid-column-menu, [data-testid="column-menu"]');
      await expect(columnMenu).toBeVisible();
    });

    test('should toggle column selection checkbox with Space', async ({ page }) => {
      // If column has header checkbox for row selection
      const headerCheckbox = page.locator('.blg-grid-header-checkbox input[type="checkbox"]');
      if (await headerCheckbox.isVisible()) {
        await gridPage.focusColumnHeader(0);
        
        // Space should toggle header checkbox
        await page.keyboard.press('Space');
        
        // Should select/deselect all rows
        const selectedRows = page.locator('.blg-grid-row-selected');
        const selectedCount = await selectedRows.count();
        
        if (selectedCount > 0) {
          // All rows selected
          const visibleRowCount = await gridPage.getVisibleRowCount();
          expect(selectedCount).toBe(visibleRowCount);
        }
      }
    });
  });

  test.describe('Tab Navigation', () => {
    test('should tab through grid controls in logical order', async ({ page }) => {
      // Tab should move focus through:
      // 1. Grid container
      // 2. Column headers (if focusable)
      // 3. Cells
      // 4. Pagination controls
      // 5. Other grid controls
      
      await page.keyboard.press('Tab');
      const firstFocus = await page.locator(':focus');
      
      // Should focus on grid or first interactive element
      expect(await firstFocus.isVisible()).toBe(true);
    });

    test('should trap focus within grid when requested', async ({ page }) => {
      await gridPage.enableFocusTrapping();
      
      // Tab navigation should stay within grid boundaries
      // This is particularly important for modal/dialog contexts
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus');
      
      // Focus should be within grid container
      const gridContainer = page.locator('.blg-grid-container');
      expect(await gridContainer.locator(':focus').count()).toBeGreaterThan(0);
    });
  });

  test.describe('Copy/Paste Operations', () => {
    test('should copy cell content with Ctrl+C', async ({ page }) => {
      await gridPage.focusCell(0, 1);
      const cellValue = await gridPage.getCellText(0, 1);
      
      // Ctrl+C should copy cell content
      await page.keyboard.press('Control+c');
      
      // Focus another input to test paste
      const testInput = page.locator('[data-testid="test-input"]');
      if (await testInput.isVisible()) {
        await testInput.focus();
        await page.keyboard.press('Control+v');
        
        // Pasted content should match cell content
        const pastedValue = await testInput.inputValue();
        expect(pastedValue).toBe(cellValue);
      }
    });

    test('should copy selected range with Ctrl+C', async ({ page }) => {
      await gridPage.enableCellRangeSelection();
      
      // Select a range of cells
      await gridPage.selectCellRange(0, 0, 2, 2);
      
      // Ctrl+C should copy range
      await page.keyboard.press('Control+c');
      
      // Should copy as tab-separated values
      // Testing this requires clipboard API access
    });
  });

  test.describe('Advanced Keyboard Features', () => {
    test('should handle custom keyboard shortcuts', async ({ page }) => {
      // Custom shortcuts might include:
      // Ctrl+F for search
      // Ctrl+E for export
      // Ctrl+R for refresh
      
      await page.keyboard.press('Control+f');
      
      // Quick filter should be focused if available
      const quickFilter = page.locator('[data-testid="quick-filter"], .blg-grid-quick-filter input');
      if (await quickFilter.isVisible()) {
        await expect(quickFilter).toBeFocused();
      }
    });

    test('should support accessibility navigation with screen reader keys', async ({ page }) => {
      // Screen reader navigation patterns
      // This would require testing with actual screen reader software
      // But we can test the keyboard patterns they use
      
      await gridPage.focusCell(0, 0);
      
      // Ctrl+Alt+Right should move to next cell (JAWS pattern)
      await page.keyboard.press('Control+Alt+ArrowRight');
      
      // Should announce cell content (tested via aria-live regions)
      const announcements = page.locator('[aria-live]');
      if (await announcements.count() > 0) {
        const announcement = await announcements.first().textContent();
        expect(announcement).toBeTruthy();
      }
    });
  });

  test.describe('Virtual Scrolling with Keyboard', () => {
    test('should maintain keyboard navigation during virtual scrolling', async ({ page }) => {
      await gridPage.loadDataset('large');
      await gridPage.enableVirtualScrolling();
      await gridPage.waitForGridToLoad();
      
      await gridPage.focusCell(0, 0);
      
      // Navigate down many rows to trigger virtual scrolling
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(50);
      }
      
      // Focus should still be working
      const focusedCell = await gridPage.getFocusedCell();
      expect(await focusedCell.isVisible()).toBe(true);
      expect(await focusedCell.getAttribute('data-row-index')).toBe('20');
    });

    test('should scroll automatically to keep focused cell visible', async ({ page }) => {
      await gridPage.loadDataset('large');
      await gridPage.enableVirtualScrolling();
      await gridPage.waitForGridToLoad();
      
      // Navigate to middle of viewport
      await gridPage.focusCell(10, 0);
      
      // Get initial scroll position
      const initialScrollTop = await gridPage.getScrollTop();
      
      // Navigate down beyond viewport
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(25);
      }
      
      // Grid should have scrolled to keep cell visible
      const finalScrollTop = await gridPage.getScrollTop();
      expect(finalScrollTop).toBeGreaterThan(initialScrollTop);
      
      // Focused cell should still be visible
      const focusedCell = await gridPage.getFocusedCell();
      await expect(focusedCell).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation Performance', () => {
    test('should maintain responsive keyboard navigation with large datasets', async ({ page }) => {
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      const navigationTimes: number[] = [];
      
      await gridPage.focusCell(0, 0);
      
      // Measure navigation response times
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        await page.keyboard.press('ArrowDown');
        await gridPage.waitForFocusToSettle();
        const endTime = Date.now();
        
        navigationTimes.push(endTime - startTime);
      }
      
      // Average navigation time should be under 100ms
      const averageTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
      expect(averageTime).toBeLessThan(100);
      
      console.log(`Average keyboard navigation time: ${averageTime.toFixed(2)}ms`);
    });

    test('should handle rapid keyboard input without losing focus', async ({ page }) => {
      await gridPage.focusCell(5, 5);
      
      // Send rapid keyboard inputs
      const rapidKeys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
      
      for (const key of rapidKeys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(10); // Very fast input
      }
      
      // Focus should still be maintained
      const focusedCell = await gridPage.getFocusedCell();
      expect(await focusedCell.isVisible()).toBe(true);
      
      // Final position should be calculable
      const finalRow = await focusedCell.getAttribute('data-row-index');
      const finalCol = await focusedCell.getAttribute('data-col-index');
      expect(finalRow).toBeTruthy();
      expect(finalCol).toBeTruthy();
    });
  });
});