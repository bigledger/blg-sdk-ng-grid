import { AvatarConfig, AvatarAppearance, AvatarBehavior } from '../../../libs/avatar-core/src/lib/interfaces/avatar-config.interface';

/**
 * Test data generator for avatar testing
 */
export class AvatarTestDataGenerator {
  
  /**
   * Generate default avatar configuration
   */
  static getDefaultConfig(): AvatarConfig {
    return {
      id: 'test-avatar-001',
      appearance: this.getDefaultAppearance(),
      behavior: this.getDefaultBehavior(),
      voice: {
        provider: 'mock',
        voiceId: 'test-voice-001',
        language: 'en-US',
        rate: 1.0,
        pitch: 0.0,
        volume: 0.8
      },
      audio: {
        sampleRate: 22050,
        bufferSize: 4096,
        format: 'wav',
        noiseReduction: true
      },
      performance: {
        maxFPS: 60,
        quality: 'high',
        monitoring: true
      },
      features: {
        streaming: false,
        lipSync: true,
        gestureGeneration: true,
        emotionDetection: false
      }
    };
  }

  /**
   * Generate default appearance configuration
   */
  static getDefaultAppearance(): AvatarAppearance {
    return {
      model: 'young-woman',
      skinTone: 'medium',
      hair: {
        style: 'shoulder-length',
        color: '#8B4513'
      },
      clothing: {
        top: 'business-casual',
        accessories: []
      },
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      scale: 1.0,
      position: {
        x: 0,
        y: 0
      }
    };
  }

  /**
   * Generate default behavior configuration
   */
  static getDefaultBehavior(): AvatarBehavior {
    return {
      autoGestures: true,
      gestureIntensity: 'moderate',
      idleAnimations: true,
      idleFrequency: 15,
      eyeContact: true,
      lookingPattern: 'natural',
      blinking: {
        enabled: true,
        frequency: 20
      },
      responseDelay: 500,
      animationSpeed: 1.0
    };
  }

  /**
   * Generate streaming avatar configuration
   */
  static getStreamingConfig(): AvatarConfig {
    const config = this.getDefaultConfig();
    return {
      ...config,
      id: 'streaming-avatar-001',
      features: {
        ...config.features,
        streaming: true
      },
      performance: {
        ...config.performance,
        quality: 'medium' // Lower quality for streaming
      }
    };
  }

  /**
   * Generate high-performance avatar configuration
   */
  static getHighPerformanceConfig(): AvatarConfig {
    const config = this.getDefaultConfig();
    return {
      ...config,
      id: 'high-perf-avatar-001',
      performance: {
        maxFPS: 120,
        quality: 'ultra',
        monitoring: true
      },
      behavior: {
        ...config.behavior,
        animationSpeed: 1.5,
        idleFrequency: 10
      }
    };
  }

  /**
   * Generate low-performance/mobile avatar configuration
   */
  static getMobileConfig(): AvatarConfig {
    const config = this.getDefaultConfig();
    return {
      ...config,
      id: 'mobile-avatar-001',
      performance: {
        maxFPS: 30,
        quality: 'low',
        monitoring: false
      },
      audio: {
        ...config.audio,
        sampleRate: 16000,
        bufferSize: 2048
      },
      behavior: {
        ...config.behavior,
        animationSpeed: 0.8,
        idleAnimations: false
      }
    };
  }

  /**
   * Generate different appearance variations
   */
  static getAppearanceVariations(): AvatarAppearance[] {
    const base = this.getDefaultAppearance();
    
    return [
      // Young man
      {
        ...base,
        model: 'young-man',
        hair: { style: 'short', color: '#654321' },
        clothing: { top: 'casual', accessories: ['glasses'] }
      },
      // Middle-aged woman
      {
        ...base,
        model: 'middle-aged-woman',
        skinTone: 'light',
        hair: { style: 'bob', color: '#2F1B14' },
        clothing: { top: 'professional', accessories: ['earrings'] }
      },
      // Middle-aged man
      {
        ...base,
        model: 'middle-aged-man',
        skinTone: 'dark',
        hair: { style: 'buzz-cut', color: '#000000' },
        clothing: { top: 'formal', accessories: ['tie'] }
      },
      // Custom styled
      {
        ...base,
        skinTone: 'medium-dark',
        hair: { style: 'curly', color: '#4A2C2A' },
        clothing: { top: 'creative', accessories: ['headband', 'necklace'] },
        background: { type: 'solid', value: '#3498db' }
      }
    ];
  }

  /**
   * Generate test expressions
   */
  static getTestExpressions() {
    return [
      { id: 'neutral', name: 'Neutral', intensity: 0.0 },
      { id: 'happy', name: 'Happy', intensity: 0.8 },
      { id: 'sad', name: 'Sad', intensity: 0.6 },
      { id: 'surprised', name: 'Surprised', intensity: 0.9 },
      { id: 'angry', name: 'Angry', intensity: 0.7 },
      { id: 'confused', name: 'Confused', intensity: 0.5 },
      { id: 'excited', name: 'Excited', intensity: 1.0 },
      { id: 'thinking', name: 'Thinking', intensity: 0.4 }
    ];
  }

  /**
   * Generate test gestures
   */
  static getTestGestures() {
    return [
      { id: 'wave', name: 'Wave', duration: 2000, type: 'greeting' },
      { id: 'nod', name: 'Nod', duration: 1000, type: 'agreement' },
      { id: 'shake-head', name: 'Shake Head', duration: 1500, type: 'disagreement' },
      { id: 'shrug', name: 'Shrug', duration: 2500, type: 'uncertainty' },
      { id: 'point', name: 'Point', duration: 1800, type: 'direction' },
      { id: 'thumbs-up', name: 'Thumbs Up', duration: 1200, type: 'approval' },
      { id: 'clap', name: 'Clap', duration: 3000, type: 'celebration' },
      { id: 'thinking-pose', name: 'Thinking Pose', duration: 4000, type: 'contemplation' }
    ];
  }

  /**
   * Generate test audio phrases for TTS and lip sync
   */
  static getTestPhrases(): Array<{ text: string; language: string; expectedDuration: number }> {
    return [
      {
        text: "Hello, welcome to our avatar demonstration!",
        language: 'en-US',
        expectedDuration: 3500
      },
      {
        text: "I can speak different languages and show various expressions.",
        language: 'en-US',
        expectedDuration: 4200
      },
      {
        text: "The quick brown fox jumps over the lazy dog.",
        language: 'en-US',
        expectedDuration: 3800
      },
      {
        text: "This is a test of lip synchronization accuracy.",
        language: 'en-US',
        expectedDuration: 3200
      },
      {
        text: "Numbers: one, two, three, four, five, six, seven, eight, nine, ten.",
        language: 'en-US',
        expectedDuration: 5000
      },
      {
        text: "¡Hola! Me llamo Avatar y puedo hablar español también.",
        language: 'es-ES',
        expectedDuration: 4000
      },
      {
        text: "Bonjour! Je suis un avatar qui parle français.",
        language: 'fr-FR',
        expectedDuration: 3500
      }
    ];
  }

  /**
   * Generate WebSocket test messages
   */
  static getWebSocketTestMessages() {
    return [
      // Text message
      {
        type: 'text',
        payload: {
          text: 'Hello from WebSocket!',
          priority: 'normal',
          gestures: ['wave']
        },
        timestamp: Date.now()
      },
      // Audio message
      {
        type: 'audio',
        payload: {
          audioData: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq...',
          format: 'wav',
          lipSync: true
        },
        timestamp: Date.now()
      },
      // Gesture message
      {
        type: 'gesture',
        payload: {
          gesture: 'nod',
          timing: { delay: 0, duration: 1000 },
          additive: false
        },
        timestamp: Date.now()
      },
      // Expression change
      {
        type: 'expression',
        payload: {
          expression: 'happy',
          transition: 500
        },
        timestamp: Date.now()
      },
      // Configuration update
      {
        type: 'config',
        payload: {
          behavior: {
            animationSpeed: 1.2,
            gestureIntensity: 'expressive'
          }
        },
        timestamp: Date.now()
      },
      // Command message
      {
        type: 'command',
        payload: {
          command: 'pause',
          parameters: {}
        },
        timestamp: Date.now()
      }
    ];
  }

  /**
   * Generate performance test scenarios
   */
  static getPerformanceTestScenarios() {
    return [
      {
        name: 'Basic Rendering',
        description: 'Basic avatar rendering with minimal features',
        config: this.getMobileConfig(),
        operations: ['initialize', 'render', 'idle'],
        expectedMetrics: {
          maxInitTime: 5000,
          minFPS: 25,
          maxMemoryUsage: 100 * 1024 * 1024 // 100MB
        }
      },
      {
        name: 'High-Performance Animation',
        description: 'Complex animations with high framerate',
        config: this.getHighPerformanceConfig(),
        operations: ['initialize', 'render', 'expressions', 'gestures'],
        expectedMetrics: {
          maxInitTime: 8000,
          minFPS: 45,
          maxMemoryUsage: 200 * 1024 * 1024 // 200MB
        }
      },
      {
        name: 'Lip Sync Performance',
        description: 'Real-time lip synchronization',
        config: {
          ...this.getDefaultConfig(),
          features: { ...this.getDefaultConfig().features, lipSync: true }
        },
        operations: ['initialize', 'render', 'lipSync', 'audio'],
        expectedMetrics: {
          maxInitTime: 10000,
          minFPS: 30,
          maxMemoryUsage: 150 * 1024 * 1024, // 150MB
          maxAudioLatency: 100 // milliseconds
        }
      },
      {
        name: 'Streaming Performance',
        description: 'Real-time streaming with WebSocket',
        config: this.getStreamingConfig(),
        operations: ['initialize', 'render', 'streaming', 'messages'],
        expectedMetrics: {
          maxInitTime: 12000,
          minFPS: 25,
          maxMemoryUsage: 180 * 1024 * 1024, // 180MB
          maxMessageLatency: 200 // milliseconds
        }
      },
      {
        name: 'Long Duration Stability',
        description: 'Extended operation without memory leaks',
        config: this.getDefaultConfig(),
        operations: ['initialize', 'render', 'longDuration'],
        duration: 300000, // 5 minutes
        expectedMetrics: {
          maxInitTime: 8000,
          minFPS: 20,
          maxMemoryIncrease: 50 * 1024 * 1024, // Max 50MB increase
          maxFrameDrops: 100
        }
      }
    ];
  }

  /**
   * Generate accessibility test scenarios
   */
  static getAccessibilityTestScenarios() {
    return [
      {
        name: 'Keyboard Navigation',
        description: 'Test keyboard accessibility',
        interactions: [
          { key: 'Tab', expectedFocus: 'avatar-container' },
          { key: '1', expectedAction: 'expression-happy' },
          { key: '2', expectedAction: 'expression-sad' },
          { key: 'Space', expectedAction: 'toggle-expression' },
          { key: 'Enter', expectedAction: 'activate-control' }
        ]
      },
      {
        name: 'Screen Reader Support',
        description: 'Test screen reader announcements',
        expectedAnnouncements: [
          'Avatar initialized and ready',
          'Expression changed to happy',
          'Gesture wave started',
          'Lip sync activated',
          'Avatar is speaking'
        ]
      },
      {
        name: 'ARIA Attributes',
        description: 'Test ARIA compliance',
        requiredAttributes: [
          'aria-label',
          'aria-live',
          'role',
          'aria-describedby'
        ]
      },
      {
        name: 'Focus Management',
        description: 'Test proper focus handling',
        scenarios: [
          'focus-on-avatar',
          'focus-on-controls',
          'focus-trap-in-modal',
          'focus-return-after-action'
        ]
      }
    ];
  }

  /**
   * Generate cross-browser test configurations
   */
  static getBrowserTestConfigs() {
    return [
      {
        name: 'Chrome Desktop',
        viewport: { width: 1920, height: 1080 },
        devicePixelRatio: 1,
        expectedSupport: {
          canvas: true,
          webgl: true,
          audioContext: true,
          webSocket: true
        }
      },
      {
        name: 'Firefox Desktop',
        viewport: { width: 1920, height: 1080 },
        devicePixelRatio: 1,
        expectedSupport: {
          canvas: true,
          webgl: true,
          audioContext: true,
          webSocket: true
        }
      },
      {
        name: 'Safari Desktop',
        viewport: { width: 1440, height: 900 },
        devicePixelRatio: 2,
        expectedSupport: {
          canvas: true,
          webgl: true,
          audioContext: true,
          webSocket: true
        }
      },
      {
        name: 'Chrome Mobile',
        viewport: { width: 375, height: 667 },
        devicePixelRatio: 2,
        isMobile: true,
        expectedSupport: {
          canvas: true,
          webgl: true,
          audioContext: true,
          webSocket: true
        }
      },
      {
        name: 'Safari Mobile',
        viewport: { width: 375, height: 812 },
        devicePixelRatio: 3,
        isMobile: true,
        expectedSupport: {
          canvas: true,
          webgl: true,
          audioContext: true,
          webSocket: true
        }
      }
    ];
  }

  /**
   * Generate test file paths for various assets
   */
  static getTestAssetPaths() {
    return {
      audio: {
        short: '/e2e/avatar/fixtures/audio/short-speech.wav',
        long: '/e2e/avatar/fixtures/audio/long-speech.wav',
        multilingual: '/e2e/avatar/fixtures/audio/multilingual.wav',
        music: '/e2e/avatar/fixtures/audio/background-music.mp3',
        silence: '/e2e/avatar/fixtures/audio/silence.wav'
      },
      models: {
        basic: '/e2e/avatar/fixtures/models/basic-character.json',
        detailed: '/e2e/avatar/fixtures/models/detailed-character.json',
        lowPoly: '/e2e/avatar/fixtures/models/low-poly-character.json'
      },
      textures: {
        skin: '/e2e/avatar/fixtures/textures/skin-variations/',
        hair: '/e2e/avatar/fixtures/textures/hair-styles/',
        clothing: '/e2e/avatar/fixtures/textures/clothing/'
      },
      animations: {
        idle: '/e2e/avatar/fixtures/animations/idle.json',
        gestures: '/e2e/avatar/fixtures/animations/gestures/',
        expressions: '/e2e/avatar/fixtures/animations/expressions/'
      }
    };
  }

  /**
   * Generate random avatar configuration for fuzz testing
   */
  static generateRandomConfig(): AvatarConfig {
    const models: AvatarAppearance['model'][] = ['young-man', 'young-woman', 'middle-aged-man', 'middle-aged-woman'];
    const skinTones: AvatarAppearance['skinTone'][] = ['light', 'medium-light', 'medium', 'medium-dark', 'dark'];
    const qualities: ('low' | 'medium' | 'high' | 'ultra')[] = ['low', 'medium', 'high', 'ultra'];
    
    return {
      id: `random-avatar-${Math.random().toString(36).substr(2, 9)}`,
      appearance: {
        model: models[Math.floor(Math.random() * models.length)],
        skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
        hair: {
          style: `style-${Math.floor(Math.random() * 10)}`,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        },
        clothing: {
          top: `top-${Math.floor(Math.random() * 10)}`,
          accessories: []
        },
        background: {
          type: Math.random() > 0.5 ? 'solid' : 'gradient',
          value: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        },
        scale: 0.5 + Math.random(),
        position: {
          x: Math.random() * 100 - 50,
          y: Math.random() * 100 - 50
        }
      },
      behavior: {
        autoGestures: Math.random() > 0.5,
        gestureIntensity: ['subtle', 'moderate', 'expressive'][Math.floor(Math.random() * 3)] as any,
        idleAnimations: Math.random() > 0.5,
        idleFrequency: 5 + Math.random() * 20,
        eyeContact: Math.random() > 0.3,
        lookingPattern: ['direct', 'natural', 'shy'][Math.floor(Math.random() * 3)] as any,
        blinking: {
          enabled: Math.random() > 0.2,
          frequency: 10 + Math.random() * 30
        },
        responseDelay: Math.random() * 2000,
        animationSpeed: 0.5 + Math.random() * 1.5
      },
      voice: {
        provider: ['elevenlabs', 'azure', 'google'][Math.floor(Math.random() * 3)],
        voiceId: `voice-${Math.floor(Math.random() * 100)}`,
        language: ['en-US', 'es-ES', 'fr-FR', 'de-DE'][Math.floor(Math.random() * 4)],
        rate: 0.5 + Math.random() * 1.5,
        pitch: Math.random() * 2 - 1,
        volume: Math.random()
      },
      audio: {
        sampleRate: [16000, 22050, 44100][Math.floor(Math.random() * 3)],
        bufferSize: [1024, 2048, 4096][Math.floor(Math.random() * 3)],
        format: ['wav', 'mp3', 'ogg'][Math.floor(Math.random() * 3)] as any,
        noiseReduction: Math.random() > 0.5
      },
      performance: {
        maxFPS: 30 + Math.floor(Math.random() * 91),
        quality: qualities[Math.floor(Math.random() * qualities.length)],
        monitoring: Math.random() > 0.5
      },
      features: {
        streaming: Math.random() > 0.7,
        lipSync: Math.random() > 0.3,
        gestureGeneration: Math.random() > 0.2,
        emotionDetection: Math.random() > 0.8
      }
    };
  }
}