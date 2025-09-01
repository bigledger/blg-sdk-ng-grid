import { ColumnDefinition } from '@blg/core';
import {
  ColumnGroupDefinition,
  ColumnGroupTemplate,
  ColumnGroupState
} from '../interfaces/column-group.interface';

/**
 * Utility functions for Column Group operations
 * Provides helper functions for creating, validating, and manipulating column groups
 */

/**
 * Creates a column group from a template with variable substitution
 */
export function createColumnGroupFromTemplate(
  template: ColumnGroupTemplate,
  columns: ColumnDefinition[],
  variables: { [key: string]: any } = {}
): ColumnGroupDefinition[] {
  return template.groups.map(group => {
    const processedGroup = JSON.parse(JSON.stringify(group));
    
    // Apply variable substitution
    return substituteVariables(processedGroup, variables, columns);
  });
}

/**
 * Validates a column group definition for correctness
 */
export function validateColumnGroup(
  group: ColumnGroupDefinition,
  availableColumns: ColumnDefinition[] = []
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (!group.id || group.id.trim() === '') {
    errors.push('Group ID is required');
  }

  if (!group.headerName || group.headerName.trim() === '') {
    errors.push('Group header name is required');
  }

  if (!group.children || group.children.length === 0) {
    warnings.push('Group has no children');
  }

  // ID uniqueness validation
  if (group.children) {
    const ids = new Set<string>();
    const duplicates = new Set<string>();

    const checkIds = (items: (ColumnDefinition | ColumnGroupDefinition)[]) => {
      items.forEach(item => {
        if (ids.has(item.id)) {
          duplicates.add(item.id);
        } else {
          ids.add(item.id);
        }

        if ('children' in item && item.children) {
          checkIds(item.children as any[]);
        }
      });
    };

    checkIds(group.children as any[]);

    if (duplicates.size > 0) {
      errors.push(`Duplicate IDs found: ${Array.from(duplicates).join(', ')}`);
    }
  }

  // Nesting depth validation
  const maxDepth = calculateGroupDepth(group);
  if (maxDepth > 10) {
    warnings.push(`Group nesting depth (${maxDepth}) exceeds recommended limit of 10`);
  }

  // Column reference validation
  if (availableColumns.length > 0) {
    const invalidColumns = findInvalidColumnReferences(group, availableColumns);
    if (invalidColumns.length > 0) {
      errors.push(`Invalid column references: ${invalidColumns.join(', ')}`);
    }
  }

  // Performance validation
  const columnCount = countColumns(group);
  if (columnCount > 1000) {
    warnings.push(`Large number of columns (${columnCount}) may impact performance`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      maxDepth,
      columnCount,
      groupCount: countGroups(group)
    }
  };
}

/**
 * Merges multiple column groups into a hierarchical structure
 */
export function mergeColumnGroups(
  groups: ColumnGroupDefinition[],
  strategy: 'preserve' | 'merge' | 'flatten' = 'preserve'
): ColumnGroupDefinition[] {
  switch (strategy) {
    case 'preserve':
      return mergeWithPreservation(groups);
    case 'merge':
      return mergeWithCombination(groups);
    case 'flatten':
      return flattenAndMerge(groups);
    default:
      return groups;
  }
}

/**
 * Extracts all columns from a group hierarchy
 */
export function extractColumnsFromGroup(group: ColumnGroupDefinition): ColumnDefinition[] {
  const columns: ColumnDefinition[] = [];

  const extractRecursive = (items: (ColumnDefinition | ColumnGroupDefinition)[]) => {
    items.forEach(item => {
      if ('children' in item) {
        // It's a group, recurse into children
        if (item.children) {
          extractRecursive(item.children as any[]);
        }
      } else {
        // It's a column
        columns.push(item as ColumnDefinition);
      }
    });
  };

  if (group.children) {
    extractRecursive(group.children as any[]);
  }

  return columns;
}

/**
 * Finds all groups matching a predicate
 */
export function findGroups(
  groups: ColumnGroupDefinition[],
  predicate: (group: ColumnGroupDefinition) => boolean
): ColumnGroupDefinition[] {
  const matches: ColumnGroupDefinition[] = [];

  const searchRecursive = (groupList: ColumnGroupDefinition[]) => {
    groupList.forEach(group => {
      if (predicate(group)) {
        matches.push(group);
      }

      if (group.children) {
        const childGroups = group.children.filter(child => 'children' in child) as ColumnGroupDefinition[];
        searchRecursive(childGroups);
      }
    });
  };

  searchRecursive(groups);
  return matches;
}

/**
 * Creates a flattened representation of group hierarchy
 */
export function flattenGroupHierarchy(groups: ColumnGroupDefinition[]): FlatGroupNode[] {
  const flattened: FlatGroupNode[] = [];

  const flatten = (groupList: ColumnGroupDefinition[], level: number = 0, parentId?: string) => {
    groupList.forEach(group => {
      flattened.push({
        id: group.id,
        headerName: group.headerName,
        level,
        parentId,
        hasChildren: Boolean(group.children && group.children.length > 0),
        columnCount: countColumns(group),
        group: group
      });

      if (group.children) {
        const childGroups = group.children.filter(child => 'children' in child) as ColumnGroupDefinition[];
        flatten(childGroups, level + 1, group.id);
      }
    });
  };

  flatten(groups);
  return flattened;
}

/**
 * Rebuilds hierarchy from flattened representation
 */
export function rebuildGroupHierarchy(flatNodes: FlatGroupNode[]): ColumnGroupDefinition[] {
  const nodeMap = new Map<string, FlatGroupNode>();
  const rootNodes: FlatGroupNode[] = [];

  // Build node map and identify root nodes
  flatNodes.forEach(node => {
    nodeMap.set(node.id, node);
    if (!node.parentId) {
      rootNodes.push(node);
    }
  });

  // Build hierarchy
  const buildChildren = (parentNode: FlatGroupNode): ColumnGroupDefinition => {
    const group = { ...parentNode.group };
    
    // Find children
    const children = flatNodes.filter(node => node.parentId === parentNode.id);
    if (children.length > 0) {
      group.children = children.map(child => buildChildren(child));
    }

    return group;
  };

  return rootNodes.map(root => buildChildren(root));
}

/**
 * Optimizes group structure for performance
 */
export function optimizeGroupStructure(groups: ColumnGroupDefinition[]): OptimizationResult {
  const optimizations: OptimizationAction[] = [];
  const optimizedGroups = JSON.parse(JSON.stringify(groups));

  // Remove empty groups
  const emptyGroupsRemoved = removeEmptyGroups(optimizedGroups);
  if (emptyGroupsRemoved > 0) {
    optimizations.push({
      type: 'remove_empty_groups',
      description: `Removed ${emptyGroupsRemoved} empty groups`,
      impact: 'performance'
    });
  }

  // Flatten single-child groups
  const singleChildGroupsFlattened = flattenSingleChildGroups(optimizedGroups);
  if (singleChildGroupsFlattened > 0) {
    optimizations.push({
      type: 'flatten_single_child',
      description: `Flattened ${singleChildGroupsFlattened} single-child groups`,
      impact: 'usability'
    });
  }

  // Merge similar groups
  const similarGroupsMerged = mergeSimilarGroups(optimizedGroups);
  if (similarGroupsMerged > 0) {
    optimizations.push({
      type: 'merge_similar',
      description: `Merged ${similarGroupsMerged} similar groups`,
      impact: 'organization'
    });
  }

  return {
    original: groups,
    optimized: optimizedGroups,
    optimizations,
    metrics: {
      originalGroupCount: countAllGroups(groups),
      optimizedGroupCount: countAllGroups(optimizedGroups),
      performanceImprovement: estimatePerformanceImprovement(groups, optimizedGroups)
    }
  };
}

/**
 * Converts group state to/from serializable format
 */
export function serializeGroupState(
  groups: ColumnGroupDefinition[],
  collapsedStates: { [groupId: string]: boolean } = {},
  visibilityStates: { [groupId: string]: boolean } = {}
): ColumnGroupState {
  return {
    collapsedStates,
    order: groups.map(g => g.id),
    visibility: visibilityStates,
    customizations: {},
    version: '1.0.0',
    timestamp: Date.now()
  };
}

/**
 * Deserializes group state from stored format
 */
export function deserializeGroupState(
  serializedState: ColumnGroupState,
  groups: ColumnGroupDefinition[]
): {
  collapsedStates: { [groupId: string]: boolean };
  visibilityStates: { [groupId: string]: boolean };
  groupOrder: string[];
} {
  // Validate state version compatibility
  if (serializedState.version !== '1.0.0') {
    console.warn(`State version ${serializedState.version} may not be compatible`);
  }

  // Filter out states for non-existent groups
  const existingGroupIds = new Set(getAllGroupIds(groups));
  
  const collapsedStates = Object.fromEntries(
    Object.entries(serializedState.collapsedStates)
      .filter(([id]) => existingGroupIds.has(id))
  );

  const visibilityStates = Object.fromEntries(
    Object.entries(serializedState.visibility)
      .filter(([id]) => existingGroupIds.has(id))
  );

  const groupOrder = serializedState.order.filter(id => existingGroupIds.has(id));

  return {
    collapsedStates,
    visibilityStates,
    groupOrder
  };
}

/**
 * Generates accessibility attributes for a group
 */
export function generateAccessibilityAttributes(
  group: ColumnGroupDefinition,
  level: number,
  expanded: boolean
): AccessibilityAttributes {
  return {
    role: 'columnheader',
    'aria-level': level + 1,
    'aria-expanded': group.collapsible ? expanded : undefined,
    'aria-label': group.headerName,
    'aria-describedby': group.headerTooltip ? `${group.id}-tooltip` : undefined,
    'tabindex': group.collapsible ? 0 : -1,
    'aria-controls': expanded ? `${group.id}-content` : undefined
  };
}

/**
 * Calculates performance metrics for group structure
 */
export function calculateGroupMetrics(groups: ColumnGroupDefinition[]): GroupMetrics {
  let totalGroups = 0;
  let totalColumns = 0;
  let maxDepth = 0;
  let avgGroupSize = 0;
  let leafGroups = 0;

  const calculate = (groupList: ColumnGroupDefinition[], depth: number = 0) => {
    maxDepth = Math.max(maxDepth, depth);

    groupList.forEach(group => {
      totalGroups++;
      
      if (group.children) {
        const childColumns = group.children.filter(child => !('children' in child));
        const childGroups = group.children.filter(child => 'children' in child) as ColumnGroupDefinition[];
        
        totalColumns += childColumns.length;
        
        if (childGroups.length === 0) {
          leafGroups++;
        } else {
          calculate(childGroups, depth + 1);
        }
      } else {
        leafGroups++;
      }
    });
  };

  calculate(groups);

  avgGroupSize = totalGroups > 0 ? totalColumns / totalGroups : 0;

  return {
    totalGroups,
    totalColumns,
    maxDepth,
    avgGroupSize: Math.round(avgGroupSize * 100) / 100,
    leafGroups,
    branchingFactor: totalGroups > 0 ? leafGroups / totalGroups : 0,
    complexity: calculateComplexityScore(totalGroups, maxDepth, avgGroupSize)
  };
}

// ========================================
// Helper Functions
// ========================================

function substituteVariables(
  obj: any,
  variables: { [key: string]: any },
  columns: ColumnDefinition[]
): any {
  if (typeof obj === 'string') {
    return obj.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }
  
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map(item => substituteVariables(item, variables, columns));
    } else {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = substituteVariables(value, variables, columns);
      }
      return result;
    }
  }
  
  return obj;
}

function calculateGroupDepth(group: ColumnGroupDefinition): number {
  if (!group.children) return 1;
  
  const childGroups = group.children.filter(child => 'children' in child) as ColumnGroupDefinition[];
  if (childGroups.length === 0) return 1;
  
  return 1 + Math.max(...childGroups.map(child => calculateGroupDepth(child)));
}

function countColumns(group: ColumnGroupDefinition): number {
  if (!group.children) return 0;
  
  let count = 0;
  group.children.forEach(child => {
    if ('children' in child) {
      count += countColumns(child as ColumnGroupDefinition);
    } else {
      count += 1;
    }
  });
  
  return count;
}

function countGroups(group: ColumnGroupDefinition): number {
  if (!group.children) return 1;
  
  let count = 1;
  const childGroups = group.children.filter(child => 'children' in child) as ColumnGroupDefinition[];
  childGroups.forEach(child => {
    count += countGroups(child);
  });
  
  return count;
}

function findInvalidColumnReferences(
  group: ColumnGroupDefinition,
  availableColumns: ColumnDefinition[]
): string[] {
  const availableIds = new Set(availableColumns.map(c => c.id));
  const invalid: string[] = [];

  const checkReferences = (items: (ColumnDefinition | ColumnGroupDefinition)[]) => {
    items.forEach(item => {
      if ('children' in item) {
        if (item.children) {
          checkReferences(item.children as any[]);
        }
      } else {
        if (!availableIds.has(item.id)) {
          invalid.push(item.id);
        }
      }
    });
  };

  if (group.children) {
    checkReferences(group.children as any[]);
  }

  return invalid;
}

function mergeWithPreservation(groups: ColumnGroupDefinition[]): ColumnGroupDefinition[] {
  // Simple preservation merge - just return as-is
  return groups;
}

function mergeWithCombination(groups: ColumnGroupDefinition[]): ColumnGroupDefinition[] {
  // Combine similar groups based on header names
  const groupMap = new Map<string, ColumnGroupDefinition>();
  
  groups.forEach(group => {
    const existing = groupMap.get(group.headerName);
    if (existing && existing.children && group.children) {
      existing.children.push(...group.children as any[]);
    } else {
      groupMap.set(group.headerName, { ...group });
    }
  });
  
  return Array.from(groupMap.values());
}

function flattenAndMerge(groups: ColumnGroupDefinition[]): ColumnGroupDefinition[] {
  // Flatten all groups into a single level
  const allColumns: ColumnDefinition[] = [];
  
  groups.forEach(group => {
    allColumns.push(...extractColumnsFromGroup(group));
  });
  
  return [{
    id: 'merged-group',
    headerName: 'All Columns',
    children: allColumns
  }];
}

function removeEmptyGroups(groups: ColumnGroupDefinition[]): number {
  let removed = 0;
  
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (!group.children || group.children.length === 0) {
      groups.splice(i, 1);
      removed++;
    }
  }
  
  return removed;
}

function flattenSingleChildGroups(groups: ColumnGroupDefinition[]): number {
  // Implementation would flatten groups with single children
  return 0; // Stub
}

function mergeSimilarGroups(groups: ColumnGroupDefinition[]): number {
  // Implementation would merge groups with similar characteristics
  return 0; // Stub
}

function countAllGroups(groups: ColumnGroupDefinition[]): number {
  return groups.reduce((count, group) => count + countGroups(group), 0);
}

function estimatePerformanceImprovement(
  original: ColumnGroupDefinition[],
  optimized: ColumnGroupDefinition[]
): number {
  const originalComplexity = countAllGroups(original);
  const optimizedComplexity = countAllGroups(optimized);
  return ((originalComplexity - optimizedComplexity) / originalComplexity) * 100;
}

function getAllGroupIds(groups: ColumnGroupDefinition[]): string[] {
  const ids: string[] = [];
  
  const collectIds = (groupList: ColumnGroupDefinition[]) => {
    groupList.forEach(group => {
      ids.push(group.id);
      if (group.children) {
        const childGroups = group.children.filter(child => 'children' in child) as ColumnGroupDefinition[];
        collectIds(childGroups);
      }
    });
  };
  
  collectIds(groups);
  return ids;
}

function calculateComplexityScore(
  totalGroups: number,
  maxDepth: number,
  avgGroupSize: number
): number {
  // Simple complexity calculation
  return Math.log(totalGroups) * maxDepth * (avgGroupSize / 10);
}

// ========================================
// Supporting Interfaces
// ========================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    maxDepth: number;
    columnCount: number;
    groupCount: number;
  };
}

export interface FlatGroupNode {
  id: string;
  headerName: string;
  level: number;
  parentId?: string;
  hasChildren: boolean;
  columnCount: number;
  group: ColumnGroupDefinition;
}

export interface OptimizationResult {
  original: ColumnGroupDefinition[];
  optimized: ColumnGroupDefinition[];
  optimizations: OptimizationAction[];
  metrics: {
    originalGroupCount: number;
    optimizedGroupCount: number;
    performanceImprovement: number;
  };
}

export interface OptimizationAction {
  type: string;
  description: string;
  impact: 'performance' | 'usability' | 'organization';
}

export interface AccessibilityAttributes {
  role: string;
  'aria-level': number;
  'aria-expanded'?: boolean;
  'aria-label': string;
  'aria-describedby'?: string;
  'tabindex': number;
  'aria-controls'?: string;
}

export interface GroupMetrics {
  totalGroups: number;
  totalColumns: number;
  maxDepth: number;
  avgGroupSize: number;
  leafGroups: number;
  branchingFactor: number;
  complexity: number;
}