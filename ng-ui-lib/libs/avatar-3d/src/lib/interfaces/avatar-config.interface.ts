import * as THREE from 'three';

/**
 * Configuration interface for 3D avatar system
 */
export interface AvatarConfig {
  /** Container element for the 3D scene */
  container: HTMLElement;
  
  /** Avatar model configuration */
  model: {
    /** URL or path to the 3D model file (GLTF/GLB) */
    url: string;
    /** Scale factor for the model */
    scale?: THREE.Vector3;
    /** Position offset */
    position?: THREE.Vector3;
    /** Rotation offset */
    rotation?: THREE.Euler;
    /** Enable automatic scaling based on container size */
    autoScale?: boolean;
  };

  /** Scene configuration */
  scene: {
    /** Background color or environment */
    background?: THREE.Color | THREE.Texture | THREE.CubeTexture;
    /** Enable fog */
    fog?: {
      enabled: boolean;
      color: THREE.Color;
      near: number;
      far: number;
    };
    /** Environment map for reflections */
    environmentMap?: THREE.CubeTexture | THREE.Texture;
  };

  /** Camera configuration */
  camera: {
    /** Camera type */
    type: 'perspective' | 'orthographic';
    /** Field of view for perspective camera */
    fov?: number;
    /** Near clipping plane */
    near?: number;
    /** Far clipping plane */
    far?: number;
    /** Initial camera position */
    position?: THREE.Vector3;
    /** Camera target/look at position */
    target?: THREE.Vector3;
    /** Enable camera controls */
    controls?: boolean;
    /** Camera movement constraints */
    constraints?: {
      minDistance?: number;
      maxDistance?: number;
      minPolarAngle?: number;
      maxPolarAngle?: number;
      minAzimuthAngle?: number;
      maxAzimuthAngle?: number;
    };
  };

  /** Lighting configuration */
  lighting: {
    /** Ambient light settings */
    ambient?: {
      enabled: boolean;
      color: THREE.Color;
      intensity: number;
    };
    /** Directional light settings */
    directional?: {
      enabled: boolean;
      color: THREE.Color;
      intensity: number;
      position: THREE.Vector3;
      castShadow?: boolean;
      shadowMapSize?: number;
    };
    /** Point lights */
    pointLights?: Array<{
      color: THREE.Color;
      intensity: number;
      position: THREE.Vector3;
      distance?: number;
      decay?: number;
      castShadow?: boolean;
    }>;
    /** Spot lights */
    spotLights?: Array<{
      color: THREE.Color;
      intensity: number;
      position: THREE.Vector3;
      target: THREE.Vector3;
      angle: number;
      penumbra?: number;
      decay?: number;
      castShadow?: boolean;
    }>;
    /** HDR environment lighting */
    hdr?: {
      enabled: boolean;
      envMap?: THREE.Texture;
      intensity?: number;
    };
  };

  /** Rendering configuration */
  rendering: {
    /** Renderer type */
    renderer: 'webgl' | 'webgl2';
    /** Enable shadows */
    shadows?: boolean;
    /** Shadow type */
    shadowType?: THREE.ShadowMapType;
    /** Enable antialiasing */
    antialias?: boolean;
    /** Pixel ratio */
    pixelRatio?: number;
    /** Enable tone mapping */
    toneMapping?: THREE.ToneMapping;
    /** Tone mapping exposure */
    toneMappingExposure?: number;
    /** Enable post-processing */
    postProcessing?: {
      enabled: boolean;
      effects: PostProcessingEffect[];
    };
  };

  /** Performance configuration */
  performance: {
    /** Enable Level of Detail (LOD) */
    lod?: boolean;
    /** LOD distances */
    lodDistances?: number[];
    /** Enable frustum culling */
    frustumCulling?: boolean;
    /** Enable occlusion culling */
    occlusionCulling?: boolean;
    /** Maximum frame rate */
    maxFPS?: number;
    /** Enable adaptive quality */
    adaptiveQuality?: boolean;
  };

  /** Animation configuration */
  animation: {
    /** Enable skeletal animations */
    skeletal?: boolean;
    /** Enable morph target animations */
    morphTargets?: boolean;
    /** Enable facial animations */
    facial?: boolean;
    /** Animation mixer settings */
    mixer?: {
      timeScale?: number;
      crossFadeDuration?: number;
    };
    /** Enable physics-based animations */
    physics?: boolean;
  };

  /** Audio configuration for lip sync */
  audio?: {
    enabled: boolean;
    /** Audio context for analysis */
    context?: AudioContext;
    /** Enable real-time lip sync */
    lipSync?: boolean;
    /** Viseme mapping */
    visemes?: VisemeMapping;
  };

  /** Accessibility features */
  accessibility?: {
    /** Enable keyboard navigation */
    keyboard?: boolean;
    /** Enable screen reader support */
    screenReader?: boolean;
    /** Reduce motion for accessibility */
    reduceMotion?: boolean;
  };
}

/**
 * Post-processing effects configuration
 */
export interface PostProcessingEffect {
  type: 'bloom' | 'ssao' | 'ssr' | 'dof' | 'fxaa' | 'smaa' | 'outline' | 'colorCorrection';
  enabled: boolean;
  parameters?: Record<string, any>;
}

/**
 * Viseme mapping for lip sync
 */
export interface VisemeMapping {
  [phoneme: string]: {
    morphTargets: Array<{
      name: string;
      weight: number;
    }>;
    duration?: number;
  };
}

/**
 * Avatar capabilities interface
 */
export interface AvatarCapabilities {
  /** WebGL version support */
  webglVersion: 1 | 2;
  /** Maximum texture size */
  maxTextureSize: number;
  /** Maximum vertex uniform vectors */
  maxVertexUniforms: number;
  /** Maximum fragment uniform vectors */
  maxFragmentUniforms: number;
  /** Extensions support */
  extensions: {
    instancedArrays: boolean;
    vertexArrayObject: boolean;
    depthTexture: boolean;
    textureFloat: boolean;
    textureHalfFloat: boolean;
    standardDerivatives: boolean;
    shaderTextureLOD: boolean;
    fragDepth: boolean;
    drawBuffers: boolean;
    textureFilterAnisotropic: boolean;
  };
  /** Performance tier estimation */
  performanceTier: 'low' | 'medium' | 'high';
}

/**
 * Avatar state interface
 */
export interface AvatarState {
  /** Current loading state */
  loading: boolean;
  /** Loading progress (0-1) */
  progress: number;
  /** Current error state */
  error?: string;
  /** Model loaded state */
  modelLoaded: boolean;
  /** Animation state */
  animationState: {
    /** Currently playing animations */
    playing: string[];
    /** Animation queue */
    queue: string[];
    /** Current facial expression */
    expression?: FacialExpression;
    /** Current emotion blend */
    emotion?: EmotionBlend;
  };
  /** Rendering performance metrics */
  performance: {
    /** Current FPS */
    fps: number;
    /** Frame time in milliseconds */
    frameTime: number;
    /** Draw calls per frame */
    drawCalls: number;
    /** Triangle count */
    triangles: number;
    /** Memory usage */
    memory: {
      geometries: number;
      textures: number;
      total: number;
    };
  };
}

/**
 * Facial expression interface
 */
export interface FacialExpression {
  /** Expression name */
  name: string;
  /** Morph target weights */
  morphWeights: Record<string, number>;
  /** Expression intensity (0-1) */
  intensity: number;
  /** Transition duration */
  duration?: number;
}

/**
 * Emotion blending interface
 */
export interface EmotionBlend {
  /** Primary emotion */
  primary: {
    emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral';
    intensity: number;
  };
  /** Secondary emotion for blending */
  secondary?: {
    emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral';
    intensity: number;
    blendFactor: number;
  };
}

/**
 * Avatar events interface
 */
export interface AvatarEvents {
  /** Model loading progress */
  'loading-progress': (progress: number) => void;
  /** Model loaded successfully */
  'model-loaded': (model: THREE.Object3D) => void;
  /** Loading error */
  'loading-error': (error: string) => void;
  /** Animation started */
  'animation-start': (animationName: string) => void;
  /** Animation finished */
  'animation-finish': (animationName: string) => void;
  /** Performance metrics update */
  'performance-update': (metrics: AvatarState['performance']) => void;
  /** User interaction */
  'interaction': (type: 'click' | 'hover' | 'focus', object: THREE.Object3D) => void;
}