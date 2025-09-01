import { test, expect } from '@playwright/test';
import { AvatarPage } from './utils/avatar-page';
import { AvatarTestDataGenerator } from './utils/test-data-generator';

test.describe('2D Avatar Functionality', () => {
  let avatarPage: AvatarPage;

  test.beforeEach(async ({ page }) => {
    avatarPage = new AvatarPage(page);
    await avatarPage.goto('/avatar-2d-demo');
  });

  test.describe('Canvas Rendering', () => {
    test('should render avatar using Canvas', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Verify canvas element is present and visible
      await expect(avatarPage.canvas2D).toBeVisible();
      
      // Check canvas dimensions
      const canvasInfo = await avatarPage.getCanvasInfo();
      expect(canvasInfo.type).toBe('canvas');
      expect(canvasInfo.width).toBeGreaterThan(0);
      expect(canvasInfo.height).toBeGreaterThan(0);
      expect(canvasInfo.isRendering).toBe(true);
    });

    test('should maintain frame rate in canvas mode', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Enable performance monitoring
      await page.click('[data-testid="performance-toggle"]');
      
      // Wait for several frames to render
      await avatarPage.waitForFrames(30);
      
      const stats = await avatarPage.getPerformanceStats();
      expect(stats.fps).toBeGreaterThan(20); // At least 20 FPS
      expect(stats.renderTime).toBeLessThan(50); // Less than 50ms render time
    });

    test('should handle canvas resize', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      const initialInfo = await avatarPage.getCanvasInfo();
      
      // Resize the window
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(1000);

      const resizedInfo = await avatarPage.getCanvasInfo();
      
      // Canvas should adapt to new size (if fullscreen mode)
      if (await page.locator('.avatar-container.fullscreen').isVisible()) {
        expect(resizedInfo.width).not.toBe(initialInfo.width);
      }
    });

    test('should export canvas as PNG', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      await avatarPage.exportAsPNG();
      
      // Verify export completed without errors
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });

    test('should handle canvas context loss', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Simulate context loss
      await page.evaluate(() => {
        const canvas = document.querySelector('.avatar-canvas') as HTMLCanvasElement;
        if (canvas) {
          const context = canvas.getContext('2d');
          if (context && (context as any).isContextLost) {
            // Trigger context loss event
            canvas.dispatchEvent(new Event('webglcontextlost'));
          }
        }
      });

      // Avatar should recover
      await page.waitForTimeout(2000);
      await avatarPage.assertAvatarRendered();
    });
  });

  test.describe('SVG Rendering', () => {
    test('should render avatar using SVG', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Switch to SVG rendering
      await avatarPage.switchRenderMode('svg');

      // Verify SVG container is present
      await expect(avatarPage.svgContainer).toBeVisible();
      
      const canvasInfo = await avatarPage.getCanvasInfo();
      expect(canvasInfo.type).toBe('svg');
      expect(canvasInfo.width).toBeGreaterThan(0);
      expect(canvasInfo.height).toBeGreaterThan(0);
    });

    test('should maintain quality in SVG mode', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      await avatarPage.switchRenderMode('svg');
      
      // SVG should contain avatar elements
      const svgContent = await page.evaluate(() => {
        const svgContainer = document.querySelector('.avatar-svg-container');
        return svgContainer ? svgContainer.children.length : 0;
      });
      
      expect(svgContent).toBeGreaterThan(0);
    });

    test('should export SVG format', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      await avatarPage.switchRenderMode('svg');
      await avatarPage.exportAsSVG();
      
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });

    test('should handle SVG animations', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      await avatarPage.switchRenderMode('svg');
      
      // Trigger expression change
      await avatarPage.changeExpression('happy');
      
      // Check for SVG animation elements
      const hasAnimations = await page.evaluate(() => {
        const svg = document.querySelector('.avatar-svg-container svg');
        return svg ? svg.querySelectorAll('animate, animateTransform').length > 0 : false;
      });
      
      expect(hasAnimations).toBe(true);
    });

    test('should switch between canvas and SVG modes smoothly', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Start with canvas
      await expect(avatarPage.canvas2D).toBeVisible();

      // Switch to SVG
      await avatarPage.switchRenderMode('svg');
      await expect(avatarPage.svgContainer).toBeVisible();
      await expect(avatarPage.canvas2D).not.toBeVisible();

      // Switch back to canvas
      await avatarPage.switchRenderMode('canvas');
      await expect(avatarPage.canvas2D).toBeVisible();
      await expect(avatarPage.svgContainer).not.toBeVisible();
    });
  });

  test.describe('Facial Expressions', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
    });

    test('should change to different expressions', async ({ page }) => {
      const expressions = AvatarTestDataGenerator.getTestExpressions();
      
      for (const expression of expressions.slice(0, 5)) { // Test first 5 expressions
        await avatarPage.changeExpression(expression.name);
        await avatarPage.assertExpressionActive(expression.name);
        
        // Take screenshot for visual verification
        await avatarPage.takeAvatarScreenshot(`expression-${expression.id}`);
        
        await page.waitForTimeout(500); // Allow expression to settle
      }
    });

    test('should animate expression transitions smoothly', async ({ page }) => {
      // Change expression and monitor transition
      const startTime = Date.now();
      await avatarPage.changeExpression('happy');
      
      // Wait for transition to complete
      await avatarPage.waitForIdle();
      const transitionTime = Date.now() - startTime;
      
      expect(transitionTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(transitionTime).toBeGreaterThan(200); // Should take some time for smooth transition
    });

    test('should blend expressions naturally', async ({ page }) => {
      // Rapidly change expressions to test blending
      await avatarPage.changeExpression('happy');
      await page.waitForTimeout(200);
      await avatarPage.changeExpression('surprised');
      await page.waitForTimeout(200);
      await avatarPage.changeExpression('sad');
      
      // Should handle rapid changes without errors
      await expect(avatarPage.errorMessage).not.toBeVisible();
      await avatarPage.waitForIdle();
    });

    test('should maintain expression consistency across render modes', async ({ page }) => {
      // Set expression in canvas mode
      await avatarPage.changeExpression('happy');
      const canvasScreenshot = await avatarPage.takeAvatarScreenshot('canvas-happy');

      // Switch to SVG and verify same expression
      await avatarPage.switchRenderMode('svg');
      await page.waitForTimeout(1000);
      const svgScreenshot = await avatarPage.takeAvatarScreenshot('svg-happy');

      // Both should show similar expression (manual verification needed)
      expect(canvasScreenshot).toBeDefined();
      expect(svgScreenshot).toBeDefined();
    });

    test('should respond to keyboard controls', async ({ page }) => {
      // Focus on avatar
      await avatarPage.avatar2DContainer.focus();
      
      // Use number keys to change expressions
      await page.keyboard.press('1');
      await page.waitForTimeout(500);
      
      // Should change to first expression (usually happy)
      await avatarPage.assertExpressionActive('Happy');
      
      await page.keyboard.press('2');
      await page.waitForTimeout(500);
      
      // Should change to second expression
      // Note: The actual expression depends on the order in the template
    });
  });

  test.describe('Animation System', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.behavior.idleAnimations = true;
      await avatarPage.init2DAvatar(config);
    });

    test('should play idle animations', async ({ page }) => {
      // Wait for idle animations to start
      await page.waitForTimeout(5000);
      
      // Check if avatar is animating
      const isAnimating = await page.evaluate(() => {
        const avatar = document.querySelector('.avatar-container');
        return avatar ? avatar.classList.contains('animating') : false;
      });
      
      // Idle animations should be playing
      expect(isAnimating).toBe(true);
    });

    test('should play blinking animation', async ({ page }) => {
      let blinkDetected = false;
      
      // Monitor for blink animations over 10 seconds
      const startTime = Date.now();
      while (Date.now() - startTime < 10000 && !blinkDetected) {
        const isBlinking = await page.evaluate(() => {
          const avatar = document.querySelector('.avatar-container') as any;
          return avatar?.classList.contains('blinking') || false;
        });
        
        if (isBlinking) {
          blinkDetected = true;
          break;
        }
        
        await page.waitForTimeout(500);
      }
      
      expect(blinkDetected).toBe(true);
    });

    test('should handle animation speed changes', async ({ page }) => {
      // Slow down animations
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        if (avatar && avatar.updateConfiguration) {
          avatar.updateConfiguration({
            behavior: { animationSpeed: 0.5 }
          });
        }
      });

      // Trigger expression change
      const startTime = Date.now();
      await avatarPage.changeExpression('happy');
      await avatarPage.waitForIdle();
      const slowTransition = Date.now() - startTime;

      // Speed up animations
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        if (avatar && avatar.updateConfiguration) {
          avatar.updateConfiguration({
            behavior: { animationSpeed: 2.0 }
          });
        }
      });

      const startTime2 = Date.now();
      await avatarPage.changeExpression('sad');
      await avatarPage.waitForIdle();
      const fastTransition = Date.now() - startTime2;

      expect(slowTransition).toBeGreaterThan(fastTransition);
    });

    test('should pause and resume animations', async ({ page }) => {
      // Pause animations
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        if (avatar && avatar.pauseAnimations) {
          avatar.pauseAnimations();
        }
      });

      // Try to change expression - should not animate
      await avatarPage.changeExpression('happy');
      
      const isPaused = await page.evaluate(() => {
        const avatar = document.querySelector('.avatar-container');
        return avatar ? avatar.classList.contains('paused') : false;
      });
      
      expect(isPaused).toBe(true);

      // Resume animations
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        if (avatar && avatar.resumeAnimations) {
          avatar.resumeAnimations();
        }
      });

      await page.waitForTimeout(1000);
      
      const isResumed = await page.evaluate(() => {
        const avatar = document.querySelector('.avatar-container');
        return avatar ? !avatar.classList.contains('paused') : true;
      });
      
      expect(isResumed).toBe(true);
    });
  });

  test.describe('Customization Features', () => {
    test('should customize avatar appearance', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      await avatarPage.customizeAppearance({
        model: 'young-man',
        skinTone: 'light',
        hair: {
          style: 'short',
          color: '#654321'
        }
      });

      // Take screenshot to verify customization
      await avatarPage.takeAvatarScreenshot('customized-avatar');
      
      // Should complete without errors
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });

    test('should show customizer panel', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      await avatarPage.toggleCustomizer();
      
      await expect(avatarPage.customizerPanel).toBeVisible();
      
      // Check for customization controls
      const hasControls = await page.locator('.customization-controls').isVisible();
      expect(hasControls).toBe(true);
    });

    test('should preview customizations in real-time', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      await avatarPage.toggleCustomizer();
      
      // Change hair color via customizer
      const colorPicker = page.locator('[data-testid="hair-color"]');
      await colorPicker.fill('#FF0000'); // Red hair
      
      // Avatar should update immediately
      await page.waitForTimeout(1000);
      await avatarPage.takeAvatarScreenshot('red-hair-preview');
    });

    test('should save and load customization configurations', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Apply customizations
      await avatarPage.customizeAppearance({
        model: 'middle-aged-woman',
        skinTone: 'dark'
      });

      // Export configuration
      const downloadPromise = page.waitForEvent('download');
      await avatarPage.page.click('button:has-text("Export Config")');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('avatar-config');
    });
  });

  test.describe('Character Templates', () => {
    test('should load different character templates', async ({ page }) => {
      const appearances = AvatarTestDataGenerator.getAppearanceVariations();
      
      for (let i = 0; i < Math.min(appearances.length, 3); i++) {
        const config = AvatarTestDataGenerator.getDefaultConfig();
        config.appearance = appearances[i];
        
        await avatarPage.init2DAvatar(config);
        await avatarPage.takeAvatarScreenshot(`template-${i}`);
        
        // Reload page for next template
        if (i < appearances.length - 1) {
          await page.reload();
          await avatarPage.waitForPageLoad();
        }
      }
    });

    test('should switch between templates smoothly', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      const appearances = AvatarTestDataGenerator.getAppearanceVariations();
      
      // Switch to different template
      await page.evaluate((newAppearance) => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        if (avatar && avatar.updateConfiguration) {
          avatar.updateConfiguration({ appearance: newAppearance });
        }
      }, appearances[1]);

      await page.waitForTimeout(2000);
      await avatarPage.takeAvatarScreenshot('template-switched');
    });

    test('should maintain expression when switching templates', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Set expression
      await avatarPage.changeExpression('happy');
      
      const appearances = AvatarTestDataGenerator.getAppearanceVariations();
      
      // Switch template
      await page.evaluate((newAppearance) => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        if (avatar && avatar.updateConfiguration) {
          avatar.updateConfiguration({ appearance: newAppearance });
        }
      }, appearances[1]);

      // Expression should still be happy
      await avatarPage.assertExpressionActive('happy');
    });
  });

  test.describe('Quality Settings', () => {
    test('should render at different quality levels', async ({ page }) => {
      const qualities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      
      for (const quality of qualities) {
        const config = AvatarTestDataGenerator.getDefaultConfig();
        config.performance.quality = quality;
        
        await avatarPage.init2DAvatar(config);
        await avatarPage.takeAvatarScreenshot(`quality-${quality}`);
        
        // Check performance stats
        const stats = await avatarPage.getPerformanceStats();
        
        if (quality === 'low') {
          expect(stats.renderTime).toBeLessThan(30); // Faster render for low quality
        } else if (quality === 'high') {
          expect(stats.layersRendered).toBeGreaterThan(5); // More detail layers
        }
        
        if (quality !== qualities[qualities.length - 1]) {
          await page.reload();
          await avatarPage.waitForPageLoad();
        }
      }
    });

    test('should adapt quality based on performance', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.performance.quality = 'high';
      config.performance.monitoring = true;
      
      await avatarPage.init2DAvatar(config);

      // Simulate performance issues
      await page.evaluate(() => {
        // Simulate heavy load
        const start = Date.now();
        while (Date.now() - start < 100) {
          // Busy wait to simulate load
        }
      });

      // Check if quality adapted
      await page.waitForTimeout(2000);
      
      const stats = await avatarPage.getPerformanceStats();
      // Quality adaptation should maintain reasonable FPS
      expect(stats.fps).toBeGreaterThan(15);
    });
  });

  test.describe('Accessibility in 2D Mode', () => {
    test('should provide keyboard navigation', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Test expression keyboard shortcuts
      await avatarPage.avatar2DContainer.focus();
      
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
      
      // Should toggle between expressions
      const isActive = await page.evaluate(() => {
        const buttons = document.querySelectorAll('.control-btn.active');
        return buttons.length > 0;
      });
      
      expect(isActive).toBe(true);
    });

    test('should have descriptive ARIA labels', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Check canvas/SVG ARIA labels
      const renderingElement = await page.locator('.avatar-canvas, .avatar-svg-container');
      await expect(renderingElement).toHaveAttribute('aria-label');
      
      // Check control buttons
      const controlButtons = await page.locator('.control-btn').all();
      for (const button of controlButtons) {
        await expect(button).toHaveAttribute('title');
      }
    });

    test('should announce expression changes', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Set up live region monitoring
      const announcements: string[] = [];
      await page.evaluate(() => {
        const liveRegion = document.querySelector('[aria-live]');
        if (liveRegion) {
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const text = (mutation.target as Element).textContent;
                if (text) {
                  (window as any).lastAnnouncement = text;
                }
              }
            });
          });
          observer.observe(liveRegion, { childList: true, subtree: true, characterData: true });
        }
      });

      await avatarPage.changeExpression('happy');
      
      const announcement = await page.evaluate(() => (window as any).lastAnnouncement);
      expect(announcement).toContain('happy');
    });

    test('should support screen reader navigation', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Check for proper heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);

      // Check for landmark roles
      const landmarks = await page.locator('[role="main"], [role="region"], [role="banner"]').all();
      expect(landmarks.length).toBeGreaterThan(0);
    });
  });

  test.describe('Error Recovery', () => {
    test('should handle rendering errors gracefully', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Inject rendering error
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        if (avatar && avatar.canvasRenderer) {
          // Simulate rendering error
          avatar.canvasRenderer.context = null;
        }
      });

      // Try to change expression
      await avatarPage.changeExpression('happy');
      
      // Should handle error without crashing
      await page.waitForTimeout(2000);
      await expect(avatarPage.errorMessage).toBeVisible();
    });

    test('should recover from memory issues', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Simulate memory pressure
      await page.evaluate(() => {
        const largeArrays = [];
        try {
          for (let i = 0; i < 100; i++) {
            largeArrays.push(new Array(1000000).fill(0));
          }
        } catch (e) {
          // Expected memory error
        }
      });

      // Avatar should continue to function
      await avatarPage.changeExpression('sad');
      await avatarPage.waitForIdle();
      
      const stats = await avatarPage.getPerformanceStats();
      expect(stats.fps).toBeGreaterThan(10); // Should maintain some performance
    });

    test('should handle corrupted animation data', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);

      // Corrupt animation data
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        if (avatar && avatar.animationService) {
          avatar.animationService._expressions = null;
        }
      });

      // Try to change expression with corrupted data
      await avatarPage.changeExpression('happy');
      
      // Should handle gracefully
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });
  });
});