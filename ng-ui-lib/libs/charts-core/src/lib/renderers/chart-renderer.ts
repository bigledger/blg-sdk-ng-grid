/**
 * Chart Renderer Factory and Main Interface
 */

import { BaseRenderer } from './base-renderer';
import { CanvasRenderer } from './canvas-renderer';
import { SVGRenderer } from './svg-renderer';
import { RenderEngine, ChartDimensions } from '../interfaces';

/**
 * Chart renderer factory and main interface
 */
export class ChartRenderer extends BaseRenderer {
  private actualRenderer: BaseRenderer;
  
  constructor(renderEngine: RenderEngine, container: HTMLElement) {
    super(container);
    
    // Create the appropriate renderer based on engine type
    switch (renderEngine) {
      case RenderEngine.CANVAS:
        this.actualRenderer = new CanvasRenderer(container);
        break;
      case RenderEngine.SVG:
        this.actualRenderer = new SVGRenderer(container);
        break;
      case RenderEngine.WEBGL:
        // WebGL renderer would be implemented here
        // For now, fallback to Canvas
        console.warn('WebGL renderer not yet implemented, falling back to Canvas');
        this.actualRenderer = new CanvasRenderer(container);
        break;
      default:
        throw new Error(`Unsupported render engine: ${renderEngine}`);
    }
    
    // Forward events from actual renderer
    this.actualRenderer.events$.subscribe(event => {
      this.emitEvent(event);
    });
  }
  
  initialize(dimensions: ChartDimensions): void {
    this.actualRenderer.initialize(dimensions);
    this.dimensions = dimensions;
    this.isInitialized = true;
  }
  
  render(data: any, config: any, options?: any): void {
    this.actualRenderer.render(data, config, options);
  }
  
  resize(dimensions: ChartDimensions): void {
    this.actualRenderer.resize(dimensions);
    this.dimensions = dimensions;
  }
  
  clear(): void {
    this.actualRenderer.clear();
  }
  
  export(format: 'png' | 'jpg' | 'svg' | 'pdf'): Promise<string | Blob> {
    return this.actualRenderer.export(format);
  }
  
  getDataAtPoint(x: number, y: number): any {
    return this.actualRenderer.getDataAtPoint(x, y);
  }
  
  setDomain(domain: { x?: [any, any]; y?: [any, any] }): void {
    this.actualRenderer.setDomain(domain);
  }
  
  destroy(): void {
    this.actualRenderer.destroy();
    super.destroy();
  }
  
  protected setupEventListeners(): void {
    // Event listeners are handled by the actual renderer
  }
  
  protected cleanup(): void {
    // Cleanup is handled by the actual renderer
  }
}

export * from './base-renderer';
export * from './canvas-renderer';
export * from './svg-renderer';