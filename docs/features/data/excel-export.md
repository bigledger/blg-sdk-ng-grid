# Excel Export

## Overview

Excel export functionality provides advanced export capabilities to Microsoft Excel format (.xlsx) with support for formatting, multiple sheets, formulas, and rich styling options.

## Use Cases

- Detailed reporting with formatting
- Multi-sheet data exports
- Dashboard exports with charts
- Financial reports with calculations
- Data analysis with Excel formulas

## Basic Excel Export

### Simple Excel Export

```typescript
@Component({
  template: `
    <div class="export-controls">
      <button (click)="exportToExcel()">Export to Excel</button>
      <button (click)="exportWithFormatting()">Export with Formatting</button>
      <button (click)="exportMultipleSheets()">Export Multiple Sheets</button>
    </div>
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (gridReady)="onGridReady($event)">
    </blg-grid>
  `
})
export class BasicExcelExportComponent {
  private gridApi!: GridApi;

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  exportToExcel(): void {
    this.gridApi.exportDataAsExcel({
      fileName: 'grid-data.xlsx'
    });
  }

  exportWithFormatting(): void {
    this.gridApi.exportDataAsExcel({
      fileName: 'formatted-data.xlsx',
      sheetName: 'Employee Data',
      author: 'Grid Application',
      processCellCallback: this.formatCellForExcel.bind(this),
      processHeaderCallback: this.formatHeaderForExcel.bind(this)
    });
  }

  private formatCellForExcel(params: any): any {
    const value = params.value;
    const column = params.column.getColId();

    switch (column) {
      case 'salary':
        return {
          value: value,
          style: {
            numFmt: '$#,##0.00'
          }
        };
      case 'startDate':
        return {
          value: value instanceof Date ? value : new Date(value),
          style: {
            numFmt: 'mm/dd/yyyy'
          }
        };
      case 'performance':
        return {
          value: value,
          style: {
            numFmt: '0.00',
            fill: value > 4.0 ? { fgColor: { rgb: 'C6EFCE' } } : undefined
          }
        };
      default:
        return value;
    }
  }

  private formatHeaderForExcel(params: any): any {
    return {
      value: params.column.getDisplayName().toUpperCase(),
      style: {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '366092' } }
      }
    };
  }
}
```

### Advanced Excel Features

```typescript
export class AdvancedExcelExportComponent {
  private gridApi!: GridApi;

  exportWithAdvancedFeatures(): void {
    this.gridApi.exportDataAsExcel({
      fileName: 'advanced-export.xlsx',
      sheetName: 'Employee Report',
      author: 'HR Department',
      customHeader: [
        [
          { value: 'Company Name: Acme Corp', style: { font: { bold: true, size: 16 } } }
        ],
        [
          { value: 'Employee Report - Generated on ' + new Date().toLocaleDateString() }
        ],
        [] // Empty row
      ],
      customFooter: [
        [], // Empty row
        [
          { value: 'Total Employees:', style: { font: { bold: true } } },
          { value: this.getTotalEmployees() }
        ],
        [
          { value: 'Average Salary:', style: { font: { bold: true } } },
          { 
            value: this.getAverageSalary(),
            style: { numFmt: '$#,##0.00' }
          }
        ]
      ],
      processCellCallback: this.advancedCellProcessor.bind(this),
      processHeaderCallback: this.advancedHeaderProcessor.bind(this),
      addImageToCell: this.addCompanyLogo.bind(this)
    });
  }

  exportMultipleSheets(): void {
    const workbookData = [
      {
        name: 'Employees',
        data: this.getEmployeeData(),
        columns: this.getEmployeeColumns()
      },
      {
        name: 'Departments',
        data: this.getDepartmentSummary(),
        columns: this.getDepartmentColumns()
      },
      {
        name: 'Performance',
        data: this.getPerformanceData(),
        columns: this.getPerformanceColumns()
      }
    ];

    this.excelService.exportMultipleSheets(workbookData, 'company-report.xlsx');
  }

  private advancedCellProcessor(params: any): any {
    const value = params.value;
    const column = params.column.getColId();
    const rowIndex = params.node.rowIndex;

    // Conditional formatting based on data
    switch (column) {
      case 'status':
        return {
          value: value,
          style: this.getStatusStyle(value)
        };
      case 'department':
        return {
          value: value,
          style: this.getDepartmentStyle(value)
        };
      case 'performance':
        return {
          value: value,
          style: this.getPerformanceStyle(value)
        };
      default:
        return {
          value: value,
          style: rowIndex % 2 === 0 ? { fill: { fgColor: { rgb: 'F2F2F2' } } } : undefined
        };
    }
  }

  private getStatusStyle(status: string): any {
    const styles = {
      'Active': { font: { color: { rgb: '008000' } }, fill: { fgColor: { rgb: 'E8F5E8' } } },
      'Inactive': { font: { color: { rgb: 'FF0000' } }, fill: { fgColor: { rgb: 'FFE8E8' } } },
      'Pending': { font: { color: { rgb: 'FF8C00' } }, fill: { fgColor: { rgb: 'FFF4E8' } } }
    };
    return styles[status] || {};
  }

  private addCompanyLogo(params: any): any {
    if (params.rowIndex === 0 && params.column.getColId() === 'name') {
      return {
        image: {
          base64: 'data:image/png;base64,...', // Company logo base64
          width: 100,
          height: 50
        }
      };
    }
    return null;
  }
}
```

## Excel Service Implementation

### Comprehensive Excel Service

```typescript
@Injectable()
export class ExcelExportService {
  constructor(private http: HttpClient) {}

  exportGridToExcel(
    gridApi: GridApi,
    options: ExcelExportOptions = {}
  ): void {
    const defaultOptions: ExcelExportOptions = {
      fileName: 'grid-export.xlsx',
      sheetName: 'Data',
      author: 'Grid Application'
    };

    const mergedOptions = { ...defaultOptions, ...options };
    gridApi.exportDataAsExcel(mergedOptions);
  }

  async exportMultipleSheets(
    sheetsData: SheetData[],
    fileName: string
  ): Promise<void> {
    const workbook = this.createWorkbook();

    sheetsData.forEach(sheetData => {
      const worksheet = this.createWorksheet(sheetData);
      workbook.addWorksheet(worksheet);
    });

    await this.saveWorkbook(workbook, fileName);
  }

  async exportWithCharts(
    gridApi: GridApi,
    chartConfigs: ChartConfig[],
    fileName: string
  ): Promise<void> {
    // Extract data from grid
    const data = this.extractGridData(gridApi);
    
    // Create workbook with data and charts
    const workbook = this.createWorkbookWithCharts(data, chartConfigs);
    
    await this.saveWorkbook(workbook, fileName);
  }

  createTemplate(
    template: ExcelTemplate
  ): void {
    const workbook = this.createWorkbook();
    
    template.sheets.forEach(sheetConfig => {
      const worksheet = this.createTemplateSheet(sheetConfig);
      workbook.addWorksheet(worksheet);
    });

    this.saveWorkbook(workbook, template.fileName);
  }

  async exportWithFormulas(
    gridApi: GridApi,
    formulaConfigs: FormulaConfig[],
    fileName: string
  ): Promise<void> {
    const data = this.extractGridData(gridApi);
    const workbook = this.createWorkbookWithFormulas(data, formulaConfigs);
    
    await this.saveWorkbook(workbook, fileName);
  }

  private createWorkbook(): any {
    // Implementation using a library like ExcelJS
    return new ExcelJS.Workbook();
  }

  private createWorksheet(sheetData: SheetData): any {
    const worksheet = {
      name: sheetData.name,
      data: sheetData.data,
      columns: sheetData.columns,
      styling: sheetData.styling
    };

    return this.applyWorksheetStyling(worksheet);
  }

  private applyWorksheetStyling(worksheet: any): any {
    // Apply conditional formatting, styles, etc.
    return worksheet;
  }

  private async saveWorkbook(workbook: any, fileName: string): Promise<void> {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    this.downloadFile(blob, fileName);
  }

  private downloadFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}

interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  author?: string;
  customHeader?: any[][];
  customFooter?: any[][];
  processCellCallback?: (params: any) => any;
  processHeaderCallback?: (params: any) => any;
  addImageToCell?: (params: any) => any;
}

interface SheetData {
  name: string;
  data: any[];
  columns: any[];
  styling?: any;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  dataRange: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  title?: string;
}

interface ExcelTemplate {
  fileName: string;
  sheets: Array<{
    name: string;
    template: any;
    dataBinding?: any;
  }>;
}

interface FormulaConfig {
  column: string;
  formula: string;
  range?: string;
}
```

## Advanced Features

### Excel Charts Integration

```typescript
export class ExcelChartsComponent {
  exportWithCharts(): void {
    const chartConfigs: ChartConfig[] = [
      {
        type: 'bar',
        dataRange: 'A2:B10',
        position: { x: 300, y: 50 },
        size: { width: 400, height: 300 },
        title: 'Department Distribution'
      },
      {
        type: 'line',
        dataRange: 'C2:D10',
        position: { x: 750, y: 50 },
        size: { width: 400, height: 300 },
        title: 'Performance Trend'
      }
    ];

    this.excelService.exportWithCharts(
      this.gridApi,
      chartConfigs,
      'data-with-charts.xlsx'
    );
  }
}
```

### Dynamic Excel Templates

```typescript
export class ExcelTemplatesComponent {
  createFinancialTemplate(): void {
    const template: ExcelTemplate = {
      fileName: 'financial-template.xlsx',
      sheets: [
        {
          name: 'Summary',
          template: {
            headers: ['Item', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'],
            formulas: {
              'F2': '=SUM(B2:E2)',
              'F3': '=SUM(B3:E3)'
            },
            styling: {
              headerStyle: {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '366092' } }
              }
            }
          }
        },
        {
          name: 'Details',
          template: {
            dataBinding: 'gridData'
          }
        }
      ]
    };

    this.excelService.createTemplate(template);
  }
}
```

## API Reference

### Export Options

| Option | Type | Description |
|--------|------|-------------|
| `fileName` | string | Excel file name |
| `sheetName` | string | Worksheet name |
| `author` | string | Document author |
| `customHeader` | any[][] | Custom header rows |
| `customFooter` | any[][] | Custom footer rows |
| `processCellCallback` | function | Cell formatting function |
| `addImageToCell` | function | Image insertion function |

### Export Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `exportDataAsExcel()` | `options: ExcelExportOptions` | Export to Excel format |
| `exportMultipleSheets()` | `sheets: SheetData[]` | Export multiple sheets |
| `exportWithCharts()` | `charts: ChartConfig[]` | Export with charts |

## Best Practices

1. **Use appropriate cell formatting** for different data types
2. **Implement proper error handling** for export operations  
3. **Consider file size limitations** for large datasets
4. **Test across different Excel versions** for compatibility
5. **Provide progress indicators** for large exports
6. **Use templates** for consistent report formatting
7. **Optimize memory usage** for very large exports
8. **Validate exported data** to ensure accuracy