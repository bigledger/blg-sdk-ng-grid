import { Injectable, signal, computed } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';
import {
  EmotionDetectionConfig,
  EmphasisDetectionConfig,
  BreathingAnimationConfig,
  HeadMovementConfig,
  EyeMovementConfig
} from '../interfaces/tts-config.interface';
import { MouthShape, EmotionInfluence } from '../interfaces/lip-sync.interface';

/**
 * Advanced Features Service
 * Handles emotion detection, gesture coordination, breathing animation, and micro-expressions
 */
@Injectable({
  providedIn: 'root'
})
export class AdvancedFeaturesService {
  private readonly _emotionDetectionEnabled = signal(false);
  private readonly _emphasisDetectionEnabled = signal(false);
  private readonly _breathingAnimationEnabled = signal(false);
  private readonly _headMovementEnabled = signal(false);
  private readonly _eyeMovementEnabled = signal(false);
  
  private readonly _currentEmotion = signal<EmotionData>({
    emotion: 'neutral',
    intensity: 0.0,
    confidence: 0.0
  });
  
  private readonly _currentGesture = signal<GestureData | null>(null);
  private readonly _breathingState = signal<BreathingState>({
    phase: 'neutral',
    intensity: 0.0,
    rate: 16
  });
  
  private readonly _headPose = signal<HeadPose>({
    pitch: 0.0,
    yaw: 0.0,
    roll: 0.0
  });
  
  private readonly _eyeState = signal<EyeState>({
    leftEyeOpenness: 1.0,
    rightEyeOpenness: 1.0,
    gazeDirection: { x: 0.0, y: 0.0 },
    blinkState: 'open'
  });
  
  // Computed signals
  readonly emotionDetectionEnabled = this._emotionDetectionEnabled.asReadonly();
  readonly emphasisDetectionEnabled = this._emphasisDetectionEnabled.asReadonly();
  readonly breathingAnimationEnabled = this._breathingAnimationEnabled.asReadonly();
  readonly headMovementEnabled = this._headMovementEnabled.asReadonly();
  readonly eyeMovementEnabled = this._eyeMovementEnabled.asReadonly();
  
  readonly currentEmotion = this._currentEmotion.asReadonly();
  readonly currentGesture = this._currentGesture.asReadonly();
  readonly breathingState = this._breathingState.asReadonly();
  readonly headPose = this._headPose.asReadonly();
  readonly eyeState = this._eyeState.asReadonly();
  
  // Combined avatar state
  readonly avatarState = computed(() => ({
    emotion: this._currentEmotion(),
    gesture: this._currentGesture(),
    breathing: this._breathingState(),
    headPose: this._headPose(),
    eyeState: this._eyeState()
  }));
  
  // Event subjects
  private readonly emotionDetected$ = new Subject<EmotionData>();
  private readonly emphasisDetected$ = new Subject<EmphasisData>();
  private readonly gestureTriggered$ = new Subject<GestureData>();
  private readonly breathingPhaseChanged$ = new Subject<BreathingState>();
  private readonly headMovementTriggered$ = new Subject<HeadMovement>();
  private readonly eyeEventTriggered$ = new Subject<EyeEvent>();
  
  // Public observables
  readonly onEmotionDetected$ = this.emotionDetected$.asObservable();
  readonly onEmphasisDetected$ = this.emphasisDetected$.asObservable();
  readonly onGestureTriggered$ = this.gestureTriggered$.asObservable();
  readonly onBreathingPhaseChanged$ = this.breathingPhaseChanged$.asObservable();
  readonly onHeadMovementTriggered$ = this.headMovementTriggered$.asObservable();
  readonly onEyeEventTriggered$ = this.eyeEventTriggered$.asObservable();
  
  // Feature processors
  private emotionProcessor: EmotionProcessor | null = null;
  private emphasisProcessor: EmphasisProcessor | null = null;
  private breathingAnimator: BreathingAnimator | null = null;
  private headMovementController: HeadMovementController | null = null;
  private eyeMovementController: EyeMovementController | null = null;
  private gestureCoordinator: GestureCoordinator | null = null;
  
  constructor() {
    this.initializeProcessors();
    this.setupEventHandlers();
  }
  
  /**
   * Initialize advanced features with configuration
   */
  async initialize(config: AdvancedFeaturesConfig): Promise<void> {
    try {
      // Initialize emotion detection
      if (config.emotionDetection?.enabled) {
        await this.emotionProcessor?.initialize(config.emotionDetection);
        this._emotionDetectionEnabled.set(true);
      }
      
      // Initialize emphasis detection
      if (config.emphasisDetection?.enabled) {
        await this.emphasisProcessor?.initialize(config.emphasisDetection);
        this._emphasisDetectionEnabled.set(true);
      }
      
      // Initialize breathing animation
      if (config.breathingAnimation?.enabled) {
        await this.breathingAnimator?.initialize(config.breathingAnimation);
        this._breathingAnimationEnabled.set(true);
      }
      
      // Initialize head movement
      if (config.headMovement?.enabled) {
        await this.headMovementController?.initialize(config.headMovement);
        this._headMovementEnabled.set(true);
      }
      
      // Initialize eye movement
      if (config.eyeMovement?.enabled) {
        await this.eyeMovementController?.initialize(config.eyeMovement);
        this._eyeMovementEnabled.set(true);
      }
      
      // Initialize gesture coordinator
      this.gestureCoordinator?.initialize();
      
    } catch (error) {
      console.error('Failed to initialize advanced features:', error);
      throw error;
    }
  }
  
  /**
   * Process text for emotion and emphasis detection
   */
  async processText(text: string): Promise<TextAnalysisResult> {
    const results: TextAnalysisResult = {
      emotions: [],
      emphasis: [],
      gestures: []
    };
    
    // Emotion detection
    if (this._emotionDetectionEnabled() && this.emotionProcessor) {
      results.emotions = await this.emotionProcessor.analyzeText(text);
    }
    
    // Emphasis detection
    if (this._emphasisDetectionEnabled() && this.emphasisProcessor) {
      results.emphasis = await this.emphasisProcessor.analyzeText(text);
    }
    
    // Generate gestures based on text content
    if (this.gestureCoordinator) {
      results.gestures = await this.gestureCoordinator.generateGestures(text, results.emotions, results.emphasis);
    }
    
    return results;
  }
  
  /**
   * Apply emotion influence to mouth shape
   */
  applyEmotionToMouthShape(baseMouthShape: MouthShape, emotion?: EmotionData): MouthShape {
    if (!emotion || !this._emotionDetectionEnabled()) {
      return baseMouthShape;
    }
    
    const influence = this.emotionProcessor?.getEmotionInfluence(emotion.emotion, emotion.intensity);
    if (!influence) return baseMouthShape;
    
    const modifiedShape: MouthShape = { ...baseMouthShape };
    
    // Apply emotion modifications
    if (influence.mouthModifications) {
      Object.entries(influence.mouthModifications).forEach(([key, value]) => {
        if (value !== undefined) {
          (modifiedShape as any)[key] = Math.max(0, Math.min(1, 
            (modifiedShape as any)[key] + value * emotion.intensity
          ));
        }
      });
    }
    
    return modifiedShape;
  }
  
  /**
   * Trigger specific emotion
   */
  triggerEmotion(emotion: string, intensity: number, duration?: number): void {
    const emotionData: EmotionData = {
      emotion,
      intensity: Math.max(0, Math.min(1, intensity)),
      confidence: 1.0
    };
    
    this._currentEmotion.set(emotionData);
    this.emotionDetected$.next(emotionData);
    
    // Auto-fade emotion if duration specified
    if (duration) {
      setTimeout(() => {
        this.fadeEmotion(2000); // Fade over 2 seconds
      }, duration);
    }
  }
  
  /**
   * Fade current emotion
   */
  fadeEmotion(fadeTime: number = 1000): void {
    const currentEmotion = this._currentEmotion();
    if (currentEmotion.intensity <= 0) return;
    
    const fadeStep = currentEmotion.intensity / (fadeTime / 50);
    const fadeInterval = setInterval(() => {
      const emotion = this._currentEmotion();
      const newIntensity = Math.max(0, emotion.intensity - fadeStep);
      
      if (newIntensity <= 0) {
        this._currentEmotion.set({ emotion: 'neutral', intensity: 0.0, confidence: 0.0 });
        clearInterval(fadeInterval);
      } else {
        this._currentEmotion.set({ ...emotion, intensity: newIntensity });
      }
    }, 50);
  }
  
  /**
   * Trigger gesture
   */
  triggerGesture(gestureType: string, intensity: number = 1.0, duration: number = 1000): void {
    const gesture: GestureData = {
      type: gestureType,
      intensity,
      duration,
      startTime: performance.now(),
      parameters: this.getGestureParameters(gestureType)
    };
    
    this._currentGesture.set(gesture);
    this.gestureTriggered$.next(gesture);
    
    // Auto-clear gesture after duration
    setTimeout(() => {
      if (this._currentGesture()?.startTime === gesture.startTime) {
        this._currentGesture.set(null);
      }
    }, duration);
  }
  
  /**
   * Update breathing animation
   */
  updateBreathing(): void {
    if (!this._breathingAnimationEnabled() || !this.breathingAnimator) return;
    
    const newState = this.breathingAnimator.updateBreathing();
    
    if (newState.phase !== this._breathingState().phase) {
      this._breathingState.set(newState);
      this.breathingPhaseChanged$.next(newState);
    } else {
      this._breathingState.set(newState);
    }
  }
  
  /**
   * Update head movement
   */
  updateHeadMovement(speechIntensity: number, emotionData?: EmotionData): void {
    if (!this._headMovementEnabled() || !this.headMovementController) return;
    
    const movement = this.headMovementController.generateMovement(speechIntensity, emotionData);
    if (movement) {
      this._headPose.set({
        pitch: movement.pitch,
        yaw: movement.yaw,
        roll: movement.roll
      });
      
      this.headMovementTriggered$.next(movement);
    }
  }
  
  /**
   * Update eye movement and blinking
   */
  updateEyeMovement(speechActivity: boolean, emotionData?: EmotionData): void {
    if (!this._eyeMovementEnabled() || !this.eyeMovementController) return;
    
    const eyeUpdate = this.eyeMovementController.updateEyes(speechActivity, emotionData);
    this._eyeState.set(eyeUpdate.state);
    
    if (eyeUpdate.event) {
      this.eyeEventTriggered$.next(eyeUpdate.event);
    }
  }
  
  /**
   * Get current avatar animation parameters
   */
  getAnimationParameters(): AvatarAnimationParameters {
    return {
      emotion: this._currentEmotion(),
      gesture: this._currentGesture(),
      breathing: this._breathingState(),
      headPose: this._headPose(),
      eyeState: this._eyeState(),
      timestamp: performance.now()
    };
  }
  
  // Private methods
  
  private initializeProcessors(): void {
    this.emotionProcessor = new EmotionProcessor();
    this.emphasisProcessor = new EmphasisProcessor();
    this.breathingAnimator = new BreathingAnimator();
    this.headMovementController = new HeadMovementController();
    this.eyeMovementController = new EyeMovementController();
    this.gestureCoordinator = new GestureCoordinator();
  }
  
  private setupEventHandlers(): void {
    // Set up breathing animation loop
    setInterval(() => {
      this.updateBreathing();
    }, 100); // 10fps for breathing
    
    // Set up eye movement loop
    setInterval(() => {
      this.updateEyeMovement(false); // Default no speech activity
    }, 50); // 20fps for eyes
  }
  
  private getGestureParameters(gestureType: string): Record<string, any> {
    // Define gesture-specific parameters
    const gestureParams: Record<string, any> = {
      'nod': { direction: 'down', amplitude: 0.3, speed: 1.0 },
      'shake': { direction: 'side', amplitude: 0.2, speed: 1.5 },
      'tilt': { direction: 'side', amplitude: 0.15, speed: 0.8 },
      'emphasis': { direction: 'forward', amplitude: 0.1, speed: 2.0 },
      'thinking': { direction: 'up', amplitude: 0.1, speed: 0.5 },
      'surprise': { direction: 'back', amplitude: 0.2, speed: 3.0 }
    };
    
    return gestureParams[gestureType] || {};
  }
}

/**
 * Emotion Processing Engine
 */
class EmotionProcessor {
  private emotionPatterns = new Map<string, RegExp[]>();
  private emotionIntensityWords = new Map<string, number>();
  
  async initialize(config: EmotionDetectionConfig): Promise<void> {
    this.setupEmotionPatterns();
    this.setupIntensityWords();
  }
  
  async analyzeText(text: string): Promise<EmotionData[]> {
    const emotions: EmotionData[] = [];
    const sentences = this.splitIntoSentences(text);
    
    sentences.forEach((sentence, index) => {
      const detectedEmotion = this.detectEmotionInSentence(sentence);
      if (detectedEmotion.confidence > 0.5) {
        emotions.push({
          ...detectedEmotion,
          startIndex: text.indexOf(sentence),
          endIndex: text.indexOf(sentence) + sentence.length
        });
      }
    });
    
    return emotions;
  }
  
  getEmotionInfluence(emotion: string, intensity: number): EmotionInfluence {
    const modifications: Partial<MouthShape> = {};
    
    switch (emotion.toLowerCase()) {
      case 'happy':
      case 'joy':
        modifications.cornerLipPull = intensity * 0.4;
        modifications.upperLipRaise = intensity * 0.2;
        break;
      case 'sad':
        modifications.cornerLipPull = -intensity * 0.3;
        modifications.lowerLipDepress = intensity * 0.3;
        break;
      case 'angry':
        modifications.lipWidth = intensity * 0.2;
        modifications.jawOpen = intensity * 0.1;
        modifications.upperLipRaise = intensity * 0.1;
        break;
      case 'surprised':
        modifications.jawOpen = intensity * 0.4;
        modifications.lipHeight = intensity * 0.3;
        break;
      case 'disgusted':
        modifications.upperLipRaise = intensity * 0.5;
        modifications.lipProtrusion = -intensity * 0.2;
        break;
      case 'fearful':
        modifications.lipWidth = intensity * 0.1;
        modifications.jawOpen = intensity * 0.2;
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
  
  private setupEmotionPatterns(): void {
    this.emotionPatterns.set('happy', [
      /\b(happy|joy|excited|delighted|pleased|cheerful|glad)\b/gi,
      /\b(amazing|wonderful|fantastic|great|excellent)\b/gi,
      /[!]{2,}|😊|😄|😁/g
    ]);
    
    this.emotionPatterns.set('sad', [
      /\b(sad|depressed|unhappy|miserable|sorrowful)\b/gi,
      /\b(terrible|awful|horrible|devastating)\b/gi,
      /😢|😭|😔/g
    ]);
    
    this.emotionPatterns.set('angry', [
      /\b(angry|furious|mad|irritated|annoyed|outraged)\b/gi,
      /\b(hate|despise|disgusting|ridiculous)\b/gi,
      /😠|😡|🤬/g
    ]);
    
    this.emotionPatterns.set('surprised', [
      /\b(surprised|shocked|amazed|astonished|wow)\b/gi,
      /\b(incredible|unbelievable|extraordinary)\b/gi,
      /😮|😲|🤯/g
    ]);
  }
  
  private setupIntensityWords(): void {
    this.emotionIntensityWords.set('very', 1.3);
    this.emotionIntensityWords.set('extremely', 1.5);
    this.emotionIntensityWords.set('incredibly', 1.4);
    this.emotionIntensityWords.set('quite', 1.1);
    this.emotionIntensityWords.set('rather', 1.1);
    this.emotionIntensityWords.set('somewhat', 0.8);
    this.emotionIntensityWords.set('slightly', 0.6);
  }
  
  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }
  
  private detectEmotionInSentence(sentence: string): EmotionData {
    let maxConfidence = 0;
    let detectedEmotion = 'neutral';
    let intensity = 0.5;
    
    this.emotionPatterns.forEach((patterns, emotion) => {
      let confidence = 0;
      patterns.forEach(pattern => {
        const matches = sentence.match(pattern);
        if (matches) {
          confidence += matches.length * 0.3;
        }
      });
      
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedEmotion = emotion;
      }
    });
    
    // Adjust intensity based on intensity words
    this.emotionIntensityWords.forEach((multiplier, word) => {
      if (sentence.toLowerCase().includes(word)) {
        intensity *= multiplier;
      }
    });
    
    return {
      emotion: detectedEmotion,
      intensity: Math.min(1.0, intensity),
      confidence: Math.min(1.0, maxConfidence)
    };
  }
}

/**
 * Emphasis Detection Processor
 */
class EmphasisProcessor {
  private emphasisPatterns: RegExp[] = [];
  
  async initialize(config: EmphasisDetectionConfig): Promise<void> {
    this.emphasisPatterns = [
      /\b[A-Z]{2,}\b/g, // ALL CAPS words
      /\*[^*]+\*/g, // *emphasized* text
      /\b(really|definitely|absolutely|certainly|indeed)\b/gi,
      /[!]{2,}/g // Multiple exclamation marks
    ];
  }
  
  async analyzeText(text: string): Promise<EmphasisData[]> {
    const emphasis: EmphasisData[] = [];
    
    this.emphasisPatterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        emphasis.push({
          type: this.getEmphasisType(index),
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          intensity: this.getEmphasisIntensity(match[0]),
          gestureType: this.getGestureForEmphasis(index)
        });
      }
    });
    
    return emphasis.sort((a, b) => a.startIndex - b.startIndex);
  }
  
  private getEmphasisType(patternIndex: number): string {
    const types = ['caps', 'asterisk', 'intensifier', 'exclamation'];
    return types[patternIndex] || 'general';
  }
  
  private getEmphasisIntensity(matchedText: string): number {
    if (matchedText.includes('!!!')) return 1.0;
    if (matchedText.includes('!!')) return 0.8;
    if (matchedText.match(/[A-Z]/)) return 0.7;
    return 0.6;
  }
  
  private getGestureForEmphasis(patternIndex: number): string {
    const gestures = ['emphasis', 'emphasis', 'nod', 'emphasis'];
    return gestures[patternIndex] || 'emphasis';
  }
}

/**
 * Breathing Animation Controller
 */
class BreathingAnimator {
  private config: BreathingAnimationConfig = {
    enabled: true,
    rate: 16,
    intensity: 0.3,
    pauseThreshold: 2000
  };
  
  private lastBreathTime = 0;
  private breathingPhase = 0;
  private isInPause = false;
  private lastSpeechTime = 0;
  
  async initialize(config: BreathingAnimationConfig): Promise<void> {
    this.config = { ...this.config, ...config };
  }
  
  updateBreathing(): BreathingState {
    const currentTime = performance.now();
    const timeSinceLastSpeech = currentTime - this.lastSpeechTime;
    
    // Check if we're in a speech pause
    this.isInPause = timeSinceLastSpeech > (this.config.pauseThreshold || 2000);
    
    // Calculate breathing cycle
    const breathingPeriod = (60 / (this.config.rate || 16)) * 1000; // ms per breath
    const cycleProgress = (currentTime % breathingPeriod) / breathingPeriod;
    
    let phase: 'inhale' | 'exhale' | 'neutral';
    let intensity: number;
    
    if (cycleProgress < 0.4) {
      phase = 'inhale';
      intensity = Math.sin(cycleProgress * Math.PI / 0.4) * (this.config.intensity || 0.3);
    } else if (cycleProgress < 0.6) {
      phase = 'exhale';
      intensity = Math.sin((cycleProgress - 0.4) * Math.PI / 0.2) * (this.config.intensity || 0.3);
    } else {
      phase = 'neutral';
      intensity = 0;
    }
    
    // Reduce breathing intensity if not in pause
    if (!this.isInPause) {
      intensity *= 0.3;
    }
    
    return {
      phase,
      intensity,
      rate: this.config.rate || 16
    };
  }
  
  notifySpeechActivity(): void {
    this.lastSpeechTime = performance.now();
  }
}

/**
 * Head Movement Controller
 */
class HeadMovementController {
  private config: HeadMovementConfig = {
    enabled: true,
    patterns: [],
    randomness: 0.1
  };
  
  private lastMovementTime = 0;
  private currentBasePose = { pitch: 0, yaw: 0, roll: 0 };
  
  async initialize(config: HeadMovementConfig): Promise<void> {
    this.config = { ...this.config, ...config };
  }
  
  generateMovement(speechIntensity: number, emotionData?: EmotionData): HeadMovement | null {
    const currentTime = performance.now();
    const timeSinceLastMovement = currentTime - this.lastMovementTime;
    
    // Don't generate movements too frequently
    if (timeSinceLastMovement < 500) return null;
    
    const movement: HeadMovement = {
      pitch: this.currentBasePose.pitch,
      yaw: this.currentBasePose.yaw,
      roll: this.currentBasePose.roll,
      duration: 1000,
      intensity: speechIntensity
    };
    
    // Add subtle random movement
    movement.pitch += (Math.random() - 0.5) * (this.config.randomness || 0.1) * 0.1;
    movement.yaw += (Math.random() - 0.5) * (this.config.randomness || 0.1) * 0.15;
    
    // Emotion-based movement
    if (emotionData) {
      switch (emotionData.emotion) {
        case 'happy':
          movement.pitch += 0.05 * emotionData.intensity;
          break;
        case 'sad':
          movement.pitch -= 0.08 * emotionData.intensity;
          break;
        case 'surprised':
          movement.pitch += 0.1 * emotionData.intensity;
          break;
        case 'thinking':
          movement.pitch += 0.03 * emotionData.intensity;
          movement.yaw += 0.05 * emotionData.intensity;
          break;
      }
    }
    
    // Speech intensity based movement
    if (speechIntensity > 0.5) {
      const emphasisMovement = (speechIntensity - 0.5) * 0.1;
      movement.pitch += emphasisMovement * 0.5;
      movement.yaw += (Math.random() - 0.5) * emphasisMovement;
    }
    
    this.lastMovementTime = currentTime;
    return movement;
  }
}

/**
 * Eye Movement Controller
 */
class EyeMovementController {
  private config: EyeMovementConfig = {
    enabled: true,
    blinkRate: 15,
    saccades: true,
    lookAt: true
  };
  
  private lastBlinkTime = 0;
  private blinkDuration = 150;
  private currentBlinkState: 'open' | 'closing' | 'closed' | 'opening' = 'open';
  private blinkStartTime = 0;
  
  async initialize(config: EyeMovementConfig): Promise<void> {
    this.config = { ...this.config, ...config };
  }
  
  updateEyes(speechActivity: boolean, emotionData?: EmotionData): EyeUpdate {
    const currentTime = performance.now();
    const state = this.updateBlinking(currentTime, speechActivity);
    
    // Generate saccadic movements
    if (this.config.saccades && Math.random() < 0.02) { // 2% chance per update
      const event: EyeEvent = {
        type: 'saccade',
        direction: {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.05
        },
        duration: 100 + Math.random() * 100,
        timestamp: currentTime
      };
      
      return { state, event };
    }
    
    return { state, event: null };
  }
  
  private updateBlinking(currentTime: number, speechActivity: boolean): EyeState {
    let blinkRate = this.config.blinkRate || 15;
    
    // Adjust blink rate based on speech activity
    if (speechActivity) {
      blinkRate *= 1.2; // Blink slightly more during speech
    }
    
    const timeSinceLastBlink = currentTime - this.lastBlinkTime;
    const averageBlinkInterval = (60 / blinkRate) * 1000; // ms between blinks
    
    let leftOpenness = 1.0;
    let rightOpenness = 1.0;
    let blinkState = this.currentBlinkState;
    
    // Handle blink animation
    if (this.currentBlinkState !== 'open') {
      const blinkProgress = (currentTime - this.blinkStartTime) / this.blinkDuration;
      
      switch (this.currentBlinkState) {
        case 'closing':
          leftOpenness = rightOpenness = 1.0 - Math.min(1.0, blinkProgress * 2);
          if (blinkProgress >= 0.5) {
            this.currentBlinkState = 'opening';
          }
          break;
        case 'opening':
          leftOpenness = rightOpenness = Math.max(0.0, (blinkProgress - 0.5) * 2);
          if (blinkProgress >= 1.0) {
            this.currentBlinkState = 'open';
            blinkState = 'open';
          }
          break;
      }
    }
    
    // Trigger new blink if it's time
    if (this.currentBlinkState === 'open' && timeSinceLastBlink > averageBlinkInterval) {
      if (Math.random() < 0.7) { // 70% chance to blink when time comes
        this.currentBlinkState = 'closing';
        this.blinkStartTime = currentTime;
        this.lastBlinkTime = currentTime;
        blinkState = 'closing';
      }
    }
    
    return {
      leftEyeOpenness: leftOpenness,
      rightEyeOpenness: rightOpenness,
      gazeDirection: { x: 0, y: 0 }, // Simplified - would be more complex in real implementation
      blinkState
    };
  }
}

/**
 * Gesture Coordination System
 */
class GestureCoordinator {
  initialize(): void {
    // Initialize gesture database and coordination rules
  }
  
  async generateGestures(
    text: string,
    emotions: EmotionData[],
    emphasis: EmphasisData[]
  ): Promise<GestureData[]> {
    const gestures: GestureData[] = [];
    
    // Generate gestures based on emphasis
    emphasis.forEach(emph => {
      gestures.push({
        type: emph.gestureType || 'emphasis',
        intensity: emph.intensity,
        duration: 800,
        startTime: 0, // Will be set when triggered
        parameters: {},
        textRange: { start: emph.startIndex, end: emph.endIndex }
      });
    });
    
    // Generate gestures based on emotions
    emotions.forEach(emotion => {
      const gestureType = this.getGestureForEmotion(emotion.emotion);
      if (gestureType) {
        gestures.push({
          type: gestureType,
          intensity: emotion.intensity,
          duration: 1200,
          startTime: 0,
          parameters: {},
          textRange: emotion.startIndex ? 
            { start: emotion.startIndex, end: emotion.endIndex || emotion.startIndex + 10 } :
            undefined
        });
      }
    });
    
    return gestures;
  }
  
  private getGestureForEmotion(emotion: string): string | null {
    const emotionGestures: Record<string, string> = {
      'happy': 'nod',
      'excited': 'emphasis',
      'sad': 'thinking',
      'surprised': 'surprise',
      'confused': 'tilt',
      'disagreement': 'shake'
    };
    
    return emotionGestures[emotion] || null;
  }
}

// Interfaces for advanced features

interface AdvancedFeaturesConfig {
  emotionDetection?: EmotionDetectionConfig;
  emphasisDetection?: EmphasisDetectionConfig;
  breathingAnimation?: BreathingAnimationConfig;
  headMovement?: HeadMovementConfig;
  eyeMovement?: EyeMovementConfig;
}

interface TextAnalysisResult {
  emotions: EmotionData[];
  emphasis: EmphasisData[];
  gestures: GestureData[];
}

interface EmotionData {
  emotion: string;
  intensity: number;
  confidence: number;
  startIndex?: number;
  endIndex?: number;
}

interface EmphasisData {
  type: string;
  startIndex: number;
  endIndex: number;
  intensity: number;
  gestureType?: string;
}

interface GestureData {
  type: string;
  intensity: number;
  duration: number;
  startTime: number;
  parameters: Record<string, any>;
  textRange?: { start: number; end: number };
}

interface BreathingState {
  phase: 'inhale' | 'exhale' | 'neutral';
  intensity: number;
  rate: number;
}

interface HeadPose {
  pitch: number; // Up/down rotation
  yaw: number;   // Left/right rotation
  roll: number;  // Tilt rotation
}

interface HeadMovement extends HeadPose {
  duration: number;
  intensity: number;
}

interface EyeState {
  leftEyeOpenness: number;
  rightEyeOpenness: number;
  gazeDirection: { x: number; y: number };
  blinkState: 'open' | 'closing' | 'closed' | 'opening';
}

interface EyeEvent {
  type: 'blink' | 'saccade' | 'gaze_shift';
  direction?: { x: number; y: number };
  duration: number;
  timestamp: number;
}

interface EyeUpdate {
  state: EyeState;
  event: EyeEvent | null;
}

interface AvatarAnimationParameters {
  emotion: EmotionData;
  gesture: GestureData | null;
  breathing: BreathingState;
  headPose: HeadPose;
  eyeState: EyeState;
  timestamp: number;
}