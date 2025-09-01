import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy, 
  signal,
  computed,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  TextFilter, 
  TextFilterOperator, 
  FilterComponentParams,
  IFilterComponent 
} from '../../../../../../libs/core/src/lib/interfaces/enhanced-filter.interface';

/**
 * Enhanced Text Filter Component
 * 
 * Provides advanced text-based filtering functionality that surpasses ag-grid:
 * - Standard operators: contains, equals, startsWith, endsWith
 * - Advanced operators: regex, fuzzyMatch, isEmpty, isNotEmpty
 * - Performance optimizations with debouncing
 * - Real-time fuzzy matching with configurable threshold
 * - Regular expression support with flag options
 * - Case sensitivity toggle
 * - Whitespace trimming options
 */
@Component({
  selector: 'blg-enhanced-text-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-enhanced-text-filter" [class.advanced-mode]="showAdvancedMode()">
      <!-- Operator Selection -->
      <div class="filter-operator-section">
        <select 
          class="filter-operator"
          [value]="filterModel().operator"
          (change)="onOperatorChange($event)"
          [attr.aria-label]="'Text filter operator for ' + (params?.column?.header || 'column')">
          <option value="contains">Contains</option>
          <option value="notContains">Not Contains</option>
          <option value="equals">Equals</option>
          <option value="notEquals">Not Equals</option>
          <option value="startsWith">Starts With</option>
          <option value="endsWith">Ends With</option>
          <option value="isEmpty">Is Empty</option>
          <option value="isNotEmpty">Is Not Empty</option>
          @if (config.enableRegex) {
            <option value="regex">Regular Expression</option>
          }
          @if (config.enableFuzzyMatch) {
            <option value="fuzzyMatch">Fuzzy Match</option>
          }
        </select>

        <!-- Advanced Mode Toggle -->
        @if (showAdvancedToggle()) {
          <button 
            type="button"
            class="advanced-toggle"
            (click)="toggleAdvancedMode()"
            [attr.aria-label]="showAdvancedMode() ? 'Hide advanced options' : 'Show advanced options'"
            [title]="showAdvancedMode() ? 'Hide advanced options' : 'Show advanced options'">
            <span class="toggle-icon" [class.rotated]="showAdvancedMode()">⚙</span>
          </button>
        }
      </div>

      <!-- Filter Input Section -->
      @if (needsFilterInput()) {
        <div class="filter-input-section">
          <div class="input-wrapper">
            <input 
              type="text"
              class="filter-input"
              [class.regex-input]="filterModel().operator === 'regex'"
              [class.fuzzy-input]="filterModel().operator === 'fuzzyMatch'"
              [placeholder]="getInputPlaceholder()"
              [value]="filterModel().filter || ''"
              (input)="onFilterValueChange($event)"
              (keydown)="onKeyDown($event)"
              [attr.aria-label]="getInputAriaLabel()"
              #filterInput>
            
            @if (filterModel().filter) {
              <button 
                type="button"
                class="clear-input"
                (click)="clearFilterValue()"
                aria-label="Clear filter value"
                title="Clear filter value">
                ✕
              </button>
            }
          </div>

          <!-- Regex Flags (for regex operator) -->
          @if (filterModel().operator === 'regex' && showAdvancedMode()) {
            <div class="regex-flags">
              <label class="flags-label">Flags:</label>
              <div class="flag-options">
                <label class="flag-option">
                  <input 
                    type="checkbox" 
                    [checked]="hasRegexFlag('i')"
                    (change)="toggleRegexFlag('i', $event)">
                  <span>i</span>
                  <span class="flag-tooltip">Case insensitive</span>
                </label>
                <label class="flag-option">
                  <input 
                    type="checkbox" 
                    [checked]="hasRegexFlag('g')"
                    (change)="toggleRegexFlag('g', $event)">
                  <span>g</span>
                  <span class="flag-tooltip">Global match</span>
                </label>
                <label class="flag-option">
                  <input 
                    type="checkbox" 
                    [checked]="hasRegexFlag('m')"
                    (change)="toggleRegexFlag('m', $event)">
                  <span>m</span>
                  <span class="flag-tooltip">Multiline</span>
                </label>
              </div>
            </div>
          }

          <!-- Fuzzy Match Threshold (for fuzzyMatch operator) -->
          @if (filterModel().operator === 'fuzzyMatch' && showAdvancedMode()) {
            <div class="fuzzy-threshold">
              <label class="threshold-label">
                Similarity Threshold: {{ (filterModel().fuzzyThreshold || 0.8) * 100 | number:'1.0-0' }}%
              </label>
              <input 
                type="range"
                class="threshold-slider"
                min="0"
                max="1"
                step="0.05"
                [value]="filterModel().fuzzyThreshold || 0.8"
                (input)="onFuzzyThresholdChange($event)"
                aria-label="Fuzzy match similarity threshold">
            </div>
          }
        </div>
      }

      <!-- Advanced Options -->
      @if (showAdvancedMode()) {
        <div class="advanced-options">
          <div class="option-group">
            <label class="option-checkbox">
              <input 
                type="checkbox"
                [checked]="!filterModel().caseSensitive"
                (change)="onCaseSensitiveChange($event)">
              <span>Case Insensitive</span>
            </label>
            <label class="option-checkbox">
              <input 
                type="checkbox"
                [checked]="filterModel().trimWhitespace !== false"
                (change)="onTrimWhitespaceChange($event)">
              <span>Trim Whitespace</span>
            </label>
          </div>
        </div>
      }

      <!-- Filter Status -->
      @if (isFilterActive()) {
        <div class="filter-status">
          <span class="status-indicator active" title="Filter is active">●</span>
          <span class="status-text">{{ getFilterStatusText() }}</span>
          <button 
            type="button"
            class="clear-filter"
            (click)="clearFilter()"
            aria-label="Clear all filter settings"
            title="Clear filter">
            Clear
          </button>
        </div>
      }

      <!-- Validation Messages -->
      @if (validationError()) {
        <div class="validation-error" role="alert">
          {{ validationError() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .blg-enhanced-text-filter {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      min-width: 250px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      font-size: 13px;
    }

    .filter-operator-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-operator {
      flex: 1;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
      background: white;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }
    }

    .advanced-toggle {
      width: 28px;
      height: 28px;
      border: 1px solid #ddd;
      border-radius: 3px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background-color: #f5f5f5;
        border-color: #999;
      }

      &:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }
    }

    .toggle-icon {
      font-size: 14px;
      transition: transform 0.2s ease;
      
      &.rotated {
        transform: rotate(90deg);
      }
    }

    .filter-input-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .filter-input {
      flex: 1;
      padding: 6px 8px;
      padding-right: 28px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
      outline: none;

      &:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }

      &::placeholder {
        color: #999;
      }

      &.regex-input {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        background-color: #fafafa;
      }

      &.fuzzy-input {
        background-color: #f0f8ff;
      }
    }

    .clear-input {
      position: absolute;
      right: 4px;
      width: 18px;
      height: 18px;
      background: none;
      border: none;
      cursor: pointer;
      color: #666;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;

      &:hover {
        background-color: #f0f0f0;
        color: #333;
      }

      &:focus {
        outline: 1px solid #1976d2;
        outline-offset: 1px;
      }
    }

    .regex-flags {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
    }

    .flags-label {
      font-size: 11px;
      color: #666;
      font-weight: 500;
    }

    .flag-options {
      display: flex;
      gap: 12px;
    }

    .flag-option {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      cursor: pointer;
      position: relative;

      input[type="checkbox"] {
        width: 14px;
        height: 14px;
        cursor: pointer;
      }

      span:first-of-type {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-weight: bold;
        color: #1976d2;
      }

      .flag-tooltip {
        display: none;
        position: absolute;
        top: -28px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        white-space: nowrap;
        z-index: 1000;
      }

      &:hover .flag-tooltip {
        display: block;
      }
    }

    .fuzzy-threshold {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .threshold-label {
      font-size: 11px;
      color: #666;
      font-weight: 500;
    }

    .threshold-slider {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: #ddd;
      outline: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #1976d2;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #1976d2;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }
    }

    .advanced-options {
      border-top: 1px solid #e0e0e0;
      padding-top: 8px;
    }

    .option-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .option-checkbox {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      cursor: pointer;

      input[type="checkbox"] {
        width: 14px;
        height: 14px;
        cursor: pointer;
      }
    }

    .filter-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0;
      border-top: 1px solid #e0e0e0;
      font-size: 11px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      
      &.active {
        color: #4caf50;
      }
    }

    .status-text {
      flex: 1;
      color: #666;
    }

    .clear-filter {
      padding: 2px 8px;
      background: none;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 10px;
      cursor: pointer;
      color: #666;

      &:hover {
        background-color: #f5f5f5;
        border-color: #999;
      }

      &:focus {
        outline: none;
        border-color: #1976d2;
      }
    }

    .validation-error {
      color: #f44336;
      font-size: 11px;
      padding: 4px;
      background-color: #ffebee;
      border: 1px solid #ffcdd2;
      border-radius: 3px;
    }

    .advanced-mode {
      min-width: 300px;
    }

    /* Responsive adjustments */
    @media (max-width: 400px) {
      .blg-enhanced-text-filter {
        min-width: 200px;
      }

      .advanced-mode {
        min-width: 220px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnhancedTextFilterComponent implements IFilterComponent, OnInit, OnDestroy {
  @Input() placeholder = 'Filter value...';
  @Input() debounceMs = 300;
  @Input() enableAdvancedMode = true;
  
  @Output() filterChange = new EventEmitter<TextFilter | null>();
  @Output() modelChanged = new EventEmitter<void>();

  // Component state
  private readonly _filterModel = signal<TextFilter>({
    type: 'text',
    operator: 'contains',
    active: false,
    caseSensitive: false,
    trimWhitespace: true,
    filter: '',
    fuzzyThreshold: 0.8,
    regexFlags: 'i'
  });

  private readonly _showAdvancedMode = signal(false);
  private readonly _validationError = signal<string | null>(null);

  // Computed signals
  readonly filterModel = computed(() => this._filterModel());
  readonly showAdvancedMode = computed(() => this._showAdvancedMode());
  readonly validationError = computed(() => this._validationError());

  // Configuration
  readonly config = {
    enableRegex: true,
    enableFuzzyMatch: true,
    defaultCaseSensitive: false
  };

  // Component params (from IFilterComponent interface)
  params?: FilterComponentParams;
  
  // Debounce timer
  private debounceTimer?: number;

  ngOnInit(): void {
    // Initialize with default configuration
    if (!this.config.defaultCaseSensitive) {
      this._filterModel.update(model => ({
        ...model,
        caseSensitive: false
      }));
    }
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  // ============================================
  // IFilterComponent Implementation
  // ============================================

  init(params: FilterComponentParams): void {
    this.params = params;
    this.debounceMs = params.debounceMs || this.debounceMs;
  }

  getModel(): TextFilter | null {
    const model = this._filterModel();
    return model.active ? model : null;
  }

  setModel(model: TextFilter | null): void {
    if (model) {
      this._filterModel.set({
        ...model,
        active: true
      });
    } else {
      this._filterModel.update(current => ({
        ...current,
        active: false,
        filter: ''
      }));
    }
    this.validateFilter();
  }

  isFilterActive(): boolean {
    const model = this._filterModel();
    return model.active && this.hasValidFilterValue(model);
  }

  doesFilterPass(params: { value: any; data: any }): boolean {
    const model = this._filterModel();
    if (!this.isFilterActive()) return true;

    const value = params.value;
    return this.evaluateTextFilter(value, model);
  }

  getModelAsString(): string {
    const model = this._filterModel();
    if (!model.active) return '';
    
    const operator = this.getOperatorDisplayName(model.operator);
    const value = model.filter || '';
    
    if (['isEmpty', 'isNotEmpty'].includes(model.operator)) {
      return operator;
    }
    
    return `${operator}: "${value}"`;
  }

  // ============================================
  // Event Handlers
  // ============================================

  onOperatorChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const operator = target.value as TextFilterOperator;
    
    this._filterModel.update(model => ({
      ...model,
      operator,
      active: true
    }));

    this.validateFilter();
    this.emitFilterChange();
  }

  onFilterValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    this._filterModel.update(model => ({
      ...model,
      filter: value,
      active: true
    }));

    this.validateFilter();
    this.debouncedEmitChange();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.clearFilter();
      event.preventDefault();
    } else if (event.key === 'Enter') {
      this.emitFilterChange();
      event.preventDefault();
    }
  }

  onCaseSensitiveChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    
    this._filterModel.update(model => ({
      ...model,
      caseSensitive: !target.checked // Checkbox is for "Case Insensitive"
    }));

    this.emitFilterChange();
  }

  onTrimWhitespaceChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    
    this._filterModel.update(model => ({
      ...model,
      trimWhitespace: target.checked
    }));

    this.emitFilterChange();
  }

  onFuzzyThresholdChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const threshold = parseFloat(target.value);
    
    this._filterModel.update(model => ({
      ...model,
      fuzzyThreshold: threshold
    }));

    this.debouncedEmitChange();
  }

  toggleRegexFlag(flag: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentFlags = this._filterModel().regexFlags || '';
    
    let newFlags: string;
    if (target.checked) {
      newFlags = currentFlags.includes(flag) ? currentFlags : currentFlags + flag;
    } else {
      newFlags = currentFlags.replace(flag, '');
    }
    
    this._filterModel.update(model => ({
      ...model,
      regexFlags: newFlags
    }));

    this.validateFilter();
    this.debouncedEmitChange();
  }

  toggleAdvancedMode(): void {
    this._showAdvancedMode.update(current => !current);
  }

  clearFilterValue(): void {
    this._filterModel.update(model => ({
      ...model,
      filter: ''
    }));
    
    this.emitFilterChange();
  }

  clearFilter(): void {
    this._filterModel.update(model => ({
      ...model,
      active: false,
      filter: '',
      regexFlags: 'i',
      fuzzyThreshold: 0.8
    }));
    
    this._validationError.set(null);
    this.emitFilterChange();
  }

  // ============================================
  // Utility Methods
  // ============================================

  needsFilterInput(): boolean {
    const operator = this._filterModel().operator;
    return !['isEmpty', 'isNotEmpty'].includes(operator);
  }

  showAdvancedToggle(): boolean {
    return this.enableAdvancedMode && 
           ['regex', 'fuzzyMatch'].includes(this._filterModel().operator);
  }

  hasRegexFlag(flag: string): boolean {
    const flags = this._filterModel().regexFlags || '';
    return flags.includes(flag);
  }

  getInputPlaceholder(): string {
    const operator = this._filterModel().operator;
    
    switch (operator) {
      case 'regex':
        return 'Enter regular expression...';
      case 'fuzzyMatch':
        return 'Enter text for fuzzy matching...';
      case 'startsWith':
        return 'Starts with...';
      case 'endsWith':
        return 'Ends with...';
      case 'contains':
        return 'Contains text...';
      case 'equals':
        return 'Exact match...';
      default:
        return this.placeholder;
    }
  }

  getInputAriaLabel(): string {
    const columnHeader = this.params?.column?.header || 'column';
    const operator = this.getOperatorDisplayName(this._filterModel().operator);
    return `${operator} filter for ${columnHeader}`;
  }

  getOperatorDisplayName(operator: TextFilterOperator): string {
    const operatorNames: Record<TextFilterOperator, string> = {
      contains: 'Contains',
      notContains: 'Not Contains',
      equals: 'Equals',
      notEquals: 'Not Equals',
      startsWith: 'Starts With',
      endsWith: 'Ends With',
      isEmpty: 'Is Empty',
      isNotEmpty: 'Is Not Empty',
      regex: 'Regex',
      fuzzyMatch: 'Fuzzy Match'
    };
    
    return operatorNames[operator] || operator;
  }

  getFilterStatusText(): string {
    const model = this._filterModel();
    const operator = this.getOperatorDisplayName(model.operator);
    
    if (['isEmpty', 'isNotEmpty'].includes(model.operator)) {
      return operator;
    }
    
    const value = model.filter || '';
    if (model.operator === 'fuzzyMatch') {
      const threshold = Math.round((model.fuzzyThreshold || 0.8) * 100);
      return `${operator} "${value}" (${threshold}% similarity)`;
    }
    
    return `${operator} "${value}"`;
  }

  private hasValidFilterValue(model: TextFilter): boolean {
    if (['isEmpty', 'isNotEmpty'].includes(model.operator)) {
      return true;
    }
    
    return Boolean(model.filter && model.filter.trim().length > 0);
  }

  private validateFilter(): void {
    const model = this._filterModel();
    
    if (model.operator === 'regex' && model.filter) {
      try {
        new RegExp(model.filter, model.regexFlags);
        this._validationError.set(null);
      } catch (error) {
        this._validationError.set('Invalid regular expression');
      }
    } else {
      this._validationError.set(null);
    }
  }

  private evaluateTextFilter(value: any, filter: TextFilter): boolean {
    const stringValue = this.normalizeTextValue(value, filter);
    const filterValue = this.normalizeTextValue(filter.filter, filter);

    switch (filter.operator) {
      case 'contains':
        return stringValue.includes(filterValue);
      case 'notContains':
        return !stringValue.includes(filterValue);
      case 'equals':
        return stringValue === filterValue;
      case 'notEquals':
        return stringValue !== filterValue;
      case 'startsWith':
        return stringValue.startsWith(filterValue);
      case 'endsWith':
        return stringValue.endsWith(filterValue);
      case 'isEmpty':
        return !stringValue || stringValue.length === 0;
      case 'isNotEmpty':
        return stringValue && stringValue.length > 0;
      case 'regex':
        try {
          const regex = new RegExp(filter.filter!, filter.regexFlags || 'i');
          return regex.test(stringValue);
        } catch {
          return false;
        }
      case 'fuzzyMatch':
        return this.fuzzyMatch(stringValue, filterValue, filter.fuzzyThreshold || 0.8);
      default:
        return true;
    }
  }

  private normalizeTextValue(value: any, filter: TextFilter): string {
    let result = String(value || '');
    
    if (filter.trimWhitespace !== false) {
      result = result.trim();
    }
    
    if (!filter.caseSensitive) {
      result = result.toLowerCase();
    }
    
    return result;
  }

  private fuzzyMatch(text: string, pattern: string, threshold: number): boolean {
    if (!pattern) return true;
    if (!text) return false;
    
    const distance = this.levenshteinDistance(text, pattern);
    const maxLength = Math.max(text.length, pattern.length);
    const similarity = 1 - (distance / maxLength);
    return similarity >= threshold;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[a.length][b.length];
  }

  private debouncedEmitChange(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.emitFilterChange();
    }, this.debounceMs);
  }

  private emitFilterChange(): void {
    const model = this._filterModel();
    const isActive = this.isFilterActive();
    
    this.filterChange.emit(isActive ? model : null);
    this.modelChanged.emit();
    
    // Notify params callback if available
    if (this.params?.filterChangedCallback) {
      this.params.filterChangedCallback();
    }
  }
}