import { 
  Component, 
  ChangeDetectionStrategy, 
  Input, 
  Output, 
  EventEmitter,
  OnInit, 
  OnDestroy,
  ViewChild,
  ElementRef,
  ViewContainerRef,
  signal,
  computed,
  effect,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { 
  MultiFilterModel, 
  FilterNode, 
  FilterGroupNode, 
  FilterConditionNode,
  FilterFormulaNode,
  FilterNaturalNode,
  LogicalOperator,
  AIFilterSuggestion,
  FilterComplexity 
} from '../multi-filter.interface';
import { FilterConditionComponent } from './filter-condition.component';
import { FilterLogicComponent } from './filter-logic.component';

/**
 * Visual Filter Builder Component
 * 
 * Provides an innovative drag-and-drop interface for building complex filters.
 * Features:
 * - Visual flow diagram representation
 * - Drag-and-drop node creation and arrangement
 * - Real-time complexity analysis
 * - Color-coded condition groups
 * - Collapsible nested structures
 * - Zoom and pan canvas
 * - AI-powered suggestions integration
 * - Undo/redo functionality
 * - Export to various formats
 */
@Component({
  selector: 'blg-filter-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    FilterConditionComponent,
    FilterLogicComponent
  ],
  template: `
    <div class="filter-builder-container" 
         [class.fullscreen]="isFullscreen()"
         [class.grid-snap]="gridSnap()">
      
      <!-- Builder Toolbar -->
      <div class="builder-toolbar">
        <!-- View Controls -->
        <div class="view-controls">
          <button 
            class="tool-btn"
            [class.active]="tool() === 'select'"
            (click)="setTool('select')"
            title="Select tool">
            <i class="icon-cursor"></i>
          </button>
          
          <button 
            class="tool-btn"
            [class.active]="tool() === 'pan'"
            (click)="setTool('pan')"
            title="Pan tool">
            <i class="icon-hand"></i>
          </button>
          
          <div class="zoom-controls">
            <button class="zoom-btn" (click)="zoomOut()" title="Zoom out">
              <i class="icon-minus"></i>
            </button>
            <span class="zoom-level">{{zoomLevel() * 100 | number:'1.0-0'}}%</span>
            <button class="zoom-btn" (click)="zoomIn()" title="Zoom in">
              <i class="icon-plus"></i>
            </button>
            <button class="zoom-btn" (click)="zoomToFit()" title="Zoom to fit">
              <i class="icon-expand"></i>
            </button>
          </div>
        </div>
        
        <!-- Node Creation Tools -->
        <div class="creation-tools">
          <button class="create-btn condition-btn" (click)="createConditionNode()">
            <i class="icon-filter"></i>
            Add Condition
          </button>
          
          <button class="create-btn group-btn" (click)="createGroupNode()">
            <i class="icon-group"></i>
            Add Group
          </button>
          
          <button class="create-btn formula-btn" (click)="createFormulaNode()">
            <i class="icon-code"></i>
            Add Formula
          </button>
          
          <button class="create-btn natural-btn" (click)="createNaturalNode()">
            <i class="icon-chat"></i>
            Add Natural Query
          </button>
        </div>
        
        <!-- Layout and Display -->
        <div class="layout-controls">
          <button class="layout-btn" (click)="autoLayout()" title="Auto layout">
            <i class="icon-layout"></i>
            Auto Layout
          </button>
          
          <button 
            class="layout-btn"
            [class.active]="gridSnap()"
            (click)="toggleGridSnap()" 
            title="Toggle grid snap">
            <i class="icon-grid"></i>
          </button>
          
          <button 
            class="layout-btn"
            [class.active]="showMinimap()"
            (click)="toggleMinimap()" 
            title="Toggle minimap">
            <i class="icon-map"></i>
          </button>
          
          <button 
            class="layout-btn"
            [class.active]="isFullscreen()"
            (click)="toggleFullscreen()" 
            title="Toggle fullscreen">
            <i class="icon-fullscreen"></i>
          </button>
        </div>
        
        <!-- Actions -->
        <div class="action-controls">
          <button class="action-btn" (click)="undo()" [disabled]="!canUndo()">
            <i class="icon-undo"></i>
          </button>
          
          <button class="action-btn" (click)="redo()" [disabled]="!canRedo()">
            <i class="icon-redo"></i>
          </button>
          
          <button class="action-btn" (click)="clearAll()">
            <i class="icon-clear"></i>
            Clear
          </button>
          
          <button class="action-btn save-btn" (click)="saveLayout()">
            <i class="icon-save"></i>
            Save Layout
          </button>
        </div>
      </div>
      
      <!-- Main Canvas Area -->
      <div class="builder-main">
        <!-- Canvas Container -->
        <div class="canvas-container" 
             #canvasContainer
             (mousedown)="onCanvasMouseDown($event)"
             (mousemove)="onCanvasMouseMove($event)"
             (mouseup)="onCanvasMouseUp($event)"
             (wheel)="onCanvasWheel($event)"
             [style.transform]="getCanvasTransform()">
          
          <!-- Grid Background -->
          <div class="canvas-grid" 
               *ngIf="gridSnap()"
               [style.background-size]="getGridSize()">
          </div>
          
          <!-- Canvas Content -->
          <div class="canvas-content" 
               #canvasContent
               cdkDropList
               [cdkDropListData]="allNodes()"
               (cdkDropListDropped)="onNodeDropped($event)"
               [style.width.px]="canvasSize().width"
               [style.height.px]="canvasSize().height">
            
            <!-- Filter Nodes -->
            <div class="filter-nodes">
              <!-- Root Group Node -->
              <div 
                class="node-container group-node root-node"
                *ngIf="filterModel()?.rootNode"
                [style.transform]="getNodeTransform(filterModel()!.rootNode)"
                (click)="selectNode(filterModel()!.rootNode)"
                [class.selected]="isSelected(filterModel()!.rootNode.id)"
                [class.collapsed]="isCollapsed(filterModel()!.rootNode.id)">
                
                <blg-filter-logic
                  [groupNode]="filterModel()!.rootNode"
                  [isRoot]="true"
                  [collapsed]="isCollapsed(filterModel()!.rootNode.id)"
                  [operatorOptions]="logicOperatorOptions"
                  (operatorChanged)="onNodeOperatorChanged($event)"
                  (collapseToggled)="toggleNodeCollapse($event)"
                  (nodeDeleted)="deleteNode($event)">
                </blg-filter-logic>
              </div>
              
              <!-- Child Nodes (recursive) -->
              <ng-container *ngFor="let node of getAllVisibleNodes(); trackBy: trackNode">
                
                <!-- Condition Nodes -->
                <div 
                  class="node-container condition-node"
                  *ngIf="node.type === 'condition'"
                  [style.transform]="getNodeTransform(node)"
                  (click)="selectNode(node)"
                  [class.selected]="isSelected(node.id)"
                  [class.enabled]="(node as FilterConditionNode).enabled"
                  cdkDrag
                  [cdkDragData]="node"
                  (cdkDragStarted)="onNodeDragStarted($event)"
                  (cdkDragEnded)="onNodeDragEnded($event)">
                  
                  <blg-filter-condition
                    [condition]="node as FilterConditionNode"
                    [columnOptions]="columnOptions()"
                    [operatorOptions]="getOperatorOptionsForNode(node)"
                    [showStats]="showNodeStats()"
                    [enableAdvanced]="enableAdvanced()"
                    [supportsWeight]="supportsWeight()"
                    (conditionChanged)="onConditionChanged($event)"
                    (removeClicked)="deleteNode(node.id)"
                    (copyClicked)="copyNode($event)"
                    (testClicked)="testCondition($event)">
                  </blg-filter-condition>
                </div>
                
                <!-- Group Nodes -->
                <div 
                  class="node-container group-node"
                  *ngIf="node.type === 'group' && node.id !== filterModel()?.rootNode.id"
                  [style.transform]="getNodeTransform(node)"
                  (click)="selectNode(node)"
                  [class.selected]="isSelected(node.id)"
                  [class.collapsed]="isCollapsed(node.id)"
                  cdkDrag
                  [cdkDragData]="node"
                  (cdkDragStarted)="onNodeDragStarted($event)"
                  (cdkDragEnded)="onNodeDragEnded($event)">
                  
                  <blg-filter-logic
                    [groupNode]="node as FilterGroupNode"
                    [isRoot]="false"
                    [collapsed]="isCollapsed(node.id)"
                    [operatorOptions]="logicOperatorOptions"
                    (operatorChanged)="onNodeOperatorChanged($event)"
                    (collapseToggled)="toggleNodeCollapse($event)"
                    (nodeDeleted)="deleteNode($event)">
                  </blg-filter-logic>
                </div>
                
                <!-- Formula Nodes -->
                <div 
                  class="node-container formula-node"
                  *ngIf="node.type === 'formula'"
                  [style.transform]="getNodeTransform(node)"
                  (click)="selectNode(node)"
                  [class.selected]="isSelected(node.id)"
                  cdkDrag
                  [cdkDragData]="node"
                  (cdkDragStarted)="onNodeDragStarted($event)"
                  (cdkDragEnded)="onNodeDragEnded($event)">
                  
                  <div class="formula-node-content">
                    <div class="node-header">
                      <i class="icon-code"></i>
                      <span class="node-title">Formula</span>
                      <button class="node-delete-btn" (click)="deleteNode(node.id)">
                        <i class="icon-close"></i>
                      </button>
                    </div>
                    
                    <div class="formula-content">
                      <textarea 
                        class="formula-editor"
                        [(ngModel)]="(node as FilterFormulaNode).formula"
                        (ngModelChange)="onFormulaChanged(node as FilterFormulaNode, $event)"
                        placeholder="Enter formula expression..."
                        rows="3">
                      </textarea>
                      
                      <div class="formula-status" 
                           *ngIf="getFormulaStatus(node as FilterFormulaNode) as status">
                        <i class="status-icon" 
                           [class]="status.valid ? 'icon-check success' : 'icon-error error'"></i>
                        <span class="status-text">{{status.message}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Natural Language Nodes -->
                <div 
                  class="node-container natural-node"
                  *ngIf="node.type === 'natural'"
                  [style.transform]="getNodeTransform(node)"
                  (click)="selectNode(node)"
                  [class.selected]="isSelected(node.id)"
                  cdkDrag
                  [cdkDragData]="node"
                  (cdkDragStarted)="onNodeDragStarted($event)"
                  (cdkDragEnded)="onNodeDragEnded($event)">
                  
                  <div class="natural-node-content">
                    <div class="node-header">
                      <i class="icon-chat"></i>
                      <span class="node-title">Natural Query</span>
                      <div class="confidence-badge" 
                           *ngIf="(node as FilterNaturalNode).confidence"
                           [class]="getConfidenceClass((node as FilterNaturalNode).confidence!)">
                        {{(node as FilterNaturalNode).confidence! * 100 | number:'1.0-0'}}%
                      </div>
                      <button class="node-delete-btn" (click)="deleteNode(node.id)">
                        <i class="icon-close"></i>
                      </button>
                    </div>
                    
                    <div class="natural-content">
                      <input 
                        type="text"
                        class="natural-query-input"
                        [(ngModel)]="(node as FilterNaturalNode).query"
                        (ngModelChange)="onNaturalQueryChanged(node as FilterNaturalNode, $event)"
                        placeholder="Enter natural language query..."
                        (keyup.enter)="processNaturalQuery(node as FilterNaturalNode)">
                      
                      <button 
                        class="process-btn"
                        (click)="processNaturalQuery(node as FilterNaturalNode)"
                        [disabled]="isProcessingQuery(node.id)">
                        <i class="icon-search" *ngIf="!isProcessingQuery(node.id)"></i>
                        <i class="icon-spinner spinning" *ngIf="isProcessingQuery(node.id)"></i>
                        Process
                      </button>
                    </div>
                    
                    <div class="parsed-result" 
                         *ngIf="(node as FilterNaturalNode).parsed">
                      <div class="result-header">Interpreted as:</div>
                      <div class="result-conditions">
                        <span class="condition-preview" 
                              *ngFor="let condition of (node as FilterNaturalNode).parsed!.conditions">
                          {{condition.columnId}} {{condition.operator}} {{condition.value}}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>
              
              <!-- Node Connections -->
              <svg class="connections-overlay" 
                   [attr.width]="canvasSize().width" 
                   [attr.height]="canvasSize().height">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                          refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                  </marker>
                </defs>
                
                <g class="connections" *ngFor="let connection of getNodeConnections(); trackBy: trackConnection">
                  <path 
                    class="connection-line"
                    [class.selected]="isConnectionSelected(connection.id)"
                    [attr.d]="connection.path"
                    [attr.stroke]="connection.color"
                    [attr.stroke-width]="connection.width"
                    marker-end="url(#arrowhead)"
                    (click)="selectConnection(connection)">
                  </path>
                  
                  <text 
                    class="connection-label"
                    *ngIf="connection.label"
                    [attr.x]="connection.labelPosition.x"
                    [attr.y]="connection.labelPosition.y">
                    {{connection.label}}
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- AI Suggestions Overlay -->
        <div class="ai-suggestions-overlay" 
             *ngIf="showAISuggestions() && aiSuggestions().length > 0"
             [@slideInFromRight]>
          <div class="suggestions-panel">
            <div class="panel-header">
              <h4>AI Suggestions</h4>
              <button class="close-btn" (click)="hideAISuggestions()">
                <i class="icon-close"></i>
              </button>
            </div>
            
            <div class="suggestions-list">
              <div class="suggestion-item" 
                   *ngFor="let suggestion of aiSuggestions(); trackBy: trackSuggestion"
                   [class.high-confidence]="suggestion.confidence > 0.8">
                <div class="suggestion-header">
                  <span class="suggestion-type">{{suggestion.type}}</span>
                  <span class="suggestion-confidence">{{suggestion.confidence * 100 | number:'1.0-0'}}%</span>
                </div>
                
                <h5 class="suggestion-title">{{suggestion.title}}</h5>
                <p class="suggestion-description">{{suggestion.description}}</p>
                
                <div class="suggestion-actions">
                  <button 
                    class="action-btn preview-btn"
                    (click)="previewSuggestion(suggestion)">
                    Preview
                  </button>
                  <button 
                    class="action-btn apply-btn"
                    (click)="applySuggestion(suggestion)">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Selection Box -->
        <div class="selection-box" 
             *ngIf="selectionBox()"
             [style.left.px]="selectionBox()!.x"
             [style.top.px]="selectionBox()!.y"
             [style.width.px]="selectionBox()!.width"
             [style.height.px]="selectionBox()!.height">
        </div>
      </div>
      
      <!-- Right Panel -->
      <div class="builder-panel" 
           [class.hidden]="!showPanel()">
        
        <!-- Panel Tabs -->
        <div class="panel-tabs">
          <button 
            class="tab-btn"
            [class.active]="activePanel() === 'properties'"
            (click)="setActivePanel('properties')">
            Properties
          </button>
          <button 
            class="tab-btn"
            [class.active]="activePanel() === 'complexity'"
            (click)="setActivePanel('complexity')">
            Complexity
          </button>
          <button 
            class="tab-btn"
            [class.active]="activePanel() === 'preview'"
            (click)="setActivePanel('preview')">
            Preview
          </button>
        </div>
        
        <!-- Properties Panel -->
        <div class="panel-content properties-panel" 
             *ngIf="activePanel() === 'properties'">
          
          <div class="property-section" *ngIf="selectedNode()">
            <h4>Node Properties</h4>
            
            <div class="property-group">
              <label>Node ID:</label>
              <input type="text" [value]="selectedNode()!.id" readonly>
            </div>
            
            <div class="property-group">
              <label>Node Type:</label>
              <span class="node-type-badge" [class]="selectedNode()!.type">
                {{selectedNode()!.type}}
              </span>
            </div>
            
            <div class="property-group">
              <label>Position:</label>
              <div class="position-inputs">
                <input 
                  type="number" 
                  [(ngModel)]="selectedNode()!.position.x"
                  (ngModelChange)="onNodePositionChanged()"
                  placeholder="X">
                <input 
                  type="number" 
                  [(ngModel)]="selectedNode()!.position.y"
                  (ngModelChange)="onNodePositionChanged()"
                  placeholder="Y">
              </div>
            </div>
            
            <div class="property-group" *ngIf="selectedNode()!.metadata">
              <label>Label:</label>
              <input 
                type="text" 
                [(ngModel)]="selectedNode()!.metadata!.label"
                (ngModelChange)="onNodeLabelChanged()"
                placeholder="Enter label...">
            </div>
            
            <div class="property-group" *ngIf="selectedNode()!.metadata">
              <label>Description:</label>
              <textarea 
                [(ngModel)]="selectedNode()!.metadata!.description"
                (ngModelChange)="onNodeDescriptionChanged()"
                placeholder="Enter description..."
                rows="3">
              </textarea>
            </div>
            
            <div class="property-group" *ngIf="selectedNode()!.metadata">
              <label>Color:</label>
              <input 
                type="color" 
                [(ngModel)]="selectedNode()!.metadata!.color"
                (ngModelChange)="onNodeColorChanged()">
            </div>
          </div>
          
          <div class="property-section">
            <h4>Filter Settings</h4>
            
            <div class="property-group">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="enableAdvanced"
                  (ngModelChange)="onAdvancedToggled()">
                Enable advanced features
              </label>
            </div>
            
            <div class="property-group">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="showNodeStats"
                  (ngModelChange)="onStatsToggled()">
                Show node statistics
              </label>
            </div>
            
            <div class="property-group">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="supportsWeight"
                  (ngModelChange)="onWeightToggled()">
                Support weighted conditions
              </label>
            </div>
          </div>
        </div>
        
        <!-- Complexity Panel -->
        <div class="panel-content complexity-panel" 
             *ngIf="activePanel() === 'complexity'">
          
          <div class="complexity-overview">
            <h4>Filter Complexity Analysis</h4>
            
            <div class="metric-item">
              <span class="metric-label">Total Nodes:</span>
              <span class="metric-value">{{filterComplexity()?.nodeCount || 0}}</span>
            </div>
            
            <div class="metric-item">
              <span class="metric-label">Max Depth:</span>
              <span class="metric-value">{{filterComplexity()?.maxDepth || 0}}</span>
            </div>
            
            <div class="metric-item">
              <span class="metric-label">Operator Diversity:</span>
              <span class="metric-value">{{filterComplexity()?.operatorDiversity || 0}}</span>
            </div>
            
            <div class="metric-item">
              <span class="metric-label">Performance:</span>
              <span class="metric-value performance-badge" 
                    [class]="filterComplexity()?.estimatedPerformance">
                {{filterComplexity()?.estimatedPerformance || 'unknown'}}
              </span>
            </div>
          </div>
          
          <div class="optimization-suggestions" 
               *ngIf="filterComplexity()?.optimizationSuggestions?.length">
            <h5>Optimization Suggestions</h5>
            <div class="suggestion-item" 
                 *ngFor="let suggestion of filterComplexity()!.optimizationSuggestions">
              <i class="icon-lightbulb"></i>
              <span>{{suggestion}}</span>
            </div>
          </div>
        </div>
        
        <!-- Preview Panel -->
        <div class="panel-content preview-panel" 
             *ngIf="activePanel() === 'preview'">
          <h4>Filter Preview</h4>
          
          <div class="preview-controls">
            <select [(ngModel)]="previewMode" (ngModelChange)="updatePreview()">
              <option value="sql">SQL Query</option>
              <option value="mongodb">MongoDB Query</option>
              <option value="json">JSON Filter</option>
              <option value="natural">Natural Language</option>
            </select>
          </div>
          
          <div class="preview-content">
            <pre class="preview-code" 
                 [class]="previewMode">{{getPreviewContent()}}</pre>
          </div>
          
          <div class="preview-actions">
            <button class="action-btn" (click)="copyPreview()">
              <i class="icon-copy"></i>
              Copy
            </button>
            <button class="action-btn" (click)="exportPreview()">
              <i class="icon-download"></i>
              Export
            </button>
          </div>
        </div>
      </div>
      
      <!-- Minimap -->
      <div class="minimap-container" 
           *ngIf="showMinimap()"
           [@slideInFromTopRight]>
        <div class="minimap-content">
          <canvas #minimapCanvas 
                  class="minimap-canvas"
                  width="200" 
                  height="150"
                  (click)="onMinimapClick($event)">
          </canvas>
          <div class="viewport-indicator" 
               [style.transform]="getViewportTransform()">
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./filter-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Add smooth transitions and animations
  ]
})
export class FilterBuilderComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // Component inputs
  @Input() filterModel = signal<MultiFilterModel | null>(null);
  @Input() columnOptions = signal<any[]>([]);
  @Input() config = signal<any>({});
  @Input() aiSuggestions = signal<AIFilterSuggestion[]>([]);
  
  // Component outputs
  @Output() modelChanged = new EventEmitter<MultiFilterModel>();
  @Output() nodeSelected = new EventEmitter<string>();
  @Output() optimizationRequested = new EventEmitter<void>();
  @Output() complexityChanged = new EventEmitter<FilterComplexity>();
  
  // View children
  @ViewChild('canvasContainer', { read: ElementRef }) canvasContainer!: ElementRef;
  @ViewChild('canvasContent', { read: ElementRef }) canvasContent!: ElementRef;
  @ViewChild('minimapCanvas', { read: ElementRef }) minimapCanvas!: ElementRef;
  
  // Internal state signals
  private _tool = signal<'select' | 'pan'>('select');
  private _zoomLevel = signal(1.0);
  private _panOffset = signal({ x: 0, y: 0 });
  private _canvasSize = signal({ width: 2000, height: 1500 });
  private _selectedNodes = signal<Set<string>>(new Set());
  private _collapsedNodes = signal<Set<string>>(new Set());
  private _isFullscreen = signal(false);
  private _gridSnap = signal(true);
  private _showMinimap = signal(false);
  private _showPanel = signal(true);
  private _activePanel = signal<'properties' | 'complexity' | 'preview'>('properties');
  private _showAISuggestions = signal(false);
  private _selectionBox = signal<{ x: number; y: number; width: number; height: number } | null>(null);
  private _filterComplexity = signal<FilterComplexity | null>(null);
  private _isDragging = signal(false);
  private _isPanning = signal(false);
  private _processingQueries = signal<Set<string>>(new Set());
  
  // Component properties  
  enableAdvanced = true;
  showNodeStats = false;
  supportsWeight = true;
  previewMode = 'sql';
  
  // Operator options
  logicOperatorOptions = [
    { value: 'AND', label: 'AND', description: 'All conditions must be true' },
    { value: 'OR', label: 'OR', description: 'At least one condition must be true' },
    { value: 'NOT', label: 'NOT', description: 'Negates the condition' },
    { value: 'XOR', label: 'XOR', description: 'Exactly one condition must be true' },
    { value: 'NAND', label: 'NAND', description: 'Not all conditions are true' },
    { value: 'NOR', label: 'NOR', description: 'None of the conditions are true' },
    { value: 'IF_THEN', label: 'IF→THEN', description: 'If first condition then second condition' },
    { value: 'IMPLIES', label: 'IMPLIES', description: 'Material implication' },
    { value: 'BICONDITIONAL', label: 'IFF', description: 'If and only if' }
  ];
  
  // Computed properties
  tool = this._tool.asReadonly();
  zoomLevel = this._zoomLevel.asReadonly();
  panOffset = this._panOffset.asReadonly();
  canvasSize = this._canvasSize.asReadonly();
  selectedNodes = this._selectedNodes.asReadonly();
  collapsedNodes = this._collapsedNodes.asReadonly();
  isFullscreen = this._isFullscreen.asReadonly();
  gridSnap = this._gridSnap.asReadonly();
  showMinimap = this._showMinimap.asReadonly();
  showPanel = this._showPanel.asReadonly();
  activePanel = this._activePanel.asReadonly();
  showAISuggestions = this._showAISuggestions.asReadonly();
  selectionBox = this._selectionBox.asReadonly();
  filterComplexity = this._filterComplexity.asReadonly();
  isDragging = this._isDragging.asReadonly();
  isPanning = this._isPanning.asReadonly();
  processingQueries = this._processingQueries.asReadonly();
  
  selectedNode = computed(() => {
    const selectedIds = Array.from(this._selectedNodes());
    if (selectedIds.length === 1) {
      return this.findNodeById(selectedIds[0]);
    }
    return null;
  });
  
  allNodes = computed(() => {
    const model = this.filterModel();
    if (!model) return [];
    return this.flattenNodes(model.rootNode);
  });
  
  // History for undo/redo
  private history: MultiFilterModel[] = [];
  private historyIndex = 0;
  
  ngOnInit(): void {
    this.initializeBuilder();
  }
  
  ngAfterViewInit(): void {
    this.setupCanvas();
    this.updateMinimap();
  }
  
  ngOnDestroy(): void {
    this.cleanup();
  }
  
  // Tool and view methods
  setTool(tool: 'select' | 'pan'): void {
    this._tool.set(tool);
  }
  
  zoomIn(): void {
    this._zoomLevel.update(zoom => Math.min(zoom * 1.2, 3.0));
  }
  
  zoomOut(): void {
    this._zoomLevel.update(zoom => Math.max(zoom / 1.2, 0.1));
  }
  
  zoomToFit(): void {
    // Calculate zoom to fit all nodes
    const nodes = this.allNodes();
    if (nodes.length === 0) return;
    
    const bounds = this.calculateNodesBounds(nodes);
    const containerSize = this.getContainerSize();
    
    const scaleX = containerSize.width / bounds.width;
    const scaleY = containerSize.height / bounds.height;
    const scale = Math.min(scaleX, scaleY, 1.0) * 0.9; // 10% margin
    
    this._zoomLevel.set(scale);
    this._panOffset.set({
      x: (containerSize.width - bounds.width * scale) / 2 - bounds.x * scale,
      y: (containerSize.height - bounds.height * scale) / 2 - bounds.y * scale
    });
  }
  
  toggleGridSnap(): void {
    this._gridSnap.update(snap => !snap);
  }
  
  toggleMinimap(): void {
    this._showMinimap.update(show => !show);
    if (this._showMinimap()) {
      this.updateMinimap();
    }
  }
  
  toggleFullscreen(): void {
    this._isFullscreen.update(fullscreen => !fullscreen);
  }
  
  // Node creation methods
  createConditionNode(): void {
    const position = this.getNextNodePosition();
    const newNode: FilterConditionNode = {
      id: this.generateNodeId(),
      type: 'condition',
      columnId: '',
      filter: {
        type: 'text',
        operator: 'contains',
        active: true
      },
      enabled: true,
      position
    };
    
    this.addNodeToModel(newNode);
  }
  
  createGroupNode(): void {
    const position = this.getNextNodePosition();
    const newNode: FilterGroupNode = {
      id: this.generateNodeId(),
      type: 'group',
      operator: 'AND',
      children: [],
      position
    };
    
    this.addNodeToModel(newNode);
  }
  
  createFormulaNode(): void {
    const position = this.getNextNodePosition();
    const newNode: FilterFormulaNode = {
      id: this.generateNodeId(),
      type: 'formula',
      formula: '',
      position
    };
    
    this.addNodeToModel(newNode);
  }
  
  createNaturalNode(): void {
    const position = this.getNextNodePosition();
    const newNode: FilterNaturalNode = {
      id: this.generateNodeId(),
      type: 'natural',
      query: '',
      position
    };
    
    this.addNodeToModel(newNode);
  }
  
  // Node manipulation methods
  selectNode(node: FilterNode): void {
    this._selectedNodes.set(new Set([node.id]));
    this.nodeSelected.emit(node.id);
  }
  
  deleteNode(nodeId: string): void {
    const model = this.filterModel();
    if (!model) return;
    
    this.saveToHistory();
    const updatedModel = this.removeNodeFromModel(model, nodeId);
    this.filterModel.set(updatedModel);
    this.modelChanged.emit(updatedModel);
  }
  
  copyNode(node: FilterConditionNode): void {
    const position = this.getNextNodePosition();
    const newNode = {
      ...JSON.parse(JSON.stringify(node)),
      id: this.generateNodeId(),
      position
    };
    
    this.addNodeToModel(newNode);
  }
  
  // Event handlers
  onNodeDropped(event: CdkDragDrop<FilterNode[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    
    this.updateModelAfterDrop();
  }
  
  onNodeDragStarted(event: any): void {
    this._isDragging.set(true);
  }
  
  onNodeDragEnded(event: any): void {
    this._isDragging.set(false);
    this.updateNodePosition(event.source.data, event.distance);
  }
  
  onCanvasMouseDown(event: MouseEvent): void {
    if (this._tool() === 'pan') {
      this._isPanning.set(true);
    } else if (this._tool() === 'select') {
      this.startSelection(event);
    }
  }
  
  onCanvasMouseMove(event: MouseEvent): void {
    if (this._isPanning()) {
      this.updatePan(event);
    } else if (this._selectionBox()) {
      this.updateSelection(event);
    }
  }
  
  onCanvasMouseUp(event: MouseEvent): void {
    this._isPanning.set(false);
    if (this._selectionBox()) {
      this.finishSelection();
    }
  }
  
  onCanvasWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    this._zoomLevel.update(zoom => Math.max(0.1, Math.min(3.0, zoom * zoomFactor)));
  }
  
  onConditionChanged(updatedCondition: FilterConditionNode): void {
    this.updateNodeInModel(updatedCondition);
  }
  
  onNodeOperatorChanged(event: { nodeId: string; operator: LogicalOperator }): void {
    const node = this.findNodeById(event.nodeId) as FilterGroupNode;
    if (node && node.type === 'group') {
      node.operator = event.operator;
      this.updateModelAfterChange();
    }
  }
  
  onFormulaChanged(node: FilterFormulaNode, formula: string): void {
    node.formula = formula;
    // Clear compiled version to force recompilation
    node.compiled = undefined;
    this.updateModelAfterChange();
  }
  
  onNaturalQueryChanged(node: FilterNaturalNode, query: string): void {
    node.query = query;
    // Clear parsed result to force reprocessing
    node.parsed = undefined;
    this.updateModelAfterChange();
  }
  
  // Layout and display methods
  autoLayout(): void {
    const nodes = this.allNodes();
    if (nodes.length === 0) return;
    
    this.saveToHistory();
    this.applyAutoLayout(nodes);
    this.updateModelAfterChange();
  }
  
  clearAll(): void {
    const model = this.filterModel();
    if (!model) return;
    
    this.saveToHistory();
    const clearedModel: MultiFilterModel = {
      ...model,
      rootNode: {
        ...model.rootNode,
        children: []
      }
    };
    
    this.filterModel.set(clearedModel);
    this.modelChanged.emit(clearedModel);
  }
  
  // History methods
  undo(): void {
    if (this.canUndo()) {
      this.historyIndex--;
      const model = this.history[this.historyIndex];
      this.filterModel.set(model);
      this.modelChanged.emit(model);
    }
  }
  
  redo(): void {
    if (this.canRedo()) {
      this.historyIndex++;
      const model = this.history[this.historyIndex];
      this.filterModel.set(model);
      this.modelChanged.emit(model);
    }
  }
  
  canUndo(): boolean {
    return this.historyIndex > 0;
  }
  
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }
  
  // Utility methods
  trackNode(index: number, node: FilterNode): string {
    return node.id;
  }
  
  trackConnection(index: number, connection: any): string {
    return connection.id;
  }
  
  trackSuggestion(index: number, suggestion: AIFilterSuggestion): string {
    return suggestion.type + suggestion.title;
  }
  
  getCanvasTransform(): string {
    const { x, y } = this._panOffset();
    const zoom = this._zoomLevel();
    return `translate(${x}px, ${y}px) scale(${zoom})`;
  }
  
  getNodeTransform(node: FilterNode): string {
    return `translate(${node.position.x}px, ${node.position.y}px)`;
  }
  
  getGridSize(): string {
    const gridSize = 20 * this._zoomLevel();
    return `${gridSize}px ${gridSize}px`;
  }
  
  isSelected(nodeId: string): boolean {
    return this._selectedNodes().has(nodeId);
  }
  
  isCollapsed(nodeId: string): boolean {
    return this._collapsedNodes().has(nodeId);
  }
  
  getAllVisibleNodes(): FilterNode[] {
    const allNodes = this.allNodes();
    return allNodes.filter(node => !this.isNodeHidden(node));
  }
  
  getOperatorOptionsForNode(node: FilterNode): any[] {
    // Return appropriate operators based on node type and column
    return [];
  }
  
  getNodeConnections(): any[] {
    // Calculate visual connections between nodes
    return [];
  }
  
  getFormulaStatus(node: FilterFormulaNode): { valid: boolean; message: string } | null {
    if (!node.formula) return null;
    
    // Validate formula syntax
    try {
      // This would use your formula parser
      return { valid: true, message: 'Formula is valid' };
    } catch (error) {
      return { valid: false, message: 'Syntax error in formula' };
    }
  }
  
  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'high-confidence';
    if (confidence >= 0.6) return 'medium-confidence';
    return 'low-confidence';
  }
  
  isProcessingQuery(nodeId: string): boolean {
    return this._processingQueries().has(nodeId);
  }
  
  async processNaturalQuery(node: FilterNaturalNode): Promise<void> {
    if (!node.query.trim()) return;
    
    this._processingQueries.update(set => new Set([...set, node.id]));
    
    try {
      // Process natural language query (would integrate with your NLP service)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
      
      // Mock parsed result
      node.parsed = {
        originalQuery: node.query,
        intent: 'filter',
        entities: [],
        conditions: [],
        confidence: 0.85
      };
      
      node.confidence = 0.85;
      this.updateModelAfterChange();
      
    } catch (error) {
      console.error('Natural query processing failed:', error);
    } finally {
      this._processingQueries.update(set => {
        const newSet = new Set(set);
        newSet.delete(node.id);
        return newSet;
      });
    }
  }
  
  testCondition(event: { condition: FilterConditionNode; testData?: any[] }): void {
    console.log('Testing condition:', event.condition);
    // Implement condition testing logic
  }
  
  toggleNodeCollapse(event: { nodeId: string; collapsed: boolean }): void {
    if (event.collapsed) {
      this._collapsedNodes.update(set => new Set([...set, event.nodeId]));
    } else {
      this._collapsedNodes.update(set => {
        const newSet = new Set(set);
        newSet.delete(event.nodeId);
        return newSet;
      });
    }
  }
  
  // Panel methods
  setActivePanel(panel: 'properties' | 'complexity' | 'preview'): void {
    this._activePanel.set(panel);
  }
  
  onNodePositionChanged(): void {
    this.updateModelAfterChange();
  }
  
  onNodeLabelChanged(): void {
    this.updateModelAfterChange();
  }
  
  onNodeDescriptionChanged(): void {
    this.updateModelAfterChange();
  }
  
  onNodeColorChanged(): void {
    this.updateModelAfterChange();
  }
  
  onAdvancedToggled(): void {
    // Update advanced features
  }
  
  onStatsToggled(): void {
    // Update stats display
  }
  
  onWeightToggled(): void {
    // Update weight support
  }
  
  updatePreview(): void {
    // Update preview based on current mode
  }
  
  getPreviewContent(): string {
    const model = this.filterModel();
    if (!model) return '';
    
    switch (this.previewMode) {
      case 'sql':
        return this.generateSQLPreview(model);
      case 'mongodb':
        return this.generateMongoPreview(model);
      case 'json':
        return JSON.stringify(model, null, 2);
      case 'natural':
        return this.generateNaturalLanguagePreview(model);
      default:
        return '';
    }
  }
  
  copyPreview(): void {
    const content = this.getPreviewContent();
    navigator.clipboard.writeText(content);
  }
  
  exportPreview(): void {
    const content = this.getPreviewContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filter-${this.previewMode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // AI Suggestions
  hideAISuggestions(): void {
    this._showAISuggestions.set(false);
  }
  
  previewSuggestion(suggestion: AIFilterSuggestion): void {
    console.log('Previewing suggestion:', suggestion);
  }
  
  applySuggestion(suggestion: AIFilterSuggestion): void {
    console.log('Applying suggestion:', suggestion);
    // Implement suggestion application logic
  }
  
  // Minimap methods
  onMinimapClick(event: MouseEvent): void {
    const rect = this.minimapCanvas.nativeElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    // Pan to clicked location
    const canvasSize = this._canvasSize();
    this._panOffset.set({
      x: -x * canvasSize.width * this._zoomLevel(),
      y: -y * canvasSize.height * this._zoomLevel()
    });
  }
  
  getViewportTransform(): string {
    // Calculate viewport indicator position on minimap
    return 'translate(0, 0)';
  }
  
  saveLayout(): void {
    // Save the current layout configuration
    console.log('Saving layout');
  }
  
  // Private implementation methods
  private initializeBuilder(): void {
    // Initialize component state
    this.updateComplexity();
  }
  
  private setupCanvas(): void {
    // Setup canvas event listeners and initial state
  }
  
  private updateMinimap(): void {
    if (!this._showMinimap() || !this.minimapCanvas) return;
    
    // Render minimap content
    const canvas = this.minimapCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Render simplified view of nodes
  }
  
  private generateNodeId(): string {
    return 'node-' + Math.random().toString(36).substr(2, 9);
  }
  
  private getNextNodePosition(): { x: number; y: number } {
    const nodes = this.allNodes();
    if (nodes.length === 0) {
      return { x: 100, y: 100 };
    }
    
    // Find next available position
    return { x: 100 + (nodes.length * 50), y: 100 + (nodes.length * 30) };
  }
  
  private addNodeToModel(node: FilterNode): void {
    const model = this.filterModel();
    if (!model) return;
    
    this.saveToHistory();
    const updatedModel = { ...model };
    updatedModel.rootNode.children.push(node);
    
    this.filterModel.set(updatedModel);
    this.modelChanged.emit(updatedModel);
  }
  
  private removeNodeFromModel(model: MultiFilterModel, nodeId: string): MultiFilterModel {
    const updatedModel = { ...model };
    updatedModel.rootNode = this.removeNodeRecursive(updatedModel.rootNode, nodeId);
    return updatedModel;
  }
  
  private removeNodeRecursive(node: FilterGroupNode, nodeId: string): FilterGroupNode {
    const updatedNode = { ...node };
    updatedNode.children = updatedNode.children
      .filter(child => child.id !== nodeId)
      .map(child => {
        if (child.type === 'group') {
          return this.removeNodeRecursive(child as FilterGroupNode, nodeId);
        }
        return child;
      });
    return updatedNode;
  }
  
  private updateNodeInModel(updatedNode: FilterNode): void {
    const model = this.filterModel();
    if (!model) return;
    
    const updatedModel = { ...model };
    this.updateNodeRecursive(updatedModel.rootNode, updatedNode);
    
    this.filterModel.set(updatedModel);
    this.modelChanged.emit(updatedModel);
  }
  
  private updateNodeRecursive(node: FilterGroupNode, updatedNode: FilterNode): void {
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].id === updatedNode.id) {
        node.children[i] = updatedNode;
        return;
      } else if (node.children[i].type === 'group') {
        this.updateNodeRecursive(node.children[i] as FilterGroupNode, updatedNode);
      }
    }
  }
  
  private flattenNodes(node: FilterGroupNode): FilterNode[] {
    const nodes: FilterNode[] = [node];
    for (const child of node.children) {
      if (child.type === 'group') {
        nodes.push(...this.flattenNodes(child as FilterGroupNode));
      } else {
        nodes.push(child);
      }
    }
    return nodes;
  }
  
  private findNodeById(nodeId: string): FilterNode | null {
    const allNodes = this.allNodes();
    return allNodes.find(node => node.id === nodeId) || null;
  }
  
  private isNodeHidden(node: FilterNode): boolean {
    // Check if node should be hidden due to parent being collapsed
    return false;
  }
  
  private saveToHistory(): void {
    const model = this.filterModel();
    if (!model) return;
    
    // Remove any future history if we're not at the end
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add current state to history
    this.history.push(JSON.parse(JSON.stringify(model)));
    this.historyIndex = this.history.length - 1;
    
    // Limit history size
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  
  private updateModelAfterChange(): void {
    const model = this.filterModel();
    if (!model) return;
    
    this.modelChanged.emit(model);
    this.updateComplexity();
  }
  
  private updateModelAfterDrop(): void {
    // Update model based on drag/drop operations
    this.updateModelAfterChange();
  }
  
  private updateNodePosition(node: FilterNode, distance: { x: number; y: number }): void {
    node.position.x += distance.x;
    node.position.y += distance.y;
    
    if (this._gridSnap()) {
      const gridSize = 20;
      node.position.x = Math.round(node.position.x / gridSize) * gridSize;
      node.position.y = Math.round(node.position.y / gridSize) * gridSize;
    }
    
    this.updateModelAfterChange();
  }
  
  private calculateNodesBounds(nodes: FilterNode[]): { x: number; y: number; width: number; height: number } {
    if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const node of nodes) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + 200); // Assume node width
      maxY = Math.max(maxY, node.position.y + 100); // Assume node height
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  
  private getContainerSize(): { width: number; height: number } {
    const container = this.canvasContainer?.nativeElement;
    return container ? 
      { width: container.clientWidth, height: container.clientHeight } :
      { width: 800, height: 600 };
  }
  
  private applyAutoLayout(nodes: FilterNode[]): void {
    // Implement automatic layout algorithm (e.g., hierarchical, force-directed)
    let x = 100, y = 100;
    const spacing = { x: 250, y: 150 };
    
    for (const node of nodes) {
      node.position = { x, y };
      x += spacing.x;
      if (x > 1000) {
        x = 100;
        y += spacing.y;
      }
    }
  }
  
  private startSelection(event: MouseEvent): void {
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this._selectionBox.set({ x, y, width: 0, height: 0 });
  }
  
  private updateSelection(event: MouseEvent): void {
    const selectionBox = this._selectionBox();
    if (!selectionBox) return;
    
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    
    this._selectionBox.set({
      x: Math.min(selectionBox.x, currentX),
      y: Math.min(selectionBox.y, currentY),
      width: Math.abs(currentX - selectionBox.x),
      height: Math.abs(currentY - selectionBox.y)
    });
  }
  
  private finishSelection(): void {
    const selectionBox = this._selectionBox();
    if (!selectionBox) return;
    
    // Find nodes within selection box
    const selectedNodeIds = new Set<string>();
    const nodes = this.allNodes();
    
    for (const node of nodes) {
      if (this.isNodeInSelectionBox(node, selectionBox)) {
        selectedNodeIds.add(node.id);
      }
    }
    
    this._selectedNodes.set(selectedNodeIds);
    this._selectionBox.set(null);
  }
  
  private isNodeInSelectionBox(node: FilterNode, box: { x: number; y: number; width: number; height: number }): boolean {
    // Check if node overlaps with selection box
    const zoom = this._zoomLevel();
    const offset = this._panOffset();
    
    const nodeX = node.position.x * zoom + offset.x;
    const nodeY = node.position.y * zoom + offset.y;
    const nodeWidth = 200 * zoom; // Assume node width
    const nodeHeight = 100 * zoom; // Assume node height
    
    return !(nodeX > box.x + box.width ||
             nodeX + nodeWidth < box.x ||
             nodeY > box.y + box.height ||
             nodeY + nodeHeight < box.y);
  }
  
  private updatePan(event: MouseEvent): void {
    // Update pan offset based on mouse movement
    const sensitivity = 1;
    this._panOffset.update(offset => ({
      x: offset.x + event.movementX * sensitivity,
      y: offset.y + event.movementY * sensitivity
    }));
  }
  
  private updateComplexity(): void {
    const model = this.filterModel();
    if (!model) return;
    
    const complexity = this.calculateComplexity(model);
    this._filterComplexity.set(complexity);
    this.complexityChanged.emit(complexity);
  }
  
  private calculateComplexity(model: MultiFilterModel): FilterComplexity {
    const nodes = this.flattenNodes(model.rootNode);
    const nodeCount = nodes.length;
    const maxDepth = this.calculateMaxDepth(model.rootNode);
    const operators = new Set<string>();
    
    this.collectOperators(model.rootNode, operators);
    
    const estimatedPerformance = nodeCount < 10 ? 'excellent' :
                               nodeCount < 25 ? 'good' :
                               nodeCount < 50 ? 'fair' : 'poor';
    
    return {
      nodeCount,
      maxDepth,
      operatorDiversity: operators.size,
      estimatedPerformance
    };
  }
  
  private calculateMaxDepth(node: FilterGroupNode, currentDepth = 1): number {
    let maxChildDepth = currentDepth;
    
    for (const child of node.children) {
      if (child.type === 'group') {
        const childDepth = this.calculateMaxDepth(child as FilterGroupNode, currentDepth + 1);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      }
    }
    
    return maxChildDepth;
  }
  
  private collectOperators(node: FilterGroupNode, operators: Set<string>): void {
    operators.add(node.operator);
    
    for (const child of node.children) {
      if (child.type === 'group') {
        this.collectOperators(child as FilterGroupNode, operators);
      } else if (child.type === 'condition') {
        const condition = child as FilterConditionNode;
        if (condition.filter?.operator) {
          operators.add(condition.filter.operator);
        }
      }
    }
  }
  
  // Preview generation methods
  private generateSQLPreview(model: MultiFilterModel): string {
    return 'SELECT * FROM table WHERE ' + this.generateSQLCondition(model.rootNode);
  }
  
  private generateSQLCondition(node: FilterGroupNode): string {
    const conditions = node.children.map(child => {
      if (child.type === 'condition') {
        const condition = child as FilterConditionNode;
        return `${condition.columnId} ${this.mapOperatorToSQL(condition.filter?.operator || '')} ?`;
      } else if (child.type === 'group') {
        return '(' + this.generateSQLCondition(child as FilterGroupNode) + ')';
      }
      return '';
    }).filter(c => c);
    
    return conditions.join(` ${node.operator} `);
  }
  
  private generateMongoPreview(model: MultiFilterModel): string {
    const query = this.generateMongoCondition(model.rootNode);
    return JSON.stringify(query, null, 2);
  }
  
  private generateMongoCondition(node: FilterGroupNode): any {
    const conditions = node.children.map(child => {
      if (child.type === 'condition') {
        const condition = child as FilterConditionNode;
        return {
          [condition.columnId]: {
            [this.mapOperatorToMongo(condition.filter?.operator || '')]: 'value'
          }
        };
      } else if (child.type === 'group') {
        return this.generateMongoCondition(child as FilterGroupNode);
      }
      return {};
    }).filter(c => Object.keys(c).length > 0);
    
    return { [`$${node.operator.toLowerCase()}`]: conditions };
  }
  
  private generateNaturalLanguagePreview(model: MultiFilterModel): string {
    return this.generateNaturalCondition(model.rootNode);
  }
  
  private generateNaturalCondition(node: FilterGroupNode): string {
    const conditions = node.children.map(child => {
      if (child.type === 'condition') {
        const condition = child as FilterConditionNode;
        return `${condition.columnId} ${this.mapOperatorToNatural(condition.filter?.operator || '')} [value]`;
      } else if (child.type === 'group') {
        return '(' + this.generateNaturalCondition(child as FilterGroupNode) + ')';
      }
      return '';
    }).filter(c => c);
    
    const connector = node.operator === 'AND' ? 'and' :
                     node.operator === 'OR' ? 'or' :
                     node.operator.toLowerCase();
    
    return conditions.join(` ${connector} `);
  }
  
  private mapOperatorToSQL(operator: string): string {
    const mapping: { [key: string]: string } = {
      'equals': '=',
      'notEquals': '!=',
      'greaterThan': '>',
      'lessThan': '<',
      'greaterThanOrEqual': '>=',
      'lessThanOrEqual': '<=',
      'contains': 'LIKE',
      'startsWith': 'LIKE',
      'endsWith': 'LIKE'
    };
    return mapping[operator] || '=';
  }
  
  private mapOperatorToMongo(operator: string): string {
    const mapping: { [key: string]: string } = {
      'equals': '$eq',
      'notEquals': '$ne',
      'greaterThan': '$gt',
      'lessThan': '$lt',
      'greaterThanOrEqual': '$gte',
      'lessThanOrEqual': '$lte',
      'contains': '$regex'
    };
    return mapping[operator] || '$eq';
  }
  
  private mapOperatorToNatural(operator: string): string {
    const mapping: { [key: string]: string } = {
      'equals': 'equals',
      'notEquals': 'does not equal',
      'greaterThan': 'is greater than',
      'lessThan': 'is less than',
      'contains': 'contains'
    };
    return mapping[operator] || 'matches';
  }
  
  private isConnectionSelected(connectionId: string): boolean {
    return false; // Implement connection selection logic
  }
  
  private selectConnection(connection: any): void {
    // Implement connection selection
  }
  
  private cleanup(): void {
    // Cleanup resources and event listeners
  }
}