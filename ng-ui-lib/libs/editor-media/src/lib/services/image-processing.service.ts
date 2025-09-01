import { Injectable, signal } from '@angular/core';
import { Observable, from } from 'rxjs';
import { 
  ImageConfig,
  ImageTransformation,
  CropArea,
  ResizeSettings,
  FlipSettings,
  FilterSettings,
  ImageDimensions,
  ImageVariant,
  ResizeAlgorithm
} from '../interfaces';

/**
 * Service for image processing operations including resize, crop, rotate, and filters
 */
@Injectable({
  providedIn: 'root'
})
export class ImageProcessingService {
  private readonly _config = signal<ImageConfig>({
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.9,
    optimization: true,
    formats: ['jpeg', 'png', 'webp']
  });

  /**
   * Configure image processing settings
   */
  configure(config: Partial<ImageConfig>): void {
    this._config.update(current => ({ ...current, ...config }));
  }

  /**
   * Load image from file or URL
   */
  loadImage(source: File | string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      
      if (typeof source === 'string') {
        img.src = source;
      } else {
        const url = URL.createObjectURL(source);
        img.src = url;
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
      }
    });
  }

  /**
   * Get image dimensions
   */
  getImageDimensions(image: HTMLImageElement): ImageDimensions {
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      aspectRatio: image.naturalWidth / image.naturalHeight
    };
  }

  /**
   * Apply transformations to image
   */
  async applyTransformations(
    image: HTMLImageElement, 
    transformations: ImageTransformation
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    let currentImage = image;
    let canvasWidth = image.naturalWidth;
    let canvasHeight = image.naturalHeight;

    // Apply crop first if specified
    if (transformations.crop) {
      const cropped = await this.cropImage(currentImage, transformations.crop);
      currentImage = await this.loadImage(cropped);
      canvasWidth = currentImage.naturalWidth;
      canvasHeight = currentImage.naturalHeight;
    }

    // Apply resize if specified
    if (transformations.resize) {
      const resized = this.calculateResizeDimensions(
        { width: canvasWidth, height: canvasHeight },
        transformations.resize
      );
      canvasWidth = resized.width;
      canvasHeight = resized.height;
    }

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Save context for transformations
    ctx.save();

    // Apply rotation
    if (transformations.rotation) {
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((transformations.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    // Apply flip
    if (transformations.flip) {
      let scaleX = 1;
      let scaleY = 1;
      let translateX = 0;
      let translateY = 0;

      if (transformations.flip.horizontal) {
        scaleX = -1;
        translateX = canvasWidth;
      }

      if (transformations.flip.vertical) {
        scaleY = -1;
        translateY = canvasHeight;
      }

      ctx.translate(translateX, translateY);
      ctx.scale(scaleX, scaleY);
    }

    // Apply filters
    if (transformations.filters) {
      ctx.filter = this.buildFilterString(transformations.filters);
    }

    // Draw the image
    ctx.drawImage(currentImage, 0, 0, canvasWidth, canvasHeight);

    // Restore context
    ctx.restore();

    // Get output quality and format
    const config = this._config();
    const quality = config.quality || 0.9;
    const format = this.getOutputFormat(currentImage.src);

    return canvas.toDataURL(format, quality);
  }

  /**
   * Crop image to specified area
   */
  async cropImage(image: HTMLImageElement, cropArea: CropArea): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    ctx.drawImage(
      image,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );

    const config = this._config();
    const quality = config.quality || 0.9;
    const format = this.getOutputFormat(image.src);

    return canvas.toDataURL(format, quality);
  }

  /**
   * Resize image to specified dimensions
   */
  async resizeImage(
    image: HTMLImageElement, 
    resizeSettings: ResizeSettings
  ): Promise<string> {
    const currentDimensions = this.getImageDimensions(image);
    const targetDimensions = this.calculateResizeDimensions(currentDimensions, resizeSettings);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = targetDimensions.width;
    canvas.height = targetDimensions.height;

    // Use image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(image, 0, 0, targetDimensions.width, targetDimensions.height);

    const config = this._config();
    const quality = config.quality || 0.9;
    const format = this.getOutputFormat(image.src);

    return canvas.toDataURL(format, quality);
  }

  /**
   * Rotate image by specified degrees
   */
  async rotateImage(image: HTMLImageElement, degrees: number): Promise<string> {
    return this.applyTransformations(image, { rotation: degrees });
  }

  /**
   * Flip image horizontally and/or vertically
   */
  async flipImage(image: HTMLImageElement, flip: FlipSettings): Promise<string> {
    return this.applyTransformations(image, { flip });
  }

  /**
   * Generate responsive image variants
   */
  async generateVariants(
    image: HTMLImageElement,
    breakpoints: number[] = [480, 768, 1024, 1440]
  ): Promise<ImageVariant[]> {
    const variants: ImageVariant[] = [];
    const originalDimensions = this.getImageDimensions(image);

    for (const breakpoint of breakpoints) {
      if (breakpoint < originalDimensions.width) {
        const scaleFactor = breakpoint / originalDimensions.width;
        const height = Math.round(originalDimensions.height * scaleFactor);

        const resizedImage = await this.resizeImage(image, {
          width: breakpoint,
          height,
          maintainAspectRatio: true
        });

        variants.push({
          url: resizedImage,
          width: breakpoint,
          height,
          descriptor: `${breakpoint}w`
        });
      }
    }

    // Add 2x variants for high-density displays
    for (const variant of [...variants]) {
      if (variant.width * 2 <= originalDimensions.width) {
        const retina = await this.resizeImage(image, {
          width: variant.width * 2,
          height: variant.height * 2,
          maintainAspectRatio: true
        });

        variants.push({
          url: retina,
          width: variant.width * 2,
          height: variant.height * 2,
          descriptor: `${variant.width}w 2x`
        });
      }
    }

    return variants.sort((a, b) => a.width - b.width);
  }

  /**
   * Optimize image for web
   */
  async optimizeImage(image: HTMLImageElement): Promise<string> {
    const config = this._config();
    const dimensions = this.getImageDimensions(image);

    // Check if resize is needed
    const needsResize = 
      (config.maxWidth && dimensions.width > config.maxWidth) ||
      (config.maxHeight && dimensions.height > config.maxHeight);

    if (needsResize) {
      const targetWidth = Math.min(dimensions.width, config.maxWidth || dimensions.width);
      const targetHeight = Math.min(dimensions.height, config.maxHeight || dimensions.height);

      return this.resizeImage(image, {
        width: targetWidth,
        height: targetHeight,
        maintainAspectRatio: true
      });
    }

    // Just apply quality compression
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    ctx.drawImage(image, 0, 0);

    const quality = config.quality || 0.9;
    const format = this.getOutputFormat(image.src);

    return canvas.toDataURL(format, quality);
  }

  /**
   * Convert image to base64
   */
  async imageToBase64(image: HTMLImageElement, format?: string, quality?: number): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    ctx.drawImage(image, 0, 0);

    const outputFormat = format || this.getOutputFormat(image.src);
    const outputQuality = quality || this._config().quality || 0.9;

    return canvas.toDataURL(outputFormat, outputQuality);
  }

  /**
   * Calculate optimal resize dimensions
   */
  private calculateResizeDimensions(
    current: ImageDimensions,
    settings: ResizeSettings
  ): { width: number; height: number } {
    let { width, height } = settings;

    if (settings.maintainAspectRatio !== false) {
      const aspectRatio = current.aspectRatio || current.width / current.height;

      if (width && !height) {
        height = Math.round(width / aspectRatio);
      } else if (height && !width) {
        width = Math.round(height * aspectRatio);
      } else if (width && height) {
        // Choose the dimension that results in smaller scaling
        const scaleByWidth = width / current.width;
        const scaleByHeight = height / current.height;
        const scale = Math.min(scaleByWidth, scaleByHeight);

        width = Math.round(current.width * scale);
        height = Math.round(current.height * scale);
      }
    }

    return {
      width: width || current.width,
      height: height || current.height
    };
  }

  /**
   * Build CSS filter string from filter settings
   */
  private buildFilterString(filters: FilterSettings): string {
    const filterParts: string[] = [];

    if (filters.brightness !== undefined) {
      filterParts.push(`brightness(${(100 + filters.brightness) / 100})`);
    }

    if (filters.contrast !== undefined) {
      filterParts.push(`contrast(${(100 + filters.contrast) / 100})`);
    }

    if (filters.saturation !== undefined) {
      filterParts.push(`saturate(${(100 + filters.saturation) / 100})`);
    }

    if (filters.blur !== undefined && filters.blur > 0) {
      filterParts.push(`blur(${filters.blur}px)`);
    }

    if (filters.sepia !== undefined && filters.sepia > 0) {
      filterParts.push(`sepia(${filters.sepia})`);
    }

    if (filters.grayscale !== undefined && filters.grayscale > 0) {
      filterParts.push(`grayscale(${filters.grayscale})`);
    }

    return filterParts.join(' ') || 'none';
  }

  /**
   * Determine output format based on source
   */
  private getOutputFormat(src: string): string {
    if (src.includes('data:image/png') || src.toLowerCase().includes('.png')) {
      return 'image/png';
    }
    if (src.includes('data:image/webp') || src.toLowerCase().includes('.webp')) {
      return 'image/webp';
    }
    return 'image/jpeg'; // Default to JPEG
  }
}