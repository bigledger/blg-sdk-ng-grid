import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

/**
 * Background types
 */
export type BackgroundType = 'solid' | 'gradient' | 'image' | 'video' | 'animated' | 'interactive';

/**
 * Background configuration
 */
export interface BackgroundConfig {
  id: string;
  name: string;
  type: BackgroundType;
  category: 'professional' | 'casual' | 'creative' | 'nature' | 'abstract' | 'custom';
  data: BackgroundData;
  settings: BackgroundSettings;
  metadata: BackgroundMetadata;
  isPremium?: boolean;
}

/**
 * Background data based on type
 */
export type BackgroundData = 
  | SolidBackgroundData
  | GradientBackgroundData
  | ImageBackgroundData
  | VideoBackgroundData
  | AnimatedBackgroundData
  | InteractiveBackgroundData;

export interface SolidBackgroundData {
  color: string;
}

export interface GradientBackgroundData {
  type: 'linear' | 'radial' | 'conic';
  colors: Array<{ color: string; position: number }>;
  angle?: number; // For linear gradients
  center?: { x: number; y: number }; // For radial gradients
}

export interface ImageBackgroundData {
  url: string;
  thumbnailUrl?: string;
  size: 'cover' | 'contain' | 'stretch' | 'tile';
  position: string; // CSS background-position
  opacity?: number;
  blendMode?: string;
}

export interface VideoBackgroundData {
  url: string;
  thumbnailUrl?: string;
  loop: boolean;
  muted: boolean;
  startTime?: number;
  endTime?: number;
  playbackRate?: number;
}

export interface AnimatedBackgroundData {
  animationType: 'particles' | 'waves' | 'geometric' | 'organic' | 'abstract';
  colors: string[];
  speed: number; // 0.1 - 2.0
  density: number; // 0.1 - 1.0
  complexity: number; // 0.1 - 1.0
}

export interface InteractiveBackgroundData {
  interactionType: 'mouse' | 'audio' | 'motion' | 'emotion';
  sensitivity: number; // 0.1 - 1.0
  responseIntensity: number; // 0.1 - 1.0
  baseBackground: BackgroundData;
}

/**
 * Background settings
 */
export interface BackgroundSettings {
  brightness: number; // 0 - 200
  contrast: number; // 0 - 200
  saturation: number; // 0 - 200
  hue: number; // -180 to 180
  blur: number; // 0 - 10
  overlay?: {
    color: string;
    opacity: number;
    blendMode: string;
  };
  effects?: BackgroundEffect[];
}

/**
 * Background effects
 */
export interface BackgroundEffect {
  type: 'glow' | 'shadow' | 'vignette' | 'noise' | 'distortion' | 'parallax';
  intensity: number; // 0 - 1
  settings: Record<string, any>;
  enabled: boolean;
}

/**
 * Background metadata
 */
export interface BackgroundMetadata {
  resolution: { width: number; height: number };
  aspectRatio: number;
  fileSize?: number;
  format?: string;
  fps?: number; // For videos
  duration?: number; // For videos/animations
  colors: string[]; // Dominant colors
  tags: string[];
  author?: string;
  license?: string;
  description?: string;
}

/**
 * Background performance metrics
 */
export interface BackgroundPerformance {
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  fps: number;
  loadTime: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

/**
 * Background transition settings
 */
export interface BackgroundTransition {
  type: 'fade' | 'slide' | 'zoom' | 'dissolve' | 'wipe' | 'custom';
  duration: number; // milliseconds
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  direction?: 'left' | 'right' | 'up' | 'down';
  customFunction?: string; // CSS animation name
}

/**
 * Background manager service for handling avatar backgrounds.
 * Manages background rendering, transitions, and performance optimization.
 */
@Injectable({
  providedIn: 'root'
})
export class BackgroundManagerService {
  private destroyRef = inject(DestroyRef);

  // Background state signals
  private _currentBackground = signal<BackgroundConfig | null>(null);
  private _backgroundLibrary = signal<Map<string, BackgroundConfig>>(new Map());
  private _activeCanvases = signal<Map<string, HTMLCanvasElement>>(new Map());
  private _transitionInProgress = signal<boolean>(false);

  // Performance signals
  private _performanceMetrics = signal<Map<string, BackgroundPerformance>>(new Map());
  private _qualitySettings = signal<{
    autoAdjust: boolean;
    targetFps: number;
    maxMemoryMB: number;
    preferQuality: boolean;
  }>({
    autoAdjust: true,
    targetFps: 30,
    maxMemoryMB: 100,
    preferQuality: false
  });

  // Event subjects
  private backgroundChanged$ = new Subject<{ old: BackgroundConfig | null; new: BackgroundConfig }>();
  private transitionStarted$ = new Subject<{ from: BackgroundConfig | null; to: BackgroundConfig; transition: BackgroundTransition }>();
  private transitionCompleted$ = new Subject<{ background: BackgroundConfig }>();
  private performanceUpdated$ = new Subject<{ backgroundId: string; metrics: BackgroundPerformance }>();
  private backgroundError$ = new Subject<{ backgroundId: string; error: any }>();

  // Computed values
  readonly currentBackground = this._currentBackground.asReadonly();
  readonly backgroundLibrary = this._backgroundLibrary.asReadonly();
  readonly isTransitioning = this._transitionInProgress.asReadonly();
  readonly qualitySettings = this._qualitySettings.asReadonly();

  readonly availableBackgrounds = computed(() => 
    Array.from(this._backgroundLibrary().values())
  );

  readonly backgroundsByCategory = computed(() => {
    const backgrounds = this.availableBackgrounds();
    const categories = new Map<string, BackgroundConfig[]>();
    
    backgrounds.forEach(bg => {
      if (!categories.has(bg.category)) {
        categories.set(bg.category, []);
      }
      categories.get(bg.category)!.push(bg);
    });
    
    return categories;
  });

  readonly currentPerformance = computed(() => {
    const current = this._currentBackground();
    return current ? this._performanceMetrics().get(current.id) || null : null;
  });

  // Public observables
  readonly backgroundChanged = this.backgroundChanged$.asObservable();
  readonly transitionStarted = this.transitionStarted$.asObservable();
  readonly transitionCompleted = this.transitionCompleted$.asObservable();
  readonly performanceUpdated = this.performanceUpdated$.asObservable();
  readonly backgroundError = this.backgroundError$.asObservable();

  constructor() {
    this.initializeBackgroundLibrary();
    this.setupPerformanceMonitoring();
  }

  /**
   * Set current background
   */
  async setBackground(
    backgroundId: string, 
    transition?: BackgroundTransition
  ): Promise<void> {
    const background = this._backgroundLibrary().get(backgroundId);
    
    if (!background) {
      throw new Error(`Background not found: ${backgroundId}`);
    }

    const currentBackground = this._currentBackground();

    try {
      if (transition && currentBackground) {
        await this.performTransition(currentBackground, background, transition);
      } else {
        await this.applyBackground(background);
      }

      const oldBackground = this._currentBackground();
      this._currentBackground.set(background);
      
      this.backgroundChanged$.next({ 
        old: oldBackground, 
        new: background 
      });

    } catch (error) {
      console.error(`Failed to set background ${backgroundId}:`, error);
      this.backgroundError$.next({ backgroundId, error });
      throw error;
    }
  }

  /**
   * Create custom background
   */
  createCustomBackground(config: Partial<BackgroundConfig>): string {
    const backgroundId = this.generateBackgroundId();
    
    const background: BackgroundConfig = {
      id: backgroundId,
      name: config.name || 'Custom Background',
      type: config.type || 'solid',
      category: 'custom',
      data: config.data || { color: '#f0f0f0' } as SolidBackgroundData,
      settings: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
        ...config.settings
      },
      metadata: {
        resolution: { width: 1920, height: 1080 },
        aspectRatio: 16/9,
        colors: ['#f0f0f0'],
        tags: ['custom'],
        ...config.metadata
      },
      isPremium: false,
      ...config
    };

    this._backgroundLibrary.update(library => {
      const newLibrary = new Map(library);
      newLibrary.set(backgroundId, background);
      return newLibrary;
    });

    return backgroundId;
  }

  /**
   * Update background settings
   */
  updateBackgroundSettings(
    backgroundId: string, 
    settings: Partial<BackgroundSettings>
  ): void {
    this._backgroundLibrary.update(library => {
      const newLibrary = new Map(library);
      const background = newLibrary.get(backgroundId);
      
      if (background) {
        background.settings = { ...background.settings, ...settings };
        newLibrary.set(backgroundId, background);
      }
      
      return newLibrary;
    });

    // Reapply if this is the current background
    const current = this._currentBackground();
    if (current?.id === backgroundId) {
      this.applyBackground({ ...current, settings: { ...current.settings, ...settings } });
    }
  }

  /**
   * Configure quality settings
   */
  configureQuality(settings: Partial<typeof this._qualitySettings>): void {
    this._qualitySettings.update(current => ({ ...current, ...settings }));
  }

  /**
   * Get background performance metrics
   */
  getPerformanceMetrics(backgroundId: string): BackgroundPerformance | null {
    return this._performanceMetrics().get(backgroundId) || null;
  }

  /**
   * Preload background for faster switching
   */
  async preloadBackground(backgroundId: string): Promise<void> {
    const background = this._backgroundLibrary().get(backgroundId);
    
    if (!background) {
      throw new Error(`Background not found: ${backgroundId}`);
    }

    try {
      await this.loadBackgroundResources(background);
    } catch (error) {
      console.error(`Failed to preload background ${backgroundId}:`, error);
      this.backgroundError$.next({ backgroundId, error });
      throw error;
    }
  }

  /**
   * Remove custom background
   */
  removeBackground(backgroundId: string): void {
    const background = this._backgroundLibrary().get(backgroundId);
    
    if (!background || background.category !== 'custom') {
      throw new Error('Can only remove custom backgrounds');
    }

    // Switch to default if removing current background
    if (this._currentBackground()?.id === backgroundId) {
      this.setBackground('solid_gray'); // Default background
    }

    this._backgroundLibrary.update(library => {
      const newLibrary = new Map(library);
      newLibrary.delete(backgroundId);
      return newLibrary;
    });

    // Cleanup resources
    this.cleanupBackgroundResources(backgroundId);
  }

  /**
   * Generate background thumbnail
   */
  async generateThumbnail(
    backgroundId: string, 
    size: { width: number; height: number }
  ): Promise<string> {
    const background = this._backgroundLibrary().get(backgroundId);
    
    if (!background) {
      throw new Error(`Background not found: ${backgroundId}`);
    }

    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Render background at thumbnail size
    await this.renderBackground(background, canvas, ctx);
    
    return canvas.toDataURL('image/png');
  }

  /**
   * Apply background to canvas/element
   */
  private async applyBackground(background: BackgroundConfig): Promise<void> {
    const startTime = performance.now();

    try {
      // Load resources if needed
      await this.loadBackgroundResources(background);

      // Create or get canvas for this background
      const canvas = this.getOrCreateCanvas(background.id);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Render background
      await this.renderBackground(background, canvas, ctx);

      // Apply settings (filters, effects, etc.)
      this.applyBackgroundSettings(background, canvas, ctx);

      // Update performance metrics
      const loadTime = performance.now() - startTime;
      this.updatePerformanceMetrics(background.id, { loadTime });

    } catch (error) {
      console.error(`Failed to apply background ${background.id}:`, error);
      this.backgroundError$.next({ backgroundId: background.id, error });
      throw error;
    }
  }

  /**
   * Perform background transition
   */
  private async performTransition(
    fromBackground: BackgroundConfig,
    toBackground: BackgroundConfig,
    transition: BackgroundTransition
  ): Promise<void> {
    this._transitionInProgress.set(true);
    
    this.transitionStarted$.next({
      from: fromBackground,
      to: toBackground,
      transition
    });

    try {
      // Prepare new background
      await this.applyBackground(toBackground);

      // Perform transition animation
      await this.animateTransition(fromBackground, toBackground, transition);

      this.transitionCompleted$.next({ background: toBackground });
      
    } finally {
      this._transitionInProgress.set(false);
    }
  }

  /**
   * Load background resources
   */
  private async loadBackgroundResources(background: BackgroundConfig): Promise<void> {
    switch (background.type) {
      case 'image':
        await this.loadImageBackground(background.data as ImageBackgroundData);
        break;
      case 'video':
        await this.loadVideoBackground(background.data as VideoBackgroundData);
        break;
      case 'animated':
        await this.initializeAnimatedBackground(background.data as AnimatedBackgroundData);
        break;
      // Other types don't need preloading
    }
  }

  /**
   * Render background on canvas
   */
  private async renderBackground(
    background: BackgroundConfig,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ): Promise<void> {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (background.type) {
      case 'solid':
        this.renderSolidBackground(background.data as SolidBackgroundData, ctx, canvas);
        break;
      case 'gradient':
        this.renderGradientBackground(background.data as GradientBackgroundData, ctx, canvas);
        break;
      case 'image':
        await this.renderImageBackground(background.data as ImageBackgroundData, ctx, canvas);
        break;
      case 'video':
        await this.renderVideoBackground(background.data as VideoBackgroundData, ctx, canvas);
        break;
      case 'animated':
        this.renderAnimatedBackground(background.data as AnimatedBackgroundData, ctx, canvas);
        break;
      case 'interactive':
        await this.renderInteractiveBackground(background.data as InteractiveBackgroundData, ctx, canvas);
        break;
    }
  }

  /**
   * Render solid background
   */
  private renderSolidBackground(
    data: SolidBackgroundData,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void {
    ctx.fillStyle = data.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Render gradient background
   */
  private renderGradientBackground(
    data: GradientBackgroundData,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void {
    let gradient: CanvasGradient;

    switch (data.type) {
      case 'linear':
        const angle = (data.angle || 0) * Math.PI / 180;
        const x1 = canvas.width / 2 - Math.cos(angle) * canvas.width / 2;
        const y1 = canvas.height / 2 - Math.sin(angle) * canvas.height / 2;
        const x2 = canvas.width / 2 + Math.cos(angle) * canvas.width / 2;
        const y2 = canvas.height / 2 + Math.sin(angle) * canvas.height / 2;
        gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        break;
        
      case 'radial':
        const center = data.center || { x: 0.5, y: 0.5 };
        const centerX = canvas.width * center.x;
        const centerY = canvas.height * center.y;
        const radius = Math.max(canvas.width, canvas.height) / 2;
        gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        break;
        
      default:
        // Fallback to linear
        gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    }

    // Add color stops
    data.colors.forEach(colorStop => {
      gradient.addColorStop(colorStop.position, colorStop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Render image background
   */
  private async renderImageBackground(
    data: ImageBackgroundData,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Apply background size and position
          this.drawImageWithSize(ctx, img, canvas, data.size, data.position);
          
          // Apply opacity if specified
          if (data.opacity && data.opacity < 1) {
            ctx.globalAlpha = data.opacity;
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error(`Failed to load image: ${data.url}`));
      img.src = data.url;
    });
  }

  /**
   * Draw image with specified size mode
   */
  private drawImageWithSize(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvas: HTMLCanvasElement,
    size: 'cover' | 'contain' | 'stretch' | 'tile',
    position: string
  ): void {
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = img.width / img.height;

    switch (size) {
      case 'cover':
        if (imageAspect > canvasAspect) {
          const height = canvas.height;
          const width = height * imageAspect;
          const x = (canvas.width - width) / 2;
          ctx.drawImage(img, x, 0, width, height);
        } else {
          const width = canvas.width;
          const height = width / imageAspect;
          const y = (canvas.height - height) / 2;
          ctx.drawImage(img, 0, y, width, height);
        }
        break;

      case 'contain':
        if (imageAspect > canvasAspect) {
          const width = canvas.width;
          const height = width / imageAspect;
          const y = (canvas.height - height) / 2;
          ctx.drawImage(img, 0, y, width, height);
        } else {
          const height = canvas.height;
          const width = height * imageAspect;
          const x = (canvas.width - width) / 2;
          ctx.drawImage(img, x, 0, width, height);
        }
        break;

      case 'stretch':
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        break;

      case 'tile':
        const pattern = ctx.createPattern(img, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        break;
    }
  }

  /**
   * Load image background
   */
  private async loadImageBackground(data: ImageBackgroundData): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${data.url}`));
      img.src = data.url;
    });
  }

  /**
   * Load video background (placeholder)
   */
  private async loadVideoBackground(data: VideoBackgroundData): Promise<void> {
    // Video loading implementation would go here
    console.log('Loading video background:', data.url);
  }

  /**
   * Render video background (placeholder)
   */
  private async renderVideoBackground(
    data: VideoBackgroundData,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    // Video rendering implementation would go here
    // For now, render a placeholder
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Video Background', canvas.width / 2, canvas.height / 2);
  }

  /**
   * Initialize animated background (placeholder)
   */
  private async initializeAnimatedBackground(data: AnimatedBackgroundData): Promise<void> {
    console.log('Initializing animated background:', data.animationType);
  }

  /**
   * Render animated background (placeholder)
   */
  private renderAnimatedBackground(
    data: AnimatedBackgroundData,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void {
    // Animated background rendering would go here
    // For now, render a placeholder with animated gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.001 * data.speed;
    
    data.colors.forEach((color, index) => {
      const position = (index + Math.sin(time + index)) / data.colors.length;
      gradient.addColorStop(Math.max(0, Math.min(1, position)), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Render interactive background (placeholder)
   */
  private async renderInteractiveBackground(
    data: InteractiveBackgroundData,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    // Render base background first
    // Then add interactive elements
    console.log('Rendering interactive background:', data.interactionType);
  }

  /**
   * Apply background settings (filters, effects)
   */
  private applyBackgroundSettings(
    background: BackgroundConfig,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ): void {
    const settings = background.settings;
    
    // Apply CSS filters to canvas
    const filters: string[] = [];
    
    if (settings.brightness !== 100) {
      filters.push(`brightness(${settings.brightness}%)`);
    }
    
    if (settings.contrast !== 100) {
      filters.push(`contrast(${settings.contrast}%)`);
    }
    
    if (settings.saturation !== 100) {
      filters.push(`saturate(${settings.saturation}%)`);
    }
    
    if (settings.hue !== 0) {
      filters.push(`hue-rotate(${settings.hue}deg)`);
    }
    
    if (settings.blur > 0) {
      filters.push(`blur(${settings.blur}px)`);
    }

    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
    }

    // Apply overlay if specified
    if (settings.overlay) {
      ctx.globalCompositeOperation = settings.overlay.blendMode as GlobalCompositeOperation || 'normal';
      ctx.fillStyle = settings.overlay.color;
      ctx.globalAlpha = settings.overlay.opacity;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  /**
   * Animate transition between backgrounds
   */
  private async animateTransition(
    fromBackground: BackgroundConfig,
    toBackground: BackgroundConfig,
    transition: BackgroundTransition
  ): Promise<void> {
    return new Promise((resolve) => {
      const duration = transition.duration;
      const startTime = performance.now();
      
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easedProgress = this.applyEasing(progress, transition.easing);
        
        // Apply transition effect based on type
        this.applyTransitionEffect(fromBackground, toBackground, transition.type, easedProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  /**
   * Apply easing function to progress
   */
  private applyEasing(progress: number, easing: string): number {
    switch (easing) {
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return progress * (2 - progress);
      case 'ease-in-out':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case 'linear':
      default:
        return progress;
    }
  }

  /**
   * Apply transition effect
   */
  private applyTransitionEffect(
    fromBackground: BackgroundConfig,
    toBackground: BackgroundConfig,
    effectType: string,
    progress: number
  ): void {
    // Transition effect implementations would go here
    console.log(`Applying ${effectType} transition: ${Math.round(progress * 100)}%`);
  }

  /**
   * Get or create canvas for background
   */
  private getOrCreateCanvas(backgroundId: string): HTMLCanvasElement {
    let canvas = this._activeCanvases().get(backgroundId);
    
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      
      this._activeCanvases.update(canvases => {
        const newCanvases = new Map(canvases);
        newCanvases.set(backgroundId, canvas!);
        return newCanvases;
      });
    }
    
    return canvas;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(
    backgroundId: string, 
    metrics: Partial<BackgroundPerformance>
  ): void {
    this._performanceMetrics.update(current => {
      const newMetrics = new Map(current);
      const existing = newMetrics.get(backgroundId) || {
        renderTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        fps: 30,
        loadTime: 0,
        quality: 'medium' as const
      };
      
      newMetrics.set(backgroundId, { ...existing, ...metrics });
      return newMetrics;
    });

    const updated = this._performanceMetrics().get(backgroundId)!;
    this.performanceUpdated$.next({ backgroundId, metrics: updated });
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor performance every second
    setInterval(() => {
      this.monitorBackgroundPerformance();
    }, 1000);

    // Listen for visibility changes to optimize performance
    fromEvent(document, 'visibilitychange')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.handleVisibilityChange();
      });
  }

  /**
   * Monitor background performance
   */
  private monitorBackgroundPerformance(): void {
    const current = this._currentBackground();
    if (!current) return;

    // Calculate performance metrics
    const renderTime = performance.now(); // Simplified
    const memoryUsage = this.estimateMemoryUsage(current);
    const cpuUsage = this.estimateCPUUsage(current);
    const fps = this.measureFPS();

    this.updatePerformanceMetrics(current.id, {
      renderTime,
      memoryUsage,
      cpuUsage,
      fps
    });

    // Auto-adjust quality if enabled
    if (this._qualitySettings().autoAdjust) {
      this.autoAdjustQuality(current, fps);
    }
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(background: BackgroundConfig): number {
    // Simplified memory estimation
    const base = 10; // Base memory in MB
    
    switch (background.type) {
      case 'image':
        return base + (background.metadata.resolution.width * background.metadata.resolution.height * 4) / (1024 * 1024);
      case 'video':
        return base + 50; // Estimate for video
      case 'animated':
        return base + 30; // Estimate for animations
      default:
        return base;
    }
  }

  /**
   * Estimate CPU usage
   */
  private estimateCPUUsage(background: BackgroundConfig): number {
    // Simplified CPU estimation
    switch (background.type) {
      case 'animated':
        return 15;
      case 'video':
        return 25;
      case 'interactive':
        return 20;
      default:
        return 5;
    }
  }

  /**
   * Measure FPS (simplified)
   */
  private measureFPS(): number {
    // This would measure actual FPS in a real implementation
    return 30;
  }

  /**
   * Auto-adjust quality based on performance
   */
  private autoAdjustQuality(background: BackgroundConfig, currentFps: number): void {
    const settings = this._qualitySettings();
    
    if (currentFps < settings.targetFps * 0.8) {
      // Reduce quality
      this.updateBackgroundSettings(background.id, {
        blur: Math.min(5, (background.settings.blur || 0) + 1)
      });
    } else if (currentFps > settings.targetFps * 1.2) {
      // Can increase quality
      this.updateBackgroundSettings(background.id, {
        blur: Math.max(0, (background.settings.blur || 0) - 1)
      });
    }
  }

  /**
   * Handle visibility change for performance optimization
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Pause animations when tab is hidden
      console.log('Background paused due to visibility change');
    } else {
      // Resume animations when tab is visible
      console.log('Background resumed due to visibility change');
    }
  }

  /**
   * Cleanup background resources
   */
  private cleanupBackgroundResources(backgroundId: string): void {
    this._activeCanvases.update(canvases => {
      const newCanvases = new Map(canvases);
      newCanvases.delete(backgroundId);
      return newCanvases;
    });

    this._performanceMetrics.update(metrics => {
      const newMetrics = new Map(metrics);
      newMetrics.delete(backgroundId);
      return newMetrics;
    });
  }

  /**
   * Initialize background library with default backgrounds
   */
  private initializeBackgroundLibrary(): void {
    const defaultBackgrounds: BackgroundConfig[] = [
      {
        id: 'solid_gray',
        name: 'Solid Gray',
        type: 'solid',
        category: 'professional',
        data: { color: '#f5f5f5' },
        settings: { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0 },
        metadata: {
          resolution: { width: 1920, height: 1080 },
          aspectRatio: 16/9,
          colors: ['#f5f5f5'],
          tags: ['neutral', 'professional'],
          description: 'Clean gray background'
        }
      },
      
      {
        id: 'gradient_blue',
        name: 'Blue Gradient',
        type: 'gradient',
        category: 'professional',
        data: {
          type: 'linear',
          colors: [
            { color: '#667eea', position: 0 },
            { color: '#764ba2', position: 1 }
          ],
          angle: 135
        },
        settings: { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0 },
        metadata: {
          resolution: { width: 1920, height: 1080 },
          aspectRatio: 16/9,
          colors: ['#667eea', '#764ba2'],
          tags: ['gradient', 'blue', 'professional'],
          description: 'Professional blue gradient'
        }
      }
    ];

    const backgroundMap = new Map<string, BackgroundConfig>();
    defaultBackgrounds.forEach(bg => backgroundMap.set(bg.id, bg));
    this._backgroundLibrary.set(backgroundMap);
  }

  /**
   * Generate unique background ID
   */
  private generateBackgroundId(): string {
    return `bg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}