import { Page, expect, Locator } from '@playwright/test';
import { EditorPage } from '../page-objects/editor-page';

/**
 * Visual testing utilities for editor screenshots and comparisons
 */
export class VisualTestingUtils {
  constructor(private page: Page, private editorPage: EditorPage) {}

  /**
   * Take a screenshot of the entire editor
   */
  async screenshotEditor(name: string, options?: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
    mask?: Locator[];
    animations?: 'disabled' | 'allow';
  }): Promise<void> {
    await expect(this.editorPage.editor).toHaveScreenshot(`editor-${name}.png`, {
      fullPage: options?.fullPage,
      clip: options?.clip,
      mask: options?.mask,
      animations: options?.animations || 'disabled',
      threshold: 0.2,
      maxDiffPixels: 1000
    });
  }

  /**
   * Take a screenshot of just the toolbar
   */
  async screenshotToolbar(name: string): Promise<void> {
    await expect(this.editorPage.toolbar).toHaveScreenshot(`toolbar-${name}.png`, {
      animations: 'disabled',
      threshold: 0.2
    });
  }

  /**
   * Take a screenshot of the editor content area only
   */
  async screenshotContent(name: string, options?: {
    mask?: Locator[];
  }): Promise<void> {
    await expect(this.editorPage.editorContent).toHaveScreenshot(`content-${name}.png`, {
      animations: 'disabled',
      threshold: 0.2,
      mask: options?.mask
    });
  }

  /**
   * Take a screenshot of a modal or dialog
   */
  async screenshotModal(modalLocator: Locator, name: string): Promise<void> {
    await expect(modalLocator).toHaveScreenshot(`modal-${name}.png`, {
      animations: 'disabled',
      threshold: 0.2
    });
  }

  /**
   * Take screenshots at different viewport sizes
   */
  async screenshotResponsive(name: string, viewports?: Array<{
    name: string;
    width: number;
    height: number;
  }>): Promise<void> {
    const defaultViewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    const viewportsToTest = viewports || defaultViewports;

    for (const viewport of viewportsToTest) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(500); // Let layout settle
      
      await this.screenshotEditor(`${name}-${viewport.name}`, {
        fullPage: false
      });
    }
  }

  /**
   * Take screenshots with different themes
   */
  async screenshotThemes(name: string, themes?: string[]): Promise<void> {
    const defaultThemes = ['light', 'dark'];
    const themesToTest = themes || defaultThemes;

    for (const theme of themesToTest) {
      // Apply theme
      const themeToggle = this.page.locator(`[data-testid="theme-${theme}"]`);
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await this.page.waitForTimeout(500);
      } else {
        // Try alternative theme switching method
        await this.page.evaluate((themeName) => {
          document.documentElement.setAttribute('data-theme', themeName);
          document.documentElement.className = `theme-${themeName}`;
        }, theme);
        await this.page.waitForTimeout(500);
      }

      await this.screenshotEditor(`${name}-theme-${theme}`);
    }
  }

  /**
   * Take screenshots of different editor states
   */
  async screenshotStates(baseName: string): Promise<void> {
    // Empty state
    await this.editorPage.clearContent();
    await this.screenshotEditor(`${baseName}-empty`);

    // With basic content
    await this.editorPage.typeText('Sample content for visual testing');
    await this.screenshotEditor(`${baseName}-basic-content`);

    // With formatted content
    await this.editorPage.selectAll();
    await this.editorPage.applyBold();
    await this.screenshotEditor(`${baseName}-bold-content`);

    // Add more formatting
    await this.editorPage.page.keyboard.press('ArrowRight');
    await this.editorPage.page.keyboard.press('Enter');
    await this.editorPage.typeText('Italic text');
    await this.editorPage.selectAll();
    await this.editorPage.applyItalic();
    await this.screenshotEditor(`${baseName}-mixed-formatting`);

    // With table
    await this.editorPage.page.keyboard.press('ArrowDown');
    await this.editorPage.page.keyboard.press('Enter');
    await this.editorPage.insertTable(2, 2);
    await this.screenshotEditor(`${baseName}-with-table`);

    // Focused state
    await this.editorPage.editorContent.focus();
    await this.screenshotEditor(`${baseName}-focused`);
  }

  /**
   * Take screenshots of toolbar states
   */
  async screenshotToolbarStates(baseName: string): Promise<void> {
    // Default state
    await this.screenshotToolbar(`${baseName}-default`);

    // With active formatting buttons
    await this.editorPage.typeText('Format test');
    await this.editorPage.selectAll();
    await this.editorPage.applyBold();
    await this.screenshotToolbar(`${baseName}-bold-active`);

    await this.editorPage.applyItalic();
    await this.screenshotToolbar(`${baseName}-multiple-active`);

    // Hover state (if possible to simulate)
    await this.editorPage.underlineButton.hover();
    await this.screenshotToolbar(`${baseName}-hover-state`);

    // Focus state
    await this.editorPage.strikethroughButton.focus();
    await this.screenshotToolbar(`${baseName}-focus-state`);
  }

  /**
   * Take screenshots of modals and dialogs
   */
  async screenshotModals(baseName: string): Promise<void> {
    // Link modal
    await this.editorPage.linkButton.click();
    await this.screenshotModal(this.editorPage.linkModal, `${baseName}-link-modal`);
    await this.editorPage.page.keyboard.press('Escape');

    // Image modal
    await this.editorPage.imageButton.click();
    await this.screenshotModal(this.editorPage.imageModal, `${baseName}-image-modal`);
    await this.editorPage.page.keyboard.press('Escape');

    // Video modal
    await this.editorPage.videoButton.click();
    await this.screenshotModal(this.editorPage.videoModal, `${baseName}-video-modal`);
    await this.editorPage.page.keyboard.press('Escape');
  }

  /**
   * Take screenshots of error states
   */
  async screenshotErrorStates(baseName: string): Promise<void> {
    // Validation error in link modal
    await this.editorPage.linkButton.click();
    await this.editorPage.linkUrlInput.fill('invalid-url');
    await this.page.locator('[data-testid="insert-link-button"]').click();
    
    // Screenshot with error
    await this.screenshotModal(this.editorPage.linkModal, `${baseName}-link-validation-error`);
    await this.editorPage.page.keyboard.press('Escape');

    // File upload error (if we can simulate)
    const uploadError = this.page.locator('[data-testid="upload-error"]');
    if (await uploadError.isVisible()) {
      await this.screenshotEditor(`${baseName}-upload-error`);
    }
  }

  /**
   * Take accessibility focused screenshots
   */
  async screenshotAccessibility(baseName: string): Promise<void> {
    // High contrast mode simulation
    await this.page.addStyleTag({
      content: `
        * {
          filter: contrast(150%) brightness(110%) !important;
        }
      `
    });
    await this.screenshotEditor(`${baseName}-high-contrast`);

    // Remove high contrast
    await this.page.evaluate(() => {
      const styles = document.querySelectorAll('style');
      styles[styles.length - 1]?.remove();
    });

    // Focus indicators
    await this.editorPage.boldButton.focus();
    await this.screenshotToolbar(`${baseName}-focus-indicators`);

    // Screen reader content (structural view)
    await this.editorPage.clearContent();
    await this.editorPage.typeText('Heading');
    await this.editorPage.selectAll();
    await this.editorPage.createHeading(1);
    await this.editorPage.page.keyboard.press('ArrowDown');
    await this.editorPage.page.keyboard.press('Enter');
    await this.editorPage.typeText('Paragraph content');
    await this.screenshotContent(`${baseName}-semantic-structure`);
  }

  /**
   * Take performance-related screenshots
   */
  async screenshotPerformance(baseName: string): Promise<void> {
    // Large content rendering
    const longContent = 'A'.repeat(10000);
    await this.editorPage.typeText(longContent);
    await this.screenshotEditor(`${baseName}-large-content`);

    // Complex formatting
    await this.editorPage.selectAll();
    await this.editorPage.applyBold();
    await this.screenshotEditor(`${baseName}-formatted-large-content`);

    // Scrolling position
    await this.page.keyboard.press('Control+End');
    await this.screenshotEditor(`${baseName}-scrolled-position`);
  }

  /**
   * Take animation screenshots (before/after states)
   */
  async screenshotAnimations(baseName: string): Promise<void> {
    // Modal opening animation
    await this.screenshotEditor(`${baseName}-before-modal`);
    
    await this.editorPage.linkButton.click();
    // Take screenshot mid-animation if possible
    await this.page.waitForTimeout(100);
    await this.screenshotEditor(`${baseName}-modal-opening`);
    
    await this.editorPage.linkModal.waitFor({ state: 'visible' });
    await this.screenshotEditor(`${baseName}-modal-opened`);
    
    await this.editorPage.page.keyboard.press('Escape');
    await this.screenshotEditor(`${baseName}-modal-closed`);
  }

  /**
   * Compare screenshots with tolerance
   */
  async compareWithTolerance(
    actualScreenshot: Buffer,
    expectedPath: string,
    tolerance: number = 0.2
  ): Promise<boolean> {
    try {
      // This would typically use a dedicated image comparison library
      // For now, we'll use Playwright's built-in comparison
      await expect(actualScreenshot).toMatchSnapshot(expectedPath, {
        threshold: tolerance,
        maxDiffPixels: 1000
      });
      return true;
    } catch (error) {
      console.warn(`Screenshot comparison failed: ${error}`);
      return false;
    }
  }

  /**
   * Generate visual regression report
   */
  async generateVisualReport(testName: string): Promise<{
    passed: number;
    failed: number;
    differences: Array<{
      name: string;
      diff: number;
      status: 'passed' | 'failed';
    }>;
  }> {
    // This is a placeholder for a more sophisticated reporting system
    return {
      passed: 0,
      failed: 0,
      differences: []
    };
  }

  /**
   * Setup for visual testing (disable animations, etc.)
   */
  async setupVisualTesting(): Promise<void> {
    // Disable animations
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });

    // Set consistent font rendering
    await this.page.addStyleTag({
      content: `
        * {
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
      `
    });

    // Wait for fonts to load
    await this.page.waitForLoadState('networkidle');
    
    // Additional wait for stability
    await this.page.waitForTimeout(500);
  }

  /**
   * Cleanup after visual testing
   */
  async cleanupVisualTesting(): Promise<void> {
    // Remove custom styles
    await this.page.evaluate(() => {
      const customStyles = document.querySelectorAll('style[data-visual-test]');
      customStyles.forEach(style => style.remove());
    });
  }

  /**
   * Take a comprehensive visual test suite
   */
  async runFullVisualSuite(suiteName: string): Promise<void> {
    await this.setupVisualTesting();

    try {
      // Basic states
      await this.screenshotStates(suiteName);
      
      // Toolbar states
      await this.screenshotToolbarStates(suiteName);
      
      // Modals
      await this.screenshotModals(suiteName);
      
      // Responsive views
      await this.screenshotResponsive(suiteName);
      
      // Themes (if available)
      await this.screenshotThemes(suiteName);
      
      // Accessibility views
      await this.screenshotAccessibility(suiteName);
      
      // Error states
      await this.screenshotErrorStates(suiteName);
      
    } finally {
      await this.cleanupVisualTesting();
    }
  }
}