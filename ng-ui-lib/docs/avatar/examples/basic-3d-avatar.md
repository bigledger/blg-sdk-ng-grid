# Basic 3D Avatar Example

A comprehensive example demonstrating 3D avatar implementation with WebGL rendering, lighting, and advanced animation features.

## Overview

This example showcases the 3D Avatar system capabilities including realistic rendering, environmental lighting, camera controls, and full-body animations. It provides a foundation for creating immersive 3D avatar experiences.

## Prerequisites

- Angular 17+ application
- WebGL 2.0 compatible browser
- BigLedger Avatar 3D packages installed
- Three.js dependencies

## Installation

```bash
npm install @bigledger/ng-ui-avatar-core @bigledger/ng-ui-avatar-3d
npm install three @types/three
```

## Implementation

### Step 1: Component Setup

```typescript
// basic-3d-avatar.component.ts
import { Component, signal, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Avatar3d } from '@bigledger/ng-ui-avatar-3d';

@Component({
  selector: 'app-basic-3d-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule, Avatar3d],
  template: `
    <div class="avatar-3d-container">
      <h2>Basic 3D Avatar Example</h2>
      
      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="isLoading()">
        <div class="loading-spinner"></div>
        <p>Loading 3D Avatar...</p>
        <div class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="loadingProgress()"></div>
          </div>
          <span>{{ loadingProgress() }}%</span>
        </div>
      </div>

      <!-- 3D Avatar Display -->
      <div class="avatar-viewport" [class.loading]="isLoading()">
        <lib-avatar3d
          #avatar3d
          [config]="avatar3dConfig()"
          [modelUrl]="currentModelUrl()"
          [environment]="environmentSettings()"
          [lighting]="lightingConfig()"
          [camera]="cameraConfig()"
          [animations]="availableAnimations()"
          (modelLoaded)="onModelLoaded($event)"
          (animationComplete)="onAnimationComplete($event)"
          (renderingError)="onRenderingError($event)"
          (performanceUpdate)="onPerformanceUpdate($event)">
        </lib-avatar3d>

        <!-- Performance HUD -->
        <div class="performance-hud" *ngIf="showPerformanceHUD()">
          <div class="performance-metrics">
            <div class="metric">
              <label>FPS:</label>
              <span [class.warning]="currentFPS() < 30">{{ currentFPS() }}</span>
            </div>
            <div class="metric">
              <label>Memory:</label>
              <span>{{ memoryUsage() }}MB</span>
            </div>
            <div class="metric">
              <label>Triangles:</label>
              <span>{{ triangleCount() }}K</span>
            </div>
          </div>
        </div>

        <!-- Camera Controls Hint -->
        <div class="camera-hint" *ngIf="showCameraHint()">
          <p>Mouse: Rotate | Wheel: Zoom | Right Click: Pan</p>
        </div>
      </div>

      <!-- Control Panel -->
      <div class="control-panel">
        <!-- Model Selection -->
        <div class="control-section">
          <h3>Avatar Model</h3>
          <div class="model-selection">
            <div class="model-grid">
              <div 
                *ngFor="let model of availableModels()"
                class="model-option"
                [class.selected]="currentModel() === model.id"
                (click)="selectModel(model)">
                <img [src]="model.thumbnail" [alt]="model.name">
                <span>{{ model.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Animation Controls -->
        <div class="control-section">
          <h3>Animations</h3>
          <div class="animation-controls">
            <div class="animation-categories">
              <div *ngFor="let category of animationCategories()" class="category">
                <h4>{{ category.name }}</h4>
                <div class="animation-buttons">
                  <button 
                    *ngFor="let animation of category.animations"
                    class="animation-btn"
                    [class.active]="currentAnimation() === animation.id"
                    [disabled]="isAnimationPlaying()"
                    (click)="playAnimation(animation)">
                    {{ animation.name }}
                  </button>
                </div>
              </div>
            </div>
            
            <div class="animation-settings">
              <label>
                Animation Speed:
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1"
                  [(ngModel)]="animationSpeed"
                  (ngModelChange)="updateAnimationSpeed($event)">
                <span>{{ animationSpeed }}x</span>
              </label>
              
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="loopAnimation"
                  (ngModelChange)="updateAnimationLoop($event)">
                Loop Animation
              </label>
            </div>
          </div>
        </div>

        <!-- Lighting Controls -->
        <div class="control-section">
          <h3>Lighting</h3>
          <div class="lighting-controls">
            <div class="light-presets">
              <button 
                *ngFor="let preset of lightingPresets()"
                class="preset-btn"
                [class.active]="currentLightingPreset() === preset.id"
                (click)="applyLightingPreset(preset)">
                {{ preset.name }}
              </button>
            </div>
            
            <div class="light-adjustments">
              <label>
                Ambient Intensity:
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  [(ngModel)]="ambientIntensity"
                  (ngModelChange)="updateAmbientLight($event)">
                <span>{{ ambientIntensity }}</span>
              </label>
              
              <label>
                Key Light Intensity:
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1"
                  [(ngModel)]="keyLightIntensity"
                  (ngModelChange)="updateKeyLight($event)">
                <span>{{ keyLightIntensity }}</span>
              </label>
              
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="enableShadows"
                  (ngModelChange)="updateShadows($event)">
                Enable Shadows
              </label>
            </div>
          </div>
        </div>

        <!-- Environment Settings -->
        <div class="control-section">
          <h3>Environment</h3>
          <div class="environment-controls">
            <label>
              Background:
              <select 
                [(ngModel)]="selectedBackground"
                (ngModelChange)="updateBackground($event)">
                <option value="studio">Studio</option>
                <option value="office">Office</option>
                <option value="outdoor">Outdoor</option>
                <option value="neutral">Neutral Gray</option>
                <option value="transparent">Transparent</option>
              </select>
            </label>
            
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="enablePostProcessing"
                (ngModelChange)="updatePostProcessing($event)">
              Post Processing Effects
            </label>
          </div>
        </div>

        <!-- Quality Settings -->
        <div class="control-section">
          <h3>Quality Settings</h3>
          <div class="quality-controls">
            <label>
              Rendering Quality:
              <select 
                [(ngModel)]="renderingQuality"
                (ngModelChange)="updateRenderingQuality($event)">
                <option value="low">Low (Mobile)</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="ultra">Ultra</option>
              </select>
            </label>
            
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="enableAntialiasing"
                (ngModelChange)="updateAntialiasing($event)">
              Anti-aliasing
            </label>
            
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="showPerformanceHUD"
                (ngModelChange)="togglePerformanceHUD($event)">
              Show Performance HUD
            </label>
          </div>
        </div>

        <!-- Export Options -->
        <div class="control-section">
          <h3>Export</h3>
          <div class="export-controls">
            <button (click)="captureScreenshot()" class="export-btn">
              📸 Screenshot
            </button>
            <button (click)="recordAnimation()" class="export-btn">
              🎥 Record Animation
            </button>
            <button (click)="exportModel()" class="export-btn">
              💾 Export Model
            </button>
          </div>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="status-bar">
        <div class="status-info">
          <span><strong>Status:</strong> {{ avatarStatus() }}</span>
          <span><strong>Animation:</strong> {{ currentAnimation() || 'None' }}</span>
          <span><strong>Quality:</strong> {{ renderingQuality }}</span>
        </div>
        
        <div class="quick-actions">
          <button 
            (click)="resetCamera()" 
            class="quick-btn"
            title="Reset Camera">
            🎯 Reset View
          </button>
          <button 
            (click)="toggleFullscreen()" 
            class="quick-btn"
            title="Toggle Fullscreen">
            {{ isFullscreen() ? '🔲' : '⛶' }} Fullscreen
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-3d-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #1a1a1a;
      color: white;
      font-family: 'Segoe UI', Arial, sans-serif;
    }

    h2 {
      text-align: center;
      margin: 0;
      padding: 20px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 300;
    }

    .avatar-viewport {
      flex: 1;
      position: relative;
      background: #2a2a2a;
      border: 2px solid #333;
      margin: 10px;
      border-radius: 8px;
      overflow: hidden;
      min-height: 500px;
    }

    .avatar-viewport.loading {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #333;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-progress {
      width: 200px;
      margin-top: 10px;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #333;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 5px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s ease;
    }

    .performance-hud {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
      font-family: monospace;
    }

    .performance-metrics {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      min-width: 100px;
    }

    .metric .warning {
      color: #ff6b6b;
    }

    .camera-hint {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      padding: 8px 12px;
      border-radius: 5px;
      font-size: 12px;
      opacity: 0.8;
    }

    .control-panel {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: #2a2a2a;
      border-top: 1px solid #333;
      overflow-x: auto;
      max-height: 400px;
      overflow-y: auto;
    }

    .control-section {
      min-width: 250px;
      background: #333;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #444;
    }

    .control-section h3 {
      margin: 0 0 15px 0;
      color: #667eea;
      font-size: 16px;
      border-bottom: 1px solid #444;
      padding-bottom: 8px;
    }

    .model-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .model-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 10px;
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #2a2a2a;
    }

    .model-option:hover {
      border-color: #667eea;
      background: #3a3a3a;
    }

    .model-option.selected {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .model-option img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }

    .model-option span {
      font-size: 12px;
      text-align: center;
    }

    .animation-categories {
      margin-bottom: 15px;
    }

    .category {
      margin-bottom: 15px;
    }

    .category h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #ccc;
    }

    .animation-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .animation-btn, .preset-btn {
      padding: 6px 12px;
      border: 1px solid #555;
      background: #2a2a2a;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .animation-btn:hover, .preset-btn:hover {
      border-color: #667eea;
      background: #3a3a3a;
    }

    .animation-btn.active, .preset-btn.active {
      background: #667eea;
      border-color: #667eea;
    }

    .animation-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .animation-settings, .light-adjustments, .environment-controls, .quality-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 15px;
    }

    .animation-settings label,
    .light-adjustments label,
    .environment-controls label,
    .quality-controls label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
    }

    input[type="range"] {
      flex: 1;
      margin: 0 10px;
    }

    input[type="checkbox"] {
      transform: scale(1.2);
    }

    select {
      background: #2a2a2a;
      color: white;
      border: 1px solid #555;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .light-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-bottom: 10px;
    }

    .export-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .export-btn {
      padding: 8px 12px;
      border: 1px solid #667eea;
      background: transparent;
      color: #667eea;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s ease;
    }

    .export-btn:hover {
      background: #667eea;
      color: white;
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background: #1a1a1a;
      border-top: 1px solid #333;
      font-size: 13px;
    }

    .status-info {
      display: flex;
      gap: 20px;
    }

    .status-info span {
      color: #ccc;
    }

    .status-info strong {
      color: #667eea;
    }

    .quick-actions {
      display: flex;
      gap: 10px;
    }

    .quick-btn {
      padding: 6px 12px;
      border: 1px solid #555;
      background: #2a2a2a;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .quick-btn:hover {
      border-color: #667eea;
      background: #3a3a3a;
    }

    @media (max-width: 768px) {
      .control-panel {
        flex-direction: column;
        max-height: 300px;
      }
      
      .control-section {
        min-width: auto;
      }
      
      .status-bar {
        flex-direction: column;
        gap: 10px;
        text-align: center;
      }
    }
  `]
})
export class Basic3DAvatarComponent implements OnInit, OnDestroy {
  @ViewChild('avatar3d') avatar3d!: Avatar3d;

  // Loading state
  private _isLoading = signal(true);
  private _loadingProgress = signal(0);
  private _avatarStatus = signal('Initializing...');

  // Model and animation state
  private _currentModel = signal('female-professional');
  private _currentAnimation = signal('');
  private _isAnimationPlaying = signal(false);

  // Performance state
  private _currentFPS = signal(60);
  private _memoryUsage = signal(0);
  private _triangleCount = signal(0);

  // UI state
  private _showPerformanceHUD = signal(false);
  private _showCameraHint = signal(true);
  private _isFullscreen = signal(false);

  // Configuration signals
  avatar3dConfig = signal({
    quality: 'high',
    antialiasing: true,
    shadows: true,
    postProcessing: {
      bloom: true,
      ssao: true,
      colorCorrection: true
    },
    physics: {
      enabled: false,
      hairSimulation: false,
      clothingSimulation: false
    },
    optimization: {
      frustumCulling: true,
      occlusionCulling: true,
      lodEnabled: true
    }
  });

  environmentSettings = signal({
    preset: 'studio',
    background: {
      type: 'hdri',
      url: '/assets/environments/studio.hdr',
      intensity: 1.0,
      blur: 0.0
    },
    fog: {
      enabled: false,
      color: '#ffffff',
      near: 10,
      far: 100
    }
  });

  lightingConfig = signal({
    ambient: {
      intensity: 0.4,
      color: '#ffffff'
    },
    directional: {
      intensity: 1.2,
      color: '#ffffff',
      position: [5, 10, 5],
      shadows: true,
      shadowMapSize: 2048
    },
    fill: {
      intensity: 0.6,
      color: '#f0f8ff',
      position: [-3, 5, 2]
    },
    rim: {
      intensity: 0.8,
      color: '#ffffff',
      position: [0, 5, -5]
    }
  });

  cameraConfig = signal({
    position: [0, 1.6, 2.5],
    target: [0, 1.4, 0],
    fov: 45,
    near: 0.1,
    far: 1000,
    controls: {
      enabled: true,
      enableDamping: true,
      dampingFactor: 0.05,
      autoRotate: false,
      autoRotateSpeed: 2.0,
      enableZoom: true,
      enablePan: true,
      minDistance: 1.0,
      maxDistance: 10.0,
      minPolarAngle: Math.PI * 0.1,
      maxPolarAngle: Math.PI * 0.8
    }
  });

  // Available models
  availableModels = signal([
    {
      id: 'female-professional',
      name: 'Female Professional',
      thumbnail: '/assets/models/thumbnails/female-professional.jpg',
      url: '/assets/models/female-professional.glb'
    },
    {
      id: 'male-professional',
      name: 'Male Professional',
      thumbnail: '/assets/models/thumbnails/male-professional.jpg',
      url: '/assets/models/male-professional.glb'
    },
    {
      id: 'female-casual',
      name: 'Female Casual',
      thumbnail: '/assets/models/thumbnails/female-casual.jpg',
      url: '/assets/models/female-casual.glb'
    },
    {
      id: 'male-casual',
      name: 'Male Casual',
      thumbnail: '/assets/models/thumbnails/male-casual.jpg',
      url: '/assets/models/male-casual.glb'
    }
  ]);

  // Animation categories
  animationCategories = signal([
    {
      name: 'Basic',
      animations: [
        { id: 'idle', name: 'Idle', duration: 0 },
        { id: 'wave', name: 'Wave', duration: 3000 },
        { id: 'nod', name: 'Nod', duration: 2000 },
        { id: 'shake-head', name: 'Shake Head', duration: 2000 }
      ]
    },
    {
      name: 'Expressions',
      animations: [
        { id: 'smile', name: 'Smile', duration: 2000 },
        { id: 'laugh', name: 'Laugh', duration: 3000 },
        { id: 'think', name: 'Think', duration: 4000 },
        { id: 'surprised', name: 'Surprised', duration: 2000 }
      ]
    },
    {
      name: 'Gestures',
      animations: [
        { id: 'point', name: 'Point', duration: 2000 },
        { id: 'thumbs-up', name: 'Thumbs Up', duration: 2000 },
        { id: 'clap', name: 'Clap', duration: 3000 },
        { id: 'present', name: 'Present', duration: 4000 }
      ]
    }
  ]);

  // Lighting presets
  lightingPresets = signal([
    {
      id: 'studio',
      name: 'Studio',
      config: {
        ambient: { intensity: 0.4 },
        directional: { intensity: 1.2, position: [5, 10, 5] },
        fill: { intensity: 0.6, position: [-3, 5, 2] }
      }
    },
    {
      id: 'dramatic',
      name: 'Dramatic',
      config: {
        ambient: { intensity: 0.1 },
        directional: { intensity: 2.0, position: [2, 8, 3] },
        fill: { intensity: 0.2, position: [-1, 3, 1] }
      }
    },
    {
      id: 'soft',
      name: 'Soft',
      config: {
        ambient: { intensity: 0.6 },
        directional: { intensity: 0.8, position: [3, 6, 4] },
        fill: { intensity: 0.8, position: [-2, 4, 3] }
      }
    },
    {
      id: 'outdoor',
      name: 'Outdoor',
      config: {
        ambient: { intensity: 0.8 },
        directional: { intensity: 3.0, position: [10, 20, 10] },
        fill: { intensity: 0.3, position: [-5, 5, 5] }
      }
    }
  ]);

  availableAnimations = signal([]);

  // Control properties
  animationSpeed = 1.0;
  loopAnimation = false;
  ambientIntensity = 0.4;
  keyLightIntensity = 1.2;
  enableShadows = true;
  selectedBackground = 'studio';
  enablePostProcessing = true;
  renderingQuality = 'high';
  enableAntialiasing = true;
  currentLightingPreset = signal('studio');

  // Read-only signals
  readonly isLoading = this._isLoading.asReadonly();
  readonly loadingProgress = this._loadingProgress.asReadonly();
  readonly avatarStatus = this._avatarStatus.asReadonly();
  readonly currentModel = this._currentModel.asReadonly();
  readonly currentAnimation = this._currentAnimation.asReadonly();
  readonly isAnimationPlaying = this._isAnimationPlaying.asReadonly();
  readonly currentFPS = this._currentFPS.asReadonly();
  readonly memoryUsage = this._memoryUsage.asReadonly();
  readonly triangleCount = this._triangleCount.asReadonly();
  readonly showPerformanceHUD = this._showPerformanceHUD.asReadonly();
  readonly showCameraHint = this._showCameraHint.asReadonly();
  readonly isFullscreen = this._isFullscreen.asReadonly();

  // Computed signals
  readonly currentModelUrl = signal(this.availableModels().find(m => m.id === this.currentModel())?.url || '');

  private animationTimeouts = new Set<any>();

  ngOnInit() {
    this.initializeAvatar();
    this.setupEventListeners();
    
    // Hide camera hint after 10 seconds
    setTimeout(() => {
      this._showCameraHint.set(false);
    }, 10000);
  }

  ngOnDestroy() {
    this.cleanupTimeouts();
  }

  // Initialization
  private initializeAvatar() {
    this._avatarStatus.set('Loading 3D model...');
    this.simulateLoading();
  }

  private simulateLoading() {
    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      this._loadingProgress.set(Math.min(100, progress));
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this._isLoading.set(false);
          this._avatarStatus.set('Ready');
        }, 500);
      }
    }, 200);
  }

  private setupEventListeners() {
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', () => {
      this._isFullscreen.set(!!document.fullscreenElement);
    });
  }

  // Model selection
  selectModel(model: any) {
    if (this.currentModel() === model.id) return;
    
    this._currentModel.set(model.id);
    this.currentModelUrl.set(model.url);
    this._avatarStatus.set(`Loading ${model.name}...`);
    this._isLoading.set(true);
    
    // Simulate model loading
    setTimeout(() => {
      this._isLoading.set(false);
      this._avatarStatus.set('Ready');
    }, 2000);
  }

  // Animation control
  playAnimation(animation: any) {
    if (this.isAnimationPlaying()) return;

    this._currentAnimation.set(animation.id);
    this._isAnimationPlaying.set(true);
    this._avatarStatus.set(`Playing ${animation.name}...`);

    // Simulate animation duration
    const timeout = setTimeout(() => {
      if (!this.loopAnimation) {
        this._currentAnimation.set('');
        this._isAnimationPlaying.set(false);
        this._avatarStatus.set('Ready');
      }
    }, animation.duration);

    this.animationTimeouts.add(timeout);
  }

  updateAnimationSpeed(speed: number) {
    this.animationSpeed = speed;
    // Apply speed to 3D avatar system
    if (this.avatar3d) {
      // this.avatar3d.setAnimationSpeed(speed);
    }
  }

  updateAnimationLoop(loop: boolean) {
    this.loopAnimation = loop;
    // Apply loop setting to 3D avatar system
    if (this.avatar3d) {
      // this.avatar3d.setAnimationLoop(loop);
    }
  }

  // Lighting control
  applyLightingPreset(preset: any) {
    this.currentLightingPreset.set(preset.id);
    
    this.lightingConfig.update(config => ({
      ...config,
      ...preset.config
    }));

    this.ambientIntensity = preset.config.ambient.intensity;
    this.keyLightIntensity = preset.config.directional.intensity;
  }

  updateAmbientLight(intensity: number) {
    this.ambientIntensity = intensity;
    
    this.lightingConfig.update(config => ({
      ...config,
      ambient: {
        ...config.ambient,
        intensity: intensity
      }
    }));
  }

  updateKeyLight(intensity: number) {
    this.keyLightIntensity = intensity;
    
    this.lightingConfig.update(config => ({
      ...config,
      directional: {
        ...config.directional,
        intensity: intensity
      }
    }));
  }

  updateShadows(enabled: boolean) {
    this.enableShadows = enabled;
    
    this.lightingConfig.update(config => ({
      ...config,
      directional: {
        ...config.directional,
        shadows: enabled
      }
    }));
  }

  // Environment control
  updateBackground(background: string) {
    this.selectedBackground = background;
    
    const backgroundConfigs = {
      studio: {
        type: 'hdri',
        url: '/assets/environments/studio.hdr',
        intensity: 1.0
      },
      office: {
        type: 'hdri',
        url: '/assets/environments/office.hdr',
        intensity: 0.8
      },
      outdoor: {
        type: 'hdri',
        url: '/assets/environments/outdoor.hdr',
        intensity: 1.2
      },
      neutral: {
        type: 'solid',
        color: '#808080',
        intensity: 0.5
      },
      transparent: {
        type: 'transparent',
        alpha: 0.0
      }
    };

    this.environmentSettings.update(config => ({
      ...config,
      background: backgroundConfigs[background as keyof typeof backgroundConfigs] || backgroundConfigs.studio
    }));
  }

  updatePostProcessing(enabled: boolean) {
    this.enablePostProcessing = enabled;
    
    this.avatar3dConfig.update(config => ({
      ...config,
      postProcessing: {
        ...config.postProcessing,
        bloom: enabled,
        ssao: enabled,
        colorCorrection: enabled
      }
    }));
  }

  // Quality control
  updateRenderingQuality(quality: string) {
    this.renderingQuality = quality;
    
    const qualityConfigs = {
      low: {
        quality: 'low',
        antialiasing: false,
        shadows: false,
        postProcessing: { bloom: false, ssao: false, colorCorrection: false }
      },
      medium: {
        quality: 'medium',
        antialiasing: true,
        shadows: true,
        postProcessing: { bloom: false, ssao: true, colorCorrection: true }
      },
      high: {
        quality: 'high',
        antialiasing: true,
        shadows: true,
        postProcessing: { bloom: true, ssao: true, colorCorrection: true }
      },
      ultra: {
        quality: 'ultra',
        antialiasing: true,
        shadows: true,
        postProcessing: { bloom: true, ssao: true, colorCorrection: true }
      }
    };

    this.avatar3dConfig.update(config => ({
      ...config,
      ...qualityConfigs[quality as keyof typeof qualityConfigs]
    }));

    this.enableAntialiasing = qualityConfigs[quality as keyof typeof qualityConfigs].antialiasing;
    this.enableShadows = qualityConfigs[quality as keyof typeof qualityConfigs].shadows;
  }

  updateAntialiasing(enabled: boolean) {
    this.enableAntialiasing = enabled;
    
    this.avatar3dConfig.update(config => ({
      ...config,
      antialiasing: enabled
    }));
  }

  togglePerformanceHUD(show: boolean) {
    this._showPerformanceHUD.set(show);
  }

  // Camera control
  resetCamera() {
    this.cameraConfig.update(config => ({
      ...config,
      position: [0, 1.6, 2.5],
      target: [0, 1.4, 0]
    }));

    if (this.avatar3d) {
      // this.avatar3d.resetCamera();
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // Export functions
  captureScreenshot() {
    if (this.avatar3d) {
      // this.avatar3d.captureScreenshot('avatar-screenshot.png');
      console.log('Screenshot captured');
    }
  }

  recordAnimation() {
    if (this.avatar3d) {
      // this.avatar3d.startRecording();
      console.log('Recording started');
    }
  }

  exportModel() {
    if (this.avatar3d) {
      // this.avatar3d.exportModel('avatar-model.glb');
      console.log('Model exported');
    }
  }

  // Event handlers
  onModelLoaded(event: any) {
    console.log('3D model loaded:', event);
    this._isLoading.set(false);
    this._avatarStatus.set('Ready');
    this._triangleCount.set(Math.floor(event.triangles / 1000));
  }

  onAnimationComplete(event: any) {
    console.log('Animation completed:', event.animationName);
    
    if (!this.loopAnimation) {
      this._currentAnimation.set('');
      this._isAnimationPlaying.set(false);
      this._avatarStatus.set('Ready');
    }
  }

  onRenderingError(event: any) {
    console.error('3D rendering error:', event);
    this._avatarStatus.set('Error: Failed to render 3D model');
    
    // Attempt quality fallback
    if (this.renderingQuality === 'ultra') {
      this.updateRenderingQuality('high');
    } else if (this.renderingQuality === 'high') {
      this.updateRenderingQuality('medium');
    }
  }

  onPerformanceUpdate(event: any) {
    this._currentFPS.set(Math.round(event.fps || 60));
    this._memoryUsage.set(Math.round(event.memoryUsage || 0));
    
    // Auto-adjust quality if performance is poor
    if (event.fps < 30 && this.renderingQuality !== 'low') {
      console.log('Poor performance detected, reducing quality');
      this.autoReduceQuality();
    }
  }

  // Helper methods
  private autoReduceQuality() {
    const qualityOrder = ['ultra', 'high', 'medium', 'low'];
    const currentIndex = qualityOrder.indexOf(this.renderingQuality);
    
    if (currentIndex < qualityOrder.length - 1) {
      const newQuality = qualityOrder[currentIndex + 1];
      this.updateRenderingQuality(newQuality);
      console.log(`Quality automatically reduced to: ${newQuality}`);
    }
  }

  private cleanupTimeouts() {
    this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.animationTimeouts.clear();
  }
}
```

### Step 2: Environment Configuration

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  avatar3d: {
    modelBasePath: '/assets/models/',
    environmentBasePath: '/assets/environments/',
    textureBasePath: '/assets/textures/',
    animationBasePath: '/assets/animations/',
    
    performance: {
      maxTextureSize: 2048,
      shadowMapSize: 2048,
      maxLights: 8,
      enableMipmaps: true,
      enableCompression: true
    },
    
    features: {
      postProcessing: true,
      realTimeShadows: true,
      physicsSimulation: false,
      particleEffects: true,
      audioSpatial: false
    }
  }
};
```

### Step 3: Asset Structure

```
src/assets/
├── models/
│   ├── female-professional.glb
│   ├── male-professional.glb
│   ├── female-casual.glb
│   ├── male-casual.glb
│   └── thumbnails/
│       ├── female-professional.jpg
│       ├── male-professional.jpg
│       ├── female-casual.jpg
│       └── male-casual.jpg
├── environments/
│   ├── studio.hdr
│   ├── office.hdr
│   └── outdoor.hdr
├── textures/
│   ├── skin/
│   ├── hair/
│   └── clothing/
└── animations/
    ├── basic/
    ├── expressions/
    └── gestures/
```

## Usage Instructions

### Basic Setup

1. **Install required packages** and dependencies
2. **Add 3D model assets** to your assets folder
3. **Configure environment** settings for your models
4. **Import and use** the component in your application

### Model Loading

```typescript
// Load custom 3D model
loadCustomModel(modelFile: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const modelData = e.target?.result;
    if (this.avatar3d) {
      this.avatar3d.loadModelFromData(modelData);
    }
  };
  reader.readAsArrayBuffer(modelFile);
}
```

### Animation Control

```typescript
// Chain multiple animations
playAnimationSequence(animations: string[]) {
  let delay = 0;
  
  animations.forEach((animationId, index) => {
    setTimeout(() => {
      this.avatar3d.playAnimation(animationId, {
        loop: false,
        speed: this.animationSpeed,
        blend: index > 0 // Blend with previous animation
      });
    }, delay);
    
    delay += this.getAnimationDuration(animationId);
  });
}
```

### Custom Lighting

```typescript
// Create custom lighting setup
setupCustomLighting() {
  const customLighting = {
    ambient: {
      intensity: 0.3,
      color: '#4a4a4a'
    },
    
    key: {
      type: 'directional',
      intensity: 1.5,
      color: '#ffffff',
      position: [3, 8, 4],
      shadows: true,
      shadowBias: -0.001
    },
    
    fill: {
      type: 'directional',
      intensity: 0.4,
      color: '#87ceeb',
      position: [-2, 3, 2],
      shadows: false
    },
    
    rim: {
      type: 'spot',
      intensity: 1.0,
      color: '#ffffff',
      position: [0, 6, -3],
      angle: Math.PI * 0.3,
      penumbra: 0.2
    }
  };
  
  this.lightingConfig.set(customLighting);
}
```

## Performance Optimization

### Quality Adaptation

```typescript
// Implement adaptive quality based on device capabilities
ngOnInit() {
  this.detectDeviceCapabilities().then(capabilities => {
    const optimalQuality = this.determineOptimalQuality(capabilities);
    this.updateRenderingQuality(optimalQuality);
  });
}

private async detectDeviceCapabilities() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  return {
    webglVersion: gl?.getParameter(gl.VERSION) || 'none',
    maxTextureSize: gl?.getParameter(gl.MAX_TEXTURE_SIZE) || 1024,
    memoryAvailable: (navigator as any).deviceMemory || 4,
    hardwareConcurrency: navigator.hardwareConcurrency || 2
  };
}
```

### Memory Management

```typescript
// Monitor and manage memory usage
private monitorMemoryUsage() {
  setInterval(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedMB = memInfo.usedJSHeapSize / (1024 * 1024);
      this._memoryUsage.set(Math.round(usedMB));
      
      // Auto garbage collection if memory usage is high
      if (usedMB > 500) {
        this.optimizeMemory();
      }
    }
  }, 1000);
}

private optimizeMemory() {
  if (this.avatar3d) {
    // this.avatar3d.disposeUnusedTextures();
    // this.avatar3d.reduceModelLOD();
  }
}
```

## Next Steps

- Explore [TTS Integration with 3D Avatars](./virtual-presenter.md)
- Learn about [Advanced 3D Customization](../features/3d-avatars.md)
- Check [Performance Optimization Guide](../MIGRATION.md)

This example provides a comprehensive foundation for 3D avatar implementation with full control over rendering, lighting, animations, and performance optimization.