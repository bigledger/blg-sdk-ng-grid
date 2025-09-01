/**
 * Base Renderer Abstract Class
 * Defines common interface for all chart renderers (Canvas, SVG, WebGL)
 */

import { Subject, Observable } from 'rxjs';
import { ChartConfig, ChartDataset, ChartEvents, ChartDimensions } from '../interfaces';

/**
 * Render context interface
 */
export interface RenderContext {
  element: HTMLCanvasElement | SVGElement | HTMLElement;
  width: number;
  height: number;
  devicePixelRatio: number;
  context?: CanvasRenderingContext2D | WebGL2RenderingContext | null;
}

/**
 * Render options
 */
export interface RenderOptions {
  clearBefore?: boolean;
  animated?: boolean;
  duration?: number;
  preserveAspectRatio?: boolean;
}

/**
 * Abstract base renderer class
 */
export abstract class BaseRenderer {
  protected container: HTMLElement;
  protected renderContext!: RenderContext;
  protected dimensions: ChartDimensions = { width: 0, height: 0 };
  protected isInitialized = false;
  
  // Event handling
  protected eventSubject = new Subject<ChartEvents>();
  public readonly events$: Observable<ChartEvents> = this.eventSubject.asObservable();
  
  constructor(container: HTMLElement) {
    this.container = container;
  }
  
  /**
   * Initialize the renderer
   */
  abstract initialize(dimensions: ChartDimensions): void;
  
  /**
   * Render the chart
   */
  abstract render(data: ChartDataset, config: ChartConfig, options?: RenderOptions): void;
  
  /**
   * Resize the renderer
   */
  abstract resize(dimensions: ChartDimensions): void;
  
  /**
   * Clear the renderer
   */
  abstract clear(): void;
  
  /**
   * Export chart as image or data
   */
  abstract export(format: 'png' | 'jpg' | 'svg' | 'pdf'): Promise<string | Blob>;
  
  /**
   * Get data at specific coordinates
   */
  abstract getDataAtPoint(x: number, y: number): any;
  
  /**
   * Set domain for zoom/pan
   */
  abstract setDomain(domain: { x?: [any, any]; y?: [any, any] }): void;
  
  /**
   * Destroy the renderer
   */
  destroy(): void {
    this.eventSubject.complete();
    this.cleanup();
  }
  
  /**
   * Get current dimensions
   */
  getDimensions(): ChartDimensions {
    return { ...this.dimensions };
  }
  
  /**
   * Check if renderer is initialized
   */
  getInitialized(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Get render context
   */
  getRenderContext(): RenderContext | null {
    return this.renderContext || null;
  }
  
  /**
   * Emit chart event
   */
  protected emitEvent(event: ChartEvents): void {
    this.eventSubject.next(event);
  }
  
  /**
   * Calculate device pixel ratio adjusted dimensions
   */
  protected getScaledDimensions(dimensions: ChartDimensions): ChartDimensions {
    const dpr = window.devicePixelRatio || 1;
    return {
      width: dimensions.width * dpr,
      height: dimensions.height * dpr,
      margin: dimensions.margin,
      padding: dimensions.padding
    };
  }
  
  /**
   * Setup event listeners
   */
  protected abstract setupEventListeners(): void;
  
  /**
   * Cleanup resources
   */
  protected abstract cleanup(): void;
}