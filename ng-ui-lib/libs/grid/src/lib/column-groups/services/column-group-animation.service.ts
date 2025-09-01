import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { ColumnGroupAnimation } from '../interfaces/column-group.interface';

/**
 * Advanced Column Group Animation Service
 * Provides smooth, performance-optimized animations with Web Animation API
 * and CSS-in-JS for column group interactions
 */
@Injectable({
  providedIn: 'root'
})
export class ColumnGroupAnimationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Animation state management
  private readonly _animationsEnabled = signal<boolean>(true);
  private readonly _globalPerformanceMode = signal<'high' | 'balanced' | 'low'>('balanced');
  private readonly _activeAnimations = signal<Map<string, Animation>>(new Map());
  private readonly _animationQueue = signal<AnimationQueueItem[]>([]);

  // Performance monitoring
  private readonly _performanceMetrics = signal<AnimationPerformanceMetrics>({
    averageFrameRate: 60,
    droppedFrames: 0,
    animationCount: 0,
    lastFrameTime: 0,
    memoryUsage: 0
  });

  // Event streams
  private readonly animationStarted$ = new Subject<AnimationEvent>();
  private readonly animationCompleted$ = new Subject<AnimationEvent>();
  private readonly animationError$ = new Subject<AnimationErrorEvent>();

  // Public readonly signals
  readonly animationsEnabled = this._animationsEnabled.asReadonly();
  readonly performanceMode = this._globalPerformanceMode.asReadonly();
  readonly activeAnimationsCount = computed(() => this._activeAnimations().size);
  readonly queuedAnimationsCount = computed(() => this._animationQueue().length);
  readonly performanceMetrics = this._performanceMetrics.asReadonly();

  // Animation presets for different interactions
  private readonly animationPresets: { [key: string]: ColumnGroupAnimation } = {
    expandCollapse: {
      type: 'slide',
      duration: 300,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      triggers: ['expand', 'collapse']
    },
    hover: {
      type: 'scale',
      duration: 200,
      easing: 'ease-out',
      triggers: ['hover']
    },
    focus: {
      type: 'glow',
      duration: 300,
      easing: 'ease-in-out',
      triggers: ['focus']
    },
    dragStart: {
      type: 'lift',
      duration: 250,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      triggers: ['dragStart']
    },
    dragEnd: {
      type: 'drop',
      duration: 400,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      triggers: ['dragEnd']
    },
    error: {
      type: 'shake',
      duration: 500,
      easing: 'ease-in-out',
      triggers: ['error']
    },
    success: {
      type: 'bounce',
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      triggers: ['success']
    }
  };

  constructor() {
    if (this.isBrowser) {
      this.initializePerformanceMonitoring();
      this.setupReducedMotionDetection();
      this.initializeAnimationQueue();
    }
  }

  // ========================================
  // Main Animation Methods
  // ========================================

  /**
   * Animate element with specified configuration
   */
  animate(
    element: HTMLElement,
    config: AnimationConfig
  ): Promise<void> {
    if (!this.isBrowser || !this._animationsEnabled() || !element) {
      return Promise.resolve();
    }

    const animationId = this.generateAnimationId();
    const normalizedConfig = this.normalizeAnimationConfig(config);

    return new Promise<void>((resolve, reject) => {
      try {
        const animation = this.createAnimation(element, normalizedConfig);
        
        this._activeAnimations.update(map => {
          const newMap = new Map(map);
          newMap.set(animationId, animation);
          return newMap;
        });

        animation.addEventListener('finish', () => {
          this.cleanupAnimation(animationId);
          this.updatePerformanceMetrics(animation);
          this.animationCompleted$.next({
            id: animationId,
            element,
            config: normalizedConfig,
            duration: animation.currentTime || 0
          });
          resolve();
        });

        animation.addEventListener('cancel', () => {
          this.cleanupAnimation(animationId);
          reject(new Error('Animation was cancelled'));
        });

        animation.addEventListener('error', (error) => {
          this.cleanupAnimation(animationId);
          this.animationError$.next({
            id: animationId,
            element,
            config: normalizedConfig,
            error: error as any
          });
          reject(error);
        });

        this.animationStarted$.next({
          id: animationId,
          element,
          config: normalizedConfig,
          duration: normalizedConfig.duration || 300
        });

        animation.play();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Animate using preset configuration
   */
  animateWithPreset(
    element: HTMLElement,
    presetName: keyof typeof this.animationPresets,
    overrides: Partial<ColumnGroupAnimation> = {}
  ): Promise<void> {
    const preset = this.animationPresets[presetName];
    if (!preset) {
      throw new Error(`Animation preset '${presetName}' not found`);
    }

    const config = { ...preset, ...overrides };
    return this.animate(element, {
      type: config.type || 'fade',
      duration: config.duration || 300,
      easing: config.easing || 'ease-out',
      collapsed: false,
      ...overrides
    });
  }

  /**
   * Queue animation for batch execution
   */
  queueAnimation(
    element: HTMLElement,
    config: AnimationConfig,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): string {
    const animationId = this.generateAnimationId();
    const queueItem: AnimationQueueItem = {
      id: animationId,
      element,
      config,
      priority,
      timestamp: Date.now()
    };

    this._animationQueue.update(queue => {
      const newQueue = [...queue, queueItem];
      return this.sortAnimationQueue(newQueue);
    });

    return animationId;
  }

  /**
   * Execute all queued animations
   */
  async executeQueuedAnimations(): Promise<void> {
    const queue = this._animationQueue();
    if (queue.length === 0) return;

    this._animationQueue.set([]);

    const animations = queue.map(item => 
      this.animate(item.element, item.config)
    );

    try {
      await Promise.all(animations);
    } catch (error) {
      console.warn('Some animations failed to complete:', error);
    }
  }

  /**
   * Cancel specific animation
   */
  cancelAnimation(animationId: string): void {
    const animation = this._activeAnimations().get(animationId);
    if (animation) {
      animation.cancel();
      this.cleanupAnimation(animationId);
    }
  }

  /**
   * Cancel all active animations
   */
  cancelAllAnimations(): void {
    this._activeAnimations().forEach(animation => animation.cancel());
    this._activeAnimations.set(new Map());
  }

  /**
   * Pause specific animation
   */
  pauseAnimation(animationId: string): void {
    const animation = this._activeAnimations().get(animationId);
    if (animation) {
      animation.pause();
    }
  }

  /**
   * Resume specific animation
   */
  resumeAnimation(animationId: string): void {
    const animation = this._activeAnimations().get(animationId);
    if (animation) {
      animation.play();
    }
  }

  // ========================================
  // Specialized Animation Methods
  // ========================================

  /**
   * Animate group expand/collapse with content awareness
   */
  async animateExpandCollapse(
    element: HTMLElement,
    collapsed: boolean,
    options: ExpandCollapseOptions = {}
  ): Promise<void> {
    const duration = options.duration || 300;
    const easing = options.easing || 'cubic-bezier(0.4, 0.0, 0.2, 1)';

    if (collapsed) {
      return this.animateCollapse(element, { duration, easing, ...options });
    } else {
      return this.animateExpand(element, { duration, easing, ...options });
    }
  }

  /**
   * Animate group drag operations
   */
  async animateDrag(
    element: HTMLElement,
    phase: 'start' | 'drag' | 'end',
    options: DragAnimationOptions = {}
  ): Promise<void> {
    const config: AnimationConfig = {
      type: 'custom',
      duration: options.duration || 250,
      easing: options.easing || 'ease-out'
    };

    switch (phase) {
      case 'start':
        return this.animateDragStart(element, config);
      case 'drag':
        return this.animateDragMove(element, config);
      case 'end':
        return this.animateDragEnd(element, config);
    }
  }

  /**
   * Animate group reordering with smooth transitions
   */
  async animateReorder(
    elements: HTMLElement[],
    newOrder: number[],
    options: ReorderAnimationOptions = {}
  ): Promise<void> {
    const duration = options.duration || 400;
    const stagger = options.stagger || 50;

    const animations = elements.map((element, index) => {
      const delay = index * stagger;
      return this.animate(element, {
        type: 'move',
        duration,
        delay,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      });
    });

    await Promise.all(animations);
  }

  /**
   * Create coordinated multi-element animations
   */
  async animateSequence(
    animations: SequenceAnimationStep[]
  ): Promise<void> {
    for (const step of animations) {
      const stepAnimations = step.elements.map(element =>
        this.animate(element, step.config)
      );

      if (step.waitForCompletion) {
        await Promise.all(stepAnimations);
      } else {
        // Fire and forget
        Promise.all(stepAnimations).catch(console.warn);
      }

      if (step.delay) {
        await this.delay(step.delay);
      }
    }
  }

  /**
   * Create physics-based spring animations
   */
  async animateSpring(
    element: HTMLElement,
    config: SpringAnimationConfig
  ): Promise<void> {
    const keyframes = this.generateSpringKeyframes(config);
    const duration = this.calculateSpringDuration(config);

    return this.animate(element, {
      type: 'custom',
      keyframes,
      duration,
      easing: 'linear' // Use linear since physics are in keyframes
    });
  }

  // ========================================
  // Performance and Settings
  // ========================================

  /**
   * Set global animation enabled state
   */
  setAnimationsEnabled(enabled: boolean): void {
    this._animationsEnabled.set(enabled);
    if (!enabled) {
      this.cancelAllAnimations();
    }
  }

  /**
   * Set performance mode for animations
   */
  setPerformanceMode(mode: 'high' | 'balanced' | 'low'): void {
    this._globalPerformanceMode.set(mode);
    this.adjustAnimationQuality(mode);
  }

  /**
   * Get animation events stream
   */
  getAnimationEvents(): {
    started$: Observable<AnimationEvent>;
    completed$: Observable<AnimationEvent>;
    error$: Observable<AnimationErrorEvent>;
  } {
    return {
      started$: this.animationStarted$.asObservable(),
      completed$: this.animationCompleted$.asObservable(),
      error$: this.animationError$.asObservable()
    };
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): AnimationPerformanceMetrics {
    return this._performanceMetrics();
  }

  // ========================================
  // Private Implementation Methods
  // ========================================

  private createAnimation(
    element: HTMLElement,
    config: NormalizedAnimationConfig
  ): Animation {
    let keyframes: Keyframe[];
    const options: KeyframeAnimationOptions = {
      duration: config.duration,
      easing: config.easing,
      delay: config.delay || 0,
      fill: 'both'
    };

    switch (config.type) {
      case 'fade':
        keyframes = this.createFadeKeyframes(config);
        break;
      case 'slide':
        keyframes = this.createSlideKeyframes(config);
        break;
      case 'scale':
        keyframes = this.createScaleKeyframes(config);
        break;
      case 'bounce':
        keyframes = this.createBounceKeyframes(config);
        break;
      case 'shake':
        keyframes = this.createShakeKeyframes(config);
        break;
      case 'glow':
        keyframes = this.createGlowKeyframes(config);
        break;
      case 'lift':
        keyframes = this.createLiftKeyframes(config);
        break;
      case 'drop':
        keyframes = this.createDropKeyframes(config);
        break;
      case 'move':
        keyframes = this.createMoveKeyframes(config);
        break;
      case 'custom':
        keyframes = config.keyframes || [];
        break;
      default:
        keyframes = this.createFadeKeyframes(config);
    }

    return element.animate(keyframes, options);
  }

  private createFadeKeyframes(config: NormalizedAnimationConfig): Keyframe[] {
    if (config.collapsed) {
      return [
        { opacity: '1' },
        { opacity: '0' }
      ];
    } else {
      return [
        { opacity: '0' },
        { opacity: '1' }
      ];
    }
  }

  private createSlideKeyframes(config: NormalizedAnimationConfig): Keyframe[] {
    const direction = config.direction || 'down';
    
    if (config.collapsed) {
      // Slide up/out
      switch (direction) {
        case 'up':
          return [
            { transform: 'translateY(0)', maxHeight: '1000px', opacity: '1' },
            { transform: 'translateY(-20px)', maxHeight: '0px', opacity: '0' }
          ];
        case 'down':
          return [
            { transform: 'translateY(0)', maxHeight: '1000px', opacity: '1' },
            { transform: 'translateY(20px)', maxHeight: '0px', opacity: '0' }
          ];
        case 'left':
          return [
            { transform: 'translateX(0)', maxWidth: '1000px', opacity: '1' },
            { transform: 'translateX(-20px)', maxWidth: '0px', opacity: '0' }
          ];
        case 'right':
          return [
            { transform: 'translateX(0)', maxWidth: '1000px', opacity: '1' },
            { transform: 'translateX(20px)', maxWidth: '0px', opacity: '0' }
          ];
      }
    } else {
      // Slide down/in
      switch (direction) {
        case 'up':
          return [
            { transform: 'translateY(-20px)', maxHeight: '0px', opacity: '0' },
            { transform: 'translateY(0)', maxHeight: '1000px', opacity: '1' }
          ];
        case 'down':
          return [
            { transform: 'translateY(20px)', maxHeight: '0px', opacity: '0' },
            { transform: 'translateY(0)', maxHeight: '1000px', opacity: '1' }
          ];
        case 'left':
          return [
            { transform: 'translateX(-20px)', maxWidth: '0px', opacity: '0' },
            { transform: 'translateX(0)', maxWidth: '1000px', opacity: '1' }
          ];
        case 'right':
          return [
            { transform: 'translateX(20px)', maxWidth: '0px', opacity: '0' },
            { transform: 'translateX(0)', maxWidth: '1000px', opacity: '1' }
          ];
      }
    }
    
    return [];
  }

  private createScaleKeyframes(config: NormalizedAnimationConfig): Keyframe[] {
    return [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ];
  }

  private createBounceKeyframes(config: NormalizedAnimationConfig): Keyframe[] {
    return [
      { transform: 'translateY(0)', offset: 0 },
      { transform: 'translateY(-10px)', offset: 0.25 },
      { transform: 'translateY(0)', offset: 0.5 },
      { transform: 'translateY(-5px)', offset: 0.75 },
      { transform: 'translateY(0)', offset: 1 }
    ];
  }

  private createShakeKeyframes(config: NormalizedAnimationConfig): Keyframe[] {
    return [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(0)' }
    ];
  }

  private createGlowKeyframes(config: NormalizedAnimationConfig): Keyframe[] {
    return [
      { boxShadow: '0 0 5px rgba(66, 153, 225, 0.3)' },
      { boxShadow: '0 0 20px rgba(66, 153, 225, 0.6)' },
      { boxShadow: '0 0 5px rgba(66, 153, 225, 0.3)' }
    ];
  }

  private createLiftKeyframes(config: NormalizedAnimationConfig): Keyframe[] {
    return [
      { transform: 'translateY(0) scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
      { transform: 'translateY(-5px) scale(1.02)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }
    ];
  }

  private createDropKeyframes(config: NormalizedAnimationConfig): Keyframe[] {
    return [
      { transform: 'translateY(-5px) scale(1.02)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' },
      { transform: 'translateY(0) scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
    ];
  }

  private createMoveKeyframes(config: NormalizedAnimationConfig): Keyframe[] {
    const { fromX = 0, fromY = 0, toX = 0, toY = 0 } = config;
    return [
      { transform: `translate(${fromX}px, ${fromY}px)` },
      { transform: `translate(${toX}px, ${toY}px)` }
    ];
  }

  private async animateCollapse(element: HTMLElement, options: ExpandCollapseOptions): Promise<void> {
    const content = element.querySelector('.blg-column-group-content') as HTMLElement;
    if (!content) return;

    const originalHeight = content.scrollHeight;
    
    await this.animate(content, {
      type: 'custom',
      keyframes: [
        { 
          maxHeight: `${originalHeight}px`,
          opacity: '1',
          transform: 'scaleY(1)'
        },
        { 
          maxHeight: '0px',
          opacity: '0',
          transform: 'scaleY(0)'
        }
      ],
      duration: options.duration || 300,
      easing: options.easing || 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    });
  }

  private async animateExpand(element: HTMLElement, options: ExpandCollapseOptions): Promise<void> {
    const content = element.querySelector('.blg-column-group-content') as HTMLElement;
    if (!content) return;

    // Temporarily show to measure height
    content.style.visibility = 'hidden';
    content.style.display = 'block';
    const targetHeight = content.scrollHeight;
    content.style.visibility = '';

    await this.animate(content, {
      type: 'custom',
      keyframes: [
        { 
          maxHeight: '0px',
          opacity: '0',
          transform: 'scaleY(0)'
        },
        { 
          maxHeight: `${targetHeight}px`,
          opacity: '1',
          transform: 'scaleY(1)'
        }
      ],
      duration: options.duration || 300,
      easing: options.easing || 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    });
  }

  private async animateDragStart(element: HTMLElement, config: AnimationConfig): Promise<void> {
    return this.animate(element, {
      ...config,
      type: 'custom',
      keyframes: [
        { 
          transform: 'scale(1) rotate(0deg)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: '1'
        },
        { 
          transform: 'scale(1.05) rotate(2deg)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: '1000'
        }
      ]
    });
  }

  private async animateDragMove(element: HTMLElement, config: AnimationConfig): Promise<void> {
    // Continuous animation during drag - typically handled by mouse movement
    return Promise.resolve();
  }

  private async animateDragEnd(element: HTMLElement, config: AnimationConfig): Promise<void> {
    return this.animate(element, {
      ...config,
      type: 'custom',
      keyframes: [
        { 
          transform: 'scale(1.05) rotate(2deg)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: '1000'
        },
        { 
          transform: 'scale(1) rotate(0deg)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: '1'
        }
      ]
    });
  }

  private generateSpringKeyframes(config: SpringAnimationConfig): Keyframe[] {
    // Simplified spring physics - would use more complex calculation in real implementation
    const { tension = 300, friction = 30, mass = 1 } = config;
    const keyframes: Keyframe[] = [];
    const steps = 60; // 60fps assumption
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const displacement = this.springDisplacement(progress, tension, friction, mass);
      
      keyframes.push({
        transform: `translateY(${displacement}px)`,
        offset: progress
      });
    }
    
    return keyframes;
  }

  private springDisplacement(t: number, tension: number, friction: number, mass: number): number {
    // Simplified spring equation
    const omega = Math.sqrt(tension / mass);
    const zeta = friction / (2 * Math.sqrt(mass * tension));
    
    if (zeta < 1) {
      // Underdamped
      const omegaD = omega * Math.sqrt(1 - zeta * zeta);
      return Math.exp(-zeta * omega * t) * Math.cos(omegaD * t);
    } else {
      // Overdamped or critically damped
      return Math.exp(-omega * t);
    }
  }

  private calculateSpringDuration(config: SpringAnimationConfig): number {
    // Calculate duration based on spring parameters
    const { tension = 300, friction = 30 } = config;
    return Math.max(300, Math.min(1000, 1000 / Math.sqrt(tension / 100)));
  }

  private normalizeAnimationConfig(config: AnimationConfig): NormalizedAnimationConfig {
    return {
      type: config.type || 'fade',
      duration: config.duration || 300,
      easing: config.easing || 'ease-out',
      delay: config.delay || 0,
      direction: config.direction,
      collapsed: config.collapsed || false,
      keyframes: config.keyframes,
      fromX: config.fromX,
      fromY: config.fromY,
      toX: config.toX,
      toY: config.toY
    };
  }

  private generateAnimationId(): string {
    return `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupAnimation(animationId: string): void {
    this._activeAnimations.update(map => {
      const newMap = new Map(map);
      newMap.delete(animationId);
      return newMap;
    });
  }

  private updatePerformanceMetrics(animation: Animation): void {
    this._performanceMetrics.update(metrics => ({
      ...metrics,
      animationCount: metrics.animationCount + 1,
      lastFrameTime: performance.now()
    }));
  }

  private sortAnimationQueue(queue: AnimationQueueItem[]): AnimationQueueItem[] {
    return queue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });
  }

  private initializePerformanceMonitoring(): void {
    if (!window.requestAnimationFrame) return;

    let lastTime = performance.now();
    let frameCount = 0;

    const monitorFrame = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = (frameCount * 1000) / (currentTime - lastTime);
        
        this._performanceMetrics.update(metrics => ({
          ...metrics,
          averageFrameRate: fps,
          droppedFrames: Math.max(0, 60 - fps)
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(monitorFrame);
    };

    requestAnimationFrame(monitorFrame);
  }

  private setupReducedMotionDetection(): void {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      this.setAnimationsEnabled(!mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    handleChange(); // Check initial state
  }

  private initializeAnimationQueue(): void {
    // Process queue periodically
    setInterval(() => {
      if (this._animationQueue().length > 0 && this._activeAnimations().size < 5) {
        this.executeQueuedAnimations();
      }
    }, 100);
  }

  private adjustAnimationQuality(mode: 'high' | 'balanced' | 'low'): void {
    // Adjust animation parameters based on performance mode
    switch (mode) {
      case 'high':
        // Full quality animations
        break;
      case 'balanced':
        // Reduced complexity
        break;
      case 'low':
        // Minimal animations
        this._animationsEnabled.set(false);
        break;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ========================================
// Supporting Interfaces and Types
// ========================================

export interface AnimationConfig {
  type?: 'fade' | 'slide' | 'scale' | 'bounce' | 'shake' | 'glow' | 'lift' | 'drop' | 'move' | 'custom';
  duration?: number;
  easing?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  collapsed?: boolean;
  keyframes?: Keyframe[];
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
}

interface NormalizedAnimationConfig extends Required<Omit<AnimationConfig, 'keyframes'>> {
  keyframes?: Keyframe[];
}

export interface ExpandCollapseOptions {
  duration?: number;
  easing?: string;
  stagger?: number;
}

export interface DragAnimationOptions {
  duration?: number;
  easing?: string;
  lift?: number;
  rotation?: number;
}

export interface ReorderAnimationOptions {
  duration?: number;
  stagger?: number;
  easing?: string;
}

export interface SequenceAnimationStep {
  elements: HTMLElement[];
  config: AnimationConfig;
  waitForCompletion?: boolean;
  delay?: number;
}

export interface SpringAnimationConfig {
  tension?: number;
  friction?: number;
  mass?: number;
  velocity?: number;
}

export interface AnimationQueueItem {
  id: string;
  element: HTMLElement;
  config: AnimationConfig;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

export interface AnimationPerformanceMetrics {
  averageFrameRate: number;
  droppedFrames: number;
  animationCount: number;
  lastFrameTime: number;
  memoryUsage: number;
}

export interface AnimationEvent {
  id: string;
  element: HTMLElement;
  config: NormalizedAnimationConfig;
  duration: number;
}

export interface AnimationErrorEvent extends AnimationEvent {
  error: Error;
}