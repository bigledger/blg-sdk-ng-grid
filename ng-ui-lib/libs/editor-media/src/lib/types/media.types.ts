/**
 * Media alignment options
 */
export type MediaAlignment = 'left' | 'center' | 'right' | 'justify';

/**
 * Text wrapping options
 */
export type TextWrapping = 'none' | 'wrap' | 'square' | 'tight' | 'through';

/**
 * Media sizing options
 */
export type MediaSizing = 'auto' | 'cover' | 'contain' | 'fill' | 'custom';

/**
 * Video embed types
 */
export type VideoEmbedType = 'iframe' | 'html5' | 'custom';

/**
 * File type categories
 */
export type FileTypeCategory = 'image' | 'video' | 'document' | 'audio' | 'archive' | 'other';

/**
 * Upload method
 */
export type UploadMethod = 'drag-drop' | 'click' | 'paste' | 'url';

/**
 * Image loading strategy
 */
export type ImageLoadingStrategy = 'eager' | 'lazy' | 'auto';

/**
 * Media display mode
 */
export type MediaDisplayMode = 'inline' | 'block' | 'lightbox' | 'modal';

/**
 * Toolbar position
 */
export type ToolbarPosition = 'top' | 'bottom' | 'left' | 'right' | 'floating';

/**
 * Gallery view mode
 */
export type GalleryViewMode = 'grid' | 'list' | 'thumbnails';

/**
 * Sort options for media gallery
 */
export type MediaSortBy = 'name' | 'date' | 'size' | 'type';

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Media filter options
 */
export interface MediaFilter {
  /** File type filter */
  type?: MediaType | MediaType[];
  /** Size range filter */
  sizeRange?: {
    min?: number;
    max?: number;
  };
  /** Date range filter */
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  /** Search query */
  search?: string;
  /** Tags filter */
  tags?: string[];
}

/**
 * Media validation rules
 */
export interface MediaValidationRule {
  /** Rule type */
  type: 'fileSize' | 'fileType' | 'dimensions' | 'aspectRatio' | 'custom';
  /** Rule value */
  value: any;
  /** Error message */
  message: string;
  /** Validation function (for custom rules) */
  validator?: (file: File) => boolean;
}

/**
 * Error types for media operations
 */
export enum MediaErrorType {
  InvalidFileType = 'INVALID_FILE_TYPE',
  FileTooLarge = 'FILE_TOO_LARGE',
  UploadFailed = 'UPLOAD_FAILED',
  ProcessingFailed = 'PROCESSING_FAILED',
  NetworkError = 'NETWORK_ERROR',
  ValidationError = 'VALIDATION_ERROR',
  PermissionDenied = 'PERMISSION_DENIED',
  QuotaExceeded = 'QUOTA_EXCEEDED'
}

/**
 * Media operation result
 */
export interface MediaOperationResult<T = any> {
  /** Success flag */
  success: boolean;
  /** Result data */
  data?: T;
  /** Error information */
  error?: {
    type: MediaErrorType;
    message: string;
    details?: any;
  };
}

/**
 * Media toolbar action
 */
export interface MediaToolbarAction {
  /** Action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon identifier */
  icon: string;
  /** Action handler */
  action: (media: MediaItem) => void;
  /** Show condition */
  condition?: (media: MediaItem) => boolean;
  /** Keyboard shortcut */
  shortcut?: string;
}

/**
 * Media context menu item
 */
export interface MediaContextMenuItem {
  /** Item identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon identifier */
  icon?: string;
  /** Click handler */
  action: (media: MediaItem) => void;
  /** Show condition */
  condition?: (media: MediaItem) => boolean;
  /** Separator flag */
  separator?: boolean;
  /** Submenu items */
  children?: MediaContextMenuItem[];
}

/**
 * Media picker options
 */
export interface MediaPickerOptions {
  /** Allow multiple selection */
  multiple?: boolean;
  /** Filter by media type */
  accept?: MediaType[];
  /** Maximum selections */
  maxSelections?: number;
  /** Initial view mode */
  viewMode?: GalleryViewMode;
  /** Show upload button */
  showUpload?: boolean;
  /** Show URL input */
  showUrlInput?: boolean;
}

/**
 * Re-export media types from interfaces
 */
export type { MediaType, MediaItem, ImageItem, VideoItem, FileItem, VideoProvider } from '../interfaces/media-item.interface';
export type { UploadStatus, UploadProgress, UploadResult } from '../interfaces/upload.interface';
export type { ImageTransformation, CropArea, ResizeSettings } from '../interfaces/image-editor.interface';