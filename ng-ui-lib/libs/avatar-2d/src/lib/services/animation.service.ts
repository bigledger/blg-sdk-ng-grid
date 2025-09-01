import { Injectable, signal, computed } from '@angular/core';
import { 
  FacialExpression, 
  Gesture, 
  AvatarState, 
  AnimationEasing,
  BodyPartTransform,
  GestureFrame
} from '../interfaces/avatar.interfaces';

/**
 * Service for managing facial animations and expressions
 */
@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private readonly _currentState = signal<AvatarState>({
    currentExpression: this.getNeutralExpression(),
    currentGesture: undefined,
    gestureProgress: 0,
    lipSyncData: undefined,
    lipSyncProgress: 0,
    isAnimating: false,
    animationQueue: []
  });

  private animationStartTime = 0;
  private animationDuration = 0;
  private animationFrame: number | null = null;
  
  readonly currentState = this._currentState.asReadonly();
  readonly isAnimating = computed(() => this._currentState().isAnimating);
  readonly currentExpression = computed(() => this._currentState().currentExpression);
  readonly currentGesture = computed(() => this._currentState().currentGesture);

  constructor() {}

  /**
   * Get the neutral facial expression
   */
  private getNeutralExpression(): FacialExpression {
    return {
      id: 'neutral',
      name: 'Neutral',
      eyeState: {
        leftEye: { openness: 0.8, direction: { x: 0, y: 0 } },
        rightEye: { openness: 0.8, direction: { x: 0, y: 0 } },
        blinkSpeed: 0.2
      },
      eyebrowState: {
        leftBrow: { height: 0, angle: 0 },
        rightBrow: { height: 0, angle: 0 }
      },
      mouthState: {
        shape: 'neutral',
        openness: 0,
        width: 1,
        corners: 0
      }
    };
  }

  /**
   * Change facial expression with smooth transition
   */
  changeExpression(newExpression: FacialExpression, duration = 500): Promise<void> {
    return new Promise((resolve) => {
      const currentState = this._currentState();
      const fromExpression = currentState.currentExpression;
      
      this.animationStartTime = performance.now();
      this.animationDuration = duration;
      
      this._currentState.update(state => ({
        ...state,
        isAnimating: true
      }));

      const animate = (currentTime: number) => {
        const elapsed = currentTime - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
        
        // Interpolate between expressions
        const interpolatedExpression = this.interpolateExpressions(
          fromExpression, 
          newExpression, 
          progress, 
          newExpression.easing || 'ease-in-out'
        );
        
        this._currentState.update(state => ({
          ...state,
          currentExpression: interpolatedExpression
        }));

        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate);
        } else {
          this._currentState.update(state => ({
            ...state,
            currentExpression: newExpression,
            isAnimating: false
          }));
          resolve();
        }
      };

      this.animationFrame = requestAnimationFrame(animate);
    });
  }

  /**
   * Start a gesture animation
   */
  playGesture(gesture: Gesture): Promise<void> {
    return new Promise((resolve) => {
      this.animationStartTime = performance.now();
      this.animationDuration = gesture.duration;
      
      this._currentState.update(state => ({
        ...state,
        currentGesture: gesture,
        gestureProgress: 0,
        isAnimating: true
      }));

      const animate = (currentTime: number) => {
        const elapsed = currentTime - this.animationStartTime;
        let progress = elapsed / this.animationDuration;
        
        if (gesture.loop && progress >= 1) {
          progress = progress % 1; // Loop the animation
          this.animationStartTime = currentTime - (progress * this.animationDuration);
        } else {
          progress = Math.min(progress, 1);
        }
        
        this._currentState.update(state => ({
          ...state,
          gestureProgress: progress
        }));

        if (progress < 1 || gesture.loop) {
          this.animationFrame = requestAnimationFrame(animate);
        } else {
          this._currentState.update(state => ({
            ...state,
            currentGesture: undefined,
            gestureProgress: 0,
            isAnimating: false
          }));
          resolve();
        }
      };

      this.animationFrame = requestAnimationFrame(animate);
    });
  }

  /**
   * Queue an animation to play after current ones finish
   */
  queueAnimation(animation: Gesture | FacialExpression): void {
    this._currentState.update(state => ({
      ...state,
      animationQueue: [...state.animationQueue, animation]
    }));

    // Process queue if not currently animating
    if (!this.isAnimating()) {
      this.processAnimationQueue();
    }
  }

  /**
   * Process the animation queue
   */
  private async processAnimationQueue(): Promise<void> {
    const queue = this._currentState().animationQueue;
    if (queue.length === 0) return;

    const nextAnimation = queue[0];
    
    // Remove from queue
    this._currentState.update(state => ({
      ...state,
      animationQueue: state.animationQueue.slice(1)
    }));

    // Play the animation
    if ('frames' in nextAnimation) {
      await this.playGesture(nextAnimation);
    } else {
      await this.changeExpression(nextAnimation);
    }

    // Process next in queue
    if (this._currentState().animationQueue.length > 0) {
      this.processAnimationQueue();
    }
  }

  /**
   * Clear the animation queue
   */
  clearQueue(): void {
    this._currentState.update(state => ({
      ...state,
      animationQueue: []
    }));
  }

  /**
   * Stop current animation
   */
  stopAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this._currentState.update(state => ({
      ...state,
      isAnimating: false,
      currentGesture: undefined,
      gestureProgress: 0
    }));
  }

  /**
   * Interpolate between two facial expressions
   */
  private interpolateExpressions(
    from: FacialExpression, 
    to: FacialExpression, 
    progress: number,
    easing: AnimationEasing
  ): FacialExpression {
    const easedProgress = this.applyEasing(progress, easing);
    
    return {
      id: `${from.id}-to-${to.id}`,
      name: `Transition`,
      eyeState: {
        leftEye: {
          openness: this.lerp(from.eyeState.leftEye.openness, to.eyeState.leftEye.openness, easedProgress),
          direction: {
            x: this.lerp(from.eyeState.leftEye.direction.x, to.eyeState.leftEye.direction.x, easedProgress),
            y: this.lerp(from.eyeState.leftEye.direction.y, to.eyeState.leftEye.direction.y, easedProgress)
          }
        },
        rightEye: {
          openness: this.lerp(from.eyeState.rightEye.openness, to.eyeState.rightEye.openness, easedProgress),
          direction: {
            x: this.lerp(from.eyeState.rightEye.direction.x, to.eyeState.rightEye.direction.x, easedProgress),
            y: this.lerp(from.eyeState.rightEye.direction.y, to.eyeState.rightEye.direction.y, easedProgress)
          }
        },
        blinkSpeed: this.lerp(from.eyeState.blinkSpeed, to.eyeState.blinkSpeed, easedProgress)
      },
      eyebrowState: {
        leftBrow: {
          height: this.lerp(from.eyebrowState.leftBrow.height, to.eyebrowState.leftBrow.height, easedProgress),
          angle: this.lerp(from.eyebrowState.leftBrow.angle, to.eyebrowState.leftBrow.angle, easedProgress)
        },
        rightBrow: {
          height: this.lerp(from.eyebrowState.rightBrow.height, to.eyebrowState.rightBrow.height, easedProgress),
          angle: this.lerp(from.eyebrowState.rightBrow.angle, to.eyebrowState.rightBrow.angle, easedProgress)
        }
      },
      mouthState: {
        shape: easedProgress < 0.5 ? from.mouthState.shape : to.mouthState.shape,
        openness: this.lerp(from.mouthState.openness, to.mouthState.openness, easedProgress),
        width: this.lerp(from.mouthState.width, to.mouthState.width, easedProgress),
        corners: this.lerp(from.mouthState.corners, to.mouthState.corners, easedProgress)
      }
    };
  }

  /**
   * Linear interpolation between two values
   */
  private lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }

  /**
   * Apply easing function to progress
   */
  private applyEasing(progress: number, easing: AnimationEasing): number {
    switch (easing) {
      case 'linear':
        return progress;
      
      case 'ease-in':
        return progress * progress;
      
      case 'ease-out':
        return 1 - (1 - progress) * (1 - progress);
      
      case 'ease-in-out':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - 2 * (1 - progress) * (1 - progress);
      
      case 'bounce':
        if (progress < 1 / 2.75) {
          return 7.5625 * progress * progress;
        } else if (progress < 2 / 2.75) {
          progress -= 1.5 / 2.75;
          return 7.5625 * progress * progress + 0.75;
        } else if (progress < 2.5 / 2.75) {
          progress -= 2.25 / 2.75;
          return 7.5625 * progress * progress + 0.9375;
        } else {
          progress -= 2.625 / 2.75;
          return 7.5625 * progress * progress + 0.984375;
        }
      
      case 'elastic':
        if (progress === 0 || progress === 1) return progress;
        const p = 0.3;
        const s = p / 4;
        return -(Math.pow(2, 10 * (progress - 1)) * Math.sin((progress - 1 - s) * (2 * Math.PI) / p));
      
      default:
        return progress;
    }
  }

  /**
   * Start idle blinking animation
   */
  startBlinking(interval = 3000): void {
    const blink = () => {
      if (!this.isAnimating()) {
        const blinkExpression: FacialExpression = {
          ...this.currentExpression(),
          eyeState: {
            ...this.currentExpression().eyeState,
            leftEye: { ...this.currentExpression().eyeState.leftEye, openness: 0 },
            rightEye: { ...this.currentExpression().eyeState.rightEye, openness: 0 }
          }
        };

        this.changeExpression(blinkExpression, 100).then(() => {
          setTimeout(() => {
            this.changeExpression(this.currentExpression(), 100);
          }, 100);
        });
      }
      
      // Schedule next blink
      setTimeout(blink, interval + Math.random() * 2000); // Add some randomness
    };

    // Start blinking
    setTimeout(blink, interval);
  }

  /**
   * Get current gesture frame for a given progress
   */
  getCurrentGestureFrame(gesture: Gesture, progress: number): GestureFrame | null {
    if (!gesture || gesture.frames.length === 0) return null;

    // Find the appropriate frame based on progress
    for (let i = 0; i < gesture.frames.length - 1; i++) {
      const currentFrame = gesture.frames[i];
      const nextFrame = gesture.frames[i + 1];
      
      if (progress >= currentFrame.timestamp && progress <= nextFrame.timestamp) {
        // Interpolate between frames if needed
        const frameProgress = (progress - currentFrame.timestamp) / 
          (nextFrame.timestamp - currentFrame.timestamp);
        
        return this.interpolateGestureFrames(currentFrame, nextFrame, frameProgress);
      }
    }

    // Return last frame if progress is beyond all timestamps
    return gesture.frames[gesture.frames.length - 1];
  }

  /**
   * Interpolate between two gesture frames
   */
  private interpolateGestureFrames(
    from: GestureFrame, 
    to: GestureFrame, 
    progress: number
  ): GestureFrame {
    const interpolatedBodyParts: { [layerId: string]: BodyPartTransform } = {};
    
    // Get all unique layer IDs from both frames
    const layerIds = new Set([...Object.keys(from.bodyParts), ...Object.keys(to.bodyParts)]);
    
    for (const layerId of layerIds) {
      const fromTransform = from.bodyParts[layerId] || {};
      const toTransform = to.bodyParts[layerId] || {};
      
      interpolatedBodyParts[layerId] = {
        position: fromTransform.position && toTransform.position ? {
          x: this.lerp(fromTransform.position.x, toTransform.position.x, progress),
          y: this.lerp(fromTransform.position.y, toTransform.position.y, progress)
        } : fromTransform.position || toTransform.position,
        
        rotation: fromTransform.rotation !== undefined && toTransform.rotation !== undefined
          ? this.lerp(fromTransform.rotation, toTransform.rotation, progress)
          : fromTransform.rotation ?? toTransform.rotation,
        
        scale: fromTransform.scale && toTransform.scale ? {
          x: this.lerp(fromTransform.scale.x, toTransform.scale.x, progress),
          y: this.lerp(fromTransform.scale.y, toTransform.scale.y, progress)
        } : fromTransform.scale || toTransform.scale,
        
        opacity: fromTransform.opacity !== undefined && toTransform.opacity !== undefined
          ? this.lerp(fromTransform.opacity, toTransform.opacity, progress)
          : fromTransform.opacity ?? toTransform.opacity
      };
    }

    return {
      timestamp: this.lerp(from.timestamp, to.timestamp, progress),
      bodyParts: interpolatedBodyParts,
      easing: to.easing || from.easing
    };
  }

  /**
   * Reset to neutral state
   */
  resetToNeutral(duration = 500): Promise<void> {
    this.clearQueue();
    this.stopAnimation();
    return this.changeExpression(this.getNeutralExpression(), duration);
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.stopAnimation();
    this.clearQueue();
  }
}