# Row Grouping

## Overview

Row grouping allows you to organize data into hierarchical groups based on one or more column values. This feature provides powerful data organization capabilities including collapsible group rows, group aggregations, and custom group rendering.

## Use Cases

- Group sales data by region, product, or time period
- Organize employees by department and role
- Create hierarchical reports with summary data
- Build collapsible data trees
- Implement category-based data views

## Basic Row Grouping

### Simple Column Grouping

```typescript
import { BlgGridComponent } from '@blg/grid';

@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [autoGroupColumnDef]="autoGroupColumnDef"
      [groupDefaultExpanded]="1">
    </blg-grid>
  `
})
export class BasicRowGroupingComponent {
  autoGroupColumnDef = {
    headerName: 'Group',
    width: 200,
    cellRendererParams: { suppressCount: false }
  };

  columnDefs = [
    { field: 'country', headerName: 'Country', rowGroup: true, hide: true },
    { field: 'city', headerName: 'City' },
    { field: 'athlete', headerName: 'Athlete' },
    { field: 'sport', headerName: 'Sport' },
    { field: 'gold', headerName: 'Gold', type: 'numericColumn' },
    { field: 'silver', headerName: 'Silver', type: 'numericColumn' },
    { field: 'bronze', headerName: 'Bronze', type: 'numericColumn' }
  ];

  rowData = [
    { country: 'USA', city: 'New York', athlete: 'Michael Phelps', sport: 'Swimming', gold: 8, silver: 0, bronze: 0 },
    { country: 'USA', city: 'Los Angeles', athlete: 'Katie Ledecky', sport: 'Swimming', gold: 5, silver: 1, bronze: 0 },
    { country: 'UK', city: 'London', athlete: 'Mo Farah', sport: 'Athletics', gold: 2, silver: 0, bronze: 0 },
    { country: 'UK', city: 'Manchester', athlete: 'Jessica Ennis', sport: 'Athletics', gold: 1, silver: 0, bronze: 0 },
    { country: 'Germany', city: 'Berlin', athlete: 'Kristin Otto', sport: 'Swimming', gold: 6, silver: 0, bronze: 0 }
  ];
}
```

### Multi-Level Grouping

```typescript
@Component({
  template: `
    <div class="controls">
      <button (click)="expandAll()">Expand All</button>
      <button (click)="collapseAll()">Collapse All</button>
      <button (click)="toggleGrouping()">Toggle Grouping</button>
    </div>
    <blg-grid 
      #grid
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [autoGroupColumnDef]="autoGroupColumnDef"
      [groupDefaultExpanded]="groupDefaultExpanded"
      (gridReady)="onGridReady($event)">
    </blg-grid>
  `
})
export class MultiLevelGroupingComponent {
  private gridApi!: GridApi;
  private columnApi!: ColumnApi;
  groupDefaultExpanded = 1;

  autoGroupColumnDef = {
    headerName: 'Organization',
    width: 250,
    cellRendererParams: {
      suppressCount: false,
      checkbox: true
    }
  };

  columnDefs = [
    { 
      field: 'department', 
      headerName: 'Department', 
      rowGroup: true, 
      hide: true,
      rowGroupIndex: 0 
    },
    { 
      field: 'team', 
      headerName: 'Team', 
      rowGroup: true, 
      hide: true,
      rowGroupIndex: 1 
    },
    { field: 'employee', headerName: 'Employee' },
    { field: 'role', headerName: 'Role' },
    { field: 'salary', headerName: 'Salary', type: 'numericColumn', aggFunc: 'sum' },
    { field: 'performance', headerName: 'Performance', aggFunc: 'avg' }
  ];

  rowData = [
    { department: 'Engineering', team: 'Frontend', employee: 'John Doe', role: 'Senior Developer', salary: 95000, performance: 4.5 },
    { department: 'Engineering', team: 'Frontend', employee: 'Jane Smith', role: 'Developer', salary: 75000, performance: 4.2 },
    { department: 'Engineering', team: 'Backend', employee: 'Mike Johnson', role: 'Senior Developer', salary: 98000, performance: 4.7 },
    { department: 'Engineering', team: 'Backend', employee: 'Sarah Wilson', role: 'Tech Lead', salary: 115000, performance: 4.8 },
    { department: 'Marketing', team: 'Digital', employee: 'Tom Brown', role: 'Marketing Manager', salary: 85000, performance: 4.1 },
    { department: 'Marketing', team: 'Content', employee: 'Lisa Davis', role: 'Content Writer', salary: 60000, performance: 4.3 }
  ];

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  expandAll(): void {
    this.gridApi.expandAll();
  }

  collapseAll(): void {
    this.gridApi.collapseAll();
  }

  toggleGrouping(): void {
    const groupedColumns = this.columnApi.getRowGroupColumns();
    if (groupedColumns.length > 0) {
      this.columnApi.setRowGroupColumns([]);
    } else {
      this.columnApi.setRowGroupColumns(['department', 'team']);
    }
  }
}
```

## Advanced Grouping Features

### Custom Group Cell Renderer

```typescript
@Component({
  selector: 'app-custom-group-renderer',
  template: `
    <div class="custom-group-cell" [ngClass]="getGroupClass()">
      <button 
        class="expand-button"
        (click)="toggleExpanded()"
        *ngIf="!isLeafGroup">
        <span [ngClass]="{'expanded': expanded, 'collapsed': !expanded}">
          {{ expanded ? '▼' : '▶' }}
        </span>
      </button>
      
      <div class="group-content">
        <div class="group-header">
          <span class="group-icon">{{ getGroupIcon() }}</span>
          <span class="group-title">{{ groupValue }}</span>
          <span class="item-count" *ngIf="showCount">({{ childCount }} items)</span>
        </div>
        
        <div class="group-summary" *ngIf="expanded && showSummary">
          <div class="summary-item" *ngFor="let summary of getSummaryData()">
            <span class="summary-label">{{ summary.label }}:</span>
            <span class="summary-value">{{ summary.value }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-group-cell {
      display: flex;
      align-items: flex-start;
      padding: 8px;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    
    .custom-group-cell.level-0 {
      background: #e3f2fd;
      font-weight: bold;
    }
    
    .custom-group-cell.level-1 {
      background: #f3e5f5;
      padding-left: 24px;
    }
    
    .expand-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0 8px 0 0;
      font-size: 12px;
      color: #666;
    }
    
    .group-content {
      flex: 1;
    }
    
    .group-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .group-icon {
      font-size: 16px;
    }
    
    .group-title {
      font-size: 14px;
      color: #333;
    }
    
    .item-count {
      color: #666;
      font-size: 12px;
    }
    
    .group-summary {
      margin-top: 8px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .summary-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .summary-label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
    }
    
    .summary-value {
      font-size: 12px;
      font-weight: bold;
      color: #333;
    }
  `]
})
export class CustomGroupRendererComponent implements ICellRendererAngularComp {
  groupValue: string = '';
  childCount: number = 0;
  expanded: boolean = false;
  isLeafGroup: boolean = false;
  showCount: boolean = true;
  showSummary: boolean = true;
  groupLevel: number = 0;
  
  private params: any;

  agInit(params: any): void {
    this.params = params;
    this.groupValue = params.value || 'Unknown';
    this.childCount = params.node.allChildrenCount || 0;
    this.expanded = params.node.expanded;
    this.isLeafGroup = params.node.leafGroup;
    this.groupLevel = params.node.level || 0;
  }

  refresh(params: any): boolean {
    this.params = params;
    this.expanded = params.node.expanded;
    return true;
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
    this.params.node.setExpanded(this.expanded);
  }

  getGroupClass(): string {
    return `level-${this.groupLevel}`;
  }

  getGroupIcon(): string {
    const icons = {
      'Engineering': '💻',
      'Marketing': '📈',
      'Sales': '💰',
      'HR': '👥',
      'Frontend': '🎨',
      'Backend': '⚙️',
      'Digital': '📱',
      'Content': '✍️'
    };
    
    return icons[this.groupValue] || '📁';
  }

  getSummaryData(): Array<{label: string, value: string}> {
    const data = [];
    
    if (this.params.node.aggData) {
      const aggData = this.params.node.aggData;
      
      if (aggData.salary) {
        data.push({
          label: 'Total Salary',
          value: `$${aggData.salary.toLocaleString()}`
        });
      }
      
      if (aggData.performance) {
        data.push({
          label: 'Avg Performance',
          value: aggData.performance.toFixed(1)
        });
      }
    }
    
    return data;
  }
}
```

### Dynamic Grouping

```typescript
@Component({
  template: `
    <div class="grouping-controls">
      <div class="control-group">
        <label>Group By:</label>
        <select multiple (change)="onGroupingChanged($event)">
          <option value="department">Department</option>
          <option value="role">Role</option>
          <option value="location">Location</option>
          <option value="experience">Experience Level</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" [(ngModel)]="showAggregations" (change)="updateAggregations()">
          Show Aggregations
        </label>
      </div>
      
      <div class="control-group">
        <button (click)="saveGroupingPreset()">Save Preset</button>
        <button (click)="loadGroupingPreset()">Load Preset</button>
      </div>
    </div>
    
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [autoGroupColumnDef]="autoGroupColumnDef"
      [groupDefaultExpanded]="groupDefaultExpanded">
    </blg-grid>
  `
})
export class DynamicGroupingComponent {
  showAggregations = true;
  groupDefaultExpanded = 1;

  autoGroupColumnDef = {
    headerName: 'Groups',
    width: 250,
    cellRenderer: 'customGroupRenderer'
  };

  frameworkComponents = {
    customGroupRenderer: CustomGroupRendererComponent
  };

  columnDefs = [
    { field: 'department', headerName: 'Department' },
    { field: 'role', headerName: 'Role' },
    { field: 'location', headerName: 'Location' },
    { field: 'experience', headerName: 'Experience' },
    { field: 'name', headerName: 'Name' },
    { 
      field: 'salary', 
      headerName: 'Salary', 
      type: 'numericColumn',
      aggFunc: this.showAggregations ? 'sum' : undefined
    },
    { 
      field: 'bonus', 
      headerName: 'Bonus', 
      type: 'numericColumn',
      aggFunc: this.showAggregations ? 'sum' : undefined
    }
  ];

  onGroupingChanged(event: any): void {
    const selectedOptions = Array.from(event.target.selectedOptions, (option: any) => option.value);
    this.columnApi.setRowGroupColumns(selectedOptions);
    this.saveGroupingState();
  }

  updateAggregations(): void {
    const updatedColumnDefs = this.columnDefs.map(colDef => {
      if (colDef.field === 'salary' || colDef.field === 'bonus') {
        return {
          ...colDef,
          aggFunc: this.showAggregations ? 'sum' : undefined
        };
      }
      return colDef;
    });
    
    this.gridApi.setColumnDefs(updatedColumnDefs);
  }

  saveGroupingPreset(): void {
    const groupingState = {
      groupColumns: this.columnApi.getRowGroupColumns().map(col => col.getColId()),
      expandedState: this.getExpandedGroups(),
      showAggregations: this.showAggregations,
      timestamp: Date.now()
    };
    
    localStorage.setItem('groupingPreset', JSON.stringify(groupingState));
  }

  loadGroupingPreset(): void {
    const saved = localStorage.getItem('groupingPreset');
    if (saved) {
      try {
        const groupingState = JSON.parse(saved);
        this.columnApi.setRowGroupColumns(groupingState.groupColumns);
        this.showAggregations = groupingState.showAggregations;
        this.updateAggregations();
        
        setTimeout(() => {
          this.restoreExpandedGroups(groupingState.expandedState);
        }, 100);
      } catch (error) {
        console.error('Failed to load grouping preset:', error);
      }
    }
  }

  private getExpandedGroups(): string[] {
    const expandedGroups: string[] = [];
    
    this.gridApi.forEachNode(node => {
      if (node.group && node.expanded) {
        expandedGroups.push(this.getGroupKey(node));
      }
    });
    
    return expandedGroups;
  }

  private restoreExpandedGroups(expandedGroups: string[]): void {
    this.gridApi.forEachNode(node => {
      if (node.group) {
        const groupKey = this.getGroupKey(node);
        if (expandedGroups.includes(groupKey)) {
          node.setExpanded(true);
        }
      }
    });
  }

  private getGroupKey(node: any): string {
    return `${node.field}-${node.key}`;
  }

  private saveGroupingState(): void {
    // Auto-save grouping state changes
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveGroupingPreset();
    }, 1000);
  }
}
```

### Aggregation Functions

```typescript
export class CustomAggregationComponent {
  columnDefs = [
    { field: 'category', headerName: 'Category', rowGroup: true, hide: true },
    { field: 'product', headerName: 'Product' },
    { 
      field: 'sales', 
      headerName: 'Sales', 
      type: 'numericColumn',
      aggFunc: 'sum',
      valueFormatter: this.currencyFormatter
    },
    { 
      field: 'profit', 
      headerName: 'Profit', 
      type: 'numericColumn',
      aggFunc: 'sum',
      valueFormatter: this.currencyFormatter
    },
    { 
      field: 'margin', 
      headerName: 'Margin %', 
      type: 'numericColumn',
      aggFunc: this.weightedAverageAggFunc,
      valueFormatter: this.percentFormatter
    },
    { 
      field: 'rating', 
      headerName: 'Rating', 
      type: 'numericColumn',
      aggFunc: 'avg',
      valueFormatter: this.ratingFormatter
    },
    {
      field: 'status',
      headerName: 'Status Count',
      aggFunc: this.statusCountAggFunc
    }
  ];

  // Custom weighted average aggregation
  private weightedAverageAggFunc = (params: any[]): number => {
    let totalValue = 0;
    let totalWeight = 0;
    
    params.forEach(param => {
      if (param.value !== null && param.value !== undefined) {
        const weight = param.data.sales || 1; // Use sales as weight
        totalValue += param.value * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? totalValue / totalWeight : 0;
  };

  // Custom status count aggregation
  private statusCountAggFunc = (params: any[]): string => {
    const statusCounts = {};
    
    params.forEach(param => {
      const status = param.value || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts)
      .map(([status, count]) => `${status}: ${count}`)
      .join(', ');
  };

  // Formatters
  private currencyFormatter = (params: any): string => {
    return params.value ? `$${params.value.toLocaleString()}` : '$0';
  };

  private percentFormatter = (params: any): string => {
    return params.value ? `${params.value.toFixed(1)}%` : '0%';
  };

  private ratingFormatter = (params: any): string => {
    return params.value ? `${params.value.toFixed(1)}★` : 'N/A';
  };

  // Built-in aggregation functions available:
  // 'sum', 'min', 'max', 'count', 'avg', 'first', 'last'
  
  // Custom aggregation function example
  private customAggFunc = {
    'variance': (params: any[]): number => {
      const values = params.map(p => p.value).filter(v => v != null);
      if (values.length < 2) return 0;
      
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      
      return variance;
    },
    
    'median': (params: any[]): number => {
      const values = params.map(p => p.value).filter(v => v != null).sort((a, b) => a - b);
      if (values.length === 0) return 0;
      
      const mid = Math.floor(values.length / 2);
      return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
    }
  };

  onGridReady(params: any): void {
    // Register custom aggregation functions
    params.api.addAggFunc('variance', this.customAggFunc.variance);
    params.api.addAggFunc('median', this.customAggFunc.median);
  }
}
```

## Group Row Interactions

### Interactive Group Rows

```typescript
export class InteractiveGroupRowsComponent {
  autoGroupColumnDef = {
    headerName: 'Groups',
    width: 300,
    cellRenderer: 'interactiveGroupRenderer'
  };

  frameworkComponents = {
    interactiveGroupRenderer: InteractiveGroupRendererComponent
  };

  onCellClicked(event: CellClickedEvent): void {
    if (event.node.group) {
      this.handleGroupRowClick(event);
    }
  }

  onCellContextMenu(event: CellContextMenuEvent): void {
    if (event.node.group) {
      this.showGroupContextMenu(event);
    }
  }

  private handleGroupRowClick(event: CellClickedEvent): void {
    const groupNode = event.node;
    const action = this.determineClickAction(event);

    switch (action) {
      case 'expand':
        groupNode.setExpanded(!groupNode.expanded);
        break;
      case 'select':
        this.selectGroupAndChildren(groupNode);
        break;
      case 'filter':
        this.filterByGroup(groupNode);
        break;
    }
  }

  private showGroupContextMenu(event: CellContextMenuEvent): void {
    const groupNode = event.node;
    const contextMenu = [
      {
        name: groupNode.expanded ? 'Collapse Group' : 'Expand Group',
        action: () => groupNode.setExpanded(!groupNode.expanded)
      },
      {
        name: 'Select All in Group',
        action: () => this.selectGroupAndChildren(groupNode)
      },
      {
        name: 'Export Group Data',
        action: () => this.exportGroupData(groupNode)
      },
      'separator',
      {
        name: 'Remove Group',
        action: () => this.removeGrouping(groupNode.field)
      }
    ];

    this.showContextMenu(event.event, contextMenu);
  }

  private selectGroupAndChildren(groupNode: any): void {
    groupNode.selectThisNode(true);
    
    if (groupNode.childrenAfterGroup) {
      groupNode.childrenAfterGroup.forEach((child: any) => {
        child.selectThisNode(true);
      });
    }
  }

  private filterByGroup(groupNode: any): void {
    const filterField = groupNode.field;
    const filterValue = groupNode.key;
    
    const filterInstance = this.gridApi.getFilterInstance(filterField);
    if (filterInstance) {
      filterInstance.setModel({
        type: 'equals',
        filter: filterValue
      });
      this.gridApi.onFilterChanged();
    }
  }

  private exportGroupData(groupNode: any): void {
    const groupData: any[] = [];
    
    const collectGroupData = (node: any) => {
      if (node.group) {
        node.childrenAfterGroup?.forEach((child: any) => {
          if (child.group) {
            collectGroupData(child);
          } else {
            groupData.push(child.data);
          }
        });
      }
    };

    collectGroupData(groupNode);
    this.exportService.exportToCsv(groupData, `${groupNode.key}_data.csv`);
  }
}

@Component({
  selector: 'app-interactive-group-renderer',
  template: `
    <div class="interactive-group-row" (click)="onClick($event)">
      <button 
        class="expand-toggle"
        (click)="toggleExpanded($event)"
        [class.expanded]="expanded">
        {{ expanded ? '▼' : '▶' }}
      </button>
      
      <div class="group-info">
        <span class="group-name">{{ groupName }}</span>
        <span class="group-count">({{ itemCount }})</span>
      </div>
      
      <div class="group-actions">
        <button 
          class="action-btn"
          (click)="selectGroup($event)"
          title="Select all items in group">
          ☑
        </button>
        <button 
          class="action-btn"
          (click)="filterGroup($event)"
          title="Filter to this group">
          🔍
        </button>
        <button 
          class="action-btn"
          (click)="showGroupMenu($event)"
          title="More options">
          ⋮
        </button>
      </div>
    </div>
  `,
  styles: [`
    .interactive-group-row {
      display: flex;
      align-items: center;
      padding: 8px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .interactive-group-row:hover {
      background: #e9ecef;
    }
    
    .expand-toggle {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      margin-right: 8px;
      transition: transform 0.2s;
    }
    
    .expand-toggle.expanded {
      transform: rotate(0deg);
    }
    
    .group-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .group-name {
      font-weight: bold;
      color: #333;
    }
    
    .group-count {
      color: #666;
      font-size: 12px;
    }
    
    .group-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .interactive-group-row:hover .group-actions {
      opacity: 1;
    }
    
    .action-btn {
      background: none;
      border: 1px solid transparent;
      border-radius: 3px;
      cursor: pointer;
      padding: 4px;
      font-size: 12px;
    }
    
    .action-btn:hover {
      background: white;
      border-color: #ccc;
    }
  `]
})
export class InteractiveGroupRendererComponent implements ICellRendererAngularComp {
  groupName: string = '';
  itemCount: number = 0;
  expanded: boolean = false;
  
  private params: any;

  agInit(params: any): void {
    this.params = params;
    this.groupName = params.value || 'Unknown';
    this.itemCount = params.node.allChildrenCount || 0;
    this.expanded = params.node.expanded;
  }

  refresh(params: any): boolean {
    this.expanded = params.node.expanded;
    return true;
  }

  onClick(event: MouseEvent): void {
    // Handle row click
    event.stopPropagation();
  }

  toggleExpanded(event: MouseEvent): void {
    event.stopPropagation();
    this.expanded = !this.expanded;
    this.params.node.setExpanded(this.expanded);
  }

  selectGroup(event: MouseEvent): void {
    event.stopPropagation();
    this.params.context.selectGroupAndChildren(this.params.node);
  }

  filterGroup(event: MouseEvent): void {
    event.stopPropagation();
    this.params.context.filterByGroup(this.params.node);
  }

  showGroupMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.params.context.showGroupContextMenu({
      event,
      node: this.params.node
    });
  }
}
```

## Performance Optimization

### Large Dataset Grouping

```typescript
export class LargeDatasetGroupingComponent {
  private groupingCache = new Map<string, any>();

  gridOptions = {
    // Optimize for large grouped datasets
    rowGroupPanelShow: 'always',
    groupDefaultExpanded: 0, // Start collapsed
    animateRows: false, // Disable for better performance
    
    // Enable server-side grouping for very large datasets
    rowModelType: 'serverSide',
    serverSideStoreType: 'partial',
    cacheBlockSize: 100,
    maxBlocksInCache: 10,
    
    // Grouping optimizations
    suppressAggFuncInHeader: true,
    groupSuppressAutoColumn: false,
    groupIncludeFooter: false,
    groupIncludeTotalFooter: false
  };

  // Efficient group rendering
  autoGroupColumnDef = {
    headerName: 'Groups',
    width: 200,
    cellRenderer: 'efficientGroupRenderer',
    cellRendererParams: {
      suppressCount: false,
      footerValueGetter: this.footerValueGetter.bind(this)
    }
  };

  private footerValueGetter(params: any): string {
    const node = params.node;
    const cacheKey = `footer-${node.field}-${node.key}`;
    
    if (this.groupingCache.has(cacheKey)) {
      return this.groupingCache.get(cacheKey);
    }

    const footerValue = this.calculateGroupFooter(node);
    this.groupingCache.set(cacheKey, footerValue);
    
    return footerValue;
  }

  private calculateGroupFooter(node: any): string {
    if (!node.aggData) return '';
    
    const totalSales = node.aggData.sales || 0;
    const avgRating = node.aggData.rating || 0;
    
    return `Sales: $${totalSales.toLocaleString()}, Avg Rating: ${avgRating.toFixed(1)}`;
  }

  onGroupExpanded(event: any): void {
    // Lazy load group data when expanded
    const groupNode = event.node;
    if (groupNode.childrenAfterGroup?.length === 0) {
      this.loadGroupData(groupNode);
    }
  }

  private async loadGroupData(groupNode: any): Promise<void> {
    try {
      const groupData = await this.dataService.getGroupData(
        groupNode.field,
        groupNode.key
      );
      
      // Update group with loaded data
      groupNode.childrenAfterGroup = groupData;
      this.gridApi.refreshCells({ rowNodes: [groupNode] });
    } catch (error) {
      console.error('Failed to load group data:', error);
    }
  }

  // Batch group operations for better performance
  batchGroupOperations(operations: Array<{type: string, groupId: string}>): void {
    this.gridApi.setSuppressModelUpdateAfterUpdateTransaction(true);
    
    try {
      operations.forEach(op => {
        switch (op.type) {
          case 'expand':
            this.expandGroup(op.groupId);
            break;
          case 'collapse':
            this.collapseGroup(op.groupId);
            break;
          case 'select':
            this.selectGroup(op.groupId);
            break;
        }
      });
    } finally {
      this.gridApi.setSuppressModelUpdateAfterUpdateTransaction(false);
    }
  }

  // Memory management for grouping cache
  cleanupGroupingCache(): void {
    if (this.groupingCache.size > 1000) {
      // Keep only most recently used entries
      const entries = Array.from(this.groupingCache.entries());
      const recentEntries = entries.slice(-500);
      
      this.groupingCache.clear();
      recentEntries.forEach(([key, value]) => {
        this.groupingCache.set(key, value);
      });
    }
  }

  ngOnDestroy(): void {
    this.groupingCache.clear();
  }
}
```

## API Reference

### Grid Options

| Option | Type | Description |
|--------|------|-------------|
| `rowGroupPanelShow` | 'always' \| 'onlyWhenGrouping' \| 'never' | Show grouping panel |
| `groupDefaultExpanded` | number | Default expansion level |
| `groupSuppressAutoColumn` | boolean | Suppress auto group column |
| `groupIncludeFooter` | boolean | Include group footers |
| `groupIncludeTotalFooter` | boolean | Include total footer |
| `autoGroupColumnDef` | object | Auto group column definition |

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `rowGroup` | boolean | Enable grouping for column |
| `rowGroupIndex` | number | Grouping priority order |
| `aggFunc` | string \| function | Aggregation function |
| `hide` | boolean | Hide column when grouping |

### API Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `expandAll()` | - | Expand all group nodes |
| `collapseAll()` | - | Collapse all group nodes |
| `setRowGroupColumns()` | `columnIds: string[]` | Set grouping columns |
| `getRowGroupColumns()` | - | Get current grouping columns |
| `addAggFunc()` | `key: string, func: function` | Add custom aggregation |

## Common Patterns

### Drill-Down Pattern

```typescript
export class DrillDownPattern {
  private groupingLevels = [
    { field: 'region', name: 'Region' },
    { field: 'country', name: 'Country' },
    { field: 'city', name: 'City' }
  ];

  currentDrillLevel = 0;

  drillDown(): void {
    if (this.currentDrillLevel < this.groupingLevels.length - 1) {
      this.currentDrillLevel++;
      this.updateGrouping();
    }
  }

  drillUp(): void {
    if (this.currentDrillLevel > 0) {
      this.currentDrillLevel--;
      this.updateGrouping();
    }
  }

  private updateGrouping(): void {
    const groupColumns = this.groupingLevels
      .slice(0, this.currentDrillLevel + 1)
      .map(level => level.field);
    
    this.columnApi.setRowGroupColumns(groupColumns);
  }
}
```

## Troubleshooting

### Common Issues

1. **Groups not forming**: Check if `rowGroup: true` is set on column definitions
2. **Aggregations not working**: Verify `aggFunc` is properly configured
3. **Performance issues**: Implement grouping cache and lazy loading
4. **Custom renderers not displaying**: Ensure components are registered in `frameworkComponents`

### Debugging

```typescript
export class GroupingDebugger {
  debugGroupingState(): void {
    console.group('Row Grouping Debug');
    
    const groupColumns = this.columnApi.getRowGroupColumns();
    console.log('Group columns:', groupColumns.map(col => col.getColId()));
    
    let groupCount = 0;
    let leafCount = 0;
    
    this.gridApi.forEachNode(node => {
      if (node.group) {
        groupCount++;
        console.log(`Group: ${node.field}=${node.key}, Children: ${node.allChildrenCount}`);
      } else {
        leafCount++;
      }
    });
    
    console.log(`Total groups: ${groupCount}, Leaf nodes: ${leafCount}`);
    console.groupEnd();
  }
}
```

## Best Practices

1. **Start with collapsed groups** for large datasets
2. **Use meaningful group column names** and custom renderers
3. **Implement lazy loading** for nested group data
4. **Cache aggregation results** for better performance
5. **Provide clear visual hierarchy** with indentation and styling
6. **Allow users to save** and restore grouping preferences
7. **Test performance** with realistic data volumes
8. **Consider server-side grouping** for very large datasets