import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

/**
 * Mock WebSocket server for avatar streaming tests
 */
export class AvatarWebSocketMock {
  private server: WebSocketServer;
  private httpServer: Server;
  private clients: Set<WebSocket> = new Set();
  private messageHistory: any[] = [];
  private isRunning = false;
  private port: number;

  constructor(port = 8080) {
    this.port = port;
    this.httpServer = new Server();
    this.server = new WebSocketServer({ server: this.httpServer });
    this.setupEventHandlers();
  }

  /**
   * Start the mock WebSocket server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.port, (err?: Error) => {
        if (err) {
          reject(err);
        } else {
          this.isRunning = true;
          console.log(`Avatar WebSocket Mock Server started on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  /**
   * Stop the mock WebSocket server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      // Close all client connections
      this.clients.forEach(client => {
        client.close();
      });
      this.clients.clear();

      // Close server
      this.server.close(() => {
        this.httpServer.close(() => {
          this.isRunning = false;
          console.log('Avatar WebSocket Mock Server stopped');
          resolve();
        });
      });
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.server.on('connection', (ws: WebSocket, request) => {
      console.log(`Client connected from ${request.socket.remoteAddress}`);
      this.clients.add(ws);

      // Send welcome message
      this.sendToClient(ws, {
        type: 'welcome',
        message: 'Connected to Avatar WebSocket Mock Server',
        timestamp: Date.now()
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(ws, message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          this.sendError(ws, 'Invalid JSON message');
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  /**
   * Handle incoming message from client
   */
  private handleClientMessage(ws: WebSocket, message: any): void {
    console.log('Received message:', message);
    this.messageHistory.push({
      ...message,
      receivedAt: Date.now(),
      clientId: this.getClientId(ws)
    });

    // Simulate processing delay
    setTimeout(() => {
      this.processMessage(ws, message);
    }, this.getRandomDelay(50, 200));
  }

  /**
   * Process different types of messages
   */
  private processMessage(ws: WebSocket, message: any): void {
    switch (message.type) {
      case 'text':
        this.handleTextMessage(ws, message);
        break;
      
      case 'audio':
        this.handleAudioMessage(ws, message);
        break;
      
      case 'gesture':
        this.handleGestureMessage(ws, message);
        break;
      
      case 'expression':
        this.handleExpressionMessage(ws, message);
        break;
      
      case 'config':
        this.handleConfigMessage(ws, message);
        break;
      
      case 'command':
        this.handleCommandMessage(ws, message);
        break;
      
      case 'ping':
        this.sendToClient(ws, {
          type: 'pong',
          timestamp: Date.now(),
          originalTimestamp: message.timestamp
        });
        break;
      
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle text-to-speech message
   */
  private handleTextMessage(ws: WebSocket, message: any): void {
    const { text, voice, priority = 'normal' } = message.payload;
    
    // Simulate TTS processing
    const estimatedDuration = text.length * 100; // ~100ms per character
    
    this.sendToClient(ws, {
      type: 'text-processing',
      payload: {
        messageId: message.id || this.generateMessageId(),
        status: 'processing',
        estimatedDuration
      },
      timestamp: Date.now()
    });

    // Simulate TTS completion
    setTimeout(() => {
      this.sendToClient(ws, {
        type: 'text-completed',
        payload: {
          messageId: message.id || this.generateMessageId(),
          status: 'completed',
          actualDuration: estimatedDuration + this.getRandomDelay(-200, 200),
          audioData: this.generateMockAudioData(text),
          lipSyncData: this.generateMockLipSyncData(text)
        },
        timestamp: Date.now()
      });
    }, estimatedDuration);
  }

  /**
   * Handle audio playback message
   */
  private handleAudioMessage(ws: WebSocket, message: any): void {
    const { audioData, format, lipSync = false } = message.payload;
    
    this.sendToClient(ws, {
      type: 'audio-processing',
      payload: {
        messageId: message.id || this.generateMessageId(),
        status: 'processing',
        format
      },
      timestamp: Date.now()
    });

    // Simulate audio processing
    setTimeout(() => {
      const response: any = {
        type: 'audio-ready',
        payload: {
          messageId: message.id || this.generateMessageId(),
          status: 'ready',
          duration: this.estimateAudioDuration(audioData, format)
        },
        timestamp: Date.now()
      };

      if (lipSync) {
        response.payload.lipSyncData = this.generateMockLipSyncData('audio content');
      }

      this.sendToClient(ws, response);
    }, this.getRandomDelay(200, 800));
  }

  /**
   * Handle gesture message
   */
  private handleGestureMessage(ws: WebSocket, message: any): void {
    const { gesture, timing = {}, additive = false } = message.payload;
    
    this.sendToClient(ws, {
      type: 'gesture-started',
      payload: {
        messageId: message.id || this.generateMessageId(),
        gesture,
        timing,
        additive
      },
      timestamp: Date.now()
    });

    // Simulate gesture completion
    const duration = timing.duration || this.getGestureDuration(gesture);
    setTimeout(() => {
      this.sendToClient(ws, {
        type: 'gesture-completed',
        payload: {
          messageId: message.id || this.generateMessageId(),
          gesture,
          actualDuration: duration
        },
        timestamp: Date.now()
      });
    }, duration);
  }

  /**
   * Handle expression change message
   */
  private handleExpressionMessage(ws: WebSocket, message: any): void {
    const { expression, transition = 500 } = message.payload;
    
    this.sendToClient(ws, {
      type: 'expression-changing',
      payload: {
        messageId: message.id || this.generateMessageId(),
        from: 'neutral',
        to: expression,
        duration: transition
      },
      timestamp: Date.now()
    });

    setTimeout(() => {
      this.sendToClient(ws, {
        type: 'expression-changed',
        payload: {
          messageId: message.id || this.generateMessageId(),
          currentExpression: expression
        },
        timestamp: Date.now()
      });
    }, transition);
  }

  /**
   * Handle configuration update message
   */
  private handleConfigMessage(ws: WebSocket, message: any): void {
    const updates = message.payload;
    
    this.sendToClient(ws, {
      type: 'config-updated',
      payload: {
        messageId: message.id || this.generateMessageId(),
        updates,
        status: 'applied'
      },
      timestamp: Date.now()
    });
  }

  /**
   * Handle command message
   */
  private handleCommandMessage(ws: WebSocket, message: any): void {
    const { command, parameters = {} } = message.payload;
    
    let response = {
      type: 'command-executed',
      payload: {
        messageId: message.id || this.generateMessageId(),
        command,
        status: 'executed',
        result: null as any
      },
      timestamp: Date.now()
    };

    switch (command) {
      case 'pause':
        response.payload.result = { paused: true };
        break;
      case 'resume':
        response.payload.result = { paused: false };
        break;
      case 'stop':
        response.payload.result = { stopped: true };
        break;
      case 'reset':
        response.payload.result = { reset: true };
        break;
      case 'clear-queue':
        response.payload.result = { queueCleared: true };
        break;
      default:
        response.payload.status = 'error';
        response.payload.result = { error: `Unknown command: ${command}` };
    }

    this.sendToClient(ws, response);
  }

  /**
   * Send message to specific client
   */
  private sendToClient(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send error message to client
   */
  private sendError(ws: WebSocket, error: string): void {
    this.sendToClient(ws, {
      type: 'error',
      message: error,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: any): void {
    this.clients.forEach(client => {
      this.sendToClient(client, message);
    });
  }

  /**
   * Simulate streaming avatar updates
   */
  startAvatarUpdates(interval = 16): NodeJS.Timeout {
    return setInterval(() => {
      if (this.clients.size > 0) {
        this.broadcast({
          type: 'avatar-update',
          payload: {
            frameNumber: Math.floor(Date.now() / interval),
            timestamp: Date.now(),
            data: {
              expression: this.getCurrentExpression(),
              gesture: this.getCurrentGesture(),
              lipSync: this.getCurrentLipSyncState()
            }
          },
          timestamp: Date.now()
        });
      }
    }, interval);
  }

  /**
   * Simulate connection issues for testing
   */
  simulateConnectionIssues(): void {
    setTimeout(() => {
      // Randomly disconnect clients
      Array.from(this.clients).forEach(client => {
        if (Math.random() < 0.1) { // 10% chance
          client.close();
        }
      });
    }, this.getRandomDelay(5000, 15000));
  }

  /**
   * Generate test scenarios
   */
  runTestScenario(scenarioName: string): void {
    const scenarios = {
      'message-flood': () => {
        // Send many messages quickly
        for (let i = 0; i < 100; i++) {
          setTimeout(() => {
            this.broadcast({
              type: 'test-message',
              payload: { messageNumber: i },
              timestamp: Date.now()
            });
          }, i * 10);
        }
      },
      
      'gradual-reconnect': () => {
        // Simulate gradual client reconnection
        this.clients.forEach(client => client.close());
        setTimeout(() => {
          console.log('Simulating client reconnection...');
        }, 5000);
      },
      
      'performance-stress': () => {
        // High-frequency updates
        const interval = setInterval(() => {
          this.broadcast({
            type: 'performance-update',
            payload: {
              timestamp: Date.now(),
              data: new Array(1000).fill(0).map((_, i) => ({ id: i, value: Math.random() }))
            },
            timestamp: Date.now()
          });
        }, 1);
        
        setTimeout(() => clearInterval(interval), 10000);
      }
    };

    const scenario = scenarios[scenarioName as keyof typeof scenarios];
    if (scenario) {
      scenario();
    } else {
      console.error(`Unknown test scenario: ${scenarioName}`);
    }
  }

  /**
   * Get server statistics
   */
  getStats(): {
    isRunning: boolean;
    connectedClients: number;
    messageHistory: number;
    uptime: number;
  } {
    return {
      isRunning: this.isRunning,
      connectedClients: this.clients.size,
      messageHistory: this.messageHistory.length,
      uptime: this.isRunning ? Date.now() - this.messageHistory[0]?.receivedAt || 0 : 0
    };
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageHistory = [];
  }

  /**
   * Get message history
   */
  getHistory(): any[] {
    return [...this.messageHistory];
  }

  // Helper methods
  private getClientId(ws: WebSocket): string {
    return `client-${Array.from(this.clients).indexOf(ws)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateMockAudioData(text: string): string {
    // Generate fake base64 audio data
    const length = text.length * 100; // Simulate audio data size
    return `data:audio/wav;base64,${Buffer.from('0'.repeat(length)).toString('base64')}`;
  }

  private generateMockLipSyncData(text: string): any[] {
    // Generate fake lip sync data
    return text.split('').map((char, index) => ({
      timestamp: index * 100,
      phoneme: this.charToPhoneme(char),
      amplitude: Math.random() * 0.8 + 0.2
    }));
  }

  private charToPhoneme(char: string): string {
    const phonemeMap: { [key: string]: string } = {
      'a': 'AH', 'e': 'EH', 'i': 'IH', 'o': 'OH', 'u': 'UH',
      'b': 'B', 'c': 'K', 'd': 'D', 'f': 'F', 'g': 'G',
      'h': 'HH', 'j': 'JH', 'k': 'K', 'l': 'L', 'm': 'M',
      'n': 'N', 'p': 'P', 'q': 'K', 'r': 'R', 's': 'S',
      't': 'T', 'v': 'V', 'w': 'W', 'x': 'KS', 'y': 'Y', 'z': 'Z'
    };
    return phonemeMap[char.toLowerCase()] || 'SIL';
  }

  private estimateAudioDuration(audioData: string, format: string): number {
    // Rough estimation based on data size
    const baseSize = audioData.length;
    const multiplier = format === 'mp3' ? 1 : format === 'wav' ? 0.5 : 0.7;
    return Math.floor(baseSize * multiplier / 1000) * 1000; // Round to seconds
  }

  private getGestureDuration(gesture: string): number {
    const durations: { [key: string]: number } = {
      'wave': 2000,
      'nod': 1000,
      'shake-head': 1500,
      'shrug': 2500,
      'point': 1800,
      'thumbs-up': 1200,
      'clap': 3000,
      'thinking-pose': 4000
    };
    return durations[gesture] || 2000;
  }

  private getCurrentExpression(): string {
    const expressions = ['neutral', 'happy', 'sad', 'surprised', 'thinking'];
    return expressions[Math.floor(Date.now() / 5000) % expressions.length];
  }

  private getCurrentGesture(): string | null {
    const gestures = [null, 'nod', null, 'wave', null];
    return gestures[Math.floor(Date.now() / 3000) % gestures.length];
  }

  private getCurrentLipSyncState(): { isActive: boolean; phoneme?: string; amplitude?: number } {
    const isActive = Math.floor(Date.now() / 1000) % 10 < 3; // Active 30% of time
    return {
      isActive,
      ...(isActive && {
        phoneme: ['AH', 'EH', 'OH', 'UH'][Math.floor(Date.now() / 200) % 4],
        amplitude: 0.3 + Math.random() * 0.5
      })
    };
  }
}