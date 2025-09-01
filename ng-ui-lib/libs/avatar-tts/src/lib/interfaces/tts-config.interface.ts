/**
 * Text-to-Speech Configuration Interfaces
 */

/**
 * Main TTS Configuration
 */
export interface TTSConfig {
  /** TTS provider to use */
  provider: TTSProvider;
  
  /** Voice configuration */
  voice: VoiceConfig;
  
  /** Audio configuration */
  audio: AudioConfig;
  
  /** Lip sync configuration */
  lipSync: LipSyncConfig;
  
  /** Advanced features */
  features?: AdvancedFeatures;
  
  /** Performance settings */
  performance?: PerformanceSettings;
}

/**
 * TTS Provider Types
 */
export type TTSProvider = 'webSpeech' | 'googleCloud' | 'amazonPolly' | 'custom';

/**
 * Voice Configuration
 */
export interface VoiceConfig {
  /** Voice name or ID */
  name?: string;
  
  /** Language code (BCP 47) */
  language: string;
  
  /** Voice gender */
  gender?: 'male' | 'female' | 'neutral';
  
  /** Speech rate (0.1-10.0, default 1.0) */
  rate?: number;
  
  /** Speech pitch (0.0-2.0, default 1.0) */
  pitch?: number;
  
  /** Speech volume (0.0-1.0, default 1.0) */
  volume?: number;
  
  /** SSML support enabled */
  ssmlEnabled?: boolean;
}

/**
 * Audio Configuration
 */
export interface AudioConfig {
  /** Sample rate (Hz) */
  sampleRate?: number;
  
  /** Audio format */
  format?: AudioFormat;
  
  /** Audio quality */
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  
  /** Buffer size for processing */
  bufferSize?: number;
  
  /** Audio context settings */
  audioContext?: AudioContextConfig;
}

/**
 * Audio Format Types
 */
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'webm' | 'pcm';

/**
 * Audio Context Configuration
 */
export interface AudioContextConfig {
  /** Latency hint */
  latencyHint?: 'interactive' | 'balanced' | 'playback';
  
  /** Sample rate */
  sampleRate?: number;
}

/**
 * Lip Sync Configuration
 */
export interface LipSyncConfig {
  /** Enable lip sync */
  enabled: boolean;
  
  /** Viseme library to use */
  visemeLibrary: VisemeLibrary;
  
  /** Phoneme detection method */
  phonemeDetection: PhonemeDetectionMethod;
  
  /** Timing precision */
  timingPrecision?: 'low' | 'medium' | 'high' | 'ultra';
  
  /** Co-articulation handling */
  coarticulation?: boolean;
  
  /** Emotion overlay */
  emotionOverlay?: boolean;
  
  /** Smoothing settings */
  smoothing?: SmoothingConfig;
}

/**
 * Viseme Library Types
 */
export type VisemeLibrary = 'prestonBlair' | 'ipa' | 'disney' | 'custom';

/**
 * Phoneme Detection Methods
 */
export type PhonemeDetectionMethod = 'textAnalysis' | 'audioAnalysis' | 'hybrid';

/**
 * Smoothing Configuration
 */
export interface SmoothingConfig {
  /** Transition duration (ms) */
  transitionDuration?: number;
  
  /** Interpolation type */
  interpolationType?: 'linear' | 'cubic' | 'bezier';
  
  /** Smoothing factor (0.0-1.0) */
  smoothingFactor?: number;
}

/**
 * Advanced Features Configuration
 */
export interface AdvancedFeatures {
  /** Emotion detection from text */
  emotionDetection?: EmotionDetectionConfig;
  
  /** Emphasis detection for gestures */
  emphasisDetection?: EmphasisDetectionConfig;
  
  /** Breathing animation */
  breathingAnimation?: BreathingAnimationConfig;
  
  /** Micro-expressions */
  microExpressions?: boolean;
  
  /** Head movement coordination */
  headMovement?: HeadMovementConfig;
  
  /** Eye movement and blinking */
  eyeMovement?: EyeMovementConfig;
}

/**
 * Emotion Detection Configuration
 */
export interface EmotionDetectionConfig {
  /** Enable emotion detection */
  enabled: boolean;
  
  /** Emotion detection method */
  method: 'textAnalysis' | 'nlp' | 'custom';
  
  /** Supported emotions */
  emotions: string[];
  
  /** Intensity mapping */
  intensityMapping?: Record<string, number>;
}

/**
 * Emphasis Detection Configuration
 */
export interface EmphasisDetectionConfig {
  /** Enable emphasis detection */
  enabled: boolean;
  
  /** Detection patterns */
  patterns: string[];
  
  /** Gesture mapping */
  gestureMapping?: Record<string, string>;
}

/**
 * Breathing Animation Configuration
 */
export interface BreathingAnimationConfig {
  /** Enable breathing animation */
  enabled: boolean;
  
  /** Breathing rate (breaths per minute) */
  rate?: number;
  
  /** Breathing intensity */
  intensity?: number;
  
  /** Pause threshold (ms) */
  pauseThreshold?: number;
}

/**
 * Head Movement Configuration
 */
export interface HeadMovementConfig {
  /** Enable head movement */
  enabled: boolean;
  
  /** Movement patterns */
  patterns: HeadMovementPattern[];
  
  /** Randomness factor */
  randomness?: number;
}

/**
 * Head Movement Patterns
 */
export interface HeadMovementPattern {
  /** Pattern name */
  name: string;
  
  /** Trigger conditions */
  triggers: string[];
  
  /** Movement data */
  movement: {
    x?: number;
    y?: number;
    z?: number;
    duration?: number;
  };
}

/**
 * Eye Movement Configuration
 */
export interface EyeMovementConfig {
  /** Enable eye movement */
  enabled: boolean;
  
  /** Blink rate */
  blinkRate?: number;
  
  /** Eye saccades */
  saccades?: boolean;
  
  /** Look-at behavior */
  lookAt?: boolean;
}

/**
 * Performance Settings
 */
export interface PerformanceSettings {
  /** Processing optimization */
  optimization: 'speed' | 'quality' | 'balanced';
  
  /** Max concurrent processes */
  maxConcurrency?: number;
  
  /** Memory usage limit (MB) */
  memoryLimit?: number;
  
  /** Enable caching */
  caching?: CachingConfig;
  
  /** Fallback options */
  fallback?: FallbackConfig;
}

/**
 * Caching Configuration
 */
export interface CachingConfig {
  /** Enable audio caching */
  audioCache?: boolean;
  
  /** Enable viseme caching */
  visemeCache?: boolean;
  
  /** Cache size limit (MB) */
  sizeLimit?: number;
  
  /** Cache TTL (ms) */
  ttl?: number;
}

/**
 * Fallback Configuration
 */
export interface FallbackConfig {
  /** Fallback TTS provider */
  ttsProvider?: TTSProvider;
  
  /** Disable features on slow devices */
  disableFeaturesOnSlowDevice?: boolean;
  
  /** Reduce quality on mobile */
  reduceQualityOnMobile?: boolean;
}