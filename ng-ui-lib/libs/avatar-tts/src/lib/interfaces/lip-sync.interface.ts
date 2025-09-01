/**
 * Lip Sync Interfaces
 */

/**
 * Viseme Definition
 */
export interface Viseme {
  /** Viseme ID */
  id: string;
  
  /** Viseme name */
  name: string;
  
  /** Associated phonemes */
  phonemes: string[];
  
  /** Mouth shape parameters */
  mouthShape: MouthShape;
  
  /** Transition properties */
  transition: VisemeTransition;
  
  /** Language variations */
  languageVariations?: Record<string, MouthShape>;
}

/**
 * Mouth Shape Parameters
 */
export interface MouthShape {
  /** Jaw opening (0.0-1.0) */
  jawOpen: number;
  
  /** Lip width (0.0-1.0) */
  lipWidth: number;
  
  /** Lip height (0.0-1.0) */
  lipHeight: number;
  
  /** Lip protrusion (0.0-1.0) */
  lipProtrusion: number;
  
  /** Upper lip raise (0.0-1.0) */
  upperLipRaise: number;
  
  /** Lower lip depress (0.0-1.0) */
  lowerLipDepress: number;
  
  /** Corner lip pull (0.0-1.0) */
  cornerLipPull: number;
  
  /** Tongue position (0.0-1.0) */
  tonguePosition: number;
  
  /** Teeth visibility (0.0-1.0) */
  teethVisibility: number;
  
  /** Custom blend shapes */
  customShapes?: Record<string, number>;
}

/**
 * Viseme Transition Properties
 */
export interface VisemeTransition {
  /** Ease-in duration (ms) */
  easeIn: number;
  
  /** Hold duration (ms) */
  hold: number;
  
  /** Ease-out duration (ms) */
  easeOut: number;
  
  /** Transition curve */
  curve: TransitionCurve;
  
  /** Blend weight */
  blendWeight: number;
}

/**
 * Transition Curve Types
 */
export type TransitionCurve = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'cubic' | 'bezier';

/**
 * Lip Sync Timeline Entry
 */
export interface LipSyncTimelineEntry {
  /** Start time (ms) */
  startTime: number;
  
  /** End time (ms) */
  endTime: number;
  
  /** Target viseme */
  viseme: string;
  
  /** Blend weight */
  weight: number;
  
  /** Phoneme data */
  phoneme?: PhonemeData;
  
  /** Co-articulation data */
  coarticulation?: CoarticulationData;
  
  /** Emotion influence */
  emotion?: EmotionInfluence;
}

/**
 * Phoneme Data
 */
export interface PhonemeData {
  /** Phoneme symbol */
  symbol: string;
  
  /** IPA representation */
  ipa: string;
  
  /** Phoneme category */
  category: PhonemeCategory;
  
  /** Articulation features */
  features: ArticulationFeatures;
  
  /** Duration (ms) */
  duration: number;
  
  /** Intensity */
  intensity: number;
}

/**
 * Phoneme Categories
 */
export type PhonemeCategory = 
  | 'vowel' 
  | 'consonant' 
  | 'semivowel' 
  | 'nasal' 
  | 'fricative' 
  | 'plosive' 
  | 'affricate' 
  | 'liquid' 
  | 'silence';

/**
 * Articulation Features
 */
export interface ArticulationFeatures {
  /** Place of articulation */
  place: string;
  
  /** Manner of articulation */
  manner: string;
  
  /** Voicing */
  voiced: boolean;
  
  /** Nasality */
  nasal: boolean;
  
  /** Lip rounding */
  rounded: boolean;
  
  /** Tongue height */
  tongueHeight?: 'high' | 'mid' | 'low';
  
  /** Tongue frontness */
  tongueFrontness?: 'front' | 'central' | 'back';
}

/**
 * Co-articulation Data
 */
export interface CoarticulationData {
  /** Previous phoneme influence */
  previous?: {
    phoneme: string;
    influence: number;
    transitionDuration: number;
  };
  
  /** Next phoneme influence */
  next?: {
    phoneme: string;
    influence: number;
    transitionDuration: number;
  };
  
  /** Context phonemes */
  context: string[];
  
  /** Co-articulation strength */
  strength: number;
}

/**
 * Emotion Influence on Visemes
 */
export interface EmotionInfluence {
  /** Primary emotion */
  emotion: string;
  
  /** Emotion intensity */
  intensity: number;
  
  /** Mouth shape modifications */
  mouthModifications: Partial<MouthShape>;
  
  /** Facial expressions */
  facialExpressions?: FacialExpression[];
}

/**
 * Facial Expression
 */
export interface FacialExpression {
  /** Expression name */
  name: string;
  
  /** Affected facial regions */
  regions: FacialRegion[];
  
  /** Expression intensity */
  intensity: number;
  
  /** Duration (ms) */
  duration: number;
}

/**
 * Facial Regions
 */
export type FacialRegion = 
  | 'eyebrows' 
  | 'eyes' 
  | 'cheeks' 
  | 'nose' 
  | 'mouth' 
  | 'chin' 
  | 'forehead';

/**
 * Viseme Library Definition
 */
export interface VisemeLibraryDefinition {
  /** Library name */
  name: string;
  
  /** Library version */
  version: string;
  
  /** Supported languages */
  languages: string[];
  
  /** Viseme definitions */
  visemes: Viseme[];
  
  /** Phoneme to viseme mapping */
  phonemeMapping: Record<string, string>;
  
  /** Default transition settings */
  defaultTransition: VisemeTransition;
  
  /** Library metadata */
  metadata: {
    author: string;
    description: string;
    license: string;
    references?: string[];
  };
}

/**
 * Lip Sync Engine Configuration
 */
export interface LipSyncEngineConfig {
  /** Target frame rate */
  targetFrameRate: number;
  
  /** Look-ahead time (ms) */
  lookAheadTime: number;
  
  /** Interpolation method */
  interpolation: 'linear' | 'cubic' | 'hermite' | 'bezier';
  
  /** Smoothing window size */
  smoothingWindow: number;
  
  /** Enable predictive blending */
  predictiveBlending: boolean;
  
  /** Quality settings */
  quality: LipSyncQuality;
}

/**
 * Lip Sync Quality Settings
 */
export interface LipSyncQuality {
  /** Temporal resolution */
  temporalResolution: 'low' | 'medium' | 'high' | 'ultra';
  
  /** Spatial resolution */
  spatialResolution: 'low' | 'medium' | 'high' | 'ultra';
  
  /** Enable advanced features */
  advancedFeatures: boolean;
  
  /** CPU usage limit */
  cpuUsageLimit: number;
}

/**
 * Synchronization Data
 */
export interface SynchronizationData {
  /** Audio timestamp */
  audioTimestamp: number;
  
  /** Video frame timestamp */
  videoTimestamp: number;
  
  /** Sync offset (ms) */
  syncOffset: number;
  
  /** Drift compensation */
  driftCompensation: number;
  
  /** Buffer status */
  bufferStatus: BufferStatus;
}

/**
 * Buffer Status
 */
export interface BufferStatus {
  /** Audio buffer level */
  audioBufferLevel: number;
  
  /** Video buffer level */
  videoBufferLevel: number;
  
  /** Underrun count */
  underrunCount: number;
  
  /** Overrun count */
  overrunCount: number;
  
  /** Target buffer size */
  targetBufferSize: number;
}

/**
 * Lip Sync Performance Metrics
 */
export interface LipSyncPerformanceMetrics {
  /** Frame processing time (ms) */
  frameProcessingTime: number;
  
  /** Audio-visual sync accuracy (ms) */
  syncAccuracy: number;
  
  /** CPU usage (%) */
  cpuUsage: number;
  
  /** Memory usage (MB) */
  memoryUsage: number;
  
  /** Dropped frames count */
  droppedFrames: number;
  
  /** Quality score (0.0-1.0) */
  qualityScore: number;
}

/**
 * Lip Sync Event Types
 */
export interface LipSyncEvents {
  /** Timeline entry start */
  onTimelineEntryStart: (entry: LipSyncTimelineEntry) => void;
  
  /** Timeline entry end */
  onTimelineEntryEnd: (entry: LipSyncTimelineEntry) => void;
  
  /** Viseme change */
  onVisemeChange: (from: string, to: string, blend: number) => void;
  
  /** Sync drift detected */
  onSyncDrift: (drift: number) => void;
  
  /** Performance warning */
  onPerformanceWarning: (metrics: LipSyncPerformanceMetrics) => void;
  
  /** Error occurred */
  onError: (error: Error) => void;
}