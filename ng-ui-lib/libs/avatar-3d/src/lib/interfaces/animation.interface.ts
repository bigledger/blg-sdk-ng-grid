import * as THREE from 'three';

/**
 * Animation system interfaces for 3D avatars
 */

/**
 * Skeletal animation interface
 */
export interface SkeletalAnimation {
  /** Animation name */
  name: string;
  /** Animation clip */
  clip: THREE.AnimationClip;
  /** Animation action */
  action?: THREE.AnimationAction;
  /** Loop mode */
  loop: THREE.AnimationActionLoopStyles;
  /** Animation weight */
  weight: number;
  /** Fade in duration */
  fadeInDuration?: number;
  /** Fade out duration */
  fadeOutDuration?: number;
  /** Time scale */
  timeScale?: number;
  /** Start time offset */
  startTime?: number;
  /** End time offset */
  endTime?: number;
  /** Additive blending */
  additive?: boolean;
  /** Animation layers */
  layer?: number;
}

/**
 * Morph target animation interface
 */
export interface MorphTargetAnimation {
  /** Target name */
  name: string;
  /** Target weight (0-1) */
  weight: number;
  /** Animation duration */
  duration: number;
  /** Easing function */
  easing?: (t: number) => number;
  /** Start delay */
  delay?: number;
  /** Loop count */
  repeat?: number;
  /** Yoyo effect */
  yoyo?: boolean;
  /** Animation group */
  group?: string;
}

/**
 * Facial Action Unit (FACS) interface
 */
export interface FacialActionUnit {
  /** AU number (1-52 based on FACS) */
  auNumber: number;
  /** AU name */
  name: string;
  /** AU description */
  description: string;
  /** Intensity (0-5 based on FACS scale) */
  intensity: number;
  /** Associated morph targets */
  morphTargets: Array<{
    name: string;
    weight: number;
    influence: number;
  }>;
  /** Muscle groups affected */
  muscleGroups: string[];
  /** Bilateral (affects both sides) */
  bilateral: boolean;
}

/**
 * Facial expression system interface
 */
export interface FacialExpressionSystem {
  /** Active facial action units */
  activeAUs: Map<number, FacialActionUnit>;
  /** Expression presets */
  expressions: Map<string, FacialExpression>;
  /** Current expression blend */
  currentBlend: ExpressionBlend;
  /** Eye tracking data */
  eyeTracking?: EyeTrackingData;
  /** Blink system */
  blinkSystem: BlinkSystem;
}

/**
 * Expression blend interface
 */
export interface ExpressionBlend {
  /** Primary expression */
  primary: {
    expression: string;
    weight: number;
  };
  /** Secondary expressions for blending */
  secondary: Array<{
    expression: string;
    weight: number;
    blendMode: 'add' | 'multiply' | 'overlay';
  }>;
  /** Transition duration */
  transitionDuration: number;
  /** Blend curve */
  blendCurve?: (t: number) => number;
}

/**
 * Eye tracking data interface
 */
export interface EyeTrackingData {
  /** Left eye data */
  leftEye: EyeData;
  /** Right eye data */
  rightEye: EyeData;
  /** Gaze direction */
  gazeDirection: THREE.Vector3;
  /** Gaze target */
  gazeTarget?: THREE.Vector3;
  /** Pupil dilation */
  pupilDilation: number;
  /** Blink state */
  blinkState: BlinkState;
}

/**
 * Individual eye data interface
 */
export interface EyeData {
  /** Eye bone reference */
  bone?: THREE.Bone;
  /** Eye rotation */
  rotation: THREE.Euler;
  /** Eyelid position */
  eyelidPosition: {
    upper: number; // 0 = closed, 1 = open
    lower: number;
  };
  /** Eye morph targets */
  morphTargets: {
    blink: number;
    wideEye: number;
    squint: number;
  };
}

/**
 * Blink system interface
 */
export interface BlinkSystem {
  /** Auto-blink enabled */
  autoBlinkEnabled: boolean;
  /** Blink interval range (min, max in seconds) */
  blinkInterval: [number, number];
  /** Blink duration */
  blinkDuration: number;
  /** Last blink time */
  lastBlinkTime: number;
  /** Current blink state */
  currentState: BlinkState;
}

/**
 * Blink state enumeration
 */
export enum BlinkState {
  OPEN = 'open',
  CLOSING = 'closing',
  CLOSED = 'closed',
  OPENING = 'opening'
}

/**
 * Inverse Kinematics (IK) interface
 */
export interface IKChain {
  /** Chain name */
  name: string;
  /** Root bone */
  rootBone: THREE.Bone;
  /** End effector bone */
  endEffector: THREE.Bone;
  /** Chain bones (from root to end) */
  bones: THREE.Bone[];
  /** Target position */
  target: THREE.Vector3;
  /** Pole vector for 2-bone IK */
  poleVector?: THREE.Vector3;
  /** Chain length */
  chainLength: number;
  /** Maximum iterations */
  maxIterations: number;
  /** Tolerance threshold */
  tolerance: number;
  /** Constraints per joint */
  constraints: IKConstraint[];
}

/**
 * IK constraint interface
 */
export interface IKConstraint {
  /** Constraint type */
  type: 'hinge' | 'ball' | 'cone' | 'twist';
  /** Axis constraint (for hinge) */
  axis?: THREE.Vector3;
  /** Angle limits */
  angleLimits?: {
    min: number;
    max: number;
  };
  /** Cone angle (for cone constraint) */
  coneAngle?: number;
  /** Twist limits (for twist constraint) */
  twistLimits?: {
    min: number;
    max: number;
  };
}

/**
 * Animation layer interface
 */
export interface AnimationLayer {
  /** Layer index */
  index: number;
  /** Layer name */
  name: string;
  /** Layer weight */
  weight: number;
  /** Additive blending */
  additive: boolean;
  /** Layer mask */
  mask?: AnimationMask;
  /** Active animations */
  animations: SkeletalAnimation[];
  /** Blend mode */
  blendMode: 'normal' | 'additive' | 'multiply';
}

/**
 * Animation mask interface
 */
export interface AnimationMask {
  /** Bone influences */
  boneInfluences: Map<string, number>;
  /** Morph target influences */
  morphInfluences?: Map<string, number>;
}

/**
 * Motion capture data interface
 */
export interface MotionCaptureData {
  /** Frame rate */
  frameRate: number;
  /** Total duration */
  duration: number;
  /** Bone transformations per frame */
  boneData: Map<string, Array<{
    time: number;
    position: THREE.Vector3;
    rotation: THREE.Quaternion;
    scale: THREE.Vector3;
  }>>;
  /** Morph target data per frame */
  morphData?: Map<string, Array<{
    time: number;
    weight: number;
  }>>;
  /** Root motion data */
  rootMotion?: Array<{
    time: number;
    position: THREE.Vector3;
    rotation: THREE.Quaternion;
  }>;
}

/**
 * Gesture interface
 */
export interface Gesture {
  /** Gesture name */
  name: string;
  /** Gesture category */
  category: 'hand' | 'head' | 'body' | 'full';
  /** Animation clips */
  clips: THREE.AnimationClip[];
  /** Gesture duration */
  duration: number;
  /** Gesture weight */
  weight: number;
  /** Gesture priority */
  priority: number;
  /** Can interrupt other gestures */
  interruptible: boolean;
  /** Fade in/out durations */
  fadeIn: number;
  fadeOut: number;
  /** Gesture metadata */
  metadata?: {
    emotion?: string;
    context?: string;
    tags?: string[];
  };
}

/**
 * Animation state machine interface
 */
export interface AnimationStateMachine {
  /** Current state */
  currentState: AnimationState;
  /** Available states */
  states: Map<string, AnimationState>;
  /** State transitions */
  transitions: AnimationTransition[];
  /** Global parameters */
  parameters: Map<string, number | boolean | string>;
}

/**
 * Animation state interface
 */
export interface AnimationState {
  /** State name */
  name: string;
  /** State animations */
  animations: SkeletalAnimation[];
  /** State weight */
  weight: number;
  /** Loop state */
  loop: boolean;
  /** State speed multiplier */
  speed: number;
  /** Entry actions */
  onEnter?: () => void;
  /** Exit actions */
  onExit?: () => void;
  /** Update actions */
  onUpdate?: (deltaTime: number) => void;
}

/**
 * Animation transition interface
 */
export interface AnimationTransition {
  /** From state */
  fromState: string;
  /** To state */
  toState: string;
  /** Transition conditions */
  conditions: AnimationCondition[];
  /** Transition duration */
  duration: number;
  /** Transition curve */
  curve?: (t: number) => number;
  /** Interrupt source */
  interruptionSource?: 'none' | 'current' | 'next' | 'both';
}

/**
 * Animation condition interface
 */
export interface AnimationCondition {
  /** Parameter name */
  parameter: string;
  /** Comparison type */
  comparison: 'equals' | 'greater' | 'less' | 'greaterEqual' | 'lessEqual' | 'notEqual';
  /** Threshold value */
  threshold: number | boolean | string;
}

/**
 * Procedural animation interface
 */
export interface ProceduralAnimation {
  /** Animation name */
  name: string;
  /** Animation type */
  type: 'idle' | 'breathing' | 'heartbeat' | 'sway' | 'noise' | 'custom';
  /** Affected bones */
  bones: string[];
  /** Animation parameters */
  parameters: {
    amplitude?: THREE.Vector3;
    frequency?: number;
    phase?: number;
    offset?: THREE.Vector3;
    noiseScale?: number;
    dampening?: number;
  };
  /** Custom update function */
  updateFunction?: (time: number, bone: THREE.Bone, params: any) => void;
}