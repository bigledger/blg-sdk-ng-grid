import { TestBed } from '@angular/core/testing';
import { GroupingService } from './grouping.service';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { AggregationConfig } from '../interfaces/grouping.interface';

describe('GroupingService', () => {
  let service: GroupingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Grouping State Management', () => {
    it('should initialize with empty state', () => {
      const state = service.groupingState();
      expect(state.groupByColumns).toEqual([]);
      expect(state.expandedGroups.size).toBe(0);
      expect(state.aggregations).toEqual({});
      expect(state.groupSorting).toEqual([]);
    });

    it('should update group by columns', () => {
      service.setGroupByColumns(['department', 'region']);
      const state = service.groupingState();
      expect(state.groupByColumns).toEqual(['department', 'region']);
    });

    it('should add group by column', () => {
      service.addGroupByColumn('department');
      service.addGroupByColumn('region');
      const state = service.groupingState();
      expect(state.groupByColumns).toEqual(['department', 'region']);
    });

    it('should not duplicate group by columns', () => {
      service.addGroupByColumn('department');
      service.addGroupByColumn('department');
      const state = service.groupingState();
      expect(state.groupByColumns).toEqual(['department']);
    });

    it('should remove group by column', () => {
      service.setGroupByColumns(['department', 'region']);
      service.removeGroupByColumn('department');
      const state = service.groupingState();
      expect(state.groupByColumns).toEqual(['region']);
    });

    it('should clear all grouping', () => {
      service.setGroupByColumns(['department', 'region']);
      service.clearGrouping();
      const state = service.groupingState();
      expect(state.groupByColumns).toEqual([]);
    });
  });

  describe('Group Expansion', () => {
    it('should toggle group expansion', () => {
      const groupId = 'test-group';
      service.toggleGroup(groupId);
      const state = service.groupingState();
      expect(state.expandedGroups.has(groupId)).toBe(true);

      service.toggleGroup(groupId);
      const finalState = service.groupingState();
      expect(finalState.expandedGroups.has(groupId)).toBe(false);
    });

    it('should collapse all groups', () => {
      service.toggleGroup('group1');
      service.toggleGroup('group2');
      service.collapseAllGroups();
      const state = service.groupingState();
      expect(state.expandedGroups.size).toBe(0);
    });
  });

  describe('Aggregations', () => {
    const sampleAggregations: { [key: string]: AggregationConfig[] } = {
      salary: [
        { function: 'sum', label: 'Total Salary' },
        { function: 'avg', label: 'Average Salary' }
      ]
    };

    it('should set aggregations', () => {
      service.setAggregations(sampleAggregations);
      const state = service.groupingState();
      expect(state.aggregations).toEqual(sampleAggregations);
    });

    it('should add aggregation to column', () => {
      const aggregation: AggregationConfig = {
        function: 'sum',
        label: 'Total Salary'
      };
      service.addAggregation('salary', aggregation);
      const state = service.groupingState();
      expect(state.aggregations['salary']).toContain(aggregation);
    });

    it('should remove aggregation from column', () => {
      service.setAggregations(sampleAggregations);
      service.removeAggregation('salary', 'sum');
      const state = service.groupingState();
      expect(state.aggregations['salary'].length).toBe(1);
      expect(state.aggregations['salary'][0].function).toBe('avg');
    });
  });

  describe('Data Grouping', () => {
    const sampleColumns: ColumnDefinition[] = [
      {
        id: 'department',
        field: 'department',
        header: 'Department',
        type: 'string'
      },
      {
        id: 'region',
        field: 'region',
        header: 'Region',
        type: 'string'
      },
      {
        id: 'name',
        field: 'name',
        header: 'Name',
        type: 'string'
      },
      {
        id: 'salary',
        field: 'salary',
        header: 'Salary',
        type: 'number'
      }
    ];

    const sampleData = [
      { department: 'Engineering', region: 'North', name: 'John', salary: 80000 },
      { department: 'Engineering', region: 'North', name: 'Jane', salary: 85000 },
      { department: 'Sales', region: 'South', name: 'Bob', salary: 70000 },
      { department: 'Sales', region: 'South', name: 'Alice', salary: 75000 }
    ];

    it('should return flat data when no grouping is set', () => {
      const result = service.groupData(sampleData, sampleColumns);
      expect(result).toHaveLength(4);
      expect(result.every(row => row.type === 'data')).toBe(true);
    });

    it('should group data by single column', () => {
      service.setGroupByColumns(['department']);
      
      const result = service.groupData(sampleData, sampleColumns);
      
      // Should have group headers
      const groupRows = result.filter(row => row.type === 'group');
      expect(groupRows).toHaveLength(2);
      
      // Group headers should have correct display values
      expect(groupRows.find(g => g.group?.rawValue === 'Engineering')).toBeTruthy();
      expect(groupRows.find(g => g.group?.rawValue === 'Sales')).toBeTruthy();
    });

    it('should group data by multiple columns', () => {
      service.setGroupByColumns(['department', 'region']);
      const result = service.groupData(sampleData, sampleColumns);
      
      // Should have department groups
      const departmentGroups = result.filter(row => row.type === 'group' && row.level === 0);
      expect(departmentGroups).toHaveLength(2);
    });

  });

  describe('isGrouped computed', () => {
    it('should return false when no columns are grouped', () => {
      expect(service.isGrouped()).toBe(false);
    });

    it('should return true when columns are grouped', () => {
      service.setGroupByColumns(['department']);
      expect(service.isGrouped()).toBe(true);
    });
  });
});