/**
 * Migration Mapper: Converts ag-Grid configurations to BigLedger Grid equivalents
 */

import { AgGridOptions, AgGridColumn } from './ag-grid-types.js';

export interface BlgGridConfig {
  data?: any[];
  columns?: BlgColumnDefinition[];
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    autoPageSize?: boolean;
  };
  selection?: {
    mode: 'single' | 'multiple' | 'none';
    checkboxSelection?: boolean;
    suppressRowClickSelection?: boolean;
  };
  sorting?: {
    enabled: boolean;
    multiSort?: boolean;
    sortingOrder?: ('asc' | 'desc')[];
  };
  filtering?: {
    enabled: boolean;
    quickFilter?: boolean;
    advancedFilter?: boolean;
  };
  virtualScrolling?: {
    enabled: boolean;
    bufferSize?: number;
    threshold?: number;
  };
  theme?: string;
  height?: string | number;
  rowHeight?: number;
  headerHeight?: number;
  enableAnimations?: boolean;
  showLoadingOverlay?: boolean;
  showNoRowsOverlay?: boolean;
}

export interface BlgColumnDefinition {
  field?: string;
  headerName?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'number' | 'date' | 'boolean' | 'set';
  cellRenderer?: string | any;
  cellEditor?: string | any;
  editable?: boolean | ((params: any) => boolean);
  hidden?: boolean;
  pinned?: 'left' | 'right';
  lockPosition?: boolean;
  checkboxSelection?: boolean;
  valueGetter?: string | ((params: any) => any);
  valueSetter?: string | ((params: any) => boolean);
  valueFormatter?: string | ((params: any) => string);
  comparator?: (a: any, b: any) => number;
  cellClass?: string | string[] | ((params: any) => string | string[]);
  cellStyle?: any | ((params: any) => any);
  tooltipField?: string;
  tooltipValueGetter?: string | ((params: any) => string);
  onCellValueChanged?: (params: any) => void;
  onCellClicked?: (params: any) => void;
  onCellDoubleClicked?: (params: any) => void;
}

export class MigrationMapper {
  /**
   * Main migration function - converts ag-Grid options to BigLedger Grid config
   */
  static migrateGridOptions(agGridOptions: AgGridOptions): BlgGridConfig {
    const blgConfig: BlgGridConfig = {};

    // Data mapping
    if (agGridOptions.rowData) {
      blgConfig.data = agGridOptions.rowData;
    }

    // Column mapping
    if (agGridOptions.columnDefs) {
      blgConfig.columns = this.migrateColumns(agGridOptions.columnDefs);
    }

    // Pagination mapping
    if (agGridOptions.pagination) {
      blgConfig.pagination = {
        enabled: true,
        pageSize: agGridOptions.paginationPageSize || 20,
        autoPageSize: agGridOptions.paginationAutoPageSize || false
      };
    }

    // Selection mapping
    blgConfig.selection = this.migrateSelection(agGridOptions);

    // Sorting mapping
    blgConfig.sorting = this.migrateSorting(agGridOptions);

    // Filtering mapping
    blgConfig.filtering = this.migrateFiltering(agGridOptions);

    // Virtual scrolling (auto-enabled for large datasets in BLG)
    blgConfig.virtualScrolling = {
      enabled: true,
      bufferSize: agGridOptions.cacheBlockSize || 50,
      threshold: 50
    };

    // Theme mapping
    if (agGridOptions.theme) {
      blgConfig.theme = this.migrateTheme(agGridOptions.theme);
    }

    // Height and styling
    if (agGridOptions.rowHeight) {
      blgConfig.rowHeight = agGridOptions.rowHeight;
    }
    if (agGridOptions.headerHeight) {
      blgConfig.headerHeight = agGridOptions.headerHeight;
    }

    // Animation settings
    blgConfig.enableAnimations = agGridOptions.animateRows ?? true;

    return blgConfig;
  }

  /**
   * Migrate column definitions
   */
  private static migrateColumns(agColumns: AgGridColumn[]): BlgColumnDefinition[] {
    return agColumns.map(agCol => this.migrateColumn(agCol));
  }

  /**
   * Migrate single column definition
   */
  private static migrateColumn(agCol: AgGridColumn): BlgColumnDefinition {
    const blgCol: BlgColumnDefinition = {};

    // Basic column properties
    if (agCol.field) blgCol.field = agCol.field;
    if (agCol.headerName) blgCol.headerName = agCol.headerName;
    if (agCol.width) blgCol.width = agCol.width;
    if (agCol.minWidth) blgCol.minWidth = agCol.minWidth;
    if (agCol.maxWidth) blgCol.maxWidth = agCol.maxWidth;

    // Boolean properties
    if (agCol.resizable !== undefined) blgCol.resizable = agCol.resizable;
    if (agCol.sortable !== undefined) blgCol.sortable = agCol.sortable;
    if (agCol.editable !== undefined) blgCol.editable = agCol.editable;
    if (agCol.hide !== undefined) blgCol.hidden = agCol.hide;
    if (agCol.lockPosition !== undefined) blgCol.lockPosition = agCol.lockPosition;
    if (agCol.checkboxSelection !== undefined) blgCol.checkboxSelection = agCol.checkboxSelection;

    // Filter mapping
    if (agCol.filter) {
      blgCol.filterable = true;
      blgCol.filterType = this.migrateFilterType(agCol.filter);
    }

    // Pinning
    if (agCol.pinned) {
      blgCol.pinned = agCol.pinned;
    }

    // Functions
    if (agCol.valueGetter) blgCol.valueGetter = agCol.valueGetter;
    if (agCol.valueSetter) blgCol.valueSetter = agCol.valueSetter;
    if (agCol.valueFormatter) blgCol.valueFormatter = agCol.valueFormatter;
    if (agCol.comparator) blgCol.comparator = agCol.comparator;

    // Styling
    if (agCol.cellClass) blgCol.cellClass = agCol.cellClass;
    if (agCol.cellStyle) blgCol.cellStyle = agCol.cellStyle;

    // Tooltips
    if (agCol.tooltipField) blgCol.tooltipField = agCol.tooltipField;
    if (agCol.tooltipValueGetter) blgCol.tooltipValueGetter = agCol.tooltipValueGetter;

    // Cell renderers and editors
    if (agCol.cellRenderer) blgCol.cellRenderer = agCol.cellRenderer;
    if (agCol.cellEditor) blgCol.cellEditor = agCol.cellEditor;

    // Events
    if (agCol.onCellValueChanged) blgCol.onCellValueChanged = agCol.onCellValueChanged;
    if (agCol.onCellClicked) blgCol.onCellClicked = agCol.onCellClicked;
    if (agCol.onCellDoubleClicked) blgCol.onCellDoubleClicked = agCol.onCellDoubleClicked;

    return blgCol;
  }

  /**
   * Map ag-Grid filter types to BLG filter types
   */
  private static migrateFilterType(filter: boolean | string | any): 'text' | 'number' | 'date' | 'boolean' | 'set' {
    if (typeof filter === 'boolean') {
      return 'text'; // Default
    }
    
    if (typeof filter === 'string') {
      switch (filter) {
        case 'agTextColumnFilter':
          return 'text';
        case 'agNumberColumnFilter':
          return 'number';
        case 'agDateColumnFilter':
          return 'date';
        case 'agSetColumnFilter':
          return 'set';
        default:
          return 'text';
      }
    }

    return 'text'; // Default fallback
  }

  /**
   * Migrate selection configuration
   */
  private static migrateSelection(agOptions: AgGridOptions) {
    return {
      mode: agOptions.rowSelection || 'single',
      checkboxSelection: agOptions.checkboxSelection || false,
      suppressRowClickSelection: agOptions.suppressRowClickSelection || false
    };
  }

  /**
   * Migrate sorting configuration
   */
  private static migrateSorting(agOptions: AgGridOptions) {
    return {
      enabled: true,
      multiSort: !agOptions.suppressMultiSort,
      sortingOrder: agOptions.sortingOrder || ['asc', 'desc']
    };
  }

  /**
   * Migrate filtering configuration
   */
  private static migrateFiltering(agOptions: AgGridOptions) {
    return {
      enabled: agOptions.enableFilter !== false,
      quickFilter: true,
      advancedFilter: true
    };
  }

  /**
   * Map ag-Grid themes to BLG themes
   */
  private static migrateTheme(agTheme: string): string {
    const themeMap: { [key: string]: string } = {
      'ag-theme-alpine': 'blg-theme-default',
      'ag-theme-alpine-dark': 'blg-theme-dark',
      'ag-theme-balham': 'blg-theme-material',
      'ag-theme-balham-dark': 'blg-theme-material-dark',
      'ag-theme-material': 'blg-theme-material',
      'ag-theme-fresh': 'blg-theme-default',
      'ag-theme-blue': 'blg-theme-blue',
      'ag-theme-bootstrap': 'blg-theme-bootstrap'
    };

    return themeMap[agTheme] || 'blg-theme-default';
  }

  /**
   * Generate migration warnings for unsupported features
   */
  static generateMigrationWarnings(agOptions: AgGridOptions): string[] {
    const warnings: string[] = [];

    // Check for unsupported row model types
    if (agOptions.rowModelType && agOptions.rowModelType !== 'clientSide') {
      warnings.push(`Row model type '${agOptions.rowModelType}' may require manual implementation. BLG Grid primarily supports client-side data.`);
    }

    // Check for master-detail
    if (agOptions.masterDetail) {
      warnings.push('Master-Detail functionality requires custom implementation in BLG Grid.');
    }

    // Check for tree data
    if (agOptions.treeData) {
      warnings.push('Tree data functionality is planned for BLG Grid v2.0.');
    }

    // Check for pivot mode
    if (agOptions.columnDefs?.some(col => col.pivot)) {
      warnings.push('Pivot mode is not yet supported in BLG Grid.');
    }

    // Check for grouping
    if (agOptions.columnDefs?.some(col => col.rowGroup)) {
      warnings.push('Row grouping requires manual implementation in BLG Grid.');
    }

    // Check for aggregation
    if (agOptions.columnDefs?.some(col => col.aggFunc)) {
      warnings.push('Column aggregation functions require manual implementation in BLG Grid.');
    }

    return warnings;
  }

  /**
   * Generate compatibility report
   */
  static generateCompatibilityReport(agOptions: AgGridOptions): {
    compatible: string[];
    requiresWork: string[];
    unsupported: string[];
    warnings: string[];
  } {
    const compatible: string[] = [];
    const requiresWork: string[] = [];
    const unsupported: string[] = [];

    // Check basic features
    if (agOptions.rowData) compatible.push('Basic row data');
    if (agOptions.columnDefs) compatible.push('Column definitions');
    if (agOptions.pagination) compatible.push('Pagination');
    if (agOptions.rowSelection) compatible.push('Row selection');

    // Check sorting
    if (agOptions.columnDefs?.some(col => col.sortable)) {
      compatible.push('Column sorting');
    }

    // Check filtering
    if (agOptions.columnDefs?.some(col => col.filter)) {
      compatible.push('Column filtering');
    }

    // Check cell editing
    if (agOptions.columnDefs?.some(col => col.editable)) {
      compatible.push('Cell editing');
    }

    // Features that require work
    if (agOptions.masterDetail) {
      requiresWork.push('Master-Detail rows');
    }

    if (agOptions.columnDefs?.some(col => col.rowGroup)) {
      requiresWork.push('Row grouping');
    }

    if (agOptions.columnDefs?.some(col => col.aggFunc)) {
      requiresWork.push('Column aggregation');
    }

    // Custom cell renderers
    if (agOptions.columnDefs?.some(col => col.cellRenderer && typeof col.cellRenderer !== 'string')) {
      requiresWork.push('Custom cell renderers');
    }

    // Unsupported features
    if (agOptions.treeData) {
      unsupported.push('Tree data (planned for v2.0)');
    }

    if (agOptions.columnDefs?.some(col => col.pivot)) {
      unsupported.push('Pivot mode');
    }

    if (agOptions.rowModelType === 'serverSide') {
      unsupported.push('Server-side row model (infinite scrolling available)');
    }

    const warnings = this.generateMigrationWarnings(agOptions);

    return {
      compatible,
      requiresWork,
      unsupported,
      warnings
    };
  }
}