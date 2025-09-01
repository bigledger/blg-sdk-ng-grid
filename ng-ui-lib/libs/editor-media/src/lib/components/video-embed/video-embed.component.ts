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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { MediaUploadService } from '../../services/media-upload.service';
import { MediaManagerService } from '../../services/media-manager.service';
import {
  VideoConfig,
  VideoItem,
  VideoProvider,
  VideoDimensions,
  VideoQuality,
  UploadResult
} from '../../interfaces';
import { MediaErrorType } from '../../types/media.types';

/**
 * Video embed component supporting YouTube, Vimeo, and HTML5 video with responsive sizing
 */
@Component({
  selector: 'ng-ui-video-embed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-video-embed" [class.loading]="isLoading()">
      
      <!-- Video Input Section -->
      <div class="video-input-section" *ngIf="showInput()">
        <div class="input-tabs">
          <button type="button"
                  class="tab-btn"
                  [class.active]="activeTab() === 'url'"
                  (click)="setActiveTab('url')">
            Video URL
          </button>
          <button type="button"
                  class="tab-btn"
                  [class.active]="activeTab() === 'upload'"
                  (click)="setActiveTab('upload')"
                  *ngIf="config().enableUpload">
            Upload Video
          </button>
          <button type="button"
                  class="tab-btn"
                  [class.active]="activeTab() === 'embed'"
                  (click)="setActiveTab('embed')">
            Embed Code
          </button>
        </div>

        <!-- URL Input Tab -->
        <div class="tab-content" *ngIf="activeTab() === 'url'">
          <div class="url-input-container">
            <input #urlInput
                   type="url"
                   class="video-url-input"
                   placeholder="Enter YouTube, Vimeo, or video URL..."
                   [(ngModel)]="videoUrl()"
                   (ngModelChange)="onUrlChange($event)"
                   [disabled]="isLoading()">
            <button type="button"
                    class="add-video-btn"
                    (click)="addVideoFromUrl()"
                    [disabled]="!isValidUrl() || isLoading()">
              Add Video
            </button>
          </div>
          
          <div class="video-providers" *ngIf="detectedProvider()">
            <div class="provider-info">
              <div class="provider-icon">
                <ng-container [ngSwitch]="detectedProvider()">
                  <svg *ngSwitchCase="'youtube'" width="24" height="24" viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <svg *ngSwitchCase="'vimeo'" width="24" height="24" viewBox="0 0 24 24" fill="#1AB7EA">
                    <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
                  </svg>
                  <svg *ngSwitchDefault width="24" height="24" viewBox="0 0 24 24" fill="#64748b">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </ng-container>
              </div>
              <div class="provider-details">
                <div class="provider-name">{{ getProviderName(detectedProvider()!) }}</div>
                <div class="video-title" *ngIf="videoMetadata()?.title">{{ videoMetadata()?.title }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Tab -->
        <div class="tab-content" *ngIf="activeTab() === 'upload' && config().enableUpload">
          <div class="upload-area"
               (click)="openFileUpload()"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)"
               [class.drag-over]="isDragOver()">
            <div class="upload-content">
              <div class="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </div>
              <div class="upload-text">
                <div class="primary-text">Drop video files here or click to upload</div>
                <div class="secondary-text">
                  Supports MP4, WebM, OGV up to {{ formatFileSize(maxFileSize()) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Upload Progress -->
          <div class="upload-progress" *ngIf="uploadProgress()">
            <div class="progress-info">
              <span class="file-name">{{ uploadProgress()?.file.name }}</span>
              <button type="button" class="cancel-btn" (click)="cancelUpload()">Cancel</button>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="uploadProgress()?.progress"></div>
            </div>
            <div class="progress-details">
              <span>{{ uploadProgress()?.progress }}%</span>
              <span *ngIf="uploadProgress()?.speed">{{ formatSpeed(uploadProgress()!.speed) }}</span>
            </div>
          </div>

          <input #fileInput
                 type="file"
                 accept="video/*"
                 style="display: none"
                 (change)="onFileSelected($event)">
        </div>

        <!-- Embed Code Tab -->
        <div class="tab-content" *ngIf="activeTab() === 'embed'">
          <div class="embed-input-container">
            <textarea class="embed-textarea"
                      placeholder="Paste video embed code here..."
                      [(ngModel)]="embedCode()"
                      rows="4"></textarea>
            <button type="button"
                    class="add-video-btn"
                    (click)="addVideoFromEmbed()"
                    [disabled]="!embedCode() || isLoading()">
              Add Video
            </button>
          </div>
        </div>

        <!-- Error Display -->
        <div class="error-message" *ngIf="error()">
          <div class="error-icon">⚠️</div>
          <div class="error-text">{{ error() }}</div>
          <button type="button" class="error-close" (click)="clearError()">×</button>
        </div>
      </div>

      <!-- Video Preview/Player -->
      <div class="video-preview" *ngIf="currentVideo()">
        <div class="video-header">
          <div class="video-info">
            <h3 class="video-title">{{ currentVideo()?.name || 'Video' }}</h3>
            <div class="video-meta">
              <span class="video-provider">{{ getProviderName(currentVideo()!.provider!) }}</span>
              <span class="video-duration" *ngIf="currentVideo()?.duration">
                {{ formatDuration(currentVideo()!.duration!) }}
              </span>
              <span class="video-dimensions" *ngIf="currentVideo()?.dimensions">
                {{ currentVideo()!.dimensions!.width }}×{{ currentVideo()!.dimensions!.height }}
              </span>
            </div>
          </div>
          <div class="video-actions">
            <button type="button" 
                    class="action-btn"
                    (click)="toggleVideoSettings()"
                    [class.active]="showSettings()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"/>
              </svg>
            </button>
            <button type="button" 
                    class="action-btn"
                    (click)="removeVideo()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6V20A2 2 0 0 1 17 20H7A2 2 0 0 1 5 20V6M8 6V4A2 2 0 0 1 10 4H14A2 2 0 0 1 16 4V6"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Video Settings Panel -->
        <div class="video-settings" *ngIf="showSettings()">
          <div class="settings-section">
            <label>Video Size:</label>
            <select class="size-select" [(ngModel)]="selectedSize()" (ngModelChange)="onSizeChange()">
              <option value="small">Small (320×240)</option>
              <option value="medium">Medium (640×480)</option>
              <option value="large">Large (854×480)</option>
              <option value="responsive">Responsive</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div class="settings-section" *ngIf="selectedSize() === 'custom'">
            <div class="dimension-inputs">
              <div class="input-group">
                <label>Width:</label>
                <input type="number" 
                       [(ngModel)]="customDimensions().width"
                       (ngModelChange)="onCustomDimensionsChange()"
                       min="100">
              </div>
              <div class="input-group">
                <label>Height:</label>
                <input type="number" 
                       [(ngModel)]="customDimensions().height"
                       (ngModelChange)="onCustomDimensionsChange()"
                       min="100">
              </div>
            </div>
          </div>

          <div class="settings-section">
            <label class="checkbox-label">
              <input type="checkbox" 
                     [(ngModel)]="videoOptions().autoplay">
              Autoplay
            </label>
          </div>

          <div class="settings-section">
            <label class="checkbox-label">
              <input type="checkbox" 
                     [(ngModel)]="videoOptions().controls">
              Show controls
            </label>
          </div>

          <div class="settings-section">
            <label class="checkbox-label">
              <input type="checkbox" 
                     [(ngModel)]="videoOptions().loop">
              Loop video
            </label>
          </div>

          <div class="settings-section">
            <label class="checkbox-label">
              <input type="checkbox" 
                     [(ngModel)]="videoOptions().muted">
              Muted
            </label>
          </div>
        </div>

        <!-- Video Player -->
        <div class="video-player-container" 
             [class.responsive]="selectedSize() === 'responsive'"
             [style.width]="getPlayerWidth()"
             [style.height]="getPlayerHeight()">
          
          <!-- YouTube Player -->
          <iframe *ngIf="currentVideo()?.provider === 'youtube'"
                  [src]="getYouTubeEmbedUrl()"
                  frameborder="0"
                  allowfullscreen
                  [attr.width]="getPlayerWidth()"
                  [attr.height]="getPlayerHeight()"
                  class="video-iframe">
          </iframe>

          <!-- Vimeo Player -->
          <iframe *ngIf="currentVideo()?.provider === 'vimeo'"
                  [src]="getVimeoEmbedUrl()"
                  frameborder="0"
                  allowfullscreen
                  [attr.width]="getPlayerWidth()"
                  [attr.height]="getPlayerHeight()"
                  class="video-iframe">
          </iframe>

          <!-- HTML5 Video Player -->
          <video *ngIf="currentVideo()?.provider === 'html5'"
                 [src]="currentVideo()?.url"
                 [poster]="currentVideo()?.posterUrl"
                 [autoplay]="videoOptions().autoplay"
                 [controls]="videoOptions().controls"
                 [loop]="videoOptions().loop"
                 [muted]="videoOptions().muted"
                 [width]="getPlayerWidth()"
                 [height]="getPlayerHeight()"
                 class="video-element">
            Your browser does not support the video tag.
          </video>

          <!-- Custom Embed -->
          <div *ngIf="currentVideo()?.provider === 'custom'"
               [innerHTML]="sanitizedEmbedCode()"
               class="custom-embed">
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading()">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingMessage() }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./video-embed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoEmbedComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  // Inputs
  readonly config = input<Partial<VideoConfig>>({
    enableEmbedding: true,
    enableUpload: false,
    providers: ['youtube', 'vimeo', 'html5'],
    responsiveSize: true
  });
  readonly showInput = input<boolean>(true);
  readonly initialVideo = input<VideoItem | null>(null);

  // Outputs
  readonly videoAdded = output<VideoItem>();
  readonly videoChanged = output<VideoItem>();
  readonly videoRemoved = output<string>();

  private readonly uploadService = inject(MediaUploadService);
  private readonly mediaManager = inject(MediaManagerService);
  private readonly sanitizer = inject(DomSanitizer);

  // Component state
  private readonly _activeTab = signal<string>('url');
  private readonly _videoUrl = signal<string>('');
  private readonly _embedCode = signal<string>('');
  private readonly _currentVideo = signal<VideoItem | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _loadingMessage = signal<string>('');
  private readonly _error = signal<string>('');
  private readonly _isDragOver = signal<boolean>(false);
  private readonly _uploadProgress = signal<any>(null);
  private readonly _showSettings = signal<boolean>(false);
  private readonly _selectedSize = signal<string>('responsive');
  private readonly _customDimensions = signal<VideoDimensions>({ width: 640, height: 480, aspectRatio: 4/3 });
  private readonly _videoOptions = signal<{
    autoplay: boolean;
    controls: boolean;
    loop: boolean;
    muted: boolean;
  }>({
    autoplay: false,
    controls: true,
    loop: false,
    muted: false
  });
  private readonly _videoMetadata = signal<any>(null);
  private readonly _detectedProvider = signal<VideoProvider | null>(null);

  // Computed properties
  readonly activeTab = this._activeTab.asReadonly();
  readonly videoUrl = this._videoUrl.asReadonly();
  readonly embedCode = this._embedCode.asReadonly();
  readonly currentVideo = this._currentVideo.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly loadingMessage = this._loadingMessage.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isDragOver = this._isDragOver.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly showSettings = this._showSettings.asReadonly();
  readonly selectedSize = this._selectedSize.asReadonly();
  readonly customDimensions = this._customDimensions.asReadonly();
  readonly videoOptions = this._videoOptions.asReadonly();
  readonly videoMetadata = this._videoMetadata.asReadonly();
  readonly detectedProvider = this._detectedProvider.asReadonly();

  readonly maxFileSize = computed(() => 100 * 1024 * 1024); // 100MB default
  readonly isValidUrl = computed(() => this.videoUrl().length > 0 && this.isValidVideoUrl(this.videoUrl()));
  readonly sanitizedEmbedCode = computed(() => 
    this.sanitizer.bypassSecurityTrustHtml(this.embedCode())
  );

  constructor() {
    // Set initial video if provided
    effect(() => {
      const initial = this.initialVideo();
      if (initial) {
        this._currentVideo.set(initial);
      }
    });
  }

  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  /**
   * Set active tab
   */
  setActiveTab(tab: string): void {
    this._activeTab.set(tab);
    this.clearError();
  }

  /**
   * Handle URL input changes
   */
  onUrlChange(url: string): void {
    this._videoUrl.set(url);
    
    if (url) {
      const provider = this.detectVideoProvider(url);
      this._detectedProvider.set(provider);
      
      if (provider) {
        this.fetchVideoMetadata(url, provider);
      }
    } else {
      this._detectedProvider.set(null);
      this._videoMetadata.set(null);
    }
  }

  /**
   * Add video from URL
   */
  async addVideoFromUrl(): Promise<void> {
    const url = this.videoUrl();
    const provider = this.detectVideoProvider(url);
    
    if (!provider) {
      this.setError('Unsupported video provider');
      return;
    }

    this._isLoading.set(true);
    this._loadingMessage.set('Adding video...');

    try {
      const videoId = this.extractVideoId(url, provider);
      const metadata = this.videoMetadata();

      const videoItem: VideoItem = {
        id: this.generateId(),
        type: 'video',
        name: metadata?.title || `${provider} video`,
        url,
        createdAt: new Date(),
        provider,
        videoId,
        duration: metadata?.duration,
        dimensions: metadata?.dimensions,
        posterUrl: metadata?.thumbnail,
        metadata: metadata
      };

      this._currentVideo.set(videoItem);
      this.mediaManager.addItem(videoItem);
      this.videoAdded.emit(videoItem);
      
      // Clear input
      this._videoUrl.set('');
      this._detectedProvider.set(null);
      this._videoMetadata.set(null);

    } catch (error) {
      this.setError('Failed to add video');
    } finally {
      this._isLoading.set(false);
      this._loadingMessage.set('');
    }
  }

  /**
   * Add video from embed code
   */
  addVideoFromEmbed(): void {
    const code = this.embedCode();
    if (!code) return;

    const videoItem: VideoItem = {
      id: this.generateId(),
      type: 'video',
      name: 'Embedded video',
      url: '',
      createdAt: new Date(),
      provider: 'custom',
      metadata: { embedCode: code }
    };

    this._currentVideo.set(videoItem);
    this.mediaManager.addItem(videoItem);
    this.videoAdded.emit(videoItem);
    
    // Clear input
    this._embedCode.set('');
  }

  /**
   * Open file upload dialog
   */
  openFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadVideoFile(input.files[0]);
    }
  }

  /**
   * Handle drag events
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this._isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    this._isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this._isDragOver.set(false);

    const files = Array.from(event.dataTransfer?.files || []);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      this.uploadVideoFile(videoFile);
    }
  }

  /**
   * Upload video file
   */
  private async uploadVideoFile(file: File): Promise<void> {
    // Validate file
    if (file.size > this.maxFileSize()) {
      this.setError(`File size exceeds ${this.formatFileSize(this.maxFileSize())}`);
      return;
    }

    this._isLoading.set(true);
    this._loadingMessage.set('Uploading video...');

    try {
      // Start upload
      const uploadObservable = this.uploadService.uploadFile(file);
      
      uploadObservable.subscribe({
        next: (result: UploadResult) => {
          if (result.success && result.url) {
            // Create video item
            const videoItem: VideoItem = {
              id: this.generateId(),
              type: 'video',
              name: file.name,
              size: file.size,
              mimeType: file.type,
              url: result.url,
              createdAt: new Date(),
              provider: 'html5',
              metadata: result.metadata
            };

            this._currentVideo.set(videoItem);
            this.mediaManager.addItem(videoItem);
            this.videoAdded.emit(videoItem);
          }
        },
        error: (error) => {
          this.setError('Upload failed: ' + error.message);
        },
        complete: () => {
          this._isLoading.set(false);
          this._loadingMessage.set('');
          this._uploadProgress.set(null);
        }
      });

    } catch (error) {
      this.setError('Failed to upload video');
      this._isLoading.set(false);
      this._loadingMessage.set('');
    }
  }

  /**
   * Cancel upload
   */
  cancelUpload(): void {
    // Implementation would cancel the upload
    this._uploadProgress.set(null);
  }

  /**
   * Toggle video settings panel
   */
  toggleVideoSettings(): void {
    this._showSettings.update(show => !show);
  }

  /**
   * Handle size selection change
   */
  onSizeChange(): void {
    const size = this.selectedSize();
    
    switch (size) {
      case 'small':
        this._customDimensions.set({ width: 320, height: 240, aspectRatio: 4/3 });
        break;
      case 'medium':
        this._customDimensions.set({ width: 640, height: 480, aspectRatio: 4/3 });
        break;
      case 'large':
        this._customDimensions.set({ width: 854, height: 480, aspectRatio: 16/9 });
        break;
    }

    this.updateVideoItem();
  }

  /**
   * Handle custom dimensions change
   */
  onCustomDimensionsChange(): void {
    this.updateVideoItem();
  }

  /**
   * Remove current video
   */
  removeVideo(): void {
    const video = this.currentVideo();
    if (video) {
      this._currentVideo.set(null);
      this.mediaManager.removeItem(video.id);
      this.videoRemoved.emit(video.id);
    }
  }

  /**
   * Get YouTube embed URL
   */
  getYouTubeEmbedUrl(): SafeResourceUrl {
    const video = this.currentVideo();
    if (!video?.videoId) return this.sanitizer.bypassSecurityTrustResourceUrl('');

    const options = this.videoOptions();
    const params = new URLSearchParams();
    
    if (options.autoplay) params.set('autoplay', '1');
    if (!options.controls) params.set('controls', '0');
    if (options.loop) params.set('loop', '1');
    if (options.muted) params.set('mute', '1');

    const url = `https://www.youtube.com/embed/${video.videoId}?${params.toString()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Get Vimeo embed URL
   */
  getVimeoEmbedUrl(): SafeResourceUrl {
    const video = this.currentVideo();
    if (!video?.videoId) return this.sanitizer.bypassSecurityTrustResourceUrl('');

    const options = this.videoOptions();
    const params = new URLSearchParams();
    
    if (options.autoplay) params.set('autoplay', '1');
    if (options.loop) params.set('loop', '1');
    if (options.muted) params.set('muted', '1');

    const url = `https://player.vimeo.com/video/${video.videoId}?${params.toString()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Get player width
   */
  getPlayerWidth(): string {
    const size = this.selectedSize();
    
    if (size === 'responsive') return '100%';
    
    const dimensions = this.customDimensions();
    return `${dimensions.width}px`;
  }

  /**
   * Get player height
   */
  getPlayerHeight(): string {
    const size = this.selectedSize();
    
    if (size === 'responsive') return 'auto';
    
    const dimensions = this.customDimensions();
    return `${dimensions.height}px`;
  }

  /**
   * Get provider display name
   */
  getProviderName(provider: VideoProvider): string {
    switch (provider) {
      case 'youtube': return 'YouTube';
      case 'vimeo': return 'Vimeo';
      case 'html5': return 'HTML5 Video';
      default: return 'Video';
    }
  }

  /**
   * Format duration in seconds to readable format
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format file size
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
   * Detect video provider from URL
   */
  private detectVideoProvider(url: string): VideoProvider | null {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    if (url.match(/\.(mp4|webm|ogv)$/i)) {
      return 'html5';
    }
    return null;
  }

  /**
   * Extract video ID from URL
   */
  private extractVideoId(url: string, provider: VideoProvider): string {
    switch (provider) {
      case 'youtube':
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return ytMatch ? ytMatch[1] : '';
      
      case 'vimeo':
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        return vimeoMatch ? vimeoMatch[1] : '';
      
      default:
        return '';
    }
  }

  /**
   * Validate video URL
   */
  private isValidVideoUrl(url: string): boolean {
    try {
      new URL(url);
      return this.detectVideoProvider(url) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Fetch video metadata
   */
  private async fetchVideoMetadata(url: string, provider: VideoProvider): Promise<void> {
    // In a real implementation, this would make API calls to get video metadata
    // For now, we'll simulate basic metadata extraction
    
    try {
      const videoId = this.extractVideoId(url, provider);
      
      // Simulated metadata (in real app, would fetch from APIs)
      const metadata = {
        title: `${provider} Video - ${videoId}`,
        duration: 0, // Would be fetched from API
        thumbnail: '', // Would be fetched from API
        dimensions: { width: 640, height: 480, aspectRatio: 4/3 }
      };

      this._videoMetadata.set(metadata);
    } catch (error) {
      console.warn('Failed to fetch video metadata:', error);
    }
  }

  /**
   * Update current video item
   */
  private updateVideoItem(): void {
    const video = this.currentVideo();
    if (!video) return;

    const updatedVideo: VideoItem = {
      ...video,
      dimensions: this.customDimensions(),
      updatedAt: new Date()
    };

    this._currentVideo.set(updatedVideo);
    this.mediaManager.updateItem(video.id, updatedVideo);
    this.videoChanged.emit(updatedVideo);
  }

  /**
   * Set error message
   */
  private setError(message: string): void {
    this._error.set(message);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this._error.set('');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}