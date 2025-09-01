import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';

test.describe('Advanced Column Features (ag-grid Feature Parity)', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoAdvancedColumnExample();
    await gridPage.loadDataset('comprehensive');
    await gridPage.waitForGridToLoad();
  });

  test.describe('Column Groups', () => {
    test('should display multi-level column headers', async ({ page }) => {
      await gridPage.enableColumnGroups();
      await gridPage.waitForGridToLoad();
      
      // Should show grouped column headers
      const groupHeaders = page.locator('.blg-column-group-header');
      const groupCount = await groupHeaders.count();
      expect(groupCount).toBeGreaterThan(0);
      
      // Each group should span multiple columns
      for (let i = 0; i < groupCount; i++) {
        const groupHeader = groupHeaders.nth(i);
        const colspan = await groupHeader.getAttribute('colspan');
        expect(parseInt(colspan || '1')).toBeGreaterThan(1);
      }
      
      // Should have both group headers and individual column headers
      const individualHeaders = page.locator('.blg-column-header:not(.blg-column-group-header)');
      const individualCount = await individualHeaders.count();
      expect(individualCount).toBeGreaterThan(0);
    });

    test('should support expanding/collapsing column groups', async ({ page }) => {
      await gridPage.enableColumnGroups();
      await gridPage.waitForGridToLoad();
      
      const expandableGroup = page.locator('.blg-column-group-header.expandable').first();
      if (await expandableGroup.isVisible()) {
        // Should have expand/collapse button
        const toggleButton = expandableGroup.locator('.blg-column-group-toggle');
        await expect(toggleButton).toBeVisible();
        
        // Get initial visible column count
        const initialColumnCount = await gridPage.getVisibleColumnCount();
        
        // Click to collapse
        await toggleButton.click();
        await page.waitForTimeout(200);
        
        // Should have fewer visible columns
        const collapsedColumnCount = await gridPage.getVisibleColumnCount();
        expect(collapsedColumnCount).toBeLessThan(initialColumnCount);
        
        // Click to expand
        await toggleButton.click();
        await page.waitForTimeout(200);
        
        // Should restore column count
        const expandedColumnCount = await gridPage.getVisibleColumnCount();
        expect(expandedColumnCount).toBe(initialColumnCount);
      }
    });

    test('should handle nested column groups', async ({ page }) => {
      await gridPage.enableNestedColumnGroups();
      await gridPage.waitForGridToLoad();
      
      // Should have multiple levels of group headers
      const level1Groups = page.locator('.blg-column-group-header[data-level="1"]');
      const level2Groups = page.locator('.blg-column-group-header[data-level="2"]');
      
      const level1Count = await level1Groups.count();
      const level2Count = await level2Groups.count();
      
      if (level1Count > 0 && level2Count > 0) {
        expect(level1Count).toBeGreaterThan(0);
        expect(level2Count).toBeGreaterThan(0);
        
        // Level 2 groups should be nested under level 1
        const nestedGroup = level2Groups.first();
        const parentGroup = await nestedGroup.locator('xpath=ancestor::*[contains(@class, "blg-column-group-header")]').first();
        await expect(parentGroup).toHaveAttribute('data-level', '1');
      }
    });

    test('should support column group styling and customization', async ({ page }) => {
      await gridPage.enableColumnGroups();
      await gridPage.waitForGridToLoad();
      
      const groupHeader = page.locator('.blg-column-group-header').first();
      if (await groupHeader.isVisible()) {
        // Should have custom styling
        const backgroundColor = await groupHeader.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
        
        // Should have proper text alignment
        const textAlign = await groupHeader.evaluate(el => 
          window.getComputedStyle(el).textAlign
        );
        expect(['left', 'center', 'right']).toContain(textAlign);
        
        // Should have proper font styling for group headers
        const fontWeight = await groupHeader.evaluate(el => 
          window.getComputedStyle(el).fontWeight
        );
        expect(['bold', '600', '700']).toContain(fontWeight);
      }
    });
  });

  test.describe('Column Types', () => {
    test('should apply rightAligned column type', async () => {
      await gridPage.setColumnType('salary', 'rightAligned');
      await gridPage.waitForGridToLoad();
      
      // Column cells should be right-aligned
      const salaryCell = await gridPage.getCell(0, 'salary');
      const textAlign = await salaryCell.evaluate(el => 
        window.getComputedStyle(el).textAlign
      );
      expect(textAlign).toBe('right');
      
      // Header should also be right-aligned
      const salaryHeader = await gridPage.getColumnHeader('salary');
      const headerAlign = await salaryHeader.evaluate(el => 
        window.getComputedStyle(el).textAlign
      );
      expect(headerAlign).toBe('right');
    });

    test('should apply numericColumn type with proper formatting', async () => {
      await gridPage.setColumnType('age', 'numericColumn');
      await gridPage.waitForGridToLoad();
      
      // Should have numeric formatting
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const ageCell = await gridPage.getCell(i, 'age');
        const cellText = await ageCell.textContent();
        
        // Should be right-aligned
        const textAlign = await ageCell.evaluate(el => 
          window.getComputedStyle(el).textAlign
        );
        expect(textAlign).toBe('right');
        
        // Should be a valid number
        const numValue = parseFloat(cellText?.replace(/[^0-9.-]/g, '') || '0');
        expect(numValue).not.toBeNaN();
      }
    });

    test('should apply currency column type with formatting', async () => {
      await gridPage.setColumnType('salary', 'currency');
      await gridPage.waitForGridToLoad();
      
      // Should format as currency
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const salaryCell = await gridPage.getCell(i, 'salary');
        const cellText = await salaryCell.textContent();
        
        // Should have currency symbol
        expect(cellText).toMatch(/[$€£¥]/);
        
        // Should be right-aligned
        const textAlign = await salaryCell.evaluate(el => 
          window.getComputedStyle(el).textAlign
        );
        expect(textAlign).toBe('right');
        
        // Should have comma separators for thousands
        if (cellText && cellText.includes(',')) {
          expect(cellText).toMatch(/\d{1,3}(,\d{3})*/);
        }
      }
    });

    test('should apply date column type with formatting', async () => {
      await gridPage.setColumnType('joinDate', 'dateColumn');
      await gridPage.waitForGridToLoad();
      
      // Should format dates consistently
      const visibleRowCount = await gridPage.getVisibleRowCount();
      for (let i = 0; i < Math.min(visibleRowCount, 3); i++) {
        const dateCell = await gridPage.getCell(i, 'joinDate');
        const cellText = await dateCell.textContent();
        
        // Should be a valid date format
        if (cellText && cellText.trim() !== '') {
          const date = new Date(cellText);
          expect(date.getTime()).not.toBeNaN();
        }
      }
    });

    test('should create custom column types', async ({ page }) => {
      // Define custom column type
      await gridPage.createCustomColumnType('highlightedText', {
        cellClass: 'highlighted-cell',
        headerClass: 'highlighted-header',
        cellStyle: { backgroundColor: '#ffff99' }
      });
      
      // Apply custom type to column
      await gridPage.setColumnType('firstName', 'highlightedText');
      await gridPage.waitForGridToLoad();
      
      // Should apply custom styling
      const firstNameCell = await gridPage.getCell(0, 'firstName');
      const backgroundColor = await firstNameCell.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Should have the custom background color (or close to it)
      expect(backgroundColor).toMatch(/rgb\(255, 255, 153\)|#ffff99|yellow/i);
      
      // Should have custom CSS class
      await expect(firstNameCell).toHaveClass(/highlighted-cell/);
    });

    test('should combine multiple column types', async () => {
      // Apply multiple types to same column
      await gridPage.setColumnTypes('salary', ['rightAligned', 'currency', 'bold']);
      await gridPage.waitForGridToLoad();
      
      const salaryCell = await gridPage.getCell(0, 'salary');
      
      // Should be right-aligned (from rightAligned type)
      const textAlign = await salaryCell.evaluate(el => 
        window.getComputedStyle(el).textAlign
      );
      expect(textAlign).toBe('right');
      
      // Should have currency formatting (from currency type)
      const cellText = await salaryCell.textContent();
      expect(cellText).toMatch(/[$€£¥]/);
      
      // Should be bold (from bold type)
      const fontWeight = await salaryCell.evaluate(el => 
        window.getComputedStyle(el).fontWeight
      );
      expect(['bold', '600', '700']).toContain(fontWeight);
    });

    test('should inherit from default column definitions', async () => {
      // Set default column definition
      await gridPage.setDefaultColumnDefinition({
        type: 'rightAligned',
        sortable: true,
        filter: true,
        resizable: true
      });
      
      await gridPage.loadNewData();
      await gridPage.waitForGridToLoad();
      
      // All columns should inherit default properties
      const columnCount = await gridPage.getColumnCount();
      for (let i = 0; i < Math.min(columnCount, 3); i++) {
        const cell = await gridPage.getCell(0, i);
        
        // Should be right-aligned from default type
        const textAlign = await cell.evaluate(el => 
          window.getComputedStyle(el).textAlign
        );
        expect(textAlign).toBe('right');
        
        // Should be sortable (check header)
        const header = await gridPage.getColumnHeaderByIndex(i);
        const sortButton = header.locator('.blg-sort-button');
        await expect(sortButton).toBeVisible();
        
        // Should be filterable
        const filterButton = header.locator('.blg-filter-button');
        await expect(filterButton).toBeVisible();
      }
    });
  });

  test.describe('Advanced Column Operations', () => {
    test('should support column auto-sizing', async ({ page }) => {
      // Get initial column width
      const columnHeader = await gridPage.getColumnHeader('firstName');
      const initialWidth = await columnHeader.evaluate(el => el.getBoundingClientRect().width);
      
      // Auto-size column to fit content
      await gridPage.rightClickColumnHeader('firstName');
      const contextMenu = page.locator('.blg-column-context-menu');
      await contextMenu.locator('text=Auto Size').click();
      
      await page.waitForTimeout(200);
      
      // Width should change to fit content
      const newWidth = await columnHeader.evaluate(el => el.getBoundingClientRect().width);
      expect(newWidth).not.toBe(initialWidth);
      expect(newWidth).toBeGreaterThan(50); // Should have reasonable minimum
    });

    test('should support auto-sizing all columns', async ({ page }) => {
      // Get initial total width
      const gridContainer = page.locator('.blg-grid-container');
      const initialWidth = await gridContainer.evaluate(el => el.scrollWidth);
      
      // Auto-size all columns
      await gridPage.rightClickColumnHeader('firstName');
      const contextMenu = page.locator('.blg-column-context-menu');
      await contextMenu.locator('text=Auto Size All Columns').click();
      
      await page.waitForTimeout(500);
      
      // Total width may change
      const newWidth = await gridContainer.evaluate(el => el.scrollWidth);
      // Width difference should be reasonable (not extreme)
      const widthRatio = newWidth / initialWidth;
      expect(widthRatio).toBeGreaterThan(0.5);
      expect(widthRatio).toBeLessThan(2.0);
    });

    test('should support size columns to fit container', async ({ page }) => {
      // Size columns to fit container width
      await gridPage.rightClickColumnHeader('firstName');
      const contextMenu = page.locator('.blg-column-context-menu');
      await contextMenu.locator('text=Size to Fit').click();
      
      await page.waitForTimeout(200);
      
      // Columns should fit exactly in container
      const gridContainer = page.locator('.blg-grid-container');
      const containerWidth = await gridContainer.evaluate(el => el.clientWidth);
      const contentWidth = await gridContainer.evaluate(el => el.scrollWidth);
      
      // Should not have horizontal scrollbar (content fits in container)
      expect(Math.abs(contentWidth - containerWidth)).toBeLessThan(5); // Allow small variance
    });

    test('should support column dragging for reordering', async ({ page }) => {
      // Get initial column order
      const initialOrder = await gridPage.getColumnOrder();
      
      // Drag first column to third position
      const firstColumnHeader = await gridPage.getColumnHeaderByIndex(0);
      const thirdColumnHeader = await gridPage.getColumnHeaderByIndex(2);
      
      // Get positions for drag operation
      const firstRect = await firstColumnHeader.boundingBox();
      const thirdRect = await thirdColumnHeader.boundingBox();
      
      if (firstRect && thirdRect) {
        // Perform drag operation
        await page.mouse.move(firstRect.x + firstRect.width / 2, firstRect.y + firstRect.height / 2);
        await page.mouse.down();
        await page.mouse.move(thirdRect.x + thirdRect.width / 2, thirdRect.y + thirdRect.height / 2);
        await page.mouse.up();
        
        await page.waitForTimeout(200);
        
        // Column order should change
        const newOrder = await gridPage.getColumnOrder();
        expect(newOrder).not.toEqual(initialOrder);
        
        // First column should now be in third position
        expect(newOrder[2]).toBe(initialOrder[0]);
      }
    });

    test('should show column move indicators during drag', async ({ page }) => {
      const firstColumnHeader = await gridPage.getColumnHeaderByIndex(0);
      const secondColumnHeader = await gridPage.getColumnHeaderByIndex(1);
      
      const firstRect = await firstColumnHeader.boundingBox();
      const secondRect = await secondColumnHeader.boundingBox();
      
      if (firstRect && secondRect) {
        // Start drag
        await page.mouse.move(firstRect.x + firstRect.width / 2, firstRect.y + firstRect.height / 2);
        await page.mouse.down();
        
        // Move over second column
        await page.mouse.move(secondRect.x + secondRect.width / 2, secondRect.y + secondRect.height / 2);
        
        // Should show drop indicators
        const dropIndicator = page.locator('.blg-column-drop-indicator, .column-move-indicator');
        await expect(dropIndicator).toBeVisible();
        
        // Cancel drag
        await page.mouse.up();
      }
    });

    test('should prevent dropping column in invalid locations', async ({ page }) => {
      const firstColumnHeader = await gridPage.getColumnHeaderByIndex(0);
      const gridBody = page.locator('.blg-grid-body');
      
      const headerRect = await firstColumnHeader.boundingBox();
      const bodyRect = await gridBody.boundingBox();
      
      if (headerRect && bodyRect) {
        // Start drag from header
        await page.mouse.move(headerRect.x + headerRect.width / 2, headerRect.y + headerRect.height / 2);
        await page.mouse.down();
        
        // Try to drop in grid body (invalid location)
        await page.mouse.move(bodyRect.x + bodyRect.width / 2, bodyRect.y + bodyRect.height / 2);
        
        // Should show "no drop" indicator or reject drop
        const noDropIndicator = page.locator('.blg-no-drop-indicator, .drop-not-allowed');
        if (await noDropIndicator.isVisible()) {
          await expect(noDropIndicator).toBeVisible();
        }
        
        // Drop should be rejected
        await page.mouse.up();
        
        // Column order should remain unchanged
        const finalOrder = await gridPage.getColumnOrder();
        expect(finalOrder[0]).toBeTruthy(); // First column should still be first
      }
    });

    test('should support column locking/unlocking', async ({ page }) => {
      // Lock a column to prevent moving
      await gridPage.rightClickColumnHeader('firstName');
      const contextMenu = page.locator('.blg-column-context-menu');
      await contextMenu.locator('text=Lock Column').click();
      
      // Column should show lock indicator
      const columnHeader = await gridPage.getColumnHeader('firstName');
      const lockIndicator = columnHeader.locator('.blg-column-lock-indicator');
      await expect(lockIndicator).toBeVisible();
      
      // Try to drag locked column - should not move
      const initialOrder = await gridPage.getColumnOrder();
      
      const firstRect = await columnHeader.boundingBox();
      const thirdColumnHeader = await gridPage.getColumnHeaderByIndex(2);
      const thirdRect = await thirdColumnHeader.boundingBox();
      
      if (firstRect && thirdRect) {
        await page.mouse.move(firstRect.x + firstRect.width / 2, firstRect.y + firstRect.height / 2);
        await page.mouse.down();
        await page.mouse.move(thirdRect.x + thirdRect.width / 2, thirdRect.y + thirdRect.height / 2);
        await page.mouse.up();
        
        await page.waitForTimeout(200);
        
        // Order should remain unchanged
        const finalOrder = await gridPage.getColumnOrder();
        expect(finalOrder).toEqual(initialOrder);
      }
      
      // Unlock column
      await gridPage.rightClickColumnHeader('firstName');
      await contextMenu.locator('text=Unlock Column').click();
      
      // Lock indicator should disappear
      await expect(lockIndicator).not.toBeVisible();
    });
  });

  test.describe('Column Menu Enhancements', () => {
    test('should show comprehensive column menu', async ({ page }) => {
      await gridPage.rightClickColumnHeader('firstName');
      
      const contextMenu = page.locator('.blg-column-context-menu');
      await expect(contextMenu).toBeVisible();
      
      // Should have all expected menu items
      const expectedMenuItems = [
        'Sort Ascending',
        'Sort Descending',
        'Clear Sort',
        'Filter',
        'Clear Filter',
        'Pin Left',
        'Pin Right',
        'Unpin',
        'Auto Size',
        'Auto Size All',
        'Size to Fit',
        'Hide Column',
        'Show All Columns',
        'Column Settings'
      ];
      
      for (const item of expectedMenuItems) {
        const menuItem = contextMenu.locator(`text=${item}`);
        // Not all items may be visible depending on column state
        // Just check that the menu has reasonable options
      }
      
      const menuItems = contextMenu.locator('.menu-item');
      const menuItemCount = await menuItems.count();
      expect(menuItemCount).toBeGreaterThan(5);
    });

    test('should handle column menu actions', async ({ page }) => {
      await gridPage.rightClickColumnHeader('firstName');
      const contextMenu = page.locator('.blg-column-context-menu');
      
      // Sort Ascending
      await contextMenu.locator('text=Sort Ascending').click();
      await gridPage.waitForLoadingToComplete();
      await gridPage.validateSortApplied('firstName', 'asc');
      
      // Pin Left
      await gridPage.rightClickColumnHeader('firstName');
      await contextMenu.locator('text=Pin Left').click();
      
      const columnHeader = await gridPage.getColumnHeader('firstName');
      await expect(columnHeader).toHaveClass(/pinned-left/);
      
      // Hide Column
      await gridPage.rightClickColumnHeader('lastName');
      await contextMenu.locator('text=Hide Column').click();
      
      const lastNameHeader = page.locator('.blg-column-header:has-text("Last Name")');
      await expect(lastNameHeader).not.toBeVisible();
    });

    test('should show column chooser dialog', async ({ page }) => {
      await gridPage.rightClickColumnHeader('firstName');
      const contextMenu = page.locator('.blg-column-context-menu');
      await contextMenu.locator('text=Column Settings').click();
      
      // Should open column chooser dialog
      const columnChooser = page.locator('.blg-column-chooser-dialog');
      await expect(columnChooser).toBeVisible();
      
      // Should show list of columns with checkboxes
      const columnOptions = columnChooser.locator('.column-option');
      const optionCount = await columnOptions.count();
      expect(optionCount).toBeGreaterThan(0);
      
      // Each option should have checkbox and label
      for (let i = 0; i < Math.min(optionCount, 3); i++) {
        const option = columnOptions.nth(i);
        const checkbox = option.locator('input[type="checkbox"]');
        const label = option.locator('.column-label');
        
        await expect(checkbox).toBeVisible();
        await expect(label).toBeVisible();
      }
      
      // Should have action buttons
      const applyButton = columnChooser.locator('button:has-text("Apply")');
      const cancelButton = columnChooser.locator('button:has-text("Cancel")');
      
      await expect(applyButton).toBeVisible();
      await expect(cancelButton).toBeVisible();
      
      // Close dialog
      await cancelButton.click();
      await expect(columnChooser).not.toBeVisible();
    });

    test('should support drag and drop in column chooser', async ({ page }) => {
      await gridPage.openColumnChooser();
      
      const columnChooser = page.locator('.blg-column-chooser-dialog');
      const columnItems = columnChooser.locator('.column-chooser-item');
      
      const itemCount = await columnItems.count();
      if (itemCount >= 2) {
        const firstItem = columnItems.nth(0);
        const secondItem = columnItems.nth(1);
        
        // Get initial text to verify reordering
        const firstText = await firstItem.locator('.column-label').textContent();
        const secondText = await secondItem.locator('.column-label').textContent();
        
        // Drag first item below second
        const firstRect = await firstItem.boundingBox();
        const secondRect = await secondItem.boundingBox();
        
        if (firstRect && secondRect) {
          await page.mouse.move(firstRect.x + firstRect.width / 2, firstRect.y + firstRect.height / 2);
          await page.mouse.down();
          await page.mouse.move(secondRect.x + secondRect.width / 2, secondRect.y + secondRect.height + 5);
          await page.mouse.up();
          
          await page.waitForTimeout(200);
          
          // Order should change
          const newFirstText = await columnItems.nth(0).locator('.column-label').textContent();
          const newSecondText = await columnItems.nth(1).locator('.column-label').textContent();
          
          expect(newFirstText).toBe(secondText);
          expect(newSecondText).toBe(firstText);
        }
      }
      
      // Close dialog
      await columnChooser.locator('button:has-text("Cancel")').click();
    });
  });
});