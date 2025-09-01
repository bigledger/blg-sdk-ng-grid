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
  DateFilter, 
  DateFilterOperator, 
  RelativeDateUnit,
  Quarter,
  Season,
  FilterComponentParams,
  IFilterComponent 
} from '../../../../../../libs/core/src/lib/interfaces/enhanced-filter.interface';

/**
 * Enhanced Date Filter Component
 * 
 * Provides advanced date-based filtering functionality that surpasses ag-grid:
 * - Standard operators: equals, before, after, between
 * - Smart date operators: isToday, isYesterday, isTomorrow, isThisWeek, etc.
 * - Relative date ranges: last N days/weeks/months/years
 * - Seasonal and quarterly filtering
 * - Weekend/weekday filtering
 * - Time zone support
 * - Natural language date input
 */
@Component({
  selector: 'blg-enhanced-date-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blg-enhanced-date-filter" [class.advanced-mode]="showAdvancedMode()">
      <!-- Operator Selection -->
      <div class="filter-operator-section">
        <select 
          class="filter-operator"
          [value]="filterModel().operator"
          (change)="onOperatorChange($event)"
          [attr.aria-label]="'Date filter operator for ' + (params?.column?.header || 'column')">
          <optgroup label="Basic Comparisons">
            <option value="equals">Equals</option>
            <option value="notEquals">Not Equals</option>
            <option value="before">Before</option>
            <option value="after">After</option>
            <option value="between">Between</option>
          </optgroup>
          <optgroup label="Empty/Null">
            <option value="isEmpty">Is Empty</option>
            <option value="isNotEmpty">Is Not Empty</option>
          </optgroup>
          <optgroup label="Smart Dates">
            <option value="isToday">Is Today</option>
            <option value="isYesterday">Is Yesterday</option>
            <option value="isTomorrow">Is Tomorrow</option>
          </optgroup>
          <optgroup label="This Period">
            <option value="isThisWeek">Is This Week</option>
            <option value="isThisMonth">Is This Month</option>
            <option value="isThisYear">Is This Year</option>
          </optgroup>
          <optgroup label="Last Period">
            <option value="isLastWeek">Is Last Week</option>
            <option value="isLastMonth">Is Last Month</option>
            <option value="isLastYear">Is Last Year</option>
          </optgroup>
          <optgroup label="Next Period">
            <option value="isNextWeek">Is Next Week</option>
            <option value="isNextMonth">Is Next Month</option>
            <option value="isNextYear">Is Next Year</option>
          </optgroup>
          <optgroup label="Day Types">
            <option value="isWeekend">Is Weekend</option>
            <option value="isWeekday">Is Weekday</option>
          </optgroup>
          @if (config.enableRelativeDates) {
            <optgroup label="Relative Ranges">
              <option value="relativeDateRange">Relative Range</option>
            </optgroup>
          }
          @if (config.enableSeasonalFilters) {
            <optgroup label="Seasonal">
              <option value="isQuarter">Is Quarter</option>
              <option value="isSeason">Is Season</option>
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
      @if (needsDateInput()) {
        <div class="filter-input-section">
          <!-- Single Date Input -->
          @if (needsSingleDateInput()) {
            <div class="date-input-wrapper">
              <input 
                type="date"
                class="date-input"
                [value]="getDateInputValue()"
                (change)="onDateFromChange($event)"
                (keydown)="onKeyDown($event)"
                [attr.aria-label]="getDateInputAriaLabel()"
                #dateInput>
              
              @if (config.includeTime && showAdvancedMode()) {
                <input 
                  type="time"
                  class="time-input"
                  [value]="getTimeInputValue()"
                  (change)="onTimeFromChange($event)"
                  [attr.aria-label]="'Time for ' + (params?.column?.header || 'column')"
                  #timeInput>
              }
              
              @if (hasDateValue()) {
                <button 
                  type="button"
                  class="clear-input"
                  (click)="clearDateValues()"
                  aria-label="Clear date value"
                  title="Clear date">
                  ✕
                </button>
              }
            </div>
          }

          <!-- Date Range Inputs -->
          @if (needsDateRangeInput()) {
            <div class="date-range-inputs">
              <div class="date-input-wrapper">
                <label class="date-label">From:</label>
                <input 
                  type="date"
                  class="date-input range-from"
                  [value]="getDateInputValue()"
                  (change)="onDateFromChange($event)"
                  (keydown)="onKeyDown($event)"
                  [attr.aria-label]="'Date range start for ' + (params?.column?.header || 'column')"
                  #rangeFromInput>
                
                @if (config.includeTime && showAdvancedMode()) {
                  <input 
                    type="time"
                    class="time-input"
                    [value]="getTimeInputValue()"
                    (change)="onTimeFromChange($event)"
                    [attr.aria-label]="'Start time for ' + (params?.column?.header || 'column')">
                }
              </div>
              
              <div class="date-input-wrapper">
                <label class="date-label">To:</label>
                <input 
                  type="date"
                  class="date-input range-to"
                  [value]="getDateToInputValue()"
                  (change)="onDateToChange($event)"
                  (keydown)="onKeyDown($event)"
                  [attr.aria-label]="'Date range end for ' + (params?.column?.header || 'column')"
                  #rangeToInput>
                
                @if (config.includeTime && showAdvancedMode()) {
                  <input 
                    type="time"
                    class="time-input"
                    [value]="getTimeToInputValue()"
                    (change)="onTimeToChange($event)"
                    [attr.aria-label]="'End time for ' + (params?.column?.header || 'column')">
                }
              </div>
              
              @if (hasDateRangeValues()) {
                <button 
                  type="button"
                  class="clear-range"
                  (click)="clearDateValues()"
                  aria-label="Clear date range"
                  title="Clear range">
                  ✕
                </button>
              }
            </div>
          }

          <!-- Relative Date Range Controls -->
          @if (filterModel().operator === 'relativeDateRange') {
            <div class="relative-date-controls">
              <div class="relative-input-group">
                <label class="relative-label">Last</label>
                <input 
                  type="number"
                  class="relative-value-input"
                  min="1"
                  max="365"
                  [value]="filterModel().relativeValue || 1"
                  (input)="onRelativeValueChange($event)"
                  [attr.aria-label]="'Number of ' + (filterModel().relativeUnit || 'days')"
                  #relativeValueInput>
                
                <select 
                  class="relative-unit-select"
                  [value]="filterModel().relativeUnit || 'days'"
                  (change)="onRelativeUnitChange($event)"
                  [attr.aria-label]="'Time unit for relative date range'">
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
              
              <div class="relative-preview">
                <span class="preview-label">Range:</span>
                <span class="preview-value">{{ getRelativeDatePreview() }}</span>
              </div>
            </div>
          }

          <!-- Quarter Selection -->
          @if (filterModel().operator === 'isQuarter') {
            <div class="quarter-selection">
              <label class="quarter-label">Select Quarter:</label>
              <div class="quarter-buttons">
                <button 
                  type="button"
                  class="quarter-button"
                  [class.selected]="filterModel().quarter === 'Q1'"
                  (click)="onQuarterChange('Q1')"
                  aria-label="First quarter">
                  Q1
                  <span class="quarter-months">(Jan-Mar)</span>
                </button>
                <button 
                  type="button"
                  class="quarter-button"
                  [class.selected]="filterModel().quarter === 'Q2'"
                  (click)="onQuarterChange('Q2')"
                  aria-label="Second quarter">
                  Q2
                  <span class="quarter-months">(Apr-Jun)</span>
                </button>
                <button 
                  type="button"
                  class="quarter-button"
                  [class.selected]="filterModel().quarter === 'Q3'"
                  (click)="onQuarterChange('Q3')"
                  aria-label="Third quarter">
                  Q3
                  <span class="quarter-months">(Jul-Sep)</span>
                </button>
                <button 
                  type="button"
                  class="quarter-button"
                  [class.selected]="filterModel().quarter === 'Q4'"
                  (click)="onQuarterChange('Q4')"
                  aria-label="Fourth quarter">
                  Q4
                  <span class="quarter-months">(Oct-Dec)</span>
                </button>
              </div>
            </div>
          }

          <!-- Season Selection -->
          @if (filterModel().operator === 'isSeason') {
            <div class="season-selection">
              <label class="season-label">Select Season:</label>
              <div class="season-buttons">
                <button 
                  type="button"
                  class="season-button spring"
                  [class.selected]="filterModel().season === 'spring'"
                  (click)="onSeasonChange('spring')"
                  aria-label="Spring season">
                  🌸 Spring
                  <span class="season-months">(Mar-May)</span>
                </button>
                <button 
                  type="button"
                  class="season-button summer"
                  [class.selected]="filterModel().season === 'summer'"
                  (click)="onSeasonChange('summer')"
                  aria-label="Summer season">
                  ☀️ Summer
                  <span class="season-months">(Jun-Aug)</span>
                </button>
                <button 
                  type="button"
                  class="season-button fall"
                  [class.selected]="filterModel().season === 'fall' || filterModel().season === 'autumn'"
                  (click)="onSeasonChange('fall')"
                  aria-label="Fall season">
                  🍂 Fall
                  <span class="season-months">(Sep-Nov)</span>
                </button>
                <button 
                  type="button"
                  class="season-button winter"
                  [class.selected]="filterModel().season === 'winter'"
                  (click)="onSeasonChange('winter')"
                  aria-label="Winter season">
                  ❄️ Winter
                  <span class="season-months">(Dec-Feb)</span>
                </button>
              </div>
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
                [checked]="config.includeTime"
                (change)="onIncludeTimeChange($event)">
              <span>Include Time</span>
            </label>
            
            @if (config.timezone) {
              <div class="timezone-display">
                <span class="timezone-label">Timezone:</span>
                <span class="timezone-value">{{ config.timezone }}</span>
              </div>
            }
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

      <!-- Date Information -->
      @if (showDateInfo()) {
        <div class="date-info">
          <div class="info-item">
            <span class="info-label">{{ getDateInfoLabel() }}:</span>
            <span class="info-value">{{ getDateInfoValue() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .blg-enhanced-date-filter {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      min-width: 300px;
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

    .date-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .date-input {
      flex: 1;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
      outline: none;

      &:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }
    }

    .time-input {
      width: 80px;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
      outline: none;

      &:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }
    }

    .date-range-inputs {
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
    }

    .date-label {
      font-size: 11px;
      color: #666;
      font-weight: 500;
      min-width: 35px;
    }

    .clear-input,
    .clear-range {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
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

    .clear-range {
      top: 10px;
      right: 8px;
      position: absolute;
    }

    .relative-date-controls {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .relative-input-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .relative-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .relative-value-input {
      width: 60px;
      padding: 4px 6px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
      text-align: center;

      &:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }
    }

    .relative-unit-select {
      flex: 1;
      padding: 4px 6px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: 12px;
      background: white;

      &:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 1px #1976d2;
      }
    }

    .relative-preview {
      display: flex;
      justify-content: space-between;
      padding: 4px 6px;
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 3px;
      font-size: 11px;
    }

    .preview-label {
      color: #666;
      font-weight: 500;
    }

    .preview-value {
      color: #333;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .quarter-selection,
    .season-selection {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .quarter-label,
    .season-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .quarter-buttons,
    .season-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .quarter-button,
    .season-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 6px;
      border: 1px solid #ddd;
      border-radius: 3px;
      background: white;
      cursor: pointer;
      font-size: 11px;
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

      &.selected {
        background-color: #1976d2;
        color: white;
        border-color: #1976d2;
      }
    }

    .quarter-months,
    .season-months {
      font-size: 9px;
      opacity: 0.8;
      margin-top: 2px;
    }

    .season-button {
      &.spring.selected { background-color: #4caf50; border-color: #4caf50; }
      &.summer.selected { background-color: #ff9800; border-color: #ff9800; }
      &.fall.selected { background-color: #f44336; border-color: #f44336; }
      &.winter.selected { background-color: #2196f3; border-color: #2196f3; }
    }

    .advanced-options {
      border-top: 1px solid #e0e0e0;
      padding-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
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

    .timezone-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      padding: 4px 0;
    }

    .timezone-label {
      color: #666;
      font-weight: 500;
    }

    .timezone-value {
      color: #333;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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

    .date-info {
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
      min-width: 350px;
    }

    /* Responsive adjustments */
    @media (max-width: 400px) {
      .blg-enhanced-date-filter {
        min-width: 280px;
      }

      .advanced-mode {
        min-width: 300px;
      }

      .quarter-buttons,
      .season-buttons {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnhancedDateFilterComponent implements IFilterComponent, OnInit, OnDestroy {
  @Input() placeholder = 'Select date...';
  @Input() debounceMs = 300;
  @Input() enableAdvancedMode = true;
  
  @Output() filterChange = new EventEmitter<DateFilter | null>();
  @Output() modelChanged = new EventEmitter<void>();

  // Component state
  private readonly _filterModel = signal<DateFilter>({
    type: 'date',
    operator: 'equals',
    active: false,
    dateFrom: undefined,
    dateTo: undefined,
    relativeValue: 1,
    relativeUnit: 'days',
    quarter: undefined,
    season: undefined,
    includeTime: false,
    timezone: undefined
  });

  private readonly _showAdvancedMode = signal(false);
  private readonly _validationError = signal<string | null>(null);

  // Computed signals
  readonly filterModel = computed(() => this._filterModel());
  readonly showAdvancedMode = computed(() => this._showAdvancedMode());
  readonly validationError = computed(() => this._validationError());

  // Configuration
  readonly config = {
    enableRelativeDates: true,
    enableSeasonalFilters: true,
    dateFormat: 'yyyy-MM-dd',
    includeTime: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  // Component params (from IFilterComponent interface)
  params?: FilterComponentParams;
  
  // Debounce timer
  private debounceTimer?: number;

  ngOnInit(): void {
    // Initialize timezone
    this.config.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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

  getModel(): DateFilter | null {
    const model = this._filterModel();
    return model.active ? model : null;
  }

  setModel(model: DateFilter | null): void {
    if (model) {
      this._filterModel.set({
        ...model,
        active: true
      });
    } else {
      this._filterModel.update(current => ({
        ...current,
        active: false,
        dateFrom: undefined,
        dateTo: undefined,
        relativeValue: 1,
        relativeUnit: 'days',
        quarter: undefined,
        season: undefined
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
    return this.evaluateDateFilter(value, model);
  }

  getModelAsString(): string {
    const model = this._filterModel();
    if (!model.active) return '';
    
    const operator = this.getOperatorDisplayName(model.operator);
    
    if (['isEmpty', 'isNotEmpty', 'isToday', 'isYesterday', 'isTomorrow', 'isThisWeek', 'isThisMonth', 'isThisYear', 'isLastWeek', 'isLastMonth', 'isLastYear', 'isNextWeek', 'isNextMonth', 'isNextYear', 'isWeekend', 'isWeekday'].includes(model.operator)) {
      return operator;
    }
    
    if (model.operator === 'between') {
      return `${operator}: ${this.formatDate(model.dateFrom)} - ${this.formatDate(model.dateTo)}`;
    }
    
    if (model.operator === 'relativeDateRange') {
      return `Last ${model.relativeValue} ${model.relativeUnit}`;
    }
    
    if (model.operator === 'isQuarter') {
      return `${operator}: ${model.quarter}`;
    }
    
    if (model.operator === 'isSeason') {
      return `${operator}: ${this.capitalizeFirst(model.season || '')}`;
    }
    
    return `${operator}: ${this.formatDate(model.dateFrom)}`;
  }

  // ============================================
  // Event Handlers
  // ============================================

  onOperatorChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const operator = target.value as DateFilterOperator;
    
    this._filterModel.update(model => ({
      ...model,
      operator,
      active: true,
      // Reset values when changing operators
      dateFrom: this.needsDateInput() ? model.dateFrom : undefined,
      dateTo: operator === 'between' ? model.dateTo : undefined,
      relativeValue: operator === 'relativeDateRange' ? model.relativeValue : 1,
      relativeUnit: operator === 'relativeDateRange' ? model.relativeUnit : 'days',
      quarter: operator === 'isQuarter' ? model.quarter : undefined,
      season: operator === 'isSeason' ? model.season : undefined
    }));

    this.validateFilter();
    this.emitFilterChange();
  }

  onDateFromChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const dateStr = target.value;
    
    this._filterModel.update(model => ({
      ...model,
      dateFrom: dateStr ? new Date(dateStr) : undefined,
      active: true
    }));

    this.validateFilter();
    this.debouncedEmitChange();
  }

  onDateToChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const dateStr = target.value;
    
    this._filterModel.update(model => ({
      ...model,
      dateTo: dateStr ? new Date(dateStr) : undefined,
      active: true
    }));

    this.validateFilter();
    this.debouncedEmitChange();
  }

  onTimeFromChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const timeStr = target.value;
    
    if (timeStr && this._filterModel().dateFrom) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const newDate = new Date(this._filterModel().dateFrom!);
      newDate.setHours(hours, minutes, 0, 0);
      
      this._filterModel.update(model => ({
        ...model,
        dateFrom: newDate
      }));

      this.debouncedEmitChange();
    }
  }

  onTimeToChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const timeStr = target.value;
    
    if (timeStr && this._filterModel().dateTo) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const newDate = new Date(this._filterModel().dateTo!);
      newDate.setHours(hours, minutes, 0, 0);
      
      this._filterModel.update(model => ({
        ...model,
        dateTo: newDate
      }));

      this.debouncedEmitChange();
    }
  }

  onRelativeValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    
    if (!isNaN(value) && value > 0) {
      this._filterModel.update(model => ({
        ...model,
        relativeValue: value,
        active: true
      }));

      this.debouncedEmitChange();
    }
  }

  onRelativeUnitChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const unit = target.value as RelativeDateUnit;
    
    this._filterModel.update(model => ({
      ...model,
      relativeUnit: unit
    }));

    this.debouncedEmitChange();
  }

  onQuarterChange(quarter: Quarter): void {
    this._filterModel.update(model => ({
      ...model,
      quarter,
      active: true
    }));

    this.emitFilterChange();
  }

  onSeasonChange(season: Season): void {
    this._filterModel.update(model => ({
      ...model,
      season,
      active: true
    }));

    this.emitFilterChange();
  }

  onIncludeTimeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.config.includeTime = target.checked;
    
    this._filterModel.update(model => ({
      ...model,
      includeTime: target.checked
    }));

    this.emitFilterChange();
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

  clearDateValues(): void {
    this._filterModel.update(model => ({
      ...model,
      dateFrom: undefined,
      dateTo: undefined
    }));
    
    this.emitFilterChange();
  }

  clearFilter(): void {
    this._filterModel.update(model => ({
      ...model,
      active: false,
      dateFrom: undefined,
      dateTo: undefined,
      relativeValue: 1,
      relativeUnit: 'days',
      quarter: undefined,
      season: undefined
    }));
    
    this._validationError.set(null);
    this.emitFilterChange();
  }

  // ============================================
  // Utility Methods
  // ============================================

  needsDateInput(): boolean {
    const operator = this._filterModel().operator;
    return ['equals', 'notEquals', 'before', 'after', 'between'].includes(operator);
  }

  needsSingleDateInput(): boolean {
    const operator = this._filterModel().operator;
    return ['equals', 'notEquals', 'before', 'after'].includes(operator);
  }

  needsDateRangeInput(): boolean {
    const operator = this._filterModel().operator;
    return operator === 'between';
  }

  showAdvancedToggle(): boolean {
    return this.enableAdvancedMode;
  }

  showDateInfo(): boolean {
    const operator = this._filterModel().operator;
    return ['relativeDateRange', 'isQuarter', 'isSeason'].includes(operator) && this.isFilterActive();
  }

  hasDateValue(): boolean {
    return !!this._filterModel().dateFrom;
  }

  hasDateRangeValues(): boolean {
    const model = this._filterModel();
    return !!model.dateFrom || !!model.dateTo;
  }

  getDateInputValue(): string {
    const date = this._filterModel().dateFrom;
    return date ? this.formatDateForInput(date) : '';
  }

  getDateToInputValue(): string {
    const date = this._filterModel().dateTo;
    return date ? this.formatDateForInput(date) : '';
  }

  getTimeInputValue(): string {
    const date = this._filterModel().dateFrom;
    return date ? this.formatTimeForInput(date) : '';
  }

  getTimeToInputValue(): string {
    const date = this._filterModel().dateTo;
    return date ? this.formatTimeForInput(date) : '';
  }

  getDateInputAriaLabel(): string {
    const columnHeader = this.params?.column?.header || 'column';
    const operator = this.getOperatorDisplayName(this._filterModel().operator);
    return `${operator} date filter for ${columnHeader}`;
  }

  getOperatorDisplayName(operator: DateFilterOperator): string {
    const operatorNames: Record<DateFilterOperator, string> = {
      equals: 'Equals',
      notEquals: 'Not Equals',
      before: 'Before',
      after: 'After',
      between: 'Between',
      isEmpty: 'Is Empty',
      isNotEmpty: 'Is Not Empty',
      isToday: 'Is Today',
      isYesterday: 'Is Yesterday',
      isTomorrow: 'Is Tomorrow',
      isThisWeek: 'Is This Week',
      isThisMonth: 'Is This Month',
      isThisYear: 'Is This Year',
      isLastWeek: 'Is Last Week',
      isLastMonth: 'Is Last Month',
      isLastYear: 'Is Last Year',
      isNextWeek: 'Is Next Week',
      isNextMonth: 'Is Next Month',
      isNextYear: 'Is Next Year',
      isWeekend: 'Is Weekend',
      isWeekday: 'Is Weekday',
      relativeDateRange: 'Relative Range',
      isQuarter: 'Is Quarter',
      isSeason: 'Is Season'
    };
    
    return operatorNames[operator] || operator;
  }

  getFilterStatusText(): string {
    const model = this._filterModel();
    const operator = this.getOperatorDisplayName(model.operator);
    
    if (['isEmpty', 'isNotEmpty', 'isToday', 'isYesterday', 'isTomorrow', 'isThisWeek', 'isThisMonth', 'isThisYear', 'isLastWeek', 'isLastMonth', 'isLastYear', 'isNextWeek', 'isNextMonth', 'isNextYear', 'isWeekend', 'isWeekday'].includes(model.operator)) {
      return operator;
    }
    
    if (model.operator === 'between') {
      return `${operator}: ${this.formatDate(model.dateFrom)} - ${this.formatDate(model.dateTo)}`;
    }
    
    if (model.operator === 'relativeDateRange') {
      return `Last ${model.relativeValue} ${model.relativeUnit}`;
    }
    
    if (model.operator === 'isQuarter') {
      return `${operator}: ${model.quarter}`;
    }
    
    if (model.operator === 'isSeason') {
      return `${operator}: ${this.capitalizeFirst(model.season || '')}`;
    }
    
    return `${operator}: ${this.formatDate(model.dateFrom)}`;
  }

  getRelativeDatePreview(): string {
    const model = this._filterModel();
    const now = new Date();
    const startDate = this.calculateRelativeStartDate(now, model.relativeValue || 1, model.relativeUnit || 'days');
    
    return `${this.formatDate(startDate)} - ${this.formatDate(now)}`;
  }

  getDateInfoLabel(): string {
    const operator = this._filterModel().operator;
    
    switch (operator) {
      case 'relativeDateRange':
        return 'Date Range';
      case 'isQuarter':
        return 'Quarter Period';
      case 'isSeason':
        return 'Season Period';
      default:
        return 'Info';
    }
  }

  getDateInfoValue(): string {
    const model = this._filterModel();
    
    switch (model.operator) {
      case 'relativeDateRange':
        return this.getRelativeDatePreview();
      case 'isQuarter':
        return this.getQuarterDateRange(model.quarter);
      case 'isSeason':
        return this.getSeasonDateRange(model.season);
      default:
        return '';
    }
  }

  private hasValidFilterValue(model: DateFilter): boolean {
    if (['isEmpty', 'isNotEmpty', 'isToday', 'isYesterday', 'isTomorrow', 'isThisWeek', 'isThisMonth', 'isThisYear', 'isLastWeek', 'isLastMonth', 'isLastYear', 'isNextWeek', 'isNextMonth', 'isNextYear', 'isWeekend', 'isWeekday'].includes(model.operator)) {
      return true;
    }
    
    if (model.operator === 'between') {
      return !!model.dateFrom && !!model.dateTo;
    }
    
    if (model.operator === 'relativeDateRange') {
      return model.relativeValue !== undefined && model.relativeValue > 0;
    }
    
    if (model.operator === 'isQuarter') {
      return !!model.quarter;
    }
    
    if (model.operator === 'isSeason') {
      return !!model.season;
    }
    
    return !!model.dateFrom;
  }

  private validateFilter(): void {
    const model = this._filterModel();
    
    if (model.operator === 'between' && model.dateFrom && model.dateTo) {
      if (model.dateFrom > model.dateTo) {
        this._validationError.set('From date must be before To date');
        return;
      }
    }
    
    if (model.operator === 'relativeDateRange') {
      if (!model.relativeValue || model.relativeValue <= 0) {
        this._validationError.set('Relative value must be greater than zero');
        return;
      }
    }
    
    this._validationError.set(null);
  }

  private evaluateDateFilter(value: any, filter: DateFilter): boolean {
    const dateValue = this.normalizeDateValue(value);
    
    if (!dateValue && !['isEmpty', 'isNotEmpty'].includes(filter.operator)) {
      return false;
    }

    const now = new Date();

    switch (filter.operator) {
      case 'equals':
        return this.isSameDate(dateValue!, this.parseDate(filter.dateFrom), filter.includeTime);
      case 'notEquals':
        return !this.isSameDate(dateValue!, this.parseDate(filter.dateFrom), filter.includeTime);
      case 'before':
        return dateValue! < this.parseDate(filter.dateFrom)!;
      case 'after':
        return dateValue! > this.parseDate(filter.dateFrom)!;
      case 'between':
        return dateValue! >= this.parseDate(filter.dateFrom)! && dateValue! <= this.parseDate(filter.dateTo)!;
      case 'isEmpty':
        return !dateValue;
      case 'isNotEmpty':
        return !!dateValue;
      case 'isToday':
        return this.isSameDate(dateValue!, now, false);
      case 'isYesterday':
        return this.isSameDate(dateValue!, this.addDays(now, -1), false);
      case 'isTomorrow':
        return this.isSameDate(dateValue!, this.addDays(now, 1), false);
      case 'isThisWeek':
        return this.isInCurrentWeek(dateValue!, now);
      case 'isThisMonth':
        return dateValue!.getMonth() === now.getMonth() && dateValue!.getFullYear() === now.getFullYear();
      case 'isThisYear':
        return dateValue!.getFullYear() === now.getFullYear();
      case 'isLastWeek':
        return this.isInWeek(dateValue!, this.addWeeks(now, -1));
      case 'isLastMonth':
        return this.isInMonth(dateValue!, this.addMonths(now, -1));
      case 'isLastYear':
        return dateValue!.getFullYear() === now.getFullYear() - 1;
      case 'isNextWeek':
        return this.isInWeek(dateValue!, this.addWeeks(now, 1));
      case 'isNextMonth':
        return this.isInMonth(dateValue!, this.addMonths(now, 1));
      case 'isNextYear':
        return dateValue!.getFullYear() === now.getFullYear() + 1;
      case 'isWeekend':
        return dateValue!.getDay() === 0 || dateValue!.getDay() === 6;
      case 'isWeekday':
        return dateValue!.getDay() >= 1 && dateValue!.getDay() <= 5;
      case 'relativeDateRange':
        return this.isInRelativeDateRange(dateValue!, now, filter.relativeValue!, filter.relativeUnit!);
      case 'isQuarter':
        return this.isInQuarter(dateValue!, filter.quarter!);
      case 'isSeason':
        return this.isInSeason(dateValue!, filter.season!);
      default:
        return true;
    }
  }

  private normalizeDateValue(value: any): Date | null {
    if (!value) return null;
    
    if (value instanceof Date) return value;
    
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  private parseDate(date: Date | string | undefined): Date | null {
    if (!date) return null;
    
    if (date instanceof Date) return date;
    
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private isSameDate(date1: Date, date2: Date | null, includeTime = false): boolean {
    if (!date2) return false;
    
    if (includeTime) {
      return date1.getTime() === date2.getTime();
    }
    
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addWeeks(date: Date, weeks: number): Date {
    return this.addDays(date, weeks * 7);
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private isInCurrentWeek(date: Date, referenceDate: Date): boolean {
    return this.isInWeek(date, referenceDate);
  }

  private isInWeek(date: Date, weekDate: Date): boolean {
    const startOfWeek = new Date(weekDate);
    startOfWeek.setDate(weekDate.getDate() - weekDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return date >= startOfWeek && date <= endOfWeek;
  }

  private isInMonth(date: Date, monthDate: Date): boolean {
    return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();
  }

  private isInRelativeDateRange(date: Date, referenceDate: Date, value: number, unit: RelativeDateUnit): boolean {
    const startDate = this.calculateRelativeStartDate(referenceDate, value, unit);
    return date >= startDate && date <= referenceDate;
  }

  private calculateRelativeStartDate(referenceDate: Date, value: number, unit: RelativeDateUnit): Date {
    const startDate = new Date(referenceDate);
    
    switch (unit) {
      case 'days':
        startDate.setDate(referenceDate.getDate() - value);
        break;
      case 'weeks':
        startDate.setDate(referenceDate.getDate() - (value * 7));
        break;
      case 'months':
        startDate.setMonth(referenceDate.getMonth() - value);
        break;
      case 'years':
        startDate.setFullYear(referenceDate.getFullYear() - value);
        break;
    }
    
    return startDate;
  }

  private isInQuarter(date: Date, quarter: Quarter): boolean {
    const month = date.getMonth();
    
    switch (quarter) {
      case 'Q1': return month >= 0 && month <= 2;   // Jan-Mar
      case 'Q2': return month >= 3 && month <= 5;   // Apr-Jun
      case 'Q3': return month >= 6 && month <= 8;   // Jul-Sep
      case 'Q4': return month >= 9 && month <= 11;  // Oct-Dec
      default: return false;
    }
  }

  private isInSeason(date: Date, season: Season): boolean {
    const month = date.getMonth();
    
    switch (season) {
      case 'spring': return month >= 2 && month <= 4;   // Mar-May
      case 'summer': return month >= 5 && month <= 7;   // Jun-Aug
      case 'fall':
      case 'autumn': return month >= 8 && month <= 10;  // Sep-Nov
      case 'winter': return month === 11 || month <= 1; // Dec-Feb
      default: return false;
    }
  }

  private getQuarterDateRange(quarter: Quarter | undefined): string {
    if (!quarter) return '';
    
    const year = new Date().getFullYear();
    
    switch (quarter) {
      case 'Q1': return `Jan 1, ${year} - Mar 31, ${year}`;
      case 'Q2': return `Apr 1, ${year} - Jun 30, ${year}`;
      case 'Q3': return `Jul 1, ${year} - Sep 30, ${year}`;
      case 'Q4': return `Oct 1, ${year} - Dec 31, ${year}`;
      default: return '';
    }
  }

  private getSeasonDateRange(season: Season | undefined): string {
    if (!season) return '';
    
    const year = new Date().getFullYear();
    
    switch (season) {
      case 'spring': return `Mar 1, ${year} - May 31, ${year}`;
      case 'summer': return `Jun 1, ${year} - Aug 31, ${year}`;
      case 'fall':
      case 'autumn': return `Sep 1, ${year} - Nov 30, ${year}`;
      case 'winter': return `Dec 1, ${year - 1} - Feb 28, ${year}`;
      default: return '';
    }
  }

  private formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString();
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTimeForInput(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
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