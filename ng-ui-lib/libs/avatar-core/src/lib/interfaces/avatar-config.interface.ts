/**
 * Avatar appearance configuration options
 */
export interface AvatarAppearance {
  /** Avatar model type */
  model: 'young-man' | 'young-woman' | 'middle-aged-man' | 'middle-aged-woman';
  
  /** Skin tone options */
  skinTone: 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';
  
  /** Hair configuration */
  hair: {
    style: string;
    color: string;
  };
  
  /** Clothing configuration */
  clothing: {
    top: string;
    bottom?: string;
    accessories?: string[];
  };
  
  /** Background settings */
  background: {
    type: 'solid' | 'gradient' | 'image';
    value: string;
  };
  
  /** Scale and positioning */
  scale: number;
  position: {
    x: number;
    y: number;
  };
}

/**
 * Avatar behavior configuration
 */
export interface AvatarBehavior {
  /** Auto-gesturing settings */
  autoGestures: boolean;
  gestureIntensity: 'subtle' | 'moderate' | 'expressive';
  
  /** Idle animations */
  idleAnimations: boolean;
  idleFrequency: number; // seconds between idle animations
  
  /** Eye contact and looking behavior */
  eyeContact: boolean;
  lookingPattern: 'direct' | 'natural' | 'shy';
  
  /** Blinking settings */
  blinking: {
    enabled: boolean;
    frequency: number; // blinks per minute
  };
  
  /** Response timing */
  responseDelay: number; // milliseconds before starting response
  
  /** Animation speed multiplier */
  animationSpeed: number;
}

/**
 * Complete avatar configuration interface
 */
export interface AvatarConfig {
  /** Unique identifier for the avatar instance */
  id: string;
  
  /** Avatar appearance settings */
  appearance: AvatarAppearance;
  
  /** Avatar behavior settings */
  behavior: AvatarBehavior;
  
  /** Voice configuration */
  voice: {
    /** Voice provider (e.g., 'elevenlabs', 'azure', 'google') */
    provider: string;
    /** Voice ID or name */
    voiceId: string;
    /** Language code (e.g., 'en-US', 'es-ES') */
    language: string;
    /** Speaking rate (0.5 - 2.0) */
    rate: number;
    /** Pitch adjustment (-1.0 to 1.0) */
    pitch: number;
    /** Volume level (0.0 - 1.0) */
    volume: number;
  };
  
  /** Audio processing settings */
  audio: {
    /** Sample rate for audio processing */
    sampleRate: number;
    /** Buffer size for audio chunks */
    bufferSize: number;
    /** Audio format */
    format: 'wav' | 'mp3' | 'ogg';
    /** Enable noise reduction */
    noiseReduction: boolean;
  };
  
  /** Performance settings */
  performance: {
    /** Maximum FPS for animations */
    maxFPS: number;
    /** Quality level */
    quality: 'low' | 'medium' | 'high' | 'ultra';
    /** Enable performance monitoring */
    monitoring: boolean;
  };
  
  /** Feature flags */
  features: {
    /** Enable real-time streaming */
    streaming: boolean;
    /** Enable lip synchronization */
    lipSync: boolean;
    /** Enable gesture generation */
    gestureGeneration: boolean;
    /** Enable emotion detection */
    emotionDetection: boolean;
  };
}