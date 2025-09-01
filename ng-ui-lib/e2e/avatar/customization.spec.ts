import { test, expect } from '@playwright/test';
import { AvatarPage } from './utils/avatar-page';
import { AvatarTestDataGenerator } from './utils/test-data-generator';

test.describe('Avatar Customization', () => {
  let avatarPage: AvatarPage;

  test.beforeEach(async ({ page }) => {
    avatarPage = new AvatarPage(page);
    await avatarPage.goto('/avatar-customization-demo');
  });

  test.describe('Appearance Customization', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
    });

    test('should change avatar model type', async ({ page }) => {
      const models: ('young-man' | 'young-woman' | 'middle-aged-man' | 'middle-aged-woman')[] = 
        ['young-man', 'young-woman', 'middle-aged-man', 'middle-aged-woman'];
      
      for (const model of models) {
        await page.click(`[data-testid="model-${model}"]`);
        await page.waitForTimeout(1000);
        
        // Verify model change
        const currentModel = await page.evaluate(() => {
          const avatar = document.querySelector('ng-ui-avatar-2d') as any;
          return avatar?.configuration?.appearance?.model;
        });
        
        expect(currentModel).toBe(model);
        await avatarPage.takeAvatarScreenshot(`model-${model}`);
      }
    });

    test('should customize skin tone', async ({ page }) => {
      const skinTones: ('light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark')[] = 
        ['light', 'medium-light', 'medium', 'medium-dark', 'dark'];
      
      for (const tone of skinTones) {
        await page.click(`[data-testid="skin-${tone}"]`);
        await page.waitForTimeout(1000);
        
        const currentTone = await page.evaluate(() => {
          const avatar = document.querySelector('ng-ui-avatar-2d') as any;
          return avatar?.configuration?.appearance?.skinTone;
        });
        
        expect(currentTone).toBe(tone);
        await avatarPage.takeAvatarScreenshot(`skin-tone-${tone}`);
      }
    });

    test('should customize hair style and color', async ({ page }) => {
      const hairStyles = ['short', 'medium', 'long', 'curly', 'straight', 'buzz-cut'];
      const hairColors = ['#000000', '#654321', '#8B4513', '#FFD700', '#FF4500', '#FFFFFF'];
      
      // Test hair styles
      for (let i = 0; i < Math.min(hairStyles.length, 3); i++) {
        const style = hairStyles[i];
        await page.click(`[data-testid="hair-style-${style}"]`);
        await page.waitForTimeout(800);
        
        await avatarPage.takeAvatarScreenshot(`hair-style-${style}`);
      }
      
      // Test hair colors
      for (let i = 0; i < Math.min(hairColors.length, 3); i++) {
        const color = hairColors[i];
        await page.fill('[data-testid="hair-color"]', color);
        await page.waitForTimeout(800);
        
        await avatarPage.takeAvatarScreenshot(`hair-color-${color.substring(1)}`);
      }
    });

    test('should customize clothing', async ({ page }) => {
      const clothingOptions = {
        tops: ['casual', 'business', 'formal', 'creative', 'sporty'],
        accessories: ['glasses', 'earrings', 'necklace', 'hat', 'scarf']
      };
      
      // Test clothing tops
      for (const top of clothingOptions.tops.slice(0, 3)) {
        await page.click(`[data-testid="clothing-top-${top}"]`);
        await page.waitForTimeout(1000);
        
        await avatarPage.takeAvatarScreenshot(`clothing-${top}`);
      }
      
      // Test accessories
      for (const accessory of clothingOptions.accessories.slice(0, 2)) {
        const checkbox = page.locator(`[data-testid="accessory-${accessory}"]`);
        await checkbox.check();
        await page.waitForTimeout(800);
        
        await avatarPage.takeAvatarScreenshot(`accessory-${accessory}`);
        
        // Uncheck for next test
        await checkbox.uncheck();
        await page.waitForTimeout(500);
      }
    });

    test('should customize background', async ({ page }) => {
      const backgrounds = [
        { type: 'solid', value: '#FF6B6B' },
        { type: 'solid', value: '#4ECDC4' },
        { type: 'gradient', value: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' },
        { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
      ];
      
      for (const background of backgrounds) {
        await page.selectOption('[data-testid="background-type"]', background.type);
        await page.fill('[data-testid="background-value"]', background.value);
        await page.waitForTimeout(1000);
        
        const bgHash = background.value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        await avatarPage.takeAvatarScreenshot(`background-${background.type}-${bgHash}`);
      }
    });

    test('should adjust avatar scale and position', async ({ page }) => {
      // Test scaling
      const scales = [0.5, 0.75, 1.0, 1.25, 1.5];
      for (const scale of scales) {
        await page.fill('[data-testid="avatar-scale"]', scale.toString());
        await page.dispatchEvent('[data-testid="avatar-scale"]', 'input');
        await page.waitForTimeout(800);
        
        await avatarPage.takeAvatarScreenshot(`scale-${scale}`);
      }
      
      // Reset scale
      await page.fill('[data-testid="avatar-scale"]', '1.0');
      await page.dispatchEvent('[data-testid="avatar-scale"]', 'input');
      
      // Test positioning
      const positions = [
        { x: -20, y: 0 },
        { x: 20, y: 0 },
        { x: 0, y: -20 },
        { x: 0, y: 20 },
        { x: 0, y: 0 }
      ];
      
      for (const pos of positions) {
        await page.fill('[data-testid="avatar-pos-x"]', pos.x.toString());
        await page.fill('[data-testid="avatar-pos-y"]', pos.y.toString());
        await page.dispatchEvent('[data-testid="avatar-pos-x"]', 'input');
        await page.dispatchEvent('[data-testid="avatar-pos-y"]', 'input');
        await page.waitForTimeout(800);
        
        await avatarPage.takeAvatarScreenshot(`position-${pos.x}-${pos.y}`);
      }
    });

    test('should save and load customization presets', async ({ page }) => {
      // Apply custom appearance
      await avatarPage.customizeAppearance({
        model: 'young-man',
        skinTone: 'medium-dark',
        hair: {
          style: 'curly',
          color: '#654321'
        }
      });
      
      // Save preset
      await page.fill('[data-testid="preset-name"]', 'My Custom Avatar');
      await page.click('[data-testid="save-preset"]');
      
      // Verify save success
      await expect(page.locator('.preset-saved-message')).toBeVisible();
      
      // Change appearance
      await avatarPage.customizeAppearance({
        model: 'young-woman',
        skinTone: 'light'
      });
      
      // Load saved preset
      await page.selectOption('[data-testid="preset-selector"]', 'My Custom Avatar');
      await page.click('[data-testid="load-preset"]');
      
      await page.waitForTimeout(1000);
      
      // Verify preset loaded
      const loadedModel = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        return avatar?.configuration?.appearance?.model;
      });
      
      expect(loadedModel).toBe('young-man');
    });

    test('should export customization as JSON', async ({ page }) => {
      // Apply custom settings
      await avatarPage.customizeAppearance({
        model: 'middle-aged-woman',
        skinTone: 'medium-light'
      });
      
      // Export configuration
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-customization"]');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('customization');
      expect(download.suggestedFilename()).toContain('.json');
    });

    test('should import customization from JSON', async ({ page }) => {
      const customConfig = {
        appearance: {
          model: 'young-man',
          skinTone: 'dark',
          hair: { style: 'short', color: '#000000' },
          clothing: { top: 'formal', accessories: ['glasses'] },
          background: { type: 'solid', value: '#2C3E50' },
          scale: 1.2,
          position: { x: 5, y: -5 }
        }
      };
      
      // Create temporary file
      const configJson = JSON.stringify(customConfig, null, 2);
      await page.setInputFiles('[data-testid="import-customization"]', {
        name: 'custom-avatar.json',
        mimeType: 'application/json',
        buffer: Buffer.from(configJson)
      });
      
      await page.waitForTimeout(2000);
      
      // Verify import
      const importedModel = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        return avatar?.configuration?.appearance?.model;
      });
      
      expect(importedModel).toBe('young-man');
      await avatarPage.takeAvatarScreenshot('imported-customization');
    });
  });

  test.describe('Behavior Customization', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await page.click('[data-testid="behavior-tab"]');
    });

    test('should customize gesture settings', async ({ page }) => {
      // Enable auto-gestures
      await page.check('[data-testid="auto-gestures"]');
      
      // Set gesture intensity
      await page.selectOption('[data-testid="gesture-intensity"]', 'expressive');
      
      // Test with speech
      await avatarPage.speakText('This should trigger expressive gestures');
      
      await page.waitForTimeout(3000);
      
      // Should be gesturing
      const isGesturing = await page.evaluate(() => {
        const avatar = document.querySelector('.avatar-container');
        return avatar ? avatar.classList.contains('gesture-playing') : false;
      });
      
      expect(isGesturing).toBe(true);
    });

    test('should customize idle animation settings', async ({ page }) => {
      // Enable idle animations
      await page.check('[data-testid="idle-animations"]');
      
      // Set frequency (shorter for testing)
      await page.fill('[data-testid="idle-frequency"]', '2'); // 2 seconds
      await page.dispatchEvent('[data-testid="idle-frequency"]', 'input');
      
      // Wait for idle animation
      await page.waitForTimeout(5000);
      
      // Should have triggered idle animation
      const hasIdleAnimation = await page.evaluate(() => {
        const avatar = document.querySelector('.avatar-container');
        return avatar ? avatar.classList.contains('idle-animating') : false;
      });
      
      expect(hasIdleAnimation).toBe(true);
    });

    test('should customize eye contact behavior', async ({ page }) => {
      // Enable eye contact
      await page.check('[data-testid="eye-contact"]');
      
      // Set looking pattern
      await page.selectOption('[data-testid="looking-pattern"]', 'natural');
      
      // Monitor eye movement over time
      let eyeMovementDetected = false;
      const startTime = Date.now();
      
      while (Date.now() - startTime < 10000 && !eyeMovementDetected) {
        const eyeState = await page.evaluate(() => {
          const avatar = document.querySelector('ng-ui-avatar-2d') as any;
          return avatar?.currentExpression?.eyePosition || { x: 0, y: 0 };
        });
        
        if (Math.abs(eyeState.x) > 0.1 || Math.abs(eyeState.y) > 0.1) {
          eyeMovementDetected = true;
        }
        
        await page.waitForTimeout(500);
      }
      
      expect(eyeMovementDetected).toBe(true);
    });

    test('should customize blinking settings', async ({ page }) => {
      // Enable blinking
      await page.check('[data-testid="blinking-enabled"]');
      
      // Set high frequency for testing
      await page.fill('[data-testid="blink-frequency"]', '60'); // 60 blinks per minute
      await page.dispatchEvent('[data-testid="blink-frequency"]', 'input');
      
      // Monitor for blinking
      let blinkDetected = false;
      const startTime = Date.now();
      
      while (Date.now() - startTime < 5000 && !blinkDetected) {
        const isBlinking = await page.evaluate(() => {
          const avatar = document.querySelector('.avatar-container');
          return avatar ? avatar.classList.contains('blinking') : false;
        });
        
        if (isBlinking) {
          blinkDetected = true;
        }
        
        await page.waitForTimeout(200);
      }
      
      expect(blinkDetected).toBe(true);
    });

    test('should customize animation speed', async ({ page }) => {
      // Set slow animation speed
      await page.fill('[data-testid="animation-speed"]', '0.5');
      await page.dispatchEvent('[data-testid="animation-speed"]', 'input');
      
      // Measure expression change time
      const startTime = Date.now();
      await avatarPage.changeExpression('happy');
      await avatarPage.waitForIdle();
      const slowTime = Date.now() - startTime;
      
      // Set fast animation speed
      await page.fill('[data-testid="animation-speed"]', '2.0');
      await page.dispatchEvent('[data-testid="animation-speed"]', 'input');
      
      const startTime2 = Date.now();
      await avatarPage.changeExpression('sad');
      await avatarPage.waitForIdle();
      const fastTime = Date.now() - startTime2;
      
      // Slow should take longer than fast
      expect(slowTime).toBeGreaterThan(fastTime * 1.5);
    });

    test('should customize response delay', async ({ page }) => {
      // Set response delay
      await page.fill('[data-testid="response-delay"]', '2000'); // 2 seconds
      await page.dispatchEvent('[data-testid="response-delay"]', 'input');
      
      // Measure response time
      const startTime = Date.now();
      await avatarPage.speakText('Testing response delay');
      
      // Wait for actual speech to start (after delay)
      await page.waitForFunction(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.isPlaying?.() || false;
      }, { timeout: 5000 });
      
      const actualStartTime = Date.now();
      const delay = actualStartTime - startTime;
      
      // Should have waited approximately 2 seconds
      expect(delay).toBeGreaterThan(1800);
      expect(delay).toBeLessThan(2500);
    });
  });

  test.describe('Advanced Customization', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await page.click('[data-testid="advanced-tab"]');
    });

    test('should create custom expression templates', async ({ page }) => {
      // Open expression editor
      await page.click('[data-testid="expression-editor"]');
      
      // Create new expression
      await page.fill('[data-testid="expression-name"]', 'Custom Smile');
      
      // Adjust facial features
      await page.fill('[data-testid="mouth-curve"]', '0.8');
      await page.fill('[data-testid="eye-squint"]', '0.3');
      await page.fill('[data-testid="cheek-raise"]', '0.5');
      
      // Preview expression
      await page.click('[data-testid="preview-expression"]');
      await page.waitForTimeout(1000);
      
      await avatarPage.takeAvatarScreenshot('custom-expression-preview');
      
      // Save expression
      await page.click('[data-testid="save-expression"]');
      
      // Verify it appears in expression list
      await page.click('[data-testid="close-expression-editor"]');
      const customExpression = page.locator('.control-btn:has-text("Custom Smile")');
      await expect(customExpression).toBeVisible();
      
      // Test using the custom expression
      await customExpression.click();
      await page.waitForTimeout(1000);
      await avatarPage.takeAvatarScreenshot('custom-expression-applied');
    });

    test('should create custom gesture animations', async ({ page }) => {
      // Open gesture editor
      await page.click('[data-testid="gesture-editor"]');
      
      // Create new gesture
      await page.fill('[data-testid="gesture-name"]', 'Custom Wave');
      
      // Define keyframes
      await page.click('[data-testid="add-keyframe"]');
      await page.fill('[data-testid="keyframe-time-0"]', '0');
      await page.fill('[data-testid="right-arm-rotation-0"]', '0');
      
      await page.click('[data-testid="add-keyframe"]');
      await page.fill('[data-testid="keyframe-time-1"]', '1000');
      await page.fill('[data-testid="right-arm-rotation-1"]', '45');
      
      await page.click('[data-testid="add-keyframe"]');
      await page.fill('[data-testid="keyframe-time-2"]', '2000');
      await page.fill('[data-testid="right-arm-rotation-2"]', '0');
      
      // Preview gesture
      await page.click('[data-testid="preview-gesture"]');
      await page.waitForTimeout(3000);
      
      // Save gesture
      await page.click('[data-testid="save-gesture"]');
      
      // Test the custom gesture
      await page.click('[data-testid="close-gesture-editor"]');
      const customGesture = page.locator('.control-btn:has-text("Custom Wave")');
      await expect(customGesture).toBeVisible();
      
      await customGesture.click();
      await avatarPage.waitForGestureComplete();
    });

    test('should customize avatar dimensions and proportions', async ({ page }) => {
      // Open body editor
      await page.click('[data-testid="body-editor"]');
      
      // Adjust proportions
      await page.fill('[data-testid="head-size"]', '1.1');
      await page.fill('[data-testid="eye-size"]', '1.2');
      await page.fill('[data-testid="nose-size"]', '0.9');
      await page.fill('[data-testid="mouth-width"]', '1.1');
      
      // Apply changes
      await page.click('[data-testid="apply-proportions"]');
      await page.waitForTimeout(1500);
      
      await avatarPage.takeAvatarScreenshot('custom-proportions');
      
      // Reset to defaults
      await page.click('[data-testid="reset-proportions"]');
      await page.waitForTimeout(1000);
      
      await avatarPage.takeAvatarScreenshot('reset-proportions');
    });

    test('should create custom color palettes', async ({ page }) => {
      // Open color editor
      await page.click('[data-testid="color-editor"]');
      
      // Create new palette
      await page.fill('[data-testid="palette-name"]', 'Warm Sunset');
      
      // Define colors
      await page.fill('[data-testid="primary-color"]', '#FF6B6B');
      await page.fill('[data-testid="secondary-color"]', '#FFE66D');
      await page.fill('[data-testid="accent-color"]', '#FF8E53');
      await page.fill('[data-testid="background-color"]', '#4ECDC4');
      
      // Preview palette
      await page.click('[data-testid="preview-palette"]');
      await page.waitForTimeout(1000);
      
      await avatarPage.takeAvatarScreenshot('custom-color-palette');
      
      // Save palette
      await page.click('[data-testid="save-palette"]');
      
      // Verify palette in selector
      await page.click('[data-testid="close-color-editor"]');
      const paletteOption = page.locator('[data-testid="color-palette"] option:has-text("Warm Sunset")');
      await expect(paletteOption).toBeVisible();
    });

    test('should customize lighting and shadows', async ({ page }) => {
      // Switch to 3D mode for lighting
      await avatarPage.switchRenderMode('canvas'); // Ensure canvas mode
      
      // Open lighting controls
      await page.click('[data-testid="lighting-controls"]');
      
      // Adjust main light
      await page.fill('[data-testid="main-light-intensity"]', '1.5');
      await page.fill('[data-testid="main-light-color"]', '#FFE5B4');
      
      // Adjust fill light
      await page.fill('[data-testid="fill-light-intensity"]', '0.8');
      await page.fill('[data-testid="fill-light-color"]', '#E6F3FF');
      
      // Enable shadows
      await page.check('[data-testid="enable-shadows"]');
      await page.fill('[data-testid="shadow-intensity"]', '0.7');
      
      // Apply lighting
      await page.click('[data-testid="apply-lighting"]');
      await page.waitForTimeout(1500);
      
      await avatarPage.takeAvatarScreenshot('custom-lighting');
    });
  });

  test.describe('Customization Validation', () => {
    test('should validate input constraints', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      // Test invalid scale (too small)
      await page.fill('[data-testid="avatar-scale"]', '0.1');
      await page.dispatchEvent('[data-testid="avatar-scale"]', 'blur');
      
      const scaleError = page.locator('[data-testid="scale-error"]');
      await expect(scaleError).toBeVisible();
      
      // Test invalid scale (too large)
      await page.fill('[data-testid="avatar-scale"]', '5.0');
      await page.dispatchEvent('[data-testid="avatar-scale"]', 'blur');
      
      await expect(scaleError).toBeVisible();
      
      // Test valid scale
      await page.fill('[data-testid="avatar-scale"]', '1.2');
      await page.dispatchEvent('[data-testid="avatar-scale"]', 'blur');
      
      await expect(scaleError).not.toBeVisible();
    });

    test('should prevent invalid color values', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      // Test invalid color format
      await page.fill('[data-testid="hair-color"]', 'invalid-color');
      await page.dispatchEvent('[data-testid="hair-color"]', 'blur');
      
      const colorError = page.locator('[data-testid="hair-color-error"]');
      await expect(colorError).toBeVisible();
      
      // Test valid color
      await page.fill('[data-testid="hair-color"]', '#FF6B6B');
      await page.dispatchEvent('[data-testid="hair-color"]', 'blur');
      
      await expect(colorError).not.toBeVisible();
    });

    test('should handle incompatible customization combinations', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      // Select model that doesn't support certain hair styles
      await page.click('[data-testid="model-middle-aged-man"]');
      
      // Try to select incompatible hair style
      const longHairOption = page.locator('[data-testid="hair-style-long"]');
      if (await longHairOption.isVisible()) {
        await longHairOption.click();
        
        // Should show compatibility warning
        const warning = page.locator('.compatibility-warning');
        await expect(warning).toBeVisible({ timeout: 3000 });
      }
    });

    test('should provide real-time validation feedback', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      // Monitor validation as user types
      const scaleInput = page.locator('[data-testid="avatar-scale"]');
      
      // Clear and type invalid value
      await scaleInput.clear();
      await scaleInput.type('10'); // Too large
      
      // Should show warning immediately
      const warning = page.locator('.validation-warning');
      await expect(warning).toBeVisible({ timeout: 1000 });
      
      // Correct the value
      await scaleInput.clear();
      await scaleInput.type('1.5'); // Valid
      
      // Warning should disappear
      await expect(warning).not.toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('Customization Performance', () => {
    test('should handle rapid customization changes', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      const initialMemory = await avatarPage.monitorMemoryUsage();
      
      // Make many rapid changes
      for (let i = 0; i < 20; i++) {
        await page.click(`[data-testid="skin-${i % 2 === 0 ? 'light' : 'dark'}"]`);
        await page.fill('[data-testid="hair-color"]', `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`);
        await page.waitForTimeout(50);
      }
      
      await page.waitForTimeout(2000);
      
      const finalMemory = await avatarPage.monitorMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
      
      // Should still be responsive
      await avatarPage.changeExpression('happy');
      await page.waitForTimeout(1000);
    });

    test('should optimize re-rendering during customization', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      // Enable performance monitoring
      await page.click('[data-testid="performance-toggle"]');
      
      const initialStats = await avatarPage.getPerformanceStats();
      
      // Make several customizations
      await page.click('[data-testid="model-young-woman"]');
      await page.waitForTimeout(500);
      await page.click('[data-testid="skin-medium"]');
      await page.waitForTimeout(500);
      await page.fill('[data-testid="hair-color"]', '#8B4513');
      await page.waitForTimeout(500);
      
      const finalStats = await avatarPage.getPerformanceStats();
      
      // Frame rate should remain stable
      expect(finalStats.fps).toBeGreaterThan(initialStats.fps * 0.8);
      
      // Render time shouldn't increase dramatically
      expect(finalStats.renderTime).toBeLessThan(initialStats.renderTime * 2);
    });

    test('should handle complex customizations without lag', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      // Apply complex customization
      await avatarPage.customizeAppearance({
        model: 'young-woman',
        skinTone: 'medium-dark',
        hair: {
          style: 'curly',
          color: '#654321'
        }
      });
      
      // Add multiple accessories
      await page.check('[data-testid="accessory-glasses"]');
      await page.check('[data-testid="accessory-earrings"]');
      await page.check('[data-testid="accessory-necklace"]');
      
      // Set complex background
      await page.selectOption('[data-testid="background-type"]', 'gradient');
      await page.fill('[data-testid="background-value"]', 'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)');
      
      // Measure response time
      const startTime = Date.now();
      await avatarPage.changeExpression('happy');
      await avatarPage.waitForIdle();
      const responseTime = Date.now() - startTime;
      
      // Should respond quickly despite complexity
      expect(responseTime).toBeLessThan(2000);
      
      await avatarPage.takeAvatarScreenshot('complex-customization');
    });
  });

  test.describe('Customization Persistence', () => {
    test('should persist customizations across page reloads', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      
      // Apply customizations
      await avatarPage.customizeAppearance({
        model: 'middle-aged-man',
        skinTone: 'dark',
        hair: {
          style: 'short',
          color: '#000000'
        }
      });
      
      // Save to localStorage
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        if (avatar && avatar.configuration) {
          localStorage.setItem('avatar-customization', JSON.stringify(avatar.configuration));
        }
      });
      
      // Reload page
      await page.reload();
      await avatarPage.waitForPageLoad();
      
      // Initialize with saved config
      await page.evaluate(() => {
        const saved = localStorage.getItem('avatar-customization');
        if (saved) {
          const config = JSON.parse(saved);
          const avatar = document.querySelector('ng-ui-avatar-2d') as any;
          if (avatar && avatar.updateConfiguration) {
            avatar.updateConfiguration(config);
          }
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Verify customizations persisted
      const model = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        return avatar?.configuration?.appearance?.model;
      });
      
      expect(model).toBe('middle-aged-man');
    });

    test('should sync customizations across multiple avatar instances', async ({ page }) => {
      // Create two avatar instances
      await page.goto('/avatar-multi-demo');
      
      const config1 = AvatarTestDataGenerator.getDefaultConfig();
      config1.id = 'avatar-1';
      const config2 = AvatarTestDataGenerator.getDefaultConfig();
      config2.id = 'avatar-2';
      
      await page.evaluate((configs) => {
        const avatar1 = document.querySelector('#avatar-1') as any;
        const avatar2 = document.querySelector('#avatar-2') as any;
        
        if (avatar1 && avatar1.initializeAvatar) {
          avatar1.initializeAvatar(configs.config1);
        }
        if (avatar2 && avatar2.initializeAvatar) {
          avatar2.initializeAvatar(configs.config2);
        }
      }, { config1, config2 });
      
      await page.waitForTimeout(2000);
      
      // Customize first avatar
      await page.evaluate(() => {
        const avatar1 = document.querySelector('#avatar-1') as any;
        if (avatar1 && avatar1.updateConfiguration) {
          avatar1.updateConfiguration({
            appearance: { skinTone: 'light' }
          });
        }
      });
      
      // Sync to second avatar
      await page.evaluate(() => {
        const avatar1 = document.querySelector('#avatar-1') as any;
        const avatar2 = document.querySelector('#avatar-2') as any;
        
        if (avatar1 && avatar2) {
          const config = avatar1.configuration;
          avatar2.updateConfiguration(config);
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Verify sync
      const skinTones = await page.evaluate(() => {
        const avatar1 = document.querySelector('#avatar-1') as any;
        const avatar2 = document.querySelector('#avatar-2') as any;
        
        return {
          avatar1: avatar1?.configuration?.appearance?.skinTone,
          avatar2: avatar2?.configuration?.appearance?.skinTone
        };
      });
      
      expect(skinTones.avatar1).toBe(skinTones.avatar2);
    });
  });

  test.describe('Accessibility in Customization', () => {
    test('should be keyboard navigable', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      // Navigate through customization controls with Tab
      await page.keyboard.press('Tab'); // Focus first control
      let focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continue tabbing through controls
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        focusedElement = await page.locator(':focus');
        
        // Should always have a focused element
        const isFocused = await focusedElement.count();
        expect(isFocused).toBeGreaterThan(0);
      }
    });

    test('should have proper ARIA labels for customization controls', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      // Check ARIA labels on key controls
      const controls = [
        '[data-testid="avatar-scale"]',
        '[data-testid="hair-color"]',
        '[data-testid="background-type"]'
      ];
      
      for (const control of controls) {
        const element = page.locator(control);
        await expect(element).toHaveAttribute('aria-label');
      }
    });

    test('should support screen reader announcements', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      // Check for live regions
      const liveRegion = page.locator('[aria-live]');
      await expect(liveRegion).toHaveCount({ min: 1 });
      
      // Make a change that should announce
      await page.click('[data-testid="model-young-woman"]');
      
      // Should update live region
      await page.waitForTimeout(1000);
      
      const liveContent = await liveRegion.textContent();
      expect(liveContent).toContain('model');
    });

    test('should support high contrast mode', async ({ page }) => {
      // Enable high contrast mode
      await page.addInitScript(() => {
        document.documentElement.classList.add('high-contrast');
      });
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      
      // Take screenshot in high contrast mode
      await avatarPage.takeAvatarScreenshot('high-contrast-customization');
      
      // Verify controls are still visible and usable
      const modelButton = page.locator('[data-testid="model-young-man"]');
      await expect(modelButton).toBeVisible();
      await modelButton.click();
      
      // Should work normally in high contrast mode
      await page.waitForTimeout(1000);
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });
  });
});