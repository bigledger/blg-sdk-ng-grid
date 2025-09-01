/**
 * Avatar animation states
 */
export type AvatarAnimationState = 
  | 'idle'
  | 'speaking'
  | 'listening'
  | 'thinking'
  | 'gesturing'
  | 'transitioning';

/**
 * Avatar emotion states
 */
export type AvatarEmotion = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'surprised'
  | 'angry'
  | 'confused'
  | 'excited'
  | 'thoughtful';

/**
 * Avatar gesture types
 */
export type AvatarGesture = 
  | 'none'
  | 'wave'
  | 'point'
  | 'nod'
  | 'shake-head'
  | 'shrug'
  | 'thumbs-up'
  | 'thumbs-down'
  | 'clap'
  | 'thinking'
  | 'explaining'
  | 'emphasizing';

/**
 * Audio processing state
 */
export interface AudioState {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  
  /** Current audio buffer position */
  currentTime: number;
  
  /** Total duration of current audio */
  duration: number;
  
  /** Audio volume level (0.0 - 1.0) */
  volume: number;
  
  /** Whether audio is muted */
  muted: boolean;
  
  /** Current audio chunk being processed */
  currentChunk?: ArrayBuffer;
  
  /** Audio processing queue length */
  queueLength: number;
}

/**
 * Speech state information
 */
export interface SpeechState {
  /** Whether currently speaking */
  isSpeaking: boolean;
  
  /** Current text being spoken */
  currentText?: string;
  
  /** Progress through current text (0.0 - 1.0) */
  progress: number;
  
  /** Current word being spoken */
  currentWord?: string;
  
  /** Word index in current text */
  wordIndex: number;
  
  /** Estimated time remaining (milliseconds) */
  timeRemaining: number;
  
  /** Speech speed (words per minute) */
  wpm: number;
}

/**
 * Animation state information
 */
export interface AnimationState {
  /** Current primary animation */
  current: AvatarAnimationState;
  
  /** Queue of upcoming animations */
  queue: AvatarAnimationState[];
  
  /** Current gesture being performed */
  currentGesture: AvatarGesture;
  
  /** Gesture queue */
  gestureQueue: AvatarGesture[];
  
  /** Current emotion expression */
  emotion: AvatarEmotion;
  
  /** Animation loop count */
  loopCount: number;
  
  /** Whether animations are paused */
  paused: boolean;
}

/**
 * Connection state for streaming
 */
export interface ConnectionState {
  /** WebSocket connection status */
  websocket: 'disconnected' | 'connecting' | 'connected' | 'error';
  
  /** Audio stream status */
  audioStream: 'idle' | 'streaming' | 'buffering' | 'error';
  
  /** Text stream status */
  textStream: 'idle' | 'streaming' | 'complete' | 'error';
  
  /** Connection quality (0.0 - 1.0) */
  quality: number;
  
  /** Latency in milliseconds */
  latency: number;
  
  /** Reconnection attempts */
  reconnectAttempts: number;
  
  /** Last error message */
  lastError?: string;
}

/**
 * Performance metrics
 */
export interface PerformanceState {
  /** Current frames per second */
  fps: number;
  
  /** Memory usage in MB */
  memoryUsage: number;
  
  /** CPU usage percentage */
  cpuUsage: number;
  
  /** Audio buffer health (0.0 - 1.0) */
  audioBufferHealth: number;
  
  /** Render time in milliseconds */
  renderTime: number;
  
  /** Audio processing time */
  audioProcessingTime: number;
  
  /** Total active animations */
  activeAnimations: number;
}

/**
 * Complete avatar state interface
 */
export interface AvatarState {
  /** Unique identifier for the avatar */
  id: string;
  
  /** Whether avatar is initialized and ready */
  initialized: boolean;
  
  /** Overall avatar status */
  status: 'initializing' | 'ready' | 'busy' | 'error' | 'disposed';
  
  /** Current animation state */
  animation: AnimationState;
  
  /** Current speech state */
  speech: SpeechState;
  
  /** Current audio state */
  audio: AudioState;
  
  /** Connection state for streaming */
  connection: ConnectionState;
  
  /** Performance metrics */
  performance: PerformanceState;
  
  /** Timestamp of last state update */
  lastUpdate: number;
  
  /** Current message being processed */
  currentMessage?: string;
  
  /** Message queue length */
  messageQueueLength: number;
  
  /** Error information if in error state */
  error?: {
    code: string;
    message: string;
    timestamp: number;
    recoverable: boolean;
  };
}