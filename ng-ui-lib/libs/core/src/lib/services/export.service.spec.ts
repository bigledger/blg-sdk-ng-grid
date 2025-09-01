import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';
import { ColumnDefinition } from '../interfaces/column-definition.interface';
import { ExportOptions } from '../interfaces/export.interface';

// Mock file-saver and xlsx
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({ SheetNames: [], Sheets: {} })),
    aoa_to_sheet: jest.fn(() => ({ '!ref': 'A1:C3' })),
    book_append_sheet: jest.fn(),
    decode_range: jest.fn(() => ({ s: { r: 0, c: 0 }, e: { r: 2, c: 2 } })),
    encode_cell: jest.fn((cell) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`)
  },
  write: jest.fn(() => new ArrayBuffer(0))
}));

describe('ExportService', () => {
  let service: ExportService;

  const sampleColumns: ColumnDefinition[] = [
    {
      id: 'name',
      field: 'name',
      header: 'Name',
      type: 'string',
      width: 150
    },
    {
      id: 'age',
      field: 'age',
      header: 'Age',
      type: 'number',
      width: 100
    },
    {
      id: 'active',
      field: 'active',
      header: 'Active',
      type: 'boolean'
    }
  ];

  const sampleData = [
    { name: 'John Doe', age: 30, active: true },
    { name: 'Jane Smith', age: 25, active: false },
    { name: 'Bob Johnson', age: 35, active: true }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportService);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('CSV Export', () => {
    it('should prepare export data correctly', async () => {
      const options: ExportOptions = {
        format: 'csv',
        filename: 'test-export',
        includeHeaders: true,
        dataScope: 'all',
        formatOptions: service.getDefaultCsvOptions()
      };

      // Use a spy to intercept the prepared data
      const prepareDataSpy = jest.spyOn(service as any, 'prepareExportData');
      prepareDataSpy.mockReturnValue({
        headers: ['Name', 'Age', 'Active'],
        rows: [
          ['John Doe', 30, 'Yes'],
          ['Jane Smith', 25, 'No'],
          ['Bob Johnson', 35, 'Yes']
        ],
        columns: sampleColumns.map(col => ({
          id: col.id,
          header: col.header,
          field: col.field,
          type: col.type || 'string'
        })),
        metadata: {
          exportDate: new Date(),
          totalRows: 3,
          format: 'csv' as const,
          filename: 'test-export',
          hasGrouping: false
        }
      });

      await service.exportData(sampleData, sampleColumns, options);
      
      expect(prepareDataSpy).toHaveBeenCalledWith(
        sampleData,
        sampleColumns,
        options,
        undefined,
        undefined
      );
    });

    it('should get default CSV options', () => {
      const options = service.getDefaultCsvOptions();
      
      expect(options).toEqual({
        delimiter: ',',
        qualifier: '"',
        lineEnding: '\n',
        includeBom: true
      });
    });
  });

  describe('Excel Export', () => {
    it('should get default Excel options', () => {
      const options = service.getDefaultExcelOptions();
      
      expect(options.sheetName).toBe('Sheet1');
      expect(options.autoSizeColumns).toBe(true);
      expect(options.applyBasicStyling).toBe(true);
      expect(options.headerStyle).toBeDefined();
    });

    it('should export to Excel format', async () => {
      const options: ExportOptions = {
        format: 'excel',
        filename: 'test-export',
        includeHeaders: true,
        dataScope: 'all',
        formatOptions: service.getDefaultExcelOptions()
      };

      await service.exportData(sampleData, sampleColumns, options);
      
      // Verify XLSX methods were called
      const XLSX = require('xlsx');
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.write).toHaveBeenCalled();
    });
  });

  describe('Data Formatting', () => {
    it('should format cell values correctly', () => {
      const formatMethod = (service as any).formatCellValue.bind(service);
      
      // Test different data types
      expect(formatMethod('text', 'string')).toBe('text');
      expect(formatMethod(123, 'number')).toBe(123);
      expect(formatMethod(true, 'boolean')).toBe('Yes');
      expect(formatMethod(false, 'boolean')).toBe('No');
      expect(formatMethod(null, 'string')).toBe('');
      expect(formatMethod(undefined, 'string')).toBe('');
      
      // Test date formatting
      const date = new Date('2023-01-01');
      const formattedDate = formatMethod(date, 'date');
      expect(typeof formattedDate).toBe('string');
    });

    it('should handle CSV row formatting with special characters', () => {
      const formatRowMethod = (service as any).formatCsvRow.bind(service);
      
      const values = ['John, Doe', 'Some "quoted" text', 'Normal text'];
      const result = formatRowMethod(values, ',', '"');
      
      expect(result).toContain('"John, Doe"');
      expect(result).toContain('"Some ""quoted"" text"');
      expect(result).toContain('Normal text');
    });
  });

  describe('Column Processing', () => {
    it('should get export columns correctly', () => {
      const getColumnsMethod = (service as any).getExportColumns.bind(service);
      
      const exportColumns = getColumnsMethod(sampleColumns, ['name', 'age']);
      
      expect(exportColumns).toHaveLength(2);
      expect(exportColumns[0].id).toBe('name');
      expect(exportColumns[1].id).toBe('age');
    });

    it('should include all visible columns when no specific columns are provided', () => {
      const getColumnsMethod = (service as any).getExportColumns.bind(service);
      
      const exportColumns = getColumnsMethod(sampleColumns);
      
      expect(exportColumns).toHaveLength(3);
      expect(exportColumns.map((col: any) => col.id)).toEqual(['name', 'age', 'active']);
    });

    it('should exclude hidden columns', () => {
      const columnsWithHidden = [...sampleColumns];
      columnsWithHidden[1] = { ...sampleColumns[1], visible: false };
      
      const getColumnsMethod = (service as any).getExportColumns.bind(service);
      const exportColumns = getColumnsMethod(columnsWithHidden);
      
      expect(exportColumns).toHaveLength(2);
      expect(exportColumns.find((col: any) => col.id === 'age')).toBeFalsy();
    });
  });

  describe('Error Handling', () => {
    it('should handle unsupported export format', async () => {
      const options: ExportOptions = {
        format: 'unsupported' as any,
        filename: 'test',
        includeHeaders: true,
        dataScope: 'all'
      };

      await expect(
        service.exportData(sampleData, sampleColumns, options)
      ).rejects.toThrow('Unsupported export format: unsupported');
    });
  });
});