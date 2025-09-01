import { Injectable, inject } from '@angular/core';
import { 
  ChartExportConfig, 
  ExportedFile,
  Chart3DExportOptions
} from '../interfaces/chart-export';
import { ImageExportService } from './image-export.service';

/**
 * 3D Chart Export Service
 * Handles specialized exports for 3D charts including multiple views and animations
 */
@Injectable({
  providedIn: 'root'
})
export class Chart3DExportService {
  private imageExportService = inject(ImageExportService);

  /**
   * Export 3D chart with special features
   */
  async export3D(config: ChartExportConfig, options: Chart3DExportOptions): Promise<ExportedFile[]> {
    const exportedFiles: ExportedFile[] = [];

    try {
      // Export multiple rotation views if requested
      if (options.multipleViews && options.rotationViews) {
        for (const view of options.rotationViews) {
          await this.setChart3DView(view.azimuth, view.elevation);
          
          const viewConfig = {
            ...config,
            filename: `${config.filename}-${view.label}`
          };
          
          const viewFile = await this.imageExportService.export(viewConfig);
          exportedFiles.push(viewFile);
        }
      }

      // Export animation frames if requested
      if (options.exportAnimationFrames && options.animationFrameOptions) {
        const frameFiles = await this.exportAnimationFrames(config, options);
        exportedFiles.push(...frameFiles);
      }

      // Export as 3D model if requested
      if (options.export3DModel) {
        const modelFile = await this.export3DModel(config, options);
        exportedFiles.push(modelFile);
      }

      // If no special options, export standard view
      if (exportedFiles.length === 0) {
        const standardFile = await this.imageExportService.export(config);
        exportedFiles.push(standardFile);
      }

      return exportedFiles;

    } catch (error) {
      throw new Error(`3D chart export failed: ${error}`);
    }
  }

  /**
   * Export animation frames for 3D chart
   */
  private async exportAnimationFrames(
    config: ChartExportConfig, 
    options: Chart3DExportOptions
  ): Promise<ExportedFile[]> {
    const frames: ExportedFile[] = [];
    const frameOptions = options.animationFrameOptions!;
    
    for (let frame = 0; frame < frameOptions.totalFrames; frame++) {
      // Set camera position for this frame
      if (frameOptions.cameraPath) {
        const cameraFrame = frameOptions.cameraPath.find(cf => cf.frame === frame) ||
                           this.interpolateCameraPosition(frameOptions.cameraPath, frame);
        
        await this.setChart3DCameraPosition(
          cameraFrame.position, 
          cameraFrame.lookAt
        );
      } else {
        // Default rotation animation
        const rotation = (frame / frameOptions.totalFrames) * 360 * frameOptions.rotationSpeed;
        await this.setChart3DView(rotation, 30);
      }

      const frameConfig = {
        ...config,
        filename: `${config.filename}-frame-${frame.toString().padStart(3, '0')}`
      };

      const frameFile = await this.imageExportService.export(frameConfig);
      frames.push(frameFile);
    }

    return frames;
  }

  /**
   * Export 3D model in various formats
   */
  private async export3DModel(
    config: ChartExportConfig, 
    options: Chart3DExportOptions
  ): Promise<ExportedFile> {
    const modelFormat = options.modelFormat || 'obj';
    const modelContent = await this.generateModelContent(config, options, modelFormat);
    
    const blob = new Blob([modelContent], { 
      type: this.getModelMimeType(modelFormat) 
    });
    
    return {
      filename: `${config.filename}.${modelFormat}`,
      format: modelFormat as any,
      size: blob.size,
      data: blob,
      mimeType: this.getModelMimeType(modelFormat),
      createdAt: new Date()
    };
  }

  /**
   * Generate 3D model content
   */
  private async generateModelContent(
    config: ChartExportConfig,
    options: Chart3DExportOptions,
    format: string
  ): Promise<string> {
    switch (format) {
      case 'obj':
        return this.generateObjContent(config);
      case 'gltf':
        return this.generateGltfContent(config);
      case 'stl':
        return this.generateStlContent(config);
      default:
        throw new Error(`Unsupported 3D model format: ${format}`);
    }
  }

  /**
   * Generate OBJ file content
   */
  private generateObjContent(config: ChartExportConfig): string {
    // Simplified OBJ structure for a basic 3D chart
    return `
# 3D Chart Export - OBJ Format
# Generated on ${new Date().toISOString()}

# Vertices
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 1.0 1.0 0.0
v 0.0 1.0 0.0
v 0.0 0.0 1.0
v 1.0 0.0 1.0
v 1.0 1.0 1.0
v 0.0 1.0 1.0

# Faces
f 1 2 3 4
f 5 8 7 6
f 1 5 6 2
f 2 6 7 3
f 3 7 8 4
f 5 1 4 8
    `.trim();
  }

  /**
   * Generate glTF content
   */
  private generateGltfContent(config: ChartExportConfig): string {
    const gltfData = {
      asset: {
        version: "2.0",
        generator: "Chart Export Tool"
      },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [
        {
          mesh: 0,
          translation: [0, 0, 0]
        }
      ],
      meshes: [
        {
          primitives: [
            {
              attributes: {
                POSITION: 0
              },
              indices: 1
            }
          ]
        }
      ],
      accessors: [
        {
          bufferView: 0,
          componentType: 5126,
          count: 8,
          type: "VEC3",
          max: [1, 1, 1],
          min: [0, 0, 0]
        },
        {
          bufferView: 1,
          componentType: 5123,
          count: 36,
          type: "SCALAR"
        }
      ],
      bufferViews: [
        {
          buffer: 0,
          byteLength: 96,
          target: 34962
        },
        {
          buffer: 0,
          byteOffset: 96,
          byteLength: 72,
          target: 34963
        }
      ],
      buffers: [
        {
          byteLength: 168,
          uri: "data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAAAAAAAAgD8AAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAAAAAAACAPwAAgD8AAAAAAIA/AACAPwAAgD8="
        }
      ]
    };

    return JSON.stringify(gltfData, null, 2);
  }

  /**
   * Generate STL content
   */
  private generateStlContent(config: ChartExportConfig): string {
    // ASCII STL format
    return `
solid Chart3DExport
  facet normal 0.0 0.0 1.0
    outer loop
      vertex 0.0 0.0 1.0
      vertex 1.0 0.0 1.0
      vertex 1.0 1.0 1.0
    endloop
  endfacet
  facet normal 0.0 0.0 1.0
    outer loop
      vertex 0.0 0.0 1.0
      vertex 1.0 1.0 1.0
      vertex 0.0 1.0 1.0
    endloop
  endfacet
endsolid Chart3DExport
    `.trim();
  }

  /**
   * Set 3D chart view (azimuth and elevation)
   */
  private async setChart3DView(azimuth: number, elevation: number): Promise<void> {
    // This would interact with the 3D chart's camera controls
    const event = new CustomEvent('setChartView', {
      detail: { azimuth, elevation }
    });
    
    const chartElement = document.querySelector('[data-chart-3d]');
    chartElement?.dispatchEvent(event);
    
    // Wait for view change to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Set 3D chart camera position
   */
  private async setChart3DCameraPosition(
    position: [number, number, number], 
    lookAt: [number, number, number]
  ): Promise<void> {
    const event = new CustomEvent('setCameraPosition', {
      detail: { position, lookAt }
    });
    
    const chartElement = document.querySelector('[data-chart-3d]');
    chartElement?.dispatchEvent(event);
    
    // Wait for camera movement to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Interpolate camera position between keyframes
   */
  private interpolateCameraPosition(
    cameraPath: any[], 
    frame: number
  ): { position: [number, number, number]; lookAt: [number, number, number]; frame: number } {
    // Find surrounding keyframes
    const before = cameraPath.filter(cf => cf.frame <= frame).pop();
    const after = cameraPath.find(cf => cf.frame > frame);
    
    if (!before) return cameraPath[0];
    if (!after) return cameraPath[cameraPath.length - 1];
    
    // Linear interpolation
    const t = (frame - before.frame) / (after.frame - before.frame);
    
    const position: [number, number, number] = [
      before.position[0] + (after.position[0] - before.position[0]) * t,
      before.position[1] + (after.position[1] - before.position[1]) * t,
      before.position[2] + (after.position[2] - before.position[2]) * t
    ];
    
    const lookAt: [number, number, number] = [
      before.lookAt[0] + (after.lookAt[0] - before.lookAt[0]) * t,
      before.lookAt[1] + (after.lookAt[1] - before.lookAt[1]) * t,
      before.lookAt[2] + (after.lookAt[2] - before.lookAt[2]) * t
    ];
    
    return { position, lookAt, frame };
  }

  /**
   * Get MIME type for 3D model format
   */
  private getModelMimeType(format: string): string {
    switch (format) {
      case 'obj':
        return 'model/obj';
      case 'gltf':
        return 'model/gltf+json';
      case 'fbx':
        return 'model/fbx';
      case 'stl':
        return 'model/stl';
      default:
        return 'application/octet-stream';
    }
  }
}