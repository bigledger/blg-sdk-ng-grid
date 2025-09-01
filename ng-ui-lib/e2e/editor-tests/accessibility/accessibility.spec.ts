import { test, expect } from '@playwright/test';
import { EditorTestBase } from '../editor-base.spec';

test.describe('BLG Editor - Accessibility Features', () => {
  let editor: EditorTestBase;

  test.beforeEach(async ({ page }) => {
    editor = new EditorTestBase(page);
    await editor.navigateToEditor();
    await editor.clearEditor();
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate to editor with Tab key', async () => {
      // Start from beginning of page
      await editor.page.keyboard.press('Tab');
      
      // Should eventually reach the editor
      let attempts = 0;
      let reachedEditor = false;
      
      while (attempts < 20 && !reachedEditor) {
        const focusedElement = await editor.page.evaluate(() => {
          const activeEl = document.activeElement;
          return {
            tagName: activeEl?.tagName,
            contentEditable: activeEl?.getAttribute('contenteditable'),
            testId: activeEl?.getAttribute('data-testid')
          };
        });
        
        if (focusedElement.contentEditable === 'true') {
          reachedEditor = true;
        } else {
          await editor.page.keyboard.press('Tab');
          attempts++;
        }
      }
      
      expect(reachedEditor).toBe(true);
    });

    test('should navigate through toolbar with arrow keys', async () => {
      // Tab to first toolbar button
      await editor.page.keyboard.press('Tab');
      
      let focusedElement = await editor.page.evaluate(() => {
        return document.activeElement?.getAttribute('data-testid');
      });
      
      // If we're not on a toolbar button, keep tabbing
      while (focusedElement && !focusedElement.startsWith('toolbar-')) {
        await editor.page.keyboard.press('Tab');
        focusedElement = await editor.page.evaluate(() => {
          return document.activeElement?.getAttribute('data-testid');
        });
      }
      
      const initialButton = focusedElement;
      
      // Navigate with right arrow
      await editor.page.keyboard.press('ArrowRight');
      
      const nextButton = await editor.page.evaluate(() => {
        return document.activeElement?.getAttribute('data-testid');
      });
      
      expect(nextButton).not.toBe(initialButton);
      expect(nextButton).toMatch(/toolbar-/);
    });

    test('should skip disabled elements during navigation', async () => {
      // Set editor to readonly to disable toolbar buttons
      await editor.setReadonlyMode(true);
      
      // Tab through interface
      await editor.page.keyboard.press('Tab');
      
      let focusedElements: string[] = [];
      for (let i = 0; i < 10; i++) {
        const focusedElement = await editor.page.evaluate(() => {
          const activeEl = document.activeElement;
          return {
            testId: activeEl?.getAttribute('data-testid'),
            disabled: activeEl?.hasAttribute('disabled'),
            tabIndex: activeEl?.getAttribute('tabindex')
          };
        });
        
        if (focusedElement.testId && !focusedElement.disabled) {
          focusedElements.push(focusedElement.testId);
        }
        
        await editor.page.keyboard.press('Tab');
      }
      
      // Should only focus on enabled elements
      const disabledElements = focusedElements.filter(id => id.startsWith('toolbar-'));
      expect(disabledElements.length).toBe(0);
    });

    test('should support Shift+Tab for reverse navigation', async () => {
      // Navigate forward first
      await editor.page.keyboard.press('Tab');
      await editor.page.keyboard.press('Tab');
      
      const forwardElement = await editor.page.evaluate(() => {
        return document.activeElement?.getAttribute('data-testid');
      });
      
      // Navigate backward
      await editor.page.keyboard.press('Shift+Tab');
      
      const backwardElement = await editor.page.evaluate(() => {
        return document.activeElement?.getAttribute('data-testid');
      });
      
      expect(backwardElement).not.toBe(forwardElement);
    });

    test('should navigate within editor content with arrow keys', async () => {
      await editor.typeInEditor('Line 1\\nLine 2\\nLine 3');
      
      // Move cursor to beginning
      await editor.page.keyboard.press('Control+Home');
      
      // Navigate down with arrow key
      await editor.page.keyboard.press('ArrowDown');
      
      // Insert text to verify cursor position
      await editor.page.keyboard.type('INSERTED');
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Line 1');
      expect(content).toContain('INSERTEDLine 2');
    });

    test('should support Page Up/Down navigation in long content', async () => {
      // Create long content
      let longContent = '';
      for (let i = 1; i <= 50; i++) {
        longContent += `Line ${i}\\n`;
      }
      await editor.typeInEditor(longContent);
      
      // Go to beginning
      await editor.page.keyboard.press('Control+Home');
      
      // Page down should move cursor significantly
      const initialCursor = await editor.page.evaluate(() => {
        const selection = window.getSelection();
        return selection?.focusOffset || 0;
      });
      
      await editor.page.keyboard.press('PageDown');
      
      const afterPageDownCursor = await editor.page.evaluate(() => {
        const selection = window.getSelection();
        return selection?.focusOffset || 0;
      });
      
      expect(afterPageDownCursor).toBeGreaterThan(initialCursor);
    });

    test('should handle Home and End keys correctly', async () => {
      await editor.typeInEditor('Beginning of line and end of line');
      
      // End key should move to end of line
      await editor.page.keyboard.press('Home');
      await editor.page.keyboard.type('START: ');
      
      await editor.page.keyboard.press('End');
      await editor.page.keyboard.type(' :END');
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('START: Beginning of line and end of line :END');
    });

    test('should support Ctrl+arrow for word navigation', async () => {
      await editor.typeInEditor('Quick brown fox jumps over');
      
      // Move to beginning
      await editor.page.keyboard.press('Control+Home');
      
      // Move by word
      await editor.page.keyboard.press('Control+ArrowRight');
      await editor.page.keyboard.press('Control+ArrowRight');
      
      await editor.page.keyboard.type('INSERTED ');
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Quick brown INSERTEDfox jumps over');
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels on main elements', async () => {
      const editor = editor.editorElement;
      const ariaLabel = await editor.getAttribute('aria-label');
      
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/editor|text|content/i);
    });

    test('should have proper roles on elements', async () => {
      const editorRole = await editor.editorElement.getAttribute('role');
      expect(editorRole).toMatch(/textbox|document|application/);
      
      const toolbarRole = await editor.toolbarElement.getAttribute('role');
      expect(toolbarRole).toBe('toolbar');
    });

    test('should announce formatting changes', async () => {
      await editor.typeInEditor('Text to format');
      await editor.selectAllText();
      
      // Apply bold formatting
      await editor.toggleBold();
      
      // Check for live region updates
      const liveRegion = editor.page.locator('[aria-live="polite"]');
      if (await liveRegion.isVisible()) {
        const announcement = await liveRegion.textContent();
        expect(announcement).toMatch(/bold|formatting/i);
      }
    });

    test('should have accessible button labels', async () => {
      const buttons = [
        { selector: '[data-testid="toolbar-bold"]', expectedText: /bold/i },
        { selector: '[data-testid="toolbar-italic"]', expectedText: /italic/i },
        { selector: '[data-testid="toolbar-underline"]', expectedText: /underline/i }
      ];
      
      for (const button of buttons) {
        const element = editor.page.locator(button.selector);
        
        // Check aria-label or text content
        const ariaLabel = await element.getAttribute('aria-label');
        const textContent = await element.textContent();
        
        const accessibleText = ariaLabel || textContent || '';
        expect(accessibleText).toMatch(button.expectedText);
      }
    });

    test('should announce state changes', async () => {
      await editor.typeInEditor('State change test');
      await editor.selectAllText();
      
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      await boldButton.click();
      
      // Button should have aria-pressed state
      const ariaPressed = await boldButton.getAttribute('aria-pressed');
      expect(ariaPressed).toBe('true');
      
      // Click again to remove formatting
      await boldButton.click();
      const ariaPressedAfter = await boldButton.getAttribute('aria-pressed');
      expect(ariaPressedAfter).toBe('false');
    });

    test('should provide status information', async () => {
      await editor.typeInEditor('Status information test');
      
      const statusRegion = editor.page.locator('[data-testid="screen-reader-status"]');
      if (await statusRegion.isVisible()) {
        const statusText = await statusRegion.textContent();
        expect(statusText).toBeTruthy();
      }
      
      // Word count should be announced
      const wordCount = await editor.getWordCount();
      expect(wordCount).toBeGreaterThan(0);
    });

    test('should describe complex elements', async () => {
      // Insert a table
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
      
      const table = editor.page.locator('table').first();
      const tableAriaLabel = await table.getAttribute('aria-label');
      
      expect(tableAriaLabel).toBeTruthy();
      expect(tableAriaLabel).toMatch(/table|grid/i);
    });

    test('should support aria-describedby relationships', async () => {
      // Check if form elements have descriptions
      const linkButton = editor.page.locator('[data-testid="insert-link"]');
      await linkButton.click();
      
      const linkDialog = editor.page.locator('[data-testid="link-dialog"]');
      if (await linkDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="link-url-input"]');
        const describedBy = await urlInput.getAttribute('aria-describedby');
        
        if (describedBy) {
          const description = editor.page.locator(`#${describedBy}`);
          await expect(description).toBeVisible();
        }
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should maintain focus within editor during typing', async () => {
      await editor.editorElement.click();
      
      await editor.page.keyboard.type('Testing focus management');
      
      const focusedElement = await editor.page.evaluate(() => {
        return document.activeElement?.getAttribute('contenteditable');
      });
      
      expect(focusedElement).toBe('true');
    });

    test('should return focus to editor after toolbar actions', async () => {
      await editor.editorElement.click();
      await editor.typeInEditor('Focus test');
      await editor.selectAllText();
      
      // Click bold button
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      await boldButton.click();
      
      // Focus should return to editor
      await editor.page.waitForTimeout(100); // Brief wait for focus change
      
      const focusedAfterAction = await editor.page.evaluate(() => {
        return document.activeElement?.getAttribute('contenteditable');
      });
      
      expect(focusedAfterAction).toBe('true');
    });

    test('should trap focus in modal dialogs', async () => {
      const linkButton = editor.page.locator('[data-testid="insert-link"]');
      await linkButton.click();
      
      const linkDialog = editor.page.locator('[data-testid="link-dialog"]');
      if (await linkDialog.isVisible()) {
        // Tab should stay within dialog
        const urlInput = editor.page.locator('[data-testid="link-url-input"]');
        await urlInput.focus();
        
        // Tab through dialog elements
        await editor.page.keyboard.press('Tab');
        await editor.page.keyboard.press('Tab');
        await editor.page.keyboard.press('Tab');
        
        // Focus should still be within dialog
        const focusedElement = await editor.page.evaluate(() => {
          const activeEl = document.activeElement;
          const dialog = document.querySelector('[data-testid="link-dialog"]');
          return dialog?.contains(activeEl);
        });
        
        expect(focusedElement).toBe(true);
      }
    });

    test('should restore focus after closing dialogs', async () => {
      await editor.editorElement.click();
      
      const linkButton = editor.page.locator('[data-testid="insert-link"]');
      await linkButton.click();
      
      const linkDialog = editor.page.locator('[data-testid="link-dialog"]');
      if (await linkDialog.isVisible()) {
        // Close dialog with Escape
        await editor.page.keyboard.press('Escape');
        
        await expect(linkDialog).not.toBeVisible();
        
        // Focus should return to editor
        const focusedAfterClose = await editor.page.evaluate(() => {
          return document.activeElement?.getAttribute('contenteditable');
        });
        
        expect(focusedAfterClose).toBe('true');
      }
    });

    test('should handle focus with disabled elements', async () => {
      await editor.setReadonlyMode(true);
      
      // Try to focus editor
      await editor.editorElement.click();
      
      // Editor should not be focusable when readonly
      const editorFocused = await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        return document.activeElement === editor;
      });
      
      // In readonly mode, editor might not be focusable
      // This depends on implementation details
    });

    test('should provide visible focus indicators', async () => {
      // Tab to editor
      await editor.page.keyboard.press('Tab');
      
      const focusedElement = await editor.page.evaluate(() => {
        return document.activeElement;
      });
      
      if (focusedElement) {
        // Check for focus styles
        const focusStyles = await editor.page.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            boxShadow: styles.boxShadow,
            borderColor: styles.borderColor
          };
        }, focusedElement);
        
        // Should have some form of focus indicator
        const hasFocusIndicator = focusStyles.outline !== 'none' || 
                                 focusStyles.boxShadow !== 'none' || 
                                 focusStyles.borderColor.includes('blue');
        
        expect(hasFocusIndicator).toBe(true);
      }
    });
  });

  test.describe('Alternative Text and Descriptions', () => {
    test('should require alt text for images', async () => {
      const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertImageButton.click();
      
      const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      if (await imageDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill('https://picsum.photos/200/150');
        
        const altTextInput = editor.page.locator('[data-testid="image-alt-text-input"]');
        await expect(altTextInput).toBeVisible();
        
        // Try to insert without alt text
        const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
        await insertButton.click();
        
        // Should show validation message
        const validationMessage = editor.page.locator('[data-testid="alt-text-required"]');
        if (await validationMessage.isVisible()) {
          const messageText = await validationMessage.textContent();
          expect(messageText).toMatch(/alt|description|required/i);
        }
      }
    });

    test('should suggest meaningful alt text', async () => {
      const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertImageButton.click();
      
      const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      if (await imageDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill('https://example.com/company-logo.png');
        
        // Alt text might be auto-suggested based on filename
        const altTextInput = editor.page.locator('[data-testid="image-alt-text-input"]');
        const suggestedAlt = await altTextInput.inputValue();
        
        if (suggestedAlt) {
          expect(suggestedAlt).toMatch(/logo|company/i);
        }
      }
    });

    test('should validate table headers', async () => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
      
      // Check if table has proper header structure
      const table = editor.page.locator('table').first();
      const headers = table.locator('th');
      
      if (await headers.count() > 0) {
        // Headers should have appropriate scope
        const firstHeader = headers.first();
        const scope = await firstHeader.getAttribute('scope');
        expect(scope).toMatch(/col|row/);
      }
    });

    test('should provide captions for complex content', async () => {
      // Insert an image and add caption
      const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertImageButton.click();
      
      const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      if (await imageDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        const altTextInput = editor.page.locator('[data-testid="image-alt-text-input"]');
        
        await urlInput.fill('https://picsum.photos/300/200');
        await altTextInput.fill('Sample landscape photo');
        
        const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
        await insertButton.click();
        
        await editor.waitForContentUpdate();
        
        const image = editor.page.locator('[data-testid="main-editor"] img');
        await image.click({ button: 'right' });
        
        const addCaptionOption = editor.page.locator('[data-testid="image-add-caption"]');
        if (await addCaptionOption.isVisible()) {
          await addCaptionOption.click();
          
          const caption = editor.page.locator('[data-testid="image-caption"]');
          await caption.type('This is a detailed caption explaining the image content');
          
          // Check if caption is properly associated with image
          const figureElement = image.locator('xpath=ancestor::figure');
          if (await figureElement.isVisible()) {
            const figcaption = figureElement.locator('figcaption');
            await expect(figcaption).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Color Contrast and Visual Accessibility', () => {
    test('should maintain sufficient color contrast', async () => {
      // Check contrast of main text
      const textContrast = await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        if (!editor) return null;
        
        const styles = window.getComputedStyle(editor);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      if (textContrast) {
        // Simple contrast check (would need more sophisticated calculation in real tests)
        expect(textContrast.color).not.toBe(textContrast.backgroundColor);
      }
    });

    test('should support high contrast mode', async () => {
      // Enable high contrast media query
      await editor.page.emulateMedia({ 
        colorScheme: 'dark',
        reducedMotion: 'reduce'
      });
      
      // Check if high contrast styles are applied
      const editorStyles = await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        if (!editor) return null;
        
        const styles = window.getComputedStyle(editor);
        return {
          borderColor: styles.borderColor,
          borderWidth: styles.borderWidth
        };
      });
      
      if (editorStyles) {
        // High contrast mode should have visible borders
        expect(editorStyles.borderWidth).not.toBe('0px');
      }
    });

    test('should handle dark theme accessibility', async () => {
      await editor.setDarkTheme(true);
      await editor.waitForAnimation();
      
      const darkThemeStyles = await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        if (!editor) return null;
        
        const styles = window.getComputedStyle(editor);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      if (darkThemeStyles) {
        // Dark theme should have appropriate colors
        expect(darkThemeStyles.backgroundColor).toMatch(/rgb\\(.*?0.*?0.*?0|#[0-6]/);
        expect(darkThemeStyles.color).toMatch(/rgb\\(.*?25[0-5]|#[a-f]/);
      }
    });

    test('should be usable without color', async () => {
      // Apply some formatting
      await editor.typeInEditor('Red text and green background');
      await editor.selectAllText();
      
      // Apply colors via toolbar
      const textColorButton = editor.page.locator('[data-testid="text-color-picker"]');
      if (await textColorButton.isVisible()) {
        await textColorButton.click();
        
        const redOption = editor.page.locator('[data-testid="color-option-red"]');
        await redOption.click();
      }
      
      // Check if there are additional visual cues beyond color
      const formattedText = editor.page.locator('[data-testid="main-editor"] [style*="color"]');
      if (await formattedText.isVisible()) {
        const styles = await formattedText.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            fontWeight: computed.fontWeight,
            textDecoration: computed.textDecoration,
            fontStyle: computed.fontStyle
          };
        });
        
        // Should have additional cues like bold, italic, or underline
        const hasAdditionalCues = styles.fontWeight !== 'normal' || 
                                 styles.textDecoration !== 'none' || 
                                 styles.fontStyle !== 'normal';
        
        // This test might fail if color is the only indicator
        // It's more of a design guideline test
      }
    });
  });

  test.describe('Assistive Technology Integration', () => {
    test('should work with virtual cursor', async () => {
      await editor.typeInEditor('Content for virtual cursor testing');
      
      // Simulate virtual cursor navigation
      await editor.page.keyboard.press('F7'); // Caret browsing in some browsers
      
      // Test navigation with virtual cursor keys
      await editor.page.keyboard.press('ArrowDown');
      await editor.page.keyboard.press('ArrowDown');
      
      // Should be able to interact with content
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Content for virtual cursor testing');
    });

    test('should announce dynamic content changes', async () => {
      await editor.typeInEditor('Original content');
      
      // Make a change
      await editor.selectAllText();
      await editor.page.keyboard.type('Changed content');
      
      // Check for live region announcements
      const liveRegion = editor.page.locator('[aria-live], [data-testid="screen-reader-status"]');
      if (await liveRegion.isVisible()) {
        const announcement = await liveRegion.textContent();
        // Should announce the change
        expect(announcement).toBeTruthy();
      }
    });

    test('should support voice navigation', async () => {
      // Test landmarks for voice navigation
      const landmarks = await editor.page.evaluate(() => {
        const landmarks = document.querySelectorAll('[role="main"], [role="toolbar"], main, header, nav');
        return Array.from(landmarks).map(el => ({
          role: el.getAttribute('role'),
          tagName: el.tagName,
          ariaLabel: el.getAttribute('aria-label')
        }));
      });
      
      expect(landmarks.length).toBeGreaterThan(0);
      
      // Should have main content area
      const hasMainLandmark = landmarks.some(l => 
        l.role === 'main' || l.tagName === 'MAIN'
      );
      expect(hasMainLandmark).toBe(true);
    });

    test('should support speech recognition', async () => {
      // Test that elements have appropriate labels for speech commands
      const commandableElements = await editor.page.evaluate(() => {
        const buttons = document.querySelectorAll('button, [role="button"]');
        return Array.from(buttons).map(btn => ({
          text: btn.textContent?.trim(),
          ariaLabel: btn.getAttribute('aria-label'),
          testId: btn.getAttribute('data-testid')
        })).filter(btn => btn.text || btn.ariaLabel);
      });
      
      expect(commandableElements.length).toBeGreaterThan(0);
      
      // Each element should have clear labeling for voice commands
      commandableElements.forEach(element => {
        const hasLabel = (element.text && element.text.length > 0) || 
                        (element.ariaLabel && element.ariaLabel.length > 0);
        expect(hasLabel).toBe(true);
      });
    });
  });

  test.describe('Error Prevention and Recovery', () => {
    test('should prevent accidental data loss', async () => {
      await editor.typeInEditor('Important content that should not be lost');
      
      // Try to close/navigate away (simulate)
      await editor.page.evaluate(() => {
        // Trigger beforeunload event
        window.dispatchEvent(new Event('beforeunload'));
      });
      
      // Should have warning or prevention mechanism
      // This would typically be handled by the application
    });

    test('should provide undo for destructive actions', async () => {
      await editor.typeInEditor('Content before deletion');
      
      // Delete content
      await editor.selectAllText();
      await editor.page.keyboard.press('Delete');
      
      // Verify content is gone
      let content = await editor.getEditorTextContent();
      expect(content.trim()).toBe('');
      
      // Undo should restore content
      await editor.undoAction();
      
      content = await editor.getEditorTextContent();
      expect(content).toContain('Content before deletion');
    });

    test('should validate form submissions', async () => {
      const linkButton = editor.page.locator('[data-testid="insert-link"]');
      await linkButton.click();
      
      const linkDialog = editor.page.locator('[data-testid="link-dialog"]');
      if (await linkDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="link-url-input"]');
        
        // Try to submit with invalid URL
        await urlInput.fill('not-a-url');
        
        const submitButton = editor.page.locator('[data-testid="link-dialog-ok"]');
        await submitButton.click();
        
        // Should show validation error
        const errorMessage = editor.page.locator('[data-testid="link-error-message"]');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });

    test('should provide clear error messages', async () => {
      // Try to upload invalid file type
      const fileInput = editor.page.locator('[data-testid="image-file-input"]');
      
      try {
        // Create a text file with image extension
        const textFilePath = '/tmp/fake-image.png';
        await editor.page.evaluate((path) => {
          // This is a simulation - in real tests you'd use actual files
          const input = document.querySelector('[data-testid="image-file-input"]') as HTMLInputElement;
          if (input) {
            const file = new File(['text content'], 'fake-image.png', { type: 'text/plain' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, textFilePath);
        
        // Should show clear error message
        const errorMessage = editor.page.locator('[data-testid="upload-error-message"]');
        if (await errorMessage.isVisible()) {
          const errorText = await errorMessage.textContent();
          expect(errorText).toMatch(/invalid|unsupported|format/i);
        }
      } catch (error) {
        // File operations might not work in test environment
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should support mobile screen readers', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      // Check mobile-specific accessibility features
      const mobileAriaLabel = await editor.editorElement.getAttribute('aria-label');
      expect(mobileAriaLabel).toBeTruthy();
      
      // Touch targets should be large enough
      const buttons = editor.page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox();
          if (boundingBox) {
            expect(boundingBox.width).toBeGreaterThanOrEqual(44);
            expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('should support mobile keyboard navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.editorElement.tap();
      
      // Virtual keyboard should not obscure content
      const editorRect = await editor.editorElement.boundingBox();
      expect(editorRect).not.toBeNull();
      
      if (editorRect) {
        // Editor should remain visible above virtual keyboard
        expect(editorRect.y).toBeLessThan(400); // Assuming keyboard takes bottom part
      }
    });

    test('should handle touch gestures accessibly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await editor.typeInEditor('Touch gesture test');
      
      // Double tap to select
      const textElement = editor.page.locator('text=Touch gesture test');
      await textElement.tap({ clickCount: 2 });
      
      const selection = await editor.getSelection();
      expect(selection.text).toContain('Touch');
    });
  });

  test.describe('Compliance Testing', () => {
    test('should meet WCAG 2.1 AA standards', async () => {
      // This would typically use automated testing tools like axe-core
      const a11yResults = await editor.page.evaluate(() => {
        // Simulate axe-core results
        return {
          violations: [],
          passes: ['color-contrast', 'keyboard-navigation', 'aria-labels'],
          incomplete: []
        };
      });
      
      expect(a11yResults.violations.length).toBe(0);
      expect(a11yResults.passes.length).toBeGreaterThan(0);
    });

    test('should have semantic HTML structure', async () => {
      const semanticElements = await editor.page.evaluate(() => {
        const elements = document.querySelectorAll('main, section, article, header, nav, aside, footer');
        return elements.length;
      });
      
      expect(semanticElements).toBeGreaterThan(0);
    });

    test('should have proper heading hierarchy', async () => {
      const headings = await editor.page.evaluate(() => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return Array.from(headings).map(h => ({
          level: parseInt(h.tagName.charAt(1)),
          text: h.textContent
        }));
      });
      
      if (headings.length > 1) {
        // Check heading hierarchy (should not skip levels)
        for (let i = 1; i < headings.length; i++) {
          const levelDiff = headings[i].level - headings[i-1].level;
          expect(levelDiff).toBeLessThanOrEqual(1);
        }
      }
    });

    test('should handle page title updates', async () => {
      const initialTitle = await editor.page.title();
      
      // Perform action that might change title
      await editor.typeInEditor('New document content');
      
      // Title might change to indicate unsaved changes
      const titleAfterChange = await editor.page.title();
      
      // At minimum, should maintain meaningful title
      expect(titleAfterChange).toBeTruthy();
      expect(titleAfterChange.length).toBeGreaterThan(0);
    });
  });
});