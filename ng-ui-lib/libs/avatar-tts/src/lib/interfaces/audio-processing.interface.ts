/**
 * Audio Processing Interfaces
 */

/**
 * Audio Analysis Data
 */
export interface AudioAnalysisData {
  /** Time domain data */
  timeDomain: Float32Array;
  
  /** Frequency domain data (FFT) */
  frequencyDomain: Float32Array;
  
  /** Audio amplitude */
  amplitude: number;
  
  /** Fundamental frequency (F0) */
  fundamentalFreq?: number;
  
  /** Spectral centroid */
  spectralCentroid?: number;
  
  /** Zero crossing rate */
  zeroCrossingRate?: number;
  
  /** Energy */
  energy: number;
  
  /** Timestamp */
  timestamp: number;
}

/**
 * Phoneme Analysis Result
 */
export interface PhonemeAnalysisResult {
  /** Detected phoneme */
  phoneme: string;
  
  /** Confidence level (0.0-1.0) */
  confidence: number;
  
  /** Start time (ms) */
  startTime: number;
  
  /** Duration (ms) */
  duration: number;
  
  /** Intensity */
  intensity: number;
  
  /** Formant frequencies */
  formants?: number[];
}

/**
 * Audio Buffer Configuration
 */
export interface AudioBufferConfig {
  /** Buffer size in samples */
  bufferSize: number;
  
  /** Number of input channels */
  numberOfInputChannels: number;
  
  /** Number of output channels */
  numberOfOutputChannels: number;
  
  /** Sample rate */
  sampleRate: number;
}

/**
 * FFT Configuration
 */
export interface FFTConfig {
  /** FFT size (power of 2) */
  size: number;
  
  /** Window function */
  windowFunction: WindowFunction;
  
  /** Overlap factor */
  overlapFactor: number;
  
  /** Frequency bins */
  frequencyBins?: number;
}

/**
 * Window Function Types
 */
export type WindowFunction = 'hanning' | 'hamming' | 'blackman' | 'rectangular' | 'kaiser';

/**
 * Audio Feature Extraction Result
 */
export interface AudioFeatures {
  /** Mel-frequency cepstral coefficients */
  mfcc?: number[];
  
  /** Spectral features */
  spectral: SpectralFeatures;
  
  /** Temporal features */
  temporal: TemporalFeatures;
  
  /** Prosodic features */
  prosodic?: ProsodicFeatures;
}

/**
 * Spectral Features
 */
export interface SpectralFeatures {
  /** Spectral centroid */
  centroid: number;
  
  /** Spectral bandwidth */
  bandwidth: number;
  
  /** Spectral rolloff */
  rolloff: number;
  
  /** Spectral flux */
  flux: number;
  
  /** Spectral flatness */
  flatness: number;
}

/**
 * Temporal Features
 */
export interface TemporalFeatures {
  /** Zero crossing rate */
  zeroCrossingRate: number;
  
  /** Energy */
  energy: number;
  
  /** Root mean square */
  rms: number;
  
  /** Autocorrelation */
  autocorrelation?: number[];
}

/**
 * Prosodic Features
 */
export interface ProsodicFeatures {
  /** Fundamental frequency */
  f0: number;
  
  /** F0 contour */
  f0Contour: number[];
  
  /** Intensity contour */
  intensityContour: number[];
  
  /** Speaking rate */
  speakingRate?: number;
}

/**
 * Real-time Audio Processing Configuration
 */
export interface RealTimeAudioConfig {
  /** Processing frame size */
  frameSize: number;
  
  /** Hop size */
  hopSize: number;
  
  /** Latency target (ms) */
  latencyTarget: number;
  
  /** Quality vs latency trade-off */
  qualityMode: 'realtime' | 'balanced' | 'quality';
}

/**
 * Audio Stream Configuration
 */
export interface AudioStreamConfig {
  /** Enable echo cancellation */
  echoCancellation?: boolean;
  
  /** Enable noise suppression */
  noiseSuppression?: boolean;
  
  /** Enable auto gain control */
  autoGainControl?: boolean;
  
  /** Sample rate */
  sampleRate?: number;
  
  /** Channel count */
  channelCount?: number;
}

/**
 * Frequency Band Configuration
 */
export interface FrequencyBandConfig {
  /** Low frequency (Hz) */
  lowFreq: number;
  
  /** High frequency (Hz) */
  highFreq: number;
  
  /** Band name */
  name: string;
  
  /** Weight for analysis */
  weight?: number;
}

/**
 * Phoneme Detection Configuration
 */
export interface PhonemeDetectionConfig {
  /** Detection method */
  method: 'template' | 'neural' | 'hybrid';
  
  /** Language model */
  languageModel?: string;
  
  /** Confidence threshold */
  confidenceThreshold: number;
  
  /** Maximum phoneme duration (ms) */
  maxDuration: number;
  
  /** Minimum phoneme duration (ms) */
  minDuration: number;
}

/**
 * Voice Activity Detection Result
 */
export interface VADResult {
  /** Is voice activity detected */
  isVoice: boolean;
  
  /** Confidence level */
  confidence: number;
  
  /** Energy level */
  energy: number;
  
  /** Timestamp */
  timestamp: number;
}

/**
 * Audio Processing Pipeline Stage
 */
export interface AudioProcessingStage {
  /** Stage name */
  name: string;
  
  /** Processing function */
  process: (input: Float32Array) => Float32Array | AudioAnalysisData;
  
  /** Stage configuration */
  config?: Record<string, any>;
  
  /** Enabled flag */
  enabled: boolean;
}

/**
 * Audio Processing Pipeline
 */
export interface AudioProcessingPipeline {
  /** Pipeline stages */
  stages: AudioProcessingStage[];
  
  /** Pipeline configuration */
  config: AudioBufferConfig;
  
  /** Error handler */
  onError?: (error: Error, stage: string) => void;
  
  /** Progress callback */
  onProgress?: (stage: string, progress: number) => void;
}