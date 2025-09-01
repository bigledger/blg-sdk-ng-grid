# Customer Service Bot Example

A complete implementation of an intelligent customer service avatar with natural language processing, conversation management, and empathetic responses.

## Overview

This example demonstrates how to build a sophisticated customer service avatar that can handle inquiries, provide support, maintain conversation context, and deliver empathetic customer experiences. It integrates 2D avatar rendering, TTS, conversation AI, and customer service workflows.

## Features

- **Natural Conversation Flow**: Context-aware dialogue management
- **Emotion Recognition**: Detect customer sentiment and respond appropriately
- **Knowledge Base Integration**: Access to product and service information
- **Escalation Handling**: Seamless handoff to human agents
- **Multi-language Support**: International customer support
- **Performance Metrics**: Track resolution rates and satisfaction

## Prerequisites

- BigLedger Avatar packages
- AI/NLP service integration (OpenAI, Azure Cognitive Services, etc.)
- Customer service knowledge base
- Ticketing system API (optional)

## Installation

```bash
npm install @bigledger/ng-ui-avatar-core @bigledger/ng-ui-avatar-2d @bigledger/ng-ui-avatar-tts
npm install openai @azure/cognitiveservices-textanalytics
```

## Implementation

### Step 1: Core Service Bot Component

```typescript
// customer-service-bot.component.ts
import { Component, signal, computed, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Avatar2d } from '@bigledger/ng-ui-avatar-2d';
import { AvatarTts } from '@bigledger/ng-ui-avatar-tts';
import { CustomerServiceService } from '../services/customer-service.service';
import { ConversationManager } from '../services/conversation-manager.service';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { SentimentAnalysisService } from '../services/sentiment-analysis.service';

@Component({
  selector: 'app-customer-service-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, Avatar2d, AvatarTts],
  template: `
    <div class="customer-service-container">
      <!-- Header with Bot Info -->
      <div class="bot-header">
        <div class="bot-info">
          <h2>{{ botName() }}</h2>
          <p class="bot-description">{{ botDescription() }}</p>
          <div class="bot-status" [ngClass]="connectionStatus()">
            <div class="status-indicator"></div>
            <span>{{ getStatusText() }}</span>
          </div>
        </div>
        
        <div class="customer-info" *ngIf="currentCustomer()">
          <h3>Customer: {{ currentCustomer()?.name }}</h3>
          <div class="customer-details">
            <span><strong>ID:</strong> {{ currentCustomer()?.id }}</span>
            <span><strong>Tier:</strong> {{ currentCustomer()?.tier }}</span>
            <span><strong>Sentiment:</strong> 
              <span [class]="'sentiment-' + customerSentiment().toLowerCase()">
                {{ customerSentiment() }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Main Chat Interface -->
      <div class="chat-interface">
        <!-- Avatar Display -->
        <div class="avatar-section">
          <ng-ui-avatar-2d
            [configuration]="avatarConfig()"
            [size]="{width: 300, height: 400}"
            [lipSyncEnabled]="true"
            [autoPlay]="true"
            (expressionChanged)="onAvatarExpressionChanged($event)"
            (gestureStarted)="onAvatarGestureStarted($event)">
          </ng-ui-avatar-2d>

          <lib-avatar-tts
            [config]="ttsConfig()"
            [text]="currentBotResponse()"
            [autoPlay]="true"
            (speechStart)="onSpeechStart($event)"
            (speechEnd)="onSpeechEnd($event)"
            (visemeChange)="onVisemeChange($event)"
            (emotionChange)="onEmotionChange($event)">
          </lib-avatar-tts>

          <!-- Avatar Controls -->
          <div class="avatar-controls">
            <button 
              (click)="toggleMute()"
              [class.muted]="isMuted()">
              {{ isMuted() ? '🔇' : '🔊' }} {{ isMuted() ? 'Unmute' : 'Mute' }}
            </button>
            <button (click)="adjustSpeechSpeed()">
              🎛️ Speed: {{ speechSpeed() }}x
            </button>
          </div>
        </div>

        <!-- Conversation Area -->
        <div class="conversation-section">
          <!-- Message History -->
          <div class="message-history" #messageHistory>
            <div 
              *ngFor="let message of conversationHistory(); trackBy: trackMessage"
              class="message"
              [ngClass]="message.sender">
              
              <div class="message-avatar">
                <div class="avatar-icon" [ngClass]="message.sender">
                  {{ message.sender === 'customer' ? '👤' : '🤖' }}
                </div>
              </div>
              
              <div class="message-content">
                <div class="message-header">
                  <span class="sender-name">{{ message.senderName }}</span>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                  <span 
                    *ngIf="message.sentiment" 
                    class="sentiment-indicator"
                    [ngClass]="'sentiment-' + message.sentiment.toLowerCase()">
                    {{ message.sentiment }}
                  </span>
                </div>
                
                <div class="message-text">{{ message.text }}</div>
                
                <!-- Message Actions -->
                <div class="message-actions" *ngIf="message.sender === 'bot'">
                  <button 
                    (click)="repeatMessage(message)"
                    title="Repeat message">
                    🔁
                  </button>
                  <button 
                    *ngIf="message.suggestions?.length"
                    (click)="toggleSuggestions(message)"
                    title="Show suggestions">
                    💡
                  </button>
                </div>
                
                <!-- Quick Suggestions -->
                <div 
                  *ngIf="message.showSuggestions && message.suggestions?.length"
                  class="suggestions">
                  <button 
                    *ngFor="let suggestion of message.suggestions"
                    class="suggestion-btn"
                    (click)="selectSuggestion(suggestion)">
                    {{ suggestion }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div class="message bot" *ngIf="isTyping()">
              <div class="message-avatar">
                <div class="avatar-icon bot">🤖</div>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                  {{ botName() }} is typing...
                </div>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="input-area">
            <!-- Quick Actions -->
            <div class="quick-actions">
              <button 
                *ngFor="let action of quickActions()"
                class="quick-action-btn"
                (click)="executeQuickAction(action)"
                [title]="action.description">
                {{ action.icon }} {{ action.label }}
              </button>
            </div>

            <!-- Message Input -->
            <div class="message-input-container">
              <div class="input-controls">
                <button 
                  (click)="toggleVoiceInput()"
                  [class.active]="isVoiceInputActive()"
                  title="Voice input">
                  🎤
                </button>
                <button 
                  (click)="attachFile()"
                  title="Attach file">
                  📎
                </button>
              </div>
              
              <textarea
                [(ngModel)]="currentMessage"
                (keyup.enter)="sendMessage()"
                (input)="onMessageInput()"
                placeholder="Type your message here..."
                rows="2"
                [disabled]="isProcessing()">
              </textarea>
              
              <button 
                (click)="sendMessage()"
                class="send-btn"
                [disabled]="!canSendMessage()">
                {{ isProcessing() ? '⏳' : '📤' }}
              </button>
            </div>

            <!-- Voice Input Indicator -->
            <div class="voice-input-indicator" *ngIf="isVoiceInputActive()">
              <div class="voice-animation"></div>
              <p>Listening... Speak now</p>
              <button (click)="stopVoiceInput()">Stop</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Side Panel -->
      <div class="side-panel">
        <!-- Conversation Context -->
        <div class="context-section">
          <h3>Conversation Context</h3>
          <div class="context-info">
            <div class="context-item">
              <label>Topic:</label>
              <span>{{ conversationTopic() || 'General Inquiry' }}</span>
            </div>
            <div class="context-item">
              <label>Category:</label>
              <span>{{ conversationCategory() || 'Support' }}</span>
            </div>
            <div class="context-item">
              <label>Priority:</label>
              <span class="priority" [ngClass]="conversationPriority().toLowerCase()">
                {{ conversationPriority() }}
              </span>
            </div>
            <div class="context-item">
              <label>Resolution Status:</label>
              <span>{{ resolutionStatus() }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Insights -->
        <div class="insights-section">
          <h3>Customer Insights</h3>
          <div class="insights-content">
            <div class="insight-item">
              <label>Satisfaction Score:</label>
              <div class="satisfaction-meter">
                <div class="meter-fill" [style.width.%]="satisfactionScore()"></div>
                <span>{{ satisfactionScore() }}%</span>
              </div>
            </div>
            
            <div class="insight-item">
              <label>Interaction Count:</label>
              <span>{{ interactionCount() }}</span>
            </div>
            
            <div class="insight-item">
              <label>Average Response Time:</label>
              <span>{{ averageResponseTime() }}s</span>
            </div>
          </div>
        </div>

        <!-- Knowledge Base Suggestions -->
        <div class="knowledge-section">
          <h3>Suggested Articles</h3>
          <div class="knowledge-suggestions">
            <div 
              *ngFor="let article of suggestedArticles()"
              class="knowledge-item"
              (click)="shareArticle(article)">
              <div class="article-title">{{ article.title }}</div>
              <div class="article-summary">{{ article.summary }}</div>
              <div class="article-relevance">
                Relevance: {{ article.relevance }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Agent Actions -->
        <div class="actions-section">
          <h3>Actions</h3>
          <div class="action-buttons">
            <button 
              (click)="escalateToHuman()"
              class="action-btn escalate"
              [disabled]="!canEscalate()">
              👥 Escalate to Human
            </button>
            
            <button 
              (click)="createTicket()"
              class="action-btn ticket">
              🎫 Create Support Ticket
            </button>
            
            <button 
              (click)="scheduleCallback()"
              class="action-btn callback">
              📞 Schedule Callback
            </button>
            
            <button 
              (click)="endConversation()"
              class="action-btn end">
              ✅ End Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customer-service-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8f9fa;
      font-family: 'Segoe UI', Arial, sans-serif;
    }

    .bot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .bot-info h2 {
      margin: 0 0 5px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .bot-description {
      margin: 0 0 10px 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .bot-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #28a745;
    }

    .bot-status.connecting .status-indicator {
      background: #ffc107;
      animation: pulse 1s infinite;
    }

    .bot-status.offline .status-indicator {
      background: #dc3545;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .customer-info {
      text-align: right;
    }

    .customer-info h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .customer-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      opacity: 0.9;
    }

    .sentiment-positive { color: #28a745; }
    .sentiment-negative { color: #dc3545; }
    .sentiment-neutral { color: #6c757d; }

    .chat-interface {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .avatar-section {
      width: 320px;
      background: white;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }

    .avatar-controls {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .avatar-controls button {
      padding: 8px 12px;
      border: 1px solid #667eea;
      background: white;
      color: #667eea;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .avatar-controls button:hover {
      background: #667eea;
      color: white;
    }

    .avatar-controls button.muted {
      background: #dc3545;
      border-color: #dc3545;
      color: white;
    }

    .conversation-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
    }

    .message-history {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      max-height: calc(100vh - 350px);
    }

    .message {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message-avatar {
      flex-shrink: 0;
    }

    .avatar-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .avatar-icon.customer {
      background: #e3f2fd;
    }

    .avatar-icon.bot {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .message-content {
      flex: 1;
      max-width: calc(100% - 52px);
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 5px;
      font-size: 12px;
    }

    .sender-name {
      font-weight: 600;
      color: #333;
    }

    .message-time {
      color: #666;
    }

    .sentiment-indicator {
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 500;
    }

    .sentiment-indicator.sentiment-positive {
      background: #d4edda;
      color: #155724;
    }

    .sentiment-indicator.sentiment-negative {
      background: #f8d7da;
      color: #721c24;
    }

    .message-text {
      background: #f8f9fa;
      padding: 12px 16px;
      border-radius: 16px;
      margin-bottom: 8px;
      word-wrap: break-word;
      line-height: 1.5;
    }

    .message.bot .message-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .message-actions {
      display: flex;
      gap: 8px;
    }

    .message-actions button {
      background: none;
      border: 1px solid #e0e0e0;
      padding: 4px 8px;
      border-radius: 15px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .message-actions button:hover {
      background: #f8f9fa;
      border-color: #667eea;
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .suggestion-btn {
      background: white;
      border: 1px solid #667eea;
      color: #667eea;
      padding: 6px 12px;
      border-radius: 15px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .suggestion-btn:hover {
      background: #667eea;
      color: white;
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 16px;
      font-style: italic;
      color: #666;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #667eea;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .input-area {
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      margin-bottom: 15px;
      overflow-x: auto;
    }

    .quick-action-btn {
      background: white;
      border: 1px solid #e0e0e0;
      padding: 8px 12px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .quick-action-btn:hover {
      border-color: #667eea;
      background: #f0f8ff;
    }

    .message-input-container {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 25px;
      padding: 12px;
    }

    .input-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .input-controls button {
      width: 32px;
      height: 32px;
      border: none;
      background: #f8f9fa;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .input-controls button:hover {
      background: #e9ecef;
    }

    .input-controls button.active {
      background: #667eea;
      color: white;
    }

    .message-input-container textarea {
      flex: 1;
      border: none;
      outline: none;
      resize: none;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
      padding: 8px 0;
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: #667eea;
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s ease;
    }

    .send-btn:hover:not(:disabled) {
      background: #5a6fd8;
      transform: scale(1.05);
    }

    .send-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .voice-input-indicator {
      text-align: center;
      padding: 20px;
      background: #e8f5e8;
      border-radius: 10px;
      margin-top: 10px;
    }

    .voice-animation {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #28a745;
      margin: 0 auto 10px;
      animation: voicePulse 1s infinite;
    }

    @keyframes voicePulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .side-panel {
      width: 300px;
      background: white;
      border-left: 1px solid #e0e0e0;
      padding: 20px;
      overflow-y: auto;
    }

    .side-panel h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 16px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 5px;
    }

    .context-info, .insights-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 25px;
    }

    .context-item, .insight-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }

    .context-item label, .insight-item label {
      font-weight: 600;
      color: #666;
    }

    .priority.high { color: #dc3545; }
    .priority.medium { color: #ffc107; }
    .priority.low { color: #28a745; }

    .satisfaction-meter {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      max-width: 120px;
    }

    .meter-fill {
      height: 6px;
      background: #28a745;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .knowledge-suggestions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 25px;
    }

    .knowledge-item {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .knowledge-item:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }

    .article-title {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 5px;
      color: #333;
    }

    .article-summary {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
      line-height: 1.3;
    }

    .article-relevance {
      font-size: 11px;
      color: #667eea;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .action-btn {
      padding: 12px 16px;
      border: 1px solid #e0e0e0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      text-align: left;
      transition: all 0.2s ease;
    }

    .action-btn:hover:not(:disabled) {
      border-color: #667eea;
      background: #f0f8ff;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn.escalate {
      border-color: #ffc107;
      color: #856404;
    }

    .action-btn.escalate:hover:not(:disabled) {
      background: #fff3cd;
    }

    .action-btn.end {
      border-color: #28a745;
      color: #155724;
    }

    .action-btn.end:hover:not(:disabled) {
      background: #d4edda;
    }

    @media (max-width: 1024px) {
      .chat-interface {
        flex-direction: column;
      }
      
      .avatar-section {
        width: 100%;
        flex-direction: row;
        padding: 15px;
      }
      
      .side-panel {
        width: 100%;
        max-height: 300px;
      }
    }
  `]
})
export class CustomerServiceBotComponent implements OnInit, OnDestroy {
  // Services
  private customerService = inject(CustomerServiceService);
  private conversationManager = inject(ConversationManager);
  private knowledgeBase = inject(KnowledgeBaseService);
  private sentimentAnalysis = inject(SentimentAnalysisService);

  // View children
  @ViewChild(Avatar2d) avatar!: Avatar2d;
  @ViewChild(AvatarTts) avatarTts!: AvatarTts;

  // Bot configuration
  botName = signal('Sarah - Customer Service Assistant');
  botDescription = signal('I\'m here to help you with any questions or issues you may have.');
  connectionStatus = signal<'online' | 'connecting' | 'offline'>('online');

  // Avatar configuration
  avatarConfig = signal({
    character: {
      name: 'Sarah',
      model: 'young-woman',
      skinTone: 'medium-light',
      hair: { style: 'professional-bob', color: '#654321' },
      clothing: { 
        top: 'business-blouse',
        accessories: ['earrings', 'name-badge']
      }
    },
    animations: {
      blinkFrequency: 3000,
      idleAnimations: true,
      expressiveness: 'professional'
    }
  });

  // TTS configuration
  ttsConfig = signal({
    provider: 'elevenlabs',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    language: 'en-US',
    features: {
      emotionDetection: true,
      gestureGeneration: true,
      empathyMode: true
    },
    personality: {
      warmth: 0.8,
      professionalism: 0.9,
      patience: 0.95
    }
  });

  // Conversation state
  conversationHistory = signal<ConversationMessage[]>([]);
  currentMessage = '';
  currentBotResponse = signal('');
  isTyping = signal(false);
  isProcessing = signal(false);
  isVoiceInputActive = signal(false);
  isMuted = signal(false);
  speechSpeed = signal(1.0);

  // Customer data
  currentCustomer = signal<Customer | null>(null);
  customerSentiment = signal('Neutral');
  conversationTopic = signal('');
  conversationCategory = signal('');
  conversationPriority = signal('Medium');
  resolutionStatus = signal('In Progress');

  // Metrics
  satisfactionScore = signal(85);
  interactionCount = signal(0);
  averageResponseTime = signal(2.3);

  // Knowledge base
  suggestedArticles = signal<KnowledgeArticle[]>([]);

  // Quick actions
  quickActions = signal([
    { id: 'hours', label: 'Hours', icon: '🕐', description: 'Business hours information' },
    { id: 'billing', label: 'Billing', icon: '💳', description: 'Billing and payment help' },
    { id: 'technical', label: 'Tech Support', icon: '🔧', description: 'Technical support' },
    { id: 'returns', label: 'Returns', icon: '📦', description: 'Return policy and process' },
    { id: 'account', label: 'Account', icon: '👤', description: 'Account management' }
  ]);

  // Computed properties
  readonly canSendMessage = computed(() => {
    return this.currentMessage.trim().length > 0 && !this.isProcessing();
  });

  readonly canEscalate = computed(() => {
    return this.conversationHistory().length > 2 && 
           !['Resolved', 'Escalated'].includes(this.resolutionStatus());
  });

  ngOnInit() {
    this.initializeCustomerServiceBot();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.cleanupResources();
  }

  // Initialization
  private initializeCustomerServiceBot() {
    // Load customer data
    this.loadCustomerContext();
    
    // Initialize conversation
    this.startConversation();
    
    // Setup real-time updates
    this.setupRealTimeUpdates();
  }

  private loadInitialData() {
    // Load customer information
    this.customerService.getCurrentCustomer().subscribe(customer => {
      this.currentCustomer.set(customer);
    });

    // Load knowledge base suggestions
    this.knowledgeBase.getTopArticles().subscribe(articles => {
      this.suggestedArticles.set(articles);
    });
  }

  private loadCustomerContext() {
    // Simulate loading customer context
    const mockCustomer: Customer = {
      id: 'CUST-12345',
      name: 'John Smith',
      tier: 'Premium',
      previousInteractions: 3,
      preferredLanguage: 'English',
      timezone: 'EST'
    };
    
    this.currentCustomer.set(mockCustomer);
    this.interactionCount.set(mockCustomer.previousInteractions);
  }

  private startConversation() {
    // Initial greeting
    const greeting = this.getPersonalizedGreeting();
    this.addBotMessage(greeting, {
      suggestions: [
        'I need help with my order',
        'Billing question',
        'Technical support',
        'General information'
      ]
    });
  }

  private getPersonalizedGreeting(): string {
    const customer = this.currentCustomer();
    const timeOfDay = this.getTimeOfDay();
    
    if (customer) {
      return `Good ${timeOfDay}, ${customer.name}! I'm Sarah, your customer service assistant. As a ${customer.tier} customer, I'm here to provide you with the best possible support. How can I help you today?`;
    } else {
      return `Good ${timeOfDay}! I'm Sarah, your customer service assistant. I'm here to help you with any questions or concerns you may have. How can I assist you today?`;
    }
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  // Message handling
  sendMessage() {
    if (!this.canSendMessage()) return;

    const messageText = this.currentMessage.trim();
    this.addCustomerMessage(messageText);
    this.currentMessage = '';

    this.processCustomerMessage(messageText);
  }

  private addCustomerMessage(text: string) {
    const message: ConversationMessage = {
      id: this.generateMessageId(),
      sender: 'customer',
      senderName: this.currentCustomer()?.name || 'Customer',
      text: text,
      timestamp: Date.now(),
      sentiment: undefined // Will be analyzed
    };

    this.conversationHistory.update(history => [...history, message]);
    this.analyzeSentiment(message);
    this.scrollToBottom();
  }

  private addBotMessage(text: string, options?: {
    suggestions?: string[];
    actions?: string[];
    priority?: 'low' | 'medium' | 'high';
  }) {
    const message: ConversationMessage = {
      id: this.generateMessageId(),
      sender: 'bot',
      senderName: this.botName(),
      text: text,
      timestamp: Date.now(),
      suggestions: options?.suggestions,
      actions: options?.actions,
      priority: options?.priority
    };

    this.conversationHistory.update(history => [...history, message]);
    this.currentBotResponse.set(text);
    
    // Update conversation metrics
    this.updateMetrics(message);
    this.scrollToBottom();
  }

  private async processCustomerMessage(text: string) {
    this.isProcessing.set(true);
    this.isTyping.set(true);

    try {
      // Analyze message intent and context
      const analysis = await this.conversationManager.analyzeMessage(text, {
        customerContext: this.currentCustomer(),
        conversationHistory: this.conversationHistory()
      });

      // Update conversation context
      this.updateConversationContext(analysis);

      // Generate appropriate response
      const response = await this.generateResponse(analysis);

      // Simulate processing delay for natural feel
      setTimeout(() => {
        this.isTyping.set(false);
        this.addBotMessage(response.text, {
          suggestions: response.suggestions,
          actions: response.actions
        });
        
        // Update avatar expression based on response tone
        this.updateAvatarExpression(response.emotion);
        
        this.isProcessing.set(false);
      }, 1000 + Math.random() * 1500);

    } catch (error) {
      this.isTyping.set(false);
      this.isProcessing.set(false);
      this.handleError(error);
    }
  }

  private async generateResponse(analysis: MessageAnalysis): Promise<BotResponse> {
    // Use conversation manager to generate contextual response
    return this.conversationManager.generateResponse(analysis, {
      personality: this.ttsConfig().personality,
      knowledgeBase: await this.knowledgeBase.searchRelevant(analysis.intent),
      customerTier: this.currentCustomer()?.tier
    });
  }

  private updateConversationContext(analysis: MessageAnalysis) {
    this.conversationTopic.set(analysis.topic || 'General Inquiry');
    this.conversationCategory.set(analysis.category || 'Support');
    
    // Update priority based on sentiment and urgency
    if (analysis.urgency === 'high' || analysis.sentiment === 'Negative') {
      this.conversationPriority.set('High');
    } else if (analysis.urgency === 'medium') {
      this.conversationPriority.set('Medium');
    } else {
      this.conversationPriority.set('Low');
    }

    // Update suggested articles based on topic
    this.updateSuggestedArticles(analysis.topic);
  }

  private updateSuggestedArticles(topic: string) {
    this.knowledgeBase.searchByTopic(topic).subscribe(articles => {
      this.suggestedArticles.set(articles);
    });
  }

  // Sentiment analysis
  private analyzeSentiment(message: ConversationMessage) {
    this.sentimentAnalysis.analyze(message.text).subscribe(result => {
      // Update message with sentiment
      this.conversationHistory.update(history => 
        history.map(msg => 
          msg.id === message.id 
            ? { ...msg, sentiment: result.sentiment }
            : msg
        )
      );

      // Update overall customer sentiment
      this.customerSentiment.set(result.sentiment);
      
      // Update satisfaction score based on sentiment
      this.updateSatisfactionScore(result);
    });
  }

  private updateSatisfactionScore(sentimentResult: SentimentResult) {
    const current = this.satisfactionScore();
    let adjustment = 0;

    switch (sentimentResult.sentiment) {
      case 'Positive':
        adjustment = 5;
        break;
      case 'Negative':
        adjustment = -10;
        break;
      case 'Neutral':
        adjustment = 1;
        break;
    }

    const newScore = Math.max(0, Math.min(100, current + adjustment));
    this.satisfactionScore.set(newScore);
  }

  // Avatar and TTS events
  onAvatarExpressionChanged(expression: any) {
    console.log('Avatar expression changed:', expression.name);
  }

  onAvatarGestureStarted(gesture: any) {
    console.log('Avatar gesture started:', gesture.name);
  }

  onSpeechStart(event: any) {
    console.log('TTS speech started:', event);
  }

  onSpeechEnd(event: any) {
    console.log('TTS speech ended:', event);
  }

  onVisemeChange(event: any) {
    // Avatar automatically handles lip sync
  }

  onEmotionChange(event: any) {
    // Update avatar expression based on detected emotion
    this.updateAvatarExpression(event.emotion);
  }

  private updateAvatarExpression(emotion: string) {
    const expressionMap: { [key: string]: string } = {
      'happy': 'smile',
      'sad': 'concerned',
      'angry': 'serious',
      'surprised': 'surprised',
      'neutral': 'professional',
      'empathetic': 'understanding'
    };

    const expression = expressionMap[emotion] || 'professional';
    
    if (this.avatar) {
      // this.avatar.changeExpression(expression);
    }
  }

  // Quick actions
  executeQuickAction(action: any) {
    const responses: { [key: string]: string } = {
      'hours': 'Our customer service is available Monday through Friday, 9 AM to 6 PM EST, and Saturday 10 AM to 4 PM EST. We\'re closed on Sundays and major holidays. Is there anything specific I can help you with during our business hours?',
      
      'billing': 'I\'d be happy to help you with billing questions. I can assist with payment methods, billing cycles, invoice questions, and payment issues. What specific billing matter can I help you with today?',
      
      'technical': 'I\'m here to help with technical support. I can troubleshoot common issues, guide you through setup processes, and connect you with specialized technical support if needed. What technical issue are you experiencing?',
      
      'returns': 'I can help you with returns and exchanges. We offer a 30-day return policy for most items. I can help you initiate a return, check return status, or answer questions about our return policy. What would you like to return?',
      
      'account': 'I can assist you with account management including updating your information, password resets, account settings, and subscription changes. What account-related help do you need today?'
    };

    const response = responses[action.id];
    if (response) {
      this.addBotMessage(response);
    }
  }

  // Voice input
  toggleVoiceInput() {
    if (this.isVoiceInputActive()) {
      this.stopVoiceInput();
    } else {
      this.startVoiceInput();
    }
  }

  private startVoiceInput() {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        this.isVoiceInputActive.set(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.currentMessage = transcript;
        this.sendMessage();
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.stopVoiceInput();
      };

      recognition.onend = () => {
        this.isVoiceInputActive.set(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser');
    }
  }

  stopVoiceInput() {
    this.isVoiceInputActive.set(false);
  }

  // File attachment
  attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx,.txt';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleFileAttachment(file);
      }
    };
    
    input.click();
  }

  private handleFileAttachment(file: File) {
    // Handle file upload and processing
    console.log('File attached:', file.name);
    this.addCustomerMessage(`[Attached file: ${file.name}]`);
    
    // Process file content if applicable
    this.processAttachedFile(file);
  }

  private processAttachedFile(file: File) {
    // Implement file processing logic
    this.addBotMessage(`I've received your file "${file.name}". I'm analyzing it now and will provide assistance based on its contents.`);
  }

  // Message actions
  repeatMessage(message: ConversationMessage) {
    this.currentBotResponse.set(message.text);
    this.avatarTts?.speak(message.text);
  }

  toggleSuggestions(message: ConversationMessage) {
    this.conversationHistory.update(history =>
      history.map(msg =>
        msg.id === message.id
          ? { ...msg, showSuggestions: !msg.showSuggestions }
          : msg
      )
    );
  }

  selectSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    this.sendMessage();
  }

  shareArticle(article: KnowledgeArticle) {
    const message = `I found this helpful article that might answer your question: "${article.title}"\n\n${article.summary}\n\nWould you like me to explain anything specific from this article?`;
    this.addBotMessage(message);
  }

  // Agent actions
  escalateToHuman() {
    if (!this.canEscalate()) return;

    const escalationMessage = `I understand this issue requires additional attention. I'm connecting you with one of our human specialists who will be able to provide more personalized assistance. Please hold for just a moment while I transfer you.`;
    
    this.addBotMessage(escalationMessage);
    this.resolutionStatus.set('Escalated');
    
    // Implement actual escalation logic
    this.customerService.escalateToHuman({
      customerId: this.currentCustomer()?.id,
      conversationHistory: this.conversationHistory(),
      priority: this.conversationPriority(),
      topic: this.conversationTopic()
    }).subscribe(result => {
      console.log('Escalation initiated:', result);
    });
  }

  createTicket() {
    const ticketData = {
      customerId: this.currentCustomer()?.id,
      subject: this.conversationTopic(),
      description: this.summarizeConversation(),
      priority: this.conversationPriority(),
      category: this.conversationCategory()
    };

    this.customerService.createTicket(ticketData).subscribe(ticket => {
      const message = `I've created support ticket #${ticket.id} for you. You'll receive an email confirmation shortly, and our team will follow up within 24 hours. Is there anything else I can help you with today?`;
      this.addBotMessage(message);
    });
  }

  scheduleCallback() {
    const message = 'I can schedule a callback for you. Our team will contact you within the next 2-4 hours during business hours. What\'s the best phone number to reach you at?';
    this.addBotMessage(message, {
      suggestions: [
        'Use my account phone number',
        'I\'ll provide a different number',
        'Schedule for a specific time'
      ]
    });
  }

  endConversation() {
    const closingMessage = `Thank you for contacting us today! I hope I was able to help resolve your questions. If you need any further assistance, please don't hesitate to reach out. Have a wonderful ${this.getTimeOfDay()}!`;
    
    this.addBotMessage(closingMessage);
    this.resolutionStatus.set('Resolved');
    
    // Save conversation summary
    this.saveConversationSummary();
  }

  // Audio controls
  toggleMute() {
    this.isMuted.set(!this.isMuted());
    if (this.avatarTts) {
      // this.avatarTts.setMuted(this.isMuted());
    }
  }

  adjustSpeechSpeed() {
    const speeds = [0.8, 1.0, 1.2, 1.5];
    const currentIndex = speeds.indexOf(this.speechSpeed());
    const nextIndex = (currentIndex + 1) % speeds.length;
    this.speechSpeed.set(speeds[nextIndex]);
    
    if (this.avatarTts) {
      // this.avatarTts.setSpeechSpeed(this.speechSpeed());
    }
  }

  // Message input handling
  onMessageInput() {
    // Handle typing indicators, auto-suggestions, etc.
    this.updateTypingStatus();
  }

  private updateTypingStatus() {
    // Implement typing status logic if needed
  }

  // Utility methods
  private updateMetrics(message: ConversationMessage) {
    this.interactionCount.update(count => count + 1);
    
    // Calculate average response time
    const responseTime = this.calculateResponseTime();
    this.averageResponseTime.set(responseTime);
  }

  private calculateResponseTime(): number {
    // Implement response time calculation
    return 2.3; // Mock value
  }

  private summarizeConversation(): string {
    return this.conversationHistory()
      .map(msg => `${msg.senderName}: ${msg.text}`)
      .join('\n');
  }

  private saveConversationSummary() {
    const summary = {
      customerId: this.currentCustomer()?.id,
      topic: this.conversationTopic(),
      category: this.conversationCategory(),
      resolution: this.resolutionStatus(),
      satisfactionScore: this.satisfactionScore(),
      conversationLength: this.conversationHistory().length,
      summary: this.summarizeConversation()
    };

    this.customerService.saveConversationSummary(summary).subscribe();
  }

  private setupRealTimeUpdates() {
    // Setup WebSocket or polling for real-time updates
  }

  private cleanupResources() {
    // Cleanup any resources, connections, etc.
  }

  private handleError(error: any) {
    console.error('Customer service bot error:', error);
    this.addBotMessage('I apologize, but I encountered an issue processing your request. Let me try to help you in another way, or I can connect you with a human agent.');
  }

  // Helper methods
  private generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private scrollToBottom() {
    // Implement smooth scrolling to bottom of message history
    setTimeout(() => {
      const messageHistory = document.querySelector('.message-history');
      if (messageHistory) {
        messageHistory.scrollTop = messageHistory.scrollHeight;
      }
    }, 100);
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getStatusText(): string {
    const statusMap = {
      online: 'Online',
      connecting: 'Connecting...',
      offline: 'Offline'
    };
    return statusMap[this.connectionStatus()];
  }

  trackMessage(index: number, message: ConversationMessage): string {
    return message.id;
  }
}

// Supporting interfaces
interface ConversationMessage {
  id: string;
  sender: 'customer' | 'bot';
  senderName: string;
  text: string;
  timestamp: number;
  sentiment?: string;
  suggestions?: string[];
  actions?: string[];
  priority?: 'low' | 'medium' | 'high';
  showSuggestions?: boolean;
}

interface Customer {
  id: string;
  name: string;
  tier: 'Basic' | 'Premium' | 'Enterprise';
  previousInteractions: number;
  preferredLanguage: string;
  timezone: string;
}

interface MessageAnalysis {
  intent: string;
  topic: string;
  category: string;
  sentiment: string;
  urgency: 'low' | 'medium' | 'high';
  entities: any[];
}

interface BotResponse {
  text: string;
  emotion: string;
  suggestions?: string[];
  actions?: string[];
}

interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  relevance: number;
  category: string;
}

interface SentimentResult {
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  emotions: string[];
}
```

### Step 2: Supporting Services

```typescript
// services/customer-service.service.ts
@Injectable({
  providedIn: 'root'
})
export class CustomerServiceService {
  private apiUrl = '/api/customer-service';

  constructor(private http: HttpClient) {}

  getCurrentCustomer(): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customer/current`);
  }

  escalateToHuman(escalationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/escalate`, escalationData);
  }

  createTicket(ticketData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets`, ticketData);
  }

  saveConversationSummary(summary: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversations/summary`, summary);
  }
}

// services/conversation-manager.service.ts
@Injectable({
  providedIn: 'root'
})
export class ConversationManager {
  constructor(private http: HttpClient) {}

  async analyzeMessage(text: string, context: any): Promise<MessageAnalysis> {
    // Implementation for message analysis using NLP services
    const response = await this.http.post<MessageAnalysis>('/api/nlp/analyze', {
      text,
      context
    }).toPromise();
    
    return response!;
  }

  async generateResponse(analysis: MessageAnalysis, options: any): Promise<BotResponse> {
    // Implementation for response generation
    const response = await this.http.post<BotResponse>('/api/nlp/generate-response', {
      analysis,
      options
    }).toPromise();
    
    return response!;
  }
}
```

## Usage Instructions

### Basic Setup

1. **Install required packages** and dependencies
2. **Configure AI/NLP services** (OpenAI, Azure, etc.)
3. **Set up knowledge base** integration
4. **Configure customer data** sources
5. **Deploy and test** the service bot

### Customization

```typescript
// Customize bot personality
const customPersonality = {
  warmth: 0.9,        // How friendly and warm
  professionalism: 0.8, // How formal and professional
  patience: 0.95,     // How patient with difficult customers
  empathy: 0.9,       // How empathetic to customer emotions
  proactiveness: 0.7  // How proactive in offering help
};

// Apply to TTS config
this.ttsConfig.update(config => ({
  ...config,
  personality: customPersonality
}));
```

### Integration Examples

```typescript
// Integrate with CRM system
async loadCustomerFromCRM(customerId: string) {
  const customer = await this.crmService.getCustomer(customerId);
  this.currentCustomer.set({
    ...customer,
    previousInteractions: await this.getInteractionHistory(customerId)
  });
}

// Integrate with ticketing system
async syncWithTicketingSystem(ticketData: any) {
  const ticket = await this.ticketingService.createTicket(ticketData);
  return ticket;
}
```

## Next Steps

- Explore [Virtual Presenter Example](./virtual-presenter.md)
- Learn about [Advanced TTS Features](../features/lip-sync.md)
- Review [Performance Optimization](../MIGRATION.md)

This customer service bot provides a comprehensive foundation for building intelligent, empathetic customer support experiences with natural conversation flow and professional avatar interactions.