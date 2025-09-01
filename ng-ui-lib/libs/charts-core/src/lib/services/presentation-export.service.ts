import { Injectable, inject } from '@angular/core';
import { 
  ChartExportConfig, 
  ExportedFile,
  PresentationExportOptions
} from '../interfaces/chart-export';
import { ImageExportService } from './image-export.service';

/**
 * Presentation Export Service
 * Handles PowerPoint and presentation format exports
 */
@Injectable({
  providedIn: 'root'
})
export class PresentationExportService {
  private imageExportService = inject(ImageExportService);

  /**
   * Export chart as presentation (PowerPoint)
   */
  async export(config: ChartExportConfig, abortSignal?: AbortSignal): Promise<ExportedFile> {
    const options = config.formatOptions as PresentationExportOptions;
    
    if (abortSignal?.aborted) {
      throw new Error('Export cancelled');
    }

    try {
      // Generate chart image for presentation
      const imageConfig = {
        ...config,
        format: 'png' as any,
        formatOptions: {
          quality: 1.0,
          dpi: 300,
          scaleFactor: 2,
          backgroundColor: 'white',
          includeAnimationFrames: false
        }
      };

      const chartImage = await this.imageExportService.export(imageConfig);
      
      // Create PowerPoint structure
      const pptxContent = await this.createPowerPointPresentation(chartImage, options, config);
      
      const blob = new Blob([pptxContent], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      
      return {
        filename: `${config.filename}.pptx`,
        format: 'powerpoint',
        size: blob.size,
        data: blob,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        createdAt: new Date()
      };

    } catch (error) {
      throw new Error(`Presentation export failed: ${error}`);
    }
  }

  /**
   * Create PowerPoint presentation structure
   */
  private async createPowerPointPresentation(
    chartImage: ExportedFile, 
    options: PresentationExportOptions, 
    config: ChartExportConfig
  ): Promise<ArrayBuffer> {
    // This would typically use a library like PptxGenJS
    // For now, return a minimal Office Open XML structure
    
    const xmlContent = this.createPptxXml(chartImage, options, config);
    return new TextEncoder().encode(xmlContent).buffer;
  }

  /**
   * Create PowerPoint XML structure
   */
  private createPptxXml(
    chartImage: ExportedFile, 
    options: PresentationExportOptions, 
    config: ChartExportConfig
  ): string {
    // Simplified PowerPoint XML structure
    return `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:slides>
    <p:slide>
      <p:cSld>
        <p:spTree>
          <p:nvGrpSpPr>
            <p:cNvPr id="1" name="Chart Slide"/>
          </p:nvGrpSpPr>
          <p:sp>
            <p:nvSpPr>
              <p:cNvPr id="2" name="Chart"/>
            </p:nvSpPr>
            <p:spPr>
              <a:xfrm>
                <a:off x="${options.chartPlacement.x}" y="${options.chartPlacement.y}"/>
                <a:ext cx="${options.chartPlacement.width}" cy="${options.chartPlacement.height}"/>
              </a:xfrm>
            </p:spPr>
          </p:sp>
        </p:spTree>
      </p:cSld>
    </p:slide>
  </p:slides>
</p:presentation>
    `.trim();
  }
}