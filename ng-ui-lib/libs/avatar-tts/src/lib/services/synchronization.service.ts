import { Injectable, signal, computed, effect } from '@angular/core';
import { Observable, Subject, BehaviorSubject, interval, fromEvent } from 'rxjs';
import { map, filter, distinctUntilChanged, throttleTime } from 'rxjs/operators';
import {
  SynchronizationData,
  BufferStatus,
  LipSyncPerformanceMetrics
} from '../interfaces/lip-sync.interface';

/**
 * Advanced Audio-Visual Synchronization Service
 * Handles precise timing, latency compensation, and drift correction
 */
@Injectable({
  providedIn: 'root'
})
export class SynchronizationService {
  private readonly _isActive = signal(false);
  private readonly _audioOffset = signal(0);
  private readonly _videoOffset = signal(0);
  private readonly _masterClock = signal(0);
  private readonly _syncQuality = signal(1.0);
  private readonly _latencyMeasurement = signal(0);
  private readonly _bufferHealth = signal<BufferStatus>({
    audioBufferLevel: 0,
    videoBufferLevel: 0,
    underrunCount: 0,
    overrunCount: 0,
    targetBufferSize: 1024
  });
  
  // Computed signals
  readonly isActive = this._isActive.asReadonly();
  readonly audioOffset = this._audioOffset.asReadonly();
  readonly videoOffset = this._videoOffset.asReadonly();
  readonly masterClock = this._masterClock.asReadonly();
  readonly syncQuality = this._syncQuality.asReadonly();
  readonly latencyMeasurement = this._latencyMeasurement.asReadonly();
  readonly bufferHealth = this._bufferHealth.asReadonly();
  
  // Synchronization events
  private readonly syncDrift$ = new Subject<{ drift: number; correction: number }>();
  private readonly bufferUnderrun$ = new Subject<{ type: 'audio' | 'video'; timestamp: number }>();
  private readonly bufferOverrun$ = new Subject<{ type: 'audio' | 'video'; timestamp: number }>();
  private readonly latencyUpdate$ = new Subject<number>();
  private readonly qualityChange$ = new Subject<number>();
  
  // Public observables
  readonly onSyncDrift$ = this.syncDrift$.asObservable();
  readonly onBufferUnderrun$ = this.bufferUnderrun$.asObservable();
  readonly onBufferOverrun$ = this.bufferOverrun$.asObservable();
  readonly onLatencyUpdate$ = this.latencyUpdate$.asObservable();
  readonly onQualityChange$ = this.qualityChange$.asObservable();
  
  // Synchronization configuration
  private config = {
    targetLatency: 20, // 20ms target latency
    maxDrift: 40, // Maximum allowed drift before correction
    correctionFactor: 0.1, // Gentle correction factor
    bufferSize: 2048, // Audio buffer size
    lookaheadTime: 100, // Video lookahead time
    measurementInterval: 1000, // Latency measurement interval
    adaptiveSync: true, // Enable adaptive synchronization
    driftThreshold: 10 // Drift detection threshold
  };
  
  // Internal state
  private audioContext: AudioContext | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private clockReference: ClockReference | null = null;
  private latencyMeasurer: LatencyMeasurer | null = null;
  private driftDetector: DriftDetector | null = null;
  private bufferManager: BufferManager | null = null;
  
  // Performance tracking
  private performanceMetrics: SyncPerformanceMetrics = {
    avgLatency: 0,
    jitter: 0,
    driftCorrections: 0,
    qualityScore: 1.0,
    bufferUnderruns: 0,
    bufferOverruns: 0
  };
  
  constructor() {
    this.initializeClockReference();
    this.setupPerformanceMonitoring();
  }
  
  /**
   * Initialize synchronization system
   */
  async initialize(audioContext?: AudioContext, videoElement?: HTMLVideoElement): Promise<void> {
    try {
      this.audioContext = audioContext || new AudioContext();
      this.videoElement = videoElement || null;
      
      // Initialize sub-systems
      this.clockReference = new ClockReference();
      this.latencyMeasurer = new LatencyMeasurer(this.audioContext);
      this.driftDetector = new DriftDetector(this.config);
      this.bufferManager = new BufferManager(this.config);
      
      // Start performance monitoring
      await this.latencyMeasurer.startMeasurement();
      
      // Begin synchronization loop
      this.startSyncLoop();
      
      this._isActive.set(true);
    } catch (error) {
      console.error('Failed to initialize synchronization:', error);
      throw error;
    }
  }
  
  /**
   * Synchronize audio and video timestamps
   */
  synchronize(audioTimestamp: number, videoTimestamp: number): SynchronizationData {
    if (!this._isActive()) {
      throw new Error('Synchronization service not initialized');
    }
    
    const masterTime = this.getMasterTime();
    const audioOffset = this._audioOffset();
    const videoOffset = this._videoOffset();
    
    // Calculate adjusted timestamps
    const adjustedAudioTime = audioTimestamp + audioOffset;
    const adjustedVideoTime = videoTimestamp + videoOffset;
    
    // Calculate sync offset
    const syncOffset = adjustedAudioTime - adjustedVideoTime;
    
    // Detect and correct drift
    if (this.driftDetector) {
      const driftCorrection = this.driftDetector.detectDrift(syncOffset, masterTime);
      if (driftCorrection !== 0) {
        this.applySyncCorrection(driftCorrection);
        this.syncDrift$.next({ drift: syncOffset, correction: driftCorrection });
      }
    }
    
    // Update buffer status
    const bufferStatus = this.bufferManager?.getBufferStatus() || this._bufferHealth();
    this._bufferHealth.set(bufferStatus);
    
    return {
      audioTimestamp: adjustedAudioTime,
      videoTimestamp: adjustedVideoTime,
      syncOffset,
      driftCompensation: this.getDriftCompensation(),
      bufferStatus
    };
  }
  
  /**
   * Set audio timing offset
   */
  setAudioOffset(offset: number): void {
    this._audioOffset.set(offset);
    this.updateSyncQuality();
  }
  
  /**
   * Set video timing offset
   */
  setVideoOffset(offset: number): void {
    this._videoOffset.set(offset);
    this.updateSyncQuality();
  }
  
  /**
   * Measure current system latency
   */
  async measureLatency(): Promise<number> {
    if (!this.latencyMeasurer) {
      throw new Error('Latency measurer not initialized');
    }
    
    const latency = await this.latencyMeasurer.measure();
    this._latencyMeasurement.set(latency);
    this.latencyUpdate$.next(latency);
    
    // Adjust target latency based on measurement
    if (this.config.adaptiveSync) {
      this.adaptTargetLatency(latency);
    }
    
    return latency;
  }
  
  /**
   * Get current master time reference
   */
  getMasterTime(): number {
    return this.clockReference?.getCurrentTime() || performance.now();
  }
  
  /**
   * Calibrate synchronization using test signals
   */
  async calibrateSync(): Promise<{ audioLatency: number; videoLatency: number }> {
    if (!this.audioContext) {
      throw new Error('Audio context not available for calibration');
    }
    
    const calibrator = new SyncCalibrator(this.audioContext, this.videoElement);
    const results = await calibrator.performCalibration();
    
    // Apply calibration results
    this.setAudioOffset(-results.audioLatency);
    this.setVideoOffset(-results.videoLatency);
    
    return results;
  }
  
  /**
   * Enable/disable adaptive synchronization
   */
  setAdaptiveSync(enabled: boolean): void {
    this.config.adaptiveSync = enabled;
  }
  
  /**
   * Get current synchronization quality score
   */
  getSyncQuality(): number {
    return this._syncQuality();
  }
  
  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): SyncPerformanceMetrics {
    return { ...this.performanceMetrics };
  }
  
  /**
   * Stop synchronization
   */
  stop(): void {
    this._isActive.set(false);
    
    if (this.latencyMeasurer) {
      this.latencyMeasurer.stop();
    }
    
    this.stopSyncLoop();
  }
  
  // Private methods
  
  private initializeClockReference(): void {
    // Use high-resolution time for master clock
    if (typeof performance !== 'undefined' && performance.now) {
      this.clockReference = new PerformanceClockReference();
    } else {
      this.clockReference = new DateClockReference();
    }
  }
  
  private startSyncLoop(): void {
    const syncInterval = 16; // ~60fps
    
    const loop = () => {
      if (!this._isActive()) return;
      
      this.updateMasterClock();
      this.updatePerformanceMetrics();
      this.checkBufferHealth();
      
      setTimeout(loop, syncInterval);
    };
    
    loop();
  }
  
  private stopSyncLoop(): void {
    // Loop will stop automatically when _isActive becomes false
  }
  
  private updateMasterClock(): void {
    const currentTime = this.getMasterTime();
    this._masterClock.set(currentTime);
  }
  
  private applySyncCorrection(correction: number): void {
    const audioCorrection = correction * this.config.correctionFactor;
    const currentAudioOffset = this._audioOffset();
    this.setAudioOffset(currentAudioOffset + audioCorrection);
    
    this.performanceMetrics.driftCorrections++;
  }
  
  private getDriftCompensation(): number {
    return this.driftDetector?.getCurrentDrift() || 0;
  }
  
  private updateSyncQuality(): void {
    const audioOffset = Math.abs(this._audioOffset());
    const videoOffset = Math.abs(this._videoOffset());
    const latency = this._latencyMeasurement();
    
    // Calculate quality score (0.0 - 1.0)
    const offsetPenalty = Math.min(1, (audioOffset + videoOffset) / 100);
    const latencyPenalty = Math.min(1, Math.max(0, latency - this.config.targetLatency) / 100);
    
    const quality = Math.max(0, 1 - offsetPenalty - latencyPenalty);
    
    if (Math.abs(quality - this._syncQuality()) > 0.05) {
      this._syncQuality.set(quality);
      this.qualityChange$.next(quality);
    }
    
    this.performanceMetrics.qualityScore = quality;
  }
  
  private adaptTargetLatency(measuredLatency: number): void {
    const difference = measuredLatency - this.config.targetLatency;
    
    if (Math.abs(difference) > 10) {
      // Adjust target latency gradually
      this.config.targetLatency += difference * 0.1;
      this.config.targetLatency = Math.max(10, Math.min(100, this.config.targetLatency));
    }
  }
  
  private updatePerformanceMetrics(): void {
    const latency = this._latencyMeasurement();
    
    // Update average latency with exponential moving average
    this.performanceMetrics.avgLatency = this.performanceMetrics.avgLatency * 0.9 + latency * 0.1;
    
    // Calculate jitter
    const latencyDiff = Math.abs(latency - this.performanceMetrics.avgLatency);
    this.performanceMetrics.jitter = this.performanceMetrics.jitter * 0.9 + latencyDiff * 0.1;
  }
  
  private checkBufferHealth(): void {
    const bufferStatus = this._bufferHealth();
    
    // Check for buffer underruns
    if (bufferStatus.audioBufferLevel < bufferStatus.targetBufferSize * 0.1) {
      this.bufferUnderrun$.next({ type: 'audio', timestamp: this.getMasterTime() });
      this.performanceMetrics.bufferUnderruns++;
    }
    
    if (bufferStatus.videoBufferLevel < bufferStatus.targetBufferSize * 0.1) {
      this.bufferUnderrun$.next({ type: 'video', timestamp: this.getMasterTime() });
    }
    
    // Check for buffer overruns
    if (bufferStatus.audioBufferLevel > bufferStatus.targetBufferSize * 2) {
      this.bufferOverrun$.next({ type: 'audio', timestamp: this.getMasterTime() });
      this.performanceMetrics.bufferOverruns++;
    }
    
    if (bufferStatus.videoBufferLevel > bufferStatus.targetBufferSize * 2) {
      this.bufferOverrun$.next({ type: 'video', timestamp: this.getMasterTime() });
    }
  }
  
  private setupPerformanceMonitoring(): void {
    // Monitor performance metrics every second
    interval(1000).pipe(
      filter(() => this._isActive())
    ).subscribe(() => {
      this.measureLatency().catch(console.error);
    });
  }
}

/**
 * Clock Reference Implementations
 */
abstract class ClockReference {
  abstract getCurrentTime(): number;
}

class PerformanceClockReference extends ClockReference {
  private startTime = performance.now();
  
  getCurrentTime(): number {
    return performance.now() - this.startTime;
  }
}

class DateClockReference extends ClockReference {
  private startTime = Date.now();
  
  getCurrentTime(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Latency Measurement System
 */
class LatencyMeasurer {
  private isActive = false;
  private measurementHistory: number[] = [];
  
  constructor(private audioContext: AudioContext) {}
  
  async startMeasurement(): Promise<void> {
    this.isActive = true;
  }
  
  async measure(): Promise<number> {
    if (!this.isActive) return 0;
    
    // Measure audio context latency
    const audioLatency = this.audioContext.baseLatency + this.audioContext.outputLatency;
    
    // Add to measurement history
    this.measurementHistory.push(audioLatency * 1000); // Convert to ms
    if (this.measurementHistory.length > 10) {
      this.measurementHistory.shift();
    }
    
    // Return average latency
    return this.measurementHistory.reduce((sum, lat) => sum + lat, 0) / this.measurementHistory.length;
  }
  
  stop(): void {
    this.isActive = false;
  }
}

/**
 * Drift Detection and Correction
 */
class DriftDetector {
  private driftHistory: number[] = [];
  private lastCorrectionTime = 0;
  private currentDrift = 0;
  
  constructor(private config: any) {}
  
  detectDrift(syncOffset: number, timestamp: number): number {
    this.driftHistory.push(syncOffset);
    if (this.driftHistory.length > 10) {
      this.driftHistory.shift();
    }
    
    // Calculate average drift
    const avgDrift = this.driftHistory.reduce((sum, drift) => sum + drift, 0) / this.driftHistory.length;
    this.currentDrift = avgDrift;
    
    // Apply correction if drift exceeds threshold and enough time has passed
    const timeSinceLastCorrection = timestamp - this.lastCorrectionTime;
    if (Math.abs(avgDrift) > this.config.driftThreshold && timeSinceLastCorrection > 1000) {
      this.lastCorrectionTime = timestamp;
      return -avgDrift; // Return inverse correction
    }
    
    return 0;
  }
  
  getCurrentDrift(): number {
    return this.currentDrift;
  }
}

/**
 * Buffer Management
 */
class BufferManager {
  private audioBuffer: Float32Array[] = [];
  private videoBuffer: any[] = [];
  
  constructor(private config: any) {}
  
  getBufferStatus(): BufferStatus {
    return {
      audioBufferLevel: this.audioBuffer.length,
      videoBufferLevel: this.videoBuffer.length,
      underrunCount: 0,
      overrunCount: 0,
      targetBufferSize: this.config.bufferSize
    };
  }
  
  addAudioData(data: Float32Array): void {
    this.audioBuffer.push(data);
    
    // Maintain buffer size
    while (this.audioBuffer.length > this.config.bufferSize * 2) {
      this.audioBuffer.shift();
    }
  }
  
  addVideoFrame(frame: any): void {
    this.videoBuffer.push(frame);
    
    // Maintain buffer size
    while (this.videoBuffer.length > 60) { // ~1 second at 60fps
      this.videoBuffer.shift();
    }
  }
}

/**
 * Synchronization Calibration
 */
class SyncCalibrator {
  constructor(
    private audioContext: AudioContext,
    private videoElement: HTMLVideoElement | null
  ) {}
  
  async performCalibration(): Promise<{ audioLatency: number; videoLatency: number }> {
    // Generate calibration tone and measure roundtrip latency
    const audioLatency = await this.measureAudioLatency();
    const videoLatency = await this.measureVideoLatency();
    
    return {
      audioLatency,
      videoLatency
    };
  }
  
  private async measureAudioLatency(): Promise<number> {
    return new Promise((resolve) => {
      const startTime = this.audioContext.currentTime;
      
      // Generate a short tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, startTime);
      gainNode.gain.setValueAtTime(0.1, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
      
      oscillator.onended = () => {
        const endTime = this.audioContext.currentTime;
        const latency = (endTime - startTime - 0.1) * 1000; // Convert to ms
        resolve(Math.max(0, latency));
      };
    });
  }
  
  private async measureVideoLatency(): Promise<number> {
    if (!this.videoElement) {
      return 0; // No video element available
    }
    
    // Simple video latency estimation
    // In a real implementation, this would involve frame timing analysis
    return 16.67; // Assume one frame at 60fps
  }
}

/**
 * Performance Metrics Interface
 */
interface SyncPerformanceMetrics {
  avgLatency: number;
  jitter: number;
  driftCorrections: number;
  qualityScore: number;
  bufferUnderruns: number;
  bufferOverruns: number;
}