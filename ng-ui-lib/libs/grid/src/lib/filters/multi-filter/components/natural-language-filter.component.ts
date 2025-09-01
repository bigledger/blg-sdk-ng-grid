import { 
  Component, 
  ChangeDetectionStrategy, 
  Input, 
  Output, 
  EventEmitter,
  OnInit, 
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ParsedNaturalQuery,
  QueryIntent,
  QueryEntity,
  ParsedCondition 
} from '../multi-filter.interface';

/**
 * Natural Language Filter Component
 * 
 * Advanced natural language processing interface for filter creation.
 * Features:
 * - Real-time query parsing and interpretation
 * - Smart autocomplete with context awareness
 * - Voice input support
 * - Multiple language support
 * - Query suggestion engine
 * - Confidence scoring and alternatives
 * - Intent classification
 * - Entity recognition and mapping
 * - Query history and favorites
 */
@Component({
  selector: 'blg-natural-language-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="natural-language-container" 
         [class.processing]="isProcessing()"
         [class.has-results]="parsedResult() !== null">
      
      <!-- Main Input Section -->
      <div class="input-section">
        <!-- Query Input -->
        <div class="query-input-wrapper">
          <div class="input-container">
            <textarea 
              #queryInput
              class="query-input"
              [(ngModel)]="currentQuery"
              (ngModelChange)="onQueryChanged()"
              (keyup.enter)="onEnterPressed($event)"
              (focus)="onInputFocus()"
              (blur)="onInputBlur()"
              [placeholder]="getPlaceholderText()"
              [disabled]="isProcessing()"
              rows="3"
              maxlength="500">
            </textarea>
            
            <!-- Character Counter -->
            <div class="character-counter" 
                 [class.warning]="currentQuery.length > 400"
                 [class.error]="currentQuery.length >= 500">
              {{currentQuery.length}}/500
            </div>
          </div>
          
          <!-- Input Actions -->
          <div class="input-actions">
            <!-- Voice Input -->
            <button 
              class="action-btn voice-btn"
              [class.active]="isListening()"
              [class.available]="voiceSupported()"
              (click)="toggleVoiceInput()"
              [disabled]="!voiceSupported() || isProcessing()"
              title="Voice input">
              <i class="icon-microphone" *ngIf="!isListening()"></i>
              <i class="icon-microphone-active pulsing" *ngIf="isListening()"></i>
            </button>
            
            <!-- Clear Input -->
            <button 
              class="action-btn clear-btn"
              (click)="clearInput()"
              [disabled]="!currentQuery.trim() || isProcessing()"
              title="Clear input">
              <i class="icon-close"></i>
            </button>
            
            <!-- Process Query -->
            <button 
              class="action-btn primary process-btn"
              (click)="processQuery()"
              [disabled]="!currentQuery.trim() || isProcessing()"
              title="Process query">
              <i class="icon-search" *ngIf="!isProcessing()"></i>
              <i class="icon-spinner spinning" *ngIf="isProcessing()"></i>
              {{isProcessing() ? 'Processing...' : 'Process'}}
            </button>
          </div>
        </div>
        
        <!-- Autocomplete Suggestions -->
        <div class="autocomplete-dropdown" 
             *ngIf="showAutocomplete() && autocompleteSuggestions().length > 0"
             [@slideDown]>
          <div class="suggestions-header">
            <span class="suggestions-title">Suggestions</span>
            <span class="suggestions-count">{{autocompleteSuggestions().length}}</span>
          </div>
          
          <div class="suggestions-list">
            <div class="suggestion-item" 
                 *ngFor="let suggestion of autocompleteSuggestions(); trackBy: trackSuggestion; let i = index"
                 [class.active]="i === activeSuggestionIndex()"
                 (click)="selectSuggestion(suggestion)"
                 (mouseenter)="setActiveSuggestionIndex(i)">
              
              <div class="suggestion-content">
                <div class="suggestion-text">{{suggestion.text}}</div>
                <div class="suggestion-type">{{suggestion.type}}</div>
              </div>
              
              <div class="suggestion-meta" *ngIf="suggestion.confidence">
                <div class="confidence-score" 
                     [class]="getConfidenceClass(suggestion.confidence)">
                  {{suggestion.confidence * 100 | number:'1.0-0'}}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Language Selection -->
        <div class="language-selector" *ngIf="supportedLanguages().length > 1">
          <select 
            [(ngModel)]="selectedLanguage" 
            (ngModelChange)="onLanguageChanged()"
            class="language-select">
            <option *ngFor="let lang of supportedLanguages()" [value]="lang.code">
              {{lang.name}}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Query Examples -->
      <div class="examples-section" *ngIf="showExamples() && !parsedResult()">
        <div class="examples-header">
          <h5>Try these examples:</h5>
        </div>
        
        <div class="examples-grid">
          <div class="example-item" 
               *ngFor="let example of queryExamples(); trackBy: trackExample"
               (click)="useExample(example)">
            <div class="example-text">{{example.query}}</div>
            <div class="example-description">{{example.description}}</div>
          </div>
        </div>
      </div>
      
      <!-- Processing Status -->
      <div class="processing-status" *ngIf="isProcessing()">
        <div class="status-content">
          <div class="processing-animation">
            <div class="processing-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
          <div class="status-text">{{processingStatus()}}</div>
          <div class="progress-bar" *ngIf="processingProgress() > 0">
            <div class="progress-fill" [style.width.%]="processingProgress()"></div>
          </div>
        </div>
      </div>
      
      <!-- Parsed Results -->
      <div class="results-section" *ngIf="!isProcessing() && parsedResult()">
        
        <!-- Intent Classification -->
        <div class="intent-section">
          <div class="intent-header">
            <h5>Query Intent</h5>
            <div class="confidence-badge" 
                 [class]="getConfidenceClass(parsedResult()!.confidence)">
              {{parsedResult()!.confidence * 100 | number:'1.0-0'}}% confidence
            </div>
          </div>
          
          <div class="intent-content">
            <div class="intent-badge" [class]="parsedResult()!.intent">
              <i [class]="getIntentIcon(parsedResult()!.intent)"></i>
              <span class="intent-label">{{getIntentLabel(parsedResult()!.intent)}}</span>
            </div>
            <div class="intent-description">{{getIntentDescription(parsedResult()!.intent)}}</div>
          </div>
        </div>
        
        <!-- Entity Recognition -->
        <div class="entities-section" *ngIf="parsedResult()!.entities?.length">
          <div class="entities-header">
            <h5>Recognized Entities</h5>
          </div>
          
          <div class="entities-list">
            <div class="entity-item" 
                 *ngFor="let entity of parsedResult()!.entities; trackBy: trackEntity"
                 [class]="entity.type">
              <div class="entity-content">
                <div class="entity-text">{{entity.text}}</div>
                <div class="entity-type">{{entity.type}}</div>
                <div class="entity-mapping" *ngIf="entity.mappedTo">
                  → {{entity.mappedTo}}
                </div>
              </div>
              <div class="entity-confidence">
                {{entity.confidence * 100 | number:'1.0-0'}}%
              </div>
            </div>
          </div>
        </div>
        
        <!-- Parsed Conditions -->
        <div class="conditions-section" *ngIf="parsedResult()!.conditions?.length">
          <div class="conditions-header">
            <h5>Filter Conditions</h5>
          </div>
          
          <div class="conditions-list">
            <div class="condition-item" 
                 *ngFor="let condition of parsedResult()!.conditions; trackBy: trackCondition; let i = index">
              <div class="condition-index">{{i + 1}}</div>
              
              <div class="condition-content">
                <div class="condition-parts">
                  <span class="condition-column" 
                        [title]="'Column: ' + condition.columnId">
                    {{condition.columnId}}
                  </span>
                  <span class="condition-operator" 
                        [title]="'Operator: ' + condition.operator">
                    {{getOperatorDisplay(condition.operator)}}
                  </span>
                  <span class="condition-value" 
                        [title]="'Value: ' + condition.value">
                    {{formatConditionValue(condition.value)}}
                  </span>
                </div>
                
                <div class="condition-confidence">
                  <div class="confidence-bar">
                    <div class="confidence-fill" 
                         [style.width.%]="condition.confidence * 100"
                         [class]="getConfidenceClass(condition.confidence)">
                    </div>
                  </div>
                  <span class="confidence-text">{{condition.confidence * 100 | number:'1.0-0'}}%</span>
                </div>
              </div>
              
              <!-- Alternative Interpretations -->
              <div class="condition-alternatives" *ngIf="condition.alternatives?.length">
                <button 
                  class="alternatives-toggle"
                  (click)="toggleAlternatives(i)"
                  [class.expanded]="isAlternativesExpanded(i)">
                  <i class="icon-chevron-down"></i>
                  {{condition.alternatives.length}} alternatives
                </button>
                
                <div class="alternatives-list" 
                     *ngIf="isAlternativesExpanded(i)"
                     [@slideDown]>
                  <div class="alternative-item" 
                       *ngFor="let alt of condition.alternatives; trackBy: trackCondition"
                       (click)="selectAlternative(i, alt)">
                    <div class="alternative-content">
                      <span class="alt-column">{{alt.columnId}}</span>
                      <span class="alt-operator">{{getOperatorDisplay(alt.operator)}}</span>
                      <span class="alt-value">{{formatConditionValue(alt.value)}}</span>
                    </div>
                    <div class="alt-confidence">{{alt.confidence * 100 | number:'1.0-0'}}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Alternative Query Interpretations -->
        <div class="alternatives-section" *ngIf="parsedResult()!.alternatives?.length">
          <div class="alternatives-header">
            <h5>Alternative Interpretations</h5>
          </div>
          
          <div class="alternatives-list">
            <div class="alternative-query" 
                 *ngFor="let alt of parsedResult()!.alternatives; trackBy: trackAlternativeQuery"
                 (click)="selectAlternativeQuery(alt)">
              <div class="alt-query-text">{{alt.originalQuery}}</div>
              <div class="alt-query-confidence">
                {{alt.confidence * 100 | number:'1.0-0'}}% confidence
              </div>
            </div>
          </div>
        </div>
        
        <!-- Time Range -->
        <div class="time-range-section" *ngIf="parsedResult()!.timeRange">
          <div class="time-range-header">
            <h5>Time Range</h5>
          </div>
          
          <div class="time-range-content">
            <div class="time-range-badge" [class]="parsedResult()!.timeRange!.type">
              <i [class]="getTimeRangeIcon(parsedResult()!.timeRange!.type)"></i>
              <span>{{formatTimeRange(parsedResult()!.timeRange!)}}</span>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="results-actions">
          <button 
            class="action-btn secondary refine-btn"
            (click)="refineQuery()"
            title="Refine query">
            <i class="icon-edit"></i>
            Refine Query
          </button>
          
          <button 
            class="action-btn secondary save-btn"
            (click)="saveQuery()"
            title="Save query">
            <i class="icon-bookmark"></i>
            Save Query
          </button>
          
          <button 
            class="action-btn primary apply-btn"
            (click)="applyQuery()"
            title="Apply this interpretation">
            <i class="icon-check"></i>
            Apply Filter
          </button>
        </div>
      </div>
      
      <!-- Query History -->
      <div class="history-section" *ngIf="showHistory() && queryHistory().length > 0">
        <div class="history-header">
          <h5>Recent Queries</h5>
          <button class="clear-history-btn" (click)="clearHistory()">
            <i class="icon-trash"></i>
            Clear
          </button>
        </div>
        
        <div class="history-list">
          <div class="history-item" 
               *ngFor="let historyItem of queryHistory().slice(-5); trackBy: trackHistoryItem"
               (click)="useHistoryItem(historyItem)">
            <div class="history-query">{{historyItem.query}}</div>
            <div class="history-meta">
              <span class="history-time">{{formatHistoryTime(historyItem.timestamp)}}</span>
              <span class="history-confidence" 
                    [class]="getConfidenceClass(historyItem.confidence)">
                {{historyItem.confidence * 100 | number:'1.0-0'}}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Voice Input Feedback -->
      <div class="voice-feedback" 
           *ngIf="isListening() || voiceTranscript()"
           [@fadeIn]>
        <div class="voice-status" *ngIf="isListening()">
          <div class="voice-animation">
            <div class="sound-wave">
              <span class="wave"></span>
              <span class="wave"></span>
              <span class="wave"></span>
              <span class="wave"></span>
            </div>
          </div>
          <div class="voice-text">Listening... Speak your query</div>
        </div>
        
        <div class="voice-transcript" *ngIf="voiceTranscript()">
          <div class="transcript-label">Heard:</div>
          <div class="transcript-text">{{voiceTranscript()}}</div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./natural-language-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Add smooth animations
  ]
})
export class NaturalLanguageFilterComponent implements OnInit, OnDestroy {
  
  // Component inputs
  @Input() query = signal('');
  @Input() parsedResult = signal<ParsedNaturalQuery | null>(null);
  @Input() suggestions = signal<string[]>([]);
  @Input() isProcessing = signal(false);
  @Input() columnOptions = signal<any[]>([]);
  @Input() config = signal<any>({});
  
  // Component outputs
  @Output() queryChanged = new EventEmitter<string>();
  @Output() querySubmitted = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<string>();
  @Output() queryRefined = new EventEmitter<{ originalQuery: string; refinedQuery: string }>();
  @Output() queryApplied = new EventEmitter<ParsedNaturalQuery>();
  
  // View children
  @ViewChild('queryInput', { read: ElementRef }) queryInput!: ElementRef;
  
  // Internal state signals
  private _showAutocomplete = signal(false);
  private _autocompleteSuggestions = signal<any[]>([]);
  private _activeSuggestionIndex = signal(-1);
  private _expandedAlternatives = signal<Set<number>>(new Set());
  private _isListening = signal(false);
  private _voiceTranscript = signal('');
  private _voiceSupported = signal(false);
  private _processingStatus = signal('');
  private _processingProgress = signal(0);
  private _queryHistory = signal<any[]>([]);
  private _showExamples = signal(true);
  private _showHistory = signal(false);
  
  // Component properties
  currentQuery = '';
  selectedLanguage = 'en';
  
  // Computed properties
  showAutocomplete = this._showAutocomplete.asReadonly();
  autocompleteSuggestions = this._autocompleteSuggestions.asReadonly();
  activeSuggestionIndex = this._activeSuggestionIndex.asReadonly();
  expandedAlternatives = this._expandedAlternatives.asReadonly();
  isListening = this._isListening.asReadonly();
  voiceTranscript = this._voiceTranscript.asReadonly();
  voiceSupported = this._voiceSupported.asReadonly();
  processingStatus = this._processingStatus.asReadonly();
  processingProgress = this._processingProgress.asReadonly();
  queryHistory = this._queryHistory.asReadonly();
  showExamples = this._showExamples.asReadonly();
  showHistory = this._showHistory.asReadonly();
  
  // Language and examples data
  supportedLanguages = computed(() => [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' }
  ]);
  
  queryExamples = computed(() => [
    {
      query: 'Show me all customers from California with orders over $1000',
      description: 'Filter by location and order value'
    },
    {
      query: 'Find users who signed up last month and are still active',
      description: 'Time-based filtering with status condition'
    },
    {
      query: 'Products with price between $50 and $200, excluding discontinued',
      description: 'Range filter with exclusion condition'
    },
    {
      query: 'Employees in Sales department with performance rating above 4',
      description: 'Department and performance filtering'
    },
    {
      query: 'Show high priority tickets created today',
      description: 'Priority and date-based filtering'
    },
    {
      query: 'Orders from premium customers shipped in the last week',
      description: 'Customer tier and shipping date filtering'
    }
  ]);
  
  // Speech recognition
  private speechRecognition: any;
  private autocompleteTimeout?: number;
  
  constructor() {
    // Initialize speech recognition if available
    this.initializeSpeechRecognition();
    
    // Sync query with input
    effect(() => {
      const queryValue = this.query();
      if (queryValue !== this.currentQuery) {
        this.currentQuery = queryValue;
      }
    });
    
    // Load query history from localStorage
    this.loadQueryHistory();
  }
  
  ngOnInit(): void {
    this.initializeComponent();
  }
  
  ngOnDestroy(): void {
    this.cleanup();
  }
  
  // Event handlers
  onQueryChanged(): void {
    this.queryChanged.emit(this.currentQuery);
    this.updateAutocomplete();
  }
  
  onEnterPressed(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      this.processQuery();
    } else if (this._showAutocomplete() && this._activeSuggestionIndex() >= 0) {
      const suggestion = this._autocompleteSuggestions()[this._activeSuggestionIndex()];
      this.selectSuggestion(suggestion);
      event.preventDefault();
    }
  }
  
  onInputFocus(): void {
    this._showExamples.set(true);
    this.updateAutocomplete();
  }
  
  onInputBlur(): void {
    // Delay hiding autocomplete to allow for clicks
    setTimeout(() => {
      this._showAutocomplete.set(false);
      this._activeSuggestionIndex.set(-1);
    }, 200);
  }
  
  onLanguageChanged(): void {
    // Update language-specific examples and processing
    this.updateLanguageContext();
  }
  
  // Voice input methods
  toggleVoiceInput(): void {
    if (this._isListening()) {
      this.stopVoiceInput();
    } else {
      this.startVoiceInput();
    }
  }
  
  startVoiceInput(): void {
    if (!this.speechRecognition || this._isListening()) return;
    
    this._isListening.set(true);
    this._voiceTranscript.set('');
    
    try {
      this.speechRecognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      this._isListening.set(false);
    }
  }
  
  stopVoiceInput(): void {
    if (this.speechRecognition && this._isListening()) {
      this.speechRecognition.stop();
      this._isListening.set(false);
    }
  }
  
  // Query processing methods
  async processQuery(): Promise<void> {
    if (!this.currentQuery.trim() || this.isProcessing()) return;
    
    this._processingStatus.set('Analyzing query...');
    this._processingProgress.set(0);
    
    try {
      this.querySubmitted.emit(this.currentQuery);
      
      // Add to history
      this.addToHistory(this.currentQuery);
      
      // Hide examples
      this._showExamples.set(false);
      
    } catch (error) {
      console.error('Query processing error:', error);
    }
  }
  
  clearInput(): void {
    this.currentQuery = '';
    this.queryChanged.emit('');
    this._showExamples.set(true);
  }
  
  refineQuery(): void {
    const originalQuery = this.currentQuery;
    // Open refinement dialog or switch to refinement mode
    this.queryRefined.emit({ 
      originalQuery, 
      refinedQuery: originalQuery 
    });
  }
  
  saveQuery(): void {
    const result = this.parsedResult();
    if (result) {
      // Save to favorites or persistent storage
      console.log('Saving query:', result);
    }
  }
  
  applyQuery(): void {
    const result = this.parsedResult();
    if (result) {
      this.queryApplied.emit(result);
    }
  }
  
  // Autocomplete methods
  selectSuggestion(suggestion: any): void {
    this.currentQuery = suggestion.text;
    this.queryChanged.emit(this.currentQuery);
    this._showAutocomplete.set(false);
    this._activeSuggestionIndex.set(-1);
    this.suggestionSelected.emit(suggestion.text);
    
    // Focus back on input
    if (this.queryInput) {
      this.queryInput.nativeElement.focus();
    }
  }
  
  setActiveSuggestionIndex(index: number): void {
    this._activeSuggestionIndex.set(index);
  }
  
  // Example methods
  useExample(example: any): void {
    this.currentQuery = example.query;
    this.queryChanged.emit(this.currentQuery);
    this._showExamples.set(false);
    
    // Auto-process the example
    setTimeout(() => this.processQuery(), 100);
  }
  
  // Alternative methods
  toggleAlternatives(conditionIndex: number): void {
    const expanded = this._expandedAlternatives();
    const newExpanded = new Set(expanded);
    
    if (newExpanded.has(conditionIndex)) {
      newExpanded.delete(conditionIndex);
    } else {
      newExpanded.add(conditionIndex);
    }
    
    this._expandedAlternatives.set(newExpanded);
  }
  
  isAlternativesExpanded(conditionIndex: number): boolean {
    return this._expandedAlternatives().has(conditionIndex);
  }
  
  selectAlternative(conditionIndex: number, alternative: ParsedCondition): void {
    const result = this.parsedResult();
    if (!result || !result.conditions) return;
    
    // Replace the condition with the alternative
    const newConditions = [...result.conditions];
    newConditions[conditionIndex] = alternative;
    
    const newResult: ParsedNaturalQuery = {
      ...result,
      conditions: newConditions
    };
    
    // Emit the updated result
    this.queryApplied.emit(newResult);
  }
  
  selectAlternativeQuery(alternative: ParsedNaturalQuery): void {
    this.currentQuery = alternative.originalQuery;
    this.queryChanged.emit(this.currentQuery);
    this.queryApplied.emit(alternative);
  }
  
  // History methods
  useHistoryItem(historyItem: any): void {
    this.currentQuery = historyItem.query;
    this.queryChanged.emit(this.currentQuery);
    this._showHistory.set(false);
  }
  
  clearHistory(): void {
    this._queryHistory.set([]);
    this.saveQueryHistory();
  }
  
  // Utility methods
  trackSuggestion(index: number, suggestion: any): string {
    return suggestion.id || suggestion.text;
  }
  
  trackExample(index: number, example: any): string {
    return example.query;
  }
  
  trackEntity(index: number, entity: QueryEntity): string {
    return `${entity.text}-${entity.type}`;
  }
  
  trackCondition(index: number, condition: ParsedCondition): string {
    return `${condition.columnId}-${condition.operator}-${condition.value}`;
  }
  
  trackAlternativeQuery(index: number, alt: ParsedNaturalQuery): string {
    return alt.originalQuery;
  }
  
  trackHistoryItem(index: number, item: any): string {
    return `${item.query}-${item.timestamp}`;
  }
  
  getPlaceholderText(): string {
    const placeholders = [
      'Show me customers from New York with orders over $500...',
      'Find all active users who signed up last month...',
      'Display products with price between $10 and $100...',
      'Get employees in Sales department with rating above 4...'
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }
  
  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'high-confidence';
    if (confidence >= 0.6) return 'medium-confidence';
    if (confidence >= 0.4) return 'low-confidence';
    return 'very-low-confidence';
  }
  
  getIntentIcon(intent: QueryIntent): string {
    const iconMap: { [key in QueryIntent]: string } = {
      'filter': 'icon-filter',
      'search': 'icon-search',
      'aggregate': 'icon-chart',
      'compare': 'icon-compare',
      'trend': 'icon-trending',
      'outlier': 'icon-target',
      'pattern': 'icon-pattern',
      'anomaly': 'icon-warning'
    };
    return iconMap[intent] || 'icon-question';
  }
  
  getIntentLabel(intent: QueryIntent): string {
    const labelMap: { [key in QueryIntent]: string } = {
      'filter': 'Filter Data',
      'search': 'Search Records',
      'aggregate': 'Aggregate Analysis',
      'compare': 'Compare Values',
      'trend': 'Trend Analysis',
      'outlier': 'Find Outliers',
      'pattern': 'Pattern Detection',
      'anomaly': 'Anomaly Detection'
    };
    return labelMap[intent] || 'Unknown';
  }
  
  getIntentDescription(intent: QueryIntent): string {
    const descMap: { [key in QueryIntent]: string } = {
      'filter': 'Filter and narrow down the dataset based on specific criteria',
      'search': 'Search for specific records or values in the data',
      'aggregate': 'Perform calculations and aggregations on the data',
      'compare': 'Compare different values or groups in the data',
      'trend': 'Analyze trends and patterns over time',
      'outlier': 'Identify unusual or exceptional values in the data',
      'pattern': 'Detect recurring patterns in the dataset',
      'anomaly': 'Find anomalies or irregularities in the data'
    };
    return descMap[intent] || 'Process the query to understand the intent';
  }
  
  getOperatorDisplay(operator: string): string {
    const displayMap: { [key: string]: string } = {
      'equals': '=',
      'notEquals': '≠',
      'greaterThan': '>',
      'lessThan': '<',
      'greaterThanOrEqual': '≥',
      'lessThanOrEqual': '≤',
      'contains': 'contains',
      'startsWith': 'starts with',
      'endsWith': 'ends with',
      'isEmpty': 'is empty',
      'isNotEmpty': 'is not empty'
    };
    return displayMap[operator] || operator;
  }
  
  formatConditionValue(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return JSON.stringify(value);
  }
  
  getTimeRangeIcon(type: string): string {
    return type === 'relative' ? 'icon-clock' : 'icon-calendar';
  }
  
  formatTimeRange(timeRange: any): string {
    if (timeRange.type === 'absolute' && timeRange.start && timeRange.end) {
      return `${new Date(timeRange.start).toLocaleDateString()} - ${new Date(timeRange.end).toLocaleDateString()}`;
    } else if (timeRange.type === 'relative' && timeRange.relativePeriod) {
      const { value, unit, direction } = timeRange.relativePeriod;
      return `${direction} ${value} ${unit}`;
    }
    return 'Custom time range';
  }
  
  formatHistoryTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  }
  
  // Private methods
  private initializeComponent(): void {
    // Initial setup
  }
  
  private cleanup(): void {
    if (this.autocompleteTimeout) {
      clearTimeout(this.autocompleteTimeout);
    }
    
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
  }
  
  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = this.selectedLanguage;
      
      this.speechRecognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        
        this._voiceTranscript.set(transcript);
        
        if (transcript.trim()) {
          this.currentQuery = transcript.trim();
          this.queryChanged.emit(this.currentQuery);
        }
      };
      
      this.speechRecognition.onend = () => {
        this._isListening.set(false);
        
        // Auto-process if we have a transcript
        if (this._voiceTranscript().trim()) {
          setTimeout(() => this.processQuery(), 500);
        }
      };
      
      this.speechRecognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this._isListening.set(false);
      };
      
      this._voiceSupported.set(true);
    }
  }
  
  private updateAutocomplete(): void {
    if (this.autocompleteTimeout) {
      clearTimeout(this.autocompleteTimeout);
    }
    
    if (!this.currentQuery.trim()) {
      this._showAutocomplete.set(false);
      return;
    }
    
    this.autocompleteTimeout = window.setTimeout(() => {
      this.generateAutocompleteSuggestions();
    }, 300);
  }
  
  private generateAutocompleteSuggestions(): void {
    const query = this.currentQuery.toLowerCase();
    const columns = this.columnOptions();
    const suggestions: any[] = [];
    
    // Column name suggestions
    for (const column of columns) {
      if (column.field.toLowerCase().includes(query) || 
          (column.headerName && column.headerName.toLowerCase().includes(query))) {
        suggestions.push({
          text: `Show ${column.headerName || column.field}`,
          type: 'column',
          confidence: 0.9
        });
      }
    }
    
    // Common phrase suggestions
    const commonPhrases = [
      'Show me all',
      'Find records where',
      'Display data with',
      'Filter by',
      'Search for',
      'Get all rows where',
      'List items with',
      'Show records from'
    ];
    
    for (const phrase of commonPhrases) {
      if (phrase.toLowerCase().startsWith(query)) {
        suggestions.push({
          text: phrase,
          type: 'phrase',
          confidence: 0.7
        });
      }
    }
    
    // Operator suggestions
    if (query.includes(' is ') || query.includes(' = ') || query.includes(' equals ')) {
      suggestions.push({
        text: this.currentQuery + ' [value]',
        type: 'operator',
        confidence: 0.8
      });
    }
    
    this._autocompleteSuggestions.set(suggestions.slice(0, 8));
    this._showAutocomplete.set(suggestions.length > 0);
  }
  
  private updateLanguageContext(): void {
    if (this.speechRecognition) {
      this.speechRecognition.lang = this.selectedLanguage;
    }
  }
  
  private addToHistory(query: string): void {
    const historyItem = {
      query,
      timestamp: Date.now(),
      confidence: this.parsedResult()?.confidence || 0
    };
    
    this._queryHistory.update(history => {
      const newHistory = [historyItem, ...history.filter(h => h.query !== query)];
      return newHistory.slice(0, 50); // Keep last 50 queries
    });
    
    this.saveQueryHistory();
  }
  
  private loadQueryHistory(): void {
    try {
      const saved = localStorage.getItem('nlp-filter-history');
      if (saved) {
        const history = JSON.parse(saved);
        this._queryHistory.set(history);
      }
    } catch (error) {
      console.error('Error loading query history:', error);
    }
  }
  
  private saveQueryHistory(): void {
    try {
      localStorage.setItem('nlp-filter-history', JSON.stringify(this._queryHistory()));
    } catch (error) {
      console.error('Error saving query history:', error);
    }
  }
}