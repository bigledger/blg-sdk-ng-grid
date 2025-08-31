import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Grid } from '@blg/grid';
import { ColumnDefinition, GridConfig } from '@blg/core';

/**
 * Example demonstrating grouping and export functionality
 */
@Component({
  selector: 'app-grouping-export-example',
  standalone: true,
  imports: [CommonModule, Grid],
  template: `
    <div class="example-container">
      <div class="example-header">
        <h2>Row Grouping & Data Export Example</h2>
        <p>
          Demonstrates row grouping with aggregations and data export functionality.
          Use the grouping toolbar to group by columns and add aggregations.
          Use the export toolbar to export data in CSV or Excel format.
        </p>
      </div>

      <div class="example-content">
        <blg-grid
          [data]="sampleData()"
          [columns]="columns()"
          [config]="gridConfig()"
          class="example-grid">
        </blg-grid>
      </div>

      <div class="example-info">
        <h3>Features Demonstrated:</h3>
        <ul>
          <li><strong>Row Grouping:</strong> Drag columns to the grouping area to create groups</li>
          <li><strong>Multi-level Grouping:</strong> Group by multiple columns for nested groups</li>
          <li><strong>Aggregations:</strong> Add sum, average, count, min, max calculations to groups</li>
          <li><strong>Group Controls:</strong> Expand/collapse individual groups or all groups</li>
          <li><strong>CSV Export:</strong> Export data with customizable options (delimiter, encoding, etc.)</li>
          <li><strong>Excel Export:</strong> Export to Excel with formatting and styling options</li>
          <li><strong>Export Scopes:</strong> Choose to export all data, filtered data, or only visible data</li>
          <li><strong>Export Configuration:</strong> Customize filename, headers, and format-specific options</li>
        </ul>
      </div>
    </div>
  `,
  styleUrl: './examples.scss'
})
export class GroupingExportExampleComponent {
  
  readonly columns = signal<ColumnDefinition[]>([
    {
      id: 'department',
      field: 'department',
      header: 'Department',
      width: 150,
      type: 'string',
      sortable: true,
      filterable: true
    },
    {
      id: 'region',
      field: 'region',
      header: 'Region',
      width: 120,
      type: 'string',
      sortable: true,
      filterable: true
    },
    {
      id: 'employee',
      field: 'employeeName',
      header: 'Employee',
      width: 200,
      type: 'string',
      sortable: true,
      filterable: true
    },
    {
      id: 'position',
      field: 'position',
      header: 'Position',
      width: 150,
      type: 'string',
      sortable: true,
      filterable: true
    },
    {
      id: 'salary',
      field: 'salary',
      header: 'Salary',
      width: 120,
      type: 'number',
      sortable: true,
      filterable: true,
      align: 'right'
    },
    {
      id: 'bonus',
      field: 'bonus',
      header: 'Bonus',
      width: 100,
      type: 'number',
      sortable: true,
      filterable: true,
      align: 'right'
    },
    {
      id: 'startDate',
      field: 'startDate',
      header: 'Start Date',
      width: 120,
      type: 'date',
      sortable: true,
      filterable: true
    },
    {
      id: 'active',
      field: 'active',
      header: 'Active',
      width: 80,
      type: 'boolean',
      sortable: true,
      filterable: true,
      align: 'center'
    }
  ]);

  readonly gridConfig = signal<GridConfig>({
    virtualScrolling: true,
    sortable: true,
    filterable: true,
    selectable: true,
    selectionMode: 'multiple',
    resizable: true,
    reorderable: true,
    grouping: true,
    export: true,
    groupingConfig: {
      expandedByDefault: true,
      showGroupCount: true,
      aggregations: {
        salary: [
          'sum' as const,
          'avg' as const
        ],
        bonus: [
          'sum' as const,
          'avg' as const
        ]
      }
    },
    exportConfig: {
      formats: ['csv', 'excel'],
      defaultFilename: 'employee-data',
      includeHeaders: true,
      dataScope: 'visible',
      csvOptions: {
        delimiter: ',',
        qualifier: '"',
        lineEnding: '\n',
        includeBom: true
      },
      excelOptions: {
        sheetName: 'Employees',
        autoSizeColumns: true,
        applyBasicStyling: true
      }
    }
  });

  readonly sampleData = signal([
    {
      id: 1,
      department: 'Engineering',
      region: 'North America',
      employeeName: 'John Doe',
      position: 'Senior Developer',
      salary: 95000,
      bonus: 8000,
      startDate: '2021-03-15',
      active: true
    },
    {
      id: 2,
      department: 'Engineering',
      region: 'North America',
      employeeName: 'Jane Smith',
      position: 'Lead Developer',
      salary: 110000,
      bonus: 12000,
      startDate: '2020-01-10',
      active: true
    },
    {
      id: 3,
      department: 'Engineering',
      region: 'Europe',
      employeeName: 'Pierre Laurent',
      position: 'Developer',
      salary: 75000,
      bonus: 5000,
      startDate: '2022-06-01',
      active: true
    },
    {
      id: 4,
      department: 'Marketing',
      region: 'North America',
      employeeName: 'Sarah Johnson',
      position: 'Marketing Manager',
      salary: 85000,
      bonus: 7000,
      startDate: '2021-09-15',
      active: true
    },
    {
      id: 5,
      department: 'Marketing',
      region: 'Europe',
      employeeName: 'Marco Rossi',
      position: 'Content Specialist',
      salary: 55000,
      bonus: 3000,
      startDate: '2022-02-20',
      active: true
    },
    {
      id: 6,
      department: 'Sales',
      region: 'North America',
      employeeName: 'Michael Brown',
      position: 'Sales Representative',
      salary: 65000,
      bonus: 15000,
      startDate: '2021-11-05',
      active: true
    },
    {
      id: 7,
      department: 'Sales',
      region: 'Europe',
      employeeName: 'Anna Schmidt',
      position: 'Sales Manager',
      salary: 90000,
      bonus: 18000,
      startDate: '2020-08-12',
      active: true
    },
    {
      id: 8,
      department: 'HR',
      region: 'North America',
      employeeName: 'David Wilson',
      position: 'HR Specialist',
      salary: 60000,
      bonus: 4000,
      startDate: '2021-12-01',
      active: true
    },
    {
      id: 9,
      department: 'HR',
      region: 'Asia',
      employeeName: 'Yuki Tanaka',
      position: 'HR Manager',
      salary: 80000,
      bonus: 6000,
      startDate: '2020-05-18',
      active: true
    },
    {
      id: 10,
      department: 'Finance',
      region: 'North America',
      employeeName: 'Lisa Chen',
      position: 'Financial Analyst',
      salary: 70000,
      bonus: 5500,
      startDate: '2021-07-22',
      active: true
    },
    {
      id: 11,
      department: 'Finance',
      region: 'Europe',
      employeeName: 'Thomas Mueller',
      position: 'Controller',
      salary: 95000,
      bonus: 8500,
      startDate: '2019-11-30',
      active: true
    },
    {
      id: 12,
      department: 'Engineering',
      region: 'Asia',
      employeeName: 'Raj Patel',
      position: 'Senior Developer',
      salary: 88000,
      bonus: 7500,
      startDate: '2021-04-08',
      active: true
    },
    {
      id: 13,
      department: 'Marketing',
      region: 'Asia',
      employeeName: 'Lei Wang',
      position: 'Digital Marketing Specialist',
      salary: 58000,
      bonus: 3500,
      startDate: '2022-01-15',
      active: true
    },
    {
      id: 14,
      department: 'Sales',
      region: 'Asia',
      employeeName: 'Hiroshi Sato',
      position: 'Regional Sales Director',
      salary: 120000,
      bonus: 22000,
      startDate: '2018-03-05',
      active: true
    },
    {
      id: 15,
      department: 'Engineering',
      region: 'North America',
      employeeName: 'Emily Rodriguez',
      position: 'DevOps Engineer',
      salary: 92000,
      bonus: 8200,
      startDate: '2021-08-10',
      active: false
    },
    {
      id: 16,
      department: 'Marketing',
      region: 'North America',
      employeeName: 'Robert Taylor',
      position: 'Brand Manager',
      salary: 78000,
      bonus: 6500,
      startDate: '2020-10-25',
      active: false
    },
    {
      id: 17,
      department: 'Finance',
      region: 'Asia',
      employeeName: 'Priya Sharma',
      position: 'Finance Manager',
      salary: 85000,
      bonus: 7200,
      startDate: '2020-12-15',
      active: true
    },
    {
      id: 18,
      department: 'HR',
      region: 'Europe',
      employeeName: 'Marie Dubois',
      position: 'Recruitment Specialist',
      salary: 52000,
      bonus: 3200,
      startDate: '2022-03-08',
      active: true
    },
    {
      id: 19,
      department: 'Sales',
      region: 'North America',
      employeeName: 'James Anderson',
      position: 'Account Executive',
      salary: 68000,
      bonus: 14000,
      startDate: '2021-05-12',
      active: true
    },
    {
      id: 20,
      department: 'Engineering',
      region: 'Europe',
      employeeName: 'Oliver Thompson',
      position: 'Software Architect',
      salary: 125000,
      bonus: 15000,
      startDate: '2019-07-01',
      active: true
    }
  ]);
}