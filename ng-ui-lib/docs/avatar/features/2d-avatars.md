# 2D Avatar Features

Comprehensive guide to 2D avatar capabilities, rendering options, and customization features in the BigLedger Avatar Library.

## Overview

The 2D Avatar system provides high-performance, customizable avatar rendering using Canvas and SVG technologies. It offers extensive appearance customization, smooth animations, and advanced features like lip synchronization and gesture recognition.

## Core Features

### Dual Rendering Engines

#### Canvas Rendering
- **High Performance**: 60 FPS animations on modern devices
- **Advanced Effects**: Smooth gradients, shadows, and complex animations
- **GPU Acceleration**: Hardware-accelerated rendering when available
- **Real-time Updates**: Dynamic property changes without full redraws
- **Export Support**: PNG and JPEG export capabilities

#### SVG Rendering
- **Vector Graphics**: Scalable without quality loss
- **Small File Size**: Optimized for web delivery
- **Accessibility**: Screen reader compatible
- **CSS Integration**: Style with CSS and animations
- **Export Support**: SVG and PDF export capabilities

### Character Models

#### Base Models
- **Young Man**: Professional appearance, modern styling
- **Young Woman**: Contemporary look, business-appropriate
- **Middle-aged Man**: Mature, experienced appearance
- **Middle-aged Woman**: Professional, approachable styling

#### Anatomical Features
- **Head**: Proportional to body, multiple angles
- **Facial Features**: Eyes, nose, mouth with expression capability
- **Hair**: Multiple styles and colors
- **Body**: Professional posture and proportions
- **Hands**: Gesture-capable with finger articulation
- **Clothing**: Business and casual options

### Appearance Customization

#### Skin Tones
- **Light**: Fair complexions with warm undertones
- **Medium-light**: Olive and light tan variations
- **Medium**: Balanced warm and cool tones
- **Medium-dark**: Rich brown and tan variations
- **Dark**: Deep brown and ebony tones

#### Hair System
```typescript
interface HairOptions {
  styles: [
    'short-professional',
    'medium-wavy',
    'long-straight',
    'curly-shoulder',
    'pixie-cut',
    'business-cut',
    'styled-back'
  ];
  colors: [
    '#000000', // Black
    '#8B4513', // Brown
    '#D2B48C', // Blonde
    '#DC143C', // Red
    '#808080', // Gray
    '#CUSTOM'   // Custom hex color
  ];
}
```

#### Clothing Options
```typescript
interface ClothingSystem {
  tops: {
    'business-suit': BusinessSuitOptions;
    'casual-shirt': CasualShirtOptions;
    'blouse': BlouseOptions;
    'polo': PoloOptions;
    'sweater': SweaterOptions;
  };
  accessories: {
    'glasses': GlassesOptions;
    'jewelry': JewelryOptions;
    'ties': TieOptions;
    'scarves': ScarfOptions;
  };
}
```

### Animation System

#### Facial Expressions

The 2D avatar supports a comprehensive set of facial expressions:

```typescript
interface ExpressionLibrary {
  basic: [
    'neutral',     // Default resting expression
    'happy',       // Smiling, positive
    'sad',         // Downturned mouth, droopy eyes
    'surprised',   // Wide eyes, open mouth
    'angry',       // Furrowed brow, tight mouth
    'confused',    // Raised eyebrow, slight frown
    'thoughtful',  // Hand to chin, contemplative
    'excited'      // Bright eyes, big smile
  ];
  
  professional: [
    'confident',   // Slight smile, direct gaze
    'attentive',   // Alert expression, focused
    'understanding', // Nodding, empathetic
    'explaining',  // Open expression, engaging
    'listening'    // Attentive, receptive
  ];
  
  emotional: [
    'joyful',      // Laughing, very happy
    'concerned',   // Worried expression
    'sympathetic', // Caring, understanding
    'determined',  // Focused, resolute
    'pleased'      // Satisfied, content
  ];
}
```

#### Gesture System

```typescript
interface GestureLibrary {
  hand_gestures: [
    'wave',           // Friendly greeting
    'point',          // Directional indication
    'thumbs-up',      // Approval
    'thumbs-down',    // Disapproval
    'ok-sign',        // All good
    'peace',          // Victory/peace sign
    'stop',           // Stop gesture
    'come-here',      // Beckoning
    'clap',           // Applause
    'count-fingers'   // Numerical counting
  ];
  
  head_gestures: [
    'nod-yes',        // Agreement
    'shake-no',       // Disagreement
    'tilt-curious',   // Questioning
    'look-around',    // Searching
    'turn-left',      // Direction indication
    'turn-right',     // Direction indication
    'look-up',        // Thinking/pondering
    'look-down'       // Contemplation
  ];
  
  body_language: [
    'shrug',          // I don't know
    'lean-forward',   // Interest
    'lean-back',      // Relaxed
    'cross-arms',     // Defensive/thinking
    'hands-on-hips',  // Confident
    'open-arms',      // Welcoming
    'thinking-pose',  // Problem-solving
    'presentation'    // Explaining/teaching
  ];
}
```

### Eye Tracking and Gaze

#### Gaze Patterns
```typescript
interface GazeSystem {
  patterns: {
    'direct': {
      description: 'Maintains eye contact with viewer';
      eyeContact: 0.8;
      blinkRate: 15; // blinks per minute
    };
    
    'natural': {
      description: 'Natural human-like gaze patterns';
      eyeContact: 0.6;
      lookAway: true;
      gazeShifts: true;
      blinkRate: 18;
    };
    
    'shy': {
      description: 'Occasionally looks away, less direct';
      eyeContact: 0.4;
      lookAway: true;
      blinkRate: 22;
    };
    
    'focused': {
      description: 'Intense concentration, minimal blinking';
      eyeContact: 0.95;
      blinkRate: 8;
    };
  };
  
  gaze_targets: [
    'camera',         // Direct viewer contact
    'screen-top',     // Looking at interface elements
    'screen-bottom',  // Looking at controls
    'side-left',      // Natural conversation patterns
    'side-right',     // Natural conversation patterns
    'thinking-up',    // Contemplative poses
    'document'        // Reading/reviewing content
  ];
}
```

#### Blinking System
```typescript
interface BlinkingSystem {
  types: {
    'normal': {
      duration: 150;     // milliseconds
      frequency: 17;     // per minute
      variation: 0.3;    // Natural timing variation
    };
    
    'slow': {
      duration: 200;
      frequency: 12;
      variation: 0.4;
    };
    
    'rapid': {
      duration: 100;
      frequency: 25;
      variation: 0.2;
    };
    
    'sleepy': {
      duration: 300;
      frequency: 8;
      variation: 0.6;
    };
  };
  
  contextual_blinking: {
    'listening': { rate_multiplier: 1.2 };
    'speaking': { rate_multiplier: 0.8 };
    'thinking': { rate_multiplier: 1.5 };
    'surprised': { immediate_blink: false };
  };
}
```

### Lip Synchronization

#### Viseme Support

The 2D avatar system supports comprehensive viseme mapping for accurate lip sync:

```typescript
interface VisemeMapping {
  // Vowels
  'A': { mouth: 'open_wide', tongue: 'low' };
  'E': { mouth: 'open_medium', tongue: 'mid' };
  'I': { mouth: 'open_narrow', tongue: 'high' };
  'O': { mouth: 'round_medium', tongue: 'mid' };
  'U': { mouth: 'round_narrow', tongue: 'high' };
  
  // Consonants
  'B': { mouth: 'closed', preparation: 'build_pressure' };
  'C': { mouth: 'open_narrow', tongue: 'back' };
  'D': { mouth: 'open_narrow', tongue: 'tip_up' };
  'F': { mouth: 'narrow', teeth: 'bottom_lip' };
  'G': { mouth: 'open_medium', tongue: 'back_up' };
  'K': { mouth: 'open_medium', tongue: 'back_up' };
  'L': { mouth: 'open_narrow', tongue: 'tip_up' };
  'M': { mouth: 'closed', nasal: true };
  'N': { mouth: 'closed', tongue: 'tip_up', nasal: true };
  'P': { mouth: 'closed', preparation: 'build_pressure' };
  'R': { mouth: 'round_narrow', tongue: 'curl' };
  'S': { mouth: 'narrow', teeth: 'close', tongue: 'groove' };
  'T': { mouth: 'open_narrow', tongue: 'tip_up_release' };
  'V': { mouth: 'narrow', teeth: 'bottom_lip' };
  'W': { mouth: 'round_narrow', transition: true };
  'Y': { mouth: 'narrow', tongue: 'high' };
  'Z': { mouth: 'narrow', teeth: 'close', tongue: 'groove', voice: true };
}
```

#### Audio Analysis Features

```typescript
interface AudioAnalysis {
  phoneme_detection: {
    algorithm: 'deep_neural_network';
    accuracy: 0.94;
    latency: '50ms';
    real_time: true;
  };
  
  amplitude_tracking: {
    sample_rate: 16000;
    frame_size: 1024;
    overlap: 0.5;
    smoothing: 'exponential';
  };
  
  voice_activity_detection: {
    threshold: 0.1;
    min_duration: 100; // milliseconds
    max_silence: 500;  // milliseconds
  };
  
  emotional_analysis: {
    enabled: true;
    features: ['pitch', 'tempo', 'intensity'];
    confidence_threshold: 0.7;
  };
}
```

### Performance Optimization

#### Rendering Optimizations

```typescript
interface RenderingOptimizations {
  canvas: {
    layer_caching: true;      // Cache static layers
    dirty_region_updates: true; // Only redraw changed areas
    gpu_acceleration: true;   // Use hardware acceleration
    batch_operations: true;   // Group similar operations
    texture_atlasing: true;   // Combine textures
  };
  
  svg: {
    dom_optimization: true;   // Minimize DOM manipulations
    css_animations: true;     // Use CSS for simple animations
    viewbox_scaling: true;    // Efficient scaling
    path_optimization: true;  // Simplify complex paths
  };
  
  animation: {
    frame_skipping: true;     // Skip frames if behind
    interpolation: 'cubic';   // Smooth motion curves
    easing_functions: true;   // Natural motion
    motion_blur: false;       // Disable for performance
  };
}
```

#### Memory Management

```typescript
interface MemoryManagement {
  texture_pooling: {
    max_textures: 50;
    cleanup_interval: 30000; // milliseconds
    lru_eviction: true;
  };
  
  animation_cache: {
    max_cached_frames: 100;
    cache_strategy: 'most_used';
    preload_common: true;
  };
  
  audio_buffers: {
    buffer_size: 4096;
    num_buffers: 4;
    auto_cleanup: true;
  };
}
```

### Accessibility Features

#### Screen Reader Support

```typescript
interface AccessibilityFeatures {
  aria_support: {
    expression_announcements: true;
    gesture_descriptions: true;
    speech_transcription: true;
    emotional_context: true;
  };
  
  keyboard_navigation: {
    expression_shortcuts: {
      '1': 'neutral',
      '2': 'happy',
      '3': 'sad',
      '4': 'surprised',
      'Space': 'toggle_animation'
    };
  };
  
  high_contrast: {
    mode_available: true;
    automatic_detection: true;
    custom_palettes: true;
  };
  
  reduced_motion: {
    respect_preference: true;
    alternative_indicators: true;
    static_fallbacks: true;
  };
}
```

### Integration Examples

#### Basic 2D Avatar Setup

```typescript
@Component({
  selector: 'app-basic-avatar',
  template: `
    <ng-ui-avatar-2d
      [configuration]="avatarConfig"
      [size]="{width: 300, height: 400}"
      [renderMode]="'canvas'"
      [quality]="'high'"
      [autoPlay]="true"
      (expressionChanged)="onExpressionChange($event)"
      (gestureCompleted)="onGestureComplete($event)">
    </ng-ui-avatar-2d>
  `
})
export class BasicAvatarComponent {
  avatarConfig = {
    character: {
      name: 'Sarah',
      model: 'young-woman',
      skinTone: 'medium-light',
      hair: {
        style: 'professional-bob',
        color: '#8B4513'
      },
      clothing: {
        top: 'business-blouse',
        accessories: ['earrings', 'necklace']
      }
    },
    animations: {
      blinkFrequency: 3000,
      idleAnimations: true
    }
  };

  onExpressionChange(expression: FacialExpression) {
    console.log(`Sarah's expression: ${expression.name}`);
  }

  onGestureComplete(gesture: Gesture) {
    console.log(`Gesture completed: ${gesture.name}`);
  }
}
```

#### Advanced Customization

```typescript
@Component({
  selector: 'app-custom-avatar',
  template: `
    <ng-ui-avatar-2d
      [configuration]="dynamicConfig()"
      [showCustomizer]="true"
      [showPerformanceStats]="true"
      (configurationChanged)="updateConfig($event)">
    </ng-ui-avatar-2d>
    
    <div class="controls">
      <button (click)="changeExpression('happy')">Happy</button>
      <button (click)="changeExpression('thoughtful')">Thinking</button>
      <button (click)="playGesture('wave')">Wave</button>
      <button (click)="playGesture('point')">Point</button>
    </div>
  `
})
export class CustomAvatarComponent {
  private baseConfig = {
    character: {
      name: 'Alex',
      model: 'young-man',
      skinTone: 'medium',
      hair: { style: 'modern-cut', color: '#4A4A4A' },
      clothing: { top: 'casual-shirt' }
    }
  };

  dynamicConfig = signal(this.baseConfig);
  
  @ViewChild(Avatar2d) avatar!: Avatar2d;

  changeExpression(expressionName: string) {
    const expression: FacialExpression = {
      id: expressionName,
      name: expressionName,
      eyeState: this.getEyeStateFor(expressionName),
      eyebrowState: this.getEyebrowStateFor(expressionName),
      mouthState: this.getMouthStateFor(expressionName),
      duration: 500
    };
    
    this.avatar.changeExpression(expression);
  }

  playGesture(gestureName: string) {
    const gesture: Gesture = {
      id: gestureName,
      name: gestureName,
      type: gestureName as GestureType,
      frames: this.getGestureFrames(gestureName),
      duration: 1000,
      loop: false
    };
    
    this.avatar.playGesture(gesture);
  }

  updateConfig(newConfig: AvatarConfiguration) {
    this.dynamicConfig.set(newConfig);
  }

  private getEyeStateFor(expression: string): EyeState {
    const eyeStates = {
      'happy': {
        leftEye: { openness: 0.8, direction: { x: 0, y: 0 } },
        rightEye: { openness: 0.8, direction: { x: 0, y: 0 } },
        blinkSpeed: 1.0
      },
      'thoughtful': {
        leftEye: { openness: 0.6, direction: { x: -0.2, y: 0.3 } },
        rightEye: { openness: 0.6, direction: { x: -0.2, y: 0.3 } },
        blinkSpeed: 0.7
      }
    };
    
    return eyeStates[expression] || eyeStates['happy'];
  }

  // Additional helper methods...
}
```

#### Lip Sync Integration

```typescript
@Component({
  selector: 'app-speaking-avatar',
  template: `
    <ng-ui-avatar-2d
      [configuration]="avatarConfig"
      [lipSyncEnabled]="true"
      (lipSyncStarted)="onLipSyncStart($event)"
      (lipSyncCompleted)="onLipSyncComplete()">
    </ng-ui-avatar-2d>
    
    <lib-avatar-tts
      [config]="ttsConfig"
      [text]="currentText"
      [autoPlay]="false"
      (speechStart)="onSpeechStart($event)"
      (visemeChange)="updateLipSync($event)">
    </lib-avatar-tts>
    
    <div class="speech-controls">
      <textarea [(ngModel)]="textInput" rows="3"></textarea>
      <button (click)="speak()">Speak</button>
      <button (click)="stop()">Stop</button>
    </div>
  `
})
export class SpeakingAvatarComponent {
  textInput = 'Hello! I can speak with synchronized lip movements.';
  currentText = '';
  
  avatarConfig = {
    character: {
      name: 'Voice Assistant',
      model: 'young-woman',
      // ... other config
    },
    animations: {
      blinkFrequency: 3000,
      idleAnimations: true
    }
  };

  ttsConfig = {
    provider: 'elevenlabs',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    language: 'en-US',
    features: {
      emotionDetection: true,
      gestureGeneration: true
    },
    lipSync: {
      enabled: true,
      visemeLibrary: 'standard',
      smoothing: 0.7
    }
  };

  @ViewChild(Avatar2d) avatar!: Avatar2d;
  @ViewChild(AvatarTts) tts!: AvatarTts;

  speak() {
    if (this.textInput.trim()) {
      this.currentText = this.textInput;
      this.tts.speak(this.textInput);
    }
  }

  stop() {
    this.tts.stop();
  }

  onSpeechStart(event: any) {
    console.log('Speech started:', event);
    // Avatar automatically starts lip sync
  }

  updateLipSync(event: any) {
    // The avatar component automatically handles viseme updates
    // This is just for logging or custom processing
    console.log('Viseme:', event.viseme);
  }

  onLipSyncStart(data: LipSyncData) {
    console.log('Lip sync started with', data.phonemes.length, 'phonemes');
  }

  onLipSyncComplete() {
    console.log('Lip sync completed');
  }
}
```

### Performance Guidelines

#### Recommended Settings

```typescript
// For mobile devices
const mobileConfig = {
  performance: {
    quality: 'medium',
    maxFPS: 30,
    antialiasing: false
  },
  features: {
    complexAnimations: false,
    particleEffects: false
  }
};

// For desktop
const desktopConfig = {
  performance: {
    quality: 'high',
    maxFPS: 60,
    antialiasing: true
  },
  features: {
    complexAnimations: true,
    particleEffects: true
  }
};

// For high-performance systems
const premiumConfig = {
  performance: {
    quality: 'ultra',
    maxFPS: 120,
    antialiasing: true
  },
  features: {
    complexAnimations: true,
    particleEffects: true,
    advancedShading: true
  }
};
```

#### Monitoring Performance

```typescript
@Component({
  template: `
    <ng-ui-avatar-2d
      [showPerformanceStats]="true"
      (performanceUpdate)="onPerformanceUpdate($event)">
    </ng-ui-avatar-2d>
  `
})
export class PerformanceMonitoringComponent {
  performanceHistory: PerformanceMetrics[] = [];

  onPerformanceUpdate(metrics: PerformanceMetrics) {
    this.performanceHistory.push(metrics);
    
    // Keep only recent history
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
    
    // Check for performance issues
    if (metrics.fps < 20) {
      this.degradeQuality();
    } else if (metrics.fps > 55 && this.canUpgradeQuality()) {
      this.upgradeQuality();
    }
  }

  private degradeQuality() {
    // Automatically reduce quality if performance is poor
    console.log('Performance degraded, reducing quality');
  }

  private upgradeQuality() {
    // Increase quality if performance allows
    console.log('Performance good, increasing quality');
  }
}
```

The 2D avatar system provides a comprehensive solution for interactive character representation with high performance, extensive customization, and advanced features like lip synchronization. The dual rendering system ensures compatibility across devices while maintaining visual quality and smooth animations.