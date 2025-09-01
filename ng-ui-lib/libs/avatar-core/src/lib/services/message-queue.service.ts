import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, BehaviorSubject, Subject } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';

import {
  AvatarMessage,
  MessageResult,
  MessagePriority,
  TextMessage,
  AudioMessage,
  GestureMessage,
  CommandMessage,
  StreamingMessage
} from '../interfaces/avatar-message.interface';
import { AvatarStateService } from './avatar-state.service';

/**
 * Message queue management service for avatar instances.
 * Handles message processing, prioritization, and delivery.
 */
@Injectable({
  providedIn: 'root'
})
export class MessageQueueService {
  private destroyRef = inject(DestroyRef);
  private avatarStateService = inject(AvatarStateService);

  // Message processing signals
  private _processingState = signal<Map<string, boolean>>(new Map());
  private _messageHistory = signal<Map<string, MessageResult[]>>(new Map());
  private _streamingSessions = signal<Map<string, string>>(new Map()); // avatarId -> sessionId

  // Processing configuration
  private _maxConcurrentProcessing = signal<number>(3);
  private _processingTimeout = signal<number>(30000); // 30 seconds
  private _retryAttempts = signal<number>(3);

  // Event subjects
  private messageProcessingStarted$ = new Subject<{ avatarId: string; message: AvatarMessage }>();
  private messageProcessingCompleted$ = new Subject<{ avatarId: string; result: MessageResult }>();
  private messageProcessingFailed$ = new Subject<{ avatarId: string; error: any; message: AvatarMessage }>();
  private queueStateChanged$ = new Subject<{ avatarId: string; queueLength: number }>();

  // Computed signals
  readonly isProcessingAny = computed(() => {
    return Array.from(this._processingState().values()).some(processing => processing);
  });

  readonly totalProcessingCount = computed(() => {
    return Array.from(this._processingState().values()).filter(processing => processing).length;
  });

  readonly processingState = this._processingState.asReadonly();
  readonly messageHistory = this._messageHistory.asReadonly();

  // Public observables
  readonly messageProcessingStarted = this.messageProcessingStarted$.asObservable();
  readonly messageProcessingCompleted = this.messageProcessingCompleted$.asObservable();
  readonly messageProcessingFailed = this.messageProcessingFailed$.asObservable();
  readonly queueStateChanged = this.queueStateChanged$.asObservable();

  constructor() {
    this.initializeProcessing();
  }

  /**
   * Add a message to the queue for an avatar
   */
  addMessage(avatarId: string, message: AvatarMessage): void {
    // Validate message
    if (!this.validateMessage(message)) {
      throw new Error(`Invalid message format: ${message.id}`);
    }

    // Handle interrupt messages
    if (message.interrupt) {
      this.handleInterruptMessage(avatarId, message);
    } else {
      this.avatarStateService.addMessage(avatarId, message);
    }

    this.queueStateChanged$.next({
      avatarId,
      queueLength: this.getQueueLength(avatarId)
    });

    // Start processing if not already processing
    if (!this._processingState().get(avatarId)) {
      this.startProcessing(avatarId);
    }
  }

  /**
   * Add multiple messages as a batch
   */
  addMessages(avatarId: string, messages: AvatarMessage[]): void {
    messages.forEach(message => {
      if (this.validateMessage(message)) {
        this.avatarStateService.addMessage(avatarId, message);
      }
    });

    this.queueStateChanged$.next({
      avatarId,
      queueLength: this.getQueueLength(avatarId)
    });

    if (!this._processingState().get(avatarId)) {
      this.startProcessing(avatarId);
    }
  }

  /**
   * Create and add a text message
   */
  addTextMessage(
    avatarId: string,
    text: string,
    options: {
      priority?: MessagePriority;
      interrupt?: boolean;
      voice?: any;
      gestures?: any[];
      emotions?: any[];
    } = {}
  ): string {
    const message: TextMessage = {
      id: this.generateMessageId(),
      type: 'text',
      priority: options.priority || 'normal',
      timestamp: Date.now(),
      interrupt: options.interrupt || false,
      text,
      voice: options.voice,
      gestures: options.gestures,
      emotions: options.emotions
    };

    this.addMessage(avatarId, message);
    return message.id;
  }

  /**
   * Create and add an audio message
   */
  addAudioMessage(
    avatarId: string,
    audioData: string | ArrayBuffer,
    format: 'wav' | 'mp3' | 'ogg',
    duration: number,
    options: {
      priority?: MessagePriority;
      interrupt?: boolean;
      lipSync?: boolean;
      gestures?: any[];
    } = {}
  ): string {
    const message: AudioMessage = {
      id: this.generateMessageId(),
      type: 'audio',
      priority: options.priority || 'normal',
      timestamp: Date.now(),
      interrupt: options.interrupt || false,
      audioData,
      format,
      duration,
      lipSync: options.lipSync !== false,
      gestures: options.gestures
    };

    this.addMessage(avatarId, message);
    return message.id;
  }

  /**
   * Create and add a gesture message
   */
  addGestureMessage(
    avatarId: string,
    gesture: string,
    timing: any,
    options: {
      priority?: MessagePriority;
      interrupt?: boolean;
      additive?: boolean;
    } = {}
  ): string {
    const message: GestureMessage = {
      id: this.generateMessageId(),
      type: 'gesture',
      priority: options.priority || 'normal',
      timestamp: Date.now(),
      interrupt: options.interrupt || false,
      gesture,
      timing,
      additive: options.additive || false
    };

    this.addMessage(avatarId, message);
    return message.id;
  }

  /**
   * Create and add a command message
   */
  addCommand(
    avatarId: string,
    command: 'pause' | 'resume' | 'stop' | 'reset' | 'clear-queue',
    parameters: any = {}
  ): string {
    const message: CommandMessage = {
      id: this.generateMessageId(),
      type: 'command',
      priority: 'high',
      timestamp: Date.now(),
      interrupt: true,
      command,
      parameters
    };

    this.addMessage(avatarId, message);
    return message.id;
  }

  /**
   * Start streaming session
   */
  startStreamingSession(avatarId: string, sessionId?: string): string {
    const id = sessionId || this.generateSessionId();
    
    this._streamingSessions.update(sessions => {
      const newSessions = new Map(sessions);
      newSessions.set(avatarId, id);
      return newSessions;
    });

    return id;
  }

  /**
   * Add streaming message chunk
   */
  addStreamingChunk(
    avatarId: string,
    sessionId: string,
    streamType: 'start' | 'chunk' | 'end',
    data: {
      textChunk?: string;
      audioChunk?: ArrayBuffer;
      sequence: number;
      totalChunks?: number;
    }
  ): string {
    const message: StreamingMessage = {
      id: this.generateMessageId(),
      type: 'streaming',
      priority: 'high',
      timestamp: Date.now(),
      interrupt: false,
      sessionId,
      streamType,
      textChunk: data.textChunk,
      audioChunk: data.audioChunk,
      isComplete: streamType === 'end',
      sequence: data.sequence,
      totalChunks: data.totalChunks
    };

    this.addMessage(avatarId, message);
    return message.id;
  }

  /**
   * End streaming session
   */
  endStreamingSession(avatarId: string): void {
    const sessionId = this._streamingSessions().get(avatarId);
    
    if (sessionId) {
      this.addStreamingChunk(avatarId, sessionId, 'end', { sequence: -1 });
      
      this._streamingSessions.update(sessions => {
        const newSessions = new Map(sessions);
        newSessions.delete(avatarId);
        return newSessions;
      });
    }
  }

  /**
   * Clear message queue for avatar
   */
  clearQueue(avatarId: string): void {
    this.avatarStateService.clearMessageQueue(avatarId);
    this.stopProcessing(avatarId);
    
    this.queueStateChanged$.next({
      avatarId,
      queueLength: 0
    });
  }

  /**
   * Pause message processing for avatar
   */
  pauseProcessing(avatarId: string): void {
    this.stopProcessing(avatarId);
  }

  /**
   * Resume message processing for avatar
   */
  resumeProcessing(avatarId: string): void {
    if (this.getQueueLength(avatarId) > 0) {
      this.startProcessing(avatarId);
    }
  }

  /**
   * Get queue length for avatar
   */
  getQueueLength(avatarId: string): number {
    const avatar = this.avatarStateService.avatars().get(avatarId);
    return avatar?.messageQueueLength || 0;
  }

  /**
   * Get message processing history
   */
  getMessageHistory(avatarId: string): MessageResult[] {
    return this._messageHistory().get(avatarId) || [];
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(avatarId: string): {
    totalProcessed: number;
    successful: number;
    failed: number;
    averageProcessingTime: number;
  } {
    const history = this.getMessageHistory(avatarId);
    
    return {
      totalProcessed: history.length,
      successful: history.filter(r => r.success).length,
      failed: history.filter(r => !r.success).length,
      averageProcessingTime: history.length > 0 
        ? history.reduce((sum, r) => sum + r.duration, 0) / history.length 
        : 0
    };
  }

  /**
   * Initialize message processing
   */
  private initializeProcessing(): void {
    // Process message queues every 100ms
    interval(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.processQueues();
      });
  }

  /**
   * Process all avatar message queues
   */
  private processQueues(): void {
    const avatars = this.avatarStateService.avatars();
    
    avatars.forEach((state, avatarId) => {
      if (!this._processingState().get(avatarId) && state.messageQueueLength > 0) {
        this.startProcessing(avatarId);
      }
    });
  }

  /**
   * Start processing messages for an avatar
   */
  private async startProcessing(avatarId: string): Promise<void> {
    if (this._processingState().get(avatarId)) {
      return; // Already processing
    }

    this._processingState.update(state => {
      const newState = new Map(state);
      newState.set(avatarId, true);
      return newState;
    });

    this.avatarStateService.setProcessingMessages(avatarId, true);

    try {
      await this.processNextMessage(avatarId);
    } catch (error) {
      console.error(`Error processing messages for avatar ${avatarId}:`, error);
    } finally {
      this.stopProcessing(avatarId);
    }
  }

  /**
   * Stop processing messages for an avatar
   */
  private stopProcessing(avatarId: string): void {
    this._processingState.update(state => {
      const newState = new Map(state);
      newState.set(avatarId, false);
      return newState;
    });

    this.avatarStateService.setProcessingMessages(avatarId, false);
  }

  /**
   * Process the next message in queue
   */
  private async processNextMessage(avatarId: string): Promise<void> {
    while (this._processingState().get(avatarId)) {
      const message = this.avatarStateService.getNextMessage(avatarId);
      
      if (!message) {
        break; // No more messages
      }

      this.messageProcessingStarted$.next({ avatarId, message });

      try {
        const result = await this.processMessage(avatarId, message);
        
        this.avatarStateService.removeMessage(avatarId, message.id);
        this.addToHistory(avatarId, result);
        
        this.messageProcessingCompleted$.next({ avatarId, result });
        
      } catch (error) {
        console.error(`Failed to process message ${message.id}:`, error);
        
        const result: MessageResult = {
          messageId: message.id,
          success: false,
          duration: 0,
          error: {
            code: 'PROCESSING_ERROR',
            message: error.message || 'Unknown error',
            details: error
          }
        };
        
        this.addToHistory(avatarId, result);
        this.messageProcessingFailed$.next({ avatarId, error, message });
        
        // Remove failed message
        this.avatarStateService.removeMessage(avatarId, message.id);
      }

      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  /**
   * Process a single message
   */
  private async processMessage(avatarId: string, message: AvatarMessage): Promise<MessageResult> {
    const startTime = Date.now();

    try {
      let result: MessageResult;

      switch (message.type) {
        case 'text':
          result = await this.processTextMessage(avatarId, message as TextMessage);
          break;
        case 'audio':
          result = await this.processAudioMessage(avatarId, message as AudioMessage);
          break;
        case 'gesture':
          result = await this.processGestureMessage(avatarId, message as GestureMessage);
          break;
        case 'command':
          result = await this.processCommandMessage(avatarId, message as CommandMessage);
          break;
        case 'streaming':
          result = await this.processStreamingMessage(avatarId, message as StreamingMessage);
          break;
        default:
          throw new Error(`Unsupported message type: ${(message as any).type}`);
      }

      result.duration = Date.now() - startTime;
      return result;

    } catch (error) {
      return {
        messageId: message.id,
        success: false,
        duration: Date.now() - startTime,
        error: {
          code: 'PROCESSING_ERROR',
          message: error.message || 'Unknown error',
          details: error
        }
      };
    }
  }

  /**
   * Process text message (placeholder)
   */
  private async processTextMessage(avatarId: string, message: TextMessage): Promise<MessageResult> {
    // This would integrate with TTS service
    return {
      messageId: message.id,
      success: true,
      duration: 0
    };
  }

  /**
   * Process audio message (placeholder)
   */
  private async processAudioMessage(avatarId: string, message: AudioMessage): Promise<MessageResult> {
    // This would integrate with audio processing service
    return {
      messageId: message.id,
      success: true,
      duration: 0
    };
  }

  /**
   * Process gesture message (placeholder)
   */
  private async processGestureMessage(avatarId: string, message: GestureMessage): Promise<MessageResult> {
    // This would integrate with gesture service
    return {
      messageId: message.id,
      success: true,
      duration: 0
    };
  }

  /**
   * Process command message
   */
  private async processCommandMessage(avatarId: string, message: CommandMessage): Promise<MessageResult> {
    switch (message.command) {
      case 'pause':
        this.pauseProcessing(avatarId);
        break;
      case 'resume':
        this.resumeProcessing(avatarId);
        break;
      case 'stop':
        this.avatarStateService.updateAvatarState(avatarId, { status: 'ready' });
        break;
      case 'reset':
        this.clearQueue(avatarId);
        this.avatarStateService.updateAvatarState(avatarId, { status: 'ready' });
        break;
      case 'clear-queue':
        this.clearQueue(avatarId);
        break;
    }

    return {
      messageId: message.id,
      success: true,
      duration: 0
    };
  }

  /**
   * Process streaming message (placeholder)
   */
  private async processStreamingMessage(avatarId: string, message: StreamingMessage): Promise<MessageResult> {
    // This would integrate with streaming service
    return {
      messageId: message.id,
      success: true,
      duration: 0
    };
  }

  /**
   * Handle interrupt messages
   */
  private handleInterruptMessage(avatarId: string, message: AvatarMessage): void {
    // Clear current queue and add interrupt message as priority
    this.clearQueue(avatarId);
    this.avatarStateService.addMessage(avatarId, message);
  }

  /**
   * Validate message format
   */
  private validateMessage(message: AvatarMessage): boolean {
    return !!(
      message.id &&
      message.type &&
      message.priority &&
      message.timestamp &&
      typeof message.interrupt === 'boolean'
    );
  }

  /**
   * Add result to history
   */
  private addToHistory(avatarId: string, result: MessageResult): void {
    this._messageHistory.update(history => {
      const newHistory = new Map(history);
      const avatarHistory = newHistory.get(avatarId) || [];
      
      // Keep only last 100 results
      const updatedHistory = [...avatarHistory, result].slice(-100);
      newHistory.set(avatarId, updatedHistory);
      
      return newHistory;
    });
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}