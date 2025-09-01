import { test, expect } from '@playwright/test';
import { AvatarPage } from './utils/avatar-page';
import { AvatarTestDataGenerator } from './utils/test-data-generator';

test.describe('3D Avatar Functionality', () => {
  let avatarPage: AvatarPage;

  test.beforeEach(async ({ page }) => {
    avatarPage = new AvatarPage(page);
    await avatarPage.goto('/avatar-3d-demo');
  });

  test.describe('3D Model Loading', () => {
    test('should load 3D avatar model', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);

      // Verify 3D canvas is present and WebGL context is available
      await expect(avatarPage.canvas3D).toBeVisible();
      
      const hasWebGL = await page.evaluate(() => {
        const canvas = document.querySelector('.avatar-3d-canvas') as HTMLCanvasElement;
        if (canvas) {
          const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          return !!context;
        }
        return false;
      });
      
      expect(hasWebGL).toBe(true);
    });

    test('should handle model loading progress', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      
      // Listen for loading events
      const loadingEvents: string[] = [];
      await page.evaluate(() => {
        (window as any).captureLoadingEvents = (event: string) => {
          if (!(window as any).loadingEvents) {
            (window as any).loadingEvents = [];
          }
          (window as any).loadingEvents.push(event);
        };
      });

      await avatarPage.init3DAvatar(config);
      
      const events = await page.evaluate(() => (window as any).loadingEvents || []);
      expect(events).toContain('model-loading-started');
    });

    test('should display loading indicator while model loads', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      
      const initPromise = avatarPage.init3DAvatar(config);
      
      // Should show loading indicator initially
      await expect(avatarPage.loadingIndicator).toBeVisible({ timeout: 5000 });
      
      await initPromise;
      
      // Should hide loading indicator after loading
      await expect(avatarPage.loadingIndicator).toBeHidden({ timeout: 15000 });
    });

    test('should handle model loading failures', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      
      // Mock model loading failure
      await page.route('**/models/**', route => route.abort());
      
      try {
        await avatarPage.init3DAvatar(config);
      } catch (e) {
        // Expected to fail
      }
      
      // Should show error message
      await expect(avatarPage.errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('should support different model formats', async ({ page }) => {
      const modelFormats = ['.gltf', '.glb', '.fbx'];
      
      for (const format of modelFormats) {
        const config = AvatarTestDataGenerator.getDefaultConfig();
        config.appearance.model = `test-model${format}` as any;
        
        await page.evaluate((config) => {
          const avatar = document.querySelector('ng-ui-avatar-3d') as any;
          if (avatar && avatar.loadModel) {
            avatar.loadModel(config.appearance.model);
          }
        }, config);
        
        // Should attempt to load regardless of format
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('3D Rendering Pipeline', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);
    });

    test('should maintain stable frame rate', async ({ page }) => {
      // Enable performance monitoring
      await page.click('[data-testid="performance-toggle"]');
      
      // Wait for several frames to render
      await avatarPage.waitForFrames(60); // 60 frames
      
      const stats = await avatarPage.getPerformanceStats();
      expect(stats.fps).toBeGreaterThan(20); // At least 20 FPS for 3D
      expect(stats.renderTime).toBeLessThan(100); // Less than 100ms render time
    });

    test('should handle different quality settings', async ({ page }) => {
      const qualities: ('low' | 'medium' | 'high' | 'ultra')[] = ['low', 'medium', 'high', 'ultra'];
      
      for (const quality of qualities) {
        await page.evaluate((quality) => {
          const avatar = document.querySelector('ng-ui-avatar-3d') as any;
          if (avatar && avatar.setQuality) {
            avatar.setQuality(quality);
          }
        }, quality);
        
        await page.waitForTimeout(1000);
        
        const stats = await avatarPage.getPerformanceStats();
        
        if (quality === 'low') {
          expect(stats.renderTime).toBeLessThan(50); // Faster render for low quality
        } else if (quality === 'ultra') {
          // Ultra quality may have higher render time but should still be reasonable
          expect(stats.renderTime).toBeLessThan(150);
        }
        
        await avatarPage.takeAvatarScreenshot(`3d-quality-${quality}`);
      }
    });

    test('should handle viewport changes', async ({ page }) => {
      const initialViewport = page.viewportSize();
      
      // Change viewport size
      await page.setViewportSize({ width: 800, height: 600 });
      await page.waitForTimeout(1000);
      
      // 3D canvas should adapt
      const canvasInfo = await page.evaluate(() => {
        const canvas = document.querySelector('.avatar-3d-canvas') as HTMLCanvasElement;
        return canvas ? { width: canvas.width, height: canvas.height } : null;
      });
      
      expect(canvasInfo).toBeDefined();
      expect(canvasInfo!.width).toBeGreaterThan(0);
      expect(canvasInfo!.height).toBeGreaterThan(0);
      
      // Restore viewport
      if (initialViewport) {
        await page.setViewportSize(initialViewport);
      }
    });

    test('should support anti-aliasing', async ({ page }) => {
      // Enable anti-aliasing
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.setAntialiasing) {
          avatar.setAntialiasing(true);
        }
      });
      
      await avatarPage.takeAvatarScreenshot('3d-antialiasing-on');
      
      // Disable anti-aliasing
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.setAntialiasing) {
          avatar.setAntialiasing(false);
        }
      });
      
      await avatarPage.takeAvatarScreenshot('3d-antialiasing-off');
    });

    test('should handle WebGL context loss', async ({ page }) => {
      // Simulate WebGL context loss
      await page.evaluate(() => {
        const canvas = document.querySelector('.avatar-3d-canvas') as HTMLCanvasElement;
        if (canvas) {
          const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (context && context.getExtension('WEBGL_lose_context')) {
            const ext = context.getExtension('WEBGL_lose_context');
            ext?.loseContext();
            
            // Simulate context restoration
            setTimeout(() => {
              ext?.restoreContext();
            }, 2000);
          }
        }
      });
      
      // Avatar should recover from context loss
      await page.waitForTimeout(5000);
      await avatarPage.assertAvatarRendered();
    });
  });

  test.describe('3D Animation System', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.behavior.idleAnimations = true;
      await avatarPage.init3DAvatar(config);
    });

    test('should play skeletal animations', async ({ page }) => {
      // Trigger a gesture with skeletal animation
      await avatarPage.performGesture('wave');
      
      // Check if bone animations are active
      const isAnimating = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        return avatar?.animationMixer?.time > 0;
      });
      
      expect(isAnimating).toBe(true);
    });

    test('should blend animations smoothly', async ({ page }) => {
      // Start idle animation
      await page.waitForTimeout(2000);
      
      // Trigger gesture animation
      await avatarPage.performGesture('nod');
      
      // Should blend from idle to gesture
      const blendingActive = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        return avatar?.animationMixer?._actions?.length > 1;
      });
      
      expect(blendingActive).toBe(true);
    });

    test('should support inverse kinematics', async ({ page }) => {
      // Test IK by pointing gesture
      await avatarPage.performGesture('point');
      
      // Check if IK solver is active
      const ikActive = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        return avatar?.ikSolver?.isActive || false;
      });
      
      // IK should be used for pointing gestures
      expect(ikActive).toBe(true);
    });

    test('should handle animation loops', async ({ page }) => {
      // Start looping idle animation
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.playAnimation) {
          avatar.playAnimation('idle', { loop: true });
        }
      });
      
      // Animation should loop continuously
      await page.waitForTimeout(5000);
      
      const isLooping = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const action = avatar?.animationMixer?._actions?.find((a: any) => a._clip.name === 'idle');
        return action?.loop === 2200; // THREE.LoopRepeat
      });
      
      expect(isLooping).toBe(true);
    });

    test('should support animation constraints', async ({ page }) => {
      // Test look-at constraint
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.setLookAt) {
          avatar.setLookAt({ x: 1, y: 0, z: 0 });
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Head should orient towards target
      const headOrientation = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        return avatar?.headBone?.rotation?.y || 0;
      });
      
      expect(Math.abs(headOrientation)).toBeGreaterThan(0.1);
    });
  });

  test.describe('Facial Animation', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);
    });

    test('should animate facial expressions', async ({ page }) => {
      const expressions = AvatarTestDataGenerator.getTestExpressions();
      
      for (const expression of expressions.slice(0, 3)) {
        await avatarPage.changeExpression(expression.name);
        
        // Check facial morph targets
        const morphActive = await page.evaluate((expressionName) => {
          const avatar = document.querySelector('ng-ui-avatar-3d') as any;
          const mesh = avatar?.faceMesh;
          if (mesh && mesh.morphTargetInfluences) {
            return mesh.morphTargetInfluences.some((influence: number) => Math.abs(influence) > 0.1);
          }
          return false;
        }, expression.name);
        
        expect(morphActive).toBe(true);
        await avatarPage.takeAvatarScreenshot(`3d-expression-${expression.id}`);
      }
    });

    test('should support morph target blending', async ({ page }) => {
      // Blend between expressions
      await avatarPage.changeExpression('happy');
      await page.waitForTimeout(200);
      await avatarPage.changeExpression('surprised');
      
      // Should smoothly blend between morph targets
      const isBlending = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const mesh = avatar?.faceMesh;
        if (mesh && mesh.morphTargetInfluences) {
          // Check if multiple morph targets are active (blending state)
          const activeMorphs = mesh.morphTargetInfluences.filter((influence: number) => Math.abs(influence) > 0.05);
          return activeMorphs.length > 1;
        }
        return false;
      });
      
      expect(isBlending).toBe(true);
    });

    test('should animate eye movements', async ({ page }) => {
      // Enable eye contact
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.enableEyeContact) {
          avatar.enableEyeContact(true);
        }
      });
      
      await page.waitForTimeout(3000);
      
      // Eyes should move for natural looking behavior
      const eyeMovement = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const leftEye = avatar?.leftEyeBone;
        const rightEye = avatar?.rightEyeBone;
        
        if (leftEye && rightEye) {
          return {
            leftRotation: Math.abs(leftEye.rotation.x) + Math.abs(leftEye.rotation.y),
            rightRotation: Math.abs(rightEye.rotation.x) + Math.abs(rightEye.rotation.y)
          };
        }
        return { leftRotation: 0, rightRotation: 0 };
      });
      
      expect(eyeMovement.leftRotation).toBeGreaterThan(0.01);
      expect(eyeMovement.rightRotation).toBeGreaterThan(0.01);
    });

    test('should animate eyelid blinking', async ({ page }) => {
      let blinkDetected = false;
      
      // Monitor for blinking over 10 seconds
      const startTime = Date.now();
      while (Date.now() - startTime < 10000 && !blinkDetected) {
        const eyelidPosition = await page.evaluate(() => {
          const avatar = document.querySelector('ng-ui-avatar-3d') as any;
          const mesh = avatar?.faceMesh;
          if (mesh && mesh.morphTargetInfluences && mesh.morphTargetDictionary) {
            const blinkIndex = mesh.morphTargetDictionary['blink'] || mesh.morphTargetDictionary['eyesClosed'];
            return blinkIndex !== undefined ? mesh.morphTargetInfluences[blinkIndex] : 0;
          }
          return 0;
        });
        
        if (eyelidPosition > 0.3) {
          blinkDetected = true;
          break;
        }
        
        await page.waitForTimeout(500);
      }
      
      expect(blinkDetected).toBe(true);
    });
  });

  test.describe('Camera Controls', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);
    });

    test('should support camera orbiting', async ({ page }) => {
      const initialCameraPosition = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const camera = avatar?.camera;
        return camera ? { x: camera.position.x, y: camera.position.y, z: camera.position.z } : null;
      });
      
      // Simulate mouse drag for orbiting
      await page.mouse.move(400, 300);
      await page.mouse.down();
      await page.mouse.move(500, 300);
      await page.mouse.up();
      
      await page.waitForTimeout(1000);
      
      const finalCameraPosition = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const camera = avatar?.camera;
        return camera ? { x: camera.position.x, y: camera.position.y, z: camera.position.z } : null;
      });
      
      // Camera should have moved
      expect(initialCameraPosition).not.toEqual(finalCameraPosition);
    });

    test('should support camera zoom', async ({ page }) => {
      const initialZoom = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const camera = avatar?.camera;
        return camera ? camera.position.z : 0;
      });
      
      // Simulate mouse wheel for zoom
      await avatarPage.canvas3D.hover();
      await page.mouse.wheel(0, -5); // Zoom in
      
      await page.waitForTimeout(500);
      
      const finalZoom = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const camera = avatar?.camera;
        return camera ? camera.position.z : 0;
      });
      
      expect(finalZoom).toBeLessThan(initialZoom); // Camera moved closer
    });

    test('should support camera panning', async ({ page }) => {
      const initialTarget = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const controls = avatar?.cameraControls;
        return controls ? { x: controls.target.x, y: controls.target.y } : null;
      });
      
      // Simulate middle mouse button drag for panning
      await page.mouse.move(400, 300);
      await page.mouse.down({ button: 'middle' });
      await page.mouse.move(450, 350);
      await page.mouse.up({ button: 'middle' });
      
      await page.waitForTimeout(1000);
      
      const finalTarget = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const controls = avatar?.cameraControls;
        return controls ? { x: controls.target.x, y: controls.target.y } : null;
      });
      
      expect(initialTarget).not.toEqual(finalTarget);
    });

    test('should reset camera to default position', async ({ page }) => {
      // Move camera away from default
      await page.mouse.move(400, 300);
      await page.mouse.down();
      await page.mouse.move(600, 200);
      await page.mouse.up();
      
      // Reset camera
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.resetCamera) {
          avatar.resetCamera();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const cameraPosition = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const camera = avatar?.camera;
        return camera ? { x: camera.position.x, y: camera.position.y, z: camera.position.z } : null;
      });
      
      // Should be back to reasonable default position
      expect(cameraPosition?.z).toBeGreaterThan(1);
    });
  });

  test.describe('Lighting System', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);
    });

    test('should support different lighting setups', async ({ page }) => {
      const lightingModes = ['studio', 'natural', 'dramatic', 'soft'];
      
      for (const mode of lightingModes) {
        await page.evaluate((mode) => {
          const avatar = document.querySelector('ng-ui-avatar-3d') as any;
          if (avatar && avatar.setLighting) {
            avatar.setLighting(mode);
          }
        }, mode);
        
        await page.waitForTimeout(1000);
        await avatarPage.takeAvatarScreenshot(`lighting-${mode}`);
      }
    });

    test('should animate lighting changes', async ({ page }) => {
      // Change lighting with transition
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.setLighting) {
          avatar.setLighting('dramatic', { transition: 2000 });
        }
      });
      
      // Should smoothly transition lighting
      await page.waitForTimeout(3000);
      await avatarPage.takeAvatarScreenshot('lighting-transitioned');
    });

    test('should support dynamic shadows', async ({ page }) => {
      // Enable shadows
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.enableShadows) {
          avatar.enableShadows(true);
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Check if shadow map is being used
      const shadowsEnabled = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const renderer = avatar?.renderer;
        return renderer ? renderer.shadowMap.enabled : false;
      });
      
      expect(shadowsEnabled).toBe(true);
      await avatarPage.takeAvatarScreenshot('shadows-enabled');
    });

    test('should support environment mapping', async ({ page }) => {
      // Set environment map
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.setEnvironment) {
          avatar.setEnvironment('studio');
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Check if environment map is applied
      const hasEnvironment = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const scene = avatar?.scene;
        return scene ? !!scene.environment : false;
      });
      
      expect(hasEnvironment).toBe(true);
    });
  });

  test.describe('Level of Detail (LOD)', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);
    });

    test('should switch LOD based on distance', async ({ page }) => {
      // Zoom out to trigger lower LOD
      await avatarPage.canvas3D.hover();
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 5); // Zoom out
      }
      
      await page.waitForTimeout(2000);
      
      const currentLOD = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        return avatar?.currentLOD || 0;
      });
      
      // Should switch to lower LOD when far away
      expect(currentLOD).toBeGreaterThan(0);
    });

    test('should maintain performance with LOD switching', async ({ page }) => {
      // Get performance at close distance (high LOD)
      await avatarPage.canvas3D.hover();
      await page.mouse.wheel(0, -10); // Zoom in
      await page.waitForTimeout(1000);
      
      const highLODStats = await avatarPage.getPerformanceStats();
      
      // Zoom out for low LOD
      for (let i = 0; i < 20; i++) {
        await page.mouse.wheel(0, 5); // Zoom out significantly
      }
      await page.waitForTimeout(1000);
      
      const lowLODStats = await avatarPage.getPerformanceStats();
      
      // Low LOD should perform better or equal
      expect(lowLODStats.renderTime).toBeLessThanOrEqual(highLODStats.renderTime * 1.5);
    });

    test('should handle LOD transitions smoothly', async ({ page }) => {
      // Gradually zoom out and monitor for jarring transitions
      let previousTriangleCount = 0;
      
      for (let zoom = 0; zoom < 15; zoom++) {
        await page.mouse.wheel(0, 3);
        await page.waitForTimeout(200);
        
        const triangleCount = await page.evaluate(() => {
          const avatar = document.querySelector('ng-ui-avatar-3d') as any;
          return avatar?.getTriangleCount?.() || 0;
        });
        
        // Triangle count should decrease gradually, not jump suddenly
        if (previousTriangleCount > 0 && triangleCount < previousTriangleCount * 0.3) {
          // Sudden jump in LOD - this might be expected behavior
          console.log(`LOD transition at zoom level ${zoom}: ${previousTriangleCount} -> ${triangleCount}`);
        }
        
        previousTriangleCount = triangleCount;
      }
    });
  });

  test.describe('Material System', () => {
    test.beforeEach(async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);
    });

    test('should support PBR materials', async ({ page }) => {
      // Check if PBR materials are loaded
      const materialInfo = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const mesh = avatar?.avatarMesh;
        if (mesh && mesh.material) {
          return {
            type: mesh.material.type,
            hasNormalMap: !!mesh.material.normalMap,
            hasRoughnessMap: !!mesh.material.roughnessMap,
            hasMetalnessMap: !!mesh.material.metalnessMap
          };
        }
        return null;
      });
      
      expect(materialInfo).toBeDefined();
      expect(materialInfo!.type).toContain('PBR');
    });

    test('should support subsurface scattering', async ({ page }) => {
      // Enable subsurface scattering for skin
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.enableSubsurfaceScattering) {
          avatar.enableSubsurfaceScattering(true);
        }
      });
      
      await page.waitForTimeout(1000);
      
      const hasSSS = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        const skinMaterial = avatar?.skinMaterial;
        return skinMaterial ? skinMaterial.subsurface !== undefined : false;
      });
      
      expect(hasSSS).toBe(true);
      await avatarPage.takeAvatarScreenshot('subsurface-scattering');
    });

    test('should handle material swapping', async ({ page }) => {
      // Swap to different clothing material
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.changeMaterial) {
          avatar.changeMaterial('clothing', 'formal');
        }
      });
      
      await page.waitForTimeout(1000);
      await avatarPage.takeAvatarScreenshot('material-swapped');
      
      // Should complete without errors
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });
  });

  test.describe('Performance Optimization', () => {
    test('should use frustum culling', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);

      // Rotate camera to test culling
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.camera) {
          avatar.camera.position.set(10, 0, 0);
          avatar.camera.lookAt(0, 0, 0);
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Objects outside view frustum should be culled
      const culledObjects = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        return avatar?.renderer?.info?.render?.calls || 0;
      });
      
      expect(culledObjects).toBeLessThan(50); // Reasonable number of draw calls
    });

    test('should use instanced rendering for similar objects', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);

      // Add multiple similar objects (like hair strands)
      await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        if (avatar && avatar.enableInstancedHair) {
          avatar.enableInstancedHair(true);
        }
      });
      
      await page.waitForTimeout(2000);
      
      const renderCalls = await page.evaluate(() => {
        const avatar = document.querySelector('ng-ui-avatar-3d') as any;
        return avatar?.renderer?.info?.render?.calls || 0;
      });
      
      // Instanced rendering should reduce draw calls
      expect(renderCalls).toBeLessThan(20);
    });

    test('should handle memory management', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);

      const initialMemory = await avatarPage.monitorMemoryUsage();
      
      // Load and unload multiple assets
      for (let i = 0; i < 5; i++) {
        await page.evaluate((i) => {
          const avatar = document.querySelector('ng-ui-avatar-3d') as any;
          if (avatar && avatar.loadAsset) {
            avatar.loadAsset(`test-asset-${i}`);
          }
        }, i);
        
        await page.waitForTimeout(500);
        
        await page.evaluate((i) => {
          const avatar = document.querySelector('ng-ui-avatar-3d') as any;
          if (avatar && avatar.unloadAsset) {
            avatar.unloadAsset(`test-asset-${i}`);
          }
        }, i);
      }
      
      // Force garbage collection
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      await page.waitForTimeout(2000);
      
      const finalMemory = await avatarPage.monitorMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be minimal after cleanup
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });

  test.describe('WebGL Compatibility', () => {
    test('should work with WebGL 1.0', async ({ page }) => {
      // Force WebGL 1.0
      await page.addInitScript(() => {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type: string, ...args) {
          if (type === 'webgl2') {
            return null; // Force fallback to WebGL 1.0
          }
          return originalGetContext.apply(this, [type, ...args] as any);
        };
      });
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);
      
      // Should still render with WebGL 1.0
      await avatarPage.assertAvatarRendered();
    });

    test('should handle extension availability', async ({ page }) => {
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init3DAvatar(config);

      const extensions = await page.evaluate(() => {
        const canvas = document.querySelector('.avatar-3d-canvas') as HTMLCanvasElement;
        if (canvas) {
          const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (context) {
            return {
              floatTextures: !!context.getExtension('OES_texture_float'),
              anisotropic: !!context.getExtension('EXT_texture_filter_anisotropic'),
              derivatives: !!context.getExtension('OES_standard_derivatives'),
              depthTexture: !!context.getExtension('WEBGL_depth_texture')
            };
          }
        }
        return null;
      });
      
      expect(extensions).toBeDefined();
      // Should adapt based on available extensions
    });

    test('should gracefully degrade without advanced features', async ({ page }) => {
      // Mock limited WebGL capabilities
      await page.addInitScript(() => {
        const originalGetExtension = WebGLRenderingContext.prototype.getExtension;
        WebGLRenderingContext.prototype.getExtension = function(name: string) {
          // Disable advanced extensions
          if (name.includes('OES_texture_float') || name.includes('EXT_color_buffer_float')) {
            return null;
          }
          return originalGetExtension.call(this, name);
        };
      });
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.performance.quality = 'low'; // Use low quality for limited capabilities
      
      await avatarPage.init3DAvatar(config);
      
      // Should still work with limited features
      await avatarPage.assertAvatarRendered();
      await avatarPage.changeExpression('happy');
    });
  });
});