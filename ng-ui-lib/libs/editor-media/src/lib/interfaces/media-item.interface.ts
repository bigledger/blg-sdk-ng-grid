/**
 * Base interface for all media items
 */
export interface MediaItem {
  /** Unique identifier */
  id: string;
  /** Media type */
  type: MediaType;
  /** File name */
  name: string;
  /** File size in bytes */
  size?: number;
  /** MIME type */
  mimeType?: string;
  /** Created timestamp */
  createdAt: Date;
  /** Updated timestamp */
  updatedAt?: Date;
  /** Media URL */
  url: string;
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** Alt text for accessibility */
  altText?: string;
  /** Caption */
  caption?: string;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Image media item with image-specific properties
 */
export interface ImageItem extends MediaItem {
  type: 'image';
  /** Image dimensions */
  dimensions?: ImageDimensions;
  /** Image format */
  format?: string;
  /** Original image URL (before processing) */
  originalUrl?: string;
  /** Image variants for responsive loading */
  variants?: ImageVariant[];
}

/**
 * Video media item with video-specific properties
 */
export interface VideoItem extends MediaItem {
  type: 'video';
  /** Video duration in seconds */
  duration?: number;
  /** Video dimensions */
  dimensions?: VideoDimensions;
  /** Video provider */
  provider?: VideoProvider;
  /** Video ID (for embedded videos) */
  videoId?: string;
  /** Poster image URL */
  posterUrl?: string;
  /** Video quality options */
  qualities?: VideoQuality[];
}

/**
 * File attachment item
 */
export interface FileItem extends MediaItem {
  type: 'file';
  /** File extension */
  extension?: string;
  /** Download count */
  downloadCount?: number;
  /** File icon */
  iconUrl?: string;
}

/**
 * Media types
 */
export type MediaType = 'image' | 'video' | 'file';

/**
 * Image dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio?: number;
}

/**
 * Video dimensions
 */
export interface VideoDimensions {
  width: number;
  height: number;
  aspectRatio?: number;
}

/**
 * Image variant for responsive loading
 */
export interface ImageVariant {
  url: string;
  width: number;
  height: number;
  descriptor: string; // e.g., '1x', '2x', '480w'
}

/**
 * Video quality option
 */
export interface VideoQuality {
  label: string;
  value: string;
  url?: string;
}

/**
 * Video provider type
 */
export type VideoProvider = 'youtube' | 'vimeo' | 'html5';