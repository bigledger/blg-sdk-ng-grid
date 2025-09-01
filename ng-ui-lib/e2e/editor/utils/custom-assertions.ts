import { expect, Locator, Page } from '@playwright/test';

/**
 * Custom assertions for editor testing
 */
export class EditorAssertions {
  /**
   * Assert that the editor contains specific HTML content
   */
  static async toContainHtml(locator: Locator, expectedHtml: string): Promise<void> {
    const actualHtml = await locator.innerHTML();
    expect(actualHtml).toContain(expectedHtml);
  }

  /**
   * Assert that the editor has specific formatting applied
   */
  static async toHaveFormatting(
    locator: Locator, 
    formatType: string, 
    text?: string
  ): Promise<void> {
    const formatSelectors: Record<string, string> = {
      bold: 'strong, b',
      italic: 'em, i',
      underline: 'u',
      strikethrough: 'del, s',
      code: 'code',
      blockquote: 'blockquote',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6'
    };

    const selector = formatSelectors[formatType];
    if (!selector) {
      throw new Error(`Unknown format type: ${formatType}`);
    }

    const formattedElement = locator.locator(selector);
    await expect(formattedElement).toBeVisible();

    if (text) {
      await expect(formattedElement).toContainText(text);
    }
  }

  /**
   * Assert that the editor has a table with specific dimensions
   */
  static async toHaveTable(
    locator: Locator, 
    rows: number, 
    cols: number
  ): Promise<void> {
    const table = locator.locator('table');
    await expect(table).toBeVisible();

    const tableRows = table.locator('tr');
    await expect(tableRows).toHaveCount(rows);

    // Check first row for column count
    const firstRowCells = tableRows.first().locator('td, th');
    await expect(firstRowCells).toHaveCount(cols);
  }

  /**
   * Assert that the editor contains an image
   */
  static async toContainImage(
    locator: Locator, 
    options?: { src?: string; alt?: string; count?: number }
  ): Promise<void> {
    const images = locator.locator('img');
    
    if (options?.count) {
      await expect(images).toHaveCount(options.count);
    } else {
      await expect(images.first()).toBeVisible();
    }

    if (options?.src) {
      await expect(images.first()).toHaveAttribute('src', options.src);
    }

    if (options?.alt) {
      await expect(images.first()).toHaveAttribute('alt', options.alt);
    }
  }

  /**
   * Assert that the editor contains a video
   */
  static async toContainVideo(
    locator: Locator,
    options?: { src?: string; type?: 'html5' | 'youtube' | 'vimeo' }
  ): Promise<void> {
    let videoSelector = 'video';
    
    if (options?.type === 'youtube') {
      videoSelector = 'iframe[src*="youtube"]';
    } else if (options?.type === 'vimeo') {
      videoSelector = 'iframe[src*="vimeo"]';
    }

    const video = locator.locator(videoSelector);
    await expect(video.first()).toBeVisible();

    if (options?.src) {
      await expect(video.first()).toHaveAttribute('src', new RegExp(options.src));
    }
  }

  /**
   * Assert that the editor has a specific list structure
   */
  static async toHaveList(
    locator: Locator,
    type: 'ordered' | 'unordered',
    itemCount: number
  ): Promise<void> {
    const listSelector = type === 'ordered' ? 'ol' : 'ul';
    const list = locator.locator(listSelector);
    await expect(list).toBeVisible();

    const listItems = list.locator('li');
    await expect(listItems).toHaveCount(itemCount);
  }

  /**
   * Assert that the toolbar button is in a specific state
   */
  static async toHaveButtonState(
    locator: Locator,
    state: 'active' | 'inactive' | 'disabled'
  ): Promise<void> {
    if (state === 'active') {
      await expect(locator).toHaveAttribute('data-active', 'true');
    } else if (state === 'inactive') {
      await expect(locator).toHaveAttribute('data-active', 'false');
    } else if (state === 'disabled') {
      await expect(locator).toBeDisabled();
    }
  }

  /**
   * Assert that the editor is accessible
   */
  static async toBeAccessible(page: Page): Promise<void> {
    // Check for basic ARIA attributes
    const editor = page.locator('[contenteditable="true"]');
    await expect(editor).toHaveAttribute('role', 'textbox');
    
    // Check that all interactive elements have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasAccessibleName = await button.evaluate((el) => {
        return el.getAttribute('aria-label') || 
               el.getAttribute('title') || 
               el.textContent?.trim() || 
               false;
      });
      expect(hasAccessibleName).toBeTruthy();
    }
  }

  /**
   * Assert that content is preserved after operations
   */
  static async toPreserveContent(
    locator: Locator,
    originalContent: string,
    operation: () => Promise<void>
  ): Promise<void> {
    // Get content before operation
    const beforeContent = await locator.innerHTML();
    expect(beforeContent).toBe(originalContent);

    // Perform operation
    await operation();

    // Get content after operation
    const afterContent = await locator.innerHTML();
    expect(afterContent).toBe(originalContent);
  }

  /**
   * Assert that undo/redo operations work correctly
   */
  static async toSupportUndoRedo(
    page: Page,
    editorLocator: Locator,
    changeOperation: () => Promise<void>
  ): Promise<void> {
    // Get initial content
    const initialContent = await editorLocator.innerHTML();

    // Make a change
    await changeOperation();
    const changedContent = await editorLocator.innerHTML();
    expect(changedContent).not.toBe(initialContent);

    // Undo the change
    await page.keyboard.press('Control+z');
    const undoneContent = await editorLocator.innerHTML();
    expect(undoneContent).toBe(initialContent);

    // Redo the change
    await page.keyboard.press('Control+y');
    const redoneContent = await editorLocator.innerHTML();
    expect(redoneContent).toBe(changedContent);
  }

  /**
   * Assert that copy/paste operations work correctly
   */
  static async toSupportCopyPaste(
    page: Page,
    editorLocator: Locator
  ): Promise<void> {
    // Add some content
    await editorLocator.click();
    await page.keyboard.type('Test content for copy/paste');
    
    // Select all and copy
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    // Clear and paste
    await page.keyboard.press('Delete');
    await page.keyboard.press('Control+v');
    
    // Verify content was pasted
    const pastedContent = await editorLocator.textContent();
    expect(pastedContent).toBe('Test content for copy/paste');
  }

  /**
   * Assert that keyboard navigation works correctly
   */
  static async toSupportKeyboardNavigation(page: Page): Promise<void> {
    // Start from the editor
    const editor = page.locator('[contenteditable="true"]');
    await editor.focus();

    // Tab should move to toolbar buttons
    await page.keyboard.press('Tab');
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBe('BUTTON');

    // Shift+Tab should move back
    await page.keyboard.press('Shift+Tab');
    const backToEditor = await page.evaluate(() => 
      document.activeElement?.getAttribute('contenteditable') === 'true'
    );
    expect(backToEditor).toBe(true);
  }

  /**
   * Assert that the editor performs well with large content
   */
  static async toHandleLargeContent(
    page: Page,
    editorLocator: Locator,
    largeContent: string
  ): Promise<void> {
    const startTime = Date.now();
    
    // Insert large content
    await editorLocator.click();
    await page.evaluate((content) => {
      const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
      if (editor) {
        editor.innerHTML = content;
      }
    }, largeContent);

    const insertTime = Date.now() - startTime;
    expect(insertTime).toBeLessThan(5000); // Should insert within 5 seconds

    // Test scrolling performance
    const scrollStart = Date.now();
    await page.keyboard.press('Control+End'); // Scroll to end
    await page.keyboard.press('Control+Home'); // Scroll to beginning
    const scrollTime = Date.now() - scrollStart;
    
    expect(scrollTime).toBeLessThan(1000); // Should scroll within 1 second
  }

  /**
   * Assert that the editor is responsive on mobile devices
   */
  static async toBeMobileResponsive(page: Page): Promise<void> {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const editor = page.locator('[data-testid="blg-editor"]');
    const toolbar = page.locator('[data-testid="editor-toolbar"]');
    
    // Check that editor is visible and properly sized
    await expect(editor).toBeVisible();
    const editorBox = await editor.boundingBox();
    expect(editorBox?.width).toBeLessThanOrEqual(375);
    
    // Check that toolbar adapts to mobile
    await expect(toolbar).toBeVisible();
    const toolbarBox = await toolbar.boundingBox();
    expect(toolbarBox?.width).toBeLessThanOrEqual(375);
    
    // Test touch interactions
    const editorContent = page.locator('[contenteditable="true"]');
    await editorContent.tap();
    await expect(editorContent).toBeFocused();
  }
}