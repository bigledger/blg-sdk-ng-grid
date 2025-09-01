/**
 * Main configuration interface for the media handling system
 */
export interface MediaConfig {
  /** Upload configuration */
  upload?: UploadConfig;
  /** Image processing configuration */
  image?: ImageConfig;
  /** Video configuration */
  video?: VideoConfig;
  /** File attachment configuration */
  files?: FileConfig;
  /** UI configuration */
  ui?: UIConfig;
}

/**
 * Upload configuration options
 */
export interface UploadConfig {
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Maximum number of files for batch upload */
  maxFiles?: number;
  /** Allowed file types */
  allowedTypes?: string[];
  /** Enable drag and drop upload */
  dragAndDrop?: boolean;
  /** Enable clipboard paste upload */
  clipboardPaste?: boolean;
  /** Upload endpoint URL */
  uploadUrl?: string;
  /** Custom upload handler */
  uploadHandler?: (file: File) => Promise<string>;
  /** Upload headers */
  headers?: Record<string, string>;
}

/**
 * Image processing configuration
 */
export interface ImageConfig {
  /** Enable image editing */
  enableEditing?: boolean;
  /** Maximum image width */
  maxWidth?: number;
  /** Maximum image height */
  maxHeight?: number;
  /** Image quality (0-1) */
  quality?: number;
  /** Enable image optimization */
  optimization?: boolean;
  /** Enable lazy loading */
  lazyLoading?: boolean;
  /** Enable base64 embedding */
  base64Embedding?: boolean;
  /** Image formats to support */
  formats?: string[];
}

/**
 * Video configuration
 */
export interface VideoConfig {
  /** Enable video embedding */
  enableEmbedding?: boolean;
  /** Enable HTML5 video upload */
  enableUpload?: boolean;
  /** Supported video providers */
  providers?: VideoProvider[];
  /** Video quality options */
  qualities?: string[];
  /** Enable responsive sizing */
  responsiveSize?: boolean;
}

/**
 * File attachment configuration
 */
export interface FileConfig {
  /** Maximum file size for attachments */
  maxAttachmentSize?: number;
  /** Allowed attachment types */
  allowedAttachmentTypes?: string[];
  /** Enable file preview */
  enablePreview?: boolean;
  /** Download security settings */
  downloadSecurity?: boolean;
}

/**
 * UI configuration options
 */
export interface UIConfig {
  /** Show upload progress */
  showProgress?: boolean;
  /** Show file size */
  showFileSize?: boolean;
  /** Show thumbnails */
  showThumbnails?: boolean;
  /** Theme configuration */
  theme?: 'light' | 'dark' | 'auto';
  /** Custom CSS classes */
  customClasses?: Record<string, string>;
}

/**
 * Supported video providers
 */
export type VideoProvider = 'youtube' | 'vimeo' | 'html5';