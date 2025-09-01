import { Injectable, ComponentRef, ViewContainerRef, Type, inject } from '@angular/core';
import { AgCellRenderers, AgCellEditors } from '../interfaces/ag-grid-compat.interface';

/**
 * Parameters passed to cell renderers
 */
export interface CellRendererParams {
  value: any;
  valueFormatted?: string;
  data: any;
  node: any;
  colDef: any;
  column: any;
  rowIndex: number;
  api: any;
  columnApi: any;
  context: any;
  refreshCell: () => void;
  eGridCell: HTMLElement;
  eParentOfValue: HTMLElement;
}

/**
 * Parameters passed to cell editors
 */
export interface CellEditorParams {
  value: any;
  keyPress?: number;
  charPress?: string;
  data: any;
  node: any;
  colDef: any;
  column: any;
  rowIndex: number;
  api: any;
  columnApi: any;
  context: any;
  onKeyDown?: (event: KeyboardEvent) => void;
  stopEditing?: (suppressNavigateAfterEdit?: boolean) => void;
  eGridCell: HTMLElement;
  parseValue?: (value: any) => any;
  formatValue?: (value: any) => any;
}

/**
 * Base interface for cell renderers
 */
export interface ICellRenderer {
  init?(params: CellRendererParams): void;
  getGui(): HTMLElement | string;
  refresh?(params: CellRendererParams): boolean;
  destroy?(): void;
}

/**
 * Base interface for cell editors
 */
export interface ICellEditor {
  init(params: CellEditorParams): void;
  getGui(): HTMLElement;
  afterGuiAttached?(): void;
  getValue(): any;
  destroy?(): void;
  isPopup?(): boolean;
  isCancelBeforeStart?(): boolean;
  isCancelAfterEnd?(): boolean;
  focusIn?(): void;
  focusOut?(): void;
}

/**
 * Built-in group cell renderer
 */
export class AgGroupCellRenderer implements ICellRenderer {
  private eGui!: HTMLElement;
  private params!: CellRendererParams;
  
  init(params: CellRendererParams): void {
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-group-cell-renderer';
    this.refresh(params);
  }
  
  getGui(): HTMLElement {
    return this.eGui;
  }
  
  refresh(params: CellRendererParams): boolean {
    this.params = params;
    const groupData = params.data || {};
    const isExpanded = groupData.expanded !== false;
    
    this.eGui.innerHTML = `
      <span class="ag-group-expanded" style="display: ${isExpanded ? 'inline' : 'none'}">▼</span>
      <span class="ag-group-contracted" style="display: ${isExpanded ? 'none' : 'inline'}">▶</span>
      <span class="ag-group-value">${params.value || ''}</span>
      <span class="ag-group-count">(${groupData.count || 0})</span>
    `;
    
    // Add click handler for expand/collapse
    this.eGui.addEventListener('click', () => {
      if (groupData.toggleExpanded) {
        groupData.toggleExpanded();
        params.refreshCell();
      }
    });
    
    return true;
  }
  
  destroy(): void {
    // Cleanup if needed
  }
}

/**
 * Built-in loading cell renderer
 */
export class AgLoadingCellRenderer implements ICellRenderer {
  private eGui!: HTMLElement;
  
  init(params: CellRendererParams): void {
    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-loading-cell-renderer';
    this.eGui.innerHTML = '<span class="ag-loading-icon">⏳</span> Loading...';
  }
  
  getGui(): HTMLElement {
    return this.eGui;
  }
  
  refresh(): boolean {
    return false; // No refresh needed
  }
}

/**
 * Built-in checkbox cell renderer
 */
export class AgCheckboxCellRenderer implements ICellRenderer {
  private eGui!: HTMLElement;
  private params!: CellRendererParams;
  
  init(params: CellRendererParams): void {
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-checkbox-cell-renderer';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!params.value;
    checkbox.disabled = params.colDef.editable === false;
    
    checkbox.addEventListener('change', (event) => {
      if (params.node.setDataValue) {
        params.node.setDataValue(params.colDef.field, checkbox.checked);
      }
    });
    
    this.eGui.appendChild(checkbox);
  }
  
  getGui(): HTMLElement {
    return this.eGui;
  }
  
  refresh(params: CellRendererParams): boolean {
    this.params = params;
    const checkbox = this.eGui.querySelector('input') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !!params.value;
    }
    return true;
  }
}

/**
 * Built-in text cell editor
 */
export class AgTextCellEditor implements ICellEditor {
  private eInput!: HTMLInputElement;
  private params!: CellEditorParams;
  
  init(params: CellEditorParams): void {
    this.params = params;
    this.eInput = document.createElement('input');
    this.eInput.type = 'text';
    this.eInput.className = 'ag-text-cell-editor';
    this.eInput.value = params.value || '';
    
    // Handle key events
    this.eInput.addEventListener('keydown', (event) => {
      if (params.onKeyDown) {
        params.onKeyDown(event);
      }
      
      switch (event.key) {
        case 'Enter':
          if (params.stopEditing) {
            params.stopEditing();
          }
          break;
        case 'Escape':
          if (params.stopEditing) {
            params.stopEditing(true);
          }
          break;
      }
    });
  }
  
  getGui(): HTMLElement {
    return this.eInput;
  }
  
  afterGuiAttached(): void {
    this.eInput.focus();
    this.eInput.select();
  }
  
  getValue(): any {
    return this.eInput.value;
  }
  
  isPopup(): boolean {
    return false;
  }
  
  destroy(): void {
    // Cleanup if needed
  }
}

/**
 * Built-in select cell editor
 */
export class AgSelectCellEditor implements ICellEditor {
  private eSelect!: HTMLSelectElement;
  private params!: CellEditorParams;
  
  init(params: CellEditorParams): void {
    this.params = params;
    this.eSelect = document.createElement('select');
    this.eSelect.className = 'ag-select-cell-editor';
    
    // Get options from column definition or parameters
    const options = params.colDef.cellEditorParams?.values || ['Yes', 'No'];
    
    options.forEach((option: any) => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.text = option;
      optionElement.selected = option === params.value;
      this.eSelect.appendChild(optionElement);
    });
    
    // Handle key events
    this.eSelect.addEventListener('keydown', (event) => {
      if (params.onKeyDown) {
        params.onKeyDown(event);
      }
      
      switch (event.key) {
        case 'Enter':
          if (params.stopEditing) {
            params.stopEditing();
          }
          break;
        case 'Escape':
          if (params.stopEditing) {
            params.stopEditing(true);
          }
          break;
      }
    });
  }
  
  getGui(): HTMLElement {
    return this.eSelect;
  }
  
  afterGuiAttached(): void {
    this.eSelect.focus();
  }
  
  getValue(): any {
    return this.eSelect.value;
  }
  
  isPopup(): boolean {
    return false;
  }
}

/**
 * Built-in number cell editor
 */
export class AgNumberCellEditor implements ICellEditor {
  private eInput!: HTMLInputElement;
  private params!: CellEditorParams;
  
  init(params: CellEditorParams): void {
    this.params = params;
    this.eInput = document.createElement('input');
    this.eInput.type = 'number';
    this.eInput.className = 'ag-number-cell-editor';
    this.eInput.value = params.value || '';
    
    // Apply number-specific attributes
    if (params.colDef.cellEditorParams) {
      const editorParams = params.colDef.cellEditorParams;
      if (editorParams.min !== undefined) this.eInput.min = editorParams.min;
      if (editorParams.max !== undefined) this.eInput.max = editorParams.max;
      if (editorParams.step !== undefined) this.eInput.step = editorParams.step;
    }
    
    // Handle key events
    this.eInput.addEventListener('keydown', (event) => {
      if (params.onKeyDown) {
        params.onKeyDown(event);
      }
      
      switch (event.key) {
        case 'Enter':
          if (params.stopEditing) {
            params.stopEditing();
          }
          break;
        case 'Escape':
          if (params.stopEditing) {
            params.stopEditing(true);
          }
          break;
      }
    });
  }
  
  getGui(): HTMLElement {
    return this.eInput;
  }
  
  afterGuiAttached(): void {
    this.eInput.focus();
    this.eInput.select();
  }
  
  getValue(): any {
    const value = this.eInput.value;
    return value === '' ? null : Number(value);
  }
  
  isPopup(): boolean {
    return false;
  }
}

/**
 * Built-in date cell editor
 */
export class AgDateCellEditor implements ICellEditor {
  private eInput!: HTMLInputElement;
  private params!: CellEditorParams;
  
  init(params: CellEditorParams): void {
    this.params = params;
    this.eInput = document.createElement('input');
    this.eInput.type = 'date';
    this.eInput.className = 'ag-date-cell-editor';
    
    // Convert value to date format
    if (params.value) {
      const date = new Date(params.value);
      if (!isNaN(date.getTime())) {
        this.eInput.value = date.toISOString().split('T')[0];
      }
    }
    
    // Handle key events
    this.eInput.addEventListener('keydown', (event) => {
      if (params.onKeyDown) {
        params.onKeyDown(event);
      }
      
      switch (event.key) {
        case 'Enter':
          if (params.stopEditing) {
            params.stopEditing();
          }
          break;
        case 'Escape':
          if (params.stopEditing) {
            params.stopEditing(true);
          }
          break;
      }
    });
  }
  
  getGui(): HTMLElement {
    return this.eInput;
  }
  
  afterGuiAttached(): void {
    this.eInput.focus();
  }
  
  getValue(): any {
    return this.eInput.value ? new Date(this.eInput.value) : null;
  }
  
  isPopup(): boolean {
    return false;
  }
}

/**
 * Service for managing cell renderers and editors
 */
@Injectable({
  providedIn: 'root'
})
export class CellRendererService {
  private renderers = new Map<string, Type<ICellRenderer> | (() => ICellRenderer)>();
  private editors = new Map<string, Type<ICellEditor> | (() => ICellEditor)>();
  
  constructor() {
    this.registerBuiltInComponents();
  }
  
  /**
   * Register built-in cell renderers and editors
   */
  private registerBuiltInComponents(): void {
    // Register built-in renderers
    this.renderers.set(AgCellRenderers.agGroupCellRenderer, () => new AgGroupCellRenderer());
    this.renderers.set(AgCellRenderers.agLoadingCellRenderer, () => new AgLoadingCellRenderer());
    this.renderers.set(AgCellRenderers.agCheckboxCellRenderer, () => new AgCheckboxCellRenderer());
    
    // Register built-in editors
    this.editors.set(AgCellEditors.agTextCellEditor, () => new AgTextCellEditor());
    this.editors.set(AgCellEditors.agSelectCellEditor, () => new AgSelectCellEditor());
    this.editors.set(AgCellEditors.agNumberCellEditor, () => new AgNumberCellEditor());
    this.editors.set(AgCellEditors.agDateCellEditor, () => new AgDateCellEditor());
  }
  
  /**
   * Register a custom cell renderer
   */
  registerCellRenderer(name: string, renderer: Type<ICellRenderer> | (() => ICellRenderer)): void {
    this.renderers.set(name, renderer);
  }
  
  /**
   * Register a custom cell editor
   */
  registerCellEditor(name: string, editor: Type<ICellEditor> | (() => ICellEditor)): void {
    this.editors.set(name, editor);
  }
  
  /**
   * Get cell renderer instance
   */
  getCellRenderer(name: string): ICellRenderer | null {
    const rendererFactory = this.renderers.get(name);
    if (rendererFactory) {
      return typeof rendererFactory === 'function' ? rendererFactory() : new rendererFactory();
    }
    return null;
  }
  
  /**
   * Get cell editor instance
   */
  getCellEditor(name: string): ICellEditor | null {
    const editorFactory = this.editors.get(name);
    if (editorFactory) {
      return typeof editorFactory === 'function' ? editorFactory() : new editorFactory();
    }
    return null;
  }
  
  /**
   * Create cell renderer element
   */
  createCellRenderer(rendererName: string, params: CellRendererParams): HTMLElement | string {
    const renderer = this.getCellRenderer(rendererName);
    if (renderer) {
      if (renderer.init) {
        renderer.init(params);
      }
      return renderer.getGui();
    }
    
    // Default renderer - just return the value
    return params.value || '';
  }
  
  /**
   * Create cell editor element
   */
  createCellEditor(editorName: string, params: CellEditorParams): { element: HTMLElement; editor: ICellEditor } | null {
    const editor = this.getCellEditor(editorName);
    if (editor) {
      editor.init(params);
      return {
        element: editor.getGui(),
        editor: editor
      };
    }
    
    return null;
  }
  
  /**
   * Render cell content based on column definition
   */
  renderCell(value: any, colDef: any, params: Partial<CellRendererParams>): HTMLElement | string {
    if (colDef.cellRenderer) {
      const fullParams: CellRendererParams = {
        value,
        data: params.data || {},
        node: params.node || {},
        colDef,
        column: params.column || {},
        rowIndex: params.rowIndex || 0,
        api: params.api,
        columnApi: params.columnApi,
        context: params.context || {},
        refreshCell: params.refreshCell || (() => {}),
        eGridCell: params.eGridCell || document.createElement('div'),
        eParentOfValue: params.eParentOfValue || document.createElement('div')
      };
      
      if (typeof colDef.cellRenderer === 'string') {
        return this.createCellRenderer(colDef.cellRenderer, fullParams);
      } else if (typeof colDef.cellRenderer === 'function') {
        // Handle function-based renderers
        return colDef.cellRenderer(fullParams);
      }
    }
    
    // Default rendering based on type
    return this.formatValue(value, colDef);
  }
  
  /**
   * Format value based on column type
   */
  private formatValue(value: any, colDef: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    switch (colDef.type) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }
}