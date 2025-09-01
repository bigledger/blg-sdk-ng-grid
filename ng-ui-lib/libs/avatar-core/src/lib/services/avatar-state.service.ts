import { Injectable, signal, computed, effect, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Subject, fromEvent, interval } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import {
  AvatarConfig,
  AvatarState,
  AvatarAnimationState,
  AvatarEmotion,
  AvatarGesture,
  AnimationState,
  SpeechState,
  AudioState,
  ConnectionState,
  PerformanceState
} from '../interfaces/avatar-state.interface';
import { AvatarMessage, MessageResult } from '../interfaces/avatar-message.interface';

/**
 * Central state management service for avatar instances using Angular Signals.
 * Provides reactive state management with optimal performance.
 */
@Injectable({
  providedIn: 'root'
})
export class AvatarStateService {
  private destroyRef = inject(DestroyRef);

  // Core state signals
  private _avatars = signal<Map<string, AvatarState>>(new Map());
  private _activeAvatarId = signal<string | null>(null);
  private _globalConfig = signal<Partial<AvatarConfig> | null>(null);

  // Message and queue signals
  private _messageQueue = signal<Map<string, AvatarMessage[]>>(new Map());
  private _processingMessages = signal<Set<string>>(new Set());

  // Event subjects for complex async operations
  private messageProcessed$ = new Subject<{ avatarId: string; result: MessageResult }>();
  private stateChanged$ = new Subject<{ avatarId: string; state: AvatarState }>();
  private errorOccurred$ = new Subject<{ avatarId: string; error: any }>();

  // Computed signals for derived state
  readonly avatars = this._avatars.asReadonly();
  readonly activeAvatarId = this._activeAvatarId.asReadonly();
  readonly globalConfig = this._globalConfig.asReadonly();

  readonly activeAvatar = computed(() => {
    const activeId = this._activeAvatarId();
    const avatars = this._avatars();
    return activeId ? avatars.get(activeId) || null : null;
  });

  readonly avatarList = computed(() => {
    return Array.from(this._avatars().values());
  });

  readonly activeAvatarCount = computed(() => {
    return Array.from(this._avatars().values()).filter(avatar => 
      avatar.status === 'ready' || avatar.status === 'busy'
    ).length;
  });

  readonly totalMessageQueueLength = computed(() => {
    return Array.from(this._messageQueue().values())
      .reduce((total, queue) => total + queue.length, 0);
  });

  readonly isProcessingAnyMessages = computed(() => {
    return this._processingMessages().size > 0;
  });

  // Public observables
  readonly messageProcessed = this.messageProcessed$.asObservable();
  readonly stateChanged = this.stateChanged$.asObservable();
  readonly errorOccurred = this.errorOccurred$.asObservable();

  constructor() {
    this.setupPerformanceMonitoring();
    this.setupErrorHandling();
  }

  /**
   * Initialize a new avatar instance
   */
  initializeAvatar(config: AvatarConfig): void {
    const initialState: AvatarState = {
      id: config.id,
      initialized: false,
      status: 'initializing',
      animation: {
        current: 'idle',
        queue: [],
        currentGesture: 'none',
        gestureQueue: [],
        emotion: 'neutral',
        loopCount: 0,
        paused: false
      },
      speech: {
        isSpeaking: false,
        progress: 0,
        wordIndex: 0,
        timeRemaining: 0,
        wpm: 150
      },
      audio: {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: config.voice.volume,
        muted: false,
        queueLength: 0
      },
      connection: {
        websocket: 'disconnected',
        audioStream: 'idle',
        textStream: 'idle',
        quality: 1.0,
        latency: 0,
        reconnectAttempts: 0
      },
      performance: {
        fps: 60,
        memoryUsage: 0,
        cpuUsage: 0,
        audioBufferHealth: 1.0,
        renderTime: 0,
        audioProcessingTime: 0,
        activeAnimations: 0
      },
      lastUpdate: Date.now(),
      messageQueueLength: 0
    };

    this._avatars.update(avatars => {
      const newAvatars = new Map(avatars);
      newAvatars.set(config.id, initialState);
      return newAvatars;
    });

    this._messageQueue.update(queues => {
      const newQueues = new Map(queues);
      newQueues.set(config.id, []);
      return newQueues;
    });

    // Set as active if it's the first avatar
    if (this._activeAvatarId() === null) {
      this._activeAvatarId.set(config.id);
    }

    this.stateChanged$.next({ avatarId: config.id, state: initialState });
  }

  /**
   * Update avatar state
   */
  updateAvatarState(avatarId: string, partialState: Partial<AvatarState>): void {
    this._avatars.update(avatars => {
      const newAvatars = new Map(avatars);
      const currentState = newAvatars.get(avatarId);
      
      if (!currentState) {
        console.warn(`Avatar ${avatarId} not found for state update`);
        return avatars;
      }

      const updatedState: AvatarState = {
        ...currentState,
        ...partialState,
        lastUpdate: Date.now()
      };

      newAvatars.set(avatarId, updatedState);
      this.stateChanged$.next({ avatarId, state: updatedState });
      
      return newAvatars;
    });
  }

  /**
   * Update specific animation state
   */
  updateAnimationState(avatarId: string, animationState: Partial<AnimationState>): void {
    this._avatars.update(avatars => {
      const newAvatars = new Map(avatars);
      const currentState = newAvatars.get(avatarId);
      
      if (!currentState) return avatars;

      const updatedState: AvatarState = {
        ...currentState,
        animation: { ...currentState.animation, ...animationState },
        lastUpdate: Date.now()
      };

      newAvatars.set(avatarId, updatedState);
      return newAvatars;
    });
  }

  /**
   * Update speech state
   */
  updateSpeechState(avatarId: string, speechState: Partial<SpeechState>): void {
    this._avatars.update(avatars => {
      const newAvatars = new Map(avatars);
      const currentState = newAvatars.get(avatarId);
      
      if (!currentState) return avatars;

      const updatedState: AvatarState = {
        ...currentState,
        speech: { ...currentState.speech, ...speechState },
        lastUpdate: Date.now()
      };

      newAvatars.set(avatarId, updatedState);
      return newAvatars;
    });
  }

  /**
   * Update audio state
   */
  updateAudioState(avatarId: string, audioState: Partial<AudioState>): void {
    this._avatars.update(avatars => {
      const newAvatars = new Map(avatars);
      const currentState = newAvatars.get(avatarId);
      
      if (!currentState) return avatars;

      const updatedState: AvatarState = {
        ...currentState,
        audio: { ...currentState.audio, ...audioState },
        lastUpdate: Date.now()
      };

      newAvatars.set(avatarId, updatedState);
      return newAvatars;
    });
  }

  /**
   * Update connection state
   */
  updateConnectionState(avatarId: string, connectionState: Partial<ConnectionState>): void {
    this._avatars.update(avatars => {
      const newAvatars = new Map(avatars);
      const currentState = newAvatars.get(avatarId);
      
      if (!currentState) return avatars;

      const updatedState: AvatarState = {
        ...currentState,
        connection: { ...currentState.connection, ...connectionState },
        lastUpdate: Date.now()
      };

      newAvatars.set(avatarId, updatedState);
      return newAvatars;
    });
  }

  /**
   * Add message to avatar's queue
   */
  addMessage(avatarId: string, message: AvatarMessage): void {
    this._messageQueue.update(queues => {
      const newQueues = new Map(queues);
      const currentQueue = newQueues.get(avatarId) || [];
      
      // Insert message based on priority
      const insertIndex = this.findInsertionIndex(currentQueue, message);
      const newQueue = [...currentQueue];
      newQueue.splice(insertIndex, 0, message);
      
      newQueues.set(avatarId, newQueue);
      return newQueues;
    });

    // Update avatar state to reflect queue length
    this.updateAvatarState(avatarId, {
      messageQueueLength: this._messageQueue().get(avatarId)?.length || 0
    });
  }

  /**
   * Get next message from queue
   */
  getNextMessage(avatarId: string): AvatarMessage | null {
    const queue = this._messageQueue().get(avatarId);
    return queue && queue.length > 0 ? queue[0] : null;
  }

  /**
   * Remove processed message from queue
   */
  removeMessage(avatarId: string, messageId: string): void {
    this._messageQueue.update(queues => {
      const newQueues = new Map(queues);
      const currentQueue = newQueues.get(avatarId) || [];
      const newQueue = currentQueue.filter(msg => msg.id !== messageId);
      newQueues.set(avatarId, newQueue);
      return newQueues;
    });

    this.updateAvatarState(avatarId, {
      messageQueueLength: this._messageQueue().get(avatarId)?.length || 0
    });
  }

  /**
   * Clear all messages for an avatar
   */
  clearMessageQueue(avatarId: string): void {
    this._messageQueue.update(queues => {
      const newQueues = new Map(queues);
      newQueues.set(avatarId, []);
      return newQueues;
    });

    this.updateAvatarState(avatarId, {
      messageQueueLength: 0
    });
  }

  /**
   * Set active avatar
   */
  setActiveAvatar(avatarId: string): void {
    if (this._avatars().has(avatarId)) {
      this._activeAvatarId.set(avatarId);
    }
  }

  /**
   * Remove avatar instance
   */
  removeAvatar(avatarId: string): void {
    this._avatars.update(avatars => {
      const newAvatars = new Map(avatars);
      newAvatars.delete(avatarId);
      return newAvatars;
    });

    this._messageQueue.update(queues => {
      const newQueues = new Map(queues);
      newQueues.delete(avatarId);
      return newQueues;
    });

    this._processingMessages.update(processing => {
      const newProcessing = new Set(processing);
      newProcessing.delete(avatarId);
      return newProcessing;
    });

    // Update active avatar if necessary
    if (this._activeAvatarId() === avatarId) {
      const remaining = Array.from(this._avatars().keys());
      this._activeAvatarId.set(remaining.length > 0 ? remaining[0] : null);
    }
  }

  /**
   * Set global configuration
   */
  setGlobalConfig(config: Partial<AvatarConfig>): void {
    this._globalConfig.set(config);
  }

  /**
   * Mark avatar as processing messages
   */
  setProcessingMessages(avatarId: string, processing: boolean): void {
    this._processingMessages.update(current => {
      const updated = new Set(current);
      if (processing) {
        updated.add(avatarId);
      } else {
        updated.delete(avatarId);
      }
      return updated;
    });
  }

  /**
   * Handle avatar errors
   */
  handleError(avatarId: string, error: any): void {
    const errorInfo = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      timestamp: Date.now(),
      recoverable: error.recoverable !== false
    };

    this.updateAvatarState(avatarId, {
      status: 'error',
      error: errorInfo
    });

    this.errorOccurred$.next({ avatarId, error: errorInfo });
  }

  /**
   * Find insertion index for message based on priority
   */
  private findInsertionIndex(queue: AvatarMessage[], message: AvatarMessage): number {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    const messagePriority = priorityOrder[message.priority];

    for (let i = 0; i < queue.length; i++) {
      const queuePriority = priorityOrder[queue[i].priority];
      if (messagePriority < queuePriority) {
        return i;
      }
    }

    return queue.length;
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Update performance metrics every second
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updatePerformanceMetrics();
      });
  }

  /**
   * Update performance metrics for all avatars
   */
  private updatePerformanceMetrics(): void {
    const avatars = this._avatars();
    
    avatars.forEach((state, avatarId) => {
      if (state.status === 'ready' || state.status === 'busy') {
        const performanceUpdate: Partial<PerformanceState> = {
          fps: this.calculateFPS(),
          memoryUsage: this.getMemoryUsage(),
          cpuUsage: this.getCPUUsage(),
          audioBufferHealth: this.calculateAudioBufferHealth(state.audio),
          activeAnimations: this.countActiveAnimations(state.animation)
        };

        this.updateAvatarState(avatarId, {
          performance: { ...state.performance, ...performanceUpdate }
        });
      }
    });
  }

  /**
   * Setup error handling and recovery
   */
  private setupErrorHandling(): void {
    // Listen for unhandled errors
    fromEvent(window, 'error')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: any) => {
        console.error('Unhandled error:', event.error);
        // Handle avatar-related errors here
      });

    // Listen for unhandled promise rejections
    fromEvent(window, 'unhandledrejection')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: any) => {
        console.error('Unhandled promise rejection:', event.reason);
        // Handle avatar-related promise rejections here
      });
  }

  /**
   * Calculate current FPS
   */
  private calculateFPS(): number {
    // Implementation would measure actual frame rate
    // This is a placeholder
    return 60;
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    // Implementation would use performance.memory if available
    // This is a placeholder
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }
    return 0;
  }

  /**
   * Get CPU usage estimate
   */
  private getCPUUsage(): number {
    // Implementation would estimate CPU usage
    // This is a placeholder
    return 0;
  }

  /**
   * Calculate audio buffer health
   */
  private calculateAudioBufferHealth(audioState: AudioState): number {
    if (audioState.queueLength === 0) return 1.0;
    // Calculate based on queue length and processing speed
    return Math.max(0, Math.min(1, (10 - audioState.queueLength) / 10));
  }

  /**
   * Count active animations
   */
  private countActiveAnimations(animationState: AnimationState): number {
    let count = 0;
    if (animationState.current !== 'idle') count++;
    count += animationState.queue.length;
    count += animationState.gestureQueue.length;
    return count;
  }
}