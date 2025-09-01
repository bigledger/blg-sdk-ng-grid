import * as THREE from 'three';

/**
 * Model loading system interfaces
 */

/**
 * Model cache entry interface
 */
export interface ModelCacheEntry {
  /** Cache key (usually the model URL) */
  key: string;
  /** Cached model */
  model: THREE.Object3D;
  /** Original GLTF data */
  gltf?: any;
  /** Cache timestamp */
  timestamp: number;
  /** Access count for LRU */
  accessCount: number;
  /** Last access time */
  lastAccess: number;
  /** Model size in bytes */
  size: number;
  /** LOD levels */
  lodLevels?: LODLevel[];
}

/**
 * Level of Detail (LOD) configuration
 */
export interface LODLevel {
  /** Distance threshold for this LOD level */
  distance: number;
  /** Model object for this LOD */
  object: THREE.Object3D;
  /** Triangle count reduction percentage */
  reductionPercentage: number;
  /** Texture resolution scale */
  textureScale: number;
}

/**
 * Model loading options
 */
export interface ModelLoadingOptions {
  /** Model URL or path */
  url: string;
  /** Enable caching */
  cache?: boolean;
  /** Cache timeout in milliseconds */
  cacheTimeout?: number;
  /** Enable LOD generation */
  enableLOD?: boolean;
  /** LOD distances */
  lodDistances?: number[];
  /** Enable texture compression */
  textureCompression?: boolean;
  /** Maximum texture size */
  maxTextureSize?: number;
  /** Enable geometry compression */
  geometryCompression?: boolean;
  /** Loading progress callback */
  onProgress?: (loaded: number, total: number) => void;
  /** Preprocessing callback */
  onPreprocess?: (gltf: any) => void;
  /** Post-processing callback */
  onPostprocess?: (model: THREE.Object3D) => void;
}

/**
 * Texture optimization options
 */
export interface TextureOptimization {
  /** Enable texture compression */
  compression: boolean;
  /** Compression format */
  format: 'DXT' | 'ETC1' | 'ETC2' | 'ASTC' | 'PVRTC';
  /** Quality level (1-10) */
  quality: number;
  /** Generate mipmaps */
  generateMipmaps: boolean;
  /** Texture filtering */
  filtering: THREE.TextureFilter;
  /** Anisotropy level */
  anisotropy: number;
}

/**
 * Geometry optimization options
 */
export interface GeometryOptimization {
  /** Enable geometry compression */
  compression: boolean;
  /** Merge duplicate vertices */
  mergeVertices: boolean;
  /** Remove unused vertices */
  removeUnused: boolean;
  /** Quantize positions */
  quantizePositions: boolean;
  /** Quantize normals */
  quantizeNormals: boolean;
  /** Quantize UV coordinates */
  quantizeUVs: boolean;
  /** Quantize colors */
  quantizeColors: boolean;
}

/**
 * Model preprocessing pipeline
 */
export interface ModelPreprocessing {
  /** Texture optimizations */
  textures: TextureOptimization;
  /** Geometry optimizations */
  geometry: GeometryOptimization;
  /** Animation optimizations */
  animations: {
    /** Compress keyframes */
    compressKeyframes: boolean;
    /** Remove redundant keyframes */
    removeRedundant: boolean;
    /** Quantize rotation quaternions */
    quantizeRotations: boolean;
    /** Resample animations */
    resample: boolean;
    /** Target frame rate for resampling */
    targetFrameRate: number;
  };
  /** Material optimizations */
  materials: {
    /** Merge similar materials */
    mergeSimilar: boolean;
    /** Remove unused materials */
    removeUnused: boolean;
    /** Optimize shader parameters */
    optimizeShaders: boolean;
  };
}

/**
 * Loading progress information
 */
export interface LoadingProgress {
  /** Current loading stage */
  stage: 'downloading' | 'parsing' | 'processing' | 'optimizing' | 'caching' | 'complete';
  /** Progress percentage (0-1) */
  progress: number;
  /** Bytes loaded */
  loaded: number;
  /** Total bytes */
  total: number;
  /** Current operation description */
  operation: string;
  /** Estimated time remaining (ms) */
  estimatedTimeRemaining?: number;
}

/**
 * Model metadata interface
 */
export interface ModelMetadata {
  /** Model name */
  name: string;
  /** Model format */
  format: 'GLTF' | 'GLB' | 'FBX' | 'OBJ';
  /** Model version */
  version: string;
  /** Author information */
  author?: string;
  /** Copyright information */
  copyright?: string;
  /** Model description */
  description?: string;
  /** Model statistics */
  statistics: {
    /** Vertex count */
    vertices: number;
    /** Triangle count */
    triangles: number;
    /** Texture count */
    textures: number;
    /** Material count */
    materials: number;
    /** Animation count */
    animations: number;
    /** Bone count */
    bones: number;
    /** Morph target count */
    morphTargets: number;
  };
  /** Bounding box */
  boundingBox: THREE.Box3;
  /** File size in bytes */
  fileSize: number;
  /** Memory usage estimation */
  memoryUsage: {
    /** Geometry memory */
    geometry: number;
    /** Texture memory */
    textures: number;
    /** Total memory */
    total: number;
  };
}

/**
 * Avatar model interface
 */
export interface AvatarModel {
  /** Model root object */
  root: THREE.Object3D;
  /** Original GLTF data */
  gltf: any;
  /** Model metadata */
  metadata: ModelMetadata;
  /** Animation clips */
  animations: THREE.AnimationClip[];
  /** Animation mixer */
  mixer?: THREE.AnimationMixer;
  /** Skeletal structure */
  skeleton?: THREE.Skeleton;
  /** Morph target meshes */
  morphTargetMeshes: THREE.Mesh[];
  /** LOD group */
  lodGroup?: THREE.LOD;
  /** Material map */
  materials: Map<string, THREE.Material>;
  /** Texture map */
  textures: Map<string, THREE.Texture>;
  /** Bone map */
  bones: Map<string, THREE.Bone>;
  /** Morph target map */
  morphTargets: Map<string, number>;
}

/**
 * Fallback model configuration
 */
export interface FallbackModel {
  /** Enable fallback */
  enabled: boolean;
  /** Fallback model type */
  type: 'primitive' | 'lowpoly' | 'placeholder';
  /** Primitive options */
  primitive?: {
    /** Geometry type */
    geometry: 'box' | 'sphere' | 'cylinder' | 'plane';
    /** Geometry dimensions */
    dimensions: number[];
    /** Material color */
    color: THREE.Color;
    /** Enable wireframe */
    wireframe: boolean;
  };
  /** Low-poly model options */
  lowpoly?: {
    /** Model URL */
    url: string;
    /** Texture URL */
    textureUrl?: string;
  };
  /** Placeholder options */
  placeholder?: {
    /** Placeholder type */
    type: 'silhouette' | 'mannequin' | 'cartoon';
    /** Color scheme */
    colorScheme: 'neutral' | 'colorful' | 'monochrome';
  };
}

/**
 * Model validation interface
 */
export interface ModelValidation {
  /** Is model valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Required features */
  requiredFeatures: {
    /** Requires skeletal animation */
    skeletalAnimation: boolean;
    /** Requires morph targets */
    morphTargets: boolean;
    /** Requires specific bones */
    requiredBones: string[];
    /** Requires specific morph targets */
    requiredMorphTargets: string[];
  };
  /** Performance warnings */
  performanceWarnings: {
    /** High polygon count */
    highPolygonCount: boolean;
    /** Large textures */
    largeTextures: boolean;
    /** Many materials */
    manyMaterials: boolean;
    /** Complex shaders */
    complexShaders: boolean;
  };
}

/**
 * Streaming model interface
 */
export interface StreamingModel {
  /** Base model URL */
  baseUrl: string;
  /** Model chunks */
  chunks: Array<{
    /** Chunk URL */
    url: string;
    /** LOD level */
    lodLevel: number;
    /** Body parts included */
    bodyParts: string[];
    /** Priority */
    priority: number;
    /** Size in bytes */
    size: number;
  }>;
  /** Streaming strategy */
  strategy: 'progressive' | 'adaptive' | 'priority';
  /** Bandwidth threshold for quality */
  bandwidthThresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * Model loading error interface
 */
export interface ModelLoadingError {
  /** Error type */
  type: 'network' | 'parsing' | 'validation' | 'memory' | 'gpu' | 'unknown';
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** HTTP status (for network errors) */
  httpStatus?: number;
  /** Stack trace */
  stack?: string;
  /** Recovery suggestions */
  recoverySuggestions: string[];
  /** Can retry */
  retryable: boolean;
}