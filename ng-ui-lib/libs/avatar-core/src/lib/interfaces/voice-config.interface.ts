/**
 * Supported voice providers
 */
export type VoiceProvider = 
  | 'elevenlabs'
  | 'azure'
  | 'google'
  | 'amazon'
  | 'openai'
  | 'browser'
  | 'custom';

/**
 * Voice gender types
 */
export type VoiceGender = 'male' | 'female' | 'neutral';

/**
 * Voice age categories
 */
export type VoiceAge = 'child' | 'young' | 'middle' | 'elderly';

/**
 * Voice style/emotion options
 */
export type VoiceStyle = 
  | 'neutral'
  | 'cheerful'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'calm'
  | 'professional'
  | 'friendly'
  | 'serious'
  | 'whispering'
  | 'shouting';

/**
 * SSML (Speech Synthesis Markup Language) settings
 */
export interface SSMLConfig {
  /** Enable SSML processing */
  enabled: boolean;
  
  /** Supported SSML tags */
  supportedTags: string[];
  
  /** Auto-generate prosody tags */
  autoGenerateProsody: boolean;
  
  /** Auto-generate break tags */
  autoGenerateBreaks: boolean;
  
  /** Custom SSML preprocessing rules */
  preprocessingRules?: Record<string, string>;
}

/**
 * Voice synthesis settings
 */
export interface VoiceSynthesisConfig {
  /** Synthesis engine settings */
  engine: {
    /** Synthesis model/engine version */
    model: string;
    /** Quality setting */
    quality: 'low' | 'medium' | 'high' | 'premium';
    /** Enable neural synthesis */
    neural: boolean;
    /** Streaming synthesis */
    streaming: boolean;
  };
  
  /** Prosody controls */
  prosody: {
    /** Speaking rate (0.25 - 4.0) */
    rate: number;
    /** Pitch adjustment (-50% to +200%) */
    pitch: number;
    /** Volume level (0% to 100%) */
    volume: number;
    /** Emphasis level */
    emphasis: 'none' | 'reduced' | 'moderate' | 'strong';
  };
  
  /** Audio output settings */
  output: {
    /** Audio format */
    format: 'wav' | 'mp3' | 'ogg' | 'pcm';
    /** Sample rate (Hz) */
    sampleRate: number;
    /** Bit rate (for compressed formats) */
    bitRate?: number;
    /** Mono or stereo */
    channels: 1 | 2;
  };
  
  /** Advanced settings */
  advanced: {
    /** Pronunciation dictionary */
    pronunciationDict?: Record<string, string>;
    /** Custom lexicon URL */
    lexiconUrl?: string;
    /** Enable word-level timestamps */
    wordTimestamps: boolean;
    /** Enable phoneme data */
    phonemeData: boolean;
  };
}

/**
 * Voice preprocessing options
 */
export interface VoicePreprocessing {
  /** Text normalization */
  normalization: {
    /** Expand abbreviations */
    expandAbbreviations: boolean;
    /** Normalize numbers */
    normalizeNumbers: boolean;
    /** Handle currency */
    handleCurrency: boolean;
    /** Handle dates and times */
    handleDateTime: boolean;
    /** Handle URLs and emails */
    handleUrlsEmails: boolean;
  };
  
  /** Emotion and style detection */
  emotionDetection: {
    /** Enable automatic emotion detection */
    enabled: boolean;
    /** Confidence threshold */
    confidenceThreshold: number;
    /** Apply detected emotions to voice */
    applyToVoice: boolean;
  };
  
  /** Punctuation handling */
  punctuation: {
    /** Handle parentheses */
    handleParentheses: boolean;
    /** Handle quotes */
    handleQuotes: boolean;
    /** Handle ellipsis */
    handleEllipsis: boolean;
    /** Custom punctuation rules */
    customRules?: Record<string, string>;
  };
}

/**
 * Voice caching configuration
 */
export interface VoiceCacheConfig {
  /** Enable voice caching */
  enabled: boolean;
  
  /** Cache size limit (MB) */
  sizeLimit: number;
  
  /** Cache expiration time (milliseconds) */
  expirationTime: number;
  
  /** Cache key strategy */
  keyStrategy: 'text-hash' | 'text-voice-hash' | 'custom';
  
  /** Preload common phrases */
  preloadPhrases: string[];
  
  /** Cache storage type */
  storage: 'memory' | 'indexeddb' | 'localstorage';
}

/**
 * Individual voice configuration
 */
export interface VoiceProfile {
  /** Unique voice identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Voice provider */
  provider: VoiceProvider;
  
  /** Provider-specific voice ID */
  providerVoiceId: string;
  
  /** Language and locale */
  language: string;
  locale: string;
  
  /** Voice characteristics */
  characteristics: {
    gender: VoiceGender;
    age: VoiceAge;
    accent?: string;
    description?: string;
  };
  
  /** Default style */
  defaultStyle: VoiceStyle;
  
  /** Supported styles */
  supportedStyles: VoiceStyle[];
  
  /** Voice synthesis settings */
  synthesis: VoiceSynthesisConfig;
  
  /** Preview audio URL */
  previewUrl?: string;
  
  /** Voice rating/quality score */
  qualityScore?: number;
  
  /** Whether voice is premium/paid */
  isPremium: boolean;
}

/**
 * Complete voice configuration interface
 */
export interface VoiceConfig {
  /** Configuration identifier */
  id: string;
  
  /** Active voice profile */
  activeVoice: VoiceProfile;
  
  /** Available voice profiles */
  availableVoices: VoiceProfile[];
  
  /** Default language for voice selection */
  defaultLanguage: string;
  
  /** Voice preprocessing settings */
  preprocessing: VoicePreprocessing;
  
  /** SSML configuration */
  ssml: SSMLConfig;
  
  /** Voice caching settings */
  cache: VoiceCacheConfig;
  
  /** Fallback voice configuration */
  fallback: {
    /** Enable fallback voice */
    enabled: boolean;
    /** Fallback voice profile */
    voiceProfile: VoiceProfile;
    /** Fallback triggers */
    triggers: ('error' | 'unavailable' | 'timeout')[];
  };
  
  /** Provider configurations */
  providers: Record<VoiceProvider, {
    /** API key or credentials */
    credentials?: Record<string, string>;
    /** API endpoint URL */
    endpoint?: string;
    /** Rate limits */
    rateLimit?: {
      requestsPerMinute: number;
      charactersPerMinute: number;
    };
    /** Provider-specific settings */
    settings?: Record<string, any>;
  }>;
  
  /** Performance settings */
  performance: {
    /** Concurrent synthesis limit */
    maxConcurrentSynthesis: number;
    /** Request timeout (milliseconds) */
    requestTimeout: number;
    /** Retry attempts */
    retryAttempts: number;
    /** Retry delay (milliseconds) */
    retryDelay: number;
  };
  
  /** Debug and monitoring */
  debug: {
    /** Enable debug logging */
    logging: boolean;
    /** Log synthesis requests */
    logRequests: boolean;
    /** Log audio generation */
    logAudioGeneration: boolean;
    /** Performance monitoring */
    monitoring: boolean;
  };
}