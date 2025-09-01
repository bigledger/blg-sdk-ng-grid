export interface KPIConfig {
  id: string;
  title: string;
  description?: string;
  metric: MetricConfig;
  target?: TargetConfig;
  thresholds?: ThresholdConfig[];
  formatting: FormattingConfig;
  visualization: KPIVisualization;
  comparison?: ComparisonConfig;
  trend?: TrendConfig;
}

export interface MetricConfig {
  field: string;
  aggregation: AggregationType;
  calculation?: CalculationConfig;
  filters?: MetricFilter[];
}

export type AggregationType = 
  | 'sum'
  | 'avg' 
  | 'count'
  | 'count-distinct'
  | 'min'
  | 'max'
  | 'median'
  | 'percentile'
  | 'custom';

export interface CalculationConfig {
  formula: string;
  variables: Record<string, string>;
  functions?: string[];
}

export interface MetricFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator = 
  | 'equals'
  | 'not-equals'
  | 'greater-than'
  | 'less-than'
  | 'greater-equal'
  | 'less-equal'
  | 'contains'
  | 'starts-with'
  | 'ends-with'
  | 'in'
  | 'not-in'
  | 'between';

export interface TargetConfig {
  value: number;
  type: TargetType;
  period?: string;
  source?: string;
}

export type TargetType = 'absolute' | 'relative' | 'dynamic';

export interface ThresholdConfig {
  id: string;
  name: string;
  value: number;
  operator: 'greater-than' | 'less-than' | 'between';
  color: string;
  icon?: string;
  severity: 'success' | 'warning' | 'error' | 'info';
}

export interface FormattingConfig {
  type: FormattingType;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  currency?: string;
  locale?: string;
}

export type FormattingType = 
  | 'number'
  | 'currency'
  | 'percentage'
  | 'duration'
  | 'bytes'
  | 'custom';

export interface KPIVisualization {
  type: KPIVisualizationType;
  size: KPISize;
  style: KPIStyle;
  showSparkline?: boolean;
  sparklineConfig?: SparklineConfig;
}

export type KPIVisualizationType = 
  | 'card'
  | 'gauge'
  | 'progress'
  | 'bullet'
  | 'tile'
  | 'minimal';

export type KPISize = 'small' | 'medium' | 'large' | 'xl';

export interface KPIStyle {
  theme?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  borderRadius?: number;
  shadow?: boolean;
  animation?: AnimationConfig;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
  delay?: number;
}

export interface SparklineConfig {
  type: 'line' | 'area' | 'bar';
  height: number;
  color: string;
  showDots?: boolean;
  smooth?: boolean;
}

export interface ComparisonConfig {
  enabled: boolean;
  period: ComparisonPeriod;
  format: ComparisonFormat;
}

export interface ComparisonPeriod {
  type: 'previous-period' | 'same-period-last-year' | 'custom';
  offset?: number;
  customPeriod?: DateRange;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ComparisonFormat {
  showAbsolute: boolean;
  showPercentage: boolean;
  showArrow: boolean;
  colors: {
    positive: string;
    negative: string;
    neutral: string;
  };
}

export interface TrendConfig {
  enabled: boolean;
  period: number;
  analysis: TrendAnalysisType[];
  visualization: TrendVisualization;
}

export type TrendAnalysisType = 
  | 'direction'
  | 'velocity' 
  | 'acceleration'
  | 'volatility'
  | 'seasonality';

export interface TrendVisualization {
  showIcon: boolean;
  showText: boolean;
  showChart: boolean;
  chartType: 'line' | 'area' | 'bar';
}

export interface ScorecardConfig {
  id: string;
  title: string;
  description?: string;
  categories: ScorecardCategory[];
  layout: ScorecardLayout;
  scoring: ScoringConfig;
}

export interface ScorecardCategory {
  id: string;
  name: string;
  weight: number;
  kpis: string[];
  color?: string;
  icon?: string;
}

export interface ScorecardLayout {
  type: 'grid' | 'list' | 'hierarchy';
  columns?: number;
  showWeights?: boolean;
  showProgress?: boolean;
}

export interface ScoringConfig {
  method: ScoringMethod;
  scale: ScoringScale;
  aggregation: ScoringAggregation;
}

export type ScoringMethod = 'weighted-average' | 'geometric-mean' | 'min-max' | 'custom';

export interface ScoringScale {
  min: number;
  max: number;
  ranges: ScoreRange[];
}

export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  color: string;
  grade?: string;
}

export type ScoringAggregation = 'sum' | 'average' | 'weighted-sum' | 'custom';

export interface KPIData {
  value: number;
  target?: number;
  previous?: number;
  trend?: TrendData;
  threshold?: ThresholdStatus;
  timestamp: Date;
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  velocity: number;
  data: number[];
}

export interface ThresholdStatus {
  current: string;
  color: string;
  severity: 'success' | 'warning' | 'error' | 'info';
}