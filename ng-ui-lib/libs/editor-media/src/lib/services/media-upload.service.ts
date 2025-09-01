import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, from, of, throwError } from 'rxjs';
import { map, catchError, finalize, tap } from 'rxjs/operators';

import { 
  UploadConfig, 
  UploadProgress, 
  UploadResult, 
  UploadStatus, 
  BatchUploadResult,
  FileValidationResult,
  UploadOptions,
  MediaConfig
} from '../interfaces';

/**
 * Service for handling media uploads with progress tracking, validation, and batch operations
 */
@Injectable({
  providedIn: 'root'
})
export class MediaUploadService {
  private readonly _uploads = signal<Map<string, UploadProgress>>(new Map());
  private readonly _config = signal<UploadConfig>({
    maxFileSize: 10 * 1024 * 1024, // 10MB default
    maxFiles: 10,
    allowedTypes: ['image/*', 'video/*'],
    dragAndDrop: true,
    clipboardPaste: true
  });

  /** Current upload progress for all files */
  readonly uploads = computed(() => Array.from(this._uploads().values()));

  /** Active uploads count */
  readonly activeUploadsCount = computed(() => 
    this.uploads().filter(upload => upload.status === UploadStatus.Uploading).length
  );

  /** Completed uploads count */
  readonly completedUploadsCount = computed(() =>
    this.uploads().filter(upload => upload.status === UploadStatus.Completed).length
  );

  /** Failed uploads count */
  readonly failedUploadsCount = computed(() =>
    this.uploads().filter(upload => upload.status === UploadStatus.Failed).length
  );

  /** Overall progress percentage */
  readonly overallProgress = computed(() => {
    const uploads = this.uploads();
    if (uploads.length === 0) return 0;
    
    const totalProgress = uploads.reduce((sum, upload) => sum + upload.progress, 0);
    return Math.round(totalProgress / uploads.length);
  });

  private readonly uploadComplete$ = new Subject<UploadResult>();
  private readonly uploadError$ = new Subject<{file: File, error: string}>();
  private readonly batchComplete$ = new Subject<BatchUploadResult>();

  constructor(private http: HttpClient) {}

  /**
   * Configure the upload service
   */
  configure(config: Partial<MediaConfig>): void {
    if (config.upload) {
      this._config.update(current => ({ ...current, ...config.upload }));
    }
  }

  /**
   * Upload a single file
   */
  uploadFile(file: File, options?: UploadOptions): Observable<UploadResult> {
    const fileId = this.generateFileId(file);
    const config = this._config();

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      this.updateUploadProgress(fileId, {
        file,
        progress: 0,
        status: UploadStatus.Failed,
        error: validation.error
      });
      return throwError(() => new Error(validation.error));
    }

    // Initialize progress tracking
    this.updateUploadProgress(fileId, {
      file,
      progress: 0,
      status: UploadStatus.Pending
    });

    // Use custom upload handler if provided
    if (config.uploadHandler || options?.url) {
      return this.handleCustomUpload(fileId, file, options);
    }

    // Default upload implementation
    return this.performUpload(fileId, file, options);
  }

  /**
   * Upload multiple files
   */
  uploadFiles(files: FileList | File[], options?: UploadOptions): Observable<BatchUploadResult> {
    const fileArray = Array.from(files);
    const maxFiles = this._config().maxFiles || 10;
    
    if (fileArray.length > maxFiles) {
      return throwError(() => new Error(`Maximum ${maxFiles} files allowed`));
    }

    const uploadObservables = fileArray.map(file => 
      this.uploadFile(file, options).pipe(
        catchError(error => of({ success: false, error: error.message }))
      )
    );

    return from(Promise.all(uploadObservables.map(obs => obs.toPromise()))).pipe(
      map(results => {
        const successful = results.filter(r => r?.success).length;
        const failed = results.length - successful;
        
        const batchResult: BatchUploadResult = {
          total: results.length,
          successful,
          failed,
          results: results as UploadResult[]
        };

        this.batchComplete$.next(batchResult);
        return batchResult;
      })
    );
  }

  /**
   * Cancel upload by file ID
   */
  cancelUpload(fileId: string): void {
    this.updateUploadProgress(fileId, {
      file: this._uploads().get(fileId)?.file!,
      progress: 0,
      status: UploadStatus.Cancelled
    });
  }

  /**
   * Retry failed upload
   */
  retryUpload(fileId: string, options?: UploadOptions): Observable<UploadResult> {
    const upload = this._uploads().get(fileId);
    if (!upload || upload.status !== UploadStatus.Failed) {
      return throwError(() => new Error('Upload not found or not in failed state'));
    }

    return this.uploadFile(upload.file, options);
  }

  /**
   * Clear upload history
   */
  clearUploads(): void {
    this._uploads.set(new Map());
  }

  /**
   * Validate file against configuration
   */
  validateFile(file: File): FileValidationResult {
    const config = this._config();

    // Check file size
    if (config.maxFileSize && file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size ${this.formatFileSize(config.maxFileSize)}`
      };
    }

    // Check file type
    if (config.allowedTypes && !this.isFileTypeAllowed(file.type, config.allowedTypes)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    return { valid: true, size: file.size, type: file.type };
  }

  /**
   * Get upload progress observable
   */
  getUploadProgress(fileId: string): Observable<UploadProgress | undefined> {
    return new BehaviorSubject(this._uploads().get(fileId));
  }

  /**
   * Get upload completion observable
   */
  get onUploadComplete(): Observable<UploadResult> {
    return this.uploadComplete$.asObservable();
  }

  /**
   * Get upload error observable
   */
  get onUploadError(): Observable<{file: File, error: string}> {
    return this.uploadError$.asObservable();
  }

  /**
   * Get batch completion observable
   */
  get onBatchComplete(): Observable<BatchUploadResult> {
    return this.batchComplete$.asObservable();
  }

  private performUpload(fileId: string, file: File, options?: UploadOptions): Observable<UploadResult> {
    const config = this._config();
    const uploadUrl = options?.url || config.uploadUrl || '/api/upload';
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add custom form data
    if (options?.formData) {
      Object.entries(options.formData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Prepare headers
    const headers = new HttpHeaders({
      ...config.headers,
      ...options?.headers
    });

    this.updateUploadProgress(fileId, {
      file,
      progress: 0,
      status: UploadStatus.Uploading
    });

    const startTime = Date.now();

    return this.http.post(uploadUrl, formData, {
      headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round((event.loaded / event.total) * 100);
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = event.loaded / elapsed;
          const timeRemaining = (event.total - event.loaded) / speed;

          this.updateUploadProgress(fileId, {
            file,
            progress,
            status: UploadStatus.Uploading,
            speed,
            timeRemaining
          });

          options?.onProgress?.(progress);
        }
      }),
      map(event => {
        if (event.type === HttpEventType.Response) {
          const result: UploadResult = {
            success: true,
            url: (event.body as any)?.url || (event.body as any)?.data?.url,
            metadata: event.body as any
          };

          this.updateUploadProgress(fileId, {
            file,
            progress: 100,
            status: UploadStatus.Completed,
            url: result.url
          });

          this.uploadComplete$.next(result);
          return result;
        }
        return { success: false };
      }),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Upload failed';
        
        this.updateUploadProgress(fileId, {
          file,
          progress: 0,
          status: UploadStatus.Failed,
          error: errorMessage
        });

        this.uploadError$.next({ file, error: errorMessage });
        
        return throwError(() => ({ success: false, error: errorMessage }));
      }),
      finalize(() => {
        // Clean up if needed
      })
    );
  }

  private handleCustomUpload(fileId: string, file: File, options?: UploadOptions): Observable<UploadResult> {
    const config = this._config();
    
    this.updateUploadProgress(fileId, {
      file,
      progress: 0,
      status: UploadStatus.Uploading
    });

    if (config.uploadHandler) {
      return from(config.uploadHandler(file)).pipe(
        map(url => {
          this.updateUploadProgress(fileId, {
            file,
            progress: 100,
            status: UploadStatus.Completed,
            url
          });

          const result: UploadResult = { success: true, url };
          this.uploadComplete$.next(result);
          return result;
        }),
        catchError(error => {
          const errorMessage = error.message || 'Custom upload failed';
          
          this.updateUploadProgress(fileId, {
            file,
            progress: 0,
            status: UploadStatus.Failed,
            error: errorMessage
          });

          this.uploadError$.next({ file, error: errorMessage });
          return throwError(() => ({ success: false, error: errorMessage }));
        })
      );
    }

    return throwError(() => ({ success: false, error: 'No upload handler configured' }));
  }

  private updateUploadProgress(fileId: string, progress: Partial<UploadProgress>): void {
    this._uploads.update(uploads => {
      const existing = uploads.get(fileId) || { 
        file: progress.file!, 
        progress: 0, 
        status: UploadStatus.Pending 
      };
      
      uploads.set(fileId, { ...existing, ...progress });
      return new Map(uploads);
    });
  }

  private generateFileId(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`;
  }

  private isFileTypeAllowed(fileType: string, allowedTypes: string[]): boolean {
    return allowedTypes.some(allowed => {
      if (allowed.includes('*')) {
        const baseType = allowed.split('/')[0];
        return fileType.startsWith(baseType);
      }
      return fileType === allowed;
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}