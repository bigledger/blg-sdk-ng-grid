import { Injectable, signal, computed } from '@angular/core';
import { 
  GroupedRow, 
  GroupInfo, 
  GroupingState, 
  AggregationConfig, 
  AggregationFunction,
  GroupSortConfig 
} from '../interfaces/grouping.interface';
import { ColumnDefinition } from '../interfaces/column-definition.interface';

/**
 * Service for managing row grouping functionality
 */
@Injectable({
  providedIn: 'root'
})
export class GroupingService {
  private _groupingState = signal<GroupingState>({
    groupByColumns: [],
    expandedGroups: new Set<string>(),
    aggregations: {},
    groupSorting: []
  });

  /**
   * Current grouping state
   */
  readonly groupingState = computed(() => this._groupingState());

  /**
   * Whether grouping is active
   */
  readonly isGrouped = computed(() => this._groupingState().groupByColumns.length > 0);

  /**
   * Set columns to group by
   */
  setGroupByColumns(columnIds: string[]): void {
    this._groupingState.update(state => ({
      ...state,
      groupByColumns: columnIds,
      expandedGroups: new Set() // Reset expanded groups when changing grouping
    }));
  }

  /**
   * Add a column to the grouping
   */
  addGroupByColumn(columnId: string): void {
    const currentColumns = this._groupingState().groupByColumns;
    if (!currentColumns.includes(columnId)) {
      this.setGroupByColumns([...currentColumns, columnId]);
    }
  }

  /**
   * Remove a column from grouping
   */
  removeGroupByColumn(columnId: string): void {
    const currentColumns = this._groupingState().groupByColumns;
    this.setGroupByColumns(currentColumns.filter(id => id !== columnId));
  }

  /**
   * Clear all grouping
   */
  clearGrouping(): void {
    this.setGroupByColumns([]);
  }

  /**
   * Toggle group expansion
   */
  toggleGroup(groupId: string): void {
    this._groupingState.update(state => {
      const expandedGroups = new Set(state.expandedGroups);
      if (expandedGroups.has(groupId)) {
        expandedGroups.delete(groupId);
      } else {
        expandedGroups.add(groupId);
      }
      return {
        ...state,
        expandedGroups
      };
    });
  }

  /**
   * Expand all groups
   */
  expandAllGroups(groupedData: GroupedRow[]): void {
    const expandedGroups = new Set<string>();
    this.collectGroupIds(groupedData, expandedGroups);
    
    this._groupingState.update(state => ({
      ...state,
      expandedGroups
    }));
  }

  /**
   * Collapse all groups
   */
  collapseAllGroups(): void {
    this._groupingState.update(state => ({
      ...state,
      expandedGroups: new Set()
    }));
  }

  /**
   * Set aggregation configurations for columns
   */
  setAggregations(aggregations: { [columnId: string]: AggregationConfig[] }): void {
    this._groupingState.update(state => ({
      ...state,
      aggregations
    }));
  }

  /**
   * Add aggregation for a column
   */
  addAggregation(columnId: string, aggregation: AggregationConfig): void {
    this._groupingState.update(state => {
      const columnAggregations = state.aggregations[columnId] || [];
      return {
        ...state,
        aggregations: {
          ...state.aggregations,
          [columnId]: [...columnAggregations, aggregation]
        }
      };
    });
  }

  /**
   * Remove aggregation for a column
   */
  removeAggregation(columnId: string, functionType: AggregationFunction): void {
    this._groupingState.update(state => {
      const columnAggregations = state.aggregations[columnId] || [];
      return {
        ...state,
        aggregations: {
          ...state.aggregations,
          [columnId]: columnAggregations.filter(agg => agg.function !== functionType)
        }
      };
    });
  }

  /**
   * Set group sorting configurations
   */
  setGroupSorting(sortConfigs: GroupSortConfig[]): void {
    this._groupingState.update(state => ({
      ...state,
      groupSorting: sortConfigs
    }));
  }

  /**
   * Group data by the specified columns
   */
  groupData(data: any[], columns: ColumnDefinition[]): GroupedRow[] {
    const groupByColumns = this._groupingState().groupByColumns;
    
    if (groupByColumns.length === 0) {
      // Return data rows without grouping
      return data.map((item) => ({
        type: 'data',
        data: item,
        level: 0
      }));
    }

    return this.createGroupedRows(data, columns, groupByColumns, 0);
  }

  /**
   * Create grouped rows recursively
   */
  private createGroupedRows(
    data: any[], 
    columns: ColumnDefinition[], 
    groupByColumns: string[], 
    level: number
  ): GroupedRow[] {
    if (groupByColumns.length === 0) {
      // Base case: return data rows
      return data.map(item => ({
        type: 'data',
        data: item,
        level: level
      }));
    }

    const [currentGroupColumn, ...remainingGroupColumns] = groupByColumns;
    const column = columns.find(col => col.id === currentGroupColumn);
    
    if (!column) {
      // If column not found, skip this grouping level
      return this.createGroupedRows(data, columns, remainingGroupColumns, level);
    }

    // Group data by the current column
    const groupMap = new Map<any, any[]>();
    
    data.forEach(item => {
      const value = item[column.field];
      const key = value === null || value === undefined ? 'null' : value;
      
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(item);
    });

    // Sort groups if configured
    const sortedGroups = this.sortGroups(Array.from(groupMap.entries()), currentGroupColumn, columns);
    
    const result: GroupedRow[] = [];
    const expandedGroups = this._groupingState().expandedGroups;

    sortedGroups.forEach(([groupValue, groupData]) => {
      const groupId = this.generateGroupId(currentGroupColumn, groupValue, level);
      const displayValue = this.formatGroupValue(groupValue, column);
      
      // Create group info
      const groupInfo: GroupInfo = {
        id: groupId,
        columnId: currentGroupColumn,
        displayValue,
        rawValue: groupValue,
        count: groupData.length,
        children: [],
        aggregations: this.calculateAggregations(groupData, columns),
        expanded: expandedGroups.has(groupId),
        level
      };

      // Create group header row
      const groupRow: GroupedRow = {
        type: 'group',
        group: groupInfo,
        level,
        expanded: groupInfo.expanded
      };

      result.push(groupRow);

      // If group is expanded, add child rows
      if (groupInfo.expanded) {
        if (remainingGroupColumns.length > 0) {
          // Recursively create nested groups
          const childRows = this.createGroupedRows(
            groupData, 
            columns, 
            remainingGroupColumns, 
            level + 1
          );
          result.push(...childRows);
        } else {
          // Add data rows
          const dataRows = groupData.map(item => ({
            type: 'data' as const,
            data: item,
            level: level + 1,
            parentGroupId: groupId
          }));
          result.push(...dataRows);
        }
      }
    });

    return result;
  }

  /**
   * Calculate aggregations for a group
   */
  private calculateAggregations(data: any[], columns: ColumnDefinition[]): { [columnId: string]: { [functionName: string]: any } } {
    const aggregations = this._groupingState().aggregations;
    const result: { [columnId: string]: { [functionName: string]: any } } = {};

    Object.entries(aggregations).forEach(([columnId, aggConfigs]) => {
      const column = columns.find(col => col.id === columnId);
      if (!column) return;

      result[columnId] = {};

      aggConfigs.forEach(aggConfig => {
        const values = data.map(item => item[column.field]).filter(val => val !== null && val !== undefined);
        
        let aggregatedValue: any;
        
        switch (aggConfig.function) {
          case 'sum':
            aggregatedValue = values.reduce((sum, val) => sum + Number(val || 0), 0);
            break;
          case 'avg':
            aggregatedValue = values.length > 0 ? 
              values.reduce((sum, val) => sum + Number(val || 0), 0) / values.length : 0;
            break;
          case 'count':
            aggregatedValue = data.length;
            break;
          case 'min':
            aggregatedValue = values.length > 0 ? Math.min(...values.map(v => Number(v || 0))) : null;
            break;
          case 'max':
            aggregatedValue = values.length > 0 ? Math.max(...values.map(v => Number(v || 0))) : null;
            break;
          case 'custom':
            aggregatedValue = aggConfig.customFunction ? aggConfig.customFunction(values) : null;
            break;
          default:
            aggregatedValue = null;
        }

        result[columnId][aggConfig.function] = aggregatedValue;
      });
    });

    return result;
  }

  /**
   * Sort groups based on configuration
   */
  private sortGroups(
    groups: [any, any[]][], 
    groupColumnId: string, 
    columns: ColumnDefinition[]
  ): [any, any[]][] {
    const sortConfigs = this._groupingState().groupSorting.filter(
      config => config.columnId === groupColumnId
    );

    if (sortConfigs.length === 0) {
      return groups;
    }

    return groups.sort((a, b) => {
      for (const sortConfig of sortConfigs) {
        let aValue: any;
        let bValue: any;

        if (sortConfig.sortByAggregation && sortConfig.aggregationFunction) {
          // Sort by aggregated value
          const aAggregations = this.calculateAggregations(a[1], columns);
          const bAggregations = this.calculateAggregations(b[1], columns);
          
          aValue = aAggregations[sortConfig.columnId]?.[sortConfig.aggregationFunction];
          bValue = bAggregations[sortConfig.columnId]?.[sortConfig.aggregationFunction];
        } else {
          // Sort by group value
          aValue = a[0];
          bValue = b[0];
        }

        let result = 0;
        if (aValue < bValue) result = -1;
        else if (aValue > bValue) result = 1;

        if (result !== 0) {
          return sortConfig.direction === 'desc' ? -result : result;
        }
      }
      return 0;
    });
  }

  /**
   * Generate unique group ID
   */
  private generateGroupId(columnId: string, value: any, level: number): string {
    return `${columnId}_${level}_${String(value).replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  /**
   * Format group value for display
   */
  private formatGroupValue(value: any, column: ColumnDefinition): string {
    if (value === null || value === undefined) {
      return '(Empty)';
    }

    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      default:
        return String(value);
    }
  }

  /**
   * Recursively collect group IDs from grouped data
   */
  private collectGroupIds(rows: GroupedRow[], groupIds: Set<string>): void {
    rows.forEach(row => {
      if (row.type === 'group' && row.group) {
        groupIds.add(row.group.id);
        if (row.group.children.length > 0) {
          this.collectGroupIds(row.group.children, groupIds);
        }
      }
    });
  }
}