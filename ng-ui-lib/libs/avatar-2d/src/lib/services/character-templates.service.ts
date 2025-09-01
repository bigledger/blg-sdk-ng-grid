import { Injectable, signal } from '@angular/core';
import { 
  CharacterTemplate, 
  BodyLayer, 
  ColorRGBA, 
  FacialExpression,
  Gesture,
  Vector2D,
  LayerType
} from '../interfaces/avatar.interfaces';

/**
 * Service for managing character templates and base configurations
 */
@Injectable({
  providedIn: 'root'
})
export class CharacterTemplatesService {
  private readonly _templates = signal<CharacterTemplate[]>([]);
  private readonly _baseExpressions = signal<FacialExpression[]>([]);
  private readonly _baseGestures = signal<Gesture[]>([]);

  readonly templates = this._templates.asReadonly();
  readonly baseExpressions = this._baseExpressions.asReadonly();
  readonly baseGestures = this._baseGestures.asReadonly();

  constructor() {
    this.initializeDefaultTemplates();
    this.initializeBaseExpressions();
    this.initializeBaseGestures();
  }

  private initializeDefaultTemplates(): void {
    const templates: CharacterTemplate[] = [
      // Young Male
      {
        id: 'young-male',
        name: 'Young Male',
        gender: 'male',
        ageGroup: 'young',
        bodyType: 'average',
        skinTone: { r: 255, g: 220, b: 177 },
        baseLayers: this.createMaleBaseLayers()
      },
      // Young Female
      {
        id: 'young-female',
        name: 'Young Female',
        gender: 'female',
        ageGroup: 'young',
        bodyType: 'average',
        skinTone: { r: 255, g: 220, b: 177 },
        baseLayers: this.createFemaleBaseLayers()
      },
      // Middle-aged Male
      {
        id: 'middle-male',
        name: 'Middle-aged Male',
        gender: 'male',
        ageGroup: 'middle-aged',
        bodyType: 'average',
        skinTone: { r: 240, g: 200, b: 165 },
        baseLayers: this.createMaleBaseLayers()
      },
      // Middle-aged Female
      {
        id: 'middle-female',
        name: 'Middle-aged Female',
        gender: 'female',
        ageGroup: 'middle-aged',
        bodyType: 'average',
        skinTone: { r: 240, g: 200, b: 165 },
        baseLayers: this.createFemaleBaseLayers()
      }
    ];

    this._templates.set(templates);
  }

  private createMaleBaseLayers(): BodyLayer[] {
    return [
      {
        id: 'body',
        name: 'Body',
        type: 'body',
        zIndex: 1,
        visible: true,
        opacity: 1,
        position: { x: 100, y: 150 },
        size: { width: 120, height: 200 },
        anchor: { x: 0.5, y: 0 },
        color: { r: 255, g: 220, b: 177 }
      },
      {
        id: 'head',
        name: 'Head',
        type: 'head',
        zIndex: 10,
        visible: true,
        opacity: 1,
        position: { x: 100, y: 50 },
        size: { width: 80, height: 100 },
        anchor: { x: 0.5, y: 0.5 },
        color: { r: 255, g: 220, b: 177 }
      },
      {
        id: 'hair',
        name: 'Hair',
        type: 'hair',
        zIndex: 15,
        visible: true,
        opacity: 1,
        position: { x: 100, y: 30 },
        size: { width: 90, height: 60 },
        anchor: { x: 0.5, y: 0 },
        color: { r: 101, g: 67, b: 33 }
      },
      {
        id: 'eyes',
        name: 'Eyes',
        type: 'eyes',
        zIndex: 20,
        visible: true,
        opacity: 1,
        position: { x: 100, y: 70 },
        size: { width: 40, height: 15 },
        anchor: { x: 0.5, y: 0.5 },
        color: { r: 70, g: 130, b: 180 }
      },
      {
        id: 'eyebrows',
        name: 'Eyebrows',
        type: 'eyebrows',
        zIndex: 18,
        visible: true,
        opacity: 1,
        position: { x: 100, y: 62 },
        size: { width: 45, height: 8 },
        anchor: { x: 0.5, y: 0.5 },
        color: { r: 101, g: 67, b: 33 }
      },
      {
        id: 'nose',
        name: 'Nose',
        type: 'nose',
        zIndex: 12,
        visible: true,
        opacity: 1,
        position: { x: 100, y: 80 },
        size: { width: 12, height: 20 },
        anchor: { x: 0.5, y: 0.5 },
        color: { r: 245, g: 210, b: 167 }
      },
      {
        id: 'mouth',
        name: 'Mouth',
        type: 'mouth',
        zIndex: 15,
        visible: true,
        opacity: 1,
        position: { x: 100, y: 95 },
        size: { width: 25, height: 12 },
        anchor: { x: 0.5, y: 0.5 },
        color: { r: 200, g: 100, b: 100 }
      },
      {
        id: 'hands',
        name: 'Hands',
        type: 'hands',
        zIndex: 8,
        visible: true,
        opacity: 1,
        position: { x: 100, y: 250 },
        size: { width: 30, height: 40 },
        anchor: { x: 0.5, y: 0 },
        color: { r: 255, g: 220, b: 177 }
      }
    ];
  }

  private createFemaleBaseLayers(): BodyLayer[] {
    const layers = this.createMaleBaseLayers();
    
    // Adjust for feminine characteristics
    layers.forEach(layer => {
      switch (layer.type) {
        case 'head':
          layer.size = { width: 75, height: 95 }; // Slightly smaller
          break;
        case 'hair':
          layer.size = { width: 95, height: 80 }; // Longer hair
          layer.color = { r: 139, g: 69, b: 19 }; // Different default color
          break;
        case 'eyebrows':
          layer.size = { width: 40, height: 6 }; // Thinner eyebrows
          break;
        case 'eyes':
          layer.size = { width: 42, height: 18 }; // Larger eyes
          break;
      }
    });

    return layers;
  }

  private initializeBaseExpressions(): void {
    const expressions: FacialExpression[] = [
      {
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
      },
      {
        id: 'happy',
        name: 'Happy',
        eyeState: {
          leftEye: { openness: 0.7, direction: { x: 0, y: 0 } },
          rightEye: { openness: 0.7, direction: { x: 0, y: 0 } },
          blinkSpeed: 0.15
        },
        eyebrowState: {
          leftBrow: { height: 0.2, angle: 0 },
          rightBrow: { height: 0.2, angle: 0 }
        },
        mouthState: {
          shape: 'neutral',
          openness: 0.3,
          width: 1.2,
          corners: 0.8
        }
      },
      {
        id: 'sad',
        name: 'Sad',
        eyeState: {
          leftEye: { openness: 0.6, direction: { x: 0, y: -0.1 } },
          rightEye: { openness: 0.6, direction: { x: 0, y: -0.1 } },
          blinkSpeed: 0.3
        },
        eyebrowState: {
          leftBrow: { height: -0.3, angle: 0.2 },
          rightBrow: { height: -0.3, angle: -0.2 }
        },
        mouthState: {
          shape: 'neutral',
          openness: 0,
          width: 0.9,
          corners: -0.5
        }
      },
      {
        id: 'surprised',
        name: 'Surprised',
        eyeState: {
          leftEye: { openness: 1, direction: { x: 0, y: 0 } },
          rightEye: { openness: 1, direction: { x: 0, y: 0 } },
          blinkSpeed: 0.05
        },
        eyebrowState: {
          leftBrow: { height: 0.8, angle: 0 },
          rightBrow: { height: 0.8, angle: 0 }
        },
        mouthState: {
          shape: 'O',
          openness: 0.6,
          width: 0.8,
          corners: 0
        }
      },
      {
        id: 'angry',
        name: 'Angry',
        eyeState: {
          leftEye: { openness: 0.9, direction: { x: 0, y: 0 } },
          rightEye: { openness: 0.9, direction: { x: 0, y: 0 } },
          blinkSpeed: 0.1
        },
        eyebrowState: {
          leftBrow: { height: -0.5, angle: -0.3 },
          rightBrow: { height: -0.5, angle: 0.3 }
        },
        mouthState: {
          shape: 'neutral',
          openness: 0.2,
          width: 0.8,
          corners: -0.3
        }
      }
    ];

    this._baseExpressions.set(expressions);
  }

  private initializeBaseGestures(): void {
    const gestures: Gesture[] = [
      {
        id: 'wave',
        name: 'Wave',
        type: 'wave',
        duration: 2000,
        loop: false,
        frames: [
          {
            timestamp: 0,
            bodyParts: {
              'hands': { 
                position: { x: 0, y: 0 }, 
                rotation: 0 
              }
            }
          },
          {
            timestamp: 0.3,
            bodyParts: {
              'hands': { 
                position: { x: 20, y: -30 }, 
                rotation: 0.3 
              }
            },
            easing: 'ease-out'
          },
          {
            timestamp: 0.6,
            bodyParts: {
              'hands': { 
                position: { x: 15, y: -25 }, 
                rotation: -0.2 
              }
            }
          },
          {
            timestamp: 0.9,
            bodyParts: {
              'hands': { 
                position: { x: 20, y: -30 }, 
                rotation: 0.3 
              }
            }
          },
          {
            timestamp: 1,
            bodyParts: {
              'hands': { 
                position: { x: 0, y: 0 }, 
                rotation: 0 
              }
            },
            easing: 'ease-in'
          }
        ]
      },
      {
        id: 'nod',
        name: 'Nod',
        type: 'nod',
        duration: 1500,
        loop: false,
        frames: [
          {
            timestamp: 0,
            bodyParts: {
              'head': { rotation: 0 }
            }
          },
          {
            timestamp: 0.4,
            bodyParts: {
              'head': { rotation: 0.1 }
            },
            easing: 'ease-out'
          },
          {
            timestamp: 0.8,
            bodyParts: {
              'head': { rotation: -0.05 }
            },
            easing: 'ease-in-out'
          },
          {
            timestamp: 1,
            bodyParts: {
              'head': { rotation: 0 }
            },
            easing: 'ease-in'
          }
        ]
      },
      {
        id: 'idle-breathing',
        name: 'Idle Breathing',
        type: 'idle',
        duration: 3000,
        loop: true,
        frames: [
          {
            timestamp: 0,
            bodyParts: {
              'body': { scale: { x: 1, y: 1 } }
            }
          },
          {
            timestamp: 0.5,
            bodyParts: {
              'body': { scale: { x: 1.02, y: 1.01 } }
            },
            easing: 'ease-in-out'
          },
          {
            timestamp: 1,
            bodyParts: {
              'body': { scale: { x: 1, y: 1 } }
            },
            easing: 'ease-in-out'
          }
        ]
      },
      {
        id: 'point',
        name: 'Point',
        type: 'point',
        duration: 1000,
        loop: false,
        frames: [
          {
            timestamp: 0,
            bodyParts: {
              'hands': { 
                position: { x: 0, y: 0 }, 
                rotation: 0 
              }
            }
          },
          {
            timestamp: 0.3,
            bodyParts: {
              'hands': { 
                position: { x: 40, y: -10 }, 
                rotation: -0.2 
              }
            },
            easing: 'ease-out'
          },
          {
            timestamp: 0.7,
            bodyParts: {
              'hands': { 
                position: { x: 40, y: -10 }, 
                rotation: -0.2 
              }
            }
          },
          {
            timestamp: 1,
            bodyParts: {
              'hands': { 
                position: { x: 0, y: 0 }, 
                rotation: 0 
              }
            },
            easing: 'ease-in'
          }
        ]
      }
    ];

    this._baseGestures.set(gestures);
  }

  getTemplate(id: string): CharacterTemplate | undefined {
    return this.templates().find(template => template.id === id);
  }

  getExpression(id: string): FacialExpression | undefined {
    return this.baseExpressions().find(expression => expression.id === id);
  }

  getGesture(id: string): Gesture | undefined {
    return this.baseGestures().find(gesture => gesture.id === id);
  }

  createCustomTemplate(base: CharacterTemplate, customizations: Partial<CharacterTemplate>): CharacterTemplate {
    return {
      ...base,
      ...customizations,
      id: customizations.id || `custom-${Date.now()}`,
      baseLayers: customizations.baseLayers || [...base.baseLayers]
    };
  }
}