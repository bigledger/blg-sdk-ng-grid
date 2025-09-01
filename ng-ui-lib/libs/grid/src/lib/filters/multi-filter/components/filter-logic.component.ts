import { 
  Component, 
  ChangeDetectionStrategy, 
  Input, 
  Output, 
  EventEmitter,
  OnInit, 
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  FilterGroupNode, 
  LogicalOperator 
} from '../multi-filter.interface';

/**
 * Filter Logic Component
 * 
 * Handles logical operators and group operations in the multi-filter system.
 * Features:
 * - Advanced logical operators (AND, OR, NOT, XOR, NAND, NOR, etc.)
 * - Visual operator representation
 * - Operator precedence handling
 * - Group collapse/expand functionality
 * - Custom logic expression support
 * - Real-time validation
 */
@Component({
  selector: 'blg-filter-logic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="logic-group-container" 
         [class.root-group]="isRoot"
         [class.collapsed]="collapsed"
         [class.negated]="groupNode.negated"
         [class.custom-logic]="groupNode.operator === 'CUSTOM'">
      
      <!-- Group Header -->
      <div class="group-header">
        <!-- Collapse Toggle -->
        <button 
          class="collapse-toggle"
          (click)="toggleCollapse()"
          [class.collapsed]="collapsed"
          *ngIf="!isRoot">
          <i class="icon-chevron-down"></i>
        </button>
        
        <!-- Group Label -->
        <div class="group-label">
          <span class="group-type">{{isRoot ? 'Root Filter' : 'Group'}}</span>
          <span class="child-count" *ngIf="groupNode.children.length > 0">
            ({{groupNode.children.length}} condition{{groupNode.children.length !== 1 ? 's' : ''}})
          </span>
        </div>
        
        <!-- Negation Toggle -->
        <label class="negation-toggle" *ngIf="!isRoot">
          <input 
            type="checkbox" 
            [checked]="groupNode.negated || false"
            (change)="toggleNegation($event)">
          <span class="toggle-label">NOT</span>
        </label>
        
        <!-- Delete Group Button -->
        <button 
          class="delete-group-btn"
          (click)="deleteGroup()"
          *ngIf="!isRoot"
          title="Delete group">
          <i class="icon-trash"></i>
        </button>
      </div>
      
      <!-- Operator Selection -->
      <div class="operator-section" *ngIf="!collapsed || isRoot">
        
        <!-- Primary Operators -->
        <div class="primary-operators">
          <div class="operator-tabs">
            <button 
              class="operator-tab"
              *ngFor="let op of primaryOperators(); trackBy: trackOperator"
              [class.active]="groupNode.operator === op.value"
              [class.advanced]="op.advanced"
              (click)="selectOperator(op.value)"
              [title]="op.description">
              <span class="operator-symbol">{{op.symbol}}</span>
              <span class="operator-name">{{op.label}}</span>
            </button>
          </div>
        </div>
        
        <!-- Advanced Operators Toggle -->
        <div class="advanced-toggle" *ngIf="hasAdvancedOperators()">
          <button 
            class="toggle-btn"
            [class.active]="showAdvanced()"
            (click)="toggleAdvanced()">
            <i class="icon-settings"></i>
            Advanced Operators
          </button>
        </div>
        
        <!-- Advanced Operators -->
        <div class="advanced-operators" 
             *ngIf="showAdvanced()"
             [@slideDown]>
          <div class="operator-grid">
            <button 
              class="advanced-operator-btn"
              *ngFor="let op of advancedOperators(); trackBy: trackOperator"
              [class.active]="groupNode.operator === op.value"
              [class.experimental]="op.experimental"
              (click)="selectOperator(op.value)"
              [title]="op.description">
              <div class="operator-header">
                <span class="operator-symbol">{{op.symbol}}</span>
                <span class="operator-name">{{op.label}}</span>
                <span class="experimental-badge" *ngIf="op.experimental">EXP</span>
              </div>
              <div class="operator-description">{{op.shortDesc}}</div>
            </button>
          </div>
        </div>
        
        <!-- Custom Logic Editor -->
        <div class="custom-logic-section" 
             *ngIf="groupNode.operator === 'CUSTOM'"
             [@slideDown]>
          <div class="custom-logic-header">
            <h5>Custom Logic Expression</h5>
            <button class="help-btn" (click)="showCustomLogicHelp()">
              <i class="icon-help"></i>
            </button>
          </div>
          
          <div class="custom-logic-editor">
            <textarea 
              class="custom-logic-input"
              [(ngModel)]="customLogic"
              (ngModelChange)="onCustomLogicChanged()"
              placeholder="Enter custom logic expression using A, B, C... for conditions"
              rows="3">
            </textarea>
            
            <div class="logic-validation" *ngIf="customLogicValidation()">
              <div class="validation-result" 
                   [class]="customLogicValidation()!.valid ? 'valid' : 'invalid'">
                <i class="validation-icon" 
                   [class]="customLogicValidation()!.valid ? 'icon-check' : 'icon-error'"></i>
                <span class="validation-message">{{customLogicValidation()!.message}}</span>
              </div>
            </div>
            
            <div class="logic-examples" *ngIf="showCustomLogicHelp()">
              <h6>Examples:</h6>
              <div class="example-item" 
                   *ngFor="let example of customLogicExamples"
                   (click)="applyLogicExample(example.expression)">
                <code class="example-expression">{{example.expression}}</code>
                <span class="example-description">{{example.description}}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Operator Preview -->
        <div class="operator-preview" *ngIf="showOperatorPreview()">
          <div class="preview-header">
            <span class="preview-label">Logic Preview:</span>
            <button class="preview-toggle" (click)="togglePreviewMode()">
              <i class="icon-eye"></i>
              {{previewMode() === 'visual' ? 'Text' : 'Visual'}}
            </button>
          </div>
          
          <!-- Visual Preview -->
          <div class="visual-preview" *ngIf="previewMode() === 'visual'">
            <div class="logic-diagram">
              <div class="condition-placeholder" 
                   *ngFor="let placeholder of getConditionPlaceholders(); let i = index">
                <span class="condition-label">Condition {{i + 1}}</span>
              </div>
              <div class="operator-connector">
                <span class="connector-symbol">{{getOperatorSymbol()}}</span>
              </div>
            </div>
          </div>
          
          <!-- Text Preview -->
          <div class="text-preview" *ngIf="previewMode() === 'text'">
            <code class="logic-expression">{{getLogicExpression()}}</code>
          </div>
        </div>
        
        <!-- Operator Performance Info -->
        <div class="operator-performance" 
             *ngIf="showPerformanceInfo() && operatorPerformance()">
          <div class="performance-header">
            <i class="icon-speed"></i>
            <span>Performance Impact</span>
          </div>
          
          <div class="performance-metrics">
            <div class="metric-item">
              <span class="metric-label">Execution Speed:</span>
              <div class="metric-bar">
                <div class="metric-fill" 
                     [style.width.%]="operatorPerformance()!.speed * 100"
                     [class]="getPerformanceClass(operatorPerformance()!.speed)">
                </div>
              </div>
            </div>
            
            <div class="metric-item">
              <span class="metric-label">Memory Usage:</span>
              <div class="metric-bar">
                <div class="metric-fill" 
                     [style.width.%]="operatorPerformance()!.memory * 100"
                     [class]="getPerformanceClass(1 - operatorPerformance()!.memory)">
                </div>
              </div>
            </div>
            
            <div class="metric-item">
              <span class="metric-label">Complexity:</span>
              <div class="metric-bar">
                <div class="metric-fill" 
                     [style.width.%]="operatorPerformance()!.complexity * 100"
                     [class]="getPerformanceClass(1 - operatorPerformance()!.complexity)">
                </div>
              </div>
            </div>
          </div>
          
          <div class="performance-tips" *ngIf="operatorPerformance()!.tips?.length">
            <h6>Optimization Tips:</h6>
            <ul class="tips-list">
              <li *ngFor="let tip of operatorPerformance()!.tips">{{tip}}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Group Statistics -->
      <div class="group-stats" *ngIf="showGroupStats() && groupStats()">
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-value">{{groupStats()!.conditionCount}}</span>
            <span class="stat-label">Conditions</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{groupStats()!.depth}}</span>
            <span class="stat-label">Depth</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{groupStats()!.complexity}}</span>
            <span class="stat-label">Complexity</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./filter-logic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Add smooth animations
  ]
})
export class FilterLogicComponent implements OnInit {
  
  // Component inputs
  @Input() groupNode!: FilterGroupNode;
  @Input() isRoot = false;
  @Input() collapsed = false;
  @Input() operatorOptions: any[] = [];
  
  // Component outputs
  @Output() operatorChanged = new EventEmitter<{ nodeId: string; operator: LogicalOperator }>();
  @Output() collapseToggled = new EventEmitter<{ nodeId: string; collapsed: boolean }>();
  @Output() nodeDeleted = new EventEmitter<string>();
  @Output() customLogicChanged = new EventEmitter<{ nodeId: string; logic: string }>();
  
  // Internal state
  private _showAdvanced = signal(false);
  private _previewMode = signal<'visual' | 'text'>('visual');
  private _showPerformanceInfo = signal(false);
  private _showGroupStats = signal(false);
  private _customLogicValidation = signal<{ valid: boolean; message: string } | null>(null);
  
  // Form data
  customLogic = '';
  
  // Computed properties
  showAdvanced = this._showAdvanced.asReadonly();
  previewMode = this._previewMode.asReadonly();
  showPerformanceInfo = this._showPerformanceInfo.asReadonly();
  showGroupStats = this._showGroupStats.asReadonly();
  customLogicValidation = this._customLogicValidation.asReadonly();
  
  // Operator definitions
  primaryOperators = computed(() => [
    {
      value: 'AND',
      label: 'AND',
      symbol: '∧',
      description: 'All conditions must be true',
      shortDesc: 'All must be true',
      advanced: false
    },
    {
      value: 'OR',
      label: 'OR', 
      symbol: '∨',
      description: 'At least one condition must be true',
      shortDesc: 'Any can be true',
      advanced: false
    },
    {
      value: 'NOT',
      label: 'NOT',
      symbol: '¬',
      description: 'Negates the result',
      shortDesc: 'Negates result',
      advanced: false
    }
  ]);
  
  advancedOperators = computed(() => [
    {
      value: 'XOR',
      label: 'XOR',
      symbol: '⊕',
      description: 'Exactly one condition must be true (Exclusive OR)',
      shortDesc: 'Exactly one true',
      advanced: true,
      experimental: false
    },
    {
      value: 'NAND',
      label: 'NAND',
      symbol: '↑',
      description: 'Not all conditions are true (Not AND)',
      shortDesc: 'Not all true',
      advanced: true,
      experimental: false
    },
    {
      value: 'NOR',
      label: 'NOR',
      symbol: '↓',
      description: 'None of the conditions are true (Not OR)',
      shortDesc: 'None true',
      advanced: true,
      experimental: false
    },
    {
      value: 'IF_THEN',
      label: 'IF→THEN',
      symbol: '→',
      description: 'If first condition is true, then second must be true',
      shortDesc: 'Conditional logic',
      advanced: true,
      experimental: false
    },
    {
      value: 'IF_THEN_ELSE',
      label: 'IF→THEN:ELSE',
      symbol: '?:',
      description: 'If first condition is true, evaluate second, otherwise third',
      shortDesc: 'Full conditional',
      advanced: true,
      experimental: false
    },
    {
      value: 'IMPLIES',
      label: 'IMPLIES',
      symbol: '⟹',
      description: 'Material implication (A implies B)',
      shortDesc: 'Logical implication',
      advanced: true,
      experimental: false
    },
    {
      value: 'BICONDITIONAL',
      label: 'IFF',
      symbol: '⟺',
      description: 'If and only if (A if and only if B)',
      shortDesc: 'Bidirectional condition',
      advanced: true,
      experimental: true
    },
    {
      value: 'CUSTOM',
      label: 'CUSTOM',
      symbol: '{ }',
      description: 'Define custom logic using expressions',
      shortDesc: 'Custom expression',
      advanced: true,
      experimental: true
    }
  ]);
  
  hasAdvancedOperators = computed(() => this.advancedOperators().length > 0);
  
  operatorPerformance = computed(() => {
    const operator = this.groupNode.operator;
    return this.getOperatorPerformanceInfo(operator);
  });
  
  groupStats = computed(() => {
    return this.calculateGroupStats(this.groupNode);
  });
  
  // Custom logic examples
  customLogicExamples = [
    {
      expression: 'A AND (B OR C)',
      description: 'A is true AND either B or C is true'
    },
    {
      expression: '(A OR B) AND NOT C',
      description: 'Either A or B is true, but C is false'
    },
    {
      expression: 'A XOR B',
      description: 'Either A or B is true, but not both'
    },
    {
      expression: 'A → B',
      description: 'If A is true, then B must be true'
    },
    {
      expression: '(A AND B) OR (C AND D)',
      description: 'Either both A and B are true, or both C and D are true'
    }
  ];
  
  ngOnInit(): void {
    this.initializeComponent();
  }
  
  // Event handlers
  toggleCollapse(): void {
    const newCollapsed = !this.collapsed;
    this.collapseToggled.emit({ nodeId: this.groupNode.id, collapsed: newCollapsed });
  }
  
  toggleNegation(event: any): void {
    this.groupNode.negated = event.target.checked;
    this.emitOperatorChange();
  }
  
  deleteGroup(): void {
    this.nodeDeleted.emit(this.groupNode.id);
  }
  
  selectOperator(operator: LogicalOperator): void {
    this.groupNode.operator = operator;
    this.emitOperatorChange();
    
    if (operator === 'CUSTOM') {
      this.customLogic = this.groupNode.customLogic || '';
    }
  }
  
  toggleAdvanced(): void {
    this._showAdvanced.update(show => !show);
  }
  
  onCustomLogicChanged(): void {
    this.groupNode.customLogic = this.customLogic;
    this.validateCustomLogic();
    this.customLogicChanged.emit({ nodeId: this.groupNode.id, logic: this.customLogic });
  }
  
  showCustomLogicHelp(): void {
    // Toggle help display
  }
  
  applyLogicExample(expression: string): void {
    this.customLogic = expression;
    this.onCustomLogicChanged();
  }
  
  togglePreviewMode(): void {
    this._previewMode.update(mode => mode === 'visual' ? 'text' : 'visual');
  }
  
  // Utility methods
  trackOperator(index: number, operator: any): string {
    return operator.value;
  }
  
  showOperatorPreview(): boolean {
    return this.groupNode.children.length > 0;
  }
  
  getConditionPlaceholders(): any[] {
    return new Array(Math.max(2, this.groupNode.children.length));
  }
  
  getOperatorSymbol(): string {
    const allOperators = [...this.primaryOperators(), ...this.advancedOperators()];
    const operator = allOperators.find(op => op.value === this.groupNode.operator);
    return operator?.symbol || this.groupNode.operator;
  }
  
  getLogicExpression(): string {
    const conditions = this.getConditionPlaceholders().map((_, i) => `Condition ${i + 1}`);
    const symbol = this.getOperatorSymbol();
    
    if (this.groupNode.operator === 'CUSTOM') {
      return this.customLogic || 'Define custom logic...';
    }
    
    switch (this.groupNode.operator) {
      case 'NOT':
        return `NOT (${conditions[0]})`;
      case 'IF_THEN':
        return `IF (${conditions[0]}) THEN (${conditions[1]})`;
      case 'IF_THEN_ELSE':
        return `IF (${conditions[0]}) THEN (${conditions[1]}) ELSE (${conditions[2]})`;
      default:
        return conditions.join(` ${symbol} `);
    }
  }
  
  getPerformanceClass(value: number): string {
    if (value >= 0.8) return 'excellent';
    if (value >= 0.6) return 'good';
    if (value >= 0.4) return 'fair';
    return 'poor';
  }
  
  // Private methods
  private initializeComponent(): void {
    if (this.groupNode.operator === 'CUSTOM') {
      this.customLogic = this.groupNode.customLogic || '';
      this._showAdvanced.set(true);
    }
  }
  
  private emitOperatorChange(): void {
    this.operatorChanged.emit({ 
      nodeId: this.groupNode.id, 
      operator: this.groupNode.operator 
    });
  }
  
  private validateCustomLogic(): void {
    if (!this.customLogic.trim()) {
      this._customLogicValidation.set(null);
      return;
    }
    
    try {
      // Validate custom logic expression
      const validation = this.parseCustomLogic(this.customLogic);
      this._customLogicValidation.set(validation);
    } catch (error) {
      this._customLogicValidation.set({
        valid: false,
        message: `Invalid expression: ${error}`
      });
    }
  }
  
  private parseCustomLogic(expression: string): { valid: boolean; message: string } {
    // Simple validation - in real implementation, this would use a proper parser
    const allowedTokens = /^[A-Z\s&|\(\)\-!→⟹⟺⊕↑↓]+$/;
    
    if (!allowedTokens.test(expression.replace(/AND|OR|NOT|XOR|NAND|NOR/g, ''))) {
      return {
        valid: false,
        message: 'Contains invalid characters. Use A-Z for conditions and logical operators.'
      };
    }
    
    // Check for balanced parentheses
    let openParens = 0;
    for (const char of expression) {
      if (char === '(') openParens++;
      if (char === ')') openParens--;
      if (openParens < 0) {
        return {
          valid: false,
          message: 'Unmatched closing parenthesis.'
        };
      }
    }
    
    if (openParens > 0) {
      return {
        valid: false,
        message: 'Unmatched opening parenthesis.'
      };
    }
    
    return {
      valid: true,
      message: 'Expression is valid.'
    };
  }
  
  private getOperatorPerformanceInfo(operator: LogicalOperator): {
    speed: number;
    memory: number;
    complexity: number;
    tips: string[];
  } | null {
    const performanceMap: { [key in LogicalOperator]: any } = {
      'AND': {
        speed: 0.95,
        memory: 0.1,
        complexity: 0.2,
        tips: ['Short-circuit evaluation: place most selective conditions first']
      },
      'OR': {
        speed: 0.9,
        memory: 0.15,
        complexity: 0.25,
        tips: ['Short-circuit evaluation: place least selective conditions first']
      },
      'NOT': {
        speed: 0.98,
        memory: 0.05,
        complexity: 0.1,
        tips: ['Very efficient, minimal overhead']
      },
      'XOR': {
        speed: 0.8,
        memory: 0.2,
        complexity: 0.4,
        tips: ['Requires evaluation of all conditions', 'Consider using AND/OR if possible']
      },
      'NAND': {
        speed: 0.85,
        memory: 0.15,
        complexity: 0.3,
        tips: ['Equivalent to NOT(AND), may be optimized']
      },
      'NOR': {
        speed: 0.85,
        memory: 0.15,
        complexity: 0.3,
        tips: ['Equivalent to NOT(OR), may be optimized']
      },
      'IF_THEN': {
        speed: 0.9,
        memory: 0.2,
        complexity: 0.35,
        tips: ['Efficient when first condition is often false']
      },
      'IF_THEN_ELSE': {
        speed: 0.75,
        memory: 0.3,
        complexity: 0.5,
        tips: ['Complex evaluation path', 'Consider simplifying logic']
      },
      'IMPLIES': {
        speed: 0.9,
        memory: 0.2,
        complexity: 0.35,
        tips: ['Equivalent to NOT A OR B']
      },
      'BICONDITIONAL': {
        speed: 0.7,
        memory: 0.25,
        complexity: 0.45,
        tips: ['Requires evaluation of all conditions', 'Complex boolean logic']
      },
      'CUSTOM': {
        speed: 0.5,
        memory: 0.4,
        complexity: 0.8,
        tips: ['Performance depends on expression complexity', 'Validate expression thoroughly']
      }
    };
    
    return performanceMap[operator] || null;
  }
  
  private calculateGroupStats(node: FilterGroupNode): {
    conditionCount: number;
    depth: number;
    complexity: number;
  } {
    let conditionCount = 0;
    let maxDepth = 1;
    let complexity = 0;
    
    const traverse = (currentNode: FilterGroupNode, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      
      for (const child of currentNode.children) {
        if (child.type === 'condition') {
          conditionCount++;
          complexity += 1;
        } else if (child.type === 'group') {
          complexity += 2; // Groups add complexity
          traverse(child as FilterGroupNode, depth + 1);
        } else {
          complexity += 3; // Formulas and natural language add more complexity
        }
      }
      
      // Operator complexity
      const operatorComplexity = this.getOperatorComplexity(currentNode.operator);
      complexity += operatorComplexity;
    };
    
    traverse(node, 1);
    
    return {
      conditionCount,
      depth: maxDepth,
      complexity: Math.round(complexity)
    };
  }
  
  private getOperatorComplexity(operator: LogicalOperator): number {
    const complexityMap: { [key in LogicalOperator]: number } = {
      'AND': 1,
      'OR': 1,
      'NOT': 1,
      'XOR': 2,
      'NAND': 2,
      'NOR': 2,
      'IF_THEN': 3,
      'IF_THEN_ELSE': 4,
      'IMPLIES': 3,
      'BICONDITIONAL': 4,
      'CUSTOM': 5
    };
    
    return complexityMap[operator] || 1;
  }
}