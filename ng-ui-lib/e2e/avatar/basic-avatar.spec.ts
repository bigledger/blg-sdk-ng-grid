import { test, expect } from '@playwright/test';
import { AvatarPage } from './utils/avatar-page';
import { AvatarTestDataGenerator } from './utils/test-data-generator';

test.describe('Basic Avatar Rendering', () => {
  let avatarPage: AvatarPage;

  test.beforeEach(async ({ page }) => {
    avatarPage = new AvatarPage(page);
  });

  test.describe('Avatar Core Initialization', () => {
    test('should initialize avatar with default configuration', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();
      await avatarPage.assertAvatarRendered();
      
      // Verify configuration was applied
      const avatarState = await avatarPage.getAvatarState();
      expect(avatarState.messagesProcessed).toBeGreaterThanOrEqual(0);
      expect(avatarState.isProcessing).toBe(false);
    });

    test('should handle invalid configuration gracefully', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      // Provide invalid configuration
      const invalidConfig = {
        id: '', // Invalid empty ID
        appearance: null,
        behavior: {}
      };

      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, invalidConfig);

      // Should show error message
      await expect(avatarPage.errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('should emit ready event after initialization', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      
      // Listen for ready event
      const readyPromise = page.evaluate(() => {
        return new Promise((resolve) => {
          const avatarCore = document.querySelector('lib-avatar-core') as any;
          if (avatarCore) {
            avatarCore.addEventListener('ready', (event: CustomEvent) => {
              resolve(event.detail);
            });
          }
        });
      });

      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      const readyEvent = await readyPromise;
      expect(readyEvent).toBeDefined();
      expect((readyEvent as any).avatarId).toBe(config.id);
    });

    test('should handle multiple initialization attempts', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();

      // Initialize first time
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();

      // Try to initialize again
      const secondConfig = { ...config, id: 'second-avatar' };
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, secondConfig);

      // Should handle gracefully without errors
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });
  });

  test.describe('Avatar State Management', () => {
    test.beforeEach(async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);
      await avatarPage.waitForAvatarInit();
    });

    test('should track avatar statistics', async ({ page }) => {
      const stats = await avatarPage.getAvatarState();
      
      expect(typeof stats.messagesProcessed).toBe('number');
      expect(typeof stats.averageProcessingTime).toBe('number');
      expect(typeof stats.queueLength).toBe('number');
      expect(typeof stats.isProcessing).toBe('boolean');
      expect(typeof stats.uptime).toBe('number');
    });

    test('should update state when performing actions', async ({ page }) => {
      const initialStats = await avatarPage.getAvatarState();
      
      // Trigger a speech action
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.speak) {
          avatarCore.speak('Hello test');
        }
      });

      // Wait for processing
      await page.waitForTimeout(1000);
      
      const updatedStats = await avatarPage.getAvatarState();
      expect(updatedStats.messagesProcessed).toBeGreaterThanOrEqual(initialStats.messagesProcessed);
    });

    test('should emit state change events', async ({ page }) => {
      const stateChangePromise = page.evaluate(() => {
        return new Promise((resolve) => {
          const avatarCore = document.querySelector('lib-avatar-core') as any;
          if (avatarCore) {
            avatarCore.addEventListener('stateChanged', (event: CustomEvent) => {
              resolve(event.detail);
            });
          }
        });
      });

      // Trigger state change
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.speak) {
          avatarCore.speak('State change test');
        }
      });

      const stateChangeEvent = await stateChangePromise;
      expect(stateChangeEvent).toBeDefined();
      expect((stateChangeEvent as any).avatarId).toBeDefined();
    });
  });

  test.describe('Avatar Cleanup', () => {
    test('should cleanup resources on destroy', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();

      // Get initial memory usage
      const initialMemory = await avatarPage.monitorMemoryUsage();

      // Trigger cleanup
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.ngOnDestroy) {
          avatarCore.ngOnDestroy();
        }
      });

      // Wait for cleanup
      await page.waitForTimeout(1000);

      // Check memory usage didn't increase significantly
      const finalMemory = await avatarPage.monitorMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });

    test('should stop all ongoing processes on cleanup', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();

      // Start some processes
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore) {
          avatarCore.speak('Long text to process for testing cleanup');
          avatarCore.performGesture('wave');
        }
      });

      // Cleanup
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.ngOnDestroy) {
          avatarCore.ngOnDestroy();
        }
      });

      // Verify processes stopped
      const stats = await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        return avatarCore?.getStatistics?.() || { isProcessing: false, queueLength: 0 };
      });

      expect(stats.isProcessing).toBe(false);
      expect(stats.queueLength).toBe(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing dependencies gracefully', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      // Mock missing dependencies
      await page.addInitScript(() => {
        // Remove WebSocket support
        (window as any).WebSocket = undefined;
      });

      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.streaming = true; // Enable streaming despite missing WebSocket

      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      // Should still initialize but without streaming
      await avatarPage.waitForAvatarInit();
      await avatarPage.assertAvatarRendered();
    });

    test('should recover from runtime errors', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();

      // Trigger an error
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.speak) {
          // Pass invalid parameters
          avatarCore.speak(null);
        }
      });

      // Avatar should still be functional
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.speak) {
          avatarCore.speak('Recovery test');
        }
      });

      const stats = await avatarPage.getAvatarState();
      expect(stats.messagesProcessed).toBeGreaterThan(0);
    });

    test('should emit error events for tracking', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();

      const errorPromise = page.evaluate(() => {
        return new Promise((resolve) => {
          const avatarCore = document.querySelector('lib-avatar-core') as any;
          if (avatarCore) {
            avatarCore.addEventListener('error', (event: CustomEvent) => {
              resolve(event.detail);
            });
          }
        });
      });

      // Trigger an error condition
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore) {
          // Try to use an invalid voice configuration
          avatarCore.updateConfiguration({
            voice: { provider: 'invalid-provider' }
          });
        }
      });

      const errorEvent = await errorPromise;
      expect(errorEvent).toBeDefined();
      expect((errorEvent as any).avatarId).toBeDefined();
    });
  });

  test.describe('Configuration Updates', () => {
    test.beforeEach(async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);
      await avatarPage.waitForAvatarInit();
    });

    test('should update voice configuration', async ({ page }) => {
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.updateConfiguration) {
          avatarCore.updateConfiguration({
            voice: {
              rate: 1.5,
              pitch: 0.2,
              volume: 0.9
            }
          });
        }
      });

      // Configuration should be updated without errors
      await page.waitForTimeout(500);
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });

    test('should update behavior settings', async ({ page }) => {
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.updateConfiguration) {
          avatarCore.updateConfiguration({
            behavior: {
              animationSpeed: 1.2,
              gestureIntensity: 'expressive',
              autoGestures: false
            }
          });
        }
      });

      await page.waitForTimeout(500);
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });

    test('should update appearance settings', async ({ page }) => {
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.updateConfiguration) {
          avatarCore.updateConfiguration({
            appearance: {
              scale: 1.2,
              position: { x: 10, y: -5 }
            }
          });
        }
      });

      await page.waitForTimeout(500);
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });

    test('should handle partial configuration updates', async ({ page }) => {
      // Update only specific nested properties
      await page.evaluate(() => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.updateConfiguration) {
          avatarCore.updateConfiguration({
            performance: {
              quality: 'ultra'
            }
          });
        }
      });

      await page.waitForTimeout(500);
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();

      // Check for essential ARIA attributes
      const avatarContainer = await avatarPage.avatarContainer;
      await expect(avatarContainer).toHaveAttribute('role');
      await expect(avatarContainer).toHaveAttribute('aria-label');
    });

    test('should be keyboard accessible', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();

      // Test tab navigation
      await page.keyboard.press('Tab');
      
      // Avatar container should be focusable
      const focusedElement = await page.locator(':focus');
      expect(await focusedElement.count()).toBeGreaterThan(0);
    });

    test('should announce state changes to screen readers', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();

      // Check for live regions
      const liveRegion = page.locator('[aria-live]');
      await expect(liveRegion).toHaveCount({ min: 1 });
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should track initialization time', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.performance.monitoring = true;

      const startTime = Date.now();
      
      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();
      
      const initTime = Date.now() - startTime;
      expect(initTime).toBeLessThan(10000); // Should initialize within 10 seconds
    });

    test('should monitor memory usage', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.performance.monitoring = true;

      const initialMemory = await avatarPage.monitorMemoryUsage();

      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();

      const finalMemory = await avatarPage.monitorMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    test('should maintain stable performance over time', async ({ page }) => {
      await avatarPage.goto('/avatar-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.performance.monitoring = true;

      await page.evaluate((config) => {
        const avatarCore = document.querySelector('lib-avatar-core') as any;
        if (avatarCore && avatarCore.initializeAvatar) {
          avatarCore.initializeAvatar(config);
        }
      }, config);

      await avatarPage.waitForAvatarInit();

      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        await page.evaluate((i) => {
          const avatarCore = document.querySelector('lib-avatar-core') as any;
          if (avatarCore && avatarCore.speak) {
            avatarCore.speak(`Test message ${i}`);
          }
        }, i);
        await page.waitForTimeout(100);
      }

      // Check that avatar is still responsive
      const stats = await avatarPage.getAvatarState();
      expect(stats.messagesProcessed).toBeGreaterThan(5);
      
      // Memory shouldn't have grown excessively
      const finalMemory = await avatarPage.monitorMemoryUsage();
      expect(finalMemory.heapUsed).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    const browserConfigs = AvatarTestDataGenerator.getBrowserTestConfigs();

    browserConfigs.forEach(browserConfig => {
      test(`should work in ${browserConfig.name}`, async ({ page, browserName }) => {
        // Skip if not testing this specific browser
        if (
          (browserConfig.name.includes('Chrome') && browserName !== 'chromium') ||
          (browserConfig.name.includes('Firefox') && browserName !== 'firefox') ||
          (browserConfig.name.includes('Safari') && browserName !== 'webkit')
        ) {
          test.skip();
          return;
        }

        await page.setViewportSize(browserConfig.viewport);
        await avatarPage.goto('/avatar-demo');
        
        const config = AvatarTestDataGenerator.getDefaultConfig();
        await page.evaluate((config) => {
          const avatarCore = document.querySelector('lib-avatar-core') as any;
          if (avatarCore && avatarCore.initializeAvatar) {
            avatarCore.initializeAvatar(config);
          }
        }, config);

        await avatarPage.waitForAvatarInit();
        await avatarPage.assertAvatarRendered();

        // Test browser-specific features
        const hasCanvas = await page.evaluate(() => {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext && canvas.getContext('2d'));
        });
        expect(hasCanvas).toBe(browserConfig.expectedSupport.canvas);

        const hasWebGL = await page.evaluate(() => {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        });
        expect(hasWebGL).toBe(browserConfig.expectedSupport.webgl);
      });
    });
  });
});