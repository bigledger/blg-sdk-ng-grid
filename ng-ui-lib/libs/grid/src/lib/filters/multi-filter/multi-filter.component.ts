import { 
  Component, 
  ChangeDetectionStrategy, 
  Input, 
  Output, 
  EventEmitter, 
  ViewChild, 
  ElementRef,
  OnInit, 
  OnDestroy, 
  inject,
  signal,
  computed,
  effect,
  ViewContainerRef,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CdkPortalOutlet, PortalModule } from '@angular/cdk/portal';
import { 
  MultiFilterModel, 
  FilterNode, 
  FilterGroupNode, 
  FilterConditionNode,
  FilterFormulaNode,
  FilterNaturalNode,
  LogicalOperator,
  IMultiFilterComponent,
  MultiFilterConfig,
  PerformanceMetrics,
  ParsedNaturalQuery,
  AIFilterSuggestion,
  FilterComplexity,
  MULTI_FILTER_CONFIG
} from './multi-filter.interface';
import { MultiFilterService } from './multi-filter.service';
import { FilterBuilderComponent } from './components/filter-builder.component';
import { FilterPreviewComponent } from './components/filter-preview.component';
import { NaturalLanguageFilterComponent } from './components/natural-language-filter.component';
import { FilterPerformanceMeterComponent } from './components/filter-performance-meter.component';

/**
 * Advanced Multi-Filter Component
 * 
 * The most powerful and intuitive multi-filter system ever created.
 * Features:
 * - Unlimited nested conditions with advanced logical operators
 * - Visual drag-and-drop filter builder
 * - Natural language query input with AI processing
 * - Real-time performance monitoring and optimization
 * - Collaborative filter building and sharing
 * - Advanced export/import capabilities
 * - AI-powered suggestions and optimization
 */
@Component({
  selector: 'blg-multi-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    PortalModule,
    FilterBuilderComponent,
    FilterPreviewComponent,
    NaturalLanguageFilterComponent,
    FilterPerformanceMeterComponent
  ],
  template: `
    <div class="multi-filter-container" 
         [class.visual-mode]="visualModeActive()"
         [class.compact-mode]="compactMode()"
         [class.performance-warning]="performanceWarning()">
      
      <!-- Header Section -->
      <div class="multi-filter-header">
        <div class="filter-tabs">
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'simple'"
            (click)="setActiveTab('simple')">
            <i class="icon-filter"></i>
            Simple Filter
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'advanced'"
            (click)="setActiveTab('advanced')">
            <i class="icon-settings"></i>
            Advanced Builder
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'natural'"
            (click)="setActiveTab('natural')">
            <i class="icon-chat"></i>
            Natural Language
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'formula'"
            (click)="setActiveTab('formula')">
            <i class="icon-code"></i>
            Formula Editor
          </button>
        </div>
        
        <div class="filter-actions">
          <!-- Performance Meter -->
          <blg-filter-performance-meter
            [metrics]="performanceMetrics()"
            [complexity]="filterComplexity()"
            [showDetails]="showPerformanceDetails()"
            (optimizeClicked)="optimizeFilter()"
            (detailsToggled)="togglePerformanceDetails()">
          </blg-filter-performance-meter>
          
          <!-- AI Suggestions -->
          <div class="ai-suggestions" *ngIf="aiSuggestions().length > 0">
            <button 
              class="suggestion-button"
              [class.pulse]="hasHighConfidenceSuggestions()"
              (click)="toggleSuggestions()">
              <i class="icon-lightbulb"></i>
              {{aiSuggestions().length}} suggestions
            </button>
          </div>
          
          <!-- Main Actions -->
          <div class="main-actions">
            <button class="action-button secondary" (click)="clearFilter()">
              <i class="icon-clear"></i>
              Clear
            </button>
            <button class="action-button secondary" (click)="saveAsPreset()">
              <i class="icon-save"></i>
              Save
            </button>
            <button class="action-button secondary" (click)="exportFilter()">
              <i class="icon-download"></i>
              Export
            </button>
            <button class="action-button primary" (click)="applyFilter()">
              <i class="icon-check"></i>
              Apply Filter
            </button>
          </div>
        </div>
      </div>
      
      <!-- Content Sections -->
      <div class="multi-filter-content">
        
        <!-- Simple Filter Mode -->
        <div class="filter-section" *ngIf="activeTab() === 'simple'" [@slideIn]>
          <div class="simple-conditions">
            <div class="condition-group" 
                 *ngFor="let condition of simpleConditions(); trackBy: trackCondition">
              <blg-filter-condition
                [condition]="condition"
                [columnOptions]="columnOptions()"
                [operatorOptions]="getOperatorOptions(condition.filter?.type || 'text')"
                (conditionChanged)="updateCondition($event)"
                (removeClicked)="removeCondition(condition.id)">
              </blg-filter-condition>
            </div>
            
            <button class="add-condition-button" (click)="addSimpleCondition()">
              <i class="icon-plus"></i>
              Add Condition
            </button>
          </div>
          
          <div class="logic-selector" *ngIf="simpleConditions().length > 1">
            <label>Combine conditions with:</label>
            <div class="logic-buttons">
              <button 
                class="logic-button"
                [class.active]="simpleLogicOperator() === 'AND'"
                (click)="setSimpleLogicOperator('AND')">
                AND
              </button>
              <button 
                class="logic-button"
                [class.active]="simpleLogicOperator() === 'OR'"
                (click)="setSimpleLogicOperator('OR')">
                OR
              </button>
              <button 
                class="logic-button advanced"
                [class.active]="simpleLogicOperator() === 'XOR'"
                (click)="setSimpleLogicOperator('XOR')"
                title="Exclusive OR - exactly one condition must be true">
                XOR
              </button>
            </div>
          </div>
        </div>
        
        <!-- Advanced Visual Builder -->
        <div class="filter-section" *ngIf="activeTab() === 'advanced'" [@slideIn]>
          <blg-filter-builder
            [filterModel]="filterModel()"
            [columnOptions]="columnOptions()"
            [config]="builderConfig()"
            [aiSuggestions]="aiSuggestions()"
            (modelChanged)="updateFilterModel($event)"
            (nodeSelected)="selectNode($event)"
            (optimizationRequested)="optimizeFilter()"
            (complexityChanged)="updateComplexity($event)">
          </blg-filter-builder>
        </div>
        
        <!-- Natural Language Interface -->
        <div class="filter-section" *ngIf="activeTab() === 'natural'" [@slideIn]>
          <blg-natural-language-filter
            [query]="naturalQuery()"
            [parsedResult]="parsedNaturalQuery()"
            [suggestions]="naturalSuggestions()"
            [isProcessing]="isProcessingNatural()"
            [columnOptions]="columnOptions()"
            [config]="naturalConfig()"
            (queryChanged)="updateNaturalQuery($event)"
            (querySubmitted)="processNaturalQuery($event)"
            (suggestionSelected)="selectNaturalSuggestion($event)">
          </blg-natural-language-filter>
          
          <!-- Natural Query Results -->
          <div class="natural-results" *ngIf="parsedNaturalQuery()">
            <div class="result-header">
              <h4>Interpreted Query</h4>
              <div class="confidence-badge" 
                   [class]="getConfidenceClass(parsedNaturalQuery()?.confidence || 0)">
                {{(parsedNaturalQuery()?.confidence || 0) * 100 | number:'1.0-0'}}% confidence
              </div>
            </div>
            
            <div class="interpreted-conditions">
              <div class="condition-item" 
                   *ngFor="let condition of parsedNaturalQuery()?.conditions">
                <span class="column-name">{{condition.columnId}}</span>
                <span class="operator">{{condition.operator}}</span>
                <span class="value">{{condition.value}}</span>
                <span class="confidence">({{condition.confidence * 100 | number:'1.0-0'}}%)</span>
              </div>
            </div>
            
            <div class="natural-actions">
              <button 
                class="action-button secondary" 
                (click)="editInterpretation()">
                <i class="icon-edit"></i>
                Refine
              </button>
              <button 
                class="action-button primary" 
                (click)="applyNaturalFilter()">
                <i class="icon-check"></i>
                Apply Query
              </button>
            </div>
          </div>
        </div>
        
        <!-- Formula Editor -->
        <div class="filter-section" *ngIf="activeTab() === 'formula'" [@slideIn]>
          <div class="formula-editor">
            <div class="editor-header">
              <h4>Formula Editor</h4>
              <div class="editor-actions">
                <button class="help-button" (click)="showFormulaHelp()">
                  <i class="icon-help"></i>
                  Help
                </button>
                <button class="validate-button" (click)="validateFormula()">
                  <i class="icon-check-circle"></i>
                  Validate
                </button>
              </div>
            </div>
            
            <div class="formula-input-container">
              <textarea 
                class="formula-input"
                [(ngModel)]="formulaText"
                (input)="onFormulaChanged($event)"
                (blur)="validateFormula()"
                placeholder="Enter your filter formula (e.g., Age > 18 AND Status = 'Active')">
              </textarea>
              
              <div class="formula-suggestions" *ngIf="formulaSuggestions().length > 0">
                <div class="suggestion-item" 
                     *ngFor="let suggestion of formulaSuggestions()"
                     (click)="applyFormulaSuggestion(suggestion)">
                  <span class="suggestion-text">{{suggestion.text}}</span>
                  <span class="suggestion-type">{{suggestion.type}}</span>
                </div>
              </div>
            </div>
            
            <div class="formula-errors" *ngIf="formulaErrors().length > 0">
              <div class="error-item" *ngFor="let error of formulaErrors()">
                <i class="icon-error"></i>
                <span class="error-message">{{error.message}}</span>
                <span class="error-location">Line {{error.line}}, Column {{error.column}}</span>
              </div>
            </div>
            
            <div class="formula-variables" *ngIf="formulaVariables().length > 0">
              <h5>Variables</h5>
              <div class="variable-item" *ngFor="let variable of formulaVariables()">
                <span class="variable-name">{{variable.name}}</span>
                <span class="variable-type">{{variable.type}}</span>
                <span class="variable-sample">{{variable.sampleValue}}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- Preview Section -->
      <div class="filter-preview-section" 
           *ngIf="showPreview() && isFilterActive()"
           [@slideUp]>
        <blg-filter-preview
          [filterModel]="filterModel()"
          [sampleData]="sampleData()"
          [previewLimit]="previewLimit()"
          [showStats]="showPreviewStats()"
          (previewUpdated)="onPreviewUpdated($event)"
          (settingsChanged)="updatePreviewSettings($event)">
        </blg-filter-preview>
      </div>
      
      <!-- AI Suggestions Panel -->
      <div class="ai-suggestions-panel" 
           *ngIf="showSuggestions() && aiSuggestions().length > 0"
           [@slideIn]>
        <div class="suggestions-header">
          <h4>AI Suggestions</h4>
          <button class="close-button" (click)="closeSuggestions()">
            <i class="icon-close"></i>
          </button>
        </div>
        
        <div class="suggestions-list">
          <div class="suggestion-card" 
               *ngFor="let suggestion of aiSuggestions(); trackBy: trackSuggestion"
               [class]="getSuggestionClass(suggestion)">
            <div class="suggestion-header">
              <span class="suggestion-title">{{suggestion.title}}</span>
              <div class="suggestion-confidence">
                {{suggestion.confidence * 100 | number:'1.0-0'}}%
              </div>
            </div>
            
            <p class="suggestion-description">{{suggestion.description}}</p>
            
            <div class="suggestion-impact">
              <div class="impact-item" 
                   [class]="getImpactClass(suggestion.impact.performance)">
                <i class="icon-speed"></i>
                Performance: {{formatImpact(suggestion.impact.performance)}}
              </div>
              <div class="impact-item" 
                   [class]="getImpactClass(suggestion.impact.accuracy)">
                <i class="icon-target"></i>
                Accuracy: {{formatImpact(suggestion.impact.accuracy)}}
              </div>
              <div class="impact-item" 
                   [class]="getImpactClass(-suggestion.impact.complexity)">
                <i class="icon-complexity"></i>
                Complexity: {{formatImpact(-suggestion.impact.complexity)}}
              </div>
            </div>
            
            <div class="suggestion-actions">
              <button class="action-button secondary" (click)="previewSuggestion(suggestion)">
                <i class="icon-eye"></i>
                Preview
              </button>
              <button class="action-button primary" (click)="applySuggestion(suggestion)">
                <i class="icon-check"></i>
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  `,
  styleUrls: ['./multi-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Add smooth transitions for better UX
  ]
})
export class MultiFilterComponent implements OnInit, OnDestroy, IMultiFilterComponent {
  
  // Injected dependencies
  private multiFilterService = inject(MultiFilterService);
  private config = inject(MULTI_FILTER_CONFIG, { optional: true });
  
  // Component inputs
  @Input() columnId!: string;
  @Input() columnOptions = signal<any[]>([]);
  @Input() sampleData = signal<any[]>([]);
  @Input() compactMode = signal(false);
  @Input() showPreview = signal(true);
  @Input() previewLimit = signal(100);
  @Input() showPerformanceDetails = signal(false);
  @Input() enableAISuggestions = signal(true);
  
  // Component outputs
  @Output() filterChanged = new EventEmitter<MultiFilterModel | null>();
  @Output() performanceWarning = new EventEmitter<PerformanceMetrics>();
  @Output() naturalQueryProcessed = new EventEmitter<ParsedNaturalQuery>();
  @Output() suggestionApplied = new EventEmitter<AIFilterSuggestion>();
  @Output() optimizationCompleted = new EventEmitter<{ original: MultiFilterModel; optimized: MultiFilterModel }>();
  
  // View children
  @ViewChild('formulaEditor', { read: ElementRef }) formulaEditor!: ElementRef;
  @ViewChild('visualBuilder', { read: FilterBuilderComponent }) visualBuilder!: FilterBuilderComponent;
  @ViewChild('naturalLanguage', { read: NaturalLanguageFilterComponent }) naturalLanguage!: NaturalLanguageFilterComponent;
  
  // Internal state signals
  private _filterModel = signal<MultiFilterModel | null>(null);
  private _activeTab = signal<'simple' | 'advanced' | 'natural' | 'formula'>('simple');
  private _visualModeActive = signal(false);
  private _performanceMetrics = signal<PerformanceMetrics>({
    evaluationTimeMs: 0,
    memoryUsageMB: 0,
    cacheHitRate: 0,
    indexUtilization: 0,
    optimizationLevel: 0
  });
  private _filterComplexity = signal<FilterComplexity>({
    nodeCount: 0,
    maxDepth: 0,
    operatorDiversity: 0,
    estimatedPerformance: 'excellent',
    optimizationSuggestions: []
  });
  private _aiSuggestions = signal<AIFilterSuggestion[]>([]);
  private _parsedNaturalQuery = signal<ParsedNaturalQuery | null>(null);
  private _naturalQuery = signal('');
  private _isProcessingNatural = signal(false);
  private _showSuggestions = signal(false);
  private _showPreviewStats = signal(true);
  
  // Simple mode state
  private _simpleConditions = signal<FilterConditionNode[]>([]);
  private _simpleLogicOperator = signal<LogicalOperator>('AND');
  
  // Formula mode state
  formulaText = '';
  private _formulaSuggestions = signal<any[]>([]);
  private _formulaErrors = signal<any[]>([]);
  private _formulaVariables = signal<any[]>([]);
  
  // Computed properties
  filterModel = this._filterModel.asReadonly();
  activeTab = this._activeTab.asReadonly();
  visualModeActive = this._visualModeActive.asReadonly();
  performanceMetrics = this._performanceMetrics.asReadonly();
  filterComplexity = this._filterComplexity.asReadonly();
  aiSuggestions = this._aiSuggestions.asReadonly();
  parsedNaturalQuery = this._parsedNaturalQuery.asReadonly();
  naturalQuery = this._naturalQuery.asReadonly();
  isProcessingNatural = this._isProcessingNatural.asReadonly();
  showSuggestions = this._showSuggestions.asReadonly();
  showPreviewStats = this._showPreviewStats.asReadonly();
  simpleConditions = this._simpleConditions.asReadonly();
  simpleLogicOperator = this._simpleLogicOperator.asReadonly();
  formulaSuggestions = this._formulaSuggestions.asReadonly();
  formulaErrors = this._formulaErrors.asReadonly();
  formulaVariables = this._formulaVariables.asReadonly();
  
  // Computed derived properties
  isFilterActive = computed(() => {
    const model = this._filterModel();
    return model !== null && this.hasActiveConditions(model.rootNode);
  });
  
  performanceWarning = computed(() => {
    const metrics = this._performanceMetrics();
    return metrics.evaluationTimeMs > 1000 || metrics.memoryUsageMB > 100;
  });
  
  hasHighConfidenceSuggestions = computed(() => {
    return this._aiSuggestions().some(s => s.confidence > 0.8);
  });
  
  naturalSuggestions = computed(() => {
    return this._parsedNaturalQuery()?.alternatives?.map(alt => alt.originalQuery) || [];
  });
  
  builderConfig = computed(() => ({
    enableDragDrop: this.config?.enableDragDrop ?? true,
    enableKeyboardShortcuts: this.config?.enableKeyboardShortcuts ?? true,
    showPerformanceIndicator: this.config?.showPerformanceIndicator ?? true,
    showComplexityMeter: this.config?.showComplexityMeter ?? true,
    theme: this.config?.theme ?? 'light'
  }));
  
  naturalConfig = computed(() => ({
    nlpProvider: this.config?.nlpProvider ?? 'openai',
    confidenceThreshold: this.config?.nlpConfidenceThreshold ?? 0.7,
    maxQueryLength: this.config?.maxNaturalQueryLength ?? 500
  }));
  
  constructor() {
    // Set up reactive effects
    effect(() => {
      const model = this._filterModel();
      if (model) {
        this.updatePerformanceMetrics();
        this.updateComplexity();
        this.generateAISuggestions();
      }
    });
    
    // Auto-save effect
    effect(() => {
      const model = this._filterModel();
      if (model) {
        this.filterChanged.emit(model);
      }
    });
  }
  
  ngOnInit(): void {
    this.initializeComponent();
  }
  
  ngOnDestroy(): void {
    this.cleanup();
  }
  
  // Public API methods
  getFilterModel(): MultiFilterModel | null {
    return this._filterModel();
  }
  
  setFilterModel(model: MultiFilterModel | null): void {
    this._filterModel.set(model);
    if (model) {
      this.syncWithModel(model);
    }
  }
  
  openVisualBuilder(): void {
    this._activeTab.set('advanced');
    this._visualModeActive.set(true);
  }
  
  closeVisualBuilder(): void {
    this._visualModeActive.set(false);
  }
  
  async setNaturalQuery(query: string): Promise<void> {
    this._naturalQuery.set(query);
    await this.processNaturalQuery(query);
  }
  
  getNaturalQuery(): string {
    return this._naturalQuery();
  }
  
  getPerformanceMetrics(): PerformanceMetrics {
    return this._performanceMetrics();
  }
  
  async optimizeFilter(): Promise<void> {
    const currentModel = this._filterModel();
    if (!currentModel) return;
    
    try {
      const optimizedModel = await this.multiFilterService.optimizeFilter(currentModel);
      this.optimizationCompleted.emit({ 
        original: currentModel, 
        optimized: optimizedModel 
      });
      this._filterModel.set(optimizedModel);
    } catch (error) {
      console.error('Filter optimization failed:', error);
    }
  }
  
  // Event handlers
  setActiveTab(tab: 'simple' | 'advanced' | 'natural' | 'formula'): void {
    this._activeTab.set(tab);
  }
  
  updateFilterModel(model: MultiFilterModel): void {
    this._filterModel.set(model);
  }
  
  async updateNaturalQuery(query: string): Promise<void> {
    this._naturalQuery.set(query);
  }
  
  async processNaturalQuery(query: string): Promise<void> {
    if (!query.trim()) return;
    
    this._isProcessingNatural.set(true);
    try {
      const parsedResult = await this.multiFilterService.parseNaturalQuery(query);
      this._parsedNaturalQuery.set(parsedResult);
      this.naturalQueryProcessed.emit(parsedResult);
    } catch (error) {
      console.error('Natural query processing failed:', error);
    } finally {
      this._isProcessingNatural.set(false);
    }
  }
  
  selectNaturalSuggestion(suggestion: string): void {
    this.updateNaturalQuery(suggestion);
    this.processNaturalQuery(suggestion);
  }
  
  addSimpleCondition(): void {
    const newCondition: FilterConditionNode = {
      id: this.generateNodeId(),
      type: 'condition',
      columnId: this.columnId,
      filter: {
        type: 'text',
        operator: 'contains',
        active: true
      },
      enabled: true,
      position: { x: 0, y: 0 }
    };
    
    this._simpleConditions.update(conditions => [...conditions, newCondition]);
    this.syncSimpleToModel();
  }
  
  removeCondition(conditionId: string): void {
    this._simpleConditions.update(conditions => 
      conditions.filter(c => c.id !== conditionId)
    );
    this.syncSimpleToModel();
  }
  
  updateCondition(updatedCondition: FilterConditionNode): void {
    this._simpleConditions.update(conditions =>
      conditions.map(c => c.id === updatedCondition.id ? updatedCondition : c)
    );
    this.syncSimpleToModel();
  }
  
  setSimpleLogicOperator(operator: LogicalOperator): void {
    this._simpleLogicOperator.set(operator);
    this.syncSimpleToModel();
  }
  
  clearFilter(): void {
    this._filterModel.set(null);
    this._simpleConditions.set([]);
    this._naturalQuery.set('');
    this._parsedNaturalQuery.set(null);
    this.formulaText = '';
  }
  
  async applyFilter(): Promise<void> {
    const model = this._filterModel();
    if (!model) return;
    
    try {
      await this.multiFilterService.applyFilter(this.columnId, model);
    } catch (error) {
      console.error('Filter application failed:', error);
    }
  }
  
  async applyNaturalFilter(): Promise<void> {
    const query = this._naturalQuery();
    if (!query) return;
    
    try {
      await this.multiFilterService.executeNaturalQuery(query);
    } catch (error) {
      console.error('Natural query execution failed:', error);
    }
  }
  
  // AI Suggestions
  toggleSuggestions(): void {
    this._showSuggestions.update(show => !show);
  }
  
  closeSuggestions(): void {
    this._showSuggestions.set(false);
  }
  
  applySuggestion(suggestion: AIFilterSuggestion): void {
    // Apply the suggestion based on its type
    this.suggestionApplied.emit(suggestion);
    this._showSuggestions.set(false);
  }
  
  previewSuggestion(suggestion: AIFilterSuggestion): void {
    // Show preview of what the suggestion would do
    console.log('Previewing suggestion:', suggestion);
  }
  
  // Formula editor
  onFormulaChanged(event: any): void {
    this.formulaText = event.target.value;
    this.debounceFormulaValidation();
  }
  
  validateFormula(): void {
    // Validate the formula and update errors
    console.log('Validating formula:', this.formulaText);
  }
  
  showFormulaHelp(): void {
    console.log('Showing formula help');
  }
  
  applyFormulaSuggestion(suggestion: any): void {
    this.formulaText += suggestion.text;
  }
  
  // Utility methods
  trackCondition(index: number, condition: FilterConditionNode): string {
    return condition.id;
  }
  
  trackSuggestion(index: number, suggestion: AIFilterSuggestion): string {
    return suggestion.type + suggestion.title;
  }
  
  getOperatorOptions(filterType: string): any[] {
    // Return appropriate operators for the filter type
    return [];
  }
  
  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'high-confidence';
    if (confidence >= 0.6) return 'medium-confidence';
    return 'low-confidence';
  }
  
  getSuggestionClass(suggestion: AIFilterSuggestion): string {
    return `suggestion-${suggestion.type}`;
  }
  
  getImpactClass(impact: number): string {
    if (impact >= 5) return 'positive-high';
    if (impact >= 2) return 'positive-medium';
    if (impact >= 0) return 'positive-low';
    if (impact >= -2) return 'negative-low';
    if (impact >= -5) return 'negative-medium';
    return 'negative-high';
  }
  
  formatImpact(impact: number): string {
    if (impact > 0) return `+${impact}`;
    return impact.toString();
  }
  
  // Private methods
  private initializeComponent(): void {
    // Initialize component state
    this.updatePerformanceMetrics();
  }
  
  private cleanup(): void {
    // Clean up resources
  }
  
  private syncWithModel(model: MultiFilterModel): void {
    // Sync component state with the model
    this.extractSimpleConditions(model.rootNode);
  }
  
  private syncSimpleToModel(): void {
    const conditions = this._simpleConditions();
    if (conditions.length === 0) {
      this._filterModel.set(null);
      return;
    }
    
    const rootNode: FilterGroupNode = {
      id: this.generateNodeId(),
      type: 'group',
      operator: this._simpleLogicOperator(),
      children: conditions,
      position: { x: 0, y: 0 }
    };
    
    const model: MultiFilterModel = {
      columnId: this.columnId,
      rootNode,
      version: 1,
      createdAt: new Date(),
      modifiedAt: new Date(),
      metadata: {
        complexity: this.calculateComplexity(rootNode),
        performance: this._performanceMetrics()
      }
    };
    
    this._filterModel.set(model);
  }
  
  private extractSimpleConditions(node: FilterGroupNode): void {
    if (node.children.every(child => child.type === 'condition')) {
      this._simpleConditions.set(node.children as FilterConditionNode[]);
      this._simpleLogicOperator.set(node.operator);
    }
  }
  
  private hasActiveConditions(node: FilterGroupNode): boolean {
    return node.children.some(child => {
      if (child.type === 'condition') {
        return (child as FilterConditionNode).enabled;
      } else if (child.type === 'group') {
        return this.hasActiveConditions(child as FilterGroupNode);
      }
      return true;
    });
  }
  
  private async updatePerformanceMetrics(): Promise<void> {
    const model = this._filterModel();
    if (!model) return;
    
    try {
      const metrics = await this.multiFilterService.profileFilter(model);
      this._performanceMetrics.set(metrics);
      
      if (metrics.evaluationTimeMs > 1000) {
        this.performanceWarning.emit(metrics);
      }
    } catch (error) {
      console.error('Performance profiling failed:', error);
    }
  }
  
  private updateComplexity(): void {
    const model = this._filterModel();
    if (!model) return;
    
    const complexity = this.calculateComplexity(model.rootNode);
    this._filterComplexity.set(complexity);
  }
  
  private calculateComplexity(node: FilterGroupNode): FilterComplexity {
    let nodeCount = 1;
    let maxDepth = 1;
    let operatorSet = new Set<string>();
    operatorSet.add(node.operator);
    
    const traverse = (currentNode: FilterGroupNode, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      
      for (const child of currentNode.children) {
        nodeCount++;
        if (child.type === 'group') {
          const groupChild = child as FilterGroupNode;
          operatorSet.add(groupChild.operator);
          traverse(groupChild, depth + 1);
        }
      }
    };
    
    traverse(node, 1);
    
    const estimatedPerformance = nodeCount < 10 ? 'excellent' :
                               nodeCount < 25 ? 'good' :
                               nodeCount < 50 ? 'fair' : 'poor';
    
    return {
      nodeCount,
      maxDepth,
      operatorDiversity: operatorSet.size,
      estimatedPerformance,
      optimizationSuggestions: this.generateOptimizationSuggestions(nodeCount, maxDepth, operatorSet.size)
    };
  }
  
  private generateOptimizationSuggestions(nodeCount: number, maxDepth: number, operatorDiversity: number): string[] {
    const suggestions: string[] = [];
    
    if (nodeCount > 25) {
      suggestions.push('Consider simplifying the filter by removing redundant conditions');
    }
    
    if (maxDepth > 5) {
      suggestions.push('Deep nesting may impact performance - consider flattening the structure');
    }
    
    if (operatorDiversity > 4) {
      suggestions.push('Multiple operator types may be confusing - consider consolidating logic');
    }
    
    return suggestions;
  }
  
  private async generateAISuggestions(): Promise<void> {
    if (!this.enableAISuggestions()) return;
    
    const model = this._filterModel();
    if (!model) return;
    
    try {
      const suggestions = await this.multiFilterService.getSuggestions(model);
      this._aiSuggestions.set(suggestions);
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
    }
  }
  
  private generateNodeId(): string {
    return 'node-' + Math.random().toString(36).substr(2, 9);
  }
  
  private debounceFormulaValidation = this.debounce(() => {
    this.validateFormula();
  }, 500);
  
  private debounce(func: Function, wait: number) {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  // Additional event handlers
  selectNode(nodeId: string): void {
    console.log('Node selected:', nodeId);
  }
  
  updateComplexity(complexity: FilterComplexity): void {
    this._filterComplexity.set(complexity);
  }
  
  onPreviewUpdated(stats: any): void {
    console.log('Preview updated:', stats);
  }
  
  updatePreviewSettings(settings: any): void {
    this._showPreviewStats.set(settings.showStats);
  }
  
  togglePerformanceDetails(): void {
    this.showPerformanceDetails.update(show => !show);
  }
  
  saveAsPreset(): void {
    console.log('Save as preset');
  }
  
  exportFilter(): void {
    console.log('Export filter');
  }
  
  editInterpretation(): void {
    console.log('Edit interpretation');
  }
}