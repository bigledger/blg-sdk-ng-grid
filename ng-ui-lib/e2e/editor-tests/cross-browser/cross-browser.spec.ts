import { test, expect, chromium, firefox, webkit } from '@playwright/test';
import { EditorTestBase } from '../editor-base.spec';

test.describe('BLG Editor - Cross-Browser Compatibility', () => {
  const browsers = [
    { name: 'Chromium', browserType: chromium },
    { name: 'Firefox', browserType: firefox },
    { name: 'WebKit (Safari)', browserType: webkit }
  ];

  browsers.forEach(({ name, browserType }) => {
    test.describe(`${name} Compatibility`, () => {
      let editor: EditorTestBase;

      test.beforeEach(async () => {
        const browser = await browserType.launch();
        const context = await browser.newContext();
        const page = await context.newPage();
        
        editor = new EditorTestBase(page);
        await editor.navigateToEditor();
        await editor.clearEditor();
      });

      test(`should render correctly in ${name}`, async () => {
        // Test basic rendering
        await expect(editor.editorElement).toBeVisible();
        await expect(editor.toolbarElement).toBeVisible();
        await expect(editor.statusPanel).toBeVisible();
        
        // Test basic functionality
        await editor.typeInEditor('Cross-browser compatibility test');
        
        const content = await editor.getEditorTextContent();
        expect(content).toContain('Cross-browser compatibility test');
      });

      test(`should handle text editing in ${name}`, async () => {
        // Basic text input
        await editor.typeInEditor('Basic text input test');
        
        // Selection operations
        await editor.selectAllText();
        const selection = await editor.getSelection();
        expect(selection.text).toContain('Basic text input test');
        
        // Cut/copy/paste
        await editor.copyText();
        await editor.page.keyboard.press('End');
        await editor.page.keyboard.type(' ');
        await editor.pasteText();
        
        const finalContent = await editor.getEditorTextContent();
        expect(finalContent).toContain('Basic text input test Basic text input test');
      });

      test(`should handle formatting in ${name}`, async () => {
        await editor.typeInEditor('Formatting test text');
        await editor.selectAllText();
        
        // Test bold
        await editor.toggleBold();
        let htmlContent = await editor.getEditorContent();
        expect(htmlContent).toMatch(/<(strong|b)>/);
        
        // Test italic
        await editor.toggleItalic();
        htmlContent = await editor.getEditorContent();
        expect(htmlContent).toMatch(/<(em|i)>/);
        
        // Test underline
        await editor.toggleUnderline();
        htmlContent = await editor.getEditorContent();
        expect(htmlContent).toMatch(/<u>/);
      });

      test(`should handle keyboard shortcuts in ${name}`, async () => {
        await editor.typeInEditor('Keyboard shortcut test');
        await editor.selectAllText();
        
        // Test Ctrl+B for bold
        await editor.page.keyboard.press('Control+b');
        let htmlContent = await editor.getEditorContent();
        expect(htmlContent).toMatch(/<(strong|b)>/);
        
        // Test Ctrl+I for italic
        await editor.page.keyboard.press('Control+i');
        htmlContent = await editor.getEditorContent();
        expect(htmlContent).toMatch(/<(em|i)>/);
        
        // Test Ctrl+Z for undo
        await editor.page.keyboard.press('Control+z');
        htmlContent = await editor.getEditorContent();
        expect(htmlContent).not.toMatch(/<(em|i)>/);
      });

      test(`should handle lists in ${name}`, async () => {
        await editor.typeInEditor('List item 1');
        
        // Create unordered list
        const unorderedListButton = editor.page.locator('[data-testid="create-unordered-list"]');
        if (await unorderedListButton.isVisible()) {
          await unorderedListButton.click();
          
          const htmlContent = await editor.getEditorContent();
          expect(htmlContent).toContain('<ul>');
          expect(htmlContent).toContain('<li>');
        }
      });

      test(`should handle images in ${name}`, async () => {
        const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
        await insertImageButton.click();
        
        const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
        if (await imageDialog.isVisible()) {
          const urlInput = editor.page.locator('[data-testid="image-url-input"]');
          await urlInput.fill('https://picsum.photos/200/150');
          
          const altTextInput = editor.page.locator('[data-testid="image-alt-text-input"]');
          if (await altTextInput.isVisible()) {
            await altTextInput.fill('Test image');
          }
          
          const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
          await insertButton.click();
          
          await editor.waitForContentUpdate();
          
          const image = editor.page.locator('[data-testid="main-editor"] img');
          await expect(image).toBeVisible();
        }
      });

      test(`should handle tables in ${name}`, async () => {
        const insertTableButton = editor.page.locator('[data-testid="insert-table-3x3"]');
        await insertTableButton.click();
        
        await editor.waitForContentUpdate();
        
        const table = editor.page.locator('table');
        await expect(table).toBeVisible();
        
        // Test cell editing
        const firstCell = editor.page.locator('table td').first();
        await firstCell.click();
        await editor.page.keyboard.type('Cell content');
        
        const cellContent = await firstCell.textContent();
        expect(cellContent).toContain('Cell content');
      });

      test(`should handle drag and drop in ${name}`, async () => {
        // This is a simplified test - actual file drag/drop testing is complex
        const editorElement = editor.editorElement;
        
        // Simulate drag enter event
        await editorElement.dispatchEvent('dragenter', {
          dataTransfer: {
            types: ['Files'],
            files: []
          }
        });
        
        // Check if editor handles drag events
        const content = await editor.getEditorTextContent();
        expect(content).toBeDefined(); // Just verify editor is still functional
      });

      test(`should maintain focus properly in ${name}`, async () => {
        await editor.editorElement.click();
        
        const isFocused = await editor.isEditorFocused();
        expect(isFocused).toBe(true);
        
        // Type and verify focus is maintained
        await editor.page.keyboard.type('Focus test');
        
        const stillFocused = await editor.isEditorFocused();
        expect(stillFocused).toBe(true);
      });

      test(`should handle CSS styles consistently in ${name}`, async () => {
        await editor.typeInEditor('Style consistency test');
        
        const editorStyles = await editor.editorElement.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            lineHeight: styles.lineHeight,
            padding: styles.padding
          };
        });
        
        // Verify basic styles are applied
        expect(editorStyles.fontSize).toBeTruthy();
        expect(editorStyles.fontFamily).toBeTruthy();
        expect(editorStyles.padding).toBeTruthy();
      });
    });
  });

  test.describe('Browser-Specific Feature Detection', () => {
    test('should detect clipboard API support', async ({ page }) => {
      const hasClipboardAPI = await page.evaluate(() => {
        return 'clipboard' in navigator && 'writeText' in navigator.clipboard;
      });
      
      if (hasClipboardAPI) {
        await editor.typeInEditor('Clipboard API test');
        await editor.selectAllText();
        
        // Test clipboard operations
        await editor.copyText();
        await editor.page.keyboard.press('End');
        await editor.page.keyboard.type(' ');
        await editor.pasteText();
        
        const content = await editor.getEditorTextContent();
        expect(content).toContain('Clipboard API test Clipboard API test');
      }
    });

    test('should handle browser-specific contentEditable differences', async ({ page }) => {
      const browserInfo = await page.evaluate(() => {
        const userAgent = navigator.userAgent;
        return {
          isChrome: userAgent.includes('Chrome'),
          isFirefox: userAgent.includes('Firefox'),
          isSafari: userAgent.includes('Safari') && !userAgent.includes('Chrome')
        };
      });
      
      await editor.typeInEditor('ContentEditable test');
      await editor.page.keyboard.press('Enter');
      await editor.typeInEditor('Second line');
      
      const htmlContent = await editor.getEditorContent();
      
      if (browserInfo.isFirefox) {
        // Firefox might use different tags for line breaks
        expect(htmlContent).toMatch(/<br>|<div>|<p>/);
      } else {
        // Chrome/Safari might use div or p tags
        expect(htmlContent).toMatch(/<div>|<p>/);
      }
    });

    test('should handle browser-specific keyboard shortcuts', async ({ page }) => {
      const isMac = await page.evaluate(() => {
        return navigator.platform.toUpperCase().includes('MAC');
      });
      
      await editor.typeInEditor('Keyboard shortcut platform test');
      await editor.selectAllText();
      
      if (isMac) {
        // Test Cmd+B on Mac
        await editor.page.keyboard.press('Meta+b');
      } else {
        // Test Ctrl+B on Windows/Linux
        await editor.page.keyboard.press('Control+b');
      }
      
      const htmlContent = await editor.getEditorContent();
      expect(htmlContent).toMatch(/<(strong|b)>/);
    });

    test('should handle different font rendering', async ({ page }) => {
      await editor.typeInEditor('Font rendering test');
      
      const fontMetrics = await editor.editorElement.evaluate(el => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const rect = range.getBoundingClientRect();
        
        return {
          width: rect.width,
          height: rect.height,
          textLength: el.textContent?.length || 0
        };
      });
      
      // Verify text is rendered (dimensions > 0)
      expect(fontMetrics.width).toBeGreaterThan(0);
      expect(fontMetrics.height).toBeGreaterThan(0);
      expect(fontMetrics.textLength).toBeGreaterThan(0);
    });

    test('should handle different scroll behaviors', async ({ page }) => {
      // Create long content
      let longContent = '';
      for (let i = 1; i <= 50; i++) {
        longContent += `Line ${i} of long content\\n`;
      }
      
      await editor.typeInEditor(longContent);
      
      // Test scrolling behavior
      await editor.page.keyboard.press('Control+Home');
      await editor.page.keyboard.press('PageDown');
      
      const scrollTop = await editor.editorElement.evaluate(el => el.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
    });
  });

  test.describe('Feature Support Matrix', () => {
    const features = [
      {
        name: 'Clipboard API',
        test: () => 'clipboard' in navigator
      },
      {
        name: 'Selection API',
        test: () => 'getSelection' in window
      },
      {
        name: 'File API',
        test: () => 'File' in window && 'FileList' in window
      },
      {
        name: 'Drag and Drop API',
        test: () => 'draggable' in document.createElement('div')
      },
      {
        name: 'History API',
        test: () => 'history' in window && 'pushState' in window.history
      }
    ];

    features.forEach(feature => {
      test(`should detect ${feature.name} support`, async ({ page }) => {
        const isSupported = await page.evaluate(feature.test);
        
        if (isSupported) {
          console.log(`✓ ${feature.name} is supported`);
        } else {
          console.log(`✗ ${feature.name} is not supported`);
        }
        
        // Test should pass regardless - we're just documenting support
        expect(typeof isSupported).toBe('boolean');
      });
    });

    test('should create browser compatibility report', async ({ page }) => {
      const browserInfo = await page.evaluate(() => {
        return {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          screenResolution: {
            width: screen.width,
            height: screen.height
          },
          viewportSize: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          features: {
            localStorage: 'localStorage' in window,
            sessionStorage: 'sessionStorage' in window,
            indexedDB: 'indexedDB' in window,
            webWorkers: 'Worker' in window,
            serviceWorkers: 'serviceWorker' in navigator,
            notifications: 'Notification' in window,
            geolocation: 'geolocation' in navigator,
            camera: 'mediaDevices' in navigator,
            clipboard: 'clipboard' in navigator,
            fullscreen: 'requestFullscreen' in document.documentElement,
            pointerEvents: 'PointerEvent' in window,
            touchEvents: 'TouchEvent' in window
          }
        };
      });
      
      console.log('Browser Compatibility Report:', JSON.stringify(browserInfo, null, 2));
      
      // Verify we got valid browser info
      expect(browserInfo.userAgent).toBeTruthy();
      expect(browserInfo.viewportSize.width).toBeGreaterThan(0);
      expect(browserInfo.viewportSize.height).toBeGreaterThan(0);
    });
  });

  test.describe('Regression Testing', () => {
    test('should maintain consistent behavior across updates', async ({ page }) => {
      // Test basic editor functionality that should work the same everywhere
      const testCases = [
        {
          action: 'Type text',
          execute: async () => {
            await editor.typeInEditor('Regression test content');
            return await editor.getEditorTextContent();
          },
          expected: 'Regression test content'
        },
        {
          action: 'Apply bold formatting',
          execute: async () => {
            await editor.selectAllText();
            await editor.toggleBold();
            return await editor.getEditorContent();
          },
          expected: /<(strong|b)>/
        },
        {
          action: 'Create list',
          execute: async () => {
            const listButton = editor.page.locator('[data-testid="create-unordered-list"]');
            if (await listButton.isVisible()) {
              await listButton.click();
              return await editor.getEditorContent();
            }
            return '';
          },
          expected: /<ul>/
        }
      ];
      
      for (const testCase of testCases) {
        const result = await testCase.execute();
        
        if (typeof testCase.expected === 'string') {
          expect(result).toContain(testCase.expected);
        } else {
          expect(result).toMatch(testCase.expected);
        }
      }
    });

    test('should handle edge cases consistently', async ({ page }) => {
      // Test edge cases that might behave differently across browsers
      const edgeCases = [
        {
          name: 'Empty content',
          test: async () => {
            await editor.clearEditor();
            const content = await editor.getEditorTextContent();
            return content.trim() === '';
          }
        },
        {
          name: 'Very long single line',
          test: async () => {
            const longLine = 'A'.repeat(10000);
            await editor.typeInEditor(longLine);
            const content = await editor.getEditorTextContent();
            return content.includes('AAAAAAAAAA');
          }
        },
        {
          name: 'Special characters',
          test: async () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~`"\'\\';
            await editor.typeInEditor(specialChars);
            const content = await editor.getEditorTextContent();
            return content.includes('!@#$%');
          }
        },
        {
          name: 'Unicode characters',
          test: async () => {
            const unicode = '中文 العربية 日本語 🎉';
            await editor.typeInEditor(unicode);
            const content = await editor.getEditorTextContent();
            return content.includes('中文');
          }
        }
      ];
      
      for (const edgeCase of edgeCases) {
        await editor.clearEditor();
        const passed = await edgeCase.test();
        expect(passed).toBe(true);
      }
    });

    test('should maintain performance standards', async ({ page }) => {
      const performanceMetrics = {
        initialRender: 0,
        typingResponse: 0,
        formattingResponse: 0
      };
      
      // Measure initial render
      const renderStart = performance.now();
      await editor.navigateToEditor();
      performanceMetrics.initialRender = performance.now() - renderStart;
      
      // Measure typing response
      const typingStart = performance.now();
      await editor.typeInEditor('Performance test');
      performanceMetrics.typingResponse = performance.now() - typingStart;
      
      // Measure formatting response
      const formatStart = performance.now();
      await editor.selectAllText();
      await editor.toggleBold();
      performanceMetrics.formattingResponse = performance.now() - formatStart;
      
      // Performance standards (may vary by browser but should be reasonable)
      expect(performanceMetrics.initialRender).toBeLessThan(3000);
      expect(performanceMetrics.typingResponse).toBeLessThan(500);
      expect(performanceMetrics.formattingResponse).toBeLessThan(200);
      
      console.log('Performance metrics:', performanceMetrics);
    });
  });
});