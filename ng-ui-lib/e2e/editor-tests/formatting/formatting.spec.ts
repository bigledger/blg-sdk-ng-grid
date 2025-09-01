import { test, expect } from '@playwright/test';
import { EditorTestBase } from '../editor-base.spec';

test.describe('BLG Editor - Formatting Features', () => {
  let editor: EditorTestBase;

  test.beforeEach(async ({ page }) => {
    editor = new EditorTestBase(page);
    await editor.navigateToEditor();
    await editor.clearEditor();
  });

  test.describe('Basic Text Formatting', () => {
    test('should apply bold formatting', async () => {
      await editor.typeInEditor('This text will be bold');
      await editor.selectAllText();
      await editor.toggleBold();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/<(strong|b)>.*This text will be bold.*<\/(strong|b)>/);
    });

    test('should apply italic formatting', async () => {
      await editor.typeInEditor('This text will be italic');
      await editor.selectAllText();
      await editor.toggleItalic();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/<(em|i)>.*This text will be italic.*<\/(em|i)>/);
    });

    test('should apply underline formatting', async () => {
      await editor.typeInEditor('This text will be underlined');
      await editor.selectAllText();
      await editor.toggleUnderline();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/<u>.*This text will be underlined.*<\/u>/);
    });

    test('should apply strikethrough formatting', async () => {
      await editor.typeInEditor('This text will be struck through');
      await editor.selectAllText();
      
      // Use toolbar button for strikethrough
      await editor.page.click('[data-testid="toolbar-strikethrough"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/<(s|strike|del)>.*This text will be struck through.*<\/(s|strike|del)>/);
    });

    test('should combine multiple formats', async () => {
      await editor.typeInEditor('Multi-formatted text');
      await editor.selectAllText();
      
      await editor.toggleBold();
      await editor.toggleItalic();
      await editor.toggleUnderline();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('Multi-formatted text');
      
      // Should contain all three formatting tags
      expect(htmlContent).toMatch(/<(strong|b)>/);
      expect(htmlContent).toMatch(/<(em|i)>/);
      expect(htmlContent).toMatch(/<u>/);
    });

    test('should remove formatting when toggled again', async () => {
      await editor.typeInEditor('Toggle formatting off');
      await editor.selectAllText();
      
      // Apply bold
      await editor.toggleBold();
      let htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/<(strong|b)>/);
      
      // Remove bold
      await editor.selectAllText();
      await editor.toggleBold();
      htmlContent = await editor.getEditorContent();
      expect(htmlContent).not.toMatch(/<(strong|b)>/);
    });
  });

  test.describe('Font Family and Size', () => {
    test('should change font family', async () => {
      await editor.typeInEditor('Font family test');
      await editor.selectAllText();
      
      // Click font family dropdown
      await editor.page.click('[data-testid="font-family-dropdown"]');
      await editor.page.click('[data-testid="font-family-option-serif"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('font-family');
    });

    test('should change font size', async () => {
      await editor.typeInEditor('Font size test');
      await editor.selectAllText();
      
      // Click font size dropdown
      await editor.page.click('[data-testid="font-size-dropdown"]');
      await editor.page.click('[data-testid="font-size-option-18"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('font-size');
    });

    test('should handle custom font sizes', async () => {
      await editor.typeInEditor('Custom font size');
      await editor.selectAllText();
      
      // Enter custom font size
      await editor.page.click('[data-testid="font-size-custom-input"]');
      await editor.page.fill('[data-testid="font-size-custom-input"]', '24');
      await editor.page.keyboard.press('Enter');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('24px');
    });
  });

  test.describe('Text and Background Colors', () => {
    test('should apply text color', async () => {
      await editor.typeInEditor('Colored text');
      await editor.selectAllText();
      
      // Open color picker
      await editor.page.click('[data-testid="text-color-picker"]');
      await editor.page.click('[data-testid="color-option-red"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('color');
    });

    test('should apply background color', async () => {
      await editor.typeInEditor('Highlighted text');
      await editor.selectAllText();
      
      // Open background color picker
      await editor.page.click('[data-testid="background-color-picker"]');
      await editor.page.click('[data-testid="color-option-yellow"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('background-color');
    });

    test('should handle custom colors', async () => {
      await editor.typeInEditor('Custom color text');
      await editor.selectAllText();
      
      // Open color picker and enter custom color
      await editor.page.click('[data-testid="text-color-picker"]');
      await editor.page.fill('[data-testid="custom-color-input"]', '#ff6b6b');
      await editor.page.click('[data-testid="apply-custom-color"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('#ff6b6b');
    });

    test('should remove colors', async () => {
      await editor.typeInEditor('Remove color text');
      await editor.selectAllText();
      
      // Apply color
      await editor.page.click('[data-testid="text-color-picker"]');
      await editor.page.click('[data-testid="color-option-blue"]');
      
      // Remove color
      await editor.selectAllText();
      await editor.page.click('[data-testid="remove-text-color"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).not.toContain('color: blue');
    });
  });

  test.describe('Paragraph Alignment', () => {
    test('should align text left', async () => {
      await editor.typeInEditor('Left aligned text');
      await editor.page.keyboard.press('Control+a');
      await editor.page.click('[data-testid="align-left"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/text-align:\s*left|align="left"/);
    });

    test('should align text center', async () => {
      await editor.typeInEditor('Center aligned text');
      await editor.page.keyboard.press('Control+a');
      await editor.page.click('[data-testid="align-center"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/text-align:\s*center|align="center"/);
    });

    test('should align text right', async () => {
      await editor.typeInEditor('Right aligned text');
      await editor.page.keyboard.press('Control+a');
      await editor.page.click('[data-testid="align-right"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/text-align:\s*right|align="right"/);
    });

    test('should justify text', async () => {
      await editor.typeInEditor('Justified text content that should be aligned to both left and right margins');
      await editor.page.keyboard.press('Control+a');
      await editor.page.click('[data-testid="align-justify"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/text-align:\s*justify|align="justify"/);
    });
  });

  test.describe('Lists', () => {
    test('should create unordered list', async () => {
      await editor.typeInEditor('First item');
      await editor.page.click('[data-testid="create-unordered-list"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<ul>');
      expect(htmlContent).toContain('<li>');
    });

    test('should create ordered list', async () => {
      await editor.typeInEditor('First numbered item');
      await editor.page.click('[data-testid="create-ordered-list"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<ol>');
      expect(htmlContent).toContain('<li>');
    });

    test('should add list items with Enter', async () => {
      await editor.typeInEditor('First item');
      await editor.page.click('[data-testid="create-unordered-list"]');
      
      await editor.page.keyboard.press('Enter');
      await editor.typeInEditor('Second item');
      
      await editor.page.keyboard.press('Enter');
      await editor.typeInEditor('Third item');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('First item');
      expect(htmlContent).toContain('Second item');
      expect(htmlContent).toContain('Third item');
      
      // Should have multiple list items
      const listItems = await editor.page.locator('li').count();
      expect(listItems).toBe(3);
    });

    test('should indent and outdent list items', async () => {
      await editor.typeInEditor('Main item');
      await editor.page.click('[data-testid="create-unordered-list"]');
      
      await editor.page.keyboard.press('Enter');
      await editor.typeInEditor('Sub item');
      await editor.page.keyboard.press('Tab'); // Indent
      
      await editor.page.keyboard.press('Enter');
      await editor.typeInEditor('Another sub item');
      
      await editor.page.keyboard.press('Shift+Tab'); // Outdent
      await editor.typeInEditor('Back to main level');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<ul>');
      
      // Should have nested list structure
      const nestedLists = await editor.page.locator('ul ul').count();
      expect(nestedLists).toBeGreaterThan(0);
    });

    test('should exit list with double Enter', async () => {
      await editor.typeInEditor('List item');
      await editor.page.click('[data-testid="create-unordered-list"]');
      
      // Double Enter should exit list
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      
      await editor.typeInEditor('Regular paragraph');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<ul>');
      expect(htmlContent).toContain('<p>Regular paragraph</p>');
    });
  });

  test.describe('Headings', () => {
    test('should create heading 1', async () => {
      await editor.typeInEditor('Main heading');
      await editor.selectAllText();
      await editor.page.click('[data-testid="heading-h1"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<h1>Main heading</h1>');
    });

    test('should create heading 2', async () => {
      await editor.typeInEditor('Sub heading');
      await editor.selectAllText();
      await editor.page.click('[data-testid="heading-h2"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<h2>Sub heading</h2>');
    });

    test('should cycle through heading levels', async () => {
      await editor.typeInEditor('Heading text');
      await editor.selectAllText();
      
      // Apply H1
      await editor.page.click('[data-testid="heading-h1"]');
      let htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<h1>');
      
      // Change to H2
      await editor.selectAllText();
      await editor.page.click('[data-testid="heading-h2"]');
      htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<h2>');
      expect(htmlContent).not.toContain('<h1>');
      
      // Change to H3
      await editor.selectAllText();
      await editor.page.click('[data-testid="heading-h3"]');
      htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<h3>');
      expect(htmlContent).not.toContain('<h2>');
    });

    test('should convert paragraph to heading', async () => {
      await editor.typeInEditor('Regular paragraph');
      await editor.selectAllText();
      await editor.page.click('[data-testid="heading-h2"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<h2>Regular paragraph</h2>');
      expect(htmlContent).not.toContain('<p>');
    });

    test('should convert heading back to paragraph', async () => {
      await editor.typeInEditor('Heading text');
      await editor.selectAllText();
      await editor.page.click('[data-testid="heading-h1"]');
      
      // Convert back to paragraph
      await editor.selectAllText();
      await editor.page.click('[data-testid="format-paragraph"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<p>Heading text</p>');
      expect(htmlContent).not.toContain('<h1>');
    });
  });

  test.describe('Code Formatting', () => {
    test('should create inline code', async () => {
      await editor.typeInEditor('This is code');
      await editor.doubleClickWord('code');
      await editor.page.click('[data-testid="format-inline-code"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<code>code</code>');
    });

    test('should create code block', async () => {
      await editor.typeInEditor('function test() { return true; }');
      await editor.selectAllText();
      await editor.page.click('[data-testid="format-code-block"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<pre>');
      expect(htmlContent).toContain('function test()');
    });

    test('should syntax highlight code blocks', async () => {
      await editor.typeInEditor('const x = 5; console.log(x);');
      await editor.selectAllText();
      await editor.page.click('[data-testid="format-code-block"]');
      
      // Select language
      await editor.page.click('[data-testid="code-language-dropdown"]');
      await editor.page.click('[data-testid="language-javascript"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('language-javascript');
    });
  });

  test.describe('Links', () => {
    test('should insert link', async () => {
      await editor.typeInEditor('Visit our website');
      await editor.doubleClickWord('website');
      
      await editor.page.click('[data-testid="insert-link"]');
      
      // Fill link dialog
      await editor.page.fill('[data-testid="link-url-input"]', 'https://example.com');
      await editor.page.fill('[data-testid="link-text-input"]', 'Example Site');
      await editor.page.click('[data-testid="link-dialog-ok"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<a href="https://example.com">Example Site</a>');
    });

    test('should edit existing link', async () => {
      // Insert initial link
      await editor.typeInEditor('Link text');
      await editor.selectAllText();
      await editor.page.click('[data-testid="insert-link"]');
      await editor.page.fill('[data-testid="link-url-input"]', 'https://old-url.com');
      await editor.page.click('[data-testid="link-dialog-ok"]');
      
      // Edit the link
      await editor.page.click('a[href="https://old-url.com"]');
      await editor.page.click('[data-testid="edit-link"]');
      await editor.page.fill('[data-testid="link-url-input"]', 'https://new-url.com');
      await editor.page.click('[data-testid="link-dialog-ok"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('https://new-url.com');
      expect(htmlContent).not.toContain('https://old-url.com');
    });

    test('should remove link', async () => {
      await editor.typeInEditor('Remove this link');
      await editor.selectAllText();
      await editor.page.click('[data-testid="insert-link"]');
      await editor.page.fill('[data-testid="link-url-input"]', 'https://example.com');
      await editor.page.click('[data-testid="link-dialog-ok"]');
      
      // Remove link
      await editor.page.click('a');
      await editor.page.click('[data-testid="remove-link"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).not.toContain('<a');
      expect(htmlContent).toContain('Remove this link');
    });

    test('should validate link URLs', async () => {
      await editor.typeInEditor('Invalid link');
      await editor.selectAllText();
      await editor.page.click('[data-testid="insert-link"]');
      
      // Try invalid URL
      await editor.page.fill('[data-testid="link-url-input"]', 'not-a-valid-url');
      await editor.page.click('[data-testid="link-dialog-ok"]');
      
      // Should show error message
      await expect(editor.page.locator('[data-testid="link-error-message"]')).toBeVisible();
    });
  });

  test.describe('Quotes and Special Blocks', () => {
    test('should create blockquote', async () => {
      await editor.typeInEditor('This is a quote');
      await editor.selectAllText();
      await editor.page.click('[data-testid="format-blockquote"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<blockquote>');
      expect(htmlContent).toContain('This is a quote');
    });

    test('should create horizontal rule', async () => {
      await editor.typeInEditor('Before line');
      await editor.page.keyboard.press('Enter');
      await editor.page.click('[data-testid="insert-horizontal-rule"]');
      await editor.typeInEditor('After line');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<hr');
      expect(htmlContent).toContain('Before line');
      expect(htmlContent).toContain('After line');
    });

    test('should create page break', async () => {
      await editor.typeInEditor('Page 1 content');
      await editor.page.keyboard.press('Enter');
      await editor.page.click('[data-testid="insert-page-break"]');
      await editor.typeInEditor('Page 2 content');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('page-break');
    });
  });

  test.describe('Advanced Formatting', () => {
    test('should apply superscript', async () => {
      await editor.typeInEditor('E = mc2');
      await editor.doubleClickWord('2');
      await editor.page.click('[data-testid="format-superscript"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<sup>2</sup>');
    });

    test('should apply subscript', async () => {
      await editor.typeInEditor('H2O');
      await editor.selectTextRange(1, 2); // Select "2"
      await editor.page.click('[data-testid="format-subscript"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<sub>2</sub>');
    });

    test('should clear all formatting', async () => {
      await editor.typeInEditor('Heavily formatted text');
      await editor.selectAllText();
      
      // Apply multiple formats
      await editor.toggleBold();
      await editor.toggleItalic();
      await editor.toggleUnderline();
      
      // Clear all formatting
      await editor.selectAllText();
      await editor.page.click('[data-testid="clear-formatting"]');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).not.toContain('<strong>');
      expect(htmlContent).not.toContain('<em>');
      expect(htmlContent).not.toContain('<u>');
      expect(htmlContent).toContain('Heavily formatted text');
    });

    test('should format with nested elements', async () => {
      await editor.typeInEditor('Complex nested formatting');
      await editor.selectAllText();
      
      // Apply bold
      await editor.toggleBold();
      
      // Select part of text and apply italic
      await editor.selectTextRange(8, 14); // "nested"
      await editor.toggleItalic();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<strong>');
      expect(htmlContent).toContain('<em>nested</em>');
    });
  });

  test.describe('Format Preservation', () => {
    test('should preserve formatting during copy/paste', async () => {
      await editor.typeInEditor('Formatted text');
      await editor.selectAllText();
      await editor.toggleBold();
      await editor.toggleItalic();
      
      await editor.copyText();
      await editor.page.keyboard.press('End');
      await editor.typeInEditor(' ');
      await editor.pasteText();
      
      const htmlContent = await editor.getEditorContent();
      
      // Should have two instances of the formatted text
      const boldMatches = htmlContent.match(/<(strong|b)>/g);
      const italicMatches = htmlContent.match(/<(em|i)>/g);
      
      expect(boldMatches?.length).toBe(2);
      expect(italicMatches?.length).toBe(2);
    });

    test('should preserve formatting during undo/redo', async () => {
      await editor.typeInEditor('Original text');
      await editor.selectAllText();
      await editor.toggleBold();
      
      let htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<strong>');
      
      await editor.undoAction();
      htmlContent = await editor.getEditorContent();
      expect(htmlContent).not.toContain('<strong>');
      
      await editor.redoAction();
      htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<strong>');
    });

    test('should maintain formatting when extending selection', async () => {
      await editor.typeInEditor('Some bold text here');
      
      // Make "bold" bold
      await editor.doubleClickWord('bold');
      await editor.toggleBold();
      
      // Extend selection to include "text"
      await editor.page.keyboard.press('Shift+Control+ArrowRight');
      await editor.toggleItalic();
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<strong>bold</strong>');
      expect(htmlContent).toContain('<em>text</em>');
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should support all basic formatting shortcuts', async () => {
      const shortcuts = [
        { key: 'Control+b', format: 'bold', tag: 'strong' },
        { key: 'Control+i', format: 'italic', tag: 'em' },
        { key: 'Control+u', format: 'underline', tag: 'u' }
      ];
      
      for (const shortcut of shortcuts) {
        await editor.clearEditor();
        await editor.typeInEditor(`Test ${shortcut.format}`);
        await editor.selectAllText();
        await editor.page.keyboard.press(shortcut.key);
        
        const htmlContent = await editor.getEditorContent();
        expect(htmlContent).toContain(`<${shortcut.tag}>`);
      }
    });

    test('should support heading shortcuts', async () => {
      const headingShortcuts = [
        { key: 'Control+1', tag: 'h1' },
        { key: 'Control+2', tag: 'h2' },
        { key: 'Control+3', tag: 'h3' }
      ];
      
      for (const shortcut of headingShortcuts) {
        await editor.clearEditor();
        await editor.typeInEditor('Heading text');
        await editor.selectAllText();
        await editor.page.keyboard.press(shortcut.key);
        
        const htmlContent = await editor.getEditorContent();
        expect(htmlContent).toContain(`<${shortcut.tag}>`);
      }
    });

    test('should support list shortcuts', async () => {
      await editor.typeInEditor('List item');
      await editor.selectAllText();
      
      // Create unordered list with Ctrl+Shift+8
      await editor.page.keyboard.press('Control+Shift+8');
      
      let htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<ul>');
      
      // Convert to ordered list with Ctrl+Shift+7
      await editor.selectAllText();
      await editor.page.keyboard.press('Control+Shift+7');
      
      htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('<ol>');
    });
  });

  test.describe('Format State Indicators', () => {
    test('should show active formatting states in toolbar', async () => {
      await editor.typeInEditor('Format state test');
      await editor.selectAllText();
      
      // Apply bold and check button state
      await editor.toggleBold();
      
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      await expect(boldButton).toHaveClass(/active|pressed/);
      
      // Remove bold and check button state
      await editor.toggleBold();
      await expect(boldButton).not.toHaveClass(/active|pressed/);
    });

    test('should show current format in selection', async () => {
      await editor.typeInEditor('Some bold text');
      
      // Make "bold" bold
      await editor.doubleClickWord('bold');
      await editor.toggleBold();
      
      // Click on bold text
      await editor.page.click('strong');
      
      // Bold button should show as active
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      await expect(boldButton).toHaveClass(/active|pressed/);
    });

    test('should handle mixed formatting states', async () => {
      await editor.typeInEditor('Some bold and some normal text');
      
      // Make "bold" bold
      await editor.doubleClickWord('bold');
      await editor.toggleBold();
      
      // Select across both formatted and unformatted text
      const editorElement = await editor.editorElement.elementHandle();
      await editor.page.evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }, editorElement);
      
      // Bold button should show indeterminate state
      const boldButton = editor.page.locator('[data-testid="toolbar-bold"]');
      const buttonClass = await boldButton.getAttribute('class');
      expect(buttonClass).toMatch(/indeterminate|mixed/);
    });
  });
});