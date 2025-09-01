# Column Headers

## Overview

Column headers provide essential navigation, sorting, filtering, and customization capabilities. The BLG Grid supports custom header components, multi-level headers, header groups, and interactive header features that enhance the user experience and provide powerful data manipulation tools.

## Use Cases

- Custom header layouts and branding
- Multi-level hierarchical headers
- Interactive sorting and filtering controls
- Header-based actions and menus
- Responsive header behavior
- Header tooltips and help text

## Basic Header Configuration

### Simple Header Setup

```typescript
import { BlgGridComponent } from '@blg/grid';

@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs">
    </blg-grid>
  `
})
export class BasicHeaderComponent {
  columnDefs = [
    { 
      field: 'name', 
      headerName: 'Full Name',
      sortable: true,
      filter: true
    },
    { 
      field: 'age', 
      headerName: 'Age (Years)',
      sortable: true,
      filter: 'agNumberColumnFilter'
    },
    { 
      field: 'email', 
      headerName: 'Email Address',
      sortable: true,
      filter: 'agTextColumnFilter'
    },
    { 
      field: 'department', 
      headerName: 'Department',
      sortable: true,
      filter: 'agSetColumnFilter'
    }
  ];
}
```

### Header Tooltips

```typescript
export class HeaderTooltipsComponent {
  columnDefs = [
    {
      field: 'revenue',
      headerName: 'Revenue',
      headerTooltip: 'Total revenue for the current period in USD',
      sortable: true
    },
    {
      field: 'growth',
      headerName: 'Growth Rate',
      headerTooltip: 'Year-over-year growth percentage calculated from previous period',
      sortable: true
    },
    {
      field: 'efficiency',
      headerName: 'Efficiency Score',
      headerTooltip: 'Composite efficiency metric based on multiple performance indicators (0-100)',
      sortable: true
    }
  ];

  // Dynamic tooltips
  columnDefsWithDynamicTooltips = [
    {
      field: 'status',
      headerName: 'Status',
      headerTooltip: (params) => {
        return `Status column - ${params.location} header. Current filter: ${params.column.isFilterActive() ? 'Active' : 'None'}`;
      }
    }
  ];
}
```

## Custom Header Components

### Basic Custom Header

```typescript
import { Component } from '@angular/core';
import { IHeaderAngularComp } from '@blg/grid';

@Component({
  selector: 'app-custom-header',
  template: `
    <div class="custom-header">
      <div class="header-content">
        <span class="header-title">{{ displayName }}</span>
        <button 
          *ngIf="enableSorting"
          class="sort-button"
          (click)="onSortRequested()">
          <span [ngClass]="getSortClass()">{{ getSortIcon() }}</span>
        </button>
      </div>
      <div class="header-actions" *ngIf="showActions">
        <button 
          class="action-button"
          (click)="onFilterToggle()"
          [class.active]="isFilterActive">
          🔍
        </button>
        <button 
          class="action-button"
          (click)="onColumnMenu()"
          title="Column Options">
          ⚙️
        </button>
      </div>
    </div>
  `,
  styles: [`
    .custom-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      height: 100%;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #dee2e6;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .header-title {
      font-weight: 600;
      color: #343a40;
    }
    
    .sort-button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      padding: 2px;
    }
    
    .header-actions {
      display: flex;
      gap: 4px;
    }
    
    .action-button {
      background: none;
      border: 1px solid transparent;
      cursor: pointer;
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 12px;
    }
    
    .action-button:hover {
      background: rgba(0, 123, 255, 0.1);
      border-color: #007bff;
    }
    
    .action-button.active {
      background: #007bff;
      color: white;
    }
  `]
})
export class CustomHeaderComponent implements IHeaderAngularComp {
  displayName: string = '';
  enableSorting: boolean = false;
  showActions: boolean = false;
  isFilterActive: boolean = false;
  
  private params: any;
  private currentSort: string | null = null;

  agInit(params: any): void {
    this.params = params;
    this.displayName = params.displayName || params.column.getColId();
    this.enableSorting = params.enableSorting;
    this.showActions = params.showActions !== false;
    this.isFilterActive = params.column.isFilterActive();
  }

  onSortRequested(): void {
    if (!this.enableSorting) return;

    // Cycle through sort states: none -> asc -> desc -> none
    if (this.currentSort === null) {
      this.currentSort = 'asc';
    } else if (this.currentSort === 'asc') {
      this.currentSort = 'desc';
    } else {
      this.currentSort = null;
    }

    this.params.setSort(this.currentSort, false);
  }

  onFilterToggle(): void {
    // Toggle filter panel
    const filterInstance = this.params.api.getFilterInstance(this.params.column.getColId());
    if (filterInstance) {
      this.params.api.showColumnFilter(this.params.column.getColId());
    }
  }

  onColumnMenu(): void {
    // Show custom column menu
    this.showCustomColumnMenu();
  }

  getSortClass(): string {
    return `sort-indicator ${this.currentSort || 'none'}`;
  }

  getSortIcon(): string {
    switch (this.currentSort) {
      case 'asc': return '↑';
      case 'desc': return '↓';
      default: return '↕';
    }
  }

  private showCustomColumnMenu(): void {
    // Implementation for custom column menu
    console.log('Show column menu for:', this.params.column.getColId());
  }

  refresh(params: any): boolean {
    this.params = params;
    this.isFilterActive = params.column.isFilterActive();
    return true;
  }
}
```

### Register Custom Header

```typescript
@Component({
  template: `
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [frameworkComponents]="frameworkComponents">
    </blg-grid>
  `
})
export class GridWithCustomHeadersComponent {
  frameworkComponents = {
    customHeader: CustomHeaderComponent
  };

  columnDefs = [
    {
      field: 'name',
      headerName: 'Employee Name',
      headerComponent: 'customHeader',
      headerComponentParams: {
        enableSorting: true,
        showActions: true
      }
    },
    {
      field: 'department',
      headerName: 'Department',
      headerComponent: 'customHeader',
      headerComponentParams: {
        enableSorting: true,
        showActions: false
      }
    }
  ];
}
```

## Header Groups

### Basic Header Groups

```typescript
export class BasicHeaderGroupsComponent {
  columnDefs = [
    { 
      field: 'id', 
      headerName: 'ID',
      width: 80
    },
    {
      headerName: 'Personal Information',
      children: [
        { field: 'firstName', headerName: 'First Name', width: 120 },
        { field: 'lastName', headerName: 'Last Name', width: 120 },
        { field: 'age', headerName: 'Age', width: 80 }
      ]
    },
    {
      headerName: 'Contact Details',
      children: [
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone', headerName: 'Phone', width: 130 }
      ]
    },
    {
      headerName: 'Employment',
      children: [
        { field: 'department', headerName: 'Department', width: 130 },
        { field: 'role', headerName: 'Role', width: 120 },
        { field: 'startDate', headerName: 'Start Date', width: 120 }
      ]
    }
  ];
}
```

### Multi-Level Header Groups

```typescript
export class MultiLevelHeaderGroupsComponent {
  columnDefs = [
    { field: 'athlete', headerName: 'Athlete', width: 200 },
    {
      headerName: 'Olympic Results',
      children: [
        {
          headerName: '2020 Olympics',
          children: [
            { field: 'gold2020', headerName: 'Gold', width: 80 },
            { field: 'silver2020', headerName: 'Silver', width: 80 },
            { field: 'bronze2020', headerName: 'Bronze', width: 80 }
          ]
        },
        {
          headerName: '2016 Olympics',
          children: [
            { field: 'gold2016', headerName: 'Gold', width: 80 },
            { field: 'silver2016', headerName: 'Silver', width: 80 },
            { field: 'bronze2016', headerName: 'Bronze', width: 80 }
          ]
        },
        {
          headerName: 'Career Totals',
          children: [
            { field: 'totalGold', headerName: 'Total Gold', width: 100 },
            { field: 'totalSilver', headerName: 'Total Silver', width: 100 },
            { field: 'totalBronze', headerName: 'Total Bronze', width: 100 }
          ]
        }
      ]
    }
  ];
}
```

### Custom Header Group Components

```typescript
@Component({
  selector: 'app-custom-header-group',
  template: `
    <div class="custom-header-group">
      <div class="group-header">
        <span class="group-title">{{ displayName }}</span>
        <div class="group-actions" *ngIf="showGroupActions">
          <button 
            class="group-action-btn"
            (click)="toggleGroupExpansion()"
            [title]="isExpanded ? 'Collapse Group' : 'Expand Group'">
            {{ isExpanded ? '−' : '+' }}
          </button>
          <button 
            class="group-action-btn"
            (click)="hideGroup()"
            title="Hide Group">
            ×
          </button>
        </div>
      </div>
      <div class="group-stats" *ngIf="showStats">
        <small>{{ childColumnCount }} columns</small>
      </div>
    </div>
  `,
  styles: [`
    .custom-header-group {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border: 1px solid #2196f3;
      border-radius: 4px;
      padding: 4px 8px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .group-title {
      font-weight: bold;
      color: #1976d2;
    }
    
    .group-actions {
      display: flex;
      gap: 2px;
    }
    
    .group-action-btn {
      background: rgba(33, 150, 243, 0.1);
      border: 1px solid #2196f3;
      border-radius: 3px;
      cursor: pointer;
      width: 20px;
      height: 20px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .group-action-btn:hover {
      background: #2196f3;
      color: white;
    }
    
    .group-stats {
      margin-top: 2px;
      color: #666;
    }
  `]
})
export class CustomHeaderGroupComponent implements IHeaderGroupAngularComp {
  displayName: string = '';
  showGroupActions: boolean = false;
  showStats: boolean = false;
  childColumnCount: number = 0;
  isExpanded: boolean = true;
  
  private params: any;

  agInit(params: any): void {
    this.params = params;
    this.displayName = params.displayName || 'Group';
    this.showGroupActions = params.showGroupActions !== false;
    this.showStats = params.showStats === true;
    this.childColumnCount = this.getChildColumnCount();
  }

  toggleGroupExpansion(): void {
    this.isExpanded = !this.isExpanded;
    
    // Toggle visibility of child columns
    const childColumns = this.getChildColumns();
    this.params.columnApi.setColumnsVisible(childColumns, this.isExpanded);
  }

  hideGroup(): void {
    const childColumns = this.getChildColumns();
    this.params.columnApi.setColumnsVisible(childColumns, false);
  }

  private getChildColumns(): string[] {
    // Get all child column IDs from the group
    return this.params.columnGroup?.getChildren()?.map((child: any) => child.getColId()) || [];
  }

  private getChildColumnCount(): number {
    return this.getChildColumns().length;
  }

  refresh(params: any): boolean {
    return false;
  }
}
```

## Interactive Header Features

### Sortable Headers

```typescript
export class SortableHeadersComponent {
  columnDefs = [
    {
      field: 'name',
      headerName: 'Name',
      sortable: true,
      sort: 'asc', // Initial sort
      sortIndex: 0 // Multi-column sort priority
    },
    {
      field: 'age',
      headerName: 'Age',
      sortable: true,
      sortIndex: 1,
      sort: 'desc'
    },
    {
      field: 'department',
      headerName: 'Department',
      sortable: true,
      unSortIcon: true, // Show unsort option
      sortingOrder: ['asc', 'desc', null] // Custom sort cycle
    }
  ];

  // Custom sorting
  onSortChanged(event: SortChangedEvent): void {
    console.log('Sort state changed:', event.columnApi.getSortModel());
    this.saveSortState();
  }

  setSortModel(sortModel: any[]): void {
    this.gridApi.setSortModel(sortModel);
  }

  clearSort(): void {
    this.gridApi.setSortModel([]);
  }

  private saveSortState(): void {
    const sortModel = this.gridApi.getSortModel();
    localStorage.setItem('gridSortModel', JSON.stringify(sortModel));
  }
}
```

### Filterable Headers

```typescript
export class FilterableHeadersComponent {
  columnDefs = [
    {
      field: 'name',
      headerName: 'Name',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      filterParams: {
        filterOptions: ['contains', 'startsWith', 'endsWith'],
        suppressAndOrCondition: false
      }
    },
    {
      field: 'age',
      headerName: 'Age',
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      filterParams: {
        filterOptions: ['equals', 'lessThan', 'greaterThan', 'inRange']
      }
    },
    {
      field: 'department',
      headerName: 'Department',
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      filterParams: {
        values: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
      }
    }
  ];

  onFilterChanged(event: FilterChangedEvent): void {
    console.log('Filter state changed');
    this.updateFilterStats();
  }

  private updateFilterStats(): void {
    const filterModel = this.gridApi.getFilterModel();
    const activeFilters = Object.keys(filterModel);
    console.log('Active filters:', activeFilters);
  }
}
```

## Responsive Headers

### Adaptive Header Layout

```typescript
export class ResponsiveHeadersComponent {
  private screenSize: string = 'desktop';

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateScreenSize();
    this.adjustHeaderLayout();
  }

  columnDefs = [
    {
      field: 'id',
      headerName: this.getResponsiveHeaderName('id'),
      width: this.getResponsiveWidth('id')
    },
    {
      field: 'name',
      headerName: this.getResponsiveHeaderName('name'),
      width: this.getResponsiveWidth('name')
    },
    {
      field: 'department',
      headerName: this.getResponsiveHeaderName('department'),
      width: this.getResponsiveWidth('department'),
      hide: this.shouldHideColumn('department')
    }
  ];

  private getResponsiveHeaderName(field: string): string {
    const headerNames = {
      mobile: {
        id: '#',
        name: 'Name',
        department: 'Dept',
        email: '@'
      },
      tablet: {
        id: 'ID',
        name: 'Full Name',
        department: 'Dept',
        email: 'Email'
      },
      desktop: {
        id: 'Employee ID',
        name: 'Full Name',
        department: 'Department',
        email: 'Email Address'
      }
    };

    return headerNames[this.screenSize]?.[field] || field;
  }

  private getResponsiveWidth(field: string): number {
    const widths = {
      mobile: { id: 50, name: 100, department: 80, email: 120 },
      tablet: { id: 80, name: 150, department: 120, email: 180 },
      desktop: { id: 100, name: 200, department: 150, email: 250 }
    };

    return widths[this.screenSize]?.[field] || 100;
  }

  private shouldHideColumn(field: string): boolean {
    const hideRules = {
      mobile: ['department', 'email'],
      tablet: [],
      desktop: []
    };

    return hideRules[this.screenSize]?.includes(field) || false;
  }

  private updateScreenSize(): void {
    const width = window.innerWidth;
    if (width < 768) this.screenSize = 'mobile';
    else if (width < 1024) this.screenSize = 'tablet';
    else this.screenSize = 'desktop';
  }

  private adjustHeaderLayout(): void {
    // Update column definitions for new screen size
    this.columnDefs.forEach(colDef => {
      colDef.headerName = this.getResponsiveHeaderName(colDef.field);
      colDef.width = this.getResponsiveWidth(colDef.field);
      colDef.hide = this.shouldHideColumn(colDef.field);
    });

    this.gridApi.setColumnDefs(this.columnDefs);
  }
}
```

## Header Styling and Theming

### Custom Header Styles

```typescript
export class StyledHeadersComponent {
  columnDefs = [
    {
      field: 'priority',
      headerName: 'Priority',
      headerClass: 'priority-header',
      cellClass: 'priority-cell'
    },
    {
      field: 'status',
      headerName: 'Status',
      headerClass: (params) => this.getStatusHeaderClass(params),
      cellClass: (params) => this.getStatusCellClass(params)
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      headerClass: 'currency-header',
      cellClass: 'currency-cell'
    }
  ];

  private getStatusHeaderClass(params: any): string {
    return 'status-header dynamic-header';
  }

  private getStatusCellClass(params: any): string {
    const status = params.value?.toLowerCase();
    return `status-cell status-${status}`;
  }
}

// Corresponding CSS
/*
.priority-header {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: white;
  font-weight: bold;
  text-align: center;
}

.status-header {
  background: linear-gradient(135deg, #4ecdc4, #44b3a8);
  color: white;
  font-weight: bold;
  position: relative;
}

.status-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #44b3a8;
}

.currency-header {
  background: linear-gradient(135deg, #45b7d1, #2c3e50);
  color: white;
  text-align: right;
  padding-right: 12px;
}

.currency-header::before {
  content: '$';
  font-size: 18px;
  margin-right: 4px;
}
*/
```

## API Reference

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `headerName` | string | Display name for header |
| `headerTooltip` | string \| function | Tooltip text for header |
| `headerComponent` | string \| Component | Custom header component |
| `headerComponentParams` | object | Parameters for header component |
| `headerClass` | string \| function | CSS class for header |
| `headerStyle` | object \| function | Inline styles for header |
| `suppressHeaderMenuButton` | boolean | Hide header menu button |
| `suppressHeaderKeyboardEvent` | function | Suppress keyboard events |

### Header Group Options

| Option | Type | Description |
|--------|------|-------------|
| `headerGroupComponent` | string \| Component | Custom header group component |
| `headerGroupComponentParams` | object | Parameters for group component |
| `children` | ColumnDef[] | Child column definitions |
| `marryChildren` | boolean | Keep children together when moving |

### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `sortChanged` | Sort state changed | SortChangedEvent |
| `filterChanged` | Filter state changed | FilterChangedEvent |
| `columnHeaderClicked` | Header clicked | ColumnHeaderClickedEvent |
| `columnHeaderContextMenu` | Header right-clicked | ColumnHeaderContextMenuEvent |

## Common Patterns

### Status Indicator Headers

```typescript
export class StatusIndicatorHeadersComponent {
  columnDefs = [
    {
      field: 'connectionStatus',
      headerName: 'Connection',
      headerComponent: 'statusIndicatorHeader',
      headerComponentParams: {
        statusField: 'connectionStatus',
        statusMap: {
          'online': { color: '#28a745', icon: '🟢' },
          'offline': { color: '#dc3545', icon: '🔴' },
          'pending': { color: '#ffc107', icon: '🟡' }
        }
      }
    }
  ];

  frameworkComponents = {
    statusIndicatorHeader: StatusIndicatorHeaderComponent
  };
}

@Component({
  template: `
    <div class="status-indicator-header">
      <span [style.color]="statusColor">{{ statusIcon }}</span>
      <span class="header-text">{{ displayName }}</span>
      <span class="status-count">({{ activeCount }})</span>
    </div>
  `
})
export class StatusIndicatorHeaderComponent implements IHeaderAngularComp {
  displayName: string = '';
  statusColor: string = '#666';
  statusIcon: string = '';
  activeCount: number = 0;

  agInit(params: any): void {
    this.displayName = params.displayName;
    this.updateStatusIndicator(params);
  }

  private updateStatusIndicator(params: any): void {
    // Calculate status statistics from grid data
    let statusCounts = { online: 0, offline: 0, pending: 0 };
    
    params.api.forEachNode((node: any) => {
      const status = node.data[params.statusField];
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    // Determine dominant status
    const dominantStatus = Object.entries(statusCounts)
      .reduce((a, b) => statusCounts[a[0]] > statusCounts[b[0]] ? a : b)[0];

    const statusConfig = params.statusMap[dominantStatus];
    this.statusColor = statusConfig?.color || '#666';
    this.statusIcon = statusConfig?.icon || '';
    this.activeCount = statusCounts[dominantStatus];
  }

  refresh(params: any): boolean {
    this.updateStatusIndicator(params);
    return true;
  }
}
```

### Search and Filter Headers

```typescript
@Component({
  selector: 'app-search-filter-header',
  template: `
    <div class="search-filter-header">
      <div class="header-title">{{ displayName }}</div>
      <div class="search-container">
        <input 
          type="text"
          class="search-input"
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          [placeholder]="'Search ' + displayName">
        <button 
          class="clear-search"
          (click)="clearSearch()"
          *ngIf="searchTerm">
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .search-filter-header {
      padding: 4px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .header-title {
      font-weight: bold;
      font-size: 12px;
    }
    
    .search-container {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .search-input {
      width: 100%;
      padding: 2px 20px 2px 4px;
      border: 1px solid #ccc;
      border-radius: 3px;
      font-size: 11px;
    }
    
    .clear-search {
      position: absolute;
      right: 2px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      color: #666;
    }
  `]
})
export class SearchFilterHeaderComponent implements IHeaderAngularComp {
  displayName: string = '';
  searchTerm: string = '';
  private params: any;
  private searchTimeout?: number;

  agInit(params: any): void {
    this.params = params;
    this.displayName = params.displayName;
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = window.setTimeout(() => {
      this.applyFilter();
    }, 300);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  private applyFilter(): void {
    const filterInstance = this.params.api.getFilterInstance(this.params.column.getColId());
    
    if (filterInstance) {
      if (this.searchTerm) {
        filterInstance.setModel({
          type: 'contains',
          filter: this.searchTerm
        });
      } else {
        filterInstance.setModel(null);
      }
      
      this.params.api.onFilterChanged();
    }
  }

  refresh(params: any): boolean {
    return false;
  }
}
```

## Troubleshooting

### Common Issues

1. **Custom headers not displaying**: Check if component is registered in `frameworkComponents`
2. **Header height issues**: Ensure proper CSS height and padding settings
3. **Sort/filter not working**: Verify column has `sortable: true` or appropriate filter configuration
4. **Header groups not aligning**: Check column widths and group structure

### Debugging Headers

```typescript
export class HeaderDebugger {
  debugHeaderState(): void {
    console.group('Header Debug Information');
    
    const columns = this.columnApi.getAllColumns() || [];
    columns.forEach(column => {
      const colDef = column.getColDef();
      console.log(`Column: ${column.getColId()}`, {
        headerName: colDef.headerName,
        sortable: colDef.sortable,
        filter: colDef.filter,
        headerComponent: colDef.headerComponent,
        width: column.getActualWidth(),
        visible: column.isVisible(),
        pinned: column.getPinned()
      });
    });
    
    console.groupEnd();
  }

  validateHeaderConfiguration(): boolean {
    const columns = this.columnApi.getAllColumns() || [];
    const issues: string[] = [];

    columns.forEach(column => {
      const colDef = column.getColDef();
      
      if (!colDef.headerName && !colDef.headerComponent) {
        issues.push(`Column ${column.getColId()} has no header name or component`);
      }
      
      if (colDef.sortable && !colDef.field) {
        issues.push(`Sortable column ${column.getColId()} has no field specified`);
      }
    });

    if (issues.length > 0) {
      console.warn('Header configuration issues:', issues);
      return false;
    }

    return true;
  }
}
```

## Best Practices

1. **Keep header text concise** but descriptive
2. **Use consistent styling** across all headers
3. **Provide tooltips** for complex or abbreviated headers
4. **Implement responsive headers** for different screen sizes
5. **Test header interactions** thoroughly across different browsers
6. **Use header groups** to organize related columns logically
7. **Consider accessibility** with proper ARIA labels and keyboard navigation
8. **Optimize header performance** for large numbers of columns