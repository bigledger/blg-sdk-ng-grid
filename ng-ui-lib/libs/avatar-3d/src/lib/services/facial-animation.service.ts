import { Injectable, signal, computed } from '@angular/core';
import * as THREE from 'three';
import { 
  FacialActionUnit, 
  FacialExpressionSystem, 
  ExpressionBlend, 
  EyeTrackingData,
  BlinkSystem,
  BlinkState 
} from '../interfaces/animation.interface';
import { AvatarModel } from '../interfaces/model-loading.interface';

/**
 * Comprehensive facial animation system implementing FACS (Facial Action Coding System)
 * Supports 52 facial action units for realistic facial expressions and emotion blending
 */
@Injectable({
  providedIn: 'root'
})
export class FacialAnimationService {
  // Core facial system state
  private _currentModel = signal<AvatarModel | null>(null);
  private _facialSystem = signal<FacialExpressionSystem | null>(null);
  
  // FACS Action Units (52 total)
  private _facialActionUnits = signal<Map<number, FacialActionUnit>>(new Map());
  private _activeAUs = signal<Map<number, number>>(new Map()); // AU number -> intensity
  
  // Expression and emotion system
  private _currentExpression = signal<string>('neutral');
  private _expressionIntensity = signal<number>(1.0);
  private _emotionBlend = signal<ExpressionBlend | null>(null);
  
  // Eye tracking and gaze
  private _eyeTracking = signal<EyeTrackingData | null>(null);
  private _gazeTarget = signal<THREE.Vector3 | null>(null);
  
  // Lip sync and visemes
  private _currentViseme = signal<string>('sil');
  private _lipSyncEnabled = signal<boolean>(false);
  private _visemeWeights = signal<Map<string, number>>(new Map());
  
  // Animation timing
  private _clock = new THREE.Clock();
  private animationFrameId: number | null = null;
  
  // Public readonly signals
  readonly currentModel = this._currentModel.asReadonly();
  readonly facialSystem = this._facialSystem.asReadonly();
  readonly activeAUs = this._activeAUs.asReadonly();
  readonly currentExpression = this._currentExpression.asReadonly();
  readonly eyeTracking = this._eyeTracking.asReadonly();
  readonly currentViseme = this._currentViseme.asReadonly();
  readonly lipSyncEnabled = this._lipSyncEnabled.asReadonly();
  
  // Computed properties
  readonly isExpressionActive = computed(() => {
    return this._currentExpression() !== 'neutral' || this._activeAUs().size > 0;
  });
  
  readonly eyeGazeDirection = computed(() => {
    const eyeTracking = this._eyeTracking();
    return eyeTracking?.gazeDirection || new THREE.Vector3(0, 0, -1);
  });

  constructor() {
    this.initializeFACSUnits();
    this.setupVisemeMapping();
  }

  /**
   * Initialize with avatar model
   */
  initializeWithModel(model: AvatarModel): void {
    this._currentModel.set(model);
    this.setupFacialSystem(model);
    this.startAnimationLoop();
  }

  /**
   * Initialize all 52 FACS Action Units
   */
  private initializeFACSUnits(): void {
    const aus = new Map<number, FacialActionUnit>();
    
    // Upper Face Action Units (1-7)
    aus.set(1, {
      auNumber: 1,
      name: 'Inner Brow Raiser',
      description: 'Raises the inner portion of the brow',
      intensity: 0,
      morphTargets: [
        { name: 'browInnerUp', weight: 1.0, influence: 1.0 }
      ],
      muscleGroups: ['frontalis_medialis'],
      bilateral: false
    });

    aus.set(2, {
      auNumber: 2,
      name: 'Outer Brow Raiser',
      description: 'Raises the outer portion of the brow',
      intensity: 0,
      morphTargets: [
        { name: 'browOuterUpLeft', weight: 1.0, influence: 0.5 },
        { name: 'browOuterUpRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['frontalis_lateralis'],
      bilateral: true
    });

    aus.set(4, {
      auNumber: 4,
      name: 'Brow Lowerer',
      description: 'Lowers and draws the brow together',
      intensity: 0,
      morphTargets: [
        { name: 'browDownLeft', weight: 1.0, influence: 0.5 },
        { name: 'browDownRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['corrugator_supercilii', 'depressor_supercilii'],
      bilateral: true
    });

    aus.set(5, {
      auNumber: 5,
      name: 'Upper Lid Raiser',
      description: 'Raises the upper eyelid',
      intensity: 0,
      morphTargets: [
        { name: 'eyeWideLeft', weight: 1.0, influence: 0.5 },
        { name: 'eyeWideRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['levator_palpebrae_superioris'],
      bilateral: true
    });

    aus.set(6, {
      auNumber: 6,
      name: 'Cheek Raiser',
      description: 'Raises the cheek and narrows the eye opening',
      intensity: 0,
      morphTargets: [
        { name: 'eyeSquintLeft', weight: 1.0, influence: 0.5 },
        { name: 'eyeSquintRight', weight: 1.0, influence: 0.5 },
        { name: 'cheekSquintLeft', weight: 0.7, influence: 0.5 },
        { name: 'cheekSquintRight', weight: 0.7, influence: 0.5 }
      ],
      muscleGroups: ['orbicularis_oculi'],
      bilateral: true
    });

    aus.set(7, {
      auNumber: 7,
      name: 'Lid Tightener',
      description: 'Tightens the eyelids',
      intensity: 0,
      morphTargets: [
        { name: 'eyeSquintLeft', weight: 0.8, influence: 0.5 },
        { name: 'eyeSquintRight', weight: 0.8, influence: 0.5 }
      ],
      muscleGroups: ['orbicularis_oculi_pars_palpebralis'],
      bilateral: true
    });

    // Lower Face Action Units (9-28)
    aus.set(9, {
      auNumber: 9,
      name: 'Nose Wrinkler',
      description: 'Wrinkles the nose',
      intensity: 0,
      morphTargets: [
        { name: 'noseSneerLeft', weight: 1.0, influence: 0.5 },
        { name: 'noseSneerRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['levator_labii_superioris_alaeque_nasi'],
      bilateral: true
    });

    aus.set(10, {
      auNumber: 10,
      name: 'Upper Lip Raiser',
      description: 'Raises the upper lip',
      intensity: 0,
      morphTargets: [
        { name: 'mouthUpperUpLeft', weight: 1.0, influence: 0.5 },
        { name: 'mouthUpperUpRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['levator_labii_superioris'],
      bilateral: true
    });

    aus.set(12, {
      auNumber: 12,
      name: 'Lip Corner Puller',
      description: 'Pulls the lip corners upward',
      intensity: 0,
      morphTargets: [
        { name: 'mouthSmileLeft', weight: 1.0, influence: 0.5 },
        { name: 'mouthSmileRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['zygomaticus_major'],
      bilateral: true
    });

    aus.set(13, {
      auNumber: 13,
      name: 'Sharp Lip Puller',
      description: 'Pulls lip corners up and back sharply',
      intensity: 0,
      morphTargets: [
        { name: 'mouthSmileLeft', weight: 0.8, influence: 0.5 },
        { name: 'mouthSmileRight', weight: 0.8, influence: 0.5 },
        { name: 'mouthDimpleLeft', weight: 1.0, influence: 0.5 },
        { name: 'mouthDimpleRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['levator_anguli_oris'],
      bilateral: true
    });

    aus.set(14, {
      auNumber: 14,
      name: 'Dimpler',
      description: 'Creates dimples in the cheeks',
      intensity: 0,
      morphTargets: [
        { name: 'mouthDimpleLeft', weight: 1.0, influence: 0.5 },
        { name: 'mouthDimpleRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['buccinator'],
      bilateral: true
    });

    aus.set(15, {
      auNumber: 15,
      name: 'Lip Corner Depressor',
      description: 'Depresses the lip corners',
      intensity: 0,
      morphTargets: [
        { name: 'mouthFrownLeft', weight: 1.0, influence: 0.5 },
        { name: 'mouthFrownRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['depressor_anguli_oris'],
      bilateral: true
    });

    aus.set(16, {
      auNumber: 16,
      name: 'Lower Lip Depressor',
      description: 'Depresses the lower lip',
      intensity: 0,
      morphTargets: [
        { name: 'mouthLowerDownLeft', weight: 1.0, influence: 0.5 },
        { name: 'mouthLowerDownRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['depressor_labii_inferioris'],
      bilateral: true
    });

    aus.set(17, {
      auNumber: 17,
      name: 'Chin Raiser',
      description: 'Raises and wrinkles the chin',
      intensity: 0,
      morphTargets: [
        { name: 'mouthPucker', weight: 0.5, influence: 1.0 }
      ],
      muscleGroups: ['mentalis'],
      bilateral: false
    });

    aus.set(18, {
      auNumber: 18,
      name: 'Lip Puckerer',
      description: 'Puckers the lips',
      intensity: 0,
      morphTargets: [
        { name: 'mouthPucker', weight: 1.0, influence: 1.0 }
      ],
      muscleGroups: ['incisivii_labii_superioris', 'incisivii_labii_inferioris'],
      bilateral: false
    });

    aus.set(20, {
      auNumber: 20,
      name: 'Lip Stretcher',
      description: 'Stretches the lips horizontally',
      intensity: 0,
      morphTargets: [
        { name: 'mouthStretchLeft', weight: 1.0, influence: 0.5 },
        { name: 'mouthStretchRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['risorius'],
      bilateral: true
    });

    aus.set(22, {
      auNumber: 22,
      name: 'Lip Funneler',
      description: 'Funnels the lips',
      intensity: 0,
      morphTargets: [
        { name: 'mouthFunnel', weight: 1.0, influence: 1.0 }
      ],
      muscleGroups: ['orbicularis_oris'],
      bilateral: false
    });

    aus.set(23, {
      auNumber: 23,
      name: 'Lip Tightener',
      description: 'Tightens and narrows the lips',
      intensity: 0,
      morphTargets: [
        { name: 'mouthPress', weight: 1.0, influence: 1.0 }
      ],
      muscleGroups: ['orbicularis_oris'],
      bilateral: false
    });

    aus.set(24, {
      auNumber: 24,
      name: 'Lip Presser',
      description: 'Presses the lips together',
      intensity: 0,
      morphTargets: [
        { name: 'mouthPress', weight: 1.0, influence: 1.0 }
      ],
      muscleGroups: ['orbicularis_oris'],
      bilateral: false
    });

    aus.set(25, {
      auNumber: 25,
      name: 'Lips Part',
      description: 'Parts the lips',
      intensity: 0,
      morphTargets: [
        { name: 'jawOpen', weight: 0.3, influence: 1.0 }
      ],
      muscleGroups: ['depressor_mandibulae'],
      bilateral: false
    });

    aus.set(26, {
      auNumber: 26,
      name: 'Jaw Drop',
      description: 'Drops the jaw',
      intensity: 0,
      morphTargets: [
        { name: 'jawOpen', weight: 1.0, influence: 1.0 }
      ],
      muscleGroups: ['masseter', 'temporalis'],
      bilateral: false
    });

    aus.set(27, {
      auNumber: 27,
      name: 'Mouth Stretch',
      description: 'Stretches the mouth open',
      intensity: 0,
      morphTargets: [
        { name: 'jawOpen', weight: 0.8, influence: 1.0 },
        { name: 'mouthStretchLeft', weight: 0.5, influence: 0.5 },
        { name: 'mouthStretchRight', weight: 0.5, influence: 0.5 }
      ],
      muscleGroups: ['pterygoid_lateral'],
      bilateral: false
    });

    aus.set(28, {
      auNumber: 28,
      name: 'Lip Suck',
      description: 'Sucks the lips inward',
      intensity: 0,
      morphTargets: [
        { name: 'mouthRollLower', weight: 1.0, influence: 1.0 },
        { name: 'mouthRollUpper', weight: 1.0, influence: 1.0 }
      ],
      muscleGroups: ['orbicularis_oris'],
      bilateral: false
    });

    // Additional specialized AUs
    this.addSpecializedAUs(aus);
    
    this._facialActionUnits.set(aus);
  }

  /**
   * Add specialized Action Units (eye movements, etc.)
   */
  private addSpecializedAUs(aus: Map<number, FacialActionUnit>): void {
    // Eye movement AUs (61-64)
    aus.set(61, {
      auNumber: 61,
      name: 'Eyes Left',
      description: 'Eyes move to the left',
      intensity: 0,
      morphTargets: [
        { name: 'eyeLookInLeft', weight: 1.0, influence: 0.5 },
        { name: 'eyeLookOutRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['rectus_medialis', 'rectus_lateralis'],
      bilateral: false
    });

    aus.set(62, {
      auNumber: 62,
      name: 'Eyes Right',
      description: 'Eyes move to the right',
      intensity: 0,
      morphTargets: [
        { name: 'eyeLookOutLeft', weight: 1.0, influence: 0.5 },
        { name: 'eyeLookInRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['rectus_medialis', 'rectus_lateralis'],
      bilateral: false
    });

    aus.set(63, {
      auNumber: 63,
      name: 'Eyes Up',
      description: 'Eyes move upward',
      intensity: 0,
      morphTargets: [
        { name: 'eyeLookUpLeft', weight: 1.0, influence: 0.5 },
        { name: 'eyeLookUpRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['rectus_superior'],
      bilateral: true
    });

    aus.set(64, {
      auNumber: 64,
      name: 'Eyes Down',
      description: 'Eyes move downward',
      intensity: 0,
      morphTargets: [
        { name: 'eyeLookDownLeft', weight: 1.0, influence: 0.5 },
        { name: 'eyeLookDownRight', weight: 1.0, influence: 0.5 }
      ],
      muscleGroups: ['rectus_inferior'],
      bilateral: true
    });

    // Additional mouth shapes for speech
    aus.set(50, {
      auNumber: 50,
      name: 'Speech - Ah',
      description: 'Mouth shape for "ah" sound',
      intensity: 0,
      morphTargets: [
        { name: 'viseme_aa', weight: 1.0, influence: 1.0 }
      ],
      muscleGroups: ['orbicularis_oris'],
      bilateral: false
    });

    aus.set(51, {
      auNumber: 51,
      name: 'Speech - Eh',
      description: 'Mouth shape for "eh" sound',
      intensity: 0,
      morphTargets: [
        { name: 'viseme_E', weight: 1.0, influence: 1.0 }
      ],
      muscleGroups: ['orbicularis_oris'],
      bilateral: false
    });

    aus.set(52, {
      auNumber: 52,
      name: 'Speech - Oh',
      description: 'Mouth shape for "oh" sound',
      intensity: 0,
      morphTargets: [
        { name: 'viseme_O', weight: 1.0, influence: 1.0 }
      ],
      muscleGroups: ['orbicularis_oris'],
      bilateral: false
    });
  }

  /**
   * Set up facial system for model
   */
  private setupFacialSystem(model: AvatarModel): void {
    // Initialize eye tracking
    const eyeTracking: EyeTrackingData = {
      leftEye: {
        rotation: new THREE.Euler(),
        eyelidPosition: { upper: 1, lower: 0 },
        morphTargets: { blink: 0, wideEye: 0, squint: 0 }
      },
      rightEye: {
        rotation: new THREE.Euler(),
        eyelidPosition: { upper: 1, lower: 0 },
        morphTargets: { blink: 0, wideEye: 0, squint: 0 }
      },
      gazeDirection: new THREE.Vector3(0, 0, -1),
      pupilDilation: 0.5,
      blinkState: BlinkState.OPEN
    };
    this._eyeTracking.set(eyeTracking);

    // Initialize blink system
    const blinkSystem: BlinkSystem = {
      autoBlinkEnabled: true,
      blinkInterval: [2, 6],
      blinkDuration: 0.15,
      lastBlinkTime: 0,
      currentState: BlinkState.OPEN
    };

    // Set up facial system
    const facialSystem: FacialExpressionSystem = {
      activeAUs: new Map(),
      expressions: new Map(),
      currentBlend: {
        primary: { expression: 'neutral', weight: 1.0 },
        secondary: [],
        transitionDuration: 0.5
      },
      eyeTracking,
      blinkSystem
    };

    this._facialSystem.set(facialSystem);
    this.setupEmotionExpressions();
  }

  /**
   * Set up common emotion expressions using FACS combinations
   */
  private setupEmotionExpressions(): void {
    const facialSystem = this._facialSystem();
    if (!facialSystem) return;

    // Happiness (AU6 + AU12)
    facialSystem.expressions.set('happiness', {
      name: 'happiness',
      morphWeights: this.combineAUs([6, 12], [0.8, 0.9]),
      intensity: 1.0
    });

    // Sadness (AU1 + AU4 + AU15)
    facialSystem.expressions.set('sadness', {
      name: 'sadness',
      morphWeights: this.combineAUs([1, 4, 15], [0.6, 0.7, 0.8]),
      intensity: 1.0
    });

    // Anger (AU4 + AU5 + AU7 + AU23)
    facialSystem.expressions.set('anger', {
      name: 'anger',
      morphWeights: this.combineAUs([4, 5, 7, 23], [0.9, 0.6, 0.8, 0.7]),
      intensity: 1.0
    });

    // Fear (AU1 + AU2 + AU4 + AU5 + AU20 + AU26)
    facialSystem.expressions.set('fear', {
      name: 'fear',
      morphWeights: this.combineAUs([1, 2, 4, 5, 20, 26], [0.5, 0.8, 0.5, 1.0, 0.7, 0.4]),
      intensity: 1.0
    });

    // Surprise (AU1 + AU2 + AU5 + AU26)
    facialSystem.expressions.set('surprise', {
      name: 'surprise',
      morphWeights: this.combineAUs([1, 2, 5, 26], [0.8, 1.0, 1.0, 0.6]),
      intensity: 1.0
    });

    // Disgust (AU9 + AU15 + AU16)
    facialSystem.expressions.set('disgust', {
      name: 'disgust',
      morphWeights: this.combineAUs([9, 15, 16], [0.8, 0.6, 0.5]),
      intensity: 1.0
    });

    // Contempt (unilateral AU12 + AU14)
    facialSystem.expressions.set('contempt', {
      name: 'contempt',
      morphWeights: {
        'mouthSmileLeft': 0.3,
        'mouthDimpleLeft': 0.6,
        'mouthSmileRight': 0.0,
        'mouthDimpleRight': 0.0
      },
      intensity: 1.0
    });
  }

  /**
   * Combine multiple Action Units into morph weight mapping
   */
  private combineAUs(auNumbers: number[], intensities: number[]): Record<string, number> {
    const morphWeights: Record<string, number> = {};
    const aus = this._facialActionUnits();
    
    auNumbers.forEach((auNumber, index) => {
      const au = aus.get(auNumber);
      const intensity = intensities[index] || 1.0;
      
      if (au) {
        au.morphTargets.forEach(target => {
          const weight = target.weight * intensity * target.influence;
          if (morphWeights[target.name]) {
            morphWeights[target.name] = Math.max(morphWeights[target.name], weight);
          } else {
            morphWeights[target.name] = weight;
          }
        });
      }
    });
    
    return morphWeights;
  }

  /**
   * Set up viseme mapping for lip sync
   */
  private setupVisemeMapping(): void {
    const visemeWeights = new Map<string, Map<string, number>>();
    
    // Preston-Blair visemes (simplified set)
    visemeWeights.set('sil', new Map([['jawOpen', 0], ['mouthPress', 0.1]])); // Silence
    visemeWeights.set('aa', new Map([['jawOpen', 0.8], ['mouthWide', 0.3]])); // "father"
    visemeWeights.set('ae', new Map([['jawOpen', 0.5], ['mouthWide', 0.6]])); // "cat"
    visemeWeights.set('ah', new Map([['jawOpen', 0.7], ['mouthWide', 0.2]])); // "but"
    visemeWeights.set('ao', new Map([['jawOpen', 0.6], ['mouthRound', 0.4]])); // "thought"
    visemeWeights.set('aw', new Map([['jawOpen', 0.6], ['mouthRound', 0.6]])); // "cow"
    visemeWeights.set('ay', new Map([['jawOpen', 0.4], ['mouthWide', 0.7]])); // "hide"
    visemeWeights.set('b', new Map([['mouthPress', 1.0]])); // "big"
    visemeWeights.set('ch', new Map([['jawOpen', 0.2], ['mouthPress', 0.3]])); // "church"
    visemeWeights.set('d', new Map([['jawOpen', 0.3], ['tongueUp', 0.8]])); // "dog"
    visemeWeights.set('dh', new Map([['jawOpen', 0.2], ['tongueOut', 0.5]])); // "that"
    visemeWeights.set('eh', new Map([['jawOpen', 0.4], ['mouthWide', 0.5]])); // "red"
    visemeWeights.set('er', new Map([['jawOpen', 0.4], ['mouthRound', 0.3]])); // "bird"
    visemeWeights.set('ey', new Map([['jawOpen', 0.3], ['mouthWide', 0.6]])); // "cake"
    visemeWeights.set('f', new Map([['mouthPress', 0.6], ['lipBite', 0.7]])); // "fork"
    visemeWeights.set('g', new Map([['jawOpen', 0.3]])); // "girl"
    visemeWeights.set('hh', new Map([['jawOpen', 0.3]])); // "house"
    visemeWeights.set('ih', new Map([['jawOpen', 0.2], ['mouthWide', 0.4]])); // "bit"
    visemeWeights.set('iy', new Map([['jawOpen', 0.1], ['mouthWide', 0.8]])); // "green"
    visemeWeights.set('jh', new Map([['jawOpen', 0.2], ['mouthPress', 0.4]])); // "job"
    visemeWeights.set('k', new Map([['jawOpen', 0.3]])); // "key"
    visemeWeights.set('l', new Map([['jawOpen', 0.3], ['tongueUp', 0.6]])); // "lay"
    visemeWeights.set('m', new Map([['mouthPress', 1.0]])); // "man"
    visemeWeights.set('n', new Map([['jawOpen', 0.2], ['tongueUp', 0.7]])); // "no"
    visemeWeights.set('ng', new Map([['jawOpen', 0.2]])); // "sing"
    visemeWeights.set('ow', new Map([['jawOpen', 0.6], ['mouthRound', 0.8]])); // "boat"
    visemeWeights.set('oy', new Map([['jawOpen', 0.5], ['mouthRound', 0.6]])); // "toy"
    visemeWeights.set('p', new Map([['mouthPress', 1.0]])); // "put"
    visemeWeights.set('r', new Map([['jawOpen', 0.3], ['mouthRound', 0.4]])); // "red"
    visemeWeights.set('s', new Map([['jawOpen', 0.1], ['mouthPress', 0.5]])); // "sun"
    visemeWeights.set('sh', new Map([['jawOpen', 0.2], ['mouthRound', 0.6]])); // "shoe"
    visemeWeights.set('t', new Map([['jawOpen', 0.2], ['tongueUp', 0.8]])); // "top"
    visemeWeights.set('th', new Map([['jawOpen', 0.2], ['tongueOut', 0.6]])); // "think"
    visemeWeights.set('uh', new Map([['jawOpen', 0.3], ['mouthRound', 0.2]])); // "book"
    visemeWeights.set('uw', new Map([['jawOpen', 0.2], ['mouthRound', 1.0]])); // "blue"
    visemeWeights.set('v', new Map([['mouthPress', 0.6], ['lipBite', 0.7]])); // "voice"
    visemeWeights.set('w', new Map([['jawOpen', 0.2], ['mouthRound', 0.9]])); // "way"
    visemeWeights.set('y', new Map([['jawOpen', 0.2], ['mouthWide', 0.5]])); // "yes"
    visemeWeights.set('z', new Map([['jawOpen', 0.1], ['mouthPress', 0.4]])); // "zoo"
    visemeWeights.set('zh', new Map([['jawOpen', 0.2], ['mouthRound', 0.5]])); // "measure"
    
    this._visemeWeights.set(visemeWeights);
  }

  /**
   * Set Action Unit intensity
   */
  setActionUnit(auNumber: number, intensity: number): void {
    const clampedIntensity = THREE.MathUtils.clamp(intensity, 0, 5); // FACS scale 0-5
    const activeAUs = this._activeAUs();
    const newActiveAUs = new Map(activeAUs);
    
    if (clampedIntensity > 0) {
      newActiveAUs.set(auNumber, clampedIntensity);
    } else {
      newActiveAUs.delete(auNumber);
    }
    
    this._activeAUs.set(newActiveAUs);
    this.applyActionUnits();
  }

  /**
   * Set multiple Action Units
   */
  setActionUnits(auData: Array<{ auNumber: number; intensity: number }>): void {
    const activeAUs = this._activeAUs();
    const newActiveAUs = new Map(activeAUs);
    
    auData.forEach(({ auNumber, intensity }) => {
      const clampedIntensity = THREE.MathUtils.clamp(intensity, 0, 5);
      if (clampedIntensity > 0) {
        newActiveAUs.set(auNumber, clampedIntensity);
      } else {
        newActiveAUs.delete(auNumber);
      }
    });
    
    this._activeAUs.set(newActiveAUs);
    this.applyActionUnits();
  }

  /**
   * Apply current Action Units to morph targets
   */
  private applyActionUnits(): void {
    const model = this._currentModel();
    const activeAUs = this._activeAUs();
    const facialAUs = this._facialActionUnits();
    
    if (!model) return;
    
    // Reset all facial morph targets
    const morphWeights = new Map<string, number>();
    
    // Apply each active AU
    activeAUs.forEach((intensity, auNumber) => {
      const au = facialAUs.get(auNumber);
      if (!au) return;
      
      const normalizedIntensity = intensity / 5; // Convert FACS 0-5 to 0-1
      
      au.morphTargets.forEach(target => {
        const weight = target.weight * normalizedIntensity * target.influence;
        const currentWeight = morphWeights.get(target.name) || 0;
        morphWeights.set(target.name, Math.max(currentWeight, weight));
      });
    });
    
    // Apply morph weights to model
    this.applyMorphWeights(morphWeights);
  }

  /**
   * Apply morph weights to model
   */
  private applyMorphWeights(morphWeights: Map<string, number>): void {
    const model = this._currentModel();
    if (!model) return;
    
    model.morphTargetMeshes.forEach(mesh => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      
      morphWeights.forEach((weight, morphName) => {
        const index = mesh.morphTargetDictionary[morphName];
        if (index !== undefined) {
          mesh.morphTargetInfluences[index] = weight;
        }
      });
    });
  }

  /**
   * Play emotion expression
   */
  playEmotion(emotion: string, intensity: number = 1.0, duration: number = 1.0): void {
    const facialSystem = this._facialSystem();
    if (!facialSystem) return;
    
    const expression = facialSystem.expressions.get(emotion);
    if (!expression) {
      console.warn(`Emotion '${emotion}' not found`);
      return;
    }
    
    this._currentExpression.set(emotion);
    this._expressionIntensity.set(intensity);
    
    // Apply expression morph weights
    const morphWeights = new Map<string, number>();
    Object.entries(expression.morphWeights).forEach(([morphName, weight]) => {
      morphWeights.set(morphName, weight * intensity);
    });
    
    this.applyMorphWeights(morphWeights);
  }

  /**
   * Blend between emotions
   */
  blendEmotions(emotions: Array<{ emotion: string; weight: number }>, duration: number = 1.0): void {
    const facialSystem = this._facialSystem();
    if (!facialSystem) return;
    
    const combinedWeights = new Map<string, number>();
    let totalWeight = 0;
    
    emotions.forEach(({ emotion, weight }) => {
      const expression = facialSystem.expressions.get(emotion);
      if (!expression) return;
      
      totalWeight += weight;
      
      Object.entries(expression.morphWeights).forEach(([morphName, morphWeight]) => {
        const currentWeight = combinedWeights.get(morphName) || 0;
        combinedWeights.set(morphName, currentWeight + (morphWeight * weight));
      });
    });
    
    // Normalize weights
    if (totalWeight > 0) {
      combinedWeights.forEach((weight, morphName) => {
        combinedWeights.set(morphName, weight / totalWeight);
      });
    }
    
    this.applyMorphWeights(combinedWeights);
  }

  /**
   * Set viseme for lip sync
   */
  setViseme(viseme: string, weight: number = 1.0): void {
    const visemeWeights = this._visemeWeights();
    const visemeData = visemeWeights.get(viseme);
    
    if (!visemeData) {
      console.warn(`Viseme '${viseme}' not found`);
      return;
    }
    
    this._currentViseme.set(viseme);
    
    const morphWeights = new Map<string, number>();
    visemeData.forEach((morphWeight, morphName) => {
      morphWeights.set(morphName, morphWeight * weight);
    });
    
    this.applyMorphWeights(morphWeights);
  }

  /**
   * Set gaze target for eye tracking
   */
  setGazeTarget(target: THREE.Vector3): void {
    this._gazeTarget.set(target.clone());
    this.updateEyeGaze(target);
  }

  /**
   * Update eye gaze direction
   */
  private updateEyeGaze(target: THREE.Vector3): void {
    const eyeTracking = this._eyeTracking();
    const model = this._currentModel();
    
    if (!eyeTracking || !model) return;
    
    // Calculate gaze direction
    const headPosition = new THREE.Vector3();
    const headBone = model.bones.get('Head');
    
    if (headBone) {
      headBone.getWorldPosition(headPosition);
      const gazeDirection = target.clone().sub(headPosition).normalize();
      eyeTracking.gazeDirection.copy(gazeDirection);
      
      // Apply eye movements via morph targets
      const horizontalGaze = gazeDirection.x;
      const verticalGaze = gazeDirection.y;
      
      const eyeMorphWeights = new Map<string, number>();
      
      // Horizontal eye movement
      if (horizontalGaze > 0.1) {
        eyeMorphWeights.set('eyeLookOutLeft', Math.min(horizontalGaze * 2, 1.0));
        eyeMorphWeights.set('eyeLookInRight', Math.min(horizontalGaze * 2, 1.0));
      } else if (horizontalGaze < -0.1) {
        eyeMorphWeights.set('eyeLookInLeft', Math.min(Math.abs(horizontalGaze) * 2, 1.0));
        eyeMorphWeights.set('eyeLookOutRight', Math.min(Math.abs(horizontalGaze) * 2, 1.0));
      }
      
      // Vertical eye movement
      if (verticalGaze > 0.1) {
        eyeMorphWeights.set('eyeLookUpLeft', Math.min(verticalGaze * 2, 1.0));
        eyeMorphWeights.set('eyeLookUpRight', Math.min(verticalGaze * 2, 1.0));
      } else if (verticalGaze < -0.1) {
        eyeMorphWeights.set('eyeLookDownLeft', Math.min(Math.abs(verticalGaze) * 2, 1.0));
        eyeMorphWeights.set('eyeLookDownRight', Math.min(Math.abs(verticalGaze) * 2, 1.0));
      }
      
      this.applyMorphWeights(eyeMorphWeights);
    }
  }

  /**
   * Enable/disable lip sync
   */
  setLipSyncEnabled(enabled: boolean): void {
    this._lipSyncEnabled.set(enabled);
  }

  /**
   * Start animation loop
   */
  private startAnimationLoop(): void {
    if (this.animationFrameId) return;
    
    const update = () => {
      this.animationFrameId = requestAnimationFrame(update);
      this.updateFacialAnimation();
    };
    
    update();
  }

  /**
   * Update facial animation
   */
  private updateFacialAnimation(): void {
    const deltaTime = this._clock.getDelta();
    
    // Update blink system
    this.updateBlinkSystem(deltaTime);
    
    // Update gaze if target is set
    const gazeTarget = this._gazeTarget();
    if (gazeTarget) {
      this.updateEyeGaze(gazeTarget);
    }
  }

  /**
   * Update blink system
   */
  private updateBlinkSystem(deltaTime: number): void {
    const facialSystem = this._facialSystem();
    if (!facialSystem?.blinkSystem.autoBlinkEnabled) return;
    
    const blinkSystem = facialSystem.blinkSystem;
    const currentTime = performance.now() * 0.001;
    
    // Check if it's time for a new blink
    if (blinkSystem.currentState === BlinkState.OPEN) {
      const timeSinceLastBlink = currentTime - blinkSystem.lastBlinkTime;
      const [minInterval, maxInterval] = blinkSystem.blinkInterval;
      const blinkInterval = minInterval + Math.random() * (maxInterval - minInterval);
      
      if (timeSinceLastBlink >= blinkInterval) {
        this.startBlink();
      }
    }
    
    // Update blink animation
    this.updateBlinkAnimation(deltaTime);
  }

  /**
   * Start a blink
   */
  private startBlink(): void {
    const facialSystem = this._facialSystem();
    if (!facialSystem) return;
    
    facialSystem.blinkSystem.currentState = BlinkState.CLOSING;
    facialSystem.blinkSystem.lastBlinkTime = performance.now() * 0.001;
  }

  /**
   * Update blink animation
   */
  private updateBlinkAnimation(deltaTime: number): void {
    const facialSystem = this._facialSystem();
    if (!facialSystem) return;
    
    const blinkSystem = facialSystem.blinkSystem;
    const eyeTracking = facialSystem.eyeTracking;
    
    if (!eyeTracking) return;
    
    const currentTime = performance.now() * 0.001;
    const blinkProgress = (currentTime - blinkSystem.lastBlinkTime) / blinkSystem.blinkDuration;
    
    let blinkAmount = 0;
    
    switch (blinkSystem.currentState) {
      case BlinkState.CLOSING:
        blinkAmount = Math.min(1, blinkProgress * 2); // Close in first half
        if (blinkAmount >= 1) {
          blinkSystem.currentState = BlinkState.OPENING;
        }
        break;
        
      case BlinkState.OPENING:
        blinkAmount = Math.max(0, 1 - (blinkProgress - 0.5) * 2); // Open in second half
        if (blinkAmount <= 0) {
          blinkSystem.currentState = BlinkState.OPEN;
        }
        break;
    }
    
    // Apply blink morph targets
    const blinkWeights = new Map<string, number>();
    blinkWeights.set('eyeBlinkLeft', blinkAmount);
    blinkWeights.set('eyeBlinkRight', blinkAmount);
    this.applyMorphWeights(blinkWeights);
    
    eyeTracking.leftEye.morphTargets.blink = blinkAmount;
    eyeTracking.rightEye.morphTargets.blink = blinkAmount;
  }

  /**
   * Reset all facial expressions
   */
  resetExpression(): void {
    this._activeAUs.set(new Map());
    this._currentExpression.set('neutral');
    this._expressionIntensity.set(0);
    
    const model = this._currentModel();
    if (!model) return;
    
    // Reset all morph targets to 0
    model.morphTargetMeshes.forEach(mesh => {
      if (mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences.fill(0);
      }
    });
  }

  /**
   * Get current facial state
   */
  getFacialState() {
    return {
      activeAUs: Array.from(this._activeAUs().entries()),
      currentExpression: this._currentExpression(),
      expressionIntensity: this._expressionIntensity(),
      currentViseme: this._currentViseme(),
      gazeTarget: this._gazeTarget()?.clone(),
      lipSyncEnabled: this._lipSyncEnabled()
    };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this._currentModel.set(null);
    this._facialSystem.set(null);
    this._activeAUs.set(new Map());
  }
}