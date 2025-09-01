import { Injectable } from '@angular/core';
import { AgGridOptions } from './ag-grid-options.interface';
import { AgColDef, AgColumnDef } from './ag-col-def.interface';
import { GridConfig, PaginationConfig, GroupingConfig } from '@blg-grid/core';
import { ColumnDefinition } from '@blg-grid/core';

/**
 * Main adapter class that converts ag-Grid configuration to NgUiGrid configuration
 */
@Injectable({
  providedIn: 'root'
})
export class AgGridAdapter {
  
  /**
   * Converts ag-Grid GridOptions to NgUiGrid GridConfig
   */
  convertGridOptions(agOptions: AgGridOptions): GridConfig {
    const gridConfig: GridConfig = {};
    
    // Basic properties
    if (agOptions.rowHeight !== undefined) {
      gridConfig.rowHeight = agOptions.rowHeight;
    }
    
    // Feature flags
    if (agOptions.enableSorting !== undefined) {
      gridConfig.sortable = agOptions.enableSorting;
    }
    
    if (agOptions.enableFilter !== undefined) {
      gridConfig.filterable = agOptions.enableFilter;
    }
    
    if (agOptions.enableColResize !== undefined) {
      gridConfig.resizable = agOptions.enableColResize;
    }
    
    if (agOptions.enableColReorder !== undefined) {
      gridConfig.reorderable = agOptions.enableColReorder;
    }
    
    // Selection
    if (agOptions.rowSelection !== undefined) {
      gridConfig.selectable = true;
      gridConfig.selectionMode = agOptions.rowSelection;
    }
    
    // Virtual scrolling - ag-Grid uses different mechanisms
    if (agOptions.rowModelType === 'clientSide' && agOptions.rowBuffer !== undefined) {
      gridConfig.virtualScrolling = true;
    }
    
    // Pagination
    if (agOptions.pagination !== undefined) {
      gridConfig.pagination = agOptions.pagination;
      
      if (agOptions.pagination) {
        const paginationConfig: PaginationConfig = {};
        
        if (agOptions.paginationPageSize !== undefined) {
          paginationConfig.pageSize = agOptions.paginationPageSize;
        }
        
        if (agOptions.paginationPageSizeSelector !== undefined) {
          if (Array.isArray(agOptions.paginationPageSizeSelector)) {
            paginationConfig.pageSizeOptions = agOptions.paginationPageSizeSelector;
            paginationConfig.showPageSizeSelector = true;
          } else if (agOptions.paginationPageSizeSelector) {
            paginationConfig.showPageSizeSelector = true;
          }
        }
        
        if (agOptions.paginationAutoPageSize) {
          // NgUiGrid handles auto page sizing internally
          paginationConfig.mode = 'client';
        }
        
        gridConfig.paginationConfig = paginationConfig;
      }
    }
    
    // Grouping
    if (agOptions.rowGroupPanelShow !== undefined && agOptions.rowGroupPanelShow !== 'never') {
      gridConfig.grouping = true;
      
      const groupingConfig: GroupingConfig = {};
      
      if (agOptions.groupDefaultExpanded !== undefined) {
        groupingConfig.expandedByDefault = agOptions.groupDefaultExpanded > 0;
      }
      
      gridConfig.groupingConfig = groupingConfig;
    }
    
    // Theme mapping
    if (agOptions.theme !== undefined) {
      gridConfig.theme = this.mapTheme(agOptions.theme);
    }
    
    return gridConfig;
  }
  
  /**
   * Converts ag-Grid column definitions to NgUiGrid column definitions
   */
  convertColumnDefs(agColDefs: AgColumnDef[]): ColumnDefinition[] {
    return agColDefs.map(colDef => this.convertSingleColumnDef(colDef));
  }
  
  /**
   * Converts a single ag-Grid column definition to NgUiGrid column definition
   */
  private convertSingleColumnDef(agColDef: AgColDef): ColumnDefinition {
    const columnDef: ColumnDefinition = {
      id: agColDef.colId || agColDef.field || '',
      field: agColDef.field || '',
      header: agColDef.headerName || agColDef.field || ''
    };
    
    // Width properties
    if (agColDef.width !== undefined) {
      columnDef.width = agColDef.width;
    }
    
    if (agColDef.minWidth !== undefined) {
      columnDef.minWidth = agColDef.minWidth;
    }
    
    if (agColDef.maxWidth !== undefined) {
      columnDef.maxWidth = agColDef.maxWidth;
    }
    
    // Feature flags
    if (agColDef.sortable !== undefined) {
      columnDef.sortable = agColDef.sortable;
    }
    
    if (agColDef.filter !== undefined) {
      columnDef.filterable = agColDef.filter !== false;
    }
    
    if (agColDef.resizable !== undefined) {
      columnDef.resizable = agColDef.resizable;
    }
    
    // Visibility
    if (agColDef.hide !== undefined) {
      columnDef.visible = !agColDef.hide;
    }
    
    // Pinning
    if (agColDef.pinned !== undefined) {
      if (typeof agColDef.pinned === 'string') {
        columnDef.pinned = agColDef.pinned as 'left' | 'right';
      } else if (agColDef.pinned === true) {
        columnDef.pinned = 'left'; // Default to left when true
      }
    }
    
    // Data type mapping
    if (agColDef.type !== undefined) {
      columnDef.type = this.mapColumnType(agColDef.type);
    }
    
    // Cell rendering and editing
    if (agColDef.cellRenderer !== undefined) {
      columnDef.cellRenderer = this.mapCellRenderer(agColDef.cellRenderer);
    }
    
    if (agColDef.editable !== undefined) {
      if (typeof agColDef.editable === 'boolean') {
        columnDef.cellEditor = agColDef.editable;
      } else {
        // For function editable, we'll default to true and handle logic elsewhere
        columnDef.cellEditor = true;
      }
    }
    
    if (agColDef.cellEditor !== undefined) {
      columnDef.cellEditor = this.mapCellEditor(agColDef.cellEditor);
    }
    
    // Alignment - ag-Grid doesn't have direct alignment, infer from cellStyle or cellClass
    if (agColDef.cellStyle) {
      columnDef.align = this.inferAlignmentFromStyle(agColDef.cellStyle);
    }
    
    return columnDef;
  }
  
  /**
   * Maps ag-Grid theme names to NgUiGrid theme names
   */
  private mapTheme(agTheme: string): string {
    const themeMap: { [key: string]: string } = {
      'ag-theme-alpine': 'modern',
      'ag-theme-alpine-dark': 'dark',
      'ag-theme-balham': 'classic',
      'ag-theme-balham-dark': 'dark',
      'ag-theme-material': 'material',
      'ag-theme-quartz': 'modern',
      'ag-theme-quartz-dark': 'dark'
    };
    
    return themeMap[agTheme] || 'modern';
  }
  
  /**
   * Maps ag-Grid column types to NgUiGrid column types
   */
  private mapColumnType(agType: string | string[]): 'string' | 'number' | 'date' | 'boolean' | 'custom' {
    if (Array.isArray(agType)) {
      agType = agType[0]; // Use first type
    }
    
    const typeMap: { [key: string]: 'string' | 'number' | 'date' | 'boolean' | 'custom' } = {
      'numericColumn': 'number',
      'dateColumn': 'date',
      'checkboxColumn': 'boolean',
      'textColumn': 'string'
    };
    
    return typeMap[agType] || 'string';
  }
  
  /**
   * Maps ag-Grid cell renderers to NgUiGrid templates
   */
  private mapCellRenderer(renderer: any): string {
    if (typeof renderer === 'string') {
      // Built-in ag-Grid renderers
      const rendererMap: { [key: string]: string } = {
        'agAnimateShowChangeCellRenderer': 'animated',
        'agAnimateSlideCellRenderer': 'slide-animated',
        'agGroupCellRenderer': 'group',
        'agCheckboxCellRenderer': 'checkbox'
      };
      
      return rendererMap[renderer] || 'default';
    }
    
    // For custom renderers, return a generic template name
    return 'custom';
  }
  
  /**
   * Maps ag-Grid cell editors to NgUiGrid editor types
   */
  private mapCellEditor(editor: any): string | boolean {
    if (typeof editor === 'string') {
      const editorMap: { [key: string]: string } = {
        'agTextCellEditor': 'text',
        'agLargeTextCellEditor': 'textarea',
        'agSelectCellEditor': 'select',
        'agPopupTextCellEditor': 'popup',
        'agPopupSelectCellEditor': 'popup-select',
        'agCheckboxCellEditor': 'checkbox',
        'agDateCellEditor': 'date',
        'agDateTimeCellEditor': 'datetime',
        'agNumberCellEditor': 'number'
      };
      
      return editorMap[editor] || 'text';
    }
    
    return true; // Enable editing with default editor
  }
  
  /**
   * Infers text alignment from ag-Grid cell style
   */
  private inferAlignmentFromStyle(cellStyle: any): 'left' | 'center' | 'right' {
    if (typeof cellStyle === 'object' && cellStyle.textAlign) {
      const alignment = cellStyle.textAlign.toLowerCase();
      if (['left', 'center', 'right'].includes(alignment)) {
        return alignment as 'left' | 'center' | 'right';
      }
    }
    
    return 'left'; // Default alignment
  }
  
  /**
   * Extracts row data from ag-Grid options
   */
  getRowData(agOptions: AgGridOptions): any[] {
    return agOptions.rowData || [];
  }
  
  /**
   * Extracts column definitions from ag-Grid options
   */
  getColumnDefs(agOptions: AgGridOptions): ColumnDefinition[] {
    if (!agOptions.columnDefs) {
      return [];
    }
    
    return this.convertColumnDefs(agOptions.columnDefs);
  }
  
  /**
   * Merges default column definition with individual column definitions
   */
  applyDefaultColDef(columnDefs: AgColumnDef[], defaultColDef?: AgColDef): AgColumnDef[] {
    if (!defaultColDef) {
      return columnDefs;
    }
    
    return columnDefs.map(colDef => ({
      ...defaultColDef,
      ...colDef
    }));
  }
  
  /**
   * Validates ag-Grid configuration for compatibility
   */
  validateConfiguration(agOptions: AgGridOptions): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Check for unsupported features
    if (agOptions.rowModelType === 'infinite') {
      warnings.push('Infinite row model is not fully supported. Consider using client-side model with virtual scrolling.');
    }
    
    if (agOptions.rowModelType === 'serverSide') {
      warnings.push('Server-side row model is not supported. Use client-side model with appropriate data loading.');
    }
    
    if (agOptions.treeData) {
      warnings.push('Tree data feature is not yet implemented. Consider using row grouping instead.');
    }
    
    if (agOptions.enableContextMenu) {
      warnings.push('Context menu is not implemented. Custom context menu implementation required.');
    }
    
    if (agOptions.enableClipboard) {
      warnings.push('Clipboard operations may have limited support.');
    }
    
    // Check for complex column definitions that might need special handling
    if (agOptions.columnDefs) {
      agOptions.columnDefs.forEach((colDef, index) => {
        if (colDef.cellRenderer && typeof colDef.cellRenderer !== 'string') {
          warnings.push(`Column ${index}: Custom cell renderers need to be adapted to NgUiGrid template system.`);
        }
        
        if (colDef.cellEditor && typeof colDef.cellEditor !== 'string') {
          warnings.push(`Column ${index}: Custom cell editors need to be adapted to NgUiGrid editor system.`);
        }
        
        if (colDef.valueGetter) {
          warnings.push(`Column ${index}: Value getters need to be implemented in NgUiGrid data processing.`);
        }
        
        if (colDef.valueSetter) {
          warnings.push(`Column ${index}: Value setters need to be implemented in NgUiGrid data processing.`);
        }
      });
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}