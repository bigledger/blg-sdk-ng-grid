# Avatar Getting Started Guide

Create your first speaking avatar in 15 minutes. This guide covers installation, basic setup, and implementing your first interactive avatar.

## 📦 Installation

### Option 1: Install Avatar Only
```bash
npm install @blg/avatar
```

### Option 2: Install Complete UI Kit
```bash
npm install @blg/ui-kit
```

### Option 3: Install with Specific Features
```bash
# Basic 2D avatars
npm install @blg/avatar-2d

# Add 3D support
npm install @blg/avatar-2d @blg/avatar-3d

# Add speech capabilities
npm install @blg/avatar @blg/avatar-speech
```

## 🔧 Angular Setup

### 1. Configure Your Angular Application

```typescript
// app.config.ts (Angular 17+ Standalone)
import { ApplicationConfig } from '@angular/core';
import { provideBlgAvatar } from '@blg/avatar';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBlgAvatar({
      // Enable 3D avatars (requires WebGL)
      webgl: true,
      
      // Speech configuration
      speech: {
        enabled: true,
        defaultLanguage: 'en-US',
        apiKey: 'your-speech-api-key' // Optional: for premium voices
      },
      
      // Performance settings
      performance: {
        lowLatency: true,
        targetFps: 60
      },
      
      // Accessibility
      accessibility: {
        screenReader: true,
        highContrast: true
      }
    })
  ]
};
```

### 2. Import in Your Component

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { BlgAvatarComponent, AvatarConfig, SpeechEvent } from '@blg/avatar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlgAvatarComponent],
  template: `
    <div class="avatar-container">
      <h2>Meet Sarah, Your Virtual Assistant</h2>
      
      <blg-avatar 
        [config]="avatarConfig"
        (speechStart)="onSpeechStart($event)"
        (speechComplete)="onSpeechComplete($event)"
        (emotionChanged)="onEmotionChanged($event)"
        #avatar>
      </blg-avatar>
      
      <div class="controls">
        <button (click)="sayHello()" class="btn primary">
          Say Hello
        </button>
        <button (click)="askQuestion()" class="btn secondary">
          Ask a Question
        </button>
        <button (click)="showEmotion('joy')" class="btn">
          Make Happy
        </button>
      </div>
    </div>
  `,
  styles: [`
    .avatar-container {
      padding: 20px;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }
    
    blg-avatar {
      width: 300px;
      height: 400px;
      margin: 20px auto;
      display: block;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .controls {
      margin-top: 20px;
    }
    
    .btn {
      margin: 5px;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .btn.primary {
      background: #007bff;
      color: white;
    }
    
    .btn.secondary {
      background: #6c757d;
      color: white;
    }
  `]
})
export class AppComponent {
  @ViewChild('avatar') avatar!: BlgAvatarComponent;
  
  // Avatar configuration
  avatarConfig: AvatarConfig = {
    // Avatar type: '2d' or '3d'
    type: '3d',
    
    // Pre-built avatar model
    model: 'sarah',
    
    // Voice settings
    voice: {
      language: 'en-US',
      gender: 'female',
      pitch: 1.0,
      rate: 1.0,
      volume: 0.8
    },
    
    // Appearance customization
    appearance: {
      hair: 'brown',
      eyes: 'blue',
      skin: 'fair',
      clothing: 'professional'
    },
    
    // Behavior settings
    behavior: {
      blinkFrequency: 3000,
      idleAnimations: true,
      gesturesEnabled: true
    },
    
    // Emotion settings
    emotions: {
      enabled: true,
      defaultEmotion: 'neutral',
      transitionSpeed: 1000
    }
  };

  // Event handlers
  onSpeechStart(event: SpeechEvent) {
    console.log('Avatar started speaking:', event.text);
  }

  onSpeechComplete(event: SpeechEvent) {
    console.log('Avatar finished speaking');
  }

  onEmotionChanged(emotion: string) {
    console.log('Avatar emotion changed to:', emotion);
  }

  // Control methods
  sayHello() {
    this.avatar.speak("Hello! I'm Sarah, your virtual assistant. How can I help you today?", {
      emotion: 'joy',
      gestures: ['wave']
    });
  }

  askQuestion() {
    this.avatar.speak("What would you like to know? I'm here to help!", {
      emotion: 'curious',
      gestures: ['point']
    });
  }

  showEmotion(emotion: string) {
    this.avatar.setEmotion(emotion);
  }
}
```

## 🎭 Basic Avatar Types

### 2D Avatar Example

```typescript
// Simple 2D avatar
export class Basic2DAvatarComponent {
  config = {
    type: '2d' as const,
    model: 'cartoon-female',
    voice: {
      language: 'en-US',
      pitch: 1.2
    },
    appearance: {
      style: 'cartoon',
      colors: {
        hair: '#8B4513',
        eyes: '#4169E1',
        clothes: '#FF6347'
      }
    }
  };

  greeting = "Hi there! I'm your 2D assistant!";
}
```

```html
<blg-avatar [config]="config"></blg-avatar>
<button (click)="avatar.speak(greeting)">Greet User</button>
```

### 3D Avatar Example

```typescript
// Advanced 3D avatar
export class Advanced3DAvatarComponent {
  config = {
    type: '3d' as const,
    model: 'realistic-male',
    voice: {
      language: 'en-GB',
      pitch: 0.9,
      rate: 0.95
    },
    appearance: {
      hair: 'black',
      eyes: 'brown',
      skin: 'medium',
      clothing: 'business-casual',
      accessories: ['glasses']
    },
    lighting: {
      ambient: 0.4,
      directional: 0.8
    },
    camera: {
      angle: 'slight-right',
      zoom: 1.2
    }
  };
}
```

## 🗣️ Speech Integration

### Basic Text-to-Speech

```typescript
export class BasicSpeechComponent {
  // Simple speech
  speak(text: string) {
    this.avatar.speak(text);
  }

  // Speech with options
  speakWithOptions(text: string) {
    this.avatar.speak(text, {
      emotion: 'joy',
      rate: 0.9,
      pitch: 1.1,
      volume: 0.8
    });
  }

  // Queue multiple speeches
  speakSequence() {
    this.avatar.speakSequence([
      "Welcome to our application!",
      "I'm here to guide you through the process.",
      "Let's get started!"
    ]);
  }
}
```

### Advanced Speech with SSML

```typescript
// SSML (Speech Synthesis Markup Language) support
speakWithSSML() {
  const ssmlText = `
    <speak>
      <prosody rate="slow">
        Welcome to BLG Avatar.
      </prosody>
      <break time="500ms"/>
      <prosody pitch="high" rate="fast">
        I'm excited to help you today!
      </prosody>
      <break time="1s"/>
      <prosody volume="soft">
        Let me know if you have any questions.
      </prosody>
    </speak>
  `;
  
  this.avatar.speak(ssmlText, { useSSML: true });
}
```

## 😊 Emotion System

### Basic Emotions

```typescript
export class EmotionExampleComponent {
  // Set single emotion
  setHappy() {
    this.avatar.setEmotion('joy', { intensity: 0.8 });
  }

  // Emotion with speech
  expressJoy() {
    this.avatar.speak("Congratulations! That's wonderful news!", {
      emotion: 'joy',
      intensity: 0.9,
      gestures: ['clap', 'thumbs-up']
    });
  }

  // Emotion sequence
  playEmotionSequence() {
    this.avatar.playEmotionSequence([
      { emotion: 'neutral', duration: 1000 },
      { emotion: 'surprise', duration: 2000, intensity: 0.7 },
      { emotion: 'joy', duration: 3000, intensity: 1.0 }
    ]);
  }
}
```

### Available Emotions

```typescript
const emotions = [
  'neutral',     // Default calm expression
  'joy',         // Happy, smiling
  'sadness',     // Concerned, empathetic
  'surprise',    // Wide-eyed, amazed
  'fear',        // Cautious, worried
  'anger',       // Serious, firm
  'disgust',     // Disapproving
  'contempt',    // Skeptical
  'pride',       // Confident, accomplished
  'shame',       // Embarrassed, apologetic
  'curiosity',   // Interested, questioning
  'excitement'   // Enthusiastic, energetic
];
```

## 🎨 Customization

### Appearance Customization

```typescript
export class CustomizationComponent {
  customConfig = {
    type: '3d' as const,
    model: 'base-female',
    appearance: {
      // Physical features
      hair: {
        style: 'long',
        color: '#654321'
      },
      eyes: {
        color: '#228B22',
        shape: 'almond'
      },
      skin: {
        tone: 'medium',
        texture: 'smooth'
      },
      
      // Clothing
      clothing: {
        top: 'blazer',
        color: '#2F4F4F',
        style: 'professional'
      },
      
      // Accessories
      accessories: [
        { type: 'glasses', style: 'modern' },
        { type: 'earrings', style: 'simple' }
      ]
    }
  };
}
```

### Dynamic Customization

```typescript
// Runtime appearance changes
changeHairColor() {
  this.avatar.updateAppearance({
    hair: { color: '#FF6347' }
  });
}

changeClothing() {
  this.avatar.updateAppearance({
    clothing: { 
      top: 'casual-shirt',
      color: '#4169E1'
    }
  });
}
```

## ♿ Accessibility Setup

### Basic Accessibility

```typescript
accessibleConfig = {
  type: '2d' as const,
  model: 'accessible-avatar',
  accessibility: {
    // Screen reader support
    screenReader: true,
    
    // Visual accessibility
    highContrast: true,
    largeText: true,
    
    // Audio accessibility
    audioDescriptions: true,
    captionsEnabled: true,
    
    // Interaction accessibility
    keyboardNavigation: true,
    reducedMotion: false // Set to true for motion-sensitive users
  },
  
  // Slower speech for better comprehension
  voice: {
    rate: 0.8,
    pitch: 1.0,
    volume: 0.9
  }
};
```

### Keyboard Navigation

```html
<!-- Keyboard accessible controls -->
<div class="avatar-controls" 
     role="region" 
     aria-label="Avatar controls">
     
  <button (click)="speak()" 
          [attr.aria-describedby]="'speak-help'"
          id="speak-btn">
    Speak
  </button>
  <div id="speak-help" class="sr-only">
    Press to make the avatar speak
  </div>
  
  <button (click)="setEmotion('joy')"
          [attr.aria-describedby]="'emotion-help'">
    Make Happy
  </button>
  <div id="emotion-help" class="sr-only">
    Changes avatar emotion to happy
  </div>
</div>
```

## ✅ Quick Start Checklist

- [ ] Install BLG Avatar: `npm install @blg/avatar`
- [ ] Configure Angular app with `provideBlgAvatar()`
- [ ] Import `BlgAvatarComponent` in your component
- [ ] Create avatar configuration object
- [ ] Add `<blg-avatar>` to your template with config
- [ ] Test speech functionality with `avatar.speak()`
- [ ] Try different emotions with `avatar.setEmotion()`
- [ ] Verify accessibility features work
- [ ] Test on different devices and browsers

## 📱 Mobile Considerations

```typescript
// Mobile-optimized configuration
mobileConfig = {
  type: '2d', // Prefer 2D for better mobile performance
  model: 'mobile-optimized',
  performance: {
    targetFps: 30, // Lower FPS for mobile
    reducedAnimations: true,
    batteryOptimized: true
  },
  touch: {
    enabled: true,
    gestures: ['tap', 'swipe']
  }
};
```

## 🚀 Next Steps

Now that you have your first avatar working:

1. **[Explore Avatar Types](./features/avatar-types.md)** - Learn about 2D vs 3D options
2. **[Master the Speech System](./features/speech-system.md)** - Advanced voice features
3. **[Understand Emotions](./features/emotion-engine.md)** - Create expressive avatars
4. **[Customize Appearance](./features/customization.md)** - Make unique avatars
5. **[Ensure Accessibility](./features/accessibility.md)** - Make inclusive experiences
6. **[View Examples](./examples/)** - See real-world implementations

## ❓ Troubleshooting

### Avatar Not Rendering
```typescript
// Check WebGL support for 3D avatars
if (this.avatarConfig.type === '3d') {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.error('WebGL not supported, falling back to 2D');
    this.avatarConfig.type = '2d';
  }
}
```

### Speech Not Working
```typescript
// Check Web Speech API support
if (!('speechSynthesis' in window)) {
  console.error('Speech synthesis not supported');
  // Provide alternative UI or fallback
}

// Test speech synthesis
const testUtterance = new SpeechSynthesisUtterance('Test');
speechSynthesis.speak(testUtterance);
```

### Performance Issues
```typescript
// Optimize for performance
const optimizedConfig = {
  ...baseConfig,
  performance: {
    targetFps: 30,
    reducedAnimations: true,
    lowQualityMode: true
  }
};
```

## 💡 Tips for Success

1. **Start Simple** - Begin with basic 2D avatars before moving to 3D
2. **Test Speech Early** - Verify text-to-speech works in target browsers
3. **Consider Accessibility** - Always include screen reader support
4. **Test on Mobile** - Ensure avatars work well on touch devices
5. **Monitor Performance** - Use browser dev tools to check FPS and memory
6. **User Consent** - Always ask permission before using speech features

---

**Congratulations!** You've created your first speaking avatar. Ready to make it more advanced? Check out our [Speech System Guide](./features/speech-system.md) or explore [3D Avatar Features](./features/3d-avatars/).