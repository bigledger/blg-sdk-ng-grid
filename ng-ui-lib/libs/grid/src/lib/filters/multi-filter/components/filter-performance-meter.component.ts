import { 
  Component, 
  ChangeDetectionStrategy, 
  Input, 
  Output, 
  EventEmitter,
  OnInit, 
  OnChanges,
  SimpleChanges,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  PerformanceMetrics, 
  FilterComplexity 
} from '../multi-filter.interface';

/**
 * Filter Performance Meter Component
 * 
 * Real-time performance monitoring and optimization guidance.
 * Features:
 * - Live performance metrics visualization
 * - Performance trend analysis
 * - Optimization recommendations
 * - Complexity analysis and warnings
 * - Resource usage monitoring
 * - Performance history tracking
 */
@Component({
  selector: 'blg-filter-performance-meter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="performance-meter" 
         [class.warning]="hasPerformanceWarning()"
         [class.critical]="hasPerformanceCritical()"
         [class.detailed]="showDetails()">
      
      <!-- Compact Performance Indicator -->
      <div class="performance-compact" *ngIf="!showDetails()">
        <div class="performance-score" 
             [class]="getOverallPerformanceClass()"
             (click)="toggleDetails()"
             title="Click for detailed performance metrics">
          <div class="score-ring">
            <svg class="score-circle" width="32" height="32" viewBox="0 0 32 32">
              <circle 
                cx="16" 
                cy="16" 
                r="14" 
                fill="none" 
                stroke="#e0e0e0" 
                stroke-width="3">
              </circle>
              <circle 
                cx="16" 
                cy="16" 
                r="14" 
                fill="none" 
                [attr.stroke]="getScoreColor()"
                stroke-width="3"
                stroke-dasharray="87.96"
                [attr.stroke-dashoffset]="getScoreDashOffset()"
                class="score-progress"
                transform="rotate(-90 16 16)">
              </circle>
            </svg>
            <div class="score-text">{{getOverallScore()}}</div>
          </div>
        </div>
        
        <div class="performance-summary">
          <div class="metric-badge time" 
               [class]="getTimePerformanceClass()"
               title="Execution time">
            <i class="icon-timer"></i>
            <span>{{formatTime(metrics()?.evaluationTimeMs)}}</span>
          </div>
          
          <div class="metric-badge memory" 
               [class]="getMemoryPerformanceClass()"
               title="Memory usage">
            <i class="icon-memory"></i>
            <span>{{formatMemory(metrics()?.memoryUsageMB)}}</span>
          </div>
        </div>
      </div>
      
      <!-- Detailed Performance Panel -->
      <div class="performance-detailed" *ngIf="showDetails()">
        
        <!-- Header -->
        <div class="performance-header">
          <div class="header-left">
            <h4 class="performance-title">
              <i class="icon-speed"></i>
              Performance Monitor
            </h4>
            
            <div class="overall-score-detailed">
              <div class="score-value" [class]="getOverallPerformanceClass()">
                {{getOverallScore()}}/10
              </div>
              <div class="score-label">Overall Performance</div>
            </div>
          </div>
          
          <div class="header-actions">
            <button 
              class="action-btn optimize-btn"
              (click)="requestOptimization()"
              [disabled]="getOverallScore() >= 8"
              title="Optimize filter performance">
              <i class="icon-optimization"></i>
              Optimize
            </button>
            
            <button 
              class="action-btn close-btn"
              (click)="toggleDetails()"
              title="Hide details">
              <i class="icon-close"></i>
            </button>
          </div>
        </div>
        
        <!-- Core Metrics -->
        <div class="core-metrics">
          <div class="metrics-grid">
            
            <!-- Execution Time -->
            <div class="metric-card time-metric">
              <div class="metric-icon">
                <i class="icon-timer"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value" [class]="getTimePerformanceClass()">
                  {{formatTime(metrics()?.evaluationTimeMs)}}
                </div>
                <div class="metric-label">Execution Time</div>
                <div class="metric-bar">
                  <div class="bar-fill" 
                       [style.width.%]="getTimePercentage()"
                       [class]="getTimePerformanceClass()">
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Memory Usage -->
            <div class="metric-card memory-metric">
              <div class="metric-icon">
                <i class="icon-memory"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value" [class]="getMemoryPerformanceClass()">
                  {{formatMemory(metrics()?.memoryUsageMB)}}
                </div>
                <div class="metric-label">Memory Usage</div>
                <div class="metric-bar">
                  <div class="bar-fill" 
                       [style.width.%]="getMemoryPercentage()"
                       [class]="getMemoryPerformanceClass()">
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Cache Performance -->
            <div class="metric-card cache-metric">
              <div class="metric-icon">
                <i class="icon-cache"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value" [class]="getCachePerformanceClass()">
                  {{formatPercentage(metrics()?.cacheHitRate)}}
                </div>
                <div class="metric-label">Cache Hit Rate</div>
                <div class="metric-bar">
                  <div class="bar-fill" 
                       [style.width.%]="(metrics()?.cacheHitRate || 0) * 100"
                       [class]="getCachePerformanceClass()">
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Index Usage -->
            <div class="metric-card index-metric">
              <div class="metric-icon">
                <i class="icon-index"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value" [class]="getIndexPerformanceClass()">
                  {{formatPercentage(metrics()?.indexUtilization)}}
                </div>
                <div class="metric-label">Index Usage</div>
                <div class="metric-bar">
                  <div class="bar-fill" 
                       [style.width.%]="(metrics()?.indexUtilization || 0) * 100"
                       [class]="getIndexPerformanceClass()">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Complexity Analysis -->
        <div class="complexity-analysis" *ngIf="complexity()">
          <div class="analysis-header">
            <h5>Filter Complexity</h5>
            <div class="complexity-badge" [class]="complexity()!.estimatedPerformance">
              {{complexity()!.estimatedPerformance}}
            </div>
          </div>
          
          <div class="complexity-metrics">
            <div class="complexity-item">
              <span class="complexity-label">Node Count:</span>
              <span class="complexity-value">{{complexity()!.nodeCount}}</span>
              <div class="complexity-indicator" [class]="getNodeCountClass()">
                <div class="indicator-bar" [style.width.%]="getNodeCountPercentage()"></div>
              </div>
            </div>
            
            <div class="complexity-item">
              <span class="complexity-label">Max Depth:</span>
              <span class="complexity-value">{{complexity()!.maxDepth}}</span>
              <div class="complexity-indicator" [class]="getDepthClass()">
                <div class="indicator-bar" [style.width.%]="getDepthPercentage()"></div>
              </div>
            </div>
            
            <div class="complexity-item">
              <span class="complexity-label">Operator Diversity:</span>
              <span class="complexity-value">{{complexity()!.operatorDiversity}}</span>
              <div class="complexity-indicator" [class]="getDiversityClass()">
                <div class="indicator-bar" [style.width.%]="getDiversityPercentage()"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Performance Warnings -->
        <div class="performance-warnings" *ngIf="performanceWarnings().length > 0">
          <div class="warnings-header">
            <h5>Performance Warnings</h5>
          </div>
          
          <div class="warnings-list">
            <div class="warning-item" 
                 *ngFor="let warning of performanceWarnings(); trackBy: trackWarning"
                 [class]="warning.severity">
              <div class="warning-icon">
                <i [class]="getWarningIcon(warning.severity)"></i>
              </div>
              <div class="warning-content">
                <div class="warning-title">{{warning.title}}</div>
                <div class="warning-description">{{warning.description}}</div>
                <div class="warning-suggestion" *ngIf="warning.suggestion">
                  <strong>Suggestion:</strong> {{warning.suggestion}}
                </div>
              </div>
              <div class="warning-actions" *ngIf="warning.action">
                <button 
                  class="warning-action-btn"
                  (click)="executeWarningAction(warning)"
                  [class]="warning.action.type">
                  {{warning.action.label}}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Optimization Suggestions -->
        <div class="optimization-suggestions" *ngIf="optimizationSuggestions().length > 0">
          <div class="suggestions-header">
            <h5>Optimization Suggestions</h5>
          </div>
          
          <div class="suggestions-list">
            <div class="suggestion-item" 
                 *ngFor="let suggestion of optimizationSuggestions(); trackBy: trackSuggestion"
                 [class.high-impact]="suggestion.impact === 'high'">
              <div class="suggestion-impact">
                <div class="impact-indicator" [class]="suggestion.impact">
                  {{getImpactSymbol(suggestion.impact)}}
                </div>
              </div>
              <div class="suggestion-content">
                <div class="suggestion-title">{{suggestion.title}}</div>
                <div class="suggestion-description">{{suggestion.description}}</div>
                <div class="expected-improvement">
                  Expected improvement: 
                  <span class="improvement-value">{{suggestion.expectedImprovement}}</span>
                </div>
              </div>
              <div class="suggestion-actions">
                <button 
                  class="suggestion-btn apply-btn"
                  (click)="applySuggestion(suggestion)"
                  title="Apply this optimization">
                  <i class="icon-check"></i>
                  Apply
                </button>
                <button 
                  class="suggestion-btn dismiss-btn"
                  (click)="dismissSuggestion(suggestion)"
                  title="Dismiss suggestion">
                  <i class="icon-close"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Performance History -->
        <div class="performance-history" *ngIf="performanceHistory().length > 1">
          <div class="history-header">
            <h5>Performance Trend</h5>
            <div class="trend-indicator" [class]="getPerformanceTrend()">
              <i [class]="getTrendIcon()"></i>
              <span>{{getTrendLabel()}}</span>
            </div>
          </div>
          
          <div class="history-chart">
            <svg class="trend-chart" width="100%" height="60" viewBox="0 0 300 60">
              <!-- Grid lines -->
              <defs>
                <pattern id="grid" width="30" height="15" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 15" fill="none" stroke="#e0e0e0" stroke-width="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              <!-- Performance line -->
              <polyline 
                [attr.points]="getHistoryLinePoints()"
                fill="none" 
                [attr.stroke]="getHistoryLineColor()" 
                stroke-width="2"
                class="trend-line">
              </polyline>
              
              <!-- Data points -->
              <circle 
                *ngFor="let point of getHistoryPoints(); trackBy: trackHistoryPoint"
                [attr.cx]="point.x"
                [attr.cy]="point.y"
                r="2"
                [attr.fill]="getHistoryLineColor()"
                class="trend-point">
              </circle>
            </svg>
          </div>
          
          <div class="history-summary">
            <div class="summary-item">
              <span class="summary-label">Best:</span>
              <span class="summary-value good">{{formatTime(getBestPerformance())}}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Average:</span>
              <span class="summary-value">{{formatTime(getAveragePerformance())}}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Current:</span>
              <span class="summary-value" [class]="getTimePerformanceClass()">
                {{formatTime(metrics()?.evaluationTimeMs)}}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./filter-performance-meter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterPerformanceMeterComponent implements OnInit, OnChanges {
  
  // Component inputs
  @Input() metrics = signal<PerformanceMetrics | null>(null);
  @Input() complexity = signal<FilterComplexity | null>(null);
  @Input() showDetails = signal(false);
  
  // Component outputs
  @Output() optimizeClicked = new EventEmitter<void>();
  @Output() detailsToggled = new EventEmitter<boolean>();
  
  // Internal state
  private _performanceHistory = signal<PerformanceMetrics[]>([]);
  private _performanceWarnings = signal<any[]>([]);
  private _optimizationSuggestions = signal<any[]>([]);
  
  // Computed properties
  performanceHistory = this._performanceHistory.asReadonly();
  performanceWarnings = this._performanceWarnings.asReadonly();
  optimizationSuggestions = this._optimizationSuggestions.asReadonly();
  
  hasPerformanceWarning = computed(() => {
    const m = this.metrics();
    return m && (m.evaluationTimeMs > 500 || m.memoryUsageMB > 50);
  });
  
  hasPerformanceCritical = computed(() => {
    const m = this.metrics();
    return m && (m.evaluationTimeMs > 2000 || m.memoryUsageMB > 200);
  });
  
  ngOnInit(): void {
    this.updateAnalysis();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['metrics'] && this.metrics()) {
      this.addToHistory(this.metrics()!);
      this.updateAnalysis();
    }
  }
  
  // Event handlers
  toggleDetails(): void {
    this.showDetails.update(show => !show);
    this.detailsToggled.emit(this.showDetails());
  }
  
  requestOptimization(): void {
    this.optimizeClicked.emit();
  }
  
  executeWarningAction(warning: any): void {
    if (warning.action?.callback) {
      warning.action.callback();
    }
  }
  
  applySuggestion(suggestion: any): void {
    console.log('Applying suggestion:', suggestion);
    // Remove from suggestions after applying
    this._optimizationSuggestions.update(suggestions => 
      suggestions.filter(s => s !== suggestion)
    );
  }
  
  dismissSuggestion(suggestion: any): void {
    this._optimizationSuggestions.update(suggestions => 
      suggestions.filter(s => s !== suggestion)
    );
  }
  
  // Formatting methods
  formatTime(ms?: number): string {
    if (!ms) return '0ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }
  
  formatMemory(mb?: number): string {
    if (!mb) return '0MB';
    if (mb < 1) return `${Math.round(mb * 1000)}KB`;
    return `${mb.toFixed(1)}MB`;
  }
  
  formatPercentage(value?: number): string {
    if (!value) return '0%';
    return `${Math.round(value * 100)}%`;
  }
  
  // Performance classification methods
  getOverallPerformanceClass(): string {
    const score = this.getOverallScore();
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'poor';
  }
  
  getOverallScore(): number {
    const m = this.metrics();
    if (!m) return 0;
    
    let score = 10;
    
    // Time penalty
    if (m.evaluationTimeMs > 2000) score -= 4;
    else if (m.evaluationTimeMs > 1000) score -= 2;
    else if (m.evaluationTimeMs > 500) score -= 1;
    
    // Memory penalty
    if (m.memoryUsageMB > 200) score -= 3;
    else if (m.memoryUsageMB > 100) score -= 2;
    else if (m.memoryUsageMB > 50) score -= 1;
    
    // Cache bonus/penalty
    if (m.cacheHitRate < 0.3) score -= 1;
    else if (m.cacheHitRate > 0.8) score += 1;
    
    // Index bonus/penalty
    if (m.indexUtilization < 0.2) score -= 1;
    else if (m.indexUtilization > 0.8) score += 1;
    
    return Math.max(0, Math.min(10, score));
  }
  
  getTimePerformanceClass(): string {
    const ms = this.metrics()?.evaluationTimeMs || 0;
    if (ms <= 100) return 'excellent';
    if (ms <= 500) return 'good';
    if (ms <= 1000) return 'fair';
    return 'poor';
  }
  
  getMemoryPerformanceClass(): string {
    const mb = this.metrics()?.memoryUsageMB || 0;
    if (mb <= 10) return 'excellent';
    if (mb <= 50) return 'good';
    if (mb <= 100) return 'fair';
    return 'poor';
  }
  
  getCachePerformanceClass(): string {
    const rate = this.metrics()?.cacheHitRate || 0;
    if (rate >= 0.8) return 'excellent';
    if (rate >= 0.6) return 'good';
    if (rate >= 0.3) return 'fair';
    return 'poor';
  }
  
  getIndexPerformanceClass(): string {
    const utilization = this.metrics()?.indexUtilization || 0;
    if (utilization >= 0.8) return 'excellent';
    if (utilization >= 0.6) return 'good';
    if (utilization >= 0.3) return 'fair';
    return 'poor';
  }
  
  // Complexity classification methods
  getNodeCountClass(): string {
    const count = this.complexity()?.nodeCount || 0;
    if (count <= 5) return 'excellent';
    if (count <= 15) return 'good';
    if (count <= 30) return 'fair';
    return 'poor';
  }
  
  getDepthClass(): string {
    const depth = this.complexity()?.maxDepth || 0;
    if (depth <= 2) return 'excellent';
    if (depth <= 4) return 'good';
    if (depth <= 6) return 'fair';
    return 'poor';
  }
  
  getDiversityClass(): string {
    const diversity = this.complexity()?.operatorDiversity || 0;
    if (diversity <= 2) return 'excellent';
    if (diversity <= 4) return 'good';
    if (diversity <= 6) return 'fair';
    return 'poor';
  }
  
  // Percentage calculations for progress bars
  getTimePercentage(): number {
    const ms = this.metrics()?.evaluationTimeMs || 0;
    return Math.min(100, (ms / 2000) * 100);
  }
  
  getMemoryPercentage(): number {
    const mb = this.metrics()?.memoryUsageMB || 0;
    return Math.min(100, (mb / 200) * 100);
  }
  
  getNodeCountPercentage(): number {
    const count = this.complexity()?.nodeCount || 0;
    return Math.min(100, (count / 50) * 100);
  }
  
  getDepthPercentage(): number {
    const depth = this.complexity()?.maxDepth || 0;
    return Math.min(100, (depth / 10) * 100);
  }
  
  getDiversityPercentage(): number {
    const diversity = this.complexity()?.operatorDiversity || 0;
    return Math.min(100, (diversity / 8) * 100);
  }
  
  // Score visualization methods
  getScoreColor(): string {
    const score = this.getOverallScore();
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#8BC34A';
    if (score >= 4) return '#FF9800';
    return '#F44336';
  }
  
  getScoreDashOffset(): number {
    const score = this.getOverallScore();
    const circumference = 87.96;
    return circumference - (score / 10) * circumference;
  }
  
  // Warning and suggestion methods
  getWarningIcon(severity: string): string {
    const iconMap: { [key: string]: string } = {
      'critical': 'icon-error',
      'warning': 'icon-warning',
      'info': 'icon-info'
    };
    return iconMap[severity] || 'icon-info';
  }
  
  getImpactSymbol(impact: string): string {
    const symbolMap: { [key: string]: string } = {
      'high': '+++',
      'medium': '++',
      'low': '+'
    };
    return symbolMap[impact] || '+';
  }
  
  // Performance trend methods
  getPerformanceTrend(): string {
    const history = this._performanceHistory();
    if (history.length < 3) return 'stable';
    
    const recent = history.slice(-3);
    const avgRecent = recent.reduce((sum, m) => sum + m.evaluationTimeMs, 0) / recent.length;
    const earlier = history.slice(-6, -3);
    
    if (earlier.length === 0) return 'stable';
    
    const avgEarlier = earlier.reduce((sum, m) => sum + m.evaluationTimeMs, 0) / earlier.length;
    
    if (avgRecent < avgEarlier * 0.9) return 'improving';
    if (avgRecent > avgEarlier * 1.1) return 'degrading';
    return 'stable';
  }
  
  getTrendIcon(): string {
    const trend = this.getPerformanceTrend();
    const iconMap: { [key: string]: string } = {
      'improving': 'icon-trending-up',
      'degrading': 'icon-trending-down',
      'stable': 'icon-trending-flat'
    };
    return iconMap[trend] || 'icon-trending-flat';
  }
  
  getTrendLabel(): string {
    const trend = this.getPerformanceTrend();
    const labelMap: { [key: string]: string } = {
      'improving': 'Improving',
      'degrading': 'Degrading',
      'stable': 'Stable'
    };
    return labelMap[trend] || 'Stable';
  }
  
  // History chart methods
  getHistoryLinePoints(): string {
    const history = this._performanceHistory();
    if (history.length < 2) return '';
    
    const width = 300;
    const height = 60;
    const padding = 10;
    
    const maxTime = Math.max(...history.map(h => h.evaluationTimeMs));
    const minTime = Math.min(...history.map(h => h.evaluationTimeMs));
    const timeRange = maxTime - minTime || 1;
    
    return history.map((metric, index) => {
      const x = padding + (index / (history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((metric.evaluationTimeMs - minTime) / timeRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
  }
  
  getHistoryPoints(): { x: number; y: number }[] {
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
  
  getHistoryLineColor(): string {
    const trend = this.getPerformanceTrend();
    const colorMap: { [key: string]: string } = {
      'improving': '#4CAF50',
      'degrading': '#F44336',
      'stable': '#2196F3'
    };
    return colorMap[trend] || '#2196F3';
  }
  
  getBestPerformance(): number {
    const history = this._performanceHistory();
    return history.length > 0 ? Math.min(...history.map(h => h.evaluationTimeMs)) : 0;
  }
  
  getAveragePerformance(): number {
    const history = this._performanceHistory();
    if (history.length === 0) return 0;
    return history.reduce((sum, h) => sum + h.evaluationTimeMs, 0) / history.length;
  }
  
  // Tracking methods
  trackWarning(index: number, warning: any): string {
    return warning.id || index;
  }
  
  trackSuggestion(index: number, suggestion: any): string {
    return suggestion.id || index;
  }
  
  trackHistoryPoint(index: number, point: any): number {
    return index;
  }
  
  // Private methods
  private addToHistory(metrics: PerformanceMetrics): void {
    this._performanceHistory.update(history => {
      const newHistory = [...history, metrics];
      return newHistory.slice(-20); // Keep last 20 measurements
    });
  }
  
  private updateAnalysis(): void {
    this.updateWarnings();
    this.updateOptimizationSuggestions();
  }
  
  private updateWarnings(): void {
    const warnings: any[] = [];
    const m = this.metrics();
    const c = this.complexity();
    
    if (m) {
      if (m.evaluationTimeMs > 2000) {
        warnings.push({
          id: 'slow-execution',
          severity: 'critical',
          title: 'Slow Filter Execution',
          description: 'Filter is taking over 2 seconds to execute',
          suggestion: 'Consider simplifying the filter or adding indexes',
          action: {
            type: 'optimize',
            label: 'Optimize Now',
            callback: () => this.requestOptimization()
          }
        });
      } else if (m.evaluationTimeMs > 1000) {
        warnings.push({
          id: 'slow-execution',
          severity: 'warning',
          title: 'Moderate Filter Slowdown',
          description: 'Filter execution is slower than optimal',
          suggestion: 'Review filter complexity and data structure'
        });
      }
      
      if (m.memoryUsageMB > 200) {
        warnings.push({
          id: 'high-memory',
          severity: 'critical',
          title: 'High Memory Usage',
          description: 'Filter is consuming excessive memory',
          suggestion: 'Consider reducing data set size or optimizing filter logic'
        });
      }
      
      if (m.cacheHitRate < 0.3) {
        warnings.push({
          id: 'low-cache',
          severity: 'warning',
          title: 'Low Cache Hit Rate',
          description: 'Filter is not benefiting from caching',
          suggestion: 'Review filter conditions for consistency'
        });
      }
    }
    
    if (c) {
      if (c.nodeCount > 30) {
        warnings.push({
          id: 'complex-filter',
          severity: 'warning',
          title: 'Highly Complex Filter',
          description: 'Filter has many conditions that may impact performance',
          suggestion: 'Consider breaking into multiple simpler filters'
        });
      }
      
      if (c.maxDepth > 6) {
        warnings.push({
          id: 'deep-nesting',
          severity: 'warning',
          title: 'Deep Filter Nesting',
          description: 'Filter has deep nested structure',
          suggestion: 'Consider flattening the filter structure'
        });
      }
    }
    
    this._performanceWarnings.set(warnings);
  }
  
  private updateOptimizationSuggestions(): void {
    const suggestions: any[] = [];
    const m = this.metrics();
    const c = this.complexity();
    
    if (m && c) {
      if (m.indexUtilization < 0.5 && c.nodeCount > 5) {
        suggestions.push({
          id: 'add-indexes',
          title: 'Add Database Indexes',
          description: 'Create indexes on frequently filtered columns to improve performance',
          impact: 'high',
          expectedImprovement: '50-80% faster execution'
        });
      }
      
      if (c.operatorDiversity > 5) {
        suggestions.push({
          id: 'consolidate-operators',
          title: 'Consolidate Filter Logic',
          description: 'Reduce the variety of operators used in the filter',
          impact: 'medium',
          expectedImprovement: '20-40% complexity reduction'
        });
      }
      
      if (m.cacheHitRate < 0.6) {
        suggestions.push({
          id: 'optimize-caching',
          title: 'Optimize Filter Caching',
          description: 'Improve caching strategy for better performance',
          impact: 'medium',
          expectedImprovement: '30-50% faster repeated queries'
        });
      }
    }
    
    this._optimizationSuggestions.set(suggestions);
  }
}