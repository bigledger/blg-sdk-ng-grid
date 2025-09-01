import { 
  Component, 
  input, 
  output, 
  signal, 
  computed, 
  effect,
  viewChild,
  ElementRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  AvatarConfiguration, 
  RenderingOptions, 
  AvatarState, 
  FacialExpression, 
  Gesture, 
  LipSyncData,
  AvatarEvents,
  Size2D
} from '../interfaces/avatar.interfaces';
import { CanvasRendererService } from '../renderers/canvas-renderer.service';
import { SvgRendererService } from '../renderers/svg-renderer.service';
import { AnimationService } from '../services/animation.service';
import { LipSyncService } from '../services/lip-sync.service';
import { CharacterTemplatesService } from '../services/character-templates.service';
import { AvatarCustomizerComponent } from '../components/avatar-customizer.component';

/**
 * Main 2D Avatar component that orchestrates all avatar systems
 * Supports both Canvas and SVG rendering with comprehensive animation capabilities
 */
@Component({
  selector: 'ng-ui-avatar-2d',
  standalone: true,
  imports: [CommonModule, AvatarCustomizerComponent],
  template: `
    <div class="avatar-container" [class.fullscreen]="fullscreen()">
      <!-- Rendering Container -->
      <div class="avatar-renderer" [style.width.px]="renderingSize().width" [style.height.px]="renderingSize().height">
        @if (renderMode() === 'canvas') {
          <canvas 
            #canvasElement
            class="avatar-canvas"
            [attr.aria-label]="ariaLabel() || 'Interactive 2D Avatar'"
            tabindex="0"
            (keydown)="onKeyDown($event)">
            Your browser does not support HTML5 Canvas.
          </canvas>
        } @else {
          <div 
            #svgContainer
            class="avatar-svg-container"
            [attr.aria-label]="ariaLabel() || 'Interactive 2D Avatar'"
            tabindex="0"
            (keydown)="onKeyDown($event)">
          </div>
        }
        
        <!-- Performance Overlay -->
        @if (showPerformanceStats()) {
          <div class="performance-overlay">
            <div class="fps-counter">FPS: {{ fps() }}</div>
            <div class="render-stats">
              Layers: {{ renderStats().layersRendered }}<br>
              Render Time: {{ renderStats().renderTime.toFixed(2) }}ms<br>
              Total Frames: {{ renderStats().totalFrames }}
            </div>
          </div>
        }

        <!-- Loading Indicator -->
        @if (isLoading()) {
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <div class="loading-text">{{ loadingText() }}</div>
          </div>
        }
      </div>

      <!-- Control Panel -->
      @if (showControls()) {
        <div class="avatar-controls">
          <!-- Animation Controls -->
          <div class="control-group">
            <h4>Expressions</h4>
            <div class="control-buttons">
              @for (expression of availableExpressions(); track expression.id) {
                <button 
                  class="control-btn"
                  [class.active]="currentExpression()?.id === expression.id"
                  (click)="changeExpression(expression)"
                  [title]="expression.name">
                  {{ expression.name }}
                </button>
              }
            </div>
          </div>

          <div class="control-group">
            <h4>Gestures</h4>
            <div class="control-buttons">
              @for (gesture of availableGestures(); track gesture.id) {
                <button 
                  class="control-btn"
                  [class.active]="isPlayingGesture(gesture.id)"
                  (click)="playGesture(gesture)"
                  [title]="gesture.name">
                  {{ gesture.name }}
                </button>
              }
            </div>
          </div>

          <!-- Lip Sync Controls -->
          @if (lipSyncEnabled()) {
            <div class="control-group">
              <h4>Lip Sync</h4>
              <div class="control-buttons">
                <button 
                  class="control-btn"
                  [class.active]="isLipSyncPlaying()"
                  (click)="toggleLipSync()"
                  [disabled]="!lipSyncData()">
                  {{ isLipSyncPlaying() ? 'Stop' : 'Start' }} Lip Sync
                </button>
                <input 
                  type="file" 
                  #audioInput
                  accept="audio/*"
                  (change)="loadAudioFile($event)"
                  style="display: none;">
                <button 
                  class="control-btn secondary"
                  (click)="audioInput.click()">
                  Load Audio
                </button>
              </div>
            </div>
          }

          <!-- Render Mode Toggle -->
          <div class="control-group">
            <h4>Rendering</h4>
            <div class="control-buttons">
              <button 
                class="control-btn"
                [class.active]="renderMode() === 'canvas'"
                (click)="setRenderMode('canvas')">
                Canvas
              </button>
              <button 
                class="control-btn"
                [class.active]="renderMode() === 'svg'"
                (click)="setRenderMode('svg')">
                SVG
              </button>
            </div>
          </div>

          <!-- Export Options -->
          <div class="control-group">
            <h4>Export</h4>
            <div class="control-buttons">
              <button class="control-btn secondary" (click)="exportAsPNG()">PNG</button>
              <button class="control-btn secondary" (click)="exportAsSVG()" [disabled]="renderMode() !== 'svg'">SVG</button>
              <button class="control-btn secondary" (click)="exportConfiguration()">Config</button>
            </div>
          </div>
        </div>
      }

      <!-- Customizer Panel -->
      @if (showCustomizer()) {
        <div class="customizer-panel">
          <ng-ui-avatar-customizer
            [config]="configuration()"
            (configurationChanged)="onConfigurationChanged($event)"
            (expressionTest)="changeExpression($event)"
            (gestureTest)="playGesture($event)">
          </ng-ui-avatar-customizer>
        </div>
      }
    </div>

    <!-- Audio Element for Lip Sync -->
    <audio #audioElement style="display: none;" (ended)="onAudioEnded()"></audio>
  `,
  styleUrl: './avatar-2d.scss'
})
export class Avatar2d implements OnInit, OnDestroy {
  // Inputs
  configuration = input<AvatarConfiguration | null>(null);
  renderMode = input<'canvas' | 'svg'>('canvas');
  size = input<Size2D>({ width: 300, height: 400 });
  quality = input<'low' | 'medium' | 'high'>('medium');
  antialiasing = input(true);
  backgroundTransparent = input(true);
  showControls = input(false);
  showCustomizer = input(false);
  showPerformanceStats = input(false);
  lipSyncEnabled = input(false);
  autoPlay = input(false);
  fullscreen = input(false);
  ariaLabel = input<string>();

  // Outputs
  expressionChanged = output<FacialExpression>();
  gestureStarted = output<Gesture>();
  gestureCompleted = output<Gesture>();
  lipSyncStarted = output<LipSyncData>();
  lipSyncCompleted = output<void>();
  configurationChanged = output<AvatarConfiguration>();
  renderingError = output<Error>();

  // View children
  private canvasElement = viewChild<ElementRef<HTMLCanvasElement>>('canvasElement');
  private svgContainer = viewChild<ElementRef<HTMLElement>>('svgContainer');
  private audioElement = viewChild<ElementRef<HTMLAudioElement>>('audioElement');

  // Services
  private canvasRenderer = new CanvasRendererService();
  private svgRenderer = new SvgRendererService();
  private animationService = new AnimationService();
  private lipSyncService = new LipSyncService();
  private templatesService = new CharacterTemplatesService();

  // Internal state
  private readonly _isInitialized = signal(false);
  private readonly _isLoading = signal(false);
  private readonly _loadingText = signal('Loading...');
  private readonly _lipSyncData = signal<LipSyncData | null>(null);

  // Computed properties
  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly loadingText = this._loadingText.asReadonly();
  readonly lipSyncData = this._lipSyncData.asReadonly();

  readonly renderingSize = computed(() => {
    const baseSize = this.size();
    return this.fullscreen() ? { width: window.innerWidth, height: window.innerHeight } : baseSize;
  });

  readonly renderingOptions = computed((): RenderingOptions => ({
    renderMode: this.renderMode(),
    size: this.renderingSize(),
    quality: this.quality(),
    antialiasing: this.antialiasing(),
    backgroundTransparent: this.backgroundTransparent()
  }));

  // Animation state
  readonly currentState = this.animationService.currentState;
  readonly currentExpression = computed(() => this.currentState().currentExpression);
  readonly isAnimating = computed(() => this.currentState().isAnimating);
  readonly isLipSyncPlaying = this.lipSyncService.isPlaying;

  // Renderer state
  readonly fps = this.canvasRenderer.fps;
  readonly renderStats = this.canvasRenderer.renderStats;

  // Available options
  readonly availableExpressions = this.templatesService.baseExpressions;
  readonly availableGestures = this.templatesService.baseGestures;

  constructor() {
    // Watch for configuration changes
    effect(() => {
      const config = this.configuration();
      if (config && this.isInitialized()) {
        this.updateAvatar();
      }
    });

    // Watch for render mode changes
    effect(() => {
      const mode = this.renderMode();
      if (this.isInitialized()) {
        this.reinitializeRenderer();
      }
    });

    // Watch for size changes
    effect(() => {
      const size = this.renderingSize();
      if (this.isInitialized()) {
        this.resizeRenderer();
      }
    });

    // Watch for lip sync updates
    effect(() => {
      const phoneme = this.lipSyncService.currentPhoneme();
      const amplitude = this.lipSyncService.currentAmplitude();
      
      if (phoneme && this.configuration()) {
        const currentExpr = this.currentExpression();
        const mouthState = this.lipSyncService.generateMouthState(phoneme, amplitude, currentExpr);
        
        // Update mouth state in current expression
        this.animationService.changeExpression({
          ...currentExpr,
          mouthState
        }, 50); // Quick transition for lip sync
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.initialize();
  }

  ngOnDestroy(): void {
    this.dispose();
  }

  /**
   * Initialize the avatar system
   */
  private async initialize(): Promise<void> {
    try {
      this._isLoading.set(true);
      this._loadingText.set('Initializing avatar...');

      // Wait for view to be ready
      await new Promise(resolve => setTimeout(resolve, 0));

      await this.initializeRenderer();
      
      // Initialize with default configuration if none provided
      if (!this.configuration()) {
        const defaultTemplate = this.templatesService.templates()[0];
        if (defaultTemplate) {
          const defaultConfig: AvatarConfiguration = {
            character: defaultTemplate,
            layers: [...defaultTemplate.baseLayers],
            customizations: {},
            animations: {
              blinkFrequency: 3000
            }
          };
          this.configurationChanged.emit(defaultConfig);
        }
      }

      this.startRendering();
      
      // Start idle animations
      if (this.autoPlay()) {
        this.animationService.startBlinking();
      }

      this._isInitialized.set(true);
      this._isLoading.set(false);
    } catch (error) {
      this._isLoading.set(false);
      this.renderingError.emit(error as Error);
      console.error('Failed to initialize avatar:', error);
    }
  }

  /**
   * Initialize the appropriate renderer
   */
  private async initializeRenderer(): Promise<void> {
    const options = this.renderingOptions();
    
    if (this.renderMode() === 'canvas') {
      const canvas = this.canvasElement()?.nativeElement;
      if (!canvas) throw new Error('Canvas element not found');
      this.canvasRenderer.initialize(canvas, options);
    } else {
      const container = this.svgContainer()?.nativeElement;
      if (!container) throw new Error('SVG container not found');
      this.svgRenderer.initialize(container, options);
    }
  }

  /**
   * Start the rendering loop
   */
  private startRendering(): void {
    const config = this.configuration();
    const state = this.currentState();
    
    if (!config) return;

    if (this.renderMode() === 'canvas') {
      this.canvasRenderer.startRendering(config, state);
    } else {
      this.svgRenderer.render(config, state);
    }
  }

  /**
   * Update avatar rendering
   */
  private updateAvatar(): void {
    const config = this.configuration();
    const state = this.currentState();
    
    if (!config) return;

    if (this.renderMode() === 'svg') {
      this.svgRenderer.render(config, state);
    }
    // Canvas renderer updates automatically via animation loop
  }

  /**
   * Reinitialize renderer when mode changes
   */
  private async reinitializeRenderer(): Promise<void> {
    this.dispose();
    await this.initializeRenderer();
    this.startRendering();
  }

  /**
   * Resize renderer when size changes
   */
  private resizeRenderer(): void {
    this.reinitializeRenderer();
  }

  /**
   * Change facial expression
   */
  async changeExpression(expression: FacialExpression, duration = 500): Promise<void> {
    try {
      await this.animationService.changeExpression(expression, duration);
      this.expressionChanged.emit(expression);
    } catch (error) {
      console.error('Failed to change expression:', error);
    }
  }

  /**
   * Play a gesture
   */
  async playGesture(gesture: Gesture): Promise<void> {
    try {
      this.gestureStarted.emit(gesture);
      await this.animationService.playGesture(gesture);
      this.gestureCompleted.emit(gesture);
    } catch (error) {
      console.error('Failed to play gesture:', error);
    }
  }

  /**
   * Check if a specific gesture is playing
   */
  isPlayingGesture(gestureId: string): boolean {
    return this.currentState().currentGesture?.id === gestureId;
  }

  /**
   * Toggle lip sync
   */
  async toggleLipSync(): Promise<void> {
    if (this.isLipSyncPlaying()) {
      this.lipSyncService.stopLipSync();
      this.lipSyncCompleted.emit();
    } else {
      const audio = this.audioElement()?.nativeElement;
      const lipSyncData = this.lipSyncData();
      
      if (audio && lipSyncData) {
        try {
          await this.lipSyncService.startLipSync(audio, lipSyncData);
          this.lipSyncStarted.emit(lipSyncData);
        } catch (error) {
          console.error('Failed to start lip sync:', error);
        }
      }
    }
  }

  /**
   * Load audio file for lip sync
   */
  async loadAudioFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      this._isLoading.set(true);
      this._loadingText.set('Processing audio...');

      const audio = this.audioElement()?.nativeElement;
      if (!audio) throw new Error('Audio element not found');

      // Load audio file
      const url = URL.createObjectURL(file);
      audio.src = url;

      // Wait for audio to load
      await new Promise((resolve, reject) => {
        audio.onloadeddata = resolve;
        audio.onerror = reject;
      });

      // Generate lip sync data
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const lipSyncData = await this.lipSyncService.analyzeLipSyncFromAudio(audioBuffer);
      
      this._lipSyncData.set(lipSyncData);
      this._isLoading.set(false);

      URL.revokeObjectURL(url);
    } catch (error) {
      this._isLoading.set(false);
      console.error('Failed to load audio file:', error);
    }
  }

  /**
   * Set render mode
   */
  setRenderMode(mode: 'canvas' | 'svg'): void {
    // This will trigger the effect that reinitializes the renderer
    // In a real implementation, this would update an input signal
    console.log('Render mode change requested:', mode);
  }

  /**
   * Export as PNG
   */
  exportAsPNG(): void {
    try {
      if (this.renderMode() === 'canvas') {
        const dataUrl = this.canvasRenderer.exportAsImage('png');
        this.downloadFile(dataUrl, 'avatar.png');
      } else {
        // Convert SVG to PNG (requires additional implementation)
        console.warn('PNG export from SVG not yet implemented');
      }
    } catch (error) {
      console.error('Failed to export PNG:', error);
    }
  }

  /**
   * Export as SVG
   */
  exportAsSVG(): void {
    try {
      if (this.renderMode() === 'svg') {
        const dataUrl = this.svgRenderer.exportAsDataUrl();
        this.downloadFile(dataUrl, 'avatar.svg');
      }
    } catch (error) {
      console.error('Failed to export SVG:', error);
    }
  }

  /**
   * Export configuration
   */
  exportConfiguration(): void {
    const config = this.configuration();
    if (config) {
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      this.downloadFile(url, 'avatar-config.json');
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Handle configuration changes from customizer
   */
  onConfigurationChanged(config: AvatarConfiguration): void {
    this.configurationChanged.emit(config);
  }

  /**
   * Handle audio end
   */
  onAudioEnded(): void {
    this.lipSyncService.stopLipSync();
    this.lipSyncCompleted.emit();
  }

  /**
   * Handle keyboard input for accessibility
   */
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        const expressionIndex = parseInt(event.key) - 1;
        const expression = this.availableExpressions()[expressionIndex];
        if (expression) {
          this.changeExpression(expression);
        }
        event.preventDefault();
        break;
      
      case 'Space':
        // Toggle between happy and neutral
        const isHappy = this.currentExpression().id === 'happy';
        const targetExpression = this.availableExpressions().find(e => 
          e.id === (isHappy ? 'neutral' : 'happy')
        );
        if (targetExpression) {
          this.changeExpression(targetExpression);
        }
        event.preventDefault();
        break;
    }
  }

  /**
   * Download file helper
   */
  private downloadFile(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  /**
   * Dispose of all resources
   */
  private dispose(): void {
    this.canvasRenderer.dispose();
    this.svgRenderer.dispose();
    this.animationService.dispose();
    this.lipSyncService.dispose();
    this._isInitialized.set(false);
  }
}