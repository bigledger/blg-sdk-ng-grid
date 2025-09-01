import { test, expect } from '@playwright/test';
import { EditorTestBase } from '../editor-base.spec';

test.describe('BLG Editor - Text Editing Features', () => {
  let editor: EditorTestBase;

  test.beforeEach(async ({ page }) => {
    editor = new EditorTestBase(page);
    await editor.navigateToEditor();
    await editor.clearEditor();
  });

  test.describe('Basic Text Input', () => {
    test('should allow typing text', async () => {
      const testText = 'Hello, this is a test message!';
      await editor.typeInEditor(testText);
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain(testText);
      
      // Verify word count updates
      const wordCount = await editor.getWordCount();
      expect(wordCount).toBe(6); // "Hello," "this" "is" "a" "test" "message!"
    });

    test('should handle multi-line text input', async () => {
      await editor.typeInEditor('Line 1');
      await editor.page.keyboard.press('Enter');
      await editor.typeInEditor('Line 2');
      await editor.page.keyboard.press('Enter');
      await editor.typeInEditor('Line 3');
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Line 1');
      expect(content).toContain('Line 2');
      expect(content).toContain('Line 3');
    });

    test('should handle special characters', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~`"\'\\n\\t';
      await editor.typeInEditor(specialChars);
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('!@#$%^&*()_+-=[]{}|;:,.<>?~`"\'');
    });

    test('should handle Unicode characters', async () => {
      const unicodeText = 'Unicode: 中文, العربية, 日本語, Emoji: 😀🎉🚀';
      await editor.typeInEditor(unicodeText);
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('中文');
      expect(content).toContain('العربية');
      expect(content).toContain('日本語');
      expect(content).toContain('😀🎉🚀');
    });
  });

  test.describe('Text Selection', () => {
    test('should select text with mouse', async () => {
      await editor.typeInEditor('This is a test sentence for selection.');
      
      // Select word by double-clicking
      await editor.doubleClickWord('test');
      
      const selection = await editor.getSelection();
      expect(selection.text).toBe('test');
      expect(selection.collapsed).toBe(false);
    });

    test('should select text with keyboard shortcuts', async () => {
      await editor.typeInEditor('This is a test sentence.');
      
      // Select all text
      await editor.selectAllText();
      
      const selection = await editor.getSelection();
      expect(selection.text).toContain('This is a test sentence.');
      expect(selection.collapsed).toBe(false);
    });

    test('should select text with shift+arrow keys', async () => {
      await editor.typeInEditor('Testing text selection');
      
      // Move cursor to beginning
      await editor.page.keyboard.press('Control+Home');
      
      // Select first word with Shift+Ctrl+Right
      await editor.page.keyboard.press('Control+Shift+ArrowRight');
      
      const selection = await editor.getSelection();
      expect(selection.text).toBe('Testing');
      expect(selection.collapsed).toBe(false);
    });

    test('should handle drag selection', async () => {
      await editor.typeInEditor('Drag to select this text');
      
      // Get editor bounds
      const editorBox = await editor.editorElement.boundingBox();
      expect(editorBox).not.toBeNull();
      
      if (editorBox) {
        // Start drag from beginning of text
        await editor.page.mouse.move(editorBox.x + 10, editorBox.y + 10);
        await editor.page.mouse.down();
        
        // Drag to end of text
        await editor.page.mouse.move(editorBox.x + editorBox.width - 10, editorBox.y + 10);
        await editor.page.mouse.up();
        
        const selection = await editor.getSelection();
        expect(selection.text.trim().length).toBeGreaterThan(0);
        expect(selection.collapsed).toBe(false);
      }
    });
  });

  test.describe('Text Deletion', () => {
    test('should delete with Backspace key', async () => {
      await editor.typeInEditor('Hello World');
      
      // Delete last character
      await editor.page.keyboard.press('Backspace');
      
      const content = await editor.getEditorTextContent();
      expect(content).toBe('Hello Worl');
    });

    test('should delete with Delete key', async () => {
      await editor.typeInEditor('Hello World');
      
      // Move cursor to before 'World'
      await editor.page.keyboard.press('Control+Home');
      await editor.page.keyboard.press('ArrowRight ArrowRight ArrowRight ArrowRight ArrowRight ArrowRight');
      
      // Delete next character
      await editor.page.keyboard.press('Delete');
      
      const content = await editor.getEditorTextContent();
      expect(content).toBe('Hello orld');
    });

    test('should delete selected text', async () => {
      await editor.typeInEditor('Hello World Testing');
      
      await editor.doubleClickWord('World');
      await editor.page.keyboard.press('Delete');
      
      const content = await editor.getEditorTextContent();
      expect(content).not.toContain('World');
      expect(content).toContain('Hello');
      expect(content).toContain('Testing');
    });

    test('should delete with Control+Backspace (word deletion)', async () => {
      await editor.typeInEditor('Hello World Testing');
      
      // Delete previous word
      await editor.page.keyboard.press('Control+Backspace');
      
      const content = await editor.getEditorTextContent();
      expect(content).toBe('Hello World ');
    });
  });

  test.describe('Cut, Copy, Paste Operations', () => {
    test('should cut and paste text', async () => {
      await editor.typeInEditor('Text to cut and paste');
      
      await editor.doubleClickWord('cut');
      await editor.cutText();
      
      // Verify text was cut
      let content = await editor.getEditorTextContent();
      expect(content).not.toContain('cut');
      
      // Move cursor to end and paste
      await editor.page.keyboard.press('Control+End');
      await editor.typeInEditor(' ');
      await editor.pasteText();
      
      content = await editor.getEditorTextContent();
      expect(content).toContain('Text to  and paste cut');
    });

    test('should copy and paste text', async () => {
      await editor.typeInEditor('Text to copy');
      
      await editor.doubleClickWord('copy');
      await editor.copyText();
      
      // Move cursor to end and paste
      await editor.page.keyboard.press('Control+End');
      await editor.typeInEditor(' ');
      await editor.pasteText();
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Text to copy copy');
    });

    test('should copy and paste between editors', async () => {
      await editor.typeInEditor('Source text to copy');
      
      await editor.selectAllText();
      await editor.copyText();
      
      // Click on secondary editor and paste
      await editor.secondaryEditorElement.click();
      await editor.pasteText();
      
      const secondaryContent = await editor.secondaryEditorElement.textContent();
      expect(secondaryContent).toContain('Source text to copy');
    });

    test('should handle paste from external clipboard', async ({ context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      
      // Set clipboard content
      await editor.page.evaluate(() => {
        navigator.clipboard.writeText('External clipboard content');
      });
      
      await editor.editorElement.click();
      await editor.pasteText();
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('External clipboard content');
    });
  });

  test.describe('Undo and Redo Operations', () => {
    test('should undo text input', async () => {
      await editor.typeInEditor('First text');
      await editor.typeInEditor(' Second text');
      
      // Undo should remove "Second text"
      await editor.undoAction();
      
      const content = await editor.getEditorTextContent();
      expect(content).toBe('First text');
      expect(content).not.toContain('Second text');
    });

    test('should redo after undo', async () => {
      await editor.typeInEditor('Text to undo and redo');
      
      await editor.undoAction();
      let content = await editor.getEditorTextContent();
      expect(content).toBe('');
      
      await editor.redoAction();
      content = await editor.getEditorTextContent();
      expect(content).toContain('Text to undo and redo');
    });

    test('should handle multiple undo/redo operations', async () => {
      // Create multiple undoable actions
      await editor.typeInEditor('Step 1');
      await editor.page.keyboard.press('Enter');
      await editor.typeInEditor('Step 2');
      await editor.page.keyboard.press('Enter');
      await editor.typeInEditor('Step 3');
      
      // Undo all steps
      await editor.undoAction();
      await editor.undoAction();
      await editor.undoAction();
      
      let content = await editor.getEditorTextContent();
      expect(content.trim()).toBe('');
      
      // Redo all steps
      await editor.redoAction();
      await editor.redoAction();
      await editor.redoAction();
      
      content = await editor.getEditorTextContent();
      expect(content).toContain('Step 1');
      expect(content).toContain('Step 2');
      expect(content).toContain('Step 3');
    });

    test('should update undo/redo button states', async () => {
      // Initially should not be able to undo/redo
      let canUndo = await editor.page.locator('[data-testid="can-undo"]').textContent();
      let canRedo = await editor.page.locator('[data-testid="can-redo"]').textContent();
      expect(canUndo).toBe('false');
      expect(canRedo).toBe('false');
      
      // After typing, should be able to undo
      await editor.typeInEditor('Some text');
      canUndo = await editor.page.locator('[data-testid="can-undo"]').textContent();
      expect(canUndo).toBe('true');
      
      // After undo, should be able to redo
      await editor.undoAction();
      canRedo = await editor.page.locator('[data-testid="can-redo"]').textContent();
      expect(canRedo).toBe('true');
    });
  });

  test.describe('Text Navigation', () => {
    test('should navigate with arrow keys', async () => {
      await editor.typeInEditor('Navigation test text');
      
      // Move to beginning
      await editor.page.keyboard.press('Control+Home');
      
      // Move word by word
      await editor.page.keyboard.press('Control+ArrowRight');
      await editor.typeInEditor('INSERTED ');
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Navigation INSERTED test text');
    });

    test('should navigate with Home and End keys', async () => {
      await editor.typeInEditor('Line 1');
      await editor.page.keyboard.press('Enter');
      await editor.typeInEditor('Line 2 with more text');
      
      // Go to beginning of current line
      await editor.page.keyboard.press('Home');
      await editor.typeInEditor('START ');
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('START Line 2 with more text');
    });

    test('should navigate with Page Up and Page Down', async () => {
      // Create long content
      let longText = '';
      for (let i = 1; i <= 50; i++) {
        longText += `Line ${i}\\n`;
      }
      await editor.typeInEditor(longText);
      
      // Test page navigation
      await editor.page.keyboard.press('Control+Home');
      await editor.page.keyboard.press('PageDown');
      await editor.page.keyboard.press('PageUp');
      
      // Should be able to type at current position
      await editor.typeInEditor('INSERTED ');
      const content = await editor.getEditorTextContent();
      expect(content).toContain('INSERTED');
    });
  });

  test.describe('Text Replacement', () => {
    test('should replace selected text when typing', async () => {
      await editor.typeInEditor('Replace this word');
      
      await editor.doubleClickWord('this');
      await editor.typeInEditor('THAT');
      
      const content = await editor.getEditorTextContent();
      expect(content).toBe('Replace THAT word');
    });

    test('should overwrite text in insert mode', async () => {
      await editor.typeInEditor('Original text');
      
      // Select middle word and replace
      await editor.doubleClickWord('text');
      await editor.typeInEditor('content');
      
      const content = await editor.getEditorTextContent();
      expect(content).toBe('Original content');
    });
  });

  test.describe('Advanced Text Operations', () => {
    test('should handle Tab for indentation', async () => {
      await editor.typeInEditor('Normal text');
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Tab');
      await editor.typeInEditor('Indented text');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('Normal text');
      expect(htmlContent).toContain('Indented text');
    });

    test('should handle word wrapping', async () => {
      // Type a very long line
      const longText = 'This is a very long line of text that should wrap around when it reaches the edge of the editor container and create multiple visual lines while remaining a single paragraph element in the DOM structure.';
      await editor.typeInEditor(longText);
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain(longText);
      
      // Check that editor handles long content gracefully
      const editorHeight = await editor.editorElement.evaluate(el => el.scrollHeight);
      expect(editorHeight).toBeGreaterThan(50); // Should have some height due to wrapping
    });

    test('should handle rapid typing', async () => {
      const rapidText = 'abcdefghijklmnopqrstuvwxyz0123456789';
      
      // Type rapidly without delays
      for (const char of rapidText) {
        await editor.page.keyboard.type(char, { delay: 0 });
      }
      
      await editor.waitForContentUpdate();
      const content = await editor.getEditorTextContent();
      expect(content).toContain(rapidText);
    });

    test('should handle simultaneous operations', async () => {
      await editor.typeInEditor('Base content');
      
      // Perform multiple operations quickly
      await editor.selectAllText();
      await editor.page.keyboard.press('Control+b'); // Bold
      await editor.page.keyboard.press('Control+i'); // Italic
      await editor.typeInEditor('Formatted replacement');
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toContain('Formatted replacement');
    });
  });

  test.describe('Content Persistence', () => {
    test('should maintain content after losing focus', async () => {
      const testContent = 'Content that should persist';
      await editor.typeInEditor(testContent);
      
      // Click outside editor to blur
      await editor.page.click('[data-testid="config-panel"]');
      
      // Click back on editor
      await editor.editorElement.click();
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain(testContent);
    });

    test('should restore cursor position after focus', async () => {
      await editor.typeInEditor('Test cursor position');
      
      // Position cursor in middle
      await editor.page.keyboard.press('Control+Home');
      await editor.page.keyboard.press('ArrowRight ArrowRight ArrowRight ArrowRight ArrowRight');
      
      // Blur and refocus
      await editor.page.click('[data-testid="config-panel"]');
      await editor.editorElement.click();
      
      // Type at cursor position
      await editor.typeInEditor('INSERTED');
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Test INSERTEDcursor position');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid input gracefully', async () => {
      // Try to input null/undefined content
      await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]') as HTMLElement;
        if (editor) {
          editor.innerHTML = '';
        }
      });
      
      await editor.typeInEditor('Recovery text');
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Recovery text');
    });

    test('should recover from malformed HTML', async () => {
      // Insert malformed HTML
      await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]') as HTMLElement;
        if (editor) {
          editor.innerHTML = '<p><span><strong>Unclosed tags</p>';
        }
      });
      
      await editor.typeInEditor(' Additional text');
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Additional text');
    });
  });

  test.describe('Performance with Text', () => {
    test('should handle large text input efficiently', async () => {
      const startTime = Date.now();
      
      // Insert 1000 words
      let largeText = '';
      for (let i = 1; i <= 1000; i++) {
        largeText += `Word${i} `;
      }
      
      await editor.typeInEditor(largeText);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000);
      
      const wordCount = await editor.getWordCount();
      expect(wordCount).toBe(1000);
    });

    test('should maintain responsiveness during continuous typing', async () => {
      const startTime = performance.now();
      
      // Type continuously for 2 seconds
      const endTime = startTime + 2000;
      let charCount = 0;
      
      while (performance.now() < endTime) {
        await editor.page.keyboard.type('a', { delay: 10 });
        charCount++;
      }
      
      await editor.waitForContentUpdate();
      
      const finalCharCount = await editor.getCharCount();
      expect(finalCharCount).toBeGreaterThan(charCount * 0.8); // Allow some tolerance
    });
  });
});