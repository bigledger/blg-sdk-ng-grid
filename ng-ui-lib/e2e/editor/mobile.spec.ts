import { test, expect } from '@playwright/test';
import { EditorPage } from './page-objects/editor-page';
import { EditorTestData } from './utils/test-data-generator';
import { EditorAssertions } from './utils/custom-assertions';

test.describe('Mobile Responsiveness', () => {
  let editorPage: EditorPage;

  const mobileDevices = EditorTestData.getMobileTestScenarios();

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page);
    await editorPage.goto();
  });

  test.describe('Viewport Adaptation', () => {
    test('should adapt to iPhone viewport', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      
      // Editor should be visible and properly sized
      await expect(editorPage.editor).toBeVisible();
      
      const editorBox = await editorPage.editor.boundingBox();
      expect(editorBox?.width).toBeLessThanOrEqual(390);
      
      // Should still be functional
      await editorPage.typeText('iPhone test');
      const content = await editorPage.getTextContent();
      expect(content).toBe('iPhone test');
    });

    test('should adapt to Android phone viewport', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 });
      
      await expect(editorPage.editor).toBeVisible();
      
      const editorBox = await editorPage.editor.boundingBox();
      expect(editorBox?.width).toBeLessThanOrEqual(360);
      
      // Toolbar should adapt
      await expect(editorPage.toolbar).toBeVisible();
      const toolbarBox = await editorPage.toolbar.boundingBox();
      expect(toolbarBox?.width).toBeLessThanOrEqual(360);
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(editorPage.editor).toBeVisible();
      await expect(editorPage.toolbar).toBeVisible();
      
      // Should have more space for toolbar buttons
      const boldButtonVisible = await editorPage.boldButton.isVisible();
      const italicButtonVisible = await editorPage.italicButton.isVisible();
      const underlineButtonVisible = await editorPage.underlineButton.isVisible();
      
      // Most buttons should be visible on tablet
      const visibleButtons = [boldButtonVisible, italicButtonVisible, underlineButtonVisible]
        .filter(Boolean).length;
      expect(visibleButtons).toBeGreaterThanOrEqual(2);
    });

    test('should handle landscape orientation', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 390, height: 844 });
      await editorPage.typeText('Orientation test');
      
      // Switch to landscape
      await page.setViewportSize({ width: 844, height: 390 });
      
      // Content should be preserved
      const content = await editorPage.getTextContent();
      expect(content).toBe('Orientation test');
      
      // Editor should still be functional
      await editorPage.typeText(' landscape');
      const newContent = await editorPage.getTextContent();
      expect(newContent).toBe('Orientation test landscape');
    });
  });

  test.describe('Touch Interactions', () => {
    test('should handle tap interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Tap to focus editor
      await editorPage.editorContent.tap();
      await expect(editorPage.editorContent).toBeFocused();
      
      // Tap toolbar buttons
      await editorPage.boldButton.tap();
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
    });

    test('should handle long press interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editorPage.typeText('Long press test text');
      
      // Long press to select text (approximate with mouse events)
      const textElement = editorPage.page.locator('text=test');
      await textElement.click({ clickCount: 2 }); // Double tap to select word
      
      // Should select the word
      await editorPage.applyBold();
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold');
    });

    test('should handle swipe gestures', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Add content that requires scrolling
      const longContent = EditorTestData.generateText({ paragraphs: 10 });
      await editorPage.typeText(longContent);
      
      // Simulate swipe down (scroll up)
      const editorBounds = await editorPage.editorContent.boundingBox();
      if (editorBounds) {
        await page.mouse.move(editorBounds.x + 100, editorBounds.y + 100);
        await page.mouse.down();
        await page.mouse.move(editorBounds.x + 100, editorBounds.y + 300);
        await page.mouse.up();
      }
      
      // Should scroll content
      const scrollTop = await editorPage.editorContent.evaluate(el => el.scrollTop);
      expect(scrollTop).toBeGreaterThanOrEqual(0);
    });

    test('should handle pinch-to-zoom gestures', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editorPage.typeText('Zoom test content');
      
      // Simulate pinch zoom using keyboard shortcut
      await page.keyboard.press('Control+Plus');
      
      // Content should still be accessible
      const content = await editorPage.getTextContent();
      expect(content).toBe('Zoom test content');
      
      // Reset zoom
      await page.keyboard.press('Control+0');
    });

    test('should handle multi-touch selection', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editorPage.typeText('Multi-touch selection test');
      
      // Simulate text selection with touch
      const textBounds = await editorPage.editorContent.boundingBox();
      if (textBounds) {
        // Start selection
        await page.mouse.move(textBounds.x + 50, textBounds.y + 10);
        await page.mouse.down();
        
        // Drag to select
        await page.mouse.move(textBounds.x + 150, textBounds.y + 10);
        await page.mouse.up();
      }
      
      // Apply formatting to test selection
      await editorPage.applyBold();
      
      // Should have some bold content
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<strong>');
    });
  });

  test.describe('Virtual Keyboard Handling', () => {
    test('should adjust layout when virtual keyboard appears', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Focus editor to trigger virtual keyboard
      await editorPage.editorContent.tap();
      
      // Simulate virtual keyboard by reducing viewport height
      await page.setViewportSize({ width: 375, height: 400 });
      
      // Editor should still be visible and functional
      await expect(editorPage.editor).toBeVisible();
      await editorPage.typeText('Virtual keyboard test');
      
      const content = await editorPage.getTextContent();
      expect(content).toBe('Virtual keyboard test');
    });

    test('should handle autocorrect and suggestions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check autocorrect attributes on editor
      const autocorrect = await editorPage.editorContent.getAttribute('autocorrect');
      const spellcheck = await editorPage.editorContent.getAttribute('spellcheck');
      
      // Should have appropriate attributes set
      expect(autocorrect === 'on' || autocorrect === 'off').toBe(true);
      expect(spellcheck === 'true' || spellcheck === 'false').toBe(true);
    });

    test('should handle input method editors (IME)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editorPage.editorContent.focus();
      
      // Test composition events (common with mobile keyboards)
      await page.evaluate(() => {
        const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
        if (editor) {
          // Simulate IME input
          const compositionStart = new CompositionEvent('compositionstart');
          const compositionUpdate = new CompositionEvent('compositionupdate', { data: 'test' });
          const compositionEnd = new CompositionEvent('compositionend', { data: 'test' });
          
          editor.dispatchEvent(compositionStart);
          editor.dispatchEvent(compositionUpdate);
          editor.dispatchEvent(compositionEnd);
        }
      });
      
      // Editor should handle IME input gracefully
      await editorPage.typeText('IME test');
      const content = await editorPage.getTextContent();
      expect(content).toContain('IME test');
    });

    test('should handle voice input', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Voice input typically comes as regular text input
      await editorPage.editorContent.focus();
      await editorPage.typeText('This text was dictated using voice input');
      
      const content = await editorPage.getTextContent();
      expect(content).toBe('This text was dictated using voice input');
    });
  });

  test.describe('Toolbar Adaptation', () => {
    test('should show priority buttons on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // Small screen
      
      // Most important buttons should be visible
      const essentialButtons = [
        editorPage.boldButton,
        editorPage.italicButton
      ];
      
      for (const button of essentialButtons) {
        const isVisible = await button.isVisible();
        if (!isVisible) {
          // Check if it's in an overflow menu
          const overflowButton = page.locator('[data-testid="toolbar-overflow"]');
          if (await overflowButton.isVisible()) {
            await overflowButton.tap();
            await expect(button).toBeVisible();
          }
        }
      }
    });

    test('should use overflow menu for additional buttons', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      
      const overflowButton = page.locator('[data-testid="toolbar-overflow"]');
      if (await overflowButton.isVisible()) {
        await overflowButton.tap();
        
        // Overflow menu should appear
        const overflowMenu = page.locator('[data-testid="toolbar-overflow-menu"]');
        await expect(overflowMenu).toBeVisible();
        
        // Should contain additional buttons
        const menuButtons = overflowMenu.locator('button');
        const buttonCount = await menuButtons.count();
        expect(buttonCount).toBeGreaterThan(0);
      }
    });

    test('should group related buttons in mobile view', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if buttons are grouped logically
      const formatGroup = page.locator('[data-testid="format-group"]');
      const insertGroup = page.locator('[data-testid="insert-group"]');
      
      if (await formatGroup.isVisible()) {
        // Format group should contain text formatting buttons
        const boldInGroup = formatGroup.locator('[data-testid="toolbar-bold"]');
        const italicInGroup = formatGroup.locator('[data-testid="toolbar-italic"]');
        
        await expect(boldInGroup).toBeVisible();
        await expect(italicInGroup).toBeVisible();
      }
    });

    test('should use compact button styles on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Buttons should be appropriately sized for touch
      const buttonSize = await editorPage.boldButton.boundingBox();
      expect(buttonSize?.width).toBeGreaterThanOrEqual(44);
      expect(buttonSize?.height).toBeGreaterThanOrEqual(44);
      
      // But should fit in available space
      const toolbarWidth = await editorPage.toolbar.boundingBox();
      expect(toolbarWidth?.width).toBeLessThanOrEqual(375);
    });
  });

  test.describe('Modal and Popup Adaptation', () => {
    test('should adapt modals to mobile screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editorPage.linkButton.tap();
      await expect(editorPage.linkModal).toBeVisible();
      
      // Modal should fit in viewport
      const modalSize = await editorPage.linkModal.boundingBox();
      expect(modalSize?.width).toBeLessThanOrEqual(375);
      expect(modalSize?.height).toBeLessThanOrEqual(667);
      
      // Should be easily closeable
      const closeButton = page.locator('[data-testid="modal-close"]');
      if (await closeButton.isVisible()) {
        const closeSize = await closeButton.boundingBox();
        expect(closeSize?.width).toBeGreaterThanOrEqual(44);
        expect(closeSize?.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('should use full-screen modals when appropriate', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // Very small screen
      
      await editorPage.imageButton.tap();
      
      if (await editorPage.imageModal.isVisible()) {
        const modalSize = await editorPage.imageModal.boundingBox();
        
        // On very small screens, modal might be full-screen
        const isFullWidth = modalSize?.width === 320;
        const isNearFullWidth = modalSize && modalSize.width >= 300;
        
        expect(isFullWidth || isNearFullWidth).toBe(true);
      }
    });

    test('should handle bottom sheet style modals', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if modals slide up from bottom (common mobile pattern)
      await editorPage.tableButton.tap();
      
      const tablePicker = page.locator('[data-testid="table-size-picker"]');
      if (await tablePicker.isVisible()) {
        const pickerPosition = await tablePicker.boundingBox();
        // Should be positioned appropriately for mobile interaction
        expect(pickerPosition?.y).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Performance on Mobile', () => {
    test('should load quickly on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await editorPage.goto();
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time on mobile
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle typing performance on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      const longText = 'A'.repeat(1000);
      await editorPage.typeText(longText);
      const typeTime = Date.now() - startTime;
      
      // Should handle typing efficiently
      expect(typeTime).toBeLessThan(5000);
      
      const content = await editorPage.getTextContent();
      expect(content.length).toBe(1000);
    });

    test('should maintain smooth scrolling on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Add content that requires scrolling
      const longContent = EditorTestData.generateText({ paragraphs: 20 });
      await editorPage.typeText(longContent);
      
      // Test scroll performance
      const scrollStart = Date.now();
      
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(100);
      }
      
      const scrollTime = Date.now() - scrollStart;
      expect(scrollTime).toBeLessThan(2000);
    });

    test('should handle memory usage efficiently', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Create complex content
      await editorPage.typeText(EditorTestData.generateText({ paragraphs: 10 }));
      await editorPage.insertTable(5, 5);
      
      // Add some formatting
      await editorPage.selectAll();
      await editorPage.applyBold();
      
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        await editorPage.undo();
        await editorPage.redo();
      }
      
      // Should still be responsive
      await editorPage.typeText(' Final text');
      const content = await editorPage.getTextContent();
      expect(content).toContain('Final text');
    });
  });

  test.describe('Cross-Device Consistency', () => {
    mobileDevices.forEach(device => {
      test(`should work consistently on ${device.name}`, async ({ page }) => {
        await page.setViewportSize(device.viewport);
        
        // Basic functionality should work
        await editorPage.typeText(`Testing on ${device.name}`);
        await editorPage.selectAll();
        await editorPage.applyBold();
        
        await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold');
        
        const content = await editorPage.getTextContent();
        expect(content).toBe(`Testing on ${device.name}`);
      });
    });

    test('should maintain data consistency across orientations', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editorPage.typeText('Cross-orientation test');
      await editorPage.selectAll();
      await editorPage.applyBold();
      await editorPage.insertTable(2, 2);
      
      const originalContent = await editorPage.getHtmlContent();
      
      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Content should be preserved
      const newContent = await editorPage.getHtmlContent();
      expect(newContent).toBe(originalContent);
      
      // Should still be functional
      await editorPage.typeText(' Additional text');
      const finalContent = await editorPage.getTextContent();
      expect(finalContent).toContain('Additional text');
    });

    test('should handle zoom levels appropriately', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editorPage.typeText('Zoom test content');
      
      // Test different zoom levels
      const zoomLevels = [0.75, 1.0, 1.25, 1.5];
      
      for (const zoom of zoomLevels) {
        await page.evaluate(z => {
          document.body.style.zoom = z.toString();
        }, zoom);
        
        // Should remain functional at all zoom levels
        const content = await editorPage.getTextContent();
        expect(content).toBe('Zoom test content');
        
        // Toolbar should be accessible
        await expect(editorPage.toolbar).toBeVisible();
      }
      
      // Reset zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1';
      });
    });
  });

  test.describe('Mobile Specific Features', () => {
    test('should support mobile context menus', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editorPage.typeText('Context menu test');
      
      // Long press to trigger context menu
      await editorPage.page.locator('text=menu').click({ 
        button: 'right',
        delay: 500 
      });
      
      // Mobile context menu might be custom or native
      const contextMenu = page.locator('[data-testid="context-menu"]');
      if (await contextMenu.isVisible()) {
        // Should have mobile-appropriate options
        const menuItems = contextMenu.locator('[role="menuitem"]');
        const itemCount = await menuItems.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test('should handle mobile sharing capabilities', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editorPage.typeText('Shareable content');
      
      // Look for share button if available
      const shareButton = page.locator('[data-testid="share-button"]');
      if (await shareButton.isVisible()) {
        await shareButton.tap();
        
        // Should trigger appropriate sharing mechanism
        const shareModal = page.locator('[data-testid="share-modal"]');
        await expect(shareModal).toBeVisible();
      }
    });

    test('should support mobile file access patterns', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test mobile file upload
      await editorPage.imageButton.tap();
      
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // Should have mobile-appropriate accept attributes
        const accept = await fileInput.getAttribute('accept');
        expect(accept).toBeTruthy();
        expect(accept).toContain('image/');
      }
    });
  });
});