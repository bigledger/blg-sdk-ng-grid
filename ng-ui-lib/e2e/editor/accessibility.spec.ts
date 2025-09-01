import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';
import { EditorPage } from './page-objects/editor-page';
import { EditorTestData } from './utils/test-data-generator';
import { EditorAssertions } from './utils/custom-assertions';

test.describe('Editor Accessibility', () => {
  let editorPage: EditorPage;

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page);
    await editorPage.goto();
    
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  });

  test.describe('WCAG Compliance', () => {
    test('should pass basic accessibility audit', async ({ page }) => {
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test('should pass accessibility audit with content', async ({ page }) => {
      // Add various content types
      await editorPage.typeText('Accessibility test content');
      await editorPage.page.keyboard.press('Enter');
      
      await editorPage.selectText('Bold text');
      await editorPage.applyBold();
      await editorPage.page.keyboard.press('ArrowRight');
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.insertTable(2, 2);
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.insertLink('https://example.com', 'Example link');
      
      // Run accessibility audit
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test('should have proper heading structure', async () => {
      // Create heading hierarchy
      await editorPage.typeText('Main Title');
      await editorPage.selectAll();
      await editorPage.createHeading(1);
      
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Section Title');
      await editorPage.selectAll();
      await editorPage.createHeading(2);
      
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Subsection Title');
      await editorPage.selectAll();
      await editorPage.createHeading(3);
      
      // Verify heading structure
      const h1 = editorPage.editorContent.locator('h1');
      const h2 = editorPage.editorContent.locator('h2');
      const h3 = editorPage.editorContent.locator('h3');
      
      await expect(h1).toHaveCount(1);
      await expect(h2).toHaveCount(1);
      await expect(h3).toHaveCount(1);
      
      // Check heading order
      await expect(h1).toContainText('Main Title');
      await expect(h2).toContainText('Section Title');
      await expect(h3).toContainText('Subsection Title');
    });

    test('should provide sufficient color contrast', async ({ page }) => {
      // Test with default theme
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
    });

    test('should maintain contrast in different themes', async ({ page }) => {
      // Test dark theme if available
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        
        // Wait for theme to apply
        await page.waitForTimeout(1000);
        
        // Check contrast in dark theme
        await checkA11y(page, null, {
          rules: {
            'color-contrast': { enabled: true }
          }
        });
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support full keyboard navigation', async () => {
      await EditorAssertions.toSupportKeyboardNavigation(editorPage.page);
    });

    test('should have logical tab order', async () => {
      // Start from editor
      await editorPage.editorContent.focus();
      await expect(editorPage.editorContent).toBeFocused();
      
      // Tab through interactive elements
      const focusableElements = [];
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts) {
        await editorPage.page.keyboard.press('Tab');
        attempts++;
        
        const activeElement = await editorPage.page.evaluate(() => {
          const el = document.activeElement;
          return el ? {
            tagName: el.tagName,
            testId: el.getAttribute('data-testid'),
            ariaLabel: el.getAttribute('aria-label'),
            title: el.getAttribute('title')
          } : null;
        });
        
        if (activeElement) {
          focusableElements.push(activeElement);
        }
        
        // Stop if we've cycled back to the editor
        if (activeElement?.testId === 'blg-editor' || 
            activeElement?.tagName === 'BODY') {
          break;
        }
      }
      
      // Should have focused on toolbar buttons
      const hasToolbarButtons = focusableElements.some(el => 
        el.testId?.includes('toolbar-')
      );
      expect(hasToolbarButtons).toBe(true);
    });

    test('should support arrow key navigation in toolbar', async () => {
      // Focus first toolbar button
      await editorPage.boldButton.focus();
      await expect(editorPage.boldButton).toBeFocused();
      
      // Arrow right should move to next button
      await editorPage.page.keyboard.press('ArrowRight');
      
      const focusedAfterArrow = await editorPage.page.evaluate(() => 
        document.activeElement?.getAttribute('data-testid')
      );
      expect(focusedAfterArrow).toBeTruthy();
      expect(focusedAfterArrow).not.toBe('toolbar-bold');
    });

    test('should support Enter and Space for button activation', async () => {
      const testText = 'Button activation test';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      // Focus bold button
      await editorPage.boldButton.focus();
      await editorPage.page.keyboard.press('Enter');
      
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
      
      // Test Space key
      await editorPage.italicButton.focus();
      await editorPage.page.keyboard.press('Space');
      
      expect(await editorPage.isToolbarButtonActive('italic')).toBe(true);
    });

    test('should support Escape key to close modals', async () => {
      // Open link modal
      await editorPage.linkButton.click();
      await expect(editorPage.linkModal).toBeVisible();
      
      // Escape should close it
      await editorPage.page.keyboard.press('Escape');
      await expect(editorPage.linkModal).not.toBeVisible();
    });

    test('should trap focus in modals', async () => {
      await editorPage.linkButton.click();
      await expect(editorPage.linkModal).toBeVisible();
      
      // Focus should be trapped within modal
      const urlInput = editorPage.linkUrlInput;
      await expect(urlInput).toBeFocused();
      
      // Tab should cycle within modal
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.press('Tab');
      
      // Should still be within modal
      const focusedElement = await editorPage.page.evaluate(() => {
        const modal = document.querySelector('[data-testid="link-modal"]');
        const focused = document.activeElement;
        return modal?.contains(focused);
      });
      expect(focusedElement).toBe(true);
    });
  });

  test.describe('ARIA Labels and Roles', () => {
    test('should have proper ARIA roles', async () => {
      // Editor should have textbox role
      await expect(editorPage.editorContent).toHaveAttribute('role', 'textbox');
      
      // Toolbar should have toolbar role
      await expect(editorPage.toolbar).toHaveAttribute('role', 'toolbar');
    });

    test('should have descriptive ARIA labels for buttons', async () => {
      const buttons = [
        { element: editorPage.boldButton, expectedText: /bold/i },
        { element: editorPage.italicButton, expectedText: /italic/i },
        { element: editorPage.underlineButton, expectedText: /underline/i },
        { element: editorPage.linkButton, expectedText: /link/i },
        { element: editorPage.imageButton, expectedText: /image/i },
        { element: editorPage.undoButton, expectedText: /undo/i },
        { element: editorPage.redoButton, expectedText: /redo/i }
      ];

      for (const { element, expectedText } of buttons) {
        const ariaLabel = await element.getAttribute('aria-label');
        const title = await element.getAttribute('title');
        const textContent = await element.textContent();
        
        const hasDescriptiveText = 
          (ariaLabel && expectedText.test(ariaLabel)) ||
          (title && expectedText.test(title)) ||
          (textContent && expectedText.test(textContent));
        
        expect(hasDescriptiveText).toBe(true);
      }
    });

    test('should indicate button states with ARIA', async () => {
      const testText = 'ARIA state test';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      // Bold button should show unpressed initially
      let ariaPressed = await editorPage.boldButton.getAttribute('aria-pressed');
      expect(ariaPressed).toBe('false');
      
      // Apply bold
      await editorPage.boldButton.click();
      
      // Should show pressed state
      ariaPressed = await editorPage.boldButton.getAttribute('aria-pressed');
      expect(ariaPressed).toBe('true');
    });

    test('should provide ARIA labels for form inputs', async () => {
      // Open link modal
      await editorPage.linkButton.click();
      
      // URL input should have label
      const urlLabel = await editorPage.linkUrlInput.getAttribute('aria-label');
      const urlLabelledBy = await editorPage.linkUrlInput.getAttribute('aria-labelledby');
      expect(urlLabel || urlLabelledBy).toBeTruthy();
      
      // Text input should have label
      const textLabel = await editorPage.linkTextInput.getAttribute('aria-label');
      const textLabelledBy = await editorPage.linkTextInput.getAttribute('aria-labelledby');
      expect(textLabel || textLabelledBy).toBeTruthy();
    });

    test('should provide ARIA descriptions for complex elements', async () => {
      // Create a table
      await editorPage.insertTable(2, 2);
      
      const table = editorPage.editorContent.locator('table').first();
      const ariaDescribedBy = await table.getAttribute('aria-describedby');
      const ariaLabel = await table.getAttribute('aria-label');
      
      // Table should have some accessibility description
      expect(ariaDescribedBy || ariaLabel).toBeTruthy();
    });

    test('should announce dynamic content changes', async () => {
      // Look for live region announcements
      const liveRegion = editorPage.page.locator('[aria-live]');
      
      if (await liveRegion.isVisible()) {
        // Make a change that should be announced
        await editorPage.typeText('New content');
        await editorPage.selectAll();
        await editorPage.applyBold();
        
        // Check if live region was updated
        const liveContent = await liveRegion.textContent();
        expect(liveContent).toBeTruthy();
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have semantic HTML structure', async () => {
      // Create structured content
      await editorPage.typeText('Main heading');
      await editorPage.selectAll();
      await editorPage.createHeading(1);
      
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Paragraph content');
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('List item 1');
      await editorPage.selectAll();
      await editorPage.createBulletList();
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('List item 2');
      
      // Verify semantic structure
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<h1>');
      expect(htmlContent).toContain('<p>');
      expect(htmlContent).toContain('<ul>');
      expect(htmlContent).toContain('<li>');
    });

    test('should provide alternative text for images', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ url: '/uploads/test-image.png' })
          });
        } else {
          route.continue();
        }
      });

      const altText = 'Descriptive alt text for accessibility';
      await editorPage.imageButton.click();
      await editorPage.imageFileInput.setInputFiles({
        name: 'test.png',
        mimeType: 'image/png',
        buffer: Buffer.from('image-data')
      });
      await editorPage.imageAltInput.fill(altText);
      await editorPage.page.locator('[data-testid="insert-image-button"]').click();
      
      const image = editorPage.editorContent.locator('img').first();
      await expect(image).toHaveAttribute('alt', altText);
    });

    test('should provide accessible table headers', async () => {
      await editorPage.insertTable(3, 3);
      
      // Add content to first row (headers)
      await editorPage.page.keyboard.type('Header 1');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Header 2');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Header 3');
      
      // Check table accessibility
      const table = editorPage.editorContent.locator('table').first();
      const headers = table.locator('th');
      
      if (await headers.first().isVisible()) {
        await expect(headers).toHaveCount(3);
        
        // Headers should have scope attribute
        const firstHeader = headers.first();
        const scope = await firstHeader.getAttribute('scope');
        expect(scope).toBe('col');
      }
    });

    test('should support screen reader navigation landmarks', async () => {
      // Check for proper landmark roles
      const main = editorPage.page.locator('[role="main"], main');
      const toolbar = editorPage.page.locator('[role="toolbar"]');
      
      if (await main.isVisible()) {
        await expect(main).toBeVisible();
      }
      await expect(toolbar).toBeVisible();
    });
  });

  test.describe('Focus Management', () => {
    test('should maintain focus visibility', async () => {
      // Focus on editor
      await editorPage.editorContent.focus();
      
      // Check focus indicator is visible
      const focusIndicator = await editorPage.editorContent.evaluate(el => {
        const styles = getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          boxShadow: styles.boxShadow
        };
      });
      
      // Should have some form of focus indicator
      const hasFocusIndicator = 
        focusIndicator.outline !== 'none' ||
        focusIndicator.outlineWidth !== '0px' ||
        focusIndicator.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    });

    test('should restore focus after modal interactions', async () => {
      // Focus editor first
      await editorPage.editorContent.focus();
      await expect(editorPage.editorContent).toBeFocused();
      
      // Open and close modal
      await editorPage.linkButton.click();
      await expect(editorPage.linkModal).toBeVisible();
      
      await editorPage.page.keyboard.press('Escape');
      await expect(editorPage.linkModal).not.toBeVisible();
      
      // Focus should return to appropriate element
      const focusedElement = await editorPage.page.evaluate(() => 
        document.activeElement?.getAttribute('contenteditable') === 'true' ||
        document.activeElement?.getAttribute('data-testid')?.includes('toolbar-')
      );
      expect(focusedElement).toBe(true);
    });

    test('should handle focus during dynamic content updates', async () => {
      await editorPage.typeText('Focus test content');
      await editorPage.page.keyboard.press('Control+Home');
      
      // Insert content that might affect focus
      await editorPage.insertTable(2, 2);
      
      // Focus should be in a reasonable location
      const focusedElement = await editorPage.page.evaluate(() => {
        const activeEl = document.activeElement;
        return activeEl?.tagName.toLowerCase();
      });
      
      // Should be in table cell or editor
      expect(['td', 'th', 'div', 'body'].includes(focusedElement)).toBe(true);
    });
  });

  test.describe('Error Handling and User Feedback', () => {
    test('should provide accessible error messages', async () => {
      // Try to create invalid link
      await editorPage.linkButton.click();
      await editorPage.linkUrlInput.fill('invalid-url');
      await editorPage.page.locator('[data-testid="insert-link-button"]').click();
      
      // Error message should be accessible
      const errorMessage = editorPage.page.locator('[role="alert"], [aria-live="assertive"]');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        expect(errorText).toBeTruthy();
        expect(errorText.length).toBeGreaterThan(0);
      }
    });

    test('should associate error messages with form fields', async () => {
      await editorPage.linkButton.click();
      await editorPage.linkUrlInput.fill('invalid');
      await editorPage.page.locator('[data-testid="insert-link-button"]').click();
      
      // Check if input has aria-describedby pointing to error
      const ariaDescribedBy = await editorPage.linkUrlInput.getAttribute('aria-describedby');
      if (ariaDescribedBy) {
        const errorElement = editorPage.page.locator(`#${ariaDescribedBy}`);
        await expect(errorElement).toBeVisible();
      }
    });

    test('should provide status updates for long operations', async ({ page }) => {
      // Mock slow upload
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          setTimeout(() => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({ url: '/uploads/slow-image.png' })
            });
          }, 2000);
        } else {
          route.continue();
        }
      });

      await editorPage.imageButton.click();
      await editorPage.imageFileInput.setInputFiles({
        name: 'test.png',
        mimeType: 'image/png',
        buffer: Buffer.from('data')
      });
      
      await editorPage.page.locator('[data-testid="insert-image-button"]').click();
      
      // Should show loading status
      const statusRegion = editorPage.page.locator('[aria-live="polite"], [role="status"]');
      if (await statusRegion.isVisible()) {
        const statusText = await statusRegion.textContent();
        expect(statusText).toMatch(/loading|uploading|processing/i);
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Run accessibility audit on mobile viewport
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test('should have appropriate touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check toolbar button sizes
      const buttonSize = await editorPage.boldButton.boundingBox();
      expect(buttonSize?.width).toBeGreaterThanOrEqual(44); // WCAG minimum
      expect(buttonSize?.height).toBeGreaterThanOrEqual(44);
    });

    test('should support mobile screen readers', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Verify semantic structure is maintained
      await editorPage.typeText('Mobile accessibility test');
      await editorPage.selectAll();
      await editorPage.applyBold();
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<strong>');
      
      // Verify ARIA attributes are present
      await expect(editorPage.editorContent).toHaveAttribute('role', 'textbox');
      await expect(editorPage.toolbar).toHaveAttribute('role', 'toolbar');
    });
  });

  test.describe('High Contrast and Custom Themes', () => {
    test('should work with high contrast themes', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              border: 1px solid #000 !important;
              background: #fff !important;
              color: #000 !important;
            }
          }
        `
      });
      
      await page.emulateMedia({ prefersColorScheme: 'light', prefersReducedMotion: 'reduce' });
      
      // Editor should still be functional
      await editorPage.typeText('High contrast test');
      await editorPage.selectAll();
      await editorPage.applyBold();
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold');
    });

    test('should support reduced motion preferences', async ({ page }) => {
      await page.emulateMedia({ prefersReducedMotion: 'reduce' });
      
      // Animations should be reduced or disabled
      await editorPage.linkButton.click();
      await expect(editorPage.linkModal).toBeVisible();
      
      // Modal should appear without transitions when reduced motion is preferred
      const transitionDuration = await editorPage.linkModal.evaluate(el => 
        getComputedStyle(el).transitionDuration
      );
      
      // Should be 0s or very short
      expect(transitionDuration === '0s' || parseFloat(transitionDuration) < 0.1).toBe(true);
    });
  });
});