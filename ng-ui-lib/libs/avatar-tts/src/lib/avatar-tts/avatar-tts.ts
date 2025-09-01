import { Component, input, output, signal, computed, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, combineLatest } from 'rxjs';
import { TTSConfig } from '../interfaces/tts-config.interface';
import { MouthShape, LipSyncTimelineEntry } from '../interfaces/lip-sync.interface';
import { TTSService } from '../services/tts.service';
import { AudioProcessingService } from '../services/audio-processing.service';
import { LipSyncEngineService } from '../services/lip-sync-engine.service';
import { VisemeLibraryService } from '../services/viseme-library.service';
import { SynchronizationService } from '../services/synchronization.service';
import { AdvancedFeaturesService } from '../services/advanced-features.service';

/**
 * Avatar TTS Component
 * Main component that orchestrates text-to-speech and lip sync functionality
 */
@Component({
  selector: 'lib-avatar-tts',
  imports: [CommonModule],
  templateUrl: './avatar-tts.html',
  styleUrl: './avatar-tts.css',
})
export class AvatarTts implements OnInit, OnDestroy {
  // Inputs
  readonly config = input.required<TTSConfig>();
  readonly text = input<string>('');
  readonly autoPlay = input<boolean>(false);
  readonly enableVisualizer = input<boolean>(true);
  readonly avatarModel = input<string>('default');
  
  // Outputs
  readonly speechStart = output<{ text: string; timestamp: number }>();
  readonly speechEnd = output<{ text: string; timestamp: number }>();
  readonly speechError = output<Error>();
  readonly visemeChange = output<{ viseme: string; mouthShape: MouthShape }>();
  readonly emotionChange = output<{ emotion: string; intensity: number }>();
  readonly animationUpdate = output<AvatarAnimationState>();
  
  // Injected services
  private readonly ttsService = inject(TTSService);
  private readonly audioProcessingService = inject(AudioProcessingService);
  private readonly lipSyncEngine = inject(LipSyncEngineService);
  private readonly visemeLibrary = inject(VisemeLibraryService);
  private readonly synchronizationService = inject(SynchronizationService);
  private readonly advancedFeaturesService = inject(AdvancedFeaturesService);
  
  // Component state
  private readonly _isInitialized = signal(false);
  private readonly _isPlaying = signal(false);
  private readonly _currentText = signal('');
  private readonly _playbackProgress = signal(0);
  private readonly _audioContext = signal<AudioContext | null>(null);
  
  // Computed signals
  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly currentText = this._currentText.asReadonly();
  readonly playbackProgress = this._playbackProgress.asReadonly();
  
  // Avatar state signals
  readonly currentMouthShape = computed(() => {
    const lipSyncShape = this.lipSyncEngine.currentMouthShape();
    const emotion = this.advancedFeaturesService.currentEmotion();
    return this.advancedFeaturesService.applyEmotionToMouthShape(lipSyncShape, emotion);
  });
  
  readonly currentViseme = this.lipSyncEngine.currentViseme;
  readonly currentEmotion = this.advancedFeaturesService.currentEmotion;
  readonly avatarAnimationState = computed(() => ({
    mouthShape: this.currentMouthShape(),
    viseme: this.currentViseme(),
    emotion: this.currentEmotion(),
    headPose: this.advancedFeaturesService.headPose(),
    eyeState: this.advancedFeaturesService.eyeState(),
    breathing: this.advancedFeaturesService.breathingState(),
    gesture: this.advancedFeaturesService.currentGesture(),
    timestamp: performance.now()
  }));
  
  // Subscriptions
  private subscriptions = new Subscription();
  
  // Effects
  private readonly textChangeEffect = effect(() => {
    const newText = this.text();
    if (newText && newText !== this._currentText() && this.autoPlay()) {
      this.speak(newText);
    }
  });
  
  private readonly animationUpdateEffect = effect(() => {
    const state = this.avatarAnimationState();
    this.animationUpdate.emit(state);
  });
  
  private readonly visemeChangeEffect = effect(() => {
    const viseme = this.currentViseme();
    const mouthShape = this.currentMouthShape();
    this.visemeChange.emit({ viseme, mouthShape });
  });
  
  async ngOnInit(): Promise<void> {
    try {
      await this.initializeServices();
      this.setupEventListeners();
      this._isInitialized.set(true);
    } catch (error) {
      console.error('Failed to initialize Avatar TTS:', error);
      this.speechError.emit(error as Error);
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stop();
  }
  
  /**
   * Speak the provided text with lip sync
   */
  async speak(text: string): Promise<void> {
    if (!this._isInitialized()) {
      throw new Error('Avatar TTS not initialized');
    }
    
    if (this._isPlaying()) {
      this.stop();
    }
    
    try {
      this._currentText.set(text);
      this._isPlaying.set(true);
      this._playbackProgress.set(0);
      
      // Analyze text for emotions and emphasis
      const textAnalysis = await this.advancedFeaturesService.processText(text);
      
      // Apply detected emotions
      if (textAnalysis.emotions.length > 0) {
        const primaryEmotion = textAnalysis.emotions[0];
        this.advancedFeaturesService.triggerEmotion(
          primaryEmotion.emotion,
          primaryEmotion.intensity
        );
      }
      
      // Trigger gestures for emphasis
      textAnalysis.gestures.forEach(gesture => {
        setTimeout(() => {
          this.advancedFeaturesService.triggerGesture(
            gesture.type,
            gesture.intensity,
            gesture.duration
          );
        }, 100); // Small delay to sync with speech
      });
      
      this.speechStart.emit({ text, timestamp: performance.now() });
      
      // Generate speech audio
      const speechResult = await this.ttsService.speak(text);
      
      // Process audio for lip sync if available
      let timeline: LipSyncTimelineEntry[] = [];
      if (speechResult.audioBuffer) {
        const audioData = speechResult.audioBuffer.getChannelData(0);
        const phonemes = await this.audioProcessingService.processTTSAudio(audioData);
        timeline = await this.lipSyncEngine.generateTimeline(phonemes, speechResult.duration);
      } else {
        // Fallback to text-based lip sync
        timeline = await this.lipSyncEngine.generateTimelineFromText(text, 3000); // 3s estimated
      }
      
      // Start lip sync animation
      this.lipSyncEngine.startAnimation(performance.now());
      
      // Monitor playback progress
      this.startProgressTracking(speechResult.duration);
      
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      this._isPlaying.set(false);
      this.speechError.emit(error as Error);
      throw error;
    }
  }
  
  /**
   * Stop current speech and animation
   */
  stop(): void {
    this.ttsService.stop();
    this.lipSyncEngine.stopAnimation();
    this._isPlaying.set(false);
    this._playbackProgress.set(0);
  }
  
  /**
   * Pause current speech
   */
  pause(): void {
    this.ttsService.pause();
    this.lipSyncEngine.stopAnimation();
  }
  
  /**
   * Resume paused speech
   */
  resume(): void {
    this.ttsService.resume();
    this.lipSyncEngine.startAnimation();
  }
  
  /**
   * Set emotion manually
   */
  setEmotion(emotion: string, intensity: number, duration?: number): void {
    this.advancedFeaturesService.triggerEmotion(emotion, intensity, duration);
    this.emotionChange.emit({ emotion, intensity });
  }
  
  /**
   * Trigger gesture manually
   */
  triggerGesture(gestureType: string, intensity: number = 1.0, duration: number = 1000): void {
    this.advancedFeaturesService.triggerGesture(gestureType, intensity, duration);
  }
  
  /**
   * Get current audio analysis data
   */
  getAudioAnalysis(): any {
    return this.audioProcessingService.getCurrentAudioFeatures();
  }
  
  /**
   * Get synchronization quality
   */
  getSyncQuality(): number {
    return this.synchronizationService.getSyncQuality();
  }
  
  /**
   * Calibrate audio-visual synchronization
   */
  async calibrateSync(): Promise<void> {
    await this.synchronizationService.calibrateSync();
  }
  
  // Private methods
  
  private async initializeServices(): Promise<void> {
    const config = this.config();
    
    // Create audio context
    const audioContext = new AudioContext();
    this._audioContext.set(audioContext);
    
    // Initialize all services
    await Promise.all([
      this.ttsService.initialize(config),
      this.audioProcessingService.initialize({
        frameSize: 2048,
        hopSize: 1024,
        latencyTarget: 20,
        qualityMode: 'balanced'
      }),
      this.lipSyncEngine.initialize({
        targetFrameRate: 60,
        lookAheadTime: 100,
        interpolation: 'cubic',
        smoothingWindow: 3,
        predictiveBlending: true,
        quality: {
          temporalResolution: 'high',
          spatialResolution: 'high',
          advancedFeatures: true,
          cpuUsageLimit: 80
        }
      }),
      this.synchronizationService.initialize(audioContext),
      this.advancedFeaturesService.initialize(config.features || {})
    ]);
    
    // Set viseme library
    if (config.lipSync.visemeLibrary) {
      this.visemeLibrary.setLibrary(config.lipSync.visemeLibrary);
    }
  }
  
  private setupEventListeners(): void {
    // TTS events
    this.subscriptions.add(
      this.ttsService.onSpeechEnd$.subscribe(() => {
        this._isPlaying.set(false);
        this.lipSyncEngine.stopAnimation();
        this.speechEnd.emit({ 
          text: this._currentText(), 
          timestamp: performance.now() 
        });
      })
    );
    
    this.subscriptions.add(
      this.ttsService.onSpeechError$.subscribe((event) => {
        this._isPlaying.set(false);
        this.speechError.emit(event.error);
      })
    );
    
    // Sync events
    this.subscriptions.add(
      this.synchronizationService.onSyncDrift$.subscribe((drift) => {
        console.log('Sync drift detected:', drift);
      })
    );
    
    // Advanced features events
    this.subscriptions.add(
      this.advancedFeaturesService.onEmotionDetected$.subscribe((emotion) => {
        this.emotionChange.emit({ 
          emotion: emotion.emotion, 
          intensity: emotion.intensity 
        });
      })
    );
  }
  
  private startProgressTracking(duration: number): void {
    const startTime = performance.now();
    const updateProgress = () => {
      if (!this._isPlaying()) return;
      
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      this._playbackProgress.set(progress);
      
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
  }
}

// Interface for avatar animation state
export interface AvatarAnimationState {
  mouthShape: MouthShape;
  viseme: string;
  emotion: { emotion: string; intensity: number; confidence: number };
  headPose: { pitch: number; yaw: number; roll: number };
  eyeState: {
    leftEyeOpenness: number;
    rightEyeOpenness: number;
    gazeDirection: { x: number; y: number };
    blinkState: string;
  };
  breathing: { phase: string; intensity: number; rate: number };
  gesture: any;
  timestamp: number;
}
