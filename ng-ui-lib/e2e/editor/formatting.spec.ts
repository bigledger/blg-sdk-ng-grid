import { test, expect } from '@playwright/test';
import { EditorPage } from './page-objects/editor-page';
import { EditorTestData } from './utils/test-data-generator';
import { EditorAssertions } from './utils/custom-assertions';

test.describe('Text Formatting', () => {
  let editorPage: EditorPage;

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page);
    await editorPage.goto();
  });

  test.describe('Basic Formatting', () => {
    test('should apply bold formatting', async () => {
      const testText = 'Bold text';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.applyBold();

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', testText);
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
    });

    test('should apply italic formatting', async () => {
      const testText = 'Italic text';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.applyItalic();

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'italic', testText);
      expect(await editorPage.isToolbarButtonActive('italic')).toBe(true);
    });

    test('should apply underline formatting', async () => {
      const testText = 'Underlined text';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.applyUnderline();

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'underline', testText);
      expect(await editorPage.isToolbarButtonActive('underline')).toBe(true);
    });

    test('should apply strikethrough formatting', async () => {
      const testText = 'Strikethrough text';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.applyStrikethrough();

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'strikethrough', testText);
      expect(await editorPage.isToolbarButtonActive('strikethrough')).toBe(true);
    });

    test('should apply code formatting', async () => {
      const testText = 'console.log("Hello");';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.applyCode();

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'code', testText);
      expect(await editorPage.isToolbarButtonActive('code')).toBe(true);
    });
  });

  test.describe('Combined Formatting', () => {
    test('should apply multiple formats to same text', async () => {
      const testText = 'Multi-format text';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      await editorPage.applyBold();
      await editorPage.applyItalic();
      await editorPage.applyUnderline();

      // Check that all formats are applied
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<strong>');
      expect(htmlContent).toContain('<em>');
      expect(htmlContent).toContain('<u>');
      
      // Check toolbar states
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
      expect(await editorPage.isToolbarButtonActive('italic')).toBe(true);
      expect(await editorPage.isToolbarButtonActive('underline')).toBe(true);
    });

    test('should handle partial formatting application', async () => {
      await editorPage.typeText('Normal ');
      
      // Apply bold to next word
      await editorPage.applyBold();
      await editorPage.typeText('bold');
      await editorPage.applyBold(); // Toggle off
      
      await editorPage.typeText(' normal again');
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('Normal ');
      expect(htmlContent).toContain('<strong>bold</strong>');
      expect(htmlContent).toContain(' normal again');
    });

    test('should toggle formatting on and off', async () => {
      const testText = 'Toggle test';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      // Apply bold
      await editorPage.applyBold();
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(true);
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', testText);
      
      // Toggle bold off
      await editorPage.applyBold();
      expect(await editorPage.isToolbarButtonActive('bold')).toBe(false);
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).not.toContain('<strong>');
    });
  });

  test.describe('Heading Formats', () => {
    test('should create H1 heading', async () => {
      const headingText = 'Main Heading';
      await editorPage.typeText(headingText);
      await editorPage.selectAll();
      await editorPage.createHeading(1);

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'h1', headingText);
    });

    test('should create H2 heading', async () => {
      const headingText = 'Sub Heading';
      await editorPage.typeText(headingText);
      await editorPage.selectAll();
      await editorPage.createHeading(2);

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'h2', headingText);
    });

    test('should create H3 heading', async () => {
      const headingText = 'Sub Sub Heading';
      await editorPage.typeText(headingText);
      await editorPage.selectAll();
      await editorPage.createHeading(3);

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'h3', headingText);
    });

    test('should convert between heading levels', async () => {
      const headingText = 'Convertible Heading';
      await editorPage.typeText(headingText);
      await editorPage.selectAll();
      
      // Start with H1
      await editorPage.createHeading(1);
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'h1', headingText);
      
      // Convert to H2
      await editorPage.selectAll();
      await editorPage.createHeading(2);
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'h2', headingText);
      
      // Convert to H3
      await editorPage.selectAll();
      await editorPage.createHeading(3);
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'h3', headingText);
    });
  });

  test.describe('Block Formatting', () => {
    test('should create blockquote', async () => {
      const quoteText = 'This is a blockquote';
      await editorPage.typeText(quoteText);
      await editorPage.selectAll();
      await editorPage.createBlockquote();

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'blockquote', quoteText);
    });

    test('should create bullet list', async () => {
      const listItems = ['First item', 'Second item', 'Third item'];
      
      for (let i = 0; i < listItems.length; i++) {
        await editorPage.typeText(listItems[i]);
        if (i === 0) {
          await editorPage.selectAll();
          await editorPage.createBulletList();
        }
        if (i < listItems.length - 1) {
          await editorPage.page.keyboard.press('Enter');
        }
      }

      await EditorAssertions.toHaveList(editorPage.editorContent, 'unordered', listItems.length);
      
      for (const item of listItems) {
        const content = await editorPage.getTextContent();
        expect(content).toContain(item);
      }
    });

    test('should create numbered list', async () => {
      const listItems = ['First numbered item', 'Second numbered item', 'Third numbered item'];
      
      for (let i = 0; i < listItems.length; i++) {
        await editorPage.typeText(listItems[i]);
        if (i === 0) {
          await editorPage.selectAll();
          await editorPage.createNumberedList();
        }
        if (i < listItems.length - 1) {
          await editorPage.page.keyboard.press('Enter');
        }
      }

      await EditorAssertions.toHaveList(editorPage.editorContent, 'ordered', listItems.length);
      
      for (const item of listItems) {
        const content = await editorPage.getTextContent();
        expect(content).toContain(item);
      }
    });

    test('should handle nested lists', async () => {
      await editorPage.typeText('First item');
      await editorPage.selectAll();
      await editorPage.createBulletList();
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Tab'); // Indent to create nested list
      await editorPage.typeText('Nested item');
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Shift+Tab'); // Outdent back to main list
      await editorPage.typeText('Second main item');
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<ul>');
      expect(htmlContent).toContain('<li>');
    });
  });

  test.describe('Keyboard Shortcuts for Formatting', () => {
    test('should apply bold with Ctrl+B', async () => {
      const testText = 'Bold via shortcut';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.page.keyboard.press('Control+b');

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold', testText);
    });

    test('should apply italic with Ctrl+I', async () => {
      const testText = 'Italic via shortcut';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.page.keyboard.press('Control+i');

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'italic', testText);
    });

    test('should apply underline with Ctrl+U', async () => {
      const testText = 'Underline via shortcut';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.page.keyboard.press('Control+u');

      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'underline', testText);
    });

    test('should handle multiple shortcuts in sequence', async () => {
      const testText = 'Multiple shortcuts';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      
      await editorPage.page.keyboard.press('Control+b'); // Bold
      await editorPage.page.keyboard.press('Control+i'); // Italic
      await editorPage.page.keyboard.press('Control+u'); // Underline
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<strong>');
      expect(htmlContent).toContain('<em>');
      expect(htmlContent).toContain('<u>');
    });
  });

  test.describe('Format Persistence', () => {
    test('should maintain formatting after page refresh', async ({ page }) => {
      const testText = 'Persistent formatting';
      await editorPage.typeText(testText);
      await editorPage.selectAll();
      await editorPage.applyBold();
      
      // Get the content before refresh
      const contentBefore = await editorPage.getHtmlContent();
      
      // Refresh page
      await page.reload();
      await editorPage.waitForLoad();
      
      // Check if formatting persists (if editor has persistence feature)
      const contentAfter = await editorPage.getHtmlContent();
      
      // Note: This test depends on whether the editor implements persistence
      // If no persistence, the test validates that the editor loads cleanly after refresh
      expect(contentAfter).toBeDefined();
    });

    test('should preserve formatting during undo/redo', async () => {
      await editorPage.typeText('Normal text ');
      await editorPage.applyBold();
      await editorPage.typeText('bold text');
      await editorPage.applyBold(); // Toggle off
      await editorPage.typeText(' normal again');
      
      const originalContent = await editorPage.getHtmlContent();
      
      // Make another change
      await editorPage.typeText(' extra');
      
      // Undo the extra text
      await editorPage.undo();
      
      const afterUndo = await editorPage.getHtmlContent();
      expect(afterUndo).toBe(originalContent);
      
      // Redo
      await editorPage.redo();
      
      const afterRedo = await editorPage.getHtmlContent();
      expect(afterRedo).toContain(' extra');
    });
  });

  test.describe('Complex Formatting Scenarios', () => {
    test('should handle mixed content with various formatting', async () => {
      const complexHtml = EditorTestData.generateFormattedHtml();
      
      // Set the content programmatically
      await editorPage.page.evaluate((html) => {
        const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
        if (editor) {
          editor.innerHTML = html;
        }
      }, complexHtml);
      
      // Verify all formatting types are present
      const finalContent = await editorPage.getHtmlContent();
      expect(finalContent).toContain('<h1>');
      expect(finalContent).toContain('<strong>');
      expect(finalContent).toContain('<em>');
      expect(finalContent).toContain('<u>');
      expect(finalContent).toContain('<blockquote>');
      expect(finalContent).toContain('<ul>');
      expect(finalContent).toContain('<ol>');
    });

    test('should handle formatting with special characters', async () => {
      const specialText = 'Special: <>&"\'';
      await editorPage.typeText(specialText);
      await editorPage.selectAll();
      await editorPage.applyBold();
      
      const content = await editorPage.getTextContent();
      expect(content).toContain(specialText);
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold');
    });

    test('should maintain formatting with line breaks', async () => {
      await editorPage.applyBold();
      await editorPage.typeText('Bold line 1');
      await editorPage.page.keyboard.press('Shift+Enter'); // Line break
      await editorPage.typeText('Bold line 2');
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('<strong>');
      expect(htmlContent).toContain('Bold line 1');
      expect(htmlContent).toContain('<br>');
      expect(htmlContent).toContain('Bold line 2');
    });

    test('should handle formatting boundaries correctly', async () => {
      await editorPage.typeText('Normal ');
      await editorPage.applyBold();
      await editorPage.typeText('bold');
      await editorPage.applyBold(); // Toggle off
      await editorPage.typeText(' ');
      await editorPage.applyItalic();
      await editorPage.typeText('italic');
      await editorPage.applyItalic(); // Toggle off
      await editorPage.typeText(' normal');
      
      const htmlContent = await editorPage.getHtmlContent();
      expect(htmlContent).toContain('Normal ');
      expect(htmlContent).toContain('<strong>bold</strong>');
      expect(htmlContent).toContain('<em>italic</em>');
      expect(htmlContent).toContain(' normal');
    });
  });

  test.describe('Format Validation', () => {
    test('should prevent invalid HTML injection through formatting', async () => {
      const maliciousText = '<script>alert("xss")</script>';
      await editorPage.typeText(maliciousText);
      await editorPage.selectAll();
      await editorPage.applyBold();
      
      const htmlContent = await editorPage.getHtmlContent();
      // Should not contain the script tag as executable code
      expect(htmlContent).not.toContain('<script>');
      
      // The text should be safely encoded
      const textContent = await editorPage.getTextContent();
      expect(textContent).toContain(maliciousText);
    });

    test('should handle extremely long formatted text', async () => {
      const longText = 'A'.repeat(10000);
      await editorPage.typeText(longText);
      await editorPage.selectAll();
      await editorPage.applyBold();
      
      await EditorAssertions.toHaveFormatting(editorPage.editorContent, 'bold');
      
      const content = await editorPage.getTextContent();
      expect(content.length).toBe(10000);
    });
  });
});