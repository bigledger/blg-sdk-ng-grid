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
import { Subject, takeUntil } from 'rxjs';

import { MediaUploadService } from '../../services/media-upload.service';
import { ImageProcessingService } from '../../services/image-processing.service';
import { MediaManagerService } from '../../services/media-manager.service';
import {
  UploadConfig,
  UploadProgress,
  UploadResult,
  DropEventData,
  PasteEventData,
  ImageItem
} from '../../interfaces';
import { UploadMethod } from '../../types/media.types';

/**
 * Image uploader component with drag-and-drop, clipboard paste, and URL insertion support
 */
@Component({
  selector: 'ng-ui-image-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="blg-image-uploader" 
         [class.drag-over]="isDragOver()"
         [class.uploading]="hasActiveUploads()"
         [class.disabled]="disabled()">
      
      <!-- Drop Zone -->
      <div class="upload-zone"
           (click)="onZoneClick()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)">
        
        <!-- Upload Icon and Text -->
        <div class="upload-content" *ngIf="!hasActiveUploads()">
          <div class="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div class="upload-text">
            <div class="primary-text">
              {{ config().dragAndDrop ? 'Drop images here or click to upload' : 'Click to upload images' }}
            </div>
            <div class="secondary-text">
              <span *ngIf="config().clipboardPaste">Paste from clipboard or </span>
              Supports {{ getAllowedTypesText() }}
              <span *ngIf="config().maxFileSize"> up to {{ formatFileSize(config().maxFileSize!) }}</span>
            </div>
          </div>
        </div>

        <!-- Progress Display -->
        <div class="upload-progress" *ngIf="hasActiveUploads()">
          <div class="progress-header">
            <span>Uploading {{ activeUploads().length }} file(s)...</span>
            <button type="button" class="cancel-all-btn" (click)="cancelAllUploads()">
              Cancel All
            </button>
          </div>
          
          <div class="progress-items">
            <div class="progress-item" *ngFor="let upload of activeUploads(); trackBy: trackUpload">
              <div class="progress-info">
                <span class="file-name">{{ upload.file.name }}</span>
                <span class="file-size">{{ formatFileSize(upload.file.size) }}</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="upload.progress"></div>
                </div>
                <span class="progress-percent">{{ upload.progress }}%</span>
                <button type="button" class="cancel-btn" (click)="cancelUpload(upload)">×</button>
              </div>
              <div class="progress-meta" *ngIf="upload.speed">
                <span>{{ formatSpeed(upload.speed) }}</span>
                <span *ngIf="upload.timeRemaining">{{ formatTimeRemaining(upload.timeRemaining) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div class="upload-errors" *ngIf="errors().length > 0">
          <div class="error-header">
            <span>Upload Errors</span>
            <button type="button" class="clear-errors-btn" (click)="clearErrors()">
              Clear
            </button>
          </div>
          <div class="error-items">
            <div class="error-item" *ngFor="let error of errors()">
              <span class="error-file">{{ error.fileName }}</span>
              <span class="error-message">{{ error.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- URL Input -->
      <div class="url-input-section" *ngIf="showUrlInput()">
        <div class="url-input-container">
          <input 
            #urlInput
            type="url"
            class="url-input"
            placeholder="Or paste image URL here..."
            (keyup.enter)="onUrlSubmit(urlInput.value)"
            [disabled]="disabled()">
          <button type="button" 
                  class="url-submit-btn"
                  (click)="onUrlSubmit(urlInput.value)"
                  [disabled]="disabled()">
            Add
          </button>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input #fileInput
             type="file"
             multiple
             accept="{{ getAcceptString() }}"
             style="display: none"
             (change)="onFileInputChange($event)"
             [disabled]="disabled()">
    </div>
  `,
  styleUrls: ['./image-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploaderComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  // Inputs
  readonly config = input<Partial<UploadConfig>>({});
  readonly disabled = input<boolean>(false);
  readonly showUrlInput = input<boolean>(true);
  readonly maxFiles = input<number>();
  readonly accept = input<string>('image/*');

  // Outputs
  readonly uploadStarted = output<{ files: File[], method: UploadMethod }>();
  readonly uploadProgress = output<UploadProgress>();
  readonly uploadComplete = output<UploadResult>();
  readonly uploadError = output<{ file: File, error: string }>();
  readonly imageAdded = output<ImageItem>();

  private readonly uploadService = inject(MediaUploadService);
  private readonly imageService = inject(ImageProcessingService);
  private readonly mediaManager = inject(MediaManagerService);
  private readonly destroy$ = new Subject<void>();

  // State
  private readonly _isDragOver = signal<boolean>(false);
  private readonly _errors = signal<Array<{ fileName: string, message: string }>>([]);

  // Computed properties
  readonly isDragOver = this._isDragOver.asReadonly();
  readonly errors = this._errors.asReadonly();
  readonly activeUploads = computed(() => 
    this.uploadService.uploads().filter(upload => 
      upload.status === 'uploading' || upload.status === 'pending'
    )
  );
  readonly hasActiveUploads = computed(() => this.activeUploads().length > 0);

  constructor() {
    // Configure upload service with component config
    effect(() => {
      this.uploadService.configure({ upload: this.config() });
    });
  }

  ngOnInit(): void {
    this.setupEventListeners();
    this.subscribeToUploadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.removeEventListeners();
  }

  /**
   * Handle zone click to open file picker
   */
  onZoneClick(): void {
    if (!this.disabled()) {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Handle file input change
   */
  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files), 'click');
      input.value = ''; // Reset input
    }
  }

  /**
   * Handle URL submission
   */
  async onUrlSubmit(url: string): Promise<void> {
    if (!url.trim() || this.disabled()) return;

    try {
      // Create a temporary image to validate the URL
      const img = await this.imageService.loadImage(url);
      const imageItem: ImageItem = {
        id: this.generateId(),
        type: 'image',
        name: this.extractFileNameFromUrl(url),
        url,
        createdAt: new Date(),
        dimensions: this.imageService.getImageDimensions(img),
        altText: ''
      };

      this.mediaManager.addItem(imageItem);
      this.imageAdded.emit(imageItem);
      
      // Clear input
      const urlInput = document.querySelector('.url-input') as HTMLInputElement;
      if (urlInput) urlInput.value = '';
    } catch (error) {
      this.addError('URL', 'Invalid image URL or failed to load image');
    }
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent): void {
    if (!this.config().dragAndDrop || this.disabled()) return;

    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(true);
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent): void {
    if (!this.config().dragAndDrop || this.disabled()) return;

    event.preventDefault();
    event.stopPropagation();
    
    // Only set drag over to false if leaving the drop zone completely
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) {
      this._isDragOver.set(false);
    }
  }

  /**
   * Handle drop event
   */
  onDrop(event: DragEvent): void {
    if (!this.config().dragAndDrop || this.disabled()) return;

    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(false);

    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      this.handleFiles(files, 'drag-drop');
    }
  }

  /**
   * Cancel upload
   */
  cancelUpload(upload: UploadProgress): void {
    const fileId = this.generateFileId(upload.file);
    this.uploadService.cancelUpload(fileId);
  }

  /**
   * Cancel all uploads
   */
  cancelAllUploads(): void {
    this.activeUploads().forEach(upload => {
      this.cancelUpload(upload);
    });
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this._errors.set([]);
  }

  /**
   * Track uploads for ngFor
   */
  trackUpload(index: number, upload: UploadProgress): string {
    return this.generateFileId(upload.file);
  }

  /**
   * Get accepted file types as string
   */
  getAcceptString(): string {
    return this.config().allowedTypes?.join(',') || this.accept();
  }

  /**
   * Get allowed types text for display
   */
  getAllowedTypesText(): string {
    const types = this.config().allowedTypes || ['image/*'];
    if (types.includes('image/*')) {
      return 'all image formats';
    }
    return types.map(type => type.replace('image/', '').toUpperCase()).join(', ');
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format upload speed
   */
  formatSpeed(bytesPerSecond: number): string {
    return this.formatFileSize(bytesPerSecond) + '/s';
  }

  /**
   * Format time remaining
   */
  formatTimeRemaining(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s remaining`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m remaining`;
  }

  private setupEventListeners(): void {
    // Setup clipboard paste listener
    if (this.config().clipboardPaste) {
      document.addEventListener('paste', this.onPaste.bind(this));
    }
  }

  private removeEventListeners(): void {
    document.removeEventListener('paste', this.onPaste.bind(this));
  }

  private onPaste(event: ClipboardEvent): void {
    if (this.disabled()) return;

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const files = Array.from(clipboardData.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      this.handleFiles(files, 'paste');
      event.preventDefault();
    }
  }

  private subscribeToUploadEvents(): void {
    this.uploadService.onUploadComplete
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.uploadComplete.emit(result);
        // Convert to ImageItem if successful
        if (result.success && result.url) {
          // This would typically be done after getting metadata from server
          // For now, we'll create a basic ImageItem
        }
      });

    this.uploadService.onUploadError
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ file, error }) => {
        this.uploadError.emit({ file, error });
        this.addError(file.name, error);
      });
  }

  private async handleFiles(files: File[], method: UploadMethod): Promise<void> {
    // Validate file count
    const maxFiles = this.maxFiles() || this.config().maxFiles || 10;
    if (files.length > maxFiles) {
      this.addError('Multiple files', `Maximum ${maxFiles} files allowed`);
      return;
    }

    // Filter image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      this.addError('No images', 'No valid image files found');
      return;
    }

    this.uploadStarted.emit({ files: imageFiles, method });

    // Upload files
    for (const file of imageFiles) {
      try {
        const result = await this.uploadService.uploadFile(file).toPromise();
        if (result?.success && result.url) {
          // Load image to get dimensions
          const img = await this.imageService.loadImage(file);
          
          const imageItem: ImageItem = {
            id: this.generateId(),
            type: 'image',
            name: file.name,
            size: file.size,
            mimeType: file.type,
            url: result.url,
            createdAt: new Date(),
            dimensions: this.imageService.getImageDimensions(img),
            altText: '',
            metadata: result.metadata
          };

          this.mediaManager.addItem(imageItem);
          this.imageAdded.emit(imageItem);
        }
      } catch (error) {
        // Error already handled by service subscription
      }
    }
  }

  private addError(fileName: string, message: string): void {
    this._errors.update(errors => [...errors, { fileName, message }]);
  }

  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFileId(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`;
  }

  private extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop();
      return fileName || 'image';
    } catch {
      return 'image';
    }
  }
}