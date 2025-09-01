import { Page, Locator, expect } from '@playwright/test';

/**
 * Helper functions for common editor operations
 */
export class EditorHelpers {
  constructor(private page: Page) {}

  /**
   * Get the main editor element
   */
  getEditor(): Locator {
    return this.page.locator('[data-testid="blg-editor"]').first();
  }

  /**
   * Get the editor content area
   */
  getEditorContent(): Locator {
    return this.page.locator('[contenteditable="true"]').first();
  }

  /**
   * Get the toolbar element
   */
  getToolbar(): Locator {
    return this.page.locator('[data-testid="editor-toolbar"]');
  }

  /**
   * Get a specific toolbar button
   */
  getToolbarButton(buttonName: string): Locator {
    return this.getToolbar().locator(`[data-testid="toolbar-${buttonName}"]`);
  }

  /**
   * Type text in the editor
   */
  async typeText(text: string): Promise<void> {
    await this.getEditorContent().click();
    await this.getEditorContent().type(text);
  }

  /**
   * Clear all editor content
   */
  async clearContent(): Promise<void> {
    await this.getEditorContent().click();
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.press('Delete');
  }

  /**
   * Select all text in the editor
   */
  async selectAll(): Promise<void> {
    await this.getEditorContent().click();
    await this.page.keyboard.press('Control+a');
  }

  /**
   * Select text by range
   */
  async selectText(startOffset: number, endOffset: number): Promise<void> {
    await this.page.evaluate(([start, end]) => {
      const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
      if (!editor) return;
      
      const range = document.createRange();
      const selection = window.getSelection();
      
      const textNode = editor.firstChild || editor;
      range.setStart(textNode, start);
      range.setEnd(textNode, end);
      
      selection?.removeAllRanges();
      selection?.addRange(range);
    }, [startOffset, endOffset]);
  }

  /**
   * Get the current editor content as HTML
   */
  async getContent(): Promise<string> {
    return await this.getEditorContent().innerHTML();
  }

  /**
   * Get the current editor content as plain text
   */
  async getTextContent(): Promise<string> {
    return await this.getEditorContent().textContent() || '';
  }

  /**
   * Apply formatting by clicking toolbar button
   */
  async applyFormatting(formatType: string): Promise<void> {
    await this.getToolbarButton(formatType).click();
  }

  /**
   * Toggle formatting on selected text
   */
  async toggleFormatting(formatType: string): Promise<void> {
    await this.getToolbarButton(formatType).click();
  }

  /**
   * Insert a table with specified dimensions
   */
  async insertTable(rows: number, cols: number): Promise<void> {
    await this.getToolbarButton('table').click();
    await this.page.locator(`[data-testid="table-size-${rows}x${cols}"]`).click();
  }

  /**
   * Insert an image
   */
  async insertImage(imagePath: string): Promise<void> {
    await this.getToolbarButton('image').click();
    
    // Handle file upload
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(imagePath);
  }

  /**
   * Insert a video
   */
  async insertVideo(videoUrl: string): Promise<void> {
    await this.getToolbarButton('video').click();
    await this.page.locator('[data-testid="video-url-input"]').fill(videoUrl);
    await this.page.locator('[data-testid="insert-video-button"]').click();
  }

  /**
   * Undo the last action
   */
  async undo(): Promise<void> {
    await this.page.keyboard.press('Control+z');
  }

  /**
   * Redo the last undone action
   */
  async redo(): Promise<void> {
    await this.page.keyboard.press('Control+y');
  }

  /**
   * Copy selected content
   */
  async copy(): Promise<void> {
    await this.page.keyboard.press('Control+c');
  }

  /**
   * Cut selected content
   */
  async cut(): Promise<void> {
    await this.page.keyboard.press('Control+x');
  }

  /**
   * Paste content
   */
  async paste(): Promise<void> {
    await this.page.keyboard.press('Control+v');
  }

  /**
   * Wait for editor to be ready
   */
  async waitForReady(): Promise<void> {
    await this.getEditor().waitFor({ state: 'visible' });
    await this.getEditorContent().waitFor({ state: 'visible' });
    await this.getToolbar().waitFor({ state: 'visible' });
  }

  /**
   * Take a screenshot of the editor
   */
  async screenshot(name: string): Promise<Buffer> {
    return await this.getEditor().screenshot({ path: `test-results/editor-screenshots/${name}.png` });
  }

  /**
   * Assert that text formatting is applied
   */
  async expectFormattingApplied(formatType: string, text?: string): Promise<void> {
    const formatTags: Record<string, string> = {
      bold: 'strong, b',
      italic: 'em, i',
      underline: 'u',
      strikethrough: 'del, s',
      code: 'code',
      blockquote: 'blockquote',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
    };

    const selector = formatTags[formatType];
    if (selector) {
      const element = this.getEditorContent().locator(selector).first();
      await expect(element).toBeVisible();
      
      if (text) {
        await expect(element).toContainText(text);
      }
    }
  }

  /**
   * Assert that a table exists with specified dimensions
   */
  async expectTableExists(rows: number, cols: number): Promise<void> {
    const table = this.getEditorContent().locator('table').first();
    await expect(table).toBeVisible();
    
    const tableRows = table.locator('tr');
    await expect(tableRows).toHaveCount(rows);
    
    const firstRowCells = tableRows.first().locator('td, th');
    await expect(firstRowCells).toHaveCount(cols);
  }

  /**
   * Assert that an image is inserted
   */
  async expectImageInserted(): Promise<void> {
    const image = this.getEditorContent().locator('img').first();
    await expect(image).toBeVisible();
  }

  /**
   * Assert that a video is embedded
   */
  async expectVideoEmbedded(): Promise<void> {
    const video = this.getEditorContent().locator('video, iframe[src*="youtube"], iframe[src*="vimeo"]').first();
    await expect(video).toBeVisible();
  }

  /**
   * Assert editor is in a clean state
   */
  async expectCleanState(): Promise<void> {
    const content = await this.getTextContent();
    expect(content.trim()).toBe('');
  }

  /**
   * Get toolbar button state (active/inactive)
   */
  async getToolbarButtonState(buttonName: string): Promise<'active' | 'inactive'> {
    const button = this.getToolbarButton(buttonName);
    const isActive = await button.getAttribute('data-active');
    return isActive === 'true' ? 'active' : 'inactive';
  }

  /**
   * Simulate keyboard shortcut
   */
  async pressShortcut(shortcut: string): Promise<void> {
    await this.page.keyboard.press(shortcut);
  }

  /**
   * Wait for a specific editor state
   */
  async waitForState(state: 'ready' | 'loading' | 'error'): Promise<void> {
    await this.page.waitForFunction(
      (expectedState) => {
        const editor = document.querySelector('[data-testid="blg-editor"]') as HTMLElement;
        return editor?.getAttribute('data-state') === expectedState;
      },
      state
    );
  }
}