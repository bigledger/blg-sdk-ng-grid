/**
 * Message priority levels
 */
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Message types
 */
export type MessageType = 
  | 'text'
  | 'audio'
  | 'gesture'
  | 'emotion'
  | 'command'
  | 'streaming';

/**
 * Gesture timing information
 */
export interface GestureTiming {
  /** When to start gesture relative to speech (milliseconds) */
  startTime: number;
  
  /** Duration of gesture (milliseconds) */
  duration: number;
  
  /** Whether gesture should repeat */
  repeat: boolean;
  
  /** Intensity of gesture (0.0 - 1.0) */
  intensity: number;
}

/**
 * Emotion timing and intensity
 */
export interface EmotionTiming {
  /** When to start emotion relative to message (milliseconds) */
  startTime: number;
  
  /** Duration of emotion (milliseconds) */
  duration: number;
  
  /** Intensity of emotion (0.0 - 1.0) */
  intensity: number;
  
  /** Whether to blend with current emotion */
  blend: boolean;
}

/**
 * Audio processing instructions
 */
export interface AudioInstructions {
  /** Volume adjustment (0.0 - 2.0) */
  volume?: number;
  
  /** Speed adjustment (0.5 - 2.0) */
  speed?: number;
  
  /** Pitch adjustment (-1.0 - 1.0) */
  pitch?: number;
  
  /** Audio effects to apply */
  effects?: string[];
  
  /** Whether to enable lip sync */
  lipSync: boolean;
  
  /** Audio format */
  format?: 'wav' | 'mp3' | 'ogg';
  
  /** Sample rate */
  sampleRate?: number;
}

/**
 * Base avatar message interface
 */
export interface BaseAvatarMessage {
  /** Unique message identifier */
  id: string;
  
  /** Message type */
  type: MessageType;
  
  /** Message priority */
  priority: MessagePriority;
  
  /** Timestamp when message was created */
  timestamp: number;
  
  /** Whether message should interrupt current activity */
  interrupt: boolean;
  
  /** Message metadata */
  metadata?: Record<string, any>;
}

/**
 * Text message for avatar to speak
 */
export interface TextMessage extends BaseAvatarMessage {
  type: 'text';
  
  /** Text content to speak */
  text: string;
  
  /** Language code (overrides avatar config) */
  language?: string;
  
  /** Voice settings for this message */
  voice?: {
    provider?: string;
    voiceId?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  };
  
  /** Gestures to perform during speech */
  gestures?: Array<{
    type: string;
    timing: GestureTiming;
  }>;
  
  /** Emotions to express during speech */
  emotions?: Array<{
    emotion: string;
    timing: EmotionTiming;
  }>;
  
  /** Audio processing instructions */
  audioInstructions?: AudioInstructions;
}

/**
 * Pre-recorded audio message
 */
export interface AudioMessage extends BaseAvatarMessage {
  type: 'audio';
  
  /** Audio data (URL, base64, or ArrayBuffer) */
  audioData: string | ArrayBuffer;
  
  /** Audio format */
  format: 'wav' | 'mp3' | 'ogg';
  
  /** Duration in milliseconds */
  duration: number;
  
  /** Whether to show lip sync animation */
  lipSync: boolean;
  
  /** Accompanying gestures */
  gestures?: Array<{
    type: string;
    timing: GestureTiming;
  }>;
}

/**
 * Gesture-only message
 */
export interface GestureMessage extends BaseAvatarMessage {
  type: 'gesture';
  
  /** Gesture type to perform */
  gesture: string;
  
  /** Gesture timing and settings */
  timing: GestureTiming;
  
  /** Whether gesture should be additive to current state */
  additive: boolean;
}

/**
 * Emotion change message
 */
export interface EmotionMessage extends BaseAvatarMessage {
  type: 'emotion';
  
  /** Target emotion */
  emotion: string;
  
  /** Timing and blending settings */
  timing: EmotionTiming;
  
  /** Whether to reset to neutral after duration */
  resetToNeutral: boolean;
}

/**
 * Command message for avatar control
 */
export interface CommandMessage extends BaseAvatarMessage {
  type: 'command';
  
  /** Command to execute */
  command: 'pause' | 'resume' | 'stop' | 'reset' | 'clear-queue';
  
  /** Command parameters */
  parameters?: Record<string, any>;
}

/**
 * Streaming message for real-time content
 */
export interface StreamingMessage extends BaseAvatarMessage {
  type: 'streaming';
  
  /** Streaming session ID */
  sessionId: string;
  
  /** Whether this is the start, continuation, or end of stream */
  streamType: 'start' | 'chunk' | 'end';
  
  /** Text chunk (for text streaming) */
  textChunk?: string;
  
  /** Audio chunk (for audio streaming) */
  audioChunk?: ArrayBuffer;
  
  /** Whether this chunk is complete */
  isComplete: boolean;
  
  /** Sequence number for ordering */
  sequence: number;
  
  /** Expected total chunks (if known) */
  totalChunks?: number;
}

/**
 * Union type for all message types
 */
export type AvatarMessage = 
  | TextMessage
  | AudioMessage
  | GestureMessage
  | EmotionMessage
  | CommandMessage
  | StreamingMessage;

/**
 * Message processing result
 */
export interface MessageResult {
  /** Message ID */
  messageId: string;
  
  /** Whether processing was successful */
  success: boolean;
  
  /** Processing duration in milliseconds */
  duration: number;
  
  /** Error information if processing failed */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  
  /** Generated audio data (if applicable) */
  audioData?: ArrayBuffer;
  
  /** Generated gestures */
  generatedGestures?: Array<{
    type: string;
    timing: GestureTiming;
  }>;
  
  /** Detected emotions */
  detectedEmotions?: Array<{
    emotion: string;
    confidence: number;
    timing: EmotionTiming;
  }>;
}