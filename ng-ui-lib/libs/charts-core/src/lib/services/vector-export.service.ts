import { Injectable } from '@angular/core';
import { 
  ChartExportConfig, 
  ExportedFile,
  VectorExportOptions,
  PdfExportOptions,
  SvgExportOptions
} from '../interfaces/chart-export';

/**
 * Vector Export Service
 * Handles SVG and PDF exports with high-quality vector graphics
 */
@Injectable({
  providedIn: 'root'
})
export class VectorExportService {

  /**
   * Export chart as vector format (SVG or PDF)
   */
  async export(config: ChartExportConfig, abortSignal?: AbortSignal): Promise<ExportedFile> {
    const options = config.formatOptions as VectorExportOptions;
    
    if (abortSignal?.aborted) {
      throw new Error('Export cancelled');
    }

    try {
      if (config.format === 'svg') {
        return await this.exportSvg(config, options);
      } else if (config.format === 'pdf') {
        return await this.exportPdf(config, options);
      } else {
        throw new Error(`Unsupported vector format: ${config.format}`);
      }
    } catch (error) {
      throw new Error(`Vector export failed: ${error}`);
    }
  }

  /**
   * Get preview of vector export
   */
  async getPreview(config: ChartExportConfig): Promise<string> {
    if (config.format === 'svg') {
      const svgContent = await this.generateSvgContent(config);
      return `data:image/svg+xml;base64,${btoa(svgContent)}`;
    } else if (config.format === 'pdf') {
      // For PDF preview, generate a thumbnail
      const svgPreview = await this.generateSvgContent(config);
      return `data:image/svg+xml;base64,${btoa(svgPreview)}`;
    }
    
    throw new Error(`Preview not supported for format: ${config.format}`);
  }

  /**
   * Export as SVG
   */
  private async exportSvg(config: ChartExportConfig, options: VectorExportOptions): Promise<ExportedFile> {
    const svgOptions = options.svgOptions || {};
    const svgContent = await this.generateSvgContent(config, svgOptions);
    
    // Optimize SVG if requested
    const optimizedSvg = this.optimizeSvg(svgContent, options.optimizationLevel || 'basic');
    
    const blob = new Blob([optimizedSvg], { type: 'image/svg+xml' });
    
    return {
      filename: `${config.filename}.svg`,
      format: 'svg',
      size: blob.size,
      data: blob,
      mimeType: 'image/svg+xml',
      createdAt: new Date()
    };
  }

  /**
   * Export as PDF
   */
  private async exportPdf(config: ChartExportConfig, options: VectorExportOptions): Promise<ExportedFile> {
    const pdfOptions = options.pdfOptions || this.getDefaultPdfOptions();
    
    // Generate SVG content first
    const svgContent = await this.generateSvgContent(config);
    
    // Convert SVG to PDF
    const pdfBuffer = await this.svgToPdf(svgContent, pdfOptions);
    
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    
    return {
      filename: `${config.filename}.pdf`,
      format: 'pdf',
      size: blob.size,
      data: blob,
      mimeType: 'application/pdf',
      createdAt: new Date()
    };
  }

  /**
   * Generate SVG content from chart
   */
  private async generateSvgContent(
    config: ChartExportConfig, 
    svgOptions?: SvgExportOptions
  ): Promise<string> {
    const chartElement = this.getChartElement(config);
    
    if (!chartElement) {
      throw new Error('Chart element not found for SVG export');
    }

    // Try to get existing SVG element
    const existingSvg = chartElement.querySelector('svg');
    if (existingSvg) {
      return this.enhanceExistingSvg(existingSvg, config, svgOptions);
    }

    // Generate SVG from canvas if available
    const canvasElement = chartElement.querySelector('canvas');
    if (canvasElement) {
      return this.canvasToSvg(canvasElement, config, svgOptions);
    }

    // Generate SVG from DOM elements
    return this.domToSvg(chartElement, config, svgOptions);
  }

  /**
   * Enhance existing SVG with export options
   */
  private enhanceExistingSvg(
    svgElement: SVGElement, 
    config: ChartExportConfig,
    svgOptions?: SvgExportOptions
  ): string {
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Add XML declaration if requested
    let svgString = new XMLSerializer().serializeToString(clonedSvg);
    
    if (svgOptions?.includeXmlDeclaration !== false) {
      svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
    }

    // Inline styles if requested
    if (svgOptions?.inlineStyles !== false) {
      svgString = this.inlineSvgStyles(svgString, clonedSvg);
    }

    // Add metadata
    if (config.includeMetadata) {
      svgString = this.addSvgMetadata(svgString, config);
    }

    // Add watermark if configured
    if (config.watermark?.enabled) {
      svgString = this.addSvgWatermark(svgString, config.watermark);
    }

    // Pretty print if requested
    if (svgOptions?.prettyPrint) {
      svgString = this.prettyPrintXml(svgString);
    }

    return svgString;
  }

  /**
   * Convert canvas to SVG
   */
  private async canvasToSvg(
    canvasElement: HTMLCanvasElement, 
    config: ChartExportConfig,
    svgOptions?: SvgExportOptions
  ): Promise<string> {
    const rect = canvasElement.getBoundingClientRect();
    
    // Create SVG wrapper
    let svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="${rect.width}" 
           height="${rect.height}"
           viewBox="0 0 ${rect.width} ${rect.height}">
        <image href="${canvasElement.toDataURL()}" 
               width="${rect.width}" 
               height="${rect.height}"/>
      </svg>
    `;

    if (config.includeMetadata) {
      svgContent = this.addSvgMetadata(svgContent, config);
    }

    return svgContent;
  }

  /**
   * Convert DOM elements to SVG
   */
  private domToSvg(
    element: HTMLElement, 
    config: ChartExportConfig,
    svgOptions?: SvgExportOptions
  ): string {
    const rect = element.getBoundingClientRect();
    
    // Create a basic SVG representation
    let svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="${rect.width}" 
           height="${rect.height}"
           viewBox="0 0 ${rect.width} ${rect.height}">
        <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6"/>
        <text x="50%" y="50%" 
              text-anchor="middle" 
              dominant-baseline="middle"
              font-family="Arial, sans-serif" 
              font-size="16" 
              fill="#666">
          Chart Export (${config.format.toUpperCase()})
        </text>
      </svg>
    `;

    if (config.includeMetadata) {
      svgContent = this.addSvgMetadata(svgContent, config);
    }

    return svgContent;
  }

  /**
   * Inline CSS styles in SVG
   */
  private inlineSvgStyles(svgString: string, svgElement: SVGElement): string {
    // Get computed styles for all elements
    const elements = svgElement.querySelectorAll('*');
    
    elements.forEach(element => {
      const computedStyles = window.getComputedStyle(element);
      const relevantStyles = this.extractRelevantStyles(computedStyles);
      
      if (relevantStyles) {
        const currentStyle = element.getAttribute('style') || '';
        element.setAttribute('style', currentStyle + ';' + relevantStyles);
      }
    });

    return new XMLSerializer().serializeToString(svgElement);
  }

  /**
   * Extract relevant CSS styles for SVG
   */
  private extractRelevantStyles(computedStyles: CSSStyleDeclaration): string {
    const relevantProperties = [
      'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap',
      'font-family', 'font-size', 'font-weight', 'font-style',
      'text-anchor', 'dominant-baseline', 'opacity', 'visibility'
    ];

    return relevantProperties
      .map(prop => {
        const value = computedStyles.getPropertyValue(prop);
        return value ? `${prop}: ${value}` : null;
      })
      .filter(Boolean)
      .join('; ');
  }

  /**
   * Add metadata to SVG
   */
  private addSvgMetadata(svgString: string, config: ChartExportConfig): string {
    const metadata = `
      <metadata>
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                 xmlns:dc="http://purl.org/dc/elements/1.1/">
          <rdf:Description>
            <dc:title>Chart Export</dc:title>
            <dc:creator>Chart Export Tool</dc:creator>
            <dc:date>${new Date().toISOString()}</dc:date>
            <dc:format>${config.format}</dc:format>
            <dc:description>Exported chart in ${config.format.toUpperCase()} format</dc:description>
          </rdf:Description>
        </rdf:RDF>
      </metadata>
    `;

    // Insert metadata after opening svg tag
    return svgString.replace(/(<svg[^>]*>)/, `$1\n${metadata}`);
  }

  /**
   * Add watermark to SVG
   */
  private addSvgWatermark(svgString: string, watermark: any): string {
    const { text, position, opacity, fontSize, color, fontFamily } = watermark;
    
    // Parse SVG dimensions
    const dimensionMatch = svgString.match(/width="([^"]*)".*height="([^"]*)"/);
    const width = dimensionMatch ? parseFloat(dimensionMatch[1]) : 800;
    const height = dimensionMatch ? parseFloat(dimensionMatch[2]) : 600;
    
    // Calculate position
    let x: number, y: number, textAnchor: string;
    
    switch (position) {
      case 'top-left':
        x = 10;
        y = fontSize + 10;
        textAnchor = 'start';
        break;
      case 'top-right':
        x = width - 10;
        y = fontSize + 10;
        textAnchor = 'end';
        break;
      case 'bottom-left':
        x = 10;
        y = height - 10;
        textAnchor = 'start';
        break;
      case 'bottom-right':
        x = width - 10;
        y = height - 10;
        textAnchor = 'end';
        break;
      case 'center':
      default:
        x = width / 2;
        y = height / 2;
        textAnchor = 'middle';
        break;
    }

    const watermarkElement = `
      <text x="${x}" 
            y="${y}" 
            font-family="${fontFamily || 'Arial'}" 
            font-size="${fontSize}" 
            fill="${color}" 
            opacity="${opacity}"
            text-anchor="${textAnchor}">
        ${text}
      </text>
    `;

    // Insert watermark before closing svg tag
    return svgString.replace(/(<\/svg>)/, `${watermarkElement}\n$1`);
  }

  /**
   * Optimize SVG content
   */
  private optimizeSvg(svgString: string, optimizationLevel: 'none' | 'basic' | 'advanced'): string {
    if (optimizationLevel === 'none') {
      return svgString;
    }

    let optimized = svgString;

    // Basic optimizations
    if (optimizationLevel === 'basic' || optimizationLevel === 'advanced') {
      // Remove unnecessary whitespace
      optimized = optimized.replace(/>\s+</g, '><');
      
      // Remove empty groups
      optimized = optimized.replace(/<g[^>]*>\s*<\/g>/g, '');
      
      // Simplify transform attributes
      optimized = this.simplifyTransforms(optimized);
    }

    // Advanced optimizations
    if (optimizationLevel === 'advanced') {
      // Remove unused elements
      optimized = this.removeUnusedElements(optimized);
      
      // Optimize paths
      optimized = this.optimizePaths(optimized);
      
      // Merge similar elements
      optimized = this.mergeSimilarElements(optimized);
    }

    return optimized;
  }

  /**
   * Convert SVG to PDF
   */
  private async svgToPdf(svgContent: string, pdfOptions: PdfExportOptions): Promise<ArrayBuffer> {
    // This would typically use a library like jsPDF or PDFKit
    // For now, return a minimal PDF implementation
    
    const pdfHeader = '%PDF-1.4\n';
    const pdfBody = this.createMinimalPdfWithSvg(svgContent, pdfOptions);
    const pdfContent = pdfHeader + pdfBody;
    
    return new TextEncoder().encode(pdfContent).buffer;
  }

  /**
   * Create minimal PDF with embedded SVG
   */
  private createMinimalPdfWithSvg(svgContent: string, options: PdfExportOptions): string {
    // This is a simplified PDF structure
    // In a real implementation, you would use a proper PDF library
    
    const pageWidth = options.pageSize === 'A4' ? 595 : 612;
    const pageHeight = options.pageSize === 'A4' ? 842 : 792;
    
    return `
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R >>
endobj

4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Chart Export PDF) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000208 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
306
%%EOF
    `;
  }

  /**
   * Pretty print XML content
   */
  private prettyPrintXml(xmlString: string): string {
    // Simple XML formatting - in production, use a proper XML formatter
    return xmlString
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index, array) => {
        const depth = this.calculateXmlDepth(line, array, index);
        return '  '.repeat(depth) + line;
      })
      .join('\n');
  }

  /**
   * Calculate XML indentation depth
   */
  private calculateXmlDepth(line: string, allLines: string[], currentIndex: number): number {
    let depth = 0;
    
    for (let i = 0; i < currentIndex; i++) {
      const prevLine = allLines[i];
      if (prevLine.match(/<[^\/][^>]*[^\/]>$/)) {
        depth++;
      }
      if (prevLine.match(/<\/[^>]*>$/)) {
        depth--;
      }
    }
    
    if (line.match(/^<\/[^>]*>$/)) {
      depth--;
    }
    
    return Math.max(0, depth);
  }

  /**
   * Simplify transform attributes
   */
  private simplifyTransforms(svgString: string): string {
    // Simplify identity transforms
    return svgString.replace(/transform="translate\(0,0\)"|transform="rotate\(0\)"|transform="scale\(1,1\)"/g, '');
  }

  /**
   * Remove unused SVG elements
   */
  private removeUnusedElements(svgString: string): string {
    // Remove unused defs, gradients, etc.
    return svgString; // Simplified implementation
  }

  /**
   * Optimize SVG paths
   */
  private optimizePaths(svgString: string): string {
    // Simplify path data - remove unnecessary precision, merge segments, etc.
    return svgString; // Simplified implementation
  }

  /**
   * Merge similar SVG elements
   */
  private mergeSimilarElements(svgString: string): string {
    // Merge elements with similar attributes into groups
    return svgString; // Simplified implementation
  }

  /**
   * Get default PDF options
   */
  private getDefaultPdfOptions(): PdfExportOptions {
    return {
      pageSize: 'A4',
      orientation: 'landscape',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      includeInteractiveElements: false,
      includeBookmarks: false,
      multiPage: false,
      chartsPerPage: 1
    };
  }

  /**
   * Get chart element from config
   */
  private getChartElement(config: ChartExportConfig): HTMLElement | null {
    // This would typically receive the chart element reference
    return document.querySelector('[data-chart-export-target]') as HTMLElement;
  }
}