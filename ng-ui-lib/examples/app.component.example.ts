import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// BigLedger UI Components
import { BigLedgerGridComponent } from '@bigledger/ng-ui-grid';
import { BlgChart2DComponent } from '@bigledger/ng-ui-charts-2d';
import { BlgEditorComponent } from '@bigledger/ng-ui-editor-core';

// BigLedger Core Types
import { 
  GridConfig, 
  ColumnDefinition,
  ChartConfig,
  EditorConfig
} from '@bigledger/ng-ui-core';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  salary: number;
  hireDate: Date;
  isActive: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BigLedgerGridComponent,
    BlgChart2DComponent,
    BlgEditorComponent
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>BigLedger UI Kit Demo</h1>
        <p>Enterprise Angular components for data visualization and editing</p>
      </header>

      <main class="app-main">
        <!-- Data Grid Example -->
        <section class="demo-section">
          <h2>Data Grid</h2>
          <div class="grid-container">
            <blg-grid 
              [config]="gridConfig()"
              (rowSelect)="onRowSelect($event)"
              (cellEdit)="onCellEdit($event)">
            </blg-grid>
          </div>
        </section>

        <!-- Chart Example -->
        <section class="demo-section">
          <h2>Charts</h2>
          <div class="chart-container">
            <blg-chart-2d 
              [config]="chartConfig()"
              (chartClick)="onChartClick($event)">
            </blg-chart-2d>
          </div>
        </section>

        <!-- Rich Text Editor Example -->
        <section class="demo-section">
          <h2>Rich Text Editor</h2>
          <div class="editor-container">
            <blg-editor 
              [config]="editorConfig()"
              [(content)]="editorContent"
              (contentChange)="onContentChange($event)">
            </blg-editor>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .app-header {
      background: white;
      padding: 2rem;
      border-bottom: 1px solid #e0e0e0;
      text-align: center;
    }

    .app-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2.5rem;
    }

    .app-header p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }

    .app-main {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .demo-section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .demo-section h2 {
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 1.5rem;
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
    }

    .grid-container {
      height: 400px;
    }

    .chart-container {
      height: 300px;
    }

    .editor-container {
      min-height: 200px;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'BigLedger UI Kit Demo';
  
  // Signals for reactive state management
  employees = signal<Employee[]>([]);
  editorContent = '<p>Welcome to the BigLedger Rich Text Editor!</p>';

  // Grid Configuration
  gridConfig = signal<GridConfig>({
    data: [],
    columns: [
      { 
        field: 'id', 
        header: 'ID', 
        width: 80, 
        sortable: true,
        type: 'number'
      },
      { 
        field: 'firstName', 
        header: 'First Name', 
        sortable: true, 
        filterable: true,
        editable: true
      },
      { 
        field: 'lastName', 
        header: 'Last Name', 
        sortable: true, 
        filterable: true,
        editable: true
      },
      { 
        field: 'email', 
        header: 'Email', 
        sortable: true, 
        filterable: true,
        width: 200
      },
      { 
        field: 'department', 
        header: 'Department', 
        sortable: true, 
        filterable: true,
        editable: true
      },
      { 
        field: 'salary', 
        header: 'Salary', 
        sortable: true, 
        filterable: true,
        type: 'currency',
        width: 120,
        editable: true
      },
      { 
        field: 'hireDate', 
        header: 'Hire Date', 
        sortable: true, 
        filterable: true,
        type: 'date',
        width: 130
      },
      { 
        field: 'isActive', 
        header: 'Active', 
        sortable: true, 
        filterable: true,
        type: 'boolean',
        width: 90,
        editable: true
      }
    ],
    pagination: {
      enabled: true,
      pageSize: 25,
      showSizeOptions: true,
      sizeOptions: [10, 25, 50, 100]
    },
    sorting: {
      enabled: true,
      mode: 'multiple'
    },
    filtering: {
      enabled: true,
      mode: 'popup'
    },
    selection: {
      enabled: true,
      mode: 'multiple'
    },
    editing: {
      enabled: true,
      mode: 'inline'
    },
    theme: 'light'
  });

  // Chart Configuration
  chartConfig = signal<ChartConfig>({
    type: 'bar',
    data: {
      labels: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'],
      datasets: [{
        label: 'Employees by Department',
        data: [45, 32, 18, 12, 23],
        backgroundColor: [
          '#007bff',
          '#28a745',
          '#ffc107',
          '#dc3545',
          '#6f42c1'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Employee Distribution by Department'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Employees'
          }
        }
      }
    }
  });

  // Editor Configuration
  editorConfig = signal<EditorConfig>({
    toolbar: {
      enabled: true,
      items: [
        'bold', 'italic', 'underline', 'strikethrough',
        '|',
        'heading1', 'heading2', 'heading3',
        '|',
        'bulletList', 'orderedList',
        '|',
        'link', 'image', 'table',
        '|',
        'undo', 'redo'
      ]
    },
    plugins: ['formats', 'media', 'tables'],
    theme: 'light',
    placeholder: 'Start typing your content here...',
    minHeight: 200,
    maxHeight: 500
  });

  ngOnInit() {
    // Generate sample employee data
    this.generateSampleData();
    
    // Update grid configuration with data
    this.gridConfig.update(config => ({
      ...config,
      data: this.employees()
    }));
  }

  private generateSampleData(): void {
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    const employees: Employee[] = [];
    
    for (let i = 1; i <= 100; i++) {
      employees.push({
        id: i,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        email: \`employee\${i}@company.com\`,
        department: departments[Math.floor(Math.random() * departments.length)],
        salary: Math.floor(Math.random() * 100000) + 40000,
        hireDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 5) * 24 * 60 * 60 * 1000),
        isActive: Math.random() > 0.1
      });
    }
    
    this.employees.set(employees);
  }

  // Event Handlers
  onRowSelect(event: any): void {
    console.log('Selected rows:', event.selectedRows);
  }

  onCellEdit(event: any): void {
    console.log('Cell edited:', {
      field: event.field,
      oldValue: event.oldValue,
      newValue: event.newValue,
      rowData: event.rowData
    });
    
    // Update the data
    const employees = this.employees();
    const index = employees.findIndex(emp => emp.id === event.rowData.id);
    if (index >= 0) {
      employees[index] = { ...employees[index], [event.field]: event.newValue };
      this.employees.set([...employees]);
    }
  }

  onChartClick(event: any): void {
    console.log('Chart clicked:', event);
  }

  onContentChange(content: string): void {
    console.log('Editor content changed:', content);
  }
}