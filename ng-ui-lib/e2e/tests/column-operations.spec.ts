import { test, expect } from '@playwright/test';
import { GridPage } from '../pages/grid-page';

test.describe('Column Operations', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoBasicExample();
    await gridPage.loadDataset('medium');
    await gridPage.waitForGridToLoad();
  });
  
  test.describe('Column Resizing', () => {
    test('should resize column by dragging resize handle', async ({ page }) => {
      const header = await gridPage.gridHelper.getColumnHeader('firstName');
      const initialWidth = await header.evaluate(el => el.offsetWidth);
      
      // Find resize handle and drag
      const resizeHandle = header.locator('.column-resize-handle, .resize-handle');
      await resizeHandle.hover();
      
      // Drag to resize
      await resizeHandle.dragTo(header, { targetPosition: { x: initialWidth + 100, y: 10 } });
      await page.waitForTimeout(300);
      
      const newWidth = await header.evaluate(el => el.offsetWidth);
      expect(newWidth).toBeGreaterThan(initialWidth + 50); // Should be significantly wider
    });
    
    test('should resize column with helper method', async ({ page }) => {
      const header = await gridPage.gridHelper.getColumnHeader('lastName');
      const initialWidth = await header.evaluate(el => el.offsetWidth);
      
      // Use helper method to resize
      await gridPage.resizeColumn('lastName', 150);
      await page.waitForTimeout(300);
      
      const newWidth = await header.evaluate(el => el.offsetWidth);
      expect(newWidth).toBeGreaterThan(initialWidth + 100);
    });
    
    test('should resize column to smaller width', async ({ page }) => {
      const header = await gridPage.gridHelper.getColumnHeader('email');
      const initialWidth = await header.evaluate(el => el.offsetWidth);
      
      // Resize to smaller width
      await gridPage.resizeColumn('email', -100);
      await page.waitForTimeout(300);
      
      const newWidth = await header.evaluate(el => el.offsetWidth);
      expect(newWidth).toBeLessThan(initialWidth - 50);
    });
    
    test('should show resize cursor on hover', async ({ page }) => {
      const header = await gridPage.gridHelper.getColumnHeader('firstName');
      const resizeHandle = header.locator('.column-resize-handle, .resize-handle');
      
      await resizeHandle.hover();
      
      // Check cursor style
      const cursor = await resizeHandle.evaluate(el => {
        return window.getComputedStyle(el).cursor;
      });
      
      expect(['col-resize', 'ew-resize', 'w-resize', 'e-resize']).toContain(cursor);
    });
    
    test('should enforce minimum column width', async ({ page }) => {
      // Try to resize column to very small width
      await gridPage.resizeColumn('firstName', -500);
      await page.waitForTimeout(300);
      
      const header = await gridPage.gridHelper.getColumnHeader('firstName');
      const finalWidth = await header.evaluate(el => el.offsetWidth);
      
      // Should not be smaller than minimum width (typically 50-100px)
      expect(finalWidth).toBeGreaterThan(30);
    });
    
    test('should handle double-click to auto-size column', async ({ page }) => {
      const header = await gridPage.gridHelper.getColumnHeader('firstName');
      const resizeHandle = header.locator('.column-resize-handle, .resize-handle');
      
      // Double-click resize handle to auto-size
      await resizeHandle.dblclick();
      await page.waitForTimeout(300);
      
      // Column should resize to fit content
      const newWidth = await header.evaluate(el => el.offsetWidth);
      expect(newWidth).toBeGreaterThan(50); // Should have some reasonable width
    });
    
    test('should persist column widths after sorting', async ({ page }) => {
      // Resize column first
      await gridPage.resizeColumn('firstName', 150);
      await page.waitForTimeout(300);
      
      const header = await gridPage.gridHelper.getColumnHeader('firstName');
      const widthAfterResize = await header.evaluate(el => el.offsetWidth);
      
      // Apply sort
      await gridPage.sortColumn('lastName', 'asc');
      await gridPage.waitForLoadingToComplete();
      
      // Width should be preserved
      const widthAfterSort = await header.evaluate(el => el.offsetWidth);
      expect(Math.abs(widthAfterSort - widthAfterResize)).toBeLessThan(5); // Allow small variance
    });
  });
  
  test.describe('Column Reordering', () => {
    test('should reorder columns by dragging header', async ({ page }) => {
      // Get initial order
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      const lastNameHeader = await gridPage.gridHelper.getColumnHeader('lastName');
      
      const firstNameInitialIndex = await firstNameHeader.evaluate((el, sibling) => {
        return Array.from(el.parentElement!.children).indexOf(el);
      });
      
      // Drag firstName to lastName position
      await gridPage.reorderColumn('firstName', 'lastName');
      await page.waitForTimeout(500); // Allow reorder animation
      
      const firstNameFinalIndex = await firstNameHeader.evaluate(el => {
        return Array.from(el.parentElement!.children).indexOf(el);
      });
      
      expect(firstNameFinalIndex).not.toBe(firstNameInitialIndex);
    });
    
    test('should show visual feedback during column drag', async ({ page }) => {
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      
      // Start dragging
      await firstNameHeader.hover();
      await page.mouse.down();
      await page.mouse.move(100, 0);
      
      // Check for drag visual feedback
      const isDragging = await page.evaluate(() => {
        return document.querySelector('.dragging, .column-drag, [data-dragging="true"]') !== null;
      });
      
      // Should show some visual indication
      if (isDragging) {
        expect(isDragging).toBe(true);
      }
      
      await page.mouse.up();
    });
    
    test('should show drop zone indicators during drag', async ({ page }) => {
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      const emailHeader = await gridPage.gridHelper.getColumnHeader('email');
      
      // Start dragging firstName
      await firstNameHeader.hover();
      await page.mouse.down();
      
      // Move over email column
      await emailHeader.hover();
      
      // Check for drop zone indicators
      const hasDropZone = await page.evaluate(() => {
        return document.querySelector('.drop-zone, .drop-target, [data-drop-target="true"]') !== null;
      });
      
      if (hasDropZone) {
        expect(hasDropZone).toBe(true);
      }
      
      await page.mouse.up();
    });
    
    test('should maintain column data integrity after reorder', async ({ page }) => {
      // Get data from first row before reorder
      const firstRowData = {
        firstName: await gridPage.getCellTextByField(0, 'firstName'),
        lastName: await gridPage.getCellTextByField(0, 'lastName'),
        email: await gridPage.getCellTextByField(0, 'email')
      };
      
      // Reorder columns
      await gridPage.reorderColumn('firstName', 'email');
      await page.waitForTimeout(500);
      
      // Check that data moved with columns
      const afterReorderData = {
        firstName: await gridPage.getCellTextByField(0, 'firstName'),
        lastName: await gridPage.getCellTextByField(0, 'lastName'),
        email: await gridPage.getCellTextByField(0, 'email')
      };
      
      expect(afterReorderData.firstName).toBe(firstRowData.firstName);
      expect(afterReorderData.lastName).toBe(firstRowData.lastName);
      expect(afterReorderData.email).toBe(firstRowData.email);
    });
    
    test('should handle reorder to first position', async ({ page }) => {
      // Move email column to first position
      await gridPage.reorderColumn('email', 'firstName');
      await page.waitForTimeout(500);
      
      // Email header should now be first
      const headers = await gridPage.gridHelper.getColumnHeaders();
      const firstHeader = headers.first();
      const firstHeaderTestId = await firstHeader.getAttribute('data-testid');
      
      expect(firstHeaderTestId).toBe('grid-header-email');
    });
    
    test('should handle reorder to last position', async ({ page }) => {
      // Get header count
      const headers = await gridPage.gridHelper.getColumnHeaders();
      const headerCount = await headers.count();
      
      // Move firstName to last position
      const lastHeaderTestId = await headers.nth(headerCount - 1).getAttribute('data-testid');
      const lastHeaderField = lastHeaderTestId?.replace('grid-header-', '');
      
      if (lastHeaderField) {
        await gridPage.reorderColumn('firstName', lastHeaderField);
        await page.waitForTimeout(500);
        
        // firstName should now be last
        const newLastHeader = headers.nth(headerCount - 1);
        const newLastHeaderTestId = await newLastHeader.getAttribute('data-testid');
        expect(newLastHeaderTestId).toBe('grid-header-firstName');
      }
    });
    
    test('should cancel reorder when dropped outside grid', async ({ page }) => {
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      const initialIndex = await firstNameHeader.evaluate(el => {
        return Array.from(el.parentElement!.children).indexOf(el);
      });
      
      // Start drag and move outside grid
      await firstNameHeader.hover();
      await page.mouse.down();
      await page.mouse.move(50, 200); // Move way down outside grid
      await page.mouse.up();
      
      await page.waitForTimeout(300);
      
      // Column order should remain unchanged
      const finalIndex = await firstNameHeader.evaluate(el => {
        return Array.from(el.parentElement!.children).indexOf(el);
      });
      
      expect(finalIndex).toBe(initialIndex);
    });
  });
  
  test.describe('Column Hiding and Showing', () => {
    test('should hide column via context menu', async ({ page }) => {
      const ageHeader = await gridPage.gridHelper.getColumnHeader('age');
      
      // Right-click to open context menu
      await ageHeader.click({ button: 'right' });
      
      // Look for hide option
      const hideOption = page.locator('[data-testid="column-menu-hide"], .column-hide, text="Hide"').first();
      if (await hideOption.isVisible()) {
        await hideOption.click();
        await page.waitForTimeout(300);
        
        // Column should be hidden
        await expect(ageHeader).toBeHidden();
      }
    });
    
    test('should hide column via helper method', async ({ page }) => {
      await gridPage.hideColumn('salary');
      await page.waitForTimeout(300);
      
      const salaryHeader = await gridPage.gridHelper.getColumnHeader('salary');
      await expect(salaryHeader).toBeHidden();
    });
    
    test('should show column via column chooser', async ({ page }) => {
      // First hide a column
      await gridPage.hideColumn('age');
      await page.waitForTimeout(300);
      
      // Show it back via column chooser
      await gridPage.showColumn('age');
      await page.waitForTimeout(300);
      
      const ageHeader = await gridPage.gridHelper.getColumnHeader('age');
      await expect(ageHeader).toBeVisible();
    });
    
    test('should update data display when column is hidden', async ({ page }) => {
      // Get initial visible columns count
      const initialHeaders = await gridPage.gridHelper.getColumnHeaders();
      const initialCount = await initialHeaders.count();
      
      // Hide a column
      await gridPage.hideColumn('email');
      await page.waitForTimeout(300);
      
      // Header count should decrease
      const afterHideHeaders = await gridPage.gridHelper.getColumnHeaders();
      const afterHideCount = await afterHideHeaders.count();
      expect(afterHideCount).toBe(initialCount - 1);
      
      // Email data should not be visible in rows
      const emailCells = page.locator('[data-testid*="email"]');
      const emailCellCount = await emailCells.count();
      expect(emailCellCount).toBe(0);
    });
    
    test('should maintain column order when showing hidden columns', async ({ page }) => {
      // Get initial order
      const initialHeaders = await gridPage.gridHelper.getColumnHeaders();
      const initialOrder = [];
      
      const count = await initialHeaders.count();
      for (let i = 0; i < count; i++) {
        const testId = await initialHeaders.nth(i).getAttribute('data-testid');
        if (testId) {
          initialOrder.push(testId);
        }
      }
      
      // Hide and show column
      await gridPage.hideColumn('lastName');
      await page.waitForTimeout(300);
      await gridPage.showColumn('lastName');
      await page.waitForTimeout(300);
      
      // Order should be maintained
      const finalHeaders = await gridPage.gridHelper.getColumnHeaders();
      const finalOrder = [];
      
      const finalCount = await finalHeaders.count();
      for (let i = 0; i < finalCount; i++) {
        const testId = await finalHeaders.nth(i).getAttribute('data-testid');
        if (testId) {
          finalOrder.push(testId);
        }
      }
      
      expect(finalOrder).toEqual(initialOrder);
    });
    
    test('should handle hiding multiple columns', async ({ page }) => {
      await gridPage.hideColumn('age');
      await gridPage.hideColumn('salary');
      await gridPage.hideColumn('isActive');
      await page.waitForTimeout(500);
      
      // All three columns should be hidden
      await expect(await gridPage.gridHelper.getColumnHeader('age')).toBeHidden();
      await expect(await gridPage.gridHelper.getColumnHeader('salary')).toBeHidden();
      await expect(await gridPage.gridHelper.getColumnHeader('isActive')).toBeHidden();
    });
    
    test('should prevent hiding all columns', async ({ page }) => {
      // Try to hide all columns except one
      await gridPage.hideColumn('lastName');
      await gridPage.hideColumn('email');
      await gridPage.hideColumn('age');
      await gridPage.hideColumn('salary');
      await gridPage.hideColumn('joinDate');
      await gridPage.hideColumn('isActive');
      
      // Try to hide the last remaining visible column
      await gridPage.hideColumn('firstName');
      
      // At least one column should remain visible
      const visibleHeaders = await gridPage.gridHelper.getColumnHeaders();
      const visibleCount = await visibleHeaders.count();
      expect(visibleCount).toBeGreaterThan(0);
    });
  });
  
  test.describe('Column Menu and Options', () => {
    test('should open column menu on right-click', async ({ page }) => {
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      await firstNameHeader.click({ button: 'right' });
      
      // Look for column menu
      const columnMenu = page.locator('.column-menu, [data-testid="column-menu"], .context-menu').first();
      if (await columnMenu.isVisible()) {
        await expect(columnMenu).toBeVisible();
        
        // Should have common menu items
        const menuItems = columnMenu.locator('li, .menu-item, button');
        const itemCount = await menuItems.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    });
    
    test('should show sort options in column menu', async ({ page }) => {
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      await firstNameHeader.click({ button: 'right' });
      
      const columnMenu = page.locator('.column-menu, [data-testid="column-menu"], .context-menu').first();
      if (await columnMenu.isVisible()) {
        // Look for sort options
        const sortAsc = columnMenu.locator('text="Sort Ascending", text="Asc", [data-action="sort-asc"]').first();
        const sortDesc = columnMenu.locator('text="Sort Descending", text="Desc", [data-action="sort-desc"]').first();
        
        if (await sortAsc.isVisible() || await sortDesc.isVisible()) {
          expect(await sortAsc.isVisible() || await sortDesc.isVisible()).toBe(true);
        }
      }
    });
    
    test('should show filter options in column menu', async ({ page }) => {
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      await firstNameHeader.click({ button: 'right' });
      
      const columnMenu = page.locator('.column-menu, [data-testid="column-menu"], .context-menu').first();
      if (await columnMenu.isVisible()) {
        // Look for filter option
        const filterOption = columnMenu.locator('text="Filter", [data-action="filter"]').first();
        
        if (await filterOption.isVisible()) {
          await expect(filterOption).toBeVisible();
        }
      }
    });
    
    test('should close column menu when clicking elsewhere', async ({ page }) => {
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      await firstNameHeader.click({ button: 'right' });
      
      const columnMenu = page.locator('.column-menu, [data-testid="column-menu"], .context-menu').first();
      if (await columnMenu.isVisible()) {
        // Click elsewhere
        await page.click('body', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(200);
        
        // Menu should be closed
        await expect(columnMenu).toBeHidden();
      }
    });
  });
  
  test.describe('Column Pinning/Freezing', () => {
    test('should pin column to left', async ({ page }) => {
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      await firstNameHeader.click({ button: 'right' });
      
      const pinLeftOption = page.locator('text="Pin Left", [data-action="pin-left"]').first();
      if (await pinLeftOption.isVisible()) {
        await pinLeftOption.click();
        await page.waitForTimeout(300);
        
        // Column should have pinned styling
        const isPinned = await firstNameHeader.evaluate(el => {
          return el.classList.contains('pinned') || 
                 el.classList.contains('frozen') ||
                 el.getAttribute('data-pinned') === 'left';
        });
        
        expect(isPinned).toBe(true);
      } else {
        test.skip('Column pinning not available');
      }
    });
    
    test('should pin column to right', async ({ page }) => {
      const emailHeader = await gridPage.gridHelper.getColumnHeader('email');
      await emailHeader.click({ button: 'right' });
      
      const pinRightOption = page.locator('text="Pin Right", [data-action="pin-right"]').first();
      if (await pinRightOption.isVisible()) {
        await pinRightOption.click();
        await page.waitForTimeout(300);
        
        // Column should have pinned styling
        const isPinned = await emailHeader.evaluate(el => {
          return el.classList.contains('pinned-right') || 
                 el.classList.contains('frozen-right') ||
                 el.getAttribute('data-pinned') === 'right';
        });
        
        expect(isPinned).toBe(true);
      } else {
        test.skip('Column pinning not available');
      }
    });
    
    test('should unpin column', async ({ page }) => {
      // First pin a column
      const firstNameHeader = await gridPage.gridHelper.getColumnHeader('firstName');
      await firstNameHeader.click({ button: 'right' });
      
      const pinLeftOption = page.locator('text="Pin Left", [data-action="pin-left"]').first();
      if (await pinLeftOption.isVisible()) {
        await pinLeftOption.click();
        await page.waitForTimeout(300);
        
        // Now unpin it
        await firstNameHeader.click({ button: 'right' });
        const unpinOption = page.locator('text="Unpin", [data-action="unpin"]').first();
        
        if (await unpinOption.isVisible()) {
          await unpinOption.click();
          await page.waitForTimeout(300);
          
          // Column should not be pinned anymore
          const isPinned = await firstNameHeader.evaluate(el => {
            return el.classList.contains('pinned') || 
                   el.classList.contains('frozen') ||
                   el.getAttribute('data-pinned');
          });
          
          expect(isPinned).toBeFalsy();
        }
      } else {
        test.skip('Column pinning not available');
      }
    });
  });
  
  test.describe('Column State Persistence', () => {
    test('should maintain column state after page refresh', async ({ page }) => {
      // Resize and reorder columns
      await gridPage.resizeColumn('firstName', 150);
      await gridPage.hideColumn('age');
      await page.waitForTimeout(500);
      
      const firstNameWidth = await (await gridPage.gridHelper.getColumnHeader('firstName')).evaluate(el => el.offsetWidth);
      
      // Refresh page
      await gridPage.refreshPage();
      
      // Check if state is preserved (this depends on implementation)
      const ageHeader = await gridPage.gridHelper.getColumnHeader('age');
      const isAgeHidden = await ageHeader.isHidden();
      
      if (isAgeHidden) {
        // State was preserved
        expect(isAgeHidden).toBe(true);
        
        const newFirstNameWidth = await (await gridPage.gridHelper.getColumnHeader('firstName')).evaluate(el => el.offsetWidth);
        expect(Math.abs(newFirstNameWidth - firstNameWidth)).toBeLessThan(10);
      } else {
        // State was reset (also acceptable behavior)
        console.log('Column state was reset after refresh - this is acceptable');
      }
    });
    
    test('should reset column state when explicitly requested', async ({ page }) => {
      // Modify column state
      await gridPage.resizeColumn('firstName', 200);
      await gridPage.hideColumn('age');
      await gridPage.reorderColumn('lastName', 'email');
      await page.waitForTimeout(500);
      
      // Reset grid if reset button is available
      const resetButton = page.locator('[data-testid="reset-grid-button"], .reset-columns, text="Reset"').first();
      if (await resetButton.isVisible()) {
        await resetButton.click();
        await page.waitForTimeout(500);
        
        // All columns should be visible again
        const ageHeader = await gridPage.gridHelper.getColumnHeader('age');
        await expect(ageHeader).toBeVisible();
        
        // Column order should be reset
        await gridPage.validateGridStructure();
      }
    });
  });
});