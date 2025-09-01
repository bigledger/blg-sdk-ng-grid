import { Injectable, signal, computed, effect } from '@angular/core';
import * as THREE from 'three';
import { AvatarConfig, AvatarCapabilities, AvatarState } from '../interfaces/avatar-config.interface';

/**
 * Three.js scene management service
 * Handles scene, camera, renderer setup and WebGL capabilities detection
 */
@Injectable({
  providedIn: 'root'
})
export class SceneService {
  // Core Three.js objects
  private _scene = signal<THREE.Scene | null>(null);
  private _camera = signal<THREE.Camera | null>(null);
  private _renderer = signal<THREE.WebGLRenderer | null>(null);
  private _clock = signal<THREE.Clock | null>(null);

  // Configuration and state
  private _config = signal<AvatarConfig | null>(null);
  private _capabilities = signal<AvatarCapabilities | null>(null);
  private _state = signal<AvatarState | null>(null);

  // Animation frame ID for cleanup
  private animationFrameId: number | null = null;
  
  // Performance monitoring
  private performanceStats = {
    frameCount: 0,
    lastTime: 0,
    fps: 0,
    frameTime: 0
  };

  // Public readonly signals
  readonly scene = this._scene.asReadonly();
  readonly camera = this._camera.asReadonly();
  readonly renderer = this._renderer.asReadonly();
  readonly config = this._config.asReadonly();
  readonly capabilities = this._capabilities.asReadonly();
  readonly state = this._state.asReadonly();

  // Computed properties
  readonly isWebGL2Supported = computed(() => {
    const caps = this._capabilities();
    return caps?.webglVersion === 2;
  });

  readonly isSceneReady = computed(() => {
    return !!(this._scene() && this._camera() && this._renderer());
  });

  constructor() {
    // Set up automatic cleanup on config changes
    effect(() => {
      const config = this._config();
      if (config) {
        this.setupScene(config);
      }
    });
  }

  /**
   * Initialize the 3D scene with configuration
   */
  async initialize(config: AvatarConfig): Promise<void> {
    try {
      // Detect WebGL capabilities first
      const capabilities = this.detectCapabilities();
      this._capabilities.set(capabilities);

      // Validate WebGL support
      if (!capabilities) {
        throw new Error('WebGL is not supported in this browser');
      }

      // Set configuration
      this._config.set(config);

      // Initialize state
      this._state.set({
        loading: false,
        progress: 0,
        modelLoaded: false,
        animationState: {
          playing: [],
          queue: [],
        },
        performance: {
          fps: 0,
          frameTime: 0,
          drawCalls: 0,
          triangles: 0,
          memory: {
            geometries: 0,
            textures: 0,
            total: 0
          }
        }
      });

    } catch (error) {
      console.error('Failed to initialize scene:', error);
      throw error;
    }
  }

  /**
   * Set up the Three.js scene, camera, and renderer
   */
  private setupScene(config: AvatarConfig): void {
    try {
      // Clean up existing scene
      this.dispose();

      // Create scene
      const scene = new THREE.Scene();
      
      // Set background
      if (config.scene.background) {
        scene.background = config.scene.background;
      }

      // Add fog if configured
      if (config.scene.fog?.enabled) {
        const { color, near, far } = config.scene.fog;
        scene.fog = new THREE.Fog(color, near, far);
      }

      // Set environment map
      if (config.scene.environmentMap) {
        scene.environment = config.scene.environmentMap;
      }

      this._scene.set(scene);

      // Create camera
      const camera = this.createCamera(config);
      this._camera.set(camera);

      // Create renderer
      const renderer = this.createRenderer(config);
      this._renderer.set(renderer);

      // Create clock for animation timing
      const clock = new THREE.Clock();
      this._clock.set(clock);

      // Set up lighting
      this.setupLighting(scene, config);

      // Start render loop
      this.startRenderLoop();

    } catch (error) {
      console.error('Failed to setup scene:', error);
      throw error;
    }
  }

  /**
   * Create camera based on configuration
   */
  private createCamera(config: AvatarConfig): THREE.Camera {
    const { container } = config;
    const aspect = container.clientWidth / container.clientHeight;

    let camera: THREE.Camera;

    if (config.camera.type === 'orthographic') {
      const size = 5;
      camera = new THREE.OrthographicCamera(
        -size * aspect,
        size * aspect,
        size,
        -size,
        config.camera.near || 0.1,
        config.camera.far || 1000
      );
    } else {
      camera = new THREE.PerspectiveCamera(
        config.camera.fov || 75,
        aspect,
        config.camera.near || 0.1,
        config.camera.far || 1000
      );
    }

    // Set camera position
    if (config.camera.position) {
      camera.position.copy(config.camera.position);
    } else {
      camera.position.set(0, 1.6, 3); // Default position for avatar viewing
    }

    // Set camera target
    if (config.camera.target) {
      camera.lookAt(config.camera.target);
    } else {
      camera.lookAt(0, 1, 0); // Look at head height
    }

    return camera;
  }

  /**
   * Create WebGL renderer with optimizations
   */
  private createRenderer(config: AvatarConfig): THREE.WebGLRenderer {
    const capabilities = this._capabilities();
    if (!capabilities) {
      throw new Error('WebGL capabilities not detected');
    }

    // Determine if we can use WebGL2
    const forceWebGL1 = config.rendering.renderer === 'webgl';
    const context = !forceWebGL1 && capabilities.webglVersion === 2 ? 'webgl2' : 'webgl';

    const renderer = new THREE.WebGLRenderer({
      antialias: config.rendering.antialias !== false,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
      logarithmicDepthBuffer: false,
      precision: 'highp',
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
      context: undefined // Let Three.js create the context
    });

    // Configure renderer
    renderer.setSize(config.container.clientWidth, config.container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.rendering.pixelRatio || 2));

    // Configure shadows
    if (config.rendering.shadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = config.rendering.shadowType || THREE.PCFSoftShadowMap;
    }

    // Configure tone mapping
    if (config.rendering.toneMapping) {
      renderer.toneMapping = config.rendering.toneMapping;
      renderer.toneMappingExposure = config.rendering.toneMappingExposure || 1.0;
    }

    // Enable extensions if available
    const gl = renderer.getContext();
    if (capabilities.extensions.textureFilterAnisotropic) {
      renderer.capabilities.getMaxAnisotropy();
    }

    // Set output color space
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Append to container
    config.container.appendChild(renderer.domElement);

    return renderer;
  }

  /**
   * Set up scene lighting based on configuration
   */
  private setupLighting(scene: THREE.Scene, config: AvatarConfig): void {
    const { lighting } = config;

    // Ambient light
    if (lighting.ambient?.enabled) {
      const ambientLight = new THREE.AmbientLight(
        lighting.ambient.color,
        lighting.ambient.intensity
      );
      scene.add(ambientLight);
    }

    // Directional light
    if (lighting.directional?.enabled) {
      const directionalLight = new THREE.DirectionalLight(
        lighting.directional.color,
        lighting.directional.intensity
      );
      
      directionalLight.position.copy(lighting.directional.position);
      
      if (lighting.directional.castShadow) {
        directionalLight.castShadow = true;
        const shadowMapSize = lighting.directional.shadowMapSize || 2048;
        directionalLight.shadow.mapSize.setScalar(shadowMapSize);
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.bias = -0.0001;
      }
      
      scene.add(directionalLight);
    }

    // Point lights
    if (lighting.pointLights) {
      lighting.pointLights.forEach(lightConfig => {
        const pointLight = new THREE.PointLight(
          lightConfig.color,
          lightConfig.intensity,
          lightConfig.distance,
          lightConfig.decay
        );
        
        pointLight.position.copy(lightConfig.position);
        
        if (lightConfig.castShadow) {
          pointLight.castShadow = true;
          pointLight.shadow.mapSize.setScalar(1024);
        }
        
        scene.add(pointLight);
      });
    }

    // Spot lights
    if (lighting.spotLights) {
      lighting.spotLights.forEach(lightConfig => {
        const spotLight = new THREE.SpotLight(
          lightConfig.color,
          lightConfig.intensity,
          undefined,
          lightConfig.angle,
          lightConfig.penumbra,
          lightConfig.decay
        );
        
        spotLight.position.copy(lightConfig.position);
        spotLight.target.position.copy(lightConfig.target);
        
        if (lightConfig.castShadow) {
          spotLight.castShadow = true;
          spotLight.shadow.mapSize.setScalar(1024);
        }
        
        scene.add(spotLight);
        scene.add(spotLight.target);
      });
    }
  }

  /**
   * Start the render loop
   */
  private startRenderLoop(): void {
    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);
      
      const renderer = this._renderer();
      const scene = this._scene();
      const camera = this._camera();
      const clock = this._clock();
      
      if (renderer && scene && camera && clock) {
        // Update performance stats
        this.updatePerformanceStats();
        
        // Render the scene
        renderer.render(scene, camera);
        
        // Update state
        this.updateState();
      }
    };
    
    render();
  }

  /**
   * Update performance statistics
   */
  private updatePerformanceStats(): void {
    const now = performance.now();
    this.performanceStats.frameCount++;
    
    if (now >= this.performanceStats.lastTime + 1000) {
      this.performanceStats.fps = Math.round(
        (this.performanceStats.frameCount * 1000) / (now - this.performanceStats.lastTime)
      );
      this.performanceStats.frameTime = (now - this.performanceStats.lastTime) / this.performanceStats.frameCount;
      this.performanceStats.frameCount = 0;
      this.performanceStats.lastTime = now;
    }
  }

  /**
   * Update avatar state
   */
  private updateState(): void {
    const currentState = this._state();
    const renderer = this._renderer();
    
    if (currentState && renderer) {
      const info = renderer.info;
      
      this._state.update(state => ({
        ...state,
        performance: {
          ...state.performance,
          fps: this.performanceStats.fps,
          frameTime: this.performanceStats.frameTime,
          drawCalls: info.render.calls,
          triangles: info.render.triangles,
          memory: {
            geometries: info.memory.geometries,
            textures: info.memory.textures,
            total: info.memory.geometries + info.memory.textures
          }
        }
      }));
    }
  }

  /**
   * Detect WebGL capabilities
   */
  private detectCapabilities(): AvatarCapabilities | null {
    try {
      // Test WebGL support
      const canvas = document.createElement('canvas');
      const gl2 = canvas.getContext('webgl2');
      const gl = gl2 || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return null;
      }

      const isWebGL2 = !!gl2;
      
      // Get basic parameters
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
      const maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
      
      // Check extensions
      const extensions = {
        instancedArrays: !!(gl.getExtension('ANGLE_instanced_arrays') || gl.getExtension('WEBGL_instanced_arrays')),
        vertexArrayObject: !!(gl.getExtension('OES_vertex_array_object') || gl.getExtension('WEBGL_vertex_array_object')),
        depthTexture: !!(gl.getExtension('WEBGL_depth_texture') || gl.getExtension('WEBKIT_WEBGL_depth_texture')),
        textureFloat: !!gl.getExtension('OES_texture_float'),
        textureHalfFloat: !!gl.getExtension('OES_texture_half_float'),
        standardDerivatives: !!gl.getExtension('OES_standard_derivatives'),
        shaderTextureLOD: !!gl.getExtension('EXT_shader_texture_lod'),
        fragDepth: !!gl.getExtension('EXT_frag_depth'),
        drawBuffers: !!gl.getExtension('WEBGL_draw_buffers'),
        textureFilterAnisotropic: !!(gl.getExtension('EXT_texture_filter_anisotropic') || 
                                      gl.getExtension('MOZ_EXT_texture_filter_anisotropic') || 
                                      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'))
      };

      // Estimate performance tier
      let performanceTier: 'low' | 'medium' | 'high' = 'low';
      
      if (maxTextureSize >= 4096 && maxVertexUniforms >= 256 && extensions.textureFloat) {
        performanceTier = 'high';
      } else if (maxTextureSize >= 2048 && maxVertexUniforms >= 128) {
        performanceTier = 'medium';
      }

      return {
        webglVersion: isWebGL2 ? 2 : 1,
        maxTextureSize,
        maxVertexUniforms,
        maxFragmentUniforms,
        extensions,
        performanceTier
      };

    } catch (error) {
      console.error('Error detecting WebGL capabilities:', error);
      return null;
    }
  }

  /**
   * Handle container resize
   */
  onResize(width: number, height: number): void {
    const camera = this._camera();
    const renderer = this._renderer();
    
    if (camera && renderer) {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      } else if (camera instanceof THREE.OrthographicCamera) {
        const aspect = width / height;
        const size = 5;
        camera.left = -size * aspect;
        camera.right = size * aspect;
        camera.top = size;
        camera.bottom = -size;
        camera.updateProjectionMatrix();
      }
      
      renderer.setSize(width, height);
    }
  }

  /**
   * Add object to scene
   */
  addToScene(object: THREE.Object3D): void {
    const scene = this._scene();
    if (scene) {
      scene.add(object);
    }
  }

  /**
   * Remove object from scene
   */
  removeFromScene(object: THREE.Object3D): void {
    const scene = this._scene();
    if (scene) {
      scene.remove(object);
    }
  }

  /**
   * Get current camera position for controls
   */
  getCameraPosition(): THREE.Vector3 | null {
    const camera = this._camera();
    return camera ? camera.position.clone() : null;
  }

  /**
   * Set camera position and target
   */
  setCameraPosition(position: THREE.Vector3, target?: THREE.Vector3): void {
    const camera = this._camera();
    if (camera) {
      camera.position.copy(position);
      if (target) {
        camera.lookAt(target);
      }
    }
  }

  /**
   * Dispose of all Three.js resources
   */
  dispose(): void {
    // Stop render loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Dispose renderer
    const renderer = this._renderer();
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      
      // Remove from DOM
      const canvas = renderer.domElement;
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }

    // Clear scene
    const scene = this._scene();
    if (scene) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      scene.clear();
    }

    // Clear signals
    this._scene.set(null);
    this._camera.set(null);
    this._renderer.set(null);
    this._clock.set(null);
  }
}