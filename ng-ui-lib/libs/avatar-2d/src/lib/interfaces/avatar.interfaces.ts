/**
 * Core interfaces for the 2D Avatar System
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface AnimationFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  duration?: number;
}

export interface SpriteSheet {
  image: HTMLImageElement | string;
  frameWidth: number;
  frameHeight: number;
  frames: AnimationFrame[];
}

export interface CharacterTemplate {
  id: string;
  name: string;
  gender: 'male' | 'female';
  ageGroup: 'young' | 'middle-aged' | 'elderly';
  bodyType: 'slim' | 'average' | 'athletic' | 'heavy';
  skinTone: ColorRGBA;
  baseLayers: BodyLayer[];
}

export interface BodyLayer {
  id: string;
  name: string;
  type: LayerType;
  zIndex: number;
  visible: boolean;
  opacity: number;
  spriteSheet?: SpriteSheet;
  color?: ColorRGBA;
  position: Vector2D;
  size: Size2D;
  anchor: Vector2D; // Anchor point for rotations/scaling
}

export type LayerType = 
  | 'body' 
  | 'head' 
  | 'hair' 
  | 'eyes' 
  | 'eyebrows' 
  | 'nose' 
  | 'mouth' 
  | 'clothing-top' 
  | 'clothing-bottom' 
  | 'accessories'
  | 'hands'
  | 'feet';

export interface FacialExpression {
  id: string;
  name: string;
  eyeState: EyeState;
  eyebrowState: EyebrowState;
  mouthState: MouthState;
  duration?: number;
  easing?: AnimationEasing;
}

export interface EyeState {
  leftEye: {
    openness: number; // 0 = closed, 1 = fully open
    direction: Vector2D; // Gaze direction
  };
  rightEye: {
    openness: number;
    direction: Vector2D;
  };
  blinkSpeed: number;
}

export interface EyebrowState {
  leftBrow: {
    height: number; // -1 = lowered, 0 = neutral, 1 = raised
    angle: number; // Rotation in radians
  };
  rightBrow: {
    height: number;
    angle: number;
  };
}

export interface MouthState {
  shape: VisemeShape;
  openness: number; // 0 = closed, 1 = fully open
  width: number; // Mouth width multiplier
  corners: number; // -1 = frown, 0 = neutral, 1 = smile
}

export type VisemeShape = 
  | 'neutral' 
  | 'A' | 'E' | 'I' | 'O' | 'U' 
  | 'B' | 'C' | 'D' | 'F' | 'G' 
  | 'K' | 'L' | 'M' | 'N' | 'P' 
  | 'R' | 'S' | 'T' | 'V' | 'W' 
  | 'Y' | 'Z';

export interface Gesture {
  id: string;
  name: string;
  type: GestureType;
  frames: GestureFrame[];
  duration: number;
  loop: boolean;
}

export type GestureType = 
  | 'wave' 
  | 'point' 
  | 'thumbs-up' 
  | 'clap' 
  | 'nod' 
  | 'shake-head' 
  | 'shrug' 
  | 'idle' 
  | 'thinking'
  | 'counting';

export interface GestureFrame {
  timestamp: number;
  bodyParts: {
    [layerId: string]: BodyPartTransform;
  };
  easing?: AnimationEasing;
}

export interface BodyPartTransform {
  position?: Vector2D;
  rotation?: number;
  scale?: Vector2D;
  opacity?: number;
}

export type AnimationEasing = 
  | 'linear' 
  | 'ease-in' 
  | 'ease-out' 
  | 'ease-in-out' 
  | 'bounce' 
  | 'elastic';

export interface LipSyncData {
  phonemes: PhonemeData[];
  totalDuration: number;
}

export interface PhonemeData {
  phoneme: string;
  startTime: number;
  endTime: number;
  viseme: VisemeShape;
  amplitude: number; // Audio amplitude for that phoneme
}

export interface AvatarConfiguration {
  character: CharacterTemplate;
  layers: BodyLayer[];
  customizations: {
    skinColor?: ColorRGBA;
    hairColor?: ColorRGBA;
    eyeColor?: ColorRGBA;
    clothingColors?: { [layerId: string]: ColorRGBA };
  };
  animations: {
    idleAnimation?: Gesture;
    blinkFrequency: number;
    breathingAnimation?: Gesture;
  };
}

export interface RenderingOptions {
  renderMode: 'canvas' | 'svg';
  size: Size2D;
  quality: 'low' | 'medium' | 'high';
  antialiasing: boolean;
  backgroundTransparent: boolean;
  backgroundColor?: ColorRGBA;
}

export interface AvatarState {
  currentExpression: FacialExpression;
  currentGesture?: Gesture;
  gestureProgress: number; // 0-1
  lipSyncData?: LipSyncData;
  lipSyncProgress: number; // Current time in lip sync
  isAnimating: boolean;
  animationQueue: Array<Gesture | FacialExpression>;
}

export interface AvatarEvents {
  expressionChanged: FacialExpression;
  gestureStarted: Gesture;
  gestureCompleted: Gesture;
  lipSyncStarted: LipSyncData;
  lipSyncCompleted: void;
  animationFrame: number;
  configurationChanged: AvatarConfiguration;
}