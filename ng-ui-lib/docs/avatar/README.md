# BigLedger Avatar Library

A comprehensive Angular library for creating interactive, AI-powered avatars with advanced features including 2D/3D rendering, text-to-speech, lip synchronization, and real-time streaming capabilities.

## Overview

The BigLedger Avatar Library is a professional-grade solution for integrating interactive avatars into Angular applications. Built with modern Angular architecture using Signals and standalone components, it provides a robust foundation for creating engaging user experiences across various industries including customer service, education, gaming, and virtual assistance.

## Features Comparison

| Feature | 2D Avatars | 3D Avatars | TTS Integration |
|---------|------------|------------|-----------------|
| **Rendering** | Canvas/SVG | WebGL/Three.js | Audio Processing |
| **Customization** | Full appearance control | 3D model variants | Voice selection |
| **Animation** | Facial expressions, gestures | Full body animation | Lip synchronization |
| **Performance** | High FPS, low memory | GPU accelerated | Real-time processing |
| **File Size** | ~50KB | ~200KB | ~100KB |
| **Browser Support** | All modern browsers | WebGL compatible | Web Audio API |

## Core Capabilities

### 🎭 Avatar Rendering
- **2D Avatars**: Canvas and SVG-based rendering with extensive customization
- **3D Avatars**: WebGL-powered 3D models with realistic animations
- **Multi-format Support**: Export as PNG, SVG, or 3D formats

### 🗣️ Text-to-Speech & Lip Sync
- **Multiple TTS Providers**: ElevenLabs, Azure, Google, and more
- **Advanced Lip Sync**: Real-time phoneme analysis and mouth animation
- **Emotion Detection**: Automatic emotion analysis from text
- **Gesture Generation**: Context-aware gesture automation

### 🎨 Customization
- **Appearance**: Skin tone, hair, clothing, accessories
- **Behavior**: Personality traits, animation styles, response patterns
- **Branding**: Custom backgrounds, logos, themes

### 🚀 Streaming & Real-time
- **WebSocket Streaming**: Low-latency audio streaming
- **Performance Monitoring**: Real-time FPS, memory, and CPU tracking
- **Adaptive Quality**: Dynamic quality adjustment based on performance

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Avatar Core   │    │   Avatar 2D     │    │   Avatar 3D     │
│                 │    │                 │    │                 │
│ • State Mgmt    │◄──►│ • Canvas Render │    │ • WebGL Render  │
│ • Config        │    │ • SVG Render    │    │ • 3D Models     │
│ • Services      │    │ • Animations    │    │ • Physics       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                     ┌─────────────────┐
                     │   Avatar TTS    │
                     │                 │
                     │ • Speech Synth  │
                     │ • Lip Sync      │
                     │ • Audio Proc    │
                     │ • Streaming     │
                     └─────────────────┘
```

## Quick Start

### Installation

```bash
npm install @bigledger/ng-ui-avatar-core @bigledger/ng-ui-avatar-2d
```

### Basic 2D Avatar

```typescript
import { Component } from '@angular/core';
import { Avatar2d } from '@bigledger/ng-ui-avatar-2d';

@Component({
  selector: 'app-avatar-demo',
  standalone: true,
  imports: [Avatar2d],
  template: `
    <ng-ui-avatar-2d
      [configuration]="avatarConfig"
      [showControls]="true"
      [lipSyncEnabled]="true"
      (expressionChanged)="onExpressionChanged($event)"
      (configurationChanged)="onConfigChanged($event)">
    </ng-ui-avatar-2d>
  `
})
export class AvatarDemoComponent {
  avatarConfig = {
    character: {
      name: 'Assistant',
      model: 'young-woman',
      skinTone: 'medium',
      hair: { style: 'long', color: '#8B4513' },
      clothing: { top: 'business-casual' }
    },
    animations: {
      blinkFrequency: 3000,
      idleAnimations: true
    }
  };

  onExpressionChanged(expression: any) {
    console.log('Expression changed:', expression);
  }

  onConfigChanged(config: any) {
    this.avatarConfig = config;
  }
}
```

### Basic TTS Integration

```typescript
import { Component } from '@angular/core';
import { AvatarTts } from '@bigledger/ng-ui-avatar-tts';

@Component({
  selector: 'app-tts-demo',
  standalone: true,
  imports: [AvatarTts],
  template: `
    <lib-avatar-tts
      [config]="ttsConfig"
      [text]="currentText"
      [autoPlay]="true"
      (speechStart)="onSpeechStart($event)"
      (speechEnd)="onSpeechEnd($event)"
      (visemeChange)="onVisemeChange($event)">
    </lib-avatar-tts>
  `
})
export class TtsDemoComponent {
  ttsConfig = {
    provider: 'elevenlabs',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    language: 'en-US',
    features: {
      emotionDetection: true,
      gestureGeneration: true
    }
  };

  currentText = 'Hello! I am your AI assistant. How can I help you today?';

  onSpeechStart(event: any) {
    console.log('Speech started:', event);
  }

  onSpeechEnd(event: any) {
    console.log('Speech ended:', event);
  }

  onVisemeChange(event: any) {
    // Update avatar mouth shape
    console.log('Viseme:', event);
  }
}
```

## Installation from GitHub Packages

The BigLedger Avatar Library is published to GitHub Packages. To install:

1. Create or update `.npmrc` in your project root:
```
@bigledger:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

2. Install the packages:
```bash
npm install @bigledger/ng-ui-avatar-core
npm install @bigledger/ng-ui-avatar-2d
npm install @bigledger/ng-ui-avatar-3d
npm install @bigledger/ng-ui-avatar-tts
```

## Package Structure

- **@bigledger/ng-ui-avatar-core**: Core interfaces, services, and utilities
- **@bigledger/ng-ui-avatar-2d**: 2D avatar rendering and animations
- **@bigledger/ng-ui-avatar-3d**: 3D avatar rendering with WebGL
- **@bigledger/ng-ui-avatar-tts**: Text-to-speech and lip synchronization

## Documentation

- [Getting Started Guide](./GETTING_STARTED.md) - Detailed setup and configuration
- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Feature Guides](./features/) - In-depth feature documentation
- [Examples](./examples/) - Practical implementation examples
- [Migration Guide](./MIGRATION.md) - Migrating from other avatar systems

## Use Cases

### Customer Service
Create intelligent customer service representatives with natural speech, emotional responses, and professional appearance.

### Education & Training
Develop interactive tutors and training assistants that can explain concepts with visual demonstrations and engaging personalities.

### Virtual Presentations
Build virtual presenters for conferences, product demos, and educational content with customizable branding.

### Gaming & Entertainment
Integrate NPCs and characters with realistic animations, speech, and personality traits.

### Accessibility
Provide visual representation for text-based content, making information more accessible to users with different learning styles.

## Browser Compatibility

- **Chrome**: 88+ (recommended)
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

### Required APIs
- Web Audio API (for TTS)
- Canvas 2D / WebGL (for rendering)
- WebSocket (for streaming)
- ES2020+ support

## Performance Guidelines

### 2D Avatars
- **Rendering**: 60 FPS on modern devices
- **Memory**: ~20-50MB per instance
- **CPU**: ~5-15% on mid-range devices

### 3D Avatars
- **Rendering**: 30-60 FPS depending on complexity
- **Memory**: ~50-150MB per instance
- **CPU/GPU**: ~10-25% usage

### TTS Processing
- **Latency**: 100-500ms depending on provider
- **Audio Buffer**: 1-3 seconds recommended
- **Network**: 50-200 Kbps for streaming

## Support

For technical support, bug reports, and feature requests:
- Create an issue in the GitHub repository
- Check the [troubleshooting guide](./MIGRATION.md#troubleshooting)
- Review the [FAQ section](./GETTING_STARTED.md#frequently-asked-questions)

## License

This library is licensed under the MIT License. See LICENSE file for details.

## Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct in the repository.

---

*Part of the BigLedger Angular UI Kit - Building the future of financial interfaces*