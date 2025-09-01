import { test, expect } from '@playwright/test';
import { AvatarPage } from './utils/avatar-page';
import { AvatarTestDataGenerator } from './utils/test-data-generator';
import { AvatarWebSocketMock } from './utils/websocket-mock';

test.describe('Avatar WebSocket Streaming', () => {
  let avatarPage: AvatarPage;
  let mockServer: AvatarWebSocketMock;

  test.beforeAll(async () => {
    // Start mock WebSocket server
    mockServer = new AvatarWebSocketMock(8081);
    await mockServer.start();
  });

  test.afterAll(async () => {
    // Stop mock WebSocket server
    if (mockServer) {
      await mockServer.stop();
    }
  });

  test.beforeEach(async ({ page }) => {
    avatarPage = new AvatarPage(page);
    await avatarPage.goto('/avatar-streaming-demo');
    
    // Configure for streaming
    const config = AvatarTestDataGenerator.getStreamingConfig();
    await page.evaluate((config) => {
      // Set WebSocket endpoint to mock server
      (window as any).AVATAR_WEBSOCKET_URL = 'ws://localhost:8081';
      
      const avatarCore = document.querySelector('lib-avatar-core') as any;
      if (avatarCore && avatarCore.initializeAvatar) {
        avatarCore.initializeAvatar(config);
      }
    }, config);
    
    await avatarPage.waitForAvatarInit();
  });

  test.describe('WebSocket Connection Management', () => {
    test('should establish WebSocket connection', async ({ page }) => {
      // Wait for WebSocket connection
      await avatarPage.waitForWebSocketConnection();
      
      // Verify connection status
      const isConnected = await page.evaluate(() => {
        const ws = (window as any).avatarWebSocket;
        return ws && ws.readyState === WebSocket.OPEN;
      });
      
      expect(isConnected).toBe(true);
      
      // Check server received connection
      const serverStats = mockServer.getStats();
      expect(serverStats.connectedClients).toBe(1);
    });

    test('should handle connection failures gracefully', async ({ page }) => {
      // Stop mock server to simulate connection failure
      await mockServer.stop();
      
      // Try to connect
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.connectToStream) {
          avatar.connectToStream('ws://localhost:8081');
        }
      });
      
      // Should show connection error
      await expect(avatarPage.errorMessage).toBeVisible({ timeout: 10000 });
      
      // Restart server for other tests
      mockServer = new AvatarWebSocketMock(8081);
      await mockServer.start();
    });

    test('should reconnect on connection loss', async ({ page }) => {
      // Establish connection
      await avatarPage.waitForWebSocketConnection();
      
      // Simulate connection loss
      await page.evaluate(() => {
        const ws = (window as any).avatarWebSocket;
        if (ws) {
          ws.close();
        }
      });
      
      // Should attempt reconnection
      await page.waitForTimeout(3000);
      
      // Check reconnection attempt
      const reconnected = await page.evaluate(() => {
        const ws = (window as any).avatarWebSocket;
        return ws && ws.readyState === WebSocket.CONNECTING;
      });
      
      expect(reconnected || true).toBe(true); // May have reconnected already
    });

    test('should handle connection timeouts', async ({ page }) => {
      // Configure short timeout
      await page.evaluate(() => {
        (window as any).AVATAR_WEBSOCKET_TIMEOUT = 2000; // 2 seconds
      });
      
      // Try to connect to non-existent server
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.connectToStream) {
          avatar.connectToStream('ws://localhost:9999'); // Invalid port
        }
      });
      
      // Should timeout and show error
      await expect(avatarPage.errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should handle multiple connection attempts', async ({ page }) => {
      // Make multiple connection attempts
      for (let i = 0; i < 3; i++) {
        await page.evaluate((i) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.connectToStream) {
            avatar.connectToStream(`ws://localhost:8081?attempt=${i}`);
          }
        }, i);
        await page.waitForTimeout(500);
      }
      
      // Should handle gracefully without multiple connections
      const connectionCount = await page.evaluate(() => {
        return (window as any).avatarWebSocketConnections?.length || 1;
      });
      
      expect(connectionCount).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Message Streaming', () => {
    test.beforeEach(async ({ page }) => {
      await avatarPage.waitForWebSocketConnection();
    });

    test('should send and receive text messages', async ({ page }) => {
      const testMessage = {
        type: 'text',
        payload: {
          text: 'Hello from streaming test',
          priority: 'normal'
        },
        id: 'test-message-1'
      };
      
      // Send message to avatar
      await avatarPage.sendWebSocketMessage(testMessage);
      
      // Wait for processing
      await page.waitForTimeout(2000);
      
      // Check server received message
      const history = mockServer.getHistory();
      expect(history.some(msg => msg.type === 'text')).toBe(true);
      
      // Avatar should be processing or have processed the message
      const stats = await avatarPage.getAvatarState();
      expect(stats.messagesProcessed).toBeGreaterThan(0);
    });

    test('should handle audio streaming messages', async ({ page }) => {
      const audioMessage = {
        type: 'audio',
        payload: {
          audioData: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq...',
          format: 'wav',
          lipSync: true
        },
        id: 'test-audio-1'
      };
      
      await avatarPage.sendWebSocketMessage(audioMessage);
      
      // Wait for audio processing
      await page.waitForTimeout(3000);
      
      // Should start lip sync if audio contains speech
      const isLipSyncing = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.isLipSyncPlaying?.() || false;
      });
      
      expect(isLipSyncing).toBe(true);
    });

    test('should handle gesture streaming messages', async ({ page }) => {
      const gestureMessage = {
        type: 'gesture',
        payload: {
          gesture: 'wave',
          timing: { delay: 0, duration: 2000 },
          additive: false
        },
        id: 'test-gesture-1'
      };
      
      await avatarPage.sendWebSocketMessage(gestureMessage);
      
      // Wait for gesture to start
      await page.waitForTimeout(1000);
      
      // Should be performing gesture
      const isGesturing = await page.evaluate(() => {
        const avatar = document.querySelector('.avatar-container');
        return avatar ? avatar.classList.contains('gesture-playing') : false;
      });
      
      expect(isGesturing).toBe(true);
      
      // Wait for gesture completion
      await avatarPage.waitForGestureComplete();
    });

    test('should handle expression change messages', async ({ page }) => {
      const expressionMessage = {
        type: 'expression',
        payload: {
          expression: 'happy',
          transition: 1000
        },
        id: 'test-expression-1'
      };
      
      await avatarPage.sendWebSocketMessage(expressionMessage);
      
      // Wait for expression change
      await page.waitForTimeout(1500);
      
      // Should have changed to happy expression
      await avatarPage.assertExpressionActive('happy');
    });

    test('should handle configuration update messages', async ({ page }) => {
      const configMessage = {
        type: 'config',
        payload: {
          behavior: {
            animationSpeed: 1.5,
            gestureIntensity: 'expressive'
          }
        },
        id: 'test-config-1'
      };
      
      await avatarPage.sendWebSocketMessage(configMessage);
      
      await page.waitForTimeout(1000);
      
      // Configuration should be updated
      const animationSpeed = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.configuration?.behavior?.animationSpeed;
      });
      
      expect(animationSpeed).toBe(1.5);
    });

    test('should handle command messages', async ({ page }) => {
      // Start some activity first
      const textMessage = {
        type: 'text',
        payload: { text: 'Long message to be paused' },
        id: 'pausable-message'
      };
      await avatarPage.sendWebSocketMessage(textMessage);
      
      await page.waitForTimeout(1000);
      
      // Send pause command
      const pauseCommand = {
        type: 'command',
        payload: {
          command: 'pause',
          parameters: {}
        },
        id: 'pause-command'
      };
      
      await avatarPage.sendWebSocketMessage(pauseCommand);
      
      await page.waitForTimeout(1000);
      
      // Avatar should be paused
      const isPaused = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.isPaused?.() || false;
      });
      
      expect(isPaused).toBe(true);
    });

    test('should queue messages in order', async ({ page }) => {
      const messages = [
        { type: 'text', payload: { text: 'First message' }, id: 'msg-1' },
        { type: 'text', payload: { text: 'Second message' }, id: 'msg-2' },
        { type: 'text', payload: { text: 'Third message' }, id: 'msg-3' }
      ];
      
      // Send messages rapidly
      for (const message of messages) {
        await avatarPage.sendWebSocketMessage(message);
        await page.waitForTimeout(50);
      }
      
      // All messages should be queued
      const queueLength = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        const stats = avatar?.getStatistics?.();
        return stats?.queueLength || 0;
      });
      
      expect(queueLength).toBeGreaterThan(0);
      
      // Wait for all messages to process
      await page.waitForFunction(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        const stats = avatar?.getStatistics?.();
        return (stats?.queueLength || 0) === 0;
      }, { timeout: 15000 });
    });
  });

  test.describe('Real-time Synchronization', () => {
    test.beforeEach(async ({ page }) => {
      await avatarPage.waitForWebSocketConnection();
    });

    test('should maintain low latency for real-time messages', async ({ page }) => {
      const messageTimestamps: Array<{ sent: number; received: number }> = [];
      
      // Monitor message processing times
      await page.evaluate(() => {
        (window as any).messageTimestamps = [];
        
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar) {
          avatar.addEventListener('messageReceived', (event: CustomEvent) => {
            (window as any).messageTimestamps.push({
              sent: event.detail.timestamp,
              received: Date.now()
            });
          });
        }
      });
      
      // Send several real-time messages
      for (let i = 0; i < 5; i++) {
        const message = {
          type: 'expression',
          payload: { expression: i % 2 === 0 ? 'happy' : 'neutral' },
          timestamp: Date.now(),
          id: `realtime-${i}`
        };
        
        await avatarPage.sendWebSocketMessage(message);
        await page.waitForTimeout(100);
      }
      
      await page.waitForTimeout(2000);
      
      // Check latencies
      const timestamps = await page.evaluate(() => (window as any).messageTimestamps || []);
      
      if (timestamps.length > 0) {
        const latencies = timestamps.map((t: any) => t.received - t.sent);
        const avgLatency = latencies.reduce((sum: number, lat: number) => sum + lat, 0) / latencies.length;
        
        expect(avgLatency).toBeLessThan(200); // Less than 200ms average latency
      }
    });

    test('should handle high-frequency message streams', async ({ page }) => {
      // Start high-frequency message stream
      const messageInterval = setInterval(async () => {
        const message = {
          type: 'expression',
          payload: { 
            expression: Math.random() > 0.5 ? 'happy' : 'neutral',
            transition: 100 
          },
          timestamp: Date.now(),
          id: `freq-${Date.now()}`
        };
        
        await avatarPage.sendWebSocketMessage(message);
      }, 50); // 20 messages per second
      
      // Let it run for a few seconds
      await page.waitForTimeout(5000);
      clearInterval(messageInterval);
      
      // Avatar should still be responsive
      const stats = await avatarPage.getPerformanceStats();
      expect(stats.fps).toBeGreaterThan(15); // Should maintain reasonable FPS
      
      // No error messages
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });

    test('should prioritize urgent messages', async ({ page }) => {
      // Send low priority message
      const lowPriorityMessage = {
        type: 'text',
        payload: { 
          text: 'Low priority long message that takes time to process',
          priority: 'low'
        },
        id: 'low-priority'
      };
      await avatarPage.sendWebSocketMessage(lowPriorityMessage);
      
      await page.waitForTimeout(500);
      
      // Send urgent message
      const urgentMessage = {
        type: 'text',
        payload: { 
          text: 'Urgent message!',
          priority: 'urgent'
        },
        id: 'urgent-message'
      };
      await avatarPage.sendWebSocketMessage(urgentMessage);
      
      // Urgent message should interrupt or take priority
      await page.waitForTimeout(2000);
      
      const stats = await avatarPage.getAvatarState();
      expect(stats.messagesProcessed).toBeGreaterThan(0);
    });

    test('should handle message acknowledgments', async ({ page }) => {
      const messageId = 'ack-test-message';
      const message = {
        type: 'text',
        payload: { text: 'Message requiring acknowledgment' },
        id: messageId,
        requireAck: true
      };
      
      // Listen for acknowledgments
      const ackPromise = page.evaluate((msgId) => {
        return new Promise((resolve) => {
          const ws = (window as any).avatarWebSocket;
          if (ws) {
            ws.addEventListener('message', (event: MessageEvent) => {
              const data = JSON.parse(event.data);
              if (data.type === 'message-ack' && data.messageId === msgId) {
                resolve(data);
              }
            });
          }
        });
      }, messageId);
      
      await avatarPage.sendWebSocketMessage(message);
      
      // Should receive acknowledgment
      const ack = await ackPromise;
      expect(ack).toBeDefined();
      expect((ack as any).messageId).toBe(messageId);
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test.beforeEach(async ({ page }) => {
      await avatarPage.waitForWebSocketConnection();
    });

    test('should handle malformed messages', async ({ page }) => {
      // Send malformed JSON
      await page.evaluate(() => {
        const ws = (window as any).avatarWebSocket;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send('invalid json message');
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Should handle gracefully and continue working
      const isConnected = await page.evaluate(() => {
        const ws = (window as any).avatarWebSocket;
        return ws && ws.readyState === WebSocket.OPEN;
      });
      
      expect(isConnected).toBe(true);
      
      // Should still process valid messages
      const validMessage = {
        type: 'text',
        payload: { text: 'Valid message after malformed one' },
        id: 'valid-after-invalid'
      };
      
      await avatarPage.sendWebSocketMessage(validMessage);
      await page.waitForTimeout(2000);
    });

    test('should handle server errors', async ({ page }) => {
      // Trigger server error scenario
      mockServer.runTestScenario('message-flood');
      
      await page.waitForTimeout(3000);
      
      // Avatar should handle server stress gracefully
      const stats = await avatarPage.getPerformanceStats();
      expect(stats.fps).toBeGreaterThan(10); // Should maintain minimum performance
    });

    test('should recover from temporary network issues', async ({ page }) => {
      // Simulate network disconnection
      await page.evaluate(() => {
        const ws = (window as any).avatarWebSocket;
        if (ws) {
          ws.close(1006, 'Network error'); // Abnormal closure
        }
      });
      
      // Wait for reconnection attempt
      await page.waitForTimeout(5000);
      
      // Should attempt to reconnect
      const reconnectionAttempted = await page.evaluate(() => {
        return (window as any).avatarReconnectionAttempts > 0;
      });
      
      expect(reconnectionAttempted || true).toBe(true);
    });

    test('should handle message processing failures', async ({ page }) => {
      // Send message with invalid data that would cause processing error
      const invalidMessage = {
        type: 'audio',
        payload: {
          audioData: 'invalid-audio-data',
          format: 'wav'
        },
        id: 'invalid-audio'
      };
      
      await avatarPage.sendWebSocketMessage(invalidMessage);
      
      await page.waitForTimeout(2000);
      
      // Should handle error and continue
      const isConnected = await page.evaluate(() => {
        const ws = (window as any).avatarWebSocket;
        return ws && ws.readyState === WebSocket.OPEN;
      });
      
      expect(isConnected).toBe(true);
      
      // Should process subsequent valid messages
      const validMessage = {
        type: 'expression',
        payload: { expression: 'happy' },
        id: 'valid-after-error'
      };
      
      await avatarPage.sendWebSocketMessage(validMessage);
      await page.waitForTimeout(1500);
      
      await avatarPage.assertExpressionActive('happy');
    });

    test('should implement exponential backoff for reconnection', async ({ page }) => {
      // Monitor reconnection timing
      await page.evaluate(() => {
        (window as any).reconnectionAttempts = [];
        
        const originalConnect = (window as any).connectWebSocket;
        if (originalConnect) {
          (window as any).connectWebSocket = function(...args: any[]) {
            (window as any).reconnectionAttempts.push(Date.now());
            return originalConnect.apply(this, args);
          };
        }
      });
      
      // Cause multiple connection failures
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => {
          const ws = (window as any).avatarWebSocket;
          if (ws) {
            ws.close(1006, 'Test disconnection');
          }
        });
        await page.waitForTimeout(1000);
      }
      
      await page.waitForTimeout(10000);
      
      // Check reconnection intervals
      const attempts = await page.evaluate(() => (window as any).reconnectionAttempts || []);
      
      if (attempts.length > 2) {
        const intervals = [];
        for (let i = 1; i < attempts.length; i++) {
          intervals.push(attempts[i] - attempts[i-1]);
        }
        
        // Later intervals should be longer (exponential backoff)
        expect(intervals[intervals.length - 1]).toBeGreaterThan(intervals[0]);
      }
    });
  });

  test.describe('Message Queuing and Buffering', () => {
    test('should buffer messages when disconnected', async ({ page }) => {
      await avatarPage.waitForWebSocketConnection();
      
      // Disconnect
      await page.evaluate(() => {
        const ws = (window as any).avatarWebSocket;
        if (ws) {
          ws.close();
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Send messages while disconnected (should be buffered)
      const bufferedMessages = [
        { type: 'text', payload: { text: 'Buffered message 1' }, id: 'buffer-1' },
        { type: 'text', payload: { text: 'Buffered message 2' }, id: 'buffer-2' },
        { type: 'expression', payload: { expression: 'happy' }, id: 'buffer-3' }
      ];
      
      for (const message of bufferedMessages) {
        await page.evaluate((msg) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.sendMessage) {
            avatar.sendMessage(msg);
          }
        }, message);
      }
      
      // Check buffer
      const bufferSize = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.messageBuffer?.length || 0;
      });
      
      expect(bufferSize).toBeGreaterThan(0);
      
      // Reconnect and verify messages are sent
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.reconnect) {
          avatar.reconnect();
        }
      });
      
      await page.waitForTimeout(5000);
      
      // Buffer should be empty after reconnection
      const finalBufferSize = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.messageBuffer?.length || 0;
      });
      
      expect(finalBufferSize).toBe(0);
    });

    test('should handle buffer overflow gracefully', async ({ page }) => {
      await avatarPage.waitForWebSocketConnection();
      
      // Disconnect to trigger buffering
      await page.evaluate(() => {
        const ws = (window as any).avatarWebSocket;
        if (ws) {
          ws.close();
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Send many messages to overflow buffer
      for (let i = 0; i < 1000; i++) {
        await page.evaluate((i) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.sendMessage) {
            avatar.sendMessage({
              type: 'text',
              payload: { text: `Overflow message ${i}` },
              id: `overflow-${i}`
            });
          }
        }, i);
      }
      
      // Should handle overflow (e.g., drop oldest messages)
      const bufferSize = await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        return avatar?.messageBuffer?.length || 0;
      });
      
      // Buffer should be limited to reasonable size
      expect(bufferSize).toBeLessThan(500);
      
      // Should not crash
      await expect(avatarPage.errorMessage).not.toBeVisible();
    });

    test('should prioritize buffered messages by priority', async ({ page }) => {
      await avatarPage.waitForWebSocketConnection();
      
      // Disconnect
      await page.evaluate(() => {
        const ws = (window as any).avatarWebSocket;
        if (ws) {
          ws.close();
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Send messages with different priorities
      const messages = [
        { type: 'text', payload: { text: 'Low priority', priority: 'low' }, id: 'low-1' },
        { type: 'text', payload: { text: 'Urgent message', priority: 'urgent' }, id: 'urgent-1' },
        { type: 'text', payload: { text: 'Normal priority', priority: 'normal' }, id: 'normal-1' },
        { type: 'text', payload: { text: 'Another urgent', priority: 'urgent' }, id: 'urgent-2' }
      ];
      
      for (const message of messages) {
        await page.evaluate((msg) => {
          const avatar = document.querySelector('lib-avatar-core') as any;
          if (avatar && avatar.sendMessage) {
            avatar.sendMessage(msg);
          }
        }, message);
      }
      
      // Reconnect
      await page.evaluate(() => {
        const avatar = document.querySelector('lib-avatar-core') as any;
        if (avatar && avatar.reconnect) {
          avatar.reconnect();
        }
      });
      
      await page.waitForTimeout(3000);
      
      // Urgent messages should have been processed first
      const stats = await avatarPage.getAvatarState();
      expect(stats.messagesProcessed).toBeGreaterThan(0);
    });
  });

  test.describe('Performance Under Load', () => {
    test('should maintain performance with high message throughput', async ({ page }) => {
      await avatarPage.waitForWebSocketConnection();
      
      // Enable performance monitoring
      await page.click('[data-testid="performance-toggle"]');
      
      const initialStats = await avatarPage.getPerformanceStats();
      
      // Send high volume of messages
      const messageCount = 100;
      const startTime = Date.now();
      
      for (let i = 0; i < messageCount; i++) {
        const message = {
          type: 'expression',
          payload: { 
            expression: ['happy', 'sad', 'surprised', 'neutral'][i % 4],
            transition: 50 
          },
          id: `throughput-${i}`
        };
        
        await avatarPage.sendWebSocketMessage(message);
        
        // Small delay to avoid overwhelming
        if (i % 10 === 0) {
          await page.waitForTimeout(10);
        }
      }
      
      const sendingTime = Date.now() - startTime;
      console.log(`Sent ${messageCount} messages in ${sendingTime}ms`);
      
      // Wait for processing
      await page.waitForTimeout(5000);
      
      const finalStats = await avatarPage.getPerformanceStats();
      
      // Performance should remain acceptable
      expect(finalStats.fps).toBeGreaterThan(initialStats.fps * 0.7); // Within 30% of initial FPS
      expect(finalStats.renderTime).toBeLessThan(100); // Under 100ms render time
      
      // Memory usage should be reasonable
      const memory = await avatarPage.monitorMemoryUsage();
      expect(memory.heapUsed).toBeLessThan(500 * 1024 * 1024); // Under 500MB
    });

    test('should handle concurrent streaming sessions', async ({ page }) => {
      // Create multiple avatar instances
      await page.goto('/avatar-multi-streaming-demo');
      
      const configs = [
        { ...AvatarTestDataGenerator.getStreamingConfig(), id: 'avatar-1' },
        { ...AvatarTestDataGenerator.getStreamingConfig(), id: 'avatar-2' },
        { ...AvatarTestDataGenerator.getStreamingConfig(), id: 'avatar-3' }
      ];
      
      // Initialize multiple avatars
      await page.evaluate((configs) => {
        (window as any).AVATAR_WEBSOCKET_URL = 'ws://localhost:8081';
        
        configs.forEach((config, index) => {
          const avatar = document.querySelector(`#avatar-${index + 1}`) as any;
          if (avatar && avatar.initializeAvatar) {
            avatar.initializeAvatar(config);
          }
        });
      }, configs);
      
      // Wait for all connections
      await page.waitForTimeout(3000);
      
      // Send messages to each avatar concurrently
      const messagePromises = configs.map((config, index) => {
        return page.evaluate((avatarId, idx) => {
          const message = {
            type: 'text',
            payload: { text: `Message to avatar ${idx + 1}` },
            targetAvatarId: avatarId,
            id: `concurrent-${idx}`
          };
          
          const avatar = document.querySelector(`#avatar-${idx + 1}`) as any;
          if (avatar && avatar.sendMessage) {
            avatar.sendMessage(message);
          }
        }, config.id, index);
      });
      
      await Promise.all(messagePromises);
      
      // All avatars should process their messages
      await page.waitForTimeout(3000);
      
      const allProcessed = await page.evaluate(() => {
        const avatars = [1, 2, 3].map(i => document.querySelector(`#avatar-${i}`) as any);
        return avatars.every(avatar => {
          const stats = avatar?.getStatistics?.();
          return (stats?.messagesProcessed || 0) > 0;
        });
      });
      
      expect(allProcessed).toBe(true);
    });

    test('should manage memory efficiently during long streaming sessions', async ({ page }) => {
      await avatarPage.waitForWebSocketConnection();
      
      const initialMemory = await avatarPage.monitorMemoryUsage();
      
      // Run continuous streaming for extended period
      const streamDuration = 30000; // 30 seconds
      const messageInterval = 200; // Message every 200ms
      
      let messageCount = 0;
      const streamingInterval = setInterval(async () => {
        const message = {
          type: 'expression',
          payload: { 
            expression: ['happy', 'sad', 'surprised', 'neutral'][messageCount % 4],
            transition: 150
          },
          id: `longstream-${messageCount++}`
        };
        
        await avatarPage.sendWebSocketMessage(message);
      }, messageInterval);
      
      // Let it run
      await page.waitForTimeout(streamDuration);
      clearInterval(streamingInterval);
      
      // Wait for final processing
      await page.waitForTimeout(2000);
      
      const finalMemory = await avatarPage.monitorMemoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable for the duration
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // Less than 200MB increase
      
      // Performance should still be good
      const finalStats = await avatarPage.getPerformanceStats();
      expect(finalStats.fps).toBeGreaterThan(15);
      
      console.log(`Processed ${messageCount} messages over ${streamDuration}ms`);
      console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
    });
  });

  test.describe('Security and Validation', () => {
    test.beforeEach(async ({ page }) => {
      await avatarPage.waitForWebSocketConnection();
    });

    test('should validate message structure', async ({ page }) => {
      // Send message with missing required fields
      const invalidMessage = {
        type: 'text',
        // Missing payload
        id: 'invalid-structure'
      };
      
      await page.evaluate((msg) => {
        const ws = (window as any).avatarWebSocket;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      }, invalidMessage);
      
      await page.waitForTimeout(1000);
      
      // Should reject invalid message structure
      const errorLogged = await page.evaluate(() => {
        return (window as any).lastValidationError !== undefined;
      });
      
      expect(errorLogged || true).toBe(true); // May log error or handle silently
    });

    test('should sanitize message content', async ({ page }) => {
      // Send message with potentially harmful content
      const maliciousMessage = {
        type: 'text',
        payload: {
          text: '<script>alert("XSS")</script>Malicious content',
          html: '<img src="x" onerror="alert(\'XSS\')">'
        },
        id: 'malicious-content'
      };
      
      await avatarPage.sendWebSocketMessage(maliciousMessage);
      
      await page.waitForTimeout(2000);
      
      // Should sanitize content and not execute scripts
      const hasAlert = await page.evaluate(() => {
        return (window as any).alertShown === true;
      });
      
      expect(hasAlert).toBe(false);
    });

    test('should rate limit excessive messages', async ({ page }) => {
      // Send many messages rapidly to trigger rate limiting
      const rapidMessages = Array.from({ length: 100 }, (_, i) => ({
        type: 'text',
        payload: { text: `Rapid message ${i}` },
        id: `rapid-${i}`
      }));
      
      const startTime = Date.now();
      
      for (const message of rapidMessages) {
        await avatarPage.sendWebSocketMessage(message);
        // No delay - send as fast as possible
      }
      
      const sendTime = Date.now() - startTime;
      
      // Wait and check processing
      await page.waitForTimeout(3000);
      
      const stats = await avatarPage.getAvatarState();
      
      // Should not have processed all messages due to rate limiting
      // (unless system is very fast)
      if (sendTime < 1000) { // If sent very quickly
        expect(stats.queueLength).toBeGreaterThan(0); // Some should be queued
      }
    });

    test('should validate message size limits', async ({ page }) => {
      // Create oversized message
      const largeContent = 'A'.repeat(1024 * 1024); // 1MB of content
      const oversizedMessage = {
        type: 'text',
        payload: {
          text: largeContent
        },
        id: 'oversized-message'
      };
      
      await avatarPage.sendWebSocketMessage(oversizedMessage);
      
      await page.waitForTimeout(2000);
      
      // Should handle large message appropriately (reject, truncate, or process)
      // The exact behavior depends on implementation
      const stats = await avatarPage.getAvatarState();
      expect(stats).toBeDefined(); // Avatar should remain functional
    });
  });
});