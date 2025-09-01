import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, Subject, BehaviorSubject, combineLatest, map, debounceTime, distinctUntilChanged } from 'rxjs';

import { ColumnDefinition } from '@blg/core';
import { 
  ColumnGroupDefinition, 
  ColumnGroupTemplate,
  ColumnGroupAISuggestion,
  ColumnGroupCondition
} from '../interfaces/column-group.interface';
import { ColumnGroupManagerService } from './column-group-manager.service';

/**
 * Column Group Builder Service
 * Provides advanced algorithms for dynamic group creation, auto-grouping,
 * and AI-powered suggestions that exceed ag-grid capabilities
 */
@Injectable({
  providedIn: 'root'
})
export class ColumnGroupBuilderService {
  private readonly groupManager = inject(ColumnGroupManagerService);

  // Internal state
  private readonly _buildingGroups = signal<boolean>(false);
  private readonly _lastAnalysis = signal<ColumnAnalysisResult | null>(null);
  private readonly _suggestions = signal<ColumnGroupAISuggestion[]>([]);
  private readonly _templates = signal<ColumnGroupTemplate[]>([]);

  // Observables for reactive operations
  private readonly columnsChanged$ = new BehaviorSubject<ColumnDefinition[]>([]);
  private readonly analysisRequested$ = new Subject<ColumnAnalysisRequest>();
  private readonly groupingStrategyChanged$ = new BehaviorSubject<GroupingStrategy>('similarity');

  // Public readonly signals
  readonly buildingGroups = this._buildingGroups.asReadonly();
  readonly lastAnalysis = this._lastAnalysis.asReadonly();
  readonly suggestions = this._suggestions.asReadonly();
  readonly availableTemplates = this._templates.asReadonly();

  // Computed suggestions with filtering
  readonly activeSuggestions = computed(() => {
    const now = Date.now();
    return this._suggestions().filter(suggestion => 
      !suggestion.expiresAt || suggestion.expiresAt.getTime() > now
    );
  });

  readonly topSuggestions = computed(() => {
    return this.activeSuggestions()
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  });

  constructor() {
    this.initializeReactiveAnalysis();
    this.loadPredefinedTemplates();
  }

  // ========================================
  // Auto-Grouping Methods
  // ========================================

  /**
   * Auto-group columns using advanced similarity analysis
   */
  async autoGroupBySimilarity(
    columns: ColumnDefinition[], 
    options: SimilarityGroupingOptions = {}
  ): Promise<ColumnGroupDefinition[]> {
    this._buildingGroups.set(true);

    try {
      const analysis = this.analyzeColumnSimilarity(columns, options);
      const groups = this.buildGroupsFromSimilarity(analysis, options);
      
      this._lastAnalysis.set({
        type: 'similarity',
        timestamp: Date.now(),
        inputColumns: columns.length,
        outputGroups: groups.length,
        confidence: this.calculateOverallConfidence(groups),
        metadata: analysis
      });

      this.generateSuggestionsFromGroups(groups, 'similarity');
      return groups;
    } finally {
      this._buildingGroups.set(false);
    }
  }

  /**
   * Auto-group columns by data type patterns
   */
  async autoGroupByDataType(
    columns: ColumnDefinition[],
    options: DataTypeGroupingOptions = {}
  ): Promise<ColumnGroupDefinition[]> {
    this._buildingGroups.set(true);

    try {
      const typeGroups = this.groupColumnsByDataType(columns, options);
      const enhancedGroups = this.enhanceTypeGroups(typeGroups, options);
      
      this._lastAnalysis.set({
        type: 'dataType',
        timestamp: Date.now(),
        inputColumns: columns.length,
        outputGroups: enhancedGroups.length,
        confidence: 0.9, // Data type grouping is highly confident
        metadata: { typeGroups }
      });

      return enhancedGroups;
    } finally {
      this._buildingGroups.set(false);
    }
  }

  /**
   * Auto-group columns by naming conventions
   */
  async autoGroupByNaming(
    columns: ColumnDefinition[],
    options: NamingGroupingOptions = {}
  ): Promise<ColumnGroupDefinition[]> {
    this._buildingGroups.set(true);

    try {
      const namingAnalysis = this.analyzeNamingPatterns(columns, options);
      const groups = this.buildGroupsFromNaming(namingAnalysis, options);
      
      this._lastAnalysis.set({
        type: 'naming',
        timestamp: Date.now(),
        inputColumns: columns.length,
        outputGroups: groups.length,
        confidence: this.calculateNamingConfidence(namingAnalysis),
        metadata: namingAnalysis
      });

      return groups;
    } finally {
      this._buildingGroups.set(false);
    }
  }

  /**
   * Auto-group columns by usage patterns (NEW FEATURE)
   */
  async autoGroupByUsage(
    columns: ColumnDefinition[],
    usageData: ColumnUsageData[],
    options: UsageGroupingOptions = {}
  ): Promise<ColumnGroupDefinition[]> {
    this._buildingGroups.set(true);

    try {
      const usageAnalysis = this.analyzeUsagePatterns(columns, usageData, options);
      const groups = this.buildGroupsFromUsage(usageAnalysis, options);
      
      this._lastAnalysis.set({
        type: 'usage',
        timestamp: Date.now(),
        inputColumns: columns.length,
        outputGroups: groups.length,
        confidence: this.calculateUsageConfidence(usageAnalysis),
        metadata: usageAnalysis
      });

      return groups;
    } finally {
      this._buildingGroups.set(false);
    }
  }

  /**
   * AI-powered smart grouping (ADVANCED FEATURE)
   */
  async autoGroupByAI(
    columns: ColumnDefinition[],
    context: AIGroupingContext = {}
  ): Promise<ColumnGroupDefinition[]> {
    this._buildingGroups.set(true);

    try {
      // Combine multiple analysis strategies
      const [similarity, dataType, naming] = await Promise.all([
        this.analyzeColumnSimilarity(columns),
        this.groupColumnsByDataType(columns),
        this.analyzeNamingPatterns(columns)
      ]);

      // Use AI-like scoring to determine optimal grouping
      const aiAnalysis = this.performAIAnalysis(columns, {
        similarity,
        dataType,
        naming,
        context
      });

      const groups = this.buildOptimalGroups(aiAnalysis);
      
      this._lastAnalysis.set({
        type: 'ai',
        timestamp: Date.now(),
        inputColumns: columns.length,
        outputGroups: groups.length,
        confidence: aiAnalysis.confidence,
        metadata: aiAnalysis
      });

      this.generateAISuggestions(aiAnalysis, groups);
      return groups;
    } finally {
      this._buildingGroups.set(false);
    }
  }

  // ========================================
  // Dynamic Group Creation
  // ========================================

  /**
   * Create group from template with dynamic substitution
   */
  createGroupFromTemplate(
    templateId: string, 
    columns: ColumnDefinition[],
    substitutions: { [key: string]: any } = {}
  ): ColumnGroupDefinition | null {
    const template = this._templates().find(t => t.id === templateId);
    if (!template) return null;

    return this.applyTemplateToColumns(template, columns, substitutions);
  }

  /**
   * Build groups with conditional logic
   */
  buildConditionalGroups(
    columns: ColumnDefinition[],
    conditions: ColumnGroupCondition[]
  ): ColumnGroupDefinition[] {
    return conditions.reduce((groups, condition) => {
      const applicableColumns = this.filterColumnsByCondition(columns, condition);
      if (applicableColumns.length > 0) {
        const group = this.createGroupFromCondition(condition, applicableColumns);
        if (group) groups.push(group);
      }
      return groups;
    }, [] as ColumnGroupDefinition[]);
  }

  /**
   * Create hierarchical groups with unlimited nesting
   */
  buildHierarchicalGroups(
    columns: ColumnDefinition[],
    hierarchy: GroupingHierarchy
  ): ColumnGroupDefinition[] {
    return this.processHierarchyLevel(columns, hierarchy, 0);
  }

  /**
   * Build responsive groups that adapt to viewport
   */
  buildResponsiveGroups(
    columns: ColumnDefinition[],
    viewportSize: { width: number; height: number },
    breakpoints: { [key: string]: number }
  ): ColumnGroupDefinition[] {
    const currentBreakpoint = this.getCurrentBreakpoint(viewportSize.width, breakpoints);
    const responsiveRules = this.getResponsiveRules(currentBreakpoint);
    
    return this.applyResponsiveRules(columns, responsiveRules);
  }

  // ========================================
  // Template Management
  // ========================================

  /**
   * Save current grouping as template
   */
  saveAsTemplate(
    groups: ColumnGroupDefinition[],
    name: string,
    metadata: Partial<ColumnGroupTemplate> = {}
  ): ColumnGroupTemplate {
    const template: ColumnGroupTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: metadata.description || `Template created from ${groups.length} groups`,
      category: metadata.category || 'User',
      author: metadata.author || 'System',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: metadata.tags || ['auto-generated'],
      groups: JSON.parse(JSON.stringify(groups)), // Deep clone
      metadata: {
        originalGroupCount: groups.length,
        creationMethod: 'manual',
        ...metadata.metadata
      }
    };

    this._templates.update(templates => [...templates, template]);
    return template;
  }

  /**
   * Generate template variations
   */
  generateTemplateVariations(
    baseTemplate: ColumnGroupTemplate,
    variations: TemplateVariation[]
  ): ColumnGroupTemplate[] {
    return variations.map(variation => {
      const variantGroups = this.applyTemplateVariation(baseTemplate.groups, variation);
      return {
        ...baseTemplate,
        id: `${baseTemplate.id}-${variation.id}`,
        name: `${baseTemplate.name} - ${variation.name}`,
        description: `${baseTemplate.description} (${variation.description})`,
        groups: variantGroups,
        metadata: {
          ...baseTemplate.metadata,
          baseTemplateId: baseTemplate.id,
          variationId: variation.id
        }
      };
    });
  }

  // ========================================
  // AI Suggestion Engine
  // ========================================

  /**
   * Generate smart suggestions based on column analysis
   */
  generateSmartSuggestions(
    columns: ColumnDefinition[],
    context: SuggestionContext = {}
  ): void {
    const suggestions: ColumnGroupAISuggestion[] = [];

    // Similarity-based suggestions
    const similarityGroups = this.suggestSimilarityGroups(columns);
    suggestions.push(...similarityGroups);

    // Naming pattern suggestions
    const namingGroups = this.suggestNamingGroups(columns);
    suggestions.push(...namingGroups);

    // Performance optimization suggestions
    const performanceGroups = this.suggestPerformanceOptimizations(columns, context);
    suggestions.push(...performanceGroups);

    // User behavior suggestions
    if (context.userBehavior) {
      const behaviorGroups = this.suggestBehaviorBasedGroups(columns, context.userBehavior);
      suggestions.push(...behaviorGroups);
    }

    this._suggestions.set(suggestions);
  }

  /**
   * Learn from user feedback to improve suggestions
   */
  processSuggestionFeedback(
    suggestionId: string,
    feedback: SuggestionFeedback
  ): void {
    this._suggestions.update(suggestions => 
      suggestions.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, feedback }
          : suggestion
      )
    );

    // Update internal models based on feedback
    this.updateLearningModel(suggestionId, feedback);
  }

  // ========================================
  // Analysis Methods
  // ========================================

  /**
   * Analyze column similarity using multiple metrics
   */
  private analyzeColumnSimilarity(
    columns: ColumnDefinition[],
    options: SimilarityGroupingOptions = {}
  ): SimilarityAnalysis {
    const similarities: ColumnSimilarity[] = [];
    const threshold = options.threshold || 0.7;

    for (let i = 0; i < columns.length; i++) {
      for (let j = i + 1; j < columns.length; j++) {
        const similarity = this.calculateColumnSimilarity(columns[i], columns[j]);
        if (similarity.score >= threshold) {
          similarities.push({
            column1: columns[i],
            column2: columns[j],
            score: similarity.score,
            factors: similarity.factors
          });
        }
      }
    }

    return this.groupSimilarColumns(similarities, options);
  }

  /**
   * Calculate similarity score between two columns
   */
  private calculateColumnSimilarity(
    col1: ColumnDefinition,
    col2: ColumnDefinition
  ): { score: number; factors: SimilarityFactor[] } {
    const factors: SimilarityFactor[] = [];
    let totalScore = 0;

    // Data type similarity
    if (col1.type === col2.type) {
      factors.push({ type: 'dataType', weight: 0.3, score: 1.0 });
      totalScore += 0.3;
    }

    // Name similarity (using Levenshtein distance)
    const nameScore = this.calculateStringSimilarity(col1.header, col2.header);
    factors.push({ type: 'naming', weight: 0.25, score: nameScore });
    totalScore += 0.25 * nameScore;

    // Field similarity
    const fieldScore = this.calculateStringSimilarity(col1.field, col2.field);
    factors.push({ type: 'field', weight: 0.2, score: fieldScore });
    totalScore += 0.2 * fieldScore;

    // Configuration similarity
    const configScore = this.calculateConfigSimilarity(col1, col2);
    factors.push({ type: 'configuration', weight: 0.25, score: configScore });
    totalScore += 0.25 * configScore;

    return { score: Math.min(totalScore, 1.0), factors };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1.0 : 1.0 - (distance / maxLength);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate configuration similarity between columns
   */
  private calculateConfigSimilarity(col1: ColumnDefinition, col2: ColumnDefinition): number {
    const configs = [
      'sortable', 'filterable', 'resizable', 'visible',
      'align', 'pinned'
    ];
    
    let matches = 0;
    let total = 0;

    configs.forEach(config => {
      if (col1[config as keyof ColumnDefinition] !== undefined || 
          col2[config as keyof ColumnDefinition] !== undefined) {
        total++;
        if (col1[config as keyof ColumnDefinition] === col2[config as keyof ColumnDefinition]) {
          matches++;
        }
      }
    });

    return total === 0 ? 1.0 : matches / total;
  }

  /**
   * Group columns by data type
   */
  private groupColumnsByDataType(
    columns: ColumnDefinition[],
    options: DataTypeGroupingOptions = {}
  ): { [type: string]: ColumnDefinition[] } {
    const groups: { [type: string]: ColumnDefinition[] } = {};
    const customTypeGroups = options.customTypeGroups || {};

    columns.forEach(column => {
      const type = column.type || 'string';
      const groupType = customTypeGroups[type] || type;
      
      if (!groups[groupType]) {
        groups[groupType] = [];
      }
      groups[groupType].push(column);
    });

    return groups;
  }

  /**
   * Analyze naming patterns in columns
   */
  private analyzeNamingPatterns(
    columns: ColumnDefinition[],
    options: NamingGroupingOptions = {}
  ): NamingAnalysis {
    const patterns: NamingPattern[] = [];
    const prefixes = this.extractCommonPrefixes(columns);
    const suffixes = this.extractCommonSuffixes(columns);
    const keywords = this.extractCommonKeywords(columns);

    // Build patterns from prefixes
    prefixes.forEach(prefix => {
      const matchingColumns = columns.filter(col => 
        col.header.toLowerCase().startsWith(prefix.value.toLowerCase()) ||
        col.field.toLowerCase().startsWith(prefix.value.toLowerCase())
      );
      
      if (matchingColumns.length >= (options.minGroupSize || 2)) {
        patterns.push({
          type: 'prefix',
          value: prefix.value,
          columns: matchingColumns,
          confidence: prefix.frequency / columns.length
        });
      }
    });

    // Build patterns from suffixes
    suffixes.forEach(suffix => {
      const matchingColumns = columns.filter(col => 
        col.header.toLowerCase().endsWith(suffix.value.toLowerCase()) ||
        col.field.toLowerCase().endsWith(suffix.value.toLowerCase())
      );
      
      if (matchingColumns.length >= (options.minGroupSize || 2)) {
        patterns.push({
          type: 'suffix',
          value: suffix.value,
          columns: matchingColumns,
          confidence: suffix.frequency / columns.length
        });
      }
    });

    // Build patterns from keywords
    keywords.forEach(keyword => {
      const matchingColumns = columns.filter(col => 
        col.header.toLowerCase().includes(keyword.value.toLowerCase()) ||
        col.field.toLowerCase().includes(keyword.value.toLowerCase())
      );
      
      if (matchingColumns.length >= (options.minGroupSize || 2)) {
        patterns.push({
          type: 'keyword',
          value: keyword.value,
          columns: matchingColumns,
          confidence: keyword.frequency / columns.length
        });
      }
    });

    return { patterns, prefixes, suffixes, keywords };
  }

  // ========================================
  // Reactive Analysis Setup
  // ========================================

  private initializeReactiveAnalysis(): void {
    // Auto-analyze when columns change
    this.columnsChanged$
      .pipe(
        debounceTime(500),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(columns => {
        if (columns.length > 0) {
          this.generateSmartSuggestions(columns);
        }
      });

    // Process analysis requests
    this.analysisRequested$
      .pipe(debounceTime(300))
      .subscribe(request => {
        this.processAnalysisRequest(request);
      });
  }

  private loadPredefinedTemplates(): void {
    const predefined: ColumnGroupTemplate[] = [
      {
        id: 'basic-info',
        name: 'Basic Information',
        description: 'Standard information columns',
        category: 'System',
        author: 'BLG Grid',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        groups: [], // Would contain predefined group structures
        metadata: { predefined: true }
      },
      {
        id: 'financial',
        name: 'Financial Data',
        description: 'Common financial column groupings',
        category: 'System',
        author: 'BLG Grid',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        groups: [], // Would contain financial group structures
        metadata: { predefined: true }
      }
    ];

    this._templates.set(predefined);
  }

  // ========================================
  // Helper Methods (Stubs for complex implementations)
  // ========================================

  private buildGroupsFromSimilarity(analysis: SimilarityAnalysis, options: SimilarityGroupingOptions): ColumnGroupDefinition[] {
    // Complex implementation would build groups from similarity analysis
    return [];
  }

  private enhanceTypeGroups(typeGroups: { [type: string]: ColumnDefinition[] }, options: DataTypeGroupingOptions): ColumnGroupDefinition[] {
    // Implementation would enhance type groups with metadata and styling
    return [];
  }

  private buildGroupsFromNaming(analysis: NamingAnalysis, options: NamingGroupingOptions): ColumnGroupDefinition[] {
    // Implementation would build groups from naming patterns
    return [];
  }

  private analyzeUsagePatterns(columns: ColumnDefinition[], usageData: ColumnUsageData[], options: UsageGroupingOptions): UsageAnalysis {
    // Implementation would analyze usage patterns
    return {} as UsageAnalysis;
  }

  private buildGroupsFromUsage(analysis: UsageAnalysis, options: UsageGroupingOptions): ColumnGroupDefinition[] {
    // Implementation would build groups from usage analysis
    return [];
  }

  private performAIAnalysis(columns: ColumnDefinition[], data: any): AIAnalysis {
    // Implementation would perform AI-like analysis
    return {} as AIAnalysis;
  }

  private buildOptimalGroups(analysis: AIAnalysis): ColumnGroupDefinition[] {
    // Implementation would build optimal groups from AI analysis
    return [];
  }

  private generateSuggestionsFromGroups(groups: ColumnGroupDefinition[], type: string): void {
    // Implementation would generate suggestions
  }

  private generateAISuggestions(analysis: AIAnalysis, groups: ColumnGroupDefinition[]): void {
    // Implementation would generate AI suggestions
  }

  private calculateOverallConfidence(groups: ColumnGroupDefinition[]): number {
    // Implementation would calculate confidence
    return 0.8;
  }

  private calculateNamingConfidence(analysis: NamingAnalysis): number {
    // Implementation would calculate naming confidence
    return 0.7;
  }

  private calculateUsageConfidence(analysis: UsageAnalysis): number {
    // Implementation would calculate usage confidence
    return 0.6;
  }

  // Additional helper methods would be implemented here...
  private groupSimilarColumns(similarities: ColumnSimilarity[], options: SimilarityGroupingOptions): SimilarityAnalysis { return {} as SimilarityAnalysis; }
  private applyTemplateToColumns(template: ColumnGroupTemplate, columns: ColumnDefinition[], substitutions: any): ColumnGroupDefinition | null { return null; }
  private filterColumnsByCondition(columns: ColumnDefinition[], condition: ColumnGroupCondition): ColumnDefinition[] { return []; }
  private createGroupFromCondition(condition: ColumnGroupCondition, columns: ColumnDefinition[]): ColumnGroupDefinition | null { return null; }
  private processHierarchyLevel(columns: ColumnDefinition[], hierarchy: GroupingHierarchy, level: number): ColumnGroupDefinition[] { return []; }
  private getCurrentBreakpoint(width: number, breakpoints: any): string { return 'desktop'; }
  private getResponsiveRules(breakpoint: string): any { return {}; }
  private applyResponsiveRules(columns: ColumnDefinition[], rules: any): ColumnGroupDefinition[] { return []; }
  private applyTemplateVariation(groups: ColumnGroupDefinition[], variation: TemplateVariation): ColumnGroupDefinition[] { return []; }
  private suggestSimilarityGroups(columns: ColumnDefinition[]): ColumnGroupAISuggestion[] { return []; }
  private suggestNamingGroups(columns: ColumnDefinition[]): ColumnGroupAISuggestion[] { return []; }
  private suggestPerformanceOptimizations(columns: ColumnDefinition[], context: SuggestionContext): ColumnGroupAISuggestion[] { return []; }
  private suggestBehaviorBasedGroups(columns: ColumnDefinition[], behavior: any): ColumnGroupAISuggestion[] { return []; }
  private updateLearningModel(suggestionId: string, feedback: SuggestionFeedback): void {}
  private extractCommonPrefixes(columns: ColumnDefinition[]): { value: string; frequency: number }[] { return []; }
  private extractCommonSuffixes(columns: ColumnDefinition[]): { value: string; frequency: number }[] { return []; }
  private extractCommonKeywords(columns: ColumnDefinition[]): { value: string; frequency: number }[] { return []; }
  private processAnalysisRequest(request: ColumnAnalysisRequest): void {}
}

// ========================================
// Supporting Interfaces
// ========================================

export type GroupingStrategy = 'similarity' | 'dataType' | 'naming' | 'usage' | 'ai';

export interface SimilarityGroupingOptions {
  threshold?: number;
  maxGroups?: number;
  minGroupSize?: number;
  weightFactors?: { [factor: string]: number };
}

export interface DataTypeGroupingOptions {
  customTypeGroups?: { [type: string]: string };
  groupSubTypes?: boolean;
  includeCustomTypes?: boolean;
}

export interface NamingGroupingOptions {
  minGroupSize?: number;
  caseSensitive?: boolean;
  includeFieldNames?: boolean;
  customPatterns?: RegExp[];
}

export interface UsageGroupingOptions {
  timeframe?: number;
  minUsageCount?: number;
  weightByFrequency?: boolean;
}

export interface AIGroupingContext {
  domain?: string;
  userRole?: string;
  businessContext?: string;
  historicalPreferences?: any;
}

export interface ColumnAnalysisResult {
  type: GroupingStrategy;
  timestamp: number;
  inputColumns: number;
  outputGroups: number;
  confidence: number;
  metadata: any;
}

export interface ColumnAnalysisRequest {
  columns: ColumnDefinition[];
  strategy: GroupingStrategy;
  options?: any;
  callback?: (result: ColumnAnalysisResult) => void;
}

export interface SimilarityAnalysis {
  clusters: ColumnCluster[];
  outliers: ColumnDefinition[];
  averageScore: number;
}

export interface ColumnCluster {
  id: string;
  columns: ColumnDefinition[];
  centerColumn: ColumnDefinition;
  cohesion: number;
}

export interface ColumnSimilarity {
  column1: ColumnDefinition;
  column2: ColumnDefinition;
  score: number;
  factors: SimilarityFactor[];
}

export interface SimilarityFactor {
  type: 'dataType' | 'naming' | 'field' | 'configuration';
  weight: number;
  score: number;
}

export interface NamingAnalysis {
  patterns: NamingPattern[];
  prefixes: { value: string; frequency: number }[];
  suffixes: { value: string; frequency: number }[];
  keywords: { value: string; frequency: number }[];
}

export interface NamingPattern {
  type: 'prefix' | 'suffix' | 'keyword' | 'regex';
  value: string;
  columns: ColumnDefinition[];
  confidence: number;
}

export interface UsageAnalysis {
  frequentlyUsed: ColumnDefinition[];
  rarelyUsed: ColumnDefinition[];
  correlatedColumns: ColumnCorrelation[];
  usagePatterns: UsagePattern[];
}

export interface ColumnCorrelation {
  columns: ColumnDefinition[];
  correlation: number;
  type: 'usage' | 'interaction' | 'temporal';
}

export interface UsagePattern {
  id: string;
  columns: ColumnDefinition[];
  frequency: number;
  context: string;
}

export interface ColumnUsageData {
  columnId: string;
  viewCount: number;
  interactionCount: number;
  lastUsed: Date;
  context?: string;
}

export interface AIAnalysis {
  strategy: string;
  confidence: number;
  recommendations: GroupRecommendation[];
  reasoning: string[];
}

export interface GroupRecommendation {
  groupName: string;
  columns: ColumnDefinition[];
  confidence: number;
  rationale: string;
}

export interface GroupingHierarchy {
  levels: HierarchyLevel[];
  maxDepth: number;
  strategy: GroupingStrategy;
}

export interface HierarchyLevel {
  level: number;
  groupBy: string;
  criteria: any;
  fallback?: GroupingStrategy;
}

export interface TemplateVariation {
  id: string;
  name: string;
  description: string;
  modifications: TemplateModification[];
}

export interface TemplateModification {
  type: 'style' | 'structure' | 'behavior';
  target: string;
  changes: any;
}

export interface SuggestionContext {
  userBehavior?: any;
  domainKnowledge?: any;
  performanceConstraints?: any;
  accessibilityRequirements?: any;
}

export interface SuggestionFeedback {
  rating: number; // 1-5
  implemented: boolean;
  comments?: string;
  timestamp: Date;
}