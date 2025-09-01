import { Injectable, signal, computed } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { 
  ModelCacheEntry, 
  ModelLoadingOptions, 
  LoadingProgress, 
  AvatarModel,
  ModelMetadata,
  LODLevel,
  FallbackModel,
  ModelValidation,
  ModelLoadingError
} from '../interfaces/model-loading.interface';

/**
 * Advanced model loading service with caching, LOD, and optimization
 */
@Injectable({
  providedIn: 'root'
})
export class ModelLoaderService {
  // Cache storage
  private _cache = new Map<string, ModelCacheEntry>();
  private _loadingProgress = signal<Map<string, LoadingProgress>>(new Map());
  private _maxCacheSize = 100 * 1024 * 1024; // 100MB
  private _currentCacheSize = 0;

  // Loaders
  private _gltfLoader: GLTFLoader;
  private _dracoLoader: DRACOLoader;
  private _ktx2Loader: KTX2Loader;

  // Loading state
  readonly loadingProgress = this._loadingProgress.asReadonly();
  
  readonly isLoading = computed(() => {
    return this._loadingProgress().size > 0;
  });

  readonly cacheStats = computed(() => ({
    size: this._currentCacheSize,
    maxSize: this._maxCacheSize,
    entryCount: this._cache.size,
    hitRate: this.calculateHitRate()
  }));

  // Statistics
  private _totalRequests = 0;
  private _cacheHits = 0;

  constructor() {
    this.initializeLoaders();
  }

  /**
   * Initialize Three.js loaders with optimizations
   */
  private initializeLoaders(): void {
    // GLTF Loader
    this._gltfLoader = new GLTFLoader();

    // DRACO Loader for geometry compression
    this._dracoLoader = new DRACOLoader();
    this._dracoLoader.setDecoderPath('/assets/draco/');
    this._gltfLoader.setDRACOLoader(this._dracoLoader);

    // KTX2 Loader for texture compression
    this._ktx2Loader = new KTX2Loader();
    this._ktx2Loader.setTranscoderPath('/assets/basis/');
    this._gltfLoader.setKTX2Loader(this._ktx2Loader);

    // Meshopt Decoder for additional compression
    this._gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  }

  /**
   * Load a 3D model with advanced options
   */
  async loadModel(options: ModelLoadingOptions): Promise<AvatarModel> {
    try {
      this._totalRequests++;
      
      // Check cache first
      if (options.cache !== false) {
        const cached = this.getCachedModel(options.url);
        if (cached) {
          this._cacheHits++;
          return this.createAvatarModelFromCache(cached);
        }
      }

      // Initialize loading progress
      this.updateLoadingProgress(options.url, {
        stage: 'downloading',
        progress: 0,
        loaded: 0,
        total: 0,
        operation: 'Downloading model...'
      });

      // Load the model
      const gltf = await this.loadGLTF(options);
      
      // Process the loaded model
      const avatarModel = await this.processModel(gltf, options);
      
      // Cache the model if caching is enabled
      if (options.cache !== false) {
        this.cacheModel(options.url, avatarModel, gltf);
      }

      // Clear loading progress
      this.clearLoadingProgress(options.url);

      return avatarModel;

    } catch (error) {
      this.clearLoadingProgress(options.url);
      throw this.createLoadingError(error, options.url);
    }
  }

  /**
   * Load GLTF model with progress tracking
   */
  private async loadGLTF(options: ModelLoadingOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      this._gltfLoader.load(
        options.url,
        (gltf) => {
          this.updateLoadingProgress(options.url, {
            stage: 'parsing',
            progress: 1,
            loaded: 0,
            total: 0,
            operation: 'Parsing model data...'
          });
          
          // Call preprocessing callback
          if (options.onPreprocess) {
            options.onPreprocess(gltf);
          }
          
          resolve(gltf);
        },
        (progress) => {
          const progressData: LoadingProgress = {
            stage: 'downloading',
            progress: progress.total > 0 ? progress.loaded / progress.total : 0,
            loaded: progress.loaded,
            total: progress.total,
            operation: 'Downloading model...'
          };
          
          this.updateLoadingProgress(options.url, progressData);
          
          if (options.onProgress) {
            options.onProgress(progress.loaded, progress.total);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Process loaded model data into AvatarModel
   */
  private async processModel(gltf: any, options: ModelLoadingOptions): Promise<AvatarModel> {
    this.updateLoadingProgress(options.url, {
      stage: 'processing',
      progress: 0.2,
      loaded: 0,
      total: 0,
      operation: 'Processing model...'
    });

    const root = gltf.scene.clone();
    const animations = gltf.animations || [];
    
    // Extract metadata
    const metadata = this.extractMetadata(gltf);
    
    // Validate model
    const validation = this.validateModel(gltf);
    if (!validation.valid) {
      throw new Error(`Model validation failed: ${validation.errors.join(', ')}`);
    }

    this.updateLoadingProgress(options.url, {
      stage: 'processing',
      progress: 0.4,
      loaded: 0,
      total: 0,
      operation: 'Extracting skeletal data...'
    });

    // Extract skeletal data
    let skeleton: THREE.Skeleton | undefined;
    const bones = new Map<string, THREE.Bone>();
    
    root.traverse((object) => {
      if (object instanceof THREE.SkinnedMesh && object.skeleton) {
        skeleton = object.skeleton;
        object.skeleton.bones.forEach(bone => {
          bones.set(bone.name, bone);
        });
      }
    });

    this.updateLoadingProgress(options.url, {
      stage: 'processing',
      progress: 0.6,
      loaded: 0,
      total: 0,
      operation: 'Processing morph targets...'
    });

    // Extract morph targets
    const morphTargetMeshes: THREE.Mesh[] = [];
    const morphTargets = new Map<string, number>();
    
    root.traverse((object) => {
      if (object instanceof THREE.Mesh && object.morphTargetDictionary) {
        morphTargetMeshes.push(object);
        Object.entries(object.morphTargetDictionary).forEach(([name, index]) => {
          morphTargets.set(name, index);
        });
      }
    });

    this.updateLoadingProgress(options.url, {
      stage: 'processing',
      progress: 0.8,
      loaded: 0,
      total: 0,
      operation: 'Extracting materials and textures...'
    });

    // Extract materials and textures
    const materials = new Map<string, THREE.Material>();
    const textures = new Map<string, THREE.Texture>();
    
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const material = object.material;
        if (Array.isArray(material)) {
          material.forEach((mat, index) => {
            materials.set(`${object.name}_${index}`, mat);
            this.extractTexturesFromMaterial(mat, textures);
          });
        } else {
          materials.set(object.name, material);
          this.extractTexturesFromMaterial(material, textures);
        }
      }
    });

    // Generate LOD if requested
    let lodGroup: THREE.LOD | undefined;
    if (options.enableLOD && options.lodDistances) {
      lodGroup = await this.generateLOD(root, options.lodDistances);
    }

    // Create animation mixer
    let mixer: THREE.AnimationMixer | undefined;
    if (animations.length > 0) {
      mixer = new THREE.AnimationMixer(root);
    }

    this.updateLoadingProgress(options.url, {
      stage: 'complete',
      progress: 1,
      loaded: 0,
      total: 0,
      operation: 'Model loaded successfully'
    });

    const avatarModel: AvatarModel = {
      root,
      gltf,
      metadata,
      animations,
      mixer,
      skeleton,
      morphTargetMeshes,
      lodGroup,
      materials,
      textures,
      bones,
      morphTargets
    };

    // Call post-processing callback
    if (options.onPostprocess) {
      options.onPostprocess(root);
    }

    return avatarModel;
  }

  /**
   * Extract metadata from GLTF
   */
  private extractMetadata(gltf: any): ModelMetadata {
    const asset = gltf.asset || {};
    
    // Calculate statistics
    let vertices = 0;
    let triangles = 0;
    const textureSet = new Set<THREE.Texture>();
    const materialSet = new Set<THREE.Material>();
    let bones = 0;
    let morphTargets = 0;

    gltf.scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          const geometry = object.geometry;
          vertices += geometry.attributes.position?.count || 0;
          triangles += (geometry.index?.count || geometry.attributes.position?.count || 0) / 3;
          
          if (object.morphTargetDictionary) {
            morphTargets += Object.keys(object.morphTargetDictionary).length;
          }
        }
        
        const material = object.material;
        if (Array.isArray(material)) {
          material.forEach(mat => {
            materialSet.add(mat);
            this.collectTexturesFromMaterial(mat, textureSet);
          });
        } else {
          materialSet.add(material);
          this.collectTexturesFromMaterial(material, textureSet);
        }
      }
      
      if (object instanceof THREE.Bone) {
        bones++;
      }
    });

    // Calculate bounding box
    const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
    
    // Estimate memory usage
    const geometryMemory = vertices * 32; // Rough estimate: 32 bytes per vertex
    let textureMemory = 0;
    textureSet.forEach(texture => {
      if (texture.image) {
        textureMemory += texture.image.width * texture.image.height * 4; // RGBA
      }
    });

    return {
      name: asset.generator || 'Unknown',
      format: 'GLTF',
      version: asset.version || '2.0',
      author: asset.copyright || undefined,
      copyright: asset.copyright || undefined,
      description: asset.extras?.description || undefined,
      statistics: {
        vertices: Math.round(vertices),
        triangles: Math.round(triangles),
        textures: textureSet.size,
        materials: materialSet.size,
        animations: gltf.animations?.length || 0,
        bones,
        morphTargets
      },
      boundingBox,
      fileSize: 0, // Would need to be passed from the loading process
      memoryUsage: {
        geometry: geometryMemory,
        textures: textureMemory,
        total: geometryMemory + textureMemory
      }
    };
  }

  /**
   * Extract textures from material
   */
  private extractTexturesFromMaterial(material: THREE.Material, textureMap: Map<string, THREE.Texture>): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      if (material.map) textureMap.set(`${material.name}_diffuse`, material.map);
      if (material.normalMap) textureMap.set(`${material.name}_normal`, material.normalMap);
      if (material.roughnessMap) textureMap.set(`${material.name}_roughness`, material.roughnessMap);
      if (material.metalnessMap) textureMap.set(`${material.name}_metalness`, material.metalnessMap);
      if (material.emissiveMap) textureMap.set(`${material.name}_emissive`, material.emissiveMap);
      if (material.aoMap) textureMap.set(`${material.name}_ao`, material.aoMap);
    }
  }

  /**
   * Collect textures from material (for statistics)
   */
  private collectTexturesFromMaterial(material: THREE.Material, textureSet: Set<THREE.Texture>): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      if (material.map) textureSet.add(material.map);
      if (material.normalMap) textureSet.add(material.normalMap);
      if (material.roughnessMap) textureSet.add(material.roughnessMap);
      if (material.metalnessMap) textureSet.add(material.metalnessMap);
      if (material.emissiveMap) textureSet.add(material.emissiveMap);
      if (material.aoMap) textureSet.add(material.aoMap);
    }
  }

  /**
   * Generate LOD levels for model
   */
  private async generateLOD(model: THREE.Object3D, distances: number[]): Promise<THREE.LOD> {
    const lod = new THREE.LOD();
    
    // Add original model as highest quality
    lod.addLevel(model.clone(), 0);
    
    // Generate simplified versions for each distance
    for (let i = 0; i < distances.length; i++) {
      const distance = distances[i];
      const reductionPercentage = Math.min(0.8, (i + 1) * 0.2); // Progressively reduce quality
      const simplifiedModel = await this.simplifyModel(model, reductionPercentage);
      lod.addLevel(simplifiedModel, distance);
    }
    
    return lod;
  }

  /**
   * Simplify model geometry (basic implementation)
   */
  private async simplifyModel(model: THREE.Object3D, reductionPercentage: number): Promise<THREE.Object3D> {
    const simplified = model.clone();
    
    simplified.traverse((object) => {
      if (object instanceof THREE.Mesh && object.geometry) {
        // Basic simplification - in a real implementation, you'd use a proper decimation algorithm
        const geometry = object.geometry;
        if (geometry.index) {
          const originalCount = geometry.index.count;
          const targetCount = Math.floor(originalCount * (1 - reductionPercentage));
          // Simplified approach: just reduce index buffer size
          geometry.setIndex(geometry.index.clone().set(geometry.index.array.subarray(0, targetCount)));
        }
      }
    });
    
    return simplified;
  }

  /**
   * Validate model structure
   */
  private validateModel(gltf: any): ModelValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (!gltf.scene) {
      errors.push('No scene found in GLTF');
    }
    
    let hasSkeletalAnimation = false;
    let hasMorphTargets = false;
    const foundBones: string[] = [];
    const foundMorphTargets: string[] = [];
    
    if (gltf.scene) {
      gltf.scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.SkinnedMesh) {
          hasSkeletalAnimation = true;
          if (object.skeleton) {
            object.skeleton.bones.forEach(bone => {
              foundBones.push(bone.name);
            });
          }
        }
        
        if (object instanceof THREE.Mesh && object.morphTargetDictionary) {
          hasMorphTargets = true;
          foundMorphTargets.push(...Object.keys(object.morphTargetDictionary));
        }
      });
    }
    
    // Performance warnings
    const performanceWarnings = {
      highPolygonCount: false,
      largeTextures: false,
      manyMaterials: false,
      complexShaders: false
    };
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      requiredFeatures: {
        skeletalAnimation: hasSkeletalAnimation,
        morphTargets: hasMorphTargets,
        requiredBones: foundBones,
        requiredMorphTargets: foundMorphTargets
      },
      performanceWarnings
    };
  }

  /**
   * Cache a loaded model
   */
  private cacheModel(url: string, model: AvatarModel, gltf: any): void {
    const size = this.estimateModelSize(model);
    
    // Check if we need to make room in cache
    while (this._currentCacheSize + size > this._maxCacheSize && this._cache.size > 0) {
      this.evictLeastRecentlyUsed();
    }
    
    const cacheEntry: ModelCacheEntry = {
      key: url,
      model: model.root.clone(),
      gltf: gltf,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      size,
      lodLevels: model.lodGroup ? this.extractLODLevels(model.lodGroup) : undefined
    };
    
    this._cache.set(url, cacheEntry);
    this._currentCacheSize += size;
  }

  /**
   * Get cached model
   */
  private getCachedModel(url: string): ModelCacheEntry | null {
    const entry = this._cache.get(url);
    if (entry) {
      entry.accessCount++;
      entry.lastAccess = Date.now();
      return entry;
    }
    return null;
  }

  /**
   * Create AvatarModel from cached entry
   */
  private createAvatarModelFromCache(cacheEntry: ModelCacheEntry): AvatarModel {
    // This is a simplified version - in reality, you'd need to recreate all the complex structures
    const root = cacheEntry.model.clone();
    
    return {
      root,
      gltf: cacheEntry.gltf,
      metadata: {} as ModelMetadata, // Would need to be cached too
      animations: [],
      materials: new Map(),
      textures: new Map(),
      bones: new Map(),
      morphTargets: new Map(),
      morphTargetMeshes: []
    };
  }

  /**
   * Estimate model memory size
   */
  private estimateModelSize(model: AvatarModel): number {
    return model.metadata.memoryUsage.total;
  }

  /**
   * Extract LOD levels from LOD group
   */
  private extractLODLevels(lodGroup: THREE.LOD): LODLevel[] {
    const levels: LODLevel[] = [];
    
    for (let i = 0; i < lodGroup.levels.length; i++) {
      const level = lodGroup.levels[i];
      levels.push({
        distance: level.distance,
        object: level.object,
        reductionPercentage: i * 0.2, // Estimated
        textureScale: 1 - (i * 0.2) // Estimated
      });
    }
    
    return levels;
  }

  /**
   * Evict least recently used cache entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestEntry: ModelCacheEntry | null = null;
    let oldestKey = '';
    
    for (const [key, entry] of this._cache.entries()) {
      if (!oldestEntry || entry.lastAccess < oldestEntry.lastAccess) {
        oldestEntry = entry;
        oldestKey = key;
      }
    }
    
    if (oldestEntry) {
      this._cache.delete(oldestKey);
      this._currentCacheSize -= oldestEntry.size;
      
      // Dispose of Three.js resources
      this.disposeModel(oldestEntry.model);
    }
  }

  /**
   * Dispose of model resources
   */
  private disposeModel(model: THREE.Object3D): void {
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
  }

  /**
   * Calculate cache hit rate
   */
  private calculateHitRate(): number {
    if (this._totalRequests === 0) return 0;
    return (this._cacheHits / this._totalRequests) * 100;
  }

  /**
   * Update loading progress
   */
  private updateLoadingProgress(url: string, progress: LoadingProgress): void {
    const currentProgress = this._loadingProgress();
    const newProgress = new Map(currentProgress);
    newProgress.set(url, progress);
    this._loadingProgress.set(newProgress);
  }

  /**
   * Clear loading progress
   */
  private clearLoadingProgress(url: string): void {
    const currentProgress = this._loadingProgress();
    const newProgress = new Map(currentProgress);
    newProgress.delete(url);
    this._loadingProgress.set(newProgress);
  }

  /**
   * Create structured loading error
   */
  private createLoadingError(error: any, url: string): ModelLoadingError {
    let type: ModelLoadingError['type'] = 'unknown';
    let httpStatus: number | undefined;
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      type = 'network';
    } else if (error.message?.includes('parse') || error.message?.includes('JSON')) {
      type = 'parsing';
    } else if (error.message?.includes('validation')) {
      type = 'validation';
    } else if (error.message?.includes('memory') || error.message?.includes('allocation')) {
      type = 'memory';
    } else if (error.message?.includes('WebGL') || error.message?.includes('GPU')) {
      type = 'gpu';
    }
    
    if (error.status) {
      httpStatus = error.status;
    }
    
    return {
      type,
      message: error.message || 'Unknown error occurred while loading model',
      code: error.code || 'UNKNOWN_ERROR',
      httpStatus,
      stack: error.stack,
      recoverySuggestions: this.getRecoverySuggestions(type),
      retryable: type === 'network' || type === 'memory'
    };
  }

  /**
   * Get recovery suggestions for error types
   */
  private getRecoverySuggestions(errorType: ModelLoadingError['type']): string[] {
    switch (errorType) {
      case 'network':
        return [
          'Check your internet connection',
          'Verify the model URL is correct',
          'Try loading the model again',
          'Check if the server is responding'
        ];
      case 'parsing':
        return [
          'Verify the model file is not corrupted',
          'Check if the model format is supported',
          'Try re-exporting the model from your 3D software'
        ];
      case 'validation':
        return [
          'Check if the model has required bones and morph targets',
          'Verify the model structure is correct for avatars',
          'Review model requirements in the documentation'
        ];
      case 'memory':
        return [
          'Try using a model with lower polygon count',
          'Reduce texture sizes in the model',
          'Clear the model cache',
          'Close other browser tabs to free memory'
        ];
      case 'gpu':
        return [
          'Check if your graphics drivers are up to date',
          'Try reducing model complexity',
          'Check WebGL support in your browser'
        ];
      default:
        return [
          'Try refreshing the page',
          'Check the browser console for more details',
          'Contact support if the problem persists'
        ];
    }
  }

  /**
   * Clear all cached models
   */
  clearCache(): void {
    this._cache.forEach(entry => {
      this.disposeModel(entry.model);
    });
    this._cache.clear();
    this._currentCacheSize = 0;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cacheStats();
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.clearCache();
    this._dracoLoader.dispose();
    // Note: KTX2Loader and MeshoptDecoder don't have dispose methods in current Three.js versions
  }
}