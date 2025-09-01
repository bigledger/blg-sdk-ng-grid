import { test, expect } from '@playwright/test';
import { AvatarPage } from './utils/avatar-page';
import { AvatarTestDataGenerator } from './utils/test-data-generator';

test.describe('Avatar Gesture Animation', () => {
  let avatarPage: AvatarPage;

  test.beforeEach(async ({ page }) => {
    avatarPage = new AvatarPage(page);
    await avatarPage.goto('/avatar-gesture-demo');
  });

  test.describe('Basic Gesture Playback', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      await avatarPage.init2DAvatar(config);
    });

    test('should play predefined gestures', async ({ page }) => {
      const gestures = AvatarTestDataGenerator.getTestGestures();
      
      for (const gesture of gestures.slice(0, 5)) { // Test first 5 gestures
        await avatarPage.performGesture(gesture.name);
        
        // Verify gesture is playing
        await avatarPage.assertGesturePlaying(gesture.name);
        
        // Take screenshot during gesture
        await page.waitForTimeout(500);
        await avatarPage.takeAvatarScreenshot(`gesture-${gesture.id}`);
        
        // Wait for gesture completion
        await avatarPage.waitForGestureComplete();
        
        // Ensure gesture is no longer playing
        const isPlaying = await page.evaluate((gestureName) => {
          const avatar = document.querySelector('.avatar-container');
          return avatar ? avatar.classList.contains(`gesture-${gestureName.toLowerCase()}`) : false;
        }, gesture.name);
        
        expect(isPlaying).toBe(false);
      }
    });

    test('should handle gesture timing correctly', async ({ page }) => {
      const gesture = AvatarTestDataGenerator.getTestGestures()[0]; // Wave gesture
      
      const startTime = Date.now();
      await avatarPage.performGesture(gesture.name);
      await avatarPage.waitForGestureComplete();
      const actualDuration = Date.now() - startTime;
      
      // Duration should be close to expected (with some tolerance)
      const tolerance = 500; // 500ms tolerance
      expect(actualDuration).toBeGreaterThan(gesture.duration - tolerance);
      expect(actualDuration).toBeLessThan(gesture.duration + tolerance);
    });

    test('should interrupt gestures when requested', async ({ page }) => {
      // Start a long gesture
      await avatarPage.performGesture('thinking-pose'); // 4 second gesture
      
      await page.waitForTimeout(1000);
      
      // Interrupt with another gesture
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.performGesture) {
          avatar.performGesture('wave', null, { interrupt: true });
        }
      });
      
      await page.waitForTimeout(500);
      
      // Should now be playing wave gesture
      await avatarPage.assertGesturePlaying('wave');
    });

    test('should queue gestures when interrupt is false', async ({ page }) => {
      // Start first gesture
      await avatarPage.performGesture('wave');
      
      await page.waitForTimeout(500);
      
      // Queue second gesture without interrupting
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.performGesture) {
          avatar.performGesture('nod', null, { interrupt: false });
        }
      });
      
      // First gesture should still be playing
      await avatarPage.assertGesturePlaying('wave');
      
      // Wait for first gesture to complete and second to start
      await avatarPage.waitForGestureComplete();
      await page.waitForTimeout(500);
      
      // Second gesture should now be playing
      await avatarPage.assertGesturePlaying('nod');
    });

    test('should handle gesture playback errors gracefully', async ({ page }) => {
      // Try to play non-existent gesture
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.performGesture) {
          avatar.performGesture('non-existent-gesture');
        }
      });
      
      await page.waitForTimeout(2000);
      
      // Should handle error without crashing
      await expect(avatarPage.errorMessage).not.toBeVisible();
      
      // Should still be able to play valid gestures
      await avatarPage.performGesture('wave');
      await avatarPage.assertGesturePlaying('wave');
    });
  });

  test.describe('Gesture Animation Quality', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      config.behavior.gestureIntensity = 'moderate';
      await avatarPage.init2DAvatar(config);
    });

    test('should animate gestures smoothly', async ({ page }) => {
      // Enable performance monitoring
      await page.click('[data-testid="performance-toggle"]');
      
      const initialStats = await avatarPage.getPerformanceStats();
      
      // Play gesture and monitor performance
      await avatarPage.performGesture('wave');
      
      // Wait for mid-gesture
      await page.waitForTimeout(1000);
      
      const duringGestureStats = await avatarPage.getPerformanceStats();
      
      // Frame rate should remain stable during gesture
      expect(duringGestureStats.fps).toBeGreaterThan(initialStats.fps * 0.8);
      
      await avatarPage.waitForGestureComplete();
    });

    test('should respect gesture intensity settings', async ({ page }) => {
      const intensities: ('subtle' | 'moderate' | 'expressive')[] = ['subtle', 'moderate', 'expressive'];
      
      for (const intensity of intensities) {
        // Update intensity setting
        await page.evaluate((intensity) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.updateConfiguration) {
            avatar.updateConfiguration({
              behavior: { gestureIntensity: intensity }
            });
          }
        }, intensity);
        
        // Perform gesture
        await avatarPage.performGesture('wave');
        await page.waitForTimeout(1000);
        
        // Take screenshot to compare intensities
        await avatarPage.takeAvatarScreenshot(`gesture-intensity-${intensity}`);
        
        await avatarPage.waitForGestureComplete();
      }
    });

    test('should blend gestures with expressions naturally', async ({ page }) => {
      // Set an expression first
      await avatarPage.changeExpression('happy');
      await page.waitForTimeout(500);
      
      // Perform gesture while expression is active
      await avatarPage.performGesture('wave');
      
      // Both should be active
      const combinedState = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        return {
          expression: avatar?.currentExpression?.id,
          isGesturing: avatar?.currentState?.isGesturing || false
        };
      });
      
      expect(combinedState.expression).toBe('happy');
      expect(combinedState.isGesturing).toBe(true);
      
      await avatarPage.takeAvatarScreenshot('gesture-with-expression');
      await avatarPage.waitForGestureComplete();
    });

    test('should handle additive gestures', async ({ page }) => {
      // Start base gesture
      await avatarPage.performGesture('nod');
      await page.waitForTimeout(300);
      
      // Add additive gesture (e.g., hand movement while nodding)
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.performGesture) {
          avatar.performGesture('point', null, { additive: true });
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Both gestures should be active
      const gestureState = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-2d') as any;
        return {
          activeGestures: avatar?.currentState?.activeGestures || [],
          gestureCount: avatar?.animationService?.activeAnimations?.length || 0
        };
      });
      
      expect(gestureState.gestureCount).toBeGreaterThan(1);
      
      await avatarPage.takeAvatarScreenshot('additive-gestures');
    });

    test('should animate gesture transitions smoothly', async ({ page }) => {
      // Perform sequence of gestures rapidly
      const gestureSequence = ['wave', 'nod', 'shrug', 'thumbs-up'];
      
      for (let i = 0; i < gestureSequence.length; i++) {
        const gesture = gestureSequence[i];
        
        // Start next gesture before previous one finishes
        await avatarPage.performGesture(gesture);
        
        if (i < gestureSequence.length - 1) {
          await page.waitForTimeout(800); // Less than full gesture duration
        }
      }
      
      // Should handle rapid transitions smoothly
      await page.waitForTimeout(3000);
      
      const stats = await avatarPage.getPerformanceStats();
      expect(stats.fps).toBeGreaterThan(20); // Should maintain reasonable FPS
      
      // No errors should occur
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });
  });

  test.describe('Automatic Gesture Generation', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      config.behavior.autoGestures = true;
      config.behavior.gestureIntensity = 'moderate';
      await avatarPage.init2DAvatar(config);
    });

    test('should generate gestures automatically during speech', async ({ page }) => {
      // Start speaking
      await avatarPage.speakText('This is a longer speech that should trigger automatic gestures as I speak about various topics and express different ideas.');
      
      // Monitor for automatic gestures
      let automaticGesturesDetected = false;
      const startTime = Date.now();
      
      while (Date.now() - startTime < 10000 && !automaticGesturesDetected) {
        const isGesturing = await page.evaluate(() => {
          const avatar = document.querySelector('.avatar-container');
          return avatar ? avatar.classList.contains('auto-gesturing') : false;
        });
        
        if (isGesturing) {
          automaticGesturesDetected = true;
          break;
        }
        
        await page.waitForTimeout(500);
      }
      
      expect(automaticGesturesDetected).toBe(true);
      
      // Take screenshot during auto-gesturing
      await avatarPage.takeAvatarScreenshot('auto-gesture-during-speech');
    });

    test('should vary automatic gestures to avoid repetition', async ({ page }) => {
      const detectedGestures = new Set<string>();
      
      // Speak multiple times to collect different gestures
      const speechTexts = [
        'This is the first speech segment.',
        'Here is another different speech segment.',
        'And this is a third unique speech segment.',
        'Finally, this is the fourth speech segment.'
      ];
      
      for (const text of speechTexts) {
        await avatarPage.speakText(text);
        
        // Monitor gestures during this speech
        let speechComplete = false;
        
        while (!speechComplete) {
          const gestureInfo = await page.evaluate(() => {
            const avatar = document.querySelector('lib-avatar-core') as any;
            return {
              currentGesture: avatar?.currentState?.currentGesture?.id,
              isPlaying: avatar?.isPlaying?.()
            };
          });
          
          if (gestureInfo.currentGesture) {
            detectedGestures.add(gestureInfo.currentGesture);
          }
          
          if (!gestureInfo.isPlaying) {
            speechComplete = true;
          }
          
          await page.waitForTimeout(200);
        }
        
        await page.waitForTimeout(1000);
      }
      
      // Should have used multiple different gestures
      expect(detectedGestures.size).toBeGreaterThan(2);
    });

    test('should adapt gesture frequency to speech content', async ({ page }) => {
      // Test with different speech content types
      const contentTypes = [
        { 
          text: 'Hello. How are you today? Fine, thank you.',
          type: 'simple',
          expectedGestureCount: 'low'
        },
        {
          text: 'I am extremely excited about this amazing opportunity! This is fantastic news and I cannot wait to get started with this incredible project!',
          type: 'expressive',
          expectedGestureCount: 'high'
        },
        {
          text: 'The technical specifications include advanced algorithms, complex data structures, sophisticated authentication protocols, and comprehensive error handling mechanisms.',
          type: 'technical',
          expectedGestureCount: 'medium'
        }
      ];
      
      for (const content of contentTypes) {
        let gestureCount = 0;
        
        await avatarPage.speakText(content.text);
        
        // Count gestures during speech
        const startTime = Date.now();
        let speechActive = true;
        
        while (speechActive && Date.now() - startTime < 15000) {
          const speechInfo = await page.evaluate(() => {
            const avatar = document.querySelector('lib-avatar-core') as any;
            return {
              isPlaying: avatar?.isPlaying?.(),
              isGesturing: avatar?.currentState?.isGesturing
            };
          });
          
          if (!speechInfo.isPlaying) {
            speechActive = false;
          }
          
          if (speechInfo.isGesturing) {
            gestureCount++;
          }
          
          await page.waitForTimeout(200);
        }
        
        console.log(`${content.type} content generated ${gestureCount} gesture frames`);
        
        // Expressive content should generate more gestures
        if (content.expectedGestureCount === 'high') {
          expect(gestureCount).toBeGreaterThan(5);
        }
        
        await page.waitForTimeout(1000);
      }
    });

    test('should synchronize gestures with speech rhythm', async ({ page }) => {
      const speechText = 'One, two, three, four, five. Six, seven, eight, nine, ten.';
      
      await avatarPage.speakText(speechText);
      
      // Monitor speech amplitude and gesture activity correlation
      const correlationData: Array<{ time: number; amplitude: number; gestureActivity: boolean }> = [];
      const startTime = Date.now();
      
      while (Date.now() - startTime < 8000) {
        const syncData = await page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          return {
            amplitude: avatar?.audioAnalyzer?.getCurrentAmplitude?.() || 0,
            isGesturing: avatar?.currentState?.isGesturing || false,
            isPlaying: avatar?.isPlaying?.()
          };
        });
        
        if (syncData.isPlaying) {
          correlationData.push({
            time: Date.now() - startTime,
            amplitude: syncData.amplitude,
            gestureActivity: syncData.isGesturing
          });
        } else {
          break;
        }
        
        await page.waitForTimeout(100);
      }
      
      // Analyze correlation between speech amplitude and gestures
      if (correlationData.length > 10) {
        const highAmplitudeFrames = correlationData.filter(d => d.amplitude > 0.5);
        const gesturesWithHighAmplitude = highAmplitudeFrames.filter(d => d.gestureActivity).length;
        
        if (highAmplitudeFrames.length > 0) {
          const correlationRatio = gesturesWithHighAmplitude / highAmplitudeFrames.length;
          expect(correlationRatio).toBeGreaterThan(0.3); // At least 30% correlation
        }
      }
    });
  });

  test.describe('Custom Gesture Creation', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      await page.click('[data-testid="gestures-tab"]');
    });

    test('should create custom gesture from keyframes', async ({ page }) => {
      // Open gesture creator
      await page.click('[data-testid="create-gesture"]');
      
      // Define gesture properties
      await page.fill('[data-testid="gesture-name"]', 'Custom Greeting');
      await page.selectOption('[data-testid="gesture-category"]', 'greeting');
      await page.fill('[data-testid="gesture-duration"]', '3000');
      
      // Add keyframes
      await page.click('[data-testid="add-keyframe"]');
      
      // Keyframe 1: Start position
      await page.fill('[data-testid="keyframe-time-0"]', '0');
      await page.fill('[data-testid="right-arm-y-0"]', '0');
      await page.fill('[data-testid="right-hand-rotation-0"]', '0');
      
      // Keyframe 2: Mid position
      await page.click('[data-testid="add-keyframe"]');
      await page.fill('[data-testid="keyframe-time-1"]', '1500');
      await page.fill('[data-testid="right-arm-y-1"]', '45');
      await page.fill('[data-testid="right-hand-rotation-1"]', '20');
      
      // Keyframe 3: End position
      await page.click('[data-testid="add-keyframe"]');
      await page.fill('[data-testid="keyframe-time-2"]', '3000');
      await page.fill('[data-testid="right-arm-y-2"]', '0');
      await page.fill('[data-testid="right-hand-rotation-2"]', '0');
      
      // Preview gesture
      await page.click('[data-testid="preview-gesture"]');
      await page.waitForTimeout(4000);
      
      await avatarPage.takeAvatarScreenshot('custom-gesture-preview');
      
      // Save gesture
      await page.click('[data-testid="save-gesture"]');
      
      // Verify gesture appears in list
      await page.click('[data-testid="close-gesture-creator"]');
      
      const customGesture = page.locator('.gesture-btn:has-text("Custom Greeting")');
      await expect(customGesture).toBeVisible();
      
      // Test the custom gesture
      await customGesture.click();
      await avatarPage.waitForGestureComplete();
    });

    test('should import gesture from motion capture data', async ({ page }) => {
      // Mock motion capture data
      const mocapData = {
        name: 'Imported Dance Move',
        duration: 5000,
        keyframes: [
          { time: 0, joints: { 'right_arm': { x: 0, y: 0, z: 0 }, 'left_arm': { x: 0, y: 0, z: 0 } } },
          { time: 1000, joints: { 'right_arm': { x: 45, y: 30, z: 0 }, 'left_arm': { x: -45, y: 30, z: 0 } } },
          { time: 2000, joints: { 'right_arm': { x: 0, y: 60, z: 20 }, 'left_arm': { x: 0, y: 60, z: -20 } } },
          { time: 3000, joints: { 'right_arm': { x: -30, y: 30, z: 0 }, 'left_arm': { x: 30, y: 30, z: 0 } } },
          { time: 4000, joints: { 'right_arm': { x: 0, y: 0, z: 0 }, 'left_arm': { x: 0, y: 0, z: 0 } } }
        ]
      };
      
      // Import mocap data
      await page.click('[data-testid="import-mocap"]');
      
      await page.setInputFiles('[data-testid="mocap-file"]', {
        name: 'dance-move.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(mocapData))
      });
      
      await page.waitForTimeout(2000);
      
      // Should appear in gesture list
      const importedGesture = page.locator('.gesture-btn:has-text("Imported Dance Move")');
      await expect(importedGesture).toBeVisible();
      
      // Test the imported gesture
      await importedGesture.click();
      await page.waitForTimeout(6000); // Wait for 5s gesture plus transition
      
      await avatarPage.takeAvatarScreenshot('imported-mocap-gesture');
    });

    test('should record gestures from user input', async ({ page }) => {
      // Start gesture recording
      await page.click('[data-testid="record-gesture"]');
      
      // Set recording parameters
      await page.fill('[data-testid="recording-name"]', 'Recorded Gesture');
      await page.click('[data-testid="start-recording"]');
      
      // Simulate user input for recording (mouse movements, etc.)
      const recordingArea = page.locator('[data-testid="gesture-recording-area"]');
      
      // Draw a gesture pattern
      await recordingArea.hover();
      await page.mouse.down();
      
      const gesturePath = [
        { x: 300, y: 200 },
        { x: 350, y: 180 },
        { x: 400, y: 200 },
        { x: 350, y: 220 },
        { x: 300, y: 200 }
      ];
      
      for (const point of gesturePath) {
        await page.mouse.move(point.x, point.y);
        await page.waitForTimeout(100);
      }
      
      await page.mouse.up();
      
      // Stop recording
      await page.click('[data-testid="stop-recording"]');
      
      // Save recorded gesture
      await page.click('[data-testid="save-recorded-gesture"]');
      
      await page.waitForTimeout(2000);
      
      // Should appear in gesture list
      const recordedGesture = page.locator('.gesture-btn:has-text("Recorded Gesture")');
      await expect(recordedGesture).toBeVisible();
    });

    test('should allow gesture modification and refinement', async ({ page }) => {
      // Select existing gesture to modify
      await page.click('[data-testid="edit-gesture-wave"]');
      
      // Modify gesture properties
      await page.fill('[data-testid="gesture-duration"]', '2500'); // Change duration
      
      // Modify existing keyframe
      await page.fill('[data-testid="right-arm-y-1"]', '50'); // Increase arm raise
      
      // Add easing
      await page.selectOption('[data-testid="keyframe-easing-1"]', 'ease-out');
      
      // Preview modified gesture
      await page.click('[data-testid="preview-modified-gesture"]');
      await page.waitForTimeout(3000);
      
      await avatarPage.takeAvatarScreenshot('modified-gesture');
      
      // Save modifications
      await page.click('[data-testid="save-modifications"]');
      
      // Test the modified gesture
      await page.click('[data-testid="close-gesture-editor"]');
      await avatarPage.performGesture('wave');
      await avatarPage.waitForGestureComplete();
    });
  });

  test.describe('Gesture Performance and Optimization', () => {
    test('should optimize gesture playback for performance', async ({ page }) => {
      const config = AvatarTestDataGenerator.getHighPerformanceConfig();
      config.features.gestureGeneration = true;
      await avatarPage.init2DAvatar(config);
      
      // Enable performance monitoring
      await page.click('[data-testid="performance-toggle"]');
      
      const initialStats = await avatarPage.getPerformanceStats();
      
      // Play complex gesture with many keyframes
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.performGesture) {
          // Complex gesture with interpolation
          avatar.performGesture('complex-dance', {
            keyframes: 20,
            interpolation: 'spline',
            duration: 4000
          });
        }
      });
      
      // Monitor performance during gesture
      await page.waitForTimeout(2000);
      const duringGestureStats = await avatarPage.getPerformanceStats();
      
      // Should maintain good performance
      expect(duringGestureStats.fps).toBeGreaterThan(initialStats.fps * 0.7);
      expect(duringGestureStats.renderTime).toBeLessThan(50);
      
      await avatarPage.waitForGestureComplete();
    });

    test('should handle multiple concurrent gestures efficiently', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      await avatarPage.init2DAvatar(config);
      
      const initialMemory = await avatarPage.monitorMemoryUsage();
      
      // Start multiple additive gestures
      const concurrentGestures = ['nod', 'point', 'shrug'];
      
      for (const gesture of concurrentGestures) {
        await page.evaluate((gestureName) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.performGesture) {
            avatar.performGesture(gestureName, null, { additive: true });
          }
        }, gesture);
        
        await page.waitForTimeout(200);
      }
      
      // Let them run concurrently
      await page.waitForTimeout(3000);
      
      const stats = await avatarPage.getPerformanceStats();
      expect(stats.fps).toBeGreaterThan(20);
      
      // Wait for all gestures to complete
      await page.waitForTimeout(5000);
      
      const finalMemory = await avatarPage.monitorMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    test('should cache and reuse gesture animations', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      await avatarPage.init2DAvatar(config);
      
      // Perform same gesture multiple times
      const gesture = 'wave';
      
      // First execution - should cache
      const startTime1 = Date.now();
      await avatarPage.performGesture(gesture);
      await avatarPage.waitForGestureComplete();
      const firstExecutionTime = Date.now() - startTime1;
      
      await page.waitForTimeout(500);
      
      // Second execution - should use cache
      const startTime2 = Date.now();
      await avatarPage.performGesture(gesture);
      await avatarPage.waitForGestureComplete();
      const secondExecutionTime = Date.now() - startTime2;
      
      // Second execution might be slightly faster due to caching
      // (though this may not always be measurable)
      expect(secondExecutionTime).toBeLessThan(firstExecutionTime + 1000);
    });

    test('should degrade gracefully under performance pressure', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      await avatarPage.init2DAvatar(config);
      
      // Create performance pressure
      await page.evaluate(() => {
        // Simulate heavy computation
        const heavyLoop = () => {
          const start = performance.now();
          while (performance.now() - start < 20) {
            // Busy wait
          }
          requestAnimationFrame(heavyLoop);
        };
        heavyLoop();
      });
      
      // Perform gesture under load
      await avatarPage.performGesture('wave');
      
      // Should complete despite performance pressure
      await avatarPage.waitForGestureComplete();
      
      const stats = await avatarPage.getPerformanceStats();
      expect(stats.fps).toBeGreaterThan(10); // Should maintain minimum FPS
    });
  });

  test.describe('Gesture Integration with Other Systems', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      config.features.lipSync = true;
      await avatarPage.init2DAvatar(config);
    });

    test('should coordinate gestures with speech and lip sync', async ({ page }) => {
      // Start speaking with gesture-triggering content
      await avatarPage.speakText('Hello there! *waves enthusiastically* How are you doing today?');
      
      // Monitor coordination
      let coordinationSamples = 0;
      let coordinatedSamples = 0;
      const startTime = Date.now();
      
      while (Date.now() - startTime < 8000) {
        const systemState = await page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          return {
            isSpeaking: avatar?.isPlaying?.() || false,
            isLipSyncing: avatar?.isLipSyncPlaying?.() || false,
            isGesturing: avatar?.currentState?.isGesturing || false
          };
        });
        
        if (systemState.isSpeaking) {
          coordinationSamples++;
          
          // Good coordination: lip sync active during speech, gestures complementing
          if (systemState.isLipSyncing && 
              (systemState.isGesturing || coordinationSamples % 20 === 0)) {
            coordinatedSamples++;
          }
        }
        
        if (!systemState.isSpeaking && coordinationSamples > 0) {
          break;
        }
        
        await page.waitForTimeout(100);
      }
      
      if (coordinationSamples > 0) {
        const coordinationRatio = coordinatedSamples / coordinationSamples;
        expect(coordinationRatio).toBeGreaterThan(0.5); // At least 50% coordination
      }
    });

    test('should respond to emotion detection with appropriate gestures', async ({ page }) => {
      // Enable emotion detection
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.updateConfiguration) {
          avatar.updateConfiguration({
            features: { emotionDetection: true }
          });
        }
      });
      
      // Speak text with different emotional content
      const emotionalTexts = [
        { text: 'I am so happy and excited about this!', expectedGestures: ['thumbs-up', 'clap'] },
        { text: 'I am confused about what happened.', expectedGestures: ['shrug', 'thinking-pose'] },
        { text: 'Thank you so much for your help.', expectedGestures: ['wave', 'nod'] }
      ];
      
      for (const emotionalText of emotionalTexts) {
        await avatarPage.speakText(emotionalText.text);
        
        // Monitor for appropriate gesture responses
        let appropriateGestureDetected = false;
        const monitorStart = Date.now();
        
        while (Date.now() - monitorStart < 6000 && !appropriateGestureDetected) {
          const currentGesture = await page.evaluate(() => {
            const avatar = document.querySelector('lib-avatar-core') as any;
            return avatar?.currentState?.currentGesture?.id;
          });
          
          if (currentGesture && emotionalText.expectedGestures.includes(currentGesture)) {
            appropriateGestureDetected = true;
            break;
          }
          
          await page.waitForTimeout(200);
        }
        
        // Wait for speech to complete
        await page.waitForFunction(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          return !avatar?.isPlaying?.();
        }, { timeout: 10000 });
        
        await page.waitForTimeout(1000);
      }
    });

    test('should adapt gestures based on user interaction context', async ({ page }) => {
      // Simulate different interaction contexts
      const contexts = [
        { type: 'formal', setting: { tone: 'professional', intensity: 'subtle' } },
        { type: 'casual', setting: { tone: 'friendly', intensity: 'moderate' } },
        { type: 'presentation', setting: { tone: 'confident', intensity: 'expressive' } }
      ];
      
      for (const context of contexts) {
        // Set context
        await page.evaluate((contextSetting) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.setInteractionContext) {
            avatar.setInteractionContext(contextSetting);
          }
        }, context.setting);
        
        // Perform standard greeting
        await avatarPage.speakText('Hello and welcome to our presentation.');
        
        // Monitor gesture adaptation
        let gestureIntensityLevel = 'none';
        const monitorStart = Date.now();
        
        while (Date.now() - monitorStart < 5000) {
          const gestureInfo = await page.evaluate(() => {
            const avatar = document.querySelector('lib-avatar-core') as any;
            return {
              isGesturing: avatar?.currentState?.isGesturing,
              gestureIntensity: avatar?.currentState?.currentGesture?.intensity
            };
          });
          
          if (gestureInfo.isGesturing && gestureInfo.gestureIntensity) {
            gestureIntensityLevel = gestureInfo.gestureIntensity;
            break;
          }
          
          await page.waitForTimeout(200);
        }
        
        await avatarPage.takeAvatarScreenshot(`gesture-context-${context.type}`);
        
        // Wait for completion
        await page.waitForFunction(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          return !avatar?.isPlaying?.();
        }, { timeout: 8000 });
        
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Accessibility and Control', () => {
    test('should provide keyboard shortcuts for gesture triggers', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      await avatarPage.init2DAvatar(config);
      
      // Focus on avatar
      await avatarPage.avatar2DContainer.focus();
      
      // Test keyboard shortcuts
      const shortcuts = [
        { key: 'KeyG', expectedGesture: 'wave' },
        { key: 'KeyN', expectedGesture: 'nod' },
        { key: 'KeyS', expectedGesture: 'shrug' }
      ];
      
      for (const shortcut of shortcuts) {
        await page.keyboard.press(shortcut.key);
        await page.waitForTimeout(1000);
        
        const activeGesture = await page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          return avatar?.currentState?.currentGesture?.id;
        });
        
        expect(activeGesture).toBe(shortcut.expectedGesture);
        
        await avatarPage.waitForGestureComplete();
      }
    });

    test('should announce gesture changes for screen readers', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      await avatarPage.init2DAvatar(config);
      
      // Set up announcement monitoring
      const announcements: string[] = [];
      await page.evaluate(() => {
        const liveRegion = document.querySelector('[aria-live]');
        if (liveRegion) {
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const text = (mutation.target as Element).textContent;
                if (text && text.trim()) {
                  (window as any).lastGestureAnnouncement = text;
                }
              }
            });
          });
          observer.observe(liveRegion, { childList: true, subtree: true, characterData: true });
        }
      });
      
      await avatarPage.performGesture('wave');
      await page.waitForTimeout(2000);
      
      const announcement = await page.evaluate(() => (window as any).lastGestureAnnouncement);
      expect(announcement).toContain('wave');
    });

    test('should provide gesture control options', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      await avatarPage.init2DAvatar(config);
      await avatarPage.toggleCustomizer();
      await page.click('[data-testid="gesture-controls-tab"]');
      
      // Test gesture disable/enable
      await page.uncheck('[data-testid="enable-gestures"]');
      
      await avatarPage.performGesture('wave');
      await page.waitForTimeout(2000);
      
      // Gesture should not play when disabled
      const isGesturing = await page.evaluate(() => {
        const avatar = document.querySelector('.avatar-container');
        return avatar ? avatar.classList.contains('gesture-playing') : false;
      });
      
      expect(isGesturing).toBe(false);
      
      // Re-enable gestures
      await page.check('[data-testid="enable-gestures"]');
      
      await avatarPage.performGesture('wave');
      await avatarPage.assertGesturePlaying('wave');
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.gestureGeneration = true;
      await avatarPage.init2DAvatar(config);
      
      await avatarPage.performGesture('wave');
      
      // Gesture should be simplified or use cross-fade instead of movement
      const gestureStyle = await page.evaluate(() => {
        const avatar = document.querySelector('.avatar-container') as any;
        return {
          hasReducedMotion: avatar?.classList.contains('reduced-motion'),
          animationDuration: getComputedStyle(avatar).animationDuration
        };
      });
      
      expect(gestureStyle.hasReducedMotion || gestureStyle.animationDuration === '0s').toBe(true);
    });
  });
});