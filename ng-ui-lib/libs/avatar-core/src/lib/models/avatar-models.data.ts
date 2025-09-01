import { 
  AvatarConfig, 
  AvatarAppearance, 
  AvatarBehavior 
} from '../interfaces/avatar-config.interface';
import { 
  CustomizationPreset, 
  CustomizationOptions 
} from '../interfaces/customization-options.interface';
import { 
  VoiceConfig, 
  VoiceProfile 
} from '../interfaces/voice-config.interface';

/**
 * Default voice profiles for different avatar models
 */
export const defaultVoiceProfiles: Record<string, VoiceProfile> = {
  'young-man': {
    id: 'voice-young-man-default',
    name: 'Alex (Young Male)',
    provider: 'browser',
    providerVoiceId: 'Alex',
    language: 'en-US',
    locale: 'en-US',
    characteristics: {
      gender: 'male',
      age: 'young',
      accent: 'American',
      description: 'Clear, friendly young male voice'
    },
    defaultStyle: 'friendly',
    supportedStyles: ['neutral', 'cheerful', 'professional', 'friendly'],
    synthesis: {
      engine: {
        model: 'standard',
        quality: 'high',
        neural: false,
        streaming: true
      },
      prosody: {
        rate: 1.0,
        pitch: 0,
        volume: 80,
        emphasis: 'moderate'
      },
      output: {
        format: 'wav',
        sampleRate: 22050,
        channels: 1
      },
      advanced: {
        wordTimestamps: true,
        phonemeData: false
      }
    },
    isPremium: false
  },
  
  'young-woman': {
    id: 'voice-young-woman-default',
    name: 'Samantha (Young Female)',
    provider: 'browser',
    providerVoiceId: 'Samantha',
    language: 'en-US',
    locale: 'en-US',
    characteristics: {
      gender: 'female',
      age: 'young',
      accent: 'American',
      description: 'Warm, professional young female voice'
    },
    defaultStyle: 'professional',
    supportedStyles: ['neutral', 'cheerful', 'professional', 'friendly', 'calm'],
    synthesis: {
      engine: {
        model: 'standard',
        quality: 'high',
        neural: false,
        streaming: true
      },
      prosody: {
        rate: 1.0,
        pitch: 0,
        volume: 80,
        emphasis: 'moderate'
      },
      output: {
        format: 'wav',
        sampleRate: 22050,
        channels: 1
      },
      advanced: {
        wordTimestamps: true,
        phonemeData: false
      }
    },
    isPremium: false
  },

  'middle-aged-man': {
    id: 'voice-middle-aged-man-default',
    name: 'Daniel (Middle-aged Male)',
    provider: 'browser',
    providerVoiceId: 'Daniel',
    language: 'en-US',
    locale: 'en-US',
    characteristics: {
      gender: 'male',
      age: 'middle',
      accent: 'American',
      description: 'Authoritative, experienced male voice'
    },
    defaultStyle: 'professional',
    supportedStyles: ['neutral', 'professional', 'serious', 'calm'],
    synthesis: {
      engine: {
        model: 'standard',
        quality: 'high',
        neural: false,
        streaming: true
      },
      prosody: {
        rate: 0.9,
        pitch: -10,
        volume: 85,
        emphasis: 'strong'
      },
      output: {
        format: 'wav',
        sampleRate: 22050,
        channels: 1
      },
      advanced: {
        wordTimestamps: true,
        phonemeData: false
      }
    },
    isPremium: false
  },

  'middle-aged-woman': {
    id: 'voice-middle-aged-woman-default',
    name: 'Victoria (Middle-aged Female)',
    provider: 'browser',
    providerVoiceId: 'Victoria',
    language: 'en-US',
    locale: 'en-US',
    characteristics: {
      gender: 'female',
      age: 'middle',
      accent: 'American',
      description: 'Sophisticated, confident female voice'
    },
    defaultStyle: 'professional',
    supportedStyles: ['neutral', 'professional', 'serious', 'calm', 'friendly'],
    synthesis: {
      engine: {
        model: 'standard',
        quality: 'high',
        neural: false,
        streaming: true
      },
      prosody: {
        rate: 1.0,
        pitch: 0,
        volume: 80,
        emphasis: 'moderate'
      },
      output: {
        format: 'wav',
        sampleRate: 22050,
        channels: 1
      },
      advanced: {
        wordTimestamps: true,
        phonemeData: false
      }
    },
    isPremium: false
  }
};

/**
 * Default behavior configurations for different contexts
 */
export const defaultBehaviors: Record<string, AvatarBehavior> = {
  professional: {
    autoGestures: true,
    gestureIntensity: 'moderate',
    idleAnimations: true,
    idleFrequency: 30,
    eyeContact: true,
    lookingPattern: 'direct',
    blinking: {
      enabled: true,
      frequency: 15
    },
    responseDelay: 500,
    animationSpeed: 1.0
  },

  casual: {
    autoGestures: true,
    gestureIntensity: 'expressive',
    idleAnimations: true,
    idleFrequency: 20,
    eyeContact: true,
    lookingPattern: 'natural',
    blinking: {
      enabled: true,
      frequency: 18
    },
    responseDelay: 300,
    animationSpeed: 1.1
  },

  formal: {
    autoGestures: true,
    gestureIntensity: 'subtle',
    idleAnimations: true,
    idleFrequency: 45,
    eyeContact: true,
    lookingPattern: 'direct',
    blinking: {
      enabled: true,
      frequency: 12
    },
    responseDelay: 800,
    animationSpeed: 0.9
  },

  friendly: {
    autoGestures: true,
    gestureIntensity: 'expressive',
    idleAnimations: true,
    idleFrequency: 15,
    eyeContact: true,
    lookingPattern: 'natural',
    blinking: {
      enabled: true,
      frequency: 20
    },
    responseDelay: 200,
    animationSpeed: 1.2
  }
};

/**
 * Pre-configured avatar models with default settings
 */
export const avatarModels: Record<string, Partial<AvatarConfig>> = {
  'young-man': {
    appearance: {
      model: 'young-man',
      skinTone: 'medium-light',
      hair: {
        style: 'short-professional',
        color: '#8B4513'
      },
      clothing: {
        top: 'business-shirt-blue',
        accessories: []
      },
      background: {
        type: 'solid',
        value: '#f0f0f0'
      },
      scale: 1.0,
      position: { x: 0, y: 0 }
    },
    behavior: defaultBehaviors.professional,
    voice: {
      provider: 'browser',
      voiceId: 'Alex',
      language: 'en-US',
      rate: 1.0,
      pitch: 0,
      volume: 0.8
    },
    audio: {
      sampleRate: 22050,
      bufferSize: 4096,
      format: 'wav',
      noiseReduction: true
    },
    performance: {
      maxFPS: 30,
      quality: 'high',
      monitoring: false
    },
    features: {
      streaming: true,
      lipSync: true,
      gestureGeneration: true,
      emotionDetection: true
    }
  },

  'young-woman': {
    appearance: {
      model: 'young-woman',
      skinTone: 'medium',
      hair: {
        style: 'long-wavy',
        color: '#654321'
      },
      clothing: {
        top: 'blouse-white',
        accessories: ['earrings-small']
      },
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      scale: 1.0,
      position: { x: 0, y: 0 }
    },
    behavior: defaultBehaviors.friendly,
    voice: {
      provider: 'browser',
      voiceId: 'Samantha',
      language: 'en-US',
      rate: 1.0,
      pitch: 0,
      volume: 0.8
    },
    audio: {
      sampleRate: 22050,
      bufferSize: 4096,
      format: 'wav',
      noiseReduction: true
    },
    performance: {
      maxFPS: 30,
      quality: 'high',
      monitoring: false
    },
    features: {
      streaming: true,
      lipSync: true,
      gestureGeneration: true,
      emotionDetection: true
    }
  },

  'middle-aged-man': {
    appearance: {
      model: 'middle-aged-man',
      skinTone: 'light',
      hair: {
        style: 'short-graying',
        color: '#696969'
      },
      clothing: {
        top: 'suit-navy',
        accessories: ['tie-red', 'watch-silver']
      },
      background: {
        type: 'solid',
        value: '#2c3e50'
      },
      scale: 1.0,
      position: { x: 0, y: 0 }
    },
    behavior: defaultBehaviors.professional,
    voice: {
      provider: 'browser',
      voiceId: 'Daniel',
      language: 'en-US',
      rate: 0.9,
      pitch: -0.1,
      volume: 0.85
    },
    audio: {
      sampleRate: 22050,
      bufferSize: 4096,
      format: 'wav',
      noiseReduction: true
    },
    performance: {
      maxFPS: 30,
      quality: 'high',
      monitoring: false
    },
    features: {
      streaming: true,
      lipSync: true,
      gestureGeneration: true,
      emotionDetection: true
    }
  },

  'middle-aged-woman': {
    appearance: {
      model: 'middle-aged-woman',
      skinTone: 'medium-light',
      hair: {
        style: 'bob-professional',
        color: '#8B4513'
      },
      clothing: {
        top: 'blazer-gray',
        accessories: ['necklace-pearl', 'earrings-pearl']
      },
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
      },
      scale: 1.0,
      position: { x: 0, y: 0 }
    },
    behavior: defaultBehaviors.professional,
    voice: {
      provider: 'browser',
      voiceId: 'Victoria',
      language: 'en-US',
      rate: 1.0,
      pitch: 0,
      volume: 0.8
    },
    audio: {
      sampleRate: 22050,
      bufferSize: 4096,
      format: 'wav',
      noiseReduction: true
    },
    performance: {
      maxFPS: 30,
      quality: 'high',
      monitoring: false
    },
    features: {
      streaming: true,
      lipSync: true,
      gestureGeneration: true,
      emotionDetection: true
    }
  }
};

/**
 * Customization presets for quick avatar setup
 */
export const customizationPresets: CustomizationPreset[] = [
  {
    id: 'professional-male',
    name: 'Professional Male',
    description: 'Business-ready male avatar with suit and professional demeanor',
    category: 'professional',
    previewUrl: '/assets/previews/professional-male.jpg',
    isPremium: false,
    settings: {
      appearance: {
        model: 'middle-aged-man',
        skinTone: 'medium-light'
      },
      hair: {
        styleId: 'short-professional',
        colorId: 'dark-brown'
      },
      facial: {
        eyeShapeId: 'standard',
        eyeColorId: 'brown',
        eyebrowShapeId: 'medium-thick',
        noseShapeId: 'medium',
        lipShapeId: 'medium',
        facialHairId: 'clean-shaven'
      },
      clothing: {
        topId: 'suit-navy'
      },
      accessories: {
        jewelryIds: ['watch-silver'],
        glassesId: 'reading-glasses'
      },
      background: {
        type: 'solid',
        id: 'office-gray'
      },
      animation: {
        idlePoseId: 'professional-standing',
        gestureStyleId: 'business-moderate',
        expressionIds: ['confident', 'focused']
      }
    }
  },

  {
    id: 'professional-female',
    name: 'Professional Female',
    description: 'Business-ready female avatar with professional attire',
    category: 'professional',
    previewUrl: '/assets/previews/professional-female.jpg',
    isPremium: false,
    settings: {
      appearance: {
        model: 'middle-aged-woman',
        skinTone: 'medium'
      },
      hair: {
        styleId: 'bob-professional',
        colorId: 'auburn'
      },
      facial: {
        eyeShapeId: 'standard',
        eyeColorId: 'hazel',
        eyebrowShapeId: 'medium',
        noseShapeId: 'small',
        lipShapeId: 'medium',
        lipColorId: 'neutral-pink'
      },
      clothing: {
        topId: 'blazer-charcoal'
      },
      accessories: {
        jewelryIds: ['earrings-pearl', 'necklace-simple']
      },
      background: {
        type: 'gradient',
        id: 'professional-blue'
      },
      animation: {
        idlePoseId: 'confident-standing',
        gestureStyleId: 'professional-expressive',
        expressionIds: ['approachable', 'confident']
      }
    }
  },

  {
    id: 'casual-male',
    name: 'Casual Male',
    description: 'Friendly, approachable male avatar for casual interactions',
    category: 'casual',
    previewUrl: '/assets/previews/casual-male.jpg',
    isPremium: false,
    settings: {
      appearance: {
        model: 'young-man',
        skinTone: 'medium'
      },
      hair: {
        styleId: 'casual-tousled',
        colorId: 'light-brown'
      },
      facial: {
        eyeShapeId: 'friendly',
        eyeColorId: 'blue',
        eyebrowShapeId: 'medium',
        noseShapeId: 'medium',
        lipShapeId: 'medium',
        facialHairId: 'light-stubble'
      },
      clothing: {
        topId: 'polo-shirt-navy'
      },
      accessories: {},
      background: {
        type: 'gradient',
        id: 'casual-warm'
      },
      animation: {
        idlePoseId: 'relaxed-standing',
        gestureStyleId: 'casual-expressive',
        expressionIds: ['friendly', 'relaxed']
      }
    }
  },

  {
    id: 'casual-female',
    name: 'Casual Female',
    description: 'Warm, friendly female avatar for casual conversations',
    category: 'casual',
    previewUrl: '/assets/previews/casual-female.jpg',
    isPremium: false,
    settings: {
      appearance: {
        model: 'young-woman',
        skinTone: 'light'
      },
      hair: {
        styleId: 'long-wavy',
        colorId: 'blonde'
      },
      facial: {
        eyeShapeId: 'bright',
        eyeColorId: 'green',
        eyebrowShapeId: 'natural',
        noseShapeId: 'small',
        lipShapeId: 'full',
        lipColorId: 'coral'
      },
      clothing: {
        topId: 'cardigan-cream'
      },
      accessories: {
        jewelryIds: ['earrings-hoops']
      },
      background: {
        type: 'gradient',
        id: 'warm-sunset'
      },
      animation: {
        idlePoseId: 'friendly-standing',
        gestureStyleId: 'expressive-warm',
        expressionIds: ['warm', 'engaging']
      }
    }
  },

  {
    id: 'creative-male',
    name: 'Creative Male',
    description: 'Artistic, innovative male avatar for creative presentations',
    category: 'creative',
    previewUrl: '/assets/previews/creative-male.jpg',
    isPremium: true,
    settings: {
      appearance: {
        model: 'young-man',
        skinTone: 'medium-dark'
      },
      hair: {
        styleId: 'artistic-messy',
        colorId: 'black'
      },
      facial: {
        eyeShapeId: 'intense',
        eyeColorId: 'dark-brown',
        eyebrowShapeId: 'thick',
        noseShapeId: 'strong',
        lipShapeId: 'medium',
        facialHairId: 'designer-stubble'
      },
      clothing: {
        topId: 'henley-charcoal'
      },
      accessories: {
        glassesId: 'designer-frames'
      },
      background: {
        type: 'image',
        id: 'creative-studio'
      },
      animation: {
        idlePoseId: 'creative-thinking',
        gestureStyleId: 'artistic-expressive',
        expressionIds: ['inspired', 'thoughtful']
      }
    }
  },

  {
    id: 'creative-female',
    name: 'Creative Female',
    description: 'Artistic, innovative female avatar for creative content',
    category: 'creative',
    previewUrl: '/assets/previews/creative-female.jpg',
    isPremium: true,
    settings: {
      appearance: {
        model: 'young-woman',
        skinTone: 'medium-light'
      },
      hair: {
        styleId: 'pixie-creative',
        colorId: 'burgundy'
      },
      facial: {
        eyeShapeId: 'artistic',
        eyeColorId: 'amber',
        eyebrowShapeId: 'bold',
        noseShapeId: 'small',
        lipShapeId: 'full',
        lipColorId: 'berry'
      },
      clothing: {
        topId: 'artist-smock'
      },
      accessories: {
        jewelryIds: ['earrings-statement', 'bracelet-leather']
      },
      background: {
        type: 'image',
        id: 'art-studio'
      },
      animation: {
        idlePoseId: 'creative-stance',
        gestureStyleId: 'artistic-flowing',
        expressionIds: ['passionate', 'creative']
      }
    }
  }
];

/**
 * Factory function to create a complete avatar configuration
 */
export function createAvatarConfig(
  id: string,
  modelType: keyof typeof avatarModels,
  overrides: Partial<AvatarConfig> = {}
): AvatarConfig {
  const baseModel = avatarModels[modelType];
  
  if (!baseModel) {
    throw new Error(`Unknown avatar model: ${modelType}`);
  }

  const config: AvatarConfig = {
    id,
    appearance: baseModel.appearance!,
    behavior: baseModel.behavior!,
    voice: baseModel.voice!,
    audio: baseModel.audio!,
    performance: baseModel.performance!,
    features: baseModel.features!,
    ...overrides
  };

  return config;
}

/**
 * Get default configuration for a model type
 */
export function getDefaultModelConfig(modelType: keyof typeof avatarModels): Partial<AvatarConfig> {
  return avatarModels[modelType] || {};
}

/**
 * Get voice profile for a model
 */
export function getVoiceProfileForModel(modelType: keyof typeof avatarModels): VoiceProfile {
  return defaultVoiceProfiles[modelType] || defaultVoiceProfiles['young-man'];
}

/**
 * Get behavior configuration by style
 */
export function getBehaviorConfig(style: keyof typeof defaultBehaviors): AvatarBehavior {
  return defaultBehaviors[style] || defaultBehaviors.professional;
}

/**
 * Apply customization preset to avatar configuration
 */
export function applyCustomizationPreset(
  config: AvatarConfig, 
  presetId: string
): AvatarConfig {
  const preset = customizationPresets.find(p => p.id === presetId);
  
  if (!preset) {
    throw new Error(`Preset not found: ${presetId}`);
  }

  // This would involve mapping preset settings to actual configuration
  // For now, return the original config
  return config;
}

/**
 * Available avatar models metadata
 */
export const availableModels = [
  {
    id: 'young-man',
    name: 'Young Man',
    description: 'Professional young male avatar',
    category: 'male',
    ageGroup: 'young',
    previewUrl: '/assets/previews/young-man.jpg',
    isPremium: false
  },
  {
    id: 'young-woman',
    name: 'Young Woman',
    description: 'Professional young female avatar',
    category: 'female',
    ageGroup: 'young',
    previewUrl: '/assets/previews/young-woman.jpg',
    isPremium: false
  },
  {
    id: 'middle-aged-man',
    name: 'Middle-aged Man',
    description: 'Experienced professional male avatar',
    category: 'male',
    ageGroup: 'middle-aged',
    previewUrl: '/assets/previews/middle-aged-man.jpg',
    isPremium: false
  },
  {
    id: 'middle-aged-woman',
    name: 'Middle-aged Woman',
    description: 'Experienced professional female avatar',
    category: 'female',
    ageGroup: 'middle-aged',
    previewUrl: '/assets/previews/middle-aged-woman.jpg',
    isPremium: false
  }
] as const;