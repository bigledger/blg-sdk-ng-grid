import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Base class for BLG Editor E2E tests
 * Provides common utilities and page object methods
 */
export class EditorTestBase {
  constructor(public page: Page) {}

  // Navigation helpers
  async navigateToEditor(): Promise<void> {
    await this.page.goto('/editor-demo');
    await this.page.waitForSelector('[data-testid="editor-demo"]');
    await this.page.waitForLoadState('networkidle');
  }

  // Editor element getters
  get editorElement() {
    return this.page.locator('[data-testid="main-editor"] [contenteditable]');
  }

  get secondaryEditorElement() {
    return this.page.locator('[data-testid="secondary-editor"] [contenteditable]');
  }

  get toolbarElement() {
    return this.page.locator('[data-testid="editor-toolbar"]');
  }

  get statusPanel() {
    return this.page.locator('[data-testid="status-panel"]');
  }

  // Configuration helpers
  async setCompactMode(enabled: boolean): Promise<void> {
    const checkbox = this.page.locator('[data-testid="compact-mode-checkbox"]');
    if (enabled) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  async setReadonlyMode(enabled: boolean): Promise<void> {
    const checkbox = this.page.locator('[data-testid="readonly-mode-checkbox"]');
    if (enabled) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  async setDarkTheme(enabled: boolean): Promise<void> {
    const checkbox = this.page.locator('[data-testid="dark-theme-checkbox"]');
    if (enabled) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  // Content manipulation helpers
  async clearEditor(): Promise<void> {
    await this.page.click('[data-testid="clear-all-content"]');
    await this.waitForContentUpdate();
  }

  async typeInEditor(text: string): Promise<void> {
    await this.editorElement.click();
    await this.editorElement.type(text);
    await this.waitForContentUpdate();
  }

  async selectAllText(): Promise<void> {
    await this.editorElement.click();
    await this.page.keyboard.press('Control+a');
  }

  async cutText(): Promise<void> {
    await this.page.keyboard.press('Control+x');
    await this.waitForContentUpdate();
  }

  async copyText(): Promise<void> {
    await this.page.keyboard.press('Control+c');
  }

  async pasteText(): Promise<void> {
    await this.page.keyboard.press('Control+v');
    await this.waitForContentUpdate();
  }

  async undoAction(): Promise<void> {
    await this.page.keyboard.press('Control+z');
    await this.waitForContentUpdate();
  }

  async redoAction(): Promise<void> {
    await this.page.keyboard.press('Control+y');
    await this.waitForContentUpdate();
  }

  // Formatting helpers
  async toggleBold(): Promise<void> {
    await this.page.keyboard.press('Control+b');
    await this.waitForContentUpdate();
  }

  async toggleItalic(): Promise<void> {
    await this.page.keyboard.press('Control+i');
    await this.waitForContentUpdate();
  }

  async toggleUnderline(): Promise<void> {
    await this.page.keyboard.press('Control+u');
    await this.waitForContentUpdate();
  }

  // Selection helpers
  async selectTextRange(startOffset: number, endOffset: number): Promise<void> {
    await this.page.evaluate(
      ({ start, end }) => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        if (!editor) return;
        
        const range = document.createRange();
        const textNode = editor.firstChild;
        if (textNode) {
          range.setStart(textNode, start);
          range.setEnd(textNode, end);
          
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      },
      { start: startOffset, end: endOffset }
    );
  }

  async doubleClickWord(text: string): Promise<void> {
    await this.page.locator(`text=${text}`).first().dblclick();
  }

  // Validation helpers
  async getEditorContent(): Promise<string> {
    return await this.editorElement.innerHTML();
  }

  async getEditorTextContent(): Promise<string> {
    return await this.editorElement.textContent() || '';
  }

  async getWordCount(): Promise<number> {
    const countText = await this.page.locator('[data-testid="word-count"]').textContent();
    return parseInt(countText || '0', 10);
  }

  async getCharCount(): Promise<number> {
    const countText = await this.page.locator('[data-testid="char-count"]').textContent();
    return parseInt(countText || '0', 10);
  }

  async isEditorFocused(): Promise<boolean> {
    return await this.editorElement.evaluate(el => document.activeElement === el);
  }

  async getSelection(): Promise<{ text: string; collapsed: boolean }> {
    return await this.page.evaluate(() => {
      const selection = window.getSelection();
      return {
        text: selection?.toString() || '',
        collapsed: selection?.isCollapsed || true
      };
    });
  }

  // Wait helpers
  async waitForContentUpdate(): Promise<void> {
    await this.page.waitForTimeout(100); // Allow for content updates
  }

  async waitForAnimation(): Promise<void> {
    await this.page.waitForTimeout(300); // Allow for animations
  }

  // Screenshot helpers
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `e2e/editor-tests/screenshots/${name}.png`,
      fullPage: true
    });
  }

  async takeElementScreenshot(selector: string, name: string): Promise<void> {
    await this.page.locator(selector).screenshot({
      path: `e2e/editor-tests/screenshots/${name}.png`
    });
  }

  // Accessibility helpers
  async checkAriaLabel(selector: string, expectedLabel: string): Promise<void> {
    const ariaLabel = await this.page.locator(selector).getAttribute('aria-label');
    expect(ariaLabel).toBe(expectedLabel);
  }

  async checkRole(selector: string, expectedRole: string): Promise<void> {
    const role = await this.page.locator(selector).getAttribute('role');
    expect(role).toBe(expectedRole);
  }

  async testKeyboardNavigation(): Promise<void> {
    // Start from first focusable element
    await this.page.keyboard.press('Tab');
    
    let currentElement = await this.page.evaluate(() => document.activeElement?.tagName);
    const visitedElements: string[] = [currentElement || ''];
    
    // Navigate through all focusable elements
    for (let i = 0; i < 20; i++) { // Limit to prevent infinite loops
      await this.page.keyboard.press('Tab');
      currentElement = await this.page.evaluate(() => document.activeElement?.tagName);
      
      if (visitedElements.includes(currentElement || '')) {
        break; // We've completed the cycle
      }
      
      visitedElements.push(currentElement || '');
    }
    
    // Verify we can navigate back
    await this.page.keyboard.press('Shift+Tab');
  }

  // Performance helpers
  async measureRenderTime(): Promise<number> {
    return await this.page.evaluate(() => {
      const start = performance.now();
      return new Promise<number>(resolve => {
        requestAnimationFrame(() => {
          resolve(performance.now() - start);
        });
      });
    });
  }

  async measureMemoryUsage(): Promise<number> {
    return await this.page.evaluate(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
      }
      return 0;
    });
  }

  // Cross-browser compatibility helpers
  async getBrowserInfo(): Promise<{ name: string; version: string }> {
    return await this.page.evaluate(() => {
      const userAgent = navigator.userAgent;
      let name = 'Unknown';
      let version = 'Unknown';

      if (userAgent.includes('Chrome/')) {
        name = 'Chrome';
        const match = userAgent.match(/Chrome\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Firefox/')) {
        name = 'Firefox';
        const match = userAgent.match(/Firefox\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Safari/')) {
        name = 'Safari';
        const match = userAgent.match(/Version\/([0-9.]+)/);
        version = match ? match[1] : 'Unknown';
      }

      return { name, version };
    });
  }

  // Mobile-specific helpers
  async isMobileViewport(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width <= 768 : false;
  }

  async testTouchGesture(selector: string, gesture: 'tap' | 'swipe'): Promise<void> {
    const element = this.page.locator(selector);
    
    if (gesture === 'tap') {
      await element.tap();
    } else if (gesture === 'swipe') {
      const box = await element.boundingBox();
      if (box) {
        await this.page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      }
    }
  }
}

// Test fixtures and setup
test.describe('BLG Editor Test Base', () => {
  test('Base test setup validation', async ({ page }) => {
    const editor = new EditorTestBase(page);
    await editor.navigateToEditor();
    
    // Verify all main elements are present
    await expect(page.locator('[data-testid="editor-demo"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-editor"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-panel"]')).toBeVisible();
  });
});