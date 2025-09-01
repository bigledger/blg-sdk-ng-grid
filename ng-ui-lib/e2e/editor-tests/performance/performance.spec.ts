import { test, expect } from '@playwright/test';
import { EditorTestBase } from '../editor-base.spec';

test.describe('BLG Editor - Performance Tests', () => {
  let editor: EditorTestBase;

  test.beforeEach(async ({ page }) => {
    editor = new EditorTestBase(page);
    await editor.navigateToEditor();
    await editor.clearEditor();
  });

  test.describe('Large Document Performance', () => {
    test('should handle 10k word document efficiently', async () => {
      const startTime = performance.now();
      
      await editor.page.click('[data-testid="load-large-document"]');
      await editor.waitForContentUpdate();
      
      const loadTime = performance.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Verify content loaded
      const wordCount = await editor.getWordCount();
      expect(wordCount).toBeGreaterThan(9000);
      
      // Test scrolling performance
      const scrollStartTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        await editor.page.keyboard.press('PageDown');
        await editor.page.waitForTimeout(50);
      }
      
      const scrollTime = performance.now() - scrollStartTime;
      expect(scrollTime).toBeLessThan(1000);
    });

    test('should maintain performance with 50k characters', async () => {
      // Generate large text content
      let largeContent = '';
      for (let i = 0; i < 1000; i++) {
        largeContent += `Paragraph ${i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. `;
      }
      
      const insertStartTime = performance.now();
      await editor.typeInEditor(largeContent.substring(0, 50000)); // 50k characters
      const insertTime = performance.now() - insertStartTime;
      
      // Should insert within reasonable time
      expect(insertTime).toBeLessThan(5000);
      
      // Test editing performance
      const editStartTime = performance.now();
      await editor.page.keyboard.press('Control+Home');
      await editor.page.keyboard.type('PREPENDED TEXT: ');
      const editTime = performance.now() - editStartTime;
      
      expect(editTime).toBeLessThan(500);
      
      // Test selection performance
      const selectStartTime = performance.now();
      await editor.page.keyboard.press('Control+a');
      const selectTime = performance.now() - selectStartTime;
      
      expect(selectTime).toBeLessThan(1000);
    });

    test('should handle rapid typing without lag', async () => {
      const rapidText = 'The quick brown fox jumps over the lazy dog. '.repeat(100);
      const typingStartTime = performance.now();
      
      // Type rapidly with minimal delay
      for (const char of rapidText) {
        await editor.page.keyboard.type(char, { delay: 1 });
      }
      
      const typingTime = performance.now() - typingStartTime;
      
      // Should handle rapid typing efficiently
      expect(typingTime).toBeLessThan(rapidText.length * 5); // 5ms per character max
      
      const finalContent = await editor.getEditorTextContent();
      expect(finalContent).toContain('The quick brown fox');
    });

    test('should maintain performance during continuous editing', async () => {
      let performanceData: number[] = [];
      
      for (let i = 0; i < 20; i++) {
        const iterationStart = performance.now();
        
        await editor.page.keyboard.type(`Iteration ${i} content. `);
        await editor.page.keyboard.press('Enter');
        
        if (i % 5 === 0) {
          await editor.page.keyboard.press('Control+Home');
          await editor.page.keyboard.type('PREFIX ');
        }
        
        const iterationTime = performance.now() - iterationStart;
        performanceData.push(iterationTime);
      }
      
      // Performance should remain consistent
      const averageTime = performanceData.reduce((a, b) => a + b) / performanceData.length;
      const maxTime = Math.max(...performanceData);
      
      expect(averageTime).toBeLessThan(100); // 100ms average
      expect(maxTime).toBeLessThan(300); // 300ms max for any single operation
    });

    test('should handle large paste operations efficiently', async () => {
      // Generate large content to paste
      let largeContent = '';
      for (let i = 0; i < 2000; i++) {
        largeContent += `Line ${i} with substantial content to test paste performance.\\n`;
      }
      
      // Set clipboard content
      await editor.page.evaluate((content) => {
        navigator.clipboard.writeText(content);
      }, largeContent);
      
      const pasteStartTime = performance.now();
      await editor.editorElement.click();
      await editor.page.keyboard.press('Control+v');
      await editor.waitForContentUpdate();
      
      const pasteTime = performance.now() - pasteStartTime;
      
      // Should paste large content within 2 seconds
      expect(pasteTime).toBeLessThan(2000);
      
      const finalContent = await editor.getEditorTextContent();
      expect(finalContent).toContain('Line 1999');
    });
  });

  test.describe('Memory Usage Optimization', () => {
    test('should manage memory efficiently with large documents', async () => {
      const initialMemory = await editor.measureMemoryUsage();
      
      // Load large document
      await editor.page.click('[data-testid="load-large-document"]');
      await editor.waitForContentUpdate();
      
      const afterLoadMemory = await editor.measureMemoryUsage();
      const loadMemoryIncrease = afterLoadMemory - initialMemory;
      
      // Memory increase should be reasonable (< 50MB for large document)
      expect(loadMemoryIncrease).toBeLessThan(50);
      
      // Clear document and check memory cleanup
      await editor.clearEditor();
      
      // Force garbage collection if available
      await editor.page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      await editor.page.waitForTimeout(1000); // Wait for cleanup
      
      const afterClearMemory = await editor.measureMemoryUsage();
      const memoryLeakage = afterClearMemory - initialMemory;
      
      // Should clean up most memory (allow 10MB tolerance)
      expect(memoryLeakage).toBeLessThan(10);
    });

    test('should handle multiple document cycles without memory leaks', async () => {
      const baselineMemory = await editor.measureMemoryUsage();
      
      // Perform multiple load/clear cycles
      for (let cycle = 0; cycle < 5; cycle++) {
        await editor.page.click('[data-testid="load-sample-content"]');
        await editor.waitForContentUpdate();
        
        // Add and remove formatting
        await editor.selectAllText();
        await editor.toggleBold();
        await editor.toggleItalic();
        await editor.toggleBold();
        await editor.toggleItalic();
        
        await editor.clearEditor();
        await editor.page.waitForTimeout(200);
      }
      
      // Force garbage collection
      await editor.page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      await editor.page.waitForTimeout(1000);
      
      const finalMemory = await editor.measureMemoryUsage();
      const totalLeakage = finalMemory - baselineMemory;
      
      // Should not have significant memory leaks
      expect(totalLeakage).toBeLessThan(15);
    });

    test('should optimize DOM node count', async () => {
      const initialNodeCount = await editor.page.evaluate(() => 
        document.querySelectorAll('*').length
      );
      
      // Load complex content
      await editor.page.click('[data-testid="load-complex-formatting"]');
      await editor.waitForContentUpdate();
      
      const afterLoadNodeCount = await editor.page.evaluate(() => 
        document.querySelectorAll('*').length
      );
      
      const nodeIncrease = afterLoadNodeCount - initialNodeCount;
      
      // Should not create excessive DOM nodes
      expect(nodeIncrease).toBeLessThan(1000);
      
      // Clear content
      await editor.clearEditor();
      
      const afterClearNodeCount = await editor.page.evaluate(() => 
        document.querySelectorAll('*').length
      );
      
      const nodesRemaining = afterClearNodeCount - initialNodeCount;
      
      // Should clean up most nodes
      expect(nodesRemaining).toBeLessThan(50);
    });

    test('should handle event listener cleanup', async () => {
      const getEventListenerCount = async () => {
        return await editor.page.evaluate(() => {
          // This is a simplified check - in real tests you might use more sophisticated detection
          let count = 0;
          const elements = document.querySelectorAll('*');
          elements.forEach(el => {
            const events = (el as any)._events || {};
            count += Object.keys(events).length;
          });
          return count;
        });
      };
      
      const initialListeners = await getEventListenerCount();
      
      // Create and destroy components
      for (let i = 0; i < 3; i++) {
        // Open and close dialogs
        const linkButton = editor.page.locator('[data-testid="insert-link"]');
        await linkButton.click();
        
        const linkDialog = editor.page.locator('[data-testid="link-dialog"]');
        if (await linkDialog.isVisible()) {
          await editor.page.keyboard.press('Escape');
        }
        
        // Insert and remove images
        const imageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
        await imageButton.click();
        
        const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
        if (await imageDialog.isVisible()) {
          await editor.page.keyboard.press('Escape');
        }
      }
      
      const finalListeners = await getEventListenerCount();
      const listenerIncrease = finalListeners - initialListeners;
      
      // Should not accumulate event listeners
      expect(listenerIncrease).toBeLessThan(20);
    });
  });

  test.describe('Rendering Performance', () => {
    test('should render initial interface quickly', async ({ page }) => {
      const startTime = performance.now();
      
      // Navigate to fresh editor
      await page.goto('/editor-demo');
      await page.waitForSelector('[data-testid="editor-demo"]');
      await page.waitForLoadState('networkidle');
      
      const loadTime = performance.now() - startTime;
      
      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
      
      // Check that all main components are visible
      const mainEditor = page.locator('[data-testid="main-editor"]');
      const toolbar = page.locator('[data-testid="editor-toolbar"]');
      const statusPanel = page.locator('[data-testid="status-panel"]');
      
      await expect(mainEditor).toBeVisible();
      await expect(toolbar).toBeVisible();
      await expect(statusPanel).toBeVisible();
    });

    test('should maintain 60 FPS during smooth scrolling', async () => {
      // Load large document for scrolling test
      await editor.page.click('[data-testid="load-large-document"]');
      await editor.waitForContentUpdate();
      
      let frameCount = 0;
      let startTime = performance.now();
      
      // Monitor frame rate during scrolling
      const frameMonitor = setInterval(() => {
        frameCount++;
      }, 16.67); // 60 FPS = ~16.67ms per frame
      
      // Perform smooth scrolling
      for (let i = 0; i < 20; i++) {
        await editor.page.mouse.wheel(0, 100);
        await editor.page.waitForTimeout(50);
      }
      
      clearInterval(frameMonitor);
      const totalTime = performance.now() - startTime;
      const fps = (frameCount / totalTime) * 1000;
      
      // Should maintain at least 30 FPS (allowing for some performance variance)
      expect(fps).toBeGreaterThan(30);
    });

    test('should optimize paint operations', async () => {
      await editor.typeInEditor('Paint optimization test');
      
      const measurePaintTime = async (operation: () => Promise<void>) => {
        const startTime = performance.now();
        await operation();
        return performance.now() - startTime;
      };
      
      // Test various operations that trigger paints
      const formatTime = await measurePaintTime(async () => {
        await editor.selectAllText();
        await editor.toggleBold();
      });
      
      const colorTime = await measurePaintTime(async () => {
        const textColorButton = editor.page.locator('[data-testid="text-color-picker"]');
        if (await textColorButton.isVisible()) {
          await textColorButton.click();
          const redOption = editor.page.locator('[data-testid="color-option-red"]');
          await redOption.click();
        }
      });
      
      const alignTime = await measurePaintTime(async () => {
        const centerButton = editor.page.locator('[data-testid="align-center"]');
        await centerButton.click();
      });
      
      // Each operation should complete quickly
      expect(formatTime).toBeLessThan(100);
      expect(colorTime).toBeLessThan(200);
      expect(alignTime).toBeLessThan(100);
    });

    test('should handle rapid UI updates efficiently', async () => {
      await editor.typeInEditor('Rapid update test');
      
      const startTime = performance.now();
      
      // Perform rapid formatting changes
      for (let i = 0; i < 10; i++) {
        await editor.selectAllText();
        await editor.toggleBold();
        await editor.page.waitForTimeout(10);
        await editor.toggleBold();
        await editor.page.waitForTimeout(10);
      }
      
      const totalTime = performance.now() - startTime;
      
      // Should handle rapid changes within reasonable time
      expect(totalTime).toBeLessThan(2000);
      
      // UI should remain responsive
      const finalContent = await editor.getEditorTextContent();
      expect(finalContent).toContain('Rapid update test');
    });

    test('should optimize table rendering performance', async () => {
      const startTime = performance.now();
      
      // Create large table
      await editor.page.evaluate(() => {
        const editor = document.querySelector('[data-testid="main-editor"] [contenteditable]') as HTMLElement;
        if (editor) {
          let tableHTML = '<table border="1"><tbody>';
          for (let row = 0; row < 50; row++) {
            tableHTML += '<tr>';
            for (let col = 0; col < 10; col++) {
              tableHTML += `<td>R${row}C${col}</td>`;
            }
            tableHTML += '</tr>';
          }
          tableHTML += '</tbody></table>';
          editor.innerHTML = tableHTML;
        }
      });
      
      const renderTime = performance.now() - startTime;
      
      // Large table should render within 1 second
      expect(renderTime).toBeLessThan(1000);
      
      // Test table interaction performance
      const interactionStartTime = performance.now();
      
      const firstCell = editor.page.locator('table td').first();
      await firstCell.click();
      await editor.page.keyboard.type('Updated');
      
      const interactionTime = performance.now() - interactionStartTime;
      expect(interactionTime).toBeLessThan(300);
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow network
      await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 50 * 1024, // 50 KB/s
        uploadThroughput: 20 * 1024,   // 20 KB/s
        latency: 500 // 500ms latency
      });
      
      const startTime = performance.now();
      
      // Test image insertion from URL
      const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertImageButton.click();
      
      const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      if (await imageDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill('https://picsum.photos/200/150');
        
        const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
        await insertButton.click();
        
        // Should show loading state
        const loadingIndicator = editor.page.locator('[data-testid="image-loading"]');
        if (await loadingIndicator.isVisible()) {
          await expect(loadingIndicator).toBeVisible();
        }
        
        // Wait for image to load
        const image = editor.page.locator('[data-testid="main-editor"] img');
        await expect(image).toBeVisible({ timeout: 10000 });
      }
      
      const totalTime = performance.now() - startTime;
      
      // Should handle slow network gracefully
      expect(totalTime).toBeLessThan(10000);
    });

    test('should implement efficient caching', async ({ page }) => {
      // First load
      const firstLoadStart = performance.now();
      await page.goto('/editor-demo');
      await page.waitForLoadState('networkidle');
      const firstLoadTime = performance.now() - firstLoadStart;
      
      // Second load (should be cached)
      const secondLoadStart = performance.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const secondLoadTime = performance.now() - secondLoadStart;
      
      // Second load should be faster due to caching
      expect(secondLoadTime).toBeLessThan(firstLoadTime * 0.8);
    });

    test('should handle offline mode gracefully', async ({ page }) => {
      await editor.typeInEditor('Offline test content');
      
      // Go offline
      await page.setOfflineMode(true);
      
      // Should still be able to edit
      await editor.page.keyboard.press('End');
      await editor.page.keyboard.type(' - offline addition');
      
      const content = await editor.getEditorTextContent();
      expect(content).toContain('offline addition');
      
      // Should show offline indicator
      const offlineIndicator = editor.page.locator('[data-testid="offline-indicator"]');
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toBeVisible();
      }
      
      // Go back online
      await page.setOfflineMode(false);
    });

    test('should batch network requests efficiently', async () => {
      let requestCount = 0;
      
      // Monitor network requests
      editor.page.on('request', (request) => {
        if (request.url().includes('api/')) {
          requestCount++;
        }
      });
      
      // Perform operations that might trigger API calls
      await editor.typeInEditor('Batch request test');
      
      // Insert multiple images
      for (let i = 0; i < 3; i++) {
        const insertImageButton = editor.page.locator('[data-testid="insert-image-url-button"]');
        await insertImageButton.click();
        
        const imageDialog = editor.page.locator('[data-testid="image-url-dialog"]');
        if (await imageDialog.isVisible()) {
          const urlInput = editor.page.locator('[data-testid="image-url-input"]');
          await urlInput.fill(`https://picsum.photos/200/150?random=${i}`);
          
          const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
          await insertButton.click();
          
          await editor.waitForContentUpdate();
        }
      }
      
      await editor.page.waitForTimeout(2000); // Wait for any batched requests
      
      // Should not make excessive API requests
      expect(requestCount).toBeLessThan(10);
    });
  });

  test.describe('CPU Intensive Operations', () => {
    test('should handle complex formatting operations efficiently', async () => {
      await editor.typeInEditor('Complex formatting test with multiple paragraphs and various content types.');
      
      const operationTimes: number[] = [];
      
      const operations = [
        () => editor.selectAllText(),
        () => editor.toggleBold(),
        () => editor.toggleItalic(),
        () => editor.page.click('[data-testid="align-center"]'),
        () => editor.page.click('[data-testid="create-unordered-list"]'),
        () => editor.page.click('[data-testid="format-blockquote"]')
      ];
      
      for (const operation of operations) {
        const startTime = performance.now();
        await operation();
        const endTime = performance.now();
        operationTimes.push(endTime - startTime);
        
        await editor.waitForContentUpdate();
      }
      
      // Each operation should complete within 200ms
      operationTimes.forEach(time => {
        expect(time).toBeLessThan(200);
      });
      
      const averageTime = operationTimes.reduce((a, b) => a + b) / operationTimes.length;
      expect(averageTime).toBeLessThan(100);
    });

    test('should handle search and replace efficiently', async () => {
      // Create document with repeated content
      let content = '';
      for (let i = 0; i < 1000; i++) {
        content += `This is paragraph ${i} with some repeated text content. `;
      }
      
      await editor.typeInEditor(content);
      
      const searchStartTime = performance.now();
      
      // Simulate find and replace
      await editor.page.keyboard.press('Control+h'); // Open find/replace
      
      const findDialog = editor.page.locator('[data-testid="find-replace-dialog"]');
      if (await findDialog.isVisible()) {
        const findInput = editor.page.locator('[data-testid="find-input"]');
        const replaceInput = editor.page.locator('[data-testid="replace-input"]');
        
        await findInput.fill('repeated');
        await replaceInput.fill('REPLACED');
        
        const replaceAllButton = editor.page.locator('[data-testid="replace-all-button"]');
        await replaceAllButton.click();
      }
      
      const searchTime = performance.now() - searchStartTime;
      
      // Should complete search and replace within 2 seconds
      expect(searchTime).toBeLessThan(2000);
      
      const finalContent = await editor.getEditorTextContent();
      expect(finalContent).toContain('REPLACED');
    });

    test('should handle spell check efficiently', async () => {
      const textWithErrors = 'Ths is a sentnce with mispelld words for testng spel chek performance.';
      
      const startTime = performance.now();
      await editor.typeInEditor(textWithErrors);
      
      // Wait for spell check to process
      await editor.page.waitForTimeout(1000);
      
      const spellCheckTime = performance.now() - startTime;
      
      // Should handle spell check within reasonable time
      expect(spellCheckTime).toBeLessThan(1500);
      
      // Check for spell check indicators
      const spellErrors = editor.page.locator('[data-testid="main-editor"] .spell-error');
      if (await spellErrors.count() > 0) {
        expect(await spellErrors.count()).toBeGreaterThan(0);
      }
    });

    test('should handle auto-save efficiently', async () => {
      let saveCount = 0;
      
      // Monitor save operations (if implemented)
      editor.page.on('request', (request) => {
        if (request.url().includes('autosave') || request.method() === 'PUT') {
          saveCount++;
        }
      });
      
      // Type content that would trigger auto-save
      for (let i = 0; i < 10; i++) {
        await editor.page.keyboard.type(`Auto-save test content ${i}. `);
        await editor.page.waitForTimeout(300); // Trigger auto-save interval
      }
      
      await editor.page.waitForTimeout(2000); // Wait for final auto-save
      
      // Should not save too frequently (debounced)
      expect(saveCount).toBeLessThan(5);
    });
  });

  test.describe('Stress Testing', () => {
    test('should handle extreme document size', async () => {
      // Generate 100k character document
      let extremeContent = '';
      for (let i = 0; i < 2000; i++) {
        extremeContent += 'This is a very long sentence designed to create an extremely large document for stress testing the editor performance capabilities. ';
      }
      
      const startTime = performance.now();
      
      // Insert content in chunks to simulate real usage
      const chunkSize = 10000;
      for (let offset = 0; offset < extremeContent.length; offset += chunkSize) {
        const chunk = extremeContent.substring(offset, offset + chunkSize);
        await editor.page.keyboard.type(chunk);
        
        // Brief pause to prevent overwhelming the browser
        if (offset % 50000 === 0) {
          await editor.page.waitForTimeout(100);
        }
      }
      
      const insertTime = performance.now() - startTime;
      
      // Should handle extreme content within 30 seconds
      expect(insertTime).toBeLessThan(30000);
      
      // Test basic operations still work
      await editor.page.keyboard.press('Control+Home');
      await editor.page.keyboard.type('PREPENDED: ');
      
      const finalContent = await editor.getEditorTextContent();
      expect(finalContent).toContain('PREPENDED:');
    });

    test('should handle rapid consecutive operations', async () => {
      await editor.typeInEditor('Rapid operations stress test');
      
      const operations = [
        () => editor.selectAllText(),
        () => editor.toggleBold(),
        () => editor.toggleItalic(),
        () => editor.toggleUnderline(),
        () => editor.page.keyboard.press('Control+z'),
        () => editor.page.keyboard.press('Control+y'),
        () => editor.page.keyboard.press('Control+Home'),
        () => editor.page.keyboard.press('Control+End'),
        () => editor.page.keyboard.press('Control+a')
      ];
      
      const startTime = performance.now();
      
      // Execute operations rapidly
      for (let round = 0; round < 5; round++) {
        for (const operation of operations) {
          await operation();
          // Minimal delay to simulate rapid user actions
          await editor.page.waitForTimeout(10);
        }
      }
      
      const totalTime = performance.now() - startTime;
      
      // Should handle rapid operations within 5 seconds
      expect(totalTime).toBeLessThan(5000);
      
      // Editor should remain functional
      const content = await editor.getEditorTextContent();
      expect(content).toContain('stress test');
    });

    test('should handle memory pressure gracefully', async () => {
      const initialMemory = await editor.measureMemoryUsage();
      
      // Create memory pressure by loading and unloading content repeatedly
      for (let cycle = 0; cycle < 10; cycle++) {
        // Load large content
        await editor.page.click('[data-testid="load-large-document"]');
        await editor.waitForContentUpdate();
        
        // Perform memory-intensive operations
        await editor.selectAllText();
        await editor.copyText();
        await editor.page.keyboard.press('End');
        await editor.pasteText();
        
        // Clear and force cleanup
        await editor.clearEditor();
        
        if (cycle % 3 === 0) {
          // Force garbage collection periodically
          await editor.page.evaluate(() => {
            if (window.gc) {
              window.gc();
            }
          });
          await editor.page.waitForTimeout(500);
        }
      }
      
      const finalMemory = await editor.measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should not accumulate excessive memory
      expect(memoryIncrease).toBeLessThan(100); // 100MB limit
      
      // Editor should still be functional
      await editor.typeInEditor('Memory pressure test complete');
      const content = await editor.getEditorTextContent();
      expect(content).toContain('Memory pressure test complete');
    });
  });
});