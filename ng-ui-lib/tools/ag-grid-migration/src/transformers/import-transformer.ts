import { Transformation } from '../types/migration.types';

export class ImportTransformer {
  private readonly IMPORT_MAPPINGS = new Map([
    // ag-Grid Angular imports
    ['ag-grid-angular', '@ng-ui/grid'],
    ['ag-grid-community', '@ng-ui/core'],
    ['ag-grid-enterprise', '@ng-ui/grid'],
    ['@ag-grid-community/core', '@ng-ui/core'],
    ['@ag-grid-community/angular', '@ng-ui/grid'],
    ['@ag-grid-enterprise/all-modules', '@ng-ui/grid'],
    
    // Individual modules
    ['@ag-grid-community/csv-export', '@ng-ui/export'],
    ['@ag-grid-enterprise/excel-export', '@ng-ui/export'],
    ['@ag-grid-enterprise/clipboard', '@ng-ui/grid'],
    ['@ag-grid-enterprise/range-selection', '@ng-ui/grid'],
    ['@ag-grid-enterprise/row-grouping', '@ng-ui/grid'],
    ['@ag-grid-enterprise/set-filter', '@ng-ui/grid'],
    ['@ag-grid-enterprise/multi-filter', '@ng-ui/grid'],
  ]);

  private readonly CLASS_MAPPINGS = new Map([
    // Component classes
    ['AgGridAngular', 'NgUiGridComponent'],
    ['AgGridModule', 'NgUiGridModule'],
    
    // Interfaces
    ['GridOptions', 'NgUiGridConfig'],
    ['ColDef', 'NgUiColumnDefinition'],
    ['GridApi', 'NgUiGridApi'],
    ['ColumnApi', 'NgUiColumnApi'],
    ['GridReadyEvent', 'NgUiGridReadyEvent'],
    ['SelectionChangedEvent', 'NgUiSelectionChangedEvent'],
    ['RowClickedEvent', 'NgUiRowClickedEvent'],
    ['CellClickedEvent', 'NgUiCellClickedEvent'],
    ['ColumnResizedEvent', 'NgUiColumnResizedEvent'],
    
    // Filter interfaces
    ['ISetFilterParams', 'NgUiSetFilterConfig'],
    ['ITextFilterParams', 'NgUiTextFilterConfig'],
    ['INumberFilterParams', 'NgUiNumberFilterConfig'],
    ['IDateFilterParams', 'NgUiDateFilterConfig'],
    
    // Cell renderer interfaces
    ['ICellRendererParams', 'NgUiCellRendererParams'],
    ['ICellEditorParams', 'NgUiCellEditorParams'],
    
    // Other interfaces
    ['RowNode', 'NgUiRowNode'],
    ['Column', 'NgUiColumn'],
    ['GetRowIdFunc', 'NgUiGetRowIdFunc'],
    ['IsRowSelectable', 'NgUiIsRowSelectable']
  ]);

  transformImportStatement(
    filePath: string,
    line: number,
    column: number,
    originalText: string,
    moduleSource: string,
    imports: string[]
  ): Transformation[] {
    const transformations: Transformation[] = [];

    // Transform the module source
    const newModuleSource = this.IMPORT_MAPPINGS.get(moduleSource) || moduleSource;
    
    // Transform imported classes
    const newImports = imports.map(imp => {
      // Handle namespace imports
      if (imp.startsWith('* as ')) {
        const namespace = imp.replace('* as ', '');
        return `* as ${namespace}`;
      }
      
      // Handle default imports
      if (!imp.includes(',') && !imp.includes('{')) {
        return this.CLASS_MAPPINGS.get(imp) || imp;
      }
      
      // Handle named imports
      return this.CLASS_MAPPINGS.get(imp) || imp;
    });

    // Build new import statement
    let newImportStatement: string;
    if (imports.length === 1 && !imports[0].includes('{')) {
      // Default import or namespace import
      newImportStatement = `import ${newImports[0]} from '${newModuleSource}';`;
    } else {
      // Named imports
      const namedImports = newImports.filter(imp => !imp.startsWith('* as '));
      const namespaceImports = newImports.filter(imp => imp.startsWith('* as '));
      
      let importParts = [];
      if (namedImports.length > 0) {
        importParts.push(`{ ${namedImports.join(', ')} }`);
      }
      if (namespaceImports.length > 0) {
        importParts.push(namespaceImports[0]);
      }
      
      newImportStatement = `import ${importParts.join(', ')} from '${newModuleSource}';`;
    }

    if (newImportStatement !== originalText.trim()) {
      transformations.push({
        filePath,
        type: 'import',
        line,
        column,
        oldText: originalText.trim(),
        newText: newImportStatement,
        description: `Transform ag-Grid import from '${moduleSource}' to '${newModuleSource}'`
      });
    }

    return transformations;
  }

  transformTypeReference(
    filePath: string,
    line: number,
    column: number,
    originalText: string,
    typeName: string
  ): Transformation | null {
    const newTypeName = this.CLASS_MAPPINGS.get(typeName);
    
    if (newTypeName && newTypeName !== typeName) {
      return {
        filePath,
        type: 'import',
        line,
        column,
        oldText: typeName,
        newText: newTypeName,
        description: `Transform ag-Grid type '${typeName}' to '${newTypeName}'`
      };
    }

    return null;
  }

  getAllMappings(): { imports: Map<string, string>; classes: Map<string, string> } {
    return {
      imports: this.IMPORT_MAPPINGS,
      classes: this.CLASS_MAPPINGS
    };
  }

  addCustomMapping(agGridItem: string, ngUiItem: string, type: 'import' | 'class'): void {
    if (type === 'import') {
      this.IMPORT_MAPPINGS.set(agGridItem, ngUiItem);
    } else {
      this.CLASS_MAPPINGS.set(agGridItem, ngUiItem);
    }
  }
}