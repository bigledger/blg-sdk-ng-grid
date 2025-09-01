/**
 * Canvas Renderer Implementation
 * High-performance rendering using HTML5 Canvas API
 */

import { BaseRenderer, RenderContext, RenderOptions } from './base-renderer';
import { ChartConfig, ChartDataset, ChartDimensions, ChartEvent } from '../interfaces';

/**
 * Canvas-based chart renderer
 */
export class CanvasRenderer extends BaseRenderer {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId?: number;
  private isAnimating = false;
  
  // Offscreen canvas for better performance
  private offscreenCanvas?: HTMLCanvasElement;
  private offscreenCtx?: CanvasRenderingContext2D;
  
  // Path cache for hit detection
  private pathCache = new Map<string, Path2D>();
  private hitAreas = new Map<string, { path: Path2D; data: any }>();
  
  /**
   * Initialize canvas renderer
   */
  initialize(dimensions: ChartDimensions): void {
    this.dimensions = dimensions;
    
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.maxHeight = '100%';
    
    // Get 2D context
    this.ctx = this.canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // For better performance
      willReadFrequently: false
    })!;
    
    if (!this.ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    
    // Setup high-DPI support
    this.setupHighDPI();
    
    // Setup offscreen canvas for complex operations
    this.setupOffscreenCanvas();
    
    // Add canvas to container
    this.container.appendChild(this.canvas);
    
    // Setup render context
    this.renderContext = {
      element: this.canvas,
      width: this.canvas.width,
      height: this.canvas.height,
      devicePixelRatio: window.devicePixelRatio || 1,
      context: this.ctx
    };
    
    // Setup event listeners
    this.setupEventListeners();
    
    this.isInitialized = true;
  }
  
  /**
   * Render chart data
   */
  render(data: ChartDataset, config: ChartConfig, options: RenderOptions = {}): void {
    if (!this.isInitialized) {
      throw new Error('Renderer not initialized');
    }
    
    // Clear previous render if needed
    if (options.clearBefore !== false) {
      this.clear();
    }
    
    // Clear hit areas for new render
    this.hitAreas.clear();
    this.pathCache.clear();
    
    // Save context state
    this.ctx.save();
    
    try {
      // Setup rendering properties
      this.setupRenderingProperties(config);
      
      // Render background
      this.renderBackground(config);
      
      // Apply margins and padding
      this.applyLayout(config);
      
      // Render axes
      this.renderAxes(config);
      
      // Render grid lines
      this.renderGrid(config);
      
      // Render data series
      this.renderSeries(data, config);
      
      // Render annotations
      this.renderAnnotations(config);
      
    } finally {
      // Restore context state
      this.ctx.restore();
    }
  }
  
  /**
   * Resize the canvas
   */
  resize(dimensions: ChartDimensions): void {
    this.dimensions = dimensions;
    this.setupHighDPI();
    
    if (this.offscreenCanvas && this.offscreenCtx) {
      this.setupOffscreenCanvas();
    }
    
    // Update render context
    this.renderContext.width = this.canvas.width;
    this.renderContext.height = this.canvas.height;
  }
  
  /**
   * Clear the canvas
   */
  clear(): void {
    if (!this.ctx) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Clear offscreen canvas if it exists
    if (this.offscreenCtx && this.offscreenCanvas) {
      this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    }
  }
  
  /**
   * Export canvas as image
   */
  export(format: 'png' | 'jpg' | 'svg' | 'pdf'): Promise<string | Blob> {
    return new Promise((resolve, reject) => {
      try {
        if (format === 'svg') {
          // For SVG, we need to recreate the drawing using SVG commands
          // This is complex and would require a separate implementation
          reject(new Error('SVG export not supported in Canvas renderer'));
          return;
        }
        
        if (format === 'pdf') {
          // PDF export would require a PDF library
          reject(new Error('PDF export not supported in Canvas renderer'));
          return;
        }
        
        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpg' ? 0.9 : undefined;
        
        this.canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to export canvas'));
          }
        }, mimeType, quality);
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Get data at specific coordinates
   */
  getDataAtPoint(x: number, y: number): any {
    const dpr = window.devicePixelRatio || 1;
    const scaledX = x * dpr;
    const scaledY = y * dpr;
    
    // Check hit areas
    for (const [key, hitArea] of this.hitAreas) {
      if (this.ctx.isPointInPath(hitArea.path, scaledX, scaledY)) {
        return hitArea.data;
      }
    }
    
    return null;
  }
  
  /**
   * Set domain for zoom/pan
   */
  setDomain(domain: { x?: [any, any]; y?: [any, any] }): void {
    // Implementation depends on the scale system
    // This would typically update the scales and trigger a re-render
    console.log('Setting domain:', domain);
  }
  
  /**
   * Setup high-DPI support
   */
  private setupHighDPI(): void {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = this.dimensions;
    
    // Set actual canvas size
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    
    // Scale canvas back down using CSS
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    // Scale the drawing context so everything draws at the correct size
    this.ctx.scale(dpr, dpr);
  }
  
  /**
   * Setup offscreen canvas for complex operations
   */
  private setupOffscreenCanvas(): void {
    const { width, height } = this.dimensions;
    
    if ('OffscreenCanvas' in window) {
      // Use OffscreenCanvas if available (better performance)
      this.offscreenCanvas = new OffscreenCanvas(width, height) as any;
    } else {
      // Fallback to regular canvas
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
    
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
  }
  
  /**
   * Setup rendering properties
   */
  private setupRenderingProperties(config: ChartConfig): void {
    // Set default font
    this.ctx.font = '12px Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    // Set rendering quality
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Set line properties
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
  }
  
  /**
   * Render background
   */
  private renderBackground(config: ChartConfig): void {
    const { width, height } = this.dimensions;
    
    // Fill with background color if specified
    const theme = typeof config.theme === 'object' ? config.theme : null;
    if (theme?.colors.background) {
      this.ctx.fillStyle = theme.colors.background;
      this.ctx.fillRect(0, 0, width, height);
    }
  }
  
  /**
   * Apply layout constraints (margins, padding)
   */
  private applyLayout(config: ChartConfig): void {
    const margin = config.dimensions.margin || { top: 20, right: 20, bottom: 40, left: 50 };
    
    // Translate context to account for margins
    this.ctx.translate(margin.left, margin.top);
  }
  
  /**
   * Render axes
   */
  private renderAxes(config: ChartConfig): void {
    const axes = config.axes || [];
    const { width, height } = this.dimensions;
    const margin = config.dimensions.margin || { top: 20, right: 20, bottom: 40, left: 50 };
    
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = '#333';
    
    axes.forEach(axis => {
      if (!axis.visible) return;
      
      switch (axis.position) {
        case 'bottom':
          this.renderBottomAxis(axis, plotWidth, plotHeight);
          break;
        case 'top':
          this.renderTopAxis(axis, plotWidth);
          break;
        case 'left':
          this.renderLeftAxis(axis, plotHeight);
          break;
        case 'right':
          this.renderRightAxis(axis, plotWidth, plotHeight);
          break;
      }
    });
  }
  
  /**
   * Render bottom axis
   */
  private renderBottomAxis(axis: any, width: number, height: number): void {
    // Draw axis line
    this.ctx.beginPath();
    this.ctx.moveTo(0, height);
    this.ctx.lineTo(width, height);
    this.ctx.stroke();
    
    // Draw ticks and labels
    const tickCount = axis.tickCount || 5;
    for (let i = 0; i <= tickCount; i++) {
      const x = (i / tickCount) * width;
      
      // Tick mark
      this.ctx.beginPath();
      this.ctx.moveTo(x, height);
      this.ctx.lineTo(x, height + 5);
      this.ctx.stroke();
      
      // Tick label
      const label = `${i}`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(label, x, height + 10);
    }
    
    // Axis label
    if (axis.label) {
      this.ctx.textAlign = 'center';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillText(axis.label, width / 2, height + 35);
      this.ctx.font = '12px Arial';
    }
  }
  
  /**
   * Render left axis
   */
  private renderLeftAxis(axis: any, height: number): void {
    // Draw axis line
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, height);
    this.ctx.stroke();
    
    // Draw ticks and labels
    const tickCount = axis.tickCount || 5;
    for (let i = 0; i <= tickCount; i++) {
      const y = height - (i / tickCount) * height;
      
      // Tick mark
      this.ctx.beginPath();
      this.ctx.moveTo(-5, y);
      this.ctx.lineTo(0, y);
      this.ctx.stroke();
      
      // Tick label
      const label = `${i * 100}`;
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(label, -10, y);
    }
    
    // Axis label (rotated)
    if (axis.label) {
      this.ctx.save();
      this.ctx.translate(-40, height / 2);
      this.ctx.rotate(-Math.PI / 2);
      this.ctx.textAlign = 'center';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillText(axis.label, 0, 0);
      this.ctx.restore();
      this.ctx.font = '12px Arial';
    }
  }
  
  /**
   * Render top axis
   */
  private renderTopAxis(axis: any, width: number): void {
    // Implementation for top axis
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(width, 0);
    this.ctx.stroke();
  }
  
  /**
   * Render right axis
   */
  private renderRightAxis(axis: any, width: number, height: number): void {
    // Implementation for right axis
    this.ctx.beginPath();
    this.ctx.moveTo(width, 0);
    this.ctx.lineTo(width, height);
    this.ctx.stroke();
  }
  
  /**
   * Render grid lines
   */
  private renderGrid(config: ChartConfig): void {
    const axes = config.axes || [];
    const { width, height } = this.dimensions;
    const margin = config.dimensions.margin || { top: 20, right: 20, bottom: 40, left: 50 };
    
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    this.ctx.strokeStyle = '#e1e5e9';
    this.ctx.lineWidth = 0.5;
    
    axes.forEach(axis => {
      if (!axis.gridLines) return;
      
      const tickCount = axis.tickCount || 5;
      
      if (axis.position === 'bottom' || axis.position === 'top') {
        // Vertical grid lines
        for (let i = 0; i <= tickCount; i++) {
          const x = (i / tickCount) * plotWidth;
          this.ctx.beginPath();
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, plotHeight);
          this.ctx.stroke();
        }
      } else {
        // Horizontal grid lines
        for (let i = 0; i <= tickCount; i++) {
          const y = plotHeight - (i / tickCount) * plotHeight;
          this.ctx.beginPath();
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(plotWidth, y);
          this.ctx.stroke();
        }
      }
    });
  }
  
  /**
   * Render data series
   */
  private renderSeries(data: ChartDataset, config: ChartConfig): void {
    const { width, height } = this.dimensions;
    const margin = config.dimensions.margin || { top: 20, right: 20, bottom: 40, left: 50 };
    
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    // This is a simplified implementation
    // Real implementation would use scales and handle different chart types
    data.series.forEach((series, seriesIndex) => {
      if (!series.visible) return;
      
      const color = series.color || config.colors?.[seriesIndex] || '#007bff';
      this.ctx.strokeStyle = color;
      this.ctx.fillStyle = color;
      this.ctx.lineWidth = 2;
      
      // Create path for hit detection
      const path = new Path2D();
      
      if (series.data.length > 0) {
        this.ctx.beginPath();
        path.moveTo(0, plotHeight);
        
        series.data.forEach((point, index) => {
          const x = (index / (series.data.length - 1)) * plotWidth;
          const y = plotHeight - (Number(point.y) / 100) * plotHeight;
          
          if (index === 0) {
            this.ctx.moveTo(x, y);
            path.moveTo(x, y);
          } else {
            this.ctx.lineTo(x, y);
            path.lineTo(x, y);
          }
        });
        
        this.ctx.stroke();
        
        // Store hit area
        this.hitAreas.set(`series-${seriesIndex}`, {
          path,
          data: { seriesId: series.id, series }
        });
      }
    });
  }
  
  /**
   * Render annotations
   */
  private renderAnnotations(config: ChartConfig): void {
    // Implementation for annotations like tooltips, markers, etc.
  }
  
  /**
   * Setup event listeners
   */
  protected setupEventListeners(): void {
    const handleMouseEvent = (event: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const data = this.getDataAtPoint(x, y);
      
      if (event.type === 'click' && data) {
        this.emitEvent({
          type: ChartEvent.CLICK,
          target: this.canvas,
          originalEvent: event,
          timestamp: Date.now(),
          preventDefault: () => event.preventDefault(),
          stopPropagation: () => event.stopPropagation(),
          data: {
            seriesId: data.seriesId,
            dataPointIndex: 0,
            value: data,
            coordinates: { x, y, chartX: x, chartY: y }
          }
        } as any);
      }
    };
    
    this.canvas.addEventListener('click', handleMouseEvent);
    this.canvas.addEventListener('mousemove', handleMouseEvent);
    this.canvas.addEventListener('mouseout', handleMouseEvent);
  }
  
  /**
   * Cleanup resources
   */
  protected cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    this.pathCache.clear();
    this.hitAreas.clear();
  }
}