/**
 * WebSocket connection configuration
 */
export interface WebSocketConfig {
  /** WebSocket server URL */
  url: string;
  
  /** Connection protocols */
  protocols?: string[];
  
  /** Connection timeout in milliseconds */
  timeout: number;
  
  /** Maximum reconnection attempts */
  maxReconnectAttempts: number;
  
  /** Delay between reconnection attempts (milliseconds) */
  reconnectDelay: number;
  
  /** Whether to enable automatic reconnection */
  autoReconnect: boolean;
  
  /** Ping interval for keep-alive (milliseconds) */
  pingInterval: number;
  
  /** Pong timeout (milliseconds) */
  pongTimeout: number;
  
  /** Maximum message size in bytes */
  maxMessageSize: number;
  
  /** Authentication headers */
  headers?: Record<string, string>;
  
  /** Query parameters */
  query?: Record<string, string>;
}

/**
 * Audio streaming configuration
 */
export interface AudioStreamConfig {
  /** Audio format for streaming */
  format: 'wav' | 'mp3' | 'ogg' | 'pcm';
  
  /** Sample rate (Hz) */
  sampleRate: number;
  
  /** Bit depth */
  bitDepth: 8 | 16 | 24 | 32;
  
  /** Number of audio channels */
  channels: number;
  
  /** Buffer size for audio chunks (bytes) */
  bufferSize: number;
  
  /** Minimum buffer threshold before playback */
  minBufferSize: number;
  
  /** Maximum buffer size to prevent memory issues */
  maxBufferSize: number;
  
  /** Audio chunk duration (milliseconds) */
  chunkDuration: number;
  
  /** Enable audio compression */
  compression: boolean;
  
  /** Compression quality (0-10) */
  compressionQuality: number;
  
  /** Enable real-time processing */
  realTimeProcessing: boolean;
  
  /** Latency target (milliseconds) */
  targetLatency: number;
}

/**
 * Text streaming configuration
 */
export interface TextStreamConfig {
  /** Text encoding */
  encoding: 'utf-8' | 'utf-16' | 'ascii';
  
  /** Chunk size for text streaming (characters) */
  chunkSize: number;
  
  /** Delimiter for sentence boundaries */
  sentenceDelimiter: string;
  
  /** Delimiter for word boundaries */
  wordDelimiter: string;
  
  /** Whether to stream word by word */
  wordByWord: boolean;
  
  /** Buffer size for text chunks */
  bufferSize: number;
  
  /** Enable text preprocessing */
  preprocessing: boolean;
  
  /** Text normalization options */
  normalization: {
    /** Convert to lowercase */
    lowercase: boolean;
    /** Remove extra whitespace */
    trimWhitespace: boolean;
    /** Expand contractions */
    expandContractions: boolean;
    /** Normalize punctuation */
    normalizePunctuation: boolean;
  };
}

/**
 * Stream quality configuration
 */
export interface StreamQualityConfig {
  /** Bandwidth limit (bytes per second) */
  bandwidthLimit?: number;
  
  /** Quality adaptation settings */
  adaptation: {
    /** Enable automatic quality adjustment */
    enabled: boolean;
    /** Minimum quality level (0.0 - 1.0) */
    minQuality: number;
    /** Maximum quality level (0.0 - 1.0) */
    maxQuality: number;
    /** Quality adjustment step size */
    stepSize: number;
    /** Evaluation interval (milliseconds) */
    evaluationInterval: number;
  };
  
  /** Error recovery settings */
  errorRecovery: {
    /** Enable automatic error recovery */
    enabled: boolean;
    /** Maximum consecutive errors before fallback */
    maxConsecutiveErrors: number;
    /** Fallback quality level */
    fallbackQuality: number;
    /** Recovery timeout (milliseconds) */
    recoveryTimeout: number;
  };
  
  /** Performance monitoring */
  monitoring: {
    /** Enable performance monitoring */
    enabled: boolean;
    /** Metrics collection interval (milliseconds) */
    metricsInterval: number;
    /** Performance history size */
    historySize: number;
  };
}

/**
 * Stream security configuration
 */
export interface StreamSecurityConfig {
  /** Enable TLS/SSL encryption */
  tls: boolean;
  
  /** Certificate validation */
  certificateValidation: boolean;
  
  /** Authentication token */
  authToken?: string;
  
  /** API key */
  apiKey?: string;
  
  /** Session timeout (milliseconds) */
  sessionTimeout: number;
  
  /** Rate limiting */
  rateLimit: {
    /** Maximum requests per minute */
    requestsPerMinute: number;
    /** Maximum bytes per minute */
    bytesPerMinute: number;
    /** Burst allowance */
    burstAllowance: number;
  };
  
  /** Content filtering */
  contentFilter: {
    /** Enable profanity filtering */
    profanityFilter: boolean;
    /** Maximum message length */
    maxMessageLength: number;
    /** Blocked words/phrases */
    blockedTerms: string[];
  };
}

/**
 * Complete streaming configuration interface
 */
export interface StreamConfig {
  /** Unique configuration identifier */
  id: string;
  
  /** Configuration name/description */
  name: string;
  
  /** Whether streaming is enabled */
  enabled: boolean;
  
  /** WebSocket connection settings */
  websocket: WebSocketConfig;
  
  /** Audio streaming settings */
  audio: AudioStreamConfig;
  
  /** Text streaming settings */
  text: TextStreamConfig;
  
  /** Quality and performance settings */
  quality: StreamQualityConfig;
  
  /** Security settings */
  security: StreamSecurityConfig;
  
  /** Custom headers for requests */
  customHeaders?: Record<string, string>;
  
  /** Environment-specific settings */
  environment: 'development' | 'staging' | 'production';
  
  /** Debug settings */
  debug: {
    /** Enable debug logging */
    logging: boolean;
    /** Log level */
    logLevel: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    /** Log WebSocket messages */
    logMessages: boolean;
    /** Log performance metrics */
    logMetrics: boolean;
  };
  
  /** Feature flags */
  features: {
    /** Enable text-to-speech streaming */
    ttsStreaming: boolean;
    /** Enable audio streaming */
    audioStreaming: boolean;
    /** Enable real-time transcription */
    transcription: boolean;
    /** Enable gesture generation */
    gestureGeneration: boolean;
    /** Enable emotion detection */
    emotionDetection: boolean;
  };
}