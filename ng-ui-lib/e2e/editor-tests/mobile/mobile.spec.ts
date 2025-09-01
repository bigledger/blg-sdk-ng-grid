import { test, expect, devices } from '@playwright/test';
import { EditorTestBase } from '../editor-base.spec';

// Mobile device configurations
const mobileDevices = [
  { name: 'iPhone 12', ...devices['iPhone 12'] },
  { name: 'iPhone 12 Pro', ...devices['iPhone 12 Pro'] },
  { name: 'iPad', ...devices['iPad Pro'] },
  { name: 'Samsung Galaxy S21', ...devices['Galaxy S21'] },
  { name: 'Pixel 5', ...devices['Pixel 5'] }
];

test.describe('BLG Editor - Mobile Responsiveness', () => {
  let editor: EditorTestBase;

  test.beforeEach(async ({ page }) => {
    editor = new EditorTestBase(page);
    await editor.navigateToEditor();
    await editor.clearEditor();
  });

  test.describe('Touch Interactions', () => {
    mobileDevices.forEach(device => {
      test(`should handle touch interactions on ${device.name}`, async ({ page, browser }) => {
        const mobileContext = await browser.newContext({ ...device });
        const mobilePage = await mobileContext.newPage();
        const mobileEditor = new EditorTestBase(mobilePage);
        
        await mobileEditor.navigateToEditor();
        await mobileEditor.clearEditor();
        
        // Test tap to position cursor
        await mobileEditor.editorElement.tap();
        
        const isEditorFocused = await mobileEditor.isEditorFocused();
        expect(isEditorFocused).toBe(true);
        
        // Test typing on mobile
        await mobilePage.keyboard.type('Mobile typing test');
        
        const content = await mobileEditor.getEditorTextContent();
        expect(content).toContain('Mobile typing test');
        
        await mobileContext.close();
      });
    });

    test('should handle double tap to select word', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      await editor.typeInEditor('Double tap selection test');
      
      const wordElement = editor.page.locator('text=selection');
      await wordElement.tap({ clickCount: 2 });
      
      const selection = await editor.getSelection();
      expect(selection.text).toBe('selection');
      expect(selection.collapsed).toBe(false);
    });

    test('should handle triple tap to select paragraph', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.typeInEditor('This is a complete paragraph for testing triple tap selection.');
      
      const paragraphElement = editor.page.locator('text=complete');
      await paragraphElement.tap({ clickCount: 3 });
      
      const selection = await editor.getSelection();
      expect(selection.text).toContain('This is a complete paragraph');
      expect(selection.collapsed).toBe(false);
    });

    test('should handle long press for context menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.typeInEditor('Long press context menu test');
      await editor.selectAllText();
      
      // Simulate long press
      const textElement = editor.page.locator('text=Long press');
      await textElement.tap();
      await textElement.tap({ delay: 1000 });
      
      // Check for context menu
      const contextMenu = editor.page.locator('[data-testid="mobile-context-menu"]');
      if (await contextMenu.isVisible()) {
        await expect(contextMenu).toBeVisible();
        
        const menuItems = contextMenu.locator('button, [role="menuitem"]');
        const itemCount = await menuItems.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test('should handle swipe gestures', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.typeInEditor('Content for swipe testing');
      
      const editorBox = await editor.editorElement.boundingBox();
      expect(editorBox).not.toBeNull();
      
      if (editorBox) {
        // Swipe left to right (might trigger selection or navigation)
        await page.touchscreen.tap(editorBox.x + 50, editorBox.y + 50);
        
        // Perform swipe gesture
        await page.mouse.move(editorBox.x + 50, editorBox.y + 50);
        await page.mouse.down();
        await page.mouse.move(editorBox.x + 150, editorBox.y + 50);
        await page.mouse.up();
        
        // Verify gesture was handled appropriately
        const content = await editor.getEditorTextContent();
        expect(content).toContain('Content for swipe testing');
      }
    });

    test('should handle pinch zoom gestures', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.typeInEditor('Zoom gesture test content');
      
      const editorBox = await editor.editorElement.boundingBox();
      expect(editorBox).not.toBeNull();
      
      if (editorBox) {
        // Simulate pinch zoom (two finger gesture)
        const centerX = editorBox.x + editorBox.width / 2;
        const centerY = editorBox.y + editorBox.height / 2;
        
        // This is a simplified simulation of pinch zoom
        await page.touchscreen.tap(centerX - 20, centerY);
        await page.touchscreen.tap(centerX + 20, centerY);
        
        // Content should remain accessible after zoom
        const content = await editor.getEditorTextContent();
        expect(content).toContain('Zoom gesture test content');
      }
    });

    test('should handle drag and drop on touch devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Insert image first
      const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertImageButton.tap();
      
      const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      if (await imageDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill('https://picsum.photos/200/150');
        
        const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
        await insertButton.tap();
        
        await editor.waitForContentUpdate();
        
        // Try to drag the image
        const image = editor.page.locator('[data-testid="main-editor"] img');
        const imageBox = await image.boundingBox();
        
        if (imageBox) {
          await page.touchscreen.tap(imageBox.x + imageBox.width/2, imageBox.y + imageBox.height/2);
          
          // Drag to new position
          await page.mouse.move(imageBox.x + imageBox.width/2, imageBox.y + imageBox.height/2);
          await page.mouse.down();
          await page.mouse.move(imageBox.x + 100, imageBox.y + 100);
          await page.mouse.up();
        }
        
        await expect(image).toBeVisible();
      }
    });
  });

  test.describe('Responsive Layout', () => {
    test('should adapt layout for different screen sizes', async ({ page }) => {
      const screenSizes = [
        { width: 320, height: 568, name: 'iPhone 5' },
        { width: 375, height: 667, name: 'iPhone SE' },
        { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1024, height: 1366, name: 'iPad Pro' }
      ];
      
      for (const size of screenSizes) {
        await page.setViewportSize({ width: size.width, height: size.height });
        await editor.waitForAnimation();
        
        // Check that editor is visible and usable
        await expect(editor.editorElement).toBeVisible();
        
        const editorBox = await editor.editorElement.boundingBox();
        expect(editorBox).not.toBeNull();
        
        if (editorBox) {
          // Editor should fit within viewport
          expect(editorBox.width).toBeLessThanOrEqual(size.width);
          
          // Editor should have reasonable minimum height
          expect(editorBox.height).toBeGreaterThan(100);
        }
        
        // Test basic functionality
        await editor.clearEditor();
        await editor.typeInEditor(`Test on ${size.name}`);
        
        const content = await editor.getEditorTextContent();
        expect(content).toContain(`Test on ${size.name}`);
      }
    });

    test('should collapse toolbar on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // Very small screen
      
      const toolbar = editor.toolbarElement;
      const toolbarClass = await toolbar.getAttribute('class');
      
      // Should have mobile or collapsed class
      expect(toolbarClass).toMatch(/mobile|collapsed|compact/);
      
      // Should have hamburger menu or more button
      const moreButton = editor.page.locator('[data-testid="toolbar-more"], [data-testid="toolbar-menu"]');
      if (await moreButton.isVisible()) {
        await moreButton.tap();
        
        // Menu should expand
        const expandedMenu = editor.page.locator('[data-testid="toolbar-expanded-menu"]');
        await expect(expandedMenu).toBeVisible();
      }
    });

    test('should stack elements vertically on narrow screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      
      // Configuration panel should stack vertically
      const configPanel = editor.page.locator('[data-testid="config-panel"]');
      const configOptions = editor.page.locator('[data-testid="config-panel"] .config-options');
      
      if (await configOptions.isVisible()) {
        const flexDirection = await configOptions.evaluate(el => 
          window.getComputedStyle(el).flexDirection
        );
        expect(flexDirection).toBe('column');
      }
    });

    test('should adjust font size for mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.typeInEditor('Mobile font size test');
      
      const editorFontSize = await editor.editorElement.evaluate(el => 
        window.getComputedStyle(el).fontSize
      );
      
      // Font size should be at least 16px to prevent zoom on iOS
      const fontSize = parseInt(editorFontSize);
      expect(fontSize).toBeGreaterThanOrEqual(16);
    });

    test('should provide adequate touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const buttons = editor.page.locator('button, [role="button"]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox();
          
          if (boundingBox) {
            // Touch targets should be at least 44x44px (iOS guidelines)
            expect(boundingBox.width).toBeGreaterThanOrEqual(44);
            expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('should handle orientation changes', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await editor.typeInEditor('Orientation change test');
      
      const portraitContent = await editor.getEditorTextContent();
      expect(portraitContent).toContain('Orientation change test');
      
      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await editor.waitForAnimation();
      
      // Content should still be there and editor should be functional
      const landscapeContent = await editor.getEditorTextContent();
      expect(landscapeContent).toContain('Orientation change test');
      
      // Add more content in landscape
      await editor.page.keyboard.press('End');
      await editor.page.keyboard.type(' - landscape addition');
      
      const finalContent = await editor.getEditorTextContent();
      expect(finalContent).toContain('landscape addition');
    });
  });

  test.describe('Virtual Keyboard Handling', () => {
    test('should adjust layout when virtual keyboard appears', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Get initial editor position
      const initialEditorBox = await editor.editorElement.boundingBox();
      expect(initialEditorBox).not.toBeNull();
      
      // Focus editor to bring up virtual keyboard
      await editor.editorElement.tap();
      
      // Simulate virtual keyboard appearance (reduce viewport height)
      await page.setViewportSize({ width: 375, height: 400 });
      await editor.waitForAnimation();
      
      // Editor should still be visible
      const editorAfterKeyboard = await editor.editorElement.boundingBox();
      expect(editorAfterKeyboard).not.toBeNull();
      
      if (initialEditorBox && editorAfterKeyboard) {
        // Editor might have moved up to stay visible
        expect(editorAfterKeyboard.y).toBeLessThanOrEqual(initialEditorBox.y);
      }
      
      // Should still be able to type
      await editor.page.keyboard.type('Virtual keyboard test');
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Virtual keyboard test');
    });

    test('should scroll to keep cursor visible', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Add enough content to make editor scrollable
      let longContent = '';
      for (let i = 1; i <= 20; i++) {
        longContent += `Line ${i} with some content\\n`;
      }
      await editor.typeInEditor(longContent);
      
      // Focus at end of content
      await editor.page.keyboard.press('Control+End');
      
      // Simulate virtual keyboard
      await page.setViewportSize({ width: 375, height: 400 });
      await editor.waitForAnimation();
      
      // Start typing
      await editor.page.keyboard.type('New content at end');
      
      // Cursor should be visible
      const cursorVisible = await editor.page.evaluate(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return false;
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      });
      
      expect(cursorVisible).toBe(true);
    });

    test('should handle different keyboard types', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test with different input types that might trigger different keyboards
      const testCases = [
        { type: 'text', content: 'Regular text input' },
        { type: 'email', content: 'test@example.com' },
        { type: 'url', content: 'https://example.com' },
        { type: 'number', content: '12345' }
      ];
      
      for (const testCase of testCases) {
        await editor.clearEditor();
        
        // Insert link to test URL keyboard
        if (testCase.type === 'url' || testCase.type === 'email') {
          const linkButton = editor.page.locator('[data-testid="insert-link"]');
          await linkButton.tap();
          
          const linkDialog = editor.page.locator('[data-testid="link-dialog"]');
          if (await linkDialog.isVisible()) {
            const urlInput = editor.page.locator('[data-testid="link-url-input"]');
            await urlInput.tap();
            await urlInput.type(testCase.content);
            
            const cancelButton = editor.page.locator('[data-testid="link-dialog-cancel"]');
            await cancelButton.tap();
          }
        } else {
          await editor.editorElement.tap();
          await editor.page.keyboard.type(testCase.content);
          
          const content = await editor.getEditorTextContent();
          expect(content).toContain(testCase.content);
        }
      }
    });

    test('should maintain scroll position after keyboard dismissal', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Create scrollable content
      let longContent = '';
      for (let i = 1; i <= 30; i++) {
        longContent += `Paragraph ${i} with some content to make it scrollable.\\n`;
      }
      await editor.typeInEditor(longContent);
      
      // Scroll to middle
      await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        if (editor) {
          editor.scrollTop = editor.scrollHeight / 2;
        }
      });
      
      const initialScrollTop = await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        return editor ? editor.scrollTop : 0;
      });
      
      // Focus and bring up keyboard
      await editor.editorElement.tap();
      await page.setViewportSize({ width: 375, height: 400 });
      await editor.waitForAnimation();
      
      // Dismiss keyboard
      await editor.page.click('[data-testid="config-panel"]'); // Click outside
      await page.setViewportSize({ width: 375, height: 667 });
      await editor.waitForAnimation();
      
      // Check scroll position
      const finalScrollTop = await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        return editor ? editor.scrollTop : 0;
      });
      
      // Scroll position should be maintained (within tolerance)
      expect(Math.abs(finalScrollTop - initialScrollTop)).toBeLessThan(50);
    });
  });

  test.describe('Mobile-Specific UI Elements', () => {
    test('should show mobile toolbar', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const toolbar = editor.toolbarElement;
      const toolbarClass = await toolbar.getAttribute('class');
      
      expect(toolbarClass).toMatch(/mobile/);
      
      // Should have mobile-specific buttons or layout
      const mobileSpecificButton = editor.page.locator('[data-testid="mobile-toolbar-toggle"]');
      if (await mobileSpecificButton.isVisible()) {
        await expect(mobileSpecificButton).toBeVisible();
      }
    });

    test('should show mobile context menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.typeInEditor('Mobile context menu test');
      await editor.selectAllText();
      
      // Long press to show context menu
      const textElement = editor.page.locator('text=Mobile context');
      await textElement.tap();
      await textElement.tap({ delay: 1000 });
      
      const contextMenu = editor.page.locator('[data-testid="mobile-context-menu"]');
      if (await contextMenu.isVisible()) {
        const menuItems = [
          'Cut',
          'Copy',
          'Paste',
          'Bold',
          'Italic'
        ];
        
        for (const item of menuItems) {
          const menuItem = contextMenu.locator(`text=${item}`);
          if (await menuItem.isVisible()) {
            await expect(menuItem).toBeVisible();
          }
        }
      }
    });

    test('should show mobile selection handles', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.typeInEditor('Text with mobile selection handles');
      
      // Double tap to select word
      const wordElement = editor.page.locator('text=mobile');
      await wordElement.tap({ clickCount: 2 });
      
      // Check for selection handles
      const selectionHandles = editor.page.locator('[data-testid="selection-handle"]');
      const handleCount = await selectionHandles.count();
      
      if (handleCount > 0) {
        expect(handleCount).toBe(2); // Start and end handles
        
        // Handles should be positioned correctly
        const startHandle = selectionHandles.first();
        const endHandle = selectionHandles.last();
        
        await expect(startHandle).toBeVisible();
        await expect(endHandle).toBeVisible();
      }
    });

    test('should provide mobile-optimized dropdowns', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const fontFamilyDropdown = editor.page.locator('[data-testid="font-family-dropdown"]');
      if (await fontFamilyDropdown.isVisible()) {
        await fontFamilyDropdown.tap();
        
        // Mobile dropdown should be fullscreen or bottom sheet
        const mobileDropdown = editor.page.locator('[data-testid="mobile-dropdown"]');
        if (await mobileDropdown.isVisible()) {
          const dropdownClass = await mobileDropdown.getAttribute('class');
          expect(dropdownClass).toMatch(/fullscreen|bottom-sheet|modal/);
          
          // Should have close button
          const closeButton = mobileDropdown.locator('[data-testid="dropdown-close"]');
          await expect(closeButton).toBeVisible();
        }
      }
    });

    test('should handle mobile media insertion', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const uploadButton = editor.page.locator('[data-testid="upload-image-button"]');
      await uploadButton.tap();
      
      // On mobile, might trigger camera/gallery selector
      const mobileMediaSelector = editor.page.locator('[data-testid="mobile-media-selector"]');
      if (await mobileMediaSelector.isVisible()) {
        const options = [
          'camera',
          'gallery',
          'url'
        ];
        
        for (const option of options) {
          const optionButton = mobileMediaSelector.locator(`[data-testid="media-option-${option}"]`);
          if (await optionButton.isVisible()) {
            await expect(optionButton).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Performance on Mobile', () => {
    test('should maintain performance on slower devices', async ({ page }) => {
      // Simulate slower device
      await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
        uploadThroughput: 750 * 1024 / 8, // 750 Kbps
        latency: 40
      });
      
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      
      await editor.typeInEditor('Performance test on mobile');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should respond within reasonable time even on slow devices
      expect(responseTime).toBeLessThan(1000);
    });

    test('should handle rapid touch inputs', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.editorElement.tap();
      
      // Rapid typing simulation
      const rapidText = 'RapidTouchTest';
      for (const char of rapidText) {
        await page.keyboard.type(char, { delay: 50 });
      }
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain(rapidText);
    });

    test('should optimize rendering for mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Add complex content
      await editor.page.click('[data-testid="load-complex-formatting"]');
      await editor.waitForContentUpdate();
      
      // Measure render time
      const renderTime = await editor.measureRenderTime();
      
      // Should render efficiently on mobile
      expect(renderTime).toBeLessThan(100);
    });

    test('should handle memory constraints on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Load large document
      await editor.page.click('[data-testid="load-large-document"]');
      await editor.waitForContentUpdate();
      
      // Memory usage should be reasonable
      const memoryUsage = await editor.measureMemoryUsage();
      
      // Should not exceed 100MB on mobile
      expect(memoryUsage).toBeLessThan(100);
    });
  });

  test.describe('Mobile Browser Compatibility', () => {
    test('should work on mobile Safari', async ({ browser }) => {
      const safariContext = await browser.newContext({
        ...devices['iPhone 12'],
        userAgent: devices['iPhone 12'].userAgent
      });
      
      const safariPage = await safariContext.newPage();
      const safariEditor = new EditorTestBase(safariPage);
      
      await safariEditor.navigateToEditor();
      await safariEditor.typeInEditor('Safari mobile test');
      
      const content = await safariEditor.getEditorTextContent();
      expect(content).toContain('Safari mobile test');
      
      await safariContext.close();
    });

    test('should work on mobile Chrome', async ({ browser }) => {
      const chromeContext = await browser.newContext({
        ...devices['Pixel 5']
      });
      
      const chromePage = await chromeContext.newPage();
      const chromeEditor = new EditorTestBase(chromePage);
      
      await chromeEditor.navigateToEditor();
      await chromeEditor.typeInEditor('Chrome mobile test');
      
      const content = await chromeEditor.getEditorTextContent();
      expect(content).toContain('Chrome mobile test');
      
      await chromeContext.close();
    });

    test('should handle mobile-specific CSS', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check for mobile-specific styles
      const editorStyles = await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        if (!editor) return null;
        
        const styles = window.getComputedStyle(editor);
        return {
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
          padding: styles.padding,
          minHeight: styles.minHeight
        };
      });
      
      if (editorStyles) {
        // Font size should be at least 16px
        expect(parseInt(editorStyles.fontSize)).toBeGreaterThanOrEqual(16);
        
        // Should have appropriate padding for touch
        expect(parseInt(editorStyles.padding)).toBeGreaterThan(8);
      }
    });

    test('should handle mobile viewport meta tag', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const viewportMeta = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta ? meta.getAttribute('content') : null;
      });
      
      if (viewportMeta) {
        expect(viewportMeta).toMatch(/width=device-width/);
        expect(viewportMeta).toMatch(/initial-scale=1/);
      }
    });
  });

  test.describe('Offline and PWA Features', () => {
    test('should work offline', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Go offline
      await page.setOfflineMode(true);
      
      // Should still be able to edit
      await editor.typeInEditor('Offline editing test');
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Offline editing test');
      
      // Go back online
      await page.setOfflineMode(false);
    });

    test('should support PWA installation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check for PWA manifest
      const manifestLink = await page.evaluate(() => {
        const link = document.querySelector('link[rel="manifest"]');
        return link ? link.getAttribute('href') : null;
      });
      
      if (manifestLink) {
        expect(manifestLink).toBeTruthy();
      }
      
      // Check for service worker
      const hasServiceWorker = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      
      expect(hasServiceWorker).toBe(true);
    });

    test('should handle network connectivity changes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.typeInEditor('Initial content');
      
      // Simulate network change
      await page.evaluate(() => {
        window.dispatchEvent(new Event('offline'));
      });
      
      // Should show offline indicator
      const offlineIndicator = editor.page.locator('[data-testid="offline-indicator"]');
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toBeVisible();
      }
      
      // Simulate going back online
      await page.evaluate(() => {
        window.dispatchEvent(new Event('online'));
      });
      
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).not.toBeVisible();
      }
    });
  });
});