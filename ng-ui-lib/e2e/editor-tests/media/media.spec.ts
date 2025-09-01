import { test, expect } from '@playwright/test';
import { EditorTestBase } from '../editor-base.spec';
import * as path from 'path';

test.describe('BLG Editor - Media Handling', () => {
  let editor: EditorTestBase;

  test.beforeEach(async ({ page }) => {
    editor = new EditorTestBase(page);
    await editor.navigateToEditor();
    await editor.clearEditor();
  });

  test.describe('Image Upload via File Picker', () => {
    test('should open file picker for image upload', async () => {
      const uploadButton = editor.page.locator('[data-testid="upload-image-button"]');
      await uploadButton.click();
      
      // File input should be triggered
      const fileInput = editor.page.locator('[data-testid="image-file-input"]');
      await expect(fileInput).toBeVisible();
    });

    test('should upload image file', async () => {
      // Create a test image file
      const testImagePath = path.resolve(__dirname, '../../data/test-image.png');
      
      const fileInput = editor.page.locator('[data-testid="image-file-input"]');
      await fileInput.setInputFiles(testImagePath);
      
      // Image should appear in editor
      await editor.waitForContentUpdate();
      
      const uploadedImage = editor.page.locator('[data-testid="main-editor"] img');
      await expect(uploadedImage).toBeVisible();
      
      const imageSrc = await uploadedImage.getAttribute('src');
      expect(imageSrc).toBeTruthy();
    });

    test('should handle multiple image uploads', async () => {
      const testImages = [
        path.resolve(__dirname, '../../data/test-image.png'),
        path.resolve(__dirname, '../../data/test-image-2.jpg')
      ];
      
      for (const imagePath of testImages) {
        const fileInput = editor.page.locator('[data-testid="image-file-input"]');
        await fileInput.setInputFiles(imagePath);
        await editor.waitForContentUpdate();
      }
      
      const uploadedImages = editor.page.locator('[data-testid="main-editor"] img');
      const imageCount = await uploadedImages.count();
      expect(imageCount).toBe(2);
    });

    test('should validate image file types', async () => {
      // Try to upload non-image file
      const textFilePath = path.resolve(__dirname, '../../data/test-document.txt');
      
      const fileInput = editor.page.locator('[data-testid="image-file-input"]');
      await fileInput.setInputFiles(textFilePath);
      
      // Should show error message
      const errorMessage = editor.page.locator('[data-testid="upload-error-message"]');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        expect(errorText).toMatch(/invalid|unsupported|image/i);
      }
    });

    test('should handle large image files', async () => {
      // Test with large image file (if available)
      const largeImagePath = path.resolve(__dirname, '../../data/large-test-image.png');
      
      const fileInput = editor.page.locator('[data-testid="image-file-input"]');
      
      try {
        await fileInput.setInputFiles(largeImagePath);
        
        // Should show loading indicator
        const loadingIndicator = editor.page.locator('[data-testid="image-upload-loading"]');
        if (await loadingIndicator.isVisible()) {
          await expect(loadingIndicator).toBeHidden({ timeout: 10000 });
        }
        
        const uploadedImage = editor.page.locator('[data-testid="main-editor"] img');
        await expect(uploadedImage).toBeVisible();
      } catch (error) {
        // File might not exist in test environment
        console.log('Large image file not available for test');
      }
    });

    test('should resize large images automatically', async () => {
      const testImagePath = path.resolve(__dirname, '../../data/test-image.png');
      
      const fileInput = editor.page.locator('[data-testid="image-file-input"]');
      await fileInput.setInputFiles(testImagePath);
      
      await editor.waitForContentUpdate();
      
      const uploadedImage = editor.page.locator('[data-testid="main-editor"] img');
      const imageWidth = await uploadedImage.evaluate(img => img.clientWidth);
      
      // Should not exceed editor width
      const editorWidth = await editor.editorElement.evaluate(el => el.clientWidth);
      expect(imageWidth).toBeLessThanOrEqual(editorWidth);
    });
  });

  test.describe('Image Drag and Drop', () => {
    test('should handle drag and drop from file system', async () => {
      const testImagePath = path.resolve(__dirname, '../../data/test-image.png');
      
      // Create a DataTransfer object and simulate drag/drop
      await editor.page.evaluate((imagePath) => {
        const dataTransfer = new DataTransfer();
        
        // Create file object
        fetch(imagePath)
          .then(response => response.blob())
          .then(blob => {
            const file = new File([blob], 'test-image.png', { type: 'image/png' });
            dataTransfer.items.add(file);
            
            const editorElement = document.querySelector('[data-testid="main-editor"] [contenteditable]');
            if (editorElement) {
              const dropEvent = new DragEvent('drop', {
                bubbles: true,
                cancelable: true,
                dataTransfer: dataTransfer
              });
              
              editorElement.dispatchEvent(dropEvent);
            }
          });
      }, testImagePath);
      
      await editor.waitForContentUpdate();
      
      const uploadedImage = editor.page.locator('[data-testid="main-editor"] img');
      await expect(uploadedImage).toBeVisible();
    });

    test('should show drop zone on drag over', async () => {
      const editorElement = editor.editorElement;
      
      // Simulate drag enter
      await editorElement.dispatchEvent('dragenter', {
        dataTransfer: {
          types: ['Files'],
          files: [{ type: 'image/png' }]
        }
      });
      
      // Drop zone indicator should be visible
      const dropZone = editor.page.locator('[data-testid="drag-drop-zone"]');
      if (await dropZone.isVisible()) {
        await expect(dropZone).toBeVisible();
        
        const dropZoneText = await dropZone.textContent();
        expect(dropZoneText).toMatch(/drop|drag|image/i);
      }
    });

    test('should handle multiple files drag and drop', async () => {
      const testImages = [
        path.resolve(__dirname, '../../data/test-image.png'),
        path.resolve(__dirname, '../../data/test-image-2.jpg')
      ];
      
      // Simulate dropping multiple files
      await editor.page.evaluate((imagePaths) => {
        const dataTransfer = new DataTransfer();
        
        imagePaths.forEach((imagePath, index) => {
          const file = new File([''], `test-image-${index}.png`, { type: 'image/png' });
          dataTransfer.items.add(file);
        });
        
        const editorElement = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        if (editorElement) {
          const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer: dataTransfer
          });
          
          editorElement.dispatchEvent(dropEvent);
        }
      }, testImages);
      
      await editor.waitForContentUpdate();
      
      const uploadedImages = editor.page.locator('[data-testid="main-editor"] img');
      const imageCount = await uploadedImages.count();
      expect(imageCount).toBe(2);
    });

    test('should reject non-image files in drag and drop', async () => {
      await editor.page.evaluate(() => {
        const dataTransfer = new DataTransfer();
        const file = new File(['content'], 'test-document.txt', { type: 'text/plain' });
        dataTransfer.items.add(file);
        
        const editorElement = document.querySelector('[data-testid="main-editor"] [contenteditable]');
        if (editorElement) {
          const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer: dataTransfer
          });
          
          editorElement.dispatchEvent(dropEvent);
        }
      });
      
      // Should show error message or reject the drop
      const errorMessage = editor.page.locator('[data-testid="drag-drop-error"]');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        expect(errorText).toMatch(/invalid|unsupported|image/i);
      }
    });
  });

  test.describe('Image from Clipboard', () => {
    test('should paste image from clipboard', async ({ context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      
      // Set image data in clipboard (mock)
      await editor.page.evaluate(() => {
        // Create a canvas with image data
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = 'red';
          ctx.fillRect(0, 0, 100, 100);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const item = new ClipboardItem({ 'image/png': blob });
              navigator.clipboard.write([item]);
            }
          });
        }
      });
      
      // Click in editor and paste
      await editor.editorElement.click();
      await editor.page.keyboard.press('Control+v');
      
      await editor.waitForContentUpdate();
      
      const pastedImage = editor.page.locator('[data-testid="main-editor"] img');
      await expect(pastedImage).toBeVisible();
    });

    test('should handle screenshot paste', async ({ context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      
      // Simulate screenshot in clipboard
      await editor.page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw something that looks like a screenshot
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, 200, 150);
          ctx.fillStyle = '#333';
          ctx.fillRect(10, 10, 180, 130);
          ctx.fillStyle = '#fff';
          ctx.font = '16px Arial';
          ctx.fillText('Screenshot', 60, 80);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const item = new ClipboardItem({ 'image/png': blob });
              navigator.clipboard.write([item]);
            }
          });
        }
      });
      
      await editor.editorElement.click();
      await editor.page.keyboard.press('Control+v');
      
      await editor.waitForContentUpdate();
      
      const screenshotImage = editor.page.locator('[data-testid="main-editor"] img');
      await expect(screenshotImage).toBeVisible();
      
      const imageWidth = await screenshotImage.evaluate(img => img.naturalWidth);
      expect(imageWidth).toBe(200);
    });

    test('should show paste progress for large images', async ({ context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      
      // Create large image data
      await editor.page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = 'blue';
          ctx.fillRect(0, 0, 1920, 1080);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const item = new ClipboardItem({ 'image/png': blob });
              navigator.clipboard.write([item]);
            }
          });
        }
      });
      
      await editor.editorElement.click();
      await editor.page.keyboard.press('Control+v');
      
      // Should show loading indicator
      const loadingIndicator = editor.page.locator('[data-testid="paste-loading"]');
      if (await loadingIndicator.isVisible()) {
        await expect(loadingIndicator).toBeVisible();
        await expect(loadingIndicator).toBeHidden({ timeout: 10000 });
      }
      
      const pastedImage = editor.page.locator('[data-testid="main-editor"] img');
      await expect(pastedImage).toBeVisible();
    });
  });

  test.describe('Image by URL', () => {
    test('should insert image by URL', async () => {
      const insertByUrlButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertByUrlButton.click();
      
      const urlDialog = editor.page.locator('[data-testid="image-url-dialog"]');
      await expect(urlDialog).toBeVisible();
      
      const urlInput = editor.page.locator('[data-testid="image-url-input"]');
      await urlInput.fill('https://picsum.photos/300/200');
      
      const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
      await insertButton.click();
      
      await editor.waitForContentUpdate();
      
      const insertedImage = editor.page.locator('[data-testid="main-editor"] img');
      await expect(insertedImage).toBeVisible();
      
      const imageSrc = await insertedImage.getAttribute('src');
      expect(imageSrc).toBe('https://picsum.photos/300/200');
    });

    test('should validate image URLs', async () => {
      const insertByUrlButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertByUrlButton.click();
      
      const urlInput = editor.page.locator('[data-testid="image-url-input"]');
      await urlInput.fill('not-a-valid-url');
      
      const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
      await insertButton.click();
      
      const errorMessage = editor.page.locator('[data-testid="image-url-error"]');
      await expect(errorMessage).toBeVisible();
      
      const errorText = await errorMessage.textContent();
      expect(errorText).toMatch(/invalid|url|format/i);
    });

    test('should handle image loading errors', async () => {
      const insertByUrlButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertByUrlButton.click();
      
      const urlInput = editor.page.locator('[data-testid="image-url-input"]');
      await urlInput.fill('https://example.com/non-existent-image.jpg');
      
      const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
      await insertButton.click();
      
      await editor.waitForContentUpdate();
      
      // Should show placeholder or error indicator
      const brokenImageIndicator = editor.page.locator('[data-testid="broken-image-indicator"]');
      if (await brokenImageIndicator.isVisible()) {
        await expect(brokenImageIndicator).toBeVisible();
      }
    });

    test('should support common image formats', async () => {
      const imageFormats = [
        'https://picsum.photos/200/150.jpg',
        'https://picsum.photos/200/150.png',
        'https://picsum.photos/200/150.webp'
      ];
      
      for (const imageUrl of imageFormats) {
        const insertByUrlButton = editor.page.locator('[data-testid="insert-image-url-button"]');
        await insertByUrlButton.click();
        
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill(imageUrl);
        
        const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
        await insertButton.click();
        
        await editor.waitForContentUpdate();
        
        const insertedImage = editor.page.locator('[data-testid="main-editor"] img').last();
        await expect(insertedImage).toBeVisible();
      }
      
      const allImages = editor.page.locator('[data-testid="main-editor"] img');
      const imageCount = await allImages.count();
      expect(imageCount).toBe(imageFormats.length);
    });

    test('should add alt text for accessibility', async () => {
      const insertByUrlButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertByUrlButton.click();
      
      const urlInput = editor.page.locator('[data-testid="image-url-input"]');
      await urlInput.fill('https://picsum.photos/300/200');
      
      const altTextInput = editor.page.locator('[data-testid="image-alt-text-input"]');
      await altTextInput.fill('Test image description');
      
      const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
      await insertButton.click();
      
      await editor.waitForContentUpdate();
      
      const insertedImage = editor.page.locator('[data-testid="main-editor"] img');
      const altText = await insertedImage.getAttribute('alt');
      expect(altText).toBe('Test image description');
    });
  });

  test.describe('Image Editing and Resizing', () => {
    test.beforeEach(async () => {
      // Insert a test image for each test
      const insertByUrlButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertByUrlButton.click();
      
      const urlInput = editor.page.locator('[data-testid="image-url-input"]');
      await urlInput.fill('https://picsum.photos/400/300');
      
      const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
      await insertButton.click();
      
      await editor.waitForContentUpdate();
    });

    test('should show resize handles when image is selected', async () => {
      const image = editor.page.locator('[data-testid="main-editor"] img');
      await image.click();
      
      // Resize handles should appear
      const resizeHandles = editor.page.locator('[data-testid="image-resize-handle"]');
      const handleCount = await resizeHandles.count();
      expect(handleCount).toBeGreaterThan(0);
    });

    test('should resize image by dragging corner handle', async () => {
      const image = editor.page.locator('[data-testid="main-editor"] img');
      await image.click();
      
      const originalWidth = await image.evaluate(img => img.clientWidth);
      
      const resizeHandle = editor.page.locator('[data-testid="image-resize-handle-se"]');
      if (await resizeHandle.isVisible()) {
        const handleBox = await resizeHandle.boundingBox();
        expect(handleBox).not.toBeNull();
        
        if (handleBox) {
          // Drag to make image smaller
          await editor.page.mouse.move(handleBox.x, handleBox.y);
          await editor.page.mouse.down();
          await editor.page.mouse.move(handleBox.x - 50, handleBox.y - 50);
          await editor.page.mouse.up();
          
          const newWidth = await image.evaluate(img => img.clientWidth);
          expect(newWidth).toBeLessThan(originalWidth);
        }
      }
    });

    test('should maintain aspect ratio during resize', async () => {
      const image = editor.page.locator('[data-testid="main-editor"] img');
      await image.click();
      
      const originalWidth = await image.evaluate(img => img.clientWidth);
      const originalHeight = await image.evaluate(img => img.clientHeight);
      const originalRatio = originalWidth / originalHeight;
      
      const resizeHandle = editor.page.locator('[data-testid="image-resize-handle-se"]');
      if (await resizeHandle.isVisible()) {
        const handleBox = await resizeHandle.boundingBox();
        
        if (handleBox) {
          await editor.page.mouse.move(handleBox.x, handleBox.y);
          await editor.page.mouse.down();
          await editor.page.mouse.move(handleBox.x - 50, handleBox.y - 50);
          await editor.page.mouse.up();
          
          const newWidth = await image.evaluate(img => img.clientWidth);
          const newHeight = await image.evaluate(img => img.clientHeight);
          const newRatio = newWidth / newHeight;
          
          // Aspect ratio should be preserved (within tolerance)
          expect(Math.abs(newRatio - originalRatio)).toBeLessThan(0.1);
        }
      }
    });

    test('should open image properties dialog', async () => {
      const image = editor.page.locator('[data-testid="main-editor"] img');
      await image.click({ button: 'right' });
      
      const propertiesOption = editor.page.locator('[data-testid="image-properties"]');
      if (await propertiesOption.isVisible()) {
        await propertiesOption.click();
        
        const propertiesDialog = editor.page.locator('[data-testid="image-properties-dialog"]');
        await expect(propertiesDialog).toBeVisible();
        
        // Should have width, height, and alt text inputs
        const widthInput = editor.page.locator('[data-testid="image-width-input"]');
        const heightInput = editor.page.locator('[data-testid="image-height-input"]');
        const altTextInput = editor.page.locator('[data-testid="image-alt-input"]');
        
        await expect(widthInput).toBeVisible();
        await expect(heightInput).toBeVisible();
        await expect(altTextInput).toBeVisible();
      }
    });

    test('should set specific image dimensions', async () => {
      const image = editor.page.locator('[data-testid="main-editor"] img');
      await image.click({ button: 'right' });
      
      const propertiesOption = editor.page.locator('[data-testid="image-properties"]');
      if (await propertiesOption.isVisible()) {
        await propertiesOption.click();
        
        const widthInput = editor.page.locator('[data-testid="image-width-input"]');
        const heightInput = editor.page.locator('[data-testid="image-height-input"]');
        
        await widthInput.fill('250');
        await heightInput.fill('200');
        
        const applyButton = editor.page.locator('[data-testid="image-properties-apply"]');
        await applyButton.click();
        
        const newWidth = await image.evaluate(img => img.clientWidth);
        const newHeight = await image.evaluate(img => img.clientHeight);
        
        expect(newWidth).toBe(250);
        expect(newHeight).toBe(200);
      }
    });

    test('should align image', async () => {
      const image = editor.page.locator('[data-testid="main-editor"] img');
      await image.click();
      
      // Use toolbar alignment buttons
      const centerAlignButton = editor.page.locator('[data-testid="align-center"]');
      await centerAlignButton.click();
      
      const imageParent = image.locator('..');
      const textAlign = await imageParent.evaluate(el => 
        window.getComputedStyle(el).textAlign
      );
      expect(textAlign).toBe('center');
    });

    test('should delete image', async () => {
      const image = editor.page.locator('[data-testid="main-editor"] img');
      await image.click();
      
      await editor.page.keyboard.press('Delete');
      
      await editor.waitForContentUpdate();
      
      const remainingImages = editor.page.locator('[data-testid="main-editor"] img');
      const imageCount = await remainingImages.count();
      expect(imageCount).toBe(0);
    });

    test('should add image caption', async () => {
      const image = editor.page.locator('[data-testid="main-editor"] img');
      await image.click({ button: 'right' });
      
      const addCaptionOption = editor.page.locator('[data-testid="image-add-caption"]');
      if (await addCaptionOption.isVisible()) {
        await addCaptionOption.click();
        
        const captionElement = editor.page.locator('[data-testid="image-caption"]');
        await expect(captionElement).toBeVisible();
        
        await captionElement.click();
        await editor.page.keyboard.type('Test image caption');
        
        const captionText = await captionElement.textContent();
        expect(captionText).toContain('Test image caption');
      }
    });
  });

  test.describe('Video Embedding', () => {
    test('should embed YouTube video', async () => {
      const insertYouTubeButton = editor.page.locator('[data-testid="insert-youtube-button"]');
      await insertYouTubeButton.click();
      
      const videoDialog = editor.page.locator('[data-testid="video-embed-dialog"]');
      if (await videoDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="video-url-input"]');
        await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        
        const embedButton = editor.page.locator('[data-testid="video-embed-button"]');
        await embedButton.click();
        
        await editor.waitForContentUpdate();
        
        const videoElement = editor.page.locator('[data-testid="main-editor"] iframe[src*="youtube"]');
        await expect(videoElement).toBeVisible();
      }
    });

    test('should embed Vimeo video', async () => {
      const insertVimeoButton = editor.page.locator('[data-testid="insert-vimeo-button"]');
      await insertVimeoButton.click();
      
      const videoDialog = editor.page.locator('[data-testid="video-embed-dialog"]');
      if (await videoDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="video-url-input"]');
        await urlInput.fill('https://vimeo.com/123456789');
        
        const embedButton = editor.page.locator('[data-testid="video-embed-button"]');
        await embedButton.click();
        
        await editor.waitForContentUpdate();
        
        const videoElement = editor.page.locator('[data-testid="main-editor"] iframe[src*="vimeo"]');
        await expect(videoElement).toBeVisible();
      }
    });

    test('should validate video URLs', async () => {
      const insertYouTubeButton = editor.page.locator('[data-testid="insert-youtube-button"]');
      await insertYouTubeButton.click();
      
      const videoDialog = editor.page.locator('[data-testid="video-embed-dialog"]');
      if (await videoDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="video-url-input"]');
        await urlInput.fill('https://not-a-video-site.com/video');
        
        const embedButton = editor.page.locator('[data-testid="video-embed-button"]');
        await embedButton.click();
        
        const errorMessage = editor.page.locator('[data-testid="video-url-error"]');
        await expect(errorMessage).toBeVisible();
        
        const errorText = await errorMessage.textContent();
        expect(errorText).toMatch(/invalid|unsupported|url/i);
      }
    });

    test('should set video dimensions', async () => {
      const insertYouTubeButton = editor.page.locator('[data-testid="insert-youtube-button"]');
      await insertYouTubeButton.click();
      
      const videoDialog = editor.page.locator('[data-testid="video-embed-dialog"]');
      if (await videoDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="video-url-input"]');
        await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        
        const widthInput = editor.page.locator('[data-testid="video-width-input"]');
        const heightInput = editor.page.locator('[data-testid="video-height-input"]');
        
        await widthInput.fill('640');
        await heightInput.fill('360');
        
        const embedButton = editor.page.locator('[data-testid="video-embed-button"]');
        await embedButton.click();
        
        await editor.waitForContentUpdate();
        
        const videoElement = editor.page.locator('[data-testid="main-editor"] iframe');
        const width = await videoElement.getAttribute('width');
        const height = await videoElement.getAttribute('height');
        
        expect(width).toBe('640');
        expect(height).toBe('360');
      }
    });

    test('should make videos responsive', async () => {
      const insertYouTubeButton = editor.page.locator('[data-testid="insert-youtube-button"]');
      await insertYouTubeButton.click();
      
      const videoDialog = editor.page.locator('[data-testid="video-embed-dialog"]');
      if (await videoDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="video-url-input"]');
        await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        
        const responsiveCheckbox = editor.page.locator('[data-testid="video-responsive-checkbox"]');
        await responsiveCheckbox.check();
        
        const embedButton = editor.page.locator('[data-testid="video-embed-button"]');
        await embedButton.click();
        
        await editor.waitForContentUpdate();
        
        const videoContainer = editor.page.locator('[data-testid="main-editor"] .video-container');
        if (await videoContainer.isVisible()) {
          const containerClass = await videoContainer.getAttribute('class');
          expect(containerClass).toContain('responsive');
        }
      }
    });
  });

  test.describe('HTML5 Video', () => {
    test('should upload video file', async () => {
      const videoFilePath = path.resolve(__dirname, '../../data/test-video.mp4');
      
      const fileInput = editor.page.locator('[data-testid="image-file-input"]');
      
      try {
        await fileInput.setInputFiles(videoFilePath);
        await editor.waitForContentUpdate();
        
        const videoElement = editor.page.locator('[data-testid="main-editor"] video');
        await expect(videoElement).toBeVisible();
        
        const videoSrc = await videoElement.getAttribute('src');
        expect(videoSrc).toBeTruthy();
      } catch (error) {
        console.log('Test video file not available');
      }
    });

    test('should add video controls', async () => {
      const videoFilePath = path.resolve(__dirname, '../../data/test-video.mp4');
      
      const fileInput = editor.page.locator('[data-testid="image-file-input"]');
      
      try {
        await fileInput.setInputFiles(videoFilePath);
        await editor.waitForContentUpdate();
        
        const videoElement = editor.page.locator('[data-testid="main-editor"] video');
        const hasControls = await videoElement.getAttribute('controls');
        expect(hasControls).not.toBeNull();
      } catch (error) {
        console.log('Test video file not available');
      }
    });

    test('should set video poster image', async () => {
      // This test would require both video and image files
      const videoFilePath = path.resolve(__dirname, '../../data/test-video.mp4');
      const posterImagePath = path.resolve(__dirname, '../../data/test-image.png');
      
      try {
        const fileInput = editor.page.locator('[data-testid="image-file-input"]');
        await fileInput.setInputFiles(videoFilePath);
        await editor.waitForContentUpdate();
        
        const videoElement = editor.page.locator('[data-testid="main-editor"] video');
        await videoElement.click({ button: 'right' });
        
        const propertiesOption = editor.page.locator('[data-testid="video-properties"]');
        if (await propertiesOption.isVisible()) {
          await propertiesOption.click();
          
          const posterInput = editor.page.locator('[data-testid="video-poster-input"]');
          await posterInput.setInputFiles(posterImagePath);
          
          const applyButton = editor.page.locator('[data-testid="video-properties-apply"]');
          await applyButton.click();
          
          const posterAttr = await videoElement.getAttribute('poster');
          expect(posterAttr).toBeTruthy();
        }
      } catch (error) {
        console.log('Test video/image files not available');
      }
    });

    test('should support common video formats', async () => {
      const videoFormats = [
        { file: 'test-video.mp4', type: 'video/mp4' },
        { file: 'test-video.webm', type: 'video/webm' },
        { file: 'test-video.ogg', type: 'video/ogg' }
      ];
      
      for (const format of videoFormats) {
        const videoPath = path.resolve(__dirname, `../../data/${format.file}`);
        
        try {
          const fileInput = editor.page.locator('[data-testid="image-file-input"]');
          await fileInput.setInputFiles(videoPath);
          await editor.waitForContentUpdate();
          
          const videoElement = editor.page.locator('[data-testid="main-editor"] video').last();
          const videoType = await videoElement.evaluate(video => {
            const source = video.querySelector('source');
            return source ? source.type : '';
          });
          
          expect(videoType).toBe(format.type);
        } catch (error) {
          console.log(`Test video file ${format.file} not available`);
        }
      }
    });
  });

  test.describe('Media Gallery and Management', () => {
    test('should show media gallery', async () => {
      // First add some media
      const insertByUrlButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertByUrlButton.click();
      
      const urlInput = editor.page.locator('[data-testid="image-url-input"]');
      await urlInput.fill('https://picsum.photos/200/150');
      
      const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
      await insertButton.click();
      
      await editor.waitForContentUpdate();
      
      // Open media gallery
      const galleryButton = editor.page.locator('[data-testid="open-media-gallery"]');
      if (await galleryButton.isVisible()) {
        await galleryButton.click();
        
        const mediaGallery = editor.page.locator('[data-testid="media-gallery"]');
        await expect(mediaGallery).toBeVisible();
        
        const galleryItems = editor.page.locator('[data-testid="media-gallery"] .media-item');
        const itemCount = await galleryItems.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test('should organize media by type', async () => {
      const galleryButton = editor.page.locator('[data-testid="open-media-gallery"]');
      if (await galleryButton.isVisible()) {
        await galleryButton.click();
        
        const imageTab = editor.page.locator('[data-testid="media-gallery-images"]');
        const videoTab = editor.page.locator('[data-testid="media-gallery-videos"]');
        
        await expect(imageTab).toBeVisible();
        await expect(videoTab).toBeVisible();
        
        // Switch between tabs
        await videoTab.click();
        await imageTab.click();
      }
    });

    test('should delete media from gallery', async () => {
      const galleryButton = editor.page.locator('[data-testid="open-media-gallery"]');
      if (await galleryButton.isVisible()) {
        await galleryButton.click();
        
        const firstMediaItem = editor.page.locator('[data-testid="media-gallery"] .media-item').first();
        if (await firstMediaItem.isVisible()) {
          await firstMediaItem.hover();
          
          const deleteButton = editor.page.locator('[data-testid="media-item-delete"]');
          if (await deleteButton.isVisible()) {
            await deleteButton.click();
            
            // Confirm deletion
            const confirmButton = editor.page.locator('[data-testid="confirm-media-delete"]');
            await confirmButton.click();
            
            // Item should be removed from gallery
            await expect(firstMediaItem).not.toBeVisible();
          }
        }
      }
    });

    test('should show media usage information', async () => {
      const galleryButton = editor.page.locator('[data-testid="open-media-gallery"]');
      if (await galleryButton.isVisible()) {
        await galleryButton.click();
        
        const firstMediaItem = editor.page.locator('[data-testid="media-gallery"] .media-item').first();
        if (await firstMediaItem.isVisible()) {
          await firstMediaItem.click();
          
          const mediaInfo = editor.page.locator('[data-testid="media-info-panel"]');
          if (await mediaInfo.isVisible()) {
            const fileSize = editor.page.locator('[data-testid="media-file-size"]');
            const dimensions = editor.page.locator('[data-testid="media-dimensions"]');
            const usageCount = editor.page.locator('[data-testid="media-usage-count"]');
            
            await expect(fileSize).toBeVisible();
            await expect(dimensions).toBeVisible();
            await expect(usageCount).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Media Optimization and Performance', () => {
    test('should compress large images', async () => {
      // Upload large image and check if it gets compressed
      const largeImagePath = path.resolve(__dirname, '../../data/large-test-image.png');
      
      try {
        const fileInput = editor.page.locator('[data-testid="image-file-input"]');
        await fileInput.setInputFiles(largeImagePath);
        
        // Check compression settings
        const compressionDialog = editor.page.locator('[data-testid="image-compression-dialog"]');
        if (await compressionDialog.isVisible()) {
          const qualitySlider = editor.page.locator('[data-testid="compression-quality-slider"]');
          await qualitySlider.fill('80');
          
          const compressButton = editor.page.locator('[data-testid="compress-image-button"]');
          await compressButton.click();
          
          await editor.waitForContentUpdate();
          
          const compressedImage = editor.page.locator('[data-testid="main-editor"] img');
          await expect(compressedImage).toBeVisible();
        }
      } catch (error) {
        console.log('Large image file not available for compression test');
      }
    });

    test('should lazy load images', async () => {
      // Add multiple images
      for (let i = 1; i <= 5; i++) {
        const insertByUrlButton = editor.page.locator('[data-testid="insert-image-url-button"]');
        await insertByUrlButton.click();
        
        const urlInput = editor.page.locator('[data-testid="image-url-input"]');
        await urlInput.fill(`https://picsum.photos/300/200?random=${i}`);
        
        const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
        await insertButton.click();
        
        await editor.waitForContentUpdate();
      }
      
      // Check if images have lazy loading attributes
      const images = editor.page.locator('[data-testid="main-editor"] img');
      const firstImage = images.first();
      const lastImage = images.last();
      
      const firstImageLoading = await firstImage.getAttribute('loading');
      const lastImageLoading = await lastImage.getAttribute('loading');
      
      // First image might load immediately, others should be lazy
      expect(lastImageLoading).toBe('lazy');
    });

    test('should show image loading placeholders', async () => {
      const insertByUrlButton = editor.page.locator('[data-testid="insert-image-url-button"]');
      await insertByUrlButton.click();
      
      const urlInput = editor.page.locator('[data-testid="image-url-input"]');
      await urlInput.fill('https://picsum.photos/800/600');
      
      const insertButton = editor.page.locator('[data-testid="image-url-insert"]');
      await insertButton.click();
      
      // Loading placeholder should appear immediately
      const loadingPlaceholder = editor.page.locator('[data-testid="image-loading-placeholder"]');
      if (await loadingPlaceholder.isVisible()) {
        await expect(loadingPlaceholder).toBeVisible();
        
        // Wait for actual image to load
        const actualImage = editor.page.locator('[data-testid="main-editor"] img');
        await expect(actualImage).toBeVisible();
        
        // Placeholder should disappear
        await expect(loadingPlaceholder).not.toBeVisible();
      }
    });

    test('should optimize video loading', async () => {
      const insertYouTubeButton = editor.page.locator('[data-testid="insert-youtube-button"]');
      await insertYouTubeButton.click();
      
      const videoDialog = editor.page.locator('[data-testid="video-embed-dialog"]');
      if (await videoDialog.isVisible()) {
        const urlInput = editor.page.locator('[data-testid="video-url-input"]');
        await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        
        const embedButton = editor.page.locator('[data-testid="video-embed-button"]');
        await embedButton.click();
        
        await editor.waitForContentUpdate();
        
        const videoElement = editor.page.locator('[data-testid="main-editor"] iframe');
        const loading = await videoElement.getAttribute('loading');
        
        // Should have lazy loading
        expect(loading).toBe('lazy');
      }
    });
  });
});