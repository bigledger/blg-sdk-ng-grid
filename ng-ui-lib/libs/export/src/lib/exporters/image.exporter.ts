import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ExportConfig, ExportResult, ExportFormat } from '../interfaces';
import { ProgressTrackingService } from '../services/progress-tracking.service';

// Type definitions for external libraries
declare global {
  interface Window {
    html2canvas: any;
    fabric: any;
  }
}

/**
 * Image Export Options
 */
export interface ImageExportOptions {
  format: 'png' | 'jpeg' | 'webp' | 'svg';
  quality?: number;
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string;
  pixelRatio?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
  removeContainer?: boolean;
  foreignObjectRendering?: boolean;
}

/**
 * Image Exporter Service
 * 
 * Handles image export (PNG, JPEG, SVG) using html2canvas and other libraries
 */
@Injectable({
  providedIn: 'root'
})
export class ImageExporter {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly progressService = inject(ProgressTrackingService);

  private html2canvas: any = null;
  private fabric: any = null;
  private librariesLoaded = false;

  /**
   * Export to image format
   */
  export(config: ExportConfig): Observable<ExportResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Image export is only supported in browser environment'));
    }

    const format = this.getImageFormat(config.format);
    this.progressService.startProgress('image-export', `Loading libraries for ${format} export`);

    return this.loadLibraries().pipe(
      switchMap(() => {
        this.progressService.updateProgress('image-export', 25, `Preparing ${format} export`);
        
        if (config.element) {
          return this.exportFromElement(config, format);
        } else if (config.data) {
          return this.exportFromData(config, format);
        } else {
          return throwError(() => new Error('Either element or data must be provided for image export'));
        }
      })
    );
  }

  /**
   * Export HTML element to image
   */
  private exportFromElement(config: ExportConfig, format: string): Observable<ExportResult> {
    return new Observable(observer => {
      const element = typeof config.element === 'string' 
        ? document.querySelector(config.element) as HTMLElement
        : config.element as HTMLElement;

      if (!element) {
        observer.error(new Error('Element not found'));
        return;
      }

      this.progressService.updateProgress('image-export', 50, 'Converting element to image');

      const options = this.getImageExportOptions(config, format);

      if (format === 'svg') {
        this.exportToSVG(element, config).then(result => {
          this.progressService.completeProgress('image-export');
          observer.next(result);
          observer.complete();
        }).catch(error => observer.error(error));
      } else {
        this.html2canvas(element, options).then((canvas: HTMLCanvasElement) => {
          this.progressService.updateProgress('image-export', 75, 'Generating image file');

          try {
            const result = this.canvasToResult(canvas, format, config);
            this.progressService.completeProgress('image-export');
            observer.next(result);
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        }).catch((error: Error) => observer.error(error));
      }
    });
  }

  /**
   * Export data to image (creates visualization first)
   */
  private exportFromData(config: ExportConfig, format: string): Observable<ExportResult> {
    return new Observable(observer => {
      try {
        this.progressService.updateProgress('image-export', 50, 'Creating visualization from data');

        const visualElement = this.createVisualizationFromData(config.data, config);
        if (!visualElement) {
          observer.error(new Error('Could not create visualization from data'));
          return;
        }

        // Temporarily add to DOM for rendering
        document.body.appendChild(visualElement);

        const tempConfig = { ...config, element: visualElement };
        
        this.exportFromElement(tempConfig, format).subscribe({
          next: (result) => {
            document.body.removeChild(visualElement);
            observer.next(result);
            observer.complete();
          },
          error: (error) => {
            document.body.removeChild(visualElement);
            observer.error(error);
          }
        });
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Create visualization element from data
   */
  private createVisualizationFromData(data: any, config: ExportConfig): HTMLElement | null {
    if (typeof document === 'undefined') return null;

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.padding = '20px';
    container.style.backgroundColor = config.backgroundColor || 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.width = `${config.width || 800}px`;
    container.style.minHeight = `${config.height || 600}px`;

    if (Array.isArray(data) && data.length > 0) {
      this.createTableVisualization(container, data);
    } else if (typeof data === 'object' && data !== null) {
      if (data.chartType) {
        this.createChartVisualization(container, data);
      } else {
        this.createObjectVisualization(container, data);
      }
    } else {
      this.createTextVisualization(container, data);
    }

    return container;
  }

  /**
   * Create table visualization
   */
  private createTableVisualization(container: HTMLElement, data: any[]): void {
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.border = '1px solid #ddd';

    if (typeof data[0] === 'object') {
      // Create header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headerRow.style.backgroundColor = '#f5f5f5';

      Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        th.style.border = '1px solid #ddd';
        th.style.padding = '10px';
        th.style.fontWeight = 'bold';
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create body
      const tbody = document.createElement('tbody');
      data.forEach((row, index) => {
        const tr = document.createElement('tr');
        if (index % 2 === 1) {
          tr.style.backgroundColor = '#f9f9f9';
        }

        Object.values(row).forEach(value => {
          const td = document.createElement('td');
          td.textContent = String(value);
          td.style.border = '1px solid #ddd';
          td.style.padding = '8px';
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
    }

    container.appendChild(table);
  }

  /**
   * Create chart visualization (simple bar chart)
   */
  private createChartVisualization(container: HTMLElement, data: any): void {
    const chartContainer = document.createElement('div');
    chartContainer.style.width = '100%';
    chartContainer.style.height = '400px';
    chartContainer.style.position = 'relative';

    // Create title
    if (data.title) {
      const title = document.createElement('h2');
      title.textContent = data.title;
      title.style.textAlign = 'center';
      title.style.marginBottom = '20px';
      chartContainer.appendChild(title);
    }

    // Create simple bar chart using CSS
    if (data.series && Array.isArray(data.series)) {
      const chartArea = document.createElement('div');
      chartArea.style.display = 'flex';
      chartArea.style.alignItems = 'flex-end';
      chartArea.style.height = '300px';
      chartArea.style.padding = '20px';
      chartArea.style.border = '1px solid #ddd';

      const maxValue = Math.max(...data.series.map((item: any) => item.value));

      data.series.forEach((item: any, index: number) => {
        const barContainer = document.createElement('div');
        barContainer.style.display = 'flex';
        barContainer.style.flexDirection = 'column';
        barContainer.style.alignItems = 'center';
        barContainer.style.margin = '0 5px';
        barContainer.style.flex = '1';

        const bar = document.createElement('div');
        const height = (item.value / maxValue) * 250;
        bar.style.width = '30px';
        bar.style.height = `${height}px`;
        bar.style.backgroundColor = `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
        bar.style.marginBottom = '5px';

        const label = document.createElement('div');
        label.textContent = item.name || `Item ${index + 1}`;
        label.style.fontSize = '12px';
        label.style.textAlign = 'center';

        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        chartArea.appendChild(barContainer);
      });

      chartContainer.appendChild(chartArea);
    }

    container.appendChild(chartContainer);
  }

  /**
   * Create object visualization
   */
  private createObjectVisualization(container: HTMLElement, data: any): void {
    const objectContainer = document.createElement('div');
    objectContainer.style.padding = '20px';

    Object.entries(data).forEach(([key, value]) => {
      const row = document.createElement('div');
      row.style.marginBottom = '10px';
      row.style.borderBottom = '1px solid #eee';
      row.style.paddingBottom = '10px';

      const keyElement = document.createElement('strong');
      keyElement.textContent = key + ': ';
      keyElement.style.display = 'inline-block';
      keyElement.style.minWidth = '150px';

      const valueElement = document.createElement('span');
      valueElement.textContent = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);

      row.appendChild(keyElement);
      row.appendChild(valueElement);
      objectContainer.appendChild(row);
    });

    container.appendChild(objectContainer);
  }

  /**
   * Create text visualization
   */
  private createTextVisualization(container: HTMLElement, data: any): void {
    const textElement = document.createElement('div');
    textElement.style.padding = '20px';
    textElement.style.fontSize = '16px';
    textElement.style.lineHeight = '1.5';
    textElement.textContent = String(data);
    container.appendChild(textElement);
  }

  /**
   * Export to SVG format
   */
  private async exportToSVG(element: HTMLElement, config: ExportConfig): Promise<ExportResult> {
    try {
      const svgString = await this.elementToSVG(element, config);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });

      return {
        success: true,
        data: blob,
        size: blob.size,
        metadata: {
          format: 'svg',
          width: config.width,
          height: config.height
        }
      };
    } catch (error) {
      throw new Error(`SVG export failed: ${error}`);
    }
  }

  /**
   * Convert element to SVG string
   */
  private async elementToSVG(element: HTMLElement, config: ExportConfig): Promise<string> {
    const rect = element.getBoundingClientRect();
    const width = config.width || rect.width;
    const height = config.height || rect.height;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Create foreignObject to contain HTML
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('width', '100%');
    foreignObject.setAttribute('height', '100%');

    // Clone the element and its styles
    const clonedElement = element.cloneNode(true) as HTMLElement;
    this.inlineStyles(clonedElement);

    foreignObject.appendChild(clonedElement);
    svg.appendChild(foreignObject);

    return new XMLSerializer().serializeToString(svg);
  }

  /**
   * Inline styles for SVG export
   */
  private inlineStyles(element: HTMLElement): void {
    const computedStyle = window.getComputedStyle(element);
    const inlineStyle = Array.from(computedStyle).map(property => {
      return `${property}: ${computedStyle.getPropertyValue(property)};`;
    }).join(' ');

    element.setAttribute('style', inlineStyle);

    // Process child elements
    Array.from(element.children).forEach(child => {
      if (child instanceof HTMLElement) {
        this.inlineStyles(child);
      }
    });
  }

  /**
   * Convert canvas to export result
   */
  private canvasToResult(canvas: HTMLCanvasElement, format: string, config: ExportConfig): ExportResult {
    const mimeType = this.getMimeType(format);
    const quality = config.quality || (format === 'jpeg' ? 0.85 : 1.0);

    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to convert canvas to blob');
      }
    }, mimeType, quality);

    // Synchronous version for immediate return
    const dataUrl = canvas.toDataURL(mimeType, quality);
    const blob = this.dataUrlToBlob(dataUrl);

    return {
      success: true,
      data: blob,
      url: dataUrl,
      size: blob.size,
      metadata: {
        format,
        width: canvas.width,
        height: canvas.height,
        quality
      }
    };
  }

  /**
   * Convert data URL to blob
   */
  private dataUrlToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  /**
   * Get image format from export format
   */
  private getImageFormat(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.PNG:
        return 'png';
      case ExportFormat.JPEG:
        return 'jpeg';
      case ExportFormat.SVG:
        return 'svg';
      default:
        return 'png';
    }
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
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'image/png';
    }
  }

  /**
   * Get image export options
   */
  private getImageExportOptions(config: ExportConfig, format: string): any {
    return {
      scale: config.scale || 2,
      width: config.width,
      height: config.height,
      useCORS: config.useCORS !== false,
      allowTaint: config.allowTaint || false,
      backgroundColor: config.backgroundColor || (format === 'jpeg' ? '#ffffff' : null),
      removeContainer: true,
      foreignObjectRendering: format === 'svg',
      pixelRatio: config.pixelRatio || window.devicePixelRatio || 1,
      logging: false,
      imageTimeout: 15000
    };
  }

  /**
   * Load required libraries
   */
  private loadLibraries(): Observable<boolean> {
    if (this.librariesLoaded && this.html2canvas) {
      return from(Promise.resolve(true));
    }

    return from(this.loadLibrariesAsync());
  }

  private async loadLibrariesAsync(): Promise<boolean> {
    try {
      // Load html2canvas
      if (!this.html2canvas && !window.html2canvas) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        this.html2canvas = window.html2canvas;
      } else {
        this.html2canvas = window.html2canvas;
      }

      this.librariesLoaded = true;
      return true;
    } catch (error) {
      throw new Error(`Failed to load image export libraries: ${error}`);
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Capture screenshot of entire page
   */
  captureFullPage(options?: Partial<ImageExportOptions>): Observable<ExportResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Screenshot capture is only supported in browser environment'));
    }

    const config: ExportConfig = {
      format: ExportFormat.PNG,
      filename: 'fullpage-screenshot',
      element: document.body,
      ...options
    };

    return this.export(config);
  }

  /**
   * Capture screenshot of specific area
   */
  captureArea(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    options?: Partial<ImageExportOptions>
  ): Observable<ExportResult> {
    // Create a temporary element that covers the specified area
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.left = `${x}px`;
    tempElement.style.top = `${y}px`;
    tempElement.style.width = `${width}px`;
    tempElement.style.height = `${height}px`;
    tempElement.style.pointerEvents = 'none';
    tempElement.style.border = '1px dashed red';

    document.body.appendChild(tempElement);

    const config: ExportConfig = {
      format: ExportFormat.PNG,
      filename: 'area-screenshot',
      element: tempElement,
      width,
      height,
      ...options
    };

    return this.export(config).pipe(
      map(result => {
        document.body.removeChild(tempElement);
        return result;
      })
    );
  }
}