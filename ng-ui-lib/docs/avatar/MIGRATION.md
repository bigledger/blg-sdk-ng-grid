# BigLedger Avatar Migration Guide

This guide helps you migrate from other avatar systems to the BigLedger Avatar Library, providing step-by-step instructions, code comparisons, and best practices for a smooth transition.

## Table of Contents

- [Migration Overview](#migration-overview)
- [Migrating from SitePal](#migrating-from-sitepal)
- [Migrating from Other Avatar Systems](#migrating-from-other-avatar-systems)
- [Performance Optimization](#performance-optimization)
- [Common Migration Issues](#common-migration-issues)
- [Testing Your Migration](#testing-your-migration)
- [Troubleshooting](#troubleshooting)

## Migration Overview

### Why Migrate to BigLedger Avatar?

- **Modern Angular Integration**: Built specifically for Angular 17+ with Signals
- **Better Performance**: Optimized rendering and resource management
- **Enhanced Features**: Advanced TTS, gestures, and customization
- **Active Development**: Regular updates and community support
- **Cost Effective**: Open source with commercial-friendly licensing

### Migration Strategy

1. **Assessment Phase**: Evaluate current implementation and requirements
2. **Planning Phase**: Create migration timeline and identify dependencies
3. **Implementation Phase**: Gradual migration with parallel systems
4. **Testing Phase**: Comprehensive testing of all features
5. **Deployment Phase**: Rollout with monitoring and rollback plans

### Pre-Migration Checklist

- [ ] Audit current avatar usage across your application
- [ ] Document existing configurations and customizations
- [ ] Identify TTS providers and voice settings
- [ ] List required gestures and animations
- [ ] Document integration points with other systems
- [ ] Plan testing strategy for all affected components

## Migrating from SitePal

SitePal is one of the most common avatar platforms. Here's how to migrate your SitePal implementation to BigLedger Avatar.

### Core Component Migration

#### Before (SitePal)
```html
<!-- SitePal Legacy Implementation -->
<div id="sitepal-container">
  <script>
    var sitepal = {
      "avatar": "12345_avatar",
      "scene": "office_scene",
      "engine": "flash",
      "width": 300,
      "height": 400,
      "autostart": false,
      "voice": {
        "language": "en-US",
        "voice": "female_1",
        "speed": 150,
        "pitch": 100
      }
    };
    
    // Initialize SitePal
    window.onload = function() {
      SP.init(sitepal);
    };
    
    // Speak function
    function speakText(text) {
      SP.sayText(text);
    }
  </script>
</div>
```

#### After (BigLedger Avatar)
```typescript
import { Component, signal, OnInit } from '@angular/core';
import { Avatar2DComponent } from '@ng-ui-lib/avatar-2d';
import { AvatarTTSComponent } from '@ng-ui-lib/avatar-tts';
import { AvatarConfig } from '@ng-ui-lib/avatar-core';

@Component({
  selector: 'app-migrated-avatar',
  standalone: true,
  imports: [Avatar2DComponent, AvatarTTSComponent],
  template: `
    <avatar-2d 
      [config]="avatarConfig()"
      [state]="avatarState()"
      (speechEnd)="onSpeechEnd()"
      #avatar>
    </avatar-2d>
  `
})
export class MigratedAvatarComponent implements OnInit {
  private _isActive = signal(false);
  
  readonly avatarConfig = signal<AvatarConfig>({
    // Equivalent SitePal configuration
    avatar: {
      type: '2d',
      style: 'realistic', // Maps to SitePal avatar style
      character: 'professional-female', // Maps to SitePal avatar ID
      size: { width: 300, height: 400 }
    },
    
    behavior: {
      personality: 'professional',
      gestures: {
        enabled: true,
        frequency: 0.6
      },
      expressions: {
        enabled: true,
        subtlety: 0.7
      }
    },
    
    voice: {
      provider: 'elevenlabs', // Modern TTS instead of SitePal voices
      voiceId: 'professional-female',
      settings: {
        speed: 1.5, // SitePal speed 150 -> 1.5x
        pitch: 0.0, // SitePal pitch 100 -> 0.0 (neutral)
        volume: 0.8
      }
    },
    
    rendering: {
      quality: 'high',
      background: 'office-scene' // Maps to SitePal scene
    }
  });
  
  readonly avatarState = signal({
    isActive: this._isActive(),
    currentEmotion: 'neutral'
  });
  
  // Modern equivalent of SP.sayText()
  speakText(text: string) {
    this.avatar.speak(text, {
      emotion: 'professional',
      gesture: true
    });
  }
  
  onSpeechEnd() {
    // Handle speech completion
    console.log('Speech completed');
  }
}
```

### Voice Configuration Migration

#### SitePal Voice Mapping
```typescript
// Create a mapping service for SitePal voices
@Injectable({
  providedIn: 'root'
})
export class VoiceMigrationService {
  private sitePalVoiceMap = new Map([
    // SitePal Voice ID -> BigLedger Voice Config
    ['female_1', { provider: 'elevenlabs', voiceId: 'professional-female' }],
    ['male_1', { provider: 'elevenlabs', voiceId: 'professional-male' }],
    ['child_1', { provider: 'azure', voiceId: 'child-friendly' }],
    ['robot_1', { provider: 'google', voiceId: 'synthetic-robotic' }]
  ]);
  
  migrateVoiceConfig(sitePalVoice: string): VoiceConfig {
    const mapping = this.sitePalVoiceMap.get(sitePalVoice);
    
    if (!mapping) {
      console.warn(`No mapping found for SitePal voice: ${sitePalVoice}`);
      return { provider: 'elevenlabs', voiceId: 'default' };
    }
    
    return {
      provider: mapping.provider,
      voiceId: mapping.voiceId,
      settings: {
        speed: 1.0,
        pitch: 0.0,
        volume: 0.8
      }
    };
  }
}
```

### Animation and Scene Migration

#### Before (SitePal Scenes)
```javascript
// SitePal scene configuration
var scenes = {
  "office": {
    "background": "office_bg.jpg",
    "lighting": "office_lighting",
    "props": ["desk", "computer", "bookshelf"]
  },
  "classroom": {
    "background": "classroom_bg.jpg", 
    "lighting": "classroom_lighting",
    "props": ["whiteboard", "desks", "projector"]
  }
};
```

#### After (BigLedger Avatar Scenes)
```typescript
export class SceneMigrationService {
  private sceneConfigs = {
    office: {
      rendering: {
        background: {
          type: 'image',
          url: 'assets/scenes/office_bg.jpg'
        },
        lighting: {
          type: 'office',
          intensity: 1.2,
          ambientColor: '#404040'
        },
        props: [
          { type: 'desk', position: { x: 0, y: 0, z: -2 } },
          { type: 'computer', position: { x: 0.5, y: 1, z: -1.5 } },
          { type: 'bookshelf', position: { x: -2, y: 0, z: -3 } }
        ]
      }
    },
    
    classroom: {
      rendering: {
        background: {
          type: 'image',
          url: 'assets/scenes/classroom_bg.jpg'
        },
        lighting: {
          type: 'classroom',
          intensity: 1.4,
          ambientColor: '#f0f0f0'
        },
        props: [
          { type: 'whiteboard', position: { x: 0, y: 1.5, z: -4 } },
          { type: 'desk', position: { x: 0, y: 0, z: -1 } }
        ]
      }
    }
  };
  
  getSceneConfig(sceneName: string): RenderingConfig {
    return this.sceneConfigs[sceneName as keyof typeof this.sceneConfigs] || this.sceneConfigs.office;
  }
}
```

### API Method Migration

#### SitePal API -> BigLedger Avatar API
```typescript
export class APITranslationLayer {
  constructor(private avatar: Avatar2DComponent) {}
  
  // SitePal: SP.sayText(text)
  sayText(text: string) {
    this.avatar.speak(text);
  }
  
  // SitePal: SP.setEmotion(emotion)
  setEmotion(emotion: string) {
    const emotionMap = {
      'happy': 'happiness',
      'sad': 'sadness',
      'angry': 'anger',
      'surprised': 'surprise'
    };
    
    this.avatar.playExpression(emotionMap[emotion as keyof typeof emotionMap] || 'neutral', 0.8);
  }
  
  // SitePal: SP.playAnimation(animationId)
  playAnimation(animationId: string) {
    const gestureMap = {
      'wave': 'wave',
      'point': 'pointForward',
      'nod': 'nod',
      'shake_head': 'shake'
    };
    
    this.avatar.playGesture(gestureMap[animationId as keyof typeof gestureMap] || 'wave');
  }
  
  // SitePal: SP.setScene(sceneId)
  setScene(sceneId: string) {
    // Update avatar configuration with new scene
    this.avatar.updateConfig({
      rendering: this.sceneService.getSceneConfig(sceneId)
    });
  }
  
  // SitePal: SP.addEventListener(event, callback)
  addEventListener(event: string, callback: Function) {
    const eventMap = {
      'speechstart': 'speechStart',
      'speechend': 'speechEnd',
      'animationstart': 'gestureStart',
      'animationend': 'gestureComplete'
    };
    
    const mappedEvent = eventMap[event as keyof typeof eventMap];
    if (mappedEvent) {
      this.avatar[mappedEvent].subscribe(callback);
    }
  }
}
```

## Migrating from Other Avatar Systems

### Generic Avatar System Migration

For other avatar systems (CrazyTalk, D-ID, Synthesia, etc.), follow this general pattern:

#### 1. Configuration Assessment
```typescript
// Assess current avatar configuration
interface LegacyAvatarConfig {
  characterId?: string;
  voiceSettings?: any;
  animationSettings?: any;
  renderingOptions?: any;
  integrationPoints?: string[];
}

export class GenericMigrationAssessment {
  assessCurrentConfig(legacyConfig: LegacyAvatarConfig): MigrationPlan {
    return {
      characterMapping: this.mapCharacter(legacyConfig.characterId),
      voiceMapping: this.mapVoiceSettings(legacyConfig.voiceSettings),
      animationMapping: this.mapAnimations(legacyConfig.animationSettings),
      renderingMapping: this.mapRendering(legacyConfig.renderingOptions),
      integrationChanges: this.assessIntegrations(legacyConfig.integrationPoints)
    };
  }
  
  private mapCharacter(characterId?: string): CharacterConfig {
    // Generic character mapping logic
    return {
      type: '2d',
      style: 'realistic',
      character: characterId ? `migrated-${characterId}` : 'default'
    };
  }
}
```

#### 2. Progressive Migration Strategy
```typescript
// Create a progressive migration wrapper
@Component({
  selector: 'app-migration-wrapper',
  template: `
    <!-- Legacy system (gradually phased out) -->
    @if (useLegacySystem()) {
      <div id="legacy-avatar" [style.display]="showLegacy() ? 'block' : 'none'">
        <!-- Legacy avatar implementation -->
      </div>
    }
    
    <!-- New BigLedger Avatar system -->
    @if (useNewSystem()) {
      <avatar-2d 
        [config]="newAvatarConfig()"
        [style.display]="showNew() ? 'block' : 'none'"
        (ready)="onNewAvatarReady()"
        #newAvatar>
      </avatar-2d>
    }
    
    <!-- Migration controls (for testing) -->
    @if (migrationMode()) {
      <div class="migration-controls">
        <button (click)="toggleSystem()">Toggle System</button>
        <button (click)="compareOutputs()">Compare</button>
      </div>
    }
  `
})
export class MigrationWrapperComponent {
  private _useLegacySystem = signal(true);
  private _useNewSystem = signal(false);
  private _migrationMode = signal(true);
  
  readonly useLegacySystem = this._useLegacySystem.asReadonly();
  readonly useNewSystem = this._useNewSystem.asReadonly();
  readonly migrationMode = this._migrationMode.asReadonly();
  
  readonly showLegacy = computed(() => this._useLegacySystem() && this._migrationMode());
  readonly showNew = computed(() => this._useNewSystem() || !this._migrationMode());
  
  // Gradual migration phases
  startMigrationPhase1() {
    // Enable new system alongside legacy
    this._useNewSystem.set(true);
  }
  
  startMigrationPhase2() {
    // Switch primary to new system, keep legacy as fallback
    this._useLegacySystem.set(false);
    this._useNewSystem.set(true);
  }
  
  completeMigration() {
    // Remove legacy system completely
    this._useLegacySystem.set(false);
    this._useNewSystem.set(true);
    this._migrationMode.set(false);
  }
}
```

### Web-Based Avatar System Migration

#### From iframe/embed solutions:
```typescript
// Before: iframe-based avatar
// <iframe src="https://avatar-service.com/embed/12345"></iframe>

// After: Native Angular component
@Component({
  selector: 'app-native-avatar',
  template: `
    <avatar-2d 
      [config]="avatarConfig()"
      [state]="avatarState()"
      (ready)="onAvatarReady()"
      #avatar>
    </avatar-2d>
  `
})
export class NativeAvatarComponent {
  // Full control over avatar instead of iframe limitations
  readonly avatarConfig = signal<AvatarConfig>({
    avatar: {
      type: '2d',
      character: 'professional-assistant'
    },
    // Full configuration options available
    behavior: {
      personality: 'helpful',
      gestures: { enabled: true }
    },
    voice: {
      provider: 'elevenlabs',
      voiceId: 'assistant-voice'
    }
  });
  
  // Direct API access instead of postMessage communication
  speakText(text: string) {
    this.avatar().speak(text);
  }
}
```

### Flash-Based Avatar Migration

#### Legacy Flash Avatar -> Modern WebGL/Canvas
```typescript
// Migration from Flash-based avatars
export class FlashMigrationService {
  migrateFlashAvatar(flashConfig: any): AvatarConfig {
    return {
      avatar: {
        type: '2d', // Flash was 2D
        style: 'cartoon', // Most Flash avatars were cartoon style
        renderingEngine: 'canvas' // Modern canvas instead of Flash
      },
      
      behavior: {
        // Flash avatars had limited gesture sets
        gestures: {
          enabled: true,
          frequency: 0.5,
          legacy: true // Enable legacy gesture compatibility
        }
      },
      
      voice: {
        // Flash used basic TTS, upgrade to modern providers
        provider: 'azure',
        settings: {
          speed: flashConfig.speechRate || 1.0,
          pitch: (flashConfig.pitch - 100) / 100 || 0.0 // Convert Flash pitch scale
        }
      },
      
      rendering: {
        // Modern rendering features not available in Flash
        quality: 'medium', // Conservative for compatibility
        antialias: true,
        shadows: false // Flash didn't support shadows
      }
    };
  }
}
```

## Performance Optimization

### Memory Management Migration

#### Before (Potential memory leaks)
```javascript
// Legacy avatar with potential memory issues
var avatarInstance = null;

function initAvatar() {
  avatarInstance = new LegacyAvatar();
  // No cleanup logic
}

function changeAvatar() {
  // Potential memory leak - old instance not cleaned up
  avatarInstance = new LegacyAvatar();
}
```

#### After (Proper resource management)
```typescript
@Component({
  selector: 'app-optimized-avatar'
})
export class OptimizedAvatarComponent implements OnDestroy {
  private avatar = viewChild<Avatar2DComponent>('avatar');
  private subscriptions = new Set<Subscription>();
  
  ngOnInit() {
    // Proper subscription management
    const speechSub = this.avatar()?.speechEnd.subscribe(() => {
      // Handle speech end
    });
    
    if (speechSub) {
      this.subscriptions.add(speechSub);
    }
  }
  
  ngOnDestroy() {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Clean up avatar resources
    this.avatar()?.cleanup();
  }
  
  // Efficient avatar switching
  switchAvatar(newConfig: AvatarConfig) {
    // Cleanup old configuration
    this.avatar()?.cleanup();
    
    // Apply new configuration
    this.avatar()?.updateConfig(newConfig);
  }
}
```

### Loading Performance Migration

#### Lazy Loading Strategy
```typescript
// Implement lazy loading for better performance
@Component({
  selector: 'app-lazy-avatar',
  template: `
    @if (shouldLoadAvatar()) {
      <avatar-2d 
        [config]="avatarConfig()"
        (ready)="onAvatarReady()"
        #avatar>
      </avatar-2d>
    } @else {
      <div class="avatar-placeholder">
        <div class="loading-spinner"></div>
        <p>Loading avatar...</p>
      </div>
    }
  `
})
export class LazyAvatarComponent {
  private _shouldLoadAvatar = signal(false);
  private _isInView = signal(false);
  
  readonly shouldLoadAvatar = this._shouldLoadAvatar.asReadonly();
  
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    // Load avatar only when it comes into view
    const element = this.elementRef.nativeElement;
    const rect = element.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isInView && !this._isInView()) {
      this._isInView.set(true);
      this._shouldLoadAvatar.set(true);
    }
  }
  
  onAvatarReady() {
    // Avatar is ready, start interactions
    console.log('Avatar loaded and ready');
  }
}
```

### Bundle Size Optimization

```typescript
// Tree-shakable imports for smaller bundles
// Before: Import entire avatar library
// import * from '@ng-ui-lib/avatar';

// After: Import only needed components
import { Avatar2DComponent } from '@ng-ui-lib/avatar-2d';
import { AvatarTTSComponent } from '@ng-ui-lib/avatar-tts';
// Gesture system only if needed
// import { GestureRecognitionService } from '@ng-ui-lib/avatar-gestures';

// Conditional feature loading
@Component({
  selector: 'app-optimized-features'
})
export class OptimizedFeaturesComponent {
  private _advancedFeaturesEnabled = signal(false);
  
  // Load advanced features only when needed
  async enableAdvancedFeatures() {
    if (!this._advancedFeaturesEnabled()) {
      // Dynamically import heavy features
      const { FacialAnimationService } = await import('@ng-ui-lib/avatar-facial');
      const { GestureRecognitionService } = await import('@ng-ui-lib/avatar-gestures');
      
      this._advancedFeaturesEnabled.set(true);
    }
  }
}
```

## Common Migration Issues

### Issue 1: Voice Provider Compatibility

**Problem**: Legacy system uses discontinued voice provider
**Solution**:
```typescript
// Create voice fallback system
@Injectable()
export class VoiceFallbackService {
  private fallbackChain = [
    { provider: 'elevenlabs', voiceId: 'primary' },
    { provider: 'azure', voiceId: 'backup' },
    { provider: 'google', voiceId: 'fallback' }
  ];
  
  async getWorkingVoiceConfig(): Promise<VoiceConfig> {
    for (const config of this.fallbackChain) {
      try {
        await this.testVoiceProvider(config);
        return config;
      } catch (error) {
        console.warn(`Voice provider ${config.provider} unavailable:`, error);
      }
    }
    
    throw new Error('No voice providers available');
  }
  
  private async testVoiceProvider(config: VoiceConfig): Promise<void> {
    // Test voice provider availability
    return new Promise((resolve, reject) => {
      // Implementation would test actual provider
      setTimeout(() => resolve(), 100);
    });
  }
}
```

### Issue 2: Animation Compatibility

**Problem**: Legacy animations don't map to new system
**Solution**:
```typescript
// Create animation compatibility layer
export class AnimationCompatibilityService {
  private legacyAnimationMap = new Map([
    ['old_wave', 'wave'],
    ['old_point', 'pointForward'],
    ['old_nod', 'nod'],
    ['custom_gesture_1', 'thumbsUp']
  ]);
  
  mapLegacyAnimation(legacyId: string): string {
    const mapped = this.legacyAnimationMap.get(legacyId);
    
    if (!mapped) {
      console.warn(`No mapping for legacy animation: ${legacyId}`);
      return 'wave'; // Default fallback
    }
    
    return mapped;
  }
  
  // Create custom animation for unmappable legacy animations
  async createCustomAnimation(legacyId: string, animationData: any): Promise<void> {
    // Implementation would create custom gesture from legacy data
    console.log(`Creating custom animation for: ${legacyId}`, animationData);
  }
}
```

### Issue 3: Configuration Format Changes

**Problem**: Legacy configuration format incompatible
**Solution**:
```typescript
// Configuration migration utility
export class ConfigMigrationService {
  migrateConfig(legacyConfig: any): AvatarConfig {
    return {
      avatar: {
        type: this.migrateAvatarType(legacyConfig.type),
        style: this.migrateStyle(legacyConfig.style),
        character: this.migrateCharacter(legacyConfig.character)
      },
      
      behavior: {
        personality: this.migratePersonality(legacyConfig.personality),
        gestures: {
          enabled: legacyConfig.animations?.enabled ?? true,
          frequency: this.migrateAnimationFrequency(legacyConfig.animations?.frequency)
        }
      },
      
      voice: this.migrateVoiceConfig(legacyConfig.voice),
      rendering: this.migrateRenderingConfig(legacyConfig.rendering)
    };
  }
  
  private migrateAvatarType(legacyType: string): '2d' | '3d' {
    const typeMap = {
      'flat': '2d',
      '2D': '2d',
      'dimensional': '3d',
      '3D': '3d'
    };
    
    return typeMap[legacyType as keyof typeof typeMap] || '2d';
  }
  
  private migrateStyle(legacyStyle: string): string {
    const styleMap = {
      'realistic': 'realistic',
      'cartoon': 'cartoon',
      'anime': 'anime',
      'pixel': 'retro'
    };
    
    return styleMap[legacyStyle as keyof typeof styleMap] || 'realistic';
  }
}
```

## Testing Your Migration

### Automated Migration Testing

```typescript
// Create comprehensive migration tests
describe('Avatar Migration', () => {
  let component: MigratedAvatarComponent;
  let fixture: ComponentFixture<MigratedAvatarComponent>;
  let legacyMock: jasmine.SpyObj<any>;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MigratedAvatarComponent],
      providers: [
        { provide: LegacyAvatarService, useValue: jasmine.createSpyObj('LegacyAvatarService', ['speak', 'animate']) }
      ]
    });
    
    fixture = TestBed.createComponent(MigratedAvatarComponent);
    component = fixture.componentInstance;
    legacyMock = TestBed.inject(LegacyAvatarService) as jasmine.SpyObj<any>;
  });
  
  it('should migrate voice settings correctly', () => {
    const legacyVoiceConfig = {
      voice: 'female_1',
      speed: 150,
      pitch: 100
    };
    
    const migratedConfig = component.migrateVoiceConfig(legacyVoiceConfig);
    
    expect(migratedConfig.provider).toBe('elevenlabs');
    expect(migratedConfig.settings.speed).toBe(1.5);
    expect(migratedConfig.settings.pitch).toBe(0.0);
  });
  
  it('should maintain speech functionality', async () => {
    const testText = 'Hello, this is a test';
    
    // Test legacy system
    legacyMock.speak.and.returnValue(Promise.resolve());
    await legacyMock.speak(testText);
    
    // Test new system
    spyOn(component.avatar(), 'speak').and.returnValue(Promise.resolve());
    await component.speakText(testText);
    
    // Both should be called with same text
    expect(legacyMock.speak).toHaveBeenCalledWith(testText);
    expect(component.avatar().speak).toHaveBeenCalledWith(testText, jasmine.any(Object));
  });
  
  it('should handle animation migration', () => {
    const legacyAnimations = ['wave', 'point', 'nod'];
    
    legacyAnimations.forEach(animation => {
      component.playLegacyAnimation(animation);
      
      // Verify animation was mapped and played
      expect(component.avatar().playGesture).toHaveBeenCalled();
    });
  });
});
```

### A/B Testing Setup

```typescript
// A/B test migration with feature flags
@Component({
  selector: 'app-ab-test-avatar'
})
export class ABTestAvatarComponent implements OnInit {
  private featureFlags = inject(FeatureFlagService);
  
  readonly useNewAvatar = this.featureFlags.isEnabled('new-avatar-system');
  readonly migrationPhase = this.featureFlags.getValue('migration-phase', 1);
  
  ngOnInit() {
    // Track migration performance
    this.trackMigrationMetrics();
  }
  
  private trackMigrationMetrics() {
    const startTime = performance.now();
    
    // Track avatar load time
    this.avatar()?.ready.pipe(take(1)).subscribe(() => {
      const loadTime = performance.now() - startTime;
      
      // Send metrics to analytics
      this.analytics.track('avatar_migration_performance', {
        system: this.useNewAvatar() ? 'new' : 'legacy',
        loadTime,
        phase: this.migrationPhase()
      });
    });
    
    // Track speech performance
    this.avatar()?.speechEnd.subscribe(() => {
      this.analytics.track('avatar_speech_completed', {
        system: this.useNewAvatar() ? 'new' : 'legacy'
      });
    });
  }
}
```

### User Acceptance Testing

```typescript
// Collect user feedback during migration
@Component({
  selector: 'app-migration-feedback',
  template: `
    <avatar-2d [config]="avatarConfig()" #avatar></avatar-2d>
    
    <!-- Migration feedback form -->
    <div class="migration-feedback" *ngIf="showFeedbackForm()">
      <h3>Avatar Experience Feedback</h3>
      <form [formGroup]="feedbackForm" (ngSubmit)="submitFeedback()">
        <div class="form-group">
          <label>How would you rate the new avatar system?</label>
          <select formControlName="rating">
            <option value="5">Much Better</option>
            <option value="4">Better</option>
            <option value="3">Same</option>
            <option value="2">Worse</option>
            <option value="1">Much Worse</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>What features do you miss from the old system?</label>
          <textarea formControlName="missingFeatures"></textarea>
        </div>
        
        <div class="form-group">
          <label>Any issues encountered?</label>
          <textarea formControlName="issues"></textarea>
        </div>
        
        <button type="submit">Submit Feedback</button>
      </form>
    </div>
  `
})
export class MigrationFeedbackComponent {
  feedbackForm = this.fb.group({
    rating: ['3'],
    missingFeatures: [''],
    issues: ['']
  });
  
  private _showFeedbackForm = signal(false);
  readonly showFeedbackForm = this._showFeedbackForm.asReadonly();
  
  constructor(private fb: FormBuilder, private http: HttpClient) {}
  
  ngOnInit() {
    // Show feedback form after user has used avatar for 5 minutes
    setTimeout(() => {
      this._showFeedbackForm.set(true);
    }, 5 * 60 * 1000);
  }
  
  submitFeedback() {
    const feedback = {
      ...this.feedbackForm.value,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      migrationPhase: this.getCurrentMigrationPhase()
    };
    
    this.http.post('/api/migration-feedback', feedback).subscribe({
      next: () => {
        this._showFeedbackForm.set(false);
        // Show thank you message
      },
      error: (error) => {
        console.error('Failed to submit feedback:', error);
      }
    });
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### Voice Not Working After Migration

**Symptoms**: Avatar appears but doesn't speak
**Causes**: 
- Voice provider configuration incorrect
- API keys not set
- Network connectivity issues

**Solutions**:
```typescript
// Debug voice issues
export class VoiceDebuggingService {
  async diagnoseVoiceIssues(): Promise<DiagnosisResult> {
    const results = {
      providerAvailable: false,
      apiKeyValid: false,
      networkConnectivity: false,
      browserSupported: false
    };
    
    // Check provider availability
    try {
      await this.testVoiceProvider();
      results.providerAvailable = true;
    } catch (error) {
      console.error('Voice provider unavailable:', error);
    }
    
    // Check API key
    results.apiKeyValid = this.validateApiKey();
    
    // Check network connectivity
    results.networkConnectivity = navigator.onLine;
    
    // Check browser support
    results.browserSupported = this.checkBrowserSupport();
    
    return results;
  }
  
  private validateApiKey(): boolean {
    const apiKey = environment.voiceApiKey;
    return apiKey && apiKey.length > 0 && apiKey !== 'your-api-key-here';
  }
  
  private checkBrowserSupport(): boolean {
    return 'speechSynthesis' in window || 'webkitSpeechSynthesis' in window;
  }
}
```

#### Performance Issues After Migration

**Symptoms**: Slow avatar loading or animation
**Causes**:
- Resource not properly optimized
- Memory leaks from legacy code
- Concurrent loading of old and new systems

**Solutions**:
```typescript
// Performance optimization service
export class PerformanceOptimizationService {
  optimizeForMigration() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Clean up legacy resources
    this.cleanupLegacyResources();
    
    // Optimize rendering
    this.optimizeRendering();
  }
  
  private preloadCriticalResources() {
    const criticalAssets = [
      'assets/avatars/default-character.json',
      'assets/voices/default-voice.mp3'
    ];
    
    criticalAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset;
      link.as = asset.endsWith('.json') ? 'fetch' : 'audio';
      document.head.appendChild(link);
    });
  }
  
  private cleanupLegacyResources() {
    // Remove legacy event listeners
    window.removeEventListener('legacy-avatar-event', this.legacyHandler);
    
    // Clean up legacy DOM elements
    const legacyElements = document.querySelectorAll('.legacy-avatar');
    legacyElements.forEach(el => el.remove());
    
    // Clear legacy timers
    if (this.legacyTimer) {
      clearInterval(this.legacyTimer);
    }
  }
}
```

#### Configuration Conflicts

**Symptoms**: Avatar behaves unexpectedly
**Causes**:
- Mixing legacy and new configuration formats
- Conflicting CSS styles
- Event listener conflicts

**Solutions**:
```typescript
// Configuration validation service
export class ConfigValidationService {
  validateMigratedConfig(config: AvatarConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate required fields
    if (!config.avatar?.type) {
      errors.push('Avatar type is required');
    }
    
    // Check for legacy properties
    if (this.hasLegacyProperties(config)) {
      warnings.push('Configuration contains legacy properties that will be ignored');
    }
    
    // Validate voice configuration
    if (config.voice && !this.isValidVoiceConfig(config.voice)) {
      errors.push('Invalid voice configuration');
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
  }
  
  private hasLegacyProperties(config: any): boolean {
    const legacyProps = ['flashVars', 'swfPath', 'sitepalId'];
    return legacyProps.some(prop => prop in config);
  }
  
  private isValidVoiceConfig(voice: VoiceConfig): boolean {
    return !!(voice.provider && voice.voiceId);
  }
}
```

#### Gesture/Animation Issues

**Symptoms**: Gestures don't play or appear broken
**Solutions**:
```typescript
// Gesture debugging utility
export class GestureDebuggingService {
  async debugGestureIssues(gestureName: string): Promise<void> {
    console.log(`Debugging gesture: ${gestureName}`);
    
    // Check if gesture exists
    const gestureExists = await this.checkGestureExists(gestureName);
    console.log(`Gesture exists: ${gestureExists}`);
    
    // Check gesture format compatibility
    const formatCompatible = this.checkFormatCompatibility(gestureName);
    console.log(`Format compatible: ${formatCompatible}`);
    
    // Test gesture playback
    try {
      await this.testGesturePlayback(gestureName);
      console.log('Gesture playback successful');
    } catch (error) {
      console.error('Gesture playback failed:', error);
    }
  }
  
  private async checkGestureExists(gestureName: string): Promise<boolean> {
    // Implementation would check gesture availability
    return true;
  }
  
  private checkFormatCompatibility(gestureName: string): boolean {
    // Check if gesture format is supported
    return true;
  }
  
  private async testGesturePlayback(gestureName: string): Promise<void> {
    // Test actual gesture playback
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }
}
```

### Migration Rollback Plan

```typescript
// Emergency rollback service
@Injectable({
  providedIn: 'root'
})
export class MigrationRollbackService {
  private rollbackConfig = {
    maxRollbackTime: 24 * 60 * 60 * 1000, // 24 hours
    criticalErrorThreshold: 5,
    performanceThreshold: 2000 // 2 seconds
  };
  
  private errorCount = 0;
  private migrationStartTime = Date.now();
  
  checkRollbackConditions(): boolean {
    const migrationAge = Date.now() - this.migrationStartTime;
    
    // Rollback if too many errors
    if (this.errorCount >= this.rollbackConfig.criticalErrorThreshold) {
      console.warn('Rolling back due to critical errors');
      return true;
    }
    
    // Rollback if migration is too old
    if (migrationAge > this.rollbackConfig.maxRollbackTime) {
      console.warn('Rollback window expired');
      return false;
    }
    
    // Check performance metrics
    if (this.getAverageLoadTime() > this.rollbackConfig.performanceThreshold) {
      console.warn('Rolling back due to poor performance');
      return true;
    }
    
    return false;
  }
  
  async performRollback(): Promise<void> {
    console.log('Performing emergency rollback to legacy system');
    
    // Disable new avatar system
    this.featureFlags.disable('new-avatar-system');
    
    // Re-enable legacy system
    this.featureFlags.enable('legacy-avatar-system');
    
    // Clear new system caches
    await this.clearNewSystemCaches();
    
    // Notify administrators
    this.notificationService.sendAlert('Avatar system rolled back to legacy');
  }
  
  private getAverageLoadTime(): number {
    // Implementation would return actual performance metrics
    return 1000; // Mock value
  }
  
  private async clearNewSystemCaches(): Promise<void> {
    // Clear caches and reset state
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.includes('avatar'))
          .map(name => caches.delete(name))
      );
    }
  }
}
```

## Migration Success Metrics

Track these metrics to measure migration success:

### Technical Metrics
- **Load Time**: Avatar initialization time
- **Error Rate**: Percentage of failed avatar loads
- **Memory Usage**: Peak memory consumption
- **Bundle Size**: JavaScript bundle size impact
- **API Response Time**: Voice provider response times

### User Experience Metrics  
- **User Satisfaction**: Rating scores from feedback
- **Feature Usage**: Which features are being used
- **Completion Rate**: Percentage of successful interactions
- **Accessibility Score**: Compliance with accessibility standards

### Business Metrics
- **Cost Savings**: Reduction in licensing/infrastructure costs
- **Development Velocity**: Time to implement new features
- **Support Tickets**: Number of avatar-related issues
- **User Retention**: Impact on user engagement

## Conclusion

Migrating to BigLedger Avatar requires careful planning, but the benefits of modern architecture, better performance, and enhanced features make it worthwhile. Follow this guide step-by-step, test thoroughly, and monitor closely during rollout.

For additional support during migration:
- Check the [API Reference](./API_REFERENCE.md) for detailed implementation guidance
- Review [Examples](./examples/) for working code samples
- Visit our [GitHub repository](https://github.com/bigledger/avatar) for community support
- Contact our support team for enterprise migration assistance

Remember: A successful migration is a gradual process. Take your time, test thoroughly, and always have a rollback plan ready.