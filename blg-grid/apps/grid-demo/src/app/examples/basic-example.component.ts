import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Grid } from '@blg/grid';
import { ColumnDefinition, GridConfig, GridEventType } from '@blg/core';

/**
 * Basic Grid Example Component
 * 
 * Demonstrates:
 * - Basic grid setup with data and columns
 * - Virtual scrolling with large dataset
 * - Sorting and filtering capabilities
 * - Row selection functionality
 * - Event handling
 */
@Component({
  selector: 'app-basic-example',
  standalone: true,
  imports: [CommonModule, Grid],
  template: `
    <div class="example-container">
      <h2>Basic Grid Example</h2>
      <p>A simple grid with 1000 rows demonstrating core functionality.</p>
      
      <div class="controls">
        <button (click)="generateData()" class="btn-primary">
          Generate New Data ({{ data().length }} rows)
        </button>
        <button (click)="clearSelection()" class="btn-secondary">
          Clear Selection
        </button>
        <button (click)="togglePagination()" class="btn-secondary">
          {{ config().pagination ? 'Disable' : 'Enable' }} Pagination
        </button>
        <span class="selection-info">
          Selected: {{ selectedCount() }} rows
        </span>
      </div>

      <div class="grid-wrapper">
        <blg-grid
          [data]="data()"
          [columns]="columns()"
          [config]="config()"
          (gridEvent)="onGridEvent($event)"
          (cellClick)="onCellClick($event)"
          (rowSelect)="onRowSelect($event)"
          (columnSort)="onColumnSort($event)"
          (columnResize)="onColumnResize($event)">
        </blg-grid>
      </div>

      <div class="event-log">
        <h3>Event Log</h3>
        <div class="log-content">
          @for (event of eventLog(); track $index) {
            <div class="log-entry">
              <span class="event-time">{{ event.timestamp | date:'HH:mm:ss.SSS' }}</span>
              <span class="event-type">{{ event.type }}</span>
              <span class="event-data">{{ formatEventData(event) }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        background: #1565c0;
      }
    }

    .btn-secondary {
      background: #616161;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        background: #424242;
      }
    }

    .selection-info {
      font-weight: 500;
      color: #666;
    }

    .grid-wrapper {
      flex: 1;
      min-height: 400px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .event-log {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }

    .log-content {
      padding: 8px;
    }

    .log-entry {
      display: flex;
      gap: 12px;
      padding: 4px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 12px;
      font-family: monospace;

      &:last-child {
        border-bottom: none;
      }
    }

    .event-time {
      color: #666;
      min-width: 80px;
    }

    .event-type {
      color: #1976d2;
      font-weight: 500;
      min-width: 120px;
    }

    .event-data {
      color: #333;
      flex: 1;
    }

    h2 {
      margin: 0 0 8px 0;
      color: #333;
    }

    h3 {
      margin: 0 0 8px 0;
      padding: 8px 12px;
      background: #f9f9f9;
      color: #333;
      font-size: 14px;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    // Custom cell renderer styles
    ::ng-deep .status-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      
      &.status-true {
        background-color: #e8f5e8;
        color: #2e7d32;
        border: 1px solid #4caf50;
      }
      
      &.status-false {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #f44336;
      }
    }
  `]
})
export class BasicExampleComponent implements OnInit {
  // Grid data and configuration
  data = signal<any[]>([]);
  columns = signal<ColumnDefinition[]>([]);
  config = signal<GridConfig>({});
  
  // Event tracking
  eventLog = signal<GridEventType[]>([]);
  selectedCount = signal<number>(0);

  ngOnInit(): void {
    this.setupColumns();
    this.setupConfig();
    this.generateData();
  }

  /**
   * Setup column definitions
   */
  private setupColumns(): void {
    this.columns.set([
      {
        id: 'id',
        field: 'id',
        header: 'ID',
        width: 80,
        type: 'number',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'firstName',
        field: 'firstName',
        header: 'First Name',
        width: 150,
        type: 'string',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'lastName',
        field: 'lastName',
        header: 'Last Name',
        width: 150,
        type: 'string',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'email',
        field: 'email',
        header: 'Email',
        width: 200,
        type: 'string',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'age',
        field: 'age',
        header: 'Age',
        width: 80,
        type: 'number',
        sortable: true,
        filterable: true,
        resizable: true,
        align: 'center'
      },
      {
        id: 'department',
        field: 'department',
        header: 'Department',
        width: 120,
        type: 'string',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'salary',
        field: 'salary',
        header: 'Salary',
        width: 120,
        type: 'number',
        sortable: true,
        filterable: true,
        resizable: true,
        align: 'right',
        cellRenderer: '${{value}}'
      },
      {
        id: 'isActive',
        field: 'isActive',
        header: 'Active',
        width: 80,
        type: 'boolean',
        sortable: true,
        filterable: true,
        resizable: true,
        align: 'center',
        cellRenderer: '<span class="status-badge status-{{isActive}}">{{value}}</span>'
      },
      {
        id: 'hireDate',
        field: 'hireDate',
        header: 'Hire Date',
        width: 120,
        type: 'date',
        sortable: true,
        filterable: true,
        resizable: true
      }
    ]);
  }

  /**
   * Setup grid configuration
   */
  private setupConfig(): void {
    this.config.set({
      virtualScrolling: true,
      rowHeight: 40,
      sortable: true,
      filterable: true,
      selectable: true,
      selectionMode: 'multiple',
      resizable: true,
      reorderable: true,
      showFooter: true,
      pagination: false,
      paginationConfig: {
        currentPage: 0,
        pageSize: 25,
        pageSizeOptions: [10, 25, 50, 100],
        mode: 'client',
        showPageSizeSelector: true,
        showPageInfo: true,
        maxPageButtons: 7
      }
    });
  }

  /**
   * Generate sample data
   */
  generateData(): void {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    const data = Array.from({ length: 1000 }, (_, i) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      return {
        id: i + 1,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
        age: Math.floor(Math.random() * 40) + 22,
        department: departments[Math.floor(Math.random() * departments.length)],
        salary: Math.floor(Math.random() * 100000) + 40000,
        isActive: Math.random() > 0.2,
        hireDate: new Date(2015 + Math.floor(Math.random() * 9), 
                          Math.floor(Math.random() * 12), 
                          Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
      };
    });

    this.data.set(data);
    this.selectedCount.set(0);
  }

  /**
   * Clear current selection
   */
  clearSelection(): void {
    // This would typically call a method on the grid component
    // For now, we'll just reset the counter
    this.selectedCount.set(0);
    this.addToEventLog({
      type: 'cell-click',
      data: { rowIndex: -1, columnId: 'selection', value: 'cleared', rowData: null },
      timestamp: new Date()
    } as GridEventType);
  }

  /**
   * Handle all grid events
   */
  onGridEvent(event: GridEventType): void {
    this.addToEventLog(event);
  }

  /**
   * Handle cell click events
   */
  onCellClick(event: any): void {
    console.log('Cell clicked:', event);
  }

  /**
   * Handle row selection events
   */
  onRowSelect(event: any): void {
    // Update selection counter (simplified)
    if (event.data.selected) {
      this.selectedCount.update(count => count + 1);
    } else {
      this.selectedCount.update(count => Math.max(0, count - 1));
    }
  }

  /**
   * Handle column sort events
   */
  onColumnSort(event: any): void {
    console.log('Column sorted:', event);
  }

  /**
   * Handle column resize events
   */
  onColumnResize(event: any): void {
    console.log('Column resized:', event);
  }

  /**
   * Toggle pagination
   */
  togglePagination(): void {
    const currentPagination = this.config().pagination;
    this.config.update(config => ({
      ...config,
      pagination: !currentPagination,
      virtualScrolling: currentPagination === true // Enable virtual scrolling when disabling pagination
    }));
  }

  /**
   * Add event to the event log
   */
  private addToEventLog(event: GridEventType): void {
    this.eventLog.update(log => {
      const newLog = [event, ...log];
      // Keep only the last 50 events
      return newLog.slice(0, 50);
    });
  }

  /**
   * Format event data for display
   */
  formatEventData(event: GridEventType): string {
    if (!('data' in event) || !event.data) return 'No data';
    
    switch (event.type) {
      case 'cell-click':
        const cellData = event.data as any;
        return `Row: ${cellData.rowIndex}, Column: ${cellData.columnId}, Value: ${cellData.value}`;
      case 'row-select':
        const rowData = event.data as any;
        return `Row: ${rowData.rowIndex}, Selected: ${rowData.selected}`;
      case 'column-sort':
        const sortData = event.data as any;
        return `Column: ${sortData.columnId}, Direction: ${sortData.direction || 'none'}`;
      case 'column-resize':
        const resizeData = event.data as any;
        return `Column: ${resizeData.columnId}, Width: ${resizeData.width}px (was ${resizeData.oldWidth}px)`;
      default:
        return JSON.stringify((event as any).data);
    }
  }
}