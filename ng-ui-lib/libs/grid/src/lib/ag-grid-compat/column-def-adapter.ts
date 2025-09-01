import { Injectable } from '@angular/core';
import { AgColDef, AgColumnDef, AgColumnGroupDef } from './ag-col-def.interface';
import { ColumnDefinition } from '@blg-grid/core';

/**
 * Specialized adapter for converting ag-Grid column definitions to NgUiGrid column definitions
 */
@Injectable({
  providedIn: 'root'
})
export class ColumnDefAdapter {
  
  /**
   * Converts ag-Grid column definitions to NgUiGrid format
   * Handles both individual columns and column groups
   */
  convertColumnDefs(agColumnDefs: AgColumnDef[]): ColumnDefinition[] {
    const result: ColumnDefinition[] = [];
    
    for (const agColDef of agColumnDefs) {
      if (this.isColumnGroup(agColDef)) {
        // Handle column groups by flattening them
        const groupColumns = this.flattenColumnGroup(agColDef);
        result.push(...groupColumns);
      } else {
        // Handle individual columns
        const converted = this.convertSingleColumn(agColDef);
        if (converted) {
          result.push(converted);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Converts a single ag-Grid column definition to NgUiGrid format
   */
  convertSingleColumn(agColDef: AgColDef): ColumnDefinition | null {
    // Skip if essential properties are missing
    if (!agColDef.field && !agColDef.colId) {
      return null;
    }
    
    const columnDef: ColumnDefinition = {
      id: this.generateColumnId(agColDef),
      field: agColDef.field || agColDef.colId || '',
      header: this.getHeaderText(agColDef)
    };
    
    // Apply width settings
    this.applyWidthSettings(agColDef, columnDef);
    
    // Apply behavior settings
    this.applyBehaviorSettings(agColDef, columnDef);
    
    // Apply display settings
    this.applyDisplaySettings(agColDef, columnDef);
    
    // Apply data type settings
    this.applyDataTypeSettings(agColDef, columnDef);
    
    // Apply editing settings
    this.applyEditingSettings(agColDef, columnDef);
    
    // Apply sorting and filtering
    this.applySortingAndFiltering(agColDef, columnDef);
    
    return columnDef;
  }
  
  /**
   * Checks if the column definition is a column group
   */
  private isColumnGroup(colDef: AgColumnDef): colDef is AgColumnGroupDef {
    return 'children' in colDef && Array.isArray(colDef.children);
  }
  
  /**
   * Flattens a column group into individual columns
   */
  private flattenColumnGroup(groupDef: AgColumnGroupDef): ColumnDefinition[] {
    const result: ColumnDefinition[] = [];
    
    for (const child of groupDef.children) {
      if (this.isColumnGroup(child)) {
        // Recursively flatten nested groups
        result.push(...this.flattenColumnGroup(child));
      } else {
        const converted = this.convertSingleColumn(child);
        if (converted) {
          // Add group information to the column
          converted.id = `${groupDef.groupId || groupDef.headerName || 'group'}_${converted.id}`;
          result.push(converted);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Generates a unique column ID
   */
  private generateColumnId(agColDef: AgColDef): string {
    return agColDef.colId || agColDef.field || `col_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Gets the header text for the column
   */
  private getHeaderText(agColDef: AgColDef): string {
    if (agColDef.headerName) {
      return agColDef.headerName;
    }
    
    if (agColDef.field) {
      // Convert camelCase to Title Case
      return agColDef.field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }
    
    return agColDef.colId || 'Column';
  }
  
  /**
   * Applies width-related settings
   */
  private applyWidthSettings(agColDef: AgColDef, columnDef: ColumnDefinition): void {
    if (agColDef.width !== undefined) {
      columnDef.width = agColDef.width;
    } else if (agColDef.initialWidth !== undefined) {
      columnDef.width = agColDef.initialWidth;
    }
    
    if (agColDef.minWidth !== undefined) {
      columnDef.minWidth = agColDef.minWidth;
    }
    
    if (agColDef.maxWidth !== undefined) {
      columnDef.maxWidth = agColDef.maxWidth;
    }
    
    // Handle flex columns (ag-Grid flex to fixed width conversion)
    if (agColDef.flex !== undefined && !columnDef.width) {
      // Convert flex to approximate width (flex * 100 as base width)
      columnDef.width = Math.max(agColDef.flex * 100, agColDef.minWidth || 50);
    }
  }
  
  /**
   * Applies behavior-related settings
   */
  private applyBehaviorSettings(agColDef: AgColDef, columnDef: ColumnDefinition): void {
    // Resizing
    if (agColDef.resizable !== undefined) {
      columnDef.resizable = agColDef.resizable && !agColDef.suppressAutoSize;
    }
    
    // Visibility
    if (agColDef.hide !== undefined) {
      columnDef.visible = !agColDef.hide;
    } else if (agColDef.initialHide !== undefined) {
      columnDef.visible = !agColDef.initialHide;
    }
    
    // Pinning
    if (agColDef.pinned !== undefined) {
      if (typeof agColDef.pinned === 'string') {
        columnDef.pinned = agColDef.pinned as 'left' | 'right';
      } else if (agColDef.pinned === true) {
        columnDef.pinned = 'left';
      }
    } else if (agColDef.initialPinned !== undefined) {
      if (typeof agColDef.initialPinned === 'string') {
        columnDef.pinned = agColDef.initialPinned as 'left' | 'right';
      } else if (agColDef.initialPinned === true) {
        columnDef.pinned = 'left';
      }
    }
  }
  
  /**
   * Applies display-related settings
   */
  private applyDisplaySettings(agColDef: AgColDef, columnDef: ColumnDefinition): void {
    // Text alignment
    if (agColDef.cellStyle) {
      const alignment = this.extractAlignmentFromStyle(agColDef.cellStyle);
      if (alignment) {
        columnDef.align = alignment;
      }
    }
    
    // Cell renderer
    if (agColDef.cellRenderer) {
      columnDef.cellRenderer = this.mapCellRenderer(agColDef.cellRenderer);
    }
  }
  
  /**
   * Applies data type settings
   */
  private applyDataTypeSettings(agColDef: AgColDef, columnDef: ColumnDefinition): void {
    // Column type mapping
    if (agColDef.type) {
      columnDef.type = this.mapAgTypeToNgUiType(agColDef.type);
    } else {
      // Infer type from other properties
      columnDef.type = this.inferColumnType(agColDef);
    }
  }
  
  /**
   * Applies editing settings
   */
  private applyEditingSettings(agColDef: AgColDef, columnDef: ColumnDefinition): void {
    if (agColDef.editable !== undefined) {
      if (typeof agColDef.editable === 'boolean') {
        columnDef.cellEditor = agColDef.editable;
      } else {
        // For function-based editable, enable editing by default
        // The function logic would need to be handled in the grid component
        columnDef.cellEditor = true;
      }
    }
    
    if (agColDef.cellEditor !== undefined && columnDef.cellEditor !== false) {
      columnDef.cellEditor = this.mapCellEditor(agColDef.cellEditor);
    }
  }
  
  /**
   * Applies sorting and filtering settings
   */
  private applySortingAndFiltering(agColDef: AgColDef, columnDef: ColumnDefinition): void {
    // Sorting
    if (agColDef.sortable !== undefined) {
      columnDef.sortable = agColDef.sortable && !agColDef.suppressSorting;
    }
    
    // Filtering
    if (agColDef.filter !== undefined) {
      if (typeof agColDef.filter === 'boolean') {
        columnDef.filterable = agColDef.filter && !agColDef.suppressFilter;
      } else {
        // String or component filter types - enable filtering
        columnDef.filterable = !agColDef.suppressFilter;
      }
    }
  }
  
  /**
   * Maps ag-Grid cell renderer to NgUiGrid template
   */
  private mapCellRenderer(renderer: any): string {
    if (typeof renderer === 'string') {
      const rendererMap: { [key: string]: string } = {
        'agAnimateShowChangeCellRenderer': 'animated-change',
        'agAnimateSlideCellRenderer': 'slide-animated',
        'agGroupCellRenderer': 'group-cell',
        'agCheckboxCellRenderer': 'checkbox',
        'agLoadingCellRenderer': 'loading'
      };
      
      return rendererMap[renderer] || renderer;
    }
    
    // For custom component renderers, return a generic custom type
    return 'custom';
  }
  
  /**
   * Maps ag-Grid cell editor to NgUiGrid editor
   */
  private mapCellEditor(editor: any): string | boolean {
    if (typeof editor === 'string') {
      const editorMap: { [key: string]: string } = {
        'agTextCellEditor': 'text',
        'agLargeTextCellEditor': 'textarea',
        'agSelectCellEditor': 'select',
        'agRichSelectCellEditor': 'rich-select',
        'agPopupTextCellEditor': 'popup-text',
        'agPopupSelectCellEditor': 'popup-select',
        'agCheckboxCellEditor': 'checkbox',
        'agDateCellEditor': 'date',
        'agDateStringCellEditor': 'date-string',
        'agNumberCellEditor': 'number'
      };
      
      return editorMap[editor] || editor;
    }
    
    return true; // Enable default editor for custom components
  }
  
  /**
   * Maps ag-Grid column type to NgUiGrid column type
   */
  private mapAgTypeToNgUiType(agType: string | string[]): 'string' | 'number' | 'date' | 'boolean' | 'custom' {
    if (Array.isArray(agType)) {
      // If multiple types, use the first one
      agType = agType[0];
    }
    
    const typeMap: { [key: string]: 'string' | 'number' | 'date' | 'boolean' | 'custom' } = {
      'numericColumn': 'number',
      'dateColumn': 'date',
      'checkboxColumn': 'boolean',
      'textColumn': 'string',
      'rightAligned': 'number', // Commonly used for numbers
      'nonEditableColumn': 'string'
    };
    
    return typeMap[agType] || 'string';
  }
  
  /**
   * Infers column type from ag-Grid column definition properties
   */
  private inferColumnType(agColDef: AgColDef): 'string' | 'number' | 'date' | 'boolean' | 'custom' {
    // Check cell editor type
    if (agColDef.cellEditor) {
      if (typeof agColDef.cellEditor === 'string') {
        if (agColDef.cellEditor.includes('number') || agColDef.cellEditor.includes('Number')) {
          return 'number';
        }
        if (agColDef.cellEditor.includes('date') || agColDef.cellEditor.includes('Date')) {
          return 'date';
        }
        if (agColDef.cellEditor.includes('checkbox') || agColDef.cellEditor.includes('Checkbox')) {
          return 'boolean';
        }
      }
    }
    
    // Check cell renderer
    if (agColDef.cellRenderer === 'agCheckboxCellRenderer') {
      return 'boolean';
    }
    
    // Check field name for common patterns
    if (agColDef.field) {
      const field = agColDef.field.toLowerCase();
      if (field.includes('date') || field.includes('time') || field.endsWith('at')) {
        return 'date';
      }
      if (field.includes('price') || field.includes('amount') || field.includes('count') || field.includes('number')) {
        return 'number';
      }
      if (field.includes('active') || field.includes('enabled') || field.includes('visible') || 
          field.startsWith('is') || field.startsWith('has')) {
        return 'boolean';
      }
    }
    
    return 'string'; // Default type
  }
  
  /**
   * Extracts text alignment from ag-Grid cell style
   */
  private extractAlignmentFromStyle(cellStyle: any): 'left' | 'center' | 'right' | undefined {
    if (typeof cellStyle === 'object' && cellStyle !== null) {
      if (cellStyle.textAlign) {
        const align = cellStyle.textAlign.toLowerCase();
        if (['left', 'center', 'right'].includes(align)) {
          return align as 'left' | 'center' | 'right';
        }
      }
      
      // Check for other alignment indicators
      if (cellStyle['text-align']) {
        const align = cellStyle['text-align'].toLowerCase();
        if (['left', 'center', 'right'].includes(align)) {
          return align as 'left' | 'center' | 'right';
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Validates column definition for compatibility issues
   */
  validateColumnDef(agColDef: AgColDef): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const colId = agColDef.colId || agColDef.field || 'unknown';
    
    // Check for unsupported features
    if (agColDef.valueGetter && typeof agColDef.valueGetter === 'function') {
      warnings.push(`Column ${colId}: Function-based valueGetter needs custom implementation`);
    }
    
    if (agColDef.valueSetter && typeof agColDef.valueSetter === 'function') {
      warnings.push(`Column ${colId}: Function-based valueSetter needs custom implementation`);
    }
    
    if (agColDef.comparator && typeof agColDef.comparator === 'function') {
      warnings.push(`Column ${colId}: Custom sort comparator needs custom implementation`);
    }
    
    if (agColDef.cellClass && typeof agColDef.cellClass === 'function') {
      warnings.push(`Column ${colId}: Dynamic cell classes need custom implementation`);
    }
    
    if (agColDef.cellStyle && typeof agColDef.cellStyle === 'function') {
      warnings.push(`Column ${colId}: Dynamic cell styles need custom implementation`);
    }
    
    if (agColDef.cellRenderer && typeof agColDef.cellRenderer !== 'string') {
      warnings.push(`Column ${colId}: Custom cell renderer component needs adaptation`);
    }
    
    if (agColDef.cellEditor && typeof agColDef.cellEditor !== 'string') {
      warnings.push(`Column ${colId}: Custom cell editor component needs adaptation`);
    }
    
    if (agColDef.filter && typeof agColDef.filter !== 'boolean' && typeof agColDef.filter !== 'string') {
      warnings.push(`Column ${colId}: Custom filter component needs adaptation`);
    }
    
    // Check for complex aggregation
    if (agColDef.aggFunc && typeof agColDef.aggFunc === 'function') {
      warnings.push(`Column ${colId}: Custom aggregation function needs custom implementation`);
    }
    
    // Check for row spanning/column spanning
    if (agColDef.rowSpan || agColDef.colSpan) {
      warnings.push(`Column ${colId}: Row/column spanning is not supported`);
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }
  
  /**
   * Creates a compatibility report for a set of column definitions
   */
  generateCompatibilityReport(agColumnDefs: AgColumnDef[]): {
    totalColumns: number;
    compatibleColumns: number;
    warnings: string[];
    unsupportedFeatures: string[];
  } {
    const allWarnings: string[] = [];
    const unsupportedFeatures = new Set<string>();
    let compatibleCount = 0;
    
    for (const colDef of agColumnDefs) {
      const validation = this.validateColumnDef(colDef);
      if (validation.valid) {
        compatibleCount++;
      }
      allWarnings.push(...validation.warnings);
      
      // Track unsupported features
      if (colDef.valueGetter) unsupportedFeatures.add('Value Getters');
      if (colDef.valueSetter) unsupportedFeatures.add('Value Setters');
      if (colDef.comparator) unsupportedFeatures.add('Custom Sort Comparators');
      if (colDef.rowSpan || colDef.colSpan) unsupportedFeatures.add('Cell Spanning');
      if (typeof colDef.cellRenderer === 'object') unsupportedFeatures.add('Custom Cell Renderers');
      if (typeof colDef.cellEditor === 'object') unsupportedFeatures.add('Custom Cell Editors');
    }
    
    return {
      totalColumns: agColumnDefs.length,
      compatibleColumns: compatibleCount,
      warnings: allWarnings,
      unsupportedFeatures: Array.from(unsupportedFeatures)
    };
  }
}