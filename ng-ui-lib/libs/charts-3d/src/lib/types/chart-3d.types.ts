import * as THREE from 'three';

/**
 * 3D Chart Types
 */
export type Chart3DType = 
  | '3d-bar' 
  | '3d-scatter' 
  | '3d-surface' 
  | '3d-globe' 
  | '3d-network' 
  | '3d-pie' 
  | '3d-area';

/**
 * Data structures for 3D charts
 */
export interface Chart3DDataPoint {
  x: number;
  y: number;
  z: number;
  value?: number;
  color?: string | number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface Chart3DData {
  name: string;
  data: Chart3DDataPoint[];
  color?: string | number;
  type?: string;
}

/**
 * 3D Chart Configuration
 */
export interface Chart3DConfig {
  type: Chart3DType;
  width?: number;
  height?: number;
  background?: string;
  renderer?: {
    antialias?: boolean;
    alpha?: boolean;
    shadowMap?: {
      enabled: boolean;
      type?: THREE.ShadowMapType;
    };
    toneMapping?: THREE.ToneMapping;
    toneMappingExposure?: number;
  };
  camera?: {
    position?: [number, number, number];
    lookAt?: [number, number, number];
    fov?: number;
    near?: number;
    far?: number;
  };
  controls?: {
    enabled?: boolean;
    enableZoom?: boolean;
    enablePan?: boolean;
    enableRotate?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    dampingFactor?: number;
    minDistance?: number;
    maxDistance?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
  };
  lighting?: {
    ambient?: {
      color: string | number;
      intensity: number;
    };
    directional?: Array<{
      color: string | number;
      intensity: number;
      position: [number, number, number];
      castShadow?: boolean;
    }>;
    point?: Array<{
      color: string | number;
      intensity: number;
      position: [number, number, number];
      distance?: number;
      decay?: number;
    }>;
  };
  animation?: {
    duration?: number;
    easing?: string;
    autoStart?: boolean;
    loop?: boolean;
  };
  interaction?: {
    tooltip?: boolean;
    selection?: boolean;
    highlight?: boolean;
    drillDown?: boolean;
  };
  performance?: {
    levelOfDetail?: boolean;
    frustumCulling?: boolean;
    instancedRendering?: boolean;
    textureAtlas?: boolean;
    maxObjects?: number;
  };
}

/**
 * Performance optimization settings
 */
export interface LODConfig {
  enabled: boolean;
  levels: Array<{
    distance: number;
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
  }>;
}

export interface FrustumCullingConfig {
  enabled: boolean;
  margin: number;
}

export interface InstancedRenderingConfig {
  enabled: boolean;
  maxInstances: number;
  attributes: string[];
}

/**
 * VR/AR Configuration
 */
export interface XRConfig {
  enabled: boolean;
  mode: 'vr' | 'ar';
  controllers: boolean;
  hapticFeedback: boolean;
}

/**
 * Event types
 */
export interface Chart3DEvent {
  type: string;
  target: THREE.Object3D;
  point?: THREE.Vector3;
  data?: Chart3DDataPoint;
  originalEvent?: Event;
}

export interface Chart3DClickEvent extends Chart3DEvent {
  type: 'click';
}

export interface Chart3DHoverEvent extends Chart3DEvent {
  type: 'hover';
}

export interface Chart3DSelectEvent extends Chart3DEvent {
  type: 'select';
  selected: Chart3DDataPoint[];
}

/**
 * Animation keyframes
 */
export interface Chart3DKeyframe {
  time: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  opacity?: number;
  color?: string | number;
}

export interface Chart3DAnimation {
  target: THREE.Object3D;
  keyframes: Chart3DKeyframe[];
  duration: number;
  easing?: THREE.AnimationClip;
  loop?: boolean;
  autoStart?: boolean;
}

/**
 * Texture and material configurations
 */
export interface TextureConfig {
  url?: string;
  data?: ImageData | HTMLImageElement | HTMLCanvasElement;
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  magFilter?: THREE.TextureFilter;
  minFilter?: THREE.TextureFilter;
  anisotropy?: number;
}

export interface MaterialConfig {
  type: 'basic' | 'lambert' | 'phong' | 'physical' | 'standard';
  color?: string | number;
  opacity?: number;
  transparent?: boolean;
  texture?: TextureConfig;
  normalMap?: TextureConfig;
  roughness?: number;
  metalness?: number;
  emissive?: string | number;
  emissiveIntensity?: number;
  wireframe?: boolean;
}

/**
 * Chart-specific configurations
 */
export interface BarChart3DConfig extends Chart3DConfig {
  bars?: {
    width?: number;
    depth?: number;
    spacing?: number;
    material?: MaterialConfig;
    gradient?: boolean;
  };
  axes?: {
    x?: AxisConfig;
    y?: AxisConfig;
    z?: AxisConfig;
  };
}

export interface ScatterChart3DConfig extends Chart3DConfig {
  points?: {
    size?: number;
    shape?: 'sphere' | 'cube' | 'cylinder';
    material?: MaterialConfig;
    sizeByValue?: boolean;
  };
  axes?: {
    x?: AxisConfig;
    y?: AxisConfig;
    z?: AxisConfig;
  };
}

export interface SurfaceChart3DConfig extends Chart3DConfig {
  surface?: {
    resolution?: number;
    wireframe?: boolean;
    material?: MaterialConfig;
    heightScale?: number;
  };
}

export interface GlobeChart3DConfig extends Chart3DConfig {
  globe?: {
    radius?: number;
    segments?: number;
    texture?: TextureConfig;
    atmosphere?: boolean;
    rotation?: {
      enabled: boolean;
      speed: number;
    };
  };
  data?: {
    points?: Chart3DDataPoint[];
    arcs?: Array<{
      from: [number, number];
      to: [number, number];
      value: number;
      color?: string;
    }>;
  };
}

export interface NetworkChart3DConfig extends Chart3DConfig {
  nodes?: {
    size?: number;
    material?: MaterialConfig;
    label?: {
      enabled: boolean;
      font?: string;
      size?: number;
      color?: string;
    };
  };
  edges?: {
    width?: number;
    material?: MaterialConfig;
    curved?: boolean;
  };
  physics?: {
    enabled: boolean;
    gravity?: number;
    damping?: number;
  };
}

export interface PieChart3DConfig extends Chart3DConfig {
  pie?: {
    radius?: number;
    height?: number;
    innerRadius?: number;
    startAngle?: number;
    explosion?: {
      enabled: boolean;
      distance: number;
    };
  };
}

export interface AreaChart3DConfig extends Chart3DConfig {
  area?: {
    depth?: number;
    material?: MaterialConfig;
    smooth?: boolean;
    filled?: boolean;
  };
  axes?: {
    x?: AxisConfig;
    y?: AxisConfig;
    z?: AxisConfig;
  };
}

export interface AxisConfig {
  title?: string;
  min?: number;
  max?: number;
  ticks?: number;
  tickFormat?: (value: number) => string;
  grid?: boolean;
  color?: string;
  fontSize?: number;
}

/**
 * Utility types
 */
export type Vector3Tuple = [number, number, number];
export type ColorValue = string | number | THREE.Color;
export type Chart3DCallback<T = any> = (event: T) => void;
