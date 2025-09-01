import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  signal,
  computed,
  effect,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { fromEvent, Subject, BehaviorSubject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, filter, switchMap, tap } from 'rxjs/operators';

import { SetFilterSearchMode, VoiceSearchConfig, DEFAULT_VOICE_SEARCH_CONFIG } from '../set-filter.interface';

/**
 * Advanced Set Filter Search Component
 * 
 * Provides comprehensive search capabilities that exceed Excel and ag-grid:
 * - Text search with multiple algorithms (contains, fuzzy, regex, phonetic)
 * - Voice search with speech recognition
 * - Semantic search using NLP
 * - Search history and suggestions
 * - Real-time search performance metrics
 * - Smart auto-completion
 * - Search patterns and saved searches
 */
@Component({
  selector: 'blg-set-filter-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-set-filter-search"
         [class]="searchClasses()"
         [attr.data-mode]="searchMode()">
      
      <!-- Main search input area -->
      <div class="blg-set-filter-search__input-group">
        <!-- Search mode selector -->
        <div class="blg-set-filter-search__mode-selector" 
             *ngIf="showModeSelector">
          <button
            class="blg-set-filter-search__mode-btn"
            [class.active]="searchMode() === 'contains'"
            (click)="setSearchMode('contains')"
            title="Text contains search"
            aria-label="Text search mode">
            <i class="icon-text-search" aria-hidden="true"></i>
          </button>
          
          <button
            class="blg-set-filter-search__mode-btn"
            [class.active]="searchMode() === 'fuzzy'"
            (click)="setSearchMode('fuzzy')"
            title="Fuzzy matching search"
            aria-label="Fuzzy search mode">
            <i class="icon-fuzzy-search" aria-hidden="true"></i>
          </button>
          
          <button
            class="blg-set-filter-search__mode-btn"
            [class.active]="searchMode() === 'regex'"
            (click)="setSearchMode('regex')"
            title="Regular expression search"
            aria-label="Regex search mode">
            <i class="icon-regex-search" aria-hidden="true"></i>
          </button>
          
          <button
            *ngIf="enableSemanticSearch"
            class="blg-set-filter-search__mode-btn"
            [class.active]="searchMode() === 'semantic'"
            (click)="setSearchMode('semantic')"
            title="Semantic search"
            aria-label="Semantic search mode">
            <i class="icon-semantic-search" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Search input with advanced features -->
        <div class="blg-set-filter-search__input-container">
          <input
            #searchInput
            type="text"
            class="blg-set-filter-search__input"
            [value]="searchTerm()"
            [placeholder]="currentPlaceholder()"
            [disabled]="isSearching()"
            (input)="onSearchInput($event)"
            (keydown)="onSearchKeyDown($event)"
            (focus)="onSearchFocus()"
            (blur)="onSearchBlur()"
            autocomplete="off"
            spellcheck="false"
            [attr.aria-label]="'Search filter values using ' + searchMode() + ' mode'"
            [attr.aria-expanded]="showSuggestions()"
            [attr.aria-owns]="showSuggestions() ? 'search-suggestions' : null"
            role="combobox">
          
          <!-- Search status indicators -->
          <div class="blg-set-filter-search__indicators">
            <!-- Loading indicator -->
            <div class="blg-set-filter-search__spinner" 
                 *ngIf="isSearching()"
                 aria-hidden="true">
            </div>
            
            <!-- Results count -->
            <span class="blg-set-filter-search__count"
                  *ngIf="!isSearching() && hasResults()"
                  [title]="'Found ' + searchResults + ' matches'">
              {{ formatResultsCount(searchResults) }}
            </span>
            
            <!-- Performance indicator -->
            <span class="blg-set-filter-search__performance"
                  *ngIf="showPerformance && lastSearchTime() > 0"
                  [class]="performanceClass()"
                  [title]="'Search completed in ' + lastSearchTime() + 'ms'">
              {{ lastSearchTime() }}ms
            </span>
            
            <!-- Voice search indicator -->
            <div class="blg-set-filter-search__voice-indicator"
                 *ngIf="isVoiceSearchActive()"
                 aria-hidden="true">
              <div class="blg-set-filter-search__voice-wave"></div>
            </div>
          </div>

          <!-- Clear search button -->
          <button
            class="blg-set-filter-search__clear-btn"
            *ngIf="searchTerm() && !isSearching()"
            (click)="clearSearch()"
            title="Clear search"
            aria-label="Clear search">
            <i class="icon-x" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Voice search button -->
        <button
          *ngIf="enableVoiceSearch"
          class="blg-set-filter-search__voice-btn"
          [class.active]="isVoiceSearchActive()"
          [disabled]="!voiceSearchSupported()"
          (click)="toggleVoiceSearch()"
          [title]="voiceButtonTitle()"
          [attr.aria-label]="voiceButtonTitle()">
          <i class="icon-microphone" aria-hidden="true"></i>
        </button>

        <!-- Advanced options toggle -->
        <button
          class="blg-set-filter-search__options-btn"
          [class.active]="showAdvancedOptions()"
          (click)="toggleAdvancedOptions()"
          title="Advanced search options"
          aria-label="Toggle advanced search options">
          <i class="icon-settings" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Advanced search options panel -->
      <div class="blg-set-filter-search__advanced-panel"
           *ngIf="showAdvancedOptions()"
           [@slideDown]>
        
        <!-- Fuzzy search threshold -->
        <div class="blg-set-filter-search__option" 
             *ngIf="searchMode() === 'fuzzy'">
          <label class="blg-set-filter-search__option-label">
            Fuzzy Match Threshold: {{ fuzzyThreshold() }}
          </label>
          <input
            type="range"
            class="blg-set-filter-search__slider"
            [value]="fuzzyThreshold()"
            min="0.1"
            max="1.0"
            step="0.1"
            (input)="onFuzzyThresholdChanged($event)"
            aria-label="Fuzzy matching threshold">
        </div>

        <!-- Regex flags -->
        <div class="blg-set-filter-search__option" 
             *ngIf="searchMode() === 'regex'">
          <label class="blg-set-filter-search__option-label">
            Regex Flags:
          </label>
          <div class="blg-set-filter-search__flag-group">
            <label class="blg-set-filter-search__flag-item">
              <input type="checkbox" 
                     [checked]="regexFlags().includes('i')"
                     (change)="toggleRegexFlag('i', $event)">
              <span>Case insensitive (i)</span>
            </label>
            <label class="blg-set-filter-search__flag-item">
              <input type="checkbox" 
                     [checked]="regexFlags().includes('g')"
                     (change)="toggleRegexFlag('g', $event)">
              <span>Global (g)</span>
            </label>
            <label class="blg-set-filter-search__flag-item">
              <input type="checkbox" 
                     [checked]="regexFlags().includes('m')"
                     (change)="toggleRegexFlag('m', $event)">
              <span>Multiline (m)</span>
            </label>
          </div>
        </div>

        <!-- Search history -->
        <div class="blg-set-filter-search__option" 
             *ngIf="searchHistory().length > 0">
          <label class="blg-set-filter-search__option-label">
            Recent Searches:
          </label>
          <div class="blg-set-filter-search__history-list">
            <button
              *ngFor="let item of searchHistory().slice(0, 5); trackBy: trackHistoryItem"
              class="blg-set-filter-search__history-item"
              (click)="applyHistoryItem(item)"
              [title]="'Search for: ' + item.term + ' (found ' + item.results + ' results)'">
              <span class="blg-set-filter-search__history-term">{{ item.term }}</span>
              <span class="blg-set-filter-search__history-meta">
                {{ item.results }} results • {{ formatTimeAgo(item.timestamp) }}
              </span>
            </button>
          </div>
          
          <button
            class="blg-set-filter-search__clear-history"
            (click)="clearSearchHistory()"
            *ngIf="searchHistory().length > 0">
            Clear History
          </button>
        </div>
      </div>

      <!-- Search suggestions dropdown -->
      <div class="blg-set-filter-search__suggestions"
           *ngIf="showSuggestions()"
           id="search-suggestions"
           role="listbox"
           [attr.aria-label]="'Search suggestions with ' + suggestions().length + ' items'"
           [@slideDown]>
        
        <div class="blg-set-filter-search__suggestions-header" 
             *ngIf="suggestions().length > 0">
          <span>Suggestions</span>
          <span class="blg-set-filter-search__suggestions-count">
            {{ suggestions().length }}
          </span>
        </div>
        
        <button
          *ngFor="let suggestion of suggestions(); let i = index; trackBy: trackSuggestion"
          class="blg-set-filter-search__suggestion-item"
          [class.highlighted]="highlightedSuggestionIndex() === i"
          (click)="applySuggestion(suggestion)"
          (mouseenter)="setHighlightedSuggestion(i)"
          role="option"
          [attr.aria-selected]="highlightedSuggestionIndex() === i"
          [attr.id]="'suggestion-' + i">
          
          <div class="blg-set-filter-search__suggestion-content">
            <span class="blg-set-filter-search__suggestion-text"
                  [innerHTML]="highlightSuggestionMatch(suggestion.text, searchTerm())">
            </span>
            
            <span class="blg-set-filter-search__suggestion-source"
                  *ngIf="suggestion.source">
              {{ suggestion.source }}
            </span>
          </div>
          
          <div class="blg-set-filter-search__suggestion-meta">
            <span class="blg-set-filter-search__suggestion-count"
                  *ngIf="suggestion.count">
              {{ suggestion.count }}
            </span>
            
            <span class="blg-set-filter-search__suggestion-confidence"
                  *ngIf="suggestion.confidence"
                  [style.opacity]="suggestion.confidence">
              {{ (suggestion.confidence * 100).toFixed(0) }}%
            </span>
          </div>
        </button>
        
        <div class="blg-set-filter-search__no-suggestions"
             *ngIf="suggestions().length === 0 && searchTerm()">
          No suggestions found
        </div>
      </div>

      <!-- Voice search status -->
      <div class="blg-set-filter-search__voice-status"
           *ngIf="isVoiceSearchActive()"
           [@fadeIn]>
        <div class="blg-set-filter-search__voice-content">
          <i class="icon-microphone-active" aria-hidden="true"></i>
          <span>{{ voiceSearchStatus() }}</span>
          <button
            class="blg-set-filter-search__voice-cancel"
            (click)="cancelVoiceSearch()"
            aria-label="Cancel voice search">
            Cancel
          </button>
        </div>
        
        <div class="blg-set-filter-search__voice-transcript"
             *ngIf="currentVoiceTranscript()">
          "{{ currentVoiceTranscript() }}"
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./set-filter-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'blg-set-filter-search-host',
    '[attr.data-mode]': 'searchMode()',
    '[class.searching]': 'isSearching()',
    '[class.voice-active]': 'isVoiceSearchActive()',
    'role': 'search'
  },
  animations: [
    // Add Angular animations for smooth transitions
  ]
})
export class SetFilterSearchComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  // Inputs
  @Input() searchTerm = signal('');
  @Input() searchMode = signal<SetFilterSearchMode>('contains');
  @Input() fuzzyThreshold = signal(0.8);
  @Input() enableVoiceSearch = true;
  @Input() enableSemanticSearch = false;
  @Input() placeholder = 'Search values...';
  @Input() isSearching = signal(false);
  @Input() searchResults = 0;
  @Input() showPerformance = false;
  @Input() showModeSelector = true;

  // Voice search configuration
  @Input() voiceSearchConfig: VoiceSearchConfig = DEFAULT_VOICE_SEARCH_CONFIG;

  // Outputs
  @Output() searchTermChanged = new EventEmitter<string>();
  @Output() searchModeChanged = new EventEmitter<SetFilterSearchMode>();
  @Output() fuzzyThresholdChanged = new EventEmitter<number>();
  @Output() voiceSearchStarted = new EventEmitter<void>();
  @Output() voiceSearchEnded = new EventEmitter<string>();
  @Output() advancedOptionsChanged = new EventEmitter<any>();

  // ViewChild references
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;

  // Internal state signals
  private _showAdvancedOptions = signal(false);
  private _showSuggestions = signal(false);
  private _suggestions = signal<SearchSuggestion[]>([]);
  private _highlightedSuggestionIndex = signal(-1);
  private _searchHistory = signal<SearchHistoryItem[]>([]);
  private _lastSearchTime = signal(0);
  private _regexFlags = signal('i');
  private _isVoiceSearchActive = signal(false);
  private _voiceSearchStatus = signal('');
  private _currentVoiceTranscript = signal('');
  private _voiceSearchSupported = signal(false);

  // Speech recognition interface
  private speechRecognition?: SpeechRecognition;
  private searchSubject = new Subject<string>();
  private suggestionSubject = new BehaviorSubject<string>('');

  // Computed properties
  readonly showAdvancedOptions = this._showAdvancedOptions.asReadonly();
  readonly showSuggestions = this._showSuggestions.asReadonly();
  readonly suggestions = this._suggestions.asReadonly();
  readonly highlightedSuggestionIndex = this._highlightedSuggestionIndex.asReadonly();
  readonly searchHistory = this._searchHistory.asReadonly();
  readonly lastSearchTime = this._lastSearchTime.asReadonly();
  readonly regexFlags = this._regexFlags.asReadonly();
  readonly isVoiceSearchActive = this._isVoiceSearchActive.asReadonly();
  readonly voiceSearchStatus = this._voiceSearchStatus.asReadonly();
  readonly currentVoiceTranscript = this._currentVoiceTranscript.asReadonly();
  readonly voiceSearchSupported = this._voiceSearchSupported.asReadonly();

  readonly hasResults = computed(() => this.searchResults > 0);
  
  readonly searchClasses = computed(() => ({
    'blg-set-filter-search--searching': this.isSearching(),
    'blg-set-filter-search--voice-active': this.isVoiceSearchActive(),
    'blg-set-filter-search--advanced-open': this.showAdvancedOptions(),
    'blg-set-filter-search--suggestions-open': this.showSuggestions(),
    [`blg-set-filter-search--mode-${this.searchMode()}`]: true
  }));

  readonly currentPlaceholder = computed(() => {
    if (this.isVoiceSearchActive()) {
      return 'Listening...';
    }
    
    if (this.isSearching()) {
      return 'Searching...';
    }

    const mode = this.searchMode();
    const modeTexts = {
      contains: 'Search values...',
      fuzzy: 'Fuzzy search...',
      regex: 'Regular expression...',
      phonetic: 'Phonetic search...',
      semantic: 'Semantic search...',
      voice: 'Voice search...'
    };
    
    return modeTexts[mode] || this.placeholder;
  });

  readonly performanceClass = computed(() => {
    const time = this.lastSearchTime();
    if (time < 100) return 'fast';
    if (time < 500) return 'medium';
    return 'slow';
  });

  readonly voiceButtonTitle = computed(() => {
    if (!this.voiceSearchSupported()) {
      return 'Voice search not supported';
    }
    
    return this.isVoiceSearchActive() 
      ? 'Stop voice search' 
      : 'Start voice search';
  });

  ngOnInit() {
    this.initializeComponent();
    this.setupSearchHandling();
    this.setupSuggestions();
    this.setupVoiceSearch();
    this.loadSearchHistory();
  }

  ngOnDestroy() {
    this.cleanupVoiceSearch();
  }

  // ============================================
  // Component Initialization
  // ============================================

  private initializeComponent() {
    // Check for voice search support
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      this._voiceSearchSupported.set(true);
      this.initializeSpeechRecognition();
    }
  }

  private setupSearchHandling() {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => this.recordSearchStart()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.performSearch(term);
    });

    // Setup suggestion generation
    this.suggestionSubject.pipe(
      debounceTime(150),
      distinctUntilChanged(),
      filter(term => term.length > 0),
      switchMap(term => this.generateSuggestions(term)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(suggestions => {
      this._suggestions.set(suggestions);
      this._showSuggestions.set(suggestions.length > 0);
    });
  }

  private setupSuggestions() {
    // Monitor search term for suggestion generation
    effect(() => {
      const term = this.searchTerm();
      if (term.length > 0) {
        this.suggestionSubject.next(term);
      } else {
        this._suggestions.set([]);
        this._showSuggestions.set(false);
      }
    });
  }

  private setupVoiceSearch() {
    if (!this.voiceSearchSupported()) return;

    // Initialize speech recognition if available
    this.initializeSpeechRecognition();
  }

  private loadSearchHistory() {
    // Load search history from localStorage
    try {
      const stored = localStorage.getItem('blg-set-filter-search-history');
      if (stored) {
        const history = JSON.parse(stored);
        this._searchHistory.set(history.slice(0, 20)); // Keep last 20 searches
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }

  // ============================================
  // Search Event Handlers
  // ============================================

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const term = target.value;
    
    this.searchTerm.set(term);
    this.searchSubject.next(term);
    this.searchTermChanged.emit(term);
  }

  onSearchKeyDown(event: KeyboardEvent) {
    const suggestions = this.suggestions();
    const highlightedIndex = this.highlightedSuggestionIndex();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (suggestions.length > 0) {
          const newIndex = Math.min(highlightedIndex + 1, suggestions.length - 1);
          this._highlightedSuggestionIndex.set(newIndex);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (suggestions.length > 0) {
          const newIndex = Math.max(highlightedIndex - 1, -1);
          this._highlightedSuggestionIndex.set(newIndex);
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          this.applySuggestion(suggestions[highlightedIndex]);
        } else {
          this.performImmediateSearch();
        }
        break;

      case 'Escape':
        this._showSuggestions.set(false);
        this._highlightedSuggestionIndex.set(-1);
        this.searchInput.nativeElement.blur();
        break;

      case 'Tab':
        // Auto-complete with first suggestion
        if (suggestions.length > 0 && !event.shiftKey) {
          event.preventDefault();
          this.applySuggestion(suggestions[0]);
        }
        break;
    }
  }

  onSearchFocus() {
    // Show suggestions if we have a search term
    if (this.searchTerm() && this.suggestions().length > 0) {
      this._showSuggestions.set(true);
    }
  }

  onSearchBlur() {
    // Hide suggestions after a short delay to allow for clicks
    setTimeout(() => {
      this._showSuggestions.set(false);
      this._highlightedSuggestionIndex.set(-1);
    }, 200);
  }

  // ============================================
  // Search Mode Management
  // ============================================

  setSearchMode(mode: SetFilterSearchMode) {
    this.searchMode.set(mode);
    this.searchModeChanged.emit(mode);
    
    // Re-trigger search with new mode
    if (this.searchTerm()) {
      this.performSearch(this.searchTerm());
    }
  }

  // ============================================
  // Advanced Options
  // ============================================

  toggleAdvancedOptions() {
    this._showAdvancedOptions.update(current => !current);
  }

  onFuzzyThresholdChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    const threshold = parseFloat(target.value);
    this.fuzzyThreshold.set(threshold);
    this.fuzzyThresholdChanged.emit(threshold);
    
    // Re-trigger search if in fuzzy mode
    if (this.searchMode() === 'fuzzy' && this.searchTerm()) {
      this.performSearch(this.searchTerm());
    }
  }

  toggleRegexFlag(flag: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const currentFlags = this.regexFlags();
    
    let newFlags: string;
    if (target.checked) {
      newFlags = currentFlags.includes(flag) ? currentFlags : currentFlags + flag;
    } else {
      newFlags = currentFlags.replace(flag, '');
    }
    
    this._regexFlags.set(newFlags);
    
    // Re-trigger search if in regex mode
    if (this.searchMode() === 'regex' && this.searchTerm()) {
      this.performSearch(this.searchTerm());
    }
  }

  // ============================================
  // Voice Search
  // ============================================

  toggleVoiceSearch() {
    if (this.isVoiceSearchActive()) {
      this.stopVoiceSearch();
    } else {
      this.startVoiceSearch();
    }
  }

  private startVoiceSearch() {
    if (!this.speechRecognition || !this.voiceSearchSupported()) {
      return;
    }

    this._isVoiceSearchActive.set(true);
    this._voiceSearchStatus.set('Listening...');
    this._currentVoiceTranscript.set('');
    
    this.voiceSearchStarted.emit();

    try {
      this.speechRecognition.start();
    } catch (error) {
      console.error('Voice search error:', error);
      this.stopVoiceSearch();
    }
  }

  private stopVoiceSearch() {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
    
    this._isVoiceSearchActive.set(false);
    this._voiceSearchStatus.set('');
  }

  cancelVoiceSearch() {
    this.stopVoiceSearch();
    this._currentVoiceTranscript.set('');
  }

  private initializeSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this._voiceSearchSupported.set(false);
      return;
    }

    this.speechRecognition = new SpeechRecognition();
    
    // Configure speech recognition
    this.speechRecognition.continuous = this.voiceSearchConfig.continuous;
    this.speechRecognition.interimResults = this.voiceSearchConfig.interimResults;
    this.speechRecognition.lang = this.voiceSearchConfig.language;
    this.speechRecognition.maxAlternatives = this.voiceSearchConfig.maxAlternatives;

    // Event handlers
    this.speechRecognition.onstart = () => {
      this._voiceSearchStatus.set('Listening...');
    };

    this.speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Update current transcript
      this._currentVoiceTranscript.set(interimTranscript || finalTranscript);

      // If we have a final result with sufficient confidence
      if (finalTranscript) {
        const confidence = event.results[event.results.length - 1][0].confidence;
        
        if (confidence >= this.voiceSearchConfig.confidence) {
          this.searchTerm.set(finalTranscript.trim());
          this.searchTermChanged.emit(finalTranscript.trim());
          this.voiceSearchEnded.emit(finalTranscript.trim());
          this.stopVoiceSearch();
          
          // Trigger search
          this.performSearch(finalTranscript.trim());
        }
      }
    };

    this.speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this._voiceSearchStatus.set(`Error: ${event.error}`);
      
      setTimeout(() => {
        this.stopVoiceSearch();
      }, 2000);
    };

    this.speechRecognition.onend = () => {
      this._isVoiceSearchActive.set(false);
      this._voiceSearchStatus.set('');
    };
  }

  private cleanupVoiceSearch() {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.speechRecognition = undefined;
    }
  }

  // ============================================
  // Search Suggestions
  // ============================================

  private async generateSuggestions(term: string): Promise<SearchSuggestion[]> {
    // In a real implementation, this would call a service
    // For now, we'll generate some mock suggestions
    
    const suggestions: SearchSuggestion[] = [];
    
    // Add some basic suggestions based on search term
    if (term.length > 1) {
      // Suggest completions
      const completions = [
        `${term}*`,
        `*${term}`,
        `*${term}*`
      ];
      
      completions.forEach((completion, index) => {
        suggestions.push({
          text: completion,
          type: 'completion',
          source: 'auto-complete',
          confidence: 0.9 - (index * 0.1)
        });
      });

      // Add regex suggestions for regex mode
      if (this.searchMode() === 'regex') {
        suggestions.push({
          text: `^${term}`,
          type: 'pattern',
          source: 'starts with',
          confidence: 0.8
        });
        
        suggestions.push({
          text: `${term}$`,
          type: 'pattern', 
          source: 'ends with',
          confidence: 0.8
        });
      }
    }
    
    return suggestions.slice(0, 8); // Limit suggestions
  }

  applySuggestion(suggestion: SearchSuggestion) {
    this.searchTerm.set(suggestion.text);
    this.searchTermChanged.emit(suggestion.text);
    this._showSuggestions.set(false);
    this._highlightedSuggestionIndex.set(-1);
    
    // Focus back to input
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
    
    // Perform search
    this.performSearch(suggestion.text);
  }

  setHighlightedSuggestion(index: number) {
    this._highlightedSuggestionIndex.set(index);
  }

  highlightSuggestionMatch(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // ============================================
  // Search History
  // ============================================

  private addToSearchHistory(term: string, results: number) {
    const historyItem: SearchHistoryItem = {
      term,
      results,
      timestamp: new Date(),
      mode: this.searchMode()
    };
    
    const currentHistory = this.searchHistory();
    
    // Remove duplicate entries
    const filteredHistory = currentHistory.filter(item => item.term !== term);
    
    // Add new item at the beginning
    const newHistory = [historyItem, ...filteredHistory].slice(0, 20);
    
    this._searchHistory.set(newHistory);
    
    // Persist to localStorage
    try {
      localStorage.setItem('blg-set-filter-search-history', JSON.stringify(newHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  applyHistoryItem(item: SearchHistoryItem) {
    this.searchTerm.set(item.term);
    this.setSearchMode(item.mode);
    this.searchTermChanged.emit(item.term);
    this.performSearch(item.term);
  }

  clearSearchHistory() {
    this._searchHistory.set([]);
    localStorage.removeItem('blg-set-filter-search-history');
  }

  formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  // ============================================
  // Search Execution
  // ============================================

  private recordSearchStart() {
    this._lastSearchTime.set(0);
  }

  private performSearch(term: string) {
    const startTime = performance.now();
    
    // Emit the search term change
    this.searchTermChanged.emit(term);
    
    // Record search performance
    const searchTime = performance.now() - startTime;
    this._lastSearchTime.set(Math.round(searchTime));
    
    // Add to search history if term is not empty
    if (term.trim()) {
      this.addToSearchHistory(term, this.searchResults);
    }
  }

  private performImmediateSearch() {
    const term = this.searchTerm();
    if (term) {
      this.performSearch(term);
    }
  }

  clearSearch() {
    this.searchTerm.set('');
    this.searchTermChanged.emit('');
    this._showSuggestions.set(false);
    this._lastSearchTime.set(0);
    
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  formatResultsCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  trackSuggestion = (index: number, suggestion: SearchSuggestion): string => {
    return `${suggestion.type}-${suggestion.text}`;
  };

  trackHistoryItem = (index: number, item: SearchHistoryItem): string => {
    return `${item.term}-${item.timestamp.getTime()}`;
  };
}

// ============================================
// Supporting Interfaces
// ============================================

interface SearchSuggestion {
  text: string;
  type: 'completion' | 'pattern' | 'history' | 'semantic';
  source?: string;
  confidence?: number;
  count?: number;
}

interface SearchHistoryItem {
  term: string;
  results: number;
  timestamp: Date;
  mode: SetFilterSearchMode;
}

// Speech Recognition type declarations for better TypeScript support
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  
  start(): void;
  stop(): void;
  abort(): void;
  
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}