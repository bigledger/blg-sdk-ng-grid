import { 
  Component, 
  ChangeDetectionStrategy, 
  Input, 
  Output, 
  EventEmitter,
  OnInit, 
  OnDestroy,
  signal,
  computed,
  effect,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { 
  FilterConditionNode, 
  LogicalOperator 
} from '../multi-filter.interface';
import { Filter, FilterType } from '../../../../../../../core/src/lib/interfaces/enhanced-filter.interface';

/**
 * Filter Condition Component
 * 
 * Represents a single filter condition in the multi-filter system.
 * Features:
 * - Dynamic operator selection based on column type
 * - Real-time validation and preview
 * - Drag-and-drop reordering
 * - Advanced condition types (fuzzy matching, regex, etc.)
 * - Visual condition builder with autocomplete
 * - Weight-based filtering support
 */
@Component({
  selector: 'blg-filter-condition',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  template: `
    <div class="filter-condition" 
         [class.disabled]="!condition.enabled"
         [class.dragging]="isDragging()"
         [class.error]="hasError()"
         [class.weighted]="hasWeight()"
         cdkDrag
         [cdkDragData]="condition">
      
      <!-- Drag Handle -->
      <div class="drag-handle" cdkDragHandle>
        <i class="icon-drag-vertical"></i>
      </div>
      
      <!-- Enable/Disable Toggle -->
      <div class="condition-toggle">
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            [checked]="condition.enabled"
            (change)="toggleEnabled($event)">
          <span class="slider"></span>
        </label>
      </div>
      
      <!-- Column Selection -->
      <div class="column-selector">
        <select 
          class="column-select"
          [value]="condition.columnId"
          (change)="onColumnChanged($event)"
          [disabled]="!condition.enabled">
          <option value="" disabled>Select Column</option>
          <option 
            *ngFor="let column of columnOptions(); trackBy: trackColumn"
            [value]="column.field">
            {{column.headerName || column.field}}
          </option>
        </select>
        
        <!-- Column Type Indicator -->
        <div class="column-type-badge" 
             [class]="getColumnTypeClass()">
          {{getColumnType()}}
        </div>
      </div>
      
      <!-- Operator Selection -->
      <div class="operator-selector">
        <select 
          class="operator-select"
          [value]="condition.filter?.operator"
          (change)="onOperatorChanged($event)"
          [disabled]="!condition.enabled || !condition.columnId">
          <option value="" disabled>Select Operator</option>
          <optgroup *ngFor="let group of groupedOperators()" [label]="group.label">
            <option 
              *ngFor="let operator of group.operators"
              [value]="operator.value"
              [title]="operator.description">
              {{operator.label}}
            </option>
          </optgroup>
        </select>
        
        <!-- Advanced Operator Options -->
        <button 
          class="advanced-options-btn"
          (click)="toggleAdvancedOptions()"
          [class.active]="showAdvancedOptions()"
          [disabled]="!condition.enabled"
          title="Advanced operator options">
          <i class="icon-settings"></i>
        </button>
      </div>
      
      <!-- Value Input Section -->
      <div class="value-inputs" 
           [class.hidden]="!requiresValue()"
           *ngIf="condition.enabled && condition.columnId && condition.filter?.operator">
        
        <!-- Primary Value Input -->
        <div class="value-input-container" [ngSwitch]="getValueInputType()">
          
          <!-- Text Input -->
          <div *ngSwitchCase="'text'" class="text-input-wrapper">
            <input 
              type="text"
              class="value-input text-input"
              [(ngModel)]="filterValue"
              (ngModelChange)="onValueChanged()"
              (blur)="validateValue()"
              [placeholder]="getValuePlaceholder()"
              [disabled]="!condition.enabled">
            
            <!-- Text Input Enhancements -->
            <div class="text-enhancements" *ngIf="showTextEnhancements()">
              <label class="enhancement-option">
                <input 
                  type="checkbox" 
                  [(ngModel)]="caseSensitive"
                  (ngModelChange)="onCaseSensitiveChanged()">
                Case sensitive
              </label>
              
              <label class="enhancement-option" *ngIf="supportsRegex()">
                <input 
                  type="checkbox" 
                  [(ngModel)]="useRegex"
                  (ngModelChange)="onRegexChanged()">
                Regular expression
              </label>
              
              <label class="enhancement-option" *ngIf="supportsFuzzy()">
                <input 
                  type="checkbox" 
                  [(ngModel)]="useFuzzy"
                  (ngModelChange)="onFuzzyChanged()">
                Fuzzy matching
                <input 
                  type="range" 
                  class="fuzzy-threshold"
                  min="0" 
                  max="1" 
                  step="0.1"
                  [(ngModel)]="fuzzyThreshold"
                  (ngModelChange)="onFuzzyThresholdChanged()"
                  *ngIf="useFuzzy">
              </label>
            </div>
          </div>
          
          <!-- Number Input -->
          <div *ngSwitchCase="'number'" class="number-input-wrapper">
            <input 
              type="number"
              class="value-input number-input"
              [(ngModel)]="filterValue"
              (ngModelChange)="onValueChanged()"
              (blur)="validateValue()"
              [placeholder]="getValuePlaceholder()"
              [disabled]="!condition.enabled"
              [step]="getNumberStep()"
              [min]="getNumberMin()"
              [max]="getNumberMax()">
            
            <!-- Number Range Input (for range operators) -->
            <input 
              type="number"
              class="value-input number-input range-input"
              [(ngModel)]="filterValueTo"
              (ngModelChange)="onValueToChanged()"
              (blur)="validateValue()"
              placeholder="To"
              [disabled]="!condition.enabled"
              [step]="getNumberStep()"
              [min]="getNumberMin()"
              [max]="getNumberMax()"
              *ngIf="isRangeOperator()">
            
            <!-- Number Precision Control -->
            <div class="number-precision" *ngIf="showNumberPrecision()">
              <label>
                Precision:
                <input 
                  type="number" 
                  class="precision-input"
                  [(ngModel)]="numberPrecision"
                  (ngModelChange)="onPrecisionChanged()"
                  min="0" 
                  max="10">
              </label>
            </div>
          </div>
          
          <!-- Date Input -->
          <div *ngSwitchCase="'date'" class="date-input-wrapper">
            <input 
              type="datetime-local"
              class="value-input date-input"
              [(ngModel)]="filterValue"
              (ngModelChange)="onValueChanged()"
              (blur)="validateValue()"
              [disabled]="!condition.enabled"
              *ngIf="!isRelativeDateOperator()">
            
            <!-- Date Range Inputs -->
            <div class="date-range" *ngIf="isDateRangeOperator()">
              <input 
                type="datetime-local"
                class="value-input date-input"
                [(ngModel)]="filterValue"
                (ngModelChange)="onValueChanged()"
                placeholder="From"
                [disabled]="!condition.enabled">
              <input 
                type="datetime-local"
                class="value-input date-input"
                [(ngModel)]="filterValueTo"
                (ngModelChange)="onValueToChanged()"
                placeholder="To"
                [disabled]="!condition.enabled">
            </div>
            
            <!-- Relative Date Input -->
            <div class="relative-date" *ngIf="isRelativeDateOperator()">
              <input 
                type="number"
                class="value-input relative-value"
                [(ngModel)]="relativeValue"
                (ngModelChange)="onRelativeValueChanged()"
                [disabled]="!condition.enabled"
                min="1">
              <select 
                class="relative-unit"
                [(ngModel)]="relativeUnit"
                (ngModelChange)="onRelativeUnitChanged()"
                [disabled]="!condition.enabled">
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
            
            <!-- Date Options -->
            <div class="date-options" *ngIf="showDateOptions()">
              <label class="date-option">
                <input 
                  type="checkbox" 
                  [(ngModel)]="includeTime"
                  (ngModelChange)="onIncludeTimeChanged()">
                Include time
              </label>
              
              <select 
                class="timezone-select"
                [(ngModel)]="timezone"
                (ngModelChange)="onTimezoneChanged()"
                *ngIf="includeTime">
                <option value="">Local timezone</option>
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                <!-- Add more timezones -->
              </select>
            </div>
          </div>
          
          <!-- Boolean Input -->
          <div *ngSwitchCase="'boolean'" class="boolean-input-wrapper">
            <div class="boolean-buttons">
              <button 
                class="boolean-btn"
                [class.active]="filterValue === true"
                (click)="setBooleanValue(true)"
                [disabled]="!condition.enabled">
                True
              </button>
              <button 
                class="boolean-btn"
                [class.active]="filterValue === false"
                (click)="setBooleanValue(false)"
                [disabled]="!condition.enabled">
                False
              </button>
            </div>
          </div>
          
          <!-- Set/Multi-select Input -->
          <div *ngSwitchCase="'set'" class="set-input-wrapper">
            <div class="set-values">
              <div class="value-chip" 
                   *ngFor="let value of setValues(); trackBy: trackSetValue">
                <span class="chip-text">{{value}}</span>
                <button 
                  class="remove-chip-btn"
                  (click)="removeSetValue(value)"
                  [disabled]="!condition.enabled">
                  <i class="icon-close"></i>
                </button>
              </div>
              
              <input 
                type="text"
                class="add-value-input"
                [(ngModel)]="newSetValue"
                (keyup.enter)="addSetValue()"
                (blur)="addSetValue()"
                placeholder="Add value..."
                [disabled]="!condition.enabled">
            </div>
            
            <div class="set-options">
              <label class="set-option">
                <input 
                  type="checkbox" 
                  [(ngModel)]="selectAll"
                  (ngModelChange)="onSelectAllChanged()">
                Select all available values
              </label>
            </div>
          </div>
        </div>
        
        <!-- Value Validation Messages -->
        <div class="validation-messages" *ngIf="validationErrors().length > 0">
          <div class="validation-error" 
               *ngFor="let error of validationErrors()">
            <i class="icon-warning"></i>
            {{error}}
          </div>
        </div>
        
        <!-- Value Preview -->
        <div class="value-preview" *ngIf="showValuePreview() && isValidValue()">
          <span class="preview-label">Preview:</span>
          <span class="preview-value">{{getValuePreview()}}</span>
        </div>
      </div>
      
      <!-- Advanced Options Panel -->
      <div class="advanced-options-panel" 
           *ngIf="showAdvancedOptions() && condition.enabled"
           [@slideDown]>
        
        <!-- Condition Weight -->
        <div class="weight-control" *ngIf="supportsWeight()">
          <label class="weight-label">
            Condition Weight:
            <input 
              type="range" 
              class="weight-slider"
              min="0.1" 
              max="2.0" 
              step="0.1"
              [(ngModel)]="conditionWeight"
              (ngModelChange)="onWeightChanged()">
            <span class="weight-value">{{conditionWeight}}x</span>
          </label>
        </div>
        
        <!-- Condition Metadata -->
        <div class="condition-metadata">
          <input 
            type="text"
            class="condition-label"
            [(ngModel)]="conditionLabel"
            (ngModelChange)="onLabelChanged()"
            placeholder="Condition label (optional)">
          
          <textarea 
            class="condition-description"
            [(ngModel)]="conditionDescription"
            (ngModelChange)="onDescriptionChanged()"
            placeholder="Condition description (optional)"
            rows="2">
          </textarea>
        </div>
        
        <!-- Performance Hints -->
        <div class="performance-hints" *ngIf="performanceHints().length > 0">
          <h5>Performance Hints:</h5>
          <div class="hint-item" 
               *ngFor="let hint of performanceHints()"
               [class]="getHintClass(hint.severity)">
            <i class="hint-icon" [class]="getHintIcon(hint.severity)"></i>
            <span class="hint-text">{{hint.message}}</span>
          </div>
        </div>
      </div>
      
      <!-- Condition Actions -->
      <div class="condition-actions">
        <!-- Copy Condition -->
        <button 
          class="action-btn copy-btn"
          (click)="copyCondition()"
          [disabled]="!condition.enabled"
          title="Copy condition">
          <i class="icon-copy"></i>
        </button>
        
        <!-- Test Condition -->
        <button 
          class="action-btn test-btn"
          (click)="testCondition()"
          [disabled]="!condition.enabled || !isValidValue()"
          title="Test condition">
          <i class="icon-play"></i>
        </button>
        
        <!-- Remove Condition -->
        <button 
          class="action-btn remove-btn"
          (click)="removeCondition()"
          title="Remove condition">
          <i class="icon-trash"></i>
        </button>
      </div>
      
      <!-- Condition Statistics -->
      <div class="condition-stats" 
           *ngIf="showStats() && conditionStats()"
           [@fadeIn]>
        <div class="stat-item">
          <span class="stat-label">Matches:</span>
          <span class="stat-value">{{conditionStats()?.matchCount}}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Performance:</span>
          <span class="stat-value" [class]="getPerformanceClass()">
            {{conditionStats()?.performanceMs}}ms
          </span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./filter-condition.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Add smooth animations for better UX
  ]
})
export class FilterConditionComponent implements OnInit, OnDestroy {
  
  // Component inputs
  @Input() condition!: FilterConditionNode;
  @Input() columnOptions = signal<any[]>([]);
  @Input() operatorOptions = signal<any[]>([]);
  @Input() showStats = signal(false);
  @Input() enableAdvanced = signal(true);
  @Input() supportsWeight = signal(false);
  
  // Component outputs
  @Output() conditionChanged = new EventEmitter<FilterConditionNode>();
  @Output() removeClicked = new EventEmitter<void>();
  @Output() copyClicked = new EventEmitter<FilterConditionNode>();
  @Output() testClicked = new EventEmitter<{ condition: FilterConditionNode; testData?: any[] }>();
  
  // View children
  @ViewChild('valueInput', { read: ElementRef }) valueInput!: ElementRef;
  
  // Internal state signals
  private _isDragging = signal(false);
  private _hasError = signal(false);
  private _showAdvancedOptions = signal(false);
  private _validationErrors = signal<string[]>([]);
  private _conditionStats = signal<any>(null);
  private _performanceHints = signal<any[]>([]);
  private _setValues = signal<any[]>([]);
  
  // Form controls
  filterValue: any = '';
  filterValueTo: any = '';
  relativeValue: number = 1;
  relativeUnit: string = 'days';
  caseSensitive: boolean = false;
  useRegex: boolean = false;
  useFuzzy: boolean = false;
  fuzzyThreshold: number = 0.7;
  numberPrecision: number = 2;
  includeTime: boolean = false;
  timezone: string = '';
  selectAll: boolean = false;
  newSetValue: string = '';
  conditionWeight: number = 1.0;
  conditionLabel: string = '';
  conditionDescription: string = '';
  
  // Computed properties
  isDragging = this._isDragging.asReadonly();
  hasError = this._hasError.asReadonly();
  showAdvancedOptions = this._showAdvancedOptions.asReadonly();
  validationErrors = this._validationErrors.asReadonly();
  conditionStats = this._conditionStats.asReadonly();
  performanceHints = this._performanceHints.asReadonly();
  setValues = this._setValues.asReadonly();
  
  hasWeight = computed(() => this.condition.weight !== undefined && this.condition.weight !== 1.0);
  
  groupedOperators = computed(() => {
    const operators = this.operatorOptions();
    const columnType = this.getColumnType();
    
    return this.groupOperatorsByCategory(operators, columnType);
  });
  
  ngOnInit(): void {
    this.initializeFromCondition();
    this.validateValue();
  }
  
  ngOnDestroy(): void {
    this.cleanup();
  }
  
  // Event handlers
  toggleEnabled(event: any): void {
    this.condition.enabled = event.target.checked;
    this.emitConditionChanged();
  }
  
  onColumnChanged(event: any): void {
    const columnId = event.target.value;
    this.condition.columnId = columnId;
    
    // Reset filter when column changes
    this.resetFilter();
    this.emitConditionChanged();
  }
  
  onOperatorChanged(event: any): void {
    const operator = event.target.value;
    if (this.condition.filter) {
      this.condition.filter.operator = operator;
      this.resetValueForOperator(operator);
      this.emitConditionChanged();
    }
  }
  
  onValueChanged(): void {
    this.updateFilterValue();
    this.validateValue();
    this.emitConditionChanged();
  }
  
  onValueToChanged(): void {
    this.updateFilterValueTo();
    this.validateValue();
    this.emitConditionChanged();
  }
  
  onCaseSensitiveChanged(): void {
    if (this.condition.filter) {
      this.condition.filter.caseSensitive = this.caseSensitive;
      this.emitConditionChanged();
    }
  }
  
  onRegexChanged(): void {
    if (this.condition.filter && 'regexFlags' in this.condition.filter) {
      // Handle regex change
      this.emitConditionChanged();
    }
  }
  
  onFuzzyChanged(): void {
    if (this.condition.filter && 'fuzzyThreshold' in this.condition.filter) {
      (this.condition.filter as any).fuzzyThreshold = this.useFuzzy ? this.fuzzyThreshold : undefined;
      this.emitConditionChanged();
    }
  }
  
  onFuzzyThresholdChanged(): void {
    if (this.condition.filter && 'fuzzyThreshold' in this.condition.filter) {
      (this.condition.filter as any).fuzzyThreshold = this.fuzzyThreshold;
      this.emitConditionChanged();
    }
  }
  
  onPrecisionChanged(): void {
    if (this.condition.filter && 'precision' in this.condition.filter) {
      (this.condition.filter as any).precision = this.numberPrecision;
      this.emitConditionChanged();
    }
  }
  
  onRelativeValueChanged(): void {
    if (this.condition.filter && 'relativeValue' in this.condition.filter) {
      (this.condition.filter as any).relativeValue = this.relativeValue;
      this.emitConditionChanged();
    }
  }
  
  onRelativeUnitChanged(): void {
    if (this.condition.filter && 'relativeUnit' in this.condition.filter) {
      (this.condition.filter as any).relativeUnit = this.relativeUnit;
      this.emitConditionChanged();
    }
  }
  
  onIncludeTimeChanged(): void {
    if (this.condition.filter && 'includeTime' in this.condition.filter) {
      (this.condition.filter as any).includeTime = this.includeTime;
      this.emitConditionChanged();
    }
  }
  
  onTimezoneChanged(): void {
    if (this.condition.filter && 'timezone' in this.condition.filter) {
      (this.condition.filter as any).timezone = this.timezone;
      this.emitConditionChanged();
    }
  }
  
  setBooleanValue(value: boolean): void {
    this.filterValue = value;
    this.updateFilterValue();
    this.emitConditionChanged();
  }
  
  addSetValue(): void {
    if (this.newSetValue.trim()) {
      this._setValues.update(values => [...values, this.newSetValue.trim()]);
      this.newSetValue = '';
      this.updateSetFilter();
      this.emitConditionChanged();
    }
  }
  
  removeSetValue(value: any): void {
    this._setValues.update(values => values.filter(v => v !== value));
    this.updateSetFilter();
    this.emitConditionChanged();
  }
  
  onSelectAllChanged(): void {
    if (this.condition.filter && 'selectAll' in this.condition.filter) {
      (this.condition.filter as any).selectAll = this.selectAll;
      this.emitConditionChanged();
    }
  }
  
  onWeightChanged(): void {
    this.condition.weight = this.conditionWeight;
    this.emitConditionChanged();
  }
  
  onLabelChanged(): void {
    if (!this.condition.metadata) {
      this.condition.metadata = {};
    }
    this.condition.metadata.label = this.conditionLabel;
    this.emitConditionChanged();
  }
  
  onDescriptionChanged(): void {
    if (!this.condition.metadata) {
      this.condition.metadata = {};
    }
    this.condition.metadata.description = this.conditionDescription;
    this.emitConditionChanged();
  }
  
  toggleAdvancedOptions(): void {
    this._showAdvancedOptions.update(show => !show);
  }
  
  copyCondition(): void {
    this.copyClicked.emit({ ...this.condition });
  }
  
  testCondition(): void {
    this.testClicked.emit({ condition: this.condition });
  }
  
  removeCondition(): void {
    this.removeClicked.emit();
  }
  
  // Utility methods
  trackColumn(index: number, column: any): any {
    return column.field;
  }
  
  trackSetValue(index: number, value: any): any {
    return value;
  }
  
  getColumnType(): FilterType {
    const column = this.columnOptions().find(col => col.field === this.condition.columnId);
    return column?.type || 'text';
  }
  
  getColumnTypeClass(): string {
    return `type-${this.getColumnType()}`;
  }
  
  getValueInputType(): string {
    if (!this.condition.filter) return 'text';
    return this.condition.filter.type;
  }
  
  getValuePlaceholder(): string {
    const operator = this.condition.filter?.operator;
    const type = this.getValueInputType();
    
    switch (type) {
      case 'text':
        return operator === 'regex' ? 'Enter regular expression...' :
               operator === 'fuzzyMatch' ? 'Enter text for fuzzy matching...' :
               'Enter text...';
      case 'number':
        return 'Enter number...';
      case 'date':
        return 'Select date...';
      default:
        return 'Enter value...';
    }
  }
  
  requiresValue(): boolean {
    const operator = this.condition.filter?.operator;
    const noValueOperators = ['isEmpty', 'isNotEmpty', 'isToday', 'isYesterday', 'isTomorrow', 
                             'isThisWeek', 'isThisMonth', 'isThisYear', 'isWeekend', 'isWeekday',
                             'isEven', 'isOdd', 'isPrime', 'isInteger', 'isDecimal'];
    return operator && !noValueOperators.includes(operator);
  }
  
  isRangeOperator(): boolean {
    const operator = this.condition.filter?.operator;
    return operator === 'inRange' || operator === 'notInRange';
  }
  
  isDateRangeOperator(): boolean {
    const operator = this.condition.filter?.operator;
    return operator === 'between';
  }
  
  isRelativeDateOperator(): boolean {
    const operator = this.condition.filter?.operator;
    return operator === 'relativeDateRange';
  }
  
  showTextEnhancements(): boolean {
    return this.getValueInputType() === 'text' && this.enableAdvanced();
  }
  
  supportsRegex(): boolean {
    const operator = this.condition.filter?.operator;
    return operator === 'regex' || operator === 'contains' || operator === 'startsWith' || operator === 'endsWith';
  }
  
  supportsFuzzy(): boolean {
    const operator = this.condition.filter?.operator;
    return operator === 'fuzzyMatch' || operator === 'contains';
  }
  
  showNumberPrecision(): boolean {
    const operator = this.condition.filter?.operator;
    const type = this.getValueInputType();
    return type === 'number' && (operator === 'equals' || operator === 'notEquals');
  }
  
  showDateOptions(): boolean {
    return this.getValueInputType() === 'date' && this.enableAdvanced();
  }
  
  showValuePreview(): boolean {
    return this.enableAdvanced() && this.isValidValue();
  }
  
  isValidValue(): boolean {
    return this._validationErrors().length === 0;
  }
  
  getValuePreview(): string {
    // Generate preview of what the condition will match
    return 'Preview not available';
  }
  
  getNumberStep(): number {
    return Math.pow(10, -this.numberPrecision);
  }
  
  getNumberMin(): number | undefined {
    return undefined; // Could be configured per column
  }
  
  getNumberMax(): number | undefined {
    return undefined; // Could be configured per column
  }
  
  getHintClass(severity: string): string {
    return `hint-${severity}`;
  }
  
  getHintIcon(severity: string): string {
    switch (severity) {
      case 'error': return 'icon-error';
      case 'warning': return 'icon-warning';
      case 'info': return 'icon-info';
      default: return 'icon-info';
    }
  }
  
  getPerformanceClass(): string {
    const stats = this._conditionStats();
    if (!stats) return 'performance-unknown';
    
    const performanceMs = stats.performanceMs;
    if (performanceMs < 10) return 'performance-excellent';
    if (performanceMs < 50) return 'performance-good';
    if (performanceMs < 100) return 'performance-fair';
    return 'performance-poor';
  }
  
  // Private methods
  private initializeFromCondition(): void {
    if (this.condition.filter) {
      this.syncFromFilter();
    }
    
    if (this.condition.weight) {
      this.conditionWeight = this.condition.weight;
    }
    
    if (this.condition.metadata) {
      this.conditionLabel = this.condition.metadata.label || '';
      this.conditionDescription = this.condition.metadata.description || '';
    }
  }
  
  private syncFromFilter(): void {
    const filter = this.condition.filter!;
    
    // Sync basic values
    if ('filter' in filter) {
      this.filterValue = (filter as any).filter;
    }
    if ('filterTo' in filter) {
      this.filterValueTo = (filter as any).filterTo;
    }
    
    // Sync text-specific options
    if (filter.caseSensitive !== undefined) {
      this.caseSensitive = filter.caseSensitive;
    }
    
    // Sync other type-specific options
    this.syncTypeSpecificOptions(filter);
  }
  
  private syncTypeSpecificOptions(filter: Filter): void {
    // Sync based on filter type
    switch (filter.type) {
      case 'text':
        if ('fuzzyThreshold' in filter) {
          this.fuzzyThreshold = (filter as any).fuzzyThreshold || 0.7;
          this.useFuzzy = this.fuzzyThreshold > 0;
        }
        break;
      case 'number':
        if ('precision' in filter) {
          this.numberPrecision = (filter as any).precision || 2;
        }
        break;
      case 'date':
        if ('includeTime' in filter) {
          this.includeTime = (filter as any).includeTime || false;
        }
        if ('timezone' in filter) {
          this.timezone = (filter as any).timezone || '';
        }
        if ('relativeValue' in filter) {
          this.relativeValue = (filter as any).relativeValue || 1;
        }
        if ('relativeUnit' in filter) {
          this.relativeUnit = (filter as any).relativeUnit || 'days';
        }
        break;
      case 'set':
        if ('values' in filter) {
          this._setValues.set((filter as any).values || []);
        }
        if ('selectAll' in filter) {
          this.selectAll = (filter as any).selectAll || false;
        }
        break;
    }
  }
  
  private resetFilter(): void {
    const columnType = this.getColumnType();
    
    this.condition.filter = {
      type: columnType,
      operator: this.getDefaultOperator(columnType),
      active: true
    };
    
    this.filterValue = '';
    this.filterValueTo = '';
    this.resetAdvancedOptions();
  }
  
  private resetValueForOperator(operator: string): void {
    if (!this.requiresValue()) {
      this.filterValue = '';
      this.filterValueTo = '';
    }
  }
  
  private resetAdvancedOptions(): void {
    this.caseSensitive = false;
    this.useRegex = false;
    this.useFuzzy = false;
    this.fuzzyThreshold = 0.7;
    this.numberPrecision = 2;
    this.includeTime = false;
    this.timezone = '';
    this.selectAll = false;
    this._setValues.set([]);
  }
  
  private getDefaultOperator(type: FilterType): string {
    switch (type) {
      case 'text': return 'contains';
      case 'number': return 'equals';
      case 'date': return 'equals';
      case 'boolean': return 'equals';
      case 'set': return 'in';
      default: return 'equals';
    }
  }
  
  private updateFilterValue(): void {
    if (!this.condition.filter) return;
    
    const filter = this.condition.filter as any;
    filter.filter = this.filterValue;
  }
  
  private updateFilterValueTo(): void {
    if (!this.condition.filter) return;
    
    const filter = this.condition.filter as any;
    filter.filterTo = this.filterValueTo;
  }
  
  private updateSetFilter(): void {
    if (!this.condition.filter) return;
    
    const filter = this.condition.filter as any;
    filter.values = this._setValues();
  }
  
  private validateValue(): void {
    const errors: string[] = [];
    
    if (!this.condition.filter) {
      errors.push('No filter configured');
    } else if (this.requiresValue() && !this.filterValue && this.filterValue !== 0 && this.filterValue !== false) {
      errors.push('Value is required');
    } else {
      // Type-specific validation
      this.validateByType(errors);
    }
    
    this._validationErrors.set(errors);
    this._hasError.set(errors.length > 0);
  }
  
  private validateByType(errors: string[]): void {
    const type = this.getValueInputType();
    
    switch (type) {
      case 'number':
        this.validateNumberValue(errors);
        break;
      case 'date':
        this.validateDateValue(errors);
        break;
      case 'text':
        this.validateTextValue(errors);
        break;
    }
  }
  
  private validateNumberValue(errors: string[]): void {
    if (isNaN(this.filterValue)) {
      errors.push('Invalid number format');
    }
    
    if (this.isRangeOperator() && this.filterValueTo !== undefined) {
      if (isNaN(this.filterValueTo)) {
        errors.push('Invalid "to" number format');
      } else if (this.filterValue >= this.filterValueTo) {
        errors.push('"From" value must be less than "to" value');
      }
    }
  }
  
  private validateDateValue(errors: string[]): void {
    if (this.filterValue && !this.isValidDate(this.filterValue)) {
      errors.push('Invalid date format');
    }
    
    if (this.isDateRangeOperator() && this.filterValueTo) {
      if (!this.isValidDate(this.filterValueTo)) {
        errors.push('Invalid "to" date format');
      } else if (new Date(this.filterValue) >= new Date(this.filterValueTo)) {
        errors.push('"From" date must be before "to" date');
      }
    }
  }
  
  private validateTextValue(errors: string[]): void {
    if (this.useRegex) {
      try {
        new RegExp(this.filterValue);
      } catch (e) {
        errors.push('Invalid regular expression');
      }
    }
  }
  
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  
  private groupOperatorsByCategory(operators: any[], columnType: FilterType): any[] {
    // Group operators by category for better UX
    const groups = [
      { label: 'Basic', operators: [] as any[] },
      { label: 'Advanced', operators: [] as any[] },
      { label: 'Specialized', operators: [] as any[] }
    ];
    
    for (const operator of operators) {
      if (this.isBasicOperator(operator.value)) {
        groups[0].operators.push(operator);
      } else if (this.isAdvancedOperator(operator.value)) {
        groups[1].operators.push(operator);
      } else {
        groups[2].operators.push(operator);
      }
    }
    
    return groups.filter(group => group.operators.length > 0);
  }
  
  private isBasicOperator(operator: string): boolean {
    const basicOperators = ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'endsWith',
                           'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual',
                           'before', 'after', 'isEmpty', 'isNotEmpty'];
    return basicOperators.includes(operator);
  }
  
  private isAdvancedOperator(operator: string): boolean {
    const advancedOperators = ['regex', 'fuzzyMatch', 'inRange', 'notInRange', 'between',
                              'isToday', 'isYesterday', 'isTomorrow', 'isThisWeek', 'isThisMonth'];
    return advancedOperators.includes(operator);
  }
  
  private emitConditionChanged(): void {
    this.conditionChanged.emit({ ...this.condition });
  }
  
  private cleanup(): void {
    // Cleanup any subscriptions or resources
  }
}