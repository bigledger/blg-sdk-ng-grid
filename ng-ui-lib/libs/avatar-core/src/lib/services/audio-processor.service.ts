import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, BehaviorSubject, interval } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

import { AudioStreamConfig } from '../interfaces/stream-config.interface';
import { AvatarStateService } from './avatar-state.service';

/**
 * Audio processing states
 */
type AudioProcessingState = 'idle' | 'processing' | 'playing' | 'error';

/**
 * Audio buffer information
 */
interface AudioBufferInfo {
  buffer: AudioBuffer;
  startTime: number;
  duration: number;
  sampleRate: number;
  channels: number;
  metadata?: any;
}

/**
 * Audio processing context
 */
interface AudioProcessingContext {
  avatarId: string;
  audioContext: AudioContext;
  sourceNodes: AudioBufferSourceNode[];
  gainNode: GainNode;
  analyserNode: AnalyserNode;
  currentBuffer: AudioBufferInfo | null;
  bufferQueue: AudioBufferInfo[];
  state: AudioProcessingState;
  volume: number;
  muted: boolean;
  config: AudioStreamConfig;
}

/**
 * Lip sync data point
 */
interface LipSyncData {
  time: number;
  amplitude: number;
  frequency: number;
  phoneme?: string;
  viseme?: string;
}

/**
 * Audio analysis results
 */
interface AudioAnalysis {
  amplitude: number;
  frequency: number;
  spectrumData: Uint8Array;
  waveformData: Uint8Array;
  lipSyncData: LipSyncData[];
  duration: number;
  sampleRate: number;
}

/**
 * Audio processing service for avatar speech and sound effects.
 * Handles audio streaming, buffering, analysis, and lip synchronization.
 */
@Injectable({
  providedIn: 'root'
})
export class AudioProcessorService {
  private destroyRef = inject(DestroyRef);
  private avatarStateService = inject(AvatarStateService);

  // Core signals
  private _processingContexts = signal<Map<string, AudioProcessingContext>>(new Map());
  private _globalAudioConfig = signal<AudioStreamConfig | null>(null);
  private _masterVolume = signal<number>(1.0);
  private _masterMuted = signal<boolean>(false);

  // Processing state signals
  private _activeProcessors = signal<Set<string>>(new Set());
  private _processingQueue = signal<Map<string, AudioBufferInfo[]>>(new Map());
  private _currentAnalysis = signal<Map<string, AudioAnalysis>>(new Map());

  // Event subjects
  private audioProcessingStarted$ = new Subject<{ avatarId: string; buffer: AudioBufferInfo }>();
  private audioProcessingCompleted$ = new Subject<{ avatarId: string; duration: number }>();
  private audioAnalysisCompleted$ = new Subject<{ avatarId: string; analysis: AudioAnalysis }>();
  private lipSyncDataGenerated$ = new Subject<{ avatarId: string; lipSyncData: LipSyncData[] }>();
  private audioError$ = new Subject<{ avatarId: string; error: any }>();

  // Computed signals
  readonly processingContexts = this._processingContexts.asReadonly();
  readonly globalAudioConfig = this._globalAudioConfig.asReadonly();
  readonly masterVolume = this._masterVolume.asReadonly();
  readonly masterMuted = this._masterMuted.asReadonly();

  readonly isProcessingAny = computed(() => {
    return this._activeProcessors().size > 0;
  });

  readonly totalQueueLength = computed(() => {
    return Array.from(this._processingQueue().values())
      .reduce((total, queue) => total + queue.length, 0);
  });

  // Public observables
  readonly audioProcessingStarted = this.audioProcessingStarted$.asObservable();
  readonly audioProcessingCompleted = this.audioProcessingCompleted$.asObservable();
  readonly audioAnalysisCompleted = this.audioAnalysisCompleted$.asObservable();
  readonly lipSyncDataGenerated = this.lipSyncDataGenerated$.asObservable();
  readonly audioError = this.audioError$.asObservable();

  constructor() {
    this.initializeAudioSystem();
    this.setupErrorHandling();
  }

  /**
   * Set global audio configuration
   */
  setGlobalAudioConfig(config: AudioStreamConfig): void {
    this._globalAudioConfig.set(config);
  }

  /**
   * Initialize audio processing for an avatar
   */
  async initializeAvatarAudio(
    avatarId: string, 
    config?: Partial<AudioStreamConfig>
  ): Promise<void> {
    if (this._processingContexts().has(avatarId)) {
      return; // Already initialized
    }

    const globalConfig = this._globalAudioConfig();
    if (!globalConfig && !config) {
      throw new Error('No audio configuration available');
    }

    const audioConfig = config ? { ...globalConfig, ...config } as AudioStreamConfig : globalConfig!;

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: audioConfig.sampleRate,
        latencyHint: audioConfig.targetLatency / 1000 // Convert to seconds
      });

      // Create audio nodes
      const gainNode = audioContext.createGain();
      const analyserNode = audioContext.createAnalyser();

      // Configure analyser
      analyserNode.fftSize = 2048;
      analyserNode.smoothingTimeConstant = 0.8;

      // Connect nodes
      gainNode.connect(analyserNode);
      analyserNode.connect(audioContext.destination);

      // Create processing context
      const processingContext: AudioProcessingContext = {
        avatarId,
        audioContext,
        sourceNodes: [],
        gainNode,
        analyserNode,
        currentBuffer: null,
        bufferQueue: [],
        state: 'idle',
        volume: 1.0,
        muted: false,
        config: audioConfig
      };

      this._processingContexts.update(contexts => {
        const newContexts = new Map(contexts);
        newContexts.set(avatarId, processingContext);
        return newContexts;
      });

      this._processingQueue.update(queues => {
        const newQueues = new Map(queues);
        newQueues.set(avatarId, []);
        return newQueues;
      });

      // Update avatar audio state
      this.avatarStateService.updateAudioState(avatarId, {
        volume: 1.0,
        muted: false,
        queueLength: 0
      });

    } catch (error) {
      console.error(`Failed to initialize audio for avatar ${avatarId}:`, error);
      this.audioError$.next({ avatarId, error });
      throw error;
    }
  }

  /**
   * Process audio data (from ArrayBuffer)
   */
  async processAudioData(
    avatarId: string, 
    audioData: ArrayBuffer, 
    metadata?: any
  ): Promise<void> {
    const context = this._processingContexts().get(avatarId);
    
    if (!context) {
      throw new Error(`Audio context not initialized for avatar: ${avatarId}`);
    }

    try {
      // Decode audio data
      const audioBuffer = await context.audioContext.decodeAudioData(audioData.slice(0));
      
      const bufferInfo: AudioBufferInfo = {
        buffer: audioBuffer,
        startTime: Date.now(),
        duration: audioBuffer.duration * 1000, // Convert to milliseconds
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
        metadata
      };

      // Add to processing queue
      this._processingQueue.update(queues => {
        const newQueues = new Map(queues);
        const avatarQueue = newQueues.get(avatarId) || [];
        newQueues.set(avatarId, [...avatarQueue, bufferInfo]);
        return newQueues;
      });

      // Update avatar audio state
      this.avatarStateService.updateAudioState(avatarId, {
        queueLength: this._processingQueue().get(avatarId)?.length || 0
      });

      // Start processing if not already active
      if (!this._activeProcessors().has(avatarId)) {
        this.startAudioProcessing(avatarId);
      }

    } catch (error) {
      console.error(`Failed to process audio data for avatar ${avatarId}:`, error);
      this.audioError$.next({ avatarId, error });
      throw error;
    }
  }

  /**
   * Process audio from URL
   */
  async processAudioFromUrl(avatarId: string, url: string, metadata?: any): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      await this.processAudioData(avatarId, arrayBuffer, { ...metadata, source: 'url', url });
    } catch (error) {
      console.error(`Failed to load audio from URL for avatar ${avatarId}:`, error);
      this.audioError$.next({ avatarId, error });
      throw error;
    }
  }

  /**
   * Set avatar volume
   */
  setAvatarVolume(avatarId: string, volume: number): void {
    const context = this._processingContexts().get(avatarId);
    
    if (!context) return;

    volume = Math.max(0, Math.min(1, volume));
    context.volume = volume;
    context.gainNode.gain.value = volume * this._masterVolume();

    this.avatarStateService.updateAudioState(avatarId, { volume });
  }

  /**
   * Mute/unmute avatar
   */
  setAvatarMuted(avatarId: string, muted: boolean): void {
    const context = this._processingContexts().get(avatarId);
    
    if (!context) return;

    context.muted = muted;
    context.gainNode.gain.value = muted ? 0 : context.volume * this._masterVolume();

    this.avatarStateService.updateAudioState(avatarId, { muted });
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    volume = Math.max(0, Math.min(1, volume));
    this._masterVolume.set(volume);

    // Update all avatar volumes
    this._processingContexts().forEach((context, avatarId) => {
      if (!context.muted) {
        context.gainNode.gain.value = context.volume * volume;
      }
    });
  }

  /**
   * Set master mute
   */
  setMasterMuted(muted: boolean): void {
    this._masterMuted.set(muted);

    // Update all avatar volumes
    this._processingContexts().forEach((context, avatarId) => {
      context.gainNode.gain.value = muted ? 0 : context.volume * this._masterVolume();
    });
  }

  /**
   * Stop audio for avatar
   */
  stopAudio(avatarId: string): void {
    const context = this._processingContexts().get(avatarId);
    
    if (!context) return;

    // Stop all source nodes
    context.sourceNodes.forEach(node => {
      try {
        node.stop();
      } catch (error) {
        // Ignore errors for already stopped nodes
      }
    });

    context.sourceNodes = [];
    context.currentBuffer = null;
    context.state = 'idle';

    // Clear queue
    this._processingQueue.update(queues => {
      const newQueues = new Map(queues);
      newQueues.set(avatarId, []);
      return newQueues;
    });

    this._activeProcessors.update(processors => {
      const newProcessors = new Set(processors);
      newProcessors.delete(avatarId);
      return newProcessors;
    });

    // Update avatar state
    this.avatarStateService.updateAudioState(avatarId, {
      isPlaying: false,
      currentTime: 0,
      queueLength: 0
    });
  }

  /**
   * Pause audio for avatar
   */
  pauseAudio(avatarId: string): void {
    const context = this._processingContexts().get(avatarId);
    
    if (!context || context.state !== 'playing') return;

    // Pause by stopping current nodes (Web Audio doesn't have pause)
    context.sourceNodes.forEach(node => {
      try {
        node.stop();
      } catch (error) {
        // Ignore errors
      }
    });

    context.sourceNodes = [];
    context.state = 'idle';

    this.avatarStateService.updateAudioState(avatarId, {
      isPlaying: false
    });
  }

  /**
   * Get current audio analysis for avatar
   */
  getCurrentAudioAnalysis(avatarId: string): AudioAnalysis | null {
    return this._currentAnalysis().get(avatarId) || null;
  }

  /**
   * Get real-time spectrum data
   */
  getSpectrumData(avatarId: string): Uint8Array | null {
    const context = this._processingContexts().get(avatarId);
    
    if (!context) return null;

    const spectrumData = new Uint8Array(context.analyserNode.frequencyBinCount);
    context.analyserNode.getByteFrequencyData(spectrumData);
    
    return spectrumData;
  }

  /**
   * Get real-time waveform data
   */
  getWaveformData(avatarId: string): Uint8Array | null {
    const context = this._processingContexts().get(avatarId);
    
    if (!context) return null;

    const waveformData = new Uint8Array(context.analyserNode.frequencyBinCount);
    context.analyserNode.getByteTimeDomainData(waveformData);
    
    return waveformData;
  }

  /**
   * Dispose audio context for avatar
   */
  disposeAvatarAudio(avatarId: string): void {
    const context = this._processingContexts().get(avatarId);
    
    if (!context) return;

    // Stop all audio
    this.stopAudio(avatarId);

    // Close audio context
    context.audioContext.close();

    // Remove from maps
    this._processingContexts.update(contexts => {
      const newContexts = new Map(contexts);
      newContexts.delete(avatarId);
      return newContexts;
    });

    this._processingQueue.update(queues => {
      const newQueues = new Map(queues);
      newQueues.delete(avatarId);
      return newQueues;
    });

    this._currentAnalysis.update(analyses => {
      const newAnalyses = new Map(analyses);
      newAnalyses.delete(avatarId);
      return newAnalyses;
    });
  }

  /**
   * Start audio processing for avatar
   */
  private async startAudioProcessing(avatarId: string): Promise<void> {
    const context = this._processingContexts().get(avatarId);
    const queue = this._processingQueue().get(avatarId);
    
    if (!context || !queue || queue.length === 0) return;

    this._activeProcessors.update(processors => {
      const newProcessors = new Set(processors);
      newProcessors.add(avatarId);
      return newProcessors;
    });

    while (queue.length > 0) {
      const bufferInfo = queue.shift()!;
      
      // Update queue
      this._processingQueue.update(queues => {
        const newQueues = new Map(queues);
        newQueues.set(avatarId, [...queue]);
        return newQueues;
      });

      await this.playAudioBuffer(avatarId, bufferInfo);
    }

    this._activeProcessors.update(processors => {
      const newProcessors = new Set(processors);
      newProcessors.delete(avatarId);
      return newProcessors;
    });
  }

  /**
   * Play audio buffer
   */
  private async playAudioBuffer(avatarId: string, bufferInfo: AudioBufferInfo): Promise<void> {
    const context = this._processingContexts().get(avatarId);
    
    if (!context) return;

    try {
      context.state = 'processing';
      context.currentBuffer = bufferInfo;

      this.audioProcessingStarted$.next({ avatarId, buffer: bufferInfo });

      // Analyze audio for lip sync
      const analysis = await this.analyzeAudioBuffer(bufferInfo.buffer);
      const lipSyncData = this.generateLipSyncData(analysis);

      // Store analysis
      this._currentAnalysis.update(analyses => {
        const newAnalyses = new Map(analyses);
        newAnalyses.set(avatarId, analysis);
        return newAnalyses;
      });

      // Emit analysis events
      this.audioAnalysisCompleted$.next({ avatarId, analysis });
      this.lipSyncDataGenerated$.next({ avatarId, lipSyncData });

      // Create and play audio
      const sourceNode = context.audioContext.createBufferSource();
      sourceNode.buffer = bufferInfo.buffer;
      sourceNode.connect(context.gainNode);

      // Add to active nodes
      context.sourceNodes.push(sourceNode);
      context.state = 'playing';

      // Update avatar state
      this.avatarStateService.updateAudioState(avatarId, {
        isPlaying: true,
        currentTime: 0,
        duration: bufferInfo.duration,
        queueLength: this._processingQueue().get(avatarId)?.length || 0
      });

      // Play audio
      sourceNode.start();

      // Wait for audio to complete
      await new Promise<void>((resolve) => {
        sourceNode.onended = () => {
          // Remove from active nodes
          const index = context.sourceNodes.indexOf(sourceNode);
          if (index > -1) {
            context.sourceNodes.splice(index, 1);
          }

          context.currentBuffer = null;
          context.state = context.sourceNodes.length > 0 ? 'playing' : 'idle';

          // Update avatar state
          this.avatarStateService.updateAudioState(avatarId, {
            isPlaying: context.sourceNodes.length > 0,
            currentTime: 0
          });

          this.audioProcessingCompleted$.next({ 
            avatarId, 
            duration: bufferInfo.duration 
          });

          resolve();
        };
      });

    } catch (error) {
      console.error(`Failed to play audio buffer for avatar ${avatarId}:`, error);
      context.state = 'error';
      this.audioError$.next({ avatarId, error });
    }
  }

  /**
   * Analyze audio buffer
   */
  private async analyzeAudioBuffer(audioBuffer: AudioBuffer): Promise<AudioAnalysis> {
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration * 1000; // Convert to milliseconds

    // Create offline context for analysis
    const offlineContext = new OfflineAudioContext(
      1, 
      audioBuffer.length, 
      sampleRate
    );

    const sourceNode = offlineContext.createBufferSource();
    const analyserNode = offlineContext.createAnalyser();
    
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.8;

    sourceNode.buffer = audioBuffer;
    sourceNode.connect(analyserNode);
    analyserNode.connect(offlineContext.destination);

    sourceNode.start();

    // Render offline context
    await offlineContext.startRendering();

    // Get frequency and time domain data
    const spectrumData = new Uint8Array(analyserNode.frequencyBinCount);
    const waveformData = new Uint8Array(analyserNode.frequencyBinCount);
    
    analyserNode.getByteFrequencyData(spectrumData);
    analyserNode.getByteTimeDomainData(waveformData);

    // Calculate amplitude and frequency
    const amplitude = this.calculateRMSAmplitude(channelData);
    const frequency = this.calculateDominantFrequency(spectrumData, sampleRate);

    // Generate lip sync data points
    const lipSyncData = this.generateLipSyncDataPoints(channelData, sampleRate);

    return {
      amplitude,
      frequency,
      spectrumData,
      waveformData,
      lipSyncData,
      duration,
      sampleRate
    };
  }

  /**
   * Generate lip sync data from audio analysis
   */
  private generateLipSyncData(analysis: AudioAnalysis): LipSyncData[] {
    return analysis.lipSyncData;
  }

  /**
   * Generate lip sync data points from audio
   */
  private generateLipSyncDataPoints(channelData: Float32Array, sampleRate: number): LipSyncData[] {
    const lipSyncData: LipSyncData[] = [];
    const windowSize = Math.floor(sampleRate * 0.02); // 20ms windows
    const stepSize = Math.floor(windowSize / 2); // 50% overlap

    for (let i = 0; i < channelData.length - windowSize; i += stepSize) {
      const windowData = channelData.slice(i, i + windowSize);
      const time = (i / sampleRate) * 1000; // Convert to milliseconds
      
      const amplitude = this.calculateRMSAmplitude(windowData);
      const frequency = this.estimateFrequency(windowData, sampleRate);
      
      // Simple phoneme estimation based on frequency and amplitude
      const phoneme = this.estimatePhoneme(frequency, amplitude);
      const viseme = this.mapPhonemeToViseme(phoneme);

      lipSyncData.push({
        time,
        amplitude,
        frequency,
        phoneme,
        viseme
      });
    }

    return lipSyncData;
  }

  /**
   * Calculate RMS amplitude
   */
  private calculateRMSAmplitude(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  /**
   * Calculate dominant frequency
   */
  private calculateDominantFrequency(spectrumData: Uint8Array, sampleRate: number): number {
    let maxAmplitude = 0;
    let maxIndex = 0;

    for (let i = 0; i < spectrumData.length; i++) {
      if (spectrumData[i] > maxAmplitude) {
        maxAmplitude = spectrumData[i];
        maxIndex = i;
      }
    }

    return (maxIndex * sampleRate) / (spectrumData.length * 2);
  }

  /**
   * Estimate frequency using zero crossing rate
   */
  private estimateFrequency(data: Float32Array, sampleRate: number): number {
    let crossings = 0;
    
    for (let i = 1; i < data.length; i++) {
      if ((data[i] >= 0) !== (data[i - 1] >= 0)) {
        crossings++;
      }
    }

    return (crossings / 2) / (data.length / sampleRate);
  }

  /**
   * Estimate phoneme from frequency and amplitude
   */
  private estimatePhoneme(frequency: number, amplitude: number): string {
    // Simplified phoneme estimation
    if (amplitude < 0.01) return 'silence';
    if (frequency < 300) return 'vowel_low';
    if (frequency < 800) return 'vowel_mid';
    if (frequency < 2000) return 'vowel_high';
    return 'consonant';
  }

  /**
   * Map phoneme to viseme for lip sync
   */
  private mapPhonemeToViseme(phoneme: string): string {
    const phonemeToViseme: Record<string, string> = {
      'silence': 'closed',
      'vowel_low': 'open_wide',
      'vowel_mid': 'open_mid',
      'vowel_high': 'open_narrow',
      'consonant': 'closed'
    };

    return phonemeToViseme[phoneme] || 'closed';
  }

  /**
   * Initialize audio system
   */
  private initializeAudioSystem(): void {
    // Monitor audio contexts every second
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateAudioMetrics();
      });
  }

  /**
   * Update audio processing metrics
   */
  private updateAudioMetrics(): void {
    this._processingContexts().forEach((context, avatarId) => {
      if (context.state === 'playing' && context.currentBuffer) {
        const currentTime = context.audioContext.currentTime * 1000; // Convert to milliseconds
        const startTime = context.currentBuffer.startTime;
        const progress = Math.min(1, (Date.now() - startTime) / context.currentBuffer.duration);

        this.avatarStateService.updateAudioState(avatarId, {
          currentTime: progress * context.currentBuffer.duration
        });
      }
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.audioError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ avatarId, error }) => {
        this.avatarStateService.handleError(avatarId, error);
      });
  }
}