import { 
  Component, 
  ChangeDetectionStrategy, 
  Input, 
  Output, 
  EventEmitter,
  OnInit, 
  OnDestroy,
  OnChanges,
  SimpleChanges,
  signal,
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  MultiFilterModel, 
  PerformanceMetrics 
} from '../multi-filter.interface';

/**
 * Filter Preview Component
 * 
 * Provides real-time preview of filter results with advanced analytics.
 * Features:
 * - Live result preview with sample data
 * - Performance metrics visualization
 * - Result statistics and insights
 * - Export preview results
 * - Result distribution charts
 * - Performance optimization suggestions
 * - Data quality analysis
 * - Custom preview configurations
 */
@Component({
  selector: 'blg-filter-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-preview-container" 
         [class.loading]="isLoading()"
         [class.error]="hasError()"
         [class.expanded]="isExpanded()">
      
      <!-- Preview Header -->
      <div class="preview-header">
        <div class="header-left">
          <h4 class="preview-title">
            <i class="icon-eye"></i>
            Filter Preview
          </h4>
          
          <div class="result-summary" *ngIf="!isLoading() && previewResults()">
            <span class="result-count">
              {{previewResults()!.filteredData.length | number}} 
              of {{previewResults()!.totalData.length | number}} rows
            </span>
            <span class="result-percentage" 
                  [class]="getPercentageClass(resultPercentage())">
              ({{resultPercentage() | number:'1.1-1'}}%)
            </span>
          </div>
        </div>
        
        <div class="header-actions">
          <!-- Preview Settings -->
          <button 
            class="action-btn settings-btn"
            [class.active]="showSettings()"
            (click)="toggleSettings()"
            title="Preview settings">
            <i class="icon-settings"></i>
          </button>
          
          <!-- Refresh Preview -->
          <button 
            class="action-btn refresh-btn"
            (click)="refreshPreview()"
            [disabled]="isLoading()"
            title="Refresh preview">
            <i class="icon-refresh" [class.spinning]="isLoading()"></i>
          </button>
          
          <!-- Export Results -->
          <button 
            class="action-btn export-btn"
            (click)="exportResults()"
            [disabled]="!previewResults() || isLoading()"
            title="Export results">
            <i class="icon-download"></i>
          </button>
          
          <!-- Expand/Collapse -->
          <button 
            class="action-btn expand-btn"
            (click)="toggleExpanded()"
            [title]="isExpanded() ? 'Collapse' : 'Expand'">
            <i class="icon-expand" [class.expanded]="isExpanded()"></i>
          </button>
        </div>
      </div>
      
      <!-- Preview Settings Panel -->
      <div class="preview-settings" 
           *ngIf="showSettings()"
           [@slideDown]>
        <div class="settings-row">
          <label class="setting-item">
            Preview Limit:
            <select [(ngModel)]="previewLimit" (ngModelChange)="onPreviewLimitChanged()">
              <option value="10">10 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
              <option value="500">500 rows</option>
              <option value="1000">1000 rows</option>
            </select>
          </label>
          
          <label class="setting-item">
            <input 
              type="checkbox" 
              [(ngModel)]="showStats" 
              (ngModelChange)="onShowStatsChanged()">
            Show Statistics
          </label>
          
          <label class="setting-item">
            <input 
              type="checkbox" 
              [(ngModel)]="showPerformance" 
              (ngModelChange)="onShowPerformanceChanged()">
            Show Performance
          </label>
          
          <label class="setting-item">
            <input 
              type="checkbox" 
              [(ngModel)]="autoRefresh" 
              (ngModelChange)="onAutoRefreshChanged()">
            Auto Refresh
          </label>
        </div>
        
        <div class="settings-row">
          <label class="setting-item">
            Sample Data:
            <select [(ngModel)]="sampleDataSource" (ngModelChange)="onSampleDataChanged()">
              <option value="provided">Provided Data</option>
              <option value="generated">Generated Sample</option>
              <option value="production">Production Sample</option>
            </select>
          </label>
          
          <label class="setting-item">
            Display Mode:
            <select [(ngModel)]="displayMode" (ngModelChange)="onDisplayModeChanged()">
              <option value="table">Table View</option>
              <option value="cards">Card View</option>
              <option value="summary">Summary Only</option>
            </select>
          </label>
        </div>
      </div>
      
      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading()">
        <div class="loading-spinner">
          <i class="icon-spinner spinning"></i>
        </div>
        <div class="loading-text">Processing filter...</div>
        <div class="loading-progress" *ngIf="loadingProgress() > 0">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="loadingProgress()"></div>
          </div>
          <span class="progress-text">{{loadingProgress() | number:'1.0-0'}}%</span>
        </div>
      </div>
      
      <!-- Error State -->
      <div class="error-state" *ngIf="hasError()">
        <div class="error-icon">
          <i class="icon-error"></i>
        </div>
        <div class="error-message">{{errorMessage()}}</div>
        <button class="retry-btn" (click)="retryPreview()">
          <i class="icon-refresh"></i>
          Retry
        </button>
      </div>
      
      <!-- Preview Results -->
      <div class="preview-results" *ngIf="!isLoading() && !hasError() && previewResults()">
        
        <!-- Statistics Panel -->
        <div class="stats-panel" *ngIf="showStats && previewStats()">
          <div class="stats-header">
            <h5>Result Statistics</h5>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{previewStats()!.totalRows | number}}</div>
              <div class="stat-label">Total Rows</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{previewStats()!.filteredRows | number}}</div>
              <div class="stat-label">Filtered Rows</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{previewStats()!.filterRate | number:'1.1-1'}}%</div>
              <div class="stat-label">Filter Rate</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{previewStats()!.uniqueValues | number}}</div>
              <div class="stat-label">Unique Values</div>
            </div>
          </div>
          
          <!-- Column Distribution -->
          <div class="column-distribution" *ngIf="previewStats()!.columnStats?.length">
            <h6>Column Distribution</h6>
            <div class="distribution-chart">
              <div class="chart-item" 
                   *ngFor="let columnStat of previewStats()!.columnStats; trackBy: trackColumnStat">
                <div class="column-name">{{columnStat.columnId}}</div>
                <div class="distribution-bar">
                  <div class="bar-segment unique" 
                       [style.width.%]="columnStat.uniquePercentage"
                       [title]="columnStat.uniqueCount + ' unique values'">
                  </div>
                  <div class="bar-segment null" 
                       [style.width.%]="columnStat.nullPercentage"
                       [title]="columnStat.nullCount + ' null values'">
                  </div>
                </div>
                <div class="column-metrics">
                  <span class="metric">{{columnStat.uniqueCount}} unique</span>
                  <span class="metric" *ngIf="columnStat.nullCount > 0">
                    {{columnStat.nullCount}} null
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Performance Panel -->
        <div class="performance-panel" *ngIf="showPerformance && performanceMetrics()">
          <div class="performance-header">
            <h5>Performance Metrics</h5>
            <div class="overall-score" 
                 [class]="getPerformanceClass(performanceMetrics()!.optimizationLevel)">
              {{performanceMetrics()!.optimizationLevel}}/10
            </div>
          </div>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon">
                <i class="icon-timer"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{performanceMetrics()!.evaluationTimeMs | number:'1.0-0'}}ms</div>
                <div class="metric-label">Execution Time</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <i class="icon-memory"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{performanceMetrics()!.memoryUsageMB | number:'1.1-1'}}MB</div>
                <div class="metric-label">Memory Usage</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <i class="icon-cache"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{performanceMetrics()!.cacheHitRate * 100 | number:'1.0-0'}}%</div>
                <div class="metric-label">Cache Hit Rate</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <i class="icon-index"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{performanceMetrics()!.indexUtilization * 100 | number:'1.0-0'}}%</div>
                <div class="metric-label">Index Usage</div>
              </div>
            </div>
          </div>
          
          <!-- Performance Timeline -->
          <div class="performance-timeline" *ngIf="performanceHistory().length > 1">
            <h6>Performance History</h6>
            <div class="timeline-chart">
              <svg class="timeline-svg" width="100%" height="60">
                <polyline 
                  class="timeline-line"
                  [attr.points]="getTimelinePoints()"
                  fill="none" 
                  stroke="#4CAF50" 
                  stroke-width="2">
                </polyline>
                <circle 
                  *ngFor="let point of getTimelineCircles(); trackBy: trackTimelinePoint"
                  [attr.cx]="point.x"
                  [attr.cy]="point.y"
                  r="3"
                  fill="#4CAF50">
                </circle>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Data Preview -->
        <div class="data-preview">
          <div class="data-header">
            <h5>Preview Data</h5>
            <div class="view-controls">
              <button 
                class="view-btn"
                [class.active]="displayMode === 'table'"
                (click)="setDisplayMode('table')">
                <i class="icon-table"></i>
                Table
              </button>
              <button 
                class="view-btn"
                [class.active]="displayMode === 'cards'"
                (click)="setDisplayMode('cards')">
                <i class="icon-cards"></i>
                Cards
              </button>
            </div>
          </div>
          
          <!-- Table View -->
          <div class="table-view" *ngIf="displayMode === 'table'">
            <div class="table-container">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th *ngFor="let column of getPreviewColumns(); trackBy: trackColumn">
                      {{column.headerName || column.field}}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let row of getPreviewRows(); trackBy: trackRow; 
                          let isEven = even"
                      [class.even]="isEven">
                    <td *ngFor="let column of getPreviewColumns(); trackBy: trackColumn"
                        [class]="getCellClass(row, column)">
                      {{getCellValue(row, column) | json}}
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div class="table-footer" *ngIf="hasMoreRows()">
                <div class="more-rows-indicator">
                  ... and {{getRemainingRowCount()}} more rows
                </div>
              </div>
            </div>
          </div>
          
          <!-- Card View -->
          <div class="card-view" *ngIf="displayMode === 'cards'">
            <div class="cards-container">
              <div class="preview-card" 
                   *ngFor="let row of getPreviewRows(); trackBy: trackRow">
                <div class="card-header">
                  <span class="row-index">#{{getRowIndex(row)}}</span>
                </div>
                <div class="card-content">
                  <div class="card-field" 
                       *ngFor="let column of getPreviewColumns(); trackBy: trackColumn">
                    <div class="field-label">{{column.headerName || column.field}}</div>
                    <div class="field-value" 
                         [class]="getCellClass(row, column)">
                      {{getCellValue(row, column) | json}}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="cards-footer" *ngIf="hasMoreRows()">
              <div class="more-cards-indicator">
                ... and {{getRemainingRowCount()}} more rows
              </div>
            </div>
          </div>
        </div>
        
        <!-- Data Quality Insights -->
        <div class="quality-insights" *ngIf="dataQualityInsights()?.length">
          <div class="insights-header">
            <h5>Data Quality Insights</h5>
          </div>
          
          <div class="insights-list">
            <div class="insight-item" 
                 *ngFor="let insight of dataQualityInsights(); trackBy: trackInsight"
                 [class]="insight.severity">
              <div class="insight-icon">
                <i [class]="getInsightIcon(insight.type)"></i>
              </div>
              <div class="insight-content">
                <div class="insight-title">{{insight.title}}</div>
                <div class="insight-description">{{insight.description}}</div>
                <div class="insight-action" *ngIf="insight.action">
                  <button class="action-link" (click)="executeInsightAction(insight)">
                    {{insight.action.label}}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./filter-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Add smooth animations
  ]
})
export class FilterPreviewComponent implements OnInit, OnDestroy, OnChanges {
  
  // Component inputs
  @Input() filterModel = signal<MultiFilterModel | null>(null);
  @Input() sampleData = signal<any[]>([]);
  @Input() previewLimit = signal(100);
  @Input() showStats = signal(true);
  
  // Component outputs
  @Output() previewUpdated = new EventEmitter<any>();
  @Output() settingsChanged = new EventEmitter<any>();
  @Output() dataExported = new EventEmitter<any[]>();
  
  // Internal state signals
  private _isLoading = signal(false);
  private _hasError = signal(false);
  private _errorMessage = signal('');
  private _loadingProgress = signal(0);
  private _isExpanded = signal(false);
  private _showSettings = signal(false);
  private _previewResults = signal<any>(null);
  private _previewStats = signal<any>(null);
  private _performanceMetrics = signal<PerformanceMetrics | null>(null);
  private _performanceHistory = signal<PerformanceMetrics[]>([]);
  private _dataQualityInsights = signal<any[]>([]);
  
  // Component properties
  showPerformance = true;
  autoRefresh = false;
  sampleDataSource = 'provided';
  displayMode = 'table';
  
  // Computed properties
  isLoading = this._isLoading.asReadonly();
  hasError = this._hasError.asReadonly();
  errorMessage = this._errorMessage.asReadonly();
  loadingProgress = this._loadingProgress.asReadonly();
  isExpanded = this._isExpanded.asReadonly();
  showSettings = this._showSettings.asReadonly();
  previewResults = this._previewResults.asReadonly();
  previewStats = this._previewStats.asReadonly();
  performanceMetrics = this._performanceMetrics.asReadonly();
  performanceHistory = this._performanceHistory.asReadonly();
  dataQualityInsights = this._dataQualityInsights.asReadonly();
  
  resultPercentage = computed(() => {
    const results = this._previewResults();
    if (!results) return 0;
    return (results.filteredData.length / results.totalData.length) * 100;
  });
  
  // Auto-refresh interval
  private autoRefreshInterval?: number;
  
  constructor() {
    // Set up reactive effects
    effect(() => {
      const model = this.filterModel();
      if (model && this.autoRefresh) {
        this.refreshPreview();
      }
    });
  }
  
  ngOnInit(): void {
    this.initializeComponent();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterModel'] || changes['sampleData']) {
      this.refreshPreview();
    }
  }
  
  ngOnDestroy(): void {
    this.cleanup();
  }
  
  // Event handlers
  toggleSettings(): void {
    this._showSettings.update(show => !show);
  }
  
  toggleExpanded(): void {
    this._isExpanded.update(expanded => !expanded);
  }
  
  async refreshPreview(): Promise<void> {
    const model = this.filterModel();
    const data = this.sampleData();
    
    if (!model || data.length === 0) {
      this.clearPreview();
      return;
    }
    
    this._isLoading.set(true);
    this._hasError.set(false);
    this._loadingProgress.set(0);
    
    try {
      // Simulate progressive loading
      await this.simulateLoading();
      
      // Apply filter to sample data
      const results = await this.applyFilterToData(model, data);
      
      // Calculate statistics
      const stats = this.calculatePreviewStats(results);
      
      // Analyze performance
      const performance = await this.analyzePerformance(model, results);
      
      // Generate data quality insights
      const insights = this.generateDataQualityInsights(results);
      
      // Update state
      this._previewResults.set(results);
      this._previewStats.set(stats);
      this._performanceMetrics.set(performance);
      this._dataQualityInsights.set(insights);
      
      // Add to performance history
      this._performanceHistory.update(history => [...history, performance].slice(-20));
      
      // Emit preview updated event
      this.previewUpdated.emit({
        results,
        stats,
        performance,
        insights
      });
      
    } catch (error) {
      this._hasError.set(true);
      this._errorMessage.set(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this._isLoading.set(false);
      this._loadingProgress.set(0);
    }
  }
  
  retryPreview(): void {
    this.refreshPreview();
  }
  
  exportResults(): void {
    const results = this._previewResults();
    if (!results) return;
    
    this.dataExported.emit(results.filteredData);
    
    // Also download as CSV
    this.downloadAsCSV(results.filteredData);
  }
  
  // Settings event handlers
  onPreviewLimitChanged(): void {
    this.previewLimit.set(this.previewLimit());
    this.settingsChanged.emit({ previewLimit: this.previewLimit() });
    if (this.autoRefresh) {
      this.refreshPreview();
    }
  }
  
  onShowStatsChanged(): void {
    this.showStats.set(this.showStats());
    this.settingsChanged.emit({ showStats: this.showStats() });
  }
  
  onShowPerformanceChanged(): void {
    this.settingsChanged.emit({ showPerformance: this.showPerformance });
  }
  
  onAutoRefreshChanged(): void {
    if (this.autoRefresh) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
    this.settingsChanged.emit({ autoRefresh: this.autoRefresh });
  }
  
  onSampleDataChanged(): void {
    // Handle sample data source change
    this.settingsChanged.emit({ sampleDataSource: this.sampleDataSource });
    this.refreshPreview();
  }
  
  onDisplayModeChanged(): void {
    this.settingsChanged.emit({ displayMode: this.displayMode });
  }
  
  setDisplayMode(mode: string): void {
    this.displayMode = mode;
    this.onDisplayModeChanged();
  }
  
  // Data display methods
  getPreviewColumns(): any[] {
    const results = this._previewResults();
    if (!results || results.filteredData.length === 0) return [];
    
    const firstRow = results.filteredData[0];
    return Object.keys(firstRow).map(key => ({
      field: key,
      headerName: key
    }));
  }
  
  getPreviewRows(): any[] {
    const results = this._previewResults();
    if (!results) return [];
    
    return results.filteredData.slice(0, this.previewLimit());
  }
  
  hasMoreRows(): boolean {
    const results = this._previewResults();
    return results && results.filteredData.length > this.previewLimit();
  }
  
  getRemainingRowCount(): number {
    const results = this._previewResults();
    return results ? Math.max(0, results.filteredData.length - this.previewLimit()) : 0;
  }
  
  getCellValue(row: any, column: any): any {
    return row[column.field];
  }
  
  getCellClass(row: any, column: any): string {
    const value = row[column.field];
    if (value === null || value === undefined) return 'null-value';
    if (typeof value === 'number') return 'numeric-value';
    if (typeof value === 'boolean') return 'boolean-value';
    if (typeof value === 'string' && value.trim() === '') return 'empty-value';
    return 'text-value';
  }
  
  getRowIndex(row: any): number {
    const results = this._previewResults();
    return results ? results.filteredData.indexOf(row) + 1 : 0;
  }
  
  // Utility methods
  trackRow(index: number, row: any): any {
    return row.id || index;
  }
  
  trackColumn(index: number, column: any): string {
    return column.field;
  }
  
  trackColumnStat(index: number, stat: any): string {
    return stat.columnId;
  }
  
  trackInsight(index: number, insight: any): string {
    return insight.id || index;
  }
  
  trackTimelinePoint(index: number, point: any): number {
    return index;
  }
  
  getPercentageClass(percentage: number): string {
    if (percentage >= 80) return 'high-percentage';
    if (percentage >= 50) return 'medium-percentage';
    if (percentage >= 20) return 'low-percentage';
    return 'very-low-percentage';
  }
  
  getPerformanceClass(score: number): string {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'poor';
  }
  
  getInsightIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'warning': 'icon-warning',
      'error': 'icon-error',
      'info': 'icon-info',
      'suggestion': 'icon-lightbulb'
    };
    return iconMap[type] || 'icon-info';
  }
  
  executeInsightAction(insight: any): void {
    if (insight.action?.callback) {
      insight.action.callback();
    }
  }
  
  // Performance timeline methods
  getTimelinePoints(): string {
    const history = this._performanceHistory();
    if (history.length < 2) return '';
    
    const width = 300; // SVG width
    const height = 60; // SVG height
    const padding = 10;
    
    const maxTime = Math.max(...history.map(h => h.evaluationTimeMs));
    const minTime = Math.min(...history.map(h => h.evaluationTimeMs));
    const timeRange = maxTime - minTime || 1;
    
    const points = history.map((metric, index) => {
      const x = padding + (index / (history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((metric.evaluationTimeMs - minTime) / timeRange) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return points.join(' ');
  }
  
  getTimelineCircles(): { x: number; y: number }[] {
    const history = this._performanceHistory();
    if (history.length < 2) return [];
    
    const width = 300;
    const height = 60;
    const padding = 10;
    
    const maxTime = Math.max(...history.map(h => h.evaluationTimeMs));
    const minTime = Math.min(...history.map(h => h.evaluationTimeMs));
    const timeRange = maxTime - minTime || 1;
    
    return history.map((metric, index) => ({
      x: padding + (index / (history.length - 1)) * (width - 2 * padding),
      y: height - padding - ((metric.evaluationTimeMs - minTime) / timeRange) * (height - 2 * padding)
    }));
  }
  
  // Private methods
  private initializeComponent(): void {
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }
  
  private cleanup(): void {
    this.stopAutoRefresh();
  }
  
  private clearPreview(): void {
    this._previewResults.set(null);
    this._previewStats.set(null);
    this._performanceMetrics.set(null);
    this._dataQualityInsights.set([]);
  }
  
  private async simulateLoading(): Promise<void> {
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      this._loadingProgress.set((i / steps) * 100);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  private async applyFilterToData(model: MultiFilterModel, data: any[]): Promise<{
    filteredData: any[];
    totalData: any[];
    filterTime: number;
  }> {
    const startTime = performance.now();
    
    // Mock filter application - in real implementation, this would use the compiled filter
    const filteredData = data.filter(row => {
      // Simple mock filtering logic
      return Math.random() > 0.3; // Mock 70% pass rate
    });
    
    const filterTime = performance.now() - startTime;
    
    return {
      filteredData: filteredData.slice(0, this.previewLimit()),
      totalData: data,
      filterTime
    };
  }
  
  private calculatePreviewStats(results: any): any {
    const { filteredData, totalData } = results;
    
    if (filteredData.length === 0) {
      return {
        totalRows: totalData.length,
        filteredRows: 0,
        filterRate: 0,
        uniqueValues: 0,
        columnStats: []
      };
    }
    
    // Calculate column statistics
    const columns = Object.keys(filteredData[0]);
    const columnStats = columns.map(columnId => {
      const values = filteredData.map(row => row[columnId]);
      const uniqueValues = new Set(values.filter(v => v !== null && v !== undefined));
      const nullValues = values.filter(v => v === null || v === undefined);
      
      return {
        columnId,
        uniqueCount: uniqueValues.size,
        nullCount: nullValues.length,
        uniquePercentage: (uniqueValues.size / values.length) * 100,
        nullPercentage: (nullValues.length / values.length) * 100
      };
    });
    
    return {
      totalRows: totalData.length,
      filteredRows: filteredData.length,
      filterRate: (filteredData.length / totalData.length) * 100,
      uniqueValues: new Set(filteredData.map(row => JSON.stringify(row))).size,
      columnStats
    };
  }
  
  private async analyzePerformance(model: MultiFilterModel, results: any): Promise<PerformanceMetrics> {
    // Mock performance analysis
    return {
      evaluationTimeMs: results.filterTime,
      memoryUsageMB: (results.filteredData.length * 0.001), // Mock calculation
      cacheHitRate: Math.random(), // Mock cache hit rate
      indexUtilization: Math.random(), // Mock index utilization
      optimizationLevel: Math.floor(Math.random() * 10) + 1
    };
  }
  
  private generateDataQualityInsights(results: any): any[] {
    const insights: any[] = [];
    
    if (results.filteredData.length === 0) {
      insights.push({
        id: 'no-results',
        type: 'warning',
        severity: 'warning',
        title: 'No Results Found',
        description: 'The current filter criteria returned no results. Consider relaxing the conditions.',
        action: {
          label: 'Suggest Alternatives',
          callback: () => console.log('Suggesting alternatives')
        }
      });
    } else if (results.filteredData.length / results.totalData.length < 0.1) {
      insights.push({
        id: 'very-selective',
        type: 'info',
        severity: 'info',
        title: 'Highly Selective Filter',
        description: 'This filter is very selective, returning less than 10% of the data.',
        action: null
      });
    }
    
    // Check for data quality issues
    const firstRow = results.filteredData[0];
    if (firstRow) {
      const nullColumns = Object.keys(firstRow).filter(key => {
        const values = results.filteredData.map(row => row[key]);
        const nullRate = values.filter(v => v === null || v === undefined).length / values.length;
        return nullRate > 0.5;
      });
      
      if (nullColumns.length > 0) {
        insights.push({
          id: 'high-null-rate',
          type: 'warning',
          severity: 'warning',
          title: 'High Null Rate Detected',
          description: `Columns ${nullColumns.join(', ')} have high null rates in the filtered data.`,
          action: null
        });
      }
    }
    
    return insights;
  }
  
  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.autoRefreshInterval = window.setInterval(() => {
      this.refreshPreview();
    }, 5000); // Refresh every 5 seconds
  }
  
  private stopAutoRefresh(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = undefined;
    }
  }
  
  private downloadAsCSV(data: any[]): void {
    if (data.length === 0) return;
    
    const columns = Object.keys(data[0]);
    const csvContent = [
      columns.join(','), // Header
      ...data.map(row => columns.map(col => {
        const value = row[col];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'filter-results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}