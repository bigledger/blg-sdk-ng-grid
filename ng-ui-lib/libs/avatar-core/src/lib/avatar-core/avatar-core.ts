import { Component, input, output, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AvatarStateService } from '../services/avatar-state.service';
import { MessageQueueService } from '../services/message-queue.service';
import { StreamService } from '../services/stream.service';
import { AudioProcessorService } from '../services/audio-processor.service';
import { 
  AvatarConfig, 
  AvatarState,
  AvatarMessage
} from '../interfaces/avatar-config.interface';

/**
 * Main avatar core component that orchestrates all avatar functionality.
 * This is the primary component for embedding avatars in applications.
 */
@Component({
  selector: 'lib-avatar-core',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar-core.html',
  styleUrl: './avatar-core.css',
})
export class AvatarCore implements OnInit, OnDestroy {
  // Injected services
  private avatarStateService = inject(AvatarStateService);
  private messageQueueService = inject(MessageQueueService);
  private streamService = inject(StreamService);
  private audioProcessorService = inject(AudioProcessorService);

  // Component inputs
  readonly config = input.required<AvatarConfig>();
  readonly autoStart = input<boolean>(true);
  readonly enableStreaming = input<boolean>(false);
  readonly enablePerformanceMonitoring = input<boolean>(false);

  // Component outputs
  readonly ready = output<{ avatarId: string; config: AvatarConfig }>();
  readonly error = output<{ avatarId: string; error: any }>();
  readonly messageProcessed = output<{ avatarId: string; messageId: string }>();
  readonly stateChanged = output<{ avatarId: string; state: AvatarState }>();

  // Internal state
  private _initialized = signal<boolean>(false);
  private _avatarId = signal<string>('');

  // Computed values
  readonly isReady = computed(() => this._initialized() && this._avatarId() !== '');
  readonly currentState = computed(() => {
    const avatarId = this._avatarId();
    return avatarId ? this.avatarStateService.avatars().get(avatarId) || null : null;
  });

  ngOnInit(): void {
    if (this.autoStart()) {
      this.initializeAvatar();
    }
  }

  ngOnDestroy(): void {
    const avatarId = this._avatarId();
    if (avatarId) {
      this.cleanupAvatar(avatarId);
    }
  }

  /**
   * Initialize the avatar with the provided configuration
   */
  async initializeAvatar(): Promise<void> {
    try {
      const config = this.config();
      this._avatarId.set(config.id);

      // Initialize avatar state
      this.avatarStateService.initializeAvatar(config);

      // Initialize audio processing
      if (config.features.lipSync || config.features.streaming) {
        await this.audioProcessorService.initializeAvatarAudio(config.id, config.audio);
      }

      // Initialize streaming if enabled
      if (this.enableStreaming() && config.features.streaming) {
        // Streaming would be initialized here
        console.log('Streaming initialization would occur here');
      }

      this._initialized.set(true);

      // Emit ready event
      this.ready.emit({ avatarId: config.id, config });

      // Setup event subscriptions
      this.setupEventSubscriptions();

    } catch (error) {
      console.error('Failed to initialize avatar:', error);
      this.error.emit({ avatarId: this.config().id, error });
    }
  }

  /**
   * Send a text message to the avatar
   */
  speak(text: string, options?: {
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    interrupt?: boolean;
    voice?: any;
    emotions?: any[];
    gestures?: any[];
  }): string {
    const avatarId = this._avatarId();
    if (!avatarId) {
      throw new Error('Avatar not initialized');
    }

    return this.messageQueueService.addTextMessage(avatarId, text, options);
  }

  /**
   * Play audio for the avatar
   */
  playAudio(audioData: string | ArrayBuffer, format: 'wav' | 'mp3' | 'ogg', options?: {
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    interrupt?: boolean;
    lipSync?: boolean;
    gestures?: any[];
  }): string {
    const avatarId = this._avatarId();
    if (!avatarId) {
      throw new Error('Avatar not initialized');
    }

    const duration = 0; // Would be calculated from audio data
    return this.messageQueueService.addAudioMessage(avatarId, audioData, format, duration, options);
  }

  /**
   * Trigger a gesture
   */
  performGesture(gesture: string, timing?: any, options?: {
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    interrupt?: boolean;
    additive?: boolean;
  }): string {
    const avatarId = this._avatarId();
    if (!avatarId) {
      throw new Error('Avatar not initialized');
    }

    return this.messageQueueService.addGestureMessage(avatarId, gesture, timing || {}, options);
  }

  /**
   * Send a command to the avatar
   */
  sendCommand(command: 'pause' | 'resume' | 'stop' | 'reset' | 'clear-queue', parameters?: any): string {
    const avatarId = this._avatarId();
    if (!avatarId) {
      throw new Error('Avatar not initialized');
    }

    return this.messageQueueService.addCommand(avatarId, command, parameters);
  }

  /**
   * Update avatar configuration
   */
  updateConfiguration(updates: Partial<AvatarConfig>): void {
    const avatarId = this._avatarId();
    if (!avatarId) {
      throw new Error('Avatar not initialized');
    }

    // Update the configuration
    const currentConfig = this.config();
    const updatedConfig = { ...currentConfig, ...updates };
    
    // Apply updates to relevant services
    if (updates.voice) {
      // Update voice settings
      console.log('Voice settings would be updated here');
    }
    
    if (updates.behavior) {
      // Update behavior settings
      console.log('Behavior settings would be updated here');
    }
    
    if (updates.appearance) {
      // Update appearance settings
      console.log('Appearance settings would be updated here');
    }
  }

  /**
   * Get current avatar statistics
   */
  getStatistics(): {
    messagesProcessed: number;
    averageProcessingTime: number;
    queueLength: number;
    isProcessing: boolean;
    uptime: number;
  } {
    const avatarId = this._avatarId();
    if (!avatarId) {
      return {
        messagesProcessed: 0,
        averageProcessingTime: 0,
        queueLength: 0,
        isProcessing: false,
        uptime: 0
      };
    }

    const stats = this.messageQueueService.getProcessingStats(avatarId);
    const state = this.currentState();
    
    return {
      messagesProcessed: stats.totalProcessed,
      averageProcessingTime: stats.averageProcessingTime,
      queueLength: state?.messageQueueLength || 0,
      isProcessing: this.messageQueueService.isProcessingAny(),
      uptime: state ? Date.now() - state.lastUpdate : 0
    };
  }

  /**
   * Setup event subscriptions
   */
  private setupEventSubscriptions(): void {
    const avatarId = this._avatarId();
    if (!avatarId) return;

    // Subscribe to state changes
    this.avatarStateService.stateChanged.subscribe(({ avatarId: id, state }) => {
      if (id === avatarId) {
        this.stateChanged.emit({ avatarId: id, state });
      }
    });

    // Subscribe to message processing
    this.messageQueueService.messageProcessingCompleted.subscribe(({ avatarId: id, result }) => {
      if (id === avatarId) {
        this.messageProcessed.emit({ avatarId: id, messageId: result.messageId });
      }
    });

    // Subscribe to errors
    this.avatarStateService.errorOccurred.subscribe(({ avatarId: id, error }) => {
      if (id === avatarId) {
        this.error.emit({ avatarId: id, error });
      }
    });
  }

  /**
   * Cleanup avatar resources
   */
  private cleanupAvatar(avatarId: string): void {
    try {
      // Stop message processing
      this.messageQueueService.clearQueue(avatarId);
      
      // Dispose audio resources
      this.audioProcessorService.disposeAvatarAudio(avatarId);
      
      // Remove avatar state
      this.avatarStateService.removeAvatar(avatarId);
      
      // Close streaming session if active
      // this.streamService.closeSession would be called here
      
    } catch (error) {
      console.error('Error during avatar cleanup:', error);
    }
  }
}
