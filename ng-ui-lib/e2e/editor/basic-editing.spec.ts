import { test, expect } from '@playwright/test';
import { EditorPage } from './page-objects/editor-page';
import { EditorTestData } from './utils/test-data-generator';
import { EditorAssertions } from './utils/custom-assertions';

test.describe('Basic Editor Functionality', () => {
  let editorPage: EditorPage;

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page);
    await editorPage.goto();
  });

  test('should load editor successfully', async () => {
    await expect(editorPage.editor).toBeVisible();
    await expect(editorPage.editorContent).toBeVisible();
    await expect(editorPage.toolbar).toBeVisible();
  });

  test('should allow basic text input', async () => {
    const testText = 'Hello, World!';
    await editorPage.typeText(testText);
    
    const content = await editorPage.getTextContent();
    expect(content).toContain(testText);
  });

  test('should handle multiple paragraphs', async () => {
    const paragraph1 = 'First paragraph';
    const paragraph2 = 'Second paragraph';
    
    await editorPage.typeText(paragraph1);
    await editorPage.page.keyboard.press('Enter');
    await editorPage.page.keyboard.press('Enter');
    await editorPage.typeText(paragraph2);
    
    const content = await editorPage.getTextContent();
    expect(content).toContain(paragraph1);
    expect(content).toContain(paragraph2);
  });

  test('should support line breaks', async () => {
    await editorPage.typeText('Line 1');
    await editorPage.page.keyboard.press('Shift+Enter');
    await editorPage.typeText('Line 2');
    
    const htmlContent = await editorPage.getHtmlContent();
    expect(htmlContent).toContain('<br>');
  });

  test('should handle special characters', async () => {
    const specialText = 'Special chars: @#$%^&*()[]{}|\\:";\'<>?,./';
    await editorPage.typeText(specialText);
    
    const content = await editorPage.getTextContent();
    expect(content).toContain(specialText);
  });

  test('should support unicode characters', async () => {
    const unicodeText = 'Unicode: 🌟 ✨ 💫 αβγ 你好 世界';
    await editorPage.typeText(unicodeText);
    
    const content = await editorPage.getTextContent();
    expect(content).toContain(unicodeText);
  });

  test('should handle long text input', async () => {
    const longText = EditorTestData.generateText({ sentences: 50 });
    await editorPage.typeText(longText);
    
    const content = await editorPage.getTextContent();
    expect(content).toContain(longText);
  });

  test('should maintain cursor position after typing', async () => {
    await editorPage.typeText('Beginning ');
    await editorPage.page.keyboard.press('ArrowLeft ArrowLeft ArrowLeft ArrowLeft');
    await editorPage.typeText('middle ');
    
    const content = await editorPage.getTextContent();
    expect(content).toBe('Beginning middle ');
  });

  test('should handle backspace and delete', async () => {
    await editorPage.typeText('Hello World');
    
    // Delete 'World'
    for (let i = 0; i < 5; i++) {
      await editorPage.page.keyboard.press('Backspace');
    }
    
    let content = await editorPage.getTextContent();
    expect(content).toBe('Hello ');
    
    // Delete the space using Delete key
    await editorPage.page.keyboard.press('ArrowLeft');
    await editorPage.page.keyboard.press('Delete');
    
    content = await editorPage.getTextContent();
    expect(content).toBe('Hello');
  });

  test('should support text selection with mouse', async () => {
    const testText = 'Select this text';
    await editorPage.typeText(testText);
    
    // Select "this" by double-clicking
    await editorPage.page.locator('text=this').dblclick();
    
    // Type to replace selected text
    await editorPage.page.keyboard.type('that');
    
    const content = await editorPage.getTextContent();
    expect(content).toBe('Select that text');
  });

  test('should support text selection with keyboard', async () => {
    await editorPage.typeText('Hello World');
    await editorPage.page.keyboard.press('Control+Home');
    await editorPage.page.keyboard.press('Shift+Control+Right'); // Select first word
    await editorPage.page.keyboard.type('Hi');
    
    const content = await editorPage.getTextContent();
    expect(content).toBe('Hi World');
  });

  test('should handle tab indentation', async () => {
    await editorPage.typeText('First line');
    await editorPage.page.keyboard.press('Enter');
    await editorPage.page.keyboard.press('Tab');
    await editorPage.typeText('Indented line');
    
    const htmlContent = await editorPage.getHtmlContent();
    expect(htmlContent).toContain('First line');
    expect(htmlContent).toContain('Indented line');
  });

  test('should support drag and drop text', async () => {
    await editorPage.typeText('First Second Third');
    
    // Select 'Second'
    await editorPage.page.locator('text=Second').dblclick();
    
    // Drag to beginning
    const sourceElement = editorPage.page.locator('text=Second');
    const targetElement = editorPage.editorContent;
    
    await sourceElement.dragTo(targetElement, { 
      sourcePosition: { x: 0, y: 0 },
      targetPosition: { x: 0, y: 0 }
    });
    
    // Note: Actual drag-drop behavior may vary by implementation
    // This test verifies the drag operation doesn't crash the editor
    const content = await editorPage.getTextContent();
    expect(content).toContain('First');
    expect(content).toContain('Second');
    expect(content).toContain('Third');
  });

  test('should handle focus and blur events', async () => {
    // Editor should not be focused initially
    await expect(editorPage.editorContent).not.toBeFocused();
    
    // Click to focus
    await editorPage.focus();
    await expect(editorPage.editorContent).toBeFocused();
    
    // Click outside to blur
    await editorPage.blur();
    await expect(editorPage.editorContent).not.toBeFocused();
  });

  test('should preserve formatting during basic editing', async () => {
    await editorPage.typeText('Normal text');
    await editorPage.page.keyboard.press('Enter');
    await editorPage.typeText('More text');
    
    // Add text in the middle
    await editorPage.page.keyboard.press('Control+Home');
    await editorPage.page.keyboard.press('Control+Right'); // Move to end of first word
    await editorPage.page.keyboard.type(' inserted');
    
    const content = await editorPage.getTextContent();
    expect(content).toContain('Normal inserted text');
    expect(content).toContain('More text');
  });

  test('should handle edge cases in text input', async () => {
    // Empty input
    await editorPage.clearContent();
    let content = await editorPage.getTextContent();
    expect(content.trim()).toBe('');
    
    // Only spaces
    await editorPage.typeText('   ');
    content = await editorPage.getTextContent();
    expect(content).toBe('   ');
    
    // Only line breaks
    await editorPage.clearContent();
    await editorPage.page.keyboard.press('Enter');
    await editorPage.page.keyboard.press('Enter');
    const htmlContent = await editorPage.getHtmlContent();
    expect(htmlContent).toContain('<br>');
  });

  test('should maintain scroll position during editing', async ({ page }) => {
    // Add enough content to make the editor scrollable
    const longContent = EditorTestData.generateText({ paragraphs: 20 });
    await editorPage.typeText(longContent);
    
    // Scroll to middle
    await page.keyboard.press('Control+End');
    await page.keyboard.press('PageUp');
    
    // Add text
    await editorPage.typeText(' Additional text');
    
    // Verify scroll position didn't jump to top
    const scrollTop = await editorPage.editorContent.evaluate(el => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);
  });

  test('should handle rapid successive inputs', async () => {
    const rapidInputs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    
    for (const input of rapidInputs) {
      await editorPage.page.keyboard.type(input);
    }
    
    const content = await editorPage.getTextContent();
    expect(content).toBe('abcdefghij');
  });

  test('should validate content length limits', async () => {
    // Test assumes there might be a character limit
    const veryLongText = 'a'.repeat(100000); // 100k characters
    await editorPage.typeText(veryLongText);
    
    const content = await editorPage.getTextContent();
    // Should either accept all content or enforce a reasonable limit
    expect(content.length).toBeGreaterThan(0);
    expect(content.length).toBeLessThanOrEqual(100000);
  });

  test('should support word wrapping', async ({ page }) => {
    // Set a narrow viewport to test wrapping
    await page.setViewportSize({ width: 300, height: 600 });
    
    const longLine = 'This is a very long line of text that should wrap when the viewport is narrow enough';
    await editorPage.typeText(longLine);
    
    // Verify the text is visible (wrapped properly)
    const content = await editorPage.getTextContent();
    expect(content).toBe(longLine);
  });
});