import { ImportTransformer } from '../import-transformer';

describe('ImportTransformer', () => {
  let transformer: ImportTransformer;

  beforeEach(() => {
    transformer = new ImportTransformer();
  });

  describe('transformImportStatement', () => {
    it('should transform ag-grid-angular import to ng-ui', () => {
      const transformations = transformer.transformImportStatement(
        '/test/file.ts',
        1,
        0,
        "import { AgGridAngular } from 'ag-grid-angular';",
        'ag-grid-angular',
        ['AgGridAngular']
      );

      expect(transformations).toHaveLength(1);
      expect(transformations[0]).toMatchObject({
        filePath: '/test/file.ts',
        type: 'import',
        line: 1,
        column: 0,
        oldText: "import { AgGridAngular } from 'ag-grid-angular';",
        newText: "import { NgUiGridComponent } from '@ng-ui/grid';",
        description: "Transform ag-Grid import from 'ag-grid-angular' to '@ng-ui/grid'"
      });
    });

    it('should transform multiple imports correctly', () => {
      const transformations = transformer.transformImportStatement(
        '/test/file.ts',
        1,
        0,
        "import { AgGridAngular, ColDef, GridOptions } from 'ag-grid-angular';",
        'ag-grid-angular',
        ['AgGridAngular', 'ColDef', 'GridOptions']
      );

      expect(transformations).toHaveLength(1);
      expect(transformations[0].newText).toContain('NgUiGridComponent');
      expect(transformations[0].newText).toContain('NgUiColumnDefinition');
      expect(transformations[0].newText).toContain('NgUiGridConfig');
    });

    it('should handle namespace imports', () => {
      const transformations = transformer.transformImportStatement(
        '/test/file.ts',
        1,
        0,
        "import * as AgGrid from 'ag-grid-community';",
        'ag-grid-community',
        ['* as AgGrid']
      );

      expect(transformations).toHaveLength(1);
      expect(transformations[0].newText).toContain("from '@ng-ui/core'");
    });

    it('should not transform non-ag-grid imports', () => {
      const transformations = transformer.transformImportStatement(
        '/test/file.ts',
        1,
        0,
        "import { Component } from '@angular/core';",
        '@angular/core',
        ['Component']
      );

      expect(transformations).toHaveLength(0);
    });
  });

  describe('transformTypeReference', () => {
    it('should transform ag-Grid type references', () => {
      const transformation = transformer.transformTypeReference(
        '/test/file.ts',
        5,
        10,
        'GridOptions',
        'GridOptions'
      );

      expect(transformation).toMatchObject({
        filePath: '/test/file.ts',
        type: 'import',
        line: 5,
        column: 10,
        oldText: 'GridOptions',
        newText: 'NgUiGridConfig',
        description: "Transform ag-Grid type 'GridOptions' to 'NgUiGridConfig'"
      });
    });

    it('should return null for unknown types', () => {
      const transformation = transformer.transformTypeReference(
        '/test/file.ts',
        5,
        10,
        'UnknownType',
        'UnknownType'
      );

      expect(transformation).toBeNull();
    });
  });

  describe('getAllMappings', () => {
    it('should return import and class mappings', () => {
      const mappings = transformer.getAllMappings();
      
      expect(mappings).toHaveProperty('imports');
      expect(mappings).toHaveProperty('classes');
      expect(mappings.imports).toBeInstanceOf(Map);
      expect(mappings.classes).toBeInstanceOf(Map);
      
      // Test specific mappings exist
      expect(mappings.imports.get('ag-grid-angular')).toBe('@ng-ui/grid');
      expect(mappings.classes.get('AgGridAngular')).toBe('NgUiGridComponent');
    });
  });

  describe('addCustomMapping', () => {
    it('should add custom import mapping', () => {
      transformer.addCustomMapping('custom-ag-grid', '@custom/grid', 'import');
      
      const mappings = transformer.getAllMappings();
      expect(mappings.imports.get('custom-ag-grid')).toBe('@custom/grid');
    });

    it('should add custom class mapping', () => {
      transformer.addCustomMapping('CustomAgGrid', 'CustomNgUiGrid', 'class');
      
      const mappings = transformer.getAllMappings();
      expect(mappings.classes.get('CustomAgGrid')).toBe('CustomNgUiGrid');
    });
  });
});