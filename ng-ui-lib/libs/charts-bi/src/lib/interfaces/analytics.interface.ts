export interface PredictiveAnalyticsConfig {
  enabled: boolean;
  models: PredictiveModel[];
  confidence?: number;
  horizon?: number;
}

export interface PredictiveModel {
  id: string;
  type: PredictiveModelType;
  name: string;
  description?: string;
  config: ModelConfig;
  training: TrainingConfig;
  validation?: ValidationConfig;
}

export type PredictiveModelType = 
  | 'linear-regression'
  | 'polynomial-regression'
  | 'arima'
  | 'exponential-smoothing'
  | 'neural-network'
  | 'random-forest'
  | 'support-vector-machine';

export interface ModelConfig {
  features: string[];
  target: string;
  parameters?: Record<string, any>;
  preprocessing?: PreprocessingStep[];
}

export interface PreprocessingStep {
  type: 'normalize' | 'standardize' | 'encode' | 'impute';
  config: Record<string, any>;
}

export interface TrainingConfig {
  splitRatio: number;
  validationRatio?: number;
  epochs?: number;
  batchSize?: number;
  learningRate?: number;
}

export interface ValidationConfig {
  metrics: ValidationMetric[];
  crossValidation?: boolean;
  folds?: number;
}

export type ValidationMetric = 
  | 'mse' 
  | 'rmse' 
  | 'mae' 
  | 'r2' 
  | 'accuracy'
  | 'precision'
  | 'recall'
  | 'f1';

export interface AnomalyDetectionConfig {
  enabled: boolean;
  algorithms: AnomalyAlgorithm[];
  threshold?: number;
  sensitivity?: number;
  realTime?: boolean;
}

export interface AnomalyAlgorithm {
  type: AnomalyAlgorithmType;
  name: string;
  config: Record<string, any>;
}

export type AnomalyAlgorithmType = 
  | 'statistical'
  | 'isolation-forest'
  | 'one-class-svm'
  | 'local-outlier-factor'
  | 'dbscan'
  | 'autoencoder';

export interface TrendAnalysisConfig {
  enabled: boolean;
  methods: TrendMethod[];
  periods: TrendPeriod[];
  decomposition?: boolean;
}

export interface TrendMethod {
  type: TrendMethodType;
  name: string;
  config: Record<string, any>;
}

export type TrendMethodType = 
  | 'linear'
  | 'exponential'
  | 'polynomial'
  | 'moving-average'
  | 'seasonal-decomposition'
  | 'kalman-filter';

export interface TrendPeriod {
  name: string;
  duration: number;
  unit: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface WhatIfScenario {
  id: string;
  name: string;
  description?: string;
  parameters: ScenarioParameter[];
  impacts: ScenarioImpact[];
}

export interface ScenarioParameter {
  field: string;
  type: 'number' | 'percentage' | 'category';
  value: any;
  range?: [number, number];
  step?: number;
}

export interface ScenarioImpact {
  metric: string;
  calculation: string;
  visualization?: string;
}

export interface ComparativeAnalysisConfig {
  enabled: boolean;
  comparisons: ComparisonConfig[];
  baseline: BaselineConfig;
}

export interface ComparisonConfig {
  type: ComparisonType;
  name: string;
  config: Record<string, any>;
}

export type ComparisonType = 
  | 'period-over-period'
  | 'year-over-year'
  | 'cohort'
  | 'a-b-testing'
  | 'benchmark';

export interface BaselineConfig {
  type: 'historical' | 'target' | 'benchmark';
  period?: string;
  value?: number;
  source?: string;
}

export interface ForecastingConfig {
  enabled: boolean;
  horizon: number;
  confidence: number[];
  models: ForecastModel[];
  seasonality?: SeasonalityConfig;
}

export interface ForecastModel {
  type: ForecastModelType;
  name: string;
  config: Record<string, any>;
  weight?: number;
}

export type ForecastModelType = 
  | 'arima'
  | 'sarima'
  | 'exponential-smoothing'
  | 'prophet'
  | 'lstm'
  | 'ensemble';

export interface SeasonalityConfig {
  enabled: boolean;
  periods: SeasonalityPeriod[];
  automatic?: boolean;
}

export interface SeasonalityPeriod {
  name: string;
  frequency: number;
  strength?: number;
}

export interface AnalyticsResult {
  type: 'prediction' | 'anomaly' | 'trend' | 'forecast' | 'comparison';
  timestamp: Date;
  data: any;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: InsightSeverity;
  confidence: number;
  data: any;
  recommendations?: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export type InsightType = 
  | 'anomaly'
  | 'trend-change'
  | 'forecast-deviation'
  | 'performance-decline'
  | 'opportunity'
  | 'correlation';

export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical';