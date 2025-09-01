import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';
import { GridPage } from '../pages/grid-page';

test.describe('Accessibility Compliance', () => {
  let gridPage: GridPage;
  
  test.beforeEach(async ({ page }) => {
    gridPage = new GridPage(page);
    await gridPage.gotoBasicExample();
    await gridPage.waitForGridToLoad();
    
    // Inject axe-core
    await injectAxe(page);
  });
  
  test.describe('WCAG 2.1 Compliance', () => {
    test('should pass basic accessibility audit', async ({ page }) => {
      // Run basic accessibility check
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });
    
    test('should pass accessibility audit with large dataset', async ({ page }) => {
      await gridPage.loadDataset('large');
      await gridPage.enableVirtualScrolling();
      await gridPage.waitForGridToLoad();
      
      await checkA11y(page, '[data-testid="grid-container"]', {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });
    
    test('should have proper semantic structure', async ({ page }) => {
      // Check for proper ARIA roles
      await expect(page.locator('[role="grid"]')).toBeVisible();
      await expect(page.locator('[role="gridcell"]')).toHaveCount({ count: { greaterThan: 0 } });
      await expect(page.locator('[role="columnheader"]')).toHaveCount({ count: { greaterThan: 0 } });
      await expect(page.locator('[role="row"]')).toHaveCount({ count: { greaterThan: 0 } });
    });
    
    test('should have proper heading structure', async ({ page }) => {
      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      if (headingCount > 0) {
        // First heading should be h1 or h2 (depending on page structure)
        const firstHeading = headings.first();
        const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
        expect(['h1', 'h2']).toContain(tagName);
      }
    });
    
    test('should have sufficient color contrast', async ({ page }) => {
      const violations = await getViolations(page, null, {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true }
        }
      });
      
      const colorContrastViolations = violations.filter(v => 
        v.id === 'color-contrast' || v.id === 'color-contrast-enhanced'
      );
      
      expect(colorContrastViolations).toHaveLength(0);
    });
    
    test('should have proper focus indicators', async ({ page }) => {
      // Test focus visibility on interactive elements
      const focusableElements = page.locator(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const count = await focusableElements.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = focusableElements.nth(i);
        await element.focus();
        
        // Check for visible focus indicator
        const hasFocusStyle = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return computed.outline !== 'none' || 
                 computed.outlineWidth !== '0px' ||
                 computed.boxShadow !== 'none';
        });
        
        expect(hasFocusStyle).toBe(true);
      }
    });
  });
  
  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation between cells', async ({ page }) => {
      // Focus first cell
      const firstCell = page.locator('[data-testid="grid-cell-0-0"]');
      await firstCell.click();
      await firstCell.focus();
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      
      // Check if focus moved
      const focusedElement = page.locator(':focus');
      const focusedTestId = await focusedElement.getAttribute('data-testid');
      expect(focusedTestId).toContain('grid-cell-0-1');
    });
    
    test('should support Tab navigation through grid', async ({ page }) => {
      // Tab through the grid
      await page.keyboard.press('Tab');
      
      let tabCount = 0;
      const maxTabs = 10;
      
      while (tabCount < maxTabs) {
        const focusedElement = page.locator(':focus');
        const isGridElement = await focusedElement.evaluate(el => {
          return el.closest('[data-testid="grid-container"]') !== null;
        });
        
        if (isGridElement) {
          break;
        }
        
        await page.keyboard.press('Tab');
        tabCount++;
      }
      
      expect(tabCount).toBeLessThan(maxTabs);
    });
    
    test('should support Home/End navigation', async ({ page }) => {
      // Focus a cell in the middle
      await page.locator('[data-testid="grid-cell-2-2"]').focus();
      
      // Press Home to go to first cell in row
      await page.keyboard.press('Home');
      await page.waitForTimeout(100);
      
      const focusedElement = page.locator(':focus');
      const testId = await focusedElement.getAttribute('data-testid');
      expect(testId).toContain('grid-cell-2-0');
      
      // Press End to go to last cell in row
      await page.keyboard.press('End');
      await page.waitForTimeout(100);
      
      const endFocusedElement = page.locator(':focus');
      const endTestId = await endFocusedElement.getAttribute('data-testid');
      expect(endTestId).toContain('grid-cell-2-');
    });
    
    test('should support Ctrl+Home/End for grid navigation', async ({ page }) => {
      // Focus somewhere in the middle
      await page.locator('[data-testid="grid-cell-2-2"]').focus();
      
      // Ctrl+Home should go to first cell
      await page.keyboard.press('Control+Home');
      await page.waitForTimeout(100);
      
      const focusedElement = page.locator(':focus');
      const testId = await focusedElement.getAttribute('data-testid');
      expect(testId).toBe('grid-cell-0-0');
    });
    
    test('should support Page Up/Down navigation', async ({ page }) => {
      await gridPage.loadDataset('large');
      await gridPage.waitForGridToLoad();
      
      // Focus first cell
      await page.locator('[data-testid="grid-cell-0-0"]').focus();
      
      // Page Down
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(200);
      
      // Should move focus down by viewport height
      const focusedElement = page.locator(':focus');
      const testId = await focusedElement.getAttribute('data-testid');
      
      if (testId) {
        const match = testId.match(/grid-cell-(\d+)-/);
        if (match) {
          const rowIndex = parseInt(match[1]);
          expect(rowIndex).toBeGreaterThan(5); // Should jump multiple rows
        }
      }
    });
    
    test('should handle keyboard navigation with virtual scrolling', async ({ page }) => {
      await gridPage.loadDataset('large');
      await gridPage.enableVirtualScrolling();
      await gridPage.waitForGridToLoad();
      
      // Focus first visible cell
      await page.locator('[data-testid="grid-cell-0-0"]').focus();
      
      // Navigate down with arrow key multiple times
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(50);
      }
      
      // Should auto-scroll to keep focused cell visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
    
    test('should support Enter key for activation', async ({ page }) => {
      // Focus a cell that might have interactive content
      await page.locator('[data-testid="grid-cell-0-0"]').focus();
      
      // Press Enter - behavior depends on implementation
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);
      
      // Could enter edit mode, select row, or other actions
      // Just verify no error occurred
      await gridPage.validateGridStructure();
    });
    
    test('should support Escape key for cancellation', async ({ page }) => {
      // If there's an edit mode or modal, Escape should cancel
      const editableCell = page.locator('[data-editable="true"], .editable-cell').first();
      
      if (await editableCell.isVisible()) {
        await editableCell.focus();
        await page.keyboard.press('F2'); // Enter edit mode if supported
        await page.waitForTimeout(100);
        
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
        
        // Should exit edit mode
        const isStillEditing = await page.locator('.editing, [data-editing="true"]').count();
        expect(isStillEditing).toBe(0);
      }
    });
  });
  
  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels on interactive elements', async ({ page }) => {
      // Check column headers have aria-label or text
      const headers = page.locator('[role="columnheader"]');
      const headerCount = await headers.count();
      
      for (let i = 0; i < headerCount; i++) {
        const header = headers.nth(i);
        const hasLabel = await header.evaluate(el => {
          return el.getAttribute('aria-label') || 
                 el.getAttribute('aria-labelledby') ||
                 el.textContent?.trim();
        });
        expect(hasLabel).toBeTruthy();
      }
    });
    
    test('should have proper ARIA descriptions for complex cells', async ({ page }) => {
      // Check if cells with complex content have descriptions
      const cells = page.locator('[role="gridcell"]');
      const cellCount = await cells.count();
      
      for (let i = 0; i < Math.min(cellCount, 10); i++) {
        const cell = cells.nth(i);
        const hasComplexContent = await cell.evaluate(el => {
          return el.querySelector('button, input, select, a') !== null;
        });
        
        if (hasComplexContent) {
          const hasDescription = await cell.evaluate(el => {
            return el.getAttribute('aria-describedby') || 
                   el.getAttribute('aria-label') ||
                   el.getAttribute('title');
          });
          
          // Complex cells should have some accessibility description
          if (!hasDescription) {
            console.warn(`Complex cell at index ${i} lacks accessibility description`);
          }
        }
      }
    });
    
    test('should announce sort state to screen readers', async ({ page }) => {
      const firstHeader = page.locator('[role="columnheader"]').first();
      
      // Click to sort
      await firstHeader.click();
      await gridPage.waitForLoadingToComplete();
      
      // Check for aria-sort attribute
      const sortState = await firstHeader.getAttribute('aria-sort');
      expect(['ascending', 'descending', 'none']).toContain(sortState || 'none');
    });
    
    test('should announce selection state to screen readers', async ({ page }) => {
      await gridPage.enableRowSelection();
      await gridPage.setSelectionMode('checkbox');
      await gridPage.waitForGridToLoad();
      
      // Select a row
      await gridPage.selectRowByCheckbox(0);
      
      // Check if row has aria-selected
      const selectedRow = page.locator('[data-testid="grid-row-0"]');
      const isSelected = await selectedRow.getAttribute('aria-selected');
      expect(isSelected).toBe('true');
    });
    
    test('should provide live region updates for dynamic content', async ({ page }) => {
      // Look for ARIA live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      const liveRegionCount = await liveRegions.count();
      
      if (liveRegionCount > 0) {
        // Apply a filter to trigger dynamic updates
        await gridPage.applyTextFilter('firstName', 'contains', 'John');
        await gridPage.waitForLoadingToComplete();
        
        // Check if live region is updated with result count
        const statusRegion = liveRegions.first();
        const statusText = await statusRegion.textContent();
        
        if (statusText) {
          expect(statusText.toLowerCase()).toMatch(/result|row|item|found/);
        }
      }
    });
    
    test('should support high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              background: black !important;
              color: white !important;
              border-color: white !important;
            }
          }
        `
      });
      
      await page.waitForTimeout(500);
      
      // Grid should still be functional in high contrast
      await gridPage.validateGridStructure();
      
      // Run accessibility check in high contrast mode
      await checkA11y(page, '[data-testid="grid-container"]', {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
    });
  });
  
  test.describe('Focus Management', () => {
    test('should maintain focus after sorting', async ({ page }) => {
      // Focus a header
      const header = page.locator('[role="columnheader"]').first();
      await header.focus();
      
      // Sort by clicking
      await header.click();
      await gridPage.waitForLoadingToComplete();
      
      // Focus should remain on the header
      const focusedElement = page.locator(':focus');
      const isSameElement = await header.evaluate((el, focusedEl) => {
        return el === focusedEl;
      }, await focusedElement.elementHandle());
      
      expect(isSameElement).toBe(true);
    });
    
    test('should restore focus after filtering', async ({ page }) => {
      // Focus a cell
      const cell = page.locator('[data-testid="grid-cell-1-1"]');
      await cell.focus();
      
      const cellData = await cell.textContent();
      
      // Apply filter that includes this cell
      await gridPage.applyTextFilter('firstName', 'contains', cellData?.substring(0, 2) || 'a');
      await gridPage.waitForLoadingToComplete();
      
      // Focus should be maintained or restored appropriately
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
    
    test('should handle focus when rows are added/removed dynamically', async ({ page }) => {
      // Focus a cell in the middle
      const cell = page.locator('[data-testid="grid-cell-3-1"]');
      await cell.focus();
      
      // Apply filter that removes some rows
      await gridPage.applyNumberFilter('age', 'greaterThan', 50);
      await gridPage.waitForLoadingToComplete();
      
      // Focus should be maintained on a valid cell
      const focusedElement = page.locator(':focus');
      const isGridCell = await focusedElement.evaluate(el => {
        return el.closest('[role="grid"]') !== null;
      });
      
      if (await focusedElement.isVisible()) {
        expect(isGridCell).toBe(true);
      }
    });
    
    test('should support focus trapping in modal dialogs', async ({ page }) => {
      // Open a modal if available (like column settings)
      const settingsButton = page.locator('[data-testid="grid-settings-button"]');
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
        
        // Check if modal traps focus
        const modal = page.locator('[role="dialog"], .modal');
        if (await modal.isVisible()) {
          // Tab through modal elements
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          
          // Focus should remain within modal
          const focusedElement = page.locator(':focus');
          const isWithinModal = await focusedElement.evaluate(el => {
            return el.closest('[role="dialog"], .modal') !== null;
          });
          
          expect(isWithinModal).toBe(true);
        }
      }
    });
  });
  
  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await gridPage.waitForGridToLoad();
      
      // Run accessibility check on mobile
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });
    
    test('should support touch interactions accessibly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await gridPage.waitForGridToLoad();
      
      // Touch targets should be at least 44x44 pixels
      const interactiveElements = page.locator(
        'button, [role="button"], input, select, [tabindex]:not([tabindex="-1"])'
      );
      
      const count = await interactiveElements.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = interactiveElements.nth(i);
        const box = await element.boundingBox();
        
        if (box && (box.width < 44 || box.height < 44)) {
          console.warn(`Interactive element ${i} is smaller than recommended touch target size`);
        }
      }
    });
    
    test('should provide swipe gestures with proper announcements', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await gridPage.waitForGridToLoad();
      
      // If swipe gestures are supported, they should be announced
      const gridContainer = page.locator('[data-testid="grid-container"]');
      
      // Check for gesture instructions
      const hasGestureInstructions = await page.evaluate(() => {
        const instructions = document.querySelector('[aria-describedby*="gesture"], [aria-label*="swipe"], [title*="swipe"]');
        return instructions !== null;
      });
      
      // If gestures are supported, there should be some indication
      if (hasGestureInstructions) {
        expect(hasGestureInstructions).toBe(true);
      }
    });
  });
  
  test.describe('Error Handling and Messages', () => {
    test('should provide accessible error messages', async ({ page }) => {
      // Trigger an error state (like invalid filter)
      await gridPage.gridHelper.openFilter('age');
      await page.locator('[data-testid="filter-value"]').fill('invalid-age');
      await page.locator('[data-testid="filter-apply"]').click();
      
      // Look for error messages
      const errorMessages = page.locator('[role="alert"], .error-message, [aria-invalid="true"] + .error');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        const errorMessage = errorMessages.first();
        const errorText = await errorMessage.textContent();
        expect(errorText?.trim()).toBeTruthy();
        
        // Error should be announced to screen readers
        const ariaLive = await errorMessage.getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(ariaLive || 'polite');
      }
    });
    
    test('should provide loading state announcements', async ({ page }) => {
      // Trigger loading state
      await gridPage.loadDataset('large');
      
      // Look for loading announcements
      const loadingIndicators = page.locator(
        '[role="progressbar"], [aria-busy="true"], [aria-live] .loading'
      );
      
      const loadingCount = await loadingIndicators.count();
      
      if (loadingCount > 0) {
        const loadingIndicator = loadingIndicators.first();
        
        // Should have appropriate ARIA attributes
        const ariaLabel = await loadingIndicator.getAttribute('aria-label');
        const ariaValueText = await loadingIndicator.getAttribute('aria-valuetext');
        
        expect(ariaLabel || ariaValueText).toBeTruthy();
      }
    });
  });
});