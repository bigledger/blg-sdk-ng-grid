import { 
  Component, 
  ElementRef, 
  OnInit, 
  OnDestroy, 
  ViewChild, 
  input, 
  output, 
  signal,
  computed,
  effect,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

import { AvatarConfig, AvatarEvents, AvatarState } from '../interfaces/avatar-config.interface';
import { ModelLoadingOptions, AvatarModel } from '../interfaces/model-loading.interface';
import { SceneService } from '../services/scene.service';
import { ModelLoaderService } from '../services/model-loader.service';
import { AnimationService } from '../services/animation.service';
import { FacialAnimationService } from '../services/facial-animation.service';

/**
 * Avatar 3D Component - Main component for 3D avatar display and interaction
 * 
 * @example
 * ```html
 * <ng-ui-avatar-3d 
 *   [config]="avatarConfig"
 *   [modelUrl]="'assets/models/avatar.glb'"
 *   [autoResize]="true"
 *   (modelLoaded)="onModelLoaded($event)"
 *   (animationFinished)="onAnimationFinished($event)">
 * </ng-ui-avatar-3d>
 * ```
 */
@Component({
  selector: 'ng-ui-avatar-3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #container 
      class="avatar-3d-container"
      [class.loading]="isLoading()"
      [class.error]="hasError()"
      [style.width]="width()"
      [style.height]="height()">
      
      <!-- Loading overlay -->
      <div class="loading-overlay" *ngIf="isLoading()">
        <div class="loading-spinner"></div>
        <div class="loading-text">
          {{ loadingText() }}
        </div>
        <div class="loading-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              [style.width.%]="loadingProgress() * 100">
            </div>
          </div>
          <span class="progress-text">{{ (loadingProgress() * 100).toFixed(0) }}%</span>
        </div>
      </div>

      <!-- Error overlay -->
      <div class="error-overlay" *ngIf="hasError()">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ errorMessage() }}</div>
        <button 
          class="retry-button" 
          (click)="retry()"
          *ngIf="canRetry()">
          Retry
        </button>
      </div>

      <!-- Performance stats (debug mode) -->
      <div 
        class="performance-stats" 
        *ngIf="showStats() && performanceStats()">
        <div>FPS: {{ performanceStats()?.fps || 0 }}</div>
        <div>Triangles: {{ (performanceStats()?.triangles || 0) | number }}</div>
        <div>Draw Calls: {{ performanceStats()?.drawCalls || 0 }}</div>
        <div>Memory: {{ ((performanceStats()?.memory.total || 0) / 1024 / 1024).toFixed(1) }}MB</div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-3d-container {
      position: relative;
      width: 100%;
      height: 400px;
      overflow: hidden;
      background: var(--avatar-bg, #f5f5f5);
      border-radius: var(--avatar-border-radius, 8px);
    }

    .loading-overlay,
    .error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--overlay-bg, rgba(255, 255, 255, 0.9));
      backdrop-filter: blur(4px);
      z-index: 10;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--spinner-track, #e0e0e0);
      border-top: 4px solid var(--spinner-fill, #2196f3);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      color: var(--text-primary, #333);
      font-size: 14px;
      margin-bottom: 16px;
      text-align: center;
    }

    .loading-progress {
      width: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: var(--progress-track, #e0e0e0);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--progress-fill, #2196f3);
      transition: width 0.3s ease;
      border-radius: 2px;
    }

    .progress-text {
      font-size: 12px;
      color: var(--text-secondary, #666);
    }

    .error-overlay {
      color: var(--error-color, #f44336);
    }

    .error-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .error-message {
      font-size: 14px;
      text-align: center;
      margin-bottom: 16px;
      max-width: 80%;
    }

    .retry-button {
      padding: 8px 16px;
      border: 1px solid var(--error-color, #f44336);
      background: transparent;
      color: var(--error-color, #f44336);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .retry-button:hover {
      background: var(--error-color, #f44336);
      color: white;
    }

    .performance-stats {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 10px;
      line-height: 1.4;
      z-index: 5;
      pointer-events: none;
    }

    .avatar-3d-container.loading {
      pointer-events: none;
    }

    .avatar-3d-container.error {
      border: 2px dashed var(--error-color, #f44336);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Avatar3DComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) 
  container!: ElementRef<HTMLDivElement>;

  // Injected services
  private sceneService = inject(SceneService);
  private modelLoader = inject(ModelLoaderService);
  private animationService = inject(AnimationService);
  private facialAnimationService = inject(FacialAnimationService);

  // Input properties
  config = input.required<AvatarConfig>();
  modelUrl = input<string>();
  width = input<string>('100%');
  height = input<string>('400px');
  autoResize = input<boolean>(true);
  showStats = input<boolean>(false);
  enableInteraction = input<boolean>(true);

  // Output events
  modelLoaded = output<AvatarModel>();
  modelLoadError = output<string>();
  animationStarted = output<string>();
  animationFinished = output<string>();
  userInteraction = output<{ type: string; object: THREE.Object3D }>();
  performanceUpdate = output<AvatarState['performance']>();

  // Internal state
  private _loadedModel = signal<AvatarModel | null>(null);
  private _isLoading = signal<boolean>(false);
  private _loadingProgress = signal<number>(0);
  private _loadingStage = signal<string>('');
  private _error = signal<string | null>(null);
  private _canRetry = signal<boolean>(false);

  // Private properties
  private resizeObserver?: ResizeObserver;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private lastClickTime = 0;
  private lastClickObject: THREE.Object3D | null = null;

  // Public computed properties
  readonly isLoading = this._isLoading.asReadonly();
  readonly loadingProgress = this._loadingProgress.asReadonly();
  readonly hasError = computed(() => this._error() !== null);
  readonly errorMessage = this._error.asReadonly();
  readonly canRetry = this._canRetry.asReadonly();
  readonly loadingText = computed(() => {
    const stage = this._loadingStage();
    switch (stage) {
      case 'downloading': return 'Downloading avatar model...';
      case 'parsing': return 'Processing model data...';
      case 'processing': return 'Setting up avatar...';
      case 'optimizing': return 'Optimizing performance...';
      default: return 'Loading avatar...';
    }
  });
  
  readonly performanceStats = computed(() => {
    const state = this.sceneService.state();
    return state?.performance;
  });

  constructor() {
    // Reactive effects
    effect(() => {
      const config = this.config();
      if (config && this.container) {
        this.initializeScene(config);
      }
    });

    effect(() => {
      const modelUrl = this.modelUrl();
      if (modelUrl && this.sceneService.isSceneReady()) {
        this.loadModel(modelUrl);
      }
    });

    // Performance monitoring
    effect(() => {
      const stats = this.performanceStats();
      if (stats) {
        this.performanceUpdate.emit(stats);
      }
    });
  }

  ngOnInit(): void {
    if (this.autoResize()) {
      this.setupResizeObserver();
    }
    this.setupInteractionHandlers();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Initialize the 3D scene
   */
  private async initializeScene(config: AvatarConfig): Promise<void> {
    try {
      // Update container in config
      const containerConfig = {
        ...config,
        container: this.container.nativeElement
      };

      await this.sceneService.initialize(containerConfig);
    } catch (error) {
      console.error('Failed to initialize scene:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to initialize 3D scene');
    }
  }

  /**
   * Load 3D model
   */
  private async loadModel(modelUrl: string): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    this._loadingProgress.set(0);
    this._canRetry.set(false);

    try {
      const loadingOptions: ModelLoadingOptions = {
        url: modelUrl,
        cache: true,
        enableLOD: true,
        lodDistances: [10, 25, 50],
        onProgress: (loaded, total) => {
          if (total > 0) {
            this._loadingProgress.set(loaded / total);
          }
        },
        onPreprocess: (gltf) => {
          this._loadingStage.set('processing');
        },
        onPostprocess: (model) => {
          this._loadingStage.set('optimizing');
        }
      };

      // Track loading progress
      const progressSubscription = this.modelLoader.loadingProgress().subscribe(progressMap => {
        const progress = progressMap.get(modelUrl);
        if (progress) {
          this._loadingStage.set(progress.stage);
          this._loadingProgress.set(progress.progress);
        }
      });

      const avatarModel = await this.modelLoader.loadModel(loadingOptions);
      
      progressSubscription.unsubscribe();
      
      // Add model to scene
      this.sceneService.addToScene(avatarModel.root);
      
      // Initialize animation systems
      this.animationService.initializeWithModel(avatarModel);
      this.facialAnimationService.initializeWithModel(avatarModel);
      
      this._loadedModel.set(avatarModel);
      this._isLoading.set(false);
      
      // Emit success event
      this.modelLoaded.emit(avatarModel);
      
    } catch (error) {
      this._isLoading.set(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load model';
      this.setError(errorMessage);
      this._canRetry.set(true);
      this.modelLoadError.emit(errorMessage);
    }
  }

  /**
   * Set up resize observer for responsive behavior
   */
  private setupResizeObserver(): void {
    if (!window.ResizeObserver) return;

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.sceneService.onResize(width, height);
      }
    });

    this.resizeObserver.observe(this.container.nativeElement);
  }

  /**
   * Set up interaction handlers (mouse, touch)
   */
  private setupInteractionHandlers(): void {
    if (!this.enableInteraction()) return;

    const element = this.container.nativeElement;

    // Mouse events
    element.addEventListener('click', this.onMouseClick.bind(this));
    element.addEventListener('mousemove', this.onMouseMove.bind(this));
    element.addEventListener('dblclick', this.onDoubleClick.bind(this));

    // Touch events
    element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    element.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
  }

  /**
   * Handle mouse click events
   */
  private onMouseClick(event: MouseEvent): void {
    this.updateMousePosition(event);
    const intersectedObject = this.getIntersectedObject();
    
    if (intersectedObject) {
      this.userInteraction.emit({ type: 'click', object: intersectedObject });
      
      // Handle double-click detection
      const now = performance.now();
      if (now - this.lastClickTime < 300 && intersectedObject === this.lastClickObject) {
        this.userInteraction.emit({ type: 'doubleclick', object: intersectedObject });
      }
      
      this.lastClickTime = now;
      this.lastClickObject = intersectedObject;
    }
  }

  /**
   * Handle mouse move events
   */
  private onMouseMove(event: MouseEvent): void {
    this.updateMousePosition(event);
    const intersectedObject = this.getIntersectedObject();
    
    if (intersectedObject) {
      this.userInteraction.emit({ type: 'hover', object: intersectedObject });
    }
  }

  /**
   * Handle double-click events
   */
  private onDoubleClick(event: MouseEvent): void {
    // Prevent default zoom behavior
    event.preventDefault();
  }

  /**
   * Handle touch start events
   */
  private onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.updateMousePositionFromTouch(touch);
    }
  }

  /**
   * Handle touch end events
   */
  private onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      this.updateMousePositionFromTouch(touch);
      
      const intersectedObject = this.getIntersectedObject();
      if (intersectedObject) {
        this.userInteraction.emit({ type: 'touch', object: intersectedObject });
      }
    }
  }

  /**
   * Update mouse position for raycasting
   */
  private updateMousePosition(event: MouseEvent): void {
    const rect = this.container.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Update mouse position from touch event
   */
  private updateMousePositionFromTouch(touch: Touch): void {
    const rect = this.container.nativeElement.getBoundingClientRect();
    this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Get intersected 3D object using raycasting
   */
  private getIntersectedObject(): THREE.Object3D | null {
    const camera = this.sceneService.camera();
    const scene = this.sceneService.scene();
    
    if (!camera || !scene) return null;

    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(scene.children, true);
    
    return intersects.length > 0 ? intersects[0].object : null;
  }

  /**
   * Set error state
   */
  private setError(message: string): void {
    this._error.set(message);
    console.error('Avatar3D Error:', message);
  }

  /**
   * Retry loading the model
   */
  retry(): void {
    const modelUrl = this.modelUrl();
    if (modelUrl) {
      this.loadModel(modelUrl);
    }
  }

  // Public API methods

  /**
   * Play animation by name
   */
  playAnimation(animationName: string, options?: {
    loop?: boolean;
    fadeInDuration?: number;
    weight?: number;
  }): boolean {
    const action = this.animationService.playAnimation(animationName, options);
    if (action) {
      this.animationStarted.emit(animationName);
      
      // Listen for animation finish
      const mixer = this.animationService.animationMixer();
      if (mixer) {
        const onFinish = () => {
          this.animationFinished.emit(animationName);
          mixer.removeEventListener('finished', onFinish);
        };
        mixer.addEventListener('finished', onFinish);
      }
      
      return true;
    }
    return false;
  }

  /**
   * Stop animation by name
   */
  stopAnimation(animationName: string, fadeOutDuration?: number): void {
    this.animationService.stopAnimation(animationName, fadeOutDuration);
  }

  /**
   * Play facial expression
   */
  playExpression(expressionName: string, intensity: number = 1.0): void {
    this.facialAnimationService.playEmotion(expressionName, intensity);
  }

  /**
   * Set gaze target
   */
  setGazeTarget(position: THREE.Vector3): void {
    this.facialAnimationService.setGazeTarget(position);
  }

  /**
   * Play gesture
   */
  playGesture(gestureName: string): boolean {
    try {
      this.animationService.playGesture(gestureName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set avatar position
   */
  setPosition(position: THREE.Vector3): void {
    const model = this._loadedModel();
    if (model) {
      model.root.position.copy(position);
    }
  }

  /**
   * Set avatar rotation
   */
  setRotation(rotation: THREE.Euler): void {
    const model = this._loadedModel();
    if (model) {
      model.root.rotation.copy(rotation);
    }
  }

  /**
   * Set avatar scale
   */
  setScale(scale: THREE.Vector3 | number): void {
    const model = this._loadedModel();
    if (model) {
      if (typeof scale === 'number') {
        model.root.scale.setScalar(scale);
      } else {
        model.root.scale.copy(scale);
      }
    }
  }

  /**
   * Get current model
   */
  getModel(): AvatarModel | null {
    return this._loadedModel();
  }

  /**
   * Get Three.js scene
   */
  getScene(): THREE.Scene | null {
    return this.sceneService.scene();
  }

  /**
   * Get Three.js camera
   */
  getCamera(): THREE.Camera | null {
    return this.sceneService.camera();
  }

  /**
   * Get Three.js renderer
   */
  getRenderer(): THREE.WebGLRenderer | null {
    return this.sceneService.renderer();
  }

  /**
   * Take screenshot of current avatar
   */
  takeScreenshot(width?: number, height?: number): string | null {
    const renderer = this.sceneService.renderer();
    if (!renderer) return null;

    const currentSize = renderer.getSize(new THREE.Vector2());
    
    if (width && height) {
      renderer.setSize(width, height);
      renderer.render(this.sceneService.scene()!, this.sceneService.camera()!);
    }
    
    const screenshot = renderer.domElement.toDataURL('image/png');
    
    // Restore original size
    renderer.setSize(currentSize.x, currentSize.y);
    
    return screenshot;
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Cleanup services
    this.sceneService.dispose();
    this.animationService.dispose();
    this.facialAnimationService.dispose();
  }
}