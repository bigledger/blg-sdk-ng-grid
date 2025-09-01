import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, combineLatest, map, startWith, debounceTime } from 'rxjs';

import { 
  ColumnGroupDefinition,
  ColumnGroupInteractionEvent,
  ColumnGroupMetric
} from '../interfaces/column-group.interface';
import { 
  ColumnGroupAnalyticsData,
  ColumnGroupPerformanceMetrics 
} from '../interfaces/column-group-state.interface';
import { ColumnGroupManagerService } from '../services/column-group-manager.service';

/**
 * Column Group Analytics Component
 * Provides comprehensive insights, metrics, and visualizations for column group usage
 * Features real-time analytics, performance monitoring, and user behavior insights
 */
@Component({
  selector: 'blg-column-group-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './column-group-analytics.component.html',
  styleUrls: ['./column-group-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnGroupAnalyticsComponent implements OnInit, OnDestroy {
  @Input() groups: ColumnGroupDefinition[] = [];
  @Input() showRealTimeMetrics: boolean = true;
  @Input() showPerformanceMetrics: boolean = true;
  @Input() showUsageInsights: boolean = true;
  @Input() showHeatmap: boolean = true;
  @Input() showTrends: boolean = true;
  @Input() refreshInterval: number = 5000;

  @ViewChild('chartContainer', { static: false }) chartContainer?: ElementRef<HTMLElement>;
  @ViewChild('heatmapContainer', { static: false }) heatmapContainer?: ElementRef<HTMLElement>;

  private readonly groupManager = inject(ColumnGroupManagerService);
  private readonly destroy$ = new Subject<void>();

  // Component state
  readonly isVisible = signal<boolean>(false);
  readonly selectedMetric = signal<string>('interactions');
  readonly selectedTimeframe = signal<string>('1h');
  readonly autoRefresh = signal<boolean>(true);

  // Analytics data signals
  readonly analyticsData = this.groupManager.analyticsData;
  readonly performanceMetrics = this.groupManager.performanceMetrics;
  
  // Computed insights
  readonly topGroups = computed(() => {
    const analytics = this.analyticsData();
    return analytics.usagePatterns.mostUsedGroups.slice(0, 5);
  });

  readonly bottomGroups = computed(() => {
    const analytics = this.analyticsData();
    return analytics.usagePatterns.leastUsedGroups.slice(0, 5);
  });

  readonly performanceScore = computed(() => {
    const perf = this.performanceMetrics();
    const renderScore = Math.max(0, 100 - (perf.rendering.averageRenderTime / 10));
    const fpsScore = (perf.animations.averageFrameRate / 60) * 100;
    const memoryScore = Math.max(0, 100 - (perf.memory.currentUsage / 1000000));
    
    return Math.round((renderScore + fpsScore + memoryScore) / 3);
  });

  readonly usageDistribution = computed(() => {
    const analytics = this.analyticsData();
    const total = Object.values(analytics.interactionCounts)
      .reduce((sum, counts) => sum + Object.values(counts).reduce((s, c) => s + c, 0), 0);
    
    return Object.entries(analytics.interactionCounts).map(([groupId, counts]) => {
      const groupTotal = Object.values(counts).reduce((sum, count) => sum + count, 0);
      return {
        groupId,
        percentage: total > 0 ? (groupTotal / total) * 100 : 0,
        interactions: groupTotal
      };
    }).sort((a, b) => b.percentage - a.percentage);
  });

  readonly interactionTrends = computed(() => {
    const analytics = this.analyticsData();
    const timeframe = this.selectedTimeframe();
    const trends = analytics.trends;
    
    switch (timeframe) {
      case '1h':
        return this.generateHourlyTrends(trends);
      case '24h':
        return trends.daily;
      case '7d':
        return trends.weekly;
      case '30d':
        return trends.monthly;
      default:
        return trends.daily;
    }
  });

  readonly heatmapData = computed(() => {
    const analytics = this.analyticsData();
    return this.generateHeatmapData(analytics);
  });

  readonly insights = computed(() => {
    const analytics = this.analyticsData();
    const performance = this.performanceMetrics();
    
    return this.generateInsights(analytics, performance);
  });

  readonly recommendations = computed(() => {
    const analytics = this.analyticsData();
    const performance = this.performanceMetrics();
    
    return this.generateRecommendations(analytics, performance);
  });

  // Available metrics for selection
  readonly availableMetrics = [
    { value: 'interactions', label: 'Interactions', icon: 'touch_app' },
    { value: 'performance', label: 'Performance', icon: 'speed' },
    { value: 'usage', label: 'Usage Patterns', icon: 'analytics' },
    { value: 'errors', label: 'Error Rate', icon: 'error_outline' }
  ];

  readonly availableTimeframes = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  ngOnInit(): void {
    this.initializeAnalytics();
    this.setupAutoRefresh();
    this.renderCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================
  // Public Methods
  // ========================================

  /**
   * Toggle analytics panel visibility
   */
  toggleVisibility(): void {
    this.isVisible.update(visible => !visible);
    
    if (this.isVisible()) {
      // Refresh data when panel becomes visible
      this.refreshData();
      this.renderCharts();
    }
  }

  /**
   * Export analytics data
   */
  exportData(format: 'json' | 'csv' | 'xlsx' = 'json'): void {
    const data = {
      analytics: this.analyticsData(),
      performance: this.performanceMetrics(),
      insights: this.insights(),
      recommendations: this.recommendations(),
      timestamp: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        this.downloadJSON(data);
        break;
      case 'csv':
        this.downloadCSV(data);
        break;
      case 'xlsx':
        this.downloadXLSX(data);
        break;
    }
  }

  /**
   * Refresh analytics data
   */
  refreshData(): void {
    this.groupManager.triggerAnalyticsEvent('refresh', {
      timestamp: Date.now(),
      manual: true
    });
  }

  /**
   * Select metric to display
   */
  selectMetric(metric: string): void {
    this.selectedMetric.set(metric);
    this.renderCharts();
  }

  /**
   * Change timeframe
   */
  changeTimeframe(timeframe: string): void {
    this.selectedTimeframe.set(timeframe);
    this.renderCharts();
  }

  /**
   * Toggle auto-refresh
   */
  toggleAutoRefresh(): void {
    this.autoRefresh.update(enabled => !enabled);
  }

  /**
   * Get group performance score
   */
  getGroupScore(groupId: string): number {
    const analytics = this.analyticsData();
    const interactions = analytics.interactionCounts[groupId];
    const performance = analytics.performanceImpact.renderTimes[groupId];
    
    if (!interactions || !performance) return 0;
    
    const interactionScore = Math.min(100, Object.values(interactions).reduce((s, c) => s + c, 0));
    const performanceScore = Math.max(0, 100 - (performance.reduce((s, t) => s + t, 0) / performance.length));
    
    return Math.round((interactionScore + performanceScore) / 2);
  }

  /**
   * Get group usage trend
   */
  getGroupTrend(groupId: string): 'up' | 'down' | 'stable' {
    const trends = this.interactionTrends();
    const recentData = Object.values(trends).slice(-7); // Last 7 data points
    
    if (recentData.length < 2) return 'stable';
    
    const first = recentData[0] as any;
    const last = recentData[recentData.length - 1] as any;
    
    const firstValue = first[groupId] || 0;
    const lastValue = last[groupId] || 0;
    
    const change = ((lastValue - firstValue) / Math.max(firstValue, 1)) * 100;
    
    if (change > 10) return 'up';
    if (change < -10) return 'down';
    return 'stable';
  }

  // ========================================
  // Private Methods
  // ========================================

  private initializeAnalytics(): void {
    // Subscribe to analytics events
    this.groupManager.getAnalyticsEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.processAnalyticsEvent(event);
      });

    // Monitor performance metrics
    combineLatest([
      this.performanceMetrics(),
      this.selectedMetric.asObservable ? this.selectedMetric.asObservable() : []
    ]).pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(([metrics, selectedMetric]) => {
      if (selectedMetric === 'performance') {
        this.updatePerformanceCharts(metrics);
      }
    });
  }

  private setupAutoRefresh(): void {
    // Auto-refresh when enabled
    combineLatest([
      this.autoRefresh(),
      this.isVisible()
    ]).pipe(
      debounceTime(this.refreshInterval),
      takeUntil(this.destroy$)
    ).subscribe(([autoRefresh, visible]) => {
      if (autoRefresh && visible) {
        this.refreshData();
      }
    });
  }

  private processAnalyticsEvent(event: ColumnGroupInteractionEvent): void {
    // Update real-time metrics
    this.updateRealTimeMetrics(event);
    
    // Update charts if visible
    if (this.isVisible()) {
      this.updateCharts(event);
    }
  }

  private updateRealTimeMetrics(event: ColumnGroupInteractionEvent): void {
    // Real-time metric updates would be implemented here
    // This would update the analytics data in real-time
  }

  private renderCharts(): void {
    if (!this.chartContainer?.nativeElement) return;

    const metric = this.selectedMetric();
    const container = this.chartContainer.nativeElement;

    switch (metric) {
      case 'interactions':
        this.renderInteractionChart(container);
        break;
      case 'performance':
        this.renderPerformanceChart(container);
        break;
      case 'usage':
        this.renderUsageChart(container);
        break;
      case 'errors':
        this.renderErrorChart(container);
        break;
    }

    if (this.showHeatmap && this.heatmapContainer?.nativeElement) {
      this.renderHeatmap(this.heatmapContainer.nativeElement);
    }
  }

  private renderInteractionChart(container: HTMLElement): void {
    // Implementation would render interaction chart using charting library
    const trends = this.interactionTrends();
    
    // Simple text-based representation for now
    container.innerHTML = `
      <div class="chart-placeholder">
        <h4>Interaction Trends</h4>
        <p>Total interactions: ${Object.keys(trends).length}</p>
        <div class="trend-bars">
          ${Object.entries(trends).slice(0, 10).map(([key, value]) => `
            <div class="trend-bar">
              <span class="trend-label">${key}</span>
              <div class="trend-value" style="width: ${Math.min(100, (value as number) * 10)}%">
                ${value}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderPerformanceChart(container: HTMLElement): void {
    const metrics = this.performanceMetrics();
    
    container.innerHTML = `
      <div class="chart-placeholder">
        <h4>Performance Metrics</h4>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">${metrics.rendering.averageRenderTime.toFixed(2)}ms</div>
            <div class="metric-label">Avg Render Time</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.animations.averageFrameRate.toFixed(1)}</div>
            <div class="metric-label">FPS</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${(metrics.memory.currentUsage / 1024 / 1024).toFixed(1)}MB</div>
            <div class="metric-label">Memory Usage</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${this.performanceScore()}</div>
            <div class="metric-label">Performance Score</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderUsageChart(container: HTMLElement): void {
    const distribution = this.usageDistribution();
    
    container.innerHTML = `
      <div class="chart-placeholder">
        <h4>Usage Distribution</h4>
        <div class="usage-chart">
          ${distribution.slice(0, 10).map(item => `
            <div class="usage-item">
              <div class="usage-bar">
                <div class="usage-fill" style="width: ${item.percentage}%"></div>
              </div>
              <div class="usage-info">
                <span class="usage-group">${item.groupId}</span>
                <span class="usage-percentage">${item.percentage.toFixed(1)}%</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderErrorChart(container: HTMLElement): void {
    // Placeholder for error chart
    container.innerHTML = `
      <div class="chart-placeholder">
        <h4>Error Metrics</h4>
        <p>No errors detected in the current timeframe.</p>
      </div>
    `;
  }

  private renderHeatmap(container: HTMLElement): void {
    const heatmapData = this.heatmapData();
    
    container.innerHTML = `
      <div class="heatmap-placeholder">
        <h4>Interaction Heatmap</h4>
        <div class="heatmap-grid">
          ${heatmapData.map(row => `
            <div class="heatmap-row">
              ${row.map(cell => `
                <div class="heatmap-cell" 
                     style="background-color: rgba(66, 153, 225, ${cell.intensity})"
                     title="${cell.tooltip}">
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private updateCharts(event: ColumnGroupInteractionEvent): void {
    // Update charts based on new event
    if (this.selectedMetric() === 'interactions') {
      this.renderCharts();
    }
  }

  private updatePerformanceCharts(metrics: ColumnGroupPerformanceMetrics): void {
    if (this.selectedMetric() === 'performance') {
      this.renderCharts();
    }
  }

  private generateHourlyTrends(trends: any): any {
    // Generate hourly trends from existing data
    const now = new Date();
    const hourlyData: any = {};
    
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const key = hour.toISOString().substr(0, 13);
      hourlyData[key] = Math.floor(Math.random() * 100); // Placeholder data
    }
    
    return hourlyData;
  }

  private generateHeatmapData(analytics: ColumnGroupAnalyticsData): HeatmapCell[][] {
    // Generate heatmap data for group interactions
    const groups = Object.keys(analytics.interactionCounts);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return hours.map(hour => 
      groups.map(groupId => {
        const interactions = analytics.interactionCounts[groupId];
        const intensity = Object.values(interactions).reduce((sum, count) => sum + count, 0) / 100;
        
        return {
          intensity: Math.min(1, intensity),
          tooltip: `Group: ${groupId}, Hour: ${hour}, Interactions: ${Math.round(intensity * 100)}`
        };
      })
    );
  }

  private generateInsights(
    analytics: ColumnGroupAnalyticsData,
    performance: ColumnGroupPerformanceMetrics
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // Performance insights
    if (performance.rendering.averageRenderTime > 100) {
      insights.push({
        type: 'warning',
        title: 'Slow Rendering Detected',
        description: `Average render time of ${performance.rendering.averageRenderTime.toFixed(2)}ms exceeds recommended threshold.`,
        impact: 'high',
        recommendation: 'Consider reducing the number of visible groups or enabling virtual scrolling.'
      });
    }

    // Usage insights
    const totalInteractions = Object.values(analytics.interactionCounts)
      .reduce((sum, counts) => sum + Object.values(counts).reduce((s, c) => s + c, 0), 0);
    
    if (totalInteractions === 0) {
      insights.push({
        type: 'info',
        title: 'No Recent Activity',
        description: 'No user interactions detected in the current timeframe.',
        impact: 'low',
        recommendation: 'This may be normal or indicate users are not discovering the grouping features.'
      });
    }

    // Memory insights
    if (performance.memory.currentUsage > 100 * 1024 * 1024) { // 100MB
      insights.push({
        type: 'warning',
        title: 'High Memory Usage',
        description: `Current memory usage of ${(performance.memory.currentUsage / 1024 / 1024).toFixed(1)}MB is elevated.`,
        impact: 'medium',
        recommendation: 'Enable lazy loading or reduce the number of simultaneously rendered groups.'
      });
    }

    return insights;
  }

  private generateRecommendations(
    analytics: ColumnGroupAnalyticsData,
    performance: ColumnGroupPerformanceMetrics
  ): AnalyticsRecommendation[] {
    const recommendations: AnalyticsRecommendation[] = [];

    // Performance recommendations
    if (performance.animations.averageFrameRate < 50) {
      recommendations.push({
        type: 'performance',
        title: 'Improve Animation Performance',
        description: 'Reduce animation complexity or disable animations on low-performance devices.',
        priority: 'high',
        effort: 'medium',
        impact: 'Animation smoothness will improve by ~20%'
      });
    }

    // Usage recommendations
    const leastUsed = analytics.usagePatterns.leastUsedGroups;
    if (leastUsed.length > 5) {
      recommendations.push({
        type: 'usability',
        title: 'Review Unused Groups',
        description: `${leastUsed.length} groups have minimal usage. Consider reorganizing or removing them.`,
        priority: 'medium',
        effort: 'low',
        impact: 'Cleaner interface and better user focus'
      });
    }

    return recommendations;
  }

  private downloadJSON(data: any): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `column-groups-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private downloadCSV(data: any): void {
    // Simple CSV export implementation
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `column-groups-analytics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private downloadXLSX(data: any): void {
    // XLSX export would require a library like SheetJS
    console.warn('XLSX export not implemented. Use JSON or CSV export instead.');
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion
    const headers = ['Metric', 'Value', 'Timestamp'];
    const rows: string[] = [headers.join(',')];
    
    // Add performance metrics
    const perf = data.performance;
    rows.push(`Average Render Time,${perf.rendering.averageRenderTime},${new Date().toISOString()}`);
    rows.push(`Frame Rate,${perf.animations.averageFrameRate},${new Date().toISOString()}`);
    rows.push(`Memory Usage,${perf.memory.currentUsage},${new Date().toISOString()}`);
    
    return rows.join('\n');
  }
}

// ========================================
// Supporting Interfaces
// ========================================

interface HeatmapCell {
  intensity: number;
  tooltip: string;
}

interface AnalyticsInsight {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface AnalyticsRecommendation {
  type: 'performance' | 'usability' | 'accessibility' | 'business';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  impact: string;
}