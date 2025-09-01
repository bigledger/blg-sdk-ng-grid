import { Injectable, signal, computed, effect } from '@angular/core';
import * as THREE from 'three';
import {
  SkeletalAnimation,
  MorphTargetAnimation,
  FacialActionUnit,
  FacialExpressionSystem,
  EyeTrackingData,
  BlinkSystem,
  BlinkState,
  IKChain,
  IKConstraint,
  AnimationLayer,
  AnimationStateMachine,
  AnimationState,
  AnimationTransition,
  Gesture,
  ProceduralAnimation
} from '../interfaces/animation.interface';
import { AvatarModel } from '../interfaces/model-loading.interface';

/**
 * Comprehensive animation system service
 * Handles skeletal animation, morph targets, IK, facial animation, and gesture recognition
 */
@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  // Core animation state
  private _currentModel = signal<AvatarModel | null>(null);
  private _animationMixer = signal<THREE.AnimationMixer | null>(null);
  private _clock = signal<THREE.Clock>(new THREE.Clock());
  
  // Animation layers and state machine
  private _animationLayers = signal<AnimationLayer[]>([]);
  private _stateMachine = signal<AnimationStateMachine | null>(null);
  private _activeAnimations = signal<Map<string, SkeletalAnimation>>(new Map());
  
  // Facial animation system
  private _facialSystem = signal<FacialExpressionSystem | null>(null);
  private _activeFacialAUs = signal<Map<number, FacialActionUnit>>(new Map());
  private _eyeTracking = signal<EyeTrackingData | null>(null);
  private _blinkSystem = signal<BlinkSystem | null>(null);
  
  // Morph targets
  private _activeMorphTargets = signal<Map<string, MorphTargetAnimation>>(new Map());
  private _morphTargetWeights = signal<Map<string, number>>(new Map());
  
  // IK systems
  private _ikChains = signal<Map<string, IKChain>>(new Map());
  private _ikEnabled = signal<boolean>(false);
  
  // Gesture system
  private _availableGestures = signal<Map<string, Gesture>>(new Map());
  private _activeGestures = signal<Map<string, Gesture>>(new Map());
  
  // Procedural animations
  private _proceduralAnimations = signal<Map<string, ProceduralAnimation>>(new Map());
  
  // Animation frame ID for cleanup
  private animationFrameId: number | null = null;
  
  // Public readonly signals
  readonly currentModel = this._currentModel.asReadonly();
  readonly animationMixer = this._animationMixer.asReadonly();
  readonly animationLayers = this._animationLayers.asReadonly();
  readonly activeAnimations = this._activeAnimations.asReadonly();
  readonly facialSystem = this._facialSystem.asReadonly();
  readonly eyeTracking = this._eyeTracking.asReadonly();
  readonly morphTargetWeights = this._morphTargetWeights.asReadonly();
  readonly ikChains = this._ikChains.asReadonly();
  readonly activeGestures = this._activeGestures.asReadonly();
  
  // Computed properties
  readonly isAnimating = computed(() => {
    return this._activeAnimations().size > 0 || this._activeGestures().size > 0;
  });
  
  readonly facialAUCount = computed(() => {
    return this._activeFacialAUs().size;
  });

  constructor() {
    // Set up animation update loop
    effect(() => {
      const mixer = this._animationMixer();
      if (mixer) {
        this.startAnimationLoop();
      } else {
        this.stopAnimationLoop();
      }
    });
  }

  /**
   * Initialize animation system with avatar model
   */
  initializeWithModel(model: AvatarModel): void {
    this._currentModel.set(model);
    
    // Create or reuse animation mixer
    let mixer = model.mixer;
    if (!mixer) {
      mixer = new THREE.AnimationMixer(model.root);
    }
    this._animationMixer.set(mixer);
    
    // Initialize facial animation system
    this.initializeFacialSystem(model);
    
    // Initialize IK chains
    this.initializeIKChains(model);
    
    // Initialize gesture system
    this.initializeGestureSystem(model);
    
    // Initialize procedural animations
    this.initializeProceduralAnimations(model);
    
    // Set up animation layers
    this.setupAnimationLayers();
    
    // Initialize state machine
    this.initializeStateMachine();
  }

  /**
   * Initialize facial animation system
   */
  private initializeFacialSystem(model: AvatarModel): void {
    if (model.morphTargetMeshes.length === 0) {
      return; // No morph targets available
    }

    // Initialize blink system
    const blinkSystem: BlinkSystem = {
      autoBlinkEnabled: true,
      blinkInterval: [2, 6], // 2-6 seconds
      blinkDuration: 0.15,
      lastBlinkTime: 0,
      currentState: BlinkState.OPEN
    };
    this._blinkSystem.set(blinkSystem);

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

    // Initialize facial expression system
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
    
    // Set up common expressions
    this.setupCommonExpressions(facialSystem);
    this._facialSystem.set(facialSystem);
  }

  /**
   * Set up common facial expressions
   */
  private setupCommonExpressions(facialSystem: FacialExpressionSystem): void {
    // Happy expression
    facialSystem.expressions.set('happy', {
      name: 'happy',
      morphWeights: {
        'mouthSmile': 0.8,
        'cheekPuff': 0.3,
        'eyeSquintLeft': 0.4,
        'eyeSquintRight': 0.4
      },
      intensity: 1.0,
      duration: 1.0
    });

    // Sad expression
    facialSystem.expressions.set('sad', {
      name: 'sad',
      morphWeights: {
        'mouthFrown': 0.7,
        'browDownLeft': 0.5,
        'browDownRight': 0.5,
        'eyeWideLeft': -0.3,
        'eyeWideRight': -0.3
      },
      intensity: 1.0,
      duration: 1.0
    });

    // Surprised expression
    facialSystem.expressions.set('surprised', {
      name: 'surprised',
      morphWeights: {
        'mouthO': 0.8,
        'browUpLeft': 0.8,
        'browUpRight': 0.8,
        'eyeWideLeft': 1.0,
        'eyeWideRight': 1.0
      },
      intensity: 1.0,
      duration: 0.3
    });

    // Angry expression
    facialSystem.expressions.set('angry', {
      name: 'angry',
      morphWeights: {
        'mouthPress': 0.6,
        'browDownLeft': 0.8,
        'browDownRight': 0.8,
        'eyeSquintLeft': 0.7,
        'eyeSquintRight': 0.7,
        'noseSneer': 0.4
      },
      intensity: 1.0,
      duration: 1.0
    });
  }

  /**
   * Initialize IK chains for natural movement
   */
  private initializeIKChains(model: AvatarModel): void {
    if (!model.skeleton) {
      return;
    }

    const ikChains = new Map<string, IKChain>();
    
    // Set up arm IK chains
    const leftArmChain = this.createArmIKChain('leftArm', model.skeleton, 'left');
    if (leftArmChain) {
      ikChains.set('leftArm', leftArmChain);
    }
    
    const rightArmChain = this.createArmIKChain('rightArm', model.skeleton, 'right');
    if (rightArmChain) {
      ikChains.set('rightArm', rightArmChain);
    }
    
    // Set up leg IK chains
    const leftLegChain = this.createLegIKChain('leftLeg', model.skeleton, 'left');
    if (leftLegChain) {
      ikChains.set('leftLeg', leftLegChain);
    }
    
    const rightLegChain = this.createLegIKChain('rightLeg', model.skeleton, 'right');
    if (rightLegChain) {
      ikChains.set('rightLeg', rightLegChain);
    }
    
    this._ikChains.set(ikChains);
  }

  /**
   * Create arm IK chain
   */
  private createArmIKChain(name: string, skeleton: THREE.Skeleton, side: 'left' | 'right'): IKChain | null {
    const prefix = side === 'left' ? 'Left' : 'Right';
    const shoulder = skeleton.getBoneByName(`${prefix}UpperArm`);
    const elbow = skeleton.getBoneByName(`${prefix}LowerArm`);
    const hand = skeleton.getBoneByName(`${prefix}Hand`);
    
    if (!shoulder || !elbow || !hand) {
      console.warn(`Could not find ${side} arm bones for IK chain`);
      return null;
    }
    
    return {
      name,
      rootBone: shoulder,
      endEffector: hand,
      bones: [shoulder, elbow, hand],
      target: new THREE.Vector3(),
      chainLength: 2,
      maxIterations: 10,
      tolerance: 0.01,
      constraints: [
        {
          type: 'hinge',
          axis: new THREE.Vector3(1, 0, 0),
          angleLimits: { min: -2.5, max: 0.1 }
        }
      ]
    };
  }

  /**
   * Create leg IK chain
   */
  private createLegIKChain(name: string, skeleton: THREE.Skeleton, side: 'left' | 'right'): IKChain | null {
    const prefix = side === 'left' ? 'Left' : 'Right';
    const thigh = skeleton.getBoneByName(`${prefix}UpperLeg`);
    const knee = skeleton.getBoneByName(`${prefix}LowerLeg`);
    const foot = skeleton.getBoneByName(`${prefix}Foot`);
    
    if (!thigh || !knee || !foot) {
      console.warn(`Could not find ${side} leg bones for IK chain`);
      return null;
    }
    
    return {
      name,
      rootBone: thigh,
      endEffector: foot,
      bones: [thigh, knee, foot],
      target: new THREE.Vector3(),
      chainLength: 2,
      maxIterations: 10,
      tolerance: 0.01,
      constraints: [
        {
          type: 'hinge',
          axis: new THREE.Vector3(1, 0, 0),
          angleLimits: { min: 0, max: 2.3 }
        }
      ]
    };
  }

  /**
   * Initialize gesture system
   */
  private initializeGestureSystem(model: AvatarModel): void {
    const gestures = new Map<string, Gesture>();
    
    // Create basic gestures
    model.animations.forEach(clip => {
      if (this.isGestureAnimation(clip.name)) {
        const gesture: Gesture = {
          name: clip.name,
          category: this.categorizeGesture(clip.name),
          clips: [clip],
          duration: clip.duration,
          weight: 1.0,
          priority: 1,
          interruptible: true,
          fadeIn: 0.2,
          fadeOut: 0.2,
          metadata: {
            tags: this.extractGestureTags(clip.name)
          }
        };
        gestures.set(clip.name, gesture);
      }
    });
    
    this._availableGestures.set(gestures);
  }

  /**
   * Check if animation clip is a gesture
   */
  private isGestureAnimation(clipName: string): boolean {
    const gestureKeywords = ['wave', 'point', 'thumbsup', 'clap', 'gesture', 'hand'];
    return gestureKeywords.some(keyword => 
      clipName.toLowerCase().includes(keyword)
    );
  }

  /**
   * Categorize gesture by name
   */
  private categorizeGesture(clipName: string): 'hand' | 'head' | 'body' | 'full' {
    const name = clipName.toLowerCase();
    if (name.includes('hand') || name.includes('finger') || name.includes('wave') || name.includes('point')) {
      return 'hand';
    }
    if (name.includes('nod') || name.includes('shake') || name.includes('head')) {
      return 'head';
    }
    if (name.includes('full') || name.includes('body') || name.includes('dance')) {
      return 'full';
    }
    return 'body';
  }

  /**
   * Extract gesture tags from clip name
   */
  private extractGestureTags(clipName: string): string[] {
    const tags: string[] = [];
    const name = clipName.toLowerCase();
    
    if (name.includes('happy') || name.includes('joy')) tags.push('positive');
    if (name.includes('sad') || name.includes('down')) tags.push('negative');
    if (name.includes('greeting')) tags.push('social');
    if (name.includes('pointing')) tags.push('directional');
    
    return tags;
  }

  /**
   * Initialize procedural animations
   */
  private initializeProceduralAnimations(model: AvatarModel): void {
    const proceduralAnimations = new Map<string, ProceduralAnimation>();
    
    // Breathing animation
    proceduralAnimations.set('breathing', {
      name: 'breathing',
      type: 'breathing',
      bones: ['Spine', 'Spine1', 'Spine2'],
      parameters: {
        amplitude: new THREE.Vector3(0.002, 0.005, 0.001),
        frequency: 0.3,
        phase: 0
      }
    });
    
    // Idle sway
    proceduralAnimations.set('idleSway', {
      name: 'idleSway',
      type: 'sway',
      bones: ['Hips'],
      parameters: {
        amplitude: new THREE.Vector3(0.001, 0, 0.001),
        frequency: 0.1,
        phase: 0
      }
    });
    
    // Subtle head movement
    proceduralAnimations.set('headMovement', {
      name: 'headMovement',
      type: 'noise',
      bones: ['Head'],
      parameters: {
        amplitude: new THREE.Vector3(0.005, 0.003, 0.005),
        frequency: 0.05,
        noiseScale: 0.1
      }
    });
    
    this._proceduralAnimations.set(proceduralAnimations);
  }

  /**
   * Set up animation layers
   */
  private setupAnimationLayers(): void {
    const layers: AnimationLayer[] = [
      {
        index: 0,
        name: 'Base',
        weight: 1.0,
        additive: false,
        animations: [],
        blendMode: 'normal'
      },
      {
        index: 1,
        name: 'Gestures',
        weight: 1.0,
        additive: false,
        animations: [],
        blendMode: 'normal'
      },
      {
        index: 2,
        name: 'Facial',
        weight: 1.0,
        additive: true,
        animations: [],
        blendMode: 'additive'
      },
      {
        index: 3,
        name: 'Procedural',
        weight: 0.5,
        additive: true,
        animations: [],
        blendMode: 'additive'
      }
    ];
    
    this._animationLayers.set(layers);
  }

  /**
   * Initialize animation state machine
   */
  private initializeStateMachine(): void {
    const states = new Map<string, AnimationState>();
    
    // Idle state
    states.set('idle', {
      name: 'idle',
      animations: [],
      weight: 1.0,
      loop: true,
      speed: 1.0
    });
    
    // Talking state
    states.set('talking', {
      name: 'talking',
      animations: [],
      weight: 1.0,
      loop: true,
      speed: 1.0
    });
    
    // Gesturing state
    states.set('gesturing', {
      name: 'gesturing',
      animations: [],
      weight: 1.0,
      loop: false,
      speed: 1.0
    });
    
    const transitions: AnimationTransition[] = [
      {
        fromState: 'idle',
        toState: 'talking',
        conditions: [
          { parameter: 'speaking', comparison: 'equals', threshold: true }
        ],
        duration: 0.3
      },
      {
        fromState: 'talking',
        toState: 'idle',
        conditions: [
          { parameter: 'speaking', comparison: 'equals', threshold: false }
        ],
        duration: 0.5
      }
    ];
    
    const stateMachine: AnimationStateMachine = {
      currentState: states.get('idle')!,
      states,
      transitions,
      parameters: new Map([
        ['speaking', false],
        ['gesturing', false],
        ['emotionIntensity', 0]
      ])
    };
    
    this._stateMachine.set(stateMachine);
  }

  /**
   * Play skeletal animation
   */
  playAnimation(animationName: string, options?: {
    loop?: boolean;
    fadeInDuration?: number;
    weight?: number;
    timeScale?: number;
    layer?: number;
  }): THREE.AnimationAction | null {
    const mixer = this._animationMixer();
    const model = this._currentModel();
    
    if (!mixer || !model) {
      console.warn('Animation system not initialized');
      return null;
    }
    
    const clip = model.animations.find(clip => clip.name === animationName);
    if (!clip) {
      console.warn(`Animation '${animationName}' not found`);
      return null;
    }
    
    const action = mixer.clipAction(clip);
    
    // Configure action
    action.loop = options?.loop !== false ? THREE.LoopRepeat : THREE.LoopOnce;
    action.weight = options?.weight ?? 1.0;
    action.timeScale = options?.timeScale ?? 1.0;
    
    // Fade in if specified
    if (options?.fadeInDuration) {
      action.fadeIn(options.fadeInDuration);
    }
    
    action.play();
    
    // Track active animation
    const skeletal: SkeletalAnimation = {
      name: animationName,
      clip,
      action,
      loop: action.loop,
      weight: action.weight,
      fadeInDuration: options?.fadeInDuration,
      timeScale: action.timeScale,
      layer: options?.layer ?? 0
    };
    
    const activeAnimations = this._activeAnimations();
    const newActiveAnimations = new Map(activeAnimations);
    newActiveAnimations.set(animationName, skeletal);
    this._activeAnimations.set(newActiveAnimations);
    
    return action;
  }

  /**
   * Stop skeletal animation
   */
  stopAnimation(animationName: string, fadeOutDuration?: number): void {
    const activeAnimations = this._activeAnimations();
    const animation = activeAnimations.get(animationName);
    
    if (animation?.action) {
      if (fadeOutDuration) {
        animation.action.fadeOut(fadeOutDuration);
      } else {
        animation.action.stop();
      }
      
      const newActiveAnimations = new Map(activeAnimations);
      newActiveAnimations.delete(animationName);
      this._activeAnimations.set(newActiveAnimations);
    }
  }

  /**
   * Set morph target weight
   */
  setMorphTargetWeight(targetName: string, weight: number, duration?: number): void {
    const model = this._currentModel();
    if (!model) return;
    
    if (duration && duration > 0) {
      // Animate to target weight
      const morphAnim: MorphTargetAnimation = {
        name: targetName,
        weight,
        duration,
        easing: (t) => t * t * (3 - 2 * t), // Smoothstep
      };
      
      const activeMorphTargets = this._activeMorphTargets();
      const newActiveMorphTargets = new Map(activeMorphTargets);
      newActiveMorphTargets.set(targetName, morphAnim);
      this._activeMorphTargets.set(newActiveMorphTargets);
    } else {
      // Set immediately
      this.setMorphTargetWeightImmediate(targetName, weight);
    }
  }

  /**
   * Set morph target weight immediately
   */
  private setMorphTargetWeightImmediate(targetName: string, weight: number): void {
    const model = this._currentModel();
    if (!model) return;
    
    model.morphTargetMeshes.forEach(mesh => {
      if (mesh.morphTargetDictionary?.[targetName] !== undefined) {
        const index = mesh.morphTargetDictionary[targetName];
        if (mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[index] = weight;
        }
      }
    });
    
    // Update weight tracking
    const weights = this._morphTargetWeights();
    const newWeights = new Map(weights);
    newWeights.set(targetName, weight);
    this._morphTargetWeights.set(newWeights);
  }

  /**
   * Play facial expression
   */
  playFacialExpression(expressionName: string, intensity: number = 1.0, duration: number = 1.0): void {
    const facialSystem = this._facialSystem();
    if (!facialSystem) return;
    
    const expression = facialSystem.expressions.get(expressionName);
    if (!expression) {
      console.warn(`Facial expression '${expressionName}' not found`);
      return;
    }
    
    // Apply morph target weights
    Object.entries(expression.morphWeights).forEach(([targetName, weight]) => {
      this.setMorphTargetWeight(targetName, weight * intensity, duration);
    });
  }

  /**
   * Play gesture
   */
  playGesture(gestureName: string, options?: {
    interrupt?: boolean;
    fadeIn?: number;
    fadeOut?: number;
  }): void {
    const availableGestures = this._availableGestures();
    const gesture = availableGestures.get(gestureName);
    
    if (!gesture) {
      console.warn(`Gesture '${gestureName}' not found`);
      return;
    }
    
    // Stop current gesture if not interruptible
    const activeGestures = this._activeGestures();
    if (options?.interrupt !== false) {
      activeGestures.forEach(activeGesture => {
        if (activeGesture.interruptible) {
          this.stopGesture(activeGesture.name);
        }
      });
    }
    
    // Play gesture animation
    gesture.clips.forEach(clip => {
      this.playAnimation(clip.name, {
        loop: false,
        fadeInDuration: options?.fadeIn ?? gesture.fadeIn,
        weight: gesture.weight,
        layer: 1
      });
    });
    
    // Track active gesture
    const newActiveGestures = new Map(activeGestures);
    newActiveGestures.set(gestureName, gesture);
    this._activeGestures.set(newActiveGestures);
    
    // Auto-remove after duration
    setTimeout(() => {
      this.stopGesture(gestureName, options?.fadeOut ?? gesture.fadeOut);
    }, gesture.duration * 1000);
  }

  /**
   * Stop gesture
   */
  stopGesture(gestureName: string, fadeOut?: number): void {
    const activeGestures = this._activeGestures();
    const gesture = activeGestures.get(gestureName);
    
    if (!gesture) return;
    
    // Stop gesture animations
    gesture.clips.forEach(clip => {
      this.stopAnimation(clip.name, fadeOut);
    });
    
    // Remove from active gestures
    const newActiveGestures = new Map(activeGestures);
    newActiveGestures.delete(gestureName);
    this._activeGestures.set(newActiveGestures);
  }

  /**
   * Set IK target position
   */
  setIKTarget(chainName: string, targetPosition: THREE.Vector3): void {
    const ikChains = this._ikChains();
    const chain = ikChains.get(chainName);
    
    if (chain) {
      chain.target.copy(targetPosition);
      this._ikEnabled.set(true);
    }
  }

  /**
   * Solve IK for a chain using FABRIK algorithm
   */
  private solveIK(chain: IKChain): void {
    const { bones, target, tolerance, maxIterations } = chain;
    
    if (bones.length < 2) return;
    
    const positions = bones.map(bone => bone.position.clone());
    const distances = [];
    
    // Calculate segment lengths
    for (let i = 0; i < bones.length - 1; i++) {
      distances.push(positions[i].distanceTo(positions[i + 1]));
    }
    
    // FABRIK algorithm
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Forward pass
      positions[positions.length - 1] = target.clone();
      for (let i = positions.length - 2; i >= 0; i--) {
        const direction = positions[i].clone().sub(positions[i + 1]).normalize();
        positions[i] = positions[i + 1].clone().add(direction.multiplyScalar(distances[i]));
      }
      
      // Backward pass
      for (let i = 1; i < positions.length; i++) {
        const direction = positions[i].clone().sub(positions[i - 1]).normalize();
        positions[i] = positions[i - 1].clone().add(direction.multiplyScalar(distances[i - 1]));
      }
      
      // Check convergence
      if (positions[positions.length - 1].distanceTo(target) < tolerance) {
        break;
      }
    }
    
    // Apply positions back to bones
    for (let i = 0; i < bones.length; i++) {
      bones[i].position.copy(positions[i]);
    }
  }

  /**
   * Start animation update loop
   */
  private startAnimationLoop(): void {
    if (this.animationFrameId) return;
    
    const update = () => {
      this.animationFrameId = requestAnimationFrame(update);
      this.updateAnimations();
    };
    
    update();
  }

  /**
   * Stop animation update loop
   */
  private stopAnimationLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Update all animations
   */
  private updateAnimations(): void {
    const mixer = this._animationMixer();
    const clock = this._clock();
    const deltaTime = clock.getDelta();
    
    if (mixer) {
      mixer.update(deltaTime);
    }
    
    // Update morph target animations
    this.updateMorphTargetAnimations(deltaTime);
    
    // Update procedural animations
    this.updateProceduralAnimations(deltaTime);
    
    // Update facial animations
    this.updateFacialAnimations(deltaTime);
    
    // Update IK if enabled
    if (this._ikEnabled()) {
      this.updateIK();
    }
    
    // Update blink system
    this.updateBlinkSystem(deltaTime);
  }

  /**
   * Update morph target animations
   */
  private updateMorphTargetAnimations(deltaTime: number): void {
    const activeMorphTargets = this._activeMorphTargets();
    const updatedMorphTargets = new Map();
    
    activeMorphTargets.forEach((animation, name) => {
      // Simple linear interpolation for morph targets
      // In a real implementation, you'd use the easing function and proper timing
      const currentWeight = this._morphTargetWeights().get(name) || 0;
      const targetWeight = animation.weight;
      const speed = Math.abs(targetWeight - currentWeight) / animation.duration;
      const newWeight = THREE.MathUtils.lerp(currentWeight, targetWeight, speed * deltaTime);
      
      this.setMorphTargetWeightImmediate(name, newWeight);
      
      // Keep animation active if not reached target
      if (Math.abs(newWeight - targetWeight) > 0.001) {
        updatedMorphTargets.set(name, animation);
      }
    });
    
    this._activeMorphTargets.set(updatedMorphTargets);
  }

  /**
   * Update procedural animations
   */
  private updateProceduralAnimations(deltaTime: number): void {
    const model = this._currentModel();
    const proceduralAnimations = this._proceduralAnimations();
    
    if (!model) return;
    
    const currentTime = performance.now() * 0.001;
    
    proceduralAnimations.forEach(animation => {
      animation.bones.forEach(boneName => {
        const bone = model.bones.get(boneName);
        if (!bone) return;
        
        switch (animation.type) {
          case 'breathing':
            this.applyBreathingAnimation(bone, animation, currentTime);
            break;
          case 'sway':
            this.applySwayAnimation(bone, animation, currentTime);
            break;
          case 'noise':
            this.applyNoiseAnimation(bone, animation, currentTime);
            break;
          case 'custom':
            if (animation.updateFunction) {
              animation.updateFunction(currentTime, bone, animation.parameters);
            }
            break;
        }
      });
    });
  }

  /**
   * Apply breathing animation
   */
  private applyBreathingAnimation(bone: THREE.Bone, animation: ProceduralAnimation, time: number): void {
    const { amplitude, frequency, phase } = animation.parameters;
    if (!amplitude || !frequency) return;
    
    const breathingValue = Math.sin(time * frequency * 2 * Math.PI + (phase || 0));
    bone.scale.x = 1 + amplitude.x * breathingValue;
    bone.scale.y = 1 + amplitude.y * breathingValue;
    bone.scale.z = 1 + amplitude.z * breathingValue;
  }

  /**
   * Apply sway animation
   */
  private applySwayAnimation(bone: THREE.Bone, animation: ProceduralAnimation, time: number): void {
    const { amplitude, frequency, phase } = animation.parameters;
    if (!amplitude || !frequency) return;
    
    const swayX = Math.sin(time * frequency * 2 * Math.PI + (phase || 0));
    const swayZ = Math.cos(time * frequency * 1.3 * Math.PI + (phase || 0));
    
    bone.position.x += amplitude.x * swayX;
    bone.position.z += amplitude.z * swayZ;
  }

  /**
   * Apply noise animation
   */
  private applyNoiseAnimation(bone: THREE.Bone, animation: ProceduralAnimation, time: number): void {
    const { amplitude, frequency, noiseScale } = animation.parameters;
    if (!amplitude || !frequency) return;
    
    // Simple pseudo-noise based on sine waves
    const noiseX = Math.sin(time * frequency * 2.1 * Math.PI) * Math.cos(time * frequency * 1.7 * Math.PI);
    const noiseY = Math.sin(time * frequency * 1.9 * Math.PI) * Math.cos(time * frequency * 2.3 * Math.PI);
    const noiseZ = Math.sin(time * frequency * 2.7 * Math.PI) * Math.cos(time * frequency * 1.3 * Math.PI);
    
    const scale = noiseScale || 1;
    bone.rotation.x += amplitude.x * noiseX * scale;
    bone.rotation.y += amplitude.y * noiseY * scale;
    bone.rotation.z += amplitude.z * noiseZ * scale;
  }

  /**
   * Update facial animations
   */
  private updateFacialAnimations(deltaTime: number): void {
    const facialSystem = this._facialSystem();
    if (!facialSystem) return;
    
    // Update facial expression blending
    this.updateExpressionBlending(deltaTime);
  }

  /**
   * Update expression blending
   */
  private updateExpressionBlending(deltaTime: number): void {
    // Implementation for smooth expression transitions
    // This would blend between different facial expressions over time
  }

  /**
   * Update IK systems
   */
  private updateIK(): void {
    const ikChains = this._ikChains();
    ikChains.forEach(chain => {
      this.solveIK(chain);
    });
  }

  /**
   * Update blink system
   */
  private updateBlinkSystem(deltaTime: number): void {
    const blinkSystem = this._blinkSystem();
    const eyeTracking = this._eyeTracking();
    
    if (!blinkSystem || !eyeTracking || !blinkSystem.autoBlinkEnabled) return;
    
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
    const blinkSystem = this._blinkSystem();
    if (!blinkSystem) return;
    
    blinkSystem.currentState = BlinkState.CLOSING;
    blinkSystem.lastBlinkTime = performance.now() * 0.001;
  }

  /**
   * Update blink animation
   */
  private updateBlinkAnimation(deltaTime: number): void {
    const blinkSystem = this._blinkSystem();
    const eyeTracking = this._eyeTracking();
    
    if (!blinkSystem || !eyeTracking) return;
    
    const currentTime = performance.now() * 0.001;
    const blinkProgress = (currentTime - blinkSystem.lastBlinkTime) / blinkSystem.blinkDuration;
    
    switch (blinkSystem.currentState) {
      case BlinkState.CLOSING:
        const closeAmount = Math.min(1, blinkProgress * 2); // Close in first half
        eyeTracking.leftEye.morphTargets.blink = closeAmount;
        eyeTracking.rightEye.morphTargets.blink = closeAmount;
        
        if (closeAmount >= 1) {
          blinkSystem.currentState = BlinkState.OPENING;
        }
        break;
        
      case BlinkState.OPENING:
        const openAmount = Math.max(0, 1 - (blinkProgress - 0.5) * 2); // Open in second half
        eyeTracking.leftEye.morphTargets.blink = openAmount;
        eyeTracking.rightEye.morphTargets.blink = openAmount;
        
        if (openAmount <= 0) {
          blinkSystem.currentState = BlinkState.OPEN;
        }
        break;
    }
    
    // Apply blink morph targets
    this.setMorphTargetWeightImmediate('eyeBlinkLeft', eyeTracking.leftEye.morphTargets.blink);
    this.setMorphTargetWeightImmediate('eyeBlinkRight', eyeTracking.rightEye.morphTargets.blink);
  }

  /**
   * Dispose of animation system
   */
  dispose(): void {
    this.stopAnimationLoop();
    
    const mixer = this._animationMixer();
    if (mixer) {
      mixer.stopAllAction();
    }
    
    // Clear all signals
    this._activeAnimations.set(new Map());
    this._activeMorphTargets.set(new Map());
    this._activeGestures.set(new Map());
    this._currentModel.set(null);
    this._animationMixer.set(null);
  }
}