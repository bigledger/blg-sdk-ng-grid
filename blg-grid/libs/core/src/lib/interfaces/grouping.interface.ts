/**
 * Represents a grouped row in the grid
 */
export interface GroupedRow {
  /**
   * Type of row - either a group header or a regular data row
   */
  type: 'group' | 'data';
  
  /**
   * Original row data (null for group headers)
   */
  data?: any;
  
  /**
   * Group information (null for data rows)
   */
  group?: GroupInfo;
  
  /**
   * Nesting level for hierarchical groups
   */
  level: number;
  
  /**
   * Whether this group is expanded (only relevant for group rows)
   */
  expanded?: boolean;
  
  /**
   * Parent group ID for nested groups
   */
  parentGroupId?: string;
}

/**
 * Information about a group
 */
export interface GroupInfo {
  /**
   * Unique identifier for the group
   */
  id: string;
  
  /**
   * Column ID that this group is based on
   */
  columnId: string;
  
  /**
   * Display value for the group
   */
  displayValue: string;
  
  /**
   * Raw value used for grouping
   */
  rawValue: any;
  
  /**
   * Number of items in this group
   */
  count: number;
  
  /**
   * Child rows in this group
   */
  children: GroupedRow[];
  
  /**
   * Aggregated values for this group
   */
  aggregations?: { [columnId: string]: { [functionName: string]: any } };
  
  /**
   * Whether this group is expanded
   */
  expanded: boolean;
  
  /**
   * Nesting level
   */
  level: number;
}

/**
 * State for managing grouped data
 */
export interface GroupingState {
  /**
   * Columns currently being grouped by
   */
  groupByColumns: string[];
  
  /**
   * Expanded group IDs
   */
  expandedGroups: Set<string>;
  
  /**
   * Aggregation configurations
   */
  aggregations: { [columnId: string]: AggregationConfig[] };
  
  /**
   * Group sorting configurations
   */
  groupSorting: GroupSortConfig[];
}

/**
 * Configuration for aggregation functions
 */
export interface AggregationConfig {
  /**
   * Aggregation function type
   */
  function: AggregationFunction;
  
  /**
   * Display label for the aggregation
   */
  label?: string;
  
  /**
   * Custom aggregation function (for 'custom' type)
   */
  customFunction?: (values: any[]) => any;
  
  /**
   * Format function for displaying aggregated values
   */
  formatter?: (value: any) => string;
}

/**
 * Group sorting configuration
 */
export interface GroupSortConfig {
  /**
   * Column to sort groups by
   */
  columnId: string;
  
  /**
   * Sort direction
   */
  direction: 'asc' | 'desc';
  
  /**
   * Whether to sort by aggregated value
   */
  sortByAggregation?: boolean;
  
  /**
   * Aggregation function to use for sorting (if sortByAggregation is true)
   */
  aggregationFunction?: AggregationFunction;
}

/**
 * Supported aggregation functions
 */
export type AggregationFunction = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';