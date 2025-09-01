/**
 * Example demonstrating ag-Grid to NgUiGrid compatibility layer usage
 */

import { Component } from '@angular/core';
import { AgGridOptions, createAgGridCompatible, validateAgGridCompatibility } from './index';

// Example data
const sampleData = [
  { id: 1, name: 'John Doe', age: 30, email: 'john@example.com', active: true },
  { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false },
  { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com', active: true }
];

// ag-Grid column definitions (unchanged)
const agColumnDefs = [
  {
    field: 'id',
    headerName: 'ID',
    width: 70,
    sortable: true,
    filter: true
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 200,
    sortable: true,
    filter: true,
    editable: true
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'numericColumn',
    width: 100,
    sortable: true,
    filter: true,
    editable: true
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 250,
    sortable: true,
    filter: true,
    editable: true
  },
  {
    field: 'active',
    headerName: 'Active',
    width: 100,
    cellRenderer: 'agCheckboxCellRenderer',
    editable: true
  }
];

// Example 1: Component-based usage
@Component({
  selector: 'app-grid-example',
  template: `
    <div class="example-container">
      <h2>ag-Grid to NgUiGrid Migration Example</h2>
      
      <!-- Compatibility warnings -->
      <div *ngIf="compatibilityReport.warnings.length > 0" class="warnings">
        <h3>Migration Warnings:</h3>
        <ul>
          <li *ngFor="let warning of compatibilityReport.warnings">{{ warning }}</li>
        </ul>
      </div>
      
      <!-- Grid with compatibility layer -->
      <ng-ui-grid-compat 
        class="ag-theme-alpine"
        [gridOptions]="gridOptions"
        [showCompatibilityWarnings]="true"
        (gridReady)="onGridReady($event)"
        (rowClicked)="onRowClicked($event)"
        (cellValueChanged)="onCellValueChanged($event)">
      </ng-ui-grid-compat>
      
      <!-- Controls -->
      <div class="controls">
        <button (click)="addRow()">Add Row</button>
        <button (click)="removeSelected()">Remove Selected</button>
        <button (click)="exportCsv()">Export CSV</button>
        <button (click)="autoSizeColumns()">Auto Size Columns</button>
      </div>
      
      <!-- Compatibility info -->
      <div class="compatibility-info">
        <h3>Compatibility Report:</h3>
        <p>Score: {{ compatibilityReport.compatibilityScore }}%</p>
        <p>Migration Effort: {{ compatibilityReport.estimatedMigrationEffort }}</p>
        <p>Total Features: {{ compatibilityReport.totalFeatures }}</p>
        <p>Supported: {{ compatibilityReport.supportedFeatures }}</p>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
    }
    
    .ng-ui-grid-compat {
      height: 400px;
      width: 100%;
      margin: 20px 0;
    }
    
    .warnings {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    
    .warnings ul {
      margin: 10px 0 0 0;
      padding-left: 20px;
    }
    
    .controls {
      margin: 20px 0;
    }
    
    .controls button {
      margin-right: 10px;
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .controls button:hover {
      background: #0056b3;
    }
    
    .compatibility-info {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }
    
    .compatibility-info p {
      margin: 5px 0;
    }
  `]
})
export class GridExampleComponent {
  // ag-Grid options (mostly unchanged from original ag-Grid code)
  gridOptions: AgGridOptions = {
    rowData: [...sampleData],
    columnDefs: agColumnDefs,
    
    // Grid features
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    rowSelection: 'multiple',
    animateRows: true,
    
    // Pagination
    pagination: true,
    paginationPageSize: 10,
    
    // Event handlers (unchanged)
    onGridReady: (params) => {
      console.log('Grid ready:', params);
      this.api = params.api;
      this.columnApi = params.columnApi;
    },
    
    onRowClicked: (event) => {
      console.log('Row clicked:', event.data);
    },
    
    onCellValueChanged: (event) => {
      console.log('Cell changed:', event.oldValue, '->', event.newValue);
    },
    
    onSelectionChanged: () => {
      const selectedRows = this.api?.getSelectedRows() || [];
      console.log('Selection changed:', selectedRows.length, 'rows selected');
    }
  };
  
  // API references (same as ag-Grid)
  api: any;
  columnApi: any;
  compatibilityReport = validateAgGridCompatibility(this.gridOptions);
  
  onGridReady(params: any): void {
    console.log('Grid ready event received');
    this.api = params.api;
    this.columnApi = params.columnApi;
  }
  
  onRowClicked(event: any): void {
    console.log('Row clicked event received:', event);
  }
  
  onCellValueChanged(event: any): void {
    console.log('Cell value changed event received:', event);
  }
  
  addRow(): void {
    const newRow = {
      id: Date.now(),
      name: 'New User',
      age: 25,
      email: 'new@example.com',
      active: true
    };
    
    const currentData = this.api?.getRowData() || [];
    this.api?.setRowData([...currentData, newRow]);
  }
  
  removeSelected(): void {
    const selectedRows = this.api?.getSelectedRows() || [];
    if (selectedRows.length > 0) {
      const currentData = this.api?.getRowData() || [];
      const filteredData = currentData.filter(row => !selectedRows.includes(row));
      this.api?.setRowData(filteredData);
    }
  }
  
  exportCsv(): void {
    this.api?.exportDataAsCsv({
      fileName: 'grid-data.csv'
    });
  }
  
  autoSizeColumns(): void {
    this.columnApi?.autoSizeAllColumns();
  }
}

// Example 2: Programmatic usage
export function programmaticExample(): void {
  // Create ag-Grid options
  const agGridOptions: AgGridOptions = {
    rowData: sampleData,
    columnDefs: agColumnDefs,
    enableSorting: true,
    enableFilter: true,
    rowSelection: 'multiple',
    
    onRowClicked: (event) => {
      console.log('Programmatic: Row clicked', event.data);
    }
  };
  
  // Validate compatibility
  const report = validateAgGridCompatibility(agGridOptions);
  console.log('Compatibility Score:', report.compatibilityScore);
  
  if (report.warnings.length > 0) {
    console.warn('Migration warnings:', report.warnings);
  }
  
  // Create compatible grid instance
  const gridInstance = createAgGridCompatible(agGridOptions);
  
  // Use ag-Grid compatible APIs
  console.log('Row count:', gridInstance.api.getDisplayedRowCount());
  console.log('Column count:', gridInstance.columnApi.getAllColumns().length);
  
  // Add event listeners
  gridInstance.eventAdapter.addEventListener('cellClicked', (event) => {
    console.log('Cell clicked via event adapter:', event);
  });
  
  // Manipulate data
  const newRow = { id: 999, name: 'Test User', age: 30, email: 'test@example.com', active: true };
  gridInstance.api.applyTransaction({ add: [newRow] });
  
  // Export data
  const csvData = gridInstance.api.getDataAsCsv();
  console.log('CSV Export:', csvData);
}

// Example 3: Migration validation
export function migrationValidationExample(): void {
  // Complex ag-Grid configuration
  const complexAgGridOptions: AgGridOptions = {
    rowData: sampleData,
    columnDefs: [
      {
        field: 'name',
        headerName: 'Name',
        cellRenderer: 'customNameRenderer', // Custom component
        cellEditor: 'customNameEditor',     // Custom component
        valueGetter: (params) => params.data.firstName + ' ' + params.data.lastName, // Function
        filter: 'agTextColumnFilter'
      },
      {
        field: 'age',
        headerName: 'Age',
        type: 'numericColumn',
        comparator: (a, b) => a - b, // Custom comparator
        aggFunc: 'sum'
      }
    ],
    
    // Advanced features
    rowModelType: 'serverSide', // Not supported
    treeData: true,             // Not supported
    enableContextMenu: true,    // Limited support
    enableClipboard: true,      // Limited support
    
    // Custom functions
    getRowClass: (params) => params.rowIndex % 2 === 0 ? 'even-row' : 'odd-row',
    getRowStyle: (params) => params.data.active ? { color: 'green' } : { color: 'red' }
  };
  
  // Validate this complex configuration
  const report = validateAgGridCompatibility(complexAgGridOptions);
  
  console.log('=== Migration Validation Report ===');
  console.log(`Compatibility Score: ${report.compatibilityScore}%`);
  console.log(`Migration Effort: ${report.estimatedMigrationEffort}`);
  console.log(`Total Features: ${report.totalFeatures}`);
  console.log(`Supported: ${report.supportedFeatures}`);
  console.log(`Partially Supported: ${report.partiallySupported}`);
  console.log(`Unsupported Features:`, report.unsupportedFeatures);
  console.log(`Missing Features:`, report.missingFeatures);
  console.log(`Warnings:`, report.warnings);
  console.log(`Recommendations:`, report.recommendations);
}

// Example 4: Step-by-step migration
export function stepByStepMigration(): void {
  const agGridOptions: AgGridOptions = {
    rowData: sampleData,
    columnDefs: agColumnDefs,
    enableSorting: true,
    enableFilter: true
  };
  
  console.log('=== Step-by-Step Migration ===');
  
  // Step 1: Validate compatibility
  console.log('Step 1: Validating compatibility...');
  const report = validateAgGridCompatibility(agGridOptions);
  console.log(`Compatibility: ${report.compatibilityScore}%`);
  
  // Step 2: Generate migration documentation
  console.log('Step 2: Generating migration documentation...');
  // const doc = generateMigrationDoc(agGridOptions);
  // console.log(`Migration tasks: ${doc.migrationChecklist.totalTasks}`);
  // console.log(`Estimated time: ${doc.migrationChecklist.estimatedTotalTime}`);
  
  // Step 3: Migrate configuration
  console.log('Step 3: Migrating configuration...');
  // const migration = migrateAgGridOptions(agGridOptions);
  // console.log('Grid config:', migration.gridConfig);
  // console.log('Column defs:', migration.columnDefs);
  
  // Step 4: Create compatible instance
  console.log('Step 4: Creating compatible instance...');
  const gridInstance = createAgGridCompatible(agGridOptions);
  console.log('Grid instance created successfully');
  
  // Step 5: Test functionality
  console.log('Step 5: Testing functionality...');
  console.log('Row count:', gridInstance.api.getDisplayedRowCount());
  console.log('Can select all:', typeof gridInstance.api.selectAll === 'function');
  console.log('Can export CSV:', typeof gridInstance.api.getDataAsCsv === 'function');
  
  console.log('Migration completed successfully!');
}

// Run examples
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('=== ag-Grid to NgUiGrid Compatibility Examples ===');
  programmaticExample();
  migrationValidationExample();
  stepByStepMigration();
}