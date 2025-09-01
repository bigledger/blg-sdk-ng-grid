# Virtual Presenter Example

This example demonstrates creating a professional virtual presenter that can deliver presentations with synchronized speech, gestures, and screen interactions.

## Overview

The Virtual Presenter combines:
- Professional 3D avatar with business attire
- Advanced text-to-speech with natural intonation
- Automated gesture generation for emphasis
- Screen interaction capabilities
- Presentation slide synchronization
- Audience engagement features

## Implementation

### Component Setup

```typescript
import { Component, OnInit, signal, computed, effect, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Avatar3DComponent } from '@ng-ui-lib/avatar-3d';
import { AvatarTTSComponent } from '@ng-ui-lib/avatar-tts';
import { AvatarConfig, PresentationSlide, AudienceEngagement } from '@ng-ui-lib/avatar-core';

@Component({
  selector: 'app-virtual-presenter',
  standalone: true,
  imports: [CommonModule, Avatar3DComponent, AvatarTTSComponent],
  template: `
    <div class="presenter-container">
      <!-- Main presenter viewport -->
      <div class="presenter-stage">
        <avatar-3d 
          [config]="presenterConfig()"
          [state]="presenterState()"
          (gestureComplete)="onGestureComplete($event)"
          (speechStart)="onSpeechStart()"
          (speechEnd)="onSpeechEnd()"
          #presenter>
        </avatar-3d>
        
        <!-- Slide display area -->
        <div class="slide-area" [class.active]="showSlides()">
          <div class="slide-content">
            @if (currentSlide()) {
              <div class="slide">
                <h2>{{ currentSlide()?.title }}</h2>
                <div [innerHTML]="currentSlide()?.content"></div>
                @if (currentSlide()?.chart) {
                  <div class="chart-container">
                    <canvas #chartCanvas></canvas>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Presentation controls -->
      <div class="controls">
        <button 
          (click)="startPresentation()" 
          [disabled]="isPresenting()"
          class="btn-primary">
          Start Presentation
        </button>
        
        <button 
          (click)="pausePresentation()" 
          [disabled]="!isPresenting()"
          class="btn-secondary">
          Pause
        </button>
        
        <button 
          (click)="nextSlide()" 
          [disabled]="!canGoNext()"
          class="btn-secondary">
          Next Slide
        </button>
        
        <button 
          (click)="previousSlide()" 
          [disabled]="!canGoPrevious()"
          class="btn-secondary">
          Previous Slide
        </button>

        <!-- Presentation settings -->
        <div class="settings">
          <label>
            <input 
              type="checkbox" 
              [checked]="autoAdvance()"
              (change)="toggleAutoAdvance($event)">
            Auto-advance slides
          </label>
          
          <label>
            Speech Speed:
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.1"
              [value]="speechSpeed()"
              (input)="setSpeechSpeed($event)">
          </label>
          
          <label>
            Gesture Intensity:
            <select [value]="gestureIntensity()" (change)="setGestureIntensity($event)">
              <option value="subtle">Subtle</option>
              <option value="moderate">Moderate</option>
              <option value="expressive">Expressive</option>
            </select>
          </label>
        </div>
      </div>

      <!-- Progress indicator -->
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          [style.width.%]="presentationProgress()">
        </div>
        <span class="progress-text">
          {{ currentSlideIndex() + 1 }} / {{ slides().length }}
        </span>
      </div>

      <!-- Audience engagement panel -->
      <div class="engagement-panel" [class.visible]="showEngagement()">
        <h3>Audience Engagement</h3>
        <div class="metrics">
          <div class="metric">
            <span class="label">Attention Level:</span>
            <div class="meter">
              <div 
                class="meter-fill" 
                [style.width.%]="audienceMetrics().attention">
              </div>
            </div>
          </div>
          
          <div class="metric">
            <span class="label">Comprehension:</span>
            <div class="meter">
              <div 
                class="meter-fill" 
                [style.width.%]="audienceMetrics().comprehension">
              </div>
            </div>
          </div>
        </div>
        
        <!-- Interactive questions -->
        @if (currentSlide()?.questions) {
          <div class="questions">
            <h4>Interactive Questions</h4>
            @for (question of currentSlide()?.questions; track question.id) {
              <div class="question">
                <p>{{ question.text }}</p>
                <div class="answers">
                  @for (answer of question.answers; track answer.id) {
                    <button 
                      class="answer-btn"
                      [class.selected]="selectedAnswers().has(answer.id)"
                      (click)="selectAnswer(question.id, answer.id)">
                      {{ answer.text }}
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .presenter-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    }

    .presenter-stage {
      flex: 1;
      display: flex;
      position: relative;
      overflow: hidden;
    }

    avatar-3d {
      flex: 0 0 400px;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      margin: 20px;
      backdrop-filter: blur(10px);
    }

    .slide-area {
      flex: 1;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateX(50px);
      transition: all 0.5s ease;
    }

    .slide-area.active {
      opacity: 1;
      transform: translateX(0);
    }

    .slide {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      max-width: 800px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .slide h2 {
      color: #2c3e50;
      margin-bottom: 20px;
      font-size: 2.5em;
      font-weight: 300;
    }

    .chart-container {
      margin-top: 20px;
      text-align: center;
    }

    .controls {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      display: flex;
      gap: 10px;
      align-items: center;
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-primary {
      background: #3498db;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .settings {
      margin-left: auto;
      display: flex;
      gap: 20px;
      align-items: center;
      color: white;
    }

    .settings label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9em;
    }

    .progress-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      position: relative;
    }

    .progress-fill {
      height: 100%;
      background: #3498db;
      transition: width 0.3s ease;
    }

    .progress-text {
      position: absolute;
      right: 10px;
      top: -25px;
      color: white;
      font-size: 0.9em;
    }

    .engagement-panel {
      position: fixed;
      right: -300px;
      top: 20px;
      width: 280px;
      height: calc(100vh - 40px);
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 20px;
      transition: right 0.3s ease;
      box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
      overflow-y: auto;
    }

    .engagement-panel.visible {
      right: 20px;
    }

    .metrics {
      margin-bottom: 30px;
    }

    .metric {
      margin-bottom: 15px;
    }

    .meter {
      height: 8px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 5px;
    }

    .meter-fill {
      height: 100%;
      background: linear-gradient(90deg, #e74c3c, #f39c12, #27ae60);
      transition: width 0.5s ease;
    }

    .questions {
      margin-top: 30px;
    }

    .question {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .answers {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 10px;
    }

    .answer-btn {
      padding: 8px 12px;
      border: 2px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .answer-btn:hover {
      border-color: #3498db;
    }

    .answer-btn.selected {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }
  `]
})
export class VirtualPresenterComponent implements OnInit {
  // Avatar reference
  presenter = viewChild<Avatar3DComponent>('presenter');
  chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  // State management
  private _currentSlideIndex = signal(0);
  private _isPresenting = signal(false);
  private _isPaused = signal(false);
  private _autoAdvance = signal(true);
  private _speechSpeed = signal(1.0);
  private _gestureIntensity = signal<'subtle' | 'moderate' | 'expressive'>('moderate');
  private _showSlides = signal(false);
  private _showEngagement = signal(false);
  private _selectedAnswers = signal(new Set<string>());
  private _audienceMetrics = signal({
    attention: 85,
    comprehension: 78,
    engagement: 82
  });

  // Computed properties
  readonly currentSlideIndex = this._currentSlideIndex.asReadonly();
  readonly isPresenting = this._isPresenting.asReadonly();
  readonly isPaused = this._isPaused.asReadonly();
  readonly autoAdvance = this._autoAdvance.asReadonly();
  readonly speechSpeed = this._speechSpeed.asReadonly();
  readonly gestureIntensity = this._gestureIntensity.asReadonly();
  readonly showSlides = this._showSlides.asReadonly();
  readonly showEngagement = this._showEngagement.asReadonly();
  readonly selectedAnswers = this._selectedAnswers.asReadonly();
  readonly audienceMetrics = this._audienceMetrics.asReadonly();

  readonly currentSlide = computed(() => this.slides()[this._currentSlideIndex()]);
  readonly canGoNext = computed(() => this._currentSlideIndex() < this.slides().length - 1);
  readonly canGoPrevious = computed(() => this._currentSlideIndex() > 0);
  readonly presentationProgress = computed(() => 
    ((this._currentSlideIndex() + 1) / this.slides().length) * 100
  );

  // Presentation data
  readonly slides = signal<PresentationSlide[]>([
    {
      id: 'intro',
      title: 'Welcome to Our Quarterly Review',
      content: `
        <p class="lead">Thank you for joining today's presentation. We'll be covering our key achievements, market analysis, and strategic initiatives for the upcoming quarter.</p>
        <ul>
          <li>Q3 Performance Summary</li>
          <li>Market Trends Analysis</li>
          <li>Strategic Initiatives</li>
          <li>Future Roadmap</li>
        </ul>
      `,
      speech: `Welcome everyone to our quarterly review presentation. Today we'll explore our achievements, analyze current market trends, and discuss our strategic roadmap. I'm excited to share these insights with you.`,
      duration: 8000,
      gestures: ['wave', 'welcome', 'present']
    },
    {
      id: 'performance',
      title: 'Q3 Performance Highlights',
      content: `
        <div class="stats-grid">
          <div class="stat">
            <h3>Revenue Growth</h3>
            <div class="number">+24.5%</div>
          </div>
          <div class="stat">
            <h3>Customer Satisfaction</h3>
            <div class="number">94.2%</div>
          </div>
          <div class="stat">
            <h3>Market Share</h3>
            <div class="number">18.7%</div>
          </div>
        </div>
      `,
      speech: `Our third quarter performance exceeded expectations with remarkable twenty-four point five percent revenue growth. Customer satisfaction reached an impressive ninety-four point two percent, and we've captured eighteen point seven percent market share.`,
      duration: 12000,
      gestures: ['pointUp', 'celebrate', 'emphasis'],
      chart: {
        type: 'bar',
        data: [24.5, 94.2, 18.7],
        labels: ['Revenue Growth %', 'Customer Satisfaction %', 'Market Share %']
      },
      questions: [
        {
          id: 'q1',
          text: 'Which metric impressed you the most?',
          answers: [
            { id: 'a1', text: 'Revenue Growth', correct: false },
            { id: 'a2', text: 'Customer Satisfaction', correct: true },
            { id: 'a3', text: 'Market Share', correct: false }
          ]
        }
      ]
    },
    {
      id: 'strategy',
      title: 'Strategic Initiatives',
      content: `
        <h3>Key Focus Areas</h3>
        <div class="initiatives">
          <div class="initiative">
            <h4>🚀 Digital Transformation</h4>
            <p>Accelerating our digital capabilities with AI-powered solutions and automation.</p>
          </div>
          <div class="initiative">
            <h4>🌍 Global Expansion</h4>
            <p>Entering three new international markets with localized product offerings.</p>
          </div>
          <div class="initiative">
            <h4>🤝 Strategic Partnerships</h4>
            <p>Building alliances with industry leaders to expand our ecosystem.</p>
          </div>
        </div>
      `,
      speech: `Our strategic initiatives focus on three key areas. First, digital transformation through AI-powered solutions. Second, global expansion into three new international markets. And third, forming strategic partnerships with industry leaders to strengthen our ecosystem.`,
      duration: 15000,
      gestures: ['pointLeft', 'pointRight', 'pointUp', 'embrace']
    }
  ]);

  // Avatar configuration
  readonly presenterConfig = computed((): AvatarConfig => ({
    // 3D Avatar setup
    avatar: {
      type: '3d' as const,
      model: {
        url: '/assets/models/presenter-professional.glb',
        scale: 1.0,
        autoCenter: true
      },
      appearance: {
        clothing: 'business-suit',
        hairStyle: 'professional',
        skinTone: 'medium',
        eyeColor: 'brown'
      }
    },

    // Professional behavior
    behavior: {
      personality: 'professional',
      gestures: {
        enabled: true,
        frequency: this._gestureIntensity() === 'expressive' ? 0.8 : 
                   this._gestureIntensity() === 'moderate' ? 0.5 : 0.3,
        naturalness: 0.9,
        cultural: 'business-western'
      },
      eyeContact: {
        enabled: true,
        frequency: 0.8,
        duration: { min: 2000, max: 4000 }
      },
      microExpressions: true
    },

    // Voice configuration
    voice: {
      provider: 'elevenlabs',
      voiceId: 'professional-presenter',
      settings: {
        speed: this._speechSpeed(),
        pitch: 0.0,
        volume: 0.8,
        stability: 0.8,
        clarity: 0.9,
        style: 0.2
      },
      emotion: {
        enthusiasm: 0.7,
        confidence: 0.9,
        warmth: 0.6
      }
    },

    // Advanced features
    features: {
      lipSync: true,
      emotionDetection: true,
      gestureGeneration: true,
      eyeTracking: true,
      backgroundRemoval: false
    },

    // Rendering setup
    rendering: {
      quality: 'high',
      lighting: {
        type: 'professional',
        intensity: 1.2,
        shadows: true
      },
      background: {
        type: 'gradient',
        colors: ['#f8f9fa', '#e9ecef']
      },
      camera: {
        position: 'medium-shot',
        angle: 'straight',
        followGaze: true
      }
    },

    // Performance optimization
    performance: {
      targetFPS: 60,
      adaptiveQuality: true,
      backgroundOptimization: true
    }
  }));

  // Current presenter state
  readonly presenterState = computed(() => ({
    isActive: this._isPresenting(),
    currentEmotion: 'confident',
    speaking: this._isPresenting() && !this._isPaused(),
    gesture: this.getCurrentGesture()
  }));

  ngOnInit() {
    // Initialize engagement tracking
    this.startEngagementTracking();
    
    // Set up presentation auto-advance
    effect(() => {
      if (this._isPresenting() && this._autoAdvance() && !this._isPaused()) {
        this.scheduleNextSlide();
      }
    });
  }

  startPresentation() {
    this._isPresenting.set(true);
    this._showSlides.set(true);
    this._showEngagement.set(true);
    this._currentSlideIndex.set(0);
    
    this.speakCurrentSlide();
    this.performSlideGestures();
    this.renderChart();
  }

  pausePresentation() {
    this._isPaused.set(!this._isPaused());
    
    if (this._isPaused()) {
      this.presenter()?.pauseSpeech();
    } else {
      this.presenter()?.resumeSpeech();
    }
  }

  nextSlide() {
    if (this.canGoNext()) {
      this._currentSlideIndex.update(i => i + 1);
      this.speakCurrentSlide();
      this.performSlideGestures();
      this.renderChart();
      this.updateEngagementMetrics();
    }
  }

  previousSlide() {
    if (this.canGoPrevious()) {
      this._currentSlideIndex.update(i => i - 1);
      this.speakCurrentSlide();
      this.performSlideGestures();
      this.renderChart();
    }
  }

  toggleAutoAdvance(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this._autoAdvance.set(checkbox.checked);
  }

  setSpeechSpeed(event: Event) {
    const input = event.target as HTMLInputElement;
    this._speechSpeed.set(parseFloat(input.value));
  }

  setGestureIntensity(event: Event) {
    const select = event.target as HTMLSelectElement;
    this._gestureIntensity.set(select.value as 'subtle' | 'moderate' | 'expressive');
  }

  selectAnswer(questionId: string, answerId: string) {
    this._selectedAnswers.update(answers => {
      const newAnswers = new Set(answers);
      if (newAnswers.has(answerId)) {
        newAnswers.delete(answerId);
      } else {
        newAnswers.add(answerId);
      }
      return newAnswers;
    });
    
    // Update engagement based on participation
    this.updateEngagementFromInteraction();
  }

  // Event handlers
  onGestureComplete(gesture: string) {
    console.log('Gesture completed:', gesture);
  }

  onSpeechStart() {
    console.log('Speech started');
  }

  onSpeechEnd() {
    if (this._autoAdvance() && this.canGoNext()) {
      setTimeout(() => this.nextSlide(), 2000);
    }
  }

  // Private methods
  private speakCurrentSlide() {
    const slide = this.currentSlide();
    if (slide?.speech) {
      this.presenter()?.speak(slide.speech, {
        speed: this._speechSpeed(),
        emotion: 'confident',
        gesture: true
      });
    }
  }

  private performSlideGestures() {
    const slide = this.currentSlide();
    if (slide?.gestures) {
      slide.gestures.forEach((gesture, index) => {
        setTimeout(() => {
          this.presenter()?.playGesture(gesture);
        }, index * 2000);
      });
    }
  }

  private renderChart() {
    const slide = this.currentSlide();
    if (slide?.chart && this.chartCanvas()) {
      const canvas = this.chartCanvas()!.nativeElement;
      const ctx = canvas.getContext('2d')!;
      
      // Simple chart rendering
      canvas.width = 400;
      canvas.height = 200;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#3498db';
      
      const data = slide.chart.data;
      const barWidth = canvas.width / data.length - 20;
      
      data.forEach((value, index) => {
        const height = (value / 100) * canvas.height * 0.8;
        const x = index * (barWidth + 20) + 10;
        const y = canvas.height - height - 20;
        
        ctx.fillRect(x, y, barWidth, height);
        
        // Labels
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.fillText(value.toString() + '%', x, y - 5);
        ctx.fillStyle = '#3498db';
      });
    }
  }

  private getCurrentGesture(): string | null {
    const slide = this.currentSlide();
    return slide?.gestures?.[0] || null;
  }

  private scheduleNextSlide() {
    const slide = this.currentSlide();
    if (slide?.duration) {
      setTimeout(() => {
        if (this._isPresenting() && this._autoAdvance() && !this._isPaused()) {
          this.nextSlide();
        }
      }, slide.duration);
    }
  }

  private startEngagementTracking() {
    // Simulate audience engagement tracking
    setInterval(() => {
      this._audienceMetrics.update(metrics => ({
        attention: Math.max(60, Math.min(100, metrics.attention + (Math.random() - 0.5) * 10)),
        comprehension: Math.max(50, Math.min(100, metrics.comprehension + (Math.random() - 0.5) * 8)),
        engagement: Math.max(50, Math.min(100, metrics.engagement + (Math.random() - 0.5) * 12))
      }));
    }, 3000);
  }

  private updateEngagementMetrics() {
    // Boost engagement when advancing slides
    this._audienceMetrics.update(metrics => ({
      ...metrics,
      attention: Math.min(100, metrics.attention + 5),
      engagement: Math.min(100, metrics.engagement + 3)
    }));
  }

  private updateEngagementFromInteraction() {
    // Boost all metrics when audience interacts
    this._audienceMetrics.update(metrics => ({
      attention: Math.min(100, metrics.attention + 10),
      comprehension: Math.min(100, metrics.comprehension + 8),
      engagement: Math.min(100, metrics.engagement + 12)
    }));
  }
}

// Supporting interfaces
interface PresentationSlide {
  id: string;
  title: string;
  content: string;
  speech: string;
  duration?: number;
  gestures?: string[];
  chart?: {
    type: 'bar' | 'line' | 'pie';
    data: number[];
    labels: string[];
  };
  questions?: InteractiveQuestion[];
}

interface InteractiveQuestion {
  id: string;
  text: string;
  answers: QuestionAnswer[];
}

interface QuestionAnswer {
  id: string;
  text: string;
  correct: boolean;
}
```

### Usage in Your Application

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { VirtualPresenterComponent } from './virtual-presenter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [VirtualPresenterComponent],
  template: `<app-virtual-presenter></app-virtual-presenter>`
})
export class AppComponent { }
```

### Styling (Additional CSS)

```css
/* Add to your global styles */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 20px 0;
}

.stat {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat h3 {
  margin: 0 0 10px;
  color: #6c757d;
  font-size: 1em;
  font-weight: 500;
}

.number {
  font-size: 2.5em;
  font-weight: 700;
  color: #28a745;
}

.initiatives {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.initiative {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.initiative h4 {
  margin: 0 0 10px;
  color: #495057;
}

.lead {
  font-size: 1.2em;
  font-weight: 300;
  margin-bottom: 20px;
  color: #6c757d;
}
```

## Features Demonstrated

### Professional Presentation
- 3D avatar with business attire and professional demeanor
- Synchronized speech with natural intonation patterns
- Automated gesture generation for emphasis points
- Eye contact and micro-expressions for engagement

### Interactive Elements
- Real-time slide progression with speech synchronization
- Audience engagement tracking with visual metrics
- Interactive questions with answer selection
- Auto-advancing slides with manual override

### Customization Options
- Adjustable speech speed and gesture intensity
- Multiple presentation modes (auto/manual)
- Professional lighting and camera angles
- Responsive design for different screen sizes

### Advanced Capabilities
- Chart rendering with data visualization
- Cultural adaptation for business contexts
- Performance monitoring and optimization
- Accessibility features for diverse audiences

## Integration Notes

This virtual presenter can be integrated with:
- Content management systems for dynamic presentations
- Video conferencing platforms for remote presentations
- Learning management systems for educational content
- Analytics platforms for engagement tracking

The component is designed to be highly customizable and can adapt to various presentation contexts while maintaining professional quality and engagement.