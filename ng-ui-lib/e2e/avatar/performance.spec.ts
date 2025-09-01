import { test, expect } from '@playwright/test';
import { AvatarPage } from './utils/avatar-page';
import { AvatarTestDataGenerator } from './utils/test-data-generator';

test.describe('Avatar Performance Benchmarks', () => {
  let avatarPage: AvatarPage;

  test.beforeEach(async ({ page }) => {
    avatarPage = new AvatarPage(page);
  });

  test.describe('Initialization Performance', () => {
    test('should initialize within acceptable time limits', async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      
      const scenarios = AvatarTestDataGenerator.getPerformanceTestScenarios();
      
      for (const scenario of scenarios.slice(0, 3)) { // Test first 3 scenarios
        console.log(`Testing scenario: ${scenario.name}`);
        
        const startTime = Date.now();
        
        // Initialize avatar
        await page.evaluate((config) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.initializeAvatar) {
            avatar.initializeAvatar(config);
          }
        }, scenario.config);
        
        await avatarPage.waitForAvatarInit();
        
        const initTime = Date.now() - startTime;
        
        // Verify against expected metrics
        expect(initTime).toBeLessThan(scenario.expectedMetrics.maxInitTime);
        
        console.log(`${scenario.name} initialized in ${initTime}ms (limit: ${scenario.expectedMetrics.maxInitTime}ms)`);
        
        // Clean up for next test
        await page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.ngOnDestroy) {
            avatar.ngOnDestroy();
          }
        });
        
        await page.waitForTimeout(1000);
      }
    });

    test('should load resources efficiently', async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      
      // Monitor network activity during initialization
      const networkLogs: Array<{ url: string; size: number; duration: number }> = [];
      
      page.on('response', response => {
        if (response.url().includes('avatar') || response.url().includes('model')) {
          networkLogs.push({
            url: response.url(),
            size: 0, // Would need response body to get actual size
            duration: response.timing().receiveHeadersEnd || 0
          });
        }
      });
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      
      await page.evaluate((config) => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.initializeAvatar) {
          avatar.initializeAvatar(config);
        }
      }, config);
      
      await avatarPage.waitForAvatarInit();
      
      // Analyze resource loading
      console.log(`Loaded ${networkLogs.length} avatar resources`);
      
      const slowResources = networkLogs.filter(log => log.duration > 2000);
      expect(slowResources.length).toBeLessThan(3); // Max 2 slow resources
      
      // Total resource count should be reasonable
      expect(networkLogs.length).toBeLessThan(20); // Should not load excessive resources
    });

    test('should handle concurrent initializations efficiently', async ({ page }) => {
      await page.goto('/avatar-multi-demo');
      
      const configs = [
        { ...AvatarTestDataGenerator.getDefaultConfig(), id: 'perf-avatar-1' },
        { ...AvatarTestDataGenerator.getDefaultConfig(), id: 'perf-avatar-2' },
        { ...AvatarTestDataGenerator.getDefaultConfig(), id: 'perf-avatar-3' }
      ];
      
      const startTime = Date.now();
      
      // Initialize all avatars concurrently
      await page.evaluate((configs) => {
        const promises = configs.map((config, index) => {
          const avatar = document.querySelector(`#avatar-${index + 1}`) as any;
          if (avatar && avatar.initializeAvatar) {
            return avatar.initializeAvatar(config);
          }
          return Promise.resolve();
        });
        
        return Promise.all(promises);
      }, configs);
      
      // Wait for all to be ready
      await page.waitForTimeout(5000);
      
      const totalTime = Date.now() - startTime;
      
      // Concurrent initialization should not take 3x single initialization time
      expect(totalTime).toBeLessThan(15000); // Max 15 seconds for 3 avatars
      
      console.log(`${configs.length} avatars initialized concurrently in ${totalTime}ms`);
    });
  });

  test.describe('Runtime Performance', () => {
    test.beforeEach(async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      const config = AvatarTestDataGenerator.getHighPerformanceConfig();
      await avatarPage.init2DAvatar(config);
      
      // Enable performance monitoring
      await page.click('[data-testid="performance-toggle"]');
    });

    test('should maintain stable frame rates', async ({ page }) => {
      const frameRateMeasurements: number[] = [];
      const measurementDuration = 10000; // 10 seconds
      const measurementInterval = 500; // Every 500ms
      
      // Perform various activities during measurement
      const activities = [
        () => avatarPage.changeExpression('happy'),
        () => avatarPage.performGesture('wave'),
        () => avatarPage.changeExpression('sad'),
        () => avatarPage.performGesture('nod'),
        () => avatarPage.speakText('Performance test speech'),
        () => avatarPage.changeExpression('surprised')
      ];
      
      let activityIndex = 0;
      const startTime = Date.now();
      
      const measurementTimer = setInterval(async () => {
        const stats = await avatarPage.getPerformanceStats();
        frameRateMeasurements.push(stats.fps);
        
        // Trigger activity every few measurements
        if (frameRateMeasurements.length % 3 === 0 && activityIndex < activities.length) {
          await activities[activityIndex]();
          activityIndex++;
        }
      }, measurementInterval);
      
      // Run for measurement duration
      await page.waitForTimeout(measurementDuration);
      clearInterval(measurementTimer);
      
      // Analyze frame rate stability
      const minFPS = Math.min(...frameRateMeasurements);
      const maxFPS = Math.max(...frameRateMeasurements);
      const avgFPS = frameRateMeasurements.reduce((sum, fps) => sum + fps, 0) / frameRateMeasurements.length;
      const variance = frameRateMeasurements.reduce((sum, fps) => sum + Math.pow(fps - avgFPS, 2), 0) / frameRateMeasurements.length;
      const standardDeviation = Math.sqrt(variance);
      
      console.log(`FPS: Min=${minFPS}, Max=${maxFPS}, Avg=${avgFPS.toFixed(1)}, StdDev=${standardDeviation.toFixed(1)}`);
      
      // Performance expectations
      expect(minFPS).toBeGreaterThan(20); // Never drop below 20 FPS
      expect(avgFPS).toBeGreaterThan(30); // Average above 30 FPS
      expect(standardDeviation).toBeLessThan(15); // Reasonable stability
    });

    test('should handle complex animations efficiently', async ({ page }) => {
      // Stack multiple complex operations
      const operations = [
        () => avatarPage.changeExpression('happy'),
        () => avatarPage.performGesture('wave'),
        () => avatarPage.speakText('Complex animation test with multiple concurrent operations'),
        () => avatarPage.performGesture('nod', { additive: true }),
        () => page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.updateConfiguration) {
            avatar.updateConfiguration({
              behavior: { animationSpeed: 1.5 }
            });
          }
        })
      ];
      
      const startTime = Date.now();
      
      // Execute all operations rapidly
      for (const operation of operations) {
        await operation();
        await page.waitForTimeout(100);
      }
      
      // Monitor performance during complex animations
      let minFPS = Infinity;
      const monitorDuration = 8000;
      const monitorStart = Date.now();
      
      while (Date.now() - monitorStart < monitorDuration) {
        const stats = await avatarPage.getPerformanceStats();
        minFPS = Math.min(minFPS, stats.fps);
        await page.waitForTimeout(200);
      }
      
      const totalTime = Date.now() - startTime;
      
      console.log(`Complex animations completed in ${totalTime}ms, min FPS: ${minFPS}`);
      
      // Should maintain reasonable performance even with complex animations
      expect(minFPS).toBeGreaterThan(15);
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('should optimize render calls', async ({ page }) => {
      const initialStats = await avatarPage.getPerformanceStats();
      
      // Perform multiple quick changes
      for (let i = 0; i < 10; i++) {
        await avatarPage.changeExpression(i % 2 === 0 ? 'happy' : 'neutral');
        await page.waitForTimeout(50);
      }
      
      await page.waitForTimeout(2000);
      
      const finalStats = await avatarPage.getPerformanceStats();
      
      // Should not have excessive render time increase
      const renderTimeIncrease = finalStats.renderTime - initialStats.renderTime;
      expect(renderTimeIncrease).toBeLessThan(30); // Less than 30ms increase
      
      console.log(`Render time increased by ${renderTimeIncrease.toFixed(2)}ms after rapid changes`);
    });
  });

  test.describe('Memory Management', () => {
    test('should manage memory efficiently during long sessions', async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      
      const scenario = AvatarTestDataGenerator.getPerformanceTestScenarios()
        .find(s => s.name === 'Long Duration Stability');
      
      if (!scenario) return;
      
      await page.evaluate((config) => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.initializeAvatar) {
          avatar.initializeAvatar(config);
        }
      }, scenario.config);
      
      await avatarPage.waitForAvatarInit();
      
      const initialMemory = await avatarPage.monitorMemoryUsage();
      const memoryMeasurements: Array<{ time: number; heapUsed: number }> = [];
      
      // Run continuous operations for extended period
      const sessionDuration = scenario.duration || 60000; // Default 1 minute for testing
      const startTime = Date.now();
      
      const operationTimer = setInterval(async () => {
        // Rotate through different operations
        const elapsed = Date.now() - startTime;
        const operation = Math.floor(elapsed / 5000) % 4;
        
        switch (operation) {
          case 0:
            await avatarPage.changeExpression(['happy', 'sad', 'neutral'][elapsed % 3]);
            break;
          case 1:
            await avatarPage.performGesture(['wave', 'nod', 'shrug'][elapsed % 3]);
            break;
          case 2:
            await avatarPage.speakText(`Memory test message ${Math.floor(elapsed / 1000)}`);
            break;
          case 3:
            // Trigger some customization changes
            await page.evaluate(() => {
              const avatar = document.querySelector('lib-avatar-core') as any;
              if (avatar && avatar.updateConfiguration) {
                avatar.updateConfiguration({
                  behavior: { animationSpeed: 0.8 + Math.random() * 0.4 }
                });
              }
            });
            break;
        }
        
        // Record memory usage
        const currentMemory = await avatarPage.monitorMemoryUsage();
        memoryMeasurements.push({
          time: elapsed,
          heapUsed: currentMemory.heapUsed
        });
      }, 2000);
      
      // Wait for session to complete
      await page.waitForTimeout(sessionDuration);
      clearInterval(operationTimer);
      
      const finalMemory = await avatarPage.monitorMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Analyze memory growth pattern
      const memoryGrowthRate = memoryIncrease / (sessionDuration / 1000); // bytes per second
      
      console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB over ${sessionDuration / 1000}s`);
      console.log(`Growth rate: ${Math.round(memoryGrowthRate / 1024)}KB/s`);
      
      // Memory should not grow excessively
      expect(memoryIncrease).toBeLessThan(scenario.expectedMetrics.maxMemoryIncrease || 100 * 1024 * 1024);
      
      // Growth rate should be minimal (indicating good cleanup)
      expect(memoryGrowthRate).toBeLessThan(10 * 1024); // Less than 10KB/s growth
    });

    test('should clean up resources properly', async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      
      const initialMemory = await avatarPage.monitorMemoryUsage();
      
      // Initialize and use avatar
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await page.evaluate((config) => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.initializeAvatar) {
          avatar.initializeAvatar(config);
        }
      }, config);
      
      await avatarPage.waitForAvatarInit();
      
      // Use various features to allocate memory
      await avatarPage.changeExpression('happy');
      await avatarPage.performGesture('wave');
      await avatarPage.speakText('Testing resource cleanup');
      
      await page.waitForTimeout(5000);
      
      const peakMemory = await avatarPage.monitorMemoryUsage();
      
      // Clean up avatar
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.ngOnDestroy) {
          avatar.ngOnDestroy();
        }
      });
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      await page.waitForTimeout(3000);
      
      const finalMemory = await avatarPage.monitorMemoryUsage();
      
      const peakIncrease = peakMemory.heapUsed - initialMemory.heapUsed;
      const finalIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const cleanupEfficiency = 1 - (finalIncrease / peakIncrease);
      
      console.log(`Peak memory increase: ${Math.round(peakIncrease / 1024 / 1024)}MB`);
      console.log(`Final memory increase: ${Math.round(finalIncrease / 1024 / 1024)}MB`);
      console.log(`Cleanup efficiency: ${(cleanupEfficiency * 100).toFixed(1)}%`);
      
      // Should clean up at least 70% of allocated memory
      expect(cleanupEfficiency).toBeGreaterThan(0.7);
      expect(finalIncrease).toBeLessThan(peakIncrease * 0.5); // Less than 50% should remain
    });

    test('should handle memory pressure gracefully', async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      
      // Create memory pressure
      await page.evaluate(() => {
        (window as any).memoryPressureArrays = [];
        
        // Allocate large amounts of memory
        try {
          for (let i = 0; i < 100; i++) {
            const largeArray = new Array(100000).fill(0).map(() => ({
              data: Math.random().toString(36),
              timestamp: Date.now(),
              index: i
            }));
            (window as any).memoryPressureArrays.push(largeArray);
          }
        } catch (e) {
          console.log('Memory pressure created');
        }
      });
      
      // Avatar should continue working under memory pressure
      await avatarPage.changeExpression('happy');
      await page.waitForTimeout(1000);
      
      await avatarPage.performGesture('wave');
      await page.waitForTimeout(2000);
      
      const stats = await avatarPage.getPerformanceStats();
      
      // Performance should degrade gracefully, not crash
      expect(stats.fps).toBeGreaterThan(10);
      
      // Clean up memory pressure
      await page.evaluate(() => {
        delete (window as any).memoryPressureArrays;
      });
      
      await page.waitForTimeout(2000);
      
      // Should recover after memory pressure is removed
      const recoveryStats = await avatarPage.getPerformanceStats();
      expect(recoveryStats.fps).toBeGreaterThan(stats.fps);
    });
  });

  test.describe('Scalability Testing', () => {
    test('should handle increasing complexity gracefully', async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      
      const complexityLevels = [
        { level: 1, operations: 1, description: 'Simple' },
        { level: 2, operations: 3, description: 'Moderate' },
        { level: 3, operations: 5, description: 'Complex' },
        { level: 4, operations: 8, description: 'Very Complex' }
      ];
      
      const results: Array<{
        level: number;
        fps: number;
        renderTime: number;
        description: string;
      }> = [];
      
      for (const complexity of complexityLevels) {
        console.log(`Testing complexity level ${complexity.level}: ${complexity.description}`);
        
        // Reset avatar state
        await page.evaluate(() => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.sendCommand) {
            avatar.sendCommand('reset');
          }
        });
        
        await page.waitForTimeout(1000);
        
        // Perform operations based on complexity level
        const operations = [
          () => avatarPage.changeExpression('happy'),
          () => avatarPage.performGesture('wave'),
          () => avatarPage.speakText('Complexity test'),
          () => avatarPage.performGesture('nod', { additive: true }),
          () => avatarPage.changeExpression('surprised'),
          () => page.evaluate(() => {
            const avatar = document.querySelector('lib-avatar-core') as any;
            if (avatar && avatar.updateConfiguration) {
              avatar.updateConfiguration({
                behavior: { animationSpeed: 1.2 }
              });
            }
          }),
          () => avatarPage.performGesture('shrug'),
          () => avatarPage.speakText('Additional complexity')
        ];
        
        // Execute operations for this complexity level
        for (let i = 0; i < complexity.operations; i++) {
          if (operations[i]) {
            await operations[i]();
            await page.waitForTimeout(100);
          }
        }
        
        // Measure performance at this complexity level
        await page.waitForTimeout(2000);
        const stats = await avatarPage.getPerformanceStats();
        
        results.push({
          level: complexity.level,
          fps: stats.fps,
          renderTime: stats.renderTime,
          description: complexity.description
        });
        
        console.log(`Level ${complexity.level}: FPS=${stats.fps}, Render=${stats.renderTime}ms`);
        
        await page.waitForTimeout(1000);
      }
      
      // Analyze scalability
      const fpsDecline = results[0].fps - results[results.length - 1].fps;
      const renderTimeIncrease = results[results.length - 1].renderTime - results[0].renderTime;
      
      console.log(`FPS decline: ${fpsDecline}, Render time increase: ${renderTimeIncrease}ms`);
      
      // Performance should degrade gracefully, not catastrophically
      expect(fpsDecline).toBeLessThan(20); // Less than 20 FPS decline
      expect(renderTimeIncrease).toBeLessThan(50); // Less than 50ms increase
      
      // Even at highest complexity, should maintain minimum performance
      expect(results[results.length - 1].fps).toBeGreaterThan(15);
      expect(results[results.length - 1].renderTime).toBeLessThan(100);
    });

    test('should scale with multiple concurrent avatars', async ({ page }) => {
      await page.goto('/avatar-scalability-demo');
      
      const avatarCounts = [1, 2, 3];
      const scalabilityResults: Array<{
        count: number;
        totalFPS: number;
        averageFPS: number;
        totalMemory: number;
      }> = [];
      
      for (const avatarCount of avatarCounts) {
        console.log(`Testing with ${avatarCount} avatar(s)`);
        
        // Initialize avatars
        const configs = Array.from({ length: avatarCount }, (_, i) => ({
          ...AvatarTestDataGenerator.getDefaultConfig(),
          id: `scale-avatar-${i + 1}`
        }));
        
        await page.evaluate((configs) => {
          configs.forEach((config, index) => {
            const avatar = document.querySelector(`#avatar-${index + 1}`) as any;
            if (avatar && avatar.initializeAvatar) {
              avatar.initializeAvatar(config);
            }
          });
        }, configs);
        
        await page.waitForTimeout(3000);
        
        // Activate all avatars simultaneously
        await page.evaluate((count) => {
          for (let i = 1; i <= count; i++) {
            const avatar = document.querySelector(`#avatar-${i}`) as any;
            if (avatar) {
              avatar.changeExpression('happy');
              avatar.performGesture('wave');
              avatar.speak(`Hello from avatar ${i}`);
            }
          }
        }, avatarCount);
        
        await page.waitForTimeout(3000);
        
        // Measure collective performance
        const performanceData = await page.evaluate((count) => {
          let totalFPS = 0;
          let validMeasurements = 0;
          
          for (let i = 1; i <= count; i++) {
            const avatar = document.querySelector(`#avatar-${i}`) as any;
            if (avatar && avatar.getPerformanceStats) {
              const stats = avatar.getPerformanceStats();
              if (stats.fps > 0) {
                totalFPS += stats.fps;
                validMeasurements++;
              }
            }
          }
          
          return {
            totalFPS,
            averageFPS: validMeasurements > 0 ? totalFPS / validMeasurements : 0,
            validMeasurements
          };
        }, avatarCount);
        
        const memory = await avatarPage.monitorMemoryUsage();
        
        scalabilityResults.push({
          count: avatarCount,
          totalFPS: performanceData.totalFPS,
          averageFPS: performanceData.averageFPS,
          totalMemory: memory.heapUsed
        });
        
        console.log(`${avatarCount} avatars: Total FPS=${performanceData.totalFPS}, Avg FPS=${performanceData.averageFPS.toFixed(1)}, Memory=${Math.round(memory.heapUsed / 1024 / 1024)}MB`);
        
        // Clean up for next test
        await page.evaluate((count) => {
          for (let i = 1; i <= count; i++) {
            const avatar = document.querySelector(`#avatar-${i}`) as any;
            if (avatar && avatar.ngOnDestroy) {
              avatar.ngOnDestroy();
            }
          }
        }, avatarCount);
        
        await page.waitForTimeout(2000);
      }
      
      // Analyze scaling characteristics
      for (let i = 1; i < scalabilityResults.length; i++) {
        const current = scalabilityResults[i];
        const previous = scalabilityResults[i - 1];
        
        const fpsPerAvatar = current.averageFPS;
        const memoryPerAvatar = (current.totalMemory - scalabilityResults[0].totalMemory) / current.count;
        
        // Each avatar should maintain reasonable individual performance
        expect(fpsPerAvatar).toBeGreaterThan(15);
        
        // Memory usage should scale linearly, not exponentially
        expect(memoryPerAvatar).toBeLessThan(200 * 1024 * 1024); // Less than 200MB per additional avatar
        
        console.log(`Avatar ${current.count}: ${fpsPerAvatar.toFixed(1)} FPS, ${Math.round(memoryPerAvatar / 1024 / 1024)}MB per avatar`);
      }
    });
  });

  test.describe('Stress Testing', () => {
    test('should handle rapid message processing', async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      config.features.streaming = true;
      await avatarPage.init2DAvatar(config);
      
      const messageCount = 100;
      const messages = Array.from({ length: messageCount }, (_, i) => ({
        type: 'expression',
        payload: { 
          expression: ['happy', 'sad', 'surprised', 'neutral'][i % 4],
          transition: 100
        },
        id: `stress-${i}`,
        timestamp: Date.now()
      }));
      
      const startTime = Date.now();
      
      // Send messages as fast as possible
      for (const message of messages) {
        await page.evaluate((msg) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.processMessage) {
            avatar.processMessage(msg);
          }
        }, message);
      }
      
      const sendingTime = Date.now() - startTime;
      
      // Wait for processing
      await page.waitForTimeout(5000);
      
      const stats = await avatarPage.getAvatarState();
      const processingTime = Date.now() - startTime;
      
      console.log(`Sent ${messageCount} messages in ${sendingTime}ms`);
      console.log(`Processed ${stats.messagesProcessed} messages in ${processingTime}ms`);
      console.log(`Queue length: ${stats.queueLength}`);
      
      // Should process most messages within reasonable time
      expect(stats.messagesProcessed).toBeGreaterThan(messageCount * 0.8);
      expect(processingTime).toBeLessThan(15000); // Within 15 seconds
      
      // Performance should remain stable
      const finalPerformance = await avatarPage.getPerformanceStats();
      expect(finalPerformance.fps).toBeGreaterThan(15);
    });

    test('should recover from extreme resource usage', async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      
      // Create extreme load
      const extremeLoad = async () => {
        // CPU intensive operations
        await page.evaluate(() => {
          const workers = [];
          for (let i = 0; i < 4; i++) {
            const worker = new Worker(URL.createObjectURL(new Blob([`
              let count = 0;
              setInterval(() => {
                for (let i = 0; i < 1000000; i++) {
                  count += Math.sqrt(i);
                }
              }, 10);
            `], { type: 'application/javascript' })));
            workers.push(worker);
          }
          
          (window as any).stressWorkers = workers;
        });
        
        // Memory intensive operations
        await page.evaluate(() => {
          (window as any).stressArrays = [];
          for (let i = 0; i < 50; i++) {
            (window as any).stressArrays.push(new Array(50000).fill(Math.random()));
          }
        });
        
        // Avatar intensive operations
        const rapidOperations = setInterval(async () => {
          await avatarPage.changeExpression(['happy', 'sad'][Math.floor(Math.random() * 2)]);
        }, 100);
        
        return rapidOperations;
      };
      
      const baselineStats = await avatarPage.getPerformanceStats();
      console.log(`Baseline: FPS=${baselineStats.fps}, Render=${baselineStats.renderTime}ms`);
      
      // Apply extreme load
      const rapidOperations = await extremeLoad();
      
      // Let it run under stress
      await page.waitForTimeout(5000);
      
      const stressStats = await avatarPage.getPerformanceStats();
      console.log(`Under stress: FPS=${stressStats.fps}, Render=${stressStats.renderTime}ms`);
      
      // Avatar should still function, even if degraded
      expect(stressStats.fps).toBeGreaterThan(5); // Minimum viable performance
      
      // Remove stress
      clearInterval(rapidOperations);
      await page.evaluate(() => {
        // Terminate workers
        if ((window as any).stressWorkers) {
          (window as any).stressWorkers.forEach((worker: Worker) => worker.terminate());
          delete (window as any).stressWorkers;
        }
        
        // Clear arrays
        delete (window as any).stressArrays;
      });
      
      // Force cleanup
      if ((window as any).gc) {
        await page.evaluate(() => (window as any).gc());
      }
      
      await page.waitForTimeout(3000);
      
      const recoveryStats = await avatarPage.getPerformanceStats();
      console.log(`After recovery: FPS=${recoveryStats.fps}, Render=${recoveryStats.renderTime}ms`);
      
      // Should recover to reasonable performance
      expect(recoveryStats.fps).toBeGreaterThan(stressStats.fps * 1.5);
      expect(recoveryStats.fps).toBeGreaterThan(20);
    });

    test('should maintain stability under continuous load', async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      
      const testDuration = 60000; // 1 minute stress test
      const operationInterval = 200; // Operation every 200ms
      
      let operationCount = 0;
      let errorCount = 0;
      const performanceSamples: number[] = [];
      
      const stressTest = setInterval(async () => {
        try {
          const operations = [
            () => avatarPage.changeExpression(['happy', 'sad', 'surprised', 'neutral'][operationCount % 4]),
            () => avatarPage.performGesture(['wave', 'nod', 'shrug'][operationCount % 3]),
            () => avatarPage.speakText(`Stress test message ${operationCount}`),
            () => page.evaluate(() => {
              const avatar = document.querySelector('lib-avatar-core') as any;
              if (avatar && avatar.updateConfiguration) {
                avatar.updateConfiguration({
                  behavior: { animationSpeed: 0.8 + Math.random() * 0.4 }
                });
              }
            })
          ];
          
          await operations[operationCount % operations.length]();
          operationCount++;
        } catch (error) {
          errorCount++;
          console.error('Stress test operation failed:', error);
        }
      }, operationInterval);
      
      // Sample performance periodically
      const performanceMonitor = setInterval(async () => {
        const stats = await avatarPage.getPerformanceStats();
        performanceSamples.push(stats.fps);
      }, 2000);
      
      // Run stress test
      await page.waitForTimeout(testDuration);
      
      clearInterval(stressTest);
      clearInterval(performanceMonitor);
      
      // Analyze results
      const avgFPS = performanceSamples.reduce((sum, fps) => sum + fps, 0) / performanceSamples.length;
      const minFPS = Math.min(...performanceSamples);
      const errorRate = errorCount / operationCount;
      
      console.log(`Continuous stress test results:`);
      console.log(`- Operations performed: ${operationCount}`);
      console.log(`- Errors encountered: ${errorCount} (${(errorRate * 100).toFixed(1)}%)`);
      console.log(`- Average FPS: ${avgFPS.toFixed(1)}`);
      console.log(`- Minimum FPS: ${minFPS}`);
      
      // Stability expectations
      expect(errorRate).toBeLessThan(0.05); // Less than 5% error rate
      expect(avgFPS).toBeGreaterThan(20); // Maintain reasonable average FPS
      expect(minFPS).toBeGreaterThan(10); // Never drop below 10 FPS
      expect(operationCount).toBeGreaterThan(200); // Should complete significant operations
    });
  });

  test.describe('Cross-Browser Performance', () => {
    const browserConfigs = AvatarTestDataGenerator.getBrowserTestConfigs();
    
    browserConfigs.forEach(browserConfig => {
      test(`should perform acceptably on ${browserConfig.name}`, async ({ page, browserName }) => {
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
        await avatarPage.goto('/avatar-performance-demo');
        
        const config = AvatarTestDataGenerator.getDefaultConfig();
        // Adjust config based on browser capabilities
        if (browserConfig.isMobile) {
          config.performance.quality = 'medium';
          config.performance.maxFPS = 30;
        }
        
        await avatarPage.init2DAvatar(config);
        
        // Perform standardized performance test
        await avatarPage.changeExpression('happy');
        await avatarPage.performGesture('wave');
        await avatarPage.speakText('Cross-browser performance test');
        
        await page.waitForTimeout(3000);
        
        const stats = await avatarPage.getPerformanceStats();
        const memory = await avatarPage.monitorMemoryUsage();
        
        console.log(`${browserConfig.name}: FPS=${stats.fps}, Memory=${Math.round(memory.heapUsed / 1024 / 1024)}MB`);
        
        // Browser-specific performance expectations
        const expectedMinFPS = browserConfig.isMobile ? 15 : 20;
        const expectedMaxMemory = browserConfig.isMobile ? 150 * 1024 * 1024 : 200 * 1024 * 1024;
        
        expect(stats.fps).toBeGreaterThan(expectedMinFPS);
        expect(memory.heapUsed).toBeLessThan(expectedMaxMemory);
        
        // Test WebGL performance if supported
        if (browserConfig.expectedSupport.webgl) {
          // Switch to 3D mode if available
          const has3D = await page.locator('ng-ui-avatar-3d').isVisible();
          if (has3D) {
            await avatarPage.switchRenderMode('3d');
            await page.waitForTimeout(2000);
            
            const stats3D = await avatarPage.getPerformanceStats();
            expect(stats3D.fps).toBeGreaterThan(expectedMinFPS * 0.7); // 3D can be slower
          }
        }
      });
    });
  });

  test.describe('Performance Regression Detection', () => {
    test('should maintain performance benchmarks', async ({ page }) => {
      await avatarPage.goto('/avatar-performance-demo');
      
      // Baseline performance benchmarks (these would be updated as improvements are made)
      const baselines = {
        initTime: 5000,      // 5 seconds max initialization
        minFPS: 25,          // Minimum 25 FPS
        maxRenderTime: 40,   // Maximum 40ms render time
        maxMemoryUsage: 150 * 1024 * 1024, // Maximum 150MB memory usage
        expressionChangeTime: 1000, // Maximum 1 second for expression change
        gestureStartTime: 500       // Maximum 500ms for gesture to start
      };
      
      // Test initialization time
      const initStart = Date.now();
      const config = AvatarTestDataGenerator.getDefaultConfig();
      await avatarPage.init2DAvatar(config);
      const initTime = Date.now() - initStart;
      
      expect(initTime).toBeLessThan(baselines.initTime);
      console.log(`✓ Initialization: ${initTime}ms (baseline: ${baselines.initTime}ms)`);
      
      // Test runtime performance
      await page.click('[data-testid="performance-toggle"]');
      await page.waitForTimeout(2000);
      
      const runtimeStats = await avatarPage.getPerformanceStats();
      expect(runtimeStats.fps).toBeGreaterThan(baselines.minFPS);
      expect(runtimeStats.renderTime).toBeLessThan(baselines.maxRenderTime);
      console.log(`✓ Runtime FPS: ${runtimeStats.fps} (baseline: >${baselines.minFPS})`);
      console.log(`✓ Render time: ${runtimeStats.renderTime}ms (baseline: <${baselines.maxRenderTime}ms)`);
      
      // Test memory usage
      const memory = await avatarPage.monitorMemoryUsage();
      expect(memory.heapUsed).toBeLessThan(baselines.maxMemoryUsage);
      console.log(`✓ Memory usage: ${Math.round(memory.heapUsed / 1024 / 1024)}MB (baseline: <${Math.round(baselines.maxMemoryUsage / 1024 / 1024)}MB)`);
      
      // Test expression change performance
      const expressionStart = Date.now();
      await avatarPage.changeExpression('happy');
      await avatarPage.waitForIdle();
      const expressionTime = Date.now() - expressionStart;
      
      expect(expressionTime).toBeLessThan(baselines.expressionChangeTime);
      console.log(`✓ Expression change: ${expressionTime}ms (baseline: <${baselines.expressionChangeTime}ms)`);
      
      // Test gesture start performance
      const gestureStart = Date.now();
      await avatarPage.performGesture('wave');
      
      // Wait for gesture to actually start
      await page.waitForFunction(() => {
        const avatar = document.querySelector('.avatar-container');
        return avatar ? avatar.classList.contains('gesture-playing') : false;
      }, { timeout: 5000 });
      
      const gestureStartTime = Date.now() - gestureStart;
      expect(gestureStartTime).toBeLessThan(baselines.gestureStartTime);
      console.log(`✓ Gesture start: ${gestureStartTime}ms (baseline: <${baselines.gestureStartTime}ms)`);
      
      console.log('All performance benchmarks passed!');
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up any remaining avatar instances
    await page.evaluate(() => {
      const avatars = document.querySelectorAll('[class*="avatar"]');
      avatars.forEach(avatar => {
        if ((avatar as any).ngOnDestroy) {
          (avatar as any).ngOnDestroy();
        }
      });
    });
  });
});

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create e2e/avatar/ directory structure with test files", "status": "completed", "activeForm": "Creating e2e/avatar/ directory structure"}, {"content": "Create test utilities including page object model, data generators, and WebSocket mock", "status": "completed", "activeForm": "Creating test utilities and page object models"}, {"content": "Create basic avatar rendering tests (basic-avatar.spec.ts)", "status": "completed", "activeForm": "Creating basic avatar rendering tests"}, {"content": "Create 2D avatar functionality tests (2d-avatar.spec.ts)", "status": "completed", "activeForm": "Creating 2D avatar functionality tests"}, {"content": "Create 3D avatar functionality tests (3d-avatar.spec.ts)", "status": "completed", "activeForm": "Creating 3D avatar functionality tests"}, {"content": "Create TTS and lip sync tests (lip-sync.spec.ts)", "status": "completed", "activeForm": "Creating TTS and lip sync tests"}, {"content": "Create customization tests (customization.spec.ts)", "status": "completed", "activeForm": "Creating customization tests"}, {"content": "Create WebSocket streaming tests (streaming.spec.ts)", "status": "completed", "activeForm": "Creating WebSocket streaming tests"}, {"content": "Create gesture animation tests (gestures.spec.ts)", "status": "completed", "activeForm": "Creating gesture animation tests"}, {"content": "Create performance benchmark tests (performance.spec.ts)", "status": "completed", "activeForm": "Creating performance benchmark tests"}]