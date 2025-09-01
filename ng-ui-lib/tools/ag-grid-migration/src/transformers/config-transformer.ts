import { Transformation } from '../types/migration.types';

export class ConfigTransformer {
  private readonly CONFIG_MAPPINGS = new Map([
    // Basic grid configuration
    ['rowData', 'data'],
    ['columnDefs', 'columns'],
    ['defaultColDef', 'defaultColumn'],
    
    // Selection
    ['rowSelection', 'rowSelection'],
    ['suppressRowClickSelection', 'disableRowClickSelection'],
    ['suppressRowDeselection', 'disableRowDeselection'],
    ['rowMultiSelectWithClick', 'multiSelectWithClick'],
    
    // Sorting
    ['enableSorting', 'sortable'],
    ['multiSortKey', 'multiSortKey'],
    ['suppressMenuHide', 'persistentMenu'],
    
    // Filtering
    ['enableFiltering', 'filterable'],
    ['quickFilterText', 'quickFilter'],
    ['cacheQuickFilter', 'cacheQuickFilter'],
    
    // Pagination
    ['pagination', 'paginated'],
    ['paginationPageSize', 'pageSize'],
    ['paginationAutoPageSize', 'autoPageSize'],
    
    // Column resizing
    ['enableColResize', 'resizable'],
    ['suppressColumnMoveAnimation', 'disableColumnMoveAnimation'],
    ['suppressColumnVirtualisation', 'disableColumnVirtualization'],
    
    // Row configuration
    ['rowHeight', 'rowHeight'],
    ['getRowHeight', 'getRowHeight'],
    ['getRowId', 'getRowId'],
    ['getRowClass', 'getRowClass'],
    ['getRowStyle', 'getRowStyle'],
    
    // Header configuration
    ['headerHeight', 'headerHeight'],
    ['groupHeaderHeight', 'groupHeaderHeight'],
    ['pivotHeaderHeight', 'pivotHeaderHeight'],
    
    // Animation and performance
    ['animateRows', 'animateRows'],
    ['suppressRowHoverHighlight', 'disableRowHover'],
    ['suppressCellSelection', 'disableCellSelection'],
    
    // Context and loading
    ['context', 'context'],
    ['loadingOverlayComponent', 'loadingComponent'],
    ['noRowsOverlayComponent', 'emptyStateComponent'],
    
    // Custom components
    ['components', 'customComponents'],
    ['frameworkComponents', 'customComponents'],
  ]);

  private readonly COLUMN_DEF_MAPPINGS = new Map([
    // Basic column properties
    ['field', 'field'],
    ['headerName', 'header'],
    ['width', 'width'],
    ['minWidth', 'minWidth'],
    ['maxWidth', 'maxWidth'],
    ['flex', 'flex'],
    
    // Column behavior
    ['sortable', 'sortable'],
    ['filter', 'filterable'],
    ['resizable', 'resizable'],
    ['suppressMovable', 'disableMovable'],
    ['lockPosition', 'lockPosition'],
    ['pinned', 'pinned'],
    
    // Cell rendering
    ['cellRenderer', 'cellRenderer'],
    ['cellRendererParams', 'cellRendererParams'],
    ['valueGetter', 'valueGetter'],
    ['valueSetter', 'valueSetter'],
    ['valueFormatter', 'valueFormatter'],
    ['valueParser', 'valueParser'],
    
    // Cell editing
    ['editable', 'editable'],
    ['cellEditor', 'cellEditor'],
    ['cellEditorParams', 'cellEditorParams'],
    
    // Filtering
    ['filterParams', 'filterConfig'],
    ['floatingFilter', 'showQuickFilter'],
    ['floatingFilterComponent', 'quickFilterComponent'],
    
    // Header
    ['headerComponent', 'headerComponent'],
    ['headerComponentParams', 'headerComponentParams'],
    ['headerTooltip', 'headerTooltip'],
    
    // Grouping
    ['rowGroup', 'groupBy'],
    ['rowGroupIndex', 'groupIndex'],
    ['enableRowGroup', 'allowGrouping'],
    
    // Aggregation
    ['aggFunc', 'aggregation'],
    ['enableValue', 'allowAggregation'],
    
    // Tooltips
    ['tooltipField', 'tooltipField'],
    ['tooltipValueGetter', 'tooltipValueGetter'],
    
    // CSS and styling
    ['cellClass', 'cellClass'],
    ['cellStyle', 'cellStyle'],
    ['headerClass', 'headerClass'],
    
    // Checkbox selection
    ['checkboxSelection', 'checkboxSelection'],
    ['headerCheckboxSelection', 'headerCheckboxSelection'],
  ]);

  private readonly UNSUPPORTED_CONFIG = new Set([
    // Enterprise features
    'enableRangeSelection',
    'enableCharts',
    'masterDetail',
    'treeData',
    'pivotMode',
    'statusBar',
    'sideBar',
    'toolPanel',
    
    // Advanced features not yet supported
    'groupDefaultExpanded',
    'autoGroupColumnDef',
    'getContextMenuItems',
    'getMainMenuItems',
    'allowContextMenuWithControlKey',
    'suppressContextMenu',
    'enableBrowserTooltips',
    'clipboardDeliminator',
    'processDataFromClipboard',
    'sendToClipboard',
  ]);

  transformGridConfig(
    filePath: string,
    line: number,
    column: number,
    originalText: string,
    configObject: any
  ): Transformation[] {
    const transformations: Transformation[] = [];
    const transformedConfig: any = {};
    const warnings: string[] = [];

    for (const [key, value] of Object.entries(configObject)) {
      if (this.UNSUPPORTED_CONFIG.has(key)) {
        warnings.push(`Unsupported config property '${key}' requires manual migration`);
        transformedConfig[`_todo_${key}`] = `/* TODO: Migrate ${key} manually */`;
        continue;
      }

      const newKey = this.CONFIG_MAPPINGS.get(key) || key;
      transformedConfig[newKey] = this.transformConfigValue(key, value);
    }

    // Special handling for columnDefs
    if (configObject.columnDefs) {
      transformedConfig.columns = this.transformColumnDefinitions(configObject.columnDefs);
      delete transformedConfig.columnDefs;
    }

    const newConfigText = this.objectToString(transformedConfig);
    
    if (originalText !== newConfigText) {
      let description = 'Transform ag-Grid configuration to ng-ui format';
      if (warnings.length > 0) {
        description += ` (${warnings.length} manual changes required)`;
      }

      transformations.push({
        filePath,
        type: 'config',
        line,
        column,
        oldText: originalText,
        newText: newConfigText,
        description
      });
    }

    return transformations;
  }

  transformColumnDefinitions(columnDefs: any[]): any[] {
    return columnDefs.map(colDef => this.transformColumnDefinition(colDef));
  }

  private transformColumnDefinition(colDef: any): any {
    const transformedColDef: any = {};
    
    for (const [key, value] of Object.entries(colDef)) {
      const newKey = this.COLUMN_DEF_MAPPINGS.get(key) || key;
      
      if (key === 'filter') {
        // Transform filter configuration
        transformedColDef.filterable = true;
        if (typeof value === 'string') {
          transformedColDef.filterType = this.transformFilterType(value);
        } else if (typeof value === 'object') {
          transformedColDef.filterConfig = this.transformFilterConfig(value);
        }
      } else if (key === 'cellRenderer') {
        // Transform cell renderer
        transformedColDef.cellRenderer = this.transformCellRenderer(value);
      } else if (key === 'cellEditor') {
        // Transform cell editor
        transformedColDef.cellEditor = this.transformCellEditor(value);
      } else {
        transformedColDef[newKey] = value;
      }
    }

    return transformedColDef;
  }

  private transformFilterType(filterType: string): string {
    const filterMappings: { [key: string]: string } = {
      'agTextColumnFilter': 'text',
      'agNumberColumnFilter': 'number',
      'agDateColumnFilter': 'date',
      'agSetColumnFilter': 'set',
      'agMultiColumnFilter': 'multi'
    };

    return filterMappings[filterType] || 'text';
  }

  private transformFilterConfig(filterConfig: any): any {
    // Transform filter configuration object
    const transformed: any = {};
    
    for (const [key, value] of Object.entries(filterConfig)) {
      switch (key) {
        case 'filterOptions':
          transformed.options = value;
          break;
        case 'defaultOption':
          transformed.defaultOption = value;
          break;
        case 'suppressAndOrCondition':
          transformed.disableAndOr = value;
          break;
        case 'caseSensitive':
          transformed.caseSensitive = value;
          break;
        default:
          transformed[key] = value;
      }
    }

    return transformed;
  }

  private transformCellRenderer(renderer: any): any {
    if (typeof renderer === 'string') {
      // Built-in renderer mappings
      const rendererMappings: { [key: string]: string } = {
        'agGroupCellRenderer': 'groupRenderer',
        'agAnimateShowChangeCellRenderer': 'animatedRenderer',
        'agAnimateSlideCellRenderer': 'slideRenderer'
      };
      
      return rendererMappings[renderer] || renderer;
    }
    
    return renderer;
  }

  private transformCellEditor(editor: any): any {
    if (typeof editor === 'string') {
      // Built-in editor mappings
      const editorMappings: { [key: string]: string } = {
        'agTextCellEditor': 'text',
        'agLargeTextCellEditor': 'textarea',
        'agSelectCellEditor': 'select',
        'agPopupTextCellEditor': 'popup',
        'agPopupSelectCellEditor': 'popupSelect'
      };
      
      return editorMappings[editor] || editor;
    }
    
    return editor;
  }

  private transformConfigValue(key: string, value: any): any {
    // Special value transformations based on key
    switch (key) {
      case 'rowSelection':
        return value === 'multiple' ? 'multi' : value;
      case 'pagination':
        return Boolean(value);
      default:
        return value;
    }
  }

  private objectToString(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  getUnsupportedConfigurations(): Set<string> {
    return this.UNSUPPORTED_CONFIG;
  }

  addCustomConfigMapping(agGridProperty: string, ngUiProperty: string): void {
    this.CONFIG_MAPPINGS.set(agGridProperty, ngUiProperty);
  }

  addUnsupportedConfiguration(property: string): void {
    this.UNSUPPORTED_CONFIG.add(property);
  }
}