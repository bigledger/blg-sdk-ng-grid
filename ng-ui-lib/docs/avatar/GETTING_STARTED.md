# Getting Started with BigLedger Avatar Library

This guide will walk you through setting up and using the BigLedger Avatar Library in your Angular application.

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js**: 18.x or later
- **Angular**: 17+ (Angular 20+ recommended for full Signal support)
- **TypeScript**: 5.0+
- **Modern Browser**: Chrome 88+, Firefox 85+, Safari 14+, or Edge 88+

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: Modern multi-core processor
- **GPU**: WebGL-compatible graphics card (for 3D avatars)
- **Network**: Stable internet connection for TTS services

## Installation

### Step 1: Configure GitHub Packages Access

The BigLedger Avatar Library is hosted on GitHub Packages. You'll need to configure npm to access it.

1. **Create a GitHub Personal Access Token**:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a new token with `read:packages` permission
   - Save the token securely

2. **Configure npm**:
   Create or update `.npmrc` in your project root:
   ```
   @bigledger:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```

### Step 2: Install Core Packages

Install the required avatar packages:

```bash
# Core avatar functionality (required)
npm install @bigledger/ng-ui-avatar-core

# 2D avatar rendering
npm install @bigledger/ng-ui-avatar-2d

# 3D avatar rendering (optional)
npm install @bigledger/ng-ui-avatar-3d

# Text-to-speech integration (optional)
npm install @bigledger/ng-ui-avatar-tts
```

### Step 3: Install Peer Dependencies

Install required peer dependencies:

```bash
npm install rxjs@^7.0.0
npm install @angular/common@^17.0.0
npm install @angular/core@^17.0.0
```

For 3D avatars, also install:
```bash
npm install three@^0.160.0
npm install @types/three
```

## Basic 2D Avatar Setup

Let's create a simple 2D avatar with basic functionality.

### Step 1: Import and Configure

Create a new component for your avatar:

```typescript
// avatar-demo.component.ts
import { Component, signal } from '@angular/core';
import { Avatar2d } from '@bigledger/ng-ui-avatar-2d';
import { AvatarConfiguration } from '@bigledger/ng-ui-avatar-core';

@Component({
  selector: 'app-avatar-demo',
  standalone: true,
  imports: [Avatar2d],
  template: `
    <div class="avatar-container">
      <ng-ui-avatar-2d
        [configuration]="avatarConfig()"
        [size]="{ width: 400, height: 500 }"
        [renderMode]="'canvas'"
        [showControls]="true"
        [showCustomizer]="false"
        [autoPlay]="true"
        (expressionChanged)="onExpressionChanged($event)"
        (configurationChanged)="onConfigurationChanged($event)">
      </ng-ui-avatar-2d>

      <div class="controls">
        <button (click)="changeToHappy()">Happy</button>
        <button (click)="changeToSurprised()">Surprised</button>
        <button (click)="wave()">Wave</button>
      </div>
    </div>
  `,
  styles: [`
    .avatar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 20px;
    }
    
    .controls {
      display: flex;
      gap: 10px;
    }
    
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background: #007bff;
      color: white;
      cursor: pointer;
    }
    
    button:hover {
      background: #0056b3;
    }
  `]
})
export class AvatarDemoComponent {
  // Avatar configuration using signals
  avatarConfig = signal<AvatarConfiguration>({
    character: {
      name: 'Maya',
      model: 'young-woman',
      skinTone: 'medium-light',
      hair: {
        style: 'shoulder-length',
        color: '#8B4513'
      },
      clothing: {
        top: 'business-casual',
        accessories: ['earrings']
      }
    },
    layers: [],
    customizations: {},
    animations: {
      blinkFrequency: 3000
    }
  });

  onExpressionChanged(expression: any) {
    console.log('Expression changed to:', expression.name);
  }

  onConfigurationChanged(config: AvatarConfiguration) {
    this.avatarConfig.set(config);
  }

  changeToHappy() {
    // Trigger happy expression
    // In practice, you would use the avatar component reference
    console.log('Changing to happy expression');
  }

  changeToSurprised() {
    console.log('Changing to surprised expression');
  }

  wave() {
    console.log('Playing wave gesture');
  }
}
```

### Step 2: Add to Your Module

Add the component to your application:

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { AvatarDemoComponent } from './avatar-demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AvatarDemoComponent],
  template: `
    <h1>My Avatar App</h1>
    <app-avatar-demo></app-avatar-demo>
  `
})
export class AppComponent {
  title = 'avatar-demo';
}
```

## Basic 3D Avatar Setup

For 3D avatars, the setup is similar but requires additional configuration:

```typescript
// avatar-3d-demo.component.ts
import { Component, signal } from '@angular/core';
import { Avatar3d } from '@bigledger/ng-ui-avatar-3d';

@Component({
  selector: 'app-avatar-3d-demo',
  standalone: true,
  imports: [Avatar3d],
  template: `
    <div class="avatar-3d-container">
      <lib-avatar3d
        [config]="avatar3dConfig()"
        [modelUrl]="modelUrl()"
        [environment]="environment()"
        [lighting]="lighting()"
        [camera]="cameraSettings()"
        (modelLoaded)="onModelLoaded($event)"
        (animationComplete)="onAnimationComplete($event)">
      </lib-avatar3d>

      <div class="controls-3d">
        <button (click)="playAnimation('wave')">Wave</button>
        <button (click)="playAnimation('nod')">Nod</button>
        <button (click)="toggleLighting()">Toggle Lighting</button>
      </div>
    </div>
  `,
  styles: [`
    .avatar-3d-container {
      width: 100%;
      height: 600px;
      position: relative;
    }
    
    .controls-3d {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
    }
  `]
})
export class Avatar3dDemoComponent {
  avatar3dConfig = signal({
    quality: 'high',
    antialiasing: true,
    shadows: true,
    postProcessing: true
  });

  modelUrl = signal('/assets/models/avatar-female.glb');
  
  environment = signal({
    background: 'studio',
    skybox: true
  });

  lighting = signal({
    ambient: { intensity: 0.4, color: '#ffffff' },
    directional: { intensity: 0.8, color: '#ffffff', position: [5, 5, 5] }
  });

  cameraSettings = signal({
    position: [0, 1.6, 2],
    target: [0, 1.6, 0],
    fov: 50
  });

  onModelLoaded(event: any) {
    console.log('3D model loaded:', event);
  }

  onAnimationComplete(event: any) {
    console.log('Animation completed:', event);
  }

  playAnimation(animationName: string) {
    console.log('Playing animation:', animationName);
  }

  toggleLighting() {
    const current = this.lighting();
    this.lighting.set({
      ...current,
      ambient: {
        ...current.ambient,
        intensity: current.ambient.intensity === 0.4 ? 0.8 : 0.4
      }
    });
  }
}
```

## TTS Configuration

To add text-to-speech capabilities:

### Step 1: Configure TTS Provider

Choose and configure your preferred TTS provider:

```typescript
// tts-config.ts
export const TTS_CONFIG = {
  // ElevenLabs configuration
  elevenlabs: {
    apiKey: 'your-elevenlabs-api-key',
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Voice ID
    model: 'eleven_monolingual_v1',
    stability: 0.5,
    similarityBoost: 0.8
  },
  
  // Azure Cognitive Services
  azure: {
    subscriptionKey: 'your-azure-key',
    region: 'westus2',
    voice: 'en-US-AriaNeural',
    rate: '1.0',
    pitch: '0Hz'
  },
  
  // Google Cloud TTS
  google: {
    apiKey: 'your-google-api-key',
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Standard-F',
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0
    }
  }
};
```

### Step 2: Implement TTS Component

```typescript
// avatar-tts-demo.component.ts
import { Component, signal, ViewChild } from '@angular/core';
import { AvatarTts } from '@bigledger/ng-ui-avatar-tts';
import { Avatar2d } from '@bigledger/ng-ui-avatar-2d';
import { TTS_CONFIG } from './tts-config';

@Component({
  selector: 'app-avatar-tts-demo',
  standalone: true,
  imports: [AvatarTts, Avatar2d],
  template: `
    <div class="tts-demo">
      <!-- Avatar Component -->
      <ng-ui-avatar-2d
        #avatar2d
        [configuration]="avatarConfig()"
        [size]="{ width: 400, height: 500 }"
        [lipSyncEnabled]="true">
      </ng-ui-avatar-2d>

      <!-- TTS Component -->
      <lib-avatar-tts
        #avatarTts
        [config]="ttsConfig()"
        [text]="currentText()"
        [autoPlay]="false"
        [enableVisualizer]="true"
        (speechStart)="onSpeechStart($event)"
        (speechEnd)="onSpeechEnd($event)"
        (visemeChange)="onVisemeChange($event)"
        (emotionChange)="onEmotionChange($event)">
      </lib-avatar-tts>

      <!-- Controls -->
      <div class="tts-controls">
        <textarea 
          [(ngModel)]="textInput" 
          placeholder="Enter text to speak..."
          rows="3">
        </textarea>
        
        <div class="buttons">
          <button (click)="speak()">Speak</button>
          <button (click)="stop()">Stop</button>
          <button (click)="pause()" [disabled]="!isPlaying()">Pause</button>
          <button (click)="resume()" [disabled]="!isPaused()">Resume</button>
        </div>

        <div class="voice-selection">
          <label>Voice Provider:</label>
          <select [(ngModel)]="selectedProvider" (change)="updateTtsConfig()">
            <option value="elevenlabs">ElevenLabs</option>
            <option value="azure">Azure</option>
            <option value="google">Google</option>
          </select>
        </div>

        <div class="progress" *ngIf="isPlaying()">
          <div class="progress-bar" [style.width.%]="speechProgress()"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tts-demo {
      display: flex;
      gap: 30px;
      padding: 20px;
    }
    
    .tts-controls {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      resize: vertical;
    }
    
    .buttons {
      display: flex;
      gap: 10px;
    }
    
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background: #007bff;
      color: white;
      cursor: pointer;
    }
    
    button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    
    .voice-selection {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .progress {
      width: 100%;
      height: 20px;
      background: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      background: #007bff;
      transition: width 0.1s ease;
    }
  `]
})
export class AvatarTtsDemoComponent {
  @ViewChild('avatarTts') avatarTts!: AvatarTts;
  @ViewChild('avatar2d') avatar2d!: Avatar2d;

  textInput = 'Hello! I am your AI assistant. How can I help you today?';
  selectedProvider = 'elevenlabs';
  
  currentText = signal('');
  isPlaying = signal(false);
  isPaused = signal(false);
  speechProgress = signal(0);

  avatarConfig = signal({
    character: {
      name: 'AI Assistant',
      model: 'young-woman',
      skinTone: 'medium',
      hair: { style: 'professional', color: '#654321' },
      clothing: { top: 'business' }
    },
    animations: {
      blinkFrequency: 3000
    }
  });

  ttsConfig = signal({
    provider: this.selectedProvider,
    ...TTS_CONFIG[this.selectedProvider as keyof typeof TTS_CONFIG],
    language: 'en-US',
    features: {
      emotionDetection: true,
      gestureGeneration: true,
      lipSyncQuality: 'high'
    },
    lipSync: {
      enabled: true,
      visemeLibrary: 'standard',
      smoothing: 0.7,
      delay: 0
    }
  });

  speak() {
    if (this.textInput.trim()) {
      this.currentText.set(this.textInput);
      this.avatarTts.speak(this.textInput);
    }
  }

  stop() {
    this.avatarTts.stop();
    this.isPlaying.set(false);
    this.isPaused.set(false);
    this.speechProgress.set(0);
  }

  pause() {
    this.avatarTts.pause();
    this.isPaused.set(true);
  }

  resume() {
    this.avatarTts.resume();
    this.isPaused.set(false);
  }

  updateTtsConfig() {
    this.ttsConfig.set({
      ...this.ttsConfig(),
      provider: this.selectedProvider,
      ...TTS_CONFIG[this.selectedProvider as keyof typeof TTS_CONFIG]
    });
  }

  onSpeechStart(event: any) {
    console.log('Speech started:', event);
    this.isPlaying.set(true);
    this.isPaused.set(false);
  }

  onSpeechEnd(event: any) {
    console.log('Speech ended:', event);
    this.isPlaying.set(false);
    this.isPaused.set(false);
    this.speechProgress.set(100);
  }

  onVisemeChange(event: any) {
    // Update avatar lip sync
    console.log('Viseme changed:', event.viseme);
    // The avatar component should automatically sync with these changes
  }

  onEmotionChange(event: any) {
    console.log('Emotion changed:', event);
    // Trigger corresponding facial expression on avatar
    if (this.avatar2d) {
      // Map emotions to expressions
      const expressionMap = {
        'happy': 'smile',
        'sad': 'frown',
        'angry': 'angry',
        'surprised': 'surprised',
        'neutral': 'neutral'
      };
      
      const expression = expressionMap[event.emotion as keyof typeof expressionMap];
      if (expression) {
        // this.avatar2d.changeExpression({ id: expression, name: expression });
      }
    }
  }
}
```

## WebSocket Streaming Setup

For real-time streaming capabilities:

### Step 1: Configure WebSocket Connection

```typescript
// stream-config.ts
export const STREAM_CONFIG = {
  websocket: {
    url: 'wss://your-server.com/avatar-stream',
    protocols: ['avatar-protocol'],
    reconnectAttempts: 5,
    reconnectDelay: 1000
  },
  audio: {
    sampleRate: 16000,
    bufferSize: 4096,
    format: 'wav',
    compression: 'opus'
  },
  video: {
    fps: 30,
    quality: 'medium',
    compression: 'h264'
  }
};
```

### Step 2: Implement Streaming

```typescript
// streaming-avatar.component.ts
import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { StreamService } from '@bigledger/ng-ui-avatar-core';

@Component({
  selector: 'app-streaming-avatar',
  standalone: true,
  imports: [Avatar2d, AvatarTts],
  template: `
    <div class="streaming-container">
      <div class="status-bar">
        <div class="connection-status" [class.connected]="isConnected()">
          {{ connectionStatus() }}
        </div>
        <div class="latency">
          Latency: {{ latency() }}ms
        </div>
      </div>

      <ng-ui-avatar-2d
        [configuration]="avatarConfig()"
        [size]="{ width: 400, height: 500 }">
      </ng-ui-avatar-2d>
      
      <lib-avatar-tts
        [config]="ttsConfig()"
        [text]="streamText()"
        [autoPlay]="true">
      </lib-avatar-tts>

      <div class="stream-controls">
        <button (click)="connect()" [disabled]="isConnected()">
          Connect
        </button>
        <button (click)="disconnect()" [disabled]="!isConnected()">
          Disconnect
        </button>
      </div>
    </div>
  `
})
export class StreamingAvatarComponent implements OnInit, OnDestroy {
  private streamService = new StreamService();
  
  isConnected = signal(false);
  connectionStatus = signal('Disconnected');
  latency = signal(0);
  streamText = signal('');
  
  avatarConfig = signal({
    // Avatar configuration
  });
  
  ttsConfig = signal({
    // TTS configuration with streaming enabled
    streaming: true
  });

  async ngOnInit() {
    await this.streamService.initialize(STREAM_CONFIG);
    
    this.streamService.onConnection.subscribe(status => {
      this.isConnected.set(status.connected);
      this.connectionStatus.set(status.status);
    });
    
    this.streamService.onLatencyUpdate.subscribe(latency => {
      this.latency.set(latency);
    });
    
    this.streamService.onTextStream.subscribe(text => {
      this.streamText.set(text);
    });
  }

  ngOnDestroy() {
    this.streamService.disconnect();
  }

  async connect() {
    try {
      await this.streamService.connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }

  disconnect() {
    this.streamService.disconnect();
  }
}
```

## Environment Configuration

Create environment-specific configurations:

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  avatar: {
    apiKeys: {
      elevenlabs: 'your-dev-api-key',
      azure: 'your-dev-azure-key',
      google: 'your-dev-google-key'
    },
    defaultProvider: 'elevenlabs',
    features: {
      performance: {
        monitoring: true,
        maxFPS: 60,
        quality: 'high'
      },
      debug: {
        showPerformanceStats: true,
        enableLogging: true,
        showControls: true
      }
    }
  }
};
```

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  avatar: {
    apiKeys: {
      elevenlabs: 'your-prod-api-key',
      azure: 'your-prod-azure-key',
      google: 'your-prod-google-key'
    },
    defaultProvider: 'elevenlabs',
    features: {
      performance: {
        monitoring: false,
        maxFPS: 30,
        quality: 'medium'
      },
      debug: {
        showPerformanceStats: false,
        enableLogging: false,
        showControls: false
      }
    }
  }
};
```

## Troubleshooting

### Common Issues

1. **Avatar not rendering**:
   - Check browser console for WebGL errors
   - Ensure canvas element has proper dimensions
   - Verify browser compatibility

2. **TTS not working**:
   - Verify API keys are correct
   - Check network connectivity
   - Ensure audio context is initialized after user interaction

3. **Poor performance**:
   - Reduce avatar quality settings
   - Limit concurrent avatar instances
   - Enable performance monitoring

4. **WebSocket connection fails**:
   - Check server endpoint
   - Verify WebSocket protocol support
   - Review firewall settings

### Performance Optimization

1. **Memory Management**:
   ```typescript
   // Dispose of avatar instances when no longer needed
   ngOnDestroy() {
     this.avatar?.dispose();
     this.ttsService?.dispose();
   }
   ```

2. **Quality Settings**:
   ```typescript
   const optimizedConfig = {
     performance: {
       maxFPS: 30,        // Reduce for better performance
       quality: 'medium', // Lower quality for mobile
       monitoring: false  // Disable in production
     }
   };
   ```

3. **Lazy Loading**:
   ```typescript
   // Load avatar components only when needed
   const Avatar2d = await import('@bigledger/ng-ui-avatar-2d');
   ```

## Next Steps

- Explore the [API Reference](./API_REFERENCE.md) for detailed documentation
- Check out the [Feature Guides](./features/) for advanced functionality
- Review [Example Implementations](./examples/) for real-world use cases
- See the [Migration Guide](./MIGRATION.md) for upgrading from other avatar systems

## Frequently Asked Questions

**Q: Can I use multiple avatars on the same page?**
A: Yes, but be mindful of performance. Each avatar instance uses significant resources.

**Q: Which TTS provider gives the best results?**
A: ElevenLabs generally provides the most natural-sounding voices, but Azure and Google offer better language support.

**Q: Can I customize the avatar appearance?**
A: Yes, the library provides extensive customization options for appearance, clothing, and behavior.

**Q: Is offline mode supported?**
A: 2D avatars can work offline, but TTS requires internet connectivity. 3D avatars may work offline if models are cached.

**Q: What's the difference between Canvas and SVG rendering?**
A: Canvas offers better performance for complex animations, while SVG provides better scalability and smaller file sizes.

---

For more detailed information, continue to the [API Reference](./API_REFERENCE.md) or explore specific [feature guides](./features/).