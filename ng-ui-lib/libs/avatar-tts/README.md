# Avatar TTS - Text-to-Speech with Lip Sync

A comprehensive Angular library for text-to-speech with advanced lip synchronization, emotion detection, and avatar animation. This library provides realistic lip sync, facial expressions, head movements, eye animations, and gesture coordination for interactive avatars.

## Features

### 🎤 Text-to-Speech
- **Web Speech API** integration for browser-native TTS
- **Google Cloud TTS** support (optional)
- **Amazon Polly** integration (optional)
- Voice selection and configuration
- SSML support for advanced speech control

### 🎭 Advanced Lip Sync Engine
- **Real-time phoneme detection** from audio analysis
- **21 viseme library** (Preston Blair system)
- **Co-articulation handling** for natural transitions
- **Multiple viseme libraries**: Preston Blair, Disney, IPA-based, Oculus
- **Frame-perfect synchronization** with audio

### 🎪 Emotion & Gesture System
- **Text-based emotion detection** (Happy, Sad, Angry, Surprised, etc.)
- **Dynamic facial expressions** that influence lip shapes
- **Gesture coordination** (Nod, Shake, Tilt, Emphasis)
- **Micro-expressions** and breathing animation
- **Head movement** patterns based on speech and emotion

### 📊 Audio Processing
- **Real-time FFT analysis** for frequency domain processing
- **Voice activity detection** (VAD)
- **Phoneme extraction** using acoustic features
- **Spectral analysis** (centroid, bandwidth, rolloff, etc.)
- **Multiple window functions** (Hanning, Hamming, Blackman, Kaiser)

### ⚡ Synchronization
- **Audio-visual sync** with drift correction
- **Latency compensation** for different devices
- **Buffer management** to prevent underruns/overruns
- **Adaptive synchronization** based on performance
- **Quality monitoring** and performance metrics

## Installation

```bash
npm install @ng-ui/avatar-tts
```

## Quick Start

### 1. Import the Component

```typescript
import { Component } from '@angular/core';
import { AvatarTts, TTSConfig } from '@ng-ui/avatar-tts';

@Component({
  selector: 'app-demo',
  imports: [AvatarTts],
  template: `
    <lib-avatar-tts
      [config]="ttsConfig"
      [text]="currentText"
      [autoPlay]="true"
      [enableVisualizer]="true"
      (speechStart)="onSpeechStart($event)"
      (speechEnd)="onSpeechEnd($event)"
      (emotionChange)="onEmotionChange($event)"
      (animationUpdate)="onAnimationUpdate($event)">
    </lib-avatar-tts>
    
    <textarea [(ngModel)]="currentText" placeholder="Enter text to speak..."></textarea>
  `
})
export class DemoComponent {
  currentText = "Hello! I'm your virtual assistant. How can I help you today?";
  
  ttsConfig: TTSConfig = {
    provider: 'webSpeech',
    voice: {
      language: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      ssmlEnabled: true
    },
    audio: {
      sampleRate: 44100,
      format: 'wav',
      quality: 'high'
    },
    lipSync: {
      enabled: true,
      visemeLibrary: 'prestonBlair',
      phonemeDetection: 'hybrid',
      timingPrecision: 'high',
      coarticulation: true,
      emotionOverlay: true,
      smoothing: {
        transitionDuration: 150,
        interpolationType: 'cubic',
        smoothingFactor: 0.8
      }
    },
    features: {
      emotionDetection: {
        enabled: true,
        method: 'textAnalysis',
        emotions: ['happy', 'sad', 'angry', 'surprised', 'neutral'],
        intensityMapping: {
          'very': 1.3,
          'extremely': 1.5,
          'quite': 1.1
        }
      },
      emphasisDetection: {
        enabled: true,
        patterns: ['\\b[A-Z]{2,}\\b', '\\*[^*]+\\*', '[!]{2,}'],
        gestureMapping: {
          'caps': 'emphasis',
          'exclamation': 'nod'
        }
      },
      breathingAnimation: {
        enabled: true,
        rate: 16,
        intensity: 0.3,
        pauseThreshold: 2000
      },
      headMovement: {
        enabled: true,
        patterns: [
          {
            name: 'emphasis',
            triggers: ['!', 'very', 'really'],
            movement: { y: 0.1, duration: 500 }
          }
        ],
        randomness: 0.1
      },
      eyeMovement: {
        enabled: true,
        blinkRate: 15,
        saccades: true,
        lookAt: true
      }
    },
    performance: {
      optimization: 'balanced',
      maxConcurrency: 2,
      memoryLimit: 100,
      caching: {
        audioCache: true,
        visemeCache: true,
        sizeLimit: 50,
        ttl: 300000
      }
    }
  };
  
  onSpeechStart(event: any) {
    console.log('Speech started:', event);
  }
  
  onSpeechEnd(event: any) {
    console.log('Speech ended:', event);
  }
  
  onEmotionChange(event: any) {
    console.log('Emotion changed:', event);
  }
  
  onAnimationUpdate(event: any) {
    // Update 3D avatar or 2D animation based on the animation state
    // event contains: mouthShape, viseme, emotion, headPose, eyeState, etc.
  }
}
```

### 2. Programmatic Control

```typescript
import { ViewChild } from '@angular/core';
import { AvatarTts } from '@ng-ui/avatar-tts';

export class AdvancedDemoComponent {
  @ViewChild(AvatarTts) avatarTts!: AvatarTts;
  
  // Manual speech control
  async speakText(text: string) {
    await this.avatarTts.speak(text);
  }
  
  // Emotion control
  expressHappiness() {
    this.avatarTts.setEmotion('happy', 0.8, 3000);
  }
  
  // Gesture control
  nodYes() {
    this.avatarTts.triggerGesture('nod', 1.0, 1000);
  }
  
  shakeNo() {
    this.avatarTts.triggerGesture('shake', 1.0, 1200);
  }
  
  // Get real-time data
  getAvatarState() {
    const mouthShape = this.avatarTts.currentMouthShape();
    const emotion = this.avatarTts.currentEmotion();
    const syncQuality = this.avatarTts.getSyncQuality();
    
    console.log('Current mouth shape:', mouthShape);
    console.log('Current emotion:', emotion);
    console.log('Sync quality:', syncQuality);
  }
  
  // Calibrate synchronization
  async calibrateAudioSync() {
    await this.avatarTts.calibrateSync();
    console.log('Synchronization calibrated');
  }
}
```

## Advanced Configuration

### Custom Viseme Library

```typescript
import { VisemeLibraryService } from '@ng-ui/avatar-tts';

// Create custom viseme library
const customLibrary = {
  name: 'Custom Visemes',
  version: '1.0',
  languages: ['en-US'],
  visemes: [
    {
      id: 'neutral',
      name: 'Neutral position',
      phonemes: ['sil'],
      mouthShape: {
        jawOpen: 0.1,
        lipWidth: 0.5,
        lipHeight: 0.3,
        lipProtrusion: 0.0,
        upperLipRaise: 0.0,
        lowerLipDepress: 0.0,
        cornerLipPull: 0.0,
        tonguePosition: 0.5,
        teethVisibility: 0.1
      },
      transition: {
        easeIn: 50,
        hold: 100,
        easeOut: 50,
        curve: 'easeInOut',
        blendWeight: 1.0
      }
    }
    // ... more visemes
  ],
  phonemeMapping: {
    'sil': 'neutral',
    'aa': 'open_vowel',
    // ... more mappings
  },
  defaultTransition: {
    easeIn: 50,
    hold: 100,
    easeOut: 50,
    curve: 'easeInOut',
    blendWeight: 1.0
  },
  metadata: {
    author: 'Your Name',
    description: 'Custom viseme library',
    license: 'MIT'
  }
};

// Add to service
this.visemeLibraryService.addCustomLibrary(customLibrary);
this.visemeLibraryService.setLibrary('Custom Visemes');
```

### Audio Processing Pipeline

```typescript
import { AudioProcessingService } from '@ng-ui/avatar-tts';

// Custom audio processing configuration
const audioConfig = {
  frameSize: 4096,
  hopSize: 2048,
  latencyTarget: 10, // 10ms ultra-low latency
  qualityMode: 'quality' as const
};

await this.audioProcessingService.initialize(audioConfig);

// Set custom FFT parameters
this.audioProcessingService.setFFTConfig({
  size: 4096,
  windowFunction: 'kaiser',
  overlapFactor: 0.5,
  frequencyBins: 2048
});

// Process custom audio
const audioBuffer = new Float32Array(4096);
const analysisData = await this.audioProcessingService.processAudioBuffer({
  getChannelData: () => audioBuffer,
  length: audioBuffer.length,
  sampleRate: 44100,
  numberOfChannels: 1,
  duration: audioBuffer.length / 44100
} as AudioBuffer);
```

## API Reference

### Main Component Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `config` | `TTSConfig` | Required | Complete TTS configuration |
| `text` | `string` | `''` | Text to speak |
| `autoPlay` | `boolean` | `false` | Automatically speak when text changes |
| `enableVisualizer` | `boolean` | `true` | Show debug visualizer |
| `avatarModel` | `string` | `'default'` | Avatar model identifier |

### Main Component Outputs

| Output | Type | Description |
|--------|------|-------------|
| `speechStart` | `{text: string, timestamp: number}` | Fired when speech starts |
| `speechEnd` | `{text: string, timestamp: number}` | Fired when speech ends |
| `speechError` | `Error` | Fired on speech errors |
| `visemeChange` | `{viseme: string, mouthShape: MouthShape}` | Current viseme changed |
| `emotionChange` | `{emotion: string, intensity: number}` | Current emotion changed |
| `animationUpdate` | `AvatarAnimationState` | Complete animation state update |

### Mouth Shape Parameters

```typescript
interface MouthShape {
  jawOpen: number;        // 0.0-1.0, jaw opening
  lipWidth: number;       // 0.0-1.0, lip width
  lipHeight: number;      // 0.0-1.0, lip height  
  lipProtrusion: number;  // 0.0-1.0, lip forward movement
  upperLipRaise: number;  // 0.0-1.0, upper lip elevation
  lowerLipDepress: number;// 0.0-1.0, lower lip depression
  cornerLipPull: number;  // 0.0-1.0, mouth corner pull
  tonguePosition: number; // 0.0-1.0, tongue position
  teethVisibility: number;// 0.0-1.0, teeth showing
  customShapes?: Record<string, number>; // Custom blend shapes
}
```

## Performance Considerations

### Optimization Tips

1. **Buffer Sizes**: Larger buffers = better quality, smaller buffers = lower latency
2. **Quality vs Performance**: Use `'speed'` optimization for real-time applications
3. **Caching**: Enable audio and viseme caching for repeated content
4. **Frame Rate**: Reduce `targetFrameRate` for lower-end devices
5. **Features**: Disable unused features to save CPU

### Performance Monitoring

```typescript
// Get performance metrics
const metrics = this.synchronizationService.getPerformanceMetrics();
console.log('Average latency:', metrics.avgLatency, 'ms');
console.log('Sync quality:', metrics.qualityScore);
console.log('Buffer underruns:', metrics.bufferUnderruns);

// Monitor in real-time
this.synchronizationService.onPerformanceWarning$.subscribe(warning => {
  console.warn('Performance warning:', warning);
  // Possibly reduce quality or disable features
});
```

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Web Speech API | ✅ | ✅ | ✅ | ✅ |
| AudioContext | ✅ | ✅ | ✅ | ✅ |
| Real-time Audio | ✅ | ✅ | ⚠️* | ✅ |
| High-resolution Timer | ✅ | ✅ | ✅ | ✅ |

*Safari has some limitations with real-time audio processing

## Examples

Check the `/examples` directory for:
- Basic TTS with lip sync
- Advanced emotion detection
- Custom viseme libraries
- 3D avatar integration
- Performance optimization examples

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Preston Blair animation principles
- International Phonetic Alphabet (IPA) standards
- Web Audio API specifications
- Modern lip sync research papers

---

Built with ❤️ for the Angular community