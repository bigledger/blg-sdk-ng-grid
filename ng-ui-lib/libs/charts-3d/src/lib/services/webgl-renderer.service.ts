import { Injectable, signal, effect, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { Chart3DConfig, Chart3DEvent, LODConfig, FrustumCullingConfig } from '../types/chart-3d.types';

/**
 * Core WebGL renderer service for 3D charts
 * Handles Three.js scene, camera, renderer, and performance optimizations
 */
@Injectable({
  providedIn: 'root'
})
export class WebGLRendererService implements OnDestroy {
  // Core Three.js objects
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  public controls?: any; // OrbitControls will be imported dynamically

  // Performance optimization systems
  private lodSystem?: LODSystem;
  private frustumCuller?: FrustumCuller;
  private instanceManager?: InstancedRenderingManager;
  private textureAtlas?: TextureAtlas;

  // Animation system
  private animationMixer?: THREE.AnimationMixer;
  private clock = new THREE.Clock();
  private animationId?: number;

  // State management with signals
  private _isInitialized = signal(false);
  private _isRendering = signal(false);
  private _performanceStats = signal({
    fps: 0,
    drawCalls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  });

  // Getters for reactive state
  public readonly isInitialized = this._isInitialized.asReadonly();
  public readonly isRendering = this._isRendering.asReadonly();
  public readonly performanceStats = this._performanceStats.asReadonly();

  constructor() {
    // Monitor performance stats
    effect(() => {
      if (this._isRendering()) {
        this.updatePerformanceStats();
      }
    });
  }

  /**
   * Initialize the WebGL renderer with configuration
   */
  async initialize(container: HTMLElement, config: Chart3DConfig): Promise<void> {
    try {
      // Create scene
      this.scene = new THREE.Scene();
      if (config.background) {
        this.scene.background = new THREE.Color(config.background);
      }

      // Create camera
      const aspect = (config.width || container.clientWidth) / (config.height || container.clientHeight);
      this.camera = new THREE.PerspectiveCamera(
        config.camera?.fov || 75,
        aspect,
        config.camera?.near || 0.1,
        config.camera?.far || 1000
      );

      // Set camera position
      const position = config.camera?.position || [10, 10, 10];
      this.camera.position.set(...position);
      
      const lookAt = config.camera?.lookAt || [0, 0, 0];
      this.camera.lookAt(...lookAt);

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: config.renderer?.antialias !== false,
        alpha: config.renderer?.alpha !== false,
        preserveDrawingBuffer: true
      });

      this.renderer.setSize(
        config.width || container.clientWidth,
        config.height || container.clientHeight
      );
      
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Configure shadow mapping
      if (config.renderer?.shadowMap?.enabled) {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = config.renderer.shadowMap.type || THREE.PCFSoftShadowMap;
      }

      // Configure tone mapping
      if (config.renderer?.toneMapping) {
        this.renderer.toneMapping = config.renderer.toneMapping;
        this.renderer.toneMappingExposure = config.renderer.toneMappingExposure || 1;
      }

      // Add renderer to container
      container.appendChild(this.renderer.domElement);

      // Initialize controls
      await this.initializeControls(config);

      // Setup lighting
      this.setupLighting(config);

      // Initialize performance optimization systems
      await this.initializeOptimizations(config);

      // Start render loop
      this.startRenderLoop();

      this._isInitialized.set(true);
    } catch (error) {
      console.error('Failed to initialize WebGL renderer:', error);
      throw error;
    }
  }

  /**
   * Initialize camera controls
   */
  private async initializeControls(config: Chart3DConfig): Promise<void> {
    if (!config.controls?.enabled) return;

    try {
      // Dynamically import OrbitControls
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      
      // Configure controls
      const controlsConfig = config.controls;
      if (controlsConfig) {
        this.controls.enableZoom = controlsConfig.enableZoom !== false;
        this.controls.enablePan = controlsConfig.enablePan !== false;
        this.controls.enableRotate = controlsConfig.enableRotate !== false;
        this.controls.autoRotate = controlsConfig.autoRotate || false;
        this.controls.autoRotateSpeed = controlsConfig.autoRotateSpeed || 2.0;
        this.controls.dampingFactor = controlsConfig.dampingFactor || 0.25;
        this.controls.enableDamping = true;
        
        if (controlsConfig.minDistance !== undefined) {
          this.controls.minDistance = controlsConfig.minDistance;
        }
        if (controlsConfig.maxDistance !== undefined) {
          this.controls.maxDistance = controlsConfig.maxDistance;
        }
        if (controlsConfig.minPolarAngle !== undefined) {
          this.controls.minPolarAngle = controlsConfig.minPolarAngle;
        }
        if (controlsConfig.maxPolarAngle !== undefined) {
          this.controls.maxPolarAngle = controlsConfig.maxPolarAngle;
        }
      }
    } catch (error) {
      console.warn('Failed to load OrbitControls:', error);
    }
  }

  /**
   * Setup scene lighting based on configuration
   */
  private setupLighting(config: Chart3DConfig): void {
    const lighting = config.lighting;
    
    if (!lighting) {
      // Default lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      this.scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(50, 50, 50);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      this.scene.add(directionalLight);
      return;
    }

    // Ambient light
    if (lighting.ambient) {
      const ambientLight = new THREE.AmbientLight(
        lighting.ambient.color,
        lighting.ambient.intensity
      );
      this.scene.add(ambientLight);
    }

    // Directional lights
    if (lighting.directional) {
      lighting.directional.forEach(light => {
        const directionalLight = new THREE.DirectionalLight(
          light.color,
          light.intensity
        );
        directionalLight.position.set(...light.position);
        
        if (light.castShadow) {
          directionalLight.castShadow = true;
          directionalLight.shadow.mapSize.width = 2048;
          directionalLight.shadow.mapSize.height = 2048;
        }
        
        this.scene.add(directionalLight);
      });
    }

    // Point lights
    if (lighting.point) {
      lighting.point.forEach(light => {
        const pointLight = new THREE.PointLight(
          light.color,
          light.intensity,
          light.distance,
          light.decay
        );
        pointLight.position.set(...light.position);
        this.scene.add(pointLight);
      });
    }
  }

  /**
   * Initialize performance optimization systems
   */
  private async initializeOptimizations(config: Chart3DConfig): Promise<void> {
    const performance = config.performance;
    if (!performance) return;

    // Level of Detail system
    if (performance.levelOfDetail) {
      this.lodSystem = new LODSystem();
    }

    // Frustum culling
    if (performance.frustumCulling) {
      this.frustumCuller = new FrustumCuller(this.camera);
    }

    // Instanced rendering
    if (performance.instancedRendering) {
      this.instanceManager = new InstancedRenderingManager();
    }

    // Texture atlas
    if (performance.textureAtlas) {
      this.textureAtlas = new TextureAtlas();
    }
  }

  /**
   * Start the render loop
   */
  private startRenderLoop(): void {
    this._isRendering.set(true);
    
    const render = () => {
      this.animationId = requestAnimationFrame(render);
      
      const deltaTime = this.clock.getDelta();
      
      // Update controls
      if (this.controls) {
        this.controls.update();
      }
      
      // Update animation mixer
      if (this.animationMixer) {
        this.animationMixer.update(deltaTime);
      }
      
      // Apply performance optimizations
      this.applyOptimizations();
      
      // Render scene
      this.renderer.render(this.scene, this.camera);
    };
    
    render();
  }

  /**
   * Apply performance optimizations during rendering
   */
  private applyOptimizations(): void {
    // Apply frustum culling
    if (this.frustumCuller) {
      this.frustumCuller.cull(this.scene);
    }
    
    // Update LOD system
    if (this.lodSystem) {
      this.lodSystem.update(this.camera);
    }
  }

  /**
   * Update performance statistics
   */
  private updatePerformanceStats(): void {
    const info = this.renderer.info;
    
    this._performanceStats.update(stats => ({
      ...stats,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines
    }));
  }

  /**
   * Add object to scene with optimization
   */
  addObject(object: THREE.Object3D): void {
    this.scene.add(object);
    
    // Add to optimization systems
    if (this.lodSystem) {
      this.lodSystem.addObject(object);
    }
  }

  /**
   * Remove object from scene
   */
  removeObject(object: THREE.Object3D): void {
    this.scene.remove(object);
    
    // Remove from optimization systems
    if (this.lodSystem) {
      this.lodSystem.removeObject(object);
    }
  }

  /**
   * Resize renderer
   */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Cleanup resources
   */
  ngOnDestroy(): void {
    this._isRendering.set(false);
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Cleanup optimization systems
    if (this.lodSystem) {
      this.lodSystem.dispose();
    }
    
    if (this.instanceManager) {
      this.instanceManager.dispose();
    }
    
    if (this.textureAtlas) {
      this.textureAtlas.dispose();
    }
  }

  /**
   * Create animation mixer for object
   */
  createAnimationMixer(object: THREE.Object3D): THREE.AnimationMixer {
    if (!this.animationMixer) {
      this.animationMixer = new THREE.AnimationMixer(object);
    }
    return this.animationMixer;
  }

  /**
   * Screenshot functionality
   */
  takeScreenshot(): string {
    return this.renderer.domElement.toDataURL();
  }
}

/**
 * Level of Detail system for performance optimization
 */
class LODSystem {
  private lodObjects: THREE.LOD[] = [];

  addObject(object: THREE.Object3D): void {
    if (object instanceof THREE.LOD) {
      this.lodObjects.push(object);
    }
  }

  removeObject(object: THREE.Object3D): void {
    if (object instanceof THREE.LOD) {
      const index = this.lodObjects.indexOf(object);
      if (index > -1) {
        this.lodObjects.splice(index, 1);
      }
    }
  }

  update(camera: THREE.Camera): void {
    this.lodObjects.forEach(lod => {
      lod.update(camera);
    });
  }

  dispose(): void {
    this.lodObjects.length = 0;
  }
}

/**
 * Frustum culling system
 */
class FrustumCuller {
  private frustum = new THREE.Frustum();
  private matrix = new THREE.Matrix4();

  constructor(private camera: THREE.Camera) {}

  cull(scene: THREE.Scene): void {
    this.matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.matrix);

    scene.traverse((object) => {
      if (object.userData.noCull) return;
      
      const geometry = (object as any).geometry;
      if (geometry && geometry.boundingSphere) {
        object.visible = this.frustum.intersectsSphere(geometry.boundingSphere);
      }
    });
  }
}

/**
 * Instanced rendering manager
 */
class InstancedRenderingManager {
  private instancedMeshes: THREE.InstancedMesh[] = [];

  createInstancedMesh(
    geometry: THREE.BufferGeometry, 
    material: THREE.Material, 
    count: number
  ): THREE.InstancedMesh {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    this.instancedMeshes.push(instancedMesh);
    return instancedMesh;
  }

  dispose(): void {
    this.instancedMeshes.forEach(mesh => {
      mesh.dispose();
    });
    this.instancedMeshes.length = 0;
  }
}

/**
 * Texture atlas for optimization
 */
class TextureAtlas {
  private atlas?: THREE.Texture;
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;

  createAtlas(textures: THREE.Texture[], size = 1024): THREE.Texture {
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.context = this.canvas.getContext('2d')!;

    // Simple atlas packing logic (can be enhanced)
    const gridSize = Math.ceil(Math.sqrt(textures.length));
    const cellSize = size / gridSize;

    textures.forEach((texture, index) => {
      const x = (index % gridSize) * cellSize;
      const y = Math.floor(index / gridSize) * cellSize;
      
      if (texture.image) {
        this.context!.drawImage(texture.image, x, y, cellSize, cellSize);
      }
    });

    this.atlas = new THREE.CanvasTexture(this.canvas);
    return this.atlas;
  }

  dispose(): void {
    if (this.atlas) {
      this.atlas.dispose();
    }
  }
}
