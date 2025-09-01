export interface MigrationOptions {
  projectPath: string;
  dryRun?: boolean;
  createBackup?: boolean;
  interactive?: boolean;
  force?: boolean;
}

export interface AnalysisOptions {
  projectPath: string;
  reportPath?: string;
  jsonOutput?: boolean;
}

export interface AgGridUsage {
  filePath: string;
  imports: AgGridImport[];
  components: AgGridComponent[];
  configurations: AgGridConfig[];
  events: AgGridEvent[];
  apiCalls: AgGridApiCall[];
  cssClasses: string[];
}

export interface AgGridImport {
  line: number;
  column: number;
  module: string;
  imports: string[];
  originalText: string;
}

export interface AgGridComponent {
  line: number;
  column: number;
  selector: string;
  attributes: AgGridAttribute[];
  originalText: string;
}

export interface AgGridAttribute {
  name: string;
  value: string;
  line: number;
  column: number;
}

export interface AgGridConfig {
  line: number;
  column: number;
  property: string;
  value: any;
  type: 'gridOptions' | 'columnDefs' | 'defaultColDef' | 'other';
  originalText: string;
}

export interface AgGridEvent {
  line: number;
  column: number;
  eventName: string;
  handlerName: string;
  originalText: string;
}

export interface AgGridApiCall {
  line: number;
  column: number;
  method: string;
  arguments: string[];
  originalText: string;
}

export interface MigrationResult {
  success: boolean;
  filesProcessed: number;
  filesModified: number;
  errors: MigrationError[];
  warnings: MigrationWarning[];
  backupPath?: string;
  transformations: Transformation[];
}

export interface MigrationError {
  filePath: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface MigrationWarning {
  filePath: string;
  line: number;
  column: number;
  message: string;
  suggestion?: string;
}

export interface Transformation {
  filePath: string;
  type: 'import' | 'component' | 'config' | 'event' | 'api' | 'css';
  line: number;
  column: number;
  oldText: string;
  newText: string;
  description: string;
}

export interface CompatibilityReport {
  overallScore: number;
  totalFiles: number;
  agGridFiles: number;
  compatibility: {
    fullySupported: number;
    partiallySupported: number;
    unsupported: number;
  };
  features: FeatureCompatibility[];
  manualChanges: ManualChange[];
  estimatedEffort: EstimatedEffort;
}

export interface FeatureCompatibility {
  feature: string;
  status: 'supported' | 'partial' | 'unsupported';
  usage: number;
  description: string;
  migrationNotes?: string;
}

export interface ManualChange {
  filePath: string;
  line: number;
  description: string;
  reason: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EstimatedEffort {
  automatic: number; // percentage
  manual: number;    // percentage
  timeEstimate: string;
  complexity: 'low' | 'medium' | 'high';
}

export interface NgUiMapping {
  agGridFeature: string;
  ngUiEquivalent?: string;
  transformationRule: TransformationRule;
  notes?: string;
}

export interface TransformationRule {
  type: 'direct' | 'modified' | 'custom' | 'unsupported';
  pattern?: RegExp;
  replacement?: string;
  customTransformer?: string;
}