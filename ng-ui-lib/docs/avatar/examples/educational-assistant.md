# Educational Assistant Example

This example demonstrates creating an AI-powered educational assistant that can teach, quiz, provide feedback, and adapt to different learning styles using advanced avatar technology.

## Overview

The Educational Assistant features:
- Adaptive teaching methodologies
- Multi-modal content delivery (visual, auditory, kinesthetic)
- Interactive quizzes and assessments
- Personalized feedback and encouragement
- Progress tracking and analytics
- Multilingual support for global learning

## Implementation

### Component Setup

```typescript
import { Component, OnInit, signal, computed, effect, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Avatar2DComponent } from '@ng-ui-lib/avatar-2d';
import { AvatarTTSComponent } from '@ng-ui-lib/avatar-tts';
import { AvatarConfig, LearningSession, StudentProfile, QuizQuestion } from '@ng-ui-lib/avatar-core';

@Component({
  selector: 'app-educational-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, Avatar2DComponent, AvatarTTSComponent],
  template: `
    <div class="classroom-container">
      <!-- Main teaching area -->
      <div class="teaching-area">
        <!-- Avatar teacher -->
        <div class="teacher-section">
          <avatar-2d 
            [config]="teacherConfig()"
            [state]="teacherState()"
            (expressionChange)="onExpressionChange($event)"
            (gestureComplete)="onGestureComplete($event)"
            (speechEnd)="onSpeechEnd()"
            #teacher>
          </avatar-2d>
          
          <!-- Teacher controls -->
          <div class="teacher-controls">
            <button 
              (click)="startLesson()" 
              [disabled]="isTeaching()"
              class="btn-primary">
              Start Lesson
            </button>
            
            <button 
              (click)="pauseLesson()" 
              [disabled]="!isTeaching()"
              class="btn-secondary">
              {{ isPaused() ? 'Resume' : 'Pause' }}
            </button>
            
            <button 
              (click)="startQuiz()" 
              [disabled]="!canStartQuiz()"
              class="btn-accent">
              Start Quiz
            </button>
            
            <select 
              [value]="teachingMode()" 
              (change)="setTeachingMode($event)"
              class="mode-selector">
              <option value="explain">Explain</option>
              <option value="demonstrate">Demonstrate</option>
              <option value="interact">Interact</option>
              <option value="assess">Assess</option>
            </select>
          </div>
        </div>

        <!-- Content display area -->
        <div class="content-area">
          @switch (currentMode()) {
            @case ('lesson') {
              <div class="lesson-content">
                <h2>{{ currentLesson()?.title }}</h2>
                <div class="lesson-body">
                  @if (currentLesson()?.visualAids) {
                    <div class="visual-aids">
                      @for (aid of currentLesson()?.visualAids; track aid.id) {
                        <div class="visual-aid" [class]="aid.type">
                          @switch (aid.type) {
                            @case ('diagram') {
                              <div class="diagram" [innerHTML]="aid.content"></div>
                            }
                            @case ('video') {
                              <video [src]="aid.content" controls></video>
                            }
                            @case ('interactive') {
                              <div class="interactive-element" [innerHTML]="aid.content"></div>
                            }
                          }
                        </div>
                      }
                    </div>
                  }
                  
                  <div class="lesson-text" [innerHTML]="currentLesson()?.content"></div>
                  
                  @if (currentLesson()?.examples) {
                    <div class="examples">
                      <h3>Examples</h3>
                      @for (example of currentLesson()?.examples; track example.id) {
                        <div class="example" [class.active]="currentExampleIndex() === example.id">
                          <h4>{{ example.title }}</h4>
                          <div [innerHTML]="example.content"></div>
                          @if (example.code) {
                            <pre><code [innerHTML]="example.code"></code></pre>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
            
            @case ('quiz') {
              <div class="quiz-container">
                <div class="quiz-header">
                  <h2>Knowledge Check</h2>
                  <div class="quiz-progress">
                    <span>Question {{ currentQuestionIndex() + 1 }} of {{ quizQuestions().length }}</span>
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        [style.width.%]="quizProgress()">
                      </div>
                    </div>
                  </div>
                </div>
                
                @if (currentQuestion()) {
                  <div class="question-container">
                    <div class="question">
                      <h3>{{ currentQuestion()?.text }}</h3>
                      @if (currentQuestion()?.image) {
                        <img [src]="currentQuestion()?.image" alt="Question illustration">
                      }
                    </div>
                    
                    <div class="answers">
                      @for (answer of currentQuestion()?.answers; track answer.id) {
                        <button 
                          class="answer-option"
                          [class.selected]="selectedAnswer() === answer.id"
                          [class.correct]="showAnswerFeedback() && answer.correct"
                          [class.incorrect]="showAnswerFeedback() && selectedAnswer() === answer.id && !answer.correct"
                          [disabled]="showAnswerFeedback()"
                          (click)="selectAnswer(answer.id)">
                          {{ answer.text }}
                        </button>
                      }
                    </div>
                    
                    @if (showAnswerFeedback()) {
                      <div class="answer-feedback" [class.correct]="isAnswerCorrect()">
                        <div class="feedback-icon">
                          {{ isAnswerCorrect() ? '✅' : '❌' }}
                        </div>
                        <div class="feedback-text">
                          {{ currentQuestion()?.feedback?.[isAnswerCorrect() ? 'correct' : 'incorrect'] }}
                        </div>
                      </div>
                    }
                    
                    <div class="question-controls">
                      @if (!showAnswerFeedback()) {
                        <button 
                          (click)="submitAnswer()" 
                          [disabled]="!selectedAnswer()"
                          class="btn-primary">
                          Submit Answer
                        </button>
                      } @else {
                        <button 
                          (click)="nextQuestion()" 
                          class="btn-primary">
                          {{ isLastQuestion() ? 'Finish Quiz' : 'Next Question' }}
                        </button>
                      }
                      
                      <button 
                        (click)="getHint()" 
                        [disabled]="showAnswerFeedback() || hintUsed()"
                        class="btn-secondary">
                        Get Hint
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
            
            @case ('results') {
              <div class="results-container">
                <h2>Quiz Results</h2>
                <div class="score-summary">
                  <div class="score-circle" [class]="getScoreClass()">
                    <span class="score">{{ quizScore() }}%</span>
                    <span class="label">Score</span>
                  </div>
                  
                  <div class="score-details">
                    <div class="stat">
                      <span class="number">{{ correctAnswers() }}</span>
                      <span class="label">Correct</span>
                    </div>
                    <div class="stat">
                      <span class="number">{{ incorrectAnswers() }}</span>
                      <span class="label">Incorrect</span>
                    </div>
                    <div class="stat">
                      <span class="number">{{ hintsUsed() }}</span>
                      <span class="label">Hints Used</span>
                    </div>
                  </div>
                </div>
                
                <div class="performance-analysis">
                  <h3>Performance Analysis</h3>
                  <div class="topics-performance">
                    @for (topic of topicPerformance(); track topic.name) {
                      <div class="topic-performance">
                        <span class="topic-name">{{ topic.name }}</span>
                        <div class="performance-bar">
                          <div 
                            class="performance-fill" 
                            [class]="topic.performance"
                            [style.width.%]="topic.score">
                          </div>
                        </div>
                        <span class="topic-score">{{ topic.score }}%</span>
                      </div>
                    }
                  </div>
                </div>
                
                <div class="recommendations">
                  <h3>Recommendations</h3>
                  @for (rec of recommendations(); track rec.id) {
                    <div class="recommendation" [class]="rec.type">
                      <div class="rec-icon">{{ rec.icon }}</div>
                      <div class="rec-content">
                        <h4>{{ rec.title }}</h4>
                        <p>{{ rec.description }}</p>
                        @if (rec.action) {
                          <button (click)="executeRecommendation(rec)" class="btn-small">
                            {{ rec.action.label }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Student profile and progress sidebar -->
      <div class="sidebar">
        <div class="student-profile">
          <h3>Student Profile</h3>
          <div class="profile-info">
            <div class="profile-item">
              <span class="label">Name:</span>
              <span class="value">{{ studentProfile().name }}</span>
            </div>
            <div class="profile-item">
              <span class="label">Level:</span>
              <span class="value">{{ studentProfile().level }}</span>
            </div>
            <div class="profile-item">
              <span class="label">Learning Style:</span>
              <span class="value">{{ studentProfile().learningStyle }}</span>
            </div>
          </div>
          
          <div class="learning-preferences">
            <h4>Preferences</h4>
            <label>
              <input 
                type="checkbox" 
                [checked]="preferences().audioEnabled"
                (change)="togglePreference('audioEnabled', $event)">
              Audio Explanations
            </label>
            <label>
              <input 
                type="checkbox" 
                [checked]="preferences().visualAids"
                (change)="togglePreference('visualAids', $event)">
              Visual Aids
            </label>
            <label>
              <input 
                type="checkbox" 
                [checked]="preferences().interactiveMode"
                (change)="togglePreference('interactiveMode', $event)">
              Interactive Mode
            </label>
            <label>
              <span>Speech Speed:</span>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1"
                [value]="preferences().speechSpeed"
                (input)="updateSpeechSpeed($event)">
            </label>
          </div>
        </div>
        
        <div class="progress-tracking">
          <h3>Progress Tracking</h3>
          <div class="overall-progress">
            <span class="label">Overall Progress</span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                [style.width.%]="overallProgress()">
              </div>
            </div>
            <span class="percentage">{{ overallProgress() }}%</span>
          </div>
          
          <div class="lesson-progress">
            <h4>Lesson Progress</h4>
            @for (lesson of lessons(); track lesson.id) {
              <div class="lesson-item" [class.completed]="lesson.completed">
                <span class="lesson-name">{{ lesson.title }}</span>
                <span class="lesson-status">{{ lesson.completed ? '✅' : '⏳' }}</span>
              </div>
            }
          </div>
          
          <div class="achievements">
            <h4>Achievements</h4>
            @for (achievement of achievements(); track achievement.id) {
              <div class="achievement" [class.unlocked]="achievement.unlocked">
                <span class="achievement-icon">{{ achievement.icon }}</span>
                <span class="achievement-name">{{ achievement.name }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Floating help button -->
    <button class="help-button" (click)="showHelp()" title="Get Help">
      ❓
    </button>
  `,
  styles: [`
    .classroom-container {
      display: flex;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      overflow: hidden;
    }

    .teaching-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }

    .teacher-section {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    avatar-2d {
      width: 200px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .teacher-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      height: fit-content;
    }

    .content-area {
      flex: 1;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 30px;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    /* Lesson Content Styles */
    .lesson-content h2 {
      color: #2c3e50;
      margin-bottom: 20px;
      font-size: 2.5em;
      font-weight: 300;
    }

    .visual-aids {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .visual-aid {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      border-left: 4px solid #007bff;
    }

    .visual-aid.diagram {
      border-left-color: #28a745;
    }

    .visual-aid.video {
      border-left-color: #ffc107;
    }

    .visual-aid.interactive {
      border-left-color: #dc3545;
    }

    .examples {
      margin-top: 30px;
    }

    .example {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid #6c757d;
      opacity: 0.7;
      transition: all 0.3s ease;
    }

    .example.active {
      border-left-color: #007bff;
      opacity: 1;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
    }

    .example pre {
      background: #2d3748;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      margin-top: 10px;
    }

    /* Quiz Styles */
    .quiz-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
    }

    .quiz-progress {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .progress-bar {
      width: 200px;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #28a745);
      transition: width 0.3s ease;
    }

    .question-container {
      background: #f8f9fa;
      border-radius: 16px;
      padding: 30px;
    }

    .question h3 {
      margin-bottom: 20px;
      color: #2c3e50;
      font-size: 1.4em;
    }

    .question img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 20px 0;
    }

    .answers {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin: 30px 0;
    }

    .answer-option {
      padding: 15px 20px;
      border: 2px solid #dee2e6;
      background: white;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
      font-size: 1em;
    }

    .answer-option:hover:not(:disabled) {
      border-color: #007bff;
      background: #f8f9fa;
    }

    .answer-option.selected {
      border-color: #007bff;
      background: #e7f3ff;
    }

    .answer-option.correct {
      border-color: #28a745;
      background: #d4edda;
      color: #155724;
    }

    .answer-option.incorrect {
      border-color: #dc3545;
      background: #f8d7da;
      color: #721c24;
    }

    .answer-feedback {
      background: #e7f3ff;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      display: flex;
      align-items: flex-start;
      gap: 15px;
    }

    .answer-feedback.correct {
      background: #d4edda;
      border-left: 4px solid #28a745;
    }

    .answer-feedback:not(.correct) {
      background: #f8d7da;
      border-left: 4px solid #dc3545;
    }

    .feedback-icon {
      font-size: 1.5em;
    }

    .question-controls {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    /* Results Styles */
    .results-container {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .score-summary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      margin: 40px 0;
    }

    .score-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 6px solid;
      position: relative;
    }

    .score-circle.excellent {
      border-color: #28a745;
      background: linear-gradient(135deg, #d4edda, #c3e6cb);
    }

    .score-circle.good {
      border-color: #ffc107;
      background: linear-gradient(135deg, #fff3cd, #ffeaa7);
    }

    .score-circle.needs-improvement {
      border-color: #dc3545;
      background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    }

    .score {
      font-size: 2.5em;
      font-weight: 700;
    }

    .score-details {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat .number {
      font-size: 2em;
      font-weight: 600;
      color: #2c3e50;
    }

    .stat .label {
      color: #6c757d;
      font-size: 0.9em;
    }

    .performance-analysis {
      margin: 40px 0;
      text-align: left;
    }

    .topics-performance {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .topic-performance {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .topic-name {
      flex: 0 0 150px;
      font-weight: 500;
    }

    .performance-bar {
      flex: 1;
      height: 12px;
      background: #e9ecef;
      border-radius: 6px;
      overflow: hidden;
    }

    .performance-fill {
      height: 100%;
      transition: width 0.5s ease;
    }

    .performance-fill.excellent {
      background: #28a745;
    }

    .performance-fill.good {
      background: #ffc107;
    }

    .performance-fill.needs-improvement {
      background: #dc3545;
    }

    .topic-score {
      flex: 0 0 50px;
      text-align: right;
      font-weight: 600;
    }

    .recommendations {
      margin-top: 40px;
      text-align: left;
    }

    .recommendation {
      display: flex;
      gap: 15px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      margin-bottom: 15px;
      border-left: 4px solid;
    }

    .recommendation.review {
      border-left-color: #ffc107;
    }

    .recommendation.practice {
      border-left-color: #007bff;
    }

    .recommendation.advance {
      border-left-color: #28a745;
    }

    .rec-icon {
      font-size: 1.5em;
      flex-shrink: 0;
    }

    .rec-content h4 {
      margin: 0 0 8px;
      color: #2c3e50;
    }

    .rec-content p {
      margin: 0 0 10px;
      color: #6c757d;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 350px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-left: 1px solid rgba(255, 255, 255, 0.2);
      padding: 20px;
      overflow-y: auto;
      color: white;
    }

    .student-profile,
    .progress-tracking {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .profile-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .learning-preferences label {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      cursor: pointer;
    }

    .lesson-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .lesson-item.completed {
      background: rgba(40, 167, 69, 0.2);
    }

    .achievement {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      margin-bottom: 8px;
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }

    .achievement.unlocked {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    /* Button Styles */
    .btn-primary {
      background: #007bff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    .btn-accent {
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s ease;
    }

    .btn-accent:hover:not(:disabled) {
      background: #218838;
    }

    .btn-small {
      background: #007bff;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875em;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .mode-selector {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 8px 12px;
      border-radius: 6px;
    }

    .help-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 1.5em;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease;
    }

    .help-button:hover {
      transform: scale(1.1);
    }
  `]
})
export class EducationalAssistantComponent implements OnInit {
  // Avatar reference
  teacher = viewChild<Avatar2DComponent>('teacher');

  // Core state
  private _currentMode = signal<'lesson' | 'quiz' | 'results'>('lesson');
  private _isTeaching = signal(false);
  private _isPaused = signal(false);
  private _teachingMode = signal<'explain' | 'demonstrate' | 'interact' | 'assess'>('explain');
  
  // Lesson state
  private _currentLessonIndex = signal(0);
  private _currentExampleIndex = signal<string | null>(null);
  
  // Quiz state
  private _currentQuestionIndex = signal(0);
  private _selectedAnswer = signal<string | null>(null);
  private _showAnswerFeedback = signal(false);
  private _hintUsed = signal(false);
  private _quizAnswers = signal<Record<number, { answerId: string; correct: boolean; hintUsed: boolean }>>({});
  
  // Student profile and preferences
  private _studentProfile = signal<StudentProfile>({
    name: 'Alex Thompson',
    level: 'Intermediate',
    learningStyle: 'Visual',
    strengths: ['Problem Solving', 'Logical Thinking'],
    weaknesses: ['Theory Concepts', 'Mathematical Formulas']
  });
  
  private _preferences = signal({
    audioEnabled: true,
    visualAids: true,
    interactiveMode: true,
    speechSpeed: 1.0
  });

  // Read-only computed properties
  readonly currentMode = this._currentMode.asReadonly();
  readonly isTeaching = this._isTeaching.asReadonly();
  readonly isPaused = this._isPaused.asReadonly();
  readonly teachingMode = this._teachingMode.asReadonly();
  readonly currentLessonIndex = this._currentLessonIndex.asReadonly();
  readonly currentExampleIndex = this._currentExampleIndex.asReadonly();
  readonly currentQuestionIndex = this._currentQuestionIndex.asReadonly();
  readonly selectedAnswer = this._selectedAnswer.asReadonly();
  readonly showAnswerFeedback = this._showAnswerFeedback.asReadonly();
  readonly hintUsed = this._hintUsed.asReadonly();
  readonly studentProfile = this._studentProfile.asReadonly();
  readonly preferences = this._preferences.asReadonly();

  // Computed properties
  readonly currentLesson = computed(() => this.lessons()[this._currentLessonIndex()]);
  readonly canStartQuiz = computed(() => !this._isTeaching() && this.currentLesson()?.quiz);
  readonly currentQuestion = computed(() => this.quizQuestions()[this._currentQuestionIndex()]);
  readonly quizProgress = computed(() => 
    ((this._currentQuestionIndex() + 1) / this.quizQuestions().length) * 100
  );
  readonly isLastQuestion = computed(() => 
    this._currentQuestionIndex() === this.quizQuestions().length - 1
  );
  readonly isAnswerCorrect = computed(() => {
    const question = this.currentQuestion();
    const selected = this._selectedAnswer();
    return question?.answers.find(a => a.id === selected)?.correct || false;
  });

  // Quiz results
  readonly quizAnswers = this._quizAnswers.asReadonly();
  readonly correctAnswers = computed(() => 
    Object.values(this._quizAnswers()).filter(a => a.correct).length
  );
  readonly incorrectAnswers = computed(() => 
    Object.values(this._quizAnswers()).filter(a => !a.correct).length
  );
  readonly hintsUsed = computed(() => 
    Object.values(this._quizAnswers()).filter(a => a.hintUsed).length
  );
  readonly quizScore = computed(() => 
    Math.round((this.correctAnswers() / this.quizQuestions().length) * 100)
  );

  // Learning data
  readonly lessons = signal<LearningSession[]>([
    {
      id: 'intro-programming',
      title: 'Introduction to Programming',
      content: `
        <p>Programming is the process of creating instructions for computers to follow. Think of it like writing a recipe - you provide step-by-step directions that the computer can understand and execute.</p>
        <p>In this lesson, we'll explore the fundamental concepts that form the building blocks of all programming languages.</p>
      `,
      speech: `Welcome to your first programming lesson! Programming is like teaching a computer how to solve problems step by step. Just as you might follow a recipe to bake a cake, computers follow programs to complete tasks. Today, we'll discover the basic building blocks that all programmers use, regardless of which programming language they choose. Are you ready to start your coding journey?`,
      visualAids: [
        {
          id: 'concept-diagram',
          type: 'diagram',
          content: `
            <div style="display: flex; align-items: center; gap: 20px; justify-content: center;">
              <div style="padding: 20px; background: #e3f2fd; border-radius: 10px;">Problem</div>
              <div style="font-size: 2em;">→</div>
              <div style="padding: 20px; background: #f3e5f5; border-radius: 10px;">Algorithm</div>
              <div style="font-size: 2em;">→</div>
              <div style="padding: 20px; background: #e8f5e8; border-radius: 10px;">Code</div>
              <div style="font-size: 2em;">→</div>
              <div style="padding: 20px; background: #fff3e0; border-radius: 10px;">Solution</div>
            </div>
          `
        }
      ],
      examples: [
        {
          id: 'hello-world',
          title: 'Hello World Example',
          content: 'The traditional first program that displays a greeting message.',
          code: `print("Hello, World!")
// This line displays "Hello, World!" on the screen
// It's the classic first program for learning any language`
        },
        {
          id: 'variables',
          title: 'Variables Example',
          content: 'Variables are containers that store data values.',
          code: `let studentName = "Alex"
let age = 16
let grade = 10.5

print("Student: " + studentName)
print("Age: " + age)
print("Grade: " + grade)`
        }
      ],
      completed: false,
      quiz: {
        questions: [
          {
            id: 'q1',
            text: 'What is programming?',
            answers: [
              { id: 'a1', text: 'Writing emails to computers', correct: false },
              { id: 'a2', text: 'Creating step-by-step instructions for computers', correct: true },
              { id: 'a3', text: 'Fixing broken computers', correct: false },
              { id: 'a4', text: 'Drawing pictures on computers', correct: false }
            ],
            feedback: {
              correct: 'Excellent! Programming is indeed about creating instructions that computers can follow.',
              incorrect: 'Not quite. Programming is about creating step-by-step instructions for computers to follow.'
            },
            hint: 'Think about how you might explain to someone how to make a sandwich - step by step!'
          }
        ]
      }
    }
  ]);

  readonly quizQuestions = computed(() => this.currentLesson()?.quiz?.questions || []);

  // Performance tracking
  readonly topicPerformance = computed(() => [
    { name: 'Basic Concepts', score: 85, performance: 'good' },
    { name: 'Problem Solving', score: 92, performance: 'excellent' },
    { name: 'Code Writing', score: 67, performance: 'needs-improvement' }
  ]);

  readonly overallProgress = computed(() => {
    const completed = this.lessons().filter(l => l.completed).length;
    return Math.round((completed / this.lessons().length) * 100);
  });

  readonly achievements = signal([
    { id: 'first-lesson', name: 'First Steps', icon: '🎯', unlocked: true },
    { id: 'quiz-master', name: 'Quiz Master', icon: '🏆', unlocked: false },
    { id: 'perfect-score', name: 'Perfect Score', icon: '⭐', unlocked: false },
    { id: 'help-seeker', name: 'Curious Mind', icon: '🤔', unlocked: true }
  ]);

  readonly recommendations = computed(() => {
    const score = this.quizScore();
    const recs = [];
    
    if (score < 70) {
      recs.push({
        id: 'review',
        type: 'review',
        icon: '📚',
        title: 'Review Core Concepts',
        description: 'Spend more time reviewing the fundamental concepts before moving forward.',
        action: { label: 'Start Review', handler: () => this.reviewConcepts() }
      });
    }
    
    if (score >= 70 && score < 85) {
      recs.push({
        id: 'practice',
        type: 'practice',
        icon: '💪',
        title: 'Practice More Examples',
        description: 'Try additional practice problems to strengthen your understanding.',
        action: { label: 'More Practice', handler: () => this.morePractice() }
      });
    }
    
    if (score >= 85) {
      recs.push({
        id: 'advance',
        type: 'advance',
        icon: '🚀',
        title: 'Ready for Next Level',
        description: 'Great job! You\'re ready to move on to more advanced topics.',
        action: { label: 'Next Lesson', handler: () => this.nextLesson() }
      });
    }
    
    return recs;
  });

  // Avatar configuration
  readonly teacherConfig = computed((): AvatarConfig => ({
    avatar: {
      type: '2d' as const,
      style: 'cartoon',
      character: 'teacher-friendly',
      appearance: {
        outfit: 'casual-professional',
        accessories: ['glasses', 'pointer'],
        expression: 'encouraging'
      }
    },
    
    behavior: {
      personality: 'encouraging',
      gestures: {
        enabled: true,
        frequency: 0.7,
        educationalEmphasis: true,
        pointingGestures: true
      },
      expressions: {
        encouraging: 0.8,
        patient: 0.9,
        enthusiastic: 0.7
      },
      eyeContact: {
        enabled: true,
        educational: true,
        frequency: 0.8
      }
    },
    
    voice: {
      provider: 'elevenlabs',
      voiceId: 'teacher-friendly',
      settings: {
        speed: this._preferences().speechSpeed,
        pitch: 0.1,
        volume: 0.8,
        clarity: 0.95,
        warmth: 0.8
      },
      emotion: {
        enthusiasm: 0.7,
        patience: 0.9,
        encouragement: 0.8
      }
    },
    
    features: {
      lipSync: this._preferences().audioEnabled,
      emotionDetection: true,
      gestureGeneration: true,
      educationalMode: true
    },
    
    rendering: {
      quality: 'high',
      style: 'friendly-cartoon',
      lighting: 'soft',
      background: 'classroom'
    }
  }));

  readonly teacherState = computed(() => ({
    isActive: this._isTeaching(),
    currentEmotion: this.getCurrentTeacherEmotion(),
    speaking: this._isTeaching() && !this._isPaused(),
    gesture: this.getCurrentGesture(),
    mode: this._teachingMode()
  }));

  ngOnInit() {
    // Initialize learning session
    this.setupLearningSession();
    
    // Track progress
    effect(() => {
      this.trackProgress();
    });
  }

  // Core methods
  startLesson() {
    this._isTeaching.set(true);
    this._currentMode.set('lesson');
    this.speakLessonContent();
  }

  pauseLesson() {
    this._isPaused.set(!this._isPaused());
    
    if (this._isPaused()) {
      this.teacher()?.pauseSpeech();
      this.provideEncouragement('Take your time! Learning at your own pace is important.');
    } else {
      this.teacher()?.resumeSpeech();
    }
  }

  startQuiz() {
    this._currentMode.set('quiz');
    this._currentQuestionIndex.set(0);
    this._selectedAnswer.set(null);
    this._showAnswerFeedback.set(false);
    this._quizAnswers.set({});
    
    this.teacher()?.speak('Great! Let\'s test your understanding with a quick quiz. Take your time and think through each question carefully.', {
      emotion: 'encouraging',
      gesture: 'thumbsUp'
    });
  }

  setTeachingMode(event: Event) {
    const select = event.target as HTMLSelectElement;
    const mode = select.value as 'explain' | 'demonstrate' | 'interact' | 'assess';
    this._teachingMode.set(mode);
    
    this.adaptToTeachingMode(mode);
  }

  selectAnswer(answerId: string) {
    this._selectedAnswer.set(answerId);
  }

  submitAnswer() {
    if (!this._selectedAnswer()) return;
    
    const isCorrect = this.isAnswerCorrect();
    const questionIndex = this._currentQuestionIndex();
    
    this._quizAnswers.update(answers => ({
      ...answers,
      [questionIndex]: {
        answerId: this._selectedAnswer()!,
        correct: isCorrect,
        hintUsed: this._hintUsed()
      }
    }));
    
    this._showAnswerFeedback.set(true);
    
    // Provide feedback through the teacher
    if (isCorrect) {
      this.teacher()?.speak('Excellent work! You got it right.', {
        emotion: 'happy',
        gesture: 'celebrate'
      });
      this.teacher()?.playExpression('proud', 0.8);
    } else {
      this.teacher()?.speak('That\'s not quite right, but that\'s okay! Learning from mistakes is part of the process.', {
        emotion: 'encouraging',
        gesture: 'supportive'
      });
      this.teacher()?.playExpression('encouraging', 0.7);
    }
  }

  nextQuestion() {
    if (this.isLastQuestion()) {
      this.finishQuiz();
    } else {
      this._currentQuestionIndex.update(i => i + 1);
      this._selectedAnswer.set(null);
      this._showAnswerFeedback.set(false);
      this._hintUsed.set(false);
      
      this.teacher()?.speak('Next question! You\'re doing great.', {
        emotion: 'encouraging'
      });
    }
  }

  getHint() {
    const question = this.currentQuestion();
    if (question?.hint) {
      this._hintUsed.set(true);
      this.teacher()?.speak(`Here's a hint: ${question.hint}`, {
        emotion: 'helpful',
        gesture: 'pointUp'
      });
    }
  }

  getScoreClass(): string {
    const score = this.quizScore();
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    return 'needs-improvement';
  }

  togglePreference(key: keyof typeof this._preferences.value, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this._preferences.update(prefs => ({
      ...prefs,
      [key]: checkbox.checked
    }));
  }

  updateSpeechSpeed(event: Event) {
    const input = event.target as HTMLInputElement;
    this._preferences.update(prefs => ({
      ...prefs,
      speechSpeed: parseFloat(input.value)
    }));
  }

  executeRecommendation(recommendation: any) {
    if (recommendation.action?.handler) {
      recommendation.action.handler();
    }
  }

  showHelp() {
    this.teacher()?.speak('I\'m here to help! You can ask me to repeat explanations, provide more examples, or give you hints on quiz questions. What would you like help with?', {
      emotion: 'helpful',
      gesture: 'wave'
    });
  }

  // Event handlers
  onExpressionChange(expression: string) {
    console.log('Teacher expression changed:', expression);
  }

  onGestureComplete(gesture: string) {
    console.log('Teacher gesture completed:', gesture);
  }

  onSpeechEnd() {
    if (this._currentMode() === 'lesson' && this._teachingMode() === 'demonstrate') {
      this.demonstrateExample();
    }
  }

  // Private methods
  private setupLearningSession() {
    // Initialize based on student profile and preferences
    console.log('Learning session initialized for:', this._studentProfile().name);
  }

  private speakLessonContent() {
    const lesson = this.currentLesson();
    if (lesson?.speech && this._preferences().audioEnabled) {
      this.teacher()?.speak(lesson.speech, {
        speed: this._preferences().speechSpeed,
        emotion: 'encouraging',
        gesture: true
      });
    }
  }

  private adaptToTeachingMode(mode: string) {
    switch (mode) {
      case 'explain':
        this.teacher()?.playExpression('focused', 0.7);
        break;
      case 'demonstrate':
        this.teacher()?.playGesture('point');
        break;
      case 'interact':
        this.teacher()?.playExpression('encouraging', 0.8);
        break;
      case 'assess':
        this.teacher()?.playExpression('professional', 0.6);
        break;
    }
  }

  private demonstrateExample() {
    const lesson = this.currentLesson();
    if (lesson?.examples && lesson.examples.length > 0) {
      const example = lesson.examples[0];
      this._currentExampleIndex.set(example.id);
      
      if (example.code) {
        this.teacher()?.speak(`Let me show you an example: ${example.title}. Here's how the code works.`, {
          emotion: 'explanatory',
          gesture: 'demonstrate'
        });
      }
    }
  }

  private finishQuiz() {
    this._currentMode.set('results');
    
    const score = this.quizScore();
    let feedback = '';
    
    if (score >= 85) {
      feedback = 'Outstanding work! You have a strong understanding of the concepts.';
    } else if (score >= 70) {
      feedback = 'Good job! You\'re on the right track. A bit more practice will help you master these concepts.';
    } else {
      feedback = 'You\'re learning! Don\'t worry about the score - what matters is that you\'re trying. Let\'s review the concepts together.';
    }
    
    this.teacher()?.speak(feedback, {
      emotion: 'encouraging',
      gesture: score >= 85 ? 'celebrate' : 'supportive'
    });
  }

  private getCurrentTeacherEmotion(): string {
    const mode = this._currentMode();
    if (mode === 'quiz') {
      return this._showAnswerFeedback() ? (this.isAnswerCorrect() ? 'proud' : 'encouraging') : 'attentive';
    }
    return 'friendly';
  }

  private getCurrentGesture(): string | null {
    return this._teachingMode() === 'demonstrate' ? 'point' : null;
  }

  private provideEncouragement(message: string) {
    this.teacher()?.speak(message, {
      emotion: 'encouraging',
      gesture: 'supportive'
    });
  }

  private trackProgress() {
    // Track learning progress and update achievements
    const answers = Object.values(this._quizAnswers());
    const correctCount = answers.filter(a => a.correct).length;
    
    if (correctCount > 0) {
      this.unlockAchievement('quiz-master');
    }
    
    if (this.quizScore() === 100) {
      this.unlockAchievement('perfect-score');
    }
  }

  private unlockAchievement(achievementId: string) {
    this._achievements.update(achievements => 
      achievements.map(a => 
        a.id === achievementId ? { ...a, unlocked: true } : a
      )
    );
  }

  private reviewConcepts() {
    this._currentMode.set('lesson');
    this.teacher()?.speak('Let\'s review the key concepts together. I\'ll explain them in a different way to help you understand better.');
  }

  private morePractice() {
    this.teacher()?.speak('Great idea! Practice makes perfect. Let me give you some additional exercises to work on.');
  }

  private nextLesson() {
    this._currentLessonIndex.update(i => Math.min(i + 1, this.lessons().length - 1));
    this._currentMode.set('lesson');
    this.teacher()?.speak('Excellent progress! Let\'s move on to the next lesson.');
  }
}

// Supporting interfaces
interface StudentProfile {
  name: string;
  level: string;
  learningStyle: string;
  strengths: string[];
  weaknesses: string[];
}

interface LearningSession {
  id: string;
  title: string;
  content: string;
  speech: string;
  visualAids?: VisualAid[];
  examples?: CodeExample[];
  completed: boolean;
  quiz?: Quiz;
}

interface VisualAid {
  id: string;
  type: 'diagram' | 'video' | 'interactive';
  content: string;
}

interface CodeExample {
  id: string;
  title: string;
  content: string;
  code?: string;
}

interface Quiz {
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  text: string;
  image?: string;
  answers: QuizAnswer[];
  feedback: {
    correct: string;
    incorrect: string;
  };
  hint?: string;
}

interface QuizAnswer {
  id: string;
  text: string;
  correct: boolean;
}
```

### Usage in Your Application

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { EducationalAssistantComponent } from './educational-assistant.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EducationalAssistantComponent],
  template: `<app-educational-assistant></app-educational-assistant>`
})
export class AppComponent { }
```

### Module Configuration

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
  ]
};
```

## Features Demonstrated

### Adaptive Teaching
- Multiple teaching modes (explain, demonstrate, interact, assess)
- Personalized content delivery based on learning style
- Real-time adaptation to student responses
- Encouraging feedback and emotional support

### Interactive Learning
- Visual aids and diagrams for different learning styles
- Code examples with syntax highlighting
- Step-by-step explanations with gesture emphasis
- Interactive quizzes with immediate feedback

### Progress Tracking
- Comprehensive student profile management
- Learning progress visualization
- Achievement system for motivation
- Performance analysis with recommendations

### Accessibility Features
- Adjustable speech speed and audio preferences
- Visual aids that can be toggled on/off
- Multiple interaction modes for different abilities
- Cultural adaptation for diverse learners

## Integration Notes

This educational assistant can be integrated with:
- Learning Management Systems (LMS)
- Educational content platforms
- Assessment and grading systems
- Student information systems
- Parent/teacher communication platforms

The component is designed to be highly educational and can adapt to various subjects and learning levels while maintaining engagement and motivation.