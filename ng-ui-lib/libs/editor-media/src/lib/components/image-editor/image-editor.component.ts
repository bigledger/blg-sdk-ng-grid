import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ImageProcessingService } from '../../services/image-processing.service';
import {
  ImageEditorConfig,
  ImageEditorState,
  ImageTransformation,
  CropArea,
  ResizeSettings,
  FlipSettings,
  FilterSettings,
  AspectRatio,
  DrawingTool,
  BrushSettings
} from '../../interfaces';

/**
 * Advanced image editor with crop, resize, rotate, flip, and filter capabilities
 */
@Component({
  selector: 'ng-ui-image-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-image-editor" [class.loading]="isLoading()">
      
      <!-- Toolbar -->
      <div class="editor-toolbar">
        <div class="toolbar-section">
          <button type="button" 
                  class="tool-btn" 
                  [class.active]="activeTool() === 'crop'"
                  (click)="setActiveTool('crop')"
                  [disabled]="!canEdit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 2L6 6L2 6"/>
              <path d="M18 6L22 6L22 10"/>
              <path d="M18 22L18 18L22 18"/>
              <path d="M6 18L2 18L2 14"/>
            </svg>
            Crop
          </button>

          <button type="button" 
                  class="tool-btn"
                  [class.active]="activeTool() === 'resize'"
                  (click)="setActiveTool('resize')"
                  [disabled]="!canEdit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 3L21 3L21 9"/>
              <path d="M9 21L3 21L3 15"/>
              <path d="M21 3L14 10"/>
              <path d="M3 21L10 14"/>
            </svg>
            Resize
          </button>

          <button type="button" 
                  class="tool-btn"
                  (click)="rotateImage(90)"
                  [disabled]="!canEdit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 2L14 2L14 8L21 8Z"/>
              <path d="M14 8.1L9.41 12.69A4.98 4.98 0 0 0 14 16L14 8.1Z"/>
              <path d="M7 16L3 20"/>
            </svg>
            Rotate
          </button>

          <div class="tool-group">
            <button type="button" 
                    class="tool-btn"
                    (click)="flipImage('horizontal')"
                    [disabled]="!canEdit()">
              ↔ Flip H
            </button>
            <button type="button" 
                    class="tool-btn"
                    (click)="flipImage('vertical')"
                    [disabled]="!canEdit()">
              ↕ Flip V
            </button>
          </div>
        </div>

        <div class="toolbar-section">
          <button type="button" 
                  class="tool-btn"
                  [class.active]="activeTool() === 'filters'"
                  (click)="setActiveTool('filters')"
                  [disabled]="!canEdit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
              <path d="M4.93 4.93L9.17 9.17"/>
              <path d="M14.83 14.83L19.07 19.07"/>
              <path d="M14.83 9.17L19.07 4.93"/>
              <path d="M14.83 9.17L18.36 5.64"/>
              <path d="M9.17 14.83L4.93 19.07"/>
            </svg>
            Filters
          </button>
        </div>

        <div class="toolbar-section">
          <button type="button" 
                  class="tool-btn"
                  (click)="undoChanges()"
                  [disabled]="!canUndo()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 7V13A10 10 0 0 0 23 12"/>
              <path d="M3 7L7 3L3 7L7 11"/>
            </svg>
            Undo
          </button>
          <button type="button" 
                  class="tool-btn"
                  (click)="redoChanges()"
                  [disabled]="!canRedo()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 7V13A10 10 0 0 0 1 12"/>
              <path d="M21 7L17 3L21 7L17 11"/>
            </svg>
            Redo
          </button>
        </div>

        <div class="toolbar-section">
          <button type="button" 
                  class="tool-btn primary"
                  (click)="saveImage()"
                  [disabled]="!canSave()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H16L21 8V19A2 2 0 0 1 19 21Z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
            Save
          </button>
          <button type="button" 
                  class="tool-btn secondary"
                  (click)="resetImage()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="23,4 23,10 17,10"/>
              <polyline points="1,20 1,14 7,14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14"/>
            </svg>
            Reset
          </button>
        </div>
      </div>

      <!-- Main Editor Area -->
      <div class="editor-main">
        
        <!-- Side Panel -->
        <div class="editor-panel" *ngIf="activeTool() !== 'none'">
          
          <!-- Crop Panel -->
          <div class="panel-content" *ngIf="activeTool() === 'crop'">
            <h3>Crop Image</h3>
            
            <div class="aspect-ratios" *ngIf="config().aspectRatios && config().aspectRatios!.length > 0">
              <label>Aspect Ratio:</label>
              <div class="ratio-buttons">
                <button type="button"
                        class="ratio-btn"
                        [class.active]="selectedAspectRatio()?.value === null"
                        (click)="setAspectRatio(null)">
                  Free
                </button>
                <button type="button"
                        class="ratio-btn"
                        *ngFor="let ratio of config().aspectRatios"
                        [class.active]="selectedAspectRatio()?.value === ratio.value"
                        (click)="setAspectRatio(ratio)">
                  {{ ratio.label }}
                </button>
              </div>
            </div>

            <div class="crop-controls">
              <div class="input-group">
                <label>X:</label>
                <input type="number" 
                       [(ngModel)]="cropArea().x"
                       (ngModelChange)="updateCropArea()"
                       min="0"
                       [max]="imageState().canvasSize.width">
              </div>
              <div class="input-group">
                <label>Y:</label>
                <input type="number" 
                       [(ngModel)]="cropArea().y"
                       (ngModelChange)="updateCropArea()"
                       min="0"
                       [max]="imageState().canvasSize.height">
              </div>
              <div class="input-group">
                <label>Width:</label>
                <input type="number" 
                       [(ngModel)]="cropArea().width"
                       (ngModelChange)="updateCropArea()"
                       min="1"
                       [max]="imageState().canvasSize.width - cropArea().x">
              </div>
              <div class="input-group">
                <label>Height:</label>
                <input type="number" 
                       [(ngModel)]="cropArea().height"
                       (ngModelChange)="updateCropArea()"
                       min="1"
                       [max]="imageState().canvasSize.height - cropArea().y">
              </div>
            </div>

            <button type="button" 
                    class="apply-btn"
                    (click)="applyCrop()"
                    [disabled]="!isValidCropArea()">
              Apply Crop
            </button>
          </div>

          <!-- Resize Panel -->
          <div class="panel-content" *ngIf="activeTool() === 'resize'">
            <h3>Resize Image</h3>
            
            <div class="resize-controls">
              <div class="input-group">
                <label>Width:</label>
                <input type="number" 
                       [(ngModel)]="resizeSettings().width"
                       (ngModelChange)="onResizeChange()"
                       min="1">
                <span class="unit">px</span>
              </div>
              
              <div class="input-group">
                <label>Height:</label>
                <input type="number" 
                       [(ngModel)]="resizeSettings().height"
                       (ngModelChange)="onResizeChange()"
                       min="1">
                <span class="unit">px</span>
              </div>
              
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" 
                         [(ngModel)]="resizeSettings().maintainAspectRatio"
                         (ngModelChange)="onResizeChange()">
                  Maintain aspect ratio
                </label>
              </div>
            </div>

            <button type="button" 
                    class="apply-btn"
                    (click)="applyResize()"
                    [disabled]="!isValidResizeSettings()">
              Apply Resize
            </button>
          </div>

          <!-- Filters Panel -->
          <div class="panel-content" *ngIf="activeTool() === 'filters'">
            <h3>Filters & Adjustments</h3>
            
            <div class="filter-controls">
              <div class="slider-group">
                <label>Brightness</label>
                <input type="range" 
                       [(ngModel)]="filterSettings().brightness"
                       (ngModelChange)="applyFilters()"
                       min="-100" 
                       max="100" 
                       step="1">
                <span class="value">{{ filterSettings().brightness }}%</span>
              </div>
              
              <div class="slider-group">
                <label>Contrast</label>
                <input type="range" 
                       [(ngModel)]="filterSettings().contrast"
                       (ngModelChange)="applyFilters()"
                       min="-100" 
                       max="100" 
                       step="1">
                <span class="value">{{ filterSettings().contrast }}%</span>
              </div>
              
              <div class="slider-group">
                <label>Saturation</label>
                <input type="range" 
                       [(ngModel)]="filterSettings().saturation"
                       (ngModelChange)="applyFilters()"
                       min="-100" 
                       max="100" 
                       step="1">
                <span class="value">{{ filterSettings().saturation }}%</span>
              </div>
              
              <div class="slider-group">
                <label>Blur</label>
                <input type="range" 
                       [(ngModel)]="filterSettings().blur"
                       (ngModelChange)="applyFilters()"
                       min="0" 
                       max="10" 
                       step="0.1">
                <span class="value">{{ filterSettings().blur }}px</span>
              </div>
              
              <div class="slider-group">
                <label>Sepia</label>
                <input type="range" 
                       [(ngModel)]="filterSettings().sepia"
                       (ngModelChange)="applyFilters()"
                       min="0" 
                       max="1" 
                       step="0.01">
                <span class="value">{{ Math.round(filterSettings().sepia! * 100) }}%</span>
              </div>
              
              <div class="slider-group">
                <label>Grayscale</label>
                <input type="range" 
                       [(ngModel)]="filterSettings().grayscale"
                       (ngModelChange)="applyFilters()"
                       min="0" 
                       max="1" 
                       step="0.01">
                <span class="value">{{ Math.round(filterSettings().grayscale! * 100) }}%</span>
              </div>
            </div>

            <div class="filter-presets">
              <button type="button" class="preset-btn" (click)="applyFilterPreset('none')">
                Original
              </button>
              <button type="button" class="preset-btn" (click)="applyFilterPreset('vintage')">
                Vintage
              </button>
              <button type="button" class="preset-btn" (click)="applyFilterPreset('blackwhite')">
                B&W
              </button>
              <button type="button" class="preset-btn" (click)="applyFilterPreset('bright')">
                Bright
              </button>
            </div>
          </div>
        </div>

        <!-- Canvas Area -->
        <div class="editor-canvas-area">
          <div class="canvas-container" #canvasContainer>
            <canvas #canvas
                    [width]="canvasWidth()"
                    [height]="canvasHeight()"
                    (mousedown)="onCanvasMouseDown($event)"
                    (mousemove)="onCanvasMouseMove($event)"
                    (mouseup)="onCanvasMouseUp($event)"
                    (wheel)="onCanvasWheel($event)">
            </canvas>
            
            <!-- Crop Overlay -->
            <div class="crop-overlay" 
                 *ngIf="activeTool() === 'crop' && showCropOverlay()"
                 [style.left.px]="cropOverlay().x"
                 [style.top.px]="cropOverlay().y"
                 [style.width.px]="cropOverlay().width"
                 [style.height.px]="cropOverlay().height">
              <div class="crop-handles">
                <div class="crop-handle nw" (mousedown)="onCropHandleMouseDown($event, 'nw')"></div>
                <div class="crop-handle ne" (mousedown)="onCropHandleMouseDown($event, 'ne')"></div>
                <div class="crop-handle se" (mousedown)="onCropHandleMouseDown($event, 'se')"></div>
                <div class="crop-handle sw" (mousedown)="onCropHandleMouseDown($event, 'sw')"></div>
                <div class="crop-handle n" (mousedown)="onCropHandleMouseDown($event, 'n')"></div>
                <div class="crop-handle e" (mousedown)="onCropHandleMouseDown($event, 'e')"></div>
                <div class="crop-handle s" (mousedown)="onCropHandleMouseDown($event, 's')"></div>
                <div class="crop-handle w" (mousedown)="onCropHandleMouseDown($event, 'w')"></div>
              </div>
            </div>
          </div>

          <!-- Loading Overlay -->
          <div class="loading-overlay" *ngIf="isLoading()">
            <div class="spinner"></div>
            <div class="loading-text">Processing image...</div>
          </div>
        </div>
      </div>

      <!-- Image Info -->
      <div class="editor-info">
        <div class="info-item">
          <label>Original:</label>
          <span>{{ originalDimensions().width }} × {{ originalDimensions().height }}px</span>
        </div>
        <div class="info-item">
          <label>Current:</label>
          <span>{{ currentDimensions().width }} × {{ currentDimensions().height }}px</span>
        </div>
        <div class="info-item">
          <label>Zoom:</label>
          <span>{{ Math.round(zoomLevel() * 100) }}%</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./image-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageEditorComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') private containerRef!: ElementRef<HTMLDivElement>;

  // Inputs
  readonly imageUrl = input.required<string>();
  readonly config = input<Partial<ImageEditorConfig>>({
    enableResize: true,
    enableCrop: true,
    enableRotation: true,
    enableFlip: true,
    enableAspectRatio: true,
    aspectRatios: [
      { label: '16:9', value: 16/9, width: 16, height: 9 },
      { label: '4:3', value: 4/3, width: 4, height: 3 },
      { label: '1:1', value: 1, width: 1, height: 1 },
      { label: '3:2', value: 3/2, width: 3, height: 2 }
    ]
  });

  // Outputs
  readonly imageChanged = output<ImageTransformation>();
  readonly imageSaved = output<{ dataUrl: string, transformations: ImageTransformation }>();
  readonly stateChanged = output<ImageEditorState>();

  private readonly imageService = inject(ImageProcessingService);

  // Component state
  private readonly _isLoading = signal<boolean>(true);
  private readonly _activeTool = signal<string>('none');
  private readonly _imageState = signal<Partial<ImageEditorState>>({});
  private readonly _cropArea = signal<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  private readonly _resizeSettings = signal<ResizeSettings>({ maintainAspectRatio: true });
  private readonly _filterSettings = signal<FilterSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0
  });
  private readonly _selectedAspectRatio = signal<AspectRatio | null>(null);
  private readonly _zoomLevel = signal<number>(1);
  private readonly _panOffset = signal<{ x: number, y: number }>({ x: 0, y: 0 });
  
  // Mouse interaction state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private isResizingCrop = false;
  private cropResizeHandle = '';

  // Computed properties
  readonly isLoading = this._isLoading.asReadonly();
  readonly activeTool = this._activeTool.asReadonly();
  readonly imageState = this._imageState.asReadonly();
  readonly cropArea = this._cropArea.asReadonly();
  readonly resizeSettings = this._resizeSettings.asReadonly();
  readonly filterSettings = this._filterSettings.asReadonly();
  readonly selectedAspectRatio = this._selectedAspectRatio.asReadonly();
  readonly zoomLevel = this._zoomLevel.asReadonly();

  readonly canEdit = computed(() => !this.isLoading() && this.imageState().originalImage);
  readonly canSave = computed(() => this.canEdit());
  readonly canUndo = computed(() => 
    this.imageState().history && 
    this.imageState().historyIndex !== undefined &&
    this.imageState().historyIndex! > 0
  );
  readonly canRedo = computed(() => 
    this.imageState().history && 
    this.imageState().historyIndex !== undefined &&
    this.imageState().historyIndex! < this.imageState().history!.length - 1
  );

  readonly originalDimensions = computed(() => {
    const img = this.imageState().originalImage;
    return img ? 
      { width: img.naturalWidth, height: img.naturalHeight } : 
      { width: 0, height: 0 };
  });

  readonly currentDimensions = computed(() => {
    const canvas = this.imageState().canvasSize;
    return canvas || { width: 0, height: 0 };
  });

  readonly canvasWidth = computed(() => {
    const container = this.containerRef?.nativeElement;
    const dimensions = this.currentDimensions();
    if (!container || !dimensions.width) return 800;
    
    const maxWidth = container.clientWidth - 40;
    const scale = Math.min(maxWidth / dimensions.width, this.zoomLevel());
    return dimensions.width * scale;
  });

  readonly canvasHeight = computed(() => {
    const dimensions = this.currentDimensions();
    const scale = this.canvasWidth() / dimensions.width;
    return dimensions.height * scale;
  });

  readonly showCropOverlay = computed(() => 
    this.activeTool() === 'crop' && this.cropArea().width > 0
  );

  readonly cropOverlay = computed(() => {
    const crop = this.cropArea();
    const scale = this.canvasWidth() / this.currentDimensions().width;
    return {
      x: crop.x * scale,
      y: crop.y * scale,
      width: crop.width * scale,
      height: crop.height * scale
    };
  });

  constructor() {
    // Load image when URL changes
    effect(() => {
      const url = this.imageUrl();
      if (url) {
        this.loadImage(url);
      }
    });
  }

  ngOnInit(): void {
    // Initialize editor
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  /**
   * Set active tool
   */
  setActiveTool(tool: string): void {
    this._activeTool.set(tool);
  }

  /**
   * Load image from URL
   */
  private async loadImage(url: string): Promise<void> {
    this._isLoading.set(true);
    
    try {
      const img = await this.imageService.loadImage(url);
      const dimensions = this.imageService.getImageDimensions(img);
      
      this._imageState.update(state => ({
        ...state,
        originalImage: img,
        currentImage: img,
        canvasSize: { width: dimensions.width, height: dimensions.height },
        transformations: {},
        history: [{}],
        historyIndex: 0,
        zoom: 1,
        pan: { x: 0, y: 0 }
      }));

      // Initialize crop area to full image
      this._cropArea.set({
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height
      });

      // Initialize resize settings
      this._resizeSettings.set({
        width: dimensions.width,
        height: dimensions.height,
        maintainAspectRatio: true
      });

      // Draw initial image
      this.drawImage();
      
    } catch (error) {
      console.error('Failed to load image:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Draw image on canvas
   */
  private drawImage(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const img = this.imageState().currentImage;
    
    if (!img) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply current transformations and draw
    const transformations = this.imageState().transformations || {};
    
    if (Object.keys(transformations).length > 0 || Object.keys(this.filterSettings()).some(key => (this.filterSettings() as any)[key] !== 0)) {
      // Apply transformations including current filters
      const currentTransformations = {
        ...transformations,
        filters: this.filterSettings()
      };
      
      this.imageService.applyTransformations(img, currentTransformations)
        .then(dataUrl => {
          const processedImg = new Image();
          processedImg.onload = () => {
            ctx.drawImage(processedImg, 0, 0, canvas.width, canvas.height);
          };
          processedImg.src = dataUrl;
        });
    } else {
      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  /**
   * Apply crop transformation
   */
  async applyCrop(): Promise<void> {
    if (!this.isValidCropArea()) return;

    this._isLoading.set(true);
    
    try {
      const img = this.imageState().currentImage!;
      const crop = this.cropArea();
      
      const croppedDataUrl = await this.imageService.cropImage(img, crop);
      const croppedImg = await this.imageService.loadImage(croppedDataUrl);
      
      this.updateImageState({
        currentImage: croppedImg,
        canvasSize: { width: crop.width, height: crop.height },
        transformations: {
          ...this.imageState().transformations,
          crop: crop
        }
      });

      this.addToHistory();
      this.drawImage();
      
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Apply resize transformation
   */
  async applyResize(): Promise<void> {
    if (!this.isValidResizeSettings()) return;

    this._isLoading.set(true);
    
    try {
      const img = this.imageState().currentImage!;
      const resize = this.resizeSettings();
      
      const resizedDataUrl = await this.imageService.resizeImage(img, resize);
      const resizedImg = await this.imageService.loadImage(resizedDataUrl);
      
      this.updateImageState({
        currentImage: resizedImg,
        canvasSize: { width: resize.width!, height: resize.height! },
        transformations: {
          ...this.imageState().transformations,
          resize: resize
        }
      });

      this.addToHistory();
      this.drawImage();
      
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Rotate image
   */
  async rotateImage(degrees: number): Promise<void> {
    this._isLoading.set(true);
    
    try {
      const img = this.imageState().currentImage!;
      const currentRotation = this.imageState().transformations?.rotation || 0;
      const newRotation = (currentRotation + degrees) % 360;
      
      const rotatedDataUrl = await this.imageService.rotateImage(img, degrees);
      const rotatedImg = await this.imageService.loadImage(rotatedDataUrl);
      
      // Swap dimensions for 90/270 degree rotations
      const dimensions = this.imageService.getImageDimensions(rotatedImg);
      
      this.updateImageState({
        currentImage: rotatedImg,
        canvasSize: { width: dimensions.width, height: dimensions.height },
        transformations: {
          ...this.imageState().transformations,
          rotation: newRotation
        }
      });

      this.addToHistory();
      this.drawImage();
      
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Flip image
   */
  async flipImage(direction: 'horizontal' | 'vertical'): Promise<void> {
    this._isLoading.set(true);
    
    try {
      const img = this.imageState().currentImage!;
      const currentFlip = this.imageState().transformations?.flip || {};
      
      const newFlip: FlipSettings = {
        horizontal: direction === 'horizontal' ? !currentFlip.horizontal : currentFlip.horizontal,
        vertical: direction === 'vertical' ? !currentFlip.vertical : currentFlip.vertical
      };
      
      const flippedDataUrl = await this.imageService.flipImage(img, newFlip);
      const flippedImg = await this.imageService.loadImage(flippedDataUrl);
      
      this.updateImageState({
        currentImage: flippedImg,
        transformations: {
          ...this.imageState().transformations,
          flip: newFlip
        }
      });

      this.addToHistory();
      this.drawImage();
      
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Apply filters (real-time preview)
   */
  applyFilters(): void {
    // Filters are applied in real-time via CSS during drawing
    this.drawImage();
  }

  /**
   * Apply filter preset
   */
  applyFilterPreset(preset: string): void {
    let filters: FilterSettings = {};

    switch (preset) {
      case 'vintage':
        filters = { brightness: -10, contrast: 20, saturation: -30, sepia: 0.3 };
        break;
      case 'blackwhite':
        filters = { brightness: 0, contrast: 10, saturation: 0, grayscale: 1 };
        break;
      case 'bright':
        filters = { brightness: 20, contrast: 10, saturation: 10 };
        break;
      default:
        filters = { brightness: 0, contrast: 0, saturation: 0, blur: 0, sepia: 0, grayscale: 0 };
    }

    this._filterSettings.set(filters);
    this.applyFilters();
  }

  /**
   * Set aspect ratio for cropping
   */
  setAspectRatio(ratio: AspectRatio | null): void {
    this._selectedAspectRatio.set(ratio);
    
    if (ratio) {
      const crop = this.cropArea();
      const newHeight = crop.width / ratio.value;
      
      this._cropArea.update(current => ({
        ...current,
        height: Math.min(newHeight, this.currentDimensions().height - current.y),
        aspectRatio: ratio.value
      }));
    } else {
      this._cropArea.update(current => ({
        ...current,
        aspectRatio: undefined
      }));
    }
  }

  /**
   * Update crop area
   */
  updateCropArea(): void {
    // Validation happens in template via computed properties
  }

  /**
   * Handle resize input changes
   */
  onResizeChange(): void {
    const settings = this.resizeSettings();
    
    if (settings.maintainAspectRatio) {
      const currentDims = this.currentDimensions();
      const aspectRatio = currentDims.width / currentDims.height;
      
      if (settings.width && !settings.height) {
        this._resizeSettings.update(current => ({
          ...current,
          height: Math.round(settings.width! / aspectRatio)
        }));
      } else if (settings.height && !settings.width) {
        this._resizeSettings.update(current => ({
          ...current,
          width: Math.round(settings.height! * aspectRatio)
        }));
      }
    }
  }

  /**
   * Save image with current transformations
   */
  async saveImage(): Promise<void> {
    if (!this.canSave()) return;

    this._isLoading.set(true);
    
    try {
      const img = this.imageState().currentImage!;
      let finalTransformations = this.imageState().transformations || {};
      
      // Include current filters in final transformations
      const currentFilters = this.filterSettings();
      const hasFilters = Object.values(currentFilters).some(value => value !== 0);
      
      if (hasFilters) {
        finalTransformations = {
          ...finalTransformations,
          filters: currentFilters
        };
      }

      const finalDataUrl = await this.imageService.applyTransformations(img, finalTransformations);
      
      this.imageSaved.emit({
        dataUrl: finalDataUrl,
        transformations: finalTransformations
      });
      
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Reset image to original state
   */
  async resetImage(): Promise<void> {
    const originalImg = this.imageState().originalImage;
    if (!originalImg) return;

    const dimensions = this.imageService.getImageDimensions(originalImg);
    
    this.updateImageState({
      currentImage: originalImg,
      canvasSize: { width: dimensions.width, height: dimensions.height },
      transformations: {},
      history: [{}],
      historyIndex: 0
    });

    // Reset all controls
    this._cropArea.set({
      x: 0,
      y: 0,
      width: dimensions.width,
      height: dimensions.height
    });

    this._resizeSettings.set({
      width: dimensions.width,
      height: dimensions.height,
      maintainAspectRatio: true
    });

    this._filterSettings.set({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      sepia: 0,
      grayscale: 0
    });

    this._selectedAspectRatio.set(null);
    this._activeTool.set('none');
    
    this.drawImage();
  }

  /**
   * Undo last change
   */
  undoChanges(): void {
    // Implementation for undo functionality
  }

  /**
   * Redo last undone change
   */
  redoChanges(): void {
    // Implementation for redo functionality
  }

  /**
   * Canvas mouse event handlers
   */
  onCanvasMouseDown(event: MouseEvent): void {
    // Handle mouse interactions for pan/zoom
  }

  onCanvasMouseMove(event: MouseEvent): void {
    // Handle mouse move for pan/zoom
  }

  onCanvasMouseUp(event: MouseEvent): void {
    // Handle mouse up for pan/zoom
  }

  onCanvasWheel(event: WheelEvent): void {
    // Handle zoom with mouse wheel
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, this.zoomLevel() * delta));
    
    this._zoomLevel.set(newZoom);
  }

  /**
   * Crop handle mouse down
   */
  onCropHandleMouseDown(event: MouseEvent, handle: string): void {
    event.stopPropagation();
    this.isResizingCrop = true;
    this.cropResizeHandle = handle;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
  }

  /**
   * Validation methods
   */
  isValidCropArea(): boolean {
    const crop = this.cropArea();
    const dimensions = this.currentDimensions();
    
    return crop.width > 0 && 
           crop.height > 0 && 
           crop.x + crop.width <= dimensions.width && 
           crop.y + crop.height <= dimensions.height;
  }

  isValidResizeSettings(): boolean {
    const settings = this.resizeSettings();
    return (settings.width || 0) > 0 && (settings.height || 0) > 0;
  }

  /**
   * Helper methods
   */
  private updateImageState(updates: Partial<ImageEditorState>): void {
    this._imageState.update(current => ({ ...current, ...updates }));
    this.stateChanged.emit(this._imageState() as ImageEditorState);
  }

  private addToHistory(): void {
    const currentTransformations = this.imageState().transformations || {};
    const history = [...(this.imageState().history || [])];
    const historyIndex = (this.imageState().historyIndex || 0) + 1;
    
    // Add new state to history
    history.splice(historyIndex);
    history.push(currentTransformations);
    
    this.updateImageState({
      history,
      historyIndex
    });
  }
}