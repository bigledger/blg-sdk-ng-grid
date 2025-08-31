import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Grid, TextFilterComponent, NumberFilterComponent, DateFilterComponent, BooleanFilterComponent } from '@blg/grid';
import { ColumnDefinition, GridConfig } from '@blg/core';

/**
 * Filtering Grid Example Component
 * 
 * Demonstrates:
 * - Different filter types (text, number, date, boolean)
 * - Custom filter components
 * - Complex filtering logic
 * - Filter state management
 */
@Component({
  selector: 'app-filtering-example',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    Grid,
    TextFilterComponent,
    NumberFilterComponent,
    DateFilterComponent,
    BooleanFilterComponent
  ],
  template: `
    <div class="example-container">
      <h2>Advanced Filtering Example</h2>
      <p>Demonstrates various filter types and custom filtering functionality.</p>
      
      <div class="filter-controls">
        <h3>External Filters</h3>
        <div class="external-filters">
          <div class="filter-group">
            <label>Name Filter:</label>
            <blg-text-filter
              placeholder="Search names..."
              (filterChange)="onExternalNameFilter($event)">
            </blg-text-filter>
          </div>

          <div class="filter-group">
            <label>Salary Filter:</label>
            <blg-number-filter
              placeholder="Amount"
              ariaLabel="Salary filter"
              (filterChange)="onExternalSalaryFilter($event)">
            </blg-number-filter>
          </div>

          <div class="filter-group">
            <label>Hire Date Filter:</label>
            <blg-date-filter
              ariaLabel="Hire date filter"
              (filterChange)="onExternalDateFilter($event)">
            </blg-date-filter>
          </div>

          <div class="filter-group">
            <label>Active Status:</label>
            <blg-boolean-filter
              trueLabel="Active"
              falseLabel="Inactive"
              ariaLabel="Active status filter"
              (filterChange)="onExternalActiveFilter($event)">
            </blg-boolean-filter>
          </div>

          <button (click)="clearAllFilters()" class="btn-secondary">
            Clear All Filters
          </button>
        </div>
      </div>

      <div class="filter-summary">
        <div class="summary-item">
          <strong>Total Rows:</strong> {{ originalData().length }}
        </div>
        <div class="summary-item">
          <strong>Filtered Rows:</strong> {{ data().length }}
        </div>
        <div class="summary-item">
          <strong>Active Filters:</strong> {{ activeFilterCount() }}
        </div>
      </div>

      <div class="grid-wrapper">
        <blg-grid
          [data]="data()"
          [columns]="columns()"
          [config]="config()"
          (gridEvent)="onGridEvent($event)">
        </blg-grid>
      </div>

      <div class="filter-examples">
        <h3>Filter Examples</h3>
        <div class="examples-grid">
          <div class="example-item">
            <h4>Text Filtering</h4>
            <ul>
              <li>Case-insensitive search</li>
              <li>Partial string matching</li>
              <li>Real-time filtering with debouncing</li>
            </ul>
          </div>

          <div class="example-item">
            <h4>Number Filtering</h4>
            <ul>
              <li>Equals, not equals, greater than, less than</li>
              <li>Between range filtering</li>
              <li>Input validation</li>
            </ul>
          </div>

          <div class="example-item">
            <h4>Date Filtering</h4>
            <ul>
              <li>Before, after, equals</li>
              <li>Date range filtering</li>
              <li>ISO date format support</li>
            </ul>
          </div>

          <div class="example-item">
            <h4>Boolean Filtering</h4>
            <ul>
              <li>True/False/All options</li>
              <li>Custom labels</li>
              <li>Checkbox-style filtering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filter-controls {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #e0e0e0;

      h3 {
        margin: 0 0 16px 0;
        color: #333;
        font-size: 18px;
      }
    }

    .external-filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-weight: 500;
        color: #333;
        font-size: 14px;
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
      height: fit-content;

      &:hover {
        background: #424242;
      }
    }

    .filter-summary {
      display: flex;
      gap: 24px;
      padding: 16px;
      background: #e3f2fd;
      border-radius: 4px;
      margin-bottom: 20px;
      border-left: 4px solid #1976d2;
    }

    .summary-item {
      font-size: 14px;
      color: #0d47a1;

      strong {
        color: #1976d2;
      }
    }

    .grid-wrapper {
      height: 600px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .filter-examples {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;

      h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
      }
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .example-item {
      background: white;
      padding: 16px;
      border-radius: 4px;
      border: 1px solid #ddd;

      h4 {
        margin: 0 0 12px 0;
        color: #1976d2;
        font-size: 16px;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 6px;
          color: #666;
          font-size: 14px;
          line-height: 1.4;
        }
      }
    }

    h2 {
      margin: 0 0 8px 0;
      color: #333;
    }

    p {
      margin: 0 0 20px 0;
      color: #666;
      font-size: 14px;
    }
  `]
})
export class FilteringExampleComponent implements OnInit {
  // Grid data and configuration
  originalData = signal<any[]>([]);
  data = signal<any[]>([]);
  columns = signal<ColumnDefinition[]>([]);
  config = signal<GridConfig>({});
  
  // External filters
  private externalFilters = signal<Record<string, any>>({});
  activeFilterCount = signal<number>(0);

  ngOnInit(): void {
    this.setupColumns();
    this.setupConfig();
    this.generateData();
  }

  /**
   * Setup column definitions with filtering enabled
   */
  private setupColumns(): void {
    this.columns.set([
      {
        id: 'id',
        field: 'id',
        header: 'Employee ID',
        width: 120,
        type: 'number',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'fullName',
        field: 'fullName',
        header: 'Full Name',
        width: 180,
        type: 'string',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'email',
        field: 'email',
        header: 'Email',
        width: 220,
        type: 'string',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'department',
        field: 'department',
        header: 'Department',
        width: 140,
        type: 'string',
        sortable: true,
        filterable: true,
        resizable: true
      },
      {
        id: 'position',
        field: 'position',
        header: 'Position',
        width: 160,
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
        align: 'right'
      },
      {
        id: 'hireDate',
        field: 'hireDate',
        header: 'Hire Date',
        width: 130,
        type: 'date',
        sortable: true,
        filterable: true,
        resizable: true
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
        align: 'center'
      },
      {
        id: 'performance',
        field: 'performance',
        header: 'Performance',
        width: 120,
        type: 'number',
        sortable: true,
        filterable: true,
        resizable: true,
        align: 'center'
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
      showFooter: true
    });
  }

  /**
   * Generate sample employee data
   */
  private generateData(): void {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Legal'];
    const positions = {
      'Engineering': ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'Engineering Manager'],
      'Marketing': ['Marketing Specialist', 'Digital Marketer', 'Content Manager', 'Marketing Director'],
      'Sales': ['Sales Representative', 'Account Manager', 'Sales Director', 'Business Development'],
      'HR': ['HR Specialist', 'Recruiter', 'HR Manager', 'HR Director'],
      'Finance': ['Financial Analyst', 'Accountant', 'Finance Manager', 'CFO'],
      'Operations': ['Operations Specialist', 'Project Manager', 'Operations Manager', 'VP Operations'],
      'Design': ['UI Designer', 'UX Designer', 'Design Lead', 'Creative Director'],
      'Legal': ['Legal Counsel', 'Paralegal', 'Legal Director', 'General Counsel']
    };

    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica', 'William', 'Ashley', 
                       'James', 'Amanda', 'Christopher', 'Stephanie', 'Daniel', 'Nicole', 'Matthew', 'Elizabeth', 'Anthony', 'Helen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

    const data = Array.from({ length: 500 }, (_, i) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const positionList = positions[department as keyof typeof positions];
      const position = positionList[Math.floor(Math.random() * positionList.length)];

      return {
        id: 1000 + i,
        fullName: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
        department,
        position,
        salary: Math.floor(Math.random() * 150000) + 50000,
        hireDate: new Date(
          2015 + Math.floor(Math.random() * 9),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ).toISOString().split('T')[0],
        isActive: Math.random() > 0.1, // 90% active
        performance: Math.floor(Math.random() * 40) + 60 // 60-100 performance score
      };
    });

    this.originalData.set(data);
    this.data.set(data);
  }

  /**
   * Handle external name filter
   */
  onExternalNameFilter(value: string): void {
    this.updateExternalFilter('name', value);
  }

  /**
   * Handle external salary filter
   */
  onExternalSalaryFilter(value: any): void {
    this.updateExternalFilter('salary', value);
  }

  /**
   * Handle external date filter
   */
  onExternalDateFilter(value: any): void {
    this.updateExternalFilter('date', value);
  }

  /**
   * Handle external active filter
   */
  onExternalActiveFilter(value: boolean | null): void {
    this.updateExternalFilter('active', value);
  }

  /**
   * Update external filter and apply all filters
   */
  private updateExternalFilter(key: string, value: any): void {
    this.externalFilters.update(filters => {
      const newFilters = { ...filters };
      if (value === null || value === '' || value === undefined) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });

    this.applyAllFilters();
    this.updateActiveFilterCount();
  }

  /**
   * Apply all external filters to the data
   */
  private applyAllFilters(): void {
    let filteredData = [...this.originalData()];
    const filters = this.externalFilters();

    // Apply name filter
    if (filters['name']) {
      const nameFilter = filters['name'].toLowerCase();
      filteredData = filteredData.filter(row => 
        row.fullName.toLowerCase().includes(nameFilter) ||
        row.email.toLowerCase().includes(nameFilter)
      );
    }

    // Apply salary filter
    if (filters['salary']) {
      const salaryFilter = filters['salary'];
      filteredData = filteredData.filter(row => {
        const salary = row.salary;
        switch (salaryFilter.operator) {
          case 'eq': return salary === salaryFilter.value;
          case 'ne': return salary !== salaryFilter.value;
          case 'lt': return salary < salaryFilter.value;
          case 'le': return salary <= salaryFilter.value;
          case 'gt': return salary > salaryFilter.value;
          case 'ge': return salary >= salaryFilter.value;
          case 'between': 
            return salary >= salaryFilter.value && 
                   (salaryFilter.value2 === null || salary <= salaryFilter.value2);
          default: return true;
        }
      });
    }

    // Apply date filter
    if (filters['date']) {
      const dateFilter = filters['date'];
      filteredData = filteredData.filter(row => {
        const rowDate = new Date(row.hireDate);
        const filterDate = new Date(dateFilter.value);
        
        switch (dateFilter.operator) {
          case 'eq': return rowDate.toDateString() === filterDate.toDateString();
          case 'ne': return rowDate.toDateString() !== filterDate.toDateString();
          case 'before': return rowDate < filterDate;
          case 'after': return rowDate > filterDate;
          case 'between':
            const endDate = new Date(dateFilter.value2);
            return rowDate >= filterDate && rowDate <= endDate;
          default: return true;
        }
      });
    }

    // Apply active filter
    if (filters['active'] !== null && filters['active'] !== undefined) {
      filteredData = filteredData.filter(row => row.isActive === filters['active']);
    }

    this.data.set(filteredData);
  }

  /**
   * Clear all external filters
   */
  clearAllFilters(): void {
    this.externalFilters.set({});
    this.data.set([...this.originalData()]);
    this.activeFilterCount.set(0);
  }

  /**
   * Update active filter count
   */
  private updateActiveFilterCount(): void {
    const filterCount = Object.keys(this.externalFilters()).length;
    this.activeFilterCount.set(filterCount);
  }

  /**
   * Handle grid events
   */
  onGridEvent(event: any): void {
    console.log('Grid event:', event);
  }
}