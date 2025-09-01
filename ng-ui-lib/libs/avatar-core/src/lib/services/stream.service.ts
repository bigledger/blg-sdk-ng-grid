import { Injectable, signal, computed, effect, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, BehaviorSubject, interval, fromEvent } from 'rxjs';
import { 
  filter, 
  debounceTime, 
  retry, 
  retryWhen, 
  delay, 
  take, 
  switchMap,
  catchError
} from 'rxjs/operators';
import { of } from 'rxjs';

import { StreamConfig, WebSocketConfig, AudioStreamConfig } from '../interfaces/stream-config.interface';
import { AvatarStateService } from './avatar-state.service';

/**
 * WebSocket connection states
 */
type WebSocketState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

/**
 * Stream session information
 */
interface StreamSession {
  id: string;
  avatarId: string;
  websocket: WebSocket | null;
  state: WebSocketState;
  lastError?: string;
  reconnectAttempts: number;
  startTime: number;
  lastActivity: number;
  config: StreamConfig;
  audioBuffer: ArrayBuffer[];
  textBuffer: string[];
}

/**
 * Streaming service for real-time avatar communication.
 * Manages WebSocket connections, audio streaming, and text streaming.
 */
@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private destroyRef = inject(DestroyRef);
  private avatarStateService = inject(AvatarStateService);

  // Core signals
  private _sessions = signal<Map<string, StreamSession>>(new Map());
  private _activeSessionId = signal<string | null>(null);
  private _globalStreamConfig = signal<StreamConfig | null>(null);

  // Connection state
  private _connectionStates = signal<Map<string, WebSocketState>>(new Map());
  private _connectionQuality = signal<Map<string, number>>(new Map());
  private _latencyMeasurements = signal<Map<string, number[]>>(new Map());

  // Event subjects
  private sessionCreated$ = new Subject<{ sessionId: string; avatarId: string }>();
  private sessionClosed$ = new Subject<{ sessionId: string; reason?: string }>();
  private connectionStateChanged$ = new Subject<{ sessionId: string; state: WebSocketState; error?: string }>();
  private audioChunkReceived$ = new Subject<{ sessionId: string; chunk: ArrayBuffer; metadata?: any }>();
  private textChunkReceived$ = new Subject<{ sessionId: string; text: string; isComplete: boolean }>();
  private streamError$ = new Subject<{ sessionId: string; error: any }>();

  // Computed signals
  readonly sessions = this._sessions.asReadonly();
  readonly activeSessionId = this._activeSessionId.asReadonly();
  readonly globalStreamConfig = this._globalStreamConfig.asReadonly();

  readonly activeSession = computed(() => {
    const sessionId = this._activeSessionId();
    const sessions = this._sessions();
    return sessionId ? sessions.get(sessionId) || null : null;
  });

  readonly connectedSessions = computed(() => {
    return Array.from(this._sessions().values()).filter(
      session => session.state === 'connected'
    );
  });

  readonly isAnyConnected = computed(() => {
    return this.connectedSessions().length > 0;
  });

  readonly averageLatency = computed(() => {
    const latencies = Array.from(this._latencyMeasurements().values()).flat();
    return latencies.length > 0 
      ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length 
      : 0;
  });

  // Public observables
  readonly sessionCreated = this.sessionCreated$.asObservable();
  readonly sessionClosed = this.sessionClosed$.asObservable();
  readonly connectionStateChanged = this.connectionStateChanged$.asObservable();
  readonly audioChunkReceived = this.audioChunkReceived$.asObservable();
  readonly textChunkReceived = this.textChunkReceived$.asObservable();
  readonly streamError = this.streamError$.asObservable();

  constructor() {
    this.initializeMonitoring();
    this.setupErrorHandling();
  }

  /**
   * Set global stream configuration
   */
  setGlobalConfig(config: StreamConfig): void {
    this._globalStreamConfig.set(config);
  }

  /**
   * Create a new streaming session
   */
  createSession(avatarId: string, config?: Partial<StreamConfig>): string {
    const sessionId = this.generateSessionId();
    const globalConfig = this._globalStreamConfig();
    
    if (!globalConfig && !config) {
      throw new Error('No stream configuration available');
    }

    const sessionConfig = config ? { ...globalConfig, ...config } as StreamConfig : globalConfig!;

    const session: StreamSession = {
      id: sessionId,
      avatarId,
      websocket: null,
      state: 'disconnected',
      reconnectAttempts: 0,
      startTime: Date.now(),
      lastActivity: Date.now(),
      config: sessionConfig,
      audioBuffer: [],
      textBuffer: []
    };

    this._sessions.update(sessions => {
      const newSessions = new Map(sessions);
      newSessions.set(sessionId, session);
      return newSessions;
    });

    this._connectionStates.update(states => {
      const newStates = new Map(states);
      newStates.set(sessionId, 'disconnected');
      return newStates;
    });

    this._connectionQuality.update(quality => {
      const newQuality = new Map(quality);
      newQuality.set(sessionId, 1.0);
      return newQuality;
    });

    // Set as active if it's the first session
    if (this._activeSessionId() === null) {
      this._activeSessionId.set(sessionId);
    }

    this.sessionCreated$.next({ sessionId, avatarId });
    
    return sessionId;
  }

  /**
   * Connect a streaming session
   */
  async connectSession(sessionId: string): Promise<void> {
    const session = this._sessions().get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.state === 'connected' || session.state === 'connecting') {
      return; // Already connected or connecting
    }

    await this.establishWebSocketConnection(session);
  }

  /**
   * Disconnect a streaming session
   */
  disconnectSession(sessionId: string, reason?: string): void {
    const session = this._sessions().get(sessionId);
    
    if (!session) {
      return;
    }

    if (session.websocket) {
      session.websocket.close(1000, reason || 'Manual disconnect');
      session.websocket = null;
    }

    this.updateSessionState(sessionId, 'disconnected');
    this.sessionClosed$.next({ sessionId, reason });
  }

  /**
   * Close and remove a streaming session
   */
  closeSession(sessionId: string): void {
    this.disconnectSession(sessionId, 'Session closed');
    
    this._sessions.update(sessions => {
      const newSessions = new Map(sessions);
      newSessions.delete(sessionId);
      return newSessions;
    });

    this._connectionStates.update(states => {
      const newStates = new Map(states);
      newStates.delete(sessionId);
      return newStates;
    });

    this._connectionQuality.update(quality => {
      const newQuality = new Map(quality);
      newQuality.delete(sessionId);
      return newQuality;
    });

    this._latencyMeasurements.update(latencies => {
      const newLatencies = new Map(latencies);
      newLatencies.delete(sessionId);
      return newLatencies;
    });

    // Update active session if necessary
    if (this._activeSessionId() === sessionId) {
      const remainingSessions = Array.from(this._sessions().keys());
      this._activeSessionId.set(remainingSessions.length > 0 ? remainingSessions[0] : null);
    }

    // Update avatar state
    this.avatarStateService.updateConnectionState(this.getAvatarIdForSession(sessionId), {
      websocket: 'disconnected',
      audioStream: 'idle',
      textStream: 'idle'
    });
  }

  /**
   * Send text data through WebSocket
   */
  sendText(sessionId: string, text: string, metadata?: any): void {
    const session = this._sessions().get(sessionId);
    
    if (!session || !session.websocket || session.state !== 'connected') {
      throw new Error(`Session not connected: ${sessionId}`);
    }

    const message = {
      type: 'text',
      data: text,
      timestamp: Date.now(),
      metadata
    };

    try {
      session.websocket.send(JSON.stringify(message));
      this.updateSessionActivity(sessionId);
    } catch (error) {
      this.handleStreamError(sessionId, error);
    }
  }

  /**
   * Send audio data through WebSocket
   */
  sendAudio(sessionId: string, audioData: ArrayBuffer, metadata?: any): void {
    const session = this._sessions().get(sessionId);
    
    if (!session || !session.websocket || session.state !== 'connected') {
      throw new Error(`Session not connected: ${sessionId}`);
    }

    // Send audio as binary data with metadata header
    const metadataJson = JSON.stringify({ 
      type: 'audio', 
      timestamp: Date.now(), 
      ...metadata 
    });
    
    const metadataBuffer = new TextEncoder().encode(metadataJson);
    const metadataLength = new Uint32Array([metadataBuffer.length]);
    
    // Combine metadata length, metadata, and audio data
    const combinedBuffer = new ArrayBuffer(
      4 + metadataBuffer.length + audioData.byteLength
    );
    
    new Uint8Array(combinedBuffer, 0, 4).set(new Uint8Array(metadataLength.buffer));
    new Uint8Array(combinedBuffer, 4, metadataBuffer.length).set(metadataBuffer);
    new Uint8Array(combinedBuffer, 4 + metadataBuffer.length).set(new Uint8Array(audioData));

    try {
      session.websocket.send(combinedBuffer);
      this.updateSessionActivity(sessionId);
    } catch (error) {
      this.handleStreamError(sessionId, error);
    }
  }

  /**
   * Send command through WebSocket
   */
  sendCommand(sessionId: string, command: string, parameters?: any): void {
    const session = this._sessions().get(sessionId);
    
    if (!session || !session.websocket || session.state !== 'connected') {
      throw new Error(`Session not connected: ${sessionId}`);
    }

    const message = {
      type: 'command',
      command,
      parameters,
      timestamp: Date.now()
    };

    try {
      session.websocket.send(JSON.stringify(message));
      this.updateSessionActivity(sessionId);
    } catch (error) {
      this.handleStreamError(sessionId, error);
    }
  }

  /**
   * Get session information
   */
  getSessionInfo(sessionId: string): StreamSession | null {
    return this._sessions().get(sessionId) || null;
  }

  /**
   * Get connection quality for session
   */
  getConnectionQuality(sessionId: string): number {
    return this._connectionQuality().get(sessionId) || 0;
  }

  /**
   * Get average latency for session
   */
  getLatency(sessionId: string): number {
    const latencies = this._latencyMeasurements().get(sessionId) || [];
    return latencies.length > 0 
      ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length 
      : 0;
  }

  /**
   * Set active session
   */
  setActiveSession(sessionId: string): void {
    if (this._sessions().has(sessionId)) {
      this._activeSessionId.set(sessionId);
    }
  }

  /**
   * Establish WebSocket connection
   */
  private async establishWebSocketConnection(session: StreamSession): Promise<void> {
    this.updateSessionState(session.id, 'connecting');

    try {
      const wsConfig = session.config.websocket;
      const websocket = new WebSocket(wsConfig.url, wsConfig.protocols);

      // Configure WebSocket
      websocket.binaryType = 'arraybuffer';

      // Setup event handlers
      websocket.onopen = () => this.handleWebSocketOpen(session.id, websocket);
      websocket.onmessage = (event) => this.handleWebSocketMessage(session.id, event);
      websocket.onerror = (event) => this.handleWebSocketError(session.id, event);
      websocket.onclose = (event) => this.handleWebSocketClose(session.id, event);

      // Update session
      this._sessions.update(sessions => {
        const newSessions = new Map(sessions);
        const updatedSession = { ...newSessions.get(session.id)!, websocket };
        newSessions.set(session.id, updatedSession);
        return newSessions;
      });

      // Wait for connection or timeout
      await this.waitForConnection(websocket, session.config.websocket.timeout);

    } catch (error) {
      this.handleConnectionError(session.id, error);
      throw error;
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleWebSocketOpen(sessionId: string, websocket: WebSocket): void {
    this.updateSessionState(sessionId, 'connected');
    
    const avatarId = this.getAvatarIdForSession(sessionId);
    this.avatarStateService.updateConnectionState(avatarId, {
      websocket: 'connected',
      reconnectAttempts: 0
    });

    // Reset reconnect attempts
    this._sessions.update(sessions => {
      const newSessions = new Map(sessions);
      const session = newSessions.get(sessionId);
      if (session) {
        session.reconnectAttempts = 0;
        newSessions.set(sessionId, session);
      }
      return newSessions;
    });

    this.connectionStateChanged$.next({ 
      sessionId, 
      state: 'connected' 
    });

    // Start ping/pong for connection monitoring
    this.startPingPong(sessionId);
  }

  /**
   * Handle WebSocket message
   */
  private handleWebSocketMessage(sessionId: string, event: MessageEvent): void {
    this.updateSessionActivity(sessionId);

    try {
      if (event.data instanceof ArrayBuffer) {
        this.handleBinaryMessage(sessionId, event.data);
      } else if (typeof event.data === 'string') {
        this.handleTextMessage(sessionId, event.data);
      }
    } catch (error) {
      this.handleStreamError(sessionId, error);
    }
  }

  /**
   * Handle binary message (audio data)
   */
  private handleBinaryMessage(sessionId: string, data: ArrayBuffer): void {
    // Extract metadata and audio data
    const metadataLengthView = new Uint32Array(data, 0, 1);
    const metadataLength = metadataLengthView[0];
    
    const metadataBuffer = new Uint8Array(data, 4, metadataLength);
    const audioBuffer = data.slice(4 + metadataLength);
    
    const metadataJson = new TextDecoder().decode(metadataBuffer);
    const metadata = JSON.parse(metadataJson);

    if (metadata.type === 'audio') {
      this.audioChunkReceived$.next({ 
        sessionId, 
        chunk: audioBuffer, 
        metadata 
      });
      
      // Update avatar audio stream state
      const avatarId = this.getAvatarIdForSession(sessionId);
      this.avatarStateService.updateConnectionState(avatarId, {
        audioStream: 'streaming'
      });
    }
  }

  /**
   * Handle text message
   */
  private handleTextMessage(sessionId: string, data: string): void {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'text') {
        this.textChunkReceived$.next({
          sessionId,
          text: message.data,
          isComplete: message.isComplete || false
        });
        
        // Update avatar text stream state
        const avatarId = this.getAvatarIdForSession(sessionId);
        this.avatarStateService.updateConnectionState(avatarId, {
          textStream: message.isComplete ? 'complete' : 'streaming'
        });
        
      } else if (message.type === 'pong') {
        this.handlePongMessage(sessionId, message);
      } else if (message.type === 'error') {
        this.handleStreamError(sessionId, new Error(message.message));
      }
    } catch (error) {
      console.error('Failed to parse text message:', error);
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleWebSocketError(sessionId: string, event: Event): void {
    const error = `WebSocket error for session ${sessionId}`;
    console.error(error, event);
    
    this.updateSessionState(sessionId, 'error', error);
    this.handleStreamError(sessionId, new Error(error));
  }

  /**
   * Handle WebSocket close
   */
  private handleWebSocketClose(sessionId: string, event: CloseEvent): void {
    const session = this._sessions().get(sessionId);
    
    if (!session) return;

    if (event.code !== 1000 && session.config.websocket.autoReconnect) {
      // Attempt reconnection
      this.attemptReconnection(sessionId);
    } else {
      this.updateSessionState(sessionId, 'disconnected');
      
      const avatarId = this.getAvatarIdForSession(sessionId);
      this.avatarStateService.updateConnectionState(avatarId, {
        websocket: 'disconnected',
        audioStream: 'idle',
        textStream: 'idle'
      });
    }

    this.connectionStateChanged$.next({ 
      sessionId, 
      state: session.config.websocket.autoReconnect ? 'reconnecting' : 'disconnected'
    });
  }

  /**
   * Attempt to reconnect session
   */
  private async attemptReconnection(sessionId: string): Promise<void> {
    const session = this._sessions().get(sessionId);
    
    if (!session) return;

    if (session.reconnectAttempts >= session.config.websocket.maxReconnectAttempts) {
      this.updateSessionState(sessionId, 'error', 'Max reconnection attempts reached');
      return;
    }

    this.updateSessionState(sessionId, 'reconnecting');
    
    // Increment reconnect attempts
    this._sessions.update(sessions => {
      const newSessions = new Map(sessions);
      const updatedSession = { 
        ...newSessions.get(sessionId)!, 
        reconnectAttempts: session.reconnectAttempts + 1 
      };
      newSessions.set(sessionId, updatedSession);
      return newSessions;
    });

    // Wait before reconnecting
    await new Promise(resolve => setTimeout(resolve, session.config.websocket.reconnectDelay));

    try {
      await this.establishWebSocketConnection(session);
    } catch (error) {
      console.error(`Reconnection failed for session ${sessionId}:`, error);
      // Will retry again if within max attempts
      setTimeout(() => this.attemptReconnection(sessionId), session.config.websocket.reconnectDelay);
    }
  }

  /**
   * Update session state
   */
  private updateSessionState(sessionId: string, state: WebSocketState, error?: string): void {
    this._connectionStates.update(states => {
      const newStates = new Map(states);
      newStates.set(sessionId, state);
      return newStates;
    });

    this._sessions.update(sessions => {
      const newSessions = new Map(sessions);
      const session = newSessions.get(sessionId);
      if (session) {
        session.state = state;
        if (error) {
          session.lastError = error;
        }
        newSessions.set(sessionId, session);
      }
      return newSessions;
    });
  }

  /**
   * Update session activity timestamp
   */
  private updateSessionActivity(sessionId: string): void {
    this._sessions.update(sessions => {
      const newSessions = new Map(sessions);
      const session = newSessions.get(sessionId);
      if (session) {
        session.lastActivity = Date.now();
        newSessions.set(sessionId, session);
      }
      return newSessions;
    });
  }

  /**
   * Handle stream errors
   */
  private handleStreamError(sessionId: string, error: any): void {
    console.error(`Stream error for session ${sessionId}:`, error);
    
    this.streamError$.next({ sessionId, error });
    
    const avatarId = this.getAvatarIdForSession(sessionId);
    this.avatarStateService.handleError(avatarId, error);
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(sessionId: string, error: any): void {
    this.updateSessionState(sessionId, 'error', error.message);
    this.handleStreamError(sessionId, error);
  }

  /**
   * Start ping/pong mechanism for connection monitoring
   */
  private startPingPong(sessionId: string): void {
    const session = this._sessions().get(sessionId);
    
    if (!session || !session.websocket) return;

    const pingInterval = session.config.websocket.pingInterval;
    
    const pingTimer = setInterval(() => {
      const currentSession = this._sessions().get(sessionId);
      
      if (!currentSession || currentSession.state !== 'connected') {
        clearInterval(pingTimer);
        return;
      }

      try {
        const pingMessage = {
          type: 'ping',
          timestamp: Date.now()
        };
        
        currentSession.websocket!.send(JSON.stringify(pingMessage));
      } catch (error) {
        clearInterval(pingTimer);
        this.handleStreamError(sessionId, error);
      }
    }, pingInterval);
  }

  /**
   * Handle pong message for latency measurement
   */
  private handlePongMessage(sessionId: string, message: any): void {
    const latency = Date.now() - message.timestamp;
    
    this._latencyMeasurements.update(measurements => {
      const newMeasurements = new Map(measurements);
      const sessionLatencies = newMeasurements.get(sessionId) || [];
      
      // Keep only last 10 measurements
      const updatedLatencies = [...sessionLatencies, latency].slice(-10);
      newMeasurements.set(sessionId, updatedLatencies);
      
      return newMeasurements;
    });

    // Update avatar connection state
    const avatarId = this.getAvatarIdForSession(sessionId);
    this.avatarStateService.updateConnectionState(avatarId, { latency });
  }

  /**
   * Wait for WebSocket connection
   */
  private waitForConnection(websocket: WebSocket, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeout);

      websocket.addEventListener('open', () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });

      websocket.addEventListener('error', (error) => {
        clearTimeout(timer);
        reject(error);
      }, { once: true });
    });
  }

  /**
   * Get avatar ID for session
   */
  private getAvatarIdForSession(sessionId: string): string {
    const session = this._sessions().get(sessionId);
    return session?.avatarId || '';
  }

  /**
   * Initialize monitoring systems
   */
  private initializeMonitoring(): void {
    // Monitor connection quality every 5 seconds
    interval(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateConnectionQuality();
      });

    // Clean up inactive sessions every minute
    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.cleanupInactiveSessions();
      });
  }

  /**
   * Update connection quality metrics
   */
  private updateConnectionQuality(): void {
    this._sessions().forEach((session, sessionId) => {
      if (session.state === 'connected') {
        const latencies = this._latencyMeasurements().get(sessionId) || [];
        const avgLatency = latencies.length > 0 
          ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length 
          : 0;
        
        // Calculate quality based on latency and connection stability
        let quality = 1.0;
        
        if (avgLatency > 1000) quality -= 0.5;
        else if (avgLatency > 500) quality -= 0.3;
        else if (avgLatency > 200) quality -= 0.1;
        
        if (session.reconnectAttempts > 0) {
          quality -= session.reconnectAttempts * 0.1;
        }
        
        quality = Math.max(0, Math.min(1, quality));
        
        this._connectionQuality.update(qualities => {
          const newQualities = new Map(qualities);
          newQualities.set(sessionId, quality);
          return newQualities;
        });

        // Update avatar connection state
        this.avatarStateService.updateConnectionState(session.avatarId, { quality });
      }
    });
  }

  /**
   * Clean up inactive sessions
   */
  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const inactivityThreshold = 5 * 60 * 1000; // 5 minutes
    
    this._sessions().forEach((session, sessionId) => {
      if (now - session.lastActivity > inactivityThreshold && 
          session.state === 'disconnected') {
        console.log(`Cleaning up inactive session: ${sessionId}`);
        this.closeSession(sessionId);
      }
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // Handle global WebSocket errors
    this.streamError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ sessionId, error }) => {
        const avatarId = this.getAvatarIdForSession(sessionId);
        this.avatarStateService.handleError(avatarId, error);
      });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}