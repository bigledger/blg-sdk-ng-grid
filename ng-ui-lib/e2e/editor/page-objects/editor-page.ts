import { Page, Locator, expect } from '@playwright/test';
import { EditorHelpers } from '../utils/editor-helpers';

/**
 * Page Object Model for the BLG Editor
 */
export class EditorPage {
  private helpers: EditorHelpers;

  // Main elements
  readonly editor: Locator;
  readonly editorContent: Locator;
  readonly toolbar: Locator;
  readonly statusBar: Locator;

  // Toolbar buttons
  readonly boldButton: Locator;
  readonly italicButton: Locator;
  readonly underlineButton: Locator;
  readonly strikethroughButton: Locator;
  readonly codeButton: Locator;
  readonly linkButton: Locator;
  readonly imageButton: Locator;
  readonly videoButton: Locator;
  readonly tableButton: Locator;
  readonly blockquoteButton: Locator;
  readonly h1Button: Locator;
  readonly h2Button: Locator;
  readonly h3Button: Locator;
  readonly bulletListButton: Locator;
  readonly numberedListButton: Locator;
  readonly undoButton: Locator;
  readonly redoButton: Locator;

  // Dropdowns and modals
  readonly formatDropdown: Locator;
  readonly tableModal: Locator;
  readonly imageModal: Locator;
  readonly videoModal: Locator;
  readonly linkModal: Locator;

  // Form inputs
  readonly linkUrlInput: Locator;
  readonly linkTextInput: Locator;
  readonly videoUrlInput: Locator;
  readonly imageFileInput: Locator;
  readonly imageAltInput: Locator;

  constructor(private page: Page) {
    this.helpers = new EditorHelpers(page);

    // Main elements
    this.editor = page.locator('[data-testid="blg-editor"]');
    this.editorContent = page.locator('[contenteditable="true"]');
    this.toolbar = page.locator('[data-testid="editor-toolbar"]');
    this.statusBar = page.locator('[data-testid="editor-status-bar"]');

    // Toolbar buttons
    this.boldButton = this.toolbar.locator('[data-testid="toolbar-bold"]');
    this.italicButton = this.toolbar.locator('[data-testid="toolbar-italic"]');
    this.underlineButton = this.toolbar.locator('[data-testid="toolbar-underline"]');
    this.strikethroughButton = this.toolbar.locator('[data-testid="toolbar-strikethrough"]');
    this.codeButton = this.toolbar.locator('[data-testid="toolbar-code"]');
    this.linkButton = this.toolbar.locator('[data-testid="toolbar-link"]');
    this.imageButton = this.toolbar.locator('[data-testid="toolbar-image"]');
    this.videoButton = this.toolbar.locator('[data-testid="toolbar-video"]');
    this.tableButton = this.toolbar.locator('[data-testid="toolbar-table"]');
    this.blockquoteButton = this.toolbar.locator('[data-testid="toolbar-blockquote"]');
    this.h1Button = this.toolbar.locator('[data-testid="toolbar-h1"]');
    this.h2Button = this.toolbar.locator('[data-testid="toolbar-h2"]');
    this.h3Button = this.toolbar.locator('[data-testid="toolbar-h3"]');
    this.bulletListButton = this.toolbar.locator('[data-testid="toolbar-bullet-list"]');
    this.numberedListButton = this.toolbar.locator('[data-testid="toolbar-numbered-list"]');
    this.undoButton = this.toolbar.locator('[data-testid="toolbar-undo"]');
    this.redoButton = this.toolbar.locator('[data-testid="toolbar-redo"]');

    // Dropdowns and modals
    this.formatDropdown = page.locator('[data-testid="format-dropdown"]');
    this.tableModal = page.locator('[data-testid="table-modal"]');
    this.imageModal = page.locator('[data-testid="image-modal"]');
    this.videoModal = page.locator('[data-testid="video-modal"]');
    this.linkModal = page.locator('[data-testid="link-modal"]');

    // Form inputs
    this.linkUrlInput = page.locator('[data-testid="link-url-input"]');
    this.linkTextInput = page.locator('[data-testid="link-text-input"]');
    this.videoUrlInput = page.locator('[data-testid="video-url-input"]');
    this.imageFileInput = page.locator('[data-testid="image-file-input"]');
    this.imageAltInput = page.locator('[data-testid="image-alt-input"]');
  }

  /**
   * Navigate to the editor page
   */
  async goto(): Promise<void> {
    await this.page.goto('/editor');
    await this.waitForLoad();
  }

  /**
   * Wait for the editor to be fully loaded
   */
  async waitForLoad(): Promise<void> {
    await this.editor.waitFor({ state: 'visible' });
    await this.editorContent.waitFor({ state: 'visible' });
    await this.toolbar.waitFor({ state: 'visible' });
  }

  /**
   * Type text in the editor
   */
  async typeText(text: string): Promise<void> {
    await this.editorContent.click();
    await this.editorContent.type(text);
  }

  /**
   * Clear all content in the editor
   */
  async clearContent(): Promise<void> {
    await this.editorContent.click();
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.press('Delete');
  }

  /**
   * Get the current content as HTML
   */
  async getHtmlContent(): Promise<string> {
    return await this.editorContent.innerHTML();
  }

  /**
   * Get the current content as plain text
   */
  async getTextContent(): Promise<string> {
    return await this.editorContent.textContent() || '';
  }

  /**
   * Apply bold formatting
   */
  async applyBold(): Promise<void> {
    await this.boldButton.click();
  }

  /**
   * Apply italic formatting
   */
  async applyItalic(): Promise<void> {
    await this.italicButton.click();
  }

  /**
   * Apply underline formatting
   */
  async applyUnderline(): Promise<void> {
    await this.underlineButton.click();
  }

  /**
   * Apply strikethrough formatting
   */
  async applyStrikethrough(): Promise<void> {
    await this.strikethroughButton.click();
  }

  /**
   * Apply code formatting
   */
  async applyCode(): Promise<void> {
    await this.codeButton.click();
  }

  /**
   * Create a heading
   */
  async createHeading(level: 1 | 2 | 3): Promise<void> {
    const button = level === 1 ? this.h1Button : level === 2 ? this.h2Button : this.h3Button;
    await button.click();
  }

  /**
   * Create a blockquote
   */
  async createBlockquote(): Promise<void> {
    await this.blockquoteButton.click();
  }

  /**
   * Create a bullet list
   */
  async createBulletList(): Promise<void> {
    await this.bulletListButton.click();
  }

  /**
   * Create a numbered list
   */
  async createNumberedList(): Promise<void> {
    await this.numberedListButton.click();
  }

  /**
   * Insert a link
   */
  async insertLink(url: string, text?: string): Promise<void> {
    await this.linkButton.click();
    await this.linkModal.waitFor({ state: 'visible' });
    
    await this.linkUrlInput.fill(url);
    if (text) {
      await this.linkTextInput.fill(text);
    }
    
    await this.page.locator('[data-testid="insert-link-button"]').click();
    await this.linkModal.waitFor({ state: 'hidden' });
  }

  /**
   * Insert an image
   */
  async insertImage(filePath: string, altText?: string): Promise<void> {
    await this.imageButton.click();
    await this.imageModal.waitFor({ state: 'visible' });
    
    await this.imageFileInput.setInputFiles(filePath);
    if (altText) {
      await this.imageAltInput.fill(altText);
    }
    
    await this.page.locator('[data-testid="insert-image-button"]').click();
    await this.imageModal.waitFor({ state: 'hidden' });
  }

  /**
   * Insert a video
   */
  async insertVideo(videoUrl: string): Promise<void> {
    await this.videoButton.click();
    await this.videoModal.waitFor({ state: 'visible' });
    
    await this.videoUrlInput.fill(videoUrl);
    await this.page.locator('[data-testid="insert-video-button"]').click();
    await this.videoModal.waitFor({ state: 'hidden' });
  }

  /**
   * Insert a table
   */
  async insertTable(rows: number, cols: number): Promise<void> {
    await this.tableButton.click();
    await this.page.locator(`[data-testid="table-size-${rows}x${cols}"]`).click();
  }

  /**
   * Select text by typing and then selecting
   */
  async selectText(text: string): Promise<void> {
    await this.typeText(text);
    await this.page.keyboard.press('Control+a');
  }

  /**
   * Select all content
   */
  async selectAll(): Promise<void> {
    await this.editorContent.click();
    await this.page.keyboard.press('Control+a');
  }

  /**
   * Undo the last action
   */
  async undo(): Promise<void> {
    await this.undoButton.click();
  }

  /**
   * Redo the last undone action
   */
  async redo(): Promise<void> {
    await this.redoButton.click();
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
   * Check if a toolbar button is active
   */
  async isToolbarButtonActive(buttonName: string): Promise<boolean> {
    const button = this.toolbar.locator(`[data-testid="toolbar-${buttonName}"]`);
    const activeState = await button.getAttribute('data-active');
    return activeState === 'true';
  }

  /**
   * Get the word count
   */
  async getWordCount(): Promise<number> {
    const text = await this.getTextContent();
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get the character count
   */
  async getCharacterCount(): Promise<number> {
    const text = await this.getTextContent();
    return text.length;
  }

  /**
   * Take a screenshot of the editor
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.editor.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /**
   * Focus on the editor
   */
  async focus(): Promise<void> {
    await this.editorContent.click();
  }

  /**
   * Blur the editor
   */
  async blur(): Promise<void> {
    await this.page.locator('body').click();
  }

  /**
   * Check if the editor has focus
   */
  async isFocused(): Promise<boolean> {
    return await this.editorContent.isFocused();
  }

  /**
   * Wait for a specific editor state
   */
  async waitForState(state: 'ready' | 'loading' | 'error', timeout = 5000): Promise<void> {
    await this.page.waitForFunction(
      (expectedState) => {
        const editor = document.querySelector('[data-testid="blg-editor"]') as HTMLElement;
        return editor?.getAttribute('data-state') === expectedState;
      },
      state,
      { timeout }
    );
  }

  /**
   * Get validation errors
   */
  async getValidationErrors(): Promise<string[]> {
    const errorElements = this.page.locator('[data-testid="validation-error"]');
    const count = await errorElements.count();
    const errors: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const errorText = await errorElements.nth(i).textContent();
      if (errorText) {
        errors.push(errorText);
      }
    }
    
    return errors;
  }

  /**
   * Toggle between edit and preview modes
   */
  async togglePreviewMode(): Promise<void> {
    await this.page.locator('[data-testid="preview-toggle"]').click();
  }

  /**
   * Get the current mode (edit or preview)
   */
  async getCurrentMode(): Promise<'edit' | 'preview'> {
    const mode = await this.editor.getAttribute('data-mode');
    return mode === 'preview' ? 'preview' : 'edit';
  }
}