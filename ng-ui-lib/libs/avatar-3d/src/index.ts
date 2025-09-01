/**
 * @fileoverview Public API for Avatar 3D Library
 * 
 * A comprehensive 3D avatar system using Three.js with:
 * - Advanced model loading and caching
 * - Skeletal animation with IK
 * - Facial animation with 52 FACS action units
 * - Emotion blending and lip sync
 * - Advanced rendering (SSS, hair simulation, shadows)
 * - Real-time customization system
 * - Gesture recognition and motion capture
 * - Performance optimization (LOD, virtual scrolling)
 * 
 * @example Basic Usage
 * ```typescript
 * import { Avatar3DComponent, AvatarConfig } from '@ng-ui-lib/avatar-3d';
 * 
 * const config: AvatarConfig = {
 *   container: document.getElementById('avatar-container')!,
 *   model: {
 *     url: 'assets/models/avatar.glb',
 *     autoScale: true
 *   },
 *   scene: {
 *     background: new THREE.Color(0xf0f0f0)
 *   },
 *   camera: {
 *     type: 'perspective',
 *     position: new THREE.Vector3(0, 1.6, 3)
 *   },
 *   lighting: {
 *     ambient: { enabled: true, color: new THREE.Color(0x404040), intensity: 0.4 },
 *     directional: { 
 *       enabled: true, 
 *       color: new THREE.Color(0xffffff), 
 *       intensity: 1.0,
 *       position: new THREE.Vector3(2, 4, 2),
 *       castShadow: true
 *     }
 *   },
 *   rendering: {
 *     renderer: 'webgl2',
 *     shadows: true,
 *     antialias: true
 *   }
 * };
 * ```
 * 
 * @example Advanced Features
 * ```typescript
 * // Play animations
 * avatar.playAnimation('wave', { loop: false, fadeInDuration: 0.3 });
 * 
 * // Facial expressions
 * avatar.playExpression('happiness', 0.8);
 * 
 * // Gaze tracking
 * avatar.setGazeTarget(new THREE.Vector3(0, 1.6, -2));
 * 
 * // Customization
 * customizationService.updateSkinMaterial({
 *   baseColor: new THREE.Color(0xFFDBB3),
 *   roughness: 0.7
 * });
 * ```
 */

// Core Components
export { Avatar3DComponent } from './lib/components/avatar-3d.component';

// Interfaces and Types
export type { 
  AvatarConfig, 
  AvatarCapabilities, 
  AvatarState, 
  AvatarEvents,
  FacialExpression,
  EmotionBlend,
  PostProcessingEffect,
  VisemeMapping
} from './lib/interfaces/avatar-config.interface';

export type {
  ModelCacheEntry,
  ModelLoadingOptions,
  LoadingProgress,
  AvatarModel,
  ModelMetadata,
  LODLevel,
  FallbackModel,
  ModelValidation,
  ModelLoadingError,
  TextureOptimization,
  GeometryOptimization,
  ModelPreprocessing,
  StreamingModel
} from './lib/interfaces/model-loading.interface';

export type {
  SkeletalAnimation,
  MorphTargetAnimation,
  FacialActionUnit,
  FacialExpressionSystem,
  ExpressionBlend,
  EyeTrackingData,
  EyeData,
  BlinkSystem,
  BlinkState,
  IKChain,
  IKConstraint,
  AnimationLayer,
  AnimationMask,
  MotionCaptureData,
  Gesture,
  AnimationStateMachine,
  AnimationState,
  AnimationTransition,
  AnimationCondition,
  ProceduralAnimation
} from './lib/interfaces/animation.interface';

// Services
export { SceneService } from './lib/services/scene.service';
export { ModelLoaderService } from './lib/services/model-loader.service';
export { AnimationService } from './lib/services/animation.service';
export { FacialAnimationService } from './lib/services/facial-animation.service';
export { 
  CustomizationService, 
  type CustomizationOptions, 
  type CustomizationPreset 
} from './lib/services/customization.service';

// Shaders and Advanced Rendering
export { 
  subsurfaceScatteringVertexShader,
  subsurfaceScatteringFragmentShader,
  createSubsurfaceScatteringMaterial
} from './lib/shaders/subsurface-scattering';

export {
  hairVertexShader,
  hairFragmentShader,
  createHairMaterial,
  HairSystem
} from './lib/shaders/hair-simulation';

// Re-export Three.js for convenience
export * as THREE from 'three';

// Utility functions for common tasks
export const AvatarUtils = {
  /**
   * Create a basic avatar configuration
   */
  createBasicConfig(container: HTMLElement): AvatarConfig {
    return {
      container,
      model: {
        url: '',
        autoScale: true
      },
      scene: {
        background: new THREE.Color(0xf5f5f5)
      },
      camera: {
        type: 'perspective',
        fov: 75,
        position: new THREE.Vector3(0, 1.6, 3),
        target: new THREE.Vector3(0, 1, 0),
        controls: true
      },
      lighting: {
        ambient: {
          enabled: true,
          color: new THREE.Color(0x404040),
          intensity: 0.4
        },
        directional: {
          enabled: true,
          color: new THREE.Color(0xffffff),
          intensity: 1.0,
          position: new THREE.Vector3(2, 4, 2),
          castShadow: true,
          shadowMapSize: 2048
        }
      },
      rendering: {
        renderer: 'webgl2',
        shadows: true,
        shadowType: THREE.PCFSoftShadowMap,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0
      },
      performance: {
        lod: true,
        lodDistances: [10, 25, 50],
        frustumCulling: true,
        adaptiveQuality: true
      },
      animation: {
        skeletal: true,
        morphTargets: true,
        facial: true,
        physics: false
      }
    };
  },

  /**
   * Create a high-performance configuration for mobile devices
   */
  createMobileConfig(container: HTMLElement): AvatarConfig {
    return {
      ...this.createBasicConfig(container),
      rendering: {
        renderer: 'webgl',
        shadows: false,
        antialias: false,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        toneMapping: THREE.LinearToneMapping
      },
      performance: {
        lod: true,
        lodDistances: [5, 15, 30],
        frustumCulling: true,
        adaptiveQuality: true,
        maxFPS: 30
      },
      lighting: {
        ambient: {
          enabled: true,
          color: new THREE.Color(0x404040),
          intensity: 0.6
        },
        directional: {
          enabled: true,
          color: new THREE.Color(0xffffff),
          intensity: 0.8,
          position: new THREE.Vector3(2, 4, 2),
          castShadow: false
        }
      }
    };
  },

  /**
   * Create a high-quality configuration for desktop
   */
  createDesktopConfig(container: HTMLElement): AvatarConfig {
    return {
      ...this.createBasicConfig(container),
      rendering: {
        renderer: 'webgl2',
        shadows: true,
        shadowType: THREE.PCFSoftShadowMap,
        antialias: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        postProcessing: {
          enabled: true,
          effects: [
            { type: 'bloom', enabled: false, parameters: {} },
            { type: 'ssao', enabled: true, parameters: {} },
            { type: 'fxaa', enabled: true, parameters: {} }
          ]
        }
      },
      performance: {
        lod: true,
        lodDistances: [20, 40, 80],
        frustumCulling: true,
        adaptiveQuality: false
      },
      lighting: {
        ambient: {
          enabled: true,
          color: new THREE.Color(0x404040),
          intensity: 0.3
        },
        directional: {
          enabled: true,
          color: new THREE.Color(0xffffff),
          intensity: 1.2,
          position: new THREE.Vector3(2, 4, 2),
          castShadow: true,
          shadowMapSize: 4096
        },
        pointLights: [
          {
            color: new THREE.Color(0xffffff),
            intensity: 0.3,
            position: new THREE.Vector3(-2, 2, 2),
            distance: 10,
            decay: 2,
            castShadow: false
          }
        ],
        hdr: {
          enabled: true,
          intensity: 0.8
        }
      }
    };
  },

  /**
   * Common FACS action unit combinations for expressions
   */
  facialExpressions: {
    // Basic emotions (Ekman's 6 basic emotions + neutral)
    neutral: [],
    happiness: [6, 12], // Cheek raiser + Lip corner puller
    sadness: [1, 4, 15], // Inner brow raiser + Brow lowerer + Lip corner depressor
    anger: [4, 5, 7, 23], // Brow lowerer + Upper lid raiser + Lid tightener + Lip tightener
    fear: [1, 2, 4, 5, 20, 26], // Inner brow raiser + Outer brow raiser + Brow lowerer + Upper lid raiser + Lip stretcher + Jaw drop
    surprise: [1, 2, 5, 26], // Inner brow raiser + Outer brow raiser + Upper lid raiser + Jaw drop
    disgust: [9, 15, 16], // Nose wrinkler + Lip corner depressor + Lower lip depressor
    contempt: [12, 14], // Unilateral lip corner puller + Dimpler

    // Social expressions
    smile: [6, 12], // Cheek raiser + Lip corner puller
    laugh: [6, 12, 26], // Cheek raiser + Lip corner puller + Jaw drop
    frown: [4, 15], // Brow lowerer + Lip corner depressor
    wink: [7], // Lid tightener (unilateral)
    kiss: [18, 22], // Lip puckerer + Lip funneler
    
    // Speech-related
    speaking: [25], // Lips part
    shouting: [5, 26, 27], // Upper lid raiser + Jaw drop + Mouth stretch
    whispering: [23, 24], // Lip tightener + Lip presser
  },

  /**
   * Common visemes for lip sync
   */
  visemes: {
    silence: 'sil',
    vowels: {
      a: 'aa',  // "father"
      e: 'eh',  // "red" 
      i: 'iy',  // "green"
      o: 'ow',  // "boat"
      u: 'uw'   // "blue"
    },
    consonants: {
      b: 'b',   // "big"
      p: 'p',   // "put"  
      m: 'm',   // "man"
      f: 'f',   // "fork"
      v: 'v',   // "voice"
      th: 'th', // "think"
      s: 's',   // "sun"
      z: 'z',   // "zoo"
      t: 't',   // "top"
      d: 'd',   // "dog"
      n: 'n',   // "no"
      l: 'l',   // "lay"
      r: 'r'    // "red"
    }
  },

  /**
   * Common gesture categories
   */
  gestureCategories: {
    greeting: ['wave', 'handshake', 'bow', 'salute'],
    pointing: ['pointLeft', 'pointRight', 'pointUp', 'pointDown', 'pointForward'],
    approval: ['thumbsUp', 'okSign', 'clap', 'nod'],
    disapproval: ['thumbsDown', 'shake', 'cross', 'facepalm'],
    emotional: ['celebration', 'shrug', 'surprise', 'thinking'],
    communication: ['stop', 'come', 'go', 'wait', 'listen']
  },

  /**
   * Performance optimization helpers
   */
  performance: {
    /**
     * Estimate device performance tier
     */
    getDeviceTier(): 'low' | 'medium' | 'high' {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'low';
      
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      
      // Simple heuristics for device classification
      if (renderer.includes('Mali') || renderer.includes('Adreno') || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        return /iPhone 1[2-9]|iPad Pro|Pixel [5-9]/i.test(navigator.userAgent) ? 'medium' : 'low';
      }
      
      if (renderer.includes('Intel')) {
        return renderer.includes('Iris') || renderer.includes('UHD') ? 'medium' : 'low';
      }
      
      if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Radeon')) {
        return 'high';
      }
      
      return 'medium';
    },

    /**
     * Get optimal configuration based on device
     */
    getOptimalConfig(container: HTMLElement): AvatarConfig {
      const tier = this.getDeviceTier();
      
      switch (tier) {
        case 'low':
          return AvatarUtils.createMobileConfig(container);
        case 'high':
          return AvatarUtils.createDesktopConfig(container);
        default:
          return AvatarUtils.createBasicConfig(container);
      }
    }
  }
};

// Version information
export const AVATAR_3D_VERSION = '1.0.0';