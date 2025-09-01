/**
 * Upload progress information
 */
export interface UploadProgress {
  /** File being uploaded */
  file: File;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Upload status */
  status: UploadStatus;
  /** Upload speed in bytes per second */
  speed?: number;
  /** Estimated time remaining in seconds */
  timeRemaining?: number;
  /** Error message if upload failed */
  error?: string;
  /** Uploaded file URL (when completed) */
  url?: string;
}

/**
 * Upload status enumeration
 */
export enum UploadStatus {
  Pending = 'pending',
  Uploading = 'uploading',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled'
}

/**
 * Upload result
 */
export interface UploadResult {
  /** Success flag */
  success: boolean;
  /** Uploaded file URL */
  url?: string;
  /** Error message */
  error?: string;
  /** File metadata */
  metadata?: Record<string, any>;
}

/**
 * Batch upload result
 */
export interface BatchUploadResult {
  /** Total files processed */
  total: number;
  /** Successfully uploaded files */
  successful: number;
  /** Failed uploads */
  failed: number;
  /** Upload results for each file */
  results: UploadResult[];
}

/**
 * File validation result
 */
export interface FileValidationResult {
  /** Validation passed */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** File size */
  size?: number;
  /** File type */
  type?: string;
}

/**
 * Upload options
 */
export interface UploadOptions {
  /** Custom upload URL */
  url?: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Form data fields */
  formData?: Record<string, string>;
  /** Progress callback */
  onProgress?: (progress: number) => void;
  /** Enable chunked upload */
  chunked?: boolean;
  /** Chunk size in bytes */
  chunkSize?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
}

/**
 * Drag and drop event data
 */
export interface DropEventData {
  /** Files dropped */
  files: FileList;
  /** Event coordinates */
  coordinates?: {
    x: number;
    y: number;
  };
  /** Original drag event */
  originalEvent: DragEvent;
}

/**
 * Clipboard paste event data
 */
export interface PasteEventData {
  /** Files from clipboard */
  files: File[];
  /** Text content */
  text?: string;
  /** HTML content */
  html?: string;
  /** Original clipboard event */
  originalEvent: ClipboardEvent;
}