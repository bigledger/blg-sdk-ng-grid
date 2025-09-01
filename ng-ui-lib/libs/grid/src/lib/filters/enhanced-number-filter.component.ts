import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy, 
  signal,
  computed,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  NumberFilter, 
  NumberFilterOperator, 
  FilterComponentParams,
  IFilterComponent 
} from '../../../../../../libs/core/src/lib/interfaces/enhanced-filter.interface';

/**
 * Enhanced Number Filter Component
 * 
 * Provides advanced number-based filtering functionality that surpasses ag-grid:
 * - Standard operators: equals, greaterThan, lessThan, between
 * - Advanced operators: isEven, isOdd, isDivisibleBy, isPrime, isInteger, isDecimal
 * - Range filtering with enhanced UI
 * - Input validation and formatting
 * - Precision control for decimal comparisons
 * - Mathematical operation support
 */
@Component({
  selector: 'blg-enhanced-number-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-enhanced-number-filter" [class.advanced-mode]="showAdvancedMode()">
      <!-- Operator Selection -->
      <div class="filter-operator-section">
        <select 
          class="filter-operator"
          [value]="filterModel().operator"
          (change)="onOperatorChange($event)"
          [attr.aria-label]="'Number filter operator for ' + (params?.column?.header || 'column')">
          <optgroup label="Basic Comparisons">
            <option value="equals">Equals</option>
            <option value="notEquals">Not Equals</option>
            <option value="greaterThan">Greater Than</option>
            <option value="greaterThanOrEqual">Greater Than or Equal</option>
            <option value="lessThan">Less Than</option>
            <option value="lessThanOrEqual">Less Than or Equal</option>
          </optgroup>
          <optgroup label="Range Operations">
            <option value="inRange">In Range</option>
            <option value="notInRange">Not In Range</option>
          </optgroup>
          <optgroup label="Empty/Null">
            <option value="isEmpty">Is Empty</option>
            <option value="isNotEmpty">Is Not Empty</option>
          </optgroup>
          @if (config.enableAdvancedOperators) {
            <optgroup label="Advanced Math">
              <option value="isEven">Is Even</option>
              <option value="isOdd">Is Odd</option>
              <option value="isDivisibleBy">Is Divisible By</option>
              <option value="isPrime">Is Prime</option>
              <option value="isInteger">Is Integer</option>
              <option value="isDecimal">Has Decimal Places</option>
            </optgroup>
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
          <!-- Single Value Input -->
          @if (needsSingleInput()) {
            <div class="input-wrapper">
              <input 
                type="number"
                class="filter-input"
                [placeholder]="getInputPlaceholder()"
                [value]="filterModel().filter || ''"
                [step]="getInputStep()"
                (input)="onFilterValueChange($event)"
                (keydown)="onKeyDown($event)"
                [attr.aria-label]="getInputAriaLabel()"
                #filterInput>
              
              @if (filterModel().filter !== null && filterModel().filter !== undefined) {
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
          }

          <!-- Range Inputs -->
          @if (needsRangeInput()) {
            <div class="range-inputs">
              <div class="input-wrapper">
                <input 
                  type="number"
                  class="filter-input range-from"
                  placeholder="From"
                  [value]="filterModel().filter || ''"
                  [step]="getInputStep()"
                  (input)="onFilterValueChange($event)"
                  (keydown)="onKeyDown($event)"
                  [attr.aria-label]="'Range start for ' + (params?.column?.header || 'column')"
                  #rangeFromInput>
              </div>
              <span class="range-separator">to</span>
              <div class="input-wrapper">
                <input 
                  type="number"
                  class="filter-input range-to"
                  placeholder="To"
                  [value]="filterModel().filterTo || ''"
                  [step]="getInputStep()"
                  (input)="onFilterToValueChange($event)"
                  (keydown)="onKeyDown($event)"
                  [attr.aria-label]="'Range end for ' + (params?.column?.header || 'column')"
                  #rangeToInput>
              </div>
              @if (hasRangeValues()) {
                <button 
                  type="button"
                  class="clear-input"
                  (click)="clearRangeValues()"
                  aria-label="Clear range values"
                  title="Clear range">
                  ✕
                </button>
              }
            </div>
          }

          <!-- Divisor Input (for isDivisibleBy) -->
          @if (filterModel().operator === 'isDivisibleBy') {
            <div class="input-wrapper">
              <label class="divisor-label">Divisible by:</label>
              <input 
                type="number"
                class="filter-input divisor-input"
                placeholder="Divisor"
                [value]="filterModel().divisor || ''"
                step="1"
                min="1"
                (input)="onDivisorChange($event)"
                (keydown)="onKeyDown($event)"
                [attr.aria-label]="'Divisor for ' + (params?.column?.header || 'column')"
                #divisorInput>
            </div>
          }
        </div>
      }

      <!-- Advanced Options -->
      @if (showAdvancedMode()) {
        <div class="advanced-options">
          <!-- Precision Control -->
          @if (needsPrecisionControl()) {
            <div class="precision-control">
              <label class="precision-label">
                Decimal Precision: {{ filterModel().precision || 2 }}
              </label>
              <input 
                type="range"
                class="precision-slider"
                min="0"
                max="10"
                step="1"
                [value]="filterModel().precision || 2"
                (input)="onPrecisionChange($event)"
                aria-label="Decimal precision for comparison">
              <div class="precision-values">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          }

          <!-- Number Format Options -->
          <div class="format-options">
            <label class="option-checkbox">
              <input 
                type="checkbox"
                [checked]="config.allowDecimals"
                (change)="onAllowDecimalsChange($event)">
              <span>Allow Decimal Numbers</span>
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

      <!-- Mathematical Information -->
      @if (showMathInfo()) {
        <div class="math-info">
          <div class="info-item">
            <span class="info-label">{{ getMathInfoLabel() }}:</span>
            <span class="info-value">{{ getMathInfoValue() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .blg-enhanced-number-filter {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      min-width: 280px;
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

      optgroup {
        font-weight: bold;
        color: #666;
      }

      option {
        font-weight: normal;
        color: #333;
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
      gap: 8px;
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

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &[type=number] {
        -moz-appearance: textfield;
      }
    }

    .range-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;

      .input-wrapper {
        flex: 1;
      }

      .range-from,
      .range-to {
        padding-right: 8px;
      }

      .clear-input {
        position: absolute;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .range-separator {
      font-size: 12px;
      color: #666;
      white-space: nowrap;
      font-weight: 500;
    }

    .divisor-label {
      font-size: 11px;
      color: #666;
      font-weight: 500;
      white-space: nowrap;
      margin-right: 8px;
    }

    .divisor-input {
      max-width: 80px;
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

    .advanced-options {
      border-top: 1px solid #e0e0e0;
      padding-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .precision-control {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .precision-label {
      font-size: 11px;
      color: #666;
      font-weight: 500;
    }

    .precision-slider {
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

    .precision-values {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #999;
      margin-top: 2px;
    }

    .format-options {
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

    .math-info {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 3px;
      padding: 6px 8px;
      font-size: 11px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      color: #666;
      font-weight: 500;
    }

    .info-value {
      color: #333;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .advanced-mode {
      min-width: 320px;
    }

    /* Responsive adjustments */
    @media (max-width: 400px) {
      .blg-enhanced-number-filter {
        min-width: 240px;
      }

      .advanced-mode {
        min-width: 260px;
      }

      .range-inputs {
        flex-direction: column;
        gap: 4px;

        .range-separator {
          display: none;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnhancedNumberFilterComponent implements IFilterComponent, OnInit, OnDestroy {
  @Input() placeholder = 'Enter number...';
  @Input() debounceMs = 300;
  @Input() enableAdvancedMode = true;
  
  @Output() filterChange = new EventEmitter<NumberFilter | null>();
  @Output() modelChanged = new EventEmitter<void>();

  // Component state
  private readonly _filterModel = signal<NumberFilter>({
    type: 'number',
    operator: 'equals',
    active: false,
    filter: null,
    filterTo: null,
    divisor: null,
    precision: 2
  });

  private readonly _showAdvancedMode = signal(false);
  private readonly _validationError = signal<string | null>(null);

  // Computed signals
  readonly filterModel = computed(() => this._filterModel());
  readonly showAdvancedMode = computed(() => this._showAdvancedMode());
  readonly validationError = computed(() => this._validationError());

  // Configuration
  readonly config = {
    enableAdvancedOperators: true,
    allowDecimals: true,
    decimalPlaces: 2
  };

  // Component params (from IFilterComponent interface)
  params?: FilterComponentParams;
  
  // Debounce timer
  private debounceTimer?: number;

  ngOnInit(): void {
    // Initialize with default precision
    this._filterModel.update(model => ({
      ...model,
      precision: this.config.decimalPlaces
    }));
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

  getModel(): NumberFilter | null {
    const model = this._filterModel();
    return model.active ? model : null;
  }

  setModel(model: NumberFilter | null): void {
    if (model) {
      this._filterModel.set({
        ...model,
        active: true
      });
    } else {
      this._filterModel.update(current => ({
        ...current,
        active: false,
        filter: null,
        filterTo: null,
        divisor: null
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
    return this.evaluateNumberFilter(value, model);
  }

  getModelAsString(): string {
    const model = this._filterModel();
    if (!model.active) return '';
    
    const operator = this.getOperatorDisplayName(model.operator);
    
    if (['isEmpty', 'isNotEmpty', 'isEven', 'isOdd', 'isPrime', 'isInteger', 'isDecimal'].includes(model.operator)) {
      return operator;
    }
    
    if (['inRange', 'notInRange'].includes(model.operator)) {
      return `${operator}: ${model.filter} - ${model.filterTo}`;
    }
    
    if (model.operator === 'isDivisibleBy') {
      return `${operator} ${model.divisor}`;
    }
    
    return `${operator} ${model.filter}`;
  }

  // ============================================
  // Event Handlers
  // ============================================

  onOperatorChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const operator = target.value as NumberFilterOperator;
    
    this._filterModel.update(model => ({
      ...model,
      operator,
      active: true,
      // Reset values when changing operators
      filter: ['isEmpty', 'isNotEmpty', 'isEven', 'isOdd', 'isPrime', 'isInteger', 'isDecimal'].includes(operator) ? null : model.filter,
      filterTo: ['inRange', 'notInRange'].includes(operator) ? model.filterTo : null,
      divisor: operator === 'isDivisibleBy' ? model.divisor : null
    }));

    this.validateFilter();
    this.emitFilterChange();
  }

  onFilterValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = this.parseNumberInput(target.value);
    
    this._filterModel.update(model => ({
      ...model,
      filter: value,
      active: true
    }));

    this.validateFilter();
    this.debouncedEmitChange();
  }

  onFilterToValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = this.parseNumberInput(target.value);
    
    this._filterModel.update(model => ({
      ...model,
      filterTo: value,
      active: true
    }));

    this.validateFilter();
    this.debouncedEmitChange();
  }

  onDivisorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = this.parseNumberInput(target.value);
    
    this._filterModel.update(model => ({
      ...model,
      divisor: value,
      active: true
    }));

    this.validateFilter();
    this.debouncedEmitChange();
  }

  onPrecisionChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const precision = parseInt(target.value, 10);
    
    this._filterModel.update(model => ({
      ...model,
      precision
    }));

    this.debouncedEmitChange();
  }

  onAllowDecimalsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.config.allowDecimals = target.checked;
    
    if (!target.checked) {
      // Convert current values to integers
      this._filterModel.update(model => ({
        ...model,
        filter: model.filter ? Math.floor(model.filter) : model.filter,
        filterTo: model.filterTo ? Math.floor(model.filterTo) : model.filterTo,
        divisor: model.divisor ? Math.floor(model.divisor) : model.divisor
      }));
    }

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

  toggleAdvancedMode(): void {
    this._showAdvancedMode.update(current => !current);
  }

  clearFilterValue(): void {
    this._filterModel.update(model => ({
      ...model,
      filter: null
    }));
    
    this.emitFilterChange();
  }

  clearRangeValues(): void {
    this._filterModel.update(model => ({
      ...model,
      filter: null,
      filterTo: null
    }));
    
    this.emitFilterChange();
  }

  clearFilter(): void {
    this._filterModel.update(model => ({
      ...model,
      active: false,
      filter: null,
      filterTo: null,
      divisor: null,
      precision: 2
    }));
    
    this._validationError.set(null);
    this.emitFilterChange();
  }

  // ============================================
  // Utility Methods
  // ============================================

  needsFilterInput(): boolean {
    const operator = this._filterModel().operator;
    return !['isEmpty', 'isNotEmpty', 'isEven', 'isOdd', 'isPrime', 'isInteger', 'isDecimal'].includes(operator);
  }

  needsSingleInput(): boolean {
    const operator = this._filterModel().operator;
    return ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual'].includes(operator);
  }

  needsRangeInput(): boolean {
    const operator = this._filterModel().operator;
    return ['inRange', 'notInRange'].includes(operator);
  }

  needsPrecisionControl(): boolean {
    return this.config.allowDecimals;
  }

  showAdvancedToggle(): boolean {
    return this.enableAdvancedMode;
  }

  showMathInfo(): boolean {
    const operator = this._filterModel().operator;
    return ['isPrime', 'isDivisibleBy'].includes(operator) && this.isFilterActive();
  }

  hasRangeValues(): boolean {
    const model = this._filterModel();
    return model.filter !== null || model.filterTo !== null;
  }

  getInputStep(): string {
    if (!this.config.allowDecimals) return '1';
    
    const precision = this._filterModel().precision || 2;
    return (1 / Math.pow(10, precision)).toString();
  }

  getInputPlaceholder(): string {
    const operator = this._filterModel().operator;
    
    switch (operator) {
      case 'equals':
        return 'Enter value...';
      case 'greaterThan':
        return 'Greater than...';
      case 'lessThan':
        return 'Less than...';
      case 'inRange':
      case 'notInRange':
        return 'Range value...';
      default:
        return this.placeholder;
    }
  }

  getInputAriaLabel(): string {
    const columnHeader = this.params?.column?.header || 'column';
    const operator = this.getOperatorDisplayName(this._filterModel().operator);
    return `${operator} filter for ${columnHeader}`;
  }

  getOperatorDisplayName(operator: NumberFilterOperator): string {
    const operatorNames: Record<NumberFilterOperator, string> = {
      equals: 'Equals',
      notEquals: 'Not Equals',
      greaterThan: 'Greater Than',
      greaterThanOrEqual: 'Greater or Equal',
      lessThan: 'Less Than',
      lessThanOrEqual: 'Less or Equal',
      inRange: 'In Range',
      notInRange: 'Not In Range',
      isEmpty: 'Is Empty',
      isNotEmpty: 'Is Not Empty',
      isEven: 'Is Even',
      isOdd: 'Is Odd',
      isDivisibleBy: 'Is Divisible By',
      isPrime: 'Is Prime',
      isInteger: 'Is Integer',
      isDecimal: 'Has Decimals'
    };
    
    return operatorNames[operator] || operator;
  }

  getFilterStatusText(): string {
    const model = this._filterModel();
    const operator = this.getOperatorDisplayName(model.operator);
    
    if (['isEmpty', 'isNotEmpty', 'isEven', 'isOdd', 'isPrime', 'isInteger', 'isDecimal'].includes(model.operator)) {
      return operator;
    }
    
    if (['inRange', 'notInRange'].includes(model.operator)) {
      return `${operator}: ${model.filter} - ${model.filterTo}`;
    }
    
    if (model.operator === 'isDivisibleBy') {
      return `${operator} ${model.divisor}`;
    }
    
    return `${operator} ${model.filter}`;
  }

  getMathInfoLabel(): string {
    const operator = this._filterModel().operator;
    
    switch (operator) {
      case 'isPrime':
        return 'Prime Check';
      case 'isDivisibleBy':
        return 'Divisibility';
      default:
        return 'Info';
    }
  }

  getMathInfoValue(): string {
    const model = this._filterModel();
    
    switch (model.operator) {
      case 'isPrime':
        return 'Checking if number is prime';
      case 'isDivisibleBy':
        return `Divisor: ${model.divisor || 'Not Set'}`;
      default:
        return '';
    }
  }

  private hasValidFilterValue(model: NumberFilter): boolean {
    if (['isEmpty', 'isNotEmpty', 'isEven', 'isOdd', 'isPrime', 'isInteger', 'isDecimal'].includes(model.operator)) {
      return true;
    }
    
    if (['inRange', 'notInRange'].includes(model.operator)) {
      return model.filter !== null && model.filterTo !== null;
    }
    
    if (model.operator === 'isDivisibleBy') {
      return model.divisor !== null && model.divisor > 0;
    }
    
    return model.filter !== null;
  }

  private parseNumberInput(value: string): number | null {
    if (!value || value.trim() === '') return null;
    
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    
    if (!this.config.allowDecimals) {
      return Math.floor(num);
    }
    
    const precision = this._filterModel().precision || 2;
    return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
  }

  private validateFilter(): void {
    const model = this._filterModel();
    
    if (['inRange', 'notInRange'].includes(model.operator)) {
      if (model.filter !== null && model.filterTo !== null && model.filter > model.filterTo) {
        this._validationError.set('From value must be less than To value');
        return;
      }
    }
    
    if (model.operator === 'isDivisibleBy') {
      if (model.divisor !== null && model.divisor <= 0) {
        this._validationError.set('Divisor must be greater than zero');
        return;
      }
    }
    
    this._validationError.set(null);
  }

  private evaluateNumberFilter(value: any, filter: NumberFilter): boolean {
    const numValue = this.normalizeNumberValue(value);
    const filterValue = filter.filter;
    const filterValue2 = filter.filterTo;

    if (numValue === null && !['isEmpty', 'isNotEmpty'].includes(filter.operator)) {
      return false;
    }

    switch (filter.operator) {
      case 'equals':
        return this.numbersEqual(numValue, filterValue, filter.precision);
      case 'notEquals':
        return !this.numbersEqual(numValue, filterValue, filter.precision);
      case 'greaterThan':
        return numValue! > filterValue!;
      case 'greaterThanOrEqual':
        return numValue! >= filterValue!;
      case 'lessThan':
        return numValue! < filterValue!;
      case 'lessThanOrEqual':
        return numValue! <= filterValue!;
      case 'inRange':
        return numValue! >= filterValue! && numValue! <= filterValue2!;
      case 'notInRange':
        return !(numValue! >= filterValue! && numValue! <= filterValue2!);
      case 'isEmpty':
        return numValue === null;
      case 'isNotEmpty':
        return numValue !== null;
      case 'isEven':
        return numValue! % 2 === 0;
      case 'isOdd':
        return numValue! % 2 !== 0;
      case 'isDivisibleBy':
        return filter.divisor && numValue! % filter.divisor === 0;
      case 'isPrime':
        return this.isPrime(numValue!);
      case 'isInteger':
        return Number.isInteger(numValue);
      case 'isDecimal':
        return !Number.isInteger(numValue);
      default:
        return true;
    }
  }

  private normalizeNumberValue(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  private numbersEqual(num1: number | null, num2: number | null, precision = 2): boolean {
    if (num1 === null || num2 === null) return num1 === num2;
    
    const factor = Math.pow(10, precision);
    return Math.round(num1 * factor) === Math.round(num2 * factor);
  }

  private isPrime(num: number): boolean {
    if (num < 2) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false;
    }
    return true;
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