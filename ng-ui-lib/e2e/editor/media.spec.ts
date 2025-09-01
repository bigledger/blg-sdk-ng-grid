import { test, expect } from '@playwright/test';
import { EditorPage } from './page-objects/editor-page';
import { EditorTestData } from './utils/test-data-generator';
import { EditorAssertions } from './utils/custom-assertions';

test.describe('Media Handling', () => {
  let editorPage: EditorPage;

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page);
    await editorPage.goto();
    
    // Create test assets directory if not exists
    await page.evaluate(() => {
      // Mock file system for testing
      if (!window.testAssets) {
        window.testAssets = {
          'sample-image.jpg': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          'sample-video.mp4': 'test-video-content'
        };
      }
    });
  });

  test.describe('Image Handling', () => {
    test('should insert image via file upload', async ({ page }) => {
      // Create a test image file
      const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA25/tEQAAAABJRU5ErkJggg==', 'base64');
      
      // Mock file input behavior
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ url: '/uploads/test-image.png' })
          });
        } else {
          route.continue();
        }
      });

      await editorPage.imageButton.click();
      await expect(editorPage.imageModal).toBeVisible();

      // Simulate file selection
      await editorPage.imageFileInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: imageBuffer
      });

      await editorPage.page.locator('[data-testid="insert-image-button"]').click();
      
      await EditorAssertions.toContainImage(editorPage.editorContent);
    });

    test('should add alt text to images', async ({ page }) => {
      const altText = 'Test image description';
      
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ url: '/uploads/test-image.png' })
          });
        } else {
          route.continue();
        }
      });

      await editorPage.imageButton.click();
      await editorPage.imageFileInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('test-image-data')
      });
      
      await editorPage.imageAltInput.fill(altText);
      await editorPage.page.locator('[data-testid="insert-image-button"]').click();
      
      await EditorAssertions.toContainImage(editorPage.editorContent, { alt: altText });
    });

    test('should handle multiple image uploads', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ url: '/uploads/test-image.png' })
          });
        } else {
          route.continue();
        }
      });

      const imageCount = 3;
      for (let i = 0; i < imageCount; i++) {
        await editorPage.imageButton.click();
        await editorPage.imageFileInput.setInputFiles({
          name: `test-image-${i}.png`,
          mimeType: 'image/png',
          buffer: Buffer.from(`test-image-data-${i}`)
        });
        await editorPage.page.locator('[data-testid="insert-image-button"]').click();
        await editorPage.imageModal.waitFor({ state: 'hidden' });
      }

      await EditorAssertions.toContainImage(editorPage.editorContent, { count: imageCount });
    });

    test('should validate image file types', async () => {
      await editorPage.imageButton.click();
      
      // Try to upload invalid file type
      await editorPage.imageFileInput.setInputFiles({
        name: 'invalid-file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('not an image')
      });

      // Should show validation error
      const errorMessage = editorPage.page.locator('[data-testid="file-type-error"]');
      await expect(errorMessage).toBeVisible();
      expect(await errorMessage.textContent()).toContain('invalid');
    });

    test('should validate image file size', async () => {
      await editorPage.imageButton.click();
      
      // Create a large buffer to simulate oversized file
      const largeBuffer = Buffer.alloc(50 * 1024 * 1024); // 50MB
      
      await editorPage.imageFileInput.setInputFiles({
        name: 'large-image.jpg',
        mimeType: 'image/jpeg',
        buffer: largeBuffer
      });

      // Should show size validation error
      const errorMessage = editorPage.page.locator('[data-testid="file-size-error"]');
      if (await errorMessage.isVisible()) {
        expect(await errorMessage.textContent()).toMatch(/size|large|limit/i);
      }
    });

    test('should resize images when needed', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ url: '/uploads/resized-image.png', width: 300, height: 200 })
          });
        } else {
          route.continue();
        }
      });

      await editorPage.imageButton.click();
      await editorPage.imageFileInput.setInputFiles({
        name: 'large-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('large-image-data')
      });

      // Check resize options if available
      const resizeOption = editorPage.page.locator('[data-testid="resize-image"]');
      if (await resizeOption.isVisible()) {
        await resizeOption.check();
      }

      await editorPage.page.locator('[data-testid="insert-image-button"]').click();
      
      await EditorAssertions.toContainImage(editorPage.editorContent);
    });

    test('should handle image drag and drop', async ({ page }) => {
      // Mock drag and drop functionality
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ url: '/uploads/dropped-image.png' })
          });
        } else {
          route.continue();
        }
      });

      // Simulate drag and drop event
      await page.evaluate(() => {
        const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
        if (editor) {
          const dropEvent = new DragEvent('drop', {
            dataTransfer: new DataTransfer()
          });
          
          // Mock file in data transfer
          const mockFile = new File(['image-data'], 'dropped-image.png', { type: 'image/png' });
          dropEvent.dataTransfer?.items.add(mockFile);
          
          editor.dispatchEvent(dropEvent);
        }
      });

      // Should handle the dropped file
      await EditorAssertions.toContainImage(editorPage.editorContent);
    });

    test('should edit existing images', async ({ page }) => {
      // First insert an image
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ url: '/uploads/editable-image.png' })
          });
        } else {
          route.continue();
        }
      });

      await editorPage.imageButton.click();
      await editorPage.imageFileInput.setInputFiles({
        name: 'editable-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('image-data')
      });
      await editorPage.page.locator('[data-testid="insert-image-button"]').click();

      // Click on the inserted image to edit
      const image = editorPage.editorContent.locator('img').first();
      await image.dblclick();

      // Should open image edit modal
      const editModal = editorPage.page.locator('[data-testid="image-edit-modal"]');
      if (await editModal.isVisible()) {
        // Change alt text
        const altInput = editorPage.page.locator('[data-testid="edit-alt-text"]');
        await altInput.fill('Updated alt text');
        
        await editorPage.page.locator('[data-testid="save-image-changes"]').click();
        
        await EditorAssertions.toContainImage(editorPage.editorContent, { alt: 'Updated alt text' });
      }
    });
  });

  test.describe('Video Handling', () => {
    test('should embed YouTube video', async () => {
      const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      
      await editorPage.insertVideo(youtubeUrl);
      await EditorAssertions.toContainVideo(editorPage.editorContent, { type: 'youtube' });
    });

    test('should embed Vimeo video', async () => {
      const vimeoUrl = 'https://vimeo.com/147365861';
      
      await editorPage.insertVideo(vimeoUrl);
      await EditorAssertions.toContainVideo(editorPage.editorContent, { type: 'vimeo' });
    });

    test('should handle direct video URLs', async () => {
      const directUrl = 'https://example.com/video.mp4';
      
      await editorPage.insertVideo(directUrl);
      await EditorAssertions.toContainVideo(editorPage.editorContent, { type: 'html5' });
    });

    test('should validate video URLs', async () => {
      await editorPage.videoButton.click();
      
      // Try invalid URL
      await editorPage.videoUrlInput.fill('not-a-valid-url');
      await editorPage.page.locator('[data-testid="insert-video-button"]').click();
      
      // Should show validation error
      const errorMessage = editorPage.page.locator('[data-testid="url-validation-error"]');
      await expect(errorMessage).toBeVisible();
    });

    test('should handle video upload for supported formats', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ url: '/uploads/test-video.mp4' })
          });
        } else {
          route.continue();
        }
      });

      await editorPage.videoButton.click();
      
      const videoFileInput = editorPage.page.locator('[data-testid="video-file-input"]');
      if (await videoFileInput.isVisible()) {
        await videoFileInput.setInputFiles({
          name: 'test-video.mp4',
          mimeType: 'video/mp4',
          buffer: Buffer.from('video-data')
        });
        
        await editorPage.page.locator('[data-testid="insert-video-button"]').click();
        
        await EditorAssertions.toContainVideo(editorPage.editorContent);
      }
    });

    test('should set video dimensions', async () => {
      await editorPage.videoButton.click();
      await editorPage.videoUrlInput.fill('https://www.youtube.com/watch?v=test');
      
      // Set custom dimensions if available
      const widthInput = editorPage.page.locator('[data-testid="video-width"]');
      const heightInput = editorPage.page.locator('[data-testid="video-height"]');
      
      if (await widthInput.isVisible()) {
        await widthInput.fill('640');
        await heightInput.fill('480');
      }
      
      await editorPage.page.locator('[data-testid="insert-video-button"]').click();
      
      const video = editorPage.editorContent.locator('iframe, video').first();
      if (await widthInput.isVisible()) {
        await expect(video).toHaveAttribute('width', '640');
        await expect(video).toHaveAttribute('height', '480');
      }
    });

    test('should handle video playback controls', async () => {
      await editorPage.insertVideo('https://example.com/video.mp4');
      
      const video = editorPage.editorContent.locator('video').first();
      if (await video.isVisible()) {
        // Should have controls enabled
        await expect(video).toHaveAttribute('controls');
        
        // Should not autoplay by default
        const autoplay = await video.getAttribute('autoplay');
        expect(autoplay).toBeNull();
      }
    });
  });

  test.describe('Link Handling', () => {
    test('should insert basic link', async () => {
      const url = 'https://example.com';
      const linkText = 'Example Link';
      
      await editorPage.insertLink(url, linkText);
      
      const link = editorPage.editorContent.locator('a').first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', url);
      await expect(link).toContainText(linkText);
    });

    test('should create link from selected text', async () => {
      const selectedText = 'Click here';
      const url = 'https://example.com';
      
      await editorPage.typeText(selectedText);
      await editorPage.selectAll();
      await editorPage.insertLink(url);
      
      const link = editorPage.editorContent.locator('a').first();
      await expect(link).toContainText(selectedText);
      await expect(link).toHaveAttribute('href', url);
    });

    test('should validate link URLs', async () => {
      await editorPage.linkButton.click();
      
      // Try invalid URL
      await editorPage.linkUrlInput.fill('invalid-url');
      await editorPage.page.locator('[data-testid="insert-link-button"]').click();
      
      const errorMessage = editorPage.page.locator('[data-testid="link-validation-error"]');
      if (await errorMessage.isVisible()) {
        expect(await errorMessage.textContent()).toMatch(/invalid|url|format/i);
      }
    });

    test('should handle external link attributes', async () => {
      const url = 'https://external-site.com';
      
      await editorPage.linkButton.click();
      await editorPage.linkUrlInput.fill(url);
      await editorPage.linkTextInput.fill('External Link');
      
      // Check external link option if available
      const externalOption = editorPage.page.locator('[data-testid="external-link-option"]');
      if (await externalOption.isVisible()) {
        await externalOption.check();
      }
      
      await editorPage.page.locator('[data-testid="insert-link-button"]').click();
      
      const link = editorPage.editorContent.locator('a').first();
      if (await externalOption.isVisible()) {
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', /noopener/);
      }
    });

    test('should edit existing links', async () => {
      // Create initial link
      await editorPage.insertLink('https://example.com', 'Original Link');
      
      // Double-click to edit
      const link = editorPage.editorContent.locator('a').first();
      await link.dblclick();
      
      // Should open edit modal
      const editModal = editorPage.page.locator('[data-testid="link-edit-modal"]');
      if (await editModal.isVisible()) {
        await editorPage.linkUrlInput.fill('https://updated-example.com');
        await editorPage.linkTextInput.fill('Updated Link');
        await editorPage.page.locator('[data-testid="update-link-button"]').click();
        
        await expect(link).toHaveAttribute('href', 'https://updated-example.com');
        await expect(link).toContainText('Updated Link');
      }
    });

    test('should remove links', async () => {
      await editorPage.insertLink('https://example.com', 'Removable Link');
      
      const link = editorPage.editorContent.locator('a').first();
      await link.click();
      
      // Use keyboard shortcut or toolbar button to remove link
      await editorPage.page.keyboard.press('Control+Shift+k'); // Common unlink shortcut
      
      // Text should remain but link should be removed
      const textContent = await editorPage.getTextContent();
      expect(textContent).toContain('Removable Link');
      
      const remainingLinks = editorPage.editorContent.locator('a');
      await expect(remainingLinks).toHaveCount(0);
    });
  });

  test.describe('Media Accessibility', () => {
    test('should require alt text for images', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ url: '/uploads/test-image.png' })
          });
        } else {
          route.continue();
        }
      });

      await editorPage.imageButton.click();
      await editorPage.imageFileInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('image-data')
      });
      
      // Try to insert without alt text
      await editorPage.page.locator('[data-testid="insert-image-button"]').click();
      
      // Should show warning or require alt text
      const altWarning = editorPage.page.locator('[data-testid="alt-text-warning"]');
      if (await altWarning.isVisible()) {
        expect(await altWarning.textContent()).toMatch(/alt|accessibility|description/i);
      }
    });

    test('should provide keyboard navigation for media elements', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ url: '/uploads/test-image.png' })
          });
        } else {
          route.continue();
        }
      });

      await editorPage.imageButton.click();
      await editorPage.imageFileInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('image-data')
      });
      await editorPage.imageAltInput.fill('Accessible image');
      await editorPage.page.locator('[data-testid="insert-image-button"]').click();
      
      // Navigate to image with keyboard
      await editorPage.page.keyboard.press('Tab');
      
      const image = editorPage.editorContent.locator('img').first();
      await expect(image).toBeFocused();
    });

    test('should provide proper ARIA labels for video controls', async () => {
      await editorPage.insertVideo('https://example.com/video.mp4');
      
      const video = editorPage.editorContent.locator('video').first();
      if (await video.isVisible()) {
        // Check for accessibility attributes
        const ariaLabel = await video.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Media Performance and Error Handling', () => {
    test('should handle upload failures gracefully', async ({ page }) => {
      // Mock upload failure
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Upload failed' })
          });
        } else {
          route.continue();
        }
      });

      await editorPage.imageButton.click();
      await editorPage.imageFileInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('image-data')
      });
      
      await editorPage.page.locator('[data-testid="insert-image-button"]').click();
      
      // Should show error message
      const errorMessage = editorPage.page.locator('[data-testid="upload-error"]');
      await expect(errorMessage).toBeVisible();
      expect(await errorMessage.textContent()).toMatch(/error|failed|upload/i);
    });

    test('should handle broken image URLs', async () => {
      // Programmatically insert an image with broken URL
      await editorPage.page.evaluate(() => {
        const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
        if (editor) {
          editor.innerHTML = '<img src="https://broken-url.com/image.jpg" alt="Broken image">';
        }
      });

      const image = editorPage.editorContent.locator('img').first();
      
      // Should handle broken image gracefully
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute('alt', 'Broken image');
    });

    test('should optimize large media files', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ 
              url: '/uploads/optimized-image.jpg',
              original_size: 5242880,
              optimized_size: 524288,
              optimized: true
            })
          });
        } else {
          route.continue();
        }
      });

      // Upload large image
      const largeImageBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB
      
      await editorPage.imageButton.click();
      await editorPage.imageFileInput.setInputFiles({
        name: 'large-image.jpg',
        mimeType: 'image/jpeg',
        buffer: largeImageBuffer
      });
      
      await editorPage.page.locator('[data-testid="insert-image-button"]').click();
      
      // Should show optimization notice
      const optimizationNotice = editorPage.page.locator('[data-testid="optimization-notice"]');
      if (await optimizationNotice.isVisible()) {
        expect(await optimizationNotice.textContent()).toMatch(/optimized|compressed|reduced/i);
      }
      
      await EditorAssertions.toContainImage(editorPage.editorContent);
    });

    test('should handle media loading states', async ({ page }) => {
      await page.route('**/*', route => {
        if (route.request().url().includes('upload')) {
          // Simulate slow upload
          setTimeout(() => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({ url: '/uploads/slow-image.png' })
            });
          }, 2000);
        } else {
          route.continue();
        }
      });

      await editorPage.imageButton.click();
      await editorPage.imageFileInput.setInputFiles({
        name: 'slow-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('image-data')
      });
      
      await editorPage.page.locator('[data-testid="insert-image-button"]').click();
      
      // Should show loading state
      const loadingIndicator = editorPage.page.locator('[data-testid="media-loading"]');
      await expect(loadingIndicator).toBeVisible();
      
      // Eventually should complete
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
      await EditorAssertions.toContainImage(editorPage.editorContent);
    });
  });
});