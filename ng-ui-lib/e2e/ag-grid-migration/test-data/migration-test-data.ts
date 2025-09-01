/**
 * Test Data for ag-Grid to BigLedger Grid Migration Tests
 */

import { AgGridOptions, AgGridColumn } from '../utils/ag-grid-types.js';

export class MigrationTestData {
  
  /**
   * Basic test data for simple grids
   */
  static getBasicRowData() {
    return [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', age: 30, salary: 50000, department: 'Engineering' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', age: 28, salary: 55000, department: 'Marketing' },
      { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', age: 35, salary: 60000, department: 'Engineering' },
      { id: 4, firstName: 'Alice', lastName: 'Brown', email: 'alice.brown@example.com', age: 32, salary: 58000, department: 'HR' },
      { id: 5, firstName: 'Charlie', lastName: 'Davis', email: 'charlie.davis@example.com', age: 29, salary: 52000, department: 'Marketing' },
      { id: 6, firstName: 'Diana', lastName: 'Wilson', email: 'diana.wilson@example.com', age: 31, salary: 61000, department: 'Engineering' },
      { id: 7, firstName: 'Edward', lastName: 'Taylor', email: 'edward.taylor@example.com', age: 27, salary: 49000, department: 'Sales' },
      { id: 8, firstName: 'Fiona', lastName: 'Anderson', email: 'fiona.anderson@example.com', age: 33, salary: 59000, department: 'HR' },
      { id: 9, firstName: 'George', lastName: 'Thomas', email: 'george.thomas@example.com', age: 26, salary: 48000, department: 'Sales' },
      { id: 10, firstName: 'Helen', lastName: 'Jackson', email: 'helen.jackson@example.com', age: 34, salary: 62000, department: 'Engineering' }
    ];
  }

  /**
   * Basic column definitions
   */
  static getBasicColumnDefs(): AgGridColumn[] {
    return [
      { field: 'id', headerName: 'ID', width: 80, sortable: true },
      { field: 'firstName', headerName: 'First Name', width: 120, sortable: true, filter: 'agTextColumnFilter' },
      { field: 'lastName', headerName: 'Last Name', width: 120, sortable: true, filter: 'agTextColumnFilter' },
      { field: 'email', headerName: 'Email', width: 200, sortable: true, filter: 'agTextColumnFilter' },
      { field: 'age', headerName: 'Age', width: 80, sortable: true, filter: 'agNumberColumnFilter' },
      { field: 'salary', headerName: 'Salary', width: 120, sortable: true, filter: 'agNumberColumnFilter' },
      { field: 'department', headerName: 'Department', width: 150, sortable: true, filter: 'agTextColumnFilter' }
    ];
  }

  /**
   * Basic ag-Grid configuration
   */
  static getBasicAgGridOptions(): AgGridOptions {
    return {
      rowData: this.getBasicRowData(),
      columnDefs: this.getBasicColumnDefs(),
      pagination: true,
      paginationPageSize: 5,
      rowSelection: 'single',
      enableFilter: true,
      animateRows: true,
      onGridReady: (params) => {
        console.log('Grid ready:', params);
      }
    };
  }

  /**
   * Advanced grid configuration with sorting, filtering, and pagination
   */
  static getAdvancedAgGridOptions(): AgGridOptions {
    return {
      rowData: this.getBasicRowData(),
      columnDefs: [
        { 
          field: 'id', 
          headerName: 'ID', 
          width: 80, 
          sortable: true,
          checkboxSelection: true,
          headerCheckboxSelection: true
        },
        { 
          field: 'firstName', 
          headerName: 'First Name', 
          width: 120, 
          sortable: true, 
          filter: 'agTextColumnFilter',
          cellRenderer: 'agAnimateShowChangeCellRenderer'
        },
        { 
          field: 'lastName', 
          headerName: 'Last Name', 
          width: 120, 
          sortable: true, 
          filter: 'agTextColumnFilter' 
        },
        { 
          field: 'email', 
          headerName: 'Email', 
          width: 200, 
          sortable: true, 
          filter: 'agTextColumnFilter',
          cellRenderer: (params: any) => `<a href="mailto:${params.value}">${params.value}</a>`
        },
        { 
          field: 'age', 
          headerName: 'Age', 
          width: 80, 
          sortable: true, 
          filter: 'agNumberColumnFilter' 
        },
        { 
          field: 'salary', 
          headerName: 'Salary', 
          width: 120, 
          sortable: true, 
          filter: 'agNumberColumnFilter',
          valueFormatter: (params: any) => `$${params.value?.toLocaleString()}`
        },
        { 
          field: 'department', 
          headerName: 'Department', 
          width: 150, 
          sortable: true, 
          filter: 'agSetColumnFilter' 
        }
      ],
      pagination: true,
      paginationPageSize: 10,
      paginationAutoPageSize: false,
      rowSelection: 'multiple',
      suppressRowClickSelection: false,
      enableFilter: true,
      sortingOrder: ['asc', 'desc', null],
      suppressMultiSort: false,
      multiSortKey: 'ctrl',
      animateRows: true,
      enableCellChangeFlash: true,
      rowHeight: 40,
      headerHeight: 45,
      theme: 'ag-theme-alpine'
    };
  }

  /**
   * Grid with custom cell renderers
   */
  static getCellRendererAgGridOptions(): AgGridOptions {
    return {
      rowData: this.getBasicRowData(),
      columnDefs: [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'firstName', headerName: 'Name', width: 200, cellRenderer: this.fullNameRenderer },
        { 
          field: 'email', 
          headerName: 'Contact', 
          width: 200, 
          cellRenderer: this.emailLinkRenderer 
        },
        { 
          field: 'salary', 
          headerName: 'Salary', 
          width: 150, 
          cellRenderer: this.currencyRenderer 
        },
        { 
          field: 'department', 
          headerName: 'Department', 
          width: 120, 
          cellRenderer: this.departmentBadgeRenderer 
        },
        {
          headerName: 'Actions',
          width: 120,
          cellRenderer: this.actionButtonsRenderer,
          pinned: 'right'
        }
      ],
      rowSelection: 'single',
      enableFilter: true
    };
  }

  /**
   * Grid with cell editors
   */
  static getCellEditorAgGridOptions(): AgGridOptions {
    return {
      rowData: this.getBasicRowData(),
      columnDefs: [
        { field: 'id', headerName: 'ID', width: 80, editable: false },
        { 
          field: 'firstName', 
          headerName: 'First Name', 
          width: 120, 
          editable: true,
          cellEditor: 'agTextCellEditor'
        },
        { 
          field: 'lastName', 
          headerName: 'Last Name', 
          width: 120, 
          editable: true,
          cellEditor: 'agTextCellEditor'
        },
        { 
          field: 'age', 
          headerName: 'Age', 
          width: 80, 
          editable: true,
          cellEditor: 'agNumericCellEditor',
          cellEditorParams: {
            min: 18,
            max: 100
          }
        },
        { 
          field: 'salary', 
          headerName: 'Salary', 
          width: 120, 
          editable: true,
          cellEditor: 'agNumericCellEditor',
          valueFormatter: (params: any) => `$${params.value?.toLocaleString()}`
        },
        { 
          field: 'department', 
          headerName: 'Department', 
          width: 150, 
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: ['Engineering', 'Marketing', 'HR', 'Sales', 'Finance']
          }
        }
      ],
      rowSelection: 'single',
      onCellValueChanged: (event: any) => {
        console.log('Cell value changed:', event);
      }
    };
  }

  /**
   * Grid with grouping and aggregation
   */
  static getGroupingAgGridOptions(): AgGridOptions {
    return {
      rowData: this.getExtendedRowData(),
      columnDefs: [
        { field: 'country', headerName: 'Country', rowGroup: true, hide: true },
        { field: 'department', headerName: 'Department', rowGroup: true, hide: true },
        { field: 'firstName', headerName: 'First Name', width: 120 },
        { field: 'lastName', headerName: 'Last Name', width: 120 },
        { 
          field: 'salary', 
          headerName: 'Salary', 
          width: 120, 
          aggFunc: 'sum',
          valueFormatter: (params: any) => `$${params.value?.toLocaleString()}`
        },
        { field: 'age', headerName: 'Avg Age', width: 100, aggFunc: 'avg' }
      ],
      enableRowGroup: true,
      groupSelectsChildren: true,
      groupIncludeFooter: true,
      groupIncludeTotalFooter: true,
      rowGroupPanelShow: 'always',
      animateRows: true
    };
  }

  /**
   * Master-Detail grid configuration
   */
  static getMasterDetailAgGridOptions(): AgGridOptions {
    return {
      rowData: this.getMasterRowData(),
      columnDefs: [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'companyName', headerName: 'Company', width: 200 },
        { field: 'industry', headerName: 'Industry', width: 150 },
        { field: 'employees', headerName: 'Employees', width: 120 },
        { field: 'revenue', headerName: 'Revenue', width: 150 }
      ],
      masterDetail: true,
      detailCellRenderer: 'agDetailCellRenderer',
      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: [
            { field: 'name', headerName: 'Employee Name' },
            { field: 'position', headerName: 'Position' },
            { field: 'salary', headerName: 'Salary' },
            { field: 'startDate', headerName: 'Start Date' }
          ]
        },
        getDetailRowData: (params: any) => {
          params.successCallback(params.data.employees);
        }
      },
      detailRowHeight: 200
    };
  }

  /**
   * Server-side row model configuration
   */
  static getServerSideAgGridOptions(): AgGridOptions {
    return {
      columnDefs: this.getBasicColumnDefs(),
      rowModelType: 'serverSide',
      cacheBlockSize: 100,
      maxBlocksInCache: 10,
      pagination: true,
      paginationPageSize: 50,
      enableFilter: true,
      enableSorting: true
    };
  }

  /**
   * Infinite scrolling configuration
   */
  static getInfiniteScrollAgGridOptions(): AgGridOptions {
    return {
      columnDefs: this.getBasicColumnDefs(),
      rowModelType: 'infinite',
      cacheBlockSize: 50,
      cacheOverflowSize: 2,
      maxConcurrentDatasourceRequests: 2,
      infiniteInitialRowCount: 1000,
      maxBlocksInCache: 10,
      enableFilter: true,
      enableSorting: true
    };
  }

  /**
   * Custom theme configuration
   */
  static getCustomThemeAgGridOptions(): AgGridOptions {
    return {
      ...this.getBasicAgGridOptions(),
      theme: 'ag-theme-alpine-dark'
    };
  }

  // Helper data generators

  private static getExtendedRowData() {
    return [
      { id: 1, firstName: 'John', lastName: 'Doe', age: 30, salary: 50000, department: 'Engineering', country: 'USA' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', age: 28, salary: 55000, department: 'Marketing', country: 'USA' },
      { id: 3, firstName: 'Bob', lastName: 'Johnson', age: 35, salary: 60000, department: 'Engineering', country: 'Canada' },
      { id: 4, firstName: 'Alice', lastName: 'Brown', age: 32, salary: 58000, department: 'HR', country: 'USA' },
      { id: 5, firstName: 'Charlie', lastName: 'Davis', age: 29, salary: 52000, department: 'Marketing', country: 'Canada' },
      { id: 6, firstName: 'Diana', lastName: 'Wilson', age: 31, salary: 61000, department: 'Engineering', country: 'UK' },
      { id: 7, firstName: 'Edward', lastName: 'Taylor', age: 27, salary: 49000, department: 'Sales', country: 'UK' },
      { id: 8, firstName: 'Fiona', lastName: 'Anderson', age: 33, salary: 59000, department: 'HR', country: 'USA' },
      { id: 9, firstName: 'George', lastName: 'Thomas', age: 26, salary: 48000, department: 'Sales', country: 'Canada' },
      { id: 10, firstName: 'Helen', lastName: 'Jackson', age: 34, salary: 62000, department: 'Engineering', country: 'UK' }
    ];
  }

  private static getMasterRowData() {
    return [
      {
        id: 1,
        companyName: 'Tech Corp',
        industry: 'Technology',
        employees: 150,
        revenue: 5000000,
        employeeList: [
          { name: 'John Doe', position: 'Software Engineer', salary: 75000, startDate: '2020-01-15' },
          { name: 'Jane Smith', position: 'Product Manager', salary: 85000, startDate: '2019-03-01' },
          { name: 'Bob Johnson', position: 'DevOps Engineer', salary: 80000, startDate: '2020-06-01' }
        ]
      },
      {
        id: 2,
        companyName: 'Marketing Inc',
        industry: 'Marketing',
        employees: 75,
        revenue: 2500000,
        employeeList: [
          { name: 'Alice Brown', position: 'Marketing Director', salary: 90000, startDate: '2018-09-15' },
          { name: 'Charlie Davis', position: 'Content Creator', salary: 55000, startDate: '2021-02-01' }
        ]
      }
    ];
  }

  // Custom cell renderers for testing
  private static fullNameRenderer = (params: any) => {
    return `<strong>${params.data.firstName} ${params.data.lastName}</strong>`;
  };

  private static emailLinkRenderer = (params: any) => {
    return `<a href="mailto:${params.value}">${params.value}</a>`;
  };

  private static currencyRenderer = (params: any) => {
    const value = params.value;
    if (value == null) return '';
    return `<span style="color: green; font-weight: bold;">$${value.toLocaleString()}</span>`;
  };

  private static departmentBadgeRenderer = (params: any) => {
    const colors = {
      'Engineering': 'blue',
      'Marketing': 'green',
      'HR': 'orange',
      'Sales': 'purple',
      'Finance': 'red'
    };
    const color = colors[params.value as keyof typeof colors] || 'gray';
    return `<span style="background-color: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${params.value}</span>`;
  };

  private static actionButtonsRenderer = (params: any) => {
    return `
      <button onclick="editRow(${params.data.id})" style="margin-right: 5px;">Edit</button>
      <button onclick="deleteRow(${params.data.id})" style="color: red;">Delete</button>
    `;
  };

  /**
   * Large dataset for performance testing
   */
  static getLargeDataset(size: number = 10000) {
    const departments = ['Engineering', 'Marketing', 'HR', 'Sales', 'Finance', 'Operations'];
    const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia'];
    const data = [];

    for (let i = 1; i <= size; i++) {
      data.push({
        id: i,
        firstName: `FirstName${i}`,
        lastName: `LastName${i}`,
        email: `user${i}@example.com`,
        age: 22 + (i % 40),
        salary: 40000 + (i % 60000),
        department: departments[i % departments.length],
        country: countries[i % countries.length],
        startDate: new Date(2020 + (i % 4), (i % 12), (i % 28) + 1).toISOString().split('T')[0],
        isActive: i % 3 !== 0
      });
    }

    return data;
  }

  /**
   * Performance test configuration
   */
  static getPerformanceAgGridOptions(dataSize: number = 10000): AgGridOptions {
    return {
      rowData: this.getLargeDataset(dataSize),
      columnDefs: [
        { field: 'id', headerName: 'ID', width: 80, sortable: true },
        { field: 'firstName', headerName: 'First Name', width: 120, sortable: true, filter: 'agTextColumnFilter' },
        { field: 'lastName', headerName: 'Last Name', width: 120, sortable: true, filter: 'agTextColumnFilter' },
        { field: 'email', headerName: 'Email', width: 200, sortable: true, filter: 'agTextColumnFilter' },
        { field: 'age', headerName: 'Age', width: 80, sortable: true, filter: 'agNumberColumnFilter' },
        { field: 'salary', headerName: 'Salary', width: 120, sortable: true, filter: 'agNumberColumnFilter' },
        { field: 'department', headerName: 'Department', width: 120, sortable: true, filter: 'agSetColumnFilter' },
        { field: 'country', headerName: 'Country', width: 120, sortable: true, filter: 'agSetColumnFilter' },
        { field: 'startDate', headerName: 'Start Date', width: 120, sortable: true, filter: 'agDateColumnFilter' },
        { field: 'isActive', headerName: 'Active', width: 80, cellRenderer: (params: any) => params.value ? '✓' : '✗' }
      ],
      pagination: false, // Disable for performance testing
      rowSelection: 'multiple',
      enableFilter: true,
      animateRows: false, // Disable for performance testing
      suppressRowClickSelection: false
    };
  }
}