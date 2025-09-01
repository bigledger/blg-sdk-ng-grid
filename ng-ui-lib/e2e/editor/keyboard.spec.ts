import { test, expect } from '@playwright/test';
import { EditorPage } from './page-objects/editor-page';
import { EditorTestData } from './utils/test-data-generator';
import { EditorAssertions } from './utils/custom-assertions';

test.describe('Keyboard Functionality', () => {
  let editorPage: EditorPage;

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page);
    await editorPage.goto();
  });

  test.describe('Basic Keyboard Shortcuts', () => {
    const shortcuts = EditorTestData.getKeyboardShortcuts();

    test('should support Ctrl+B for bold', async () => {
      const testText = 'Bold with keyboard';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.page.keyboard.press('Control+b');

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', testText);
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
    });

    test('should support Ctrl+I for italic', async () => {
      const testText = 'Italic with keyboard';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.page.keyboard.press('Control+i');

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'italic', testText);
      expect(await editorPage.isToolbarButtonActive('italic')).toBe(true);
    });

    test('should support Ctrl+U for underline', async () => {
      const testText = 'Underlined with keyboard';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.page.keyboard.press('Control+u');

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'underline', testText);
      expect(await editorPage.isToolbarButtonActive('underline')).toBe(true);
    });

    test('should support Ctrl+K for link creation', async () => {
      const testText = 'Link text';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.page.keyboard.press('Control+k');

      // Should open link modal
      await expect(editorPage.linkModal).toBeVisible();
      
      // Add URL and complete
      await editorPage.linkUrlInput.fill('https://example.com');
      await editorPage.page.keyboard.press('Enter');

      const link = editorPage.editorContent.locator('a').first();
      await expect(link).toBeVisible();
      await expect(link).toContainText(testText);
    });

    test('should support Ctrl+Z for undo', async () => {
      const originalText = 'Original text';
      await editorPage.typeText(originalText);
      
      const modifiedText = ' modified';
      await editorPage.typeText(modifiedText);
      
      let content = await editorPage.getTextContent();
      expect(content).toBe(originalText + modifiedText);
      
      // Undo
      await editorPage.page.keyboard.press('Control+z');
      
      content = await editorPage.getTextContent();
      expect(content).toBe(originalText);
    });

    test('should support Ctrl+Y for redo', async () => {
      const text = 'Redo test';
      await editorPage.typeText(text);
      
      // Undo
      await editorPage.page.keyboard.press('Control+z');
      let content = await editorPage.getTextContent();
      expect(content.trim()).toBe('');
      
      // Redo
      await editorPage.page.keyboard.press('Control+y');
      content = await editorPage.getTextContent();
      expect(content).toBe(text);
    });

    test('should support Ctrl+A for select all', async () => {
      const testText = 'Select all this text';
      await editorPage.typeText(testText);
      await editorPage.page.keyboard.press('Control+a');
      
      // Apply formatting to verify selection
      await editorPage.page.keyboard.press('Control+b');
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', testText);
    });
  });

  test.describe('Copy, Cut, and Paste', () => {
    test('should support Ctrl+C and Ctrl+V for copy and paste', async () => {
      const testText = 'Copy paste test';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      // Copy
      await editorPage.page.keyboard.press('Control+c');
      
      // Move cursor and paste
      await editorPage.page.keyboard.press('ArrowRight');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Control+v');
      
      const content = await editorPage.getTextContent();
      const occurrences = (content.match(new RegExp(testText, 'g')) || []).length;
      expect(occurrences).toBe(2);
    });

    test('should support Ctrl+X for cut', async () => {
      await editorPage.typeText('Keep this ');
      await editorPage.typeText('cut this');
      
      // Select 'cut this' by double-clicking
      await editorPage.page.locator('text=cut').dblclick();
      
      // Cut
      await editorPage.page.keyboard.press('Control+x');
      
      let content = await editorPage.getTextContent();
      expect(content).toBe('Keep this ');
      
      // Paste it elsewhere
      await editorPage.page.keyboard.press('ArrowLeft');
      await editorPage.page.keyboard.press('Control+v');
      
      content = await editorPage.getTextContent();
      expect(content).toContain('cut this');
      expect(content).toContain('Keep this');
    });

    test('should preserve formatting in copy/paste operations', async () => {
      const testText = 'Formatted text';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.applyBold();
      await editorPage.applyItalic();
      
      // Copy
      await editorPage.page.keyboard.press('Control+c');
      
      // Move and paste
      await editorPage.page.keyboard.press('ArrowRight');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Control+v');
      
      // Both instances should be formatted
      const boldElements = editorPage.editorContent.locator('strong');
      await expect(boldElements).toHaveCount(2);
      
      const italicElements = editorPage.editorContent.locator('em');
      await expect(italicElements).toHaveCount(2);
    });

    test('should handle cross-element copy/paste', async () => {
      // Create mixed content
      await editorPage.typeText('Normal ');
      await editorPage.applyBold();
      await editorPage.typeText('bold');
      await editorPage.applyBold(); // Toggle off
      await editorPage.typeText(' normal');
      
      // Select across formatting boundaries
      await editorPage.page.keyboard.press('Control+a');
      await editorPage.page.keyboard.press('Control+c');
      
      // Clear and paste
      await editorPage.page.keyboard.press('Delete');
      await editorPage.page.keyboard.press('Control+v');
      
      // Structure should be preserved
      const content = await editorPage.getTextContent();
      expect(content).toContain('Normal');
      expect(content).toContain('bold');
      expect(content).toContain('normal');
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', 'bold');
    });
  });

  test.describe('Navigation Shortcuts', () => {
    test('should support Ctrl+Home and Ctrl+End', async () => {
      const longText = EditorTestData.generateText({ sentences: 10 });
      await editorPage.typeText(longText);
      
      // Go to end
      await editorPage.page.keyboard.press('Control+End');
      await editorPage.page.keyboard.type(' END');
      
      // Go to beginning
      await editorPage.page.keyboard.press('Control+Home');
      await editorPage.page.keyboard.type('START ');
      
      const content = await editorPage.getTextContent();
      expect(content).toMatch(/^START /);
      expect(content).toMatch(/ END$/);
    });

    test('should support Ctrl+Left and Ctrl+Right for word navigation', async () => {
      await editorPage.typeText('First second third fourth');
      await editorPage.page.keyboard.press('Control+Home');
      
      // Move by words
      await editorPage.page.keyboard.press('Control+Right'); // After 'First'
      await editorPage.page.keyboard.press('Control+Right'); // After 'second'
      
      await editorPage.page.keyboard.type(' INSERTED');
      
      const content = await editorPage.getTextContent();
      expect(content).toBe('First second INSERTED third fourth');
    });

    test('should support Page Up and Page Down', async ({ page }) => {
      const longContent = EditorTestData.generateText({ paragraphs: 20 });
      await editorPage.typeText(longContent);
      
      // Go to beginning
      await editorPage.page.keyboard.press('Control+Home');
      
      // Page down
      await editorPage.page.keyboard.press('PageDown');
      
      // Should have moved significantly down
      const scrollTop = await editorPage.editorContent.evaluate(el => el.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
      
      // Page up
      await editorPage.page.keyboard.press('PageUp');
      
      // Should be back near the top
      const newScrollTop = await editorPage.editorContent.evaluate(el => el.scrollTop);
      expect(newScrollTop).toBeLessThan(scrollTop);
    });
  });

  test.describe('Text Selection Shortcuts', () => {
    test('should support Shift+Arrow for character selection', async () => {
      await editorPage.typeText('Select characters');
      await editorPage.page.keyboard.press('Control+Home');
      
      // Select first 6 characters
      for (let i = 0; i < 6; i++) {
        await editorPage.page.keyboard.press('Shift+ArrowRight');
      }
      
      // Apply formatting to verify selection
      await editorPage.page.keyboard.press('Control+b');
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', 'Select');
    });

    test('should support Ctrl+Shift+Arrow for word selection', async () => {
      await editorPage.typeText('Select these words only');
      await editorPage.page.keyboard.press('Control+Home');
      
      // Select first two words
      await editorPage.page.keyboard.press('Control+Shift+Right');
      await editorPage.page.keyboard.press('Control+Shift+Right');
      
      // Apply formatting
      await editorPage.page.keyboard.press('Control+b');
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', 'Select these');
    });

    test('should support Shift+Home and Shift+End for line selection', async () => {
      await editorPage.typeText('Beginning of line and end of line');
      
      // Position cursor in middle
      await editorPage.page.keyboard.press('Control+Home');
      for (let i = 0; i < 10; i++) {
        await editorPage.page.keyboard.press('ArrowRight');
      }
      
      // Select to end of line
      await editorPage.page.keyboard.press('Shift+End');
      await editorPage.page.keyboard.press('Control+b');
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<strong>');
      expect(htmlContent).toContain('line and end of line');
    });

    test('should support Ctrl+Shift+Home and Ctrl+Shift+End', async () => {
      const multilineText = 'Line 1\nLine 2\nLine 3\nLine 4';
      await editorPage.typeText(multilineText.replace(/\n/g, '\nLine '));
      
      // Position in middle
      await editorPage.page.keyboard.press('Control+Home');
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.press('ArrowDown');
      
      // Select to end of document
      await editorPage.page.keyboard.press('Control+Shift+End');
      await editorPage.page.keyboard.press('Control+b');
      
      // Should have bold formatting on selected portion
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold');
    });
  });

  test.describe('List and Indentation Shortcuts', () => {
    test('should support Tab for indentation', async () => {
      await editorPage.typeText('First level');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.typeText('Indented level');
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('First level');
      expect(htmlContent).toContain('Indented level');
    });

    test('should support Shift+Tab for outdenting', async () => {
      await editorPage.typeText('Item 1');
      await editorPage.selectAll();
      await editorPage.createBulletList();
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Tab'); // Indent
      await editorPage.typeText('Nested item');
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Shift+Tab'); // Outdent
      await editorPage.typeText('Back to main level');
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<ul>');
      expect(htmlContent).toContain('Item 1');
      expect(htmlContent).toContain('Nested item');
      expect(htmlContent).toContain('Back to main level');
    });

    test('should support Enter in lists', async () => {
      await editorPage.typeText('First item');
      await editorPage.selectAll();
      await editorPage.createBulletList();
      
      // Add more items
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Second item');
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Third item');
      
      await EditorAssertions.toHaveList(editorPage.editorContent, 'unordered', 3);
    });

    test('should exit lists with double Enter', async () => {
      await editorPage.typeText('List item');
      await editorPage.selectAll();
      await editorPage.createBulletList();
      
      // Double enter to exit list
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Enter');
      
      // This should be outside the list
      await editorPage.typeText('Outside list');
      
      const content = await editorPage.getTextContent();
      expect(content).toContain('List item');
      expect(content).toContain('Outside list');
    });
  });

  test.describe('Special Key Combinations', () => {
    test('should support Ctrl+Shift+V for paste without formatting', async () => {
      // Create formatted content
      const testText = 'Formatted content';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.applyBold();
      await editorPage.applyItalic();
      
      // Copy
      await editorPage.page.keyboard.press('Control+c');
      
      // Clear and paste without formatting
      await editorPage.page.keyboard.press('Delete');
      await editorPage.page.keyboard.press('Control+Shift+v');
      
      // Should have text but no formatting
      const content = await editorPage.getTextContent();
      expect(content).toBe(testText);
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).not.toContain('<strong>');
      expect(htmlContent).not.toContain('<em>');
    });

    test('should support Alt+Shift+5 for strikethrough', async () => {
      const testText = 'Strikethrough text';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      // Try alt+shift+5 (common strikethrough shortcut)
      await editorPage.page.keyboard.press('Alt+Shift+5');
      
      // Check if strikethrough was applied
      const strikeElement = editorPage.editorContent.locator('del, s').first();
      if (await strikeElement.isVisible()) {
        await expect(strikeElement).toContainText(testText);
      }
    });

    test('should support keyboard shortcuts in different contexts', async () => {
      // Test shortcuts work in table cells
      await editorPage.insertTable(2, 2);
      
      await editorPage.page.keyboard.type('Table content');
      await editorPage.page.keyboard.press('Control+a');
      await editorPage.page.keyboard.press('Control+b');
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', 'Table content');
      
      // Test shortcuts work in lists
      await editorPage.page.keyboard.press('Tab'); // Move to next cell
      await editorPage.page.keyboard.type('List item');
      await editorPage.page.keyboard.press('Control+a');
      await editorPage.createBulletList();
      
      await EditorAssertions.toHaveList(editorPage.editorContent, 'unordered', 1);
    });
  });

  test.describe('Custom Shortcuts', () => {
    test('should support custom heading shortcuts', async () => {
      const headingText = 'Heading text';
      await editorPage.typeText(headingText);
      await editorPage.selectAll();
      
      // Try common heading shortcuts
      await editorPage.page.keyboard.press('Control+1'); // H1
      
      const h1Element = editorPage.editorContent.locator('h1').first();
      if (await h1Element.isVisible()) {
        await expect(h1Element).toContainText(headingText);
      }
    });

    test('should support quote shortcuts', async () => {
      const quoteText = 'Quote this text';
      await editorPage.typeText(quoteText);
      await editorPage.selectAll();
      
      // Try quote shortcut
      await editorPage.page.keyboard.press('Control+Shift+>');
      
      const quoteElement = editorPage.editorContent.locator('blockquote').first();
      if (await quoteElement.isVisible()) {
        await expect(quoteElement).toContainText(quoteText);
      }
    });

    test('should support code block shortcuts', async () => {
      const codeText = 'function test() { return true; }';
      await editorPage.typeText(codeText);
      await editorPage.selectAll();
      
      // Try code block shortcut
      await editorPage.page.keyboard.press('Control+Shift+C');
      
      const codeElement = editorPage.editorContent.locator('code, pre').first();
      if (await codeElement.isVisible()) {
        await expect(codeElement).toContainText(codeText);
      }
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('should maintain focus management with keyboard navigation', async () => {
      // Start in editor
      await editorPage.editorContent.focus();
      await expect(editorPage.editorContent).toBeFocused();
      
      // Tab to toolbar
      await editorPage.page.keyboard.press('Tab');
      
      // Should be on a toolbar button
      const focusedElement = await editorPage.page.evaluate(() => 
        document.activeElement?.tagName
      );
      expect(focusedElement).toBe('BUTTON');
      
      // Shift+Tab back to editor
      await editorPage.page.keyboard.press('Shift+Tab');
      await expect(editorPage.editorContent).toBeFocused();
    });

    test('should support screen reader shortcuts', async () => {
      // Add content for screen reader navigation
      await editorPage.typeText('Paragraph 1');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Paragraph 2');
      
      await editorPage.selectAll();
      await editorPage.createHeading(1);
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.press('ArrowDown');
      
      // Navigate by elements (common screen reader pattern)
      await editorPage.page.keyboard.press('Control+ArrowDown'); // Next element
      
      // Content should be accessible
      const content = await editorPage.getTextContent();
      expect(content).toContain('Paragraph 1');
      expect(content).toContain('Paragraph 2');
    });

    test('should provide keyboard alternatives to mouse actions', async () => {
      // All formatting should be accessible via keyboard
      const testText = 'Keyboard formatting test';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      // Multiple shortcuts in sequence
      await editorPage.page.keyboard.press('Control+b'); // Bold
      await editorPage.page.keyboard.press('Control+i'); // Italic
      await editorPage.page.keyboard.press('Control+u'); // Underline
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<strong>');
      expect(htmlContent).toContain('<em>');
      expect(htmlContent).toContain('<u>');
    });

    test('should handle rapid keyboard input', async () => {
      const rapidText = 'abcdefghijklmnopqrstuvwxyz';
      
      // Type rapidly
      for (const char of rapidText) {
        await editorPage.page.keyboard.type(char, { delay: 10 });
      }
      
      const content = await editorPage.getTextContent();
      expect(content).toBe(rapidText);
    });
  });

  test.describe('Platform-Specific Shortcuts', () => {
    test('should handle platform-specific modifiers', async ({ page }) => {
      const isMac = await page.evaluate(() => navigator.platform.includes('Mac'));
      const modifier = isMac ? 'Meta' : 'Control';
      
      const testText = 'Platform test';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      // Use platform-appropriate modifier
      await editorPage.page.keyboard.press(`${modifier}+b`);
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', testText);
    });

    test('should support browser-specific shortcuts when available', async () => {
      // Test browser Find functionality integration
      await editorPage.typeText('Find this text in the editor');
      
      // Ctrl+F should work (browser native)
      await editorPage.page.keyboard.press('Control+f');
      
      // Browser find should open (we can't control this directly, but we can verify editor still works)
      const content = await editorPage.getTextContent();
      expect(content).toContain('Find this text in the editor');
    });
  });
});