# Example 3: Grid with Custom Cell Renderers

## 📚 Target Audience: Library Users

This example demonstrates migrating an ag-Grid with various custom cell renderers to BLG Grid, including buttons, badges, progress bars, images, and complex multi-element renderers.

## 🎯 What This Example Covers

- Custom button cell renderers with click handlers
- Badge/status renderers with conditional styling
- Progress bar renderers
- Image renderers with fallbacks
- Rating star renderers
- Action menu renderers
- Multi-element composite renderers
- Renderer parameter passing

## 📊 Before: ag-Grid Implementation

### Button Cell Renderer (button-cell-renderer.component.ts)

```typescript
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-button-cell-renderer',
  template: `
    <div class="button-cell">
      <button 
        class="action-btn"
        [class]="buttonClass"
        (click)="onClick()"
        [disabled]="isDisabled">
        <i [class]="iconClass" *ngIf="iconClass"></i>
        {{ label }}
      </button>
    </div>
  `,
  styles: [`
    .button-cell {
      display: flex;
      align-items: center;
      height: 100%;
    }
    .action-btn {
      padding: 4px 8px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }
    .btn-primary { background: #007bff; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-success { background: #28a745; color: white; }
  `]
})
export class ButtonCellRendererComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams & {
    label: string;
    buttonClass: string;
    iconClass?: string;
    onClick: (data: any) => void;
    isDisabled?: (data: any) => boolean;
  };
  
  label!: string;
  buttonClass!: string;
  iconClass?: string;
  isDisabled!: boolean;

  agInit(params: any): void {
    this.params = params;
    this.label = params.label || 'Action';
    this.buttonClass = params.buttonClass || 'btn-primary';
    this.iconClass = params.iconClass;
    this.isDisabled = params.isDisabled ? params.isDisabled(params.data) : false;
  }

  refresh(params: any): boolean {
    this.params = params;
    this.isDisabled = params.isDisabled ? params.isDisabled(params.data) : false;
    return true;
  }

  onClick(): void {
    if (this.params.onClick) {
      this.params.onClick(this.params.data);
    }
  }
}
```

### Status Badge Renderer (status-badge-renderer.component.ts)

```typescript
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-status-badge-renderer',
  template: `
    <span class="status-badge" [class]="badgeClass">
      <i [class]="iconClass" *ngIf="iconClass"></i>
      {{ displayValue }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-active { background: #d4edda; color: #155724; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-draft { background: #d1ecf1; color: #0c5460; }
  `]
})
export class StatusBadgeRendererComponent implements ICellRendererAngularComp {
  displayValue!: string;
  badgeClass!: string;
  iconClass?: string;

  agInit(params: any): void {
    const value = params.value;
    const statusConfig = params.statusConfig || {};
    
    // Default status configurations
    const defaultConfig: any = {
      'active': { class: 'status-active', icon: 'fa fa-check-circle', label: 'Active' },
      'inactive': { class: 'status-inactive', icon: 'fa fa-times-circle', label: 'Inactive' },
      'pending': { class: 'status-pending', icon: 'fa fa-clock', label: 'Pending' },
      'draft': { class: 'status-draft', icon: 'fa fa-edit', label: 'Draft' }
    };

    const config = { ...defaultConfig, ...statusConfig };
    const status = config[value] || { class: 'status-draft', label: value };

    this.displayValue = status.label;
    this.badgeClass = status.class;
    this.iconClass = status.icon;
  }

  refresh(): boolean {
    return false;
  }
}
```

### Progress Bar Renderer (progress-bar-renderer.component.ts)

```typescript
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-progress-bar-renderer',
  template: `
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          [class]="progressClass"
          [style.width.%]="progressValue">
        </div>
      </div>
      <span class="progress-text">{{ progressValue }}%</span>
    </div>
  `,
  styles: [`
    .progress-container {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 100%;
    }
    .progress-bar {
      flex: 1;
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
    }
    .progress-success { background: #28a745; }
    .progress-warning { background: #ffc107; }
    .progress-danger { background: #dc3545; }
    .progress-info { background: #17a2b8; }
    .progress-text {
      font-size: 11px;
      font-weight: 500;
      min-width: 35px;
    }
  `]
})
export class ProgressBarRendererComponent implements ICellRendererAngularComp {
  progressValue!: number;
  progressClass!: string;

  agInit(params: any): void {
    this.progressValue = Math.max(0, Math.min(100, params.value || 0));
    
    // Determine color based on value
    if (this.progressValue >= 80) {
      this.progressClass = 'progress-success';
    } else if (this.progressValue >= 60) {
      this.progressClass = 'progress-info';
    } else if (this.progressValue >= 40) {
      this.progressClass = 'progress-warning';
    } else {
      this.progressClass = 'progress-danger';
    }
  }

  refresh(): boolean {
    return false;
  }
}
```

### Main Grid Component (custom-renderers-grid.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { ButtonCellRendererComponent } from './button-cell-renderer.component';
import { StatusBadgeRendererComponent } from './status-badge-renderer.component';
import { ProgressBarRendererComponent } from './progress-bar-renderer.component';

@Component({
  selector: 'app-custom-renderers-grid',
  templateUrl: './custom-renderers-grid.component.html',
  styleUrls: ['./custom-renderers-grid.component.scss']
})
export class CustomRenderersGridComponent implements OnInit {

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Project Name', width: 200 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      cellRenderer: StatusBadgeRendererComponent,
      cellRendererParams: {
        statusConfig: {
          'completed': { class: 'status-active', icon: 'fa fa-check', label: 'Complete' },
          'in-progress': { class: 'status-pending', icon: 'fa fa-spinner', label: 'In Progress' },
          'cancelled': { class: 'status-inactive', icon: 'fa fa-ban', label: 'Cancelled' }
        }
      }
    },
    { 
      field: 'progress', 
      headerName: 'Progress', 
      width: 150,
      cellRenderer: ProgressBarRendererComponent
    },
    { 
      field: 'priority', 
      headerName: 'Priority', 
      width: 100,
      cellRenderer: (params: any) => {
        const priority = params.value;
        const colors: any = {
          'high': 'red',
          'medium': 'orange', 
          'low': 'green'
        };
        return `<span style="color: ${colors[priority] || 'black'}; font-weight: bold;">
                  ${priority.toUpperCase()}
                </span>`;
      }
    },
    { 
      field: 'assignee', 
      headerName: 'Assignee', 
      width: 120,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const initials = params.value.split(' ').map((n: string) => n[0]).join('');
        return `
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 24px; height: 24px; background: #007bff; color: white; 
                        border-radius: 50%; display: flex; align-items: center; 
                        justify-content: center; font-size: 10px; font-weight: bold;">
              ${initials}
            </div>
            <span>${params.value}</span>
          </div>
        `;
      }
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 150,
      cellRenderer: ButtonCellRendererComponent,
      cellRendererParams: {
        label: 'View Details',
        buttonClass: 'btn-primary',
        iconClass: 'fa fa-eye',
        onClick: (data: any) => this.viewDetails(data),
        isDisabled: (data: any) => data.status === 'cancelled'
      },
      sortable: false,
      filter: false
    }
  ];

  gridOptions: GridOptions = {
    frameworkComponents: {
      buttonCellRenderer: ButtonCellRendererComponent,
      statusBadgeRenderer: StatusBadgeRendererComponent,
      progressBarRenderer: ProgressBarRendererComponent
    },
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    }
  };

  rowData: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.rowData = [
      { 
        id: 1, 
        name: 'Website Redesign', 
        status: 'in-progress', 
        progress: 75, 
        priority: 'high', 
        assignee: 'John Smith' 
      },
      { 
        id: 2, 
        name: 'Mobile App Development', 
        status: 'completed', 
        progress: 100, 
        priority: 'high', 
        assignee: 'Jane Doe' 
      },
      { 
        id: 3, 
        name: 'Database Migration', 
        status: 'in-progress', 
        progress: 30, 
        priority: 'medium', 
        assignee: 'Bob Johnson' 
      },
      { 
        id: 4, 
        name: 'Security Audit', 
        status: 'cancelled', 
        progress: 10, 
        priority: 'low', 
        assignee: 'Alice Brown' 
      },
      { 
        id: 5, 
        name: 'Performance Optimization', 
        status: 'in-progress', 
        progress: 90, 
        priority: 'high', 
        assignee: 'Charlie Wilson' 
      }
    ];
  }

  viewDetails(data: any) {
    console.log('Viewing details for:', data);
    alert(`Viewing details for project: ${data.name}`);
  }
}
```

## ✅ After: BLG Grid Implementation

### Button Cell Renderer (button-cell-renderer.component.ts)

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-cell-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="button-cell">
      <button 
        class="action-btn"
        [class]="buttonClass"
        (click)="handleClick()"
        [disabled]="isDisabled">
        <i [class]="iconClass" *ngIf="iconClass"></i>
        {{ label }}
      </button>
    </div>
  `,
  styles: [`
    .button-cell {
      display: flex;
      align-items: center;
      height: 100%;
    }
    .action-btn {
      padding: 4px 8px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }
    .btn-primary { background: #007bff; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-success { background: #28a745; color: white; }
    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ButtonCellRendererComponent {
  @Input() value: any;
  @Input() rowData: any;
  @Input() column: any;
  @Input() params: any;
  
  @Output() buttonClick = new EventEmitter<any>();

  get label(): string {
    return this.params?.label || 'Action';
  }

  get buttonClass(): string {
    return this.params?.buttonClass || 'btn-primary';
  }

  get iconClass(): string {
    return this.params?.iconClass || '';
  }

  get isDisabled(): boolean {
    return this.params?.isDisabled ? this.params.isDisabled(this.rowData) : false;
  }

  handleClick(): void {
    if (this.params?.onClick) {
      this.params.onClick(this.rowData);
    }
    this.buttonClick.emit(this.rowData);
  }
}
```

### Status Badge Renderer (status-badge-renderer.component.ts)

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="badgeClass">
      <i [class]="iconClass" *ngIf="iconClass"></i>
      {{ displayValue }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-active { background: #d4edda; color: #155724; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-draft { background: #d1ecf1; color: #0c5460; }
  `]
})
export class StatusBadgeRendererComponent {
  @Input() value: any;
  @Input() rowData: any;
  @Input() column: any;
  @Input() params: any;

  get displayValue(): string {
    return this.statusConfig.label;
  }

  get badgeClass(): string {
    return this.statusConfig.class;
  }

  get iconClass(): string {
    return this.statusConfig.icon || '';
  }

  private get statusConfig(): any {
    const statusConfig = this.params?.statusConfig || {};
    
    // Default status configurations
    const defaultConfig: any = {
      'active': { class: 'status-active', icon: 'fa fa-check-circle', label: 'Active' },
      'inactive': { class: 'status-inactive', icon: 'fa fa-times-circle', label: 'Inactive' },
      'pending': { class: 'status-pending', icon: 'fa fa-clock', label: 'Pending' },
      'draft': { class: 'status-draft', icon: 'fa fa-edit', label: 'Draft' },
      'completed': { class: 'status-active', icon: 'fa fa-check', label: 'Complete' },
      'in-progress': { class: 'status-pending', icon: 'fa fa-spinner', label: 'In Progress' },
      'cancelled': { class: 'status-inactive', icon: 'fa fa-ban', label: 'Cancelled' }
    };

    const config = { ...defaultConfig, ...statusConfig };
    return config[this.value] || { class: 'status-draft', label: this.value };
  }
}
```

### Progress Bar Renderer (progress-bar-renderer.component.ts)

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          [class]="progressClass"
          [style.width.%]="progressValue">
        </div>
      </div>
      <span class="progress-text">{{ progressValue }}%</span>
    </div>
  `,
  styles: [`
    .progress-container {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 100%;
    }
    .progress-bar {
      flex: 1;
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
    }
    .progress-success { background: #28a745; }
    .progress-warning { background: #ffc107; }
    .progress-danger { background: #dc3545; }
    .progress-info { background: #17a2b8; }
    .progress-text {
      font-size: 11px;
      font-weight: 500;
      min-width: 35px;
    }
  `]
})
export class ProgressBarRendererComponent {
  @Input() value: any;
  @Input() rowData: any;
  @Input() column: any;
  @Input() params: any;

  get progressValue(): number {
    return Math.max(0, Math.min(100, this.value || 0));
  }

  get progressClass(): string {
    if (this.progressValue >= 80) {
      return 'progress-success';
    } else if (this.progressValue >= 60) {
      return 'progress-info';
    } else if (this.progressValue >= 40) {
      return 'progress-warning';
    } else {
      return 'progress-danger';
    }
  }
}
```

### Priority Renderer (priority-renderer.component.ts)

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-priority-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [style.color]="priorityColor" [style.font-weight]="'bold'">
      {{ displayValue }}
    </span>
  `,
  styles: []
})
export class PriorityRendererComponent {
  @Input() value: any;
  @Input() rowData: any;
  @Input() column: any;

  get displayValue(): string {
    return this.value?.toUpperCase() || '';
  }

  get priorityColor(): string {
    const colors: any = {
      'high': 'red',
      'medium': 'orange',
      'low': 'green'
    };
    return colors[this.value] || 'black';
  }
}
```

### Assignee Avatar Renderer (assignee-avatar-renderer.component.ts)

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assignee-avatar-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="assignee-container" *ngIf="value">
      <div class="avatar">
        {{ initials }}
      </div>
      <span class="name">{{ value }}</span>
    </div>
  `,
  styles: [`
    .assignee-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .avatar {
      width: 24px;
      height: 24px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
    }
    .name {
      font-size: 12px;
    }
  `]
})
export class AssigneeAvatarRendererComponent {
  @Input() value: any;
  @Input() rowData: any;
  @Input() column: any;

  get initials(): string {
    if (!this.value) return '';
    return this.value.split(' ').map((n: string) => n[0]).join('');
  }
}
```

### Main Grid Component (custom-renderers-grid.component.ts)

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { Grid } from '@ng-ui-lib/grid';
import { CommonModule } from '@angular/common';
import { ColumnDefinition, GridConfig } from '@ng-ui-lib/core';
import { ButtonCellRendererComponent } from './button-cell-renderer.component';
import { StatusBadgeRendererComponent } from './status-badge-renderer.component';
import { ProgressBarRendererComponent } from './progress-bar-renderer.component';
import { PriorityRendererComponent } from './priority-renderer.component';
import { AssigneeAvatarRendererComponent } from './assignee-avatar-renderer.component';

@Component({
  selector: 'app-custom-renderers-grid',
  standalone: true,
  imports: [
    Grid, 
    CommonModule,
    ButtonCellRendererComponent,
    StatusBadgeRendererComponent,
    ProgressBarRendererComponent,
    PriorityRendererComponent,
    AssigneeAvatarRendererComponent
  ],
  templateUrl: './custom-renderers-grid.component.html',
  styleUrls: ['./custom-renderers-grid.component.scss']
})
export class CustomRenderersGridComponent implements OnInit {

  columns: ColumnDefinition[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Project Name', width: 200 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      cellRenderer: StatusBadgeRendererComponent,
      cellRendererParams: {
        statusConfig: {
          'completed': { class: 'status-active', icon: 'fa fa-check', label: 'Complete' },
          'in-progress': { class: 'status-pending', icon: 'fa fa-spinner', label: 'In Progress' },
          'cancelled': { class: 'status-inactive', icon: 'fa fa-ban', label: 'Cancelled' }
        }
      }
    },
    { 
      field: 'progress', 
      headerName: 'Progress', 
      width: 150,
      cellRenderer: ProgressBarRendererComponent
    },
    { 
      field: 'priority', 
      headerName: 'Priority', 
      width: 100,
      cellRenderer: PriorityRendererComponent
    },
    { 
      field: 'assignee', 
      headerName: 'Assignee', 
      width: 150,
      cellRenderer: AssigneeAvatarRendererComponent
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 150,
      cellRenderer: ButtonCellRendererComponent,
      cellRendererParams: {
        label: 'View Details',
        buttonClass: 'btn-primary',
        iconClass: 'fa fa-eye',
        onClick: (data: any) => this.viewDetails(data),
        isDisabled: (data: any) => data.status === 'cancelled'
      },
      sortable: false,
      filterable: false
    }
  ];

  config: GridConfig = {
    defaultColumnOptions: {
      resizable: true,
      sortable: true,
      filterable: true
    }
  };

  data = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const projectData = [
      { 
        id: 1, 
        name: 'Website Redesign', 
        status: 'in-progress', 
        progress: 75, 
        priority: 'high', 
        assignee: 'John Smith' 
      },
      { 
        id: 2, 
        name: 'Mobile App Development', 
        status: 'completed', 
        progress: 100, 
        priority: 'high', 
        assignee: 'Jane Doe' 
      },
      { 
        id: 3, 
        name: 'Database Migration', 
        status: 'in-progress', 
        progress: 30, 
        priority: 'medium', 
        assignee: 'Bob Johnson' 
      },
      { 
        id: 4, 
        name: 'Security Audit', 
        status: 'cancelled', 
        progress: 10, 
        priority: 'low', 
        assignee: 'Alice Brown' 
      },
      { 
        id: 5, 
        name: 'Performance Optimization', 
        status: 'in-progress', 
        progress: 90, 
        priority: 'high', 
        assignee: 'Charlie Wilson' 
      }
    ];

    this.data.set(projectData);
  }

  viewDetails(data: any) {
    console.log('Viewing details for:', data);
    alert(`Viewing details for project: ${data.name}`);
  }
}
```

### Template File (custom-renderers-grid.component.html)

```html
<div class="grid-container">
  <h2>Project Dashboard with Custom Renderers</h2>
  
  <div class="info-panel">
    <h3>Custom Renderers Demonstrated:</h3>
    <ul>
      <li><strong>Status Badge:</strong> Color-coded status indicators with icons</li>
      <li><strong>Progress Bar:</strong> Visual progress representation with percentage</li>
      <li><strong>Priority:</strong> Color-coded priority levels</li>
      <li><strong>Assignee Avatar:</strong> User avatars with initials</li>
      <li><strong>Action Buttons:</strong> Interactive buttons with click handlers</li>
    </ul>
  </div>

  <ng-ui-lib
    class="blg-theme-default"
    style="width: 100%; height: 500px;"
    [columns]="columns"
    [data]="data"
    [config]="config">
  </ng-ui-lib>
</div>
```

## 🔍 Migration Changes Summary

### Key Changes Made

1. **Component Architecture**
   ```typescript
   // Before: ICellRendererAngularComp interface
   export class ButtonCellRendererComponent implements ICellRendererAngularComp {
     agInit(params: any): void { /* setup */ }
     refresh(params: any): boolean { /* update */ }
   }
   
   // After: Standard Angular component with inputs
   export class ButtonCellRendererComponent {
     @Input() value: any;
     @Input() rowData: any;
     @Input() column: any;
     @Input() params: any;
   }
   ```

2. **No Framework Component Registration**
   ```typescript
   // Before: Register in gridOptions
   gridOptions: GridOptions = {
     frameworkComponents: {
       buttonCellRenderer: ButtonCellRendererComponent
     }
   };
   
   // After: Direct component reference
   cellRenderer: ButtonCellRendererComponent
   ```

3. **Simplified Event Handling**
   ```typescript
   // Before: Callback through params
   onClick(): void {
     if (this.params.onClick) {
       this.params.onClick(this.params.data);
     }
   }
   
   // After: Angular event emitters + callback
   @Output() buttonClick = new EventEmitter<any>();
   
   handleClick(): void {
     if (this.params?.onClick) {
       this.params.onClick(this.rowData);
     }
     this.buttonClick.emit(this.rowData);
   }
   ```

4. **Standalone Components**
   ```typescript
   // Before: NgModule registration required
   @NgModule({
     declarations: [ButtonCellRendererComponent],
     // ...
   })
   
   // After: Standalone components
   @Component({
     standalone: true,
     imports: [CommonModule],
     // ...
   })
   ```

5. **Template String Renderers to Components**
   ```typescript
   // Before: Template string renderer
   cellRenderer: (params: any) => {
     return `<span style="color: red">${params.value}</span>`;
   }
   
   // After: Dedicated component
   cellRenderer: PriorityRendererComponent
   ```

## 🧪 Testing Custom Renderers

### Interactive Testing Component

```typescript
// Add to main component for testing
export class CustomRenderersGridComponent implements OnInit {
  // ... existing code ...

  // Test dynamic data updates
  updateProgress() {
    this.data.update(currentData => 
      currentData.map(item => ({
        ...item,
        progress: Math.min(100, item.progress + 10)
      }))
    );
  }

  // Test status changes
  toggleStatus(id: number) {
    this.data.update(currentData => 
      currentData.map(item => 
        item.id === id 
          ? { 
              ...item, 
              status: item.status === 'completed' ? 'in-progress' : 'completed' 
            }
          : item
      )
    );
  }

  // Test data refresh
  refreshData() {
    this.loadData();
  }

  // Handle button clicks from renderer
  onButtonClick(rowData: any) {
    console.log('Button clicked for row:', rowData);
  }
}
```

### Add Test Controls to Template

```html
<div class="controls-panel">
  <h3>Test Controls:</h3>
  <button (click)="updateProgress()" class="btn btn-primary">
    Increase All Progress +10%
  </button>
  <button (click)="refreshData()" class="btn btn-secondary">
    Refresh Data
  </button>
</div>
```

## 📈 Expected Benefits

After migration, you should see:

- ✅ **Better Type Safety**: Full TypeScript support for renderer components
- ✅ **Angular Integration**: Native Angular component lifecycle and features
- ✅ **Easier Debugging**: Standard Angular debugging tools work
- ✅ **Better Performance**: Optimized change detection with OnPush
- ✅ **Reusable Components**: Renderers can be used outside the grid

## 🐛 Common Issues & Solutions

### Issue: Renderer not displaying
**Solution**: Ensure component is imported in the main component
```typescript
@Component({
  imports: [Grid, MyCustomRenderer], // Add your renderer here
  // ...
})
```

### Issue: Click events not working
**Solution**: Check event binding and parameters
```typescript
// Ensure onClick is passed in cellRendererParams
cellRendererParams: {
  onClick: (data: any) => this.myClickHandler(data)
}
```

### Issue: Parameters not being passed
**Solution**: Verify cellRendererParams structure
```typescript
cellRendererParams: {
  customProp: 'value',
  customFunction: this.myFunction.bind(this)
}
```

### Issue: Component not updating
**Solution**: Implement proper change detection
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## 🎉 Migration Completed!

Your custom cell renderers are now running on BLG Grid! This example demonstrated:

- Converting ag-Grid cell renderer components to standard Angular components
- Removing framework component registration
- Updating parameter passing and event handling
- Creating reusable renderer components
- Testing interactive renderers

**Next Steps:**
- [Example 4: Cell Editing](./04-cell-editing.md)
- [Example 5: Row Grouping](./05-row-grouping.md)
- [Custom Renderer Guide](../../features/rendering/custom-components.md)

**Migration Time**: ~2-3 hours for complex custom renderers like this.