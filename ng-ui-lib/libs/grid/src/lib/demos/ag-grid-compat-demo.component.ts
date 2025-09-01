import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ColDef, 
  GridApi, 
  ColumnApi, 
  GridReadyEvent,
  RowClickedEvent,
  CellClickedEvent,
  SelectionChangedEvent,
  AgGridOptions
} from '@ng-ui/core';
import { AgGridAngularComponent } from '../grid/ag-grid-compat.component';

interface RowData {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  electric: boolean;
  date: Date;
}

/**
 * Demo component showcasing ag-Grid compatibility features
 */
@Component({
  selector: 'ag-grid-compat-demo',
  standalone: true,
  imports: [CommonModule, AgGridAngularComponent],
  template: `
    <div class="ag-grid-demo">
      <h2>ag-Grid Compatibility Demo</h2>
      
      <div class="demo-controls">
        <button (click)="addRow()">Add Row</button>
        <button (click)="removeSelectedRows()">Remove Selected</button>
        <button (click)="selectAll()">Select All</button>
        <button (click)="deselectAll()">Deselect All</button>
        <button (click)="exportToCsv()">Export CSV</button>
        <button (click)="exportToExcel()">Export Excel</button>
        <button (click)="autoSizeColumns()">Auto Size Columns</button>
        <button (click)="sizeColumnsToFit()">Size to Fit</button>
      </div>
      
      <div class="demo-info">
        <p>Selected Rows: {{ selectedRowCount() }}</p>
        <p>Total Rows: {{ rowData().length }}</p>
        <p>Last Event: {{ lastEvent() }}</p>
      </div>
      
      <div class="grid-container">
        <ag-grid-angular
          [rowData]="rowData()"
          [columnDefs]="columnDefs()"
          [defaultColDef]="defaultColDef()"
          [gridOptions]="gridOptions()"
          [pagination]="true"
          [paginationPageSize]="10"
          [rowSelection]="'multiple'"
          [enableSorting]="true"
          [enableFilter]="true"
          (gridReady)="onGridReady($event)"
          (rowClicked)="onRowClicked($event)"
          (cellClicked)="onCellClicked($event)"
          (selectionChanged)="onSelectionChanged($event)"
          class="ag-theme-alpine">
        </ag-grid-angular>
      </div>
      
      <div class="demo-code">
        <h3>Usage Example</h3>
        <pre><code>{{ usageExample }}</code></pre>
      </div>
    </div>
  `,
  styles: [`
    .ag-grid-demo {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    .demo-controls {
      margin: 20px 0;
    }
    
    .demo-controls button {
      margin-right: 10px;
      margin-bottom: 10px;
      padding: 8px 16px;
      background: #007acc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .demo-controls button:hover {
      background: #005fa3;
    }
    
    .demo-info {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    
    .demo-info p {
      margin: 5px 0;
      font-weight: bold;
    }
    
    .grid-container {
      height: 400px;
      width: 100%;
      margin: 20px 0;
    }
    
    .ag-theme-alpine {
      height: 100%;
      width: 100%;
    }
    
    .demo-code {
      margin-top: 30px;
    }
    
    .demo-code pre {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 14px;
    }
    
    .demo-code code {
      font-family: 'Courier New', monospace;
    }
  `]
})
export class AgGridCompatDemoComponent implements OnInit {
  // Grid APIs
  private gridApi!: GridApi;
  private columnApi!: ColumnApi;
  
  // Reactive state
  private _selectedRowCount = signal(0);
  private _lastEvent = signal('None');
  private _rowData = signal<RowData[]>([]);
  
  readonly selectedRowCount = this._selectedRowCount.asReadonly();
  readonly lastEvent = this._lastEvent.asReadonly();
  readonly rowData = this._rowData.asReadonly();
  
  // ag-Grid column definitions
  readonly columnDefs = signal<ColDef[]>([
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
      filter: 'agNumberColumnFilter',
      pinned: 'left'
    },
    {
      field: 'make',
      headerName: 'Make',
      width: 120,
      sortable: true,
      filter: 'agTextColumnFilter',
      editable: true
    },
    {
      field: 'model',
      headerName: 'Model',
      width: 120,
      sortable: true,
      filter: 'agTextColumnFilter',
      editable: true
    },
    {
      field: 'year',
      headerName: 'Year',
      width: 100,
      sortable: true,
      filter: 'agNumberColumnFilter',
      editable: true,
      cellEditor: 'agNumberCellEditor'
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      sortable: true,
      filter: 'agNumberColumnFilter',
      editable: true,
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (params: any) => `$${params.value?.toLocaleString() || 0}`
    },
    {
      field: 'electric',
      headerName: 'Electric',
      width: 100,
      sortable: true,
      filter: true,
      editable: true,
      cellRenderer: 'agCheckboxCellRenderer',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['true', 'false']
      }
    },
    {
      field: 'date',
      headerName: 'Date Added',
      width: 150,
      sortable: true,
      filter: 'agDateColumnFilter',
      editable: true,
      cellEditor: 'agDateCellEditor',
      valueFormatter: (params: any) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString();
        }
        return '';
      }
    }
  ]);
  
  // Default column definition
  readonly defaultColDef = signal<ColDef>({
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
    editable: false
  });
  
  // Grid options
  readonly gridOptions = signal<AgGridOptions>({
    rowSelection: 'multiple',
    enableRangeSelection: true,
    enableClipboard: true,
    suppressRowClickSelection: false,
    rowMultiSelectWithClick: true,
    defaultColDef: this.defaultColDef(),
    onCellValueChanged: (params: any) => {
      this._lastEvent.set(`Cell value changed: ${params.colDef.field} = ${params.newValue}`);
    }
  });
  
  // Sample data
  private sampleData: RowData[] = [
    { id: 1, make: 'Tesla', model: 'Model S', year: 2023, price: 89990, electric: true, date: new Date('2023-01-15') },
    { id: 2, make: 'BMW', model: 'X5', year: 2022, price: 65000, electric: false, date: new Date('2023-02-10') },
    { id: 3, make: 'Audi', model: 'e-tron', year: 2023, price: 75000, electric: true, date: new Date('2023-03-05') },
    { id: 4, make: 'Mercedes', model: 'EQS', year: 2023, price: 102000, electric: true, date: new Date('2023-02-28') },
    { id: 5, make: 'Ford', model: 'Mustang', year: 2022, price: 35000, electric: false, date: new Date('2023-01-20') },
    { id: 6, make: 'Volkswagen', model: 'ID.4', year: 2023, price: 41000, electric: true, date: new Date('2023-03-12') },
    { id: 7, make: 'Toyota', model: 'Camry', year: 2022, price: 28000, electric: false, date: new Date('2023-01-08') },
    { id: 8, make: 'Honda', model: 'Accord', year: 2022, price: 30000, electric: false, date: new Date('2023-02-15') },
    { id: 9, make: 'Nissan', model: 'Leaf', year: 2023, price: 32000, electric: true, date: new Date('2023-03-18') },
    { id: 10, make: 'Hyundai', model: 'Ioniq 5', year: 2023, price: 45000, electric: true, date: new Date('2023-02-22') },
    { id: 11, make: 'Porsche', model: 'Taycan', year: 2023, price: 95000, electric: true, date: new Date('2023-03-25') },
    { id: 12, make: 'Jaguar', model: 'I-PACE', year: 2022, price: 78000, electric: true, date: new Date('2023-01-30') },
    { id: 13, make: 'Lucid', model: 'Air', year: 2023, price: 139000, electric: true, date: new Date('2023-03-08') },
    { id: 14, make: 'Rivian', model: 'R1T', year: 2023, price: 75000, electric: true, date: new Date('2023-02-05') },
    { id: 15, make: 'Chevrolet', model: 'Bolt', year: 2022, price: 32000, electric: true, date: new Date('2023-01-25') }
  ];
  
  readonly usageExample = `
// Component TypeScript
import { ColDef, GridApi, ColumnApi, GridReadyEvent } from '@ng-ui/core';
import { AgGridAngularComponent } from '@ng-ui/grid';

export class MyComponent {
  private gridApi!: GridApi;
  private columnApi!: ColumnApi;
  
  columnDefs: ColDef[] = [
    { field: 'make', sortable: true, filter: true },
    { field: 'model', sortable: true, filter: true },
    { field: 'price', sortable: true, filter: 'agNumberColumnFilter' }
  ];
  
  rowData = [
    { make: 'Tesla', model: 'Model S', price: 89990 },
    { make: 'BMW', model: 'X5', price: 65000 }
  ];
  
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
  
  selectAllRows() {
    this.gridApi.selectAll();
  }
}

<!-- Component Template -->
<ag-grid-angular
  [rowData]="rowData"
  [columnDefs]="columnDefs"
  [pagination]="true"
  [paginationPageSize]="10"
  [rowSelection]="'multiple'"
  (gridReady)="onGridReady($event)"
  (selectionChanged)="onSelectionChanged($event)"
  class="ag-theme-alpine">
</ag-grid-angular>
  `.trim();
  
  ngOnInit(): void {
    this._rowData.set([...this.sampleData]);
  }
  
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this._lastEvent.set('Grid Ready');
  }
  
  onRowClicked(event: RowClickedEvent): void {
    this._lastEvent.set(`Row clicked: ${event.data.make} ${event.data.model}`);
  }
  
  onCellClicked(event: CellClickedEvent): void {
    this._lastEvent.set(`Cell clicked: ${event.colDef.field} = ${event.value}`);
  }
  
  onSelectionChanged(event: SelectionChangedEvent): void {
    const selectedRows = this.gridApi.getSelectedRows();
    this._selectedRowCount.set(selectedRows.length);
    this._lastEvent.set(`Selection changed: ${selectedRows.length} rows selected`);
  }
  
  addRow(): void {
    const newRow: RowData = {
      id: Math.max(...this._rowData().map(r => r.id)) + 1,
      make: 'New',
      model: 'Car',
      year: 2024,
      price: 50000,
      electric: Math.random() > 0.5,
      date: new Date()
    };
    
    this._rowData.update(data => [...data, newRow]);
    this.gridApi.setRowData(this._rowData());
    this._lastEvent.set('Row added');
  }
  
  removeSelectedRows(): void {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      this._lastEvent.set('No rows selected');
      return;
    }
    
    const updatedData = this._rowData().filter(row => 
      !selectedRows.some(selected => selected.id === row.id)
    );
    
    this._rowData.set(updatedData);
    this.gridApi.setRowData(updatedData);
    this._lastEvent.set(`Removed ${selectedRows.length} rows`);
  }
  
  selectAll(): void {
    this.gridApi.selectAll();
  }
  
  deselectAll(): void {
    this.gridApi.deselectAll();
  }
  
  exportToCsv(): void {
    this.gridApi.exportDataAsCsv({
      fileName: 'car-data.csv'
    });
    this._lastEvent.set('Exported to CSV');
  }
  
  exportToExcel(): void {
    this.gridApi.exportDataAsExcel({
      fileName: 'car-data.xlsx',
      sheetName: 'Cars'
    });
    this._lastEvent.set('Exported to Excel');
  }
  
  autoSizeColumns(): void {
    const allColumnIds = this.columnDefs().map(col => col.field!);
    this.gridApi.autoSizeColumns(allColumnIds);
    this._lastEvent.set('Auto-sized all columns');
  }
  
  sizeColumnsToFit(): void {
    this.gridApi.sizeColumnsToFit();
    this._lastEvent.set('Sized columns to fit');
  }
}