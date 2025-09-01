/**
 * Image editor configuration
 */
export interface ImageEditorConfig {
  /** Enable resize controls */
  enableResize?: boolean;
  /** Enable crop functionality */
  enableCrop?: boolean;
  /** Enable rotation */
  enableRotation?: boolean;
  /** Enable flip operations */
  enableFlip?: boolean;
  /** Enable aspect ratio constraints */
  enableAspectRatio?: boolean;
  /** Predefined aspect ratios */
  aspectRatios?: AspectRatio[];
  /** Maximum canvas size */
  maxCanvasSize?: number;
  /** Image quality for output */
  outputQuality?: number;
  /** Output format */
  outputFormat?: string;
}

/**
 * Aspect ratio definition
 */
export interface AspectRatio {
  /** Display label */
  label: string;
  /** Ratio value (width/height) */
  value: number;
  /** Width component */
  width: number;
  /** Height component */
  height: number;
  /** Icon for UI */
  icon?: string;
}

/**
 * Crop area definition
 */
export interface CropArea {
  /** X coordinate of crop area */
  x: number;
  /** Y coordinate of crop area */
  y: number;
  /** Width of crop area */
  width: number;
  /** Height of crop area */
  height: number;
  /** Aspect ratio constraint */
  aspectRatio?: number;
}

/**
 * Image transformation operations
 */
export interface ImageTransformation {
  /** Crop settings */
  crop?: CropArea;
  /** Resize settings */
  resize?: ResizeSettings;
  /** Rotation angle in degrees */
  rotation?: number;
  /** Flip operations */
  flip?: FlipSettings;
  /** Filter effects */
  filters?: FilterSettings;
}

/**
 * Resize settings
 */
export interface ResizeSettings {
  /** Target width */
  width?: number;
  /** Target height */
  height?: number;
  /** Maintain aspect ratio */
  maintainAspectRatio?: boolean;
  /** Resize algorithm */
  algorithm?: ResizeAlgorithm;
}

/**
 * Flip settings
 */
export interface FlipSettings {
  /** Flip horizontally */
  horizontal?: boolean;
  /** Flip vertically */
  vertical?: boolean;
}

/**
 * Filter settings
 */
export interface FilterSettings {
  /** Brightness adjustment (-100 to 100) */
  brightness?: number;
  /** Contrast adjustment (-100 to 100) */
  contrast?: number;
  /** Saturation adjustment (-100 to 100) */
  saturation?: number;
  /** Blur amount (0 to 10) */
  blur?: number;
  /** Sepia effect (0 to 1) */
  sepia?: number;
  /** Grayscale effect (0 to 1) */
  grayscale?: number;
}

/**
 * Image editor state
 */
export interface ImageEditorState {
  /** Original image data */
  originalImage: HTMLImageElement;
  /** Current image data */
  currentImage: HTMLImageElement;
  /** Applied transformations */
  transformations: ImageTransformation;
  /** Canvas dimensions */
  canvasSize: { width: number; height: number };
  /** Zoom level */
  zoom: number;
  /** Pan offset */
  pan: { x: number; y: number };
  /** History of changes */
  history: ImageTransformation[];
  /** Current history position */
  historyIndex: number;
}

/**
 * Resize algorithms
 */
export enum ResizeAlgorithm {
  Bilinear = 'bilinear',
  Bicubic = 'bicubic',
  Lanczos = 'lanczos',
  Nearest = 'nearest'
}

/**
 * Image editor events
 */
export interface ImageEditorEvents {
  /** Image loaded */
  onImageLoaded?: (image: HTMLImageElement) => void;
  /** Transformation applied */
  onTransformationApplied?: (transformation: ImageTransformation) => void;
  /** Crop area changed */
  onCropChanged?: (cropArea: CropArea) => void;
  /** Editor state changed */
  onStateChanged?: (state: ImageEditorState) => void;
  /** Image saved */
  onImageSaved?: (imageData: string, format: string) => void;
}

/**
 * Drawing tool state
 */
export interface DrawingToolState {
  /** Active tool */
  activeTool: DrawingTool;
  /** Brush settings */
  brush: BrushSettings;
  /** Shape settings */
  shape: ShapeSettings;
  /** Text settings */
  text: TextSettings;
}

/**
 * Drawing tools
 */
export enum DrawingTool {
  None = 'none',
  Brush = 'brush',
  Eraser = 'eraser',
  Rectangle = 'rectangle',
  Circle = 'circle',
  Line = 'line',
  Arrow = 'arrow',
  Text = 'text'
}

/**
 * Brush settings
 */
export interface BrushSettings {
  /** Brush size */
  size: number;
  /** Brush color */
  color: string;
  /** Brush opacity */
  opacity: number;
  /** Brush hardness */
  hardness: number;
}

/**
 * Shape settings
 */
export interface ShapeSettings {
  /** Stroke color */
  strokeColor: string;
  /** Fill color */
  fillColor: string;
  /** Stroke width */
  strokeWidth: number;
  /** Fill opacity */
  fillOpacity: number;
}

/**
 * Text settings
 */
export interface TextSettings {
  /** Font family */
  fontFamily: string;
  /** Font size */
  fontSize: number;
  /** Font color */
  color: string;
  /** Font weight */
  fontWeight: string;
  /** Text alignment */
  alignment: 'left' | 'center' | 'right';
}