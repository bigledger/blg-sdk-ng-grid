import { Injectable, signal, computed } from '@angular/core';
import { Observable, Subject, BehaviorSubject, interval } from 'rxjs';
import { map, filter, takeWhile } from 'rxjs/operators';
import {
  LipSyncTimelineEntry,
  LipSyncEngineConfig,
  SynchronizationData,
  LipSyncPerformanceMetrics,
  LipSyncEvents,
  VisemeLibraryDefinition,
  MouthShape,
  CoarticulationData,
  EmotionInfluence
} from '../interfaces/lip-sync.interface';
import { PhonemeAnalysisResult } from '../interfaces/audio-processing.interface';

/**
 * Advanced Lip Sync Engine
 * Handles phoneme-to-viseme mapping, timing extraction, and real-time synchronization
 */
@Injectable({
  providedIn: 'root'
})
export class LipSyncEngineService implements LipSyncEvents {
  private readonly _isInitialized = signal(false);
  private readonly _isActive = signal(false);
  private readonly _currentViseme = signal<string>('neutral');
  private readonly _visemeLibrary = signal<VisemeLibraryDefinition | null>(null);
  private readonly _timeline = signal<LipSyncTimelineEntry[]>([]);
  private readonly _currentTime = signal(0);
  private readonly _syncOffset = signal(0);
  
  // Computed signals
  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isActive = this._isActive.asReadonly();
  readonly currentViseme = this._currentViseme.asReadonly();
  readonly visemeLibrary = this._visemeLibrary.asReadonly();
  readonly timeline = this._timeline.asReadonly();
  readonly currentTime = this._currentTime.asReadonly();
  readonly syncOffset = this._syncOffset.asReadonly();
  
  // Current mouth shape (computed from active visemes)
  readonly currentMouthShape = computed(() => {
    const timeline = this._timeline();
    const currentTime = this._currentTime();
    const activeEntries = this.getActiveTimelineEntries(timeline, currentTime);
    return this.blendMouthShapes(activeEntries);
  });
  
  // Event subjects
  private readonly timelineEntryStart$ = new Subject<LipSyncTimelineEntry>();
  private readonly timelineEntryEnd$ = new Subject<LipSyncTimelineEntry>();
  private readonly visemeChange$ = new Subject<{ from: string; to: string; blend: number }>();
  private readonly syncDrift$ = new Subject<number>();
  private readonly performanceWarning$ = new Subject<LipSyncPerformanceMetrics>();
  private readonly error$ = new Subject<Error>();
  
  // Public observables
  readonly onTimelineEntryStart$ = this.timelineEntryStart$.asObservable();
  readonly onTimelineEntryEnd$ = this.timelineEntryEnd$.asObservable();
  readonly onVisemeChange$ = this.visemeChange$.asObservable();
  readonly onSyncDrift$ = this.syncDrift$.asObservable();
  readonly onPerformanceWarning$ = this.performanceWarning$.asObservable();
  readonly onError$ = this.error$.asObservable();
  
  // Configuration
  private config: LipSyncEngineConfig = {
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
  };
  
  // Engine state
  private animationFrame: number | null = null;
  private lastUpdateTime = 0;
  private performanceMetrics: LipSyncPerformanceMetrics = {
    frameProcessingTime: 0,
    syncAccuracy: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    droppedFrames: 0,
    qualityScore: 1.0
  };
  
  // Phoneme to viseme mapping
  private phonemeToVisemeMap = new Map<string, string>();
  
  // Co-articulation engine
  private coarticulationEngine: CoarticulationEngine | null = null;
  
  // Emotion processor
  private emotionProcessor: EmotionProcessor | null = null;
  
  constructor() {
    this.initializePhonemeMapping();
  }
  
  /**
   * Initialize the lip sync engine
   */
  async initialize(config?: Partial<LipSyncEngineConfig>): Promise<void> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }
      
      // Load default viseme library
      const defaultLibrary = this.createPrestonBlairLibrary();
      this._visemeLibrary.set(defaultLibrary);
      
      // Initialize co-articulation engine
      this.coarticulationEngine = new CoarticulationEngine();
      
      // Initialize emotion processor
      this.emotionProcessor = new EmotionProcessor();
      
      this._isInitialized.set(true);
    } catch (error) {
      console.error('Failed to initialize lip sync engine:', error);
      throw error;
    }
  }
  
  /**
   * Generate lip sync timeline from phoneme analysis
   */
  async generateTimeline(phonemes: PhonemeAnalysisResult[], audioLength: number): Promise<LipSyncTimelineEntry[]> {
    if (!this._isInitialized()) {
      throw new Error('Lip sync engine not initialized');
    }
    
    const timeline: LipSyncTimelineEntry[] = [];
    
    for (let i = 0; i < phonemes.length; i++) {
      const phoneme = phonemes[i];
      const viseme = this.phonemeToVisemeMap.get(phoneme.phoneme) || 'neutral';
      
      // Calculate co-articulation data
      const coarticulation = this.coarticulationEngine?.calculateCoarticulation(
        phonemes,
        i,
        this.config.lookAheadTime
      ) || null;
      
      // Create timeline entry
      const entry: LipSyncTimelineEntry = {
        startTime: phoneme.startTime,
        endTime: phoneme.startTime + phoneme.duration,
        viseme,
        weight: phoneme.intensity,
        phoneme: {
          symbol: phoneme.phoneme,
          ipa: phoneme.phoneme, // Simplified - would need proper IPA mapping
          category: this.getPhonemeCategory(phoneme.phoneme),
          features: this.getArticulationFeatures(phoneme.phoneme),
          duration: phoneme.duration,
          intensity: phoneme.intensity
        },
        coarticulation: coarticulation || undefined
      };
      
      timeline.push(entry);
    }
    
    // Add silence entries for gaps
    this.fillSilenceGaps(timeline, audioLength);
    
    // Optimize timeline for smooth playback
    this.optimizeTimeline(timeline);
    
    this._timeline.set(timeline);
    return timeline;
  }
  
  /**
   * Generate timeline from text analysis (when audio processing is not available)
   */
  async generateTimelineFromText(text: string, estimatedDuration: number): Promise<LipSyncTimelineEntry[]> {
    const phonemes = this.textToPhonemes(text);
    const timeline: LipSyncTimelineEntry[] = [];
    
    const avgPhonemeLength = estimatedDuration / phonemes.length;
    
    phonemes.forEach((phoneme, index) => {
      const startTime = index * avgPhonemeLength;
      const endTime = (index + 1) * avgPhonemeLength;
      const viseme = this.phonemeToVisemeMap.get(phoneme) || 'neutral';
      
      timeline.push({
        startTime,
        endTime,
        viseme,
        weight: 1.0,
        phoneme: {
          symbol: phoneme,
          ipa: phoneme,
          category: this.getPhonemeCategory(phoneme),
          features: this.getArticulationFeatures(phoneme),
          duration: avgPhonemeLength,
          intensity: 1.0
        }
      });
    });
    
    this._timeline.set(timeline);
    return timeline;
  }
  
  /**
   * Start real-time lip sync animation
   */
  startAnimation(startTime: number = performance.now()): void {
    if (!this._isInitialized()) {
      throw new Error('Lip sync engine not initialized');
    }
    
    this._isActive.set(true);
    this.lastUpdateTime = startTime;
    
    const animate = (currentTime: number) => {
      if (!this._isActive()) return;
      
      const deltaTime = currentTime - this.lastUpdateTime;
      this.updateAnimation(currentTime, deltaTime);
      this.lastUpdateTime = currentTime;
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  /**
   * Stop lip sync animation
   */
  stopAnimation(): void {
    this._isActive.set(false);
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    this._currentViseme.set('neutral');
    this._currentTime.set(0);
  }
  
  /**
   * Set current playback time (for synchronization)
   */
  setCurrentTime(time: number): void {
    this._currentTime.set(time);
  }
  
  /**
   * Apply emotion influence to current mouth shape
   */
  applyEmotionInfluence(emotion: string, intensity: number): void {
    if (!this.emotionProcessor) return;
    
    const influence = this.emotionProcessor.processEmotion(emotion, intensity);
    // Emotion influence would be applied in the mouth shape computation
  }
  
  /**
   * Set synchronization offset for drift correction
   */
  setSyncOffset(offset: number): void {
    this._syncOffset.set(offset);
    
    if (Math.abs(offset) > 50) { // 50ms threshold
      this.syncDrift$.next(offset);
    }
  }
  
  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): LipSyncPerformanceMetrics {
    return { ...this.performanceMetrics };
  }
  
  // Event handler implementations
  onTimelineEntryStart = (entry: LipSyncTimelineEntry) => {
    this.timelineEntryStart$.next(entry);
  };
  
  onTimelineEntryEnd = (entry: LipSyncTimelineEntry) => {
    this.timelineEntryEnd$.next(entry);
  };
  
  onVisemeChange = (from: string, to: string, blend: number) => {
    this.visemeChange$.next({ from, to, blend });
  };
  
  onSyncDrift = (drift: number) => {
    this.syncDrift$.next(drift);
  };
  
  onPerformanceWarning = (metrics: LipSyncPerformanceMetrics) => {
    this.performanceWarning$.next(metrics);
  };
  
  onError = (error: Error) => {
    this.error$.next(error);
  };
  
  // Private methods
  
  private updateAnimation(currentTime: number, deltaTime: number): void {
    const startTime = performance.now();
    
    // Update current time with sync offset
    const adjustedTime = currentTime + this._syncOffset();
    this._currentTime.set(adjustedTime);
    
    // Get current timeline entries
    const timeline = this._timeline();
    const activeEntries = this.getActiveTimelineEntries(timeline, adjustedTime);
    
    // Process timeline entries
    activeEntries.forEach(entry => {
      if (!entry.processed) {
        this.onTimelineEntryStart(entry);
        entry.processed = true;
      }
    });
    
    // Update current viseme
    const primaryViseme = this.getPrimaryViseme(activeEntries);
    if (primaryViseme !== this._currentViseme()) {
      const oldViseme = this._currentViseme();
      this._currentViseme.set(primaryViseme);
      this.onVisemeChange(oldViseme, primaryViseme, 1.0);
    }
    
    // Update performance metrics
    const processingTime = performance.now() - startTime;
    this.updatePerformanceMetrics(processingTime, deltaTime);
    
    // Check for performance issues
    if (processingTime > 16.67) { // 60fps threshold
      this.performanceMetrics.droppedFrames++;
      if (this.performanceMetrics.droppedFrames % 10 === 0) {
        this.onPerformanceWarning(this.performanceMetrics);
      }
    }
  }
  
  private getActiveTimelineEntries(timeline: LipSyncTimelineEntry[], currentTime: number): LipSyncTimelineEntry[] {
    return timeline.filter(entry => 
      currentTime >= entry.startTime && currentTime <= entry.endTime
    );
  }
  
  private getPrimaryViseme(activeEntries: LipSyncTimelineEntry[]): string {
    if (activeEntries.length === 0) return 'neutral';
    if (activeEntries.length === 1) return activeEntries[0].viseme;
    
    // Find the entry with highest weight
    return activeEntries.reduce((prev, current) => 
      (current.weight > prev.weight) ? current : prev
    ).viseme;
  }
  
  private blendMouthShapes(activeEntries: LipSyncTimelineEntry[]): MouthShape {
    if (activeEntries.length === 0) {
      return this.getNeutralMouthShape();
    }
    
    if (activeEntries.length === 1) {
      return this.getVisemeMouthShape(activeEntries[0].viseme);
    }
    
    // Blend multiple active visemes
    const blendedShape = this.getNeutralMouthShape();
    let totalWeight = 0;
    
    activeEntries.forEach(entry => {
      const shape = this.getVisemeMouthShape(entry.viseme);
      const weight = entry.weight;
      totalWeight += weight;
      
      // Weighted blending
      blendedShape.jawOpen += shape.jawOpen * weight;
      blendedShape.lipWidth += shape.lipWidth * weight;
      blendedShape.lipHeight += shape.lipHeight * weight;
      blendedShape.lipProtrusion += shape.lipProtrusion * weight;
      blendedShape.upperLipRaise += shape.upperLipRaise * weight;
      blendedShape.lowerLipDepress += shape.lowerLipDepress * weight;
      blendedShape.cornerLipPull += shape.cornerLipPull * weight;
      blendedShape.tonguePosition += shape.tonguePosition * weight;
      blendedShape.teethVisibility += shape.teethVisibility * weight;
    });
    
    // Normalize by total weight
    if (totalWeight > 0) {
      blendedShape.jawOpen /= totalWeight;
      blendedShape.lipWidth /= totalWeight;
      blendedShape.lipHeight /= totalWeight;
      blendedShape.lipProtrusion /= totalWeight;
      blendedShape.upperLipRaise /= totalWeight;
      blendedShape.lowerLipDepress /= totalWeight;
      blendedShape.cornerLipPull /= totalWeight;
      blendedShape.tonguePosition /= totalWeight;
      blendedShape.teethVisibility /= totalWeight;
    }
    
    return blendedShape;
  }
  
  private initializePhonemeMapping(): void {
    // Preston Blair viseme system mapping
    const mappings = [
      // Vowels
      { phonemes: ['AA', 'AH', 'AO'], viseme: 'aa' },
      { phonemes: ['AE', 'EH'], viseme: 'ae' },
      { phonemes: ['ER', 'AX'], viseme: 'er' },
      { phonemes: ['IY', 'EY'], viseme: 'ee' },
      { phonemes: ['IH', 'IX'], viseme: 'ih' },
      { phonemes: ['OW', 'OY'], viseme: 'oh' },
      { phonemes: ['UW', 'UH'], viseme: 'oo' },
      
      // Consonants
      { phonemes: ['B', 'P', 'M'], viseme: 'bmp' },
      { phonemes: ['F', 'V'], viseme: 'fv' },
      { phonemes: ['TH', 'DH'], viseme: 'th' },
      { phonemes: ['T', 'D', 'N', 'L'], viseme: 'tdl' },
      { phonemes: ['S', 'Z'], viseme: 'sz' },
      { phonemes: ['SH', 'ZH', 'CH', 'JH'], viseme: 'sh' },
      { phonemes: ['K', 'G', 'NG'], viseme: 'kg' },
      { phonemes: ['R'], viseme: 'r' },
      { phonemes: ['W'], viseme: 'w' },
      { phonemes: ['Y'], viseme: 'y' },
      { phonemes: ['H'], viseme: 'h' },
      
      // Silence
      { phonemes: ['SIL', ''], viseme: 'neutral' }
    ];
    
    mappings.forEach(mapping => {
      mapping.phonemes.forEach(phoneme => {
        this.phonemeToVisemeMap.set(phoneme.toLowerCase(), mapping.viseme);
      });
    });
  }
  
  private createPrestonBlairLibrary(): VisemeLibraryDefinition {
    return {
      name: 'Preston Blair',
      version: '1.0',
      languages: ['en-US', 'en-GB'],
      visemes: [
        this.createViseme('neutral', 'Neutral/Rest', [], { jawOpen: 0.1, lipWidth: 0.5, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.1 }),
        this.createViseme('aa', 'Open vowel (ah)', ['AA', 'AH'], { jawOpen: 0.8, lipWidth: 0.6, lipHeight: 0.8, lipProtrusion: 0.0, upperLipRaise: 0.2, lowerLipDepress: 0.3, cornerLipPull: 0.0, tonguePosition: 0.3, teethVisibility: 0.9 }),
        this.createViseme('ee', 'Close front vowel (ee)', ['IY'], { jawOpen: 0.2, lipWidth: 0.8, lipHeight: 0.2, lipProtrusion: 0.0, upperLipRaise: 0.1, lowerLipDepress: 0.0, cornerLipPull: 0.7, tonguePosition: 0.8, teethVisibility: 0.6 }),
        this.createViseme('oh', 'Close back vowel (oh)', ['OW'], { jawOpen: 0.4, lipWidth: 0.2, lipHeight: 0.6, lipProtrusion: 0.8, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.2, teethVisibility: 0.1 }),
        this.createViseme('oo', 'Close back rounded (oo)', ['UW'], { jawOpen: 0.2, lipWidth: 0.1, lipHeight: 0.4, lipProtrusion: 1.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.2, teethVisibility: 0.0 }),
        this.createViseme('bmp', 'Bilabial (B, M, P)', ['B', 'M', 'P'], { jawOpen: 0.0, lipWidth: 0.4, lipHeight: 0.1, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.0 }),
        this.createViseme('fv', 'Labiodental (F, V)', ['F', 'V'], { jawOpen: 0.2, lipWidth: 0.5, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.6, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.8 }),
        this.createViseme('th', 'Dental (TH)', ['TH'], { jawOpen: 0.3, lipWidth: 0.6, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.1, lowerLipDepress: 0.0, cornerLipPull: 0.2, tonguePosition: 0.9, teethVisibility: 0.7 }),
        this.createViseme('tdl', 'Alveolar (T, D, L)', ['T', 'D', 'L'], { jawOpen: 0.3, lipWidth: 0.5, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.1, tonguePosition: 0.8, teethVisibility: 0.5 }),
        this.createViseme('sz', 'Sibilant (S, Z)', ['S', 'Z'], { jawOpen: 0.1, lipWidth: 0.6, lipHeight: 0.2, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.3, tonguePosition: 0.7, teethVisibility: 0.8 }),
        this.createViseme('sh', 'Postalveolar (SH, CH)', ['SH', 'CH'], { jawOpen: 0.2, lipWidth: 0.3, lipHeight: 0.5, lipProtrusion: 0.6, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.6, teethVisibility: 0.3 }),
        this.createViseme('kg', 'Velar (K, G)', ['K', 'G'], { jawOpen: 0.4, lipWidth: 0.5, lipHeight: 0.5, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.1, teethVisibility: 0.4 }),
        this.createViseme('r', 'Liquid R', ['R'], { jawOpen: 0.3, lipWidth: 0.4, lipHeight: 0.4, lipProtrusion: 0.3, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.6, teethVisibility: 0.2 }),
        this.createViseme('w', 'Semivowel W', ['W'], { jawOpen: 0.2, lipWidth: 0.2, lipHeight: 0.4, lipProtrusion: 0.8, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.3, teethVisibility: 0.1 })
      ],
      phonemeMapping: Object.fromEntries(this.phonemeToVisemeMap),
      defaultTransition: {
        easeIn: 50,
        hold: 100,
        easeOut: 50,
        curve: 'easeInOut',
        blendWeight: 1.0
      },
      metadata: {
        author: 'NgUI Avatar TTS',
        description: 'Preston Blair inspired viseme library for lip sync',
        license: 'MIT',
        references: ['Preston Blair Animation Manual', 'Facial Animation Standards']
      }
    };
  }
  
  private createViseme(id: string, name: string, phonemes: string[], mouthShape: MouthShape): any {
    return {
      id,
      name,
      phonemes,
      mouthShape,
      transition: {
        easeIn: 50,
        hold: 100,
        easeOut: 50,
        curve: 'easeInOut' as const,
        blendWeight: 1.0
      }
    };
  }
  
  private getNeutralMouthShape(): MouthShape {
    return {
      jawOpen: 0.1,
      lipWidth: 0.5,
      lipHeight: 0.3,
      lipProtrusion: 0.0,
      upperLipRaise: 0.0,
      lowerLipDepress: 0.0,
      cornerLipPull: 0.0,
      tonguePosition: 0.5,
      teethVisibility: 0.1
    };
  }
  
  private getVisemeMouthShape(visemeId: string): MouthShape {
    const library = this._visemeLibrary();
    if (!library) return this.getNeutralMouthShape();
    
    const viseme = library.visemes.find(v => v.id === visemeId);
    return viseme ? viseme.mouthShape : this.getNeutralMouthShape();
  }
  
  private textToPhonemes(text: string): string[] {
    // Simplified text-to-phoneme conversion
    // In production, would use proper phonetic dictionaries or G2P models
    const words = text.toLowerCase().split(/\s+/);
    const phonemes: string[] = [];
    
    words.forEach(word => {
      // Basic vowel and consonant mapping
      for (const char of word) {
        switch (char) {
          case 'a': phonemes.push('aa'); break;
          case 'e': phonemes.push('eh'); break;
          case 'i': phonemes.push('ih'); break;
          case 'o': phonemes.push('oh'); break;
          case 'u': phonemes.push('uh'); break;
          case 'b': phonemes.push('b'); break;
          case 'c': case 'k': phonemes.push('k'); break;
          case 'd': phonemes.push('d'); break;
          case 'f': phonemes.push('f'); break;
          case 'g': phonemes.push('g'); break;
          case 'h': phonemes.push('h'); break;
          case 'j': phonemes.push('jh'); break;
          case 'l': phonemes.push('l'); break;
          case 'm': phonemes.push('m'); break;
          case 'n': phonemes.push('n'); break;
          case 'p': phonemes.push('p'); break;
          case 'r': phonemes.push('r'); break;
          case 's': phonemes.push('s'); break;
          case 't': phonemes.push('t'); break;
          case 'v': phonemes.push('v'); break;
          case 'w': phonemes.push('w'); break;
          case 'x': phonemes.push('k'); phonemes.push('s'); break;
          case 'y': phonemes.push('y'); break;
          case 'z': phonemes.push('z'); break;
          default: break;
        }
      }
      phonemes.push('sil'); // Word boundary
    });
    
    return phonemes;
  }
  
  private getPhonemeCategory(phoneme: string): any {
    const vowels = ['aa', 'ae', 'ah', 'ao', 'eh', 'er', 'ey', 'ih', 'iy', 'oh', 'oo', 'ow', 'oy', 'uh', 'uw'];
    const consonants = ['b', 'ch', 'd', 'dh', 'f', 'g', 'h', 'jh', 'k', 'l', 'm', 'n', 'ng', 'p', 'r', 's', 'sh', 't', 'th', 'v', 'w', 'y', 'z', 'zh'];
    
    if (vowels.includes(phoneme)) return 'vowel';
    if (consonants.includes(phoneme)) return 'consonant';
    return 'silence';
  }
  
  private getArticulationFeatures(phoneme: string): any {
    // Simplified articulation features
    return {
      place: 'alveolar',
      manner: 'stop',
      voiced: true,
      nasal: false,
      rounded: false
    };
  }
  
  private fillSilenceGaps(timeline: LipSyncTimelineEntry[], audioLength: number): void {
    timeline.sort((a, b) => a.startTime - b.startTime);
    
    const silenceEntries: LipSyncTimelineEntry[] = [];
    
    // Add silence at the beginning if needed
    if (timeline[0] && timeline[0].startTime > 0) {
      silenceEntries.push({
        startTime: 0,
        endTime: timeline[0].startTime,
        viseme: 'neutral',
        weight: 1.0
      });
    }
    
    // Fill gaps between entries
    for (let i = 0; i < timeline.length - 1; i++) {
      const current = timeline[i];
      const next = timeline[i + 1];
      
      if (next.startTime > current.endTime) {
        silenceEntries.push({
          startTime: current.endTime,
          endTime: next.startTime,
          viseme: 'neutral',
          weight: 1.0
        });
      }
    }
    
    // Add silence at the end if needed
    const lastEntry = timeline[timeline.length - 1];
    if (lastEntry && lastEntry.endTime < audioLength) {
      silenceEntries.push({
        startTime: lastEntry.endTime,
        endTime: audioLength,
        viseme: 'neutral',
        weight: 1.0
      });
    }
    
    timeline.push(...silenceEntries);
    timeline.sort((a, b) => a.startTime - b.startTime);
  }
  
  private optimizeTimeline(timeline: LipSyncTimelineEntry[]): void {
    // Remove very short entries
    const minDuration = 30; // 30ms minimum
    timeline = timeline.filter(entry => 
      entry.endTime - entry.startTime >= minDuration
    );
    
    // Merge similar consecutive entries
    for (let i = timeline.length - 2; i >= 0; i--) {
      const current = timeline[i];
      const next = timeline[i + 1];
      
      if (current.viseme === next.viseme && 
          Math.abs(current.endTime - next.startTime) < 10) {
        current.endTime = next.endTime;
        timeline.splice(i + 1, 1);
      }
    }
  }
  
  private updatePerformanceMetrics(processingTime: number, deltaTime: number): void {
    this.performanceMetrics.frameProcessingTime = processingTime;
    this.performanceMetrics.cpuUsage = Math.min(100, (processingTime / deltaTime) * 100);
    
    // Estimate memory usage (simplified)
    const timelineSize = this._timeline().length * 200; // bytes per entry
    this.performanceMetrics.memoryUsage = timelineSize / 1024 / 1024; // MB
    
    // Calculate quality score
    const targetFrameTime = 1000 / this.config.targetFrameRate;
    this.performanceMetrics.qualityScore = Math.max(0, 1 - (processingTime / targetFrameTime));
  }
}

/**
 * Co-articulation Engine
 * Handles phoneme interactions and transitions
 */
class CoarticulationEngine {
  calculateCoarticulation(phonemes: PhonemeAnalysisResult[], index: number, lookAheadTime: number): CoarticulationData | null {
    if (index === 0 && index === phonemes.length - 1) return null;
    
    const current = phonemes[index];
    const previous = index > 0 ? phonemes[index - 1] : null;
    const next = index < phonemes.length - 1 ? phonemes[index + 1] : null;
    
    const data: CoarticulationData = {
      context: phonemes.slice(Math.max(0, index - 2), Math.min(phonemes.length, index + 3)).map(p => p.phoneme),
      strength: 0.5
    };
    
    if (previous) {
      data.previous = {
        phoneme: previous.phoneme,
        influence: this.calculateInfluence(previous.phoneme, current.phoneme),
        transitionDuration: Math.min(50, previous.duration * 0.3)
      };
    }
    
    if (next) {
      data.next = {
        phoneme: next.phoneme,
        influence: this.calculateInfluence(current.phoneme, next.phoneme),
        transitionDuration: Math.min(50, current.duration * 0.3)
      };
    }
    
    return data;
  }
  
  private calculateInfluence(from: string, to: string): number {
    // Simplified influence calculation
    // In reality, would use phonetic feature distances
    if (from === to) return 1.0;
    
    const vowels = ['aa', 'ae', 'ah', 'ao', 'eh', 'er', 'ey', 'ih', 'iy', 'oh', 'oo', 'ow', 'oy', 'uh', 'uw'];
    const isFromVowel = vowels.includes(from);
    const isToVowel = vowels.includes(to);
    
    if (isFromVowel && isToVowel) return 0.7; // Vowel to vowel
    if (!isFromVowel && !isToVowel) return 0.5; // Consonant to consonant
    return 0.3; // Mixed
  }
}

/**
 * Emotion Processor
 * Applies emotional influences to visemes
 */
class EmotionProcessor {
  processEmotion(emotion: string, intensity: number): EmotionInfluence {
    const modifications: Partial<MouthShape> = {};
    
    switch (emotion.toLowerCase()) {
      case 'happy':
      case 'joy':
        modifications.cornerLipPull = intensity * 0.5;
        modifications.upperLipRaise = intensity * 0.2;
        break;
      case 'sad':
        modifications.cornerLipPull = -intensity * 0.3;
        modifications.lowerLipDepress = intensity * 0.2;
        break;
      case 'angry':
        modifications.lipWidth = intensity * 0.2;
        modifications.jawOpen = intensity * 0.1;
        break;
      case 'surprised':
        modifications.jawOpen = intensity * 0.3;
        modifications.lipHeight = intensity * 0.4;
        break;
      case 'disgusted':
        modifications.upperLipRaise = intensity * 0.4;
        modifications.lipProtrusion = -intensity * 0.2;
        break;
      default:
        break;
    }
    
    return {
      emotion,
      intensity,
      mouthModifications: modifications,
      facialExpressions: []
    };
  }
}

// Extend timeline entry interface to include processing flag
declare module '../interfaces/lip-sync.interface' {
  interface LipSyncTimelineEntry {
    processed?: boolean;
  }
}