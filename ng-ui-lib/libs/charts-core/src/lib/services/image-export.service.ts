import { Injectable } from '@angular/core';
import { 
  ChartExportConfig, 
  ExportedFile,
  ImageExportOptions,
  AnimationExportOptions
} from '../interfaces/chart-export';

/**
 * Image Export Service
 * Handles PNG, JPEG, and high-resolution image exports
 */
@Injectable({
  providedIn: 'root'
})
export class ImageExportService {

  /**
   * Export chart as image (PNG or JPEG)
   */
  async export(config: ChartExportConfig, abortSignal?: AbortSignal): Promise<ExportedFile> {
    const options = config.formatOptions as ImageExportOptions;
    const chartElement = this.getChartElement(config);
    
    if (!chartElement) {
      throw new Error('Chart element not found for image export');
    }

    // Check for abort signal
    if (abortSignal?.aborted) {
      throw new Error('Export cancelled');
    }

    try {
      // Create high-resolution canvas
      const canvas = await this.createHighResolutionCanvas(chartElement, options);
      
      // Apply post-processing effects
      await this.applyPostProcessing(canvas, config, options);
      
      // Convert to blob
      const blob = await this.canvasToBlob(canvas, config.format, options.quality);
      
      // Generate filename
      const filename = this.generateFilename(config);
      
      return {
        filename,
        format: config.format,
        size: blob.size,
        data: blob,
        mimeType: this.getMimeType(config.format),
        createdAt: new Date()
      };

    } catch (error) {
      throw new Error(`Image export failed: ${error}`);
    }
  }

  /**
   * Get preview of image export
   */
  async getPreview(config: ChartExportConfig): Promise<string> {
    const options = config.formatOptions as ImageExportOptions;
    const chartElement = this.getChartElement(config);
    
    if (!chartElement) {
      throw new Error('Chart element not found for preview');
    }

    try {
      // Create lower resolution canvas for preview
      const previewOptions = {
        ...options,
        dpi: 72,
        scaleFactor: 1,
        quality: 0.7
      };
      
      const canvas = await this.createHighResolutionCanvas(chartElement, previewOptions);
      return canvas.toDataURL('image/png', 0.8);
      
    } catch (error) {
      throw new Error(`Preview generation failed: ${error}`);
    }
  }

  /**
   * Export animation frames for animated charts
   */
  async exportAnimationFrames(
    config: ChartExportConfig, 
    animationOptions: AnimationExportOptions
  ): Promise<ExportedFile[]> {
    const chartElement = this.getChartElement(config);
    
    if (!chartElement) {
      throw new Error('Chart element not found for animation export');
    }

    const frames: ExportedFile[] = [];
    const totalFrames = Math.ceil(animationOptions.frameDuration * animationOptions.frameRate / 1000);

    for (let frame = 0; frame < totalFrames; frame++) {
      // Animate to frame position
      await this.animateToFrame(chartElement, frame, totalFrames, animationOptions);
      
      // Capture frame
      const frameConfig = {
        ...config,
        filename: `${config.filename}-frame-${frame.toString().padStart(3, '0')}`
      };
      
      const frameFile = await this.export(frameConfig);
      frames.push(frameFile);
    }

    return frames;
  }

  /**
   * Create GIF from animation frames
   */
  async createAnimatedGif(frames: ExportedFile[], options: AnimationExportOptions): Promise<ExportedFile> {
    // This would typically use a library like gif.js
    // For now, return a placeholder implementation
    
    const gifBlob = new Blob([], { type: 'image/gif' });
    
    return {
      filename: 'animated-chart.gif',
      format: 'gif' as any,
      size: gifBlob.size,
      data: gifBlob,
      mimeType: 'image/gif',
      createdAt: new Date()
    };
  }

  /**
   * Create high-resolution canvas from chart element
   */
  private async createHighResolutionCanvas(
    element: HTMLElement, 
    options: ImageExportOptions
  ): Promise<HTMLCanvasElement> {
    const rect = element.getBoundingClientRect();
    const scaleFactor = options.scaleFactor || 1;
    const dpiScale = (options.dpi || 96) / 96;
    const totalScale = scaleFactor * dpiScale;

    // Determine final dimensions
    let finalWidth: number;
    let finalHeight: number;

    if (options.dimensions) {
      finalWidth = options.dimensions.width;
      finalHeight = options.dimensions.height;
      
      if (options.dimensions.maintainAspectRatio) {
        const aspectRatio = rect.width / rect.height;
        if (finalWidth / finalHeight > aspectRatio) {
          finalWidth = finalHeight * aspectRatio;
        } else {
          finalHeight = finalWidth / aspectRatio;
        }
      }
    } else {
      finalWidth = rect.width * totalScale;
      finalHeight = rect.height * totalScale;
    }

    // Create high-resolution canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    
    // Set high-DPI scaling
    ctx.scale(totalScale, totalScale);
    
    // Set background
    if (options.backgroundColor && options.backgroundColor !== 'transparent') {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width / totalScale, canvas.height / totalScale);
    }

    // Render chart content
    await this.renderChartToCanvas(element, ctx, totalScale);

    return canvas;
  }

  /**
   * Render chart element to canvas context
   */
  private async renderChartToCanvas(
    element: HTMLElement, 
    ctx: CanvasRenderingContext2D, 
    scale: number
  ): Promise<void> {
    // Try different rendering methods in order of preference
    
    // Method 1: html2canvas (if available)
    if (this.isHtml2CanvasAvailable()) {
      await this.renderWithHtml2Canvas(element, ctx, scale);
      return;
    }
    
    // Method 2: SVG rendering for SVG-based charts
    const svgElement = element.querySelector('svg');
    if (svgElement) {
      await this.renderSvgToCanvas(svgElement, ctx, scale);
      return;
    }
    
    // Method 3: Canvas-based charts
    const canvasElement = element.querySelector('canvas');
    if (canvasElement) {
      this.renderCanvasToCanvas(canvasElement, ctx, scale);
      return;
    }
    
    // Method 4: WebGL/3D charts
    const webglCanvas = element.querySelector('canvas[data-engine="three"]');
    if (webglCanvas) {
      await this.renderWebGLToCanvas(webglCanvas as HTMLCanvasElement, ctx, scale);
      return;
    }

    // Method 5: DOM to canvas fallback
    await this.renderDomToCanvas(element, ctx, scale);
  }

  /**
   * Render using html2canvas library
   */
  private async renderWithHtml2Canvas(
    element: HTMLElement, 
    ctx: CanvasRenderingContext2D, 
    scale: number
  ): Promise<void> {
    try {
      // @ts-ignore - html2canvas may not be available in types
      const html2canvas = (window as any).html2canvas;
      
      if (!html2canvas) {
        throw new Error('html2canvas not available');
      }

      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
          // Ensure fonts are loaded in cloned document
          this.ensureFontsLoaded(clonedDoc);
        }
      });

      ctx.drawImage(canvas, 0, 0);
    } catch (error) {
      throw new Error(`html2canvas rendering failed: ${error}`);
    }
  }

  /**
   * Render SVG to canvas
   */
  private async renderSvgToCanvas(
    svgElement: SVGElement, 
    ctx: CanvasRenderingContext2D, 
    scale: number
  ): Promise<void> {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const rect = svgElement.getBoundingClientRect();
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Render canvas to canvas
   */
  private renderCanvasToCanvas(
    sourceCanvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    scale: number
  ): void {
    const rect = sourceCanvas.getBoundingClientRect();
    ctx.drawImage(sourceCanvas, 0, 0, rect.width, rect.height);
  }

  /**
   * Render WebGL canvas to canvas
   */
  private async renderWebGLToCanvas(
    webglCanvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    scale: number
  ): Promise<void> {
    // WebGL context needs special handling to preserve drawing buffer
    const gl = webglCanvas.getContext('webgl') || webglCanvas.getContext('webgl2');
    
    if (gl) {
      // Force a redraw to ensure the buffer is fresh
      this.triggerChartRedraw(webglCanvas);
      
      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const rect = webglCanvas.getBoundingClientRect();
    ctx.drawImage(webglCanvas, 0, 0, rect.width, rect.height);
  }

  /**
   * Fallback DOM to canvas rendering
   */
  private async renderDomToCanvas(
    element: HTMLElement, 
    ctx: CanvasRenderingContext2D, 
    scale: number
  ): Promise<void> {
    // Create a simple representation
    const rect = element.getBoundingClientRect();
    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Chart Export', rect.width / 2, rect.height / 2);
  }

  /**
   * Apply post-processing effects
   */
  private async applyPostProcessing(
    canvas: HTMLCanvasElement, 
    config: ChartExportConfig, 
    options: ImageExportOptions
  ): Promise<void> {
    const ctx = canvas.getContext('2d')!;
    
    // Apply watermark if configured
    if (config.watermark?.enabled) {
      await this.applyWatermark(ctx, canvas, config.watermark);
    }
    
    // Apply any additional filters or effects
    if (options.includeAnimationFrames && config.format === 'png') {
      // Add frame indicators or overlays
      this.addFrameOverlay(ctx, canvas);
    }
  }

  /**
   * Apply watermark to canvas
   */
  private async applyWatermark(
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    watermark: any
  ): Promise<void> {
    const { text, position, opacity, fontSize, color, fontFamily } = watermark;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${fontFamily || 'Arial'}`;
    
    // Calculate position
    const metrics = ctx.measureText(text);
    let x: number, y: number;
    
    switch (position) {
      case 'top-left':
        x = 10;
        y = fontSize + 10;
        break;
      case 'top-right':
        x = canvas.width - metrics.width - 10;
        y = fontSize + 10;
        break;
      case 'bottom-left':
        x = 10;
        y = canvas.height - 10;
        break;
      case 'bottom-right':
        x = canvas.width - metrics.width - 10;
        y = canvas.height - 10;
        break;
      case 'center':
      default:
        x = (canvas.width - metrics.width) / 2;
        y = canvas.height / 2;
        break;
    }
    
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /**
   * Add frame overlay for animation exports
   */
  private addFrameOverlay(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Add subtle frame indicator
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  /**
   * Convert canvas to blob
   */
  private async canvasToBlob(
    canvas: HTMLCanvasElement, 
    format: string, 
    quality?: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const mimeType = this.getMimeType(format);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, mimeType, quality);
    });
  }

  /**
   * Animate chart to specific frame
   */
  private async animateToFrame(
    element: HTMLElement, 
    frame: number, 
    totalFrames: number, 
    options: AnimationExportOptions
  ): Promise<void> {
    // This would interact with the chart's animation system
    // Implementation depends on the specific chart library being used
    
    const progress = frame / (totalFrames - 1);
    
    // Trigger animation to specific progress point
    const event = new CustomEvent('animateToProgress', { 
      detail: { progress, frame, totalFrames } 
    });
    element.dispatchEvent(event);
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  /**
   * Get chart element from config
   */
  private getChartElement(config: ChartExportConfig): HTMLElement | null {
    // This would typically receive the chart element reference
    // For now, return a placeholder
    return document.querySelector('[data-chart-export-target]') as HTMLElement;
  }

  /**
   * Generate filename with proper extension
   */
  private generateFilename(config: ChartExportConfig): string {
    const extension = config.format === 'jpeg' ? 'jpg' : config.format;
    return `${config.filename}.${extension}`;
  }

  /**
   * Get MIME type for format
   */
  private getMimeType(format: string): string {
    switch (format) {
      case 'png':
        return 'image/png';
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      default:
        return 'image/png';
    }
  }

  /**
   * Check if html2canvas is available
   */
  private isHtml2CanvasAvailable(): boolean {
    return typeof (window as any).html2canvas !== 'undefined';
  }

  /**
   * Ensure fonts are loaded in cloned document
   */
  private ensureFontsLoaded(doc: Document): void {
    // Copy font-face rules to cloned document
    const styleSheets = Array.from(document.styleSheets);
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        const fontRules = rules.filter(rule => rule.type === CSSRule.FONT_FACE_RULE);
        
        if (fontRules.length > 0) {
          const style = doc.createElement('style');
          style.textContent = fontRules.map(rule => rule.cssText).join('\n');
          doc.head.appendChild(style);
        }
      } catch (error) {
        // Ignore CORS errors for external stylesheets
      }
    });
  }

  /**
   * Trigger chart redraw for WebGL contexts
   */
  private triggerChartRedraw(canvas: HTMLCanvasElement): void {
    // This would interact with the specific chart library's redraw method
    const event = new CustomEvent('forceRedraw');
    canvas.dispatchEvent(event);
  }
}