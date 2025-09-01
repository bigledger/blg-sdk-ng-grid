# CSV Export

## Overview

CSV export functionality allows users to export grid data to CSV format with customizable options including column selection, data filtering, formatting, and custom export processing.

## Use Cases

- Data backup and archiving
- Report generation and sharing
- Data analysis in external tools
- Bulk data transfer between systems
- Custom formatted exports

## Basic CSV Export

### Simple Export

```typescript
@Component({
  template: `
    <div class="export-controls">
      <button (click)="exportToCsv()">Export All Data</button>
      <button (click)="exportSelectedRows()">Export Selected</button>
      <button (click)="exportFilteredData()">Export Filtered</button>
    </div>
    <blg-grid 
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [rowSelection]="'multiple'"
      (gridReady)="onGridReady($event)">
    </blg-grid>
  `
})
export class BasicCsvExportComponent {
  private gridApi!: GridApi;

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  exportToCsv(): void {
    this.gridApi.exportDataAsCsv({
      fileName: 'grid-data.csv'
    });
  }

  exportSelectedRows(): void {
    this.gridApi.exportDataAsCsv({
      fileName: 'selected-data.csv',
      onlySelected: true
    });
  }

  exportFilteredData(): void {
    this.gridApi.exportDataAsCsv({
      fileName: 'filtered-data.csv',
      onlyFiltered: true
    });
  }
}
```

### Advanced Export Options

```typescript
export class AdvancedCsvExportComponent {
  private gridApi!: GridApi;

  exportWithCustomOptions(): void {
    this.gridApi.exportDataAsCsv({
      fileName: 'advanced-export.csv',
      skipColumnHeaders: false,
      skipColumnGroupHeaders: false,
      skipPinnedTop: false,
      skipPinnedBottom: false,
      allColumns: false,
      onlySelected: false,
      onlyFiltered: true,
      suppressQuotes: false,
      columnSeparator: ',',
      customHeader: 'Company Data Export\\nGenerated on ' + new Date().toISOString(),
      customFooter: '\\nTotal rows exported: ' + this.getFilteredRowCount(),
      processCellCallback: this.processCellForExport.bind(this),
      processHeaderCallback: this.processHeaderForExport.bind(this)
    });
  }

  exportSpecificColumns(): void {
    const columnsToExport = ['name', 'email', 'department'];
    
    this.gridApi.exportDataAsCsv({
      fileName: 'specific-columns.csv',
      columnKeys: columnsToExport,
      processHeaderCallback: (params) => {
        const headerMap = {
          'name': 'Full Name',
          'email': 'Email Address', 
          'department': 'Department Name'
        };
        return headerMap[params.column.getColId()] || params.column.getDisplayName();
      }
    });
  }

  private processCellForExport(params: any): string {
    const value = params.value;
    const column = params.column.getColId();

    // Custom formatting based on column type
    switch (column) {
      case 'salary':
        return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
      case 'startDate':
        return value instanceof Date ? value.toLocaleDateString() : value;
      case 'status':
        return value ? value.toUpperCase() : 'UNKNOWN';
      case 'tags':
        return Array.isArray(value) ? value.join('; ') : value;
      default:
        return value;
    }
  }

  private processHeaderForExport(params: any): string {
    return params.column.getDisplayName().toUpperCase();
  }

  private getFilteredRowCount(): number {
    let count = 0;
    this.gridApi.forEachNodeAfterFilter(() => count++);
    return count;
  }
}
```

## Custom Export Processing

### Export with Data Transformation

```typescript
export class CustomExportProcessingComponent {
  exportTransformedData(): void {
    // Get data for export
    const dataForExport = this.prepareDataForExport();
    
    // Create CSV content
    const csvContent = this.generateCsvContent(dataForExport);
    
    // Download file
    this.downloadCsv(csvContent, 'transformed-data.csv');
  }

  private prepareDataForExport(): any[] {
    const exportData: any[] = [];
    
    this.gridApi.forEachNodeAfterFilterAndSort((node) => {
      const transformedRow = this.transformRowForExport(node.data);
      exportData.push(transformedRow);
    });
    
    return exportData;
  }

  private transformRowForExport(row: any): any {
    return {
      // Flatten nested objects
      id: row.id,
      name: row.name,
      email: row.contact?.email || '',
      phone: row.contact?.phone || '',
      street: row.address?.street || '',
      city: row.address?.city || '',
      country: row.address?.country || '',
      
      // Calculate derived fields
      fullName: `${row.firstName} ${row.lastName}`,
      yearsWithCompany: this.calculateYearsWithCompany(row.startDate),
      salaryBand: this.getSalaryBand(row.salary),
      
      // Format dates
      startDate: row.startDate ? new Date(row.startDate).toLocaleDateString() : '',
      lastReview: row.lastReview ? new Date(row.lastReview).toLocaleDateString() : '',
      
      // Convert arrays to strings
      skills: Array.isArray(row.skills) ? row.skills.join(', ') : '',
      certifications: Array.isArray(row.certifications) ? row.certifications.join('; ') : ''
    };
  }

  private generateCsvContent(data: any[]): string {
    if (data.length === 0) return '';

    // Get headers from first row
    const headers = Object.keys(data[0]);
    
    // Create header row
    const headerRow = headers.map(header => this.escapeCsvValue(header)).join(',');
    
    // Create data rows
    const dataRows = data.map(row => 
      headers.map(header => this.escapeCsvValue(row[header])).join(',')
    );
    
    return [headerRow, ...dataRows].join('\\n');
  }

  private escapeCsvValue(value: any): string {
    if (value == null) return '';
    
    const stringValue = String(value);
    
    // Escape quotes and wrap in quotes if necessary
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  private downloadCsv(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
```

### Export with Progress Tracking

```typescript
export class ProgressTrackingExportComponent {
  isExporting = false;
  exportProgress = 0;

  async exportLargeDataset(): Promise<void> {
    this.isExporting = true;
    this.exportProgress = 0;

    try {
      const totalRows = this.gridApi.getDisplayedRowCount();
      const batchSize = 1000;
      const batches = Math.ceil(totalRows / batchSize);
      
      let allData: any[] = [];
      
      for (let batch = 0; batch < batches; batch++) {
        const startIndex = batch * batchSize;
        const endIndex = Math.min(startIndex + batchSize, totalRows);
        
        // Process batch
        const batchData = await this.processBatch(startIndex, endIndex);
        allData = allData.concat(batchData);
        
        // Update progress
        this.exportProgress = ((batch + 1) / batches) * 100;
        
        // Allow UI to update
        await this.delay(10);
      }
      
      // Generate and download CSV
      const csvContent = this.generateCsvContent(allData);
      this.downloadCsv(csvContent, 'large-dataset.csv');
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      this.isExporting = false;
      this.exportProgress = 0;
    }
  }

  private async processBatch(startIndex: number, endIndex: number): Promise<any[]> {
    const batchData: any[] = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      const node = this.gridApi.getDisplayedRowAtIndex(i);
      if (node) {
        const processedRow = await this.processRowAsync(node.data);
        batchData.push(processedRow);
      }
    }
    
    return batchData;
  }

  private async processRowAsync(row: any): Promise<any> {
    // Simulate async processing (e.g., data enrichment)
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.transformRowForExport(row));
      }, 1);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Export Service Integration

### Centralized Export Service

```typescript
@Injectable()
export class CsvExportService {
  exportGridData(
    gridApi: GridApi,
    options: CsvExportOptions = {}
  ): void {
    const defaultOptions: CsvExportOptions = {
      fileName: 'grid-export.csv',
      skipColumnHeaders: false,
      onlyFiltered: true,
      processCellCallback: this.defaultCellProcessor.bind(this),
      processHeaderCallback: this.defaultHeaderProcessor.bind(this)
    };

    const mergedOptions = { ...defaultOptions, ...options };
    gridApi.exportDataAsCsv(mergedOptions);
  }

  async exportWithTemplate(
    gridApi: GridApi,
    templateConfig: ExportTemplate
  ): Promise<void> {
    const data = this.extractDataFromGrid(gridApi, templateConfig);
    const csvContent = await this.applyTemplate(data, templateConfig);
    this.downloadCsv(csvContent, templateConfig.fileName);
  }

  private defaultCellProcessor(params: any): string {
    const value = params.value;
    
    // Handle common data types
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    return value || '';
  }

  private defaultHeaderProcessor(params: any): string {
    return params.column.getDisplayName();
  }
}

interface CsvExportOptions {
  fileName?: string;
  skipColumnHeaders?: boolean;
  onlyFiltered?: boolean;
  onlySelected?: boolean;
  columnKeys?: string[];
  processCellCallback?: (params: any) => string;
  processHeaderCallback?: (params: any) => string;
}

interface ExportTemplate {
  fileName: string;
  columns: Array<{
    field: string;
    header: string;
    formatter?: (value: any) => string;
  }>;
  includeHeaders: boolean;
  customHeader?: string;
  customFooter?: string;
}
```

## API Reference

### Export Options

| Option | Type | Description |
|--------|------|-------------|
| `fileName` | string | Name of exported file |
| `skipColumnHeaders` | boolean | Skip column headers |
| `onlySelected` | boolean | Export only selected rows |
| `onlyFiltered` | boolean | Export only filtered rows |
| `columnKeys` | string[] | Specific columns to export |
| `processCellCallback` | function | Custom cell processing |
| `processHeaderCallback` | function | Custom header processing |

### Export Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `exportDataAsCsv()` | `options: CsvExportOptions` | Export data as CSV |

## Best Practices

1. **Use appropriate file names** with timestamps for uniqueness
2. **Handle large datasets** with progress tracking and batching
3. **Process cell values** appropriately for CSV format
4. **Provide user feedback** during export operations
5. **Test with various data types** and edge cases
6. **Consider memory usage** for very large exports
7. **Validate exported data** to ensure accuracy
8. **Handle export errors** gracefully with user notifications