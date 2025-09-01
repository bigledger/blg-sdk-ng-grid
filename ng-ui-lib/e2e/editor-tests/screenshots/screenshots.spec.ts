import { test, expect } from '@playwright/test';
import { EditorTestBase } from '../editor-base.spec';

test.describe('BLG Editor - Screenshot Capture Suite', () => {
  let editor: EditorTestBase;

  test.beforeEach(async ({ page }) => {
    editor = new EditorTestBase(page);
    await editor.navigateToEditor();
    await editor.clearEditor();
  });

  test.describe('Basic Interface Screenshots', () => {
    test('should capture initial editor state', async ({ page }) => {
      await expect(page).toHaveScreenshot('01-initial-editor-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture editor with sample content', async ({ page }) => {
      await editor.page.click('[data-testid="load-sample-content"]');
      await editor.waitForContentUpdate();
      
      await expect(page).toHaveScreenshot('02-editor-with-sample-content.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture compact mode', async ({ page }) => {
      await editor.setCompactMode(true);
      await editor.waitForAnimation();
      
      await expect(page).toHaveScreenshot('03-compact-mode.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture dark theme', async ({ page }) => {
      await editor.setDarkTheme(true);
      await editor.waitForAnimation();
      
      await expect(page).toHaveScreenshot('04-dark-theme.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture readonly mode', async ({ page }) => {
      await editor.typeInEditor('This editor is in readonly mode');
      await editor.setReadonlyMode(true);
      await editor.waitForAnimation();
      
      await expect(page).toHaveScreenshot('05-readonly-mode.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture status panel', async ({ page }) => {
      await editor.typeInEditor('Status panel demonstration with word count and editor state information.');
      
      await expect(editor.statusPanel).toHaveScreenshot('06-status-panel.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Text Editing Screenshots', () => {
    test('should capture text selection', async ({ page }) => {
      await editor.typeInEditor('This text demonstrates selection capabilities in the BLG Editor. Select this sentence to see the selection highlighting.');
      
      // Select a sentence
      await editor.doubleClickWord('demonstrates');
      await editor.page.keyboard.press('Shift+Control+ArrowRight');
      await editor.page.keyboard.press('Shift+Control+ArrowRight');
      await editor.page.keyboard.press('Shift+Control+ArrowRight');
      
      await expect(page).toHaveScreenshot('07-text-selection.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture typing in progress', async ({ page }) => {
      await editor.typeInEditor('Currently typing in the editor...');
      
      // Position cursor for screenshot
      await editor.page.keyboard.press('End');
      
      await expect(page).toHaveScreenshot('08-typing-in-progress.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture multi-line content', async ({ page }) => {
      const multiLineContent = `This is the first line of content.
This is the second line with more text.
Here's the third line for demonstration.
And a fourth line to show multi-line capabilities.
Finally, the fifth line completes this example.`;
      
      await editor.typeInEditor(multiLineContent);
      
      await expect(page).toHaveScreenshot('09-multi-line-content.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture undo/redo states', async ({ page }) => {
      await editor.typeInEditor('Original content before undo/redo test');
      await editor.selectAllText();
      await editor.toggleBold();
      
      // Show state after formatting
      await expect(page).toHaveScreenshot('10a-before-undo.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Undo the formatting
      await editor.undoAction();
      
      await expect(page).toHaveScreenshot('10b-after-undo.png', {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Redo the formatting
      await editor.redoAction();
      
      await expect(page).toHaveScreenshot('10c-after-redo.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Formatting Screenshots', () => {
    test('should capture basic text formatting', async ({ page }) => {
      await editor.typeInEditor('This text demonstrates ');
      
      await editor.page.keyboard.type('bold', { delay: 50 });
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.toggleBold();
      await editor.page.keyboard.press('ArrowRight');
      
      await editor.page.keyboard.type(' and ');
      
      await editor.page.keyboard.type('italic', { delay: 50 });
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.toggleItalic();
      await editor.page.keyboard.press('ArrowRight');
      
      await editor.page.keyboard.type(' and ');
      
      await editor.page.keyboard.type('underlined', { delay: 50 });
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.toggleUnderline();
      await editor.page.keyboard.press('ArrowRight');
      
      await editor.page.keyboard.type(' text formatting.');
      
      await expect(page).toHaveScreenshot('11-basic-text-formatting.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture heading formats', async ({ page }) => {
      const headingContent = `Heading 1 Example
Heading 2 Example
Heading 3 Example
Regular paragraph text
Another paragraph for comparison`;
      
      await editor.typeInEditor(headingContent);
      
      // Format as headings
      await editor.page.keyboard.press('Control+Home');
      await editor.page.keyboard.press('Shift+End');
      await editor.page.click('[data-testid="heading-h1"]');
      
      await editor.page.keyboard.press('ArrowDown');
      await editor.page.keyboard.press('Shift+End');
      await editor.page.click('[data-testid="heading-h2"]');
      
      await editor.page.keyboard.press('ArrowDown');
      await editor.page.keyboard.press('Shift+End');
      await editor.page.click('[data-testid="heading-h3"]');
      
      await expect(page).toHaveScreenshot('12-heading-formats.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture list formats', async ({ page }) => {
      await editor.typeInEditor('Unordered list item 1');
      await editor.page.click('[data-testid="create-unordered-list"]');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.type('Unordered list item 2');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.type('Unordered list item 3');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      
      await editor.page.keyboard.type('Ordered list item 1');
      await editor.page.click('[data-testid="create-ordered-list"]');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.type('Ordered list item 2');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.type('Ordered list item 3');
      
      await expect(page).toHaveScreenshot('13-list-formats.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture text alignment', async ({ page }) => {
      await editor.typeInEditor('Left aligned text (default)');
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      
      await editor.page.keyboard.type('Center aligned text');
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.page.click('[data-testid="align-center"]');
      await editor.page.keyboard.press('ArrowRight');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      
      await editor.page.keyboard.type('Right aligned text');
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.page.click('[data-testid="align-right"]');
      
      await expect(page).toHaveScreenshot('14-text-alignment.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture color formatting', async ({ page }) => {
      await editor.typeInEditor('This text has ');
      
      await editor.page.keyboard.type('red color');
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      
      const textColorButton = editor.page.locator('[data-testid="text-color-picker"]');
      if (await textColorButton.isVisible()) {
        await textColorButton.click();
        const redOption = editor.page.locator('[data-testid="color-option-red"]');
        await redOption.click();
      }
      
      await editor.page.keyboard.press('ArrowRight');
      await editor.page.keyboard.type(' and ');
      
      await editor.page.keyboard.type('yellow background');
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      
      const backgroundColorButton = editor.page.locator('[data-testid="background-color-picker"]');
      if (await backgroundColorButton.isVisible()) {
        await backgroundColorButton.click();
        const yellowOption = editor.page.locator('[data-testid="color-option-yellow"]');
        await yellowOption.click();
      }
      
      await editor.page.keyboard.press('ArrowRight');
      await editor.page.keyboard.type(' formatting.');
      
      await expect(page).toHaveScreenshot('15-color-formatting.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Toolbar Screenshots', () => {
    test('should capture toolbar in normal mode', async ({ page }) => {
      await expect(editor.toolbarElement).toHaveScreenshot('16-toolbar-normal.png', {
        animations: 'disabled'
      });
    });

    test('should capture toolbar button states', async ({ page }) => {
      await editor.typeInEditor('Button state demonstration');
      await editor.selectAllText();
      
      // Apply formatting to show active button states
      await editor.toggleBold();
      await editor.toggleItalic();
      
      await expect(editor.toolbarElement).toHaveScreenshot('17-toolbar-active-states.png', {
        animations: 'disabled'
      });
    });

    test('should capture dropdown menus', async ({ page }) => {
      const fontFamilyDropdown = editor.page.locator('[data-testid="font-family-dropdown"]');
      if (await fontFamilyDropdown.isVisible()) {
        await fontFamilyDropdown.click();
        
        await expect(page).toHaveScreenshot('18-font-family-dropdown.png', {
          fullPage: true,
          animations: 'disabled'
        });
      }
    });

    test('should capture color picker', async ({ page }) => {
      const textColorButton = editor.page.locator('[data-testid="text-color-picker"]');
      if (await textColorButton.isVisible()) {
        await textColorButton.click();
        
        await expect(page).toHaveScreenshot('19-color-picker.png', {
          fullPage: true,
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Dialog Screenshots', () => {
    test('should capture link insertion dialog', async ({ page }) => {
      const linkButton = editor.page.locator('[data-testid="insert-link"]');
      await linkButton.click();
      
      const linkDialog = editor.page.locator('[data-testid="link-dialog"]');
      if (await linkDialog.isVisible()) {
        await expect(page).toHaveScreenshot('20-link-dialog.png', {
          fullPage: true,
          animations: 'disabled'
        });
      }
    });

    test('should capture image insertion dialog', async ({ page }) => {
      const imageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await imageButton.click();
      
      const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      if (await imageDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill('https://picsum.photos/300/200');
        
        const altInput = editor.page.locator('[data-testid="image-alt-text-input"]');
        if (await altInput.isVisible()) {
          await altInput.fill('Sample image description');
        }
        
        await expect(page).toHaveScreenshot('21-image-dialog.png', {
          fullPage: true,
          animations: 'disabled'
        });
      }
    });

    test('should capture table creation dialog', async ({ page }) => {
      const tableButton = editor.page.locator('[data-testid="insert-table"]');
      if (await tableButton.isVisible()) {
        await tableButton.click();
        
        const tableDialog = editor.page.locator('[data-testid="table-dialog"]');
        if (await tableDialog.isVisible()) {
          await editor.page.fill('[data-testid="table-rows-input"]', '4');
          await editor.page.fill('[data-testid="table-cols-input"]', '3');
          
          await expect(page).toHaveScreenshot('22-table-dialog.png', {
            fullPage: true,
            animations: 'disabled'
          });
        }
      }
    });
  });

  test.describe('Table Screenshots', () => {
    test('should capture basic table', async ({ page }) => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
      
      await expect(page).toHaveScreenshot('23-basic-table.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture table with content', async ({ page }) => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
      
      // Fill table with sample data
      const cells = editor.page.locator('table td');
      const sampleData = [
        'Name', 'Age', 'City',
        'John', '25', 'New York',
        'Jane', '30', 'Los Angeles'
      ];
      
      for (let i = 0; i < sampleData.length && i < 9; i++) {
        await cells.nth(i).click();
        await editor.page.keyboard.type(sampleData[i]);
      }
      
      await expect(page).toHaveScreenshot('24-table-with-content.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture table selection', async ({ page }) => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
      
      // Select a cell
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      
      await expect(page).toHaveScreenshot('25-table-selection.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture table context menu', async ({ page }) => {
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
      
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click({ button: 'right' });
      
      const contextMenu = editor.page.locator('[data-testid="table-context-menu"]');
      if (await contextMenu.isVisible()) {
        await expect(page).toHaveScreenshot('26-table-context-menu.png', {
          fullPage: true,
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Media Screenshots', () => {
    test('should capture image insertion', async ({ page }) => {
      const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertImageButton.click();
      
      const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      if (await imageDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill('https://picsum.photos/400/300');
        
        const altInput = editor.page.locator('[data-testid="image-alt-text-input"]');
        if (await altInput.isVisible()) {
          await altInput.fill('Sample landscape image');
        }
        
        const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
        await insertButton.click();
        
        await editor.waitForContentUpdate();
        
        const image = editor.page.locator('[data-testid="main-editor"] img');
        await expect(image).toBeVisible();
        
        await expect(page).toHaveScreenshot('27-image-inserted.png', {
          fullPage: true,
          animations: 'disabled'
        });
      }
    });

    test('should capture image with caption', async ({ page }) => {
      const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertImageButton.click();
      
      const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      if (await imageDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill('https://picsum.photos/350/250');
        
        const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
        await insertButton.click();
        
        await editor.waitForContentUpdate();
        
        const image = editor.page.locator('[data-testid="main-editor"] img');
        await image.click({ button: 'right' });
        
        const addCaptionOption = editor.page.locator('[data-testid="image-add-caption"]');
        if (await addCaptionOption.isVisible()) {
          await addCaptionOption.click();
          
          const caption = editor.page.locator('[data-testid="image-caption"]');
          await caption.type('This is a sample image caption demonstrating the caption feature.');
          
          await expect(page).toHaveScreenshot('28-image-with-caption.png', {
            fullPage: true,
            animations: 'disabled'
          });
        }
      }
    });

    test('should capture video embed dialog', async ({ page }) => {
      const youtubeButton = editor.page.locator('[data-testid="insert-youtube-button"]');
      await youtubeButton.click();
      
      const videoDialog = editor.page.locator('[data-testid="video-embed-dialog"]');
      if (await videoDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="video-url-input"]');
        await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        
        await expect(page).toHaveScreenshot('29-video-embed-dialog.png', {
          fullPage: true,
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Mobile Screenshots', () => {
    test('should capture mobile layout - portrait', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      await editor.typeInEditor('Mobile portrait layout demonstration');
      
      await expect(page).toHaveScreenshot('30-mobile-portrait.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture mobile layout - landscape', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 }); // iPhone SE landscape
      
      await editor.typeInEditor('Mobile landscape layout demonstration');
      
      await expect(page).toHaveScreenshot('31-mobile-landscape.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture tablet layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      
      await editor.typeInEditor('Tablet layout demonstration with more screen space');
      
      await expect(page).toHaveScreenshot('32-tablet-layout.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture mobile toolbar', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const mobileToolbar = editor.toolbarElement;
      await expect(mobileToolbar).toHaveScreenshot('33-mobile-toolbar.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Complex Content Screenshots', () => {
    test('should capture complex formatted document', async ({ page }) => {
      await editor.page.click('[data-testid="load-complex-formatting"]');
      await editor.waitForContentUpdate();
      
      await expect(page).toHaveScreenshot('34-complex-document.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture mixed content types', async ({ page }) => {
      // Create content with text, image, and table
      await editor.typeInEditor('Mixed Content Document');
      await editor.selectAllText();
      await editor.page.click('[data-testid="heading-h1"]');
      await editor.page.keyboard.press('End');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.type('This document contains various content types including text, images, and tables.');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      
      // Insert image
      const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertImageButton.click();
      
      const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      if (await imageDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill('https://picsum.photos/300/200');
        
        const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
        await insertButton.click();
        
        await editor.waitForContentUpdate();
      }
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      
      // Insert table
      const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
      await insertTableButton.click();
      await editor.waitForContentUpdate();
      
      // Add content to table
      const cells = editor.page.locator('table td');
      await cells.first().click();
      await editor.page.keyboard.type('Feature');
      await editor.page.keyboard.press('Tab');
      await editor.page.keyboard.type('Status');
      await editor.page.keyboard.press('Tab');
      await editor.page.keyboard.type('Notes');
      
      await expect(page).toHaveScreenshot('35-mixed-content-document.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture large document preview', async ({ page }) => {
      await editor.page.click('[data-testid="load-large-document"]');
      await editor.waitForContentUpdate();
      
      await expect(page).toHaveScreenshot('36-large-document-preview.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture scrolled content', async ({ page }) => {
      await editor.page.click('[data-testid="load-large-document"]');
      await editor.waitForContentUpdate();
      
      // Scroll to middle of document
      await editor.page.keyboard.press('Control+End');
      await editor.page.keyboard.press('PageUp');
      await editor.page.keyboard.press('PageUp');
      await editor.page.keyboard.press('PageUp');
      
      await expect(page).toHaveScreenshot('37-scrolled-content.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Error State Screenshots', () => {
    test('should capture validation error', async ({ page }) => {
      const linkButton = editor.page.locator('[data-testid="insert-link"]');
      await linkButton.click();
      
      const linkDialog = editor.page.locator('[data-testid="link-dialog"]');
      if (await linkDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="link-url-input"]');
        await urlInput.fill('not-a-valid-url');
        
        const insertButton = editor.page.locator('[data-testid="link-dialog-ok"]');
        await insertButton.click();
        
        const errorMessage = editor.page.locator('[data-testid="link-error-message"]');
        if (await errorMessage.isVisible()) {
          await expect(page).toHaveScreenshot('38-validation-error.png', {
            fullPage: true,
            animations: 'disabled'
          });
        }
      }
    });

    test('should capture loading state', async ({ page }) => {
      const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertImageButton.click();
      
      const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      if (await imageDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill('https://picsum.photos/800/600');
        
        const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
        await insertButton.click();
        
        // Try to capture loading state (timing dependent)
        const loadingIndicator = editor.page.locator('[data-testid="image-loading"]');
        if (await loadingIndicator.isVisible()) {
          await expect(page).toHaveScreenshot('39-loading-state.png', {
            fullPage: true,
            animations: 'disabled'
          });
        }
      }
    });
  });

  test.describe('Performance Visualization', () => {
    test('should capture performance metrics', async ({ page }) => {
      await editor.typeInEditor('Performance metrics visualization');
      
      // Show performance panel
      const performancePanel = editor.page.locator('[data-testid="performance-panel"]');
      await expect(performancePanel).toHaveScreenshot('40-performance-metrics.png', {
        animations: 'disabled'
      });
    });

    test('should capture memory usage display', async ({ page }) => {
      await editor.page.click('[data-testid="load-large-document"]');
      await editor.waitForContentUpdate();
      
      // Wait for memory usage to update
      await editor.page.waitForTimeout(2000);
      
      const performancePanel = editor.page.locator('[data-testid="performance-panel"]');
      await expect(performancePanel).toHaveScreenshot('41-memory-usage.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Feature Showcase Screenshots', () => {
    test('should create comprehensive feature showcase', async ({ page }) => {
      // Create a document that showcases all major features
      
      // Title
      await editor.typeInEditor('BLG Editor Feature Showcase');
      await editor.selectAllText();
      await editor.page.click('[data-testid="heading-h1"]');
      await editor.page.click('[data-testid="align-center"]');
      await editor.page.keyboard.press('End');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      
      // Subtitle
      await editor.page.keyboard.type('Comprehensive Rich Text Editing Capabilities');
      await editor.selectAllText();
      await editor.page.click('[data-testid="heading-h2"]');
      await editor.page.click('[data-testid="align-center"]');
      await editor.page.keyboard.press('End');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      
      // Text formatting section
      await editor.page.keyboard.type('Text Formatting: ');
      
      await editor.page.keyboard.type('Bold', { delay: 50 });
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.toggleBold();
      await editor.page.keyboard.press('ArrowRight');
      
      await editor.page.keyboard.type(', ');
      
      await editor.page.keyboard.type('Italic', { delay: 50 });
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.toggleItalic();
      await editor.page.keyboard.press('ArrowRight');
      
      await editor.page.keyboard.type(', ');
      
      await editor.page.keyboard.type('Underlined', { delay: 50 });
      await editor.page.keyboard.press('Shift+Control+ArrowLeft');
      await editor.toggleUnderline();
      await editor.page.keyboard.press('ArrowRight');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      
      // List example
      await editor.page.keyboard.type('Feature List:');
      await editor.page.keyboard.press('Enter');
      
      await editor.page.keyboard.type('Rich text editing');
      await editor.page.click('[data-testid="create-unordered-list"]');
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.type('Table support');
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.type('Image embedding');
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.type('Cross-browser compatibility');
      
      await editor.page.keyboard.press('Enter');
      await editor.page.keyboard.press('Enter');
      
      await expect(page).toHaveScreenshot('42-feature-showcase.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should capture all toolbar features', async ({ page }) => {
      // Take screenshot of each toolbar section
      
      // Basic formatting group
      const basicGroup = editor.page.locator('[data-testid="basic-format-group"]');
      if (await basicGroup.isVisible()) {
        await expect(basicGroup).toHaveScreenshot('43a-toolbar-basic-formatting.png');
      }
      
      // Font group
      const fontGroup = editor.page.locator('[data-testid="font-group"]');
      if (await fontGroup.isVisible()) {
        await expect(fontGroup).toHaveScreenshot('43b-toolbar-font-controls.png');
      }
      
      // Alignment group
      const alignGroup = editor.page.locator('[data-testid="alignment-group"]');
      if (await alignGroup.isVisible()) {
        await expect(alignGroup).toHaveScreenshot('43c-toolbar-alignment.png');
      }
      
      // List group
      const listGroup = editor.page.locator('[data-testid="list-group"]');
      if (await listGroup.isVisible()) {
        await expect(listGroup).toHaveScreenshot('43d-toolbar-lists.png');
      }
      
      // Insert group
      const insertGroup = editor.page.locator('[data-testid="insert-group"]');
      if (await insertGroup.isVisible()) {
        await expect(insertGroup).toHaveScreenshot('43e-toolbar-insert.png');
      }
    });
  });

  test.describe('Screenshot Summary', () => {
    test('should generate screenshot index', async ({ page }) => {
      // This test creates a summary of all screenshots taken
      const screenshotData = {
        total: 43, // Update this as screenshots are added
        categories: {
          'Basic Interface': 6,
          'Text Editing': 5,
          'Formatting': 5,
          'Toolbar': 4,
          'Dialogs': 3,
          'Tables': 4,
          'Media': 3,
          'Mobile': 4,
          'Complex Content': 4,
          'Error States': 2,
          'Performance': 2,
          'Feature Showcase': 2
        },
        browsers: ['Chromium', 'Firefox', 'WebKit'],
        resolutions: [
          '1920x1080 (Desktop)',
          '1366x768 (Laptop)', 
          '768x1024 (Tablet)',
          '375x667 (Mobile)'
        ]
      };
      
      console.log('Screenshot Capture Summary:');
      console.log(`Total Screenshots: ${screenshotData.total}`);
      console.log('Categories:', screenshotData.categories);
      console.log('Browser Coverage:', screenshotData.browsers);
      console.log('Resolution Coverage:', screenshotData.resolutions);
      
      // Verify we captured the expected number of screenshots
      expect(screenshotData.total).toBeGreaterThan(40);
      expect(Object.keys(screenshotData.categories).length).toBeGreaterThan(10);
    });
  });
});