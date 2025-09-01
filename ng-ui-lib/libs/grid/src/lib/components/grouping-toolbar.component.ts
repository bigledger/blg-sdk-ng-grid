import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ColumnDefinition, AggregationFunction, AggregationConfig } from '@ng-ui/core';

/**
 * Grouping toolbar component for managing row grouping
 */
@Component({
  selector: 'ng-ui-grouping-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
    <div class="blg-grouping-toolbar">
      <!-- Group By Section -->
      <div class="grouping-section">
        <div class="section-header">
          <h4>Group By</h4>
          <button 
            type="button" 
            class="btn btn-secondary btn-sm"
            (click)="clearAllGrouping()"
            [disabled]="groupByColumns.length === 0">
            Clear All
          </button>
        </div>
        
        <div class="grouping-dropzone" 
             cdkDropList 
             [cdkDropListData]="groupByColumns"
             (cdkDropListDropped)="onGroupColumnDrop($event)"
             [class.empty]="groupByColumns.length === 0">
          
          @if (groupByColumns.length === 0) {
            <div class="dropzone-placeholder">
              <svg class="placeholder-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,8L7.5,15H16.5L12,8M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z"/>
              </svg>
              <span>Drag columns here to group</span>
            </div>
          } @else {
            <div class="group-columns">
              @for (columnId of groupByColumns; track columnId; let i = $index) {
                <div class="group-column-chip" cdkDrag>
                  <div class="chip-content">
                    <span class="group-level">{{ i + 1 }}</span>
                    <span class="column-name">{{ getColumnName(columnId) }}</span>
                    <button 
                      type="button" 
                      class="remove-btn"
                      (click)="removeGroupColumn(columnId)"
                      title="Remove from grouping">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div class="drag-handle" cdkDragHandle>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z"/>
                    </svg>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
      
      <!-- Available Columns Section -->
      <div class="grouping-section">
        <div class="section-header">
          <h4>Available Columns</h4>
        </div>
        
        <div class="available-columns" 
             cdkDropList 
             [cdkDropListData]="availableColumns"
             [cdkDropListConnectedTo]="dropListIds"
             (cdkDropListDropped)="onAvailableColumnDrop($event)">
          
          @for (column of availableColumns; track column.id) {
            <div class="available-column" 
                 cdkDrag 
                 [cdkDragData]="column"
                 (click)="addGroupColumn(column.id)">
              <span class="column-name">{{ column.header }}</span>
              <span class="column-type">({{ column.type || 'string' }})</span>
            </div>
          }
          
          @if (availableColumns.length === 0) {
            <div class="no-columns">All columns are being used for grouping</div>
          }
        </div>
      </div>
      
      <!-- Aggregation Section -->
      @if (groupByColumns.length > 0) {
        <div class="grouping-section">
          <div class="section-header">
            <h4>Aggregations</h4>
            <button 
              type="button" 
              class="btn btn-link btn-sm"
              (click)="toggleAggregationPanel()"
              [class.active]="showAggregations()">
              {{ showAggregations() ? 'Hide' : 'Show' }} Settings
            </button>
          </div>
          
          @if (showAggregations()) {
            <div class="aggregation-panel">
              @for (column of numericColumns; track column.id) {
                <div class="aggregation-column">
                  <div class="column-header">
                    <span class="column-name">{{ column.header }}</span>
                    <span class="column-type">({{ column.type }})</span>
                  </div>
                  
                  <div class="aggregation-functions">
                    @for (aggFunction of availableAggregations; track aggFunction) {
                      <label class="aggregation-checkbox">
                        <input 
                          type="checkbox" 
                          [checked]="isAggregationEnabled(column.id, aggFunction)"
                          (change)="toggleAggregation(column.id, aggFunction, $event)">
                        <span class="function-name">{{ getAggregationLabel(aggFunction) }}</span>
                      </label>
                    }
                  </div>
                </div>
              }
              
              @if (numericColumns.length === 0) {
                <div class="no-aggregations">
                  No numeric columns available for aggregation
                </div>
              }
            </div>
          }
        </div>
      }
      
      <!-- Group Controls -->
      @if (groupByColumns.length > 0) {
        <div class="grouping-section">
          <div class="section-header">
            <h4>Group Controls</h4>
          </div>
          
          <div class="group-controls">
            <button 
              type="button" 
              class="btn btn-secondary btn-sm"
              (click)="expandAllGroups()">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7,14L12,9L17,14H7Z"/>
              </svg>
              Expand All
            </button>
            
            <button 
              type="button" 
              class="btn btn-secondary btn-sm"
              (click)="collapseAllGroups()">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7,10L12,15L17,10H7Z"/>
              </svg>
              Collapse All
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './grouping-toolbar.component.scss'
})
export class GroupingToolbarComponent {
  @Input() columns: ColumnDefinition[] = [];
  @Input() groupByColumns: string[] = [];
  @Input() aggregations: { [columnId: string]: AggregationConfig[] } = {};
  
  @Output() groupByColumnsChange = new EventEmitter<string[]>();
  @Output() aggregationsChange = new EventEmitter<{ [columnId: string]: AggregationConfig[] }>();
  @Output() expandAllRequested = new EventEmitter<void>();
  @Output() collapseAllRequested = new EventEmitter<void>();
  
  readonly showAggregations = signal(false);
  
  readonly availableAggregations: AggregationFunction[] = ['sum', 'avg', 'count', 'min', 'max'];
  
  get dropListIds(): string[] {
    return ['available-columns', 'group-columns'];
  }
  
  get availableColumns(): ColumnDefinition[] {
    const groupedIds = new Set(this.groupByColumns);
    return this.columns.filter(col => !groupedIds.has(col.id) && col.visible !== false);
  }
  
  get numericColumns(): ColumnDefinition[] {
    return this.columns.filter(col => 
      (col.type === 'number' || col.type === 'date') && col.visible !== false
    );
  }
  
  /**
   * Get column name by ID
   */
  getColumnName(columnId: string): string {
    const column = this.columns.find(col => col.id === columnId);
    return column?.header || columnId;
  }
  
  /**
   * Add column to grouping
   */
  addGroupColumn(columnId: string): void {
    if (!this.groupByColumns.includes(columnId)) {
      this.groupByColumnsChange.emit([...this.groupByColumns, columnId]);
    }
  }
  
  /**
   * Remove column from grouping
   */
  removeGroupColumn(columnId: string): void {
    const newColumns = this.groupByColumns.filter(id => id !== columnId);
    this.groupByColumnsChange.emit(newColumns);
  }
  
  /**
   * Clear all grouping
   */
  clearAllGrouping(): void {
    this.groupByColumnsChange.emit([]);
  }
  
  /**
   * Handle group column drop (reordering)
   */
  onGroupColumnDrop(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      // Reorder within group columns
      const newColumns = [...this.groupByColumns];
      moveItemInArray(newColumns, event.previousIndex, event.currentIndex);
      this.groupByColumnsChange.emit(newColumns);
    }
  }
  
  /**
   * Handle available column drop
   */
  onAvailableColumnDrop(event: CdkDragDrop<ColumnDefinition[]>): void {
    if (event.previousContainer !== event.container) {
      // Add to grouping
      const column = event.item.data as ColumnDefinition;
      this.addGroupColumn(column.id);
    }
  }
  
  /**
   * Toggle aggregation panel
   */
  toggleAggregationPanel(): void {
    this.showAggregations.update(show => !show);
  }
  
  /**
   * Check if aggregation is enabled
   */
  isAggregationEnabled(columnId: string, aggFunction: AggregationFunction): boolean {
    const columnAggs = this.aggregations[columnId] || [];
    return columnAggs.some(agg => agg.function === aggFunction);
  }
  
  /**
   * Toggle aggregation for a column
   */
  toggleAggregation(columnId: string, aggFunction: AggregationFunction, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const newAggregations = { ...this.aggregations };
    
    if (!newAggregations[columnId]) {
      newAggregations[columnId] = [];
    }
    
    if (checked) {
      // Add aggregation
      const aggConfig: AggregationConfig = {
        function: aggFunction,
        label: this.getAggregationLabel(aggFunction)
      };
      newAggregations[columnId] = [...newAggregations[columnId], aggConfig];
    } else {
      // Remove aggregation
      newAggregations[columnId] = newAggregations[columnId].filter(
        agg => agg.function !== aggFunction
      );
      
      // Remove empty arrays
      if (newAggregations[columnId].length === 0) {
        delete newAggregations[columnId];
      }
    }
    
    this.aggregationsChange.emit(newAggregations);
  }
  
  /**
   * Get aggregation function label
   */
  getAggregationLabel(aggFunction: AggregationFunction): string {
    switch (aggFunction) {
      case 'sum': return 'Sum';
      case 'avg': return 'Average';
      case 'count': return 'Count';
      case 'min': return 'Minimum';
      case 'max': return 'Maximum';
      default: return aggFunction;
    }
  }
  
  /**
   * Expand all groups
   */
  expandAllGroups(): void {
    this.expandAllRequested.emit();
  }
  
  /**
   * Collapse all groups
   */
  collapseAllGroups(): void {
    this.collapseAllRequested.emit();
  }
}