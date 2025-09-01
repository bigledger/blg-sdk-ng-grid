# Basic 2D Avatar Example

A simple implementation demonstrating the essential features of the 2D Avatar system with minimal setup and configuration.

## Overview

This example shows how to create a basic 2D avatar with default settings, handle basic interactions, and implement essential event handling. Perfect for getting started with the BigLedger Avatar Library.

## Prerequisites

- Angular 17+ application
- BigLedger Avatar packages installed
- Basic understanding of Angular components

## Installation

```bash
npm install @bigledger/ng-ui-avatar-core @bigledger/ng-ui-avatar-2d
```

## Implementation

### Step 1: Component Setup

```typescript
// basic-avatar.component.ts
import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Avatar2d } from '@bigledger/ng-ui-avatar-2d';
import { AvatarConfiguration, FacialExpression, Gesture } from '@bigledger/ng-ui-avatar-core';

@Component({
  selector: 'app-basic-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule, Avatar2d],
  template: `
    <div class="basic-avatar-container">
      <h2>Basic 2D Avatar Example</h2>
      
      <!-- Avatar Display -->
      <div class="avatar-display">
        <ng-ui-avatar-2d
          [configuration]="avatarConfig()"
          [size]="{width: 300, height: 400}"
          [renderMode]="'canvas'"
          [quality]="'medium'"
          [autoPlay]="true"
          [showControls]="false"
          (expressionChanged)="onExpressionChanged($event)"
          (gestureStarted)="onGestureStarted($event)"
          (gestureCompleted)="onGestureCompleted($event)">
        </ng-ui-avatar-2d>
      </div>

      <!-- Basic Controls -->
      <div class="basic-controls">
        <div class="control-group">
          <h3>Expressions</h3>
          <div class="button-group">
            <button (click)="changeExpression('neutral')">Neutral</button>
            <button (click)="changeExpression('happy')">Happy</button>
            <button (click)="changeExpression('sad')">Sad</button>
            <button (click)="changeExpression('surprised')">Surprised</button>
          </div>
        </div>

        <div class="control-group">
          <h3>Gestures</h3>
          <div class="button-group">
            <button (click)="playGesture('wave')">Wave</button>
            <button (click)="playGesture('nod')">Nod</button>
            <button (click)="playGesture('thumbs-up')">Thumbs Up</button>
            <button (click)="playGesture('think')">Think</button>
          </div>
        </div>

        <div class="control-group">
          <h3>Avatar Settings</h3>
          <div class="setting-controls">
            <label>
              Name:
              <input 
                type="text" 
                [(ngModel)]="avatarName"
                (ngModelChange)="updateAvatarName()">
            </label>
            
            <label>
              Skin Tone:
              <select 
                [(ngModel)]="selectedSkinTone"
                (ngModelChange)="updateSkinTone()">
                <option value="light">Light</option>
                <option value="medium-light">Medium Light</option>
                <option value="medium">Medium</option>
                <option value="medium-dark">Medium Dark</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            
            <label>
              Hair Color:
              <input 
                type="color" 
                [(ngModel)]="selectedHairColor"
                (ngModelChange)="updateHairColor()">
            </label>
          </div>
        </div>
      </div>

      <!-- Status Display -->
      <div class="status-display">
        <h3>Avatar Status</h3>
        <div class="status-info">
          <p><strong>Current Expression:</strong> {{ currentExpression || 'None' }}</p>
          <p><strong>Last Gesture:</strong> {{ lastGesture || 'None' }}</p>
          <p><strong>Animation State:</strong> {{ isAnimating ? 'Animating' : 'Idle' }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .basic-avatar-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }

    .avatar-display {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      border: 2px solid #e9ecef;
    }

    .basic-controls {
      display: flex;
      flex-direction: column;
      gap: 25px;
      margin-bottom: 30px;
    }

    .control-group {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }

    .control-group h3 {
      margin: 0 0 15px 0;
      color: #495057;
      border-bottom: 2px solid #007bff;
      padding-bottom: 5px;
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    button {
      padding: 10px 15px;
      border: 1px solid #007bff;
      background: white;
      color: #007bff;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
    }

    button:hover {
      background: #007bff;
      color: white;
    }

    button:active {
      transform: translateY(1px);
    }

    .setting-controls {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .setting-controls label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: bold;
    }

    .setting-controls input,
    .setting-controls select {
      padding: 5px 10px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 14px;
    }

    .setting-controls input[type="color"] {
      width: 50px;
      height: 30px;
      padding: 0;
      border: none;
      cursor: pointer;
    }

    .status-display {
      background: #e9ecef;
      padding: 20px;
      border-radius: 8px;
    }

    .status-display h3 {
      margin: 0 0 15px 0;
      color: #495057;
    }

    .status-info p {
      margin: 8px 0;
      font-size: 14px;
    }

    .status-info strong {
      color: #007bff;
    }
  `]
})
export class BasicAvatarComponent {
  // Avatar configuration
  avatarConfig = signal<AvatarConfiguration>({
    character: {
      name: 'Aria',
      model: 'young-woman',
      skinTone: 'medium',
      hair: {
        style: 'shoulder-length',
        color: '#8B4513'
      },
      clothing: {
        top: 'casual-shirt',
        accessories: []
      }
    },
    layers: [],
    customizations: {},
    animations: {
      blinkFrequency: 3000,
      idleAnimations: true
    }
  });

  // Control variables
  avatarName = 'Aria';
  selectedSkinTone = 'medium';
  selectedHairColor = '#8B4513';

  // Status tracking
  currentExpression = '';
  lastGesture = '';
  isAnimating = false;

  @ViewChild(Avatar2d) avatar!: Avatar2d;

  // Expression Control
  changeExpression(expressionName: string) {
    const expression: FacialExpression = {
      id: expressionName,
      name: expressionName,
      eyeState: this.getEyeStateFor(expressionName),
      eyebrowState: this.getEyebrowStateFor(expressionName),
      mouthState: this.getMouthStateFor(expressionName),
      duration: 1000
    };

    if (this.avatar) {
      this.avatar.changeExpression(expression);
      this.currentExpression = expressionName;
    }
  }

  // Gesture Control
  playGesture(gestureName: string) {
    const gesture: Gesture = {
      id: gestureName,
      name: gestureName,
      type: gestureName as any,
      frames: this.getGestureFrames(gestureName),
      duration: 2000,
      loop: false
    };

    if (this.avatar) {
      this.avatar.playGesture(gesture);
      this.lastGesture = gestureName;
    }
  }

  // Configuration Updates
  updateAvatarName() {
    this.avatarConfig.update(config => ({
      ...config,
      character: {
        ...config.character,
        name: this.avatarName
      }
    }));
  }

  updateSkinTone() {
    this.avatarConfig.update(config => ({
      ...config,
      character: {
        ...config.character,
        skinTone: this.selectedSkinTone
      }
    }));
  }

  updateHairColor() {
    this.avatarConfig.update(config => ({
      ...config,
      character: {
        ...config.character,
        hair: {
          ...config.character.hair,
          color: this.selectedHairColor
        }
      }
    }));
  }

  // Event Handlers
  onExpressionChanged(expression: FacialExpression) {
    console.log('Expression changed to:', expression.name);
    this.currentExpression = expression.name;
  }

  onGestureStarted(gesture: Gesture) {
    console.log('Gesture started:', gesture.name);
    this.isAnimating = true;
  }

  onGestureCompleted(gesture: Gesture) {
    console.log('Gesture completed:', gesture.name);
    this.isAnimating = false;
  }

  // Helper Methods for Expression States
  private getEyeStateFor(expression: string): any {
    const eyeStates = {
      neutral: {
        leftEye: { openness: 1.0, direction: { x: 0, y: 0 } },
        rightEye: { openness: 1.0, direction: { x: 0, y: 0 } },
        blinkSpeed: 1.0
      },
      happy: {
        leftEye: { openness: 0.8, direction: { x: 0, y: 0 } },
        rightEye: { openness: 0.8, direction: { x: 0, y: 0 } },
        blinkSpeed: 1.2
      },
      sad: {
        leftEye: { openness: 0.6, direction: { x: 0, y: -0.1 } },
        rightEye: { openness: 0.6, direction: { x: 0, y: -0.1 } },
        blinkSpeed: 0.8
      },
      surprised: {
        leftEye: { openness: 1.4, direction: { x: 0, y: 0.1 } },
        rightEye: { openness: 1.4, direction: { x: 0, y: 0.1 } },
        blinkSpeed: 0.5
      }
    };

    return eyeStates[expression as keyof typeof eyeStates] || eyeStates.neutral;
  }

  private getEyebrowStateFor(expression: string): any {
    const eyebrowStates = {
      neutral: {
        leftBrow: { height: 0.0, angle: 0.0 },
        rightBrow: { height: 0.0, angle: 0.0 }
      },
      happy: {
        leftBrow: { height: 0.1, angle: 0.1 },
        rightBrow: { height: 0.1, angle: -0.1 }
      },
      sad: {
        leftBrow: { height: -0.1, angle: 0.2 },
        rightBrow: { height: -0.1, angle: -0.2 }
      },
      surprised: {
        leftBrow: { height: 0.3, angle: 0.0 },
        rightBrow: { height: 0.3, angle: 0.0 }
      }
    };

    return eyebrowStates[expression as keyof typeof eyebrowStates] || eyebrowStates.neutral;
  }

  private getMouthStateFor(expression: string): any {
    const mouthStates = {
      neutral: {
        shape: 'neutral' as any,
        openness: 0.0,
        width: 1.0,
        corners: 0.0
      },
      happy: {
        shape: 'neutral' as any,
        openness: 0.2,
        width: 1.1,
        corners: 0.8
      },
      sad: {
        shape: 'neutral' as any,
        openness: 0.1,
        width: 0.9,
        corners: -0.6
      },
      surprised: {
        shape: 'O' as any,
        openness: 0.8,
        width: 0.8,
        corners: 0.0
      }
    };

    return mouthStates[expression as keyof typeof mouthStates] || mouthStates.neutral;
  }

  private getGestureFrames(gestureName: string): any[] {
    // Simple gesture frame definitions
    const gestureFrames = {
      wave: [
        { 
          timestamp: 0, 
          bodyParts: { 
            'right-arm': { rotation: 0, position: { x: 0, y: 0 } } 
          } 
        },
        { 
          timestamp: 500, 
          bodyParts: { 
            'right-arm': { rotation: 45, position: { x: 10, y: -10 } } 
          } 
        },
        { 
          timestamp: 1000, 
          bodyParts: { 
            'right-arm': { rotation: 30, position: { x: 15, y: -5 } } 
          } 
        },
        { 
          timestamp: 1500, 
          bodyParts: { 
            'right-arm': { rotation: 45, position: { x: 10, y: -10 } } 
          } 
        },
        { 
          timestamp: 2000, 
          bodyParts: { 
            'right-arm': { rotation: 0, position: { x: 0, y: 0 } } 
          } 
        }
      ],
      nod: [
        { 
          timestamp: 0, 
          bodyParts: { 
            'head': { rotation: 0 } 
          } 
        },
        { 
          timestamp: 300, 
          bodyParts: { 
            'head': { rotation: -10 } 
          } 
        },
        { 
          timestamp: 600, 
          bodyParts: { 
            'head': { rotation: 5 } 
          } 
        },
        { 
          timestamp: 900, 
          bodyParts: { 
            'head': { rotation: -5 } 
          } 
        },
        { 
          timestamp: 1200, 
          bodyParts: { 
            'head': { rotation: 0 } 
          } 
        }
      ],
      'thumbs-up': [
        { 
          timestamp: 0, 
          bodyParts: { 
            'right-hand': { position: { x: 0, y: 0 }, gesture: 'fist' } 
          } 
        },
        { 
          timestamp: 500, 
          bodyParts: { 
            'right-hand': { position: { x: 5, y: -15 }, gesture: 'thumbs-up' } 
          } 
        },
        { 
          timestamp: 1500, 
          bodyParts: { 
            'right-hand': { position: { x: 5, y: -15 }, gesture: 'thumbs-up' } 
          } 
        },
        { 
          timestamp: 2000, 
          bodyParts: { 
            'right-hand': { position: { x: 0, y: 0 }, gesture: 'neutral' } 
          } 
        }
      ],
      think: [
        { 
          timestamp: 0, 
          bodyParts: { 
            'right-hand': { position: { x: 0, y: 0 } },
            'head': { rotation: 0 }
          } 
        },
        { 
          timestamp: 500, 
          bodyParts: { 
            'right-hand': { position: { x: 10, y: 15 } },
            'head': { rotation: 5 }
          } 
        },
        { 
          timestamp: 2000, 
          bodyParts: { 
            'right-hand': { position: { x: 10, y: 15 } },
            'head': { rotation: 5 }
          } 
        }
      ]
    };

    return gestureFrames[gestureName as keyof typeof gestureFrames] || [];
  }
}
```

### Step 2: Module Integration

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { BasicAvatarComponent } from './basic-avatar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BasicAvatarComponent],
  template: `
    <div class="app-container">
      <header>
        <h1>BigLedger Avatar Demo</h1>
        <p>Basic 2D Avatar Implementation</p>
      </header>
      
      <main>
        <app-basic-avatar></app-basic-avatar>
      </main>
      
      <footer>
        <p>Powered by BigLedger Avatar Library</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    header {
      text-align: center;
      padding: 30px 20px;
      color: white;
    }

    header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5rem;
      font-weight: 300;
    }

    header p {
      margin: 0;
      font-size: 1.2rem;
      opacity: 0.9;
    }

    main {
      padding: 0 20px 40px 20px;
    }

    footer {
      text-align: center;
      padding: 20px;
      color: white;
      opacity: 0.8;
    }
  `]
})
export class AppComponent {
  title = 'basic-avatar-demo';
}
```

### Step 3: Environment Configuration

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  avatar: {
    defaultSettings: {
      quality: 'medium',
      antialiasing: true,
      backgroundTransparent: true
    },
    performance: {
      maxFPS: 60,
      enableMonitoring: false
    }
  }
};
```

## Usage Instructions

### Basic Setup

1. **Install the packages** using npm or yarn
2. **Import the component** in your application
3. **Add the avatar component** to your template
4. **Configure basic settings** through the interface

### Customizing the Avatar

```typescript
// Example of updating avatar configuration
updateAvatarAppearance() {
  this.avatarConfig.update(config => ({
    ...config,
    character: {
      ...config.character,
      model: 'young-man',  // Change to male model
      skinTone: 'dark',    // Change skin tone
      hair: {
        style: 'short-professional',
        color: '#2C1810'   // Dark brown hair
      },
      clothing: {
        top: 'business-suit',
        accessories: ['tie', 'watch']
      }
    }
  }));
}
```

### Adding Custom Expressions

```typescript
// Define custom expression
addCustomExpression() {
  const customExpression: FacialExpression = {
    id: 'confused',
    name: 'Confused',
    eyeState: {
      leftEye: { openness: 0.9, direction: { x: -0.1, y: 0 } },
      rightEye: { openness: 0.9, direction: { x: 0.1, y: 0 } },
      blinkSpeed: 1.0
    },
    eyebrowState: {
      leftBrow: { height: 0.2, angle: 0.3 },
      rightBrow: { height: -0.1, angle: -0.2 }
    },
    mouthState: {
      shape: 'neutral',
      openness: 0.1,
      width: 0.9,
      corners: -0.2
    },
    duration: 1500
  };

  this.avatar.changeExpression(customExpression);
}
```

## Event Handling

### Expression Events

```typescript
onExpressionChanged(expression: FacialExpression) {
  console.log(`Avatar expression changed to: ${expression.name}`);
  
  // Update UI or trigger other actions
  this.showNotification(`Avatar is now ${expression.name}`);
  
  // Track analytics
  this.analytics.track('avatar_expression_changed', {
    expression: expression.name,
    duration: expression.duration
  });
}
```

### Gesture Events

```typescript
onGestureStarted(gesture: Gesture) {
  console.log(`Gesture started: ${gesture.name}`);
  this.isAnimating = true;
  
  // Disable controls during animation
  this.controlsDisabled = true;
}

onGestureCompleted(gesture: Gesture) {
  console.log(`Gesture completed: ${gesture.name}`);
  this.isAnimating = false;
  
  // Re-enable controls
  this.controlsDisabled = false;
  
  // Chain gestures if needed
  if (this.gestureQueue.length > 0) {
    const nextGesture = this.gestureQueue.shift();
    this.playGesture(nextGesture.name);
  }
}
```

## Error Handling

```typescript
// Add error handling to your component
@Component({
  template: `
    <ng-ui-avatar-2d
      [configuration]="avatarConfig()"
      (renderingError)="onRenderingError($event)">
    </ng-ui-avatar-2d>
    
    <div class="error-message" *ngIf="errorMessage">
      <p>{{ errorMessage }}</p>
      <button (click)="retryInitialization()">Retry</button>
    </div>
  `
})
export class BasicAvatarComponent {
  errorMessage = '';

  onRenderingError(error: Error) {
    console.error('Avatar rendering error:', error);
    this.errorMessage = 'Failed to render avatar. Please try again.';
    
    // Attempt fallback
    this.fallbackToLowerQuality();
  }

  retryInitialization() {
    this.errorMessage = '';
    // Reinitialize avatar
    this.avatarConfig.set({ ...this.avatarConfig() });
  }

  fallbackToLowerQuality() {
    this.avatarConfig.update(config => ({
      ...config,
      performance: {
        ...config.performance,
        quality: 'low'
      }
    }));
  }
}
```

## Performance Tips

### Optimize for Mobile

```typescript
// Detect mobile devices and adjust settings
ngOnInit() {
  if (this.isMobileDevice()) {
    this.avatarConfig.update(config => ({
      ...config,
      performance: {
        quality: 'medium',
        maxFPS: 30,
        antialiasing: false
      }
    }));
  }
}

private isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    .test(navigator.userAgent);
}
```

### Lazy Loading

```typescript
// Lazy load avatar component
const Avatar2d = await import('@bigledger/ng-ui-avatar-2d');
```

## Next Steps

After mastering this basic implementation:

1. Explore the [3D Avatar Example](./basic-3d-avatar.md)
2. Learn about [TTS Integration](./customer-service-bot.md)
3. Review [Advanced Customization](./virtual-presenter.md)
4. Check [Performance Optimization](../MIGRATION.md#performance-optimization)

## Common Issues

### Avatar Not Rendering
- Check that all required packages are installed
- Verify Angular version compatibility
- Ensure canvas element has proper dimensions

### Poor Performance
- Reduce quality settings on lower-end devices
- Limit concurrent animations
- Monitor memory usage

### Gesture Not Playing
- Verify gesture data structure
- Check animation duration settings
- Ensure no conflicting animations

This basic example provides a solid foundation for integrating 2D avatars into your Angular applications. The component demonstrates essential patterns for configuration, interaction, and event handling that can be extended for more complex use cases.