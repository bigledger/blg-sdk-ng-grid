import { InjectionToken } from '@angular/core';
import { Filter, FilterType } from '../../../../../../core/src/lib/interfaces/enhanced-filter.interface';

/**
 * Advanced Multi-Filter System Interfaces
 * 
 * Provides the most powerful and intuitive multi-filter system ever created,
 * surpassing ag-grid's capabilities with innovative features like:
 * - Unlimited nested conditions
 * - Advanced logical operators (XOR, NAND, NOR)
 * - Natural language processing
 * - Visual query builder
 * - AI-powered suggestions
 * - Performance optimization engine
 */

// ============================================
// Advanced Logical Operators
// ============================================

/**
 * Extended logical operators beyond basic AND/OR
 * These are the innovative operators that surpass ag-grid
 */
export type LogicalOperator = 
  | 'AND'           // Standard conjunction
  | 'OR'            // Standard disjunction
  | 'NOT'           // Negation
  | 'XOR'           // Exclusive OR (NEW)
  | 'NAND'          // Not AND (NEW)  
  | 'NOR'           // Not OR (NEW)
  | 'IF_THEN'       // Conditional logic (NEW)
  | 'IF_THEN_ELSE'  // Full conditional (NEW)
  | 'IMPLIES'       // Material implication (NEW)
  | 'BICONDITIONAL' // If and only if (NEW)
  | 'CUSTOM';       // User-defined logic (NEW)

/**
 * Operator precedence for proper evaluation order
 */
export interface OperatorPrecedence {
  [key in LogicalOperator]: number;
}

export const DEFAULT_OPERATOR_PRECEDENCE: OperatorPrecedence = {
  'NOT': 1,
  'AND': 2,
  'NAND': 2,
  'OR': 3,
  'NOR': 3,
  'XOR': 3,
  'IF_THEN': 4,
  'IF_THEN_ELSE': 4,
  'IMPLIES': 4,
  'BICONDITIONAL': 4,
  'CUSTOM': 5
};

// ============================================
// Filter Condition Node System
// ============================================

/**
 * Base interface for all filter nodes
 */
export interface FilterNode {
  id: string;
  type: 'condition' | 'group' | 'formula' | 'natural';
  parentId?: string;
  position: { x: number; y: number };
  metadata?: {
    collapsed?: boolean;
    color?: string;
    label?: string;
    description?: string;
    complexity?: number;
    performance?: PerformanceMetrics;
  };
}

/**
 * Individual filter condition node
 */
export interface FilterConditionNode extends FilterNode {
  type: 'condition';
  columnId: string;
  filter: Filter;
  enabled: boolean;
  weight?: number; // For weighted filtering (NEW)
}

/**
 * Group of conditions with logical operator
 */
export interface FilterGroupNode extends FilterNode {
  type: 'group';
  operator: LogicalOperator;
  children: FilterNode[];
  negated?: boolean; // Apply NOT to entire group
  customLogic?: string; // For CUSTOM operator
}

/**
 * Formula-based filter node (NEW - Excel-like formulas)
 */
export interface FilterFormulaNode extends FilterNode {
  type: 'formula';
  formula: string; // e.g., "Age > 18 AND (Status = 'Active' OR Priority = 'High')"
  compiled?: CompiledFormula;
  variables?: { [key: string]: any };
}

/**
 * Natural language filter node (NEW - AI-powered)
 */
export interface FilterNaturalNode extends FilterNode {
  type: 'natural';
  query: string; // e.g., "Show me all customers from last month with high priority"
  parsed?: ParsedNaturalQuery;
  confidence?: number; // AI confidence score 0-1
  suggestions?: string[]; // Alternative interpretations
}

// ============================================
// Multi-Filter Model
// ============================================

/**
 * Complete multi-filter configuration for a column
 */
export interface MultiFilterModel {
  columnId: string;
  rootNode: FilterGroupNode;
  version: number;
  createdAt: Date;
  modifiedAt: Date;
  metadata?: {
    name?: string;
    description?: string;
    complexity: FilterComplexity;
    performance: PerformanceMetrics;
    tags?: string[];
  };
}

/**
 * Filter complexity analysis
 */
export interface FilterComplexity {
  nodeCount: number;
  maxDepth: number;
  operatorDiversity: number;
  estimatedPerformance: 'excellent' | 'good' | 'fair' | 'poor';
  optimizationSuggestions?: string[];
}

/**
 * Performance metrics for filter evaluation
 */
export interface PerformanceMetrics {
  evaluationTimeMs: number;
  memoryUsageMB: number;
  cacheHitRate: number;
  indexUtilization: number;
  optimizationLevel: number; // 0-10
}

// ============================================
// Query Compilation and Optimization
// ============================================

/**
 * Compiled filter for optimal performance
 */
export interface CompiledFilter {
  id: string;
  originalModel: MultiFilterModel;
  compiledFunction: (row: any, context?: any) => boolean;
  sqlQuery?: string;
  mongoQuery?: any;
  optimizationLevel: number;
  compiledAt: Date;
  metadata: {
    complexity: FilterComplexity;
    estimatedPerformance: PerformanceMetrics;
    optimizations: string[];
  };
}

/**
 * Formula compilation result
 */
export interface CompiledFormula {
  originalFormula: string;
  parsedAst: FormulaAstNode;
  compiledFunction: (row: any, variables?: any) => boolean;
  dependencies: string[]; // Column references
  errors?: FormulaError[];
}

/**
 * Formula AST node for advanced parsing
 */
export interface FormulaAstNode {
  type: 'operator' | 'operand' | 'function' | 'reference';
  value: any;
  children?: FormulaAstNode[];
  metadata?: {
    line: number;
    column: number;
    length: number;
  };
}

/**
 * Formula parsing error
 */
export interface FormulaError {
  type: 'syntax' | 'reference' | 'type' | 'logic';
  message: string;
  line: number;
  column: number;
  length: number;
  suggestions?: string[];
}

// ============================================
// Natural Language Processing
// ============================================

/**
 * Parsed natural language query
 */
export interface ParsedNaturalQuery {
  originalQuery: string;
  intent: QueryIntent;
  entities: QueryEntity[];
  conditions: ParsedCondition[];
  timeRange?: TimeRange;
  sortBy?: SortInstruction[];
  groupBy?: string[];
  confidence: number;
  alternatives?: ParsedNaturalQuery[];
}

/**
 * Query intent classification
 */
export type QueryIntent = 
  | 'filter'
  | 'search'
  | 'aggregate'
  | 'compare'
  | 'trend'
  | 'outlier'
  | 'pattern'
  | 'anomaly';

/**
 * Named entities in query
 */
export interface QueryEntity {
  text: string;
  type: 'column' | 'value' | 'operator' | 'function' | 'time' | 'location';
  confidence: number;
  alternatives?: string[];
  mappedTo?: string; // Actual column/value mapping
}

/**
 * Parsed condition from natural language
 */
export interface ParsedCondition {
  columnId: string;
  operator: string;
  value: any;
  confidence: number;
  alternatives?: ParsedCondition[];
}

/**
 * Time range specification
 */
export interface TimeRange {
  type: 'absolute' | 'relative';
  start?: Date;
  end?: Date;
  relativePeriod?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
    direction: 'last' | 'next' | 'current';
  };
}

/**
 * Sort instruction from natural language
 */
export interface SortInstruction {
  columnId: string;
  direction: 'asc' | 'desc';
  confidence: number;
}

// ============================================
// AI-Powered Features
// ============================================

/**
 * AI suggestions for filter optimization
 */
export interface AIFilterSuggestion {
  type: 'optimization' | 'simplification' | 'enhancement' | 'correction';
  title: string;
  description: string;
  confidence: number;
  impact: {
    performance: number; // -10 to +10
    accuracy: number;    // -10 to +10
    complexity: number;  // -10 to +10
  };
  action?: {
    type: 'replace' | 'merge' | 'split' | 'reorder' | 'remove';
    target: string; // Node ID
    payload: any;
  };
}

/**
 * Filter learning data for AI improvements
 */
export interface FilterLearningData {
  userId: string;
  sessionId: string;
  timestamp: Date;
  action: 'created' | 'modified' | 'applied' | 'removed' | 'optimized';
  filterModel: MultiFilterModel;
  context: {
    dataSize: number;
    columns: string[];
    userRole?: string;
    domain?: string;
  };
  outcome: {
    performance: PerformanceMetrics;
    userSatisfaction?: number; // 1-5 rating
    resultCount: number;
    timeToResult: number;
  };
}

// ============================================
// Collaboration Features
// ============================================

/**
 * Collaborative filter sharing
 */
export interface SharedFilter {
  id: string;
  name: string;
  description?: string;
  filterModel: MultiFilterModel;
  creator: FilterUser;
  collaborators: FilterCollaborator[];
  permissions: FilterPermissions;
  versions: FilterVersion[];
  comments: FilterComment[];
  analytics: FilterAnalytics;
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * Filter user information
 */
export interface FilterUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

/**
 * Filter collaborator with permissions
 */
export interface FilterCollaborator extends FilterUser {
  permissions: ('view' | 'edit' | 'share' | 'delete')[];
  addedAt: Date;
  lastActive?: Date;
}

/**
 * Filter permissions model
 */
export interface FilterPermissions {
  public: boolean;
  allowCopy: boolean;
  allowModification: boolean;
  allowSharing: boolean;
  restrictedDomains?: string[];
  expiresAt?: Date;
}

/**
 * Filter version history
 */
export interface FilterVersion {
  version: number;
  filterModel: MultiFilterModel;
  author: FilterUser;
  message?: string;
  createdAt: Date;
  changes: FilterChange[];
}

/**
 * Individual filter change
 */
export interface FilterChange {
  type: 'added' | 'removed' | 'modified' | 'moved';
  nodeId: string;
  before?: any;
  after?: any;
  author: FilterUser;
  timestamp: Date;
}

/**
 * Filter comment system
 */
export interface FilterComment {
  id: string;
  nodeId?: string; // Optional: comment on specific node
  author: FilterUser;
  message: string;
  createdAt: Date;
  replies?: FilterComment[];
  resolved?: boolean;
}

/**
 * Filter usage analytics
 */
export interface FilterAnalytics {
  totalUsage: number;
  uniqueUsers: number;
  averagePerformance: PerformanceMetrics;
  popularityScore: number;
  errorRate: number;
  lastUsed: Date;
  usage30Days: number[];
  performanceTrend: PerformanceMetrics[];
}

// ============================================
// Export/Import System
// ============================================

/**
 * Filter export formats
 */
export type FilterExportFormat = 
  | 'json'
  | 'sql'
  | 'mongodb'
  | 'elasticsearch'
  | 'graphql'
  | 'odata'
  | 'sparql'
  | 'yaml'
  | 'xml'
  | 'csv'
  | 'excel'
  | 'url'
  | 'qr';

/**
 * Export configuration
 */
export interface FilterExportConfig {
  format: FilterExportFormat;
  includeMetadata?: boolean;
  includeComments?: boolean;
  includeVersions?: boolean;
  compression?: 'none' | 'gzip' | 'brotli';
  encryption?: {
    enabled: boolean;
    algorithm?: string;
    keyId?: string;
  };
}

/**
 * Import result with validation
 */
export interface FilterImportResult {
  success: boolean;
  filterModel?: MultiFilterModel;
  errors?: ImportError[];
  warnings?: ImportWarning[];
  metadata: {
    originalFormat: FilterExportFormat;
    compatibility: number; // 0-1
    featuresSupported: string[];
    featuresLost: string[];
  };
}

/**
 * Import error details
 */
export interface ImportError {
  code: string;
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  suggestions?: string[];
}

/**
 * Import warning details
 */
export interface ImportWarning {
  code: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  recommendation?: string;
}

// ============================================
// Real-time Features
// ============================================

/**
 * Real-time filter synchronization
 */
export interface FilterSyncState {
  filterId: string;
  version: number;
  lastSync: Date;
  conflicted: boolean;
  pendingChanges: FilterChange[];
  connectionStatus: 'connected' | 'disconnected' | 'syncing' | 'error';
}

/**
 * Real-time collaboration event
 */
export interface FilterCollaborationEvent {
  type: 'user_joined' | 'user_left' | 'filter_changed' | 'cursor_moved' | 'comment_added';
  userId: string;
  filterId: string;
  timestamp: Date;
  payload?: any;
}

/**
 * User cursor position for collaborative editing
 */
export interface FilterCursor {
  userId: string;
  nodeId?: string;
  position: { x: number; y: number };
  color: string;
  timestamp: Date;
}

// ============================================
// Testing and Quality Assurance
// ============================================

/**
 * Filter test case
 */
export interface FilterTestCase {
  id: string;
  name: string;
  description?: string;
  filterModel: MultiFilterModel;
  testData: any[];
  expectedResults: FilterTestResult[];
  performance: {
    maxExecutionTime: number;
    maxMemoryUsage: number;
    minAccuracy: number;
  };
}

/**
 * Filter test result
 */
export interface FilterTestResult {
  testCaseId: string;
  passed: boolean;
  executionTime: number;
  memoryUsage: number;
  accuracy: number;
  resultCount: number;
  errors?: string[];
  warnings?: string[];
  performanceMetrics: PerformanceMetrics;
}

/**
 * Filter quality metrics
 */
export interface FilterQualityMetrics {
  correctness: number;    // 0-1
  performance: number;    // 0-1  
  maintainability: number;// 0-1
  usability: number;      // 0-1
  accessibility: number;  // 0-1
  overall: number;        // 0-1
}

// ============================================
// Service Interfaces
// ============================================

/**
 * Advanced multi-filter service interface
 */
export interface IMultiFilterService {
  // Core filtering
  applyFilter(columnId: string, filterModel: MultiFilterModel): Promise<any[]>;
  compileFilter(filterModel: MultiFilterModel): Promise<CompiledFilter>;
  optimizeFilter(filterModel: MultiFilterModel): Promise<MultiFilterModel>;
  
  // Natural language processing
  parseNaturalQuery(query: string): Promise<ParsedNaturalQuery>;
  executeNaturalQuery(query: string): Promise<any[]>;
  
  // AI features
  getSuggestions(filterModel: MultiFilterModel): Promise<AIFilterSuggestion[]>;
  learnFromUsage(learningData: FilterLearningData): Promise<void>;
  
  // Collaboration
  shareFilter(filterModel: MultiFilterModel, config: FilterPermissions): Promise<SharedFilter>;
  collaborateOnFilter(filterId: string): Promise<FilterSyncState>;
  
  // Export/Import
  exportFilter(filterModel: MultiFilterModel, config: FilterExportConfig): Promise<string>;
  importFilter(data: string, format: FilterExportFormat): Promise<FilterImportResult>;
  
  // Testing
  runTests(filterModel: MultiFilterModel, testCases: FilterTestCase[]): Promise<FilterTestResult[]>;
  assessQuality(filterModel: MultiFilterModel): Promise<FilterQualityMetrics>;
  
  // Performance
  profileFilter(filterModel: MultiFilterModel): Promise<PerformanceMetrics>;
  optimizePerformance(filterModel: MultiFilterModel): Promise<MultiFilterModel>;
}

// ============================================
// Component Interfaces
// ============================================

/**
 * Multi-filter component interface
 */
export interface IMultiFilterComponent {
  // Core functionality
  getFilterModel(): MultiFilterModel | null;
  setFilterModel(model: MultiFilterModel | null): void;
  isFilterActive(): boolean;
  
  // Visual builder
  openVisualBuilder(): void;
  closeVisualBuilder(): void;
  
  // Natural language
  setNaturalQuery(query: string): Promise<void>;
  getNaturalQuery(): string;
  
  // Performance
  getPerformanceMetrics(): PerformanceMetrics;
  optimizeFilter(): Promise<void>;
  
  // Events
  onFilterChanged: (model: MultiFilterModel) => void;
  onPerformanceIssue: (metrics: PerformanceMetrics) => void;
  onNaturalQueryParsed: (result: ParsedNaturalQuery) => void;
}

// ============================================
// Configuration
// ============================================

/**
 * Multi-filter configuration
 */
export interface MultiFilterConfig {
  // Core features
  enableVisualBuilder?: boolean;
  enableNaturalLanguage?: boolean;
  enableAISuggestions?: boolean;
  enableCollaboration?: boolean;
  
  // Performance
  enableCaching?: boolean;
  enableOptimization?: boolean;
  enableWebWorkers?: boolean;
  enableParallelExecution?: boolean;
  
  // Limits
  maxFilterDepth?: number;
  maxFilterNodes?: number;
  maxFormulaLength?: number;
  maxNaturalQueryLength?: number;
  
  // UI
  theme?: 'light' | 'dark' | 'auto';
  showPerformanceIndicator?: boolean;
  showComplexityMeter?: boolean;
  enableDragDrop?: boolean;
  enableKeyboardShortcuts?: boolean;
  
  // Export/Import
  supportedExportFormats?: FilterExportFormat[];
  supportedImportFormats?: FilterExportFormat[];
  enableEncryption?: boolean;
  
  // Natural Language
  nlpProvider?: 'openai' | 'azure' | 'google' | 'aws' | 'custom';
  nlpApiKey?: string;
  nlpConfidenceThreshold?: number;
  
  // Collaboration
  realtimeProvider?: 'websocket' | 'sse' | 'polling';
  maxCollaborators?: number;
  enableVersioning?: boolean;
  enableComments?: boolean;
}

// ============================================
// Dependency Injection Tokens
// ============================================

export const MULTI_FILTER_CONFIG = new InjectionToken<MultiFilterConfig>('MultiFilterConfig');
export const MULTI_FILTER_SERVICE = new InjectionToken<IMultiFilterService>('MultiFilterService');

// ============================================
// Event Types
// ============================================

/**
 * Multi-filter events
 */
export interface MultiFilterEvents {
  filterChanged: CustomEvent<{ model: MultiFilterModel; source: string }>;
  filterOptimized: CustomEvent<{ original: MultiFilterModel; optimized: MultiFilterModel }>;
  naturalQueryParsed: CustomEvent<{ query: string; result: ParsedNaturalQuery }>;
  performanceWarning: CustomEvent<{ metrics: PerformanceMetrics; threshold: number }>;
  collaboratorJoined: CustomEvent<{ user: FilterUser; filterId: string }>;
  collaboratorLeft: CustomEvent<{ user: FilterUser; filterId: string }>;
  suggestionReceived: CustomEvent<{ suggestions: AIFilterSuggestion[] }>;
  exportCompleted: CustomEvent<{ format: FilterExportFormat; data: string }>;
  importCompleted: CustomEvent<{ result: FilterImportResult }>;
}

// ============================================
// Error Types
// ============================================

/**
 * Multi-filter specific errors
 */
export class MultiFilterError extends Error {
  constructor(
    message: string,
    public code: string,
    public nodeId?: string,
    public context?: any
  ) {
    super(message);
    this.name = 'MultiFilterError';
  }
}

export class FilterCompilationError extends MultiFilterError {
  constructor(message: string, nodeId?: string, public compilationErrors?: FormulaError[]) {
    super(message, 'COMPILATION_ERROR', nodeId);
    this.name = 'FilterCompilationError';
  }
}

export class NaturalLanguageError extends MultiFilterError {
  constructor(message: string, public query?: string, public confidence?: number) {
    super(message, 'NLP_ERROR');
    this.name = 'NaturalLanguageError';
  }
}

export class FilterPerformanceError extends MultiFilterError {
  constructor(message: string, public metrics?: PerformanceMetrics) {
    super(message, 'PERFORMANCE_ERROR');
    this.name = 'FilterPerformanceError';
  }
}

// ============================================
// Utility Types
// ============================================

/**
 * Deep partial for recursive optional properties
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Recursive readonly for immutable structures
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract node types from FilterNode union
 */
export type ExtractNodeType<T extends FilterNode['type']> = 
  Extract<FilterNode, { type: T }>;

/**
 * Node type mapping
 */
export type NodeTypeMap = {
  condition: FilterConditionNode;
  group: FilterGroupNode;
  formula: FilterFormulaNode;
  natural: FilterNaturalNode;
};