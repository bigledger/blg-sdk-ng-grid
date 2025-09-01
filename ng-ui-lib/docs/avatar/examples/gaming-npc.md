# Gaming NPC Example

This example demonstrates creating an interactive Non-Player Character (NPC) for games using advanced avatar technology. The NPC can engage in dynamic conversations, provide quests, react to player actions, and maintain persistent relationships.

## Overview

The Gaming NPC features:
- Dynamic dialogue system with branching conversations
- Quest management and progression tracking
- Emotional reactions based on player interactions
- Persistent relationship and reputation system
- Contextual responses based on game state
- Voice acting with emotional range and character voices

## Implementation

### Component Setup

```typescript
import { Component, OnInit, signal, computed, effect, viewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Avatar3DComponent } from '@ng-ui-lib/avatar-3d';
import { AvatarTTSComponent } from '@ng-ui-lib/avatar-tts';
import { 
  AvatarConfig, 
  NPCPersonality, 
  DialogueNode, 
  Quest, 
  PlayerRelationship,
  GameContext,
  NPCReaction
} from '@ng-ui-lib/avatar-core';

@Component({
  selector: 'app-gaming-npc',
  standalone: true,
  imports: [CommonModule, FormsModule, Avatar3DComponent, AvatarTTSComponent],
  template: `
    <div class="game-interface">
      <!-- NPC Avatar Display -->
      <div class="npc-container">
        <avatar-3d 
          [config]="npcConfig()"
          [state]="npcState()"
          (expressionChange)="onExpressionChange($event)"
          (gestureComplete)="onGestureComplete($event)"
          (speechEnd)="onSpeechEnd()"
          (interactionStart)="onInteractionStart()"
          #npcAvatar>
        </avatar-3d>
        
        <!-- NPC Status Display -->
        <div class="npc-status">
          <div class="npc-nameplate">
            <h3>{{ npcProfile().name }}</h3>
            <span class="npc-title">{{ npcProfile().title }}</span>
          </div>
          
          <div class="relationship-indicator">
            <span class="relationship-label">{{ getRelationshipLabel() }}</span>
            <div class="relationship-bar">
              <div 
                class="relationship-fill" 
                [class]="getRelationshipClass()"
                [style.width.%]="getRelationshipPercentage()">
              </div>
            </div>
          </div>
          
          <div class="npc-mood">
            <span class="mood-icon">{{ getMoodIcon() }}</span>
            <span class="mood-text">{{ currentMood() }}</span>
          </div>
        </div>
      </div>

      <!-- Dialogue Interface -->
      <div class="dialogue-panel" [class.active]="showDialogue()">
        <div class="dialogue-content">
          <!-- Current NPC Message -->
          @if (currentDialogue()) {
            <div class="npc-message">
              <div class="message-bubble npc">
                <div class="speaker">{{ npcProfile().name }}</div>
                <div class="message-text">{{ currentDialogue()?.text }}</div>
                @if (currentDialogue()?.emotion) {
                  <div class="emotion-indicator">
                    <span class="emotion">{{ currentDialogue()?.emotion }}</span>
                  </div>
                }
              </div>
            </div>
          }
          
          <!-- Dialogue History -->
          <div class="dialogue-history">
            @for (message of dialogueHistory(); track message.id) {
              <div class="message" [class]="message.speaker">
                <div class="message-bubble" [class]="message.speaker">
                  <div class="speaker">{{ message.speaker === 'player' ? 'You' : npcProfile().name }}</div>
                  <div class="message-text">{{ message.text }}</div>
                  @if (message.timestamp) {
                    <div class="timestamp">{{ formatTime(message.timestamp) }}</div>
                  }
                </div>
              </div>
            }
          </div>
          
          <!-- Player Response Options -->
          @if (currentDialogue()?.responses && !isProcessing()) {
            <div class="response-options">
              <h4>Choose your response:</h4>
              @for (response of currentDialogue()?.responses; track response.id) {
                <button 
                  class="response-option"
                  [class]="getResponseClass(response)"
                  [disabled]="!isResponseAvailable(response)"
                  (click)="selectResponse(response)">
                  
                  <div class="response-text">{{ response.text }}</div>
                  
                  @if (response.requirements) {
                    <div class="response-requirements">
                      @for (req of response.requirements; track req.type) {
                        <span class="requirement" [class.met]="checkRequirement(req)">
                          {{ getRequirementText(req) }}
                        </span>
                      }
                    </div>
                  }
                  
                  @if (response.consequences) {
                    <div class="response-consequences">
                      @for (cons of response.consequences; track cons.type) {
                        <span class="consequence" [class]="cons.type">
                          {{ getConsequenceText(cons) }}
                        </span>
                      }
                    </div>
                  }
                </button>
              }
            </div>
          }
          
          <!-- Processing Indicator -->
          @if (isProcessing()) {
            <div class="processing-indicator">
              <div class="thinking-dots">
                <span></span><span></span><span></span>
              </div>
              <span class="processing-text">{{ npcProfile().name }} is thinking...</span>
            </div>
          }
        </div>
        
        <!-- Dialogue Controls -->
        <div class="dialogue-controls">
          <button 
            (click)="endConversation()" 
            class="btn-secondary"
            [disabled]="isProcessing()">
            End Conversation
          </button>
          
          <button 
            (click)="showQuestLog()" 
            class="btn-accent"
            [disabled]="activeQuests().length === 0">
            Quests ({{ activeQuests().length }})
          </button>
          
          <button 
            (click)="repeatLastMessage()" 
            class="btn-secondary"
            [disabled]="!currentDialogue()">
            Repeat
          </button>
        </div>
      </div>

      <!-- Quest Panel -->
      @if (showQuests()) {
        <div class="quest-panel">
          <div class="quest-header">
            <h3>Active Quests</h3>
            <button (click)="closeQuestLog()" class="btn-close">×</button>
          </div>
          
          <div class="quest-list">
            @for (quest of activeQuests(); track quest.id) {
              <div class="quest-item" [class]="quest.priority">
                <div class="quest-main">
                  <h4>{{ quest.title }}</h4>
                  <p>{{ quest.description }}</p>
                  
                  <div class="quest-objectives">
                    @for (obj of quest.objectives; track obj.id) {
                      <div class="objective" [class.completed]="obj.completed">
                        <span class="objective-icon">{{ obj.completed ? '✅' : '⭕' }}</span>
                        <span class="objective-text">{{ obj.description }}</span>
                        @if (obj.progress !== undefined) {
                          <div class="objective-progress">
                            <div class="progress-bar">
                              <div 
                                class="progress-fill" 
                                [style.width.%]="(obj.progress / obj.target!) * 100">
                              </div>
                            </div>
                            <span class="progress-text">{{ obj.progress }}/{{ obj.target }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
                
                <div class="quest-rewards">
                  <h5>Rewards</h5>
                  @for (reward of quest.rewards; track reward.type) {
                    <div class="reward" [class]="reward.type">
                      <span class="reward-icon">{{ getRewardIcon(reward.type) }}</span>
                      <span class="reward-text">{{ reward.description }}</span>
                      @if (reward.amount) {
                        <span class="reward-amount">{{ reward.amount }}</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Interaction Prompts -->
      @if (showInteractionPrompt()) {
        <div class="interaction-prompt">
          <div class="prompt-content">
            <span class="prompt-icon">💬</span>
            <span class="prompt-text">Press [E] to talk to {{ npcProfile().name }}</span>
          </div>
        </div>
      }

      <!-- Debug Panel (Development) -->
      @if (debugMode()) {
        <div class="debug-panel">
          <h4>Debug Information</h4>
          <div class="debug-info">
            <div>Current Node: {{ currentDialogueNodeId() }}</div>
            <div>Relationship: {{ playerRelationship().level }} ({{ playerRelationship().points }})</div>
            <div>Mood: {{ currentMood() }}</div>
            <div>Context: {{ gameContext().location }}</div>
            <div>Flags: {{ Object.keys(gameContext().flags).join(', ') }}</div>
          </div>
          
          <div class="debug-controls">
            <button (click)="resetRelationship()" class="btn-small">Reset Relationship</button>
            <button (click)="completeAllQuests()" class="btn-small">Complete Quests</button>
            <button (click)="changeMood('happy')" class="btn-small">Happy Mood</button>
            <button (click)="changeMood('angry')" class="btn-small">Angry Mood</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .game-interface {
      display: flex;
      height: 100vh;
      background: linear-gradient(135deg, #2c1810 0%, #8B4513 50%, #DAA520 100%);
      position: relative;
      overflow: hidden;
    }

    .npc-container {
      flex: 0 0 400px;
      display: flex;
      flex-direction: column;
      padding: 20px;
      position: relative;
    }

    avatar-3d {
      flex: 1;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 20px;
      border: 2px solid #8B4513;
      box-shadow: 0 0 30px rgba(139, 69, 19, 0.5);
    }

    .npc-status {
      margin-top: 15px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 15px;
      padding: 15px;
      border: 1px solid #8B4513;
    }

    .npc-nameplate {
      text-align: center;
      margin-bottom: 15px;
    }

    .npc-nameplate h3 {
      color: #DAA520;
      margin: 0;
      font-size: 1.4em;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
    }

    .npc-title {
      color: #CD853F;
      font-style: italic;
      font-size: 0.9em;
    }

    .relationship-indicator {
      margin-bottom: 15px;
    }

    .relationship-label {
      color: white;
      font-size: 0.9em;
      display: block;
      margin-bottom: 5px;
    }

    .relationship-bar {
      height: 8px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #555;
    }

    .relationship-fill {
      height: 100%;
      transition: width 0.5s ease;
    }

    .relationship-fill.hostile {
      background: linear-gradient(90deg, #DC143C, #B22222);
    }

    .relationship-fill.unfriendly {
      background: linear-gradient(90deg, #FF6347, #FF4500);
    }

    .relationship-fill.neutral {
      background: linear-gradient(90deg, #708090, #696969);
    }

    .relationship-fill.friendly {
      background: linear-gradient(90deg, #32CD32, #228B22);
    }

    .relationship-fill.allied {
      background: linear-gradient(90deg, #4169E1, #0000CD);
    }

    .npc-mood {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
    }

    .mood-icon {
      font-size: 1.2em;
    }

    /* Dialogue Panel Styles */
    .dialogue-panel {
      position: fixed;
      bottom: -400px;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      max-width: 90vw;
      height: 380px;
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #8B4513;
      border-radius: 20px 20px 0 0;
      transition: bottom 0.3s ease;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .dialogue-panel.active {
      bottom: 0;
    }

    .dialogue-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .npc-message {
      display: flex;
      justify-content: flex-start;
    }

    .message-bubble {
      max-width: 70%;
      padding: 15px 20px;
      border-radius: 20px;
      position: relative;
      margin: 5px 0;
    }

    .message-bubble.npc {
      background: linear-gradient(135deg, #8B4513, #A0522D);
      border: 1px solid #DAA520;
      color: white;
    }

    .message-bubble.player {
      background: linear-gradient(135deg, #2F4F4F, #708090);
      border: 1px solid #4682B4;
      color: white;
      margin-left: auto;
    }

    .speaker {
      font-weight: bold;
      font-size: 0.9em;
      color: #DAA520;
      margin-bottom: 5px;
    }

    .message-text {
      line-height: 1.5;
    }

    .emotion-indicator {
      margin-top: 8px;
      text-align: right;
    }

    .emotion {
      background: rgba(218, 165, 32, 0.3);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.8em;
      font-style: italic;
    }

    .timestamp {
      font-size: 0.7em;
      color: #999;
      margin-top: 5px;
      text-align: right;
    }

    .dialogue-history {
      max-height: 150px;
      overflow-y: auto;
      margin-bottom: 15px;
    }

    .response-options {
      margin-top: auto;
    }

    .response-options h4 {
      color: #DAA520;
      margin: 0 0 15px;
      font-size: 1.1em;
    }

    .response-option {
      display: block;
      width: 100%;
      background: rgba(47, 79, 79, 0.8);
      border: 2px solid #4682B4;
      border-radius: 10px;
      padding: 12px 15px;
      margin-bottom: 10px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
    }

    .response-option:hover:not(:disabled) {
      background: rgba(70, 130, 180, 0.3);
      border-color: #87CEEB;
      transform: translateX(5px);
    }

    .response-option:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: rgba(105, 105, 105, 0.5);
      border-color: #696969;
    }

    .response-option.aggressive {
      border-color: #DC143C;
    }

    .response-option.aggressive:hover:not(:disabled) {
      background: rgba(220, 20, 60, 0.2);
      border-color: #FF1493;
    }

    .response-option.diplomatic {
      border-color: #32CD32;
    }

    .response-option.diplomatic:hover:not(:disabled) {
      background: rgba(50, 205, 50, 0.2);
      border-color: #7FFF00;
    }

    .response-option.deceptive {
      border-color: #9932CC;
    }

    .response-option.deceptive:hover:not(:disabled) {
      background: rgba(153, 50, 204, 0.2);
      border-color: #DA70D6;
    }

    .response-text {
      font-size: 1em;
      margin-bottom: 5px;
    }

    .response-requirements {
      display: flex;
      gap: 8px;
      margin: 5px 0;
      flex-wrap: wrap;
    }

    .requirement {
      background: rgba(255, 0, 0, 0.3);
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 0.8em;
      border: 1px solid #DC143C;
    }

    .requirement.met {
      background: rgba(0, 255, 0, 0.3);
      border-color: #32CD32;
    }

    .response-consequences {
      display: flex;
      gap: 8px;
      margin-top: 5px;
      flex-wrap: wrap;
    }

    .consequence {
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 0.8em;
    }

    .consequence.relationship {
      background: rgba(218, 165, 32, 0.3);
      border: 1px solid #DAA520;
    }

    .consequence.reputation {
      background: rgba(138, 43, 226, 0.3);
      border: 1px solid #9932CC;
    }

    .consequence.quest {
      background: rgba(50, 205, 50, 0.3);
      border: 1px solid #32CD32;
    }

    .processing-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #DAA520;
      font-style: italic;
      margin: 20px 0;
    }

    .thinking-dots span {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #DAA520;
      margin: 0 2px;
      animation: thinking 1.5s infinite ease-in-out;
    }

    .thinking-dots span:nth-child(1) { animation-delay: 0s; }
    .thinking-dots span:nth-child(2) { animation-delay: 0.5s; }
    .thinking-dots span:nth-child(3) { animation-delay: 1s; }

    @keyframes thinking {
      0%, 60%, 100% { opacity: 0.3; }
      30% { opacity: 1; }
    }

    .dialogue-controls {
      display: flex;
      gap: 10px;
      padding: 15px 20px;
      border-top: 1px solid #555;
      background: rgba(0, 0, 0, 0.7);
    }

    /* Quest Panel Styles */
    .quest-panel {
      position: fixed;
      right: 20px;
      top: 20px;
      width: 400px;
      max-height: 80vh;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #8B4513;
      border-radius: 15px;
      color: white;
      overflow-y: auto;
    }

    .quest-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #555;
      background: rgba(139, 69, 19, 0.3);
    }

    .quest-header h3 {
      margin: 0;
      color: #DAA520;
    }

    .btn-close {
      background: none;
      border: none;
      color: #DAA520;
      font-size: 1.5em;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      background: rgba(218, 165, 32, 0.2);
    }

    .quest-list {
      padding: 15px;
    }

    .quest-item {
      background: rgba(47, 79, 79, 0.5);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 15px;
      border-left: 4px solid;
    }

    .quest-item.main {
      border-left-color: #DAA520;
    }

    .quest-item.side {
      border-left-color: #4682B4;
    }

    .quest-item.urgent {
      border-left-color: #DC143C;
    }

    .quest-main h4 {
      margin: 0 0 8px;
      color: #DAA520;
    }

    .quest-main p {
      margin: 0 0 15px;
      color: #CCCCCC;
      font-size: 0.9em;
    }

    .quest-objectives {
      margin-bottom: 15px;
    }

    .objective {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 0.9em;
    }

    .objective.completed {
      opacity: 0.6;
      text-decoration: line-through;
    }

    .objective-progress {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-bar {
      width: 60px;
      height: 6px;
      background: #333;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #32CD32, #228B22);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.8em;
      color: #999;
    }

    .quest-rewards h5 {
      margin: 0 0 10px;
      color: #DAA520;
      font-size: 0.9em;
    }

    .reward {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
      font-size: 0.8em;
    }

    .reward-icon {
      font-size: 1.1em;
    }

    .reward-amount {
      margin-left: auto;
      font-weight: bold;
      color: #DAA520;
    }

    /* Interaction Prompt */
    .interaction-prompt {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #DAA520;
      border-radius: 15px;
      padding: 20px 30px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
      50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
    }

    .prompt-content {
      display: flex;
      align-items: center;
      gap: 15px;
      color: white;
      font-size: 1.1em;
    }

    .prompt-icon {
      font-size: 1.5em;
    }

    /* Debug Panel */
    .debug-panel {
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.9);
      border: 1px solid #555;
      border-radius: 8px;
      padding: 15px;
      color: white;
      font-family: monospace;
      font-size: 0.8em;
      max-width: 300px;
    }

    .debug-info div {
      margin-bottom: 5px;
    }

    .debug-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    /* Button Styles */
    .btn-primary {
      background: #DAA520;
      color: #2c1810;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s ease;
    }

    .btn-primary:hover {
      background: #FFD700;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    .btn-accent {
      background: #8B4513;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s ease;
    }

    .btn-accent:hover:not(:disabled) {
      background: #A0522D;
    }

    .btn-small {
      background: #4682B4;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8em;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .game-interface {
        flex-direction: column;
      }
      
      .npc-container {
        flex: 0 0 200px;
      }
      
      .quest-panel {
        width: 90vw;
        left: 5vw;
        right: auto;
      }
      
      .dialogue-panel {
        width: 95vw;
      }
    }
  `]
})
export class GamingNPCComponent implements OnInit {
  // Input properties
  @Input() npcId = 'merchant_eldwin';
  @Input() gameContextData: Partial<GameContext> = {};
  
  // Avatar reference
  npcAvatar = viewChild<Avatar3DComponent>('npcAvatar');

  // Core state management
  private _showDialogue = signal(false);
  private _showQuests = signal(false);
  private _showInteractionPrompt = signal(true);
  private _isProcessing = signal(false);
  private _debugMode = signal(false); // Set to true for development
  
  // Dialogue state
  private _currentDialogueNodeId = signal<string | null>('greeting');
  private _dialogueHistory = signal<DialogueMessage[]>([]);
  
  // Game state
  private _gameContext = signal<GameContext>({
    location: 'marketplace',
    timeOfDay: 'afternoon',
    weather: 'clear',
    playerLevel: 15,
    playerGold: 250,
    flags: {
      firstMeeting: false,
      completedTutorial: true,
      hasSpecialItem: false
    }
  });
  
  private _playerRelationship = signal<PlayerRelationship>({
    npcId: 'merchant_eldwin',
    level: 'neutral',
    points: 0,
    interactions: 0,
    lastInteraction: Date.now() - 86400000, // 24 hours ago
    reputation: {
      helpful: 0,
      trustworthy: 0,
      aggressive: 0,
      generous: 0
    }
  });
  
  // NPC state
  private _currentMood = signal<string>('content');
  private _activeQuests = signal<Quest[]>([]);

  // Read-only computed properties
  readonly showDialogue = this._showDialogue.asReadonly();
  readonly showQuests = this._showQuests.asReadonly();
  readonly showInteractionPrompt = this._showInteractionPrompt.asReadonly();
  readonly isProcessing = this._isProcessing.asReadonly();
  readonly debugMode = this._debugMode.asReadonly();
  readonly currentDialogueNodeId = this._currentDialogueNodeId.asReadonly();
  readonly dialogueHistory = this._dialogueHistory.asReadonly();
  readonly gameContext = this._gameContext.asReadonly();
  readonly playerRelationship = this._playerRelationship.asReadonly();
  readonly currentMood = this._currentMood.asReadonly();
  readonly activeQuests = this._activeQuests.asReadonly();

  // Computed properties
  readonly currentDialogue = computed(() => {
    const nodeId = this._currentDialogueNodeId();
    return nodeId ? this.getDialogueNode(nodeId) : null;
  });

  // NPC Profile (could be loaded from configuration)
  readonly npcProfile = signal({
    id: 'merchant_eldwin',
    name: 'Eldwin the Merchant',
    title: 'Traveling Trader',
    personality: 'friendly-merchant' as NPCPersonality,
    voice: {
      pitch: 0.0,
      speed: 1.1,
      accent: 'british',
      age: 'middle-aged'
    },
    appearance: {
      model: 'merchant-male-01',
      outfit: 'merchant-robes',
      accessories: ['hat', 'pouch', 'staff']
    },
    backstory: 'A seasoned merchant who has traveled across many lands, collecting rare items and stories.',
    likes: ['gold', 'rare artifacts', 'good deals'],
    dislikes: ['thieves', 'haggling', 'dishonesty']
  });

  // Avatar configuration
  readonly npcConfig = computed((): AvatarConfig => ({
    avatar: {
      type: '3d' as const,
      model: {
        url: `/assets/models/npcs/${this.npcProfile().appearance.model}.glb`,
        scale: 1.0,
        autoCenter: true
      },
      appearance: {
        outfit: this.npcProfile().appearance.outfit,
        accessories: this.npcProfile().appearance.accessories
      }
    },

    behavior: {
      personality: this.npcProfile().personality,
      gestures: {
        enabled: true,
        frequency: this.getGestureFrequency(),
        cultural: 'fantasy-medieval',
        merchantSpecific: true // Custom gestures for merchant interactions
      },
      expressions: {
        baseEmotion: this._currentMood(),
        reactivity: 0.8,
        subtlety: 0.6
      },
      eyeContact: {
        enabled: true,
        frequency: 0.7,
        duration: { min: 2000, max: 5000 }
      },
      idle: {
        animations: ['examine_wares', 'count_coins', 'adjust_hat'],
        frequency: 0.3
      }
    },

    voice: {
      provider: 'elevenlabs',
      voiceId: 'merchant-eldwin',
      settings: {
        speed: this.npcProfile().voice.speed,
        pitch: this.npcProfile().voice.pitch,
        volume: 0.8,
        stability: 0.8,
        clarity: 0.9
      },
      emotion: {
        baseline: this._currentMood(),
        adaptToRelationship: true,
        contextual: true
      },
      accent: this.npcProfile().voice.accent
    },

    features: {
      lipSync: true,
      emotionDetection: true,
      gestureGeneration: true,
      contextualResponse: true,
      relationshipTracking: true
    },

    rendering: {
      quality: 'high',
      lighting: {
        type: 'fantasy',
        atmosphere: this._gameContext().weather,
        timeOfDay: this._gameContext().timeOfDay
      },
      environment: {
        type: 'marketplace',
        interactive: true
      },
      effects: {
        particles: true,
        ambientSound: true,
        weatherEffects: this._gameContext().weather !== 'clear'
      }
    },

    performance: {
      targetFPS: 60,
      adaptiveQuality: true,
      levelOfDetail: true
    }
  }));

  readonly npcState = computed(() => ({
    isActive: this._showDialogue(),
    currentEmotion: this._currentMood(),
    speaking: this._isProcessing(),
    gesture: this.getCurrentGesture(),
    relationship: this._playerRelationship().level,
    contextualState: this.getContextualState()
  }));

  ngOnInit() {
    // Initialize NPC state based on game context
    this.initializeNPC();
    
    // Set up reactive effects
    effect(() => {
      this.updateNPCBehaviorBasedOnRelationship();
    });
    
    effect(() => {
      this.updateContextualBehavior();
    });

    // Initialize sample quest
    this.initializeSampleQuest();

    // Keyboard listener for interaction
    this.setupKeyboardListeners();
  }

  // Interaction methods
  startInteraction() {
    this._showInteractionPrompt.set(false);
    this._showDialogue.set(true);
    
    // Update interaction count
    this._playerRelationship.update(rel => ({
      ...rel,
      interactions: rel.interactions + 1,
      lastInteraction: Date.now()
    }));
    
    // Determine greeting based on relationship and context
    this.determineGreeting();
  }

  selectResponse(response: DialogueResponse) {
    if (!this.isResponseAvailable(response)) return;
    
    this._isProcessing.set(true);
    
    // Add player response to history
    this._dialogueHistory.update(history => [...history, {
      id: `player-${Date.now()}`,
      speaker: 'player',
      text: response.text,
      timestamp: Date.now()
    }]);
    
    // Process consequences
    this.processResponseConsequences(response);
    
    // Simulate NPC thinking time
    setTimeout(() => {
      this.processNPCResponse(response);
      this._isProcessing.set(false);
    }, 1500);
  }

  endConversation() {
    this._showDialogue.set(false);
    this._showInteractionPrompt.set(true);
    this._currentDialogueNodeId.set('greeting');
    this._dialogueHistory.set([]);
    
    this.npcAvatar()?.playGesture('farewell');
    this.npcAvatar()?.speak(this.getFarewellMessage(), {
      emotion: this.getMoodBasedEmotion(),
      gesture: 'wave'
    });
  }

  repeatLastMessage() {
    const dialogue = this.currentDialogue();
    if (dialogue) {
      this.npcAvatar()?.speak(dialogue.text, {
        emotion: dialogue.emotion || this._currentMood(),
        gesture: dialogue.gesture
      });
    }
  }

  showQuestLog() {
    this._showQuests.set(true);
  }

  closeQuestLog() {
    this._showQuests.set(false);
  }

  // Response validation
  isResponseAvailable(response: DialogueResponse): boolean {
    if (!response.requirements) return true;
    
    return response.requirements.every(req => this.checkRequirement(req));
  }

  checkRequirement(requirement: DialogueRequirement): boolean {
    const context = this._gameContext();
    const relationship = this._playerRelationship();
    
    switch (requirement.type) {
      case 'level':
        return context.playerLevel >= requirement.value;
      case 'gold':
        return context.playerGold >= requirement.value;
      case 'relationship':
        return this.getRelationshipNumericValue() >= requirement.value;
      case 'quest':
        return this._activeQuests().some(q => q.id === requirement.questId && 
          (requirement.status ? q.status === requirement.status : true));
      case 'flag':
        return context.flags[requirement.flagName] === requirement.value;
      case 'item':
        return context.flags[`has_${requirement.itemId}`] === true;
      default:
        return true;
    }
  }

  getRequirementText(requirement: DialogueRequirement): string {
    switch (requirement.type) {
      case 'level':
        return `Level ${requirement.value}+`;
      case 'gold':
        return `${requirement.value} gold`;
      case 'relationship':
        return `Relationship: ${this.getRelationshipLabelFromValue(requirement.value)}`;
      case 'quest':
        return `Quest: ${requirement.questId}`;
      case 'flag':
        return `Flag: ${requirement.flagName}`;
      case 'item':
        return `Item: ${requirement.itemId}`;
      default:
        return 'Unknown requirement';
    }
  }

  getConsequenceText(consequence: DialogueConsequence): string {
    switch (consequence.type) {
      case 'relationship':
        return `${consequence.value > 0 ? '+' : ''}${consequence.value} relationship`;
      case 'reputation':
        return `${consequence.value > 0 ? '+' : ''}${consequence.value} reputation`;
      case 'quest':
        return consequence.action === 'start' ? 'Start quest' : 
               consequence.action === 'complete' ? 'Complete quest' : 'Update quest';
      case 'gold':
        return `${consequence.value > 0 ? '+' : ''}${consequence.value} gold`;
      case 'item':
        return `Give ${consequence.itemId}`;
      case 'flag':
        return `Set ${consequence.flagName}`;
      default:
        return 'Unknown consequence';
    }
  }

  getResponseClass(response: DialogueResponse): string {
    if (response.tone) {
      return response.tone;
    }
    return '';
  }

  // Quest management
  getRewardIcon(type: string): string {
    const icons: Record<string, string> = {
      'gold': '💰',
      'item': '🎁',
      'experience': '⭐',
      'reputation': '🏆',
      'skill': '📚'
    };
    return icons[type] || '❓';
  }

  // Relationship system
  getRelationshipLabel(): string {
    return this.capitalizeFirst(this._playerRelationship().level);
  }

  getRelationshipClass(): string {
    return this._playerRelationship().level;
  }

  getRelationshipPercentage(): number {
    const points = this._playerRelationship().points;
    // Convert points to percentage based on relationship thresholds
    const thresholds = {
      hostile: -100,
      unfriendly: -25,
      neutral: 0,
      friendly: 25,
      allied: 50
    };
    
    const level = this._playerRelationship().level;
    const currentThreshold = thresholds[level as keyof typeof thresholds];
    const nextThreshold = this.getNextRelationshipThreshold();
    
    if (nextThreshold === null) return 100; // Max level
    
    const progress = (points - currentThreshold) / (nextThreshold - currentThreshold);
    return Math.max(0, Math.min(100, progress * 100));
  }

  getMoodIcon(): string {
    const icons: Record<string, string> = {
      happy: '😊',
      content: '😐',
      sad: '😢',
      angry: '😠',
      excited: '🤩',
      worried: '😰',
      suspicious: '🤨',
      friendly: '😄',
      neutral: '😐'
    };
    return icons[this._currentMood()] || '😐';
  }

  // Utility methods
  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  // Event handlers
  onExpressionChange(expression: string) {
    console.log('NPC expression changed:', expression);
  }

  onGestureComplete(gesture: string) {
    console.log('NPC gesture completed:', gesture);
  }

  onSpeechEnd() {
    // Handle post-speech behaviors
    if (this.currentDialogue()?.autoProgress) {
      setTimeout(() => {
        const nextNodeId = this.currentDialogue()?.nextNodeId;
        if (nextNodeId) {
          this._currentDialogueNodeId.set(nextNodeId);
        }
      }, 1000);
    }
  }

  onInteractionStart() {
    this.startInteraction();
  }

  // Debug methods
  resetRelationship() {
    this._playerRelationship.set({
      npcId: this.npcProfile().id,
      level: 'neutral',
      points: 0,
      interactions: 0,
      lastInteraction: Date.now(),
      reputation: { helpful: 0, trustworthy: 0, aggressive: 0, generous: 0 }
    });
  }

  completeAllQuests() {
    this._activeQuests.update(quests => 
      quests.map(quest => ({
        ...quest,
        status: 'completed' as const,
        objectives: quest.objectives.map(obj => ({ ...obj, completed: true }))
      }))
    );
  }

  changeMood(mood: string) {
    this._currentMood.set(mood);
  }

  // Private methods
  private initializeNPC() {
    // Merge provided game context with defaults
    this._gameContext.update(current => ({ ...current, ...this.gameContextData }));
    
    // Set initial mood based on relationship
    this.updateMoodBasedOnRelationship();
    
    // Load NPC-specific data (in real app, this might come from a service)
    this.loadNPCData();
  }

  private loadNPCData() {
    // In a real application, this would load from a service or configuration
    console.log('Loading NPC data for:', this.npcId);
  }

  private determineGreeting() {
    const relationship = this._playerRelationship();
    const context = this._gameContext();
    
    let greetingNodeId = 'greeting';
    
    // Determine greeting based on relationship and context
    if (relationship.interactions === 0) {
      greetingNodeId = 'first_meeting';
    } else if (relationship.level === 'hostile') {
      greetingNodeId = 'hostile_greeting';
    } else if (relationship.level === 'allied') {
      greetingNodeId = 'friendly_greeting';
    } else if (context.flags.hasSpecialItem) {
      greetingNodeId = 'special_item_greeting';
    }
    
    this._currentDialogueNodeId.set(greetingNodeId);
    
    // Speak the greeting
    const dialogue = this.getDialogueNode(greetingNodeId);
    if (dialogue) {
      this._dialogueHistory.update(history => [...history, {
        id: `npc-${Date.now()}`,
        speaker: 'npc',
        text: dialogue.text,
        timestamp: Date.now()
      }]);
      
      this.npcAvatar()?.speak(dialogue.text, {
        emotion: dialogue.emotion || this._currentMood(),
        gesture: dialogue.gesture
      });
    }
  }

  private getDialogueNode(nodeId: string): DialogueNode | null {
    // In a real application, this would come from a dialogue system
    const dialogueTree: Record<string, DialogueNode> = {
      greeting: {
        id: 'greeting',
        text: 'Welcome, traveler! I am Eldwin, and I have the finest wares in all the land. What brings you to my shop today?',
        emotion: 'friendly',
        gesture: 'welcome',
        responses: [
          {
            id: 'browse_wares',
            text: 'I\'d like to see what you have for sale.',
            tone: 'neutral',
            nextNodeId: 'show_wares',
            consequences: [
              { type: 'relationship', value: 1 }
            ]
          },
          {
            id: 'ask_rumors',
            text: 'Any interesting rumors from your travels?',
            tone: 'curious',
            nextNodeId: 'share_rumors',
            consequences: [
              { type: 'relationship', value: 2 }
            ]
          },
          {
            id: 'be_rude',
            text: 'Your wares look like junk, old man.',
            tone: 'aggressive',
            nextNodeId: 'offended_response',
            consequences: [
              { type: 'relationship', value: -5 },
              { type: 'reputation', subtype: 'aggressive', value: 1 }
            ]
          }
        ]
      },
      first_meeting: {
        id: 'first_meeting',
        text: 'Ah, a new face! I don\'t believe we\'ve met. I am Eldwin the Merchant. I travel these lands seeking rare treasures and curious customers. And you are?',
        emotion: 'curious',
        gesture: 'bow',
        responses: [
          {
            id: 'introduce_friendly',
            text: 'I\'m an adventurer. Pleased to meet you, Eldwin.',
            tone: 'diplomatic',
            nextNodeId: 'pleased_introduction',
            consequences: [
              { type: 'relationship', value: 5 },
              { type: 'flag', flagName: 'firstMeeting', value: true }
            ]
          },
          {
            id: 'introduce_cautious',
            text: 'Just a traveler passing through.',
            tone: 'neutral',
            nextNodeId: 'neutral_introduction',
            consequences: [
              { type: 'relationship', value: 1 },
              { type: 'flag', flagName: 'firstMeeting', value: true }
            ]
          }
        ]
      },
      show_wares: {
        id: 'show_wares',
        text: 'Excellent choice! I have potions, enchanted trinkets, and rare artifacts. What catches your eye?',
        emotion: 'excited',
        gesture: 'display',
        responses: [
          {
            id: 'buy_potion',
            text: 'I need a healing potion.',
            tone: 'neutral',
            requirements: [
              { type: 'gold', value: 50 }
            ],
            consequences: [
              { type: 'gold', value: -50 },
              { type: 'item', itemId: 'healing_potion' },
              { type: 'relationship', value: 2 }
            ],
            nextNodeId: 'successful_purchase'
          },
          {
            id: 'too_expensive',
            text: 'These prices are too high.',
            tone: 'complaining',
            consequences: [
              { type: 'relationship', value: -1 }
            ],
            nextNodeId: 'defend_prices'
          }
        ]
      }
      // Add more dialogue nodes as needed...
    };

    return dialogueTree[nodeId] || null;
  }

  private processResponseConsequences(response: DialogueResponse) {
    if (!response.consequences) return;

    response.consequences.forEach(consequence => {
      switch (consequence.type) {
        case 'relationship':
          this._playerRelationship.update(rel => ({
            ...rel,
            points: rel.points + consequence.value,
            level: this.calculateRelationshipLevel(rel.points + consequence.value)
          }));
          break;

        case 'reputation':
          if (consequence.subtype) {
            this._playerRelationship.update(rel => ({
              ...rel,
              reputation: {
                ...rel.reputation,
                [consequence.subtype!]: rel.reputation[consequence.subtype! as keyof typeof rel.reputation] + consequence.value
              }
            }));
          }
          break;

        case 'gold':
          this._gameContext.update(ctx => ({
            ...ctx,
            playerGold: ctx.playerGold + consequence.value
          }));
          break;

        case 'flag':
          this._gameContext.update(ctx => ({
            ...ctx,
            flags: {
              ...ctx.flags,
              [consequence.flagName!]: consequence.value
            }
          }));
          break;

        case 'quest':
          this.handleQuestConsequence(consequence);
          break;

        case 'item':
          this._gameContext.update(ctx => ({
            ...ctx,
            flags: {
              ...ctx.flags,
              [`has_${consequence.itemId}`]: true
            }
          }));
          break;
      }
    });

    // Update mood based on relationship changes
    this.updateMoodBasedOnRelationship();
  }

  private processNPCResponse(response: DialogueResponse) {
    if (response.nextNodeId) {
      const nextNode = this.getDialogueNode(response.nextNodeId);
      if (nextNode) {
        this._currentDialogueNodeId.set(response.nextNodeId);
        
        // Add NPC response to history
        this._dialogueHistory.update(history => [...history, {
          id: `npc-${Date.now()}`,
          speaker: 'npc',
          text: nextNode.text,
          timestamp: Date.now()
        }]);
        
        // Make NPC speak
        this.npcAvatar()?.speak(nextNode.text, {
          emotion: nextNode.emotion || this._currentMood(),
          gesture: nextNode.gesture
        });
      }
    }
  }

  private calculateRelationshipLevel(points: number): PlayerRelationship['level'] {
    if (points < -25) return 'hostile';
    if (points < 0) return 'unfriendly';
    if (points < 25) return 'neutral';
    if (points < 50) return 'friendly';
    return 'allied';
  }

  private getNextRelationshipThreshold(): number | null {
    const level = this._playerRelationship().level;
    const thresholds = {
      hostile: -25,
      unfriendly: 0,
      neutral: 25,
      friendly: 50,
      allied: null
    };
    return thresholds[level as keyof typeof thresholds];
  }

  private getRelationshipNumericValue(): number {
    const level = this._playerRelationship().level;
    const values = {
      hostile: -50,
      unfriendly: -10,
      neutral: 0,
      friendly: 25,
      allied: 50
    };
    return values[level as keyof typeof values];
  }

  private getRelationshipLabelFromValue(value: number): string {
    if (value < -25) return 'Hostile';
    if (value < 0) return 'Unfriendly';
    if (value < 25) return 'Neutral';
    if (value < 50) return 'Friendly';
    return 'Allied';
  }

  private updateMoodBasedOnRelationship() {
    const relationship = this._playerRelationship();
    
    switch (relationship.level) {
      case 'hostile':
        this._currentMood.set('angry');
        break;
      case 'unfriendly':
        this._currentMood.set('suspicious');
        break;
      case 'neutral':
        this._currentMood.set('content');
        break;
      case 'friendly':
        this._currentMood.set('friendly');
        break;
      case 'allied':
        this._currentMood.set('happy');
        break;
    }
  }

  private updateNPCBehaviorBasedOnRelationship() {
    // This would adjust NPC behavior based on current relationship
    console.log('Updating NPC behavior for relationship:', this._playerRelationship().level);
  }

  private updateContextualBehavior() {
    const context = this._gameContext();
    
    // Adjust behavior based on time of day, weather, etc.
    if (context.timeOfDay === 'night') {
      this._currentMood.set('tired');
    }
    
    if (context.weather === 'rain') {
      this._currentMood.set('worried');
    }
  }

  private getGestureFrequency(): number {
    const relationship = this._playerRelationship().level;
    const frequencies = {
      hostile: 0.3,
      unfriendly: 0.4,
      neutral: 0.5,
      friendly: 0.7,
      allied: 0.8
    };
    return frequencies[relationship as keyof typeof frequencies] || 0.5;
  }

  private getCurrentGesture(): string | null {
    const dialogue = this.currentDialogue();
    return dialogue?.gesture || null;
  }

  private getMoodBasedEmotion(): string {
    const mood = this._currentMood();
    const emotionMap: Record<string, string> = {
      happy: 'joy',
      content: 'neutral',
      angry: 'anger',
      suspicious: 'wariness',
      friendly: 'warmth',
      tired: 'fatigue'
    };
    return emotionMap[mood] || 'neutral';
  }

  private getContextualState(): any {
    return {
      inCombat: false,
      trading: this._showDialogue(),
      alertLevel: this._playerRelationship().level === 'hostile' ? 'high' : 'normal',
      environmentalFactors: {
        timeOfDay: this._gameContext().timeOfDay,
        weather: this._gameContext().weather
      }
    };
  }

  private getFarewellMessage(): string {
    const relationship = this._playerRelationship().level;
    const farewells = {
      hostile: 'Good riddance.',
      unfriendly: 'Until next time, I suppose.',
      neutral: 'Safe travels, traveler.',
      friendly: 'Farewell, friend! Come back anytime.',
      allied: 'May the roads treat you kindly, dear friend!'
    };
    return farewells[relationship as keyof typeof farewells] || 'Goodbye.';
  }

  private handleQuestConsequence(consequence: DialogueConsequence) {
    if (consequence.action === 'start' && consequence.questId) {
      // Start a new quest
      const quest = this.createQuest(consequence.questId);
      if (quest) {
        this._activeQuests.update(quests => [...quests, quest]);
      }
    } else if (consequence.action === 'complete' && consequence.questId) {
      // Complete an existing quest
      this._activeQuests.update(quests => 
        quests.map(quest => 
          quest.id === consequence.questId 
            ? { ...quest, status: 'completed' as const }
            : quest
        )
      );
    }
  }

  private createQuest(questId: string): Quest | null {
    // In a real application, this would come from a quest database
    const questTemplates: Record<string, Quest> = {
      'fetch_herbs': {
        id: 'fetch_herbs',
        title: 'Gather Healing Herbs',
        description: 'Eldwin needs healing herbs from the nearby forest for his potions.',
        type: 'fetch',
        priority: 'side',
        status: 'active',
        giver: 'merchant_eldwin',
        objectives: [
          {
            id: 'gather_herbs',
            description: 'Gather healing herbs from the forest',
            completed: false,
            progress: 0,
            target: 5
          }
        ],
        rewards: [
          {
            type: 'gold',
            amount: 100,
            description: '100 gold pieces'
          },
          {
            type: 'item',
            itemId: 'healing_potion',
            description: 'Greater Healing Potion'
          }
        ],
        timeLimit: null,
        location: 'whispering_woods'
      }
    };
    
    return questTemplates[questId] || null;
  }

  private initializeSampleQuest() {
    const sampleQuest = this.createQuest('fetch_herbs');
    if (sampleQuest) {
      this._activeQuests.set([sampleQuest]);
    }
  }

  private setupKeyboardListeners() {
    // Listen for 'E' key to start interaction
    window.addEventListener('keydown', (event) => {
      if (event.key.toLowerCase() === 'e' && this._showInteractionPrompt()) {
        this.startInteraction();
      }
    });
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Supporting interfaces
interface DialogueMessage {
  id: string;
  speaker: 'player' | 'npc';
  text: string;
  timestamp: number;
}

interface DialogueNode {
  id: string;
  text: string;
  emotion?: string;
  gesture?: string;
  responses?: DialogueResponse[];
  nextNodeId?: string;
  autoProgress?: boolean;
}

interface DialogueResponse {
  id: string;
  text: string;
  tone?: 'neutral' | 'aggressive' | 'diplomatic' | 'deceptive' | 'curious' | 'complaining';
  nextNodeId?: string;
  requirements?: DialogueRequirement[];
  consequences?: DialogueConsequence[];
}

interface DialogueRequirement {
  type: 'level' | 'gold' | 'relationship' | 'quest' | 'flag' | 'item';
  value: any;
  questId?: string;
  status?: string;
  flagName?: string;
  itemId?: string;
}

interface DialogueConsequence {
  type: 'relationship' | 'reputation' | 'quest' | 'gold' | 'flag' | 'item';
  value: any;
  subtype?: string;
  action?: 'start' | 'complete' | 'update';
  questId?: string;
  flagName?: string;
  itemId?: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'fetch' | 'kill' | 'escort';
  priority: 'main' | 'side' | 'urgent';
  status: 'active' | 'completed' | 'failed';
  giver: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  timeLimit?: number;
  location?: string;
}

interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress?: number;
  target?: number;
}

interface QuestReward {
  type: 'gold' | 'item' | 'experience' | 'reputation' | 'skill';
  amount?: number;
  itemId?: string;
  description: string;
}

interface PlayerRelationship {
  npcId: string;
  level: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
  points: number;
  interactions: number;
  lastInteraction: number;
  reputation: {
    helpful: number;
    trustworthy: number;
    aggressive: number;
    generous: number;
  };
}

interface GameContext {
  location: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather: 'clear' | 'rain' | 'storm' | 'snow';
  playerLevel: number;
  playerGold: number;
  flags: Record<string, any>;
}

type NPCPersonality = 'friendly-merchant' | 'gruff-warrior' | 'wise-sage' | 'sneaky-rogue' | 'noble-knight';

interface NPCReaction {
  trigger: string;
  emotion: string;
  gesture: string;
  dialogue: string;
}
```

### Usage in Your Game

```typescript
// game-scene.component.ts
import { Component } from '@angular/core';
import { GamingNPCComponent } from './gaming-npc.component';

@Component({
  selector: 'app-game-scene',
  standalone: true,
  imports: [GamingNPCComponent],
  template: `
    <app-gaming-npc 
      npcId="merchant_eldwin"
      [gameContextData]="gameContext">
    </app-gaming-npc>
  `
})
export class GameSceneComponent {
  gameContext = {
    location: 'marketplace',
    timeOfDay: 'afternoon' as const,
    weather: 'clear' as const,
    playerLevel: 15,
    playerGold: 250,
    flags: {
      firstMeeting: false,
      completedTutorial: true,
      hasSpecialItem: false
    }
  };
}
```

### Game Integration Service

```typescript
// game-integration.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameIntegrationService {
  private _globalGameState = signal({
    playerStats: {
      level: 15,
      gold: 250,
      health: 100,
      mana: 50
    },
    worldState: {
      location: 'marketplace',
      timeOfDay: 'afternoon',
      weather: 'clear'
    },
    questLog: [],
    inventory: [],
    relationships: new Map()
  });

  readonly globalGameState = this._globalGameState.asReadonly();

  updatePlayerGold(amount: number) {
    this._globalGameState.update(state => ({
      ...state,
      playerStats: {
        ...state.playerStats,
        gold: state.playerStats.gold + amount
      }
    }));
  }

  addQuestToGlobalLog(quest: any) {
    this._globalGameState.update(state => ({
      ...state,
      questLog: [...state.questLog, quest]
    }));
  }

  updateNPCRelationship(npcId: string, relationship: any) {
    const relationships = new Map(this._globalGameState().relationships);
    relationships.set(npcId, relationship);
    
    this._globalGameState.update(state => ({
      ...state,
      relationships
    }));
  }
}
```

## Features Demonstrated

### Dynamic Dialogue System
- Branching conversations with multiple response options
- Contextual responses based on player actions and relationship
- Emotional reactions and mood changes
- Voice acting with character-specific speech patterns

### Relationship Management
- Persistent relationship tracking with reputation system
- Consequence-based interactions affecting future conversations
- Visual relationship indicators and progression tracking
- Multiple relationship levels (hostile to allied)

### Quest Integration
- Dynamic quest assignment through dialogue
- Progress tracking with visual indicators
- Reward system with multiple reward types
- Quest log management integrated with NPC interactions

### Immersive Features
- 3D avatar with contextual animations and gestures
- Environmental awareness (time of day, weather effects)
- Cultural adaptation for fantasy medieval setting
- Interactive elements with keyboard controls

## Integration Notes

This gaming NPC can be integrated with:
- RPG and adventure game engines
- Quest management systems
- Player progression systems
- Save/load game state systems
- Multiplayer networking for persistent worlds

The component is designed to be highly flexible and can be customized for different game genres while maintaining immersive character interactions.