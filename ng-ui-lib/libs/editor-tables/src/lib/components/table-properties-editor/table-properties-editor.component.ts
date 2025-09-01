import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  inject,
  OnInit,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  TableConfig, 
  TableBorderStyle, 
  TableAlignment,
  TableCell,
  CellAlignment,
  BorderProperties
} from '../../interfaces/table-config.interface';
import { TableStateService } from '../../services/table-state.service';

interface ColorOption {
  value: string;
  label: string;
  color: string;
}

/**
 * Component for editing table and cell properties
 */
@Component({
  selector: 'ng-ui-table-properties-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-properties-editor" [class.open]="isOpen()">
      <div class="editor-header">
        <h3>Table Properties</h3>
        <button class="close-button" (click)="close()" aria-label="Close editor">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.147a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
          </svg>
        </button>
      </div>

      <div class="editor-content">
        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'table'"
            (click)="setActiveTab('table')">
            Table
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'cell'"
            (click)="setActiveTab('cell')"
            [disabled]="!hasSelectedCell()">
            Cell
          </button>
        </div>

        <!-- Table Properties Tab -->
        @if (activeTab() === 'table') {
          <div class="tab-content">
            <div class="property-section">
              <h4>General</h4>
              <div class="property-grid">
                <div class="property-group">
                  <label for="table-caption">Caption:</label>
                  <input 
                    id="table-caption"
                    type="text" 
                    [(ngModel)]="tableCaption"
                    (ngModelChange)="updateTableCaption()"
                    placeholder="Enter table caption"
                    class="property-input">
                </div>

                <div class="property-group">
                  <label for="table-width">Width:</label>
                  <div class="input-with-unit">
                    <input 
                      id="table-width"
                      type="text" 
                      [(ngModel)]="tableWidth"
                      (ngModelChange)="updateTableWidth()"
                      placeholder="auto"
                      class="property-input">
                    <select [(ngModel)]="widthUnit" (ngModelChange)="updateTableWidth()" class="unit-select">
                      <option value="px">px</option>
                      <option value="%">%</option>
                      <option value="auto">auto</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="property-section">
              <h4>Layout</h4>
              <div class="property-grid">
                <div class="property-group">
                  <label for="table-alignment">Alignment:</label>
                  <select 
                    id="table-alignment"
                    [(ngModel)]="alignment"
                    (ngModelChange)="updateTableAlignment()"
                    class="property-select">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div class="property-group checkbox-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="responsive"
                      (ngModelChange)="updateResponsive()">
                    Responsive table
                  </label>
                </div>

                <div class="property-group checkbox-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="hasHeader"
                      (ngModelChange)="updateHasHeader()">
                    Header row
                  </label>
                </div>
              </div>
            </div>

            <div class="property-section">
              <h4>Borders & Spacing</h4>
              <div class="property-grid">
                <div class="property-group">
                  <label for="border-style">Border Style:</label>
                  <select 
                    id="border-style"
                    [(ngModel)]="borderStyle"
                    (ngModelChange)="updateBorderStyle()"
                    class="property-select">
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div class="property-group">
                  <label for="border-width">Border Width:</label>
                  <input 
                    id="border-width"
                    type="number" 
                    min="0" 
                    max="10" 
                    [(ngModel)]="borderWidth"
                    (ngModelChange)="updateBorderWidth()"
                    class="property-input">
                </div>

                <div class="property-group">
                  <label for="cell-padding">Cell Padding:</label>
                  <input 
                    id="cell-padding"
                    type="number" 
                    min="0" 
                    max="50" 
                    [(ngModel)]="cellPadding"
                    (ngModelChange)="updateCellPadding()"
                    class="property-input">
                </div>

                <div class="property-group">
                  <label for="cell-spacing">Cell Spacing:</label>
                  <input 
                    id="cell-spacing"
                    type="number" 
                    min="0" 
                    max="20" 
                    [(ngModel)]="cellSpacing"
                    (ngModelChange)="updateCellSpacing()"
                    class="property-input">
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Cell Properties Tab -->
        @if (activeTab() === 'cell') {
          <div class="tab-content">
            <div class="selected-cell-info">
              @if (selectedCellPosition(); as position) {
                <p>Editing cell at Row {{ position.row + 1 }}, Column {{ position.column + 1 }}</p>
              }
            </div>

            <div class="property-section">
              <h4>Content & Alignment</h4>
              <div class="property-grid">
                <div class="property-group">
                  <label for="cell-alignment">Text Alignment:</label>
                  <select 
                    id="cell-alignment"
                    [(ngModel)]="cellAlignment"
                    (ngModelChange)="updateCellAlignment()"
                    class="property-select">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </select>
                </div>

                <div class="property-group checkbox-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="isHeaderCell"
                      (ngModelChange)="updateIsHeaderCell()">
                    Header cell
                  </label>
                </div>
              </div>
            </div>

            <div class="property-section">
              <h4>Colors</h4>
              <div class="property-grid">
                <div class="property-group">
                  <label for="background-color">Background:</label>
                  <div class="color-picker-container">
                    <input 
                      id="background-color"
                      type="color" 
                      [(ngModel)]="backgroundColor"
                      (ngModelChange)="updateBackgroundColor()"
                      class="color-picker">
                    <div class="color-presets">
                      @for (color of backgroundColors(); track color.value) {
                        <button 
                          class="color-preset"
                          [style.background-color]="color.color"
                          [title]="color.label"
                          (click)="setBackgroundColor(color.value)">
                        </button>
                      }
                    </div>
                  </div>
                </div>

                <div class="property-group">
                  <label for="text-color">Text Color:</label>
                  <div class="color-picker-container">
                    <input 
                      id="text-color"
                      type="color" 
                      [(ngModel)]="textColor"
                      (ngModelChange)="updateTextColor()"
                      class="color-picker">
                    <div class="color-presets">
                      @for (color of textColors(); track color.value) {
                        <button 
                          class="color-preset"
                          [style.background-color]="color.color"
                          [title]="color.label"
                          (click)="setTextColor(color.value)">
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="property-section">
              <h4>Size & Spacing</h4>
              <div class="property-grid">
                <div class="property-group">
                  <label for="cell-width">Width:</label>
                  <input 
                    id="cell-width"
                    type="text" 
                    [(ngModel)]="cellWidth"
                    (ngModelChange)="updateCellWidth()"
                    placeholder="auto"
                    class="property-input">
                </div>

                <div class="property-group">
                  <label for="cell-height">Height:</label>
                  <input 
                    id="cell-height"
                    type="text" 
                    [(ngModel)]="cellHeight"
                    (ngModelChange)="updateCellHeight()"
                    placeholder="auto"
                    class="property-input">
                </div>

                <div class="property-group">
                  <label for="cell-padding-custom">Padding:</label>
                  <input 
                    id="cell-padding-custom"
                    type="text" 
                    [(ngModel)]="cellPaddingCustom"
                    (ngModelChange)="updateCellPaddingCustom()"
                    placeholder="8px"
                    class="property-input">
                </div>
              </div>
            </div>

            <div class="property-section">
              <h4>Merge/Split</h4>
              <div class="merge-controls">
                <div class="span-controls">
                  <div class="span-group">
                    <label for="row-span">Row Span:</label>
                    <input 
                      id="row-span"
                      type="number" 
                      min="1" 
                      max="20" 
                      [(ngModel)]="rowSpan"
                      (ngModelChange)="updateRowSpan()"
                      class="span-input">
                  </div>
                  <div class="span-group">
                    <label for="col-span">Col Span:</label>
                    <input 
                      id="col-span"
                      type="number" 
                      min="1" 
                      max="20" 
                      [(ngModel)]="colSpan"
                      (ngModelChange)="updateColSpan()"
                      class="span-input">
                  </div>
                </div>
                <button 
                  class="split-button"
                  (click)="splitCell()"
                  [disabled]="!canSplitCell()">
                  Split Cell
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="editor-footer">
        <button class="reset-button" (click)="resetProperties()">
          Reset
        </button>
        <div class="footer-actions">
          <button class="cancel-button" (click)="close()">
            Cancel
          </button>
          <button class="apply-button" (click)="applyChanges()">
            Apply
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./table-properties-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablePropertiesEditorComponent implements OnInit {
  private readonly tableState = inject(TableStateService);

  // Inputs and Outputs
  readonly isOpen = input<boolean>(false);
  readonly propertiesChanged = output<void>();
  readonly editorClosed = output<void>();

  // Current tab
  readonly activeTab = signal<'table' | 'cell'>('table');

  // Table properties
  tableCaption = '';
  tableWidth = 'auto';
  widthUnit = 'auto';
  alignment: TableAlignment = TableAlignment.LEFT;
  responsive = true;
  hasHeader = false;
  borderStyle: TableBorderStyle = TableBorderStyle.SOLID;
  borderWidth = 1;
  cellPadding = 8;
  cellSpacing = 0;

  // Cell properties
  cellAlignment: CellAlignment = CellAlignment.LEFT;
  isHeaderCell = false;
  backgroundColor = '#ffffff';
  textColor = '#000000';
  cellWidth = 'auto';
  cellHeight = 'auto';
  cellPaddingCustom = '8px';
  rowSpan = 1;
  colSpan = 1;

  // Computed properties
  readonly hasSelectedCell = computed(() => {
    const selection = this.tableState.selectionState();
    return selection.activeCell !== null;
  });

  readonly selectedCellPosition = computed(() => {
    return this.tableState.selectionState().activeCell;
  });

  readonly canSplitCell = computed(() => {
    return this.rowSpan > 1 || this.colSpan > 1;
  });

  // Color options
  readonly backgroundColors = signal<ColorOption[]>([
    { value: '#ffffff', label: 'White', color: '#ffffff' },
    { value: '#f8f9fa', label: 'Light Gray', color: '#f8f9fa' },
    { value: '#e9ecef', label: 'Gray', color: '#e9ecef' },
    { value: '#dee2e6', label: 'Dark Gray', color: '#dee2e6' },
    { value: '#fff3cd', label: 'Light Yellow', color: '#fff3cd' },
    { value: '#d1ecf1', label: 'Light Blue', color: '#d1ecf1' },
    { value: '#d4edda', label: 'Light Green', color: '#d4edda' },
    { value: '#f8d7da', label: 'Light Red', color: '#f8d7da' }
  ]);

  readonly textColors = signal<ColorOption[]>([
    { value: '#000000', label: 'Black', color: '#000000' },
    { value: '#6c757d', label: 'Gray', color: '#6c757d' },
    { value: '#495057', label: 'Dark Gray', color: '#495057' },
    { value: '#212529', label: 'Almost Black', color: '#212529' },
    { value: '#0d6efd', label: 'Blue', color: '#0d6efd' },
    { value: '#198754', label: 'Green', color: '#198754' },
    { value: '#dc3545', label: 'Red', color: '#dc3545' },
    { value: '#fd7e14', label: 'Orange', color: '#fd7e14' }
  ]);

  constructor() {
    // Watch for table data changes to update properties
    effect(() => {
      const tableData = this.tableState.tableData();
      if (tableData) {
        this.loadTableProperties(tableData.config);
      }
    });

    // Watch for cell selection changes to update cell properties
    effect(() => {
      const selection = this.tableState.selectionState();
      if (selection.activeCell) {
        this.loadCellProperties(selection.activeCell.row, selection.activeCell.column);
      }
    });
  }

  ngOnInit(): void {
    // Initial load
    const tableData = this.tableState.tableData();
    if (tableData) {
      this.loadTableProperties(tableData.config);
    }
  }

  setActiveTab(tab: 'table' | 'cell'): void {
    this.activeTab.set(tab);
  }

  private loadTableProperties(config: TableConfig): void {
    this.tableCaption = '';
    this.alignment = config.alignment || TableAlignment.LEFT;
    this.responsive = config.responsive ?? true;
    this.hasHeader = config.hasHeader ?? false;
    this.borderStyle = config.borderStyle || TableBorderStyle.SOLID;
  }

  private loadCellProperties(row: number, column: number): void {
    const cell = this.tableState.getCellAt(row, column);
    if (!cell) return;

    this.cellAlignment = cell.alignment || CellAlignment.LEFT;
    this.isHeaderCell = cell.isHeader ?? false;
    this.backgroundColor = cell.backgroundColor || '#ffffff';
    this.textColor = cell.textColor || '#000000';
    this.cellWidth = (cell.width as string) || 'auto';
    this.cellHeight = (cell.height as string) || 'auto';
    this.cellPaddingCustom = (cell.padding as string) || '8px';
    this.rowSpan = cell.rowSpan || 1;
    this.colSpan = cell.colSpan || 1;
  }

  // Table property update methods
  updateTableCaption(): void {
    // Implement table caption update
  }

  updateTableWidth(): void {
    // Implement table width update
  }

  updateTableAlignment(): void {
    this.tableState.updateTableConfig({ alignment: this.alignment });
  }

  updateResponsive(): void {
    this.tableState.updateTableConfig({ responsive: this.responsive });
  }

  updateHasHeader(): void {
    this.tableState.updateTableConfig({ hasHeader: this.hasHeader });
  }

  updateBorderStyle(): void {
    this.tableState.updateTableConfig({ borderStyle: this.borderStyle });
  }

  updateBorderWidth(): void {
    // Implement border width update
  }

  updateCellPadding(): void {
    // Implement cell padding update
  }

  updateCellSpacing(): void {
    // Implement cell spacing update
  }

  // Cell property update methods
  updateCellAlignment(): void {
    const position = this.selectedCellPosition();
    if (position) {
      this.tableState.updateCell(position.row, position.column, {
        alignment: this.cellAlignment
      });
    }
  }

  updateIsHeaderCell(): void {
    const position = this.selectedCellPosition();
    if (position) {
      this.tableState.updateCell(position.row, position.column, {
        isHeader: this.isHeaderCell
      });
    }
  }

  updateBackgroundColor(): void {
    const position = this.selectedCellPosition();
    if (position) {
      this.tableState.updateCell(position.row, position.column, {
        backgroundColor: this.backgroundColor
      });
    }
  }

  updateTextColor(): void {
    const position = this.selectedCellPosition();
    if (position) {
      this.tableState.updateCell(position.row, position.column, {
        textColor: this.textColor
      });
    }
  }

  updateCellWidth(): void {
    const position = this.selectedCellPosition();
    if (position) {
      this.tableState.updateCell(position.row, position.column, {
        width: this.cellWidth
      });
    }
  }

  updateCellHeight(): void {
    const position = this.selectedCellPosition();
    if (position) {
      this.tableState.updateCell(position.row, position.column, {
        height: this.cellHeight
      });
    }
  }

  updateCellPaddingCustom(): void {
    const position = this.selectedCellPosition();
    if (position) {
      this.tableState.updateCell(position.row, position.column, {
        padding: this.cellPaddingCustom
      });
    }
  }

  updateRowSpan(): void {
    const position = this.selectedCellPosition();
    if (position) {
      this.tableState.updateCell(position.row, position.column, {
        rowSpan: this.rowSpan
      });
    }
  }

  updateColSpan(): void {
    const position = this.selectedCellPosition();
    if (position) {
      this.tableState.updateCell(position.row, position.column, {
        colSpan: this.colSpan
      });
    }
  }

  setBackgroundColor(color: string): void {
    this.backgroundColor = color;
    this.updateBackgroundColor();
  }

  setTextColor(color: string): void {
    this.textColor = color;
    this.updateTextColor();
  }

  splitCell(): void {
    const position = this.selectedCellPosition();
    if (position) {
      // Implement cell splitting logic via operations service
    }
  }

  resetProperties(): void {
    if (this.activeTab() === 'table') {
      // Reset table properties to defaults
      this.alignment = TableAlignment.LEFT;
      this.responsive = true;
      this.hasHeader = false;
      this.borderStyle = TableBorderStyle.SOLID;
      this.borderWidth = 1;
      this.cellPadding = 8;
      this.cellSpacing = 0;
    } else {
      // Reset cell properties to defaults
      this.cellAlignment = CellAlignment.LEFT;
      this.isHeaderCell = false;
      this.backgroundColor = '#ffffff';
      this.textColor = '#000000';
      this.cellWidth = 'auto';
      this.cellHeight = 'auto';
      this.cellPaddingCustom = '8px';
      this.rowSpan = 1;
      this.colSpan = 1;
    }
  }

  applyChanges(): void {
    this.propertiesChanged.emit();
  }

  close(): void {
    this.editorClosed.emit();
  }
}