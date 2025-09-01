# BigLedger Avatar Library - API Reference

Complete API documentation for the BigLedger Avatar Library components, services, and interfaces.

## Table of Contents

- [Core Interfaces](#core-interfaces)
- [Avatar 2D Component](#avatar-2d-component)
- [Avatar 3D Component](#avatar-3d-component)
- [Avatar TTS Component](#avatar-tts-component)
- [Core Services](#core-services)
- [Configuration Schemas](#configuration-schemas)
- [Events and Callbacks](#events-and-callbacks)
- [Error Handling](#error-handling)

## Core Interfaces

### AvatarConfig

The main configuration interface for avatar instances.

```typescript
interface AvatarConfig {
  /** Unique identifier for the avatar instance */
  id: string;
  
  /** Avatar appearance settings */
  appearance: AvatarAppearance;
  
  /** Avatar behavior settings */
  behavior: AvatarBehavior;
  
  /** Voice configuration */
  voice: VoiceConfig;
  
  /** Audio processing settings */
  audio: AudioConfig;
  
  /** Performance settings */
  performance: PerformanceConfig;
  
  /** Feature flags */
  features: FeatureConfig;
}
```

#### AvatarAppearance

```typescript
interface AvatarAppearance {
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
```

#### AvatarBehavior

```typescript
interface AvatarBehavior {
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
```

### AvatarState

Real-time state information for avatar instances.

```typescript
interface AvatarState {
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
```

## Avatar 2D Component

The main 2D avatar rendering component.

### Component API

```typescript
@Component({
  selector: 'ng-ui-avatar-2d'
})
export class Avatar2d implements OnInit, OnDestroy {
  // Inputs
  configuration = input<AvatarConfiguration | null>(null);
  renderMode = input<'canvas' | 'svg'>('canvas');
  size = input<Size2D>({ width: 300, height: 400 });
  quality = input<'low' | 'medium' | 'high'>('medium');
  antialiasing = input(true);
  backgroundTransparent = input(true);
  showControls = input(false);
  showCustomizer = input(false);
  showPerformanceStats = input(false);
  lipSyncEnabled = input(false);
  autoPlay = input(false);
  fullscreen = input(false);
  ariaLabel = input<string>();

  // Outputs
  expressionChanged = output<FacialExpression>();
  gestureStarted = output<Gesture>();
  gestureCompleted = output<Gesture>();
  lipSyncStarted = output<LipSyncData>();
  lipSyncCompleted = output<void>();
  configurationChanged = output<AvatarConfiguration>();
  renderingError = output<Error>();
}
```

### Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `configuration` | `AvatarConfiguration \| null` | `null` | Avatar appearance and behavior configuration |
| `renderMode` | `'canvas' \| 'svg'` | `'canvas'` | Rendering engine to use |
| `size` | `Size2D` | `{width: 300, height: 400}` | Avatar dimensions |
| `quality` | `'low' \| 'medium' \| 'high'` | `'medium'` | Rendering quality level |
| `antialiasing` | `boolean` | `true` | Enable anti-aliasing |
| `backgroundTransparent` | `boolean` | `true` | Transparent background |
| `showControls` | `boolean` | `false` | Show built-in controls |
| `showCustomizer` | `boolean` | `false` | Show customization panel |
| `showPerformanceStats` | `boolean` | `false` | Show performance overlay |
| `lipSyncEnabled` | `boolean` | `false` | Enable lip synchronization |
| `autoPlay` | `boolean` | `false` | Auto-start animations |
| `fullscreen` | `boolean` | `false` | Fullscreen mode |
| `ariaLabel` | `string` | `undefined` | Accessibility label |

### Output Events

| Event | Payload | Description |
|-------|---------|-------------|
| `expressionChanged` | `FacialExpression` | Facial expression changed |
| `gestureStarted` | `Gesture` | Gesture animation started |
| `gestureCompleted` | `Gesture` | Gesture animation completed |
| `lipSyncStarted` | `LipSyncData` | Lip sync animation started |
| `lipSyncCompleted` | `void` | Lip sync animation completed |
| `configurationChanged` | `AvatarConfiguration` | Avatar configuration updated |
| `renderingError` | `Error` | Rendering error occurred |

### Public Methods

```typescript
class Avatar2d {
  /** Change facial expression */
  changeExpression(expression: FacialExpression, duration?: number): Promise<void>;
  
  /** Play a gesture */
  playGesture(gesture: Gesture): Promise<void>;
  
  /** Check if a specific gesture is playing */
  isPlayingGesture(gestureId: string): boolean;
  
  /** Toggle lip sync */
  toggleLipSync(): Promise<void>;
  
  /** Load audio file for lip sync */
  loadAudioFile(event: Event): Promise<void>;
  
  /** Export as PNG */
  exportAsPNG(): void;
  
  /** Export as SVG */
  exportAsSVG(): void;
  
  /** Export configuration */
  exportConfiguration(): void;
}
```

### Usage Example

```typescript
@Component({
  template: `
    <ng-ui-avatar-2d
      [configuration]="config"
      [size]="{width: 400, height: 500}"
      [renderMode]="'canvas'"
      [quality]="'high'"
      [showControls]="true"
      [lipSyncEnabled]="true"
      (expressionChanged)="onExpressionChanged($event)"
      (gestureStarted)="onGestureStarted($event)">
    </ng-ui-avatar-2d>
  `
})
export class MyComponent {
  config: AvatarConfiguration = {
    character: {
      name: 'Assistant',
      model: 'young-woman',
      // ... other properties
    },
    // ... rest of configuration
  };

  onExpressionChanged(expression: FacialExpression) {
    console.log('Expression changed:', expression);
  }

  onGestureStarted(gesture: Gesture) {
    console.log('Gesture started:', gesture);
  }
}
```

## Avatar 3D Component

3D avatar rendering component using WebGL.

### Component API

```typescript
@Component({
  selector: 'lib-avatar3d'
})
export class Avatar3d {
  // Basic implementation - API to be expanded
}
```

*Note: The 3D avatar component is currently in development. Full API documentation will be available in future releases.*

## Avatar TTS Component

Text-to-speech integration with lip synchronization.

### Component API

```typescript
@Component({
  selector: 'lib-avatar-tts'
})
export class AvatarTts implements OnInit, OnDestroy {
  // Inputs
  readonly config = input.required<TTSConfig>();
  readonly text = input<string>('');
  readonly autoPlay = input<boolean>(false);
  readonly enableVisualizer = input<boolean>(true);
  readonly avatarModel = input<string>('default');
  
  // Outputs
  readonly speechStart = output<{ text: string; timestamp: number }>();
  readonly speechEnd = output<{ text: string; timestamp: number }>();
  readonly speechError = output<Error>();
  readonly visemeChange = output<{ viseme: string; mouthShape: MouthShape }>();
  readonly emotionChange = output<{ emotion: string; intensity: number }>();
  readonly animationUpdate = output<AvatarAnimationState>();
}
```

### TTSConfig Interface

```typescript
interface TTSConfig {
  /** TTS provider */
  provider: string;
  
  /** Voice configuration */
  voice: {
    voiceId: string;
    language: string;
    rate: number;
    pitch: number;
    volume: number;
  };
  
  /** Feature settings */
  features: {
    emotionDetection: boolean;
    gestureGeneration: boolean;
    lipSyncQuality: 'low' | 'medium' | 'high';
  };
  
  /** Lip sync configuration */
  lipSync: {
    enabled: boolean;
    visemeLibrary: string;
    smoothing: number;
    delay: number;
  };
}
```

### Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `config` | `TTSConfig` | required | TTS configuration |
| `text` | `string` | `''` | Text to be spoken |
| `autoPlay` | `boolean` | `false` | Auto-play when text changes |
| `enableVisualizer` | `boolean` | `true` | Show audio visualizer |
| `avatarModel` | `string` | `'default'` | Avatar model identifier |

### Output Events

| Event | Payload | Description |
|-------|---------|-------------|
| `speechStart` | `{text: string, timestamp: number}` | Speech synthesis started |
| `speechEnd` | `{text: string, timestamp: number}` | Speech synthesis ended |
| `speechError` | `Error` | Speech synthesis error |
| `visemeChange` | `{viseme: string, mouthShape: MouthShape}` | Mouth shape for lip sync |
| `emotionChange` | `{emotion: string, intensity: number}` | Detected emotion change |
| `animationUpdate` | `AvatarAnimationState` | Animation state update |

### Public Methods

```typescript
class AvatarTts {
  /** Speak the provided text with lip sync */
  speak(text: string): Promise<void>;
  
  /** Stop current speech and animation */
  stop(): void;
  
  /** Pause current speech */
  pause(): void;
  
  /** Resume paused speech */
  resume(): void;
  
  /** Set emotion manually */
  setEmotion(emotion: string, intensity: number, duration?: number): void;
  
  /** Trigger gesture manually */
  triggerGesture(gestureType: string, intensity?: number, duration?: number): void;
  
  /** Get current audio analysis data */
  getAudioAnalysis(): any;
  
  /** Get synchronization quality */
  getSyncQuality(): number;
  
  /** Calibrate audio-visual synchronization */
  calibrateSync(): Promise<void>;
}
```

## Core Services

### AvatarStateService

Central state management for avatar instances.

```typescript
@Injectable({
  providedIn: 'root'
})
export class AvatarStateService {
  // Public signals
  readonly avatars: Signal<Map<string, AvatarState>>;
  readonly activeAvatarId: Signal<string | null>;
  readonly activeAvatar: Signal<AvatarState | null>;
  readonly avatarList: Signal<AvatarState[]>;
  readonly activeAvatarCount: Signal<number>;
  readonly totalMessageQueueLength: Signal<number>;
  readonly isProcessingAnyMessages: Signal<boolean>;
  
  // Public observables
  readonly messageProcessed: Observable<{avatarId: string; result: MessageResult}>;
  readonly stateChanged: Observable<{avatarId: string; state: AvatarState}>;
  readonly errorOccurred: Observable<{avatarId: string; error: any}>;
  
  // Public methods
  initializeAvatar(config: AvatarConfig): void;
  updateAvatarState(avatarId: string, partialState: Partial<AvatarState>): void;
  updateAnimationState(avatarId: string, animationState: Partial<AnimationState>): void;
  updateSpeechState(avatarId: string, speechState: Partial<SpeechState>): void;
  updateAudioState(avatarId: string, audioState: Partial<AudioState>): void;
  updateConnectionState(avatarId: string, connectionState: Partial<ConnectionState>): void;
  addMessage(avatarId: string, message: AvatarMessage): void;
  getNextMessage(avatarId: string): AvatarMessage | null;
  removeMessage(avatarId: string, messageId: string): void;
  clearMessageQueue(avatarId: string): void;
  setActiveAvatar(avatarId: string): void;
  removeAvatar(avatarId: string): void;
  setGlobalConfig(config: Partial<AvatarConfig>): void;
  handleError(avatarId: string, error: any): void;
}
```

### StreamService

WebSocket streaming service for real-time communication.

```typescript
export class StreamService {
  // Connection management
  initialize(config: StreamConfig): Promise<void>;
  connect(): Promise<void>;
  disconnect(): void;
  
  // Stream handling
  sendText(text: string): void;
  sendAudio(audioData: ArrayBuffer): void;
  sendCommand(command: string, params: any): void;
  
  // Event observables
  onConnection: Observable<ConnectionStatus>;
  onTextStream: Observable<string>;
  onAudioStream: Observable<ArrayBuffer>;
  onLatencyUpdate: Observable<number>;
  onError: Observable<Error>;
}
```

## Configuration Schemas

### Size2D

```typescript
interface Size2D {
  width: number;
  height: number;
}
```

### Vector2D

```typescript
interface Vector2D {
  x: number;
  y: number;
}
```

### ColorRGBA

```typescript
interface ColorRGBA {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a?: number; // 0-1, optional alpha
}
```

### FacialExpression

```typescript
interface FacialExpression {
  id: string;
  name: string;
  eyeState: EyeState;
  eyebrowState: EyebrowState;
  mouthState: MouthState;
  duration?: number; // milliseconds
  easing?: AnimationEasing;
}
```

### EyeState

```typescript
interface EyeState {
  leftEye: {
    openness: number; // 0 = closed, 1 = fully open
    direction: Vector2D; // Gaze direction
  };
  rightEye: {
    openness: number;
    direction: Vector2D;
  };
  blinkSpeed: number;
}
```

### MouthState

```typescript
interface MouthState {
  shape: VisemeShape;
  openness: number; // 0 = closed, 1 = fully open
  width: number; // Mouth width multiplier
  corners: number; // -1 = frown, 0 = neutral, 1 = smile
}
```

### VisemeShape

```typescript
type VisemeShape = 
  | 'neutral' 
  | 'A' | 'E' | 'I' | 'O' | 'U' 
  | 'B' | 'C' | 'D' | 'F' | 'G' 
  | 'K' | 'L' | 'M' | 'N' | 'P' 
  | 'R' | 'S' | 'T' | 'V' | 'W' 
  | 'Y' | 'Z';
```

### Gesture

```typescript
interface Gesture {
  id: string;
  name: string;
  type: GestureType;
  frames: GestureFrame[];
  duration: number; // milliseconds
  loop: boolean;
}
```

### GestureType

```typescript
type GestureType = 
  | 'wave' 
  | 'point' 
  | 'thumbs-up' 
  | 'clap' 
  | 'nod' 
  | 'shake-head' 
  | 'shrug' 
  | 'idle' 
  | 'thinking'
  | 'counting';
```

### LipSyncData

```typescript
interface LipSyncData {
  phonemes: PhonemeData[];
  totalDuration: number; // milliseconds
}

interface PhonemeData {
  phoneme: string;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  viseme: VisemeShape;
  amplitude: number; // Audio amplitude for that phoneme (0-1)
}
```

## Events and Callbacks

### Event Types

All components emit events that can be subscribed to for custom handling.

#### Avatar Events

```typescript
interface AvatarEvents {
  expressionChanged: FacialExpression;
  gestureStarted: Gesture;
  gestureCompleted: Gesture;
  lipSyncStarted: LipSyncData;
  lipSyncCompleted: void;
  animationFrame: number;
  configurationChanged: AvatarConfiguration;
}
```

#### TTS Events

```typescript
interface TTSEvents {
  speechStart: { text: string; timestamp: number };
  speechEnd: { text: string; timestamp: number };
  speechError: Error;
  visemeChange: { viseme: string; mouthShape: MouthShape };
  emotionChange: { emotion: string; intensity: number };
  animationUpdate: AvatarAnimationState;
}
```

#### Stream Events

```typescript
interface StreamEvents {
  connectionChange: ConnectionStatus;
  textReceived: string;
  audioReceived: ArrayBuffer;
  latencyUpdate: number;
  error: Error;
}
```

### Event Handling Examples

```typescript
@Component({
  template: `
    <ng-ui-avatar-2d
      (expressionChanged)="onExpressionChanged($event)"
      (gestureStarted)="onGestureStarted($event)"
      (renderingError)="onRenderingError($event)">
    </ng-ui-avatar-2d>
  `
})
export class AvatarComponent {
  onExpressionChanged(expression: FacialExpression) {
    console.log(`Expression changed to: ${expression.name}`);
    
    // Custom logic for expression changes
    if (expression.name === 'happy') {
      this.playHappySound();
    }
  }

  onGestureStarted(gesture: Gesture) {
    console.log(`Gesture started: ${gesture.name}`);
    
    // Track gesture analytics
    this.analyticsService.trackGesture(gesture.type);
  }

  onRenderingError(error: Error) {
    console.error('Avatar rendering error:', error);
    
    // Handle rendering errors gracefully
    this.showErrorMessage('Avatar failed to render');
    this.fallbackToTextMode();
  }
}
```

## Error Handling

### Error Types

```typescript
enum AvatarErrorCode {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  RENDERING_ERROR = 'RENDERING_ERROR',
  TTS_ERROR = 'TTS_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUDIO_ERROR = 'AUDIO_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  RESOURCE_LOAD_ERROR = 'RESOURCE_LOAD_ERROR'
}

interface AvatarError {
  code: AvatarErrorCode;
  message: string;
  timestamp: number;
  recoverable: boolean;
  details?: any;
}
```

### Error Handling Best Practices

```typescript
@Component({
  template: `
    <ng-ui-avatar-2d
      (renderingError)="handleRenderingError($event)"
      [configuration]="avatarConfig">
    </ng-ui-avatar-2d>
    
    <lib-avatar-tts
      (speechError)="handleSpeechError($event)"
      [config]="ttsConfig">
    </lib-avatar-tts>
    
    <!-- Error display -->
    <div class="error-banner" *ngIf="hasError">
      {{ errorMessage }}
      <button (click)="retryOperation()" *ngIf="canRetry">Retry</button>
    </div>
  `
})
export class ErrorHandlingComponent {
  hasError = false;
  errorMessage = '';
  canRetry = false;
  
  handleRenderingError(error: Error) {
    console.error('Rendering error:', error);
    
    this.hasError = true;
    this.errorMessage = 'Avatar failed to render. Please try again.';
    this.canRetry = true;
    
    // Attempt graceful degradation
    this.fallbackToLowerQuality();
  }
  
  handleSpeechError(error: Error) {
    console.error('Speech error:', error);
    
    this.hasError = true;
    this.errorMessage = 'Speech synthesis failed. Check your connection.';
    this.canRetry = true;
    
    // Provide alternative text display
    this.showTextFallback();
  }
  
  retryOperation() {
    this.hasError = false;
    this.errorMessage = '';
    this.canRetry = false;
    
    // Retry logic here
    this.reinitializeAvatar();
  }
  
  private fallbackToLowerQuality() {
    this.avatarConfig = {
      ...this.avatarConfig,
      performance: {
        ...this.avatarConfig.performance,
        quality: 'low'
      }
    };
  }
  
  private showTextFallback() {
    // Display text instead of speech
    this.showTextMessage(this.currentText);
  }
  
  private reinitializeAvatar() {
    // Reinitialize avatar components
    this.ngOnInit();
  }
}
```

### Global Error Handling

```typescript
// Set up global error handler for avatar-related errors
@Injectable({
  providedIn: 'root'
})
export class AvatarErrorHandler {
  handleError(error: AvatarError, avatarId: string) {
    // Log error
    console.error(`Avatar ${avatarId} error:`, error);
    
    // Send to analytics
    this.analytics.trackError(error, avatarId);
    
    // Determine recovery strategy
    if (error.recoverable) {
      this.attemptRecovery(error, avatarId);
    } else {
      this.notifyUser(error);
    }
  }
  
  private attemptRecovery(error: AvatarError, avatarId: string) {
    switch (error.code) {
      case AvatarErrorCode.RENDERING_ERROR:
        this.reduceQuality(avatarId);
        break;
      case AvatarErrorCode.TTS_ERROR:
        this.switchTTSProvider(avatarId);
        break;
      case AvatarErrorCode.NETWORK_ERROR:
        this.enableOfflineMode(avatarId);
        break;
    }
  }
}
```

---

This API reference covers all the major interfaces and components of the BigLedger Avatar Library. For implementation examples and detailed usage scenarios, refer to the [examples documentation](./examples/) and [feature guides](./features/).

For additional support or to report API issues, please refer to the project repository or documentation.