import { test, expect } from '@playwright/test';
import { EditorPage } from './page-objects/editor-page';
import { VisualTestingUtils } from './utils/visual-testing';
import { EditorTestData } from './utils/test-data-generator';

test.describe('Visual Regression Tests @visual', () => {
  let editorPage: EditorPage;
  let visualUtils: VisualTestingUtils;

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page);
    visualUtils = new VisualTestingUtils(page, editorPage);
    
    await editorPage.goto();
    await visualUtils.setupVisualTesting();
  });

  test.afterEach(async () => {
    await visualUtils.cleanupVisualTesting();
  });

  test.describe('Basic Editor Appearance', () => {
    test('should match baseline empty editor', async () => {
      await visualUtils.screenshotEditor('baseline-empty');
    });

    test('should match baseline editor with content', async () => {
      await editorPage.typeText('Sample content for visual baseline testing');
      await visualUtils.screenshotEditor('baseline-with-content');
    });

    test('should match editor with cursor visible', async () => {
      await editorPage.editorContent.focus();
      await visualUtils.screenshotEditor('baseline-focused');
    });

    test('should match editor with selection', async () => {
      await editorPage.typeText('Selected text content');
      await editorPage.selectAll();
      await visualUtils.screenshotEditor('baseline-with-selection');
    });
  });

  test.describe('Toolbar Appearance', () => {
    test('should match toolbar default state', async () => {
      await visualUtils.screenshotToolbar('toolbar-default');
    });

    test('should match toolbar with active buttons', async () => {
      await editorPage.typeText('Format this text');
      await editorPage.selectAll();
      await editorPage.applyBold();
      await editorPage.applyItalic();
      
      await visualUtils.screenshotToolbar('toolbar-active-buttons');
    });

    test('should match toolbar hover states', async () => {
      await editorPage.boldButton.hover();
      await visualUtils.screenshotToolbar('toolbar-hover');
    });

    test('should match toolbar focus states', async () => {
      await editorPage.boldButton.focus();
      await visualUtils.screenshotToolbar('toolbar-focus');
    });

    test('should match disabled toolbar buttons', async () => {
      // Undo button should be disabled initially
      await visualUtils.screenshotToolbar('toolbar-disabled-buttons');
    });
  });

  test.describe('Formatted Content Appearance', () => {
    test('should match bold text formatting', async () => {
      await editorPage.typeText('This text is bold');
      await editorPage.selectAll();
      await editorPage.applyBold();
      
      await visualUtils.screenshotContent('formatting-bold');
    });

    test('should match italic text formatting', async () => {
      await editorPage.typeText('This text is italic');
      await editorPage.selectAll();
      await editorPage.applyItalic();
      
      await visualUtils.screenshotContent('formatting-italic');
    });

    test('should match underline text formatting', async () => {
      await editorPage.typeText('This text is underlined');
      await editorPage.selectAll();
      await editorPage.applyUnderline();
      
      await visualUtils.screenshotContent('formatting-underline');
    });

    test('should match strikethrough text formatting', async () => {
      await editorPage.typeText('This text has strikethrough');
      await editorPage.selectAll();
      await editorPage.applyStrikethrough();
      
      await visualUtils.screenshotContent('formatting-strikethrough');
    });

    test('should match code text formatting', async () => {
      await editorPage.typeText('const code = "example";');
      await editorPage.selectAll();
      await editorPage.applyCode();
      
      await visualUtils.screenshotContent('formatting-code');
    });

    test('should match combined formatting', async () => {
      await editorPage.typeText('Bold italic underlined text');
      await editorPage.selectAll();
      await editorPage.applyBold();
      await editorPage.applyItalic();
      await editorPage.applyUnderline();
      
      await visualUtils.screenshotContent('formatting-combined');
    });
  });

  test.describe('Heading Styles', () => {
    test('should match H1 heading style', async () => {
      await editorPage.typeText('Heading Level 1');
      await editorPage.selectAll();
      await editorPage.createHeading(1);
      
      await visualUtils.screenshotContent('heading-h1');
    });

    test('should match H2 heading style', async () => {
      await editorPage.typeText('Heading Level 2');
      await editorPage.selectAll();
      await editorPage.createHeading(2);
      
      await visualUtils.screenshotContent('heading-h2');
    });

    test('should match H3 heading style', async () => {
      await editorPage.typeText('Heading Level 3');
      await editorPage.selectAll();
      await editorPage.createHeading(3);
      
      await visualUtils.screenshotContent('heading-h3');
    });

    test('should match heading hierarchy', async () => {
      await editorPage.typeText('Main Title');
      await editorPage.selectAll();
      await editorPage.createHeading(1);
      
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Section Title');
      await editorPage.selectAll();
      await editorPage.createHeading(2);
      
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Subsection Title');
      await editorPage.selectAll();
      await editorPage.createHeading(3);
      
      await visualUtils.screenshotContent('heading-hierarchy');
    });
  });

  test.describe('List Appearance', () => {
    test('should match bullet list style', async () => {
      await editorPage.typeText('First item');
      await editorPage.selectAll();
      await editorPage.createBulletList();
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Second item');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Third item');
      
      await visualUtils.screenshotContent('list-bullet');
    });

    test('should match numbered list style', async () => {
      await editorPage.typeText('First numbered item');
      await editorPage.selectAll();
      await editorPage.createNumberedList();
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Second numbered item');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Third numbered item');
      
      await visualUtils.screenshotContent('list-numbered');
    });

    test('should match nested list style', async () => {
      await editorPage.typeText('Main item 1');
      await editorPage.selectAll();
      await editorPage.createBulletList();
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.typeText('Nested item 1');
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Nested item 2');
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Shift+Tab');
      await editorPage.typeText('Main item 2');
      
      await visualUtils.screenshotContent('list-nested');
    });
  });

  test.describe('Blockquote Appearance', () => {
    test('should match blockquote style', async () => {
      await editorPage.typeText('This is a blockquote with important information that stands out from regular text.');
      await editorPage.selectAll();
      await editorPage.createBlockquote();
      
      await visualUtils.screenshotContent('blockquote-basic');
    });

    test('should match multiline blockquote', async () => {
      await editorPage.typeText('This is a longer blockquote that spans multiple lines to test how the styling handles line wrapping and maintains proper indentation throughout the quote.');
      await editorPage.selectAll();
      await editorPage.createBlockquote();
      
      await visualUtils.screenshotContent('blockquote-multiline');
    });
  });

  test.describe('Table Appearance', () => {
    test('should match 2x2 table style', async () => {
      await editorPage.insertTable(2, 2);
      
      // Add content to cells
      await editorPage.page.keyboard.type('Header 1');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Header 2');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Cell 1');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Cell 2');
      
      await visualUtils.screenshotContent('table-2x2');
    });

    test('should match 3x3 table style', async () => {
      await editorPage.insertTable(3, 3);
      
      // Fill with sample data
      const data = EditorTestData.generateTableData(3, 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          await editorPage.page.keyboard.type(data[i][j]);
          if (i !== 2 || j !== 2) {
            await editorPage.page.keyboard.press('Tab');
          }
        }
      }
      
      await visualUtils.screenshotContent('table-3x3');
    });

    test('should match table with formatting', async () => {
      await editorPage.insertTable(2, 3);
      
      // Add and format header row
      await editorPage.page.keyboard.type('Bold Header');
      await editorPage.page.keyboard.press('Control+a');
      await editorPage.applyBold();
      
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Italic Header');
      await editorPage.page.keyboard.press('Control+a');
      await editorPage.applyItalic();
      
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Normal Header');
      
      // Add data rows
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Data 1');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Data 2');
      await editorPage.page.keyboard.press('Tab');
      await editorPage.page.keyboard.type('Data 3');
      
      await visualUtils.screenshotContent('table-formatted');
    });
  });

  test.describe('Modal Appearance', () => {
    test('should match link modal', async () => {
      await editorPage.linkButton.click();
      await visualUtils.screenshotModal(editorPage.linkModal, 'link-modal');
    });

    test('should match image modal', async () => {
      await editorPage.imageButton.click();
      await visualUtils.screenshotModal(editorPage.imageModal, 'image-modal');
    });

    test('should match video modal', async () => {
      await editorPage.videoButton.click();
      await visualUtils.screenshotModal(editorPage.videoModal, 'video-modal');
    });

    test('should match modal with validation error', async () => {
      await editorPage.linkButton.click();
      await editorPage.linkUrlInput.fill('invalid-url');
      await editorPage.page.locator('[data-testid="insert-link-button"]').click();
      
      await visualUtils.screenshotModal(editorPage.linkModal, 'link-modal-error');
    });
  });

  test.describe('Responsive Design', () => {
    test('should match mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      await editorPage.typeText('Mobile responsive content');
      await visualUtils.screenshotEditor('responsive-mobile');
    });

    test('should match tablet layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      await editorPage.typeText('Tablet responsive content');
      await visualUtils.screenshotEditor('responsive-tablet');
    });

    test('should match desktop layout', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      await editorPage.typeText('Desktop responsive content');
      await visualUtils.screenshotEditor('responsive-desktop');
    });

    test('should match mobile toolbar adaptation', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.waitForTimeout(500);
      
      await visualUtils.screenshotToolbar('toolbar-mobile-narrow');
    });
  });

  test.describe('Theme Variations', () => {
    test('should match light theme', async ({ page }) => {
      // Ensure light theme is active
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
      });
      await page.waitForTimeout(500);
      
      await editorPage.typeText('Light theme content');
      await visualUtils.screenshotEditor('theme-light');
    });

    test('should match dark theme', async ({ page }) => {
      // Apply dark theme
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });
      await page.waitForTimeout(500);
      
      await editorPage.typeText('Dark theme content');
      await visualUtils.screenshotEditor('theme-dark');
    });

    test('should match high contrast theme', async ({ page }) => {
      // Apply high contrast
      await page.addStyleTag({
        content: `
          :root {
            --editor-bg: #ffffff;
            --editor-text: #000000;
            --editor-border: #000000;
            --toolbar-bg: #000000;
            --toolbar-text: #ffffff;
          }
          * {
            filter: contrast(150%) !important;
          }
        `
      });
      await page.waitForTimeout(500);
      
      await editorPage.typeText('High contrast content');
      await visualUtils.screenshotEditor('theme-high-contrast');
    });
  });

  test.describe('Complex Content Layouts', () => {
    test('should match mixed content document', async () => {
      // Create complex document
      await editorPage.typeText('Document Title');
      await editorPage.selectAll();
      await editorPage.createHeading(1);
      
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('This is an introductory paragraph with ');
      await editorPage.applyBold();
      await editorPage.typeText('bold');
      await editorPage.applyBold();
      await editorPage.typeText(' and ');
      await editorPage.applyItalic();
      await editorPage.typeText('italic');
      await editorPage.applyItalic();
      await editorPage.typeText(' text.');
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Section Heading');
      await editorPage.selectAll();
      await editorPage.createHeading(2);
      
      await editorPage.page.keyboard.press('ArrowDown');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('First list item');
      await editorPage.selectAll();
      await editorPage.createBulletList();
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Second list item');
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.insertTable(2, 2);
      
      await visualUtils.screenshotEditor('complex-mixed-content');
    });

    test('should match long document with scrolling', async () => {
      const longContent = EditorTestData.generateText({ paragraphs: 15 });
      await editorPage.typeText(longContent);
      
      // Screenshot at different scroll positions
      await visualUtils.screenshotEditor('long-document-top');
      
      await editorPage.page.keyboard.press('Control+End');
      await visualUtils.screenshotEditor('long-document-bottom');
      
      // Scroll to middle
      await editorPage.page.keyboard.press('Control+Home');
      for (let i = 0; i < 5; i++) {
        await editorPage.page.keyboard.press('PageDown');
      }
      await visualUtils.screenshotEditor('long-document-middle');
    });
  });

  test.describe('Interactive States', () => {
    test('should match selection states', async () => {
      await editorPage.typeText('Some text to select and highlight for visual testing');
      
      // Select first word
      await editorPage.page.keyboard.press('Control+Home');
      await editorPage.page.keyboard.press('Control+Shift+Right');
      await visualUtils.screenshotContent('selection-single-word');
      
      // Select multiple words
      await editorPage.page.keyboard.press('Shift+Control+Right');
      await editorPage.page.keyboard.press('Shift+Control+Right');
      await visualUtils.screenshotContent('selection-multiple-words');
      
      // Select all
      await editorPage.page.keyboard.press('Control+a');
      await visualUtils.screenshotContent('selection-all');
    });

    test('should match focus states', async () => {
      await editorPage.typeText('Focus state testing content');
      
      // Editor focus
      await editorPage.editorContent.focus();
      await visualUtils.screenshotEditor('focus-editor');
      
      // Toolbar button focus
      await editorPage.boldButton.focus();
      await visualUtils.screenshotEditor('focus-toolbar');
    });

    test('should match error states', async () => {
      // Upload error simulation
      const errorElement = editorPage.page.locator('[data-testid="error-message"]');
      if (await errorElement.isVisible()) {
        await visualUtils.screenshotEditor('error-state');
      }
    });
  });

  test.describe('Loading and Empty States', () => {
    test('should match loading state', async ({ page }) => {
      // Simulate loading state
      await page.evaluate(() => {
        const editor = document.querySelector('[data-testid="blg-editor"]') as HTMLElement;
        if (editor) {
          editor.setAttribute('data-state', 'loading');
        }
      });
      
      const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
      if (await loadingIndicator.isVisible()) {
        await visualUtils.screenshotEditor('loading-state');
      }
    });

    test('should match empty state with placeholder', async () => {
      // Should show placeholder text when empty
      const placeholder = editorPage.page.locator('[data-testid="editor-placeholder"]');
      if (await placeholder.isVisible()) {
        await visualUtils.screenshotEditor('empty-with-placeholder');
      } else {
        // Even without explicit placeholder, capture empty state
        await visualUtils.screenshotEditor('empty-state');
      }
    });
  });

  test.describe('Cross-browser Consistency', () => {
    test('should match consistent rendering', async () => {
      // Create standardized content for cross-browser testing
      await editorPage.typeText('Cross-browser consistency test');
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Bold text: ');
      await editorPage.applyBold();
      await editorPage.typeText('BOLD');
      await editorPage.applyBold();
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.typeText('Italic text: ');
      await editorPage.applyItalic();
      await editorPage.typeText('ITALIC');
      await editorPage.applyItalic();
      
      await editorPage.page.keyboard.press('Enter');
      await editorPage.insertTable(2, 2);
      
      await visualUtils.screenshotEditor('cross-browser-consistency');
    });
  });

  test.describe('Comprehensive Visual Suite', () => {
    test('should run complete visual regression suite', async () => {
      await visualUtils.runFullVisualSuite('comprehensive');
    });
  });
});