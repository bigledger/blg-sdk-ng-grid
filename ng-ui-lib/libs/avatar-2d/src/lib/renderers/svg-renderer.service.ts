import { Injectable, signal } from '@angular/core';
import { 
  AvatarConfiguration, 
  BodyLayer, 
  RenderingOptions, 
  Vector2D, 
  ColorRGBA, 
  AvatarState,
  FacialExpression
} from '../interfaces/avatar.interfaces';

/**
 * High-quality SVG-based renderer for 2D avatars
 * Optimized for scalability and print quality
 */
@Injectable({
  providedIn: 'root'
})
export class SvgRendererService {
  private svgElement: SVGSVGElement | null = null;
  private layerGroups = new Map<string, SVGGElement>();
  private animationElements = new Map<string, SVGAnimateElement>();

  private readonly _isInitialized = signal(false);
  private readonly _currentConfig = signal<AvatarConfiguration | null>(null);

  readonly isInitialized = this._isInitialized.asReadonly();
  readonly currentConfig = this._currentConfig.asReadonly();

  constructor() {}

  /**
   * Initialize the SVG renderer
   */
  initialize(container: HTMLElement, options: RenderingOptions): SVGSVGElement {
    // Create SVG element
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgElement.setAttribute('width', options.size.width.toString());
    this.svgElement.setAttribute('height', options.size.height.toString());
    this.svgElement.setAttribute('viewBox', `0 0 ${options.size.width} ${options.size.height}`);
    
    // Set quality attributes
    this.svgElement.setAttribute('shape-rendering', this.getShapeRendering(options.quality));
    if (options.antialiasing) {
      this.svgElement.setAttribute('style', 'image-rendering: auto;');
    }

    // Add background if specified
    if (!options.backgroundTransparent && options.backgroundColor) {
      const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      background.setAttribute('width', '100%');
      background.setAttribute('height', '100%');
      background.setAttribute('fill', this.colorToString(options.backgroundColor));
      this.svgElement.appendChild(background);
    }

    // Create defs for reusable elements
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.createGradients(defs);
    this.createFilters(defs);
    this.svgElement.appendChild(defs);

    container.appendChild(this.svgElement);
    this._isInitialized.set(true);

    return this.svgElement;
  }

  /**
   * Render avatar configuration to SVG
   */
  render(config: AvatarConfiguration, state: AvatarState): void {
    if (!this.svgElement || !this._isInitialized()) {
      throw new Error('SVG renderer not initialized');
    }

    this._currentConfig.set(config);
    this.clearLayers();

    // Sort layers by z-index
    const sortedLayers = [...config.layers].sort((a, b) => a.zIndex - b.zIndex);

    // Render each layer
    for (const layer of sortedLayers) {
      if (!layer.visible || layer.opacity <= 0) continue;

      const layerGroup = this.createLayerGroup(layer);
      
      // Apply facial expression modifications
      const modifiedLayer = this.applyFacialExpression(layer, state.currentExpression);
      
      // Apply gesture modifications
      const finalLayer = this.applyGestureTransforms(modifiedLayer, state);
      
      // Render the layer content
      this.renderLayer(finalLayer, config, layerGroup);
      
      this.svgElement.appendChild(layerGroup);
      this.layerGroups.set(layer.id, layerGroup);
    }
  }

  /**
   * Update specific layer without full re-render
   */
  updateLayer(layerId: string, config: AvatarConfiguration, state: AvatarState): void {
    const layerGroup = this.layerGroups.get(layerId);
    const layer = config.layers.find(l => l.id === layerId);
    
    if (!layerGroup || !layer) return;

    // Clear existing content
    while (layerGroup.firstChild) {
      layerGroup.removeChild(layerGroup.firstChild);
    }

    // Apply modifications and render
    const modifiedLayer = this.applyFacialExpression(layer, state.currentExpression);
    const finalLayer = this.applyGestureTransforms(modifiedLayer, state);
    
    this.renderLayer(finalLayer, config, layerGroup);
  }

  /**
   * Animate facial expression change
   */
  animateExpression(fromExpression: FacialExpression, toExpression: FacialExpression, duration: number): void {
    const config = this._currentConfig();
    if (!config) return;

    // Animate expression-affected layers
    const expressionLayers = config.layers.filter(layer => 
      ['eyes', 'eyebrows', 'mouth'].includes(layer.type)
    );

    for (const layer of expressionLayers) {
      this.animateLayerExpression(layer, fromExpression, toExpression, duration);
    }
  }

  /**
   * Get the shape rendering attribute based on quality
   */
  private getShapeRendering(quality: 'low' | 'medium' | 'high'): string {
    switch (quality) {
      case 'low': return 'optimizeSpeed';
      case 'medium': return 'auto';
      case 'high': return 'geometricPrecision';
    }
  }

  /**
   * Create reusable gradients
   */
  private createGradients(defs: SVGDefsElement): void {
    // Skin gradient
    const skinGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    skinGradient.setAttribute('id', 'skinGradient');
    skinGradient.setAttribute('x1', '0%');
    skinGradient.setAttribute('y1', '0%');
    skinGradient.setAttribute('x2', '0%');
    skinGradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#ffedcc');
    stop1.setAttribute('stop-opacity', '1');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#f0d0a0');
    stop2.setAttribute('stop-opacity', '1');

    skinGradient.appendChild(stop1);
    skinGradient.appendChild(stop2);
    defs.appendChild(skinGradient);

    // Hair gradient
    const hairGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    hairGradient.setAttribute('id', 'hairGradient');
    hairGradient.setAttribute('x1', '0%');
    hairGradient.setAttribute('y1', '0%');
    hairGradient.setAttribute('x2', '0%');
    hairGradient.setAttribute('y2', '100%');

    const hairStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    hairStop1.setAttribute('offset', '0%');
    hairStop1.setAttribute('stop-color', '#8b4513');
    hairStop1.setAttribute('stop-opacity', '1');

    const hairStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    hairStop2.setAttribute('offset', '100%');
    hairStop2.setAttribute('stop-color', '#654321');
    hairStop2.setAttribute('stop-opacity', '1');

    hairGradient.appendChild(hairStop1);
    hairGradient.appendChild(hairStop2);
    defs.appendChild(hairGradient);
  }

  /**
   * Create reusable filters
   */
  private createFilters(defs: SVGDefsElement): void {
    // Soft shadow filter
    const shadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    shadowFilter.setAttribute('id', 'softShadow');
    shadowFilter.setAttribute('x', '-50%');
    shadowFilter.setAttribute('y', '-50%');
    shadowFilter.setAttribute('width', '200%');
    shadowFilter.setAttribute('height', '200%');

    const feGaussian = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussian.setAttribute('in', 'SourceAlpha');
    feGaussian.setAttribute('stdDeviation', '2');
    feGaussian.setAttribute('result', 'blur');

    const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    feOffset.setAttribute('in', 'blur');
    feOffset.setAttribute('dx', '2');
    feOffset.setAttribute('dy', '2');
    feOffset.setAttribute('result', 'offsetBlur');

    const feFlood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
    feFlood.setAttribute('flood-color', '#000000');
    feFlood.setAttribute('flood-opacity', '0.3');

    const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feComposite.setAttribute('in2', 'offsetBlur');
    feComposite.setAttribute('operator', 'in');

    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode1.setAttribute('in', 'offsetBlur');
    
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');

    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);

    shadowFilter.appendChild(feGaussian);
    shadowFilter.appendChild(feOffset);
    shadowFilter.appendChild(feFlood);
    shadowFilter.appendChild(feComposite);
    shadowFilter.appendChild(feMerge);
    defs.appendChild(shadowFilter);
  }

  /**
   * Clear all layer groups
   */
  private clearLayers(): void {
    this.layerGroups.forEach(group => {
      if (group.parentNode) {
        group.parentNode.removeChild(group);
      }
    });
    this.layerGroups.clear();
  }

  /**
   * Create a layer group element
   */
  private createLayerGroup(layer: BodyLayer): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', `layer-${layer.id}`);
    group.setAttribute('opacity', layer.opacity.toString());
    
    // Apply transform
    const transform = this.getLayerTransform(layer);
    if (transform) {
      group.setAttribute('transform', transform);
    }

    return group;
  }

  /**
   * Get transform string for a layer
   */
  private getLayerTransform(layer: BodyLayer): string {
    const { position, anchor, size } = layer;
    
    // Calculate transform origin
    const originX = position.x + (anchor.x * size.width);
    const originY = position.y + (anchor.y * size.height);

    return `translate(${originX}, ${originY})`;
  }

  /**
   * Apply facial expression modifications to a layer
   */
  private applyFacialExpression(layer: BodyLayer, expression: FacialExpression): BodyLayer {
    const modifiedLayer = { ...layer };

    switch (layer.type) {
      case 'eyes':
        const eyeHeight = layer.size.height * expression.eyeState.leftEye.openness;
        modifiedLayer.size = { ...layer.size, height: eyeHeight };
        break;
      
      case 'eyebrows':
        const browOffset = expression.eyebrowState.leftBrow.height * 10;
        modifiedLayer.position = {
          x: layer.position.x,
          y: layer.position.y + browOffset
        };
        break;
      
      case 'mouth':
        const mouthWidth = layer.size.width * expression.mouthState.width;
        const mouthHeight = layer.size.height * (1 + expression.mouthState.openness);
        modifiedLayer.size = { width: mouthWidth, height: mouthHeight };
        
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

    // Similar logic to canvas renderer but for SVG transforms
    return layer; // Simplified for now
  }

  /**
   * Render a layer to its group
   */
  private renderLayer(layer: BodyLayer, config: AvatarConfiguration, group: SVGGElement): void {
    const layerColor = this.getLayerColor(layer, config);

    switch (layer.type) {
      case 'body':
        this.renderSvgBody(layer, layerColor, group);
        break;
      case 'head':
        this.renderSvgHead(layer, layerColor, group);
        break;
      case 'hair':
        this.renderSvgHair(layer, layerColor, group);
        break;
      case 'eyes':
        this.renderSvgEyes(layer, layerColor, group, config);
        break;
      case 'eyebrows':
        this.renderSvgEyebrows(layer, layerColor, group);
        break;
      case 'nose':
        this.renderSvgNose(layer, layerColor, group);
        break;
      case 'mouth':
        this.renderSvgMouth(layer, layerColor, group);
        break;
      case 'hands':
        this.renderSvgHands(layer, layerColor, group);
        break;
      default:
        this.renderSvgDefault(layer, layerColor, group);
    }
  }

  /**
   * Get the effective color for a layer
   */
  private getLayerColor(layer: BodyLayer, config: AvatarConfiguration): ColorRGBA {
    const customColor = config.customizations.clothingColors?.[layer.id];
    if (customColor) return customColor;

    if (['body', 'head', 'hands', 'nose'].includes(layer.type)) {
      return config.customizations.skinColor || config.character.skinTone;
    }

    if (layer.type === 'hair' || layer.type === 'eyebrows') {
      return config.customizations.hairColor || layer.color || { r: 101, g: 67, b: 33 };
    }

    if (layer.type === 'eyes') {
      return config.customizations.eyeColor || layer.color || { r: 70, g: 130, b: 180 };
    }

    return layer.color || { r: 200, g: 200, b: 200 };
  }

  // SVG rendering methods for different body parts
  private renderSvgBody(layer: BodyLayer, color: ColorRGBA, group: SVGGElement): void {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', (-layer.size.width / 2).toString());
    rect.setAttribute('y', '0');
    rect.setAttribute('width', layer.size.width.toString());
    rect.setAttribute('height', layer.size.height.toString());
    rect.setAttribute('rx', (layer.size.width * 0.1).toString());
    rect.setAttribute('fill', 'url(#skinGradient)');
    rect.setAttribute('filter', 'url(#softShadow)');
    group.appendChild(rect);
  }

  private renderSvgHead(layer: BodyLayer, color: ColorRGBA, group: SVGGElement): void {
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ellipse.setAttribute('cx', '0');
    ellipse.setAttribute('cy', '0');
    ellipse.setAttribute('rx', (layer.size.width / 2).toString());
    ellipse.setAttribute('ry', (layer.size.height / 2).toString());
    ellipse.setAttribute('fill', 'url(#skinGradient)');
    ellipse.setAttribute('filter', 'url(#softShadow)');
    group.appendChild(ellipse);
  }

  private renderSvgHair(layer: BodyLayer, color: ColorRGBA, group: SVGGElement): void {
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ellipse.setAttribute('cx', '0');
    ellipse.setAttribute('cy', (layer.size.height / 4).toString());
    ellipse.setAttribute('rx', (layer.size.width / 2).toString());
    ellipse.setAttribute('ry', (layer.size.height / 2).toString());
    ellipse.setAttribute('fill', 'url(#hairGradient)');
    group.appendChild(ellipse);
  }

  private renderSvgEyes(layer: BodyLayer, color: ColorRGBA, group: SVGGElement, config: AvatarConfiguration): void {
    const eyeWidth = layer.size.width / 2;
    const eyeHeight = layer.size.height;
    const eyeSpacing = layer.size.width * 0.3;
    const eyeColor = config.customizations.eyeColor || color;

    // Left eye
    const leftEye = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    leftEye.setAttribute('cx', (-eyeSpacing).toString());
    leftEye.setAttribute('cy', '0');
    leftEye.setAttribute('rx', (eyeWidth / 2).toString());
    leftEye.setAttribute('ry', (eyeHeight / 2).toString());
    leftEye.setAttribute('fill', this.colorToString(eyeColor));
    group.appendChild(leftEye);

    // Right eye
    const rightEye = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rightEye.setAttribute('cx', eyeSpacing.toString());
    rightEye.setAttribute('cy', '0');
    rightEye.setAttribute('rx', (eyeWidth / 2).toString());
    rightEye.setAttribute('ry', (eyeHeight / 2).toString());
    rightEye.setAttribute('fill', this.colorToString(eyeColor));
    group.appendChild(rightEye);

    // Left pupil
    const leftPupil = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    leftPupil.setAttribute('cx', (-eyeSpacing).toString());
    leftPupil.setAttribute('cy', '0');
    leftPupil.setAttribute('rx', (eyeWidth / 4).toString());
    leftPupil.setAttribute('ry', (eyeHeight / 4).toString());
    leftPupil.setAttribute('fill', 'black');
    group.appendChild(leftPupil);

    // Right pupil
    const rightPupil = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rightPupil.setAttribute('cx', eyeSpacing.toString());
    rightPupil.setAttribute('cy', '0');
    rightPupil.setAttribute('rx', (eyeWidth / 4).toString());
    rightPupil.setAttribute('ry', (eyeHeight / 4).toString());
    rightPupil.setAttribute('fill', 'black');
    group.appendChild(rightPupil);
  }

  private renderSvgEyebrows(layer: BodyLayer, color: ColorRGBA, group: SVGGElement): void {
    const browWidth = layer.size.width / 2;
    const browSpacing = layer.size.width * 0.3;

    // Left eyebrow
    const leftBrow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    leftBrow.setAttribute('cx', (-browSpacing).toString());
    leftBrow.setAttribute('cy', '0');
    leftBrow.setAttribute('rx', (browWidth / 2).toString());
    leftBrow.setAttribute('ry', (layer.size.height / 2).toString());
    leftBrow.setAttribute('fill', this.colorToString(color));
    group.appendChild(leftBrow);

    // Right eyebrow
    const rightBrow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rightBrow.setAttribute('cx', browSpacing.toString());
    rightBrow.setAttribute('cy', '0');
    rightBrow.setAttribute('rx', (browWidth / 2).toString());
    rightBrow.setAttribute('ry', (layer.size.height / 2).toString());
    rightBrow.setAttribute('fill', this.colorToString(color));
    group.appendChild(rightBrow);
  }

  private renderSvgNose(layer: BodyLayer, color: ColorRGBA, group: SVGGElement): void {
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ellipse.setAttribute('cx', '0');
    ellipse.setAttribute('cy', '0');
    ellipse.setAttribute('rx', (layer.size.width / 2).toString());
    ellipse.setAttribute('ry', (layer.size.height / 2).toString());
    ellipse.setAttribute('fill', this.colorToString(color));
    group.appendChild(ellipse);
  }

  private renderSvgMouth(layer: BodyLayer, color: ColorRGBA, group: SVGGElement): void {
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ellipse.setAttribute('cx', '0');
    ellipse.setAttribute('cy', '0');
    ellipse.setAttribute('rx', (layer.size.width / 2).toString());
    ellipse.setAttribute('ry', (layer.size.height / 2).toString());
    ellipse.setAttribute('fill', this.colorToString(color));
    group.appendChild(ellipse);
  }

  private renderSvgHands(layer: BodyLayer, color: ColorRGBA, group: SVGGElement): void {
    const handSpacing = layer.size.width * 2;

    // Left hand
    const leftHand = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    leftHand.setAttribute('cx', (-handSpacing).toString());
    leftHand.setAttribute('cy', '0');
    leftHand.setAttribute('rx', (layer.size.width / 2).toString());
    leftHand.setAttribute('ry', (layer.size.height / 2).toString());
    leftHand.setAttribute('fill', this.colorToString(color));
    group.appendChild(leftHand);

    // Right hand
    const rightHand = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rightHand.setAttribute('cx', handSpacing.toString());
    rightHand.setAttribute('cy', '0');
    rightHand.setAttribute('rx', (layer.size.width / 2).toString());
    rightHand.setAttribute('ry', (layer.size.height / 2).toString());
    rightHand.setAttribute('fill', this.colorToString(color));
    group.appendChild(rightHand);
  }

  private renderSvgDefault(layer: BodyLayer, color: ColorRGBA, group: SVGGElement): void {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', (-layer.size.width / 2).toString());
    rect.setAttribute('y', (-layer.size.height / 2).toString());
    rect.setAttribute('width', layer.size.width.toString());
    rect.setAttribute('height', layer.size.height.toString());
    rect.setAttribute('fill', this.colorToString(color));
    group.appendChild(rect);
  }

  /**
   * Animate layer expression change
   */
  private animateLayerExpression(
    layer: BodyLayer, 
    fromExpression: FacialExpression, 
    toExpression: FacialExpression, 
    duration: number
  ): void {
    const layerGroup = this.layerGroups.get(layer.id);
    if (!layerGroup) return;

    // Create animation elements based on layer type and expression changes
    // This is a simplified implementation - full implementation would create
    // SVG animate elements for smooth transitions
    console.log(`Animating ${layer.type} from ${fromExpression.id} to ${toExpression.id}`);
  }

  /**
   * Convert ColorRGBA to CSS string
   */
  private colorToString(color: ColorRGBA): string {
    const alpha = color.a !== undefined ? color.a : 1;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  }

  /**
   * Export SVG as string
   */
  exportAsSvg(): string {
    if (!this.svgElement) throw new Error('SVG renderer not initialized');
    return new XMLSerializer().serializeToString(this.svgElement);
  }

  /**
   * Export SVG as data URL
   */
  exportAsDataUrl(): string {
    const svgString = this.exportAsSvg();
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.clearLayers();
    if (this.svgElement && this.svgElement.parentNode) {
      this.svgElement.parentNode.removeChild(this.svgElement);
    }
    this.svgElement = null;
    this._isInitialized.set(false);
    this._currentConfig.set(null);
  }
}