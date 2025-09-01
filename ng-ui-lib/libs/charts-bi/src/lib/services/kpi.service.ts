import { Injectable, Signal, computed, signal } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, timer } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';

import {
  KPIConfig,
  KPIData,
  TrendData,
  ThresholdStatus,
  ScorecardConfig,
  ScorecardCategory
} from '../interfaces/kpi.interface.ts';
import { DataConnectorService } from './data-connector.service.ts';

@Injectable({
  providedIn: 'root'
})
export class KPIService {
  private readonly _kpiConfigs = signal<Map<string, KPIConfig>>(new Map());
  private readonly _kpiData = signal<Map<string, KPIData>>(new Map());
  private readonly _scorecardConfigs = signal<Map<string, ScorecardConfig>>(new Map());
  
  readonly kpiConfigs = this._kpiConfigs.asReadonly();
  readonly kpiData = this._kpiData.asReadonly();
  readonly scorecardConfigs = this._scorecardConfigs.asReadonly();

  constructor(private dataConnector: DataConnectorService) {}

  /**
   * Register a new KPI configuration
   */
  registerKPI(config: KPIConfig): void {
    this._kpiConfigs.update(configs => {
      const newConfigs = new Map(configs);
      newConfigs.set(config.id, config);
      return newConfigs;
    });
  }

  /**
   * Update KPI data
   */
  updateKPIData(kpiId: string, data: Partial<KPIData>): void {
    this._kpiData.update(kpiData => {
      const newData = new Map(kpiData);
      const existing = newData.get(kpiId) || {
        value: 0,
        timestamp: new Date()
      } as KPIData;
      
      newData.set(kpiId, { ...existing, ...data });
      return newData;
    });
  }

  /**
   * Get computed KPI with formatted value and status
   */
  getComputedKPI(kpiId: string): Signal<ComputedKPI | null> {
    return computed(() => {
      const config = this._kpiConfigs().get(kpiId);
      const data = this._kpiData().get(kpiId);
      
      if (!config || !data) return null;
      
      return this.computeKPI(config, data);
    });
  }

  /**
   * Calculate KPI value from raw data
   */
  calculateKPIValue(config: KPIConfig, rawData: any[]): number {
    const { metric } = config;
    
    // Apply filters first
    let filteredData = rawData;
    if (metric.filters) {
      filteredData = this.applyMetricFilters(rawData, metric.filters);
    }
    
    // Apply aggregation
    const values = filteredData.map(row => row[metric.field]).filter(v => v != null);
    
    switch (metric.aggregation) {
      case 'sum':
        return values.reduce((sum, val) => sum + Number(val), 0);
      case 'avg':
        return values.length > 0 ? values.reduce((sum, val) => sum + Number(val), 0) / values.length : 0;
      case 'count':
        return values.length;
      case 'count-distinct':
        return new Set(values).size;
      case 'min':
        return values.length > 0 ? Math.min(...values.map(Number)) : 0;
      case 'max':
        return values.length > 0 ? Math.max(...values.map(Number)) : 0;
      case 'median':
        return this.calculateMedian(values.map(Number));
      case 'percentile':
        // Would need percentile parameter
        return this.calculatePercentile(values.map(Number), 50);
      case 'custom':
        return this.evaluateCustomCalculation(config.metric.calculation!, filteredData);
      default:
        return 0;
    }
  }

  /**
   * Calculate trend data for KPI
   */
  calculateTrend(historical: number[], current: number): TrendData {
    if (historical.length === 0) {
      return {
        direction: 'stable',
        percentage: 0,
        velocity: 0,
        data: [current]
      };
    }
    
    const previous = historical[historical.length - 1];
    const percentage = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    const direction = percentage > 0.1 ? 'up' : percentage < -0.1 ? 'down' : 'stable';
    
    // Calculate velocity (rate of change)
    const velocity = historical.length > 1 ? 
      (current - historical[0]) / historical.length : 0;
    
    return {
      direction,
      percentage,
      velocity,
      data: [...historical, current]
    };
  }

  /**
   * Evaluate threshold status
   */
  evaluateThresholds(config: KPIConfig, value: number): ThresholdStatus | undefined {
    if (!config.thresholds || config.thresholds.length === 0) {
      return undefined;
    }
    
    // Find the threshold that applies to this value
    for (const threshold of config.thresholds) {
      if (this.valueMatchesThreshold(value, threshold)) {
        return {
          current: threshold.name,
          color: threshold.color,
          severity: threshold.severity
        };
      }
    }
    
    return undefined;
  }

  /**
   * Format KPI value according to configuration
   */
  formatValue(value: number, formatting: any): string {
    let formatted = value.toString();
    
    switch (formatting.type) {
      case 'number':
        formatted = this.formatNumber(value, formatting);
        break;
      case 'currency':
        formatted = this.formatCurrency(value, formatting);
        break;
      case 'percentage':
        formatted = this.formatPercentage(value, formatting);
        break;
      case 'duration':
        formatted = this.formatDuration(value);
        break;
      case 'bytes':
        formatted = this.formatBytes(value);
        break;
      case 'custom':
        formatted = this.formatCustom(value, formatting);
        break;
    }
    
    return formatted;
  }

  /**
   * Register scorecard configuration
   */
  registerScorecard(config: ScorecardConfig): void {
    this._scorecardConfigs.update(configs => {
      const newConfigs = new Map(configs);
      newConfigs.set(config.id, config);
      return newConfigs;
    });
  }

  /**
   * Calculate scorecard score
   */
  calculateScorecardScore(scorecardId: string): Signal<ScorecardScore | null> {
    return computed(() => {
      const config = this._scorecardConfigs().get(scorecardId);
      if (!config) return null;
      
      const categoryScores = config.categories.map(category => 
        this.calculateCategoryScore(category)
      );
      
      const totalScore = this.aggregateScores(categoryScores, config.scoring);
      const grade = this.calculateGrade(totalScore, config.scoring.scale);
      
      return {
        total: totalScore,
        grade,
        categories: categoryScores,
        timestamp: new Date()
      };
    });
  }

  /**
   * Private helper methods
   */
  private computeKPI(config: KPIConfig, data: KPIData): ComputedKPI {
    const formattedValue = this.formatValue(data.value, config.formatting);
    const threshold = this.evaluateThresholds(config, data.value);
    
    let comparison: ComparisonResult | undefined;
    if (config.comparison?.enabled && data.previous !== undefined) {
      comparison = this.calculateComparison(data.value, data.previous, config.comparison);
    }
    
    return {
      id: config.id,
      title: config.title,
      value: data.value,
      formattedValue,
      target: data.target,
      threshold,
      comparison,
      trend: data.trend,
      timestamp: data.timestamp
    };
  }

  private applyMetricFilters(data: any[], filters: any[]): any[] {
    return data.filter(row => {
      return filters.every(filter => {
        const value = row[filter.field];
        return this.evaluateFilterCondition(value, filter.operator, filter.value);
      });
    });
  }

  private evaluateFilterCondition(value: any, operator: string, filterValue: any): boolean {
    switch (operator) {
      case 'equals': return value === filterValue;
      case 'not-equals': return value !== filterValue;
      case 'greater-than': return value > filterValue;
      case 'less-than': return value < filterValue;
      case 'greater-equal': return value >= filterValue;
      case 'less-equal': return value <= filterValue;
      case 'contains': return String(value).includes(String(filterValue));
      case 'starts-with': return String(value).startsWith(String(filterValue));
      case 'ends-with': return String(value).endsWith(String(filterValue));
      case 'in': return Array.isArray(filterValue) && filterValue.includes(value);
      case 'not-in': return Array.isArray(filterValue) && !filterValue.includes(value);
      case 'between': 
        return Array.isArray(filterValue) && value >= filterValue[0] && value <= filterValue[1];
      default: return true;
    }
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  private evaluateCustomCalculation(calculation: any, data: any[]): number {
    // This would need a proper expression evaluator
    // Simplified implementation for demonstration
    const { formula, variables } = calculation;
    
    try {
      // Replace variables with actual data calculations
      let expression = formula;
      Object.entries(variables).forEach(([variable, field]) => {
        const values = data.map(row => row[field as string]).filter(v => v != null);
        const sum = values.reduce((s, v) => s + Number(v), 0);
        expression = expression.replace(new RegExp(`\\b${variable}\\b`, 'g'), sum.toString());
      });
      
      // Evaluate expression (UNSAFE - would need proper parser)
      return new Function(`return ${expression}`)();
    } catch {
      return 0;
    }
  }

  private valueMatchesThreshold(value: number, threshold: any): boolean {
    switch (threshold.operator) {
      case 'greater-than': return value > threshold.value;
      case 'less-than': return value < threshold.value;
      case 'between': 
        return Array.isArray(threshold.value) && 
               value >= threshold.value[0] && 
               value <= threshold.value[1];
      default: return false;
    }
  }

  private formatNumber(value: number, formatting: any): string {
    const decimals = formatting.decimals ?? 2;
    const separator = formatting.separator ?? ',';
    
    let formatted = value.toFixed(decimals);
    
    // Add thousand separators
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    formatted = parts.join('.');
    
    // Add prefix/suffix
    if (formatting.prefix) formatted = formatting.prefix + formatted;
    if (formatting.suffix) formatted = formatted + formatting.suffix;
    
    return formatted;
  }

  private formatCurrency(value: number, formatting: any): string {
    const currency = formatting.currency || 'USD';
    const locale = formatting.locale || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: formatting.decimals ?? 2
    }).format(value);
  }

  private formatPercentage(value: number, formatting: any): string {
    const decimals = formatting.decimals ?? 1;
    return (value * 100).toFixed(decimals) + '%';
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  private formatCustom(value: number, formatting: any): string {
    // Custom formatting logic would go here
    return value.toString();
  }

  private calculateComparison(current: number, previous: number, config: any): ComparisonResult {
    const absolute = current - previous;
    const percentage = previous !== 0 ? (absolute / previous) * 100 : 0;
    
    return {
      absolute,
      percentage,
      direction: absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'stable',
      formattedAbsolute: this.formatNumber(absolute, config.format),
      formattedPercentage: this.formatPercentage(percentage / 100, { decimals: 1 })
    };
  }

  private calculateCategoryScore(category: ScorecardCategory): CategoryScore {
    const kpiScores = category.kpis.map(kpiId => {
      const kpi = this._kpiData().get(kpiId);
      return kpi ? this.normalizeKPIScore(kpi) : 0;
    });
    
    const average = kpiScores.length > 0 
      ? kpiScores.reduce((sum, score) => sum + score, 0) / kpiScores.length 
      : 0;
    
    return {
      id: category.id,
      name: category.name,
      score: average,
      weight: category.weight,
      weightedScore: average * category.weight,
      kpiScores
    };
  }

  private normalizeKPIScore(kpiData: KPIData): number {
    // Normalize KPI value to 0-100 scale
    // This would depend on the specific KPI configuration
    if (kpiData.target) {
      return Math.min(100, (kpiData.value / kpiData.target) * 100);
    }
    return kpiData.value;
  }

  private aggregateScores(categoryScores: CategoryScore[], scoring: any): number {
    switch (scoring.method) {
      case 'weighted-average':
        const totalWeight = categoryScores.reduce((sum, cat) => sum + cat.weight, 0);
        const weightedSum = categoryScores.reduce((sum, cat) => sum + cat.weightedScore, 0);
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
      
      case 'geometric-mean':
        const product = categoryScores.reduce((prod, cat) => prod * cat.score, 1);
        return Math.pow(product, 1 / categoryScores.length);
      
      case 'min-max':
        return Math.min(...categoryScores.map(cat => cat.score));
      
      default:
        return categoryScores.reduce((sum, cat) => sum + cat.score, 0) / categoryScores.length;
    }
  }

  private calculateGrade(score: number, scale: any): string {
    const range = scale.ranges.find((r: any) => score >= r.min && score <= r.max);
    return range?.grade || range?.label || 'N/A';
  }
}

// Helper interfaces
interface ComputedKPI {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  target?: number;
  threshold?: ThresholdStatus;
  comparison?: ComparisonResult;
  trend?: TrendData;
  timestamp: Date;
}

interface ComparisonResult {
  absolute: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
  formattedAbsolute: string;
  formattedPercentage: string;
}

interface ScorecardScore {
  total: number;
  grade: string;
  categories: CategoryScore[];
  timestamp: Date;
}

interface CategoryScore {
  id: string;
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  kpiScores: number[];
}