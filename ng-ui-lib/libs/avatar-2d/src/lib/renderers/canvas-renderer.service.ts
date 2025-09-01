import { Injectable, signal, computed } from '@angular/core';
import { 
  AvatarConfiguration, 
  BodyLayer, 
  RenderingOptions, 
  Vector2D, 
  ColorRGBA, 
  AvatarState,
  FacialExpression,
  Gesture,
  BodyPartTransform,
  AnimationEasing
} from '../interfaces/avatar.interfaces';

/**
 * High-performance Canvas-based renderer for 2D avatars
 * Optimized for real-time animation and large-scale rendering
 */
@Injectable({
  providedIn: 'root'
})
export class CanvasRendererService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrame: number | null = null;
  private lastFrameTime = 0;
  private fpsCounter = 0;
  private fpsStartTime = 0;

  private readonly _isRendering = signal(false);
  private readonly _fps = signal(0);
  private readonly _renderStats = signal({
    layersRendered: 0,
    renderTime: 0,
    totalFrames: 0
  });

  readonly isRendering = this._isRendering.asReadonly();
  readonly fps = this._fps.asReadonly();
  readonly renderStats = this._renderStats.asReadonly();

  constructor() {}

  /**
   * Initialize the canvas renderer
   */
  initialize(canvas: HTMLCanvasElement, options: RenderingOptions): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: options.backgroundTransparent,
      antialias: options.antialiasing,
      willReadFrequently: false,
      desynchronized: true // For better performance
    });

    if (!this.ctx) {
      throw new Error('Failed to get canvas 2D context');
    }

    // Set canvas size
    this.canvas.width = options.size.width * (window.devicePixelRatio || 1);
    this.canvas.height = options.size.height * (window.devicePixelRatio || 1);
    this.canvas.style.width = `${options.size.width}px`;
    this.canvas.style.height = `${options.size.height}px`;

    // Scale context for high DPI displays
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    // Set quality settings
    this.applyQualitySettings(options.quality);
  }

  /**
   * Start the rendering loop
   */
  startRendering(config: AvatarConfiguration, state: AvatarState): void {
    if (this._isRendering()) return;

    this._isRendering.set(true);
    this.lastFrameTime = performance.now();
    this.fpsStartTime = this.lastFrameTime;
    this.fpsCounter = 0;

    const animate = (currentTime: number) => {
      if (!this._isRendering()) return;

      const deltaTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;

      // Update FPS counter
      this.fpsCounter++;
      if (currentTime - this.fpsStartTime >= 1000) {
        this._fps.set(this.fpsCounter);
        this.fpsCounter = 0;
        this.fpsStartTime = currentTime;
      }

      // Render frame
      const startRender = performance.now();
      this.renderFrame(config, state, deltaTime);
      const renderTime = performance.now() - startRender;

      // Update stats
      this._renderStats.update(stats => ({
        ...stats,
        renderTime,
        totalFrames: stats.totalFrames + 1
      }));

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Stop the rendering loop
   */
  stopRendering(): void {
    this._isRendering.set(false);
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Render a single frame
   */
  private renderFrame(config: AvatarConfiguration, state: AvatarState, deltaTime: number): void {
    if (!this.ctx || !this.canvas) return;

    const startTime = performance.now();

    // Clear canvas
    this.clearCanvas();

    // Sort layers by z-index
    const sortedLayers = [...config.layers].sort((a, b) => a.zIndex - b.zIndex);

    let layersRendered = 0;

    // Render each layer
    for (const layer of sortedLayers) {
      if (!layer.visible || layer.opacity <= 0) continue;

      this.ctx.save();
      
      // Apply layer transforms
      this.applyLayerTransforms(layer, state, deltaTime);
      
      // Apply facial expression modifications
      const modifiedLayer = this.applyFacialExpression(layer, state.currentExpression);
      
      // Apply gesture modifications
      const finalLayer = this.applyGestureTransforms(modifiedLayer, state);
      
      // Render the layer
      this.renderLayer(finalLayer, config);
      
      this.ctx.restore();
      layersRendered++;
    }

    // Update render stats
    this._renderStats.update(stats => ({
      ...stats,
      layersRendered
    }));
  }

  /**
   * Clear the canvas
   */
  private clearCanvas(): void {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Apply quality settings to the canvas context
   */
  private applyQualitySettings(quality: 'low' | 'medium' | 'high'): void {
    if (!this.ctx) return;

    switch (quality) {
      case 'low':
        this.ctx.imageSmoothingEnabled = false;
        break;
      case 'medium':
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'medium';
        break;
      case 'high':
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        break;
    }
  }

  /**
   * Apply transforms to a layer
   */
  private applyLayerTransforms(layer: BodyLayer, state: AvatarState, deltaTime: number): void {
    if (!this.ctx) return;

    const { position, anchor, size } = layer;
    
    // Calculate transform origin
    const originX = position.x + (anchor.x * size.width);
    const originY = position.y + (anchor.y * size.height);

    // Translate to origin
    this.ctx.translate(originX, originY);
    
    // Apply opacity
    this.ctx.globalAlpha = layer.opacity;
  }

  /**
   * Apply facial expression modifications to a layer
   */
  private applyFacialExpression(layer: BodyLayer, expression: FacialExpression): BodyLayer {
    const modifiedLayer = { ...layer };

    switch (layer.type) {
      case 'eyes':
        // Modify eye openness based on expression
        const eyeHeight = layer.size.height * expression.eyeState.leftEye.openness;
        modifiedLayer.size = { ...layer.size, height: eyeHeight };
        break;
      
      case 'eyebrows':
        // Modify eyebrow position and angle
        const browOffset = expression.eyebrowState.leftBrow.height * 10;
        modifiedLayer.position = {
          x: layer.position.x,
          y: layer.position.y + browOffset
        };
        break;
      
      case 'mouth':
        // Modify mouth shape based on expression
        const mouthWidth = layer.size.width * expression.mouthState.width;
        const mouthHeight = layer.size.height * (1 + expression.mouthState.openness);
        modifiedLayer.size = { width: mouthWidth, height: mouthHeight };
        
        // Adjust position for corner changes (smile/frown)
        const cornerOffset = expression.mouthState.corners * 3;
        modifiedLayer.position = {
          x: layer.position.x,
          y: layer.position.y - cornerOffset
        };
        break;
    }

    return modifiedLayer;
  }

  /**
   * Apply gesture transforms to a layer
   */
  private applyGestureTransforms(layer: BodyLayer, state: AvatarState): BodyLayer {
    if (!state.currentGesture || !state.isAnimating) return layer;

    const gesture = state.currentGesture;
    const progress = state.gestureProgress;

    // Find the appropriate frames for interpolation
    const currentFrame = this.getGestureFrame(gesture, progress);
    const layerTransform = currentFrame?.bodyParts[layer.id];

    if (!layerTransform) return layer;

    const modifiedLayer = { ...layer };

    // Apply position changes
    if (layerTransform.position) {
      modifiedLayer.position = {
        x: layer.position.x + layerTransform.position.x,
        y: layer.position.y + layerTransform.position.y
      };
    }

    // Apply opacity changes
    if (layerTransform.opacity !== undefined) {
      modifiedLayer.opacity = layer.opacity * layerTransform.opacity;
    }

    return modifiedLayer;
  }

  /**
   * Get the current gesture frame based on progress
   */
  private getGestureFrame(gesture: Gesture, progress: number) {
    const frameIndex = Math.floor(progress * (gesture.frames.length - 1));
    return gesture.frames[frameIndex];
  }

  /**
   * Render a single layer
   */
  private renderLayer(layer: BodyLayer, config: AvatarConfiguration): void {
    if (!this.ctx) return;

    const { position, size, color, spriteSheet } = layer;

    if (spriteSheet) {
      this.renderSpriteLayer(layer);
    } else {
      this.renderShapeLayer(layer, config);
    }
  }

  /**
   * Render a layer using sprite sheet
   */
  private renderSpriteLayer(layer: BodyLayer): void {
    if (!this.ctx || !layer.spriteSheet) return;

    // TODO: Implement sprite sheet rendering
    // This would involve loading the sprite image and drawing specific frames
    console.log('Sprite rendering not yet implemented for layer:', layer.id);
  }

  /**
   * Render a layer using shapes (fallback when no sprite sheet)
   */
  private renderShapeLayer(layer: BodyLayer, config: AvatarConfiguration): void {
    if (!this.ctx) return;

    const { position, size, color } = layer;
    const layerColor = this.getLayerColor(layer, config);

    this.ctx.fillStyle = this.colorToString(layerColor);

    switch (layer.type) {
      case 'body':
        this.renderBody(position, size);
        break;
      case 'head':
        this.renderHead(position, size);
        break;
      case 'hair':
        this.renderHair(position, size);
        break;
      case 'eyes':
        this.renderEyes(position, size, layerColor);
        break;
      case 'eyebrows':
        this.renderEyebrows(position, size);
        break;
      case 'nose':
        this.renderNose(position, size);
        break;
      case 'mouth':
        this.renderMouth(position, size);
        break;
      case 'hands':
        this.renderHands(position, size);
        break;
      default:
        this.renderDefaultShape(position, size);
    }
  }

  /**
   * Get the effective color for a layer (including customizations)
   */
  private getLayerColor(layer: BodyLayer, config: AvatarConfiguration): ColorRGBA {
    const customColor = config.customizations.clothingColors?.[layer.id];
    if (customColor) return customColor;

    // Apply skin color to skin-related layers
    if (['body', 'head', 'hands', 'nose'].includes(layer.type)) {
      return config.customizations.skinColor || config.character.skinTone;
    }

    // Apply hair color to hair layer
    if (layer.type === 'hair' || layer.type === 'eyebrows') {
      return config.customizations.hairColor || layer.color || { r: 101, g: 67, b: 33 };
    }

    // Apply eye color to eyes
    if (layer.type === 'eyes') {
      return config.customizations.eyeColor || layer.color || { r: 70, g: 130, b: 180 };
    }

    return layer.color || { r: 200, g: 200, b: 200 };
  }

  /**
   * Convert ColorRGBA to CSS string
   */
  private colorToString(color: ColorRGBA): string {
    const alpha = color.a !== undefined ? color.a : 1;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  }

  // Rendering methods for different body parts
  private renderBody(position: Vector2D, size: Size2D): void {
    if (!this.ctx) return;
    
    // Render torso as rounded rectangle
    const x = position.x - size.width / 2;
    const y = position.y;
    const radius = size.width * 0.1;

    this.ctx.beginPath();
    this.ctx.roundRect(x, y, size.width, size.height, radius);
    this.ctx.fill();
  }

  private renderHead(position: Vector2D, size: Size2D): void {
    if (!this.ctx) return;
    
    // Render head as oval
    const centerX = position.x;
    const centerY = position.y;
    const radiusX = size.width / 2;
    const radiusY = size.height / 2;

    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderHair(position: Vector2D, size: Size2D): void {
    if (!this.ctx) return;
    
    // Render hair as irregular shape
    const centerX = position.x;
    const centerY = position.y + size.height / 4;
    const radiusX = size.width / 2;
    const radiusY = size.height / 2;

    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderEyes(position: Vector2D, size: Size2D, color: ColorRGBA): void {
    if (!this.ctx) return;
    
    const eyeWidth = size.width / 2;
    const eyeHeight = size.height;
    const eyeSpacing = size.width * 0.3;

    // Left eye
    this.ctx.beginPath();
    this.ctx.ellipse(
      position.x - eyeSpacing,
      position.y,
      eyeWidth / 2,
      eyeHeight / 2,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();

    // Right eye
    this.ctx.beginPath();
    this.ctx.ellipse(
      position.x + eyeSpacing,
      position.y,
      eyeWidth / 2,
      eyeHeight / 2,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();

    // Pupils
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.ellipse(
      position.x - eyeSpacing,
      position.y,
      eyeWidth / 4,
      eyeHeight / 4,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.ellipse(
      position.x + eyeSpacing,
      position.y,
      eyeWidth / 4,
      eyeHeight / 4,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();
  }

  private renderEyebrows(position: Vector2D, size: Size2D): void {
    if (!this.ctx) return;
    
    const browWidth = size.width / 2;
    const browSpacing = size.width * 0.3;

    // Left eyebrow
    this.ctx.beginPath();
    this.ctx.ellipse(
      position.x - browSpacing,
      position.y,
      browWidth / 2,
      size.height / 2,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();

    // Right eyebrow
    this.ctx.beginPath();
    this.ctx.ellipse(
      position.x + browSpacing,
      position.y,
      browWidth / 2,
      size.height / 2,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();
  }

  private renderNose(position: Vector2D, size: Size2D): void {
    if (!this.ctx) return;
    
    // Render nose as small ellipse
    this.ctx.beginPath();
    this.ctx.ellipse(
      position.x,
      position.y,
      size.width / 2,
      size.height / 2,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();
  }

  private renderMouth(position: Vector2D, size: Size2D): void {
    if (!this.ctx) return;
    
    // Render mouth as ellipse
    this.ctx.beginPath();
    this.ctx.ellipse(
      position.x,
      position.y,
      size.width / 2,
      size.height / 2,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();
  }

  private renderHands(position: Vector2D, size: Size2D): void {
    if (!this.ctx) return;
    
    const handSpacing = size.width * 2;

    // Left hand
    this.ctx.beginPath();
    this.ctx.ellipse(
      position.x - handSpacing,
      position.y,
      size.width / 2,
      size.height / 2,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();

    // Right hand
    this.ctx.beginPath();
    this.ctx.ellipse(
      position.x + handSpacing,
      position.y,
      size.width / 2,
      size.height / 2,
      0, 0, Math.PI * 2
    );
    this.ctx.fill();
  }

  private renderDefaultShape(position: Vector2D, size: Size2D): void {
    if (!this.ctx) return;
    
    const x = position.x - size.width / 2;
    const y = position.y - size.height / 2;
    
    this.ctx.fillRect(x, y, size.width, size.height);
  }

  /**
   * Export current canvas as image
   */
  exportAsImage(format: 'png' | 'jpeg' = 'png', quality = 0.9): string {
    if (!this.canvas) throw new Error('Canvas not initialized');
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.stopRendering();
    this.canvas = null;
    this.ctx = null;
  }
}