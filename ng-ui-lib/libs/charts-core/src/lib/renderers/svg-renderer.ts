/**
 * SVG Renderer Implementation
 * Vector-based rendering using SVG DOM manipulation
 */

import { BaseRenderer, RenderContext, RenderOptions } from './base-renderer';
import { ChartConfig, ChartDataset, ChartDimensions, ChartEvent } from '../interfaces';

/**
 * SVG namespace
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * SVG-based chart renderer
 */
export class SVGRenderer extends BaseRenderer {
  private svg!: SVGSVGElement;
  private defs!: SVGDefsElement;
  private plotArea!: SVGGElement;
  private axesGroup!: SVGGElement;
  private dataGroup!: SVGGElement;
  private annotationsGroup!: SVGGElement;
  
  // Element cache for hit detection
  private elementCache = new Map<string, { element: SVGElement; data: any }>();
  
  /**
   * Initialize SVG renderer
   */
  initialize(dimensions: ChartDimensions): void {
    this.dimensions = dimensions;
    
    // Create SVG element
    this.svg = document.createElementNS(SVG_NS, 'svg');
    this.svg.setAttribute('width', dimensions.width.toString());
    this.svg.setAttribute('height', dimensions.height.toString());
    this.svg.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
    this.svg.style.display = 'block';
    this.svg.style.maxWidth = '100%';
    this.svg.style.maxHeight = '100%';
    
    // Create defs for gradients, patterns, etc.
    this.defs = document.createElementNS(SVG_NS, 'defs');
    this.svg.appendChild(this.defs);
    
    // Create main groups in proper order (back to front)
    this.axesGroup = this.createGroup('axes');
    this.dataGroup = this.createGroup('data');
    this.annotationsGroup = this.createGroup('annotations');
    
    // Create plot area group (contains everything with margins applied)
    this.plotArea = this.createGroup('plot-area');
    this.plotArea.appendChild(this.axesGroup);
    this.plotArea.appendChild(this.dataGroup);
    this.plotArea.appendChild(this.annotationsGroup);
    
    this.svg.appendChild(this.plotArea);
    
    // Add SVG to container
    this.container.appendChild(this.svg);
    
    // Setup render context
    this.renderContext = {
      element: this.svg,
      width: dimensions.width,
      height: dimensions.height,
      devicePixelRatio: 1, // SVG is vector-based, no DPI scaling needed
      context: null
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
    
    // Clear element cache for new render
    this.elementCache.clear();
    
    try {
      // Setup SVG properties
      this.setupSVGProperties(config);
      
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
      
      // Setup CSS animations if needed
      if (options.animated && options.duration) {
        this.setupAnimations(options.duration);
      }
      
    } catch (error) {
      console.error('SVG render error:', error);
      throw error;
    }
  }
  
  /**
   * Resize the SVG
   */
  resize(dimensions: ChartDimensions): void {
    this.dimensions = dimensions;
    
    this.svg.setAttribute('width', dimensions.width.toString());
    this.svg.setAttribute('height', dimensions.height.toString());
    this.svg.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
    
    // Update render context
    this.renderContext.width = dimensions.width;
    this.renderContext.height = dimensions.height;
  }
  
  /**
   * Clear the SVG
   */
  clear(): void {
    // Clear all groups
    this.clearGroup(this.axesGroup);
    this.clearGroup(this.dataGroup);
    this.clearGroup(this.annotationsGroup);
    
    // Clear defs
    while (this.defs.firstChild) {
      this.defs.removeChild(this.defs.firstChild);
    }
  }
  
  /**
   * Export SVG
   */
  export(format: 'png' | 'jpg' | 'svg' | 'pdf'): Promise<string | Blob> {
    return new Promise((resolve, reject) => {
      try {
        if (format === 'svg') {
          // For SVG, return the SVG markup
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(this.svg);
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          resolve(blob);
          return;
        }
        
        if (format === 'pdf') {
          // PDF export would require a PDF library
          reject(new Error('PDF export not yet implemented for SVG renderer'));
          return;
        }
        
        // For raster formats, we need to convert SVG to canvas
        this.convertToRaster(format).then(resolve).catch(reject);
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Get data at specific coordinates
   */
  getDataAtPoint(x: number, y: number): any {
    // Use SVG's built-in hit detection
    const element = document.elementFromPoint(
      x + this.svg.getBoundingClientRect().left,
      y + this.svg.getBoundingClientRect().top
    ) as SVGElement;
    
    if (element && element.closest('svg') === this.svg) {
      // Find associated data in cache
      for (const [key, cached] of this.elementCache) {
        if (cached.element === element || cached.element.contains(element)) {
          return cached.data;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Set domain for zoom/pan
   */
  setDomain(domain: { x?: [any, any]; y?: [any, any] }): void {
    // Update viewBox for zoom/pan
    // Implementation depends on the scale system
    console.log('Setting SVG domain:', domain);
  }
  
  /**
   * Create SVG group element
   */
  private createGroup(className: string): SVGGElement {
    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('class', `blg-${className}`);
    return group;
  }
  
  /**
   * Clear all children from a group
   */
  private clearGroup(group: SVGGElement): void {
    while (group.firstChild) {
      group.removeChild(group.firstChild);
    }
  }
  
  /**
   * Setup SVG properties
   */
  private setupSVGProperties(config: ChartConfig): void {
    // Set default styles
    this.svg.style.fontFamily = 'Arial, sans-serif';
    this.svg.style.fontSize = '12px';
    
    // Set accessibility attributes
    if (config.accessibility?.ariaLabel) {
      this.svg.setAttribute('aria-label', config.accessibility.ariaLabel);
    }
    
    if (config.accessibility?.description) {
      this.svg.setAttribute('aria-describedby', 'chart-description');
      
      // Add description element
      const desc = document.createElementNS(SVG_NS, 'desc');
      desc.id = 'chart-description';
      desc.textContent = config.accessibility.description;
      this.svg.insertBefore(desc, this.svg.firstChild);
    }
  }
  
  /**
   * Render background
   */
  private renderBackground(config: ChartConfig): void {
    const { width, height } = this.dimensions;
    
    // Remove existing background
    const existingBg = this.svg.querySelector('.blg-background');
    if (existingBg) {
      existingBg.remove();
    }
    
    // Add background rectangle if theme specifies it
    const theme = typeof config.theme === 'object' ? config.theme : null;
    if (theme?.colors.background) {
      const bg = document.createElementNS(SVG_NS, 'rect');
      bg.setAttribute('class', 'blg-background');
      bg.setAttribute('width', width.toString());
      bg.setAttribute('height', height.toString());
      bg.setAttribute('fill', theme.colors.background);
      this.svg.insertBefore(bg, this.plotArea);
    }
  }
  
  /**
   * Apply layout constraints (margins, padding)
   */
  private applyLayout(config: ChartConfig): void {
    const margin = config.dimensions.margin || { top: 20, right: 20, bottom: 40, left: 50 };
    
    // Transform plot area to account for margins
    this.plotArea.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
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
    
    axes.forEach(axis => {
      if (!axis.visible) return;
      
      const axisGroup = this.createGroup(`axis-${axis.id}`);
      
      switch (axis.position) {
        case 'bottom':
          this.renderBottomAxis(axisGroup, axis, plotWidth, plotHeight);
          break;
        case 'top':
          this.renderTopAxis(axisGroup, axis, plotWidth);
          break;
        case 'left':
          this.renderLeftAxis(axisGroup, axis, plotHeight);
          break;
        case 'right':
          this.renderRightAxis(axisGroup, axis, plotWidth, plotHeight);
          break;
      }
      
      this.axesGroup.appendChild(axisGroup);
    });
  }
  
  /**
   * Render bottom axis
   */
  private renderBottomAxis(group: SVGGElement, axis: any, width: number, height: number): void {
    // Axis line
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', height.toString());
    line.setAttribute('x2', width.toString());
    line.setAttribute('y2', height.toString());
    line.setAttribute('stroke', '#666');
    line.setAttribute('stroke-width', '1');
    group.appendChild(line);
    
    // Ticks and labels
    const tickCount = axis.tickCount || 5;
    for (let i = 0; i <= tickCount; i++) {
      const x = (i / tickCount) * width;
      
      // Tick mark
      const tick = document.createElementNS(SVG_NS, 'line');
      tick.setAttribute('x1', x.toString());
      tick.setAttribute('y1', height.toString());
      tick.setAttribute('x2', x.toString());
      tick.setAttribute('y2', (height + 5).toString());
      tick.setAttribute('stroke', '#666');
      tick.setAttribute('stroke-width', '1');
      group.appendChild(tick);
      
      // Tick label
      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('x', x.toString());
      label.setAttribute('y', (height + 18).toString());
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', '#333');
      label.textContent = i.toString();
      group.appendChild(label);
    }
    
    // Axis label
    if (axis.label) {
      const axisLabel = document.createElementNS(SVG_NS, 'text');
      axisLabel.setAttribute('x', (width / 2).toString());
      axisLabel.setAttribute('y', (height + 35).toString());
      axisLabel.setAttribute('text-anchor', 'middle');
      axisLabel.setAttribute('fill', '#333');
      axisLabel.setAttribute('font-weight', 'bold');
      axisLabel.textContent = axis.label;
      group.appendChild(axisLabel);
    }
  }
  
  /**
   * Render left axis
   */
  private renderLeftAxis(group: SVGGElement, axis: any, height: number): void {
    // Axis line
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', '0');
    line.setAttribute('x2', '0');
    line.setAttribute('y2', height.toString());
    line.setAttribute('stroke', '#666');
    line.setAttribute('stroke-width', '1');
    group.appendChild(line);
    
    // Ticks and labels
    const tickCount = axis.tickCount || 5;
    for (let i = 0; i <= tickCount; i++) {
      const y = height - (i / tickCount) * height;
      
      // Tick mark
      const tick = document.createElementNS(SVG_NS, 'line');
      tick.setAttribute('x1', '-5');
      tick.setAttribute('y1', y.toString());
      tick.setAttribute('x2', '0');
      tick.setAttribute('y2', y.toString());
      tick.setAttribute('stroke', '#666');
      tick.setAttribute('stroke-width', '1');
      group.appendChild(tick);
      
      // Tick label
      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('x', '-10');
      label.setAttribute('y', y.toString());
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('dominant-baseline', 'central');
      label.setAttribute('fill', '#333');
      label.textContent = (i * 100).toString();
      group.appendChild(label);
    }
    
    // Axis label (rotated)
    if (axis.label) {
      const axisLabel = document.createElementNS(SVG_NS, 'text');
      axisLabel.setAttribute('x', '-40');
      axisLabel.setAttribute('y', (height / 2).toString());
      axisLabel.setAttribute('text-anchor', 'middle');
      axisLabel.setAttribute('fill', '#333');
      axisLabel.setAttribute('font-weight', 'bold');
      axisLabel.setAttribute('transform', `rotate(-90, -40, ${height / 2})`);
      axisLabel.textContent = axis.label;
      group.appendChild(axisLabel);
    }
  }
  
  /**
   * Render top axis
   */
  private renderTopAxis(group: SVGGElement, axis: any, width: number): void {
    // Implementation for top axis
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', '0');
    line.setAttribute('x2', width.toString());
    line.setAttribute('y2', '0');
    line.setAttribute('stroke', '#666');
    line.setAttribute('stroke-width', '1');
    group.appendChild(line);
  }
  
  /**
   * Render right axis
   */
  private renderRightAxis(group: SVGGElement, axis: any, width: number, height: number): void {
    // Implementation for right axis
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', width.toString());
    line.setAttribute('y1', '0');
    line.setAttribute('x2', width.toString());
    line.setAttribute('y2', height.toString());
    line.setAttribute('stroke', '#666');
    line.setAttribute('stroke-width', '1');
    group.appendChild(line);
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
    
    const gridGroup = this.createGroup('grid');
    
    axes.forEach(axis => {
      if (!axis.gridLines) return;
      
      const tickCount = axis.tickCount || 5;
      
      if (axis.position === 'bottom' || axis.position === 'top') {
        // Vertical grid lines
        for (let i = 0; i <= tickCount; i++) {
          const x = (i / tickCount) * plotWidth;
          const gridLine = document.createElementNS(SVG_NS, 'line');
          gridLine.setAttribute('x1', x.toString());
          gridLine.setAttribute('y1', '0');
          gridLine.setAttribute('x2', x.toString());
          gridLine.setAttribute('y2', plotHeight.toString());
          gridLine.setAttribute('stroke', '#e1e5e9');
          gridLine.setAttribute('stroke-width', '0.5');
          gridGroup.appendChild(gridLine);
        }
      } else {
        // Horizontal grid lines
        for (let i = 0; i <= tickCount; i++) {
          const y = plotHeight - (i / tickCount) * plotHeight;
          const gridLine = document.createElementNS(SVG_NS, 'line');
          gridLine.setAttribute('x1', '0');
          gridLine.setAttribute('y1', y.toString());
          gridLine.setAttribute('x2', plotWidth.toString());
          gridLine.setAttribute('y2', y.toString());
          gridLine.setAttribute('stroke', '#e1e5e9');
          gridLine.setAttribute('stroke-width', '0.5');
          gridGroup.appendChild(gridLine);
        }
      }
    });
    
    // Add grid as first child of axes group (behind axes)
    this.axesGroup.insertBefore(gridGroup, this.axesGroup.firstChild);
  }
  
  /**
   * Render data series
   */
  private renderSeries(data: ChartDataset, config: ChartConfig): void {
    const { width, height } = this.dimensions;
    const margin = config.dimensions.margin || { top: 20, right: 20, bottom: 40, left: 50 };
    
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    data.series.forEach((series, seriesIndex) => {
      if (!series.visible) return;
      
      const seriesGroup = this.createGroup(`series-${seriesIndex}`);
      const color = series.color || config.colors?.[seriesIndex] || '#007bff';
      
      if (series.data.length > 0) {
        // Create path for line
        const path = document.createElementNS(SVG_NS, 'path');
        let pathData = '';
        
        series.data.forEach((point, index) => {
          const x = (index / (series.data.length - 1)) * plotWidth;
          const y = plotHeight - (Number(point.y) / 100) * plotHeight;
          
          if (index === 0) {
            pathData += `M ${x} ${y}`;
          } else {
            pathData += ` L ${x} ${y}`;
          }
        });
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-linecap', 'round');
        
        seriesGroup.appendChild(path);
        
        // Store for hit detection
        this.elementCache.set(`series-${seriesIndex}`, {
          element: path,
          data: { seriesId: series.id, series }
        });
        
        // Add data points
        series.data.forEach((point, index) => {
          const x = (index / (series.data.length - 1)) * plotWidth;
          const y = plotHeight - (Number(point.y) / 100) * plotHeight;
          
          const circle = document.createElementNS(SVG_NS, 'circle');
          circle.setAttribute('cx', x.toString());
          circle.setAttribute('cy', y.toString());
          circle.setAttribute('r', '3');
          circle.setAttribute('fill', color);
          circle.setAttribute('stroke', 'white');
          circle.setAttribute('stroke-width', '1');
          
          seriesGroup.appendChild(circle);
          
          // Store for hit detection
          this.elementCache.set(`point-${seriesIndex}-${index}`, {
            element: circle,
            data: { 
              seriesId: series.id, 
              series, 
              dataPointIndex: index, 
              value: point 
            }
          });
        });
      }
      
      this.dataGroup.appendChild(seriesGroup);
    });
  }
  
  /**
   * Render annotations
   */
  private renderAnnotations(config: ChartConfig): void {
    // Implementation for annotations
  }
  
  /**
   * Setup CSS animations
   */
  private setupAnimations(duration: number): void {
    // Add CSS animation styles
    const style = document.createElement('style');
    style.textContent = `
      .blg-data path {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: blg-draw-line ${duration}ms ease-out forwards;
      }
      
      .blg-data circle {
        opacity: 0;
        animation: blg-fade-in ${duration}ms ease-out ${duration * 0.8}ms forwards;
      }
      
      @keyframes blg-draw-line {
        to {
          stroke-dashoffset: 0;
        }
      }
      
      @keyframes blg-fade-in {
        to {
          opacity: 1;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Remove style after animation completes
    setTimeout(() => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, duration * 1.2);
  }
  
  /**
   * Convert SVG to raster image
   */
  private convertToRaster(format: 'png' | 'jpg'): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = this.dimensions.width;
        canvas.height = this.dimensions.height;
        
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          
          const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const quality = format === 'jpg' ? 0.9 : undefined;
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert SVG to raster'));
            }
          }, mimeType, quality);
        };
        
        img.onerror = () => reject(new Error('Failed to load SVG image'));
        
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(this.svg);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.src = url;
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Setup event listeners
   */
  protected setupEventListeners(): void {
    const handleMouseEvent = (event: MouseEvent) => {
      const target = event.target as SVGElement;
      
      if (target && this.svg.contains(target)) {
        const rect = this.svg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const data = this.getDataAtPoint(x, y);
        
        if (event.type === 'click' && data) {
          this.emitEvent({
            type: ChartEvent.CLICK,
            target: target,
            originalEvent: event,
            timestamp: Date.now(),
            preventDefault: () => event.preventDefault(),
            stopPropagation: () => event.stopPropagation(),
            data: {
              seriesId: data.seriesId,
              dataPointIndex: data.dataPointIndex || 0,
              value: data.value || data,
              coordinates: { x, y, chartX: x, chartY: y }
            }
          } as any);
        }
      }
    };
    
    this.svg.addEventListener('click', handleMouseEvent);
    this.svg.addEventListener('mousemove', handleMouseEvent);
    this.svg.addEventListener('mouseout', handleMouseEvent);
  }
  
  /**
   * Cleanup resources
   */
  protected cleanup(): void {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    
    this.elementCache.clear();
  }
}