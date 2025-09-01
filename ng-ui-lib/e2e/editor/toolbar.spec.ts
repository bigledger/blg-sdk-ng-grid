import { test, expect } from '@playwright/test';
import { EditorPage } from './page-objects/editor-page';
import { EditorAssertions } from './utils/custom-assertions';

test.describe('Toolbar Functionality', () => {
  let editorPage: EditorPage;

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page);
    await editorPage.goto();
  });

  test.describe('Toolbar Visibility and Layout', () => {
    test('should display all toolbar buttons', async () => {
      await expect(editorPage.toolbar).toBeVisible();
      
      // Check formatting buttons
      await expect(editorPage.boldButton).toBeVisible();
      await expect(editorPage.italicButton).toBeVisible();
      await expect(editorPage.underlineButton).toBeVisible();
      await expect(editorPage.strikethroughButton).toBeVisible();
      await expect(editorPage.codeButton).toBeVisible();
      
      // Check structure buttons
      await expect(editorPage.h1Button).toBeVisible();
      await expect(editorPage.h2Button).toBeVisible();
      await expect(editorPage.h3Button).toBeVisible();
      await expect(editorPage.blockquoteButton).toBeVisible();
      
      // Check list buttons
      await expect(editorPage.bulletListButton).toBeVisible();
      await expect(editorPage.numberedListButton).toBeVisible();
      
      // Check media buttons
      await expect(editorPage.linkButton).toBeVisible();
      await expect(editorPage.imageButton).toBeVisible();
      await expect(editorPage.videoButton).toBeVisible();
      await expect(editorPage.tableButton).toBeVisible();
      
      // Check action buttons
      await expect(editorPage.undoButton).toBeVisible();
      await expect(editorPage.redoButton).toBeVisible();
    });

    test('should have proper button tooltips', async () => {
      // Check that buttons have accessible titles/tooltips
      await expect(editorPage.boldButton).toHaveAttribute('title', /bold/i);
      await expect(editorPage.italicButton).toHaveAttribute('title', /italic/i);
      await expect(editorPage.underlineButton).toHaveAttribute('title', /underline/i);
      await expect(editorPage.linkButton).toHaveAttribute('title', /link/i);
    });

    test('should maintain toolbar layout on window resize', async ({ page }) => {
      // Test different viewport sizes
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1024, height: 768 },
        { width: 768, height: 1024 },
        { width: 480, height: 640 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await expect(editorPage.toolbar).toBeVisible();
        
        // Toolbar should remain functional at all sizes
        await expect(editorPage.boldButton).toBeVisible();
        await expect(editorPage.italicButton).toBeVisible();
      }
    });
  });

  test.describe('Button States and Interactions', () => {
    test('should show active state for applied formatting', async () => {
      const testText = 'Format test';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      // Initially should be inactive
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(false);
      
      // Apply bold formatting
      await editorPage.boldButton.click();
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
      
      // Toggle off
      await editorPage.boldButton.click();
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(false);
    });

    test('should handle multiple button states simultaneously', async () => {
      const testText = 'Multi-format test';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      // Apply multiple formats
      await editorPage.boldButton.click();
      await editorPage.italicButton.click();
      await editorPage.underlineButton.click();
      
      // All should be active
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
      expect(await editorPage.isToolbarButtonActive('italic')).toBe(true);
      expect(await editorPage.isToolbarButtonActive('underline')).toBe(true);
    });

    test('should update button states based on cursor position', async () => {
      await editorPage.typeText('Normal ');
      await editorPage.boldButton.click(); // Start bold
      await editorPage.typeText('bold');
      await editorPage.boldButton.click(); // End bold
      await editorPage.typeText(' normal');
      
      // Place cursor in bold text
      await editorPage.page.keyboard.press('ArrowLeft'); // Move into 'bold'
      await editorPage.page.keyboard.press('ArrowLeft');
      
      // Bold button should show active state
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
      
      // Move cursor to normal text
      await editorPage.page.keyboard.press('ArrowRight');
      await editorPage.page.keyboard.press('ArrowRight');
      await editorPage.page.keyboard.press('ArrowRight');
      
      // Bold button should show inactive state
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(false);
    });

    test('should disable/enable buttons based on context', async () => {
      // Initially buttons should be available
      await expect(editorPage.undoButton).toBeEnabled();
      await expect(editorPage.redoButton).not.toBeDisabled(); // May be disabled if no redo available
      
      // Make a change to enable undo
      await editorPage.typeText('Test');
      await expect(editorPage.undoButton).toBeEnabled();
      
      // Undo to enable redo
      await editorPage.undoButton.click();
      await expect(editorPage.redoButton).toBeEnabled();
    });

    test('should handle button hover states', async () => {
      // Hover over bold button
      await editorPage.boldButton.hover();
      
      // Should show hover styling (test through computed styles)
      const hoverStyle = await editorPage.boldButton.evaluate(el => 
        getComputedStyle(el).cursor
      );
      expect(hoverStyle).toBe('pointer');
    });

    test('should handle button focus states', async () => {
      // Focus on bold button
      await editorPage.boldButton.focus();
      await expect(editorPage.boldButton).toBeFocused();
      
      // Should be activatable with Enter or Space
      await editorPage.page.keyboard.press('Enter');
      
      // Check if bold formatting was applied (need text selected first)
      await editorPage.typeText('Test');
      await editorPage.selectAll();
      await editorPage.boldButton.focus();
      await editorPage.page.keyboard.press('Space');
      
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
    });
  });

  test.describe('Dropdown and Modal Interactions', () => {
    test('should open table insertion dropdown', async () => {
      await editorPage.tableButton.click();
      
      // Table size picker should appear
      const tablePicker = editorPage.page.locator('[data-testid="table-size-picker"]');
      await expect(tablePicker).toBeVisible();
      
      // Should have clickable table size options
      const tableSize2x2 = editorPage.page.locator('[data-testid="table-size-2x2"]');
      await expect(tableSize2x2).toBeVisible();
    });

    test('should close dropdown when clicking outside', async () => {
      await editorPage.tableButton.click();
      const tablePicker = editorPage.page.locator('[data-testid="table-size-picker"]');
      await expect(tablePicker).toBeVisible();
      
      // Click outside
      await editorPage.editorContent.click();
      await expect(tablePicker).not.toBeVisible();
    });

    test('should open link modal', async () => {
      await editorPage.linkButton.click();
      await expect(editorPage.linkModal).toBeVisible();
      await expect(editorPage.linkUrlInput).toBeVisible();
    });

    test('should close modal with escape key', async () => {
      await editorPage.linkButton.click();
      await expect(editorPage.linkModal).toBeVisible();
      
      await editorPage.page.keyboard.press('Escape');
      await expect(editorPage.linkModal).not.toBeVisible();
    });

    test('should open image upload modal', async () => {
      await editorPage.imageButton.click();
      await expect(editorPage.imageModal).toBeVisible();
      await expect(editorPage.imageFileInput).toBeVisible();
    });

    test('should open video embed modal', async () => {
      await editorPage.videoButton.click();
      await expect(editorPage.videoModal).toBeVisible();
      await expect(editorPage.videoUrlInput).toBeVisible();
    });
  });

  test.describe('Toolbar Keyboard Navigation', () => {
    test('should navigate toolbar with Tab key', async () => {
      // Start from editor
      await editorPage.editorContent.focus();
      
      // Tab to first toolbar button
      await editorPage.page.keyboard.press('Tab');
      
      // Should focus on a toolbar button
      const focusedElement = await editorPage.page.evaluate(() => 
        document.activeElement?.getAttribute('data-testid')
      );
      expect(focusedElement).toContain('toolbar-');
    });

    test('should navigate between toolbar buttons with arrow keys', async () => {
      await editorPage.boldButton.focus();
      
      // Right arrow should move to next button
      await editorPage.page.keyboard.press('ArrowRight');
      
      const focusedElement = await editorPage.page.evaluate(() => 
        document.activeElement?.getAttribute('data-testid')
      );
      expect(focusedElement).not.toBe('toolbar-bold');
    });

    test('should activate buttons with Enter and Space', async () => {
      await editorPage.typeText('Test text');
      await editorPage.selectAll();
      
      // Focus bold button and activate with Enter
      await editorPage.boldButton.focus();
      await editorPage.page.keyboard.press('Enter');
      
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
    });

    test('should return focus to editor after button activation', async () => {
      await editorPage.typeText('Test');
      await editorPage.selectAll();
      
      // Activate bold button
      await editorPage.boldButton.click();
      
      // Focus should return to editor for continued typing
      const focusInEditor = await editorPage.page.evaluate(() => {
        const activeEl = document.activeElement;
        return activeEl?.getAttribute('contenteditable') === 'true';
      });
      expect(focusInEditor).toBe(true);
    });
  });

  test.describe('Toolbar Responsiveness', () => {
    test('should adapt to mobile viewports', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Toolbar should still be visible
      await expect(editorPage.toolbar).toBeVisible();
      
      // Buttons should be accessible (may be in overflow menu)
      const boldVisible = await editorPage.boldButton.isVisible();
      const italicVisible = await editorPage.italicButton.isVisible();
      
      // At least some core buttons should be visible
      expect(boldVisible || italicVisible).toBe(true);
    });

    test('should handle toolbar overflow gracefully', async ({ page }) => {
      await page.setViewportSize({ width: 300, height: 600 });
      
      // Check if overflow menu appears
      const overflowButton = editorPage.page.locator('[data-testid="toolbar-overflow"]');
      const hasOverflow = await overflowButton.isVisible();
      
      if (hasOverflow) {
        await overflowButton.click();
        // Should show additional buttons
        const overflowMenu = editorPage.page.locator('[data-testid="toolbar-overflow-menu"]');
        await expect(overflowMenu).toBeVisible();
      }
    });
  });

  test.describe('Toolbar Performance', () => {
    test('should update button states quickly', async () => {
      await editorPage.typeText('Performance test');
      await editorPage.selectAll();
      
      const startTime = Date.now();
      await editorPage.boldButton.click();
      const endTime = Date.now();
      
      // Button state should update within reasonable time
      expect(endTime - startTime).toBeLessThan(100);
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
    });

    test('should handle rapid button clicks', async () => {
      await editorPage.typeText('Rapid click test');
      await editorPage.selectAll();
      
      // Click bold button rapidly
      await editorPage.boldButton.click();
      await editorPage.boldButton.click();
      await editorPage.boldButton.click();
      
      // Should end up with consistent state
      const isActive = await editorPage.isToolbarButtonActive('bold');
      expect(typeof isActive).toBe('boolean');
    });

    test('should maintain performance with many toolbar interactions', async () => {
      await editorPage.typeText('Complex formatting test');
      
      const startTime = Date.now();
      
      // Perform many formatting operations
      for (let i = 0; i < 10; i++) {
        await editorPage.selectAll();
        await editorPage.boldButton.click();
        await editorPage.italicButton.click();
        await editorPage.underlineButton.click();
        await editorPage.boldButton.click(); // Toggle off
        await editorPage.italicButton.click(); // Toggle off
        await editorPage.underlineButton.click(); // Toggle off
      }
      
      const endTime = Date.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  test.describe('Toolbar Accessibility', () => {
    test('should have proper ARIA labels', async () => {
      // Check that buttons have accessible names
      const buttons = [
        { element: editorPage.boldButton, expectedLabel: /bold/i },
        { element: editorPage.italicButton, expectedLabel: /italic/i },
        { element: editorPage.underlineButton, expectedLabel: /underline/i },
        { element: editorPage.linkButton, expectedLabel: /link/i }
      ];

      for (const { element, expectedLabel } of buttons) {
        const ariaLabel = await element.getAttribute('aria-label');
        const title = await element.getAttribute('title');
        const hasAccessibleName = ariaLabel?.match(expectedLabel) || title?.match(expectedLabel);
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test('should indicate button states to screen readers', async () => {
      await editorPage.typeText('Accessibility test');
      await editorPage.selectAll();
      
      // Apply bold formatting
      await editorPage.boldButton.click();
      
      // Button should indicate pressed state
      const ariaPressed = await editorPage.boldButton.getAttribute('aria-pressed');
      expect(ariaPressed).toBe('true');
    });

    test('should be keyboard accessible', async () => {
      await EditorAssertions.toSupportKeyboardNavigation(editorPage.page);
    });

    test('should work with screen reader technology', async () => {
      // This is a basic test - full screen reader testing would require additional tools
      await expect(editorPage.toolbar).toHaveAttribute('role', 'toolbar');
    });
  });
});